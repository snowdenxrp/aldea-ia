## DELTA — CRITERIO NEGATIVO DE ACEPTACIÓN NO-CONTINUATION (2026-10-29; DOCUMENTAL, NO EJECUTADO)

**Propósito:** convertir la brecha estática FB-01/FB-02 en una condición falsable para una futura verificación, sin cambiar código ni cerrar gates.

### NC-01 — Bootstrap dedicado no continúa hacia operación

La futura aceptación requiere evidencia ligada al SHA evaluado de que, al invocar la operación dedicada de bootstrap:

1. La operación crea o detecta el estado inicial exclusivamente conforme al contrato M0 autorizado y no acepta ni proyecta `legacyMemory`.
2. El resultado no expone un `owner` operacional ni una capacidad equivalente para admitir misiones, ejecutar pasos, preparar/dispatch efectos o persistir estado operacional.
3. La invocación termina tras el resultado de bootstrap; no inicializa Chronicle, no admite misión y no ejecuta una segunda operación en el mismo flujo.
4. Un fallo, conflicto, estado previo inesperado o resultado ambiguo no se transforma en continuación automática, reintento de escritura ni readmisión.
5. Ningún entrypoint público/CLI puede usar la ruta general de inicialización para obtener el mismo efecto compuesto. En particular, la ruta estática existente `chronicle-append --initialize-continuity` debe quedar bloqueada, separada o demostrablemente fuera del alcance operacional autorizado antes de poder afirmar no-bypass. No basta con exportar la API dedicada ni con probarla aisladamente.
6. La migración legacy existente se mantiene sin modificación en este alcance y no se presenta como bootstrap M0.

### NC-02 — Evidencia de cierre exigible

Para marcar NC-01 como aceptado en el futuro se requiere, de forma acumulativa:
- contrato de alcance y frontera revisado;
- pruebas negativas que demuestren ausencia de `owner`, ausencia de admisión/dispatch y ausencia de continuación en la invocación compuesta;
- prueba/inspección del grafo de entrypoints que cubra el bypass conocido y los callers en alcance;
- revisión estática del diff y de las referencias de llamada;
- resultado de pruebas y CI vinculado al mismo SHA que contiene código y pruebas, solo tras autorización específica de ejecución;
- registro explícito de limitaciones que no se hayan demostrado, especialmente exclusión sostenida de escritores/launchers y estado del entorno real.

**Regla de fallo:** cualquier ruta que inicialice Continuity y después admita, ejecute, despache o persista operación en la misma invocación, o cualquier camino no evaluado que pueda eludir la frontera, produce `FAIL/UNKNOWN` y mantiene FB-01/FB-02 abiertos. No inferir PASS de documentación, de una prueba unitaria aislada, de CI histórico ni de la mera presencia de la API dedicada.

**Estado actual:** criterio DOCUMENTADO; NO IMPLEMENTADO como prueba; NO EJECUTADO; NO AUTORIZADO para cambiar runtime/tests/CI. La brecha estática conocida sigue presente en la documentación actual. FB-01/FB-02 OPEN/UNKNOWN; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos STOP; **M0 INCOMPLETO**.

**Siguiente paso después de este delta:** no repetir el mapa estático. Esperar autorización separada para cambiar código/tests y ejecutar verificación, o avanzar únicamente con evidencia documental específica de E2/E3 del entorno POCO/Android. No elegir aislamiento ni conectar el bootstrap a un launcher por inferencia.

---

## DELTA — MAPA ESTÁTICO DE LLAMADAS Y BRECHA NO-BYPASS FB-01/FB-02 (2026-10-29)

Alcance: lectura estática de los archivos actuales en la rama `ncs-clean-architecture`. No se ejecutaron pruebas, CI/Actions, runtime, bootstrap ni efectos protegidos. Esta delta no cambia ningún gate.

### Mapa de llamadas observado

