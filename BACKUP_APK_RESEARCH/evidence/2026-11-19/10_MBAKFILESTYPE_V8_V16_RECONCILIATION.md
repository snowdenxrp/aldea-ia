# Reconciliation checkpoint — mBakFilesType, v8 and global errors — 2026-11-19

**Purpose:** correct the conflicting summaries without overwriting historical records.  
**Source basis:** recovery of the user's 19-November conversation messages, including the literal line-level description returned by conversation-history retrieval. The original complete Smali file was not reread in this session.  
**Classification:** RECOVERED-CHAT / HIGH-CONFIDENCE HISTORICAL; NOT LOCAL-VERIFIED.

## 1. Recovered interpretation of the task-type block — partial, not fully literal

The recovered 19-November conversation initially summarized the type block as:

- `mBakFilesType == 2` → `v8 = 1`;
- a separate `mBakFilesType == 3` branch → `mIsTransingTask`;
- `mBakFilesType == 5` → `mIsFlashDriveTask`;
- `mBakFilesType == 1` → `mIsLocalBackupTask`.

Subsequent evidence 51 section 9 recovered the user's direct Termux output for physical lines 103–186. It confirms the comparisons and destinations: type 2 → `:cond_1`/path using `v8`; type 3 → `:cond_2`/`mIsTransingTask`; type 5 → `:cond_3`/`mIsFlashDriveTask`; type 1 → `:cond_4`/`mIsLocalBackupTask`.

**Correction of provenance:** the direct output currently preserved does not include the literal instruction assigning a value to `v8`. Therefore the exact claim `v8=1` is not yet confirmed from the raw instruction; it remains a recovered interpretation (`PRIOR-ASSISTANT-OUTPUT / UNVERIFIED`) until the assignment itself is available. The direct branch evidence does not support Report A's old claim that type 2 sets `mIsTransingTask`; Report A has no verbatim Smali block recovered. Type 3 is the branch directly associated with `mIsTransingTask` in the later output.

This partially reconciles the historical reports, but does not audit the complete type-handling logic or every use of `v8`.

## 2. Recovered downstream meaning of v8 and v16

Additional user-pasted blocks from the same investigation report:

- In a separate extraction window described as physical lines 1519–1528, the loop checks `v8 != 0`, assigns `v4=0xa`, `v16=0x8`, and jumps to `:goto_3f`.
- Otherwise, it checks `mIsFlashDriveTask` and USB availability; the unavailable-USB branch begins assigning `v16=0x9`.
- Another user-pasted extraction, `sed -n '1020,1120p' "$F"`, likewise showed `v16=8` when `v8!=0`, and `v16=9` when `mIsFlashDriveTask` is true and `isUsbAvaliable()==false`.
- A further block, `sed -n '3850,3970p' "$F"`, reported that `v16!=0` suppresses the intermediate `setState(4,8,0)`; finalization then uses `v14=v16`, `v2=12`, and `setState(4,12,0,v14)`.

**Coordinate caution:** the recovered context contains more than one physical line window for the downstream checks. Do not assume these windows are from the same exact file revision or normalize their line numbers without the original command transcript and file identity.

## 3. Preserved surrounding block facts

The user's description of physical lines 1395–1418 includes:
- `StatSpeedHelper.reset()`;
- creation of `StorageMonitor(...,mBakFilesType)`;
- storage monitor start and result handling;
- `mIsAborted`;
- log `"startRestore, checked storage.isFlashDriveTask:"`;
- USB receiver registration/update/check;
- later `setState` / `handleTaskFinish` or `updateUsbRestoringItems` paths.

The exact complete source block is still required for register-lifetime verification and branch ordering.

## 4. Explicit correction to older records

Older records remain immutable for historical traceability, but their claims must now be interpreted as follows:

- The v0.1 Library index's statement that both type 2 and type 3 activate `mIsTransingTask` is superseded by this reconciliation.
- The prior Recovery Audit's “UNKNOWN / RECONCILIATION REQUIRED” is now narrowed: the conversation-recovered mapping is resolved, while local byte-level verification remains pending.
- The direct branch evidence in evidence 51 confirms type 2 reaches the `v8` path and type 3 reaches `mIsTransingTask`; the literal assignment `v8=1` is not present in the preserved excerpt.
- Do not describe type 2 as the transfer flag on the basis of Report A. Its downstream role in the Themes/error-8 path remains conditional on recovering the exact `v8` assignment and complete register flow.

## 5. Updated causal hypothesis for global errors 8/9

The combined recovered chain is now:

- `mBakFilesType==2` → branch using `v8` (direct branch output) → downstream `v8!=0` → candidate global error `v16=8`; the intermediate assignment/value of `v8` is not yet source-literal confirmed.
- `mBakFilesType==5` → `mIsFlashDriveTask=true`; if USB unavailable → candidate global error `v16=9`.
- Both nonzero values flow to final stage 12: `v14=v16`, `v2=12`, then `setState(4,12,0,v14)`, followed by `handleTaskFinish(4,12,v14,mBRItems)`.

This is a coherent recovered causal chain, but it remains **RECOVERED-CHAT / NOT LOCAL-VERIFIED** until the exact `BRService$5.smali` blocks and `setState(IIII)` body are read together. Do not elevate it to a final implementation conclusion yet.

## 6. SHA-256 provenance note

A later recovery message reports this APK SHA-256:

`36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae`

The reported provenance is a conversation dated 16-November-2026 and a reported `IDENTICAL` comparison between `/product/priv-app/Backup/Backup.apk` and `$HOME/Backup.apk`. It was not recalculated from device bytes in this session. The v0.1 Library index's earlier “hash not recovered” statement reflects its earlier cutoff and is superseded only as a recovered-chat fact, not as a current-device verification.

## 7. Remaining proof obligations

1. Read the exact `BRService$5.smali` file at the current Termux checkout and record its SHA-256 before interpreting offsets.
2. Re-extract the type-classification block with enough context to capture every comparison and assignment.
3. Re-extract the complete `v8` consumer and `v16=8/9` branches; identify exact method descriptors and physical file lines.
4. Re-read `setState(IIII)`, `updatePkgStae`, `handleTaskFinish` and notification extras as one caller/callee chain.
5. Recalculate the APK SHA-256 only if the exact original/copy bytes are available and the user authorizes the read-only check.

**Status:** task-type branches partially reconciled from direct-chat output; literal `v8` assignment and global 8/9 causal chain remain conditional; local source verification still OPEN.
