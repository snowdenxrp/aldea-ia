# NEXO — CONTINUITY DELTA: COMMON-MODE / CORRELATED FAILURE
Fecha: 2026-09-24

## Status
DESIGNED / RESEARCH-CROSS-CHECKED.
No implementation, quantitative safety claim, fault injection or TLC verification claimed.

## Research
Cross-checked NIST common-cause failure material, IEC 61508 functional-safety guidance, IEC 62340 CCF architecture, and NIST SP 800-193 independent recovery protection. Sources support the analysis pattern but do not certify Nexo.

## Finding
Process separation is not independence.

Nexo must model dependency closure and failure domains for every critical safety claim. Shared host, kernel, hypervisor, storage, network, identity, KMS/trust root, policy, artifact, builder, model/provider, data, clock, administrator, coordination store, recovery mechanism and semantic specification can create correlated failure.

## Architecture
Critical claim:
SAFETY CLAIM → DEPENDENCY CLOSURE → FAILURE-DOMAIN ANALYSIS → COMMON-MODE ANALYSIS → DIVERSITY/INDEPENDENCE EVIDENCE → ASSURANCE LEVEL → ADMISSION.

Independence levels I0-I5 are architectural assurance labels, not universal safety levels.

UNKNOWN dependency is not NO dependency and cannot silently increase assurance.

Evidence corroboration requires relevant dependency separation. Two observations from one compromised source are not automatically independent.

Recovery must record trusted/compromised domains and cannot recreate multiple independent claims from one compromised snapshot without qualification.

Update changes that collapse failure domains require governed safety review.

New invariants INV-669..690.

## Artifact
docs/nexo/PG-009_COMMON_MODE_CORRELATED_FAILURE_2026-09-24.md

Git commit:
e790b4aa576f64a019e5a098d2493463a77aebd3

## Verification
Architecture: DESIGNED / RESEARCH-CROSS-CHECKED.
Implementation: NOT IMPLEMENTED.
Formal: NOT TLC-VERIFIED.
Fault injection: NOT RUN.
Quantitative CCF model: NOT DONE.

## Next
Correct/expand recovery TLA+, add dependency/failure-domain state, model update/rollback transitions, define executable safety-claim/dependency-closure schema, implement fault injection, run TLC, then perform final PG-009 semantic reconciliation.
