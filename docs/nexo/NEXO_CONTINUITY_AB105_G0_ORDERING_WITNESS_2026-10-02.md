# NEXO CONTINUITY — AB105 G0 ORDERING WITNESS — 2026-10-02

## PURPOSE
This is the detailed continuation note for the current Kafka G0 ordering-witness investigation. The next chat MUST recover this state before doing work. Do not rely on conversational memory.

## NON-NEGOTIABLE CANONICAL STATE
- Repository: snowdenxrp/aldea-ia
- Active branch: nexo-ab105-g0-ordering-witness
- Canonical anchor: AB105.116R — DO NOT MODIFY.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
- Canonical ordering checkpoint: e567dc5429f563b3f57ec75c20a3ec22ca5192af
- Latest harness correction: 91c2a7a23cf2812c248e53596085b480684de006
- Content SHA: a9f368e9ebfc308d23731b56d8c03014733a7a9b
- Message: fix(nexo): make W1 probe insertion source-stable
- Current ordering witness runtime: NOT OBSERVED after latest correction.

## SCIENTIFIC QUESTION
Observe on a REAL Kafka broker/request path:
D0 -> W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION

Definitions:
- D0 = external Admin DeleteAcls completion.
- W1 = target broker local completion of StandardAuthorizerData.removeAcl() after replacement of immutable AclCache.
- ENQUEUE = real request enters RequestChannel.
- DEQUEUE = KafkaRequestHandler receives the request.
- AUTH_ENTER = real authorization entry inside StandardAuthorizer.authorize().
- AUTH_DECISION = real authorization decision.
- Correlation IDs are included on ENQUEUE/DEQUEUE/AUTH_ENTER/AUTH_DECISION.

Methodological rules:
- D0 is NOT W1.
- Timestamps are diagnostic only; never infer JMM happens-before from timestamps.
- RequestChannel publication may publish actions before enqueue, but global W1 -> R1 HB remains UNKNOWN unless the complete causal chain is demonstrated.
- Do not add latches/locks between W1 and D0/R1 because that changes the race.
- Do not convert observations into security conclusions.
- Do not claim exploitability/security impact without direct causal evidence.
- Public AclBinding does not expose internal Uuid. W1 captures internal Uuid and StandardAcl in removeAcl(Uuid id). Do not claim public D0 UUID == internal W1 UUID without a real observed mapping.

## HISTORICAL EXECUTION BOUNDARY
Recovered real-RPC branch nexo-ab105-g0-runtime-exec-corrected:
- real KafkaProducer D1;
- producer.send(...).get();
- D1 reached target broker TargetAuthorizer.authorize();
- override delegated to super.authorize() and observed result;
- no TARGET.authorize() direct call in this workflow.
Valid real-RPC behavioral base, but RequestChannel ENQUEUE/DEQUEUE was not instrumented and raw execution artifact was not recovered.

Recovered multibroker discriminator:
- real Producer D1;
- target broker TargetAuthorizer;
- target local ACL count after D0;
- target verified effective leader;
- D1 through real Producer.
Still no RequestChannel ordering evidence.

Rejected for ordering evidence:
- nexo-ab105-g0-jmm-publication-discriminator: direct TARGET.authorize() D1.
- nexo-ab105-g0-runtime-api-fix-v2: direct targetAuthorizer.authorize().
- nexo-ab105-g0-current-compile-gate: compile/API only.
- nexo-ab105-g0-compile-probe-ci: compile-only.

Historical successful runtime:
- run 36969192502
- job 110719406205
- commit 96aee422286b5602c3f188736e1910c1017112ab
- Kafka pin 99b940733a9f6bc409457dba7108f08421d81e42
- G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1
- artifact 11210977168
- digest sha256:b0e6ae6499b76f1de0363805a58ae45635b9d661b169cb6338893338d2e31c54
CRITICAL: D1 was direct TARGET.authorize(), therefore NOT RequestChannel ordering evidence.

