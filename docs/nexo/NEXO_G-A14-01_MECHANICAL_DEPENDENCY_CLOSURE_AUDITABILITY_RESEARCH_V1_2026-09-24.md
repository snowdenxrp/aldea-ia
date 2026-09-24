# NEXO G-A14-01 — Mechanical Auditability of Dependency Closure
## Research Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / CODE STUDY / ADVERSARIAL
No implementation. No formal proof.

## 1. Question
Can protected dependency closure be mechanically audited from typed operation schemas, invariant/resource declarations, runtime bindings, and protected admission code?

## 2. Evidence
PostgreSQL SSI explicitly models predicate conflicts and may use coarser-grained predicate locks, accepting false positives rather than unsound conflict omission. This is evidence that a safety-preserving analyzer can deliberately over-approximate dependencies. cite turn0search0

FoundationDB exposes explicit read/write conflict ranges and notes that some exact ranges are not known until a read completes or until commit. It also warns that bypassing conflict ranges can make executions non-serializable if done carelessly. cite turn0search5 turn0search6

LLVM's Alias Analysis infrastructure provides a directly relevant code-analysis pattern: when an analysis cannot prove NoAlias, it returns conservative MayAlias/ModRef information rather than inventing certainty. cite turn0search12

Kubernetes admission documentation provides a runtime analogue: unknown/real side effects require reconciliation, and mutation/admission can be reinvoked because later admission stages may change the object. cite turn0search2 turn0search10 turn0search11

## 3. Core conclusion
A mechanically auditable Nexo footprint should be a **proof-carrying closure**, not merely a list.

Candidate claim:
FOOTPRINT_PROVEN_BOUNDED(O,C)

must reference:
- operation schema version;
- invariant/policy baseline;
- concrete target/resource/provider bindings;
- dependency rules used;
- protected code path/version;
- conservative closure construction;
- unresolved/unknown dependencies;
- evidence/proof artifact;
- validity epoch.

The protected core should accept the claim only if all required references match the current context.

## 4. Static analysis has a hard boundary
Static analysis can conservatively prove many structural dependencies:
- which resource classes an operation may access;
- which authority domains are required;
- which invariants are declared;
- which external provider classes can be called;
- which code paths can mutate protected state.

But arbitrary dynamic behavior can defeat complete static enumeration:
- data-dependent target selection;
- runtime-discovered provider resources;
- reflection/dynamic loading;
- external responses;
- policy/configuration loaded at runtime;
- plugins;
- migrations;
- environment-dependent resource topology.

Therefore a static result cannot be promoted to complete closure unless the execution model constrains these behaviors.

## 5. Safe analyzer contract
For a supported operation class, analyzer output should be one of:

PROVEN_BOUNDED(footprint)
PROVEN_BOUNDED_WITH_SUPERDOMAIN(footprint)
INCOMPLETE
UNSUPPORTED
ERROR

Only the first two may support independent coordination.

INCOMPLETE / UNSUPPORTED / ERROR
→ no independent protected commit.

This is preferable to returning an approximate list with an implicit confidence score.

## 6. Proof boundary
A useful architecture is:

PLANNER
→ typed operation
→ STATIC ANALYZER
→ candidate closure
→ RUNTIME BINDER
→ concrete closure
→ PROTECTED VALIDATOR
→ LINEARIZATION

The analyzer is not the authority.
The binder is not the authority.
The protected validator is the authority that decides whether the evidence is sufficient.

## 7. Dependency rule language
Candidate rules should be typed and versioned rather than encoded as undocumented conventions.

Examples:
- operation class X may access resource domain R;
- provider P may allocate only within domain D;
- invariant I covers resource class R;
- target selector S maps to domain D;
- external effect class E requires provider domain P;
- recovery class Q requires recovery domain R.

Each rule should have:
rule_id
rule_version
scope
inputs
output domain
assumptions
validity context
failure semantics.

## 8. Conservative closure algorithm
Conceptual algorithm:

1. Validate operation schema.
2. Load current policy/invariant/rule baseline.
3. Resolve declared domains.
4. Expand each domain through versioned dependency rules.
5. Resolve concrete target/resource/provider bindings.
6. Expand runtime-discovered dependencies.
7. If any edge is UNKNOWN, map to a proven containing super-domain or mark INCOMPLETE.
8. Compute transitive protected closure.
9. Compare closure against protected invariants and authority domains.
10. Produce a proof/reference bundle.
11. Protected validator checks bundle against current epoch/context.
12. Only then can independence be considered.

The algorithm is intentionally conservative.

## 9. Why code inspection matters
A schema can claim:
external_provider = P

while implementation code can dynamically invoke provider Q through:
- plugin registry;
- configuration lookup;
- indirect dispatch;
- dynamic tool selection.

Therefore protected audit must connect:
SCHEMA → CODE PATH → EFFECT CLASS → PROVIDER DOMAIN.

If that chain is not mechanically/auditably closed:
PROVEN_BOUNDED cannot be asserted.

## 10. Runtime observation is not proof of completeness
Observing provider P during one execution does not prove that Q could not be selected on another path.

Therefore:
OBSERVED_DEPENDENCY ≠ COMPLETE_DEPENDENCY_CLOSURE.

