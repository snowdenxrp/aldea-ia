# NEXO AB105 G0 — ordering raw re-audit — 2026-10-03

## Raw artifact verified
Artifact ZIP: 11264884775
SHA-256: 378c7b6d0b3904d12eee2459752b937c858b52a34b213d4ce6793f7df56cbe1d
Files:
- nexo-ordering.log — 151026 bytes
- nexo-ordering-evidence.txt — 20149 bytes

The log contains exactly 140 NEXO_ORDER events:
A1_SUCCESS=10, D0_TARGET=10, ACL_W1=20, D0_RETURN=10, ENQUEUE=20, DEQUEUE=20, AUTH_ENTER=20, AUTH_DECISION=20, D1_RESULT=10.

## Critical correction
Each cycle 1-9 has TWO ENQUEUE/AUTH request sequences:
1. the first request is the post-mutation request and receives DENIED;
2. the second request is a later control/verification request and receives ALLOWED.

Cycle 10 has ONLY the first/post-mutation request (correlationId=29), which is DENIED; there is no second ALLOWED request before the run ends.

Therefore the previous interpretation that the relevant W1->ENQUEUE gap was ~50-60 ms was WRONG: those ~48-61 ms gaps are between W1 and the SECOND, later ALLOWED request. The relevant first/post-mutation request gap from the LAST ACL_W1 to ENQUEUE is:
cycle 1 10.739 ms
cycle 2 8.074 ms
cycle 3 6.863 ms
cycle 4 6.623 ms
cycle 5 6.772 ms
cycle 6 6.914 ms
cycle 7 7.296 ms
cycle 8 5.079 ms
cycle 9 7.778 ms
cycle 10 6.554 ms

Cycle 8 is special: D0_RETURN occurs at 329616353885, then broker-0 ACL_W1 occurs at 329617301423, then ENQUEUE at 329622380039. Thus D0_RETURN does NOT mean both broker-side W1 observations have completed.

## Consequences
- The bounded real-broker ordering witness is 10/10 DENIED for the post-mutation request.
- The last-W1 -> relevant ENQUEUE gap is approximately 5.1-10.7 ms, not 50-60 ms.
- There is no evidence here of a stale ALLOW after the relevant mutation.
- This is temporal ordering evidence only; it does not establish JMM happens-before W1->AUTH.
- Cycle 8 proves propagation is observable after D0_RETURN, so D0_RETURN must not be used as a global propagation barrier.

## Frozen state
AB105.116R = FROZEN
AB105.117R = NOT_CREATED
TLC = NOT_RERUN
VULNERABILITY = NOT_DECLARED
