# NEXO AB104.286 — Cross-domain binding and atomic snapshot limits

Date: 2026-09-26
Status: RESEARCH ONLY — no architecture implementation or semantic freeze.

## Question
What can authenticated checkpoint binding, transparency-log consistency, vector-style commitments, and transactional/consensus snapshots prove about one coherent recovery frontier?

## Evidence
RFC 9162 shows that signed tree heads plus Merkle consistency proofs can authenticate append-only continuity of a specific log. It also notes that inconsistent views by a log remain a trust concern and require additional auditing/gossip mechanisms. Thus a valid proof is scoped to the committed log and its trust assumptions, not a generic cross-domain atomic snapshot.

## Findings
1. A cross-domain checkpoint can bind multiple domain roots into one signed statement. This can establish that the signer intentionally committed to that tuple at a particular checkpoint.
2. Binding roots does not retroactively make their underlying states atomic. If domains were captured at different instants, the checkpoint proves the tuple was observed/committed, not that all mutations linearized simultaneously.
3. Append-only consistency proofs can establish lineage within each log, but cross-log coherence requires an explicit common checkpoint, shared transaction/epoch, or equivalent authenticated protocol.
4. A consensus snapshot can establish a coherent snapshot only for the state covered by that consensus protocol. It does not automatically include an external target/resource unless that target participates in the same protected boundary or supplies an equivalent authenticated commit proof.
5. Vector commitments/accumulators can compactly bind sets/relations, but commitment validity alone does not establish freshness, incarnation continuity, dependency closure, or current authority.
6. Therefore a candidate Nexo recovery frontier needs both (a) authenticated commitments to each evidence domain and (b) an authenticated coherence relation between them: checkpoint identity/epoch, domain identities, target incarnations, dependency commitments, lineage, coverage/retention, and authority generation/fence.
7. If the coherence relation is absent or contradictory, the proofs remain individually valid evidence but cannot be joined into executable permission.

## Carry-forward rule
VALID(PROOF_A) AND VALID(PROOF_B) != VALID(JOINT_FRONTIER) unless authenticated cross-domain coherence is demonstrated.

CHECKPOINT_BINDING != ATOMIC_EXTERNAL_EFFECT unless the external effect participates in the same protected linearization boundary or has equivalent authoritative evidence.

## Explicit non-claims
- No architecture selected.
- No formal verification performed.
- No implementation performed.
- No semantic freeze declared.
- No claim that a multi-root checkpoint proves simultaneous cross-domain state.

## Next exact research step
AB104.287 — study transactional/consensus snapshot semantics and external-resource fencing in concrete systems (e.g. Raft/etcd-style linearization plus target-side CAS/fence) to determine the minimum evidence needed to call a recovery frontier coherent.