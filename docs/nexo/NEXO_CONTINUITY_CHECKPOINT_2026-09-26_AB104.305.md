# NEXO CONTINUITY — AB104.305

## Canonical state
AB104.305 research is now persisted. No implementation was performed.

## Finding
Fence tokens do not remain safe across crash/restore if the target can roll back or reset its accepted-fence frontier. The target must preserve the monotonic fence high-water mark or establish a strictly newer authenticated authority epoch before effects resume.

## Required recovery rule
If durability of the fence frontier is not proven: UNKNOWN/STOP -> establish new authenticated authority epoch/fence -> revalidate -> re-admit. Never reset the fence merely because application state was restored.

## Carryover constraints
- No V21 / no patching the historical prototype.
- Research/study before clean architecture.
- No unsupported claims of security, correctness, formal verification, implementation, or fault-injection success.
- Preserve AB50–AB58 unresolved ternary/EventDAG/FutureObs_PAA findings.

## Exact next action
AB104.306: research multi-resource fencing and cross-target atomicity; distinguish common authority fencing from true atomic multi-target commit. Save research and continuity before advancing.

## DO-NOT-REPEAT
Do not treat a restored application snapshot, lease expiry, matching revisions, or a valid historical receipt as proof that current executable authority or current external commitment survived restore.