Runtime observations can strengthen evidence but cannot automatically replace structural closure proof.

## 11. Capability-oriented restriction
A strong way to make completeness tractable is to constrain execution so an operation can only access resources through capabilities issued from its validated footprint.

Then:
unlisted dependency
→ no capability
→ protected access denied.

This changes the problem from:
“Did analysis discover every possible dependency?”
to:
“Can execution reach a protected dependency without a capability derived from the validated closure?”

This is a candidate architectural direction, not yet selected.

## 12. Escape-hatch risk
Any privileged path that bypasses footprint capabilities can invalidate the closure argument.

Therefore bypass paths become part of the protected TCB and must be:
- enumerated;
- versioned;
- audited;
- fenced;
- included in dependency closure.

A hidden administrative/debug path is therefore a dependency-class risk, not merely an operational concern.

## 13. Dynamic expansion with capability restriction
If runtime discovers a new resource:
1. access request lacks current capability;
2. protected layer rejects or enters expansion protocol;
3. new dependency is resolved;
4. footprint epoch changes;
5. previous validation becomes stale;
6. revalidation occurs;
7. new capability may be issued only after protected validation.

This provides a concrete answer to the earlier TOCTOU problem.

## 14. External providers
For external providers, static closure can generally prove provider class/domain, not external world truth.

Therefore:
PROVIDER_DOMAIN_COVERAGE
does not imply
EXTERNAL_EFFECT_OUTCOME.

The latter remains under the existing effect identity + reconciliation + evidence architecture.

## 15. Policy and invariant changes
A proof bundle must be bound to:
PolicyBaseline
InvariantBaseline
VersionSet
FootprintEpoch
AuthorityEpoch where relevant.

Any relevant change invalidates the bundle.

## 16. Migration
Migration rules must preserve closure identity:
old representation → new representation
must retain:
operation/effect identity
dependency domain
authority context
VersionSet
lineage
unknown/pending state.

A migration that preserves data but loses dependency closure is not semantically safe.

## 17. Compaction
A terminal summary must retain enough information to reconstruct the protected closure needed by any surviving claim.

Therefore compaction eligibility requires:
terminal verification
AND dependency closure preserved
AND no unresolved dependency
AND no active recovery/migration/reconciliation dependency.

## 18. Adversarial audit
A. Analyzer omits dynamic provider:
INCOMPLETE → block.

B. Analyzer sees provider class but not resource subdomain:
use proven super-domain or block.

C. Runtime plugin selects unmodeled provider:
capability denial / quarantine.

D. Policy adds a new shared invariant:
proof bundle invalidated.

E. Code path changed without rule-version update:
proof bundle invalidated or CI/audit gate rejects.

F. Runtime observation suggests dependency absent:
does not prove absence.

G. Debug/admin bypass:
must be in TCB/closure or structurally impossible.

H. Analyzer crashes:
ERROR → block.

I. Rule engine unavailable:
no independent commit.

J. Dependency rule itself changes:
new rule version invalidates old proof bundles.

## 19. New contracts
PSC-65 — Proof-Carrying Footprint
PSC-66 — Analyzer Non-Authority
PSC-67 — Conservative Analysis Failure
PSC-68 — Code/Schema Closure
PSC-69 — Runtime Observation Non-Completeness
PSC-70 — Capability-Bound Protected Access
PSC-71 — Bypass Path TCB Inclusion
PSC-72 — Proof Bundle Context Binding

## 20. New invariants
INV-GA14-01-78:
A footprint cannot be PROVEN_BOUNDED without a context-valid closure argument.

INV-GA14-01-79:
Analyzer uncertainty cannot be converted into independent authorization.

INV-GA14-01-80:
Runtime observation alone cannot prove dependency completeness.

INV-GA14-01-81:
Protected dependencies outside the validated capability closure must be inaccessible or trigger protected revalidation.

INV-GA14-01-82:
Undocumented privileged/bypass paths cannot exist outside the protected TCB model.

INV-GA14-01-83:
Changing dependency rules, policy, invariants, code path, or VersionSet invalidates affected proof bundles.

INV-GA14-01-84:
Analyzer/runtime infrastructure failure cannot authorize independent protected commit.

## 21. Mini-audit
No contradiction found with prior G-A14-01 results.

Important refinement:
The architecture should not attempt to prove arbitrary dynamic dependency completeness through static analysis alone.

A more tractable safety architecture is:
STATIC CONSERVATIVE CLOSURE
+
RUNTIME CONCRETE BINDING
+
CAPABILITY-BOUND ACCESS
+
PROTECTED VALIDATION
+
FAIL-CLOSED UNKNOWN HANDLING.

This does not yet prove implementability or formal correctness.

## 22. Status
Mechanical auditability: DESIGN REFINED.
Static completeness for arbitrary dynamic behavior: NOT ASSUMED.
Capability-bound access: CANDIDATE, NOT SELECTED.
Proof-carrying footprint: CANDIDATE, NOT CANONICAL.
Formal verification: NOT PROVEN.
Implementation: NOT STARTED.

Next research target:
Study capability-bound access and authority attenuation in real systems/code, especially whether capabilities can enforce the footprint boundary without becoming a new unbounded TCB or creating TOCTOU/revocation failures.
