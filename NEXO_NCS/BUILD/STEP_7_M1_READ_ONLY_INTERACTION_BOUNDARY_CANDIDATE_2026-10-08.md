# STEP 7 — M1 Read-only Interaction Boundary Candidate
Date: 2026-10-08
Status: DESIGN CANDIDATE ONLY — not implemented, not commissioned, local execution not yet evidenced.

## Why this slice
The prior source reviews found no existing Nexo client or local inference runtime. Existing Lúmina assistants are simulation diagnostics and their mission/memory path is excluded. This note derives only the smallest semantic boundary for a first read-only interaction slice; it does not select a model, platform, or deployment root.

## Governing MASTER / NCS constraints
- Cognition ≠ authority ≠ execution ≠ verification.
- Model/provider output is untrusted proposal/evidence, not protected authority.
- UNKNOWN remains UNKNOWN; missing evidence is not PASS.
- Nexo is independent from Lúmina, model, OS, device, and UI.
- No tools/effects, persistent memory, network egress, or silent remote fallback in this candidate M1 slice.
- This boundary does not establish or bypass the separately blocked Genesis Trust Foundation / Path B gate.

## Semantic request boundary — candidate
A request consists only of:
1. user-supplied interaction content;
2. explicitly permitted ephemeral context needed to answer that request;
3. the selected interaction mode and its enforced constraints.

This is a semantic description, not an approved field schema. Do not invent request IDs, sample IDs, identity assertions, trust claims, or provenance fields unless a concrete requirement establishes them.

The request boundary must not silently import:
- Lúmina simulation state or assistant reports;
- historical learning memory or mission state;
- credentials, Vault material, device secrets, or authority-bearing capabilities;
- implicit remote context, retrieval, telemetry, or provider calls.

If a future requirement needs any excluded input, it must be separately justified and reviewed rather than silently added to M1.

## Semantic response boundary — candidate
A response contains:
1. generated user-facing content;
2. explicit uncertainty/unavailability when the model or required local resources cannot answer;
3. optional explanation of limitations, without asserting that an unverified claim is a fact.

The response is an untrusted generated proposal. It does not itself establish truth, identity, authority, policy, permission, execution, durable memory, or successful world change. Any future protected action must enter a separately specified Core claim/authority/validation/commit path; it cannot be smuggled through response text.

## Required failure behavior
- Local runtime/model unavailable: return an explicit unavailable/error outcome.
- Network blocked or connectivity absent: remain local-only and unavailable; never fall back to a remote provider.
- Required context missing or contradictory: state uncertainty or decline the unsupported part; do not manufacture evidence.
- Any attempt to invoke tools, modify state, persist memory, or perform an external effect: outside M1 scope and must not execute.
- Any claim of no-egress or device enforcement remains UNKNOWN until supported by implementation-specific evidence and tests.

## Boundary exclusions
M1 does not include:
- trust-root recognition, commissioning, identity enrollment, or authority granting;
- protected state transitions, tools, external effects, or remote services;
- durable user memory, learning from conversations, mission scheduling, or autonomous background work;
- claims of complete privacy, production readiness, robust sandboxing, or guaranteed local inference.

## Compatibility with existing Core contracts
The existing Core contracts support semantic distinctions useful for later protected operations: untrusted proposal, explicit authority states, validation PASS/FAIL/UNKNOWN, and non-boolean terminal outcomes. They do not constitute a client or local model runtime, and the protected-transition pipeline must not be forced around ordinary read-only text generation where no protected state transition occurs.

The createCorePorts() function defaults to unimplemented ports; the authority gate is injected. Therefore these modules do not prove independently recognized authority. The Genesis trust-foundation gate remains STOP.

## Design review / unresolved claims
- 🟢 The semantic separation between generated content and authority is grounded in MASTER and the current Core design.
- 🟢 Excluding the Lúmina diagnostic/mission path is grounded in source inspection and P112 provenance findings.
- 🔵 The request/response boundary above is a candidate semantic contract for review, not an approved immutable schema.
- 🔴 A local inference runtime, strict no-egress enforcement, prevention of remote fallback, and device-level enforcement are not demonstrated by current inspected repository evidence.
- 🔴 No independently recognized trust foundation/Path B deployment artifact is established.

## Exit criteria before implementation
1. Review this semantic boundary against MASTER and the existing Core contract set; resolve contradictions at the design root, not with patches.
2. Identify concrete target platform/runtime evidence or explicitly record that none is available.
3. Specify and verify the enforcement mechanism for no-egress and remote-fallback prohibition before making those claims.
4. Keep Genesis trust recognition separately blocked; do not infer authority from successful local inference.
5. Obtain explicit implementation authorization before changing code, adding dependencies, selecting a provider/platform, or creating runtime/network/persistent paths.

No code or tests were changed or run for this candidate.