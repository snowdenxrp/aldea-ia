AB105 G0 visibility probe pre-init gate — 2026-10-03

Pinned Kafka: 99b940733a9f6bc409457dba7108f08421d81e42.

KafkaEventQueue starts its EventHandler thread in its constructor. MetadataLoader owns that event-handler thread; Processor owns its KafkaThread. Therefore ThreadLocal recorder initialization can occur at owner-thread startup, before the measured W1/AUTH window, avoiding first-use initialization at the probe points.

Requirements: no cross-thread recorder access during the race; owner-thread flush only after D1_RESULT; join only for post-window extraction; production aclCache remains plain and unchanged.

Next gate: equivalent control/baseline with the same recorder access pattern but without retaining the cache reference. No implementation or workflow run yet. AB105.116R unchanged; TLC not rerun; PR #94 unmerged.