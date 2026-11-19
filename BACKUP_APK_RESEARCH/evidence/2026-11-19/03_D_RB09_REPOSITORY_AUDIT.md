# Repository antecedent audit — D-RB-09 / MIUI Backup research — 2026-11-19

**Mode:** GitHub read-only inspection.  
**Target:** private repository `snowdenxrp/-nexo-drb09-external-register`.  
**Purpose:** determine whether the prior Termux / Mi Mover / Xiaomi BackupManager work contains or preserves the missing direct Smali investigation of `Backup.apk`.

## 1. Repository metadata — directly verified

- Repository: `snowdenxrp/-nexo-drb09-external-register`.
- Visibility: PRIVATE.
- Default branch: `main`.
- Connected GitHub permission response: admin=true, maintain=true, pull=true, push=true, triage=true.
- Repository ID: `1457289233`.

These are current GitHub metadata observations, not evidence of any device state.

## 2. Complete default-branch tree — directly verified

The recursive Git tree for `main` returned `truncated=false` and 9 paths total:

- `ACCESS_REVIEW_CHECKLIST.md`
- `D-RB-09_SOURCE_RECONCILIATION.md`
- `G08_NON_OPERATIONAL_EVIDENCE_PLAN.md`
- `README.md`
- `records/`
- `records/README.md`
- `records/VALIDATION_CHECKLIST.md`
- `templates/`
- `templates/INCIDENT_RECORD_TEMPLATE.md`

The only path containing backup/MIUI/Mi Mover/Termux/G08 among these is `G08_NON_OPERATIONAL_EVIDENCE_PLAN.md`. No `Backup.apk`, Smali file, `BRService`, `MiAsistService`, or direct APK-research directory exists in this complete current default-branch tree.

This establishes absence from the current `main` tree only. It does not establish absence from deleted/unreachable Git objects, other refs, external backups, or conversation history.

## 3. Full file history — directly verified

GitHub's commit-history endpoint for `G08_NON_OPERATIONAL_EVIDENCE_PLAN.md` returned **27 commits**. The earlier recovery audit highlighted a subset of 17 commits from 14–15 November; that subset count must not be confused with the complete current file history count of 27.

The history includes the following directly relevant groups:

- 14 November: initial non-operational G-08 evidence plan and Termux backup-source qualification.
- 15 November: Android D2D target-SDK correction; Xiaomi local-backup and Mi Mover scope/privacy limits; POCO X7 Pro / HyperOS evidence limitations; Xiaomi BackupManager integration; rodin-labelled Mi Mover configuration leads; SELinux scope qualifications.
- Additional revisions include repository/schema checkpoints and review-date refreshes.

The 27 returned commit records are all associated with the history of this one file path. The detailed commit list is available through GitHub at:
`https://github.com/snowdenxrp/-nexo-drb09-external-register/commits/main/G08_NON_OPERATIONAL_EVIDENCE_PLAN.md`.

## 4. Code search limits

Four repository-scoped GitHub code searches were attempted: `BackupManager`, `MiuiBackup`, `com.miui.huanji`, and `Termux backup`. They returned no search results. GitHub code search indexing metadata is unavailable for this private repository in the current response, so these zero-result searches are **not** treated as proof of absence. The complete recursive tree and direct file history above are stronger evidence for the current main snapshot.

## 5. Technical content preserved by the antecedent

The recovered `G08_NON_OPERATIONAL_EVIDENCE_PLAN.md` is an evidence plan about Termux, Xiaomi local backup, Mi Mover, Android BackupManager integration, rodin-labelled configuration and SELinux provenance boundaries. It is not a direct reverse-engineering record of the installed `Backup.apk`.

Important distinctions preserved there:

- AOSP cloud backup, device-to-device transfer, ADB backup and Xiaomi migration are distinct paths.
- Xiaomi framework source/mirror evidence of Mi Mover lifecycle integration with Android BackupManager and a vendor MiuiBackup service does not prove the exact implementation or installed-build behavior.
- A public rodin-labelled tree has internally inconsistent build properties; it is a configuration lead, not a coherent verified stock image.
- Declarations of permissions, shared UID, service labels or SELinux mappings do not prove effective installed grants or arbitrary third-party private-data access.
- Termux private HOME migration/access remains UNKNOWN / NOT TESTED.

## 6. Recovery conclusion

**VERIFIED:** the private D-RB-09 repository preserves substantial antecedent research and a 27-commit history for its G-08 plan.

**NOT FOUND IN CURRENT MAIN TREE:** the direct `Backup.apk` Smali extraction, raw `BRService` / `MiAsistService` fragments, or the 16–19 November APK reverse-engineering transcripts.

**UNKNOWN:** whether those materials exist in another repository ref not enumerated here, local Termux storage, an external backup, or older conversation attachments.

Do not merge the antecedent G-08 conclusions into the direct `Backup.apk` code findings. Keep provenance and claim scope separate.