1. **API dedicada propuesta, sin caller operacional conocido**
   - `src/nexo/core/continuity-service.mjs` exporta `bootstrapNexoContinuityStore({ root, relativePath, lockDeadline?, lockWaitMs? })`.
   - Deriva `filePath` desde raíz absoluta + ruta relativa, rechaza opciones extra (incluido `legacyMemory`), inspecciona el padre/temporales conocidos y llama `store.initialize(emptySnapshot())`.
   - Devuelve resultado + destino; no llama a `openNexoContinuityOwner`, no construye owner y termina ahí.
   - `scripts/nexo-continuity.mjs` solo reexporta ambas APIs. La búsqueda estática en los entrypoints examinados no encontró una llamada a `bootstrapNexoContinuityStore`; exportar no equivale a usar ni a imponerla como frontera.

2. **Ruta Chronicle compuesta: bypass confirmado respecto de la frontera dedicada**
   - `scripts/nexo.mjs` acepta `chronicle-append` y deriva el proceso a `scripts/nexo-chronicle-session.mjs`.
   - `scripts/nexo-chronicle-session.mjs` acepta `--initialize-continuity` y pasa la opción a `runNexoChronicleAppend`.
   - `src/nexo/application/chronicle-append.mjs::runNexoChronicleAppend` preflight-ea los stores; si Continuity falta y `initializeContinuity` es true, llama a `openNexoContinuityOwner({ filePath: continuityPath, allowEmptyInitialization: initializeContinuity, ... })`. Después puede inicializar Chronicle, registrar/admitir misión mediante `opened.owner.recordMission`, ejecutar el paso owner-backed y persistir/reconciliar el resultado dentro de la misma invocación.
   - Por tanto, el CLI histórico `nexo chronicle-append --initialize-continuity` no pasa por la API dedicada y no se detiene en una frontera de bootstrap aislada. El test estático `tests/nexo/entrypoint.test.mjs` contiene un caso que combina `--initialize-continuity` y `--initialize-chronicle` con ejecución/dispatch; **el test no se ejecutó en esta tarea**.
   - Esto es una brecha de arquitectura/no-bypass demostrada por el grafo estático, no prueba de que el comando se haya ejecutado en el dispositivo. No conectar la nueva API a esta ruta ni modificar el CLI sin autorización separada.

3. **Callers legacy/simulación que deben conservarse, pero no pueden considerarse frontera M0**
   - `scripts/assistants.mjs` importa `openNexoContinuityOwner`, pasa `persisted.nexoMemory` como `legacyMemory` y obtiene un owner; después persiste memoria/estado y puede entrar a `runNexoRuntimeRepairSession`.
   - `scripts/simulate.mjs` importa la misma API, pasa `state.nexoMemory` como `legacyMemory` y continúa la simulación/guardado de estado.
   - Estos callers confirman que la API general legacy sigue accesible desde rutas que no son bootstrap M0 aislado. Su comportamiento de migración no se cambia en este alcance. No usar Lúmina/simulación/assistants como launcher de Nexo M0.

4. **Entrypoints de lectura**
   - `scripts/nexo.mjs` expone comandos de estado/consulta con ruta `--continuity`; las consultas de `src/nexo/application/continuity-queries.mjs` se describen como read-only. Esto no hace que las rutas de escritura anteriores sean no-bypass.

### Conclusión de frontera

- **Implementado (estático):** API dedicada de bootstrap; rechaza `legacyMemory`, deriva y devuelve la relación root→destino, no devuelve owner y se detiene tras la llamada de inicialización.
- **Inspeccionado estáticamente:** el export no tiene caller en los entrypoints examinados; la ruta Chronicle compuesta puede inicializar por la API general y continuar a owner/admisión/dispatch; assistants/simulate mantienen rutas legacy.
- **Probado:** no se ejecutaron pruebas en esta tarea; no se afirma PASS.
- **Autorizado:** el cambio dedicado FB-01 fue autorizado en el alcance descrito por el handoff; esta revisión no autoriza conectar el bootstrap, cambiar callers legacy, ejecutar pruebas/CI, crear Continuity real ni activar efectos protegidos.

**Resultado:** no-bypass end-to-end **NO DEMOSTRADO; existe una ruta estática de bypass**. FB-01 y FB-02 siguen OPEN/UNKNOWN; FB-03/FB-04 OPEN/UNKNOWN; FB-05/P-05 NO RATIFICADA; FB-06/FB-07 OPEN; P01-B=C; D0–D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA fuera del alcance limitado; raíz PENDING/UNKNOWN; E2/E3 UNKNOWN; E4 NOT READY; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos STOP; M0 INCOMPLETO.

