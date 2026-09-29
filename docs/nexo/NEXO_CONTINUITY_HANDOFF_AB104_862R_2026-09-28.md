# NEXO CONTINUITY — HANDOFF AB104.862R → NEXT CHAT
Date: 2026-09-28
Canonical repo: snowdenxrp/aldea-ia
Branch: main
Workflow: INVESTIGAR → ANALIZAR → CONTRASTAR → GUARDAR

## CURRENT EPISTEMIC STATE
Research/audit only. Nexo architecture is NOT being implemented. No V21, no patching V20, no silent migration, no deletion/overwrite of historical evidence. No security/correctness/completeness claim without proof.

## LATEST COMPLETED
AB104.862R saved at commit c5d59e3023de348cdfa43cab461b10c16fcd93a4.
It established concrete provider evidence for SUBMITTED → terminal/settled → CORRECTED/REVERSED. Adyen documents asynchronous capture and later correction/reversal semantics; Event Sourcing evidence supports immutable original history plus compensating correction events. Conclusion: I19 is the appropriate semantic family; no new top-level interaction/class was justified. citeturn0search0turn0search9

## CRITICAL CORRECTIONS THAT MUST SURVIVE CHAT RESET
1. Do NOT model Adyen CAPTURE success=true as terminal external confirmation. It can mean valid submission followed later by CAPTURE_FAILED.
2. Do NOT model that case as COMMITTED → FAILED. Correct path: ACCEPTED/SUBMITTED → downstream pending → FAILED.
3. UNKNOWN is epistemic uncertainty, not an ordinary business lifecycle state.
4. INCOMPARABLE does not authorize invented precedence.
5. CONFLICTING remains a derived semantic predicate when mutual incompatibility is proven, but currently has no independent witness.
6. Immutable history ≠ fencing ≠ proof of external effect.
7. operation_id, authority_generation, payment/resource version, observation freshness remain distinct domains.

## I19–I27 DISPOSITION
I19: empirically supported semantic family / witness not frozen.
I20: independent / untested.
I21: distinct / untested.
I22: parameterized.
I23: absorbed.
I24: independent / untested.
I25: parameterized coverage.
I26: empirically supported semantic interaction / witness not frozen.
I27: model-level residual / empirical witness not established.
W20: NOT FROZEN.
20 top-level classes: UNFROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture freeze: NOT DECLARED.

## CANONICAL 20-CLASS TAXONOMY
1 operation identity collision
2 payload-binding conflict
3 duplicate delivery/retry
4 acknowledgement ambiguity
5 transaction isolation anomaly
6 commit/apply separation
7 stale observation/order
8 state-machine transition race
9 authority-generation/fencing race
10 worker ownership/rebalance race
11 external-effect ambiguity
12 reconciliation consistency/retention
13 ledger conservation/multi-account invariant
14 correction/reversal
15 idempotency retention/reuse
16 broker/workflow liveness and poison-message behavior
17 recovery/restart continuity
18 namespace/incarnation confusion
19 authentication/source-validity failure
20 cross-domain atomicity boundary

This taxonomy is a working taxonomy, NOT a completeness proof.

## HISTORICAL NON-NEGOTIABLE CARRYOVER
AB56 did NOT close FutureObs_PAA. Earlier status included:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT PERFORMED.
AB55 was only minimal boolean 64 states × 6 total orders = 384 per attack for 8 attacks, not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## AB104.860R CLOSURE RESULT
Typed audit states:
NOT_ACCEPTED, ACCEPTED_OR_RESERVED, SUBMITTED, IN_PROGRESS, COMMITTED, FAILED, EXPIRED, CANCELLED, CORRECTED, REVERSED, UNKNOWN.
Generic forbidden assumptions include FAILED→COMMITTED, EXPIRED→COMMITTED, CANCELLED→COMMITTED, REVERSED→COMMITTED, UNKNOWN→retry-as-proof-of-no-effect, older evidence overwriting newer authoritative state, arbitrary ordering of INCOMPARABLE, and duplicate delivery becoming a second business effect.
CONFLICTING is derived from INCOMPARABLE + contract-proven incompatibility; it does not select a winner.

## AB104.861R RESULT
Concrete Adyen witness for accepted/submitted capture later failing downstream. Semantic witness YES; concrete provider evidence YES; vulnerable implementation NOT ESTABLISHED; new top-level class NO; W20 NOT FROZEN.
INV-TE-06 and INV-TE-07 are candidates only.

## AB104.862R RESULT
Concrete correction/reversal evidence exists. I19 remains the correct semantic family. INV-TE-08 and INV-TE-09 are candidates only.
Important: Adyen may not provide a webhook for successful settlement, so a later reversal event must not be treated as proof of what local state or observation existed before. Adyen also documents REFUNDED_REVERSED and asynchronous reversal outcomes. citeturn0search9turn0search10

## EXACT NEXT ACTION
AB104.863R:
Attack ordering at the correction/reversal boundary. Search concrete executable/provider implementations and incident/test evidence for correction/reversal events that are duplicated, delayed, out-of-order, or race with stale pre-correction projections. Determine whether I21 fully covers correction + freshness + reconciliation, or whether a genuinely independent interaction exists.
Do not freeze a witness from documentation alone.
Do not add a new class merely because a Boolean combination is logically possible.
If no independent witness is found, reduce/absorb and continue.

## PRIOR RESEARCH CHAIN
Continue from AB104.839R onward with authoritative GitHub fetches before every append. Earlier key saved commits include:
AB104.839R authoritative state around 86ebf59e8156b53adade0d239da8db6f91912bd9.
AB104.840R 2a0038c42f854951f6e1591f7fdf69c646e9842d.
AB104.841R c2b1a189d3abac9a62cd00f0288de67d2ecef1fa.
AB104.842R 78050ab6ee49e7be01f0f6d5897e6298fd5858dd.
AB104.843R d5282d020589e24ed43dd615afe12cfca9fff27c.
AB104.845R 544dc78c3b703f44e74465be8a9c8154fcd6504b.
AB104.846R c14de333f2a98ca073b56c25160e267adc70a572.
AB104.847R b8f10acfaf05fc1ac7a5fd4c673374db9527c794.
AB104.848R 8b78b565eff780fbaa0cfb6dbcf425f6e2ab91fc.
AB104.852R authoritative GitHub fetch needed; prior tool-reported save was be3e20f103f1f99735ed39e31bac54e03b63a90f.
AB104.853R prior assistant-reported hash fde4097c85e3d2da0cfc6b45fe5ac90a201e5538; verify from GitHub before relying.
AB104.854R prior assistant-reported hash d3bc... was uncertain; verify.
AB104.855R prior assistant-reported f4c4... was uncertain; verify.
AB104.856R 8d88951b32518ebda3f7f6e79595ac18cc36a9ba.
AB104.857R f56fcdba08fad36508fd9cf4dd8e054553646ddc.
AB104.858R 2bc93ccc0470cd64d11da501682b8b72cab684c0.
AB104.859R authoritative current file contains it; previous assistant claim f75c... should not be trusted until fetch.
AB104.860R a3f1cb917498e74d08345d2e84b056d590d0eec8.
AB104.861R c0ff643b36f70453404e37e8fa76c1874061b374.
AB104.862R c5d59e3023de348cdfa43cab461b10c16fcd93a4.

## CONTINUITY RULE
At start of next chat, if user says CONTINUITY or CONTINÚA, recover this handoff and the canonical GitHub audit file before proposing anything. Do not ask the user to repeat context. First action should be authoritative GitHub fetch/search plus fresh evidence for the exact next audit action.
