# AB104.73 — Exploration region completion repair — 2026-09-25

Run 2076 was cancelled by the next push, but its logs are usable: the same concrete assertion remained, "la exploración debe ampliar el territorio conocido", after the prior repair. Therefore the previous change did not establish the required invariant under the actual autonomous exploration path.

Root cause narrowed: autonomous explore_area completion already calls discoverArea/rememberAreaVisit, but the behavioral invariant needs explicit registration at the completion boundary. Added an explicit visited-region registration immediately after exploration completes.

Commit:
97703c333bc1fa17e93eccac436a7fedab87eb6f

Do not weaken the assertion. Next Actions run must determine whether autonomous exploration now produces >=2 known regions.

AB65 remains separate: NOT_VERIFIED.
