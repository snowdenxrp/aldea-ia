## DELTA — TRAZABILIDAD DE LA FRONTERA BOOTSTRAP FB-01 / FB-02 (2026-10-28)

Referencia de contrato actualizado: `NCS_M0_FB01_CONTINUITY_OBJECT_SEMANTIC_CONTRACT_DRAFT_2026-10-28.md`, sección 10, commit `457772f1774463037291dc46e548925e487b23da`, blob verificado `cbceb420aca3cdfa817ac7904252a935f0c16536`.

### Reconciliación de requisitos con evidencia actual

| Requisito de la frontera propuesta | Evidencia estática disponible | Qué falta para aceptación M0 | Estado correcto |
|---|---|---|---|
| La ruta deriva de una raíz explícita validada | `openNexoContinuityOwner` recibe `filePath`; el contrato de raíz requiere `--root` explícito | Demostrar la cadena de llamada completa hasta el destino efectivo y rechazo de fallback | UNKNOWN; FB-01 OPEN |
| La creación usa solo el snapshot vacío M0 | `continuity-service.mjs` define el snapshot vacío v1; si existe `legacyMemory`, esa rama precede a `allowEmptyInitialization` | Un flujo de bootstrap M0 que excluya la migración legacy y evidencia negativa correspondiente, después de autorización | Discrepancia de alcance conocida; no PASS |
| Bootstrap termina antes de operaciones posteriores | El servicio devuelve `store`, `owner` y `current`; `chronicle-append.mjs` importa el servicio y posee una ruta compuesta de ejecución | Contrato/API separado de propósito único y prueba de no continuación a Chronicle, admisión, PREPARED, dispatch o mutaciones | UNKNOWN; FB-01/FB-02 OPEN |
| Estado previo y publicación se tratan de forma conservadora | El servicio distingue el error `NEXO_CONTINUITY_STORE_NOT_FOUND`; los resultados de inicialización se vuelven a cargar si son `committed` o `conflict` | Evidencia completa para errores distintos de ausencia, corrupción, concurrencia, interrupción y resultado ambiguo; sin sobrescritura/reintento automático | Requisitos pendientes; FB-04 OPEN/UNKNOWN |
| Aislamiento operacional sostenido | La matriz y la inspección existente no prueban exclusión universal de escritores/launchers | Mantener P01-B=C hasta que exista decisión explícita; después evaluar el entorno y mecanismo concretos, no uno hipotético | FB-02 OPEN; E2/E3 UNKNOWN |
| Cierre reproducible | Los documentos fijan criterios, pero no hay verificación ejecutada contra SHA de cierre | Solo después de contrato congelado y autorización específica: pruebas de no-bypass y evidencia CI vinculada al SHA evaluado, más acta de aceptación | FB-07 pendiente; M0 INCOMPLETO |

### Decisión de secuencia

La sección 10 del contrato se considera una **especificación candidata de requisitos**, no evidencia de implementación. El trabajo documental sobre la forma y frontera del bootstrap está suficientemente acotado para no seguir reescribiendo el mismo diseño. El próximo avance de diseño debe concentrarse en la relación entre (a) la regla de primera creación ya aprobada con límites y su aplicabilidad al destino concreto (FB-01), y (b) la decisión de aislamiento P01-B, cuyo estado vigente sigue siendo C — NO SELECCIONAR TODAVÍA (FB-02). No seleccionar un mecanismo de aislamiento por inferencia ni declarar que una propuesta satisface P01-B.

No se cambió código ejecutable. No se ejecutaron tests, CI/Actions, runtime, bootstrap ni comandos del dispositivo. Esta delta no altera ningún gate.

---

## DELTA — ALCANCE DE MIGRACIÓN LEGACY EN FB-01 (2026-10-28)

La revisión del contrato de raíz y de separación Nexo/Lúmina confirma que la migración/cutover legacy está fuera de M0 y no puede ocurrir automáticamente. El código de `openNexoContinuityOwner` aún tiene una rama que proyecta `legacyMemory` cuando el store no existe. Esta capacidad existente no equivale a una ruta aprobada; es una discrepancia entre el comportamiento disponible y el alcance contractual objetivo. Recomendación pendiente de implementación autorizada: bootstrap M0 vacío y explícito; migración legacy separada, futura y sujeta a contrato propio. FB-01 sigue OPEN/UNKNOWN, sin cambio de gates. No ejecución.

---

## DELTA — EVIDENCIA ESTÁTICA ADICIONAL FB-01 (2026-10-28)

El borrador semántico se actualizó y verificó en blob `62cfde7aab5ec7602c2ca9c0060d47814d1233e0`. El código confirma el esquema payload v1 y su envelope separado, pero también identifica dos brechas que impiden cerrar FB-01: el servicio recibe `filePath` sin demostrar su derivación de una raíz explícita validada; y, ante store ausente, una `legacyMemory` suministrada puede inicializar Continuity aunque `allowEmptyInitialization` sea falso. Además, el servicio no demuestra por sí solo que la invocación termine antes de rutas compuestas/admisión.

