# NCS — HANDOFF CANÓNICO DE CONTINUIDAD CORREGIDO
**Fecha:** 2026-11-07  
**Rama documental:** ncs-continuity-handoff-correction-2026-11-07  
**Base documental:** ncs-strategic-vision-preservation-2026-11-05  
**Repositorio:** snowdenxrp/aldea-ia  
**Alcance de este handoff:** corregir navegación y continuidad documental; no modifica runtime ni gates.

## 1. Entrada obligatoria y rutas físicas verificadas

Cuando el propietario escriba exactamente NCS, continuar en este orden:

1. [NEXO_NCS/STATUS.md](../STATUS.md) — estado y delta vigente.
2. [NEXO_NCS/MASTER/README.md](../MASTER/README.md) y [directiva estratégica](../MASTER/NEXO_STRATEGIC_VISION_AND_AUTONOMY_DIRECTIVE.md) — identidad y visión rectora.
3. [NEXO_NCS/CORE/README.md](../CORE/README.md) — contratos conceptuales del núcleo protegido. La ruta correcta es CORE/README.md; no existe NEXO_NCS/MASTER/CORE.md ni NEXO_NCS/CORE.md en esta rama.
4. [Protocolo permanente de continuidad y no repetición](../OPERATIONS/NON_REPETITION_PROTOCOL.md) — obligatorio antes de investigar, auditar, editar o proponer trabajo.
5. [BUILD/P09 caller coverage](../BUILD/NCS_M0_P09_CALLER_COVERAGE_RECONCILIATION_2026-11-07.md), [BUILD/P08 root→stores](../BUILD/NCS_M0_P08_ROOT_TO_STORE_MAPPING_AND_CHRONICLE_INIT_RECONCILIATION_2026-11-07.md) y [diseño P03/P04](../BUILD/NCS_M0_D2_P03_P04_TECHNICAL_CLOSURE_DESIGN_2026-11-03.md) — solo los seams y UNKNOWN que siguen abiertos.
6. Continuar desde la sección 7 de este handoff. Consultar otros artefactos únicamente si resuelven una dependencia concreta.

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

1. **P09 caller coverage:** [reconciliación 2026-11-07](../BUILD/NCS_M0_P09_CALLER_COVERAGE_RECONCILIATION_2026-11-07.md). En el snapshot d8b5ca8, assistants.mjs y simulate.mjs son raíces Lúmina separadas. Existe guard estático para imports/reexports literales, pero loaders no literales, consumidores externos y universo de deployment siguen UNKNOWN. Cinco queries path-based leen stores directamente; Chronicle hace loadCurrent() antes de abrir owner. El guard no prueba admisión pre-read.
2. **P08:** [reconciliación 2026-11-07](../BUILD/NCS_M0_P08_ROOT_TO_STORE_MAPPING_AND_CHRONICLE_INIT_RECONCILIATION_2026-11-07.md). No existe resolver común root→Continuity/Chronicle. Candidato .nexo-continuity.json + .nexo-chronicle.json NO RATIFICADO. Append todavía puede inicializar Chronicle; la separación requerida no está implementada.
3. **P03/P04:** [diseño técnico y seams](../BUILD/NCS_M0_D2_P03_P04_TECHNICAL_CLOSURE_DESIGN_2026-11-03.md). D1–D6 están ratificadas; enforcement antes de la primera lectura persistente sigue pendiente.
4. **P05/P07:** usar los documentos vigentes enlazados desde STATUS. P05-C está ratificada como política; P05 continúa OPEN por falta de enforcement durable/interproceso. P07-C continúa UNKNOWN/BLOCKING; mecanismo filesystem seleccionado: NINGUNO.
5. **E2/E3:** inventario local puntual ya documentado; PARTIAL / NOT CLOSED. No repetir el inventario genérico ni el barrido anterior de 188 archivos sin una contradicción o actor/ruta concreta nueva.

No rehacer Qwen/D4/D5, el desacoplamiento Lúmina, el inventario Termux histórico ni las reconciliaciones P08/P09. Reutilizar sus blobs/SHA y cubrir únicamente las clases que los propios documentos dejan UNKNOWN.

### 4.1 Trabajo conocido — NCS-CONT-001

- Problema repetido: rutas físicas erróneas MASTER/CORE.md, CORE.md y NCS/STATUS.
- Recurrencia identificada: 29-10, 31-10, 01-11 y 07-11-2026.
- Estado: corrección documental propuesta en PR #111; todavía no integrada.
- No repetir: auditoría de existencia de esas rutas ni creación de otro handoff para el mismo error.
- Reapertura: solo ante cambio verificable de estructura/rama o una referencia nueva incorrecta.
- Fuente operativa: [NON_REPETITION_PROTOCOL.md](../OPERATIONS/NON_REPETITION_PROTOCOL.md).

## 5. Estado de gates — conservar literalmente

- P-03/P-04: D1–D6 RATIFICADAS; enforcement pre-read pendiente.
- P-05-C: RATIFICADA; P-05 OPEN.
- P-07-C: UNKNOWN / BLOCKING; mecanismo seleccionado NINGUNO.
- P-08: OPEN / LAYOUT UNSELECTED.
- P-09: OPEN / UNKNOWN.
- E2/E3: PARTIAL / NOT CLOSED.
- authorization: NOT_EVALUATED.
- Raíz constitucional: PENDING / UNKNOWN.
- ROOT_READY: no establecido.
- Commissioning y efectos protegidos: STOP.
- **NCS M0: INCOMPLETO.**

No convertir análisis documental, guard estático ni CI de software en PASS de un gate diferente.

## 6. Orden de trabajo sin duplicación

1. Resolver la identidad/target y la obligación replacement-safe P07-C; no seleccionar una primitiva por inferencia.
2. Resolver P05 durable/interproceso conforme a las obligaciones O1–O9 y P05-C; no inventar tombstones, epochs, journals, daemons ni mecanismos auxiliares.
3. Completar P09 exclusivamente sobre UNKNOWN concretos: loaders no literales, procesos/dispatch no resueltos y universo de consumidores externos/deployment. No repetir el censo estático ya documentado.
4. Presentar P08 como decisión explícita del propietario: preservar el Continuity publicado y decidir el mapping Chronicle. No tratar el candidato histórico como ratificado.
5. Con dependencias resueltas y autorización específica, implementar admisión pre-read P03/P04 y la separación Chronicle init/append.
6. Ejecutar pruebas/CI y validación de entorno solo con autorización específica; ligar cada resultado al SHA, comando, entorno y run exactos.
7. Preparar acta de cierre M0 solo cuando todos los gates tengan evidencia admisible.

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
