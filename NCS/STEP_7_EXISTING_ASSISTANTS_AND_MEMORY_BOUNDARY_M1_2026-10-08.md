# NCS STEP 7 — Existing assistants and memory boundary for M1
Date: 2026-10-08
Status: source inspection complete; no implementation authorized or performed.

## Purpose
Continue from the existing NCS source-reuse and local-inference checks without repeating broad taxonomy. Determine whether the current assistant pipeline is an existing general model/client that can serve M1, and what prior P112 evidence says about reusing its memory.

## Exact source evidence
Inspected current branch `ncs-clean-architecture`:
- `package.json`, blob `a9bc2306543d34808f3b5f6ac1ec2d588f77ca14`
- `src/assistants/index.js`, blob `afa342403d8b46d19480ee8e7f381435ce695270`
- `src/assistants/squad.js`, blob `6d9b9bdfbabf79c8924033c72046f056806d9918`
- `src/assistants/memory.js`, blob `c70f246a85e8c513b8f746d7de237f881b0de91c`
- `scripts/assistants.mjs`, blob `ecacf579d401e13f8602e396b87a1b7a89495fa7`
- `NEXO_NCS/BUILD/STEP_7_SMALLEST_AUTHORITATIVE_ADMISSION_INPUTS_2026-10-08.md`, blob `4bb9675d90f27ffcb4eaf88e903d65a02dcc5b2d`

## Findings
1. 🟢 `src/assistants/index.js` exports diagnostic and simulation-oriented assistants; the inspected code exposes no general LLM/model client interface.
2. 🟢 `src/assistants/squad.js` explicitly describes specialists of Lúmina. Their findings are computed from simulation state and optional render probes; this is not evidence of natural-language inference or a device-local model runtime.
3. 🟢 `scripts/assistants.mjs` loads simulation state, runs diagnostics, constructs a mission through the Lúmina-bound orchestrator, writes a separate `.lumina-assistant-memory.json`, and persists simulation/Nexo memory. This pipeline is unsuitable as M1's no-tools/no-effects/no-persistent-memory interaction path.
4. 🟢 `src/assistants/memory.js` is a bounded learning/mission/effect journal structure, not a constitutional identity or authority store. Its presence does not establish provenance completeness, trustworthiness, or a safe memory boundary.
5. 🟢 The existing P112 journal/provenance work already records that squad reports are process-local and mission serialization is a projection that drops claim-critical observation provenance. The current MASTER-derived admission checkpoint independently says candidate admission policy/selection remains PENDING and provider/model output is proposal/evidence, not authority.
6. 🔴 No inspected artifact demonstrates a local language-model runtime, a Nexo client, enforced no-egress, or a remote-inference fallback prohibition. This is bounded evidence about the inspected branch and files, not a universal claim about artifacts outside the repository.

## Architectural consequence
- Do not adapt the Lúmina diagnostic squad or mission runner into Nexo's first interaction slice.
- Do not reuse learning memory as Nexo identity, constitutional authority, or validated long-term memory.
- Reuse only individually audited semantic invariants/contracts where their meaning survives the domain change; do not carry over simulation assumptions.
- Keep M1 feasibility and the Genesis/Path B authority gate separate. One cannot satisfy or weaken the other.
- No model/provider/platform selected; no code or tests changed/run; no keys, enrollment, commissioning, activation, network route, persistent write path, or external effects enabled by this research.

## Next bounded step
Stop searching for a model client in these same assistant files: this inspection and the prior repository feasibility check do not reveal one. Continue architecture work by extracting the smallest M1 request/response boundary from already audited Core contracts and MASTER invariants, strictly as a design artifact. Keep model execution, tools/effects, persistent memory, and authority recognition outside that boundary. If the exact boundary cannot be justified from existing evidence, record UNKNOWN/PENDING rather than inventing fields or abstractions.
