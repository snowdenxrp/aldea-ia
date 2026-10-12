# STEP 7 — First-Boot Deployment Boundary: Source Review After Android Capture — 2026-10-11

Status: source-mapped partial path; first-boot constitutional commissioning path remains UNKNOWN / STOP. This is a documentation/evidence artifact only; no runtime or device behavior is claimed.

## Evidence inputs

1. User-reported Termux Stage A capture: `NEXO_NCS/PROOF/STEP_7_ANDROID_STAGE_A_USER_REPORTED_CAPTURE_2026-10-11.md`.
2. Reviewed branch: `ncs-clean-architecture`.
3. Source files reviewed:
   - `src/nexo/core/ownership.mjs`, blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`
   - `src/nexo/core/protected-transition.mjs`, blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`
   - `src/nexo/core/contracts.mjs`, blob `294eb400e9685788f7dd084a28a838b69d0323c7`
   - `src/nexo/adapters/conditional-commit-persist-state.mjs`, blob `9a707677c99d226f87f9b8b0d9e7673e7a1a100e`

## Concrete code path found

The existing generic transition composition in `executeProtectedTransition` is:

`proposal → claimBuilder.build → authorityGate.check → STOP/UNKNOWN early return → snapshotIsolator.isolate → candidateExecutor.execute → finalSemanticValidator.validate → conditionalCommit.commit → outcomeClassifier.classify`.

Source review confirms the following bounded observations:

- `createCorePorts` receives `authorityGate` as an injected port. Its default implementation throws `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED: authorityGate.check`; this is a port, not an implemented Genesis verifier.
- `executeProtectedTransition` blocks further candidate work when the returned authority status is STOP or UNKNOWN. When the status is AUTHORIZED, it trusts the supplied port result as the next control input; the shown composition does not itself establish the legitimacy or provenance of that result.
- `createAuthorityResult` validates the status vocabulary and freezes a result object. This is structural validation, not authority authentication.
- The `effectBoundary.prepare` port is present in `createCorePorts`, but the reviewed `executeProtectedTransition` implementation does not call it.
- `createPersistStateConditionalCommit` forwards candidate state to the supplied `persistState` function and maps persistence outcomes to commit results. It is application-state persistence, not evidence of a constitutional Genesis commit or final protected-effect boundary.
- The reviewed files do not establish a current active-Constitution owner/store, Genesis-specific verifier, exact-content human approval protocol, independently justified currentness/revocation check, or final activation/effect boundary for first boot.

## First-boot role map

| Required role | Evidence in reviewed source | Disposition |
|---|---|---|
| Display exact Constitution/version/context to Kevin | No concrete first-boot presentation component established by this review | UNKNOWN |
| Capture approval bound to exact displayed bytes/version/context | No implemented protocol established | UNKNOWN |
| Verify approval against a justified basis | Injected `authorityGate.check` port exists; default is NOT_IMPLEMENTED | UNKNOWN / STOP |
| Establish recognized Genesis basis / active Constitution | No protected Core-owned establishment path established | UNKNOWN / STOP |
| Check currentness and revocation | No independently justified mechanism established by this review | UNKNOWN |
| Prevent replay/substitution/interruption from authorizing activation | No complete first-boot boundary established | UNKNOWN |
| Enforce decision at the last protected effect boundary | Port is declared, but not invoked by the reviewed transition function; no constitutional enforcement proof | UNKNOWN / STOP |
| Persist committed application state | Conditional `persistState` adapter exists | Established only for its bounded application-persistence role; not Genesis authority |

## Shared failure domains and limits

The device's own `getprop` values, UI/presentation, approval capture, local verifier, local clock/cache, persistence, and any final effect mechanism must not be assumed independent merely because they are separate functions or files. The current evidence does not establish their deployment, isolation, ownership, or compromise boundaries. The user-reported Android properties do not repair this architectural gap.

No new key, hash, file, signature, resolver, registry, UI prompt, or host assumption is promoted to a root by this document. A same-path artifact cannot bootstrap its own legitimacy merely by being durable or cryptographically hashed.

## Required next gate

Before selecting or implementing a Genesis path, map a concrete deployable first-boot transition and its components/dependencies end to end. Identify which component is trusted to show the exact bytes, which independently justified basis validates approval, how freshness/revocation is checked, and where activation is irrevocably blocked or allowed at the final protected boundary. Document failure-domain overlaps and all assumptions; reconcile with MASTER + frozen AB + P/P112. If those roles cannot be grounded, remain STOP / UNKNOWN and continue only non-protected construction.

No commissioning, root selection, new APK, device modification, or protected activation is authorized.
