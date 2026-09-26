# NEXO AB104.306 — Multi-resource fencing and cross-target atomicity

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
A common authority epoch/fencing scheme can prevent stale authority from being admitted by multiple targets only if each target independently validates the relevant fence at its own effect boundary. This still does NOT make a multi-target operation atomic.

## Evidence
Fencing moves stale-writer protection to the protected resource: the resource rejects an older token/generation at mutation time. This protects each resource independently. Distributed-systems references also distinguish fencing from transaction atomicity; spanning independent resources leaves partial completion possible unless a protocol explicitly coordinates the commit set.

## Nexo consequence
1. authority_epoch may be a common authority namespace, but every target still needs target-specific durable frontier/incarnation state.
2. One target accepting epoch E does not prove another target accepted E.
3. If targets can commit independently, aggregate effect state MUST expose per-target evidence and allow PARTIAL / UNKNOWN; it must not infer COMMITTED from a coordinator decision alone.
4. A single global fence prevents stale authority only where every relevant target enforces it. It does not provide rollback of a target that already committed.
5. True atomic multi-target commit requires an explicit protocol/domain whose commit boundary covers the complete participant set; otherwise use compensation/reconciliation semantics rather than pretending atomicity.
6. operation_id and semantic payload identity remain separate from fencing identity; equal fence/epoch does not imply duplicate suppression.

## Candidate aggregate model
For an effect set {T1,...,Tn}:
- per target: ADMITTED | COMMITTED | REJECTED_STALE | UNKNOWN
- aggregate: COMMITTED only when the contract's complete commit boundary/evidence covers every required target;
- PARTIAL when some targets are committed and others definitively are not;
- UNKNOWN when any required target's outcome cannot be established;
- CONFLICT when authenticated evidence is mutually incompatible.

## Explicit non-claims
No architecture or implementation is selected here. This does not establish universal atomicity or exactly-once external effects.

## Sources studied
- Chubby-style sequencers/fencing concepts: downstream resource validation of lock generation.
- Current distributed-systems references on fencing: resource-side monotonic validation and the limitation that fencing does not make multi-resource operations transactional.

## Next
AB104.307 — investigate whether a shared/global fence can safely span heterogeneous targets, and what evidence is required when one target cannot enforce the fence.
