# NEXO CONTINUITY — AB104.307

## Canonical state
AB104.307 research persisted. No implementation performed.

## Finding
Fencing only directly protects targets that enforce the fence/version at their actual effect boundary. Heterogeneous or third-party targets that cannot enforce it remain outside that direct guarantee.

## Required semantics
Classify targets by enforcement capability and preserve per-target evidence. For UNCOOPERATIVE or UNKNOWN targets, coordinator state does not prove current external effect safety or outcome.

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.308: study intermediary/outbox patterns for non-fencable targets and distinguish durable intent, accepted request, and actual external effect.

## DO-NOT-REPEAT
Do not treat a global epoch, coordinator decision, lock-delay, or intermediary acceptance as proof that an uncooperative final target committed the effect.
