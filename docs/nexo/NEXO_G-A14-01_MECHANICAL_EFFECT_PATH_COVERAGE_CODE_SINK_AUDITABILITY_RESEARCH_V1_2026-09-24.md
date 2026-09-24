# NEXO G-A14-01 — Mechanical Effect-Path Coverage and Code-Sink Auditability
## Research + Code Study Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / REPOSITORY CODE STUDY / ADVERSARIAL
No implementation of the Nexo runtime. No formal proof.

## 1. Question

Can Effect-Path Coverage be mechanically checked against repository code and runtime topology without making a false completeness claim?

## 2. Research evidence

CodeQL supports global data-flow/path queries that model sources, sinks, calls, returns, fields and additional flow steps. Its JavaScript/TypeScript documentation explicitly distinguishes local data flow from global analysis and notes that global analysis is more powerful but can be less precise and may produce spurious flows; complete computation over an entire program is generally not feasible, so queries define sources and sinks of interest. cite turn0search0 turn0search1 turn0search2

Semgrep's taint model likewise requires explicit sources, sinks, sanitizers and propagators. This is useful for targeted closure checks but is a model supplied to the analyzer, not an automatic proof that every possible sink exists. cite turn0search3

OWASP describes static analysis as an aid for identifying security-relevant code and explicitly notes that automatically finding many application-security flaws with high confidence is beyond the state of the art. cite turn0search12

Therefore a mechanical analyzer can produce strong evidence of:
- known sink discovery;
- known source-to-sink paths;
- known imports/call sites;
- known subprocess/network/device APIs;
- declared capability boundaries;
- missing mappings;
- changed code requiring re-audit.

It cannot by itself establish universal semantic completeness over arbitrary dynamic behavior.

## 3. Repository code study

The current repository is primarily the older Lúmina simulation codebase, not a deployed Nexo runtime.

The Nexo-specific executable code currently visible under src/nexo/ consists of analysis/checking components rather than an effect executor or protected gateway:
- dependency_closure_evaluator.py
- formal_correspondence_checker.py

package.json remains a JavaScript/Node project whose main test script executes the existing simulation/audit test suite; it does not define a Nexo runtime or protected-effect gateway.

### 3.1 Dependency closure evaluator

The evaluator is explicitly non-authoritative and states that it cannot grant authority or execute effects.

It already provides useful mechanisms:
- deterministic canonical fingerprinting;
- dependency graph traversal;
- cycle detection;
- missing dependency detection;
- dependency state classification;
- failure-domain correlation;
- trust-root correlation;
- authority-domain correlation;
- conservative assurance ceiling;
- explicit authority_granted: false;
- explicit effects_executed: false.

This is compatible with the Nexo rule:
ANALYZER != AUTHORITY.

However, its graph is claim-supplied. It evaluates the graph it receives; it does not discover every runtime dependency from source code or deployment topology.

### 3.2 Formal correspondence checker

The checker is also explicitly non-proof-producing.

It detects:
- unmapped components;
- unmapped dependency relations;
- unmapped failure domains;
- unmapped trust roots;
- unmapped authority relations;
- unmapped dependency domains/states;
- unmapped assurance levels;
- partial formal coverage.

It deliberately returns formally_equivalent: false.

This is exactly the right failure posture for the current phase.

## 4. Important distinction discovered

There are at least four different questions:

Q1 SOURCE INVENTORY:
What code locations can initiate or reach a candidate effect?

Q2 PATH REACHABILITY:
Which source-to-sink paths are represented by the analyzer?

Q3 ENFORCEMENT COVERAGE:
Which paths actually cross a protected boundary?

Q4 SEMANTIC COMPLETENESS:
Can we prove that no unmodeled path can create the safety-relevant effect?

CodeQL/Semgrep can substantially help Q1-Q3.

Q4 remains a stronger claim requiring structural restrictions, closed execution environments, typed capability boundaries, build/deployment constraints, and/or a proof argument.

## 5. New coverage pipeline

Candidate pipeline:

REPOSITORY
→ parser/indexer
→ candidate sink inventory
→ candidate source inventory
→ data-flow/path analysis
→ enforcement-boundary mapping
→ runtime/deployment topology mapping
→ dynamic-loading/plugin/subprocess analysis
→ EffectPathCoverageRecord
→ protected validation
→ coverage claim

