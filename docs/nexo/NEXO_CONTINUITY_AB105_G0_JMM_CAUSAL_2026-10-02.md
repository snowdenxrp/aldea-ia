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


## CHECKPOINT — grafo JMM formalizado para ruta incremental
Fecha: 2026-10-02

### Grafo mínimo
Definimos, para un objeto D = StandardAuthorizerData ya publicado por StandardAuthorizer.data:
W0: construcción/publicación inicial de D y su aclCache inicial.
V0: lectura volatile de StandardAuthorizer.data por un hilo de authorize() que obtiene D.
R0: lectura de D.aclCache dentro de findAclRule().
W1: hilo MetadataLoader/AclPublisher ejecuta D.removeAcl(id) y hace D.aclCache = newCache.
R1: una autorización concurrente vuelve a leer D.aclCache.

### Relaciones JMM separadas
🟢 Si W0 ocurre antes de la escritura volatile de StandardAuthorizer.data, y V0 lee esa publicación volatile, las acciones anteriores a esa escritura quedan ordenadas antes de V0 por la semántica volatile/happens-before. Eso cubre la publicación inicial correspondiente.
🔵 W1 es posterior a esa publicación y es una escritura ordinaria sobre D.aclCache. La posterioridad temporal no crea por sí sola happens-before.
🔵 R1 es una lectura ordinaria de D.aclCache. Si no existe una cadena de sincronización adicional entre W1 y R1, tampoco hay synchronizes-with ni happens-before W1→R1 identificada.
🔴 El volatile de StandardAuthorizer.data NO arrastra automáticamente las futuras escrituras plain de D.aclCache. Leer el mismo valor volatile D otra vez no convierte W1 en volatile.

### Distinción crucial
- nanoTime: relación temporal observada por el harness; NO es JMM happens-before.
- join(): sí establece una relación de sincronización para las acciones realizadas antes de la terminación del hilo respecto del hilo que hace join(), pero el discriminador clasifica después de join() y no usa ese join() para comunicar el estado de ACL entre writer y reader durante la carrera.
- ReentrantLock de KafkaEventQueue: sincroniza productores/event-handler en la administración de la cola; no envuelve la llamada event.run() y no es adquirido por authorize().
- volatile data: publica/reemplaza la referencia StandardAuthorizerData cuando esa referencia se escribe; no hace volatile aclCache.

### Qué permite concluir el modelo
🟢 Existe una ruta concurrente real con W1 y R1 sobre el mismo StandardAuthorizerData.
🟢 No se identificó HB W1→R1 para la reasignación incremental de aclCache.
🔵 El modelo JMM deja abierta la posibilidad de que una lectura ordinaria no observe inmediatamente la escritura ordinaria concurrente; esto es una propiedad del modelo, no una observación del harness.
🔴 No se ha demostrado que R1 vaya a devolver ALLOWED después de W1 en una ejecución real, ni que el cliente pueda convertir esa posibilidad en una autorización indebida.
🔴 Tampoco se ha demostrado que el código sea necesariamente incorrecto bajo alguna interpretación adicional del entorno: todavía hay que revisar la publicación/estructura de AclCache, la cadena completa de llamadas RPC y si existe sincronización externa fuera de estas clases.

### Estado
JMM graph: PARTIAL-FORMALIZED.
HB W1→R1: NOT_IDENTIFIED.
Stale read in production: UNKNOWN.
Stale ALLOWED after revocation: UNKNOWN.
Exploitability: UNKNOWN.
Generalization: UNKNOWN.
Production impact: UNKNOWN.
Security conclusion: NOT_ESTABLISHED.

### DO-NOT-REPEAT
No presentar plain + no HB como prueba de exploit. No usar nanoTime, join() del harness ni el lock interno de la cola como sustitutos de una sincronización entre writer y RPC reader.

### Próximo paso
Revisar AclCache y la ruta RPC hasta StandardAuthorizer.authorize() para determinar si existe una sincronización externa o una publicación alternativa que cierre W1→R1.

## CHECKPOINT — AclCache + ruta RPC revisadas
Fecha: 2026-10-02

### AclCache
🟢 AclCache está documentada e implementada como inmutable: sus referencias internas son final y add/remove construyen una nueva AclCache.
🟢 Por tanto, la carrera relevante no es mutación interna de una misma AclCache; es la publicación plain de la referencia D.aclCache = newCache.
🔵 Un reader que ya tiene el mismo StandardAuthorizerData puede leer una referencia AclCache anterior si esa lectura ordinaria no observa W1; esto sigue siendo posibilidad del modelo, no evidencia de ejecución.

