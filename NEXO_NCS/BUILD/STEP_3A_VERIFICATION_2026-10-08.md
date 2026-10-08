# NEXO NCS — STEP 3A VERIFICATION — 2026-10-08

## Purpose
Targeted verification before STEP 3B. This is not a historical audit and does not reopen AB105/TLC.

## Repository state verified
- NEXO_NCS/STATUS.md points to STEP 3B.
- Final distillation and construction design agree on the protected-transition architecture.
- STEP 3A files exist under the new Core namespace with no legacy integration:
  - src/nexo/core/contracts.mjs
  - src/nexo/core/ownership.mjs
  - tests/nexo/core-contracts.test.mjs

## External standards spot-check
Targeted current web review did not reveal a contradiction with the architecture:
- NIST AI RMF treats governance as cross-cutting and risk management as continuous across the AI lifecycle.
- W3C Verifiable Credential Data Integrity 1.0 is a Recommendation and supports cryptographic integrity/authenticity of claims.
These sources are supporting context, not proof of Nexo implementation.

## Verification finding — BLOCKER BEFORE STEP 3B
The implementation/evidence wording currently overstates STEP 3A in one place.

contracts.mjs:
- createClaimEnvelope deep-detaches target, targetIncarnation and policyContext.
- But authoritativeReads, dependencies, predicateDependencies, derivedProvenance, causalInputs and sourceProvenance are only copied into new arrays and shallow-frozen.
- Nested mutable objects inside those arrays therefore remain aliased to caller-owned objects.
- createCandidate stores the supplied state by reference; actual candidate isolation is intentionally NOT implemented yet.

Therefore the phrase in STEP_3A that says "claim input detachment/immutability" is only fully demonstrated for the tested target path, not for every claim-critical collection.

## Semantic classification
This is NOT evidence that the architecture is wrong.
It is an implementation/evidence mismatch that must be resolved before claiming the first isolation/provenance gate complete.

Required response:
STOP at the boundary; do not patch blindly.
Before STEP 3B proceeds, define the exact detachment contract for ClaimEnvelope fields and Candidate state, then implement/test the smallest mechanism that satisfies the existing architecture.

## UNKNOWN / PENDING
- Focused runtime test execution remains unverified in the prior environment.
- Full candidate isolation remains unimplemented.
- Full claim-provenance deep detachment remains unimplemented.

## DO-NOT-REPEAT
- No TLC rerun.
- No AB105.117R.
- No sequential AB104/AB105 replay.
- No legacy orchestrator patching.
- No architecture rewrite unless the contract itself proves contradictory.

## Next exact action
Resolve the ClaimEnvelope/Candidate detachment contract at the implementation boundary, then continue STEP 3B only after focused tests demonstrate the invariant.
