# NEXO CONTINUITY — AB104.317

## Canonical state
AB104.317 research persisted. No implementation performed.

## Finding
Evidence count is not evidence independence. Replicas/archives can share common-mode dependencies such as storage, power, software, credentials, operators, upstream inputs, or restore snapshots. Multiple agreeing copies can therefore share one failure root. citeturn0search0turn0search1turn0search25

## Required semantics
Represent evidence dependencies explicitly. Independence is claim/threat-model specific; no numeric threshold selected. A common root covering all available evidence leaves the claim UNKNOWN even if every copy agrees.

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.318: investigate authenticated evidence-dependency graphs across archive/restore and whether the dependency graph itself becomes a common-mode trust root.

## DO-NOT-REPEAT
Do not equate number of replicas, signatures, archives, or quorum members with independent evidence without analyzing shared dependencies.