Siguiente acción permitida: conservar esta brecha en la trazabilidad y preparar el criterio negativo de aceptación para una futura prueba de no-continuación, sin escribir ni ejecutar esa prueba hasta autorización separada. No alterar migración legacy, no conectar la API dedicada a CLI/launcher, no seleccionar mecanismo de aislamiento ni repetir el censo del POCO.

---

## DELTA — FB-01: ESTADO TEMPORAL PREEXISTENTE BLOQUEA BOOTSTRAP (2026-10-29)

Se endureció la API candidata tras detectar que la ruta general `store.initialize` limpia archivos temporales obsoletos. Para que el bootstrap M0 no borre ese estado previo conocido, `bootstrapNexoContinuityStore` ahora inspecciona el directorio padre y devuelve STOP/UNKNOWN si no puede leerlo o encuentra `<destino>.tmp` / `<destino>.tmp-*`. Cambios verificados por lectura de GitHub: servicio blob `86b33409ca7150e45846c7c97a2d4b28780121e7`; prueba blob `6f5e706ccb6c242cc32ebc77a11dab011f217b22`. Se añadió una prueba que exige preservar el archivo temporal preexistente. La prueba no se ejecutó.

Límite importante: esta comprobación previa no elimina la carrera frente a escritores no cooperativos que creen/modifiquen temporales después de la inspección; tampoco demuestra exclusión sostenida ni resuelve TOCTOU del store. Por eso el API sigue siendo una implementación candidata no apta para publicación operativa mientras FB-03/FB-04 y la evidencia del entorno continúen abiertos. No se eligió una primitiva de publicación alternativa por inferencia.

Gates sin cambio: FB-01 OPEN/UNKNOWN (código candidato, no PASS); FB-02/P01-B=C; FB-03 OPEN/UNKNOWN; FB-04 OPEN/UNKNOWN; FB-05/P-05 NO RATIFICADA; FB-06/FB-07 OPEN; M0 INCOMPLETO; D0–D3 OPEN; primera creación operativa y efectos protegidos STOP. Sin ejecución de tests, CI/Actions ni bootstrap operativo.

---

## DELTA — IMPLEMENTACIÓN AISLADA PROPUESTA PARA FB-01 (2026-10-29)

Tras autorización explícita del propietario, se añadió una API dedicada de primera publicación, sin ejecutar pruebas ni bootstrap operativo:

- `src/nexo/core/continuity-service.mjs`, blob `ded252fadff00a04e95e452a80a2c62d902c184b`: `bootstrapNexoContinuityStore({ root, relativePath, lockDeadline?, lockWaitMs? })`. Exige raíz absoluta existente y directorio, deriva `filePath` de raíz + ruta relativa normalizada, rechaza escapes/argumentos desconocidos (incluido `legacyMemory`), solicita únicamente el snapshot vacío v1 al store y devuelve el resultado explícito junto con la relación raíz/destino. No carga memoria legacy, no llama a `openNexoContinuityOwner`, no devuelve `owner` y se detiene tras la publicación/conflicto/fallo.
- `scripts/nexo-continuity.mjs`, blob `ecd4bfb999ed67f88229d40e009daaa3d1b61380`: reexporta la API dedicada; no se conectó a un launcher/CLI ni se realizó una publicación real.
- `tests/nexo/continuity-contract.test.mjs`, blob `d358dd32cf36033225c771121ee5ccd23c615c52`: se añadieron pruebas para destino derivado, snapshot vacío exacto, ausencia de `owner`, conflicto sin sobrescritura, rechazo de ruta fuera de raíz, rechazo de `legacyMemory` y raíz relativa. El test de migración legacy existente se conservó sin alteración.

