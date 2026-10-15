# STEP 7 — Scope A review-evidence minimum acceptance contract

Date: 2026-10-15  
Branch: `ncs-clean-architecture`  
Status: DESIGN CONTRACT / ATTACK REQUIRED / NO IMPLEMENTATION

## 1. Purpose and boundary

Define what would have to be true before Nexo can honestly claim the accepted Scope A behavior:

> Nexo can record and later report the identity/reference of a specifically reviewed constitutional candidate, while continuing to treat its legitimacy and currentness as unestablished.

This contract does not ratify or freeze the Constitution, establish Genesis Trust Foundation, recognize current owner authority, authorize missions, or permit protected effects. It does not select a device, signer, Android host, verifier, storage owner, service or trust anchor.

The current constitutional candidate remains a mutable draft. No owner-review event has been recorded. A repository path/commit/blob is a locator only, not canonical constitutional identity or authority.

## 2. Claim vocabulary — no collapsing properties

The implementation and its evidence must keep these separate:

- **Candidate located:** a repository revision/path identifies the artifact proposed for review.
- **Candidate content bound:** the exact complete content and review scope presented to the owner are unambiguously associated with the event.
- **Owner decision evidenced:** there is evidence of the specific decision actually made, with no inference from display, silence, login, biometric success, or an app callback alone.
- **Record persisted:** the record was durably written under a specified host contract and read-back semantics.
- **Record verified:** a verifier checks the evidence against an explicit policy and provenance basis.
- **Constitutional legitimacy/currentness:** remains UNKNOWN under Scope A regardless of the above.
- **Protected effect admitted:** outside Scope A and still blocked by the separate STEP 7 authority/final-sink gate.

No one claim implies another. In particular, content hash, signature, hardware key, device authentication, successful write, Git metadata, or valid test can support a limited subclaim but cannot establish the whole chain.

## 3. Minimum event semantics

Any future record must preserve the following distinctions without treating failures as success:

1. **Decision meaning:** distinguish an acknowledgement that a draft was reviewed from constitutional ratification. Scope A permits only the former, and only after an actual owner decision. It must explicitly state that no authority, canonical status, currentness, or mission/effect permission is created.
2. **Candidate binding:** record enough immutable locator/content evidence to detect candidate substitution or movement. The exact bytes/content presented and the scope statement must be recoverable for independent comparison. A locator or digest alone does not prove that the owner saw the matching content.
3. **Presentation binding:** if the claimed assurance includes what the owner saw, the presentation path must support that claim under its explicit threat model. Ordinary app UI plus biometric authentication does not establish trusted display of the signed content.
4. **Decision evidence:** evidence must distinguish confirmed, declined, canceled/interrupted, unsupported, malformed, and unknown outcomes. Do not record a completed review when no trustworthy decision evidence exists.
5. **Freshness and replay:** where a cryptographic confirmation is used, a verifier-controlled fresh challenge and single-use/replay policy must be specified. A locally generated nonce is not independent freshness if the same untrusted producer controls both issuance and acceptance.
6. **Verifier provenance:** define what the verifier trusts, how its code/policy and trust anchors are established, and why it is independent of the record producer for the threat in scope. A component must not validate its own untrusted claims merely by returning PASS.
7. **Persistence semantics:** identify one real host/write owner and define absent, corrupt, malformed, stale, conflict, failed write and uncertain commit behavior. Unknown outcomes remain UNKNOWN. Do not reuse simulation state, mission memory or effect journals as the constitutional-reference owner.
8. **No-effect property:** prove that producing, storing, reading or reporting the Scope A record cannot authorize or trigger mission execution, `executeAction()`, protected mutation, or external effects.
9. **Currentness boundary:** Scope A never declares the candidate canonical/current. Any later Scope B authority context requires a separate governed basis for canonical version, validity, revocation, recovery and succession.
10. **Audit evidence:** report exact source/build/runtime/test inputs and raw results. Design documents and passing tests alone do not prove a deployed path.

