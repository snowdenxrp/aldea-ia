# NCS — Step 7 Claim-Relative Genesis Recognition Family Comparison
Date: 2026-10-08
Status: COMPARISON COMPLETE — NO FAMILY SELECTED — ROOT/VERIFIER/ENFORCEMENT BLOCKED

## Purpose and scope
Execute the existing next action from `STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md`: compare already identified recognition families against Nexo's actual claims, common-mode failures, offline currentness, recovery, and portability. This is a comparison, not a new root taxonomy, device audit, implementation proposal, or commissioning authorization.

## Claims that must not be conflated
- **C1 — Owner intent:** Kevin is the sole initial constitutional authority. This is a normative governance rule, not technical attribution.
- **C2 — Exact commissioning approval:** a bounded approval applies to one exact Constitution identity/version/content, action, scope, and commissioning context.
- **C3 — Protected recognition:** a verifier can establish that the basis for C2 was previously recognized and remains applicable.
- **C4 — Currentness and lifecycle:** revocation, replacement, recovery, rollback, and succession cannot silently restore obsolete authority.
- **C5 — Enforcement:** all relevant privileged transitions enforce the decision; STOP/revocation requests are not mistaken for enforcement.
- **C6 — Portability:** model, provider, OS, device, and interface may change without Nexo's identity and Constitution being silently replaced.

A family that helps C2 does not automatically establish C3–C5. No row below means “selected” or “implemented.”

## Claim-relative comparison

| Candidate family already in the root contract | What it could contribute | Common-mode / offline / recovery limits | Portability and present result |
|---|---|---|---|
| Immutable or externally provisioned root | A prior recognition basis not created by the new Nexo instance; potentially a clear anchor for C3. | “Immutable” does not identify who provisioned it or prove currentness. Revocation, replacement, physical custody, and recovery still need governed treatment. Offline use can preserve stale authority unless freshness policy is explicit. | Potentially portable if the root's semantics and migration are independent of a specific provider. No concrete provisioned root or protected verifier is evidenced. UNKNOWN. |
| Mutable root updated by a previously protected root | Supports governed updates and rotation while preserving a previously recognized chain. | Circularity if the old root is discarded before the new root is independently validated; rollback, stale checkpoints, revocation and interrupted replacement need safe semantics. Recovery must not become its own root. | Could support provider/device change if trust semantics survive migration. No existing protected predecessor or transition-enforcement path is evidenced. UNKNOWN. |
| Platform/hardware root, only if actual guarantees exist | May protect key use, measured integrity, or verifier functions against some software-level attacks. | Hardware availability or a biometric prompt alone proves none of the required properties. Platform/vendor/update/attestation roots can be common dependencies. Offline currentness, enrollment change, recovery and cross-device transfer remain separate. | Hardware-specific claims may reduce portability; abstract Nexo identity must remain above them. Actual phone model/capabilities and independent trust basis are not established; no selection. |
| Multiple roots / threshold arrangement | Could reduce a single failure mode if independent authorities and paths are genuinely separate for the specific claim. | Multiple keys, apps, services or devices sharing an owner, provider, recovery operator, firmware, policy root, or network do not automatically create independence. Threshold rules can create lockout and recovery risks. Offline revocation/currentness still needs a rule. | May improve migration only if membership and authority transfer are governed. No independent participants or lifecycle authority are evidenced; no selection. |
| Path A — explicitly assumed bounded commissioning environment | Can state a one-time, owner-supervised risk envelope for a narrowly scoped action, if Kevin separately accepts the exact assumptions. It makes uncertainty visible rather than pretending a root exists. | Honest presentation and absence of active host compromise are assumptions, not proofs. If the commissioning device/OS is compromised, the exact action may be substituted. Does not independently establish enrollment, currentness, verifier legitimacy or enforcement. | Could be a limited bootstrap premise but cannot by itself deliver the stronger claim “resists compromised commissioning host.” Evaluation authorized; assumptions not accepted; no commissioning. |
| Path B — pre-existing independently grounded recognition basis | In principle, directly addresses the missing prior-recognition fact without self-enrollment. | Must identify the actual source and its protected verifier, provenance, scope, currentness/revocation, recovery and dependencies. Merely saying “external,” “independent,” or “pre-existing” is not evidence. | Could better preserve provider/device portability if the trust basis is designed for it. No concrete basis has been identified in repository evidence; remains unresolved. |

## Cross-family result by claim

- C1 is already defined normatively: Kevin is the sole initial authority; his daughter is only a future intended successor and has no present authority. No automatic succession follows.
- C2 has a semantic contract and a biometric candidate, but no implemented trustworthy presentation/verifier path.
- C3 is the earliest hard blocker: no concrete pre-existing recognition/enrollment basis and no independently justified protected verifier have been evidenced.
- C4 remains blocked because no deployed authority for currentness, revocation, recovery, replacement, or anti-rollback is evidenced.
- C5 remains blocked because no complete protected enforcement boundary is evidenced.
- C6 is an architectural constraint, not a reason to select a root family before its claims and lifecycle are justified.

## Decision
**No candidate family is selected.** The evidence does not justify ranking one as technically sufficient for deployment. Path A is the only family with explicit owner authorization for evaluation, but that authorization is not acceptance of its assumptions and does not make it equivalent to an independently grounded root.

The next useful input is not another abstract attack. It is either:
1. concrete, independently grounded evidence of a pre-existing recognition basis (Path B), with its scope and lifecycle; or
2. a separate explicit owner decision accepting or rejecting the exact Path A assumption set for further bounded design.

Even after either input, implementation remains blocked until verifier legitimacy, exact action/Constitution binding, freshness/one-time use, lifecycle, provenance and enforcement are technically justified. If resistance to a compromised commissioning host is required, Path A alone is insufficient.

## Guardrails
- No family, device, provider, algorithm, key, verifier, or commissioning ceremony selected.
- No code, secrets, credentials, enrollment, activation, production effect, or Lúmina changes.
- Do not repeat root-class attacks, generic phone research, biometric attack matrix, or frozen AB/TLC/Kafka probes without new specific evidence.
- Preserve UNKNOWN/STOP; do not convert owner intent, hashes, signatures, platform labels, or repository documentation into technical establishment.
