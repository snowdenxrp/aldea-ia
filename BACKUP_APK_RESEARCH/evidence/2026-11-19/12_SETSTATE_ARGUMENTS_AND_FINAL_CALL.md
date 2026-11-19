# setState(IIII) and final caller — argument order resolved from direct Smali — 2026-11-19

**Source basis:** exact user-pasted extraction of `BRService.smali:14072–14220` and exact user-pasted final invoke block in `BRService$5.run()` on 19-November-2026.  
**Classification:** DIRECT-CHAT / USER-PASTED-SOURCE; not reread from the local checkout in this session.

## 1. Method semantics

Extraction command supplied in the conversation:

```sh
sed -n '14072,14220p' "$D/com/miui/backup/service/BRService.smali"
```

Recovered body facts for `setState(IIII)`:

- `p1` → `mState`.
- `p2` → `mWorkingStage`.
- `p3` → `mUserInterruptAction`.
- `p4` → `mLastError`, but only if the prior `mLastError==0`.
- If `p2==7`, it calls `releaseWakeLock()` before the equality checks.
- If `p2==10` or `p2==12`, or `p3==2`, and `mBRItems` is non-null/nonempty, it iterates the items and writes `BRItem.state=3` and `BRItem.error=9`.
- It then calls `notifyServiceStateChange()` and `setWorkingPreference(...,p1,p2,p3)`.

The three-argument overload/bridge maps `p1,p2` unchanged and supplies the current `mUserInterruptAction` as the third argument to the four-argument method; its third caller argument becomes `p4` (the error candidate).

## 2. Exact final call in BRService$5.run()

The user pasted the final branch:

```smali
if-eqz v16, :cond_66
move/from16 v14, v16
const/16 v2, 0xc
...
const/4 v4, 0x4
const/4 v5, 0x0
invoke-static {v0, v4, v2, v5, v14}, ...->setState(IIII)V
...
updatePkgStae(v14)
handleTaskFinish(4, v2, v14, mBRItems)
```

Therefore the four-argument call is unambiguously:

`setState(4,12,0,v14)`

For nonzero `v16`, `v14=v16`, so the call becomes `setState(4,12,0,8)` or `setState(4,12,0,9)`.

This resolves the older call-shape conflict. The earlier recovered phrase `setState(4,0,v2,v14)` was a mistaken summary / argument-order transcription and must not be used. The alternative `setState(4,v2,0,v14)` is consistent with the exact invoke and `v2=12`.

## 3. Related direct caller

The user also pasted a three-argument caller in `BRService$5.run()`:

```smali
const/4 v5, 0x4
const/4 v6, 0x0
invoke-static {v0, v5, v2, v6}, ...->setState(III)V
```

With `v2=8`, this is `setState(4,8,0)`. The three-argument wrapper supplies the current `mUserInterruptAction` and forwards `0` as the fourth argument. This is distinct from the final four-argument stage-12 call.

Other recovered 19-November callers in the same thread:
- `setState(v4,v10,v6)`, with `v10=3`, `v6=0`.
- `setState(v4,v15,v6)`, with `v15=7`, `v6=0`.
- `setState(v4,v10,v6)` again.
- Earlier line 1408–1415 caller: `invoke-static {v0,v4,v3,v13}, ...->setState(III)V`, with `v13=9`; `v4/v3` were not resolved in that excerpt.

## 4. Consequence for state/error interpretation

The final `setState(4,12,0,8/9)` call has:
- global state `4`;
- working stage `12`;
- user-interrupt action `0`;
- last-error candidate `8` or `9`.

Because `p2==12`, the method's recovered logic writes `BRItem.state=3` and `BRItem.error=9` to every item in the nonempty list. This is an item-level failure marker and is not a statement that the global error code is 9 in both cases. The global `mLastError` receives `p4=8/9` only if its prior value is zero.

This distinction explains how a global error 8 can coexist with `BRItem.error=9`: they are different fields/layers and the method explicitly writes the per-item value 9 for stage 12.

## 5. Status

**RESOLVED from direct chat-pasted source:** final argument order is `setState(4,12,0,v14)`; the earlier `setState(4,0,v2,v14)` wording is erroneous.

**Still not LOCAL-VERIFIED:** current checkout hash and byte-for-byte reread of the exact method/caller. The source block itself was pasted by the user, so this is stronger than a paraphrased summary but not a fresh device read.

No runtime, service, backup or restore operation was performed.
