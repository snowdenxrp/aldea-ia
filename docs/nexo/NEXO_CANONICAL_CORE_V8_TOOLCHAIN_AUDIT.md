# V8 Toolchain Audit — 2026-09-23

Attempted to establish an executable SANY/TLC path for the bounded V8 kernel.

## Environment result

The available GitHub/file tooling can persist and inspect artifacts, but it does not expose a Java/command-shell execution environment capable of invoking `tla2tools.jar`. Therefore SANY/TLC cannot be executed through the currently available tool surface.

No claim of syntax validity or model-check success is made.

## Static preflight obligations

Before any future TLC run, V8 requires:
1. `Spec` to resolve to `Init /\\ [][Next]_vars`.
2. Every operator referenced by the CFG to exist in the module.
3. All constants in the CFG to be bound.
4. All state variables to be assigned by Init.
5. Every action in Next to assign every primed variable or leave it unchanged.
6. Invariants to be state predicates over declared variables.
7. Fingerprint and provenance domains to remain finite.

## Important model issue discovered during preflight

The current `NoCommitWithoutAuthorization` invariant is intentionally expressed as `COMMITTED => ~releaseAuth.valid`, which only describes the post-commit state. It does not itself prove that every transition into COMMITTED consumed a valid authorization. The `Commit` action guard does enforce this transition-level obligation. Future correspondence should distinguish state invariants from transition guards.

## Decision

Do not fabricate a TLC result. Keep V8 as a bounded specification candidate. The next formal step is a local/container-based SANY/TLC execution if a toolchain becomes available, followed by counterexample-driven repair. Until then, continue static semantic auditing rather than declaring V8 verified.
