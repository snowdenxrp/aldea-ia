# Global error 8/9 — recovered causal-chain delta — 2026-11-19

**Scope:** preserve additional conversation-recovered details about the global finish path. This is not a fresh local Smali verification and does not close the complete causal chain.

## 1. Source conditions recovered from the user's messages

In `BRService$5.startRestore()`, the user reported the following branches:

- Theme Manager package `com.android.thememanager`: sets `isRestoreTheme`; when `v8 != 0`, the branch assigns `v4=0xa` and `v16=0x8`.
- Flash Drive branch when USB is unavailable: assigns `v4=0xa` and `v16=0x9`.

Historical extraction command explicitly supplied by the user:
```sh
sed -n '960,1080p' "$F"
```

The complete output of that command is not preserved in this recovery document. The register meanings of `v4` and `v8` must not be inferred solely from these assignments.

The same conversation reports, around line 2031, the finish sequence:
- `updatePkgStae(v14)`
- `handleTaskFinish(4,12,v14,mBRItems)`
- `v14=v16=8/9`
- `v2=0xc` (12)

This is conversation-recovered line information, not LOCAL-VERIFIED.

## 2. `handleTaskFinish` and notification dispatch

The user reported the actual method body in `BRService.smali` at lines 8328–8408 and supplied this extraction command:

```sh
grep -n -A180 -B10 'handleTaskFinish' "$D/com/miui/backup/service/BRService.smali"
```

Recovered method behavior:
- Logs `state`, `workingStage`, and `errCode`.
- Calls `showFinishNotification(p1,p2,p3,p4)`.
- Calls `stopSelf()`.

The recovered finish path from `BRService$5.startRestore()` is:
`setState(4,12,0,8/9) → updatePkgStae(8/9) → handleTaskFinish(4,12,8/9,mBRItems) → showFinishNotification`.

The notification path passes the last-task extras:
- `extra_last_task_state=4`
- `extra_last_workingstage=12`
- `extra_last_errcode=8/9`
- `extra_last_britems=mBRItems`

**Important:** a separate invocation was also recovered at `BRService.smali` lines 5562–5567:
- `setState(III)` receives `p1=v1=3`, `p2=v0=12`, `p3=v2=9`.
- It then calls `handleTaskFinish(3,12,9,mBRItems)`.

Do not collapse the `(4,12,8/9)` and `(3,12,9)` invocations into one route. The shared notification/error mapping and their distinct global state arguments must be checked in the complete caller/callee blocks.

## 3. `getErrStringRes(II)` and resources

The user directly reported the call shape in `showFinishNotification`:
`invoke-static {p1, p3}, BRService->getErrStringRes(II)I`.

The method receives the global state as first argument and the error code as second argument; its `packed-switch` is on the second argument. Recovered branches:

| Error code | Switch branch | Resource ID | Public resource name | Text |
|---:|---|---|---|---|
| 8 | `:pswitch_3` | `0x7f12014b` | `err_router_disconnected` | `Check your router's connection and try again.` |
| 9 | `:pswitch_2` | `0x7f120166` | `flash_drive_connection_failed` | `USB drive disconnected` |

The user supplied these commands and outputs:

```sh
grep -n -E '0x7f12014b|0x7f120166' "$D/../res/values/public.xml"
```

```text
6868: <public type="string" name="err_router_disconnected" id="0x7f12014b" />
6895: <public type="string" name="flash_drive_connection_failed" id="0x7f120166" />
```

```sh
grep -n -A3 -B2 -E 'name="(err_router_disconnected|flash_drive_connection_failed)"' "$D/../res/values/strings.xml"
```

```xml
<string name="err_router_disconnected">"Check your router's connection and try again."</string>
<string name="flash_drive_connection_failed">USB drive disconnected</string>
```

The recovered interpretation is that the resource switch is keyed by error code 8/9, not by the first global-state argument. The user specifically reported the results for `getErrStringRes(4,8)` and `getErrStringRes(4,9)`; another call path reports state 3 with error 9. The first argument must remain explicit in every recorded invocation even though these two resource branches are selected by the second argument.

## 4. Finish title and item cleanup

Recovered user facts:
- `getFinishNotificationTitle(ZII)` compares its stage argument `p3` with 10 and 12; stage 12 follows a special route that bypasses ordinary title selection based on transfer/state.
- The notification title and error message are computed separately.
- `clearLocalFiles()` clears only `localFileList` on the `BRItem` whose `packageName="files_for_backup"`; it does not imply clearing all BRItem data or all restored files.

## 5. Status and unresolved questions

**Recovered, not locally verified:**
- Themes branch produces candidate error code 8.
- Flash Drive without USB produces candidate error code 9.
- `handleTaskFinish` logs, notifies, and stops the service.
- `getErrStringRes` maps 8/9 to the two resource IDs/texts above.
- The notification carries last task state, working stage, error code and BRItem list.

**Still open:**
1. Re-read complete `BRService$5.startRestore()` and prove the precise branch predicates and register lifetimes.
2. Re-read `setState(III)`, `setState(IIII)`, and both callers of `handleTaskFinish`; reconcile the distinct state arguments 4 and 3.
3. Re-read `updatePkgStae`, `handleTaskFinish`, `showFinishNotification`, and `getFinishNotificationTitle` as complete method bodies.
4. Establish whether there are other producers of global error 8/9 beyond the two recovered branches.
5. Preserve exact original outputs and SHA-256 hashes of the relevant Smali files from the local decoded tree.

**Overall status:** INCOMPLETE. Resource mapping is recovered; end-to-end causality is not fully closed.
