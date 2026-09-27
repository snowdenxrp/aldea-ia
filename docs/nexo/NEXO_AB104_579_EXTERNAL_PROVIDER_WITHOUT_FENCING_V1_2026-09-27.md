# NEXO — AB104.579 — Providers without Nexo fencing/CAS

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
AWS states that retries are safe only when the operation is idempotent, and that non-idempotent external effects require stronger semantics or no retry. citeturn0search0turn0search3
AWS documents that idempotency tokens can be scoped to a provider's own semantics and even region; the same token can legitimately represent distinct operations in different scopes. citeturn0search5
AWS guidance also recommends propagating idempotency identity through downstream services, but this does not create a cross-provider fence when the receiving API cannot enforce one. citeturn0search2

## Finding
If an external provider cannot consume or enforce Nexo's fence/dependency predicate, Nexo cannot honestly claim atomic authorization-to-effect.
The protocol must downgrade its guarantee rather than simulate a fence locally.

## Safe fallback
1. Generate a durable unique EffectID.
2. Bind it to provider/resource incarnation and exact effect contract.
3. Record the local authority/fence snapshot before submission.
4. Submit only when policy permits the residual race.
5. Treat timeout/ambiguous response as UNKNOWN.
6. Reconcile using provider-native identity/state.
7. Never infer that a local fence invalidated an already accepted provider operation unless provider evidence supports that conclusion.
8. Block dependent effects while the outcome or causal status is unresolved.

## Guarantee classification
Provider supports atomic fence/CAS → STRONG external commit guard.
Provider supports durable idempotency only → duplicate suppression, but NOT necessarily current-authority fencing.
Provider supports neither → at-most-once/no-retry or UNKNOWN containment; exact-once external mutation cannot be claimed.

## Important result
Idempotency solves a different problem from fencing:
IDEMPOTENCY = same request does not create duplicate effect.
FENCING = obsolete authority cannot create/commit the effect.
A provider can provide the first without providing the second.

## Adversarial case
Nexo authorizes E at epoch 7. Provider accepts E. Nexo advances to epoch 8. Provider has no fence field and later executes E.
Local epoch 8 cannot retroactively cancel provider execution.
Correct result: preserve provider execution as historical fact, preserve authority timeline, mark any policy conflict explicitly, and decide compensation/forward recovery separately.

## New invariant
When external atomic fencing is unavailable, the residual authorization race MUST remain explicit in the effect contract and evidence state; it must never be represented as equivalent to an atomically fenced commit.

## Closure
AB104.579 closes the narrow question: without provider-side fencing/CAS, Nexo can still obtain bounded guarantees through durable identity, idempotency, reconciliation, dependency blocking and explicit residual-risk states, but cannot claim cross-domain atomic authorization.

Still OPEN:
- multi-provider effects;
- causal cycles;
- compensation ordering;
- human-review escalation;
- formal verification;
- implementation/fault injection.

## Next exact step
AB104.580 — research multi-provider/multi-resource effects: when one logical Nexo action spans providers with different fencing/idempotency guarantees, how the weakest boundary constrains the whole effect contract.