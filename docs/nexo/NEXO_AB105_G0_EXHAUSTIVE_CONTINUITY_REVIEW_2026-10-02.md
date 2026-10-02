# NEXO — AB105 G0 EXHAUSTIVE CONTINUITY REVIEW
Fecha: 2026-10-02
Repo canónico: snowdenxrp/aldea-ia
Propósito: revisión exhaustiva posterior a pérdida de chat para detectar omisiones de continuidad. Este documento es aditivo y no reemplaza evidencia primaria.

## REGLA
GitHub directo (commits, PR, Actions y logs raw) prevalece sobre conversación o memoria.
UNKNOWN/PENDING no se promueve por inferencia.
No se modifica historia previa.

## ANCLAS / EXCLUSIONES
AB105.116R = INTACT / NO MODIFICAR
AB105.117R = NOT_CREATED
TLC = NO_RERUN
PR #89 = OPEN / NOT MERGED
PR #89 HEAD = 0388dce81a2e08dd90f96f6806fe74683ed6f543
Kafka pinned = 99b940733a9f6bc409457dba7108f08421d81e42

## EVIDENCIA CAUSAL-V2 VERIFICADA DIRECTAMENTE
Run 36965213770 / job 110707365331 = SUCCESS.
Raw log:
CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=2531489 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=2466195 OVERLAP_ALLOWED=18300 OVERLAP_DENIED=62 UNEXPECTED=0
Build SUCCESSFUL; KAFKA_REV exact; evidence emitted.

Run 36965213781 / job 110707365140 = SUCCESS.
Raw log:
CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=5556071 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=5457434 OVERLAP_ALLOWED=29225 OVERLAP_DENIED=68 UNEXPECTED=0
Build SUCCESSFUL; artifact uploaded ID 11209302613, SHA256 5b8c1b5356e5cf9b21c751f2a3cbff9b16949e5822a6a8eb295dd121941405b9 (exact artifact digest recorded by Actions).
KAFKA_REV exact; AB105_116R unchanged; AB105_117R not created.

## WHAT THE TWO RUNS DO / DO NOT ESTABLISH
POST_RETURN_ALLOWED > 0 would be a behavioral witness of ALLOWED with authorization start strictly after measured removeAcl return; it still would not alone prove JMM stale visibility or exact mechanism.
POST_RETURN_ALLOWED = 0 means no such witness in these runs; it does not prove impossibility/safety.
OVERLAP_ALLOWED > 0 establishes observed temporal overlap, not stale visibility.
Current state:
JMM_HB = NOT_IDENTIFIED
STALE_READ = UNKNOWN
STALE_ALLOWED = NOT_OBSERVED_IN_CURRENT_RUNS
CACHE_VERSION_WITNESS = ABSENT
MECHANISM_ATTRIBUTION = UNKNOWN
EXPLOITABILITY = UNKNOWN
GENERALIZATION = UNKNOWN
PRODUCTION_IMPACT = UNKNOWN
SECURITY_CONCLUSION = NOT_ESTABLISHED

## PRIOR EVIDENCE THAT MUST NOT BE LOST
1. G0 one-broker corrected witness:
G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1
Artifact 11199086900, digest d43efa23640881711f188a17e1af2dfa890f801a04d0d5974945bc8cc9c343eb.
2. PR #82 multi-broker exact witness:
G0_MULTI_WITNESS TARGET_BROKER=1 LEADER_TARGET=1 LEADER_OTHER_VIEW=1 D0=OBSERVED TARGET_LOCAL_ACL_COUNT_AFTER_D0=0 D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1
3. PR #86 propagation exact witness:
G0_PROPAGATION_WITNESS TARGET_BROKER=1 LEADER_TARGET=1 LEADER_OTHER_VIEW=1 D0=WRITE_REVOKED_CONTROLLER_COMPLETE D1_AUTH_RESULT=DENIED D1_TARGET_LOCAL_ACL_COUNT_AT_DECISION=1 D2=SUCCESS E_BASELINE=0 E_AFTER=1
Interpretation: IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED; STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0; D1_POST_D0_BYPASS=NOT_OBSERVED; exploitability/generalization/production impact/security conclusion UNKNOWN/not established.
4. Real production-path StandardAuthorizer/RPC test:
run 36958014786 / job 110685238774 / head ec12f67db238196778733c1c0af6aa966ab33614
G0_PRODUCTION_WITNESS ITERATIONS=10 D1_DENIED=10 D1_ALLOWED=0 D1_UNEXPECTED=0 STANDARD_AUTHORIZER=REAL RPC_REQUEST_AFTER_D0=REAL
Artifact 11207231395, digest 5c9dcbca7e2bc2b532ee7ddfae4791c0a9e440719eedeb5fcbb684fd7cafbd66
Interpretation: no post-D0 stale WRITE authorization observed in 10 iterations; JMM HB UNKNOWN; no security conclusion.
5. Earlier direct timing diagnostic:
run 36960926363 / job 110694206822 / head f0d08bd25ddbf85f518e62e2231b5a4b63616901
JMM_DIRECT_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=2598444 STALE_ALLOWED_IN_POST_WINDOW=75844 DENIED_IN_POST_WINDOW=1746509 UNEXPECTED=0
Artifact 11207703791, digest b2992d95c0ac3bccdb54cec526424f7e3e65fe77539db7a04fc6e9c8c75ba107
This was correctly demoted: timing-defined window could include writer-before/inside/after removeAcl; COMPLETED_REMOVE_THEN_ALLOWED=NOT_ESTABLISHED.
6. Earlier publication diagnostic:
run 36950083282 / job 110660878156 / commit e97cf485eb207621e4d798826cbe4b7e9088078e
STALE_ALLOWED=0 DENIED_AFTER_FLAG=200 FLAG_TIMEOUTS=0
This test used a completion marker and therefore is limited diagnostic evidence; it did not prove production JMM HB.
These historical results remain evidence with their original limitations; none may be silently replaced by causal-v2.

