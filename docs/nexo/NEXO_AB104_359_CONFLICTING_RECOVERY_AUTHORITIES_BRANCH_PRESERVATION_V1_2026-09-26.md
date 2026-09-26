# NEXO AB104.359 — Conflicting recovery authorities and evidence-branch preservation V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS separates evidence from appraisal policy and the relying party's decision; authenticated evidence does not itself determine authorization. It also notes freshness is policy-dependent and that delayed/reordered epochs can make old evidence appear current. citeturn0search0turn0search3 RFC 6024 treats trust-anchor management as policy-controlled authority rather than self-validating certificate content. citeturn0search2

## Finding
When two independently authenticated recovery authorities produce different frontiers, Nexo must preserve both statements as evidence and avoid silently selecting the numerically larger/newer one.

Candidate conflict record:
conflict_id + claim_id + authority_A + authority_B + statement_digest_A + statement_digest_B + frontier_A + frontier_B + dependency_digests + freshness + scope + detection_frontier

Candidate states:
BRANCH_A_SUPPORTED | BRANCH_B_SUPPORTED | INCOMPARABLE | POLICY_RESOLVED | CONFLICT | UNKNOWN

## Rule
If both statements are authentic but their authority/frontier relation is not ordered by an authenticated transition or pre-established quorum policy:
INCOMPARABLE != NEWER
AUTHENTIC_BRANCH != CURRENT_AUTHORITY
MAX_REVISION != VALID_RESOLUTION

Nexo should retain both evidence branches, record the contradiction, and block any effect whose safety depends on choosing between them. Resolution is admissible only when an already-trusted policy defines the authority ordering/quorum semantics and the resolution itself is bound to the conflicting statements.

## Important distinction
A higher numeric epoch/revision cannot automatically defeat a lower one because epochs may be delayed, reordered, scoped differently, or issued under different authority configurations. RATS explicitly documents delayed/reordered epoch confusion as a freshness threat. citeturn0search0turn0search24

## Status
Exact branch data structure, conflict-resolution protocol and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.360 — study authenticated conflict resolution: how a pre-established authority policy can safely collapse competing branches without allowing the conflict resolver itself to become a circular trust dependency.
