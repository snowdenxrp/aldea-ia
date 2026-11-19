# GitHub continuity and surface correction — branch divergence, tags and gists — 2026-11-19

**Mode:** read-only audit plus documentary preservation on the dedicated research branch.

## 1. Current refs and divergence

- `main` HEAD: `9e670885d0a183cd59541e9590c4cd1fb4ebb757`.
- `backup-apk-static-research-2026-11-19` HEAD after this audit's evidence updates: recorded in the branch ref; verify live before relying on this document as a current pointer.
- Compare `main...backup-apk-static-research-2026-11-19`: `diverged`, research branch **48 ahead**, **3 behind**.

The three commits reachable from `main` but not from the research branch are:

| Commit | Message |
|---|---|
| `c511fdbcd23a694711a1d5f97097178adbfdd0ee` | docs(backup-apk): restore direct-chat mapping provenance |
| `9b7141d6defa646ca747a0d1730ff0bb851e15ba` | docs(backup-apk): correct master provenance status |
| `9e670885d0a183cd59541e9590c4cd1fb4ebb757` | docs(backup-apk): verify 27-commit D-RB09 file history |

Those commits added the evidence-21 file, updated the master index on `main`, and added the evidence-22 file. The exact same evidence-21 and evidence-22 file contents were then recreated on the research branch; the index on the research branch records their restoration and explicitly leaves the three `main` commits unintegrated.

**No merge, reset, rebase, cherry-pick, force push, or `main` update was performed.** Preserve the divergence until an explicit reconciliation decision.

## 2. Tags

GitHub `git/matching-refs/tags/` for `snowdenxrp/aldea-ia` returned an empty array. The alternate `/git/refs/tags` endpoint returned 404. The supported matching-refs result is the usable observation: **no tag refs were returned for this repository at audit time**.

This is not a statement about tags in the other owner repositories.

## 3. Gists

The available GitHub fetch connector rejected the public user-gists endpoint as outside its allowed URL surface. Gists remain **NOT AUDITED**. Do not infer absence.

## 4. Research branch contents

The research branch now contains evidence records 01–23 plus the master index and workflow. Evidence 21 and 22 are present on the research branch with the same blob SHAs as their original copies on `main`; evidence 23 records the corrected provenance hierarchy and supersedes the overstatements in 21.

## 5. Safe conclusion

- Research branch is intact and contains the complete documentary dossier currently recovered.
- `main` has exactly three commits not present in the research branch; all three are documentary commits related to this research dossier, not NCS source changes.
- Branch divergence is real and intentionally unresolved.
- `aldea-ia` tag refs: none returned.
- User gists: not audited.
- No device, APK, Smali source, NCS source, PR, workflow, or private D-RB-09 repository was modified in this audit.