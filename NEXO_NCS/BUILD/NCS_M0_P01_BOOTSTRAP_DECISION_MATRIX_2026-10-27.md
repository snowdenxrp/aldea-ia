# NCS M0 — matriz de decisiones pendientes de P-01 (2026-10-27)

## Propósito y límites

Separar las preguntas que todavía bloquean P-01 para que resolver una no se use como evidencia de las demás. Esta matriz reutiliza la línea de meta M0 aceptada como base, el registro D0–D3, la decisión de inicialización de estado ausente, el contrato candidato de bootstrap y el inventario de consumidores §§22–23.

Es una **matriz de preparación documental**, no una decisión nueva del propietario, contrato ratificado, diseño ejecutable ni autorización. No selecciona una implementación de filesystem, no define una nueva autoridad, no crea estados de runtime y no autoriza modificar código, tests, workflows/configuración ni ejecutar pruebas/CI.

## Estado canónico de entrada

- M0: `INCOMPLETO`.
- P-01: `OPEN / UNKNOWN`.
- D0/D1/D2/D3: `OPEN`; D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Alcance elegido: Opción A, almacenamiento local M0 estrictamente no autoritativo y acotado. La separación no está demostrada.
- Autoridad de la primera creación: `PENDING/UNKNOWN`.
- `authorization: NOT_EVALUATED`; efectos protegidos: `STOP`.
- No se crean `BootstrapAuthority`, raíz paralela, IDs, colas, retries, tombstones, fences o wrappers especulativos.

## Matriz de decisiones independientes

| ID | Pregunta que debe resolverse | Evidencia existente | Brecha concreta | Estado |
|---|---|---|---|---|
| P01-A — objeto y alcance | ¿Qué objeto/archivo exacto se crearía y por qué es exclusivamente almacenamiento local no autoritativo? | Opción A elegida; contrato candidato §§149–170; registro D0–D3 §11. | El objeto y sus propiedades negativas no están ratificados en un contrato final. Hay que demostrar que no se usa como trust anchor, raíz, identidad, permiso, policy binding ni habilitación de efectos. | `OPEN / UNKNOWN` |
| P01-B — separación operacional | ¿La invocación de bootstrap termina antes de admisión, PREPARED, dispatch, reconciliación o mutaciones de dominio? | Inventario §§22–23; BA-01–BA-03, BA-08–BA-10. | Chronicle permite estructuralmente continuar a admisión/ejecución y mutación en la misma invocación; simulación acopla ausencia de estado con inicialización y persistencia. | `NO PASS` |
| P01-C — procedimiento y quiescencia | ¿Qué procedimiento explícito se sigue para creación inicial, y qué demuestra que escritores anteriores o legacy no pueden reanudar escrituras durante la operación? | Línea de meta §§3.C.9–3.C.12; protocolo D3 legacy; opciones de bootstrap/recovery existentes. | No hay entorno operativo identificado ni prueba de quiescencia general. La exclusión legacy de M0 no prueba que los escritores estén detenidos en un entorno real. | `PENDING / UNKNOWN` |
| P01-D — creación exclusiva y concurrencia | ¿Qué propiedad efectiva evita que dos inicializadores o escritores relevantes creen/reemplacen el objeto de forma conflictiva? | `continuity-store.mjs` documenta resultados `committed/conflict/failed/unknown`; el contrato candidato exige cobertura de todos los escritores relevantes. | El lock cooperativo no demuestra exclusión frente a escritores no cooperativos. No hay evidencia verificada de garantías del filesystem ni de todos los escritores relevantes. | `PENDING / UNKNOWN` |
| P01-E — clasificación de estado previo | ¿Cómo se distingue ausencia real de existencia válida, corrupción, esquema inválido, error de lectura y conflicto? | Decisión de inicialización de estado ausente; criterios BA-04–BA-06. | El requisito documental es claro, pero no hay implementación/ensayo end-to-end autorizado que demuestre preservación del estado inválido y que no se confunda error con ausencia. | `CONTRACT REQUIRED / UNVERIFIED` |
| P01-F — resultado ambiguo y reconciliación | ¿Qué resultado se expone si una creación puede haber mutado el almacenamiento pero no se puede confirmar, y quién está autorizado a reconciliarlo? | Decisión de estado ausente; BA-07; resultados locales del store. | `UNKNOWN` debe bloquear y no disparar retry automático. No existe evidencia de un protocolo general autorizado de reconciliación para esta primera creación. | `PENDING / UNKNOWN` |
| P01-G — autoridad aplicable | ¿Qué regla canónica legitima la creación inicial sin inferir autoridad de ausencia, caller, lock o snapshot? | Constitution Authority Context y mapas STEP 7 existentes; contrato candidato §§86–112 y §§278–292. | El contexto constitucional existente no define explícitamente la legitimidad de inicialización local y su reconocimiento independiente no está implementado/probado. No se puede ampliar por analogía ni inventar owner paralelo. | `PENDING / UNKNOWN` |
| P01-H — prueba y trazabilidad | ¿Qué evidencia final demostraría cada propiedad sobre el SHA exacto? | Línea de meta §§3.5–3.8 y §§3.E.16–20; workflows conocidos; BA-01–BA-10. | No se ejecutaron las pruebas BA ni se verificó CI ligado al SHA exacto. Los YAML no demuestran que haya ocurrido una ejecución. Requiere contrato congelado y autorización separada. | `NOT RUN / NOT VERIFIED` |

