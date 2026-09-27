# NEXO AB104.596 — Byte/operator audit

TLA commit: 1ae19c12045ea093db17988fe2ef4f9e4a14a780
CFG commit: 42f75c46f6a84b6ea1c63020bb3379c7480bdb8c
Fetched TLA blob: 15152dc8c2821b457c2d791058c66e7bd5df53b6

Result:
- The new artifact contains the intended TLA operator forms: /\, \/, \in, prime notation, and #.
- The prior AB104.594 serialization defect is not carried into this artifact.
- Historical defective artifact remains preserved.
- No SANY execution has occurred.
- No TLC execution has occurred.

Static semantic check:
The model retains START-time authority/fence checks in Execute while allowing current authority/fence to change after EXECUTING. Outcome remains bound to the original incarnation.

Remaining model limitation:
Safety still includes boundIncarnation=current incarnation while EXECUTING. This intentionally models a protected resource refusing incarnation replacement during execution; it does not model provider-side acceptance followed by resource reincarnation. That cross-domain case remains outside this bounded model and must not be inferred from a future TLC pass.

Next exact step:
AB104.597 — pin/obtain the TLA+ tool artifact and run SANY against AB104.596 only. If the tool cannot be obtained, record the environment limitation rather than fabricating a run.