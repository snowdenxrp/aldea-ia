# NEXO — AB104.578 — Concurrent invalidation races

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
etcd transactions atomically evaluate comparisons and apply their success branch, providing compare-and-swap protection against concurrent updates. citeturn0search1turn0search2
etcd's STM implementation guards its read set using ModRevision comparisons, retrying when a concurrent write invalidates the observed state. citeturn0search0
Fencing research shows that lease expiry alone does not stop a stale client; the protected resource must reject stale fencing generations. citeturn0search3turn0search8

## Finding
The dangerous race is:
1. D reads dependency U as admissible.
2. U becomes UNKNOWN/revoked.
3. D submits using the old admission.
4. The old submission arrives after invalidation.

A local re-check before submission is insufficient if invalidation can occur between check and commit.

## Required boundary
Admission and the authority/fence transition must share an atomic serialization point where possible.
For a fenced resource, the resource itself must reject an obsolete generation. For an unfenced external API, Nexo cannot claim equivalent atomic safety merely by checking locally.

## Candidate rule
Downstream commit succeeds only if the authoritative dependency/fence snapshot is still valid at the commit point.
Equivalent conceptual predicate:
IF dependency_digest == expected AND authority_epoch == expected AND fence >= expected
THEN commit downstream effect
ELSE reject.

This is stronger than a preflight check because the predicate and state change must be committed atomically by the authority that enforces the mutation.

## External-provider limitation
If the provider cannot atomically compare Nexo's fence/dependency state with the external mutation, a cross-system TOCTOU gap remains.
Therefore an internal transaction can prove only internal atomicity; it cannot automatically prove atomicity across Nexo and an independent provider.

## Adversarial cases
A. Dependency revokes between read and send → external provider must reject stale fence, or outcome becomes UNKNOWN.
B. Dependency revokes after provider accepts but before physical execution → requires provider execution semantics/evidence.
C. Two downstream effects race against one invalidation → each must independently satisfy the current fence.
D. Old worker resumes after a new authority epoch → stale generation must be rejected at the protected boundary.
E. Fence check exists only in Nexo process → stale process can bypass it; enforcement is not real.

## New invariants
1. Preflight validation alone does not close invalidation TOCTOU.
2. A fence is effective only where the mutation is enforced.
3. Every dependent mutation must carry the dependency/fence generation that authorized it.
4. Obsolete generations must be rejected, not merely logged.
5. If atomic cross-domain enforcement is unavailable, the protocol must represent the residual race explicitly rather than claim closure.

## Closure
AB104.578 closes the narrow question: concurrent invalidation requires commit-time authoritative fencing/CAS where possible; local revalidation alone is insufficient.
Still OPEN:
- cross-domain provider fencing;
- multi-resource atomicity;
- causal graph cycles;
- recovery ordering;
- partial external commits;
- formal verification;
- implementation/fault injection.

## Next exact step
AB104.579 — research the hardest residual: external providers that cannot consume Nexo fencing tokens or conditional predicates, and what safety guarantees remain possible without pretending to have atomic commit.