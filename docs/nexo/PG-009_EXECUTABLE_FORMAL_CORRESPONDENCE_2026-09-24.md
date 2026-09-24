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
| component → dependency_refs | `ComponentDependencyRefs` | MAPPED |
| dependency → dependency | `DependencyDependsOn` | MAPPED |
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

## Concrete graph checkpoint

A canonical small graph now exists in `docs/nexo/fixtures/PG-009_COMPONENT_DEPENDENCY_GRAPH_V1.json`.
The same graph is represented for the TLA+ sketch by
`docs/nexo/formal/PG-009_COMPONENT_DEPENDENCY_GRAPH_V1.cfg`.

The formal model now has explicit:
- component → dependency relation: `ComponentDependencyRefs`;
- dependency → dependency relation: `DependencyDependsOn`;
- dependency → semantic domain mapping: `DependencyDomain`;
- component failure-domain sets: `ComponentFailureDomains`;
- component trust-root sets: `ComponentTrustRoots`.

This closes the previous UNMAPPED component/dependency relation at the representation level. It does **not** yet prove that the executable recursive closure and formal closure are semantically equivalent: the TLA+ helper currently expands only one dependency hop beyond direct references.

The Python test suite now exercises the canonical fixture and checks the expected closure and shared trust-root correlation. Test execution is not claimed as passed because the current environment has not provided a working repository execution path.

## Next step

Replace the one-hop formal helper with an explicit finite transitive-closure relation and then compare the evaluator's closure/correlation results against the formal predicates on the same fixture, followed by TLC execution when tooling is available.
