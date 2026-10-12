# NCS — STEP 7 CONTINUATION RULE FOR FUTURE CHATS
Date: 2026-10-12
Status: OWNER-DIRECTED WORKING RULE

## Binding instruction
When a future conversation starts with the exact trigger `NCS`, resume the clean Nexo architecture track and treat Step 7 as an ACTIVE investigation/construction workstream. Do not abandon it merely because the initial trust reference is not currently available. Do not wait passively for options to appear: actively research, compare, and evaluate viable options while preserving the trust boundary.

## Non-negotiable status distinction
- Step 7 investigation and safe engineering work: ACTIVE.
- Protected constitutional commissioning / activation: OPEN / STOP / UNKNOWN until the required trust and enforcement evidence exists.
- Do not describe the whole of Step 7 as cancelled, completed, or blocked in every respect.
- Do not claim a reference, independent channel, root, authority, protected integration, or enforcement is established without direct evidence.

## Required workstreams
A. **Reference comparison and root recognition:** actively investigate viable ways to obtain/recognize an independently grounded reference; bind approval to exact Constitution bytes, readable rendering, version, scope, and commissioning context; account for provenance, shared dependencies, substitution, stale references, and replay. Do not assume a physical copy, trusted person, or second device is available. Two apps on one phone, repeated display from the same client, a self-generated key/hash, a Git commit, or a self-reported verified flag are not independent trust by themselves.

B. **Protected Core integration:** examine the concrete gap between a legitimately established Genesis Trust Foundation, the protected Constitution Authority Context owner, and the protected transition/effect boundary. Reuse and cross-check existing contracts and source before making changes. Caller-provided `AUTHORIZED`, context fields, hash, epoch, signature, or provenance cannot self-authenticate. Do not add a speculative wrapper or implementation that pretends to create the missing root.

C. **Adversarial enforcement evidence:** prepare or execute only appropriately scoped, reproducible tests showing invalid/unknown/stale/revoked authority is rejected and protected effects cannot bypass the final gate. Distinguish unit-test evidence from production composition, device deployment, and real-world effect enforcement. Do not claim universal absence of bypasses from a bounded search.

## Work order
1. Start by inspecting the existing NCS STATUS and relevant Step 7 contracts/source/tests to identify the single next concrete gap. Avoid repeating completed inventories, audits, or tests.
2. In parallel as useful, research realistic reference/root options and document tradeoffs only when this adds new evidence or resolves a decision.
3. Trace the actual protected integration and name the missing owner/call path/evidence precisely.
4. Define adversarial tests tied to that exact gap; implement only if the design is coherent and no root trust is being faked.
5. Verify through source, tests, workflow artifacts, and/or device evidence as applicable. Label each claim RECOVERED / EXTENSION / CONFLICT and VERIFIED / PENDING / UNKNOWN as supported.
6. Update NCS STATUS and durable records only for meaningful changes. Never claim persistence if a write was rejected or unverified.

## Architectural invariant
“Nexo no lo queremos lleno de parches.” If progress requires a structural patch, duplicated authority owner, circular trust, hidden fallback, or a new layer that merely repeats an untrusted claim, stop and correct the root design before continuing.

## Step 7 exit/re-entry gate
Protected commissioning cannot advance until evidence supports all of:
1. A legitimate, independently recognized Genesis trust basis for the declared threat model.
2. A verifiable comparison/provenance process bound to the exact Constitution and scope.
3. A protected Core-owned Constitution Authority Context established from that basis and connected to the real protected transition/effect path.
4. Reproducible adversarial evidence that invalid, unknown, stale, or revoked authority fails closed and no relevant protected path bypasses enforcement within the explicitly audited scope.
5. Defined currentness, revocation, succession/recovery, and replacement behavior.

Safe non-authoritative engineering may proceed before these conditions are met, but must not be represented as constitutional commissioning.

## Current starting point
The bounded human comparison protocol is a design candidate only; no concrete independent channel is selected. Existing Genesis Trust Foundation, Bootstrap Composition, and Core Constitution Authority Context contracts are design candidates, not evidence that the production root/composition exists. Existing injected-authority tests do not prove authority legitimacy. Begin with targeted gap verification; do not repeat completed broad inventories or frozen historical probes.


