AB105 G0 visibility probe implementation review — 2026-10-03

Implementation remains workflow-local against pinned Kafka 99b940733a9f6bc409457dba7108f08421d81e42.

Recorder: one preallocated object per owner thread, held by ThreadLocal. No lazy initialization at W1/AUTH. W1 stores the cache object produced by the existing assignment. AUTH stores the cache object already obtained by the existing read. No second aclCache read. Post-window extraction occurs only after owner-thread shutdown and join.

Control: identical recorder access and storage shape, using a fixed sentinel rather than the cache object.

Review gate: no shared diagnostic output during the measured window; no coordination from W1 to AUTH; no production-path semantic change. Execution remains blocked pending compile-only validation.

AB105.116R unchanged. TLC not rerun. PR #94 unmerged.