Semantic audit:
docs/nexo/NEXO_AB105_G0_RECOVERED_RUNTIME_WITNESS_SEMANTIC_AUDIT_2026-10-02.md
commit b73efbbaebfb9f11992fefab5fae2c9af84ee1e4

## PR #84 REAL PRODUCER FAILURE
PR #84 head c4ebe094282d7315a0d57c2ae83c256dbe08588e
run 36943032652
job 110638707860
D1 used real KafkaProducer:
producer.send(new ProducerRecord<>(TOPIC_NAME, 0, null, new byte[] {2})).get()
Target Authorizer callback was observed, but R1 callback was not. Producer repeatedly got TOPIC_AUTHORIZATION_FAILED. No G0_PROPAGATION_WITNESS.
Conclusion: real Producer path executed, W1 -> R1 UNKNOWN.

## PR #94 CURRENT ORDERING WITNESS
PR #94: AB105 G0 real broker ordering witness (draft)
Original head fa4900b33a26df6b81ac1162bc8506ffeda8fa5d
Base main 1f8beb0d39c2f24b81bfe8a16b84950b4188cc52
Original size 12 commits, 11 files, +626 lines.
Diagnostic-only workflow-local instrumentation at Kafka pin; no canonical Kafka source change; AB105.116R unchanged.

Raw intended events:
NEXO_ORDER ACL_W1
NEXO_ORDER ENQUEUE
NEXO_ORDER DEQUEUE
NEXO_ORDER AUTH_ENTER
NEXO_ORDER AUTH_DECISION

## PR #94 COMPILE FAILURE
run 37042188881
job 110954753077
Failed because:
- new NewTopic(TOPIC, 1, (short) 1) used ResourceType.TOPIC instead of a string.
- new ResourcePattern(TOPIC, TOPIC, LITERAL) used wrong types.
Persisted:
docs/nexo/NEXO_ORDERING_WITNESS_COMPILE_FAILURE_2026-10-02.md
commit 7cbdef4da5915064a965854e002d658a9eab4d94

## V2 HARNESS BLOCKER
commit 1d52b2c482e5ead0428454d47af27b7d7245743d
workflow .github/workflows/nexo-ab105-g0-ordering-witness-v2.yml
Bug: Python used literal ${GITHUB_WORKSPACE} inside single-quoted heredoc.
Persisted:
docs/nexo/NEXO_ORDERING_WITNESS_V2_HARNESS_BLOCKER_2026-10-02.md
commit b9c2b8c870c5da3bc9d1c3467fcb718e0610754

Aux trigger:
336208d86a925e4693190abe87ca9ae2386a0280 added nexo-ab105-g0-ordering-witness-run push trigger.
da0afd8e76a03e5e42c369b9c4557d59f90a1908 reran original.
Run 37042461065 failed/no useful jobs; rerun failed jobs 403.
Do not infer no push run from PR wrapper.

V2 related:
- 37042437372 TLA SANY success
- 37042437402 Lumina success
- 37042437340 JMM skipped
- 37042437411 Kafka Bootstrap failure
- JMM skipped job 110955585638

## EXECUTION AND HARNESS AUDITS
docs/nexo/NEXO_ORDERING_WITNESS_EXECUTION_PATH_AUDIT_2026-10-02.md
commit 7fb99078d9347b495def5ddbe37c9540490ee99d
Finding: historical JMM workflow executable pattern but not ordering evidence; Java source executes only if workflow explicitly consumes it.

docs/nexo/NEXO_ORDERING_WITNESS_EXECUTABLE_HARNESS_AUDIT_2026-10-02.md
initial fa4900b33a26df6b81ac1162bc8506ffeda8fa5d
refined 6c2d2999bb983da140dfdcaec86b6f1d1843d230
Latest:
- AB105.116R unchanged
- AB105.117R not created
- real broker witness not executed
- NEXO_ORDER evidence none at last audit
- W1 -> R1 UNKNOWN
- workflow writes harness into pinned Kafka checkout
- required corrections use TOPIC_NAME
- common Kafka filters required
- adapters do not separately correct hardcoded heredoc
- v2 literal ${GITHUB_WORKSPACE} was a blocker
- method boundary/next action documented.

