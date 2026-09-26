# NEXO CONTINUITY — AB104.368

AB104.368 persisted. Research only; no implementation.

## Finding
Compensation admission requires TWO frontiers:
A = current authority/policy frontier
T = authoritative target-state frontier

Neither alone is sufficient.

Matrix:
- A VALID + T VALID/expected => candidate admission
- A VALID + T MISMATCH => REJECT/REVALIDATE
- A VALID + T UNKNOWN => UNKNOWN/STOP
- A UNKNOWN + T VALID => UNKNOWN/STOP
- either CONFLICT => CONFLICT/STOP

RFC 7232 requires state-changing preconditions to be evaluated before mutation and permits a verified already-applied final state to be treated as successful; RFC 6024 separately requires replay detection for authority-management transactions. citeturn0search0turn0search1

Candidate strongest boundary: one target-side decision point validates current authority/fence AND target CAS/version immediately before mutation. This is a Nexo architectural candidate, not an implemented/verified protocol.

Constraints: no V21, no implementation, no formal verification claim, preserve AB50–AB58 residuals, no overwrite/delete.

Exact next action: AB104.369 — atomic binding of authority frontier + target CAS and failure semantics if authority changes during the boundary.

DO-NOT-REPEAT: valid authority alone or valid target version alone never proves safe compensation.