## 4. Fail-closed result semantics

The only truthful high-level outcomes are:

- **RECORDED_NON_AUTHORITATIVE:** a review acknowledgement is supported by the selected evidence and persistence contract; it conveys no constitutional authority.
- **NOT_RECORDED:** a confirmed failure means no record was committed.
- **UNKNOWN:** the result is ambiguous, the evidence or persistence result is incomplete, verifier/provenance is unavailable, or any required binding cannot be established.
- **INVALID:** evidence contradicts the required policy (e.g. mismatched content/scope, invalid signature/attestation, replay, or a disallowed event type).

These are conceptual outcomes, not an instruction to create a new generic status framework or add enums to the current code. The exact API/result representation must reuse existing contracts if appropriate and be decided only after a real host and write boundary are identified.

Never transform UNKNOWN into NOT_RECORDED, an empty canonical state, or RECORDED_NON_AUTHORITATIVE by fallback. Never transform RECORDED_NON_AUTHORITATIVE into authority.

## 5. Threat-relative verifier requirement

For a threat model that includes a malicious/substituted app/Core or compromised Android framework/kernel, a self-reported record from that same component is not independent proof. A viable design must identify which boundary can independently verify:
- the exact candidate/scope binding;
- the signer key and relevant attestation properties;
- the signed decision and prompt/presentation semantics;
- freshness and replay status;
- the verifier policy/trust-anchor provenance;
- the result's non-authoritative Scope A meaning.

Android Protected Confirmation was designed for a trusted prompt on supported devices, but current AOSP marks the interface deprecated for low adoption/few supported devices. Ordinary BiometricPrompt + an authentication-bound Keystore key is not an equivalent content-confirmation mechanism. Neither option is selected. A separate signer/display may be considered only after a concrete candidate and trust chain are researched; do not assume one exists.

## 6. Gate assessment against current evidence

| Contract requirement | Current evidence | Disposition |
|---|---|---|
| Candidate locator for preparation | Repository draft exists and is explicitly not frozen | PARTIAL / LOCATOR ONLY |
| Complete owner review and narrow decision | No owner confirmation that the draft was reviewed; no review event | NOT ESTABLISHED |
| Exact content-to-decision binding | No canonical bytes/presentation protocol or ceremony | NOT ESTABLISHED |
| Signer/provenance basis | No signer selected/enrolled; no trust anchor | NOT ESTABLISHED |
| Independent verifier | No verifier selected or independently governed | NOT ESTABLISHED |
| Freshness/replay/revocation policy | Not instantiated for a selected protocol | NOT ESTABLISHED |
| Local persistent reference owner | Source audit found no suitable existing owner | NOT ESTABLISHED |
| Scope A no-effect boundary | No production local path or sink proof | NOT ESTABLISHED |
| Scope B/C authority and final sink | Existing gaps documented separately | OPEN / BLOCKING |

The result is not “choose a biometric and implement.” It is that no complete path is currently evidenced.

## 7. Next bounded investigation

Before selecting technology or implementing a host, evaluate the independence requirement itself:

1. List candidate verifier/trust domains already available in this project and their failure dependencies. Do not count a domain as independent merely because it is another process, app, device, or GitHub workflow.
2. For each candidate, ask what exact assertion it can verify and which adversary can control both the assertion producer and verifier.
3. Reject any option that requires a new authority above the owner, a self-authenticating recovery path, or a trust anchor whose only proof is produced by the same system it authorizes.
4. If no existing domain can verify the needed claim, state the minimum missing external/hardware capability and keep implementation STOP. Do not invent a service, server, signer, generic store or root object to make the matrix appear complete.
5. Only after a defensible trust path exists should the team return to one targeted host/write-boundary design and the existing SA-N01–N15 negative acceptance suite.

## 8. Non-actions and status

No owner review or ratification was inferred. No candidate was frozen/canonicalized; no key, signature, digest, nonce, verifier, storage owner, host, code, test, dependency, APK, device modification or deployment was created or changed.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
