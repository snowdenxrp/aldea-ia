# NEXO FORMAL REFINEMENT CLOSURE RESEARCH V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation.

## 1. Research basis

Lamport's TLA+ material defines implementation/refinement in terms of behaviors: an implementation refines a specification when every implementation behavior is also a behavior allowed by the higher-level specification, with stuttering steps allowing implementation-internal progress that is invisible at the abstraction level. Lamport's refinement examples use explicit refinement mappings and, where necessary, auxiliary variables. citeturn0search8turn0search24turn0search2

Lamport's documented consensus examples use multiple refinement layers, check safety refinements with TLC, and use mechanically checked proofs for safety while treating liveness separately. This reinforces that a protocol can refine an abstract specification without making all liveness or implementation assumptions disappear. citeturn0search10

## 2. Core rule

DESIGNED != FORMALLY MAPPED != REFINEMENT-CHECKED != IMPLEMENTATION-TESTED != RUNTIME-VERIFIED.

A name/state correspondence is not a refinement proof.

## 3. Required refinement chain

R0 — Mission/safety semantics
↓
R1 — Canonical abstract state machine
↓
R2 — Protected transition protocol
↓
R3 — Distributed storage/fencing implementation model
↓
R4 — Runtime implementation
↓
R5 — Deployed system/environment.

Each adjacent boundary needs an explicit contract.

No level may silently inherit guarantees from a level above it.

## 4. Refinement mapping

For every implementation state S_impl, define MAP(S_impl) = S_abs.

The mapping must identify:
- abstract state variables;
- implementation variables contributing to each abstract variable;
- ignored/internal variables;
- auxiliary variables;
- validity conditions;
- context needed for mapping;
- exceptional/recovery states.

A mapping must be total over every reachable implementation state relevant to the claim, or explicitly classify states outside its domain.

## 5. Action refinement

For every implementation step, the mapped behavior must correspond to:
1. an allowed abstract step;
2. a sequence of abstract steps represented through the refinement structure;
3. or a stuttering step that leaves all relevant abstract variables unchanged.

TLA+ explicitly permits implementation-internal stuttering steps that are invisible at the higher abstraction, but they cannot silently change abstract safety-relevant state. citeturn0search5turn0search24

## 6. Why state-name matching fails

Suppose implementation has:
AUTHORIZED → EXECUTOR_CHECK → DB_COMMIT → ACK_SENT

while abstract model has:
AUTHORIZED → EXECUTING.

It is not enough to say EXECUTOR_CHECK = EXECUTING.

We must prove:
- which implementation state variables define the abstract state;
- which checks are safety-preserving;
- which commit is the linearization event;
- what happens if DB_COMMIT succeeds but ACK_SENT fails;
- what happens if crash occurs between checks;
- whether another actor can interleave;
- whether the mapped state violates an abstract invariant.

## 7. Auxiliary variables

Implementation may contain request IDs, database transaction IDs, consensus log indexes, retry counters, internal queues, fencing tokens and recovery markers.

These may be auxiliary variables. They are legitimate only if the refinement argument explains how they support the mapping. Lamport explicitly describes auxiliary variables as a way to define refinement mappings when implementation contains internal state not present at the higher level. citeturn0search2

## 8. Linearization point correspondence

Every L3 operation must identify:

ABSTRACT ACTION
↕
IMPLEMENTATION LINEARIZATION EVENT.

Examples:
- Authorization ↔ protected commit/serialization event.
- Stop ↔ protected stop-fence activation event.
- Recovery ↔ protected recovery-release commit.
- Version activation ↔ protected VersionSet activation.
- Decommission ↔ protected lifecycle closure.

If no such correspondence exists, the implementation cannot claim refinement of that transition.

## 9. Crash refinement

Crash/restart must be modeled as behavior, not treated as an external exception.

For every critical transition:
PRE-COMMIT CRASH → mapped abstract state remains safe.
POST-COMMIT / PRE-RESPONSE CRASH → recovery reconstructs the committed abstract state.
POST-EXTERNAL-ATTEMPT CRASH → mapped external-effect state may be UNKNOWN.
RESTORE CHECKPOINT → may restore implementation state but must not manufacture abstract authority.

Thus crash handling belongs in the refinement boundary.

## 10. Partition refinement

For distributed implementations, partition behavior must map to abstract behavior.

If current authority cannot be established, implementation may enter HOLD / QUARANTINE / RESTRICT.

That must map to an allowed abstract degraded state.

It must never map:
NO_AUTHORITY → AUTHORIZED.

For external effects:
lost response → UNKNOWN, not NOT_APPLIED.

## 11. Fencing refinement

Implementation fence state must map to abstract coordination state.

Required:
current fence → actor admitted
stale fence → actor rejected/blocked.

The proof must cover old owner, new owner, delayed message, replay, lease expiry, storage rollback and restart.

A fence value that exists but is not checked at the protected gate is not a refinement of the abstract stale-actor prohibition.

## 12. Evidence refinement

Evidence mapping must preserve:
- exact effect identity;
- target;
- provenance;
- freshness;
- dependency closure;
- policy/invariant context;
- invalidation state.

An implementation event such as executor_ack=true cannot automatically map to abstract EFFECT_VERIFIED. The mapping must prove the required evidence semantics.

## 13. External-world refinement boundary

The implementation cannot refine an abstract claim about the world merely because an internal command committed.

The boundary must be:
INTERNAL INTENT → EXTERNAL ATTEMPT → OBSERVATION → RECONCILIATION → CLAIM.

The abstract external state therefore needs explicit UNKNOWN/PARTIAL states.

Otherwise the model is stronger than the implementation and the refinement claim is unsound.

## 14. Refinement under stuttering

