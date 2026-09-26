# AB104.130 — overlapping same-step execution frontier — 2026-09-26

Previous: AB104.129.

Audit finding:
- AB104.129 closed sequential replay/stale-result handling, but the effect adapter still kept its idempotency cache locally per adapter instance.
- Two adapter instances sharing the same durable execution journal could both observe the key as absent and enter the handler concurrently.
- That means sequential idempotency was not sufficient evidence for true overlapping same-key safety.

Hardening:
- Added a shared in-process in-flight registry keyed by the shared execution journal and idempotency key.
- Before an effect handler is entered, the first caller claims the key in the shared in-flight registry; overlapping callers await the same promise and receive the same result.
- The durable execution journal remains the persistent result source: once a result exists, later adapter instances return it without running preconditions or the handler.
- In-flight claims are deliberately not written as durable results, so a process crash does not turn an unfinished execution into completion; restart still relies on the existing execution/outcome crash-window rules.

Regression added:
- Two separate effect-adapter instances share one execution journal.
- They invoke the exact same idempotency key with overlapping execution.
- The first handler blocks on a gate.
- The second caller must not execute its precondition or handler.
- Both callers receive the same completed result.
- The side-effect handler count remains exactly one and the journal contains exactly one result.

Persistence:
- Effect-adapter repair commit: af9c6f2eda3a0339ddeca750912da14c54c4c50c
- Overlap regression commit: 81696e225caa1aa7131324439cc4619b16534f9e
- AB104.130 checkpoint: this file.

Epistemic status:
- SOURCE REPAIR: PERSISTED.
- REGRESSION TEST: PERSISTED.
- FRESH CI/RUN VALIDATION: PENDING; the available GitHub workflow interface does not currently expose a fresh push-triggered run directly enough to claim it.
- Therefore this frontier is NOT yet declared fully validated.

Important scope:
- This hardening establishes overlapping same-key serialization for adapter instances sharing the same in-process execution journal.
- It does NOT prove distributed/multi-process linearizability. If two independent processes hold separate memory objects/journals, a real shared durable claim/transaction primitive is still required.

Next exact frontier:
- Obtain fresh CI evidence for AB104.130.
- Then audit the boundary between runtime mission state and the shared execution ledger: two concurrent runtime calls may each receive an executing mission snapshot even if the effect itself is serialized. Verify that the resulting mission/outcome memory cannot diverge or duplicate authoritative state.
- After that, assess whether cross-process durable locking is required by the actual deployment architecture before adding complexity.

DO-NOT-REPEAT:
- Do not call per-adapter in-memory idempotency a distributed concurrency guarantee.
- Do not persist an in-flight marker as a completed effect.
- Do not let a replay run preconditions or side effects when a durable result already exists.
- Do not declare concurrent safety from a sequential duplicate test.
- Do not claim cross-process linearizability without a shared transactional primitive.

CONTINUITY:
Resume from AB104.130 at overlap repair commit 81696e225caa1aa7131324439cc4619b16534f9e. First obtain fresh workflow/test evidence; then audit concurrent runtime mission-state convergence.
