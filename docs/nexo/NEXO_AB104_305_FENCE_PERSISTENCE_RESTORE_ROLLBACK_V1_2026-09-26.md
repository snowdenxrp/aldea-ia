# NEXO AB104.305 — Fence persistence across crash/recovery/restore/rollback

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
A fencing token only provides stale-writer safety if the target/resource preserves the highest accepted authority frontier across crash, restart, restore, and rollback. Resetting or restoring the fence frontier can make an old token appear current again.

## Evidence
- Distributed-systems fencing patterns require the resource itself to reject stale lower tokens; client lease knowledge is insufficient.
- Durable recovery patterns preserve the committed/high-water frontier across restart; recovery must not expose state beyond the durable frontier.
- Crash/recovery literature distinguishes completed operations from operations concurrent with a crash; recovery must not invent completion.

## Nexo consequence
1. Application-state rollback MUST NOT roll back the authority/fence frontier.
2. If the fence frontier cannot be proven durable after recovery, execution MUST NOT resume from the restored application snapshot.
3. Recovery must enter UNKNOWN/STOP, establish a new authenticated authority epoch/fence, and only then re-admit effects.
4. A snapshot that contains application state but omits the fence frontier is historical evidence, not an executable checkpoint.
5. Candidate invariant: AcceptedFence(after_recovery) >= AcceptedFence(before_crash) for the same authority lineage, OR a strictly newer authenticated authority epoch/fence must be established before effects resume.

## Explicit non-claims
This does not prove a concrete implementation, formal verification, or universal exactly-once external effects. It is a research constraint for the future clean architecture.

## Next
AB104.306 — multi-resource fencing and cross-target atomicity.
