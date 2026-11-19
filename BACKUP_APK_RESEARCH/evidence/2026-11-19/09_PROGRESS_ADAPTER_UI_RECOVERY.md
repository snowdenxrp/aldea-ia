# ProgressItemAdapter — state counting and UI recovery — 2026-11-19

**Source basis:** user-provided extraction ranges and recovered conversation context from 18–19 November 2026.  
**Classification:** DIRECT-CHAT / RECOVERED-HISTORICAL. No local source file was reread in this session.

## 1. File and ranges

File:
`$HOME/backup-static/decoded/smali/com/miui/backup/activity/ProgressPageFragmentBase$ProgressItemAdapter.smali`

Ranges reported as inspected:
- 445–495
- 550–600
- 869–1207
- 1350–1400
- 1450–1570
- 1875–2060
- 2061–2420
- 2421–2600

The exact original output is not fully preserved in this record.

## 2. State writes and callback semantics

Recovered user facts:

- `itemStart()`: writes `BRItem.state=2` (around physical lines 863–869; another extracted source reference identified line 866).
- `setItemsAborted()`: writes `state=3`, `error=9` (around lines 877–883; another source reference identified line 879).
- `workingItemError()`: writes `state=3`, `error=p3` (around lines 956–960; another source reference identified line 958).
- `workingItemFinished()`: completion can normalize `state=2` to `state=1`; if `error==0`, it also forces `state=1` (around lines 909–929; source references 915/923).
- The adapter contains no literal writes to `state=7` or `state=8` in the inspected ranges.

## 3. Counts and completion model

Recovered user-provided findings from the 19 November inspection:

- `getSuccessfulCount` counts BRItems with `state=1` or `state=6`.
- `getFailedCount` is calculated as total count minus successful count.
- `initData` treats `state=1`, `state=3`, and `state=6` as completed/final states; it increments the success count for `state=1` and `state=6`.
- Earlier adapter analysis reported states `1`, `3`, and `6` in the finalized/failed count logic.
- State 6 is treated as successful by the adapter's success-count path. Its full producer and semantic distinction from ordinary state 1 must be read in the service code (including the `files_for_backup` transfer path).

## 4. State 7/8 distinction

Do not infer BRItem state from a numeric code appearing elsewhere:

- `onCustomProgressChange` updates `progType`, sizes and progress; it does not modify `BRItem.state` in the inspected callback.
- Listener input values 7/8 can map into `BRItem.error` or `progType`; they are not automatically UI states 7/8.
- The adapter's inspected ranges contained no literal assignments to `state=7/8`.
- The absence claim is bounded to the adapter and the exact inspected ranges.

## 5. Unresolved details

The recovered conversation context did not preserve a complete, reliable mapping of every state (especially 0, 2, 4 and 6) to every UI icon/label. Do not invent that mapping.

Next checks:
1. Re-read `getSuccessfulCount`, `getFailedCount`, `initData`, and the view-binding/render method bodies.
2. Recover the exact UI branch for each state and the associated resource/icon.
3. Trace all producers of state 6, especially `BRService$5`'s `files_for_backup` transfer flow.
4. Keep `state`, `error`, `progType`, and global `workingStage` separate.

**Status:** PARTIAL. The count semantics are recovered; complete UI mapping and state-6 provenance remain open.
