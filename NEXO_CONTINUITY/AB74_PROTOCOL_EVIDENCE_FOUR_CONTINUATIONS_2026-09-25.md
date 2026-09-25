# AB74 — PROTOCOL-EVIDENCE RECOVERY FOR FOUR UNRESOLVED CONTINUATIONS — 2026-09-25

Status: RESEARCH ONLY. No implementation change, no semantic freeze, no formal verification.

## 1. Purpose
AB73 identified a minimal abstract two-completion counterexample for partial observability, but explicitly did not establish that concrete Nexo permits two such completions.
AB74 recovers the exact protocol evidence already persisted in AB54 and the AB61 research-only interpreter, and maps that evidence onto LEASE_RENEW, RETRY, MUTATION, and RECHECK.

## 2. Recovered canonical evidence
AB54 specifies: LEASE_RENEW reads lease, expiry, renewal authority, current authority/policy/delegation/incarnation, and bridge state; exact validity/bridge mutation remains protocol-dependent and missing renewal authority/history yields UNKNOWN.
AB54 specifies: RETRY reads prior attempt, retry policy, protocol, and bridge/authorization inheritance rules; missing inheritance rules yield UNKNOWN.
AB54 specifies: RECHECK reads the exact fact-set, mutation state, attempt, policy/delegation/incarnation, and boundary; missing fact-set/order/result linkage yields UNKNOWN.
AB61 models MUTATION as reading mutation, attempt, policy, delegation, and incarnation and writing recheck_valid, but marks its semantic status UNKNOWN.
AB54 also states that missing decisive protocol rules remain UNKNOWN, field similarity cannot create dependencies, and FutureObs_PAA requires lower-arity equality, order closure, invalidation closure, protocol read-set, reconstruction, then future observation.

## 3. A/B/C classification
A = all evidence-compatible models have the same future observable.
B = evidence establishes multiple compatible futures with different observations.
C = evidence is insufficient to decide A or B.

| Event | Classification | Reason |
|---|---|---|
| LEASE_RENEW | C / UNKNOWN | Read-set is explicit, but renewal authority/history and exact validity/bridge mutation are not fully specified. No concrete divergent P_AA successor pair is established. |
| RETRY | C / UNKNOWN | Prior-attempt and inheritance inputs are explicit, but retry inheritance/binding law is unresolved. No concrete divergent successor pair is established. |
| MUTATION | C / UNKNOWN | AB61 marks semantics UNKNOWN; the available matrix identifies mutation/recheck linkage but does not define the complete mutation law. |
| RECHECK | C / UNKNOWN | Exact fact-set/result linkage is required, but the protocol evidence does not provide a complete successor generator for unresolved fact-set/order/result cases. |

These are C, not B. The abstract B counterexample remains a semantic possibility, but concrete protocol evidence has not established B for any of the four events.

## 4. Consequence for AB61
AB61's UNKNOWN handling is conservative with respect to unsupported legality, but its research-only execute path must not be interpreted as a complete successor generator.
AB54 supplies named protocol inputs/read-sets, but not complete successor-generation rules for unresolved continuations. Therefore an absent successor is not evidence of KNOWN_EMPTY.
An unchanged state plus UNKNOWN can be a valid verdict representation for unresolved knowledge, but cannot by itself prove that no compatible concrete successor exists.
Before modifying AB61, the smallest justified next experiment is a protocol-evidence harness that represents unresolved successor relations explicitly and records provenance.

## 5. Known versus unknown
KNOWN: exact AB54 read-set vocabulary for LEASE_RENEW, RETRY, and RECHECK; AB61 UNKNOWN status for all four; the abstract two-completion counterexample; and AB61's separation of history execution from future legality.
UNKNOWN: concrete admissible successor set for each unresolved event; whether any event actually admits two compatible completions with different P_AA futures; complete LeaseBridge renewal/replay semantics; retry inheritance and attempt-binding law; complete mutation-to-recheck semantics; complete recheck fact-set/order/result successor relation; quotient congruence.
NOT PROVEN: ternary P_AA collision, successor completeness, eight-attack closure, 286-triple sufficiency, semantic freeze, formal verification.

## 6. Next exact experiment
Do not patch production/interpreter semantics yet.
Construct the smallest research-only transition relation with explicit records:
SUCCESSOR_STATUS = KNOWN_NONEMPTY | KNOWN_EMPTY | UNKNOWN
For each of the four events attach source state/context, event, protocol read-set, known postconditions, unresolved semantic obligations, provenance, and candidate compatible successors only when supported by evidence.
Then test the two-completion construction against the actual AB54 vocabulary. A concrete B result requires two protocol-compatible completions whose future P_AA observations differ. Otherwise retain C/UNKNOWN.

## 7. Gate status
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION_CHANGE = NONE
SEMANTIC_FREEZE = NOT_DECLARED
Eight-attack closure and 286-triple expansion remain blocked.

## 8. DO-NOT-REPEAT
- Do not claim the abstract counterexample is a concrete Nexo counterexample.
- Do not infer missing protocol law from field overlap.
- Do not interpret no enumerated successor as KNOWN_EMPTY.
- Do not convert UNKNOWN into identity/stutter.
- Do not modify AB61/AB65 until the smallest successor representation is justified by protocol evidence.