# STEP 7 — Deployment and Failure-Domain Inventory — 2026-10-11

Status: INVENTORY / DESIGN ONLY — NO ROOT FAMILY SELECTED — IMPLEMENTATION STOP RETAINED

## Purpose

Satisfy the current Step 7 gate by separating (a) known repository behavior, (b) owner-stated long-term goals, and (c) deployment assumptions that remain unverified. This inventory is a comparison input, not a new authority contract and not a selection of a physical trust mechanism.

## Evidence discipline

- MASTER architecture establishes the invariant chain: TRUST ANCHOR → IDENTITY → AUTHORITY → CAPABILITY → POLICY → WORLD REVALIDATION → EXECUTION → VERIFICATION.
- The owner-approved commissioning decision identifies Kevin as the initial human constitutional authority. The phone is only a candidate channel; it is not declared a trust root.
- The Genesis Trust Foundation, Bootstrap Composition, Constitution Authority Context, and Independence/Failure-Domain documents are semantic design contracts; their existence does not prove a deployed trust basis.
- Source review 2026-10-11 identifies an existing simulation runtime and a separate generic protected-transition function. Their production composition is not evidenced by the reviewed search. P112 remains owner of the detailed simulation mutation-sink analysis; it is not rerun here.
- Frozen AB/TLC/Kafka findings remain frozen. The AB STOP distinction is retained: request ≠ enforcement, revocation issued ≠ enforced everywhere, and a valid historical artifact ≠ current authority.

## What is grounded versus not grounded

### Grounded from repository evidence

1. A legacy simulation-oriented runtime can invoke adapters, mutate simulation state through known routes, and record outcomes.
2. A generic protected-transition contract calls an injected authority gate and blocks when it returns STOP/UNKNOWN.
3. The default authority gate is NOT_IMPLEMENTED. A supplied AUTHORIZED result is trusted as a control input by that generic function; the function does not independently establish the legitimacy of the supplied authority result.
4. The declared effectBoundary.prepare port is not called by the reviewed protected-transition function.
5. The inspected assistants script constructs/persists simulation mission plans; it does not call executeProtectedTransition in the reviewed path.
6. No source evidence reviewed establishes a dedicated production first-boot constitutional commissioning entrypoint or a complete protected effect boundary.

### Owner-stated goals, not current runtime claims

- Nexo should be local-first and provider-independent; model/provider replacement must not transfer Nexo identity or authority.
- Future capabilities may include hands-free interaction and control across devices such as a TV, subject to permissions and Constitution.
- These goals do not prove that any phone, Android app, TV, OS API, cloud service, or physical effect route is currently integrated or protected.

### Deployment facts still required

- Which device/app/runtime is the first actual Nexo deployment target, as distinct from the simulation research environment.
- Whether the first deployment is information-only, local-persistent-state capable, or effect-capable.
- Exact protected-effect classes in scope for commissioning.
- Actual first-boot entrypoint, artifact/build identity, configuration, dependencies, state owner, and all callers.
- Last component capable of causing each protected effect, and all bypass paths.
- What pre-existing basis Kevin recognizes before Nexo asks him to approve the Constitution, and how the displayed exact content is bound to the consumed approval.
- Currentness/revocation behavior while online, offline, after device loss/replacement, after account recovery, after restore/rollback, and after root or credential compromise.
- Which components/failure domains can be compromised together, including OS, app/session, display/accessibility/keyboard, storage/backups, network/provider, verifier, policy, recovery operator, and final effect mechanism.
- Whether any independent enforcement boundary exists outside the candidate software that would remain effective if the app/runtime or its authority gate were compromised.

Until these facts are grounded, no mechanism family can be honestly selected.

## Protected-effect classes and current evidence

| Effect class | Example scope | Current repository evidence | Security claim required before activation | Current disposition |
|---|---|---|---|---|
| E0 — information/proposal only | Explain, plan, display a proposal without protected state change | Model/assistant planning paths exist; deployment binding not established | No claim that proposal itself authorizes an effect; clearly separate suggestion from authorization | Candidate for non-protected design work only |
| E1 — research simulation/world state | Change agents/resources inside the simulation | Legacy runtime and P112 mutation sink are known | Simulation invariants and outcome semantics for the simulation claim; do not promote this to device safety | Existing research environment; do not reopen P112 |
| E2 — local persistent application state | Save mission/memory/config in app-owned storage | Simulation scripts persist state; generic conditional persistState adapter exists for bounded application state | Correct ownership, revision/commit semantics, integrity, recovery/currentness; persistence alone is not authority | Partial, bounded source evidence only |
| E3 — device/OS/app control | Change Android settings, invoke another app, access protected device capability | No complete NCS constitutional effect route established by this review | Permission/capability and current policy bound to exact request; enforcement at the final Android/OS-facing sink; bypass closure | UNKNOWN / not evidenced |
| E4 — external device/TV/IoT | Control a TV or another device | Long-term goal only; no relevant deployed route evidenced here | Device identity, exact operation/target binding, remote-side authorization, replay/currentness, effect receipt and reconciliation; local intent is not proof of remote enforcement | Goal only; not implemented/evidenced |
| E5 — external service/network or irreversible/high-impact action | External account/service or physical-world effect | No such commissioned NCS path established by this review | Effect-class-specific authority, external sink semantics, final enforcement, outcome verification, revocation/partition behavior and recovery; UNKNOWN must not retry into success | Out of current proven scope; no activation |

