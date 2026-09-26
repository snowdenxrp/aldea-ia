# NEXO AB104.233 — AUTHORITY ARBITRATION, QUORUM INDEPENDENCE, CLONES AND PARTITIONS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
Canonical-history arbitration is itself a security boundary. A quorum is meaningful only if authority membership, independence, configuration epoch and trust root are protected.

## Findings
- N signatures/copies do not imply N independent authorities.
- Common-mode dependencies include shared root keys, cloned device images, shared snapshots, recovery secrets, compromised issuers, shared configuration and shared freshness sources.
- A clone can present valid signatures from the same logical authority and appear as multiple voters. Distinct keys are not sufficient if they originate from one compromised state.
- An offline device can produce valid historical work under E7 and return after canonical state reaches E9. Its branch may remain HISTORICAL_ONLY without becoming current.
- Root rotation during partition requires authenticated predecessor/root/configuration/epoch/freshness binding.
- Recovery authority cannot bootstrap its own legitimacy solely from statements produced while compromised.

Raft joint consensus is a useful reference: membership changes overlap old and new configurations so two disjoint configurations cannot independently commit decisions during transition. This is not a Nexo design choice. citeturn0search26turn0search0

SCITT requires append-only and non-equivocation properties for its transparency log. Current continuity work explicitly notes that a producer can maintain internally consistent checkpoints on separate forks; internal consistency alone does not prove no divergent history exists. citeturn0search7turn0search8

TUF separates root authority, metadata roles, snapshot coherence and freshness/expiration; Snapshot prevents mixing metadata from different times into one apparently coherent view. citeturn0search3

## Candidate authority evidence
1. trusted current root;
2. authenticated transition/configuration;
3. signer eligibility;
4. threshold/quorum proof;
5. common statement digest;
6. predecessor/root binding;
7. epoch/freshness;
8. device/resource incarnation where applicable;
9. no revocation/conflict;
10. protected anti-rollback continuity.

Failure of required conditions prevents promotion and preserves the branch as historical, unverified or conflicting evidence.

## Arbitration failures
- two valid quorums for different roots in one epoch -> CONFLICT;
- cloned members -> quorum independence failure;
- ineligible signer -> UNVERIFIED;
- stale offline branch -> HISTORICAL_ONLY;
- rollbackable quorum configuration -> authority rollback risk;
- compromised recovery authority -> cannot establish itself as trust root;
- majority of local cached copies from one backup -> not independent quorum;
- incompatible roots after partition -> explicit reconciliation required.

## Determinism
Deterministic tie-breaking can make an arbitrary choice reproducible, but cannot make that choice authoritative. Therefore authority must be established before deterministic selection.

## Important negative result
No safe generic rule exists that selects the winner by signature count, epoch, or history length alone. Those values are meaningful only under an authenticated authority model.

## Current prototype
No canonical authority/quorum/fork-arbitration mechanism was demonstrated in the inspected Nexo effect/recovery path. No implementation added.

## AB50→AB58 residuals
UNCHANGED:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- distinct signatures != independent authorities
- quorum of copies != quorum of authority
- deterministic tie-break != authoritative resolution
- higher epoch != authority without authenticated transition
- offline-valid branch != current permission
- cloned voters != independent quorum
- compromised recovery authority != trust root
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.234: attack quorum evidence itself — threshold counting, signer-set eligibility, duplicate/clone identities, configuration rollback, split-brain quorums, root/key rotation and evidence dependency graphs; determine what a quorum proof can and cannot establish without assuming independence it has not demonstrated.