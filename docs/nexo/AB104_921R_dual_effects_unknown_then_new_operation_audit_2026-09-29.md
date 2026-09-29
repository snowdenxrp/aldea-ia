# AB104.921R — O1 UNKNOWN followed by O2, then both effects commit
Date: 2026-09-29

## Question
O1 remains UNKNOWN. C3 authorizes O2. Later O1 and O2 both produce external effects. How must identity, causality and reconciliation preserve both histories?

## Fresh evidence
The current IETF HTTPAPI Idempotency-Key draft defines an idempotency key as identifying retries of the same request, requires uniqueness against a different payload, permits expiry, and distinguishes a retry after completion from a concurrent request still outstanding. Therefore an idempotency key is not a universal operation/effect identity. citeturn0search2

## Attack
T1: O1 authorized under C1; provider accepts O1.
T2: O1 becomes UNKNOWN.
T3: C3 authorizes O2 against the same target while O1 remains UNKNOWN.
T4: O2 commits EFFECT-2.
T5: O1 later commits EFFECT-1.
Both effects are real.

## Findings
1. O2 must not overwrite O1's UNKNOWN record. The later-known effect is evidence about O2, not proof about O1.
2. EFFECT-1 and EFFECT-2 require distinct effect identities even if they affect the same resource.
3. If provider contracts expose a stable operation/effect identifier, reconciliation must bind each result to that identifier rather than infer causality from arrival order.
4. O2_CONFIRMED != O1_FAILED; success of O2 does not resolve O1.
5. EFFECT-2_AFTER_UNKNOWN != EFFECT-2_CAUSED_BY_O1; causality requires explicit provider lineage or another authoritative causal contract.
6. If O2 was intentionally a new logical operation, both effects can be historically valid even if one was unexpected. The system then needs a domain rule for duplicate/overlapping effects.
7. If O2 was intended as a retry of O1 but used a new operation identity, the two records must still preserve that relationship explicitly; otherwise reconciliation can mistake one retry for two independent operations.
8. If O2 reused O1's provider idempotency identity and the provider contract guarantees same-request deduplication, two committed effects may indicate a provider contract violation or identity-scope failure; this cannot be inferred from local records alone.
9. If the idempotency key expired before O2, loss of dedup protection does not prove O1 had no effect.
10. A reconciliation system must retain both the causal hypothesis and the observed effects until authoritative evidence resolves the relationship.
11. If both effects are irreversible, reconciliation can classify and compensate where policy allows, but cannot erase either historical effect.
12. No new top-level interaction class. This composes I15/I22, I24, I19/I21 and class11/class12; I18 participates when target incarnation reuse is possible.

## Core distinctions
O2_SUCCESS != O1_FAILURE
O2_EFFECT != O1_EFFECT
NEW_OPERATION != OLD_OPERATION_RESOLUTION
EFFECT_ORDER != CAUSAL_ORDER
ARRIVAL_ORDER != CAUSAL_ORDER
IDEMPOTENCY_KEY != OPERATION_IDENTITY
OPERATION_IDENTITY != EFFECT_IDENTITY
EFFECT_IDENTITY != TARGET_IDENTITY
NEW_EFFECT != PROOF_OF_OLD_NONEXECUTION
UNKNOWN_RECORD != REPLACEABLE_PLACEHOLDER
RECONCILIATION != HISTORY_REWRITE
COMPENSATION != EFFECT_ERASURE

## Required reconciliation evidence
- stable O1/O2 operation identities;
- provider-native effect IDs where available;
- target + incarnation binding;
- causal/parent relationship if provider supplies one;
- idempotency key and fingerprint scope;
- timestamps with defined semantics;
- authoritative provider history/receipt;
- explicit treatment of concurrent/overlapping effects;
- preservation of UNKNOWN until positive resolution.

## Epistemic status
No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