## Orden de dependencia documental propuesto

El siguiente orden evita confundir preguntas distintas; es una **secuencia de análisis propuesta**, no una aprobación de decisiones:

1. **P01-A / P01-G — delimitar objeto y autoridad aplicable.** Si no se puede demostrar que el objeto es estrictamente no autoritativo y existe una base canónica aplicable a la creación, mantener STOP/UNKNOWN. No crear un owner paralelo.
2. **P01-B — definir aislamiento operacional.** Usar las rutas conocidas y la línea de meta para especificar que el bootstrap aislado no admite misión, crea PREPARED, despacha, reconcilia ni muta datos de dominio en la misma invocación.
3. **P01-C / P01-D — resolver procedimiento, quiescencia y exclusión.** La decisión de procedimiento no demuestra exclusión de escritores; un lock no demuestra quiescencia; quiescencia observada no demuestra creación atómica.
4. **P01-E / P01-F — definir estados previos y resultado ambiguo.** Preservar cualquier objeto existente inválido; no transformar error en ausencia; `UNKNOWN` bloquea sin retry automático y solo se reconcilia por una ruta que tenga autorización explícita.
5. **P01-H — pruebas y evidencia ligada al SHA.** Solo después de contrato congelado y autorización independiente para cambios/tests/CI. La inspección estática no sustituye pruebas end-to-end ni evidencia operacional.

## Invariantes que no se pueden intercambiar

- **Autoridad** responde quién/qué legitima la creación; **aislamiento operacional** responde qué puede ocurrir en la misma invocación.
- **Creación exclusiva** responde cómo se evita una creación conflictiva entre escritores; **quiescencia** responde si los actores relevantes pueden seguir escribiendo.
- **Clasificación de estado** distingue ausente de inválido; **reconciliación de UNKNOWN** resuelve un resultado indeterminado después de una operación posiblemente mutante.
- Un resultado `committed` de un store no acredita autoridad constitucional ni prueba aislamiento de consumidores.
- Un test verde no acredita una garantía operacional de quiescencia si no observa el entorno y los escritores pertinentes.
- La ausencia de un archivo nunca constituye por sí sola permiso de inicialización.

## Criterio de salida de P-01

