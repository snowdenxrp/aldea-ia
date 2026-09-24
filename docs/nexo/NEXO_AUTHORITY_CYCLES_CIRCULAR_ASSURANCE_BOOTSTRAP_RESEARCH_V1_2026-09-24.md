NEXO - AUTHORITY CYCLES / MUTUAL DELEGATION / CIRCULAR ASSURANCE / REVOCATION / RECOVERY RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

QUESTION
How do we prevent an authority dependency cycle from bootstrapping itself, and how do we safely break the cycle when one component becomes revoked or UNKNOWN?

WEB CROSS-CHECKS
NIST SP 800-162 describes authorization as evaluating subject/object/operation/environment attributes against policies and relationships. This supports making authority dependency evaluation explicit rather than allowing an authorization result to implicitly serve as its own input. cite: turn0search0.
RFC 8693 treats delegation/token exchange as a distinct authorization interaction and allows a resulting credential to be more narrowly scoped for a downstream resource. This supports requiring a protected transition for each authority derivation rather than treating delegated authority as automatically inherited. cite: turn0search3.

CORE RESULT
Authority dependency graphs must be acyclic for any claim of ordinary authority derivation, unless a cycle is explicitly converted into a separate, independently bootstrapped coordination object.
Most importantly:
AUTHORITY_CYCLE != VALID_MUTUAL_SUPPORT.
An authorization result cannot establish the prerequisite authority that was required to produce that same result.

CIRCULAR BOOTSTRAP ATTACK
A requires B.
B requires C.
C requires A.
Naive evaluator:
A valid because B.
B valid because C.
C valid because A.

This is not evidence of authority. It is a circular assumption.

RULE 1 - NO SELF-SUPPORT
A protected authorization claim must not depend, directly or indirectly, on the authority state that the claim itself is attempting to establish.

Candidate:
DependencyGraph(AuthorizationClaim) must be well-founded over authority prerequisites.

RULE 2 - CLAIM != AUTHORITY
Even if A has evidence saying 'B authorized me', that evidence cannot manufacture B authority if B's authority depends on A.

RULE 3 - UNKNOWN CYCLES FAIL CLOSED
If the system cannot determine whether a dependency cycle is benign, it cannot promote the cycle to strong authority.

CYCLE CLASSIFICATION
C0 DAG - no authority cycle.
C1 benign informational cycle - components reference one another for metadata only; no authority derivation depends on the cycle.
C2 coordination cycle - mutual coordination exists, but authority comes from an external root.
C3 authority cycle - authority of each node depends on another node in the cycle.
C4 assurance cycle - each proof/claim relies on another claim in the cycle.
C5 mixed authority/assurance cycle - most dangerous because evidence and authority can recursively bootstrap.

Only C0-C2 may potentially be usable for protected authority, and C2 requires an independently established authority root and explicit semantics.
C3-C5 cannot produce ordinary strong authority without a separately established root/boundary.

ROOTEDNESS
Candidate AuthorityRoot:
- independently established trust/authority basis;
- current identity;
- current policy/invariant;
- current scope;
- current fence;
- current dependency closure;
- no unresolved circular prerequisite.

A cycle can be traversed only as a dependency graph if its authorization is rooted outside the cycle.

EXAMPLE
A and B coordinate a distributed operation.
A says B can coordinate.
B says A can coordinate.
This does not create initial authority.
A separately established root R grants the coordination domain authority.
Then A↔B is coordination, not authority bootstrap.

ROOTED CYCLE VS BOOTSTRAP CYCLE
BOOTSTRAP:
A → B → A, no external authority root.
DENY.

ROOTED COORDINATION:
Root R → CoordinationDomain C → A/B mutual coordination.
Potentially valid, provided the cycle does not expand the authority beyond R's envelope.

NO AMPLIFICATION THROUGH CYCLE
Even with root R:
EffectiveAuthority(A,B) ⊆ RootAuthorityEnvelope(R).
Mutual endorsement cannot create rights outside the root envelope.

CYCLE COLLAPSE
Candidate technique: collapse a strongly connected component (SCC) into an explicit Coordination/AuthorityDomain object.
Instead of:
A→B→C→A
represent:
SCC1 = {A,B,C}
and require:
Root → SCC1

The SCC itself receives one explicit authority envelope and fence.
Internal relationships become coordination dependencies, not independent authority grants.