### Ruta RPC confirmada
🟢 AuthHelper.authorize() construye Action y llama directamente a authorizer.get().authorize(requestContext, actions).
🟢 StandardAuthorizer.authorize() hace una sola lectura de data hacia curData y después ejecuta curData.authorize(...).
🟢 StandardAuthorizerData.findAclRule() toma una lectura ordinaria de aclCache y la guarda en aclCacheSnapshot.
🔵 En estas capas no apareció un lock compartido con AclPublisher ni una espera/CompletionStage que sincronice específicamente W1 con la autorización RPC.
🔴 La búsqueda todavía no constituye prueba de que no exista sincronización en una capa superior concreta del handler RPC; esa parte queda abierta hasta inspeccionar el caller real que invoca AuthHelper para la operación objetivo.

### Estado actualizado
AclCache immutability: VERIFIED.
Incremental reference publication D.aclCache: PLAIN_WRITE.
RPC path to authorize(): VERIFIED through AuthHelper.
External W1→R1 synchronization: NOT_IDENTIFIED in inspected layers.
Stale read: UNKNOWN.
Stale ALLOWED after revocation: UNKNOWN.
Exploitability: UNKNOWN.
Security conclusion: NOT_ESTABLISHED.

### Próximo paso
Inspeccionar el caller RPC concreto para WRITE/TOPIC authorization y cualquier executor/thread handoff que pudiera introducir synchronizes-with antes de AuthHelper.authorize().

## CHECKPOINT — caller RPC WRITE/TOPIC revisado
Fecha: 2026-10-02

### Caller concreto
🟢 En el rev Kafka fijado, KafkaApis.handleProduceRequest() ejecuta la autorización de topics mediante authHelper.filterByAuthorized(request.context, WRITE, TOPIC, ...) antes de pasar las solicitudes autorizadas a replicaManager.handleProduceAppend(...).
🟢 AuthHelper.filterByAuthorized() termina llamando directamente a authorizer.get().authorize(requestContext, actions); no introduce un lock/await/future entre el caller y StandardAuthorizer.authorize().
🟢 El dispatcher de KafkaApis.handle() selecciona ApiKeys.PRODUCE y llama handleProduceRequest directamente en ese flujo; para este camino no se identificó un handoff asíncrono entre dispatch y autorización.
🔵 Esto hace que el reader RPC sea una llamada síncrona desde el hilo que procesa Produce, mientras el publisher de ACL pertenece al flujo de metadata separado ya identificado.

### Grafo actualizado
MetadataLoader thread → AclPublisher → StandardAuthorizerData.removeAcl() → W1(aclCache=newCache)
Kafka request thread → KafkaApis.handleProduceRequest() → AuthHelper.filterByAuthorized() → StandardAuthorizer.authorize() → StandardAuthorizerData.authorize() → R1(aclCache)

🔴 En el tramo inspeccionado no apareció una relación synchronizes-with explícita entre ambos hilos.
🔴 Sigue sin existir evidencia de HB(W1→R1) específica para la publicación incremental de aclCache.

### Importante
La ausencia de un handoff en KafkaApis → AuthHelper elimina una posible explicación sencilla basada en Future/await dentro del caller, pero no demuestra por sí sola que el sistema completo carezca de sincronización externa.

Estado: JMM_GRAPH=PARTIAL-FORMALIZED; EXTERNAL_HB=NOT_IDENTIFIED; STALE_READ=UNKNOWN; STALE_ALLOWED=UNKNOWN; EXPLOITABILITY=UNKNOWN; SECURITY_CONCLUSION=NOT_ESTABLISHED.

### Próximo paso
Inspeccionar el modelo de ejecución del request thread/socket server y el origen del thread de MetadataLoader, buscando una relación de sincronización común que pueda cerrar W1→R1 fuera de las clases ya revisadas.


## CHECKPOINT — execution threads y aislamiento confirmados
Fecha: 2026-10-02

### Request side
🟢 KafkaRequestHandler es un pool de threads dedicado: recibe Request desde RequestChannel y ejecuta apis.handle(request, requestLocal) directamente en el request thread.
🟢 Para Produce, ese flujo llega a KafkaApis.handleProduceRequest() y de ahí a AuthHelper/StandardAuthorizer sin un handoff asíncrono previo a la autorización.
🔵 RequestChannel entrega la petición al handler; no se identificó en el tramo revisado una operación de lock compartido con MetadataLoader que cubra la autorización.

### Metadata side
🟢 MetadataLoader mantiene su propio thread mediante KafkaEventQueue; sus callbacks a publishers se ejecutan desde ese contexto.
🟢 handleCommit() y handleLoadSnapshot() hacen append al eventQueue, y maybePublishMetadata() invoca publisher.onMetadataUpdate() desde ese flujo.
🟢 El estado MetadataLoader.image está documentado como accesible solo desde el event-queue thread.
🔵 Por tanto, el W1 de AclPublisher pertenece a un execution domain distinto del request thread que realiza R1.

