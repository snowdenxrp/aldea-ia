# Complete branch-tree audit — snowdenxrp/aldea-ia — 2026-11-19

**Mode:** GitHub read-only; recursive Git trees for all branch refs returned by the repository branches endpoint.  
**Repository:** `snowdenxrp/aldea-ia`.  
**Purpose:** determine whether any pre-existing branch contains a direct MIUI Backup.apk / Smali research archive missed by the earlier branch-name and default-branch searches.

## 1. Coverage

- Branch endpoint pagination: page 1 returned 100 branches; page 2 returned 34.
- Total branches enumerated: **134**.
- Recursive tree queried for each branch tip commit SHA.
- Every inspected tree returned `truncated=false`.
- Path filter (case-insensitive): `backup|miui|mover|termux|BRService|MiAsist|ProgressItemAdapter|BRItem|apk`.

The newly created `backup-apk-static-research-2026-11-19` branch is included in the 134-branch enumeration and contains the new research dossier.

## 2. Results across pre-existing branches

No pre-existing branch tree exposed a path for:
- `Backup.apk` or an APK research directory;
- `BRService` / `BRService$5` / `BRService$11`;
- `MiAsistService`;
- `ProgressItemAdapter`;
- `BRItem`;
- MIUI / Mi Mover-specific Smali evidence.

The path filter did produce unrelated/general matches:
- `docs/nexo/AB104.450_BACKUP_ESCROW_DISASTER_THRESHOLD_RECOVERY_2026-09-26.md`
- `docs/nexo/AB104.450_THRESHOLD_BACKUP_ESCROW_DISASTER_RECOVERY_2026-09-26.md`
These are Nexo escrow-recovery documents, not Xiaomi Backup.apk research.

Several NCS-related branches also contain Termux filesystem/inspection documents under `NEXO_NCS/BUILD` and handoffs. These are NCS platform research and do not contain the direct MIUI Smali investigation.

## 3. Conclusion

**VERIFIED FOR THE ENUMERATED CURRENT REFS:** the 134 branch-tip trees were inspected without truncation. No pre-existing branch contains a path-level archive of the direct MIUI Backup.apk reverse-engineering work.

This is stronger than checking branch names or `main` alone, but it is still a path/tree audit. It does not prove absence from:
- unreachable/deleted Git objects not referenced by the current branches;
- commit history objects not represented in branch-tip trees;
- GitHub gists, releases, issues, PR comments, or Actions artifacts;
- other repositories not in the known owner inventory;
- local Termux storage, device backups, or prior conversation attachments.

## 4. Scope protection

Only the dedicated research branch was created/updated. No existing branch was modified, no NCS branch was changed, and `main` was not modified.

**Status:** complete branch-tip tree coverage; no direct Smali archive found in pre-existing branch tips. Historical commit-object and non-tree surfaces remain separate recovery targets.