IMPORTANT LIMIT
SCC collapse is not automatically sound.
If members have different scopes, trust roots, resource incarnations, or effect classes, collapsing them may hide incompatible assumptions.
Therefore SCC collapse requires a CompositionContract and an explicit common envelope.

MINIMAL COMMON ENVELOPE
Candidate common envelope is not a union.
It must be a contractually justified shared authority region.
If no safe common envelope exists:
UNKNOWN / QUARANTINE.

CYCLE WITH DIFFERENT SCOPES
A → R1.
B → R2.
C → R1+R2.
Cycle does not justify R1+R2.
Common safe scope may be INTERSECTION, or another explicitly defined contract.
Never infer union from circular endorsements.

CYCLE WITH DIFFERENT EPOCHS
A@G10.
B@G20.
C@G31.
Current timestamps do not create coherent authority.
Need a protected CompositionContext with explicit currentness for every mandatory dependency.

CYCLE WITH REVOCATION
A, B, C form a rooted coordination domain.
B is revoked.
All authority paths depending on B must be invalidated.
The remaining A/C state cannot silently recreate B's authority.
If the coordination domain itself requires all members:
Domain becomes invalid/quarantined.
If policy explicitly allows degraded membership:
Domain transitions to a weaker, separately defined state.

NO SILENT MEMBER DROPPING
Changing {A,B,C} to {A,C} is a new authority/coordination transition.
It cannot be treated as a local metadata edit.

REVOCATION CUT
Candidate cycle-breaking operation:
REQUEST REVOCATION
→ AUTHORITATIVE CUTOFF
→ INVALIDATE CYCLE-DEPENDENT CLAIMS
→ FENCE AFFECTED EFFECT PATHS
→ RECOMPUTE SCC / DEPENDENCY GRAPH
→ RECONCILE EXTERNAL EFFECTS
→ PUBLISH NEW DEGRADED/RESTORED STATE.

IF ORDER IS UNKNOWN
If revocation and a cycle-dependent authorization occur concurrently and order cannot be established, no strong new effect should be admitted unless the effect boundary independently rejects the stale cycle generation.

RECOVERY
Crash can resurrect a historical cycle snapshot.
Recovery must not treat the snapshot as current authority.
Sequence:
RESTORE HISTORY
→ ESTABLISH CURRENT ROOT
→ RECONSTRUCT CURRENT DEPENDENCY GRAPH
→ DETECT SCC/CYCLES
→ VALIDATE ROOTEDNESS
→ VALIDATE CURRENTNESS
→ VALIDATE FENCES
→ RECONCILE UNCERTAIN EFFECTS
→ PUBLISH AUTHORITY.

RECOVERY CYCLE
Recovery itself must not depend on the authority it is trying to recover.
Otherwise:
recovery requires A;
A requires recovery;
cycle.
Therefore recovery authority must come from a separately protected RecoveryContext/Fence.

BOOTSTRAP BOUNDARY
Candidate BootstrapAuthority:
minimum authority needed to establish identity, protected state, dependency graph and safety fence.
It cannot execute ordinary mission effects unless separately admitted.

SEPARATION
BOOTSTRAP AUTHORITY != MISSION AUTHORITY.
RECOVERY AUTHORITY != EXECUTION AUTHORITY.
COORDINATION AUTHORITY != EFFECT AUTHORITY.
ASSURANCE != AUTHORITY.

ASSURANCE CYCLE
A proof says B is safe.
B proof says A is safe.
Neither proof can establish the other's prerequisite if the claims are mutually dependent.
Candidate rule:
At least one foundational claim in every assurance dependency SCC must be independently established.
Otherwise the SCC is circular and cannot self-promote.

PROOF CONTEXT
Cycle analysis must include:
- claim IDs;
- proof contexts;
- assumptions;
- dependencies;
- trust roots;
- model/config versions;
- abstraction/refinement context;
- effect boundary;
- currentness.

ASSUME-GUARANTEE CYCLE
Assumption A: B is safe.
Assumption B: A is safe.
This is not sufficient unless the composition contract explicitly proves a fixed-point property under a sound abstraction.
Until formally established, classify as UNKNOWN.

FIXED POINT WARNING
A mathematical fixed point may exist without being an operationally safe state.
Operational authority still requires current identity, scope, policy, enforcement and external boundary.

FORMAL CANDIDATE
Authority dependency graph G=(V,E).
Edge u→v means authority of u requires v.
An authority claim is admissible only if:
1. its required dependency subgraph is well-founded, or
2. its SCC has an independently established root and an explicit sound composition contract, and
3. no SCC member can expand the common authority envelope beyond the root, and
4. all effect paths are fenced by the SCC's current authority generation.

