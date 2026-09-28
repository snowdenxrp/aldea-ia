# GLOBAL-AUDIT-023 — VERIFICATION-GAP MATRIX — 2026-09-28

## Scope
Classify G1-G15 from GLOBAL-AUDIT-022 by the evidence needed to close them. This is a research/audit artifact, not implementation.

## Matrix

| Gap | Primary closure method | Supporting evidence | Closure criterion |
|---|---|---|---|
| G1 Observation function | SEMANTIC SPECIFICATION + THEOREM/PROOF | executable oracle tests | observation is total, claim-relative, boundary-explicit |
| G2 EventDAG/history → quotient | THEOREM/PROOF + FINITE MODEL CHECKING | adversarial traces | mapping total and preserves required observations |
| G3 Reconstruction function | THEOREM/PROOF | finite exhaustive counterexample search | total on declared domain; UNKNOWN outside justified domain |
| G4 R1-R5 completeness | THEOREM/PROOF + ADVERSARIAL EXECUTION | dependency enumeration | every P_AA dependency maps to an obligation |
| G5 R1-R5 nonredundancy | THEOREM/PROOF + COUNTERMODELS | bounded separators | removability/absorption is demonstrated per declared domain |
| G6 Transition congruence | FINITE MODEL CHECKING + THEOREM/PROOF | exhaustive transition/future traces | equivalent representatives remain observationally equivalent after every allowed transition |
| G7 FutureObs sufficiency | THEOREM/PROOF, supported by bounded model checking | explicit continuation universe | all allowed continuations preserve observation or jointly yield UNKNOWN |
| G8 Lease renew/consume | SEMANTIC SPECIFICATION + ADVERSARIAL EXECUTION + MODEL CHECKING | protocol/reference implementation evidence later | complete laws for expiry, renewal, consumption, replay, fencing |
| G9 Recheck fact-set | SEMANTIC SPECIFICATION + ADVERSARIAL EXECUTION | matrix over partial/full fact sets | exact claim-relevant re-established facts are preserved |
| G10 Cross-protocol equivalence | THEOREM/PROOF + MODEL CHECKING | protocol-specific countermodels | translation/refinement preserves future behavior |
| G11 Finite-domain completeness | SEMANTIC SPECIFICATION + THEOREM/PROOF | parameterized/bounded model evidence | finite domain is explicitly justified as claim universe or abstraction |
| G12 Tool verification | EXECUTABLE MODEL CHECKING / FORMAL PROOF | pinned tools + retained artifacts | SANY/TLC/TLAPS results actually executed and attributable |
| G13 Refinement proof | THEOREM/PROOF + MODEL CHECKING | refinement mapping + traces | concrete behavior refines semantic quotient under declared assumptions |
| G14 Compression matrix | ADVERSARIAL EXECUTION + FINITE MODEL CHECKING | reproducible shortest traces | all declared compression attacks executed; failures/successes recorded |
| G15 UNKNOWN/boundary semantics | SEMANTIC SPECIFICATION + MODEL CHECKING + ADVERSARIAL EXECUTION | fault/omission traces | incomplete provenance never yields unjustified decisive authorization |

## Evidence classes

### A. Semantic specification
Required before proof or exhaustive checking. Defines claim, observation, transition universe, assumptions, boundaries, UNKNOWN semantics.

### B. Finite executable model checking
Can establish properties only over the explicitly declared finite model/domain. It cannot by itself prove universal behavior outside that model.

### C. Theorem/formal proof
Needed where the claim is universal or where bounded enumeration cannot establish completeness/congruence. Requires precise domains, relations and assumptions.

### D. Adversarial execution
Needed to demonstrate concrete counterexamples, compression attacks, fault/omission behavior and interactions that static reasoning may miss.

### E. Runtime/reference evidence
Not a substitute for semantic proof. Required later for concrete protocol behavior, fault injection, provider semantics and implementation refinement.

## Dependency ordering

The gaps cannot be closed independently in arbitrary order. Minimum semantic dependency chain:

G1 → G2 → G3
G1 + G2 → G6
G3 + G6 → G7
G8 + G9 + G10 → G4
G4 + G5 + G6 + G7 → stable residual quotient candidate
G11 → scope validity of all bounded claims
G12 → validates executable artifacts, but does not replace semantic definitions
G13 depends on stable quotient + concrete model
G14 depends on stable semantic obligations and declared transition universe
G15 must constrain every stage because UNKNOWN is part of the semantics, not merely a test outcome

## Important non-closure rules

1. A successful bounded model check cannot be promoted to universal proof.
2. Absence of a counterexample at depth k is not quotient congruence.
3. A theorem over an underspecified transition universe does not close FutureObs.
4. Runtime success does not prove historical semantic correctness.
5. Tool execution proves tool execution/results, not that the model expresses the intended claim.
6. SANY success remains syntax/semantic validation only.
7. Formal proof cannot repair an incomplete semantic specification.
8. Adversarial tests can refute a candidate but cannot alone establish universal completeness.
9. UNKNOWN must be modeled as an observable semantic result where reconstruction/evidence is insufficient.

## Gate result

The gaps are now classified by discharge method. The correct next target is NOT architecture construction. It is to define the exact semantic specification needed to make G1-G3 and the transition universe explicit, then construct a finite executable research model whose domain is visibly bounded and whose results cannot be mistaken for universal proof.

## Next exact action

GLOBAL-AUDIT-024 → define the claim-relative observation contract and explicit continuation/transition universe required by G1/G6/G7, while preserving UNKNOWN and the Z1→Z3 boundary. No implementation and no V21.
