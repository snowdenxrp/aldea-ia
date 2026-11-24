# Evidence 135 — BRService$5 :goto_3f handoff after theme/USB guards

**Date:** 2026-11-23  
**Source:** user-provided Termux output from `grep -n -A45 -B15 ':goto_3f' "$F"`; partial physical windows around 1042–1120 and 3831–3875 of `BRService$5.smali`.  
**Status:** CURRENT-CHAT-TERMUX-OUTPUT; not independently re-read or hash-verified; no runtime.

## New delta

- The previously documented theme/USB branches converge at `:goto_3f`. At the target, the code obtains `mRunningItemIndexLock`, enters its monitor, writes `-1` to `mRunningItemIndex`, exits the monitor, and logs `"startRestore, restored"`.
- The visible continuation checks `mIsTransingTask`; if true, it reads `mIsAborted` and branches on that value. The supplied output ends before the branch's full continuation, so no further effect is inferred.
- The branch setup remains as already recorded in evidence 133: `v8 != 0` sets `v4=10,v16=8`; flash-drive task with unavailable USB sets `v4=10,v16=9`. This block does not show `v16` being consumed, nor a direct write to `BRItem.state/error`.

## Dedupe and limits

Supplement to evidence 133, not a duplicate of its theme/USB guard findings. The target code's later physical coordinates are reported by the user's grep output; they were not independently checked against the local file. The excerpt is truncated during the `mIsAborted` branch. Do not infer the final destination of `v16` from this fragment alone.
