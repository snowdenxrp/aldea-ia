# STEP 7 — Genesis Recognition-Basis Precondition
Date: 2026-10-08
Status: DESIGN CONTRACT CLARIFICATION — PRECONDITION DEFINED; EVIDENCE SOURCE ABSENT; NO IMPLEMENTATION AUTHORIZED

## Purpose
Make explicit the prerequisite that the existing Genesis Trust Foundation contract already depends on: Core must have a legitimate basis to recognize the first approval/authority evidence. This clarifies an input precondition; it does not add a new root, trust registry, runtime component, or mechanism.

## Normative authority vs evidence
- Normative governance decision: Kevin is the sole initial constitutional authority under the intended Constitution. This is an accepted owner decision.
- Technical recognition: Core must have claim-relevant evidence that the commissioning approval presented through the selected candidate channel is attributable to Kevin, bound to the exact Constitution and commissioning context, and valid under the applicable lifecycle rules.
- These are distinct. Recording the normative decision does not automatically authenticate a future message or credential. A valid technical credential does not itself create the normative authority.

## Required precondition for any genesis establishment
Before Core may treat an approval response as admissible support for the genesis claim, all required fields below must be established by a governed trust basis—not merely supplied by the approval caller:

1. **Prior recognition/enrollment basis:** evidence that the recognition relationship existed before the candidate Nexo instance is authorized, and was not created solely by the candidate instance or the credential it is meant to authorize.
2. **Attribution scope:** what identity/custody relation the evidence supports, for which owner and which exact commissioning claim. No inference from device possession, account login, voice/biometric match, key possession, or a successful signature alone.
3. **Exact approval binding:** the approval binds the canonical Constitution content and the declared commissioning context; content identity, human presentation and submitted object must be linked by a specified and testable contract.
4. **Challenge/context freshness:** evidence is bound to the active ceremony/context and cannot be replayed across deployments, Constitution revisions, purposes or superseded ceremonies.
5. **Lifecycle/currentness:** the governing source for credential status, revocation, replacement, recovery and relevant authority continuity is known and current for the claim. Unavailable currentness is UNKNOWN/HOLD.
6. **Dependency closure:** the evidence path's material dependencies—including client, OS/update, account, storage/sync, network, provider, recovery and verifier/policy source—are enumerated to the degree required by the threat model. Unknown dependencies cannot be counted as independent.
7. **Protected provenance:** Core can distinguish evidence established under the governed trust basis from caller-created fields, labels, local state, or an equivalent-looking object.
8. **Failure and conflict semantics:** mismatch, stale/revoked credential, conflicting root histories, interrupted ceremony, or missing required evidence yields UNKNOWN/HOLD or INVALID as defined by the failed predicate. No fallback silently broadens authority.
9. **Claim limitation:** the resulting evidence establishes only the explicit initial approval-to-Constitution binding claim. It does not authorize future missions, policy changes, recovery, root rotation, succession, execution, or external effects.

This list is a contract precondition, not a claim that all details should become fields in one object. Implementation representation remains open.

## Establishment result
- `ESTABLISHED`: only if the governed basis and every required condition for this specific claim are evidenced.
- `UNKNOWN/HOLD`: any required pre-existing recognition, provenance, currentness, dependency, presentation-binding, or conflict fact is unavailable or unresolved.
- `INVALID`: a required relation is disproven, e.g. self-enrollment, context mismatch, revoked credential under the governing lifecycle, or replay rejected by the defined ceremony contract.

Do not return ESTABLISHED merely because a signature verifies, a hash matches, an app says “approved”, or a typed record passes structural validation.

## Candidate phone application
Kevin selected the current phone as a candidate channel only. This precondition does not assume the phone is compromised or secure; it requires that its actual role and evidence path be evaluated under a declared threat model. Termux is not an independent authority because it runs on the same candidate phone.

The phone may serve as the approval/presentation surface if a future mechanism justifies that role. It cannot create the prior enrollment fact that establishes its own legitimacy. If no independently grounded recognition evidence exists, the result remains UNKNOWN/HOLD; do not manufacture one.

## Attacks reused, not repeated as new investigations
This precondition must inherit the existing acceptance cases for self-signing, hash-as-trust, signature-as-currentness, provider bootstrap, recovery self-root, common-mode independence, replay/snapshot resurrection, scope amplification, and emergency second-Constitution. The present document does not reopen those generic attacks.

Before any implementation, run a focused review only for contradictions introduced by this precondition: circular prior-recognition, false attribution, mismatch between displayed/submitted Constitution, missing currentness, dependency omission, and authority scope amplification. If an existing attack already fully covers a case, cite/reuse it rather than duplicating it.

## Consequence / gate
The semantic precondition is now explicit, but **its required evidence source is not present or selected**. This does not solve genesis trust. No concrete root, channel credential, enrollment ceremony, verifier, trusted display, platform, provider or protocol is chosen.

Genesis Trust Foundation, Constitution Authority Context, protected activation and production effects remain BLOCKED/UNKNOWN. No code, no Lúmina changes, no frozen AB/TLC/Kafka reruns.
