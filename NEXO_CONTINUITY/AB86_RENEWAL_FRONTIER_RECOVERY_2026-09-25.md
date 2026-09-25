# AB86 — RENEWAL FRONTIER RECOVERY AND LEASE-KERNEL CROSSCHECK — 2026-09-25

Status: RESEARCH ONLY. No implementation, TLC/TLAPS execution, formal proof, semantic freeze, or architecture promotion.

## Objective

Continue AB85 by searching adjacent canonical history and older lease-kernel audits for any rule that could legitimately close LEASE_RENEW + POLICY_CHANGE + ADMIT.

## Canonical history recovered

### AB36P — commit 95aeda5b52cda3c65d4466f6d5c943c0d1b0d88a

AB36P is highly relevant. It explicitly identifies:
- CM-AA424: a lease is renewed after authority revocation; if renewal semantics do not explicitly revalidate the authority context, a bridge can appear fresh while no longer carrying valid authorization.
- CM-AA429: lease renewal without authority revalidation.
- LEASE requires interval-based bridge validity bound to subject, operation, attempt, resource/incarnation, authority context, policy/delegation context, boundary, freshness/expiry, replay/consumption, and protocol rules.
- Protocol equivalence cannot be established merely from current authorized_at_admission=true; future expiry/renewal behavior can distinguish representations.
- ProtocolClass cannot be erased until reconstruction/future-equivalence is demonstrated.

This strengthens the missing-renewal diagnosis but does not specify a legal renewal transition.

### AB18 — commit 321fc62a8e648809702f2747a89755208f6d9227

AB18 defines a complete LeaseBridge candidate including:
SubjectBinding, OperationBinding, AttemptBinding, ResourceBinding, ResourceIncarnationBinding, AuthorityContextBinding, PolicyCompatibilityBinding, DelegationValidityBinding, CapabilityScopeBinding, BoundaryBinding, FreshnessValidity, ReplayBinding, TemporalValidity.

It records countermodels for authority substitution, epoch advance, policy incompatibility, delegation revocation, resource reincarnation, and boundary changes.

Again, no exact LEASE_RENEW precondition/postcondition is supplied.

### AB39 — commit 4715d0143b7ee2e9a094b4569912d2a4c411455b

AB39 explicitly includes J6 = LEASE_RENEW -> POLICY_CHANGE -> ADMIT.

It states that renewal may revalidate against policy and that renewal before policy change can differ from renewal after it. If Bridge stores only current validity, future renewal behavior can be reconstructed incorrectly.

It also identifies a 4-event extension where renewal, policy, and delegation dependencies can be hidden by a 3-event projection.

This is an attack specification, not a renewal law.

### AB45 — commit 2fce518559eaea932159da947ab66c6067d2206c

AB45's generic protocol bridge attack states:
- Lease mode must encode interval semantics.
- Order must capture issuance/admission/expiry/renewal order.
- Invalidation must capture relevant invalidation/expiry.
- Revalidation may describe renewal/revalidation when present.
- The generic action contract remains Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink.

It explicitly warns that a protocol label is insufficient and that continuation behavior must derive from semantic primitives rather than an oracle.

Still no exact renewal action.

## Older lease-kernel crosscheck

### V13/V14/V15 audit family

Recovered commits show a separate coordination-lease kernel with explicit expiry boundaries and owner/generation fencing.

V14 defines:
- Expired when expiresAt <= now.
- Valid when expiresAt > now.
- Generation advances on successful acquire/takeover.
- Expiry preserves generation.
- Lease expiry changes coordination state only and does not infer external-world truth.

V15 chooses validity-based mutual exclusion: an expired lease stops blocking acquisition at the time boundary even before explicit expiry bookkeeping. V15 also identifies explicit reauthorization/reset semantics for REVOKED state.

These are useful lease/expiry design precedents, but they are NOT evidence that the P_AA LEASE_RENEW action has those semantics. They concern coordination mutual exclusion and explicitly leave other authorization/evidence semantics outside the kernel.

## Recovery conclusion

No recovered artifact supplies a complete P_AA LEASE_RENEW transition law.

The strongest canonical evidence now establishes the questions that renewal must answer:
1. What authority context authorizes renewal?
2. Must renewal revalidate current policy/delegation/incarnation?
3. Is renewal extension or replacement?
4. Does the old LeaseBridge survive?
5. What exact bridge/context is bound to the renewed lease?
6. What happens to replay/consumption state?
7. What ordering exists between renewal and policy/delegation/revocation?
8. What are all legal successors?

But the corpus does not supply authoritative answers to those questions.

## Gate result

C1 Source context: PARTIAL/KNOWN
C2 Renewal legality: UNKNOWN
C3 Renewal post-state: UNKNOWN
C4 Frame/invalidation: UNKNOWN
C5 Admission-context mapping: PARTIAL/UNKNOWN
C6 Exhaustive successor domain: UNKNOWN

SUCCESSOR_STATUS = UNKNOWN

No concrete ternary P_AA collision is established.
No proof of absence of a collision is established.
No quotient congruence is established.

## Decision

The renewal branch has reached a documented semantic boundary.

Do NOT synthesize a renewal rule from V13/V14/V15, because those artifacts describe a different coordination-lease kernel. Doing so would contaminate the P_AA protocol semantics.

## Exact next action

Move to the next unresolved transition law only after preserving this boundary. The highest-value candidates remain:
- RECHECK + MUTATION + ADMIT, already audited in AB83; or
- another transition for which a complete canonical law can be recovered.

Do not expand to the 286 triples, declare semantic freeze, modify AB61/AB65, or assemble integrated Nexo until a protocol action passes C2/C3/C6 and the future-behavioral quotient obligations remain satisfied.
