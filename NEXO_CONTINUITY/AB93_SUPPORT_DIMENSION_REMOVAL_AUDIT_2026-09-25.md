# AB93 — SUPPORT-DIMENSION REMOVAL AUDIT V1 — 2026-09-25

Status: RESEARCH ONLY.

Objective: bounded non-oracular audit of removable HistorySupport dimensions from AB92.

External cross-check: Lamport's refinement material shows that history variables can be necessary when current implementation state cannot reconstruct required higher-level behavior; refinement is behavioral, not mere field equality. citeturn0search12turn0search0

## Dimension 1 — attempt/admission linkage

Removal test:
Can attempt identity and actual admission linkage be reconstructed from the remaining lease/protocol/order/invalidation facts?

Result: NOT JUSTIFIED.

Reason: AB25 defines UsedAdmissionContext from actual admission linkage. AB90 already produced two histories with the same current lease/bridge validity but different attempt-bound admission context.

Status:
ATTEMPT_LINKAGE_REQUIRED_OR_UNKNOWN = TRUE
SEPARATOR = BOUNDED_PATTERN_ALREADY_IDENTIFIED
FULL_LEGAL_SEPARATOR = NOT_ESTABLISHED

## Dimension 2 — claim-relevant order

Removal test:
Can order be discarded while preserving every P_AA-relevant invalidation/admission relation?

Result: NO, for the scoped known event family.

Reason: AB88 established that invalidation-before-admission versus invalidation-after-admission changes the P_AA interpretation. AB26 independently requires preservation of order relations whose reversal can change P_AA.

Status:
ORDER_SUPPORT_REQUIRED = TRUE

## Dimension 3 — invalidation edges

Removal test:
Can invalidation edges be reconstructed solely from current fields and protocol identity?

Result: UNKNOWN / not safely removable.

Reason: AB25/AB26 explicitly require cross-component invalidation for authority, policy, delegation, incarnation and lease changes. Current fields alone do not establish the historical transition that caused the invalidation.

Status:
INVALIDATION_SUPPORT_REQUIRED_OR_UNKNOWN = TRUE

## Dimension 4 — protocol class

Removal test:
Can ATOMIC and LEASE semantics be collapsed into one representation without preserving protocol behavior?

Result: NOT JUSTIFIED.

Reason: AB26 CM-AA145 explicitly identifies protocol-class aliasing as an attack; AB45 also requires protocol semantics in the transition contract.

Status:
PROTOCOL_CLASS_MERGE = NOT_JUSTIFIED

## Dimension 5 — lease interval / replay history

Removal test:
Can expiry/interval/consumption/replay facts be discarded without changing future P_AA behavior?

Result: UNKNOWN.

Reason: AB26 CM-AA137 and CM-AA139 distinguish lease expiry and replay history while current structural fields may remain equal. AB49 explicitly permits lease interval, expiry, renewal, consumption and replay as support primitives.

Status:
LEASE_TEMPORAL_REPLAY_SUPPORT = UNKNOWN

## Aggregate result

No audited dimension has been safely eliminated.

This does NOT prove every dimension is globally minimal. It establishes only that the current evidence does not justify removing any of these dimensions from the P_AA support language.

EPISTEMIC:
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

Next exact action:
Attack the strongest remaining UNKNOWN: lease temporal/replay support. Search canonical history for explicit consumption/replay/expiry transitions and determine whether the distinction has a legal future separator or can be reconstructed.
