# AB104.876R — authorization-cache staleness + regional failover audit
Date: 2026-09-29
Parent: AB104.875R
Mode: research/audit only

## Question
Can one region retain revoked authorization while another has the new policy after failover/migration, and does this create a new interaction beyond class 9 + I18 + I21?

## Fresh evidence
- Google Cloud IAM explicitly documents eventual consistency for access changes: recently revoked roles/permissions may remain effective temporarily, and policy changes commonly propagate in about two minutes but can take seven minutes or more. citeturn0search2turn0search13
- OCI documents asynchronous cross-region replication and warns that secondary reads can be stale; after disaster recovery, the secondary can be converted to standalone. It also notes ACL users/configuration are not automatically copied and recommends matching permissions where possible. citeturn0search10
- Distributed authorization research documents transient inconsistencies among authorization replicas and the need to reconcile them through further communication. citeturn0search11
- A recent IETF individual draft explicitly frames the authorization-to-effect boundary: a cryptographically authentic authorization can become stale before the protected effect, and cached authorization freshness can be a security parameter. This is an individual draft, not a finalized standard. citeturn0search6

## Attack
Region R1 receives revocation P2 for authority generation G2. R2 still has P1/G1 because replication/cache is stale. Failover sends a delayed operation/correction from R1 or a retry to R2. R2 accepts using G1 while R1 would reject using G2. Later reconciliation propagates P2.

## Analysis
A. Same operation reaches R2 during stale window: this is class 9 authority-generation/fencing + I18 regional/domain scope + I21 freshness/order. Authentication remains separate (class 19).
B. R2 accepts an external effect under G1 while R1 has already revoked G1: if the resource/effect is consequential, class 11 applies for effect knowledge and class 12 if reconciliation is required. This does not create a new top-level class.
C. Delayed correction C1 from R1 arrives at R2 after failover: correction lineage remains I19; active region is not authoritative historical lineage, preserving the AB104.871R refinement.
D. R2 lacks the new policy entirely because ACL/configuration was not migrated: this is a cross-domain authority-state consistency problem, still class 9 + I18. The fact that migration caused it does not make migration a new interaction class.
E. R2 cannot establish whether G1 or G2 was authoritative at the exact commit boundary: preserve UNKNOWN/INCOMPARABLE rather than infer from arrival time or active-region status.

## Key refinement
`POLICY_VERSION != ACTIVE_REGION`
`AUTHORIZATION_FRESHNESS != AUTHENTICATION_VALIDITY`
Failover changes routing/availability context; it does not automatically establish which authority generation was valid for a historical operation or effect.

## Important boundary
This scenario strengthens class 9 as a resource/authority-side enforcement problem, but does not merge it with class 19. A valid credential can be presented to a stale policy replica and be cryptographically authentic while lacking current authority.

## Disposition
No new top-level interaction class frozen.
Reduced to class 9 + I18 + I21, with class 19 kept separate and I19/class 11/class 12/I22 as applicable.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

## Candidate invariants
INV-TE-66: Failover must not by itself establish current authority generation.
INV-TE-67: Each enforcement region must expose the authority/policy version used for a consequential decision.
INV-TE-68: A stale regional policy decision must not be treated as proof of current authority.
INV-TE-69: Regional migration/failover must preserve authority lineage or explicitly enter an UNKNOWN state when lineage cannot be established.
INV-TE-70: Authentication evidence and authorization-freshness evidence remain separate evidence domains.

## Next
AB104.877R — investigate cross-region failover where R1 and R2 hold different authority generations and the same logical operation has an external effect in both regions; determine whether multi-region authority split plus duplicate external effect is fully covered by class 9 + I18 + class 11 + I22 or requires a distinct interaction.

NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED