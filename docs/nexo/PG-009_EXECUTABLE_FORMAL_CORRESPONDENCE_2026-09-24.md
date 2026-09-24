# PG-009 — Executable ↔ Formal Correspondence — 2026-09-24

## Purpose

Keep the executable dependency-closure evaluator and the TLA+ recovery/common-mode sketch aligned without claiming formal equivalence.

## Current correspondence

| Executable concept | Formal representation | Status |
|---|---|---|
| dependency domain | `Domains` | mapped vocabulary |
| KNOWN / UNKNOWN / STALE / INVALIDATED | `dependencyState` | mapped vocabulary |
| COMPROMISED | `compromisedDomains` | mapped vocabulary |
| I0–I5 | `assuranceState` | partial semantic mapping |
| component → dependency_refs | no explicit formal relation | UNMAPPED |
| transitive dependency closure | no explicit formal relation | UNMAPPED |
| graph fingerprint | no formal equivalent | UNMAPPED |
| evaluator findings | no complete formal taxonomy | UNMAPPED |
| release eligibility | `AuthorizeRelease` preconditions | partial |

## Safety rule

A mapping entry is not evidence of equivalence. Any UNMAPPED or PARTIAL element is an explicit correspondence gap.

The checker reports these gaps as findings. It never grants authority and never executes effects.

## Defects discovered

During correspondence work, a reachability defect was found in the Quarantine transition: the previous precondition required QUARANTINED before the transition could establish QUARANTINED. It was corrected to ENFORCED → QUARANTINED.

A contradictory TLA+ constraint was subsequently found in the same action: the action assigned `stopState'` while also declaring `stopState` UNCHANGED. This was removed.

The executable evaluator also contained an unsupported dependency-domain test for `authority`; it was aligned with the schema's actual domain enum.

## Verification status

- Architecture: implemented/documented.
- Correspondence schema: implemented.
- Correspondence checker: implemented.
- TLA+ correspondence vocabulary: implemented.
- TLA+ model: NOT TLC-VERIFIED.
- Cross-model semantic equivalence: NOT PROVEN.
- Automated Python test execution: not claimed unless an execution environment produces the result.

## Next step

Add explicit component-to-domain and dependency-to-dependency relations to the TLA+ model. Then create the same small fixtures for Python and TLA+ and compare closure, compromise, correlation, and release eligibility behavior.
