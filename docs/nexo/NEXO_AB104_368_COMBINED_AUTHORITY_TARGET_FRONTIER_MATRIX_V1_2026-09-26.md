# NEXO AB104.368 — Combined authority × target frontier matrix V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 7232 requires conditional state-changing preconditions to be evaluated before the mutation; a failed If-Match condition prevents the method unless the server can verify the requested final state already exists. citeturn0search0turn0search5 RFC 6024 separately requires replay detection for trust-anchor management, because replay can reintroduce old authority. citeturn0search1turn0search6

## Finding
Compensation admission needs two independent frontiers:
A = current authority/policy frontier
T = authoritative target-state frontier

Neither alone is sufficient.

| A | T | Admission |
|---|---|---|
| VALID | VALID + expected version | CANDIDATE_ADMIT |
| VALID | MISMATCH | REJECT/REVALIDATE |
| VALID | UNKNOWN | UNKNOWN/STOP |
| UNKNOWN | VALID | UNKNOWN/STOP |
| UNKNOWN | UNKNOWN | UNKNOWN/STOP |
| CONFLICT | VALID | CONFLICT/STOP |
| VALID | CONFLICT | CONFLICT/STOP |
| CONFLICT | CONFLICT | CONFLICT/STOP |

## Race closure
The strongest candidate boundary is a single target-side decision point where current authority/fence and target precondition are both validated immediately before mutation. RFC 7232 supports the target-side ordering principle; it does not provide Nexo's authority-fencing mechanism. citeturn0search5

## Important limitation
A valid A + valid T does not automatically prove external side effects outside that target boundary, nor historical non-execution elsewhere. Multi-target contracts still require per-target evidence.

## Status
Exact authority/target atomic binding protocol remains UNSELECTED. No implementation; no formal verification.

## Next
AB104.369 — research whether the authority frontier and target CAS can be bound atomically at one effect boundary, and the failure semantics if authority changes during that boundary.
