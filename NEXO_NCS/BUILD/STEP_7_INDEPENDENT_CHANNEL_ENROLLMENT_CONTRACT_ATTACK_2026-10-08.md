# STEP 7 — Independent Channel Enrollment Contract Attack
Date: 2026-10-08
Status: ATTACK COMPLETE; CONTRACT NOT ACCEPTED; ROOT / VERIFIER GATE REMAINS CLOSED

## Reviewed artifact
NEXO_NCS/BUILD/STEP_7_INDEPENDENT_CHANNEL_ENROLLMENT_AND_BINDING_CONTRACT_CANDIDATE_2026-10-08.md

## Executive result
The candidate correctly separates owner legitimacy, channel credential control, verifier integrity, exact-object approval and currentness. Its strongest finding is also its blocker: a cryptographic enrollment result cannot cause an untrusted candidate verifier to enforce anything. The contract is not implementation-ready because the verifier trust boundary and initial credential/public-key binding are not established.

## Attacks

### E1 — Candidate-key substitution at first enrollment
**Attack:** A compromised candidate shows the expected channel name but registers an attacker public key, or silently substitutes the key after the human ceremony.
**Coverage:** Explicitly included in acceptance tests.
**Gap:** No independent mechanism yet establishes that the key presented to the candidate is the key actually controlled by the intended channel.
**Result:** BLOCKED until the initial key-binding method and trusted verifier are established. A key fingerprint copied through the same untrusted UI is not independent evidence.

### E2 — Verifier ignores the result
**Attack:** The verifier accepts the independent signature, records success, then bypasses the Constitution/policy gate or reports activation without enforcing it.
**Coverage:** Known impossibility boundary acknowledges it.
**Gap:** No protected verifier/effect boundary or independently checkable enforcement path is selected.
**Result:** ROOT/VERIFIER BLOCKER. The independent channel proves at most that an approval response was generated under stated assumptions; it cannot make malicious software enforce a policy.

### E3 — Same-device or shared-account compromise
**Attack:** Candidate and independent channel share a cloud identity, OS update path, recovery email, administrative account or provider.
**Coverage:** Dependency analysis required.
**Gap:** No deployment-specific map exists; “independent” is still a requirement, not demonstrated fact.
**Result:** Independence UNKNOWN until the actual devices/accounts/providers and common-mode assumptions are mapped.

### E4 — Digest substitution with faithful signature
**Attack:** User approves a valid digest but cannot understand or inspect the exact Constitution, or the UI displays a misleading summary.
**Coverage:** Exact object and presentation binding required.
**Gap:** No canonical constitutional representation, content-review method, or assurance claim for the display is defined.
**Result:** No positive claim that the human knowingly approved the intended constitutional content until presentation semantics are defined. Digest integrity alone is insufficient.

### E5 — Replay/duplicate/interrupted enrollment
**Attack:** A valid response is replayed, two replicas consume the same challenge, or a crash occurs between credential proof and durable enrollment.
**Coverage:** Challenge uniqueness, single-use and interruption tests included.
**Gap:** No authoritative atomic consumption/currentness boundary or durable state-transition contract is selected.
**Result:** UNKNOWN/HOLD; implementation blocked pending a specified enforcement boundary and crash/concurrency semantics.

### E6 — Recovery creates a new root
**Attack:** Recovery provider or email account enrolls a replacement channel after the original is lost, then claims the same constitutional authority.
**Coverage:** Explicitly rejected absent governed transition.
**Gap:** The legitimate authority to authorize replacement after loss of the only root remains unresolved.
**Result:** ROOT_AUTHORITY_UNAVAILABLE/HOLD if no independently legitimate succession rule exists; no recovery self-promotion.

### E7 — Offline revocation
**Attack:** Channel is revoked but candidate is offline and accepts stale enrollment state.
**Coverage:** Unknown currentness blocks positive enrollment.
**Gap:** No authoritative revocation source or offline freshness bound exists.
**Result:** Protected commissioning blocked when required currentness cannot be established; no implicit grace period.

### E8 — Attestation or hardware is promoted to legitimacy
**Attack:** Platform attestation passes and is used to assert Kevin approved the Constitution.
**Coverage:** Separation of claims prevents this inference.
**Result:** REJECT. Attestation may support bounded integrity claims only.

### E9 — Human approval is coerced or uninformed
**Attack:** The credential signs while the user is coerced, confused, or sees an incomplete summary.
**Coverage:** Contract limits claims and does not promise coercion-proof consent.
**Gap:** No UI/ceremony content review has been defined.
**Result:** Residual risk must be stated; do not claim free/informed consent solely from cryptographic success.

### E10 — Cross-scope privilege expansion
**Attack:** Enrollment of the channel is treated as permission to amend Constitution, replace root, delegate authority or execute arbitrary actions.
**Coverage:** Narrow scope and explicit separation are specified.
**Result:** BLOCKED semantically; future implementation must preserve the typed scope and separate transitions.

## Root-level findings
1. The first public-key binding cannot be authenticated by the candidate verifier if the verifier is precisely the component whose trust is unestablished.
2. A separate authenticator can sign the right challenge and still fail to protect Nexo if the verifier or effect boundary is malicious.
3. A trusted UI is not merely a screen requirement: it includes the integrity of the transaction representation, the user's view/input path and the connection between approved and enforced meaning.
4. Device separation is not independence without a common-mode dependency map.
5. There is no justified “emergency root” in current decisions; creating one would be a governance change, not a technical fallback.
6. Nexo cannot prove the legitimacy of its own governance assumptions. Those must be explicitly accepted by the owner/deployment governance and then protected technically within bounded claims.

## Decision
Do not accept this enrollment contract as final. No implementation, channel selection or activation is authorized. This is a root-level blocker, not a request for more fields.

## Next exact action
Revisit the Master architecture's boundary between Core software trust and commissioning. Determine what minimum initial execution/verifier trust assumption is actually accepted for a first deployment: e.g., an independently verified build/package and update path, a separately trusted execution environment, or an explicitly limited owner-verified prototype assumption. Compare only options supported by the existing architecture and threat model. If no acceptable initial verifier trust basis exists, document the unresolved premise and stop rather than implying that the independent authenticator solves it.
