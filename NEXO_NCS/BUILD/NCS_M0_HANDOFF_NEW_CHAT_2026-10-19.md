## ACTUALIZACIÓN POSTERIOR — matriz de regresiones del store (2026-10-19)

Documento: [NCS_M0_CONTINUITY_STORE_REGRESSION_MATRIX_2026-10-19.md](NCS_M0_CONTINUITY_STORE_REGRESSION_MATRIX_2026-10-19.md), commit documental `7441784ba216c4c269652f9453e8834dbcf348d2`. También actualizado [STATUS.md](../STATUS.md).

Cruce adicional de tests:
- `tests/nexo/chronicle-runtime.test.mjs` blob `873d38bf7fd19b8c90ec5e48c9fbfec87ffe0777`: cubre PREPARED UNKNOWN sin adapter y varias rutas de no-redispatch tras dispatch.
- `tests/nexo/continuity-contract.test.mjs` blob `5b8f7e9a5fe7084a850fb0bb0d26263e573ca33b`: incluye persistencia PREPARED confirmada y errores de lectura de preparación.
- `tests/nexo/continuity-store.test.mjs` blob `b61df0f7490e7d70ab821300febd680d0e7ed806`: prueba de store inspeccionada.

Pendiente de localizar en la suite completa, sin afirmar que estén ausentes globalmente: commit condicional que falla antes del reemplazo; rename aplicado y respuesta perdida; estado canónico indeterminable tras fallo de escritura; excepción de adquisición no normalizada; error de lectura dentro del commit; liberación `not_owned`. Antes de añadir pruebas, comprobar tests de runtime/contrato/migración para evitar duplicados.

No normalizar todavía la API mixta ni modificar runtime. No introducir timeout/BUSY ni recuperación automática por conveniencia. No se editaron runtime/tests y no se ejecutó CI nuevo para este checkpoint documental. No atribuir los workflows históricos al HEAD documental actual.

Estado invariable: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.

---

# NCS — HANDOFF COMPLETO PARA CHAT NUEVO (2026-10-19)

## CHECKPOINT FINAL PARA EL SIGUIENTE CHAT — prevalece sobre notas anteriores (2026-10-19)

**Misión única: M0.** No reiniciar investigación; no cambiar a M1 ni STEP 7 como trabajo principal.

### HEAD y estado de evidencia
- HEAD de referencia antes de cerrar este handoff: `2cf14a2d8b68f441da2c4b76d1170fb319ef9d2f` (`docs(ncs): extend caller review through dispatch gates`). Después se guardaron commits documentales para este checkpoint; consulta la rama `ncs-clean-architecture` para el HEAD exacto vigente. Estos commits sólo cambian documentación, no runtime/tests. Los tests y cinco workflows SUCCESS del vector cross-process siguen vinculados a SHA `6f0499142781e24c55d1adf137170323c8d1afbf`, no al HEAD documental.
- Evidencia CI: persistencia [39347061453](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061453), M0 integrado [39347061416](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061416), admisión/continuidad [39347061419](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061419), STEP 4 [39347061426](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061426), STEP 5 [39347061501](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061501): SUCCESS en el SHA de test indicado. No afirmar que se ejecutó CI nuevo para los commits documentales.

### Resultado más reciente de revisión estática
- `acquireLock()` puede esperar sin resultado acotado cuando el lock existe y el PID propietario sigue vivo.
- El test de concurrencia existente depende de la serialización: dos commits con la misma revisión esperada producen un `committed` y un `conflict`. No introducir `BUSY` inmediato sin contrato explícito y pruebas de callers.
- Se revisaron los cinco call sites ejecutables de `store.commitIfCurrent()` en `continuity-owner.mjs`, el servicio de apertura y rutas superiores en `owner-backed-runtime.mjs`, `chronicle-append.mjs` y `continuity-queries.mjs`.
- Evidencia positiva de fail-closed en las rutas revisadas: una excepción de `recordPrepared()` produce `unknown`, `preparedCommitted: UNKNOWN` y `dispatchAttempted: false`; fallos de persistencia posteriores al dispatch se traducen en `unknown` con `redispatchAuthorized: false`; fallos de admisión segura bloquean dispatch; errores de consulta quedan `blocked` sin mutación.
- Importante: **no se observó un bypass de redispatch en las rutas revisadas**. El riesgo de introducir un nuevo resultado `BUSY` o cambiar excepciones por objetos de resultado es contractual: callers que comparan `status` podrían tratarlo distinto. La inspección es estática y parcial, no una prueba exhaustiva de todas las entradas.

