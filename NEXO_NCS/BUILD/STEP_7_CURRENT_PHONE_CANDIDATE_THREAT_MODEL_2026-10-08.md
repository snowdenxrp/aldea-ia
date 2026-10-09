# STEP 7 — Current Phone as Candidate Channel: Threat Model
Date: 2026-10-08
Status: P0 DESIGN / CANDIDATE ONLY — NO TRUST CLAIM ESTABLISHED; NO MECHANISM SELECTED; NO IMPLEMENTATION AUTHORIZED

## 1. Owner's choice
Kevin selected his currently used phone/channel as the candidate to examine. This is a candidate designation only, not a declaration that the phone, OS, account, ChatGPT session, Termux, any app, or any credential is legitimate or secure.

The bounded assumption accepted earlier remains claim-relative: a pre-existing channel recognized by Kevin and under his control may be considered as a candidate for conveying approval of the exact Constitution and commissioning context. The concrete trust mechanism and enrollment basis remain unselected.

## 2. Candidate claim
C0 remains UNESTABLISHED: “Within a specifically declared initial-commissioning context, an approval presented through a previously recognized channel was intentionally issued by Kevin for the exact immutable Constitution content and commissioning context identified in the approval.”

Naming the current phone does not prove the channel is independent of software that requests, displays, interprets, records, or acts on approval.

## 3. Assets and trust boundaries
Protect: Kevin's constitutional authority and intent; exact Constitution bytes and human-readable meaning; commissioning purpose/scope and challenge freshness; enrollment provenance and credential lifecycle; revocation/currentness and conflicting histories; approval presentation and protected decision integrity; privacy of approval data and credentials.

Potentially distinct but not automatically independent components: physical phone; boot chain/firmware/OS/updates; lock screen/profile/account recovery; ChatGPT app/session or future Nexo client; display/accessibility/keyboard/clipboard/notifications; local storage/backups/sync; network/external providers; Termux and its packages/scripts; any future authenticator/key; verifier and policy enforcement boundary. This is an inventory, not a claim that every component is used or compromised.

## 4. Phone-specific attacks
| Case | What it defeats | Required result |
|---|---|---|
| Phone lost, borrowed, stolen or unlocked by another person | Possession-as-identity | Do not infer Kevin's approval from possession alone |
| Malware, accessibility service, overlay, keyboard, notification or screen capture alters/intercepts approval | Trusted presentation and intent binding | C0 UNKNOWN unless presentation integrity is established |
| App/session/account takeover | Session equals owner | Session identity alone is insufficient |
| OS/account recovery resets access or restores old credentials | Currentness and credential lifecycle | HOLD until governed recovery/currentness is established |
| Cloud backup/sync/vendor administrator controls both channels | Claimed independence | Count shared dependencies; do not call channels independent |
| Device clock, revision, cache or snapshot claims currentness | Revocation/currentness | Local metadata is not authoritative currentness evidence |
| Network unavailable or revocation cannot be checked | Freshness/currentness | UNKNOWN/HOLD; no availability fallback |
| Client displays one Constitution but submits another | Exact-content and intent binding | Reject mismatch; no protected activation |
| Termux generates a key or reports a successful check | Root legitimacy | No trust credit from presence or self-report |
| Approval replayed after amendment, revocation or context change | Scope/freshness | Reject replay; require governed fresh approval |
| New channel shares account, backup, recovery, provider or administrator | Independence | UNKNOWN until dependency closure is evaluated |
| Device compromised after enrollment | Continued trust | Governed compromise response, revocation and re-enrollment required |

## 5. Possible bounded roles
The phone could potentially be a human interaction/presentation surface, source of a deliberate approval gesture, local research/prototyping environment, or carrier for evidence from a separately justified mechanism. None proves constitutional authority, secure presentation, enrollment legitimacy, independence or final enforcement.

Termux may later be evaluated for reproducible local experiments, code inspection, hashing or test harnesses. Each result needs a defined claim and reproducible evidence. Termux on the same phone is not an independent trust channel merely because it is a separate application or shell.

## 6. Questions a concrete mechanism must answer
1. What pre-existing fact makes Kevin recognize this channel before Nexo relies on it?
2. How is it enrolled without the candidate channel or Nexo self-certifying authority?
3. How does Kevin understand the approval, and how is that presentation bound to the exact Constitution content submitted?
4. What prevents replay/substitution across revisions, purposes, credentials or time?
5. How are compromise, revocation, account recovery, device replacement and credential replacement handled?
6. Which dependencies are shared with Nexo, verifier, provider, storage, recovery and updates?
7. What trusted boundary establishes evidence provenance/currentness consumed by policy?
8. What observable artifact demonstrates enforcement at the protected decision boundary, rather than merely recording approval?

Listing these questions does not select a mechanism.

## 7. Stop conditions
- Self-legitimating key/channel or circular bootstrap: STOP.
- Caller-supplied “approved/verified/current” labels: provenance not established; STOP.
- Approval not bound to exact content and commissioning scope: no activation.
- Currentness/revocation unavailable: UNKNOWN/HOLD.
- Independence asserted without dependency closure: UNKNOWN.
- A generic layer merely repeats the missing trust assertion: STOP and redesign root contract.
- No implementation, protected activation, production effect, provider/key/algorithm selection, or Lúmina changes authorized.
- No frozen AB/TLC/Kafka reruns.

## 8. Next step
Cross-check these phone-specific threats against the existing Genesis Trust Foundation, protected evidence-establishment capability, and Constitution Authority Context contracts. Identify which requirement the phone channel can support and which requires a separate root/protected-boundary mechanism. Do not infer that the phone itself is a trust root.
