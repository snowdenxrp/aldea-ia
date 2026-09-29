# AB104.934R — Late arbitration after irreversible effects
Date: 2026-09-29

## Question
C1 and C2 are both confirmed, mutually incompatible, and already produced irreversible external effects. An authoritative arbitration decision arrives later. Can it resolve the semantic conflict without pretending one effect never happened?

## Fresh evidence
Microsoft's current Event Sourcing guidance states that events are immutable, the event store is the historical source of information, and compensating events are new events; the original event remains in the stream. It also distinguishes the event stream from materialized projections and warns that conflicts spanning multiple entities still require application-level handling. citeturn0search0turn0search2
AWS likewise describes immutable event history and reconstruction of point-in-time state from that history. citeturn0search1turn0search3

## Scenario
EFFECT-2 confirmed.
C1 -> irreversible EFFECT-3 confirmed.
C2 -> irreversible EFFECT-4 confirmed.
C1 and C2 are later established to violate the same domain invariant.
T9: authoritative arbitration arrives.

## Findings
1. Arbitration at T9 can resolve the semantic/policy status of the conflict, but cannot make EFFECT-3 or EFFECT-4 historically nonexistent.
2. The arbitration must identify its authority, rule/version, scope, effective time, and exact conflicting nodes/relations.
3. If the rule says C1 prevails, that means the domain classification or permitted future state favors C1; it does not prove EFFECT-4 never happened.
4. If EFFECT-4 is irreversible, any remediation is a new operation/effect. The historical fact remains.
5. If both effects already occurred, the system may need a compensating/remediation operation for the losing or invalid effect, but that operation must have its own identity and outcome.
6. If remediation is impossible or partial, the resulting state may remain CONFLICTING, DEGRADED, or UNKNOWN under the domain contract.
7. Arbitration does not retroactively alter timestamps, provider effect IDs, operation identities, or original evidence.
8. Arbitration can change an ASSESSMENT/CLASSIFICATION layer while preserving FACTS.
9. If the arbitration authority itself is later revoked, its historical decision remains a historical decision; its current validity becomes a separate assessment, subject to its temporal/revocation contract.
10. If arbitration merely chooses a preferred projection, it must not be treated as proof that the other effect did not occur.
11. If the arbitration rule is incomplete or its binding to the exact effects is uncertain, the result remains UNKNOWN/CONFLICTING.
12. Therefore Nexo needs a distinction between historical occurrence, semantic validity, authoritative arbitration, and remediation outcome.

## Representation
FACTS:
- EFFECT-3 CONFIRMED
- EFFECT-4 CONFIRMED

RELATIONS:
- INCOMPATIBLE(C1,C2)

ARBITRATION:
- authority/version
- rule
- scope
- effective time
- decision
- evidence binding

REMEDIATION:
- new operation identity
- new authority
- target/effect identity
- outcome

PROJECTION:
- derived view after arbitration, never replacement of history

## Critical distinctions
ARBITRATION != ERASURE
ARBITRATION != NONOCCURRENCE
PREFERRED_EFFECT != ONLY_EFFECT
SEMANTIC_INVALIDITY != EFFECT_ABSENCE
REMEDIATION != HISTORY_REWRITE
PROJECTION != SOURCE_HISTORY
DECISION_TIME != EFFECT_TIME
CURRENT_ARBITRATION_STATUS != HISTORICAL_ARBITRATION_FACT
PARTIAL_REMEDIATION != COMPLETE_COMPENSATION

## Classification
No new top-level interaction class. Primarily I19/I21/I24 + class11/class12; I9 where authority generations differ.

## Epistemic status
Research only. No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
