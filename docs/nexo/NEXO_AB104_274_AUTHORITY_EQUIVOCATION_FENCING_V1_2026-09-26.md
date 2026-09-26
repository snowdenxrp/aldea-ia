# NEXO AB104.274 — Authority equivocation and conflict fencing — 2026-09-26

Research-only.

Evidence:
- Raft's safety model requires at most one leader per term and log matching; conflicting entries are reconciled through the leader/term mechanism rather than accepted as co-equal histories. citeturn0search14turn0search15
- etcd operations are ordered through consensus/revisions; linearizable KV operations reflect the cluster's current consensus, while watch observations are not themselves a linearizable authority source. citeturn0search2turn0search1
- Direct Nexo code inspection: effect-adapter keys execution by idempotencyKey and requires reconciliation for an existing prepared entry, but the key does not itself bind authority generation, target incarnation, or payload fingerprint.

Findings:
1. If one authority/root signs two incompatible statements for the same scope/epoch/operation, this is EQUIVOCATION/CONFLICT, not a reason to select the newest or first statement.
2. A valid signature authenticates the signer statement; it does not prove that conflicting statements are mutually compatible.
3. Conflict evidence must preserve both statements, signer identity, authority epoch/config, exact statement digests, timestamps/sequence metadata as evidence only, and dependency lineage.
4. Once equivocation is detected, the affected authority should be fenced from producing current executable permission until an authenticated authority transition resolves the conflict. Historical statements remain preserved.
5. A quorum containing an equivocating signer must apply the protocol's eligibility/fault rules; raw signature counting must not silently turn conflicting signatures into one canonical decision.
6. Replay of either conflicting statement after a later authority transition must fail current-authority validation even if its cryptographic signature remains valid.
7. The conflict detector itself needs anti-rollback continuity; restoring a pre-detection state must not resurrect the authority's ability to act.

Candidate state:
VALID_HISTORICAL + CURRENTLY_ADMISSIBLE
VALID_HISTORICAL + REVOKED/FENCED
EQUIVOCATION + QUARANTINED
CONFLICT + UNRESOLVED

No architecture selected or implemented. Prototype does not demonstrate authority-equivocation detection/fencing.

AB50–AB58 residuals unchanged. Next: AB104.275 — equivocation evidence recovery after crash/restore and anti-resurrection.