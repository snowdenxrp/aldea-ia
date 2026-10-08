# NEXO NCS — STEP 7 CONCRETE CLAIM MAPPING: NEGATIVE_RESOURCE
Date: 2026-10-08
Status: DESIGN CHECKPOINT — NO UNIVERSALIZATION

## Concrete mapping
Producer finding: `NEGATIVE_RESOURCE` from `EcosystemAgent`.
Legacy action mapping observed: `repair_resource_state`.

This mapping is evidence only; legacy orchestration is not integrated into the new Core.

## Claim under evaluation
Conceptual claim: a specific resource state observed as negative is a candidate basis for a resource-state repair claim.

The claim is NOT yet a protected executable claim. This checkpoint only defines the minimum observational equivalence question needed before admission/deduplication.

## Minimum equivalence predicate
Two NEGATIVE_RESOURCE observations may be observationally equivalent for this claim only if all claim-critical dimensions are established equivalent:
1. producer/source identity;
2. finding code;
3. resource identity;
4. resource incarnation/version;
5. observed amount/value under the claim's comparison semantics;
6. observation freshness/temporal validity;
7. any additional authoritative causal dependency required by the eventual repair claim.

The predicate is conjunctive: failure to establish any claim-critical dimension prevents PASS for equivalence.

## Current evidence
The actual producer currently supplies:
- producer/source after report attribution;
- code = NEGATIVE_RESOURCE;
- resource type;
- amount.

It does NOT currently establish:
- resource incarnation/version;
- observation freshness/version;
- authoritative temporal validity;
- complete dependency set for a repair claim.

## Result
- Different resource types or different amounts establish NON-EQUIVALENCE for the corresponding observed value.
- Identical currently available fields are NOT sufficient to establish equivalence.
- When missing claim-critical dimensions matter, equivalence remains UNKNOWN.
- UNKNOWN must not become duplicate, same-observation, resolved, failed, or safe-to-admit semantics.

## Architectural consequence
The new Core must preserve the ObservationEnvelope and carry the unresolved equivalence/admission question forward. No observation ID, timestamp, queue, retry, tombstone, cache marker, or compatibility mechanism is introduced to manufacture missing evidence.

## STOP boundary
If implementing this predicate requires fabricating resource identity/incarnation, freshness, or dependency evidence, STOP. Redesign the producer/observation contract at its root and prove it before admission logic proceeds.

## Explicitly preserved
- 8-step bounded admission remains CLOSED.
- NOT_ADMITTED is not FAILED/RESOLVED/COMMITTED/RETRIED.
- ClaimEnvelope remains distinct from ObservationEnvelope.
- Provider/model proposals do not acquire authority or commit capability.

## Next exact action
Add a focused semantic test using only existing ObservationEnvelope data:
- differing amount/resource => equivalence cannot PASS;
- identical available fields => equivalence remains UNKNOWN because required dimensions are absent;
- no test may invent missing identity/version fields merely to force PASS.
