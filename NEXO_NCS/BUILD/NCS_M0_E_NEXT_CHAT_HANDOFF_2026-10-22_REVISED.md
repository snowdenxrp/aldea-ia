# NCS — M0-E handoff de continuidad para el siguiente chat
Fecha: 2026-10-22
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`
Estado de este handoff: DOCUMENTACIÓN DE CONTINUIDAD; no cambia runtime ni tests.

## Instrucción de arranque para el próximo chat
El usuario iniciará el siguiente chat escribiendo exactamente: `NCS`.

Al comenzar:
1. Leer `NEXO_NCS/STATUS.md` primero; es la puerta canónica.
2. Leer este handoff y después el plan adversarial M0-E y el documento de reutilización de contratos.
3. Consultar el HEAD real de `refs/heads/ncs-clean-architecture` y los blobs actuales antes de reutilizar SHAs.
4. Revisar CI solo para el SHA que se esté evaluando; no atribuir un run de un commit anterior a uno posterior.
5. Continuar M0-E desde los hallazgos actuales. No reiniciar Step 7, M1 ni auditorías AB/P ya cerradas.
6. No afirmar que se cambió o ejecutó código, tests o CI a menos que exista evidencia del commit/run exacto.

## Estado canónico
- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Constitución: puntos 1–7 aceptados solo como base del borrador. No son aprobación constitucional completa, congelación, firma, commissioning ni autorización de efectos.
- La instrucción “continúa sin límites” permite avanzar en el trabajo, pero no acepta valores candidatos ni aprueba decisiones de autoridad/Constitución por inferencia.
- Meta actual: crear Nexo y progresar en M0; no desviarse a M1 ni convertirlo en un chatbot.

## HEAD y evidencia observada durante esta revisión
- La búsqueda más reciente de commits del repositorio devolvió como primer commit `8b7f4e690de76832393dc854ff7433953c51d4a4`; es un commit observado, pero antes de continuar hay que volver a consultar el HEAD actual de la rama.
- `src/nexo/core/protected-transition.mjs`, blob observado `39a602b80cda8f3939b2ffed7e726d06c21b077f`.
- `src/nexo/core/ownership.mjs`, blob observado `3b66d07e67df09b058b37716716573f6c17a2099`.
- `NEXO_NCS/STATUS.md`, blob consultado `fab5885acfb6727f96a9cdc8e86ec1fed274f106` (archivo grande; volver a leer las secciones relevantes en el HEAD vigente).
- `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`, blob `f73fefce4ea27bc848def43155976a82890b6c6c`.
- `NEXO_NCS/BUILD/NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md`, blob observado `35b0c222f19310147f7daf3ba786d08ba5bc0389`.
- Contrato Genesis: `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`, blob previamente observado `e65df41ff98f7e53a8574ca5295a947023cb8b30`.
- Contrato Constitución→Policy: `NEXO_NCS/BUILD/STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md`, blob `34a4a8ecef267bb1d27cb50e927b613d0ff0f499`.
- No se hicieron cambios de runtime/tests en esta revisión y no se ejecutó CI nuevo.

## Hallazgos técnicos vigentes
1. `createCorePorts()` en `ownership.mjs` expone puertos capability-separated. El fallback de `effectBoundary.prepare` es `NOT_IMPLEMENTED`; que exista el puerto no significa que esté conectado.
2. `executeProtectedTransition()` en `protected-transition.mjs` construye y valida el claim, consulta `authorityGate.check(claim)`, rechaza `STOP/UNKNOWN`, aísla el snapshot, ejecuta candidato, valida semántica y después llama `conditionalCommit.commit(candidate)`.
3. Esa transición no llama a `effectBoundary.prepare`. Esto es una brecha de integración/diseño que requiere resolución, pero no demuestra por sí sola un bypass productivo.
4. No se ha probado que `conditionalCommit.commit` sea el sink real de efectos externos ni que gobierne todas las rutas de mutación. No llamarlo “sink externo” hasta identificar implementación y callers.
5. `authorityGate` sigue siendo un puerto inyectado. Un fixture que retorna `AUTHORIZED` prueba el flujo posterior a la decisión; no prueba que la raíz sea legítima ni que Constitución y Policy estén vigentes.
6. `tests/nexo/root-bootstrap-protocol.test.mjs` contiene un vector criptográfico de prueba; la clave/firma de ese vector no es la raíz de Nexo.
7. La ruta owner-backed canónica permite `chronicle_append` como persistencia local no protegida y bloquea otras acciones de esa ruta antes de dispatch. Esto no prueba que rutas alternativas sean inalcanzables.
8. La ruta legacy de simulación contiene handlers que mutan la simulación. No se ha demostrado que el camino sea alcanzable en producción ni que sea inalcanzable universalmente. No conectarlo al runtime owner-backed bajo el alcance provisional.
9. No existe evidencia de una ruta completa: raíz independiente → Constitución exacta vigente → Policy/contexto autenticado → decisión claim-específica → último límite real de mutación.

## Documentos que se deben reutilizar, no rediseñar desde cero
- `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`
- `NEXO_NCS/BUILD/NCS_M0_E_ADVERSARIAL_ACCEPTANCE_TEST_PLAN_2026-10-21.md`
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md`
- `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md` (confirmar path/blob en HEAD actual).
- La investigación previa compara raíz offline, hardware-protected root, quorum/multi-party recovery y delegated recovery. Ninguna opción está seleccionada. No volver a hacer investigación amplia salvo que aparezca evidencia nueva y específica.

