# STEP 7 — Independent Commissioning Recognition Requirement
Date: 2026-10-08
Track: NCS clean architecture
Status: GOVERNANCE REQUIREMENT ACCEPTED — TECHNICAL MECHANISM NOT SELECTED

## Accepted requirement
Kevin explicitly accepts that Nexo's first commissioning must require an independent recognition channel under his control, and that initial activation may remain blocked when this channel is unavailable or cannot be verified.

The independent channel may eventually be another device or a physical medium; these are examples, not a selected implementation. This acceptance establishes the requirement, not proof that a specific channel is independent or secure.

## Normative boundary
- Owner-authorized commissioning remains the intended source of legitimacy under the governing Constitution.
- The initial candidate device, its model/provider, local metadata, and its own uncommissioned software cannot authenticate their own legitimacy.
- The independent channel must bind explicit approval to the exact Constitution identity/content/version and commissioning context. Approval cannot be inferred from silence, ordinary conversation, inferred intent, or provider output.
- Independence must be justified against a concrete threat model and dependency/common-mode analysis; a second device, key, provider, or physical object is not automatically independent.
- If recognition, exact binding, freshness/currentness, revocation state, or dependencies cannot be established, result is UNKNOWN and constitutional activation is blocked. Preserve evidence; do not invent fallback authority.
- Owner unavailability does not imply consent. Recovery cannot self-promote into ordinary constitutional authority.
- Provider independence, portability, and authorized migration remain requirements. The channel must not silently make a vendor/device the permanent constitutional governor.
- No universal threshold/multicustodian ceremony is implied.

## What this decision does not settle
It does not select the independent channel, credential, cryptographic protocol, hardware root, provisioning process, recovery arrangement, or succession mechanism. Those remain contingent on a threat model and adversarial review. It does not authorize implementation or activation.

## Threat-model obligations before mechanism selection
Analyze at minimum: compromised first device; malicious/compromised provider; stolen or unavailable recognition channel; coercion; replay/substitution; owner offline; revocation while offline; loss/compromise of normal and recovery credentials; migration across devices/providers; conflicting successors; shared vendor/network/update dependencies; interrupted commissioning.

For each case, state attacker capability, protected claim, dependencies, what evidence would establish the claim, allowed safe behavior, and failure state. Do not claim security properties unsupported by the chosen mechanism.

## Next exact action
Create the minimum concrete commissioning threat model and compare only mechanisms compatible with this accepted requirement. Use existing MASTER/NCS evidence and external standards where useful, but do not repeat closed generic attacks or implement the trust root before the selected mechanism passes the contract attack and future-countereffects gate.
