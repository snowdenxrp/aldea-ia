# Callback state semantics — FakeBackupListenerImp / BRService$11 / ProgressItemAdapter — 2026-11-19

**Source basis:** exact ranges reported as pasted by the user on 19-November, plus recovered line-level conversation facts.  
**Classification:** DIRECT-CHAT / RECOVERED-HISTORICAL. The local Termux files were not accessible to this assistant session; no fresh file read or hash was performed.

## 1. Coordinate system — do not conflate

For `BRService$FakeBackupListenerImp.smali`, the recovered grep inventory gives physical file lines and corresponding Smali `.line` directives:

| Physical line | Smali `.line` | Field write |
|---:|---:|---|
| 1273 | 5921 | `BRItem.state = v3`, with `v3=1` |
| 1455 | 5719 | `BRItem.state = v0`, with `v0=2` |
| 1753 | 5834 | `BRItem.state = v0`, with `v0=3` |

The values 5719/5834/5921 are debug/source line directives, not physical positions. Use physical positions for `sed`.

## 2. FakeBackupListenerImp — backup completion callback

The user pasted physical lines 1215–1310. Recovered exact anchors:

- At `.line 5897`, the method initializes `v2=7` and `v3=1`.
- The callback has a retry/early-return condition described as `!aborted && !encrypt && error==7 && retryCount<1`.
- At physical line 1273 / `.line 5921`, the `:cond_4` path writes `iput v3, v0, BRItem.state`.
- At physical line 1274 / `.line 5922`, it writes `v4` to `BRItem.progType`.
- The normal completion path is reported to call `notifyItemTaskEnd()`.
- Recovered branch summary: if `error==0`, state becomes 1; a nonzero error preserves the existing state in the described branch.

**Bounded interpretation:** this callback uses state 1 as a successful completion value. The retry gate's numeric 7 is an error/retry condition, not a state assignment. The full branch conditions and all paths around `:cond_4` should be reread before making stronger claims.

## 3. FakeBackupListenerImp — restore/error result callback

The user pasted physical lines 1715–1815. Recovered exact anchors:

- At physical line 1753 / `.line 5834`, the method writes `v0=3` to `BRItem.state`.
- The callback then translates its input `p3` into `BRItem.error`.
- Confirmed mapping in the recovered block:
  - `p3=6` → `BRItem.error=7` (register `v3=0x7`).
  - `p3=8` → `BRItem.error=6` (register `v2=0x6`).
- The `p3=2` branch was truncated in the recovered summary and remains unresolved.

**Bounded interpretation:** this callback sets the item state to 3 before translating the listener error. Values 6 and 8 are listener inputs mapped to item-error values 7 and 6; neither is a demonstrated `BRItem.state` value.

## 4. BRService$11 callback cross-check

Recovered user-pasted ranges: physical lines 870–970 and 1090–1250.

- `onBackupStart` and `onRestoreStart`: `BRItem.state=2`, then `notifyItemTaskStart`.
- `onCustomProgressChange(String,int,int,long,long)`: updates `progType`, size/progress fields and notifications; no state write was observed in that inspected block.
- `onError(String,int,int)`: sets state 3, maps listener `p3` to `BRItem.error`, then notifies error.
- Retry condition: `mState==3 && error==7 && retryCount<1`; in that branch it retries without the ordinary error notification.
- Completion callbacks call `notifyItemTaskEnd`.

Recovered listener-to-`BRItem.error` map:

| Listener p3 | BRItem.error |
|---:|---:|
| 0 | 0 |
| 3 | 2 |
| 4 | 5 |
| 5 | 6 |
| 6 | 7 |
| 8 | 6 |
| 9 | 11 |
| other | 1 |

This table maps a callback parameter into the error field. It is not a state map.

## 5. ProgressItemAdapter — UI completion/count semantics

Recovered inspected physical ranges include 863–883, 909–960 and 445–495, 550–600, 869–1207, 1350–1400, 1450–1570, 1875–2060, 2061–2420, 2421–2600.

- `itemStart()`: state 2.
- `setItemsAborted()`: state 3, error 9.
- `workingItemError()`: state 3, error `p3`.
- `workingItemFinished()`: may normalize state 2 to 1; if error is zero, forces state 1.
- `getSuccessfulCount`: counts states 1 and 6.
- `getFailedCount`: total minus successful.
- `initData`: treats states 1, 3 and 6 as terminal/completed; increments success for 1 and 6.

**Strong conclusion from the recovered adapter logic:** state 6 is a success state for UI/counting purposes, distinct from ordinary state 1 at least at the data level. Its semantic distinction remains to be established from all producers and render branches.

## 6. Reconciliation issue — state 6 coordinate systems

The apparent conflict between physical line 2351 and line 1735 is a coordinate-system mix-up, not two physical-line anchors:

- Physical file line **2351** in `BRService$5.smali` is the write `iput v3, ..., BRItem;->state:I` with `v3=0x6`.
- The same instruction is associated with Smali debug/source directive **`.line 1735`**.
- The surrounding source context is `.line 1733` `waitingForFilesTransingEnd()`, `.line 1734` reads `BRItem.state`, loads `const/4 v3, 0x6`, and branches `if-eq v0, v3, :cond_39`; `.line 1735` performs the write when the existing state is not already 6.

Therefore physical line 2351 and `.line 1735` refer to the same state-6 write in the same reported `BRService$5.smali` extraction. Do not treat 1735 as a physical line or as a second producer. The evidence is direct-chat recovered, not a fresh local read/hash in this session.

## 7. Consolidated state/error distinction

| Layer | Example | Meaning established here |
|---|---|---|
| `BRItem.state` | 1, 2, 3, 6 | UI/item lifecycle state; 1/6 count as success, 3 as terminal failure, 2 as in progress |
| `BRItem.error` | 6, 7, 9, 11 | Item-level error code; may be mapped from listener parameter |
| Listener callback `p3` | 6, 8 | Input code translated into `BRItem.error` |
| Global service state/stage | `mState`, `mWorkingStage` | Service-wide lifecycle, separate from item state |
| Global last error | `mLastError` | Service-level error used by finish notification |

Do not infer state 7 or 8 from error/retry inputs 7/8. The recovered direct-write inventory in FakeBackupListenerImp shows only states 1, 2 and 3; the adapter ranges also show no literal state 7/8 writes. These negative findings are limited to the searched classes/ranges.

## 8. Next verification targets

1. Re-read exact physical lines 1215–1310 and 1715–1815 from the current local `BRService$FakeBackupListenerImp.smali`; capture complete method descriptors and all labels.
2. Resolve the truncated `p3=2` branch in the state-3 callback.
3. Re-read `BRService$11` callback bodies and confirm the retry gate and mapping.
4. Re-read `ProgressItemAdapter` render/bind methods to map state 1/2/3/6 to exact labels/icons.
5. Preserve the distinction physical line 2351 vs Smali `.line 1735`; they identify the same reported write. A fresh local/hash check remains a separate verification step.
6. Search every Smali dex directory for writes to `BRItem.state`, including indirect writes through reflection/parcel/copy paths, while preserving the exact search scope.

**Status:** callback semantics partially recovered; state 6 is successful in adapter counts; the apparent coordinate conflict is resolved as physical line 2351 / `.line 1735` for the same producer. Full UI mapping and complete raw callback blocks remain pending. No runtime operation performed.
