# STEP 7 — P1/P2 Governance-Readiness Review — 2026-10-09

Status: COMPARATIVE RESEARCH ONLY — NO GOVERNANCE OPTION SELECTED; NO CEREMONY, CREDENTIAL, ROOT OR IMPLEMENTATION AUTHORIZED.

## Purpose

Continue from `STEP_7_LCORE_1_BLOCKING_PREMISES_RESOLUTION_MAP_2026-10-09.md` by comparing plausible classes for (P1) initial Genesis recognition/provisioning and (P2) owner-to-exact-content/scope binding. The objective is to expose the actual decision and trust assumptions, not to choose a root on the owner's behalf or create another trust abstraction.

## Authority constraint carried forward

The user's stated governance preference is that Nexo's authority depends on his authorization. A witness, credential issuer, manufacturer, identity service, model/provider or cloud service must not silently become a second constitutional authority. Such actors may contribute bounded evidence only if a future Constitution-governed rule explicitly permits that evidence. No succession procedure has been established.

This review does not presume that an external institution must govern Kevin. It also does not pretend that a phone's local UI can independently prove its own legitimacy. Any owner-only bootstrap must make its initial assumptions explicit and be honest about the threats it cannot resist.

## P1 — Candidate classes for the first recognition/provisioning basis

### Class A — Explicit owner-initiated bootstrap under a declared initial trust assumption
**Potential benefit:** avoids making a third party the constitutional authority; aligns with owner-only authorization.

**Necessary assumptions and unresolved limits:** the initial ceremony must have a way to establish that the owner knowingly initiated it, that the exact Genesis/Constitution content and scope are bound, and that the bootstrap environment is not already compromised. A local prompt, file, hash or newly generated key cannot independently prove those assumptions. If the only trust in the ceremony comes from the same unverified device/UI being commissioned, the limitation must be stated rather than disguised.

**Countereffect:** treating initial local possession as permanent proof of owner identity or device integrity can create a trust-on-first-use trap and prevent safe recovery after compromise.

**Disposition:** possible governance model for further consideration, not selected; not proven by current phone evidence.

### Class B — Supervised or witnessed commissioning
**Potential benefit:** an independent witness can corroborate that a specific ceremony occurred and that a displayed content/scope was reviewed.

**Necessary assumptions and unresolved limits:** the witness's identity, independence, role and evidence require their own basis. A witness can attest to an event without becoming authorized to approve the Constitution. Witnessing alone does not prove the display was untampered, the witness was uncompromised, or the resulting root remains current.

**Countereffect:** witness dependence, collusion, coercion, availability, privacy exposure, and accidental transfer of constitutional authority to the witness.

**Disposition:** possible evidence class only if later permitted; not required or selected. It must not override the owner's authority.

### Class C — External identity credential or issuer (including a government identity credential)
**Potential benefit:** may support a bounded claim that a credential was issued to a person or that a credential is valid/current under the issuer's process.

**Necessary assumptions and unresolved limits:** credential validity is not proof that the current presenter is the owner, that a particular commissioning act occurred, that exact Constitution content was approved, or that the issuer has authority over Nexo. Credential status, model-specific verification, presenter attribution, scope and privacy must remain distinct.

**Countereffect:** over-trusting the issuer, remote service dependency, disclosure of sensitive identity data, or confusing state-issued identity with Nexo constitutional authority.

**Disposition:** INE remains a possible identity-evidence input only; no credential data requested or stored, no issuer promoted to Nexo authority.

### Class D — Hardware/platform attestation
**Potential benefit:** when available and independently verified, may support a scoped claim about a device key, boot state, or measured platform state.

**Necessary assumptions and unresolved limits:** verifier trust anchors, appraisal policy, evidence freshness, vendor endorsements and dependency closure must themselves be governed. Attestation can say something about a platform; it does not decide who governs Nexo or whether the Constitution is legitimate.

**Countereffect:** manufacturer/vendor lock-in, common-mode firmware/update failures, false confidence from an unverified attestation result, and making the current phone a permanent root simply because it is available.

**Disposition:** no platform root selected; current handset's attestation state unverified. Platform evidence must not replace P1.

### Class E — Multi-party or threshold recognition
**Potential benefit:** may reduce dependence on one custodian or failure domain when multiple parties are genuinely independent and the rule is established in advance.

**Necessary assumptions and unresolved limits:** the threshold, participants, independence criteria, conflict resolution, replacement and recovery rules must be governed before the event. Counting keys or participants does not prove independence or legitimacy.

