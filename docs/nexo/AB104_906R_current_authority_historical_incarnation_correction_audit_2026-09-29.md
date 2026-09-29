# AB104.906R — Current correction authority + destroyed/reused incarnation audit
Date: 2026-09-29

## Question
Can current authority safely correct a historical effect whose original resource incarnation was destroyed and whose resource ID was later reused?

## Fresh evidence
- Adyen reversal requests identify the original payment by its PSP reference and return a distinct PSP reference for the reversal request; the outcome is asynchronous. A refund/reversal therefore carries both a historical target reference and a distinct correction-operation identity.
- Adyen's referenced-refund documentation requires access to the original PSP reference across systems and supports multiple partial refunds; this demonstrates that correction lineage is tied to the original transaction reference rather than merely the current resource state.
- W3C PROV models derivation through explicit entity/activity/generation/usage paths, supporting the distinction between a current entity and its historical derivation lineage.

## Attack
R1/gen41/X exists.
EFFECT-1 is committed against R1/gen41.
R1 is destroyed.
R2/gen42 reuses resource ID X.
Current authority = gen42.
Policy explicitly allows current authority to compensate historical effects.
A correction C1 targets EFFECT-1.

Cases:
A) C1 binds to EFFECT-1 + R1/gen41.
B) C1 binds only to resource ID X.
C) lineage for R1 is partially missing.
D) current authority is valid but target lineage is ambiguous.

## Findings
1. Current authority can authorize a correction of a historical effect if policy explicitly grants that capability.
2. Authorization of the correction does not establish that the target is the intended historical effect.
3. Exact historical target binding is a separate requirement from executor authority.
4. If C1 binds to EFFECT-1 and preserved R1/gen41 lineage, reuse of X by R2 does not transfer C1 to R2.
5. If C1 binds only to X after reuse, target ambiguity exists: it may address R2 rather than the historical R1 effect. This reduces to I18 + I19 + class11/12.
6. If historical lineage is incomplete, current authority cannot manufacture missing ancestry merely because it is authorized now; result remains UNKNOWN/INCOMPARABLE until lineage is recovered.
7. A valid current authority plus invalid/ambiguous target binding must not yield a valid correction.
8. Therefore correction authorization and target identity are orthogonal dimensions.
9. No new top-level class is justified.

## Refinements
- CURRENT_CORRECTION_AUTHORITY != HISTORICAL_TARGET_IDENTITY
- AUTHORIZED_EXECUTOR != PROVEN_TARGET
- RESOURCE_ID != RESOURCE_INCARNATION
- EFFECT_ID + LINEAGE > CURRENT_RESOURCE_ID for historical correction targeting
- AUTHORITY_CANNOT_CREATE_MISSING_LINEAGE
- VALID_AUTHORITY + AMBIGUOUS_TARGET != VALID_CORRECTION
- CURRENT_AUTHORITY != HISTORICAL_EFFECT_ORIGIN

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
