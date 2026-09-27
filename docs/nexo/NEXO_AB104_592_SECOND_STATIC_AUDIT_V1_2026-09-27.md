# NEXO AB104.592 — Second static audit

Status: CORRECTION DESIGN COMPLETE; TLC NOT RUN.

The historical AB104.589 artifact is preserved unchanged.

Required corrected variables:
outcome, outcomeIncarnation, authority, fence, admission, phase, incarnation, boundIncarnation, boundFence, executed, compensation, evidence, evidenceIncarnation.

Required transition rules:
1. Admit captures current incarnation and fence.
2. Authority invalidation makes a queued admission stale.
3. Fence advancement makes a queued admission stale.
4. Incarnation replacement makes a queued admission stale.
5. RestoreAuthority never revives stale admission.
6. ReAdmit captures fresh incarnation and fence.
7. Execute requires current authority, incarnation and fence equal to the bound admission.
8. COMMITTED/NOT_COMMITTED/UNKNOWN records the bound incarnation.
9. Reconciliation requires explicit evidence matching the recorded outcome incarnation.
10. Compensation is a successor state and cannot rewrite the original outcome.

Static audit conclusion:
The corrected design removes the six critical defects identified in AB104.591 at the model level.

Remaining limitation:
The corrected TLA+ source has not yet been accepted/executed by SANY/TLC. Therefore there is still no formal verification result.

Next exact step:
AB104.593 — obtain/construct the corrected executable TLA+ artifact without modifying the historical AB104.589 file, then perform a syntax-only SANY gate before TLC.