### Archivos que el siguiente chat debe leer primero
1. `NEXO_NCS/STATUS.md` — puerta oficial de entrada; leerlo, pero notar que su checkpoint visible aún antecede a las dos revisiones de contrato/callers.
2. Este handoff: `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEW_CHAT_2026-10-19.md` — este bloque es el checkpoint más reciente.
3. `NEXO_NCS/BUILD/NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md`.
4. `NEXO_NCS/BUILD/NCS_M0_CONTINUITY_STORE_CALLER_ERROR_PROPAGATION_REVIEW_2026-10-19.md`.
5. `NEXO_NCS/BUILD/NCS_M0_LOCK_RELEASE_FAILURE_REVIEW_2026-10-19.md`.
6. Sólo si se necesita ampliar una ruta concreta: inspeccionar código y tests actuales en la rama; no volver a buscar familias de autoridad ni repetir auditorías cerradas.

### Instrucciones operativas para el siguiente chat
1. Abrir con el keyword exacto `NCS` y continuar desde este handoff.
2. Confirmar branch HEAD y que los archivos citados existen; no dar por hecho que un SHA de CI es el HEAD actual.
3. Continuar el mapa estático de entrypoints/callers de continuidad y de cada resultado de persistencia; centrarse en contrato de error, tratamiento de UNKNOWN y gate de dispatch. No cambiar runtime hasta que el mapa permita definir una política coherente.
4. No añadir timeout arbitrario, `BUSY`, cancelación, lease, heartbeat, takeover ni eliminación automática de lock. Primero determinar si ya existe un deadline/cancelación de nivel superior y cuáles son los requisitos de progreso; si no existen, documentarlo como requisito abierto.
5. Si se propone un cambio, describir la semántica pública exacta y diseñar tests para cada caller antes de implementarlo. Preservar: PREPARED confirmado antes de dispatch; UNKNOWN no autoriza redispatch; persistencia y liberación de lock son resultados distintos; lock ajeno no se elimina.
6. Tras cualquier cambio de runtime/tests, ejecutar CI y registrar SHA exacto → runs → jobs/resultados → interpretación. Después actualizar STATUS y handoff; si sólo cambian docs, decirlo explícitamente.
7. No reabrir cierres históricos sin un fallo nuevo y reproducible; no exigir PC/compra/instalación; no mezclar Nexo con Lúmina.

### Estado constitucional invariable
`M0 = INCOMPLETO`; `authorization = NOT_EVALUATED`; efectos protegidos = `STOP`; raíz legítima = `PENDING/UNKNOWN`. La llave física no bloquea el trabajo restante de M0.
 
---

## ACTUALIZACIÓN — propagación de errores revisada parcialmente (2026-10-19)

Documento: [NCS_M0_CONTINUITY_STORE_CALLER_ERROR_PROPAGATION_REVIEW_2026-10-19.md](NCS_M0_CONTINUITY_STORE_CALLER_ERROR_PROPAGATION_REVIEW_2026-10-19.md), revisión estática sin cambios de runtime/tests.

Hallazgos: los cinco call sites ejecutables de `store.commitIfCurrent()` en `continuity-owner.mjs` no comparten una única política de errores: cuatro devuelven/proyectan resultados sin catch local; la ruta de observación/reconciliación captura excepciones y devuelve `blocked` con incertidumbre. `openNexoContinuityOwner()` convierte resultados no aceptables de `initialize()` en error de apertura. Por tanto, normalizar o añadir `BUSY` sólo dentro del store puede cambiar contratos aguas arriba y el tratamiento de incertidumbre.

Siguiente paso: completar el mapa de entrypoints/callers superiores y definir el contrato público de errores antes de cambiar adquisición. La revisión de lock sigue recomendando no introducir timeout arbitrario ni reclamación automática. CI de runtime continúa anclado al SHA `6f0499142781e24c55d1adf137170323c8d1afbf`; estas revisiones son documentales.

## ACTUALIZACIÓN — revisión del contrato de contención del lock (2026-10-19)

Documento nuevo: [NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md](NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md), commit documental `3f7ab36bae416d770fe4bf28210ad50847242c50`.

Hallazgos del código revisado:
- `acquireLock()` espera en bucle si hay un lock no stale. La prueba cross-process observó la espera y la reanudación tras la retirada explícita del lock.
- La regresión `Promise.all` de dos commits con la misma revisión espera que la serialización produzca un `committed` y un `conflict`. Por eso cambiar a fallo inmediato BUSY alteraría el contrato observable y no es un cambio inocuo.
- Hay una asimetría: `initialize()` normaliza errores generales de adquisición a `status: failed`, mientras `commitIfCurrent()` normaliza ENOENT/ENOTDIR y puede propagar otros errores de infraestructura. Esto queda como cuestión contractual; no se corrigió por intuición.
- Recomendación actual: no cambiar runtime todavía. No añadir timeout arbitrario, BUSY, cancelación, lease, heartbeat ni recuperación automática hasta revisar callers/deadlines y el riesgo de redispatch. El bloqueo de progreso permanece explícito.

