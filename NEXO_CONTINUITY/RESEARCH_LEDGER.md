# RESEARCH LEDGER

## AB50 — d9d6ae59574e43af7d75891208189864aeb7798c
Bounded transition-system/future-observation collision-search specification. It fixes the non-oracular HistorySupport language, defines Q_AA, collision criteria, stuttering discipline, pairwise separator tests, higher-order attack families, hyperedge necessity/absorption tests, HistorySupport reconstruction, LeaseBridge/AdmissionBindingClass separation, and conservative bounded-result classifications. Research only; no implementation/formal verification.

## AB51 — d9252fca819b47659bebbf4a36b4cb2473963bed
Ternary joint-separator/hyperedge closure research. Establishes the mathematical fact that unary+binary projections can fail to determine ternary relations, but explicitly refuses to treat that as a P_AA collision without a legal transition that reads the distinction. Separates semantic necessity from representational/abstract-state necessity, introduces read-set closure, reconstruction criteria, and a four-event escalation gate. Research only; no semantic freeze or formal verification.

## Preservation rule
Never delete an earlier ledger entry. Append new entries for AB52+ with the commit SHA, research question, evidence, results, unresolved items, and next action.


## AB52 — b93ec7fb52cc6cbdfaa891bac9fbf53e0ad7e343
Bounded ternary read-set closure search. Covered 286 unordered candidate event-role triples, 19 strict partial orders for three labeled events, and 3 protocol variants, for 16,302 role/order/protocol skeletons. The canonical parity witness remains a mathematical ternary non-reconstructibility result, but under the explicitly instantiated ATOMIC/LEASE/RECHECK read closures no irreducible ternary P_AA residual or future-observation collision was found. This is bounded structural evidence, not proof and not full concrete binding-state enumeration. HistorySupport elimination is supported only for the tested ternary closure; LeaseBridge/AdmissionBindingClass merge remains UNKNOWN. Four-event escalation from ternary is not triggered, but independent H6/H7 four-event attacks remain open.

## AB53 — a229d37985e67881f32799938353e1cb339b3a90
Reconciles two AB52 artifacts. The exhaustive mathematical enumeration remains established, while the stronger protocol-read-closure result is explicitly conditional on transition semantics being complete. Because the exact executable ATOMIC/LEASE/RECHECK read-sets were not yet normalized, the canonical protocol status is restored to UNKNOWN_DUE_TO_MISSING_SEMANTICS; P_AA collision, hyperedge necessity, HistorySupport elimination and bridge merge remain UNKNOWN. Next step is a protocol transition-semantics matrix before further ternary or four-event claims.

## AB54 — ee3704e24e746116e049770944feeb308e2a5737
Normalized the P_AA transition semantics into an explicit action schema: Pre, ReadSet, Post/Mutation, Frame, Invalidation, HistorySupport, AdmissionLink, Observation, UnknownCondition. Consolidated ATOMIC, LEASE and RECHECK read sets from prior artifacts without inventing missing semantics. The ternary protocol status remains UNKNOWN_DUE_TO_MISSING_SEMANTICS. Next experiment is a finite transition interpreter with explicit UNKNOWN and partial-order histories, starting with eight highest-value ternary attacks.

## AB55 — 51496bdd0d5237b540d6093d359df646b2d90cb2
Finite research interpreter instantiated from AB54's normalized action schema. Eight highest-value ternary attacks executed over 64 bounded initial binding states and 6 event permutations each (384 histories per attack). Results: no P_AA collision established; TRUE/FALSE outcomes were bounded interpreter observations, not proof. UNKNOWN was preserved for unspecified LEASE_RENEW successor semantics, RETRY inheritance semantics, and MUTATION/RECHECK semantics. Ternary protocol residual remains UNKNOWN_DUE_TO_MISSING_SEMANTICS. Next: encode lower-arity observations, FutureObs_PAA, reconstruction and EventDAG before broadening to all 286 triples.

## AB56 — 4a6af7089a5f8c0de47768c639959105639fc374
Extended the bounded research frontier conceptually from terminal ternary results to lower-arity observations, FutureObs_PAA, reconstruction, and EventDAG semantics. The new artifact defines a reconstruction criterion requiring equality of current and future P_AA observations over all retained lower-arity facts, and distinguishes forced, independent, and unknown event ordering. Under the currently explicit bounded semantics, no fully specified ternary P_AA collision is established. Explicit-invalidating cases reconstruct from retained predicates; LEASE_RENEW, RETRY, MUTATION/RECHECK remain UNKNOWN where successor/order semantics are incomplete. EventDAG closure is partial and reconstruction is bounded-only. No four-event escalation is justified.
