# PG-009 TLC Verification Runbook

## Purpose
Run the bounded PG-009 migration/concurrency model with TLC and preserve the result as evidence.

## Model
- Spec: `PG-009_MIGRATION_CONCURRENCY_SKETCH_2026-09-23.tla`
- Config: `PG-009_MIGRATION_CONCURRENCY_SKETCH_2026-09-23.cfg`
- Fence policy in the bounded run: `INVALIDATE`
- Records: `{r1, r2}`

## Tooling
The TLA+ project documents `tla2tools.jar` as the command-line distribution containing TLC and SANY; Java 11+ is required by the current project tooling. TLC is the explicit-state model checker for executable TLA+ specifications. See the official TLA+ tooling documentation.

## Local commands
```bash
java -cp tla2tools.jar tla2sany.SANY docs/nexo/formal/PG-009_MIGRATION_CONCURRENCY_SKETCH_2026-09-23.tla
java -cp tla2tools.jar tlc2.TLC \\
  -config docs/nexo/formal/PG-009_MIGRATION_CONCURRENCY_SKETCH_2026-09-23.cfg \\
  docs/nexo/formal/PG-009_MIGRATION_CONCURRENCY_SKETCH_2026-09-23.tla
```

## Evidence rule
A clean TLC result is evidence only for the bounded model/configuration/tool version actually executed. It does not prove the production implementation correct. A violation must be preserved with its complete TLC trace and model/tool identity.

## Current run status
**NOT RUN IN THIS ENVIRONMENT.** The environment has Java 21, but no local `tla2tools.jar`, and outbound package download is unavailable. Therefore no TLC result is claimed here.

## Next verification matrix
1. INVALIDATE + 2 records.
2. BLOCK_WRITES + 2 records.
3. CATCH_UP + 2 records.
4. Each policy with crash before/inside/after fence.
5. Duplicate/replayed operation identities.
6. Late write immediately before commit.
7. Late write immediately after authority change.
8. At least 3 records to increase interleaving/state-space pressure.
9. Preserve every counterexample as a regression trace.
