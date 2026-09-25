# AB67 — EXTERNAL RESEARCH DELTA: EPISTEMIC SUCCESSOR SETS AND OBSERVATIONAL EQUIVALENCE

Date: 2026-09-25
Status: RESEARCH ONLY; no integrated Nexo implementation.

## Research question
How should the research model represent an UNKNOWN history transition, and what is required before a lower-arity observation can be treated as a canonical quotient?

## Evidence reviewed
1. Bollig, Runtime Verification: Monitoring, Knowledge, and Uncertainty (2026): runtime verification addresses partial observability and uncertainty and discusses epistemic foundations and monitorability. This supports treating incomplete knowledge as a semantic problem rather than silently selecting one concrete execution.
2. Kallwies, Leucker, Sanchez, Symbolic Runtime Verification for Monitoring under Uncertainties and Assumptions (2022): partial knowledge about observed runs is represented symbolically and monitoring can refine as observations arrive. This supports retaining uncertainty rather than replacing it with an arbitrary concrete value.
3. Basin, Klaedtke, Zălinescu, Runtime Verification of Temporal Properties over Out-of-order Data Streams (2017): three-valued semantics are used for sound/complete online reasoning when event streams can be delayed or lost. This supports an explicit third epistemic status, but does not prescribe Nexo's exact semantics.
4. Stanford Encyclopedia of Philosophy, Propositional Dynamic Logic: bisimulation is a standard behavioral equivalence for labeled transition systems and compares observations plus matching transitions. This supports requiring transition-aware equivalence rather than equality of one observation snapshot.
5. Stanford Encyclopedia of Philosophy, Games/Full Abstraction: observational equivalence is defined through behavior in all program contexts and congruence is stronger than naive equality of one observation. This supports treating canonical quotient construction as a proof obligation, not an implementation convenience.
6. NIST NCCoE 2026 Software and AI Agent Identity and Authorization work: current agent-security guidance emphasizes identity, authorization, delegation, auditing/non-repudiation and constrained agent action. This reinforces that identity/authority/context dimensions cannot be merged merely because an experimental state representation happens to contain them, but it does not prove any specific Nexo architecture.

## Derived research implications
### A. UNKNOWN history cannot be modeled as identity by default
If a transition is UNKNOWN, the model has insufficient information to select one concrete successor. A sound research representation should therefore preserve a set, symbolic family, or other explicit epistemic object of admissible successors. If the actual successor relation itself is unknown, the object must not fabricate concrete members. It may instead carry an UNKNOWN transition relation/branch descriptor until semantics are supplied.

### B. Future observations must quantify over unresolved successors
For a known state s and action/event a with fully known successor relation, FutureObs can be computed from concrete successors. For an UNKNOWN relation, a single successor is not justified. The research question becomes whether all admissible successors agree on the future observation, whether they disagree, or whether the admissible successor relation is itself insufficiently specified. These cases must remain distinguishable in the model.

### C. Three-valued status is not the same as a three-valued state field
TRUE/FALSE/UNKNOWN can classify knowledge about a proposition or transition. It does not imply that UNKNOWN is a concrete state value from which ordinary deterministic transitions may proceed. AB65's identified composition problem therefore remains valid.

### D. Lower-arity quotient requires transition/context congruence
Equality of a snapshot projection is insufficient to establish a canonical quotient. At minimum, candidate equivalence must survive the relevant legal future contexts/continuations and preserve the observations that the protocol can distinguish. This is consistent with observational equivalence and bisimulation-style reasoning, but the exact equivalence for Nexo remains OPEN.

### E. History order must not be observable merely because the harness stores it
An implementation field such as order_facts becomes a canonical observation only if the protocol exposes or semantically depends on that distinction. Otherwise it can create artificial separation and invalidate a reconstruction test. The canonical observation vocabulary must therefore be derived from protocol-observable facts, not from convenient internal bookkeeping.

## What this does NOT establish
- It does not prove that an epistemic powerset construction is the final Nexo representation.
- It does not prove ternary P_AA sufficiency or insufficiency.
- It does not close FutureObs_PAA.
- It does not establish quotient congruence.
- It does not establish EventDAG closure.
- It does not justify adding a new production component to Nexo.

## Exact next research step
Before modifying the existing interpreter, define a minimal abstract semantic object for unresolved successors with three cases: KNOWN successor set, KNOWN empty successor set, and UNKNOWN successor relation. Then test candidate observational equivalence against future legal contexts without inventing concrete UNKNOWN successors. In parallel, derive the canonical observation vocabulary from AB50/AB51/AB54/AB56 and external evidence, explicitly marking unsupported dimensions UNKNOWN.

## DO-NOT-REPEAT
- Do not equate UNKNOWN with an unchanged state.
- Do not fabricate possible successor states merely to make a finite search executable.
- Do not call snapshot equality a quotient congruence.
- Do not use implementation-only fields as protocol observations without evidence.
- Do not broaden to 286 triples or assemble integrated Nexo before the research gate is satisfied.
