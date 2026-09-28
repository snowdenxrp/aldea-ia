# NEXO GLOBAL-AUDIT-009 — AB41–AB49 EXACT ANCESTRY + RETROSPECTIVE CROSS-CHECK — 2026-09-27

Status: CANONICAL GLOBAL AUDIT / ADDITIVE. No implementation, V21, deletion, overwrite, or semantic promotion.

## Scope
This pass recovers and verifies AB41–AB49 from Git ancestry in snowdenxrp/aldea-ia, then cross-checks the recovered primary artifacts against NEXO_CONTINUITY/AB104_67_SECOND_HISTORICAL_REPASS_2026-09-25.md.

## Exact chain
AB40 512abd707334cec2a6db6c624bec2cb87e1cc313
→ AB41 6771ba0cd421d65a567a06fa134ab73339294e44
→ AB42 988b1d917a22b05659360cbca395f2f9729d481b
→ AB43 0ec8bd61c2b471baedb027a34b8c68db177dfe5d
→ AB44 904fd8d3be035c6e9159af39da395f8c135c8ab6
→ AB45 2fce518559eaea932159da947ab66c6067d2206c
→ AB46 120c1144842a511833387f06397bb47197f3d04c
→ AB47 1e65c48ac86620530cf7fdf98a388e36bc0b7dea
→ AB48 64ad310401fc2b720e4df07ecd48c00f0bfe272b
→ AB49 b4dfd5553826073a3099f7e2b8ad11327b6a1781

Each parent relationship was checked through GitHub's commit API. Each AB41–AB49 commit adds exactly one research artifact.

## Primary-artifact findings
AB41: BridgeBinding abstraction and future support. Research-only. Establishes that equal current BB is insufficient if relevant future observations can differ; future-support/congruence remains a candidate obligation.

AB42: Explicit BB collision attacks (expiry, renewal, recheck fact-set, retry binding, incarnation successor, joint policy/delegation, actual bridge linkage, boundary successor). Concludes current-state equality is insufficient; Qres is not proven necessary as a separate component. Status conditional, not frozen.

AB43: Protocol-specific kernels for ATOMIC/LEASE/RECHECK. Strong evidence for a common claim kernel plus protocol-specific semantic extensions; not enough evidence to erase all extensions into one scalar representation.

AB44: Protocol quotient/common projection. Defines claim-relative quotient semantics and shows common projection is not by itself an exact protocol quotient. Seven-field ProtocolBridgeSemantics is a semantic interface, not a required runtime object; fields are not individually proven irreducible.

AB45: Generic protocol-bridge interface attacks. ContinuationRules must not be an oracle equal to the quotient; it should derive from finite semantic primitives/action contracts. Qres is removable only if residual distinctions are derivable without changing P_AA/future observations.

AB46: Six semantic action obligations: Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink. HistorySupport is a claim-relative support obligation, not arbitrary logging. No proof that the six jointly determine all future P_AA observations; next step was collision search.

AB47: Six-contract collision attacks. Weaker boolean formulations are refuted; sufficiently rich relational formulations were not refuted. No formal proof. Explicit joint protocol collisions show current TRUE_JUSTIFIED equality is insufficient as quotient criterion.

AB48: Relational six-contract schema. No genuine collision established against sufficiently rich relational interpretation, but this is not a minimality or sufficiency proof. Critical anti-circularity condition: HistorySupport cannot encode FutureObs_PAA/the quotient as an oracle; an independently specified support language is required.

AB49: Fixed bounded HistorySupport language/separator matrix. Defines candidate support dimensions for lease/recheck semantics and states no surviving genuine collision was demonstrated inside the fixed bounded support language. This is bounded research only; semantic freeze is NOT declared. Open obligations include complete finite transition system, total HS reconstruction, exhaustive joint-transition collision search, and formal refinement/model checking.

## Cross-check against AB104.67
AB104.67's retrospective claims are consistent with the primary AB41–AB49 artifacts on the relevant boundaries:
- Protocol/bridge distinctions are repeatedly treated as semantic and claim-relative, not reducible to current validity bits.
- Renewal, replay/consumption, invalidation, actual linkage, and future successor behavior remain unresolved unless independently represented/reconstructible.
- The six-contract direction is explicitly conditional and anti-circular; no artifact in AB41–AB49 proves sufficiency, minimality, quotient congruence, or formal verification.
- AB104.67's status lines LEASE_RENEW=UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW, LEASE_CONSUME=UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW, REPLAY_HISTORY_REMOVAL=NOT_JUSTIFIED, REPLAY_RECONSTRUCTION=UNKNOWN, TERNARY_PAA_COLLISION=UNKNOWN, QUOTIENT_CONGRUENCE=UNKNOWN remain compatible with the primary artifacts.
- AB104.67 must remain retrospective evidence; where it summarizes earlier artifacts, the earlier artifacts remain the primary source.

## Important correction discipline
No AB41–AB49 artifact was promoted from bounded research to proof. TLA/refinement language remains model/research language unless an actual execution/proof artifact is independently verified.
No implementation was performed.
No semantic freeze was declared.
No missing AB number was invented.

## Carry-forward
1. Recover/verify any remaining AB41–AB49 semantic details only when needed; chronology is now exact.
2. Preserve UNKNOWN for quotient congruence, future-observation sufficiency, protocol completeness, ternary PAA collision, formal verification.
3. Next global-audit frontier: build a claim/evidence matrix over AB1–AB49, using primary artifacts first and retrospective continuity only as cross-check.
4. Keep AB56→AB58 FutureObs_PAA gap and the later AB104 Kafka/provenance findings as separate audit strata; do not merge them into historical proof.

## DO-NOT-REPEAT
Do not repeat broad ancestry recovery for AB41–AB49.
Do not treat attack specifications as protocol laws.
Do not import V13/V14/V15 coordination-lease semantics into P_AA.
Do not equate a current validity bit with complete bridge/lease semantics.
Do not call bounded collision absence a theorem or semantic freeze.