NEW OBJECT: AuthorityRoot
Fields: root_id; trust basis; authority envelope; scope; policy/invariant versions; dependency closure; fence; epoch; bootstrap status; revocation state.

NEW OBJECT: AuthorityDependencyGraph
Fields: graph_id; nodes; edges; edge types; authority dependencies; assurance dependencies; coordination dependencies; generation; continuity; graph hash/fingerprint.

NEW OBJECT: AuthoritySCC
Fields: scc_id; member IDs; external roots; common envelope; composition contract; member dependencies; current generation; fence; invalidation status; recovery status.

NEW OBJECT: BootstrapAuthority
Minimal authority used only for identity, protected initialization, safety state and authority-root establishment.

NEW OBJECT: CycleResolutionContext
Fields: cycle_id; affected claims; cutoff; root; recomputed graph; fence generation; reconciliation status; degraded state; release criteria.

NEW INVARIANTS INV-CYC-01..42
01 authority dependencies must be explicit.
02 authority claims cannot self-authorize their prerequisites.
03 circular endorsement is not independent evidence.
04 C3-C5 authority/assurance cycles cannot self-promote.
05 UNKNOWN cycle semantics block strong authority.
06 authority cycles require an independent root or remain non-authoritative.
07 rooted cycles cannot exceed the root envelope.
08 SCC collapse requires explicit composition semantics.
09 SCC collapse cannot infer union authority.
10 incompatible scopes cannot be silently merged.
11 incompatible epochs cannot be silently merged.
12 incompatible resource incarnations cannot be silently merged.
13 incompatible policy versions require explicit compatibility.
14 revoked mandatory member invalidates dependent authority.
15 member removal is a protected transition.
16 cycle generation changes invalidate dependent capabilities.
17 stale cycle capabilities cannot cross a current fence.
18 cache cannot resolve cycle currentness.
19 recovery cannot restore historical cycle authority as current.
20 recovery authority must be independent of recovered mission authority.
21 bootstrap authority cannot silently become mission authority.
22 coordination authority cannot silently become effect authority.
23 assurance cycles require foundational claims.
24 assume-guarantee cycles require formal soundness before promotion.
25 fixed-point existence is not operational authorization.
26 cycle resolution requires authoritative ordering.
27 unknown revocation/order blocks strong effect admission.
28 external effects remain separately reconciled.
29 SCC membership is part of authority context.
30 graph version is part of capability currentness.
31 graph rollback cannot resurrect old authority.
32 graph changes propagate invalidation.
33 child delegation preserves cycle dependencies.
34 multi-parent composition and cycle semantics are separate contracts.
35 cycle break cannot silently broaden scope.
36 degraded cycle state must be explicitly typed.
37 cycle reformation requires a new protected transition.
38 common-mode trust dependencies remain visible.
39 formal refinement is required before implementation assurance.
40 actual SANY/TLC remains unexecuted.
41 implementation/runtime/deployment correctness remains unproven.
42 no cycle is treated as safe merely because the system converges operationally.

CANDIDATE SAFETY PROPERTY
No protected effect may be admitted under an authority dependency graph whose required authority is supported only by a circular chain without an independently established root and sound composition contract.

CANDIDATE REVOCATION PROPERTY
When a mandatory authority dependency in a rooted SCC is revoked or becomes UNKNOWN, every dependent capability must become non-current unless a separately defined degraded composition proves that the remaining authority is sufficient.

ARCHITECTURE CONSEQUENCE
The clean Nexo architecture now needs three distinct graph semantics:
1. AUTHORITY GRAPH - who grants whom authority;
2. ASSURANCE GRAPH - which claims/proofs depend on which claims;
3. EFFECT GRAPH - which paths can still produce external effects.
These graphs may overlap but must not be conflated.

DEEP RULE
A CYCLE MAY COORDINATE AUTHORITY, BUT IT MUST NEVER CREATE ITS OWN ROOT OF AUTHORITY.

NEXT ATTACK
BOOTSTRAP ROOT + MULTI-ROOT TRUST + ROOT ROTATION + ROOT COMPROMISE + RECOVERY + CAPABILITY REVOCATION. Question: if the authority root itself changes, is compromised, or is replaced, how do we prevent old authority from surviving through descendants, caches, delegated capabilities and restored snapshots?