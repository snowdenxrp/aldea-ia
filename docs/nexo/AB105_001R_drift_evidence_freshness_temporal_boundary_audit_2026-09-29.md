# AB105.001R — drift evidence is time-bounded; stale results require freshness validation

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Can a previously completed drift result be treated as current evidence without validating its observation timestamp and result generation?

## Fresh evidence
AWS explicitly instructs users to review the stack's `Last drift check time` and confirm it is earlier than the timestamp shown in resource drift results to avoid using stale data. Resource-level documentation gives the same warning. AWS also states that each `DetectStackDrift` operation generates a new drift-detection result ID, while retained historical drift results and their retention duration may vary. citeturn0search0turn0search2turn0search3

AWS exposes `LastCheckTimestamp` as the most recent time a resource was checked, and stack-level drift information likewise records the most recent drift-check timestamp. citeturn0search4turn0search5

## Findings
1. A drift result is an observation at a particular time, not a timeless property of the resource.
2. AWS explicitly warns against consuming stale drift data without checking timestamps.
3. A new drift operation receives a new detection ID; therefore result identity and observation time are part of the evidence boundary.
4. Historical retention is variable, so retained result existence cannot be treated as proof that it remains the latest authoritative observation.
5. A later mutation can occur after an `IN_SYNC` observation; therefore `IN_SYNC(t1)` does not establish `IN_SYNC(t2)` without a new observation or another authoritative continuity guarantee.
6. A later drift check can establish current evidence, but does not prove the resource remained continuously in sync between observations.
7. This is a temporal/provenance refinement of I19/I21/I22 and classes 7, 12, 17, 19; no new top-level interaction class is justified.

## Anti-collapse
`IN_SYNC(t1) != IN_SYNC_NOW`
`LAST_CHECK(t1) != CURRENT_STATE(t2)`
`OLD_RESULT != CURRENT_OBSERVATION`
`RESULT_ID != TIMELESS_TRUTH`
`RETAINED_RESULT != LATEST_RESULT`
`LATER_CHECK != CONTINUOUS_HISTORY`
`OBSERVATION_TIME != EFFECT_TIME`
`UNKNOWN != FAILED`

## Nexo implication
Evidence objects should bind at least:
`evidence_id + observation_time + scope/coverage + authority + source + freshness relation`.

A decision consuming evidence must verify that the evidence is fresh enough for that decision's temporal contract. If the contract cannot establish freshness, the decision should preserve the uncertainty rather than silently treating an old observation as current truth.

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
AB105.001R establishes a distinct freshness boundary: drift evidence is time-scoped. `IN_SYNC` is evidence about the covered state at its observation boundary, not a timeless guarantee. Nexo must prevent stale evidence from being silently promoted to current fact and must not convert two observations into a claim of continuous historical correctness unless continuity itself is evidenced.
