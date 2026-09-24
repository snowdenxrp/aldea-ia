NEXO - ASSURANCE COMMIT / MULTI-DOMAIN ATOMIC REVALIDATION / CRASH RECOVERY RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

CORE FINDING
A global Assurance Epoch is not necessarily required. What is required is ONE AUTHORITATIVE COMMIT DOMAIN PER COHERENT ASSURANCE CLAIM.

External cross-checks: etcd transactions atomically evaluate multiple comparisons and apply one transaction, providing a useful concurrency-control analogy; Kubernetes resourceVersion detects stale updates at the authoritative API boundary, while cache/watch visibility can lag; TLA+ models state transitions and refinement mappings. These are research analogies, not implementation requirements. cite: turn0search1, turn0search0, turn0search2, turn0search36.

KEY DISTINCTIONS
ASSURANCE_COMMIT != PROOF_VERIFICATION
ASSURANCE_COMMIT != AUTHORITY_GRANT
ASSURANCE_COMMIT != WORLD_TRUTH

A coherent assurance commit means the authoritative system accepted a claim-context bundle under its composition rules.

CANDIDATE ASSURANCE COMMIT
Fields: assurance_commit_id, claim_id, bundle_id, context_identity, assurance_generation/vector, obligation closure, dependency closure, policy/invariant versions, boundary generations, topology/scope, resource/provider incarnations, continuity context, assumption graph, interaction hypergraph, evidence/proof references, invalidation generation, publication state, invalidation triggers, owner, linearization reference.

States: PREPARED -> COMMITTING -> COMMITTED -> PUBLISHED -> INVALIDATED -> SUPERSEDED.
PREPARED != COMMITTED.

COMMIT ASSURANCE predicate requires complete claim closure, coherent or explicitly compatible contexts, current dependencies/invalidation generation, matching policy/invariants, current boundary/resource incarnations, current assumptions, higher-order interaction coverage, discharged obligations, and no winning invalidation since the bundle was frozen.

MULTI-DOMAIN CASES
A) Disjoint complete closures + decomposable claim: independent commits may compose.
B) Shared invariant/dependency: common Assurance Commit domain or explicit cross-domain coordination required.
C) Unknown overlap: strong composition blocked.
UNKNOWN_OVERLAP != DISJOINT.

GENERATION VECTORS
A vector such as D1=12,D2=20 identifies dimensions but does not prove semantic coherence. It must be accompanied by policy, assumptions, boundary, topology, resource/incarnation, continuity and interaction context.
GENERATION_VECTOR != CONTEXT_SEMANTICS.

CRASH WINDOWS
W1 snapshot before preparation; W2 partial validation; W3 prepared; W4 committing; W5 durable commit before publication; W6 publication before cache propagation; W7 invalidation begins; W8 invalidation cutoff before stale observers update; W9 recovery after partial commit.
Only authoritative committed state determines whether a bundle was committed. Worker-local prepared records must not be synthesized into a current bundle after crash.

If commit is durable before crash, it remains historical authoritative assurance, but recovery must recompute currentness against the current invalidation generation and context. DURABLE_ASSURANCE_COMMIT != CURRENT_ASSURANCE.

CACHE
Cache publication is propagation, not authority. A stale cache cannot grant protected permission. Kubernetes provides a useful analogous pattern: stale resourceVersion writes are rejected while cache/watch state can lag the authoritative update. cite: turn0search0, turn0search2.

INVALIDATION AFTER COMMIT
A bundle committed at G20 and invalidated at G21 was not necessarily wrong at G20. It is historical truth that became stale. INVALIDATED != NEVER_VALID.

CLAIM DEGRADATION
A global claim may become UNKNOWN while independent lower claims remain current. Candidate status: VERIFIED, DEGRADED, UNKNOWN, INVALID, SUPERSEDED. Degradation must never create new authority.

SELECTIVE COMMIT
Compute claim closure, derive coordination domain, partition only where complete closure proves decomposition, establish independent Assurance Commit domains, and compose only where interactions are proven irrelevant or explicitly coordinated. Unknown overlap blocks strong composition.

