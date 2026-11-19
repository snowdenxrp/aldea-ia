# Local read-only verification batch — Termux — 2026-11-19

**Purpose:** close the remaining source-level conflicts using the user's existing decoded tree.  
**Execution mode:** read-only only. The commands below do not modify APK, decoded files, device state, services, backups, or restores. They only print hashes, source ranges and grep results.

## 1. Establish extraction root and hash relevant files

Run in Termux:

```sh
ROOT="$HOME/backup-static/decoded"
printf 'ROOT=%s\n' "$ROOT"
find "$ROOT" -type f \( -name 'BRService.smali' -o -name 'BRService$5.smali' -o -name 'BRService$11.smali' -o -name 'BRService$FakeBackupListenerImp.smali' -o -name '*ProgressItemAdapter.smali' -o -name 'BRItem.smali' \) -print
find "$ROOT" -type f \( -name 'BRService.smali' -o -name 'BRService$5.smali' -o -name 'BRService$11.smali' -o -name 'BRService$FakeBackupListenerImp.smali' -o -name '*ProgressItemAdapter.smali' -o -name 'BRItem.smali' \) -exec sha256sum {} \;
```

Preserve the complete output, including every path. This determines whether multiple dex directories contain duplicate class names and binds later line references to file hashes.

## 2. Enumerate all direct BRItem.state writers across decoded dex trees

```sh
grep -R -n -B 10 -A 8 'BRItem;->state:I' "$ROOT"/smali*
```

Do not interpret register values until their reaching definitions are visible in the same method. Record any output truncation.

## 3. Reconcile FakeBackupListenerImp callbacks

```sh
F="$ROOT/smali/com/miui/backup/service/BRService\$FakeBackupListenerImp.smali"
sed -n '1215,1310p' "$F"
sed -n '1715,1815p' "$F"
```

If the file is in another dex directory, use the exact path printed in step 1 instead. These ranges resolve the backup-end retry/success branch and the restore callback's truncated `p3=2` mapping.

## 4. Reconcile state 6 producers in BRService$5

```sh
F="$ROOT/smali/com/miui/backup/service/BRService\$5.smali"
sed -n '1700,1805p' "$F"
sed -n '1945,2000p' "$F"
sed -n '2300,2375p' "$F"
```

The last range is mandatory: historical records disagree between physical line 1735 and physical line 2351 for a `state=6` write. Do not assume they are the same occurrence.

## 5. Confirm global setState and finish path

```sh
F="$ROOT/smali/com/miui/backup/service/BRService.smali"
sed -n '8320,8415p' "$F"
sed -n '14060,14225p' "$F"
```

This binds the final caller semantics to the exact local file hash and checks whether the recovered `setState(4,12,0,v14)` interpretation matches this extraction.

## 6. Recover adapter rendering and counts

First locate the adapter (the class may be in a different dex directory):

```sh
find "$ROOT" -type f -name '*ProgressItemAdapter.smali' -print
```

Then use the exact path to extract the previously inspected regions:

```sh
A='PASTE_EXACT_PATH_FROM_FIND'
grep -n -E 'getSuccessfulCount|getFailedCount|initData|workingItemFinished|workingItemError|itemStart|setItemsAborted|onBindViewHolder|getView|setText|setImage' "$A"
```

For each relevant method, capture its full body from `.method` through `.end method`, not isolated matching lines. This is needed to map states 1/2/3/6 to actual labels/icons.

## 7. Output handling

Send the output in chunks if necessary, but preserve:
- the initial file paths and SHA-256 values;
- complete callback methods, not just selected lines;
- all register definitions preceding the `iput`;
- method descriptors and `.line` directives;
- grep command output with filenames and physical line numbers.

No command in this batch starts a service, invokes Backup/Restore, changes permissions, edits a file, deletes data, or modifies Git.