## Próximos pasos exactos
### A. Confirmar estado y alcance
1. Consultar HEAD actual y leer en `STATUS.md` la sección más reciente de M0-E, además de la línea de meta M0 y el handoff anterior.
2. Confirmar qué clase de efecto está realmente en alcance bajo la opción A provisional. No inferir que todos los efectos de Lúmina están incluidos o excluidos.
3. Mapear para esa clase: entry point → callers → último punto capaz de mutar → implementación del sink → controles que se ejecutan antes del sink.
4. Separar claramente persistencia interna Chronicle de cualquier efecto protegido externo.

### B. Mapear cobertura existente sin duplicarla
1. Revisar tests relevantes: `tests/nexo/protected-transition.test.mjs`, `tests/nexo/root-bootstrap-protocol.test.mjs`, `tests/nexo/conditional-commit-persist-state.test.mjs`, `tests/nexo/chronicle-runtime.test.mjs`, `tests/nexo/effect-adapter.test.mjs` y los tests del owner-backed runtime.
2. Por cada prueba, registrar qué propiedad prueba realmente, qué puerto/sink observa y qué no demuestra.
3. No repetir pruebas tautológicas de `STOP/UNKNOWN`. Una prueba negativa de aceptación debe comprobar simultáneamente el resultado fail-closed y cero invocaciones del sink real.
4. No crear el camino positivo integrado mientras falten fuente legítima de raíz, Constitución exacta aprobada y Policy/contexto verificables.

### C. Resolver la dependencia real, sin inventar autoridad
Antes de implementar, definir la fuente/procedencia independiente que reconoce la raíz en el entorno real y sus supuestos de fallo, actualidad, revocación, sucesión y recuperación. No crear un `GenesisRoot`, trust registry, quorum, pin o verificador ficticio. No tratar una clave de test, un hash, una firma, un epoch, snapshot o etiqueta `trusted/authoritative` como legitimidad.
Si no existe fuente independiente definida/provisionada, mantener `PENDING/UNKNOWN` y `STOP`, documentando el requisito concreto que falta.

