# NEXO AB104.290 — Joint restore of fencing, operation registry, and receipts

Date: 2026-09-26
Status: RESEARCH ONLY.

## Evidence
Chubby's failover protocol chooses a new client epoch, reconstructs persistent session/lock state, invalidates caches, and prevents old-epoch requests from being accepted. It also records enough handle sequence state to prevent delayed/duplicate packets from recreating a closed handle within the same master epoch. citeturn0search24
etcd restore creates a new logical cluster identity by replacing member/cluster metadata; snapshot integrity can be checked, but restore is not treated as continuation of the former cluster identity. citeturn0search13
etcd's restore tooling also has a revision-bump facility intended to keep clients from observing a revision decrease, illustrating that monotonic presentation and historical continuity are separate concerns. citeturn0search6

## Findings
1. Safe restore requires a joint recovery boundary, not independent restoration of fencing, operation registry, and receipts.
2. A restored fencing state can be internally valid while being stale relative to an authority transition that occurred after the snapshot.
3. A restored operation registry can prove historical state only to the snapshot's coverage frontier; absence beyond that frontier is not evidence of NOT_COMMITTED.
4. A restored receipt can prove a historical commit only within its bound target incarnation and authority context. It must not become permission to execute again.
5. A new target incarnation should invalidate pre-restore executable authority while preserving old records as historical evidence.
6. If registry and receipts disagree, or their frontiers do not cover the same incarnation/authority interval, recovery must not synthesize a positive or negative outcome from the mismatch.
7. Therefore a candidate joint recovery certificate needs, at minimum: source snapshot/lineage, target incarnation, authority generation/fence frontier, operation-registry coverage, receipt/effect-evidence coverage, retention/anti-rollback metadata, semantic version, and dependency bindings.
8. RESTORED_REGISTRY_ABSENCE != TARGET_NOT_COMMITTED unless authoritative coverage proves every relevant commit point is covered.
9. RESTORED_RECEIPT != CURRENT_EXECUTION_AUTHORIZATION; it is historical evidence unless a separate current authorization check succeeds.
10. If an operation was UNKNOWN at the restore boundary and the restored evidence cannot cover the full possible commit interval, it remains UNKNOWN/UNKNOWN_PERMANENT rather than being downgraded.
11. Joint validity is stricter than component validity: valid fence + valid registry + valid receipt does not automatically imply a valid recovery frontier.

## Candidate invariant
VALID(FENCE) ∧ VALID(REGISTRY) ∧ VALID(RECEIPT) != VALID(JOINT_RECOVERY) unless authenticated lineage, incarnation, authority, coverage, semantic compatibility, and dependency coherence are established.

## Explicit non-claims
No architecture selected; no implementation; no formal verification; no semantic freeze.

## Next exact step
AB104.291 — investigate crash-consistent snapshots/checkpoints spanning authority, fencing, operation registry, and effect evidence, including what atomicity guarantees are actually achievable across domains.