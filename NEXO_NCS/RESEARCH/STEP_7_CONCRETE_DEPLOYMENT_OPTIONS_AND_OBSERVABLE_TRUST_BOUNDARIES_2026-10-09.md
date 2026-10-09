# STEP 7 — Concrete Deployment Options and Observable Trust Boundaries — 2026-10-09

Status: RESEARCH / COMPARISON ONLY — NO DEVICE, PLATFORM, ROOT FAMILY, CREDENTIAL, OR COMMISSIONING TARGET SELECTED

## Question

After selecting the local protected Core authority-establishment boundary as the first design target, what real deployment classes could host it, and which trust properties could actually be observed and tested rather than assumed?

This comparison is not a recommendation to use the user's current phone, not a purchase recommendation, and not permission to enroll a credential or commission Nexo. No actual device inventory has been supplied or inspected.

## Evidence hierarchy and preserved architecture

This note reuses:
- `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`;
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`;
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md`;
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`;
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md`;
- `NEXO_NCS/RESEARCH/STEP_7_DEPLOYMENT_FAILURE_DOMAIN_INVENTORY_2026-10-09.md`;
- AB104.368's independent authority (A) / target (T) frontier;
- P112's dependency-closure rule: missing or unobserved dependencies are not evidence of absence and incomplete closure remains UNKNOWN.

The platform documentation below describes bounded technical mechanisms. It does not establish Nexo's constitutional legitimacy. A hardware-backed key, verified boot state, or attestation result cannot independently create the authority used to interpret that result.

## Candidate environments

### A. Existing Android phone (candidate class only)

**What can be observed if the exact device supports it**
- Whether a particular Android Keystore key is backed by a Trusted Execution Environment (TEE) or StrongBox, using the documented security-level API.
- Where supported, the key-attestation chain and its declared security properties, including the verified-boot state, bootloader lock state, and boot key/hash fields.
- Whether the attestation chain anchors to the expected attestation root and whether certificates are revoked. Attestation must be validated, not accepted as an app-supplied boolean.
- Whether a supported device exposes Android Protected Confirmation for integrity-protected user confirmation of a specific message. This is a narrow confirmation facility, not a Genesis mechanism.

**What this could contribute**
- Portable local compute and interaction.
- A bounded claim that a particular key is hardware-backed and/or that a declared boot state was measured, if the exact evidence chain is independently validated.
- A possible test platform for a non-commissioning prototype that has no authority to activate effects.

**What it cannot establish**
- That Kevin's credential-to-owner relationship is legitimate, or that the user intended the exact constitutional scope.
- That the candidate Core's constitutional regime is legitimate.
- That the entire application/runtime and all relevant paths are protected merely because one key is hardware-backed.
- That a key cannot be used by a compromised app process; Android's documentation distinguishes preventing key extraction from preventing all unauthorized use inside a compromised device.
- Current revocation while offline, complete bypass closure, independently governed recovery, or the truth of an app's self-reported status.

**Observable tests before any platform claim**
1. Identify exact manufacturer/model, Android version/build, bootloader state and security update status from the device itself.
2. Generate a disposable test key only in a later explicitly authorized test; inspect KeyInfo security level rather than assuming StrongBox.
3. If attestation is supported, validate the complete chain, expected root, security-level claims, revocation status, challenge freshness and relevant boot-state fields.
4. Verify what happens after reboot, OS/app update, bootloader-state change, device reset, backup/restore, network loss and certificate revocation.
5. Trace whether the OS, privileged services, app process, accessibility/automation, backup, debug and recovery paths can bypass the proposed local authority check.
6. Record which facts are OBSERVED versus vendor-declared, inferred or UNKNOWN.

No such test has been performed in this research step.

Official references:
- Android Keystore: https://developer.android.com/privacy-and-security/keystore
- Android key attestation: https://developer.android.com/privacy-and-security/security-key-attestation
- Android Protected Confirmation: https://developer.android.com/privacy-and-security/security-android-protected-confirmation