## IMPORTANT FAILED ATTEMPTS / NON-RESULTS
A) Run 36964801292 / job 110706105555:
metadata checkstyle blocked Execute. No scientific result.
B) Run 36964801327 / job 110706105958:
compile SUCCESS, Execute FAILURE; prior continuity correctly required isolating the failure.
C) The later successful causal-v2 runs supersede neither failed attempt nor its history.
D) Separate Kafka Bootstrap run 36965213846 / job 110707365272 failed compiling an unrelated temporary server runtime harness. Errors included ResourceType/String misuse, AuthorizableRequestContext.requestVersion signature mismatch, and AccessControlEntry.ANY absence. This is NOT evidence about the causal-v2 test and must not be mixed into its result.
E) Checkstyle was a real earlier blocker in the causal-v2 lineage; classification was extracted into helpers. The executed head 0388dce was directly checked and semantics were preserved.

## EXECUTED-HEAD INTEGRITY
Commit 0388dce was directly compared/inspected:
- classification moved to ClassificationCounts + helper methods;
- observation.enter > writerObservation.exit unchanged;
- timing windows unchanged;
- ITERATIONS=100, READERS=4 unchanged;
- removeAcl/authorize path unchanged;
- local per-reader observation storage retained;
- no race-side synchronization added.
CLASSIFICATION_SEMANTICS=PRESERVED
RACE_SYNCHRONIZATION_ADDED=FALSE
EXPERIMENT_SEMANTIC_DRIFT=NOT_FOUND

## SOURCE-LEVEL BOUNDARY RECOVERED
At pinned Kafka revision:
- StandardAuthorizer.data is volatile and authorize() snapshots it.
- StandardAuthorizerData is explicitly not thread-safe.
- StandardAuthorizerData.aclCache is plain/non-volatile.
- addAcl/removeAcl replace aclCache with a new immutable AclCache on the same StandardAuthorizerData instance.
- The relevant reader is an independent authorization path.
- No direct JMM happens-before edge from metadata/AclPublisher incremental mutation to unrelated RPC authorization has been established.
- Plugin.get() does not add the needed synchronization.
- Metadata/event synchronization and RequestChannel publication do not by themselves establish ACL-state publication to the RPC reader.
- IMPORTANT unresolved source discrepancy: StandardAuthorizer comments mention a read-write lock, but the pinned implementation inspected contains no such lock. This remains UNKNOWN/CONFLICT and must not be normalized by assumption.

## AB105.116R / AB104.431 CONTINUITY
AB105.116R was revalidated at pass 63 commit c16060c7b2a895e88ba5b85c9a49d301123a540b.
AB104.431 remains REVALIDATED / SEMANTICALLY FROZEN.
Key preserved distinctions:
CURRENT_READ != FUTURE_AUTHORIZATION
LINEARIZABLE_READ != LINEARIZABLE_EFFECT
LEASE_VALID != REQUEST_CURRENT
WATCH_CURRENTNESS requires continuity, gap detection, resumability/recovery and revalidation after continuity loss
FENCING protects the resource boundary only when actually enforced there
Multi-resource effects can remain partial without an atomic cross-resource protocol
Exact next mission recorded there: AB104.432 — lease/fence crash-restart semantics and delayed requests.
G0 evidence remains a separate experimental witness and must not be merged into the semantic conclusion.

## CONTINUITY FILE AUDIT RESULT
The prior canonical recovery file 6fca8231ae63cd9c8ca0cac83c333a259c1dd05d correctly preserves the immediate causal-v2 state, but it did NOT enumerate every historical G0 witness and earlier diagnostic lineage listed above. This review closes that documentation omission without changing any historical artifact or epistemic status.

## CANONICAL NEXT ACTION
Continue from causal attribution boundary, not from scratch:
- do not rerun TLC;
- do not rerun the two verified causal-v2 runs;
- do not create AB105.117R;
- do not modify AB105.116R;
- preserve all failed and superseded attempts;
- any new diagnostic must be methodologically distinct, explicitly document synchronization edges, and be saved immediately with exact SHA/run/job/artifact plus UNKNOWN/PENDING and DO-NOT-REPEAT.
