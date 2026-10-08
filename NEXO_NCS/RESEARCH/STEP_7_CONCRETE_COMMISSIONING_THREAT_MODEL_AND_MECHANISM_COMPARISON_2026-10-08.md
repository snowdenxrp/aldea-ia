# STEP 7 — Concrete Commissioning Threat Model and Mechanism Comparison
Date: 2026-10-08
Status: RESEARCH / COMPARISON; NO MECHANISM SELECTED; NO IMPLEMENTATION AUTHORIZED

## 1. Scope and inherited decisions
This document fulfills the next action in `STEP_7_INDEPENDENT_COMMISSIONING_RECOGNITION_REQUIREMENT_2026-10-08.md`. It reconciles rather than repeats the existing commissioning and trust-root work.

Already established:
- Legitimate semantic source: explicit owner-authorized commissioning under the intended Constitution; Nexo/model/provider cannot self-authorize.
- Initial activation must require an independent recognition channel under Kevin's control and may remain blocked when it is unavailable or unverifiable.
- That channel must approve the exact Constitution identity/content/version and commissioning context; no inferred consent.
- Provider independence, portability and authorized migration are requirements.
- Recovery cannot self-promote; no universal threshold ceremony is justified by current evidence.
- The trust basis and Constitution Authority Context are not implemented or activated.

## 2. Threat model

### Assets to protect
1. Legitimacy of the initial Constitution and the binding between Kevin's commissioning intent and that exact constitutional object.
2. Authority scope: no accidental grant of amendment, root replacement, succession, or arbitrary execution authority.
3. Currentness: prevent stale, revoked, replayed or superseded commissioning evidence from activating protected authority.
4. Continuity and portability without silently transferring constitutional control to a provider, device, OS or model.
5. Privacy: avoid centralizing raw biometrics or unnecessary identity material.
6. Availability with safe degradation: retain non-dependent safe functions where permitted, but do not activate dependent protected functions without trust basis.

### Adversaries / failure conditions in scope
- Malicious or compromised initial device, application, model/provider, operating system, firmware or update path.
- Network attacker able to intercept, replay, reorder, delay or substitute commissioning messages.
- Thief or attacker possessing the independent channel or a recovery credential.
- Social engineering, coercion, inattentive approval, misleading display or ambiguous Constitution summary.
- Compromised cloud-sync/recovery account or external provisioning service.
- Owner temporarily offline/unavailable; revocation cannot be checked.
- Device loss, hardware failure, provider exit, migration and restored stale checkpoint.
- Two competing successor claims or conflicting versions without governed ordering.
- Partial commissioning/crash at any step.
- Common-mode compromise across supposed independent devices, credentials, providers, updates or recovery paths.

### Out of scope / cannot be claimed solved
- Proving the human's internal state or freedom from all coercion by cryptography alone.
- Absolute resistance to compromise of every independent channel and all of its supply/update chains.
- Guaranteed global revocation during arbitrary partitions.
- Physical security or hardware provenance not established by evidence.
- A universally recoverable root without an independent surviving authority.
These limitations must be explicit rather than hidden in a confidence score.

### Required security properties
- Non-circularity: the candidate Nexo instance cannot establish its own legitimacy.
- Exact binding: the approval binds to a unique, canonical Constitution object, version/content digest, deployment context and one-time challenge.
- Freshness/replay protection: old approvals cannot activate a different or later context.
- Independent recognition: the initial basis is outside the candidate's uncommissioned trust domain, with dependencies disclosed.
- Scope limitation: commissioning approval does not authorize arbitrary future actions or silently authorize amendments/succession.
- Safe currentness: unknown revocation/currentness means blocked activation.
- Recovery separation: recovery of interaction access is not automatically recovery of constitutional root authority.
- Portability: migration preserves the semantic authority rule and requires explicit governed transition.
- Evidence integrity: raw commissioning evidence, dependencies, version, result and limitations are retained; records do not themselves enforce authority.
- Failure atomicity: interruption never produces a half-trusted state reported as fully commissioned.

## 3. Candidate mechanism families (comparison, not selection)

