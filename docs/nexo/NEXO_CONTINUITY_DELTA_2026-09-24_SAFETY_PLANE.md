# NEXO — CONTINUITY DELTA: SAFETY-PLANE UPDATE / ROLLBACK
Fecha: 2026-09-24

## Status
DESIGNED / RESEARCH-CROSS-CHECKED.
Not implemented, not TLC-verified, no fault injection claimed.

## Research
Cross-checked NIST SP 800-193, SLSA 1.2, GitHub Artifact Attestations, and Sigstore Policy Controller.

Key external findings:
- NIST SP 800-193 separates protection, detection and recovery and requires authenticated recovery/update paths; it recommends independent protection of recovery mechanisms.
- SLSA 1.2 treats provenance as verifiable supply-chain evidence, with higher levels increasing resistance to tampering.
- GitHub explicitly states that artifact attestations are not themselves proof that an artifact is secure; policy and content evaluation remain necessary.
- Sigstore Policy Controller demonstrates admission based on verifiable signatures/attestations and policy, including digest binding.

## Architectural result
New artifact:
docs/nexo/PG-009_SAFETY_PLANE_UPDATE_ROLLBACK_BOOTSTRAP_2026-09-24.md

Core distinction:
UPDATE AUTHENTICITY != UPDATE AUTHORIZATION
PROVENANCE != SAFETY
SIGNATURE VALIDITY != SEMANTIC COMPATIBILITY
ROLLBACK != TIME TRAVEL
RECOVERY IMAGE != AUTOMATIC TRUST

Safety-plane update chain:
PROPOSE → IDENTIFY → HASH/BIND → PROVENANCE VERIFY → SIGNATURE VERIFY → BUILDER/SOURCE POLICY → DEPENDENCY CLOSURE → SEMANTIC/POLICY COMPATIBILITY → SAFETY DELTA → THREAT/COMMON-MODE REVIEW → INDEPENDENT ADMISSION → STAGE → ATTEST → FENCE OLD → ACTIVATE → VERIFY → RECONCILE → COMMIT.

New requirements:
- digest-bound admission;
- protected trust roots;
- independent/threshold recovery authority where required;
- explicit mixed-version admission;
- rollback compatibility checks;
- anti-downgrade epoch;
- update journal;
- recovery path independent from the active plane;
- semantic safety checks;
- common-mode analysis;
- STOP remains sticky during update/reboot/recovery.

New invariants INV-649..668.

## Verification status
Architecture: DESIGNED / RESEARCH-CROSS-CHECKED.
Implementation: NOT IMPLEMENTED.
Formal: NOT TLC-VERIFIED.
Fault injection: NOT RUN.
World verification: NOT CLAIMED.

## Git persistence
Artifact commit:
de070ffcdfb6b55ddeb9aef189a5da509ea74157

## Next
Common-mode/correlated-failure analysis across safety, recovery, update, identity, storage, network, policy, verifier and executor domains; then expand/correct formal modeling and synchronize canonical documentation.
