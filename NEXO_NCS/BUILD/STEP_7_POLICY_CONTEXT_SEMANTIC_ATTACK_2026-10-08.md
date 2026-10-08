# STEP 7 — PolicyContext semantic attack — 2026-10-08

## Result

🟢 The typed ClaimEnvelope.policyContext boundary survives the current semantic attack without requiring a root redesign.

This review is limited to the transport/schema boundary. It does not implement a resolver or policy engine.

## Attack 1 — VALID vs PASS

`VALID` belongs to the policy-context validity domain. `PASS` belongs to Claim final-validation.
Therefore they remain distinct. Context VALID cannot become Claim PASS, admission, authority, SAFE_COMMIT, or execution.

## Attack 2 — resolutionProvenance self-assertion

`resolutionProvenance` is a detached evidence carrier. Its contents are not authenticated merely because the constructor accepts them.
A provider may supply source metadata, but that does not establish Protected Core produced or verified it. The future resolver/verification boundary must establish provenance.

## Attack 3 — dependencies

`resolved.dependencies` proves only container shape. It does not prove completeness, freshness, compatibility, authority, successful resolution, or transitive closure.
Those are resolver obligations. Missing/unknown claim-critical dependency evidence remains UNKNOWN.

## Attack 4 — scope

Presence of `scope` is not proof of applicability. Applicability requires governed policy semantics plus relevant mission/goal/claim context. No default global scope is inferred.

## Attack 5 — expiresAt

`expiresAt` cannot be globally mandatory because policy semantics may define policies without hard expiry.
If the governed policy requires expiry and it is absent/invalid, resolution cannot report current VALID; it must report UNKNOWN or the contract-defined failure. Absence never means 'never expires' or 'currently valid'.

## Attack 6 — hash/version vs authority

`policyRef.id + semanticVersion + hash` identifies/binds policy content and semantic version. It does not establish current authority, applicability, authorization, STOP/revocation state, execution permission, or commit safety.

## Future-countereffect review

🟢 Current benefit: typed policy context prevents arbitrary unstructured ClaimEnvelope policy data.
🟠 Future risk avoided: making this constructor authenticate provenance, evaluate arbitrary dependency graphs, infer applicability, or enforce universal expiry would turn a transport contract into a monolithic policy engine.
🔵 Replaceability: policy-specific semantics remain governed outside this low-level schema, allowing future policy contracts/resolvers to evolve without freezing one universal selector/validator.
🔴 No contradiction with MASTER/AB/P was found.

## Decision

Keep the current typed policyContext shape.
Do NOT add a new PolicyBinding top-level object, invented provenance-authentication fields, universal dependency-resolution fields, global expiry defaults, authority tokens, selector/priority/ranking, or compatibility wrappers.

Next construction obligation: define the smallest resolver contract that converts a governed policy reference plus required context into explicit context evidence/status, while remaining incapable of authorization, admission, commit, or external-effect resolution.