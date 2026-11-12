# NCS — HANDOFF CANÓNICO DE CONTINUIDAD CORREGIDO
**Fecha:** 2026-11-07  
**Rama documental:** ncs-continuity-handoff-correction-2026-11-07  
**Base documental:** ncs-strategic-vision-preservation-2026-11-05  
**Repositorio:** snowdenxrp/aldea-ia  
**Alcance de este handoff:** corregir navegación y continuidad documental; no modifica runtime ni gates.

## 1. Entrada obligatoria y rutas físicas verificadas

Cuando el propietario escriba exactamente NCS, continuar en este orden:

1. [NEXO_NCS/STATUS.md](../STATUS.md) — estado y deltas más recientes.
2. [NEXO_NCS/MASTER/README.md](../MASTER/README.md) y [directiva estratégica](../MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md) — identidad y visión rectora.
3. [NEXO_NCS/CORE/README.md](../CORE/README.md) — contratos conceptuales del núcleo protegido.
4. [Protocolo permanente de continuidad y no repetición](../OPERATIONS/NON_REPETITION_PROTOCOL.md) — obligatorio antes de investigar, auditar, editar o proponer trabajo.
5. Leer este handoff y luego solo los documentos BUILD referenciados en la sección 4 para la dependencia concreta activa. No asumir que el handoff contiene por sí solo el último estado: STATUS y los SHAs/refs de evidencia gobiernan.
6. Continuar desde la sección 6 de este handoff. Consultar otros artefactos únicamente si resuelven una dependencia concreta y no están ya cubiertos.

## 2. Correcciones de continuidad aplicadas

- El handoff histórico solicitado como NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-10-31_D1_CONTINUITY_OPEN_BOOTSTRAP.md no fue recuperable en la rama estratégica consultada; no debe presentarse como archivo vigente ni como verificado en esa rama.
- El anterior puntero MASTER/CORE.md era incorrecto. La ruta física verificada es NEXO_NCS/CORE/README.md.
- El README de NCS usaba la ruta abreviada e incorrecta NCS/STATUS; la ruta canónica es NEXO_NCS/STATUS.md.
- Este documento sustituye la instrucción de retomar desde el handoff del 31-10. No borra ni reescribe el registro histórico de STATUS.
- La repetición de este mismo diagnóstico en conversaciones distintas queda registrada como NCS-CONT-001. Aplicar el protocolo de no repetición; no volver a investigar estas rutas salvo evidencia nueva que cumpla su regla de reapertura.
- Estas correcciones están propuestas en PR #111. Mientras siga OPEN/DRAFT/NOT MERGED, no afirmar que están integradas en la rama base.

## 3. Snapshot de producto y PR

**Snapshot de código usado por las reconciliaciones técnicas del 07-11:**
- Rama: ncs-lumina-decoupling-2026-10-29.
- HEAD: d8b5ca8720908d926acc18130614cce132a43b5d.

