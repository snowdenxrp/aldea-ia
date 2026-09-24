# NEXO — Executable Safety-Claim / Dependency-Closure Contract
Fecha: 2026-09-24

## Status
DESIGNED / SCHEMA-DRAFTED.
The JSON Schema is created as an architecture artifact. No runtime validator is integrated and no production safety claim is made.

## Purpose
Turn common-mode analysis from prose into machine-readable admission input.

Schema:
`docs/nexo/schema/SAFETY_CLAIM_DEPENDENCY_CLOSURE.schema.json`

Git commit:
`7d05723135fe75ace2874a4f2ee37626c547c364`

## Required structure

Every critical safety claim identifies:
- protected function;
- assurance level I0-I5;
- components and their dependency references;
- dependency states;
- failure domains;
- trust roots;
- authority domains;
- policy/invariant versions;
- dependency graph version;
- unknown-dependency handling;
- review/revalidation expiry.

Dependency states:
`KNOWN | UNKNOWN | COMPROMISED | STALE | INVALIDATED`

Critical assurance levels I3-I5 cannot use a permissive unknown-dependency policy. The schema restricts them to BLOCK/HOLD/QUARANTINE.

## Admission algorithm

Conceptually:

1. Parse and schema-validate the claim.
2. Resolve component dependency references.
3. Compute transitive dependency closure.
4. Expand failure-domain membership.
5. Detect shared trust/authority/artifact/policy/clock/storage/network domains.
6. Mark correlated-control pairs.
7. Apply UNKNOWN/COMPROMISED/STALE/INVALIDATED policy.
8. Derive the maximum admissible assurance level.
9. Require explicit revalidation after material dependency changes.
10. Bind the resulting claim to the current update/recovery admission transaction.

## Important non-equivalence

Schema validity does NOT mean:
- dependency truth;
- independence;
- artifact security;
- correct policy;
- safe deployment;
- verified world state.

It only establishes that the claim is structurally representable and that certain prohibited combinations are rejected by the schema.

## Formal relation

`claim_schema_valid -> claim_is_well_formed`

but NOT:

`claim_schema_valid -> safety_verified`

## Next implementation boundary

The next implementation should be a pure, deterministic dependency-closure evaluator with no authority to execute effects. It should return:
- resolved closure;
- shared failure domains;
- correlated pairs;
- UNKNOWN/COMPROMISED findings;
- maximum admissible assurance;
- reasons;
- graph/version fingerprints.

Its output then becomes an input to the existing admission/recovery/update gates rather than becoming an authority source itself.

## Verification status

- Schema artifact: CREATED.
- Runtime integration: NOT IMPLEMENTED.
- Automated dependency resolver: NOT IMPLEMENTED.
- TLC: NOT RUN.
- Fault injection: NOT RUN.
- Production safety claim: NOT MADE.

## Deterministic evaluator implementation — 2026-09-24
Implemented the first non-authoritative evaluator:
`src/nexo/dependency_closure_evaluator.py`

Tests:
`tests/nexo/test_dependency_closure_evaluator.py`

Implementation commit: `8a9ca450e1e473f4478e1359f0004650ca59853d`
Test commit: `90090693cadcaa1b3e4a34dfc7eed1ca377a3ba8`

The evaluator currently handles:
- transitive dependency closure;
- missing dependency detection;
- dependency cycles;
- UNKNOWN/COMPROMISED/STALE/INVALIDATED states;
- shared failure-domain detection;
- shared trust-root detection;
- shared authority detection;
- conservative assurance ceiling calculation;
- explicit non-authority output fields.

The assurance ceiling is a conservative architecture heuristic, not a reliability proof or certification. It must eventually be parameterized against the deployment's actual independence evidence and formal model.

### Test execution status
A local test run was attempted, but the execution environment could not fetch the newly committed repository files because outbound DNS/network access was unavailable. Result: **tests not executed**. No passing test result is claimed.

This preserves the distinction:
IMPLEMENTED ≠ TESTED ≠ VERIFIED.

## New evaluator invariants
INV-691 — dependency evaluator cannot grant authority.
INV-692 — dependency evaluator cannot execute effects.
INV-693 — evaluator closure includes transitive dependencies or reports the unresolved edge.
INV-694 — missing/cyclic dependency references are blocking findings.
INV-695 — shared relevant failure domains/trust roots/authority are exposed as correlated pairs.
INV-696 — evaluator output cannot be treated as safety verification merely because schema validation succeeds.
