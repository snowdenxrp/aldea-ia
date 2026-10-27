# NCS M0 — reconciliación documental del modelo de exclusión/bootstrap de Continuity

**Fecha:** 2026-10-27  
**Rama objetivo:** `ncs-clean-architecture`  
**Estado:** DOCUMENTAL — NO RATIFICA CONTRATO — NO IMPLEMENTADO — NO EJECUTADO

## 1. Propósito y alcance

Cerrar una unidad documental del handoff vigente: precisar qué puede y qué no puede concluirse sobre la exclusión necesaria para la primera publicación del archivo Continuity. Reutiliza la propuesta de bootstrap explícito, la matriz P01-A…P01-H, el mapa de objeto/campos/consumidores, el delta de inventario y el cruce con la línea de meta. No repite el censo general ni la revisión de Chronicle/PB-08.

Este documento no elige una primitiva de filesystem, no aprueba la primera creación, no crea una autoridad nueva y no autoriza cambios ejecutables ni pruebas.

## 2. Evidencia de entrada

- `NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md`: la operación normal no debe auto-inicializar; bootstrap debe ser explícito y separado. La propuesta exige no sobrescribir destinos existentes, distinguir ausencia de errores, crear exclusivamente o mediante equivalente y mantener UNKNOWN sin reintento automático. Sigue siendo propuesta, no contrato final.
- `NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md`: P01-C (procedimiento/quiescencia), P01-D (exclusión/concurrencia), P01-E (clasificación del estado) y P01-F (UNKNOWN/reconciliación) permanecen pendientes o no verificados.
- `NCS_M0_P01_EXACT_CANDIDATE_OBJECT_AND_FIELD_CONSUMER_MAP_2026-10-27.md`: el objeto primario es el archivo Continuity ausente determinado por el `filePath` efectivo de una invocación; no existe una ruta universal demostrada. Su snapshot puede influir en planificación, admisión y recuperación, por lo que no debe asumirse inocuo solo por llamarse memoria.
- `NCS_M0_PERPLEXITY_DELTA_REVIEW_2026-10-27.md`: `continuity-store.initialize` usa lock cooperativo, comprobación de ausencia mediante `access(filePath)`, escritura temporal y `rename(tempPath, filePath)`. El contrato inspeccionado limita la coordinación a escritores cooperativos y rutas de confianza.
- `NCS_M0_FINISH_LINE_P01_DEPENDENCY_CROSSWALK_2026-10-27.md`: el protocolo aprobado de primera creación forma parte de la línea de meta M0; el gate de efectos protegidos permanece independiente.

Estas son referencias documentales y hechos estáticos ya registrados. No se ejecutó el código en esta revisión.

## 3. Modelo de actores: lo que sí se distingue

| Clase | Qué se conoce | Qué no queda demostrado |
|---|---|---|
| Inicializadores/escritores cooperativos que usan el mismo lock contractual | El lock está diseñado para coordinar a participantes que lo respetan; el test de Chronicle ya documentado cubre dos invocaciones cooperantes en un caso sintético. | No demuestra exclusión de otros procesos, cobertura de todos los entrypoints, ni garantías de entorno/producción. El test no se ejecutó en esta sesión. |
| Escritor no cooperativo que no adquiere ese lock | No participa en la exclusión cooperativa descrita por el store. | No está demostrada la exclusión frente a él. La posible carrera entre comprobar ausencia y publicar el destino es un riesgo inferido; no se reprodujo y no se afirma exploit. |
| Proceso/launcher anterior que puede continuar o reanudarse | El handoff exige considerar quiescencia y escritores legacy. | No existe evidencia de una barrera de entorno que impida a todo escritor previo reanudarse durante bootstrap. Excluir una ruta del alcance M0 no prueba que el proceso esté detenido. |
| Estado previo ausente, válido, corrupto o inaccesible | El contrato propuesto exige resultados distintos y preservar cualquier destino existente. El loader estricto disponible es evidencia de una capacidad de código, no de que toda ruta real lo use. | La clasificación end-to-end y la preservación de bytes no están verificadas mediante una ejecución autorizada. Un error de lectura no puede reinterpretarse como ausencia. |

## 4. Consecuencias para el contrato

1. **Separación de operación ya aceptada:** el commit normal no debe inicializar silenciosamente un destino ausente; el bootstrap se concibe como operación explícita separada. Esto no selecciona API, mecanismo ni procedimiento operativo final.
2. **Lock cooperativo no equivale a exclusión universal:** solo es evidencia de coordinación entre participantes que cumplen el protocolo. No acredita escritores no cooperativos ni quiescencia del entorno.
3. **Quiescencia y creación exclusiva son propiedades diferentes:** detener o excluir procesos conocidos no demuestra que la publicación sea exclusiva; una publicación exclusiva tampoco demuestra que no existan otros escritores o launchers que puedan reanudar.
4. **No sobrescritura:** si el destino existe, está corrupto o su estado no puede establecerse, el bootstrap no debe tratarlo como ausente ni reemplazarlo. La recuperación de un destino corrupto es otra operación, con autorización propia.
5. **Resultado ambiguo:** si la operación pudo mutar el almacenamiento pero no se puede confirmar el desenlace, conservar UNKNOWN/BLOCKED; no hacer retry automático ni declarar que no hubo escritura.
6. **Autoridad separada:** ninguna garantía de lock, atomicidad local, revisión, snapshot, ausencia o solicitud del caller legitima por sí sola la primera creación. P01-A/P01-G siguen pendientes.
7. **No elegir mecanismo por inferencia:** la evidencia actual no selecciona una primitiva concreta de filesystem, un lock alternativo, una transacción, un marcador, un rollback ni una garantía de durabilidad ante pérdida de energía.