### D. Prueba de aceptación integrada, cuando las dependencias existan
Usar el plan E-01…E-10 existente, ligado a la ruta/sink seleccionados. Debe demostrar:
- origen legítimo independiente y Constitución exacta aprobada;
- binding Constitución→Policy con identidad, scope, aplicabilidad, vigencia, dependencias y procedencia verificables;
- decisión específica para acción/recurso/target/contexto;
- enforcement en el último límite que puede causar la mutación;
- casos negativos con cero dispatch/sink calls;
- reconciliación si el resultado del sink es incierto;
- caso positivo real que use los mismos controles, no un `AUTHORIZED` inyectado;
- CI reproducible vinculado al SHA evaluado.

## Restricciones de continuidad
- No modificar runtime solo para que parezca que existe autoridad.
- No firmar, digerir, congelar ni comisionar la Constitución sin aprobación explícita del objeto constitucional exacto por el propietario.
- No tratar “continúa”, “adelante” o “sin límites” como aprobación constitucional ni autorización de efectos protegidos.
- No modificar ni aceptar los límites candidatos de recursos Chronicle/Continuity sin base contractual y decisión explícita.
- No reabrir auditorías históricas AB/P cerradas sin evidencia nueva.
- No afirmar que el usuario necesita PC, nuevas instalaciones o hardware de raíz para continuar la fase de análisis. La selección de mecanismo físico queda pendiente y no debe decidirse por inferencia.
- Mantener la arquitectura limpia: si la brecha revela que la estructura raíz está mal, detenerse y resolverla en vez de añadir una capa cosmética.

## Estado final a conservar
M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
La siguiente tarea es inspección dirigida de callers/sinks y cruce de tests existentes, no implementación especulativa.


## Actualización posterior — conditionalCommit y rutas M0-E (2026-10-22)

- Informe nuevo guardado y verificado: [NCS_M0_E_CONDITIONAL_COMMIT_SINK_ROLE_AND_ROUTE_MAP_2026-10-22.md](NCS_M0_E_CONDITIONAL_COMMIT_SINK_ROLE_AND_ROUTE_MAP_2026-10-22.md), commit `c250c3edd9c191683b799c0d46a3640556aa4960`, blob `9ba6fda8e62900ef53f173d738edf4ca04400c74`.
- Hallazgo decisivo: el adaptador real `createPersistStateConditionalCommit()` solo llama a `persistState` con control de revisión. Por tanto, `conditionalCommit.commit` es persistencia de estado canónico en esta implementación; no está demostrado como sink externo protegido.
- Las rutas deben mantenerse separadas: Core→persistState; simulación Lúmina→`executeAction(simulation, agent, action)`; runtime owner-backed→allowlist que solo admite `chronicle_append` y bloquea otras acciones antes del nuevo dispatch.
- La ruta Lúmina tiene mutación local en el handler, pero el caller productivo canónico sigue sin demostrarse; reutilizar AB104.150/P112 y no inferir alcanzabilidad ni inalcanzabilidad universal.
- No conectar `effectBoundary.prepare` al adaptador de persistencia como arreglo cosmético. Eso no demostraría enforcement en la mutación protegida real.
- No se modificó runtime/tests y no se ejecutó CI nuevo. El chequeo de status del SHA documental no devolvió status checks; no declarar PASS.
- Scope exacto sigue OPEN; opción A sigue siendo propuesta provisional, no decisión aceptada. Mantener M0 `INCOMPLETO`, autorización `NOT_EVALUATED`, raíz `PENDING/UNKNOWN`, efectos protegidos `STOP`.
- Próxima tarea: una vez confirmado HEAD actual, cruzar tests existentes por propiedad y límite observado; resolver scope explícito antes de concretar pruebas de sink o un camino positivo. `STATUS.md` no fue actualizado en esta operación; este handoff y el informe se verificaron directamente.


## Actualización de continuidad — matriz de tests y STATUS (2026-10-22)

