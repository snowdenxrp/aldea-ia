# NCS — STEP 7: Mobile Failure-Graph vs Trust-Recognition Families
Date: 2026-10-08
Branch: ncs-clean-architecture
Status: P0 COMPARATIVE ANALYSIS — NO ROOT, CLIENT, PLATFORM, OR VERIFIER SELECTED

## 1. Purpose and source discipline
Compare the already-recorded primary-phone failure graph with the existing recognition/verifier families. This is a claim-relative comparison, not a new trust architecture. It reuses:
- NCS/STEP_7_PRIMARY_MOBILE_DEVICE_CONTROL_SLICE_2026-10-08.md
- NCS/STEP_7_READ_ONLY_MOBILE_INTERACTION_CLAIM_EFFECT_CONTRACT_2026-10-08.md
- NCS/STEP_7_EXISTING_CLIENT_BYPASS_PATH_INSPECTION_2026-10-08.md
- main:NEXO_NCS/BUILD/STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md
- main:NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md
- NEXO_NCS/RESEARCH/STEP_7_INITIAL_VERIFIER_TRUST_BASIS_OPTIONS_2026-10-08.md
- NEXO_NCS/RESEARCH/STEP_7_CONCRETE_COMMISSIONING_THREAT_MODEL_AND_MECHANISM_COMPARISON_2026-10-08.md

No historical AB/TLC/Kafka probe was rerun. No platform-specific claim was made.

## 2. First distinction: two different claims
**Claim A — Read-only answer presentation:** the client returns a non-sensitive informational answer without private-state reads, tools, writes, or external actions. The critical technical question is whether the chosen client and execution path can enforce this no-side-effect scope.

**Claim B — Protected Nexo authority/commissioning:** the system recognizes the legitimate Constitution and Kevin's exact owner authorization for protected operations. The critical question is independent, non-circular root recognition and current enforcement.

These claims overlap in their dependencies but are not interchangeable. A trust root does not automatically prevent an over-privileged client from invoking tools. A UI scope check does not establish constitutional legitimacy. A phone biometric does neither by itself.

## 3. Compare the existing verifier-basis candidates against the phone failure graph

| Existing family | What it could contribute to this slice | Failure domain / unresolved issue | Disposition for this analysis |
|---|---|---|---|
| V1: explicit bounded owner-verified prototype assumption | Could make a narrowly accepted research environment assumption explicit | The existing reconciliation record says this assumption has NOT been accepted. It would not prove production security or external-effect safety | Not available by implication; no selection |
| V2: independently verified source/build/package | Can establish bounded artifact correspondence and improve detection of source/build substitution | Source host, build worker, dependencies, signer, release/update channel and phone installation path remain dependencies; source identity alone does not prove scope enforcement | Candidate evidence family for a future concrete client, insufficient alone |
| V3: hardware/platform-assisted root | May provide platform-specific key/boot/attestation evidence if the exact device actually supports and enforces the property | Phone make/model, OS, patch, boot state, attestation chain, verifier policy and update lifecycle are UNKNOWN. Hardware evidence does not enforce the no-tools/no-reads boundary by itself | Not selectable until a target and claim-specific property are verified |
| V4: external provisioning authority | Could supply a pre-existing verifier/root reference or initial binding | Issuer legitimacy, recovery, provider capture, update control and exit could create an unaccepted governor; does not itself constrain a client after commissioning | Conditional family only; no issuer selected |
| V5: separate trusted verifier/execution environment | Could separate scope enforcement from a candidate client if a genuinely independent environment exists | No such environment has been identified in the repository. A second process, device, service or provider is not independent merely because it is separate | No available concrete basis established |
| V6: candidate verifies itself | None beyond convenience | The candidate application can redefine its own verifier/policy; circularity and common-mode compromise | Rejected as sole basis |
| Immutable / externally provisioned root | Can provide a stable reference under a separately legitimate provisioning basis | Provisioning, replacement, recovery, update and loss-of-root authority still require a legitimate independent basis | Not a universal winner; not selected |
| Mutable root protected by a prior root | Can support governed updates after a valid prior root exists | Does not solve genesis; old-root retention, update enforcement, rollback and recovery remain dependencies | Not a genesis solution by itself |
| Hardware/platform root | Can add a lower-level trust primitive for a precisely evidenced claim | Manufacturer/firmware/boot/update/recovery are dependencies; hardware root does not establish owner legitimacy | Supporting mechanism only |
| Multiple roots / threshold | Can reduce some single-credential risks if participants and failure domains are genuinely independent | Independence, enrollment, availability, recovery and common-mode control are not established; thresholds do not create legitimacy automatically | No quorum or participant set selected |

## 4. Failure-graph coverage test
The current phone failure graph includes loss/theft, unauthorized unlock, compromised app, compromised OS, offline/stale authority, replay/duplicate input, crash/restart, recovery/replacement, and conflicting/late history.

The recognition families do **not** close these questions automatically:
- Loss/theft: requires action-specific authority and revocation behavior; device possession is not authority.
- Unlock/biometric: can be one signal in a defined ceremony, but is not a universal permission or independent constitutional proof.
- App compromise: requires a boundary that actually prevents the app/model from widening scope; a signed package alone does not prove that property.
- OS compromise: any claim depending on the phone must state whether it survives privileged OS compromise. The phone cannot be its own sole integrity witness.
- Offline/stale authority: requires a claim-specific currentness/revocation bound or a safe hold; no universal TTL is inferred.
- Replay/duplicate: requires request/approval freshness and exact context binding where applicable; root family alone does not consume a request at the enforcement boundary.
- Crash/restart: requires truthful outcome classification and reconciliation only for operations whose effects can occur; a read-only answer should not invent a transaction subsystem.
- Recovery/replacement: must not turn device recovery into constitutional authority or resurrect a revoked root.
- Conflicting/late history: must remain UNKNOWN/STOP until governed resolution; arrival order is not authority.

## 5. Key result
**No recognition family can be selected responsibly from the current evidence, and choosing one would not solve the immediate client gap.**

The repository has no identified Nexo mobile conversation client in the inspected branch. The read-only contract is semantic only. Therefore:
- there is no concrete client path whose scope boundary can yet be tested;
- there is no basis to name a final presentation/enforcement component;
- there is no evidence of independent recognition on the phone;
- no phone platform, provider, authenticator, root, verifier, threshold or provisioning ceremony is selected.

This is not a reason to invent a universal trust layer or another wrapper. It is a concrete missing deployment decision and evidence gap.

## 6. Correct next decision boundary
Continue P0 design without implementation. Before platform-specific investigation, decide whether to open a separate Nexo client-design slice or continue only the trust-foundation comparison. If a client-design slice is opened, its first output should be a capability-minimal client architecture and threat-boundary diagram—not a functioning app—and it must preserve the separation between Lúmina and Nexo.

The first concrete implementation candidate must demonstrate, with source and tests, that the read-only interaction path has no access to tools, private device reads, persistent writes, or external effects. It must also identify which guarantees fail if the app or OS is compromised. If the design requires wrapping an over-privileged component to pretend it is read-only, STOP and redesign the root capability boundary.

No owner-authority question is reopened: Kevin remains the sole initial constitutional authority. His daughter remains an intended future successor only, without present authority. No succession trigger or ceremony is inferred. Protected Constitution Authority Context, commissioning, root enrollment/rotation, recovery/succession and external Nexo effects remain blocked.
