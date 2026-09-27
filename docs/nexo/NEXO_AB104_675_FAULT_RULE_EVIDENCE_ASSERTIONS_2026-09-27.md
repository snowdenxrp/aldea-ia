# NEXO AB104.675 — Fault-rule evidence assertions
Date: 2026-09-27
Status: RESEARCHED / NOT_IMPLEMENTED / NOT_EXECUTED

## Exact source verification
Current Apache Kafka trunk `FaultRule` confirms:
- `once()` registers a first-matching-response trigger.
- `forClient(substring)` scopes matching to request clientId containing that substring.
- `timesMatched()` counts responses offered to the rule after API/client filtering.
- `timesTriggered()` counts responses on which the fault actually fired.
- The rule is evaluated on matching responses; once it fires, later matching responses can still be counted but the once trigger does not fire again.

## Frozen assertions
For the response-loss test:
1. Create `disconnectOn(ApiKeys.PRODUCE).forClient(clientId).once()`.
2. After producer attempt, assert `timesTriggered() == 1`.
3. Assert `timesMatched() >= 1`.
4. Do NOT assert `timesMatched() == 1`: additional PRODUCE responses from the same client may be observed and are not the target fault.
5. The critical causal evidence is:
   `timesTriggered() == 1` + producer did not obtain successful metadata.
6. The independent direct-broker reader remains the only source for PRESENT/NOT_OBSERVED.

## Why this is stronger
`timesMatched()` is not proof that the target request was the one affected; `timesTriggered()` is the direct proxy-side evidence that the configured disconnect action actually fired.

The client-id filter also prevents the verifier consumer from accidentally consuming the PRODUCE fault rule, because the rule is scoped to the producer identity.

## Frozen evidence record
Minimum result tuple:
- producerClientId
- effectId
- ProducerClientOutcome
- ProducerFailureDiagnostic (optional)
- FaultRule.timesMatched
- FaultRule.timesTriggered
- BrokerRecordObservation
- topic
- partition
- offset if PRESENT
- observationDeadline
- readPathError if applicable

## Non-claims
This proves neither:
- replicated durability;
- external system effect completion;
- Nexo correctness/security;
- formal verification.

The experiment remains RF=1 and is a response-path ambiguity experiment.

## Status
VERIFIED:
- fault-rule semantics and deterministic assertions.

NOT_IMPLEMENTED
NOT_EXECUTED
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

## Next exact step
AB104.676: inspect the current proxy response-path source and verify the exact ordering: broker ProduceResponse received -> rule trigger -> connection close -> response not forwarded. Freeze that causal ordering before implementation.
