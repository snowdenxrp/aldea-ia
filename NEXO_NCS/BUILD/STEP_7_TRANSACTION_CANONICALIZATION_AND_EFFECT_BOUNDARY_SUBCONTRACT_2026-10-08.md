# STEP 7 — Transaction Canonicalization and Effect-Boundary Subcontract
Date: 2026-10-08
Status: SEMANTIC CANDIDATE; DEPENDENT ON UNRESOLVED TRUST ROOT; NOT ACCEPTED FOR IMPLEMENTATION

## 1. Scope
This subcontract addresses only the gap between (a) the exact transaction presented for approval and (b) the transaction an effect boundary is asked to perform. It does not define genesis legitimacy, Constitution authority, a general trust registry, or a provider-independent global enforcement guarantee.

## 2. Non-negotiable assumptions (currently unproven)
The contract can operate only if all are established separately:
- A legitimate, independently recognized root/governance basis determines who may define transaction semantics and authorize policy.
- A protected resolver defines target identity, aliases, units, defaults, normalization, and material parameter semantics for each action class.
- A protected authorization decision is made outside the model and is bound to the resolved transaction.
- The actual effect boundary can identify the same transaction and enforce the applicable current authority/revocation state, or explicitly reject the operation when it cannot.
- A provider-specific effect contract defines which submitted request can produce which external effects and what evidence can distinguish confirmed effect, confirmed non-effect and UNKNOWN.
If any premise is UNKNOWN, the contract cannot claim protected execution safety. Do not synthesize the missing premise from a hash, model output, timestamp, provider response or caller-supplied label.

## 3. Candidate semantic transaction
For one action, define a versioned semantic transaction record containing, at minimum:
- action class and semantic contract version;
- canonical target identity and scope after authoritative resolution;
- all material parameters in canonical typed form, including units, defaults and content digest where appropriate;
- relevant dependencies and the evidence/versions/fences needed to show they remain valid;
- intended effect boundary/provider namespace and effect-contract version;
- applicable policy reference and decision-context reference;
- unique operation identity and explicit idempotency/effect-key scope;
- expiry/freshness constraints and required assurance profile;
- explicit unresolved fields/assumptions, which prohibit protected execution.

This is a candidate semantic shape, not an approved universal schema. Each action class must prove which fields are material; no generic “transaction hash” substitutes for semantic completeness.

## 4. Presentation-to-execution binding
1. Resolve target and material parameters under the protected action-class semantics before presentation.
2. Produce a human-readable presentation from the same immutable semantic transaction snapshot that will be authorized.
3. Bind approval evidence to the exact semantic transaction identifier/digest, action scope, context, freshness challenge, policy context and authority context.
4. Before submission, independently compare the authorized transaction with the transaction about to be executed at the boundary that controls the effect.
5. Any change to target, material parameter, dependency, policy applicability, authority epoch, provider namespace or semantic version invalidates the approval. Create a new operation and require new approval; never mutate the old approval in place.
6. If canonicalization is ambiguous, if a material parameter cannot be rendered intelligibly, or if the executable request cannot be proven semantically equivalent to the approved transaction, return UNKNOWN/HOLD.

A digest can bind bytes only after the semantic meaning and canonical encoding are defined. It cannot establish that the meaning is correct or authorized.

## 5. Effect-boundary gate
Immediately before a protected external effect, the effect boundary must establish:
- the presented/approved/executable transaction matches under the action-class equivalence contract;
- the authorization decision is valid for this exact action, target, parameters, scope and provider;
- policy and authority are current enough for the stated guarantee;
- STOP/revocation/fencing is enforced at the relevant effect boundary, not merely requested or observed by the model;
- required dependencies remain valid or the policy explicitly tolerates their bounded staleness;
- the operation has not been consumed, superseded, expired, revoked or ambiguously submitted already;
- provider behavior and receipt semantics meet the required effect contract.

If the boundary cannot query current authority or enforce the required fence (e.g. offline/disconnected), it must not imply a stronger guarantee than it can provide. It may only use a separately governed bounded offline capability whose limits, expiry, exposure and reconciliation are explicitly approved; otherwise HOLD.

## 6. Outcome and retry semantics
- No submission attempt is not the same as confirmed non-effect unless the relevant boundary proves no request crossed it.
- Submission timeout, lost acknowledgement, partial receipt, conflicting receipts or unknown provider behavior => EFFECT_UNKNOWN.
- EFFECT_UNKNOWN prohibits blind retry with a new operation identity.
- Retry is permitted only under a provider/action contract that proves safe deduplication or after reconciliation establishes a safe next transition.
- A provider acknowledgement is evidence whose strength depends on authenticated origin, semantics, scope and failure model; it is not automatically independent proof of real-world effect.
- Cancellation/STOP after submission does not prove the effect did not occur. Reconcile and, if needed, create a separate governed compensating action.

## 7. Concurrency and atomicity obligations
Before implementation, each action class must define:
- the linearization point for consuming approval and admitting submission;
- uniqueness scope for operation/effect keys across devices, incarnations, provider namespaces and retries;
- behavior for two concurrent submissions using the same approval;
- ordering with policy changes, authority epoch changes, revocation and STOP;
- crash windows before/after durable intent, external submission and receipt persistence;
- how recovery prevents stale checkpoint replay and how unresolved operations are reconciled.

If no atomic primitive spans local authorization and external effect, the contract must model the gap and resulting UNKNOWN state explicitly; it cannot claim exactly-once external effects by local idempotency alone.

## 8. Independence and assurance
Do not assume independent presentation, approval, authorization and execution merely because they are separate processes or use different cryptographic keys. For each critical claim, record shared device/OS, provider, account, enrollment, recovery, update, network and administrative dependencies. Unknown common-mode dependency is not evidence of independence.

## 9. Failure behavior
MISMATCH, UNKNOWN, CONFLICT, stale authority, unresolved dependency, compromised verifier, missing enforcement proof or ambiguous effect => protected HOLD/DENY plus evidence preservation and reconciliation as applicable. A user-facing message must distinguish blocked-before-submission from submitted-but-unknown.

## 10. Unresolved root questions
- Who has legitimate authority to define canonical action semantics and the policy that evaluates them?
- What independently recognized genesis/Constitution basis establishes that authority without circular self-authorization?
- Who governs lost-root recovery and succession if the original authority is unavailable or disputed?
- Which exact component is the effect boundary for each device/provider and what currentness/consistency guarantee does it provide?
- What evidence justifies claiming revocation is enforced at every relevant boundary?
- Which providers offer sufficient idempotency and outcome evidence, and what remains UNKNOWN otherwise?

These questions are blockers, not optional deployment details.

## 11. Decision
This subcontract is useful as a boundary statement but cannot be accepted as complete because its root, resolver, authorization, effect-boundary and provider assumptions are not yet grounded in an independently legitimate, implemented trust basis. No implementation is authorized.

## 12. Next exact action
Adversarially attack the assumptions and state transitions, especially alias/normalization ambiguity, shared UI/verifier compromise, concurrent consumption, stale authority, offline execution, provider partial effects and recovery from a lost root. If the review reveals that transaction semantics or enforcement authority has no legitimate owner, return to commissioning/root design. Do not add a patch layer.
