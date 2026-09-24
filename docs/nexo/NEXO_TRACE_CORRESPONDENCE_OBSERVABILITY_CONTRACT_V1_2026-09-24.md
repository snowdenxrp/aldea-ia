# NEXO TRACE CORRESPONDENCE AND OBSERVABILITY CONTRACT V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation.

## 1. Research basis

NIST treats logs as records of observable events and log management as a lifecycle covering generation, transmission, storage, access and disposal. NIST also notes that inconsistent host clocks can make cross-system ordering unreliable. citeturn0search26turn0search23

NIST SP 800-53 requires audit records to contain enough information to identify what occurred, when, where, source, outcome and associated identities; its system-wide audit trail enhancement requires time-correlation within an explicit tolerance. It also requires protection of audit information against unauthorized modification/deletion. citeturn0search7turn0search24

Therefore a Nexo trace cannot be treated as ordinary application logging. For protected transitions, trace data is part of the evidence boundary.

## 2. Core distinction

EVENT LOGGED
!= EVENT OBSERVED
!= EVENT DURABLE
!= EVENT ORDERED
!= EVENT AUTHENTICATED
!= EVENT CONTEXT-BOUND
!= EVENT VERIFIED
!= EVENT PROOF OF WORLD TRUTH.

A trace can establish that a component emitted a record without establishing that the claimed external effect happened.

## 3. Trace identity contract

Every safety-relevant event must have:
- event_id; event_type; producer_id; observer/collector identity where applicable;
- operation_id; effect_id/effect_key when applicable; target fingerprint;
- parent_event_id / causal relation where applicable; local sequence number;
- authoritative ordering/linearization reference when applicable;
- event time; receipt/persistence time; time-quality/trust status;
- state/version context; authority epoch; coordination fence/generation;
- stop/recovery epoch where applicable; VersionSet/policy/invariant fingerprint;
- payload schema version; provenance; dependency/failure-domain context;
- integrity/authentication status; durability status; invalidation status.

## 4. Three clocks, not one

Distinguish:
1. EVENT_TIME — producer's reported time.
2. OBSERVATION_TIME — observer/collector receipt or observation time.
3. AUTHORITATIVE_ORDER — protected ordering/linearization sequence.

Wall-clock timestamps are evidence context, not automatically a serialization mechanism. A clock failure must not manufacture event order. NIST warns that inconsistent clocks can produce misleading cross-host ordering. citeturn0search23

## 5. Event ordering

Possible relations:
- LOCAL_SEQUENCE
- CAUSAL_PREDECESSOR
- PROTECTED_LINEARIZATION_ORDER
- OBSERVATION_ORDER
- WALL_CLOCK_ORDER
- UNKNOWN_ORDER.

These relations must not be conflated. For protected transitions, PROTECTED_LINEARIZATION_ORDER dominates ordinary timestamps.

## 6. Durable trace boundary

For each critical transition define:
TRACE-BEFORE → LINEARIZATION → TRACE-AFTER.

The trace itself must not be required to establish a safety transition if stored asynchronously after authoritative state change. Instead, authoritative state establishes the transition; trace establishes evidence about the transition.

If trace is part of a transaction's required evidence, its durability boundary must be included in the same protected atomicity bundle.

## 7. Minimum protected event set

REQUEST_RECEIVED, REQUEST_NORMALIZED, EFFECT_BOUND, ADMISSION_EVALUATED, AUTHORIZATION_COMMITTED, RESERVATION_COMMITTED, FINAL_GATE_EVALUATED, EXECUTION_STARTED, EXTERNAL_ATTEMPT, EXTERNAL_RESPONSE_RECEIVED, EXTERNAL_OUTCOME_CLASSIFIED, STOP_REQUESTED, STOP_ENFORCING, STOP_VERIFIED, RECOVERY_ENTERED, RECOVERY_RELEASE_COMMITTED, VERSIONSET_STAGED, VERSIONSET_ACTIVATED, EVIDENCE_OBSERVED, EVIDENCE_INVALIDATED, CLAIM_ACCEPTED, DECOMMISSION_CLOSED.

Some are audit events; others correspond to authoritative transitions.

## 8. Linearization event

For every L3 transition, trace must identify:
transition_id, operation_id, effect_id/effect_key, precondition fingerprint, linearization reference, postcondition fingerprint, authority context, coordination fence, VersionSet, result.

The linearization reference must point to the authoritative serialization event, not merely a service log timestamp.

## 9. Trace loss semantics

If a trace record is lost:
- do not invent it;
- do not infer it from a later non-authoritative log;
- preserve the gap;
- classify affected evidence/claim;
- re-evaluate whether required guarantees remain satisfied.

Statuses:
TRACE_COMPLETE, TRACE_PARTIAL, TRACE_GAP, TRACE_CONFLICTING, TRACE_UNTRUSTED, TRACE_INVALIDATED.

## 10. Duplicate/replay

Duplicate events must be detected by stable identity and/or causal context. A duplicate trace record must not create a second logical transition. Replay of an old trace must not make old state current.

EVENT_ID identifies a record; OPERATION_ID identifies logical work; EFFECT_ID identifies the protected external effect.

## 11. Crash boundaries

Model:
A. event generated before authoritative commit but not persisted;
B. authoritative commit succeeds but trace publication fails;
C. trace persists but process crashes before response;
D. external attempt occurs but response/trace is lost;
E. recovery reconstructs durable state;
F. stale trace arrives after recovery.

No trace state may silently override authoritative state.

## 12. Trace reconstruction

A reconstruction engine may derive operation lifecycle, effect lifecycle, authority history, fence history, STOP history, recovery history, VersionSet changes and evidence validity timeline.

