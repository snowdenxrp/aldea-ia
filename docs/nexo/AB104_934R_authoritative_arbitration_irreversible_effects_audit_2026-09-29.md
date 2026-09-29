# AB104.934R — Authoritative arbitration after irreversible incompatible effects
Date: 2026-09-29

## Question
C1 and C2 were concurrently authorized and both produced irreversible confirmed effects EFFECT-3 and EFFECT-4. Later, an authoritative arbitration arrives and determines how the semantic conflict must be treated. How can Nexo resolve the semantic conflict without pretending either historical effect never occurred?

## Continuity anchor
This investigation follows AB104.933R. The authoritative master continuity file currently remains at blob SHA 8f3e731723c1494e90718c8a04baf22d943911ae and still contains its historical AB104.863R next-action tail; therefore this note, plus the individual AB104.933R and AB104.934R commits, is the newer audit evidence. No historical text is overwritten.

## Fresh evidence
Microsoft Azure Event Sourcing guidance states that persisted events are immutable and that correction/reversal is represented by new compensating events while the original event remains in the stream. It also states that optimistic concurrency can detect conflicts in one event stream but conflicts spanning multiple entities still require application-level reconciliation. Projections are derived views and can be eventually consistent. citeturn1search0
AWS guidance likewise describes immutable append-only event history and notes that conflicting events require explicit conflict-detection/resolution strategies; replay reconstructs state from the recorded events. citeturn1search3
These sources support the historical-preservation boundary, but do not define a universal arbitration policy for Nexo.

## Scenario
T1: C1 authorized.
T2: C2 authorized concurrently.
T3: EFFECT-3 confirmed and irreversible.
T4: EFFECT-4 confirmed and irreversible.
T5: authoritative arbitration A arrives and determines that C1 and C2 cannot both satisfy the applicable invariant.
T6: Nexo must produce a reconciled semantic state.

## Findings
1. Arbitration is a new authoritative fact/assessment; it is not a time machine.
2. EFFECT-3 and EFFECT-4 remain historical facts if their occurrence is independently authoritative/confirmed.
3. The arbitration may determine semantic validity, precedence, compensation obligation, liability, or required future handling, but each such consequence must be explicitly represented rather than inferred from the word “arbitration.”
4. If A declares C1 semantically valid and C2 invalid, Nexo must not transform EFFECT-4 into “never happened.” The correct representation is closer to: EFFECT-4 OCCURRED + C2 INVALID_UNDER_INVARIANT + required remediation/compensation status.
5. If A declares C2 valid and C1 invalid, the symmetric representation applies.
6. If A only declares that one invariant must govern future state, neither historical effect is erased; the projection may change while the historical graph remains intact.
7. If A orders compensation of an irreversible effect, the compensation is a new operation/effect with its own authority, identity, target binding, lifecycle and outcome. It does not prove that the original effect was absent.
8. If compensation cannot fully reverse the physical/economic/external consequence, the unresolved residual must remain explicit rather than being hidden by a balanced projection.
9. If A itself is later superseded or revoked, its historical arbitration record remains part of provenance; a later authority can append a new assessment but must not silently rewrite A.
10. If A is incomplete, disputed, or lacks binding scope over the affected domains, the conflict remains CONFLICTING/UNKNOWN for the unresolved dimensions.
11. An authoritative arbitration can resolve a semantic relation without resolving effect occurrence, and can resolve effect occurrence without resolving the correct compensation path. These are separate evidence questions.
12. The final projection is therefore a derived reconciliation view, not the canonical historical truth.
13. This creates a useful separation:
   - FACT: EFFECT-3 occurred.
   - FACT: EFFECT-4 occurred.
   - RELATION: C1 and C2 are incompatible under INVARIANT-ID.
   - ARBITRATION: A declares the applicable precedence/invalidity/remediation rule.
   - REMEDIATION: compensation/correction operation and outcome.
   - PROJECTION: current reconciled view.
14. No new top-level interaction class is justified by this scenario alone. It is a cross-cutting combination of I19/I21/I24 and class 11/12, with I9 where authority generations differ.

## Minimal semantic model
Historical graph:
EFFECT-2
  ├─ C1 ─> EFFECT-3
  └─ C2 ─> EFFECT-4

Conflict relation:
INCOMPATIBLE(C1,C2, INVARIANT-ID)

Authoritative resolution:
ARBITRATION-A
  ├─ scope
  ├─ rule/policy version
  ├─ evidence references
  ├─ decision
  └─ provenance

Possible consequence:
C3_COMPENSATION ─> EFFECT-5
with explicit relation COMPENSATES(EFFECT-3 or EFFECT-4)

The graph must preserve all confirmed historical effects even after EFFECT-5 exists.

## Critical distinctions
ARBITRATION != HISTORY_REWRITE
INVALID_UNDER_POLICY != DID_NOT_OCCUR
COMPENSATED != NEVER_OCCURRED
COMPENSATION != EFFECT_ERASURE
FINAL_PROJECTION != HISTORICAL_GRAPH
AUTHORITATIVE_DECISION != UNIVERSAL_TRUTH_ABOUT_UNOBSERVED_FACTS
CONFLICT_RESOLUTION != EFFECT_ABSENCE
REMEDIATION != RETROACTIVE_NONOCCURRENCE
REVOCATION_OF_ARBITRATION != ERASURE_OF_ARBITRATION_HISTORY
BALANCED_PROJECTION != FULL_RECOVERY_OF_IRREVERSIBLE_EFFECT

## New epistemic boundary
The key closure is not “which effect wins?” but:
**What exactly did the authoritative arbitration establish?**

Nexo should decompose an arbitration into separately evidenced claims:
A1 scope of authority
A2 applicable invariant/rule
A3 relation between C1 and C2
A4 semantic disposition of each operation/effect
A5 required remediation
A6 whether remediation is reversible, partial, or impossible
A7 temporal effective interval
A8 whether the decision is prospective, retrospective, or both
A9 evidence supporting each claim

If any A* dimension is absent, that dimension remains UNKNOWN rather than being filled from the arbitration's general conclusion.

## Epistemic status
Research only.
No implementation.
No formal verification.
No semantic freeze.
20 top-level classes remain UNFROZEN.
W19/W20 remain UNFROZEN.
FutureObs_PAA remains open.
V21 forbidden.

## Exact next action
AB104.935R:
Investigate **arbitration that arrives after one or both irreversible effects have already triggered downstream obligations or external side effects**, including:
- compensation obligation created but compensation execution UNKNOWN;
- arbitration scope crossing multiple resources/aggregates;
- arbitration that orders partial rather than full remediation;
- downstream systems that already acted on the pre-arbitration projection;
- whether reconciliation must fan out into secondary effects;
- concrete provider/workflow code evidence.

Question:
Does the downstream remediation/reconciliation fan-out introduce a genuinely independent interaction class, or is it fully expressible through existing I19/I21/I24/class11/class12 plus typed effect lineage?

No implementation. Do not freeze a class from a Boolean combination alone.
