# AB104.929R — Explicit retroactive authorization: evidence boundary
Date: 2026-09-29

## Question
A3 at T6 explicitly contains a retroactive clause. What evidence is minimally required to reassess EFFECT-2 without falsely claiming that A2 authorized the effect at T5?

## Fresh evidence
W3C PROV separates activities/entities, their temporal events, derivations, and invalidation, and provides consistency constraints for provenance histories. It also cautions that provenance relations are not freely inferable merely from shared usage/generation facts. citeturn0search24turn0search2
RFC 2906 requires authorization information to be timely and expire/revoke according to the authorization model, while also allowing authorization decisions to be made in advance of service requests. citeturn0search7
A September 2026 individual IETF Internet-Draft explicitly studies the execution/finality boundary for stale authorization; it is an individual draft, not an IETF standard, so it is evidence of the problem framing rather than normative authority. citeturn0search6

## Scenario
T3: O2 accepted under A2.
T4: A2 expires.
T5: provider confirms EFFECT-2.
T6: A3 is issued with an explicit retroactive clause covering some historical interval.

## Minimum evidence boundary
A retrospective assessment should require, at minimum:
1. A3's immutable identity/version and issuer/authority.
2. The exact retroactive clause, including effective interval, affected operation/effect types, target scope, and whether it changes validity, permissibility, accountability, or only future remediation.
3. A2's identity/version, validity interval, and checkpoint semantics.
4. O2's stable operation identity and exact lifecycle timestamps: submission, acceptance, execution (if observable), commit/completion.
5. EFFECT-2's provider-native effect identity and authoritative effect timestamp/receipt, with distinction between receipt and effect time where the provider exposes both.
6. Target identity plus incarnation/lineage sufficient to bind the effect historically.
7. Evidence connecting A3's retroactive scope to O2/EFFECT-2. Mere temporal overlap, same target, same payload, or current authority is insufficient.
8. A separate historical assessment record stating that the effect is being reclassified under A3; it must not mutate the original A2 decision/evidence.
9. If A3 is itself later revoked/corrected, preserve the chain of assessments rather than collapsing them.
10. Any unresolved timestamp, target, lineage, or policy-scope ambiguity remains UNKNOWN/CONFLICTING.

## Critical boundary
A3 can establish:
RETROACTIVE_POLICY_APPLIES_TO(EFFECT-2)

It does NOT thereby establish:
A2_WAS_VALID_AT_T5

Nor:
EFFECT-2_WAS_AUTHORIZED_BY_A2

And it does not prove:
EFFECT-2_DID_NOT_OCCUR_BEFORE_T6

## Three separate questions
A. Historical fact: Did EFFECT-2 occur, and when?
B. Original authorization: Was EFFECT-2 authorized under A2 at the applicable checkpoint?
C. Retrospective classification: Does A3 explicitly change the policy classification of that already-occurring effect?

A, B, and C must be independently represented.

## Anti-collapse rule
Never replace B=UNKNOWN with C=TRUE.
Never replace an effect fact with a policy classification.
Never use a later authorization to infer an earlier authorization unless the contract explicitly defines that temporal bridge and the evidence binds it to the exact historical effect.

## Classification
No new top-level interaction class.
Primarily I9/I19/I21 + class11/class12; I24 where O2 spans authority boundaries.

## Epistemic status
Research only. No implementation. No formal verification. No semantic freeze. 20 classes remain unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.