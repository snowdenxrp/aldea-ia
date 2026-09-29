# AB104.970R — ProgressEvent EventTime semantics versus effect-time evidence

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Can ProgressEvent.EventTime be used as the timestamp of the actual resource effect, or does it only establish request/observation timing?

## Fresh evidence
AWS Cloud Control API defines ProgressEvent.EventTime as the time when the resource operation request was initiated. The same ProgressEvent separately exposes OperationStatus and ResourceModel. AWS's GetResource operation independently returns the current state of the resource. AWS documentation also shows an IN_PROGRESS ProgressEvent followed later by a SUCCESS ProgressEvent for the same RequestToken, demonstrating that the request has multiple temporal observations rather than one universal effect timestamp.

## Findings
1. EventTime is request-initiation timing according to the provider contract; it is not a generic effect-commit timestamp.
2. A request can have multiple ProgressEvent observations over time, including IN_PROGRESS and later SUCCESS, so a single EventTime cannot represent all state transitions or underlying effects.
3. A current GetResource response is temporally distinct from the request's EventTime and represents current state at the read boundary.
4. Therefore effect_time must not be inferred from EventTime unless a provider-specific contract explicitly binds them.
5. A SUCCESS observation establishes provider operation status at that observation, but does not retroactively change EventTime into effect time.
6. If a historical reconstruction needs causal timing, Nexo should retain separate fields for request initiation, status observation, resource observation, and independently evidenced effect time.
7. Ordering can be established only where timestamps and/or causal relations actually constrain the events; identical or nearby timestamps do not establish causal order by themselves.
8. No new top-level interaction class is justified. This strengthens I19/I21/I22 and classes 7, 12, 17, 19.

## Anti-collapse
EVENT_TIME != EFFECT_TIME
EVENT_TIME != COMPLETION_TIME
SUCCESS_OBSERVATION_TIME != EFFECT_TIME
CURRENT_READ_TIME != REQUEST_INITIATION_TIME
TEMPORAL_PROXIMITY != CAUSAL_ORDER
STATUS_TRANSITION != EFFECT_TIMESTAMP
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22; classes 7, 12, 17, 19.
Secondary: I18 and I15 where identity/incarnation or retention boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.970R establishes that provider timestamp semantics must be preserved literally. EventTime can anchor request initiation, while status observations, current reads, and effect evidence have separate temporal meanings. Nexo must not manufacture an effect timestamp from a request timestamp; unresolved temporal binding remains partial/UNKNOWN.
