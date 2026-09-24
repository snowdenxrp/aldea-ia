# Nexo Research Lineage and Open Gaps V1

Date: 2026-09-24
Status: CONTINUITY REGISTER

## Historical sequence
V1–V20 are preserved as a chronological design/audit lineage. They document progressively discovered issues in authority, STOP, leases, recovery, effect identity, linearization, formal correspondence, evidence, assumptions, toolchain limits, temporal reasoning, model coverage, and cross-tool corroboration.

The post-V20 research sequence is also preserved chronologically, including:
- proof cache/reproducibility;
- proof recheck/backend stability;
- proof status semantics;
- proof context integrity;
- assumption boundary and dependency recheck;
- context projection/imports;
- minimal proof context fingerprints;
- proof-obligation multiplicity and aggregation;
- temporal TLAPS boundary;
- safety/temporal composition;
- formalization self-check;
- TLC coverage/symmetry;
- TLC simulation versus exhaustive checking;
- finite-model temporal limits;
- temporal tool diversity.

## Distillation ledger
The clean architecture must create a per-item ledger mapping every important historical mechanism/finding to one of:
`CARRY_FORWARD | REWORK | REJECTED | HISTORICAL_ONLY | OPEN`.

Each entry must contain:
- source artifact/version;
- original claim/mechanism;
- audit finding;
- disposition;
- reason;
- resulting architectural requirement (if any);
- verification obligation;
- dependencies;
- evidence status.

## Known open gaps carried into the rebuild
The latest master audits identified unresolved or not-yet-runtime-closed areas including:
- actual SANY/TLC execution and toolchain validation;
- formal unification/refinement closure;
- linearizability/CAS equivalence at implementation level;
- runtime enforcement of safety gates/fences;
- fault injection and adversarial runtime testing;
- original semantic/data migration integrity work;
- external-world reconciliation under real failures;
- proof/evidence context freshness and invalidation;
- exact implementation-to-formal correspondence;
- temporal/liveness evidence under explicit model and fairness assumptions.

These are not declared failures merely because they are open; they are `OPEN` until the corresponding evidence gate is satisfied.

## Next research phase
Before constructing the clean architecture, continue the research needed to close or correctly bound these gaps. The output must feed the distillation ledger rather than mutate the architecture ad hoc.

## Rule
No open gap may be silently converted into an architectural guarantee. No historical PASS may be promoted to current verification without checking its present context and dependencies.

## Status
`LINEAGE PRESERVED / OPEN GAPS PRESERVED / DISTILLATION PENDING`