### Resultado JMM
🟢 Queda reforzada la separación de execution domains.
🔴 No se identificó todavía una sincronización común que establezca HB(W1→R1).
🔴 La existencia de dos threads separados no demuestra stale read: solo elimina la hipótesis de que ambos actos sean necesariamente serializados por el mismo thread.

Estado: REQUEST_THREAD=VERIFIED; METADATA_EVENT_THREAD=VERIFIED; SHARED_HB_W1_R1=NOT_IDENTIFIED; STALE_READ=UNKNOWN; STALE_ALLOWED=UNKNOWN; EXPLOITABILITY=UNKNOWN; SECURITY_CONCLUSION=NOT_ESTABLISHED.

### DO-NOT-REPEAT
No convertir 'threads separados' en 'bug demostrado'. No usar RequestChannel/handler scheduling como sustituto de una sincronización con MetadataLoader.

### Próximo paso
Revisar la entrega `RaftClient → MetadataLoader.eventQueue` y, por separado, cualquier sincronización de inicialización/publicación del Authorizer que pueda establecer HB entre metadata publisher y request handlers.


## CHECKPOINT — startup synchronization vs steady-state ACL mutation
Fecha: 2026-10-02

🟢 `MetadataLoader` usa su `KafkaEventQueue`; `AclPublisher` aplica deltas desde ese flujo y documenta explícitamente que el Authorizer continúa respondiendo en otros threads durante cambios ACL.
🟢 `StandardAuthorizer.start()` usa `initialLoadFuture` para sincronizar la disponibilidad inicial del authorizer con la carga inicial.
🔵 Esa sincronización es de INICIALIZACIÓN; no aparece como sincronización por cada revocación posterior.
🔴 El comentario de `StandardAuthorizer.data` habla de un read-write lock, pero el código pinneado no contiene tal lock: `data` es `volatile` y `authorize()` toma `curData = data`.
🔵 La mutación incremental escribe `D.aclCache` dentro del `StandardAuthorizerData` ya publicado. La publicación volatile inicial no convierte las escrituras posteriores plain de `aclCache` en escrituras volatile ni crea por sí sola HB con una lectura concurrente.

Estado: `HB(W1→R1)=NOT_IDENTIFIED`; `STARTUP_HB=VERIFIED_FOR_INITIAL_LOAD_ONLY`; `STEADY_STATE_ACL_MUTATION_HB=NOT_IDENTIFIED`; `STALE_READ=UNKNOWN`; `STALE_ALLOWED=UNKNOWN`; `EXPLOITABILITY=UNKNOWN`; `SECURITY_CONCLUSION=NOT_ESTABLISHED`.

DO-NOT-REPEAT: no usar `initialLoadFuture` como prueba para revocaciones posteriores; no tratar el comentario del supuesto lock como implementación.

Próximo paso: cerrar `KafkaEventQueue` (`append → event.run`) y revisar `StandardAuthorizerData` por sincronización interna omitida.


## CHECKPOINT — KafkaEventQueue HB boundary + StandardAuthorizerData internals
Fecha: 2026-10-02

### KafkaEventQueue
🟢 `enqueue()` modifica la cola bajo `ReentrantLock` y hace `unlock()`; el event-handler adquiere el mismo lock antes de retirar el evento (`remove`) y después libera el lock antes de ejecutar `event.run()`.
🟢 Bajo JMM, la liberación del mismo lock seguida de una adquisición posterior por el event-handler establece una relación de sincronización; por programa, esa adquisición precede al `toRun.run()` que ejecuta el evento. Por tanto, para un evento efectivamente tomado por el handler, la cadena `producer actions → enqueue lock-release → handler lock-acquire → event.run()` proporciona HB hacia la ejecución del callback.
🟢 Esto fortalece la visibilidad **dentro del metadata/event-handler execution domain**.
🔴 No aparece ninguna adquisición del `KafkaEventQueue` lock por el request thread que ejecuta `authorize()`. Por ello, la cadena de HB termina en `event.run()` y no alcanza automáticamente R1.

### StandardAuthorizerData
🟢 `aclCache` es un campo plain y `AclCache` es inmutable.
🟢 `removeAcl()` construye primero `aclCacheSnapshot = aclCache.removeAcl(id)` y después ejecuta la asignación plain `aclCache = aclCacheSnapshot`.
🟢 `findAclRule()` captura `AclCache aclCacheSnapshot = aclCache` mediante lectura plain y opera sobre esa instantánea inmutable.
🟢 No se encontró lock/synchronized/volatile sobre `aclCache` dentro de `StandardAuthorizerData` que cierre W1→R1.
🔵 Esto significa que el metadata event thread tiene una secuencia bien ordenada internamente, mientras que la publicación hacia un request thread concurrente sigue siendo el punto abierto.

