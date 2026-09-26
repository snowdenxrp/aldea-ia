# NEXO — Lúmina boundary crash/race attack V1
Date: 2026-09-25
Status: RESEARCH ONLY. No V21 implementation.

Result: the current Lúmina topology cannot provide one linearization point for OwnerFence + PreparedIntent + handler mutation. persistPreparedIntent is a hook, while handlers mutate the in-memory simulation and persistState commits later. A crash between mutation and durable persistence can diverge admission/history from durable world state. stateRevision and filesystem locking are persistence/concurrency mechanisms, not ownership fences.

A future bounded local transactional store MAY combine protected admission with a durable local state transition, but only if owner/STOP/recovery/resource/policy predicates, prepared intent, resulting local state, and recovery metadata are covered by one explicitly defined atomic transaction and every protected mutation path uses it. This does not establish external-effect fencing or external-world outcome.

Crash/race conclusions:
- admission before handler: CONTROL_ADMITTED, not execution proof.
- handler mutation before durable commit: current topology has crash divergence risk.
- durable commit before response: outcome may be locally committed while caller response is lost; reconcile by operation/effect identity.
- STOP/owner transfer/recovery restart invalidate stale retry authority.
- resource replacement requires a new incarnation unless continuity is proven.
- stateRevision does not become OwnerFence by renaming.
- direct mutation bypass invalidates the atomic-boundary claim.
- UNKNOWN must survive restart and cannot become ABSENT merely from missing evidence.
- multi-resource atomicity requires an explicit shared transaction boundary; close-in-time writes are insufficient.

Decision: for current Lúmina, CONTROL_ADMITTED and EFFECT_COMMITTED remain separate. Future local transactional collapse is an architectural option only after formal refinement and crash testing. External effects remain separate regardless.

Verification: no formal verification; no implementation; no current CI PASS claimed.

DO-NOT-REPEAT: do not infer atomic handler+persist from temp-file rename; do not treat prepared intent as execution proof; do not treat filesystem lock as external fencing; do not collapse local commit with external outcome; do not implement V21.
