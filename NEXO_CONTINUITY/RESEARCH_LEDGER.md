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


## Continuity V2 — 48eaa4717fe5c8053503ce415afbba72771bb92b + subsequent checkpoint commits

The continuity architecture was strengthened after observing chat-limit failure modes. This is a process safeguard, not a research conclusion. It adds a canonical handoff entry point, explicit epistemic-status preservation, partial-step persistence, contradiction handling, and a DO-NOT-REPEAT boundary. It does not close any AB56 research gap.
## AB57 — 7a2feb0f6a367f2c800685b3499df87ea8194364
Started executable observational/EventDAG gate. Added identity-bearing Binding/UsedAdmissionContext, ADMIT-point CurrentObs, conservative EventDAG ordering, lower-arity projection, FutureObs_PAA interface, UNKNOWN propagation, and the eight ternary attack harness. This closes the implementation/scaffolding defect identified by the deep audit but does not close protocol semantics. Remaining unknowns are LEASE_RENEW, RETRY, MUTATION/RECHECK, continuation legality, complete binding domain, and complete lower-arity equivalence. Next: fill only semantics already supported by persisted evidence, then execute the complete gate.

AB58 — 64ae4867777c73ac75289f6e85fc84ee25cc5f09
Audited the AB57 executable boundary without importing undocumented protocol semantics. Established from code that FutureObs_PAA is currently degenerate to current P_AA (only ADMIT continuation), UNKNOWN successor legality is omitted rather than represented, EventDAG has no explicit predecessor edges, UsedAdmissionContext identity checking is non-discriminating under current known mutations, and lower_obs is an identity-bearing projection not yet a canonical observational quotient. No research claim was closed. Next: recover canonical AB54/AB56 observation/action semantics, add explicit UNKNOWN continuation states, encode only evidenced EventDAG edges, then rerun the complete ternary gate.

## AB61 — semantic repair + AB55 reproducibility — 2026-09-25
AB55 source/configuration was recovered directly from NEXO_CONTINUITY/AB55_FINITE_RESEARCH_INTERPRETER.py and executed separately. All eight historical AB55 result tuples reproduced exactly: 384 histories per attack with identical TRUE/FALSE/UNKNOWN counts. Reproducibility repair for the historical AB55 counts is therefore CLOSED; the historical artifact remains immutable.

AB61 adds a research-only semantic-repair interpreter at NEXO_CONTINUITY/AB61_SEMANTIC_REPAIR_INTERPRETER_2026-09-25.py. The repair separates candidate-history execution from future-continuation legality; continuation legality is explicit TRUE/FALSE/UNKNOWN; UNKNOWN is preserved as an epistemic branch; EventDAG pair relations distinguish FORCED, INDEPENDENT, and UNKNOWN rather than inferring edges from overlap; ADMIT captures an immutable UsedAdmissionContext; and the AB50/AB51 observation vocabulary is explicit with unsupported support dimensions marked UNKNOWN rather than silently omitted.

AB61 does not close the protocol question. Complete post-ADMIT continuation legality, LEASE_RENEW, RETRY, MUTATION/RECHECK linkage, full binding enumeration, EventDAG closure, quotient congruence, HistorySupport elimination and bridge merge remain unresolved. TERNARY_PAA_COLLISION remains UNKNOWN. Next action: execute the repaired AB61 gate and persist its full output before any 286-triple expansion.
