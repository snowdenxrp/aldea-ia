# GLOBAL-AUDIT-017 — AB36G–J SEMANTIC REVIEW — 2026-09-28

## Findings
AB36G–J materially strengthen the semantic treatment of closure, but remain research/candidate algebra rather than proofs.

AB36G introduces consistent concrete histories, claim-relative LossSet, non-amplification and unknown-on-loss. Its central correction is that abstraction may legitimately shrink the compatible-history set when justified evidence is retained, but may not shrink it merely because of representation.

AB36H advances the same frontier into hypergraph closure: dependencies may be joint and typed, not reducible to node retention. It explicitly separates evidence-restricted history sets from representation-restricted sets and adds composition/boundary obligations.

AB36I defines candidate closure algebra and gives countermodels for unsound intersection, quotient, union with incompatible assumptions, future claims outside retention scope, and silent Z4 absence. It explicitly says composition/non-amplification is still an open theorem.

AB36J continues adversarial closure algebra and insists SOUND, COMPLETE, MINIMAL, COMPATIBLE and COMPOSABLE remain distinct predicates.

## Key result
The research does not establish a universal minimal closure. Instead it establishes a safer direction:
CLAIM_SCOPE -> SEED_PREDICATES -> TYPED/HYPERGRAPH DEPENDENCY CLOSURE -> CONSISTENT_HISTORY_SET -> ASSESSMENT/UNKNOWN.

The distinction is critical:
SOUND != COMPLETE
COMPLETE != MINIMAL
MINIMAL != UNIQUE
COMPOSABLE != AUTOMATIC
CURRENT_CLAIM_SCOPE != FUTURE_CLAIM_SCOPE

## Relation to FutureObs
AB36G–J strengthen the reason FutureObs remains unresolved. A closure can be sufficient for one claim/scope while losing distinctions needed by a future claim or transition. This is not a contradiction; it is a scope boundary. Therefore later FutureObs work must specify the future observation universe rather than assume universal closure.

## Verification
No TLC/TLAPS/formal proof established by these artifacts. Candidate algebra remains unproven.

## Next
GLOBAL-AUDIT-018: AB36K–N, focusing on closure-operator properties, semantic preorder/normalization, concretization and consistent-history composition.