## Durable continuation handoff — research through 2026-10-12

### User direction
The owner explicitly requests continued STEP 7 investigation until a solution is found where possible; unknowns should trigger study and primary-source research, not premature abandonment. Preserve enough detail for the next NCS chat to inspect the research and continue without losing the thread. This is a research mandate, not permission to fabricate authority, bypass governance, or claim success without evidence.

### Current exact disposition
- STEP 7 safe investigation: ACTIVE.
- Genesis trust foundation: UNKNOWN / NOT ESTABLISHED.
- Exact owner-recognized Constitution revision and scope: no independently recognized reference selected.
- Canonical current Core Constitution Authority Context: NOT ESTABLISHED.
- Legitimate production AuthorityGate composition: NOT ESTABLISHED in the reviewed branch.
- Final protected effect boundary and complete mediation: UNKNOWN.
- Protected commissioning: STOP.
- No keys, Constitution bytes, production code, device state, or runtime authority were changed by the latest research.
- A previous attempt to append the latest G-A14 reuse result to the path-map document was blocked by the tool. Do not assume that attempted write succeeded. Verify this continuation-rule update's resulting commit/blob and re-fetch the section before claiming persistence.

### Canonical sources inspected and how to use them
1. Path map / evidence gate: NEXO_NCS/BUILD/STEP_7_GENESIS_TO_CORE_TRUST_PATH_MAP_AND_EVIDENCE_GATE_2026-10-12.md, previously verified blob c0f684abcb7bf77979932eee2e84223439b559a5. It records:
   - src/nexo/core/contracts.mjs: createAuthorityResult validates/packages caller-supplied status/reasons/evidence; it does not authenticate the producer or current authority.
   - src/nexo/core/ownership.mjs: effectBoundary.prepare defaults to NOT_IMPLEMENTED.
   - src/nexo/core/protected-transition.mjs: calls injected authorityGate.check, semantic validation, then conditionalCommit.commit(candidate); it does not call effectBoundary.prepare.
   - src/nexo/adapters/conditional-commit-persist-state.mjs: forwards candidate state to caller-supplied persistState; does not prove canonical Constitution Authority Context ownership or mediate external effects.
   - Focused tests inject AUTHORITY.AUTHORIZED; they demonstrate simulated transition/adapter behavior under a test fixture, not legitimate Genesis trust or production complete mediation.
   - The repository search was bounded and did not demonstrate a production composition/call site connecting a recognized Genesis root, active Constitution Authority Context, legitimate AuthorityGate, and final effect sink. This is not proof about unindexed/external deployments.
2. Existing structural closure research (reuse; do not duplicate):
   - docs/nexo/NEXO_G-A14-01_STRUCTURAL_EFFECT_PATH_CLOSURE_BUILD_DEPLOYMENT_RUNTIME_RESEARCH_V1_2026-09-24.md, blob 4e344696a295682ffd18264b3572fe5306af3595.
   - docs/nexo/NEXO_G-A14-01_MECHANICAL_EFFECT_PATH_COVERAGE_CODE_SINK_AUDITABILITY_RESEARCH_V1_2026-09-24.md, blob 5b6600c959f3a3b574ed3abdac022aaca9729166.
   - Existing closure levels: C0 unbounded; C1 enumerated; C2 build-bounded; C3 deployment-bounded; C4 enforcement-bounded; C5 evidence-bounded. These are descriptive states, not assurance scores; never infer a higher level from a lower one. Unresolved dynamic sinks, generated code, plugins, subprocesses, IPC, runtime topology, configuration, or analyzer errors remain UNKNOWN. Analysis must never grant authority.
3. Status at last fetch: NEXO_NCS/STATUS.md, blob 013fcbcc5ddb68110fc0d82493e531a37e2690d8. Re-fetch before relying on this SHA as current.
4. The latest path-map content already contains complete-mediation source revalidation and an evidence gate. Do not repeat that audit unless source/deployment changes or a new dependency appears.

