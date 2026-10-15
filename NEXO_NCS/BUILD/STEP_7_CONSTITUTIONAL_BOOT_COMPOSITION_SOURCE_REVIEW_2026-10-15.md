# STEP 7 — Constitutional boot composition source review — 2026-10-15

Branch: `ncs-clean-architecture`
Status: BOUNDED SOURCE REVIEW / DESIGN FINDING — NO IMPLEMENTATION

## Purpose

Evaluate whether the proposed constitutional-startup pattern can reuse existing NCS contracts and runtime paths, without creating another abstract layer or treating ordinary AI initialization as proof of Genesis authority.

## Evidence inspected

Fetched directly from `ncs-clean-architecture`:

- `NEXO_NCS/STATUS.md`, blob `6795d72c2aedc27685f0b40d877cf81d234225ad`.
- `NEXO_NCS/BUILD/STEP_7_RUNTIME_AUTHORITY_TO_EFFECT_PATH_SOURCE_TRACE_2026-10-15.md`, blob `d5191ee2eb59c3a255bd246c56ae965862fc8353`.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md`, blob `26d48d61d4f7900729f31ffbc127a27368b565ba`.
- `src/nexo/runtime.js`, blob `1b4096bd6868fd9086ba6740f07d6a104a258651`.
- `src/nexo/orchestrator.js`, blob `973d3d5406c5cab16fb49529d94e07a1557c3111`.
- `src/nexo/core/protected-transition.mjs`, blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`.
- `src/nexo/core/ownership.mjs`, blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`.
- `src/nexo/core/policy-context-resolver.mjs`, blob `024b385d928b6b95edee1a54de867f7193917c91`.
- `package.json`, blob `a9bc2306543d34808f3b5f6ac1ec2d588f77ca14`.

This is a bounded inspection of these source files and prior records, not an exhaustive repository/deployment audit.

## Findings

### 1. Reusing startup principles is architecturally useful, but it does not establish Genesis

The existing bootstrap composition contract already requires a claim-specific support set, independence requirements, composition rule, dependency closure, ordering, and currentness. It returns ESTABLISHED only for the exact claim whose requirements are met; unresolved required conditions remain UNKNOWN. It explicitly prevents bootstrap composition from silently establishing Constitution, Policy, Mission Authority, Capability, Execution, or external-world truth.

Therefore, do not introduce a second generic "constitutional boot framework." Treat constitutional boot as an ordered use of the existing contracts, if and when their inputs can be legitimately established.

### 2. Two different operations must remain separate

**A. Genesis recognition / first provisioning**
- Establishes the initial owner-intent and trust premise for a precisely scoped claim.
- Requires exact reviewed-content binding, a justified verifier/provenance basis, and explicit owner governance.
- Cannot be created merely by loading a system prompt, reading a Constitution file, hashing bytes, or accepting a caller-supplied AUTHORIZED/PASS result.
- Current status: NOT ESTABLISHED.

**B. Routine restart / constitutional revalidation**
- Revalidates an already legitimately established root and its scoped Constitution reference.
- Checks identity/content reference, applicable scope, dependencies/provenance, currentness/revocation/expiry, and required ordering/succession context.
- Must remain fail-closed: unresolved required evidence cannot grant protected capability.
- This can reduce unsafe startup behavior after Genesis exists, but cannot retroactively legitimize an untrusted first root.

Do not merge A and B into one step or let successful restart validation bootstrap its own original trust anchor.

### 3. Existing runtime path is not wired through the protected transition

The inspected `src/nexo/runtime.js` path is:

`executeLuminaNexoStep` → `executeNexoStep` → adapter execution → handler/effect path → postcondition → outcome recording.

The inspected runtime module does not import or invoke `executeProtectedTransition()` before adapter execution. The separate protected transition checks an injected `authorityGate`, isolates and executes a candidate, runs semantic validation, and then calls `conditionalCommit.commit(candidate)`. It does not invoke the `effectBoundary.prepare` port; that port defaults to `NOT_IMPLEMENTED` in `createCorePorts()`.

This confirms the already-recorded wiring gap for the inspected path. It does **not** prove every action in this path is a constitutional protected effect, and does not justify patching the adapter or `executeAction()` by guesswork.

### 4. Policy-context resolution is not a trust anchor

`resolvePolicyContext()` validates caller-supplied status objects for identity, applicability, dependencies, temporal validity, and provenance, then combines PASS/FAIL/UNKNOWN. This is useful semantic resolution, but those input statuses do not authenticate their own source or prove that Genesis was legitimately established.

Likewise, the existence of tests, a startup routine, a Constitution file, a hash, or a passing validator does not by itself prove owner intent, trusted presentation, exact approval binding, or final effect enforcement.

### 5. Scope is still the immediate gate before any enforcement design

The prior source trace explicitly warns that ordinary Lúmina simulation must not be conflated with a protected Nexo constitutional effect. No owner-approved initial activation target was found in the reviewed records. Do not infer that `executeAction()`, mission outcome recording, or snapshot persistence is the selected constitutional target.

Before code changes, establish:
1. the exact initial effect class/scope owner-approved for STEP 7;
2. its final effect-capable sink and reachable entry paths;
3. which existing contract owns enforcement at that boundary;
4. how the legitimate Genesis and current Constitution Authority Context reach that boundary without being caller-forged or bypassed.

If that scope or trust basis is UNKNOWN, remain STOP. Do not add wrappers, new registries, generic boot abstractions, or new transaction/retry machinery.

## Decision

**Constitutional boot is a useful composition pattern, not a solution to Genesis by itself.** Reuse the existing bootstrap, authority-context, validation, and effect-boundary contracts; do not create another abstraction. Keep first provisioning distinct from routine restart validation. The current source does not demonstrate an enforced constitutional boot gate or an authority-protected effect path.

No source/test/workflow/device/key/ceremony changes were made. No commissioning or protected effects are authorized.

## Status

STEP 7 remains **OPEN / STOP / UNKNOWN**.
