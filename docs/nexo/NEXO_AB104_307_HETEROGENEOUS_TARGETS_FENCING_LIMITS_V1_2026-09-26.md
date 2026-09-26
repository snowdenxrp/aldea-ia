# NEXO AB104.307 — Heterogeneous targets and fencing limits

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
A fencing token is only a safety boundary where the protected target can actually validate its ordering and reject stale authority. Heterogeneous or third-party targets that cannot enforce the token are outside that direct guarantee.

## Evidence
Chubby-style sequencers are attached to commands and validated by downstream servers; legacy systems that cannot validate them require weaker mechanisms such as lock-delay. Modern fencing references likewise emphasize that the resource, not the client, must enforce the token.

## Nexo consequence
1. Classify every external target by enforcement capability: FENCED, VERSION/CAS, IDEMPOTENCY_ONLY, UNCOOPERATIVE, or UNKNOWN.
2. A shared/global authority epoch can coordinate intent, but it cannot create target-side safety where the target ignores it.
3. For UNCOOPERATIVE/UNKNOWN targets, current authority cannot be inferred from the coordinator's state alone; external effect outcome may remain UNKNOWN.
4. An owned intermediary can create a new enforcement boundary, but the intermediary's own effect contract and the final target's semantics must be modeled separately.
5. Lock-delay is a mitigation for non-fencing resources, not equivalent to target-side fencing and not proof of external atomicity.
6. Aggregate mission/effect state must retain per-target enforcement class and evidence quality.

## Candidate evidence rule
Current executable permission may be asserted only for a target when its actual effect boundary enforces the applicable authority/fence/version contract. Otherwise the system can authorize an attempt, but cannot manufacture target-side safety evidence.

## Explicit non-claims
No implementation, architecture selection, or universal external-effect guarantee is established.

## Sources studied
Chubby sequencer/fencing descriptions and current distributed-systems references on protected-resource enforcement and non-cooperating targets. citeturn0search3turn0search2

## Next
AB104.308 — investigate intermediary/outbox patterns for non-fencable targets and the exact boundary between durable intent, accepted request, and external effect.
