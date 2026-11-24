# Evidence 137 — BRService$5: cierre de restauración, estado final y limpieza

**Date:** 2026-11-23  
**Source:** user-provided Termux output from `sed -n '3960,4070p' "$F"`, continuation of evidence 136.  
**Status:** CURRENT-CHAT-TERMUX-OUTPUT; not independently re-read or hash-verified; no runtime.

## New delta

- If `mIsLocalBackupTask` is true, the code calls `unbindTransFileService()`; otherwise it skips this additional unbind. It then logs `"startRestore, stoped"`.
- Retrieves `BRManager` and `mBackupServiceStateObserver`, then calls `BRManager.release(observer)`.
- Calls `StorageMonitor.stopMonitor()`.
- Final result registers: if `v16 != 0`, assigns `v14=v16` and `v2=12`; otherwise checks `mIsAborted`, assigning `v14=3` when true and `v14=0` when false.
- Independently selects the second final state argument: `mIsAborted == true` gives `v2=10`; false gives `v2=11`. Thus the earlier `v2=12` from the nonzero-`v16` branch is overwritten at `:goto_43` by this subsequent abort-dependent selection.
- Calls the five-argument service method `setState(4, v2, 0, v14)`.
- Constructs a File from `Customization.getTransTempBackupRootPath()` and calls `Utils.deleteContents(file)`, then logs `"Restoring end"`.
- The excerpt ends after obtaining `BRServiceDataHolder.getInstance()`; subsequent handling is not included.

## Dedupe and limits

Evidence 136 already records the earlier conditional `setState(4,8,0)`, 500 ms wait, reconnect/transfer cleanup and entry into the local-backup check. This evidence adds the local-task unbind, manager release, monitor stop, final register assignments, five-argument `setState` call, and temporary-directory content deletion. `setState` is a service-level call; do not equate its arguments with direct `BRItem.state/error` writes. The code visibly assigns `v2=12` for nonzero `v16`, but the later unconditional control flow at `:goto_43` replaces it with 10 or 11 according to `mIsAborted`; retain this order rather than reporting 12 as the final second argument. The excerpt does not show the body of `setState`, the contents/path value at runtime, or the remainder after `BRServiceDataHolder.getInstance()`.

**Provenance:** USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT; physical coordinates not independently verified; no dynamic execution.