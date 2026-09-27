# NEXO AB104.661 — fault-harness boundary

Date: 2026-09-27
Status: RESEARCH ONLY — NOT IMPLEMENTED/EXECUTED.

Research result:
- Current Kafka system tests use ducktape for distributed integration testing, but the inspected current system-test documentation does not expose a reusable built-in API specifically for "drop this ProduceResponse after broker append". citeturn0search3
- Current `Sender` has an explicit production response-handling boundary for timed-out/disconnected Produce requests. citeturn0search2
- Current Kafka repository contains an active effort around protocol fault-proxy fixtures (PR #23438 / KAFKA-21074), indicating fault-proxy infrastructure is a relevant direction, but the search evidence does not establish that it already provides the exact required post-append ProduceResponse suppression hook. citeturn0search6

Conclusion:
The exact current built-in post-append response-drop primitive remains UNVERIFIED. The correct boundary is therefore an explicit network fault harness/proxy between producer and broker, with the fault positioned after the request has crossed the client boundary but before the response reaches the producer.

Required proof sequence:
1. Identify a unique Produce request/record.
2. Permit broker processing/append.
3. Suppress or delay only the response path.
4. Observe producer timeout/disconnect/retry.
5. Independently read the target partition.
6. Reconcile duplicate/retry possibilities by record identity and authoritative partition state.
7. Keep client callback state and broker state as separate evidence domains.

No implementation or execution is claimed.

Evidence:
CURRENT_SYSTEM_TEST_HARNESS=VERIFIED
DUCKTAPE=VERIFIED
FAULT_PROXY_DIRECTION=SUPPORTED
EXACT_POST_APPEND_DROP_HOOK=UNKNOWN
TEST_IMPLEMENTED=NO
TEST_EXECUTED=NO
BROKER_DURABILITY_VERIFIED=NO
NEXO_CORRECTNESS_VERIFIED=NO

NEXT: AB104.662 — inspect the newly identified Kafka protocol fault-proxy work (KAFKA-21074 / PR #23438) and determine whether its current fixture can actually create the required response-loss window; do not infer capability from the PR title alone.
