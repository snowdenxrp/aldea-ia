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
