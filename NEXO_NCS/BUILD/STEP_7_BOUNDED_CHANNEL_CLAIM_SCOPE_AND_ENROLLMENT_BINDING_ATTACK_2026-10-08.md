# STEP 7 — Bounded Channel Claim Scope and Enrollment/Binding Attack
Date: 2026-10-08
Status: P0 DESIGN / ADVERSARIAL REVIEW — NO MECHANISM SELECTED; NO IMPLEMENTATION AUTHORIZED

## 1. Decision input and source of authority
Kevin explicitly accepted a bounded design assumption: a pre-existing channel independently recognized by him and already under his control may be considered as a candidate trust assumption for binding his approval to the exact Constitution and commissioning context.

This is acceptance of a *claim-relative assumption*, not proof that a channel is independent or secure. It does not nominate a device, Termux, key, authenticator, platform, provider, protocol, enrollment ceremony, UI, or implementation. It does not authorize genesis activation, credential lifecycle operations, recovery, succession, protected effects, or production deployment.

Constitutional governance decision: Kevin is the sole initial authority. A technical channel may carry evidence of a bounded approval; it does not become the authority, Constitution, verifier, or enforcement boundary.

## 2. Narrow claim the assumption may support
Candidate claim C0 (not yet established):
“Within a specifically declared initial-commissioning context, the approval presented through a previously recognized channel was intentionally issued by Kevin for the exact immutable Constitution content and commissioning context identified in the approval.”

This claim may be considered only if later evidence establishes the channel's enrollment provenance, trusted presentation/binding, scope, freshness, revocation/currentness, and relevant independence assumptions. At present those properties remain UNKNOWN. The assumption cannot be treated as proof that C0 is true.

## 3. Claims explicitly outside C0
C0 does NOT establish:
- that the device, OS, app, firmware, account, screen, keyboard, accessibility service, clipboard, backup, or update path is uncompromised;
- that a voice, face, fingerprint, password, possession check, signature, or successful cryptographic verification alone proves Kevin's authority;
- that Kevin understood or saw the exact bytes/semantic content approved;
- that the approved Constitution is wise, safe, internally consistent, or technically enforceable;
- that the verifier or policy evaluating the approval is legitimate merely because it accepts it;
- that the channel is independent from Nexo, its provider, shared accounts, update/recovery path, network, or control plane;
- that approval remains current after revocation, credential replacement, constitutional amendment, conflicting history, partition, or suspected compromise;
- that enrollment, key rotation, root replacement, recovery, migration, succession, or amendments are authorized by the initial approval;
- that a request was executed, an external effect occurred, STOP/revocation was enforced, or a protected transition committed;
- that the channel should be trusted for unrelated future claims.

## 4. Minimum semantic binding tuple (design only)
Any future concrete contract must bind one approval to all of the following without ambiguous substitution:
1. exact Constitution content identity (cryptographic digest plus governed canonicalization/encoding rules; digest alone is not authority);
2. explicit commissioning purpose and bounded scope;
3. verifier/challenge context and freshness rules sufficient for the named claim;
4. signer/channel credential identity and enrollment incarnation;
5. an explicit human-readable presentation of what is being approved, with a demonstrated relation between displayed semantics and the exact bound content;
6. approval action and unambiguous result (approve/reject/abort; no default approval);
7. relevant policy/version and trust-basis references used to appraise the approval;
8. revocation/currentness and conflict status at the protected decision boundary;
9. protected provenance of how evidence was established, not caller-supplied labels;
10. failure result that preserves UNKNOWN/HOLD if any required binding or dependency is missing.

This is a checklist of semantic obligations, not a proposed wire format, schema, identifier system, cryptographic algorithm, or implementation design.

## 5. Adversarial cases and required safe outcome

