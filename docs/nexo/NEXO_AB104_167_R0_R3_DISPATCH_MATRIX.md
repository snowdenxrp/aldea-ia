# NEXO AB104.167 R0-R3 DISPATCH MATRIX

Research checkpoint. No implementation.

R0: local lifecycle protection only; external duplicate prevention and authoritative reconciliation are not proven.
R1: provider idempotency/reconciliation may make same-identity retry safe, but stale-owner exclusion is not proven.
R2: provider/resource conditional fencing can reject stale authority when every protected mutation path is covered; this does not imply multi-resource atomicity.
R3: stronger atomic claims are valid only inside the exact provider transaction scope.

M1 claim before send: safe as NOT_STARTED only if the protocol proves no send can occur before the durable claim. Otherwise UNKNOWN.
M2 send before claim durable: missing local claim cannot prove absence; preserve UNKNOWN.
M3 acceptance before local record: missing local record is not rejection; reconcile exact provider identity.
M4 response loss after execution: preserve identity and reconcile; do not create a new effect identity merely because the response was lost.
M5 STOP: invalidates future dispatch authority; it does not prove cancellation of an already-issued external effect.
M6 owner/recovery transfer: old worker loses retry/release authority; late evidence may still describe the same effect.
M7 resource replacement: old incarnation is invalid unless continuity is proven.
M8 retry/reconciliation race: both must converge on one lifecycle/effect identity.
M9 idempotency expiry: loss of deduplication state is not proof of historical non-execution.
M10 parameter mismatch: identity-contract violation, not proof of absence.
M11 intermediary duplication: every effect-capable intermediary must be included in the identity/fence contract.
M12 multi-resource confirmed plus unknown: aggregate remains partial/unknown unless one authoritative transaction covers all required participants.

Promotion rule: UNKNOWN becomes CONFIRMED only with authoritative evidence tied to the exact effect identity, resource incarnation and applicable transaction/fence scope. UNKNOWN becomes REJECTED only with evidence that establishes rejection/non-acceptance. Otherwise UNKNOWN/HOLD remains the correct state.

Safe retry and proof of non-execution are distinct properties.

External references checked: RFC 9110 retry/idempotency semantics; AWS EC2 client-token idempotency and parameter mismatch semantics. These are reference provider contracts, not Nexo proof.

No V21. No formal verification. No CI PASS claim.

Next: research identity lifetime, idempotency expiry, parameter immutability, resource-incarnation binding and stale-owner rejection; then define minimum evidence separating R1 from R2.