### Refinamiento del grafo
`Raft/Metadata producer → KafkaEventQueue.enqueue(lock) → handler lock acquire → AclPublisher.onMetadataUpdate() → W1(aclCache=newCache)`
`request thread → KafkaApis → AuthHelper → StandardAuthorizer.authorize() → R1(aclCache)`

`HB producer→event callback: IDENTIFIED`
`HB W1→R1: NOT_IDENTIFIED`
`COMMON_SYNC_TO_R1: NOT_IDENTIFIED`

### Estado
`STALE_READ=UNKNOWN`
`STALE_ALLOWED=UNKNOWN`
`EXPLOITABILITY=UNKNOWN`
`GENERALIZATION=UNKNOWN`
`PRODUCTION_IMPACT=UNKNOWN`
`SECURITY_CONCLUSION=NOT_ESTABLISHED`

### DO-NOT-REPEAT
No decir que `KafkaEventQueue` carece de HB: sí existe una cadena de lock hacia `event.run()`. La conclusión correcta es más estrecha: **ese HB no cruza hasta el request-thread `authorize()` en las capas revisadas**.

### Próximo paso
Inspeccionar si existe alguna publicación/lectura posterior de `StandardAuthorizer.data` o mecanismo global de request synchronization que pueda conectar el callback de metadata con los request threads; si no aparece, formalizar el límite exacto de la afirmación sin convertirlo en exploit.


## CHECKPOINT — volatile `data` is not a publication edge for later `aclCache` writes
Fecha: 2026-10-02

🟢 Pinned `StandardAuthorizer` confirms `data` is `volatile`, and `authorize()` performs one volatile read into `curData`.
🟢 However, steady-state `addAcl()`/`removeAcl()` call `data.addAcl/removeAcl()` without assigning a new `data` reference. Therefore the volatile variable is **not written** at W1.
🟢 W1 remains the plain write `D.aclCache = newCache`; R1 remains the plain read `D.aclCache` inside `findAclRule()`.
🟢 `StandardAuthorizerData` is explicitly documented as **not thread-safe**.
🟢 `KafkaRequestHandler` confirms request processing occurs on dedicated request-handler threads and invokes `apis.handle(request, requestLocal)` directly; no common authorizer lock is introduced here.

### Critical distinction
`volatile data` can publish writes that happened-before a volatile write/read sequence when the `data` reference is reassigned. It does **not** retroactively make later mutations inside the already-published `StandardAuthorizerData` volatile, and a later volatile read of the unchanged reference does not create a synchronizes-with edge from W1.

### Formal status
`W1→R1 HB = NOT_IDENTIFIED`
`VOLATILE_PUBLICATION_CLOSURE = NOT_PRESENT_FOR_STEADY_STATE`
`REQUEST_SYNC_CLOSURE = NOT_IDENTIFIED`
`STALE_READ = UNKNOWN`
`STALE_ALLOWED = UNKNOWN`
`EXPLOITABILITY = UNKNOWN`
`GENERALIZATION = UNKNOWN`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`

### DO-NOT-REPEAT
No claim that volatile `data` makes `aclCache` safe. No claim that absence of an HB edge proves stale visibility actually occurs.

### Next
Check whether `RequestChannel` itself introduces synchronization that reaches ACL publisher state (likely queue-local only), then inspect any broker-wide lifecycle barrier shared by metadata and request processing.


## CHECKPOINT — RequestChannel synchronization does not connect ACL mutation to authorization
Fecha: 2026-10-02

🟢 `RequestChannel.requestQueue` es `ArrayBlockingQueue`; `sendRequest()` usa `put()` y `receiveRequest()` usa `poll/take`, por lo que existe la sincronización propia de la transferencia de requests.
🔵 Esa relación publica el objeto `Request` desde el lado de red hacia el request-handler que lo consume.
🔴 No es una barrera sobre el estado de `StandardAuthorizerData`: el ACL mutation path no hace `sendRequest()` de la misma cola antes de W1 ni el request authorization path hace una operación de esa cola después de W1.
🟢 `KafkaRequestHandler` recibe el request y ejecuta `apis.handle()` directamente; no aparece un lock de RequestChannel mantenido durante `authorize()`.

### Límite actual del grafo
`metadata event thread → W1(plain aclCache write)`
`request thread → R1(plain aclCache read)`
`RequestChannel HB` queda en la transferencia del objeto `Request`, no conecta esas dos cadenas.

### Estado
`HB W1→R1 = NOT_IDENTIFIED`
`REQUEST_CHANNEL_CLOSURE = NOT_PRESENT`
`LIFECYCLE_GLOBAL_BARRIER = NOT_IDENTIFIED`
`STALE_READ = UNKNOWN`
`STALE_ALLOWED = UNKNOWN`
`EXPLOITABILITY = UNKNOWN`
`GENERALIZATION = UNKNOWN`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`