**PR #110:**
- Estado: OPEN / DRAFT / NOT MERGED.
- Base: ncs-clean-architecture @ 4d6432cd74af7c24c15b5a3c4bd1dbb79f181bc8.
- Head: ncs-lumina-decoupling-2026-10-29 @ d8b5ca8720908d926acc18130614cce132a43b5d.
- Snapshot del PR: 200 commits asociados, 77 archivos, 7,599 adiciones y 1,710 eliminaciones.
- Run CI referido por el PR: [40972888688](https://github.com/snowdenxrp/aldea-ia/actions/runs/40972888688). GitHub devolvió el job focused-regression con conclusión success; el paso Run repository test suite también figura success. La respuesta del job no expuso el SHA probado; no afirmar asociación exacta al HEAD actual sin evidencia adicional.
- El CI de software no demuestra validación POCO/Termux, resistencia a escritores no cooperativos, ausencia de TOCTOU ni autorización de publicación/efectos.

## 4. Evidencia vigente ya disponible — NO REPETIR

1. **P09 caller coverage:** [reconciliación 2026-11-07](../BUILD/NCS_M0_P09_CALLER_COVERAGE_RECONCILIATION_2026-11-07.md), blob `a9bcd78d8ddf6f27ebfec427aed0750b57bed714`, snapshot de código `d8b5ca8720908d926acc18130614cce132a43b5d`. El **universo declarado** fue ratificado el 09-11: repositorio/package, entrypoints, procesos hijos, workflows y launchers declarados. Loaders dinámicos y consumidores externos no identificados siguen UNKNOWN; no hay claim universal. Reutilizar la reconciliación técnica: guard literal, cinco queries path-based y Chronicle pre-read sin admisión común. P09 sigue OPEN/UNKNOWN en cobertura efectiva. No repetir el censo ni el barrido histórico de 188 archivos.
2. **P08 root→stores/Chronicle:** [reconciliación 2026-11-07](../BUILD/NCS_M0_P08_ROOT_TO_STORE_MAPPING_AND_CHRONICLE_INIT_RECONCILIATION_2026-11-07.md), blob `1ced1d0d9c435db9d224a5d347e16ea0d89af237`, snapshot `d8b5ca8`. El propietario ratificó el 09-11 una root canónica que deriva `<root>/.nexo-continuity.json` y `<root>/.nexo-chronicle.json`; sin paths independientes ni fallback ambiental en operación normal; Chronicle init separado y con admisión/autorización propias; append no inicializa Chronicle. La reconciliación 07-11 conserva valor como evidencia del gap del snapshot, no como estado vigente de la decisión. P08 DECIDED / IMPLEMENTATION PENDING.
3. **P03/P04 integración de admisión:** [diseño técnico](../BUILD/NCS_M0_D2_P03_P04_TECHNICAL_CLOSURE_DESIGN_2026-11-03.md), blob vigente `d9a55256bb9c3557a61ef14afe551f5934872ea3`. Ya mapea las cinco queries, request→draft, Chronicle directo/hijo/padre y superficies de compatibilidad. D1–D6 ratificadas; el diseño no está implementado ni probado. No volver a dibujar estos seams: resolver solo dependencias y gaps nuevos.
4. **P05-C y O1–O9:** política ratificada en blob `97e24c03d2c63dbab025a8a9912d788a63d9c125`; [obligaciones crash/persistencia/admisión](../BUILD/NCS_M0_D2_P05_P07_CRASH_PERSISTENCE_AND_ADMISSION_PROOF_OBLIGATIONS_2026-11-07.md), blob `7af04a84748bb1174ca5c361d8d0ed24b8d97a43`. C exige UNKNOWN/BLOCKED sin recuperación automática; P05 sigue OPEN porque falta enforcement durable/interproceso, resolución y evidencia. O1–O9 son criterios, no resultados.
5. **P07 V2.2 + V2.3:** V2.1 es histórico y no debe usarse como referencia normativa más reciente. V2.2 es la base de la propuesta; V2.3 es un delta posterior que debe aplicarse sobre V2.2, sin sustituirlo en Git. Refs exactos:
   - [V2.2 normativa](https://github.com/snowdenxrp/aldea-ia/blob/ncs-p07-v2-3-documentary-corrections-2026-11-03/NEXO_NCS/BUILD/NCS_M0_D2_P07_V2_2_NORMATIVE_CORRECTION_2026-11-03.md), blob `7ce10f7e02516da4438358c3d637a275001c6019`.
   - [V2.2 escenarios](https://github.com/snowdenxrp/aldea-ia/blob/ncs-p07-v2-3-documentary-corrections-2026-11-03/NEXO_NCS/BUILD/NCS_M0_D2_P07_V2_2_SCENARIO_MATRIX_AND_TEST_ORACLES_2026-11-03.md), blob `26404e70d39b3fd29ecfe56e0965917d973bac68`.
   - [V2.2 trazabilidad](https://github.com/snowdenxrp/aldea-ia/blob/ncs-p07-v2-3-documentary-corrections-2026-11-03/NEXO_NCS/BUILD/NCS_M0_D2_P07_V2_2_TRACEABILITY_PLATFORM_AND_EVIDENCE_PROTOCOL_2026-11-03.md), blob `22e8d63f725f3e304bc4ff392f6459afa941f695`.
   - [V2.3 normativa](https://github.com/snowdenxrp/aldea-ia/blob/ncs-p07-v2-3-documentary-corrections-2026-11-03/NEXO_NCS/BUILD/NCS_M0_D2_P07_V2_3_NORMATIVE_DELTA_2026-11-03.md), blob `0289f4e5f8e6412d593515a61078e27ff8e489bb`.
   - [V2.3 oráculos](https://github.com/snowdenxrp/aldea-ia/blob/ncs-p07-v2-3-documentary-corrections-2026-11-03/NEXO_NCS/BUILD/NCS_M0_D2_P07_V2_3_SCENARIO_ORACLE_DELTA_2026-11-03.md), blob `b6c4cdcfce1b21d8a6bba23d8df056b763cf002b`.
   - [V2.3 trazabilidad](https://github.com/snowdenxrp/aldea-ia/blob/ncs-p07-v2-3-documentary-corrections-2026-11-03/NEXO_NCS/BUILD/NCS_M0_D2_P07_V2_3_TRACEABILITY_DELTA_2026-11-03.md), blob `7a08e13dbda465eec29afd27ddfeb483c71e7232`.
   V2.3 distingue detección de prevención/serialización, exige clase de actor B, separa R-OBJ/R-NAME y los campos `harness_verdict`, `result_class`, `product_state`. Detección o retención por sí solas no son PASS_GATE. V2.3 sigue NO RATIFICADA, no selecciona mecanismo y no autoriza pruebas.
6. **Código vigente lock/release:** [reconciliación estática](../BUILD/NCS_M0_D2_CURRENT_SOURCE_LOCK_RELEASE_AND_P05C_RECONCILIATION_2026-11-07.md), blob `e6546c03d84d34dba976442c524c60e1c0f47d19`, snapshot `d8b5ca8720908d926acc18130614cce132a43b5d`. Continuity y Chronicle validan token y luego limpian `rm(lockPath, recursive)` por nombre; O4 no está satisfecho. `lockReleaseFailures` de Continuity es process-local; O1/O5 no están demostradas. No repetir esta lectura estática sin cambio de SHA o seam nuevo.
7. **E2/E3:** PARTIAL / NOT CLOSED. Reutilizar evidencia puntual existente; no repetir el inventario genérico ni el barrido de 188 archivos.

No rehacer Qwen/D4/D5, desacoplamiento Lúmina, inventario Termux histórico, reconciliaciones P08/P09, mapeo P03/P04 ni lectura estática de locks para el mismo snapshot. Solo abrir UNKNOWN concretos o evidencia posterior.

### 4.1 Trabajo conocido — NCS-CONT-001

- Problema repetido: rutas físicas erróneas MASTER/CORE.md, CORE.md y NCS/STATUS.
- Recurrencia identificada: 29-10, 31-10, 01-11 y 07-11-2026.
- Estado: corrección documental propuesta en PR #111; todavía no integrada.
- No repetir: auditoría de existencia de esas rutas ni creación de otro handoff para el mismo error.
- Reapertura: solo ante cambio verificable de estructura/rama o una referencia nueva incorrecta.
- Fuente operativa: [NON_REPETITION_PROTOCOL.md](../OPERATIONS/NON_REPETITION_PROTOCOL.md).

### 4.2 Trabajo conocido — NCS-CONT-002

- Problema: el handoff inicial de PR #111 apuntaba P07 V2.1 y no reflejaba las deltas posteriores ya registradas en STATUS: V2.2/V2.3, O1–O9 y la reconciliación estática de locks.
- Estado: corregido en esta revisión del mismo handoff; no crear otro documento para la misma corrección.
- No repetir: reabrir P07 V2.1 como punto de partida ni reconstruir los seams P03/P04 o el análisis lock/release del snapshot `d8b5ca8`.
- Reapertura: solo si STATUS cambia a un ref/blob posterior, o aparece un cambio concreto de código/contrato que contradiga esos documentos.
- Fuente de precedencia: STATUS, V2.2 + delta V2.3, obligaciones O1–O9 y reconciliación de locks citadas arriba.

### 4.3 Ratificaciones P08/P09 del propietario (2026-11-09)

El contenido exacto quedó registrado en [STATUS.md](../STATUS.md), blob `5681e9677d8c3a23ef78bfdaabba95c844975952`, bajo «RATIFICACIONES P08/P09 DEL PROPIETARIO». No volver a pedir estas decisiones:
- P08: root canónica y mapping Continuity/Chronicle, con init separado de append.
- P09: universo acotado declarado; loaders dinámicos y consumidores externos no identificados permanecen UNKNOWN.
- P01-B=C ya está en `BUILD/NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, blob `53691bce19edc20c6a3acb6dd99aca4d6d58e33a`, §10.6; no seleccionar launcher por inferencia.

**T-01/B-DOC-1 permanece PARTIAL** únicamente por DISC-08A/B no localizados. La ausencia de localización no demuestra inexistencia. P08/P09 siguen pendientes de implementación/cobertura técnica; no elevar G-4/G-5 a PASS.

## 5. Estado de gates — reconciliado con ratificaciones 09-11

- P-03/P-04: D1–D6 RATIFICADAS; enforcement pre-read pendiente.
- P-05-C: RATIFICADA; P-05 OPEN.
- P-07-C: UNKNOWN / BLOCKING; mecanismo seleccionado NINGUNO.
- P-08: DECIDED / IMPLEMENTATION PENDING (mapping ratificado 09-11; resolver e init/append aún no implementados).
- P-09: SCOPE DECIDED (universo acotado 09-11) / COVERAGE OPEN-UNKNOWN.
- E2/E3: PARTIAL / NOT CLOSED.
- authorization: NOT_EVALUATED.
- Raíz constitucional: PENDING / UNKNOWN.
- ROOT_READY: no establecido.
- Commissioning y efectos protegidos: STOP.
- **NCS M0: INCOMPLETO.**

No convertir análisis documental, guard estático ni CI de software en PASS de un gate diferente.

## 6. Orden de trabajo sin duplicación

### 6.1 Decisión del propietario ya resuelta — P07-C

El propietario autorizó el 2026-11-07 el criterio conservador: cualquier desplazamiento temporal del nombre protegido o modificación de `nlink` cuenta como afectación, aunque el estado original se restaure después. No reabrir esta decisión sin una nueva instrucción explícita del propietario.

### 6.1.1 Decisión del propietario ratificada — política de cleanup atribuible (2026-11-07)

El propietario ratificó:
- Solo se permite cleanup de objetos cuya atribución a la operación esté demostrada y cuya identidad y nombre estén protegidos por el protocolo.
- Ante cualquier incertidumbre, conservar el residuo y mantener `UNKNOWN/BLOCKED`.
- Nombre, token, PID o antigüedad, por sí solos, no justifican cleanup.
- Si no hay evidencia suficiente para atribuir el objeto, no se permite readmisión.

Alcance: política normativa para P05/P07. No demuestra cumplimiento del mecanismo actual, no satisface O4/O5, no cierra P05 ni P07-C, no selecciona mecanismo y no autoriza implementación, harness, tests, CI, POCO/Termux, cleanup real, readmisión, commissioning ni efectos protegidos.

Esto resuelve solo la interpretación reservada en P07 V2.2 §8. No ratifica V2.3, no selecciona mecanismo y no cambia P07-C UNKNOWN / BLOCKING, P05 OPEN, P09 UNKNOWN ni `authorization: NOT_EVALUATED`. Tampoco autoriza implementación, harness, tests, CI, POCO/Termux ni cleanup.

1. **No repetir las bases ya cerradas documentalmente:** P09, P08, seams P03/P04 y lock/release del snapshot `d8b5ca8` ya tienen reconciliaciones. Reabrir solo UNKNOWN o evidencia nueva con SHA/ruta concreta.
2. **P07-C — siguiente problema técnico:** evaluar una arquitectura candidata que satisfaga O4/O5 y los oráculos bloqueantes V2.2+V2.3 (P07-05/06/07/16/18b/19/21). Debe demostrar prevención o serialización dentro del modelo aprobado; DETECTION_ONLY y RETENTION_VERIFIED no cierran el gate. No seleccionar primitivas ni inventar marker, lock hermano, tombstone, epoch, daemon o journal.
3. **P05 — cuarentena durable:** cualquier candidato debe responder O1–O9, preservando P05-C ratificada. Exclusión viva por lock efímero no equivale a BLOCKED durable tras crash. Si no existe mecanismo demostrado, conservar STOP; no improvisar readmisión.
4. **P09 — únicamente el residuo:** cobertura técnica dentro del universo ratificado sigue OPEN/UNKNOWN; loaders dinámicos y consumidores externos no identificados permanecen UNKNOWN y fuera de cualquier claim universal. No repetir el guard ni el censo.
5. **P03/P04:** el mapa de integración ya existe en el diseño técnico. Implementación pre-read solo después de resolver dependencias P07/P05 y con autorización específica. Mantener el orden abstracto: canonical root → instance admission → per-store locks → store I/O → per-store release → instance release.
6. **P08:** mapping ya ratificado por el propietario el 09-11 y registrado en STATUS. Falta implementar/probar el resolver común y la separación efectiva init/append. No volver a solicitar la decisión.
7. **E2/E3 y aceptación:** completar evidencia de control de launchers/writers y después pruebas/CI/POCO solo con autorización específica, ligados a SHA, comando, entorno y run exactos.
8. Preparar acta de cierre M0 únicamente cuando todos los gates tengan evidencia admisible.

## 7. Límites de autorización

Este handoff y sus correcciones son documentales. No autorizan:
- cambios de runtime, tests, workflows o CI;
- comandos Termux/POCO ni harness;
- bootstrap, inicialización, publicación o modificación de Continuity/Chronicle;
- commissioning, readmisión, cleanup destructivo ni efectos protegidos;
- fusionar ramas o PR #110 o #111.

Ante evidencia ausente o contradictoria: UNKNOWN-STOP. No inferir PASS, autoridad ni autorización.

## 8. Palabra de continuidad

Escribir exactamente:

NCS

Continuar: NEXO_NCS/STATUS.md → MASTER → CORE → este HANDOFF → BUILD/tarea vigente.

**Misión única: cerrar NCS M0. No empezar M1 ni repetir trabajo ya documentado.**
