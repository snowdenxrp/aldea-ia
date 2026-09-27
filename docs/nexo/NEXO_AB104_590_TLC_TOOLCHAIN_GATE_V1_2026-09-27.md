# NEXO — AB104.590 — TLC tooling / reproducible execution gate

Date: 2026-09-27
Status: TOOLCHAIN RESEARCH — MODEL STILL UNVERIFIED
Production implementation: NONE.

## Research
Official TLA+ tooling states Java 11+ is required and `tla2tools.jar` contains SANY and TLC. It documents:
`java tla2sany.SANY -help`
and
`java tlc2.TLC -help`.
It also documents building the jar from source with Ant when a local toolchain is available. citeturn0search0turn0search1

The current upstream repository identifies v1.8.0 Clarke as the current pre-release channel and notes that its release assets can be updated; therefore a future Nexo verification record must identify the exact tool artifact, not merely say “TLC 1.8.0”. citeturn0search0turn0search3

## Repository inspection
Canonical repo currently has four GitHub Actions workflows:
- ab65-gate.yml
- lumina-longevity-audit-v2.yml
- lumina-simulation.yml
- nexo-deterministic-tests.yml

There is no existing TLC workflow found in `.github/workflows`.

A repository code search for `tla2tools` returned no indexed matches.

## Execution status
AB104.589 already established:
- Java 21 available locally.
- `tla2tools.jar` unavailable locally.
- direct network retrieval was blocked by DNS/network restrictions.

AB104.590 therefore does NOT claim SANY/TLC execution.

## Required evidence package before any verification claim
1. Exact `tla2tools.jar` bytes.
2. SHA-256 of that jar.
3. Exact Java major/minor/build.
4. Exact TLA+ spec commit SHA.
5. Exact CFG commit SHA.
6. Exact SANY command + complete output.
7. Exact TLC command + complete output.
8. State count / depth / worker configuration.
9. All invariant violations or explicit no-violation result.
10. If a run fails to parse/execute, preserve that failure rather than modifying the model silently.

## Important methodological rule
Do NOT add a GitHub Actions TLC workflow merely to make the gate appear verified. A CI workflow is useful only after the tool artifact and model contract are deliberately pinned and the run's evidence semantics are defined.

## Closure
AB104.590 closes the tooling-provenance question enough to define the execution evidence contract, but the model remains UNVERIFIED because TLC has not actually run.

## Next exact step
AB104.591 — inspect the AB104.589 TLA+ source itself for semantic/modeling defects before the first TLC run; specifically audit operator syntax, state-variable domains, compensation typing, stale-admission handling, and whether the current Safety invariants actually express the intended AB104 invariants.