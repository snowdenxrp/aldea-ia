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
## Adversarial contradiction review — 2026-10-08

Reviewed against the current NCS Step 6 handoff, NEXO_MASTER_ARCHITECTURE_2026-09-23, NEXO_CORE_CONSTRUCTION_DESIGN_2026-10-08, existing Core contract unions, and the Trust Foundation contract attack.

| Attack / ambiguity | Result | Required interpretation |
|---|---|---|
| Model response claims it is authorized or that a fact is verified | PASS at design level | Response is untrusted content; it cannot mint authority, truth, policy, execution, or verification. |
| Prompt/context tells the model to call a tool or mutate state | PASS at scope level; enforcement UNKNOWN | M1 has no tool/effect capability. Must prove runtime/host cannot expose a bypass; prose policy alone is insufficient. |
| Local model missing, slow, or corrupt | PASS at semantic level | Explicit unavailable/error; no permissive success and no remote fallback. Runtime failure behavior is unimplemented. |
| Primary local route fails and framework silently routes to cloud | STOP / enforcement UNKNOWN | All alternate model routes and SDK fallbacks must be disabled or technically blocked. No current artifact proves this. |
| SDK, telemetry, crash reporter, update checker, retrieval, or diagnostics sends request/context off-device | STOP / enforcement UNKNOWN | “No remote inference” is narrower than “no egress.” M1's no-egress claim requires every outbound path to be inventoried and blocked/verified. |
| Conversation is persisted through cache, logs, crash dumps, analytics, or assistant memory | STOP / enforcement UNKNOWN | M1 forbids durable conversation memory; transient runtime buffers are not a promise of no disk/log persistence. Concrete platform behavior must be tested. |
| A user request contains credentials or sensitive material | UNKNOWN / out of scope for assurance | Local-only reduces one disclosure route but does not prove secure handling, memory erasure, OS isolation, or absence from diagnostics. Do not promise these properties. |
| A model answer is later consumed by Core as a proposal | CONDITIONAL | Any future protected use must go through the independently specified claim/authority/final-validation/commit path. This M1 boundary does not implement or authorize that path. |
| Local inference works, therefore Genesis authority is established | REJECTED | Model availability and Trust Foundation are independent; no authority follows from successful inference. |
| A UI toggle says “offline/private” | REJECTED as evidence | UI setting is not enforcement proof. Need implementation-specific egress and persistence tests. |

### Review conclusion
The candidate has no demonstrated contradiction with MASTER/Core at the semantic level, but it is **not implementation-ready**. Its strongest properties—local execution, no egress, no remote fallback, no durable persistence, and no tool/effect path—are constraints awaiting a concrete enforcement design and evidence, not properties established by this document.

Do not add generic sandbox, privacy, routing, or policy layers merely to make the candidate appear complete. First identify a concrete runtime/platform and its actual network, storage, plugin/tool, and fallback paths. If none is available, remain at DESIGN CANDIDATE / UNKNOWN and do not commission M1.

