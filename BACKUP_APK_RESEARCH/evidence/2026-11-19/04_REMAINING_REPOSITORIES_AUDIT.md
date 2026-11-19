# Cross-repository path audit — remaining known repositories — 2026-11-19

**Mode:** GitHub read-only inspection.  
**Purpose:** check the other two repositories identified in the earlier owner-repository inventory for paths related to MIUI Backup.apk, Smali, Mi Mover, Termux, BRService or MiAsistService.

## 1. snowdenxrp/manual-supervivencia-nuclear

- Visibility: PRIVATE.
- Default branch: `main`.
- Branches returned by GitHub: `main` only.
- Current `main` tree: 77 paths, `truncated=false`.
- No path matched: `backup`, `miui`, `mover`, `termux`, `apk`, `BRService`, or `MiAsist` (case-insensitive path filter).

## 2. snowdenxrp/nexo-grand-mission-01

- Visibility: PRIVATE.
- Default branch: `main`.
- Branches returned by GitHub: `main` and `nexo-grand-mission-01-autonomous-2026-11-12`.
- `main`: 1 path, `truncated=false`.
- `nexo-grand-mission-01-autonomous-2026-11-12`: 32 paths, `truncated=false`.
- No path in either complete tree matched the terms above.

## 3. Scope and conclusion

These results are direct GitHub tree observations for every branch returned by the branch-list endpoint in these two repositories. No matching MIUI Backup.apk research artifact was found in those trees.

This does not establish absence from deleted/unreachable Git objects, external storage, local Termux, chat attachments, or repositories not included in the known owner inventory. It is not evidence that the direct Smali research never existed.

Combined with the current complete `main` tree of the private D-RB-09 repository and the prior 129-branch audit of `aldea-ia`, the currently identified GitHub locations do not expose a direct archived copy of the 16–19 November Smali investigation. The remaining strongest recovery sources are prior conversations and the original local Termux extraction.
