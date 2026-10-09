# NCS STEP 7 — Claim-Relative Deployment and Failure-Domain Inventory
Date: 2026-10-08
Track: NCS clean architecture
Status: P0 INITIAL INVENTORY — TARGETS / PHYSICAL BOUNDARIES UNSELECTED — IMPLEMENTATION STOP

## Purpose

This inventory follows the verified requirement-to-canonical-owner matrix:
`NCS/STEP_7_REQUIREMENT_TRACEABILITY_MATRIX_2026-10-08.md`.

It translates already-stated Nexo capability goals into bounded protected-effect classes so trust-recognition families can later be compared against actual claims. It does **not** assume a specific device, vendor, hardware root, authenticator, protocol, cloud, or deployment architecture. Any unselected target or unverified boundary remains UNKNOWN.

The intended capabilities listed here are planning scope, not claims that Nexo currently implements them.

## Inventory rules

- Distinguish the protected claim from the mechanism proposed to support it.
- Identify the last component capable of causing the effect, not merely the component that requests it.
- A shared administrator, build pipeline, updater, provider account, distribution channel, clock, storage, network, or verifier may create a common-mode failure across components that look separate.
- A signed request, valid credential, successful API response, hash, snapshot, or local STOP state does not by itself prove current authority or universal enforcement.
- If an offline actor cannot be independently fenced, do not claim its authority has been cut off; block dependent protected effects until revalidation.
- Unknown environment facts remain UNKNOWN. Do not fill them with a default assumption just to choose a trust family.

## Claim-relative inventory

| Class | Protected claim / effect | Candidate final effect boundary | Trust / authority dependencies | Common-mode and offline concerns | Recovery / predecessor cutoff | Evidence status and next fact to establish |
|---|---|---|---|---|---|---|
| D1 — Constitution / root lifecycle | Initial commissioning; constitutional amendment; root enrollment, replacement or revocation. | UNKNOWN: no target platform, protected boundary, or independently enforcing component selected. A Core constructor or local metadata store is not enough. | Owner's closed normative authority decision; exact constitutional regime; independently recognized trust basis; exact-context approval; currentness/revocation; dependency closure. | Root, verifier, updater, provider, admin account, build/distribution, storage and recovery path may share control. Offline devices may retain old root material. | Replacement must not disable prior independent protection before successor verification; if cutoff cannot be enforced, protected transition remains blocked. | Semantic contracts exist; real root and enforcement are unimplemented/unproven. Establish the intended deployment target and who can physically/software-wise alter the trust basis. |
| D2 — Succession / disaster recovery | Enter recovery mode; establish a successor only under predeclared constitutional conditions; prevent old authority from remaining effective where cutoff is required. | UNKNOWN: no independent recovery boundary or target-device enforcement demonstrated. | Constitution's predeclared succession rule; current trust basis; independent evidence for the succession condition; protected ordering; predecessor fencing; recovery authority separated from normal authority. | Recovery provider may share the compromised root; copied snapshots/clones may appear current; offline predecessor may remain active; multiple anchors may share administrator/build/channel. | No age/date/biometric/document/snapshot alone can transfer authority. The daughter remains future intended successor, with no present authority. Conditions, ceremony, eligibility and cutoff are not yet specified. | Normative owner decision recorded; operational succession conditions and enforcement evidence absent. Identify candidate deployment/failure assumptions without inventing succession triggers. |
| D3 — Device / environment control | Cause a target device or environment to perform a requested action (e.g., eventual TV/device control). | UNKNOWN: target device, API, local controller, vendor service, and alternate control routes are not selected. | Current owner authority and policy; action/target/scope-bound authorization; current world/device state; last-boundary validation; observed effect evidence. | App/runtime, device account, vendor cloud, local network, credentials, firmware/update channel and physical controls may bypass or share trust. Offline control can outlive revocation. | Recovery must not silently restore stale device permissions. If a device cannot check current authority, define bounded offline behavior per effect; otherwise HOLD. | Desired capability only; no specific device/API or final effect boundary evidenced. Establish one concrete target and enumerate all routes that can cause the same effect. |
| D4 — Vault / secrets / credentials | Reveal, use, rotate, revoke, or export a credential/secret for an authorized purpose. | UNKNOWN: no Vault implementation, protected key boundary, or secret-use target established in this Step 7 evidence. | Authority to access/use a specific secret for a bounded purpose; least scope; protected presentation/approval when required; current revocation and audit/effect evidence. | Same user/admin account may control application, recovery, backup, and secret storage; logs/snapshots may leak or resurrect material; offline copies may survive rotation. | Credential rotation/deletion does not prove every copy is revoked or erased. Recovery must not expose secrets or restore obsolete authority. | Requirement exists in architecture intent, but concrete secret classes, consumers, storage and enforcement boundary are UNKNOWN. Inventory secret-use effect classes before selecting storage technology. |
| D5 — Irreversible / consequential external effects | Send, purchase, publish, delete, transfer, or otherwise cause a consequential external effect. This row is a class, not a claim that any integration is selected. | UNKNOWN: no external provider/API or effect-specific last boundary selected. Provider acknowledgement may not equal independently verified effect. | Exact effect contract; current authority/policy; bounded authorization; precondition revalidation; idempotency/reconciliation; independently adequate evidence of effect or no-effect. | Provider/runtime/network may lose response after commit; retry can duplicate; provider account or tool server may share credentials with decision path. Offline authority and delayed revocation are material. | Preserve occurred vs authorized. On UNKNOWN outcome, reconcile before retry; no automatic retry based solely on timeout/crash. | Semantic distinctions exist in persistent handoff; actual effects and evidence sources are not chosen. For any later integration, identify authoritative outcome evidence and retry conditions. |
| D6 — Model / provider / runtime / capability update | Change model/provider/runtime, add a tool/sensor/API/device capability, or activate changed behavior. | UNKNOWN: no protected build/update/activation boundary selected for the target deployment. | Update authorization separated from build provenance; policy/Constitution constraints; impact analysis; required assurance; protected activation gate; rollback/revocation and in-flight operation handling. | Developer/admin account, source control, CI/build, package registry, distribution, updater and runtime may share a compromise path. Shadow/canary are not authorization. | Restoring an older build/snapshot must not restore revoked authority. New provider or capability does not inherit permissions. If safe rollback cannot be established, stop activation. | Existing architecture defines change classes and governance separation; concrete deployment chain and final activation boundary remain UNKNOWN. Map actual build/update components before selecting an update trust basis. |

