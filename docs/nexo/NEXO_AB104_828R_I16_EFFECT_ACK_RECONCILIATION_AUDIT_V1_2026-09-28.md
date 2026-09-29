# NEXO AB104.828R — I16 EFFECT / ACK LOSS / RECONCILIATION AUDIT
Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Scope
Attack I16 against existing interactions and compare with real idempotency/outbox/reconciliation evidence.

## I16 definition
`durable intent -> external effect -> acknowledgement loss -> retry/recovery`

Required causal predicates:
1. durable intent exists before the external attempt;
2. external effect may already have occurred;
3. acknowledgement/result is lost or ambiguous;
4. retry/recovery reintroduces the same logical operation;
5. system must prevent an additional semantic effect or reconcile the already-existing effect;
6. UNKNOWN remains possible when the external resource cannot establish the outcome.

## Research evidence
The Transactional Outbox pattern makes the database update and message publication intent atomic, but explicitly notes that a relay can crash after publishing and before recording publication, causing duplicate delivery; consumers therefore need idempotency. SOURCE CONFIRMED. citeturn0search0

AWS Builders' Library gives the concrete ambiguous-timeout case: a request may have created the resource even though the caller received no response, so blindly retrying can create multiple resources. It recommends reconciliation and stable client request identifiers for idempotent APIs. SOURCE CONFIRMED. citeturn0search1

AWS Durable Execution documentation further distinguishes at-least-once replay from at-most-once-per-attempt semantics and explicitly warns that neither alone guarantees exactly-once execution across an entire workflow. SOURCE CONFIRMED. citeturn0search2

Idempotent Consumer evidence likewise shows that a handler may commit its database mutation and then fail before acknowledgement, causing the same message to be delivered again; processed-message identity or equivalent state is required. SOURCE CONFIRMED. citeturn0search4

## Reduction attacks

### Against I10
I10 is `ownership × duplicate × acknowledgement ambiguity`.

I16 additionally requires a durable intent boundary and an external effect that may already have occurred before acknowledgement loss. Therefore I16 cannot be reduced to I10 without losing the durable-intent/external-effect predicates.

RESULT: I16 is not a semantic duplicate of I10.

### Against I11
I11 is `recovery × delayed external effect × retry/reconciliation`.

I16 does not require an incarnation transition or recovery boundary; the ambiguity can occur in a single incarnation after durable intent. Conversely I11 does not require a durable intent journal before the effect. They are therefore distinct.

RESULT: I16 is not a semantic duplicate of I11.

### Against I13
I13 is `correction × recovery × delayed external effect`.

I16 has no correction predicate and instead requires durable intent + acknowledgement ambiguity. Removing those dimensions changes the causal problem.

RESULT: I16 is not a semantic duplicate of I13.

### Against I15
I15 is `correction × retention expiry × reconciliation`.

I16 does not require correction or retention expiry. I15 can be triggered by historical evidence changes even when no external effect occurred. I16 specifically concerns ambiguity after an external effect boundary.

RESULT: I16 is not a semantic duplicate of I15.

## New boundary result
I16 is a genuine interaction requirement, but its core safety property is not “exactly once execution.” The defensible requirement is:

**same logical operation + ambiguous outcome -> no unproven assumption of absence; retry must be idempotent or reconciliation-driven.**

This is stronger epistemically and avoids claiming an exactly-once property that the external resource may not support.

## Witness decision
A new witness is justified only if an existing witness cannot preserve all six I16 predicates in one causal sequence.

Current W2/W16 cover portions but neither explicitly contains:
`durable intent -> external effect -> ACK loss -> same-operation retry`.

Therefore:

**W17 = RETAINED AS A CANDIDATE, not yet frozen.**

Candidate W17:
`W17 — DURABLE INTENT + EXTERNAL EFFECT + ACK LOSS + SAME-OPERATION RETRY`

Required sequence:
R0 intent journal committed with operation_id O;
R1 external resource may accept O;
R2 process/network fails before durable acknowledgement;
R3 caller/coordinator retries O using the same logical identity;
R4 resource/coordinator must deduplicate, return the known result, or enter explicit UNKNOWN/reconciliation;
R5 a second semantic effect must not be inferred as acceptable merely because the first result was not observed.

## Important non-claim
This does NOT prove exactly-once execution for arbitrary external resources. AWS explicitly notes the need for reconciliation when the outcome is ambiguous, and idempotency requires the service contract to recognize repeated logical requests. citeturn0search1

## Status
I16 = ADMISSIBLE / INDEPENDENT / UNTESTED.
W17 = CANDIDATE / NOT FROZEN.
I1-I15 remain under prior audit status; the global denominator remains UNFROZEN.

## Exact next action
AB104.829R: attack W17 for redundancy against W2, W13, W14, W16 and inspect concrete implementation/test evidence for durable effect journals, idempotency records, and reconciliation. Then perform a bounded second-order search around `intent × effect × acknowledgement × retry` to determine whether additional independent interactions exist.

No deletion/overwrite. No silent witness mutation. No implementation.
