# NEXO — AB104.574 — Effect identity across external resource/provider reincarnation

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE. No V21. No runtime construction. No formal verification.

## Exact question
When an external side effect has UNKNOWN outcome, can the same EffectID safely be retried after the provider, account, resource, or execution environment has been replaced or reincarnated?

## Evidence
Stripe documents idempotency keys as stable identifiers for retries and stores the first result so later requests with the same key return the same result. It also rejects reuse when the parameters do not match the original request. This shows that idempotency requires both stable identity and request equivalence, not merely a random token. citeturn0search0turn0search3

AWS guidance likewise recommends stable idempotency tokens across retries and explicitly warns that retries can otherwise repeat side effects. It also notes that keys must be generated in a durable step so replay does not generate a different key. citeturn0search5turn0search6turn0search9

Stripe's forwarding API provides a useful boundary example: the outer Stripe idempotency key is distinct from the idempotency key used on the underlying third-party request. This demonstrates that idempotency identity is scoped to a particular execution/provider boundary rather than being universally interchangeable. citeturn0search4

## Finding
EffectID alone is insufficient if the external target can reincarnate.

A safe external effect identity needs at least:
EffectID
+ ProviderIncarnation/EndpointIdentity
+ ResourceIncarnation
+ EffectContractDigest
+ authorization/fence context.

Therefore:

EFFECT_IDENTITY != RESOURCE_IDENTITY
EFFECT_IDENTITY != PROVIDER_IDENTITY
OLD_EFFECT_RECORD != CURRENT_RESOURCE_STATE

## Core problem
Suppose:

T0: Nexo sends EffectID E17 to Provider P for Resource R.
T1: network failure; outcome UNKNOWN.
T2: R is destroyed.
T3: a new Resource R' receives the same external name/ID.
T4: provider is asked to retry E17.

If the provider treats E17 as universally idempotent without incarnation binding, the retry could be incorrectly interpreted as the original operation against R', even though the original operation targeted R.

That would violate effect identity.

## Candidate effect contract
An EffectRecord should bind:

EffectID
ProviderIdentity
ProviderIncarnation
ResourceIdentity
ResourceIncarnation
EffectContractDigest
RequestDigest
AuthorityEpoch/Fence
Operation/mission identity
Creation/validity boundary.

The exact tuple remains a design candidate.

## UNKNOWN protocol
If external outcome is UNKNOWN:

1. Do NOT automatically issue a new effect.
2. Query the same provider/resource incarnation for the exact EffectID.
3. Verify the returned record against the original EffectContractDigest/request identity.
4. If the provider proves COMMITTED for the same incarnation → record external effect as committed.
5. If provider proves NOT_COMMITTED → a retry may be considered, but only under a still-valid fence/contract.
6. If provider/resource incarnation changed → old EffectID cannot automatically authorize action against the new incarnation.
7. If the provider cannot establish lineage → remain UNKNOWN/QUARANTINED.
8. A new incarnation requires a new effect identity or an explicit, separately authorized semantic mapping.

## Critical distinction
RETRY SAME EFFECT is not equivalent to EXECUTE AGAIN.

A retry is safe only when the receiving authority can prove that the request belongs to the same effect identity and target incarnation.

Otherwise a retry is a new external effect and requires a new authorization decision.

## Provider replacement
If Provider P is replaced by Provider P2, even if P2 exposes the same API and resource identifiers, P2 cannot automatically inherit P's historical EffectID namespace.

A migration contract may establish continuity, but it must explicitly transfer:
- effect records;
- request equivalence;
- resource incarnation;
- provider lineage;
- authorization/fence state;
- continuity evidence.

Without that, historical UNKNOWN remains UNKNOWN across the provider boundary.

## Resource replacement
If resource R@incarnation7 is replaced by R@incarnation8, an effect committed to incarnation7 is historical evidence only.

It must not be reported as an effect on incarnation8.

This prevents dangerous false statements such as:
DELETE R@7 committed → R@8 is deleted.

## Adversarial cases
A. Response lost after provider committed → reconcile same provider/resource incarnation.
B. Response lost before provider execution → provider proves NOT_COMMITTED; retry may be possible.
C. Resource deleted and recreated → old EffectID must not target the new incarnation.
D. Provider account migrated → migration must explicitly preserve effect lineage or UNKNOWN persists.
E. Provider reuses an old idempotency key after retention expiry → no automatic assumption of historical identity; Stripe's documented key pruning illustrates why indefinite key uniqueness cannot be assumed from the provider contract. citeturn0search0
F. Same EffectID with different request parameters → reject as identity collision/misuse, not execute.
G. Same EffectID reaches a different provider → not the same effect unless an explicit continuity mapping exists.
H. Fence revoked after UNKNOWN → old effect cannot be resurrected merely because provider later reports success; current policy must determine whether that historical success remains admissible evidence and whether compensation/recovery is required.

## New invariants
1. EFFECT_COMMITTED@INCARNATION_X does not imply EFFECT_COMMITTED@INCARNATION_Y.
2. UNKNOWN external outcome does not authorize a new external mutation.
3. Same EffectID + different contract/target incarnation is an identity conflict.
4. Provider idempotency retention is part of the effect contract; after expiry, the provider cannot be assumed to remember the old key.
5. Historical external success and current authorization are separate dimensions.

## Architectural consequence
The existing EffectID/fence/reconciliation concept needs an explicit external lineage layer:

EffectIntent
→ Provider/Resource Incarnation Binding
→ External Submission
→ {COMMITTED | NOT_COMMITTED | UNKNOWN}
→ Reconciliation
→ Historical EffectRecord
→ Current admissibility evaluation.

The external provider is an evidence/authority domain of its own. Nexo must not collapse its internal authoritative state with the provider's state.

## Closure status
AB104.574 closes the narrow question that a bare EffectID is insufficient across external provider/resource reincarnation.

Still OPEN:
- exact incarnation discovery and authentication;
- provider migration semantics;
- retention/expiration handling;
- cross-provider continuity mapping;
- compensation when a stale effect committed after its fence became invalid;
- formal verification;
- implementation/fault injection.

## Next exact step
AB104.575 — research the hardest remaining case: an external effect commits after Nexo's authority fence has expired or been revoked. Determine whether the result is valid historical evidence, an unauthorized effect requiring compensation, or an epistemic conflict, and how Nexo must model all three without rewriting history.
