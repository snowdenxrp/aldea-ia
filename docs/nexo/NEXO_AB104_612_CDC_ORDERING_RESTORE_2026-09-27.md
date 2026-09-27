# NEXO AB104.612 — CDC ordering/replay + stale snapshot recovery
Date: 2026-09-27
Status: research/design only.

## Evidence
- Debezium outbox uses a unique event ID for deduplication and aggregate ID as the Kafka key, which supports ordering within a Kafka partition; event ID itself is not a causal-order proof. citeturn0search0turn0search9
- etcd restore creates a new logical cluster and can bump revisions + mark them compacted to invalidate old watch/cache lineage. citeturn0search4turn0search3
- etcd watch RPC explicitly reports cancellation when the requested start revision is compacted; the client must not simply resume from that obsolete revision. citeturn0search10

## Derived model
DedupIdentity = ConsumerDomain + ConsumerIncarnation + EffectID + ContractDigest.
CausalPosition = SourceAuthorityDomain + SourceIncarnation + AggregateID + Sequence/Revision + DependencyDigest.
These are orthogonal: same event identity can be replayed; causal order requires separate evidence.

## Adversarial tests
T612-1: replay same event ID after successful processing -> ALREADY_COMPLETED.
T612-2: replay same event ID with changed contract -> CONFLICT.
T612-3: two events same aggregate, reversed delivery -> causal-order guard detects stale predecessor/sequence.
T612-4: replay after CDC connector restart -> dedup, no second local effect.
T612-5: restore source DB/outbox snapshot under new source incarnation -> old sequence/revision cannot be treated as current lineage without explicit transfer.
T612-6: restore consumer inbox from older snapshot -> old completion marker is historical; new consumer incarnation requires reconciliation.
T612-7: etcd watch starts at compacted revision -> CANCELED/compacted => full authoritative resync, not incremental replay.
T612-8: revision bump after restore -> monotonic ordering for intended consumers, but incarnation still changes.
T612-9: event ID reused with a different source incarnation -> BLOCK unless explicit identity transfer.
T612-10: missing sequence metadata -> no causal claim; process only if policy permits unordered handling.

## Architecture consequence
Nexo must not collapse EventID, revision, sequence, incarnation, or dependency digest into one field. Replay safety and causal ordering are separate claims. Restore invalidates continuity assumptions unless an explicit continuity transfer establishes them.

## Next
AB104.613: research CDC connector offset/checkpoint durability and crash/replay semantics; determine whether offsets can ever be treated as authoritative progress or only transport-consumer evidence.