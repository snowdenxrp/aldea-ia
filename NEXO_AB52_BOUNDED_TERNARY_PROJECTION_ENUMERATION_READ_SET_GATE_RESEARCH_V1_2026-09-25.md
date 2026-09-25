# NEXO AB52 — BOUNDED TERNARY PROJECTION ENUMERATION / READ-SET GATE — 2026-09-25

Status: RESEARCH ONLY. No implementation, no TLC, no TLAPS, no semantic freeze.

## 1. Parent and scope

Parent:
AB51 — NEXO_AB51_PAA_TERNARY_JOINT_SEPARATOR_HYPEREDGE_CLOSURE_RESEARCH_V1_2026-09-25.md

AB52 performs the first concrete bounded enumeration required by AB51.

The purpose is deliberately narrow:
- exhaust the finite space of ternary relations over three binary attributes;
- group relations by identical unary and binary projections;
- identify minimal irreducible joint distinctions;
- test the read-set gate conceptually;
- refuse to promote a mathematical joint distinction into a P_AA residual unless the current protocol semantics define a legal transition that can read it.

This round does not claim that the synthetic binary attributes are themselves protocol state variables. They are a mathematical stress harness for the lower-arity reconstruction question.

## 2. Exact finite enumeration

Let the ternary universe be:

U = {0,1}^3

|U| = 8.

Every ternary relation is a subset of U, so the complete relation space contains:

2^8 = 256 relations.

For each relation R, compute:
- three unary projections;
- three binary projections: (x,y), (x,z), (y,z).

Relations are placed into equivalence classes when all six projections are identical.

The bounded enumeration yields:

TOTAL_RELATIONS = 256
PROJECTION_CLASSES = 166
NONTRIVIAL_CLASSES = 45
MAX_CLASS_SIZE = 35

Therefore 45 projection-equivalence classes contain at least two distinct ternary relations.

This is an exhaustive result for the stated three-binary-attribute mathematical universe, not a bounded sampling result.

## 3. Smallest concrete ambiguity

The smallest nontrivial projection-equivalence classes contain two relations.

One explicit pair is:

R1 = {(0,0,1), (0,1,0), (1,0,0)}

R2 = {(0,0,0), (0,0,1), (0,1,0), (1,0,0)}

Their unary projections are identical:

x -> {0,1}
y -> {0,1}
z -> {0,1}

Their three binary projections are also identical:

(x,y) -> {(0,0),(0,1),(1,0)}
(x,z) -> {(0,0),(0,1),(1,0)}
(y,z) -> {(0,0),(0,1),(1,0)}

Yet R1 != R2.

The earlier parity witness remains valid as an even/odd complementary construction. AB52 adds an explicit minimum-cardinality ambiguity to show that the gap is not dependent on using nearly half of the universe.

## 4. What this proves

The finite enumeration establishes:

T1 — TERNARY_MATH_GAP = FOUND.

More precisely:

Unary + binary projections do not form a complete invariant for arbitrary ternary relations.

Therefore the following inference is invalid in general:

same unary facts + same pairwise facts => same ternary relation.

This is a mathematical lower-arity result only.

It does not establish:
- a protocol residual;
- a P_AA collision;
- a required hyperedge;
- a required abstract state variable.

## 5. Read-set gate

AB51 requires a second stage.

For two histories H1,H2 represented by R1,R2, a joint distinction becomes P_AA-relevant only if a legal future transition T has a semantic read-set containing a predicate that distinguishes R1 from R2.

A synthetic transition could be written conceptually as:

T_joint:
    if JointPredicate(R) then Admit
    else UNKNOWN/FALSE

Such a transition would expose the mathematical gap.

However, T_joint is not an automatically legal member of the AB50 protocol transition system.

AB50 currently specifies concrete event types and retained semantic primitives, but it does not define an executable protocol rule whose legality is determined by an arbitrary irreducible ternary predicate over three binary attributes.

Therefore the synthetic witness cannot be promoted into a P_AA collision.

## 6. Important negative result

AB52 does NOT report:

TERNARY_PROTOCOL_RESIDUAL = NOT_FOUND.

That would be too strong.

The correct classification is:

TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS

because the current research artifacts define the target protocols and retained facts at a specification level but do not yet provide the complete transition semantics required to prove that every candidate joint predicate is unreadable.

This distinction is essential.

Absence of an explicitly named JOINT_* event in the event alphabet is not by itself proof that a protocol cannot semantically derive or consume a joint predicate.

## 7. Consequence for future-observation search

Because the legal read-set is not yet fully executable, the following also remain conservative:

T3 — TERNARY_PAA_COLLISION = UNKNOWN
T4 — HYPEREDGE_SEMANTIC_NECESSITY = UNKNOWN

