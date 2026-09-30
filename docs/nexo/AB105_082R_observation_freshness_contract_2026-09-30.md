# AB105.082R — evidence freshness and observation-contract boundary

Date: 2026-09-30
Chain: AB105.081R -> AB105.082R

## Objective
Return to Nexo core evidence dependencies after closing the AWS generic campaign. Investigate the unresolved Observation Contract boundary: when evidence is stale, how freshness is established, and whether fresh evidence can be treated as current authority or current world state.

## Fresh primary evidence
RFC 9334 defines freshness as an appraisal-policy decision about whether Evidence or an Attestation Result is recent enough to represent the latest state. It explicitly notes a race condition: the attester state or appraisal policies can change immediately after evidence is generated. Freshness therefore narrows the acceptable recentness window; it does not prove that the state cannot change immediately afterward. citeturn1search0
RFC 9334 identifies three generic freshness mechanisms: trusted timestamps, verifier-supplied unpredictable nonces, and epoch identifiers. It also notes that epoch transitions create propagation races that require an explicit window/retry strategy. citeturn1search0
RFC 9711 requires EAT evidence to use a received nonce or another freshness mechanism and separates evidence generation, verification, attestation results, and relying-party use. citeturn1search2

## Finding
Freshness is not a property of evidence alone.
It is a relation:
EVIDENCE + FRESHNESS_MECHANISM + APPRAISAL_POLICY + OBSERVATION_CONTEXT -> FRESHNESS_RESULT

A fresh observation can still become stale immediately after appraisal.
Therefore:
FRESH != CURRENT_FOREVER
FRESH != TRUE_FOREVER
FRESH != AUTHORIZED_FOREVER
FRESH != EFFECT_COMPLETED

## Normative Observation Contract
Every observation that may influence a consequential Nexo decision should carry:
- OBSERVATION_ID
- SUBJECT_IDENTITY
- CLAIM_SET
- OBSERVED_AT or FRESHNESS_NONCE/EPOCH
- SOURCE_IDENTITY
- COLLECTION_CONTEXT
- FRESHNESS_MECHANISM
- FRESHNESS_POLICY
- VALID_UNTIL or RECHECK_RULE
- COVERAGE_SCOPE
- APPRAISAL_STATE
- CONFLICT_STATE
- PROVENANCE

### Appraisal states
FRESH
STALE
UNKNOWN_FRESHNESS
CONFLICTING
UNVERIFIABLE

CONFLICTING must not be silently resolved by selecting the newest timestamp unless the conflict-resolution policy explicitly defines that rule and the clocks/order source are trusted.

## Core separation
Observation state and world state are different objects.
An observation may state that a resource was PRESENT at T0.
The world model may represent PRESENT_NOW only if its freshness contract covers the decision time and the relevant state-change boundaries.

Likewise:
OBSERVATION_FRESH != WORLD_STATE_CURRENT
WORLD_STATE_CURRENT != AUTHORITY_CURRENT
AUTHORITY_CURRENT != EFFECT_OCCURRED

## STOP / fencing integration
If a consequential decision depends on an observation whose freshness boundary has expired, Nexo must not silently reuse it.
The admissible transitions are:
FRESH -> DECISION_ALLOWED
STALE -> RECHECK / REVALIDATE
UNKNOWN_FRESHNESS -> UNKNOWN / STOP
CONFLICTING -> RECONCILE / STOP
UNVERIFIABLE -> UNKNOWN / STOP

An epoch/fence can strengthen the boundary, but it does not itself prove the underlying claim. It establishes applicability/freshness context; the claim still requires evidence.

## Replay and caching
RFC 9334 explicitly permits caching when the freshness policy allows it, while warning that continued use must not extend beyond the accepted freshness period. Nonce-based freshness binds evidence to a verifier challenge but does not automatically establish the age of every individual claim. citeturn1search0

Therefore Nexo cache entries need:
CACHE_ENTRY_ID
CLAIM/EVIDENCE_DIGEST
FRESHNESS_PROOF
APPRAISAL_POLICY_VERSION
VALID_UNTIL / RECHECK_RULE
AUTHORITY_EPOCH_BINDING where relevant
REUSE_SCOPE

## Adversarial cases
1. Evidence generated immediately before a state change -> still fresh by threshold, but may already describe the old state.
2. Valid nonce with old claim generation -> nonce proves response freshness more directly than claim-generation age; the distinction must remain explicit.
3. Epoch transition during transmission -> evidence may fall into an allowed epoch window without proving exact instantaneous state.
4. Fresh evidence + changed appraisal policy -> result may require re-appraisal under the current policy.
5. Fresh evidence + authority revocation -> freshness does not preserve authority.
6. Fresh evidence + conflicting independent observation -> conflict must remain explicit.
7. Cached attestation result within TTL -> reusable only within the relying party's freshness policy.
8. Timestamp without trusted clock -> timestamp alone cannot establish trustworthy freshness.
9. Missing freshness mechanism -> UNKNOWN_FRESHNESS, not FRESH.
10. Fresh observation outside coverage scope -> freshness does not expand coverage.

## Result
No contradiction with the existing Claim/Evidence/Decision model.
The Observation Contract should treat freshness as a first-class appraisal relation rather than a boolean attribute of an evidence record.
This closes the generic semantic gap around freshness while preserving provider/protocol-specific enforcement details.

## Status
OBSERVATION_CONTRACT_FRESHNESS = CLOSED_AT_GENERIC_LAYER_WITH_BOUNDED_UNKNOWN
RATS_FRESHNESS = RECOVERED_AND_INTEGRATED
PG-009_STOP_OBSERVATION_BOUNDARY = REMAINS_OPEN_FOR_FORMAL/IMPLEMENTATION_VERIFICATION

Important: this is a semantic/research closure only. It does not claim TLA+ verification, implementation correctness, or production enforcement.

## Next exact direction
AB105.083R — investigate **observation conflict and reconciliation**: when two valid observations disagree, determine the minimum generic evidence needed to classify SAME_STATE, STATE_TRANSITION, CONFLICT, or UNKNOWN without using timestamp order as causal proof.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.