### Próximo
Revisar lifecycle de `BrokerServer`/`MetadataLoader` para comprobar si existe una barrera común que obligue a los request handlers a observar cada actualización ACL. Si tampoco existe, queda formalizado el límite arquitectónico de esta investigación; todavía no equivale a demostrar una lectura stale en producción.


## CHECKPOINT — Broker lifecycle barrier is startup-only
Fecha: 2026-10-02

🟢 BrokerServer.startup() instala AclPublisher y espera brokerMetadataPublisher.firstPublishFuture antes de habilitar el procesamiento de requests.
🟢 También espera las futures del authorizer y después socketServer.enableRequestProcessing(...); existe una barrera real para ARRANQUE, antes de aceptar tráfico normal.
🔵 Esa barrera no se repite por cada mutación ACL. Una vez iniciado el broker, AclPublisher continúa aplicando actualizaciones desde el flujo de metadata mientras los request handlers procesan requests concurrentemente.
🔴 No se identificó una operación del lifecycle que, para cada mutación W1 de revocación, obligue a todos los request threads a observar W1 antes de R1.

STARTUP_HB = VERIFIED
STEADY_STATE_ACL_MUTATION_HB = NOT_IDENTIFIED
LIFECYCLE_GLOBAL_BARRIER = NOT_PRESENT_FOR_PER_MUTATION
HB W1→R1 = NOT_IDENTIFIED

### Consecuencia epistemológica
Esto cierra el candidato de que la sincronización de startup garantice todas las revocaciones posteriores. No lo hace. Sin embargo, sigue sin demostrar que R1 efectivamente pueda leer un aclCache stale en una ejecución real; STALE_READ, STALE_ALLOWED, EXPLOITABILITY, GENERALIZATION y PRODUCTION_IMPACT permanecen UNKNOWN.

### Próximo paso
Cerrar la rama de EndpointReadyFutures/authorizer startup solo como confirmación de alcance y revisar si existe algún mecanismo específico de actualización ACL (future, lock, volatile publication o callback acknowledgement) que alcance al request thread durante steady-state.


## CHECKPOINT — ACL steady-state API has no per-mutation visibility acknowledgement
Fecha: 2026-10-02

🟢 AclPublisher aplica cada delta en orden: addAcl/removeAcl son invocados secuencialmente sobre el authorizer dentro del callback de metadata.
🟢 El comentario del código reconoce explícitamente que otros threads continúan haciendo authorization mientras se aplican cambios.
🟢 ClusterMetadataAuthorizer exige que sus métodos sean thread-safe.
🔵 createAcls/deleteAcls devuelven CompletionStage ligado a persistencia/llamada de mutación en el controller; eso no constituye por sí mismo un acknowledgement de que todos los request threads hayan observado el nuevo aclCache en cada broker.
🔴 No se identificó un future/lock/volatile publication que se extienda desde removeAcl() hasta el request-thread R1 durante steady-state.

`ACL_MUTATION_ORDER = IDENTIFIED`
`PER_MUTATION_VISIBILITY_ACK = NOT_IDENTIFIED`
`HB W1→R1 = NOT_IDENTIFIED`
`STALE_READ = UNKNOWN`
`STALE_ALLOWED = UNKNOWN`
`EXPLOITABILITY = UNKNOWN`
`GENERALIZATION = UNKNOWN`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`

Nota crítica: esto fortalece la hipótesis de una ventana concurrente, pero no prueba por sí solo una lectura stale ni un bypass de autorización. La propia documentación de AclPublisher advierte que las autorizaciones continúan ocurriendo durante la aplicación de cambios.

Próximo foco: determinar si existe alguna sincronización dentro de StandardAuthorizerData/AclCache o en la implementación concreta de Authorizer que pueda cerrar W1→R1 pese a no aparecer en AclPublisher.


## CHECKPOINT — Inner authorizer synchronization closed
Fecha: 2026-10-02

🟢 `AclCache` es explícitamente inmutable: cada add/remove construye un nuevo `AclCache`; no muta las estructuras publicadas.
🟢 `StandardAuthorizerData.findAclRule()` captura una referencia local `aclCacheSnapshot = aclCache` y toda la decisión usa esa instancia inmutable.
🔴 Pero la referencia `StandardAuthorizerData.aclCache` es plain y `StandardAuthorizerData` declara explícitamente `not thread-safe`.
🟢 La interfaz `ClusterMetadataAuthorizer` exige que sus métodos sean thread-safe; por tanto, la implementación debe cumplir esa propiedad externamente o mediante su diseño. En el código inspeccionado no apareció un lock que haga thread-safe la asignación plain de `aclCache`.
🔴 La inmutabilidad evita corrupción interna de una instancia observada, pero no crea por sí misma publicación JMM de la nueva referencia `AclCache` entre threads.

`ACL_OBJECT_MUTATION = IMMUTABLE_REPLACEMENT`
`ACL_REFERENCE_PUBLICATION = PLAIN`
`AUTHORIZE_SNAPSHOT = PLAIN_READ`
`INNER_LOCK_FOR_ACLCACHE = NOT_IDENTIFIED`
`HB W1→R1 = NOT_IDENTIFIED`
`STALE_READ = UNKNOWN`
`STALE_ALLOWED = UNKNOWN`
`EXPLOITABILITY = UNKNOWN`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`