These classes are scope labels for the inventory, not a claim that every class is implemented. No effect class is promoted to protected deployment based on simulation tests or an injected AUTHORIZED result.

## Candidate recognition families — comparison only

The families below are taken from the existing Trust Foundation Root Recognition Gate on main. This table compares questions and trade-offs; it does not select a family or imply that a particular product or mechanism exists.

| Recognition family | What it could establish if independently provisioned and enforced | Common-mode/failure-domain questions | Offline currentness and revocation | Loss/recovery behavior | Final effect boundary status |
|---|---|---|---|---|---|
| F1 — immutable or externally provisioned root | A pre-existing reference/basis for recognizing the specific Genesis claim, if the provisioning process is itself justified | Who provisions it, who can replace it, and what happens if the provisioner or delivery channel is compromised? Is that authority external to the candidate root? | An immutable reference does not by itself tell whether authority was revoked or superseded; needs governed status bounds or safe non-action | Loss may mean no re-commissioning without a separately governed recovery/succession path | Not identified in a deployable target |
| F2 — mutable root updated under a previously protected root | A governed succession/update chain whose new root is admitted before the old one is retired | Does the prior root remain effective through verification? Are update, verifier, storage, and recovery actually independent enough for the claim? | Must reject stale branches and know the limits of offline revocation/currentness; version/epoch alone is insufficient | Failed update preserves prior enforcement or enters safe non-action; rollback cannot resurrect old authority | Not identified in a deployable target |
| F3 — platform/hardware root | Only the platform properties the concrete platform can demonstrate and independently enforce | Is the property supported by the actual device/platform? Do firmware, OS, vendor, attestation, and recovery share control/failure domains? Is evidence bound to the running artifact and sink? | Attestation/boot measurements do not alone establish current constitutional authority or live revocation | Device loss/repair/reset and platform recovery must not silently enroll a new root or restore stale authority | No target-specific independent attestation or final enforcement demonstrated |
| F4 — multiple roots / threshold composition | The exact claim/scope permitted by an explicit composition rule and proven independence/failure-domain closure | Separate keys, services, accounts, providers or apps may share one root, administrator, policy, firmware, backup or recovery domain; closure must be established outside the composition result | All required participants/currentness conditions must be resolved; unavailable/revoked/ambiguous support remains UNKNOWN unless prior Constitution explicitly governs a bounded alternative | Must define threshold loss, replacement, split-brain, dispute, recovery and succession before use; no best-source fallback | No real supports, independent composition source, or final enforcement boundary demonstrated |
| F5 — phone/channel as approval interface (not a root family by itself) | Potentially a bounded human interaction/approval event if enrollment, presentation, exact-content binding and intent are independently justified | Possession, unlock, app session, display, accessibility, keyboard, clipboard, account recovery, cloud backup and OS may share compromise paths | Local time/cache/metadata cannot establish currentness; network unavailability must not silently accept stale approval | Lost/replaced/compromised phone requires a governed recovery and re-enrollment process; Termux on the same phone is not an independent channel by itself | No approval capture or protected consumption boundary established |

### Comparison result

- F1–F4 remain candidate families only. No evidence currently demonstrates that one is available and appropriate for the actual deployment profile.
- F5 is an interaction-channel role, not an independent trust foundation. The owner's prior selection of the current phone as a candidate does not change this.
- Local-first/provider-independent is a design goal, not proof that the root must be local or that external support is forbidden. Any external provisioning/authority dependency must be explicit, claim-scoped, replaceable where required, and assessed for common-mode risk.
- Do not select hardware, key type, provider, algorithm, quorum, account, or human ceremony from this comparison alone.

## Claim and failure-state inventory

| Claim | Minimum question | Required failure state when unresolved |
|---|---|---|
| C1 — Kevin intentionally approved the exact Constitution and commissioning context | What pre-existing fact lets Kevin recognize the channel, and how is the displayed content bound to the consumed approval? | UNKNOWN / no activation |
| C2 — Genesis basis is independently recognized | What recognizes the candidate root before it is trusted, outside that candidate's own authority? | UNKNOWN / STOP |
| C3 — constitutional regime is current | How are amendment, revocation, succession, restore, and conflicting branches resolved under a pre-established rule? | UNKNOWN / HOLD / REVALIDATE |
| C4 — Policy binding is governed by that Constitution | What protected context establishes the regime and its scope, without caller-supplied authority metadata? | UNKNOWN / no policy admission |
| C5 — each protected effect is fully mediated | What is the last effect-capable component, and can any caller bypass its check? | STOP for that effect class |
| C6 — reported outcome reflects the actual effect | What independent sink/world evidence distinguishes no effect, completed effect, and ambiguous outcome? | UNKNOWN / reconcile; no generic retry-to-success |
| C7 — recovery preserves legitimacy | What authority governs recovery before failure, and can recovery share the compromised root it is meant to replace? | UNKNOWN / quarantine or bounded safe non-action |

## Decision and next gate

No family selected. No new component or contract is justified yet.

Next exact action: ground the actual first deployment profile and entrypoint from source or explicit owner-approved deployment assumptions. If no deployable entrypoint exists, state that construction gap directly and keep commissioning blocked. Once the profile is grounded, map its complete effect routes and failure domains against this inventory, then compare F1–F4 for the exact claims. Keep the phone as a candidate interaction channel only unless independent evidence establishes a narrower role. Reconcile any material finding with MASTER + frozen AB + P/P112; do not rerun frozen probes or repeat P112.

Overall Step 7 remains OPEN / STOP / UNKNOWN for protected constitutional commissioning.
