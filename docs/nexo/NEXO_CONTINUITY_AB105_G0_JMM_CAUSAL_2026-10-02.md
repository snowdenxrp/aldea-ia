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

## G0 runtime attempt — run 36968055705
Run: 36968055705, job: 110715994610, PR #91 merge ref: 4849480e0a1928f7a75e16642197b0dc9b50577d.
- Kafka: 99b940733a9f6bc409457dba7108f08421d81e42.
- Java: 21.0.12.1 LTS.
- Compile Kafka infrastructure: SUCCESS.
- Temporary G0 harness compile: SUCCESS.
- Runtime test actually EXECUTED, but failed before D2 release/witness.
- Exact first causal harness failure: synthetic D1 AuthorizableRequestContext returned clientAddress() = null; StandardAuthorizerData.authorize() dereferenced clientAddress().getHostAddress(), producing NullPointerException at StandardAuthorizerData.java:245 and NexoG0RuntimeTest.java:231.
- Raw runtime logs also show A1 reached the TargetAuthorizer and remained blocked on A1_RELEASE; repeated TOPIC_AUTHORIZATION_FAILED messages are downstream of the blocked test and are not a scientific result.
- Therefore: A1=OBSERVED is supported by the control flow/error sequence, but D0/D1/D2/E witness is NOT established.
- Minimal correction committed on PR #91 branch: 96aee422286b5602c3f188736e1910c1017112ab, changing only the synthetic clientAddress() return from null to InetAddress.getLoopbackAddress().
- No change to A1→D0→D1→D2→E causal design; AB105.116R unchanged; AB105.117R not created; TLC not rerun.
- Next gate: obtain a fresh PR workflow execution for head 96aee422286b5602c3f188736e1910c1017112ab and inspect raw runtime witness.

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



## NUEVO HALLAZGO — discriminador JMM causal ejecutado
Se revisaron nuevamente los runs exitosos del PR #89 en el commit 0388dce81a2e08dd90f96f6806fe74683ed6f543.

Run 36965213770 / job 110707365331:
- Compile: SUCCESS
- Execute: SUCCESS
- Witness: CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=2531489 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=2466195 OVERLAP_ALLOWED=18300 OVERLAP_DENIED=62 UNEXPECTED=0

Run 36965213781 / job 110707365140:
- Compile: SUCCESS
- Execute: SUCCESS
- Witness: CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=5556071 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=5457434 OVERLAP_ALLOWED=29225 OVERLAP_DENIED=68 UNEXPECTED=0

Lectura correcta:
- 🟢 El discriminador sí se ejecutó; el estado anterior que lo trataba como simplemente bloqueado por Checkstyle estaba desactualizado.
- 🟢 En ambos runs, con 100 iteraciones y 4 readers, se observaron cero ALLOWED cuyo inicio medido fuese estrictamente posterior al retorno medido de removeAcl(): POST_RETURN_ALLOWED=0.
- 🟢 También se observaron autorizaciones dentro de intervalos solapados con removeAcl(), por lo que la carrera temporal sí produjo observaciones concurrentes: OVERLAP_ALLOWED=18300 y 29225 respectivamente.
- 🔵 La clasificación es post-hoc después de join(); los contadores no participan en la carrera. No se introdujo latch/barrier/volatile gate para liberar readers.
- 🔵 System.nanoTime() establece una comparación temporal monotónica entre timestamps; NO constituye por sí solo una prueba de Java Memory Model happens-before.
- 🔴 Por tanto, este resultado NO demuestra un teorema JMM general ni descarta todas las formas de stale visibility. Demuestra únicamente que, en estas dos ejecuciones del harness, no se observó un ALLOWED cuyo enter timestamp quedara después del return timestamp medido de removeAcl().
- JMM happens-before general: UNKNOWN.
- Exploitability: UNKNOWN.
- Generalization: UNKNOWN.
- Production impact: UNKNOWN.
- Security conclusion: NOT_ESTABLISHED.

Nota de trazabilidad: el workflow imprime TIMING_ONLY_DIAGNOSTIC=TRUE y no subió artifact en estos runs; los witnesses anteriores son los logs raw de los jobs. No debe confundirse esa etiqueta con “test no ejecutado”: el test sí ejecutó y terminó SUCCESS.

## Próximo paso de investigación
Antes de avanzar a cualquier nueva versión AB, revisar formalmente la semántica del discriminador contra JMM y resolver la discrepancia ya registrada entre comentarios de StandardAuthorizer sobre read-write lock y la implementación fijada. No crear AB105.117R mientras esa revisión semántica siga abierta.