Esto cierra la búsqueda de una protección interna obvia en AclCache/StandardAuthorizerData. El siguiente punto es comprobar la implementación concreta de la obligación thread-safe de ClusterMetadataAuthorizer y cualquier wrapper/Plugin que pudiera serializar las llamadas.


## CHECKPOINT — Concrete StandardAuthorizer implementation inspected
Fecha: 2026-10-02

🟢 `ClusterMetadataAuthorizer` declara que todos sus métodos deben ser thread-safe.
🟢 La implementación `StandardAuthorizer` expone `addAcl()`/`removeAcl()` simplemente como `data.addAcl()`/`data.removeAcl()`.
🔴 No hay `synchronized` ni `ReentrantReadWriteLock` en la implementación inspeccionada.
🔴 El comentario de `StandardAuthorizer.data` afirma que existe un read-write lock, pero el código fijado contiene solamente `private volatile StandardAuthorizerData data` y no contiene ese lock. Esto es una discrepancia comentario↔implementación, no evidencia de un lock oculto.
🟢 `loadSnapshot()` sí publica un nuevo `StandardAuthorizerData` mediante la escritura volatile de `data`; esto es distinto de las mutaciones steady-state `addAcl/removeAcl`, que conservan el mismo objeto `data` y sólo cambian su `aclCache` plain.

Conclusión de esta capa: no se encontró wrapper/lock dentro de `StandardAuthorizer` que cierre `W1→R1` para mutaciones ACL incrementales. La obligación de thread-safety de la interfaz no constituye por sí sola un mecanismo JMM identificable.

`STANDARD_AUTHORIZER_INNER_LOCK = NOT_IDENTIFIED`
`STEADY_STATE_VOLATILE_REPUBLICATION = NOT_PRESENT`
`LOAD_SNAPSHOT_VOLATILE_PUBLICATION = PRESENT`
`HB W1→R1 = NOT_IDENTIFIED`
`STALE_READ = UNKNOWN`
`STALE_ALLOWED = UNKNOWN`
`EXPLOITABILITY = UNKNOWN`
`GENERALIZATION = UNKNOWN`
`PRODUCTION_IMPACT = UNKNOWN`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`


## CHECKPOINT — Wrapper/Plugin path inspected
Fecha: 2026-10-02

🟢 `AclPublisher` obtiene el `ClusterMetadataAuthorizer` desde `Plugin.get()` y llama directamente `loadSnapshot/addAcl/removeAcl/completeInitialLoad`.
🟢 `Plugin<T>` sólo conserva `instance` y `get()` devuelve esa misma referencia; no introduce `synchronized`, lock, await ni proxy de autorización.
🟢 `AclPublisher` documenta explícitamente que durante la aplicación de cambios el Authorizer continúa devolviendo resultados en otros threads.
🔴 No apareció un wrapper externo en esta ruta que serialice las mutaciones ACL con las autorizaciones RPC.

`PLUGIN_SERIALIZATION = NOT_PRESENT`
`ACL_PUBLISHER_TO_AUTHORIZE_COMMON_LOCK = NOT_IDENTIFIED`
`HB W1→R1 = NOT_IDENTIFIED`
`STALE_READ = UNKNOWN`
`STALE_ALLOWED = UNKNOWN`
`EXPLOITABILITY = UNKNOWN`
`GENERALIZATION = UNKNOWN`
`PRODUCTION_IMPACT = UNKNOWN`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`

La capa wrapper queda sin mecanismo de cierre identificado. El siguiente análisis debe comprobar si existe sincronización común en la infraestructura de MetadataLoader/event delivery y, separadamente, si alguna semántica de `Authorizer`/request processing convierte la obligación thread-safe en una barrera efectiva por mutación.


## CHECKPOINT — Harness semántica revisada línea por línea
Fecha: 2026-10-02

Se recuperó el blob exacto del harness en commit `7f6586c00602baf92aee58ed214b823a6f34d8d1` (blob `410b1e401cf999b064c19283074b19ad6042b32f`).

