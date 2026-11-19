# Erratum — coordinate systems and unresolved mBakFilesType conflict — 2026-11-19

**Purpose:** correct overconfident interpretations in earlier recovery notes without deleting or rewriting historical records.  
**Source basis:** recovered conversation records for 17–19 November plus the currently committed dossier files.  
**Status:** provenance conflict identified; source-level mapping remains UNKNOWN pending original block comparison.

## 1. Critical coordinate distinction

Smali investigations use two different coordinate systems:

1. **Physical file line:** the line number addressed by shell tools such as `sed -n '100,320p'` and reported by `grep -n`.
2. **Smali `.line` directive:** a debug/source-line marker embedded in the file. It is not a physical line number.

The recovered 19-November user messages show the relevant `.line 1391`–`.line 1418` region inside output from:

```sh
sed -n '100,320p' "$F"
```

The file variable was set in the same investigation to:

```sh
F="$D/com/miui/backup/service/BRService\$5.smali"
```

A continuation was supplied with:

```sh
sed -n '310,470p' "$F"
```

Therefore references to the 19-November block as “physical lines 1391–1418” are incorrect unless independently established by a separate physical-line command. The recovered evidence establishes that these are Smali `.line` directives in a physical extraction window around lines 100–470.

## 2. Two historical mBakFilesType reports — do not collapse them

### Report A — 17-November user fact

Conversation recovery identifies an earlier user-requested physical range 1391–1418 in `BRService$5.smali`, with this reported mapping:

- `mBakFilesType==2` → `mIsTransingTask`
- `mBakFilesType==3` → `mIsTransingTask`
- `mBakFilesType==5` → `mIsFlashDriveTask`
- `mBakFilesType==1` → `mIsLocalBackupTask`

The conversation record identifies this as an original user fact dated 17-November 2026, but the verbatim Smali output and exact command transcript were not returned by history retrieval. Classification: **RECOVERED-USER-FACT / NOT VERBATIM-RETRIEVED**.

### Report B — 19-November assistant interpretation of a user-pasted block

The 19-November assistant later described the block containing `.line 1391`–`.line 1418` as:

- `mBakFilesType==2` → `v8=1`
- `mBakFilesType==3` → `mIsTransingTask`
- `mBakFilesType==5` → `mIsFlashDriveTask`
- `mBakFilesType==1` → `mIsLocalBackupTask`

However, conversation-history retrieval did **not** recover the verbatim comparison/assignment instructions, the full command output, or the expanded path for this block. It only confirms that the user's 19-November output came from `sed -n '100,320p' "$F"` and included the `.line` markers. The mapping above is therefore a **PRIOR-ASSISTANT-INTERPRETATION**, not yet independently auditable direct evidence.

### Required conclusion

These two reports conflict on the type-2 branch. They may represent different source versions, a different method/block, or a prior misreading. The evidence currently available does not distinguish these possibilities.

**Do not state that either mapping is resolved.** Retain both reports with provenance and mark the mapping:

`UNKNOWN — SOURCE BLOCK RECONCILIATION REQUIRED`.

## 3. Separate downstream v8/v16 evidence

Other 17-November user facts report:

- `v8 != 0` → `v4=0xa`, `v16=0x8`.
- Flash-drive task with `isUsbAvaliable()==false` → `v4=0xa`, `v16=0x9`.
- Nonzero `v16` is propagated into finalization, with `v14=v16`, `v2=0xc`.
- The final direct caller later recovered on 19-November is `setState(4,12,0,v14)`, then `handleTaskFinish(4,12,v14,mBRItems)`.

These downstream facts do not independently prove which `mBakFilesType` value sets `v8`. The causal link `type 2 → v8 → global error 8` remains conditional on resolving Report A vs Report B.

## 4. State-6 line-anchor erratum

A similar coordinate issue affects the state-6 producer:

- The recovered direct grep inventory reports the `BRItem.state` write in `BRService$5.smali` at **physical line 2351**.
- A later explanation refers to “line 1735” in the `files_for_backup` / `waitingForFilesTransingEnd()` context. History retrieval describes that context as physical lines 1732–1736 in one place, but it does not return the raw source instructions needed to verify whether 1735 is a physical line or a `.line` directive.
- The reported inventory also contains physical state writes at 2547, 2707, 2790, 3225, 3463, 3691, 3801; these must not be omitted from producer enumeration.

Therefore the previously stated “two physical state-6 writers at 1735 and 2351” is **not established**. The safe preserved fact is: physical grep inventory includes line 2351; state-6 semantics are associated in a later recovered explanation with `files_for_backup` after `waitingForFilesTransingEnd()`; exact coordinate and correspondence require the raw output.

## 5. What survives verbatim vs as a summary

Recovered original user command facts:
- 19-November: `sed -n '100,320p' "$F"` and `sed -n '310,470p' "$F"`; output contained `.line 1391`–`.line 1418`.
- 17-November: `BRService$5.smali` was reported as 4,261 physical lines, with `run()` beginning at physical line 39.
- 19-November: the grep inventory of direct `BRItem.state` writes is available as a recovered original user fact, including `BRService$5` physical lines 1151, 1259, 1283, 1336, 1441, 2351, 2547, 2707, 2790, 3225, 3463, 3691, 3801.

Not recovered verbatim in the current history retrieval:
- The complete 17-November type-classification source block.
- The complete 19-November source block around `.line 1391`–`.line 1418`.
- The full raw state-6 method bodies.
- The complete ProgressItemAdapter method bodies.

## 6. Required local read-only reconciliation

Use the current local file path and hash first. Then capture both coordinate systems explicitly:

```sh
D="$HOME/backup-static/decoded/smali"
F="$D/com/miui/backup/service/BRService\$5.smali"
sha256sum "$F"
grep -n -B 12 -A 18 'mBakFilesType' "$F"
sed -n '1360,1445p' "$F"
grep -n -B 15 -A 15 'BRItem;->state:I' "$F"
sed -n '2300,2380p' "$F"
```

If the 17-November checkout/source copy still exists separately, hash it and run the same commands against that exact path. Do not assume a branch/source version from dates alone. Preserve outputs separately with path and hash.

**Status:** physical-vs-`.line` confusion identified; type mapping NOT RESOLVED; state-6 physical-line claim corrected to UNKNOWN pending local output. No APK, decoded file, device service, backup/restore, or Git source was modified.
