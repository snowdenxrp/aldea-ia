# NEXO — MAIN DETERMINISTIC PERSISTENCE FAILURE AUDIT
Fecha: 2026-10-02
Repo canónico: snowdenxrp/aldea-ia
Estado: RESUELTO / RUNTIME VERIFIED

## Alcance
Se retomó la revisión de los últimos tests ejecutados en `main`, después de detectar fallos repetidos en `Nexo — deterministic persistence tests`.
La investigación se mantuvo separada de la cadena Kafka/JMM AB105.116R.

## Evidencia primaria de los fallos

### Fallo 1 — expectativa obsoleta sobre excepción ambigua
Run 37028335074, job 110908558335, head 5eb81261dcf577b436e9f59241840f2bef782bbe.
El test falló en tests/nexo/effect-adapter.test.mjs:76:
actual = prepared
expected = blocked.

La causa no era infraestructura. El código de main en ese SHA ya retenía el journal en `prepared` tras un resultado UNKNOWN de un handler.

### Causa exacta
Commit 64237bf5f9d87dac650d9ae428e645ae082f2412 cambió una excepción del handler a:
status=blocked, code=EFFECT_OUTCOME_UNKNOWN, uncertainty=effect_may_or_may_not_have_occurred,
y originalmente persistía el resultado.

Commit cbd79f998039874b0e3eb55e8a6fb583bdf0b866 cambió deliberadamente esa última parte:
la excepción ambigua dejó de persistirse como resultado terminal y el journal permanece `prepared`.
Esto permite una reconciliación posterior y evita convertir UNKNOWN en un hecho terminal.

Por tanto, el test que esperaba `blocked` en el journal estaba desalineado con la semántica vigente.

## Corrección 1
Commit c72f4bffcf5b281d8414c22c7a8d2814650e0742:
`tests(nexo): preserve prepared journal after ambiguous effect exception`
La aserción del journal pasó a esperar `prepared`.

Run 37029293163 / job 110911769836 entonces avanzó y reveló el siguiente defecto real.

## Fallo 2 — bug real en prepared-intent hook
Run 37029293163, head c72f4bffcf5b281d8414c22c7a8d2814650e0742.
El test `tests/nexo/effect-intent-persistence.test.mjs` falló en línea 29:
actual = blocked
expected = completed.

La causa exacta fue una copia profunda inválida:
`persistPreparedIntent(... request: structuredClone(request))`
El request contiene callbacks ejecutables como `postcondition`/precondition/reconcile, que no son clonables mediante structuredClone.
La excepción de clonación era capturada por el propio adapter como `EFFECT_INTENT_PERSISTENCE_FAILED`, por lo que el efecto nunca llegaba al handler.

Esto sí era un defecto de implementación.

## Corrección 2
Commit 7541d32134a35d60aae7a4f6426f1540d96eddd3:
`fix(nexo): persist serializable effect intent metadata`

El hook recibe ahora únicamente metadata persistible:
missionId, stepId, action, target, idempotencyKey y context clonado.
No se serializan callbacks ejecutables.

## Verificación runtime
Run 37029467724 = SUCCESS.
Run 37029467755 = SUCCESS.
Ambos sobre head 7541d32134a35d60aae7a4f6426f1540d96eddd3.
El workflow determinista completó exitosamente después de la corrección.

## Semántica preservada
- UNKNOWN externo sigue siendo UNKNOWN.
- Excepción del handler no implica que el efecto no haya ocurrido.
- El journal `prepared` no se convierte en `completed` ni en un bloqueo terminal sin reconciliación.
- Una reconciliación verificada puede cerrar el estado.
- La persistencia del intent ocurre antes de ejecutar el efecto.
- Los callbacks de decisión/validación no forman parte de la representación persistible.

## Cadena de resolución
FAIL-1: 37028335074
→ diagnóstico: expectativa de test obsoleta.

FIX-1: c72f4bffcf5b281d8414c22c7a8d2814650e0742

FAIL-2: 37029293163
→ diagnóstico: structuredClone(request) intentaba clonar callbacks.

FIX-2: 7541d32134a35d60aae7a4f6426f1540d96eddd3

PASS: 37029467724 / 37029467755

## Estado epistemológico
🟢 MAIN_DETERMINISTIC_PERSISTENCE = RUNTIME_VERIFIED_PASS
🟢 ROOT_CAUSE_FAIL_1 = VERIFIED
🟢 ROOT_CAUSE_FAIL_2 = VERIFIED
🟢 FIXES = EXECUTED_AND_VERIFIED
🔵 No se modifica la cadena histórica Kafka/JMM.
🔵 La corrección de test distingue explícitamente UNKNOWN/persisted-prepared de resultado terminal.
🔴 No se infiere ninguna conclusión adicional sobre Kafka/JMM, seguridad de producción o comportamiento externo a partir de estos tests.

## DO-NOT-REPEAT
- No repetir el fallo original esperando que `prepared` sea `blocked`.
- No volver a clonar el request completo del adapter para persistencia: contiene callbacks.
- No convertir un resultado UNKNOWN en terminal solo para satisfacer una aserción.
- No mezclar esta cadena con la evidencia causal Kafka/JMM de AB105.116R.

## Continuidad
AB105.116R = INTACT / NO MODIFICAR
AB105.117R = NOT_CREATED
TLC = NO_RERUN
PR #89 = OPEN / NOT MERGED
Kafka pinned = 99b940733a9f6bc409457dba7108f08421d81e42

Siguiente acción: continuar la auditoría de los workflows recientes de main y de la frontera de atribución causal, sin repetir pruebas ya resueltas y guardando cada nuevo resultado.