### Novel synthesis from latest pass
The pre-existing G-A14 C0–C5 model is the correct audit framework for STEP 7's final-boundary problem. No new sink registry, generic wrapper, or duplicate document is warranted. The reviewed repository alone is insufficient to assign a deployed Nexo C0–C5 status. Once a real deployment is identified, instantiate the existing evidence contract for its exact build/artifact, generated artifacts, reachable entrypoints, sink inventory, runtime capabilities/topology, IPC/subprocess/plugin paths, authority-context source, enforcement point, and invalidation conditions.

External standards cross-check:
- IETF RFC 9334 / RATS distinguishes Evidence appraisal by a Verifier from application-specific authorization by a Relying Party; trust in the verifier and appraisal policies is itself a prerequisite. A signed/valid attestation result does not independently create Nexo constitutional legitimacy. https://www.rfc-editor.org/rfc/rfc9334.html
- Saltzer–Schroeder complete mediation remains relevant to every protected access and maintenance/recovery path. https://www.cs.virginia.edu/~evans/cs551/saltzer/
- NIST SP 800-53A assessment approach requires examining/testing actual mechanisms, not accepting interface declarations alone. https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53Ar5.pdf
These sources corroborate the existing design; they do not resolve the missing owner-recognized root or identify a deployment.

### Exact next actions for the next NCS chat
1. Verify persistence of this continuation update and read the latest NEXO_NCS/STATUS.md plus the path-map, Genesis trust attack review, bounded human-comparison protocol candidate, Core source inventory/Authority Context reuse audit, and both G-A14 research documents. Do not create another continuity file.
2. Perform a targeted search of the current ncs-clean-architecture branch for actual deployment entrypoints/composition, build workflows/artifacts, and all callers of executeProtectedTransition; inspect source/workflows rather than relying on search snippets. Record bounded search scope and limitations.
3. Determine whether a named, auditable deployment exists in this repository at all. If not, state precisely what deployment identity or externally visible target is missing; do not substitute M1 or a synthetic test fixture without direct evidence that it is the actual protected target.
4. In parallel, continue evaluating independent Genesis bootstrap patterns from primary sources. Compare initial-trust assumptions, threat model, ownership, exact-byte/scope binding, currentness/revocation, recovery/succession, dependency/circular-trust risks, and practical verifiability. Do not select a phone/OEM/CA/second device/person/paper/Git as trusted by assumption. A hash proves byte identity only relative to a trusted reference; a signature proves possession of a key only relative to a trusted key-to-owner binding.
5. Do not ask the owner to repeat old choices or choose among generic A/B/C options while safe research remains. When research reaches a genuinely irreducible owner-recognition input, ask one concise question tied to concrete mechanisms already explained and never imply that the owner must print, buy, or install something.
6. Once a real target and trust basis are evidenced, instantiate the existing G-A14 C0–C5 checklist and design tests at the actual protected boundary. Include invalid/unknown/stale/replayed/revoked authority, replacement/recovery, direct bypass, alternate IPC/network/device/process paths, and deployment drift. Tests must bind to the target artifact and preserve raw outputs. No production patch before this design gate.
7. Continue to update existing canonical docs and STATUS only for meaningful findings. For each write, verify returned commit/blob SHA and re-fetch the exact new section. If write fails, disclose it and do not claim persistence.

### Do-not-repeat / do-not-touch
- Do not repeat already completed broad Genesis/RATS/TUF/in-toto/SUIT/NIST trust-bootstrap summaries unless new primary-source evidence changes the analysis.
- Do not add another generic registry/wrapper, or merely call effectBoundary.prepare to make an interface appear enforced.
- Do not infer production behavior from injected-authority unit tests.
- Do not rerun frozen AB/TLC/Kafka/P112 probes or old audit lines without a direct STEP 7 dependency.
- Do not rebuild/install M1 unless a verified STEP 7 dependency specifically requires it.
- Do not claim solution found, commissioning ready, universal bypass absence, or trust-root establishment until the five exit gates in this file are evidenced.

### Continuation principle
Research should converge toward a concrete root and protected boundary, not accumulate papers. Every pass should either (a) produce new primary-source/source/runtime evidence, (b) eliminate a candidate with a documented reason, (c) narrow a specific unknown, or (d) identify the exact owner input that cannot be derived technically. If a pass does none of these, do not create another document for it.