## NUEVO CHECKPOINT — G0 runtime bootstrap corregido
Run: 36969192502 (run #56), job: 110719406205
Workflow: NEXO AB105 G0 Kafka Bootstrap
Head: 96aee422286b5602c3f188736e1910c1017112ab
PR: #91
Kafka: 99b940733a9f6bc409457dba7108f08421d81e42
Java: Temurin 21 (runner)
Resultado del job: SUCCESS

Ejecución:
- Compile Kafka test infrastructure: SUCCESS
- Temporary G0 runtime harness: SUCCESS
- Real G0 runtime harness: EXECUTED, SUCCESS
- El log del test imprime exactamente:
  G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1
- No apareció el NPE anterior de clientAddress(); la corrección mínima de 96aee422... permitió completar el flujo.
- Artifact: nexo-ab105-g0-bootstrap-evidence
- Artifact ID: 11210977168
- Artifact digest: sha256:b0e6ae6499b76f1de0363805a58ae45635b9d661b169cb6338893338d2e31c54

Interpretación epistemológica:
- 🟢 G0 one-broker bootstrap/runtime witness RECUPERADO en este harness: A1, D0, D1, D2 y transición E fueron observados en la ejecución exitosa.
- 🔵 La corrección 96aee422... fue estrictamente de soporte del harness: clientAddress sintético no nulo; no cambia el diseño A1→D0→D1→D2→E.
- 🔴 Esto NO demuestra el discriminador JMM causal ni un happens-before general. Este workflow valida el bootstrap/runtime G0, no la condición POST_RETURN_ALLOWED.
- JMM HB: UNKNOWN.
- Exploitability: UNKNOWN.
- Generalization: UNKNOWN.
- Production impact: UNKNOWN.
- Security conclusion: NOT_ESTABLISHED.

## Estado inmediato actualizado
El bloqueo inmediato del bootstrap G0 queda resuelto con witness completo en run 36969192502. La siguiente investigación debe volver al discriminador JMM causal; el requisito de éxito sigue siendo obtener:
CAUSAL_JMM_RACE ITERATIONS=... READERS=... OBSERVATIONS=... POST_RETURN_ALLOWED=... POST_RETURN_DENIED=... OVERLAP_ALLOWED=... OVERLAP_DENIED=... UNEXPECTED=...
No modificar AB105.116R. No crear AB105.117R. No rerun TLC.

## CONTINUITY recovery command
At next chat, start by reading this file and then checking the current PR #89 / runs 36964801292 and 36964801327. The immediate unresolved item is the exact failure inside job 110706105958 Execute step.


## CHECKPOINT — revisión semántica JMM del discriminador y discrepancia read-write lock
Fecha: 2026-10-02

### 1. Log del runner 110706105958 resuelto
La inspección completa del job confirma que el Execute FAILURE fue causado por Checkstyle del archivo inyectado, no por el runtime del experimento.
- NexoJmmCausalWindowTest.java, línea 102:5
- Cyclomatic Complexity = 20, máximo = 16
- NPath Complexity = 1,409, máximo = 500
- La compilación de test/infrastructura fue SUCCESS antes de Checkstyle.
- Por tanto: este run NO es witness científico.
Esto coincide con la corrección posterior que separó la clasificación en funciones auxiliares y produjo el head 0388dce81a2e08dd90f96f6806fe74683ed6f543, cuyos runs 36965213770 y 36965213781 sí ejecutaron el test.

### 2. Discrepancia read-write lock: confirmación exacta
En Kafka rev 99b940733a9f6bc409457dba7108f08421d81e42, StandardAuthorizer.java contiene un comentario sobre un read-write lock, pero el campo real es únicamente la referencia volatile data. No existe un ReentrantReadWriteLock ni otra lectura/escritura lock en la clase inspeccionada.
La ruta real es:
- authorize() lee data una vez en curData.
- addAcl/removeAcl llaman data.addAcl/removeAcl() sobre el objeto StandardAuthorizerData actualmente referenciado.
- StandardAuthorizerData declara explícitamente que la clase no es thread-safe.
- aclCache es un campo privado no-volátil y add/remove reasignan ese campo dentro del mismo objeto.
Conclusión: el comentario de read-write lock no describe el mecanismo real presente en la revisión fijada. Debe tratarse como documentación inconsistente/obsoleta, no como evidencia de que existe un lock.

### 3. Consecuencia JMM, delimitada
La volatilidad de StandardAuthorizer.data sí proporciona semántica volatile para accesos a esa referencia y para la publicación de nuevos objetos StandardAuthorizerData cuando data se reasigna. Pero no convierte en volátil aclCache ni crea por sí misma un happens-before para una reasignación posterior de aclCache hecha sobre el mismo objeto.
Por ello:
- 🟢 existe una frontera volatile alrededor de la referencia data;
- 🟢 aclCache es plain/nonvolatile en el objeto compartido;
- 🟢 StandardAuthorizerData se declara no thread-safe;
- 🔴 NO se ha demostrado que una autorización posterior al retorno de removeAcl() necesariamente observe la nueva aclCache bajo JMM;
- 🔴 tampoco se ha demostrado que necesariamente pueda observar la antigua aclCache después del retorno; la posibilidad concreta y explotabilidad requieren evidencia adicional.

### 4. Relación con el discriminador causal
Los runs 36965213770 y 36965213781 siguen siendo evidencia temporal del harness: POST_RETURN_ALLOWED=0 en ambos, con OVERLAP_ALLOWED > 0. Eso no contradice la posibilidad teórica de una lectura stale; solamente significa que el harness no observó un ALLOWED cuyo inicio medido fuese posterior al retorno medido de removeAcl() en esas ejecuciones.
Estados: temporalidad por nanoTime = EVIDENCE; JMM happens-before general = UNKNOWN; stale-read possibility como hecho de ejecución = UNKNOWN; exploitability = UNKNOWN; generalization = UNKNOWN; production impact = UNKNOWN; security conclusion = NOT_ESTABLISHED.

### 5. Decisión de continuidad
No crear AB105.117R. No modificar AB105.116R. No rerun TLC. No repetir el discriminador causal ya ejecutado con éxito.
Siguiente trabajo: revisión de alcanzabilidad/semántica centrada en si existe una cadena de sincronización real entre el hilo que ejecuta removeAcl()/AclPublisher y el hilo RPC que entra en authorize(), sin asumir que el comentario del lock es correcto.
DO-NOT-REPEAT: no usar el comentario read-write lock como evidencia de sincronización; verificar siempre el mecanismo ejecutable en la revisión fijada.


## CHECKPOINT — alcanzabilidad real AclPublisher → authorize()
Fecha: 2026-10-02

### Cadena ejecutable verificada
🟢 MetadataLoader mantiene un hilo propio para callbacks de publishers. `maybePublishMetadata()` ejecuta `publisher.onMetadataUpdate(...)` en ese hilo; `AclPublisher.onMetadataUpdate()` llama directamente `clusterMetadataAuthorizer.addAcl/removeAcl()`.

🟢 `StandardAuthorizer.removeAcl()` delega directamente a `data.removeAcl(id)`. En la revisión fijada, `StandardAuthorizerData.removeAcl()` calcula un nuevo `AclCache` y después reasigna `aclCache`.

🟢 `StandardAuthorizer.authorize()` lee la referencia `data` una vez (`curData = data`) y luego llama `curData.authorize(...)`. Por tanto, una llamada RPC puede conservar el mismo objeto `StandardAuthorizerData` mientras el hilo MetadataLoader modifica su campo `aclCache`.

🟢 `StandardAuthorizerData` declara explícitamente que no es thread-safe y `aclCache` no es volatile.

### KafkaEventQueue: qué sí y qué no sincroniza
🟢 `KafkaEventQueue` usa `ReentrantLock` para proteger la estructura interna de la cola. El hilo productor adquiere/libera ese lock al encolar; el hilo event-handler también lo adquiere/libera para retirar eventos.

🟢 Pero `EventHandler.handleEvents()` retira el evento bajo el lock y después ejecuta `toRun.run(...)` fuera del lock. La llamada efectiva `AclPublisher.onMetadataUpdate()` ocurre fuera de ese `ReentrantLock`.

Por tanto:
- 🔵 el lock de la cola sincroniza la administración/entrega del evento;
- 🔴 no constituye un lock compartido entre la ejecución de `removeAcl()` y el hilo RPC que ejecuta `authorize()`;
- 🔴 no se puede usar el lock de KafkaEventQueue como happens-before directo para `aclCache` frente a `authorize()`.

### Punto JMM crítico
La referencia `StandardAuthorizer.data` es volatile, pero la ruta incremental `removeAcl()` no reasigna `data`; muta el objeto referenciado y reasigna solamente `data.aclCache`, que es plain/nonvolatile.

Así, en la ruta incremental observada:
`MetadataLoader event thread → AclPublisher → StandardAuthorizer.removeAcl() → StandardAuthorizerData.aclCache = newCache`
no se encontró una escritura volatile, monitor compartido, lock compartido con RPC, thread join, future completion/await ni otra sincronización explícita que establezca un happens-before hacia el hilo de `authorize()` después de esa reasignación.

Esto establece una **ausencia de una cadena HB identificada**, no la existencia demostrada de una lectura stale ni una vulnerabilidad explotable.

### Estado epistemológico actualizado
🟢 Alcanzabilidad de la mutación incremental desde MetadataLoader/AclPublisher hasta `aclCache` verificada en código.
🟢 Ausencia del supuesto read-write lock verificada en `StandardAuthorizer` fijado.
🟢 KafkaEventQueue no cubre la ejecución del publisher bajo su lock.
🔴 JMM: no se ha demostrado todavía el resultado permitido por el modelo para una lectura concreta de `aclCache` después de `removeAcl()`; requiere formalizar la ejecución concurrente y las reglas de visibilidad aplicables.
🔴 stale authorization observable: UNKNOWN.
🔴 exploitability: UNKNOWN.
🔴 generalization: UNKNOWN.
🔴 production impact: UNKNOWN.
🔴 security conclusion: NOT_ESTABLISHED.

### DO-NOT-REPEAT
No tratar `ReentrantLock` de KafkaEventQueue como sincronización de la autorización. No inferir stale-read/exploitability solamente de que `aclCache` sea nonvolatile. No convertir la ausencia de HB identificada en un exploit demostrado.

### Próximo paso
Formalizar el pequeño grafo JMM de la ruta incremental: escrituras/lecturas de `data`, `aclCache`, publicación del objeto y acciones de los hilos, y separar estrictamente `happens-before`, `synchronizes-with` y simple orden temporal `nanoTime`.
