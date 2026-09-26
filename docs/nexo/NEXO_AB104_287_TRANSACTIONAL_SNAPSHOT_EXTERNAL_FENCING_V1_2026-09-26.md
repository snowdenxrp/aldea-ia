# NEXO AB104.287 — Transactional snapshot semantics and external fencing

Date: 2026-09-26
Status: RESEARCH ONLY — no architecture implementation or semantic freeze.

## Evidence studied
Raft provides a replicated-log consensus model with coherent ordering and joint-consensus membership changes; its safety is about the replicated state/log, not arbitrary external resources. citeturn0search14turn0search0
etcd provides linearizable KV operations by default, atomic conditional transactions, a cluster-wide revision, and historical MVCC revisions. Its documentation also distinguishes linearizable reads from serializable local reads and notes that a timed-out client operation may have uncertain status. citeturn0search1turn0search3

## Findings
1. A consensus revision/term can establish order and linearization inside the consensus-controlled state machine. It does not by itself linearize an external API/device/database mutation.
2. etcd transactions demonstrate a useful target-side pattern: evaluate all guards atomically against current state, then apply the mutation in the same transaction. This is stronger than a client pre-read followed by a later write. citeturn0search1turn0search7
3. A recovery frontier can therefore be coherent for a domain when its snapshot is tied to the domain's own linearization/revision and history. But importing that frontier into another domain requires an authenticated cross-domain relation.
4. External fencing must be enforced at the mutation boundary. A coordinator remembering an old authority generation is insufficient if the target accepts the old request after a newer generation becomes current.
5. If target-side mutation and its operation receipt are inside one atomic boundary, the receipt can be strong evidence of the mutation. If mutation and receipt are separate domains, a crash between them can leave UNKNOWN unless authoritative reconciliation exists.
6. A single scalar revision is insufficient for Nexo's multi-domain recovery model: authority generation, target incarnation, resource version/CAS, operation registry, effect evidence, archive coverage, and semantic version can advance independently.
7. Thus the minimum candidate coherent frontier is not a number but an authenticated tuple/partial-order frontier whose cross-domain relation proves the required ordering and coverage. This is a research candidate, not an architecture decision.

## Carry-forward invariants
`CONSENSUS_COMMITTED != EXTERNAL_EFFECT_COMMITTED` unless both share the same protected linearization boundary or an equivalent authoritative protocol.

`PRE_READ_AUTHORIZATION != TARGET_ACCEPTANCE`.

`VALID_DOMAIN_SNAPSHOT != VALID_JOINT_RECOVERY_FRONTIER` without authenticated cross-domain coherence.

## Explicit non-claims
- No architecture selected.
- No formal verification performed.
- No implementation performed.
- No semantic freeze declared.
- No claim that Raft/etcd alone solves Nexo's external-effect problem.

## Next exact research step
AB104.288 — investigate target-side fencing/token mechanisms and lease/sequencer patterns (including Chubby-style sequencers and modern resource-version fencing) to determine how stale authority can be rejected at the actual effect boundary.