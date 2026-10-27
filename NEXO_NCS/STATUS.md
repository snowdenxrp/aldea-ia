## DELTA — ESTADO DE DECISIONES P-01 RECONCILIADO (2026-10-27)

- Nueva nota: `NEXO_NCS/BUILD/NCS_M0_P01_DECISION_STATE_RECONCILIATION_2026-10-27.md`, commit `59fa87ba1569915fb88d9cd571e0298e04bb1139`.
- Inventario actualizado con sección 26, commit `870aea69f71beeafb30173f00bcdb2b462198d65`.
- A (alcance acotado no autoritativo) y B (inicialización explícita separada del commit normal) están aceptadas como decisiones de diseño en sus respectivos ámbitos. Eso no cierra P01-C: protocolo operacional, quiescencia, exclusión efectiva, resultado observable y reconciliación permanecen pendientes.
- Gates intactos: M0 INCOMPLETO; P-01 OPEN/UNKNOWN; D0/D1/D2/D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; raíz PENDING/UNKNOWN; authorization NOT_EVALUATED; efectos protegidos STOP.
- Solo documentación; no runtime/tests/workflows/configuración, ni pruebas/CI/Actions ejecutados.

---

## DELTA — ENLACES DOCUMENTALES P-01 VERIFICADOS (2026-10-27)

- Nota de enlace creada: `NEXO_NCS/BUILD/NCS_M0_P01_DOCUMENTATION_LINKAGE_CHECKPOINT_2026-10-27.md`, commit `06fd872814b77f5fdd3c5426fda9d1e2a93c3aa1`.
- Inventario actualizado con sección 25, commit `70f379157da723096da9a4f9201b3febe66586a9`; indexa la nota de enlace y aclara el estado del intento previo.
- La Opción A de alcance y la Opción B de procedimiento son ejes diferentes. P-01 sigue OPEN/UNKNOWN; M0 INCOMPLETO; D1-IMPLEMENTATION NO AUTORIZADA; raíz PENDING/UNKNOWN; efectos protegidos STOP.
- Solo documentación: no se cambiaron runtime/tests/workflows/configuración ni se ejecutaron pruebas, CI o Actions.

---

## DELTA — P-01: MATRIZ DE DECISIONES INDEPENDIENTES (2026-10-27)

- Nuevo artefacto: `NEXO_NCS/BUILD/NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md`, commit `422342da2ce830fe736c9b675435508f4a24fe5a`. Divide P-01 en ocho dimensiones: objeto/no autoridad; aislamiento operacional; procedimiento/quiescencia; creación exclusiva; clasificación de estado; UNKNOWN/reconciliación; autoridad canónica; y pruebas/SHA.
- Inventario §24 indexa la matriz, commit `256703c664db7721ff5af8cce10f34334799b16b`.
- La matriz separa preguntas que no se sustituyen entre sí: creación exclusiva ≠ quiescencia; store committed ≠ autoridad; UNKNOWN ≠ retry; evidencia estática ≠ prueba end-to-end.
- P-01 continúa OPEN/UNKNOWN; M0 INCOMPLETO; D1/D2/D3 sin cambio; implementación NO AUTORIZADA; raíz PENDING/UNKNOWN; efectos protegidos STOP. No se modificaron runtime/tests/workflows/configuración ni se ejecutaron pruebas/CI/Actions.

---

## DELTA — P-01 CRUZADO CONTRA LA LÍNEA DE META M0 (2026-10-27)

- Inventario §23, commit `3e41901569e0af3ce5dfb25973c0a4934e8bfd8c`: mapea criterios existentes de la línea de meta M0 a evidencia disponible, estado probatorio y faltantes concretos para P-01.
- No crea otra línea de meta. Resultado: alcance Opción A elegido, pero P-01 no pasa; la ruta Chronicle puede continuar desde bootstrap hacia admisión/PREPARED/dispatch y mutación Chronicle; quiescencia general, creación exclusiva ante todos los escritores y protocolo de UNKNOWN no están demostrados.
- Tests/CI: no verificados para el SHA exacto requerido; YAML de workflow no prueba ejecución. Se requiere contrato congelado y autorización separada antes de pruebas.
- P-01 permanece OPEN/UNKNOWN; M0 INCOMPLETO; D1/D2/D3 siguen en estados canónicos; implementación no autorizada. Sin cambios ejecutables, tests, CI o Actions.

---

## DELTA — P-01: MATRIZ DIRIGIDA DE INICIALIZACIÓN Y CONSUMIDORES (2026-10-27)

- Inventario §22, commit `8b289845961653d8f85b32aa92d233e4a532d042`: relaciona el servicio de Continuity, snapshot, store y los tres callers estáticos relevantes con los límites de evidencia de cada uno.
- Resultado: la Opción A de alcance (almacenamiento local M0 estrictamente no autoritativo) está elegida, pero la separación arquitectónica no está demostrada. La ruta Chronicle puede continuar desde inicialización a admisión/ejecución dentro de la misma invocación; `simulate.mjs` enlaza la ausencia de estado de simulación con inicialización; `assistants.mjs` es un flujo compuesto Nexo/Lúmina/world-state.
- P-01 sigue OPEN/UNKNOWN: protocolo concreto, quiescencia, autoridad aplicable y creación exclusiva ante todos los escritores relevantes no están demostrados. Preservar corrupto/inválido; errores o resultados ambiguos → UNKNOWN/STOP; sin retry automático.
- No crear autoridad paralela ni ampliar Constitution Authority Context por analogía. No se cerró P-01 ni se autorizó implementación. Sin cambios ejecutables/tests/CI/Actions.

---

## DELTA — ORDEN PROPUESTO PARA RESOLVER P-01…P-10 SIN REPETIR CENSOS (2026-10-27)

- Inventario §21, commit `8606cb600f4d155fdaa7542bdcb47ef68f74aa27`: establece una secuencia documental propuesta para P-01…P-10 basada en el registro canónico existente.
- Orden: P-01 bootstrap y P-02 fronteras de dominio como entradas de diseño; P-03 admisión; P-04 locks; P-05/P-06 incertidumbre y stale; P-07 rutas reservadas; P-08 compatibilidad API/CLI; P-09 aristas pendientes contra snapshot concreto; P-10 matriz final de evidencia.
- Dependencias descritas como orden de trabajo, no como nuevas decisiones ratificadas. Si falta decisión del propietario o evidencia, conservar PENDING/UNKNOWN y detener la inferencia dependiente.
- No se cerró ni renumeró P-01…P-10. Sin cambios ejecutables, tests, CI o Actions; gates canónicos intactos.

---

## DELTA — CONDICIONES DE SALIDA PROPUESTAS PARA P-02 / P-HIST-08 (2026-10-27)

- Inventario §20, commit `51af570188b453c6547a95626cf9c6721964ba05`: concreta criterios documentales para las excepciones `assistants.mjs` y `simulate.mjs`, reutilizando P-02/P-HIST-08 y el manifiesto D1 existentes.
- `assistants.mjs`: decidir exclusión M0 o integración compuesta con solo la suboperación Nexo bajo admisión de instancia; separar explícitamente estado del mundo/memoria Lúmina y no prometer atomicidad multi-store sin contrato.
- `simulate.mjs`: decidir exclusión o frontera propia; definir inicialización de Continuity ausente y tratamiento de ruta legacy/legacyMemory sin inferir autoridad a partir de estado de simulación.
- Regla de cierre: una exclusión ratificada se registra como `OUT OF SCOPE BY DECISION`, no como bloqueo técnico. Sin decisión del propietario o evidencia de prueba vinculada al SHA, mantener `OPEN / UNKNOWN`. La matriz es propuesta documental, no ratificación ni autorización de implementación.
- Sin cambios ejecutables ni tests/CI/Actions. Gates canónicos intactos.

---

## DELTA — CALLERS RECONCILIADOS CON MANIFIESTO D1; EXCEPCIONES SIGUEN SIENDO SOLO DE DISEÑO (2026-10-27)

- Inventario §19, commit `462f1a63377c058415e5ce32cfa090c18b5d5f0b`: el manifiesto D1 existente ya clasifica `scripts/assistants.mjs` y `scripts/simulate.mjs` como `EXPLICIT_EXCEPTION — DESIGN ONLY`; el registro mantiene P-HIST-08 y P-02 abiertos.
- Esto resuelve la clasificación del hallazgo §18 sin repetir el censo: no son consumidores desconocidos nuevos, pero su exclusión no equivale a bloqueo de runtime, inaccesibilidad ni aislamiento Nexo/Lúmina probado. No se declara vulnerabilidad por esta observación aislada.
- Pendiente: conservar explícita la diferencia entre exclusión del alcance M0, comportamiento ejecutable actual y evidencia requerida para afirmar aislamiento/inaccesibilidad. No cerrar P-02/P-HIST-08 sin decisión del propietario.
- No se ejecutaron pruebas/CI/Actions ni se modificó runtime/workflows. Gates canónicos sin cambios: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — DOS CALLERS DIRECTOS FUERA DE LAS RAÍCES EXPLÍCITAS DEL IMPORT-GRAPH TEST (2026-10-27)

