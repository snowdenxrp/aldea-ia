# NCS M0 — propuesta de contrato de presupuesto de recursos
Fecha: 2026-10-22
Estado: **PROPUESTA TÉCNICA / NO ACEPTADA POR EL PROPIETARIO / NO IMPLEMENTADA**

## Propósito

Convertir la brecha de capacidad de Chronicle, Continuity y la entrada `--content-stdin` en un contrato verificable de M0, sin inventar cifras ni cambiar runtime antes de resolver las decisiones de capacidad.

Esta propuesta es un subcriterio operativo de Opción A. Resolverla no demuestra raíz legítima, no aprueba la Constitución y no cierra M0-E.

## Decisiones de contrato que faltan

Los máximos numéricos se mantienen como **PENDIENTES de decisión**. No se deben tratar como ilimitados ni rellenar por conveniencia del implementador.

1. **Contenido de entrada:** máximo de bytes crudos leídos desde stdin, comprobado antes de acumular el contenido completo.
2. **Entrada de Chronicle:** máximo de bytes por entrada y máximo de entradas admitidas.
3. **Documento Chronicle:** máximo de bytes serializados del documento completo después de un append.
4. **Continuity:** máximos de cardinalidad para cada colección persistida y máximo de bytes serializados del snapshot completo.
5. **Presupuesto combinado:** confirmar si Chronicle y Continuity tienen presupuestos independientes o un límite agregado para el proceso/dispositivo inicial.
6. **Capacidad y recuperación:** definir si el sistema rechaza nuevas escrituras al alcanzar el límite, permite compactación/rotación bajo un contrato separado o requiere intervención del propietario. No asumir borrado, truncamiento ni rotación automática.

## Semántica de exceso propuesta

- Un contenido que exceda el límite de stdin debe rechazarse mientras se lee, sin seguir acumulando bytes sin límite.
- Una entrada que haría exceder el presupuesto de Chronicle o Continuity debe rechazarse antes de mutar el estado persistido.
- El estado previo debe permanecer íntegro; nunca truncar silenciosamente ni reportar éxito si la escritura se rechazó o su resultado es incierto.
- El exceso debe producir un resultado terminal explícito, distinguible de éxito y de UNKNOWN. Antes de añadir un nuevo identificador de outcome, inspeccionar y reutilizar el contrato existente si ya expresa exactamente este caso; no inventar IDs paralelos.
- Ante capacidad agotada, la política conservadora inicial es **rechazar la nueva admisión/escritura y conservar los datos existentes**. Cualquier rotación, eliminación o compactación requiere una decisión de contrato independiente.
- Los límites deben aplicarse de forma coherente en CLI, caso de uso y store. Un límite únicamente en el caller no es suficiente.

## Pruebas mínimas de aceptación

1. stdin justo por debajo del máximo: se procesa normalmente.
2. stdin exactamente en el máximo: comportamiento documentado y determinista.
3. stdin por encima del máximo: lectura detenida/rechazada antes de acumular el flujo completo; cero admisión de misión y cero escrituras Chronicle/Continuity.
4. Entrada individual por encima del máximo: rechazo sin cambio de archivos ni revisión.
5. Append que supera el máximo de entradas o tamaño total del documento: rechazo sin pérdida de entradas previas.
6. Snapshot Continuity que excede cardinalidad o bytes: rechazo sin persistencia parcial ni reconstrucción falsa de éxito.
7. Estado ya en capacidad máxima: nuevo append rechazado de forma determinista; los datos existentes siguen siendo legibles.
8. Fallo/resultado ambiguo durante persistencia: no reportar éxito inferido; conservar las reglas existentes de conflicto/UNKNOWN y reconciliación.
9. Pruebas de frontera exacta en bytes, usando bytes UTF-8 reales y no solo longitud de caracteres.
10. Assertions explícitas de no escritura/admisión en todos los casos negativos.

## Evidencia exigida

Para cerrar este subcriterio: contrato aceptado, implementación coherente con el contrato, tests de límites positivos/negativos, y CI exitoso atribuible al SHA exacto que contenga código y pruebas. Registrar run/job/SHA; no extrapolar un run anterior.

## No objetivos

- No elegir cifras numéricas en esta propuesta.
- No introducir rotación, borrado, colas, reintentos, tombstones ni nuevos wrappers transaccionales.
- No cambiar runtime ni declarar una vulnerabilidad explotable sin evidencia.
- No confundir presupuesto local de recursos con autorización constitucional.

## Estado conservador

Subcriterio de presupuesto: **PENDING**.
M0: **INCOMPLETO**.
`authorization: NOT_EVALUATED`.
Raíz legítima: `PENDING/UNKNOWN`.
Efectos protegidos: `STOP`.


