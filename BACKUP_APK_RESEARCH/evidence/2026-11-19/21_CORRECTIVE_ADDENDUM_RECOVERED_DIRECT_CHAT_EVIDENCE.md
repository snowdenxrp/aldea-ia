# Corrective addendum — restore strongest recovered direct-chat evidence — 2026-11-19

**Supersedes:** the over-broad downgrades in evidence 18 §2 and §4, and any index text that treats those downgrades as settled.
**Does not claim:** fresh access to the Termux checkout or byte-level verification.

## 1. mBakFilesType — best-supported recovered mapping

On re-reading the committed recovery sources, evidence 02 and evidence 10 preserve a specific description attributed to the user's direct message describing the Smali block:

| Condition | Effect reported |
|---|---|
| `mBakFilesType == 2` | `v8 = 1` |
| `mBakFilesType == 3` | `mIsTransingTask = true` |
| `mBakFilesType == 5` | `mIsFlashDriveTask = true` |
| `mBakFilesType == 1` | `mIsLocalBackupTask = true` |

Evidence 10 further preserves the user's downstream report: `v8 != 0` leads to `v4=0xa`, `v16=0x8`; unavailable USB while `mIsFlashDriveTask` is true leads to `v16=0x9`; nonzero `v16` is propagated into stage 12 as `setState(4,12,0,v14)` with `v14=v16`, then `handleTaskFinish(4,12,v14,mBRItems)`.

Evidence 02 explicitly classifies the mapping as DIRECT-CHAT, but says the exact surrounding instructions were not reproduced in that recovery. Evidence 10 also says the complete source was not reread. This is stronger provenance than the conflicting older shorthand in the initial index/audit, which said 2/3→transfer and 5→flash.

**Correct status:** `RECOVERED-DIRECT-CHAT / HIGH-CONFIDENCE HISTORICAL; NOT LOCAL-VERIFIED`. For purposes of the recovered conversation, use 2→`v8=1`, 3→transfer flag, 5→flash-drive flag, 1→local-backup flag. Retain the older shorthand only as a superseded erroneous paraphrase, not as an equally weighted competing user fact.

### Coordinate qualification

A later recovery note refers to `.line 1391–1418` appearing inside a `sed -n '100,320p'` extraction. That alone does not invalidate the separately preserved direct-chat description of a block around physical lines 1391–1418 in evidence 01/02/10. The current transcript recovery does not provide enough raw context to prove whether those references denote the same extraction, different windows, or a coordinate transcription error. Do not use coordinate ambiguity to discard the recovered branch effects; mark exact physical source anchoring pending local re-read.

## 2. State 6 — preserve both recovered physical anchors

Evidence 02 and evidence 15 preserve two reported physical line anchors in `BRService$5.smali`: physical line 1735 in the `files_for_backup` / `waitingForFilesTransingEnd()` context, and physical line 2351 as another `state=6` write. Evidence 15 explicitly labels both as physical-line anchors recovered from separate user messages.

Evidence 18's suggestion that 1735 may merely be a `.line` directive is not supported by the recovered records reviewed here. It is withdrawn as a conclusion. Keep both anchors as `RECOVERED-CHAT / NOT LOCAL-VERIFIED`; they may be two separate writers, but only the same-file hashed extraction can settle this.

## 3. Exact distinction: historical facts vs local verification

- **Recovered from direct user-message descriptions:** the four type-branch effects above; downstream `v8`/`v16` reports; both state-6 physical anchors.
- **Not available in this recovery:** complete original Smali blocks and complete shell transcripts for those sections.
- **Not performed:** current Termux file read, hash calculation, or device operation.

## 4. Corrective action for future readers

Use evidence 21 as the authoritative provenance correction. Evidence 18 remains in history as a dated erratum but its unsupported downgrade of the type mapping and state-6 anchor is superseded. Update the master index so that older summaries cannot silently override evidence 02, 10, 15 and this correction.

**Current status:** recovered mapping materially reconciled at conversation-evidence level; local byte-level verification remains OPEN. State-6 has two preserved reported physical anchors; exact writer count remains OPEN until same-file inspection.