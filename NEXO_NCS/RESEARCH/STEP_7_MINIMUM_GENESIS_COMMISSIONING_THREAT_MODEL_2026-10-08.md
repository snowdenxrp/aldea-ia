# STEP 7 — Minimum Genesis Commissioning Threat Model
Date: 2026-10-08
Status: THREAT MODEL DRAFT — CANDIDATE MECHANISMS NOT SELECTED — NO IMPLEMENTATION AUTHORIZED

## 1. Protected claim and security objective
Protected claim: the exact initial Nexo Constitution and commissioning context were explicitly approved by the legitimate owner, and the recognition mechanism used to accept that act was not created or controlled solely by the uncommissioned candidate state.

Security objective: prevent a candidate device, its model/provider, local state, or a recovery routine from fabricating or silently substituting constitutional legitimacy. If required evidence cannot be independently recognized, initial protected activation remains blocked. This does not require shutting down unrelated safe functions whose authority is independently established.

## 2. Adversary capabilities in scope
Assume an attacker may have one or more of:
- Full control of the candidate device's ordinary software before commissioning, including its local files and UI.
- Ability to influence or compromise a model/provider and fabricate statements, logs, approval screens, timestamps, or provenance fields.
- Physical access to the candidate device and ability to replay old commissioning material.
- Network control, including denial, delay, replay, substitution, and disconnection.
- Theft or loss of one recognition object/device, but not automatically all independent channels.
- Ability to exploit shared vendor, update, account, network, storage, or recovery dependencies if the design relies on them.

Do not assume resistance to coercion, simultaneous compromise of all channels, supply-chain compromise, or invasive hardware attacks unless a chosen mechanism and deployment evidence justify it. These are explicit risk decisions, not implicit guarantees.

## 3. Protected objects and required bindings
The recognition act must be bound to:
- A canonical Constitution identifier and exact content digest/version.
- A unique commissioning transaction/context and intended Nexo incarnation/deployment.
- The explicit owner-authorized commissioning action, not generic login or vague consent.
- The recognition mechanism's identity/scope, provenance, dependencies, and currentness/revocation assumptions.
- A one-time/replay-resistant activation transition with recoverable audit evidence.

A valid signature, hash, attestation, successful user login, or secure boot measurement alone does not establish the governance legitimacy claim. Integrity evidence may support only the property it actually measures.

## 4. Attack cases and required outcome

| Case | Attacker action | Required result |
|---|---|---|
| Compromised first device | Fabricates approval or changes displayed Constitution | No activation unless independent channel verifies exact digest/context |
| Malicious model/provider | Claims user consent or supplies authoritative-looking fields | Treat as untrusted proposal; no authority |
| Replay/substitution | Reuses approval for another Constitution, deployment, or prior incarnation | Reject or UNKNOWN; exact binding required |
| Recognition channel unavailable | Owner or channel is offline/unavailable | No implied consent; protected activation blocked |
| Channel stolen/lost | Attacker uses or owner cannot access recognition object | Revoke/contain where supported; otherwise UNKNOWN; recovery needs pre-authorized independent path |
| Network/provider unavailable | Online service cannot be reached | Do not silently fall back to provider; only proceed if local proof and currentness are independently sufficient under pre-authorized rules |
| Revocation during offline interval | Old credential or basis may have been revoked | Currentness UNKNOWN unless a governed freshness/expiry model explicitly permits bounded offline operation |
| Coercion | Owner is forced to approve | Residual risk remains unless a chosen ceremony provides a meaningful duress policy; never claim generic coercion resistance |
| Shared dependency | Both channels depend on same compromised account/vendor/update path | Do not count them as independent for that threat |
| Migration | New device imports old files/snapshot and claims authority | Migration requires a separately authorized transition; copied state alone cannot promote authority |
| Conflicting successors | Two candidate constitutional successors exist | Preserve both evidence branches; no wall-clock, epoch, chain-length or availability winner absent governed precedence |
| Interrupted commissioning | Power/process fails between preparation and activation | Deterministic resumable/abort semantics; never infer activation from partial writes |

## 5. Candidate mechanism families (not yet a selection)