P-01 no puede declararse resuelto hasta que cada dimensión aplicable tenga: (a) decisión/contrato canónico explícito, (b) evidencia adecuada al tipo de afirmación, (c) dependencias P-02/P-03 resueltas o excluidas de manera explícita y aceptada, y (d) trazabilidad de cualquier verificación al árbol/SHA correspondiente. Una dimensión sin evidencia suficiente permanece `PENDING/UNKNOWN`; no se permite inferir un PASS global a partir de resultados parciales.

## Próxima acción permitida en el estado actual

Continuar solo con reconciliación documental de la matriz contra el registro canónico de decisiones y los contratos existentes, o preparar un handoff autocontenido. No modificar runtime/tests/workflows/configuración, ni ejecutar pruebas/CI/Actions, sin autorización específica separada.

**Estado final de este artefacto:** documental; no ratifica D1/D2, no cierra P-01, no declara M0 completo y no cambia ningún gate canónico.


---

## Delta documental — contrato de precondiciones del entorno restringido (2026-10-27)

Referencia nueva: [NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_DRAFT_2026-10-27.md](NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_DRAFT_2026-10-27.md), creado tras la decisión explícita del propietario de permitir un entorno restringido.

Este delta registra progreso de especificación, **no cierre de criterios**:

| Criterio | Qué aporta el borrador | Estado conservador tras el borrador |
|---|---|---|
| P01-A — objeto y alcance | Exige identificar el `filePath` efectivo y no atribuir al store autoridad por su nombre o existencia. | `OPEN / UNKNOWN`: finalidad/no autoridad canónica del objeto sigue sin ratificar. |
| P01-B — separación operacional | Exige que bootstrap no continúe en la misma invocación hacia admisión, PREPARED, dispatch, reparación/reconciliación o mutación de dominio. | `NO PASS`: no hay demostración end-to-end. |
| P01-C — procedimiento y quiescencia | Exige demostrar exclusión durante la ventana y no reanudación de procesos previos/legacy. | `PENDING / UNKNOWN`: no se identificó ni demostró el entorno real o su barrera. |
| P01-D — creación exclusiva y concurrencia | Exige no sobrescritura frente a todas las clases relevantes, sin equiparar lock cooperativo con exclusión global. | `PENDING / UNKNOWN`: no se eligió ni demostró un mecanismo. |
| P01-E — estado previo | Exige distinguir ausencia real de objeto existente, corrupción, inaccesibilidad y error de inspección. | `CONTRACT REQUIRED / UNVERIFIED`: sin prueba end-to-end autorizada. |
| P01-F — UNKNOWN/reconciliación | Exige STOP/UNKNOWN sin retry automático y una vía de reconciliación autorizada antes de resolver el resultado. | `PENDING / UNKNOWN`: vía autorizada no demostrada. |
| P01-G — autoridad | Prohíbe derivar autoridad de ausencia, caller, lock, path o snapshot; exige la frontera canónica aplicable. | `PENDING / UNKNOWN`. |
| P01-H — prueba/trazabilidad | Define metadatos mínimos para enlazar evidencia al entorno, objeto/path, contrato y SHA exactos. | `NOT RUN / NOT VERIFIED`: no se ejecutaron pruebas ni CI. |

El borrador identifica qué se debe demostrar, pero no identifica por sí solo una instalación/entorno concreto ni ofrece evidencia operacional. No se cierra P-01, D0–D3 ni ningún gate por este delta. Si se descubre una contradicción con un contrato canónico existente, resolver únicamente esa discrepancia; no repetir el inventario general.

Límites intactos: sin cambios de runtime/tests/workflows/configuración ejecutable/dispositivo; sin ejecución de tests/CI/Actions; primera creación de Continuity y efectos protegidos en `STOP`; `authorization: NOT_EVALUATED`.


---

## Delta documental — candidato consolidado y desambiguación de opciones (2026-10-27)

