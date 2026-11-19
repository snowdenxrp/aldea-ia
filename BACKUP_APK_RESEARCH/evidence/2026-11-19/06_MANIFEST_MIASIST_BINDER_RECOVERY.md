# APK manifest, MiAsistService and Binder recovery — 2026-11-19

**Sources:** user-provided findings recovered from prior conversations dated 16–17 November 2026.  
**Classification:** DIRECT-CHAT / RECOVERED-HISTORICAL. No APK or Smali bytes were reread in this session.

## 1. APK identity and manifest facts

Recovered from the user's earlier acquisition/manifest inspection:

- Package: `com.miui.backup`.
- Decoded directory: `$HOME/backup-static/decoded`.
- Manifest declares `sharedUserId="android.uid.backup"`.
- Manifest declares `android:allowBackup="false"`.
- Manifest permission declarations include:
  - `android.permission.BACKUP`
  - `android.permission.INSTALL_PACKAGES`
  - `android.permission.MANAGE_EXTERNAL_STORAGE`
  - `android.permission.INTERACT_ACROSS_USERS_FULL`
- Manifest declares:
  - `miui.permission.BACKUP_PROXY`
  - `miui.permission.BACKUP_FILE_SERVER`
  as `signatureOrSystem`.
- `MiAsistService`, `BRService`, and `TransFileService` were reported with `android:exported="false"`.
- `MiAsistService` uses process `:remote` and action `miui.intent.action.MIASIST_PROXY`.
- `ApkInstallReceiver` and `AiActionProvider` were reported exported; provider authority `com.miui.backup`.

**Security interpretation boundary:** manifest declarations and `sharedUserId` metadata are not proof of the installed package's effective grants, runtime UID, caller reachability, or authorization decisions. `android:allowBackup="false"` is an application-level declaration and must not be mistaken for the vendor's internal backup/restore service behavior.

## 2. MiAsistService validation and task dispatch

Recovered user-provided findings:

- `isActionParamsValid` reads extras `mimover_action` and `client_port`.
- Accepted action strings were reported as `mi_backup` and `mi_restore`.
- Accepted client ports were reported as 57447–57449.
- `isOwnerSpace()` was reported to return `true` unconditionally in the inspected implementation.

A user message on 16 November reported:
- `MiAsistService.startRestoreCommand()` around line 838 calls `BRService.startRestoreCommand(...,null,null,null,4)`, then `bindBRService()`.
- `BRService.startRestoreCommand` adds `CMD_RESTORE` and extras:
  - `extra_descriptor`
  - `extra_descriptor_dir`
  - `extra_britems`
  - `extra_zip_file_path`
  - `extra_is_from_miasist`
  - `extra_bakfiles_type`
- The call to `startService` was reported around line 1105.

Other recovered line references from 16–17 November:
- `MiAsistService.smali:2939–2942` calls `BRService.startRestoreCommand(...,4)`.
- `MiAsistService.smali:2862–2865` calls `BRService.startBackupCommand(...)`.
- `MiAsistService.bindBRService()` around lines 675–707 creates an explicit Intent to `BRService`, adds `extra_is_from_miasist=true`, and calls `startService()` and `bindService()`.
- `MiAsistService$2.smali:38–106` handles Binder connection via `IBRService$Stub.asInterface`, stores the interface, registers the listener, and clears the interface on disconnection.
- `MiAsistService.smali:1600–1620` calls `IBRService.getBRItems()`.

**Line-anchor discrepancy:** the recovered context contains both line 838 and lines 2939–2942 for restore-command call paths. They may refer to different overloads/classes or extraction revisions. Do not normalize these into one line location without identifying the exact file and method descriptor.

## 3. BRService command handling

Recovered user-provided details:

- Literal action string: `com.miui.backup.service.BRService.CMD_RESTORE`.
- `BRService.onStartCommand` around line 19067 processes `CMD_RESTORE`; the relevant dispatch was reported around lines 901–907.
- It reads `extra_is_from_miasist`, backup-file type, `extra_britems`, descriptor and `extra_descriptor_dir`.
- `BRService.smali` references `startRestoreCommand` around lines 13409 and 14953–15220; one overload/implementation around line 15215 was reported to recurse to another overload.
- `BRService.onBind` around line 18672.
- `Binder.clearCallingIdentity()` around line 7380.
- `RetransferUtils.smali:154` was reported to call `restoreTransfering...`; full target method and caller context remain to be recovered.
- The user reported `BRService.smali` file size 522,862 bytes, `MiAsistService.smali` 111,571 bytes, and `ProgressPageFragmentBase$6.smali` 10,958 bytes on 17 November. These are historical sizes, not current hashes.

## 4. Binder interface

The user recovered 14 `IBRService$Stub` transaction IDs:

| ID | Method |
|---:|---|
| 1 | `getBakFilesType` |
| 2 | `getState` |
| 3 | `getWorkingStage` |
| 4 | `getLastErrCode` |
| 5 | `getBRItems` |
| 6 | `abortBackupAndRestore` |
| 7 | `registerBRListener` |
| 8 | `unregisterBRListener` |
| 9 | `getTransinRemainingTime` |
| 10 | `getTransingUsedTime` |
| 11 | `getTransingTotalSize` |
| 12 | `forceClose` |
| 13 | `pause` |
| 14 | `getZipPath` |

The transaction list describes the Binder API surface. It does not by itself prove which callers can acquire the Binder, whether an external app can invoke it, or what authorization checks are enforced.

## 5. Required next checks

1. Recover exact manifest lines 107–113 and all relevant service/receiver/provider declarations from the original decoded manifest.
2. Identify exact file/method descriptors for the line-838 and line-2939 restore-command paths.
3. Recover full bodies for `isActionParamsValid`, `isOwnerSpace`, `startRestoreCommand` overloads, `onStartCommand`, `onBind`, and the Binder `onTransact` implementation.
4. Trace who can send `miui.intent.action.MIASIST_PROXY`, who starts/binds `MiAsistService`, and whether caller identity/permissions are checked before dispatch.
5. Trace `RetransferUtils` to its target service and relate it to `BRService$5` transfer branches.
6. Keep manifest declarations, effective runtime grants, UID assignment, Binder reachability and authorization as separate evidence questions.

**Status:** INCOMPLETE. These details are recovered from prior user messages; exact source blocks and hashes remain outstanding.
