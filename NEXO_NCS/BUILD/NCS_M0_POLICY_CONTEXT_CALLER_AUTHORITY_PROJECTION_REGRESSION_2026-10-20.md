# NCS M0 — regression: caller-supplied authority fields cannot become PolicyContext (2026-10-20)

Branch: `ncs-clean-architecture`.

## Why this test exists

The existing Core constructor `createPolicyContext()` in `src/nexo/core/contracts.mjs` projects only five fields: `policyRef`, `scope`, `resolved`, `validity`, and `resolutionProvenance`. It does not establish a constitutional context or authenticate a root. The authority-enforcement inventory already records that gap. Adding Constitution/root fields from a caller would be self-attestation, not a fix.

## Regression added

Test commit: `29e97fab41261fdd6505f5e02d8ce4791852e981`, file `tests/nexo/protected-transition.test.mjs`.

The new adversarial fixture supplies otherwise well-shaped Policy data alongside caller-controlled `constitutionRef`, `governingConstitution`, `rootProof`, and `authorization: "AUTHORIZED"`. It asserts that the resulting `policyContext` contains only the five existing Policy fields and does not contain `rootProof`.

This test protects the current non-authority projection boundary against a future accidental promotion of caller-supplied metadata. It does **not** prove that a legitimate constitutional context exists, that the caller fields are rejected as input (they are currently ignored by projection), or that protected effects are authorized. It is not a replacement for the missing authenticated Constitution→Policy integration.

## Exact CI evidence

All listed runs completed `success` on the exact test SHA `29e97fab41261fdd6505f5e02d8ce4791852e981`:

- [M0 integrated acceptance regression — 39446572258](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572258)
- [STEP 4 semantic validation — 39446572376](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572376)
- [M0 non-authority core contracts — 39446574300](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446574300)
- [STEP 5 outcome classification — 39446572342](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572342)
- [Deterministic persistence tests — 39446572371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572371)
- [STEP 3A/3B/3C verification — 39446572419](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572419)

## Scope and next dependency

No runtime code, root bootstrap, verifier, trust registry, key, signature, digest, commissioning protocol, or protected-effect path was changed. The next dependency remains explicit owner review/stabilization of the constitutional artifact, then a non-self-attesting root-recognition contract and its real enforcement boundary. Do not invent constitutional decisions from the instruction to continue.

M0 remains `INCOMPLETO`; `authorization: NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.