Referencia: [NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_CONSOLIDATED_CANDIDATE_2026-10-27.md](NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_CONSOLIDATED_CANDIDATE_2026-10-27.md), blob `3af18f1df75c687771aa7ceef3fe0d9b232ca45f`.

- El candidato incorpora un predicado positivo para persistencia confirmada, separa fin de exclusión de release de lock, mantiene readmisión `BLOCKED/UNKNOWN` mientras P-05 no esté ratificada y explicita la evidencia de frontera del entorno que aún falta.
- La revisión de este delta es documental; no cambia el estado de P01-A…P01-H, no convierte la propuesta en contrato ratificado y no acredita entorno, exclusión, persistencia real ni autoridad.
- **Desambiguación de opciones:** la “Opción A” de la fila de estado de entrada de esta matriz se refiere al alcance de **almacenamiento local estrictamente no autoritativo** (pregunta de objeto/alcance P01-A). No es la alternativa A de aislamiento operacional B2/P01-B en el Registro §10.6. Para P01-B, la decisión expresa del propietario sigue siendo **C — no seleccionar todavía**; no se seleccionan A ni B para esa pregunta de aislamiento.
- Estado sin cambio: M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; P01-B `C — NO SELECCIONAR TODAVÍA`; P-05 `NO RATIFICADA`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; primera creación y efectos protegidos `STOP`.
- Sin cambios de runtime/tests/workflows/configuración ejecutable/dispositivo; tests/CI/Actions no ejecutados.


---

## Delta documental — regla provisional aprobada y precondiciones operacionales pendientes (2026-10-28)

El propietario aprobó expresamente la regla provisional de primera creación. La regla está registrada en el Registro D0–D3 §10.7 y en la nota de brecha P-01 §13. El contrato consolidado se actualizó en §9 para reconciliar esa aprobación.

Esta aprobación cierra únicamente la decisión normativa de la regla provisional; **no cierra P01-A…P01-H ni ratifica el contrato de entorno completo**. El alcance del objeto sigue U; la primera creación permanece STOP.

| Entrada pendiente | Qué falta | Estado |
|---|---|---|
| E1 parcial — entorno de esta operación | Confirmar si el bootstrap M0 de Continuity se pretende ejecutar en el POCO X7 Pro/Android o en otro entorno concreto. La plataforma general del prototipo ya está registrada y no se vuelve a preguntar. | PENDING |
| E2 — control de exclusión | Evidencia de quién/qué puede detener todos los escritores/launchers relevantes e impedir su reinicio durante la ventana. | UNKNOWN |
| E3 — launchers/writers | Modo efectivo de lanzamiento e inventario verificable de procesos, wrappers, supervisores y consumidores con capacidad de escribir o relanzar. | UNKNOWN |
| E4 — almacenamiento | Propiedades del almacenamiento y posibles escritores externos, solo después de E1–E3. | NOT READY |
| P01-H — evidencia | Pruebas/CI ligadas al SHA exacto después de contrato congelado y autorización separada; no ejecutadas para esta decisión. | NOT RUN / NOT VERIFIED |

Siguiente paso documental mínimo: resolver E1 para esta operación concreta; no volver a auditar callers, no elegir un mecanismo técnico y no interpretar una respuesta de entorno como prueba de exclusión. E2/E3 deben demostrarse con evidencia antes de pasar a E4. Si el entorno no puede identificarse o sus condiciones no pueden verificarse, conservar STOP/UNKNOWN.

Estado canónico intacto: M0 INCOMPLETO; P-01 OPEN/UNKNOWN; P01-B C — NO SELECCIONAR TODAVÍA; P-05 NO RATIFICADA; D0/D1/D2/D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; raíz PENDING/UNKNOWN; authorization NOT_EVALUATED; primera creación y efectos protegidos STOP. Solo documentación; runtime/tests/workflows/configuración ejecutable/dispositivo sin cambios; pruebas/CI/Actions no ejecutados.
