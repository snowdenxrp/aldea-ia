# NCS — Step 7 Path B Concrete Evidence Inventory
Date: 2026-10-08
Status: TARGETED REPOSITORY SEARCH COMPLETE — NO DEPLOYED PATH B BASIS IDENTIFIED — BLOCKED/UNKNOWN

## Question
Does the accessible Nexo repository contain a concrete, already-existing recognition/enrollment basis that can support Path B for this deployment, rather than a contract, research proposal, or description of a hypothetical trust root?

## Search boundary
This is a targeted evidence inventory, not a claim about every account, device, external service, or artifact that may exist outside the repository. The GitHub code-search endpoint searches the repository's default branch; current NCS records were also fetched directly from `ncs-clean-architecture`. Searches covered:
- prior recognition/enrollment and credential registration;
- protected verifier/authority and Constitution Authority Context;
- hardware/platform attestation and root-key provisioning;
- credential currentness/revocation;
- concrete WebAuthn/FIDO enrollment and Android Keystore/BiometricPrompt implementation;
- implementation/evidence for an independent verifier.

No device-specific phone audit was reopened. No frozen AB/TLC/Kafka experiment was rerun.

## Repository evidence examined
1. `NEXO_NCS/DECISIONS/STEP_7_PREEXISTING_ROOT_BASIS_REUSE_AUDIT_2026-10-08.md` — explicitly records that the actual prior channel credential/enrollment evidence, protected verifier, currentness source, and enforcement boundary are not established as deployment facts.
2. `NEXO_NCS/DECISIONS/STEP_7_CLAIM_RELATIVE_GENESIS_RECOGNITION_FAMILY_COMPARISON_2026-10-08.md` — compares the already identified families and leaves all unselected; C3 protected recognition is the earliest blocker.
3. `NEXO_NCS/BUILD/STEP_7_MINIMUM_REAL_BOOTSTRAP_ROOT_BASIS_ATTACK_2026-10-08.md` — defines the abstract bootstrap relation; it is not evidence of an instantiated root.
4. `NEXO_NCS/BUILD/STEP_7_PROTECTED_POLICY_EVIDENCE_CAPABILITY_IMPLEMENTATION_GATE_2026-10-08.md` — says the repository has a typed ClaimEnvelope policyContext carrier/resolver but no demonstrated protected policy-source/authority owner.
5. `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md` and `STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_REUSE_AUDIT_2026-10-08.md` — explicitly block implementation that would label caller-supplied data as protected without an already-recognized trust foundation.
6. `NEXO_NCS/BUILD/STEP_7_CURRENT_PHONE_CANDIDATE_THREAT_MODEL_2026-10-08.md` — treats the phone/Termux as candidates for bounded use, not independent trust roots or self-authenticating channels.
7. Historical AB/GLOBAL-AUDIT results returned by targeted search (including external recovery, hardware anti-rollback, credential lifecycle, and common-mode dependency work) are architectural constraints/research, not evidence that a corresponding deployment root or verifier exists.

Targeted searches for WebAuthn enrollment, FIDO credential registration, Android Keystore/BiometricPrompt implementation, root-key provisioning, credential revocation implementation, and independent verifier code did not surface an instantiated Path B mechanism. Searches for broader terms returned design contracts, attack reports, and historical research; those are not promoted to runtime evidence.

## Result by required evidence class
| Required class | Inventory result |
|---|---|
| Pre-existing credential/channel and enrollment provenance | NOT FOUND in the inspected repository evidence |
| Independently justified protected verifier/root | NOT FOUND |
| Exact Constitution/action/presentation binding in an implemented approval path | NOT FOUND |
| Verifier-controlled freshness and replay rejection for commissioning | NOT FOUND |
| Credential currentness, revocation, recovery and migration source | NOT FOUND |
| Protected policy/Constitution authority owner and final enforcement evidence | NOT FOUND |

“Not found” means not evidenced by this bounded repository search; it does not prove that no external mechanism exists. No absence claim is made about the user's personal accounts or physical devices.

## Decision
Path B remains UNRESOLVED and BLOCKED/UNKNOWN. No family, device, provider, account, key, certificate, biometric, hash, signature, Termux process, or historical document is promoted to root authority merely because it exists or is named in research.

C3 (protected recognition) remains the earliest hard blocker; C4 (currentness/lifecycle) and C5 (enforcement) remain separate downstream gates. Path A remains evaluation-only: its environmental assumptions have not been accepted as true. The user's instruction to continue is not acceptance of those assumptions.

