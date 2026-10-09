# NCS — Minimum Verifier Evidence for the Biometric Commissioning Claim
Date: 2026-10-08
Status: RECONCILIATION COMPLETE — REQUIRED EVIDENCE NOT PRESENT; CLAIM BLOCKED/UNKNOWN; NO IMPLEMENTATION

## Question
Given the existing Genesis Recognition Basis Precondition, Minimum Genesis Trust Foundation Contract, and focused attack on strong biometric approval binding, what minimum evidence would a protected verifier need before accepting the narrow claim:

> “Kevin approved this exact commissioning/constitutional action now.”

This record reconciles existing contracts. It does not create a new trust root, registry, runtime layer, credential, or commissioning path.

## Minimum evidence at the verifier boundary

| Predicate | Minimum evidence required for this claim | Failure disposition |
|---|---|---|
| Prior legitimacy / enrollment | A governed, pre-existing enrollment or recognition record linking the approval key and its permitted owner/scope to an authority basis that does not depend solely on the candidate Nexo instance, its app, or the credential being authorized. Provenance must be verifiable by the protected verifier. | No prior basis or circular/self-enrollment => UNKNOWN/HOLD; disproven basis => INVALID. |
| Key and authenticator properties | Evidence from the actual platform/device path that the selected key is authentication-per-use protected and the accepted authenticator meets the chosen BIOMETRIC_STRONG/Class 3 requirement; attestation only where required by the threat model and validated against an independently justified trust basis. | Self-reported capability or unknown properties => UNKNOWN/HOLD; unmet mandatory class => STOP. |
| Exact content and human-facing action | One canonical, unambiguous binding among the presented action, submitted action, Constitution identity/version/content hash, commissioning context, scope, and key operation. The verifier must be able to reject display/payload substitution; the design must separately state any trusted-presentation assumptions it cannot prove. | Mismatch => INVALID; missing canonical binding or unresolved presentation trust => UNKNOWN/HOLD. |
| Freshness and replay control | Verifier-governed fresh challenge scoped to this commissioning context and one-time acceptance/consumption, with no reuse across instances, sessions, actions, or Constitution revisions. | Stale/replayed challenge or context mismatch => INVALID; no trustworthy freshness/consumption authority => UNKNOWN/HOLD. |
| Identity attribution limits | Evidence and explicit enrollment governance sufficient for the exact attribution being claimed, including whether another enrolled person could satisfy the platform prompt. A biometric match alone must not be represented as proof of civil identity or uniquely Kevin's intent. | Unresolved multi-enrollment/attribution assumptions => the claim “Kevin specifically approved” remains UNKNOWN/HOLD. |
| Currentness and lifecycle | An established authority source for status, revocation, replacement, biometric enrollment change/key invalidation, recovery, commissioning cancellation, Constitution/policy epoch, and any re-establishment rules. | Missing or unavailable currentness => UNKNOWN/HOLD; known revoked/invalid credential => INVALID. |
| Independence and dependency closure | Protected provenance plus a threat-model-appropriate account of dependencies (app, OS/update, key storage, account/sync, network/provider, verifier, recovery, and presentation). Multiple outputs sharing one ungrounded dependency are not independent corroboration. | Unknown critical dependency or no justified verifier basis => UNKNOWN/HOLD. |
| Protected decision and enforcement | A protected Core/verifier that validates the above evidence rather than trusting caller-supplied booleans, labels, hashes-as-trust, or app signatures alone; separately evidenced coverage of every privileged path relevant to the claimed effect. | No verifier/root basis or no enforcement evidence => no acceptance; UNKNOWN/STOP. |

## Acceptance rule
The verifier may accept only when every predicate required by the declared threat model is evidenced under a previously justified trust basis. The biometric operation contributes, at most, one local re-authentication factor within that chain. It cannot create the prior recognition basis, authenticate its own verifier, establish current authority by itself, or prove enforcement.

- `ESTABLISHED`: all required predicates are evidenced and consistent for this exact claim.
- `UNKNOWN/HOLD`: any required basis, provenance, freshness, currentness, dependency, presentation, or enforcement fact is absent or unresolved.
- `INVALID`: evidence contradicts a required predicate (for example, payload mismatch, replay, or a credential known to be revoked).

Do not convert UNKNOWN into ESTABLISHED through retries, local flags, extra hashes/signatures, another biometric layer, or a new ungrounded witness.

## Reconciliation result
The existing Genesis Recognition Basis Precondition already defines the required semantic conditions; the biometric focused attack already identifies the candidate-specific failures. No new abstract security layer is needed. This record makes the acceptance boundary explicit and maps the existing requirements to verifier evidence.

**Current deployment result: BLOCKED/UNKNOWN.** The repository does not evidence a concrete pre-existing recognition/enrollment basis, independently justified protected verifier/root, actual device/key capability, or enforcement boundary. Therefore the biometric candidate cannot currently be implemented or honestly accepted as a protected genesis approval. The current phone and Termux remain candidate components, not trust roots.

## Next action / stop boundary
Do not add more biometric attack lists, repeat generic root taxonomy, reopen broad phone research, or implement a mock verifier that trusts its own inputs. The only progress that can change this result is:
1. concrete, verifiable evidence for a specifically named pre-existing recognition/verifier basis; or
2. an explicit owner decision to examine the separately documented narrow commissioning-environment assumption (Path A), with its assumptions and limits made explicit; or
3. keep Nexo uncommissioned and preserve the safe stop.

No path is selected by this record. “Continue” is not consent to Path A. No code, key generation, enrollment ceremony, activation, production effect, Lúmina change, or frozen AB/TLC/Kafka rerun is authorized.
