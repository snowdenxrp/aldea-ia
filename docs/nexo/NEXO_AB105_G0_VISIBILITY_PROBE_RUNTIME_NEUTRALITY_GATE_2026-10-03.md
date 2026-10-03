# NEXO AB105 G0 — runtime neutrality gate — 2026-10-03

## Review

The compile workflow proves both experiment and control variants compile against the pinned Kafka source.

The runtime recorder remains thread-confined:
- MetadataLoader owns the W1 recorder state.
- Processor owns the AUTH recorder state.
- Records are not exchanged during the measured window.
- Flush occurs on the owner thread during shutdown.
- Test-side extraction is after thread termination/join.

Java's memory model explicitly gives join() a happens-before edge from actions in the terminated thread to actions after successful join. Therefore post-window extraction is not evidence of W1→AUTH visibility; it is only the permitted evidence-recovery boundary. citeturn0search2

## Critical neutrality finding

The current control transformation is structurally acceptable only if the mode/variant selection itself is outside the measured race and the measured W1/AUTH path does not consult shared mode state.

The present source-transform approach replaces the recorded object with a fixed sentinel in the control variant. It does not add a cross-thread synchronization primitive.

However, the runtime witness must still verify:
1. no mode environment lookup occurs inside W1/AUTH;
2. no lazy ThreadLocal initialization occurs inside W1/AUTH;
3. no shared diagnostic publication occurs inside W1/AUTH;
4. no recorder flush occurs before D1 completion;
5. no shutdown is used to detect W1 or release D1;
6. both variants use the same broker topology and cycle schedule.

## Decision

RUNTIME_NEUTRALITY = CONDITIONAL_PASS

REAL_BROKER_VISIBILITY_WITNESS = BLOCKED_PENDING_FINAL_HARNESS_REVIEW

AB105.116R remains frozen.
No TLC rerun.
No AB105.117R.
PR #94 remains unmerged.