Hallazgos:
- 🟢 `writerObservation.enter/exit` son campos plain, pero se leen después de `writer.join()`: esa lectura post-join tiene la garantía de publicación propia de `Thread.join()`, y no participa en la carrera medida.
- 🟢 Las observaciones de cada reader son estructuras locales; no existe contador compartido durante la carrera.
- 🟢 La clasificación `POST_RETURN` se hace después de que todos los threads terminan.
- 🔵 El criterio realmente implementado es `observation.enter > writerObservation.exit`; por tanto mide orden temporal observado de invocaciones, no qué versión de `AclCache` leyó `authorize()`.
- 🔴 El harness NO registra identidad/version del `AclCache` usado por cada autorización. Por ello `POST_RETURN_ALLOWED=0` no permite distinguir entre 'post-return + nuevo cache', 'post-return + cache viejo', o simplemente ausencia de ALLOWED post-return.
- 🔴 Tampoco existe un witness que enlace el resultado `ALLOWED` con la referencia concreta de `aclCache`.
- 🟢 El uso de `join()` está fuera de la ventana de carrera y no introduce un HB artificial entre `removeAcl()` y `authorize()` durante la medición.

Conclusión: el harness actual es un buen discriminador de ventana temporal, pero NO es todavía un witness de stale-cache/version visibility. No debe modificarse AB105.116R ni declararse seguridad/vulnerabilidad a partir de `POST_RETURN_ALLOWED=0`.

`TEMPORAL_DISCRIMINATOR = VALID`
`CACHE_VERSION_WITNESS = ABSENT`
`POST_RETURN_STALE_VISIBILITY = UNKNOWN`
`HB W1→R1 = NOT_IDENTIFIED`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`


## CORRECCIÓN — semántica del witness POST_RETURN_ALLOWED
Fecha: 2026-10-02

La revisión del harness permite precisar una sobreafirmación del checkpoint anterior.

🟢 Aunque el harness no registra la identidad de la referencia `AclCache`, el escenario está construido con una única ACL `WRITE/ALLOW` para `USER` y después ejecuta `removeAcl(id)`. El baseline exige `ALLOWED`. Tras una eliminación efectiva, el resultado esperado para ese mismo principal/recurso es `DENIED`.

Por tanto, si una observación satisficiera simultáneamente:
`observation.enter > writerObservation.exit` + `result == ALLOWED`,
ese evento sería un **witness conductual de ALLOWED post-return**, y sería evidencia directa de que la autorización no reflejó la revocación a tiempo en esa ejecución. No necesita conocer físicamente la identidad del `AclCache` para ser relevante.

🔵 Lo que el witness NO demostraría por sí solo es el mecanismo causal exacto: no permitiría distinguir JMM stale-read de otra explicación de implementación si existiera otra ruta legítima hacia `ALLOWED`.

🔴 En las ejecuciones existentes `POST_RETURN_ALLOWED=0`; por tanto no tenemos actualmente ese witness conductual.

Corrección epistemológica:
`POST_RETURN_ALLOWED > 0` → evidencia conductual de autorización ALLOWED después del retorno medido de la revocación; mecanismo JMM = UNKNOWN.
`POST_RETURN_ALLOWED = 0` → ausencia de ese witness en las ejecuciones realizadas; NO prueba imposibilidad.
`CACHE_VERSION_WITNESS` → útil para atribución causal, pero NO requisito lógico para detectar el evento conductual que el harness ya define.

`POST_RETURN_ALLOWED_WITNESS = VALID_BEHAVIORAL_DISCRIMINATOR`
`MECHANISM_ATTRIBUTION = UNKNOWN`
`JMM_HB = NOT_IDENTIFIED`
`STALE_ALLOWED_OBSERVED = NOT_OBSERVED_IN_CURRENT_RUNS`
`EXPLOITABILITY = UNKNOWN`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`

No se modifica AB105.116R, no se crea AB105.117R y no se repite TLC.


## CHECKPOINT — witness raw verificado directamente en Actions
Fecha: 2026-10-02

Se volvió a comprobar el run `36965213770` desde GitHub Actions, no sólo desde el resumen previo.

🟢 Job `110707365331`: `jmm-causal-window`.
🟢 Steps `Compile`, `Execute` y `Emit evidence`: SUCCESS.
🟢 El log raw contiene literalmente:
`CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=2531489 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=2466195 OVERLAP_ALLOWED=18300 OVERLAP_DENIED=62 UNEXPECTED=0`
🟢 El mismo log confirma `BUILD SUCCESSFUL`, `CAUSAL_WINDOW=EXECUTED`, `TIMING_ONLY_DIAGNOSTIC=TRUE`, Kafka rev `99b940733a9f6bc409457dba7108f08421d81e42`, `AB105_116R=UNCHANGED` y `AB105_117R=NOT_CREATED`.

