# NEXO CONTINUITY — AB104.368

AB104.368 persisted. Research only; no implementation.

## Finding
Two independent frontiers govern compensation admission:
A = current authority/policy frontier
T = target state/version/incarnation frontier

Matrix:
- A VALID + T VALID => ADMISSIBLE candidate, subject to full contract.
- A VALID + T STALE => REJECT/REVALIDATE.
- A VALID + T UNKNOWN => UNKNOWN/STOP.
- A STALE + T VALID => REJECT/REVALIDATE.
- A STALE + T STALE => REJECT.
- A UNKNOWN + T VALID => UNKNOWN/STOP.
- A UNKNOWN + T UNKNOWN => UNKNOWN/STOP.
- semantic/lineage conflict between apparently valid A/T => CONFLICT/STOP.

RFC 7232/9110 confirms target-state conditional preconditions are evaluated before mutation and failed preconditions prevent mutation. citeturn0search0turn0search5 But target CAS does not establish current authority; current authority does not establish target state.

Candidate strongest boundary: one target-side decision point validates current authority/fence AND target CAS/version immediately before mutation. This remains an architectural candidate, not an implemented/verified protocol.

Constraints: no V21, no implementation, no formal verification claim, preserve AB50–AB58 residuals, no overwrite/delete.

Exact next action: AB104.369 — atomic binding of authority frontier + target CAS and failure semantics if authority changes during the boundary.

DO-NOT-REPEAT: never collapse authority validity and target-state validity into one scalar.
