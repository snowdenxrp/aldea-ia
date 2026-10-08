# STEP 7 — Protected PolicyContext Evidence Boundary Attack — 2026-10-08

Status: ATTACK COMPLETE — CONTRACT SURVIVES

## Attacks

1. Provider self-attestation
A provider cannot create authority by setting authoritative/verified/trusted/source fields. The boundary, not metadata, establishes protected evidence.

2. Policy-reference substitution
Evidence must be bound to the governed policy reference. A different id, semanticVersion, or hash cannot silently reuse evidence.

3. Scope substitution
The evaluator receives actual claim/mission context. A provider-supplied scope assertion cannot replace the governed applicability check.

4. Dependency laundering
A dependency list is not proof of closure. Required roots and relations come from governed semantics; missing or unresolved claim-critical dependencies remain UNKNOWN.

5. Temporal laundering
A missing expiry/currentness fact cannot become infinite validity. Material change requires re-evaluation.

6. Circular resolver trust
The evaluator cannot treat its own prior output as fresh authoritative evidence. Evidence establishment precedes evaluation.

7. TOCTOU
VALID is context evidence, not a durable authorization token. Protected transitions must re-evaluate material policy/context changes.

8. Authority leakage
The boundary exposes no authorization, admission, execution, commit, or external-effect capability.

9. Future coupling
The contract does not require a specific provider, policy store, queue, ID, retry mechanism, or transaction wrapper.

## Decision

No root contradiction found. The protected evidence boundary is sufficiently narrow to proceed to a minimal contract representation.

The next implementation must represent the boundary itself, not simulate authority with boolean trust metadata.