## 5. Requisito de exclusión que puede afirmarse ahora

La documentación existente exige que el protocolo futuro defina y demuestre la cobertura de **todos los escritores relevantes dentro del alcance declarado**, y que no presente coordinación cooperativa como si fuera exclusión frente a escritores que no cooperan. Sin embargo, las fuentes revisadas no fijan una decisión aceptada que delimite si el entorno M0 debe garantizar exclusión frente a todo proceso local no cooperativo o si el producto puede declarar explícitamente un entorno operativo más estrecho con precondiciones verificables.

Por ello no corresponde elegir silenciosamente una de esas políticas. La cobertura de escritores no cooperativos y la quiescencia real permanecen PENDING/UNKNOWN hasta que el contrato/decisión de alcance lo determine. Mientras tanto, la primera creación continúa STOP.

## 6. Dependencias que no se deben mezclar

- P01-A/G: objeto, propiedades no autoritativas y legitimidad de la primera creación.
- P01-B: la invocación de bootstrap termina antes de admisión, PREPARED, dispatch, reconciliación o mutaciones de dominio.
- P01-C/D: procedimiento, quiescencia, cobertura de escritores y creación exclusiva.
- P01-E/F: distinción de ausencia/error/corrupción/conflicto y resultado UNKNOWN/reconciliación.
- P01-H: pruebas y evidencia sobre el SHA exacto, solo tras contrato congelado y autorización independiente.

Resolver la exclusión no resuelve la autoridad; resolver autoridad no prueba exclusión; una prueba de dos escritores cooperativos no prueba quiescencia universal.

## 7. Punto de continuación

1. Mantener reutilizada esta clasificación al continuar el cierre documental; no repetir el inventario de las cinco colecciones, los tres callers conocidos ni la ruta Chronicle.
2. Identificar en los artefactos existentes si el alcance operativo aceptado ya determina la cobertura requerida de escritores no cooperativos. Si no lo determina, registrar esa dimensión como decisión pendiente; no escoger por descarte.
3. Solo después de cerrar normativamente alcance y procedimiento, congelar los requisitos de P01-C/D/E/F. No proponer mecanismo ejecutable mientras autoridad/objeto y modelo operacional sigan sin resolver.
4. Cualquier verificación dinámica futura requiere autorización separada y debe estar vinculada al SHA exacto.

## 8. Estado canónico

- M0: `INCOMPLETO`.
- P-01: `OPEN / UNKNOWN`.
- P01-A/P01-B/P01-C/P01-D/P01-E/P01-F/P01-G: no se cierran con este documento.
- D0/D1/D2/D3: `OPEN`; D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Autoridad raíz: `PENDING/UNKNOWN`.
- `authorization: NOT_EVALUATED`.
- Primera creación y efectos protegidos: `STOP`.
- Runtime, tests, workflows, configuración ejecutable y dispositivo: sin cambios.
- Tests/CI/Actions: no ejecutados.

Este documento registra el límite de la evidencia y la dependencia pendiente; no cambia la línea de meta M0 ni concede autorización.


## 9. Cruce con el alcance M0 aceptado y el protocolo D3 existente

Se contrastó el modelo con:
- `NCS_M0_P01_SCOPE_VS_INITIALIZATION_DECISION_RECONCILIATION_2026-10-27.md`;
- `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, §11;
- `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`, §8 y aceptación del propietario en §9;
- `NCS_M0_D3_LEGACY_WRITER_QUIESCENCE_EVIDENCE_PROTOCOL_2026-10-23.md`, como protocolo existente a reutilizar, no recrear.

### Resultado del cruce

- Está aceptado que la migración/cutover legacy queda fuera del alcance operativo inicial de M0 mientras no exista un entorno objetivo identificado y verificable. Esto excluye esa capacidad de M0 por ahora; **no demuestra que los procesos legacy estén detenidos ni que no puedan reanudar escrituras**.
- La opción A limita el alcance a almacenamiento local M0 estrictamente no autoritativo, y la opción B exige bootstrap explícito separado del commit normal. Ninguna fija por sí sola la cobertura de escritores no cooperativos que podrían acceder al mismo destino.
- La línea de meta exige un protocolo de bootstrap aprobado y evidencia de las propiedades dentro del alcance. El protocolo D3 existente es la fuente canónica para quiescencia/cutover; no debe duplicarse. Su aplicabilidad operacional queda pendiente de entorno objetivo y decisión de si el cutover forma parte de una fase posterior.
- No se localizó en estas fuentes una aceptación explícita que limite la garantía de exclusión solo a escritores cooperativos ni una garantía aceptada de exclusión frente a todo proceso local no cooperativo.

### Conclusión limitada

La decisión existente **no cierra** la pregunta sobre escritores no cooperativos. La exclusión de cutover legacy de M0 reduce el alcance funcional, pero no puede transformarse en una afirmación de quiescencia o aislamiento del archivo Continuity actual. La cobertura exigible sigue PENDING/UNKNOWN; primera creación STOP. No hace falta pedir una nueva decisión sobre el canal humano ni reabrir el inventario: la brecha concreta es el alcance de la garantía de exclusión para el destino real y sus escritores relevantes.

No se modificaron runtime, tests, workflows ni configuración; no se ejecutaron tests/CI/Actions.
