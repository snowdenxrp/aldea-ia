# AB61 — SEMANTIC REPAIR / REPRODUCIBILITY CHECKPOINT — 2026-09-25

Status: RESEARCH ONLY / REPAIR IN PROGRESS

## 1. Evidence recovered

The AB55 source/configuration was recovered from the repository itself:
NEXO_CONTINUITY/AB55_FINITE_RESEARCH_INTERPRETER.py

This materially closes the AB55 reproducibility gap identified by AB59/AB60. The historical AB55 report remains immutable; the source is now directly available for reproduction.

AB54 canonical action vocabulary was recovered from the AB54 commit:
Pre, ReadSet, Post/Mutation, Frame, Invalidation, HistorySupport, AdmissionLink, Observation, UnknownCondition.

AB51 supplies the lower-arity gate and canonical collision requirements:
Q_AA includes claim/boundary/authority/resource-incarnation/policy/delegation/actual linkage/AdmissionBindingClass/protocol/order/invalidation/replay-consumption/boundary/support; a P_AA collision additionally requires a legal continuation that distinguishes future observation.

AB56 supplies CurrentObs, LowerObs, FutureObs_PAA, FutureObsSet and EventDAG categories.

## 2. Repairs implemented in AB61

### Repair A — explicit three-valued continuation legality

Continuation legality is now represented as TRUE/FALSE/UNKNOWN.

- TRUE: legality is actually established by the bounded model.
- FALSE: a concrete contradiction establishes illegality.
- UNKNOWN: AB54 says a transition is permitted but does not provide a complete permission predicate, or the transition is explicitly underspecified.

UNKNOWN is never converted to an empty continuation set.

### Repair B — EventDAG ordering

Pairwise ordering now has three statuses:

- FORCED: explicit predecessor evidence exists.
- INDEPENDENT: no read/write interaction and no predecessor evidence.
- UNKNOWN: read/write interaction exists but AB54 does not specify a causal/order rule.

Read/write overlap alone does not create an edge.

### Repair C — actual UsedAdmissionContext

ADMIT captures an immutable AdmissionContext object from the actual state at the admission linearization point. Subsequent validity predicates do not retroactively rewrite that captured context.

This is a protocol-level identity-bearing record, not a validity flag.

### Repair D — observational vocabulary

AB61 reconstructs the AB50/AB51 projection vocabulary explicitly and marks unsupported dimensions (notably retained support) as UNKNOWN rather than silently dropping them.

Therefore the quotient is explicitly reported as UNKNOWN until completeness is demonstrated.

### Repair E — FutureObs_PAA

FutureObsSet now returns:
- NONEMPTY_KNOWN
- EMPTY_KNOWN
- UNKNOWN

It separately reports known observations and known-illegal candidates. An UNKNOWN continuation branch remains visible.

This fixes the AB57 failure mode where UNKNOWN legality was represented as no continuation.

## 3. What was NOT silently repaired

AB54 still does not specify:
- LEASE_RENEW successor validity;
- RETRY inheritance/new-attempt semantics;
- MUTATION/RECHECK fact-set/result linkage;
- complete post-ADMIT legal continuation generation;
- complete binding assignments;
- complete EventDAG legality;
- a fully proved canonical quotient congruence.

AB61 therefore does not claim ternary closure.

## 4. AB55 reproducibility result

The original AB55 Python source is present and was recovered unchanged.

Historical AB55 counts remain historical results of that exact source. A reproduction run is a separate experiment and must not overwrite the historical AB55 report.

## 5. Current epistemic status

TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
HYPEREDGE_SEMANTIC_NECESSITY = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
HS_ELIMINATION = UNKNOWN
BRIDGE_MERGE = UNKNOWN
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = PARTIAL_RESEARCH_HARNESS

## 6. Exact next action

Run the AB61 harness and the unchanged AB55 interpreter side-by-side; record whether AB55 historical counts reproduce exactly. Then execute the repaired eight-attack observational gate with explicit UNKNOWN continuation branches.

Only after that should the research decide whether a complete bounded ternary gate can be claimed.