### B. Existing Windows laptop / PC (candidate class only)

**What can be observed if the exact machine is correctly equipped and configured**
- Secure Boot configuration and the firmware's boot-policy state.
- Trusted Boot's signature checks through the startup chain.
- TPM-backed measured-boot evidence, where available and enabled.
- If deliberately deployed, remote health attestation can appraise measured-boot evidence; this introduces a separate verifier/service, its policy, network availability and its own trust dependencies.

**What this could contribute**
- A local development/runtime environment with inspectable boot, OS, administrator, update and storage dependencies.
- Bounded evidence about boot integrity and selected measured components when the exact chain and appraisal policy are verified.

**What it cannot establish**
- Owner legitimacy or the constitutional authority of the Nexo regime.
- Complete integrity of every application, plugin, dynamic module, administrative path or external effect.
- Current offline revocation if the chosen appraisal design depends on a remote service.
- Recovery independence: a TPM or platform recovery mechanism is not automatically a legitimate constitutional successor.

**Observable tests before any platform claim**
1. Identify exact model, firmware, OS edition/version, TPM presence/readiness and who controls firmware settings.
2. Inspect Secure Boot state and configuration; do not infer it from the OS being Windows.
3. Determine which components are measured, how the log is protected, and who appraises it. Distinguish local log integrity from independent appraisal.
4. Test changes to boot configuration, updates, rollback/recovery, administrator privileges, storage snapshots, and loss of the attestation service.
5. Trace local privilege escalation and alternate execution paths around the proposed Core boundary.
6. Bound offline behavior and document any stale-evidence window rather than silently treating cached health as current.

No such test has been performed in this research step.

Official references:
- Microsoft Secure Boot and Trusted Boot: https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/trusted-boot
- Microsoft secure/measured boot explanation: https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/secure-the-windows-10-boot-process
- Microsoft Secure Boot requirements and keys: https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-secure-boot

### C. Dedicated local node (mini-PC / single-board computer / purpose-built host)

**Potential contribution**
- A narrower operational purpose, fewer ordinary user apps, controlled physical placement and a deliberately bounded software stack.
- Potentially easier separation between Nexo's local Core and the user's everyday interface/device.

**Why “dedicated” is not itself a trust property**
- Secure/measured boot, TPM/secure element, protected key storage, firmware update controls and rollback behavior vary by exact board, revision, firmware and configuration.
- A separate device can still share common-mode failures through the same owner/operator, supply chain, signing service, update source, network, backup, or recovery credential.
- A custom minimal image can reduce some dependencies while making secure updates, incident response and long-term maintenance the owner's burden. Simplicity of the diagram is not proof of integrity.

**Observable tests before any platform claim**
1. Name the exact board/model/revision, firmware, boot ROM/chain, secure element/TPM and supported attestation capabilities.
2. Identify who can replace firmware, disable verification, access debug interfaces, restore snapshots or change update keys.
3. Demonstrate the exact measured/verified components and the independently validated evidence available to the Core.
4. Test power loss, offline startup, rollback, replacement hardware, compromised updater, backup restore and recovery.
5. Compare its actual failure domains with the user's existing computer/phone; don't call them independent merely because they are separate devices.

No board or model is selected; no such test has been performed.

## Cross-option comparison

| Dimension | Android phone | Windows laptop / PC | Dedicated local node |
|---|---|---|---|
| Portability / hands-free interface | Strong potential | Possible, but form factor varies | Depends on separate interface |
| Hardware-backed key evidence | Conditional; inspect actual KeyInfo and attestation | TPM/key protection depends on exact configuration and design | Entirely model/firmware dependent |
| Boot-integrity evidence | Verified-boot claims may be available through supported attestation | Secure/Trusted Boot and measured boot where configured | Must be established for exact board |
| App/runtime attack surface | Shared mobile OS and privileged services | Broad OS/admin/update ecosystem | Potentially narrower, but only if maintained well |
| Offline currentness/revocation | Unresolved; cached evidence is not currentness | Unresolved; remote attestation adds availability dependency | Unresolved; requires a defined freshness/revocation model |
| Recovery and replacement | Vendor reset/backup paths must be mapped | OS recovery, firmware and admin paths must be mapped | Owner must design and maintain replacement/recovery |
| Constitutional Genesis legitimacy | Not established | Not established | Not established |
| Current disposition | Candidate only | Candidate only | Candidate only |

