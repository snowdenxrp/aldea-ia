# AB104.926R — Successor correction authority with a bounded temporal window
Date: 2026-09-29

## Question
R2 is explicitly declared successor of R1 and inherits correction authority, but that authority is valid only during a bounded window. EFFECT-1 occurred before the inheritance window. Does R2 have correction authority over EFFECT-1?

## Fresh evidence
W3C PROV treats entities as having lifetimes bounded by generation/invalidation and allows multiple identified entities for changing versions, with relationships connecting them. This supports time-scoped identity rather than assuming one identifier has timeless meaning. Microsoft Event Sourcing preserves historical events and records compensations as new events; compensating work does not rewrite the original historical event. citeturn0search3turn0search0

## Attack
R1/gen41/X → EFFECT-1 at T1
R1 ends
R2/gen42/X becomes successor
Policy P2 grants R2 authority to correct predecessor effects, but only during [T3,T4]
O2 correction occurs at T5
or alternatively O2 occurs at T3 but targets EFFECT-1 from T1.

## Findings
1. Successor status and correction-authority validity are separate temporal claims.
2. If the authority window applies to execution time, O2 at T5 is unauthorized under P2 even though R2 is still the successor, unless another authority rule applies.
3. If the policy defines eligibility by effect time, EFFECT-1 from T1 may be outside the inherited correction scope even when O2 executes during [T3,T4].
4. Therefore both the authority's temporal semantics and the target-effect's historical time must be evaluated; there is no universal rule that current authority can correct every predecessor effect.
5. A correction policy may explicitly cover a historical interval or predecessor set. If it does, EFFECT-1 can be in scope despite predating the authority window, but only because the contract says so.
6. Authority validity at correction time does not retroactively alter the historical validity of EFFECT-1.
7. If O2 is rejected because the authority window does not cover it, that rejection does not prove EFFECT-1 was absent or already corrected.
8. If O2 was accepted and committed before the window expired, a later expiry does not erase O2 or EFFECT-1.
9. If policy semantics are ambiguous about whether the window scopes executor time, target effect time, or both, the authorization assessment must remain UNKNOWN rather than choosing one interpretation by convenience.
10. A later policy extension of the window is a new policy event; it may authorize a new correction but does not rewrite the original EFFECT-1.
11. If the provider explicitly records policy version/effective interval with O2, that evidence can resolve whether O2 was authorized under the relevant rule.
12. No new top-level interaction class. Primarily I9/I18/I19/I21 + class11/class12; I24 may participate when the correction remains IN_PROGRESS across the authority boundary.

## Core distinctions
SUCCESSOR_STATUS != AUTHORITY_VALIDITY
AUTHORITY_EXECUTION_TIME != TARGET_EFFECT_TIME
AUTHORITY_WINDOW != HISTORICAL_EFFECT_WINDOW
CURRENT_AUTHORITY != RETROACTIVE_AUTHORITY
POLICY_SCOPE != RESOURCE_SUCCESSOR_SCOPE
AUTHORITY_EXPIRY != EFFECT_ERASURE
REJECTED_CORRECTION != ORIGINAL_EFFECT_ABSENCE
COMMITTED_CORRECTION != HISTORICAL_EFFECT_REWRITE
POLICY_EXTENSION != HISTORICAL_FACT_REWRITE
AMBIGUOUS_POLICY_TIME_SCOPE != AUTHORIZED_BY_DEFAULT
AUTHORITY_AT_EXECUTION != TARGET_VALIDITY
POLICY_VERSION + EFFECTIVE_INTERVAL CAN RESOLVE TIME-SCOPED AUTHORITY

## Required evidence
- successor relation and its effective interval;
- authority policy version;
- exact policy scope semantics;
- correction execution/acceptance time;
- historical effect time and identity;
- target/incarnation binding;
- provider authorization receipt or decision record;
- policy changes and their effective times;
- reconciliation state preserving historical and current authority separately.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
