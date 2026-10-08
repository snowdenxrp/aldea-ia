# STEP 7 — Minimum Action-Bound Confirmation Contract Candidate
Date: 2026-10-08
Status: CANDIDATE FOR ADVERSARIAL REVIEW; NOT APPROVED; NO IMPLEMENTATION AUTHORIZED

## Purpose
Define what a confirmation must mean before Nexo may treat a human approval as authorization for one consequential operation. This contract does not select the genesis trust root, authenticator, UI, platform, or final risk taxonomy.

## Evidence and limits
- MASTER: cognition/proposal, authority, execution, effect and verification are distinct; claim-critical provenance must survive transformations; UNKNOWN/CONFLICT/UNTRUSTED blocks protected progression.
- AB/GLOBAL-AUDIT-109: requested, observed and enforced STOP/revocation are distinct; cached authorization, old credentials, restored checkpoints and local STOP do not prove current/global authority or absence of external effects.
- P/P112: current repository evidence emphasizes claim-specific and transitive dependency closure, authoritative reads, versions/incarnations and the danger of treating global revision/derived values as universal fences. P/P112 retrieval in this pass did not establish a dedicated human-confirmation protocol; do not claim it did.
- STEP 7 Trust Function/Root Role Map: cryptographic validity, integrity, provenance and a typed envelope do not independently establish legitimate root, current authority, scope or sufficiency.
- External standards can inform mechanism selection but cannot establish Nexo's genesis legitimacy or Constitution authority.

## Candidate contract
A protected confirmation is valid only for one fully specified, still-current decision context. It MUST bind:

1. **Operation identity:** unique confirmation/operation identifier with anti-replay semantics; idempotency identity must not be confused with authority.
2. **Exact action:** canonical action type and intended effect, not a broad “yes”, generic session approval or free-floating consent.
3. **Target and scope:** exact recipient/resource/device/account/namespace and authority scope; aliases must resolve before confirmation.
4. **Material parameters:** amount, content digest, deletion set, permissions, duration, destination and other action-specific parameters that can change consequences.
5. **Claim-critical evidence:** evidence references/provenance, relevant dependency closure and explicit UNKNOWNs; no UI summary may omit a material condition.
6. **Policy and authority context:** protected policy identity/version, applicable authority domain, current authority epoch/fence and scope; values are evidence to check, not self-authenticating authority.
7. **Freshness and lifecycle:** expiry/nonce/challenge, session/incarnation/device context where relevant, revocation/currentness check at the effect boundary, and invalidation on material context change.
8. **User-intent evidence:** an approved confirmation mechanism that proves the required level of control/intent under an explicit threat model. Voice/face recognition alone is not presumed sufficient.
9. **Trusted presentation and binding:** the human sees the exact action/target/material parameters through a presentation path whose integrity and failure domains are assessed; the approved transaction must be cryptographically/structurally bound to the transaction executed.
10. **Authorization decision:** a protected policy/authority component—not the model or the candidate operation—evaluates whether the evidence and confirmation authorize this exact action now.
11. **Enforcement:** downstream effect boundary rechecks scope/currentness/revocation and rejects stale or mismatched confirmations; confirmation receipt is not itself proof of execution.
12. **Outcome/reconciliation:** classify not-submitted, submitted/unknown, confirmed effect, confirmed non-effect, partial/compensated, and unresolved states. An ambiguous external result must not be blindly retried or reported as success.
13. **Audit/provenance:** durable record binds what was shown, what was approved, the relevant evidence/policy/authority context, what was attempted, enforcement result and external outcome. Audit logging is not enforcement.
14. **Recovery/replacement:** lost/replaced device, authenticator reset, provider migration, restored checkpoint, delegated credentials and succession each use separate governed transitions; recovery must not silently recreate or elevate root authority.

