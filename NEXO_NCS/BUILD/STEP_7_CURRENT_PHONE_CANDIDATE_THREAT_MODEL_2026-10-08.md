# STEP 7 — Current Phone as Candidate Channel: Threat Model
Date: 2026-10-08
Status: P0 DESIGN / CANDIDATE ONLY — NO TRUST CLAIM ESTABLISHED; NO MECHANISM SELECTED; NO IMPLEMENTATION AUTHORIZED

## 1. Owner's choice
Kevin selected his currently used phone/channel as the candidate to examine. This is a candidate designation only. It is not a declaration that the phone, OS, account, ChatGPT session, Termux, any app, or any credential is legitimate or secure.

The bounded assumption accepted earlier remains claim-relative: a pre-existing channel recognized by Kevin and under his control may be considered as a candidate for conveying approval of the exact Constitution and commissioning context. The concrete trust mechanism and enrollment basis remain unselected.

## 2. Candidate claim
Candidate claim C0 remains unestablished:
“Within a specifically declared initial-commissioning context, an approval presented through a previously recognized channel was intentionally issued by Kevin for the exact immutable Constitution content and commissioning context identified in the approval.”

Naming the current phone does not prove the channel is independent of the software that requests, displays, interprets, records, or acts on the approval.

## 3. Assets and trust boundaries
Assets to protect:
- Kevin's constitutional authority and intent.
- Exact Constitution bytes and human-readable meaning.
- Initial commissioning purpose/scope and challenge freshness.
- Enrollment provenance and credential lifecycle state.
- Revocation/currentness and conflicting constitutional histories.
- Integrity of approval presentation and of the protected decision that consumes it.
- Privacy of approval data and any credentials.

Potentially distinct but not automatically independent components:
- physical phone;
- boot chain, firmware, OS and security updates;
- lock screen, user profile and device/account recovery;
- ChatGPT app/session or any future Nexo client;
- display/accessibility/keyboard/clipboard/notification paths;
- local storage, backups and sync;
- network and external services/providers;
- Termux and packages/scripts run within it;
- any authenticator or cryptographic key eventually chosen;
- the verifier and policy enforcement boundary.

The components above are a threat-model inventory, not assertions that every component is used or compromised.

## 4. Failure/attack cases specific to this candidate
| Case | What it defeats | Required design result |
|---|---|---|
| Phone is lost, borrowed, stolen or unlocked by another person | Possession-as-identity shortcut | Do not infer Kevin's approval from possession alone |
| Malware, accessibility service, overlay, keyboard, notification or screen capture alters/intercepts the approval flow | Trusted presentation and intent binding | C0 UNKNOWN unless presentation integrity is established for the claim |
| App/session/account takeover | Assumption that current session equals owner | Session identity alone is insufficient |
| OS/account recovery resets access or restores old credentials | Currentness and credential lifecycle | Hold until governed recovery/currentness is established |
| Cloud backup/sync or vendor administrator shares control with a second channel | Claimed channel independence | Count shared dependencies; do not call channels independent |
| Device clock, local revision, cache or stored snapshot claims state is current | Currentness/revocation | Local metadata is not authoritative currentness evidence |
| Network unavailable or revocation cannot be checked | Freshness/currentness | UNKNOWN/HOLD; no availability fallback |
| Malicious/compromised Nexo client displays one Constitution and submits another | Exact-content and intent binding | Reject mismatch; no protected activation |
| Termux generates a key or reports a successful check | Root legitimacy | No trust credit from tool presence or self-report |
| Approval is replayed after amendment, revocation or commissioning-context change | Scope/freshness | Reject replay; require governed fresh approval |
| A second channel is added later but shares phone account, cloud backup, recovery, provider or administrator | Independence | Independence UNKNOWN until dependency closure is evaluated |
| Device compromise occurs after an initially sound enrollment | Continued trust | Define compromise response, revocation and re-enrollment; past validity is not present validity |

## 5. What this candidate might help with
The current phone could potentially be used as:
- a human interaction/presentation surface;
- a source of a deliberate user approval gesture;
- a local research/prototyping environment;
- a carrier for evidence produced by a future separately justified mechanism.

None of these roles alone proves constitutional authority, secure presentation, trusted enrollment, independence, or final enforcement.

Termux may be evaluated later for reproducible local experiments, code inspection, hashing, test harnesses, or other bounded research tasks. Any result from Termux must have a defined claim and reproducible evidence. Termux running on the same phone is not an independent trust channel merely because it is a separate application or shell.

## 6. Minimum questions a concrete mechanism must answer
1. What pre-existing fact makes Kevin recognize this channel before Nexo relies on it?
2. How is the channel enrolled without the candidate channel or Nexo self-certifying its own authority?
3. How can Kevin see/understand what is being approved, and how is that presentation bound to the exact Constitution content actually submitted?
4. What prevents replay or substitution across Constitution revisions, commissioning purposes, credentials, or time?
5. How is compromise, revocation, account recovery, device replacement and credential replacement handled?
6. Which dependencies are shared with Nexo, verifier, provider, storage, recovery and update channels?
7. What trusted boundary establishes the evidence provenance and currentness that the policy resolver consumes?
8. What observable artifact demonstrates that the protected decision boundary actually enforced the result, rather than merely recording an approval?

No mechanism is chosen by listing these questions.

## 7. Stop conditions and invariant
- If enrollment legitimacy depends on a key or channel that only becomes legitimate by asserting its own legitimacy, STOP: circular bootstrap.
- If the verifier trusts caller-supplied “approved/verified/current” labels, STOP: provenance not established.
- If approval cannot be bound to exact content and commissioning scope, STOP: no activation.
- If revocation/currentness cannot be established, UNKNOWN/HOLD.
- If independence is claimed without dependency closure, UNKNOWN.
- If the design requires a generic layer that merely repeats the missing trust assertion, STOP and redesign the root contract.
- No implementation, protected activation, production effect, provider/key/algorithm selection, or Lúmina changes authorized.
- No reruns of frozen AB/TLC/Kafka probes.

## 8. Next step
Compare these phone-specific threats against the existing Genesis Trust Foundation, protected evidence-establishment capability, and Constitution Authority Context contracts. Identify which requirement can be established by a bounded phone-channel claim and which requires a separate root/protected-boundary mechanism. Do not infer that the current phone itself is a trust root.