La revisión fue documental; no cambió runtime/tests y no generó nuevos resultados CI. Los cinco workflows SUCCESS citados siguen ligados al SHA de test `6f0499142781e24c55d1adf137170323c8d1afbf`, no al HEAD documental.

**Misión invariable: M0.** Este documento es la continuidad de trabajo para abrir un chat nuevo. Leer primero `NEXO_NCS/STATUS.md`, después este handoff y los documentos concretos enlazados aquí. No reiniciar investigación ni volver a auditar cierres sin un fallo nuevo y reproducible.

## ACTUALIZACIÓN POSTERIOR — 2026-10-19 (prevalece sobre notas anteriores de CI)

La incertidumbre de CI del vector ya está cerrada para el commit de integración `4c0cec1833842103f21194b1f4a3ebdfe168181d`:

- Suite completa `npm test`: [run 39342543741](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543741), job `tests`, paso `Run tests` = SUCCESS.
- M0 integrado: [run 39342543894](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543894), cinco grupos SUCCESS.
- Chronicle vertical: [run 39342543925](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543925) SUCCESS.
- Admisión/continuidad tras reinicio: [run 39342543933](https://github.com/snowdenxrp/aldea-ia/actions/runs/39342543933) SUCCESS.

La suite completa ejecutó `tests/nexo/root-bootstrap-protocol.test.mjs` porque está conectado a `npm test` en ese SHA. La rama luego avanzó a `e795a79ed7faaae6f7218a6bd3f67aacafcb6698` mediante 15 commits que, según compare de GitHub, modificaron únicamente cinco archivos Markdown; no hubo cambios de código/test posteriores a `4c0cec...`. No llamar al run un test literal del SHA documental HEAD.

**Instrucción operativa nueva:** la llave física no bloquea el resto de M0. Continuar con continuidad, recuperación, no-redispatch, límites de acciones y límites de despliegue del store. Sólo fingerprint independiente y prueba de hardware esperan a la llave.

Documento de carril paralelo: [NCS_M0_NON_ROOT_CONTINUATION_TRACK_2026-10-19.md](NCS_M0_NON_ROOT_CONTINUATION_TRACK_2026-10-19.md).

La matriz preliminar de aceptación del store también quedó creada: [NCS_M0_CONTINUITY_STORE_DEPLOYMENT_ACCEPTANCE_MATRIX_DRAFT_2026-10-19.md](NCS_M0_CONTINUITY_STORE_DEPLOYMENT_ACCEPTANCE_MATRIX_DRAFT_2026-10-19.md). No es cierre de aceptación: las propiedades de despliegue no reclamadas por el store permanecen PENDING.

**Actualización: hipótesis de lock-release reproducida y corrección comprobada por CI.** Véase [NCS_M0_LOCK_RELEASE_FAILURE_REVIEW_2026-10-19.md](NCS_M0_LOCK_RELEASE_FAILURE_REVIEW_2026-10-19.md). SHA final probado: `539bcc4cf98dbc33a73140bde7cf18a4374c68c0`. Persistencia [run 39345507299](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507299), aceptación M0 [run 39345507269](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507269), admisión/continuidad [run 39345507268](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507268), STEP 4 [run 39345507248](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507248) y STEP 5 [run 39345507252](https://github.com/snowdenxrp/aldea-ia/actions/runs/39345507252) SUCCESS. La limpieza transitoria se reintenta una vez y se reporta. Si falla persistentemente, la API devuelve `status: failed` y `persistenceStatus` para distinguir que el envelope sí quedó guardado, sin entregar un éxito que pueda habilitar dispatch; los siguientes intentos del mismo proceso fallan cerrados. El lock persistente requiere recuperación explícita.

**Nueva caracterización cross-process (SHA `6f0499142781e24c55d1adf137170323c8d1afbf`):** cinco workflows SUCCESS: persistencia [39347061453](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061453), M0 integrado [39347061416](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061416), admisión/continuidad [39347061419](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061419), STEP 4 [39347061426](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061426), STEP 5 [39347061501](https://github.com/snowdenxrp/aldea-ia/actions/runs/39347061501). La prueba usa un proceso hijo real: el PID dueño del lock sigue vivo, el hijo no termina mientras el lock existe y completa el commit al retirarlo. Esto caracteriza la ausencia actual de un resultado acotado de contención, no autoriza todavía a tratarlo como defecto que se arregla con timeout. No se tocó runtime; la siguiente decisión es definir contrato de adquisición bajo lock ocupado/propietario vivo y recuperación, sin borrar locks de otro proceso ni inventar un timeout. La primera iteración de la prueba falló por el formato del script hijo; el test se corrigió y los cinco workflows SUCCESS corresponden al SHA final indicado.

La revisión del carril independiente confirmó que el store ya declara límites explícitos: sin afirmación de fsync/durabilidad ante pérdida de energía, sin protección anti-rollback, sin resistencia reclamada a symlink/path attacks y sin soporte de filesystem distribuido. No agregar infraestructura ni parches antes de fijar la propiedad requerida y su modelo de amenaza.

Estado invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz `PENDING/UNKNOWN`.

---

## 1. Repositorio y reglas de trabajo

- Repositorio: `snowdenxrp/aldea-ia`.
- Rama: `ncs-clean-architecture`.
- Entrada operativa: `NEXO_NCS/STATUS.md`.
- Estructura preferida: `MASTER/ CORE/ BUILD/ RESEARCH/ DECISIONS/ PROOF/ STATUS`; STATUS es la puerta de entrada.
- Principio: Nexo no se mezcla con Lúmina. Modelo ≠ Nexo; OS ≠ Nexo; dispositivo ≠ Nexo; Lúmina ≠ Nexo.
- No inventar raíces, credenciales, IDs, tokens, epochs, colas, quorums, recuperaciones o pruebas que no existan. No convertir datos suministrados por el caller en evidencia de autoridad.
- Evidencia: trigger → run → job → SHA → artefacto/log → interpretación. Un resultado no observado o sin vínculo suficiente queda UNKNOWN/PENDING, nunca PASS.
- Arquitectura limpia; no apilar parches. Si el cambio revela un defecto de raíz, detenerse y resolver la causa.
- No requerir PC, impresora, instalaciones o compras para continuar si el siguiente paso se puede ejecutar desde el repo/CI. El usuario trabaja principalmente desde Android.
- El usuario delega decisiones técnicas de ejecución, pero no se deben dar decisiones de arquitectura por aceptadas si no están documentadas y justificadas.
- No repetir la misma explicación ni reabrir auditorías cerradas sin evidencia nueva.

## 2. Decisión nueva aceptada en este chat: raíz única y un dispositivo inicial

Documento canónico:
`NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md`

URL:
https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/DECISIONS/NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md

Blob SHA verificado: `dfb647d07cb28178b3c8a3a8289d8209943db8fd`. Commit documental registrado al crearla: `f6894c51b5a0aa1ced848ab1481ecd40ab995d5d`.

Decisión aceptada:
1. La primera versión de Nexo tendrá **una llave raíz criptográfica de bootstrap** para iniciar el reconocimiento de la autoridad legítima.
2. Se construirá inicialmente para **un solo dispositivo**. No implementar ahora coordinación ni sincronización multi-dispositivo.
3. La pérdida irrecuperable de la única llave puede dejar Nexo inaccesible. Recuperación avanzada, múltiples raíces/dispositivos y sucesión quedan fuera del alcance inicial. No fingir recuperación desde snapshots, cuenta, modelo, teléfono, OS o proveedor.
4. La llave **no** concede autorización ilimitada. Cada operación protegida necesita autorización acotada, vigencia/revocación y enforcement en la última frontera antes del efecto.
5. La llave física/modelo, protocolo y procedimiento de provisión todavía **no están seleccionados, adquiridos ni configurados**. La decisión es de alcance, no evidencia de implementación.
6. Esta decisión reduce el alcance, no reinicia M0. Los contratos y pruebas existentes se conservan.
7. No tratar el teléfono ni el modelo como raíz por defecto. Estado restaurado no puede autenticarse a sí mismo.
8. Multi-dispositivo, sucesión y recuperación avanzada son requisitos futuros, no bloqueos para la primera versión.

## 3. Estado de M0 — verdad vigente

- **M0 global: INCOMPLETO.**
- **Efectos protegidos: STOP.**
- **Autoridad de runtime: NOT_EVALUATED.**
- Nexo y Lúmina permanecen separados.
- No declarar Nexo listo ni habilitar efectos protegidos por un PASS de pruebas de regresión.

### CI integrado observado

- Gate integrado de aceptación: [run 39291344910](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291344910), SHA probado `c57be8aa6fd7e558d870c3e46feab741637b4314`, workflow `.github/workflows/nexo-m0-acceptance.yml`. Cinco grupos SUCCESS: admisión/store, reconstrucción/transición protegida, Chronicle/entrypoints, crash cuts/recuperación de propietario y goal verification/outcome classification.
- Transparencia de Chronicle: [run 39292887874](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887874), SHA probado `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`; workflow integrado SUCCESS. Chronicle específico [run 39292887749](https://github.com/snowdenxrp/aldea-ia/actions/runs/39292887749) también SUCCESS.
- Estos PASS son para los tests y SHAs enumerados. No demuestran raíz constitucional, autorización legítima, durabilidad física general ni integridad contra todo rollback/tampering.
- La API pública de Chronicle conserva explícitamente `authorization: "NOT_EVALUATED"` en resultados normalizados, rechazos tempranos y conflicto de admisión. Código vinculado a commits `aa8509e75dd7925189d54b2667bcdd2ae27e6647` y `2faf2b988c676dc907c9322f5e63be36200af97b`; regresión `8d4583d8a8074b2993e77faa3770d7abcfe7b6ae`.
- La corrección de integración de `reconstructNexoMissionFromSnapshot()` está en `82f1204ae4e9298163231ab7a323233ad87777b8`; devuelve misión directamente o null. PASS focal observado en [run 39265121361](https://github.com/snowdenxrp/aldea-ia/actions/runs/39265121361).
- Workflow Chronicle con integración de entrypoint: [run 39291153543](https://github.com/snowdenxrp/aldea-ia/actions/runs/39291153543), SHA `7f83195657df829d993226cf909c8f76f655d23b`, SUCCESS.

## 4. Documentos existentes que se deben reutilizar

1. Estado principal: `NEXO_NCS/STATUS.md`.
2. Handoff previo: `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-19.md` (blob SHA observado `c2089523abe4a40da3c12314c9cc1a0f4dcba5ee)).
3. Brecha de autoridad: `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_ADMISSION_GAP_2026-10-19.md` (SHA `050e9e8c172f4f42c2b39149e71b439876ccfc02`).
4. Borrador semántico de composición de autoridad: `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md` (blob SHA observado `dd425b6c362f6dcece2f25685afb32e9fe7731d9`; corrección de contenido documentada en commit `c83a864232793e963a7a99fb88fc313f4f1a48ca)).
5. Inventario de claims y dominios de fallo: `NEXO_NCS/BUILD/NCS_M0_DEPLOYMENT_CLAIM_FAILURE_DOMAIN_INVENTORY_2026-10-19.md` (commits `194c6b8868e4632dfb909b14112ca19f10e28fe6` y `5aeb504d0d324030f0db2966c54bdb59cfdda5fd`).
6. Comparación preliminar de familias de reconocimiento: `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_RECOGNITION_FAMILY_COMPARISON_PRELIMINARY_2026-10-19.md` (commit `d8108ae84d965dce0b3008f7aed56a22ca3f32f5)); **solo referencia**, no volver a investigar familias de forma genérica.
7. Criterios ejecutables M0: `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_EXECUTABLE_2026-10-19.md`.

## 5. Brecha arquitectónica de autoridad ya confirmada

- `createNexoContinuityOwner()` no recibe ni valida una raíz, principal autenticado, decisión de autorización o época/fencing de autoridad.
- Algunos resultados públicos devuelven explícitamente `authorization: "NOT_EVALUATED"`.
- `executeNexoStepWithContinuityOwner()` comprueba capacidades y readiness, pero no prueba autorización legítima del propietario antes de PREPARED/dispatch.
- `runNexoChronicleAppend()` es una ruta local de persistencia/replay, no prueba una ruta de efecto protegido autorizada por raíz constitucional.
- Capacidad técnica ≠ autorización. Misión ejecutable ≠ propietario legítimo. Settlement consistente ≠ permiso. Tests PASS ≠ autoridad constitucional.
- No crear `createConstitutionAuthorityContext(input)` ni equivalente si solo convierte campos no autenticados del caller en prueba. No simular una raíz ni autorización con fixtures que afirman `AUTHORIZED`.
- No conectar Chronicle con efectos externos, financieros, irreversibles, reparación de estado externo o cambios constitucionales.
- El contrato semántico distingue: ROOT COMPOSITION → CURRENT AUTHORITY → AUTHORIZATION DECISION → PROTECTED EFFECT ADMISSION → EFFECT OUTCOME/RECONCILIATION. Cada capa necesita evidencia propia.
- Reutilizar los vocabularios canónicos existentes: bootstrap `ESTABLISHED / UNKNOWN / INVALID`; condiciones de recuperación `AUTHORITY_UNAVAILABLE / AUTHORITY_UNRESOLVED`; y distinción de autorización `STALE / REVOKED`. No crear un enum agregado ni estados nuevos por conveniencia.
- En la frontera final, falta demostrar vigencia y enforcement de revocación; validar al inicio y reutilizar permiso indefinidamente no basta. UNKNOWN o revocación/frescura no demostrada ⇒ STOP.

## 6. Próximo paso exacto — continuar M0 sin desviarse

La última revisión de `STATUS.md` marca como siguiente trabajo comprobar la coherencia entre misión persistida, pasos y reconstrucción/proyección. **Antes de tocar más código, recuperar el estado real de CI para `continuity-queries.mjs` y su regresión**:

1. La regresión de `continuity-queries.mjs` quedó validada dentro de la suite completa en SHA exacto `f0fcf181778a61c8ad094b315289f5f43c1abe8f`, [run 39339904741](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904741), y en el gate integrado [run 39339904658](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904658). El workflow de admisión también pasó [run 39339904645](https://github.com/snowdenxrp/aldea-ia/actions/runs/39339904645).
2. El run específico anterior [39323179028](https://github.com/snowdenxrp/aldea-ia/actions/runs/39323179028) falló en un SHA anterior; no lo ocultar. La suite completa actual ejecutó la prueba de entrypoint y pasó en el HEAD indicado.
3. La consulta compara una sola lectura canónica y expone `persistedMissionStatus`, `missionStatus` y `statusDiscrepancy`, sin filtrar `target/content` ni escribir el store. La diferencia significa desigualdad literal, no siempre corrupción: el status guardado puede ser una claim del plan y la reconstrucción depende de outcomes/journal canónicos.
4. Se ensayó un guard de admisión que rechazaba pasos `completed` sin outcome; el workflow existente lo refutó en `continuity-migration.test.mjs:801`. Se revirtió: **no confundir admisión con verificación del resultado**. La regresión que bloquea claims terminales sin outcome se conserva.
5. El siguiente borrador de diseño ya está en la sección 9 de `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md`: define provisión independiente, desafío firmado y separación entre prueba de llave, autoridad vigente, autorización y enforcement. `npm test` pasó en SHA exacto `174097b9b1afe8448a1761f5b5e3c2d8c5c620a2`, [run 39340297296](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340297296).
6. Próximo paso acotado: determinar qué fuente/procedimiento real puede provisionar y verificar el fingerprint de la llave de forma independiente del store. No elegir hardware ni afirmar que hay llave configurada sin evidencia. Si la fuente independiente no está disponible, documentar el bloqueo y dejar implementación en STOP; no volver a comparar familias de raíz de forma general.
7. La brecha de autoridad sigue bloqueando activación. Mantener `authorization: NOT_EVALUATED`, M0 INCOMPLETO y efectos protegidos STOP.

## 7. No repetir / no hacer

- No volver a M1, STEP 7 ni investigación amplia de raíz como tarea principal.
- No reabrir auditorías cerradas sin un fallo nuevo, específico y reproducible.
- No declarar que una llave física ya fue comprada, seleccionada o configurada.
- No tratar el teléfono, OS, modelo, proveedor, store, snapshot o una prueba generada por caller como raíz por defecto.
- No inferir autorización de Chronicle, de settlement, de `completed`, de coherencia de replay ni de CI PASS.
- No implementar multi-dispositivo, sucesión o recuperación avanzada dentro del alcance inicial.
- No cambiar la misión: **M0 es la meta**.

## 8. Estado al cierre de este handoff

**M0: INCOMPLETO. Autoridad: NOT_EVALUATED/PENDING. Efectos protegidos: STOP. Nexo/Lúmina: separados.**  
Nueva decisión de alcance guardada en DECISIONS. Próxima acción operativa: verificar CI real de mission-status/continuity-queries, luego seguir la siguiente frontera M0 con evidencia, sin reiniciar investigación.


## Nuevo contrato de diseño para continuar

La sección 9 de [NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md](./NCS_M0_AUTHORITY_COMPOSITION_SEMANTIC_CONTRACT_DRAFT_2026-10-19.md) contiene el protocolo mínimo de raíz única. Es un borrador, no código ni evidencia de autoridad. El último SHA de código/documentación verificado por suite completa es `174097b9b1afe8448a1761f5b5e3c2d8c5c620a2`, run [39340297296](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340297296), SUCCESS.


## Validación más reciente para continuar M0 (2026-10-19)

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


## Bloqueo de provisión raíz — siguiente frontera M0

## M0 — bloqueo explícito de provisión independiente de la raíz (2026-10-19)

- Documento de bloqueo: [NCS_M0_ROOT_PROVISIONING_SOURCE_BLOCKER_2026-10-19.md](./NCS_M0_ROOT_PROVISIONING_SOURCE_BLOCKER_2026-10-19.md).
- **Conclusión limitada a la evidencia actual:** no está demostrado un canal/procedimiento independiente para provisionar el fingerprint real de la única llave raíz. Esto no afirma que sea imposible; significa que no existe evidencia suficiente para implementarlo como si estuviera resuelto.
- No hay llave física seleccionada/adquirida/configurada ni pin real con procedencia independiente verificada. El teléfono, OS, modelo, cuenta/repositorio, snapshot y store de continuidad no se aceptan como raíz por defecto.
- No implementar verificador ni escoger hardware por inferencia. La puerta de salida exige fuente independiente disponible, procedimiento de pin reproducible, vector criptográfico, desafío fresco/replay tests, revocación vigente y enforcement en la frontera real.
- La suite completa `npm test` pasó en SHA `846f1ca5ff5b194ecd22e097f303964873184bce`, [run 39340435744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340435744). El HEAD documental posterior sólo añade documentación; la validación de software no demuestra autoridad del propietario.

**Estado:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`. Siguiente paso: conseguir evidencia de una fuente independiente real o mantener este bloqueo explícito. No volver a M1/STEP 7.

---


## M0 — decisión de alcance PREPARED receipt (2026-10-19)

- Decisión registrada: [NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md](../DECISIONS/NCS_DECISION_PREPARED_RECEIPT_SAME_PROCESS_TRUST_BOUNDARY_2026-10-19.md).
- El adaptador genérico y su `executePrepared()` son interfaces internas de la misma base de confianza; no son una sandbox contra JavaScript arbitrario en el mismo proceso. Bloquear sólo un recibo fabricado no arreglaría ese modelo: el consumidor con acceso al adaptador también puede registrar handlers o llamar a `execute()`.
- Se cierra la ambigüedad documental como decisión de alcance, no como PASS de seguridad ni como cambio de runtime. La composición owner-backed mantiene sus regresiones de PREPARED/settlement/no-redispatch. No se añade segundo journal, booleano de autenticidad ni callback auto-verificador.
- No hay evidencia de un caller de producción actual para el runtime legacy de Lúmina; no describirlo como ruta protegida activa.
- **Sin cambio constitucional:** M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz `PENDING/UNKNOWN`. La provisión independiente de la raíz sigue siendo un bloqueo separado.

---


## Addendum — candidato técnico identificado, sin disponibilidad ni prueba (2026-10-19)

La revisión de fuentes oficiales identifica una ruta candidata concreta: **llave física con PIV/NFC usando YubiKit para Android**, con YubiKey 5 NFC como ejemplo compatible según documentación de Yubico. Esto reduce la incertidumbre técnica, pero **no cierra el bloqueo**: no hay evidencia de adquisición, integración en Nexo ni prueba en el POCO X7 Pro. Tampoco existe aún un fingerprint provisionado independientemente del store de continuidad.

Evaluación y fuentes: [NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md](./NCS_M0_ROOT_KEY_CANDIDATE_FEASIBILITY_2026-10-19.md).

No seleccionar automáticamente el hardware, no instalar dependencias ni generar código de integración antes de confirmar disponibilidad y compatibilidad real. Android Keystore/StrongBox tampoco se presume disponible: requiere verificar attestation/nivel de seguridad en el dispositivo concreto. M0 sigue INCOMPLETO, autoridad NOT_EVALUATED y efectos protegidos STOP.


## M0 — perfil criptográfico de bootstrap redactado, pendiente de provisión (2026-10-19)

- Borrador: [NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md](./NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md).
- Se propone un perfil preciso para revisión: P-256/ECDSA-SHA256, SPKI DER con fingerprint SHA-256, desafío CSPRNG de 32 bytes y mensaje con dominio `NEXO-ROOT-BOOTSTRAP-V1\0`. Es especificación documental, no código ni vector validado.
- El pin/fingerprint independiente sigue sin ceremonia aceptada; hardware candidato no adquirido/probado. No escribir aún el verificador de producción ni conectar la firma a dispatch.
- Próxima puerta: cerrar provisión del pin, confirmar disponibilidad/compatibilidad de hardware, crear vector criptográfico reproducible y pruebas negativas; después CI y prueba física. M0 INCOMPLETO; autoridad NOT_EVALUATED; efectos protegidos STOP.


## M0 — vector criptográfico preliminar verificado (2026-10-19)

- El borrador [NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md](./NCS_M0_ROOT_BOOTSTRAP_CRYPTO_PROTOCOL_DRAFT_2026-10-19.md), sección 8, contiene un vector de verificación P-256/ECDSA-SHA256: SPKI DER, fingerprint SHA-256, mensaje canónico, firma DER y resultados negativos.
- Validación local observada con Node.js v22.16.0: firma válida `true`; desafío alterado, firma alterada y clave pública distinta `false`. **No es CI, no es hardware real y no valida el canal de provisión.**
- Siguiente paso técnico acotado: convertir el vector en test automatizado/CI; en paralelo, cerrar el procedimiento independiente del pin y confirmar disponibilidad/compatibilidad del hardware candidato. No conectar el perfil a dispatch ni habilitar efectos.
- Estado invariable: M0 INCOMPLETO; `authorization: NOT_EVALUATED`; efectos protegidos STOP; raíz legítima PENDING/UNKNOWN.


## M0 — vector integrado en `npm test`; CI de este SHA pendiente (2026-10-19)

- Test añadido: [root-bootstrap-protocol.test.mjs](../../tests/nexo/root-bootstrap-protocol.test.mjs) en el repositorio y conectado al script `npm test` de `package.json`.
- Commit de integración del test: `4c0cec1833842103f21194b1f4a3ebdfe168181d`; en el momento de la comprobación, la rama coincidía exactamente con ese commit. Los commits posteriores observados son documentales; no se ha observado CI completo para el test nuevo.
- La misma lógica del vector se ejecutó localmente con Node.js v22.16.0: caso positivo PASS; desafío modificado, firma alterada, clave distinta y firma truncada rechazados. **No afirmar todavía PASS de CI en el SHA nuevo**: falta observar la ejecución completa del workflow.
- La suite completa anterior sigue siendo PASS sólo para el SHA `846f1ca5ff5b194ecd22e097f303964873184bce`, run [39340435744](https://github.com/snowdenxrp/aldea-ia/actions/runs/39340435744). Los cambios posteriores incluyen documentación más el test y su inclusión en `npm test`; la suite del HEAD actual debe confirmarse.
- Después del CI: mantener como pendiente la provisión independiente del pin y la prueba en hardware real. M0 INCOMPLETO; autoridad NOT_EVALUATED; efectos protegidos STOP.



---

## Addendum — matriz del contrato público de errores (2026-10-19)

- Documento nuevo: [NCS_M0_CONTINUITY_STORE_PUBLIC_ERROR_CONTRACT_MATRIX_2026-10-19.md](NCS_M0_CONTINUITY_STORE_PUBLIC_ERROR_CONTRACT_MATRIX_2026-10-19.md), commit `3df670e5e5ebb1d2a78b23a5331c7a78b6134085`.
- `STATUS.md` actualizado para que este checkpoint sea la puerta visible más reciente; commit documental `5280ce4f8f86a1e3d8971802b0a2d7a3b4f77113`.
- El documento define semántica mínima para persistencia confirmada, conflicto, fallo conocido, incertidumbre, contención, lock stale y persistencia confirmada con fallo de liberación. No modifica runtime/tests ni afirma CI nuevo.
- Siguiente paso: completar inventario de callers y sus ramas exactas de excepción/resultado. La revisión previa es parcial y estática; no se observó bypass de redispatch en las rutas inspeccionadas. No convertir ese alcance en una garantía exhaustiva.
- No normalizar todavía la API ni introducir `BUSY`, timeouts, cancelación o recuperación automática. Elegir sólo después del mapa de callers y las regresiones requeridas.
- Los runs CI previos pertenecen a sus SHAs documentados; no se atribuyen a estos commits documentales.
- Estado invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima `PENDING/UNKNOWN`.


## Addendum 2 — inventario de callers completado de forma acotada (2026-10-19)

- Documento: [NCS_M0_CONTINUITY_STORE_CALLER_INVENTORY_2026-10-19.md](NCS_M0_CONTINUITY_STORE_CALLER_INVENTORY_2026-10-19.md), commit `5ebf2b081660d16ca026163728185bad2fc21f7a`.
- `STATUS.md` ahora pone este checkpoint en la parte superior; commit documental `1a58dace9c81544c06683573a2eda9f470fbd7ef`.
- La revisión identifica cinco llamadas ejecutables a `store.commitIfCurrent()` en `continuity-owner.mjs`; distingue las que propagan excepción de `reconcilePrepared()`, que captura y devuelve incertidumbre. Documenta también apertura/bootstrap, preflight Chronicle, consultas read-only y gates de dispatch.
- No se observó bypass de redispatch en las rutas revisadas. El alcance sigue siendo estático y acotado, no un inventario universal del repositorio.
- Próxima acción: diseñar la matriz de regresiones para la política elegida de errores y de contención. No cambiar runtime hasta definir el contrato observable. No añadir `BUSY`, timeout, cancelación ni recuperación automática sin decisión y pruebas específicas.
- No hay CI nuevo para estos commits documentales. Los runs previos siguen vinculados a sus SHAs originales.
- Estado invariable: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz `PENDING/UNKNOWN`.
