# AB104.905R — Revoked origin authority vs late correction audit
Date: 2026-09-29

## Question
An external effect was created under R1/gen41 while authority was valid. That authority is later revoked. A correction/reversal arrives afterward. Which authority governs the correction?

## Fresh evidence
- RFC 7009 defines revocation as invalidating a token for future use, while acknowledging propagation delay. It does not describe revocation as erasing the historical actions performed while the token was valid.
- Adyen's reversal API binds the reversal request to the original payment pspReference and returns a separate reference for the reversal request; the outcome is asynchronous. Refund/reversal therefore has its own operation identity while remaining explicitly linked to the original effect.
- Adyen documents that refund processing is asynchronous and uses the original payment reference to identify the target.

## Attack
T1:
R1/gen41 has valid authority.
EFFECT-1 is committed.
ORIGIN_AUTHORITY = gen41.

T2:
gen41 is revoked.
R2/gen42 becomes current authority.

T3:
A correction C1 is required against EFFECT-1.

Cases:
A) R2 is explicitly authorized to compensate historical effects.
B) only gen41 can authorize corrections.
C) neither rule is declared.
D) C1 arrives from a stale gen41 executor after revocation.

## Findings
1. Revocation of gen41 does not erase EFFECT-1's historical origin.
2. A correction is a new operation with its own authority decision; it is not automatically authorized because EFFECT-1 was authorized.
3. A current generation may legitimately perform a correction of an older effect if policy explicitly grants that authority and binds the correction to the historical target.
4. If policy requires origin-generation authority and gen41 is revoked, a late gen41 correction must be rejected/invalidated as an execution attempt, while EFFECT-1 remains historical fact.
5. If no correction-authority rule exists, the safe epistemic result is UNRESOLVED/UNKNOWN rather than assuming either origin or current authority.
6. A correction operation must bind to the historical effect/resource identity; current resource ID alone is insufficient when incarnations can be reused.
7. A successful correction does not erase the original effect; it adds a new historical fact linked to it.
8. This remains reducible to I9 authority-generation/fencing + I18 incarnation identity + I19 correction/reversal + class11 external-effect ambiguity + class12 reconciliation. No new top-level class is justified.

## Refinements
- EFFECT_ORIGIN_AUTHORITY != CORRECTION_AUTHORITY
- REVOCATION != HISTORICAL_ERASURE
- CURRENT_AUTHORITY MAY_OR_MAY_NOT_AUTHORIZE_HISTORICAL_CORRECTION (POLICY-DEPENDENT)
- CORRECTION_OPERATION != ORIGINAL_OPERATION
- CORRECTION_IDENTITY MUST_BIND_TO_HISTORICAL_TARGET
- STALE_CORRECTION_EXECUTOR != HISTORICAL_EFFECT_INVALIDATION
- CORRECTION_SUCCESS != ORIGINAL_EFFECT_ERASURE

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