No collision is declared merely from the mathematical construction.

Conversely, no sufficiency result is declared merely because no protocol collision has yet been instantiated.

## 8. Event-triple search gate

The next protocol-level enumeration must instantiate each unordered event triple from the AB51 candidate family using actual claim-relevant attributes and bindings.

For each triple:

1. enumerate legal bindings;
2. enumerate legal total orders;
3. enumerate legal partial orders/concurrency;
4. enumerate invalidation edges and their closure;
5. enumerate protocol-specific state transitions;
6. compute actual admission linkage;
7. require exact equality of every lower-arity retained fact;
8. identify any residual joint relation;
9. derive its minimal semantic read-set;
10. search the smallest legal continuation that reads it;
11. compare FutureObs_PAA;
12. attempt deterministic reconstruction;
13. classify as ABSORB, NONSEMANTIC_FOR_PAA, ABSORB_AS_AUXILIARY, GENUINE_SEMANTIC_RESIDUAL, or UNKNOWN_DUE_TO_MISSING_SEMANTICS.

A mathematical relation must not be used as a shortcut around these gates.

## 9. Ternary-to-four-event escalation

AB51's escalation rule remains unchanged.

Do not enumerate arbitrary four-event relations.

A four-event search becomes justified only if a protocol-specific ternary candidate survives:
- lower-arity equality;
- order closure;
- invalidation closure;
- protocol closure;
- reconstruction;
- read-set;
- FutureObs_PAA.

If no ternary candidate survives, the four-event result must be recorded as not yet semantically required rather than treated as proof of global sufficiency.

## 10. HistorySupport consequence

AB52 provides no basis to remove HistorySupport.

The mathematical projection gap shows that an abstract collection of lower-arity projections can lose higher-order information in general.

But this does not imply HistorySupport must store a hyperedge.

The only admissible elimination route remains:

HistorySupport fact
-> identify all P_AA-relevant future read-sites
-> prove deterministic reconstruction or safe UNKNOWN
-> verify future observation preservation.

Therefore:

HS_ELIMINATION = UNKNOWN.

## 11. LeaseBridge / AdmissionBindingClass consequence

AB52 does not resolve the bridge merge.

The ternary mathematical gap is orthogonal to whether LeaseBridge can be reconstructed from AdmissionBindingClass plus order, invalidation, protocol semantics, and support.

Therefore:

BRIDGE_MERGE = UNKNOWN.

No merge is introduced.

## 12. Current bounded result ledger

T1 — ternary mathematical non-reconstructibility:
FOUND

T2 — legal protocol ternary residual:
UNKNOWN_DUE_TO_MISSING_SEMANTICS

T3 — P_AA future collision:
UNKNOWN

T4 — genuine abstract hyperedge necessity:
UNKNOWN

T5 — HistorySupport eliminability:
UNKNOWN

T6 — LeaseBridge merge:
UNKNOWN

These labels are intentionally conservative.

## 13. What is now established beyond AB51

AB51 established the conceptual read-set closure criterion.

AB52 now establishes by exhaustive finite enumeration that:

1. there are 256 ternary relations over three binary attributes;
2. they collapse into 166 unary/binary projection classes;
3. 45 classes contain more than one distinct ternary relation;
4. the smallest ambiguity already occurs between two distinct relations;
5. therefore pairwise projection equality cannot, in general, certify joint relational equality;
6. a P_AA conclusion still requires a legal semantic read and future-observation divergence.

The mathematical side of the AB51 gate is therefore no longer merely illustrated by one parity example; it has been exhaustively enumerated for the stated finite universe.

## 14. Semantic-freeze status

Semantic freeze remains prohibited.

TLA+ remains not started.
TLC remains not started.
TLAPS remains not started.
Implementation remains not started.

No prior artifact is rewritten.

## 15. Next exact action

The next research pass is not another generic mathematical example.

It must close the missing protocol-semantic layer needed by the read-set gate:

A. extract the exact legal transition semantics for ATOMIC, LEASE and RECHECK from the accumulated research artifacts;

B. normalize each transition into:
   - precondition;
   - semantic read-set;
   - state mutation;
   - admission linkage effect;
   - invalidation effect;
   - P_AA observation;
   - UNKNOWN/PENDING condition;

C. instantiate the AB51 event triples against those transition rules;

D. rerun the lower-arity equality gate;

E. search the smallest legal future continuation for every surviving ternary distinction;

F. only then classify T2/T3/T4.

If the exact transition semantics cannot be recovered without inventing missing rules, the correct output is UNKNOWN_DUE_TO_MISSING_SEMANTICS and the missing semantic obligation must be documented rather than guessed.

AB52 therefore closes the mathematical enumeration gate but deliberately leaves the protocol/P_AA gate open.
