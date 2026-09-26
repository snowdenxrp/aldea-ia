# NEXO AB104.292 — Commit barriers and 2PC/3PC limits

Date: 2026-09-26
Status: RESEARCH ONLY.

## Sources
Gray/Lamport show that classic 2PC can block when the coordinator fails; Paxos Commit replaces the single decision authority with replicated consensus and can make commit progress with a majority. citeturn0academia21turn0search0
Their treatment also makes clear that stable-storage state is essential for recovery: participants persist protocol state before sending messages while entering that state. citeturn0search22
Three-phase and related non-blocking protocols add coordination structure, but non-blocking commit is still a protocol among participating resource managers; it does not magically include an arbitrary external resource. citeturn0search6turn0search11

## Findings
1. A commit barrier is meaningful only for the state domains that participate in the protocol.
2. 2PC can establish a common commit/abort decision among participants, but coordinator failure can leave participants blocked while the outcome is unresolved. This is a liveness limitation, not evidence that the transaction did or did not commit. citeturn0academia21
3. Consensus-backed commit can remove the single-coordinator blocking point, but consensus only linearizes the state included in that consensus protocol.
4. 3PC reduces certain blocking scenarios by adding a phase, but its guarantees depend on its system model and failure assumptions; it should not be treated as generic atomicity for arbitrary external effects. citeturn0search6turn0search11
5. For Nexo, a barrier can safely bind authority + operation registry + effect decision only if those are participants in the same authoritative protocol/domain.
6. An external API/device/resource outside that domain remains a separate effect boundary. An internal COMMIT record before sending externally is not proof of external mutation; sending before the internal commit creates the reverse uncertainty.
7. Therefore a two-stage pattern should explicitly represent DECISION_COMMITTED versus EFFECT_COMMITTED, with reconciliation for the interval between them.
8. A consensus/commit barrier can reduce uncertainty only by expanding the authoritative commit domain; it cannot eliminate uncertainty by naming a local checkpoint a barrier.
9. Nexo should preserve UNKNOWN whenever failure ordering leaves the external commit boundary indistinguishable from non-commit.

## Candidate invariant
COMMIT_BARRIER(scope=S) => ATOMICITY_ONLY_WITHIN(S)
and EXTERNAL_EFFECT not in S => INTERNAL_COMMIT != EXTERNAL_COMMIT.

## Explicit non-claims
No protocol selected for Nexo. No architecture implementation, formal verification, semantic freeze, or claim of cross-domain atomicity.

## Next exact step
AB104.293 — investigate transactional outbox/inbox, durable intent logs, and idempotent target protocols as practical alternatives when the external target cannot join the authoritative commit domain.