# Cross-repository commit-history and GitHub surface audit — 2026-11-19

**Scope:** repositories accessible to the connected GitHub account for owner `snowdenxrp`, commit-message search, and selected repository surfaces. Read-only.

## 1. Accessible repository inventory

The connected GitHub repository listing returned exactly four owner repositories:

1. `snowdenxrp/aldea-ia` — public, default branch `main`.
2. `snowdenxrp/manual-supervivencia-nuclear` — private, default branch `main`.
3. `snowdenxrp/nexo-grand-mission-01` — private, default branch `main`.
4. `snowdenxrp/-nexo-drb09-external-register` — private, default branch `main`.

The three other repositories' branch-tip trees had already been inspected in evidence record 04; no direct MIUI Backup.apk/Smali path was found. The external-register tree preserves the G-08 Termux/Xiaomi migration research but no direct Smali files.

## 2. Owner-scoped commit-message search

GitHub commit searches scoped to owner `snowdenxrp`:

| Query | Results |
|---|---:|
| `Backup.apk` | 0 |
| `BRService` | 0 |
| `MiAsistService` | 0 |
| `MIUI` | 0 |
| `backup` | 12 |
| `Termux` | 3 |

The three `Termux` hits are all in `-nexo-drb09-external-register` and modify only `G08_NON_OPERATIONAL_EVIDENCE_PLAN.md`:

- `f4c7eef4eb190d3ab9f281cb197e923fb7c706a6` — adds the source-level Termux backup finding.
- `ac5c96712025ff9220c41ab04faa30403b3e508e` — qualifies the G-08 conclusion without closing A-03.
- `998e19275b5addb0089a2975d046059f450ff142` — adds target-SDK 28 / Android 12 D2D compatibility analysis.

The patches were fetched and inspected. They concern Termux backup threat modeling, not the MIUI Backup.apk Smali reverse-engineering project. They preserve an important antecedent: Termux v0.119.0-beta.3 / versionCode 1022, targetSdkVersion 28, allowBackup=false; Xiaomi local backup/restore of Termux private HOME remains UNKNOWN / NOT TESTED. This is contextual research only and must not be mixed with direct Backup.apk evidence.

## 3. Code search

Owner-scoped GitHub code searches for:
- `BRService$FakeBackupListenerImp`
- `files_for_backup waitingForFilesTransingEnd`
- `mBakFilesType`
- `err_router_disconnected`
- `MiAsistService`

returned zero results. These searches do not prove absence from unindexed/private code; the repository inventory reports code search indexed only for public `aldea-ia`, while the three private repositories are not indexed.

## 4. Pull requests, issues, releases

The first page of `aldea-ia` pull requests/issues was inspected. The visible NCS PRs #110 and #111 and unrelated Nexo/Lúmina work are not MIUI research. No MIUI/Backup.apk-specific PR surfaced in the returned first page. Releases endpoint returned zero releases.

The issues endpoint included pull requests and returned a first page of 100 entries; this is not an exhaustive paginated issue audit. No MIUI/Backup.apk-specific issue appeared in that page.

User gists could not be enumerated through the available GitHub fetch surface in this pass. Gists therefore remain NOT AUDITED, not absent.

## 5. Bounded conclusion

Across all four currently accessible owner repositories, the branch-tree audits, owner-scoped commit-message searches, and code-search attempts reveal no direct MIUI Backup.apk Smali archive. The external-register repository does preserve related Termux/Xiaomi backup threat research. This is not proof of absence from gists, unreferenced Git objects, deleted refs, private/unindexed content, local device storage, chat attachments, or other accounts.

**No repository other than the dedicated research branch was modified. No NCS PR, branch, issue, or source was changed.**
