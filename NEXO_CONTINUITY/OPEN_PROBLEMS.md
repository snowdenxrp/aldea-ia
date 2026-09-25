# OPEN PROBLEMS

1. Complete concrete binding-state enumeration for the ternary closure; AB52 covered role/order/protocol skeletons but not the full Cartesian binding domain. AB55 only exercised a 64-state bounded domain.
2. Complete executable lower-arity observation and FutureObs_PAA comparison over the concrete binding domain.
3. Specify protocol-specific continuation legality, especially LEASE_RENEW successor semantics, RETRY inheritance, and MUTATION/RECHECK ordering/result linkage.
4. Complete EventDAG edge-generation rules and enumerate all legal topological orders without inventing missing concurrency semantics.
5. Attempt deterministic reconstruction of any surviving higher-order relation under the complete future-observation criterion.
6. Broaden to all 286 ternary triples only after the interpreter and ternary gate are fully specified.
7. Escalate only justified survivors to four-event searches.
8. Resolve whether HistorySupport can be eliminated from the abstract kernel.
9. Resolve LeaseBridge versus AdmissionBindingClass merge.
10. Attack quotient congruence under every legal transition class.
11. Formulate refinement obligations and exact TLA+ abstract variables.
12. Only after closure criteria are satisfied begin TLC/TLAPS and implementation work.


## Continuity integrity problem — resolved as process safeguard

The chat-limit gap itself is now covered by CONTINUITY_V2_HANDOFF_2026-09-25.md. This does not resolve the underlying AB56 research problems; it prevents them from being lost, silently closed, or repeatedly re-proposed when a chat changes.
## AB57 — implementation gaps narrowed

The missing executable layer is no longer purely hypothetical: an explicit conservative harness now exists. The remaining open problems are semantic completeness, not absence of an execution scaffold. Do not treat the harness itself as proof or semantic freeze.

## AB58 — harness audit findings

AB57 code audit established that FutureObs_PAA currently emits only the immediate ADMIT observation; continuation legality for UNKNOWN events is suppressed rather than represented; EventDAG currently has no explicit predecessor edges; the context identity check is not discriminating under current known mutations; and lower_obs is not yet established as the canonical observational quotient. These are implementation-boundary findings, not protocol conclusions.


## AB61 — resolved/narrowed

- Resolved: historical AB55 source recovery and exact reproduction of all eight reported bounded result tuples.
- Narrowed: continuation UNKNOWN is now represented explicitly rather than as an empty continuation set.
- Narrowed: EventDAG ordering now distinguishes independent from unresolved interactions.
- Narrowed: UsedAdmissionContext is captured as an immutable identity-bearing record at ADMIT.

Still open: executing the AB61 repaired gate, complete post-ADMIT continuation legality, LEASE_RENEW/RETRY/MUTATION/RECHECK semantics, complete binding enumeration, canonical quotient congruence, EventDAG closure, HistorySupport elimination, bridge merge, and formal verification.
6. Broaden to all 286 ternary triples only after the interpreter and ternary gate are fully specified.
7. Escalate only justified survivors to four-event searches.
8. Resolve whether HistorySupport can be eliminated from the abstract kernel.
9. Resolve LeaseBridge versus AdmissionBindingClass merge.
10. Attack quotient congruence under every legal transition class.
11. Formulate refinement obligations and exact TLA+ abstract variables.
12. Only after closure criteria are satisfied begin TLC/TLAPS and implementation work.

## AB65 — execution and semantic composition gaps

- Execution remains unverified: no persisted AB65 gate output exists yet.
- UNKNOWN history events must not be represented as a single unchanged successor state when evaluating future observations; possible epistemic successor states must remain explicit until a justified merge exists.
- The current lower_obs includes event order; canonical observability of that order is not yet established.
- EventDAG legal topological-order closure remains partial.
- LEASE_RENEW, RETRY, MUTATION/RECHECK and complete binding domains remain unresolved.
\n\n## AB66 — research/architecture separation — 2026-09-25\n\n- Open: formalize the boundary between durable research history and candidate architecture so historical experiments cannot silently become requirements.\n- Open: define epistemic successor-set semantics for UNKNOWN history events before using FutureObs_PAA from an UNKNOWN history.\n- Open: derive canonical lower-arity observational equivalence; current implementation fields such as history order cannot be assumed observable.\n- Open: complete external state-of-the-art/runtime research relevant to partial observation, three-valued monitoring, provenance/identity/authorization, temporal continuation, and event-order semantics.\n- Open: define explicit architecture acceptance criteria and rejected-alternative records before integrated implementation.\n\n### Hard constraint added by AB66\nDo not assemble Nexo from the accumulated AB50–AB65 experimental artifacts. Integrated implementation is blocked until the research-to-architecture gate in AB66 is explicitly satisfied. This constraint does not delete or invalidate any prior research artifact.\n

## AB67 — external research findings — 2026-09-25

- Need a formal representation of unresolved successor relations that does not fabricate concrete states.
- Need to distinguish epistemic uncertainty about a successor from a genuinely known empty successor set.
- Need a transition/context-sensitive observational equivalence before calling any lower-arity projection a canonical quotient.
- Need to prove which observations are protocol-visible; internal history bookkeeping is not automatically observable.
- Need to determine whether a powerset, symbolic set, relation, or another epistemic representation is justified; this remains an architecture question, not an implementation decision.


## AB68 — epistemic successor semantics — 2026-09-25

- Need a formal distinction between epistemic unknown, specified nondeterminism, and known absence of successors.
- Need FutureObs_PAA aggregation semantics for known agreement, known disagreement, known-empty, and unresolved successor relation.
- Need counterexamples showing where collapsing these cases produces unsound conclusions.
- Need to determine whether an existing formalism (PTS, belief state, symbolic partial model, multi-valued semantics) is necessary or whether a smaller protocol-specific model suffices.
- Need to avoid architecture selection by analogy: external formalisms inform requirements but do not decide Nexo design.


## AB69 — unresolved semantic obligations — 2026-09-25

- Define evidence sufficient to establish successor-relation completeness.
- Define FutureObs_PAA aggregation for known-empty, known-unique, known-multiple, and unknown successor relation.
- Test whether same-observation known nondeterminism can be safely distinguished from epistemic UNKNOWN.
- Find counterexamples for every attempted collapse of these categories.
- Determine whether provenance/completeness must be part of the canonical quotient state.


## AB70 — FutureObs completeness — 2026-09-25

- Define protocol-specific successor completeness for each P_AA continuation event.
- Resolve LEASE_RENEW, RETRY, and MUTATION/RECHECK semantics before declaring definitive FutureObs results.
- Determine whether provenance/completeness must be observable for quotient purposes.
- Test AB70 candidate against adversarial protocol contexts without changing production/research harness code prematurely.
