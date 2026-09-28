# NEXO — CHAT HANDOFF 2026-09-28

## RESUME COMMAND
CONTINUITY

## CURRENT POSITION
Research/audit only. No Nexo implementation. No V21. Semantic freeze NOT declared.

Canonical repo: snowdenxrp/aldea-ia, main.
Kafka source under audit: apache/kafka at abf522e1ca5d7f4375baddc4da004da9fcb6e9ca.

## LAST COMPLETED
AB104.761R — Kafka Produce authorization boundary.
Artifact commit: a90246e9b687c171242e6c4bb3a738f4b3a3ab50.
Continuity append commit: b87b6e7e97a154890b7f25cd7b1a04f668e32bdb.

Finding: Produce uses authHelper.filterByAuthorized(request.context, WRITE, TOPIC, ...) before replicaManager.handleProduceAppend(...). This is a real authorization gate, but no generic second current-authority/session revalidation was established immediately before append. The request.context belongs to the queued Request. Exact authorize -> revoke/disconnect -> append interleaving was NOT executed.

## CRITICAL CORRECTION
An older AB104.760R entry cited nonexistent SHA d854ef3b59358cd7a5da8571dd7558dac8407a71b. Fresh verification showed it cannot be resolved in the canonical Nexo repository. Do NOT treat that old entry as persisted evidence. Do NOT delete it; AB104.760R2 is the authoritative correction.
AB104.760R2 artifact commit: 0dfefee25802225aea25b38faa9048ea8d2927ef.

Fresh Kafka source re-audit independently confirmed: KafkaRequestHandler dequeues queued Request and calls apis.handle() without generic transport-open/session-currentness revalidation. RequestChannel decouples queued requests from socket lifecycle. Exact disconnect-after-enqueue runtime interleaving remains NOT_EXECUTED.

## PREVIOUS STALE-WORK CHAIN
AB104.758R: transport close is not operation revocation.
AB104.759R: RequestChannel queue does not generically cancel already-queued work on socket close.
AB104.760R2: handler does not generically revalidate transport/session before API dispatch.
AB104.761R: Produce authorization is request-context based; no generic final current-authority recheck established.

## EXACT NEXT MISSION
AB104.762R — audit authHelper.filterByAuthorized implementation, including caching/memoization and identity/session inputs, specifically for stale authorization after revocation or credential changes.

Research protocol:
1. Inspect current Kafka source directly at exact commit above.
2. Inspect relevant tests directly.
3. Distinguish SOURCE_INSPECTED / TEST_FOUND / TEST_EXECUTED / PROVEN / UNKNOWN.
4. Never call a test executed unless actually executed.
5. Never use an existing audit note as proof of source behavior; re-audit source.
6. Append corrections; never overwrite/delete historical findings.
7. No Nexo implementation, no V21, no silent semantic migration.

## GLOBAL STATE THAT MUST SURVIVE
P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; evidence reducer completeness UNKNOWN; independence proof UNKNOWN; quorum semantics completeness UNKNOWN; retention/reconstruction soundness UNKNOWN; population completeness UNKNOWN; formal verification NOT_PERFORMED; implementation NOT_STARTED; V21 FORBIDDEN; semantic freeze NOT_DECLARED.

## GLOBAL AUDIT POSITION
Latest completed global audit: GLOBAL-AUDIT-109. GLOBAL-AUDIT-110 remains pending unless explicitly executed/persisted. It may be reordered, but no knowledge may be lost.

## NEXO DESIGN GUARDRAILS
TRANSPORT_DISCONNECT != OPERATION_REVOKED
QUEUE_ENTRY != CURRENT_AUTHORITY
CHANNEL_CLOSE != EFFECT_CANCELLATION
REQUEST_CONTEXT_AUTHORIZATION != CURRENT_AUTHORITY
AUTHORIZATION_CHECK != REVOCATION_RECHECK
ACK/RESPONSE_BEHAVIOR != EFFECT_ABSENCE
HISTORY != AUTHORITY
RESTORATION != REAUTHORIZATION
SIGNED != FRESH

## NEXT CHAT BEHAVIOR
When user says CONTINUITY: recover this handoff and the canonical continuity file; do not ask them to repeat context. When user says CONTINÚA: begin AB104.762R immediately, using fresh source/test inspection. Preserve the exact epistemic boundary above.
