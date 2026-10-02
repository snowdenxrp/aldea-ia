# NEXO CONTINUITY — AB105 G0 / JMM CAUSAL WINDOW
Fecha: 2026-10-02
Repo canónico: snowdenxrp/aldea-ia
Rama canónica: main
Ancla epistemológica: AB105.116R — NO MODIFICAR
AB105.117R: NOT_CREATED
TLC: NO RERUN

## Estado inmediato
La siguiente investigación es el discriminador causal JMM de Kafka G0. Objetivo: detectar, sin usar una señal de finalización que cree un happens-before artificial, si existe alguna autorización ALLOWED cuyo inicio quede estrictamente después del retorno medido de removeAcl().

Diseño:
- writerRemoveEnter = nanoTime inmediatamente antes de removeAcl()
- writerRemoveReturn = nanoTime inmediatamente después
- readerAuthorizeEnter/Return rodean authorize()
- POST_RETURN_ALLOWED si reader enter > writer return
- overlap si los intervalos se solapan
- clasificación únicamente post-hoc después de join()
- sin latch/barrier/volatile gate para liberar lectores
- System.nanoTime() solo aporta orden temporal monotónico; NO demuestra JMM happens-before.
- 100 iteraciones, 4 readers, ventana PRE_REMOVE=5 ms, observation end=15 ms.
- cada reader conserva observaciones localmente; no hay contadores compartidos durante la carrera.

## Código vigente
PR #89: AB105 G0: JMM causal post-return discriminator v2
Estado: OPEN, ready for review, unmerged
Head fuente: 7f6586c00602baf92aee58ed214b823a6f34d8d1
El código corrigió:
1. import correcto de PluginMetricsImpl:
   org.apache.kafka.common.metrics.internals.PluginMetricsImpl
2. eliminación de AtomicInteger/AtomicLong usados durante la carrera
3. Observation/WriterObservation locales
4. clasificación post-hoc en el hilo principal después de join()
El archivo persistido es:
docs/nexo/NEXO_AB105_G0_JMM_CAUSAL_WINDOW_TEST.java.txt
SHA del blob: 410b1e401cf999b064c19283074b19ad6042b32f

## Workflow / ejecución actual
Se añadieron dos ejecuciones:
1) Run 36964801292, job 110706105555, workflow NEXO AB105 G0 JMM causal window discriminator.
2) Run 36964801327, job 110706105958, workflow NEXO AB105 G0 JMM causal window (PR runner).

Ambos terminaron FAILURE.
IMPORTANTE: no hubo resultado científico del experimento.

Run 36964801292:
- checkout del PR merge ref: 88e93c2b5d6702fd36bcd993e760b0d1003e8dfc
- Java 21.0.12+1
- Kafka 99b940733a9f6bc409457dba7108f08421d81e42
- compilación de infraestructura: SUCCESS
- Execute causal JMM discriminator: FAILURE
- el log visible termina con:
  > Task :metadata:checkstyleTest FAILED
  > Checkstyle rule violations were found
  > Checkstyle violations by severity: [error:2]
- el workflow imprimió:
  KAFKA_REV=99b940733a9f6bc409457dba7108f08421d81e42
  CAUSAL_WINDOW=EXECUTED
  TIMING_ONLY_DIAGNOSTIC=TRUE
  AB105_116R=UNCHANGED
  AB105_117R=NOT_CREATED
- NO debe interpretarse CAUSAL_WINDOW=EXECUTED como test científico ejecutado; la ejecución quedó bloqueada por Checkstyle antes de la prueba causal.

Run 36964801327 (PR runner):
- compile: SUCCESS
- Execute: FAILURE
- Emit evidence: SUCCESS
- por ahora no usar ningún witness; falta aislar la causa exacta del Execute.
- Este run sí demuestra que el problema de Checkstyle no fue el bloqueo del runner.
- Debe inspeccionarse el log de job 110706105958 buscando el primer error real del paso Execute.

## Hallazgo de esta continuidad
La última inspección detectó dos fallos distintos en dos runners:
A) run 36964801292: Checkstyle bloqueó el paso de ejecución antes de la prueba.
B) run 36964801327: compilación pasó, pero Execute falló. Necesita diagnóstico exacto.

No inventar witness ni clasificar POST_RETURN_ALLOWED/POST_RETURN_DENIED todavía.

## Antecedentes que NO se deben perder
Kafka rev fijada: 99b940733a9f6bc409457dba7108f08421d81e42.
Java 21.0.12.1 LTS en ejecuciones previas; runner actual mostró Temurin 21.0.12+1.
G0 one-broker corrected witness:
G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1
Artifact bootstrap ID 11199086900, digest d43efa23640881711f188a17e1af2dfa890f801a04d0d5974945bc8cc9c343eb.
Multi-broker PR #82 exact witness:
G0_MULTI_WITNESS TARGET_BROKER=1 LEADER_TARGET=1 LEADER_OTHER_VIEW=1 D0=OBSERVED TARGET_LOCAL_ACL_COUNT_AFTER_D0=0 D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1
Propagation PR #86 exact witness:
G0_PROPAGATION_WITNESS TARGET_BROKER=1 LEADER_TARGET=1 LEADER_OTHER_VIEW=1 D0=WRITE_REVOKED_CONTROLLER_COMPLETE D1_AUTH_RESULT=DENIED D1_TARGET_LOCAL_ACL_COUNT_AT_DECISION=1 D2=SUCCESS E_BASELINE=0 E_AFTER=1
Interpretation of PR #86:
IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
D1_POST_D0_BYPASS=NOT_OBSERVED
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

