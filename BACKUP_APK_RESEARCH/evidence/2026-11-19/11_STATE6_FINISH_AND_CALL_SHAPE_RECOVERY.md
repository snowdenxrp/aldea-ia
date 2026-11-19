# Additional recovered findings — state 6 producer, task finish callers and call-shape conflict — 2026-11-19

**Source basis:** recovered user messages from 17 and 19 November 2026.  
**Classification:** RECOVERED-CHAT; not re-read against local Smali in this session.

## 1. Newly recovered BRService$5 state-write inventory

The user reported this grep inventory of direct writes to `BRItem.state` in `BRService$5.smali`:

`1151, 1259, 1283, 1336, 1441, 2351, 2547, 2707, 2790, 3225, 3463, 3691, 3801`.

The same reported search included:
- `BRService$11.smali`: 766, 863, 1141, 1589, 1754.
- `BRService$FakeBackupListenerImp.smali`: 1273, 1455, 1753.

These are physical file-line locations from the reported grep. The full grep command/output is not reproduced here; preserve them as recovered inventory, not as a new local search.

## 2. State 6 producer — materially narrowed

The user specifically reported:

- `BRService$5.smali:1735`: assigns `BRItem.state=6` for the item whose package is `files_for_backup`, after `waitingForFilesTransingEnd()`.
- Lines 1789–1790: preserve states 1, 6 or 3; otherwise assign state 1.
- Lines 1967–1968: on `error==0`, preserve the `files_for_backup` state; otherwise assign state 1.
- Line 1983: failure assigns state 3.

This is the first recovered producer context for state 6, improving on document 09's earlier open question. It suggests state 6 is specifically associated with the `files_for_backup` transfer completion path. The exact semantics, UI label/icon, and whether any other producer exists remain unverified.

A prior assistant observation identified `const/4 v8, 0x7` near line 1897, but this was **not** evidence of a write to `BRItem.state=7`. Do not equate the register constant with the item state field.

## 3. handleTaskFinish and callers

Recovered user-provided facts:

- `BRService.smali:8328`: private method descriptor
  `handleTaskFinish(IIILjava/util/ArrayList<BRItem>)`.
- It logs `p1=state`, `p2=workingStage`, `p3=errCode`.
- It calls `showFinishNotification(p1,p2,p3,p4)`, then `stopSelf()`.
- Synthetic bridge is around physical line 1835.
- Grep reported calls from `BRService$5` at physical lines 99, 313, 806 and 4090.

Recovered prior analysis also reported that `handleTaskFinish` itself does not inspect `mBRItems` to derive a global success result; it deletes saved transfer progress when `mIsTransingTask`, fixes three app directories, forwards the arguments to notification handling, then stops the service. The app-directory cleanup details should be checked against the full method body before relying on them.

## 4. Cleanup and telemetry facts

From the user's 17-November report of `BRService$5.run()`:

- Cleanup includes `mReconnector.quit()`.
- Calls `ITransFileService.stopAll(0)`.
- Unbinds the transfer service; an additional unbind was reported when `mIsLocalBackupTask`.
- Deletes `getTransTempBackupRootPath()` contents.
- Calls `updatePkgStae(v14)`.
- Calls `handleTaskFinish(4,v2,v14,mBRItems)`.
- For non-aborted local completion, records:
  - `backup_local_restore_num = mBRItems.size()`
  - `backup_local_restore_success_num = v13`
- Logs `total restore: ..., total susses count: ...`.

These are historical user-reported observations, not independently re-read source.

## 5. Critical unresolved call-argument order conflict

Two recovered descriptions disagree about the four arguments passed to `setState(IIII)` in the final path:

- One earlier summary says `setState(4,v2,0,v14)`.
- The user's 17-November message explicitly reports `setState(4,0,v2,v14)`.

The distinction is material because the second and third arguments may represent different state/stage fields. Do not normalize or repeat either call shape as settled. The original invoke instruction and the exact method descriptor/body must be reread together.

The same recovered user message describes the branch assignments:
- `v16 != 0`: `v14=v16`, `v2=12`.
- aborted: `v14=3`, `v2=10`.
- normal: `v14=0`, `v2=11`.

These local assignments do not resolve the argument order.

## 6. startRestoreCommand overloads — preserved line anchors

Recovered 17-November search results:
- 5-argument call sites: `BRService.smali:13409`, `MiAsistService.smali:2939`.
- 7-argument call site: `ProgressPageFragmentBase$6.smali:275`.
- BRService declarations/related calls: `15199–15220`.
- `CMD_RESTORE` references: `15246` and `19362`.

An earlier assistant described a 5-argument overload around line 15215 as self-recursive and a 7-argument overload as constructing an Intent with `CMD_RESTORE`; the user had requested raw method bodies, which were not provided in the recovered context. Treat that overload characterization as UNVERIFIED until the complete descriptors and bodies are read.

## 7. Next source checks

1. Re-read `BRService$5.smali:1710–1800` and `1950–1990` to close the state-6 producer and preservation behavior.
2. Re-read every reported `BRItem.state` write in `BRService$5` only where needed to determine whether state 6 has other producers.
3. Re-read the exact invoke instruction at the final cleanup path and the `setState(IIII)` body to settle the argument order.
4. Re-read `handleTaskFinish` physical lines 8328 onward, including all cleanup and notification calls.
5. Read full `startRestoreCommand` overload descriptors/bodies before claiming recursion or dispatch behavior.

**Status:** state-6 producer partially recovered; final setState call shape explicitly CONFLICTING / UNKNOWN-STOP; no runtime or device operation performed.
