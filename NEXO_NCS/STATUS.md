## M0-E — inventario preliminar de rutas y sinks (2026-10-21)

- El plan adversarial ahora distingue rutas que no deben confundirse: (1) Core `protected-transition → conditionalCommit.commit`, cuya condición de sink externo no está demostrada; (2) ruta Lúmina `executeLuminaNexoStep → executeNexoStep → effect adapter → handler`, con mutación de simulación en handlers; (3) ruta owner-backed canónica, que bloquea acciones distintas de `chronicle_append` en el punto inspeccionado.
- Fuentes actuales: [effect-adapter.js](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/effect-adapter.js), [simulation-adapter.js](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/simulation-adapter.js), [runtime.js](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/runtime.js), [owner-backed-runtime.mjs](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/owner-backed-runtime.mjs).
- No se concluye que todas las rutas estén alcanzables en producción ni que exista un bypass activo. El scope constitucional inicial debe determinar cuáles rutas/efectos están dentro de M0-E antes de llamar a un sink “real”.
- Próximo paso: mapear entry points y callers por efecto protegido; identificar la última mutación posible y probar que toda ruta en scope cruza el mismo enforcement. No inferir que el commit del Core es sink externo ni ampliar a todos los efectos Lúmina sin base del alcance.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0-E — plan adversarial de aceptación (2026-10-21)

- Plan nuevo: [NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md](BUILD/NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md), commit inicial `961087046d6b9e452422581f1eb387460cc1c0ba`.
- Define diez escenarios focales (raíz/procedencia ausente, autoridad autodeclarada, firma/clave inválida, Constitución no exacta, revocación/rollback/conflicto, Policy/contexto no confiable, verificador no disponible, rutas alternativas, fallo/resultado incierto del sink y camino positivo legítimo).
- Cada caso negativo exige comprobar a la vez el resultado fail-closed y que el sink real se invocó cero veces. El plan advierte que `conditionalCommit.commit` no debe asumirse automáticamente como sink de efectos externos sin inspeccionar su implementación y callers.
- Especificación solamente: no cambia runtime, no implementa raíz, no aprueba ni congela la Constitución, no provisiona clave y no autoriza commissioning.
- Próximo trabajo: identificar el sink real y sus callers dentro del alcance, mapear tests existentes a E-01…E-10 y solo después implementar tras resolver fuente independiente de raíz y aprobación del objeto constitucional exacto.
- Estado conservador: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — HEAD exacto y CI verificado (2026-10-21)

- Referencia consultada directamente: `refs/heads/ncs-clean-architecture`; HEAD observado: `4e841d3115a43eefe60266346140d948dcae2052`.
- Workflow determinista [39683852574](https://github.com/snowdenxrp/aldea-ia/actions/runs/39683852574), job [tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39683852574/job/119512816023): `completed / success` en ese SHA exacto. Paso `Run tests`: SUCCESS.
- Esto confirma ejecución de `npm test` definida por el workflow en ese checkpoint; no prueba por sí solo raíz legítima, autorización, commissioning ni cierre de M0-E.
- Inspección focal actual: `ownership.mjs` expone `effectBoundary.prepare` con fallback `NOT_IMPLEMENTED`; `protected-transition.mjs` continúa desde `authorityGate.check` y, tras validación semántica, llama `conditionalCommit.commit(candidate)` sin llamar a `effectBoundary.prepare`. M0-E sigue siendo brecha de integración, no bypass activo demostrado.
- El registro constitucional vigente recoge puntos 1–7 aceptados solo como base del borrador; objeto constitucional exacto no aprobado/fijado, raíz independiente no provisionada y commissioning no autorizado.
- Próximo paso: no reabrir A–D sin evidencia nueva. Mantener el bloqueo M0-E y definir la prueba adversarial integrada después de que exista aprobación explícita del objeto constitucional exacto y contrato de raíz/procedencia verificable.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0-E — vector bootstrap frente a reconocimiento real de raíz (2026-10-20)

- Informe focal: [NCS_M0_ROOT_BOOTSTRAP_TEST_SCOPE_AND_RUNTIME_GAP_2026-10-20.md](BUILD/NCS_M0_ROOT_BOOTSTRAP_TEST_SCOPE_AND_RUNTIME_GAP_2026-10-20.md).
- La suite incluye `tests/nexo/root-bootstrap-protocol.test.mjs`, pero es un vector criptográfico fijo de software; el propio test declara que la clave/firma no son la raíz de Nexo. El árbol inspeccionado no contiene módulo de runtime root/bootstrap bajo `src/nexo` ni evidencia de pin raíz independiente conectado a `authorityGate`.
- Clasificación: vector de prueba cubierto; reconocimiento real de raíz y ruta raíz→Constitución/Policy→claim→sink protegido NO DEMOSTRADOS. No se ha demostrado un bypass activo.
- La matriz de aceptación incorpora esta precisión: [NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md](BUILD/NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md).
- Próxima dependencia: revisión/aprobación explícita del objeto constitucional exacto por el propietario. No inferir aprobación de «continúa»; no crear verificador, pin, firma/digest ni commissioning antes de esa revisión.
- CI de referencia para el HEAD previo: [39491191357](https://github.com/snowdenxrp/aldea-ia/actions/runs/39491191357), SUCCESS en `bb57725f8cd1f0faa9528df82ed76a0fa0b5eba6`. Los commits documentales posteriores requieren su propia verificación CI.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — verificación CI del handoff y matriz (2026-10-20)

- La rama alcanzó HEAD `1a309a19dd1e3d2c300776c2e3dd240203eac78f` al guardar el handoff actualizado.
- Workflow determinista [39491101839](https://github.com/snowdenxrp/aldea-ia/actions/runs/39491101839), SHA exacto `1a309a19dd1e3d2c300776c2e3dd240203eac78f`, job `tests`: `completed / success`.
- Alcance: `npm test` del SHA citado, incluyendo las suites Nexo listadas en `package.json`. No demuestra raíz legítima ni cierre M0-E. Un commit posterior requiere comprobar su propio run antes de atribuirle CI.
- Matriz y handoff vigentes enlazados arriba. Siguiente bloqueo sigue M0-E; no repetir B/C/D sin evidencia nueva.
- Estado global: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — matriz inicial de aceptación finita (2026-10-20)

- Matriz contrato → pruebas → evidencia → estado → brecha: [NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md](BUILD/NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md).
- La suite determinista ejecutó `npm test` con SUCCESS en el HEAD previo `2690d89e197ccadd3e280ff7542f790955d6ce42`: [run 39490757350](https://github.com/snowdenxrp/aldea-ia/actions/runs/39490757350), job `tests` SUCCESS. Este resultado es específico de ese SHA; no lo atribuir a commits posteriores.
- La matriz inicial deja los criterios M0-A…M0-E en PENDING para cierre formal porque falta congelar el mínimo de aceptación y vincular cada criterio a sus assertions concretas. B/C/D tienen suites existentes y CI actual previo exitoso; no reinvestigar esas regresiones sin evidencia nueva.
- **Brecha bloqueante sustantiva: M0-E.** La inspección estática confirma que `protected-transition.mjs` consume el resultado del puerto inyectado `authorityGate.check` y llega a `conditionalCommit.commit(candidate)` sin invocar `effectBoundary.prepare`, aunque `ownership.mjs` expone ese puerto. Los fixtures `AUTHORIZED` no demuestran raíz legítima. Esto demuestra una brecha de integración, no un bypass activo.
- Próxima acción: revisión explícita del objeto constitucional exacto por el propietario; después derivar el contrato mínimo de procedencia/raíz y vincularlo al límite real de efectos. No modificar runtime para simular raíz, no provisionar llave, firmar/digeste Constitución ni commissioning antes de esa revisión.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — continuidad para siguiente chat (2026-10-20, prioridad máxima)

- Handoff con línea de meta finita: [NCS_M0_NEXT_CHAT_HANDOFF_2026-10-20_FINITE_EXIT_CRITERIA.md](BUILD/NCS_M0_NEXT_CHAT_HANDOFF_2026-10-20_FINITE_EXIT_CRITERIA.md).
- Criterios de salida: [NCS_M0_ACCEPTANCE_EXIT_CRITERIA_2026-10-20.md](BUILD/NCS_M0_ACCEPTANCE_EXIT_CRITERIA_2026-10-20.md).
- Esta sección y esos documentos fijan el orden de continuidad: STATUS → criterio de salida → handoff vigente → HEAD actual → CI atribuible al SHA → matriz finita de aceptación → brecha bloqueante.
- La lista de aceptación es propuesta pendiente de cruce con contratos/tests existentes; no declarar criterios congelados ni aprobados sin ese cruce. M0 no debe quedar abierto indefinidamente: cerrar cuando los criterios finales congelados pasen con evidencia trazable; no ampliar alcance por hallazgos no bloqueantes.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — línea de meta finita y criterio de cierre (2026-10-20)

**Regla de continuidad:** M0 no puede quedar abierto indefinidamente. «No declarar resuelto lo no demostrado» es una regla de evidencia, no una línea de meta. El cierre requiere un conjunto finito de criterios de aceptación acordados, pruebas reproducibles y evidencia atribuible al SHA evaluado. M0 cerrado NO significa que Nexo como sistema completo esté terminado.

- Criterio y plan de aceptación: [NCS_M0_ACCEPTANCE_EXIT_CRITERIA_2026-10-20.md](BUILD/NCS_M0_ACCEPTANCE_EXIT_CRITERIA_2026-10-20.md).
- Borrador de cinco criterios, pendiente de mapear a pruebas existentes y congelar: (A) aceptación reproducible; (B) continuidad/admisión/persistencia; (C) reconstrucción terminal; (D) diario de efectos/recuperación; (E) autoridad legítima conectada a la frontera real de efectos protegidos.
- **No declarar que los cinco criterios están aprobados o pasados.** Primero construir la matriz finita contrato → prueba → CI/run/job/SHA → estado → brecha. Reutilizar evidencia existente cuando corresponda; no repetir auditorías cerradas ni crear alcance nuevo sin justificación.
- Regla de cierre: M0 solo se declara cerrado cuando todos los criterios finales congelados pasan con evidencia trazable en el estado de rama evaluado. CANCELLED, ejecución ausente, checks vacíos, UNKNOWN o CI de otro SHA no son PASS. Si hay bloqueos, nombrar solo los criterios incumplidos y corregir la brecha concreta.
- Próxima acción: verificar HEAD real de la rama, leer este criterio y el handoff vigente, mapear las pruebas existentes y trabajar en la brecha bloqueante de mayor prioridad.
- Continuidad obligatoria: `STATUS.md → criterio de salida → handoff vigente → HEAD actual → CI del SHA → matriz de aceptación → brecha bloqueante`.
- Estado global sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. No reiniciar Step 7 ni M1.

---

## M0 — handoff de reconstrucción de continuidad guardado (2026-10-20)

- Handoff nuevo para el siguiente chat: [NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_CONTINUITY_RECONSTRUCTION.md](BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_CONTINUITY_RECONSTRUCTION.md), commit `6db1bde25332a378bed94114e005a3cf566987eb`.
- HEAD observado al preparar el handoff: `ef5b6524c62343dd56507c907e70c9a0c21b6288`; workflow determinista [39464330230](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464330230) SUCCESS en ese SHA. La escritura del handoff genera un commit posterior, por lo que este run no valida el commit documental nuevo.
- Reconstrucción terminal: `NEXO_OUTCOME_EVIDENCE_CONFLICT` bloquea evidencia terminal verificada contradictoria; `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH` bloquea intentos `completed` con acción/objetivo discordantes. SHA `876e1924292bd8c301b7e050531be9ded79ce290`: acceptance M0, bounded admission/continuity, STEP 4 y STEP 5 SUCCESS; workflow determinista CANCELLED, no llamarlo suite completa PASS.
- Journal desconocido: SHA `dd30b70e1204750fc09fac683f30b6e7e129bfe6` tiene SUCCESS en persistencia determinista, admisión/continuidad, aceptación integrada M0, STEP 4 y STEP 5.
- No extrapolar resultados CI entre SHA. Consultar el handoff para enlaces, alcance y continuidad.
- Estado global sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — actualización vigente: estado desconocido de effect journal (2026-10-20)

- Handoff actual: [NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_UNKNOWN_EFFECT_RECONSTRUCTION.md](BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_UNKNOWN_EFFECT_RECONSTRUCTION.md).
- Informe: [NCS_M0_UNKNOWN_EFFECT_RECONSTRUCTION_FAIL_CLOSED_2026-10-20.md](BUILD/NCS_M0_UNKNOWN_EFFECT_RECONSTRUCTION_FAIL_CLOSED_2026-10-20.md).
- Fix y regresiones CI-verificados en SHA exacto `dd30b70e1204750fc09fac683f30b6e7e129bfe6`: estados de journal desconocidos bloquean reconstrucción; estados unknown sin plan propietario retenido no se ignoran.
- SUCCESS: persistencia determinista [39464052770](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052770), admisión/continuidad [39464053282](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053282), aceptación integrada [39464053079](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053079), STEP 4 [39464052881](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052881), STEP 5 [39464052959](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052959).
- Esto supersede las notas históricas previas de CI pendiente para esta regresión específica; no extrapolar fuera de los workflows enumerados.
- Estado global: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — identidad discordante en intentos terminales (2026-10-20)

- Segunda regresión del límite de reconstrucción: una finalización válida podía ocultar otro registro `completed` para el mismo paso con acción/objetivo distintos.
- Runtime: `61520dbdf5c0a0693a500838b7c93b167e9222a8` bloquea la misión con `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`, incertidumbre `outcome_operation_context_mismatch`, y no redispatch.
- Test: `876e1924292bd8c301b7e050531be9ded79ce290`, añade snapshot adversarial que combina evidencia válida y reclamo terminal con identidad discordante.
- Validación: esta integración no expuso workflow runs/checks de push para SHA recientes. Ambos casos codificados, CI **NO VERIFICADO**; no declarar PASS.
- M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — contradicción entre resultados terminales persistidos (2026-10-20)

- Detectado caso concreto: dos intentos `completed` para misma misión/paso con identidad coincidente y evidencia marcada verificada pero evidencia distinta; reconstrucción anterior seleccionaba el primero por orden.
- Runtime: `ef26ae0512cbe215704b0034de62973961002072` bloquea la reconstrucción con `NEXO_OUTCOME_EVIDENCE_CONFLICT` cuando discrepan varias evidencias terminales verificadas.
- Test: `724ad3e800b09d01abef6aacaa9ddd8e1017fd3c`, `tests/nexo/continuity-contract.test.mjs`, cubre el caso. Los intentos fallidos tardíos por sí solos no se bloquean; ya existe contrato de no regresión de finalización verificada.
- Checks del SHA de test consultados: cero estados. Regresión añadida, **CI NO VERIFICADO**. No afirmar PASS.
- M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — frontera de intentos persistidos y reconstrucción (2026-10-20)

- Informe: [NCS_M0_PERSISTED_ATTEMPT_RECONSTRUCTION_BOUNDARY_2026-10-20.md](BUILD/NCS_M0_PERSISTED_ATTEMPT_RECONSTRUCTION_BOUNDARY_2026-10-20.md).
- Revisión estática: `attempts` se exige como array denso pero sus registros no tienen validación específica de identidad; reconstrucción consume los intentos para determinar estados. La escritura normal deduplica por `missionId + stepId`. Riesgo de ambigüedad potencial en snapshots importados/corruptos, no bypass confirmado.
- Siguiente paso: regresiones para intentos contradictorios duplicados, referencias huérfanas y acción/objetivo discrepantes; fijar contrato legacy antes de endurecer runtime.
- Sin cambio runtime ni pruebas ejecutadas; CI nuevo no verificado. M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — estado vigente de continuidad (2026-10-20)

- **Objetivo:** avanzar M0 con cambios concretos, pruebas y evidencia asociada al SHA exacto. No reiniciar Step 7 ni reabrir auditorías cerradas sin evidencia nueva.
- **Estado global:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Ninguna prueba de CI equivale a autoridad raíz ni habilita efectos protegidos.
- **Contrato de misión persistida:** commit runtime `9fbb96a7d0949d1441fd280f5f6d82101606af11`; regresiones `04d54049f19938685bd877653d23c9d69e775145`. El validador rechaza registros malformados, identidad ausente/ambigua y falta de `steps`; la suite de continuidad se incorporó a `npm test` en `6594f27a0e28e6ce5f53446228be11841626cfc3`.
- **Evidencia CI de continuidad:** workflows en SHA `6594f27a0e28e6ce5f53446228be11841626cfc3`: [deterministic persistence 39438665444](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665444), [mission admission 39438665452](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665452), [M0 integrated acceptance 39438665518](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665518) y [Chronicle native vertical 39438665626](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665626) completaron SUCCESS.
- **Regresión más reciente:** [aislamiento de snapshot de memoria](BUILD/NCS_M0_MEMORY_SNAPSHOT_DETACHMENT_REGRESSION_2026-10-20.md), test SHA `04fcc08081f81b3c385d4d8e9217a7744545d164`; [CI run 39441463747](https://github.com/snowdenxrp/aldea-ia/actions/runs/39441463747) terminó `completed / success` en ese SHA exacto. Alcance: `createLearningMemory()` para missions, attempts, executions y effectJournal; no demuestra aislamiento global.
- **Contrato de error de lock de Continuity Store:** [NCS_M0_CONTINUITY_STORE_LOCK_FAILURE_CONTRACT_2026-10-20.md](BUILD/NCS_M0_CONTINUITY_STORE_LOCK_FAILURE_CONTRACT_2026-10-20.md). `commitIfCurrent()` normaliza fallos de adquisición del lock igual que `initialize()`, preserva códigos Nexo reconocidos y devuelve `phase: lock_acquisition`, `writeStarted: false`. Runtime `9b018d36`; regresiones corregidas hasta `e7f04397`. CI en `4e1037dc` falló por assertions de stale-lock/EACCES aún esperando excepciones; CI en `c0adce68` detectó otra assertion de lock-release persistente. Ambas se actualizaron; validación del HEAD final pendiente. No declarar PASS hasta CI SUCCESS en SHA que contenga todos los cambios.
 [NCS_M0_CONTINUITY_STORE_LOCK_FAILURE_CONTRACT_2026-10-20.md](BUILD/NCS_M0_CONTINUITY_STORE_LOCK_FAILURE_CONTRACT_2026-10-20.md). `commitIfCurrent()` ahora normaliza errores OS de adquisición de lock igual que `initialize()`, con `phase: lock_acquisition` y `writeStarted: false`. Runtime `9b018d36`; regresión `0f072bd5`; comentario de test `4e1037dc`. La validación CI del SHA resultante está pendiente de registrar; no atribuirle runs anteriores.
- **Verificación posterior al checkpoint CI:** tras registrar el límite de enforcement en informe/STATUS/handoff, `npm test` del workflow [39444000362](https://github.com/snowdenxrp/aldea-ia/actions/runs/39444000362) terminó `completed / success` para el SHA `c9c3d8bf78233f324eef257dea71b704b3f19d00`. Este run valida la suite definida en `package.json` para ese SHA; no habilita autoridad ni convierte CI en required check.
- **Límite de enforcement CI:** [NCS_M0_CI_ENFORCEMENT_BOUNDARY_2026-10-20.md](BUILD/NCS_M0_CI_ENFORCEMENT_BOUNDARY_2026-10-20.md). Metadatos de GitHub para la rama observaron `protected: false` y required checks `off`; CI PASS demuestra ejecución en SHA, no bloqueo de merge. No se modificaron ajustes administrativos.
- **Contrato ConditionalCommit:** [regresión de resultados UNKNOWN y cobertura de npm test](BUILD/NCS_M0_CONDITIONAL_COMMIT_RESULT_CONTRACT_COVERAGE_2026-10-20.md). Test commit `92201f7b353bf1408d88863267316379d6d0b228`; integración a `npm test` en SHA `72cc1b1d55f72d29ee8b9f17b0ada76ac41c6d24`. CI SUCCESS en runs [39443509056](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509056), [39443509170](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509170), [39443509438](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509438), [39443509057](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509057).
- **Handoff operativo:** [NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_MISSION_CONTINUITY.md](BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_MISSION_CONTINUITY.md). Continuar desde sus prioridades; no repetir auditorías de authority/locks ni declarar PASS fuera del alcance probado.
- **Nota de precisión:** entradas históricas más abajo pueden decir `NO VERIFICADO`/PENDING porque describen el estado en la fecha de aquella entrada. No describen el estado actual cuando existe evidencia posterior enlazada arriba.

---

## M0 — frontera de compatibilidad de misión persistida (2026-10-20)

> **Supersedido por evidencia posterior:** la ambigüedad histórica descrita en esta entrada ya no es el contrato vigente. El runtime posterior exige `steps` como array para cada misión persistida y falla cerrado si falta; ver la cabecera de estado vigente y `NCS_M0_PERSISTED_MISSION_SHAPE_COMPATIBILITY_REVIEW_2026-10-20.md`. Se conserva abajo el análisis antiguo como historial, no como instrucción pendiente actual.

- Revisión focal guardada: [NCS_M0_PERSISTED_MISSION_SHAPE_COMPATIBILITY_REVIEW_2026-10-20.md](BUILD/NCS_M0_PERSISTED_MISSION_SHAPE_COMPATIBILITY_REVIEW_2026-10-20.md), commit `84ebe145adca3d38d4454b9da9556eb4b724bf63`.
- Hallazgo estático: el validador tolera registros legacy sin `steps`; reconstrucción los representa como `steps: []`. La admisión de misiones nuevas sí exige array `steps`. Un registro PREPARED que necesite un paso inexistente se rechaza.
- Clasificación: contrato de compatibilidad ambiguo, no vulnerabilidad confirmada. No se cambió runtime ni se congeló la tolerancia mediante un test, porque falta evidencia del contrato de migración/versionado.
- Siguiente paso: rastrear productores/migradores y fixtures históricos de misión antes de proponer un cambio mínimo de contrato. CI del SHA `594cee05c61617b38cc6481698643215e9da9ae2` sigue sin verificación confirmada en este checkpoint.
- Estado global sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## M0 — cobertura adicional de dependencias persistidas (2026-10-20)

- Se añadieron tres regresiones focales a `tests/nexo/continuity-contract.test.mjs` para ramas que el validador ya implementaba, pero que no estaban afirmadas directamente en los tests localizados: array `dependsOn` disperso (sparse), referencia de dependencia duplicada y autorreferencia.
- Commit de tests: [594cee05c61617b38cc6481698643215e9da9ae2](https://github.com/snowdenxrp/aldea-ia/commit/594cee05c61617b38cc6481698643215e9da9ae2). Blob actualizado: `f14cdf07459b3da1a6df66920e89f0f85685b9ca`.
- Alcance: sólo tests; sin cambios de runtime ni del contrato. Las tres pruebas esperan `NEXO_MEMORY_SCHEMA_UNKNOWN` antes de reconstrucción.
- **CI para este SHA: PENDING/NOT VERIFIED in this checkpoint.** No declarar PASS hasta obtener el resultado de la suite y asociarlo al SHA exacto.
- Estado global invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

---

## M0 — lock acquisition error normalization: regression corrected and CI re-observed (2026-10-20)

- Hallazgo: `initialize()` exponía códigos OS de adquisición del lock para errores distintos de `ENOENT/ENOTDIR`; el contrato Nexo requería normalizarlos.
- Runtime fix: `src/nexo/core/continuity-store.mjs`, commit `995871f4500b4dee5e164c2d83a59cb0e6207bf8`; normaliza a `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED` preservando códigos internos Nexo y el error específico de ruta.
- Primera regresión: commit de prueba `9fad44406e3c19bac2a20ecb830cf29f6758dae7` falló porque su expectativa todavía exigía `code: EACCES`; los logs de [contracts run 39372027172](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027172) y [mission-admission run 39372027076](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027076) muestran la misma aserción antigua en `tests/nexo/continuity-store.test.mjs`. No era evidencia de fallo del runtime fix: la prueba contradecía el contrato que debía comprobar.
- Corrección de expectativa: commit `b133c8c392739a0912f7b0466650a25962ead267`; tests, semantic-validation, outcome-classification, M0 contracts on one SHA y mission-admission-continuity SUCCESS. Ejemplos: [tests 39372728046](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728046), [M0 contracts 39372728077](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728077), [mission admission 39372728055](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728055).
- Se añadieron después pruebas de adquisición tardía/timeout en commits `844afaac8e5c15138a3a4bf70fb417954923e770` y `d65aaffb6f90e73aea23ff4e9bab8abd8c2cbec5`. En `d65aaff`, M0 contracts, mission-admission, semantic-validation y outcome-classification SUCCESS; el job amplio `tests` quedó CANCELLED, por lo que ese SHA no se declara suite completa PASS.
- Validación posterior: el workflow [Nexo — deterministic persistence tests, run 39431631088](https://github.com/snowdenxrp/aldea-ia/actions/runs/39431631088) terminó SUCCESS en el SHA exacto `cd9c02f1596225a419a1512a7ea9b55a4953e71e`, que incluye los tests actuales de `continuity-store`. Esto acredita esa suite en ese SHA; no convierte automáticamente los checks anteriores en PASS.
- Blob actual de `tests/nexo/continuity-store.test.mjs`: `f50382fc7d57bacd43dcc888812ceb1bf7fdce76`; la aserción en líneas 566–574 exige el código normalizado de `initialize()` y conserva explícitamente el contrato diferente de `commitIfCurrent()`.
- **Decisión de cierre:** error de expectativa corregido; no hacer otra modificación de runtime por este resultado. No se cambió timeout/espera ilimitada ni política de stale lock en este trabajo.
- Estado global sin cambio: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.
---
## M0 — continuidad store: deadline verificado y callers fail-closed en rutas inspeccionadas (2026-10-20)

- **La recomendación histórica de espera sin límite quedó supersedida por implementación posterior.** La revisión documental original `NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md` debe leerse como fotografía anterior, no como descripción del runtime actual.
- `src/nexo/core/lock-deadline.mjs`, blob `60f80eeb5f213fff539f5e4224a387898899d668`, define `NEXO_DEFAULT_LOCK_WAIT_MS = 2_000` y deadlines monotónicos.
- `src/nexo/core/continuity-store.mjs`, blob `9b2bf50c26a76826f40f6761e07c1537db284262`, limita `acquireLock()`; `initialize()` y `commitIfCurrent()` convierten el timeout de adquisición en resultado estructurado `failed / NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT`, `phase: lock_acquisition`, `writeStarted: false`. No se implementó reclamación automática de stale locks.
- `src/nexo/core/chronicle-store.mjs`, blob `924742e0a999fb0291dafcc67c5f0b250548339b`, aplica un deadline análogo con código propio `NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT`.
- `src/nexo/application/chronicle-append.mjs`, blob `ccb09c6874b9173963811073150c87b75f53bf2f`, crea un único deadline monotónico y lo comparte entre ambos stores y mutaciones anidadas. La capa pública preserva evidencia de timeout y evita autorizar redispatch; `recordNexoMissionSafely()` convierte excepciones de admisión en `UNKNOWN` sin dispatch.
- Informe de callers: [NCS_M0_LOCK_DEADLINE_CALLER_CONTRACT_REVIEW_2026-10-20.md](BUILD/NCS_M0_LOCK_DEADLINE_CALLER_CONTRACT_REVIEW_2026-10-20.md). En las rutas inspeccionadas, timeout o excepción no se convierten en éxito; PREPARED exige confirmación exacta antes de dispatch; fallos posteriores al dispatch permanecen UNKNOWN/bloqueados y no autorizan redispatch. Es una revisión estática acotada, no una afirmación de ausencia global en todos los consumidores posibles.
- Contrato aún asimétrico: `initialize()` normaliza errores de adquisición de infraestructura a resultado `failed`; `commitIfCurrent()` normaliza timeout y errores de ruta, pero puede propagar otros errores OS de adquisición. Los callers críticos inspeccionados los capturan; no hay contraejemplo que justifique uniformar el contrato del store.
- En `tests/nexo/continuity-store.test.mjs`, blob `7a5fb122e1a4c1ace2b0cb7d4b75dcddadad1f0e`, el test cross-process describe correctamente que el lock se libera antes de expirar el presupuesto por defecto; pruebas explícitas con `lockWaitMs: 25` cubren timeout de ambos métodos. La suite determinista de este test commit es [run 39432367696](https://github.com/snowdenxrp/aldea-ia/actions/runs/39432367696) SUCCESS en SHA exacto `9bd69669208db5bbb7d4d06bce3d304590cd7d44`; M0 integrated acceptance [run 39432367852](https://github.com/snowdenxrp/aldea-ia/actions/runs/39432367852) también SUCCESS.
- **Inventario de autoridad creado:** [NCS_M0_CLAIM_RELATIVE_AUTHORITY_ENFORCEMENT_INVENTORY_2026-10-20.md](BUILD/NCS_M0_CLAIM_RELATIVE_AUTHORITY_ENFORCEMENT_INVENTORY_2026-10-20.md). Mapea transición protegida, append local de Chronicle y reparación a sus límites de enforcement. La única ruta que puede continuar tras `AUTHORIZED` sigue dependiendo de un `authorityGate.check` inyectado; no se demostró una raíz legítima reconocida por Core. El append local no acredita autorización constitucional; la ruta owner-backed de reparación sigue bloqueada por su contrato pendiente, sin inferir que toda ruta legacy esté deshabilitada.
- **Prerrequisito anterior a la llave raíz:** el artefacto constitucional canónico todavía no existe como objeto congelado/aprobado. La auditoría existente `STEP_7_CONSTITUTION_ARTIFACT_READINESS_AUDIT_2026-10-14.md` y el borrador humano (`STEP_7_CONSTITUTION_HUMAN_READABLE_DRAFT_2026-10-14.md`) prueban que faltan ID/revisión canónica aprobada, reglas finales de bytes/renderizado, scope inicial, currentness/enmienda y revisión del propietario. La nota `NCS_M0_AUTHORITY_SOURCE_VS_BOOTSTRAP_RECOGNITION_2026-10-20.md` ya fue actualizada en commit `1da7d0851dbb4013de4d7fa3324bda31a9384805` para evitar repetir búsquedas: no generar digest/firma ni diseñar provisioning de llave antes de fijar el objeto exacto.
- **Guía de revisión preparada:** [NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md](BUILD/NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md). Reutiliza el borrador y auditorías existentes; no crea una Constitución nueva ni registra decisiones. La próxima acción dependiente del propietario es revisar el contenido completo y resolver o mantener OPEN las decisiones indicadas, separando (a) revisar/recibir, (b) aprobar una revisión exacta como Constitución gobernante y (c) autorizar una transición concreta.
- El alcance de una llave raíz y un dispositivo inicial sigue aceptado, pero no congela la Constitución ni selecciona/provisiona la llave. No generar digest/firma, commissioning transcript ni implementar bootstrap mientras el objeto exacto no esté estable y revisado. Hasta entonces: raíz `PENDING/UNKNOWN`, commissioning y efectos protegidos `STOP`.
- Estado invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.
---
## M0 — persisted mission dependency graph fail-closed (2026-10-20)

- **Hallazgo reproducible:** el contrato de snapshot rechazaba identidades duplicadas y validaba PREPARED, pero no aplicaba al grafo de pasos persistido la validación de dependencias que ya aplica `missionRecord()`. Una dependencia no-array podía llegar a reconstrucción; referencias inexistentes/ciclos también podían sobrevivir a la validación de snapshot.
- **Corrección:** `src/nexo/core/continuity-contract.mjs` valida que los pasos persistidos tengan identidad/acción válida y única, que `dependsOn` sea un array denso de referencias únicas existentes y no autorreferentes, y que el grafo no tenga ciclos. Entrada malformada → `NEXO_MEMORY_SCHEMA_UNKNOWN` antes de que el estado llegue a reconstrucción/dispatch.
- **Regresiones:** `tests/nexo/continuity-contract.test.mjs` cubre dependencia no-array, referencia ausente y ciclo. `tests/nexo/repair-session.test.mjs` ahora modela un prerrequisito real todavía `planned`, en vez de usar una referencia colgante, para seguir probando el gate de ejecución con un plan estructuralmente válido.
- **Red/green conservado:** run integrado [39366172190](https://github.com/snowdenxrp/aldea-ia/actions/runs/39366172190) falló en crash-cut/repair-session porque el fixture heredado contenía una dependencia colgante; run [39366159595](https://github.com/snowdenxrp/aldea-ia/actions/runs/39366159595) falló en la regresión nueva antes del fix de código.
- **CI SUCCESS en SHA exacto `4dc34fb045ff47457ca6476a07d3b5f3d7550469`:** aceptación integrada M0 [39366255751](https://github.com/snowdenxrp/aldea-ia/actions/runs/39366255751) (todos los pasos SUCCESS); crash cuts/repair lifecycle [39366255728](https://github.com/snowdenxrp/aldea-ia/actions/runs/39366255728) (todos los pasos SUCCESS); suite completa `npm test` [39366255710](https://github.com/snowdenxrp/aldea-ia/actions/runs/39366255710) SUCCESS; STEP 4 [39366255732](https://github.com/snowdenxrp/aldea-ia/actions/runs/39366255732) SUCCESS; STEP 5 [39366255760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39366255760) SUCCESS.
- **Alcance:** se cierra la validación estructural del grafo persistido, no la autenticidad del plan ni la autoridad del propietario. No se cambió dispatch, settlement ni el estado de autorización.
- **Estado constitucional invariable:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.

---

## M0 — valid JSON with invalid lock-owner schema (2026-10-19)

- Both stores now reject owner records unless the record is an object with a positive safe-integer `pid` and non-empty string `token`. This closes the case where valid JSON such as `42` bypassed the malformed-JSON path.
- Chronicle code `fa2f475e73b5fc63dc4a1281ff3f4bda6ea26907`; Continuity code and final tested SHA `464edd9b95340c95ef6d534a33906f242329ad56`. Regressions Chronicle `a111b96a0673e39e1f9e7c3b14bbf1cf69a5a15b`; Continuity `464edd9b95340c95ef6d534a33906f242329ad56`.
- CI SUCCESS on final code SHA `464edd9b95340c95ef6d534a33906f242329ad56`: persistence `39361652104`; integrated acceptance `39361652042`; STEP 4 `39361651989`; STEP 5 `39361652043`; bounded admission/restart `39361652089`.
- Behavior remains fail-closed: invalid owner schema → LOCK_STATE_UNKNOWN, lock preserved, no store initialization. No automatic cleanup or stale-lock reclamation.
- M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.

---

## M0 — owner.json malformado: fail-closed con carrera de creación preservada (2026-10-19)

- Hallazgo: `readLockOwner()` colapsaba JSON malformado y error de lectura en `null`; en locks recientes podía esperar sin distinguir propietario ausente de registro ilegible.
- Fix Chronicle `dfe05ad3f0ded03253c4186a45b6d48f15c53787`; Continuity `8b1c5f725ba85b71dfc9ccdd6064219d1c67feb0`. Regresión malformada Chronicle `dfd4b5a75172a1c66e082347e61d331b4326a161`, Continuity `74d8057d6259e54a232e090547394b3d3faf4f22`.
- Primer intento rojo conservado: persistencia run `39360972580` falló porque la segunda lectura de un owner válido se rechazaba como UNKNOWN. Fix de carrera Chronicle `439bb8a720d0021c76a20ca4ca9f330bc98db7ae`; Continuity `e04f761bb656034ac500fbf370fca37e9988b41f`.
- **CI SUCCESS en SHA final exacto `e04f761bb656034ac500fbf370fca37e9988b41f`:** persistencia `39361042107`; STEP 4 `39361042101`; STEP 5 `39361042218`; bounded admission/restart `39361042217`; crash cuts `39361042215`; integrated M0 acceptance `39361042247`. Chronicle native `39361035687` SUCCESS en SHA inmediatamente anterior `439bb8...`; persistencia e integrated acceptance validan ambos cambios combinados en SHA final.
- Matriz actualizada en commit documental `968c54dccc2e28f3d9b5521b9b5ab0b966593952`.
- Regla: owner.json ENOENT → reintentar la carrera de creación; owner JSON presente pero ilegible/malformado o lectura no ENOENT → LOCK_STATE_UNKNOWN, preservar lock, no inicializar. No timeout ni recuperación/borrado automático.
- Estado conservador: M0 INCOMPLETO; autorización NOT_EVALUATED; efectos protegidos STOP; raíz PENDING/UNKNOWN.

---

## M0 — Chronicle no oculta fallo de liberación; carrera ENOENT diferenciada; CI SUCCESS (2026-10-19)

- **Defecto Chronicle:** release ignoraba owner token mismatch y el resultado de limpieza; podía devolver éxito de append con el lock aún presente.
- Fix [`8b1449b27c85`](https://github.com/snowdenxrp/aldea-ia/commit/8b1449b27c8569a39d9d97c9cf400c979f3b6e10): release devuelve `released/not_owned/failed`; fallo o no propiedad produce `blocked / NEXO_CHRONICLE_LOCK_RELEASE_FAILED`, preservando `persistenceStatus`, `storeRevision` y `lockRelease`.
- Regresiones: `56550161...` (not_owned) y `9d0da479...` (cleanup EACCES).
- **Fallo red registrado:** integrated acceptance [run 39357529773](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357529773) falló en `56550161...` porque `stat()` puede devolver ENOENT si el owner ya quitó el lock tras EEXIST.
- Fix de carrera: Continuity `e986e3bd49f59c50f7bb3cb0b8a31f043186eb56` y Chronicle `5502ea6a7a29b8e85f9fd9d8ded105cc3b786d05` reintentan sólo en ENOENT; otros errores de stat resultan en LOCK_STATE_UNKNOWN.
- **CI SUCCESS** en SHA exacto `5502ea6a7a29b8e85f9fd9d8ded105cc3b786d05`: persistencia run `39357619819`; Chronicle native `39357619856`; STEP 5 `39357619906`; STEP 4 `39357619967`; bounded admission/restart `39357620002`; integrated M0 `39357619948`; repair settlement crash cuts `39357619896`.
- Matriz ampliada en commit documental `68edb8a51f4d1dd40d474957f1b039be300b1f5d`. Commits documentales posteriores no cambian el código probado.
- Estado: M0 INCOMPLETO; autorización NOT_EVALUATED; efectos protegidos STOP; raíz PENDING/UNKNOWN.

---

## M0 — callers de errores de adquisición cruzados (2026-10-19)

- La matriz se amplió en commit documental `cbd36bfbf6e9bd138a1f1d3a80caa5214db35c32`.
- Inspección de cinco rutas del owner: `recordMission` propaga y `runNexoChronicleAppend` bloquea; `recordPrepared` propaga y el runtime devuelve UNKNOWN sin dispatch; `recordOutcome` propaga y el runtime conserva incertidumbre; `recordExecutionLineage` propaga y el runtime bloquea redispatch después del dispatch; `reconcilePrepared` captura localmente como blocked/unknown.
- No se observó ruta que convierta error de adquisición en PREPARED confirmado ni en permiso de redispatch. Decisión provisional: no normalizar la API mixta sólo por simetría estética; si se decide uniformidad, debe ser una decisión arquitectónica explícita con regresiones de callers.
- Evidencia de CI de código permanece anclada al SHA `c5ffff237b6c9933030a12308aab066aa968cb32` y los runs registrados arriba. Los commits de documentación posteriores no modifican runtime ni tests.
- Estado: M0 INCOMPLETO; autorización NOT_EVALUATED; efectos protegidos STOP; raíz PENDING/UNKNOWN.

---

## M0 — lock no inspeccionable: fix compartido + CI SUCCESS (2026-10-19)

- Causa raíz corregida en ambos almacenes: un fallo de `stat(lockPath)` se tragaba, `age` quedaba en cero y el bucle podía esperar indefinidamente.
- Continuity fix [`838f9032dcaf`](https://github.com/snowdenxrp/aldea-ia/commit/838f9032dcaf4ca4eed7c13c61735604099d8d03), test [`140238c6d43d`](https://github.com/snowdenxrp/aldea-ia/commit/140238c6d43d9a4da8b9cf3f3427b021fa5cedf5). Error: `NEXO_CONTINUITY_STORE_LOCK_STATE_UNKNOWN`.
- Chronicle fix [`5b349cf84793`](https://github.com/snowdenxrp/aldea-ia/commit/5b349cf847932f79ff94a751f7494f0eecdf7862), test [`c5ffff237b6c`](https://github.com/snowdenxrp/aldea-ia/commit/c5ffff237b6c9933030a12308aab066aa968cb32). Error: `NEXO_CHRONICLE_LOCK_STATE_UNKNOWN`.
- SHA exacto probado: `c5ffff237b6c9933030a12308aab066aa968cb32`. Persistencia [run 39357200273](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200273) SUCCESS, job `tests`, paso `Run tests`; Chronicle native [39357200274](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200274), integrated M0 [39357200292](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200292), STEP 4 [39357200316](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200316), STEP 5 [39357200276](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200276), admission/restart [39357200280](https://github.com/snowdenxrp/aldea-ia/actions/runs/39357200280): todos SUCCESS.
- Matriz actualizada en commit documental `01aed1de940b5e4228acbfa598baff5593e522bb`.
- No timeout/BUSY, recuperación automática ni borrado de locks ajenos. Cuando no se puede inspeccionar la edad, el store falla cerrado y no escribe.
- Estado conservador sin cambio: M0 INCOMPLETO; autorización NOT_EVALUATED; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.

---

## M0 — hallazgo estático de lock con owner record ilegible (2026-10-19)

- La matriz de regresiones se amplió en commit documental `b1d9580185f8daaab1aa1de80cc098443a25aa4e`.
- `readLockOwner()` devuelve `null` para errores de lectura/parsing de `owner.json`. Si también falla `stat(lockPath)`, la edad queda en cero y `acquireLock()` puede seguir esperando sin límite; si la edad confirma stale, el resultado es `LOCK_STALE_RECOVERY_REQUIRED` y no borra el lock.
- Este es un hallazgo estático, no un fallo reproducido ni una regresión ejecutada. No se cambió runtime ni se añadió timeout/BUSY; falta definir contrato y prueba antes de tocarlo.
- CI de persistencia ya SUCCESS para el test SHA `24d1879192a6227013b805a069585c298760019f` (run `39356703078`); los cambios posteriores aquí son documentales. No atribuir ese run al commit documental actual.
- Estado: M0 INCOMPLETO; autorización NOT_EVALUATED; efectos protegidos STOP; raíz PENDING/UNKNOWN.

---

## M0 — sexta regresión de frontera y workflows integrados PASS (2026-10-19)

- Se añadió la sexta regresión a `tests/nexo/continuity-store.test.mjs`: si falla la lectura del envelope canónico dentro de `commitIfCurrent()`, devuelve `unknown / NEXO_CONTINUITY_STORE_READ_FAILED` antes de escribir y conserva los bytes canónicos.
- Commit con esa regresión: [`24d1879192a6227013b805a069585c298760019f`](https://github.com/snowdenxrp/aldea-ia/commit/24d1879192a6227013b805a069585c298760019f); blob de test `9fc3f5412d248c986104673aaae9ce7b771d44ee`.
- CI en SHA exacto `24d1879...`: persistencia [run 39356703078](https://github.com/snowdenxrp/aldea-ia/actions/runs/39356703078) SUCCESS; STEP 4 [39356703039](https://github.com/snowdenxrp/aldea-ia/actions/runs/39356703039) SUCCESS; STEP 5 [39356703075](https://github.com/snowdenxrp/aldea-ia/actions/runs/39356703075) SUCCESS; bounded mission admission/restart continuity [39356703048](https://github.com/snowdenxrp/aldea-ia/actions/runs/39356703048) SUCCESS; integrated M0 acceptance [39356703042](https://github.com/snowdenxrp/aldea-ia/actions/runs/39356703042) SUCCESS.
- Matriz de regresiones actualizada: commit documental `d6ffbddee5ea983b1b7d54d6ccebbec4477f01d7`. Handoff pendiente de reflejar este sexto caso y el conjunto de runs.
- Alcance: seis escenarios de frontera añadidos/caracterizados; runtime sin cambios. Verde de CI no es autoridad constitucional ni prueba de durabilidad ante pérdida de energía.
- Próximo paso: inspeccionar la asimetría de excepciones en contexto de todos los callers y el comportamiento cuando no se puede leer `owner.json`; mantener la API como está hasta decidir con evidencia.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

---

## M0 — regresiones de frontera del continuity store añadidas y CI PASS (2026-10-19)

- Se añadieron cinco escenarios a `tests/nexo/continuity-store.test.mjs`: fallo confirmado antes de reemplazo; rename aplicado con respuesta perdida; estado canónico indeterminable después de fallo; caracterización del error de adquisición del lock; liberación `not_owned` con persistencia confirmada.
- Commit de test: [`9c56d35ff84c961d3d6bb85a89201fb2ed27c172`](https://github.com/snowdenxrp/aldea-ia/commit/9c56d35ff84c961d3d6bb85a89201fb2ed27c172). Blob de test `b05212f399c506b09f099c3cfafadaf5f842d0cf`.
- CI: [run 39356584277](https://github.com/snowdenxrp/aldea-ia/actions/runs/39356584277), workflow `Nexo — deterministic persistence tests`, job `tests`, paso `Run tests` = SUCCESS en el SHA exacto `9c56d35...`. Ejecutó `npm test`.
- Matriz actualizada: [NCS_M0_CONTINUITY_STORE_REGRESSION_MATRIX_2026-10-19.md](BUILD/NCS_M0_CONTINUITY_STORE_REGRESSION_MATRIX_2026-10-19.md), commit documental `ba9b7e8123c6f575e1c8fec4cedfe9f0776f72a5`.
- Alcance: las regresiones de frontera listadas pasan en la suite. La asimetría de lock ahora está caracterizada, pero no significa que la API mixta esté aprobada como arquitectura final. Runtime sin cambios; no hay afirmación de durabilidad ante pérdida de energía ni de autoridad constitucional.
- Próximo paso: inspeccionar la lectura fallida del envelope dentro del commit y cruzar la API mixta con callers restantes antes de decidir cualquier cambio de runtime.
- Estado invariable: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

---

## M0 — cobertura crash-cut afinada (2026-10-19)

- Matriz actualizada: [NCS_M0_CONTINUITY_STORE_REGRESSION_MATRIX_2026-10-19.md](BUILD/NCS_M0_CONTINUITY_STORE_REGRESSION_MATRIX_2026-10-19.md), commit documental `39f105bdd09be39523cd796ad3e58d9a77216044`.
- `repair-settlement-crash-cuts.test.mjs` blob `60e2486698cee7a029902aa9ee09df90707fe0eb` cubre respuesta perdida a nivel caller después de commit real y replay sin repetir verifier; no cubre una excepción inyectada en el rename interno de `writeEnvelope()`.
- CI de persistencia run [39356230949](https://github.com/snowdenxrp/aldea-ia/actions/runs/39356230949) = SUCCESS, job `tests`, paso `Run tests`, SHA probado `147d9f6092353143496757c9de3cdf03a8ab44ff`. Es anterior a los nuevos commits documentales; no atribuirlo a ellos.
- No se editaron runtime/tests. M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; raíz `PENDING/UNKNOWN`.

---

## M0 — CI del checkpoint documental de regresiones (2026-10-19)

- El workflow de persistencia [run 39356168972](https://github.com/snowdenxrp/aldea-ia/actions/runs/39356168972), job `tests`, paso `Run tests` = SUCCESS para SHA `5ad2ea38645f83eeefbc75e341bb5cdc7702a8e5`.
- Ese SHA contiene sólo documentación de la matriz de regresiones y el handoff; no se editaron runtime/tests en este checkpoint. Este run demuestra que la suite de persistencia pasó en ese SHA, pero no valida nuevos escenarios de regresión: no se añadieron tests.
- El siguiente cambio debe localizar las seis ramas pendientes contra la suite completa antes de editar código o duplicar pruebas.
- Estado invariable: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

---

## M0 — matriz de regresiones del continuity store (2026-10-19)

- Documento añadido: [NCS_M0_CONTINUITY_STORE_REGRESSION_MATRIX_2026-10-19.md](BUILD/NCS_M0_CONTINUITY_STORE_REGRESSION_MATRIX_2026-10-19.md), commit documental `7441784ba216c4c269652f9453e8834dbcf348d2`.
- Cruce de `continuity-store.test.mjs` con `chronicle-runtime.test.mjs` y `continuity-contract.test.mjs`: los gates PREPARED UNKNOWN/no dispatch y la prevención de redispatch tienen cobertura en runtime; no duplicar esas pruebas sin un caso distinto.
- Regresiones por localizar en la suite completa: commit condicional que falla antes del reemplazo; rename aplicado seguido de respuesta perdida; escritura fallida con estado canónico indeterminable; error de adquisición no normalizado; lectura fallida dentro de commit; liberación `not_owned`.
- “No localizada” se limita al archivo de test de store inspeccionado; no significa ausencia en toda la suite. No cambiar API/runtime hasta cruzar estos escenarios con los tests restantes.
- Solo documentación: no se editaron runtime/tests y no se ejecutó CI nuevo. Los hashes documentados son blobs inspeccionados, no una ejecución.
- Estado invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

---

## M0 — checkpoint más reciente: inventario de callers del continuity store (2026-10-19)

- Inventario estático añadido: [NCS_M0_CONTINUITY_STORE_CALLER_INVENTORY_2026-10-19.md](BUILD/NCS_M0_CONTINUITY_STORE_CALLER_INVENTORY_2026-10-19.md), commit documental `5ebf2b081660d16ca026163728185bad2fc21f7a`.
- Identifica cinco call sites ejecutables de `store.commitIfCurrent()` en el owner y documenta manejo de excepciones, apertura/bootstrap, consultas y gate de dispatch.
- Hallazgo acotado: API mixta; algunos call sites propagan excepciones, mientras reconciliación y capas superiores las traducen a UNKNOWN/BLOCKED. No se observó bypass de redispatch en las rutas revisadas; revisión estática, no exhaustiva.
- Siguiente paso: decidir el contrato público de errores sólo después de añadir regresiones para cada rama que se cambie. Mantener runtime/tests sin cambios hasta esa decisión. Sin nuevos resultados de CI para estos commits documentales.
- Estado invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

---

## M0 — checkpoint contractual: matriz pública de errores del continuity store (2026-10-19)

- Nuevo documento de diseño: [NCS_M0_CONTINUITY_STORE_PUBLIC_ERROR_CONTRACT_MATRIX_2026-10-19.md](BUILD/NCS_M0_CONTINUITY_STORE_PUBLIC_ERROR_CONTRACT_MATRIX_2026-10-19.md), commit documental `3df670e5e5ebb1d2a78b23a5331c7a78b6134085`.
- Define la asimetría observada entre `initialize()` y `commitIfCurrent()`, el significado mínimo de persistencia/contención/UNKNOWN y las invariantes que los callers deben conservar. No cambia runtime ni tests.
- Siguiente paso: completar inventario concreto de callers y sus ramas de excepción/resultado antes de decidir si uniformar la API. No introducir `BUSY`, timeout, cancelación ni recuperación automática por anticipado.
- No hubo CI nuevo para este cambio documental. No atribuir los runs previos a este commit.
- Estado invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

---

## M0 — checkpoint más reciente: lock cross-process caracterizado (2026-10-19)

- HEAD documental actual observado: `26a93b5b62d3cacc0cb471395a4c6fec92c4e780`.
- SHA exacto con prueba nueva y cinco workflows SUCCESS: `6f0499142781e24c55d1adf137170323c8d1afbf`. La comparación GitHub confirma que los tres commits posteriores sólo modifican `NEXO_NCS/STATUS.md`, el handoff y la revisión del lock; no cambian runtime ni tests.
- Prueba cross-process: un proceso hijo intenta escribir mientras existe un lock cuyo PID propietario sigue vivo. El hijo permanece pendiente mientras el lock existe y completa el commit cuando se retira explícitamente. CI: persistencia [39347061453](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061453), M0 integrado [39347061416](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061416), admisión/continuidad [39347061419](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061419), STEP 4 [39347061426](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061426), STEP 5 [39347061501](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061501): todos SUCCESS.
- Interpretación: el bucle de adquisición no ofrece resultado acotado si el PID del propietario sigue vivo y el lock no desaparece. No se cambió runtime ni se añadió timeout arbitrario. Definir el contrato de contención antes de implementar; nunca convertir timeout/BUSY/UNKNOWN en permiso de redispatch ni borrar automáticamente un lock ajeno.
- Handoff: [NCS_M0_HANDOFF_NEW_CHAT_2026-10-19.md](BUILD/NCS_M0_HANDOFF_NEW_CHAT_2026-10-19.md). Análisis: [NCS_M0_LOCK_RELEASE_FAILURE_REVIEW_2026-10-19.md](BUILD/NCS_M0_LOCK_RELEASE_FAILURE_REVIEW_2026-10-19.md).
- Estado invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

---

## M0 — CI del vector de bootstrap confirmado; continuación sin llave (2026-10-19)

- **Corrección del checkpoint anterior:** sí existe CI completo observado para el commit que integró `tests/nexo/root-bootstrap-protocol.test.mjs` en `npm test`: [run 39342543741](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543741), SHA exacto `4c0cec1833842103f21194b1f4a3ebdfe168181d`, job `tests`, paso `Run tests` = SUCCESS.
- Aceptación integrada M0: [run 39342543894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543894), cinco grupos SUCCESS; Chronicle vertical [run 39342543925](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543925) SUCCESS; admisión/continuidad [run 39342543933](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543933) SUCCESS. Todos están asociados al mismo SHA `4c0cec...`.
- El HEAD observado antes de esta actualización documental era `e795a79ed7faaae6f7218a6bd3f67aacafcb6698`. La comparación GitHub desde `4c0cec...` confirmó 15 commits posteriores con cambios exclusivamente en cinco archivos Markdown; no hubo cambios posteriores de runtime/test. No presentar la ejecución como si probara literalmente el SHA documental HEAD.
- La prueba automatizada del vector confirma el contrato de codificación y verificación software. No demuestra llave física, provisión independiente del fingerprint, identidad del propietario ni autoridad vigente.
- **La llave física NO bloquea el resto de M0.** Continuar en paralelo con contratos de continuidad, recuperación, no-redispatch, límites de acciones y matriz de aceptación del store. Sólo la provisión/fingerprint real y la prueba de hardware requieren la llave.
- Nueva continuidad de carril no dependiente de llave: [NCS_M0_NON_ROOT_CONTINUATION_TRACK_2026-10-19.md](BUILD/NCS_M0_NON_ROOT_CONTINUATION_TRACK_2026-10-19.md). Incluye el resultado CI, revisión del gate de acciones y los límites explícitos del store.
- Matriz preliminar creada: [NCS_M0_CONTINUITY_STORE_DEPLOYMENT_ACCEPTANCE_MATRIX_DRAFT_2026-10-19.md](BUILD/NCS_M0_CONTINUITY_STORE_DEPLOYMENT_ACCEPTANCE_MATRIX_DRAFT_2026-10-19.md). Separa los invariantes probados de fsync/pérdida de energía, anti-rollback, path attacks y filesystem distribuido; requisitos de despliegue permanecen PENDING.
- **Liberación del lock y contención entre procesos caracterizadas**: [NCS_M0_LOCK_RELEASE_FAILURE_REVIEW_2026-10-19.md](BUILD/NCS_M0_LOCK_RELEASE_FAILURE_REVIEW_2026-10-19.md). La corrección del resultado de persistencia sigue probada en SHA `539bcc4cf98dbc33a73140bde7cf18a4374c68c0` (cinco workflows SUCCESS, documentados en la revisión). Nueva prueba entre procesos añadida en SHA exacto `6f0499142781e24c55d1adf137170323c8d1afbf`: persistencia [run 39347061453](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061453), aceptación integrada [run 39347061416](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061416), admisión/continuidad [run 39347061419](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061419), STEP 4 [run 39347061426](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061426) y STEP 5 [run 39347061501](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061501) = SUCCESS. El test crea un lock cuyo PID propietario sigue vivo, verifica que un proceso hijo no termina mientras el lock permanece y luego confirma que continúa cuando el lock se retira explícitamente. El contrato actual no define un resultado acotado para la contención: `acquireLock()` sigue esperando en bucle. **No se cambió runtime ni se introdujo timeout arbitrario**; el requisito de espera/fallo por contención queda pendiente de decisión de diseño. La ruta previa de fallo de `rm` conserva el resultado exterior `status: failed` con `persistenceStatus` explícito si el lock no se libera. Esto no prueba durabilidad ante pérdida de energía, resistencia a procesos locales hostiles ni autoridad legítima.
- Estado invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

## M0 — vector criptográfico preliminar verificado (2026-10-19)

- El borrador [NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md](BUILD/NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md), sección 8, contiene un vector de verificación P-256/ECDSA-SHA256: SPKI DER, fingerprint SHA-256, mensaje canónico, firma DER y resultados negativos.
- Validación local observada con Node.js v22.16.0: firma válida `true`; desafío alterado, firma alterada y clave pública distinta `false`. **No es CI, no es hardware real y no valida el canal de provisión.**
- Siguiente paso técnico acotado: obtener CI completo para el commit que añadió el test; en paralelo, cerrar el procedimiento independiente del pin y confirmar disponibilidad/compatibilidad del hardware candidato. No conectar el perfil a dispatch ni habilitar efectos.
- Estado invariable: M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.

## M0 — perfil criptográfico de bootstrap redactado, pendiente de provisión (2026-10-19)

- Borrador: [NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md](BUILD/NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md).
- Se propone un perfil preciso para revisión: P-256/ECDSA-SHA256, SPKI DER con fingerprint SHA-256, desafío CSPRNG de 32 bytes y mensaje con dominio `NEXO-ROOT-BOOTSTRAP-V1\0`. Es especificación documental, no código ni vector validado.
- El pin/fingerprint independiente sigue sin ceremonia aceptada; hardware candidato no adquirido/probado. El vector de verificación software ya está documentado y automatizado en `tests/nexo/root-bootstrap-protocol.test.mjs`, pero su CI en el commit nuevo está pendiente. No escribir aún el verificador de producción ni conectar la firma a dispatch.
- Próxima puerta: obtener CI del test, cerrar provisión del pin y confirmar disponibilidad/compatibilidad de hardware; después prueba física y CI de integración. M0 INCOMPLETO; autoridad NOT_EVALUATED; efectos protegidos STOP.

## Addendum — candidato técnico identificado, sin disponibilidad ni prueba (2026-10-19)

La revisión de fuentes oficiales identifica una ruta candidata concreta: **llave física con PIV/NFC usando YubiKit para Android**, con YubiKey 5 NFC como ejemplo compatible según documentación de Yubico. Esto reduce la incertidumbre técnica, pero **no cierra el bloqueo**: no hay evidencia de adquisición, integración en Nexo ni prueba en el POCO X7 Pro. Tampoco existe aún un fingerprint provisionado independientemente del store de continuidad.

Evaluación y fuentes: [NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md](BUILD/NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md).

No seleccionar automáticamente el hardware, no instalar dependencias ni generar código de integración antes de confirmar disponibilidad y compatibilidad real. Android Keystore/StrongBox tampoco se presume disponible: requiere verificar attestation/nivel de seguridad en el dispositivo concreto. M0 sigue INCOMPLETO, autoridad NOT_EVALUATED y efectos protegidos STOP.

## M0 — decisión de alcance PREPARED receipt (2026-10-19)

- Decisión registrada: [NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md](DECISIONS/NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md).
- El adaptador genérico y su `executePrepared()` son interfaces internas de la misma base de confianza; no son una sandbox contra JavaScript arbitrario en el mismo proceso. Bloquear sólo un recibo fabricado no arreglaría ese modelo: el consumidor con acceso al adaptador también puede registrar handlers o llamar a `execute()`.
- Se cierra la ambigüedad documental como decisión de alcance, no como PASS de seguridad ni como cambio de runtime. La composición owner-backed mantiene sus regresiones de PREPARED/settlement/no-redispatch. No se añade segundo journal, booleano de autenticidad ni callback auto-verificador.
- No hay evidencia de un caller de producción actual para el runtime legacy de Lúmina; no describirlo como ruta protegida activa.
- **Sin cambio constitucional:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz `PENDING/UNKNOWN`. La provisión independiente de la raíz sigue siendo un bloqueo separado.

---

## M0 — bloqueo explícito de provisión independiente de la raíz (2026-10-19)

- Documento de bloqueo: [NCS_M0_ROOT_PROVISIONING_SOURCE_BLOCKER_2026-10-19.md](BUILD/NCS_M0_ROOT_PROVISIONING_SOURCE_BLOCKER_2026-10-19.md).
- **Conclusión limitada a la evidencia actual:** no está demostrado un canal/procedimiento independiente para provisionar el fingerprint real de la única llave raíz. Esto no afirma que sea imposible; significa que no existe evidencia suficiente para implementarlo como si estuviera resuelto.
- No hay llave física seleccionada/adquirida/configurada ni pin real con procedencia independiente verificada. El teléfono, OS, modelo, cuenta/repositorio, snapshot y store de continuidad no se aceptan como raíz por defecto.
- No implementar verificador ni escoger hardware por inferencia. La puerta de salida exige fuente independiente disponible, procedimiento de pin reproducible, vector criptográfico, desafío fresco/replay tests, revocación vigente y enforcement en la frontera real.
- La suite completa `npm test` pasó en SHA `846f1ca5ff5b194ecd22e097f303964873184bce`, [run 39340435744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340435744). El HEAD documental posterior sólo añade documentación; la validación de software no demuestra autoridad del propietario.

**Estado:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`. Siguiente paso: conseguir evidencia de una fuente independiente real o mantener este bloqueo explícito. No volver a M1/STEP 7.

---

## M0 — validación actualizada del recibo de resultado terminal (2026-10-19)

- **HEAD de la rama verificado directamente antes de esta actualización documental:** `846f1ca5ff5b194ecd22e097f303964873184bce`. La comparación GitHub de `846f1ca5...` contra `ncs-clean-architecture` devolvió `identical`, cero commits de diferencia.
- **Suite completa `npm test`: SUCCESS** en ese SHA exacto: [run 39340435744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340435744), job `tests`, pasos `Install` y `Run tests` SUCCESS.
- La suite incluye los cuatro casos añadidos en `e38556bc78487aae117b1c11085aca1731dfbb2e` para recibos terminales malformados: `committed` sin revisión, revisión sin avanzar, salto de revisión y `already_recorded` con revisión avanzada incorrectamente. El test exige `UNKNOWN`, journal asentado, cero outcome terminal falso y cero redispatch.
- El contrato del runtime en `src/nexo/core/owner-backed-runtime.mjs` valida que `committed` sea exactamente `expectedRevision + 1` y que `already_recorded` conserve exactamente `expectedRevision`. La revisión ausente, insegura o incoherente no puede convertirse en `completed`.
- El SHA `846f1ca5...` está 34 commits por delante del test SHA `e38556bc...`; la comparación no muestra cambios de código runtime entre ellos. Las diferencias de ese tramo incluyen documentación y expectativas de tests del adaptador de simulación. El PASS completo del HEAD exacto es la evidencia principal; el run `39337387520` es evidencia focal adicional porque ejecutó explícitamente `node tests/nexo/chronicle-runtime.test.mjs`.
- **Alcance de la evidencia:** esto verifica contratos de settlement y regresiones, no autoridad constitucional del propietario ni autorización para efectos protegidos.

**Estado invariable:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima PENDING.

**Siguiente paso M0:** continuar desde la frontera real de provisión independiente de la llave raíz, sin elegir hardware ni implementar un verificador hasta que exista un procedimiento independiente demostrable. Si no existe, registrar el bloqueo concreto. No volver a M1/STEP 7 ni repetir auditorías cerradas.

---

## M0 — coherencia misión/pasos/reconstrucción y admisión inicial (2026-10-19)

- **HEAD de código/pruebas con validación focal:** `f0fcf181778a61c8ad094b315289f5f43c1abe8f`.
- **Suite completa `npm test`: SUCCESS** tanto en ese SHA ([run 39339904741](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904741)) como en el HEAD documental posterior `67407fcf814b396e05db45ff6049b30839fc7508` ([run 39340064494](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340064494)). Las actualizaciones de documentación no cambiaron el código.
- **Admisión/continuidad:** SUCCESS en ese SHA, [run 39339904645](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904645); incluye `continuity-contract.test.mjs` y `continuity-migration.test.mjs`.
- **M0 integrado:** SUCCESS en ese SHA, [run 39339904658](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904658). STEP 4 [run 39339904656](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904656) y STEP 5 [run 39339904735](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904735) también SUCCESS.
- Se probó y revirtió una hipótesis de endurecimiento que prohibía a `owner.recordMission()` admitir pasos con estado `completed`. El workflow [39339816995](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339816995) falló en `continuity-migration.test.mjs:801`: un contrato existente necesita admitir una declaración de paso completado para probar que, sin outcome canónico, la reconstrucción lo bloquea. La regla nueva mezclaba admisión con verificación del outcome; fue retirada junto con sus pruebas temporales. El contrato correcto permanece: las claims persistidas no prueban completion; reconstrucción y gate deben fallar cerrados.
- El cambio no declara misión completada ni habilita efectos protegidos. `loadNexoMissionStatus()` expone desde una única lectura `persistedMissionStatus`, `missionStatus` reconstruido y `statusDiscrepancy`; este último significa diferencia literal, no diagnóstico universal de corrupción. La consulta es de solo lectura y no expone target/content.
- El run específico antiguo de mission-status [39323179028](https://github.com/snowdenxrp/aldea-ia/actions/runs/39323179028) falló en SHA anterior `b97b72d20e762a1ac9d14335120bbe67b72981ba`. La regresión CLI fue ejecutada después dentro de la suite completa e integrada en el HEAD actual `f0fcf181...`, ambos SUCCESS.
- **Siguiente frontera arquitectónica:** el borrador de contrato de raíz única ya incluye el protocolo mínimo en la sección 9 de `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md`. La documentación de ese protocolo pasó `npm test` en SHA `174097b9b1afe8448a1761f5b5e3c2d8c5c620a2`, [run 39340297296](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340297296). Siguiente paso: comprobar si existe una fuente/procedimiento real e independiente para provisionar y verificar el fingerprint de la llave. No elegir hardware ni implementar un verificador hasta que esa evidencia exista; si no existe, registrar el bloqueo. No reabrir la auditoría de status cerrada salvo fallo nuevo.
- **Estado constitucional invariable:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING. Los PASS de tests no prueban autoridad.

---

## M0 — validación de continuidad terminal y suite completa (2026-10-19)

- **CI focal del resultado terminal:** SUCCESS en runtime SHA `85b47f11d82ffbdca70b3a5e327ae97b63ada6e8` y test SHA `e38556bc78487aae117b1c11085aca1731dfbb2e`; cinco workflows completados por cada SHA. El workflow bounded admission [39337387520](https://github.com/snowdenxrp/aldea-ia/actions/runs/39337387520) ejecutó `tests/nexo/chronicle-runtime.test.mjs`.
- **Suite completa `npm test`: PASS observado** en SHA exacto `fd87dfdb2eccd6d356fd970cfa24544568b72833`, run [39338294317](https://github.com/snowdenxrp/aldea-ia/actions/runs/39338294317). Node.js 22; paso `Run tests` SUCCESS.
- La primera ejecución completa falló por expectativas antiguas en `tests/nexo/simulation-adapter.test.mjs`: esperaban `failed` ante un resultado negativo del handler, mientras que el adaptador genérico convierte correctamente esa respuesta en `blocked / EFFECT_OUTCOME_UNKNOWN` porque no existe garantía de no-efecto específica. Se actualizaron ambas expectativas; no se relajó el runtime.
- CI focal adicional de STEP 4 y STEP 5 en el SHA de pruebas final: [39338294321](https://github.com/snowdenxrp/aldea-ia/actions/runs/39338294321) y [39338294311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39338294311); ambos terminaron SUCCESS en el SHA de pruebas final.
- Se modificó el workflow existente `.github/workflows/nexo-deterministic-tests.yml` para ejecutar `npm test` en pushes a `ncs-clean-architecture` además de `main`; commit de activación `69829e9db06f9edab8776f61916db9e34b1133e5`.
- El HEAD `fd87dfdb...` contiene los cambios de prueba y es el SHA exacto del PASS completo. Las actualizaciones de documentación posteriores no cambian el código probado; volver a verificar HEAD al continuar.
- **Estado constitucional sin cambio:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima del propietario PENDING. La suite completa aprobada no demuestra autoridad criptográfica ni habilita efectos protegidos.
- **Siguiente paso:** continuar M0 desde el siguiente contrato verificable; no repetir el arreglo de expectativas, no volver a M1/STEP 7 y no reabrir auditorías cerradas sin evidencia nueva.

---

## M0 — matriz de regresión para respuestas PREPARED malformadas (2026-10-19)

- Matriz documentada: `NEXO_NCS/BUILD/NCS_M0_PREPARED_CONFIRMATION_REGRESSION_MATRIX_2026-10-19.md`, commit `0babe34a63d7f00e1d3e0fd64d33d3bbe17d5290`.
- El runtime bloquea respuestas PREPARED que no sean explícitamente `status: "committed"` y `preparedCommitted: true`; conflicto, UNKNOWN y excepción ya tienen cobertura visible en la prueba focal.
- La inspección estática no encontró casos explícitos para cada respuesta malformada (confirmación sin flag, flag false, revisión ausente/negativa, status inesperado o null). Deben añadirse como regresiones ejecutables.
- Pruebas dinámicas y CI PENDING; no se declara PASS. `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.

---

## M0 — decisión de alcance del recibo PREPARED (2026-10-19)

- Decisión documentada: `NEXO_NCS/BUILD/NCS_M0_PREPARED_RECEIPT_TRUST_DECISION_2026-10-19.md`, commit `a4b6a53baa9c7eb18dfc43b0c97813d7f67b7d73`.
- Para la arquitectura actual, `executePrepared()` es una API interna de composición en una misma base de confianza; no se presenta como sandbox ni como frontera de autorización. Un objeto con campos correctos no prueba la procedencia del PREPARED.
- Criterio M0: probar la composición owner-backed (PREPARED confirmado antes del despacho; ante conflicto/fallo/UNKNOWN, cero despachos; tras resultado ambiguo, sin redispatch automático). La prueba de recibo fabricado solo demuestra la limitación del método de bajo nivel, no un bypass de producción.
- Si se amplía el modelo a consumidores no confiables dentro del mismo entorno, la decisión debe reabrirse y exigirá una frontera de proceso/capacidad real, no un booleano ni un callback del mismo consumidor.
- No se modificó código de ejecución y no se ejecutaron pruebas/CI para esta nota. `authorization: NOT_EVALUATED`; raíz/autoridad PENDING; efectos protegidos STOP; M0 INCOMPLETO.

---

## M0 — precisión del alcance de la ruta legacy de efectos (2026-10-19)

- La auditoría de referencias encontró la definición de `executeLuminaNexoStep()` y su llamada interna a `executeNexoStep()`, además de pruebas y referencias históricas; no encontró un caller de producción actual.
- `scripts/assistants.mjs` planifica/persiste misiones y `scripts/simulate.mjs` persiste el estado de simulación, pero ninguno ejecuta actualmente esos entrypoints de Nexo.
- Corrección de alcance: hay dos APIs/contratos en el repositorio, pero no evidencia de que ambas sean rutas de ejecución de producción activas. La ruta legacy puede mutar simulación si se invoca; no se afirma un bypass de producción observado.
- Auditoría precisada: `NEXO_NCS/BUILD/NCS_M0_LEGACY_EFFECT_PATH_VS_OWNER_BACKED_2026-10-19.md`, commit `3cb28318a35a78a8880556351fef9bf0fb7414db`.
- Próximo foco: comprobar la frontera de la API importable y el recibo PREPARED sin migrar efectos de simulación ni asumir autoridad. Estado estático; tests/CI para cambios recientes PENDING; `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.

---

## M0 — coexistencia de rutas de efecto legacy y owner-backed (2026-10-19)

- Auditoría de llamadas: `NEXO_NCS/BUILD/NCS_M0_LEGACY_EFFECT_PATH_VS_OWNER_BACKED_2026-10-19.md`.
- `executeLuminaNexoStep()` sigue llamando a `executeNexoStep()`, que invoca `adapter.execute()`; los handlers de simulación mutan directamente el objeto de simulación. El journal puede venir de memoria local y `persistPreparedIntent` es opcional.
- La ruta owner-backed es distinta y actualmente sólo admite `chronicle_append`; reparación y otras acciones se bloquean antes de PREPARED/dispatch. Por tanto, no clasificar la ruta legacy como ejecución protegida de Nexo.
- Decisión pendiente: etiquetar legacy como simulación/no protegida o migrar futuras acciones mediante contrato owner-backed después de definir autoridad y frontera de efecto. No migrar todas las acciones ni introducir segundo journal/rollback/retries por conveniencia.
- Estado: brecha estática confirmada; pruebas dinámicas/CI PENDING; `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.

---

## M0 — precisión del modelo de amenazas PREPARED receipt (2026-10-19)

- Nota de decisión pendiente: `NEXO_NCS/BUILD/NCS_M0_PREPARED_RECEIPT_THREAT_MODEL_2026-10-19.md`.
- El test actual fabrica un objeto `preparedCommit` y la API pública del adaptador lo acepta. Esto confirma validación de forma, no procedencia canónica.
- Alcance: brecha de API dentro del mismo proceso; no es evidencia de acceso remoto ni de un bypass de autoridad constitucional. Si el consumidor es no confiable, hace falta una capacidad no accesible a ese consumidor o una frontera de proceso real; si forma parte de la misma base de confianza, documentar la API como interna y validar la composición owner-backed. Un callback controlado por el mismo consumidor no demuestra autenticidad.
- Siguiente paso: inspeccionar los puntos de creación/consumo de adaptadores y fijar el modelo de amenazas antes de tocar código. No añadir otro journal ni infraestructura incidental.
- Estado: decisión de arquitectura y regresión PENDING; `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.

---

## M0 — frontera de confianza del recibo PREPARED canónico (2026-10-19)

- **Decisión de alcance aceptada y documentada:** [NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md](DECISIONS/NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md).
- El hallazgo estático original sigue siendo cierto: `createEffectAdapter().executePrepared()` valida campos ordinarios de `preparedCommit`, pero esos campos no demuestran procedencia canónica. La prueba de bajo nivel que fabrica un recibo no debe describirse como una vulnerabilidad remota ni como una elusión de autorización constitucional.
- Para el prototipo actual, el adaptador y su consumidor pertenecen a la misma base de confianza. Esa API **no es una sandbox** contra código JavaScript arbitrario con acceso al adaptador/proceso; impedir sólo el recibo fabricado no crearía una frontera real porque el consumidor puede acceder a otras operaciones del adaptador.
- **Disposición:** no añadir otro booleano/campo de autenticidad, callback auto-verificador, segundo journal ni envoltura transaccional cosmética. No cambiar runtime por este hallazgo. Si se introduce código consumidor no confiable, detener expansión y diseñar una frontera real de proceso/capacidad con nuevo modelo de amenazas.
- La composición owner-backed sigue siendo el contrato que debe verificarse: reconstrucción canónica → PREPARED confirmado por owner → dispatch → lineage/reconciliación/settlement → outcome terminal. Sus tests no demuestran raíz legítima ni autorización constitucional.
- Auditoría: [NCS_M0_CANONICAL_PREPARED_RECEIPT_TRUST_BOUNDARY_AUDIT_2026-10-19.md](BUILD/NCS_M0_CANONICAL_PREPARED_RECEIPT_TRUST_BOUNDARY_AUDIT_2026-10-19.md). Revisión complementaria de settlement: [NCS_M0_TERMINAL_OUTCOME_REVISION_AUDIT_2026-10-19.md](BUILD/NCS_M0_TERMINAL_OUTCOME_REVISION_AUDIT_2026-10-19.md).
- Esta actualización corrige el estado anterior de este bloque: la decisión de alcance ya está tomada; no debe quedar marcada como corrección de runtime pendiente. No se atribuye CI nuevo a estos commits documentales.
- **Estado constitucional invariable:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN. La provisión independiente de la raíz continúa siendo un bloqueo separado.

---

## M0 — normalización de rutas padre no disponibles en ambos almacenes (2026-10-19)

- Hallazgo: la normalización de ruta padre ausente cubría `initialize()`, pero no las operaciones mutables `Continuity.commitIfCurrent()` y `Chronicle.append()`. La adquisición del lock ocurría fuera de una captura y podía dejar escapar el error del sistema operativo.
- Corrección Continuity: commit `23d9567c90a2997353ae54d6ba6bbd79c8f663a9`; si la adquisición del lock falla por padre ausente, devuelve `failed / NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE` antes de mutar. Otros errores de lock siguen propagándose para no alterar el contrato existente de recuperación de lock obsoleto.
- Corrección Chronicle: commit `c13c56e7aff03fe4ec2b9f5fe4a585473e1822cb`; ante padre ausente devuelve `blocked / NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE` antes de escribir. Los errores de lock distintos de ENOENT/ENOTDIR mantienen el comportamiento previo.
- Regresiones: Continuity `857e6f2951eb524bbbb687ba2c22e2db4642cf43`; Chronicle `26a6ec60f8bdf1201d3a9c90ae45732931f08b96`. Comprueban los resultados estructurados en las operaciones mutables sin depender del código OS.
- Validación: archivos publicados y lectura posterior pendiente de terminar; ejecución local/CI no observada. No declarar PASS.
- Límite: solo normaliza el fallo previo a escritura; no convierte dos almacenes en una transacción atómica ni prueba autoridad legítima. `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.

---

## M0 — frontera pública del runtime ante excepciones inesperadas (2026-10-19)

- Hallazgo: `executeNexoStepWithContinuityOwner()` llamaba al runtime interno sin una última frontera de captura. Una excepción inesperada de una comprobación inyectada (por ejemplo, `adapter.supports()`) podía escapar del contrato público.
- Corrección: `src/nexo/core/owner-backed-runtime.mjs`, commit `2aabf83753d66e7a25780cf13c46238d9fcac617`. Antes de la frontera de despacho, la excepción inesperada se convierte en `blocked / NEXO_RUNTIME_INTERNAL_FAILURE`; después de marcar el inicio del despacho, se convierte conservadoramente en `unknown / NEXO_RUNTIME_OUTCOME_UNKNOWN`, con redispatch desautorizado. No se exponen mensajes internos de excepción.
- Regresión: `tests/nexo/chronicle-runtime.test.mjs`, commit `55d2c1b11b3bbda1abf42677636d279ebce84187`. Comprueba que una excepción de capability-check no escapa, no alcanza PREPARED ni despacho y no filtra el mensaje.
- Evidencia de ejecución: todavía no observada para estos commits. El cambio y la prueba están publicados en la rama; no declarar PASS hasta revisar CI o ejecutar las pruebas en un entorno real.
- Límite: esto normaliza fallos inesperados del runtime, no implementa autorización del propietario. `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 global INCOMPLETO.

---

## Siguiente diseño M0 — inventario de claims y dominios de fallo de autoridad

- Nuevo inventario: `NEXO_NCS/BUILD/NCS_M0_DEPLOYMENT_CLAIM_FAILURE_DOMAIN_INVENTORY_2026-10-19.md` (commits `194c6b8868e4632dfb909b14112ca19f10e28fe6` and `5aeb504d0d324030f0db2966c54bdb59cfdda5fd`), con afirmaciones delimitadas C0–C8, nivel de evidencia, fallos comunes y obligaciones de frontera.
- El contraste con los contratos existentes encontró que el primer borrador de composición duplicaba estados: se corrigió para reutilizar `ESTABLISHED / UNKNOWN / INVALID` del contrato bootstrap, `AUTHORITY_UNAVAILABLE / AUTHORITY_UNRESOLVED` de la investigación de recuperación y la distinción `STALE / REVOKED` de AB105.078R. No se crea un enum agregado.
- Contrato revisado: `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md`, corrección commit `c83a864232793e963a7a99fb88fc313f4f1a48ca`.
- Comparación preliminar: `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_RECOGNITION_FAMILY_COMPARISON_PRELIMINARY_2026-10-19.md` (commit `d8108ae84d965dce0b3008f7aed56a22ca3f32f5`). No promueve ninguna familia; confirma que falta evidencia de un soporte independiente de recuperación y de la frontera final de ejecución.
- **Nueva decisión de alcance aceptada:** `NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md`, commit `f6894c51b5a0aa1ced848ab1481ecd40ab995d5d`. Una llave será la raíz criptográfica de arranque y se construirá primero para un solo dispositivo; recuperación tras pérdida irrecuperable de la llave, multi-dispositivo y sucesión quedan fuera de la primera fase. La llave no autoriza por sí sola cada efecto protegido.
- La comparación de familias de raíz queda como referencia de riesgos, no como bloqueo que exija más investigación general. La llave física/modelo y su protocolo no se consideran adquiridos ni seleccionados todavía.
- **Verificación posterior de CI para la consulta canónica:** el fix `82f1204ae4e9298163231ab7a323233ad87777b8` es ancestro directo del SHA integrado `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae` (comparación GitHub: 28 commits adelante, 0 detrás; el diff no cambia `continuity-queries.mjs` ni `tests/nexo/entrypoint.test.mjs`). El run integrado [39292887874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887874) ejecutó `tests/nexo/entrypoint.test.mjs` dentro del paso `Chronicle store, runtime, and public entrypoints` y terminó SUCCESS. Por tanto, AC1 tiene PASS observado en ese SHA integrado para la regresión presente, además del run específico `39265121361` sobre el SHA del fix. No hace falta repetir la misma prueba sólo para obtener un segundo workflow con nombre distinto.
- **Siguiente paso de construcción:** no reabrir la discrepancia ya cubierta. Continuar M0 por la siguiente brecha real de coherencia/runtime identificada en el código y sus contratos, sin tocar autoridad como si ya estuviera implementada. No reabrir STEP 7 ni repetir el análisis de familias como condición previa.
- CI integrado observado: run `39292887874`, SHA probado `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`; los commits posteriores citados aquí son documentales. M0 INCOMPLETO; efectos protegidos STOP.

---

## M0 — verificación final de transparencia de autoridad (2026-10-19)

- La revisión detectó y cerró dos omisiones en resultados públicos Chronicle: el resultado normalizado, los rechazos tempranos y el conflicto de admisión deben conservar `authorization: "NOT_EVALUATED"` mientras no exista evaluación de autoridad.
- Implementación: `src/nexo/application/chronicle-append.mjs`, commit `2faf2b988c676dc907c9322f5e63be36200af97b` (visibilidad en conflicto, sobre la corrección inicial `aa8509e75dd7925189d54b2667bcdd2ae27e6647`).
- Regresión: `tests/nexo/chronicle-runtime.test.mjs`, commit `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`; verifica resultado desconocido normalizado, datos malformados, rechazo temprano y settlement local completado.
- **CI integrado PASS:** [run 39292887874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887874), SHA exacto `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`; job `Nexo M0 contracts on one SHA` SUCCESS, con los cinco grupos de pruebas SUCCESS. Chronicle específico [run 39292887749](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887749) también SUCCESS en el mismo SHA.
- **Límite:** la transparencia se corrigió; no se creó ni evaluó una raíz constitucional. Settlement local no significa autorización. Raíz/composición PENDING; efectos protegidos STOP; M0 global INCOMPLETO.

---

## M0 — autoridad no evaluada debe permanecer visible en la API pública (2026-10-19)

- Hallazgo: `publicChronicleResult()` normalizaba el resultado sin exponer `authorization: "NOT_EVALUATED"`; el helper de rechazo temprano también lo omitía. Eso podía esconder del consumidor la diferencia entre settlement local y autorización del propietario.
- Corrección en `src/nexo/application/chronicle-append.mjs`, commit funcional `aa8509e75dd7925189d54b2667bcdd2ae27e6647`: los resultados públicos normalizados y los rechazos tempranos declaran explícitamente `authorization: "NOT_EVALUATED"`. No se implementó ni simuló una raíz de autoridad.
- Regresión en `tests/nexo/chronicle-runtime.test.mjs`, commit `dbced55ae0f345a7677b5df4b598631ec0d78ed8`, que exige la marca explícita en el resultado normalizado y el caso de datos malformados.
- CI integrado: [run 39292627540](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292627540), job `Nexo M0 contracts on one SHA`, PASS en SHA exacto `dbced55ae0f345a7677b5df4b598631ec0d78ed8`; cinco grupos de pruebas SUCCESS. Workflow Chronicle específico run 39292627699 también SUCCESS en el mismo SHA.
- Alcance: este PASS valida las regresiones enumeradas; no prueba raíz constitucional ni autorización legítima. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

---

## M0 — corrección de la integración con la función pura de reconstrucción (2026-10-19)

- Revisión posterior al primer commit detectó una diferencia de API: `reconstructNexoMissionFromSnapshot()` devuelve la misión reconstruida directamente (o `null`), no un wrapper `{ status, mission }`. Se corrigió el consumidor en `continuity-queries.mjs` antes de declarar validada la implementación.
- Commit correctivo: `82f1204ae4e9298163231ab7a323233ad87777b8`.
- El workflow específico de la regresión incluye `continuity-queries.mjs` en sus paths, por lo que este commit debe activar el job. El resultado de Actions aún no se ha observado; test local tampoco ejecutado.
- No marcar PASS hasta revisar el run real y el SHA probado.
- M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

---

## M0 — consulta de misión informa estado persistido y reconstruido (implementación pendiente de CI, 2026-10-19)

- Cambio en `src/nexo/application/continuity-queries.mjs`: `loadNexoMissionStatus()` carga el snapshot una sola vez y deriva de esa misma revisión el estado almacenado y el reconstruido. La respuesta ahora incluye `persistedMissionStatus` y `statusDiscrepancy` junto al `missionStatus` reconstruido.
- Si la misión no existe, la consulta responde `not_found` con la revisión leída. La ruta no escribe en el store ni añade target/content a la salida.
- Regresión añadida en `tests/nexo/entrypoint.test.mjs`: misión almacenada `completed` con paso `planned`; comprueba que ambos estados y la discrepancia se informan, que el contenido privado no aparece y que el archivo queda byte-por-byte igual.
- Se añadió `.github/workflows/nexo-m0-mission-status.yml` para ejecutar esa regresión al cambiar el query, operaciones de continuidad, store, test o workflow en la rama `ncs-clean-architecture`.
- Commits secuenciales de este cambio: query `ff343a09a5678dcce18535de6901940ec274d3c5`; test `d1396cd110a01a9547209b58626a52cbc7b6bd97`; workflow `4b6423404d5ad2e901e3b3eccb5db6e2140ee492`. Los commits documentales posteriores pueden mover HEAD.
- **Estado de validación:** código, test y workflow están en la rama; no se dispone aquí de resultado observado del nuevo run ni se ha ejecutado el test localmente. No marcar PASS hasta revisar el run real.
- M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

---

## M0 — la consulta pública de misión oculta el estado persistido (2026-10-19)

- Se completó el seguimiento de la auditoría anterior. `loadNexoMissionStatus()` llama a `owner.reconstructMission()` y devuelve `missionStatus` calculado, pero no expone el `mission.status` almacenado en el mismo snapshot.
- Por eso, si una misión persistida como `completed` tiene un paso `planned` y no tiene outcome canónico que lo explique, la reconstrucción puede proyectarla como `planned`; el runtime de ejecución, en cambio, consulta el estado persistido y bloquea porque no es `planned`. La CLI no muestra la diferencia al operador.
- Esto no demuestra que pueda ocurrir un dispatch protegido: el gate owner-backed revisado bloquea la nueva ejecución. Sí demuestra una discrepancia de observabilidad en el comando público `mission-status`.
- **Siguiente cambio candidato:** hacer que la consulta exponga ambos valores desde una misma lectura canónica (estado persistido y estado reconstruido), con un indicador explícito cuando difieran; no usar el campo descriptivo `objective` como autoridad. Añadir regresión CLI para misión almacenada `completed` con step `planned`, y verificar que la consulta no modifica el archivo ni filtra `target/content`. Evitar doble lectura para no introducir una carrera entre estados.
- Aún no se cambió código ni se ejecutó CI para esta observación.
- M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

---

## M0 — auditoría de coherencia mission.status / steps / objective (2026-10-19)

- Se inspeccionó `missionRecord()`, `reconstructNexoMissionFromSnapshot()`, el gate de `executeNexoStepWithContinuityOwner()`, la admisión de `runNexoChronicleAppend()` y las regresiones actuales.
- **Hallazgo concreto:** `missionRecord()` admite estados de misión válidos individualmente aunque contradigan los estados de sus pasos. Ejemplo estructuralmente admitido: misión `completed` con paso `planned`. La reconstrucción recalcula el estado desde pasos/outcomes y puede devolver `planned`, mientras el runtime consulta también el estado almacenado y bloquea nuevas ejecuciones si no es `planned`. Esto crea una discrepancia de lectura/proyección; en la ruta owner-backed revisada no demuestra un bypass de ejecución.
- `objective` es texto descriptivo libre en los productores (p. ej. “preserve continuity”) y la reconstrucción lo sustituye por un objetivo operativo derivado. No debe tratarse como autorización ni limitarse a un enum sin revisar contratos y consumidores.
- **Decisión de esta auditoría:** no imponer todavía una regla nueva ni tocar runtime. Falta definir si los estados persistidos no-`planned` en una misión recién admitida son inválidos, o si se aceptan por compatibilidad y la reconstrucción debe exponer explícitamente la contradicción. Primero inspeccionar `loadNexoMissionStatus()` y consumidores CLI para determinar el alcance de la discrepancia.
- No se cambiaron código ni pruebas y no se ejecutó CI en este checkpoint. No atribuirle un PASS.
- **Siguiente paso exacto:** revisar `src/nexo/application/index.mjs` y los scripts de status para verificar qué estado se presenta al operador; después escribir una regresión que compare estado persistido vs reconstruido y elegir la corrección mínima basada en esa evidencia.
- M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

---

## M0 — misión persistible y gate de ejecución canónico (2026-10-19)

**Punto de entrada:** rama `ncs-clean-architecture`; SHA de código+pruebas validado `d4544e74e8568cf7d5221ccbc42e48daacd1e9f5`. Consultar HEAD vivo después de los commits documentales.

### Cambios reproducidos e integrados
1. **Datos persistibles:** CI reprodujo que un `target` función se admitía. Se rechazan funciones, símbolos, bigint/undefined proyectados, números no finitos, ciclos, arrays sparse y propiedades extra de arrays.
2. **Contrato de misión:** `step.action` debe ser string no vacío; `mission.status` y `step.status` deben pertenecer al vocabulario ya emitido/consumido. Nullish conserva el default `planned`; no se añadieron estados nuevos.
3. **Sin commit inválido:** pruebas owner-level verifican que entradas inválidas no avanzan la revisión canónica.
4. **Readiness gate:** antes de un nuevo PREPARED/dispatch, el runtime exige que el estado almacenado de la misión sea `planned`, y que la reconstrucción canónica marque misión/paso como `planned` y dependencias como `completed`. Una misión almacenada como `blocked` no puede reactivarse porque la reconstrucción encuentre un paso planificado.
5. **Recuperación:** las obligaciones ya presentes en el journal conservan la ruta de recuperación antes del gate de nuevo dispatch.

### CI final — SUCCESS en `d4544e74e8568cf7d5221ccbc42e48daacd1e9f5`
- [Bounded admission/runtime 39210288131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210288131)
- [STEP 4 39210288085](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210288085)
- [STEP 5 39210288034](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210288034)
- [Crash cuts 39210287996](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210287996)
- [Chronicle native vertical 39210287994](https://github.com/snowdenxrp/aldea-ia/actions/runs/39210287994)
- PRs integrados: [#99](https://github.com/snowdenxrp/aldea-ia/pull/99), [#100](https://github.com/snowdenxrp/aldea-ia/pull/100), [#101](https://github.com/snowdenxrp/aldea-ia/pull/101), [#102](https://github.com/snowdenxrp/aldea-ia/pull/102), [#103](https://github.com/snowdenxrp/aldea-ia/pull/103), [#104](https://github.com/snowdenxrp/aldea-ia/pull/104), [#105](https://github.com/snowdenxrp/aldea-ia/pull/105).

### Siguiente frontera concreta
Auditar consistencia entre `mission.status`, estados de pasos y `objective`. Verificar si combinaciones imposibles pueden entrar al snapshot y alterar la reconstrucción. Leer productores/consumidores y reproducir primero; no imponer invariantes nuevos por intuición.

### Límites
Esto valida admisión y readiness para el runtime owner-backed actual de Chronicle. No demuestra autoridad constitucional legítima ni habilita settlement genérico o efectos protegidos. **M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.**
---

## M0 — rechazo de dependencias sparse (2026-10-19)

- Test SHA: `3683e4708e5ff97b65fb7b0fe0cd6f154a732745`; fix funcional: `360b0dafbebc700477bc30879ef4175da81c904b`.
- Se reprodujo que `dependsOn: new Array(1)` esquivaba `.some()` y terminaba en un `TypeError` durante el recorrido de dependencias. `missionRecord()` ahora valida los índices reales y rechaza también un hueco ocultado por una propiedad extra del array.
- SUCCESS: bounded admission [39197992970](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992970), STEP 4 [39197992902](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992902), STEP 5 [39197992893](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197992893); crash cuts con el mismo código [39197974984](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197974984).
- Siguiente frontera: probar si funciones/símbolos/ciclos/valores numéricos no finitos pueden atravesar mission admission; no tocar el helper global sin reproducción y revisión de compatibilidad.
- M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

## M0 — validación de input anidado de misión (2026-10-19)

- Test SHA actual: `bceabad2e1f62a23ba7586ba27b2977841d6b778`; código funcional permanece en `82826e12bfd88c07aeabda05f6a14605f85bda33`.
- `assertContractInput(mission)` recorre la estructura con descriptores de datos antes de que `missionRecord()` lea `missionId`, steps, target o dependencias. Se añadió una regresión para un getter en `step.target`: debe rechazarse como `NEXO_MISSION_CONTEXT_INVALID` sin ejecutar el getter.
- SUCCESS: bounded admission/restart [39197679061](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197679061), STEP 4 [39197679021](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197679021), STEP 5 [39197678998](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197678998). Crash cuts SUCCESS en el código+tests previos `82826e...` [39197558507](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197558507); este checkpoint sólo añade una prueba de input a `continuity-contract.test.mjs`.
- **Siguiente frontera:** comprobar si mission admission rechaza valores que no son datos persistibles (p. ej. funciones, símbolos, ciclos) con un resultado estructurado, antes de intentar CAS/escritura. Primero una reproducción aislada; no cambiar el helper global sin medir compatibilidad.
- M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

## M0 — journal replay exige identidad completa; misión rechaza accessors (2026-10-19)

- Último SHA código+pruebas: `82826e12bfd88c07aeabda05f6a14605f85bda33`.
- Reconstrucción fail-closed: un `effectJournal` con estado desconocido, propietario inexistente, step huérfano o identidad `action/target` que no coincide ya no se ignora para dejar la misión ejecutable. Regresiones cubren estado desconocido asociado, estado desconocido huérfano, settlement Chronicle con step inexistente y registro Chronicle con los mismos IDs pero action/target distintos.
- El nuevo test de identidad mismatch pasó en el SHA final. El test previo del settlement huérfano falló antes del fix (el `blockReason` no existía porque el registro se ignoraba) y pasó después. No fue un fallo de CI ocultado: se usó como reproducción red-green.
- También se cerró un hueco de entrada: `missionRecord()` ejecuta `assertContractInput` antes de leer `mission.missionId`; un getter caller-supplied se rechaza como `NEXO_MISSION_CONTEXT_INVALID` sin ejecutarse. El primer test de esa condición falló antes del guard y pasó después.
- CI SUCCESS en SHA `82826e12bfd88c07aeabda05f6a14605f85bda33`: bounded admission/restart [39197558462](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197558462), STEP 4 [39197558524](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197558524), STEP 5 [39197558514](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197558514), crash cuts [39197558507](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197558507). El guard de input también pasó en el SHA previo `24e44be7828563661a172e351828cb2892a70b11`: bounded admission 39197548004, STEP 4 39197547919, STEP 5 39197547877 y crash cuts 39197547897.
- **Siguiente frontera:** revisar la admisión de misiones con inputs anidados (steps/target/dependsOn) y confirmar que los guards de contrato se ejecutan antes de cualquier getter o traversal caller-supplied; ampliar sólo si existe un caso concreto y sin duplicar el guard de `missionRecord()`.
- M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina; STEP 7 OPEN / STOP / UNKNOWN.

## M0 — reconstrucción bloquea estados de effectJournal desconocidos, huérfanos o desanclados (2026-10-19)

- Hallazgo reproducido: un registro `effectJournal` con estado no reconocido podía ser ignorado y dejar la misión en `planned`; un `settled_observed` de Chronicle apuntando a un step inexistente también podía quedar fuera del filtrado por paso. En ambos casos el snapshot legacy pasaba la validación estructural y la reconstrucción no asociaba el registro con un paso ejecutable.
- Corrección en `src/nexo/core/continuity-operations.mjs`: estados de journal desconocidos asociados a la misión bloquean su reconstrucción; registros con estados reconocidos pero sin misión propietaria, huérfanos, o cuyo step/action/target no coincide bloquean la misión antes de procesar intentos. No se rechaza indiscriminadamente todo snapshot legacy ni se añade un nuevo estado de ejecución; se usa `blocked` y se preserva la evidencia para reconciliación.
- Regresiones en `tests/nexo/continuity-migration.test.mjs`: (1) estado de journal desconocido para un step; (2) estado desconocido huérfano de otra misión; (3) settlement Chronicle `settled_observed` con step inexistente. El tercer test falló antes del fix con `blockReason.code === undefined`, confirmando que la entrada se ignoraba; tras el fix, pasó.
- CI SUCCESS en SHA código+pruebas `e31547f17764c18fd0bf2fe39dab1ebfc5748686`: bounded admission/restart [39197251854](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197251854), STEP 4 [39197251843](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197251843), STEP 5 [39197251835](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197251835), crash cuts [39197251844](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197251844). La ejecución roja de la regresión previa fue el test-first esperado y quedó corregida en el SHA final; no ocultar esa secuencia.
- Alcance: protege la reconstrucción contra registros de efecto que de otro modo desaparecerían de la vista canónica. No autentica provenance, no prueba causalidad externa ni implementa el goal verifier.
- **Siguiente frontera:** auditar la coherencia de identidad al reconstruir outcomes terminales no-Chronicle (attempts completed con acción/target correctos pero evidencia o vínculo de journal insuficiente). Usar tests existentes de completion/legacy; no crear un goal verifier ficticio ni promover claims a autorización.
- M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina; STEP 7 OPEN / STOP / UNKNOWN.

# Puerta de entrada NCS — estado M0

## M0 — identidad canónica y estados de journal desconocidos bloquean la reconstrucción (validado 2026-10-19)

- Identidad de misión: la admisión rechaza IDs de misión/paso con separadores `:` y pasos duplicados; el contrato de snapshot también rechaza identidades persistidas de misión/paso duplicadas antes de reconstruirlas. Esto evita colisiones de la clave `missionId:stepId`.
- Estado de journal: la reconstrucción bloquea si encuentra estados de `effectJournal` no reconocidos. También bloquea cuando una entrada desconocida está huérfana (missionId no corresponde a ninguna misión) o su identidad no se puede asociar de forma segura; no se ignora el registro para permitir que otra misión siga ejecutándose.
- Evidencia Chronicle: el outcome acepta exactamente `verified/kind/source/observedRevision`; source/revision se ligan al settlement. Claims extra o desatadas e identidades de outcome distintas se bloquean. La forma de settlement evidence se revisó: sus campos extra no participan en decisiones ni resultados públicos; no se amplió el contrato por especulación.
- PREPARED: la misión y el paso deben ser `planned` en la reconstrucción para admitir un nuevo PREPARED; un PREPARED pendiente bloquea nuevos pasos de la misma misión. Repetir la misma identidad después de reinicio conserva `prepared_existing / NEXO_EFFECT_OUTCOME_UNKNOWN`, una sola entrada de journal y ninguna autorización de redispatch.
- Fallos de lectura: owner write paths y runtime bloquean ante `store.loadCurrent()` fallido, sin commit ni dispatch.
- Código funcional más reciente: `33b23a87fe51b80007943cbc28cffd3883e99a19`; SHA final de código+pruebas: `a2bd5ba8cdfdbb4f2129337a13c071b7d18b47d3`. SUCCESS en el SHA final: bounded admission/restart [39197181542](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197181542), STEP 4 [39197181545](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197181545), STEP 5 [39197181644](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197181644), crash cuts [39197181585](https://github.com/snowdenxrp/aldea-ia/actions/runs/39197181585). Los cambios recientes de identidad y journal desconocido están cubiertos por estos runs; no afirmar que todos los workflows del repositorio se ejecutaron.
- Límite global: M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina. Coherencia estructural no equivale a autenticación, causalidad ni autorización.

**Siguiente frontera (auditoría antes de cambios):** inspeccionar el grafo `dependsOn` de misiones persistidas: self-dependencies, IDs inexistentes, referencias duplicadas y ciclos. Confirmar cómo se bloquean hoy y si alguna forma puede resultar ejecutable por reconstrucción; no inventar scheduler, estados o replanificación.

## M0 — fallos de lectura de continuidad bloquean escritura y despacho (2026-10-19)

- Se cerró la brecha de consistencia en `recordPrepared()`, `recordExecutionLineage()` y `recordOutcome()`: los errores de `store.loadCurrent()` se normalizan a `status: "blocked"`, `uncertainty: "continuity_read_failed"`, autorización no evaluada y flags de commit/settlement falsos. No se llama `commitIfCurrent()`.
- Regresión unitaria en `tests/nexo/continuity-contract.test.mjs`: las tres rutas devuelven bloqueado con el código original del error y cero escrituras.
- Regresión de runtime en `tests/nexo/chronicle-runtime.test.mjs`: falla la segunda lectura, justo en admisión PREPARED; resultado bloqueado, `dispatchAttempted=false`, `preparedCommitted=false`, cero commits y cero llamadas al adapter. Esto prueba el límite de proceso, no solo el método del owner.
- CI SUCCESS en el SHA actual `d200472052b3795b2b7e6ab7d1cd4fae5e71ae91`: Chronicle native [39196910123](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196910123), bounded mission admission/restart [39196910131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196910131), STEP 4 [39196910145](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196910145), STEP 5 [39196910180](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196910180). Las pruebas focales de lectura fallida están incluidas en esos workflows; no afirmar validación de todos los workflows del repositorio.
- Se mantiene el fix previo: un resultado Chronicle terminal solo se acepta/reconstruye si su evidencia coincide con el settlement persistido; los campos estructurales comprueban coherencia, no autenticidad criptográfica ni autorización constitucional.
- **Siguiente frontera:** continuar M0 en la reconstrucción canónica de estado tras recuperación; revisar si un snapshot con un `effectJournal` genérico terminalmente inconsistente puede hacer ejecutable un paso, reutilizando tests existentes. No reabrir el contrato Chronicle/read-failure sin una nueva reproducción.
- Estado global: M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — evidencia Chronicle tiene forma canónica cerrada (validado 2026-10-19)

- Nueva regresión: evidencia de outcome con source/revisión correctos pero un campo extra no vinculado (`authorityClaim`) se intentaba persistir y reaparecía en `step.result`. El contrato ya definía cuatro campos canónicos para outcome Chronicle; el helper compartido ahora exige exactamente `verified`, `kind`, `source`, `observedRevision`, sin claves adicionales.
- La validación exacta se aplica tanto al writer como a la reconstrucción. Se mantiene el positivo: outcome con forma exacta y source/revisión iguales al settlement reconstruye `completed`. El test de runtime también comprueba que la evidencia producida realmente contiene sólo esas cuatro claves.
- HEAD código+tests: `d4936c965eb926b3e61eb7ecbe3f9becf58925ca`. SUCCESS: bounded admission/restart [39196697574](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196697574), Chronicle native [39196697543](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196697543), STEP 4 [39196697516](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196697516), STEP 5 [39196697496](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196697496). Crash cuts y continuidad también SUCCESS con el mismo código en test SHA `37b7a04096f39c3c33033655ca9472b1856412cd`: [39196672091](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196672091), [39196672112](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196672112).
- Límite: la forma cerrada evita campos de claim no vinculados; no autentica criptográficamente la procedencia. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Siguiente frontera:** integrar la regresión de lectura fallida con `executeNexoStepWithContinuityOwner()`: si `recordPrepared()` devuelve blocked por continuidad ilegible, verificar que no se invoque el adapter ni se intente retry/redispatch. Prueba aislada, sin runtime legacy.


## M0 — shape de evidencia terminal Chronicle queda cerrado (validado 2026-10-19)

- La evidencia del outcome Chronicle ahora acepta exactamente cuatro claves: `verified`, `kind`, `source`, `observedRevision`. El tipo debe ser `nexo-chronicle-persisted-invariant`, y source/revision deben coincidir con el settlement canónico validado. Claims adicionales no ligados al settlement se rechazan con `NEXO_CHRONICLE_OUTCOME_EVIDENCE_MISMATCH`.
- Reconstrucción usa el mismo helper: evidence desatada deja el paso blocked sin result; target/action incompatibles quedan `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`; settlement+outcome canónicos coincidentes siguen reconstructing completed. La prueba del runtime real confirma que el outcome generado tiene el shape exacto.
- SHA funcional: `4a976b76ece07e1c168761cb6bd29ec5b420ab00`; SHA final de código+pruebas `d4936c965eb926b3e61eb7ecbe3f9becf58925ca`. SUCCESS en SHA final: bounded admission/restart [39196697574](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196697574), Chronicle native [39196697543](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196697543), STEP 4 [39196697516](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196697516), STEP 5 [39196697496](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196697496). Crash cuts SUCCESS en SHA funcional `4a976...` [39196649127](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196649127); la última prueba de shape no cambió runtime/código.
- Límite: coherencia estructural de evidencia, no autenticación criptográfica, causalidad ni autorización. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Siguiente frontera:** inspeccionar si la evidencia de settlement Chronicle se consume fuera de la reconstrucción y si su shape debe ser igual de estricto. No ampliar el contrato si los campos extra no afectan ninguna decisión ni resultado público.


## M0 — outcome Chronicle ligado al settlement; errores de lectura normalizados (validado 2026-10-19)

- Hueco 1 reproducido en CI: con settlement Chronicle válido, `recordOutcome()` aceptaba una claim `completed` cuya evidencia declaraba `source` y `observedRevision` distintos de los asentados. El test falló con `committed` donde debía bloquear.
- Corrección: `isValidNexoChronicleOutcomeEvidence()` valida que el outcome tenga `verified === true`, kind canónico `nexo-chronicle-persisted-invariant`, source igual al settlement y observedRevision igual al settlement. `recordOutcome()` bloquea el desacople con `NEXO_CHRONICLE_OUTCOME_EVIDENCE_MISMATCH`. La reconstrucción aplica el mismo contrato: evidencia histórica despegada del settlement queda `blocked` con ese código; target/action distintos se clasifican como `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`. Se cubren los casos negativo y positivo de evidencia ligada.
- Hueco 2 reproducido: `recordPrepared()`, `recordExecutionLineage()` y `recordOutcome()` dejaban escapar una excepción si fallaba el read inicial de `store.loadCurrent()`, a diferencia de `recordMission()` y `reconcilePrepared()`. La regresión falló en CI con `TEST_CONTINUITY_READ_FAILED` propagado. Ahora devuelven `blocked`, código del error o `NEXO_CONTINUITY_LOAD_FAILED`, incertidumbre `continuity_read_failed` y marcadores de no-commit; la prueba confirma cero llamadas a `commitIfCurrent`.
- Último SHA código+tests: `9ca094242d25fced843b7d5595f9cff6e0d82ee3`; último cambio funcional en el árbol: `862f660e7f54412a23c62b6b8619e28445925524`. SUCCESS en SHA de prueba: bounded admission/restart [39196527692](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196527692), STEP 4 [39196527671](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196527671), STEP 5 [39196527814](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196527814), crash cuts [39196527776](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196527776). El conjunto de seis workflows pasó en SHA `56abe3375aefa89d77085eb33a8487a5c2c468fd` tras el fix de escritura y errores de lectura; después, las pruebas de reconstrucción de evidencia ligada/desligada pasaron en los cuatro workflows listados.
- Límite: la consistencia source/revision es un control estructural, no autenticación criptográfica de procedencia. No autoriza efectos externos ni completa goal verification general. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Siguiente frontera:** comprobar el paso de los resultados de lectura fallida a través de `executeNexoStepWithContinuityOwner()`: una admisión bloqueada por continuidad ilegible debe impedir cualquier llamada al adapter y no disparar retry/redispatch. Añadir prueba de proceso/owner aislado antes de tocar el runtime.


## M0 — Chronicle outcome queda ligado a settlement canónico (validado 2026-10-19)

- Hueco reproducido: con un `settled_observed` válido, `recordOutcome()` aceptaba metadata de outcome `verified/kind/source/observedRevision` que no coincidía con el settlement. También la reconstrucción clasificaba una claim completed con identidad distinta como si sólo faltara replay del outcome.
- Contrato compartido nuevo en `src/nexo/core/chronicle-settlement-contract.mjs`: `isValidNexoChronicleOutcomeEvidence()` exige el tipo de evidencia Chronicle definido, `source` y `observedRevision` iguales al settlement validado. `recordOutcome()` bloquea metadata desatada con `NEXO_CHRONICLE_OUTCOME_EVIDENCE_MISMATCH`; reconstrucción no completa el paso y clasifica aparte evidencia desatada e identidad de operación incorrecta.
- Regresiones: (1) owner rechaza source/revision fabricados sin avanzar revisión ni añadir attempt; (2) reconstrucción de attempt con evidencia desatada bloquea y no devuelve el result; (3) attempt Chronicle con target distinto se clasifica `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`; (4) settlement y outcome canónicos coincidentes siguen reconstruyendo completed.
- SHA funcional validado: `c9be5ee5f931d2a873cca32e2dd0b81c33010396`; SHA final de código+pruebas `9ca094242d25fced843b7d5595f9cff6e0d82ee3`. SUCCESS: bounded admission/restart [39196527692](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196527692), crash cuts [39196527776](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196527776), STEP 4 [39196527671](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196527671), STEP 5 [39196527814](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196527814). El commit final sólo añadió la prueba positiva del evidence binding; el fix funcional ya estaba presente en `c9be5ee...`.
- Límite: consistencia estructural de metadata, no autenticación criptográfica ni procedencia autenticada. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Frontera posterior:** auditar el uso de `settlement.evidence` fuera del helper; decidir si el shape estricto tiene impacto real antes de tocarlo.


## M0 — Chronicle terminal outcome reconstructs after response loss (validated 2026-10-19)

- La prueba real de `tests/nexo/chronicle-runtime.test.mjs` simula pérdida de respuesta después del commit de `recordOutcome()`, reabre el owner y ejecuta la recuperación sin un segundo append. Se añadió una aserción directa sobre la reconstrucción canónica tras reabrir.
- Resultado esperado/observado: la misión se reconstruye con `status: reconstructed`, el paso Chronicle queda `completed` porque hay settlement válido y outcome terminal persistidos, pero la misión global queda `awaiting_verification`; completar un paso no prueba el objetivo global. El runtime vuelve a `completed` sin despacho adicional y el contador de dispatch sigue en 1.
- SHA test: `467cea28706a54b2f30e320485c1d7b3f57e2692`. SUCCESS: Chronicle native [39196004121](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196004121), bounded admission/restart [39196004116](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196004116), STEP 4 [39196004098](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196004098), STEP 5 [39196004164](https://github.com/snowdenxrp/aldea-ia/actions/runs/39196004164). El cambio fue sólo de prueba; el fix funcional de admisión sigue en `3ebb037...`, y los crash cuts de continuidad siguen SUCCESS en test SHA anterior `376f2d...` [39195866266](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195866266).
- Límite: esto verifica la recuperación del resultado de paso Chronicle; no afirma que el objetivo de misión general esté verificado. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Frontera posterior:** comprobar que el evidence object Chronicle no admita claims extra ajenos al settlement canónico.


## M0 — replay de PREPARED conserva la misma obligación tras reinicio (validado 2026-10-19)

- Regresión añadida en `tests/nexo/continuity-migration.test.mjs`: crear misión, persistir PREPARED para una reparación, cerrar/reabrir el owner y repetir exactamente la misma operación con la revisión actual.
- Resultado observado: `prepared_existing / NEXO_EFFECT_OUTCOME_UNKNOWN`, `preparedCommitted: false`, autorización `NOT_EVALUATED`; revisión permanece en 2 y el diario conserva una sola entrada `prepared` con la identidad original. Esto confirma que la ruta de obligación existente precede al gate de misión bloqueada, pero no se convierte en permiso de despacho.
- SHA de prueba: `376f2d984eeb969d25c2c797a40037a72a6a5c6b`. SUCCESS: bounded admission/restart [39195866238](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195866238), STEP 4 [39195866236](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195866236), STEP 5 [39195866226](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195866226), crash cuts [39195866266](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195866266). Sólo prueba/documentación cambió tras el último fix funcional `3ebb037...`.
- Límite: prueba la preservación de la obligación y el no-redispatch en esta API; no prueba despacho real ni autorización. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Comprobación de la frontera Chronicle restart/lost-response:** ya está cubierta por `tests/nexo/chronicle-runtime.test.mjs` (reinicio después de append y después de outcome commit; reconstrucción `completed` sólo con settlement y outcome válidos; replay sin redispatch) y por `tests/nexo/continuity-migration.test.mjs` (settlement sin outcome queda blocked). No añadir pruebas duplicadas ni reabrir ese contrato sin una regresión nueva.

**Siguiente frontera pendiente:** auditar la política de fallo de lectura de `store.loadCurrent()` en `recordPrepared()`, `recordExecutionLineage()` y `recordOutcome()` frente a la normalización fail-closed ya presente en `recordMission()` y `reconcilePrepared()`. Primero confirmar el contrato y una prueba de lectura fallida; no cambiar si propagar excepción es intencional.



## M0 — PREPARED exige misión y paso canónicos ejecutables (validado 2026-10-19)

- Frontera previa confirmada: un intento terminal caller-supplied para `repair_agent_state` podía hacer que la reconstrucción bloqueara el paso, mientras el plan persistido seguía en `planned`; `recordPrepared()` llegó a devolver `committed`. La regresión falló antes del fix en bounded admission [39195312143](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195312143) y crash cuts [39195312160](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195312160).
- Corrección de paso en `src/nexo/core/continuity-owner.mjs`: antes de admitir PREPARED, se reconstruye la misión desde el snapshot y el paso solicitado debe estar `planned` tanto en el plan como en la reconstrucción.
- Nueva frontera reproducida: con un PREPARED sin resolver en step-1, la reconstrucción marca la misión `blocked / reconcile_prepared_effect`, pero la admisión inicial todavía sólo comprobaba el status de la misión persistida y podía intentar admitir step-2. El contrato y los comentarios de reconstrucción ya establecían que la misión bloqueada no es runnable; no se inventó un mutex/cola.
- Corrección de misión: `recordPrepared()` ahora exige también `reconstructedMission.status === "planned"`. Una misión bloqueada por PREPARED no resuelto rechaza nuevas admisiones con `NEXO_PREPARED_MISSION_NOT_RUNNABLE`; el PREPARED ya existente se examina antes de este guard y sigue devolviendo UNKNOWN/prepared_existing, sin redispatch.
- Regresiones: (1) claim completed no autorizada para acción mutante no puede preparar el mismo paso; (2) una dependencia que sólo aparece completed en el plan no se considera outcome canónico; (3) un PREPARED pendiente bloquea la admisión de otro paso independiente de la misma misión. Las expectativas se alinearon al guard de misión reconstruida, que es más fuerte que un rechazo aislado de paso. Se añadió además una prueba de reinicio: repetir la misma identidad PREPARED devuelve `prepared_existing / NEXO_EFFECT_OUTCOME_UNKNOWN`, conserva el único journal PREPARED y no cambia la revisión.
- HEAD validado de código+pruebas: `376f2d984eeb969d25c2c797a40037a72a6a5c6b`; fix funcional de misión `3ebb037f53409df9681f5ed01b6458e915e36a29`. SUCCESS en SHA final: bounded admission/restart [39195866238](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195866238), STEP 4 [39195866236](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195866236), STEP 5 [39195866226](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195866226), crash cuts [39195866266](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195866266). Chronicle native vertical y effect/settlement también SUCCESS en SHA funcional `3ebb037...`: [39195543682](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195543682), [39195543685](https://github.com/snowdenxrp/aldea-ia/actions/runs/39195543685).
- Límite: esto cierra sólo la admisión canónica frente a estado reconstruido; no implementa goal verifier ni autoriza efectos externos. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Frontera posterior:** verificar el contrato terminal Chronicle tras restart/respuesta perdida, con settlement y outcome persistidos; el caso settlement sin outcome ya debe seguir blocked.

## M0 — reconstrucción respeta el gate de goal verification (validado 2026-10-19)

- Hueco: la reconstrucción canónica aceptaba una tentativa `completed` con action/target coincidentes y labels `verified/kind/source` incluso para acciones mutantes sin goal verifier. Eso contradice `recordOutcome()`, que bloquea completion para esas acciones mientras no exista un contrato de verificación específico.
- Corrección: sólo `local_analysis` (acción no mutante explícita) y `chronicle_append` con settlement canónico válido pueden reconstruirse como completed en este camino. Para otras acciones, una claim terminal se bloquea con `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED`; si la evidencia misma es inválida, se conserva `NEXO_COMPLETION_EVIDENCE_UNVERIFIED`. `chronicle_append` mantiene su regla adicional de settlement+outcome.
- Compatibilidad: el test de monotonicidad de replay se acotó a `local_analysis`, que sí está habilitado como acción no mutante. No se modificó el runtime legacy `src/assistants/memory.js`; la protección aplica a reconstrucción canónica en `continuity-operations.mjs`.
- Regresiones: caller-labelled completion para `repair_agent_state` bloquea por goal verification; `local_analysis` con evidencia verificada se reconstruye completed. También se corrigió clasificación para que evidence no verificada no se etiquete como ausencia de goal verifier.
- SHA funcional `fbfda4b7be4de8cf2e3ae1b0d7903f0287cf5b6e`; SHA final de pruebas `ac8e4bc88c04c2f1ea257a58ecf224d867dd4b94`. SUCCESS en SHA final: bounded admission/restart [39194990258](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194990258), STEP 4 [39194990341](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194990341), STEP 5 [39194990334](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194990334); crash cuts SUCCESS en código funcional `fbfda4...` [39194945319](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194945319). Las ejecuciones intermedias fallaron por tests que todavía asumían completion de repair o usaban action distinto en el replay; se actualizaron y los workflows finales pasaron.
- Límite: no existe aún un goal verifier general para acciones mutantes. Este cambio bloquea claims, no implementa el verificador. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Siguiente frontera:** revisar el contrato existente sobre múltiples PREPARED no resueltos por misión. No asumir que deben serializarse ni cambiar el comportamiento sin evidencia y regresión.


## M0 — reconstrucción Chronicle exige settlement y outcome coherentes (validado 2026-10-19)

- Hueco reproducido: un `settled_observed` Chronicle sin intento terminal podía dejar el paso como `planned`; y una tentativa `completed` con evidencia aparente podía marcar el paso completado aunque el settlement persistido tuviera `evidence: null`. El runtime canónico evitaba redispatch, pero la reconstrucción pública no reflejaba siempre esa obligación.
- Corrección: `reconstructNexoMissionFromSnapshot()` usa el contrato compartido `isValidNexoChronicleSettlementRecord()`. Para reconstruir un Chronicle como `completed` exige simultáneamente un único settlement canónico válido y un intento terminal con identidad/evidencia válidas. Settlement válido sin intento terminal produce `blocked / NEXO_CHRONICLE_OUTCOME_REPLAY_REQUIRED`; claim completed con settlement inválido/ausente produce `blocked / NEXO_CHRONICLE_SETTLEMENT_REQUIRED`. No se convierte a planned ni se redispatcha.
- Regresiones: settlement válido sin outcome; attempt completed con evidence de settlement null. Ambas pruebas fallaban antes del cambio; CI observó el primer caso como `planned` en vez de `blocked`.
- SHA de código: `dfef7209ed8af5b5fdd57b973e4b905fd821005f`; SHA de regresiones: `fe79862299cb51dd95bd39e0d227d05698c65a03`. SUCCESS: bounded admission/restart [39194696292](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194696292), crash cuts [39194696297](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194696297), STEP 4 [39194696399](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194696399), STEP 5 [39194696338](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194696338).
- Límite: reconstrucción coherente del estado Chronicle; no completa la verificación general de objetivos ni la autorización de efectos. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Siguiente frontera:** inspeccionar el contrato de intentos terminales para acciones no Chronicle que no tengan settlement específico. Distinguir con precisión los registros legacy que se preservan de los resultados canónicos que no pueden autorizar completion; no romper compatibilidad sin una prueba y una regla de migración explícita.


## M0 — reconstrucción no acepta completion de intento no ligado (validado 2026-10-19)

- Hueco reproducido: `reconstructNexoMissionFromSnapshot()` agrupaba intentos por `missionId/stepId`, pero no cotejaba `action/target` con el paso canónico. Además, si no encontraba una completion verificada, el fallback podía elegir cualquier intento, incluyendo `completed` con evidencia no verificada. Resultado: un intento distinto o una afirmación terminal sin evidencia válida podía reconstruir el paso como `completed`.
- Corrección: sólo un intento `completed` con acción/target exactamente coincidentes y evidencia `verified === true`, `kind` y `source` no vacíos puede reconstruir completion. Si existe un intento terminal `completed` pero no satisface identidad o evidencia, el paso queda `blocked` con `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH` o `NEXO_COMPLETION_EVIDENCE_UNVERIFIED`, y no se vuelve ejecutable como planned. Los intentos no terminales se filtran por identidad cuando aportan action/target; se conserva el manejo conservador de registros legacy sin esos campos.
- Regresiones: (1) attempt con mismo missionId/stepId pero action/target diferentes; (2) attempt con identidad coincidente pero `evidence.verified === false`. Ambos bloquean sin marcar completed. El primer test se añadió antes de la corrección y CI confirmó el fallo real: reconstruía `completed` en vez de `planned` (después corregido a bloqueo explícito).
- SHA código: `98abe80c058802f2f5ad50cd49bc2525ade6b09f`; SHA final con pruebas: `5767851584eba13298cada7bf46b162844b7d7bd`. SUCCESS en SHA final: bounded admission/restart [39194524160](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194524160), STEP 4 [39194524170](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194524170), STEP 5 [39194524126](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194524126), crash cuts [39194524193](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194524193). La ejecución intermedia en el SHA de código falló porque la expectativa del test aún era planned; la prueba se ajustó al comportamiento seguro blocked y los cuatro workflows pasaron.
- Límite: reconstrucción conservadora de intentos, no goal verifier, atribución causal ni autorización. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Siguiente frontera:** revisar el contrato de reconstrucción frente a `effectJournal` con terminal outcome ausente o inválido: comprobar si un Chronicle `settled_observed` sin un intento terminal válido puede dejar el plan como ejecutable o sólo queda recuperable mediante runtime fail-closed. Añadir prueba antes de modificar.


## M0 — operación genérica rechaza IDs ambiguos con separador (validado 2026-10-19)

- Hueco concreto: `validateOperation()` comprobaba que `idempotencyKey === missionId + ":" + stepId`, pero permitía que `missionId` o `stepId` contuvieran `:`. Así, pares distintos podían producir la misma clave (por ejemplo `a:b + c` y `a + b:c`). `recordPrepared()` ya bloqueaba una segunda identidad conflictiva, por lo que el impacto directo era ambigüedad/colisión y bloqueo, no una duplicación demostrada de efecto.
- Corrección: validación compartida rechaza cualquier componente con `:` usando el código existente `NEXO_OPERATION_IDENTITY_MISMATCH`; no se inventó formato de clave ni código nuevo. La validación ocurre antes de leer/escribir continuidad.
- Regresión: prueba ambas variantes, verifica el código de rechazo y confirma que la revisión y PREPARED existente no cambian.
- SHA final de código: `442963578e2de42e6d67afd6fd85062ccea1a23e`; regresión en `ddfc6f98514ca3222a6e9424835602c40643cbea`. Los seis workflows focales SUCCESS en SHA `442963...`: Chronicle [39194316831](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194316831), bounded admission/restart [39194316813](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194316813), STEP 4 [39194316843](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194316843), STEP 5 [39194316811](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194316811), crash cuts [39194316847](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194316847), effect/settlement [39194316799](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194316799).
- Un intento intermedio falló porque el rechazo por separador se clasificó inicialmente como contexto inválido en lugar del código de identidad existente. Se movió a la rama específica de identidad y todos los seis workflows pasaron después; no se presenta el intento fallido como verde.
- Límite: evita ambigüedad del identificador local; no autentica identidad ni autoriza efectos. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Siguiente frontera:** inspeccionar la reconstrucción de misión y la selección de intentos históricos: comprobar si una tentativa con `missionId/stepId` coincidentes pero `action/target` distintos puede reconstruir un paso como `completed`. Añadir una regresión antes de tocar la lógica.


## M0 — evidencia genérica debe existir y no estar vacía (validado 2026-10-19)

- Hueco concreto: `reconcilePrepared()` aceptaba observaciones `applied/not_applied` sin `evidence` y guardaba `evidence: null`; el replay genérico sólo comprobaba que la propiedad existiera. Incluso un objeto vacío no representaba evidencia material.
- Corrección: el owner ahora exige propiedad propia `evidence` con objeto no nulo, no-array y al menos una clave enumerable para observaciones positivas `applied/not_applied`. El replay aplica la misma condición. `unknown` conserva su camino explícito de incertidumbre y no se convierte en error de evidencia positiva.
- Compatibilidad del verificador Chronicle: la observación `not_applied` ahora devuelve evidencia de ausencia ligada al `operationKey` y a la revisión leída (`kind: chronicle-operation-absence`, `matchCount: 0)); por eso una ausencia comprobada puede persistirse como observación sin fingir evidencia de un registro existente.
- Regresiones: verificador genérico sin evidencia y con `evidence: {}` bloqueado sin mover revisión ni cerrar PREPARED; replay genérico legado con `evidence: null` devuelve conflicto y no `already_observed`. El test existente de Chronicle ausente confirma que se conserva `reconciled_observed` con evidencia estructurada.
- SHA de código: owner `6ab75e1b59758cd33cd0a470c90e45e02f418882`, adaptador de ausencia `8920343f537e84948a2daf7ebe56a636b3898879`; SHA final con regresiones `b3a3f8fbaafb29ba913916ce989fb3a3e7196768`. CI en código SHA `6ab75e...`: Chronicle native SUCCESS [39194124662](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194124662), bounded admission/restart SUCCESS [39194124810](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194124810). En SHA de regresiones `b3a3f8...`: crash cuts SUCCESS [39194138008](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194138008), effect/settlement SUCCESS [39194137937](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194137937), STEP 4 SUCCESS [39194137971](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194137971), STEP 5 SUCCESS [39194137987](https://github.com/snowdenxrp/aldea-ia/actions/runs/39194137987). El último commit después del SHA de código sólo añade/ajusta pruebas.
- Límites: objeto estructurado no nulo es un umbral mínimo, no autenticación ni prueba criptográfica del origen. Fuente es una etiqueta, no confianza autenticada. No habilita redispatch ni completion. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

**Siguiente frontera:** revisar identidad de operación/idempotency key en el contrato genérico: la clave se deriva con separador `:`, pero la validación compartida podría aceptar IDs que contengan ese separador. Comprobar la colisión con pruebas existentes antes de cambiarlo; no inventar un nuevo formato de identidad.


## M0 — runtime recovery comparte el contrato canónico de settlement Chronicle (validado 2026-10-19)

- Segundo hueco concreto: `owner-backed-runtime.mjs` recuperaba una entrada `settled_observed` comprobando sólo status/source/revisión. Esa ruta evitaba el validador más estricto de `continuity-owner.mjs`, podía informar `journalSettled: true` y pasar al outcome writer aun con `evidence: null` o timestamp ausente. El outcome writer real acababa bloqueando, pero el estado público intermedio afirmaba settlement válido sin satisfacer el contrato.
- Corrección de raíz: nuevo contrato puro compartido `src/nexo/core/chronicle-settlement-contract.mjs`. Valida estado, acción, identidad exacta sin separadores ambiguos, target de contenido, status/source/revisión, evidencia ligada al operationKey y contenido exactos, y timestamp ISO canónico. Tanto replay/completion del owner como recuperación de runtime llaman al mismo validador; se elimina la divergencia entre puertas.
- Regresión runtime: un `settled_observed` con `evidence: null` devuelve `unknown / NEXO_CHRONICLE_EXISTING_OBLIGATION_UNRESOLVED`, no llama a `recordOutcome`, no despacha, y no declara `journalSettled` ni outcome terminal. La fixture positiva de replay ahora contiene evidencia y timestamp canónicos.
- Código compartido/owner/runtime: `e62b65ab699c5d177c40d08f32a1393af118e4ee`; prueba runtime añadida en `26eab01d09ab4be20c7228da8abf17e3224f5a6b`. Los workflows focales del SHA de test `26eab...` pasaron: Chronicle native [39193750342](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193750342), bounded admission/restart [39193750352](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193750352), STEP 4 [39193750292](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193750292), STEP 5 [39193750331](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193750331). Tras el cambio final de identidad del contrato, crash cuts [39193779321](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193779321), STEP 4 [39193779238](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193779238) y STEP 5 [39193779170](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193779170) pasaron en `e62b65a...`.
- Una ejecución intermedia de Chronicle en SHA `a7bdce...` falló porque la fixture de replay aún no tenía la evidencia/timestamp nuevos; se corrigió la fixture y el test runtime negativo/positivo pasó en `26eab...`. No se oculta esa secuencia.
- Límite: contrato estructural común para la evidencia local observada; no autenticación, causalidad, autorización, fsync/power-loss durability ni verificación general del objetivo. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Siguiente frontera:** auditar los límites de observación genérica para determinar si el mismo hueco de evidencia nula existe fuera de Chronicle. Primero leer las pruebas y mantener el alcance separado: no endurecer el contrato genérico sin una regresión que demuestre el fallo y una evaluación de compatibilidad.


## M0 — evidencia Chronicle ligada a la entrada persistida (validado 2026-10-19)

- Hueco concreto: `observeChronicleOperation()` verificaba que la entrada persistida coincidiera con la operación, pero devolvía la observación sin `evidence`. `reconcilePrepared()` acababa guardando `evidence: null`; las guardas anteriores sólo comprobaban que la propiedad existiera, por lo que null podía superar replay y completion.
- Corrección: `src/nexo/adapters/chronicle-observation.mjs` devuelve evidencia estructurada `{kind: "persisted-chronicle-entry", operationKey, content}` tomada de la entrada que se leyó. `src/nexo/core/continuity-owner.mjs` exige que esa evidencia sea un objeto con kind exacto y que operationKey y content coincidan con la identidad/target del registro tanto en replay como al registrar `completed`.
- Regresiones: `tests/nexo/chronicle-store.test.mjs` comprueba la evidencia devuelta por el verificador; `tests/nexo/repair-settlement-crash-cuts.test.mjs` comprueba que un settlement Chronicle con `evidence: null`, aun con estado/source/revisión/timestamp válidos, bloquea completion y replay; no cambia la revisión ni los intentos.
- Código actualizado: `b3a583038a3844b804655544097783d73bc222d2`; contrato/test del observador: `af465ba0d2d0b787dc6ac0f7c6dc4f2f18851db4`; SHA final con regresión null-evidence: `2c859b001a705e6dd839d2b0c311182dd6ed9f81`.
- CI: Chronicle native vertical SUCCESS [39193460291](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193460291), bounded mission admission/restart SUCCESS [39193460351](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193460351), STEP 4 SUCCESS [39193598618](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193598618), STEP 5 SUCCESS [39193598630](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193598630), repair settlement crash cuts SUCCESS [39193598643](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193598643), effect/settlement contract regressions SUCCESS [39193598522](https://github.com/snowdenxrp/aldea-ia/actions/runs/39193598522). Chronicle/bounded runs exercised the code+observer-test SHA `af465ba...`; the remaining four focal workflows passed on final SHA `9914f...`.
- Una ejecución intermedia falló porque el test de igualdad exacta aún esperaba el objeto antiguo sin `evidence`; el test se actualizó y pasó en `af465ba...`. Después, `2c859b...` añadió la prueba explícita de replay con evidence null y los cuatro workflows focales volvieron a pasar. No fue un fallo de la lógica de settlement. Una ejecución intermedia de Chronicle se canceló al llegar una revisión posterior; el workflow de Chronicle en el SHA de prueba actualizado terminó SUCCESS.
- Límite: evidencia local ligada a una entrada leída; no es firma criptográfica, autenticación, atribución causal, fsync/power-loss durability, autorización ni verificación general de objetivos. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.

**Siguiente frontera:** seguir dentro de M0 desde la recuperación canónica/reconstrucción del estado persistido, inspeccionando el siguiente límite concreto con sus pruebas existentes. No reabrir la discrepancia de evidencia Chronicle salvo que aparezca una regresión nueva.


**Continuidad para el siguiente chat:** leer primero [handoff M0 2026-10-19](BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-19.md). La misión no cambia: **M0**. Último SHA de código validado: `fbfda4b7be4de8cf2e3ae1b0d7903f0287cf5b6e`; SHA final con regresiones de policy/replay: `ac8e4bc88c04c2f1ea257a58ecf224d867dd4b94`. Checkpoint de documentación de cierre de settlement: ver los commits documentales posteriores en el historial de la rama. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina. No reiniciar investigaciones cerradas.

## M0 — replay de settlement Chronicle exige registro canónico completo (validado 2026-10-19)

- Hueco concreto: el replay genérico exigía `evidence` y `observedAt` ISO canónico, pero la rama `chronicle_append` sólo comprobaba estado, source y revisión. Un settlement incompleto podía devolverse como `already_observed` aunque no contuviera evidencia ni timestamp.
- Corrección en `src/nexo/core/continuity-owner.mjs`: la rama Chronicle ahora exige `settlement.evidence` y `observedAt` ISO válido/canónico además de identidad exacta, `settled_observed`, `applied`, source `nexo-chronicle-store` y revisión no negativa.
- Regresión: settlement parcial con estado/source/revisión correctos pero sin `evidence` ni `observedAt` no se acepta como replay; devuelve conflicto de revisión y no invoca el verificador como fallback.
- SHA de código: `005338b91656e61eee3ffbef105c306e2af496b2`; los seis workflows focales SUCCESS: [Chronicle 39190771042](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190771042), [bounded admission/restart 39190771031](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190771031), [STEP 4 39190771037](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190771037), [STEP 5 39190771029](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190771029), [crash cuts 39190771021](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190771021), [effect/settlement 39190771114](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190771114).
- SHA código+prueba: `ddf1034f4ef605dc68e0e7eb5debe4f61cecbd72`; los cuatro workflows activados por la nueva regresión SUCCESS: [crash cuts 39190786403](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190786403), [effect/settlement 39190786395](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190786395), [STEP 4 39190786373](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190786373), [STEP 5 39190786377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190786377). El SHA final añadió la regresión; el código no cambió.
- Esto no convierte settlement en autorización ni implementa goal verification. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

**Siguiente frontera:** comprobar únicamente si el registro de settlement Chronicle se valida igual en la ruta de escritura y en replay; no crear estados ni nuevas capacidades.

## M0 — lecturas canónicas fallidas devuelven incertidumbre estructurada (validado 2026-10-19)

- Continuación exacta del checkpoint anterior: el replay de observación genérica ya valida identidad y forma canónica, y `reconcilePrepared()` ya devuelve incertidumbre si falla su lectura inicial o la relectura previa al CAS. No se repitió la investigación cerrada.
- Cambio adicional en `recordMission()`: la lectura de continuidad se captura como límite de fallo. Si `store.loadCurrent()` lanza, la API devuelve `blocked`, el código original o `NEXO_CONTINUITY_LOAD_FAILED`, `uncertainty: continuity_read_failed`, la revisión esperada y `authorization: NOT_EVALUATED`. No intenta construir ni guardar una misión desde un estado desconocido.
- Regresión nueva: el store falla al leer durante admisión de misión; se verifica resultado estructurado, preservación del código y revisión canónica sin cambios. Las pruebas existentes cubren además fallo de lectura inicial y relectura de `reconcilePrepared()`, sin ejecutar el verificador si falla la lectura inicial y dejando `PREPARED` intacto si falla la relectura.
- SHA código: `b34c09492a36ef354faf566b8a8b1e34cae7dadb`; seis workflows SUCCESS en ese SHA: [bounded admission/restart 39190586627](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190586627), [Chronicle 39190586618](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190586618), [STEP 4 39190586666](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190586666), [STEP 5 39190586695](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190586695), [crash cuts 39190586616](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190586616), [effect/settlement 39190586682](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190586682).
- SHA código+prueba: `9852ec69da2b1fe685619d765521916eba5a9786`; los cuatro workflows disparados por la prueba nueva pasaron: [crash cuts 39190614620](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190614620), [effect/settlement 39190614649](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190614649), [STEP 4 39190614614](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190614614), [STEP 5 39190614658](https://github.com/snowdenxrp/aldea-ia/actions/runs/39190614658). El commit posterior sólo añade la regresión de lectura de admisión; Chronicle y bounded admission ya pasaron con el código b34.
- Límite: manejo estructurado de fallos de lectura; no establece atomicidad entre stores, no autoriza efectos ni implementa el verificador de objetivo. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

**Siguiente frontera:** revisar únicamente otros límites de fallo de la misma ruta cuando la evidencia indique un hueco; no añadir más envolturas defensivas genéricas ni estados nuevos por especulación.

## M0 — replay de observación genérica y lecturas fallidas (validado 2026-10-19)

- Reconciliación genérica: `reconcilePrepared()` ahora exige que el replay canónico incluya `status` válido (`applied/not_applied`), revisión observada no negativa, `source` no vacío, propiedad `evidence` presente y `observedAt` ISO válido. Si el registro es parcial, no devuelve `already_observed`, no vuelve a invocar el verificador y devuelve conflicto/UNKNOWN de forma fail-closed.
- Lecturas: fallos de la lectura inicial o de la relectura pre-CAS devuelven `blocked` con código de error y marca de incertidumbre explícita. La prueba de relectura demuestra que no se escribe y PREPARED permanece; la prueba de lectura inicial demuestra que el verificador ni siquiera se invoca.
- Crash cut de commit también cubierto: commit durable seguido de excepción → resultado estructurado de incertidumbre; al reabrir, el replay recupera `already_observed` sin invocar el verificador por segunda vez.
- Código final con hardening de replay: `abd9e9d4ed64e96940155712b1dae173ba22c77e`; SHA final de código/pruebas: `c2c2414edd8ffc138f6cf473f5eae2ee1bbae397`. CI SUCCESS: [repair crash cuts 39189827272](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189827272), [effect/settlement 39189827289](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189827289), [STEP 4 39189827310](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189827310), [STEP 5 39189827224](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189827224). Chronicle SUCCESS en hardening de código: [run 39189720937](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189720937).
- Límites: no se añade un estado nuevo, no se repite la operación ni el verificador durante recovery, no se afirma causalidad, atomicidad cross-store ni completion de misión. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

**Siguiente frontera:** auditar si el contrato de `effectJournal` valida también los estados observados al cargar un snapshot, no solo durante replay. Mantener la compatibilidad deliberada con entradas legacy; primero identificar el alcance y añadir regresión antes de endurecer el schema global.

## M0 — fallos de lectura en reconciliación genérica (validado 2026-10-19)

- Hueco concreto: `reconcilePrepared()` ya devolvía incertidumbre estructurada para fallo de commit y podía recuperar una respuesta perdida, pero dos lecturas de continuidad —la lectura inicial y la relectura inmediatamente anterior a CAS— aún podían propagar excepciones crudas.
- Corrección en `src/nexo/core/continuity-owner.mjs`: ambos límites de lectura devuelven `blocked` con el código de error existente cuando está disponible, marcadores `uncertainty: continuity_read_failed` o `continuity_recheck_failed`, y sin afirmar commit ni settlement. La relectura pre-CAS sigue siendo obligatoria; si falla, no se escribe la observación.
- Regresión añadida: el verificador devuelve una observación válida, la segunda lectura falla, y el método devuelve bloqueo estructurado; se comprueba que el verificador solo se invoca una vez, `storeRevision` sigue en 0 y el journal permanece `prepared`.
- SHA de código `c8b5c59cd5e2a69e11c9c8ba1263d46a5c678469`; SHA final código/pruebas `f43c757cc7dc6ce966f797637dd5d7e2b5715827`. SUCCESS: [repair crash cuts 39189612150](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189612150), [effect/settlement 39189612141](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189612141), [STEP 4 39189612151](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189612151), [STEP 5 39189612143](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189612143). Chronicle SUCCESS en código SHA `c8b5c59cd5e2a69e11c9c8ba1263d46a5c678469`: [run 39189596625](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189596625). Continuity/restart SUCCESS: [run 39189596815](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189596815).
- Límites: no hay retry automático, no se reejecuta el verificador por un fallo de lectura, no se habilita redispatch ni se afirma atomicidad cross-store. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

**Siguiente frontera:** verificar la recuperación por replay de observaciones genéricas corruptas o parcialmente formadas. El replay debe aceptar únicamente un registro canónico con estado, identidad, revisión y fuente válidos; si falta un elemento, debe permanecer UNKNOWN/bloqueado y no invocar el verificador como atajo.

## M0 — commit de observación genérica con respuesta perdida (validado 2026-10-19)

- Hueco reproducido: `reconcilePrepared()` podía dejar escapar una excepción de `store.commitIfCurrent()`. Si el store persistía `reconciled_observed` y después lanzaba una excepción antes de devolver el recibo, la API no entregaba resultado estructurado aunque el estado canónico ya hubiera avanzado.
- Corrección en `src/nexo/core/continuity-owner.mjs`: la frontera del commit genérico captura específicamente esa excepción y devuelve `blocked`, código original si existe (fallback `NEXO_EFFECT_OBSERVATION_COMMIT_OUTCOME_UNKNOWN`), `observationCommitted:false` y `uncertainty: effect_observation_commit_outcome_unknown`. No afirma que el commit falló ni que tuvo éxito; la siguiente llamada recupera la observación desde el journal canónico.
- Regresión crash-cut: el store subyacente confirma durablemente el commit y luego lanza error. La primera llamada devuelve incertidumbre estructurada; tras reabrir el owner, replay devuelve `already_observed`, revisión 1, conserva `reconciled_observed` y no vuelve a invocar el verificador.
- Hubo dos fallos iniciales de CI por colisión del directorio temporal de la nueva prueba con otro caso existente. Se aisló el directorio de esta regresión; el código no se alteró para ocultar ese fallo.
- SHA final código/prueba: `a8f5d06cb983a412b8187612c70a6032215518eb`. SUCCESS: [repair crash cuts 39189472295](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189472295), [effect/settlement 39189472360](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189472360), [STEP 4 39189472242](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189472242), [STEP 5 39189472266](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189472266). Chronicle SUCCESS sobre el commit de código `ea2bc19753d82c9d79a98c100b9b9ee2dd0b3c90`: [run 39189369262](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189369262); el SHA final añadió/ajustó pruebas de crash-cut y no cambió después el código de Chronicle.
- Límite: el guard devuelve incertidumbre estructurada; no crea atomicidad entre stores, no reintenta el efecto ni invoca de nuevo el verificador cuando recupera el commit. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

**Siguiente frontera:** terminar de revisar errores de lectura en el mismo método y validar que los replays sólo acepten observaciones canónicas con identidad y estado exactos. No ampliar a UI/runtime legacy ni crear nuevos estados.

## M0 — completion fail-closed por defecto (validado 2026-10-19)

- Segundo hueco encontrado en el guard anterior: cubrir acciones repair y acciones registradas en `effectVerifiers` no protegía una acción con efecto no registrada. El owner podía aceptar `recordOutcome(status=completed)` sin PREPARED ni un verificador de objetivo si el nombre de acción no estaba en esos dos grupos.
- Corrección en `src/nexo/core/continuity-owner.mjs`: por defecto, toda acción `completed` queda bloqueada con `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED`, excepto `chronicle_append` (usa su gate de settlement canónico) y `local_analysis` (acción definida como no mutante). La protección de PREPARED/reconciliación no resuelta sigue teniendo prioridad.
- Regresión: `tests/nexo/repair-settlement-crash-cuts.test.mjs` prueba acción `generic_write` sin PREPARED y sin verificador registrado; el caller no puede declarar completion y `storeRevision` permanece en 0. Se mantiene también la cobertura para repair y acción genérica registrada.
- Código + pruebas validados en SHA `8d8a92a0ad7ed73b0f35bc798f033be11402856c`. Workflows SUCCESS: [STEP 4 39189265872](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189265872), [STEP 5 39189265904](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189265904), [repair settlement crash cuts 39189265894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189265894), [effect/settlement contract 39189265926](https://github.com/snowdenxrp/aldea-ia/actions/runs/39189265926). Chronicle SUCCESS en el commit de código anterior `a0cf6b87d479e39c3927b952869d52b3539b6c75`; no cambió en el commit de prueba.
- Límite: este es un guard fail-closed, no una implementación del goal verifier. No habilita acciones nuevas, no completa misiones automáticamente, no conecta el runtime legacy ni UI. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

**Siguiente corte:** revisar si el contrato de observación del verificador queda ligado suficientemente a identidad de misión/paso y a una revisión de entorno verificable. No crear campos nuevos ni persistir un goal-observation nuevo sin demostrar primero el hueco y especificar el contrato.

## M0 — guard de completion para acciones con efecto (validado 2026-10-19)

- Hueco: `recordOutcome(status=completed)` podía registrar completion para una reparación sin `effectJournal`, si el caller aportaba campos de evidencia con forma válida. La misma protección debía cubrir cualquier acción con verificador de efecto registrado aunque faltara PREPARED canónico.
- Corrección: `createNexoContinuityOwner().recordOutcome()` bloquea completion de las tres acciones repair conocidas y de cualquier acción registrada en `effectVerifiers`, salvo `chronicle_append`, que conserva su gate de settlement propio. Código: `NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED`. Si hay efecto PREPARED/observado sin resolver, ese bloqueo tiene prioridad y sigue devolviendo `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`. `local_analysis` no mutante conserva su comportamiento.
- Regresiones: reparación sin PREPARED y `generic_write` registrado en `effectVerifiers` sin PREPARED; ambos outcomes caller-asserted quedan bloqueados y la revisión canónica permanece en 0.
- Primera versión del guard falló por precedencia y alcance demasiado amplios en SHA `ae805de72869f265a836f1f6fa7a4f7f82d3b620`. Se corrigió y se añadió la cobertura del efecto genérico; no se ocultó el fallo.
- SHA código/test validado: `f0a2472887e8bf5d46aaff2c904e50dae190345b`. CI SUCCESS: [bounded admission/restart 39188948325](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948325), [STEP 5 39188948326](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948326), [STEP 4 39188948327](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948327), [Chronicle 39188948337](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948337), [repair crash cuts 39188948338](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948338), [effect/settlement contract 39188948346](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188948346).
- Límite: esto solo cierra el bypass de completion sin PREPARED/verificación de objetivo. No implementa el goal verifier; no habilita más acciones ni efectos protegidos, no conecta UI/runtime legacy y no mezcla Nexo con Lúmina. M0 sigue INCOMPLETO.

**Siguiente corte M0:** auditar la frontera entre un verificador registrado, su observación persistida y la futura decisión de misión. No conectar runtime/UI ni habilitar una acción hasta tener un contrato de objetivo confiable, con replay/restart y límites de autoridad explícitos.

## M0 — reparación no puede declararse completed sin verificación del objetivo (validado 2026-10-19)

- Hueco reproducido: el owner bloqueaba outcomes mientras existía un efecto `PREPARED`/observado no resuelto, pero una acción de reparación sin entrada en `effectJournal` podía pasar por `recordOutcome(status=completed)` con etiquetas `verified/source` aportadas por el caller. La ausencia de PREPARED no demostraba que el objetivo se hubiera verificado.
- Corrección: `createNexoContinuityOwner().recordOutcome()` ahora devuelve `blocked / NEXO_OUTCOME_GOAL_VERIFICATION_REQUIRED` para `repair_agent_state`, `repair_agent_needs` y `repair_resource_state` hasta que exista un verificador de objetivo específico conectado al owner. El guard de efecto no resuelto conserva prioridad y sigue devolviendo `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`. Los outcomes no completados y el caso no mutante `local_analysis` mantienen su contrato previo.
- Regresión: `tests/nexo/repair-settlement-crash-cuts.test.mjs` intenta completar una reparación sin PREPARED, con evidencia solo declarada por el caller; verifica `blocked` y que la revisión canónica siga en 0.
- Primer CI en SHA `ae805de72869f265a836f1f6fa7a4f7f82d3b620` falló por precedencia del nuevo guard: tapaba el error específico de PREPARED y afectaba un test de outcome no mutante. Se corrigió el orden y se limitó el guard a las acciones repair conocidas; no se ocultó ni reinterpretó el fallo.
- SHA código/test validado: `bef43609defa7a57f542d1a572dde388afb90812`. CI SUCCESS: [M0 effect/settlement 39188821844](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821844), [repair crash cuts 39188821998](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821998), [bounded admission/restart 39188821789](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821789), [STEP 4 39188821769](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821769), [Chronicle 39188821790](https://github.com/snowdenxrp/aldea-ia/actions/runs/39188821790).
- Límite: esto no implementa el verificador de objetivo ni permite completar reparaciones; solo cierra la vía de outcome sin evidencia independiente. No cambia runtime predeterminado, no habilita efectos protegidos, no conecta UI y no mezcla Nexo con Lúmina. M0 sigue INCOMPLETO.

**Siguiente corte M0:** revisar el registro de acciones/verificadores confiables y las transiciones entre observación del objetivo y una decisión de misión. No ampliar la lista de acciones ni conectar runtime/UI hasta que el contrato de verificación sea concreto, persistible y probado tras restart.

## M0 — bootstrap de Chronicle sin inicialización parcial evitable (validado 2026-10-18)

- Auditoría del entrypoint encontró que inicializaba Chronicle antes de comprobar si el almacén de continuidad estaba corrupto o ausente sin permiso de inicialización. Eso podía dejar un almacén Chronicle vacío como efecto lateral aunque la sesión completa fuera bloqueada.
- `scripts/nexo-chronicle-session.mjs` ahora preflighta ambos almacenes antes de inicializar ninguno. Un almacén corrupto, ilegible o ausente sin su flag de opt-in bloquea antes de escribir el otro. Después del preflight, la inicialización sigue sin promesa de atomicidad entre archivos: una carrera o fallo de E/S posterior puede dejar una inicialización parcial; no se reclama transacción cross-store.
- `tests/nexo/chronicle-runtime.test.mjs` comprueba ambos sentidos: continuidad corrupta no crea Chronicle ausente y Chronicle corrupto no crea continuidad ausente.
- SHA de código/test validado: `43827382ed27821182727c12a4ed6d03cc51ad36`. CI SUCCESS: [Chronicle vertical run 39174839208](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839208), [continuidad/runtime run 39174839267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839267), [STEP 4 run 39174839176](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839176) y [STEP 5 run 39174839133](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174839133).
- Sigue sin cambiar el runtime default ni la separación Nexo/Lúmina. M0 permanece INCOMPLETO; la próxima frontera es revisar contrato de persistencia/recuperación y la integración de esta única capacidad, sin ampliar acciones ni inferir durabilidad ante pérdida de energía.

## M0 — Chronicle: identidad de operación sin colisiones (validado 2026-10-18)

- Auditoría del primer vertical detectó un caso de ambigüedad: la clave `missionId:stepId` no es inyectiva si alguno de los identificadores contiene `:`. Dos pares distintos podían formar la misma clave, haciendo que una entrada persistida ajena pareciera corresponder a la operación consultada.
- Corrección aplicada en `src/nexo/adapters/chronicle-effect.mjs`, `src/nexo/adapters/chronicle-observation.mjs` y `scripts/nexo-chronicle-session.mjs`: la acción, el verificador y la entrada CLI rechazan IDs con `:`; el verificador devuelve UNKNOWN para la consulta ambigua. No se cambia el formato canónico de identidad de otras acciones ni se inventan IDs alternativos.
- Regresiones: `tests/nexo/chronicle-store.test.mjs` verifica que la observación ambigua no se acepte; `tests/nexo/chronicle-runtime.test.mjs` verifica que la entrada rechace el ID antes de despachar.
- La primera ejecución de CI en SHA `bf5ef739b951b73455cf96782de706afce86accb` falló por una expectativa incorrecta del código de error en el test, no por el comportamiento del runtime: [run 39174663488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174663488). Se corrigió la expectativa para usar el código contractual `NEXO_CHRONICLE_ID_INVALID`.
- SHA final validado: `5c2305c9c07c0010dc3ff6a77b2bff8ed2f7742c`. CI SUCCESS: [Chronicle vertical, run 39174706702](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706702); [bounded continuity/runtime, run 39174706654](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706654); [STEP 4, run 39174706726](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706726); [STEP 5, run 39174706730](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174706730).
- Estado: la identidad de esta vertical ahora tiene un delimitador no ambiguo por validación. Chronicle sigue siendo la única acción nativa habilitada por este entrypoint; no cambia runtime default, no se amplía a otras acciones y no se declara M0 completo.

## M0 — segundo guard: outcome no puede saltarse PREPARED (CI pendiente)

- Commit `d2d96e66e1870c24af31a8b78273d4b33909e999` amplía `tests/nexo/repair-settlement-crash-cuts.test.mjs`: intentar registrar `completed` directamente sobre un paso con efecto `prepared` debe devolver `blocked / NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`, conservar el journal en `prepared` y no crear un attempt.
- Esto cubre un bypass distinto al de `reconcilePrepared()`: ni una observación arbitraria ni un outcome directo pueden cerrar la obligación pendiente. Es un guard contractual; no es settlement genérico implementado.
- El SHA nuevo no muestra status checks (`statuses: []`). CI continúa PENDING/UNKNOWN; no declarar PASS.

## M0 — guard contractual de settlement genérico (CI pendiente)

- Commit `df10a6466f23903d5b9a1c7ed2992be5a635bb59` agrega a `tests/nexo/repair-settlement-crash-cuts.test.mjs` una aserción explícita: `owner.reconcilePrepared()` debe seguir devolviendo `blocked / NEXO_EFFECT_RECONCILIATION_REQUIRED` aunque el caller aporte una observación con `desired_state_present`; el journal debe permanecer `prepared`.
- Es una prueba del límite actual, no implementación de settlement genérico. El owner no acepta todavía un verificador por acción; no se debe convertir una afirmación del caller en prueba del estado ambiental persistido.
- El push de este test debería activar el workflow focal. La consulta de checks del SHA devolvió `statuses: []`; ejecución y resultado siguen PENDING/UNKNOWN. No declarar PASS.

> **Continuidad de nuevo chat (2026-10-18):** antes de seguir, leer `NEXO_NCS/BUILD/NCS_M0_HANDOFF_RECOVERY_NEW_CHAT_2026-10-18.md`. Es el handoff operativo vigente con HEAD observado, últimos cambios y CI, estado real de M0 y siguiente tarea exacta. No repetir auditorías cerradas. La misión sigue siendo M0: runtime canónico de Nexo, independiente de Lúmina.

## M0 — CI focal para replay de settlement agregado (ejecución pendiente de observar)

- Se añadió `.github/workflows/nexo-m0-settlement-replay.yml`, limitado a la rama `ncs-clean-architecture`, con trigger por cambios en el reconciliador/test/workflow y `workflow_dispatch`. Ejecuta exactamente `node tests/nexo/repair-settlement-crash-cuts.test.mjs` en Node 22.
- Commit que agrega el workflow: `cd8daa099f6778ef80d19cbdde51a8fbf010cda5`. El workflow y el test fueron releídos del branch. La consulta inmediata de status checks devolvió una lista vacía; todavía no se afirma que Actions haya ejecutado o aprobado el test.
- Propósito: hacer visible y reproducible la regresión de respuesta perdida sin lanzar toda la batería ni mezclarla con Lúmina. El workflow no habilita runtime ni cambia el alcance repair-only.
- Siguiente: confirmar el run y el SHA observado; si falla, leer el log exacto y corregir la causa. Solo después seguir con pruebas contractuales de settlement genérico en el owner. M0 sigue INCOMPLETO.

## M0 — recuperación de respuesta perdida durante settlement (implementado; CI pendiente)

- **Problema concreto:** si `store.commitIfCurrent()` escribía `settled_observed` y la respuesta se perdía/devolvía UNKNOWN, el reintento con la revisión esperada original devolvía conflicto antes de inspeccionar el journal. La continuidad canónica podía demostrar que el settlement sí estaba registrado, pero la API no podía recuperar esa incertidumbre.
- **Cambio:** `scripts/nexo-repair-settlement.mjs` ahora permite recuperar un settlement ya registrado únicamente si el registro persistido tiene forma válida, fuente `world-state.json`, observación `desired_state_present`, revisión ambiental ligada a la revisión PREPARED o la inmediatamente siguiente y `causalAttribution: not_claimed`. No vuelve a escribir, no despacha y no infiere causalidad.
- **Regresión añadida:** `tests/nexo/repair-settlement-crash-cuts.test.mjs` simula commit real seguido de respuesta UNKNOWN; el replay usa la revisión original y debe recuperar `settled_observed` desde el journal a revisión canónica 1. Las pruebas existentes de revisión ambiental ajena e invariante no demostrada siguen exigiendo que PREPARED permanezca.
- **Commits de código/test:** `1acf070385134ecbb6eeef78b7cec43b8a4a4916`, `b572724ec18e22b9f2f5fe10cd2e50e851e4fb84`, `3bc02acc1a1293e9c7726f44bf04cdbf4ad99724`. La consulta de runs asociados al último commit no devolvió runs; por tanto **CI todavía no está verificado** y no se afirma PASS.
- **Límite:** esta recuperación sigue siendo específica de repair y de la forma del journal actual. No implementa settlement genérico ni habilita el runtime genérico. M0 continúa INCOMPLETO; no conectar aún `src/nexo/runtime.js` ni convertir el bridge repair-only en genérico.

**Siguiente corte M0:** validar el nuevo test en CI; luego diseñar el contrato de reconciliación por acción con evidencia producida por un verificador confiable y persistido. El owner debe controlar la transición CAS del journal; un objeto de observación proporcionado libremente por el caller no debe bastar. No mezclar Lúmina con la continuidad canónica de Nexo.

## M0 — excepción del adaptador durante dispatch (2026-10-18, validado)

- **Hueco:** `scripts/nexo-repair-dispatch.mjs` invocaba `adapter.execute()` sin capturar una excepción que puede ocurrir después de un efecto parcial. La excepción cruda no expresaba que el resultado del efecto fuera desconocido.
- **Corrección:** el dispatcher acepta una `adapterFactory` inyectable para la regresión y captura la excepción en la frontera de dispatch. Devuelve `blocked / NEXO_REPAIR_ADAPTER_OUTCOME_UNKNOWN`, `persisted: false` y `uncertainty: adapter_call_may_have_applied_effect_before_throwing`. No afirma que el efecto no ocurrió, no reintenta y no avanza la revisión del entorno ni el journal PREPARED.
- **Regresión:** `tests/nexo/repair-owner-lifecycle.test.mjs` inyecta un adapter que lanza, y verifica resultado incierto, continuidad en revisión 1 con journal `prepared` y entorno sin revisión inventada.
- **Primer run de la regresión:** [39167516878](https://github.com/snowdenxrp/aldea-ia/actions/runs/39167516878) falló porque el fixture usaba una clave no canónica; se corrigió a `mission-owner-lifecycle:step-repair`. No fue un fallo de la corrección del dispatcher.
- **Validación exacta:** commit de código `3f655a3f239ecaf87d4ba3dd1504bdfffa9a33df`; [CI Nexo M0 — repair settlement crash cuts, run 39167557221](https://github.com/snowdenxrp/aldea-ia/actions/runs/39167557221) SUCCESS. STEP 4 run 39167557187 y STEP 5 run 39167557073 también SUCCESS en el mismo SHA.
- **Alcance:** cierra el hueco concreto del dispatch repair-only; no convierte ese dispatcher en runtime genérico ni completa M0.

**Siguiente trabajo:** volver a la integración del runtime genérico de Nexo y especificar el seam mínimo owner-backed. No repetir el audit de dispatch ni el de settlement ya cubiertos.

## M0 — gate de contrato genérico de efectos (2026-10-18)

Documento: [NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md](BUILD/NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md).

Decisión: no conectar el runtime por callback aislado ni despachar antes de persistir PREPARED. El runtime genérico necesita un contrato por acción para admisión canónica, PREPARED confirmado, dispatch, lineage, reconciliación del estado ambiental persistido, settlement CAS y outcome. El owner aún no tiene settlement genérico; `reconcilePrepared()` bloquea deliberadamente. La simulación de Lúmina en memoria no prueba recuperación durable tras restart. Acciones sin contrato deben bloquearse antes del adapter.

Siguiente corte: pruebas contractuales de reconciliación/settlement en el owner antes de conectar el runtime. No crear ledger paralelo ni fingir atomicidad cross-store. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

## M0 — seam del runtime genérico: callback PREPARED no basta (auditoría 2026-10-18)

- `src/nexo/runtime.js` ejecuta `adapter.execute()` antes de `commitRuntimeOutcome()`; el commit posterior muta la memoria legacy de `src/assistants/memory.js`. No hay exigencia universal de PREPARED durable en el owner antes del dispatch.
- `executeLuminaNexoStep()` pasa `persistPreparedIntent` al adaptador, pero ese callback es opcional. Sin callback, el journal es solo local/en memoria. Con callback, el adaptador persiste la intención antes del handler, pero su `persist()` terminal solo actualiza el journal local; no escribe execution lineage ni liquida el PREPARED del owner.
- `createNexoContinuityOwner().reconcilePrepared()` devuelve deliberadamente `blocked / NEXO_EFFECT_RECONCILIATION_REQUIRED`. No existe un reconciliador genérico autorizado por el mero hecho de que el adapter informe `completed`.
- **Conclusión:** conectar únicamente `persistPreparedIntent` al owner crearía PREPARED durable sin cerrar el ciclo de recuperación; sustituir las llamadas legacy por owner writes después del dispatch también deja una ventana de duplicación. No hacer ninguno de los dos cambios aisladamente.
- **Siguiente corte:** definir contratos de reconciliación confiables por acción/efecto y bloquear dispatch para acciones que no tengan contrato demostrado. El contrato completo debe separar admisión canónica, PREPARED durable con CAS, dispatch, lineage, observación/reconciliación, settlement y outcome. El bridge repair-only es la única ruta concreta demostrada hoy; no generalizarlo por renombrado.
- **M0 sigue INCOMPLETO.** Este hallazgo es auditoría de frontera, no integración terminada ni autorización para efectos protegidos.

## M0 — resultado incierto al confirmar PREPARED (2026-10-18, validado)

- **Hueco reproducido:** `owner.recordPrepared()` podía persistir el registro PREPARED y luego lanzar una excepción antes de devolver confirmación (por ejemplo, respuesta perdida después del reemplazo durable). `prepareRepairAgainstPersistedState()` dejaba escapar la excepción y `runNexoRepairOnce()` no devolvía una respuesta estructurada. El journal podía contener PREPARED durable pese a que el caller no recibió confirmación.
- **Prueba primero:** `tests/nexo/repair-owner-lifecycle.test.mjs` simula una escritura confirmada internamente seguida de excepción. El test falló antes de la corrección: [CI run 39160592605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160592605), SHA `3b066758fe3313b56344a26e0c64bf3ef5d5d7c1`.
- **Corrección:** `scripts/nexo-repair-preparation.mjs` devuelve `blocked`, preserva el código de error, marca `preparedCommitOutcome: unknown` y `uncertainty: prepared_commit_outcome_unknown`. `scripts/nexo-repair-entrypoint.mjs` propaga la incertidumbre y fija `dispatched: false`. No afirma que PREPARED no se haya escrito y no despacha sin confirmación. La siguiente invocación debe volver a leer el journal canónico y reconciliar la obligación.
- **Validación exacta:** código + regresión en `6300f8cb60fe18568e3ebd58e3ca1ee5b70d3d51`; [CI Nexo M0 — repair settlement crash cuts, run 39160656605](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160656605) SUCCESS.
- **Alcance:** esto no migra el runtime genérico, no afirma atomicidad entre archivos y no habilita acciones protegidas.

**Siguiente trabajo:** diseñar el seam mínimo del runtime genérico owner-backed. No repetir la auditoría de dispatch ni settlement ya cubiertos. Mantener separados PREPARED, lineage, observación/reconciliación, settlement y outcome. M0 permanece INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — excepción durante commit de settlement (2026-10-18, validada)

- **Fallo reproducido:** `settlePreparedRepairFromPersistedState()` podía propagar una excepción lanzada por `store.commitIfCurrent()`. La obligación seguía `PREPARED`; el entorno y `execution lineage` podían estar persistidos, pero el caller no recibía un resultado estructurado. La regresión se agregó en `tests/nexo/repair-owner-lifecycle.test.mjs` y falló en CI antes de corregir el punto de entrada.
- **Corrección:** `scripts/nexo-repair-entrypoint.mjs` captura específicamente la excepción alrededor de la liquidación final y devuelve `blocked`, el código original del error, `dispatch`, `lineage`, el valor real de `persisted` y `uncertainty: environment_persisted_but_continuity_settlement_unconfirmed`. No declara `settled_observed`, no elimina la obligación PREPARED y no intenta redispatch en esa invocación.
- **Prueba:** la regresión simula una excepción de escritura del store de continuidad durante `commitIfCurrent`; verifica bloqueo, incertidumbre explícita, revisión ambiental avanzada, lineage conservado y journal aún PREPARED.
- **Validación exacta:** código + regresión en `8d37f804901d410ad5e32c0bc842729d53c8593e`; [CI Nexo M0 — repair settlement crash cuts, run 39160463984](https://github.com/snowdenxrp/aldea-ia/actions/runs/39160463984) SUCCESS.
- **Alcance:** esto cierra una frontera de excepción concreta del lifecycle repair-only. No prueba atomicidad entre archivos, no migra el runtime genérico `src/nexo/runtime.js` y no autoriza efectos protegidos.

**Siguiente trabajo:** revisar las restantes fronteras explícitas de lectura/commit de settlement y sus resultados de conflicto, sin añadir un catch global. Después diseñar la migración arquitectónica del runtime genérico a la continuidad canónica, con PREPARED durable antes de cualquier dispatch y pruebas de crash/restart. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — excepción al confirmar settlement del journal PREPARED (2026-10-18)

- **Hueco reproducido:** `settlePreparedRepairFromPersistedState()` ejecutaba `store.commitIfCurrent()` sin capturar una excepción. Si el store lanzaba error, aunque el entorno y el lineage ya estuvieran persistidos, `runNexoRepairOnce()` terminaba por excepción sin resultado estructurado.
- **Prueba primero:** se añadió un caso que simula fallo de escritura durante settlement después de una reparación y lineage confirmados. La prueba falló en el punto exacto con el error `NEXO_CONTINUITY_WRITE_FAILED`: [run 39155348004](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155348004), SHA `51c0ed94a7362133ddb9a29bd97e15b310dc298d`.
- **Corrección:** `scripts/nexo-repair-settlement.mjs` captura la excepción del commit y devuelve `blocked`, `verified: false` y `uncertainty: settlement_commit_outcome_unknown`. No presume si la escritura llegó o no al almacenamiento durable. `scripts/nexo-repair-entrypoint.mjs` preserva el código concreto del settlement en vez de reemplazarlo por un código genérico.
- **Validación exacta:** implementación + regresión en `67048ebbdd30b49000f3a2bfea5e6a3ef0eb1b74`; [Nexo M0 — repair settlement crash cuts, run 39155469445](https://github.com/snowdenxrp/aldea-ia/actions/runs/39155469445) SUCCESS, job `repair-crash-cuts` SUCCESS. El caso verifica que el entorno permanece en revisión 101, lineage sigue registrado, y el journal conserva `prepared` al no estar confirmado el commit de settlement.
- **Alcance:** se protege la frontera de escritura de settlement; no se afirma que todo el lifecycle carezca de excepciones. No migra `src/nexo/runtime.js`, no amplía el dispatcher repair-only, no habilita efectos protegidos ni afirma atomicidad entre archivos.

**Siguiente revisión:** inspeccionar la frontera de `adapter.execute()` en `scripts/nexo-repair-dispatch.mjs`. Una excepción antes de `persistState()` no debe escapar como excepción cruda; debe devolver un bloqueo claro y dejar PREPARED para revisión/recuperación. Después, seguir con el seam canónico del runtime genérico, sin sustituir legacy memory por imports de owner a ciegas.

**Estado global:** M0 INCOMPLETO; efectos protegidos STOP; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — excepción durante commit de execution lineage después del dispatch (2026-10-18)

- **Hueco reproducido:** el entorno podía quedar persistido y el journal seguir `prepared`, pero si `owner.recordExecutionLineage()` lanzaba una excepción en vez de devolver un resultado estructurado, `runNexoRepairOnce()` dejaba escapar la excepción. La llamada no debía interpretarse como lineage ni settlement confirmado.
- **Prueba primero:** la regresión en `tests/nexo/repair-owner-lifecycle.test.mjs` simula fallo de escritura del owner tras una reparación persistida. El test falló en el punto exacto, reproduciendo el hueco: [repair crash cuts, run 39153970940](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153970940), SHA `0aaefc0afae250472749e1f7405ba561a5414089`.
- **Corrección:** `scripts/nexo-repair-entrypoint.mjs` captura la excepción y devuelve `blocked` con el código de error, el resultado del dispatch, la condición real `persisted` y una incertidumbre explícita. Si el entorno sí se escribió, devuelve `environment_persisted_but_lineage_and_settlement_unconfirmed`; no intenta settlement ni redispatch en esa invocación. El journal permanece PREPARED y una recuperación posterior debe volver a observar el estado persistido.
- **Validación exacta:** código + ambas regresiones de fallo de frontera en `209dde321dbca3bc755e8ee89948ec94db2be2e6`; [Nexo M0 — repair settlement crash cuts, run 39154037675](https://github.com/snowdenxrp/aldea-ia/actions/runs/39154037675) SUCCESS, job `repair-crash-cuts` SUCCESS.
- **Primera frontera relacionada:** la recarga de owner inmediatamente después del commit PREPARED también queda capturada con resultado `blocked`, `preparedCommitted: true` y `dispatched: false`; código `53655508c4ea9b69cd6ab21f6d7463fdfefe8192`, CI [run 39153821932](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153821932) SUCCESS.

**Alcance:** se han endurecido dos excepciones en límites concretos del lifecycle repair-only. No implica que todas las operaciones post-PREPARED estén libres de excepciones, no migra `src/nexo/runtime.js`, no habilita acciones generales/protegidas y no afirma atomicidad entre Nexo y Lúmina. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

**Siguiente frontera:** revisar los límites restantes de settlement/commit para detectar fallos no estructurados sin añadir un catch global que oculte si el efecto pudo ocurrir. Después, continuar el diseño del seam canónico del runtime genérico; no ampliar el dispatcher repair-only.


## M0 — fallo de recarga inmediatamente después de PREPARED (2026-10-18)

- **Hueco reproducido:** `runNexoRepairOnce()` confirmaba el commit de PREPARED y luego llamaba `owner.loadCurrent()` fuera de un `try/catch`. Si esa lectura fallaba, la excepción escapaba de la frontera de runtime sin un resultado estructurado. La obligación permanecía en disco, pero el caller no recibía claramente que PREPARED estaba confirmado y que el dispatch no había ocurrido.
- **Prueba primero:** regresión añadida a `tests/nexo/repair-owner-lifecycle.test.mjs`. El commit de prueba `75e5e968ed234572661495d362586a9fd6e3a107` falló exactamente en la recarga posterior al PREPARED, reproduciendo el hueco: [repair crash cuts, run 39153769377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153769377).
- **Corrección:** `scripts/nexo-repair-entrypoint.mjs` captura ese fallo y devuelve `blocked`, conserva el código de error, `preparedCommitted: true`, `dispatched: false` y `uncertainty: prepared_commit_confirmed_but_journal_reload_unconfirmed`. No intenta recuperar desde una vista obsoleta ni despacha; la obligación PREPARED permanece para una invocación posterior de recuperación.
- **Validación exacta:** código + regresión en `53655508c4ea9b69cd6ab21f6d7463fdfefe8192`; workflow [Nexo M0 — repair settlement crash cuts, run 39153821932](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153821932) SUCCESS, job `repair-crash-cuts` SUCCESS. El test confirma journal PREPARED único, revisión Nexo 1, estado ambiental sin cambio (revisión 80), y cero dispatch.
- **Alcance:** corrige el contrato de fallo de esta frontera de recuperación; no migra `src/nexo/runtime.js`, no autoriza acciones generales/protegidas, no afirma atomicidad entre archivos y no convierte PREPARED en completion.

**Siguiente frontera M0:** diseñar y probar el seam canónico para el primer caller de runtime fuera de la ruta repair-only. No sustituir imports legacy mecánicamente ni generalizar el dispatcher de reparaciones. M0 continúa INCOMPLETO; efectos protegidos STOP; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — la misión también debe ser ejecutable para admitir PREPARED (2026-10-18)

- **Hueco encontrado:** un paso podía seguir `planned` aunque su misión canónica estuviera `blocked`. La comprobación de paso/dependencias no era suficiente por sí sola.
- **Cambio:** `recordPrepared()` ahora exige `mission.status === planned` para una obligación nueva; de lo contrario devuelve `blocked / NEXO_PREPARED_MISSION_NOT_RUNNABLE`, sin avanzar `storeRevision` ni modificar `effectJournal`. Este control se ejecuta después de detectar un PREPARED existente, preservando la recuperación de obligaciones inciertas.
- **Test-first:** SHA `4c5cbf530da03642fb68da62f0abf1e8829bae5e`. [Repair crash cuts 39153079971](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153079971) y [bounded admission/restart 39153080078](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153080078) fallaron en la regresión nueva: el owner devolvía `committed` para una misión `blocked`. STEP 4/STEP 5 pasaron en ese SHA, pero no validan el arreglo.
- **CI verde exacto:** SHA `afb214730a1eca78d7f4a20b01d1a25826c42a5d`: [STEP 5 39153137599](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137599), [STEP 4 39153137708](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137708), [repair crash cuts 39153137714](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137714), [bounded admission/restart 39153137611](https://github.com/snowdenxrp/aldea-ia/actions/runs/39153137611): cuatro SUCCESS.
- **Estado y límite:** refuerza admisión, pero no es el corte del runtime legacy. No acredita autenticación de evidencia, atomicidad entre stores ni finalización de misión. Siguiente: integrar el runtime a través del seam repair-only que ya posee PREPARED durable y conciliación específica, sin abrir efectos genéricos. Nexo/Lúmina separados; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — el owner bloquea PREPARED si el paso no es ejecutable (2026-10-18)

- **Hueco encontrado:** `recordPrepared()` validaba misión/paso/acción/objetivo, pero podía crear una obligación PREPARED para un paso cuyo estado no era `planned` o cuyas dependencias no estaban todas `completed`. La sesión de reparación ya aplicaba estas comprobaciones, pero el owner canónico no las imponía por sí mismo.
- **Cambio:** antes de crear un PREPARED nuevo, el owner exige `step.status === planned` y que cada ID de `dependsOn` corresponda a un paso existente en estado `completed`. Si falla el estado devuelve `blocked / NEXO_PREPARED_STEP_NOT_RUNNABLE`; si falla una dependencia, `blocked / NEXO_PREPARED_DEPENDENCIES_UNMET`. No cambia `storeRevision` ni agrega journal.
- **Orden de checks deliberado:** los checks se ejecutan después de detectar una obligación PREPARED ya existente. Así un replay de obligación sin resolver continúa visible como `prepared_existing`/UNKNOWN aunque la misión cambie después; no se reinterpreta como permiso para redispatch ni se oculta el pendiente.
- **Test-first:** SHA de prueba `71764ddb9dfc511cfe437c6a12dc9f6122a2297b`. [Repair crash cuts 39152101773](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152101773) y [mission/restart continuity 39152101743](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152101743) fallaron en la aserción nueva: el owner anterior devolvía `committed` en vez de `blocked`. STEP 4/STEP 5 pasaron en ese SHA, pero no validan el fix.
- **CI verde exacto de código/pruebas:** SHA `4549662e9cf879a15c4833b011ce5a8122e1c65e`: [mission/restart continuity 39152160229](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160229), [repair crash cuts 39152160394](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160394), [STEP 4 39152160252](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160252), [STEP 5 39152160267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39152160267): los cuatro SUCCESS.
- **Límite / siguiente paso:** el guard protege admisión de PREPARED en el owner; no cambia `src/nexo/runtime.js`, no prueba atomicidad cross-store ni autentica evidencia. Siguiente: definir la frontera de integración canónica runtime sin despacho de acciones genéricas que carezcan de reconciliación específica. Nexo/Lúmina separados; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — replay de outcome con afirmación contradictoria (2026-10-18)

- **Hueco demostrado:** `recordOutcome()` reconocía como `already_recorded` cualquier replay con la misma identidad misión/paso/acción/objetivo, aunque el estado o la evidencia del nuevo outcome contradijeran el intento durable existente. El intento original no se sobrescribía, pero el resultado contradictorio no quedaba explícitamente bloqueado.
- **Contrato corregido:** el replay solo es `already_recorded` cuando coinciden estado, evidencia, `parentMissionId` y `replanReason`, además de la identidad ya validada. Si la identidad coincide pero esos datos difieren, retorna `blocked / NEXO_OUTCOME_RESULT_MISMATCH`; no avanza `storeRevision` y no reemplaza el primer outcome. Un resultado tardío no puede hacer retroceder una finalización previa ni presentarse como replay idéntico.
- **Prueba:** `tests/nexo/continuity-migration.test.mjs` cambió la regresión del outcome `completed` seguido de un replay `failed` para exigir bloqueo y conservación de `storeRevision` y del estado reconstruido `completed`.
- **Test-first:** SHA de prueba `d953e13aa026e52c6dcf3c65f4c18f7e86fc7d37`; [crash cuts 39151769794](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769794) y [bounded admission/restart 39151769766](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151769766) fallaron con la expectativa nueva antes del fix. STEP 4 y STEP 5 pasaron en esa fase, pero no constituyen validación del fix.
- **CI verde tras el fix:** SHA de código/pruebas `783ccdbd5c9871b5c86e1994a2f348211e5e9bd3`: [bounded admission/restart 39151794894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794894), [repair settlement crash cuts 39151794904](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794904), [STEP 4 39151794891](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794891), [STEP 5 39151794922](https://github.com/snowdenxrp/aldea-ia/actions/runs/39151794922): los cuatro SUCCESS.
- **Límite / siguiente paso:** este guard endurece la idempotencia del owner; no migra `src/nexo/runtime.js` del ledger legacy ni autentica la evidencia del caller. No convertir outcome en settlement, no añadir `goalObservations`, no mezclar Nexo/Lúmina, efectos protegidos STOP y STEP 7 OPEN / STOP / UNKNOWN. Siguiente frente: diseñar el cutover canónico mínimo de runtime y sus crash/restart tests antes de sustituir escrituras legacy.

---

## M0 — lineage debe conservar también la revisión PREPARED (2026-10-18)

- **Segundo hueco concreto:** incluso después de comprobar que un replay de lineage repetía exactamente el mismo resultado, `recordExecutionLineage()` podía aceptar una llamada con una revisión ambiental base distinta de la que estaba ligada al journal PREPARED. El resultado guardado por sí solo no bastaba para verificar ese contexto.
- **Cambio:** para acciones de reparación, el replay de una lineage existente ahora revalida que exista exactamente una entrada de journal con revisión ambiental base conocida y que coincida con `operation.environmentStateRevision`. Un baseline distinto devuelve `blocked / NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`; una base ausente/ambigua devuelve `NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`. No escribe ni avanza `storeRevision`.
- **Regresión test-first:** [CI 39150495080](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150495080) falló primero porque el código anterior aceptaba el replay con baseline contradictorio. Tras el guard, la suite de crash cuts [39150515026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515026), STEP 4 [39150514997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150514997), STEP 5 [39150515080](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515080) y bounded mission admission/restart [39150515015](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150515015) terminaron SUCCESS sobre SHA `3bfbad268ac1a9b5ea9492e8db0a90b5972f22d9`.
- **Siguiente frontera:** el contrato de lineage tiene ahora dos checks explícitos de replay: resultado idéntico y baseline PREPARED idéntico. Continuar la integración runtime canónica con pruebas; no crear `goalObservations`, no declarar completion por settlement, no mezclar Nexo/Lúmina, efectos protegidos STOP y STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — rechazo de replay de lineage con resultado contradictorio (2026-10-18)

- **Hueco demostrado:** `recordExecutionLineage()` devolvía `already_recorded` para una clave/identidad ya existente sin comparar el resultado de adaptador persistido con el resultado del replay. No sobrescribía el primer registro, pero ocultaba un conflicto semántico.
- **Cambio:** `src/nexo/core/continuity-owner.mjs` ahora devuelve `blocked / NEXO_EXECUTION_RESULT_MISMATCH` cuando la identidad coincide pero `existing.result` difiere del resultado propuesto. No hay commit nuevo ni avance de `storeRevision` en ese caso.
- **Regresiones:** `tests/nexo/repair-owner-lifecycle.test.mjs` prueba que el replay conflictivo no modifica continuidad; `tests/nexo/continuity-migration.test.mjs` actualiza el contrato previo para exigir bloqueo en vez de aceptar silenciosamente un resultado distinto.
- **Test-first transparente:** CI del test antes del fix [39150256557](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150256557) falló en la nueva aserción porque devolvía `already_recorded`. El primer CI tras el fix [39150274684](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150274684) detectó una expectativa heredada equivalente en la prueba de migración; se corrigió para reflejar el nuevo contrato.
- **CI verde exacto tras alinear implementación y pruebas:** SHA `0653d7216c49dd6a9b0ea7a182333ff18ee07bc3`:
  - [M0 repair settlement crash cuts — 39150332075](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150332075) SUCCESS.
  - [STEP 4 semantic validation — 39150332148](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150332148) SUCCESS.
  - [STEP 5 outcome classification — 39150331964](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150331964) SUCCESS.
  - [bounded mission admission/restart continuity — 39150331921](https://github.com/snowdenxrp/aldea-ia/actions/runs/39150331921) SUCCESS.
- **Límite:** el guard corrige la idempotencia de lineage; no demuestra todavía cutover de `src/nexo/runtime.js`, atomicidad entre stores ni finalización de misión. M0 sigue incompleto; Nexo/Lúmina separados; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.
- **Siguiente paso:** inspeccionar el siguiente hueco mínimo de continuidad después de PREPARED → lineage → settlement sin añadir `goalObservations` ni otros campos nuevos; después avanzar a una ruta runtime canónica con pruebas de proceso/reinicio.

---

## M0 — replay de objetivo observado y no-redispatch (2026-10-18)

- Se reforzó `tests/nexo/repair-mission-verification.test.mjs`: después de `goal_observed`, la reconstrucción canónica sigue manteniendo misión/paso en `blocked` con `NEXO_REPAIR_SETTLED_BY_OBSERVATION`; no se interpreta la observación como completion ni se permite redispatch.
- **CI exacto:** [39144434201](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144434201), commit de código/pruebas `ec36dd7df7cccf57f372d2cf252444ce28292e84`, workflow `Nexo M0 — repair settlement crash cuts` SUCCESS. El job `repair-crash-cuts` y el nuevo paso de verificación terminaron SUCCESS.
- La prueba cubre objetivo presente, replay de lectura tras reabrir el owner, objetivo ausente en una revisión posterior, PREPARED pendiente, misión desconocida y el hecho de que la reconstrucción permanece bloqueada después de observar el objetivo.
- **Contrato actual:** `goal_observed` es efímero/read-only; el journal `settled_observed` permanece durable; la misión reconstruida sigue bloqueada. Aún no existe transición durable de misión a finalización, intencionalmente.
- HEAD validado por ese CI: `ec36dd7df7cccf57f372d2cf252444ce28292e84`. Verificar HEAD y CI de nuevo después de estas actualizaciones documentales.
- Siguiente paso: decidir desde el contrato existente si una observación de objetivo debe persistirse como registro distinto, enlazado a revisión del entorno, sin mutar `effectJournal` ni promoverlo a completion. Antes de implementar, añadir casos de stale revision, pérdida posterior de invariante y CAS/restart. No crear estados/campos sin especificación.
- M0 sigue abierto; runtime genérico no migrado; Nexo/Lúmina separados; no atomicidad cross-store; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — contrato de observación del objetivo tras settlement (2026-10-18)

- Añadida regresión `tests/nexo/repair-mission-verification.test.mjs` y conectada al workflow `.github/workflows/nexo-m0-repair-crash-cuts.yml`.
- CI exacto [39144348792](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144348792) terminó SUCCESS en commit `1d12c8e65aff1be75b04c0acee2fbc513b8ba5f4`; el job `repair-crash-cuts` y todos sus pasos, incluido `Run persisted repair mission goal verification regression`, terminaron success.
- Casos probados: objetivo observado después de `settled_observed` con `missionCompleted:false` y `causalAttribution:not_claimed`; verificación repetida tras reabrir owner sin mutación de continuidad; objetivo ausente en una revisión de entorno posterior bloquea la observación; PREPARED pendiente bloquea con `NEXO_EFFECT_RECONCILIATION_REQUIRED`; misión desconocida devuelve UNKNOWN.
- La semántica queda separada: `settled_observed` registra una observación del efecto; `goal_observed` informa que la invariante del objetivo está presente ahora. Ninguno declara por sí mismo `missionCompleted:true`, causalidad ni autorización.
- El test nuevo pasa en CI sobre el commit que incluye el workflow y el test. HEAD actual puede ser posterior por las actualizaciones documentales; no atribuir el PASS a cambios posteriores sin otro run.
- Próximo paso: determinar si el contrato de misión necesita una transición durable explícita de estado “goal observed” y bajo qué regla, sin confundirla con completion. No agregar campos/estados nuevos hasta auditar el contrato y probar las consecuencias de replay/CAS. Después abordar una ruta de runtime canónica mínima.
- M0 sigue abierto; runtime genérico no migrado; Nexo/Lúmina separados; sin atomicidad cross-store; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — auditoría de frontera de memoria legacy/runtime (2026-10-18)

- Auditoría dirigida documentada en [NCS_M0_LEGACY_RUNTIME_MEMORY_CUTOVER_AUDIT_2026-10-18.md](BUILD/NCS_M0_LEGACY_RUNTIME_MEMORY_CUTOVER_AUDIT_2026-10-18.md), commit `f2b14a63665df50a99ea576d44db00092e2f7ca4`.
- Hallazgo raíz: `src/nexo/runtime.js` ejecuta el adapter antes de confirmar un ciclo owner-backed durable; después registra plan, execution y outcome sobre una proyección de memoria legacy en proceso. El lock `WeakMap` no sustituye CAS ni persistencia entre procesos.
- Incompatibilidad confirmada: `owner.recordOutcome()` bloquea `completed` cuando el mismo paso tiene efecto `prepared` o `settled_observed`; `recordExecutionLineage()` requiere PREPARED y no liquida el journal. Por eso no es seguro cambiar imports por llamadas directas al owner ni convertir `settled_observed` en completion.
- Se mapeó el rol de `scripts/assistants.mjs`: registra misión en el store canónico y usa una vista legacy temporal para construir el plan; el puente CLI de reparación continúa opt-in y limitado a tres reparaciones. No se ha demostrado un cutover del runtime genérico.
- Evidencia base disponible: [CI 39143459529](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143459529), SUCCESS en SHA de código/pruebas `a1fea5791adbb81a8d6b6e82da9dad09accc7918`. El HEAD documental actual no tiene un CI nuevo asociado; no extrapolar el PASS.
- **Siguiente paso:** probar cómo se representa un outcome de misión tras settlement sin conflar journal/outcome/completion; luego diseñar la conexión owner-backed mínima sobre misión/paso canónicos, con CAS y crash/restart/replay. Mantener legacy y flag opt-in hasta que esa regresión pase.
- M0 incompleto; Nexo/Lúmina separados; no atomicidad cross-store; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — prueba de proceso real del CLI aislado (2026-10-18)

- Se habilitaron rutas de archivos configurables mediante `NEXO_STATE_PATH`, `NEXO_LUMINA_MEMORY_PATH` y `NEXO_CONTINUITY_PATH`. Sin esas variables, los paths de producción permanecen iguales; la prueba usa exclusivamente un directorio temporal.
- Se añadió `tests/nexo/assistants-runtime-cli.test.mjs`, que inicia el proceso real `scripts/assistants.mjs` dos veces con fixtures independientes: (a) modo por defecto: no aparece resultado de sesión y el journal no recibe efectos; (b) con `--nexo-repair-once`: se ejecuta una reparación canónica, el journal termina `settled_observed`, el entorno avanza de revisión 1 a 2 y el JSON reporta esa revisión final. También verifica que el estado persistido no incluya `nexoMemory`.
- El fixture reveló una brecha de procedencia de destino: los hallazgos `AGENT_POSITION`/`INVALID_NEED` no incluían `agent`, por lo que el plan podía producir `target: null`. Se corrigió `src/assistants/debugger.js` para adjuntar el ID del agente al hallazgo; ahora el target del plan se origina en la observación y la sesión lo vuelve a leer de la misión persistida.
- CI exacto: [run 39143459529](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143459529), SHA de código/pruebas `a1fea5791adbb81a8d6b6e82da9dad09accc7918`, SUCCESS. El job `repair-crash-cuts` pasó las regresiones de crash, migración, ciclo de vida, sesión, sintaxis y CLI aislado.
- El primer intento de CLI test falló por fixture incompleto (faltaba continuidad heredada explícita); segundo intento identificó el código de salida de diagnóstico esperado por el hallazgo intencional. Se corrigió el fixture y la aserción para separar el estado diagnóstico inicial del resultado de la reparación. No se ocultó ni reinterpretó el fallo inicial.
- **Límite:** prueba de proceso aislada con archivos temporales, no ejecución contra datos reales del usuario. La salida puede conservar exit code de diagnóstico `error` porque el reporte inicial se genera antes de reparar; el resultado de reparación se informa por separado y no borra la evidencia previa.
- **Siguiente frontera:** estudiar un adaptador de reporte posterior a reparación solo si usa una observación independiente del estado persistido; no convertir `settled_observed` en causalidad ni en finalización de misión. Después, diseñar el cutover de continuidad de runtime sin doble escritura ni estado de Lúmina mezclado.
- M0 incompleto; repair runtime sigue opt-in; efectos protegidos STOP; no atomicidad cross-store; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — puente opt-in hacia la entrada real de asistentes (2026-10-18)

- **Nuevo puente:** `scripts/nexo-runtime-session.mjs` exporta `runNexoRuntimeRepairSession()`. Selecciona una misión canónica sin ambigüedad y únicamente un paso `planned` de reparación cuyos prerequisitos estén `completed`; después delega en la sesión repair-only, que vuelve a leer la continuidad y deriva acción/target del snapshot.
- **Entrada real con opt-in:** `scripts/assistants.mjs` importa el puente. Solo lo ejecuta si el proceso recibe explícitamente `--nexo-repair-once`, después de persistir primero el snapshot de entorno de esa ejecución. Así el guardado previo no puede sobrescribir posteriormente el resultado de la reparación. El comportamiento normal sigue sin ejecutar reparaciones automáticamente.
- **Cierre de hueco contractual:** `scripts/nexo-repair-session.mjs` ahora rechaza cualquier paso que no esté exactamente en `planned` y bloquea dependencias no satisfechas incluso si alguien llama directamente a la sesión.
- **Pruebas:** `tests/nexo/repair-session.test.mjs` prueba el puente de runtime, flujo repair-only, recuperación después de reabrir el owner desde disco, no redispatch, acción no elegible, dependencias no satisfechas y separación de `world-state.json`. Workflow también ejecuta `node --check` sobre puente y `scripts/assistants.mjs`.
- **CI exacto:** [run 39143194694](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143194694), SHA `3c414ff2d0b8ebd8f880e8a37e83602138924395`, SUCCESS. Job `repair-crash-cuts`, las cuatro regresiones y la comprobación sintáctica finalizaron correctamente. La suite ya había pasado en SHA de código/pruebas `93dc2cf3ed070fed35298a4777e43804e862fdef` en [run 39143167854](https://github.com/snowdenxrp/aldea-ia/actions/runs/39143167854); el run más reciente incluye además el chequeo de sintaxis.
- **Alcance real:** ya hay un camino opt-in desde la entrada de asistentes hacia una sesión Nexo owner-backed, limitado a reparaciones. No es todavía el runtime genérico completo ni un cutover por defecto. No se ha ejecutado contra datos de usuario reales; la evidencia es CI con fixtures temporales. El puente no permite `execute_lumina_action`, acciones protegidas ni misión completada por `settled_observed`.
- **Siguiente paso:** crear una prueba de proceso/CLI aislada con directorio temporal y estado canónico que invoque `scripts/assistants.mjs --nexo-repair-once` sin tocar `world-state.json` real; comprobar que el flag opt-in termina en salida reportada, que el revision final corresponde al estado después de reparación y que el modo por defecto no dispatcha. Solo después evaluar la sustitución gradual de la ruta legacy; no enrutar `executeNexoStep()` genérico hacia este dispatcher.
- **No cambiar:** no atomicidad cross-store, no memoria Nexo dentro de Lúmina, efectos protegidos STOP, STEP 7 OPEN / STOP / UNKNOWN, M0 sigue incompleto.

---

## M0 — primera sesión owner-backed repair-only (2026-10-18)

- Implementada `scripts/nexo-repair-session.mjs`, API `runNexoRepairSession()`: el caller solo selecciona `missionId` y `stepId`; misión/paso/acción/target se derivan del snapshot canónico de Nexo. Lista cerrada: `repair_agent_state`, `repair_agent_needs`, `repair_resource_state`; las demás acciones se bloquean antes de PREPARED/dispatch.
- Añadida `tests/nexo/repair-session.test.mjs`: prueba de flujo completo a través de la sesión (PREPARED → dispatch condicional → `settled_observed`), rechazo de acción no elegible y crash cut tras persistencia del entorno con reapertura del owner; la sesión recupera la observación sin redispatch. También verifica que `world-state.json` no contiene `nexoMemory`.
- CI exacto: [run 39142674734](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142674734), SHA de código/pruebas `b011a8078f9f0562a61a3bafb9c260810147ea84`, SUCCESS. Job `repair-crash-cuts` y los cuatro pasos de pruebas terminaron `success`. El commit anterior `e7eb932` falló por imports relativos incorrectos del test; corregido en el siguiente commit y validado en este PASS.
- Esto es una sesión real owner-backed para la ruta repair-only y su prueba de reinicio; **todavía no está conectada a `src/nexo/runtime.js` ni demuestra arranque productivo completo**. No hay ejecución genérica, causalidad, mission completion ni atomicidad cross-store.
- Documentos de contrato/handoff ya existentes deben considerarse actualizados a partir de este incremento. M0 sigue incompleto; efectos protegidos STOP; PREPARED/`settled_observed` UNKNOWN hasta verificación de objetivo; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — contrato de sesión de runtime acotado (2026-10-18)

- Revalidado el HEAD de rama antes de continuar: `7ed44d7179988e07cd0e19bbe5a5ab486eb9e191`. El CI de repair-only más reciente verificado sigue siendo [39142213418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142213418), sobre el SHA de código/pruebas `e36121220d4d89475a68bc4bf1a0d2880b4092be`; no es un PASS sobre el HEAD documental posterior.
- Auditoría dirigida del seam actual: `src/nexo/runtime.js` aún ejecuta outcomes mediante `src/assistants/memory.js`; `scripts/assistants.mjs` registra misión en el owner separado pero no ejecuta la misión; `runNexoRepairOnce()` es una entrada de script repair-only, no el runtime productivo.
- Se creó [NCS_M0_RUNTIME_SESSION_CONTRACT_2026-10-18.md](BUILD/NCS_M0_RUNTIME_SESSION_CONTRACT_2026-10-18.md), commit [d654583139df69202a726981a53878f32219cffa](https://github.com/snowdenxrp/aldea-ia/commit/d654583139df69202a726981a53878f32219cffa). Define el contrato mínimo para la primera sesión owner-backed: misión canónica, identidad de paso no sustituible por caller, PREPARED durable antes de dispatch, lista cerrada de reparaciones elegibles, settlement distinto de completion, recuperación fail-closed y pruebas a través de la API de sesión real.
- **No se cortó runtime ni se afirma CI nuevo**: el cambio es documental y el contrato todavía debe materializarse en pruebas/código. El siguiente trabajo debe ser test-first sobre una API de sesión owner-backed; no reemplazar imports en `runtime.js` ni enrutar `executeNexoStep()` genérico hacia el dispatcher de reparación.
- Límites sin cambio: M0 incompleto; no atomicidad cross-store; efectos protegidos STOP; PREPARED/`settled_observed` sin resolver UNKNOWN; Nexo y Lúmina separados; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — entrypoint repair-only (2026-10-18)

- Implementado `scripts/nexo-repair-entrypoint.mjs` con `runNexoRepairOnce()`; la entrada está limitada a reparaciones convergentes.
- Comprueba identidad de PREPARED, observa el entorno persistido antes de recuperar una obligación existente y bloquea si la revisión cambió o el contexto no coincide.
- El settlement solo registra `settled_observed`; no completa la misión ni afirma causalidad.
- CI verificado en [run 39142213418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39142213418), SHA `e36121220d4d89475a68bc4bf1a0d2880b4092be`, SUCCESS. Incluye crash recovery antes del dispatch y caso de invariante ya satisfecha sin escritura.
- Límite: todavía no existe llamada desde `src/nexo/runtime.js` ni desde el arranque general. El runtime heredado sigue usando `src/assistants/memory.js`. No hay atomicidad cross-store demostrada; efectos protegidos siguen fuera de alcance y las misiones no se marcan completadas.

---

## M0 — crash cut: entorno persistido antes del settlement (2026-10-18)

- Test de reinicio añadido en `tests/nexo/repair-owner-lifecycle.test.mjs`, commit [55f9a064dd28ed5b51eb552f903f3bec504f9640](https://github.com/snowdenxrp/aldea-ia/commit/55f9a064dd28ed5b51eb552f903f3bec504f9640).
- Secuencia probada: PREPARED enlazado a entorno revisión 30 → dispatch persiste revisión 31 → se descarta el owner inicial → se reabre continuidad desde disco → settlement observa la invariante persistida y marca `settled_observed` → replay bloqueado, entorno sigue en revisión 31.
- CI exacto: [run 39141847081](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141847081), sobre el SHA de prueba `55f9a064dd28ed5b51eb552f903f3bec504f9640`, completó **SUCCESS**. Job `repair-crash-cuts` y sus tres pasos de regresión finalizaron `success`.
- Alcance: demuestra recuperación mediante helpers y owner/store existentes en una simulación de reinicio dentro del mismo proceso de test; no demuestra todavía arranque real de la aplicación productiva ni atomicidad entre archivos.
- Siguiente frontera: definir y probar una entrada repair-only coherente que use continuidad propietaria de Nexo sin convertir Lúmina en dueña de memoria/identidad, y decidir el corte de runtime solo después de documentar sus contratos y fallos.

---

## M0 — replay y revisión obsoleta: regresiones añadidas, CI pendiente (2026-10-18)

- Test actualizado: `tests/nexo/repair-owner-lifecycle.test.mjs`, commit [53cf292ae966c80eb722a7f48eec0c6c2c86595d](https://github.com/snowdenxrp/aldea-ia/commit/53cf292ae966c80eb722a7f48eec0c6c2c86595d).
- Caso A — replay después de `settled_observed`: el dispatch debe bloquearse con `NEXO_PREPARED_JOURNAL_ENTRY_UNKNOWN`, sin cambiar la revisión del entorno ni la revisión del store Nexo.
- Caso B — estado de entorno cambia de revisión 20 a 21 después de PREPARED: dispatch debe bloquearse con `NEXO_PREPARED_ENVIRONMENT_REVISION_STALE`, conservar el estado de entorno en revisión 21 y dejar el journal en PREPARED para reconciliación.
- CI exacto: [run 39141470114](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141470114), sobre el SHA de prueba `53cf292ae966c80eb722a7f48eec0c6c2c86595d`, completó **SUCCESS**. Job `repair-crash-cuts` y los tres pasos de regresión (crash cuts, migración de continuidad y lifecycle integrado) finalizaron `success`.
- Alcance: regresiones de los helpers repair-only; no es una integración de `src/nexo/runtime.js`, no prueba atomicidad cross-store y no autoriza efectos protegidos.

---

## M0 — repair lifecycle CI trigger coverage (2026-10-18)

- Corrected `.github/workflows/nexo-m0-repair-crash-cuts.yml` path filters to include preparation, dispatch, settlement, mission verification, continuity migration, and the lifecycle test itself. Before this correction, edits to preparation/dispatch/lifecycle test did not reliably trigger this focused workflow.
- Workflow correction commit: `f54dcc9452d3010fe9fb4463786d263b9d8eaac4`.
- Exact-head CI [39141182732](https://github.com/snowdenxrp/aldea-ia/actions/runs/39141182732) completed **SUCCESS** on `f54dcc9452d3010fe9fb4463786d263b9d8eaac4`. The `repair-crash-cuts` job and all three regression steps completed successfully.
- Scope is precise: this validates the tests currently included in the workflow. Explicit replay-after-settlement and stale-environment-revision dispatch regressions remain a next test task; do not infer those cases from this PASS. Production `runtime.js` owner cutover remains pending; M0 incomplete.

---

## M0 — owner-backed repair lifecycle integration regression (2026-10-18)

- Added `tests/nexo/repair-owner-lifecycle.test.mjs` to exercise the actual existing owner/store + repair helpers in one flow: strict persisted baseline revision 10 → durable PREPARED → conditional repair persistence at revision 11 → separate `settled_observed` commit → read-only `goal_observed`.
- Assertions require that PREPARED is durable before dispatch, the Nexo store revision advances only at the expected commits (0→1→2), the verifier does not mutate continuity, the result does not claim mission completion or causal attribution, and `world-state.json` excludes `nexoMemory`.
- CI workflow updated to run the new regression after existing repair crash-cut and continuity migration tests.
- Evidence: test commit `eddf41c542b252329e45304245728a7bdb5d6800`; workflow commit `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`; focused CI [39140959531](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140959531) completed **SUCCESS** on exact workflow HEAD `d3bce60a5d53df8ffa5caf1fb987fccfe0116620`. Job `repair-crash-cuts` and all three test steps (repair crash cuts, continuity migration, owner-backed lifecycle integration) succeeded. This PASS applies to that code/workflow SHA, not later documentation-only HEADs.
- This test is an integration regression for the existing repair-only helpers, not the production `runtime.js` owner cutover. No non-repair/protected effects are authorized. M0 remains incomplete; ambiguous PREPARED stays UNKNOWN; Nexo/Lúmina stores remain separate.

---

## M0 — Runtime integration seam revalidated (2026-10-18)

- Reused existing P112/AB104 findings and checked the current source seam without reopening the historical audit.
- `scripts/assistants.mjs` persists mission plans through the independent Nexo owner, but does not execute missions. `scripts/simulate.mjs` opens continuity for migration/reporting but does not execute missions. `src/nexo/runtime.js` still has a legacy-memory outcome path.
- Therefore this is **not** a simple import replacement: the missing component is a real owner-backed execution lifecycle. It must carry the owner store revision, persist mission and PREPARED before eligible dispatch, keep execution lineage/outcome separate from journal settlement, and recover ambiguous cross-store results without redispatch.
- Confirmed the separation regression already asserts that `world-state.json` excludes `nexoMemory` and that `applyState()` does not attach Nexo continuity to the Lúmina simulation. Preserve this boundary.
- Decision/checkpoint updated: [NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md](BUILD/NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md).
- **No runtime code cutover made** because no production execution owner exists yet and `recordOutcome()` cannot authenticate external evidence or settle `prepared`/`settled_observed`.
- Next: test-first, owner-backed session contract for the narrow repair-only path. Keep non-idempotent/protected dispatch blocked. M0 incomplete; unresolved effects UNKNOWN; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — Owner-backed durable outcome recording (2026-10-18)

- Added `recordOutcome({ expectedRevision, outcome })` to `src/nexo/core/continuity-owner.mjs`, so the Nexo-owned store can durably record a mission-step outcome through `commitIfCurrent()`.
- The method checks stored mission/step/action/target identity, rejects invalid completion evidence, preserves the first attempt, and returns `authorization: "NOT_EVALUATED"`; it never settles `effectJournal`.
- Completion is blocked while the same step has an unresolved `prepared` or `settled_observed` journal entry. A blocked outcome may be persisted, but reconstruction still lets the unresolved effect dominate.
- Added regressions to `tests/nexo/continuity-migration.test.mjs` for evidence requirements, durable reconstruction, replay immutability, and unresolved-effect guards.
- Exact source + test head: [c7a8852b791dec8a2bee64cda6126aa1658af198](https://github.com/snowdenxrp/aldea-ia/commit/c7a8852b791dec8a2bee64cda6126aa1658af198).
- Focused workflow now runs continuity migration plus repair crash cuts: [run 39140292963](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140292963) — SUCCESS, both test steps completed. Mission/restart [39140282526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282526), STEP 4 [39140282510](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282510), and STEP 5 [39140282488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39140282488) also passed for the source/test head.
- Full checkpoint: [NCS_M0_OWNER_DURABLE_OUTCOME_RECORDING_2026-10-18.md](BUILD/NCS_M0_OWNER_DURABLE_OUTCOME_RECORDING_2026-10-18.md).
- **Limits:** runtime still uses legacy memory; no runtime cutover, independent evidence verification, cross-store atomicity, authority, or protected-effect authorization is claimed. M0 remains incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

Next: test-first runtime integration. Reuse existing P112/PG-009 findings. Do not dispatch effects through this new API until PREPARED-before-dispatch, unresolved-effect recovery, and persistence/restart behavior are covered end-to-end.

---

## M0 — Current-state goal regression guard (2026-10-18)

- Regression test commit: [5f7d268bc92920aad25599f6d2689267e18fd98a](https://github.com/snowdenxrp/aldea-ia/commit/5f7d268bc92920aad25599f6d2689267e18fd98a).
- Added a separate persisted environment fixture where the repair invariant regresses after a prior `settled_observed` journal record. The mission verifier must return `blocked` / `NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT`, not `goal_observed` or mission completion.
- Exact-head CI for this test commit is NOT YET VERIFIED. The available GitHub status/workflow connector has not returned check records; no PASS claim.
- This proves re-observation detects a regressed invariant when it reads that state. It does NOT close the race between reading Lúmina's file and a later Nexo continuity write; no durable goal-observation write has been introduced.

Next: verify CI on the exact test commit; then define whether durable observation needs an environment-revision fence spanning both stores. Do not invent cross-file atomicity. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — Mission verifier exact-coverage hardening (2026-10-18)

- Code commit: [25598ba80e377cdf39498991f29abc665a4ded69](https://github.com/snowdenxrp/aldea-ia/commit/25598ba80e377cdf39498991f29abc665a4ded69).
- Code + regression-test head: [b74cc37edfad915fc8cc5deaf9269c6f15b28872](https://github.com/snowdenxrp/aldea-ia/commit/b74cc37edfad915fc8cc5deaf9269c6f15b28872).
- Fixed two false-positive paths in `verifyRepairMissionGoalFromPersistedState()`: duplicate mission step IDs could let one journal entry satisfy multiple steps; extra journal entries outside the declared step set were ignored.
- Verifier now rejects duplicate IDs as `NEXO_REPAIR_MISSION_STEP_OR_DEPENDENCY_UNSUPPORTED` and non-exact journal coverage as `NEXO_REPAIR_MISSION_JOURNAL_COVERAGE_MISMATCH`. Regressions added to `tests/nexo/simulation-restart-persistence.test.mjs`.
- Exact-head CI: NOT YET VERIFIED. Available status/workflow lookup returned no records; this is not a PASS.
- No runtime wiring, mission completion, causal attribution, protected-effect authorization, or cross-store atomicity claim.

Next: verify Actions for exact head; then test the race between environment observation and durable continuity recording. Continuity CAS alone cannot atomically fence the separate Lúmina state file.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.

---

## M0 — Read-only mission goal verification contract hardened (2026-10-18)

- Added `scripts/nexo-repair-mission-verification.mjs`: verifies that every step in a repair-only mission has one `settled_observed` journal entry and that every desired invariant is present in one current strict-loaded environment snapshot. It returns `goal_observed`, `missionCompleted: false`, and `causalAttribution: "not_claimed"`.
- Added dependency-cycle rejection and regression. Runtime replan remains blocked until a separate goal-verification/persistence contract is established.
- Exact tested head: [`1ae28c8570e76191663ed045e6d68644df17a52c`](https://github.com/snowdenxrp/aldea-ia/commit/1ae28c8570e76191663ed045e6d68644df17a52c).
- Exact-head CI PASS: mission/restart [39133517131](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517131), outcome [39133517097](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517097), semantic [39133517074](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133517074).
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).
- Remaining: persist a separately scoped goal-observed record using continuity CAS, define which mission step statuses may become executable, and verify mission semantics before any runtime cutover. No claim of mission completion, causal attribution, authority, or cross-store atomicity.

---

## M0 — Runtime replan now respects observed-settlement uncertainty (2026-10-18)

- `replanPersistedNexoMission()` refuses successor creation if the previous mission has a `settled_observed` repair entry, returning `NEXO_REPAIR_GOAL_VERIFICATION_REQUIRED`. Unresolved `prepared` still returns the existing reconciliation veto.
- Test confirms no successor mission is appended and journal state remains unchanged.
- Exact tested head: [`9610580f838ea2f55a482f64a28f18d84cac202e`](https://github.com/snowdenxrp/aldea-ia/commit/9610580f838ea2f55a482f64a28f18d84cac202e).
- Exact-head CI PASS: mission/restart [39133373970](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373970), outcome [39133373980](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373980), semantic [39133373987](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133373987).
- Remaining gate: define a distinct mission-level goal verifier; observed repair state is not mission completion. No runtime cutover or non-idempotent action settlement until that contract is proven.

---

## M0 — Settlement negative cases + safe reconstruction guard verified (2026-10-18)

- Added negative tests: desired invariant absent/unknown does not settle; an environment revision beyond the allowed prepared-revision window does not settle; ambiguous continuity commit result stays UNKNOWN and PREPARED remains durable.
- Fixed mission reconstruction: `settled_observed` no longer lets its step reappear as planned/executable. The mission remains blocked at `verify_observed_repair_goal` until a separate goal verifier resolves it; no causal completion claim.
- Latest exact tested head: [`4cadf1831ecbd3664964c410ac8bc1397fd22a2e`](https://github.com/snowdenxrp/aldea-ia/commit/4cadf1831ecbd3664964c410ac8bc1397fd22a2e).
- Exact-head CI PASS: mission/restart [39133277523](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277523), outcome [39133277522](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277522), semantic [39133277520](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133277520).
- Detailed checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).
- Next: validate runtime compatibility of `settled_observed` and mission verification semantics; do not wire runtime until explicit mission-level verifier exists. No non-idempotent actions, no cross-store atomicity claim, no authority implication.

---

## M0 — Repair settlement now records persisted invariant observation (2026-10-18)

- Added `scripts/nexo-repair-settlement.mjs`: re-loads the durable Nexo journal and strict environment snapshot, requires one matching PREPARED repair, validates the action-specific invariant, constrains environment revision to the prepared revision or immediate successor, and commits `settled_observed` through continuity-store compare-and-commit.
- Settlement evidence explicitly records `causalAttribution: "not_claimed"`: observed desired state is not proof this operation caused it. No atomicity is claimed across Lúmina and Nexo files.
- Exact code/test head: [`72bb686a4d6b84d6cd058751005dbe34cda1d273`](https://github.com/snowdenxrp/aldea-ia/commit/72bb686a4d6b84d6cd058751005dbe34cda1d273).
- Exact-head CI PASS: mission/restart [39133009763](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009763), semantic [39133009760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009760), outcome [39133009772](https://github.com/snowdenxrp/aldea-ia/actions/runs/39133009772).
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_SETTLEMENT_CHECKPOINT_2026-10-18.md).
- Next: add negative tests for absent/unknown invariant and unrelated environment revision; test continuity commit failure/ambiguous result; review reconstruction semantics before runtime wiring. No non-idempotent settlement or runtime cutover.

---

## M0 — Repair preparation + conditional dispatch fence implemented; exact-head CI PASS (2026-10-18)

- `scripts/nexo-repair-preparation.mjs` loads the environment through `loadStateStrict()` and derives the revision recorded in PREPARED; callers do not supply the integer to this helper.
- `scripts/nexo-repair-dispatch.mjs` derives the operation from exactly one durable PREPARED journal entry, refuses missing entries and stale environment revisions, runs only the three convergent repairs, and persists changed state through `persistState(expectedRevision, stateRevision)` with strict reload comparison.
- The helper intentionally leaves Nexo PREPARED unresolved after environment persistence. It is not terminal settlement and does not claim cross-file atomicity.
- Exact code/test head: [`64f8329aef2ba050e9600227e2661f56fb75e21d`](https://github.com/snowdenxrp/aldea-ia/commit/64f8329aef2ba050e9600227e2661f56fb75e21d).
- Exact-head CI PASS: mission/restart [39132820121](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820121), semantic [39132820068](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820068), outcome [39132820026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820026).
- Checkpoint: [NCS_M0_REPAIR_PREPARE_DISPATCH_REVISION_FENCE_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_PREPARE_DISPATCH_REVISION_FENCE_CHECKPOINT_2026-10-18.md).
- Next: test write-failure/commit-ambiguity crash cuts and define repair-only terminal settlement from repository-derived evidence with continuity compare-and-commit. Do not generalize to non-idempotent effects or migrate runtime before this gate.

---

## M0 — New repair PREPARED intents bind the persisted environment revision (2026-10-18)

- `recordPrepared()` now requires `environmentStateRevision` for the three convergent repair actions and stores it on the PREPARED entry.
- Existing PREPARED repair entries cannot be rebound to a different revision. Legacy entries without a revision remain unresolved and report UNKNOWN; omission on a new repair intent is blocked.
- Code/test head: [`d0e38809992be291262153b527ec21a4793ac3d6`](https://github.com/snowdenxrp/aldea-ia/commit/d0e38809992be291262153b527ec21a4793ac3d6).
- Checkpoint: [NCS_M0_PREPARED_REPAIR_REVISION_BINDING_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_PREPARED_REPAIR_REVISION_BINDING_CHECKPOINT_2026-10-18.md).
- **Not yet an end-to-end dispatch fence:** the owner still receives the revision from its caller; it does not itself load the strict environment snapshot, and adapter mutation is not yet conditional on the durable revision. No settlement API/runtime cutover.
- Next: derive the revision from a strict persisted snapshot inside a Nexo-owned preparation path; guard dispatch against the same durable revision using existing conditional persistence; keep PREPARED on stale/conflict; add crash-cut tests.

---

## M0 — Ambiguous repair target now fails closed; exact-head CI PASS (2026-10-18)

- Read-only repair observation now requires exactly one matching agent for `repair_agent_state` and `repair_agent_needs`; duplicate IDs return UNKNOWN instead of selecting the first match. Resource lookup requires an own property so inherited object members cannot masquerade as persisted resources.
- Code/test commit: [`f6ad72da4f0caff056a21dbdf8835391844c6b0c`](https://github.com/snowdenxrp/aldea-ia/commit/f6ad72da4f0caff056a21dbdf8835391844c6b0c).
- Exact-head CI PASS: semantic [39132380744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380744), outcome [39132380742](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380742), mission/restart [39132380735](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132380735).
- Checkpoint: [NCS_M0_AMBIGUOUS_REPAIR_TARGET_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_AMBIGUOUS_REPAIR_TARGET_CHECKPOINT_2026-10-18.md).
- Still not settlement: PREPARED lacks persisted environment revision binding; revision observation is not atomic against later writers. No runtime cutover.
- Next: design explicit environment revision binding and dispatch/recovery fencing before any terminal settlement API.

---

## M0 — Missing/stale environment revision binding now explicitly classified (2026-10-18)

- Added `comparePersistedRepairRevision()` to the read-only repair observer. Matching revision → `current`; differing valid revisions → `stale`; missing PREPARED binding or invalid current revision → `unknown`.
- Crucially, it does not substitute the current environment revision when PREPARED has no recorded revision. Existing PREPARED schema currently has no authoritative environment revision field.
- Code/test commit: [`db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f`](https://github.com/snowdenxrp/aldea-ia/commit/db36ee40f44c06aae0e168c4dd36e6cbb3d0e01f).
- Exact-head CI PASS: mission/continuity [39132287649](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287649), outcome [39132287652](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287652), semantic [39132287648](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132287648). Mission workflow explicitly passed `simulation-restart-persistence.test.mjs`.
- Checkpoint: [NCS_M0_REVISION_FENCE_OBSERVATION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REVISION_FENCE_OBSERVATION_CHECKPOINT_2026-10-18.md).
- Hard boundary: this is stale-state detection, not atomic fencing. PREPARED lacks environment revision binding and two-store settlement is still unresolved. Do not wire runtime or settle from this observer alone.
- Next: define PREPARED revision binding + adapter dispatch fence + recovery recheck + continuity compare-and-commit settlement, with crash cuts at each boundary. Non-idempotent actions remain UNKNOWN.

---

## M0 — Read-only persisted repair observer added; exact-head CI PASS (2026-10-18)

- Added `src/nexo/adapters/persisted-repair-observation.mjs`: action-specific, read-only classification for `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state`.
- Outcomes are `desired_state_present`, `desired_state_absent`, or `unknown`; unknown snapshot revision, target/schema ambiguity, and unknown `alive` fail closed. The observer does not mutate the snapshot, settle PREPARED, or authorize retry.
- Code/test commit: [`8a89ef9b83b3126db3e83122a7876abe2a78819f`](https://github.com/snowdenxrp/aldea-ia/commit/8a89ef9b83b3126db3e83122a7876abe2a78819f).
- Exact-head CI PASS: mission/continuity [39107811320](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811320), semantic [39107811311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811311), outcome [39107811306](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107811306). Mission log confirms read-only observation + crash-cut regressions passed.
- Checkpoint: [NCS_M0_REPAIR_OBSERVATION_CONTRACT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_REPAIR_OBSERVATION_CONTRACT_CHECKPOINT_2026-10-18.md).
- Boundary: observer assumes `loadStateStrict()` supplied the snapshot; it does not authenticate the file or make observation atomic with writes. PREPARED still lacks binding to an authoritative environment revision. No settlement API/runtime cutover.
- Next: settle the repair-only contract and address the environment revision/concurrent-write race before any owner settlement. Non-idempotent actions remain UNKNOWN.

---

## M0 — Durable repair crash-cut test added; exact-head CI PASS (2026-10-18)

- Added a restart regression that persists `repair_agent_state` to the authoritative Lúmina snapshot after Nexo has committed PREPARED, then reopens both stores.
- The repaired coordinate and explicit `alive:true` survive strict snapshot reload, while Nexo's separate journal correctly remains `prepared`; `reconcilePrepared()` remains blocked with `NEXO_EFFECT_RECONCILIATION_REQUIRED`, `verified:false`.
- Code/test commit: [`db3399aa28e6671bf5329ea5ca60544c8ac581ee`](https://github.com/snowdenxrp/aldea-ia/commit/db3399aa28e6671bf5329ea5ca60544c8ac581ee).
- Exact-head CI PASS: mission/continuity [39107632187](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632187), outcome classification [39107632188](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632188), semantic validation [39107632199](https://github.com/snowdenxrp/aldea-ia/actions/runs/39107632199). Mission workflow log confirms `simulation-restart-persistence.test.mjs` ran and passed.
- Checkpoint: [NCS_M0_DURABLE_REPAIR_CRASH_CUT_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_DURABLE_REPAIR_CRASH_CUT_CHECKPOINT_2026-10-18.md).
- Meaning: this closes a crash-cut test gap only. Durable environment state does not silently settle Nexo PREPARED. No settlement API or runtime cutover was added.
- Next: define and test the repair-only recovery contract from persisted snapshot semantics (desired invariant present/absent, malformed target, unknown alive, stale environment revision, continuity revision conflict). Keep non-idempotent actions UNKNOWN and do not redispatch them.

---

## M0 — Unknown life-state remains UNKNOWN (2026-10-18)

- Further tightened `repair_agent_state`: if `alive` is absent or not boolean, the handler returns `AGENT_ALIVE_STATE_UNKNOWN` before touching coordinates. It no longer infers `alive:true` from missing data.
- Regression test verifies the operation returns `blocked / EFFECT_OUTCOME_UNKNOWN`, leaves the unknown life-state unchanged, and makes no coordinate mutation.
- Final code/test head: [508a76a13384e282b812fcc91cbf4fb17222341f](https://github.com/snowdenxrp/aldea-ia/commit/508a76a13384e282b812fcc91cbf4fb17222341f).
- Exact-head CI PASS: [semantic validation 39106685371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106685371) and [outcome classification 39106685361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106685361). Mission/restart workflow on this exact head not confirmed.
- Updated checkpoint: [NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Remaining boundary unchanged: in-memory revision is not durable world-state revision; no independent operation receipt, settlement API, or runtime cutover. M0 incomplete; PREPARED UNKNOWN; protected effects STOP.

## M0 — Dead-agent-safe convergent repair verified (2026-10-18)

- Refined `repair_agent_state`: postcondition now requires finite coordinates and a boolean `alive` value, not that the agent be alive. The action normalizes invalid coordinates without resurrecting a dead agent.
- Added a regression test asserting a dead agent remains dead after repair while coordinates become finite. Previous tests still cover idempotent needs normalization and a missing resource amount.
- Final code/test head: [0846597665e72de65917101c9206c3d26c11bf1b](https://github.com/snowdenxrp/aldea-ia/commit/0846597665e72de65917101c9206c3d26c11bf1b).
- Exact-head CI PASS: [semantic validation 39106552699](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552699) and [outcome classification 39106552701](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106552701). Mission/restart workflow for this exact head has not been confirmed.
- Checkpoint: [NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Still not solved: in-memory revision is not durable environment revision; postcondition does not attribute the state to a particular prepared operation; no terminal settlement API or runtime cutover. M0 incomplete; PREPARED UNKNOWN; protected effects STOP.

## M0 — Convergent repair revision correction (2026-10-18)

- `src/nexo/simulation-adapter.js`: `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state` now increment the in-memory effect revision only when their normalized fields actually change. A missing resource amount normalizes to zero. The agent repair preserves an explicit dead state rather than resurrecting it.
- Regression tests: a second normalization under a distinct operation key completes without fabricating a new revision; a resource with missing amount is normalized and passes its postcondition.
- Code commit: [8926800](https://github.com/snowdenxrp/aldea-ia/commit/892680032b5512de11532b6ea609e5e9cbc9f75f); test head: [575d017](https://github.com/snowdenxrp/aldea-ia/commit/575d01789250bb26800d66146da18321ffad32ab).
- Exact-head CI: semantic validation [39106460906](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460906) PASS; outcome classification [39106460938](https://github.com/snowdenxrp/aldea-ia/actions/runs/39106460938) PASS. A mission/restart workflow on this exact head has not been confirmed; do not carry forward the previous head's result as if it covered this commit.
- Checkpoint: [NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md](BUILD/NCS_M0_CONVERGENT_REPAIR_REVISION_CHECKPOINT_2026-10-18.md).
- Limit: revision remains in-memory, not the durable Lúmina snapshot revision; a convergent postcondition is not an operation receipt. The repair-state postcondition still rejects dead agents, so that edge must be resolved before treating it as universally settleable. No owner settlement or runtime cutover was made.

# NCS — STATUS / ÚNICA ENTRADA

Fecha: 2026-10-18  
Repositorio: `snowdenxrp/aldea-ia`  
Rama: `ncs-clean-architecture`

## Estado global

**M0: INCOMPLETO.** La migración de continuidad de Nexo está parcialmente implementada. La ruta de ejecución/resultados de `src/nexo/runtime.js` todavía usa funciones de memoria heredadas; no conectar el despacho al propietario de continuidad independiente hasta que exista un contrato de reconciliación y liquidación de efectos respaldado por evidencia independiente.

- **Efectos PREPARED no resueltos:** UNKNOWN; no redispatch ni replan alrededor de ellos.
- **Efectos protegidos:** STOP.
- **STEP 7:** OPEN / STOP / UNKNOWN.
- **Nexo y Lúmina:** mantener separados. No declarar terminada la migración.
- **Dispositivo real:** no se ha realizado ni verificado una migración local del usuario.

## Punto técnico más reciente

1. El adaptador genérico ahora conserva como PREPARED cualquier fallo del manejador sin prueba independiente de ausencia de efecto. Resultado: `EFFECT_OUTCOME_UNKNOWN` si la revisión observada no cambia, `PARTIAL_EFFECT_DETECTED` si cambia.
2. CI exacto PASS en código/pruebas `431978730f3b2be300fa51d3a35938ef6702e607`:
   - [Mission/restart continuity — 39105986623](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986623)
   - [Semantic validation — 39105986616](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986616)
   - [Outcome classification — 39105986625](https://github.com/snowdenxrp/aldea-ia/actions/runs/39105986625)
3. La inspección de persistencia encontró que el adaptador modifica una simulación en memoria, mientras `world-state.json` y `.nexo-continuity.json` tienen revisiones y commits separados. No existe hoy un protocolo durable conectado de ejecución de efecto + liquidación Nexo.

## Leer y continuar en este orden

1. [Handoff principal de migración M0](BUILD/NCS_M0_NEXT_CHAT_HANDOFF_2026-10-18_MIGRATION.md)
2. [Crash cuts de reconciliación del entorno](BUILD/NCS_M0_ENVIRONMENT_RECONCILIATION_CRASH_CUTS_2026-10-18.md)
3. [Matriz de reconciliación por acción](BUILD/NCS_M0_ACTION_RECONCILIATION_CLASSIFICATION_2026-10-18.md)
4. [Checkpoint de fallos ambiguos fail-closed](BUILD/NCS_M0_AMBIGUOUS_HANDLER_FAILURE_FAIL_CLOSED_CHECKPOINT_2026-10-18.md)
5. [Contrato del propietario de continuidad Nexo](BUILD/NCS_M0_NEXO_CONTINUITY_OWNER_CONTRACT_2026-10-18.md)
6. Historial de STATUS preservado en [STATUS_HISTORY_2026-10-18.md](STATUS_HISTORY_2026-10-18.md).

## Próxima tarea obligatoria

Terminar la clasificación de reconciliación para las acciones candidatas idempotentes de reparación y probar los cortes de reinicio contra el estado persistido real. Las acciones no idempotentes deben permanecer UNKNOWN cuando falte evidencia durable específica de la operación. Después, definir el contrato mínimo de liquidación en el propietario Nexo. No integrar aún el runtime con el propietario; no inventar IDs, colas, tombstones, revisión global, reintentos, ni wrappers transaccionales.

## Principio de evidencia

Trigger → ejecución → job → head/pin → artefacto/log bruto → interpretación. Un eslabón faltante significa PENDING/UNKNOWN, nunca PASS supuesto. La documentación y CI no prueban ejecución en el dispositivo real.


## Latest M0 boundary — cross-store revision-fence analysis (2026-10-18)

- Analysis checkpoint: [NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md](BUILD/NCS_M0_CROSS_STORE_REVISION_FENCE_ANALYSIS_2026-10-18.md), commit [6e3a51be77b45407707917ccc0ecf0cc94e50994](https://github.com/snowdenxrp/aldea-ia/commit/6e3a51be77b45407707917ccc0ecf0cc94e50994).
- Concrete boundary: `scripts/simulate.mjs` and `src/nexo/core/continuity-store.mjs` lock and CAS their own independent files. Nexo continuity CAS does not fence Lúmina's `world-state.json`; a read of environment revision R can race with another writer committing R+1 before Nexo records its observation.
- Therefore the mission verifier remains read-only/ephemeral. No durable goal-observed transition, mission completion, replan, protected runtime wiring, or cross-store atomicity claim is allowed yet.
- Exact-head CI for test commit [5f7d268bc92920aad25599f6d2689267e18fd98a](https://github.com/snowdenxrp/aldea-ia/commit/5f7d268bc92920aad25599f6d2689267e18fd98a) remains NOT VERIFIED: status lookup returned no statuses and workflow lookup returned no runs. Missing evidence is neither PASS nor FAIL.
- Next: trace all writers/callers of persisted environment state and choose a domain-specific fence only if all relevant writers can honor it. If not, keep terminal durable goal status unavailable and re-check on use. Do not invent a generic transaction wrapper or test-only hook.

M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — Goal-observation consumer decision (2026-10-18)

- Decision checkpoint: [NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md](BUILD/NCS_M0_GOAL_OBSERVATION_CONSUMER_DECISION_2026-10-18.md), commit [5a3922413ff8702aafe12b05bc69b09f8b0fc864](https://github.com/snowdenxrp/aldea-ia/commit/5a3922413ff8702aafe12b05bc69b09f8b0fc864).
- The read-only mission-goal verifier has no demonstrated production consumer requiring a durable terminal `goal_observed` record; `src/nexo/runtime.js` does not call it. Therefore do not build a cross-store fence for that diagnostic now. Keep it ephemeral/read-only and re-check current state on use.
- This does NOT resolve M0 runtime migration. `src/nexo/runtime.js` still imports mission/outcome/execution/reconstruction operations from `src/assistants/memory.js`. The independent owner does not yet provide a fully verified terminal effect-settlement contract.
- Next: define and test the narrow owner-backed runtime API; keep result lineage separate from PREPARED settlement, reject caller-supplied verification as independent proof, and retain UNKNOWN/PREPARED across cross-file ambiguity. Preserve the legacy path until crash-cut and rollback tests pass.
- No broad writer-audit repeat, generic transaction wrapper, runtime cutover, protected-effect authorization, or device migration claim.

M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — Execution-lineage owner seam (2026-10-18)

- Checkpoint: [NCS_M0_EXECUTION_LINEAGE_OWNER_SEAM_2026-10-18.md](BUILD/NCS_M0_EXECUTION_LINEAGE_OWNER_SEAM_2026-10-18.md), commit [5acefe5](https://github.com/snowdenxrp/aldea-ia/commit/5acefe5ed04b93c3a6d12a56f8aa14c759dc7301).
- Added `recordExecutionLineage()` to the Nexo continuity owner. It records adapter-result lineage in Nexo's own store with expected-revision CAS, checks persisted mission/step/action/target identity, and preserves the first record on duplicate identity.
- Crucial boundary: this method does not mutate `effectJournal`; even a result claiming `completed` and `verified: true` is only lineage. PREPARED remains unresolved and reconstructed mission remains blocked.
- Regression test authored in `tests/nexo/continuity-migration.test.mjs`: PREPARED preservation, blocked reconstruction, duplicate idempotency, stale revision conflict. Owner code `f5e9e20`; test commit `014b589`.
- Exact-head CI is NOT VERIFIED: combined-status/workflow lookups returned no records for the code/test commits; no local test run was performed in this session.
- This is not runtime cutover. Next: determine an operation-specific durable reconciliation path for one convergent repair and test restart/crash cuts before introducing any settlement API.

M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — Execution-lineage admission guard (2026-10-18)

- Follow-up review found that a new execution lineage could be recorded for a valid mission step without a matching PREPARED journal obligation. Hardened `recordExecutionLineage()` to require exactly one PREPARED entry with matching key, mission, step, action and target.
- Owner hardening commit: [71b2db0b83e190f9f6d13c765a4e1bc85857903d](https://github.com/snowdenxrp/aldea-ia/commit/71b2db0b83e190f9f6d13c765a4e1bc85857903d); regression test commit: [9971058e2477aa458e6afebdb240f4a52b3b2401](https://github.com/snowdenxrp/aldea-ia/commit/9971058e2477aa458e6afebdb240f4a52b3b2401).
- Test checks that a mission without PREPARED cannot gain execution lineage (`NEXO_EXECUTION_PREPARED_OBLIGATION_REQUIRED`). Exact-head CI NOT VERIFIED; tests were not run locally.
- Still no runtime cutover, effect settlement, independent evidence authentication, or cross-store atomicity claim.

M0 incomplete; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.
- Added regression commit `98caddd0edd81908c2f07b199391e9fe85dbeeae`: a persisted `settled_observed` repair reconstructs as blocked with objective `verify_observed_repair_goal` and explicit `verify_mission_goal_without_redispatch`; observation is not converted into completed execution.
- Exact-head CI remains NOT VERIFIED and no local test execution is claimed.

## M0 — reparación persistida: pruebas de cortes de reinicio (2026-10-18)
- Añadida `tests/nexo/repair-settlement-crash-cuts.test.mjs` para tres límites: (1) Lúmina persiste la reparación y Nexo sigue en PREPARED; la reconciliación solo puede escribir `settled_observed` con `causalAttribution: not_claimed` y la misión reconstruida permanece bloqueada; (2) revisión de entorno más allá de la revisión preparada + 1: no liquidar y conservar PREPARED; (3) revisión adyacente pero invariante ausente: no liquidar y conservar PREPARED.
- `package.json` incorpora la regresión al comando `npm test`.
- Commits: prueba `59f3501f1d96358ad8f59649e06e00af00e219c3`; inclusión en suite `8c08f82792915c444ec9c0acc9decd0acd6b19e5`.
- Estado de evidencia: el código de prueba está en la rama; no se ha ejecutado localmente y no hay un resultado de CI exacto verificado para estos commits. No marcar PASS hasta disponer de ejecución/job/log del head exacto.

M0 sigue incompleto; no hay integración runtime ni liquidación causal; los efectos protegidos siguen STOP; STEP 7 continúa OPEN / STOP / UNKNOWN.


## M0 — Repair lineage environment-revision binding (2026-10-18)

- Review found that `recordExecutionLineage()` checked PREPARED identity but did not compare a repair's supplied environment revision to the revision captured in the PREPARED entry.
- Owner change: `291d482a2f1e03294c519bb8971fcce0b1c69176`. For the three repair actions, new lineage now blocks if either revision is absent/invalid (`NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_UNKNOWN`) or they differ (`NEXO_EXECUTION_PREPARED_ENVIRONMENT_REVISION_MISMATCH`). The guard does not settle `effectJournal`.
- Regression commit: `4667d3b3cbe4a587c6e53118961437b2db733958`; test asserts mismatched revision leaves Nexo `storeRevision` and execution lineage unchanged before a matching revision is accepted.
- Exact-head CI and local execution are NOT VERIFIED. Do not call this a PASS until the exact code/test head has a recorded job result/log.

M0 incomplete; runtime still uses legacy memory paths; Nexo/Lúmina remain separate stores; protected effects STOP; unresolved PREPARED UNKNOWN; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — CI-discovered crash-cut test fixture correction (2026-10-18)

- The mission/restart workflow exposed a test failure in `tests/nexo/simulation-restart-persistence.test.mjs` before it reached the continuity migration regression: `applyState()` does not carry persisted `stateRevision` into the in-memory simulation, so the test incorrectly computed `stateRevision` from the simulation and passed an invalid value to `persistState()`.
- Corrected the test to retain the strictly loaded persisted source snapshot and compute the next revision from `changedGoalSource.stateRevision`. Commit `ea1a8390c2826021feab46f3197c84a1a4f47039`.
- Earlier workflow runs for owner/test heads failed at this unrelated test line; STEP 4/STEP 5 and repair crash-cut workflows succeeded. The corrected head's workflows are pending at the time of this note; do not mark the overall suite PASS until the rerun completes.


### CI result correction — exact code/test head `ea1a8390c2826021feab46f3197c84a1a4f47039`

The three workflows completed successfully on the exact test-fix head:
- [Mission/restart continuity — run 39138908196](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138908196). Job log confirms both `simulation-restart-persistence.test.mjs` and `continuity-migration.test.mjs` passed.
- [STEP 5 outcome classification — run 39138908043](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138908043).
- [STEP 4 semantic validation — run 39138908074](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138908074).

The repair-settlement crash-cut workflow also passed on owner code head `291d482a2f1e03294c519bb8971fcce0b1c69176` ([run 39138771613](https://github.com/snowdenxrp/aldea-ia/actions/runs/39138771613)); the STEP 4/STEP 5 workflows passed on test head `4667d3b3cbe4a587c6e53118961437b2db733958`. Do not interpret these tests as runtime migration or protected-effect proof.


### Repair-lineage revision guard — latest regression result

- Regression commit `12452f8d851c646d3cb7674cd0f59d7ba1246fe1` adds both missing-revision and mismatched-revision rejection checks; neither may append lineage or advance the Nexo store.
- Exact-head workflows all passed: mission/restart continuity [39139024311](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024311) (job confirms `simulation-restart-persistence.test.mjs` and `continuity-migration.test.mjs` succeeded), STEP 5 [39139024315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024315), and STEP 4 [39139024377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39139024377).
- This validates the owner seam regression only. `effectJournal` still remains PREPARED after lineage; no runtime cutover, independent causal proof, or protected-effect authorization is established.


---

## Puerta de continuidad para nuevo chat — misión M0 (2026-10-18)

**Nuevo handoff maestro creado:** [NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md](BUILD/NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-18.md), commit [1b4ee8dafbed4b7bae6820d7d1853d3a31816382](https://github.com/snowdenxrp/aldea-ia/commit/1b4ee8dafbed4b7bae6820d7d1853d3a31816382).

Al abrir un nuevo chat con `NCS`, leer este STATUS y después el handoff maestro completo. Retomar exclusivamente la misión M0 desde la sección “Siguiente tarea concreta”; verificar el HEAD y los checks actuales antes de seguir. No repetir auditorías cerradas, no reiniciar investigación y no mezclar Nexo con Lúmina. La migración del runtime continúa incompleta; efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.


## New-chat handoff (2026-10-18)

For the next chat, read `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEW_CHAT_2026-10-18.md` first, then this STATUS. Entry keyword is exactly `NCS`. Mission: complete M0 and build Nexo's own continuity/runtime; keep Nexo separate from Lumina; do not restart M1 or closed historical audits. The handoff contains exact verified CI runs, current limits, and the ordered next steps.

## M0 — replay tras reinicio del owner (2026-10-18)

Se amplió `tests/nexo/assistants-runtime-cli.test.mjs`: tras ejecutar el entrypoint real en un subproceso y observar `settled_observed`, la prueba reabre el owner desde el archivo de continuidad y vuelve a solicitar la misma misión. El replay falla cerrado; la revisión del entorno no cambia y el journal conserva una sola obligación. La prueba no exige que el replay sea `skipped`: `blocked` es aceptable y más conservador si el selector no puede confirmar elegibilidad.

**CI exacto:** [Nexo M0 — repair settlement crash cuts, run 39144863235](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144863235) — SUCCESS, SHA de código/pruebas `1cd8dfd914fad7848df51eca0f4e0f75cff22264`. El job `repair-crash-cuts` y el paso `Run isolated assistants runtime CLI regression` finalizaron SUCCESS.

Límite: prueba aislada con archivos temporales y owner reabierto; no es cutover del runtime genérico `src/nexo/runtime.js`, no prueba atomicidad cross-store ni efectos protegidos. M0 continúa INCOMPLETO. Siguiente frontera: definir el contrato mínimo de resultados/lineage owner-backed antes de migrar las escrituras legacy; `recordExecutionLineage()` no liquida PREPARED y `recordOutcome()` no puede usar etiquetas `verified` del caller como autenticación.

## M0 — repair dispatch lineage persisted before observed settlement (2026-10-18)

The repair-only entrypoint now records the adapter/dispatch result through `owner.recordExecutionLineage()` after the dispatch reports completion and before it attempts independent persisted-state settlement. The lineage binds to the original PREPARED operation identity and baseline environment revision; the result records whether the environment write occurred and the resulting revision. The journal remains `prepared` during the lineage commit; only the separate persisted-invariant observer may transition it to `settled_observed`.

The path fails closed if the lineage API/commit cannot be confirmed after environment persistence. A later invocation can re-read the durable environment and recover from the still-PREPARED journal without redispatching when the invariant is present. This does not make the two files atomic and does not authenticate causal attribution.

Regression coverage now asserts a normal repair creates one execution-lineage record and a separate settlement commit; an already-satisfied no-op records lineage without fabricating an environment revision increment. Session integration asserts three distinct Nexo store revisions for PREPARED, lineage, and settlement.

**Exact CI:** [Nexo M0 — repair settlement crash cuts, run 39145222433](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145222433) — SUCCESS on code/test SHA `e50f47d8c1717eb8d4d0f56caa508e3b50dc4c41`. Job `repair-crash-cuts` passed, including owner migration, repair lifecycle, canonical session, CLI restart/replay, and mission-goal verification regressions.

Limit: this is still repair-only. Generic `src/nexo/runtime.js` remains legacy-memory-backed; non-repair/protected actions are not routed through this path. M0 incomplete; Nexo/Lúmina separate; unresolved PREPARED UNKNOWN; protected effects STOP.

## M0 — crash cut after lineage, before settlement (2026-10-18)

Added a dedicated recovery scenario to `tests/nexo/repair-owner-lifecycle.test.mjs`: persist PREPARED, dispatch a repair and persist the Lúmina environment, reopen the owner, commit execution lineage, then simulate process loss before journal settlement. On restart, the entrypoint observes the already-persisted invariant and settles it without dispatching again or advancing the environment revision. Assertions confirm one lineage record, PREPARED remains unresolved between the lineage commit and settlement, and final settlement is a separate third owner revision.

**Exact CI:** [Nexo M0 — repair settlement crash cuts, run 39145303242](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145303242) — SUCCESS on code/test SHA `59825c0b66034e39dfa62bf060665cff59c95269`. The `repair-crash-cuts` job passed, including the new crash-cut test, owner migration, canonical repair session, isolated CLI replay, and mission-goal verification.

This closes one crash boundary for the repair-only lifecycle; it does not prove generic runtime cutover, cross-store atomicity, causal attribution, or protected-effect authorization. M0 remains INCOMPLETE.


## M0 — no promover settled_observed a completed tras reinicio (2026-10-18)

- La regresión nueva en `tests/nexo/repair-owner-lifecycle.test.mjs` intenta registrar `completed` con evidencia etiquetada por el caller como `verified: true` después de `settled_observed`. El owner debe rechazarla con `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED` sin incrementar `storeRevision`.
- La misma prueba reconstruye la misión desde el owner actual y desde un owner reabierto en disco; en ambos casos la misión y el paso siguen `blocked`, con objetivo `verify_observed_repair_goal`. Esto verifica persistencia de la barrera, no autenticidad de la evidencia externa.
- Commit de prueba: [fd2331e8d71afbbf0f19ea978d552a89087c1dc6](https://github.com/snowdenxrp/aldea-ia/commit/fd2331e8d71afbbf0f19ea978d552a89087c1dc6).
- CI exacto en ese SHA: [repair settlement crash cuts — 39145754425](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754425) SUCCESS; [STEP 4 — 39145754371](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754371) SUCCESS; [STEP 5 — 39145754375](https://github.com/snowdenxrp/aldea-ia/actions/runs/39145754375) SUCCESS. En el workflow repair, el job `repair-crash-cuts` pasó el lifecycle, migración, sesión canónica, CLI aislado y verificación de objetivo.
- Límite: esto no liquida el journal, no convierte observación en causalidad, no habilita acciones generales ni prueba cutover del runtime genérico. M0 continúa INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## M0 — verificador de objetivo: pérdida de invariante y revisión anterior (2026-10-18)

- Se amplió `tests/nexo/repair-owner-lifecycle.test.mjs` para comprobar dos resultados adicionales del verificador independiente: (1) si el estado persistido vuelve a perder la invariante en una revisión posterior, devuelve `blocked / NEXO_REPAIR_MISSION_GOAL_INVARIANT_NOT_PRESENT`; (2) si la revisión ambiental queda por debajo de la revisión registrada en el settlement, devuelve `unknown / NEXO_REPAIR_MISSION_ENVIRONMENT_REVISION_ROLLBACK_OR_REPLAY`. Ambos casos no modifican `storeRevision` de Nexo.
- Commit de prueba: [d01384083368d1b9f52ad5c327dc4b1985e5573a](https://github.com/snowdenxrp/aldea-ia/commit/d01384083368d1b9f52ad5c327dc4b1985e5573a). La suite repair completa pasó en [39146476081](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476081); STEP 4 [39146476199](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476199); STEP 5 [39146476145](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146476145).
- Se detectó y revirtió antes de aceptar una ampliación incompleta de esquema que agregaba `goalObservations` sin contrato, inicialización ni compatibilidad de store: su CI falló en [39146494871](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146494871) y [39146494887](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146494887). Reversión de esquema [16c51fc994de1ca8a6471fa30f9060068b998da8](https://github.com/snowdenxrp/aldea-ia/commit/16c51fc994de1ca8a6471fa30f9060068b998da8) restauró CI verde. La observación de objetivo sigue siendo de solo lectura; no se añadió persistencia de observaciones ni se declaró completion.
- HEAD actual de la rama tras restaurar la forma de snapshot: `864ab85d38bf67040ef5a662dd8769cad3ea4c9f`. El CI verde más reciente valida el padre `16c51fc994de1ca8a6471fa30f9060068b998da8`; verificar si se dispara un run nuevo para el HEAD actual antes de atribuirle validación exacta.
- M0 permanece INCOMPLETO; efectos protegidos STOP; no migrar el runtime genérico hasta resolver la frontera de evidencia de misión.


## M0 — verificación detecta cambios concurrentes de continuidad (2026-10-18)

- El verificador de objetivo de reparación ahora vuelve a leer el almacén de continuidad justo antes de devolver `goal_observed`. Si `storeRevision` cambió entre la lectura inicial del journal/mission y esa comprobación final, devuelve `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`; no devuelve `verified: true` a partir de la vista inicial obsoleta.
- Regresión añadida en `tests/nexo/repair-mission-verification.test.mjs` con un store de prueba que cambia la revisión entre lecturas; verifica `unknown`, código exacto y que ambas lecturas ocurrieron. Esto no afirma atomicidad entre los archivos de continuidad y entorno, ni elimina una escritura que ocurra después de la comprobación final.
- Código/prueba commit: [57f3bffb52989a924bdbc5fb4fc626d803e6988f](https://github.com/snowdenxrp/aldea-ia/commit/57f3bffb52989a924bdbc5fb4fc626d803e6988f).
- CI exacto sobre ese SHA: [M0 repair crash cuts — 39146959705](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959705) SUCCESS; [STEP 4 semantic validation — 39146959738](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959738) SUCCESS; [STEP 5 outcome classification — 39146959691](https://github.com/snowdenxrp/aldea-ia/actions/runs/39146959691) SUCCESS. El job repair confirma que pasó el paso `Run persisted repair mission goal verification regression`.
- Límite: es una comprobación de estabilidad optimista de la revisión del store, no una transacción entre stores, no autenticación de fuente de evidencia y no misión completada. M0 sigue INCOMPLETO; efectos protegidos STOP; runtime genérico legacy no migrado.


## M0 — decisión de observación y contrato mínimo de cutover (2026-10-18)

- Decisión registrada en `NEXO_NCS/BUILD/NCS_M0_GOAL_OBSERVATION_AND_RUNTIME_CUTOVER_DECISION_2026-10-18.md`: no añadir ahora `goalObservations`; el verificador actual es de solo lectura y la reconstrucción mantiene `settled_observed` bloqueado. Solo diseñar persistencia de observaciones si existe requisito explícito de historial auditable, con contrato completo de procedencia, esquema/migración, CAS y replay.
- El contrato enumera el orden obligatorio del primer cutover: selección canónica → dependencias → PREPARED durable/CAS → dispatch acotado → lineage separado → reconciliación independiente → settlement no causal → replay/reinicio → aislamiento de Lúmina.
- La verificación final de estabilidad de continuidad permanece: un cambio de `storeRevision` durante el verificador devuelve `unknown / NEXO_CONTINUITY_CHANGED_DURING_MISSION_VERIFICATION`. No se añadió ni se afirma una garantía de estabilidad equivalente para el archivo ambiental durante toda la verificación; la observación sigue siendo de punto en el tiempo y no cross-store atómica.
- CI verde exacto del código/pruebas restaurados: [repair M0 39149853015](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149853015), [STEP 4 39149852997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149852997), [STEP 5 39149853023](https://github.com/snowdenxrp/aldea-ia/actions/runs/39149853023), todos sobre `fe9fe3b656fceff67be31722d7729ff6637a428b`. Un experimento posterior para simular una carrera del archivo ambiental falló en CI y se retiró en vez de aceptar cobertura no demostrada; el guard ambiental experimental también fue revertido. El guard de cambio de continuidad y su prueba determinista se conservan.
- M0 continúa INCOMPLETO; runtime genérico legacy NO MIGRADO; efectos protegidos STOP; Nexo/Lúmina separados.

## M0 — capability preflight del adaptador de efectos (2026-10-18)

- `src/nexo/effect-adapter.js` expone `supports(action)` para consultar si existe un handler registrado sin ejecutarlo. El registro sigue siendo dinámico mediante `register()`; `supports` refleja el registro actual.
- La API declara explícitamente su límite: presencia de handler no equivale a contrato de reconciliación, verificación persistida ni autorización. Su propósito es permitir al futuro seam canónico rechazar una acción no registrada antes de admitir PREPARED o despachar.
- Implementación: [595ca45888de1d131537de65d1b9b22b6267e754](https://github.com/snowdenxrp/aldea-ia/commit/595ca45888de1d131537de65d1b9b22b6267e754). Regresión: [af463e90aa77b116ce4f940ba112521ba48413ab](https://github.com/snowdenxrp/aldea-ia/commit/af463e90aa77b116ce4f940ba112521ba48413ab); comprueba acción registrada/no registrada, registro posterior y que consultar capacidad no invoca el handler.
- CI exacto aún no observado: el lookup de workflow runs devuelve `[]` y los checks devuelven `statuses: []`. No declarar PASS; ejecución local tampoco realizada.
- Siguiente paso M0: usar este seam solo como preflight dentro del diseño del runtime canónico, sin tratar `supports()` como reconciliador. El bloqueo principal sigue siendo un contrato confiable por acción para resolver PREPARED tras restart y liquidar por CAS con evidencia del estado persistido. Runtime genérico todavía no migrado; efectos protegidos STOP; Nexo/Lúmina separados.

## M0 — corrección de sintaxis y CI focal ampliado (2026-10-18)

- Se detectó que la adición de `supports()` en `src/nexo/effect-adapter.js` contenía secuencias literales `\\n` en el código fuente en vez de saltos de línea. Se corrigió antes de continuar la integración. Corrección: [`2247b0672cba85e9bd7e551fc42aa2bbd3dfc299`](https://github.com/snowdenxrp/aldea-ia/commit/2247b0672cba85e9bd7e551fc42aa2bbd3dfc299).
- El workflow anterior no incluía los cambios del adaptador ni ejecutaba su suite; por ello no servía para validar esa frontera. Se amplió para activar con cambios de `effect-adapter.js`, `continuity-owner.mjs`, `runtime.js` y sus pruebas focales, y ejecutar tanto `tests/nexo/effect-adapter.test.mjs` como `tests/nexo/repair-settlement-crash-cuts.test.mjs`. Cambio: [`8c1845e49cf116aad4d7b6de058a1b73b55e4d0d`](https://github.com/snowdenxrp/aldea-ia/commit/8c1845e49cf116aad4d7b6de058a1b73b55e4d0d).
- **Estado de validación:** pendiente de observar los checks/runs exactos de estos commits. No se ejecutaron las suites localmente en esta sesión; no declarar PASS.
- **Siguiente frontera M0:** contrato confiable por acción para reconciliar el estado ambiental persistido y liquidar PREPARED mediante CAS. `supports(action)` solo acredita que existe un handler; no acredita verificador, autoridad, persistencia ni permiso para dispatch. No conectar todavía el runtime genérico ni introducir callbacks de reconciliación aportados por el caller.

## M0 — outcome terminal bloqueado en cualquier estado mientras PREPARED siga abierto (2026-10-18)

- Hallazgo concreto: `recordOutcome()` solo rechazaba `completed` cuando existía un efecto `prepared` o `settled_observed`. Permitía intentar registrar `failed` o `blocked` aunque el efecto pudiera haberse aplicado antes de una interrupción; eso no resolvía la incertidumbre y podía dejar una narrativa terminal contradictoria.
- Corrección en `src/nexo/core/continuity-owner.mjs`: cualquier outcome terminal para esa misma operación queda bloqueado con `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED` mientras la obligación esté abierta. No liquida el journal ni convierte el bloqueo en una conclusión sobre el efecto.
- Regresión ampliada en `tests/nexo/repair-settlement-crash-cuts.test.mjs`: intenta `completed`, `failed` y `blocked`; los tres deben quedar bloqueados, PREPARED debe permanecer y no debe crearse ningún attempt.
- Commits: código [`86c3ebc8ade8fe018a9c40e95102af13c40f1d22`](https://github.com/snowdenxrp/aldea-ia/commit/86c3ebc8ade8fe018a9c40e95102af13c40f1d22); regresión [`3e3b76de309bbccaa7150e12e0ea5bbf0f2e9826`](https://github.com/snowdenxrp/aldea-ia/commit/3e3b76de309bbccaa7150e12e0ea5bbf0f2e9826).
- El workflow M0 focal fue ampliado en [`8c1845e49cf116aad4d7b6de058a1b73b55e4d0d`](https://github.com/snowdenxrp/aldea-ia/commit/8c1845e49cf116aad4d7b6de058a1b73b55e4d0d) para incluir el owner, runtime y la suite del adaptador además de crash cuts. Aun así, las consultas de status/runs disponibles no devuelven evidencia de ejecución para estos SHAs. **CI PENDING/UNKNOWN; no declarar PASS.**
- Siguiente frontera: contrato confiable de reconciliación por acción y settlement CAS. Esta corrección cierra un bypass de outcomes, no el ciclo de efecto ni la integración del runtime genérico. M0 sigue INCOMPLETO.

## M0 — PREPARED domina también replay de un attempt terminal obsoleto (2026-10-18)

- Hallazgo: aunque `recordOutcome()` ya bloqueaba outcomes terminales nuevos mientras el journal estaba `prepared` o `settled_observed`, la búsqueda de un attempt existente ocurría antes de ese guard. Un replay idéntico podía devolver `already_recorded` pese a que el mismo efecto seguía sin reconciliarse.
- Corrección: el owner comprueba primero la obligación de efecto pendiente y solo después considera idempotencia del attempt. Un attempt previo no invalida ni resuelve PREPARED.
- Regresión: fixture con un attempt `completed` preexistente y el journal `prepared`; repetir el outcome debe devolver `blocked / NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`, conservando PREPARED.
- Commits: código [`909d564cbb88812624e29afb7cae7952b55d2b3f`](https://github.com/snowdenxrp/aldea-ia/commit/909d564cbb88812624e29afb7cae7952b55d2b3f); prueba [`2c64848e77c0e6ffc6989c7b16371123b0b19679`](https://github.com/snowdenxrp/aldea-ia/commit/2c64848e77c0e6ffc6989c7b16371123b0b19679).
- Validación: el workflow M0 ampliado incluye esta suite, pero los checks/runs observables consultados siguen sin mostrar una ejecución asociada. **PENDING/UNKNOWN; no afirmar PASS.**
- Siguiente frontera: contrato de reconciliación por acción, verificadores confiables y settlement CAS. Esta corrección endurece replay del owner; no conecta aún el runtime genérico. M0 permanece INCOMPLETO.


## M0 — seam inicial de verificación confiable por acción (2026-10-18)

- Se separó la presencia de un handler (supports(action)) de la capacidad de reconciliación: supportsReconciliation(action) informa únicamente si hay un verificador configurado en el bootstrap confiable.
- createEffectAdapter() acepta ahora verifiers como configuración de arranque y permite registerVerifier(action, verifier). verifyPrepared() solo consulta una obligación que ya exista en estado prepared, comprueba identidad exacta (misión/paso/acción/target/idempotencyKey) y exige que la observación devuelta incluya status applied | not_applied | unknown, acción/target/idempotencyKey coincidentes, observedRevision entero no negativo y source no vacío.
- Si el verificador falta, lanza excepción o devuelve evidencia mal formada, el resultado es unknown; la función no llama handlers, no modifica el journal, no liquida PREPARED y no autoriza redispatch. La función de verificación no acepta el verificador desde el request/caller.
- Código: [6a123952c24a932e8a033de53381fcc17f34aa85](https://github.com/snowdenxrp/aldea-ia/commit/6a123952c24a932e8a033de53381fcc17f34aa85). Pruebas: [a29da03e62279ff748ecdac4ce01ae0b1cc30fb1](https://github.com/snowdenxrp/aldea-ia/commit/a29da03e62279ff748ecdac4ce01ae0b1cc30fb1).
- Validación observable: get_commit_combined_status devolvió statuses vacíos para ambos SHAs. No se ejecutaron las pruebas localmente; CI PENDING/UNKNOWN, no PASS.
- Límite deliberado: este es solo el seam de lectura confiable, no settlement. Aún no existe un contrato común que permita al owner aceptar esa observación mediante CAS y mover PREPARED a un estado terminal. No inferir causalidad a partir de applied, ni redispatch a partir de not_applied. La integración de src/nexo/runtime.js sigue pendiente; M0 INCOMPLETO, efectos protegidos STOP, Nexo/Lúmina separados.
- Siguiente tarea concreta: diseñar y probar settlement CAS en el owner con la observación del verificador registrada como dato no causal y vinculada a identidad/revisión; definir cómo se conserva la procedencia del verificador sin confiar en una observación arbitraria del caller. Solo después evaluar el primer corte vertical del runtime canónico, empezando por bloquear antes de dispatch toda acción sin handler y verificador configurados.


- Endurecimiento del seam después de revisar la frontera de confianza: los verificadores ya no se pueden registrar/reemplazar a través de un método público del adaptador; quedan fijos en la configuración de bootstrap. supportsReconciliation también exige que el valor configurado sea realmente una función. Código: [509cff958c8971a100fc13283e643112596ccf55](https://github.com/snowdenxrp/aldea-ia/commit/509cff958c8971a100fc13283e643112596ccf55). El test usa verifiers de configuración y no depende de registro dinámico.

## M0 — owner registra observación confiable mediante CAS (2026-10-18)

- `createNexoContinuityOwner` recibe ahora `effectVerifiers` como configuración de confianza fija al construir el owner. `reconcilePrepared({ expectedRevision, operation })` valida contexto e identidad contra exactamente una obligación PREPARED, llama solo al verificador configurado para esa acción y valida la respuesta (`applied | not_applied | unknown`, idempotencyKey/acción/target exactos, revisión ambiental entera no negativa y fuente no vacía).
- Si no hay verificador, el verificador falla, la evidencia no valida o responde `unknown`, PREPARED permanece intacto. La función vuelve a leer la continuidad después de la verificación y antes del CAS; si cambió la revisión o la obligación, devuelve conflicto sin sobrescribir el cambio concurrente.
- Para observaciones válidas `applied`/`not_applied`, el owner persiste `status: settled_observed` y la observación en el journal con `commitIfCurrent`. Esto solo registra observación: `journalSettled: false`, `causalAttribution: NOT_ESTABLISHED`, `redispatchAuthorized: false`, `authorization: NOT_EVALUATED`. No convierte el resultado en `completed` ni autoriza redispatch.
- Se preservó el cierre seguro del API anterior: llamadas sin contexto canónico (incluidas observaciones aportadas por caller) continúan bloqueadas con `NEXO_EFFECT_RECONCILIATION_REQUIRED`.
- Pruebas añadidas a `tests/nexo/repair-settlement-crash-cuts.test.mjs`: observación confiable persistida, `unknown` deja PREPARED, ausencia de verificador deja PREPARED y carrera de revisión/CAS no liquida la obligación. Commits de implementación: [f877063545261a1672c9463a9ca0df6a1048462c](https://github.com/snowdenxrp/aldea-ia/commit/f877063545261a1672c9463a9ca0df6a1048462c), [16a259d6e98173f7905d10e463e840e5e78e298e](https://github.com/snowdenxrp/aldea-ia/commit/16a259d6e98173f7905d10e463e840e5e78e298e), [fb6de0a6ebba7886af14d67582a4427fef450319](https://github.com/snowdenxrp/aldea-ia/commit/fb6de0a6ebba7886af14d67582a4427fef450319); pruebas: [530a5455ca83b6879b8de2b1cc5c521af3ce7e63](https://github.com/snowdenxrp/aldea-ia/commit/530a5455ca83b6879b8de2b1cc5c521af3ce7e63), [7cec6b07d49bd1099c7f97b08e512077edecca57](https://github.com/snowdenxrp/aldea-ia/commit/7cec6b07d49bd1099c7f97b08e512077edecca57).
- Validación CI: las consultas de checks y runs asociadas a estos SHAs devolvieron listas vacías. Las pruebas están escritas pero no ejecutadas en esta sesión; **PENDING/UNKNOWN, no PASS**.
- Frontera pendiente: los verificadores concretos aún deben conectarse a fuentes ambientales persistidas reales y la integración de `src/nexo/runtime.js` todavía no usa el owner como ciclo canónico. La reconciliación registrada no basta para cerrar M0. Próxima tarea: validar el contrato de owner contra el verificador real de reparación existente sin duplicar su lógica; después definir el corte vertical mínimo para PREPARED antes del dispatch y settlement tras la verificación. M0 INCOMPLETO; Nexo y Lúmina permanecen separados.

## M0 — separación explícita entre observación genérica y liquidación de reparación (2026-10-18, corrección arquitectónica)

- Durante la integración del owner se detectó que reutilizar `settled_observed` para cualquier acción mezclaría el contrato específico de reparación (`settlement` con revisión ambiental enlazada) con una observación genérica (`reconciliation`). Se corrigió antes de considerar esa ruta integrada.
- Las acciones de reparación (`repair_agent_state`, `repair_agent_needs`, `repair_resource_state`) quedan rechazadas por el reconciliador genérico con `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED`; deben seguir pasando por su contrato específico y revisión ambiental enlazada. No se duplica ni se renombra esa lógica.
- Para acciones no pertenecientes a reparación, la observación CAS se guarda como `reconciled_observed`, distinta de `settled_observed`. Reconstrucción mantiene el paso bloqueado con objetivo `verify_reconciled_effect`; `recordOutcome` y replanning bloquean mientras exista esa observación. Esto no es permiso para redispatch ni una declaración causal.
- Pruebas extendidas: acción genérica observada, reconstrucción bloqueada, outcome terminal rechazado, `unknown` y ausencia de verificador preservan PREPARED, y carrera de revisión no sobrescribe estado. Commits: [1b47319a21b4d7f4f92f3e18b6b3b72c0ff418f9](https://github.com/snowdenxrp/aldea-ia/commit/1b47319a21b4d7f4f92f3e18b6b3b72c0ff418f9), [0b0fad1dffd8771008b6945d5bc9a54c05be41aa](https://github.com/snowdenxrp/aldea-ia/commit/0b0fad1dffd8771008b6945d5bc9a54c05be41aa), [db20ba7c322a3ce32131c274f7f7a850724eb502](https://github.com/snowdenxrp/aldea-ia/commit/db20ba7c322a3ce32131c274f7f7a850724eb502), [f13a8b7ed0dcd7ebd95c1cabe490858fec1a27ef](https://github.com/snowdenxrp/aldea-ia/commit/f13a8b7ed0dcd7ebd95c1cabe490858fec1a27ef), [6f63e89dc6a3992501e36fc7767eb763fa6dc568](https://github.com/snowdenxrp/aldea-ia/commit/6f63e89dc6a3992501e36fc7767eb763fa6dc568), [0c1f6c1c4a39b94708c1a7da3c6587f4731492b7](https://github.com/snowdenxrp/aldea-ia/commit/0c1f6c1c4a39b94708c1a7da3c6587f4731492b7).
- Validación sigue **PENDING/UNKNOWN**: no hay checks/runs visibles para los SHAs consultados y no se ejecutaron pruebas localmente.
- Siguiente frontera: adaptar el verificador persistido real para que proporcione una observación de solo lectura al owner sin duplicar la comprobación ambiental; conservar el settlement de reparación específico donde corresponde. Después integrar el owner con el runtime canónico en un corte vertical que impida dispatch antes de PREPARED confirmado. M0 INCOMPLETO; Nexo/Lúmina separados.

- Ajuste semántico posterior: el resultado del CAS de observación ya no marca `preparedCommitted: true`; devuelve `preparedCommitted: false` y `observationCommitted: true` para no confundir la admisión PREPARED original con la escritura de reconciliación. Código [0fb4555efba22c8be59e6ebf015ff450ab086ae0](https://github.com/snowdenxrp/aldea-ia/commit/0fb4555efba22c8be59e6ebf015ff450ab086ae0), regresión [8703cbd512f2c65495a34f5f713307b1ece0cc42](https://github.com/snowdenxrp/aldea-ia/commit/8703cbd512f2c65495a34f5f713307b1ece0cc42). Validación aún PENDING/UNKNOWN.

- Regresión adicional: se prueba explícitamente que `repair_agent_state` no puede liquidarse mediante el contrato genérico aunque haya un verificador configurado; la ruta devuelve `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED` y mantiene PREPARED. Prueba [3c19383f848f43bd606687aeee1c96d56f35a183](https://github.com/snowdenxrp/aldea-ia/commit/3c19383f848f43bd606687aeee1c96d56f35a183). Sigue PENDING/UNKNOWN hasta un run/check observable.

- Fail-closed adicional en el owner: el clonado/validación del payload de evidencia y la validación del snapshot quedan dentro de una captura de error; una evidencia no serializable devuelve `NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID` sin cambiar PREPARED. Código [6cc47a6c591c06db2818d3abbc9a65ce63bb134e](https://github.com/snowdenxrp/aldea-ia/commit/6cc47a6c591c06db2818d3abbc9a65ce63bb134e). CI todavía PENDING/UNKNOWN.

- Prueba adicional para evidencia no serializable: el owner bloquea y conserva PREPARED con `NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID`. Commit de prueba [a5a6c097bb30b005593282724a99124356313020](https://github.com/snowdenxrp/aldea-ia/commit/a5a6c097bb30b005593282724a99124356313020). No declarar PASS sin ejecución CI observable.

## M0 — inmovilizar el registro de verificadores al construir el owner (2026-10-18)

- Hallazgo: aunque los verificadores se recibían al construir `createNexoContinuityOwner`, el owner conservaba el objeto de registro externo. El caller podía reemplazar una función después de la construcción, lo que contradecía el límite de confianza descrito.
- Corrección: el owner valida el registro, copia las funciones a un mapa propio sin prototipo y congela sus propiedades. `reconcilePrepared` solo consulta esa copia; el objeto de configuración original ya no puede reemplazar el verificador registrado.
- Regresión añadida: se construye el owner, se muta después el registro externo y se comprueba que el verificador original continúa siendo el invocado. Código [776051522ec54ca3f159e6a95d15f0424ad4b7f3](https://github.com/snowdenxrp/aldea-ia/commit/776051522ec54ca3f159e6a95d15f0424ad4b7f3), prueba [3070a8e514f0ca37fb9106f72641421ea725677f](https://github.com/snowdenxrp/aldea-ia/commit/3070a8e514f0ca37fb9106f72641421ea725677f).
- Este ajuste inmoviliza la selección del verificador, no vuelve confiable cualquier función por arte de magia: el bootstrap sigue siendo frontera de confianza y el verificador debe leer estado ambiental persistido. Tampoco liquida efectos, prueba causalidad ni habilita redispatch.
- CI sigue PENDING/UNKNOWN: no se observaron checks/runs disponibles y no se ejecutaron pruebas localmente. M0 permanece incompleto; siguiente tarea es el corte vertical mínimo de runtime con PREPARED confirmado antes del dispatch y resultado incierto conservado como obligación abierta.

## M0 — primer corte vertical del runtime con owner canónico (2026-10-18)

- Se añadió `executeNexoStepWithContinuityOwner` en `src/nexo/runtime.js`, como ruta explícita separada del runtime legado. Solo admite acciones no-reparación que tengan handler y verificador de reconciliación registrados tanto en el adaptador como en el owner.
- Orden obligatorio: cargar misión canónica → comprobar capacidades antes de cualquier efecto → `recordPrepared` → exigir confirmación explícita `status: committed` y `preparedCommitted: true` → dispatch → registrar lineage → reconciliar con el verificador del owner. La ruta no escribe outcome terminal ni marca el efecto liquidado; devuelve `observed`/`unknown`, con `redispatchAuthorized: false`.
- Si la llamada a PREPARED arroja incertidumbre, no se despacha (`NEXO_PREPARED_COMMIT_OUTCOME_UNKNOWN`). Si el adaptador arroja después del dispatch, se conserva UNKNOWN y no se reintenta. Si falla la persistencia de lineage o la reconciliación, tampoco se convierte la incertidumbre en éxito.
- Reparaciones (`repair_agent_state`, `repair_agent_needs`, `repair_resource_state`) quedan bloqueadas antes de PREPARED/dispatch en esta ruta, porque su contrato ambiental ligado a revisión aún no está integrado con el owner canónico. Deben seguir el settlement específico; no se intenta usar el reconciliador genérico.
- El registro de verificadores del owner ahora se copia y congela al construirlo, con regresión para impedir reemplazo desde el objeto de configuración original.
- Commits de runtime y pruebas: [dd3a981](https://github.com/snowdenxrp/aldea-ia/commit/dd3a98190ff763f2546b167fd4926ec9d900c326), [211e5d2](https://github.com/snowdenxrp/aldea-ia/commit/211e5d207bc596d0169c2411f53e9a493e8711ba), [cad56cd](https://github.com/snowdenxrp/aldea-ia/commit/cad56cd8dc74e9aef56446d6b338d08e70e07506), [1533c36](https://github.com/snowdenxrp/aldea-ia/commit/1533c36193e1b8c940185b9fed1bc1a3cc426a6f), [220dcc2](https://github.com/snowdenxrp/aldea-ia/commit/220dcc28219f31dba43da1c6067a5a27c38e4c9a), [bcec2ee](https://github.com/snowdenxrp/aldea-ia/commit/bcec2eec151f13f7d905610ea99817e01e240c10), [5ce72d8](https://github.com/snowdenxrp/aldea-ia/commit/5ce72d8a10ba8c7494363d2519817207d38dc11b), [8317a46](https://github.com/snowdenxrp/aldea-ia/commit/8317a46611e016b6f91f773f46ccad64988f4d2b).
- Pruebas añadidas en `tests/nexo/runtime.test.mjs`: orden PREPARED→dispatch→lineage→reconcile, falta de verificador bloquea antes de PREPARED, throw de dispatch no provoca lineage/retry, incertidumbre de commit PREPARED no permite dispatch, fallo de lineage permanece UNKNOWN y reparación bloqueada antes de dispatch.
- Validación: no se pudieron observar checks/runs de CI desde las herramientas disponibles y no se ejecutaron pruebas localmente; estado PENDING/UNKNOWN, no PASS. La nueva ruta necesita validación ejecutada antes de promoverla como camino predeterminado.
- Siguiente paso: validar con CI observable; después integrar el verificador persistido genérico real y el contrato de reparación específico al owner sin cruzar stores atómicamente ni mezclar Nexo/Lúmina. Solo entonces considerar mover consumidores al nuevo runtime. M0 INCOMPLETO.

## M0 — CI observada y regresiones corregidas (2026-10-18 22:14 UTC)

- Se consultaron los runs reales de GitHub Actions, no solo combined-status. La primera ejecución falló en `tests/nexo/simulation-restart-persistence.test.mjs:479`: el test esperaba `conflict` al repetir una liquidación que ya estaba persistida, mientras que el contrato de recuperación por respuesta perdida devuelve `settled_observed / NEXO_REPAIR_SETTLEMENT_ALREADY_JOURNALED`. Se actualizó la expectativa para probar recuperación idempotente y ausencia de atribución causal: [cambio de prueba](https://github.com/snowdenxrp/aldea-ia/commit/a25669271e5e7470d9cedc84615a53955dbee3aa).
- La siguiente ejecución detectó otro test obsoleto en `tests/nexo/continuity-migration.test.mjs:336`: intentaba registrar un outcome `blocked` mientras la obligación seguía en `PREPARED`. El contrato correcto es bloquear todo outcome terminal hasta reconciliar. Se corrigió para exigir `status: blocked`, código `NEXO_OUTCOME_EFFECT_RECONCILIATION_REQUIRED`, revisión sin incremento y ausencia de intento terminal: [cambio de prueba](https://github.com/snowdenxrp/aldea-ia/commit/7a34a4366a8a59a8d71616c522aced77074da13c).
- CI confirmada en el commit `7a34a4366a8a59a8d71616c522aced77074da13c`:
  - [Nexo — bounded mission admission and restart continuity: SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379142). Incluye `runtime.test.mjs`, `simulation-restart-persistence.test.mjs` y `continuity-migration.test.mjs`.
  - [Nexo M0 — repair settlement crash cuts: SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379055).
  - [STEP 4 semantic validation: SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379069).
  - [STEP 5 outcome classification: SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171379122).
- Esta validación sí es evidencia CI observable para las suites anteriores y la nueva ruta de runtime. No implica que M0 esté terminado ni que se haya integrado el verificador ambiental real al owner para toda acción. El runtime owner-backed continúa siendo una ruta explícita nueva, no reemplaza el runtime legado; reparación permanece bloqueada en esa ruta hasta integrar su contrato específico. Próxima frontera: hacer que la observación genérica se apoye en lectura ambiental persistida real, conectar reparación al owner sin prometer atomicidad entre stores y seguir validando cada corte vertical. M0 INCOMPLETO.

## M0 — evitar un segundo journal al despachar desde PREPARED canónico (2026-10-18 22:20 UTC)

- Hallazgo arquitectónico: el primer corte `executeNexoStepWithContinuityOwner` llamaba a `adapter.execute()`. En un adaptador configurado con `executionJournal` o `persistPreparedIntent`, eso podía crear otro PREPARED/local journal además del journal canónico del owner. Eso contradice el objetivo de una sola continuidad operativa canónica.
- Corrección: `createEffectAdapter` ahora expone `executePrepared(request, { preparedCommit })`. Exige confirmación de PREPARED (`status: committed`, `preparedCommitted: true`, revisión válida) y que `request.preparedOperation` coincida exactamente con la identidad de la solicitud. En este modo no escribe intención ni resultado al journal local ni invoca `persistPreparedIntent`; el resultado es devuelto al runtime para registrar lineage en el owner canónico. Si ya existe un registro local para esa clave, bloquea en lugar de fusionar ledgers.
- El runtime owner-backed ahora requiere `executePrepared` y lo llama solo después de la confirmación canónica. Las acciones de reparación siguen bloqueadas antes del dispatch en esta ruta hasta conectar su settlement ambiental específico.
- Se abrió la configuración de verificadores confiables en `openNexoContinuityOwner({ effectVerifiers })`; el owner copia y congela ese registro. Esto es solo un punto de inyección de bootstrap: no hay todavía un verificador ambiental genérico conectado por defecto. Sin registro específico, la ruta sigue bloqueada antes de PREPARED.
- Commits: bootstrap de verificadores [1f10238](https://github.com/snowdenxrp/aldea-ia/commit/1f102389b358b14c94ecd7bc2ed7c8c4e96fdbc1), adaptador sin journal duplicado [df9b146](https://github.com/snowdenxrp/aldea-ia/commit/df9b1465befc426d77532d53f3311df51a7ff3e6), corrección de persistencia condicional [ff8d7d1](https://github.com/snowdenxrp/aldea-ia/commit/ff8d7d1f328372e5eb7da6a44e75199f62e321ec), integración del runtime [85ef18f](https://github.com/snowdenxrp/aldea-ia/commit/85ef18fbf3d730aa85bffa36a8afcf4995ac05ad), actualización de pruebas del runtime [3702e4a](https://github.com/snowdenxrp/aldea-ia/commit/3702e4a390d3f318b4b0559b9920b4eddde44ef3).
- CI observada para `3702e4a390d3f318b4b0559b9920b4eddde44ef3`: [bounded mission admission/restart continuity SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171723235), [STEP 4 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171723241), [STEP 5 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39171723238). Un run previo del runtime falló por mocks de prueba todavía usando la API anterior (`execute`); la actualización de tests al nuevo contrato fue seguida por la ejecución verde de bounded. No afirmar que ese fallo anterior pasara.
- Próximo corte: añadir prueba directa del nuevo método del adaptador y probar fallo de precondición en modo owner-prepared sin escribir al journal local; configurar un verificador genérico real solo cuando exista un contrato de lectura persistida específico para la acción. No conectar el estado de Lúmina como fuente genérica de verdad de Nexo. M0 INCOMPLETO.


## M0 — cobertura directa de executePrepared (2026-10-18; CI pendiente)

- Commit de pruebas: [da3f3fa](https://github.com/snowdenxrp/aldea-ia/commit/da3f3fa2621e1dd046a10d028b4fe8a81faee582). Se agregaron pruebas directas de `createEffectAdapter().executePrepared()`:
  - recibo PREPARED inválido bloquea antes de dispatch;
  - recibo committed válido ejecuta sin escribir un segundo journal ni llamar a `persistPreparedIntent`;
  - conflicto con entrada local preexistente para la misma clave bloquea y conserva la obligación local;
  - precondición fallida en modo canónico no crea journal local ni llama persistencia local.
- La actualización está confirmada en el branch, pero los checks/runs consultados para este SHA no muestran ejecución asociada. **Estas pruebas están añadidas; su resultado CI sigue PENDING/UNKNOWN.** No declarar PASS.
- Esto valida el contrato del adaptador a nivel unitario cuando se ejecute; no demuestra por sí solo que el recibo sea una prueba criptográfica ni que el runtime esté conectado por defecto. La autoridad para invocar este modo sigue siendo el runtime que obtiene la confirmación del owner.
- Siguiente corte: obtener ejecución CI observable de `tests/nexo/effect-adapter.test.mjs`; corregir cualquier fallo real. Luego identificar una acción genérica concreta con un lector de estado persistido real. Si no hay acción/fuente de verificación definida, mantener el preflight bloqueante; no inventar un verificador genérico ni cambiar el runtime por defecto.


## M0 — pruebas canónicas de adaptador ejecutadas en CI (2026-10-18)

- Para el commit de pruebas [da3f3fa2621e1dd046a10d028b4fe8a81faee582](https://github.com/snowdenxrp/aldea-ia/commit/da3f3fa2621e1dd046a10d028b4fe8a81faee582), se observaron dos runs completos:
  - [Nexo M0 — effect and settlement contract regressions, run 39172107130](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172107130): **SUCCESS**. El paso Effect adapter contract regressions y settlement crash cuts terminaron SUCCESS.
  - [bounded mission admission and restart continuity, run 39172107167](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172107167): **SUCCESS**. Incluye runtime, effect-adapter.test.mjs, restart reconstruction, continuity store/contract/migration y otras regresiones listadas en el workflow.
- Esto valida esas suites en ese SHA; no declara M0 completo ni cambia el runtime por defecto.
- Revisión del siguiente límite: no se debe elegir el adaptador de Lúmina como verificador genérico porque su estado simulado en memoria no demuestra estado ambiental persistido tras reinicio. Las acciones repair tienen settlement específico y no son un atajo para generalizar el contrato. Aún no está identificada una acción genérica no-repair con escritura persistida y lector independiente reales.
- **Siguiente paso exacto:** trazar desde la entrada real de Nexo una acción no-repair candidata hasta su mutación persistida y el mecanismo independiente para leerla después de reiniciar. Si no existe tal pareja escritura/lector, diseñar el mínimo contrato persistente que la acción necesita antes de implementar el verificador. No escribir un verificador ficticio, no habilitar dispatch por conveniencia y no mezclar Nexo con Lúmina. M0 sigue INCOMPLETO.


## M0 — bloqueo estructural identificado: no hay aún un dominio de efectos propio de Nexo (2026-10-18)

La inspección de la entrada real confirma por qué no se debe improvisar un verificador:

- `scripts/assistants.mjs` abre el owner canónico de Nexo y persiste la misión, pero construye los reportes y `buildNexoMission()` a partir de `simulation`, los agentes y las acciones del dominio de Lúmina.
- `src/nexo/simulation-adapter.js` delega las acciones permitidas a `executeAction` de `src/actions.js`; sus postcondiciones leen el objeto `simulation` en memoria. Eso no es una fuente independiente de estado ambiental persistido después de reiniciar.
- `scripts/nexo-runtime-session.mjs` solo selecciona `repair_agent_state`, `repair_agent_needs` y `repair_resource_state`, que ya tienen un contrato repair-only con revisión ambiental.
- Por tanto, el repositorio todavía no ofrece una acción genérica no-repair propia de Nexo con writer + reader persistido independiente. Reusar `execute_lumina_action` como si fuera esa acción mantendría la dependencia que la arquitectura prohíbe.

**Decisión de trabajo:** no implementar todavía un verificador genérico ni cambiar el runtime por defecto. El siguiente diseño debe definir la primera capacidad/efecto nativo de Nexo y su estado persistido canónico (fuera de la simulación de Lúmina), incluyendo quién escribe, quién lo lee después de reinicio y qué invariante observable permite reconciliarlo. Solo entonces se añade un verificador por acción y se prueba el ciclo PREPARED → dispatch → lineage → observación/settlement sin redispatch. No construir otro monolito ni inventar infraestructura general antes de tener una acción concreta. M0 sigue INCOMPLETO.


## M0 — preflight doble de verificador confirmado en CI (2026-10-18)

- Prueba añadida en `tests/nexo/runtime.test.mjs`, commit [2088417a482fefc0128f024c8c63fa212e87d64f](https://github.com/snowdenxrp/aldea-ia/commit/2088417a482fefc0128f024c8c63fa212e87d64f): aunque el owner anuncie un verificador, si el adaptador no anuncia su propio contrato de reconciliación, el runtime bloquea antes de PREPARED y antes de dispatch.
- CI observable: [run 39172525158 — bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172525158) SUCCESS. Incluye `runtime.test.mjs`, `effect-adapter.test.mjs`, reconstrucción tras reinicio, store y contrato de continuidad.
- STEP 4 y STEP 5 también SUCCESS para este SHA: [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172525106), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39172525094). No extrapolar estas suites a M0 completo.
- El bloqueo arquitectónico sigue igual: no hay aún una acción no-repair nativa de Nexo con writer persistente + lector independiente post-restart. La ruta simulada de Lúmina no sirve como sustituto. La siguiente tarea no es agregar más preflights, sino definir la primera vertical nativa y su fuente persistida concreta antes de conectar un verificador específico.


## M0 — primera vertical nativa seleccionada: Chronicle (2026-10-18)

- Decisión documentada en [NCS_M0_FIRST_NATIVE_VERTICAL_CHRONICLE_2026-10-18.md](BUILD/NCS_M0_FIRST_NATIVE_VERTICAL_CHRONICLE_2026-10-18.md): usar una escritura de Chronicle como primer candidato no-repair para demostrar writer persistente + reader independiente tras reapertura, usando la identidad/idempotency key de la operación existente. Chronicle se mantiene separado de continuidad operativa, memoria ordinaria y Lúmina.
- Es una decisión de vertical, no implementación ni autorización de dispatch. Aún faltan writer/reader reales, idempotencia/conflicto, verificador específico, crash-cut tests y CI. No cambiar el runtime por defecto; M0 INCOMPLETO.
- Siguiente: inspeccionar convenciones de persistencia existentes e implementar solo el almacenamiento mínimo de Chronicle y sus pruebas de reapertura/concurrencia; luego conectar el verificador específico a la ruta owner-backed. No añadir otro effect journal ni asumir atomicidad cross-store.


## M0 — primera vertical Chronicle implementada; CI pendiente de observar (2026-10-18)

- Se añadió `src/nexo/core/chronicle-store.mjs`: store local de historia durable separado del continuity owner, inicialización explícita (la lectura/escritura no reconstruye un archivo ausente), validación de esquema, clave de operación única, append idempotente para la misma clave/contenido y conflicto para misma clave/contenido distinto. Usa lock local y reemplazo por archivo temporal; no afirma fsync ni resistencia a pérdida de energía/rollback.
- Se añadió `src/nexo/adapters/chronicle-observation.mjs`: observación por lectura nueva del store; devuelve `applied`, `not_applied` o `unknown`, y no reclama causalidad.
- Pruebas `tests/nexo/chronicle-store.test.mjs`: archivo ausente bloquea, inicialización explícita, escritores concurrentes con la misma clave no duplican la entrada, conflicto de contenido, nueva instancia/lectura post-restart y JSON corrupto → UNKNOWN.
- Workflow focal: `.github/workflows/nexo-m0-chronicle.yml`, ejecuta únicamente la suite nueva en Node 22.
- Commits de código/prueba/workflow: [store](https://github.com/snowdenxrp/aldea-ia/commit/aa9a3a34fd955edc19759aa8996416de7f938c7f), [observador](https://github.com/snowdenxrp/aldea-ia/commit/ef104bd8f2395449cc68fcaf374c136e17a367cb), [pruebas](https://github.com/snowdenxrp/aldea-ia/commit/8535c3a4df301d94b4f5d2bee3bf4b041e8402c5), [workflow](https://github.com/snowdenxrp/aldea-ia/commit/9c759110dc2ac76b20030c2d9fac2a8feb18fa0e). **No declarar PASS hasta observar el run real.**
- Todavía NO está conectado al runtime owner-backed ni a `effectVerifiers`; no existe settlement genérico habilitado por este cambio. Próximos cortes: observar CI y corregir fallos; agregar crash cuts de escritura/respuesta perdida; definir cómo ligar el resultado del observador a la PREPARED exacta y al CAS del owner; integrar solo esta acción y probar el flujo completo antes de cualquier cutover. M0 INCOMPLETO, efectos protegidos STOP, Nexo/Lúmina separados.


## M0 — primera CI verde de Chronicle y ampliación crash-cut en curso (2026-10-18)

- Corrección de estado: el workflow focal sí se ejecutó y terminó verde para la versión inicial de la vertical: [run 39173007733 — Chronicle persisted writer and independent reader, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173007733). El paso `Chronicle store and post-restart observation` terminó SUCCESS en SHA `9c759110dc2ac76b20030c2d9fac2a8feb18fa0e`.
- Después se ampliaron `tests/nexo/chronicle-store.test.mjs` para cubrir dos escrituras concurrentes con claves distintas y respuesta perdida después de que el rename ya persistió. El nuevo commit de pruebas es [bf3ded5](https://github.com/snowdenxrp/aldea-ia/commit/bf3ded518216a9556118b36f6f6135a7baa3fa93); su run [39173111447](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173111447) está QUEUED/PENDING al registrar esta nota. No declarar esas pruebas ampliadas como verdes hasta revisar el resultado.
- Sigue siendo una vertical de store/verifier, no una integración completa de efectos: no está conectada al runtime ni al CAS de settlement del owner. M0 INCOMPLETO; efectos protegidos STOP; runtime default sin cambios; Nexo/Lúmina separados.


## M0 — crash-cut Chronicle verde en CI (2026-10-18)

- La ampliación de pruebas también quedó verde: [run 39173111447 — Chronicle persisted writer and independent reader, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173111447), SHA `bf3ded518216a9556118b36f6f6135a7baa3fa93`. El job y el paso focal de Chronicle terminaron SUCCESS.
- Se valida, para esta suite acotada: lectura post-reapertura, idempotencia por misma clave/contenido, conflicto por contenido distinto, concurrencia tanto con misma clave como con claves diferentes, corrupción → UNKNOWN y respuesta perdida simulada después de rename ya persistido que se recupera mediante lectura posterior. Esto no prueba fsync, pérdida de energía ni runtime integrado.
- Siguiente corte: integrar el observador al contrato de reconciliación del owner sin permitir que el caller proporcione su propia evidencia ni que un resultado Chronicle liquide otra PREPARED. Primero revisar la forma exacta de `effectVerifiers`, `reconcilePrepared()` y CAS; luego añadir pruebas de identidad, revisión, crash/replay. M0 sigue INCOMPLETO.


## M0 — Chronicle conectado a la ruta owner-backed; integración vertical validada (2026-10-18)

- Se añadió `src/nexo/adapters/chronicle-effect.mjs`: contrato específico `chronicle_append` con handler, postcondition y verifier, sin activarlo automáticamente. El target de la operación lleva el contenido exacto que se verifica; la clave sigue siendo la identidad canónica `missionId:stepId`.
- `src/nexo/core/continuity-owner.mjs` ahora permite que la observación de Chronicle pase a `settled_observed` solo cuando el verificador registrado para `chronicle_append` devuelve `applied` desde `nexo-chronicle-store`; la admisión de outcome completed está ligada a la misma clave, acción, target y settlement persistido. Las demás acciones conservan el gate anterior.
- `src/nexo/runtime.js` completa el outcome de Chronicle solo tras esa observación; recuperación de PREPARED y replay de outcome leen estado persistido y nunca redispatch automáticamente.
- Prueba de integración real añadida en `tests/nexo/chronicle-runtime.test.mjs`: stores reales, owner real, adapter real; flujo completo PREPARED → dispatch → lineage → lectura independiente → settlement → outcome; restart después de append antes de lineage; PREPARED sin entrada no dispara reintento; respuesta perdida tras commit del outcome se recupera sin dispatch; replay tras settlement no duplica; se agregó guard para bloquear completion inventado sin settlement.
- CI observada para el flujo real y crash cuts anteriores: [run 39173898535 — Chronicle native vertical, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173898535), SHA `5e076ac31bd0c74432f104e54699918984520103`. El test nuevo de completion inventado está en [run 39173941624](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941624), todavía PENDING al registrar esta nota; el cambio de owner está en run 39173935254, IN_PROGRESS. No extrapolar éxito a esos SHA hasta confirmar sus runs.
- Iteraciones fallidas no ocultadas: [39173270651](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173270651) detectó un literal `\\n` que invalidó sintaxis; [39173290225](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173290225) detectó tests aún usando la firma anterior del verifier; [39173452126](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173452126) detectó invocación incorrecta de `contracts.verifiers`; las siguientes iteraciones corrigieron esos fallos y tuvieron CI verde.
- Estado: primera vertical nativa conectada en una ruta explícita y con crash/restart cubiertos; no es autorización para activar otras acciones ni para cambiar el runtime legado a default. No se reclama fsync, resistencia a pérdida de energía/rollback ni atomicidad entre Chronicle y continuity store. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.
- Siguiente: observar runs 39173935254 y 39173941624; después ejecutar/verificar suites amplias de runtime/owner y auditar el contrato de crash cuts contra el SHA final. Mantener el runtime por defecto sin cambiar hasta cerrar evidencia de la integración y decidir explícitamente su cutover.


## M0 — guard contra completion inventado y suites afectadas verdes (2026-10-18)

- CI final de la iteración: [run 39173941624 — Chronicle native vertical, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941624), SHA `47790c4014581c42fc5f85f9ba609e3a0678b53b`. Pasaron tanto la suite del store como el runtime owner-backed, incluidos: bloqueo de completion sin settlement, append real, recuperación tras restart, no-apply sin redispatch y replay de outcome tras respuesta perdida.
- En el SHA inmediatamente anterior del cambio de owner, también pasaron [bounded mission admission and restart continuity, run 39173935284](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173935284), [STEP 4 run 39173935176](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173935176) y [STEP 5 run 39173935237](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173935237). Para el SHA final 47790, STEP 4 [run 39173941657 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941657) y STEP 5 [run 39173941656 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39173941656).
- La integración sigue siendo una ruta explícita de runtime; no se ha cambiado `scripts/assistants.mjs` ni el runtime default, y todavía no existe una entrada de producto nativa independiente de Lúmina para invocar esta capacidad. La siguiente tarea es crear esa entrada mínima sin importar simulación ni inventar IDs: exigir misión/step IDs suministrados, rutas de store explícitas e inicialización opt-in; validar que una misión existente coincida exactamente antes de ejecutar.
- M0 sigue INCOMPLETO hasta que la entrada Nexo propia esté integrada y se pruebe junto a esta vertical. No ampliar a otras acciones, no habilitar efectos protegidos, no reclamar fsync/power-loss durability ni atomicidad cross-store.


## M0 — entrada propia de Chronicle disponible; CI final verde (2026-10-18)

- Se añadió `scripts/nexo-chronicle-session.mjs`: entrada local explícita que no importa Lúmina ni simulación. Requiere rutas de continuidad/Chronicle, missionId y stepId suministrados por el caller, y contenido; la inicialización de cada store es opt-in mediante flags. Antes de ejecutar, valida que una misión existente coincida exactamente con el contenido/acción/step y bloquea el reuso de identidad con payload distinto.
- El script construye el owner con el verifier confiable de Chronicle y el adaptador de una sola acción `chronicle_append`; el runtime solo da completed después de observación persistida, settlement y outcome. Replay/recovery no redispatcha.
- Pruebas de entrada real incluidas en `tests/nexo/chronicle-runtime.test.mjs`: inicialización explícita, primera escritura, replay sin dispatch, payload diferente bloqueado y stores ausentes bloqueados sin flags.
- `package.json` incluye ambas suites Chronicle en el test estándar; el workflow focal se dispara también si cambia `package.json`.
- CI final: [run 39174162150 — Chronicle native vertical, SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174162150), SHA `1ef9a4745d31d324b56733e43e250d36bb3908b7`. Tanto el paso del store/reader como el de runtime owner-backed/recovery terminaron SUCCESS. CI de entrada antes del último ajuste también fue verde en [run 39174097465](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174097465).
- Comando local documentado por interfaz: `node scripts/nexo-chronicle-session.mjs --continuity <ruta> --chronicle <ruta> --mission <id-suministrado> --step <id-suministrado> --content "texto" --initialize-continuity --initialize-chronicle`. Los flags de inicialización se omiten cuando los stores ya existen. No generar IDs por cuenta propia.
- **Alcance real:** primera vertical nativa de Nexo funciona por una entrada explícita y tests con stores/owner/adapter reales. No se ha migrado el runtime por defecto ni `scripts/assistants.mjs`; no se habilitaron otras acciones. Sin garantía fsync/pérdida de energía/rollback ni atomicidad cross-store. M0 sigue INCOMPLETO hasta auditar la integración de la entrada y definir el siguiente corte nativo sin mezclar Lúmina.


## M0 — suites Chronicle y continuidad acotada verdes en el mismo SHA (2026-10-18)

- SHA validado: `4626afbb1220feb0784c020288de697608b9276b`.
- [Chronicle native vertical, run 39174272574](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174272574): SUCCESS; store, verificador, runtime owner-backed, entrada CLI y recuperación tras reinicio.
- [Bounded mission admission and restart continuity, run 39174272526](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174272526): SUCCESS; orchestrator, runtime, adapter, reconstrucción, persistencia de reinicio, contrato/store/migración de continuidad y ambas suites Chronicle.
- STEP 4 y STEP 5 ya estaban verdes en el SHA inmediatamente anterior; el código del owner/runtime no cambió entre ese SHA y 4626, que añadió las pruebas de corrupción de stores y los triggers de workflow.
- No declarar M0 completo: la vertical cubre una acción y un CLI explícito. No hay cutover del runtime legado ni integración con `scripts/assistants.mjs`; esa separación es deliberada para no reintroducir Lúmina. Siguiente frontera: auditar los contratos de bootstrap/path de almacenamiento y decidir el corte de integración principal sin ampliar el dominio de acciones.


## M0 — auditoría de identidad de operación en Chronicle (2026-10-18)

- En la auditoría de la entrada propia se detectó una ambigüedad del formato heredado `missionId:stepId`: IDs que contuvieran `:` podían producir la misma clave concatenada para pares distintos. No se cambió el formato global ni se migraron journals; el entrypoint Chronicle ahora rechaza IDs con separador o espacios periféricos mediante `NEXO_CHRONICLE_ID_INVALID`. Es una restricción explícita de esta vertical para mantener compatibilidad con la identidad canónica existente.
- Se agregaron pruebas para colisión en missionId, colisión en stepId y espacios periféricos. Ambos workflows quedaron SUCCESS en el SHA `de89e228ca5b46becd17ef2e3159ab2e47c25f8e`: [Chronicle native vertical run 39174610849](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174610849) y [bounded continuity/runtime run 39174610848](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174610848).
- Estado de la frontera: la entrada sigue opt-in y Chronicle-only; runtime por defecto intacto; no hay garantía de fsync/pérdida de energía/rollback ni atomicidad entre los dos stores. M0 INCOMPLETO. Siguiente: auditar el parser CLI y sus errores de entrada, documentar el contrato de bootstrap de los stores y no ampliar acciones ni tocar `scripts/assistants.mjs`.


## M0 — parser CLI endurecido y CI verde (2026-10-18)

- `parseNexoChronicleArguments()` ahora rechaza opciones desconocidas, opciones de valor duplicadas, flags duplicados, valores ausentes y valores que comienzan con otra opción. Se agregó manejo de errores en la entrada ejecutable que devuelve un código estructurado sin imprimir contenido de Chronicle, stack ni rutas de archivos.
- Pruebas de parser agregadas a `tests/nexo/chronicle-runtime.test.mjs`; la identidad de operación también se valida contra colisiones del separador heredado.
- Un run intermedio [39174663488](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174663488) falló por una aserción que aún esperaba el código previo para IDs inválidos; la aserción ya reflejaba el contrato explícito y se volvió a ejecutar. SHA final de esta iteración: `d7af2db2150ab6be57683ad1e15977f29c613081`. [Chronicle run 39174722540 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174722540) y [continuity/runtime run 39174722491 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174722491).
- Siguiente corte: validar con ejecución CLI real (subproceso) que argumentos inválidos no toquen stores y que la salida no contenga el contenido privado; revisar el bootstrap explícito y el contrato de almacenamiento. No cambiar runtime default ni ampliar acciones. M0 INCOMPLETO.


## M0 — frontera CLI real probada; stores intactos ante argumentos inválidos (2026-10-18)

- La suite ahora lanza `scripts/nexo-chronicle-session.mjs` como subproceso real, no solo llama al parser exportado. Con argumento desconocido y contenido centinela, confirma salida no cero, código estructurado `NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID`, stderr vacío, sin filtrar el contenido y sin crear ninguno de los dos stores.
- SHA validado: `429fc980427c04f8db286e28ee9887333941acb8`. [Chronicle run 39174861087 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174861087); [bounded continuity/runtime run 39174861039 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39174861039).
- Con esto queda cubierto el límite CLI para errores de gramática. No equivale a validar todos los escenarios del SO/filesystem, durabilidad ante pérdida de energía ni rollback. Bootstrap sigue explícito; archivos faltantes/corruptos no se regeneran sin el flag, y corrupción existente no se sobrescribe.
- Siguiente: revisar el contrato de persistencia local (directorios padres, archivos temporales/locks, symlinks y límite de concurrencia soportado), decidir qué garantías se pueden afirmar y documentar los límites sin prometer fsync. Mantener runtime default sin cambios; M0 INCOMPLETO.


## M0 — privacidad de entrada CLI y auditoría de filesystem (2026-10-18)

- Auditoría detectó que `--content <texto>` exponía el cuerpo de Chronicle como argumento de proceso, aunque el programa no lo imprimiera. Se eliminó esa opción. El CLI ahora requiere `--content-stdin` y lee el contenido desde stdin; si stdin es TTY, falla cerrado en lugar de quedarse esperando. El contenido no aparece en argv ni en stdout/stderr.
- Prueba real de subproceso valida ambas rutas: argumentos inválidos no crean stores ni filtran el centinela; la invocación válida transmite por stdin, termina completed y el cuerpo aparece únicamente en el archivo Chronicle persistido. Se verificó que la lista de argumentos construida no contiene el contenido.
- SHA final: `0ea0b8bcbd68a2e2062e359b11247cd6a04a2457`. [Chronicle CI 39176108822 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176108822); [continuidad/runtime CI 39176108833 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176108833).
- Auditoría del store: la escritura usa archivo temporal + rename y lectura posterior, pero eso no prueba fsync ni supervivencia a pérdida de energía. Las rutas de almacenamiento son suministradas por caller; no hay sandbox/canonicalización de rutas ni protección demostrada frente a symlinks. La recuperación de locks viejos usa comprobación de edad/PID seguida de borrado; ese check-then-remove no demuestra exclusión robusta bajo carreras adversariales entre procesos. No declarar soporte distribuido ni garantías de lock frente a procesos hostiles. Esto queda como bloqueo explícito antes de integración de producción.
- No cambié el runtime por defecto, no amplié las acciones y no mezclé Lúmina. Próximo corte: especificar el modelo de confianza de rutas/filesystem y resolver de forma comprobable la reclamación segura de locks o limitar formalmente la ejecución a un único proceso cooperante; después añadir pruebas de concurrencia entre procesos. M0 sigue INCOMPLETO.


## M0 — concurrencia multiproceso cooperante verificada (2026-10-18)

- Se amplió `tests/nexo/chronicle-store.test.mjs` para iniciar dos procesos Node independientes que escriben claves distintas simultáneamente al mismo Chronicle y después abrir un reader nuevo. Ambas operaciones deben confirmar commit y ambas entradas deben sobrevivir; el test pasó.
- SHA: `6940f9524773b36a97d8c6eb44d7c2bd81146d62`. [Chronicle run 39176214934 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214934), [continuidad/runtime 39176214965 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214965), [STEP 4 39176214931 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214931), [STEP 5 39176214932 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39176214932).
- Esta prueba demuestra solo dos escritores cooperantes bajo el filesystem local de CI; no resuelve la carrera de reclamación de locks obsoletos ni valida procesos adversariales, symlinks o power loss. Esas limitaciones siguen bloqueando integración de producción. M0 INCOMPLETO.


## M0 — stale-lock reclamation fail-closed (validado 2026-10-18)

- Se eliminó la eliminación automática de locks considerados obsoletos en `src/nexo/core/chronicle-store.mjs` y `src/nexo/core/continuity-store.mjs`. El patrón previo comprobaba PID/antigüedad y luego hacía `rm -r`; otro proceso podía adquirir un lock nuevo entre ambas operaciones y el reaper borrar el lock ajeno.
- Nuevo comportamiento: si un lock se considera obsoleto, la operación falla explícitamente con `NEXO_CHRONICLE_LOCK_STALE_RECOVERY_REQUIRED` o `NEXO_CONTINUITY_STORE_LOCK_STALE_RECOVERY_REQUIRED`. No elimina el directorio ni despacha una escritura. La recuperación requiere intervención explícita; no se afirma recuperación automática de locks abandonados.
- Regresiones: ambos tests crean un lock con propietario muerto y antigüedad >60 s, verifican el error específico, comprueban que el archivo de datos no cambió y que el lock original sigue intacto.
- Evidencia CI observada: Chronicle vertical [run 39178005072 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005072), STEP 4 [39178005085 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005085), STEP 5 [39178005091 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178005091) en SHA `8cb919e182de9ff0b36b7d0827e6e479e6cf9de5). Tras incluir también la regresión de continuidad: continuidad/restart [run 39178015348 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015348), STEP 4 [39178015299 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015299) y STEP 5 [39178015376 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178015376), SHA `b32b1307f7aedf1a0b39d78f58cde6f1c87776b0).
- Esto valida el contrato fail-closed en el filesystem local de CI; no prueba resistencia a symlink/path attacks, fsync, pérdida de energía, filesystem distribuido ni todos los interleavings adversariales. El uso de rutas sigue necesitando un contrato explícito.
- **Siguiente frontera M0:** definir el contrato de ruta/FS (rutas canónicas, symlinks, permisos y ámbito local) y decidir si el modelo de operación será explícitamente un único proceso cooperante o si hace falta una estrategia de locking segura que no dependa de reaper racy. No ampliar acciones ni cambiar el runtime default. M0 sigue INCOMPLETO; Nexo/Lúmina separados.


## M0 — contrato de ruta explícito y CI tras documentación de stores (2026-10-18)

- Los comentarios de ambos stores y `NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md` ahora declaran que `filePath` es configuración confiable, no sandbox; el caller debe usar directorio local de confianza y evitar mutación por procesos no confiables. No se reclama defensa frente a symlinks/path attacks.
- CI del último SHA de código `24d2e3561e1a65a8399875e5d826a43aef593129`: continuidad/restart [39178122458 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122458), STEP 5 [39178122453 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122453), repair crash cuts [39178122447 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122447), STEP 4 [39178122428 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178122428). Chronicle vertical y las mismas suites también pasaron en SHA `888572c78390d4d46a4e7e4149bb793a93be82d1`: [39178115475](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115475), [39178115490](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115490), [39178115492](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115492), [39178115533](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115533), [39178115484](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178115484).
- **Decisión aún pendiente:** confirmar que el despliegue inicial acepta el contrato de directorio local privado/cooperación confiable, o detener la integración hasta disponer de locking de sistema operativo más fuerte. No confundir esta validación de stores con cutover del runtime: M0 sigue INCOMPLETO y runtime default sin cambios.


## M0 — frontera de entrada principal: no acoplar Chronicle a assistants.mjs (auditoría 2026-10-18)

- Relectura de `scripts/nexo-chronicle-session.mjs`: es un entrypoint opt-in separado que crea stores Nexo propios y llama `executeNexoStepWithContinuityOwner()`; no importa Lúmina ni la simulación. Es una vertical ejecutable, no el runtime general ni la entrada principal integrada.
- `scripts/assistants.mjs` importa `world.js`, `simulation.js`, `simulate.mjs`, memoria de asistentes y el builder de misiones desde informes de simulación. Aunque persiste continuidad, su flujo principal pertenece a la aplicación de simulación. Conectar ahí Chronicle como si fuera la entrada de Nexo reintroduciría el acoplamiento que queremos evitar.
- Decisión de trabajo: conservar la vertical Chronicle como CLI explícita de validación; no modificar `scripts/assistants.mjs` para alojarla. La siguiente frontera de arquitectura es diseñar/identificar una entrada de aplicación Nexo independiente que pueda invocar la capacidad sin inicializar mundo/simulación Lúmina. No construir todavía una segunda aplicación completa ni cambiar runtime default: primero inspeccionar el punto de entrada del producto y los contratos mínimos que requiere.
- Esta auditoría no altera código ni cambia el estado de M0: INCOMPLETO. Efectos protegidos STOP; STEP 7 OPEN / STOP / UNKNOWN.


## M0 — handoff de cambio de chat (2026-10-18, actualizado)

- Handoff operativo vigente: [NCS_M0_HANDOFF_RECOVERY_NEW_CHAT_2026-10-18.md](BUILD/NCS_M0_HANDOFF_RECOVERY_NEW_CHAT_2026-10-18.md), sección 10. Contiene HEAD observado, commits, CI probado, límites ya cerrados y pasos exactos para continuar sin repetir investigación.
- Punto actual: definir una entrada principal Nexo-only sin inicializar Lúmina. `scripts/assistants.mjs` importa simulación/mundo y no debe ser anfitrión de Chronicle. Mantener el CLI Chronicle explícito como vertical focal.
- Stores: locks obsoletos fallan cerrado; no hay reaper automático. `filePath` es configuración confiable, no sandbox. No reclamar resistencia a symlink/path attacks, fsync/power-loss o filesystem distribuido.
- Continuación posterior: seam mínimo de entrada Nexo-only; luego contrato genérico owner-backed con PREPARED confirmado antes de dispatch y reconciliación confiable por acción. Chronicle es la única acción no-repair demostrada en esta vertical.
- **M0 INCOMPLETO; runtime default sin cutover; efectos protegidos STOP; Nexo/Lúmina separados.** No reabrir auditorías cerradas ni pasar a M1/STEP 7.


## M0 — replay idempotente de reconciliación genérica tras respuesta perdida (2026-10-18)

- Código: `src/nexo/core/continuity-owner.mjs`. Si `reconcilePrepared` encuentra una revisión distinta de la esperada, ahora inspecciona primero el journal persistido. Solo reconoce replay cuando existe exactamente una entrada con la misma identidad canónica (missionId, stepId, action, target e idempotencyKey) y un registro de observación ya persistido compatible con su estado.
- Respuesta de replay: `already_observed`; no vuelve a ejecutar el verifier, no afirma causalidad, no autoriza redispatch y no convierte `reconciled_observed` en settlement. Para Chronicle, solo refleja `journalSettled: true` cuando ya existe el settlement persistido específico `nexo-chronicle-store`.
- Prueba añadida a `tests/nexo/repair-settlement-crash-cuts.test.mjs`: el store confirma internamente el commit y devuelve una respuesta incierta; el replay recupera la observación sin segunda llamada al verifier; una operación con target distinto no puede reutilizar el registro; el journal permanece `reconciled_observed`.
- Commits de cambio: implementación `39d13a8251e836abd1917aff071396f165993ab8`; prueba `31c8b3a4be5743ac12fc0c66bcae1d69b2fae1d6`.
- Validación remota consultada para el SHA de prueba: no hay statuses/checks visibles en el conector y la consulta de runs asociadas no devolvió ejecuciones. **CI = UNKNOWN/PENDING; la prueba aún no está demostrada como ejecutada.** No declarar PASS por ausencia de fallo.
- Próximo paso: conseguir evidencia de ejecución de la suite focal y regresiones. Después continuar la frontera arquitectónica ya fijada: entrada principal Nexo-only sin importar mundo/simulación de Lúmina. No hacer cutover del runtime default ni ampliar acciones.
- M0 continúa **INCOMPLETO**; efectos protegidos **STOP**; Nexo/Lúmina separados.


### Resultado de validación — replay genérico (SHA `32df994706a16167d8d92440569b5db200feeb1b`)

- La primera ejecución de la nueva prueba falló antes de ejecutar tests por una declaración duplicada de `genericVerifierCalls` en el mismo scope: [39178949801 FAILURE](https://github.com/snowdenxrp/aldea-ia/actions/runs/39178949801). Se corrigió renombrando el contador local; el fallo quedó visible y no se presentó como un fallo del runtime.
- En el SHA `32df994706a16167d8d92440569b5db200feeb1b` quedaron **SUCCESS**:
  - [39179028829 — repair crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179028829), incluyendo migración del owner, repair lifecycle, sesión canónica, sintaxis del puente/runtime y CLI aislada.
  - [39179029008 — effect adapter + settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179029008).
  - [39179028944 — semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179028944).
  - [39179028821 — outcome classification, restart reconstruction y protected transition](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179028821).
- Resultado limitado a estas suites/workflows; no equivale a la suite completa del repositorio ni al cutover del runtime. La recuperación genérica queda probada para el crash cut añadido; no se infiere causalidad ni se habilita redispatch.
- Próximo frente sigue siendo la entrada principal Nexo-only sin imports de Lúmina, manteniendo Chronicle opt-in. **M0 INCOMPLETO**.


## M0 — entrada Nexo-only (2026-10-18)

- Se añadió `scripts/nexo.mjs` como router CLI independiente; únicamente permite `chronicle-append` y rechaza comandos desconocidos. El Chronicle session ahora importa `src/nexo/core/owner-backed-runtime.mjs`, separado de los imports estáticos de Lúmina que conserva `src/nexo/runtime.js` por compatibilidad.
- La prueba real del entrypoint y la vertical Chronicle pasaron en SHA `9174921f587b504f40524ae5e89f47da68e40ae2`: [CI 39179321550 SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179321550).
- Detalle y límites: [NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md](BUILD/NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md).
- Alcance: CLI Nexo-only, no UI web ni runtime general. `index.html` sigue siendo Lúmina; no se modificó. M0 INCOMPLETO, runtime default sin cutover, efectos protegidos STOP.


## M0 — allowlist de acciones antes de dispatch (2026-10-18)

- `src/nexo/core/owner-backed-runtime.mjs` permite solo `chronicle_append`; repair actions y toda otra acción bloquean antes de PREPARED/dispatch. Tests actualizados para este contrato.
- CI focal verde: [39179449609](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179449609), [39179591854](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591854), [39179591845](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591845), [39179591868](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179591868). Detalle: [contrato genérico de efectos](BUILD/NCS_M0_GENERIC_EFFECT_CONTRACT_GATE_2026-10-18.md).
- No es settlement genérico ni runtime completo. No ampliar acciones ni cambiar runtime default. M0 INCOMPLETO; efectos protegidos STOP.


## M0 — inspección read-only de continuidad (2026-10-18)

- Se añadió `npm run nexo -- status --continuity PATH`: solo lee el store canónico y devuelve revisión + contadores agregados; no expone contenido/targets ni inicializa stores ausentes.
- Test de proceso real confirma error sin mutación para store ausente y bytes idénticos antes/después de lectura válida. CI SUCCESS en SHA `f15760571a6092235c1ff8dbb776be4a384ba2d5`: [39179823123](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179823123), [39179823124](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179823124), [39179823115](https://github.com/snowdenxrp/aldea-ia/actions/runs/39179823115).
- Es diagnóstico read-only, no una acción de efecto ni runtime general. Solo `chronicle_append` puede mutar; M0 INCOMPLETO.


## M0 — reconstrucción canónica de misión desde la entrada Nexo (2026-10-19)

- Se corrigió un error semántico en `reconstructNexoMissionFromSnapshot()`: toda entrada `settled_observed` se clasificaba como reparación observada, incluso `chronicle_append`, degradando a `blocked` un paso Chronicle con settlement específico y outcome terminal ya persistidos. Ahora Chronicle se excluye de ese guard de reparación; otras acciones siguen conservadoras.
- Regresión en `tests/nexo/chronicle-runtime.test.mjs`: después del append real, el outcome completado sigue apareciendo como `step.status=completed` tras reconstrucción.
- Se añadió `npm run nexo -- mission-status --continuity PATH --mission ID`. Reconstruye desde el store canónico y expone solo misión/estado, objetivo, incertidumbre y resumen de pasos; omite target/context/payload. Misión ausente → `NEXO_MISSION_NOT_FOUND`. La consulta no modifica el store.
- Test de proceso real compara bytes antes/después, verifica que el contenido privado no salga a stdout y comprueba estado reconstruido. CI SUCCESS en SHA `ccb1fb7218fbb0b13615a95c403b002b025faa35`: [39180275512](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180275512), [39180275517](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180275517), [39180275561](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180275561). La regresión de clasificación de reconstrucción previa pasó en [39180216543](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180216543).
- Esto mejora lectura/reconstrucción; no añade efectos ni cambia runtime default. M0 INCOMPLETO; Chronicle sigue como única acción mutante expuesta; efectos protegidos STOP.


## M0 — misión-status conserva PREPARED tras restart (2026-10-19)

- Se amplió el test de proceso de `mission-status` con un store canónico que contiene una obligación `prepared`. Tras reconstrucción, la misión y el paso siguen `blocked` con `NEXO_EFFECT_RECONCILIATION_REQUIRED`; el payload privado no aparece en stdout y los bytes del store permanecen idénticos.
- CI SUCCESS en SHA `c7ad605f1257904cb3c4ff8eae261243068cfa95`: [39180351432](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180351432), [39180351413](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180351413), [39180351418](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180351418).
- Esto demuestra consulta de continuidad y preservación de incertidumbre, no settlement ni autorización de efectos. M0 INCOMPLETO; runtime default sin cutover; efectos protegidos STOP.


## M0 — replay desde un segundo proceso sin duplicar Chronicle (2026-10-19)

- `tests/nexo/entrypoint.test.mjs` ejecuta `chronicle-append` en un proceso, cierra ese proceso y vuelve a invocar el CLI con el mismo mission/step/payload en un segundo proceso. El replay devuelve completed con `dispatchAttempted=false`; el archivo Chronicle y el store de continuidad permanecen byte por byte idénticos.
- Esto valida la frontera de reinicio del CLI, no solo repetir la función en memoria. CI SUCCESS en SHA `3ed7860a189b6b00d0a5444eb466a4393c4a2c4c`: [39180401874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401874), [39180401875](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401875), [39180401886](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180401886).
- M0 sigue INCOMPLETO: prueba de un solo vertical, no pérdida de energía/fsync, autoridad ni runtime general. No cambiar runtime default ni ampliar acciones.


## M0 — guard de import graph Nexo-only (2026-10-19)

- `tests/nexo/entrypoint.test.mjs` recorre los imports locales estáticos desde `scripts/nexo.mjs` y `scripts/nexo-chronicle-session.mjs`. La prueba falla si cualquier dependencia transitiva importa la memoria de asistentes, el adapter de simulación, `world.js`, `simulation.js`, `simulate.mjs` o el runtime de compatibilidad `src/nexo/runtime.js`.
- CI SUCCESS en SHA `c9f62e3611a598f0ab29fa1b55d2ac849a67c6c3`: [39180518798](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180518798), [39180518686](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180518686), [39180518787](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180518787).
- Protege separación arquitectónica estática; no prueba aislamiento de proceso/OS ni cambia runtime default. M0 INCOMPLETO.


## M0 — seam de aplicación Nexo separado del CLI (2026-10-19)

- Se extrajo la lógica de `runNexoChronicleAppend()` a `src/nexo/application/chronicle-append.mjs`; la apertura del owner pasó de `scripts/nexo-continuity.mjs` a `src/nexo/core/continuity-service.mjs`. El script antiguo conserva solo reexport de compatibilidad.
- `status` y `mission-status` se movieron a `src/nexo/application/continuity-queries.mjs`; `scripts/nexo.mjs` queda como parser/router CLI. `scripts/nexo-chronicle-session.mjs` queda como wrapper de proceso sobre el servicio de aplicación.
- El primer CI del refactor detectó `ReferenceError: blocked is not defined` después de mover la función fuera del script. Se restauró el helper de resultado bloqueado en la frontera CLI y en el servicio de aplicación; no se ocultó el fallo.
- Validación posterior SUCCESS: [Chronicle/entrypoint 39180686782](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180686782), [mission admission/restart 39180686817](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180686817), SHA de código/test `8d05417d0a47b5f38fb63833c338a0f04d1499e7`.
- Esto crea una API de aplicación Nexo reutilizable sin convertir el CLI en la lógica de dominio. No es todavía app Android/web ni cutover del runtime default. M0 INCOMPLETO.


## M0 — contrato de aplicación: concurrencia y replay explícito (2026-10-19)

- `tests/nexo/chronicle-runtime.test.mjs` ahora consume `runNexoChronicleAppend()` directamente desde `src/nexo/application/chronicle-append.mjs`, no desde el wrapper CLI. El CLI conserva su prueba de proceso independiente.
- Dos llamadas concurrentes con la misma misión/paso no pueden despachar dos veces ni crear entradas Chronicle duplicadas. Un retry explícito posterior recupera el resultado con `dispatchAttempted=false` y no cambia ninguno de los dos archivos.
- CI SUCCESS en SHA `140769ea651ed5cd198fd57f05530679e79f8c5d`: [Chronicle/entrypoint 39180811315](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811315), [continuity/runtime 39180811308](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811308), [semantic validation 39180811234](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811234), [outcome/restart 39180811257](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180811257).
- El contrato permite que el perdedor de la carrera reciba un conflicto/bloqueo y haga retry explícito; no hay reintentos automáticos, cola ni redispatch inferido. Solo Chronicle habilitado. M0 INCOMPLETO.


## M0 — carrera de bootstrap inicial y convergencia por retry explícito (2026-10-19)

- Se añadió una prueba donde dos invocaciones de `runNexoChronicleAppend()` compiten con ambos stores ausentes y flags de inicialización opt-in. El resultado de la carrera puede bloquear a un caller, pero no hay más de un dispatch.
- Un retry explícito converge a un solo append; una reproducción final no despacha y mantiene idénticos ambos archivos. No se afirma atomicidad cross-store: se comprueba recuperación segura tras la carrera.
- CI SUCCESS en SHA `7f4c69ef8003515c53d761677185f4668c05d5a0`: [Chronicle 39180909793](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909793), [continuity/restart 39180909802](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909802), [semantic validation 39180909892](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909892), [outcome classification 39180909760](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180909760).
- No automatic retry/queue; el caller reintenta explícitamente. Solo Chronicle muta. M0 INCOMPLETO.


## M0 — API de aplicación rechaza entrada inválida antes de tocar stores (2026-10-19)

- `tests/nexo/chronicle-runtime.test.mjs` invoca directamente el servicio de aplicación con ruta requerida vacía y tipo inválido en flag de inicialización. Ambos casos devuelven `blocked / NEXO_CHRONICLE_SESSION_INPUT_INVALID` y `dispatchAttempted=false`, antes de acceder a los stores.
- CI SUCCESS en SHA `e8abe56f791e8460be6ae71abe723a3907bd13aa`: [Chronicle 39180992024](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180992024), [continuity/restart 39180991951](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180991951), [semantic validation 39180991860](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180991860), [outcome classification 39180991827](https://github.com/snowdenxrp/aldea-ia/actions/runs/39180991827).
- Se cubren inputs, binding de payload, concurrencia, replay, outcomes inciertos y ausencia de dispatch duplicado para el vertical Chronicle. No generalizar a otras acciones; M0 INCOMPLETO.


## M0 — resultados distinguen conflicto CAS de outcome desconocido (2026-10-19)

- `executeNexoStepWithContinuityOwner()` ya no aplana un conflicto CAS confirmado al escribir PREPARED en un `blocked` genérico: devuelve `status=conflict`, revisión observada y `dispatchAttempted=false`.
- Si el append Chronicle quedó asentado pero el CAS del outcome devuelve `conflict`, la respuesta ahora conserva `status=conflict`, `journalSettled=true`, `terminalOutcomeRecorded=false`. Un replay posterior registra el outcome existente sin redispatch.
- `src/nexo/application/chronicle-append.mjs` propaga de forma explícita el conflicto de admisión de misión. Excepciones/commit-response-lost siguen siendo `unknown`; los conflictos conocidos no se presentan como incertidumbre de escritura.
- Regresiones: conflicto PREPARED bloquea antes del adapter; conflicto de outcome deja journal settled y recupera por outcome replay solamente. CI SUCCESS en SHA `8e0d226c1df5e8c52ab802fe138d86da1a7a08d8`: [Chronicle 39181169917](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181169917), [continuity/restart 39181169919](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181169919), [semantic validation 39181169938](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181169938), [outcome/restart 39181169900](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181169900).
- No se añade retry automático. El caller decide cuándo reintentar después de leer el estado canónico. M0 INCOMPLETO.


## M0 — matriz de outcomes inciertos y campos tri-state (2026-10-19)

- El resultado público de `executeNexoStepWithContinuityOwner()` normaliza flags: `dispatchAttempted`, `preparedCommitted`, `lineageCommitted`, `journalSettled`, `terminalOutcomeRecorded`, `redispatchAuthorized`. Los campos de commit conservan `"UNKNOWN"` cuando una excepción pudo ocurrir después de persistir; no se convierten falsamente en `false`.
- Cubierto por pruebas: PREPARED commit UNKNOWN → no dispatch y `preparedCommitted="UNKNOWN"`; adapter lanza → resultado UNKNOWN sin mensaje crudo; lineage commit excepción → `lineageCommitted="UNKNOWN"`; reconciliación commit respuesta perdida → `journalSettled="UNKNOWN"`; outcome commit respuesta perdida → `terminalOutcomeRecorded="UNKNOWN"`; conflicto CAS conocido → `status=conflict`.
- El error crudo del adapter ya no sale en el objeto de resultado de aplicación. El CLI continúa emitiendo solo los campos permitidos.
- CI SUCCESS en SHA `7f4f80f44912ac93f59b65977f728b95dc6fab2e`: [Chronicle 39181497303](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181497303), [continuity/restart 39181497305](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181497305), [semantic validation 39181497592](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181497592), [outcome/restart 39181497309](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181497309).
- M0 INCOMPLETO; sin retries automáticos, sin acciones adicionales, sin cutover.


## M0 — contrato formal de resultados de aplicación

Documento: [NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md](BUILD/NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md).

La matriz de resultados quedó consolidada en un contrato de aplicación: distingue `blocked`, `conflict`, `unknown`, `observed` y `completed`; define campos booleanos/tri-state y prohíbe convertir un commit potencialmente persistido en `false`. El contrato se valida con la matriz de crash cuts y la suite de Chronicle/continuidad. M0 INCOMPLETO; solo Chronicle habilitado.


## M0 — superficie pública estrecha de aplicación (2026-10-19)

- Se añadió `src/nexo/application/index.mjs` como entrada pública estable para consumidores. Exporta exactamente tres funciones: `runNexoChronicleAppend`, `loadNexoContinuityStatus`, `loadNexoMissionStatus`.
- CLI y pruebas consumen ahora esa entrada pública. Una regresión falla si se añade un dispatcher genérico o export adicional sin decisión arquitectónica explícita.
- CI SUCCESS en SHA `71a01beb06d9a9d01e1cd459fe123588e1dd553b`: [Chronicle/entrypoint 39181785728](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785728), [semantic validation 39181785739](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785739), [outcome/restart 39181785834](https://github.com/snowdenxrp/aldea-ia/actions/runs/39181785834).
- Es un seam de aplicación reutilizable, no una app web/Android ni cutover. Solo Chronicle muta. M0 INCOMPLETO.


## M0 — gate previo a integrar UI/runtime

Documento: [NCS_M0_APPLICATION_SURFACE_ACCEPTANCE_2026-10-19.md](BUILD/NCS_M0_APPLICATION_SURFACE_ACCEPTANCE_2026-10-19.md).

Decisión actual: la API pública es un seam de backend validado para Chronicle, no autorización para conectarla a UI, HTTP local ni runtime legacy. Antes de esa integración deben revisarse límites de amenaza, autoridad, configuración de rutas, outcomes UNKNOWN y pruebas de reinicio contra todos los criterios del gate. `index.html` sigue siendo Lúmina; no se cambia. M0 INCOMPLETO.


## M0 — respuesta perdida al admitir una misión (2026-10-18, CI pendiente)

- Revisión del seam de aplicación detectó que `owner.recordMission()` se llamaba sin capturar excepciones. Si el store persistía la misión y se perdía la respuesta, la excepción podía escapar como error crudo aunque no hubiera dispatch.
- Corrección en `src/nexo/application/chronicle-append.mjs`: helper `recordNexoMissionSafely()` convierte la excepción en `status=unknown`, `missionAdmissionCommitted=UNKNOWN`, `dispatchAttempted=false`, `redispatchAuthorized=false`. No continúa al dispatch.
- Regresión en `tests/nexo/chronicle-runtime.test.mjs`: simula respuesta perdida, conserva UNKNOWN, no revela mensaje interno ni autoriza dispatch.
- Código/test SHA: `e4562b6edb0ce4c3f0df1ccaae94cc63edf33d1f`. CI todavía no observado para ese SHA; PENDING/UNKNOWN, no declarar PASS.
- La recuperación posterior debe releer continuidad canónica. No convertir UNKNOWN en false ni añadir retry automático. M0 INCOMPLETO; no ampliar acciones ni conectar runtime default.


## Mission-admission UNKNOWN normalization — validated update (2026-10-18 local)

- The safe admission helper now normalizes both thrown store errors and returned `status=unknown` results to `missionAdmissionCommitted=UNKNOWN`, `dispatchAttempted=false`, and `redispatchAuthorized=false`. A returned UNKNOWN cannot lose its tri-state marker merely because it did not throw.
- Regression covers both exception-after-possible-commit and an explicit UNKNOWN return. Raw exception text remains hidden.
- Validated code/test SHA: `872a67b3e6512fce134507f82052a5cbc37d495f`. CI SUCCESS: [Chronicle 39187025194](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187025194), [continuity/restart 39187025178](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187025178), [STEP 4 39187025188](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187025188), [STEP 5 39187025187](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187025187), all SUCCESS.
- Replay policy remains explicit: no automatic retry or dispatch after UNKNOWN; next call reloads canonical continuity. M0 INCOMPLETO.


## Public application result allowlist — validated (2026-10-18 local)

- `runNexoChronicleAppend()` now returns an allowlisted summary instead of forwarding internal runtime objects. Public results omit `adapterResult`, `lineage`, `reconciliation`, `outcome`, `target`, and `context`; tests assert the Chronicle content does not appear in the serialized result.
- Every blocked result explicitly returns `dispatchAttempted=false` and `redispatchAuthorized=false`. Mission-admission uncertainty remains `UNKNOWN` and never dispatches.
- Validated code/test SHA: `7eaa58f106c7fe696e7674085cc58286a4256f75`. CI SUCCESS: [Chronicle 39187179382](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187179382), [continuity/restart 39187179340](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187179340), [STEP 4 39187179363](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187179363), [STEP 5 39187179346](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187179346), all SUCCESS.
- Scope: this hardens the public result boundary for the existing Chronicle vertical. It does not add a mutating capability or authorize UI/runtime integration. M0 INCOMPLETO.


## Current verified pointer — M0 public result boundary

- Branch HEAD: `0e4baf55de41bcfff249377785809765487ec883` (documentation-only).
- Latest code/test SHA with all four focal workflows SUCCESS: `7eaa58f106c7fe696e7674085cc58286a4256f75`.
- Comparison from code/test SHA to HEAD contains only `STATUS.md`, this handoff, and `NCS_M0_APPLICATION_RESULT_CONTRACT_2026-10-19.md`.
- Current proof: mission-admission thrown/returned UNKNOWN stays UNKNOWN and cannot dispatch; public Chronicle application results omit payload/internal execution objects; every blocked result explicitly prohibits redispatch; read-only mission reconstruction preserves PREPARED as blocked; same-operation process replay does not append twice.
- Next frontier: continue auditing exception/response-loss semantics at the public application boundary and keep the result allowlist stable. No new action, no UI/legacy-runtime integration, no `index.html` change, no authority inference. M0 INCOMPLETO; protected effects STOP; Nexo/Lúmina separate.


## Mission admission commit-response crash cut — validated (2026-10-18 local)

- The regression now uses the real canonical continuity file store. A wrapper commits a mission, then throws to simulate response loss after persistence. The application helper returns `unknown / missionAdmissionCommitted=UNKNOWN`, `dispatchAttempted=false`, `redispatchAuthorized=false`; a fresh canonical read reconstructs the mission as planned at revision 1. No effect was dispatched.
- The first test attempt expected a second direct `recordMission()` call to return `already_recorded`; CI correctly returned `conflict`, because duplicate mission registration is not the recovery API. The test was corrected to assert canonical reconstruction instead; no production behavior was changed to fake duplicate admission.
- Validated code/test SHA: `274af889dfcfe8457af005f5ee126d012b1b6555`. CI SUCCESS: [Chronicle 39187313873](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187313873), [continuity/restart 39187313731](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187313731), [STEP 4 39187313692](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187313692), [STEP 5 39187313854](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187313854), all SUCCESS.
- This proves the mission-admission response-loss cut and read-only recovery. It does not claim power-loss/fsync durability or authorize dispatch from UNKNOWN. M0 INCOMPLETO.

## Current verified pointer — mission-admission response-loss proof

- Branch HEAD at last documentation update: `0e4baf55de41bcfff249377785809765487ec883`; latest docs updates may advance HEAD further without changing code.
- Latest code/test SHA with four focal workflows SUCCESS: `274af889dfcfe8457af005f5ee126d012b1b6555`.
- Next: continue audit of the public application boundary and result contract. No new mutating action, no UI/legacy runtime integration, no `index.html` change, no authority inference. M0 INCOMPLETO; protected effects STOP; Nexo/Lúmina separate.


## Public API import-graph guard — re-exports included (validated 2026-10-18 local)

- The static Nexo/Lúmina separation test now traverses both `import ... from` and `export ... from`. This closes a blind spot where the public application index's re-exports could hide its implementation modules from the recursive audit.
- The test explicitly proves that `src/nexo/application/chronicle-append.mjs` and `continuity-queries.mjs` are reached from the CLI entrypoints through the public index, while `src/nexo/runtime.js` remains unreachable.
- Code/test SHA: `0872c646db77af2e3e0bbd9e711d7f81c6cc1caa`. CI SUCCESS: [Chronicle 39187372728](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187372728), [STEP 4 39187372719](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187372719), [STEP 5 39187372729](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187372729).
- This is a static import-graph guard, not OS isolation or UI integration. M0 remains INCOMPLETO; protected effects STOP; Nexo/Lúmina separate.

## Current verified pointer — import-graph guard

- Latest code/test SHA with focal CI SUCCESS: `0872c646db77af2e3e0bbd9e711d7f81c6cc1caa`.
- The only code change since the preceding validated checkpoint is the test's import-graph traversal and its assertions; no runtime or application behavior changed.
- Next: audit public API boundaries and recovery semantics only. Do not add a second mutating use case, connect `index.html` or the legacy runtime, or infer authority from continuity state.


## Pointer reconciliado tras documentación de separación (2026-10-18 local)

- Branch HEAD actual: `35dee17378716200d3f1fa0c0915256e66e2a72f` (documentación-only).
- Último SHA de código/test: `0872c646db77af2e3e0bbd9e711d7f81c6cc1caa`; workflows relevantes SUCCESS: [39187372728](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187372728), [39187372719](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187372719), [39187372729](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187372729).
- Comparación código/test → HEAD: únicamente `STATUS.md`, `NCS_M0_HANDOFF_RECOVERY_NEW_CHAT_2026-10-18.md` y `NCS_M0_ENTRYPOINT_SEPARATION_2026-10-18.md`.
- No se ha conectado UI ni runtime legacy. Siguiente frontera: seguir probando el contrato público y las ventanas de respuesta perdida; no ampliar la capacidad mutante más allá de Chronicle.



## M0 — normalización pública de admisión UNKNOWN (2026-10-19)

- Hallazgo acotado: la rama de runNexoChronicleAppend() que recibía status=unknown durante la admisión devolvía directamente el objeto del helper, saltándose el serializador allowlist usado por el resto de resultados.
- Corrección: esa rama pasa ahora por publicChronicleResult() y conserva missionAdmissionCommitted=UNKNOWN, dispatchAttempted=false, redispatchAuthorized=false, junto con missionId y stepId. La allowlist descarta target, adapterResult y otros objetos internos.
- Regresión unitaria: resultado sintético UNKNOWN confirma forma pública, tri-state y ausencia de payload interno. CI SUCCESS en SHA 3c8d14163144e6f83a6130f38f025e31302c1ac9: Chronicle [39187723675](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187723675), bounded mission admission/restart [39187723680](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187723680), STEP 4 [39187723651](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187723651), STEP 5 [39187723612](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187723612).
- Esto uniforma el contrato público; no cambia recuperación, no autoriza dispatch ni añade otra acción mutante. M0 INCOMPLETO; efectos protegidos STOP; Nexo separado de Lúmina.



## M0 — validación de tipos en el resultado público (2026-10-19)

- Segundo hallazgo de la misma frontera: la allowlist de campos copiaba valores sin validar tipos; un resultado interno mal formado podía introducir objetos en status/code/flags o metadatos de revisión.
- Corrección: status se limita al conjunto público documentado; code solo se conserva si es string; los campos triestado solo aceptan boolean o UNKNOWN; storeRevision solo acepta entero seguro no negativo. redispatchAuthorized queda forzado a false en el contrato público actual.
- Regresión: valores mal formados no pasan a la respuesta pública; UNKNOWN válido se conserva y no se filtran valores privados.
- SHA código/pruebas: 42f0e12640a35bc1e7b524501f8dbe879a311d90. CI SUCCESS: Chronicle [39187949155](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187949155), admisión/reinicio [39187949154](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187949154), STEP 4 [39187949143](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187949143), STEP 5 [39187949152](https://github.com/snowdenxrp/aldea-ia/actions/runs/39187949152).
- El cambio solo valida la forma de la respuesta. No prueba fsync/power-loss, no autoriza reintentos ni despacho, no añade otra acción mutante. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## M0 — completion Chronicle exige settlement completo (2026-10-19)

- Hallazgo: `recordOutcome()` podía tratar como settlement suficiente una entrada `settled_observed` con status/source/revision válidos pero sin `evidence` o `observedAt`. La validación estructural general no impone esos dos campos a cada settlement histórico.
- Corrección en `src/nexo/core/continuity-owner.mjs`: la condición `chronicleSettlementReady` ahora exige propiedad `evidence` y timestamp ISO válido/canónico, alineándose con el contrato de replay.
- Regresión en `tests/nexo/repair-settlement-crash-cuts.test.mjs`: una entrada incompleta debe devolver `blocked / NEXO_CHRONICLE_SETTLEMENT_REQUIRED`, dejar `storeRevision=0` y no añadir attempt.
- SHA código: `f3a54153d3574f559aa32f1c56d093e1152b4842`. SHA código + prueba corregida: `b21896e893a1b739bbfa511f76c3a215298a73e6`.
- CI SUCCESS en el SHA final: [repair crash cuts 39192937988](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192937988), [effect/settlement 39192937997](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192937997), [STEP 4 39192938031](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192938031), [STEP 5 39192937987](https://github.com/snowdenxrp/aldea-ia/actions/runs/39192937987).
- El alcance se limita a integridad del settlement y aceptación de completion. No demuestra goal verifier general, causalidad externa, durabilidad ante pérdida de energía ni autoridad legítima. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## M0 — auditoría de consistencia misión/pasos/objetivo (2026-10-19)

- Se inspeccionaron `missionRecord()`, `reconstructNexoMissionFromSnapshot()`, `recordPrepared()`, `executeNexoStepWithContinuityOwnerInternal()` y las regresiones de admisión/reconstrucción.
- Resultado: **sin contradicción adicional demostrada**. El runtime exige tanto el `mission.status` almacenado como la misión/paso reconstruidos en `planned`; las dependencias deben reconstruirse como `completed`. Un `completed` en el plan sin outcome canónico queda bloqueado. `objective` no funciona como autorización de ejecución y se recalcula durante la reconstrucción normal.
- No se modificó código ni se añadieron invariantes especulativos. Comparación GitHub: `d4544e74e8568cf7d5221ccbc42e48daacd1e9f5...ncs-clean-architecture` contiene sólo tres commits documentales; el código validado no cambió en esa comparación.
- Frontera siguiente: aclarar el contrato de observación/verificación de objetivos sin conectar efectos de reparación al runtime. `scripts/nexo-repair-settlement.mjs` lee un snapshot mediante `loadStateStrict()` y `src/nexo/adapters/persisted-repair-observation.mjs` sólo prueba invariantes observables; ambos describen explícitamente que no prueban causalidad ni atomicidad entre el archivo de estado y la continuidad de Nexo. Mantener esa ruta diagnóstica separada; no habilitar reparaciones ni mezclar memoria/simulación de Lúmina con Nexo.
- **M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.**


## M0 — lock incompleto: propuesta retirada por riesgo TOCTOU (2026-10-19)

- Se investigó el caso mkdir(<store>.lock) exitoso seguido de fallo al escribir owner.json. El estado resultante puede dejar un lock sin owner y provocar bloqueo/recovery manual posterior.
- La primera solución propuesta intentó borrar el directorio por ruta en el catch. Revisión adicional detectó una carrera TOCTOU: otro proceso podría eliminar/reemplazar esa ruta antes del rm; la limpieza podría borrar un lock nuevo que no pertenece a la llamada fallida.
- Por tanto, la propuesta NO se integra. PR #106 fue cerrado sin merge: https://github.com/snowdenxrp/aldea-ia/pull/106. La rama de la propuesta revirtió cambios de producción y tests a su contenido de base antes de cerrar. No declarar el problema resuelto.
- Decisión actual: conservar comportamiento fail-closed y no limpiar por ruta sin una garantía de identidad/propiedad segura. Rediseñar el protocolo de adquisición/recuperación como trabajo separado si se demuestra que se puede hacer sin una carrera de reemplazo; no añadir stat seguido de rm como supuesto arreglo porque también es TOCTOU.
- No hay nuevo CI de pruebas Node que certifique este caso. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


### Diseño abierto — recuperación de locks locales
Consultar `NEXO_NCS/BUILD/NCS_M0_LOCK_RECOVERY_DESIGN_NOTE_2026-10-19.md`. PR #106 se retiró sin merge al detectarse TOCTOU en la limpieza por ruta. Estado actual: fail-closed; no añadir stat-then-rm ni recuperación por antigüedad como parche. No hay fix integrado ni CI nuevo para este caso.


### Frontera observación/verificación de objetivo — auditoría read-only (2026-10-19)
Nota: `NEXO_NCS/BUILD/NCS_M0_GOAL_VERIFICATION_BOUNDARY_2026-10-19.md`. Se inspeccionaron `scripts/nexo-repair-settlement.mjs`, `src/nexo/adapters/persisted-repair-observation.mjs` y los loaders/persistencia de `scripts/simulate.mjs`. La evidencia solo permite registrar condición observada y revisión; no prueba causalidad, ejecución única ni atomicidad con continuidad. No se conectó un verifier ni se cambió runtime. Mantener observador diagnóstico, STOP y separación Nexo/Lúmina.


### Frontera de despacho auditada — solo Chronicle permanece habilitado (2026-10-19)
Nota: `NEXO_NCS/BUILD/NCS_M0_DISPATCH_BOUNDARY_AUDIT_2026-10-19.md`. Revisión estática de `owner-backed-runtime.mjs`: reparaciones y acciones distintas de `chronicle_append` se bloquean antes de dispatch; PREPARED, lineage, reconciliación y outcome permanecen separados; la API pública aplica allowlist y nunca autoriza redispatch. No hubo cambios de runtime ni tests nuevos. Próxima auditoría: inventario de entrypoints CLI/legacy y evidencia de cuáles son accesibles por defecto, sin cutover ni cambio de `index.html`.


### Entry points — auditoría parcial (2026-10-19)
Nota: `NEXO_NCS/BUILD/NCS_M0_ENTRYPOINT_ISOLATION_AUDIT_2026-10-19.md`. `npm run nexo` dirige a un CLI estrecho (status, mission-status, chronicle-append); `index.html` arranca Lúmina y `src/main-stable.js` no muestra conexión directa a la API Nexo. Sin embargo, `src/nexo/runtime.js` conserva un runtime legacy que importa memoria antigua y adaptador de simulación; no declarar aislamiento total hasta inventariar todos sus importadores. No hubo cambios de runtime/UI/CI.


### Corrección de cobertura del puente legacy (2026-10-19)
La nota anterior de brecha fue demasiado amplia: aunque `tests/nexo/entrypoint.test.mjs` no invoca la bandera, `tests/nexo/assistants-runtime-cli.test.mjs` sí ejecuta el entrypoint real en procesos hijos con estado temporal. Cubre modo normal sin dispatch, modo `--nexo-repair-once` con una única reparación liquidada y replay tras reabrir el owner sin nueva escritura/obligación. El workflow `.github/workflows/nexo-m0-repair-crash-cuts.yml` ejecuta este test. No añadir duplicados. Consultar run y SHA exactos antes de afirmar PASS actual. La cobertura no demuestra aislamiento global ni autoridad constitucional. Sin cambios de runtime; M0 INCOMPLETO, efectos protegidos STOP.


### Migración inicial legacy — frontera confirmada (2026-10-19)
La auditoría de entrypoints confirma que `src/nexo/core/continuity-service.mjs` solo proyecta `legacyMemory` cuando la tienda Nexo separada no existe; una tienda presente permanece canónica y no se mezcla con la copia legacy. `scripts/assistants.mjs` puede alimentar esa migración inicial desde el estado de simulación. No es doble escritura posterior, pero sí un puente de arranque legacy. No retirarlo sin política y pruebas para migración, bootstrap vacío demostrado y tienda ausente con historia desconocida. Sin cambios de runtime ni pruebas nuevas.


## M0 — criterios de aceptación ejecutables (2026-10-19)

Se añadió `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_EXECUTABLE_2026-10-19.md` para convertir los contratos existentes en seis criterios medibles: consulta canónica de solo lectura; admisión persistible; gate fail-closed; journal/replay sin duplicación; recuperación/crash cuts; entrypoints Nexo estrechos y separados de Lúmina/legacy.

**No es un PASS global.** La consulta de misión ya informa estado persistido y reconstruido desde un único snapshot, pero la ejecución CI posterior a la corrección de integración `82f1204ae4e9298163231ab7a323233ad87777b8` no está observada aquí. M0-AC1 permanece UNKNOWN. Los PASS históricos siguen limitados a sus SHAs originales. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.

Siguiente paso: recuperar el run real del workflow `.github/workflows/nexo-m0-mission-status.yml` para un SHA que incluya la corrección y test actuales; después crear la matriz de evidencia AC1–AC6 sin repetir auditorías cerradas.


## M0 — CI observado para mission-status (2026-10-19)

Se recuperó la ejecución real del workflow específico y se revisaron jobs, steps y logs:
- **FAIL inicial:** [run 39264987091](https://github.com/snowdenxrp/aldea-ia/actions/runs/39264987091), SHA `4b6423404d5ad2e901e3b3eccb5db6e2140ee492`. El test falló en `tests/nexo/entrypoint.test.mjs:185`: la consulta devolvió `NEXO_MISSION_RECONSTRUCTION_UNAVAILABLE`.
- **Corrección:** `82f1204ae4e9298163231ab7a323233ad87777b8`; el reconstructor retorna misión o null, no un wrapper.
- **PASS focal:** [run 39265121361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39265121361), SHA exacto `82f1204ae4e9298163231ab7a323233ad87777b8`; job `mission-status` SUCCESS, paso `Run independent Nexo entrypoint regression` SUCCESS. Log final confirma que el entrypoint independiente falla cerrado en comandos no soportados y que Chronicle no depende de Lúmina ni filtra contenido.

Por tanto, M0-AC1 pasa **para la regresión focal en ese SHA**, no como cierre global de M0. Se conserva el fallo inicial como parte de la evidencia red-green. El estado global sigue M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## M0 — matriz inicial AC1–AC6 y cobertura del workflow Chronicle (2026-10-19)

El workflow Chronicle había fallado en SHA `d1396cd110a01a9547209b58626a52cbc7b6bd97` porque ejecutaba `tests/nexo/entrypoint.test.mjs`, que exponía el mismo error de integración del query. Se corrigió el consumidor en `82f1204...` y el workflow dedicado pasó. Después se actualizó `.github/workflows/nexo-m0-chronicle.yml` para incluir los paths `src/nexo/application/continuity-queries.mjs` y `src/nexo/application/index.mjs`, evitando que futuros cambios en la consulta pública omitan la regresión de integración.

- [Run Chronicle SUCCESS 39291153543](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291153543), SHA exacto `7f83195657df829d993226cf909c8f76f655d23b`: store, runtime y entrypoint todos SUCCESS.
- AC1, AC4 y AC6 tienen PASS focal en ese SHA.
- AC2/AC3 tienen PASS histórico en los SHA/runs documentados en la matriz del documento de criterios.
- AC5 tiene PASS histórico en crash cuts; falta ejecutar crash cuts en un SHA de cierre común.

La matriz completa y sus límites están en `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_EXECUTABLE_2026-10-19.md`. No cerrar M0 ni habilitar efectos protegidos. 


## M0 — gate integrado de aceptación PASS (2026-10-19)

**Ejecución verificada:** [run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), SHA exacto `c57be8aa6fd7e558d870c3e46feab741637b4314`, workflow `.github/workflows/nexo-m0-acceptance.yml`. El job concluyó SUCCESS; los cinco grupos pasaron: admisión/store, reconstrucción/transición protegida, Chronicle/entrypoints, crash cuts/recuperación de propietario y goal verification/outcome classification.

Esto confirma la suite integrada de regresión AC1–AC6 sobre un mismo SHA. No equivale a demostrar la legitimidad de la raíz de autoridad, durabilidad ante pérdida física de energía, resistencia global a rollback/tampering ni a autorizar efectos protegidos. El cambio desde ese SHA hasta los commits documentales posteriores no alteró código de producción ni tests.

**Estado:** gate de regresión M0 PASS en `c57be8aa...`; misión M0 global todavía INCOMPLETA por bloqueos arquitectónicos de seguridad no resueltos. Efectos protegidos STOP; Nexo/Lúmina separados.


## M0 — brecha de admisión de autoridad confirmada por inspección (2026-10-19)

Nuevo análisis: `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_ADMISSION_GAP_2026-10-19.md`.

El gate integrado de regresión pasa, pero el código de runtime/owner **no evalúa autoridad del propietario**: `createNexoContinuityOwner()` recibe store + verifiers, no una raíz/principal/decisión de autorización; el runtime verifica capacidades y readiness, pero no autoridad antes de PREPARED/dispatch. Los resultados que exponen `authorization: "NOT_EVALUATED"` son evidencia directa de esa limitación. La vertical `chronicle-append` es un prototipo local de persistencia/replay, no una ruta demostrada de efecto protegido owner-authorized.

Decisión: no inventar un pseudo-root ni añadir una función que convierta input del caller en autoridad. No conectar acciones externas, financieras, irreversibles, reparación externa ni cambios constitucionales a esta ruta. Reutilizar investigación existente de `docs/nexo/` sobre raíz independiente, autorización efectiva, revocación y STOP; no repetir auditorías históricas. M0 sigue INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## M0 — revalidación de continuidad y límite de CI (2026-10-19)

- Relectura directa en GitHub de `NEXO_NCS/STATUS.md`, del handoff `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEW_CHAT_2026-10-19.md`, del workflow `.github/workflows/nexo-m0-mission-status.yml`, de `src/nexo/application/continuity-queries.mjs`, de `tests/nexo/entrypoint.test.mjs`, de la matriz AC1–AC6 y del documento de brecha de autoridad.
- **PASS focal observado:** [run 39265121361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39265121361), job `mission-status`, step `Run independent Nexo entrypoint regression` SUCCESS, SHA probado `82f1204ae4e9298163231ab7a323233ad87777b8`. El commit correctivo `82f1204...` adapta la consulta al contrato real de `reconstructNexoMissionFromSnapshot()` (misión directa o `null`).
- **FAIL histórico conservado:** [run 39264987091](https://github.com/snowdenxrp/aldea-ia/actions/runs/39264987091) falló en la misma regresión antes de la corrección. No borrar esta evidencia red-green.
- La versión inspeccionada de `continuity-queries.mjs` hace una sola lectura canónica y expone `persistedMissionStatus`, `missionStatus` y `statusDiscrepancy`. La regresión visible incluye misión persistida `completed` con paso `planned`, payload centinela, igualdad byte-por-byte del store y ausencia de fuga a stdout.
- **Límite de verificación:** la integración GitHub disponible confirmó el run focal y sus pasos, pero no permitió enumerar la lista viva de ejecuciones del workflow ni establecer el HEAD SHA actual de la rama. Por tanto, no afirmar que ese run cubre cualquier cambio posterior de la rama. La validación del contenido exacto actualmente servido para cada archivo queda pendiente de enlazar a un SHA de ejecución observado.
- El workflow tiene disparador `push` para los paths de query, operaciones/store, regresión y workflow, además de `workflow_dispatch`. No se modificó código ni se forzó un commit artificial para provocar CI.
- La decisión de raíz única/un dispositivo sigue siendo de alcance, no implementación. La brecha de autoridad documentada permanece: runtime no evalúa raíz/principal/decisión de autorización; `authorization: "NOT_EVALUATED"`; efectos protegidos STOP.
- **Siguiente paso exacto:** obtener un run de `nexo-m0-mission-status.yml` cuyo SHA incluya la versión actual de query + test; verificar job, paso, logs y SHA. Si PASS, fijar ese SHA en la matriz AC1–AC6. Si FAIL, corregir únicamente la causa observada. Después continuar el siguiente defecto M0 reproducible, sin repetir las auditorías ya cerradas.

**Estado conservador:** M0 INCOMPLETO; AC1 PASS focal en `82f1204...` únicamente; cobertura de la versión actual respecto de un SHA vivo = UNKNOWN; autoridad NOT_EVALUATED; efectos protegidos STOP.


## M0 — límite de revisión segura del store de continuidad (2026-10-19)

- **Defecto encontrado por inspección:** `commitIfCurrent()` incrementaba `storeRevision` sin comprobar el límite del contrato `Number.isSafeInteger`. En `Number.MAX_SAFE_INTEGER`, el store podía escribir `9007199254740992` y devolver `committed`, dejando un envelope que `loadCurrent()` rechazaría después. Esto violaba la coherencia de persistencia y la semántica de resultado.
- **Corrección:** `src/nexo/core/continuity-store.mjs`, commit [3bc4717](https://github.com/snowdenxrp/aldea-ia/commit/3bc47179f17e63a2e64c0951859e29aee7374d73). Al alcanzar el máximo, el commit se rechaza con `NEXO_CONTINUITY_STORE_REVISION_EXHAUSTED` antes de escribir.
- **Regresión añadida:** `tests/nexo/continuity-store.test.mjs`, commit [7c0756c](https://github.com/snowdenxrp/aldea-ia/commit/7c0756c9455fb1f6e2cc1bbbfe7d66bbb7305e57); se corrigió el fixture de newline en [65aba88](https://github.com/snowdenxrp/aldea-ia/commit/65aba88427c8059c051c5b477346b0f4fe03f527). La prueba exige rechazo fail-closed, bytes canónicos idénticos y lectura posterior válida.
- **Validación:** código y prueba están en `ncs-clean-architecture`. No se pudo obtener por las herramientas disponibles un run de Actions asociado a estos commits ni ejecutar la prueba localmente en este entorno. **Resultado de CI: PENDING; no declarar PASS todavía.**
- **Alcance:** esta protección cubre el store de continuidad. El límite equivalente de Chronicle no se cambia en este paso sin una revisión y prueba separadas. No afecta la decisión de raíz de autoridad; `authorization: NOT_EVALUATED` y efectos protegidos STOP permanecen.


## M0 — Chronicle no puede avanzar más allá de la revisión segura (2026-10-19)

- **Defecto reproducido por inspección del código:** `createNexoChronicleStore().append()` construía `storeRevision + 1` sin proteger `Number.MAX_SAFE_INTEGER`. En el límite, podía persistir una revisión no segura y devolver `committed`, aunque la validación de la siguiente lectura rechazaría el documento.
- **Corrección:** `src/nexo/core/chronicle-store.mjs`, commit [0802c6b8551a](https://github.com/snowdenxrp/aldea-ia/commit/0802c6b8551acca61c34efb71060fe56f8fa8e9a). En el límite, `append()` devuelve `blocked / NEXO_CHRONICLE_REVISION_EXHAUSTED` antes de escribir.
- **Regresión:** `tests/nexo/chronicle-store.test.mjs`, commit [4c51b7ff3638](https://github.com/snowdenxrp/aldea-ia/commit/4c51b7ff3638dfdad03941d620f6e87a138e744a). Verifica resultado exacto, bytes persistidos sin cambios y lectura posterior válida al máximo seguro.
- **Validación:** el cambio está en la rama `ncs-clean-architecture`; no se ha ejecutado localmente en este entorno ni se ha observado un run de CI para estos SHA. **CI PENDING; no declarar PASS.**
- **Límite:** esta corrección sólo protege la revisión de Chronicle. No implica autoridad constitucional ni habilita efectos protegidos. `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.


## M0 — Chronicle no declara éxito por una entrada coincidente aislada (2026-10-19)

- **Defecto de semántica de recuperación:** tras un error de escritura, `append()` buscaba sólo una entrada con el mismo `operationKey/content` y podía devolver `committed` aunque la revisión observada y el resto de las entradas no coincidieran con el candidato que intentó escribir.
- **Corrección:** `src/nexo/core/chronicle-store.mjs`, commit [a119006a8972](https://github.com/snowdenxrp/aldea-ia/commit/a119006a89724f4b8ab31c1827d08baa0875b064). La recuperación sólo devuelve `committed` si la revisión y la lista completa de entradas observadas coinciden exactamente con el candidato. Un estado distinto no demostrado queda como `unknown`; el conflicto de contenido sigue siendo `conflict`.
- **Regresión:** `tests/nexo/chronicle-store.test.mjs`, commit [3a29ac361b54](https://github.com/snowdenxrp/aldea-ia/commit/3a29ac361b54d92d8dcbc965149c2c093c8ef43a). Simula una mutación competidora después del rename: la entrada solicitada permanece presente, pero el documento ya no coincide con el candidato; el resultado debe ser `unknown`, no éxito.
- **Validación:** los commits y archivos se publicaron en `ncs-clean-architecture`; no se ha ejecutado localmente ni se ha observado CI asociado a estos SHA. **CI PENDING.**
- **Alcance:** endurece la clasificación de resultados ambiguos; no establece causalidad externa ni autorización del propietario. `authorization: NOT_EVALUATED`; efectos protegidos STOP; M0 INCOMPLETO.


- **Corrección del fixture de regresión:** el archivo de prueba se releyó tras publicarse y se detectó que el JSON simulado terminaba con los caracteres literales `\\n`, no con un salto de línea. Se corrigió a un salto de línea real en el commit [f888a1005f38](https://github.com/snowdenxrp/aldea-ia/commit/f888a1005f389e3aeaae8872bd9258b5cdc5fcdd). La prueba sigue pendiente de ejecución/CI; no atribuirle PASS.


## M0 — continuidad reconcilia el resultado ambiguo de initialize (2026-10-19)

- **Defecto:** `createNexoContinuityStore().initialize()` devolvía siempre `failed` ante cualquier error de escritura, incluso si el rename ya había publicado el envelope exacto. Eso confundía un error de respuesta con una escritura no aplicada; un reintento podía encontrar un store existente pese al resultado `failed`.
- **Corrección:** `src/nexo/core/continuity-store.mjs`, commit [6871be62fa1b](https://github.com/snowdenxrp/aldea-ia/commit/6871be62fa1b84a1f6396532e8630bc35b6682f7). Después de un error, lee el envelope: devuelve `committed` sólo si revisión y snapshot coinciden exactamente; `failed` sólo si confirma que el destino sigue ausente; otros estados permanecen `unknown`.
- **Regresiones:** `tests/nexo/continuity-store.test.mjs`, commit [f657137de4c2](https://github.com/snowdenxrp/aldea-ia/commit/f657137de4c2c6d3f8e8df99568a0b0dff646a42). Cubre respuesta perdida después del rename y fallo antes de persistir, verificando el estado durable observado.
- **Validación:** código y pruebas publicados en `ncs-clean-architecture`; no ejecutados localmente y CI aún no observado para estos SHA. **PENDING; no marcar PASS.**
- **Límite:** corrige semántica de resultado de inicialización local. No demuestra autorización ni durabilidad ante pérdida de energía; efectos protegidos STOP, autoridad NOT_EVALUATED, M0 INCOMPLETO.


## M0 — no dejar locks incompletos si falla el registro del propietario (2026-10-19)

- **Defecto compartido:** ambos `acquireLock()` creaban el directorio `.lock` y escribían `owner.json` dentro del mismo `try`. Si falla la escritura del propietario después de crear el directorio, la función propagaba el error pero dejaba el directorio incompleto; llamadas posteriores podían quedar esperando hasta exigir recuperación manual.
- **Corrección en continuidad:** [b1c3e144e566](https://github.com/snowdenxrp/aldea-ia/commit/b1c3e144e5665b10ef9e78425422f8db33bc2c08). Si falla la creación de `owner.json`, limpia el directorio que esta misma llamada acaba de crear antes de propagar el error.
- **Regresión continuidad:** [d840d0808812](https://github.com/snowdenxrp/aldea-ia/commit/d840d0808812bef77e3ad904617ed181f550a154); fuerza el fallo y comprueba que no quede `.lock`.
- **Corrección en Chronicle:** [1af58e9f24f6](https://github.com/snowdenxrp/aldea-ia/commit/1af58e9f24f6effe6ca19e5db4550183ae2eccb1), mismo alcance y condición de propiedad del directorio.
- **Regresión Chronicle:** [c657021413df](https://github.com/snowdenxrp/aldea-ia/commit/c657021413df7dc895d06393d1cb5d045d8683ab); fuerza el fallo y comprueba la limpieza.
- **Validación:** cambios y pruebas están publicados en `ncs-clean-architecture`; no se ejecutaron localmente y no hay resultado CI observado para estos SHA. **PENDING; no declarar PASS.**
- **Límite:** la limpieza sólo se intenta en la rama de ejecución que creó el directorio y cuyo registro de propietario falló. No se habilita recuperación automática de locks ajenos o stale. M0 INCOMPLETO; autoridad NOT_EVALUATED; efectos protegidos STOP.


## M0 — arranque coordinado de Continuidad y Chronicle no es atómico (2026-10-19)

- **Brecha confirmada por inspección del flujo:** `runNexoChronicleAppend()` hace preflight de ambos almacenes, pero después llama a `openNexoContinuityOwner()` (que puede crear Continuidad) antes de llamar a `chronicleStore.initialize()`. Si Continuidad se inicializa y Chronicle falla durante su inicialización, la operación devuelve `blocked` con Continuidad ya creada. La prevalidación evita algunos fallos conocidos antes de escribir, pero no hace atómica la inicialización de dos archivos.
- **No se aplica rollback automático:** eliminar el primer archivo como compensación podría borrar estado válido o competir con otro proceso. Tampoco se inventa un tercer coordinador, diario de bootstrap o protocolo transaccional sin decisión arquitectónica explícita.
- **Clasificación:** brecha de arquitectura/contrato, no PASS ni defecto cerrado. Antes de cambiar código, definir qué significa bootstrap coordinado, qué estado observable debe quedar tras fallo parcial y qué componente tiene autoridad para inicializar ambos almacenes.
- **Evidencia de código:** `src/nexo/application/chronicle-append.mjs` preflighta ambos archivos; después abre/posiblemente inicializa Continuidad y luego inicializa Chronicle. `src/nexo/core/continuity-service.mjs` realiza la inicialización vacía cuando `allowEmptyInitialization === true`.
- **Validación:** hallazgo por inspección del código publicado; no se ha ejecutado una prueba de fallo inducido ni CI para una regresión de este caso. **PENDING**.
- **Estado global:** M0 INCOMPLETO; autoridad NOT_EVALUATED; efectos protegidos STOP.


## M0 — regresión de recuperación tras bootstrap parcial de dos almacenes (2026-10-19)

- **Contrato comprobable añadido:** [`tests/nexo/entrypoint.test.mjs`](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/entrypoint.test.mjs), commit [a8c2b422b34d](https://github.com/snowdenxrp/aldea-ia/commit/a8c2b422b34d169a22877435966ce0b8b86d726a).
- **Escenario:** Continuidad puede inicializarse y Chronicle fallar porque su directorio padre no existe. La primera invocación debe terminar `blocked`, sin dispatch ni admisión de misión; el archivo de Continuidad queda en revisión 0 con misión/journal vacíos.
- **Recuperación:** al reintentar con el mismo archivo de Continuidad y una ruta válida de Chronicle, la operación debe completarse y dejar una única misión, un settlement y una entrada Chronicle.
- **Interpretación:** no declara atómica la inicialización de dos archivos. Define y prueba recuperación idempotente de este corte concreto, sin rollback destructivo. Otros cortes siguen requiriendo sus propias pruebas.
- **Validación:** regresión publicada, no ejecutada localmente; CI no observado para este SHA. **PENDING; no PASS.**
- **Estado:** M0 INCOMPLETO; autoridad NOT_EVALUATED; efectos protegidos STOP.


### Precisión adicional de la regresión de bootstrap parcial

- Commit: [150eac0209a3fa40c4ba9a37f790a3fffaa612ec](https://github.com/snowdenxrp/aldea-ia/commit/150eac0209a3fa40c4ba9a37f790a3fffaa612ec).
- La regresión ahora exige el código exacto `NEXO_CHRONICLE_INITIALIZE_OUTCOME_UNKNOWN` además de `blocked`, sin dispatch, sin redispatch y sin misión admitida. Esto evita que un fallo distinto o una clasificación demasiado genérica satisfaga accidentalmente el test.
- La comprobación está publicada y el archivo fue releído. **Ejecución/CI de este SHA: PENDING**; no se declara PASS.


## M0 — normalización de fallo al adquirir lock de Chronicle (2026-10-19)

- **Causa raíz encontrada al endurecer la prueba de bootstrap parcial:** cuando la ruta del directorio padre de Chronicle no existe, `acquireLock()` falla antes de entrar en el bloque protegido de `initialize()`. El error de sistema `ENOENT` se propagaba hasta el resultado público. La inicialización no había escrito Chronicle, pero el contrato de aplicación exponía un código OS genérico.
- **Corrección:** [`chronicle-store.mjs`](https://github.com/snowdenxrp/aldea-ia/commit/792c2f4f5252071cb1ae8a033efaa1556e7588e6) normaliza `ENOENT` como `NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE` y clasifica otros fallos de adquisición de lock como bloqueados, conservando códigos explícitos de recuperación cuando existan.
- **Regresión:** [`entrypoint.test.mjs`](https://github.com/snowdenxrp/aldea-ia/commit/cab6b2e2f030a99db153f289874cda3420856e11) ahora exige el código estructurado exacto, además de ausencia de dispatch/admisión y recuperación por reintento.
- **Límite:** esto no elimina la inicialización parcial de dos archivos; hace explícito y testeable el fallo de adquisición de lock. No se ha observado ejecución local ni CI para estos commits. **PENDING; no PASS.**
- **Estado global:** M0 INCOMPLETO; autoridad NOT_EVALUATED; efectos protegidos STOP.


### Corrección simétrica en la inicialización de Continuidad

- **Misma causa raíz:** `createNexoContinuityStore().initialize()` también adquiría el lock antes de su bloque protegido; un directorio padre inexistente podía propagar `ENOENT` crudo.
- **Fix de producción:** [commit `a31ff7b0`](https://github.com/snowdenxrp/aldea-ia/commit/a31ff7b0b186ca49b42425057b0433de7df88456) devuelve el fallo estructurado `NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE` cuando no se puede adquirir el lock por ausencia del padre, y conserva códigos explícitos para otros fallos.
- **Regresión de store:** [commit `a81560da`](https://github.com/snowdenxrp/aldea-ia/commit/a81560daad363cc802afa43a58f421b1a25d93d7) exige el resultado exacto sin depender del código OS.
- **Estado de validación:** los archivos están publicados; ejecución local y CI siguen **PENDING**. No se declara PASS.
- **M0:** INCOMPLETO; autoridad NOT_EVALUATED; efectos protegidos STOP.


## M0 — normalización de rutas padre no disponibles en ambos almacenes (2026-10-19)

- **Continuidad:** `commitIfCurrent()` captura `ENOENT` y `ENOTDIR` al adquirir el lock y devuelve `failed / NEXO_CONTINUITY_STORE_PARENT_PATH_UNAVAILABLE` antes de modificar el snapshot. Código: [23d9567c90a2](https://github.com/snowdenxrp/aldea-ia/commit/23d9567c90a2997353ae54d6ba6bbd79c8f663a9); regresión: [857e6f2951eb](https://github.com/snowdenxrp/aldea-ia/commit/857e6f2951eb524bbbb687ba2c22e2db4642cf43).
- **Chronicle:** `append()` captura `ENOENT` y `ENOTDIR` al adquirir el lock y devuelve `blocked / NEXO_CHRONICLE_PARENT_PATH_UNAVAILABLE` antes de escribir. Código: [c13c56e7aff0](https://github.com/snowdenxrp/aldea-ia/commit/c13c56e7aff03fe4ec2b9f5fe4a585473e1822cb); regresión: [26a6ec60f8bd](https://github.com/snowdenxrp/aldea-ia/commit/26a6ec60f8bdf1201d3a9c90ae45732931f08b96).
- **Verificación documental:** los cuatro archivos de código/prueba se releyeron desde la rama y contienen las guardas y aserciones esperadas. El estado se actualiza aquí; commit de estado anterior al cambio: blob `b0dd24f7fb0463c59eac1ace927587075fb9eb2d`.
- **Límite:** errores de lock distintos de `ENOENT` conservan el comportamiento previo. No se ha obtenido ejecución local ni resultado de CI asociado a estos SHA; **pruebas/CI PENDING, no PASS**.
- **Estado global:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP. La inicialización coordinada de ambos archivos sigue sin ser atómica y no se añade rollback compensatorio.


### Extensión: ruta padre que existe como archivo (ENOTDIR)

- **Defecto:** los almacenes normalizaban la ausencia del directorio padre (`ENOENT`), pero una ruta padre existente como archivo producía `ENOTDIR`. En operaciones mutables podía escapar como excepción de sistema; en inicialización podía exponerse el código del sistema en vez del contrato de ruta no disponible.
- **Corrección:** `initialize()`, `append()` y `commitIfCurrent()` de Chronicle/Continuidad ahora clasifican tanto `ENOENT` como `ENOTDIR` como `*_PARENT_PATH_UNAVAILABLE`, sin cambiar la recuperación explícita de locks stale ni convertir esos errores en autorización de reintento.
- **Regresiones publicadas:** Chronicle [`686a5ef8c956`](https://github.com/snowdenxrp/aldea-ia/commit/686a5ef8c95695f1d874e0c604b7f8ecc8ac84aa) y Continuidad [`2b82f0c53740`](https://github.com/snowdenxrp/aldea-ia/commit/2b82f0c53740d58bc6cd8d3e22b3be73bb86d8e2); cubren inicialización y mutación con un archivo ocupando el lugar del directorio padre.
- **Implementación:** Chronicle [`a8cc1e0a932e`](https://github.com/snowdenxrp/aldea-ia/commit/a8cc1e0a932e3d362ea0ec2ac120db74fa9b1a63); Continuidad [`b97b72d20e76`](https://github.com/snowdenxrp/aldea-ia/commit/b97b72d20e762a1ac9d14335120bbe67b72981ba).
- **Validación:** archivos actualizados; pruebas locales y CI no ejecutadas/observadas en esta sesión. **PENDING; no PASS.**
- **Estado global:** M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP.


## M0 — handoff continuidad outcome/reconstruction (2026-10-20)

- Handoff detallado para el siguiente chat: [NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_OUTCOME_RECONSTRUCTION.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_OUTCOME_RECONSTRUCTION.md).
- Esta sesión revisó la reconstrucción de outcomes terminales y las regresiones existentes. Se confirmó cobertura ya presente para mismatch de action/target, evidencia no verificada, completion de acciones mutables sin goal verifier, excepción no mutante `local_analysis`, replay contradictorio y efectos PREPARED/observados sin resolver.
- No se encontró una nueva discrepancia reproducible en esta pasada. **No hubo cambio de código ni nueva ejecución de CI** en esta auditoría final; no atribuir PASS nuevo a esta sesión.
- Siguiente frontera: revisar consistencia entre persistencia/commit, respuesta perdida o ambigua, replay de misma revisión y proyección reconstruida; reutilizar pruebas existentes y cambiar código solo con regresión reproducible.
- Estado global sin cambio: M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.


## M0 — response-loss / outcome-reconstruction audit (2026-10-20)

- Audit note: [NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md](BUILD/NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md).
- Reused existing store tests for lost rename response, confirmed write failure, and UNKNOWN when canonical reread fails; reused repair-settlement crash-cut proof for a committed observation whose response is lost; reviewed owner outcome replay and canonical Chronicle restart handling.
- Result: no new reproducible defect; no code/test changes and no new CI run in this pass. Stale expected revision remains a CAS conflict; recovery is canonical reload/reconstruction, not inferred success.
- Next narrow frontier: audit actual call sites and public-result boundary for owner-backed runtime versus legacy `src/assistants/memory.js`. Do not cut over runtime or enable repair effects without concrete call-site evidence and crash-cut coverage.
- State unchanged: M0 INCOMPLETO; authorization NOT_EVALUATED; protected effects STOP; legitimate root PENDING/UNKNOWN.


## M0 — public mission-admission persistence receipt corrected (2026-10-20)

- **Reproducible contract gap:** conditional commit may be durably committed while lock release fails; store reports `status: failed, persistenceStatus: committed`. The Chronicle admission boundary previously collapsed this to generic blocked and lost the confirmed `missionAdmissionCommitted` fact.
- **Correction:** `src/nexo/application/chronicle-append.mjs` now preserves known commit as `status: blocked, missionAdmissionCommitted: true`, with dispatch false; unknown persistence remains `status: unknown, missionAdmissionCommitted: UNKNOWN`. It never converts the lock handoff failure into permission to continue.
- Regression: `tests/nexo/chronicle-runtime.test.mjs`; exact final code/test SHA `52eb4f9bdb959c577c6532ab30f1294f542ef4db`.
- **CI SUCCESS on the exact same SHA:** integrated M0 acceptance [39368731996](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368731996); Chronicle native [39368732138](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368732138); deterministic persistence [39368732251](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368732251); mission admission/restart continuity [39368731963](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368731963); STEP 4 [39368731975](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368731975); STEP 5 [39368732135](https://github.com/snowdenxrp/aldea-ia/actions/runs/39368732135). All six workflows completed SUCCESS.
- Audit record: [NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md](BUILD/NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md).
- Remaining boundary: M0 is incomplete; this fixes public result truthfulness only, not owner authority or general runtime migration.


## M0 — persistence receipts preserved across runtime stages (2026-10-20)

- Extended the mission-admission result fix to PREPARED, execution lineage, Chronicle observation/settlement, and terminal outcome. Known `persistenceStatus: committed` is no longer flattened into a false persistence flag; unknown commit/exception outcomes remain `UNKNOWN`. Unsafe lock handoff still blocks progression and never authorizes dispatch.
- Owner changes: `src/nexo/core/continuity-owner.mjs`; runtime changes: `src/nexo/core/owner-backed-runtime.mjs`; application change: `src/nexo/application/chronicle-append.mjs`.
- Regression paths: `tests/nexo/chronicle-runtime.test.mjs`, `tests/nexo/repair-settlement-crash-cuts.test.mjs`.
- Red/green preserved: intermediate SHAs `3aed78b9788c9ffe25bc0077b02793a1ca6f75c0` and `0bf505d483cd56345fe7a7c9240545c86616bc2d` failed because a prior test expected false where a thrown commit response must remain UNKNOWN. Test corrected; final code/test SHA `5aef07d4fb933d8c0be4ee4cbc325e7e8c4f85a7` has all six focal workflows SUCCESS: M0 integrated `39369199068`; repair crash cuts `39369199071`; effect/settlement `39369199064`; deterministic persistence `39369199083`; STEP 4 `39369199069`; STEP 5 `39369199073`.
- Full audit: [NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md](BUILD/NCS_M0_RESPONSE_LOSS_OUTCOME_RECONSTRUCTION_AUDIT_2026-10-20.md).
- Scope remains limited: result-contract truthfulness only; M0 INCOMPLETO, authorization NOT_EVALUATED, protected effects STOP, legitimate root PENDING/UNKNOWN.


## M0 — normalización de error de lock: test-first rojo corregido y cinco workflows SUCCESS (2026-10-20)

- **Evidencia roja conservada:** en el SHA de código/prueba `9fad44406e3c19bac2a20ecb830cf29f6758dae7`, la aceptación integrada [39372027172](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027172) y la continuidad de admisión [39372027076](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372027076) fallaron en la misma aserción obsoleta de `tests/nexo/continuity-store.test.mjs:566): esperaba `EACCES` de `initialize()`, aunque el contrato nuevo correctamente devuelve `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_FAILED`. STEP 4 `39372027142`, STEP 5 `39372027131` y persistencia determinista `39372027145` sí pasaron en ese SHA.
- **Corrección sólo de test:** commit [b133c8c392739a0912f7b0466650a25962ead267](https://github.com/snowdenxrp/aldea-ia/commit/b133c8c392739a0912f7b0466650a25962ead267), blob de test `ee9327c706f8b34a7c2a7c632f48cb81776df098`. La expectativa ahora coincide con el contrato normalizado; la aserción de que `commitIfCurrent()` propaga `EACCES` se mantiene. No hubo otro cambio de runtime.
- **CI SUCCESS en el SHA exacto corregido `b133c8c392739a0912f7b0466650a25962ead267`:**
  - M0 aceptación integrada [39372728077](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728077)
  - Admisión/reinicio [39372728055](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728055)
  - Persistencia determinista [39372728046](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728046)
  - STEP 4 [39372728141](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728141)
  - STEP 5 [39372728127](https://github.com/snowdenxrp/aldea-ia/actions/runs/39372728127)
- Interpretación: se valida la normalización del contrato de error y las regresiones ejecutadas por esos cinco workflows; no prueba filesystem físico, pérdida de energía, host local comprometido ni autoridad legítima.
- HISTÓRICO SUPERADO 2026-10-20: la decisión de espera acotada ya está adoptada e implementada inicialmente; ver sección posterior de deadline monotónico y SHA `12efac26d0948b91c59706612edec7df9e78c4f5`.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.


## M0 — revisión de callers y progreso del lock: no introducir timeout sin contrato (2026-10-20)

- Informe: [NCS_M0_LOCK_CONTENTION_PUBLIC_CALLER_AUDIT_2026-10-20.md](BUILD/NCS_M0_LOCK_CONTENTION_PUBLIC_CALLER_AUDIT_2026-10-20.md).
- Revisión de blobs publicados: Continuity store `ecf982a028dcd4e9208eb236e27538eb5b508863`; Chronicle store `f441dc538313dd85935b5679547dd69ad242d2a3`; owner `81db34308e3881e3fa900653751a325952eeceb9`; service `9f19377f67103bf0d22f68cab9266c2accacc768`; Chronicle application `e5ff6c385f3160dfb78982a36c73a15d2d51887d`; Chronicle adapter `b29c26d84c19afa34769f06cedd7d0131e873075`; effect adapter `efe00f7f0bd3586266209fb17e2eb725a6522463`.
- Hallazgo: ambos stores esperan sin deadline cuando un lock válido sigue presente y su PID permanece vivo. El umbral de 60 s sólo clasifica stale con PID no vivo; no es timeout. Ninguna API pública del store acepta deadline/cancelación.
- Los callers canónicos inspeccionados bloquean o clasifican incertidumbre ante errores de adquisición, y no convierten el fallo de PREPARED en permiso para dispatch. Sin embargo, si el lock sigue retenido y la espera no retorna, tampoco pueden devolver resultado acotado.
- Contratos de error siguen asimétricos entre `initialize()` y métodos mutables y entre Continuity/Chronicle. No se unifican por estética ni se añade timeout/BUSY/lease/heartbeat/reclaim sin definir el contrato de callers y recuperación tras expiry.
- Recomendación: resolver como requisito de despliegue/API si M0 acepta writers cooperativos en filesystem local con espera sin límite o requiere respuesta acotada. Si requiere límite, especificar un contrato compartido antes de cambiar código, distinguiendo contención, stale, error IO y persistencia UNKNOWN; todo reintento exige reconciliación canónica y nunca redispatch ciego.
- No hubo cambios de runtime/tests ni nuevas ejecuciones CI en esta revisión. El último SHA de código/prueba validado sigue siendo `b133c8c392739a0912f7b0466650a25962ead267`, con cinco workflows SUCCESS registrados arriba.
- Estado global: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.


### Propuesta histórica de contrato (SUPERADA 2026-10-20; ver implementación y decisión aceptada abajo)

- Recomendación arquitectónica: para el runtime interactivo, preferir espera de lock acotada con presupuesto/deadline monotónico propiedad del caller y propagado por la operación completa; no fijar un timeout arbitrario dentro de cada store ni reiniciar el presupuesto en cada llamada.
- La expiración sólo puede clasificar una espera que aún no adquirió el lock; no debe cancelar una escritura/rename ya iniciada ni convertir un estado de persistencia ambiguo en fallo seguro.
- Resultado de timeout previo a adquisición debe ser estructurado y afirmar que la fase de escritura no comenzó. Si la operación ya tenía PREPARED/dispatch previo, cualquier reintento exige leer/reconciliar el estado canónico; nunca redispatch ciego.
- Informe ampliado: [NCS_M0_LOCK_CONTENTION_PUBLIC_CALLER_AUDIT_2026-10-20.md](BUILD/NCS_M0_LOCK_CONTENTION_PUBLIC_CALLER_AUDIT_2026-10-20.md), sección 5.1.
- La propuesta no está implementada ni adoptada: falta definir si el primer despliegue requiere respuesta acotada y el presupuesto correspondiente. No se cambió runtime/tests.


## M0 — requisito de espera acotada aceptado; contrato compartido especificado (2026-10-20)

- Decisión del usuario: **A — espera acotada para adquirir locks**, recomendada para el runtime interactivo. Esto reemplaza la propuesta anterior de dejar abierta la elección entre espera ilimitada y acotada.
- Especificación: [NCS_M0_BOUNDED_LOCK_WAIT_CONTRACT_2026-10-20.md](BUILD/NCS_M0_BOUNDED_LOCK_WAIT_CONTRACT_2026-10-20.md).
- La decisión no equivale a implementación. El runtime aún espera sin deadline; no afirmar que la garantía ya exista.
- Contrato de diseño: un solo deadline monotónico absoluto propiedad del caller, propagado entre operaciones anidadas Continuity/Chronicle; el vencimiento limita sólo la espera de adquisición. No cancelar escritura/rename en curso, no reiniciar el presupuesto en cada store, no reclamar locks ajenos y no convertir timeout en autorización ni en persistencia UNKNOWN cuando la fase de escritura no comenzó.
- Los códigos de timeout indicados abajo ya están implementados; la auditoría de propagación pública continúa abierta, no la decisión de nombres.
- **Presupuesto numérico/configuración sigue abierto**; no inventarlo. Además, deadline cooperativo no garantiza tiempo de pared estricto si una llamada de filesystem queda bloqueada.
- Próxima fase: mapear firmas y pruebas actuales; diseñar abstracción mínima compartida de deadline; acordar forma pública del timeout y tratamiento de adquisición tardía; después implementar stores, propagar desde callers y añadir pruebas de no-dispatch/no-redispatch antes de correr CI. Si el contrato requiere una reestructuración, detenerse y explicar la causa raíz en vez de añadir parches.
- No se hicieron cambios de runtime/tests ni se ejecutó CI para este contrato. Último SHA de código/test validado sigue siendo `b133c8c392739a0912f7b0466650a25962ead267`, con cinco workflows SUCCESS registrados arriba; ese CI previo no valida este requisito ni futura implementación.
- Estado constitucional no cambia: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.


## M0 — mapa de APIs/callers para deadline compartido (2026-10-20)

- Auditoría estática: [NCS_M0_LOCK_DEADLINE_CALLER_MAP_2026-10-20.md](BUILD/NCS_M0_LOCK_DEADLINE_CALLER_MAP_2026-10-20.md).
- Confirmado: el deadline debe atravesar la cadena `runNexoChronicleAppend` → stores/owner → `executeNexoStepWithContinuityOwner` → PREPARED/lineage/reconciliation/outcome y handler Chronicle → `append`. No existe parámetro deadline en la entrada de aplicación, servicio de continuidad, owner, runtime ni handler.
- Los stores tienen firmas mutables distintas: Continuity `initialize(snapshot)` / `commitIfCurrent(expectedRevision, candidate)`; Chronicle `initialize()` / `append({ operationKey, content })`. Los métodos tienen contratos de error no uniformes; no unificarlos sin mapear los consumidores.
- Tests existentes cubren concurrencia, espera cross-process, stale/unknown, resultados de escritura ambiguos y fallos de liberación; no fijan espera acotada. El test cross-process actual es una caracterización de la semántica anterior, deberá cambiar explícitamente.
- No se encontró deadline/monotonic helper existente en los fuentes revisados. El presupuesto finito y su fuente/configuración siguen abiertos. No implementar un fallback sin límite ni adivinar un valor.
- HISTÓRICO SUPERADO 2026-10-20: el presupuesto 2.000 ms configurable, helper monotónico y matriz por método ya se implementaron; continuar desde auditoría de callers/entrypoints.
- HISTÓRICO SUPERADO 2026-10-20: sí hay cambios de runtime/tests y CI posterior; la evidencia vigente está en la sección de deadline monotónico más reciente.


## M0 — matriz propuesta de resultados de timeout por API (2026-10-20)

- Documento: [NCS_M0_LOCK_TIMEOUT_RESULT_MATRIX_2026-10-20.md](BUILD/NCS_M0_LOCK_TIMEOUT_RESULT_MATRIX_2026-10-20.md).
- Mapea Continuity `initialize`/`commitIfCurrent`, Chronicle `initialize`/`append`, Chronicle handler, owner/runtime y la superficie pública de aplicación.
- Propuesta central: timeout de adquisición devuelve un resultado de dominio diferenciado y explícito de que la fase de escritura no comenzó; no convertirlo en persistencia UNKNOWN ni en éxito. La forma exacta `phase`/`writeStarted` aún está propuesta, no implementada.
- Caso de adquisición tardía documentado: si la llamada retorna después del deadline, no empezar escritura; liberar sólo lock cuya propiedad se demuestre; si la liberación falla, preservar ambos resultados.
- HISTÓRICO SUPERADO 2026-10-20: el usuario aceptó 2.000 ms configurables y el runtime/tests fueron implementados y validados; no volver a tratar la decisión como pendiente.
- Estado sigue M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.


## M0 — deadline monotónico de locks implementado inicialmente (2026-10-20)

- Decisión confirmada por el usuario: **2.000 ms iniciales configurables**. No es una garantía de tiempo de pared; el filesystem puede no retornar a tiempo.
- Helper nuevo: src/nexo/core/lock-deadline.mjs; performance.now() es el reloj monotónico. El presupuesto por defecto está centralizado, no duplicado por store.
- Continuity y Chronicle ahora acotan la espera cooperativa de adquisición y devuelven resultados explícitos de timeout con phase:"lock_acquisition" y writeStarted:false. Si el lock se obtiene tras vencer el deadline, no comienza la fase protegida y se conserva el resultado de liberación.
- La operación compuesta runNexoChronicleAppend comparte un único deadline entre stores y mutaciones anidadas. Fuera de esa frontera, las mutaciones aisladas reciben un presupuesto por llamada.
- Pruebas añadidas: timeout con lock vivo en Continuity initialize/commitIfCurrent y Chronicle initialize/append, sin alterar el estado canónico.
- SHA exacto de runtime/tests validado por seis workflows: cf62bd858232a8c0c71f21ace6469c2a62f48448.
  - [M0 integrated acceptance](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455204)
  - [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455208)
  - [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455212)
  - [Mission admission/restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455161)
  - [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455195)
  - [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455201)
- Evidencia cruda de logs verificada: jobs 118472464797, 118472464632, 118472468527; reportan los tests de Continuity/Chronicle y suite general sin fallos.
- HISTÓRICO PARCIALMENTE SUPERADO: pruebas de adquisición tardía y fallo de liberación ya pasaron; sigue abierta la auditoría final de callers/entrypoints y no-redispatch.
- Estado no cambia: M0 INCOMPLETO; authorization: NOT_EVALUATED; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.


### M0 — adquisición tardía y fallo de liberación probados (2026-10-20)

- Se añadieron pruebas deterministas para ambos stores: la llamada de adquisición resuelve después del deadline; no se inicia escritura, se libera sólo el lock propio y el archivo canónico permanece ausente.
- Se añadieron pruebas donde falla la liberación del lock adquirido tarde; el resultado conserva timeout + fallo de liberación, sin fingir que el lock se liberó.
- Código/tests validados en SHA exacto: 15415580788c4e823f03371b566e29106268b67d.
- Seis workflows en verde en ese SHA:
  - [M0 integrated acceptance](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730407)
  - [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730358)
  - [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730428)
  - [Mission admission/restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730355)
  - [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730370)
  - [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730363)
- La auditoría de callers/entrypoints sigue siendo la próxima tarea; el trabajo de preservación pública y no-dispatch de PREPARED ya tiene pruebas iniciales en SHA `12efac26d0948b91c59706612edec7df9e78c4f5`.


### M0 — timeout propagado hasta la superficie pública (2026-10-20)

- La aplicación Chronicle conserva phase/writeStarted/lockRelease para timeout al inicializar Chronicle o al abrir Continuity.
- El handler de append y la proyección pública conservan la evidencia de timeout, incluso si aparece dentro de la respuesta de adapter/lineage/outcome; la CLI incluye los campos sanitizados.
- Test de runtime confirma que timeout al persistir PREPARED mantiene blocked, dispatchAttempted:false y redispatchAuthorized:false; no se invoca el adapter.
- Integración probada para timeout de inicialización de Chronicle y de bootstrap de Continuity.
- SHA de código/tests: 12efac26d0948b91c59706612edec7df9e78c4f5. Seis workflows consultados pasaron: M0 integrated acceptance (39376332936), Chronicle native vertical (39376332981), deterministic persistence (39376333167), STEP 5 (39376332991), STEP 4 (39376333035) y repair settlement crash cuts (39376333016). No se afirma un run de mission-admission/restart para este SHA porque no apareció en la consulta.
- Logs verificados: jobs 118475197653, 118475197877, 118475199164.
- Próximo paso M0: auditoría final de otros entrypoints/consumidores que construyen stores u owners fuera de runNexoChronicleAppend; comprobar que mutaciones aisladas quedan acotadas y que los resultados no se aplanan ni autorizan redispatch.


### Resultado de auditoría de entrypoints (2026-10-20)

- API estable de aplicación: sólo Chronicle append es mutante; su ruta comparte un deadline. Las consultas de Continuity son read-only y el CLI Chronicle delega en la API pública con metadata de timeout preservada.
- La ruta de reparación separada recibe owner/store inyectados; no es la ruta interactiva Chronicle y el runtime canónico actual bloquea acciones de reparación antes de PREPARED. No activarla como operación interactiva hasta definir y probar un deadline compartido para esa ruta.
- Conclusión provisional: para el alcance interactivo actualmente soportado, el deadline compuesto está propagado; stores usados individualmente están acotados por mutación. La ruta de reparación inyectada permanece fuera del alcance activo.
- Próxima frontera M0: revisar si la política de activación de la ruta de reparación debe quedar explícitamente bloqueada o si requiere su propio deadline compartido antes de habilitarse. No tocar otras arquitecturas ni reabrir auditorías cerradas.


### Cierre de inventario de callers — frontera de reparación (2026-10-20)

- Auditoría detallada: [NCS_M0_REPAIR_ROUTE_DEADLINE_BOUNDARY_2026-10-20.md](BUILD/NCS_M0_REPAIR_ROUTE_DEADLINE_BOUNDARY_2026-10-20.md).
- La API pública estable mantiene una única mutación compuesta: Chronicle append, con deadline compartido. Consultas de Continuity son read-only; CLI Chronicle delega en esa API y preserva metadata sanitizada de timeout.
- La ruta `scripts/nexo-repair-session.mjs` / `scripts/nexo-repair-entrypoint.mjs` es separada y recibe owner/store por inyección. No está cubierta por el deadline compartido de Chronicle y no debe considerarse habilitada por esta implementación.
- El runtime canónico bloquea acciones de reparación antes de PREPARED; los tests de repair settlement también mantienen bloqueado el cierre si falta el contrato de settlement. Esto no equivale a demostrar que toda función de reparación independiente esté globalmente inhabilitada.
- Regla operativa fail-closed: mantener la ruta de reparación fuera de la API interactiva estable. No habilitarla hasta especificar deadline monotónico único para toda la operación y probar PREPARED/dispatch/lineage/settlement/no-redispatch. No se cambió runtime para esta frontera.
- CI de código/tests SHA `12efac26d0948b91c59706612edec7df9e78c4f5`: M0 integrated acceptance, Chronicle native vertical, deterministic persistence, repair settlement crash cuts, STEP 5 y STEP 4 pasaron. No afirmar mission-admission/restart para ese SHA: no apareció en la consulta exacta.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.
- Próximo trabajo: continuar con el siguiente bloqueo M0 registrado, sin volver a auditar adquisición tardía ni reabrir auditorías cerradas.


## M0 — precisión de integración Constitución→Policy (2026-10-20)

La revisión estática de `src/nexo/core/contracts.mjs` confirma que `createPolicyContext()` sólo conserva `policyRef`, `scope`, `resolved`, `validity` y `resolutionProvenance`; no establece ni conserva un contexto constitucional autenticado. El contrato existente Constitución→Policy requiere identidad constitucional gobernante, identidad de Policy, dominio/aplicabilidad, vigencia, dependencias y procedencia protegida. La auditoría de reutilización ya había documentado que no hay un camino Core implementado que establezca el contexto constitucional actual.

Esto confirma un gap de integración estático; **no prueba un bypass** y no justifica añadir `constitutionRef` desde el caller. Los fixtures `AUTHORIZED` de `protected-transition.test.mjs` no demuestran reconocimiento de raíz. Detalle integrado en `BUILD/NCS_M0_CLAIM_RELATIVE_AUTHORITY_ENFORCEMENT_INVENTORY_2026-10-20.md` y handoff.

Próxima dependencia: revisión explícita del borrador constitucional por el propietario; después, y sólo con fuente/procedencia de raíz demostrable, definir el contexto protegido y su vínculo con Policy. Sin cambios de runtime ni CI en esta revisión documental. Estado sin cambio: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos `STOP`; raíz `PENDING/UNKNOWN`.


## M0 — índice directo para revisión constitucional del propietario (2026-10-20)

Se añadió a la guía existente un cruce directo entre las secciones del borrador (§§2–10) y las 11 decisiones/dependencias OPEN. El cruce separa lo que el borrador ya declara de lo que todavía necesita decisión o evidencia. No crea reglas nuevas, no repite investigación, no registra aprobación y no autoriza commissioning.

Guía actualizada: [NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md](BUILD/NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md), commit `194f38819bbfaaf7f650c8e824b06fc9552139aa`.

Estado sin cambio: borrador DRAFT / NOT FROZEN / NOT COMMISSIONED; M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`. Cambio documental solamente; no runtime, tests ni CI.


## Última verificación M0 — CI de continuidad y aceptación (2026-10-20)

- Commit actual verificado: `6594f27a0e28e6ce5f53446228be11841626cfc3` (añade `tests/nexo/continuity-contract.test.mjs` a `npm test`).
- CI `completed / success`: [persistencia determinista](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665444), [admisión y reconstrucción](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665452), [aceptación integrada M0](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665518), [vertical Chronicle](https://github.com/snowdenxrp/aldea-ia/actions/runs/39438665626).
- La suite `tests/nexo/continuity-contract.test.mjs` aparece como paso explícito exitoso en el workflow de admisión/reconstrucción y ahora también forma parte de `npm test`.
- Alcance: evidencia de tests solamente; no cambia el estado de autoridad constitucional ni permite commissioning.
- Estado M0: `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## M0 — regresión contra autoridad constitucional suministrada por caller (2026-10-20)

- Test commit: `29e97fab41261fdd6505f5e02d8ce4791852e981`, `tests/nexo/protected-transition.test.mjs`.
- Caso adversarial: el caller suministra `constitutionRef`, `governingConstitution`, `rootProof` y `authorization: AUTHORIZED` junto a PolicyContext válido. La proyección resultante conserva sólo `policyRef`, `scope`, `resolved`, `validity` y `resolutionProvenance`; el `rootProof` no se incorpora.
- **Verificación posterior del checkpoint:** el workflow `npm test` [run 39446775325](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446775325) terminó `completed / success` en el SHA exacto `1f4f6cfb5d674e7c3124c93311c7c40c57ca54a7`, que incluye el test y las actualizaciones de informe/STATUS/handoff anteriores. El siguiente cambio de documentación, si se hace, será un SHA distinto y no queda validado por este run.
- CI SUCCESS en el SHA exacto: [M0 integrated acceptance](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572258), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572376), [M0 non-authority core contracts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446574300), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572342), [deterministic persistence](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572371), [STEP 3A/3B/3C](https://github.com/snowdenxrp/aldea-ia/actions/runs/39446572419).
- Informe: [NCS_M0_POLICY_CONTEXT_CALLER_AUTHORITY_PROJECTION_REGRESSION_2026-10-20.md](BUILD/NCS_M0_POLICY_CONTEXT_CALLER_AUTHORITY_PROJECTION_REGRESSION_2026-10-20.md), commit documental `4fde94466789ead9b747335674023211e1d0f4c6`.
- Alcance limitado: protege contra futura promoción accidental de metadatos caller-controlled. No crea ni autentica un contexto constitucional y no prueba raíz ni autoriza efectos. Sin cambios de runtime.
- Estado M0 sin cambio: `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Nota de verificabilidad CI (2026-10-20)

El workflow `.github/workflows/nexo-deterministic-tests.yml` sí declara `workflow_dispatch`, pero las acciones GitHub disponibles en esta sesión no incluyen una operación para despachar un workflow. La acción de consulta de runs disponible está documentada como filtrada a ejecuciones asociadas a pull requests; para los SHA de regresión, el endpoint de estados devolvió `statuses: []`. Por tanto, estos resultados **no prueban que no se haya ejecutado ningún workflow**; solo significan que esta sesión no pudo obtener evidencia CI atribuible a los SHA exactos. La validación de las regresiones permanece `CI_NOT_VERIFIED`. Próxima acción de verificación: ejecutar manualmente el workflow determinista desde GitHub Actions con la rama `ncs-clean-architecture` actual y conservar el run ID, el SHA exacto ejecutado y el resultado del job `tests` antes de declarar PASS.


## Verificación CI posterior — persistencia determinista (2026-10-20)

- La consulta directa de GitHub Actions por rama encontró el workflow de push que no aparecía en la consulta de runs filtrada a pull requests.
- Run [39449973775](https://github.com/snowdenxrp/aldea-ia/actions/runs/39449973775), workflow `.github/workflows/nexo-deterministic-tests.yml`, terminó `completed / success` con SHA exacto `709afc161cdfc8a0aef9ab076f6e66b64db49d99`; el job `tests` concluyó `success`.
- El SHA contiene las regresiones de reconstrucción de outcomes persistidos `NEXO_OUTCOME_EVIDENCE_CONFLICT` y `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`, además de la validación fail-closed de forma de misión persistida y sus pruebas.
- Esta evidencia supersede el estado anterior `CI_NOT_VERIFIED` **para la suite determinista y ese SHA exacto**. No acredita otros workflows no incluidos, no demuestra autenticación de `evidence.source`, no establece raíz legítima y no autoriza efectos protegidos.
- M0 sigue `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## M0 — terminal journal histórico no debe bloquear misiones retenidas (2026-10-20)

- Contraejemplo reproducible: la retención de planes limita misiones históricas, mientras que el journal puede conservar registros terminales hasta su propio límite. La reconstrucción global trataba cualquier registro `settled_observed`/`reconciled_observed` cuyo plan ya no existía como `unownedEffectEntry` y bloqueaba incluso una misión retenida no relacionada.
- Runtime commit `5a1bbd77270941d24ce5801408d32cf4d05646a6`: un journal terminal con `missionId` válido pero plan histórico ya podado deja de bloquear misiones no relacionadas. La comprobación global sigue cerrando ante identidad `missionId` ausente/inválida y ante `prepared` sin plan; los registros del journal que sí corresponden a la misión actual siguen sujetos a validación de identidad.
- Regresión commit `4c1555ec56f5c7ec357ec0884eec03807539cb95`, `tests/nexo/continuity-contract.test.mjs`: añade terminal `settled_observed` de misión histórica podada y exige que no bloquee la misión retenida con finalización verificada.
- CI del SHA de regresión todavía pendiente de consultar; no declarar PASS hasta revisar el run/job `tests` en SHA exacto.
- Estado M0 permanece `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Verificación CI confirmada — aislamiento de journal terminal histórico (2026-10-20)

- Runtime fix: `5a1bbd77270941d24ce5801408d32cf4d05646a6`; regresión: `4c1555ec56f5c7ec357ec0884eec03807539cb95`.
- En el SHA exacto de regresión `4c1555ec56f5c7ec357ec0884eec03807539cb95`, terminaron SUCCESS: [persistencia determinista 39451734619](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734619), [aceptación integrada M0 39451734664](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734664), [admisión/continuidad 39451734557](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734557), [validación semántica 39451734719](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734719) y [clasificación de outcomes 39451734698](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734698).
- Además, el HEAD documental `b429a0f606a2fe62c045eabf4757a490778bcad9` ejecutó [persistencia determinista 39451824503](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451824503), job `tests` SUCCESS. Este SHA contiene runtime + regresión y los documentos de continuidad vigentes.
- Conclusión acotada: la regresión de journal terminal huérfano no bloqueante para una misión retenida pasó en la suite y workflows listados. No se ha validado toda autoridad M0 ni se habilitan efectos protegidos.
- Estado global sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## M0 — estados de journal desconocidos preservados por retención (2026-10-20)

- Hallazgo y contrato: [NCS_M0_UNKNOWN_EFFECT_JOURNAL_RETENTION_2026-10-20.md](BUILD/NCS_M0_UNKNOWN_EFFECT_JOURNAL_RETENTION_2026-10-20.md).
- Runtime `25ac7eab1a221dbceeb1226a9b793ea274b6422e`: solo `settled_observed` y `reconciled_observed` son descartables por retención; `prepared` y estados desconocidos se preservan, junto con el plan asociado si hay `missionId` válido.
- CI descubrió fixture obsoleto: un test llamaba `completed` estado terminal del journal, pero el contrato operativo no lo reconoce. Run fallido documentado: [39452369889](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452369889), assertion `201 !== 200`. Fixture corregido a `settled_observed` en `419546c10552ae88fe98e3dbf89d7a865dd48e56`; no se relajó la preservación de estados desconocidos.
- En el SHA exacto de corrección `419546c10552ae88fe98e3dbf89d7a865dd48e56`, SUCCESS: [persistencia determinista 39452539513](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452539513), [admisión/continuidad 39452539695](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452539695), [validación semántica 39452539536](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452539536), [clasificación de outcomes 39452539530](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452539530).
- M0 sigue `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

## NCS M0 — registro de decisiones constitucionales del propietario (2026-10-21)

- Registro creado: [NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md](DECISIONS/NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md), commit `19ee8d0d323d53cefccf2c65d6c45a034c9240a4`.
- Guía sincronizada: [NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md](BUILD/NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md), commit `304563bf12b90bc3422ee72b0264c85a4d0a5253`.
- Puntos 1–6: `ACEPTAR COMO BASE DEL BORRADOR`, sin observaciones adicionales. Punto 7: `OPEN / NO ACEPTADO`.
- No se modificó el borrador constitucional fuente; no se infieren aprobación completa, congelación, firma, commissioning ni autorización de efectos.
- Estos son commits documentales; no se atribuye CI a ellos hasta comprobar un run con SHA exacto. La suite no se ha vuelto a ejecutar como parte de esta actualización documental.
- Próximo trabajo M0: verificar el HEAD y evidencia CI atribuible a la rama; luego continuar con la matriz finita M0-A…M0-E y el bloqueo M0-E (procedencia de raíz y límite real de efecto protegido), sin repetir auditorías B/C/D que no tengan evidencia nueva.
- Estado conservador: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

## M0 — inventario finito de assertions reutilizables (2026-10-21)

- La matriz [NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md](BUILD/NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md) ahora contiene un inventario finito de assertions ya existentes para M0-A…M0-E.
- Se mapean B/C/D a suites incluidas en `npm test`; no se reabrieron sus auditorías ni se añadieron pruebas/runtime en esta actualización.
- La puerta candidata mínima para A es el workflow determinista `.github/workflows/nexo-deterministic-tests.yml`, job `tests`, en el SHA final exacto. No hay PASS sin un run observado en ese SHA.
- M0-E sigue bloqueante: fixtures `AUTHORIZED` no demuestran raíz legítima ni enforcement en el sink real.
- Actualización documental de matriz: commit `8988b9a73c317db7f61e05d2b44bbcbc7cf5608b`. No se ejecutó CI por esta actualización.
- Estado: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

## Decisión constitucional del propietario — punto 7 (2026-10-21)

- Decisión: punto 7, Policy/contexto/evaluación de operaciones, **ACEPTADO COMO BASE DEL BORRADOR**; observaciones adicionales no especificadas.
- Registro actualizado: [NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md](DECISIONS/NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md).
- La aceptación no constituye aprobación constitucional completa, firma, congelación, commissioning ni autorización de efectos protegidos.
- El punto 7 aceptado en papel no demuestra un evaluador integrado al sink real; M0-E continúa bloqueante.
- No se ejecutó CI como resultado de esta actualización documental.


---

## NCS M0 — handoff maestro de continuidad (2026-10-21)

- Handoff para abrir el siguiente chat: [NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-21.md](BUILD/NCS_M0_MASTER_HANDOFF_NEXT_CHAT_2026-10-21.md).
- Commit del handoff: `d26ba5e8e3a98047c0eb80eb55b45201412892c5`.
- Decisiones del propietario de los puntos constitucionales 1–7: `ACEPTAR COMO BASE DEL BORRADOR`; no equivalen a aprobación completa, firma, congelación, commissioning ni autorización de efectos protegidos.
- No se modificó el borrador constitucional fuente ni se cambió runtime en este paso.
- Continuidad obligatoria: verificar HEAD real de `ncs-clean-architecture` y CI atribuible a ese SHA; no extrapolar los runs históricos de la matriz. Después continuar desde M0-E, sin repetir B/C/D salvo evidencia nueva.
- Estado conservador sin cambio: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

## M0-E — contrato mínimo de integración (2026-10-21)

- Nuevo análisis focal: [NCS_M0_E_MINIMUM_INTEGRATION_CONTRACT_ANALYSIS_2026-10-21.md](BUILD/NCS_M0_E_MINIMUM_INTEGRATION_CONTRACT_ANALYSIS_2026-10-21.md).
- Confirmado en los blobs leídos: `protected-transition.mjs` consume `authorityGate.check(claim)` y llega a `conditionalCommit.commit(candidate)` sin llamar a `effectBoundary.prepare`; el vector bootstrap sigue siendo de software, no raíz provisionada.
- Esto delimita una brecha de contrato/integración; no prueba por sí solo un bypass productivo.
- Limitación de verificación: las herramientas usadas no expusieron el SHA actual de `refs/heads/ncs-clean-architecture` de forma inequívoca. No atribuir CI al estado actual hasta obtener el SHA de ref y run/job/SHA coincidentes.
- Próximo paso: resolver el SHA exacto, revisar solo cambios M0-E desde los blobs anotados y preparar una prueba adversarial de la frontera real; no tocar runtime para simular raíz.
- Estado conservador: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.
