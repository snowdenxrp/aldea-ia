# NEXO — STEP 4 Runtime Verification — 2026-10-08

## Runtime evidence
- Workflow: Nexo — STEP 4 semantic validation
- Run: 37784767180
- Job: 113336577540
- Commit: 8cb6ea83dc8ba70bbbd9abfd7ff763b801720576
- Node.js: 22.23.3
- Result: SUCCESS

## Verified
- Final semantic validator executes successfully in GitHub Actions.
- PASS with required authoritative evidence.
- FAIL on disproven dependency/predicate.
- UNKNOWN on unavailable, missing, or non-authoritative evidence.
- Claim identity, target, and target-incarnation binding.
- Cache/helper/derived evidence cannot satisfy a required authoritative condition.
- authoritativeReads, dependencies, predicateDependencies, and causalInputs participate in required evidence coverage.
- policyContext is required and must match when claim-declared.
- Validator exposes no canonical commit capability.

## Epistemic limits
This proves the STEP 4 validator contract tests execute successfully in CI. It does not prove distributed fencing, universal writer participation, external-effect correctness, exactly-once behavior, power-loss durability, or production safety. Those remain future contracts/evidence boundaries.
