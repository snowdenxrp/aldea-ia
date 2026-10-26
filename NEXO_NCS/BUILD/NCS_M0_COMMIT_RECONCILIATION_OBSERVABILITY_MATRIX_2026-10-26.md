# NCS M0 — Matriz de reconciliación y observabilidad de commit (2026-10-26)

## Propósito

Convertir los hallazgos estáticos de persistencia en una matriz de estados, evidencia mínima y pruebas de aceptación. Documento de diseño; no implementa ni ratifica un contrato nuevo.

## Principio de decisión

El resultado de una llamada de escritura y el estado durable que queda en disco son hechos distintos. Un error observado no prueba por sí solo que no hubo escritura; la ausencia de error tampoco prueba que el snapshot sea recuperable tras reinicio. `SAFE_COMMIT` requiere una señal de commit definida por el contrato vigente; un resultado incierto no puede promoverse a éxito por inferencia.

## Matriz candidata

| Escenario | Evidencia observable mínima | Clasificación candidata | ¿Puede declararse SAFE_COMMIT? |
|---|---|---|---|
| Revisión esperada no coincide antes de escribir | Código estable `STATE_REVISION_CONFLICT`; snapshot no alterado por esta operación, comprobado en prueba | `STALE_CANDIDATE` | No |
| Validación de entrada/ruta falla antes de operaciones de archivo | Error de validación estable; prueba verifica que no se crea lock/temp ni se modifica destino | Fallo conocido previo al commit; categoría final por ratificar | No |
| Escritura temporal falla y se demuestra que destino no cambió | Error de escritura y comparación fiable del destino/revisión | Fallo conocido previo al commit, si la evidencia demuestra el invariante | No |
| Rename/reemplazo informa error y destino queda en estado no demostrado | Código de error + lectura independiente del estado/revisión; si esa lectura no es concluyente, registrar UNKNOWN | `RECONCILE_REQUIRED` | No |
| Persistencia retorna sin error y el contrato garantiza el reemplazo confirmado | Resultado del adaptador conforme al contrato y pruebas de lectura/reinicio para la misma revisión | `SAFE_COMMIT` solo si el contrato lo define así | Solo bajo contrato ratificado |
| Persistencia devuelve `COMMIT.UNKNOWN` | Estado durable no confirmado por evidencia independiente | `RECONCILE_REQUIRED` | No |
| Limpieza de temporal falla tras fallo primario | Error primario preservado + error secundario tipado/registrado; destino inspeccionado por separado | Mantener clasificación según el resultado de commit; añadir diagnóstico secundario | No cambia por la limpieza |
| Liberación de lock falla tras operación previa | Resultado de operación previa preservado; fallo de liberación registrado separadamente; política de exclusión revisada | Indeterminado hasta verificar resultado y lock | No por sí solo |
| Reconciliación no puede leer o comparar el snapshot | Fallo de lectura/verificación, sin evidencia concluyente | `RECONCILE_REQUIRED` / `UNKNOWN` según contrato ratificado | No |
| Reconciliación confirma snapshot íntegro con la revisión candidata | Lectura independiente, parseo/validación, revisión exacta y relación con la operación identificada | Estado reconciliado; transición de outcome por diseñar explícitamente | No automáticamente; falta ratificar semántica y vinculación causal |

## Requisitos de observabilidad candidatos

1. Usar códigos estables y limitados: entrada/ruta inválida, conflicto de revisión, write temporal fallido, rename fallido, cleanup fallido, lock-release fallido, lectura de reconciliación fallida y estado no concluyente.
2. Preservar el error primario. Los errores secundarios no deben reemplazarlo; deben registrarse de forma separada y segura.
3. No depender de mensajes libres del sistema operativo como API estable. Pueden quedar en logs internos acotados, sujetos a política de privacidad.
4. No exponer rutas absolutas, contenido del snapshot, claves ni datos sensibles en outcomes públicos.
5. No registrar `COMMITTED` hasta que el contrato ratificado defina qué evidencia hace que el commit sea confirmado.
6. Identificar la revisión esperada y la candidata solo cuando esos valores no revelen información sensible; evitar introducir identificadores nuevos sin necesidad demostrada.
7. La reconciliación debe leer evidencia durable independiente del resultado en memoria. Si no puede probar integridad, revisión y correspondencia con la operación, permanece indeterminada.
8. No borrar temporales por coincidencia de prefijo hasta definir ownership/lock, antigüedad y alcance de limpieza; no asumir que todo archivo coincidente es huérfano.

## Pruebas de aceptación candidatas

- Cada fallo inyectado verifica el código de diagnóstico, el estado del destino, la revisión, temporales y liberación del lock.
- Simular write fallido antes de escribir bytes; write parcial; rename fallido antes del reemplazo; reemplazo realizado pero respuesta simulada fallida; lectura posterior fallida; cleanup fallido; releaseLock fallido.
- Probar que un error secundario no sustituye al primario y que ambos quedan distinguibles.
- Probar conflictos concurrentes de revisión y demostrar que no se sobrescribe una revisión ajena.
- Probar reinicio desde snapshot confirmado, snapshot incompleto/corrupto y estado donde el commit quedó incierto.
- Verificar que ninguna combinación de excepción, código desconocido, log ausente o cleanup exitoso se interpreta por sí sola como `SAFE_COMMIT`.
- Separar tests unitarios de la máquina de estados, pruebas de adaptador con filesystem y pruebas de integración/reinicio.

## Decisiones que requieren ratificación

- Semántica contractual exacta de `COMMITTED`, `FAILED`, `UNKNOWN`, `SAFE_COMMIT` y `RECONCILE_REQUIRED`.
- Si la reconciliación se invoca automáticamente o se deja al llamador; el core actual inspeccionado no llama `reconciliation.reconcile()` en `executeProtectedTransition()`.
- Forma, contenido y audiencia del diagnóstico estructurado.
- Política de limpieza, ownership de temporales, lock-release y concurrencia.
- Contrato de rutas A/B/C, rutas relativas, symlinks y plataformas.
- Si un estado verificado después del hecho puede producir una clasificación terminal nueva y qué prueba causal se exige.

## Estado de evidencia

- La revisión del código y las pruebas existentes es estática.
- No se ejecutaron tests ni CI al preparar este documento.
- La causa exacta del run CI `40270739196` sigue `UNKNOWN`.
- Este documento no autoriza cambios de runtime, no selecciona una opción de diseño y no demuestra autoridad raíz ni efectos protegidos.
