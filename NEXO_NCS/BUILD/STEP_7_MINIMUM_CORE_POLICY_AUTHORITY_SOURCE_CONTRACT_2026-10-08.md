# STEP 7 — Minimum Core Policy Authority / Policy Source Contract — 2026-10-08

Status: DESIGN CANDIDATE — ATTACK REQUIRED BEFORE IMPLEMENTATION

## Research basis
MASTER defines the protected owner chain `Mission/Goal → Request/Effect Identity → Policy/Admission → Coordination/Fencing → Execution` and the Policy Contract vocabulary: id/version/hash, scope, evidence requirements, freshness, independence, thresholds/reference values, assumptions, failure conditions, tests, owner/authority, expiry, dependencies.
MASTER also defines the semantic chain `CLAIM → POLICY → REFERENCES → VERIFIER → EVIDENCE → RESULT → DECISION`.
AB/P reinforce that policy version is not compatibility, epoch ordering is not authority ordering, metadata is not authority, and missing protected evidence remains UNKNOWN.

## Minimum semantic contract
The Core-owned Policy Authority/Policy Source boundary must establish four things and nothing more:
1. Governed policy identity: id + semanticVersion + content hash.
2. Governed policy semantics: the actual policy contract/content that Core will evaluate.
3. Applicability authority: the governed scope/owner/authority relationship that permits this policy to be considered for the actual mission/claim context.
4. Required semantic dependencies: governed references/requirements needed to evaluate applicability and policy semantics.

## Protected output
A protected policy source result conceptually contains:
- policyRef: id, semanticVersion, hash
- policySemantics: governed semantic content used for evaluation
- applicabilityContext: Core-provided mission/claim context + governed scope result inputs
- requiredDependencies: governed dependency references/evidence
- establishmentProvenance: established by the protected boundary itself

Importantly, it does NOT contain or decide:
- admission
- authorization to execute
- final claim validation
- SAFE_COMMIT
- execution outcome
- external-effect outcome
- STOP/revocation enforcement.

## Ownership rule
Policy owner/authority is part of the governed Policy Contract. Merely declaring `owner` or `authority` in caller input does not establish it. The protected source boundary must resolve the governed policy whose authority relationship Core recognizes.

## Version / compatibility rule
semanticVersion identifies policy semantics; hash binds the exact semantic content; compatibility with current authority/context remains a separate governed relation. No version ordering is treated as authority ordering.

## UNKNOWN rule
If policy content, authority/applicability, required dependency, or current validity cannot be established, the boundary returns UNKNOWN/PENDING rather than manufacturing a usable policy.

## Future-countereffect
Current benefit: creates the missing root owner without making the resolver itself authoritative.
Future risk avoided: prevents one monolithic universal Policy engine and prevents provider/model dependence.
Evolution: policy storage, representation, provider, and retrieval mechanism can change behind the semantic boundary without changing Claim/Admission/Validation contracts.

## Explicit non-goals
No new SelectorAuthority, SchedulerAuthority, generic trust flag, universal dependency graph, operation ID, queue, retry, tombstone, epoch, fence, or compatibility wrapper.