## Investigación previa reutilizada (sin reabrirla)

La regla semántica general ya está establecida en la investigación histórica AB104.397 y AB104.398: imponer límites explícitos de recursos, distinguir límite alcanzado de completitud y no convertir truncamiento en resultado completo. Véanse:
- `docs/nexo/AB104.397_SEMANTIC_REQUIRED_SET_AUTHORITY_TCB_BOUNDARY_2026-09-26.md`
- `docs/nexo/AB104.398_ADVERSARIAL_SEMANTIC_DERIVATION_2026-09-26.md`

Esos documentos fundamentan el principio, pero no fijan por sí solos los máximos operativos de Chronicle/Continuity ni prueban que exista un outcome runtime integrado para este caso. Por tanto, no se repite esa investigación ni se afirma que `RESOURCE_LIMIT_REACHED` sea ya un contrato ejecutable de M0. La tarea actual es aterrizar el principio en los stores concretos, con límites aprobados y pruebas de no mutación.


## Mapa concreto de implementación y pruebas (inspección del HEAD 2026-10-22)

La ruta existente ya permite ubicar el enforcement futuro sin volver a investigar el hallazgo:

| Dimensión | Punto de entrada / enforcement | Prueba existente que debe ampliarse |
|---|---|---|
| stdin en bytes crudos | `scripts/nexo-chronicle-session.mjs`, lectura `process.stdin` (actualmente acumula chunks y concatena) | `tests/nexo/chronicle-runtime.test.mjs` ya usa `spawnSync` y cubre stdin válido; añadir casos de frontera/exceso y verificar no admisión/no escritura |
| admisión de misión y contenido | `src/nexo/application/chronicle-append.mjs`, `runNexoChronicleAppend` y `recordNexoMissionSafely` | `tests/nexo/chronicle-runtime.test.mjs` |
| bytes por entrada, número de entradas y bytes serializados de Chronicle | `src/nexo/core/chronicle-store.mjs`, `validateDocument`, `writeDocument` y `append` | suite Chronicle existente; comprobar rechazo antes de `writeDocument` y preservar el documento previo |
| cardinalidad/tamaño del snapshot Continuity | `src/nexo/core/continuity-snapshot.mjs`, `assertNexoContinuitySnapshot`/`projectNexoContinuitySnapshot`; store en `src/nexo/core/continuity-store.mjs`, `commitIfCurrent`/`writeEnvelope` | `tests/nexo/continuity-contract.test.mjs` y tests del store |
| resultado y recuperación | contratos públicos de Chronicle/Continuity existentes; no crear outcome nuevo antes de comprobar si alguno expresa exactamente el límite | afirmar resultado no exitoso, ausencia de mutación y preservación de conflicto/UNKNOWN ya definidos |

Precisión: los tests CLI existentes verifican argumentos y un caso válido de contenido por stdin; eso no es evidencia de límite máximo ni de rechazo temprano. Los stores ya serializan el documento/snapshot en los puntos indicados, por lo que el presupuesto de bytes debe calcularse de forma determinista antes de iniciar la escritura. No se modifica código hasta que se decidan los máximos y el contrato de exceso.


## Compatibilidad con los contratos de resultado actuales (inspección del código)

La inspección del HEAD actual aclara cómo expresar el rechazo sin añadir un estado global nuevo:

- `publicChronicleResult` ya permite los estados públicos `blocked`, `invalid`, `conflict`, `unknown`, `observed` y `completed`, y conserva el campo `code`.
- `runNexoChronicleAppend` ya devuelve `blocked` para entradas inválidas antes de abrir/mutar los stores.
- Chronicle ya tiene resultados `blocked` con códigos específicos y `committed` / `unknown` para append; Continuity usa `failed` / `conflict` / `unknown` / `committed`.

**Conclusión acotada:** no se justifica introducir un nuevo estado público general para límite de recursos. La implementación debería reutilizar el estado no exitoso que corresponda a cada capa y añadir un código específico solo si el inventario de códigos existente confirma que no hay uno semánticamente equivalente. No se eligió ni añadió ningún código en esta propuesta.

El rechazo debe ocurrir antes de `recordNexoMissionSafely` cuando el contenido de stdin o el presupuesto de la operación ya sea inválido; para los límites de store, debe ocurrir antes de `writeDocument`/`writeEnvelope`. Los errores de escritura posteriores conservan la semántica existente de `UNKNOWN` y reconciliación; nunca deben reinterpretarse como límite conocido ni como éxito.


## Orden de enforcement recomendado (preparación para implementación)

Esta secuencia evita que un límite de una capa se use como sustituto de los límites de las otras capas:

