# NEXO AB104.778R — fence linearization and concurrent in-flight effects

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Scope
Determine where a fencing system linearizes acceptance/rejection when an old operation races a new authority generation, and whether the resource-side guard itself prevents a stale operation from becoming durable.

## Evidence A — resource-side high-water mark
Current ahrtr/disco Guard implementation uses an atomic high-water mark. Check loads the current mark, rejects a lower token, and uses compare-and-swap before accepting/advancing the mark. If another concurrent request advances the mark between Load and CAS, the CAS fails and the stale request re-evaluates against the newer mark. This makes the acceptance decision itself the synchronization boundary, rather than relying on a prior read. citeturn0search1

## Evidence B — explicit zombie test model
disco documents HTTP/gRPC zombie scenarios and a resource Guard that receives the fencing token at the protected resource. Its documented scenario is: owner A gets token 34, ownership moves to B with token 51, A becomes a zombie and later writes with 34, and the resource rejects 34 < 51. This is exactly the in-flight-after-fence model under study. citeturn0search1

## Evidence C — independent fault-injection experiment
Faultline reports a real process-pause experiment with Celery/Redis/PostgreSQL: worker A receives token 1 and is paused before commit; visibility expires; worker B receives token 2 and commits; A resumes and attempts its stale commit. The unsafe implementation produced two committed effects, while the fenced PostgreSQL commit checked the presented token against current ownership and rejected A, leaving one committed effect. The project explicitly limits the claim to its included experiment and does not claim universal exactly-once or formal proof. citeturn0search4

## Linearization result
The strongest evidence now supports a resource-side linearization point at the conditional commit itself:

old operation -> resource guard -> compare current acceptance state -> atomic acceptance/rejection -> durable effect

If the old operation reaches the guard after a newer generation has already advanced the high-water mark, it is rejected. If it reaches the guard before the newer generation advances, its acceptance may linearize before the fence. Therefore the protocol must define the exact acceptance linearization point; 'started before fence' is not itself sufficient to classify the effect.

## Important concurrency property
The disco Guard's CAS loop is significant: a simple sequence `read highWater; if token >= read; write highWater` would contain a race. The CAS makes the acceptance transition itself atomic with respect to competing guard updates. This is the resource-side equivalent of the etcd compare-and-effect boundary studied earlier.

## Recovery boundary
A local high-water mark must survive restart if stale tokens must remain rejected across process failure. disco supports seeding the guard from persisted state at startup, explicitly because an unseeded fresh guard could otherwise accept an old token before a legitimate newer request re-establishes the mark. This is implementation evidence that fencing state durability is part of the safety property, not merely an optimization.

## Evidence ledger
RESOURCE_SIDE_FENCE_LINEARIZATION: SOURCE CONFIRMED
CONCURRENT_GUARD_UPDATE_CAS: SOURCE CONFIRMED
STALE_TOKEN_REJECTED_AFTER_NEWER_TOKEN: SOURCE CONFIRMED
REAL_PROCESS_PAUSE_FENCING_EXPERIMENT: SOURCE REPORTED/REPRODUCIBLE PROJECT EVIDENCE
FRESH_GUARD_WITHOUT_PERSISTED_HIGH_WATER_SAFE_AFTER_RESTART: FALSE BY IMPLEMENTATION DESIGN
START_TIME_ALONE_DETERMINES_FENCE_RESULT: FALSE
FORMAL_UNIVERSAL_PROOF: NOT ESTABLISHED
NEXO_IMPLEMENTATION: NOT PERFORMED

## Nexo implication
The fence linearization point belongs at the protected effect boundary. Authority transition and resource acceptance are related but distinct events. A stale operation can remain alive, queued, retried, or resumed; safety is obtained only when the resource's acceptance rule prevents that stale operation from becoming a new durable effect.

Candidate invariant remains:
If g2 supersedes g1 for namespace R, an effect carrying g1 is accepted only if the resource's acceptance predicate linearizes before g2 becomes effective for R; otherwise g1 must be rejected.

This is still a candidate invariant, not a final Nexo law.

## Exact next action
AB104.779R: investigate restart/recovery of resource-side fencing state in detail. Determine whether persisted high-water marks can regress after snapshot restore, failover, replica promotion, or state reconstruction, and what recovery mechanism is required to preserve the stale-token rejection invariant.