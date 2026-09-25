# NEXO AB36T — FUTURE OBSERVATION QUOTIENT AND CONGRUENCE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation, TLC run, TLAPS proof, or runtime verification.

## 1. External cross-check
Lamport's official refinement material states that implementation under a refinement mapping is expressed as implication from the lower-level specification to the mapped higher-level specification, and that history variables may be added when needed to construct the mapping. Lamport also distinguishes stuttering steps, which leave abstract variables unchanged. This supports our distinction between semantic behavior and physical event logs. citeturn0search13turn0search14 Cornell concurrency material describes bisimulation as requiring matching observable behavior and corresponding transitions; we use this only as a conceptual cross-check and do not claim Nexo has a bisimulation yet. citeturn0search1

## 2. Complete-history versus prefix semantics
Two definitions must not be mixed:
A) Complete-history concretization: CH_P(K) contains complete histories satisfying the contract. Future behavior is already represented in each history.
B) Prefix concretization: CH^prefix_P(K) contains current prefixes; future continuation space must then be represented separately.
For Nexo's minimization work, prefix semantics is useful for transition analysis, while complete-history semantics is useful for final claim assessment. A bridge between them is required.

## 3. Future continuation space
For prefix h define Cont_P(h) as the set of allowed future concrete continuations under the same claim, boundary, assumptions and environment contract.
Define FutureObs_P(h) as the claim-relevant observations produced by all continuations in Cont_P(h), including UNKNOWN when retained support cannot establish the observation.

## 4. Behavioral quotient candidate
h1 ≈F_P h2 iff:
1. current actual admission linkage/refinement obligations agree;
2. current P_AA-relevant semantic context agrees;
3. there is correspondence between their allowed future continuation spaces;
4. corresponding continuations produce equivalent future P_AA observations;
5. boundary/assumption contracts agree.
This is stronger than current-state equality.

## 5. Why observation-only equality can be too weak
If two histories have identical current observations but different future transition availability, a future environment action may exist from one but not the other. Therefore the quotient must compare both observations and transition/continuation structure.

## 6. CM-AA467 — lease-only future action
H1 is ATOMIC, H2 is LEASE, with identical current fields. LEASE_EXPIRE is legal from H2 but not H1. Even if current observations match, continuation spaces differ. A quotient based only on current observations is unsound.

## 7. CM-AA468 — renewal availability
Two lease histories have identical current validity, but one has a renewable bridge and the other a consumed/non-renewable bridge. Future RENEW distinguishes them.

## 8. CM-AA469 — retry availability
Two histories have identical current admission assessment, but one has consumed the attempt/bridge and the other has not. Future RETRY distinguishes them.

## 9. CM-AA470 — recheck obligation
Two histories have identical current `recheck=true`, but one retained the facts necessary to repeat the recheck and the other did not. A future policy/resource change can make the difference claim-relevant.

## 10. Congruence requirement
A useful quotient should be closed under allowed composition/continuation: replacing one history by an equivalent representative must not change any P_AA-relevant result in a larger permitted behavior. This is a congruence-style requirement. It is stronger than merely having an equivalence relation on current states.

## 11. Candidate transition correspondence
For h1 ≈F_P h2 and every relevant concrete transition h1 -> h1', require a corresponding transition/finite stuttering sequence from h2 ->* h2' such that h1' ≈F_P h2', or else both abstractions conservatively expose UNKNOWN where the mismatch becomes claim-relevant.
The converse direction is required if exact behavioral equivalence is claimed. For one-way safety refinement, only the appropriate simulation direction should be required; do not call it bisimulation prematurely.

## 12. Stuttering boundary
A concrete step can be abstract stuttering only if it changes none of:
- P_AA semantic context;
- actual admission linkage;
- retained protocol history support;
- future continuation space relevant to P_AA;
- claim observation.
This is stricter than "abstract variables did not change" if the hidden history affects future behavior.

## 13. Protocol quotient
ATOMIC/LEASE/RECHECK can share an abstract state only if their protocol histories are related by the quotient and their continuation spaces can be matched. A different number of concrete steps is acceptable if the abstract semantics and future observations remain equivalent; this is compatible with the role of stuttering in refinement.

## 14. Minimal protocol history criterion
A history distinction d is eliminable iff quotienting away d yields a congruence-stable representation: every allowed continuation from any representative produces the same P_AA observation/refinement result, or uncertainty is exposed before the distinction becomes decisive.

## 15. Relation to CH
For complete histories, behavioral equivalence can be characterized through sets of complete continuations/observations. For prefixes, FutureObs_P and Cont_P must be carried explicitly or reconstructibly. Equal current CH is therefore insufficient for prefix equivalence.

## 16. Relation to R_AA
R_AA should preserve:
1. current semantic context;
2. actual UsedAdmissionContext;
3. continuation correspondence for all P_AA-relevant environment actions;
4. protocol history support;
5. boundary/assumptions;
6. conservative UNKNOWN behavior.
A concrete transition may stutter only when these remain preserved.

## 17. Relation to minimality
A representation can be physically smaller but semantically less precise. Minimality must therefore be defined over the quotient/congruence, not bytes, fields, events, or variables. Two physically different representations can be equivalent if they induce the same claim-relative future behavior.

## 18. New countermodels CM-AA471–478
471 same current state, different continuation space;
472 same current observation, different lease renewal;
473 same observation, different replay availability;
474 same recheck flag, different future recheck support;
475 one-way simulation mistaken for bisimulation;
476 hidden history changes future continuation but appears as stutter;
477 equivalent representatives cease to be equivalent after composition;
478 complete-history equivalence incorrectly applied to prefixes.

## 19. Result
The protocol quotient should be treated as a future-behavioral congruence, not merely a current observational equivalence. This gives a principled test for history compression: remove a distinction only when the resulting quotient remains stable under every P_AA-relevant continuation.

## 20. AB36U frontier
1. Formalize Cont_P and FutureObs_P with finite bounded continuation spaces.
2. Derive a finite distinguishability test for protocol-history dimensions.
3. Attack congruence under composition and environment changes.
4. Connect complete-history CH and prefix continuation semantics formally.
5. Determine the minimal quotient summary for ATOMIC/LEASE/RECHECK.
6. Then revisit R_AA and reduced-product minimality before any new TLA+ draft.
