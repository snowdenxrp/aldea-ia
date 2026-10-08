# STEP 7 — Minimum Protected PolicyContext Evidence Establishment Capability — 2026-10-08

Status: DESIGN CANDIDATE — IMPLEMENTATION NOT AUTHORIZED

## Evidence basis
MASTER: provider/model proposes; Core governs protected state; provenance and claim-critical dependencies must survive; UNKNOWN is first-class.
AB: authority and target validity are independent; helper/cache/derived values are not authority boundaries; missing evidence is UNKNOWN; identity/incarnation and provenance dimensions must not be collapsed.
P/P112: policy applicability, dependency completeness and temporal validity cannot be inferred from provider confidence or incomplete evidence.

## Capability boundary
Only a protected Core-owned capability may establish a ProtectedPolicyEvidence context.

Conceptual operation:
establishPolicyEvidence(governedPolicyRef, claimContext, authoritativeInputs) -> ProtectedPolicyEvidence | UNKNOWN/PENDING

This is a semantic boundary, not an operation/effect identity.

## Required establishment responsibilities
1. Bind the governed policy reference to the policy semantics actually evaluated.
2. Bind the evaluation context to the actual claim/mission context supplied by Core.
3. Establish policy facts from governed policy content, not provider assertions.
4. Establish only claim-critical dependency facts required by governed semantics.
5. Establish temporal facts when required by policy.
6. Establish provenance as a property of the protected establishment boundary itself.
7. Preserve unresolved or unavailable facts as UNKNOWN/PENDING rather than manufacturing values.

## Provenance rule
The returned evidence may carry provenance describing the protected establishment path, but the caller cannot construct an equivalent object and thereby acquire the same protected meaning.

No `trusted`, `verified`, `authoritative`, or source flag grants this capability.

## Separation rules
The capability does not:
- authorize a claim;
- decide admission;
- execute an action;
- commit state;
- enforce STOP/revocation;
- resolve external effects;
- declare SAFE_COMMIT.

PolicyContext VALID remains contextual evidence only.

## Revalidation / TOCTOU
The established evidence is valid for the policy/context resolution from which it was produced. Before a later protected transition, material policy/context changes require a new establishment/evaluation path.

This is not a new fence, epoch, retry, or operation identity mechanism.

## Future-countereffect
Current benefit: establishes a real trust boundary instead of a trust flag.
Future risk avoided: prevents every provider from becoming a policy authority and avoids coupling Core to one policy store.
Evolution: underlying policy acquisition can change while the semantic capability remains stable.

## Decision
Contract is narrow enough for an adversarial attack. Implementation remains paused.