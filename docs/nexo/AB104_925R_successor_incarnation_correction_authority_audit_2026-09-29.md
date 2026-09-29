# AB104.925R — Successor incarnation does not imply correction authority
Date: 2026-09-29

## Question
Provider explicitly declares R2 SUCCESSOR_OF R1, but does not declare whether corrections of R1 are automatically applicable to R2. Does successor lineage transfer correction scope?

## Fresh evidence
W3C PROV models provenance through entities, activities, derivations and time, and its constraints require derivation/order relationships to be represented consistently; a derived entity is not thereby identical to its source entity. Microsoft Event Sourcing treats the event store as the historical record and compensations as new events, while current state is a projection of the event history. citeturn0search4turn0search11turn0search0

## Attack
R1/gen41/X
→ EFFECT-1
R1 ends
R2/gen42/X
with explicit SUCCESSOR_OF(R2,R1)
O2 is a proposed correction of EFFECT-1
Provider confirms successor relation but does not define whether correction authority/target scope transfers.

## Findings
1. SUCCESSOR_OF establishes a lineage relationship only to the extent the provider contract defines it; it does not universally transfer historical correction authority.
2. R2 can be the legitimate successor while EFFECT-1 remains a historical effect originating in R1/gen41.
3. A correction targeting EFFECT-1 requires two separate questions: who may execute the correction now, and what historical effect is being targeted.
4. If policy explicitly says successor authority inherits correction rights for predecessor effects, R2 may authorize O2, provided target binding to EFFECT-1 is independently established.
5. If no inheritance rule exists, R2 successor status alone cannot manufacture correction authority over EFFECT-1; the correction decision remains UNKNOWN/UNRESOLVED.
6. Even when authority transfers, target identity does not automatically transfer from X to X without an explicit historical/successor binding.
7. Current state of R2 does not prove whether EFFECT-1 was corrected, preserved, or never occurred.
8. A successful O2 is a new historical effect/event; it does not erase EFFECT-1.
9. A correction effect can be CONFIRMED while its historical target binding remains UNKNOWN.
10. If the provider later defines a bounded inheritance rule retroactively, that is a new policy interpretation and must preserve the original evidence and version/time scope.
11. No new top-level interaction class. Primarily I9/I18/I19/I21 + class11/class12.

## Core distinctions
SUCCESSOR_RELATION != AUTHORITY_TRANSFER
SUCCESSOR_RELATION != SAME_INCARNATION
SUCCESSOR_AUTHORITY != HISTORICAL_TARGET_PROOF
CURRENT_AUTHORITY != HISTORICAL_EFFECT_ORIGIN
CORRECTION_AUTHORITY != CORRECTION_TARGET_IDENTITY
TARGET_BINDING != AUTHORIZATION
CORRECTION_EFFECT_CONFIRMED != VALID_CORRECTION_CONFIRMED
CURRENT_STATE != HISTORICAL_EFFECT_STATUS
SUCCESSOR_LINEAGE != CORRECTION_SCOPE
POLICY_INHERITANCE_MUST_BE_EXPLICIT
NEW_CORRECTION_EVENT != HISTORICAL_ERASURE
RETROACTIVE_POLICY != RETROACTIVE_FACT_REWRITE

## Required evidence
- explicit successor semantics;
- explicit authority-inheritance rule;
- historical effect ID and origin incarnation;
- target binding from correction to historical effect;
- current executor authority;
- policy version/effective time;
- immutable historical record;
- reconciliation state preserving unresolved authority/target edges.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