- Inventario §18, commit `9fc9d55e4e55f071b2ec19515d34e5a6c9049f38`: cruce estático confirma que `scripts/simulate.mjs` (blob `1b5e39b681486f583c1779770c52dd913227dfa1`) y `scripts/assistants.mjs` (blob `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`) llaman directamente a `openNexoContinuityOwner`, pero no son raíces explícitas de `auditNexoImportGraph` en `entrypoint.test.mjs`.
- `src/nexo/application/chronicle-append.mjs` (blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`) sí está afirmado como alcanzado transitivamente por el test desde sus raíces. Este contraste no declara vulnerabilidad ni decide si simulate/assistants están dentro del alcance D1; esa clasificación debe reutilizar el censo y contrato existentes.
- Siguiente paso: contrastar únicamente estos dos callers con el alcance D1 ya documentado, sin rehacer el inventario completo. Sin tests/CI/Actions ni cambios ejecutables. Gates intactos.

---

## DELTA — TRAZABILIDAD B.5–B.7 REFINADA; CONSULTA DIRECTA DE ACTIONS BLOQUEADA POR EL CONECTOR (2026-10-27)

- Inventario §17 actualizado en commit `ba9a20ce519be4f10f92062fa5b6548ff8ff6984`. Corrección importante: `tests/nexo/entrypoint.test.mjs` sí implementa un recorrido recursivo de imports/re-exports estáticos desde dos raíces y guardas explícitas de módulos legacy; no describirlo como prueba superficial.
- Límite demostrado por inspección del código: ese recorrido usa regex para imports/exports estáticos y dos raíces declaradas; no prueba por sí solo `import()` dinámico, resolución por alias/loader, todos los callers del repositorio ni cada ruta indirecta potencial. Los tests de protected transition y Chronicle respaldan propiedades locales, no legitimidad constitucional global.
- Se intentó consultar solo lectura el historial con `mcp__GitHub__fetch` hacia endpoints públicos REST de Actions y la página del workflow; el conector rechazó esas URLs con `INVALID_ARGUMENT` (“not an allowed public GitHub repository or search endpoint”). Por tanto, la documentación oficial de GitHub describe una API existente, pero esa consulta no produjo datos de ejecuciones en esta sesión. No usarla como evidencia de run, y no lanzar/repetir workflows.
- Siguiente tarea: cruzar las dos raíces de `auditNexoImportGraph` con el censo de callers ya existente y enumerar solo las rutas fuera de alcance. No rehacer el censo ni cambiar tests/runtime.
- Sin ejecución de tests/CI/Actions ni cambios ejecutables. Gates intactos: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — COBERTURA DE TESTS NO EQUIVA A CRITERIOS DE CIERRE (2026-10-27)

- Inventario §17, commit `e57a316fdfa14abcafdbdc51d8bed3caa1808822`: inspección estática de `entrypoint.test.mjs`, `protected-transition.test.mjs` y `chronicle-runtime.test.mjs` identifica cobertura útil, pero no demuestra exhaustividad del grafo de callers/no-bypass ni autoridad constitucional independiente.
- Esta es una limitación de evidencia, no una afirmación de que las pruebas definitivamente no cubran esos casos. Falta mapear cada criterio B.5–B.7 del documento de línea de meta al test/assertion exacto y a una ejecución ligada al SHA.
- No se ejecutaron tests ni CI. No se alteró runtime/workflows. Gates intactos: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — LIMITACIÓN DE CONSULTA DE HISTORIAL DE ACTIONS DOCUMENTADA (2026-10-27)

- Inventario §16, commit `5c67bb47d011b2762411c5e865c1ec03bbee51e8`: los path filters de ambos workflows M0 no incluyen `NEXO_NCS/STATUS.md` ni `NEXO_NCS/BUILD/**`; los checkpoints documentales no son evidencia de disparo de CI.
- La herramienta de runs disponible en esta sesión solo consulta runs asociados a un commit y declara filtro de pull requests/primera página. No hay acción expuesta de solo lectura para listar historial por workflow/archivo. No se inventó run ID ni se usó una acción de re-ejecución.
- Enlaces de inspección manual de historial, solo lectura:
  - https://github.com/snowdenxrp/aldea-ia/actions/workflows/nexo-m0-acceptance.yml
  - https://github.com/snowdenxrp/aldea-ia/actions/workflows/nexo-m0-repair-crash-cuts.yml
- Criterio: registrar `run_id`, `head_sha`, evento, conclusión, pasos ejecutados y blobs de test/runtime. Sin esa relación, `CI NO VERIFICADO`; no inferir éxito ni fallo.
- Sin ejecución de tests/CI/Actions y sin cambios ejecutables. Gates intactos: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — WORKFLOWS M0 IDENTIFICADOS; EJECUCIÓN AÚN NO VINCULADA A SHA (2026-10-27)

- Corrección documentada en el inventario §15, commit `4059f658038c09cdf78607af625c8ebd5fde43e9`: sí existen workflows dedicados en esta rama.
- `.github/workflows/nexo-m0-acceptance.yml` (blob `60323063fe6656eb7e7710825f327fa7e39526c3`) selecciona `chronicle-runtime.test.mjs` y `continuity-migration.test.mjs` bajo triggers/path filters específicos.
- `.github/workflows/nexo-m0-repair-crash-cuts.yml` (blob `35e93581fd33912165f7adfb9656952e76c567fa`) también ejecuta `continuity-migration.test.mjs` y regresiones de reparación.
- Por tanto, §14 queda precisado: la ausencia de `continuity-migration.test.mjs` en el script general `package.json` no implica que falte de todos los runners.
- No se encontró en esta revisión un run ID verificable asociado al SHA exacto de los tests/runtime. El status combinado del commit documental no tenía checks; esto no permite inferir resultado de commits de implementación.
- Próximo paso: verificar historial de Actions, `head_sha`, jobs, pasos y conclusión de un run existente; no disparar ni reintentar workflows.
- Sin cambios ejecutables ni ejecución de tests/CI/Actions. Gates intactos: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — MATRIZ ESTÁTICA DE TESTS Y SELECCIÓN DEL RUNNER (2026-10-27)

- Inventario ampliado en §13–14: [NCS M0 bootstrap objects and consumers inventory](BUILD/NCS_M0_BOOTSTRAP_OBJECTS_AND_CONSUMERS_INVENTORY_2026-10-27.md), commit `492d15a159fbed0f9e07cb02c8865e9e002ea8d2`.
- Blobs inspeccionados: `chronicle-runtime.test.mjs` `0bf35f0dc1aadb121a8b2145b4963bacd5641c04`; `continuity-migration.test.mjs` `0bef1b93c6268042f14830c97e084d0a543e05f4`; `package.json` `e45dc6d215db53ea2758009cd501f565634e3610`; `runtime.js` `9d3d5109753e8ba96fc287c269da275112645523`; `owner-backed-runtime.mjs` `a7a014489209273ce78d0103afa785728d4c467c`.
- Hallazgo de selección: el script `test` de `package.json` sí enumera `chronicle-runtime.test.mjs`, pero no enumera `continuity-migration.test.mjs` en la cadena inspeccionada. Esto no prueba que ningún otro runner ejecute este último. Los workflows CI reales aún no se han enumerado ni verificado.
- Siguiente paso: identificar workflow real y selección de tests; verificar si existe un run previo con SHA exacto. No ejecutar tests/CI ni cambiar workflows.
- Sin cambios ejecutables. Gates intactos: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — CRUCE CHRONICLE CON OWNER-BACKED RUNTIME (2026-10-27)

- Ampliado el inventario existente, §11–12: [Inventario de bootstrap y consumidores](BUILD/NCS_M0_BOOTSTRAP_OBJECTS_AND_CONSUMERS_INVENTORY_2026-10-27.md), commit `bddf1e096bc282f3f426a3d1aa3a8011c5136c36`.
- Fuentes de la cadena: `chronicle-effect.mjs` blob `6daf742eb0048724557151a728bf807613a854e9`; `chronicle-observation.mjs` blob `82c7531fcb143f38a5f121ffcc5b5ab44a9d419f`; `owner-backed-runtime.mjs` blob `a7a014489209273ce78d0103afa785728d4c467c`.
- Hallazgo estático acotado: el runtime exige confirmación de PREPARED y revisión incrementada antes del dispatch; después exige reconciliación y confirmación del resultado terminal. UNKNOWN no se promueve a completado. Esto describe el módulo inspeccionado, no demuestra autorización constitucional, cierre de entrypoints ni efecto externo real.
- Próximo paso acotado: cruzar los tests existentes con PREPARED, recuperación, postcondition y resultado terminal para registrar cobertura documental y brechas; no ejecutar tests ni CI sin autorización separada.
- Sin cambios ejecutables y sin tests/CI/Actions. Gates intactos: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — LECTORES CHRONICLE Y LÍMITES DE LA API PÚBLICA (2026-10-27)

- Ampliado el inventario existente, §10: [Inventario de bootstrap y consumidores](BUILD/NCS_M0_BOOTSTRAP_OBJECTS_AND_CONSUMERS_INVENTORY_2026-10-27.md), commit `89689aa1fb29e1d52c6556aaf3e21702571ca875`.
- Fuentes adicionales: `application/index.mjs` blob `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3`; `adapters/chronicle-effect.mjs` blob `6daf742eb0048724557151a728bf807613a854e9`; `core/chronicle-settlement-contract.mjs` blob `4d04930cbf67b5943916cc497dd44b14c87e27bd`; `scripts/nexo.mjs` blob `e471eb478a09aa8a9a8323795583e198cdf0a127`.
- La API pública consultada expone `runNexoChronicleAppend` como caso de uso mutador Chronicle; adapter/store hacen lectura local para idempotencia/observación y append. El contrato estructural de settlement no es autenticación, atribución causal ni garantía de durabilidad.
- La ausencia de una exportación pública de lectura Chronicle no demuestra ausencia de imports internos/externos. La validación de rutas contra raíz legítima, los consumidores privados y las pruebas de caminos éxito/conflicto/UNKNOWN siguen abiertos. No se cierra D1.
- Sin cambios ejecutables ni tests/CI/Actions. Gates intactos: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — MATRIZ DE CONSUMIDORES Y ARISTAS DE BOOTSTRAP (2026-10-27)

- Inventario ampliado con matriz de consumidores concretos de `missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`, entradas Chronicle, locks y `owner.json`: [Inventario de bootstrap y consumidores, §9](BUILD/NCS_M0_BOOTSTRAP_OBJECTS_AND_CONSUMERS_INVENTORY_2026-10-27.md), commit `5a1676df7d95270ae52dc587fb2edda8084014fd`.
- Evidencia adicional de fuentes de la rama: `continuity-snapshot.mjs` blob `56cbd1753f1fa3fb67c3592e5a5664b58d96c4c3`; `continuity-operations.mjs` blob `cc295e3bf9fe1c0c4ae7e0de172d0d22e8d9b3c5`; `continuity-queries.mjs` blob `e1915e94e53e71d37a37952fead37ba62bdae79a`; `orchestrator.js` blob `de257324cabfaae69219f71e598bb83c1aafc0a1`.
- Aristas todavía abiertas: admisión → runtime/adapter; legacy memory → snapshot Continuity; journal → dispatch/settlement/reconciliation; queries → snapshot dentro del alcance D2; locks locales → límites de escritores no cooperantes. No se declara cerrado el grafo D1.
- La evidencia apoya que el estado es operacionalmente significativo; no acredita autoridad constitucional ni que cada efecto real quede reflejado por el journal. La proyección legacy conserva las cinco colecciones y requiere contrato de legitimidad/separación Nexo-Lúmina.
- Sin cambios de runtime/tests/workflows/configuración ejecutable; no se ejecutaron tests, CI ni Actions. Gates sin cambios: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — INVENTARIO DE OBJETOS DE BOOTSTRAP Y CONSUMIDORES (2026-10-27)

- Nuevo documento: [NCS M0 — Inventario estático de objetos de bootstrap y consumidores](BUILD/NCS_M0_BOOTSTRAP_OBJECTS_AND_CONSUMERS_INVENTORY_2026-10-27.md), commit `6d99174afcc2b38aba6754c1e1c02def83b7bf57`.
- Contraste estático realizado con blobs concretos de `nexo-chronicle-session.mjs`, `chronicle-append.mjs`, `continuity-service.mjs`, `continuity-store.mjs`, `chronicle-store.mjs`, decisión de estado ausente, contrato de raíz y manifiesto D1.
- Se separan: stores operacionales Continuity/Chronicle; locks por-store y sus `owner.json`; temporales; y el lock compartido de instancia que solo aparece como propuesta de diseño. `continuity.json`/`chronicle.json` son nombres del layout propuesto, no rutas forzadas por las factories actuales.
- Conclusión limitada: Continuity participa en admisión/reconstrucción y Chronicle en append; por ello no está probado que sean «sin consecuencias operativas». Tampoco está demostrado que constituyan raíz constitucional. Alcance local sigue `UNKNOWN/PENDING`.
- Se conserva la opción B como separación de operaciones aceptada en diseño; la precondición legítima para crear el primer estado sigue sin definirse/verificarse. Las banderas de inicialización no son autoridad; la ruta Chronicle puede continuar más allá de crear stores en la misma invocación según inspección estática.
- Siguiente paso acotado: mapear los consumidores ya conocidos a objetos/colecciones y añadir solo aristas no resueltas; no repetir el censo D1 completo.
- Sin cambios de runtime, tests, workflows ni configuración ejecutable; no se ejecutaron pruebas, CI ni Actions. Gates intactos: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — ALCANCE DE BOOTSTRAP Y AUTORIDAD LOCAL SEPARADOS (2026-10-27)

- Registro de decisiones ampliado con la sección 11: [D0–D3 Decision Register](BUILD/NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md), commit `21d476930a99e63d2c9326b673dfca2f34710333`.
- Se separan dos preguntas antes mezclables: (1) si el bootstrap crea únicamente almacenamiento local no autoritativo o toca estado constitucional/genesis; (2) qué regla aprobada legitima la primera creación local.
- Alternativas documentadas: L (almacenamiento interno estrictamente no autoritativo, sujeto a aceptación explícita y contratos); C (estado constitucional/genesis, bloqueado hasta base de confianza y frontera independiente); U (alcance no demostrado, estado conservador actual UNKNOWN/BLOCKED).
- No se inventó `BootstrapAuthority`, no se amplió por analogía Constitution Authority Context y no se convirtió el alcance L en permiso para inicializar. Se exige identificar objetos/archivos y consumidores antes de decidir.
- No se cierran P-01…P-10 ni se cambia la línea de meta M0 existente. No se modificaron runtime/tests/workflows/configuración ejecutable; no se ejecutaron tests, CI ni Actions.
- Gates intactos: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## DELTA — ALCANCE B2 SIGUE PENDIENTE (2026-10-27)

- Registro actualizado: [NCS M0 D0–D3 — registro de decisiones](BUILD/NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md), sección 10, commit `0275b124d56b20c009c5461a67365210922d4d75`.
- Pregunta pendiente documentada: si B2 exige aislar toda inicialización explícita local no autoritativa de la admisión/PREPARED/dispatch/Chronicle en la misma invocación (A), si aplica solo a rutas con alcance de efecto y exclusiones expresas (B), o si se conserva sin selección hasta cerrar alcance y evidencia (C).
- Estado de decisión actual: C — no seleccionar todavía. Es una recomendación conservadora de trabajo, no ratificación del propietario. B2 sigue PROPUESTA / NO RATIFICADA.
- No se cierran ni renumeran P-01…P-10. No se creó una segunda línea de meta; sigue vigente `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`.
- Siguiente paso: resolver esta pregunta solo con el alcance M0 aceptado y el manifiesto D1 vigente; después actualizar la trazabilidad existente. No repetir el censo salvo cambio de fuente.
- Sin cambios de runtime, tests, workflows o configuración ejecutable; no se ejecutaron pruebas, CI ni Actions.
- Gates sin cambio: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# DELTA — REVISIÓN ADVERSARIAL CONTRA LA LÍNEA DE META M0 EXISTENTE (2026-10-27)

- Nuevo documento: [Revisión adversarial del contrato candidato frente a línea de meta y decisiones canónicas](BUILD/NCS_M0_CANDIDATE_CONTRACT_ADVERSARIAL_RECONCILIATION_2026-10-27.md), commit `555f0c7f50939fa0fb1ddb676d1ab64b28b68b0d`.
- Hallazgo principal: **no crear otra línea de meta M0**. Ya existe `NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`, cuya base de cierre fue aceptada por el propietario; los criterios A1–A7 del contrato candidato deben mapearse como sub-obligaciones a los criterios A–E existentes, no reemplazarlos.
- Revisión cruzada realizada contra el registro D0–D3, el manifiesto D1, el contrato de raíz de instancia, las decisiones de bootstrap A/B y los contratos STEP 7 de Constitution Authority Context / Trust Foundation.
- No se halló contradicción que invalide las decisiones de alcance A u operacional B. Sí permanecen dependencias críticas: protocolo de bootstrap/quiescencia, cierre del grafo D1, definición de B2 como obligación de diseño y evidencia independiente de Trust Foundation. La inicialización de estado local no concede autoridad constitucional.
- B2 sigue candidato pendiente, no regla ratificada. La ruta Chronicle es una brecha estática identificada, no una prueba de ejecución ni una autorización para reparar.
- No se ejecutaron runtime/tests/CI/Actions ni se modificó runtime, tests, workflows o configuración ejecutable.
- Siguiente acción: resolver solo decisiones abiertas del registro D0–D3 y enlazar obligaciones a la línea de meta existente; no repetir el censo D1 sin cambio de fuente y no crear un segundo acta/línea de cierre.
- Gates intactos: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; exclusión global de repair `UNKNOWN`.

---

# DELTA — RECONCILIACIÓN DEL CANDIDATO CON DECISIONES CANÓNICAS A/B (2026-10-27)

- Revisé el contrato candidato contra `NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md`, `NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md`, `STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md` y `STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`.
- Se aclaró en la sección 9 del [contrato candidato](BUILD/NCS_M0_BOOTSTRAP_AUTHORITY_PERSISTENCE_BOUNDARY_CONTRACT_CANDIDATE_2026-10-27.md), actualización commit `5f14ed2542afb095fb493056496cc2ab3d4839b1`, que **Opción A y Opción B son ejes compatibles**: A delimita el alcance del estado local (estrictamente no autoritativo); B separa la inicialización explícita del commit condicional normal.
- Cuatro preguntas permanecen separadas: (1) qué estado local puede crear M0; (2) cómo se separa y protege la operación de creación; (3) qué precondición legítima permite solicitarla — aún `UNKNOWN/PENDING`; (4) qué autoriza efectos — permanece bajo los contratos de autoridad/enforcement y STOP.
- El mapa Trust Function/Root Role declara que el reconocimiento inicial independiente y la aplicación protegida real no están demostrados. Genesis Trust Foundation sigue candidato sujeto a ataque; no se creó `BootstrapAuthority` ni se amplió el contrato constitucional por analogía.
- B2 (bootstrap no debe cruzar silenciosamente al despacho) permanece propuesta para ataque, no decisión ratificada ni garantía implementada. La ruta Chronicle continúa siendo brecha estática identificada.
- No se ejecutaron código/tests/CI/Actions ni se modificó runtime, tests, workflows o configuración ejecutable.
- Próximo paso: revisión adversarial acotada de esta reconciliación contra el resto del contrato candidato y definir criterios de salida finitos para M0; no repetir la auditoría Chronicle ni crear otro contrato de autoridad.
- Gates sin cambios: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; exclusión global de reparaciones `UNKNOWN`.

---

# DELTA DE CONTINUIDAD — CONTRATO CANDIDATO DE FRONTERAS M0 (2026-10-27)

- Se creó [NCS_M0_BOOTSTRAP_AUTHORITY_PERSISTENCE_BOUNDARY_CONTRACT_CANDIDATE_2026-10-27.md](BUILD/NCS_M0_BOOTSTRAP_AUTHORITY_PERSISTENCE_BOUNDARY_CONTRACT_CANDIDATE_2026-10-27.md), commit `a8ff210d4d9758d86db62c8bee69e90fe1c26490`.
- Es un **candidato de diseño, no ratificado, STOP BEFORE CODE**. Traduce los hallazgos del mapa estático en obligaciones falsables para aislamiento de bootstrap, autoridad actual, separación Nexo/Lúmina, persistencia, concurrencia, STOP/reparación y línea de meta de M0. Reutiliza los gates existentes; no inventa un trust root ni un gate universal.
- Importante: el gate STEP 7 existente sigue diciendo que no se implemente `Constitution Authority Context` hasta definir/atacar primero la frontera de Trust Foundation. Este documento no reemplaza ni anula ese gate.
- Próximo trabajo: adversarial review del candidato contra MASTER/CORE y contratos propietarios existentes, resolver contradicciones concretas y definir una línea de meta finita para M0. No volver a auditar Chronicle desde cero y no implementar antes de ratificar requisitos.
- No se ejecutaron código/tests/CI/Actions; no se modificó runtime, tests, workflows ni configuración ejecutable.
- Gates vigentes: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; exclusión global de reparaciones `UNKNOWN`.

---

# DELTA DE CONTINUACIÓN — MAPA DE CONSUMIDORES Y CARRERA DE BOOTSTRAP (2026-10-27)

- Se amplió el mapa estático existente con una lectura dirigida de las cinco colecciones, los tests relevantes (solo lectura) y la secuencia exacta de `initialize()`: [NCS_M0_STATIC_CONSUMER_MAP_QWEN_CONSOLIDATION_2026-10-27.md](BUILD/NCS_M0_STATIC_CONSUMER_MAP_QWEN_CONSOLIDATION_2026-10-27.md), nuevo commit `4e2f70ea83029ad08a6581e256e53293a4905d7e`.
- Consumidores: `missions` afecta reconstrucción/admisión de pasos; `attempts` afecta reconstrucción de resultados y bloqueos; `doNotRepeat` filtra planificación; `executions` conserva linaje/idempotencia pero no prueba verdad externa; `effectJournal` condiciona PREPARED/reconciliación/recuperación. Esto describe influencia operacional, no autoridad constitucional.
- Tests leídos estáticamente: `continuity-migration.test.mjs`, `assistants-runtime-cli.test.mjs`, y el caso concurrente de `chronicle-runtime.test.mjs`. Ninguno fue ejecutado; las aserciones del archivo no son resultados de CI.
- Precisión de concurrencia: el lock serializa escritores cooperativos; el flujo de inicialización usa `access(filePath)`, luego `.tmp` estable y `rename`. Un escritor no cooperativo puede competir en esa ventana; efecto real depende de filesystem/plataforma y permanece UNKNOWN, no reproducido. El propio store excluye garantías globales/sandbox/durabilidad universal.
- Gates sin cambios: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reparaciones excluidas de M0. No se ejecutaron código/tests/CI/Actions ni se modificó runtime/tests/workflows/configuración ejecutable.
- Punto siguiente: no rehacer Chronicle ni el informe Perplexity. Revisar únicamente contradicciones documentales concretas y preparar, sin implementar, un contrato canónico que separe aislamiento, autoridad, persistencia y concurrencia. Mantener writers no cooperativos, plataforma objetivo y alcance global como UNKNOWN hasta evidencia adecuada.

---

# CONTINUIDAD PARA SIGUIENTE CHAT — HANDOFF BOOTSTRAP DELTA (2026-10-27)

- **Siguiente chat: empezar por este handoff detallado:** [`BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-27_BOOTSTRAP_DELTA.md`](BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-27_BOOTSTRAP_DELTA.md), commit `51a7392efca84b29b0ac5acef4015657cd233277`.
- Leer después [la revisión de delta Perplexity](BUILD/NCS_M0_PERPLEXITY_DELTA_REVIEW_2026-10-27.md), commit `c361694c28c7f108c054e09dad963eba5fc6e235`; no rehacer el análisis Chronicle ya documentado.
- Punto exacto: completar el mapa estático de consumidores de todas las colecciones de continuidad; lectura estática de tests pertinentes (sin ejecutar); acotar el riesgo de inicialización frente a escritores no cooperativos. Detalles, matriz y límites en el handoff.
- Esta actualización es solo documental. No se ejecutaron tests/CI/Actions; no se cambió runtime, tests, workflows ni configuración ejecutable. No se consultaron logs/historial de Actions.
- Gates sin cambios: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reparaciones excluidas de M0.
  
---

# CONSOLIDACIÓN ESTÁTICA DE CONSUMIDORES + QWEN (2026-10-27)

- Nuevo documento de consolidación: [NCS_M0_STATIC_CONSUMER_MAP_QWEN_CONSOLIDATION_2026-10-27.md](BUILD/NCS_M0_STATIC_CONSUMER_MAP_QWEN_CONSOLIDATION_2026-10-27.md), commit `7c2af84aa9871f5388201cbe6f365576d2e368ac`.
- **Corrección del inventario:** el mapa estático dirigido ha identificado al menos tres llamadores directos de `openNexoContinuityOwner`: `src/nexo/application/chronicle-append.mjs`, `scripts/simulate.mjs` y `scripts/assistants.mjs`. Las referencias anteriores que limitaban las rutas revisadas a dos llamadores quedan superadas. No se declara exhaustividad global.
- Se consolidó el mapa de las cinco colecciones (`missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`), sus consumidores conocidos y los límites de lo que cada lectura permite afirmar.
- El test de concurrencia de Chronicle se leyó estáticamente; **no se ejecutó**. La cobertura que declara no demuestra exclusión frente a escritores no cooperativos, atomicidad multi-store ni durabilidad universal.
- La entrada `runNexoRuntimeRepairSession` bloquea localmente con `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; la exclusión global de módulos de reparación sigue `UNKNOWN`.
- Precisión de concurrencia: `continuity-store.mjs` usa el temporal determinista `${filePath}.tmp`; `initialize()` hace `access(filePath)` y después publica mediante `rename`. Un escritor no cooperativo podría competir entre esas operaciones en plataformas donde `rename` sustituye el destino. Es riesgo inferido, no fallo reproducido; la semántica del dispositivo destino y la lista global de escritores siguen `UNKNOWN`.
- Qwen aportó criterios adversariales y condiciones falsables, pero no inspeccionó el repo; sus conclusiones no cuentan como evidencia técnica independiente.
- No hubo cambios de runtime/tests/workflows/configuración; no se ejecutaron tests ni CI.
- Gates sin cambios: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reparaciones excluidas de M0.

# MAPA ESTÁTICO AMPLIADO — RUTAS DE BOOTSTRAP Y OPERACIÓN (2026-10-27)

- **Chronicle:** `scripts/nexo-chronicle-session.mjs` expone `--initialize-continuity`; `src/nexo/application/chronicle-append.mjs` puede inicializar continuidad y continuar dentro de la misma invocación hasta `PREPARED` y el handler `chronicle_append`, que muta el almacén Chronicle. Ruta confirmada estáticamente; separación de inicialización/despacho no demostrada; autorización sigue `NOT_EVALUATED`.
- **Simulación:** `scripts/simulate.mjs` habilita inicialización vacía de continuidad cuando falta el archivo de mundo, luego avanza y persiste el mundo. En el `main` inspeccionado no se vio despacho Chronicle, pero sí persistencia de simulación. No confundirla con autoridad constitucional.
- **Reparaciones:** el runtime del producto bloquea `runNexoRuntimeRepairSession` con `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, coherente con la exclusión de reparaciones de M0. Los módulos dedicados `nexo-repair-entrypoint`/`nexo-repair-dispatch` siguen existiendo y pueden ejecutar reparaciones si se invocan con un owner y una obligación PREPARED; su existencia no demuestra que el runtime del producto los llame. Mantenerlos fuera del alcance M0 o verificar callers separados.
- **Consultas:** `src/nexo/application/continuity-queries.mjs` lee sin inicializar; no es un bootstrap y describe el plan como información que no autoriza despacho.
- Este es un mapa de las rutas inspeccionadas, no un grafo global exhaustivo. No se consultaron tests/CI ni se ejecutó código.
- Próximo punto: resolver la frontera de invocación del bootstrap Chronicle y la regla para inicialización acoplada a ausencia del archivo de mundo; no hacer cambios de runtime hasta que esas garantías se expresen en un contrato canónico verificable.
- Segundo pase estático y criterios BA-01–BA-10 registrados en `BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md` (último commit `d5bd86b8d0f4655d7ce02f3c753a0c6afdadae69`): dos llamadores directos observados de `openNexoContinuityOwner` en las rutas revisadas (Chronicle y simulación); ambas pueden continuar a trabajo/persistencia en la misma invocación. El mapa no es globalmente exhaustivo; búsqueda indexada vacía no cuenta como evidencia negativa. Criterios propuestos: bootstrap aislado, sin admisión/dispatch/reconciliación/mutación de dominio en la misma invocación; la autoridad de creación sigue UNKNOWN/PENDING. BA-01–BA-10 no ejecutados ni verificados. Solo documentación; no runtime/tests/workflows/configuración ni CI.
- Nueva delimitación de diseño registrada en la propuesta (último commit `9855fb3db396251d093e537100f9c33ecc55acae`): D1 = almacenamiento estrictamente no autoritativo; D2 = bootstrap sujeto a autoridad constitucional; D3 = mantener STOP. Recomendación documental: conservar D3 y estudiar D1 sin darla por aceptada; no crear un owner paralelo. La distinción requiere decisión contractual explícita antes de implementación.
- Detalle y matriz: [Propuesta de contrato de bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md).

---
# EVIDENCIA ADICIONAL — EL HANDLER DE CHRONICLE ES UNA MUTACIÓN PERSISTENTE (2026-10-27)

- `src/nexo/adapters/chronicle-effect.mjs`: el handler `chronicle_append` invoca `store.append(...)` y puede devolver `completed` cuando el almacén confirma `committed`/`already_present`.
- `src/nexo/core/owner-backed-runtime.mjs`: el flujo persiste `PREPARED` y luego llama a `adapter.executePrepared`. Unido al hallazgo previo, esto confirma que la invocación que inicializa continuidad puede continuar hasta una mutación persistente de Chronicle; la respuesta pública sigue declarando `authorization: NOT_EVALUATED`, y no se identificó una evaluación de autoridad que detenga esa ruta.
- Es evidencia estática del camino de código, no prueba de ejecución real ni afirmación sobre todos los efectos de Nexo. No se consultaron tests ni CI.
- Implicación: no tratar `--initialize-continuity` como una inicialización inocua/aislada; la separación de Opción A sigue sin demostrarse y la implementación continúa STOP/UNKNOWN.
- Detalle: [Propuesta de contrato de bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md).

---
# BLOQUEO PRIORITARIO — BOOTSTRAP DE CONTINUIDAD CONECTADO A RUTA DE CHRONICLE (2026-10-27)

- Confirmado por lectura estática de `scripts/nexo-chronicle-session.mjs` y `src/nexo/application/chronicle-append.mjs`: existe la bandera `--initialize-continuity`; si falta continuidad y se activa, `runNexoChronicleAppend` puede inicializar el store, admitir una misión y continuar hasta `executeNexoStepWithContinuityOwner` en la misma invocación.
- La respuesta mantiene `authorization: NOT_EVALUATED`, pero eso no detiene automáticamente el flujo. No se concluye que se otorgue autoridad constitucional; sí que la separación operacional exigida por Opción A no está demostrada.
- Opción B previa = mecanismo de persistencia (bootstrap explícito separado del commit condicional). Opción A actual = alcance no autoritativo del estado local. Son ejes distintos; ambos siguen vigentes.
- Antes de cualquier cambio ejecutable, resolver cómo impedir que la operación de inicialización por sí misma continúe hacia admisión/despacho. No bastan el nombre de la bandera ni una etiqueta NOT_EVALUATED. No se implementó solución.
- Detalle: [Propuesta de contrato de bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md), sección “Hallazgo prioritario de consumidores”.
- Solo lectura y documentación. No cambios de runtime/tests/workflows/configuración; no tests/CI. Gates: M0 INCOMPLETO; autoridad raíz PENDING/UNKNOWN; autorización NOT_EVALUATED; efectos protegidos STOP.

---
# ACTUALIZACIÓN PRIORITARIA — MAPA PRELIMINAR DE CONSUMIDORES: SEPARACIÓN AÚN NO DEMOSTRADA (2026-10-27)

- Lectura estática dirigida encontró que `continuity-snapshot.mjs` declara datos operacionales sin autoridad, pero el snapshot incluye `effectJournal`, consumido por el owner/runtime para operaciones y reconciliación. Esto no prueba una concesión de autoridad, pero impide dar por demostrada la inocuidad del bootstrap sin completar el grafo de consumidores.
- `continuity-service.mjs` permite inicialización vacía solo mediante `allowEmptyInitialization: true` (por defecto `false`); `scripts/simulate.mjs` pasa ese valor según la ausencia del archivo de mundo y abre el owner de continuidad. Esta relación debe trazarse antes de aceptar la separación como segura.
- Referencia y detalle: [Propuesta de contrato de bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md), sección “Primer mapa estático dirigido de consumidores”.
- Próximo paso: completar el mapa de llamadas a `openNexoContinuityOwner`/inicializador y sus consumidores de dispatch/reconciliación. Opción A sigue elegida como alcance, pero la separación no está demostrada: implementación STOP/UNKNOWN.
- Solo lectura y documentación; no runtime/tests/workflows/configuración; no tests/CI.

---
# ACTUALIZACIÓN PRIORITARIA — EL PROPIETARIO ELIGE OPCIÓN A PARA EL ALCANCE DE BOOTSTRAP LOCAL (2026-10-27)

- El propietario eligió **Opción A de alcance**: estudiar la inicialización explícita de almacenamiento local M0 exclusivamente no autoritativo y acotado. Esto no debe confundirse con opciones A/B/C/D de otros registros de bootstrap.
- La decisión delimita el objetivo de diseño, pero **no demuestra que la arquitectura actual mantenga la separación** ni ratifica un contrato de implementación.
- Condiciones: no crear/modificar raíz o autoridad constitucional; no autenticar al propietario ni conceder permisos; no cambiar estado protegido ni habilitar efectos; preservar cualquier archivo existente incluso si es corrupto; no convertir errores de lectura/I/O en ausencia; UNKNOWN bloquea y no se reintenta automáticamente; demostrar exclusión frente a escritores concurrentes.
- Próximo paso: mapa estático dirigido de consumidores del estado inicial y comprobación de que ningún consumidor deriva autoridad o habilita efectos. Si no se demuestra, STOP/UNKNOWN.
- Referencia: [Propuesta de contrato para bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md).
- Solo documentación. No cambios de runtime/tests/workflows/configuración; no tests/CI. Gates intactos: M0 INCOMPLETO; raíz PENDING/UNKNOWN; autorización NOT_EVALUATED; efectos protegidos STOP; reconciliación general no integrada.

---

# ACTUALIZACIÓN PRIORITARIA — REVISIÓN INDEPENDIENTE CONFIRMA BRECHA DE AUTORIDAD DE BOOTSTRAP (2026-10-27)

- Claude realizó una revisión documental de solo lectura y reportó **BRECHA CONFIRMADA**: en el alcance revisado no encontró una regla canónica que designe quién autoriza crear el primer estado persistente local. Claude identificó HEAD `058bf0e`; no revisó STATUS completo ni todo BUILD/RESEARCH y no ejecutó runtime/tests/CI. El resultado coincide con la delimitación documentada en la propuesta de bootstrap.
- La fuente normativa constitucional está definida conceptualmente como el propietario humano en la Constitución; eso no demuestra que exista una ruta técnica independiente que reconozca esa autoridad, ni resuelve por sí mismo la autorización de una creación local concreta.
- La opción B elegida por el propietario sigue significando **separar inicialización explícita de commit condicional normal**. No equivale a autorizar un mecanismo de bootstrap ni a establecer una raíz.
- Se actualizó [la propuesta de contrato para bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md), commit `0c9cd2a1f567c43574df067e407ec47afab1d039`, para registrar el informe independiente, sus límites y la decisión aún pendiente.
- **Siguiente decisión exacta:** delimitar si se pretende inicializar exclusivamente almacenamiento interno no autoritativo y acotado —sin establecer/modificar raíz, autoridad constitucional, estado protegido ni efectos— o si el estado inicial participa en la confianza/autoridad constitucional. La primera ruta requiere una delimitación explícita de alcance y evidencia de que no habilita efectos; la segunda sigue STOP/UNKNOWN hasta que exista base independiente y contrato aplicable.
- No ampliar por analogía Constitution Authority Context; no crear `BootstrapAuthority` paralelo; no inferir autoridad por ausencia de archivo. No se eligió una ruta automáticamente.
- Solo documentación. Sin cambios de runtime/tests/workflows/configuración; sin pruebas ni CI. Gates intactos: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada.

---

# ACTUALIZACIÓN PRIORITARIA — ALCANCE CONSTITUCIONAL NO CUBRE BOOTSTRAP LOCAL (2026-10-26)

- Se leyó directamente el contrato [Minimum Core Constitution Authority Context](BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md). Su propósito explícito es reconocer el régimen constitucional para una vinculación posterior de Policy; no define autorización para crear el primer archivo de estado persistente.
- Conclusión de alcance: el owner semántico está localizado, pero su contrato **no cubre explícitamente** la inicialización local. No se infiere esa cobertura por analogía ni se amplía silenciosamente el contrato.
- Actualizada la [propuesta de bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md), commit `72c09754ea7da4cfdd10b3d65ea2afc63b494dc9`.
- Siguiente decisión de diseño: establecer si la inicialización local está gobernada por una regla constitucional existente y demostrable o si hace falta una delimitación explícita aprobada por el propietario. No crear una segunda raíz/owner para cerrar la brecha.
- Sin cambios de runtime/tests/workflows/configuración; sin pruebas ni CI. Gates intactos: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada.

---

# ACTUALIZACIÓN PRIORITARIA — OWNER CONSTITUCIONAL EXISTENTE LOCALIZADO (2026-10-26)

- Se localizó el owner semántico ya documentado: [Minimum Core Constitution Authority Context Contract](BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md). Core debe reconocer el régimen constitucional desde una base de confianza ya reconocida; los datos del caller no lo establecen ni conceden ejecución.
- La [auditoría de reutilización](BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_REUSE_AUDIT_2026-10-08.md) está cerrada y concluye que no se encontró una ruta implementada actual que establezca ese contexto. El mapa de funciones raíz confirma que el reconocimiento independiente inicial y la aplicación protegida real siguen sin demostrarse.
- Actualizada la [propuesta de bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md), commit `dccf1b8ecd15d460de93efb0bc00c5f7614c8abb`.
- Conclusión: owner semántico encontrado, mecanismo independiente no encontrado/demostrado. No crear `BootstrapAuthority` paralelo. No dar por resuelta la autoridad del bootstrap de persistencia; falta comprobar si el alcance del contrato constitucional cubre explícitamente la inicialización local.
- Próximo paso: delimitar esa correspondencia contractual, sin ampliar silenciosamente la autoridad. No implementar ni ejecutar pruebas/CI mientras la base independiente y el alcance sigan sin establecerse.
- Solo documentación; no runtime/tests/workflows/configuración ni tests/CI. Gates: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada.

---

# ACTUALIZACIÓN PRIORITARIA — REVISIÓN DE AUTORIDAD PARA BOOTSTRAP (2026-10-26)

- Se contrastó la propuesta de bootstrap con la regla activa MASTER + AB + P/P112 y el análisis de contr efectos futuros; no se reabrieron auditorías históricas.
- Actualizada la [propuesta de contrato para bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md), commit `704385ff2e5ac36da317ec4ceae19b0db99d5e84`.
- Resultado: opción B sigue aceptada como separación entre bootstrap explícito y commit normal. La fuente/owner concreto de autoridad para el bootstrap continúa `UNKNOWN/PENDING`. La investigación histórica menciona `BootstrapAuthority`, pero es una propuesta de investigación, no un objeto NCS aprobado; no se adopta ni se inventa una raíz paralela.
- Contr efectos considerados: riesgo de autoridad circular o duplicada, autoautorización, ampliación de alcance y acoplamiento futuro. La ausencia del archivo no puede demostrar autoridad. Si la autoridad raíz, el alcance o las precondiciones no se pueden establecer, bootstrap debe detenerse.
- Próximo paso válido: localizar el owner canónico ya establecido en MASTER/CORE para autoridad raíz/inicialización; si no existe una definición aplicable, mantener la cuestión pendiente para decisión explícita del propietario. No implementar ni ejecutar tests/CI mientras la autoridad contractual siga sin resolver.
- Solo documentación; no cambios de runtime/tests/workflows/configuración y no tests/CI. Gates intactos: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada.

---

# ACTUALIZACIÓN PRIORITARIA — DECISIÓN DE INICIALIZACIÓN EXPLÍCITA (2026-10-26)

- Decisión del propietario: adoptar la opción B, inicialización explícita separada del commit condicional normal. La ausencia de archivo no autoriza bootstrap automático; un archivo existente corrupto debe preservarse; conflictos concurrentes no deben sobrescribirse; UNKNOWN no admite reintento automático.
- Registro: [Decisión sobre inicialización de estado ausente](BUILD/NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md), commit `64d3b9423a6682d68a68b29f0bab9b904eb959cf`.
- Contrato técnico propuesto, no ratificado ni implementado: [Propuesta de contrato para bootstrap explícito](BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md), commit `abbe4804435013ab0f0d8322909d7632b9d51aeb`.
- Hallazgo estático que requiere regresión: `persistState` usa por defecto `loadState` tolerante y el adaptador no pasa `loadCurrentState`; no se ha demostrado que el commit real preserve un archivo corrupto. Véanse los blobs registrados en la propuesta.
- Próximo paso: definir autoridad, esquema inicial, creación exclusiva/concurrencia, semántica de resultados y durabilidad antes de autorizar implementación. G1–G4 siguen pendientes de ejecución.
- Solo documentación añadida; no runtime/tests/workflows/configuración, no tests ni CI ejecutados. Estado canónico sin cierre: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada.

---

# ACTUALIZACIÓN PRIORITARIA — DISEÑO DE REGRESIÓN G1–G4 (2026-10-26)

- Plan de pruebas concretas creado: [Diseño de regresión para persistencia/UNKNOWN](BUILD/NCS_M0_PERSISTENCE_UNKNOWN_REGRESSION_TEST_DESIGN_2026-10-26.md), commit `c65dc2b6cbe0d189085d05d6ad96144db5cbe5f8`.
- El plan fija preparación, escenarios, aserciones y límites de evidencia para: archivo corrupto con adaptador real (G1), distinción archivo ausente/corrupto (G2), getter hostil `error.code` (G3) y error posterior a reemplazo visible (G4).
- G2 conserva una decisión explícitamente pendiente: cuándo es legítima la inicialización de un archivo ausente. No confundirla con tolerar un archivo existente corrupto.
- La integración de `executeProtectedTransition` queda separada de G1–G4 hasta ratificar el mecanismo canónico de runtime; no se asume que integrar ese motor sea la solución.
- Solo se añadieron documentos. No se modificaron runtime/tests/workflows/configuración; no se ejecutaron pruebas ni CI.
- Estado canónico sin cambios: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada.

---

# ACTUALIZACIÓN PRIORITARIA — MAPA DE COBERTURA R1–R4 (2026-10-26)

- Mapa de cobertura estática creado: [Cobertura existente frente a R1–R4](BUILD/NCS_M0_PERSISTENCE_UNKNOWN_TEST_COVERAGE_CROSSWALK_2026-10-26.md), commit `1da22af739a10db928944e9eb3a02390d02ed209`.
- Corrección importante de precisión: `simulation-restart-persistence.test.mjs` ya prueba `loadStateStrict` para archivo ausente, JSON inválido, revisión ausente y esquema inválido. Sin embargo, esto no prueba que el adaptador condicional utilice ese loader ni que preserve un archivo corrupto cuando se invoca el commit condicional real.
- La prueba `conditional-commit-persist-state.test.mjs` ya cubre la ruta feliz con archivo real, conflicto de revisión y clasificación UNKNOWN con stubs; `simulation-restart-persistence.test.mjs` cubre fallos inyectados antes del reemplazo. Siguen faltando la integración adaptador+archivo corrupto, getter hostil en `error.code` y error posterior al reemplazo.
- La nueva matriz evita duplicar cobertura existente y separa tests presentes de pruebas faltantes. La revisión fue estática: no se ejecutaron tests ni CI, no hubo cambios de runtime/tests/workflows.
- Estado canónico sin cambios: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada.

---

# ACTUALIZACIÓN PRIORITARIA — ESPECIFICACIÓN DE ACEPTACIÓN PERSISTENCIA/UNKNOWN (2026-10-26)

- Especificación documental añadida: [NCS M0 — Especificación de aceptación para persistencia y UNKNOWN](BUILD/NCS_M0_PERSISTENCE_UNKNOWN_ACCEPTANCE_SPEC_2026-10-26.md), commit `87c46097b0ff450ed06dd616ec59a8d71d621697`.
- Consolida criterios propuestos R1–R6: estado corrupto/ilegible, clasificación robusta de errores, semántica de `COMMITTED/UNKNOWN/persisted`, integración con consumidor, límites F1/F2/F3 y reconciliación autorizada.
- La propuesta no implementa código, no modifica tests/workflows, no ejecuta CI y no cierra M0. No autoriza integrar `executeProtectedTransition` ni activar efectos.
- Revisiones externas recibidas de Claude, Perplexity y Qwen: se usan como fuentes de hallazgos a validar, no como sustituto de pruebas reproducibles. Coincidencia principal: el motor `executeProtectedTransition` no tiene consumidor estático de producción en el alcance inspeccionado; el runtime real tiene sus propios mecanismos de owner/effect journal. La integración del motor sigue siendo decisión abierta.
- Confirmación de lectura estática: el adaptador `conditional-commit-persist-state.mjs` llama a `persistState` sin `loadCurrentState` explícito; `scripts/simulate.mjs` contiene tanto `loadState()` tolerante como `loadStateStrict()`. Aceptación propuesta: la ruta de commit condicional no debe convertir estado ilegible/corrupto en revisión cero ni sobrescribirlo silenciosamente.
- La ruta de `error?.code` en el adaptador puede arrojar si el valor lanzado tiene un getter hostil; requiere prueba antes de cualquier corrección. Un resultado UNKNOWN tampoco debe interpretarse como prueba de que no hubo persistencia.
- Estado canónico sin cambios: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada. No se ejecutaron tests ni CI en este avance.

---

# ACTUALIZACIÓN PRIORITARIA — PROPUESTA DE LÍNEA DE META M0 (2026-10-26)

- Paquete de revisión independiente preparado para Claude, Perplexity y Qwen: [órdenes de revisión IA](BUILD/NCS_M0_INDEPENDENT_AI_REVIEW_ORDERS_2026-10-26.md), commit `7dd2912f96fe0888721bc500a6d05c2f2a20106e`. **Preparado, no enviado:** no hay evidencia de que esas IAs hayan recibido o respondido las órdenes. Alcance docs-only; sin cambios de runtime/tests/workflows.

- Propuesta docs-only creada: [Línea de meta y criterios de aceptación M0](BUILD/NCS_M0_EXIT_CRITERIA_PROPOSAL_2026-10-26.md), commit `554134f6aa3b4c634528f0341d2d2b2819846f62`.
- Define cinco grupos de aceptación: alcance/arquitectura; persistencia/admisión; outcomes ambiguos; autoridad/efectos; reproducibilidad/evidencia.
- No ratificada: no declara M0 completo ni cambia los gates canónicos. No modifica runtime/tests/workflows/dispositivo.
- Contrato de producto `COMMIT.UNKNOWN`: alternativa A ratificada por el owner; outcome UNKNOWN se conserva sin resolver hasta intervención explícita. Reconciliación automática futura, F1/F2/F3, evidencia causal y recuperación siguen pendientes. M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; reconciliación no integrada; causa primaria del run `40270739196` `UNKNOWN`.
- CI para el commit de la propuesta estaba `in_progress` al registrar esta actualización; no se afirma su resultado.

---

# ACTUALIZACIÓN PRIORITARIA — MATRIZ DE ACEPTACIÓN UNKNOWN (2026-10-26)

- Nueva [Matriz de aceptación para outcomes UNKNOWN](BUILD/NCS_M0_UNKNOWN_OUTCOME_ACCEPTANCE_TEST_MATRIX_2026-10-26.md), commit `b10bb770d5351e9a008df3460c20d1ad390855ee`.
- La matriz separa 10 escenarios UO-01–UO-10, cobertura identificada y aceptación pendiente: error de persistencia, outcome UNKNOWN, excepción de commit, evidencia no confiable, contrato del consumidor, no reintento automático, bloqueo de efectos protegidos, preservación diagnóstica y niveles de durabilidad.
- Identifica como pendientes la cobertura end-to-end de producto, la ausencia global de reintentos/efectos laterales, y el contrato de propagación de `errorCode`. No crea autoridad ni evidencia causal artificial.
- Docs-only: runtime/tests/workflows sin cambios; tests/CI no ejecutados. La alternativa A está ratificada como contrato de producto; su aceptación de implementación sigue pendiente de evidencia. Gates intactos: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; reconciliación no integrada; causa primaria de run `40270739196` `UNKNOWN`.

---

# ACTUALIZACIÓN PRIORITARIA — MAPEO DE PRUEBAS Y BRECHAS DEL GATE UNKNOWN (2026-10-26)

- Se amplió el [Gate del contrato de producto para outcomes UNKNOWN](BUILD/NCS_M0_UNKNOWN_OUTCOME_PRODUCT_CONTRACT_GATE_2026-10-26.md), commit `b5c98b65d76345afe1d3b196428d09364b69f760`, con cobertura existente y brechas verificadas por lectura estática.
- Tests existentes contienen cobertura fail-closed: el adaptador conserva `EIO`/`PERSISTENCE_UNKNOWN` como `COMMIT.UNKNOWN`; la transición devuelve `RECONCILE_REQUIRED`; el reconciliador no confía en `authoritative: true` aportado por el llamador.
- Brecha observada: el `errorCode` del adaptador se pierde en la razón genérica del outcome `RECONCILE_REQUIRED`. No se cambió runtime porque el contrato de salida/diagnóstico requiere decisión y autorización específica.
- También sigue sin estar demostrado el contrato de producto para presentar `UNRESOLVED`, la ausencia global de reintentos/efectos fuera del flujo inspeccionado, ni durabilidad F2/F3.
- Solo documentación: runtime/tests/workflows sin cambios; tests/CI no ejecutados en este avance. Gates intactos: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; reconciliación no integrada; causa primaria del run `40270739196` `UNKNOWN`.

---

# ACTUALIZACIÓN PRIORITARIA — GATE DE CONTRATO DE PRODUCTO PARA UNKNOWN (2026-10-26)

- Recomendación docs-only: [Gate del contrato de producto para outcomes UNKNOWN](BUILD/NCS_M0_UNKNOWN_OUTCOME_PRODUCT_CONTRACT_GATE_2026-10-26.md), commit `9f1ca402e818bd9fc81e22d255f00e0f69e6ae5f`.
- Se separa el requisito mínimo de seguridad de la capacidad opcional de reconciliación automática. Propuesta no ratificada: M0 puede preservar `COMMIT.UNKNOWN → RECONCILE_REQUIRED` y dejar el caso `UNRESOLVED` hasta intervención explícita, salvo que el owner exija resolución automática.
- El contrato de durabilidad debe indicar si cubre fallo de proceso, caída del SO o pérdida de energía. La primitiva actual no demuestra por sí sola garantías F2/F3.
- Solo documentación: runtime/tests/workflows sin cambios; tests/CI no ejecutados. No se conectó el puerto ni se añadió mecanismo de persistencia.
- Gates intactos: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; reconciliación no integrada; causa primaria del run `40270739196` `UNKNOWN`.

---

# ACTUALIZACIÓN PRIORITARIA — FACTIBILIDAD DE OPCIÓN C (2026-10-26)

- Análisis docs-only: [Factibilidad de opción C: exclusión de escritores y durabilidad](BUILD/NCS_M0_OPTION_C_WRITER_EXCLUSION_FEASIBILITY_2026-10-26.md), commit `d55f536f01c48ab29058dd8333eb9a02cb0e3da3`.
- Con la evidencia actual, opción C no demuestra exclusión de extremo a extremo de todos los escritores ni durabilidad frente a todos los cortes de fallo. El bloqueo de `persistState()` coordina solo a escritores cooperantes; `rename()` no demuestra por sí solo durabilidad ante pérdida de energía.
- Decisión A ratificada para M0: conservar `COMMIT.UNKNOWN → RECONCILE_REQUIRED` y el reconciliador fail-closed; si no se exige resolución automática, mantener el caso sin resolver hasta intervención explícita.
- Solo documentación: runtime/tests/workflows sin cambios; tests/CI no ejecutados. No se integró el puerto de reconciliación ni se añadió mecanismo de persistencia.
- Gates intactos: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; reconciliación no integrada. Causa primaria exacta del run `40270739196`: `UNKNOWN`.

---

# ACTUALIZACIÓN PRIORITARIA — BLOQUEO DE CORRESPONDENCIA CAUSAL (2026-10-26)

- Memo docs-only: [Prueba de correspondencia causal pendiente](BUILD/NCS_M0_CAUSAL_CORRESPONDENCE_GAP_DECISION_2026-10-26.md).
- No se ha demostrado una prueba durable independiente que vincule el snapshot con la transición concreta. Revisión o similitud de contenido no bastan por sí solas.
- Mantener `COMMIT.UNKNOWN → RECONCILE_REQUIRED`; reconciliador fail-closed y puerto sin integrar hasta definir y ratificar evidencia causal.
- Solo documentación; runtime/tests/workflows sin cambios. Tests/CI no ejecutados.
- Gates: M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; reconciliación no integrada.

---

# ACTUALIZACIÓN PRIORITARIA — MATRIZ DE FACTIBILIDAD DE ESCENARIOS DE RECONCILIACIÓN (2026-10-26)

- Matriz docs-only añadida: [Matriz de factibilidad de escenarios de reconciliación](BUILD/NCS_M0_RECONCILIATION_SCENARIO_FEASIBILITY_MATRIX_2026-10-26.md).
- Se documentan escenarios de snapshot coincidente, revisión antigua/superior, lectura fallida, corrupción, múltiples writers, conflicto condicional y fallos posteriores a escritura/cleanup.
- Reafirma la separación entre resultado de llamada, estado durable observado, correspondencia causal y outcome terminal. La coincidencia de revisión no prueba causalidad.
- Solo documentación: no se modificaron runtime/tests/workflows y no se ejecutaron tests ni CI.
- Gates intactos: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; integración de reconciliación no autorizada y no implementada.

---

# ACTUALIZACIÓN PRIORITARIA — NCS M0 — SIGUIENTE DISEÑO DE FRONTERA DE RECONCILIACIÓN (2026-10-26)

- Diseño estático añadido: [Siguiente diseño de frontera de reconciliación](BUILD/NCS_M0_RECONCILIATION_BOUNDARY_NEXT_DESIGN_2026-10-26.md), commit `b9c6552df0309f0bf1cbecacca6a5cb2b46e79b9`.
- Confirma que el adaptador conserva `errorCode` en `COMMIT.UNKNOWN`, pero la transición lo pierde en una razón genérica; el puerto de reconciliación existe pero no está conectado a `executeProtectedTransition()`; el reconciliador actual permanece `UNRESOLVED` porque no hay verificador independiente ni evidencia durable autenticada conectada.
- Define como requisito previo distinguir resultado de llamada, estado durable, correspondencia causal y clasificación terminal. La coincidencia de revisión por sí sola no demuestra que el snapshot pertenezca a la transición candidata.
- Solo documentación: no se modificaron runtime/tests/workflows y no se ejecutaron tests ni CI. La causa primaria exacta del run `40270739196` sigue `UNKNOWN`.
- No cambia la autorización: la reparación de rutas opción B es el único cambio de runtime previamente autorizado; cualquier nueva integración de reconciliación requiere autorización acotada propia. M0 `INCOMPLETO`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# ACTUALIZACIÓN PRIORITARIA — REPARACIÓN DE RUTAS DE PERSISTENCIA B (2026-10-26)

- El owner ratificó opción B y autorizó el cambio acotado de runtime/tests.
- Runtime actualizado: `scripts/simulate.mjs`, commit `b96d8f6694aa87601d1da1b85f0c337d62b84f85`.
- Tests actualizados: `tests/nexo/conditional-commit-persist-state.test.mjs`, commit `d65b5d65ff0ea8efc18cc7397737eb6abe3f68ae`.
- Workflow `Nexo — deterministic persistence tests`: run `40366480168`, HEAD `d65b5d65ff0ea8efc18cc7397737eb6abe3f68ae`, job `tests` y paso `Run tests` en `success`. [Ejecución CI](https://github.com/snowdenxrp/aldea-ia/actions/runs/40366480168).
- Evidencia detallada y límites: [Implementación opción B y CI](BUILD/NCS_M0_PERSISTENCE_PATH_OPTION_B_IMPLEMENTATION_AND_CI_2026-10-26.md).
- Alcance limitado a persistencia; M0 sigue `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap sin seleccionar. No se afirma CI global verde ni reconciliación de outcomes ambiguos resuelta.

---

# ACTUALIZACIÓN PRIORITARIA — EVIDENCIA RECUPERADA DEL FALLO CI DE PERSISTENCIA (2026-10-26)

- Evidencia del log del run `40270739196` / job `121402789784` recuperada y registrada: [Evidencia del fallo CI de persistencia](BUILD/NCS_M0_CI_PERSISTENCE_FAILURE_LOG_EVIDENCE_2026-10-26.md), commit `6a7635c0cafe8b6dffb8985a07990ed674df5342`.
- El log confirma la aserción en `tests/nexo/conditional-commit-persist-state.test.mjs:88:10`: actual `RECONCILE_REQUIRED`, esperado `SAFE_COMMIT`. No expone la excepción primaria ni el `errorCode` del adapter.
- Se registra explícitamente que el defecto estático de tipo/ruta es una hipótesis fuerte, no causa raíz probada. No atribuir a `rename()`, `EXDEV` ni al estado final del destino sin prueba.
- Diagnóstico siguiente propuesto: prueba aislada, captura del resultado tipado del adapter, pruebas de ruta nativa/URL `file:` y fallos inyectados de escritura/rename, después de ratificar el contrato de ruta. No “arreglar” relajando la aserción.
- Solo documentación; runtime/tests/workflows sin cambios; no se ejecutó test aislado ni CI. Causa raíz sigue `UNKNOWN`.

Gates sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; authorization `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.

---

# ACTUALIZACIÓN PRIORITARIA — MATRIZ DE RECONCILIACIÓN Y OBSERVABILIDAD (2026-10-26)

- Documento de diseño añadido: [Matriz de reconciliación y observabilidad de commit](BUILD/NCS_M0_COMMIT_RECONCILIATION_OBSERVABILITY_MATRIX_2026-10-26.md), commit `5d5f8655163bc0632c68f2cd4d69a993860bdba9`.
- La matriz separa el error de la operación del estado durable demostrado; define evidencia mínima por escenario, códigos de diagnóstico candidatos, pruebas de aceptación y decisiones pendientes de ratificación.
- Recalca que un `COMMIT.UNKNOWN`, un fallo de cleanup o un log ausente no pueden convertirse por inferencia en `SAFE_COMMIT`. La reconciliación debe probar snapshot íntegro, revisión y correspondencia con la operación; semántica final pendiente.
- Solo documentación. No se ejecutaron tests ni CI; runtime/tests/workflows sin cambios. Causa exacta del run `40270739196` sigue `UNKNOWN`. Contrato de rutas A/B/C y política de cleanup/observabilidad no ratificados.

Gates sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; authorization `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.

---

# ACTUALIZACIÓN PRIORITARIA — RESULTADO DE COMMIT, RECONCILIACIÓN Y OBSERVABILIDAD (2026-10-26)

- Revisión estática read-only documentada: [Resultado de commit, reconciliación y brechas de observabilidad](BUILD/NCS_M0_COMMIT_OUTCOME_RECONCILIATION_OBSERVABILITY_2026-10-26.md), commit `26c8db311f2b22eb738be0b1922e7daffaca6bd9`.
- Hallazgos: el adaptador conserva `errorCode` al devolver `COMMIT.UNKNOWN`, pero `executeProtectedTransition()` lo reduce a una razón genérica; el core no invoca `reconciliation.reconcile` en el tramo inspeccionado; cleanup de temporales y release lock requieren pruebas explícitas para fijar preservación de error primario/secundario.
- El core no promueve un resultado de commit `UNKNOWN` a `SAFE_COMMIT`; lo clasifica como `RECONCILE_REQUIRED`. Esto es una clasificación conservadora, no una reconciliación probada.
- No se ejecutaron tests ni CI; runtime/tests/workflows no cambiaron. Causa exacta del run `40270739196` sigue `UNKNOWN`. Contrato de rutas A/B/C y política de observabilidad/cleanup siguen sin ratificar.

Gates sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; authorization `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.

---

# ACTUALIZACIÓN PRIORITARIA — PROPUESTA DE POLÍTICA DE RUTAS (2026-10-26)

- Documento añadido en commit `6ce96764c620c5645bec31eb618290d902919b6d`: [Propuesta de política para rutas de persistencia](BUILD/NCS_M0_PERSISTENCE_PATH_POLICY_PROPOSAL_2026-10-26.md).
- Convierte en criterios evaluables las decisiones abiertas de rutas relativas, URL `file:`, caracteres codificados, enlaces simbólicos, errores de cleanup y soporte multiplataforma.
- Es una propuesta no ratificada: no selecciona oficialmente A/B/C ni autoriza cambios de runtime.
- Incluye pruebas de aceptación propuestas; no ejecutadas. Runtime/tests/workflows sin cambios; CI no ejecutado.
- Gates sin cambio: M0 INCOMPLETO; D0/D1-DESIGN/D2/D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; authorization NOT_EVALUATED; raíz PENDING/UNKNOWN; efectos protegidos STOP; bootstrap A/B/C/D sin seleccionar.

---

# ACTUALIZACIÓN PRIORITARIA — INVENTARIO DE FRONTERAS DE PERSISTENCIA (2026-10-26)

- HEAD consultado antes de esta actualización: `6c4bc757d076857cfe385106d6a734c8c1ee6761`; inventario añadido en commit `4dd4a6e7990eaa0b4ac770f3d97c3969c34384ed`.
- Documento: [Inventario de callers y fronteras de persistencia](BUILD/NCS_M0_PERSISTENCE_CALLER_BOUNDARY_INVENTORY_2026-10-26.md).
- Lectura acotada confirma: `scripts/simulate.mjs` usa URL `file:` en la ruta principal; `persistState()` deriva lock/temporales mediante `.pathname`; el adaptador de commit exige string; pruebas de reinicio usan URL `file:`. El inventario declara explícitamente que no es exhaustivo.
- No se selecciona A/B/C. La causa exacta del run CI `40270739196` sigue UNKNOWN.
- Solo documentación; runtime/tests/workflows sin cambios; no se ejecutaron tests ni CI.
- Gates sin cambio: M0 INCOMPLETO; D0/D1-DESIGN/D2/D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; authorization NOT_EVALUATED; raíz PENDING/UNKNOWN; efectos protegidos STOP; bootstrap A/B/C/D sin seleccionar.

---

# ACTUALIZACIÓN PRIORITARIA — MATRIZ DE DECISIÓN DE RUTAS (2026-10-26)

- HEAD previo verificado: `5cd257aa1f1f7c0934c64a9fb0affc69cbf2b6ad`; documento de matriz añadido en commit `695683a71eff6b4006de8f6b5ec22c2ff48769e8`.
- Documento: [Matriz de decisión del contrato de rutas de persistencia](BUILD/NCS_M0_PERSISTENCE_PATH_CONTRACT_DECISION_MATRIX_2026-10-26.md).
- Compara tres contratos; recomienda evaluar provisionalmente la aceptación explícita de string y URL `file:` en `persistState()` con normalización central. No selecciona ni ratifica opción.
- Hecho estático: las fuentes examinadas mezclan string y URL `file:`; la causa exacta del run CI `40270739196` sigue UNKNOWN.
- Solo documentación. Runtime/tests/workflows no modificados; no se ejecutaron pruebas ni CI.
- Gates sin cambio: M0 INCOMPLETO; D0/D1-DESIGN/D2/D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; authorization NOT_EVALUATED; raíz PENDING/UNKNOWN; efectos protegidos STOP; bootstrap A/B/C/D sin seleccionar.

---

# ACTUALIZACIÓN PRIORITARIA — CONTRATO DE RUTAS DE PERSISTENCIA Y CI (2026-10-26)

- HEAD consultado inmediatamente antes de este registro: `452a018dc52ea1f1a2089d4465f9fa5ca9b3f784`.
- Informe documental añadido: [NCS M0 — Contrato de rutas de persistencia y fallo CI](BUILD/NCS_M0_PERSISTENCE_PATH_CONTRACT_AND_CI_FAILURE_2026-10-26.md), commit `452a018dc52ea1f1a2089d4465f9fa5ca9b3f784`.
- Run existente revisado: [Nexo — deterministic persistence tests, run 40270739196](https://github.com/snowdenxrp/aldea-ia/actions/runs/40270739196), job `121402789784`, falló en `tests/nexo/conditional-commit-persist-state.test.mjs:88`: actual `RECONCILE_REQUIRED`, esperado `SAFE_COMMIT`.
- Defecto estático confirmado: `scripts/simulate.mjs` deriva lock y temporal mediante `statePath.pathname`, aunque el adaptador exige y la prueba fallida pasa `statePath` como cadena. La causa exacta de la excepción del CI sigue UNKNOWN: los logs disponibles solo muestran la aserción.
- No se cambió runtime, tests ni workflows; no se ejecutaron pruebas ni CI durante esta revisión. Solo se consultó el run existente.
- Próximo paso: decidir documentalmente el contrato de ruta (string/URL `file:`, rutas relativas y normalización canónica) y preparar criterios de regresión. No implementar ni ejecutar validación sin autorización específica.

Gates sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.

---

# ACTUALIZACIÓN PRIORITARIA — INVENTARIO DE RELANZADORES (2026-10-26)

- HEAD observado inmediatamente antes de esta actualización: `17f6244542dde9975e865dc5337b857cb5e9e4cc`.
- Se añadió al protocolo de equipo una evaluación documental de la brecha de completitud del inventario: `NEXO_NCS/AI_TEAM_PROTOCOL_AND_ACTIVE_TASK.md`, blob `4b6092f6dba367ea585af6f5bf3ddf6307c8360c`; commit `17f6244542dde9975e865dc5337b857cb5e9e4cc`.
- Claude informó un commit local `ceaebb1` y un parche local, pero no se integraron. La adición remota es una revisión documental independiente basada en la evidencia descrita y las fuentes existentes.
- Criterio pendiente: documentar alcance, fuentes de descubrimiento, límites/omisiones y evidencia de que el inventario incluye todos los actores capaces de escribir o relanzar escritores dentro de ese alcance. Gatear solo al caller principal no demuestra quiescencia global. Si no se demuestra exhaustividad, `UNKNOWN/BLOCKED`.
- La evidencia disponible no demuestra exhaustividad empírica en el entorno real ni cierra P-01/P-05. `CV-01` no es el ID que utiliza la matriz actual (`CVM-01…CVM-10`); no renumerar por inferencia.
- No se ejecutaron tests/CI/código y no se modificaron runtime, workflows ni dispositivo.

Gates sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; A/B/C/D sin seleccionar.

---

# HANDOFF PRIORITARIO — CONTINUIDAD Y REGLAS DE AUTORIZACIÓN CODEX (2026-10-25)

- Handoff de siguiente chat creado: [NCS_NEXT_CHAT_HANDOFF_2026-10-25_CONTINUITY_CODEX_AUTHORIZATION.md](BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-25_CONTINUITY_CODEX_AUTHORIZATION.md), commit `46cd56d63aede6af289529d7f21bdee8f4188ce2`.
- Incluye puerta de entrada, estado M1 más reciente que figura en este STATUS, resultados NCS/M0 ya establecidos, gates canónicos, restricciones de ejecución y próximo paso documental.
- Regla Codex incorporada: no enviar follow-up a una tarea existente sin autorización explícita del usuario o un flujo de coordinación previamente autorizado que la incluya; un mensaje entrante de otra tarea/orquestador no basta. Omitir `model` y `effort` de `turn_start_params`. No se envió ningún mensaje a tarea Codex.
- Antes de continuar, consultar de nuevo el HEAD; no asumir que el pin histórico sigue actual.
- Continuidad autorizada solo documental según los checkpoints vigentes. No tests/CI, runtime, workflows, build, APK, instalación ni dispositivo.
- Gates no cambian: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; authorization `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.

---

# ACTUALIZACIÓN PRIORITARIA — M1: FUENTE UPSTREAM FIJADA Y PARCHE NO APLICADO (2026-10-26)

- HEAD observado inmediatamente antes de la última actualización de STATUS: `dacd869daf54b5348599027fc789417de3533cb9`. Consultar la rama de nuevo al retomar.
- Hallazgo: `prepare-llama-android.sh` (blob `1981bf23223f5ac580ed604c7c67efbcd54e86c8`) fija upstream `llama.cpp` SHA `10a60cf303566e10d6a7a2774c17d2085503d87b` y copia solo configuración Gradle; no ejecuta `apply-native-diagnostics.py`.
- Workflow `.github/workflows/nexo-m1-android-build.yml` (blob `b21eb080d9024c7cf580b7f06729bbe65a89cb59`) no aplica el parche histórico. El upstream fijado contiene `use_jinja=false` en `ai_chat.cpp` líneas 289–297 y la contabilidad anterior del límite en líneas 432–448.
- Informe: [M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md](M1_ANDROID/M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md), commit `7af4d686e06bc093624a622846c60166e842c402`.
- Registro de bloqueo: commit `fe0736296a486c4a37f371bcca32bbc64d6ec20c`. Handoff: commit `b7512f61b856e8b60e2586b9e352918587b12162`.
- Conclusión: el parche histórico no forma parte del flujo de build definido por los archivos inspeccionados. No se ejecutó build; APK instalada sigue UNKNOWN; causa completa del síntoma no probada.
- Continuidad autorizada solo documental: no tests/CI, build, APK, runtime, instalación ni dispositivo.

Gates NCS no cambian: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.

---

# ACTUALIZACIÓN PRIORITARIA — RECONCILIACIÓN M1 (2026-10-26)

- HEAD consultado inmediatamente antes de esta actualización: `59583e40b34068212ef0b9b3f9da04bc89373481`. Volver a consultar la rama antes de continuar.
- La rama `ncs/m1-fix-chat-context-generation-limit` está divergida de `ncs-clean-architecture`; no es un parche limpio.
- `MainActivity.kt` en ambas ramas mantiene el mismo flujo central de envío del prompt y presentación directa del stream.
- El script histórico de corrección nativa `apply-native-diagnostics.py` y los documentos históricos de auditoría/regresión no están en el árbol canónico inspeccionado. No se ejecutó el script; no se ha demostrado que sus cambios estén integrados ni que la APK instalada corresponda a ellos.
- Artefacto de comparación: [M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md](M1_ANDROID/M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md), commit `86db80ff52566c48e774888b02a93ac387255ec1`.
- Bloqueo M1 actualizado: commit `2c88171962b59d90dd75fa28eb856f5e2712279a`. Handoff actualizado: commit `6980e8975eaa7a66185ed5cfb213ce18867da627`.
- Resultado: corrección integrada `UNKNOWN / NO EVIDENCIADA`; síntoma de respuestas repetidas permanece abierto. No hacer cherry-pick ni aplicar el script por inferencia.
- Continuidad autorizada solo documental: no tests/CI, build, APK, instalación, cambios runtime ni dispositivo.

Gates NCS no cambian: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; bootstrap A/B/C/D sin seleccionar.

---

# PUERTA CANÓNICA DE CONTINUIDAD — «CONTINÚA» (2026-10-25)

## Punteros activos verificados — revisión posterior a H8

- Rama: `ncs-clean-architecture`.
- HEAD consultado en GitHub inmediatamente antes de esta actualización: `836719f0a3a2e7a00242f7e5bb9ada086639299b`. Volver a consultar el HEAD antes de continuar; este valor es un pin de observación, no una garantía de que la rama no avance.
- Este bloque es el índice operativo. Las entradas rotuladas «REGISTRO HISTÓRICO» más abajo preservan contexto y no sustituyen los pins listados aquí.

### Artefactos activos para la continuidad

- **Corte y cierre D1:** [matriz de responsabilidad y cierre](BUILD/NCS_M0_D1_MINIMUM_RESPONSIBILITY_CUT_AND_CLOSURE_MATRIX_2026-10-25.md) — blob `a15c5ec173683fdd68246f076ba59d85feece5fa`.
- **Validación controlada documental:** [matriz claim/evidencia y perfil de validación](BUILD/NCS_M0_CONTROLLED_VALIDATION_DESIGN_AND_CLAIM_EVIDENCE_MATRIX_2026-10-26.md) — commit `dfff88c3dbacf09064fd883decff1dbe4b6849ce`; diseño únicamente, no autoriza ejecución.
- **Bloqueo M1 de respuestas repetidas/contexto:** [registro de regresión y estado](M1_ANDROID/M1_REPEATED_RESPONSE_CONTEXT_GENERATION_BLOCKER_2026-10-26.md) — commit `fe0736296a486c4a37f371bcca32bbc64d6ec20c`; síntoma conocido, no declarado resuelto; solo documentación.
- **Reconciliación de la rama histórica M1:** [comparación exacta de rama/fuentes](M1_ANDROID/M1_HISTORIC_FIX_BRANCH_RECONCILIATION_2026-10-26.md) — commit `71422c8b88f6cd06d0e3d4b5018e9bf2f6cd23e6`; la corrección nativa no está evidenciada como integrada.
- **Callers y hueco de raíz:** [inventario acotado](BUILD/NCS_M0_CALLER_INVENTORY_AND_ROOT_PATH_GAP_2026-10-25.md) — blob `e79f8672c5c8b858fffe2015cc18544007449756`.
- **Contrato de raíz vs. CLI:** [matriz de conformidad](BUILD/NCS_M0_ROOT_CONTRACT_VS_EXISTING_CLI_CONFORMANCE_2026-10-25.md) — blob `3dec849623f168bb76435a2a618210926cee98db`.
- **Bootstrap:** [matriz de aceptación de alternativas](BUILD/NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md) — blob `89558fb688f10c0cfc95c12430114a5837e124cc`; no se ha seleccionado A/B/C/D.
- **Entorno/quiescencia:** [perfil D3 requerido](BUILD/NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md) — blob `7a790ee242d3c32e7bad50f7dfd52ba49f03e989`.
- **Handoff:** [reconciliación D1 para el siguiente chat](BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md) — commit `2da0c176d655d6b7b0f97877b900700be05bd989`; incluye CVM-01…CVM-10, el límite M0/M1 y la reconciliación exacta de la rama histórica M1.
- **Coordinación IA:** [protocolo de equipo y tarea activa](AI_TEAM_PROTOCOL_AND_ACTIVE_TASK.md) — blob `d7db844310afbc6235492bcba022d0e288fb3cae`.
- **Visión maestra / Core:** [MASTER README](MASTER/README.md) — blob `97fbfc63004432de3d2e99e66f534d4e0d8ed774`; [CORE README](CORE/README.md) — blob `82db0ac21edcb9a9bdcbb2760da8f48c7ad3ca36`.

### Siguiente bloqueo real

La evidencia del repositorio no identifica un caller de provisioning operativo que conecte la raíz explícita ratificada `--root <directory>` con las stores canónicas y una autoridad operacional demostrada. No inventar el caller, un wrapper ni una política de fallback. La pregunta pendiente es si existe un despliegue real fuera de la evidencia del repo; si no se puede demostrar, conservar `UNKNOWN/BLOCKED` y no certificar la opción A.

### Gates canónicos — no cambian por esta actualización

- M0: `INCOMPLETO`.
- D0/D1-DESIGN/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Authorization: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Bootstrap A/B/C/D: ninguna opción seleccionada.

Esta actualización solo reconcilia el índice de continuidad con los artefactos leídos en la rama. No se ejecutaron código, tests o CI; no se modificaron runtime, tests, workflows, instalación ni dispositivo.

## Continuación documental verificada — cotejo H2/H4/H8 (2026-10-25, hora local)

- Rama consultada: `ncs-clean-architecture`; HEAD observado en API al revisar: `0a9614bfdf83deea87b8809d261aa7acc55aafc1`. Confirmar nuevamente el HEAD antes de cualquier trabajo futuro.
- Fuentes cotejadas desde GitHub: perfil D3 blob `7a790ee242d3c32e7bad50f7dfd52ba49f03e989`; especificación P-05 blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c`; matriz bootstrap blob `89558fb688f10c0cfc95c12430114a5837e124cc`; este STATUS blob `2a44972160c6a8ea090be21169ae44ca837084cd`.
- Registro de cotejo y paquete de fuentes para revisión puntual de Gemini: [issue #107, comentario de revisión documental](https://github.com/snowdenxrp/aldea-ia/issues/107#issuecomment-6406372373).
- **H2 — IDs:** no se demuestra colisión semántica dentro de cada documento; sí hay riesgo al citar IDs reutilizados fuera de contexto. Regla mínima propuesta: cualificar referencias cruzadas como `D3-E1`, `P05-E1`, `BOOTSTRAP-A`, `P01-A`, `P05-A` y `D2R-A`, sin renombrar IDs existentes.
- **H4 — intake D3:** el crosswalk 1–5 ya existe en sección 5A. La cobertura es parcial y escalonada; no se demuestra contradicción normativa en las fuentes revisadas. No confundir triage inicial con cobertura completa de E1–E6.
- **H8 — navegación:** los pins superiores se declaran activos y los históricos inferiores se explican en general; persisten encabezados inferiores “ACTUALIZACIÓN MÁS RECIENTE”/“CHECKPOINT CANÓNICO ACTUAL” y referencias antiguas que pueden confundir cuando se leen aisladas. Preservar historia; normalizar etiquetas solo en una pasada documental focalizada.
- Esto es cotejo estático de los blobs citados, no una auditoría independiente de Gemini ni evidencia de runtime. No se ejecutaron código, tests o CI; no se modificaron runtime/tests/workflows ni dispositivo.
- **Resultado posterior de H8:** los tres encabezados inferiores ambiguos se etiquetaron como registros históricos en commit `8932c33241e3c7193257e154b1f19248226f5ec5`; el historial se conserva. Si Gemini aporta evidencia nueva, reconciliar solo discrepancias concretas. Próximo bloqueo material: D1/D2 siguen dependiendo de caller operativo, admisión y política de readmisión. No repetir el censo ni reabrir decisiones ratificadas.

## Continuación documental verificada — D1 caller/migration boundary (2026-10-25, hora local)

- Reconciliado el informe de separación/migración con los criterios de cierre D1 existentes. La matriz ya exigía separar las rutas ordinarias de Lúmina, pero no expresaba con suficiente precisión tres condiciones: fallo del store Nexo independiente de la persistencia Lúmina; evidencia Nexo para distinguir estado ausente de estado desconocido; migración/bootstrap separados del flujo ordinario.
- Se añadieron esos criterios a la matriz D1. Solo documentación; no se modificó runtime/tests/workflows/datos y no se ejecutaron tests/CI.
- `scripts/assistants.mjs` (blob `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`) y `scripts/simulate.mjs` (blob `623d316c7a1efd10cc2f06a3080c0d9f06087596`) confirman estáticamente las aristas conocidas; esto no demuestra su ejecución en el POCO ni cierra callers dinámicos/externos.
- Siguiente paso: mantener D1-DESIGN OPEN y contrastar únicamente cualquier nuevo informe de Gemini para H2/H4/H8; no repetir el censo ni implementar el corte.

## Salvaguardas de evidencia CV-24–CV-26 (2026-10-25)

- **CV-24 — Publicación:** la opción B exige evidencia del contexto real de staging/destino y de la semántica de publicación; no se infiere atomicidad, durabilidad ni seguridad por la mera llamada a `rename` o por una prueba de laboratorio. Véase la matriz de aceptación de bootstrap.
- **CV-25 — Entornos:** la evidencia conserva el alcance del entorno realmente evaluado. Los resultados de laboratorio no se extrapolan al POCO X7 Pro cuando dependen de condiciones específicas del dispositivo que no se han demostrado. Véase el perfil D3.
- **CV-26 — Estado canónico:** ninguna prueba aislada, script, marcador, ausencia momentánea de procesos o resultado de CI eleva por sí solo el estado a `ROOT_READY`. Todos los predicados ratificados deben satisfacerse con evidencia suficiente.
- Estos criterios son salvaguardas documentales; no cambian los gates: M0 `INCOMPLETO`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Bootstrap A/B/C/D sigue sin selección.
- No se ejecutaron tests/CI ni se modificaron runtime, workflows o dispositivo como parte de esta actualización documental.



- **Entrada obligatoria para todas las IA:** este archivo `NEXO_NCS/STATUS.md`. Después seguir `MASTER → CORE → handoff vigente → BUILD/tarea activa`; consultar `NEXO_NCS/AI_TEAM_PROTOCOL_AND_ACTIVE_TASK.md` para coordinación y encargos a ChatGPT/Claude/Gemini.
- **Registro histórico (2026-10-25):** inventario estático de callers y hueco de raíz documentado en [NCS_M0_CALLER_INVENTORY_AND_ROOT_PATH_GAP_2026-10-25.md](BUILD/NCS_M0_CALLER_INVENTORY_AND_ROOT_PATH_GAP_2026-10-25.md), commit `d76950dec94367a8cfba2120bd396f69061eb25b`. Se confirmó el flujo `nexo.mjs → nexo-chronicle-session.mjs → runNexoChronicleAppend → stores` con rutas separadas `--continuity`/`--chronicle` e inicialización separada. La prueba de entrypoint documenta bootstrap parcial; los locks son cooperativos, no una barrera contra escritores externos. No se identificó un caller operativo de provisioning ni una ruta de raíz única en estos entrypoints. La matriz de conformidad y el principio ratificado `--root <directory>` siguen vigentes. M1 Android y el CLI Node no tienen integración demostrada en el POCO.
- **Siguiente paso:** determinar si existe un despliegue/provisioning operativo definido que conecte `--root <directory>` con las stores y su caller autorizado. Si no existe, registrar el vacío de diseño y solicitar evidencia mínima: invocador real, raíz física/rutas derivadas y autoridad para detener escritores. No inventar un entrypoint ni implementar wrapper/flags; no seleccionar A/B/C/D. Mantener `UNKNOWN/BLOCKED` si no se puede demostrar.
- **Registro histórico (2026-10-25):** creada y verificada la [matriz de conformidad del contrato de raíz frente al CLI](BUILD/NCS_M0_ROOT_CONTRACT_VS_EXISTING_CLI_CONFORMANCE_2026-10-25.md), commit `6cebebb3c6d0dfcbfb2d37e0f367755db84a75af`. El principio de raíz explícita única `--root <directory>`, sin fallback, bootstrap no implícito, canonicalización y admisión previa, ya está ratificado como diseño; el CLI inspeccionado aún acepta rutas legacy `--continuity`/`--chronicle`, admite inicialización separada y no demuestra el contrato ni `ROOT_READY`. M1 Android y el CLI Node son componentes separados sin integración demostrada en el POCO.
- **Siguiente paso:** inventariar de forma acotada los callers directos/indirectos de los dos entrypoints y las rutas que leen/mutan las stores canónicas, contrastándolos con `--root` ya ratificado. No repetir auditorías cerradas; no implementar compatibilidad, wrapper ni flags; no seleccionar A/B/C/D. Si el despliegue real no puede establecerse, mantener `UNKNOWN/BLOCKED`.
- **Límites:** «continúa» no autoriza cambios de runtime, tests/CI, modificación del dispositivo, bootloader, borrado/flasheo ni efectos protegidos. No repetir auditorías cerradas; distinguir hechos, inferencias, propuestas e implementación verificada.

---

# ACTUALIZACIÓN DE PRODUCTO — AVATAR ANDROID PROACTIVO (2026-10-25)

- Especificación de producto creada y verificada: [NEXO_ANDROID_PROACTIVE_AVATAR_PRODUCT_SPEC_2026-10-25.md](BUILD/NEXO_ANDROID_PROACTIVE_AVATAR_PRODUCT_SPEC_2026-10-25.md), commit `b9d9a527d890e0e9ee6c3ef023c53d9e306e48ff`, blob `258e62ee37056d645cdf00aa1c162ed74d17c289`.
- Diseño acordado: avatar animado flotante sobre otras apps; panel interactivo; frase de activación “Nexo” a evaluar localmente; iniciativa proactiva con tareas, notificaciones, calendario autorizado, señales operativas de Nexo y contexto adicional solo con permiso explícito.
- El propietario permite considerar, si se demuestra necesario, modificaciones del dispositivo/sistema o desbloqueo de bootloader; esto NO autoriza a ejecutarlos ahora ni a borrar datos/root/flashear. Evaluar alternativas, riesgos y recuperación y obtener confirmación específica antes de cualquier paso irreversible.
- POCO X7 Pro / Android 16 es destino inicial; PC futura es objetivo de portabilidad, todavía sin entorno definido. Capacidades Android deben validarse en dispositivo real.
- Handoff actualizado: [NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md](BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md).
- Este cambio es documental. No runtime/tests/workflows modificados; no tests/CI. Diseño no equivale a implementación.
- En siguiente chat: leer STATUS → MASTER → CORE → handoff vigente → especificación de producto; no repetir investigación cerrada ni mezclar la especificación de producto con gates NCS M0.

---

# REGISTRO HISTÓRICO — actualización registrada — PLATAFORMA INICIAL Y PORTABILIDAD (2026-10-25)

- El propietario confirma POCO X7 Pro/Android como primer entorno del prototipo y compatibilidad futura con PC como objetivo de diseño; espera disponer de una PC al ensamblar Nexo.
- La PC futura no está disponible ni tiene un entorno operativo especificado. La portabilidad es intención, no capacidad implementada/verificada.
- El perfil D3 y el handoff registran esta aclaración. El POCO identifica E1, pero no resuelve el modo de lanzamiento, escritores/relanzadores, autoridad para detenerlos ni evidencia de quiescencia.
- P-01/P-05 permanecen UNKNOWN/BLOCKED; no se elige A/B/C/D. M0 INCOMPLETO; D3 OPEN; autorización de implementación NOT_EVALUATED; efectos protegidos STOP.
- Cambio documental solamente; runtime/tests/workflows intactos; no tests/CI.

---

# REGISTRO HISTÓRICO — actualización registrada — P-01 / PERFIL MÍNIMO DEL ENTORNO (2026-10-25)

- El propietario confirma que todavía desconoce el entorno inicial y no puede confirmar quiescencia operacional. P-01 y P-05 permanecen `UNKNOWN/BLOCKED`; no se selecciona A/B/C/D.
- Perfil de intake mínimo actualizado y releído: [NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md](BUILD/NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md), commit `8a3495c8b53311b12e681de779fcb40947608ff4`, blob `ef463da2e60a9e08b13f30e8d9d1e62366c0c94e`. Primeros datos requeridos: destino/SO y alcance (prototipo o instalación real), modo de lanzamiento/relanzadores, capacidad para detener writers e impedir reinicios, y evidencia disponible para demostrarlo. El perfil de almacenamiento se pide después si hace falta.
- Handoff vigente actualizado y releído: [NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md](BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md), commit `c56af00dd8dbd05750befadc3314302aa2acc13e`, blob `f9bced739719fc09bb59c2bf10ee80b77ffab4a1`.
- Esta respuesta es documental. No se modificó runtime/tests/workflows, no se ejecutaron tests/CI y no se concedió autorización de implementación.
- Estado canónico sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# REGISTRO HISTÓRICO — checkpoint canónico registrado — HANDOFF CLAUDE/D1 (2026-10-25)

- Contraste del registro para bootstrap: [NCS_M0_D2_BOOTSTRAP_DECISION_REGISTER_CROSSCHECK_2026-10-25.md](BUILD/NCS_M0_D2_BOOTSTRAP_DECISION_REGISTER_CROSSCHECK_2026-10-25.md), commit `280fbfdfedcae89451dcc33ff1c71b2150bbe46a`. El registro ratifica O-08 sobre raíz, pero conserva P-01 bootstrap y P-05 readmisión como pendientes; no hay selección A/B/C/D documentada.
- Matriz de aceptación de opciones bootstrap: [NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md](BUILD/NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md), commit vigente `96d99a7ad11b18bd95d66aea9827e06385fd980a`, blob `89558fb688f10c0cfc95c12430114a5837e124cc`. El commit `04d8a4255c395a5df0ad1f6292678dc3204ebe58` es el commit de creación, no el último cambio. Compara A/B/C/D; no selecciona opción.

- Revisión documental D2 de bootstrap parcial/recuperación: [huecos contractuales](BUILD/NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md), commit `9faad5504dda91e734167d7fe3c3b8b9275dad90`. Confirma que `BOOTSTRAP_PARTIAL → ROOT_READY` no tiene aún predicados completos ratificados y aclara que “Opción A” de raíz no ratifica por sí sola la Opción A de bootstrap offline. Sin implementación ni tests/CI.

- Nueva especificación D2 P-05: [release incierto y evidencia para readmisión](BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md), commit `6bf41465d5caf04ed68fbfbbb7ea8f498c1cd694`. Requisitos propuestos E1–E9; no selecciona recuperación A/B, no ratifica el contrato y no autoriza implementación.

- Handoff vigente: [NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md](BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md), último commit verificado `4e786d09b2e2aa49dd8f35ae5a2f2d707896da4f`, blob actual `17ac954d52947086c3df9fdfd5244b18ca81caaa`. El commit `3c97840f7d50dc9559432b8bc5f0a1f2c9d829ac` es un estado histórico anterior.
- Reconciliación Claude: [NCS_M0_CLAUDE_INDEPENDENT_D1_REVIEW_RECONCILIATION_2026-10-25.md](BUILD/NCS_M0_CLAUDE_INDEPENDENT_D1_REVIEW_RECONCILIATION_2026-10-25.md), commit `b6e71ba9ffa14ebd724d204977bb344cd719a242`.
- Registro de decisiones corregido: commit `fc1a174dd607f895bcfbfcce8a0aaec28787bb8d`; IDs históricos `P-HIST-01…P-HIST-09`, decisiones actuales `P-01…P-10`, grupos de evidencia `G1…G5` separados de criterios M0 `A…E`.
- Matriz D1 actualizada: commit `368fd7f3f2ef9af4b75d708f358173e7711b7523`; invariante de admisión previo a lectura como propuesta documental, propiedad provisional de estados Nexo/Lúmina y gramática root/Chronicle v0 no ratificada.
- Manifiesto D1 actualizado: commit `23e21958ae3752821ca570713d71509f28012e0d`; resultado grep comunicado por Claude no se considera reproducible hasta registrar comando literal y SHA/tree exactos.
- Reconciliación D2 (2026-10-25): commit `f019fe5eb8cc77d13d4ff654d06e2ab2f7480b91`; consolida O-08…O-11 y puertas P-01/P-03…P-09, sin seleccionar protocolo de recuperación.
- Especificación D2 P-03/P-04 (alcance de admisión, ownership padre/hijo, caracterización de locks y condiciones de release incierto): `NEXO_NCS/BUILD/NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md`, commit `ccba5401e0730ab24460fec4851d1e1d8aec1aaf`. Propuesta documental; P-03/P-04/P-05 no quedan cerrados y no hay autorización de implementación.
- Matriz D1 corregida para reflejar que raíz explícita y admisión previa a lectura sí están ratificadas (O-08/O-10), mientras la gramática CLI, caller coverage y enforcement siguen abiertos; commit `6d581ece054db88a22d6912e9121e11fb502966e`.
- Estado canónico sin cambio: M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Solo cambios documentales. No runtime/tests/workflows/datos; no tests ni CI ejecutados.
- Próximo paso: seguir el handoff indicado y resolver solo discrepancias concretas; no repetir el barrido de 188 archivos ni pedir otra auditoría general. No implementar sin autorización separada.

---

# CHECKPOINT DE CONTINUIDAD — HANDOFF PARA SIGUIENTE CHAT (2026-10-24)

- Handoff completo: [NCS_NEXT_CHAT_HANDOFF_2026-10-24_ENTRYPOINT_REACHABILITY.md](BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-24_ENTRYPOINT_REACHABILITY.md), commit `9ce6cfd8ef2f541032adb25364123f0f349cb955`.
- Incluye snapshot fuente fijado, resultados ya establecidos, informes previos, gates canónicos, restricciones de ejecución y siguiente paso estático de alcanzabilidad de entrypoints/wrappers.
- Estado de trabajo de este punto: no se ha ejecutado código, pruebas ni CI; no se ha cambiado runtime, tests, workflows ni estado Lúmina. La solicitud actual fue guardar continuidad, no abrir una nueva investigación.
- Próxima acción al retomar: leer este handoff y los informes de reparación/transition reachability y crash recovery; luego completar solo los enlaces de entrypoint que sigan desconocidos, sin rehacer inventarios.
- Gates sin cambio: M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — ALCANZABILIDAD DE REPARACIÓN Y TRANSICIÓN PROTEGIDA

- Informe: [NCS_M0_REPAIR_AND_PROTECTED_TRANSITION_REACHABILITY_2026-10-24.md](BUILD/NCS_M0_REPAIR_AND_PROTECTED_TRANSITION_REACHABILITY_2026-10-24.md), commit `03b929e76e32018620b0c6a98c7bc467891bad1b`, blob releído `05db78a2df51947a5287c20f31f9e687bdc0e485`.
- Snapshot fuente: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`, tree `1f63ffd83682f490482a09b974f6455605ed0767`.
- La ruta conocida de `assistants --nexo-repair-once` está bloqueada por Option A en `runNexoRuntimeRepairSession()`; las APIs inferiores siguen exportadas y se usan directamente en pruebas. No se afirma inaccesibilidad global.
- `executeProtectedTransition()` usa authorityGate inyectado y luego `conditionalCommit.commit`; `effectBoundary.prepare` existe como puerto, pero no se invoca en el cuerpo inspeccionado antes del commit. No se ha demostrado startup→root legítimo→efecto protegido conectado.
- Siguiente paso: revisar el contrato de acceptance/linea de meta M0 y decidir qué pruebas de composición serían necesarias, sin ejecutar tests/CI ni cambiar runtime.
- Gates: M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — RECONCILIACIÓN Y CRASH RECOVERY

- Informe nuevo: [NCS_M0_RECONCILIATION_CRASH_RECOVERY_MAP_2026-10-24.md](BUILD/NCS_M0_RECONCILIATION_CRASH_RECOVERY_MAP_2026-10-24.md), commit `59453bf5c454eb28e2d09026bf1082f9819ba5b6`, blob releído `45924c184848269272ce04947741512b0aaaa867`.
- Snapshot fuente: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`, tree `1f63ffd83682f490482a09b974f6455605ed0767`.
- Precisión importante: `owner.reconcilePrepared()` sí existe. Para acciones genéricas exige verifier explícito y evidencia validada; para reparaciones rechaza ese camino y requiere settlement específico. La ruta de reparación es PREPARED durable → dispatch ligado a revisión → observación del estado persistido → settlement observado; no reclama causalidad ni atomicidad multi-store.
- Pruebas existentes contienen crash cuts/replay/UNKNOWN/falta de verifier y reconstrucción tras reinicio, pero en esta revisión solo se leyeron; no se ejecutaron.
- Siguiente paso: mapa estático de alcanzabilidad de PREPARED/dispatch/settlement desde entrypoints y wrappers; separar existencia API de accesibilidad, autoridad y ejecución efectiva.
- Gates sin cambio: M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — MIGRACIÓN Y SEPARACIÓN DE STORES NEXO/LÚMINA

- Informe: [NCS_M0_CONTINUITY_MIGRATION_AND_STORE_SEPARATION_2026-10-24.md](BUILD/NCS_M0_CONTINUITY_MIGRATION_AND_STORE_SEPARATION_2026-10-24.md), commit `55138df2a6f115e7409350926d0430e1450043fc`, blob releído `2110fb3b5968f6ebe0e5869505043634f770eda3`.
- Snapshot: commit fuente `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`, tree `1f63ffd83682f490482a09b974f6455605ed0767`.
- Refinamiento importante: las pruebas existentes especifican que el estado canónico de Lúmina no debe serializar `nexoMemory`; la continuidad operacional vive en el store Nexo separado. `continuity-service.mjs` solo migra legacy si ese store no existe y falla cerrado ante estado desconocido o store canónico corrupto. Esto fue inspección de código y pruebas, no ejecución.
- La secuencia de escritura en `assistants.mjs` aún contiene stores separados sin transacción multi-store visible. Siguiente paso: determinar el contrato aceptable de consistencia y comprobar estáticamente si existe reconciliación; no inventar wrappers ni transacciones.
- Runtime/tests/workflows/estado Lúmina sin cambios; no tests/CI.
- Gates: M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — WORKFLOWS Y ACOPLAMIENTO DE MEMORIA D1

- Nuevo informe: [NCS_M0_D1_GLOBAL_CALLER_AND_WORKFLOW_SCAN_PARTIAL_2026-10-24.md](BUILD/NCS_M0_D1_GLOBAL_CALLER_AND_WORKFLOW_SCAN_PARTIAL_2026-10-24.md), commit `62aaac222bce20363a676bbef29bd367280551b0`, blob releído `72d1f4b3c09f32a032394e887eb26d059ec09ce6`.
- Snapshot de fuente: commit `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`, tree `1f63ffd83682f490482a09b974f6455605ed0767`.
- Evidencia: `package.json` expone scripts assistants/simulate/nexo; `.github/workflows/lumina-simulation.yml` contiene pasos para `npm test`, `npm run assistants`, `npm run simulate`; `src/assistants/memory.js` conserva registros Nexo en rama `nexo` de la memoria de asistentes. Esto es una superficie de acoplamiento de datos, no prueba de efecto protegido ni de bypass.
- La separación de propiedad/persistencia Nexo–Lúmina queda como criterio de diseño que requiere cierre explícito. Ningún cambio de runtime ni estado de Lúmina.
- Siguiente paso: seguir el flujo assistants → memory → persistencia y simulate → world-state para identificar almacenes y responsabilidades; clasificar triggers de workflows por lectura estática. No ejecutar tests/CI.
- Gates canónicos: M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — CONSUMIDORES DE REPARACIÓN Y BARRIDO SRC D1

- Nuevo documento: [NCS_M0_D1_REPAIR_TEST_CONSUMERS_AND_SRC_SCAN_2026-10-24.md](BUILD/NCS_M0_D1_REPAIR_TEST_CONSUMERS_AND_SRC_SCAN_2026-10-24.md), commit `fce3dce5703e609f0b992faa21b0b0816c0ef335`, blob verificado `0b5f791ad1d7cdfcdb814eb1cac3436139002790`.
- Mismo snapshot fuente: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`, tree `1f63ffd83682f490482a09b974f6455605ed0767`.
- Resultado: pruebas de reparación importan y llaman APIs inferiores directamente; en módulos `src/nexo/**` inspeccionados no se halló referencia textual directa a esas APIs de reparación. Esto es evidencia estática acotada, no ejecución ni prueba de inalcanzabilidad global.
- Cobertura restante: completar resto de `src/**`, tests indirectos, reexports/imports dinámicos y entrypoints/workflows. Consumidores externos siguen desconocidos.
- Sin ejecución, tests/CI ni cambios de runtime/workflows/estado Lúmina.
- Estado canónico: M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — GRAFO PARCIAL DE LLAMADORES DE REPARACIÓN D1

- Se creó y releyó [NCS_M0_D1_REPAIR_CALLER_GRAPH_PARTIAL_2026-10-24.md](BUILD/NCS_M0_D1_REPAIR_CALLER_GRAPH_PARTIAL_2026-10-24.md), commit `852153dbee659f81a782af7c97443589dbca3efb`, blob `354b01357f11252da8dc1f38f04de9d0b782c79e`.
- Snapshot de fuente: commit `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`, tree `1f63ffd83682f490482a09b974f6455605ed0767`.
- Se inspeccionaron los 13 archivos JavaScript/MJS/CJS de `scripts/` en ese árbol y se trazó la cadena interna de reparación hasta `persistState`. La ruta CLI conocida `--nexo-repair-once` llama al wrapper bloqueado; las APIs inferiores forman una cadena interna, pero los consumidores fuera de `scripts/` no están resueltos.
- Esto es un grafo parcial y una búsqueda textual, no una prueba de inalcanzabilidad global. `src/**`, `tests/**`, importadores/reexports dinámicos y consumidores externos siguen pendientes/UNKNOWN.
- Solo inspección estática y documentación; sin runtime/tests/workflows/estado Lúmina; sin tests/CI.
- Estado canónico: M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — SUPERFICIES EJECUTABLES D1

- Se creó y releyó [NCS_M0_D1_EXECUTABLE_SURFACES_AND_IMPORTABLE_REPAIR_APIS_2026-10-24.md](BUILD/NCS_M0_D1_EXECUTABLE_SURFACES_AND_IMPORTABLE_REPAIR_APIS_2026-10-24.md), commit `83de482d62cf84db255fdf04787886e597ae6329`, blob `24fa2eadbc68052eb9283dd82b851e1bea2363b1`.
- Evidencia anclada al snapshot fuente `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`, tree `1f63ffd83682f490482a09b974f6455605ed0767`.
- Distinción documentada entre scripts npm, guardias de ejecución directa y APIs de reparación importables. El wrapper de runtime que bloquea una ruta no demuestra exclusión global de las APIs inferiores; consumidores no identificados permanecen `UNKNOWN/BLOCKED`.
- Solo lectura estática y documentación. Sin runtime/tests/workflows/estado Lúmina; sin tests/CI.
- Estado canónico sin cambios: M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — SNAPSHOT BASE D1 FIJADO

- Se creó y verificó [NCS_M0_D1_PINNED_SOURCE_SNAPSHOT_BASE_2026-10-24.md](BUILD/NCS_M0_D1_PINNED_SOURCE_SNAPSHOT_BASE_2026-10-24.md), commit `54506ca2f70ec74ef1c7103b9e7948c7f1d2f058`, blob `1060c18d16b110c0e0de345f70178c27d049d620`.
- Snapshot fuente observado: commit `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`, tree `1f63ffd83682f490482a09b974f6455605ed0767`, árbol recursivo `truncated=false`, 3061 entradas.
- Inventario inicial por ruta/extensión: 137 candidatos (13 scripts JS/MJS/CJS, 28 workflows YAML, 95 tests JS/MJS/CJS y package.json). Este conteo no equivale a cobertura ni a lista completa de entrypoints.
- Se recuperaron 16 fuentes críticas desde el commit fijado y se cotejaron sus blob SHA con el árbol. El documento enumera rutas y hashes.
- El commit fijado es una base reproducible para este pase; no se declara que siga siendo el HEAD de la rama después de añadir documentación. Revalidar HEAD antes de cada pase posterior y no mezclar fuentes de snapshots distintos.
- Solo documentación. Runtime/tests/workflows/estado Lúmina sin cambios; no tests/CI.
- Estado canónico: M0 `INCOMPLETO`; D0 técnico/evidencia `OPEN`; D1-DESIGN `OPEN`; implementación no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — CONTROL DE DERIVA DEL SNAPSHOT D1

- Se registró y verificó la nota [NCS_M0_D1_SOURCE_SNAPSHOT_DRIFT_CONTROL_2026-10-24.md](BUILD/NCS_M0_D1_SOURCE_SNAPSHOT_DRIFT_CONTROL_2026-10-24.md), commit `c9296f7add6ff2a8d737f0280e16cf07102e91b5`, blob `57f3c89495868404f77d7431c0f62f3a0018016d`.
- Motivo: se observó actividad automatizada de estado Lúmina en el commit `4135178045434a17af67e104de2e84b94d719154`, tocando `.lumina-assistant-memory.json` y `world-state.json`. No se alteraron esos archivos. Esto obliga a fijar un commit/tree coherente antes de afirmar que un manifiesto D1 representa un único snapshot de código.
- Regla futura: registrar HEAD + tree no truncado; leer las fuentes desde ese mismo commit; si HEAD cambia, reiniciar la captura o declarar explícitamente la mezcla. Un hash de blob no demuestra cobertura ni ejecución.
- Solo documentación. Runtime/tests/workflows y estado Lúmina sin cambios; no tests/CI.
- Estado canónico: M0 `INCOMPLETO`; D0 técnico/evidencia `OPEN`; D1-DESIGN `OPEN`; implementación no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-24 — PROPUESTA D0/D1/D2 DE ADMISIÓN

- Se creó y leyó de vuelta [NCS_M0_D0_D1_D2_INSTANCE_ADMISSION_CONTRACT_PROPOSAL_2026-10-24.md](BUILD/NCS_M0_D0_D1_D2_INSTANCE_ADMISSION_CONTRACT_PROPOSAL_2026-10-24.md), commit `3591834748463bd5d99fa1d0f585e55ba221b0c9`, blob `b1d85d4deecb5d34dc7a14a383426b7962e59cd9`.
- Consolida como propuesta no aceptada el contrato candidato de raíz explícita, derivación única de rutas, bootstrap separado, admisión antes de snapshots/consultas/previews, coordinación padre/hijo Chronicle, límites Nexo/Lúmina y criterio de cierre documental D1.
- No selecciona decisiones reservadas (symlinks, garantía/duración del snapshot, protocolo de lock/release ni bootstrap parcial). No afirma cobertura completa de guards/cargadores ni consumidores externos.
- Solo documentación. Runtime/tests/workflows sin cambios; no se ejecutaron tests ni CI.
- Estado canónico: M0 `INCOMPLETO`; D0 técnico/evidencia `OPEN`; D1-DESIGN `OPEN`; implementación no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-24 — INVENTARIO D1

- Nota nueva de inventario de entrypoints: [NCS_M0_D1_ENTRYPOINT_INVENTORY_NOTE_2026-10-24.md](BUILD/NCS_M0_D1_ENTRYPOINT_INVENTORY_NOTE_2026-10-24.md), commit `556fb1fff1106cf2beafa3d49b0dd6d169d4e26f`.
- Resume los blobs exactos consultados en `package.json`, los dos workflows Nexo, `tests/nexo/entrypoint.test.mjs` y ambos entrypoints CLI. Distingue la cobertura actual de regex estática de un manifiesto completo; cargas dinámicas/computadas, guards, callers de factories/owners, procesos hijos y consumidores externos siguen sin cierre.
- Revisión de solo lectura. Runtime/tests/workflows sin cambios; no tests ni CI. D1-DESIGN OPEN; implementación no autorizada; M0 INCOMPLETO; D2/D3 OPEN; raíz PENDING/UNKNOWN; operaciones protegidas STOP.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-24 — REVISIÓN DE API DE REPARACIÓN

- Nota nueva de diseño, creada en commit `815601df24702f1f27eaad23120f0f0be4a80901`: [NCS_M0_D1_REPAIR_API_BOUNDARY_REVIEW_2026-10-24.md](BUILD/NCS_M0_D1_REPAIR_API_BOUNDARY_REVIEW_2026-10-24.md).
- Ledger D1 actualizado en commit `934a88eee7c012512372df55208a9d9ff1d520b7`: [NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md](BUILD/NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md). El nuevo addendum incorpora las tres API inferiores, las dependencias de simulación y la condición de que el bloqueo del wrapper no cierra la exclusión global.
- Hallazgo de código: `runNexoRuntimeRepairSession()` devuelve bloqueo Option A, pero existen APIs separadas `runNexoRepairSession()`, `runNexoRepairOnce()` y `dispatchPreparedRepair()`; las últimas rutas importan persistencia/adapter de simulación de Lúmina. El bloqueo de un wrapper no demuestra exclusión global de todas las rutas.
- Interpretación acotada: es una brecha de clasificación y diseño por resolver, no prueba de que se ejecutara una reparación ni de explotación. No se invocó ninguna función y no se modificó estado.
- Acción D1: incluir las tres APIs, reexports, callers y aristas al adapter de simulación en el inventario; clasificar rutas de producto y mantener UNKNOWN/BLOCKED para callers no resueltos. Preservar la persistencia legítima de Lúmina.
- Solo revisión de código/documentación. Runtime/tests/workflows sin cambios; no se ejecutaron tests ni CI.
- Estado canónico: M0 INCOMPLETO; D1-DESIGN OPEN; implementación no autorizada; D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; operaciones protegidas STOP.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-24 — CONTRATO DE SEPARACIÓN NEXO/LÚMINA

- Contrato de diseño creado y leído de vuelta: [NCS_M0_NEXO_LUMINA_SEPARATION_CONTRACT_2026-10-24.md](BUILD/NCS_M0_NEXO_LUMINA_SEPARATION_CONTRACT_2026-10-24.md), blob `b22c27aa8556034f88d91703d6a57642cae579af`, commit de creación `d9bc549aa16c8f8d621384ce537729d07a9054a2`.
- Handoff D1 actualizado con referencia al contrato: [NCS_NEXT_CHAT_HANDOFF_2026-10-24_D1_ENTRYPOINT_MANIFEST.md](BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-24_D1_ENTRYPOINT_MANIFEST.md), blob `7680085db6bd0e4336bb388a1bfc1e0b92036cf1`, commit de actualización `534c2d2703ea608d25393347e713b9927da8fb2f`.
- Principio de frontera: Nexo debe operar sin depender de Lúmina; los comandos ordinarios de Lúmina deben seguir siendo Lúmina-only, preservando su propia memoria de aprendizaje y persistencia de world-state. No aislar Nexo desactivando persistencia legítima de Lúmina.
- No importar, borrar, mezclar ni duplicar automáticamente el legacy `persisted.nexoMemory`. Cualquier migración requiere ruta separada, autorización y evidencia.
- El contrato de raíz explícita `--root`, admisión de padre/hijo y admisión previa a lecturas persistentes es TARGET de diseño, no comportamiento demostrado del código actual.
- Este avance es solo documentación. No se modificó runtime/tests/workflows/datos de ejecución; no se ejecutaron tests ni CI.
- Continuidad: usar este `STATUS.md` como puerta de entrada; seguir con el handoff D1 más reciente y el contrato de separación. No repetir el barrido previo de 188 archivos salvo que cambie el snapshot de código.
- Estado canónico sin cambios: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-24 — D1-S0 ACEPTADA

- El propietario aceptó separar `D1-DESIGN` de `D1-IMPLEMENTATION`; esto resuelve únicamente la secuencia, no cierra el diseño ni autoriza implementación.
- Registro: [análisis D1-S0](BUILD/NCS_M0_D1_S0_SEQUENCE_GATE_ANALYSIS_2026-10-23.md), blob `28ae19953fa5fa8630eabe4f66b8422c16680336`; [índice de decisiones](BUILD/NCS_M0_OWNER_DECISIONS_VS_EVIDENCE_GATES_2026-10-24.md), blob `c2b88297e0ff2eee1bdd7a097193915abde56245`.
- Handoff prioritario actualizado: [NCS_NEXT_CHAT_HANDOFF_2026-10-23_D2_RELEASE_UNCERTAINTY.md](BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-23_D2_RELEASE_UNCERTAINTY.md), blob `a2d5db0307f9fefe23be77d6d0de1e33689b695e`, commit `7f704e284dbb340ea108cc179a4f9b3d1fa778e0`.
- Siguiente trabajo: revisar los artefactos ya existentes de D1-DESIGN de forma dirigida contra sus criterios; no repetir el censo completo ni declarar PASS sin evidencia. Registrar UNKNOWN/BLOCKED cuando una arista siga sin resolver.
- D1-IMPLEMENTATION permanece sin autorización. No se modificaron runtime/tests/workflows ni se ejecutó CI.
- Estado canónico: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — MAPA DE DEPENDENCIAS D0/D1/D2/D3

- Nuevo mapa: [NCS_M0_D0_D1_D2_D3_DEPENDENCY_CLOSURE_MAP_2026-10-23.md](BUILD/NCS_M0_D0_D1_D2_D3_DEPENDENCY_CLOSURE_MAP_2026-10-23.md), commit ac205fda2d1ed490f54efa0ace1a3c974a1ce8c6.
- Dependencias preservadas: D1-S0 pendiente de decisión; D1-DESIGN no es una prueba ejecutada; D2 requiere cerrar alcance y sección crítica del snapshot y caracterizar locks; D3 requiere identificar runtime real y control de relanzamientos; límites agregados de heap/disco no demostrados.
- No se repitió el censo de callers. Runtime/tests/workflows sin cambios; tests/CI no ejecutados.
- Estado canónico: M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — SEPARACIÓN DE ENTORNOS D3

- Documento nuevo: [NCS_M0_D3_ENVIRONMENT_SCOPE_SEPARATION_2026-10-23.md](BUILD/NCS_M0_D3_ENVIRONMENT_SCOPE_SEPARATION_2026-10-23.md), commit `726a579ef0014f940fcc21a5f01a0a71e06047b1`.
- Aclaración: entorno de desarrollo (A), CI (B), primera instancia runtime que usa Continuity/Chronicle (C) y host/operador de migración (D) son ámbitos distintos. A/B no prueban control operacional de C/D; C y D pueden coincidir solo si se declara y verifica.
- El POCO X7 Pro del prototipo M1 no queda designado como runtime C por inferencia. La siguiente incógnita factual es si ya existe una primera instancia objetivo que use Continuity/Chronicle; si no existe, registrar esa ausencia y mantener D3 OPEN.
- No se repitió el censo de callers. No se modificó runtime/tests/workflows; no se ejecutaron tests ni CI.
- Estado canónico sin cambios: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — D0 ID CROSSWALK

- Se amplió el ledger D0 con un crosswalk entre IDs `D0-01..11` y la matriz canónica `D0-C1..C4`, evitando que referencias paralelas se interpreten como decisiones distintas. Commit de actualización del ledger: `bfec45d8fd2524a8f3739846729d241e70013b39`.
- El crosswalk mapea configuración/CLI/API/env/legacy, bootstrap, symlinks/layout y migración. No cierra ninguno de esos contratos.
- Análisis D1-S0 está en [NCS_M0_D1_S0_SEQUENCE_GATE_ANALYSIS_2026-10-23.md](BUILD/NCS_M0_D1_S0_SEQUENCE_GATE_ANALYSIS_2026-10-23.md), commit `e375bf9e789ce40676d682a6b3ca9eae62063057`; separar D1-DESIGN de D1-IMPLEMENTATION sigue siendo recomendación no aprobada.
- No se modificó runtime/tests/workflows/CLI/stores; no se ejecutaron tests ni CI.
- Estado canónico: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — D1-S0 SEQUENCE GATE ANALYSIS

- Nuevo análisis de secuencia: [NCS_M0_D1_S0_SEQUENCE_GATE_ANALYSIS_2026-10-23.md](BUILD/NCS_M0_D1_S0_SEQUENCE_GATE_ANALYSIS_2026-10-23.md), commit `e375bf9e789ce40676d682a6b3ca9eae62063057`.
- El documento formaliza el ciclo lógico entre “D1 exige test ejecutado” y “no modificar tests hasta cerrar el diseño”. Recomienda separar D1-DESIGN de D1-IMPLEMENTATION, pero deja explícito que la decisión del propietario no está registrada.
- Opción 1 no autoriza implementación: cualquier cambio en runtime/tests/workflows sigue necesitando gate separado. Opción 2 requiere cambiar explícitamente la secuencia; Opción 3 no se recomienda por mezclar diseño y prueba.
- Para D1-DESIGN siguen pendientes: manifiesto reproducible, clasificación completa de callers, tratamiento del caller UNKNOWN de `scripts/nexo-continuity.mjs`, allowlist, resolver de imports/cargas, fixtures negativos y consistencia con D0/D2/D3.
- No se modificó runtime/tests/workflows/CLI/stores; no se ejecutaron tests ni CI.
- Estado canónico: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — CRUCE DOCUMENTAL D0 ↔ D1

- Nuevo cruce documental: [NCS_M0_D0_D1_DESIGN_CROSSCHECK_2026-10-23.md](BUILD/NCS_M0_D0_D1_DESIGN_CROSSCHECK_2026-10-23.md), commit `203e35d88f419893c4392ee50af01729683e3a3e`.
- Resultado: no se encontró contradicción material entre las propuestas D0 y la evidencia de diseño D1 revisada. Esto no cierra gates ni prueba implementación.
- Caveat exacto: la reconciliación D1 referencia un blob histórico del contrato de raíz (`1d82f04f67b5ed15a6823cc23051ec59c43629a5)); el blob actual consultado es `22622ad2dff1c231cad31d5c4b7d875758b08958`. La clasificación externa de `scripts/nexo-continuity.mjs` sigue UNKNOWN; no volver a inferir ausencia de callers.
- El test de grafo/no-bypass D1 sigue especificado, no implementado ni ejecutado. `assistants`/`simulate` son disposiciones de diseño, no bloqueos de runtime verificados por esta revisión.
- No se modificó runtime/tests/workflows/CLI/stores; no se ejecutaron tests ni CI.
- Estado canónico sin cambio: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — D0 INSTANCE-ROOT DECISION LEDGER

- Nuevo ledger documental: [NCS_M0_D0_INSTANCE_ROOT_DECISION_LEDGER_2026-10-23.md](BUILD/NCS_M0_D0_INSTANCE_ROOT_DECISION_LEDGER_2026-10-23.md), commit `013dfe3f6c72c0012a190b86590688bb3dd05614`.
- El ledger divide D0 en 11 decisiones comprobables: configuración CLI/API, env precedence, bootstrap, canonicalización/aliases, layout/collisions, legacy compatibility, side effects, error contract y migración de datos existentes.
- Cada decisión separa evidencia actual, recomendación aún no aprobada, riesgo, evidencia de aceptación y dependencias. No se atribuye al propietario aprobación de subdecisiones.
- Trabajo documental únicamente: no cambió runtime, tests, workflows, CLI ni almacenes; no se ejecutaron tests/CI.
- Próximo paso: revisar consistencia del ledger con los artefactos D1 existentes y registrar solo contradicciones/huecos reales; no repetir el censo previo sin cambio de snapshot.
- Estado canónico sin cambio: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — RECONCILIACIÓN DE LÍMITES DE DECISIÓN D0/D1/D2/D3

- Nuevo documento: [NCS_M0_D0_D1_D2_D3_DECISION_BOUNDARY_RECONCILIATION_2026-10-23.md](BUILD/NCS_M0_D0_D1_D2_D3_DECISION_BOUNDARY_RECONCILIATION_2026-10-23.md), commit `1c67919dddae59d7772f9beeca9b6d88e89770b6`.
- Aclaración: “Opción A aceptada como dirección” significa dirección arquitectónica de raíz de instancia, no aprobación de cada detalle ni autorización para implementar. D0/D1/D2/D3 siguen OPEN.
- Se separan cuatro niveles: L0 dirección; L1 contrato detallado; L2 diseño verificable; L3 implementación + pruebas/CI. Solo L0 está aceptado como dirección; los demás siguen abiertos/no ejecutados.
- Dependencias recomendadas: D0 configuración/bootstrap/aliases → D1-DESIGN y clasificación → D2 alcance/lock/child/release → D3 migración/rollback → revisión cruzada → autorización explícita de implementación → tests/CI en SHA exacto.
- Runtime/tests/workflows sin cambios en esta revisión; tests/CI no ejecutados.
- Estado canónico: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — BRECHA REAL DEL TEST ARQUITECTÓNICO D1

- Nuevo análisis de diseño: [NCS_M0_D1_STATIC_GRAPH_TEST_GAP_AND_IMPLEMENTATION_PLAN_2026-10-23.md](BUILD/NCS_M0_D1_STATIC_GRAPH_TEST_GAP_AND_IMPLEMENTATION_PLAN_2026-10-23.md), commit `57ae9855c4eba9060a70f7a44dcdb0e2c373f2fe`.
- Hallazgo concreto al releer `tests/nexo/entrypoint.test.mjs` (blob `ff1bd2e9d292e21e00049b354249aee684837bbc`): ya existe un guard útil de imports/reexports estáticos y límites de CLI, pero su extracción por regex no demuestra cobertura de `import()`, `require()`, cargas calculadas, callsites de factories/owners, aristas de proceso ni clasificación completa de entrypoints. No debe presentarse como test D1 de no-bypass.
- La nueva nota define el algoritmo futuro, el manifiesto de entrypoints, el tratamiento UNKNOWN/BLOCKED, 10 fixtures negativos y los requisitos de `npm test`/workflows cuando exista autorización.
- No se implementó ni ejecutó el test D1; no hubo cambios de runtime/tests/workflows ni ejecución de CI en esta revisión.
- Estado canónico sin cambio: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente paso: resolver explícitamente la secuencia D1-DESIGN vs D1-IMPLEMENTATION y cerrar las subdecisiones del contrato de instancia antes de tocar código. No repetir el censo estático ya documentado ni declarar cerrada la barrera por la existencia de esta especificación.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — D1 CALLER LEDGER

- Nuevo ledger D1 y especificación de test arquitectónico: [NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md](BUILD/NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md), commit `a399cb77abfe397454ebd479d8068f1afdbc38df`.
- Snapshot recursivo consultado antes del nuevo commit: tree SHA `74e044d2307f69350f7d5a46b01f43ee1c69061b`, no truncado, 2.982 entradas; 121 archivos identificados en los grupos de código/configuración revisados. Esto no demuestra clasificación completa de cada edge.
- Hallazgo de diseño: las queries de solo lectura también materializan snapshots. Si la garantía D2 incluye perfil de snapshot/heap agregado, deben pasar por admisión; si solo se serializan escrituras, esa garantía más estrecha debe declararse explícitamente. Recomendación registrada: admitir todas las operaciones que cargan snapshots canónicos.
- `assistants` y `simulate` mezclan Continuity con otros dominios de persistencia; un lock de raíz no da atomicidad multi-store. Recomendación: excluirlos de la entrada Nexo ordinaria hasta tener contrato explícito.
- Chronicle child es invocable directamente; no debe depender del lock del padre. Evitar que el padre retenga un lock no reentrante mientras espera un hijo que intenta adquirirlo.
- Test arquitectónico aún no implementado; D1 no está cerrado. Runtime/tests/workflows sin cambios; no se ejecutaron tests/CI.
- Estado canónico: M0 `INCOMPLETO`; D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — AGREGADO DE RECURSOS Y GATES D0/D1/D2/D3

- Nuevo análisis de brecha de presupuesto agregado: [NCS_M0_AGGREGATE_RESOURCE_BUDGET_GAP_ANALYSIS_2026-10-23.md](BUILD/NCS_M0_AGGREGATE_RESOURCE_BUDGET_GAP_ANALYSIS_2026-10-23.md), commit `065df83a49ae853f8c93ca21919f545ac7322c25`.
- Fuente actual declara límites por documento: Continuity 16 MiB y Chronicle 32 MiB; suma nominal de documentos serializados = 48 MiB, NO límite de heap. Límites por colección/stdin/temporales tampoco son cuota total de disco.
- Heap agregado: `OPEN / NO DEMOSTRADO`; disco total: `OPEN / NO DEMOSTRADO`; exclusión entre operaciones completas: `OPEN / NO IMPLEMENTADA`.
- Se mantiene la decisión de no inventar un multiplicador fijo de heap ni atribuir al lock una cuota de disco. El lock de instancia solo coordina operaciones cooperantes; no confiere autoridad.
- Runtime/tests/workflows sin cambios; no se ejecutaron tests ni CI en esta revisión.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: terminar reconciliación de callers/grafo estático contra un snapshot exacto y marcar no clasificables como `UNKNOWN/BLOCKED`; luego cerrar las subdecisiones D0/D1-DESIGN/D2/D3 antes de implementación.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — D0 SUBDECISIONES PROPUESTAS

- Dirección A aceptada por el propietario; runtime continúa SIN CAMBIOS.
- Contrato actualizado: [NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md](BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md), commit `3221b254b1121930373787d30565d7c5482f2443`, blob `d2f027f51ace2913eac7c0e289a9a016d6bee9d6`.
- Añadidas recomendaciones D0: CLI `--root` explícito, sin env var inicialmente, raíz existente requerida (bootstrap separado), realpath para converger symlinks cooperantes, lock no reentrante, lecturas/previews bajo admisión exclusiva, timeout monotónico, fail-closed en stale/release incierto y migración sin merge/dual-write automático. Son propuestas técnicas, no decisiones atribuidas al propietario.
- Revisado lock protocol actual: Chronicle/Continuity usan locks por store con owner PID/token y deadline, pero difieren en gestión local de fallo de liberación; no asumir que pueden reutilizarse sin contrato común/pruebas.
- D1 sigue abierto: GitHub code search no entregó resultados utilizables; el inventario viene de tree recursivo y lectura de módulos. No se ejecutó rg local porque no hay checkout local confirmado en esta sesión. La matriz no se declara exhaustiva.
- Siguiente paso: cerrar la matriz desde un checkout exacto o fuente que permita búsqueda completa y obtener confirmación del propietario sobre las subdecisiones de D0 antes de implementar. No introducir lock, no cambiar firmas, rutas, stores ni workflows.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — INSTANCE ROOT DESIGN ACCEPTED AS DIRECTION

- El propietario aceptó Opción A como dirección de diseño; esto **no** autoriza runtime.
- Contrato, inventario inicial/ampliado de entrypoints, riesgos y plan verificable: [NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md](BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md), último commit documental `d80993dc77075f24dd6ffe23946b034ef4a85589`, blob `2c3b031ac3cd361fffc672342a34b5d4568432f3`.
- Se revisaron todos los módulos `.mjs/.js` actuales bajo `src/nexo/` y scripts `scripts/nexo*.mjs`. Las rutas de store directas conocidas están en application queries/append y continuity-service; se identificaron consumidores indirectos owner/runtime/repair/adapters. La prueba de no-bypass aún requiere callsite matrix completa y test automatizado.
- La propuesta original ya refleja la aceptación de dirección; subdecisiones de contrato y clasificación completa de callers siguen abiertas. No se modificó ningún archivo runtime, test ni workflow.
- Garantía objetivo: exclusión entre operaciones cooperantes bajo una raíz compartida; no promete heap exacto, cuota global de disco, resistencia a procesos locales hostiles, fsync ni autoridad.
- Próximo paso: cerrar D0/D1 (precedencia CLI/API/env, raíz inexistente, symlinks/alias, alcance exacto de admisión, protocolo cross-process, errores/timeout, compatibilidad y migración) y guardar la matriz completa. Runtime sigue SIN CAMBIOS.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — INSTANCE ROOT DESIGN ACCEPTED AS DIRECTION

- El propietario aceptó Opción A como dirección de diseño; esto **no** autoriza runtime.
- Contrato, inventario de entrypoints, riesgos y plan verificable: [NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md](BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md), commit `01d9e11544df480a29d1a375052e53e4f7a7b7a9`, blob `12bdfc0ff2c97b79a479d263c4073b32ea8915a5`.
- Se actualizó la propuesta original: Opción A queda aceptada como dirección; el diseño sigue abierto en subdecisiones explícitas. No se modificó ningún archivo runtime, test ni workflow.
- Inventario inicial incluye CLI padre/hijo, Chronicle append, cinco consultas/previews de continuidad, API de aplicación, owner-service, factories per-store, reexports, sesiones de repair/runtime y test workers. La completitud aún exige búsqueda de todos los callsites y clasificación antes de implementación.
- Garantías objetivo limitadas a exclusión entre operaciones cooperantes bajo una raíz compartida; no promete heap exacto, cuota global de disco, resistencia a procesos locales hostiles, fsync ni autoridad.
- Próximo paso: cerrar D0/D1 (precedencia de configuración, raíz inexistente, symlinks/alias, alcance exacto del lock, protocolo cross-process, errores/timeout, compatibilidad y migración) y completar inventario. Runtime sigue SIN CAMBIOS.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — AGGREGATE RESOURCE BUDGET

- Revisión de recursos agregada, análisis de código: [commit e2208578bde2efd1d39aacaf70ba314411885113](https://github.com/snowdenxrp/aldea-ia/commit/e2208578bde2efd1d39aacaf70ba314411885113). El análisis previo sobre temporales únicos fue corregido: los almacenes ya usan `.tmp` estable y limpieza acotada bajo lock propio.
- Entry points trazados: `runNexoChronicleAppend` recibe rutas independientes para Chronicle y Continuity; el CLI crea un proceso hijo; las consultas y API de owner/store entran por rutas distintas. Los locks son por almacén, no por operación completa.
- Propuesta de decisión (NO aceptada todavía): [NCS_M0_INSTANCE_ROOT_AND_CONCURRENCY_DECISION_PROPOSAL_2026-10-23.md](BUILD/NCS_M0_INSTANCE_ROOT_AND_CONCURRENCY_DECISION_PROPOSAL_2026-10-23.md), commit [3987e0656edf71369552e751f20a7bb2cec7e9ed](https://github.com/snowdenxrp/aldea-ia/commit/3987e0656edf71369552e751f20a7bb2cec7e9ed). Compara raíz de instancia canónica con admisión global frente a mantener las rutas independientes y declarar la limitación; rechaza un lock solo en CLI como garantía incompleta.
- Próxima decisión: no tocar runtime hasta resolver explícitamente el contrato de raíz de instancia. Heap agregado y disco total siguen OPEN.
- Handoff actualizado: [commit 4d1bf5b5dcf90726b6820f007114516e9d0b6228](https://github.com/snowdenxrp/aldea-ia/commit/4d1bf5b5dcf90726b6820f007114516e9d0b6228).

- Frontier actual: presupuesto agregado de recursos de M0; no volver a comenzar por Open Loops, cuya CI exacta ya está cerrada.
- Análisis corregido: [`NCS_M0_AGGREGATE_RESOURCE_BOUND_ANALYSIS_2026-10-22.md`](BUILD/NCS_M0_AGGREGATE_RESOURCE_BOUND_ANALYSIS_2026-10-22.md), actualización documental commit [`31bff07ea76ddd86713c642b3f5ae25570e3ae57`](https://github.com/snowdenxrp/aldea-ia/commit/31bff07ea76ddd86713c642b3f5ae25570e3ae57).
- Corrección importante: Chronicle y Continuity ya usan temporal estable `.tmp` y escaneo/limpieza acotados bajo el lock propio de cada almacén. La descripción histórica de nombres temporales únicos quedó obsoleta; no reimplementar ese protocolo.
- Fuentes actuales inspeccionadas: `chronicle-store.mjs` blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`; `continuity-store.mjs` blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`; `resource-limits.mjs` blob `98355d5dc8298695233495d4bab2264b3eeba7b3`; `nexo-chronicle-session.mjs` blob `30a53de2f108aa255a1dfd61ce78c19788de160b`; `package.json` blob `e45dc6d215db53ea2758009cd501f565634e3610`.
- Lo que sí se acota: el writer cooperante crea un temporal estable por almacén, limitado por el tamaño máximo de su documento. Los tests ya verifican que temporal estable + temporal legacy desaparecen tras una escritura exitosa.
- Lo que sigue OPEN: presupuesto total de disco (residuos legacy/otros archivos y límite de escaneo) y heap agregado (locks por almacén, no operación global; pueden solaparse procesos/entrypoints). No inventar un multiplicador de heap ni declarar soporte concurrente seguro.
- Siguiente acción única: trazar los entrypoints reales de Chronicle/Continuity y decidir si M0 requiere serialización global impuesta o si limita explícitamente el modo de uso. No implementar un lock global hasta identificar una raíz de instancia común y todos los callsites; documentación por sí sola no impone exclusión mutua.
- Handoff actualizado: [commit `05ca80f3628c4f70128450316644c5a28a5a07b6`](https://github.com/snowdenxrp/aldea-ia/commit/05ca80f3628c4f70128450316644c5a28a5a07b6).
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT DE VERIFICACIÓN — 2026-10-23 — OPEN LOOPS ACCEPTANCE + EXACT-SHA CI

- Código y pruebas combinados: `962d1a327683b412c401f323514d401e7e8ec8f1`.
- Corrección estructural: los registros `prepared` y `reconciled_observed` del diario solo se proyectan si sus campos identifican una misión y paso canónicos de la misma instantánea y la acción coincide con la acción canónica del paso. Campos presentes pero huérfanos o discordantes devuelven `NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN`.
- Regresiones añadidas: enlace sin campos; IDs con formato pero sin misión/paso canónico; acción discordante; estado de diario desconocido en un snapshot sin misiones; misión planned; paso failed; discrepancia de estado completed; continuidad corrupta; límite de recursos.
- CI sobre el SHA exacto:
  - [Persistencia determinista / `npm test` — run 39980113239 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113239), job `120504886619` — `tests` — SUCCESS.
  - [STEP 4 — run 39980113168 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113168).
  - [STEP 5 — run 39980113209 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39980113209).
- Interpretación: los tres workflows verifican el commit de implementación+pruebas citado. La consulta permanece de solo lectura, sin despacho ni reconciliación; esto no prueba autoridad legítima ni habilita efectos protegidos.
- Revisión de contrato: el enlace debe ser referencial, no solo sintáctico. La consulta conserva la revisión canónica y bloquea si no puede probar la relación misión→paso→acción. Además, un estado de diario no reconocido bloquea incluso si no hay misiones que reconstruir; no puede convertirse en inventario vacío exitoso.
- Documentación de evidencia actualizada en el contrato Open Loops y en el handoff maestro. Próxima unidad: elegir una capacidad interna con aceptación mínima desde MASTER/CORE y BUILD/DECISIONS. Antes de añadir superficie Chronicle de lectura/escritura, reconciliar el alcance A aceptado (persistencia interna bajo contratos existentes, no autoridad) con la propuesta separada de fail-closed precommissioning, que no es decisión aprobada. No cambiar runtime por inferencia.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# HANDOFF NEXT CHAT — 2026-10-23

- Continuidad maestra: [NCS_MASTER_HANDOFF_NEXT_CHAT_2026-10-23_OPEN_LOOPS.md](BUILD/NCS_MASTER_HANDOFF_NEXT_CHAT_2026-10-23_OPEN_LOOPS.md).
- Handoff actualizado tras verificar Open Loops: [commit `bda1cac258464db61583ea7595844dcce976d6eb`](https://github.com/snowdenxrp/aldea-ia/commit/bda1cac258464db61583ea7595844dcce976d6eb), con el SHA de código+pruebas `962d1a327683b412c401f323514d401e7e8ec8f1` y su CI exacta.
- Próxima acción única: consultar MASTER/CORE y BUILD/DECISIONS y escoger una capacidad interna con un caso de aceptación concreto. La CI exacta de Open Loops ya está verificada; no repetirla sin cambios de implementación/tests.
- No repetir auditorías cerradas, no reabrir el trust-boundary review sin defecto nuevo, y mantener M0 `INCOMPLETO`, autorización `NOT_EVALUATED`, raíz `PENDING/UNKNOWN`, efectos protegidos `STOP`.

---

# CHECKPOINT DE DISEÑO — 2026-10-23 — CORE INPUT TRUST BOUNDARY REVIEW

- Revisado desde el estado actual: `MASTER/README.md`, `CORE/README.md`, `contracts.mjs`, `protected-transition.mjs`, `mission-admission-contract.mjs`, `reconciliation.mjs`, `ownership.mjs`, `runtime.js` y pruebas de contratos/admisión/reconciliación.
- Documento nuevo: [NCS_CORE_INPUT_TRUST_BOUNDARY_DECISION_REVIEW_2026-10-23.md](BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_DECISION_REVIEW_2026-10-23.md).
- Hallazgo estructural: el riesgo de Proxy traps atraviesa más de una API; no corresponde resolverlo con otro guard local. El Core central y las fronteras de misión/reconciliación hacen reflexión sobre objetos vivos.
- Decisión NO tomada: no seleccionar serialización ni confianza in-process todavía. Falta un inventario completo de callers concretos y la procedencia/formato real de sus entradas. La review compara las opciones y define el caller matrix necesario.
- Acción inmediata: trazar callsites de cada frontera pública y clasificar si reciben datos externos o estructuras internas ya admitidas. Luego elegir una frontera verificable por clase de entrada y diseñar migración/error mapping antes de editar runtime.
- No se modificó código de ejecución en este paso. No se declara resuelto el hallazgo Proxy.
- Estado constitucional permanece: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

---

# CHECKPOINT DE VERIFICACIÓN — 2026-10-23 — NESTED RUNTIME CONTRACT INPUT GUARD CI

- Código: `16c700563d5f4fc423aeeb4952c7b486f4f01bc0`.
- Pruebas: `5ac87888a25c3387749df7a0c262d1cf51163e2f`.
- STATUS y checkpoint: `337f8df311eb31e9fe3031a6d11ecc2b7b8f35c3`.
- CI determinista / `npm test` sobre el commit de STATUS, que contiene código y pruebas: [run 39884629420 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39884629420).
- CI adicional sobre el SHA de pruebas: [admisión/continuidad 39884623524 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39884623524), [STEP 4 39884623591 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39884623591), [STEP 5 39884623623 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39884623623).
- Interpretación: las regresiones añadidas pasan en CI; no significa que se haya cerrado la decisión arquitectónica del límite de objetos JavaScript arbitrarios. El informe `NCS_CORE_BOUNDARY_PROXY_TRAPS_DESIGN_STOP_2026-10-17.md` sigue vigente: no se afirma aislamiento frente a Proxy traps. No añadir otra capa de guards ni migrar a serialización hasta que la frontera de confianza esté decidida desde MASTER/CORE.
- Estado constitucional permanece: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

---

# CHECKPOINT NUEVO — 2026-10-23 — NESTED RUNTIME CONTRACT INPUT GUARD

- Hallazgo reproducible: el guard anterior validaba el registro superior de opciones, pero después el runtime leía mission.missionId, mission.steps y adapter.execute de objetos anidados ordinarios; getters en la misión, en un paso o en el adaptador podían ejecutarse antes de rechazo.
- Corrección: executeNexoStep() valida las gráficas completas de misión y adaptador con el contrato común assertContractInput() antes de sus lecturas; executeLuminaNexoStep() valida la misión antes de derivar el postcondition desde los pasos. Se rechazan descriptores accessor, propiedades no enumerables, arrays no canónicos/dispersos, ciclos y demás formas fuera del contrato de datos.
- Regresiones: getter en missionId, getter anidado en steps[0].id y getter en adapter.execute; las tres rutas se rechazan sin invocar getter.
- Límite: el validador no neutraliza Proxy traps, ni convierte el adaptador en autoridad, ni acredita durabilidad. El gate M0 Option A permanece cerrado.
- Estado constitucional sin cambio: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.
- Siguiente: ejecutar CI sobre los SHA exactos de código y pruebas; si pasa, actualizar continuidad sin cambiar el estado de autorización.

---

# CHECKPOINT NUEVO — 2026-10-23 — RUNTIME PUBLIC OPTIONS GUARD

- Hallazgo reproducible: `replanPersistedNexoMission(options)`, `executeNexoStep(options)` y `executeLuminaNexoStep(options)` recibían opciones por destructuring. Un getter propio en `memory`, `adapter` u otro campo consumido podía ejecutarse antes de cualquier validación de memoria/mission.
- Corrección: las tres entradas usan `readRuntimeOptions`, que acepta solo un registro plano/prototipo nulo y extrae los campos consumidos mediante descriptores propios enumerables de datos. Opciones con accessor o prototipo no permitido se rechazan con `NEXO_RUNTIME_OPTIONS_INVALID` sin ejecutar el getter.
- Regresiones en `tests/nexo/runtime.test.mjs`: getter de memoria no ejecutado en replan y en ambas entradas de ejecución; getter de adapter no ejecutado; objeto con opciones heredadas rechazado.
- Commits: runtime [`d2f1e6bd4385e8386ca1cea46dde55ea3abfe4e6`](https://github.com/snowdenxrp/aldea-ia/commit/d2f1e6bd4385e8386ca1cea46dde55ea3abfe4e6), ejecución pública [`0894852a95f1f5695b799b4a62f2c7e3501bdab3`](https://github.com/snowdenxrp/aldea-ia/commit/0894852a95f1f5695b799b4a62f2c7e3501bdab3), regresiones [`43f5d00337b9e074e17ad310012c711c5aa56615`](https://github.com/snowdenxrp/aldea-ia/commit/43f5d00337b9e074e17ad310012c711c5aa56615) y [`bdc31b4b7fdcf684afce1fbf8d6e4f62a5a40f1b`](https://github.com/snowdenxrp/aldea-ia/commit/bdc31b4b7fdcf684afce1fbf8d6e4f62a5a40f1b).
- CI sobre SHA exacto `bdc31b4b7fdcf684afce1fbf8d6e4f62a5a40f1b`: 4/4 SUCCESS — [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883839952), [admisión y continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883840103), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883840014), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883839962).
- Límite: los guards no neutralizan `Proxy traps` ni certifican la confianza de los valores que las opciones referencian. El runtime no adquiere autoridad ni se activa ningún efecto de producto.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: continuar desde la siguiente frontera pública con un defecto reproducible; no repetir guards ya registrados ni reabrir AB104.214/P112 sin evidencia de que su conclusión haya quedado obsoleta.

---

# CHECKPOINT CORRECTIVO — 2026-10-23 — SIMULATION REVISION MUST BE WRITABLE

- Hallazgo adicional reproducible en la misma frontera: una raíz de simulación congelada o con `nexoEffectRevision` no escribible podía pasar la validación inicial y fallar más tarde cuando el adaptador intentara incrementar la revisión, dejando una ruta de ejecución que no podía cumplir su contrato de versión.
- Corrección: si `nexoEffectRevision` existe, se exige propiedad de datos enumerable y escribible; si no existe, la raíz debe ser extensible para poder crearla. Se rechaza en bootstrap en lugar de fallar tras entrar en la ruta de efecto.
- Regresiones: raíz congelada y revisión propia no escribible rechazadas.
- CI sobre SHA exacto `5c98c71c80a013f377d55cff2ca3ecdb682f1f8f`: 3/3 SUCCESS — [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883642669), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883642629), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883642800).
- Límite: no neutraliza `Proxy traps` ni evita que el llamador altere después la simulación. El gate de producto M0 Option A permanece cerrado.

---

# CHECKPOINT NUEVO — 2026-10-23 — SIMULATION ADAPTER BOOTSTRAP INPUT GUARD

- Hallazgo reproducible: `createLuminaEffectAdapter(simulation, options)` desestructuraba las opciones antes de validar descriptores y accedía a `simulation.agents/world` directamente. Getters ordinarios en las opciones o en la raíz de simulación podían ejecutarse durante la construcción del adaptador.
- Corrección: las opciones ahora se extraen mediante descriptores propios de datos de un registro plano/prototipo nulo; `persistPreparedIntent` debe ser función o null. La raíz de simulación exige campos de datos propios para `agents`, `world` y `nexoEffectRevision` si existe, además de la forma esperada de `agents/world`. Los getters ordinarios consumidos por el constructor se rechazan antes de invocarlos.
- Regresiones en `tests/nexo/simulation-adapter.test.mjs`: getter de `executionJournal` en opciones, getter de `simulation.agents`, y hook de persistencia con tipo inválido; todos rechazados sin invocar getters.
- Commits: implementación [`e4f779673942a12f86cf6e833c5aee6caf9c2432`](https://github.com/snowdenxrp/aldea-ia/commit/e4f779673942a12f86cf6e833c5aee6caf9c2432); regresiones [`3ee115e8cd91dd69f1a61a2f21ab7605866fb11c`](https://github.com/snowdenxrp/aldea-ia/commit/3ee115e8cd91dd69f1a61a2f21ab7605866fb11c).
- CI sobre SHA exacto `3ee115e8cd91dd69f1a61a2f21ab7605866fb11c`: 3/3 workflows SUCCESS — [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883507954), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883508015), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883508054).
- Límite: los guards de construcción no neutralizan `Proxy traps` ni protegen frente a mutaciones posteriores de la raíz de simulación. No cambian el gate M0 Option A; la ruta de reparación de producto sigue devolviendo `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: continuar con una frontera pública no cubierta y un defecto reproducible. La revisión de persistencia autoritativa queda en los audits AB104.147–150 / P112 ya citados arriba; no reabrirla sin un cambio de código que invalide sus conclusiones.

---

# CONTINUITY DECISION — 2026-10-23 — DO NOT REPEAT CLOSED EFFECT-DURABILITY AUDIT

- Cross-check of current sources confirms `scripts/nexo-runtime-session.mjs` is an explicit M0 Option A gate: it returns `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`. The assistant entrypoint only invokes that repair session behind explicit `--nexo-repair-once`; the gate itself still prevents dispatch.
- Existing audits already establish the durability boundary and are not to be rerun as fresh research: `NEXO_CONTINUITY/AB104.147–AB104.150`, `NEXO_CONTINUITY/P112_PREPARED_CHECKPOINT_OWNER_AUDIT_V1_2026-10-07.md`, and `docs/nexo/NEXO_AB104_214_EFFECT_PATH_DURABILITY_UNKNOWN_REEXECUTION_AUDIT_V1_2026-09-26.md`. Their established result: no production caller currently invokes `executeLuminaNexoStep()` with an authoritative `persistPreparedIntent` owner; `persistState` is not automatically a durable external-effect journal; the effect path must not be promoted to end-to-end durable execution.
- Consequence: the shared-journal guard just validated is a defensive module-boundary improvement, not permission to connect effect execution to production. Do not wire a persistence callback from a component that does not own canonical state/revision, and do not repeat the closed AB104.214/P112 research unless code changes invalidate its evidence.
- Current implementation evidence remains module-level only: code SHA `af49db18c8818675bb6ef4c8cf325772c57af8aa` passed 3/3 workflows; STATUS update before this note passed [persistence run 39883319766](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883319766).
- Next work must remain within M0 Option A and use the current `STATUS → MASTER/CORE → BUILD` order. Choose a non-effect public boundary with a concrete reproducible gap; keep the product runtime repair path `STOP` until a legitimate canonical execution/persistence owner is designed and evidenced.
- Constitutional state unchanged: M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-23 — SHARED EFFECT JOURNAL DATA-INTEGRITY GUARD

- Hallazgo reproducible: `executionJournal` se compartía entre adaptadores, pero sus elementos se leían con `.filter/.find`, accesos ordinarios y se mutaban sin verificar que el array fuera denso/canónico ni que los registros tuvieran propiedades de datos. Un accessor o un array sparse/malformado podía ejecutar código durante la admisión o interrumpir una ruta de efecto.
- Corrección runtime: `readSafeJournalSnapshot` inspecciona descriptores de array y entradas sin leer valores a través de getters; exige array denso con prototipo canónico, registros planos y propiedades propias enumerables de datos. Se conserva el mismo array compartido, no se crea un ledger aislado. `execute`, `executePrepared` y `verifyPrepared` rechazan el journal malformado con `EFFECT_JOURNAL_INVALID` en la clasificación adecuada antes de despachar.
- Regresiones añadidas en `tests/nexo/effect-adapter.test.mjs`: getter en entrada al construir el adaptador (cero invocaciones), array sparse rechazado y mutación posterior del journal a índice accessor bloqueada antes de llamar al handler.
- Commits: guard del journal [`c66b294154e18a7603bdb45f5072114ed9229e0d`](https://github.com/snowdenxrp/aldea-ia/commit/c66b294154e18a7603bdb45f5072114ed9229e0d); regresiones [`479f9165178e2df9a71f607bb30f84474c753f74`](https://github.com/snowdenxrp/aldea-ia/commit/479f9165178e2df9a71f607bb30f84474c753f74); guards de entrypoints [`7a40fe4d0270e6fa029da5aafb047eefd130f400`](https://github.com/snowdenxrp/aldea-ia/commit/7a40fe4d0270e6fa029da5aafb047eefd130f400) y [`af49db18c8818675bb6ef4c8cf325772c57af8aa`](https://github.com/snowdenxrp/aldea-ia/commit/af49db18c8818675bb6ef4c8cf325772c57af8aa).
- CI final sobre el SHA exacto `af49db18c8818675bb6ef4c8cf325772c57af8aa`: 3/3 workflows SUCCESS — [efectos y settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883225689), [admisión y continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883225712), [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39883225695). El commit de pruebas `479f916...` falló al ejecutar la nueva regresión antes de que el guard público estuviera incorporado; esa ejecución no se cuenta como éxito.
- Límites: no neutraliza `Proxy traps`; la comprobación de descriptores es defensiva contra objetos ordinarios malformados. El ledger continúa siendo mutable y compartido por diseño; las mutaciones externas concurrentes o maliciosas entre awaits siguen siendo una frontera de integridad que no debe confundirse con almacenamiento autoritativo duradero.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: auditar los límites de mutabilidad/propiedad del ledger compartido y la durabilidad real de `executionJournal`. No promover el array en memoria a evidencia de persistencia autoritativa, ni declarar neutralizados los `Proxy traps`.

---

# CHECKPOINT NUEVO — 2026-10-22 — EFFECT ADAPTER REQUEST INPUT GUARD

- Hallazgo reproducible: `execute(request)`, `executePrepared(request, options)` y `verifyPrepared(request)` leían campos caller-owned directamente o por destructuring. Un getter podía ejecutarse antes de que el adaptador clasificara la solicitud.
- Corrección runtime: los tres entrypoints extraen solo campos consumidos mediante descriptores propios de datos de objetos planos/prototipo nulo. `execute` rechaza entrada inválida como `INVALID_EFFECT_REQUEST`; `executePrepared` requiere una confirmación de PREPARED con datos válidos; `verifyPrepared` devuelve `UNKNOWN` ante entrada inválida. El campo `reconcile` se conserva como dato para mantener la clasificación fail-closed existente; no se invoca el callback del solicitante.
- Regresiones agregadas a `tests/nexo/effect-adapter.test.mjs`: getters en solicitud de ejecución, solicitud preparada, opción `preparedCommit` y solicitud de verificación no se ejecutan.
- Commits: request guard [`5abf21e0f6b2994bdb03389709d57592ea5e1d86`](https://github.com/snowdenxrp/aldea-ia/commit/5abf21e0f6b2994bdb03389709d57592ea5e1d86); corrección de compatibilidad y CI [`b44f704dd8719aa7756b6de0c74de432931ab858`](https://github.com/snowdenxrp/aldea-ia/commit/b44f704dd8719aa7756b6de0c74de432931ab858). El SHA intermedio `533e63cb14cdf8657898491ff476e79a98db54c1` falló porque el lector omitía `reconcile` y cambiaba el código de clasificación; la corrección preserva ese campo sin ejecutarlo.
- CI sobre el SHA exacto `b44f704dd8719aa7756b6de0c74de432931ab858`: 3/3 workflows SUCCESS — [efectos y crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882625559), [admisión/continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882625581), [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882625513).
- Límite explícito: los argumentos de entrada ahora se leen sin ejecutar getters ordinarios en los campos consumidos. Los registros de `executionJournal` siguen siendo una frontera separada con lecturas directas; no se afirma que el adaptador completo esté libre de accessors ni de `Proxy traps`.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: revisar los registros de `executionJournal` para determinar cómo rechazar entradas malformadas sin romper su semántica compartida entre adaptadores; no introducir una copia aislada que rompa el ledger compartido.

---

# CHECKPOINT NUEVO — 2026-10-22 — EFFECT ADAPTER BOOTSTRAP REGISTRY GUARD

- Hallazgo reproducible: `createEffectAdapter({ ... } = {})` desestructuraba configuración sin validar sus descriptores y luego construía los registros con `Object.entries`, lo que ejecutaba getters de `handlers` o `verifiers` durante el arranque del adaptador.
- Corrección runtime: las opciones se extraen de un objeto plano/prototipo nulo mediante descriptores propios de datos. Los registros `handlers` y `verifiers` también se recorren mediante descriptores; getters, claves símbolo y valores no función se rechazan sin ejecutar el accessor. Se valida `getStateVersion` como función.
- Regresiones agregadas a `tests/nexo/effect-adapter.test.mjs`: getters en opción `handlers`, registro de handlers y registro de verifiers no se ejecutan; el registro válido conserva `supports` y `supportsReconciliation`.
- Commits: runtime [`14ee7fe52d824f56640c7698523e8b3f75914a80`](https://github.com/snowdenxrp/aldea-ia/commit/14ee7fe52d824f56640c7698523e8b3f75914a80); prueba/formato corregido [`f327db999d5b2a0e0e16a29ebb274300991a7798`](https://github.com/snowdenxrp/aldea-ia/commit/f327db999d5b2a0e0e16a29ebb274300991a7798). El commit de prueba intermedio `af8c1b436a623ee9d950cb3d19df40d6cd50b5b0` falló por un literal `\\n` al inicio del bloque de test; fue corregido y esa ejecución fallida no se cuenta como PASS.
- CI sobre el SHA exacto `f327db999d5b2a0e0e16a29ebb274300991a7798`: 5/5 workflows SUCCESS — [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882338213), [admisión y continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882338207), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882338017), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882338122), [efectos y crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882338052).
- Límite explícito: esta corrección cubre la configuración de arranque y los registros de handlers/verifiers. No afirma que los objetos de `executionJournal` ni los argumentos de `execute/executePrepared` estén libres de accessors; son fronteras separadas que deben revisarse sin extrapolar esta garantía. Los `Proxy traps` tampoco quedan neutralizados.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: revisar la entrada pública `execute/executePrepared` y el uso de `executionJournal` del adaptador, porque permanecen fuera del alcance de esta guardia; no declarar el adaptador completo hasta cubrir o delimitar esas rutas.
- Read-back documental: el commit de STATUS [`0ee41e877e7dac236275c5499493f77fb1039839`](https://github.com/snowdenxrp/aldea-ia/commit/0ee41e877e7dac236275c5499493f77fb1039839) completó persistencia determinista en [run 39882405762 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882405762).

---

# CHECKPOINT NUEVO — 2026-10-22 — OWNER-BACKED RUNTIME PUBLIC INPUT GUARD

- Hallazgo reproducible: `executeNexoStepWithContinuityOwner(args = {})` copiaba opciones con spread antes de validar y comprobaba métodos de `owner/adapter` mediante acceso ordinario. Getters en campos consumidos o en capacidades podían ejecutarse antes de que el runtime rechazara el contexto.
- Corrección runtime: la envoltura extrae los siete campos consumidos mediante descriptores propios de datos desde un objeto plano/prototipo nulo; no copia claves desconocidas. Las capacidades de propietario/adaptador se proyectan como vistas con métodos extraídos de descriptores de datos y llamadas enlazadas al objeto original. Capacidades accessor o ausentes se rechazan antes de invocar el propietario o iniciar dispatch.
- Regresiones agregadas a `tests/nexo/chronicle-runtime.test.mjs`: getter en `missionId`, getter en `owner.loadCurrent` y getter en `adapter.supports`; se exige cero ejecución de getters, cero llamadas al propietario cuando el adaptador es inválido y `dispatchAttempted: false`.
- Commits: runtime [`0d0675783763d573c4c24583ddd7b1ca68396342`](https://github.com/snowdenxrp/aldea-ia/commit/0d0675783763d573c4c24583ddd7b1ca68396342); regresiones [`3d277c1bfb1bc8b2a0d6ef094bde18daec2db088`](https://github.com/snowdenxrp/aldea-ia/commit/3d277c1bfb1bc8b2a0d6ef094bde18daec2db088).
- CI sobre el SHA exacto `3d277c1bfb1bc8b2a0d6ef094bde18daec2db088`: 6/6 workflows SUCCESS — [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882067636), [admisión y continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882067599), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882067646), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882067775), [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882067714), [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882067746).
- Interpretación y límites: no se ejecutan getters ordinarios en las opciones/capacidades consumidas. No neutraliza todos los `Proxy traps`, no autentica capacidades inyectadas y no cambia el estado de autoridad ni habilita efectos protegidos.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: continuar con un defecto reproducible en una frontera aún no cubierta; no ampliar estos guards a una afirmación de confianza de los objetos, sus implementaciones o la autoridad constitucional.
- Read-back documental: el commit de STATUS [`42d0634eabedf970fb29591987507a343e751864`](https://github.com/snowdenxrp/aldea-ia/commit/42d0634eabedf970fb29591987507a343e751864) completó persistencia determinista en [run 39882140733 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882140733).

---

# CHECKPOINT NUEVO — 2026-10-22 — CONTINUITY SERVICE OPTIONS GUARD

- Hallazgo reproducible: la función pública `openNexoContinuityOwner({ ... } = {})` desestructuraba las opciones en la firma, antes de cualquier validación del store. Un getter ordinario en `filePath`, `legacyMemory` u otra opción podía ejecutarse antes de que las guardias de `createNexoContinuityStore` tuvieran oportunidad de rechazarla.
- Corrección runtime: la firma ahora recibe el contenedor sin destructuring. `readContinuityServiceOptions()` acepta solo objetos planos/prototipo nulo, extrae seis campos mediante descriptores propios de datos enumerables y conserva defaults previos. Un accessor de `filePath` devuelve `NEXO_CONTINUITY_STORE_PATH_REQUIRED`; otras opciones accessor o prototipos heredados devuelven `NEXO_STORE_OPTIONS_INVALID`.
- Regresión nueva: `tests/nexo/continuity-service-options-input-guard.test.mjs` verifica getter de ruta no ejecutado, getter de `legacyMemory` no ejecutado, opciones heredadas rechazadas sin crear archivos y ruta válida con memoria heredada preservada. Integrada en `npm test`.
- Commits: runtime [`647aff8d075928868368cbe9577744a0bcc42e3`](https://github.com/snowdenxrp/aldea-ia/commit/647aff8d075928868368cbe9577744a0bcc42e3); test [`ddf6e019dd99492b9622ffa719aaa91cdea27a4c`](https://github.com/snowdenxrp/aldea-ia/commit/ddf6e019dd99492b9622ffa719aaa91cdea27a4c); integración del test en `npm test` y SHA exacto de validación [`cb55c904e7edb272a12c3da34d9cd38ad11e507c`](https://github.com/snowdenxrp/aldea-ia/commit/cb55c904e7edb272a12c3da34d9cd38ad11e507c).
- CI sobre el SHA exacto `cb55c904e7edb272a12c3da34d9cd38ad11e507c`: 4/4 workflows SUCCESS — [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881837784), [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881838271), [admisión y continuidad tras reinicio](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881837944), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881837946).
- Interpretación y límites: se elimina la lectura prematura de getters ordinarios de las opciones consumidas por este servicio. No neutraliza todos los `Proxy traps`, no autentica la memoria heredada, no establece autoridad legítima ni habilita efectos protegidos.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: seguir con otra frontera pública no cubierta solo cuando exista un defecto reproducible; no repetir los guards ya registrados de contratos, Chronicle, admisión de misión ni este servicio.
- Read-back documental: el commit de STATUS [`a132598a35ebf2b22289abd05a2d6e567cf71ed9`](https://github.com/snowdenxrp/aldea-ia/commit/a132598a35ebf2b22289abd05a2d6e567cf71ed9) completó persistencia determinista en [run 39881927971 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881927971).

---

# CHECKPOINT NUEVO — 2026-10-22 — MISSION ADMISSION OWNER RESULT GUARD

- Hallazgo reproducible: `recordNexoMissionSafely(options)` leía `owner.recordMission` y la respuesta del propietario mediante acceso ordinario. Un getter en la capacidad o en `persistenceStatus/status/code/storeRevision` podía ejecutarse antes de clasificar el resultado; además, una respuesta externa podía devolverse sin proyección.
- Corrección runtime: la capacidad `recordMission` se extrae como descriptor propio de datos desde un objeto plano/prototipo nulo y se invoca conservando `this`. La respuesta se valida y proyecta desde descriptores propios de datos; respuestas inválidas pasan a `unknown / NEXO_CHRONICLE_MISSION_ADMISSION_RESULT_INVALID`, sin redispatch. Se exponen solo estado, código y revisión permitidos; los errores solo aportan un código propio de datos, nunca texto de excepción.
- Regresiones en `tests/nexo/mission-admission-wrapper-input-guard.test.mjs`: getter del método del propietario no ejecutado; getter de `persistenceStatus` en respuesta aparentemente comprometida no ejecutado y clasificación final `UNKNOWN`; la ruta válida preexistente se conserva.
- Commits: runtime [`9b24b337157c90ad3e7ba293fe267b0861398d6d`](https://github.com/snowdenxrp/aldea-ia/commit/9b24b337157c90ad3e7ba293fe267b0861398d6d); regresiones [`3abe03d7c885dc11c1f9a4ec6c952422d5bd723e`](https://github.com/snowdenxrp/aldea-ia/commit/3abe03d7c885dc11c1f9a4ec6c952422d5bd723e).
- CI runtime SHA `9b24b337157c90ad3e7ba293fe267b0861398d6d`: aceptación integrada [SUCCESS, run 39881485790](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881485790) y persistencia determinista [SUCCESS, run 39881485780](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881485780).
- CI test SHA exacto `3abe03d7c885dc11c1f9a4ec6c952422d5bd723e`: 3/3 workflows SUCCESS — [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881501662), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881501663), [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881501668).
- Alcance: se evita la ejecución de getters ordinarios en los campos de respuesta consumidos y se cierra la devolución cruda de resultados del propietario. No neutraliza todos los `Proxy traps`, no demuestra confiabilidad del propietario ni autoridad legítima y no habilita dispatch.
- Read-back documental: el commit de STATUS [`76cff468afca977a2aa8b1a8264fbbc2182192f5`](https://github.com/snowdenxrp/aldea-ia/commit/76cff468afca977a2aa8b1a8264fbbc2182192f5) completó persistencia determinista en [run 39881593289 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881593289).
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: continuar con otra frontera pública solo si el defecto es reproducible; no repetir los guards de opciones, sanitización Chronicle ni admisión del propietario ya cubiertos.
- Read-back documental: el checkpoint de STATUS en [`ada0ea43f63db98f8c316c8d9315d378d3220915`](https://github.com/snowdenxrp/aldea-ia/commit/ada0ea43f63db98f8c316c8d9315d378d3220915) completó persistencia determinista en [run 39881693946 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881693946).

---

# CHECKPOINT NUEVO — 2026-10-22 — PUBLIC CHRONICLE RESULT SANITIZER

- Hallazgo reproducible: la función exportada `publicChronicleResult(result, missionId, stepId)` leía `status`, `code`, `dispatchAttempted`, campos triestado y subresultados de timeout mediante acceso ordinario. Un getter en un resultado suministrado por una frontera de aplicación podía ejecutarse durante la sanitización pública.
- Corrección runtime: `src/nexo/application/chronicle-append.mjs` ahora lee solo descriptores propios de datos enumerables de objetos planos/prototipo nulo. Los valores de timeout se vuelven a proyectar campo por campo; `lockRelease` se reduce a `{status, code}` solo si ambos son datos de cadena. Los campos accessor se omiten sin ejecutarlos.
- Regresiones agregadas a `tests/nexo/chronicle-runtime.test.mjs`: getter de `status`, getter de subresultado `prepared`, getters de `phase/writeStarted/lockRelease` y getter anidado de `lockRelease.code`. La prueba también confirma que la clasificación segura y los códigos de timeout ordinarios se conservan.
- Commits: runtime [`1faccdfe2d6c7e68ec7b71db30be68797bd918cf`](https://github.com/snowdenxrp/aldea-ia/commit/1faccdfe2d6c7e68ec7b71db30be68797bd918cf); regresiones e integración [`59b8a1c8a36becf9b39c6e7db2deff7c1cc103c9`](https://github.com/snowdenxrp/aldea-ia/commit/59b8a1c8a36becf9b39c6e7db2deff7c1cc103c9).
- CI verificado sobre el SHA exacto `59b8a1c8a36becf9b39c6e7db2deff7c1cc103c9`: 6/6 workflows `success`: [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881306953), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881306915), [persistencia determinista / `npm test`](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881307004), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881307037), [admisión y continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881306979), [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881306970). El job de admisión/continuidad ejecutó `tests/nexo/chronicle-runtime.test.mjs`; el workflow de persistencia ejecutó `npm test`.
- Interpretación: la sanitización ya no ejecuta getters ordinarios en los campos que consume. Esto no neutraliza todos los traps de `Proxy`, no establece confiabilidad de los objetos de origen, no demuestra autoridad legítima y no autoriza dispatch ni efectos protegidos.
- Read-back documental: el commit de STATUS [`1a5233ea3fd4ddbd16132a4071a7d65310362cdc`](https://github.com/snowdenxrp/aldea-ia/commit/1a5233ea3fd4ddbd16132a4071a7d65310362cdc) también completó persistencia determinista en [run 39881370927 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39881370927).
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: continuar solo con otra frontera pública reproducible y concreta; no volver a auditar la misma sanitización ni extender el cambio a campos que el contrato no consume.

---

# CHECKPOINT NUEVO — 2026-10-22 — MISSION DRAFT PREVIEW INPUT GUARD

- Hallazgo concreto: `previewNexoMissionDraft(continuityPath, missionDraft)` leía `missionDraft.missionId` antes de validar el draft completo. Un getter podía ejecutarse incluso antes de cargar el store; la operación canónica validaba más tarde, demasiado tarde para esta lectura.
- Corrección runtime: se ejecuta `assertNexoMissionAdmission(missionDraft)` antes de leer `missionId` y antes de abrir el store. La guardia existente valida descriptores propios de datos, límites estructurales y forma JSON-like.
- Regresión nueva: `tests/nexo/mission-draft-preview-input-guard.test.mjs` instala un getter centinela y verifica bloqueo, `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, `persisted: false` y cero ejecución del getter. Integrada en `npm test`.
- Commits: runtime `e34e3f1f8cda735c7926cf5dcf593991c6940492`; test `e60f06d7217f8c7eb5a90a62e43f07a03b6fa263`; integración `ed9a4885900d0f04487fb3d7554d8c56ed556f91`.
- CI verificado el 2026-10-22: SHA del checkpoint `0902d4748e5378c02367f5cddc40281cc7b1ce08`, persistencia determinista [SUCCESS, run 39864429149](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864429149). SHA integrado previo `ed9a4885900d0f04487fb3d7554d8c56ed556f91`: admisión/continuidad [SUCCESS, run 39864412972](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864412972), Chronicle nativo [SUCCESS, run 39864412981](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864412981), aceptación integrada [SUCCESS, run 39864412923](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864412923). Persistencia en `ed9a4885` fue cancelada por commit posterior y no se cuenta como resultado.
- Límite: los Proxy traps siguen fuera de la garantía de esta guardia; validar la forma del draft no demuestra que intención y draft estén alineados, no persiste la misión y no evalúa autoridad.
- Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — CHRONICLE PUBLIC SESSION OPTIONS GUARD

- Hallazgo concreto: `runNexoChronicleAppend({ ... } = {})` leía sus ocho opciones por destructuring antes de validar. Un getter en cualquier campo podía ejecutarse antes del primer control de entrada y antes de que la función devolviera un resultado seguro.
- Corrección runtime: el punto de entrada ahora extrae opciones mediante descriptores propios de datos enumerables en objetos planos/prototipo nulo; aplica defaults solo después de la lectura segura y devuelve `blocked / NEXO_CHRONICLE_SESSION_INPUT_INVALID` si la envoltura es inválida.
- Regresión nueva: `tests/nexo/chronicle-session-input-guard.test.mjs` proporciona un getter centinela que lanzaría si se ejecutara; exige bloqueo, `authorization: NOT_EVALUATED`, `dispatchAttempted: false` y cero llamadas al getter. Integrada en `npm test`.
- Commits: runtime `214a96c0e866b7039e89f18ad2741f272b46ed68`; test `65e3f74181df88a158460d05197e5061beefb568`; integración `356990bcea66f5156e5094b203bb5f6a3babd211`.
- CI de la corrección anterior (Chronicle effect) en SHA `f53ac99015d6eef9faf99222de3c4a2655e8d6b8`: [bounded mission admission/restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864266094) y [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39864266027) terminaron `success`; la persistencia determinista estaba en curso cuando se consultó. Para esta nueva integración, comprobar los workflows del SHA exacto antes de declarar validación.
- Límites: los guards no neutralizan todos los Proxy traps ni establecen confianza del store. No prueban interpretación de intención, autoridad legítima, ni autorización para ejecutar efectos protegidos.
- Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — CHRONICLE EFFECT INPUT GUARD

- Hallazgo concreto: `createNexoChronicleEffectContracts({ store })` y el handler de Chronicle leían opciones/operación por destructuring. Un getter en `store`, `missionId` o `target.content` podía ejecutarse antes de validación y, en el handler, antes de decidir si se llamaba a `store.append`.
- Corrección runtime: extracción de campos de datos propios enumerables desde objetos planos/prototipo nulo; el handler rechaza opciones inválidas sin ejecutar getters y extrae `target.content` como descriptor de datos. La fábrica también exige métodos `append` y `loadCurrent` como propiedades propias de datos, evitando evaluar accesores del store.
- Regresión nueva: `tests/nexo/chronicle-effect-input-guard.test.mjs` verifica getter del constructor, getter de `missionId`, getter de `target.content` y que no se llame `append` en los casos inválidos. Integrada en `npm test`.
- Commits: runtime `f53ac99015d6eef9faf99222de3c4a2655e8d6b8`; test `de23714fb27d66ab492f04095ec37298e3f6a3e6`; integración `fa5497c78e8347b5959f5e056282908c2574d4ee`.
- CI: pendiente para el SHA integrado; no declarar PASS hasta leer conclusiones de workflows asociados al SHA exacto.
- Límite: no neutraliza todos los Proxy traps; no demuestra que el store inyectado sea confiable; no autoriza el efecto Chronicle ni cambia la frontera constitucional.
- Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — CONDITIONAL COMMIT ADAPTER OPTIONS GUARD

- Hallazgo concreto: `createPersistStateConditionalCommit({ ... } = {})` leía `persistState`, `statePath` y `clock` mediante destructuring de opciones antes de validar. Un getter ordinario podía ejecutarse al construir el adaptador.
- Corrección runtime: el constructor ahora extrae los tres campos con descriptores propios de datos enumerables, restringe el contenedor a objeto plano o prototipo nulo, y valida explícitamente `persistState`, ruta y `clock`. Las opciones inválidas se rechazan antes de crear el adaptador.
- Regresión añadida al test existente `tests/nexo/conditional-commit-persist-state.test.mjs`: getter centinela en `persistState` debe ser rechazado sin ejecución. El test ya forma parte de `npm test`.
- Commits: runtime `58ea41eef5f57cfc5626e00adfd2405dc552424f`; regresión `a782be8a449ee567263d701b7d42fb4ef6914708`.
- CI sobre SHA de integración de test `a782be8a449ee567263d701b7d42fb4ef6914708`: STEP 3A/3B/3C [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863827928), STEP 4 [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863827907), STEP 5 [success](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863827885); la persistencia determinista [sigue en ejecución](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863827923). El workflow de persistencia para el checkpoint documental posterior `b72682ea1e3ee4e13f6fac1248f02186139f6ff2` está en cola: [run](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863842817). No declarar validación completa hasta cerrar estos dos runs.
- Límite: el cambio protege la extracción de opciones del constructor; no demuestra que el `persistState` suministrado sea confiable ni cambia la evaluación de autoridad o el estado de los efectos protegidos.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

## Incidente y corrección — guard de observación de reparación — 2026-10-22

- La primera ejecución del workflow `Nexo M0 — repair settlement crash cuts` sobre el commit runtime `ddecd9b10eac1d01f275f3c271ee90b30735373c` falló antes de ejecutar las pruebas: una edición generó secuencias literales `\\n` en dos declaraciones y Node reportó `SyntaxError`. No fue un fallo semántico de la regresión; tampoco cuenta como PASS.
- Corrección de sintaxis publicada en `e662afe24269e6f832a178aedfb9f413dbb2f042`. En ese SHA exacto concluyeron `success` tanto [repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863728233) como [deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863728328). La regresión nueva estaba integrada en el `package.json` de ese SHA.
- El fallo inicial se conserva en el historial; el runtime corregido queda validado por esos dos workflows, no por todos los workflows del repositorio. La ejecución de persistencia en el SHA documental posterior se encuentra en cola al momento del último chequeo.

---

# CHECKPOINT NUEVO — 2026-10-22 — PERSISTED REPAIR OBSERVATION INPUT GUARD

- Hallazgo concreto: las funciones exportadas `observePersistedRepairInvariant(options)` y `comparePersistedRepairRevision(options)` recibían opciones por destructuring. Un getter ordinario en `snapshot` o `expectedStateRevision` podía ejecutarse antes de validar el contexto.
- Corrección runtime: `src/nexo/adapters/persisted-repair-observation.mjs` ahora extrae `snapshot/action/target` y `expectedStateRevision/currentSnapshot` mediante descriptores propios de datos enumerables, en objetos planos o de prototipo nulo. Opciones inválidas producen `UNKNOWN` sin evaluar getters.
- Regresión nueva: `tests/nexo/persisted-repair-observation-input-guard.test.mjs` comprueba ambos getters centinela, el comportamiento normal de observación de agente y la comparación de revisiones. Integrada al final de `npm test` en `package.json`.
- Commits: runtime `ddecd9b10eac1d01f275f3c271ee90b30735373c`; test `74b4a3708088d4033fa9289ffc04d5f35a5ea7fd`; integración `2541df081dc34410b3c0c7565c1ae559ad9de4c4`.
- CI: los workflows para el SHA integrado están pendientes de consulta/resultado; no declarar PASS hasta comprobar conclusiones del SHA exacto.
- Límite: esto protege la extracción de opciones ordinarias, no valida exhaustivamente snapshots con getters anidados, no neutraliza todos los Proxy traps, no establece autoridad ni habilita reintentos o efectos protegidos.
- Estado constitucional no cambia: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: comprobar CI de esta integración y continuar solo con defectos reproducibles en las fronteras públicas restantes.

---

# CHECKPOINT NUEVO — 2026-10-22 — CHRONICLE OBSERVATION INPUT GUARD
- Hallazgo: `observeChronicleOperation()` recibía opciones por destructuring, que podía ejecutar getters de `store`, identidad de operación o `target` antes de la validación. También leía `store.loadCurrent` y `target.content` por acceso de propiedad.
- Corrección: `src/nexo/adapters/chronicle-observation.mjs` ahora inspecciona descriptores propios de las opciones y del campo `content`, obtiene `loadCurrent` como método propio de datos y valida la forma básica del resultado leído antes de clasificar la observación. Los casos inválidos retornan `UNKNOWN` y no llaman al store.
- Regresión: `tests/nexo/chronicle-observation-input-guard.test.mjs` comprueba que getters de opciones y de `target.content` no se ejecutan, y que una observación válida de ausencia conserva la semántica `not_applied` / causalidad no establecida. Integrada en `npm test`.
- Commits: runtime `5d9c67e49e08286b5400a9cfe3de82ab812682d2`; test `15946a494167df90ce5785917e25dc8478dd4e3e`; integración `e137229aad19ca01a245d2a5067dabeef41d24d4`.
- CI para el cambio actual: workflows sobre el commit de runtime y sobre la integración de test están en curso/pendientes; no declarar PASS hasta leer conclusiones finales. [Persistencia determinista en el SHA de integración](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863421297).
- CI previo del guard de opciones de admisión: los cuatro workflows para `285464c8c04d027a19268f442f3942bde9d99450` concluyeron `success`; queda documentado en el checkpoint anterior.
- Límite: la validación de descriptores ordinarios no neutraliza todos los traps de `Proxy`, ni prueba que el store sea autoridad confiable. La observación sigue sin demostrar atribución causal ni autorizar reintentos o efectos.
- Estado constitucional no cambia: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: comprobar CI para `e137229aad19ca01a245d2a5067dabeef41d24d4`; después continuar la auditoría de adaptadores por defectos reproducibles, sin ampliar la superficie de cambios por prevención especulativa.

---

## CI FINAL — ADMISIÓN DE OPCIONES — 2026-10-22

Los cuatro workflows asociados al SHA exacto `285464c8c04d027a19268f442f3942bde9d99450` terminaron en `success`:
- [Bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052143)
- [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052297)
- [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052261)
- [Integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052375)

Este resultado verifica esos workflows para ese SHA. El checkpoint documental se agregó después, en `6c9603c35ab88372c14fc3c80bc1734e0f2daa06`; no debe confundirse con el SHA de runtime/test validado.

---

# CHECKPOINT NUEVO — 2026-10-22 — OPCIONES DEL CONTRATO DE ADMISIÓN SIN LECTURA PREMATURA

- Hallazgo concreto: la función exportada `assertNexoMissionAdmission(input, { requestIntent = false } = {})` leía `requestIntent` mediante destructuring antes de validar el registro de opciones. Un getter ordinario en ese campo podía ejecutarse al entrar al contrato.
- Corrección runtime: `src/nexo/core/mission-admission-contract.mjs` ahora recibe `options` sin destructuring y extrae `requestIntent` mediante descriptor propio; rechaza accessors, campos no enumerables, valores no booleanos y prototipos no permitidos con `NEXO_MISSION_CONTEXT_INVALID`. Las opciones omitidas y los registros válidos mantienen el comportamiento previsto.
- Regresión nueva: `tests/nexo/mission-admission-options-input-guard.test.mjs`; integrada en `npm test`.
- Commits: runtime `ca209fd3857acdc14c7fbb427240165048760a43`; test `ec0109e6e2abef21b92adac31642729de15e7edf`; integración del test en `package.json` y SHA combinado de CI `285464c8c04d027a19268f442f3942bde9d99450`.
- CI sobre SHA exacto `285464c8c04d027a19268f442f3942bde9d99450`: 4 workflows disparados y observados inicialmente en curso/pendientes — [admisión y continuidad tras reinicio](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052143), [Chronicle](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052297), [persistencia determinista](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052261), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39863052375). Aún no se declara PASS: falta comprobar las conclusiones finales.
- Alcance: cierra el acceso prematuro a getter ordinario en las opciones de este contrato. No neutraliza Proxy traps hostiles, no autentica evidencia, no resuelve autoridad legítima y no habilita efectos protegidos.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Siguiente: verificar conclusiones de esos cuatro workflows sobre el SHA exacto. Después continuar auditoría de frontera pública solo con defectos reproducibles; no repetir la auditoría ya cerrada de opciones de owner/store/registro.

---

# CHECKPOINT NUEVO — 2026-10-22 — CONSTRUCTORES DE STORES SIN LECTURA PREMATURA DE OPCIONES

- Hallazgo: `createNexoContinuityStore()` y `createNexoChronicleStore()` usaban destructuring de opciones en la firma. Getters en `filePath`, `fsModule`, `lockDeadline` o `lockWaitMs` podían ejecutarse antes de validar la configuración.
- Corrección: ambos constructores inspeccionan prototipo y descriptores propios de los cuatro campos consumidos; rechazan accessors y campos no enumerables, y aplican defaults tras extracción segura. La validación de ruta y presupuesto de lock sigue vigente.
- Regresiones: getter en `filePath` para cada store; se exige que el getter no se ejecute y que se produzca el código de configuración inválida esperado.
- Commits runtime/test: [continuity runtime](https://github.com/snowdenxrp/aldea-ia/commit/27be3d92cee91d7b9135a80ebe1fba6e4b61b765), [Chronicle runtime](https://github.com/snowdenxrp/aldea-ia/commit/b9c247a84178d7b288761c526c0d12d70d266902), [continuity regression](https://github.com/snowdenxrp/aldea-ia/commit/823f1f91c1117cc9a2e15cc6a69a9570c3e0f089), [Chronicle regression / SHA combinado](https://github.com/snowdenxrp/aldea-ia/commit/b5a67903510b4319624d33ebfa723c938a3c59d3).
- CI exacto SHA `b5a67903510b4319624d33ebfa723c938a3c59d3`: 6/6 workflows disparados SUCCESS — [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188829), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188828), [Chronicle](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188968), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862189087), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862188812), [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39862189002). No se afirma que todos los workflows del repo corrieran.
- Informe: [NCS_M0_STORE_CONSTRUCTOR_OPTIONS_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_STORE_CONSTRUCTOR_OPTIONS_INPUT_GUARD_2026-10-22.md).
- Alcance: endurece extracción de configuración. No crea sandbox de filesystem, no neutraliza todos los Proxy traps ni procesos locales hostiles, no cambia la autoridad ni habilita efectos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — OPCIONES DE LLAMADA DEL OWNER VALIDAS ANTES DE DESTRUCTURING

- Hallazgo reproducible: los métodos públicos `recordMission`, `recordOutcome`, `recordPrepared`, `recordExecutionLineage` y `reconcilePrepared` recibían opciones con destructuring de parámetros. Un getter en las opciones se evaluaba antes de entrar al cuerpo y antes de cualquier guard.
- Corrección: helper compartido `readOwnerInputFields()` inspecciona descriptores propios de los campos consumidos y solo extrae propiedades de datos enumerables de objetos planos o de prototipo nulo. Accessors, campos no enumerables, prototipos no permitidos y fallos de reflexión se rechazan antes de entrar en la lógica de store.
- Regresión: cinco métodos públicos se prueban con getter centinela en `expectedRevision`; ningún getter se ejecuta y cada método devuelve `failed`.
- Commits runtime/test: [1c553ac541d3c98f8c36c17047e9a5e750c0ef31](https://github.com/snowdenxrp/aldea-ia/commit/1c553ac541d3c98f8c36c17047e9a5e750c0ef31), [57a7dc4093b371ef69ff7f0dfb2c8e9929ffc09e](https://github.com/snowdenxrp/aldea-ia/commit/57a7dc4093b371ef69ff7f0dfb2c8e9929ffc09e).
- CI exacto SHA `57a7dc4093b371ef69ff7f0dfb2c8e9929ffc09e`: 5/5 workflows disparados SUCCESS — [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949525), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949462), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949470), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949564), [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861949623). No se afirma que todos los workflows del repo corrieran.
- Informe: [NCS_M0_OWNER_CALL_OPTIONS_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_CALL_OPTIONS_INPUT_GUARD_2026-10-22.md).
- Alcance: validación de opciones de llamada in-process; no neutraliza todos los Proxy traps, no autentica evidencia/verificadores, no establece autoridad legítima ni habilita efectos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — OPCIONES DEL CONSTRUCTOR SIN ACCESO A GETTERS

- Revisión del hallazgo de registro: además del getter dentro de `effectVerifiers`, el destructuring de parámetros de `createNexoContinuityOwner()` podía evaluar un getter en el objeto de opciones exterior antes de ejecutar las validaciones.
- Corrección: el constructor recibe ahora `options`, inspecciona prototipo y descriptores propios y solo lee los valores de propiedades de datos válidas. La validación del registro anidado sigue siendo independiente.
- Regresiones: getter en `effectVerifiers` del registro y getter en `effectVerifiers` del objeto de opciones; ambos deben rechazarse sin invocación.
- Commits runtime/test: [eb0249e332d450e7b533ebd7309f721f19f43230](https://github.com/snowdenxrp/aldea-ia/commit/eb0249e332d450e7b533ebd7309f721f19f43230), [c192a9b21cef925ac303644a8f3e6a6d8489dcd7](https://github.com/snowdenxrp/aldea-ia/commit/c192a9b21cef925ac303644a8f3e6a6d8489dcd7).
- CI exacto SHA `c192a9b21cef925ac303644a8f3e6a6d8489dcd7`: 5/5 workflows disparados SUCCESS — [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291162), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291263), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291086), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291219) y [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861291274). Esto cubre los flujos disparados en este SHA, no todos los workflows del repo.
- Informe: [NCS_M0_OWNER_OPTIONS_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_OPTIONS_INPUT_GUARD_2026-10-22.md).
- Alcance: rechaza getters ordinarios en opciones y registro. No neutraliza todos los Proxy traps, no autentica fuente/verificador/evidencia y no establece raíz legítima ni habilita efectos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# Current checkpoint — 2026-10-22 — verifier registry input guard

- Registry runtime/test: `d65245bdbcc20cdee7ebf315d6a65f162bcb894d` / `796219c48fda52dd51e9eec4fa696cb48ec88096`. Outer constructor-options guard/test: `eb0249e332d450e7b533ebd7309f721f19f43230` / `c192a9b21cef925ac303644a8f3e6a6d8489dcd7`. Store-adapter method guard/test: `ccc10ead2f881396bf5af70c24c54a523e10201e` / `7f5bd699b50768d5e890a66a2c2cc9785c46ee1f`.
- Finding: owner construction and injected store validation had read-before-validation paths through accessors. The owner now inspects verifier-registry, outer options, and store-method descriptors before reading values; the store's validated methods are captured so later calls do not re-read mutable properties. Accessor regressions prove getters remain unexecuted.
- Regression proves the getter is not invoked and the registry is rejected with `NEXO_EFFECT_VERIFIER_REGISTRY_INVALID`.
- CI: 7/7 listed workflows succeeded on registry runtime SHA `d65245b...`; 5/5 workflows succeeded on registry test SHA `796219c...`; 5/5 workflows succeeded on latest combined constructor regression SHA `c192a9b...`. Exact current evidence is in `NEXO_NCS/BUILD/NCS_M0_VERIFIER_REGISTRY_INPUT_GUARD_2026-10-22.md`.
- Scope: constructor/configuration boundary only; not authorization, legitimate-owner proof, hostile-Proxy isolation, or effect enablement.
- Canonical gate unchanged: M0 incomplete; authorization `NOT_EVALUATED`; root proof `PENDING/UNKNOWN`; protected effects `STOP`.
- Next: inspect only concrete public-boundary read-before-validation/resource issues, with regression and exact-SHA CI evidence. No arbitrary quotas or invented mechanisms.

---

# CHECKPOINT NUEVO — 2026-10-22 — GUARD DE ENTRADA DEL REGISTRO DE VERIFICADORES

- Hallazgo: `createNexoContinuityOwner()` construía el registro con `Object.entries(effectVerifiers)`, que lee valores de propiedades y puede ejecutar un getter configurado por quien llama al constructor.
- Corrección: el constructor ahora inspecciona claves propias y descriptores, rechaza accessors, símbolos, prototipos no permitidos, entradas no enumerables, nombres vacíos y valores que no sean funciones. El registro interno sigue copiado a un objeto de prototipo nulo y congelado.
- Regresión: `tests/nexo/continuity-contract.test.mjs` usa un getter centinela; la construcción debe rechazar el registro sin ejecutar el getter.
- Commits runtime/test: [d65245bdbcc20cdee7ebf315d6a65f162bcb894d](https://github.com/snowdenxrp/aldea-ia/commit/d65245bdbcc20cdee7ebf315d6a65f162bcb894d), [796219c48fda52dd51e9eec4fa696cb48ec88096](https://github.com/snowdenxrp/aldea-ia/commit/796219c48fda52dd51e9eec4fa696cb48ec88096).
- CI en SHA exacto `796219c48fda52dd51e9eec4fa696cb48ec88096`: 5/5 workflows disparados SUCCESS — [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074402), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074339), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074353), [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074344), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074399). No se afirma que todos los workflows del repo hayan corrido.
- Informe: [NCS_M0_VERIFIER_REGISTRY_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_VERIFIER_REGISTRY_INPUT_GUARD_2026-10-22.md).
- Alcance: evita la evaluación accidental de getters ordinarios en el registro. No neutraliza todos los Proxy traps, no autentica verificadores ni evidencia, no establece autoridad legítima y no habilita efectos protegidos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — VALIDACIÓN DE OBSERVACIONES DEL VERIFICADOR

- Continuación tras recuperar la conexión: la revisión detectó que `reconcilePrepared()` inspeccionaba directamente el objeto devuelto por el verificador de reconciliación. Un getter en `observation.status` podía ejecutarse antes del rechazo estructural.
- Corrección: reutiliza `validateCallerRecord()` antes de leer cualquier campo de la observación. Entrada inválida devuelve `NEXO_EFFECT_RECONCILIATION_EVIDENCE_INVALID`, mantiene el PREPARED sin liquidar y no avanza la revisión canónica.
- Regresión: observación de verifier con getter en `status`; exige cero ejecución del getter, resultado bloqueado, `journalSettled:false` y revisión intacta.
- Commits: runtime `6937d230b7fff32e04416a47c6a612180ef7c1c7`; primer test `988a3facfab2b6291f9f8d636d32fac7b9c372e0` falló porque el fixture utilizaba la operación equivocada y nunca alcanzaba el verificador; se inspeccionó el log, se corrigió el enlace de operación en `e48e2f9b5f63b63176c7e198bea0a4753e85893d`.
- CI en SHA exacto `e48e2f9b5f63b63176c7e198bea0a4753e85893d`: 5/5 workflows disparados SUCCESS — [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091120), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091141), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091130), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091149), [admisión/continuidad](https://github.com/snowdenxrp/aldea-ia/actions/runs/39860091015). No se afirma que todos los workflows del repo corrieran en este SHA.
- Informe: [NCS_M0_VERIFIER_OBSERVATION_INPUT_GUARD_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_VERIFIER_OBSERVATION_INPUT_GUARD_2026-10-22.md).
- Alcance: guard de datos para salida del verifier in-process. No autentica fuente/evidencia, no neutraliza todo código hostil/Proxy en el mismo proceso, no habilita dispatch ni prueba raíz legítima.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — GUARDAS DE ENTRADA OWNER Y OPERACIONES DE CONTINUIDAD

- El primer cambio del owner detectó una regresión de contrato en CI: los rechazos de misión perdían storeRevision. Se corrigió leyendo la revisión actual solo en la ruta de rechazo y sin tocar el estado canónico.
- La auditoría posterior extendió la misma frontera a las funciones exportadas recordNexoExecutionInSnapshot() y recordNexoOutcomeInSnapshot(): el destructuring de parámetros y structuredClone() podían ejecutar getters caller-supplied antes de rechazar los records. Ahora se hace preflight iterativo del record completo y comprobación de persistibilidad antes de leer campos o clonar.
- Regresiones: getter en missionId de recordMission; getter en result de recordNexoExecutionInSnapshot; getter en evidence de recordNexoOutcomeInSnapshot. Se exige que no se ejecuten y que no cambie la continuidad canónica.
- Commits: owner guard [5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037](https://github.com/snowdenxrp/aldea-ia/commit/5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037); preservación de revisión [e11327c73a83ffa1ae5af4dafcc9cf46da648440](https://github.com/snowdenxrp/aldea-ia/commit/e11327c73a83ffa1ae5af4dafcc9cf46da648440); tests de operaciones [89ba6387068b2c303680b2774b752dca213b77e7](https://github.com/snowdenxrp/aldea-ia/commit/89ba6387068b2c303680b2774b752dca213b77e7); fix de operaciones [b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6](https://github.com/snowdenxrp/aldea-ia/commit/b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6).
- CI exacto del HEAD de código b13e68d06f84f1c6e7412a4ca28fa28f75b45cb6: 7 workflows SUCCESS — [persistencia](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781227), [admisión/restart](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781258), [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781259), [STEP 4](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781165), [STEP 5](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781247), [proyección de estado de misión](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781235), [crash cuts de settlement](https://github.com/snowdenxrp/aldea-ia/actions/runs/39858781246). El commit posterior solo documental no se cuenta como un nuevo SHA de código validado.
- Informe: [NCS_M0_OWNER_INPUT_VALIDATION_BEFORE_FIELD_ACCESS_2026-10-22.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_INPUT_VALIDATION_BEFORE_FIELD_ACCESS_2026-10-22.md).
- Alcance: hardening de contratos de entrada in-process. No convierte Proxy traps en inocuos, no crea cuota global de heap, no autentica evidencia ni autoriza efectos protegidos.
- Estado canónico sin cambio: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

---

# CHECKPOINT NUEVO — 2026-10-22 — VALIDACIÓN DE INPUT DEL OWNER ANTES DE LEER CAMPOS

- Hallazgo reproducible de contrato: `createNexoContinuityOwner().recordMission()` inspeccionaba `mission.missionId/steps` antes de ejecutar la admisión compartida. Un getter caller-supplied podía ejecutarse antes de que el guard de misión lo rechazara. Patrones equivalentes de orden existían en las entradas de `recordOutcome`, `recordPrepared`, `recordExecutionLineage` y `reconcilePrepared`.
- Regresión añadida en `tests/nexo/continuity-contract.test.mjs`: misión con getter en `missionId`; se exige que el getter no se ejecute y que la revisión canónica no cambie.
- Corrección en `src/nexo/core/continuity-owner.mjs`: `recordMission` llama primero a `assertNexoMissionAdmission`; las demás entradas de records usan preflight iterativo de continuidad seguido de `assertContractInput` antes de leer campos.
- Commits: regresión [`d05519c5ddea931d83dc691064efb012c85ff848`](https://github.com/snowdenxrp/aldea-ia/commit/d05519c5ddea931d83dc691064efb012c85ff848); fix [`5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037`](https://github.com/snowdenxrp/aldea-ia/commit/5c2bcbe781b2dcd6dd8574a6fb4ea6df10c02037); informe [`137f60e93e47d72de53dcd2c898074bb69b0f7f7`](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_INPUT_VALIDATION_BEFORE_FIELD_ACCESS_2026-10-22.md).
- CI: ocho workflows estaban en cola al registrar el fix. No se declara PASS hasta verificar resultados para el SHA exacto de la rama tras el commit documental.
- Alcance: endurecimiento de entrada in-process; no protege contra código hostil ya ejecutándose en el proceso ni contra todos los traps de Proxy. No es autoridad, autenticación de evidencia ni habilitación de efectos.
- Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — LÍMITE DE LECTURA PARA LOCK OWNER

- Hallazgo de inventario: los stores de continuidad y Chronicle limitaban los documentos canónicos a 16 MiB/32 MiB, pero sus archivos auxiliares `*.lock/owner.json` se leían mediante `readFile()` sin límite explícito. Esos metadatos participan en decisiones de propiedad del lock; una entrada local corrupta o excesiva podía consumir memoria fuera del presupuesto de documento.
- Cambio: `NEXO_RESOURCE_LIMITS.lockOwnerBytes = 4096`. Ambos stores leen owner records con `readUtf8FileBounded`; si superan el límite o no pueden validarse, la adquisición queda `LOCK_STATE_UNKNOWN` y no se elimina el lock ni se inicia la escritura. Esto no reclama resistencia frente a procesos hostiles que controlen el directorio; la configuración de ruta local confiable sigue siendo un requisito documentado.
- Regresiones: `tests/nexo/continuity-store.test.mjs` y `tests/nexo/chronicle-store.test.mjs` ahora comprueban que un owner record de 4097 bytes bloquea de forma fail-closed, preserva el lock y no crea el documento canónico. Las simulaciones de pérdida de propiedad del lock se adaptaron para interceptar `open/read`, conservando la cobertura después de pasar a lecturas acotadas.
- Código y pruebas en HEAD [`1d822786d972616ffbb03e25abd43084076f10e4`](https://github.com/snowdenxrp/aldea-ia/commit/1d822786d972616ffbb03e25abd43084076f10e4).
- CI SUCCESS en ese SHA:
  - STEP 4 semantic validation: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027492
  - STEP 5 outcome classification: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027483
  - bounded mission admission/restart continuity: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027449
  - Chronicle native vertical: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027473
  - integrated acceptance regression: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027551
  - deterministic persistence suite: https://github.com/snowdenxrp/aldea-ia/actions/runs/39853027546
- Scope: límite auxiliar de lectura y tests. No se añadieron locks nuevos, colas, retries de negocio ni cuotas de memoria global; no se cambió el runtime de efectos.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — PREFLIGHT COMPARTIDO Y OPTION A ALINEADA CON SUS PRUEBAS

- Se extrajo el preflight iterativo común a `src/nexo/core/continuity-data-guard.mjs`. Lo usa `continuity-snapshot.mjs` antes de validación recursiva de snapshots y `continuity-contract.mjs` antes de validar memoria legacy. Así la ruta de proyección legacy ya no depende de entrar por un snapshot para tener límite de profundidad.
- Límite global del grafo de continuidad: profundidad 35. Se eligió 35 para conservar el presupuesto existente de profundidad 32 por misión después de los contenedores de snapshot/memoria (snapshot + colección + misión; legacy root + nexo + colección + misión). Esto limita profundidad antes de recursión; no es una cuota de heap ni una medición de producción.
- Regresiones en `tests/nexo/continuity-contract.test.mjs`: snapshot profundo en `attempts`, memoria legacy profunda y `projectNexoContinuitySnapshot()` deben fallar con códigos de límite explícitos antes de la validación/clonación recursiva.
- Option A reconciliada en la prueba CLI, sin tocar runtime: commit [`3850889d7f127c7415d429bc3512d78171573291`](https://github.com/snowdenxrp/aldea-ia/commit/3850889d7f127c7415d429bc3512d78171573291). `tests/nexo/assistants-runtime-cli.test.mjs` ahora exige que la ruta opt-in permanezca bloqueada con `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`, sin crear obligaciones en `effectJournal` ni reescribir el entorno. La misión puede quedar registrada; el efecto protegido sigue excluido.
- CI para el SHA `3e98103aa6ea65a4de4d74b68300ee89a1321e36`:
  - deterministic persistence tests — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246643
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246786
  - STEP 4 semantic validation — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246618
  - STEP 5 outcome classification — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246778
  - bounded mission admission and restart continuity — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852030397 (SHA anterior `d63cf5b`; no atribuir ese run al SHA `3e98103`)
  - repair settlement crash cuts — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39852246635
- El workflow de crash cuts pasa ahora porque la prueba representa Option A con exactitud; esto NO autoriza ejecución de efectos y NO convierte M0 en completo.
- No se habilitó dispatch ni se modificó `scripts/nexo-runtime-session.mjs`. No se cambió el estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — PREFLIGHT ITERATIVO DE PROFUNDIDAD EN SNAPSHOTS

- Hallazgo: `assertNexoContinuitySnapshot()` invocaba el guard recursivo genérico (`assertContractInput`) antes de que la admisión iterativa por misión pudiera limitar profundidad. En snapshots persistidos, un objeto profundamente anidado en colecciones como `attempts` podía agotar la pila durante validación antes de que se aplicaran los límites del documento.
- Corrección: commit [`2b617e2843a7de0c4b9d900ea4f13dbee0e4f191`](https://github.com/snowdenxrp/aldea-ia/commit/2b617e2843a7de0c4b9d900ea4f13dbee0e4f191), `src/nexo/core/continuity-snapshot.mjs`, añade un preflight iterativo antes del guard recursivo. Profundidad máxima del snapshot: 32; los ciclos, propiedades no-dato, claves símbolo, arrays dispersos/extendidos y prototipos no permitidos se rechazan antes de la validación recursiva.
- Regresión: commit [`4c8763a52cea5c481e1291d6d1aaafd1a5aac79c`](https://github.com/snowdenxrp/aldea-ia/commit/4c8763a52cea5c481e1291d6d1aaafd1a5aac79c), prueba un objeto de profundidad 40 en `attempts` y exige `NEXO_CONTINUITY_SNAPSHOT_RESOURCE_LIMIT_EXCEEDED`.
- CI para el SHA de código/pruebas `4c8763a52cea5c481e1291d6d1aaafd1a5aac79c`:
  - deterministic persistence tests — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851743391
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851743415
- En el SHA inmediatamente anterior `2b617e2`, STEP 4, STEP 5 y bounded mission admission/restart continuity también pasaron: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724112 ; https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724169 ; https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724204.
- Separado y aún abierto: el workflow `Nexo M0 — repair settlement crash cuts` falló en `tests/nexo/assistants-runtime-cli.test.mjs:74`, donde se esperaba `continuity.snapshot.effectJournal[0]` aunque el runtime excluyó el efecto (Option A). Las pruebas previas del mismo workflow pasaron; no se cambia runtime ni se altera la exclusión para forzar verde. Run: https://github.com/snowdenxrp/aldea-ia/actions/runs/39851724226.
- Alcance: se endureció validación estructural de snapshot; no se cambió despacho, persistencia de efectos ni autoridad. El techo de profundidad 32 se aplica a todo el snapshot, no sólo al subárbol de misión, y queda registrado como límite estructural v1.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — CI DE PERSISTENCIA: CONCURRENCIA Y EVIDENCIA

- Cambio de workflow: [`3ff6e3f52f5e0fce0d3f9373d6ce1655fec551b0`](https://github.com/snowdenxrp/aldea-ia/commit/3ff6e3f52f5e0fce0d3f9373d6ce1655fec551b0), `.github/workflows/nexo-deterministic-tests.yml`.
- Causa observada: el workflow usaba un grupo de concurrencia fijo (`nexo-deterministic-tests`) y `cancel-in-progress: true`; sucesivos commits cancelaban pruebas de persistencia de SHAs anteriores. Para el SHA `c105f9098faf5bf45531b5c91731499c319070ac`, la ejecución quedó CANCELLED, no FAILED ni SUCCESS.
- Cambio aplicado: grupo por referencia (`nexo-deterministic-tests-${{ github.ref }}`) y `cancel-in-progress: false`, para aislar ramas y encolar ejecuciones en lugar de cancelar el test completo de persistencia con cada push.
- Estado del CI de persistencia antes del ajuste: ejecución para HEAD documental anterior `0ccffaedb981250119f126ab7c351ba3e9c41d18`, run https://github.com/snowdenxrp/aldea-ia/actions/runs/39851124108, seguía `PENDING` sin job asignado al último chequeo; una ejecución previa seguía `IN_PROGRESS` desde antes y sin conclusión. No presentar como verde.
- Los cuatro workflows del SHA de código/pruebas `c105f9098faf5bf45531b5c91731499c319070ac` permanecen en SUCCESS: integrated acceptance regression https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946153; STEP 4 https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946210; STEP 5 https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946069; bounded mission admission https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946071.
- Próxima verificación: confirmar que el nuevo grupo de concurrencia permita que el workflow de persistencia se ejecute y termine en el HEAD actual. No hacer nuevos commits de código mientras se espera, salvo que aparezca un fallo real que requiera corrección.
- No se cambió runtime de Nexo, los límites de admisión, la política de efectos ni la autorización.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — UNIFICACIÓN DEL LÍMITE DE ADMISIÓN PERSISTIDA

- Cambio de contrato: [`df0ea917f38e02afb4dba97c5cec4e13b57a7e72`](https://github.com/snowdenxrp/aldea-ia/commit/df0ea917f38e02afb4dba97c5cec4e13b57a7e72) añade comprobación de admisión al validar misiones persistidas en `src/nexo/core/continuity-contract.mjs`. Un límite de 256 pasos no debe depender de haber llegado por `recordNexoMissionInSnapshot`: los snapshots entregados directamente al store también deben respetarlo.
- Corrección de contrato: [`16406ed67a05a68924289e0c215bd66be84210bc`](https://github.com/snowdenxrp/aldea-ia/commit/16406ed67a05a68924289e0c215bd66be84210bc) conserva los códigos de error de schema ya establecidos para formas persistidas inválidas; sólo propaga el código específico cuando se excede el límite de recursos de misión.
- Regresión: [`17d03d4bab51498dee4293c0d924ab632cf4cf48`](https://github.com/snowdenxrp/aldea-ia/commit/17d03d4bab51498dee4293c0d924ab632cf4cf48) comprueba que un snapshot con 257 pasos se rechaza en la frontera de validación persistida.
- Ajuste de prueba de store: [`c105f9098faf5bf45531b5c91731499c319070ac`](https://github.com/snowdenxrp/aldea-ia/commit/c105f9098faf5bf45531b5c91731499c319070ac) separa el límite del documento de Continuity (16 MiB) del límite de admisión de cada misión. El fixture ahora combina 65 misiones individualmente acotadas para exceder el presupuesto agregado del documento sin que una sola misión viole su propio contrato.
- CI para SHA de código/pruebas `c105f9098faf5bf45531b5c91731499c319070ac` al momento de este checkpoint:
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946153
  - STEP 4 semantic validation — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946210
  - STEP 5 outcome classification — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946069
  - bounded mission admission and restart continuity — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946071
  - deterministic persistence tests — PENDING, sin job asignado aún: https://github.com/snowdenxrp/aldea-ia/actions/runs/39850946294
- Resultado: 4 SUCCESS, 1 PENDING. No declarar CI completo hasta que termine la prueba de persistencia.
- Nota de reparación durante esta ronda: las ejecuciones intermedias `df0ea91`/`16406ed` mostraron regresiones en tests existentes; la causa se acotó a mezclar los errores estructurales previos y el límite de documento con el nuevo límite de admisión. Se corrigió el mapeo y se ajustó el fixture de presupuesto agregado. El SHA `c105f90` ya pasa el workflow de aceptación integrada, que incluye la regresión de continuidad y recuperación.
- No se modificó el runtime de ejecución ni se autorizó ningún efecto. Los límites de admisión existentes no se han elevado.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — MISIÓN RAMIFICADA Y VARIEDAD DE ADMISIÓN

- Código/prueba: [commit `ed48932f2479f398b11a6f10af55c8821150cc00`](https://github.com/snowdenxrp/aldea-ia/commit/ed48932f2479f398b11a6f10af55c8821150cc00), archivo `tests/nexo/continuity-contract.test.mjs`.
- Añade un segundo fixture independiente: grafo fork/join de cuatro pasos, destinos textuales, estados omitidos con valores predeterminados y campos opcionales `reason`, `source`, `reversible`, `requiresEvidence`. Comprueba que se conserva la topología y los campos admitidos.
- CI observado para el SHA exacto:
  - deterministic persistence tests — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868669
  - STEP 4 semantic validation — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868908
  - STEP 5 outcome classification — IN_PROGRESS al último chequeo: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868876
  - integrated acceptance regression — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837869070
  - bounded mission admission and restart continuity — SUCCESS: https://github.com/snowdenxrp/aldea-ia/actions/runs/39837868724
- Estado de CI al guardar este checkpoint: 4 SUCCESS, 1 IN_PROGRESS; no declarar el conjunto completo aprobado hasta que termine el workflow STEP 5.
- Conclusión acotada: ya hay dos formas de misión aceptada en pruebas de integración (cadena con contexto anidado y grafo ramificado con valores por defecto/campos opcionales). Sigue sin ser evidencia de producción, medición de heap ni garantía de que se admitan todas las misiones legítimas.
- No se modificó runtime, no hubo dispatch ni se habilitaron efectos. Siguiente paso: confirmar el workflow pendiente y después abordar una sola brecha de recursos con evidencia; no inventar cuota de memoria global ni concurrencia multiproceso.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

---

# CHECKPOINT NUEVO — 2026-10-22 — GUARD DE OPCIONES EN ADMISIÓN PÚBLICA DE CHRONICLE

- Hallazgo: `recordNexoMissionSafely({ owner, expectedRevision, mission } = {})` desestructuraba opciones antes de validar. Un accesor podía ejecutarse antes de entrar al `try`; no había una prueba específica de esta frontera.
- Primer cambio de runtime: [`2a2408d9`](https://github.com/snowdenxrp/aldea-ia/commit/2a2408d9f78ded91e3566895a74ae85454bb1ced). CI falló en parseo de `chronicle-append.mjs`: se sustituyó la función sin conservar su cuerpo completo de manejo de resultados. Runs fallidos, no ocultados: [aceptación integrada](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865009176) y [persistencia determinista](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865009110). La salida del job identificó `SyntaxError: Unexpected token 'export'`.
- Corrección del runtime: [`8a63cba5`](https://github.com/snowdenxrp/aldea-ia/commit/8a63cba5aee4f434da90aff3c1707708131b7d7d) restaura el manejo de resultados y mantiene el preflight de opciones.
- Regresión nueva: [`eb303003`](https://github.com/snowdenxrp/aldea-ia/commit/eb303003680022cf31688e3304c439aed13f93f7), `tests/nexo/mission-admission-wrapper-input-guard.test.mjs). Comprueba getter no ejecutado, cero llamadas al propietario en entrada inválida y preservación de la ruta válida.
- Integración de la prueba en `npm test`: [`f512e800`](https://github.com/snowdenxrp/aldea-ia/commit/f512e8007a311df141d950f7e89f7e54a6a7211a).
- Estado CI actualizado para el SHA correctivo `8a63cba5aee4f434da90aff3c1707708131b7d7d`: aceptación integrada [SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865107760); persistencia determinista [SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865107828). El CI del SHA intermedio `f512e800` falló por el mismo error de sintaxis; no se considera validación del guard.
- Límite de la corrección: se valida el contenedor de opciones antes de extraer campos y se rechazan prototipos/accessors. Esto no neutraliza todos los traps posibles de Proxy ni prueba autoridad legítima. No se ejecutó dispatch deliberado durante esta corrección.
- Siguiente paso obligatorio: esperar resultados del SHA correctivo, resolver cualquier fallo real y sólo entonces continuar auditando otra frontera.- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

# CHECKPOINT NUEVO — 2026-10-22 — GUARD DEL VERIFICADOR PÚBLICO DE CHRONICLE

- Hallazgo: `createNexoChronicleEffectContracts()` exponía un `verifier` que llamaba a `observe(operation)`; éste construía opciones con `{ store, ...operation }`. El spread puede ejecutar getters de `operation` antes de que `observeChronicleOperation` valide sus descriptores. Las guardias previas del handler y la postcondición no cubrían este punto de entrada.
- Corrección runtime: commit `72ebe229677b98c66401f2d74cfe398508cb99d6`. El verificador ahora lee descriptores propios de datos para `idempotencyKey`, `missionId`, `stepId`, `action` y `target`, y construye un objeto nuevo sin spread del objeto no confiable.
- Regresión: commit `8a7b8562a9f6689c86162b82f4cadab5a1302984`. Se añadió una prueba de getter centinela para el verifier y se comprueba que la lectura del almacén no se inicia.
- CI en comprobación: Chronicle native vertical para SHA runtime `72ebe229...` [SUCCESS, run 39865376589](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376589). En el momento de este checkpoint siguen en curso la persistencia determinista [run 39865376604](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376604) y admisión/continuidad [run 39865376544](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376544). En SHA de test `8a7b8562...`, validación semántica [run 39865398271](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398271) y clasificación de resultado [run 39865398267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398267) están en curso; persistencia [run 39865398289](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398289) está pendiente. No declarar matriz completa hasta revisar conclusiones finales.
- Límite: se previene la ejecución accidental de getters normales en los campos del operation object; no se neutralizan todos los traps de Proxy y esto no acredita procedencia causal ni autoridad legítima. El verificador conserva su semántica observacional; no habilita dispatch.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Resultado posterior del checkpoint de verificador Chronicle — 2026-10-22

- Confirmación de CI para runtime SHA `72ebe229677b98c66401f2d74cfe398508cb99d6`: Chronicle native vertical [SUCCESS, run 39865376589](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376589); persistencia determinista [SUCCESS, run 39865376604](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376604); admisión/continuidad [SUCCESS, run 39865376544](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865376544).
- Confirmación de CI para test SHA `8a7b8562a9f6689c86162b82f4cadab5a1302984`: validación semántica [SUCCESS, run 39865398271](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398271); clasificación de resultado [SUCCESS, run 39865398267](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398267); persistencia determinista [SUCCESS, run 39865398289](https://github.com/snowdenxrp/aldea-ia/actions/runs/39865398289).
- Alcance exacto: estas pruebas validan la regresión del verificador y workflows señalados; no equivalen a una corrida completa de `npm test`, ni a prueba de autoridad raíz o de activación segura de efectos protegidos.


---

# CHECKPOINT NUEVO — 2026-10-22 — ENDURECIMIENTO DE CONTRATOS CORE (CI PENDIENTE)

- `src/nexo/core/contracts.mjs`: validación iterativa del grafo con conjuntos activo/completado; ciclos reales rechazados, referencias compartidas acíclicas admitidas, arrays densos con prototipo canónico y sin propiedades extra, congelación iterativa en postorden.
- Límites de admisión v1 revisados tras CI de compatibilidad: profundidad 40, 100 000 objetos, 16 MiB por cadena y 17 MiB agregados de cadenas/keys. Son límites estructurales, no mediciones de heap ni garantías de producción.
- `detachedMutable()` valida antes y después de clonar. Las listas de claims se validan antes de copiarlas, sin spread previo que normalice la forma de entrada.
- `tests/nexo/core-contracts.test.mjs`: regresiones para ciclos, referencias compartidas, arrays dispersos/extendidos/prototipo no canónico, límites de profundidad/nodos/cadenas y estado mutable cíclico.
- El script `npm test` ahora incluye la prueba directa de contratos como primera etapa para que el workflow de persistencia la ejecute.
- Estado de verificación: prueba directa y CI para el SHA nuevo PENDING hasta observar resultados vinculados al commit; no declarar PASS por la existencia de tests.
- Límite explícito: traps de Proxy no neutralizados. No se cambia autoridad ni se habilita despacho de efectos protegidos.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

# CHECKPOINT DE CORRECCIÓN — 2026-10-22 — ALINEACIÓN DE REGRESIONES DE CONTRATOS

- El primer CI del endurecimiento, en commit `76194883df726b413ae604fb3b7ba224456671f9`, falló de forma visible en regresiones existentes: tres pruebas esperaban el mensaje de error específico de un campo cuando la nueva validación del grafo detectaba antes la forma no canónica del array. Se amplió la expectativa para aceptar ambos rechazos válidos, sin relajar la validación.
- La misma ejecución reveló que `final-semantic-validator.test.mjs` construía un candidato cíclico mediante el constructor público. Ese escenario ahora se separa: la prueba del contrato verifica rechazo en admisión; la prueba del validador usa un candidato externo deliberadamente malformado para conservar la comprobación de resultado `UNKNOWN` al comparar targets cíclicos.
- El commit inicial no se considera validado. Se esperan nuevas ejecuciones sobre el SHA correctivo; no atribuir los resultados del SHA anterior al nuevo.


---

# AJUSTE DE COMPATIBILIDAD — LÍMITES DE GRAFO CORE

- El CI del SHA `739405e42a3ef49e09238980bdf5c8b91734030d` detectó una incompatibilidad real: el límite provisional de 256 KiB por cadena rechazaba el fixture de snapshot válido de 16 MiB antes de que `continuity-store` pudiera devolver su resultado contractual `NEXO_CONTINUITY_STORE_RESOURCE_LIMIT_EXCEEDED`.
- Ajuste para respetar contratos existentes: profundidad 40 (por encima del preflight global de continuidad de 35), 100 000 objetos, 16 MiB por cadena y 17 MiB agregados de cadenas/keys. Así el preflight de contratos no debe apropiarse de la clasificación de capacidad que pertenece al store.
- Se elevan las regresiones de nodo/cadena para probar los nuevos límites reales. La ejecución previa de CI del SHA anterior permanece registrada como FAIL y no se atribuye al SHA correctivo.


---

# VERIFICACIÓN FINAL DE CI — CONTRATOS CORE — SHA `babd2bff70364fb41c174632b944e83edafd8932`

La matriz siguiente corresponde al SHA exacto que contiene el código y las regresiones de contratos tras el ajuste de límites. Las ocho ejecuciones terminaron en SUCCESS:

- STEP 4 semantic validation: [run 39880513860 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39880513860).
- STEP 5 outcome classification: [run 39880513939 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39880513939).
- STEP 3A/3B/3C verification: [run 39880513994 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39880513994).
- STEP 7 policyContext contract: [run 39880514039 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39880514039).
- M0 non-authority core contracts: [run 39880513975 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39880513975). Su job ejecutó `node tests/nexo/core-contracts.test.mjs` y las regresiones de observación, clasificación y transición protegida.
- Integrated acceptance regression: [run 39880514383 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39880514383). Todas las etapas de contratos canónicos, transiciones, Chronicle/runtime, recuperación/crash cuts y clasificación de resultados pasaron.
- Deterministic persistence tests: [run 39880513855 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39880513855). `npm test`, que ahora inicia con la prueba directa de contratos, y la regresión de limpieza temporal pasaron.
- Repair settlement crash cuts: [run 39880513945 — SUCCESS](https://github.com/snowdenxrp/aldea-ia/actions/runs/39880513945).

## Interpretación y límites

- Trigger: push del commit `babd2bff70364fb41c174632b944e83edafd8932` a `ncs-clean-architecture`.
- Head/pin: todas las ejecuciones anteriores apuntan a ese SHA.
- Jobs y logs: las ejecuciones enlazadas conservan los pasos ejecutados y sus logs; la prueba directa de contratos aparece con resultado satisfactorio tanto en el workflow específico de contratos como en STEP 7.
- Resultado: las regresiones añadidas y las matrices seleccionadas pasan en el SHA exacto. Los fallos de los SHA previos `76194883df726b413ae604fb3b7ba224456671f9` y `739405e42a3ef49e09238980bdf5c8b91734030d` se conservaron y corrigieron; no se cuentan como PASS.
- Alcance: esto no equivale a una demostración de producción, no neutraliza traps de Proxy, no demuestra autoridad raíz legítima y no habilita efectos protegidos.
- Estado canónico permanece: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


# CHECKPOINT DE CONTINUIDAD — 2026-10-23 — CORE INPUT CALLER MATRIX (PARCIAL)

- Matriz nueva: [NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md](BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md).
- Commit de la matriz: `0e864571121222f12d5b00ab9eee8600e84e49c9`.
- Se verificaron directamente desde `ncs-clean-architecture` los blobs actuales de `protected-transition.mjs`, `mission-admission-contract.mjs`, `reconciliation.mjs`, `ownership.mjs`, `runtime.js` y el gate `scripts/nexo-runtime-session.mjs`. El índice de code search devolvió un commit antiguo; sus resultados no se trataron como prueba de callsites actuales.
- Resultado: la matriz confirma límites y consumidores de pruebas conocidos, pero la gráfica completa de callers productivos no está cerrada. En particular queda por trazar `owner-backed-runtime.mjs`, las importaciones actuales de cada API pública y las entradas donde datos CLI/archivo/proveedor pasan a objetos vivos.
- No se selecciona todavía el modelo de confianza A/B/C ni se modifica runtime. No añadir guards ni migrar a serialización hasta completar el trace y definir el contrato/error mapping.
- CI documental para la actualización de STATUS pendiente de observar; no se atribuye un resultado antes de verificarlo.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


# AMPLIACIÓN — 2026-10-23 — OWNER-BACKED RUNTIME TRACE

- La matriz se amplió tras inspeccionar `owner-backed-runtime.mjs`, `runtime.js`, `continuity-service.mjs`, `nexo-continuity.mjs`, `nexo.mjs` y `application/index.mjs`.
- Hallazgo: `executeNexoStepWithContinuityOwner` se exporta públicamente por `runtime.js`, recibe owner/adapter por argumentos y construye vistas de capacidades mediante reflexión. El protocolo fuente sí exige PREPARED confirmado con avance de revisión antes de invocar `adapter.executePrepared`, y luego registra lineage/reconciliación; sin embargo, no se confirmó un caller productivo directo de esa exportación ni se autenticó el origen del owner/adapter.
- La CLI independiente `scripts/nexo.mjs` usa una superficie de aplicación estrecha vía `src/nexo/application/index.mjs`, que declara Chronicle append como único caso mutante expuesto. No debe confundirse esa ruta con la exportación genérica owner-backed.
- Matriz actualizada: [NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md](BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md), revisión registrada en commit `0787c6310557b6334e06f8cfc4886463b3068c75`.
- Próximo trace acotado: `src/nexo/application/chronicle-append.mjs`, fábricas owner/adapter y tests de la CLI; además, localizar imports directos de `executeNexoStepWithContinuityOwner` desde fuente actual. No añadir guards locales ni elegir aún A/B/C.
- No se modificó runtime. Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


# CHECKPOINT — CHRONICLE MUTATION / AUTHORITY — 2026-10-23

- Revisión de superficie mutante confirmada: [NCS_CHRONICLE_APPEND_MUTATING_SURFACE_AUTHORITY_REVIEW_2026-10-23.md](BUILD/NCS_CHRONICLE_APPEND_MUTATING_SURFACE_AUTHORITY_REVIEW_2026-10-23.md), commit `4f672b2966ee87aefd1c5550f03d2d790bf8c27b`.
- La CLI independiente sí expone `chronicle-append`, y su prueba de entrypoint espera una escritura local real en un Chronicle temporal. Por tanto, `protected effects: STOP` no debe interpretarse como “toda mutación local está desactivada”. La salida mantiene `authorization: NOT_EVALUATED`; el append es estrecho y local, no prueba autoridad legítima ni autoriza efectos externos protegidos.
- Decisión arquitectónica pendiente: ¿Chronicle append es una capacidad local de persistencia permitida antes de commissioning, o la Constitución exige bloquear cualquier mutación hasta verificar la raíz legítima? No se cambió runtime ni se eligió silenciosamente una política.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


# CORRECCIÓN DE CALLER — 2026-10-23

La matriz de callers fue corregida después de verificar `src/nexo/application/chronicle-append.mjs`: sí existe un caller productivo de `executeNexoStepWithContinuityOwner` para el caso de uso local `chronicle-append`. Esta conclusión reemplaza las notas anteriores de este STATUS que dejaban ese caller sin confirmar. La matriz actual contiene la evidencia exacta: [NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md](BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md), commit `fcb2298ebc582b5f1461051c0fee301faeba4249`.

La CLI puede efectuar una escritura local de Chronicle; no debe afirmarse que todas las mutaciones están deshabilitadas. El resultado sigue diciendo `authorization: NOT_EVALUATED`, y esto no demuestra raíz legítima ni autoriza efectos protegidos externos. Ver también [NCS_CHRONICLE_APPEND_MUTATING_SURFACE_AUTHORITY_REVIEW_2026-10-23.md](BUILD/NCS_CHRONICLE_APPEND_MUTATING_SURFACE_AUTHORITY_REVIEW_2026-10-23.md). La decisión de política local pre-commissioning permanece pendiente; no se cambió runtime.


# DECISIÓN PROPUESTA — ESCRITURA CHRONICLE PRE-COMMISSIONING — 2026-10-23

- Contraste con MASTER: `docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md` exige separación cognición/autoridad/ejecución/verificación, cadena trust→identity→authority→capability→policy→execution, y fail-closed ante gates críticos UNKNOWN; el addendum define WRITE como capability con propósito, misión, scope y expiry.
- Documento de decisión: [NCS_CHRONICLE_PRECOMMISSIONING_WRITE_POLICY_DECISION_2026-10-23.md](BUILD/NCS_CHRONICLE_PRECOMMISSIONING_WRITE_POLICY_DECISION_2026-10-23.md), commit `1c1316b749a590955a93bdf544b0ee65044238d8`.
- Recomendación arquitectónica: mientras la raíz legítima siga `PENDING/UNKNOWN` y `authorization` sea `NOT_EVALUATED`, no considerar autorizado el append local solo porque sea estrecho o local. Default fail-closed para la mutación de Chronicle, salvo que se defina y verifique explícitamente una capability de bootstrap limitada y constitucionalmente permitida. No se inventa esa capability.
- Importante: esto es una propuesta documentada, NO un bloqueo implementado. El CLI actual todavía puede ejecutar `chronicle-append`; no afirmar lo contrario. No se cambió runtime.
- Antes de implementar: cerrar contrato y error mapping, bloquear en la frontera de aplicación antes de inicializar stores/locks/escritura, probar ausencia de archivos y dispatch en rechazo, conservar consultas de solo lectura y ejecutar CI sobre el SHA exacto.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


# ESPECIFICACIÓN DE GATE CHRONICLE PRE-COMMISSIONING — 2026-10-23

- Trazado de orden confirmado en `runNexoChronicleAppend`: tras validar opciones, construye stores, lee ambos, abre el owner (que puede inicializar Continuity), puede inicializar Chronicle, puede persistir la misión y luego despacha el append. Por ello, un gate solo delante de `store.append()` sería tardío e incompleto.
- Documento técnico: [NCS_CHRONICLE_PRECOMMISSIONING_GATE_IMPLEMENTATION_SPEC_2026-10-23.md](BUILD/NCS_CHRONICLE_PRECOMMISSIONING_GATE_IMPLEMENTATION_SPEC_2026-10-23.md), commit `58451953094befc9807834eddf74fb73a2032642`.
- Contrato propuesto: con raíz y evaluator aún no verificados, el gate deny-only debe ejecutarse al inicio de la use case, antes de cualquier operación de store/lock/owner/admission/initialization. No aceptar un booleano, flag CLI, misión admitida ni objeto caller-supplied como prueba de autoridad.
- Regresiones especificadas: no crear archivos ni locks con ambos flags de inicialización; preservar archivos existentes; no llamar stores/owner/admission/handler; respuesta bloqueada con `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, `redispatchAuthorized: false`; mantener las consultas de solo lectura.
- **Runtime no modificado; gate no implementado.** La recomendación es fail-closed, pero no se presume que el usuario haya ratificado un cambio de comportamiento solo por pedir que continúe el trabajo.
- Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

# CHECKPOINT DE DISEÑO — 2026-10-23 — CHRONICLE GATE TEST MIGRATION PREREQUISITE

- Nueva revisión: [NCS_CHRONICLE_PRECOMMISSIONING_GATE_TEST_MIGRATION_REVIEW_2026-10-23.md](BUILD/NCS_CHRONICLE_PRECOMMISSIONING_GATE_TEST_MIGRATION_REVIEW_2026-10-23.md).
- Commit de la revisión: `a6c8ff353c7a18c470b225c4d2dcedcc10804a6c`.
- Lectura de fuentes actuales: la prueba `tests/nexo/chronicle-runtime.test.mjs` mide 100,167 caracteres y contiene 26 referencias textuales a `runNexoChronicleAppend(`; `tests/nexo/entrypoint.test.mjs` espera actualmente una escritura real y resultado `completed` para la ruta CLI.
- Consecuencia: no basta añadir una prueba de denegación. Antes de aplicar el gate hay que clasificar/migrar pruebas de persistencia, recuperación y replay a sus fronteras inferiores adecuadas, sin introducir bypass de desarrollo ni proveedor de autorización ficticio.
- Límite de la afirmación: bloquear el wrapper de aplicación no demostraría por sí solo que todas las APIs inferiores de almacén están bloqueadas. Enumerar las superficies mutantes dentro del alcance antes de afirmar prevención global de escrituras.
- Sin cambios de runtime; gate todavía no implementado; CI de esta revisión documental no confirmado.
- Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

# CHECKPOINT DE FUENTE — 2026-10-23 — CHRONICLE MUTATION SURFACE / TEST OWNERSHIP

- Inventario nuevo: [NCS_CHRONICLE_MUTATION_SURFACE_AND_TEST_OWNERSHIP_2026-10-23.md](BUILD/NCS_CHRONICLE_MUTATION_SURFACE_AND_TEST_OWNERSHIP_2026-10-23.md).
- Commit de creación del inventario: `1031dfc0aee8946ff27d7c3955ccdbd21bf51cec`.
- Confirmación de la API estable: `src/nexo/application/index.mjs` exporta Chronicle append como único caso de uso mutante; las consultas y previews siguen siendo superficies separadas.
- `scripts/nexo-chronicle-session.mjs` lee stdin acotado y llama a la API estable; `scripts/nexo.mjs` expone `chronicle-append` y rechaza comandos genéricos.
- Límite de seguridad: un gate en la API pública puede bloquear esa ruta soportada, pero no prueba que todo import interno de los módulos store sea imposible. El alcance de cualquier afirmación debe nombrarse con precisión.
- Clasificación de pruebas pendiente: no mover pruebas de concurrencia/replay/recuperación por simple renombrado; conservar evidencia de sus invariantes en la frontera adecuada sin crear bypass público ni autoridad ficticia.
- Sin cambio de runtime. Gate no implementado. CI para este commit documental todavía no consultado.
- Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

# CHECKPOINT — CHRONICLE TEST BLOCK OWNERSHIP MAP — 2026-10-23

- Inventario granular nuevo: [NCS_CHRONICLE_TEST_BLOCK_OWNERSHIP_MAP_2026-10-23.md](BUILD/NCS_CHRONICLE_TEST_BLOCK_OWNERSHIP_MAP_2026-10-23.md).
- Commit de creación: `2c3afd16a5a46b5dc362de98319f9013b60e0122`; blob del documento verificado: `9f5ee80a528a890c258c9521314ea9e970747739`, 7,246 caracteres.
- Clasifica los bloques exactos de `tests/nexo/chronicle-runtime.test.mjs` y `tests/nexo/entrypoint.test.mjs`: entrada inválida, límites de recursos, éxito/replay público, concurrencia, bootstrap parcial, recuperación y consultas de solo lectura.
- Conclusión: los escenarios de éxito/replay público entran en conflicto con un eventual deny-first pre-commissioning gate; las invariantes de concurrencia/recovery deben preservarse en la frontera interna correcta, sin renombrado superficial ni bypass de producción.
- El commit documental fue leído de vuelta. Consulta de estado combinado y workflow runs asociados: ambos devolvieron colecciones vacías; **CI no confirmado**, no PASS.
- Sin cambios de runtime ni de pruebas. La política sigue propuesta, no ratificada; no se implementó gate.
- Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

# RECONCILIACIÓN DE POLÍTICA — CHRONICLE BAJO OPCIÓN A — 2026-10-23

- Reconciliación añadida: [NCS_CHRONICLE_OPTION_A_POLICY_RECONCILIATION_2026-10-23.md](BUILD/NCS_CHRONICLE_OPTION_A_POLICY_RECONCILIATION_2026-10-23.md), documento leído de vuelta, blob `13d61a49c8f22bce00fdb3294564687b0ba2936b`, 4,854 caracteres.
- Se contrastó la propuesta reciente de gate deny-first con las decisiones expresas ya registradas: [NCS_M0_E_INITIAL_SCOPE_OWNER_DECISION_2026-10-21.md](DECISIONS/NCS_M0_E_INITIAL_SCOPE_OWNER_DECISION_2026-10-21.md) y [NCS_M0_E_SCOPE_A_ACCEPTED_2026-10-22.md](DECISIONS/NCS_M0_E_SCOPE_A_ACCEPTED_2026-10-22.md).
- Resultado: opción A permite persistencia interna acotada de Chronicle/Continuity para continuidad/evidencia; el documento de decisión menciona expresamente `chronicle_append` como persistencia interna. La propuesta deny-first omitió reconciliar esa decisión anterior y queda superseded en cuanto a bloquear por defecto esta ruta.
- No implementar `NCS_CHRONICLE_PRECOMMISSIONING_GATE_IMPLEMENTATION_SPEC_2026-10-23.md` bajo el alcance vigente; no migrar las pruebas de persistencia/replay a un bypass interno. Mantener las pruebas públicas de Chronicle y la superficie local estrecha.
- Los límites siguen siendo estrictos: rutas controladas por el invocador confiable, sin selección desde contenido no confiable; `authorization: NOT_EVALUATED`; Chronicle no demuestra raíz legítima ni autoriza reparación, Lúmina/simulación, red, comandos o efectos protegidos.
- Este cambio es documental: runtime sin cambios; gate deny-first no implementado; CI de esta actualización documental no comprobado.
- Próximo trabajo: verificar enforcement de las operaciones excluidas y consultas read-only en HEAD actual, luego retomar la brecha M0-E de raíz legítima → Constitución exacta → Policy/contexto → sink protegido, sin inventar autoridad.
- Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## CI VERIFICADO — RECONCILIACIÓN OPTION A — 2026-10-23

- Workflow determinista: [run 39897980663](https://github.com/snowdenxrp/aldea-ia/actions/runs/39897980663), SHA evaluado `7a355915d026525d0d94efe03fcde1a5673f12f3`, estado `completed/success`.
- Job: [tests — 120232750270](https://github.com/snowdenxrp/aldea-ia/actions/runs/39897980663/job/120232750270), `completed/success`.
- Log del job descargado y revisado: cadena de tests ejecutada sin fallo; `Nexo independent entrypoint: unsupported commands fail closed; Chronicle delegates without Lúmina or content leakage`; `Nexo Chronicle owner-backed runtime tests passed`; `Nexo bounded temporary cleanup regression passed`.
- Alcance del resultado: confirma la suite en el SHA citado; no demuestra raíz legítima, autorización constitucional, aislamiento frente a procesos locales hostiles ni autorización de efectos protegidos. El run prueba el commit documental de reconciliación, no un cambio de runtime.
- El update de STATUS que registra este resultado es posterior a ese SHA; no se atribuye a este run la validación de ese update posterior.


---

# CHECKPOINT DE CONTINUIDAD — POST-RECONCILIACIÓN OPTION A — 2026-10-23

## CI del HEAD documental previo

- SHA verificado: `1a56ec4373ebd6fddc7d0deeaab987a922a958b6`.
- Workflow: [39898072765](https://github.com/snowdenxrp/aldea-ia/actions/runs/39898072765) — `completed/success`.
- Job `tests`: [120233038863](https://github.com/snowdenxrp/aldea-ia/actions/runs/39898072765/job/120233038863) — `completed/success`; log descargado y revisado.
- El log incluye: runtime owner-backed Chronicle tests passed; entrypoint independiente rechaza comandos no soportados y delega Chronicle sin Lúmina ni exposición del contenido; regresión de limpieza de temporales acotados pasó.
- El test de frontera actual mantiene rechazo de `execute`, `run`, `simulate`, `shell`, `http`, `effect` y `repair`; la ruta Chronicle local y las consultas de solo lectura permanecen separadas en la API pública.
- Alcance: suite verde para el SHA citado; no demuestra raíz legítima, autoridad constitucional, aislamiento frente a procesos locales hostiles ni cierre universal de todos los imports internos.

## Siguiente trabajo — sin repetir investigaciones cerradas

- Política de persistencia interna ya reconciliada con la decisión aceptada de opción A: conservar Chronicle/Continuity local acotado; no implementar el gate general deny-first ni duplicar/migrar las pruebas existentes sin una regresión nueva.
- Reutilizar como fuente los documentos existentes: `NCS_M0_E_CLAIM_RELATIVE_AUTHORITY_BOUNDARY_INVENTORY_2026-10-22.md`, `NCS_M0_E_CONDITIONAL_COMMIT_SINK_ROLE_AND_ROUTE_MAP_2026-10-22.md`, `NCS_M0_E_EXISTING_TESTS_TO_REAL_MUTATION_BOUNDARY_MATRIX_2026-10-22.md`, `NCS_M0_E_MINIMUM_INTEGRATION_CONTRACT_ANALYSIS_2026-10-21.md` y `NCS_M0_E_OPTION_A_FILESYSTEM_TRUST_BOUNDARY_AUDIT_2026-10-21.md`. No rehacer esas auditorías.
- Brecha M0-E que sigue abierta: no existe procedencia de raíz independiente y verificable enlazada a una Constitución exacta vigente, Policy/contexto y enforcement en un sink protegido real. No inventar raíz, no usar fixtures `AUTHORIZED` como autoridad y no conectar `effectBoundary.prepare` a `conditionalCommit` como arreglo cosmético.
- Continuación técnica de menor riesgo: trabajar sobre una brecha concreta de opción A (integridad/rutas/recursos de persistencia interna) solo si se identifica un contraejemplo reproducible o contrato pendiente; de lo contrario, avanzar únicamente sobre la procedencia/objeto constitucional ya documentados, sin repetir su investigación histórica.
- Este checkpoint es documental. No se cambió runtime ni tests en este commit. CI de este nuevo commit no se atribuye al run anterior.

Estado canónico sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

# RECONCILIACIÓN DE ADMISIÓN — MISSION PREVIEW — 2026-10-23

- Nueva reconciliación: [NCS_M0_E_MISSION_PREVIEW_ADMISSION_RECONCILIATION_2026-10-23.md](BUILD/NCS_M0_E_MISSION_PREVIEW_ADMISSION_RECONCILIATION_2026-10-23.md).
- Commit de creación: `7f4239c30e38fd01d6b9ce56b15466ae4b28eb11`.
- La lectura actual confirma que el hallazgo histórico de lectura JSON sin límite previo ya no describe el código actual: ambos previews CLI usan `readUtf8FileBounded` antes de `JSON.parse`; el contrato compartido `mission-admission-contract.mjs` aplica topes estructurales antes de validación/clonado recursivos.
- Las pruebas existentes cubren 4 MiB exactos y +1 byte en ambos comandos, además de límites estructurales de pasos, dependencias, profundidad, nodos y bytes UTF-8. Se conservan los invariantes `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, `persisted: false`, salida sanitizada y Continuity sin cambios.
- CI determinista que incluye el código/pruebas inspeccionados: [run 39898264772](https://github.com/snowdenxrp/aldea-ia/actions/runs/39898264772), SHA `cdbdef0d8046a95567851eeebb2e41e054112c79`, job `tests` / `120233625839`, `completed/success`; paso `Run tests` exitoso.
- No afirmar que los límites por entrada/estructura sean presupuesto agregado de heap/disco ni protección contra concurrencia multiproceso. La cifra 4 MiB es un límite operativo probado, no demostración de capacidad para toda misión futura.
- Próximo paso: no repetir el trabajo de admisión sin regresión nueva; continuar con el inventario existente de M0-E (autoridad por claim, rutas y sink real), sin reabrir auditorías ya cerradas.
- Esta reconciliación es documental; no cambia runtime ni pruebas y no modifica el estado constitucional.

Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Regresión de consultas de plan — 2026-10-23

- Commit de pruebas: `53bd1a84ba2f9db8f82e0eedf69e590c2e852389`; se amplió `tests/nexo/chronicle-runtime.test.mjs` para cubrir `loadNexoMissionPlan()` dentro de la regresión de solo lectura ya existente.
- Se comprueba respuesta `planned` para misión presente y `not_found` para ausente; en ambos casos `authorization: NOT_EVALUATED` y `dispatchAttempted: false`. El bloque circundante ya comprueba bytes sin cambios, mtime estable y ausencia de inicialización de una ruta inexistente.
- Verificación de publicación: el archivo actualizado y las aserciones nuevas se leyeron de vuelta desde la rama. El conector disponible no proporciona resultados de CI para este push; **no declarar tests/CI PASS** hasta obtener una ejecución ligada al SHA exacto.
- No se modificó runtime ni se amplió autoridad. Esta cobertura es regresión local de consultas, no evidencia de raíz legítima ni enforcement de efectos protegidos.
- Continuidad: reutilizar inventarios M0-E existentes; no repetir auditorías de rutas/sinks. Exigir defecto reproducible antes de tocar runtime.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## CI confirmado — regresión de consulta de plan — 2026-10-23

- Consulta posterior del endpoint Actions por `head_sha` exacto encontró workflow [39899193232](https://github.com/snowdenxrp/aldea-ia/actions/runs/39899193232), SHA `53bd1a84ba2f9db8f82e0eedf69e590c2e852389`, `completed/success`.
- Job `mission-admission-continuity`: [120236555089](https://github.com/snowdenxrp/aldea-ia/actions/runs/39899193232/job/120236555089), `completed/success`; el paso `Run node tests/nexo/chronicle-runtime.test.mjs` terminó en `success`.
- Log del job inspeccionado: la suite terminó sin fallo; incluye `Nexo Chronicle owner-backed runtime tests passed`, los guardas de entrada y `Nexo bounded temporary cleanup regression passed`.
- Corrección de evidencia: la nota anterior decía que CI para el push no estaba confirmado porque el wrapper de runs por commit solo expone runs disparados por PR. La consulta directa de Actions por `head_sha` sí encontró el run de push. El PASS corresponde al SHA de pruebas `53bd1a84...`; no demuestra autoridad raíz ni efectos protegidos.
- El commit posterior de STATUS `bef7bf1018fdff5eaf33f43177ea739279dcfd93` tiene su propio run [39899486462](https://github.com/snowdenxrp/aldea-ia/actions/runs/39899486462), `completed/success`; su job fue revisado y la suite terminó sin fallo.
- Sin cambio de runtime ni de estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Cierre de verificación CI del checkpoint documental — 2026-10-23

- El commit de corrección documental `1323f00933daa31a9c456082e08057a4e55a761d` ya terminó su propia ejecución: [workflow 39899715152](https://github.com/snowdenxrp/aldea-ia/actions/runs/39899715152), `completed/success`; job `tests` / `120238263459`, con pasos `Run tests` y `Bounded temporary cleanup regression` en `success`.
- Se inspeccionaron los pasos y el log del job. Esto confirma la suite CI configurada para ese commit exacto; no convierte los resultados de pruebas en prueba de autoridad constitucional o de una frontera universal de efectos.
- Relectura de fuente actual: `src/nexo/core/mission-admission-contract.mjs` blob `d4ddd88c6c59827e944f8811d00e52cea336f0c1`; `src/nexo/application/mission-request-preview.mjs` blob `4e317b646d0c7b7403acfb63732dec8c3fe7778b`; `tests/nexo/mission-request-preview.test.mjs` blob `74475371c4b50291535822b55212f1c5989afdbf`.
- La revisión no encontró contraejemplo demostrado que justifique modificar el runtime de admisión. Se mantienen los límites existentes y las limitaciones explícitas ya registradas en `NCS_M0_E_MISSION_PREVIEW_ADMISSION_RECONCILIATION_2026-10-23.md`; no se reabre la investigación cerrada sobre 4 MiB ni se interpreta el preview como ejecución.
- Próxima frontera de trabajo: usar el inventario M0-E existente para identificar un punto de enforcement concreto con claim, procedencia, vigencia/revocación y sink identificados. No repetir el mapa de rutas ni aplicar un bloqueo global a persistencia Chronicle.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Reconciliación de la frontera M0-E tras cross-check de contratos existentes — 2026-10-23

- Cross-check de los contratos STEP 7 existentes: `STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md`, `STEP_7_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_ATTACK_2026-10-08.md`, `STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md` y `STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`. No aparece contradicción nueva que justifique reabrir el ataque: la binding Constitution→Policy sigue siendo diseño, y el gate prohíbe construir contexto de autoridad desde datos del caller mientras no exista una base de confianza reconocida independientemente.
- Reutilizados —sin duplicarlos— `NCS_M0_E_CLAIM_RELATIVE_AUTHORITY_BOUNDARY_INVENTORY_2026-10-22.md`, `NCS_M0_E_OPTION_A_FILESYSTEM_TRUST_BOUNDARY_AUDIT_2026-10-21.md`, `NCS_M0_E_OPTION_A_OPERATION_EFFECT_ENFORCEMENT_MATRIX_2026-10-21.md` y `NCS_CHRONICLE_OPTION_A_POLICY_RECONCILIATION_2026-10-23.md`.
- Confirmación acotada de fuente: `src/nexo/application/index.mjs` exporta Chronicle append como único caso de uso mutante público; `src/nexo/core/owner-backed-runtime.mjs` bloquea acciones no permitidas en esa ruta; `tests/nexo/entrypoint.test.mjs` prueba comandos genéricos rechazados y el append local real. Esto no demuestra que todos los imports internos o todas las rutas legacy sean inalcanzables.
- Hallazgo accionable, sin defecto nuevo probado: la confianza de `--continuity` / `--chronicle` sigue descansando en configuración del invocador local confiable. La auditoría existente ya define este límite; no se debe añadir protección parcial de symlink/permisos sin un modelo de amenaza y criterio de aceptación concretos. Tampoco hay una clase de efecto protegido con la cadena completa de raíz independiente → Constitución exacta → Policy/contexto vigente → enforcement en sink real.
- Decisión técnica de esta revisión: no modificar runtime ni repetir matrices/ataques cerrados. Mantener opción A para persistencia interna explícita y acotada; no elevar Chronicle a autoridad. Mantener reparación, Lúmina/simulación, shell/comandos, red y sinks protegidos en STOP.
- Próximo paso legítimo: continuar construyendo la capacidad interna de Nexo bajo opción A cuando exista una mejora funcional concreta respaldada por contrato y prueba; en paralelo, no implementar el camino de autoridad positiva hasta que la base independiente de reconocimiento/provisión pueda verificarse. Ninguna raíz ni mecanismo físico se presume existente.
- Estado canónico: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Esta nota registra revisión de fuentes; no cambia runtime ni pruebas.

## Caller-trace continuation — Core input trust boundary — 2026-10-23

- Reused and extended `BUILD/NCS_CORE_INPUT_TRUST_BOUNDARY_CALLER_MATRIX_2026-10-23.md`; no duplicate matrix or repeated Proxy audit was created.
- Current-branch trace confirms the production Chronicle path: `scripts/nexo.mjs → src/nexo/application/index.mjs → src/nexo/application/chronicle-append.mjs → executeNexoStepWithContinuityOwner`, with Chronicle-specific owner/store/effect contracts. `tests/nexo/entrypoint.test.mjs` asserts the six-use-case public API and walks the CLI import/re-export graph to keep the compatibility runtime and Lúmina/simulation outside that route.
- The owner-backed runtime blocks canonical repair actions and any action other than `chronicle_append` before dispatch. Chronicle append remains a bounded local mutation under accepted Option A; result authority remains `NOT_EVALUATED`. This does not prove root authority, generic protected execution, or that every direct internal-module caller is unreachable.
- Reflection in the live-object guards still cannot neutralize Proxy traps or authenticate injected owner/adapter/store implementations. No runtime patch is justified without selecting and enforcing the input trust model; preserve existing error contracts and do not add another local guard.
- No runtime code or tests changed. No security exploit or authority proof is claimed.
- Next: continue tracing the generic runtime export's consumers only where current-branch source evidence is available; otherwise move to a distinct internal M0 capability with a concrete contract/test rather than repeating the same trust-boundary review.
- Canonical state unchanged: M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.


## Open Loops — existing capability reconciliation and next gate — 2026-10-23

- Added `BUILD/NCS_M0_OPEN_LOOPS_QUERY_CONTRACT_2026-10-23.md` (contract only; no runtime/test change).
- Cross-check found that the master concept is not wholly absent: the stable application API already has read-only continuity status, mission status and single-mission dependency-plan queries. A new “Open Loops engine” or duplicate task ledger would be architectural duplication.
- The candidate extension is a bounded read-only projection over one validated canonical continuity snapshot, keeping mission loops separate from prepared/observed-unsettled effect-journal obligations. It must never infer commitments/deadlines/provenance, grant authorization, or trigger redispatch.
- Before implementation, verify journal record schema/linkage and locate existing valid-snapshot test fixtures. The query must preserve store revision, privacy projection, discrepancy/UNKNOWN semantics, no-mutation guarantees and explicit output bounds. Missing/corrupt state must not appear as an empty successful inventory.
- This contract is an 🔵 EXTENSION candidate, not an implementation claim. No runtime code/tests changed; no CI PASS is claimed for this documentation commit.
- Canonical status unchanged: M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.


## M0 — initial Open Loops query implementation — 2026-10-23

- Implemented `loadNexoOpenLoops(continuityPath)` in `src/nexo/application/continuity-queries.mjs` and exported it from the narrow application API. This is a read-only projection from one validated continuity revision, not a new task ledger.
- Output keeps non-completed mission/step summaries separate from `prepared` and `reconciled_observed` journal obligations; `settled_observed` is excluded. Target/context payloads are not returned. The query always reports `authorization: NOT_EVALUATED` and `dispatchAttempted: false`.
- Projection is capped at 1,000 total mission/step/obligation items. Exceeding the cap blocks rather than silently truncating. An unresolved journal row without mission/step/action linkage returns `NEXO_OPEN_LOOPS_JOURNAL_LINKAGE_UNKNOWN`; missing store remains blocked and is not initialized.
- Added `tests/nexo/open-loops-query.test.mjs` and included it in `npm test`; updated `tests/nexo/entrypoint.test.mjs` to preserve the exact narrow export contract.
- Regression scope includes: missing-store non-creation, required path, same-revision output, distinct journal status classes, private target omission, unchanged file bytes/mtime, deterministic repeated result and UNKNOWN on malformed unresolved-journal linkage.
- Source changes were made through GitHub connector. No local test execution was available in this workflow. **CI on the final code+test SHA is required before this capability is called verified.** Do not claim PASS until workflow completion is observed for that exact SHA.
- CLI exposure is deferred; no actual caller currently requires it. No scheduler, queue, task registry, new identity or authority mechanism was added.
- Canonical status unchanged: M0 `INCOMPLETO`; authorization `NOT_EVALUATED`; legitimate root `PENDING/UNKNOWN`; protected effects `STOP`.


# CHECKPOINT — RECOMENDACIÓN CONSOLIDADA D0 (2026-10-23)

El propietario pidió recomendación técnica sobre las subdecisiones de raíz de instancia. Se añadió al contrato una combinación recomendada: CLI `--root` y API con instancia validada; sin env var inicialmente; raíz inexistente rechazada salvo bootstrap explícito; admisión cross-process reusable manteniendo locks per-store hasta probar compatibilidad; dry-run y corte verificable sin merge/dual-write/borrado automático; `realpath` con límites de symlink/mount declarados; fail-closed ante timeout/ownership/release inciertos; sin fallback silencioso de paths legacy.

Documento: [NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md](BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md).

Esto es una recomendación del consultor, no una afirmación de que el propietario haya aceptado cada subdecisión. D1 continúa abierto: no hay matriz exhaustiva de callers con evidencia guardada. Runtime, tests y workflows siguen SIN CAMBIOS. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


# CHECKPOINT — BARRIDO REMOTO DE MÓDULOS PRODUCTIVOS (2026-10-23)

Se inspeccionaron los 44 módulos actuales src/nexo/**/*.mjs|js y scripts/nexo*.mjs|js desde el árbol recursivo de la rama. Confirmaciones: el CLI padre usa --continuity para consultas/previews; el child de Chronicle usa --continuity y --chronicle; application append construye ambos stores por rutas separadas; queries y continuity-service acceden directamente a stores; repair/dispatch/settlement/verification son consumidores indirectos. El barrido no encontró otras coincidencias literales en el resto de esos módulos.

Evidencia, tree SHA, blobs y limitaciones en BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md, sección 13.

D1 continúa ABIERTO: no equivale a rg en checkout completo, no incluye todos los archivos fuera de esos árboles, no clasifica exhaustivamente alias/imports dinámicos y aún no hay test automatizado de no-bypass. Solo se muestrearon 10 archivos de tests. Runtime, tests y workflows SIN CAMBIOS. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


# CHECKPOINT — CONTRATO PROPUESTO DE ADMISIÓN POR INSTANCIA (2026-10-23)

Revisados los stores actuales: Chronicle y Continuity duplican locks per-store pero difieren en release failure (Continuity reintenta y mantiene cuarentena local por ruta; Chronicle no implementa la misma política). loadCurrent() no toma lock per-store; lock-deadline usa performance.now() con default 2000 ms, y un deadline absoluto no puede transportarse entre procesos.

Recomendación registrada en sección 14 del contrato de raíz: añadir una capa exclusiva de admisión por raíz canónica, mantener locks per-store inicialmente, orden fijo raíz→store, adquisición en una única frontera, sin reentrada, sin recuperación automática de stale locks y sin atribuir autoridad al lock. Códigos propuestos incluyen NEXO_INSTANCE_LOCK_STATE_UNKNOWN, NEXO_INSTANCE_LOCK_STALE_RECOVERY_REQUIRED y NEXO_INSTANCE_LOCK_ACQUISITION_TIMEOUT. No son todavía API pública definitiva.

D2 sigue ABIERTO hasta documentar grafo de llamadas repair/runtime, decidir el único dueño del lock en el flujo Chronicle padre/hijo y definir pruebas de release incierto/no-bypass. Runtime, tests y workflows SIN CAMBIOS. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


# CHECKPOINT — ENTRYPOINTS Y DUEÑO DE ADMISIÓN (2026-10-23)

Se documentó el call graph actual y la frontera recomendada por entrypoint en sección 15 del contrato. Decisión de diseño recomendada: en Chronicle CLI, el proceso que ejecuta runNexoChronicleAppend (el child actual) es el único dueño del lock raíz; no adquirirlo también en un padre ni transportar deadlines monotónicos absolutos por IPC. Para consultas/previews, el comando se envuelve en la API de instancia; helpers internos reciben contexto admitido. Las funciones de reparación mantienen acceso a stores, pero la integración runtime está actualmente bloqueada por NEXO_M0_OPTION_A_EFFECT_EXCLUDED; no reactivarla.

D2 sigue ABIERTO hasta completar matriz de callers indirectos y pruebas de lock/release/no-bypass. No se ha implementado runtime. Estado canónico sin cambios: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.



# CHECKPOINT — CONTRATO DE RESULTADOS DE ADMISIÓN (2026-10-23)

Se añadió la sección 16 al contrato de raíz de instancia: precedencia entre resultado de negocio y admisión; semántica de liberación incierta; códigos candidatos internos; reglas de no repetición automática; matriz de pruebas de contención, owner corrupto/stale, release failure, no-bypass y exclusión de repair/runtime. Los códigos y la forma interna siguen siendo propuestas, no API pública definitiva.

D2 sigue ABIERTO: falta cotejar consumidores de resultados, convertir la matriz en pruebas y completar el inventario reproducible de callers indirectos/no-bypass. D1 también ABIERTO: el barrido remoto previo no equivale a búsqueda exhaustiva en checkout local. No se cambiaron runtime, tests ni workflows. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

Fuente: [Contrato de raíz de instancia y plan de migración](BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md).



# CHECKPOINT — COMPATIBILIDAD DE RESULTADOS Y CALLERS INDIRECTOS (2026-10-23)

Se añadió la sección 17 del contrato tras leer los resultados existentes de continuity queries, Chronicle append, continuity-service, API de aplicación, chronicle-effect, owner-backed-runtime y los módulos repair/runtime. Se documenta que las consultas tienen estados de negocio propios (`loaded/not_found/blocked`), Chronicle preserva `completed/blocked/conflict/unknown/observed/invalid` y el gate de repair runtime devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`. El wrapper futuro no debe borrar incertidumbre ni convertir admisión en autorización.

La pasada redujo riesgo de incompatibilidad, pero no completa la matriz: falta rastreo reproducible de todos los callers de factories/owners/adapters y test de no-bypass. D1 y D2 continúan ABIERTOS. No se cambiaron runtime, tests ni workflows. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.



# CHECKPOINT — MATRIZ DE CALLERS Y NUEVA ENTRADA DIRECTA (2026-10-23)

La sección 18 del contrato registra una matriz reproducible a partir del árbol Git recursivo de la rama (`truncated=false`, tree SHA `cbf0a28c4c31ee1c0be55ad40f76e361d6152893`, 3,019 entradas, 188 ficheros JS/MJS/CJS). Hallazgo importante: `scripts/assistants.mjs` abre `openNexoContinuityOwner` directamente, registra misiones y persiste Continuity, learning memory y estado de entorno. Migrar únicamente los CLIs `nexo` no bastaría. El flujo compuesto no es una transacción entre ficheros.

La matriz cubre CLI/status/preview, Chronicle append, application API, mission request preview, assistants, continuidad facade/service, stores, Chronicle adapter, owner-backed runtime, runtime/simulation adapter, repair helpers y el gate de repair. El inventario es más amplio pero todavía no prueba cierre semántico exhaustivo de los 188 ficheros ni todos los imports dinámicos/reexports.

D1 y D2 continúan ABIERTOS. Próximo: rastrear imports de `nexo-continuity.mjs`, owner constructor, APIs con rutas y adaptadores/runtime; resolver explícitamente el destino de `scripts/assistants.mjs`; diseñar test de arquitectura/no-bypass y terminar el protocolo de migración. Runtime, tests y workflows sin cambios. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.



# CHECKPOINT — FRONTERA ASSISTANTS / LÚMINA Y NO-BYPASS (2026-10-23)

La sección 19 registra que `scripts/assistants.mjs` configura de forma independiente `NEXO_STATE_PATH`, `NEXO_LUMINA_MEMORY_PATH` y `NEXO_CONTINUITY_PATH` (blob `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`, líneas 19–25 y 47–54). La recomendación es tratarlo como integración compuesta Lúmina+Nexo: no mover automáticamente world-state ni memoria Lúmina al root Nexo, no declarar transacción entre archivos y definir qué suboperación Nexo queda bajo admisión. No se implementó.

Las búsquedas de código del conector devolvieron cero resultados para símbolos que sí existen en fuentes revisadas; esto es limitación de búsqueda, no ausencia de callers. D1 sigue OPEN hasta cierre reproducible del call graph y prueba de arquitectura/no-bypass. D2 sigue OPEN hasta contrato, compatibilidad y pruebas de lock. Runtime/tests/workflows sin cambios. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


# CHECKPOINT — ALCANCE REAL DEL TEST DE ARQUITECTURA (2026-10-23)

Lectura directa de `tests/nexo/entrypoint.test.mjs` (blob `ff1bd2e9d292e21e00049b354249aee684837bbc`) confirma que ya existe un guard estático de imports/reexports, pero solo parte de `scripts/nexo.mjs` y `scripts/nexo-chronicle-session.mjs`. Comprueba la API estrecha y evita acoplamiento transitivo con el runtime de compatibilidad/Lúmina; no exige raíz canónica ni bloquea APIs de rutas independientes. De hecho, sus assertions actuales fijan `--continuity` y `--chronicle` como entradas aceptadas.

`tests/nexo/assistants-runtime-cli.test.mjs` (blob `2c4ffb83e3bb849ac35ec381b268ef4f74a13225`) confirma la exclusión conductual de repair (`NEXO_M0_OPTION_A_EFFECT_EXCLUDED`), pero también configura explícitamente los tres paths independientes; no demuestra admisión por root. `scripts/nexo.mjs` delega Chronicle al proceso hijo mediante `spawnSync`, por lo que ese hijo debe ser el único dueño de la futura admisión.

Corrección precisa del estado previo: sí hay guard de arquitectura parcial; falta el guard distinto de root/no-bypass, con lista completa de entradas productivas y contrato separado para `scripts/assistants.mjs` (integración compuesta Nexo+Lúmina). No se cambiaron runtime/tests/workflows. D1/D2 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


# CHECKPOINT — D3: CONTRATO PÚBLICO DE INSTANCIA Y FRONTERA ASSISTANTS (2026-10-23)

Se propuso el contexto único de instancia: raíz explícita y validada; paths Chronicle/Continuity derivados internamente; contexto de admisión no falsificable por un booleano; operaciones completas dentro de una frontera común; helpers sin reentrada. CLI inicial recomendada: \`--root\`, sin env override, raíz existente obligatoria y sin bootstrap implícito. Chronicle pasa solo la raíz al child, que es dueño del lock.

Se fijó propuesta explícita para \`scripts/assistants.mjs\`: integración compuesta; world-state y memoria Lúmina quedan fuera de la raíz Nexo en esta fase; solo la suboperación Continuity puede entrar a través de la API de instancia. No se promete atomicidad entre ficheros y \`NEXO_CONTINUITY_PATH\` no será override productivo del modo root. La exclusión \`NEXO_M0_OPTION_A_EFFECT_EXCLUDED\` permanece intacta.

Se añadieron gates de inventario, API, lock, no-bypass, concurrencia, migración, seguridad y CI al contrato. Esto avanza el diseño pero no cierra D1/D2/D3: faltan cierre reproducible de callers, semántica probada de lock/canonicalización y decisión de compatibilidad de assistants. Runtime, tests y workflows sin cambios. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


# CHECKPOINT — HECHOS DE LOCK DE LOS STORES (2026-10-23)

La lectura directa confirma que loadCurrent() en ambos stores lee/clona sin adquirir lock per-store; openNexoContinuityOwner() puede leer, inicializar solo si está permitido y releer. La admisión raíz debe cubrir desde antes de la primera lectura, incluidas consultas. Chronicle y Continuity tienen locks duplicados con diferencias en release; conservarlos inicialmente. performance.now() es local al proceso: el child Chronicle debe crear su propio deadline a partir de una duración. Las lecturas normales no deben activar inicialización vacía ni proyección legacy. Repair sigue excluido por NEXO_M0_OPTION_A_EFFECT_EXCLUDED. Se documentaron pruebas de admisión antes de loadCurrent, no reentrada, release incierto, propiedad única del child y ausencia de inicialización implícita. D1/D2/D3 OPEN; runtime/tests/workflows sin cambios; estado canónico sin cambios.


# CHECKPOINT — MATRIZ DE FRONTERAS Y CANONICALIZACIÓN (2026-10-23)

Se registró una matriz con SHA de los entrypoints CLI, child Chronicle, append de aplicación, queries, export de Continuity, assistants y factories de stores. Hallazgos: el CLI principal usa API orientada a rutas; el child llama al append; append construye los dos stores y abre owner directamente; las queries construyen stores por ruta; assistants abre owner a través del wrapper de compatibilidad. Son fronteras directas verificadas, no prueba aún de todos los callers indirectos.

Decisión propuesta de canonicalización: raíz existente y directorio obligatorio; realpath antes de derivar filenames fijos; aliases por symlink convergen a la misma ruta canónica; rutas legacy independientes se rechazan en modo root; lectura normal no crea stores ni snapshots; lock reservado con estado desconocido/corrupto falla cerrado y nunca se borra automáticamente. Limitaciones explícitas: no se afirma protección contra procesos locales hostiles, TOCTOU, aliases de montaje, hardlinks o filesystem de red.

El buscador de código devuelve cero incluso para símbolos conocidos existentes, por lo que sus resultados negativos no sirven para probar ausencia. D1 sigue OPEN hasta cerrar callers indirectos, scripts de package y procesos hijo. D2/D3 OPEN. Runtime/tests/workflows sin cambios; estado canónico sin cambios.


# CHECKPOINT — PACKAGE ENTRYPOINTS Y REPAIR (2026-10-23)

El package manifest expone `nexo` (`node scripts/nexo.mjs`) y `assistants` (`node scripts/assistants.mjs`) como comandos de producción. Su script de test ejecuta una suite serial amplia con pruebas de bootstrap, stores, runtime, entrypoints, Continuity, crash cuts de repair y Open Loops. Estos comandos quedan incluidos en el inventario de entrypoints.

`nexo-runtime-session.mjs` mantiene el gate `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`. Los módulos dedicados de repair conservan rutas capaces de persistir estado del entorno; se clasifican como herramientas internas/bloqueadas, no como operaciones de instancia autorizadas automáticamente. Root admission no autoriza repair. D1/D2/D3 siguen abiertos; sin cambios en runtime ni tests.


# CHECKPOINT — EXISTING TEST CONTRACTS AND FALSE FRIEND (2026-10-23)

`src/nexo/application/index.mjs` expone un API estrecho, pero las consultas persistentes aún son orientadas a rutas. `tests/nexo/entrypoint.test.mjs` recorre imports/reexports y protege aislamiento arquitectónico; también verifica append, replay, status y plan. Acepta explícitamente `--continuity`/`--chronicle`, por lo que no prueba admisión por raíz ni ausencia de bypass. La migración debe ampliar este guard y preservar sus invariantes: replay no redispatcha; status/plan no mutan bytes; previews tienen `persisted:false` y `dispatchAttempted:false`; autorización sigue `NOT_EVALUATED`; append conserva su operación Chronicle permitida.

`tests/nexo/root-bootstrap-protocol.test.mjs` verifica un vector de firma P-256 y rechazos de mensaje/firma alterados; no prueba raíces de filesystem ni locks. No contarlo como evidencia de root admission. Los parsers actuales aún no aceptan `--root`; el padre reenvía argumentos al child, que acepta rutas independientes. Debe diseñarse el modo root-only y el rechazo de opciones mezcladas/duplicadas antes de abrir stores. No se ejecutaron tests en este pase; solo lectura de fuentes y documentación.


# CHECKPOINT — TRAZA CLI Y PROCESOS HIJOS (2026-10-23)

`scripts/nexo.mjs` ejecuta consultas/previews dentro del proceso, pero delega Chronicle append mediante `spawnSync` a `scripts/nexo-chronicle-session.mjs`, reenviando argumentos. En append, el child debe ser el único dueño del lock de raíz; consultas/previews también requieren admisión antes de leer snapshots. El parser child aún acepta rutas independientes y no `--root`.

La suite de entrypoint invoca status, plan, misión y preview con `--continuity`, y append/replay con rutas independientes de Continuity y Chronicle. La migración debe probar cada familia de comandos con root, rechazar combinaciones/duplicados antes de abrir stores y conservar envelopes y garantías de no mutación.

`assistants` es un comando compuesto separado: usa `NEXO_STATE_PATH`, `NEXO_LUMINA_MEMORY_PATH`, `NEXO_CONTINUITY_PATH`, abre Continuity vía `nexo-continuity.mjs` y contiene `--nexo-repair-once`. No declararlo root-managed hasta enrutar Continuity por una operación de instancia explícita. Simulación y memoria Lúmina permanecen fuera de la raíz Nexo. Repair sigue excluido por `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; root admission no concede permiso de repair. Inspección documental solamente; no se ejecutaron tests ni se cambiaron archivos runtime/tests/workflows.

## Actualización NCS — 2026-10-23 — CLI y contratos de resultado

**Estado:** diseño de raíz de instancia sigue OPEN. D1/D2/D3 no están cerrados. No se modificó runtime, tests ni workflows; no se ejecutaron pruebas en esta revisión.

Se inspeccionaron directamente `scripts/nexo.mjs`, `scripts/nexo-chronicle-session.mjs`, `src/nexo/application/index.mjs`, `src/nexo/application/chronicle-append.mjs`, `package.json` y `tests/nexo/entrypoint.test.mjs`.

Hallazgos que deben condicionar la implementación:
- Comandos actuales: `status`, `mission-status`, `mission-plan`, `mission-draft-preview`, `mission-request-preview`, `chronicle-append`. El contrato actual usa rutas heredadas; `--root` aún no existe.
- Consultas/vistas previas operan en el proceso principal. Chronicle append se delega con `spawnSync` a `nexo-chronicle-session.mjs`; el hijo debe poseer el root admission lock para append y el padre no debe mantener el mismo lock.
- La API de aplicación es estrecha (siete casos de uso concretos), no un despachador genérico.
- Las pruebas de entrada protegen exportaciones, imports estáticos y compatibilidad de varios resultados; no demuestran todavía root admission, bloqueo global ni rechazo de rutas mixtas. La prueba de bootstrap con nombre similar cubre vectores P-256, no filesystem locks.
- Preservar `authorization: NOT_EVALUATED`, `dispatchAttempted:false` en bloqueos pre-despacho, salidas JSON sanitizadas y distinción entre resultado de negocio y resultado de admisión.
- Las pruebas negativas propuestas están registradas en `BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md`.

**Próximo paso:** cerrar la matriz exacta de resultados/códigos de salida y el inventario de bypasses (incluyendo `assistants.mjs`, reexportaciones, importaciones dinámicas y creación de procesos hijos). Después cerrar D1/D2/D3 en diseño. No comenzar cambios de runtime antes de esas puertas.


### Caller adicional confirmado — `assistants.mjs` (2026-10-23)

La auditoría directa confirma que `scripts/assistants.mjs` abre Continuity por `openNexoContinuityOwner`, registra una misión, escribe memoria Lúmina y persiste el estado del mundo mediante rutas configurables por variables de entorno. Es una vía de persistencia separada de la CLI estrecha `nexo`; no debe declararse root-managed sin una decisión e integración explícitas. El gate de reparación sigue devolviendo `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, pero eso no elimina los otros efectos del comando.

**Consecuencia:** D1 sigue OPEN hasta inventariar todos los callers/bypasses. No envolver todo `assistants` en un lock por intuición; decidir primero alcance y límites multi-store. Estado de raíz legítima y autorización no cambia.


### Hallazgo de store: lecturas no bloqueadas (2026-10-23)

Los métodos `loadCurrent()` de Continuity y Chronicle leen el documento sin adquirir los locks de mutación. Las consultas de aplicación usan directamente esas lecturas. Por tanto, la admisión de instancia debe rodear cada operación completa en la frontera superior, antes de la primera lectura persistida; no basta con añadir un lock a las escrituras. Evitar adquisición recursiva dentro de helpers y mantener los locks de stores como capa distinta hasta probar compatibilidad. D2 sigue OPEN.


### Segundo caller de Continuity confirmado — `scripts/simulate.mjs` (2026-10-23)

El comando `simulate` también abre `openNexoContinuityOwner` con `.nexo-continuity.json`, `legacyMemory` y posible inicialización, además de persistir por separado el estado del mundo. Su lock local protege el world state y tiene semántica de recuperación distinta; no es un root lock. D1 debe decidir explícitamente si `simulate` se excluye de operaciones Nexo o se integra mediante API de instancia. D1 sigue OPEN.


### Candidato de diseño D1 (pendiente, no implementado)

Recomendación: desacoplar `simulate` de Continuity para que no inicialice Nexo incidentalmente; mantener `assistants` como generador de misión candidata, pero canalizar lectura/escritura de Continuity mediante API de instancia, con revisión condicional y sin mantener root lock durante análisis Lúmina. No mezclar world state ni memoria Lúmina con la raíz. Esto sigue siendo propuesta; D1/D2/D3 continúan OPEN.


### Migración implícita confirmada (2026-10-23)

La prueba `tests/nexo/continuity-migration.test.mjs` confirma que `openNexoContinuityOwner({ legacyMemory })` puede migrar memoria legacy al store canónico. Por eso `simulate` y `assistants` pueden causar bootstrap/migración incidental al abrir Continuity. La migración debe ser explícita y pasar por admisión. `nexo-repair-entrypoint.mjs` es helper importable, no CLI; el gate productivo de reparación sigue bloqueado por `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`.


### Matriz de errores CLI completada como documentación (2026-10-23)

El contrato ahora registra los códigos exactos de parseo por comando y los errores de la sesión hija Chronicle, además de la diferencia entre error de parseo, resultado semántico `not_found`, fallo de admisión y fallo de inicio del proceso hijo. Sigue siendo documentación de compatibilidad; no se ha implementado `--root` ni se han ejecutado pruebas.


### Bypass adicional: sesión Chronicle ejecutable directamente

`scripts/nexo-chronicle-session.mjs` tiene guardia de ejecución directa y acepta rutas `--continuity`/`--chronicle` más flags de inicialización. Por tanto, no basta con proteger el padre `scripts/nexo.mjs`: el hijo debe exigir `--root`, derivar rutas internas y adquirir el root lock antes de cualquier lectura. D1/D3 siguen OPEN.


### Matriz de no-bypass de producción documentada

El contrato identifica ocho superficies: CLI principal, hijo Chronicle ejecutable directamente, `assistants`, `simulate`, API pública de aplicación path-based, reexport de continuidad, fábricas de store y helpers de reparación. Se definió condición verificable para D1: grafo de callers completo, rutas path-based fuera de la API de producción y pruebas arquitectónicas que incluyan el hijo directo y los flujos legacy. D1 permanece OPEN hasta cumplirlo.


### Hueco D3: symlink de store puede escapar de la raíz

Canonicalizar la raíz no evita que un nombre reservado como `continuity.json` sea un symlink hacia fuera. D3 debe decidir y probar que los stores existentes sean archivos regulares y no symlinks, y que el lock de raíz no sea un symlink/objeto inesperado. Esto no afirma resistencia a TOCTOU hostil. D3 sigue OPEN.


### Candidato D2: root lock como directorio reservado

La recomendación concreta es `<root>/.nexo-instance.lock/` creado por `mkdir` atómico, con `owner.json` que contenga solo PID, token y marca temporal. Owner corrupto/desconocido y lock stale fallan cerrados; nunca se borra stale automáticamente; la liberación exige comprobar el token. Sigue pendiente de aprobación/pruebas, D2 OPEN.


### D2 lock candidate refinements

Se documentó como candidato (no aprobado) un presupuesto relativo de 2000 ms, polling de 10 ms, stale tras 60 s + PID no vivo, sin borrado automático, lectura limitada de owner y una sola limpieza adicional en liberación con cuarentena local si persiste incertidumbre. D2 sigue OPEN hasta pruebas reales de concurrencia/fallos.


### Censo estático externo parcial (2026-10-23)

Snapshot de árbol no truncado: `6c5ad80d49bb592f0d6d1f5e6ab161d489731241` (3.019 entradas, 188 JS/MJS/CJS). Se revisaron los 13 scripts y los 45 archivos JS/MJS/CJS de `src/` fuera de `src/nexo/`. Los callers directos externos encontrados se concentran en `nexo.mjs`, el hijo Chronicle, `simulate.mjs`, `assistants.mjs` y el reexport `nexo-continuity.mjs`; `src/assistants/memory.js` contiene datos legacy en memoria, no apertura directa de stores. Esto no cierra D1: falta un allowlist arquitectónico probado y revisar todos los módulos internos path-based.


### D2: decisión de lock primitivo todavía abierta

Se identificó una tensión explícita: conservar los locks actuales porque no son equivalentes versus evitar una tercera implementación duplicada. La recomendación es preparar caracterización/regresión de ambos y comparar una primitiva compartida con adaptadores; no refactorizar ni duplicar sin decisión explícita. D2 sigue OPEN.


### Caracterización comparativa de locks de stores registrada

Se documentó una matriz basada en `continuity-store.test.mjs` y `chronicle-store.test.mjs`: esquema owner distinto, stale/corrupt fail-closed, timeout estructurado, release retry/quarantine diferente y lecturas sin lock. Antes de elegir primitiva compartida, caracterizar resultados exactos y bytes persistidos. D2 sigue OPEN.


### Censo de referencias Nexo en aplicación ampliado — 2026-10-23

Se revisaron los 34 módulos de `src/nexo/`, complementando los 13 scripts y 45 archivos JS/MJS/CJS de `src/` fuera de `src/nexo/`. El inventario clasifica ocho grupos: CLI principal, hijo Chronicle directo, API de aplicación path-based, servicios/stores filesystem, owner/runtime en memoria, adaptadores/efectos, memoria legacy y comandos compuestos, y módulos de pueblo/aldea/mundo/vendor visual.

Hallazgo clave: los módulos de pueblo/aldea y los entrypoints visuales no muestran apertura directa de stores Nexo; `src/assistants/memory.js` mantiene datos `memory.nexo` en memoria, pero los callers externos de persistencia siguen siendo `assistants.mjs`, `simulate.mjs`, el hijo Chronicle y la CLI principal. Dentro de Nexo, `application/**`, `continuity-service.mjs` y las fábricas de store aún aceptan rutas directas. El censo define puntos conocidos, pero no prueba no-bypass hasta añadir un allowlist de imports/callers de producción y tests arquitectónicos.

El blob `src/three.core.js` existe (1.403.455 bytes); el fetch textual vacío no significa archivo ausente. Se excluyen vendor Three.js y coincidencias léxicas como `transmission` de las referencias Nexo. Censo ampliado solo documental; D1/D2/D3 siguen OPEN; sin cambios de runtime/tests/workflows ni ejecución de pruebas.


### Artefacto de censo completo preservado como archivo independiente — 2026-10-23

Para que el inventario no dependa solo de este resumen ni de un chat, se creó `RESEARCH/NCS_M0_NEXO_SOURCE_REFERENCE_CENSUS_2026-10-23.md`. Incluye rutas, blob SHA, tamaños y clasificación de las **13 entradas de `scripts/`, 34 módulos de `src/nexo/` y 45 archivos JS/MJS/CJS de `src/` fuera de `src/nexo/`** (92 rutas). Snapshot del árbol: commit `f105a3a6b88c372d22aed49d29ea56d2d17ade78`; árbol completo, no truncado. El archivo distingue explícitamente el censo de aplicación de los 188 archivos JS totales: no afirma que tests/tooling/fixtures hayan sido auditados como grafo completo.

Enlace: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/RESEARCH/NCS_M0_NEXO_SOURCE_REFERENCE_CENSUS_2026-10-23.md

**Siguiente trabajo:** convertir el censo en allowlist verificable del grafo de callers/imports productivos. No repetir la revisión de los 92 archivos salvo que cambie el snapshot o aparezca evidencia concreta de omisión. D1/D2/D3 siguen OPEN; sin cambios de runtime/tests/workflows ni pruebas ejecutadas.


### Allowlist de callers productivos — borrador D1 preservado (2026-10-23)

Se creó `RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md`, que convierte el censo en una propuesta de frontera: entrypoints de producción, API de instancia deseada, primitivas path-based internas, tests permitidos, grafo conocido y reglas para un test arquitectónico. También se revisaron los imports directos de los 45 tests Nexo y 50 tests fuera de `tests/nexo/`; estos últimos no mostraron imports directos de stores/API de Continuity/Chronicle. `package.json` declara como comandos de producción `nexo`, `assistants` y `simulate`; la sesión hija Chronicle sigue siendo invocable directamente aunque no sea script npm.

**Esto no cierra D1:** falta una prueba arquitectónica ejecutable que recorra imports/reexports transitivos, identifique ejecución directa y cubra `spawn`/imports dinámicos, y que falle con fixtures de bypass. No se modificó runtime/tests/workflows ni se ejecutaron pruebas.

Enlace: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md


### Extensión de importaciones estáticas: 188 archivos JS/MJS/CJS (2026-10-23)

Se amplió el censo para cubrir también los 45 tests `tests/nexo/**`, los 50 tests restantes y `functions/api/capture.js`, además de los 92 archivos de aplicación ya inventariados. Los tests Nexo importan internals deliberadamente y deben estar segregados del allowlist productivo; los 50 tests fuera de `tests/nexo/` no mostraron imports directos a stores/API path-based. `package.json` confirma tres comandos productivos (`nexo`, `assistants`, `simulate`); la sesión Chronicle hija es una superficie adicional por ejecución directa.

Esto completa la revisión de imports estáticos conocidos del conjunto de 188 archivos, pero **no** prueba ausencia de imports dinámicos/computados ni cierra el grafo de seguridad. El siguiente paso sigue siendo el test arquitectónico negativo descrito en el borrador de allowlist. No se ejecutaron pruebas.


### Escaneo de imports dinámicos y procesos hijos en aplicación (2026-10-23)

Se inspeccionaron los 13 scripts, 34 módulos `src/nexo/**` y 45 módulos `src/**` externos a Nexo buscando `import(...)`, `require`, `createRequire`, `eval`, `Function`, procesos hijos y guardas directas. Único proceso hijo productivo observado: `scripts/nexo.mjs` → `spawnSync` de `nexo-chronicle-session.mjs`. Únicos guards directos relevantes: `nexo.mjs`, `nexo-chronicle-session.mjs`, `simulate.mjs`. No se encontraron imports dinámicos/require/eval en scripts ni en `src/nexo/**`; el único import dinámico fuera de Nexo está en `src/three-remote.js` para cargar Three.js.

Esto reduce el alcance de mecanismos dinámicos conocidos en aplicación, pero no reemplaza una prueba arquitectónica que proteja el grafo transitivo contra cambios futuros. El resultado está registrado en el borrador de allowlist. D1 sigue OPEN; sin tests ejecutados.


### Imports dinámicos de tests clasificados como TEST_ONLY (2026-10-23)

Se clasificaron los imports dinámicos y procesos hijos de tests: los workers/CLI están en `tests/nexo/**`; el único import con URL de entorno para cargar un módulo de store está en `tests/nexo/continuity-store.test.mjs` y es un harness de prueba; imports dinámicos de memoria/society/fs pertenecen a tests. No se encontró un import dinámico de store en código de aplicación. `src/three-remote.js` usa `import(url)` exclusivamente para Three.js. La separación de tests y producción queda registrada en el allowlist borrador; D1 sigue OPEN hasta que exista la prueba arquitectónica ejecutable.


### Conflicto de secuencia D1 documentado (2026-10-23)

Se detectó un ciclo en las instrucciones previas: D1 exige un test arquitectónico ya implementado para cerrar, pero a la vez se prohíbe modificar tests hasta cerrar D1/D2/D3. Se documentó en el contrato y el allowlist una recomendación para separar `D1-DESIGN` (inventario, tratamientos, allowlist y test spec completos) de `D1-IMPLEMENTATION` (test implementado/ejecutado después de cerrar todas las puertas de diseño). No se cambia el estado a cerrado ni se implementan tests; falta aceptar/revisar esta separación. D1/D2/D3 siguen OPEN.


### Hallazgo de cobertura: 17 tests Nexo no listados en `npm test` (2026-10-23)

Comparación estática de `package.json` contra el árbol: existen 44 archivos `tests/nexo/*.test.mjs`; el script `test` invoca 27 y omite explícitamente 17, listados en `RESEARCH/NCS_M0_PRODUCTION_CALLER_ALLOWLIST_DRAFT_2026-10-23.md`. No se declara automáticamente que sea un defecto: hay que determinar por prueba omitida si la exclusión es intencional. La futura prueba arquitectónica de D1 deberá estar conectada explícitamente a la verificación requerida; no bastará con que exista como archivo.


### Punto de recuperación tras interrupciones (2026-10-23)

El trabajo se detuvo durante el censo de referencias/callers de Nexo y la sincronización de documentación. Último punto: matriz de fronteras de producción añadida al contrato de raíz de instancia; incluye CLI principal, hijo Chronicle ejecutable directamente, `assistants`, `simulate`, API de aplicación, fábricas path-based y helpers repair. La sesión hija Chronicle es un bypass real de la frontera del padre; `loadCurrent()` no adquiere locks; `simulate`/`assistants` pueden abrir o migrar Continuity incidentalmente. No se modificó runtime/tests/workflows ni se ejecutaron pruebas.

El handoff `NEXO_NCS/BUILD/NCS_MASTER_HANDOFF_NEXT_CHAT_2026-10-23_OPEN_LOOPS.md` contiene el punto de recuperación detallado y las instrucciones de continuidad. D1/D2/D3 siguen OPEN; M0 incompleto; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Próximo paso: recuperar/verificar el censo completo, resolver la recomendación pendiente de separar D1-DESIGN de D1-IMPLEMENTATION, y no reiniciar investigaciones antiguas.


### Reconciliación D1 de callers y alcance de admisión (2026-10-23)

Se creó el informe documental [NCS_M0_D1_CALLER_RECONCILIATION_AND_LOCK_SCOPE_2026-10-23.md](BUILD/NCS_M0_D1_CALLER_RECONCILIATION_AND_LOCK_SCOPE_2026-10-23.md), commit `254cd885637576ef997a5a389d65a6b645ab3f62`. Consolida la matriz de CLI padre/hijo, APIs de aplicación, factories/owner, `assistants`, `simulate`, repair y tests; registra blobs de fuentes inspeccionadas, alcance de la sección crítica, especificación mínima de test arquitectónico y orden de trabajo D1/D2/D3.

Hallazgo adicional confirmado en fuente: `assistants.mjs` carga estado del mundo, abre Continuity con `legacyMemory`, registra misión, escribe memoria Lúmina y después persiste estado del mundo; no hay atomicidad conjunta. `simulate.mjs` mantiene un lock separado para world state con recuperación stale distinta y puede abrir/inicializar Continuity. Se recomienda excluir simulación de la persistencia ordinaria de Nexo hasta definir una operación explícita; no reutilizar su lock como admisión de instancia.

Estado sin cambio: D1/D2/D3 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP. Esta revisión fue documental: sin cambios de runtime/tests/workflows y sin ejecución de tests/CI. El censo de callers sigue siendo parcial hasta cerrar el grafo con una prueba arquitectónica.


### Matriz D0/D2/D3 de decisiones preparada — 2026-10-23

Se creó [NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md](BUILD/NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md), commit documental `f352f7019b045d663bc8748d5173107827923f05`. Reduce las decisiones abiertas a contratos y criterios verificables: interfaz/precedencia de raíz, bootstrap, symlinks/alias, migración legacy, tratamiento de `simulate` y `assistants`, frontera path-based, alcance/orden del lock, errores de lock, proceso hijo Chronicle, cutover/rollback y límites de garantía.

La matriz separa hechos observados de recomendaciones y decisiones que corresponden al propietario. **No se considera aprobación de ninguna subdecisión**; en particular, separar `D1-DESIGN` de `D1-IMPLEMENTATION` sigue pendiente. No se modificó runtime/tests/workflows ni se ejecutaron tests/CI. D0/D1/D2/D3 siguen OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


### Caracterización estática de locks — 2026-10-23

La matriz [NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md](BUILD/NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md) fue ampliada con la lectura directa de `continuity-store.mjs` y `chronicle-store.mjs`. Confirmado: ambos usan lock por-store, token y fail-closed para estado incierto; no son intercambiables. Continuity registra fallos persistentes de release, reintenta una vez y puede informar `released_after_retry`; Chronicle devuelve fallo tras un intento y no presenta el mismo registro persistente. El test de bootstrap existente es solo vector software, no raíz legítima ni integración hardware.

Esto refuerza la recomendación de no unificar los locks por extracción mecánica y diseñar admisión raíz como contrato separado. Análisis estático únicamente: no se ejecutaron tests/CI ni se modificó runtime/tests/workflows. D0/D1/D2/D3 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.


### Revalidación exacta de callers del wrapper Continuity — 2026-10-23

Se actualizó el ledger D1 tras consultar de nuevo el árbol exacto de ncs-clean-architecture (`fc546b0e998abcecafb44ead2b2ae9dd1222d539`, `truncated=false`, 2.982 entradas). El scan de `scripts/nexo-continuity.mjs` confirma dos callers de producción en el repositorio: `scripts/assistants.mjs` y `scripts/simulate.mjs`. La ruta de Chronicle es independiente: `scripts/nexo.mjs` lanza el hijo ejecutable `scripts/nexo-chronicle-session.mjs`; el hijo llama a la API pública de append; `chronicle-append.mjs` crea ambas factories path-based; `continuity-queries.mjs` accede directamente a Continuity.

Documento actualizado: `NEXO_NCS/BUILD/NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md`, commit `6512851d57f785c3e056e6c7774d4c4e22eb244d`, blob `93020e104345a9794ab5d70ade09323622b85371`. Handoff actualizado: `NEXO_NCS/BUILD/NCS_MASTER_HANDOFF_NEXT_CHAT_2026-10-23_OPEN_LOOPS.md`, commit `edc0021ca754453bb67db9502238ba7053821308`, blob `d788d7d88fbe556313d0f5bd5fe2050e112f3411`.

Este scan cierra únicamente la pregunta estrecha de imports actuales del wrapper dentro de los archivos de producción inspeccionados. No prueba ausencia de consumidores externos, carga dinámica/computada ni otros bypasses path-based. D1-DESIGN sigue OPEN; no se modificó runtime/tests/workflows y no se ejecutaron tests/CI. Estado canónico: M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.

### Paquete de decisión del propietario D0/D1 — 2026-10-23

Nuevo documento: `NEXO_NCS/BUILD/NCS_M0_OWNER_DECISION_PACKET_D0_D1_SEQUENCE_2026-10-23.md`.
Commit de creación: `5f9aa9e75864145b13bafdc271131662fadfa7b6`.
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OWNER_DECISION_PACKET_D0_D1_SEQUENCE_2026-10-23.md

Consolida, sin convertirlas en decisiones aprobadas, las cuatro subdecisiones D0 (interfaz/root, bootstrap, alias/symlinks, legacy/migración), la recomendación D1-S0 de separar diseño e implementación, y disposiciones propuestas para CLI, hijo Chronicle, queries, factories, assistants, simulate y repair. Distingue hechos de fuente, recomendación, riesgo y evidencia de cierre.

El paquete es documental. Runtime/tests/workflows sin cambios; tests/CI no ejecutados. M0 INCOMPLETO; D0/D1/D2/D3 OPEN; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP. La instrucción general de continuar no se interpreta como aprobación de las decisiones de diseño.

### Reconciliación contractual D2/D3 — 2026-10-23

Nuevo documento: `NEXO_NCS/BUILD/NCS_M0_D2_D3_CONTRACT_GAP_RECONCILIATION_2026-10-23.md`.
Commit de creación: `9b483a083c2c2b0bfd645caf9e5e77d3572826ef`.
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D2_D3_CONTRACT_GAP_RECONCILIATION_2026-10-23.md

El análisis separa cinco temas D2: alcance de snapshots, exclusiones constitucionales, ownership de admisión del hijo Chronicle, lock raíz independiente vs primitiva compartida, y stale/timeout/release incierto. Para D3 concreta inventario por instalación, dry-run, copia/verificación, cutover explícito, rollback cuando el destino ya recibió escrituras y política de symlinks en stores internos.

Se mantiene la distinción: admisión no es autoridad; lock no es cuota de heap/disco; PID no es identidad criptográfica; rollback no puede copiar hacia atrás ni fusionar automáticamente datos posteriores al cutover. D2/D3 OPEN; D0/D1 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos STOP. Documento solo analítico: runtime/tests/workflows sin cambios; tests/CI no ejecutados.

### Cross-check contractual D0/D1/D2/D3 — 2026-10-23

Nuevo documento: `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md`.
Commit de creación: `8eb093131b8e4395cae95303e519691463fef31f`.
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md

El cross-check no encontró contradicciones inevitables entre las propuestas escritas, pero sí añadió un hueco concreto en D3: los writers legacy actuales no adquieren el nuevo lock de instancia. La copia puede quedar obsoleta si siguen escribiendo durante migración. Propuesta (pendiente): quiescencia explícita de writers legacy, huellas de origen antes/después de copiar y abortar cutover si la fuente cambia. Si no se puede garantizar o detectar esa concurrencia, migración UNKNOWN/BLOCKED.

No es aprobación de la propuesta ni implementación. D0/D1/D2/D3 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP. Runtime/tests/workflows sin cambios; tests/CI no ejecutados.

### D3 plan ampliado: quiescencia de writers legacy — 2026-10-23

Se añadió la sección 9 a `NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md` para hacer explícito el riesgo de writers legacy concurrentes durante copia/migración.
Commit: `036c877e97475aa1489cc83d70f05c48e7fa8b9f`.
Blob: `bac9493af98c3f86001e323dab153bdee78b5f31`.
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md

Propuesta pendiente: quiescencia de writers legacy, huellas/hash antes de copiar, nueva comparación antes de cutover, cancelación si el origen cambia, preservación del origen y rollback sin copiar hacia atrás/merge automático. Si la concurrencia no puede garantizarse o detectarse, migración UNKNOWN/BLOCKED. No se implementó nada.

D0/D1/D2/D3 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP. Runtime/tests/workflows sin cambios; tests/CI no ejecutados.

### Revisión cruzada D3 actualizada — 2026-10-23

Se actualizó `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md` para reflejar el estado real: la sección 9 del contrato de raíz ya documenta quiescencia de writers legacy, hashes/tamaños/revisiones antes y después de la copia, cancelación si cambia el origen, cutover explícito y rollback sin copia inversa ni merge automático.

Checkpoint actualizado en commit `7a704c1832506c2164f6332a63f00382d8a07597`, blob `46baf1e58b4d87554a739eb69f26bd670f8a4028`.

Esto corrige la instrucción anterior que decía que todavía faltaba incorporar esa condición al contrato. El riesgo ya está tratado documentalmente, pero no cerrado como gate: la propuesta sigue sin aprobación, no existe evidencia de procedimiento operacional ejecutado y la quiescencia solo controla procesos cooperantes. Siguiente tarea: precisar qué evidencia operacional permitiría declarar que no quedan writers legacy activos y cómo se cancela de forma fail-closed si no puede demostrarse.

Estado sin cambios: D0/D1/D2/D3 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP. Runtime/tests/workflows sin cambios; tests/CI no ejecutados.

### D3 — protocolo propuesto de evidencia de quiescencia legacy — 2026-10-23

Se creó `NEXO_NCS/BUILD/NCS_M0_D3_LEGACY_WRITER_QUIESCENCE_EVIDENCE_PROTOCOL_2026-10-23.md` (commit `2fdde9d9f7df9a25a9c6bdf01d1e3ad1d1cab1a9`). Define criterios propuestos para inventario de writers/launchers, suspensión de sesiones y relanzamientos, inspección de procesos, huellas de fuente antes/después, cancelación fail-closed y evidencia mínima. Explicita que una captura de procesos y hashes no eliminan por sí solas la carrera de relanzamiento: si no hay control verificable de nuevos lanzamientos, la migración permanece UNKNOWN/BLOCKED.

Se actualizó también el cross-contract checkpoint en commit `77891a5372ee59ddbeb4f58045c6a21e68e170be`, blob `bd055435e14ae16e38c635c39ee4ced792776b50`, para incorporar la propuesta y corregir el siguiente paso. La propuesta no está aprobada ni ejecutada; no se ha elegido mecanismo para una instalación real.

Estado canónico sin cambios: D0/D1/D2/D3 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP. Runtime/tests/workflows sin cambios; tests/CI no ejecutados.

### D3 — perfil del entorno requerido — 2026-10-23

Documento nuevo: `NEXO_NCS/BUILD/NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md` (commit `f4c65b81abc19244eb777d821c7945ced45ee21e`). Enumera los datos mínimos para elegir un mecanismo real: sistema y forma de despliegue, autoridad para detener writers y bloquear relanzamientos, inventario de launchers, alcance físico de rutas, ventana/recuperación y trazabilidad. No presupone sistema operativo ni supervisor.

Cross-contract checkpoint actualizado en commit `c2bdf8c047c8824116d3faafef2f14687308ca21`, blob `65dc79f8fd40d6183d4975578a9508ad51125352`. El entorno objetivo sigue sin determinarse; no hay procedimiento operacional ejecutado ni evidencia de migración.

Estado canónico: D0/D1/D2/D3 OPEN; M0 INCOMPLETO; autorización NOT_EVALUATED; raíz legítima PENDING/UNKNOWN; efectos STOP. Runtime/tests/workflows sin cambios; tests/CI no ejecutados.

## Actualización de continuidad — paquete de decisiones del propietario (2026-10-25)

- Handoff más reciente verificado: [NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md](BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md), commit `e474f01e6e245371ddddb6de93b166bde146ff8d`, blob `1a00aa3f12bbbb6fd051179795a4a6e31160e5e6`.
- Paquete compacto de decisiones P-01…P-05: [NCS_M0_OWNER_DECISION_PACKET_P01_P02_P03_P04_P05_2026-10-25.md](BUILD/NCS_M0_OWNER_DECISION_PACKET_P01_P02_P03_P04_P05_2026-10-25.md), commit `8bf65b568b88ca805c1592ae9490bb3adff0f624`, blob verificado `ebbc087da258e3c3cf36192ae876ff3876e873d8`.
- Documentos complementarios recientes que quedan en BUILD y no deben duplicarse: [grafo de dependencias D2](BUILD/NCS_M0_D2_CLOSURE_DEPENDENCY_GRAPH_2026-10-25.md), [matriz de evidencia de aceptación M0](BUILD/NCS_M0_ACCEPTANCE_CRITERIA_EVIDENCE_STATUS_2026-10-25.md), [especificación P-03/P-04](BUILD/NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md), [especificación P-05](BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md) y [matriz de opciones de bootstrap](BUILD/NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md).
- Próximo trabajo: seguir el paquete de decisiones; primero P-01 (capacidad real de exigir bootstrap manual/offline y demostrar quiescencia), sin inferir respuesta. Si el entorno o la quiescencia son desconocidos, mantener `UNKNOWN/BLOCKED`; no elegir B/C/D por descarte. Después resolver P-02→P-03→P-04→P-05 según dependencias.
- No repetir el barrido de 188 archivos ni auditorías generales. No implementar ni ejecutar tests/CI sin autorización explícita separada.
- Estado canónico sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Solo documentación; no runtime/tests/workflows ni pruebas/CI.


### Propuesta de alcance de pruebas controladas — 2026-10-25 (NO RATIFICADA)

Se añadió `BUILD/NCS_M0_OWNER_DECISION_PROPOSAL_CONTROLLED_TEST_SCOPE_2026-10-25.md`, commit `278db1e6e7bd789d59c7e5facf8ab82929f73977`. Recomendación de ChatGPT: separar la validación de desarrollo de M0 del despliegue inicial en POCO, sin rebajar el contrato de raíz ni interpretar pruebas locales como evidencia del dispositivo. Es propuesta no vinculante, no directiva del propietario y no cambia el estado canónico.

No se eligió A/B/C/D ni se autorizó implementación o ejecución. Gates sin cambio: M0 `INCOMPLETO`; diseño `OPEN`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Sin cambios de runtime/tests/CI/dispositivo; tests/CI no ejecutados.


### Ratificación del propietario — validación controlada, solo diseño documental (2026-10-25)

El propietario ratificó explícitamente: “Ratifico el alcance de validación controlada solo para diseño documental. No autorizo todavía ejecución de tests/CI, cambios de runtime, instalación ni modificaciones del dispositivo.”

Directiva canónica: [NCS_M0_OWNER_RATIFICATION_CONTROLLED_VALIDATION_DOCUMENTARY_ONLY_2026-10-25.md](BUILD/NCS_M0_OWNER_RATIFICATION_CONTROLLED_VALIDATION_DOCUMENTARY_ONLY_2026-10-25.md), commit inicial `880934725edc14dfc15d4e5c84615b2920f7a818`.

**Efecto preciso:** queda autorizada la elaboración/revisión de documentación para perfilar un entorno de validación controlada separado del POCO/producción y una matriz de claims, precondiciones, evidencia y límites. La propuesta previa de ChatGPT ya no está “sin ratificar” en lo relativo a este alcance documental; sigue sin autorizar ejecución o implementación.

**No autorizado:** ejecutar tests o CI; cambiar runtime, tests, workflows o configuración ejecutable; instalar software; modificar POCO/Android/OS/bootloader/dispositivo; usar claves raíz reales, datos o stores productivas; ejecutar efectos protegidos. Cualquier permiso de ese tipo requiere una autorización nueva, específica y explícita.

No se selecciona ninguna opción de bootstrap: A = offline bootstrap + external quiescence; B = staging directory + atomic publication; C = persistent initialization marker; D = external coordination outside root. No inferir selección por descarte.

**Gates permanecen intactos:** M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; `ROOT_READY` no habilitado. Tests/CI no ejecutados; runtime/dispositivo sin cambios.

**Continuidad para Gemini:** leer primero STATUS, después `AI_TEAM_PROTOCOL_AND_ACTIVE_TASK.md`, la directiva ratificada y los artefactos BUILD ya existentes. Producir solo el perfil documental y la matriz claim/evidencia; reutilizar investigaciones previas y no repetir auditorías cerradas. Registrar incógnitas como `UNKNOWN/BLOCKED`, no crear mecanismos ni elegir A/B/C/D por inferencia. Cualquier futura ejecución/implementación requiere autorización separada.