**Countereffect:** hidden transfer from owner-only authorization to collective governance, coordination failure, collusion, complex recovery and future governance lock-in.

**Disposition:** no quorum/threshold mechanism justified or selected. Under the stated owner-only authorization preference, other participants could at most provide evidence unless the owner explicitly changes the governance rule.

## P2 — Owner-to-exact-content/scope binding

Any future ceremony must distinguish at least these separate propositions:

1. **Identity attribution:** which person or account the evidence relates to.
2. **Authentication:** whether the claimant controls an authenticator bound to that identity.
3. **Intent:** whether the claimant actively responded to this specific request.
4. **Content binding:** the exact Constitution bytes/version/hash and readable meaning presented for approval.
5. **Scope binding:** which authority domains, initial capabilities and commissioning context are included or excluded.
6. **Freshness / anti-replay:** whether the approval applies to this ceremony now, rather than a replayed or superseded request.
7. **Protected recording:** whether the accepted approval and the resulting establishment provenance are recorded by a boundary not controlled solely by the proposal/caller.
8. **Authority scope:** what the act establishes—and what it does not authorize, especially policy selection, execution or external effects.

A hash or signature can bind data cryptographically but does not by itself prove that the human saw and understood the same content, that the signing key was legitimately bound to the owner, or that the signer had constitutional authority for that scope.

NIST SP 800-63B distinguishes authentication from authentication intent. It says intent requires an explicit response to each authentication/reauthentication request; a face captured by a front-facing camera does not necessarily establish intent by itself. It also treats biometrics as a factor used with a physical authenticator, not as a standalone secret. This supports the existing Nexo separation; it does not prescribe Nexo's governance or prove this phone's authenticator properties.

Official references:
- NIST SP 800-63B (current digital-authentication guidance): https://pages.nist.gov/800-63-4/sp800-63b.html
- NIST authenticator and authentication-intent detail: https://pages.nist.gov/800-63-4/sp800-63b/authenticators/
- RATS RFC 9334, role separation and trust-anchor assumptions: https://www.rfc-editor.org/rfc/rfc9334.html
- Android key attestation, for bounded platform evidence and its verifier requirements: https://source.android.com/docs/security/features/keystore/attestation?hl=es-419
- Xiaomi POCO X7 Pro face-unlock limitation: https://www.mi.com/global/support/faq/details/KA-527959/

The NIST guidance is written for digital authentication, not Nexo constitutional governance; it is used only for the bounded distinction between identity, authentication and claimant intent.

## Combined failure/countereffect analysis

- A valid INE, passkey, PIN, biometric match or attestation can be true while the constitutional claim remains false or unsupported.
- A valid owner authentication can be replayed or attached to the wrong content unless the ceremony binds the exact request and freshness.
- A trusted display can show the correct content while a different hash/scope is committed; display and committed bytes must be bound.
- A signature over a hash does not solve compromised display, compromised signer key, coercion, ambiguous semantics, or missing authority.
- A technically secure ceremony can still be constitutionally illegitimate if the rule establishing its authority was self-created by the candidate root.
- A witness or threshold may improve one failure domain while introducing another; independence must be claim-specific, not assumed from separate people/keys.
- A device vendor can attest platform facts but must not become Nexo's constitutional governor.
- If any prerequisite is unknown, the dependent commissioning transition remains UNKNOWN/STOP; no silent fallback.

## Decision

- No candidate class selected for P1.
- No owner ceremony or credential selected for P2.
- Owner-only constitutional authority remains the stated governance preference; third parties are not promoted to authority.
- Current phone may support development and future bounded tests, but its live platform trust state is not established.
- No new trust mechanism, threshold engine, universal ceremony API, credential flow, key generation, enrollment, commissioning, activation or external effect is authorized.
- LCORE-1 remains UNKNOWN/STOP; Path A NOT ACCEPTED; Path B NOT ESTABLISHED; Path C uncommissioned UNKNOWN/STOP remains valid.

## Next exact action

The research now narrows the next real governance decision to this: **what initial trust assumption, if any, is Kevin willing to accept for an owner-initiated first ceremony when the only available device is not independently proven trustworthy?** Before any ceremony, the design must state what threats that assumption does and does not cover and how the exact Constitution/content/scope approval is bound. Do not infer the answer, select a credential or ask for sensitive material. If the owner does not accept an explicit initial assumption and no independent basis is available, remain uncommissioned UNKNOWN/STOP.
