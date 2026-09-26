# NEXO AB104.360 — Authenticated conflict resolution without circular trust V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RATS separates Evidence, Verifier appraisal policy, Attestation Results, and Relying-Party authorization policy. Trust in a Verifier is represented by configured trust anchors, while the relying party applies its own policy to results. citeturn0search0 RATS also notes that freshness is policy-defined and that delayed/reordered epoch information can make past evidence appear current, so a resolver must not treat freshness or numerical epoch alone as authority. citeturn0search0

## Finding
A conflict resolver must be **downstream of an already trusted authority policy**, not an authority that validates itself through the conflicting evidence.

Candidate resolution record:
resolution_id + conflict_id + policy_id + policy_version + policy_authority + input_branch_digests + required_quorum_rule + dependency_closure + decision_frontier + freshness + resolution_status

Candidate states:
RESOLUTION_AUTHORIZED | POLICY_STALE | POLICY_SCOPE_MISMATCH | DEPENDENCY_INCOMPLETE | QUORUM_UNSATISFIED | CONFLICT_PRESERVED | UNKNOWN | CONFLICT

## Safe resolution rule
A resolver may collapse competing branches only when:
1. the resolution policy was authenticated independently of the branches being resolved;
2. policy version/scope was current for the relevant authority frontier;
3. every input branch is bound by digest, authority, epoch/frontier and semantic scope;
4. quorum/intersection rules were defined before the conflict;
5. dependencies of the policy itself are closed for the claim;
6. the resolution result records both the conflict and the exact policy that resolved it.

Otherwise preserve both branches and remain CONFLICT/UNKNOWN.

## Key invariant
POLICY_AUTHENTICATED != POLICY_CURRENT
POLICY_CURRENT != POLICY_SUFFICIENT
QUORUM_SATISFIED != EXTERNAL_TRUTH
RESOLUTION_RESULT != ERASED_CONFLICT

This fits the RATS separation: authentication of evidence and appraisal are distinct from the relying party's authorization decision. citeturn0search0

## Status
Exact conflict policy language, quorum/intersection semantics and policy-rotation interaction remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.361 — study policy rotation during an active conflict: how Nexo prevents an old policy from resolving a new conflict or a new policy from retroactively changing an already authenticated historical resolution.
