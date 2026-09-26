# NEXO CONTINUITY — AB104.358

AB104.358 persisted. Research only; no implementation.

## Finding
Hybrid bootstrap must not be reduced to signature counting. RATS and RFC 6024 treat trust anchors/bootstrap as explicit trust relationships; DNSSEC rollover shows that an existing uncompromised anchor can authenticate successor trust, while compromise of all anchors requires an out-of-band recovery path. citeturn0search0turn0search1turn0search7

Candidate states:
HYBRID_VALID | PARTIALLY_SUPPORTED | COMMON_MODE | CIRCULAR | ORDER_CONFLICT | SCOPE_CONFLICT | UNKNOWN | CONFLICT

Rules:
SIGNATURE_QUORUM != INDEPENDENT_QUORUM
MULTIPLE_ROOTS != AUTOMATICALLY_INDEPENDENT_ROOTS
HYBRID_AUTHORITY != UNIVERSAL_AUTHORITY
DISAGREEMENT => CONFLICT/STOP unless prior authenticated policy defines resolution.

All recovery authorities must bind compatible claim scope, epoch/frontier and transition identity. Common-mode/circular dependencies invalidate the claimed independence.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.359 — study disagreement between independently authenticated recovery authorities and preservation of competing evidence branches.

## DO-NOT-REPEAT
Never select a recovery authority merely by signature count or apparent numerical majority without a pre-established quorum policy and dependency/independence analysis.