The analyzer must never directly convert its result into authority.

## 6. Sink taxonomy

Candidate safety-relevant sinks:

S1 Network:
- HTTP clients
- raw TCP/UDP
- WebSocket
- RPC
- message queues
- cloud/provider SDKs

S2 Process:
- subprocess
- shell
- command execution
- dynamic executable loading

S3 Device:
- raw device access
- hardware APIs
- serial/USB/GPU/device drivers

S4 Filesystem/control:
- control sockets
- privileged filesystem writes
- configuration stores
- service-manager interfaces

S5 Provider:
- external API SDKs
- database mutation APIs
- cloud control-plane APIs
- payment/order/actuation APIs

S6 Runtime:
- plugin dispatch
- dynamic module loading
- reflection/dynamic import
- generated clients
- background workers

S7 Administrative:
- debug endpoints
- migration utilities
- recovery utilities
- maintenance scripts

The taxonomy is a discovery aid, not a complete universal list.

## 7. Why grep alone is insufficient

Simple lexical searches can find obvious calls, but aliasing and abstraction can hide the sink:

wrapper()
→ adapter()
→ client.send()

or:

provider = loadProvider(config)
provider[method](payload)

or:

queue.push(command)
worker.consume(command)
provider.execute(command)

Therefore sink closure requires:
- import/module resolution;
- call graph;
- data-flow;
- alias/type tracking where available;
- generated-code inventory;
- configuration resolution;
- runtime registration inventory.

## 8. Dynamic code is a hard boundary

Examples:
- dynamic imports;
- plugin directories;
- reflection;
- generated code;
- runtime-loaded modules;
- provider names from configuration;
- arbitrary subprocesses;
- scripts interpreted at runtime.

If the analyzer cannot establish a bounded set of possible sinks, the result should be:

SINK_SET = UNKNOWN

not:

SINK_SET = EMPTY.

This directly follows the existing Nexo rule:
UNKNOWN dependency != NO dependency.

## 9. Generated code

Generated clients create another closure obligation.

Source repository may contain:
schema
→ generator
→ generated client
→ provider call.

Auditing only hand-written source can miss the generated sink.

Candidate record:
generator_version
schema_version
generated_artifact_digest
provider_binding
generation_reproducibility
coverage_status.

If generated output is not reproducible or its provenance is unknown, affected coverage becomes RESTRICTED/UNKNOWN.

## 10. Subprocesses

A subprocess boundary can enlarge the effect surface dramatically.

For:
spawn(tool, args)

the analyzer needs to resolve:
- executable identity;
- executable provenance;
- argument binding;
- inherited capabilities;
- inherited environment;
- inherited file descriptors;
- network access;
- device access;
- IPC/control sockets.

A wrapper process does not automatically make its child safe.

## 11. Runtime topology

Static code is insufficient for distributed effects.

Need a second graph:

CodePathGraph
+
RuntimeEffectTopology

Runtime topology should include:
- process/container identity;
- network routes;
- provider endpoints;
- service accounts;
- device ownership;
- namespaces;
- capability grants;
- firewall/ACL boundaries;
- sidecars/brokers;
- direct alternate paths;
- emergency channels.

A path is covered only if both code and runtime topology support the coverage claim.

## 12. Build-time vs runtime closure

A strong architecture should prefer:
BUILD CLOSURE
→ DEPLOYMENT CLOSURE
→ RUNTIME CLOSURE

If runtime can dynamically acquire a new privileged dependency that was not present in the build/deployment closure, the system must require:
- protected capability issuance;
- footprint expansion/revalidation;
- or fail closed.

## 13. Proposed analyzer result classes

The analyzer should not return simply PASS/FAIL.

Candidate:
PROVEN_BOUNDED
PROVEN_BOUNDED_WITH_SUPERDOMAIN
KNOWN_PATHS_INCOMPLETE
DYNAMIC_SINKS_UNRESOLVED
RUNTIME_TOPOLOGY_INCOMPLETE
GENERATED_CODE_UNVERIFIED
PLUGIN_SET_UNBOUNDED
SUBPROCESS_SCOPE_UNKNOWN
EXTERNAL_PROVIDER_BOUNDARY_UNKNOWN
ANALYSIS_ERROR

