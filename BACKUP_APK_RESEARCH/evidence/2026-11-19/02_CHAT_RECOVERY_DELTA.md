# Recovery delta — MIUI Backup.apk — 2026-11-19

**Purpose:** preserve additional historical facts recovered from prior conversations after the initial v0.2 index/audit. This is a recovery delta, not a transcript and not a substitute for the original Termux files.

**Repository:** `snowdenxrp/aldea-ia`  
**Branch:** `backup-apk-static-research-2026-11-19`  
**Scope:** documentary/static only. No device, APK, service, backup, restore, or runtime operation was performed.

## 1. Important correction: `mBakFilesType`

The initial v0.2 index and recovery audit contain an inaccurate paraphrase of the direct user-pasted block from `BRService$5.smali`, `BRService$5.run()`, around lines 1391–1418. They state that type 2 sets `mIsTransingTask` and type 3 sets `mIsFlashDriveTask`. The recovered conversation detail contradicts that paraphrase.

Recovered from the user's direct message describing the Smali block:

| Condition | Observed effect in the block | Classification |
|---|---|---|
| `mBakFilesType == 2` | `v8 = 1` | DIRECT-CHAT fact; exact surrounding instructions not reproduced in this recovery |
| `mBakFilesType == 3` | `mIsTransingTask = true` | DIRECT-CHAT fact |
| `mBakFilesType == 5` | `mIsFlashDriveTask = true` | DIRECT-CHAT fact |
| `mBakFilesType == 1` | `mIsLocalBackupTask = true` | DIRECT-CHAT fact |

The same recovered conversation associates type 2 / `v8=1` with the temporary-transfer backup path (`.tmp_bak_file` / `getTransTempBackupRootPath()`), but the complete Smali context must be re-read before assigning a stronger semantic label to `v8`.

**Current classification:** the task-flag mapping above is the best-supported recovered mapping from the direct conversation. It is not yet LOCAL-VERIFIED against the current Termux checkout because the original file bytes and complete block have not been accessed in this session. The earlier mapping in the v0.2 index is an erroneous paraphrase and must not be reused.

### Related continuation from the same method

Recovered user-provided line references:

- Lines 1418–1438: when `mIsTransingTask` is true, initialize lists, call `bindTransFileServiceLocked`, then call `setState(v4,v10,v6)` with `v10=3`. If the remote service is not connected, call `setState(v4,v15,v6)` with `v15=7`; after connection, call `setState(v4,v10,v6)` again.
- Lines 1440–1452: log `"not connected to remote"`, set `mIsAborted=true`, and assign `v0=7` in the described branch.
- Lines 1528–1544: inspect `mIsFlashDriveTask` and `isUsbAvaliable`; inspect `mIsTransingTask`; under `shouldSkipBRItem`, state comparison and cached-file conditions, preserve an existing BRItem state through `iput v14 ...->state:I`.
- Lines 1556–1560: `files_for_backup` preserves its state; other items receive `state=4`; disabled apps receive `state=v10` and `error=v3`.

These line references are recovered from prior user messages, not re-read from the file in this session.

## 2. Recovered global state semantics

The user pasted the real `setState(IIII)` block from `BRService.smali` around lines 14072–14220.

Recovered semantics:

- `p1` is stored in `mState`.
- `p2` is stored in `mWorkingStage`.
- `p3` is stored in `mUserInterruptAction`.
- `p4` is copied to `mLastError` only if the existing `mLastError` is zero.
- If `p2 == 7`, the method calls `releaseWakeLock()`.
- If `p2 == 10` or `p2 == 12`, or `p3 == 2`, it iterates `mBRItems` and writes `BRItem.state=3` and `BRItem.error=9`.

The three-argument overload around lines 14061–14070 delegates to the four-argument method using `(p1,p2,mUserInterruptAction,p3)`.

**Interpretive constraint:** the value 7 passed as the second argument is a global working stage. It is not evidence that `BRItem.state=7`. Likewise, `BRItem.error=9` in the conditional item loop is not interchangeable with global `mLastError=9`.

## 3. Recovered BRItem state writers and callback distinctions

### 3.1 `BRService$5.smali`

Recovered line references from user messages:

| Line(s) | Recovered assignment / context |
|---|---|
| 1151 | `BRItem.state = v14` |
| 1259 | state inherited for `files_for_backup`; otherwise state 4 |
| 1283, 1336, 1441 | `BRItem.state = v10` |
| 1735 | state 6 after waiting for `files_for_backup` transfer |
| 1789–1790, 1897–1898 | preserve states 1, 6, or 3 |
| 1861–1898 | iterate `localFileList`; abort sets state 3/error 9; `copyFileFromStream` false logs `copyOneFile error, file lost`; exceptions log `copyFileFromStream error` and continue; close failure or empty restored list can notify listener error 7 |
| 1967–1968 | state 1 on ordinary restore success |
| 1983 | state 3 on restore failure |
| 2351 | state 6 |
| 2547, 2790, 3225, 3801 | state 3 in abort/failure paths |
| 2707 | state = v3 |
| 3463 | state = v4 |
| 3691 | state 1 after successful restore |

Other recovered details:

- `v6` was identified as the `BRItem`; `v5` as `ZipFile`; `v4` as source list; `v3` as restored list.
- In the failure branch around lines 1951–1965, `onError(...,6)` and `onRestoreEnd` precede the `"Restore failed"` log.
- If `bakFile` is null/nonexistent and `v5==null`, assign `BRItem.error=10`; if `bakFile` exists and `v5==null`, assign error 1; if `v5!=null`, that branch assigns no new error.
- These are historical line-level references from prior user messages; original complete blocks are not yet stored here.

