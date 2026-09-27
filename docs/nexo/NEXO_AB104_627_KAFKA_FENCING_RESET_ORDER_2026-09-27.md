# NEXO AB104.627 — source-level fencing/reset ordering
Date: 2026-09-27
Status: research/design only; no implementation or execution claim.

## Evidence
KIP-618 specifies a task-count record in the config topic that identifies how many prior task producers must be fenced. If the latest task-count record is older than the latest task configs, workers must perform zombie fencing before safely starting new tasks. The leader's fencing round writes a new task-count record and reads to the end of the config topic before reporting success. citeturn0search1
KIP-618 also requires source-task startup to fence through the leader, then read to the end of the config topic before and after transactional producer creation; if a newer task configuration appears, startup is abandoned. This creates multiple ordered authority checkpoints rather than one final check. citeturn0search1
KIP-875 requires offset alter/reset only for STOPPED connectors with no active task configs; for EOS source reset, prior tasks are fenced before alterOffsets and transactional primary-offset mutation. Reset success also requires reading the relevant offsets topic to its end; dedicated connector offset-topic deletion is not transactional with the primary topic. citeturn0search0

## Crash/race matrix
C627-1: fence producer calls finish, crash before task-count record is durably observed -> fencing outcome must be reconciled from config-topic state and producer state.
C627-2: task-count record observed, crash before alterOffsets -> fenced generation remains historical; offset mutation is unresolved.
C627-3: alterOffsets external mutation succeeds, Kafka primary transaction fails/unknown -> cross-domain UNKNOWN.
C627-4: primary transaction commits, response lost -> Kafka outcome reconcile; never retry as a new logical reset.
C627-5: new task config appears between fencing and reset -> request must not treat old fence snapshot as current; KIP-618 explicitly uses config-topic ordering checkpoints.
C627-6: dedicated offsets-topic deletion succeeds while primary transaction outcome is unresolved -> mixed state; cannot collapse to one boolean success.
C627-7: config-topic replay after cluster incarnation -> historical task-count/config evidence needs incarnation binding.

## Nexo finding
The real protocol is an ordered sequence of scoped evidence checkpoints:
STOPPED/config-empty → fence-generation → config-topic end observed → connector alterOffsets → primary offset transaction → offsets-topic end observed.
Each checkpoint has its own authority domain and crash ambiguity. Therefore a single ResetOperationID must be bound to the entire sequence, while each participant keeps its own evidence identity.

The strongest reusable Nexo pattern here is not one final CAS; it is a durable operation state machine with per-participant evidence anchors plus generation/fence bindings. A later checkpoint cannot erase an earlier UNKNOWN.

## Next
AB104.628: research exact source code/tests for zombie fencing and offset reset ordering, especially whether KIP-875 implementation creates a durable operation identity or only derives transactional identity from groupId+connector.