# Finish notification pipeline — additional exact caller/argument evidence — 2026-11-19

**Source basis:** user-pasted terminal excerpts and recovered conversation facts dated 19-November-2026.
**Classification:** DIRECT-CHAT / PARTIAL METHOD OUTPUT; complete notification methods are not preserved verbatim.

## 1. handleTaskFinish(IIILjava/util/ArrayList;)V

User command:

```sh
grep -n -A180 -B10 'handleTaskFinish' "$D/com/miui/backup/service/BRService.smali"
```

Recovered exact physical range: BRService.smali:8328–8408.

Recovered method behavior:
- Logs p1 as state, p2 as working stage, and p3 as error code.
- If mIsTransingTask, deletes saved transfer progress.
- Performs cleanup for three app directories (Recorder, WeChat and QQ) in the recovered method.
- Calls showFinishNotification(p1,p2,p3,p4).
- Calls stopSelf().

The raw method output after physical line 8408 was not recovered. Do not claim that every cleanup side effect or branch is fully enumerated.

## 2. Notification extras

User-pasted showFinishNotification output begins around physical line 14394. The recovered fragment shows:

| Intent extra | Value |
|---|---|
| extra_last_task_state | p1 |
| extra_last_workingstage | p2 |
| extra_last_errcode | p3 |
| extra_title | v1 |
| extra_last_britems | p4, after clearLocalFiles |

The notification uses resource/notification identifier 0x7f120037 in the recovered fragment.

The complete method start, middle and all branches are not present in the recovered transcript. The extras above are supported by the returned fragment; other behavior remains open.

## 3. getErrStringRes(II)I — argument semantics

Recovered call in showFinishNotification:

```smali
invoke-static {p1, p3}, Lcom/miui/backup/service/BRService;->getErrStringRes(II)I
```

The helper's packed-switch p1 uses the second method parameter (Dalvik parameter register p1 for a static two-argument method). Thus:
- first argument: task/global state from showFinishNotification's p1;
- second argument: error code from showFinishNotification's p3.

Recovered error branches:

| Error code | Branch | Resource ID | Resource name | Message |
|---:|---|---|---|---|
| 8 | :pswitch_3 | 0x7f12014b | err_router_disconnected | Check your router's connection and try again. |
| 9 | :pswitch_2 | 0x7f120166 | flash_drive_connection_failed | USB drive disconnected |

The exact public-resource and strings.xml command outputs are preserved in evidence 05.

## 4. Do not collapse two distinct stage-12 invocations

Two recovered caller paths both reach handleTaskFinish, but they have different global state arguments:

### Path A — restore-thread finalization

setState(4,12,0,8/9) → updatePkgStae(8/9) → handleTaskFinish(4,12,8/9,mBRItems).

This is the Theme/USB error route recovered from BRService$5.

### Path B — separate service caller

A distinct direct user-pasted invocation at BRService.smali:5562–5567 was recovered as:
- setState(III) arguments: p1=v1=3, p2=v0=12, p3=v2=9;
- then handleTaskFinish(3,12,9,mBRItems).

These are not the same route. Preserve the distinct first argument (4 vs 3) even though both carry stage 12 and error 9. Their shared error resource mapping does not make their caller semantics identical.

## 5. clearLocalFiles scope

The recovered clearLocalFiles() behavior clears localFileList only on the BRItem whose packageName is files_for_backup. It does not establish that the entire BRItem list, all restored files, or all item metadata are cleared.

## 6. Status

**Recovered with direct-chat support:**
- handleTaskFinish logs, delegates to notification, then stops the service.
- Notification extras carry task state, stage, error and item list.
- getErrStringRes selects messages from its second argument (error code).
- Global error 8 and 9 map to the recovered router/USB strings.
- There are at least two distinct stage-12 caller paths: (4,12,8/9) and (3,12,9).

**Still open:**
- Complete showFinishNotification body.
- Complete getFinishNotificationTitle(ZII) body and title conditions.
- Complete getErrStringRes(II) body and every switch branch.
- All callers of handleTaskFinish and all producers of global errors 8/9.
- Local byte-level verification of the methods and their file SHA-256 values.

**No runtime or device operations performed.**