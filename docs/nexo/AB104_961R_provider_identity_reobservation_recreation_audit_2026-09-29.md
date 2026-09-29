# AB104.961R — provider identity re-observation after deletion and recreation

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
If a historical provider resource identity is known, and a later observation returns NOT_FOUND or a resource with the same visible identifier, what can be concluded after deletion/recreation and eventual consistency?

## Fresh evidence
AWS EC2 explicitly documents eventual consistency: a resource ID can temporarily return a not-found error because the ID has not propagated, and AWS recommends repeated Describe calls with exponential backoff. EC2 also documents that idempotent retry results may contain updated information such as current creation status. AWS ECS documents that a successful RunTask retry with the same token and parameters returns the original result and exposes task ARNs; the token is cluster-scoped and has a defined TTL. A conflicting reuse of a client token can return the existing task ARNs associated with that token.

## Findings
1. NOT_FOUND is an observation at a time and consistency state, not by itself a historical deletion proof.
2. A later observation of the same provider identity is stronger than a visible-name match, but it still needs the provider's documented identity lifetime and non-reuse semantics.
3. If the provider guarantees non-reuse of the provider identity, NOT_FOUND after sufficient consistency convergence can establish absence of that specific historical identity at the observation boundary; it does not establish absence of a successor sharing the visible identifier.
4. If non-reuse is not guaranteed or the consistency window is unresolved, the historical-to-current binding remains incomplete.
5. A current resource with the same visible identifier but a different provider identity must be treated as a successor incarnation, not as the historical resource.
6. A replay response that returns the original provider identity is historical evidence about the original operation; it does not automatically convert a later visible-ID observation into the same incarnation.
7. Repeated reads are evidence only when combined with a known consistency/identity contract; repetition alone is not lineage proof.
8. The evidence model should therefore separate:
   - historical operation binding,
   - provider resource identity,
   - current observation,
   - consistency convergence,
   - successor-incarnation relation.
9. No new top-level interaction class is justified. This strengthens I18/I19/I21/I22 and classes 7, 12, and 19; class 20 remains conditional on an explicit atomic boundary.

## Anti-collapse
NOT_FOUND(t2) != DELETE_PROOF
NOT_FOUND(t2) != HISTORICAL_ERASURE
SAME_VISIBLE_ID != SAME_PROVIDER_ID
SAME_PROVIDER_ID != SAME_OPERATION
REPEATED_READS != LINEAGE_PROOF
CONSISTENCY_CONVERGENCE != HISTORICAL_IDENTITY
SUCCESSOR_RESOURCE != HISTORICAL_RESOURCE
UNKNOWN != FAILED

## Classification
Primary: I18, I19, I21, I22; classes 7, 12, 19.
Secondary: I15 and class 20 where idempotency/atomicity boundaries are explicit.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
A historical provider identity and a current observation can only be joined when the provider's identity and consistency contracts support that join. A transient NOT_FOUND must not be promoted to deletion proof, and a matching visible identifier must not be promoted to historical continuity. Where the identity edge or consistency convergence is unresolved, preserve UNKNOWN/partial knowledge.
