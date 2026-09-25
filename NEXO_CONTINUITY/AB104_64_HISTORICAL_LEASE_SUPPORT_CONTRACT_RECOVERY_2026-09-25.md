# AB104.64 — historical lease support contract recovery — 2026-09-25

Recovered directly from canonical historical commits AB18, AB25, AB26 and AB49.

## Established historical evidence
AB18 defines LeaseBridge candidate components including FreshnessValidity, ReplayBinding and TemporalValidity, and states completeness is adversarial/future-behavioral.
AB25 defines the six action-contract dimensions: Pre, Post, Frame, Invalidation, HistorySupport, AdmissionLink; hidden lease replay is an explicit attack.
AB26 gives LeaseExpire semantics but does not provide a complete LeaseRenew or LeaseConsume law.
AB49 explicitly permits lease interval, expiry, renewal, consumption and replay as HistorySupport primitives, while forbidding future-observation/quotient oracles.

## Important distinction
These artifacts establish that renewal and consumption are legitimate semantic/history dimensions to preserve, but they do NOT establish their complete executable transition relations.

Therefore:
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW

## Consequence
The missing law is now narrowed: we are not missing whether renewal/consumption matter; we are missing their complete Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink semantics and legal successor domain.

No collision is promoted. No semantic freeze. No formal verification.

## Next exact frontier
Recover the historical commits immediately following AB49/AB50 and inspect whether the finite transition interpreter or later AB54/AB55 encoded these laws from canonical evidence or only as research candidates.