### 3.2 `BRService$11.smali`

Recovered user-provided details:

- `onBackupStart` around line 3560 and `onRestoreStart` around line 3735 assign `BRItem.state=2`.
- In the result path around line 3692, state 3 is assigned and listener error `p3` is translated to `BRItem.error` as follows:

| Listener `p3` | `BRItem.error` |
|---:|---:|
| 0 | 0 |
| 3 | 2 |
| 4 | 5 |
| 5 | 6 |
| 6 | 7 |
| 8 | 6 |
| 9 | 11 |
| other | 1 |

Values 7 and 8 here are input listener codes, not BRItem states.

A separate user message states that `onError` assigns `state=3`, while `onCustomProgressChange` updates `progType`, sizes/progress and notifies; it does not itself assign state in the described block.

### 3.3 Other writers and bounded negative searches

Recovered details:

- `BRService$FakeBackupListenerImp.smali`: direct writes reported at lines 5719 → state 2; 5834 → state 3; 5921 → state 1.
- `ProgressItemAdapter`: `itemStart` → state 2; abort → state 3/error 9; error → state 3/error `p3`; completion can assign state 1.
- Searches across `BRService$FakeBackupListenerImp`, `BRService$6`, and `BRItem` were reported not to find direct writes of state 7/8 in the searched scope. This is a bounded negative result only, not proof that no other class or reflective path can write those values.

## 4. Earlier entry-point and Binder recovery

Recovered from the user's prior conversations dated 16–17 November:

- Working directory: `$HOME/backup-static/decoded`.
- Relevant files: `BRService.smali`, `AndroidManifest.xml`, `MiAsistService*.smali`, `IBRService$Stub.smali`.
- `MiAsistService.bindBRService()`, lines 675–707: explicit Intent to `BRService`; adds `extra_is_from_miasist=true`; calls `startService()` and `bindService()`.
- `MiAsistService.smali`, lines 2939–2942: calls `BRService.startRestoreCommand(...,4)`, then `bindBRService()`.
- `MiAsistService.smali`, lines 2862–2865: calls `BRService.startBackupCommand(...)`.
- `MiAsistService$2.smali`, lines 38–106: `onServiceConnected` uses `IBRService$Stub.asInterface`, stores `mBRService`, registers listener; disconnection clears it.
- `MiAsistService.smali`, lines 1600–1620: calls `IBRService.getBRItems()`.
- Manifest was reported to declare `MiAsistService` and `BRService` as `exported=false`; MiAsistService uses process `:remote` and action `miui.intent.action.MIASIST_PROXY`.
- `BRService.smali` references `startRestoreCommand` at lines 13409, 15199, 15220; `onBind` around 18672; `onStartCommand` around 19067; `Binder.clearCallingIdentity()` around 7380.
- `startRestoreCommand(...)` builds an Intent using `BRService.CMD_RESTORE` and extras `extra_descriptor`, `extra_descriptor_dir`, `extra_britems`, `extra_zip_file_path`, `extra_is_from_miasist`, and `extra_bakfiles_type`, then calls `startService()`. `restoreAppData` implementation was reported around line 12550; an earlier extraction captured only the synthetic bridge, and the corrected historical extraction range was `sed -n '12540,12750p' "$F"`.
- The 14 Binder transaction IDs were recorded in the v0.2 index and should be retained; no claim of external reachability follows from the transaction list or `exported=false` alone.

## 5. Provenance and recovery limits

This file records facts retrieved from prior-conversation context and user-message summaries. It does **not** contain the complete original Smali text, full shell stdout/stderr, or a fresh read of the Termux checkout. Therefore:

- Do not label these line summaries `LOCAL-VERIFIED`.
- Do not fabricate exact grep/sed commands beyond those explicitly preserved above.
- Do not treat missing original transcript text as evidence that the underlying user message never existed.
- The next definitive technical check requires reading the existing local files in `$HOME/backup-static/decoded`, particularly the full `BRService$5.run()` block and all comparisons/usages of `mBakFilesType`.
- Preserve the raw blocks as separate immutable evidence records when they are supplied or recovered. Do not replace this recovery delta with reconstructed Smali.

## 6. Next exact recovery targets

1. Re-read `BRService$5.smali` lines 1380–1460 and 1515–1570; capture complete raw output and hash the file.
2. Search every occurrence of `mBakFilesType`, `mIsTransingTask`, `mIsFlashDriveTask`, `mIsLocalBackupTask`, and `v8` in the method/class; record all hits and context before closing the type semantics.
3. Re-read `BRService.smali` `setState(IIII)` and `handleTaskFinish()` with complete method boundaries; preserve the original blocks.
4. Capture `BRService$11`, `FakeBackupListenerImp`, `ProgressItemAdapter`, and `BRItem` exact writer blocks and their callers.
5. Continue causal tracing of global errors 8/9 from assignment to `mLastError`, `handleTaskFinish`, and `showFinishNotification`; keep item error 9 and listener codes distinct.
6. Recover the exact shell commands and outputs from the remaining prior conversations; current recovery is partial.

**Current overall status:** INCOMPLETE. No APK behavior has been dynamically tested; no device operation or runtime action was performed.
