# GitHub PR, Actions and release surface audit — 2026-11-19

**Scope:** read-only audit of selected GitHub surfaces for the four accessible owner repositories.  
**Purpose:** determine whether the direct MIUI Backup.apk/Smali work survived in pull requests, workflow artifacts, or releases.

## 1. Pull requests

Owner-scoped pull-request searches for `MIUI`, `Backup.apk`, `BRService`, `Xiaomi`, `Termux`, and `backup` returned:
- No PR results for MIUI, Backup.apk, BRService, Xiaomi, or backup.
- One result for Termux: `snowdenxrp/aldea-ia#111`, titled “NCS: enforce continuity and prevent repeated work”. This is an NCS PR, not MIUI reverse-engineering.

The first 100 PRs returned by the aldea-ia REST listing were inspected. They include NCS and Lúmina work; no MIUI/Backup.apk-specific PR appeared in that page. The private owner repositories `manual-supervivencia-nuclear`, `nexo-grand-mission-01`, and `-nexo-drb09-external-register` returned zero PRs in their available listing.

## 2. GitHub Actions runs and artifacts

The first page of up to 100 workflow runs for `aldea-ia` was inspected. Runs in the returned page belong to:
- Lúmina scheduled simulation;
- GitHub Pages deployment;
- Nexo AB104.598 TLA SANY Gate on NCS branches.

No run in the returned page was associated with `backup-apk-static-research-2026-11-19` or an MIUI/Backup.apk workflow.

Artifacts were queried for three recent Lúmina/Pages runs and two NCS SANY runs:
- The three Lúmina/Pages runs returned no artifacts.
- The two NCS runs returned artifacts named `nexo-ab104-598-sany-evidence`, which are NCS evidence, not MIUI research.

The Actions listing wrapper returned only the first page; older workflow runs and artifacts beyond that page are not exhaustively audited. The artifact files themselves were not downloaded or inspected.

## 3. Releases

The `aldea-ia` releases endpoint returned zero releases. The other three repositories also returned zero releases in the available responses.

## 4. Tags

The GitHub fetch connector rejected the `/tags` endpoint as outside its allowed endpoint surface. Tags therefore remain **NOT AUDITED**; do not report their absence.

## 5. Issue search caveat

The issue-search tool used in this pass searched globally across accessible GitHub issues rather than being restricted to the owner. Its broad MIUI/Backup.apk/BRService/Termux results were unrelated third-party issues and are not evidence about the user's repositories. No absence claim is made from those global issue results.

## 6. Bounded conclusion

No direct MIUI Backup.apk/Smali material surfaced in the inspected PR, Actions, or release surfaces. This adds to, but does not exceed, the prior branch-tree and commit-message audits.

Uncovered surfaces include older Actions pages/artifacts, tags, gists, deleted/unreachable Git objects, private/unindexed code search, and local device storage.

**No PR, workflow, issue, tag, release, NCS branch, or main branch was modified.**
