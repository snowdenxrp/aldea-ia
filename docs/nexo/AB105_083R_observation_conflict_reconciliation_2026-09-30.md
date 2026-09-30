# AB105.083R — observation conflict and reconciliation

Date: 2026-09-30
Chain: AB105.082R -> AB105.083R

## Objective
Determine the minimum generic evidence needed when two otherwise valid observations disagree, without using timestamp order as causal proof.

## Fresh primary evidence
RFC 9334 separates Evidence, Verifier appraisal, Attestation Results, and Relying-Party appraisal. It also states that freshness only narrows recency and that state or appraisal policy can change immediately after evidence generation. Therefore an observation's validity and freshness do not by themselves resolve disagreement with another observation. citeturn0search0turn0search25
NIST SP 800-207 places policy decision and policy enforcement at distinct logical points and calls for monitoring/reporting of current asset state. This supports treating an observation conflict as an input to a decision/enforcement process rather than silently resolving it inside the observation record. citeturn0search24turn0search28

## Finding
Two valid observations can disagree without either being invalid.
Examples:
- Observation A: PRESENT at T0; Observation B: NOT_FOUND at T1.
- Observer A: configuration MATCH; Observer B: configuration DIFFERENCE.
- Authority source A: ALLOW; authority source B: REVOKED.

The generic model therefore needs to distinguish:
STATE_TRANSITION
CONCURRENT_DIVERGENCE
STALE_OBSERVATION
CONFLICT
UNKNOWN

## Normative reconciliation contract
Each reconciliation record should contain:
- RECONCILIATION_ID
- SUBJECT_IDENTITY
- CLAIM_TYPE
- OBSERVATION_SET
- SOURCE_IDENTITIES
- OBSERVATION_SCOPES
- FRESHNESS_RESULTS
- COMMON_COVERAGE_SCOPE
- IDENTITY_MATCH_RESULT
- COMPATIBILITY_RULE
- RECONCILIATION_RESULT
- UNRESOLVED_PORTION
- DECIDED_AT
- POLICY_VERSION

## Minimum decision sequence
1. Verify that observations refer to the same subject identity.
2. Compare their scopes and coverage.
3. Evaluate freshness independently for each observation.
4. Determine whether the observations are temporally or epoch-compatible.
5. Apply a documented compatibility rule.
6. If a transition is supported by an explicit identity/operation edge, classify STATE_TRANSITION.
7. If observations overlap in scope and remain incompatible, classify CONFLICT.
8. If scope or freshness is insufficient, classify UNKNOWN rather than inventing precedence.

## Anti-collapse rules
1. NEWER_TIMESTAMP != CAUSALITY.
2. NEWER_TIMESTAMP != AUTOMATICALLY_MORE_TRUSTWORTHY.
3. TWO_FRESH_OBSERVATIONS != AUTOMATICALLY_CONFLICTING; their scopes may differ.
4. TWO_CONFLICTING_OBSERVATIONS != AUTOMATICALLY_INVALID_EVIDENCE.
5. DIFFERENT_IDENTITIES != STATE_TRANSITION unless the identity relation is independently proven.
6. SAME_IDENTITY != SAME_STATE.
7. FRESHNESS != TRUTH.
8. SOURCE_AUTHORITY != SUBJECT_STATE.
9. RECONCILIATION_RESULT != ORIGINAL_OBSERVATION.
10. UNRESOLVED_CONFLICT != DENY_BY_DEFAULT unless the consuming decision policy explicitly defines that behavior.

## Generic compatibility matrix
OBS A + OBS B
same identity + non-overlapping scope -> COMPATIBLE/PARTITIONED
same identity + sequential compatible state evidence -> STATE_TRANSITION when an edge is supported
same identity + overlapping incompatible claims + both adequately fresh -> CONFLICT
same identity + one stale -> prefer fresh only within an explicit appraisal policy; preserve stale record
identity unresolved -> UNKNOWN
scope unresolved -> UNKNOWN
causal order unresolved -> do not infer order

## Critical Nexo distinction
The reconciliation layer must not mutate or erase the original evidence.
It produces a derived result:
OBSERVATION_A
OBSERVATION_B
-> RECONCILIATION_RESULT

This preserves event sourcing and lets a later policy version produce a different appraisal without rewriting historical evidence.

## Integration with existing model
Physical lifecycle: a replacement edge may resolve what would otherwise look like contradictory old/new physical observations.
Configuration/drift: a later drift observation can coexist with an earlier MATCH without implying the exact change cause.
Causal provenance: conflicting actor/API records remain provenance conflict unless explicit correlation resolves them.
Authorization: ALLOW and REVOKED can both be correct at different epochs; an overlapping same-epoch contradiction is CONFLICT/UNKNOWN until reconciled.

## Adversarial cases
1. Fresh PRESENT and fresh NOT_FOUND for same identity, same scope, overlapping epoch -> CONFLICT unless a provider transition edge exists.
2. PRESENT at T0 and NOT_FOUND at T1 with proven deletion operation -> STATE_TRANSITION.
3. MATCH followed by DIFFERENCE with no causal edge -> CONFIGURATION_STATE_TRANSITION/UNKNOWN_CAUSE, not causal proof.
4. ALLOW at T0 and REVOKED at T1 -> AUTHORITY_TRANSITION, not contradiction.
5. Two ALLOW results from different policy snapshots -> preserve both decision contexts.
6. One source has broader scope and another narrower scope -> not necessarily conflict.
7. One observation lacks freshness evidence -> UNKNOWN_FRESHNESS, not stale by assumption.
8. Same timestamp from different sources -> timestamp equality provides no causal ordering.
9. Source reports current state while another reports historical state -> scope mismatch, not conflict.
10. Reconciliation policy changes -> historical observations remain immutable; only derived appraisal may change.

## Result
No new generic identity primitive is required.
No new causal ordering primitive is required.
Reconciliation is a derived appraisal layer over immutable observations, with explicit conflict and UNKNOWN states.

## Status
OBSERVATION_CONFLICT_GENERIC_BRANCH = CLOSED_AT_GENERIC_LAYER_WITH_BOUNDED_UNKNOWN
RECONCILIATION_LAYER = NORMATIVELY_DEFINED
EVENT_SOURCING_COMPATIBILITY = CONFIRMED_AT_SEMANTIC_LEVEL

This is not formal verification or implementation proof.

## Next exact direction
AB105.084R — investigate **evidence dependency/common-mode failure**: determine how Nexo should treat multiple observations that appear independent but share the same underlying source, sensor, provider, credential, clock, or collection path. Goal: prevent false confidence from counting correlated evidence as independent evidence.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.