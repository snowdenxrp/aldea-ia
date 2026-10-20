## Último avance M0 — misión persistida malformada ya falla cerrada (2026-10-20)

- Runtime commit `9fbb96a7d0949d1441fd280f5f6d82101606af11`: `assertNexoContinuityMemoryShape` rechaza cada registro misión que no sea objeto, carezca de `missionId` no vacío, tenga `:` en el ID o no tenga `steps` array. No convierte el registro a misión vacía.
- Test commit `04d54049f19938685bd877653d23c9d69e775145`: regresiones de ID ausente, steps ausente, delimitador y reconstrucción de registro sin identidad con `missionId=undefined`.
- Informe ampliado: `NEXO_NCS/BUILD/NCS_M0_PERSISTED_MISSION_SHAPE_COMPATIBILITY_REVIEW_2026-10-20.md`, commit `9fa783664de7ad74a422ccc26c0965225bfad042`.
- CI para el SHA de tests: consultas disponibles devolvieron cero status checks y cero workflow runs; suite **NO VERIFICADA**. No afirmar PASS. Próximo paso: obtener evidencia de ejecución focal y revisar fixtures históricas si fallan. No aflojar validación con defaults silenciosos.
- STATUS.md actualizado en commit `a46ab7379f41f59592efcfb858d550e0ebb3e131`.
- No reabrir auditorías de authority/locks cerradas. M0 sigue `INCOMPLETO`, autorización `NOT_EVALUATED`, raíz `PENDING/UNKNOWN`, efectos protegidos `STOP`.

---

## Último avance — compatibilidad de forma de misión persistida (2026-10-20)

- Informe: `NEXO_NCS/BUILD/NCS_M0_PERSISTED_MISSION_SHAPE_COMPATIBILITY_REVIEW_2026-10-20.md`; commit `84ebe145adca3d38d4454b9da9556eb4b724bf63`.
- No cambiar runtime todavía: falta localizar el contrato de migración/versionado de misiones históricas. Validador tolera `steps` ausente en datos persistidos; reconstrucción proyecta lista vacía; admisión nueva exige `steps`; PREPARED con paso ausente sí se rechaza.
- Próximo paso concreto: rastrear productores/migradores y fixtures legacy para decidir si la tolerancia está especificada. No reabrir las auditorías de autoridad/locks ya cerradas. CI del commit de tests `594cee05c61617b38cc6481698643215e9da9ae2` aún no verificada por estados disponibles.
- M0 permanece `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## Trabajo más reciente — cobertura adicional del grafo persistido (2026-10-20)

- Añadidas tres pruebas en `tests/nexo/continuity-contract.test.mjs`: dependencia dispersa, referencia duplicada y autorreferencia. Commit: `594cee05c61617b38cc6481698643215e9da9ae2`.
- El código de validación ya rechazaba esas formas; el cambio cierra huecos de aserción concretos, no introduce una regla nueva ni modifica runtime.
- **No asumir CI PASS**: el checkpoint actual no ha verificado un run asociado al SHA del test. Próximo paso técnico: consultar/esperar la ejecución de la suite para el SHA exacto y revisar el log si falla. Si el workflow no se dispara, no simular evidencia; determinar el mecanismo real de ejecución.
- No repetir la auditoría de autoridad, el deadline de locks ni el contrato PREPARED. Mantener M0 `INCOMPLETO`, `authorization: NOT_EVALUATED`, raíz `PENDING/UNKNOWN` y efectos protegidos `STOP`.

---

# NCS — HANDOFF PARA EL SIGUIENTE CHAT
Fecha: 2026-10-20
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`
Objetivo permanente: **avanzar M0 con cambios concretos, evidencia y CI exacto; no reiniciar la misión.**

