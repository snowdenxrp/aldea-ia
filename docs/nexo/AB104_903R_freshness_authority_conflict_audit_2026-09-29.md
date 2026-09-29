# AB104.903R — Freshness vs contractual authority audit
Date: 2026-09-29

## Scope
Test whether a newer observation should outrank an older observation when the older source has stronger contractual authority for the specific claim.

## Evidence
- W3C PROV separates entities, activities, agents, derivations, responsibility and provenance; provenance is explicitly useful when integrating heterogeneous or contradictory information. It does not define a universal winner rule between sources.
- Google Spanner demonstrates a domain-specific case where commit timestamps provide external consistency: the ordering guarantee comes from the system's declared consistency contract, not simply from wall-clock recency.
- Spanner change streams use commit_timestamp + server_transaction_id + record_sequence to derive ordering; timestamps alone are not the complete identity/order tuple.

## Attack
A claims EFFECT-7 -> R1/gen41 at t1 and has contractual authority for external-effect lineage.
B claims EFFECT-7 -> R2/gen42 at t2, where t2 > t1, but B is only authoritative for a newer local projection.

## Findings
1. Newer observation does not universally outrank stronger contractual authority.
2. Freshness is an evidence dimension; authority is a claim/domain dimension.
3. Ordering can be authoritative only inside a contract that defines what the ordering means (e.g. commit ordering in a consistency system).
4. A timestamp alone cannot establish lineage authority.
5. If B is newer but outside the authoritative domain for historical external-effect lineage, A remains authoritative for that claim; B may still be authoritative for current local projection.
6. If both sources are authoritative for the same claim and their claims are incompatible, result remains CONFLICTING/UNKNOWN until a declared resolution rule or stronger evidence resolves it.
7. No new top-level interaction class is justified. This reduces to I21 + provenance/authority dimensions + class12, with class11 when the disputed fact is an external effect.

## Refinements
- FRESHNESS != AUTHORITY
- NEWER OBSERVATION != STRONGER CLAIM
- TIMESTAMP ORDER != LINEAGE AUTHORITY
- PROJECTION AUTHORITY != HISTORICAL EFFECT AUTHORITY
- SOURCE RECENCY != SOURCE PRECEDENCE
- ORDERING GUARANTEE IS DOMAIN-CONTRACTUAL, NOT UNIVERSAL

## Epistemic status
No Nexo implementation. No formal verification. No semantic freeze. No new top-level class frozen. 20-class taxonomy remains unfrozen. W19/W20 remain unfrozen. FutureObs_PAA remains open. V21 forbidden.
