# NEXO — CONTINUITY CHECKPOINT AB104.204
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Persisted research
File: docs/nexo/NEXO_AB104_204_QUORUM_RECONFIGURATION_RECOVERY_ATTACK_V1_2026-09-25.md
Commit: b9ef09f411bed82793424af8b98126ac2a1fff69

## Core findings
Membership changes are authority changes, not inventory operations. Direct old->new switching can create two independently believing majorities during a partition. Raft's joint-consensus reference preserves safety by requiring agreement from both old and new configurations during transition; Nexo does not thereby select Raft, but the quorum-intersection invariant is relevant. cite-source:turn0search2turn0search0

A newly added device should pass enrollment/synchronization/eligibility before gaining authority. A lost/removed/compromised device requires explicit revocation/replacement semantics.

Quorum loss must block new canonical decisions rather than invent authority for availability. Recovery authority, if needed, is a separate authority transition.

Quorum safety and quorum liveness are distinct. During a partition, Nexo may need to sacrifice liveness to preserve safety.

Threshold cryptography shows that distributed authority can be constructed so an operation requires a threshold of independently held components; however, multiple signatures are not automatically independent authority if keys/state are cloned or controlled by one compromised root. cite-source:turn0search1turn0search15

TUF reinforces that root threshold and root compromise are special authority-management cases; compromise of the root threshold requires out-of-band recovery rather than ordinary self-repair. cite-source:turn0search12turn0search7

## Candidate states
STABLE -> TRANSITION -> COMMITTED -> STABLE
Failure states: PENDING_TRANSITION, QUORUM_LOST, CONFLICT, QUARANTINE, RECOVERY_AUTH_REQUIRED.

## Recovery invariants
- No direct old->new promotion without safe transition evidence.
- No new device becomes voting authority before required eligibility evidence.
- No quorum-loss recovery by local self-declaration.
- No conflict resolution by timestamp or arrival order.
- Divergent valid branches remain evidence until authority resolves them.
- Replacement must be distinguishable from compromise.

## Code study
No verified Nexo quorum/reconfiguration implementation was established. No implementation/security guarantee is claimed. Future audit must trace membership persistence, authorization, epoch transitions, recovery and external-effect gates.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

## DO-NOT-REPEAT
No device-count-as-independence; no direct membership switching; no premature enfranchisement; no safety/liveness conflation; no authority invention after quorum loss; no timestamp winner; no silent merge; no premature Raft selection; no V21; no unsupported verification claims.

## EXACT NEXT ACTION — AB104.205
Attack Byzantine/equivocation behavior inside quorum:
1 conflicting roots signed to different peers;
2 equivocation detection/evidence propagation;
3 threshold signatures vs individually signed quorum certificates;
4 compromised minority vs compromised threshold;
5 conflicting recovery authorities;
6 stale offline device return;
7 minimum evidence proving a quorum certificate represents one coherent decision.

## CONTINUITY RULE
Next CONTINUITY resumes directly at AB104.205. Preserve all UNKNOWN/PENDING and AB50→AB58 residuals; do not restart AB104.204.
