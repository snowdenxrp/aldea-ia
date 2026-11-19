# Evidence hierarchy correction — mBakFilesType and BRItem state-6 anchors — 2026-11-19

**Purpose:** correct overstatements in evidence 21 after a full re-read of evidence 02, 10, 15 and 18. Evidence 21 remains immutable history but is not authoritative where it conflicts with this document.
**Scope:** documentary reconciliation only. No local Termux checkout or Smali bytes were accessed.

## 1. mBakFilesType — conflict remains unresolved

The recovered records contain two distinct historical reports:

### Report A — 17-November user fact, recovered later

Evidence 18 §2 records an earlier user fact attributed to 17-November:
- type 2 → `mIsTransingTask`;
- type 3 → `mIsTransingTask`;
- type 5 → `mIsFlashDriveTask`;
- type 1 → `mIsLocalBackupTask`.

The verbatim original Smali block and exact command transcript were not recovered. Classification: `RECOVERED-USER-FACT / NOT VERBATIM-RETRIEVED`.

### Report B — 19-November recovered block description

Evidence 02 and evidence 10 record a later description of a block around Smali `.line 1391`–`.line 1418`:
- type 2 → `v8=1`;
- type 3 → `mIsTransingTask`;
- type 5 → `mIsFlashDriveTask`;
- type 1 → `mIsLocalBackupTask`.

Evidence 02 calls this a direct-chat fact but says the exact surrounding instructions were not reproduced. Evidence 10 says the user's pasted block was described precisely, but the original complete Smali was not reread. Evidence 18 establishes that `.line 1391`–`.line 1418` occurred inside output from `sed -n '100,320p' "$F"`; therefore those `.line` markers must not be represented as physical file lines 1391–1418.

Classification: `RECOVERED-CHAT / HIGH-CONFIDENCE HISTORICAL; NOT LOCAL-VERIFIED`. The exact raw output and source version remain unavailable here.

### Required status

`UNKNOWN — SOURCE BLOCK RECONCILIATION REQUIRED`.

Do not collapse Report A into an assistant paraphrase error. Do not declare Report B a physical-line observation. Possible explanations include different source versions, different blocks/methods, or a historical interpretation error; none is proven. The downstream `v8!=0 → v16=8` and Flash Drive/USB-unavailable → `v16=9` reports remain independently preserved, but the causal link from type 2 to `v8` is conditional until the source is inspected.

Evidence 21's assertion that Report A was merely an erroneous shorthand is withdrawn. Its assertion that the mapping is materially reconciled is also withdrawn.

## 2. BRItem state 6 — preserve anchors, not a settled writer count

Evidence 02 preserves a state-6 context associated with `files_for_backup` after `waitingForFilesTransingEnd()` and reports line 1735. Evidence 15 preserves two reported physical anchors: 1735 and 2351. Evidence 18, after distinguishing physical file lines from `.line` directives, states that physical line 2351 is in the recovered direct grep inventory, while the physical status of 1735 is not proven by the raw source returned to that recovery.

Therefore:
- `BRService$5.smali:2351 → state=6`: `RECOVERED-CHAT / PHYSICAL GREP INVENTORY`; not locally reverified.
- `BRService$5.smali:1735 → state=6`: `RECOVERED-CHAT / COORDINATE DISPUTED`; physical line vs `.line` attribution unresolved.
- The `files_for_backup` / `waitingForFilesTransingEnd()` association is preserved as reported context, not yet bound conclusively to a verified physical instruction.

Do not claim two confirmed physical writers. Do not discard the 1735 report. The exact same-file hash and physical extraction are required.

## 3. Evidence 21 disposition

Evidence 21 remains in the repository to preserve the audit trail. Its claims are superseded only where this document explicitly corrects them:
- Type mapping: no final resolution; both reports A and B retained.
- Type 2 historical report: do not downgrade Report A to an erroneous paraphrase.
- State 6: do not call 1735 a confirmed physical anchor.

Evidence 21's useful transcription of the Report B mapping and downstream `v8`/`v16` chain remains preserved as one historical report, not the exclusive truth.

## 4. Definitive read-only proof required

On the exact Termux checkout(s), record file path, file size, modification metadata and SHA-256 before interpreting line positions. For each distinct source copy/version, capture:

```sh
grep -n -B 12 -A 18 'mBakFilesType' "$F"
sed -n '1360,1445p' "$F"
grep -n -B 15 -A 15 'BRItem;->state:I' "$F"
sed -n '1700,1760p' "$F"
sed -n '2300,2380p' "$F"
```

Preserve each output separately with the exact path and SHA-256. If only one current source copy exists, do not invent a second version to reconcile the historical reports.

**Current conclusion:** mBakFilesType remains UNKNOWN pending source-block reconciliation; state-6 producer count remains UNKNOWN pending coordinate verification. This is the strongest conclusion supported by the currently recovered provenance.