## State semantics
At minimum preserve distinct states:
- NOT_REQUESTED
- PRESENTED (exact canonical transaction shown)
- CONFIRMATION_EVIDENCE_RECEIVED
- AUTHENTICATION_VALIDATED
- AUTHORIZATION_VALIDATED
- EXPIRED / REVOKED / CONTEXT_CHANGED
- DENIED / UNKNOWN / STOP
- SUBMISSION_ATTEMPTED
- EFFECT_CONFIRMED / NON_EFFECT_CONFIRMED / EFFECT_UNKNOWN
- RECONCILED

Do not collapse these into a single APPROVED/SUCCESS boolean. Transitions require explicit guards. The final state vocabulary may be reduced only if a semantic equivalence proof preserves all safety-relevant distinctions.

## Mandatory deny/hold conditions
Protected execution is blocked if any of the following is true:
- action, target, material parameters or displayed/executed transaction differ;
- authority, policy applicability, dependency closure, revocation currentness or enforcement state is UNKNOWN/CONFLICT/UNTRUSTED;
- confirmation is stale, expired, replayed, duplicated outside the allowed idempotent path, or bound to another incarnation/context;
- the presentation/verifier/credential boundary is suspected compromised or its trust assumptions are not satisfied;
- required user intent is not established or coercion/spoof risk exceeds the governed policy;
- fallback would silently lower required assurance;
- STOP/revocation is requested but effect-boundary enforcement is not established;
- the external effect is ambiguous and the proposed next step assumes success or non-execution.

## Candidate assurance rule
Assurance is action-specific, not a global “recognized user” score:
- Low-impact reversible interaction may use natural recognition under narrow policy, without granting broad external capabilities.
- Consequential but recoverable effects require a fresh, transaction-bound step-up method with verified current authority.
- High-impact, destructive, constitutional, root, enrollment, recovery, delegation or succession transitions require a distinct stronger governance/commissioning procedure and independent review appropriate to the threat model.
- If the design cannot establish the required assurance, it holds/denies the protected transition rather than improvising a weaker path.

This is a design direction, not an approved risk matrix.

## Required adversarial review
Before acceptance, attempt at least:
1. Change target/amount/content/permissions after display but before execution.
2. Replace displayed UI transaction or confirmation receipt while keeping a valid signature/challenge.
3. Replay approval across operation IDs, devices, sessions, provider namespaces or after expiry.
4. Deliver confirmation after policy update, authority epoch change, STOP or revocation.
5. Execute from an offline/stale incarnation with cached permission; restore pre-revocation checkpoint.
6. Lose authenticator; compromise recovery account; reset/re-enroll; test if recovery creates root authority.
7. Spoof/replay voice or face; phish passphrase; coerce user; invoke accessibility fallback.
8. Share device/OS/provider/account/enrollment/recovery domain across supposed independent factors.
9. Return delayed/duplicate/partial provider receipt after STOP; ensure no false “did not execute” or “success” claim.
10. Omit a transitive dependency, parameter, alias resolution or policy assumption from the displayed summary.
11. Change provider/device without migrating revocation and authority state safely.
12. Present contradictory evidence or UNKNOWN dependency; ensure no permissive default.

For each scenario, document attacker capability, preconditions, expected state transition, enforcement point, observable evidence, common-mode assumptions, and residual risk. A test that only demonstrates the UI text or cryptographic signature is insufficient.

## Open blockers
- Legitimate, independently recognized genesis/Constitution root and succession model remain unresolved.
- No trusted presentation/verifier implementation has been selected or demonstrated.
- No final action-risk taxonomy, accepted assurance profiles, freshness windows or offline policy is approved.
- No proven global/cross-device revocation or external-effect enforcement closure is established.
- Dedicated P/P112 evidence for human confirmation has not been retrieved in this pass; cross-check must remain partial.
- The STEP 7 future-countereffects gate and adversarial review must pass before implementation.

## Next exact action
Write a separate adversarial review of this contract, classify each condition as covered, underspecified, contradictory, or dependent on unresolved root/platform assumptions. Do not implement. If a structural flaw requires a patch, stop and revise the contract at its root instead of adding another layer.