1. **CLI/stdin — antes de formar el string completo.** Contar bytes del flujo UTF-8 crudo mientras llegan los chunks. Al observar el primer byte que excede el máximo, detener la admisión y devolver el resultado terminal de entrada demasiado grande; no ejecutar `Buffer.concat` sobre el flujo completo ni invocar el caso de uso. La implementación debe evitar carreras de callbacks y cerrar/consumir el flujo de forma determinista para que no quede una lectura colgada.
2. **Caso de uso — antes de admitir misión.** Validar tamaño de contenido en bytes UTF-8 una vez más, porque el caso de uso puede ser invocado sin CLI. Si excede el máximo, no llamar a `recordNexoMissionSafely` ni inicializar Chronicle/Continuity.
3. **Chronicle — dentro de la sección protegida por lock.** Cargar/validar el documento actual; comprobar bytes de contenido, cardinalidad resultante y tamaño serializado exacto del documento candidato antes de llamar a `writeDocument`. La decisión debe usar el mismo contenido serializado que finalmente se escribe, incluida la política de formato/newline, para evitar que medir una representación y escribir otra.
4. **Continuity — antes de writeEnvelope.** Validar cardinalidad por colección y tamaño serializado del envelope/snapshot candidato en la misma sección que comprueba la revisión actual. No escribir un envelope parcialmente validado.
5. **Resultado público.** Traducir el exceso a un estado no exitoso existente y un código específico solo si el inventario confirma que hace falta. No exponer el payload ni detalles internos. No transformar un error de escritura o resultado ambiguo en un exceso de límite conocido.
6. **Reconciliación.** Si el exceso se detecta antes de cualquier escritura, el resultado debe declarar cero mutación. Si la escritura ya comenzó y el resultado es incierto, se conserva el protocolo actual de conflicto/UNKNOWN y reconciliación; no se puede etiquetar retrospectivamente como rechazo limpio.

## Pruebas de contrato que previenen falsos positivos

- **UTF-8:** usar contenido ASCII y multibyte; verificar límites por bytes, no por `string.length`.
- **Límite exacto:** definir expresamente si el máximo es inclusivo; la propuesta recomienda aceptar `bytes <= max` y rechazar `bytes > max`.
- **Sin admisión:** espiar o inyectar el puerto de admisión y verificar cero llamadas en stdin sobredimensionado.
- **Sin inicialización:** verificar que una entrada sobredimensionada no crea store, lock, directorio ni misión.
- **Sin escritura:** inyectar/contar llamadas a `writeDocument` y `writeEnvelope`; el exceso previo a la escritura debe producir cero llamadas.
- **Preservación:** comparar bytes/revisión del archivo previo antes y después del rechazo.
- **Concurrencia:** ejecutar dos appends cerca del límite y verificar que la comprobación del tamaño total se hace bajo el mismo lock/revisión que decide la escritura; ambos no pueden aprobar contra una misma versión obsoleta.
- **Reapertura:** reabrir stores después del rechazo y demostrar que el estado sigue válido y legible.
- **UNKNOWN separado:** mantener pruebas de escritura ambigua existentes; un límite detectado antes de escribir no debe confundirse con UNKNOWN y un UNKNOWN no debe disfrazarse de límite.
- **No duplicar contratos:** extender las suites existentes; no crear un nuevo framework de pruebas o un conjunto paralelo de outcomes.

## Secuencia de cambios cuando se acepte el contrato

1. Implementar primero el lector acotado de stdin y sus tests CLI.
2. Añadir validación de bytes en el caso de uso para callers no CLI.
3. Añadir enforcement de entry count/content/document bytes en Chronicle.
4. Añadir enforcement de cardinalidad y bytes serializados en Continuity.
5. Ejecutar tests focalizados y luego el workflow completo; registrar cada SHA/run y verificar el HEAD final.
6. Si un test revela incompatibilidad con datos existentes, detenerse y reportar el caso; no truncar ni migrar silenciosamente datos existentes.

No se modifica runtime hasta que los máximos y la política de agotamiento sean decisiones contractuales explícitas.


## Perfil numérico candidato separado (2026-10-22)

Se añadió [NCS_M0_RESOURCE_BUDGET_NUMERIC_CANDIDATE_2026-10-22.md](NCS_M0_RESOURCE_BUDGET_NUMERIC_CANDIDATE_2026-10-22.md). Propone topes iniciales explícitos para stdin, contenido individual, Chronicle y Continuity. El perfil está **NO ACEPTADO / NO IMPLEMENTADO** y no representa una capacidad medida. Requiere fixtures de frontera, preservación del estado previo, concurrencia y CI en el SHA de implementación. El perfil inicial rechaza nuevas escrituras al alcanzar capacidad y no incluye rotación, borrado o compactación.
