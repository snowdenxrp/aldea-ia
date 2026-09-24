# Nexo Research Delta — TLC scope and configuration discipline

Date: 2026-09-23

## Research scope
Research-only continuation of the existing formal-verification direction. No new architecture was promoted.

## Findings
1. TLC is an explicit-state model checker for executable TLA+ specifications and is especially suited to finite/configured models.
2. A TLC result is scoped to the exact constants, configuration, invariants/properties, and model explored; it is not automatically a proof of arbitrary system sizes or the implementation.
3. The TLA+ toolchain distinguishes SANY parsing/semantic analysis from TLC model checking. Future verification records must identify which stage actually ran.
4. TLC configuration is itself part of the verification artifact: SPECIFICATION, constants, invariants/properties, and deadlock policy must be preserved with the model.
5. Symmetry reduction has assumptions that TLC does not independently prove; it must only be used when the relevant properties are invariant under the chosen renaming.
6. This strengthens the existing decision to make the canonical Nexo model finite, explicit, reproducible, and toolchain-verifiable before treating it as a formal verification result.

## Nexo implications
- `SANY_OK` means syntax/semantic analysis only.
- `TLC_OK` means the configured finite model completed without the selected invariant/property violations.
- Neither label means implementation equivalence.
- `LINEARIZABILITY_VERIFIED` requires a separate concrete refinement argument/test evidence; it must not be inferred from TLC alone.

## Status
`RESEARCHED / CONTRASTED / SAVED / DIRECTION PRESERVED`
