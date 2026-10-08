# STEP 7 — Action-Bound Confirmation Contract Adversarial Review
Date: 2026-10-08
Status: REVIEW COMPLETE FOR THIS PASS; CONTRACT NOT ACCEPTED; IMPLEMENTATION BLOCKED

## Reviewed artifact
`NEXO_NCS/BUILD/STEP_7_MINIMUM_ACTION_BOUND_CONFIRMATION_CONTRACT_CANDIDATE_2026-10-08.md`

## Executive result
The candidate captures important boundaries but is not implementation-ready. No single “confirmation token” can safely collapse human intent, authentication, current authority, policy eligibility, enforcement and external effect into one artifact. The current candidate states many requirements but leaves the authority topology, transaction canonicalization, effect-boundary enforcement, recovery legitimacy and independent presentation trust unresolved. These are root contract gaps, not invitations to bolt on more fields.

## Attack findings

### A1 — Display/execute substitution
**Attack:** Show a canonical transaction, then execute a different target or parameter due to alias resolution, mutable object, serialization difference, TOCTOU, provider-side rewriting, or alternate endpoint.
**Candidate coverage:** Partial. It requires binding displayed and executed transaction.
**Gap:** No canonicalization semantics, immutable snapshot, resolver authority, or rule for which layer owns the final semantic transaction. Hashing a malformed/ambiguous representation only faithfully binds ambiguity.
**Required root correction:** Define one canonical semantic transaction after authoritative target resolution; bind the human-readable rendering and executable representation to it; revalidate at the effect boundary; any material mutation creates a new operation and requires fresh confirmation. Unknown/ambiguous normalization => HOLD.

### A2 — UI/verifier common-mode compromise
**Attack:** Compromised UI displays benign content but signs or submits a dangerous transaction; verifier and UI share the same device/OS/provider.
**Candidate coverage:** Partial; says trust boundary/failure domains must be assessed.
**Gap:** “Trusted presentation path” is an aspiration, not a proof contract. No minimum independent view or accepted threat model is defined.
**Required root correction:** Do not claim independent confirmation unless the relevant display, approval input, credential operation and effect submission have analyzed dependencies and common-mode risks. If no independent path is available, cap allowed action classes rather than pretending a signature proves what the human saw.

### A3 — Replay, duplicates and ambiguous retry
**Attack:** Reuse confirmation in a different namespace/device, race duplicate requests, or retry after a timeout when the provider may have executed.
**Candidate coverage:** Partial; operation IDs, anti-replay and reconciliation are mentioned.
**Gap:** No atomic consume/claim semantics, scope of uniqueness, durable idempotency boundary, or provider idempotency contract. Operation ID alone is not authority and cannot prove one effect.
**Required root correction:** Define operation identity and transaction digest scope, one-time authorization consumption semantics, effect-key/idempotency domain, concurrency behavior and UNKNOWN reconciliation. Never create a new operation blindly when the prior external effect is unresolved.

### A4 — Stale authority and revocation race
**Attack:** Approval is valid under epoch E7, authority changes/revokes to E8 while an operation is queued or in flight; offline incarnation uses cached E7.
**Candidate coverage:** Good conceptual distinction, incomplete enforcement.
**Gap:** “Recheck at effect boundary” is insufficient unless the boundary is identified, the authority source is current/linearizable enough for the claimed guarantee, and the provider rejects stale fences. Offline behavior is undefined.
**Required root correction:** Specify which enforcement point controls each effect and what consistency guarantee it provides. If current authority/revocation cannot be established at the effect boundary, protected external execution must be held or restricted to an explicitly bounded offline capability. Local STOP is not global STOP.

### A5 — Genesis/root circularity
**Attack:** A credential is accepted because the Core says it is trusted, while Core trust is itself established using that credential or an unsigned config.
**Candidate coverage:** Open blocker acknowledged.
**Gap:** This is the foundational blocker; confirmation design cannot solve its own legitimacy.
**Required action:** Keep commissioning and Constitution Authority Context blocked until an independently recognized genesis basis and succession semantics are defined and attacked.

### A6 — Recovery becomes privilege escalation
**Attack:** Recovery account, email, backup phrase, cloud sync, support operator or newly enrolled device silently replaces the root or gains wider authority than the lost credential.
**Candidate coverage:** Partial.
**Gap:** “Separate governed transition” does not specify the governing authority when the root is lost, compromised or contested.
**Required root correction:** Model recoverable access separately from governance/root succession; define lost-root and disputed-ownership states, required independent evidence/custodians, waiting/notification/revocation rules, and no-root-safe-state. If no legitimate recovery authority exists, preserve HOLD rather than inventing a reset path.

### A7 — Consent/coercion is not fully machine-provable
**Attack:** User is coerced, inattentive, deceived by context, or confirms a screen that omits an important side effect.
**Candidate coverage:** Partial; calls out coercion and exact presentation.
**Gap:** Authentication intent is not proof of free/informed consent. A biometric unlock or fresh challenge cannot establish voluntariness.
**Required root correction:** Define which claims are actually supported: credential control, deliberate confirmation gesture, and content shown can be evidenced to different degrees; coercion/free consent remains residual risk unless a separate, justified protocol exists. Do not advertise “coercion-proof.”

