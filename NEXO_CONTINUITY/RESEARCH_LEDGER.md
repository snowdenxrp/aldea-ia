# RESEARCH LEDGER

## AB50 — d9d6ae59574e43af7d75891208189864aeb7798c
Bounded transition-system/future-observation collision-search specification. It fixes the non-oracular HistorySupport language, defines Q_AA, collision criteria, stuttering discipline, pairwise separator tests, higher-order attack families, hyperedge necessity/absorption tests, HistorySupport reconstruction, LeaseBridge/AdmissionBindingClass separation, and conservative bounded-result classifications. Research only; no implementation/formal verification.

## AB51 — d9252fca819b47659bebbf4a36b4cb2473963bed
Ternary joint-separator/hyperedge closure research. Establishes the mathematical fact that unary+binary projections can fail to determine ternary relations, but explicitly refuses to treat that as a P_AA collision without a legal transition that reads the distinction. Separates semantic necessity from representational/abstract-state necessity, introduces read-set closure, reconstruction criteria, and a four-event escalation gate. Research only; no semantic freeze or formal verification.

## Preservation rule
Never delete an earlier ledger entry. Append new entries for AB52+ with the commit SHA, research question, evidence, results, unresolved items, and next action.


## AB52 — b93ec7fb52cc6cbdfaa891bac9fbf53e0ad7e343
Bounded ternary read-set closure search. Covered 286 unordered candidate event-role triples, 19 strict partial orders for three labeled events, and 3 protocol variants, for 16,302 role/order/protocol skeletons. The canonical parity witness remains a mathematical ternary non-reconstructibility result, but under the explicitly instantiated ATOMIC/LEASE/RECHECK read closures no irreducible ternary P_AA residual or future-observation collision was found. This is bounded structural evidence, not proof and not full concrete binding-state enumeration. HistorySupport elimination is supported only for the tested ternary closure; LeaseBridge/AdmissionBindingClass merge remains UNKNOWN. Four-event escalation from ternary is not triggered, but independent H6/H7 four-event attacks remain open.