## Cross-option result

No platform class is categorically sufficient. The evidence changes the next question from “which brand is most secure?” to:

**For one exact candidate host, can we independently observe and validate the particular properties LCORE-1 relies on, while keeping constitutional legitimacy, owner recognition, currentness/revocation and recovery as separate unresolved claims until each has its own basis?**

A positive platform measurement would only support its named technical claim. It must not promote the Genesis foundation, Constitution, Policy, identity, authority, or effect state.

## Minimum deployment evidence packet (future, not collected)

Before considering a real platform target, capture only non-secret, claim-relevant facts:
1. Exact host identity/model/revision and software/firmware versions.
2. Boot verification state and evidence source.
3. Hardware-backed key capability and validation method, if relevant.
4. Privileged actors and update/debug/recovery/backup paths.
5. Dependency and common-mode failure map.
6. Online/offline currentness and revocation behavior, including maximum stale window if one can be justified.
7. Exact local Core operation protected and the last boundary that can reject an unrecognized regime.
8. Explicit UNKNOWNs and how each would block only dependent transitions.

Do not collect or store an INE image, PIN/password, private key, recovery secret, biometric template, or other credential material as part of this inventory.

## Future-countereffects review

- **Convenience shortcut:** choose the existing phone because it is available. Future cost: device-specific boot, vendor and update assumptions become silently baked into Genesis. Rejected.
- **Hardware shortcut:** equate StrongBox/TPM/secure element with constitutional root. Future cost: key custody or platform integrity becomes governance authority. Rejected.
- **Attestation shortcut:** trust an app's `secure=true`, a local log, hash or signed report without validating its root, scope, freshness and revocation. Future cost: circular/self-attested trust. Rejected.
- **Dedicated-device shortcut:** treat a second device as independent. Future cost: common firmware, operator, updater, backup and recovery dependencies remain hidden. Rejected.
- **Offline shortcut:** accept the last known good state indefinitely. Future cost: stale or revoked authority can resurrect. Rejected.
- **Universal mechanism shortcut:** add a generic trust registry, quorum, hardware abstraction, or universal independence engine to hide unknowns. Future cost: premature global APIs and compatibility burden. Rejected.

No new mechanism is justified by this comparison.

## Decision / next step

- No deployment target selected.
- No trust family selected.
- No credential or ceremony selected.
- No Genesis Trust Foundation established.
- No Constitution Authority Context implementation or commissioning authorized.
- LCORE-1 remains UNKNOWN/STOP.

**Next bounded action:** create a factual inventory of which host classes are actually available to the user (without collecting secrets), then inspect only the platform facts relevant to those exact candidates. Compare observed evidence against the same LCORE-1 claim and the six blocking premises. Do not select a root family until the actual environment and its observable boundaries are known.

## Sources

- Android Keystore documentation, Android Developers: https://developer.android.com/privacy-and-security/keystore
- Android key attestation, Android Developers: https://developer.android.com/privacy-and-security/security-key-attestation
- Android Protected Confirmation, Android Developers: https://developer.android.com/privacy-and-security/security-android-protected-confirmation
- Secure Boot and Trusted Boot, Microsoft Learn: https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/trusted-boot
- Secure the Windows boot process, Microsoft Learn: https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/secure-the-windows-10-boot-process
- Secure Boot requirements, Microsoft Learn: https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-secure-boot
- IETF RFC 9334, RATS Architecture: https://www.rfc-editor.org/rfc/rfc9334.html
- NIST SP 800-193, Platform Firmware Resiliency Guidelines: https://csrc.nist.gov/pubs/sp/800/193/final
