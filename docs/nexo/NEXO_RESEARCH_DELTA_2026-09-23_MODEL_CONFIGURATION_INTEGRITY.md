# Nexo Research Delta — model configuration integrity

Date: 2026-09-23

## Research-only scope
Cross-check of the existing formal-verification direction. No new architectural stage or V21 implementation was introduced.

## Findings
1. TLC configuration is part of the verification artifact. A `.cfg` normally needs an explicit `SPECIFICATION`; constants, invariants, temporal properties, constraints, symmetry, and deadlock policy are also configuration inputs. cite-source-placeholder
2. `SYMMETRY` can substantially reduce state space, but TLC does not prove that the declared symmetry is sound. An unsound symmetry declaration can hide errors. Therefore Nexo should not use symmetry in a critical verification model until symmetry assumptions are explicitly justified.
3. Safety and liveness should be separated into distinct model configurations when practical. This reduces ambiguity about what a passing run establishes and avoids treating a safety run as a liveness result.
4. Small finite models are useful for finding concurrency/state-machine defects, but a passing small model does not establish correctness for arbitrary cardinalities.
5. The verification record should therefore bind: spec hash, cfg hash, constants, enabled invariants, enabled temporal properties, symmetry/constraint choices, deadlock policy, tool version/runtime, command, exit result and output artifact.
6. NIST SP 800-193 reinforces the architectural distinction between protection, detection and recovery roots/chains of trust. This remains consistent with keeping safety/recovery authority separate from ordinary execution authority.

## Concrete consequence for Nexo
Before any future `TLC_OK` label, the verification artifact must make the exact checked model reproducible. A configuration mismatch is not a cosmetic difference; it changes the claim's scope.

## Status
`RESEARCHED / CONTRASTED / SAVED / NO DIRECTION CHANGE`