Only the first two could potentially support independent coordination under the previously defined conservative-footprint rules.

## 14. Mechanical completeness is itself claim-scoped

A claim should say:

COVERAGE_CLAIM:
- scope;
- repository commit;
- analyzer version;
- query/rule-set version;
- language/toolchain version;
- build configuration;
- generated-artifact set;
- deployment topology version;
- runtime assumptions;
- discovered sinks;
- unresolved categories;
- proof/evidence bundle;
- expiry/invalidation conditions.

Thus:
"we scanned the repository"
is not a sufficient claim.

## 15. Adversarial cases

A. Direct SDK call hidden behind wrapper.
→ data-flow/path analysis required.

B. Provider selected from runtime configuration.
→ dynamic sink set may be unknown.

C. Plugin loaded from directory.
→ plugin set must be bounded/proven or treated unknown.

D. Child process inherits network capability.
→ parent gateway does not imply child mediation.

E. Pre-existing socket survives policy change.
→ handle closure required.

F. Generated client changes after schema update.
→ generated artifact provenance/version invalidates coverage.

G. Runtime sidecar bypasses intended gateway.
→ topology analysis required.

H. Emergency binary has direct device access.
→ separate protected boundary/TCB entry.

I. Migration script writes provider directly.
→ administrative path must be included.

J. Analyzer crashes or has unsupported syntax.
→ analysis error cannot be interpreted as no path.

K. New dependency added without analyzer model.
→ UNKNOWN, not safe.

L. Code path is unreachable under current deployment but executable after configuration change.
→ deployment context must be part of the claim.

## 16. New contracts

PSC-97 — Mechanical Sink Inventory
PSC-98 — Analyzer Non-Completeness
PSC-99 — Static/Runtime Closure
PSC-100 — Dynamic Sink Unknown
PSC-101 — Generated Artifact Closure
PSC-102 — Subprocess Capability Closure
PSC-103 — Runtime Topology Binding
PSC-104 — Analysis Error Fail-Closed

## 17. New invariants

INV-GA14-01-109:
Analyzer output cannot grant authority.

INV-GA14-01-110:
Failure to model a candidate effect sink cannot be interpreted as absence of the sink.

INV-GA14-01-111:
Unknown dynamic sink sets prevent universal effect-path coverage claims.

INV-GA14-01-112:
Generated effect clients are part of the code-path closure.

INV-GA14-01-113:
Subprocesses capable of producing safety-relevant effects are separate effect-path nodes.

INV-GA14-01-114:
Runtime topology is part of effect-path coverage for distributed effects.

INV-GA14-01-115:
Analysis failure or unsupported syntax cannot produce a positive coverage result.

INV-GA14-01-116:
Coverage claims are invalidated by changes to repository commit, analyzer/rules, build, generated artifacts, deployment topology, provider binding, or relevant runtime assumptions.

## 18. Mini-audit

The current repository code study agrees with the architecture.

Strong positive:
The existing Nexo analyzers already embody the desired separation:
analysis can compute closure and detect gaps, but cannot grant authority or execute effects.

Important limitation:
They currently analyze explicit claim graphs. They do not yet mechanically derive complete effect-path closure from the whole repository and runtime.

Therefore we must not label current dependency-closure tooling as a universal effect-path verifier.

## 19. Status

Mechanical sink inventory: DESIGNABLE.
Static path analysis: DESIGNABLE.
Runtime topology closure: OPEN.
Dynamic plugin closure: OPEN.
Generated-code closure: OPEN.
Subprocess closure: OPEN.
Universal completeness: NOT PROVEN.
Authority from analyzer: REJECTED.
Implementation of protected gateway: NOT STARTED.

Next research target:
Study how repository/build/deployment controls can make the effect-path set structurally bounded, then test the concept against generated code, plugins, subprocesses and configuration-selected providers. The objective is to replace as much UNKNOWN as possible with mechanically bounded closure without ever converting analyzer uncertainty into authority.