### A8 — Confirmation scope creep
**Attack:** A “yes” to a harmless task is reused for a broad mission, future action, recurring authorization, or delegated authority.
**Candidate coverage:** Good direction but state/contract does not define duration or permitted action set.
**Required root correction:** Default to one action and one semantic transaction. Any batch, recurring, delegated or mission-wide grant needs a separate bounded capability contract: scope, budget, expiry, revocation, constraints, delegation limits and effect reconciliation. No implicit expansion.

### A9 — External provider rewrites or partially applies transaction
**Attack:** Provider normalizes, redirects, partially executes, delays or duplicates effect after a valid local approval.
**Candidate coverage:** Partial; outcome states included.
**Gap:** No provider capability classification, external receipt trust model, or semantic mapping between submitted transaction and actual effect.
**Required root correction:** Define per-provider effect contract and evidence quality. Provider acknowledgement is not independent proof unless the source and semantics justify it. Unmatched/partial/unknown result stays UNKNOWN and enters reconciliation, not success.

### A10 — Dependency omission / hidden mutable input
**Attack:** Policy, target alias, recipient ownership, account state, environment or dependency changes after confirmation, while transaction digest omits it.
**Candidate coverage:** Partial; dependency closure is required abstractly.
**Gap:** No rule to derive action-specific critical dependencies or prove closure. P/P112's general dependency findings do not establish this human-confirmation schema.
**Required root correction:** Build a claim-specific dependency contract per action class; bind/version/fence every material dependency or stop if closure cannot be established. A global revision or timestamp is not a universal fence.

### A11 — Fallback downgrades assurance
**Attack:** Primary authenticator unavailable; system silently falls back from phishing-resistant step-up to voice, spoken keyword, or session cookie.
**Candidate coverage:** Explicitly forbidden conceptually.
**Gap:** No governed fallback equivalence/eligibility relation; no rule for which action classes become unavailable.
**Required root correction:** Enumerate allowed fallback per action class and threat model. If the fallback cannot satisfy the same required properties, deny that action and preserve low-risk functionality only.

### A12 — State machine collapses semantic distinctions
**Attack:** An implementation treats AUTHENTICATION_VALIDATED as AUTHORIZATION_VALIDATED, or treats SUBMISSION_ATTEMPTED as EFFECT_CONFIRMED; an approval is consumed but operation result is unknown.
**Candidate coverage:** It warns against one boolean but candidate states lack explicit transition guards/ownership.
**Gap:** No formal state-transition relation or concurrency/rollback semantics.
**Required root correction:** Before code, write a state/transition table identifying actor, preconditions, durable writes, linearization point, evidence emitted, retry behavior and recovery for every transition. Keep authentication, authorization, submission, effect and reconciliation separate.

## Cross-cutting contradiction/overreach check
- “Exact action + current epoch” does not itself prove root legitimacy, semantic dependency completeness, or enforcement.
- Cryptographic signature/hash establishes a bounded integrity/authenticity claim only under key and verifier assumptions; not user comprehension, free consent, authorization, effect or non-effect.
- Two factors are not independent solely because they use different modalities.
- User recognition and remembered secrets are convenience/authentication signals, not automatic Constitution/root authority.
- Audit records support reconstruction but do not stop execution.
- A global risk score cannot override missing claim-critical evidence or lower a mandatory guarantee.
- If a required dependency or authority fact is UNKNOWN, no “best effort” inference is permitted for a protected effect.

## Result classification
- Covered directionally: one-action scope, fresh evidence, action/target/parameter binding, no silent downgrade, distinct outcome/reconciliation, explicit recovery blocker.
- Underspecified/root gaps: canonical transaction semantics; independent presentation and verifier model; one-time consume/concurrency semantics; exact effect boundary and currentness guarantees; action-specific dependency closure; provider effect evidence; state transition table; fallback matrix.
- Blocking unresolved: legitimate genesis/root and succession; lost-root recovery authority; final assurance profiles and accepted platform threat model.
- Evidence limitation: canonical P/P112 authentication-specific evidence was not found in this pass. P/P112 dependency-closure lessons were cross-checked from NCS existing research but must not be misrepresented as a dedicated authentication protocol.

## Decision
Do NOT accept the candidate as a finalized contract. Do NOT implement a confirmation token, root credential, or policy path based on it. The correct next step is to refine the root semantic contract and then attack it again, not add independent patches for each attack.

## Next exact action
Draft the transaction canonicalization + effect-boundary semantics as a bounded sub-contract, but only after mapping the authority/root prerequisites and explicitly stating assumptions. Then adversarially review whether that sub-contract can be defined without a circular root or invented enforcement guarantee. Keep STEP 7 future-countereffects gate closed until these issues are resolved.
