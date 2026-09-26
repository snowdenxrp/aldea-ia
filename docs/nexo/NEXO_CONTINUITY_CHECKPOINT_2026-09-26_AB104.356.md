# NEXO CONTINUITY — AB104.356

AB104.356 persisted. Research only; no implementation.

## Finding
RFC 6024 establishes that initial trust-anchor-manager authority is a bootstrap boundary and may require out-of-band establishment. Recovery from compromised/lost trust-anchor-manager keys must be possible without simply reinitializing every store; replay detection is required because old management transactions can reintroduce compromised anchors. citeturn0search0turn0search1

Nexo therefore cannot derive current authority solely from a recovered store that may itself be rolled back or compromised.

Candidate rule:
ROLLED_BACK_STORE != CURRENT_AUTHORITY
OLD_STORE_SIGNATURE != BOOTSTRAP_TRUST
INDEPENDENT_RECOVERY_AUTHORITY + NEW_EPOCH + NEW_STORE_INCARNATION => candidate CURRENT

No independent/bootstrap path => UNKNOWN/STOP.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.357 — compare independent bootstrap models: offline root, hardware-protected root, quorum/multi-party recovery, delegated recovery.

## DO-NOT-REPEAT
Do not let the recovered/possibly compromised trust store authenticate its own recovery frontier.