Branch archaeology persisted:
docs/nexo/NEXO_AB105_G0_BRANCH_ARCHAEOLOGY_AUDIT_2026-10-02.md
commit f79b9080e616d4cf6499248cd55fa0e038422402
Relevant branches include runtime-exec-corrected, multibroker-discriminator, compile-probe-ci, current-compile-gate, jmm-publication-discriminator, ordering-witness, ordering-witness-run, runtime-api-fix-v2 and others. Do not revive direct-authorize branches as ordering evidence.

## CORRECTIONS APPLIED
Pass 5:
commit 40ca7ad58415f301f08f32d0bde1a4431e00baed
Persisted:
docs/nexo/NEXO_AB105_G0_ORDERING_EXECUTION_PASS5_2026-10-02.md
commit c968f5c5105a344d602f107ee3e47212d648ffdb
Corrections:
- TOPIC_NAME for topic string
- ResourceType.TOPIC for type
- NewTopic(TOPIC_NAME,...)
- ResourcePattern(TOPIC, TOPIC_NAME, LITERAL)
- imports AclBindingFilter, AccessControlEntryFilter

D0 identity guard:
commit c15d5539e063d7b13a1b947298aaa6cb7fea1929
- describeAcls retry up to 20s
- exactly one matching ACL
- store AclBinding d0Target
- emit D0_TARGET
- real deleteAcls
- emit D0_RETURN
Persisted:
docs/nexo/NEXO_AB105_G0_ORDERING_CORRECTION_AUDIT_2026-10-02.md
commit 9e8aae771fab1df7b2ebcdcea5e8e06cd9e78147

W1 injection:
commit 6dbdfb51b89cb4212ccfebc9790e6e8452bf58df
Intended StandardAuthorizerData.removeAcl(Uuid id):
StandardAcl removedAcl = aclCache.getAcl(id);
AclCache aclCacheSnapshot = aclCache.removeAcl(id);
then emit ACL_W1.
No canonical Kafka source committed; workflow injects into pinned checkout.

Base W1 probe:
commit 4825c962cb7ea83b49c055f19bc07ce910f5bd00
captures StandardAcl removedAcl = aclCache.getAcl(id) before removal and emits acl.

Duplicate DEQUEUE correction:
commit 41b60c3f231c980336854a3ee292d7c5dc1d630e
message: fix(nexo): remove duplicate uncorrelated dequeue witness
content SHA 7964f283442910ee9686c09519241fbe7d9b06db
Removed duplicate receiveRequest() instrumentation; retained correlated DEQUEUE in poll(timeout,...).

Static preflight after 41b60c3f:
w1=true
w1log=true
enqueue=true
dequeue=true
authEnter=true
authDecision=true
duplicateReceive=false
stale=false
anchor=true
Combined CI status returned [].

Trigger-only commit:
dbd57d7a634b2524d1aeb79c9f109725afd5e0ad
Workflow push trigger:
on:
  push:
    branches:
      - nexo-ab105-g0-ordering-witness
Workflow file SHA 5fe23d95e8da56bb914b87e82344dc69869f37ef.

## LATEST RUN/CORRECTION CHAIN
Run 37058894486 at dbd57d7:
- job 111010298192
- install failed
- W1 exact marker mismatch
- no runtime.

Correction 333448720e3e401290edc04d4df98fe91c9317bd1:
- make W1 injector match pinned Kafka source
- content SHA 9f2fa785c72485f3fca5c59386131e7d3c2946a1
Run 37059140702:
- job 111011117253
- install failed
- marker mismatch in StandardAuthorizerData.java
- no runtime
- artifact 11249548057
Pinned source cross-check:
void removeAcl(Uuid id) {
    try {
        AclCache aclCacheSnapshot = aclCache.removeAcl(id);
        log.trace("Removed ACL {}: {}", id, aclCacheSnapshot.getAcl(id));
        aclCache = aclCacheSnapshot;
    } catch ...
}
Source indentation is 12 spaces.

