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