Esto eleva el estado de ese witness de 'resumen recuperado' a **raw-log verified**. No cambia la interpretación: `POST_RETURN_ALLOWED=0` es ausencia del evento conductual buscado en esa ejecución; `OVERLAP_ALLOWED=18300` demuestra concurrencia temporal observada; JMM HB y mecanismo de visibilidad siguen UNKNOWN.

No se repite el run ni TLC. El segundo run exitoso `36965213781` queda pendiente sólo de la misma verificación raw si fuese necesaria para una nueva afirmación; su witness ya está registrado en continuidad.

`RAW_LOG_WITNESS_RUN_36965213770 = VERIFIED`
`POST_RETURN_ALLOWED = 0`
`OVERLAP_ALLOWED = 18300`
`JMM_HB = NOT_IDENTIFIED`
`STALE_ALLOWED_OBSERVED = NOT_OBSERVED`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`


## CHECKPOINT — segundo witness raw verificado
Fecha: 2026-10-02

Run `36965213781`, job `110707365140`, fue revisado directamente desde su log raw.

🟢 Job completo SUCCESS; pasos de compilación, ejecución, emisión y upload de evidencia SUCCESS.
🟢 Witness exacto:
`CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=5556071 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=5457434 OVERLAP_ALLOWED=29225 OVERLAP_DENIED=68 UNEXPECTED=0`

Resultado conjunto de los dos runs:
- Run `36965213770`: `POST_RETURN_ALLOWED=0`, `OVERLAP_ALLOWED=18300`.
- Run `36965213781`: `POST_RETURN_ALLOWED=0`, `OVERLAP_ALLOWED=29225`.
- Ambos: `UNEXPECTED=0`.

🟢 La ausencia del witness `POST_RETURN_ALLOWED` queda ahora **raw-log verified en ambas ejecuciones**.
🔵 Ambos experimentos observaron autorizaciones ALLOWED durante overlap temporal.
🔴 Ninguno observó ALLOWED con `enter > removeAcl-return`.
🔴 Esto no demuestra que tal evento sea imposible bajo otras ejecuciones ni demuestra HB/JMM.
🔴 Mecanismo de visibilidad, stale-read, exploitability, generalización e impacto de producción siguen UNKNOWN; conclusión de seguridad NOT_ESTABLISHED.

`TWO_RUNS_RAW_VERIFIED = TRUE`
`POST_RETURN_ALLOWED_BOTH_RUNS = 0`
`OVERLAP_ALLOWED_BOTH_RUNS = OBSERVED`
`JMM_HB = NOT_IDENTIFIED`
`STALE_ALLOWED = NOT_OBSERVED`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`

No se repiten los experimentos ni TLC y no se crea AB105.117R.


## CHECKPOINT — mecanismo concreto de cache confirmado en Kafka pin
Fecha: 2026-10-02

Se inspeccionaron directamente en el commit Kafka `99b940733a9f6bc409457dba7108f08421d81e42` `StandardAuthorizer`, `StandardAuthorizerData` y `AclCache`.

🟢 `StandardAuthorizer.authorize()` toma una referencia local `curData = data` una sola vez por llamada y luego delega en `curData.authorize(...)`.
🟢 `StandardAuthorizer.removeAcl()` delega directamente a `data.removeAcl(id)`.
🟢 `StandardAuthorizerData` declara explícitamente `The class is not thread-safe`.
🟢 `StandardAuthorizerData.aclCache` es un campo `private` plain; `removeAcl()` calcula un nuevo `AclCache` y después hace `aclCache = aclCacheSnapshot`.
🟢 `AclCache` está documentada e implementada como **immutable**; `removeAcl()` retorna una instancia nueva y no muta la instancia anterior.
🔴 Por tanto, la unidad de visibilidad relevante queda bien delimitada: una autorización puede operar sobre una referencia `StandardAuthorizerData` ya publicada y leer su `aclCache` plain; la revocación steady-state reemplaza ese campo por otra instancia sin una publicación volatile de `data` en ese mismo camino.
🔵 Esto fortalece la hipótesis/mecanismo a investigar, pero no convierte la hipótesis en evidencia de stale-read: la ejecución debe mostrar el resultado conductual o una instrumentación causal válida.

Importante: el comentario de `StandardAuthorizer.data` afirma que hay un read-write lock, pero el código pin no contiene tal lock. Esto ya estaba registrado y queda corroborado por la lectura directa del código.

`CACHE_STRUCTURE = IMMUTABLE_SNAPSHOT`
`STEADY_STATE_ACLCACHE_WRITE = PLAIN_REFERENCE_REPLACEMENT`
`AUTHORIZATION_DATA_SNAPSHOT = LOCAL_REFERENCE`
`STALE_READ = UNKNOWN`
`HB W1→R1 = NOT_IDENTIFIED`
`SECURITY_CONCLUSION = NOT_ESTABLISHED`

No se modifica AB105.116R, no se crea AB105.117R y no se repite TLC.