| Attack / failure | Why a naive check fails | Required outcome |
|---|---|---|
| Device is in Kevin's possession but is compromised | Possession proves neither integrity nor honest presentation | UNKNOWN/HOLD unless the named claim's accepted threat model can still be satisfied |
| Channel identity is self-enrolled by Nexo or its provider | Candidate being authorized manufactures its own authority evidence | INVALID or UNKNOWN; no self-bootstrap |
| First key is generated inside the candidate system and self-signed | Authenticity under that key does not independently bind it to Kevin | UNKNOWN; do not treat signature as enrollment legitimacy |
| Constitution changes after approval | Approval may be replayed against different content | Reject binding mismatch; require fresh approval for new content |
| UI displays a benign summary but submits different content | Human intent is not bound to the object actually approved | UNKNOWN/HOLD; no protected activation |
| Hash is shown but user cannot meaningfully identify what it represents | Byte integrity is not proof of informed approval | C0 not established; presentation semantics remain UNKNOWN |
| Challenge/approval is replayed in a new commissioning context | Old approval is detached from purpose or freshness | Reject replay; if freshness cannot be established, UNKNOWN |
| Credential is revoked or replaced but stale cache accepts it | Authentication can be valid for a no-longer-authorized credential | HOLD unless current revocation/authority is established |
| Shared account, cloud backup, OS update, vendor admin, or recovery path compromises both channels | Apparent channel diversity masks common-mode failure | INDEPENDENCE=UNKNOWN or DEPENDENT; never count as independent |
| Termux is treated as trusted because it is installed on the phone | Tool availability is not integrity, isolation, provenance, or independent authority | No trust credit without a separate claim and evidence |
| Approval arrives during partition with unavailable currentness/revocation | Stale authority may be mistaken for current authority | UNKNOWN/HOLD; no availability-based fallback |
| Two valid-looking but conflicting root/Constitution histories exist | Signature validity does not resolve governance precedence | Preserve conflict; STOP protected transition |
| Recovery path declares itself the new root | Recovery becomes a hidden second Constitution | Reject self-appointment; only pre-governed bounded recovery can apply |
| Model/provider labels evidence “verified” or “trusted” | Self-reported labels do not establish protected provenance | Ignore labels as authority; evidence must be established at protected boundary |
| Approval is accepted but external action fails or result is unknown | Approval is not execution/effect evidence | Keep authorization, execution, effect and verification distinct |
| User cancels, rejects, or presentation fails halfway | Partial interaction can be misread as approval | Explicit abort/reject; no implicit success |
| Credential or app is restored from backup after compromise/revocation | Authentic backup history does not prove current authority | Re-establish currentness under governed recovery rules; otherwise UNKNOWN |

## 6. Required invariants
- TRUST ≠ IDENTITY ≠ AUTHORITY ≠ CAPABILITY ≠ POLICY ≠ EXECUTION ≠ EFFECT ≠ VERIFICATION.
- A channel is a carrier of claim-specific evidence, never the constitutional authority merely by being selected.
- Cryptographic validity establishes only the property defined by the governing key relationship; it does not alone prove legitimacy, intent, currentness, independence, or enforcement.
- The protected boundary must establish evidence provenance. Caller-supplied status, source, revision, or “verified” fields cannot self-authenticate.
- Approval is bound to exact content, purpose, context, credential incarnation, and freshness; any material mismatch fails closed.
- Missing currentness, revocation, dependency closure, trusted presentation, or independence remains UNKNOWN, not false assurance.
- Revocation issued ≠ revocation enforced; STOP requested ≠ STOP enforced.
- Recovery cannot invent a new authority, amend the Constitution, or appoint succession unless a pre-governed constitutional rule explicitly permits the bounded transition.
- Termux may later be evaluated as a research/prototyping environment. Its presence on the phone gives it no authority or independence credit.
- No extra generic layer is added to make a missing root assumption appear solved.

## 7. Minimum acceptance gate before any implementation
All items are currently OPEN/UNKNOWN:
1. Concrete channel and threat model named by Kevin — not selected.
2. Enrollment origin independently justified — not established.
3. Integrity of approval presentation and exact-content binding — not established.
4. Credential custody, replacement, revocation and compromise handling — not established.
5. Claim-relative dependency/failure-domain closure — not established.
6. Verifier/policy legitimacy and protected evidence-establishment boundary — not established.
7. Currentness/conflict behavior under partition and recovery — not established.
8. Observable evidence for the last protected enforcement boundary — not established.
9. Independent adversarial tests and raw artifacts for the chosen implementation — not run.

A future implementation proposal must specify which gate item it proves and how. A passing unit test or self-report cannot prove properties outside its scope. If the intended claim requires a property that the candidate environment cannot establish, narrow the claim or choose a different trust basis; do not add a wrapper that merely repeats the unsupported assertion.

## 8. Verdict
The bounded assumption is accepted as a governance input for further design, but no concrete channel is yet established as trustworthy. The binding contract's semantic obligations and major counterexamples are now explicit. The design does not yet survive as an implementable trust root: enrollment legitimacy, trusted presentation, independence, currentness/revocation and final enforcement remain unresolved.

Next action: compare the acceptance gate against the existing protected evidence-establishment boundary and identify the *single earliest missing prerequisite* that blocks a meaningful implementation decision. Do not build yet; do not select a platform/provider/key/algorithm; do not rerun closed AB/TLC/Kafka probes; do not touch Lúmina. Keep genesis activation and protected effects BLOCKED.
