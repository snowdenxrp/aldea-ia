# STEP 7 — Minimum PolicyContext Resolver Semantic Attack — 2026-10-08

## Result

🟢 The minimum resolver boundary survives the adversarial review without requiring a root redesign.

## Attack 1 — TOCTOU / currentness
A resolver result is context evidence, not durable authorization. A material change after resolution requires revalidation at the protected transition. Therefore VALID cannot be reused as current authority.

## Attack 2 — dependency closure
The resolver cannot infer completeness merely because a dependencies array exists. Required dependency roots/closure must be defined by the governed policy semantics. Missing, stale, incompatible, or unresolved claim-critical dependencies remain UNKNOWN unless the governed contract explicitly defines a deterministic FAIL condition.

## Attack 3 — provenance substitution
A provider-supplied provenance record is not authenticated by schema acceptance. Protected resolution must establish provenance from an authoritative source. The resolver therefore cannot treat provider claims about its own authority as proof.

## Attack 4 — scope versus applicability
A syntactically valid scope is insufficient. Applicability requires the governed policy semantics plus actual claim/mission context. Missing required context remains UNKNOWN; explicit scope mismatch can be FAIL.

## Attack 5 — expiry
Expiry is policy-specific. A policy requiring hard expiry cannot be treated as currently valid when expiry evidence is missing or invalid. A policy without hard expiry is not forced into a universal expiry rule.

## Attack 6 — provider substitution / circular trust
The resolver must not accept the provider's own interpretation as the authoritative policy semantic result. Provider output may be evidence/input, but protected policy resolution must be grounded in governed policy content and authoritative context.

## Attack 7 — resolver becoming a universal policy engine
The contract remains deliberately narrow: resolve policy-context facts and status only. It does not select candidates, decide admission, authorize, execute, commit, or resolve external effects.

## Future-countereffect review

🟢 Current benefit: gives ClaimEnvelope a concrete, bounded policy-context resolution boundary.
🟠 Future risk avoided: avoids coupling Core to one universal policy engine, dependency database, provider, or expiry model.
🔵 Replaceability: policy-specific semantics remain governed contracts; resolver orchestration can evolve without changing authority/commit boundaries.
🔴 No contradiction with MASTER/AB/P was found.

## Decision

Keep the resolver contract unchanged.

The next construction action is to implement the smallest resolver that evaluates only supplied governed inputs and returns VALID/FAIL/UNKNOWN plus evidence/reasons/provenance, while exposing no authority or execution capability.

No new identity mechanism, queue, retry, tombstone, external-effect protocol, selector authority, or compatibility layer is justified.
