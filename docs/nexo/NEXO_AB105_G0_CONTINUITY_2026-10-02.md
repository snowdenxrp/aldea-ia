# NEXO AB105 G0 Kafka — Continuity Checkpoint — 2026-10-02

## Canonical boundary
- AB105.116R remains intact and frozen.
- No AB105.117R created.
- No TLC rerun.
- Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42.

## Latest verified execution
- PR: #86, OPEN, UNMERGED.
- Head SHA: 8f00dfc42518aa5fac134ee416e7d69cdf992933.
- Workflow: 36944993140.
- Job: 110644954901.
- Conclusion: SUCCESS.
- Artifact: nexo-ab105-g0-bootstrap-evidence.
- Artifact ID: 11201234026.
- Artifact digest: sha256:cdc9152b9bd45c3f78a125ab919fc08516bc1a140c2bcba6739532912ce5cf29.

## Recovered witness
G0_PROPAGATION_WITNESS
TARGET_BROKER=1
LEADER_TARGET=1
LEADER_OTHER_VIEW=1
D0=WRITE_REVOKED_CONTROLLER_COMPLETE
D1_AUTH_RESULT=DENIED
D1_TARGET_LOCAL_ACL_COUNT_AT_DECISION=1
D2=SUCCESS
E_BASELINE=0
E_AFTER=1

## Interpretation
- The two-broker/one-controller cluster executed successfully.
- Target partition leader was broker 1 from both broker views.
- D0 was a real controller-side WRITE ACL revocation.
- D1 was a NEW independent producer request after D0, with metadata warmed before revocation.
- D1 authorization was DENIED.
- Target local ACL count at D1 decision was 1; the remaining ACL was DESCRIBE, so WRITE was no longer locally authorized.
- D2 was the earlier authorization path held at A1 and completed after release.
- UnifiedLog end offset changed 0 -> 1.

Therefore:
- IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
- STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
- D1_POST_D0_BYPASS=NOT_OBSERVED
- EXPLOITABILITY=UNKNOWN
- GENERALIZATION=UNKNOWN
- PRODUCTION_IMPACT=UNKNOWN
- SECURITY_CONCLUSION=NOT_ESTABLISHED

This negative discriminator result must not be rewritten as a proof of safety or a proof that no propagation race exists in other configurations.

## Preserved historical limitations
PR #84's failed execution remains a harness failure, not D1=DENIED evidence. Its failure was:
D1 authorization decision was not observed.
The later metadata-warmup/isolation corrections supersede that harness limitation only for the current experiment; historical failure evidence remains preserved.

## Next research boundary
Do not repeat the same propagation experiment without a new hypothesis. The current evidence separates the reproducible in-flight authorization window from the specific stale local propagation hypothesis tested here. Any next experiment must target a distinct mechanism and preserve raw evidence before status promotion.

## 2026-10-06 — Ordering/JMM continuity extension
### Run #21 raw-artifact reconciliation
- 10/10 cycles executed.
- 10/10 W1 cacheIdentity == D1 cacheIdentity.
- 10/10 D1 observed ACL absent (cacheCount=0, targetPresent=false, targetId=NONE).
- Cycles 1–8: W1 -> D0_RETURN -> D1.
- Cycles 9–10: D0_RETURN -> W1 -> D1.
- Therefore D0_RETURN is NOT a valid proxy/barrier for W1 propagation.
- Stale aclCache read was NOT OBSERVED.
- JMM W1 -> D1 happens-before remains UNKNOWN.
- Vulnerability remains NOT ESTABLISHED.

### Kafka source-level boundary verified at pinned revision
- RequestChannel.sendRequest() performs requestQueue.put(request).
- RequestChannel.receiveRequest() obtains requests via queue poll/take.
- This establishes a real queue handoff only from producer sendRequest to consumer receive; it does NOT establish W1 -> requestQueue.put.
- AclApis.handleDeleteAcls() waits on ACL deletion completion stages before completing the response path.
- ClusterMetadataAuthorizer.deleteAcls() documents completion after controller processing and persistence of the ACL deletion to the cluster metadata log.
- StandardAuthorizer.data is volatile, but StandardAuthorizerData.aclCache is ordinary/non-volatile.
- StandardAuthorizerData is explicitly documented as not thread-safe.
- addAcl/removeAcl replace aclCache inside the existing StandardAuthorizerData; they do not replace StandardAuthorizer.data.
- Therefore the volatile data field alone cannot be promoted as proof of publication of the later aclCache replacement.

### Current exact research boundary
The only useful next boundary is observational:
W1 -> real request -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> D1.

Required evidence in the same execution:
- W1: ACL identity, cacheIdentity, timestamp, thread.
- ENQUEUE: real request correlation identity, timestamp, thread.
- DEQUEUE: same request correlation identity, timestamp, thread.
- AUTH_ENTER: same request correlation identity, timestamp, thread.
- D1: same request correlation identity, cacheIdentity, targetId, timestamp, thread.

Guardrails:
- Do NOT introduce a shared mutable last-W1 bridge read by ENQUEUE.
- Do NOT add volatile/latch/barrier/synchronized/Future solely to connect W1 to D1.
- Temporal/log order is evidence of observed execution order, not by itself JMM happens-before.
- Do NOT repeat the Run #21 cacheIdentity experiment or the D0 marker experiment.

### Frozen status
- AB105.116R = FROZEN / UNCHANGED.
- AB105.117R = NOT_CREATED.
- TLC = NOT_RERUN.
- STALE_READ = NOT_OBSERVED.
- W1_TO_D1_JMM_HB = UNKNOWN.
- VULNERABILITY = NOT_ESTABLISHED.

## DO-NOT-REPEAT
- Do not use D0_RETURN as a propagation barrier.
- Do not infer JMM HB from temporal event ordering alone.
- Do not manufacture the W1->request edge with test synchronization.
- Do not rerun cacheIdentity/D0 experiments without a distinct hypothesis.
