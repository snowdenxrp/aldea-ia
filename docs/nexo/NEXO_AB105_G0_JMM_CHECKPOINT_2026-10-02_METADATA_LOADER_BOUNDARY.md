# NEXO AB105 G0 — JMM CHECKPOINT
Fecha: 2026-10-02

## Ancla
AB105.116R intacto.
AB105.117R NOT_CREATED.
TLC NO RERUN.

## Scope
Revisión de la frontera MetadataLoader/EventQueue → AclPublisher → StandardAuthorizerData, buscando una sincronización externa que cierre W1(removeAcl/aclCache write) → R1(authorize/aclCache read).

## Evidencia fuente
Kafka rev fijada: 99b940733a9f6bc409457dba7108f08421d81e42.

1. MetadataLoader mantiene su propio hilo y documenta que todos los callbacks a publishers se ejecutan desde ese execution domain. `maybePublishMetadata()` invoca `publisher.onMetadataUpdate(...)` desde el event-queue thread. `handleCommit()` y `handleLoadSnapshot()` colocan el trabajo mediante `eventQueue.append(...)`.
2. KafkaEventQueue protege su cola con `ReentrantLock`. El handler retira el evento bajo el lock y luego ejecuta `event.run()` fuera del lock. Esto establece orden/sincronización para la transferencia productor→event-handler, pero el request thread no adquiere ese lock durante `authorize()`.
3. AclPublisher llama directamente a `ClusterMetadataAuthorizer.addAcl/removeAcl/loadSnapshot`. Su propio comentario declara que el Authorizer continúa devolviendo resultados en otros threads mientras se aplican cambios ACL.
4. Plugin.get() sólo devuelve la instancia envuelta; no introduce proxy, lock ni await.
5. ClusterMetadataAuthorizer exige que sus métodos sean thread-safe, pero esta obligación de interfaz no identifica por sí misma un mecanismo JMM.
6. StandardAuthorizer.addAcl/removeAcl delegan directamente a `data.addAcl/removeAcl`. No hay `synchronized` ni `ReentrantReadWriteLock` en la implementación fijada.
7. `StandardAuthorizer.data` es volatile y `authorize()` hace una lectura volatile de la referencia. Sin embargo, steady-state add/remove NO reasigna `data`: mutan el mismo `StandardAuthorizerData` y hacen una escritura plain de `aclCache`.
8. StandardAuthorizerData se declara explícitamente `not thread-safe`. `aclCache` es plain/nonvolatile. add/remove reemplazan la referencia por un nuevo `AclCache` inmutable; authorize/findAclRule toma una referencia local plain.
9. AclCache es inmutable mediante estructuras finales; esto evita corrupción de una instancia ya observada, pero no crea publicación JMM de la nueva referencia `aclCache`.
10. La sincronización de startup (`initialLoadFuture`/first publish before request processing) es real pero sólo cubre inicialización; no se repite por cada mutación ACL posterior.

## Resultado formal de esta capa
HB(metadata producer → event.run): IDENTIFIED.
HB(event.run/W1 → unrelated RPC R1): NOT_IDENTIFIED.
COMMON_SYNC_TO_R1: NOT_IDENTIFIED.
STEADY_STATE_VOLATILE_REPUBLICATION: NOT_PRESENT.
INNER_ACLCACHE_LOCK: NOT_IDENTIFIED.
PER_MUTATION_VISIBILITY_ACK: NOT_IDENTIFIED.

## Epistemic status
STALE_READ: UNKNOWN.
POST_RETURN_STALE_ALLOWED: UNKNOWN.
EXPLOITABILITY: UNKNOWN.
GENERALIZATION: UNKNOWN.
PRODUCTION_IMPACT: UNKNOWN.
SECURITY_CONCLUSION: NOT_ESTABLISHED.

## Critical correction
No afirmar que la ausencia de HB demuestra stale visibility. Lo demostrado es más estrecho: las capas inspeccionadas no proporcionan una relación `synchronizes-with` identificable desde la escritura incremental de `aclCache` hasta una autorización RPC concurrente.

Tampoco tratar el comentario de StandardAuthorizer que menciona un read-write lock como evidencia de implementación: el código fijado no contiene dicho lock.

## Related causal runs
Runs 36965213770 y 36965213781 ejecutaron el discriminador causal con `POST_RETURN_ALLOWED=0`, pero esos resultados son diagnósticos temporales y no prueban un teorema JMM.
Run 36960926363 tuvo ALLOWED dentro de una ventana temporal concurrente, pero `COMPLETED_REMOVE_THEN_ALLOWED` no quedó establecido.

## Next exact action
Cerrar la investigación de cualquier mecanismo adicional de request/lifecycle que pueda republicar o serializar ACL state durante steady-state. Si no aparece, formalizar el resultado como límite arquitectónico de visibilidad JMM y mantener UNKNOWN para stale read/exploitability. No crear AB105.117R y no rerun TLC.