## Instrucción inicial para el próximo chat
Retoma este documento y `NEXO_NCS/STATUS.md` como puertas de entrada. Lee primero la sección “Prioridad inmediata”. No vuelvas a investigar desde cero AuthorityGate, raíz bootstrap, locks, Chronicle persistence ni los contratos de STEP 7 ya cerrados. No afirmes pruebas ni estado de CI sin consultar el SHA/run aplicable. No cambies runtime sin un contraejemplo concreto y una regresión dirigida.

## Estado de continuidad actualizado — 2026-10-20

### Cerrado: revisión de consumidores de mission-status
El informe nuevo `NEXO_NCS/BUILD/NCS_M0_MISSION_STATUS_CONSUMER_REVIEW_2026-10-20.md` está en la rama y documenta la revisión estática. La CLI `scripts/nexo.mjs` trata sólo `status === "reconstructed"` como éxito; el resto sale con código 1. `src/nexo/application/index.mjs` sólo reexporta la API. No se encontró un consumidor que ignore el bloqueo en el alcance inspeccionado. No cambiar runtime por esta hipótesis sin evidencia nueva.

### Cerrado: corrección de expectativa en prueba de lock
El runtime normaliza errores de adquisición en `initialize()` a `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED`. El test commit inicial `9fad44406e3c19bac2a20ecb830cf29f6758dae7` falló porque esperaba todavía `EACCES`; el log mostró una expectativa de test obsoleta, no evidencia de que el runtime estuviera devolviendo el código equivocado.
- La expectativa se corrigió en `b133c8c392739a0912f7b0466650a25962ead267`; sus cinco checks publicados (tests, semantic-validation, outcome-classification, M0 contracts y mission-admission-continuity) fueron SUCCESS.
- Se añadieron pruebas de adquisición tardía/timeout en `844afaac8e5c15138a3a4bf70fb417954923e770` y `d65aaffb6f90e73aea23ff4e9bab8abd8c2cbec5`; en `d65aaff` los checks focales pasaron, pero el job amplio `tests` fue CANCELLED. No llamar a ese job PASS.
- La suite de persistencia determinista terminó SUCCESS en SHA exacto `cd9c02f1596225a419a1512a7ea9b55a4953e71e`, run [39431631088](https://github.com/snowdenxrp/aldea-ia/actions/runs/39431631088). `NEXO_NCS/STATUS.md` fue sincronizado con esta evidencia en commit `a0e47fbd6728dfcb312a9de425dbe064217c88d0`.

### Puerta de contención revisada; siguiente frontera es AuthorityGate por claims concretos
La revisión `NEXO_NCS/BUILD/NCS_M0_LOCK_DEADLINE_CALLER_CONTRACT_REVIEW_2026-10-20.md` concluye que, en las rutas inspeccionadas, timeout y excepciones no se convierten en éxito ni autorizan redispatch:
- Default `NEXO_DEFAULT_LOCK_WAIT_MS = 2_000`, deadline monotónico.
- Chronicle comparte un deadline entre sus stores y mutaciones anidadas.
- `openNexoContinuityOwner()` no devuelve owner si la inicialización no se confirma.
- `recordNexoMissionSafely()` convierte excepción en UNKNOWN con `dispatchAttempted: false` y `redispatchAuthorized: false`.
- `executeNexoStepWithContinuityOwner()` exige confirmación exacta de PREPARED antes de dispatch y bloquea/UNKNOWN ante fallos posteriores.
- La asimetría sigue documentada: `initialize()` normaliza errores OS no-path, `commitIfCurrent()` puede propagarlos; los callers críticos revisados los capturan. No se halló un contraejemplo que justifique modificar el store.
- La prueba cross-process fue corregida sólo en su comentario/mensaje; los workflows focales de ese SHA son SUCCESS: suite determinista [39432367696](https://github.com/snowdenxrp/aldea-ia/actions/runs/39432367696) y aceptación integrada [39432367852](https://github.com/snowdenxrp/aldea-ia/actions/runs/39432367852), SHA `9bd69669208db5bbb7d4d06bce3d304590cd7d44`.

No volver a diseñar deadlines, no reabrir stale-lock y no uniformar la API de store sin contraejemplo. El siguiente paso M0 es el que ya figura en `NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`: un inventario pequeño, claim-relative, de capacidades/efectos protegidos en alcance. Por cada claim: propiedad protegida y alcance; último límite de enforcement; fuente/procedencia de raíz reconocida; dependencias de actualidad, revocación, sucesión y recuperación; dominios de fallo comunes; evidencia de runtime/tests/CI vs diseño; resultado STOP si cualquier premisa es UNKNOWN. No volver a investigar raíces en general, no escoger hardware ni implementar un trust registry por intuición.
## Trabajo documental hecho en esta sesión
### A. Inventario del claim Chronicle append
Archivo `NEXO_NCS/BUILD/NCS_M0_CLAIM_RELATIVE_CHRONICLE_APPEND_INVENTORY_2026-10-20.md`, blob actual `591d5bfbd4a218adb4501afa9c9570298998b547`.
- Sigue `runNexoChronicleAppend` desde API pública a handler local, observación/reconciliación y asentamiento terminal.
- Distingue garantías locales de persistencia de autorización constitucional.
- Lista pruebas negativas necesarias sin afirmar que ya existan.
- No encontró un AuthorityGate conectado a una raíz legítima en la ruta inspeccionada; no declara bypass confirmado.

### B. Frontera AuthorityGate
Archivo `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_IMPLEMENTATION_BOUNDARY_2026-10-20.md`, blob `a83c72be44a3f42e83068fd7e700eac831335f9a`.
Archivo `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`, blob `f73fefce4ea27bc848def43155976a82890b6c6c`.
Archivo `NEXO_NCS/BUILD/NCS_M0_CURRENT_AUTHORITY_BOUNDARIES_2026-10-20.md`, blob `8d9e42c580acd020d770bbf8287a2830f0e86b91`.
- `createAuthorityResult()` valida forma, no establece raíz.
- `authorityGate.check` es un puerto inyectado; no se probó implementación legítima end-to-end.
- Fixtures que inyectan `AUTHORIZED` verifican composición, no reconocimiento del propietario.
- No hay evidencia de bypass confirmado; sí falta prueba de conexión a una fuente raíz reconocida y actual en el límite del efecto.

### C. Fuente normativa vs reconocimiento técnico
Archivo `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_SOURCE_VS_BOOTSTRAP_RECOGNITION_2026-10-20.md`, blob `d346e809985c0337f3f68d9262e673c9f56a7185`.
- La fuente normativa conceptual es el propietario humano expresado en la Constitución.
- La decisión aceptada limita primera fase a llave raíz única/dispositivo único; selección y provisión física no están implementadas.
- La prioridad inmediata de coherencia mission-status quedó revisada y documentada. No continuar ahora una búsqueda general de raíces ni inspeccionar el objeto constitucional como sustituto de M0.

### D. Handoff anterior ampliado
`NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_OUTCOME_RECONSTRUCTION.md`, blob verificado `a7184ad39e2ce62b6d49aa267bd3e037519c0507`. Contiene historial anterior de M0, evidencia de CI y los documentos AuthorityGate/Chronicle.

## Hallazgos y fuentes estáticas de autoridad
- `src/nexo/core/contracts.mjs`, blob `ec811ffd24d178c294345d9e6f65a9e3bfd82ea1`: `createAuthorityResult()` acepta estados, valida forma/evidence shape; no valida legitimidad de raíz.
- `src/nexo/core/ownership.mjs`, blob `3b66d07e67df09b058b37716716573f6c17a2099`: `authorityGate.check` es puerto inyectado; default falla con `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED`.
- `src/nexo/core/protected-transition.mjs`, blob `39a602b80cda8f3939b2ffed7e726d06c21b077f`: sigue el pipeline si recibe `AUTHORIZED`; esto delega semántica al port.
- `tests/nexo/protected-transition.test.mjs`, blob `19e30c957100b41bd65222a46335a7f7b1748824`: fixtures sintéticas `AUTHORIZED` no prueban autoridad real.
- `src/nexo/application/index.mjs`, blob `7871645de355bc37ae074f4372ea960b887145be`: API estable exporta `runNexoChronicleAppend` y consultas read-only.
- `src/nexo/application/chronicle-append.mjs`, blob `ccb09c6874b9173963811073150c87b75f53bf2f`: `authorization: NOT_EVALUATED`; deadline monotónico compartido.
- `src/nexo/core/owner-backed-runtime.mjs`, blob `8c697ea2944e19cce90bf7833f4ba392fee83818`: reparación bloqueada antes de PREPARED por falta del contrato settlement; no afirmar que toda función de reparación esté globalmente deshabilitada.

## Restricciones de trabajo
- Misión: **M0**, no M1, no STEP 7 como investigación principal, no Lúmina.
- No reabrir auditorías de locks/deadlines, persistencia determinista o settlement ya cerradas salvo regresión concreta.
- No añadir raíces, trust registry, wrapper, quórum, colas, retries, tombstones ni transaction wrappers por intuición.
- No inventar evidencias; los documentos de diseño no equivalen a runtime, y runtime no equivale a CI.
- Evidencia de CI sólo aplica al SHA/archivos correspondientes.
- No habilitar efectos protegidos con base en fixtures, hash, firma histórica, snapshot, dispositivo o éxito de escritura local.
- No convertir consulta read-only en mutación/reparación.
- Mantener la decisión de una llave/dispositivo inicial; no escoger hardware/proveedor sin diseño técnico comprobable.

## Estado global al checkpoint
- Últimos commits documentales/test: `9bd69669208db5bbb7d4d06bce3d304590cd7d44` corrige la caracterización cross-process (CI focal SUCCESS); `313c7c70e79da3e69eb67015eb20d6c34425b129` y `8763f9f5ba031914029a681a00a7c45251daae93` actualizan STATUS; `da05e50da0c73e65daf8d66266318aeaec298440` agrega addendum de deadlines; `b4c50acd876b7ca9f6d1e427aa9c0e5c86738b42` registra callers; este handoff se actualiza en un commit posterior. Inventario de autoridad: `e399b85585c6e48babe4329c28acfa2d273739b9`; STATUS posterior: `6bde0532e386d042d1df86c73b22297a66ed99e6`; nota de precedencia constitucional `1da7d0851dbb4013de4d7fa3324bda31a9384805`; guía de revisión `14c18383510609e3044217afcd80c2afd7b40e09`; STATUS actualizado `64e2f3365c454c90df409ece42b3ba14f1f0d3fb`. Confirmar HEAD y CI antes de asumir que no hay commits posteriores.
- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- Raíz legítima en runtime: `PENDING/UNKNOWN`.
- No se cambió runtime ni se ejecutó CI durante esta sesión documental.
- `NEXO_NCS/STATUS.md` sí fue actualizado en commit `a0e47fbd6728dfcb312a9de425dbe064217c88d0` para registrar los logs fallidos por expectativa obsoleta, el arreglo y la suite de persistencia determinista SUCCESS en SHA `cd9c02f1596225a419a1512a7ea9b55a4953e71e`.

## Primera instrucción para continuar
No repetir la revisión de `mission-status`, callers del deadline ni el inventario claim-relative `NEXO_NCS/BUILD/NCS_M0_CLAIM_RELATIVE_AUTHORITY_ENFORCEMENT_INVENTORY_2026-10-20.md`. Antes de especificar la llave raíz, resolver la dependencia anterior: el artefacto constitucional canónico no está congelado ni aprobado. Reutiliza `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_ARTIFACT_READINESS_AUDIT_2026-10-14.md`, `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_HUMAN_READABLE_DRAFT_2026-10-14.md` y la actualización de `NCS_M0_AUTHORITY_SOURCE_VS_BOOTSTRAP_RECOGNITION_2026-10-20.md` (commit `1da7d0851dbb4013de4d7fa3324bda31a9384805`). La guía ya está preparada en `NEXO_NCS/BUILD/NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md`. No crear otra guía ni modificar el borrador para aparentar cierre. La siguiente puerta requiere revisión/decisiones explícitas del propietario sobre el contenido completo y sus puntos OPEN. Separar revisar/recibir, aprobar la revisión exacta como Constitución gobernante y autorizar una transición concreta. No generar digest/firma, no elegir hardware ni implementar bootstrap. Si el propietario aún no revisó el contenido, mantener raíz PENDING/UNKNOWN y efectos STOP.


## Precisión de continuidad — Constitution→Policy comprobado contra Core (2026-10-20)

Se amplió el inventario claim-relative existente (sin crear otro informe duplicado): `createPolicyContext()` en `src/nexo/core/contracts.mjs` conserva referencias/alcance/resolución/vigencia/procedencia de Policy, pero no establece ni conserva un `constitutionRef` ni procedencia de contexto constitucional. El contrato Constitución→Policy existente exige ese vínculo; la auditoría de reutilización ya había concluido que no existe un camino Core actual que lo establezca.

Esto es un **gap de integración confirmado por inspección estática**, no un bypass de autorización demostrado ni permiso para añadir campos de caller. Los fixtures `AUTHORIZED` de `protected-transition.test.mjs` no prueban raíz real. No modificar runtime: aceptar `constitutionRef` desde el caller sería metadata autocertificada y no cumpliría el contrato.

Mantener el orden de dependencias: revisión explícita del artefacto constitucional por el propietario → fuente/procedencia independiente de raíz demostrable → contexto constitucional actual protegido → vínculo Constitución→Policy → evaluación de autorización ligada al claim y enforcement en el sink. No saltar pasos ni marcar la Constitución aprobada por “continúa”. M0 sigue `INCOMPLETO`, `authorization: NOT_EVALUATED`, efectos `STOP`, raíz `PENDING/UNKNOWN`. Este cambio documental no ejecuta pruebas ni genera evidencia CI.


## Continuidad adicional — guía constitucional indexada (2026-10-20)

La guía existente `NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md` ahora incluye un cruce por cada decisión OPEN hacia las secciones exactas del borrador constitucional, con distinción entre contenido ya expresado y decisión/evidencia pendiente. Reutilizar esa guía; no crear una segunda matriz ni repetir el análisis del contrato Constitución→Policy.

Commit guía: `194f38819bbfaaf7f650c8e824b06fc9552139aa`. Fue un cambio documental; no hay CI ni tests nuevos asociados.

Siguiente trabajo: el propietario debe revisar el borrador completo y decidir explícitamente los puntos que quiera resolver. Mientras tanto, continuar sólo en gaps M0 que puedan probarse y cerrarse sin asumir una Constitución aprobada, una raíz reconocida o un sink autorizado. Mantener M0 `INCOMPLETO`, `authorization: NOT_EVALUATED`, raíz `PENDING/UNKNOWN`, efectos `STOP`.


## Actualización posterior — CI M0 verificado (2026-10-20)

- Se encontró una omisión real: `npm test` no ejecutaba `tests/nexo/continuity-contract.test.mjs`.
- Corregido en `6594f27a0e28e6ce5f53446228be11841626cfc3`: el script ahora incluye la suite de continuidad al final.
- Evidencia: CI [deterministic persistence](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665444), [bounded mission admission](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665452), [M0 integrated acceptance](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665518) y [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665626) terminaron `completed / success` sobre el mismo SHA. El workflow de bounded mission confirma explícitamente que `node tests/nexo/continuity-contract.test.mjs` pasó.
- No sobreinterpretar: esto verifica pruebas de contratos; no prueba autoridad raíz legítima, commissioning ni permiso para efectos protegidos.
- Próximo paso M0: continuar desde gates de integración pendientes, usando los contratos existentes y la evidencia del SHA actual; no repetir auditorías cerradas ni relajar el fallo cerrado de snapshots.


## Actualización posterior — aislamiento de snapshot de memoria fijado por regresión (2026-10-20)

- Añadida prueba en `tests/assistants.test.mjs`, commit `04fcc08081f81b3c385d4d8e9217a7744545d164`. Comprueba separación de objetos anidados para misiones, intentos, ejecuciones y effectJournal al llamar `createLearningMemory()`, incluida la no propagación de mutaciones a la fuente.
- Runtime no modificado: las rutas de retención actuales ya usan `structuredClone`; el cambio fija ese contrato con una regresión.
- [CI run 39441463747](https://github.com/snowdenxrp/aldea-ia/actions/runs/39441463747) terminó `completed / success` en el SHA exacto; el paso `Run tests` fue SUCCESS.
- Informe: [NCS_M0_MEMORY_SNAPSHOT_DETACHMENT_REGRESSION_2026-10-20.md](NCS_M0_MEMORY_SNAPSHOT_DETACHMENT_REGRESSION_2026-10-20.md).
- Alcance acotado: sólo `createLearningMemory()` en los campos probados. No declarar aislamiento global, raíz legítima ni autorización. Estado M0 sigue INCOMPLETO / NOT_EVALUATED / PENDING-UNKNOWN / STOP.


## Checkpoint posterior — STATUS reconciliado con evidencia CI (2026-10-20)

- Se actualizó la cabecera de `NEXO_NCS/STATUS.md` en commit `5c293aba52405ecfa8aa3f67a7aebb76847049c2` para poner la evidencia vigente al frente y explicar que las anotaciones `NO VERIFICADO` más abajo son históricas, no estado actual.
- La actualización conserva el resto del archivo histórico; no se hizo una reescritura global. STATUS vigente: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md
- CI corroborado directamente por metadatos de GitHub: run `39441463747`, workflow `Nexo — deterministic persistence tests`, `completed / success`, head SHA exacto `04fcc08081f81b3c385d4d8e9217a7744545d164`.
- Próxima tarea segura: escoger una brecha M0 con contraejemplo concreto y test dirigido. La coexistencia legacy/owner-backed ya está clasificada en `NCS_M0_LEGACY_EFFECT_PATH_VS_OWNER_BACKED_2026-10-19.md`; el informe indica que no se halló caller de producción actual y prohíbe tratar la API legacy como efecto protegido. No migrar ni habilitar acciones sin autoridad y dueño canónico.
- No se cambia el estado constitucional: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Ajuste final del checkpoint de continuidad (2026-10-20)

- STATUS recibió una segunda corrección documental en commit `d20d2780b7da888ae8ca65f4b0b58f04cb4236d2`: la antigua nota de compatibilidad de `steps` ahora está etiquetada explícitamente como supersedida por el contrato runtime posterior. Se conserva como historial para no borrar el razonamiento anterior.
- Esto evita que el siguiente chat confunda la revisión histórica de compatibilidad con la regla actual de fail-closed. No se modificó runtime ni se abrió una auditoría nueva.
- URL de entrada vigente: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md


## Avance nuevo — ConditionalCommit incluido en la suite principal (2026-10-20)

- Hallazgo: `tests/nexo/conditional-commit-persist-state.test.mjs` cubría persistencia real/conflicto de revisión, pero no formaba parte de `npm test`.
- Test commit `92201f7b353bf1408d88863267316379d6d0b228`: regresiones para error de persistencia con `EIO`, error sin código (`PERSISTENCE_UNKNOWN`) y candidate sin state. Los errores de persistencia se deben clasificar como `COMMIT.UNKNOWN`, nunca como committed.
- Commit de integración `72cc1b1d55f72d29ee8b9f17b0ada76ac41c6d24`: la prueba se añadió a `npm test`.
- Informe: [NCS_M0_CONDITIONAL_COMMIT_RESULT_CONTRACT_COVERAGE_2026-10-20.md](NCS_M0_CONDITIONAL_COMMIT_RESULT_CONTRACT_COVERAGE_2026-10-20.md).
- CI confirmado en el SHA exacto `72cc1b1d55f72d29ee8b9f17b0ada76ac41c6d24`: runs [39443509056](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509056), [39443509170](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509170), [39443509438](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509438) y [39443509057](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509057) finalizaron `completed / success`.
- STATUS actualizado para enlazar el informe y los runs. No cambió runtime ni se modificó el estado constitucional.
- Próxima continuidad: encontrar otra brecha M0 con contraejemplo concreto, o respetar el bloqueo que requiere revisión explícita del artefacto constitucional antes de definir reconocimiento de raíz. No repetir auditorías cerradas.


## Nuevo límite de aseguramiento — CI no equivale a merge gate (2026-10-20)

- Informe: [NCS_M0_CI_ENFORCEMENT_BOUNDARY_2026-10-20.md](NCS_M0_CI_ENFORCEMENT_BOUNDARY_2026-10-20.md).
- Metadatos de la rama observados: `protected: false`; required status checks `off`. El endpoint específico de branch protection devolvió HTTP 403 al conector; no inferir configuración adicional no visible.
- Run de persistencia determinista en el SHA del checkpoint documental `a2e141c522b09bd8ac6d3904a50224e943783d59`: [39443704746](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443704746), `completed / success`.
- Interpretación: CI PASS es evidencia por SHA; no demuestra que GitHub impida integrar cambios si CI falla. No se modificaron ajustes administrativos, ni se afirma que haya branch protection habilitada.
- Siguiente paso futuro, sólo con permisos de administración y cuando corresponda: configurar required checks y verificar la regla resultante. Hasta entonces registrar SHA + runs y no describir CI como gate obligatorio.
- Estado M0 inalterado: `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


### CI de verificación del checkpoint documental (2026-10-20)

- El workflow `npm test` [run 39444000362](https://github.com/snowdenxrp/aldea-ia/actions/runs/39444000362) terminó `completed / success` para SHA `c9c3d8bf78233f324eef257dea71b704b3f19d00`, que contenía informe, STATUS y handoff del límite de enforcement CI.
- El registro del resultado en STATUS produjo el commit documental posterior `198ae4971c61b081bac308f89816dde03a9e9924`; el run anterior no prueba por sí solo ese SHA posterior. Consultar el run del nuevo HEAD antes de afirmar verificación en él.


## Nuevo arreglo M0 — contrato de errores de adquisición del lock (2026-10-20)

- Hallazgo en revisión del informe de caller contract: `initialize()` normalizaba errores OS de adquisición del lock; `commitIfCurrent()` re-lanzaba errores no-path como `EACCES`. La asimetría estaba documentada y caracterizada por la prueba existente, así que no se asumió que fuera un bypass.
- Runtime: `9b018d36699a4c75b0251610f77fc310d79b6c26`. Ahora `commitIfCurrent()` devuelve un resultado estructurado, preserva códigos `NEXO_CONTINUITY_STORE_*` reconocidos y normaliza los demás como `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED`, con `phase: lock_acquisition`, `writeStarted: false`.
- Regresión: `0f072bd54c5a58f8bef918303acca8372a083438`; comentario aclaratorio: `4e1037dc8d172440e237d479af3982fcaa01277b`.
- Informe: [NCS_M0_CONTINUITY_STORE_LOCK_FAILURE_CONTRACT_2026-10-20.md](NCS_M0_CONTINUITY_STORE_LOCK_FAILURE_CONTRACT_2026-10-20.md).
- El cambio sólo cubre errores durante adquisición del lock, antes de escritura. No cambia el algoritmo de lock ni demuestra un bypass de autoridad. No atribuir CI PASS hasta que un workflow termine SUCCESS en el SHA que contiene el cambio.
- M0 permanece `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


### Corrección por evidencia CI — assertions de lock acquisition (2026-10-20)

- CI del SHA `4e1037dc8d172440e237d479af3982fcaa01277b` falló en `tests/nexo/continuity-store.test.mjs`: dos assertions seguían esperando excepciones (lock stale y `EACCES`) después de normalizar el contrato público a resultados estructurados.
- No se ocultó ni se clasificó como PASS. Las assertions se actualizaron en `c0adce68129c6b7bfd78260b761208653fee3054` para comprobar `status: failed`, el código tipado y `writeStarted: false`; el código específico de lock stale se conserva.
- Informe actualizado: [NCS_M0_CONTINUITY_STORE_LOCK_FAILURE_CONTRACT_2026-10-20.md](NCS_M0_CONTINUITY_STORE_LOCK_FAILURE_CONTRACT_2026-10-20.md).
- Antes de continuar a otro cambio, consultar el run del HEAD final y leer su log si falla. No considerar validado el arreglo hasta CI SUCCESS en un SHA que incluya runtime + assertions corregidas.


### Segundo hallazgo de CI sobre la misma normalización (2026-10-20)

- CI del SHA `c0adce68129c6b7bfd78260b761208653fee3054` encontró una tercera assertion heredada que esperaba una excepción para lock-release persistente, cuando el registro local de fallo de liberación hace que la siguiente adquisición retorne ahora `{ status: "failed", code: "NEXO_CONTINUITY_STORE_LOCK_RELEASE_FAILED", phase: "lock_acquisition", writeStarted: false }`.
- Corregida en `e7f04397658e405acb478f1fe5ac9b49a55b886d`. No cambiar runtime adicional sólo para conservar un test que codificaba la vieja excepción: ambas operaciones deben compartir el resultado estructurado. Mantener el lock en disco hasta la recuperación explícita; no borrar automáticamente.
- Los CI de `4e1037dc` y `c0adce68` fallaron por esas expectativas obsoletas. La suite determinista pasó en `c0adce68`, pero los workflows de continuidad/aceptación fallaron en el test del store. El run del SHA final documental todavía debe verificarse; no afirmar PASS hasta revisar resultados exactos.


## Nuevo checkpoint M0 — PolicyContext no puede absorber autoridad declarada por caller (2026-10-20)

- Se revisó el bloqueo conocido de integración Constitución→Policy sin reabrir la búsqueda histórica: `createPolicyContext()` en `src/nexo/core/contracts.mjs` proyecta sólo los cinco campos de Policy y no establece una Constitución gobernante autenticada.
- Se añadió una regresión adversarial en `tests/nexo/protected-transition.test.mjs`, commit `29e97fab41261fdd6505f5e02d8ce4791852e981`: el caller aporta `constitutionRef`, `governingConstitution`, `rootProof` y `authorization: AUTHORIZED`; la prueba exige que no entren al PolicyContext proyectado.
- CI SUCCESS en el SHA exacto: runs `39446572258`, `39446572376`, `39446574300`, `39446572342`, `39446572371`, `39446572419`. Informe: [NCS_M0_POLICY_CONTEXT_CALLER_AUTHORITY_PROJECTION_REGRESSION_2026-10-20.md](NCS_M0_POLICY_CONTEXT_CALLER_AUTHORITY_PROJECTION_REGRESSION_2026-10-20.md).
- La prueba sólo preserva la frontera de proyección anti-self-attestation; no demuestra root recognition ni sustituye la integración autenticada que falta. No hubo cambios runtime.
- El informe y STATUS se actualizaron después del SHA de prueba. Verificar CI del HEAD documental más reciente antes de afirmar que ese HEAD también tiene CI SUCCESS.
- Próximo trabajo: confirmar la ejecución del HEAD; después, avanzar sólo en brechas técnicas independientes de decisiones constitucionales OPEN. La revisión/aprobación del propietario no puede inferirse de “continúa”.
- Estado M0: `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