Actualizar la trazabilidad conceptual: schema conocido = evidencia estática; ruta canónica, origen legítimo, aislamiento end-to-end y propiedad no autoritativa global = NO DEMOSTRADOS. FB-01 no pasa a PASS. No hubo ejecución de tests/CI/runtime.

---

## DELTA — FB-01: BORRADOR SEMÁNTICO CREADO, SIN CIERRE (2026-10-28)

Se creó [NCS_M0_FB01_CONTINUITY_OBJECT_SEMANTIC_CONTRACT_DRAFT_2026-10-28.md](NCS_M0_FB01_CONTINUITY_OBJECT_SEMANTIC_CONTRACT_DRAFT_2026-10-28.md), blob verificado `8a173cc4fcfa3471ec2e1fd7559df4d7c4bd9ac3`. El borrador convierte en invariantes propuestos la no-autoridad del snapshot, la separación de Continuity respecto de Chronicle y de admisión/dispatch, y el tratamiento UNKNOWN/STOP. No fija una ruta universal ni inventa el esquema inicial.

Efecto sobre la trazabilidad: FB-01 avanza de “falta redactar/reconciliar la semántica” a “borrador disponible para reconciliación”; **no** pasa a PASS ni se cierra. El objeto continúa U; P01-A OPEN/UNKNOWN; P01-G PENDING/UNKNOWN; P01-B=C; regla legítima aplicable a la invocación concreta UNKNOWN; primera creación STOP. Faltan ratificación contractual, objeto/ruta efectivos, esquema/contenido inicial exactos y evidencia de consumidores/propiedades negativas. No se ejecutaron código, tests, CI/Actions ni bootstrap.

---

# NCS M0 — trazabilidad de criterios de aceptación y cierre finito

**Fecha:** 2026-10-28  
**Rama:** `ncs-clean-architecture`  
**Estado:** MATRIZ DOCUMENTAL DE TRABAJO — NO RATIFICACIÓN ADICIONAL — NO IMPLEMENTACIÓN / NO TEST / NO CI  
**Base:** `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`, `NCS_M0_FINITE_BLOCKERS_AFTER_POCO_INSPECTION_2026-10-28.md`, `NCS_M0_FB01_DECISION_RECONCILIATION_2026-10-28.md`, contrato candidato de entorno restringido y documentos D0–D3 existentes.

## 1. Propósito

Convertir la línea de meta ya aceptada como base en una vista de trazabilidad: qué evidencia existe, qué se ha demostrado realmente y qué impide declarar `M0_BUILD_COMPLETE`. Esta matriz **no crea una segunda línea de meta**, no reabre auditorías cerradas y no convierte documentos en pruebas.

## 2. Decisiones ya tomadas que no se deben volver a preguntar

- La línea de meta M0 es la base de trabajo aceptada; `M0_BUILD_COMPLETE` y `PROTECTED_EFFECTS_AUTHORIZED` son gates independientes.
- La clasificación del objeto de bootstrap es **U**: no se ha demostrado que sea estrictamente no autoritativo ni que sea estado constitucional.
- La regla provisional de primera creación está **aprobada con límites**. Esto no demuestra que su aplicabilidad a la invocación/objeto concretos esté cerrada y no autoriza una escritura real.
- Para P01-B, la decisión vigente es **C — NO SELECCIONAR TODAVÍA**.
- El entorno operativo restringido está permitido como alcance de diseño, pero el entorno y su mecanismo de lanzamiento no están identificados ni demostrados.
- No hay autorización de implementación, ejecución de pruebas, CI/Actions, bootstrap ni efectos protegidos.

## 3. Trazabilidad mínima de criterios obligatorios