### C1 — Independent pre-existing device with a cryptographic authenticator
**Possible role:** A separately controlled phone/computer or dedicated device authenticates a fresh challenge and approves the exact commissioning bundle.
**Strengths:** Usable; can provide a trusted interaction path separate from the candidate device; supports challenge-response and transaction-bound approval if designed correctly.
**Risks/dependencies:** Same owner account, OS vendor, cloud sync, update channel, recovery email or network can create common-mode compromise. A signature alone does not show what the user saw or prove the credential was legitimately bound.
**Minimum conditions:** Existing credential enrolled before candidate activation; explicit dependency map; challenge-response; meaningful exact-transaction display; authenticated binding of approval to the constitutional bundle; loss/revocation/replacement plan.
**Disposition:** Strong candidate for evaluation, but independence is conditional and must be demonstrated.

### C2 — Dedicated physical cryptographic authenticator/token
**Possible role:** Holds a private key used to approve a one-time commissioning challenge, possibly unlocked by a PIN or local biometric.
**Strengths:** Can reduce reliance on the candidate device and avoid a cloud account for key use; portable across compatible implementations.
**Risks/dependencies:** Token possession does not establish human legitimacy by itself; provisioning/public-key recognition is still a bootstrap problem. Many tokens do not display meaningful transaction details. Loss, theft, firmware/supply chain, compatibility and recovery remain concerns.
**Minimum conditions:** Independently established public-key binding, clear exact-context approval through a trusted display/input path, revocation/replacement process, and no claim that token possession alone proves constitutional consent.
**Disposition:** Candidate for evaluation; not selected.

### C3 — External provisioning/governance authority
**Possible role:** A separately governed service or custodian provisions an initial constitutional reference and recognition credential.
**Strengths:** Can provide an independently pre-established reference and controlled credential lifecycle.
**Risks/dependencies:** Moves trust to the issuer; vendor capture, account recovery, jurisdiction, outage, policy changes and provider exit can become constitutional dependencies.
**Minimum conditions:** Explicit issuer legitimacy and scope; auditable provisioning; portability/export; independently governed revocation and migration; no unilateral provider power to amend Nexo's Constitution.
**Disposition:** Conditional candidate only; reject if it becomes an unbounded permanent governor or cannot be exited safely.

### C4 — Owner-held offline recovery/commissioning medium
**Possible role:** A previously prepared offline medium carries a public-key fingerprint or approval capability used during initial commissioning/recovery.
**Strengths:** Can reduce live-provider dependence and remain available offline.
**Risks/dependencies:** Theft, copying, degradation, loss, unsafe duplication and unclear provisioning provenance. A static code or printed secret can be copied and replayed; a static medium alone cannot prove current revocation or fresh consent.
**Minimum conditions:** Use as one bounded component of a governed process, not as self-authenticating authority; protect against replay and duplication; define loss and replacement; require currentness evidence or block where unavailable.
**Disposition:** Supporting/recovery candidate; not sufficient alone.

### C5 — Multi-custodian/threshold commissioning
**Possible role:** Multiple pre-established custodians jointly authorize commissioning or root replacement.
**Strengths:** May reduce single-custodian compromise for a specific governance model.
**Risks/dependencies:** Adds complexity, collusion and availability risks; custodians may share devices, provider, organization or coercion domain. Threshold count does not establish legitimacy.
**Minimum conditions:** Concrete reason for multiple custodians; legitimate membership rule; independence evidence; quorum and dispute semantics; loss/succession and common-mode analysis.
**Disposition:** DEFER. Existing threat model does not justify introducing a threshold as default.

### C6 — Hardware/platform root or measured boot
**Possible role:** Protects a key or provides evidence about platform state as one supporting signal.
**Strengths:** May constrain key extraction or provide bounded integrity/measurement evidence.
**Risks/dependencies:** Manufacturer, firmware, update, recovery, attestation verifier and device lifecycle; measured state is not owner legitimacy or constitutional authority.
**Minimum conditions:** Clearly bounded claim; independently governed verification; explicit update/recovery assumptions; never the sole legitimacy source.
**Disposition:** Supporting mechanism only.

