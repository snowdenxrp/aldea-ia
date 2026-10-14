# STEP 7 — Scope A target and storage-boundary audit — 2026-10-14

Branch: `ncs-clean-architecture`
Status: DESIGN / SOURCE INSPECTION ONLY — NO IMPLEMENTATION
Owner intent: scope A accepted as design-only; see `DECISIONS/STEP_7_OWNER_CONFIRMATION_SCOPE_A_DESIGN_ONLY_2026-10-14.md`.
STEP 7 remains OPEN / STOP / UNKNOWN.

## Question

Can the accepted scope A (“record and later report the identity/reference of a specifically reviewed constitutional candidate”) be implemented against an already identified local Nexo target and existing write boundary, without creating a new authority root or accidentally authorizing anything?

## Source pins inspected

- `src/nexo/core/ownership.mjs`, blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`.
- `src/nexo/core/protected-transition.mjs`, blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`.
- `scripts/simulate.mjs`, blob `4dafebec265cc490ee17b388c75c04bb48869ac8`.
- `NEXO_NCS/CORE/README.md`, blob `82db0ac21edcb9a9bdcbb2760da8f48c7ad3ca36`.
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_HUMAN_READABLE_DRAFT_2026-10-14.md`, blob `33f70d1d2936cc077e0630b15991aa7603bb04ed`.
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_ARTIFACT_READINESS_AUDIT_2026-10-14.md`, blob `e9347096c9b5810eda6fde1148f8b9cb721e76cc`.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`, blob `e65df41ff98f7e53a8574ca5295a947023cb8b30`.
- Existing mutation-boundary source trace: `NEXO_NCS/BUILD/STEP_7_CONCRETE_MUTATION_BOUNDARY_SOURCE_TRACE_2026-10-14.md`, blob `514c339df1a47affdd0cf248e579803709f694b7`.

## Findings

### 1. The candidate can be named as a document, but it is not a canonical Constitution

The current human-readable draft is an identifiable candidate document in the repository. Its own header says DRAFT / NOT FROZEN / NOT COMMISSIONED / OWNER REVIEW REQUIRED; it has no approved identifier/version/scope, canonical byte rules, digest, signature or commissioning event. Its text explicitly says it is not an authority source.

Therefore a repository path plus the exact repository revision/blob can serve only as a **candidate locator for review work**. It cannot be described as a canonical constitutional identity, accepted root, or current authority. A Git blob identifier is repository metadata, not a constitutional trust anchor.

### 2. The existing Core skeleton is not a scope-A local reference implementation

`NEXO_NCS/CORE/README.md` documents the protected-transition skeleton. In source, `executeProtectedTransition()` receives a caller-supplied proposal/state/revision and injected ports. It invokes the injected authority gate and, on PASS, proceeds through isolation, candidate execution, final semantic validation and conditional commit. It does not establish a canonical constitutional candidate reference. The default `effectBoundary.prepare` port in `ownership.mjs` is NOT_IMPLEMENTED and the transition does not invoke it. Do not wire that port as a superficial fix.

### 3. Existing persistence is for simulation snapshots, not this reference

`scripts/simulate.mjs::persistState()` persists the simulation snapshot under `world-state.json`, with a conditional revision check for cooperating writers. `loadState()` falls back to a constructed default simulation state when read/parse/shape validation does not yield a usable state. This is a simulation recovery behavior; it must not be repurposed as proof that a canonical constitutional reference was recovered. The current Nexo runtime mutation path is not shown to commit through this persistence boundary as a protected constitutional operation.

### 4. The actual local runtime target remains unidentified

The source inspected so far identifies no existing local Nexo runtime operation or dedicated storage owner that can record and later report the candidate reference while proving:
- the candidate remains explicitly untrusted/non-current;
- absent/corrupt/malformed/fallback state remains UNKNOWN rather than an accepted empty reference;
- the record is not consumed as authorization by any mission/effect path;
- write/commit/conflict/unknown outcomes are accurately reported;
- no mission or protected effect can be caused by recording or reading the reference.

This is a bounded finding from the inspected files, not proof that no relevant code exists anywhere in the repository.

## Architecture decision

**Do not implement yet.** Scope A is accepted as a work objective, but its concrete runtime target and write boundary are not evidenced. Choosing `world-state.json`, adding a field to simulation state, adding a new generic store, creating a second commit primitive, or using the uncalled `effectBoundary.prepare` port would be an unsupported architecture choice or superficial patch.

The next step is a targeted source map—not another broad audit—to establish whether an already existing Nexo-local persistent owner outside the inspected paths can legitimately own a *non-authoritative reference record*. If none exists, stop and present the minimal architecture choice needed to the owner before implementation. Any candidate store must remain separate from constitutional authority/currentness and from mission/effect state.

## Explicit exclusions

- No Constitution freeze, digest, signature, key creation, ceremony or commissioning.
- No Constitution Authority Context.
- No mission/effect authorization or changes to `executeAction()`, `tick()`, the simulation adapter, or protected-transition composition.
- No treating a path, hash, Git commit/blob, local file, caller or persistence mechanism as authority.
- No assumption that default/fallback state equals canonical empty state.
- No tests claimed; no source code changed.

**Result:** scope A is owner-accepted as design intent; target/storage boundary is NOT ESTABLISHED. Maintain OPEN / STOP / UNKNOWN.
