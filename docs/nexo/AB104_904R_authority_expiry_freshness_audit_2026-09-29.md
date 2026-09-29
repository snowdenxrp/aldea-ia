# AB104.904R — Authority expiry vs freshness audit
Date: 2026-09-29

## Question
When authority valid at T1 expires while a later observation at T2 is fresher, can the newer observation resolve a historical claim?

## Fresh evidence
- OAuth RFC 7662 documents that cached introspection can become stale when a token is revoked; cache lifetime is therefore a validity boundary, not proof that the underlying historical event did or did not occur.
- OAuth RFC 7009 distinguishes immediate token invalidation at the authorization server from propagation delay to other servers.
- Google Cloud IAM documents eventual consistency for access changes and notes that recently revoked permissions may remain effective during propagation. IAM policy etags provide concurrency control for policy updates, while audit logs preserve policy-change history.
- W3C PROV models provenance with entities, activities, agents, derivations and temporal information; provenance is not equivalent to current validity.

## Attack
T1: Source A has contractual authority for historical EFFECT-7 lineage: EFFECT-7 -> R1/gen41.
T1+delta: A's authority window expires.
T2 > T1: Source B is fresher and authoritative for current projection: EFFECT-7 -> R2/gen42.
Question: does B's freshness overwrite/resolve A's expired historical claim?

## Findings
1. Expiration of present authority does not erase the historical claim made while that authority was valid.
2. A later source being fresher does not automatically make it authoritative for the historical claim.
3. Current authority and historical evidentiary validity are separate dimensions.
4. Expired authority means the source should not automatically authorize NEW actions at T2; it does not retroactively invalidate historical evidence produced under valid authority at T1.
5. A fresh T2 projection may legitimately supersede the T2 current-state claim while remaining insufficient to resolve T1 lineage.
6. If the historical claim itself requires continuing authority by contract, its evidentiary status must be re-evaluated under that contract; this is a domain rule, not a universal freshness rule.
7. Propagation delay demonstrates that an observation at T2 can reflect an older authorization state; therefore observation time alone cannot establish authority-at-effect-time.
8. No new top-level interaction class is justified. The case reduces to I21 (stale observation/order/freshness), provenance/authority dimensions, I18 when incarnation identity is involved, and class12 reconciliation; class11 when the disputed fact is an external effect.

## Refinements
- AUTHORITY_EXPIRY != HISTORICAL_ERASURE
- CURRENT_AUTHORITY != HISTORICAL_EVIDENCE_VALIDITY
- FRESHER_OBSERVATION != HISTORICAL_LINEAGE_PROOF
- OBSERVATION_TIME != AUTHORITY_AT_EFFECT_TIME
- REVOCATION/EXPIRY != RETROACTIVE_ERASURE
- PROPAGATION_DELAY != NEW_AUTHORITY
- CURRENT_PROJECTION_VALIDITY != HISTORICAL_EFFECT_LINEAGE_VALIDITY

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
