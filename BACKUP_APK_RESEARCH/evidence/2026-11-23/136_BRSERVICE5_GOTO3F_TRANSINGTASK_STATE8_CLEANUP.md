# Evidence 136 — BRService$5 :goto_3f: estado global 8 y cleanup

**Date:** 2026-11-23  
**Source:** user-provided Termux output from `sed -n '3850,3970p' "$F"`, continuation of evidence 135.  
**Status:** CURRENT-CHAT-TERMUX-OUTPUT; not independently re-read or hash-verified; no runtime.

## New delta

- After `"startRestore, restored"`, if `mIsTransingTask` is false, control skips the shown transition and proceeds to `:cond_64`.
- If `mIsTransingTask` is true, the code reads `mIsAborted`. If aborted, or if `v16 != 0`, it branches to `:cond_63` and skips the shown `setState`/sleep block.
- Only on the visible path where `mIsTransingTask == true`, `mIsAborted == false`, and `v16 == 0`, it calls `setState(4, 8, 0)`, then sleeps 500 ms. An interrupted sleep is logged as `InterruptedException`; control then reaches cleanup.
- Cleanup obtains `mReconnector` and calls `quit()`; calls `mTransFileService.stopAll(0)` with `RemoteException` logged; then calls `unbindTransFileService()`.
- At `:cond_64`, it checks `mIsLocalBackupTask`; the excerpt ends after the conditional branch instruction, so its destination/effect is not recorded.

## Dedupe and limits

Evidence 135 already records the synchronized reset of `mRunningItemIndex=-1`, the log, and the start of the `mIsTransingTask` branch. This evidence adds the exact guard conditions, global `setState(4,8,0)` call, 500 ms wait, and visible cleanup. The call is a service-level `setState`, not evidence of direct `BRItem.state=8`; do not conflate these. The output does not establish the final use of `v16`, the local-backup branch destination, or behavior beyond the excerpt.

**Provenance:** USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT; physical coordinates not independently verified; no dynamic execution.