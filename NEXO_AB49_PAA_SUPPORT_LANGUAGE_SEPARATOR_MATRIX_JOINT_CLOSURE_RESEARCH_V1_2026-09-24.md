# NEXO AB49 — PAA SUPPORT-LANGUAGE SEPARATOR MATRIX — 2026-09-24

Status: RESEARCH ONLY. No implementation or formal verification.

AB48 carry-forward: the six-contract interface is testable only after fixing a non-oracular HistorySupport language. HistorySupport may not encode FutureObs_PAA or the quotient itself.

## Allowed support primitives
- event identity/type
- actual authority/bridge/recheck linkage
- claim-relevant precedence/order
- invalidation edges
- atomic linearization facts
- lease interval, expiry, renewal, consumption and replay facts
- exact recheck fact-set and recheck-to-admission order
- bounded auxiliary-history references
- boundary/scope facts required by the claim

Forbidden: future observation as a primitive, quotient-equivalence as a primitive, an oracle returning eventual claim assessment, or implicit authority transitions.

## Separator matrix

ATOMIC:
A1 linearization point; A2 relevant-interleaving exclusion; A3 invalidation ordering; A4 immutable historical linkage; A5 boundary.

LEASE:
L1 issuance-to-admission linkage; L2 expiry/interval; L3 renewal semantics; L4 replay/consumption; L5 policy/delegation/epoch/incarnation/boundary invalidation; L6 bridge-to-admission linkage; L7 renewal authority.

RECHECK:
R1 exact fact-set; R2 recheck-to-admission order; R3 mutation detection; R4 actual result linkage; R5 attempt identity; R6 boundary.

## Joint attacks
J1 Atomic versus Lease: same current admission, different future expiry/linearization behavior.
J2 Lease versus Recheck: same current admission, different renewal versus recheck-after-mutation behavior.
J3 Atomic versus Recheck: same current admission, different response to later mutation.
J4 Lease versus Lease: same bridge now, different renewal/replay successors.
J5 Recheck versus Recheck: same current result, different fact-set response to future mutations.

A separator matters only if its differing future transition can change a future P_AA observation. Otherwise it is irrelevant to this claim.

## HistorySupport result
Candidate decomposition:
HS_content = Linkage + Order/Linearization + Invalidation + ProtocolSpecificFacts + AuxiliaryHistory.

This does not prove eliminability. Auxiliary history may still be required to reconstruct these relations, and reconstruction must preserve future behavior.

HS can be removed as a named component only if reconstruction is total or safely UNKNOWN, deterministic modulo P_AA equivalence, linkage-preserving, transition-preserving, future-observation-preserving, non-amplifying, and boundary-preserving.

## Congruence
For abstraction Q, exact future equivalence requires equal Q representations to admit corresponding future transitions with equal Q successors. One-way safety refinement must keep its direction explicit. Do not call this bisimulation without both directions.

Important: Pre/Post/Frame are action relations, not state dimensions. Future transition closure must be part of the refinement obligation.

## Assessment
No surviving genuine collision has been demonstrated inside the fixed bounded support language. This is bounded research evidence only. Semantic freeze is NOT declared.

Open obligations: complete finite transition system; total HS reconstruction; exhaustive joint-transition collision search; formal refinement/model checking.

## AB50
1. Encode the support language and separator matrix as a finite transition system.
2. Enumerate concrete event instances and protocol successors.
3. Compare future-observation equivalence, not only current observations.
4. Test whether HS derives entirely from linkage, order/invalidation and protocol primitives.
5. Search for surviving collisions.
6. If bounded search remains clean, formulate the exact refinement obligation before another TLA+ draft.