Internal implementation steps may include queue movement, cache refresh, replica synchronization, telemetry emission, retry bookkeeping, consensus rounds, lock acquisition and release.

These can be stuttering relative to a higher-level specification if they leave all mapped abstract variables unchanged.

TLA+ explicitly treats stuttering as essential to allowing implementation-internal progress without requiring every implementation step to appear as a higher-level transition. citeturn0search4turn0search5

But a step that changes an abstract safety variable cannot be mislabeled as stuttering.

## 15. Forward vs backward reasoning

Forward simulation: for each implementation step, show a corresponding allowed abstract behavior.

Backward reasoning: given an abstract step/behavior, show that implementation can realize it under specified assumptions.

Safety refinement primarily needs forward containment. Liveness additionally requires progress assumptions and fairness and must remain separately identified.

This preserves:
SAFETY EVIDENCE != LIVENESS EVIDENCE.

## 16. Refinement assumptions

Every refinement proof must explicitly list assumptions such as:
- storage atomicity;
- durable ordering;
- clock properties;
- consensus quorum;
- cryptographic integrity;
- identity validity;
- failure model;
- scheduler/fairness assumptions;
- external API semantics;
- fencing enforcement;
- recovery correctness.

An assumption belongs to the proof context and therefore to its evidence fingerprint.

If an assumption changes, refinement evidence becomes stale until rechecked.

## 17. Refinement context fingerprint

For each refinement claim, fingerprint:
- abstract specification version;
- implementation model version;
- mapping version;
- auxiliary-variable definitions;
- imported modules;
- assumptions;
- dependency graph;
- trust/configuration context where relevant;
- tool/version;
- model configuration;
- symmetry/constraints if used;
- proof/check mode.

This extends the earlier proof-context work.

## 18. Refinement evidence classes

R0 — DESIGN_ONLY
R1 — MAPPING_DEFINED
R2 — STRUCTURALLY_CHECKED
R3 — MODEL_CHECKED
R4 — PROOF_CHECKED
R5 — IMPLEMENTATION_CORRESPONDENCE_TESTED
R6 — RUNTIME_EVIDENCE.

These are lifecycle states, not scores.

A higher level does not automatically imply all lower levels remain current if dependencies changed.

## 19. Counterexample requirements

A failed refinement attempt must preserve:
- implementation trace;
- mapped abstract trace;
- first divergence point;
- violated invariant/property;
- mapping/context fingerprint;
- tool/model configuration;
- relevant assumptions;
- whether divergence is an implementation defect, mapping defect, model defect or environment-assumption violation.

Never label a failed mapping merely as test failure.

## 20. Formal correspondence schema changes required

Existing correspondence work should eventually expand from:
DOMAIN → DOMAIN
STATE → STATE
COMPONENT → COMPONENT

to:
ABSTRACT_STATE → IMPLEMENTATION_STATE_PREDICATE
ABSTRACT_TRANSITION → IMPLEMENTATION_TRANSITION_SET

with:
- preconditions;
- postconditions;
- read/write sets;
- affected variables;
- linearization point;
- forbidden transitions;
- stuttering allowance;
- crash behavior;
- partition behavior;
- assumptions;
- evidence.

This is a future canonical schema change, not an implementation patch now.

## 21. Safety vs liveness boundary

A safety refinement can establish that the implementation never produces a behavior outside the abstract safety envelope, within modeled assumptions.

It does not automatically prove:
- eventual completion;
- availability;
- recovery within a deadline;
- absence of starvation;
- successful reconciliation.

Those require separate liveness/fairness models and evidence.

Lamport's documented Byzantine Paxos refinement work is a concrete example where safety refinements were checked while some liveness proofs remained outside the checked set. citeturn0search10

## 22. New invariants

REFINE-01: every implementation claim has an explicit abstraction level.
REFINE-02: every protected abstract transition has an implementation correspondence.
REFINE-03: implementation-internal steps may stutter only when mapped abstract safety state remains unchanged.
REFINE-04: linearization events are explicitly mapped.
REFINE-05: crash/restart behavior is part of the refinement boundary.
REFINE-06: partition behavior maps to explicit degraded/UNKNOWN states.
REFINE-07: stale fencing cannot map to current protected authority.
REFINE-08: internal ACK cannot map to external verified truth without required evidence.
REFINE-09: external UNKNOWN remains UNKNOWN through refinement.
REFINE-10: auxiliary variables must have an explicit role in the mapping.
REFINE-11: proof assumptions are versioned and fingerprinted.
REFINE-12: changed assumptions invalidate dependent refinement evidence.
REFINE-13: mapping completeness is separate from model-checking success.
REFINE-14: model checking is separate from implementation correspondence testing.
REFINE-15: safety refinement is separate from liveness/fairness evidence.
REFINE-16: a valid proof of a mis-modeled abstraction does not establish the intended system guarantee.
REFINE-17: counterexample divergence must identify the first abstract/implementation mismatch.
REFINE-18: no formal-equivalence claim may be asserted from structural name/state matching alone.

## 23. Result

The refinement problem is now a first-class architecture gate.

The clean architecture cannot be considered complete until:
ABSTRACT SAFETY SEMANTICS
→ CANONICAL STATE MACHINE
→ PROTECTED PROTOCOL
→ STORAGE/FENCING MODEL
→ IMPLEMENTATION
→ DEPLOYMENT

has explicit correspondence at every boundary.

## 24. Next research gate

Next: derive a canonical refinement contract template and apply it to:
1. Authorization ↔ Revocation
2. Execution ↔ STOP
3. Execution ↔ Recovery
4. Execution ↔ Update
5. Decommission ↔ Recovery
6. Evidence ↔ Invalidation

Then identify exactly which implementation observations are sufficient to establish each correspondence and which remain assumptions.

Architecture remains blocked.