### C7 — Hybrid: owner-authorized act + independent authenticator + governed continuity
**Possible role:** Semantic legitimacy comes from Kevin's explicit commissioning; a pre-existing independent channel authenticates and binds the exact act; hardware/cryptography protect bounded properties; separate governed transitions handle revocation, migration and succession.
**Strengths:** Separates normative authority from technical protection and continuity.
**Risks/dependencies:** Composition may hide common-mode dependencies or circular trust; more parts can create unclear ownership and failure semantics.
**Minimum conditions:** One authoritative semantic contract; each component has bounded claims; dependency closure and root legitimacy proven; no component self-certifies the others; failure paths attacked end-to-end.
**Disposition:** Best architectural shape to continue evaluating, not a selected deployment mechanism and not proof that a valid root exists.

## 4. Comparative conclusion
The evidence supports **C7 as a semantic composition pattern for further design**, because it keeps human legitimacy, independent recognition, technical protection and lifecycle governance distinct. It does not support selecting any particular device, token, vendor, hardware root or provider.

C1 and C2 are the leading concrete recognition candidates to compare against a deployment-specific failure-domain map. C3 is conditional due to provider-governance/exit risk; C4 and C6 are supporting components only; C5 is deferred unless a specific threat model requires multiple custodians.

This is not a ranking of absolute security and not a declaration that C7 solves genesis. The bootstrap still requires an independently established starting recognition basis.

## 5. Adversarial scenarios and expected outcomes
| Scenario | Required result |
|---|---|
| First device generates its own key and claims it is the root | UNKNOWN/BLOCKED |
| Independent device signs but cannot display the exact Constitution/context | Insufficient for protected commissioning; BLOCKED |
| Valid signature over a Constitution not reviewed/approved in its exact form | No positive legitimacy claim; BLOCKED |
| Replayed approval or changed challenge/context/version | INVALID or UNKNOWN; BLOCKED |
| Same cloud account/OS/update/recovery controls both devices | Independence claim downgraded; re-evaluate; block if required independence unmet |
| Owner unavailable, silent, asleep, coerced or ambiguous | No inferred approval; BLOCKED |
| Credential lost and recovery channel is also unavailable | Root authority remains unavailable; preserve state, no self-promotion |
| External issuer/provider changes policy or exits | No silent transfer of constitutional authority; governed migration or HOLD |
| Offline device cannot check revocation/currentness | BLOCKED for activation unless a separately authorized bounded rule explicitly covers it |
| Two successors conflict without an existing ordering rule | Preserve both claims; UNKNOWN; no automatic selection |
| Commissioning interrupted between approval and activation | Resume only by validating same unexpired one-time context; otherwise restart ceremony under the same governed rules |
| Hardware attestation passes but human/root binding is missing | Integrity evidence only; BLOCKED |
| A recovery token is treated as a normal root credential | Reject scope expansion; separate recovery/succession transition required |

## 6. Standards cross-check and limits
- NIST SP 800-63B-4 distinguishes authenticator binding, lifecycle, revocation and account recovery; it warns through its requirements that recovery is a separate process and new authenticators must be securely bound. This is useful lifecycle guidance, not a definition of Nexo's constitutional legitimacy: https://pages.nist.gov/800-63-4/sp800-63b.html
- NIST states that manual entry of authenticator outputs (e.g. codes) does not provide phishing resistance because it does not bind the output to a specific session; challenge/session binding matters. This supports rejecting a static spoken/printed keyword as sole genesis proof.
- FIDO/WebAuthn mechanisms may support verifier-bound challenge-response when correctly deployed, but their enrollment, device, synchronization and recovery assumptions remain relevant. A FIDO credential proves a bounded authentication claim, not the legitimate source of Nexo's Constitution.
- No standard can choose the user's governance rule, establish a specific issuer's legitimacy, prove freedom from coercion, or provide global revocation during arbitrary disconnection.

## 7. Unresolved blockers
- Exact independent recognition channel and threat model are still unselected.
- How the initial authenticator's legitimate enrollment/public-key binding is independently recognized without trusting the candidate Nexo device remains open.
- Exact human-readable constitutional summary, canonical content representation and approval UX remain unspecified.
- Lost-root recovery and contested succession remain governance blockers.
- Revocation/currentness while offline and provider exit/migration remain unresolved.
- Future-countereffects gate has not passed; no implementation is authorized.

## 8. Next exact action
Create a root-basis decision table that explicitly maps each candidate's *first trusted fact* and who independently validates it. Attack every apparent starting point for circularity. If no candidate can state a non-circular first trusted fact within the accepted governance rule, document the root basis as unresolved and stop technical selection; do not invent a trust anchor or add a layer.
