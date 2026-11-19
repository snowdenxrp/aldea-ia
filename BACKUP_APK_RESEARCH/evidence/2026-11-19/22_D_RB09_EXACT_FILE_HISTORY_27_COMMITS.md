# D-RB-09 history verification — complete path commit inventory — 2026-11-19

**Repository:** `snowdenxrp/-nexo-drb09-external-register` (private; default branch `main`).
**File:** `G08_NON_OPERATIONAL_EVIDENCE_PLAN.md`.
**Method:** GitHub REST commit history filtered by the exact file path, `per_page=100`.
**Result:** 27 commits returned. This verifies the 27-commit count shown in the user's screenshot and corrects the earlier report that mentioned only 17.

## Complete path history (newest first)

| UTC date | Commit | Message |
|---|---|---|
| 2026-11-15 15:07:32 | `656703ad722e012f0b25816363afdb4d87866c57` | Cross-check rodin backup-domain SELinux rules and limit private-data inference |
| 2026-11-15 15:07:09 | `53dff288cd85e4e663a959612bbe000c49b51e01` | Document rodin Mi Mover backup configuration lead with provenance caveats |
| 2026-11-15 15:04:13 | `dc1ab89e0cf479f8d362b9eae1b83715f941c2b9` | Record rodin stock-ROM artifact metadata and verification limits |
| 2026-11-15 15:03:30 | `d1ba08420dc44f1f6091467bfa2abb10a2befcf8` | Record bounded inventory of public rodin vendor repository |
| 2026-11-15 15:02:25 | `abdffaaa9b57a34e0fb04d522d5b0fed6afafdc8` | Refine Xiaomi package-scoped backup service evidence |
| 2026-11-15 15:02:11 | `b4184d9cd16a10b21bb3a52b201bc2bb4710b255` | Document Xiaomi Mi Mover BackupManager integration evidence and device-scope limits |
| 2026-11-15 14:59:27 | `529367bb94d765701dcefd36a4c66b7753b86c90` | Integrate Mi Mover privacy and firmware caveats into G-08 conclusion |
| 2026-11-15 14:59:20 | `05cb16f1ebd1d5d9c74d6407d327c009f389efbb` | Refine Mi Mover privacy and POCO firmware evidence boundary |
| 2026-11-15 14:57:30 | `e77ed9195e9b7ce02709262a458dc0594b290690` | Clarify Mi Mover private-app-data evidence boundary for G-08 |
| 2026-11-15 06:13:06 | `ef82191eb27af93883d45efe53c0c4acced979f7` | Document Android backup paths and Keystore continuity limits for G-08 |
| 2026-11-15 05:18:51 | `d67bb3b4096fccb1ae60bdf828c49d55d494ae68` | G-08: refresh review date and revision history |
| 2026-11-15 05:18:37 | `6777b1514b088737d41b979361114fe6a6d92cbc` | G-08: document Xiaomi local-backup restore and encryption limits |
| 2026-11-15 05:12:03 | `55e4469e2eeb7ed988c0241ff3e517a0ac0338ef` | G-08: qualify Xiaomi local-backup third-party app limitation |
| 2026-11-15 05:08:37 | `078393dcc87c66f3cbe9066a9f7f14ec3ce4a1b9` | Document AOSP compatibility override path and Xiaomi evidence gap |
| 2026-11-15 05:06:44 | `6009eea52f7b727c6a359b0ac3ee449cec165291` | Clarify POCO X7 Pro evidence in G-08 conclusion |
| 2026-11-15 05:06:29 | `7b4e32d434e2997676ecdf3fd6e25256a0f6208c` | Add POCO X7 Pro and HyperOS 3 backup evidence limits |
| 2026-11-15 05:02:08 | `7d6b91db7ce8bd98a9c2df65613ba9ee8bc8bf3b` | Refresh G-08 checkpoint after Mi Mover clarification |
| 2026-11-15 05:02:01 | `3fcb78f80030203513266da9bfb751ab76a926f8` | Record Mi Mover as a separate unverified G-08 restore path |
| 2026-11-15 05:01:37 | `209d97e7f41dace3c6260556712c786db9488db7` | Refresh G-08 evidence-plan repository checkpoint |
| 2026-11-15 05:01:27 | `998e19275b5addb0089a2975d046059f450ff142` | Correct G-08 Android D2D scope for Termux target API 28 |
| 2026-11-14 03:35:20 | `ac5c96712025ff9220c41ab04faa30403b3e508e` | Qualify G-08 conclusion with Termux backup source evidence |
| 2026-11-14 03:35:14 | `f4c7eef4eb190d3ab9f281cb197e923fb7c706a6` | Add source-level Termux backup findings without closing A-03 |
| 2026-11-14 03:34:10 | `968e87140e947b069e1b70d85923faedf9a9f7bd` | Record D-RB-02 declaration field in documentary schema review |
| 2026-11-14 03:31:40 | `a4030ae01601732092ba23f5cb4b532c6c932e89` | Clarify historical and current G-08 repository snapshots |
| 2026-11-14 03:27:55 | `4897c11733579b8705ad0ce81363e0e4fb377829` | docs: cite NCS rollback gap source for G-08 boundary |
| 2026-11-14 03:27:42 | `041ae0fe5bc19362b78a88f9807dd64e4de7efd6` | docs: strengthen G-08 evidence with verified metadata and R1 gaps |
| 2026-11-14 03:25:26 | `0008954a7daf7f06aafc34fa8e4badd6bb887e04` | docs: add non-operational G-08 evidence plan |

## What this establishes

- The 27 count is a complete path-specific commit-history result from the endpoint response, not an estimate from commit-message search.
- These commits modify the G-08 evidence-plan file in the private D-RB-09 repository; they document Termux, Android backup, Xiaomi local backup, Mi Mover, BackupManager, device-scope and provenance limitations.
- They are antecedent infrastructure research. They are not the direct `Backup.apk` Smali investigation, which began on 2026-11-16 according to the recovered timeline.
- The earlier 17-commit inventory was incomplete: it omitted ten commits, including earlier baseline and intermediate updates.

**No changes were made to the private repository.**