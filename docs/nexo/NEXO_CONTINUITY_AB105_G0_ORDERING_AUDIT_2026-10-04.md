# AB105 G0 ordering audit — 2026-10-04

## Canonical boundary
- AB105.116R: UNCHANGED / historical anchor.
- AB105.117R: **already exists historically in the repository** (commit `604a692b753bfac69a88819c58e95d92f594e881`). No new 117R will be created.
- TLC: NOT RERUN.
- Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`.

## IMPORTANT CONTINUITY CORRECTION
A prior audit line saying `AB105.117R: NOT CREATED` is stale/contradicted by repository history. The repository contains a real checkpoint `AB105.117R_G0_REAL_BROKER_ORDERING_WITNESS_V2_2026-10-03.md`, committed at `604a692b...`, backed by successful run `37098764557` and artifact `11265332252`. This is historical evidence, not a new state transition being created now.

## Newly re-verified raw artifact
Run `37098764557`, job `111133973894`, artifact `11265332252`, SHA-256 `d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c`.

The ZIP was downloaded and inspected byte-for-byte at the artifact level. It contains:
- `nexo-ordering.log`
- `nexo-ordering-evidence.txt`

The artifact has exactly **140 NEXO_ORDER markers**.

Across 10 cycles:
- 10/10: A1_SUCCESS -> D0_TARGET -> ACL_W1 -> D0_RETURN -> D1 request path -> D1_RESULT=DENIED.
- 20 ACL_W1 markers total: two broker metadata-loader event-handler observations per cycle.
- In cycles 7 and 9, the second broker's ACL_W1 occurs after D0_RETURN. This confirms again that D0_RETURN is not equivalent to “all local W1 completed”.
- In all 10 cycles, the **last observed ACL_W1 still precedes the D1 ENQUEUE**.
- The D1 path is real request handling: ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION=DENIED, followed by D1_RESULT=DENIED.
- The artifact also contains a second ALLOWED request between cycles; these are subsequent A1 requests, not D1. They must not be mixed into the D1 classification.

Representative exact raw ordering:
- Cycle 7: ACL_W1(3000) < D0_RETURN < ACL_W1(0) < D1 ENQUEUE < DEQUEUE < AUTH_ENTER < AUTH_DECISION=DENIED.
- Cycle 9: ACL_W1(3000) < D0_RETURN < ACL_W1(0) < D1 ENQUEUE < DEQUEUE < AUTH_ENTER < AUTH_DECISION=DENIED.

Therefore the earlier broad claim “all W1 before D0_RETURN” was too strong; the raw artifact disproves that formulation. The correct claim is **last observed target-local W1 precedes D1 ENQUEUE in all 10 cycles**.

## What this proves / does not prove
🟢 VERIFIED RAW: successful real-broker execution, pinned Kafka revision, 10 completed cycles, 140 raw markers, real request-handler path, D1 denied in 10/10.
🟢 VERIFIED TEMPORAL: last observed W1 < D1 ENQUEUE in 10/10.
🟢 VERIFIED DISTINCTION: D0_RETURN can precede a broker's second/local W1; D0_RETURN != W1.
🟡 JMM W1 -> authorization snapshot: UNKNOWN.
🟡 W1 -> R1 downstream append/replication: UNKNOWN; this artifact contains no R1 marker.
🟡 Stale-read manifestation: NOT OBSERVED.
🟡 Security impact / exploitability / generalization: UNKNOWN.
🔴 Unsupported: “safe”, “vulnerable”, or “W1 -> authorization proven by timestamps”.

## Other evidence retained
- PR #93 run `37040412845`, artifact `11242611554`: 5,935,698 observations; no post-return pre-remove cache/snapshot and no post-return ALLOWED in that diagnostic. This remains local bounded runtime evidence, not formal JMM proof.
- PR #86: real multi-broker propagation witness; D1 DENIED with target local ACL count 1; stale propagation authorization not observed.
- PR #87: its STALE_ALLOWED_IN_POST_WINDOW label is invalid as stale-after-writer-return evidence; concurrent overlap was observed.
- PR #83: intended pre-local-revocation state was not observed.
- PR #95/#96: do not count as valid new runtime evidence for their claimed variants.
- PR #94 ordering history contains earlier execution-path failures and corrections; the v2 run above is the raw successful run that must be preserved.

## Current conclusion
The real-broker witness materially strengthens the temporal evidence but does **not** close the JMM gap. We have direct raw evidence that the last observed local ACL publication precedes the later D1 enqueue/authorization path in all 10 cycles, while two cycles show local broker publication can straddle D0_RETURN. That is stronger and more precise than treating D0_RETURN as W1.

**Status: UNKNOWN / NOT OBSERVED — neither SAFE nor VULNERABLE.**

## Frozen state / DO-NOT-REPEAT
- Keep AB105.116R unchanged.
- Do not create another AB105.117R; the historical 117R checkpoint already exists.
- Do not rerun TLC.
- Do not repeat PR #92/#93 cache/snapshot diagnostics.
- Do not add latch/volatile/barrier/future synchronization between W1 and authorization.
- Do not treat D0_RETURN as W1.
- Do not promote timestamp ordering into JMM happens-before.
- Preserve artifact `11265332252` and digest above.

## Archaeology addendum — PR #84
PR #84 was also checked as a historical candidate. Its commit/workflow path did reach a real Kafka Producer and produced a denial, but the run `36943184415` failed because the harness did not observe its `D1_AUTH_DECISION` latch within the timeout. The job log shows `Topic authorization failed`, but no recoverable complete A1→D0→D1→D2→E witness was emitted. Therefore PR #84 is **NOT evidence of the target race** and is not an independent sample. The later PR #86 runtime witness is the valid recovered propagation-window result.

This closes another archaeology branch without changing the conclusion: **UNKNOWN / NOT OBSERVED**.