Correction 238fd4164432d6d2e193f209f24b0a247fa99c6f:
- align W1 injector indentation with pinned Kafka
Run 37059257033:
- job 111011504479
- install failed
- W1 passed; next blocker was RequestChannel.scala dequeue marker mismatch.
Actual pinned RequestChannel:
def sendRequest(request: Request): Unit = {
  requestQueue.put(request)
}
...
def receiveRequest(timeout: Long): BaseRequest = {
  val callbackRequest = callbackQueue.poll()
  if (callbackRequest != null)
    callbackRequest
  else {
    val request = requestQueue.poll(timeout, TimeUnit.MILLISECONDS)
    request match {
      case _: WakeupRequest => callbackQueue.poll()
      case _ => request
    }
  }
}

Correction 8bb9634954d23325063c968991da0a15aabf28a5:
- align dequeue injector with actual RequestChannel implementation
Run 37059361138:
- job 111011861987
- install failed
- W1 second replacement marker mismatch remained.

Correction 7bfd8f2182bd471b5ff041bda635b94df58ae3db:
- align W1 replacement indentation with pinned source
Run 37060659922:
- job 111016215864
- install failed
- logs showed W1 replacement blocks but exact install failure remained ambiguous.

LATEST CORRECTION:
91c2a7a23cf2812c248e53596085b480684de006
Message: fix(nexo): make W1 probe insertion source-stable
Content SHA: a9f368e9ebfc308d23731b56d8c03014733a7a9b

W1 injection no longer uses fragile repl() for StandardAuthorizerData. It now reads the pinned source and performs stable marker-count checks:
p=Path("metadata/src/main/java/org/apache/kafka/metadata/authorizer/StandardAuthorizerData.java")
s=p.read_text()
marker="            AclCache aclCacheSnapshot = aclCache.removeAcl(id);"
if s.count(marker)!=1: raise SystemExit("W1 marker mismatch")
s=s.replace(marker, "            StandardAcl removedAcl = aclCache.getAcl(id)\n"+marker, 1)
marker2="            aclCache = aclCacheSnapshot;"
if s.count(marker2)!=1: raise SystemExit("W1 commit marker mismatch")
s=s.replace(marker2, marker2+"\n            System.err.println(NEXO_ORDER ACL_W1 with ns/thread/id/acl)", 1)
p.write_text(s)
(The actual committed script contains the complete Java string expression; the above is a structural summary to avoid quoting ambiguity.)
Other ENQUEUE/DEQUEUE/AUTH_ENTER/AUTH_DECISION repl() calls remain.

## EXACT NEXT ACTION FOR NEXT CHAT
When next chat says CONTINUITY or Continúa:
1. Recover this document first.
2. Inspect branch head 91c2a7a23cf2812c248e53596085b480684de006.
3. Query general GitHub Actions API:
   https://api.github.com/repos/snowdenxrp/aldea-ia/actions/runs?per_page=100
   Filter for:
   - branch nexo-ab105-g0-ordering-witness
   - head_sha 91c2a7a23cf2812c248e53596085b480684de006
   - event push
   - workflow .github/workflows/nexo-ab105-g0-ordering-witness-v2.yml
4. Fetch jobs for the matching run.
5. If install fails, inspect raw job logs and identify the EXACT remaining marker. Do not claim runtime.
6. If install and compile succeed, inspect Execute step and artifact for:
   - NEXO_ORDER D0_TARGET
   - NEXO_ORDER D0_RETURN
   - NEXO_ORDER ACL_W1
   - NEXO_ORDER ENQUEUE
   - NEXO_ORDER DEQUEUE
   - NEXO_ORDER AUTH_ENTER
   - NEXO_ORDER AUTH_DECISION