## Next action
Do not write enrollment, root rotation, Constitution Authority Context, or commissioning code yet. The remaining decision is a precise owner choice:
- **Path A:** explicitly accept or reject the exact bounded environmental assumptions for further design only (still no implementation or activation); or
- **Remain uncommissioned:** keep UNKNOWN/STOP until a concrete external/pre-existing basis and protected verifier can be evidenced.

Neither choice by itself proves technical recognition, currentness, or enforcement. No implementation, key generation, enrollment, commissioning, activation, or production effect occurred in this inventory.

## External mechanism check — standards are not pre-existing deployment evidence
A focused check of official specifications clarifies why naming a standard does not close Path B:
- W3C WebAuthn describes registration and authentication as ceremonies scoped to a Relying Party (RP ID), with the RP responsible for validating the challenge, origin, authenticator data and any attestation accepted by its policy. A WebAuthn credential could be a useful future mechanism only if a concrete RP, prior credential enrollment, trusted verification policy, lifecycle/currentness and relevant authority bindings are actually established. No such Nexo RP/credential/verifier was found in this inventory. Source: https://www.w3.org/TR/webauthn/
- Android Keystore can constrain key use and may bind key material to secure hardware, but the guarantees depend on actual device support and configuration; Android documentation explicitly describes the app-process compromise and hardware-bound limitations. No Nexo app key, per-operation authentication policy, attestation result or verifier has been instantiated here. Source: https://developer.android.com/privacy-and-security/keystore
- Android documentation for authentication distinguishes device-unlock authenticators from authenticators used to gate cryptographic key use. Therefore the existing phone screen lock is not evidence of a pre-enrolled Nexo-specific authority credential. Source: https://source.android.com/docs/security/features/authentication

These standards establish viable design mechanisms and required verification responsibilities, not that Kevin's current phone/account is already a recognized Path B root. Do not infer enrollment, provenance, currentness, or constitutional authority from availability of Android/WebAuthn features.

## Code-level verification — existing executable boundaries are not a Path B root
A targeted inspection of current source files was added after the standards check:

- `src/nexo/core/policy-context-resolver.mjs` (blob `024b385d928b6b95edee1a54de867f7193917c91`) resolves caller-supplied identity/applicability/dependency/temporal/provenance checks and returns VALID/FAIL/UNKNOWN. It does not create or verify a trust anchor, enrollment credential, signed attestation, protected verifier identity, or independently sourced currentness.
  Source: https://github.com/snowdenxrp/aldea-ia/blob/main/src/nexo/core/policy-context-resolver.mjs
- `src/nexo/core/contracts.mjs` (blob `294eb400e9685788f7dd084a28a838b69d0323c7`) validates ClaimEnvelope and AuthorityResult shapes. Shape validation does not authenticate the source of those values.
  Source: https://github.com/snowdenxrp/aldea-ia/blob/main/src/nexo/core/contracts.mjs
- `src/nexo/core/protected-transition.mjs` (blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`) delegates the authority decision to an injected `ports.authorityGate.check(claim)`. This is a useful control-flow seam, but this inspection did not establish a protected, independently recognized implementation of that authority gate.
  Source: https://github.com/snowdenxrp/aldea-ia/blob/main/src/nexo/core/protected-transition.mjs
- `NEXO_NCS/BUILD/STEP_7_EXISTING_PROTECTED_POLICY_AUTHORITY_OWNER_AUDIT_2026-10-08.md` explicitly records that no implemented protected policy-source authority owner was found.
  Source: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/STEP_7_EXISTING_PROTECTED_POLICY_AUTHORITY_OWNER_AUDIT_2026-10-08.md
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_REUSE_AUDIT_2026-10-08.md` explicitly records that no implemented current Constitution Authority Context path was found.
  Source: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_REUSE_AUDIT_2026-10-08.md

Interpretation: the repository contains useful execution/control-flow and data-contract code, but the reviewed code does not establish the prior recognized authority needed for Path B. An injected authority port is not itself an authority root. These are code-reading observations, not a runtime test or proof about external devices/accounts.

## Updated disposition
This code inspection strengthens the bounded repository finding but does not reveal a Path B candidate. Path B remains BLOCKED/UNKNOWN; commissioning remains prohibited. No code was changed in the runtime, no keys were generated, and no enrollment or activation was performed.