- HEAD de rama confirmado tras las escrituras: `b83ebf1048277ea3782c7b6eda36b323499b32a6`.
- `STATUS.md` se actualizó para enlazar los dos informes nuevos; blob actual observado después del commit: `9ce54e0e9af55fc3e9eacfd5831370b3a0dd2da5`.
- Matriz nueva: [NCS_M0_E_EXISTING_TESTS_TO_REAL_MUTATION_BOUNDARY_MATRIX_2026-10-22.md](NCS_M0_E_EXISTING_TESTS_TO_REAL_MUTATION_BOUNDARY_MATRIX_2026-10-22.md), blob `0cf2fa33ff53b4a6dbcfca839dab0a4e02ce8015`.
- La matriz distingue cobertura reutilizable y brechas: transición Core/fixtures AUTHORIZED; persistencia real con revisión; vector criptográfico de prueba; lifecycle Chronicle; lifecycle de efectos e idempotencia; allowlist owner-backed. Ninguna suite demuestra el recorrido raíz legítima→Constitución exacta aprobada→Policy/contexto verificados→decisión claim-específica→sink real.
- El commit `b83ebf1048277ea3782c7b6eda36b323499b32a6` disparó workflow `Nexo — deterministic persistence tests`, run `39726077797`, evento push, SHA exacto `b83ebf1048277ea3782c7b6eda36b323499b32a6`. En la última consulta estaba `pending`; no declarar PASS hasta recuperar estado terminal y jobs.
- Scope A/B/C continúa sin decisión explícita. No activar efectos protegidos ni crear camino positivo ficticio.
- Próxima acción: consultar el run y sus jobs; si termina, registrar el resultado exacto. Luego continuar con una unidad de implementación acotada a la opción de scope que el propietario elija; no cambiar scope por inferencia.
- Estado conservado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Continuidad vigente — propietario aceptó alcance A (2026-10-22)

