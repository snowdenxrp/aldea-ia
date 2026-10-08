# STEP 7 — Minimum Protected PolicyContext Evidence Facts Attack — 2026-10-08

Status: ATTACK COMPLETE — REFINEMENT REQUIRED

## Results

### policyRef
Safe only as a binding reference. id/version/hash identify governed policy content but do not establish current authority.

### context
Safe only when established from actual protected claim/mission context. Provider-supplied scope/context cannot define applicability.

### policyFacts
Safe only when they are governed semantic facts for this evaluation. They must not become an implicit universal policy engine or carry precomputed authority.

### dependencyFacts
Safe only for claim-critical dependencies required by governed policy semantics. They must not become a universal dependency graph, generic identity service, or global revision substitute.

### temporalFacts
Safe only as policy-governed currentness/expiry evidence. They must not become generic fencing or authority-epoch machinery.

### provenanceFacts
This is the strongest trust boundary. It cannot authenticate itself. Its meaning depends on the protected establishment boundary that produced the evidence. A plain object containing source, verified, or authoritative fields is insufficient.

## Root refinement
The six categories are semantically sound, but provenanceFacts cannot be treated as ordinary caller-provided data.

The concrete contract must distinguish ordinary evidence/facts from the protected boundary's established provenance context.

The provenance context is an output of the protected establishment boundary, not a caller-declared property.

No new ID or operation identity is invented to accomplish this.

## Decision
Do not implement the six-category object as a public provider-facing constructor.
Next action: define the smallest protected-boundary creation capability whose output can carry these facts without allowing callers to self-attest provenance.