## Cross-cutting dependency ledger

| Dependency domain | Current finding | Consequence for trust-family comparison |
|---|---|---|
| Owner / administrative control | The normative owner is identified, but the technical channels that can prove an exact owner authorization are not selected. | Do not equate an account login, biometric, spoken phrase, or approval text with independent constitutional authority. |
| Software / build / distribution | No deployment-specific chain or isolation evidence is recorded here. | A hardware or multi-signature label does not close a compromise path if the same admin/build/distribution plane controls it. |
| Provider / model | Providers and models are not constitutional authorities. Specific providers are not selected. | Provider independence must be assessed as a dependency, not assumed from provider count. |
| Device / hardware | No concrete target device or independently enforced hardware property is established. | Do not claim a hardware root or final effect enforcement without target-specific evidence. |
| Network / clock / offline state | Offline currentness and revocation bounds are not selected. | No universal TTL; define bounds per claim/effect and block where freshness cannot be established. |
| Storage / snapshot / backup | Snapshots preserve historical bytes, not current authority. Concrete storage is unselected. | Recovery must revalidate authority/currentness and must not resurrect a revoked root or permission. |
| Verification / evidence | Existing semantics distinguish claims, evidence, verification and observed effects; concrete independent observers are unselected. | Verifier count is not assurance independence; evidence source and shared dependencies must be named per claim. |
| Recovery / succession | Normative separation is documented; condition, ceremony, failure handling and predecessor cutoff are not selected. | No recovery or succession implementation until the trust basis and enforcement boundary are evidenced. |

## Results

1. This inventory exposes no basis to choose a trust-recognition family yet: all concrete target and final-boundary choices remain UNKNOWN.
2. It does narrow the missing work. We need at least one concrete deployment slice (target + effect + all effect-producing paths + dependencies) before comparing families meaningfully. A universal abstract “Nexo deployment” would hide the very failure domains the comparison must test.
3. Do not turn examples in D3 or D5 into selected integrations. They define effect classes only.
4. Do not create another generic trust contract, trust registry, quorum engine, independence engine, or root abstraction. Reuse the root gate and role map.
5. Implementation STOP remains for Constitution Authority Context, commissioning, root enrollment/rotation, protected recovery, and succession.

## Next exact action

Select the **first concrete deployment slice for analysis**, not implementation. Candidate slices already implied by Nexo's stated goals are:
- one specific target device-control path;
- one protected Constitution/root-lifecycle operation; or
- one specific consequential external-effect class.

For that slice, record the actual target, all alternate effect-producing routes, the final enforcement component, what it trusts, who can change it, what happens offline, and what evidence confirms the effect. If no target has yet been chosen, preserve UNKNOWN and document the decision needed; do not invent hardware/vendor details.

After one slice is concrete, compare the existing recognition families against its dependency graph and failure domains. Do not implement until independent recognition and effect enforcement are evidenced.