- **Decisión ya tomada:** el propietario aceptó opción A como alcance inicial de M0-E. No volver a preguntar por esta selección salvo que él mismo reabra la decisión.
- Registro de decisión: [NCS_M0_E_SCOPE_A_ACCEPTED_2026-10-22.md](../DECISIONS/NCS_M0_E_SCOPE_A_ACCEPTED_2026-10-22.md), commit `c0b3d984606892a985d23d0b6375f73a26d9ef9d`.
- El test `tests/nexo/entrypoint.test.mjs` se actualizó en commit `39ee2f5996fd0586ce4c666a448a290371601de4` para rechazar comandos genéricos/efectuales antes de dispatch. El adaptador `effect-adapter.js` se usa internamente en el caso Chronicle, no se exporta en la API pública y el runtime owner-backed limita el dispatch a `chronicle_append`; el guard que lo prohibía en todo el grafo era demasiado amplio y se corrigió en `9d2e6f41a59c46eec6cd019d9c32211b8426f523`.
- `STATUS.md` registra la decisión en commit `128bc1a0ec6b662a8d3269656684008b1923f40e`.
- HEAD conocido al añadir esta nota: `128bc1a0ec6b662a8d3269656684008b1923f40e`; comprobar el HEAD actual y CI antes de afirmar estado de ejecución.
- Próxima tarea: confirmar el workflow completo del SHA final y el job/paso `Run tests`. Si pasa, construir una capacidad real dentro del alcance A, reutilizando los contratos y consultas existentes. No repetir auditorías AB/P cerradas ni recrear la matriz de tests.
- Estado no alterado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`. La decisión A no es aprobación constitucional ni permiso para efectos protegidos.

## Continuidad posterior — primera capacidad pública de planificación (2026-10-22)

- La opción A ya fue aceptada explícitamente y está registrada en `NEXO_NCS/DECISIONS/NCS_M0_E_SCOPE_A_ACCEPTED_2026-10-22.md`. Esta decisión prevalece sobre cualquier sección histórica anterior de este handoff que todavía describa A como pendiente.
- Se implementó `loadNexoMissionPlan(continuityPath, missionId)` en `src/nexo/application/continuity-queries.mjs`, exportada por `src/nexo/application/index.mjs`; se añadió el comando de solo lectura `mission-plan --continuity <ruta> --mission <id>` en `scripts/nexo.mjs`.
- La proyección reconstruye desde una sola revisión canónica, muestra los estados de dependencias por identificador y el estado de planificación, y omite los payloads `target/context`. `dependencies_satisfied` solo significa que las dependencias registradas figuran como completadas: no es un juicio de seguridad, no autoriza ejecución y no equivale a que el paso sea despachable.
- La respuesta conserva `authorization: NOT_EVALUATED` y `dispatchAttempted: false`; la consulta no escribe. El test de entrypoint comprueba API pública estrecha, parser, estado reconstruido, ausencia de payload privado y bytes de Continuity sin cambios.
- Commits de implementación/prueba: `16b374d22da5ce23a4176fa9bb28edd34b0dd8ce`, `da625716c7a10ba36759a43f25dd1abf056ed7b4`, `5509341fa1756f14fbb2e2630b2e1a968dad4fe1`, `ccdb7a189dad7c62170ba5484654a15107fd05bc`. Registro canónico actualizado en `STATUS.md` por commit `c3e4484cbc66e39a8613df4854f9a111c25fc7b0`.
- No se ha declarado CI PASS para el SHA final posterior a la actualización de documentación. Verificar el workflow completo del HEAD real y el paso `Run tests` antes de adjudicar PASS. Si falla, recuperar el log y corregir solo el defecto observado.
- Siguiente unidad de trabajo tras CI: pruebas de planificación para misión inexistente, dependencia no completada y misión bloqueada; todas deben mantener lectura sin mutación, ocultación de payloads y `dispatchAttempted: false`. No crear un dispatcher ni ampliar acciones.
- Estado canónico sin cambios: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## Resultado posterior — planificación diagnóstica con casos negativos (2026-10-22)

- Se amplió la consulta pública `loadNexoMissionPlan` y el comando `mission-plan` con proyección de dependencias; no añade escritura ni dispatch. Una misión bloqueada fuerza el estado de planificación del paso a `blocked`; una dependencia no completada se muestra como `waiting_for_dependencies`; estados de paso que no son `planned` no se promueven a trabajo despachable.
- Casos comprobados en `tests/nexo/entrypoint.test.mjs`: misión completada/reconstruida, obligación PREPARED bloqueada, misión inexistente y dependencia no satisfecha. Los casos verifican payload privado oculto, `authorization: NOT_EVALUATED`, `dispatchAttempted: false` y ausencia de escritura en las consultas.
- CI del SHA de código/pruebas `755617497626fbbad6296a15c308db480d3c5c8a`: [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729261414) SUCCESS; además [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729261229), [canonical mission status projection](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729261253), [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729261262), [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729261275) y [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729261277) SUCCESS en ese mismo SHA.
- STATUS fue sincronizado con estos resultados en commit `fbb72e9640118a4c0416addaca8f7390d66218d7`. Comprobar el HEAD final y CI posterior a este handoff antes de atribuir PASS al SHA documental final.
- Próximo trabajo: no ampliar la superficie pública por inercia. El siguiente paso de capacidad es especificar cómo los objetivos/entradas de planificación se validan mediante contratos existentes y cómo se generan planes sin inventar otra identidad de misión ni confundir análisis con ejecución.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## Continuidad posterior — vista previa de borradores de misión (2026-10-22)

- HEAD de código verificado con CI: `539fe0b1c8145eb63680a4fa944cfdf960b38af1`.
- Se añadió `previewNexoMissionDraft(continuityPath, missionDraft)` a la API pública y el comando `mission-draft-preview --continuity <ruta> --draft <archivo.json>`. El borrador usa el formato de misión ya existente; no se creó otro modelo de datos.
- La vista previa valida mediante `recordNexoMissionInSnapshot` sobre un snapshot candidato en memoria, reconstruye y devuelve orden topológico determinista basado en dependencias. No persiste, no despacha y rechaza un `missionId` que ya esté ligado.
- La respuesta no muestra `target/context`; incluye `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, `persisted: false`. Los tests cubren ordenamiento, ciclo inválido, ID duplicado, payload privado y bytes de Continuity sin cambios.
- CI SUCCESS en el mismo SHA: [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729857071), [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729857067), [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729857092), [canonical mission status projection](https://github.com/snowdenxrp/aldea-ia/actions/runs/39729857208).
- Se observó un fallo intermedio en el test de API pública porque la lista de exportaciones esperadas no incluía la nueva función. Se actualizó la expectativa del test; el SHA final indicado pasó los workflows citados.
- El registro canónico `NEXO_NCS/STATUS.md` se actualizó en commit `9de49ac614ca46000b52880342b2bde2d64bf60d`. Verificar HEAD y CI del commit documental final antes de declararlo validado.
- Próximo trabajo: definir el contrato entre petición/objetivo no confiable y borrador de misión. No conectar todavía un modelo generativo, no permitirle elegir acciones fuera del conjunto contractual y no convertir el preview en persistencia/ejecución sin gate independiente.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.



## Actualización posterior — frontera intención→borrador (2026-10-22)

Se añadió `previewNexoMissionRequest(continuityPath, requestEnvelope)` y `tests/nexo/mission-request-preview.test.mjs`; el test se incorporó a `npm test`. El contrato acepta únicamente `intent` no vacía y `missionDraft` separado, rechaza claves adicionales y usa el validador de borradores existente. La intención es dato no confiable y no se interpreta ni se devuelve. El resultado marca `requestInterpretation: NOT_PERFORMED` y `intentDraftAlignment: NOT_EVALUATED`; no persiste ni despacha. Esta capacidad no afirma traducción semántica. CI SUCCESS para el SHA de código corregido `aa5f450fce70f07d1a5da2e41265c94abb69acf7`: [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39730999092) y [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39730998930). El SHA previo `d0403c96aa243eecb679483322c16acbaf1d7156` falló porque faltaba actualizar la expectativa de exportaciones públicas; se corrigió y ambos workflows pasaron en el SHA indicado.


## Actualización posterior — integración CLI de la frontera (2026-10-22)

- Comando añadido: `node scripts/nexo.mjs mission-request-preview --continuity <ruta> --request <request.json>`. Reutiliza la API de preview y no abre una ruta de dispatch nueva.
- Prueba cubre parser, ejecución del CLI, ocultación de intención/payload privado, `NOT_EVALUATED`, no persistencia y Continuity idéntica antes/después.
- SHA de código: `4e2946712697fd15013e28c4005024b8edebb962`. Cinco workflows SUCCESS en ese SHA: [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731148144), [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731148141), [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731148122), [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731148147), [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731148155).
- El SHA de código anterior `d0403c96aa243eecb679483322c16acbaf1d7156` falló en la aserción de la lista de exportaciones públicas; la expectativa se corrigió en `aa5f450fce70f07d1a5da2e41265c94abb69acf7`, y luego la integración CLI pasó en el SHA posterior indicado. No atribuir los runs de código a un commit documental posterior.
- Límite vigente: no se interpreta intención, no se verifica alineación intención→borrador, no se conecta modelo, no se persiste el borrador y no se despacha acción.


## Actualización posterior — JSON null y salida fail-closed (2026-10-22)

- Se corrigió un defecto real en ambos comandos de preview: `null` se utilizaba como sentinel de error de lectura, de modo que un archivo con JSON válido `null` podía eludir la salida estructurada. Ahora el CLI usa flags separados de fallo de lectura y valida todo JSON que sí se pudo parsear.
- Tests añadidos para `mission-request-preview` y `mission-draft-preview`: JSON `null` debe producir `blocked`, código de salida 1, sin dispatch/persistencia y sin modificar Continuity.
- SHA de código `bb1fe0e33362df36e8145c0e947882717d25328c`; los cinco workflows pasaron en ese SHA: [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731798045), [integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731798037), [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731798067), [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731798051), [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39731798113).
- El cambio no habilita interpretación semántica, persistencia de borradores, ni efectos protegidos. Estado canónico sin cambios.
