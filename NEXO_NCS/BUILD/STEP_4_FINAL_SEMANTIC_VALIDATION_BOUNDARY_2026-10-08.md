# NEXO STEP 4 — FINAL SEMANTIC VALIDATION BOUNDARY — 2026-10-08

## Scope

STEP 3C closed the canonical conditional snapshot-commit boundary. STEP 4 defines the smallest real FinalSemanticValidator contract before implementation.

This step does not reopen historical audits and does not add speculative transaction infrastructure.

## Why this boundary is next

The current protected-transition composition already makes FinalSemanticValidator mandatory, but the implementation is only a port/skeleton. A PASS currently has no Core-defined semantic obligations.

Therefore SAFE_COMMIT could otherwise mean only:

- authority passed,
- candidate was isolated,
- a validator returned PASS,
- persistState accepted the expected revision.

That is insufficient for a protected transition.

## Final Semantic Validation meaning

FinalSemanticValidator is the last semantic gate before ConditionalCommit.

It must establish that the candidate still satisfies the claim under the authoritative conditions and dependencies represented by the ClaimEnvelope.

It MUST NOT merely repeat that:

- a candidate exists;
- authority was previously authorized;
- expectedRevision is unchanged;
- the candidate executor returned normally.

## Minimum validation boundary

For STEP 4, PASS requires all applicable claim-critical conditions to be positively established:

1. Claim identity remains bound to the candidate.
2. Target and target incarnation, when claim-relevant, still match the claim.
3. Required authoritative reads remain valid/current according to the claim contract.
4. Declared direct and transitive dependencies required by the claim remain satisfied.
5. Predicate/range/aggregate dependencies required by the claim remain satisfied.
6. Relevant policy/config/logic versions remain the ones under which the claim is valid.
7. Causal random/time/external/provider inputs required by the claim remain valid where applicable.
8. Candidate invariants required by the claim hold.
9. No required evidence is missing, ambiguous, stale, contradictory, or merely inferred from a non-authoritative helper/cache.
10. Validation evidence is returned with the PASS result.

If any required condition is disproven: FAIL.

If a required condition cannot be established: UNKNOWN.

UNKNOWN is never PASS.

## Ownership

FinalSemanticValidator:

- reads the candidate and claim;
- evaluates semantic predicates;
- may consult authoritative evidence through its supplied validation context;
- returns ValidationResult only;
- cannot mutate canonical state;
- cannot commit;
- cannot authorize;
- cannot declare a terminal protected-transition outcome.

ConditionalCommit remains the only canonical mutation owner.

## Inputs

The validator receives a candidate carrying:

- ClaimEnvelope;
- isolated candidate state;
- expectedRevision.

The validator may additionally receive a validation context containing authoritative observations/services explicitly owned by the Core composition.

No hidden global state or provider-only side channel may become a validation dependency.

## Result contract

ValidationResult remains the existing union:

- PASS + evidence
- FAIL + reasons/evidence
- UNKNOWN + reasons/evidence

A PASS without evidence for the conditions it claims to establish is structurally invalid for protected transitions.

## Non-bypass invariants

1. ConditionalCommit cannot run unless validation returns PASS.
2. PASS cannot be produced from UNKNOWN or missing evidence.
3. Validation cannot use global revision as a substitute for semantic dependency validation.
4. Helper/cache/derived values cannot silently become authoritative evidence.
5. Claim-critical dependencies cannot be omitted from the validation decision.
6. Validator cannot mutate canonical state.
7. Validator cannot invoke ConditionalCommit.
8. Validator cannot convert a disproven condition into UNKNOWN merely to preserve execution.
9. Validator cannot convert missing evidence into PASS.
10. A structural contradiction in the validator contract triggers STOP/redesign, not an adapter patch.

## Minimal implementation target

Implement only the semantic validation contract and deterministic tests for:

- PASS when every required condition is established;
- FAIL when a required predicate is disproven;
- UNKNOWN when required evidence is unavailable;
- rejection of missing claim-critical evidence;
- rejection of helper/cache evidence when authoritative evidence is required;
- candidate/claim identity mismatch;
- proof that validator cannot mutate canonical state or invoke commit through its owned interface.

Do NOT add:

- universal transaction wrappers;
- queues;
- run IDs;
- effect tombstones;
- distributed fencing infrastructure;
- compatibility layers;
- external-effect execution.

Those remain outside STEP 4 unless a concrete construction contradiction proves otherwise.

## Epistemic state

🔵 Design boundary established from the final distillation and construction contracts.

🟢 Existing composition proves that validation is mandatory before commit.

🔴 The current code does NOT yet prove the semantic obligations above.

## Next action

Implement the smallest deterministic FinalSemanticValidator contract, then runtime-verify it in GitHub Actions.

If implementation reveals that ClaimEnvelope lacks information required to decide a protected predicate, STOP and extend the claim contract deliberately before proceeding.