Production StandardAuthorizer discriminator:
run 36958014786, job 110685238774, head ec12f67db238196778733c1c0af6aa966ab33614
witness:
G0_PRODUCTION_WITNESS ITERATIONS=10 D1_DENIED=10 D1_ALLOWED=0 D1_UNEXPECTED=0 STANDARD_AUTHORIZER=REAL RPC_REQUEST_AFTER_D0=REAL
artifact ID 11207231395, digest 5c9dcbca7e2bc2b532ee7ddfae4791c0a9e440719eedeb5fcbb684fd7cafbd66
Interpretation: no post-D0 stale WRITE authorization observed in 10 iterations; JMM HB UNKNOWN; exploitability/generalization/production impact/security conclusion remain UNKNOWN/not established.

Direct JMM diagnostic:
run 36960926363, job 110694206822, success
witness:
JMM_DIRECT_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=2598444 STALE_ALLOWED_IN_POST_WINDOW=75844 DENIED_IN_POST_WINDOW=1746509 UNEXPECTED=0
artifact ID 11207703791, digest b2992d95c0ac3bccdb54cec526424f7e3e65fe77539db7a04fc6e9c8c75ba107
Critical interpretation: 75,844 ALLOWED are NOT proof of result after removeAcl() return; timing window overlapped writer. COMPLETED_REMOVE_THEN_ALLOWED=NOT_ESTABLISHED.

## Source-level findings
Pinned source files:
- StandardAuthorizer.java
- StandardAuthorizerData.java
- AclCache.java
- AclPublisher.java
- MetadataLoader.java
- AuthHelper.java
- KafkaEventQueue.java

Findings:
- StandardAuthorizer.data is volatile; authorize() snapshots it.
- StandardAuthorizerData owns ACL cache; add/remove replace aclCache with a new immutable AclCache.
- StandardAuthorizerData is explicitly not thread-safe.
- aclCache itself is plain/nonvolatile.
- AclPublisher applies snapshot or ordered delta updates and comments that ACL changes must be handled carefully because authorizer continues returning results in other threads.
- MetadataLoader has its own thread for publisher callbacks.
- KafkaEventQueue unlocks before event.run(); queue lock alone does not prove visibility to unrelated RPC authorization thread.
- RPC path is network/request thread -> KafkaApis -> AuthHelper -> StandardAuthorizer.authorize().
- No direct Java Memory Model happens-before edge from MetadataLoader/AclPublisher incremental aclCache assignment to unrelated RPC thread has been established.
- IMPORTANT discrepancy: StandardAuthorizer comments mention a read-write lock, but pinned implementation has no read-write lock. Resolve before final conclusions.
- Current hypothesis is narrower: possible visibility/concurrency boundary around plain aclCache publication, not a proven stale cache vulnerability.

## Prior direct-race correction
Initial direct JMM run used shared atomic timing/counters and was methodologically insufficient.
The causal-v2 design intentionally removed shared race-side counters and classifies after join.
Do NOT regress to completion flags/latches/volatile gates.

## Required next action
1. Inspect job 110706105958 log and isolate exact Execute failure.
2. If test itself fails due Checkstyle/SpotBugs or harness issue, correct minimally without changing causal semantics.
3. Do NOT rerun TLC.
4. Do NOT create AB105.117R.
5. Do NOT classify any result until a successful causal test prints:
CAUSAL_JMM_RACE ITERATIONS=... READERS=... OBSERVATIONS=... POST_RETURN_ALLOWED=... POST_RETURN_DENIED=... OVERLAP_ALLOWED=... OVERLAP_DENIED=... UNEXPECTED=...
6. On successful result, save a result checkpoint with exact run/job/head/artifact/digest and epistemic interpretation.
7. Preserve UNKNOWN/PENDING and every failed attempt.

## DO-NOT-REPEAT
- Do not call a compile/checkstyle failure a scientific result.
- Do not infer D1/authorization from timeout or wrapper exception.
- Do not treat scheduled timestamp or overlap as proof of JMM happens-before.
- Do not use a completion flag to create the ordering being measured.
- Do not silently modify AB105.116R.
- Do not create AB105.117R.
- Do not rerun TLC.

## CONTINUITY recovery command
At next chat, start by reading this file and then checking the current PR #89 / runs 36964801292 and 36964801327. The immediate unresolved item is the exact failure inside job 110706105958 Execute step.
