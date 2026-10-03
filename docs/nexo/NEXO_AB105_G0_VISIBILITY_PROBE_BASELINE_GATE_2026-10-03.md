AB105 G0 visibility probe baseline gate — 2026-10-03

The control must exercise the same owner-thread ThreadLocal initialization, get/set access, and post-window owner-thread flush structure as the experimental probe, while recording no aclCache reference and publishing no state to another thread during W1→AUTH.

Experimental difference must be limited to retaining the already-read cache reference at W1/AUTH. No timing-based synchronization, sleep, latch, Future, queue, shared logger, volatile/atomic publication, or synchronized diagnostic container is permitted.

Acceptance: compare control and experimental runs for harness stability and timing/ordering; baseline differences cannot be interpreted as visibility evidence. If the instrumentation changes the race materially or the control cannot be made equivalent, visibility remains UNKNOWN.

Status: design gate only. No code implementation or workflow run authorized. AB105.116R unchanged; TLC not rerun; PR #94 unmerged.