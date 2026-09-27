# NEXO AB104.593 — Static audit result

Artifacts created:
- TLA source commit: cc4f41ad0d48768011fb742fa284a039fe34b616
- CFG commit: 6ff168ef970214c27c8b5daf64082ee33152b5a4

SANY has NOT been executed.

Static audit found an additional semantic defect before SANY:

1. The model currently asserts:
   phase = EXECUTING => authority = VALID
   phase = EXECUTING => boundFence = fence

This is too strong for the AB104 semantics. Authority or fence can change AFTER an external operation has legitimately started. AB104.575 explicitly separates historical effect outcome from current authority validity. Therefore an in-flight operation must not be declared invalid merely because current authority/fence changes after submission.

The correct boundary is:
- Execute admission requires valid authority and matching bound fence/incarnation at START.
- After START, current authority/fence may change.
- Outcome must be recorded independently.
- Current authority/fence must govern NEW mutations and compensation, not retroactively rewrite the original effect outcome.

2. The model correctly preserves boundIncarnation/boundFence for the started operation, but the Safety invariant must not require them to equal current incarnation/fence during EXECUTING.

3. Reconciliation evidence remains bound to outcomeIncarnation, which is the correct direction.

Tooling status:
- Official TLA+ documentation confirms SANY is the parser and TLC is the model checker; both are in tla2tools.jar and require Java 11+. citeturn0search1turn0search2
- The current upstream release channel is rolling, so a reproducible run still requires an exact artifact digest. citeturn0search6
- No SANY/TLC result exists yet.

Conclusion:
AB104.593 produced a corrected artifact but its static audit exposed one more semantic overconstraint. Do not execute TLC yet.

Next exact step:
AB104.594 — remove the retroactive authority/fence constraints, add explicit START-vs-CURRENT semantics, then perform another static audit before SANY.