**Estado de verificación:** los cambios se guardaron en la rama y se inspeccionó su contenido desde GitHub; las pruebas añadidas NO se ejecutaron. No se ejecutó CI/Actions ni se usó el bootstrap contra un destino operativo. Esta API no demuestra por sí sola legitimidad de la raíz, exclusión sostenida de escritores, resistencia a symlinks/path attacks, quiescencia, ni no-bypass de todos los callers. No autoriza primera creación real, readmisión ni efectos protegidos.

**Resultado de FB-01:** avance de implementación candidata, todavía **OPEN / UNKNOWN**, no PASS. La API exige raíz explícita y liga el destino sintácticamente; la autoridad de esa raíz y la aplicabilidad de la regla al objeto concreto siguen pendientes. FB-02/P01-B=C, FB-03, FB-04, FB-05/P-05 y FB-06/FB-07 no cambian. M0 sigue INCOMPLETO; D0–D3 OPEN; D1-IMPLEMENTATION continúa NO AUTORIZADA para cualquier trabajo fuera de este alcance limitado; `authorization: NOT_EVALUATED`; primera creación operativa y efectos protegidos STOP.

---

## DELTA — EVIDENCIA ESTÁTICA ACTUAL DEL BLOQUEO FB-01 (2026-10-29)

Se contrastó el contrato candidato con las versiones actuales de servicio, test y workflow en la rama `ncs-clean-architecture`. Esto no es una auditoría general nueva: precisa el punto exacto que impide pasar de diseño a implementación/verificación.

