# P112 helper dependency audit — 2026-10-07

Audited specialization, exploration, relationships, memory and discovery.

- specializationBonus is derived from role/confidence; upstream role derives from agent skills. A bonus scalar is not an independent authority source.
- discoverArea is mutation-heavy: spatial/exploration normalization, knownRegions, discoveredAreas, region visits and agent knownResources. It reads position, resource position/quality and perception radii.
- getOrCreateRelationship can mutate relationships even from an apparently observational path. relationship-derived admission must bind the relationship edge/version, not only partner identity.
- recallRelevantMemories is a predicate/order-derived selection over memory topic, description, importance and day. Memory trimming can change future admission.
- getKnownActions derives action availability from knowledge topic membership/confidence. Discovery and belief updates mutate knowledge/evidence.

Cross-cutting: helper output is not a dependency boundary. Normalization may write; derived values hide source reads; collection selection creates predicate/order dependencies; memory and knowledge are mutable admission inputs.

Status: GREEN dependency classes mapped; GREEN derived/predicate/order dependencies confirmed; BLUE complete capture UNKNOWN; BLUE minimal granularity OPEN.

DO-NOT-REPEAT: no instrumentation, no VersionSet implementation, no TLC rerun, no AB104.185 backfill.

Exact next: trace representative action-class envelopes: resource action, trade, cooperate, exploration, build/farm, including admission reads, handler reads/writes, derived/predicate dependencies and recovery/reconciliation inputs.