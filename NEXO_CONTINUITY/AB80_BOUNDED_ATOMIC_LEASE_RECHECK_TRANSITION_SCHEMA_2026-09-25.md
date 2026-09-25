# AB80 — BOUNDED ATOMIC / LEASE / RECHECK TRANSITION SCHEMA — 2026-09-25

Status: RESEARCH ONLY. No implementation change, no semantic freeze, no TLA+ execution, no TLC/TLAPS verification.

## Scope

AB80 extracts only transition semantics explicitly recoverable from AB20, AB24, and AB52. It does not fill missing protocol rules.

Required fields:
- Precondition
- Semantic read-set
- State mutation
- Admission-linkage effect
- Invalidation effect
- P_AA observation
- UNKNOWN/PENDING condition

## ATOMIC

Precondition:
- authorization and admission are treated as one semantic linearization point only under the ATOMIC protocol class described by AB24.

Semantic read-set:
- current authority consequences;
- complete binding;
- policy compatibility;
- delegation validity;
- resource incarnation compatibility;
- admission protocol validity;
- actual admission context.

State mutation:
- an admission/authorization transition may update AdmissionBindingClass and related P_AA components.
- Exact field-level mutation is NOT fully specified.

Admission-linkage:
- must bind the actual authorization context to the admission event.
- An unrelated valid witness is insufficient.

Invalidation:
- authority, policy, delegation, epoch/incarnation or other P_AA-relevant changes may invalidate the context according to their explicit protocol semantics.
- Exact cross-field invalidation closure remains incomplete.

P_AA observation:
- authorization/admission outcome at the Z1->Z3 boundary.

UNKNOWN/PENDING:
- exact atomicity law;
- exact pre/post field relation;
- complete invalidation closure;
- exhaustive successor domain.

Classification:
C2=PARTIAL/UNKNOWN; C3=UNKNOWN; C6=UNKNOWN.

## LEASE

Precondition:
- IssueLease requires a valid authority basis.
- A complete bridge must bind the relevant authority/admission context.
- Admit requires current compatible authority plus a valid complete bridge.

Semantic read-set:
- authority;
- lease/freshness;
- policy;
- delegation;
- resource incarnation;
- boundary;
- binding relation;
- actual admission context;
- renewal/replay/consumption/history support where relevant.

State mutation:
- IssueLease creates freshness/binding state.
- ExpireLease invalidates lease-based admission.
- Decide creates/updates a complete bridge.
- Exact renewal/replacement mutation law is unresolved.

Admission-linkage:
- the bridge must be linked to the actual admission context.
- Retry cannot inherit authorization implicitly.

Invalidation:
- authority revoke, epoch advance, policy change, delegation change, reincarnation and lease expiry may invalidate the bridge.
- AB20 gives the candidate joint BridgeValid predicate, but complete protocol-specific invalidation semantics are not closed.

P_AA observation:
- admission result under the complete bridge at the authorization boundary.

UNKNOWN/PENDING:
- renewal legality;
- renewal post-state;
- exact bridge replacement/retention law;
- complete replay semantics;
- complete enumeration of legal renewal outcomes.

Classification:
C2=UNKNOWN; C3=UNKNOWN; C6=UNKNOWN.

## RECHECK

Precondition:
- RECHECK is the protocol class in which admission evaluates the complete P_AA predicate against current state.

Semantic read-set:
- current authority;
- complete binding;
- policy;
- delegation;
- incarnation;
- required lease/fence context;
- actual admission linkage;
- exact fact-set and order where recheck semantics require them.

State mutation:
- exact recheck result/update relation is not fully specified.
- AB61 identifies recheck_valid as a written field, but that does not define the complete post-state.

Admission-linkage:
- result must be tied to the actual admission attempt/context.
- Exact result-to-successor mapping remains unresolved.

Invalidation:
- recheck is intended to catch relevant current invalidations, but complete invalidation closure is not specified.

P_AA observation:
- current P_AA result at admission.

UNKNOWN/PENDING:
- exact legality predicate;
- exact result mutation;
- complete invalidation set;
- exhaustive successor domain.

Classification:
C2=UNKNOWN; C3=UNKNOWN; C6=UNKNOWN.

## Cross-protocol result

The schema now makes the read sets more explicit, but explicit read-set vocabulary is not equivalent to a complete transition relation.

No protocol reaches KNOWN_NONEMPTY or KNOWN_EMPTY under the AB75/AB76 completeness criterion.

The critical remaining barrier is not merely naming fields. It is specifying the complete relation:
source context -> legal event -> post-state -> invalidation/frame -> observation -> exhaustive successor domain.

## Read-set gate consequence

AB52's ternary mathematical ambiguity still cannot be promoted to a P_AA collision because these recovered schemas do not contain an explicit legal transition whose complete semantics distinguish the irreducible ternary relation.

Therefore:
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION=UNKNOWN

## Next exact experiment

Use this schema to instantiate the smallest AB51 event triples for:
1. ATOMIC;
2. LEASE;
3. RECHECK.

For each triple, require every transition to have complete C2/C3/C6 evidence before allowing a concrete successor classification. Otherwise retain UNKNOWN and record the missing rule.

No 286-triple expansion yet.