| Evidencia actual | Hecho comprobado por lectura estática | Qué demuestra y qué no |
|---|---|---|
| `src/nexo/core/continuity-service.mjs`, blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`, función `openNexoContinuityOwner` | Tras `NEXO_CONTINUITY_STORE_NOT_FOUND`, la rama `legacyMemory` se evalúa antes de `allowEmptyInitialization`; después de `store.initialize` el servicio carga el estado y devuelve `store`, `owner` y `current`. | Confirma la brecha entre el alcance M0 propuesto y la API existente. No demuestra que un caller concreto esté autorizado ni que la frontera de bootstrap esté aislada. |
| `tests/nexo/continuity-contract.test.mjs`, blob `dc202cabdc1c3dcada4f10c3c323c84b60eb1f35`, bloque de migración cerca de líneas 1083–1110 | El test llama a `openNexoContinuityOwner` con `legacyMemory`, espera que la misión se proyecte y luego comprueba que el store ya creado sea canónico. También prueba que sin store ni legacy se rechace la inicialización silenciosa. | Hay cobertura del comportamiento de migración existente y del rechazo por estado inicial desconocido. No hay en ese bloque prueba de que una ruta dedicada de bootstrap M0 excluya `legacyMemory` ni prueba de no-continuación end-to-end. No se debe borrar ni reescribir ese test por inferencia: cualquier separación de migración exige cambio de contrato y autorización propia. |
| `scripts/nexo-chronicle-session.mjs`, blob `30a53de2f108aa255a1dfd61ce78c19788de160b` | El parser acepta `--initialize-continuity` y la sesión entrega los argumentos a `runNexoChronicleAppend`. | La ruta existente es una sesión Chronicle, no una operación de propósito único demostrada como bootstrap aislado. |
| `.github/workflows/nexo-m0-acceptance.yml`, blob `60323063fe6656eb7e7710825f327fa7e39526c3` | El workflow define triggers de push con filtros de paths y `workflow_dispatch`, y enumera los tests de aceptación. | Es configuración versionada; esta lectura no prueba ejecución, estado activo en otro contexto ni PASS para el SHA actual. No se lanzó el workflow. |

### Decisión técnica de trabajo

El próximo cambio ejecutable que eventualmente podría cerrar parte de FB-01 no es otro ajuste de texto: requiere una operación de bootstrap de propósito único cuyo contrato y API no acepten la ruta de proyección legacy, que no devuelva un owner operacional y que demuestre el vínculo raíz explícita→destino efectivo. Debe tratarse como una propuesta de cambio aún no autorizada; no editar el runtime ni los tests en esta ronda.

Para que ese cambio no se confunda con cierre M0, el criterio de salida posterior debe exigir: revisión del contrato/D0-D1; pruebas negativas de legacy, estado previo y no-continuación; comprobación de no-bypass para los entrypoints en alcance; y CI ligado al SHA que contenga implementación y tests. La evidencia histórica o el workflow definido no sustituye esos resultados.

**Gates sin cambio:** FB-01 OPEN/UNKNOWN; FB-02 OPEN con P01-B=C; FB-03 OPEN/UNKNOWN; FB-04 OPEN/UNKNOWN; FB-05 P-05 NO RATIFICADA; FB-06/FB-07 OPEN; M0 INCOMPLETO; D0–D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; raíz PENDING/UNKNOWN; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos STOP. Solo lectura estática y documentación; no se ejecutaron tests/CI/Actions/runtime/bootstrap ni se modificó el dispositivo.

---

## DELTA — DESCOMPOSICIÓN DE BLOQUEOS M0 POR TIPO DE CIERRE (2026-10-29)

Esta delta ordena el trabajo pendiente usando los contratos y evidencias ya registrados; no crea una segunda línea de meta ni cambia decisiones previas.

| Bloque | Qué puede avanzar sin ejecución | Qué no puede declararse resuelto por documentación sola | Estado operativo correcto |
|---|---|---|---|
| FB-01 / P01-A / P01-G | Mantener la clasificación U; enlazar la regla limitada aprobada con sus límites y con el contrato del objeto. | Clasificar el objeto como L o C, legitimar un destino concreto o probar que la invocación/caller satisface la regla de autoridad sin evidencia/decisión aplicable. | OPEN / UNKNOWN; no primera creación. |
| FB-02 / P01-B | Mantener la decisión C y fijar criterios de evaluación end-to-end sin elegir un mecanismo. | Seleccionar una opción de aislamiento, afirmar no-continuación o tratar un caller compuesto como bootstrap aislado sin decisión y evidencia exactas. | OPEN; C vigente. |
| FB-03 / P01-C/D / E2/E3 | Usar RE-01…RE-09 como lista de evaluación, sin repetir el censo general del dispositivo. | Declarar escritores excluidos o entorno satisfecho antes de identificar y evaluar un entorno, launcher, destino y ventana concretos. | OPEN / UNKNOWN; entorno no demostrado. |
| FB-04 / P01-E/F | Conservar los casos de estado previo y resultado ambiguo como requisitos STOP, sin inventar un protocolo. | Afirmar garantías de publicación/no-sobrescritura o recuperación que no estén ratificadas y verificadas. | OPEN / UNKNOWN. |
| FB-05 / P-05 / D2 | Mantener bloqueo explícito y documentar la dependencia con los demás gates. | Elegir política de recuperación/readmisión en nombre del propietario o convertir una propuesta en política aprobada. | P-05 NO RATIFICADA. |
| FB-06 / FB-07 | Reconciliar únicamente las brechas residuales contra la línea de meta y preparar la trazabilidad del SHA objetivo. | Declarar M0_BUILD_COMPLETE con gates críticos UNKNOWN, o trasladar CI histórico/estático a un SHA de cierre no evaluado. | OPEN; NOT VERIFIED. |

### Orden de trabajo que se desprende

1. No ampliar más el borrador de bootstrap salvo contradicción nueva. Su frontera candidata y RE-01…RE-09 ya están documentadas.
2. Para FB-01, conservar U/UNKNOWN hasta que exista base legítima y destino efectivo identificable; la aprobación limitada no es autorización de escritura ni prueba de aplicabilidad.
3. Para FB-02/FB-03, no elegir aislamiento por inferencia: falta el entorno concreto y la decisión P01-B continúa en C.
4. Mantener FB-04/FB-05 bloqueados sin una política explícita y evidencia correspondiente.
5. Solo después de resolver esos bloqueos, reconciliar FB-06 y planificar FB-07 con autorización separada para pruebas/CI sobre SHA exacto.

**Gates preservados:** M0 INCOMPLETO; FB-01…FB-07 abiertos según sus estados específicos; P01-B=C; P-05 NO RATIFICADA; D0–D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; raíz PENDING/UNKNOWN; E2/E3 UNKNOWN; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos STOP. Esta delta es documental; no cambia código/runtime, tests, CI/Actions, bootstrap ni dispositivo.

---

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

