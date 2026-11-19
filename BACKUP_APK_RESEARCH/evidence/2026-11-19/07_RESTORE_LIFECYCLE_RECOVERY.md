# BRService restore lifecycle — recovered static-flow delta — 2026-11-19

**Source basis:** user-provided findings recovered from conversations dated 17–19 November 2026.  
**Classification:** DIRECT-CHAT / RECOVERED-HISTORICAL. The full original Smali blocks are not included here and were not reread in the current local checkout.

## 1. Entry into restoration

Recovered historical line references:

- `BRService.smali:12672` — `restoreFiles()` was located around this line in the initial recovery summary; later line references in the same investigation put the method around 1351–1367. These are not normalized: exact method boundaries must be re-read.
- `restoreFiles()` was reported to check/update service state, store `mBRItems` and descriptor information, notify, and invoke `startRestore()`.
- `startRestore()` creates and starts `BRService$5` as thread `"RestoreThread"`.
- `BRService$5.run()` performs initialization, WakeLock/BMS work, type classification and StorageMonitor startup.

**Line-anchor discrepancy:** `restoreFiles()` is cited around 12672 in one historical summary and around 1351–1367 in a later summary. Do not silently reconcile these; recover exact file/method descriptors and extraction revision.

## 2. Remote transfer setup and preparation

Recovered user-provided details from 17 November:

- Creates/clears `mReceivedRestoringItemFiles` and `mEverTriedBaks`.
- Calls `bindTransFileServiceLocked()`.
- If the descriptor is non-null, logs `"mBackupDescriptor != null prepare the restore item"` and calls `prepareRestoringItems()`.
- Reads `mRemoteConnectedLatch.get()` / waits on the remote-connected latch.
- Logs `"startRestore, decrypted"` in the later preparation path.
- Transfer failure path: if `remoteConnectedLatch` does not connect, calls `setState(v4,7,v6)`, waits (`await`), logs `"not connected to remote"`, and sets `mIsAborted=true`.
- If connection succeeds, calls `setState(v4,3,v6)` and continues preparation/restoration.
- A separate recovered line window 1418–1452 describes initialization of lists, `bindTransFileServiceLocked`, stage changes 3/7/3, and the not-connected abort branch.

Do not infer external reachability or the identity of the remote endpoint solely from these internal calls.

## 3. Preparation, password and capacity checks

Recovered from prior user messages:

- Around `BRService$5` lines 1463–1471: reads `encryptedPwd`, obtains `BRItem.packageName`, calls `BRManager.setFutureTask()`.
- Insufficient space forces result `2` and marks abort.
- Around lines 1478–1486: checks connectivity, decrypts `encryptedPwd` into `mPasswd`, records status, and may finish through `handleTaskFinish`.
- No network → local result `v0=4`.
- Decrypted password empty → local result `v0=1`.
- If `v0 != 0`, calls `setState(v4,v3,v0)`, `handleTaskFinish(v4,v3,v0,mBRItems)`, and returns.
- With a valid password, the restore continues.

The numeric local result values must not be treated as global error codes without tracing the exact argument path.

## 4. Per-item local restore behavior

Recovered from user-provided line references:

- `BRService$5` local restore iterates `localFileList`.
- `copyFileFromStream` false logs `"copyOneFile error, file lost"`.
- Exceptions log `"copyFileFromStream error"` and the loop continues in the described branch.
- Closing failure logs `"close inputStream error"`.
- `notifyItemTaskError(...,7)` and `notifyItemTaskEnd(...)` are used in the described error/completion paths.
- `MediaScannerConnection.scanFile` appears in the local media restoration path.
- `restoreLocalMediaFile(BRItem,false,InputStream)` was identified.
- The `Restore failed` path calls `onError(...,6)` and `onRestoreEnd(...)`.
- Around lines 1954–1996: logs `"Restore failed, for : ... bakFile = ..."`; if `bakFile` is missing and `v5==null`, sets `BRItem.error=10`; if it exists and `v5==null`, sets error 1. Success logs `"Restore One, result success"`; failure logs `"Restore One, result failed"` and sets `state=3`.
- `mArchiveSyncer.wait()` appears under a monitor; `mRunningItemIndex=-1); log `"startRestore, restored"`; a call `setState(4,8,0)` and `Thread.sleep(500)` were also reported in that line window.

The last `setState(4,8,0)` is an intermediate stage observation. It must not be conflated with the final stage 12 / error 8 or 9 path.

## 5. Error 8/9 conditions and shutdown

Recovered user facts:

- `v16=8` when `v8` is true.
- `v16=9` when `mIsFlashDriveTask` is true and `isUsbAvaliable()` is false.
- The Theme Manager branch identifies package `com.android.thememanager`, sets `isRestoreTheme`, and when `v8 != 0` assigns `v4=0xa` and `v16=0x8`.
- Flash Drive without an available USB assigns `v4=0xa` and `v16=0x9`.
- At the finish branch, nonzero `v16` is copied to `v14`, and `v2=12`; the normal path had `v2=11`, while the aborted path had `v2=10`.
- The end sequence calls `updatePkgStae(v14)`, then `handleTaskFinish(4,v2,v14,mBRItems)`.

Recovered shutdown sequence supplied by the user:

1. `mReconnector.quit()`.
2. `ITransFileService.stopAll(0)`.
3. `unbindTransFileService()`.
4. `StorageMonitor.stopMonitor()`.
5. `setState(4,v2,0,v14)`.
6. `deleteContents(getTransTempBackupRootPath())`.
7. `setDescriptor(null)`.
8. `handleTaskFinish(4,v2,v14,mBRItems)`.
9. `releaseWakeLock()`.

This sequence is recovered from user-shared source analysis, not independently re-read now.

## 6. Exact line windows and unresolved method anchors

Recovered ranges/anchors worth preserving:

- `BRService$5.smali:1391–1452`: task type flags, StorageMonitor, remote transfer connection.
- `BRService$5.smali:1463–1503`: password/capacity/preparation path.
- `BRService$5.smali:1528–1560`: item filtering, USB/transfer flags, state handling.
- `BRService$5.smali:1861–1898`: local file restore loop.
- `BRService$5.smali:1951–1996`: Restore failed/success/failure and intermediate state 8.
- `BRService.smali:8328–8408`: real `handleTaskFinish`.
- `BRService.smali:14061–14220`: `setState(III)` bridge and `setState(IIII)` implementation.

## 7. Status

This document preserves a useful static lifecycle outline and additional line anchors. It does not include complete original method bodies, a hash of the local Smali files, or fresh LOCAL-VERIFIED results.

Still required:
- Exact method boundaries for `restoreFiles()` and `startRestore()`.
- Complete `BRService$5.run()` and `startRestore()` raw blocks with register lifetimes.
- Full `StorageMonitor.startMonitor()` implementation and result semantics.
- Full transfer service Binder interface and remote endpoint.
- Full preparation/password path and all return/cleanup branches.
- All callers of `handleTaskFinish` and all producers of global errors 8/9.

**Overall status:** INCOMPLETE; static-only, no runtime operations.