7. Correlate ENQUEUE/DEQUEUE/AUTH_ENTER/AUTH_DECISION by correlationId.
8. Never infer W1 -> R1 JMM happens-before from timestamps.
9. If an event is missing/ambiguous, preserve UNKNOWN.
10. If runtime succeeds, persist raw run/job/artifact IDs and digest before interpretation.
11. Do NOT create AB105.117R.
12. Do NOT rerun TLC.
13. Do NOT modify AB105.116R.
14. Do not revive direct TARGET.authorize() branches as ordering evidence.
15. After each material correction/observation, save a new GitHub continuity/audit record.

## DO-NOT-REPEAT
- Do not redo historical G0 contract audit unless contradictory evidence appears.
- Do not repeat cache identity, authorize snapshot, timing-window, or direct-authorize experiments unless a new question specifically requires them.
- Do not treat successful compile as runtime.
- Do not treat D0 as W1.
- Do not treat ACL absence/DescribeAcls as global authorization freshness.
- Do not infer security impact from stale-window observations.
- Do not fabricate missing Actions runs.
- Do not silently migrate or overwrite historical semantic state.

## CURRENT EPISTEMIC STATE
ORDERING_WITNESS_INSTALL=NOT_YET_VERIFIED_AFTER_91c2a7a
ORDERING_WITNESS_RUNTIME=NOT_OBSERVED
NEXO_ORDER_RAW_EVENTS=NOT_OBSERVED_AFTER_LATEST_CORRECTION
W1_TO_R1=UNKNOWN
JMM_HAPPENS_BEFORE=UNKNOWN
EXACT_RACE=UNKNOWN
EXPLOITABILITY=UNKNOWN
AB105.116R=INTACT
AB105.117R=NOT_CREATED
TLC=NOT_RERUN


## RE-AUDIT UPDATE — 2026-10-02
A fresh cross-check found that the prior continuity pointer was stale: commit 29242e6e59a6c1b18c681383d250eaa4a436228b removed a duplicate W1 probe rewrite after 91c2a7a. The previous canonical note did not record this later correction.

A second executable-path defect was found in the PR #94 ordering workflow: its W1 rewrite referenced removedAcl without declaring it. The main ordering workflow was corrected on the active branch:
- 3ab2aa33f45324d0e2414945e34c41e60973549e
- f7163aa8e193fd3d77db90ebd2aec1850bc3da13
- aa1d8c65bcf6842abc76fbb0d595d9ecd52a0c02
- 1eb2e07cad798742518c2cbdd091044fb80f723e

The main workflow now uses source-marker W1 insertion and emits correlationId on ENQUEUE, DEQUEUE, AUTH_ENTER, and AUTH_DECISION. The v2 helper duplication was also removed.

Run 37061544071 must not be treated as ordering evidence: it was NEXO AB105 G0 Kafka Bootstrap and failed compiling the older NexoG0RuntimeTest at ResourcePattern(TOPIC, TOPIC, LITERAL). No NEXO_ORDER evidence was obtained from it.

Persisted re-audit:
docs/nexo/NEXO_AB105_G0_ORDERING_WITNESS_REAUDIT_2026-10-02.md
commit b366f16784204b6c2cd1ddb390c0d4df2813e474

Current epistemic state remains:
ORDERING_WITNESS_INSTALL=NOT_VERIFIED_AFTER_REAUDIT_CORRECTIONS
ORDERING_WITNESS_RUNTIME=NOT_OBSERVED
NEXO_ORDER_RAW_EVENTS=NOT_OBSERVED_AFTER_REAUDIT_CORRECTIONS
W1_TO_R1=UNKNOWN
JMM_HAPPENS_BEFORE=UNKNOWN
EXACT_RACE=UNKNOWN
EXPLOITABILITY=UNKNOWN
AB105.116R=INTACT
AB105.117R=NOT_CREATED
TLC=NOT_RERUN

Next action: verify the Actions run(s) triggered by the corrected ordering workflow, then inspect compile/runtime logs and raw NEXO_ORDER artifact before any scientific promotion.
