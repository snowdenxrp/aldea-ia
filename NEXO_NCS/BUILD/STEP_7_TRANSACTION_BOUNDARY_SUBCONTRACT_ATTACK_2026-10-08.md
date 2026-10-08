# STEP 7 — Transaction Boundary Subcontract Attack
Date: 2026-10-08
Status: ATTACK PASS; SUBCONTRACT REMAINS BLOCKED / NOT ACCEPTED

## Reviewed artifact
`NEXO_NCS/BUILD/STEP_7_TRANSACTION_CANONICALIZATION_AND_EFFECT_BOUNDARY_SUBCONTRACT_2026-10-08.md`

## Verdict
The subcontract correctly refuses to equate digest integrity with semantic correctness or local authorization with external effect. However, it is still a requirements checklist rather than a closed contract. The central failure is not missing more fields: it is that semantic authority, current authority and effect enforcement are assumed but not established. Root commissioning remains the controlling blocker.

## Attack results

### T1 — Ambiguous normalization / alias substitution
**Scenario:** The same visible target resolves differently across locales, accounts, provider namespace, default unit, mutable directory or time.
**Result:** BLOCKED BY CANDIDATE only if protected resolver and canonical semantics already exist; those are currently unproven.
**Classification:** BLOCKING ASSUMPTION.
**Required evidence:** action-class semantic definition, resolver authority/provenance, canonical encoding and independent test vectors including ambiguous/invalid input. Until then UNKNOWN/HOLD.

### T2 — Digest of semantically incomplete transaction
**Scenario:** Digest is valid but omits fees, side effects, permission duration, hidden recipients, transitive dependencies or provider-side defaults.
**Result:** Contract says fields must be material but supplies no completeness oracle.
**Classification:** UNDERSPECIFIED.
**Required correction:** Each action class needs a hazard-to-dependency mapping and explicit materiality rules reviewed independently. Hashing cannot prove field completeness. Unknown materiality blocks high-consequence execution.

### T3 — Presentation path lies
**Scenario:** UI displays safe summary while the signed transaction contains dangerous parameters; the approval control and renderer share compromised software.
**Result:** “Trusted presentation” remains ungrounded; the contract correctly refuses to claim independence without evidence.
**Classification:** BLOCKING PLATFORM/TCB ASSUMPTION.
**Required evidence:** defined attacker model, trusted rendering/input path, binding proof from shown transaction to signed semantic record, compromise/failure-domain analysis. If unavailable, limit permitted action classes.

### T4 — Approval consumed concurrently
**Scenario:** Two replicas validate one approval concurrently, both pass a local “unused” check, and submit effects.
**Result:** Contract identifies linearization/atomicity obligations but does not define a primitive or distributed consistency model.
**Classification:** UNDERSPECIFIED / IMPLEMENTATION-BLOCKING.
**Required correction:** Name the authoritative consumption boundary and its uniqueness/consistency guarantee; specify what happens during partitions. If uniqueness cannot be enforced at all relevant effect boundaries, no exactly-once or one-time-use claim is allowed.

### T5 — Revocation races effect
**Scenario:** Revocation commits locally, but an external provider already accepted or later executes the request.
**Result:** Candidate properly requires effect-boundary enforcement, but the actual boundary and provider's fence semantics are not identified.
**Classification:** BLOCKING ROOT/PROVIDER ASSUMPTION.
**Required evidence:** per-effect boundary map, provider enforcement contract, ordering/fencing guarantees, stale-incarnation rejection and explicit residual in-flight effects. “Revocation enforced globally” cannot be claimed without closure evidence.

### T6 — Offline authorization
**Scenario:** Device is disconnected and cannot establish current authority/revocation, but user wants voice interaction or a protected effect.
**Result:** Safe behavior is clear: hold unless a separately approved bounded offline capability exists. No such capability is currently justified.
**Classification:** SAFE HOLD; policy decision remains OPEN.
**Required action:** Define offline allowed action classes and exposure bounds only after root and risk semantics exist; no implicit grace period.

### T7 — Provider response lies or is incomplete
**Scenario:** Provider returns accepted/complete while applying a partial, redirected, delayed or duplicated effect.
**Result:** Contract marks outcome UNKNOWN where semantics are insufficient, but provider contracts and evidence trust levels are not mapped.
**Classification:** UNDERSPECIFIED.
**Required correction:** Per-provider effect/evidence profile with authenticated receipt semantics, independent observation when available, reconciliation procedure and explicit unsupported claims. No universal provider adapter can manufacture evidence.

### T8 — Crash/restore around submit
**Scenario:** Crash after external submission but before recording receipt; restore checkpoint and retry.
**Result:** Contract acknowledges the gap but does not define durable transition ordering or anti-rollback source.
**Classification:** UNDERSPECIFIED / ROOT-DEPENDENT.
**Required correction:** Per-action state machine and crash matrix, durable operation journal, source of current incarnation/fence authority, and reconciliation. Local event sourcing alone does not prove external non-effect or prevent a stale external execution.

### T9 — Root loss and disputed ownership
**Scenario:** Root credential is lost or stolen; two parties claim legitimate succession; recovery provider offers a reset.
**Result:** Contract explicitly cannot decide who is legitimate without a separate governance basis.
**Classification:** FOUNDATIONAL BLOCKER.
**Required action:** Return to commissioning/succession semantics; do not allow transaction confirmation, recovery email, device possession or platform account ownership to self-authorize the root.

### T10 — Compensation misread as rollback
**Scenario:** A destructive external effect occurred; system sends compensating action and reports original action as undone.
**Result:** The subcontract says compensation is separate but does not define semantic reversibility or residual harm.
**Classification:** UNDERSPECIFIED.
**Required correction:** Each action class must define reversibility, compensation preconditions, partial-effect semantics and what cannot be restored. Compensation is a new governed effect, not proof of time reversal.

## Contract-level corrections
1. Preserve the core sequence as distinct: canonical meaning -> presentation -> user-intent evidence -> authorization -> one-time admission/submission -> external effect evidence -> reconciliation.
2. No phase may validate its own legitimacy solely using evidence whose authority it is meant to establish.
3. Canonical transaction must be owned by a protected, versioned action-class semantic contract; callers/models cannot define their own material fields.
4. Currentness and revocation guarantees must be named per effect boundary and provider. No global claim from local state.
5. Approval consumption, external submission and effect receipt are three distinct events. Failure between them yields a recoverable UNKNOWN, not an invented exactly-once guarantee.
6. No-root recovery and contested succession require a separate legitimate governance rule; if absent, remain HOLD.
7. Unknown dependencies, enforcement domains or provider semantics are not “probably safe” and cannot be hidden by a digest, confidence score, audit log or more confirmation prompts.

## Decision
Do not implement this subcontract. It narrows the questions but does not close them. No patch should be added to paper over missing semantic authority, root legitimacy or effect-boundary guarantees.

## Next exact action
Return to STEP 7 commissioning/root decision. Evaluate the candidate legitimacy bases against (a) who authorizes the first Constitution, (b) how that basis is independently recognized, (c) loss/compromise/dispute, (d) succession, (e) portability/provider exit, and (f) revocation/currentness. Keep mechanisms as candidates only; do not select a physical or cryptographic channel before the semantic authority model is sound.