But reconstructed state is DERIVED unless backed by authoritative state.

RECONSTRUCTED != AUTHORITATIVE.

## 13. Trace-to-model mapping

CONCRETE EVENT SEQUENCE
→ CONCRETE TRANSITION
→ LINEARIZATION EVENT
→ ABSTRACT ACTION
→ ABSTRACT STATE DELTA.

Each segment is classified as direct, composed, stuttering, evidence-only or non-authoritative.

## 14. Independent observation

The executor should not automatically be treated as an independent verifier. Executor success is not automatically independent world observation. Planner goal-achieved output is not automatically mission verification. Observer dependencies and common-mode domains are part of evidence validity.

## 15. Trace integrity

Trace integrity includes source authentication, record integrity, schema validation, context binding, provenance, sequence/causal consistency, storage integrity, access-control protection and invalidation handling.

NIST requires protection of audit information and logging tools against unauthorized access, modification and deletion. citeturn0search25

## 16. Trace privacy/security

Safety evidence can contain sensitive operational information. Use minimum necessary payload, protected identifiers, access-controlled views, retention/deletion policy, and never log cryptographic secrets directly. Redaction must preserve evidence semantics and itself be auditable.

AUDITABILITY != UNRESTRICTED DISCLOSURE.

## 17. Observer failure

Observers can fail, lag, duplicate, reorder, lose records, become compromised, or share failure domains with the subject. Observer health and independence therefore belong to evidence validity. Observer absence must not be interpreted as “nothing happened.”

## 18. Evidence promotion

T0 UNKNOWN → T1 UNTRUSTED → T2 AUTHENTICATED → T3 CONTEXT_BOUND → T4 VALIDATED → T5 VERIFIED_FOR_CLAIM.

Promotion requires explicit conditions. Authenticated event does not automatically prove world truth.

## 19. Trace/evidence invalidation

Invalidate or downgrade dependent evidence when authority, policy/invariant, VersionSet, trust root, observer status, target/effect identity, freshness, dependency graph, common-mode independence, storage integrity, recovery, schema/semantic version or migration context changes.

Then:
TRACE/EVIDENCE INVALIDATED → DEPENDENT CLAIMS IDENTIFIED → CLAIM STALE/INVALID → RELEASE RECOMPUTED → HOLD/RESTRICT/REVALIDATE.

## 20. Reproducibility

A trace used for verification must preserve enough context to reproduce interpretation: trace schema, mapping, model, policy/invariant, dependency graph, VersionSet, tool/configuration, assumptions, ordering semantics and redaction/normalization rules.

A trace without interpretation context is insufficient for a durable verification claim.

## 21. Trace verification levels

TV0 LOGGED
TV1 INTEGRITY_CHECKED
TV2 CONTEXT_BOUND
TV3 ORDER_VALIDATED
TV4 TRANSITION_CORRESPONDENCE_CHECKED
TV5 CLAIM_SUPPORTING
TV6 INDEPENDENTLY_CORROBORATED

These are lifecycle states, not scores.

## 22. Observability failure policy

If trace is diagnostic only, continuation may be possible with reduced auditability. If trace is required evidence for a safety claim:
ASSURANCE_DEGRADED → RESTRICT/HOLD/REVALIDATE.

Never silently downgrade a mandatory evidence requirement into optional telemetry.

## 23. Rejected anti-patterns

wall-clock timestamp as linearization proof; process log as authoritative state; executor ACK as world truth; missing event = no event; later event proves every prior event; duplicate event = duplicate operation; trace reconstruction = authoritative state; audit storage success = state transition success; authenticated source = verified payload truth; independent process = independent evidence; complete logs = complete observability; immutable log = correct event; signed event = true external effect.

## 24. New invariants

TRACE-01: every safety-relevant event has stable identity.
TRACE-02: event time is distinct from authoritative ordering.
TRACE-03: wall-clock time cannot alone establish protected linearization.
TRACE-04: protected transition identity is bound to operation/effect/target context.
TRACE-05: trace duplication cannot duplicate logical effects.
TRACE-06: trace replay cannot resurrect obsolete state.
TRACE-07: missing trace is a gap, not an inferred negative event.
TRACE-08: executor-generated evidence is not automatically independent verification.
TRACE-09: trace reconstruction is derived unless backed by authoritative state.
TRACE-10: observer dependency/common-mode context is part of evidence validity.
TRACE-11: safety-required trace loss can lower assurance and force revalidation.
TRACE-12: context changes can invalidate dependent evidence.
TRACE-13: audit integrity does not establish payload truth.
TRACE-14: trace interpretation requires versioned mapping/context.
TRACE-15: privacy controls cannot silently destroy required evidence semantics.
TRACE-16: no trace may grant authority merely by existing.

## 25. Result

The observability problem is now integrated with refinement. Future Nexo implementation must make it possible to answer:
WHAT happened? WHO/WHAT produced it? WHICH operation/effect? WHICH target? WHEN observed? WHAT is authoritative order? WHICH authority/fence/version was active? WHAT dependencies existed? WHAT concrete transition occurred? WHERE was its linearization point? WHAT abstract transition does it map to? WHAT evidence supports the claim? WHAT could invalidate it?

## 26. Next research gate

Next: fault injection and adversarial trace validation. Enumerate failures before/after linearization, before/after durable trace, before/after external attempt, duplicate/replay, lost/reordered events, clock corruption, observer compromise, storage rollback, partition, common-mode dependency failure, recovery and update/migration.

Objective: determine which failures can be detected, which must become UNKNOWN/HOLD, and which remain unobservable assumptions.

Architecture remains blocked.