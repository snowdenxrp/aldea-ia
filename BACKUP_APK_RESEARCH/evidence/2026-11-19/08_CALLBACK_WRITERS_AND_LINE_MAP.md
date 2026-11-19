# Callback writers and Smali line-coordinate reconciliation — 2026-11-19

**Source basis:** user-pasted grep/sed output and recovered prior conversation details from 18–19 November 2026.  
**Classification:** DIRECT-CHAT / RECOVERED-HISTORICAL; no current local file read.

## 1. Critical line-number distinction

The investigation used two different coordinate systems:

1. **Physical file line** — the line number emitted by `grep -n` or used by `sed -n`.
2. **Smali source/debug line** — the numeric value in a `.line N` directive, corresponding to the original source/debug mapping.

These numbers are not interchangeable. The recovered context explicitly identifies the FakeBackupListenerImp mappings below as physical file line ↔ `.line` debug line:

| Class | Physical file line | Smali `.line` value | Recovered write |
|---|---:|---:|---|
| `BRService$FakeBackupListenerImp` | 1455 | 5719 | `BRItem.state=2` |
| `BRService$FakeBackupListenerImp` | 1753 | 5834 | `BRItem.state=3` |
| `BRService$FakeBackupListenerImp` | 1273 | 5921 | `BRItem.state=1` |

Therefore, the earlier index entries that listed 5719/5834/5921 without saying they are `.line` values were ambiguous. Do not use those numbers as physical file positions. The exact physical locations are 1455, 1753 and 1273 respectively.

## 2. `BRService$11.smali` callbacks

The user pasted the physical file ranges:
- `sed -n '870,970p'`
- `sed -n '1090,1250p'`

Recovered callback behavior:

- `onBackupStart` and `onRestoreStart`: assign `BRItem.state=2` and call `notifyItemTaskStart`.
- `onCustomProgressChange(String,int,int,long,long)`: updates `progType`, sizes/progress and notifies; it does not write `state` in the inspected block.
- `onError(String,int,int)`: starts from `state=3`, translates listener argument `p3` into `BRItem.error`, then calls `notifyItemTaskError`.
- `onError` retries without notifying if `mState==3`, `error==7`, and `retryCount<1`.
- Completion callbacks call `notifyItemTaskEnd`.

Recovered listener-to-item-error mapping:

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

The grep output in a separate message reported physical `BRItem.state` write positions in `BRService$11.smali`: 766, 863, 1141, 1589 and 1754. These are physical file positions, not necessarily `.line` debug values. Their method contexts were not all re-established in this recovery.

## 3. `BRService$FakeBackupListenerImp` callbacks

The user pasted physical ranges:
- `sed -n '1215,1310p'`
- `sed -n '1715,1815p'`

Recovered behavior:

- `onBackupEnd`: a conditional branch checks `!aborted && !encrypt && error==7 && retryCount<1` and returns without normal completion in that branch. If `error==0`, the callback assigns `BRItem.state=1`; nonzero error preserves the existing state in the described branch.
- Another callback/result path assigns `state=3` and translates `p3` into `BRItem.error`.
- `notifyItemTaskEnd()` and possibly `notifyItemTaskError()` are called in the completion paths.
- The range 1715–1815 was reported to contain a callback/result path with `state=3`; its error mapping includes `p3=6 → error=7` and `p3=8 → error=6`. The `p3=2` branch was truncated in the recovered summary and remains unresolved.

The separate user-provided grep output reported physical `BRItem.state` writes in `BRService$FakeBackupListenerImp.smali` at 1273, 1455 and 1753. The prior assistant's correlation with `.line` values is recorded in §1.

## 4. `ProgressItemAdapter.smali` exact ranges

The user pasted the following code ranges and assignments:

- `itemStart()`, lines 863–869: `state=2`.
- `setItemsAborted()`, lines 877–883: `state=3`, `error=9`.
- Error callback, lines 956–960: `state=3`, `error=p3`.
- Completion, lines 909–929: converts `state=2` or `error=0` to `state=1`.

These are physical line ranges from the pasted `sed` output, not necessarily Smali `.line` values.

## 5. Search scope and a known command mistake

The user supplied this global search command:

```sh
grep -R -n 'BRItem;->state:I' "$D/com/miui/backup"
```

Recovered output locations included:
- `BRService$11.smali`: 766, 863, 1141, 1589, 1754.
- `BRService$FakeBackupListenerImp.smali`: 1273, 1455, 1753.
- `BRItem.smali`: 371, 582.

The user also recorded a command-path mistake: the intended assignment to `F` was malformed as `="$D/..." `, so the subsequent grep continued against the prior `ProgressItemAdapter` target rather than `BRService$5`. The intended command was:

```sh
F="$D/com/miui/backup/service/BRService\$5.smali"
grep -n -B 12 -A 8 'iput .*BRItem;->state:I' "$F"
```

The search result from the wrong target must not be attributed to `BRService$5`. The later line inventory for `BRService$5` is separately preserved in `02_CHAT_RECOVERY_DELTA.md`.

## 6. Bounded conclusions

- The recovered callbacks explain item states 1, 2 and 3, and distinguish listener error codes from item state.
- A retry condition involving `error=7` does not mean `BRItem.state=7`.
- The reported negative search for direct state 7/8 writes is bounded to the searched files/ranges. Do not claim global absence across the APK.
- The apparent large line numbers 5719/5834/5921 in FakeBackupListenerImp are Smali `.line` values, while 1273/1455/1753 are physical file lines. Keep both coordinate systems explicit.

**Status:** INCOMPLETE. Full raw callback blocks, remaining branches (including `p3=2`), and current file hashes still need preservation.