CANDIDATE THEOREM (NOT FORMALLY PROVEN)
For claim C, if required obligations can be partitioned into domains with complete closures and pair/group interactions proven irrelevant or explicitly coordinated, independent Assurance Commit domains may compose without one global coordinator. If any cross-domain interaction can affect C and lacks authoritative ordering or compatibility, strong composition is unavailable.

CANDIDATE INVARIANTS INV-ACOM-01..40
01 prepared assurance is not committed assurance
02 component currentness does not imply bundle coherence
03 assurance commit is distinct from proof verification
04 assurance commit is distinct from authority
05 assurance commit is distinct from world truth
06 committed bundle has one authoritative context identity
07 component contexts must be equal or explicitly compatible
08 unknown compatibility blocks strong composition
09 unknown overlap blocks independent composition
10 generation vectors do not prove semantics
11 context snapshot is not authority
12 worker-local state is not committed assurance
13 partial persistence does not imply bundle commit
14 recovery cannot synthesize a bundle from surviving components
15 durable commit survives restart as historical fact
16 durable commit does not guarantee currentness after restart
17 invalidation after commit changes currentness, not historical existence
18 cache publication does not establish authority
19 stale cache cannot grant protected permission
20 publication must be ordered relative to invalidation cutoff
21 claim degradation must not create authority
22 lower claim currentness does not imply higher claim currentness
23 shared dependencies require shared impact analysis
24 higher-order interactions require higher-order context validation
25 disjointness must be proven, not inferred from deployment separation
26 claim decomposition is a proof obligation
27 independent commits require independent claim closure
28 composition must preserve temporal and causal constraints
29 recovery must re-establish current invalidation generation
30 recovery must re-establish resource and boundary incarnations
31 recovery must re-establish assumptions
32 assurance ABA must be prevented by continuity identity
33 rollback does not restore historical currentness
34 policy change can stale committed assurance without erasing historical truth
35 external contract drift invalidates dependent claims
36 toolchain/refinement changes may require recheck
37 assurance commit does not create external atomicity
38 strong publication requires coherent context
39 safe stale classification is preferable to false-current publication
40 formal correctness remains unproven until model checking/proof/refinement are executed

FORMALIZATION TARGET
Model D1,D2; obligations O1,O2,O3; shared and disjoint dependencies; policy/boundary/resource generations; two revalidators; context snapshots; PREPARED/COMMITTED/PUBLISHED; invalidation cutoff; crashes at every commit window; recovery; claim degradation; cache lag; higher-order interaction.
Candidate safety: ASSURANCE_COMMITTED(B) implies COHERENT_CONTEXT(B); CLAIM_CURRENT(C) implies REQUIRED_BUNDLE_COMMITTED(C); invalidation cutoff before old commit means old bundle is not current; crash during prepare means no synthetic current bundle; cache currentness is not authority unless bound to authoritative currentness.
No execution result is claimed.

ARCHITECTURE CONSEQUENCE
A new clean-architecture component is strongly justified: ASSURANCE COMMIT BOUNDARY. It is not a global coordinator by default. Its scope derives from claim interaction/obligation closure:
CLAIM -> OBLIGATION CLOSURE -> INTERACTION CLOSURE -> COORDINATION DOMAIN -> ASSURANCE COMMIT.
The Assurance Plane now contains Proof Context, Proof Result, Invalidation/Impact, Obligation Closure, Assurance Bundle Builder, Assurance Commit Boundary, Claim Publication, and Proof Reuse/Recheck. Authority remains separate.

NEXT ATTACK
ASSURANCE COMMIT FAILURE + SPLIT-BRAIN REVALIDATORS + STALE PREPARED BUNDLES + LEASE/FENCE LOSS + RECOVERY-OF-RECOVERY.
Question: if two builders prepare conflicting bundles, one loses its coordination lease, the other commits, then the first recovers from a stale checkpoint, can the stale prepared bundle ever cross the publication boundary? This attacks stale-prepared-state fencing and Assurance Commit ownership transfer.