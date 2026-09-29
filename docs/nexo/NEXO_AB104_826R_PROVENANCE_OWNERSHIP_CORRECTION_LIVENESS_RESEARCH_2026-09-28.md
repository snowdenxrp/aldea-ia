# NEXO AB104.826R — provenance / ownership / correction / liveness research

**Date:** 2026-09-28  
**Status:** RESEARCH ONLY / NO NEXO IMPLEMENTATION / CONTINUITY RECORD

## Objective

Attack the four semantic questions left by AB104.825R using current external evidence and real system patterns:

1. provenance vs identity/authentication at the protected boundary;
2. ownership epoch vs recovery/incarnation;
3. correction of evidence after retention expiry;
4. liveness/deadline interaction with authority and safety.

## 1. Provenance is not reducible to identity

Current evidence from idempotency systems shows that an operation identity is used to recognize retries of the same logical request. Stripe, for example, stores the result associated with an idempotency key and replays the same result for later requests using that key. This establishes request identity semantics, not provenance of the actor or authority to perform the request. SOURCE CONFIRMED.

Kafka's transactional producer uses producer identity/epoch to fence older producer generations. That is authority-generation evidence, not proof that an application-level request has the same provenance merely because it carries the same logical operation ID. SOURCE CONFIRMED.

**Result:** provenance/identity/authentication remain distinct dimensions in the Nexo model. A valid operation_id does not prove who originated it; authenticated origin does not prove current authority; current authority does not prove that a retry is the same logical operation.

## 2. Ownership epoch is related to, but not identical with, recovery/incarnation

Kafka's producer epoch demonstrates a concrete fencing mechanism: a newer producer generation can fence an older instance using the same transactional identity. The generation change can occur as part of transactional recovery without implying that every application-level ownership transition is identical to process recovery. SOURCE CONFIRMED.

Therefore:

- incarnation = identity of a process/session generation;
- ownership epoch = authority to act on a protected resource;
- recovery = transition caused by failure/restart/reconstitution.

They may advance together, but the model must not infer equivalence without an explicit invariant.

**Result:** the second-order search does justify retaining an independent ownership-generation predicate. This strengthens I5/I10 and does not create a new top-level class by itself.

## 3. Correction after retention expiry

The transactional-outbox and idempotent-consumer patterns show that durable identifiers and processed-message state are retained specifically to prevent ambiguous retries/duplicates. If that identity/evidence is pruned, a later retry may no longer be recognized as the original operation. SOURCE CONFIRMED.

Stripe explicitly documents that once an idempotency key is automatically pruned, a later request using that key is treated as a new request. SOURCE CONFIRMED.

This establishes a concrete semantic hazard:

`original evidence retained -> correction can target known operation`

versus

`evidence expired -> same identifier may no longer establish historical identity`

A later authoritative correction therefore cannot safely rely on absence of retained evidence as proof that the original event did not happen.

**Result:** correction × retention-expiry is a genuine interaction dimension when correction semantics depend on historical identity. It is currently represented through I2/I9/W13, but the exact correction-after-expiry variant remains a candidate temporal refinement rather than a new class.

## 4. Liveness/deadline does not automatically change authority

The researched systems distinguish delivery/retry liveness from authorization/fencing. Kafka idempotence prevents duplicate log entries under producer retry, while producer epochs fence obsolete transactional producers. The mechanisms solve different problems. SOURCE CONFIRMED.

Similarly, the transactional-outbox pattern makes delivery eventually reliable after commit, while consumers still need idempotency because the relay may publish more than once. SOURCE CONFIRMED.

Therefore a deadline expiration cannot be treated as an authority revocation unless the model explicitly defines that policy. A timeout may instead produce UNKNOWN and trigger reconciliation.

**Result:** liveness/deadline is a separate epistemic/scheduling dimension. It does not generate a new safety class merely by existing. It becomes a distinct interaction only when deadline state changes a protected-boundary decision, such as permitting stale work, revoking a lease, or changing reconciliation state.

## 5. Real-system cross-check: transactional outbox

The transactional-outbox pattern stores the message in the same database transaction as the business update, then uses a relay to publish it. The relay may publish more than once if it crashes after publishing but before recording completion, so consumers must be idempotent. SOURCE CONFIRMED.

This reinforces three separate boundaries:

- durable intent/journal;
- delivery;
- effect/consumer acceptance.

The pattern does not make an arbitrary external side effect exactly-once; it moves the ambiguity boundary and requires an idempotent consumer.

## 6. Real-system cross-check: idempotent request

Stripe's documented behavior is particularly useful for the Nexo evidence model: the same idempotency key maps to the saved result, but keys can be pruned. Reuse after pruning can therefore represent a new request. SOURCE CONFIRMED.

This is direct evidence that **retention policy is part of identity semantics** for some real systems.

## 7. Consequence for the interaction grammar

The four pending questions produce the following disposition:

| Candidate dimension | Result |
|---|---|
| provenance × identity/authentication | INDEPENDENT PREDICATE CONFIRMED |
| ownership epoch × incarnation/recovery | INDEPENDENT PREDICATE CONFIRMED |
| correction × retention expiry | GENUINE TEMPORAL VARIANT; currently mapped to existing retention/incarnation family, not new class |
| liveness/deadline × authority | CONDITIONAL; only mandatory when deadline changes protected-boundary decision |

This does **not** justify blindly creating four new witnesses.

## 8. New bounded interaction candidates

Two candidates now deserve explicit evaluation:

**I14 — provenance × authentication × authority**

A message can be authentically from an identified source while its provenance chain or delegated authority is stale/incomplete. The protected boundary must not collapse source authentication into provenance or current authority.

**I15 — correction × retention expiry × reconciliation**

Historical evidence for operation O expires; a later authoritative correction targets O; reconciliation must distinguish absence of retained evidence from proof of non-occurrence.

Both are currently **UNTESTED CANDIDATES**. They are not yet accepted as mandatory witnesses.

## 9. Methodological conclusion

The second-order search did not close the universe. It did, however, establish that the seven predicate axes are not interchangeable and that retention can change the meaning of identity evidence.

NIST's ordered-combination work supports this methodology: stateful coverage depends on ordered interactions, and the interaction strength/order must be explicitly specified rather than inferred from test count. SOURCE CONFIRMED. citeturn0search0turn0search24

FaultFuzz provides complementary distributed-systems evidence that special timing combinations can trigger recovery bugs and that coverage-guided exploration is useful because brute-force fault combinations explode combinatorially. SOURCE CONFIRMED. citeturn0search4

## Current status

- 20 classes: UNFROZEN
- W1-W16: retained provisionally
- I1-I13: current declared interactions; I9-I11 required explicit refinements
- I14-I15: new candidates, UNTESTED
- finite denominator: NOT FROZEN
- formal verification: NOT PERFORMED
- implementation: NOT STARTED
- universal completeness/security: NOT CLAIMED

## Exact next action

**AB104.827R:** attack I14/I15 for redundancy against W10/W15/W13/W16 and audit whether provenance and retention are already fully represented in the existing witnesses. Then perform a bounded coverage-table generation from the current grammar, with every candidate marked FULL/PARTIAL/UNTESTED/EXCLUDED/DUPLICATE and a reason. Do not freeze the denominator until that table is independently auditable.

**No deletion. No overwrite. No silent migration.**
