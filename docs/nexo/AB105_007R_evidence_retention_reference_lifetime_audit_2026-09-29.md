# AB105.007R — evidence reference lifetime is not evidence lifetime

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Can a stored reference to a prior observation be treated as durable evidence when the source system does not guarantee indefinite retention of that observation?

## Fresh evidence
AWS CloudFormation states that each drift-detection operation receives a new StackDriftDetectionId, but the number of drift results retained for a stack and how long they are retained may vary. AWS also exposes the detection ID as the identifier for that operation's results. citeturn1search0turn1search1

AWS separately records LastCheckTimestamp for resource drift information, while resource-drift queries return information for resources that have been checked. citeturn1search9turn1search11

## Findings
1. An evidence reference can identify a historical observation without guaranteeing that the source will retain the underlying result indefinitely.
2. Therefore reference identity, source retention, and evidence validity are separate dimensions.
3. If a source result expires or becomes unavailable, disappearance of the source record is not proof that the historical event or state never existed.
4. Possession of a previously stored identifier does not prove that the referenced source observation is still retrievable or current.
5. Nexo needs a distinction between evidence identity, evidence retention/materialization, current retrievability, temporal validity/freshness, and historical fact status.
6. If a critical claim depends on an external observation whose retention is not guaranteed, Nexo should preserve the evidence needed for the claim according to its own retention/provenance contract rather than treating the external identifier as permanent storage.
7. Later inability to retrieve the source must not silently become ABSENT, FAILED, or NEVER_OCCURRED.
8. No new top-level interaction class is justified; this is a provenance/retention refinement of I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
EVIDENCE_ID != EVIDENCE_STORAGE
EVIDENCE_STORAGE != CURRENT_RETRIEVABILITY
RETRIEVABLE != CURRENT
SOURCE_EXPIRY != HISTORICAL_ABSENCE
MISSING_SOURCE_RECORD != NEVER_OCCURRED
REFERENCE_EXISTS != EVIDENCE_CURRENT
LATER_RETRIEVAL_FAILURE != HISTORICAL_ERASURE
UNKNOWN != FAILED

## Nexo implication
An evidence object should conceptually bind:
evidence_id + source + observation_time + scope + authority + retention/provenance status + freshness

For high-consequence claims, external references should not be the sole durable representation when the source retention horizon is unspecified or variable.

A source record becoming unavailable should transition the availability of evidence rather than rewrite the historical claim into a contrary fact.

## Classification
Primary: I19, I21, I22.
Interactions: classes 7, 12, 17, 19.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB105.007R establishes a retention boundary: an evidence identifier is not a durable evidence store, and loss of source retrievability is not historical erasure. Nexo must distinguish evidence identity, retention, retrievability, freshness, and historical fact status so that evidence loss cannot silently become a false negative.
