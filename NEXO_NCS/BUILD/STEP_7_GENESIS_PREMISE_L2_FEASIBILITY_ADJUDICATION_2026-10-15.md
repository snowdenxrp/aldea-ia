# STEP 7 — Genesis premise and L2 feasibility adjudication — 2026-10-15

Branch: `ncs-clean-architecture`  
Status: RESEARCH / ARCHITECTURE GATE — NO IMPLEMENTATION, NO CEREMONY

## Question

Can the initial Genesis premise be made concrete while preserving the selected L2 objective, without making a verifier, device, provider, or recovery mechanism constitutionally superior to the owner?

## Evidence reused (not repeated)

- `STEP_7_INITIAL_AUTHORITY_BOOTSTRAP_DECISION_GATE_2026-10-15.md`: L2 preserved; current path not established.
- `STEP_7_SCOPE_A_REVIEW_EVIDENCE_MINIMUM_ACCEPTANCE_CONTRACT_2026-10-15.md`: Scope A review acknowledgement cannot establish legitimacy/currentness or authorize effects.
- `STEP_7_OWNER_APPROVAL_TRUST_PATH_COMPARISON_2026-10-15.md`: YubiKey 5 NFC has no trusted human-readable display for this arbitrary artifact; the Moto G52 is not automatically independent; the POCO screen premise is narrowly bounded.
- `STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md` and `STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md`: no self-rooting; no independent root is currently implemented/recognized.
- `STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md` and `STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`: composition and Authority Context consume an already justified trust basis; they cannot create it from caller-supplied claims.

No closed AB/P/P112 audit was rerun. No product was selected.

## Finding 1 — distinguish normative origin from machine-verifiable evidence

The owner can be the normative source of Nexo's initial constitutional decision without delegating sovereignty to a third party. That answers **who should decide**.

It does not, by itself, answer the technical questions:
- which exact bytes/complete content were reviewed;
- whether the owner deliberately approved that content and only the stated scope;
- whether the evidence producer substituted another payload;
- whether the verifier and its policy are the intended ones;
- whether the accepted decision remains current rather than replayed, revoked, or superseded.

Those are different claims. A direct owner declaration can establish a stated assumption or intent at the human/governance level; it cannot be relabelled as independent machine verification when the channel producing its evidence is adversarial.

## Finding 2 — the current POCO premise is insufficient for L2

The accepted premise is only: the POCO screen faithfully presents content during a possible first recognition ceremony.

It does **not** establish that the same host sends those exact reviewed bytes to a signing device, that the approval input is bound to those bytes, or that the verifier/policy is authentic and current. A display can be honest while the signing request or stored record differs. Therefore the screen premise alone does not close the content-to-decision binding.

A generic hardware key improves key custody, but without a trusted display/parser for the approved statement it can sign bytes the owner cannot meaningfully inspect. A second phone or offline app is not independent merely because it is another process/device.

## Finding 3 — minimum missing capability is a trusted approval path, not “a stronger key”

For the declared L2 threat model (malicious/substituted Core and compromised Android OS included), a candidate path must provide all of these claim-relevant properties:

1. **Human-readable semantic presentation:** the owner can inspect the complete candidate and narrow approval scope, including identity/version and exclusions.
2. **Content-to-approval binding:** the trusted approval mechanism itself, or an independently checkable channel, binds the inspected representation to the exact endorsed bytes/representation. The untrusted host cannot substitute a different payload without detection.
3. **Deliberate input:** the affirmative action is captured by a boundary not controlled by the adversary in scope, and cancellation/ambiguity never becomes approval.
4. **Verifier provenance:** a separately justified basis identifies the verifier implementation, policy and initial trust configuration. A verifier's own PASS or self-reported provenance cannot establish that basis.
5. **Freshness/currentness:** the decision cannot be replayed or made current solely by restoring a stale snapshot; revocation, competing versions and recovery have a governed source.
6. **Role separation:** review acknowledgement, constitutional ratification, owner authority, policy admission and permission for a protected effect remain distinct.
7. **Separate effect enforcement:** even valid L2 evidence cannot authorize an effect until the actual final sink and bypass closure independently pass STEP 7.

This is a conjunction, not a shopping checklist. A candidate satisfying only key custody, biometrics, attestation, secure boot, or hashing does not satisfy L2.

## Candidate families — disposition under current evidence

| Family | What it could ground | Missing or disqualifying gap | Disposition |
|---|---|---|---|
| POCO + ordinary app + hardware key without trusted content display | Key custody; an explicit key operation | Host can misbind what was reviewed to what is signed; verifier provenance/currentness unresolved | REJECT as an L2 solution |
| POCO screen premise alone | Human presentation, but only under the previously accepted assumption | Does not bind displayed content to the signed/verified payload or establish verifier provenance | INSUFFICIENT |
| Moto G52 offline | Potentially separate network exposure and a place for an independently built verifier | Same general mobile-OS threat; no selected/proven software, parser, presentation, input or provisioning chain | NOT ESTABLISHED; no device changes |
| YubiKey 5 NFC alone | Protected key custody and possession/operation evidence within its actual interface | No independent human-readable trusted display of the complete arbitrary Constitution and scope | NOT SUFFICIENT; do not purchase/configure on current evidence |
| External signing/confirmation device with trusted display and input, plus independently provisioned verifier | In principle could bind reviewed semantic content to an endorsement under a defined threat model | No concrete device/protocol/provenance chain has been selected or shown to satisfy the complete claim; revocation and effect enforcement remain separate | RESEARCH FAMILY ONLY |
| Explicit owner-accepted environmental assumption | Can define what is trusted for the first decision without pretending cryptography proves it | If it trusts the same host against an adversary the L2 model includes, it changes/weakens the threat model; it cannot be silently called L2 | Only if the owner explicitly changes the threat assumptions; not accepted here |

## Bootstrap circularity test — result

A verifier does not become trusted because the Constitution names it; that would use the unestablished Constitution to bootstrap its own verifier. A Constitution does not become legitimate because the verifier says PASS; that would let the verifier manufacture the legitimacy it is supposed to appraise. A key does not solve either circularity merely by signing a hash.

The circle can be broken only by a prior, explicitly accepted and appropriately bounded recognition basis for the initial evidence channel/verifier (for example, a genuinely independent provisioning/presentation boundary, or a declared environmental assumption whose scope excludes the relevant compromise). That basis is a premise to govern and disclose—not a new authority above the owner. Its acceptance must not be confused with proof that every property is cryptographically established.

The current repository and available device facts do not demonstrate such a basis for the selected L2 threat model.

## Decision

- **L2 remains the objective; no downgrade to L1.**
- **Genesis premise: specified conceptually, not grounded operationally.**
- **Initial owner-intent/content-binding path: NOT ESTABLISHED.**
- **Verifier provenance/currentness: NOT ESTABLISHED.**
- **Final protected sink/bypass closure: NOT ESTABLISHED.**
- Keep `OPEN / STOP / UNKNOWN`; no ceremony, key generation, signature, digest/freeze, APK, device modification, source/test/workflow change, commissioning or protected effect.
- Do not buy or configure a device until a concrete candidate can be tested against the seven properties above, including its trust/provisioning dependencies.

## Next bounded action

Do not repeat product/device comparisons. The next useful step is to identify whether any *concrete, inspectable* independent approval/verifier boundary is available to this project, and prove its provenance and content-binding properties under the selected threat model. If none is available, report the exact missing capability and keep STOP; do not manufacture a root object or pretend a second app/phone creates independence.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