| Criterio de la línea de meta | Evidencia documental existente | Resultado real actual | Bloqueador de cierre |
|---|---|---|---|
| Alcance M0 y exclusiones inequívocos (§3.1 y §3.17) | Línea de meta; registro D0–D3; decisiones del propietario | **PARCIAL**: alcance base aceptado; varios contratos y exclusiones aún abiertos | FB-06: reconciliar contratos y listar solo brechas críticas concretas; exclusiones deben ser aceptadas explícitamente |
| Contratos D0–D3 coherentes (§3.3) | Registro D0–D3, matriz P-01, especificación P-05, mapas D1/D3 | **NO PASS**: D0/D1/D2/D3 siguen OPEN | FB-01…FB-06; no congelar por documentación |
| Entry points/callers y rutas indirectas clasificados (§3.5) | Manifiesto D1; mapa de objeto/consumidores; entrypoints versionados E3; revisión estática de Claude ya incorporada | **EVIDENCIA ESTÁTICA PARCIAL**; las rutas conocidas no son bootstrap aislado; no es prueba de ejecución ni autorización | No repetir el censo completo sin contradicción concreta; cerrar aristas realmente desconocidas contra SHA objetivo cuando exista autorización |
| Prueba arquitectónica de no-bypass ejecutada contra SHA exacto (§3.6) | Criterio definido en línea de meta; evidencia estática parcial | **NOT RUN / NOT VERIFIED en esta etapa** | FB-07: congelar contrato, obtener autorización separada y ejecutar solo pruebas acordadas sobre SHA exacto |
| Estados ausentes/corruptos/UNKNOWN y no-sobrescritura (§3.10–3.13) | Candidato de entorno restringido; mapa de objeto/campos; especificación P-05 | **REQUISITOS DOCUMENTADOS; integración no demostrada** | FB-04 y FB-05: contrato ratificado, política explícita y evidencia autorizada; no retry automático |
| Exclusión de escritores y launchers durante toda la ventana (§3.12 y contrato de bootstrap) | Reconciliación de exclusión; inspección read-only del POCO/Termux | **UNKNOWN**: permisos privados y ausencia de algunos directorios no demuestran exclusión universal | FB-03: definir mecanismo concreto antes de evaluar; demostrar escritores/launchers relevantes y no-reanudación o mantener STOP |
| Clasificación del objeto y regla de primera creación | Mapa exacto de objeto/campos; brecha de regla; reconciliación FB-01 | **U / OPEN / UNKNOWN**; regla provisional aprobada, aplicabilidad exacta pendiente | FB-01: especificar semántica, consumidores, prohibiciones de autoridad y destino efectivo sin asumir ruta universal |
| Readmisión después de release/limpieza inciertos | Especificación P-05 | **NO RATIFICADA; UNKNOWN/BLOCKED** | FB-05: decisión explícita del propietario o bloqueo formal; después pruebas deterministas autorizadas |
| Evidencia de aceptación ligada a código/tests/SHA/jobs (§3.18 y §3.20) | Línea de meta; resultados de CI históricos para otros SHAs; inspecciones documentales actuales | **NO PASS para cierre final** | FB-07: evidencia exacta para el SHA evaluado, con tests/CI autorizados; no trasladar resultados de otro SHA |
| Acta final criterio por criterio | Línea de meta define el formato requerido; no existe acta de cierre válida porque hay gates abiertos | **NO EMITIDA** | Solo tras resolver brechas críticas, documentar PASS/fallos/exclusiones aceptadas y aprobación requerida |

## 4. Secuencia de cierre sin repetir trabajo

1. **FB-01 — objeto/semántica/regla aplicable.** No volver a pedir la elección U ni la aprobación de la regla provisional. Completar únicamente la trazabilidad de aplicabilidad al objeto exacto.
2. **FB-02 — aislamiento.** Mantener P01-B=C; no seleccionar un mecanismo por inferencia. Resolver el límite operativo requerido antes de congelar el contrato.
3. **FB-03 — entorno y writers.** No ejecutar otro censo genérico del teléfono. La evidencia debe corresponder al entorno, launcher, invocación y destino efectivos propuestos.
4. **FB-04/FB-05 — estado previo, publicación incierta y readmisión.** No sobrescribir objetos existentes ni reintentar automáticamente. P-05 requiere decisión explícita o bloqueo continuado.
5. **FB-06 — reconciliación final D0–D3.** Solo registrar contradicciones y brechas residuales concretas, no reauditar fuentes cerradas.
6. **FB-07 — verificación exacta.** Solo tras contrato congelado y autorización separada para cada acción necesaria; vincular los resultados al SHA exacto.
7. Emitir el acta M0 únicamente si todos los criterios obligatorios aplicables pasan y cualquier exclusión fuera de alcance ha sido explícitamente aceptada. Un criterio UNKNOWN dentro del alcance impide el cierre.

## 5. Estados canónicos conservados

- M0: `INCOMPLETO`.
- P-01: `OPEN / UNKNOWN`; P01-A: `OPEN / UNKNOWN`; P01-B: `C — NO SELECCIONAR TODAVÍA`; P01-G: `PENDING / UNKNOWN`.
- Alcance del objeto: `U`; regla provisional: `OWNER_APPROVED_LIMITED`; aplicabilidad al objeto exacto: `PENDING / UNKNOWN`.
- P-05: `NO RATIFICADA`; D0/D1/D2/D3: `OPEN`; D1-IMPLEMENTATION: `NO AUTORIZADA`.
- E2/E3: `UNKNOWN`; E4: `NOT READY`; raíz legítima: `PENDING / UNKNOWN`; `authorization: NOT_EVALUATED`.
- Primera creación y efectos protegidos: `STOP`.

## 6. Límites de esta matriz

Esta es una vista de trazabilidad documental, no un resultado de implementación, ejecución, test, CI ni operación. No cambia runtime, workflows, configuración del dispositivo o datos. No selecciona primitivas de filesystem, mecanismos de lanzamiento, políticas de recuperación ni autoridad nueva. No afirma que M0 esté completo.