### A. Separate user-held authenticator / security key
Potential benefit: the first device need not be the sole holder of the authorization capability; a challenge can bind approval to the exact commissioning context.
Open dependencies: authenticator enrollment/provenance, PIN/user-verification semantics, theft/loss, replacement, device compatibility, offline verifier trust, and whether the candidate device can still lie about what the user sees.
Important limitation: standards such as FIDO/WebAuthn are commonly scoped to relying-party identities/domains. Their use here would require a precise local protocol and verifier contract; do not assume a web login is equivalent to commissioning Nexo.

### B. Separate previously commissioned device
Potential benefit: an already protected incarnation may authorize a bounded new-device commissioning/migration.
Open dependencies: proving the old device is legitimately commissioned and current, compromise independence, device-loss recovery, and preventing copied snapshots from claiming the old device's authority.
Limitation: this cannot bootstrap the very first Nexo instance unless a prior independent legitimacy basis already exists.

### C. External provisioning/ceremony
Potential benefit: a pre-established reference may be delivered through a channel separate from the candidate.
Open dependencies: who governs the provisioning source, supply-chain/custodian capture, audit, portability, exit, revocation, and avoiding permanent vendor authority.
Limitation: external provisioning relocates the trust question; it does not eliminate it.

### D. Hardware-backed key/attestation
Potential benefit: bounded key protection and evidence about platform integrity.
Open dependencies: manufacturer/firmware/update chain, reference values, verifier policy, recovery, and measurement coverage.
Limitation: attestation supports integrity claims; it cannot alone establish the owner's constitutional intent. NIST SP 800-193 addresses platform firmware protection, detection, and recovery, not owner-governance legitimacy.

### E. Physical recovery/approval medium
Potential benefit: can provide a channel not dependent on the candidate's current software or network.
Open dependencies: entropy/uniqueness, duplication, theft, secure issuance, secure storage, replacement, revocation, and binding approval to the exact Constitution/context.
Limitation: a static bearer secret can be copied or stolen and does not by itself solve currentness, revocation, or successor ordering.

No family is accepted as the default yet. A hybrid is permitted only if each role is explicit and common-mode dependencies are analyzed; do not add components merely to appear more secure.

## 6. Evidence and decision semantics
For each proposed mechanism, specify:
- Claim established and claim expressly not established.
- Evidence format, issuer, verifier, trust anchors, and dependency closure.
- Exact digest/context challenge and replay protection.
- Currentness, revocation, offline expiry, and recovery behavior.
- What remains safe and what is blocked for INVALID/UNKNOWN.
- How activation is made atomic or safely resumable and how its outcome is verified.
- Portability and authorized migration without provider lock-in.
- Concrete failure injection/adversarial tests; distinguish design reasoning from runtime/formal evidence.

Use ESTABLISHED / INVALID / UNKNOWN for the commissioning binding. ESTABLISHED means only that the narrowly defined binding was established within scope; it is not general authority to execute future operations.

## 7. Standards relevance and limits
- IETF RFC 9334 (RATS) provides useful role separation among Attester, Verifier, and Relying Party, and emphasizes that evidence appraisal depends on trust anchors/policies. It is a vocabulary/architecture reference, not a source of Nexo's governance legitimacy.
- NIST SP 800-193 supports evaluating platform firmware protection, detection, and recovery. It does not decide who legitimately owns or commissions Nexo.
- FIDO/WebAuthn can inform phishing-resistant authentication and challenge-response, but its relying-party/domain assumptions, authenticator lifecycle, and online/offline requirements must be checked before adapting it to a local constitutional commissioning protocol.

## 8. Next action / gate
Compare A, C, and E first as potentially independent commissioning channels, while retaining B only for post-genesis migration and D only as a supporting integrity/key-protection role. This ordering is a research priority, not a selection. Compare them against portability, offline use, provider independence, loss/revocation, theft/coercion, and candidate-device compromise. Then select only a concrete candidate whose dependencies can be appraised and attack its semantic contract. No Trust Foundation or Constitution Authority Context implementation until the independent recognition basis is real, protected, and independently recognizable.
