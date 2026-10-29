# NCS — HANDOFF DE CONTINUIDAD M0 — FB-01 BOOTSTRAP DEDICADO
Fecha de corte: 2026-10-29
Repositorio: `snowdenxrp/aldea-ia`
Rama de trabajo: `ncs-clean-architecture`
Estado global: **M0 INCOMPLETO**.

## 0. Instrucción de entrada para el siguiente chat

La palabra clave de continuidad es exactamente **NCS**.

Ruta obligatoria de lectura, en este orden:
1. `NEXO_NCS/STATUS.md` — fuente canónica de estado y deltas más recientes.
2. `NEXO_NCS/MASTER/CORE` — Constitución, límites y arquitectura base (localizar el archivo exacto desde las referencias del STATUS; no inventar nombres).
3. `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_TRACEABILITY_2026-10-28.md` — criterios y trazabilidad FB.
4. Este handoff.
5. Solo después, continuar con el punto de trabajo señalado abajo.

**No reiniciar auditorías ni repetir investigación ya cerrada** sobre el contrato de Continuity, las ramas legacy, las rutas de simulación, los workflows ni la semántica de persistencia aquí descritos. Reabrir un tema solo si aparece evidencia nueva y concreta que contradiga estos datos. No asumir que una lectura estática equivale a ejecución.

## 1. Autorización exacta concedida por el propietario

El usuario autorizó modificar runtime y añadir pruebas para resolver FB-01 con estos límites:
- crear una operación dedicada de bootstrap M0 que no acepte la ruta de migración `legacyMemory`;
- conservar intacto el comportamiento de migración legacy existente;
- no devolver un `owner` operacional desde la operación de bootstrap;
- exigir y verificar vínculo entre raíz explícita y destino efectivo.

La autorización **NO** incluye ejecutar pruebas, CI/Actions, bootstrap real, publicación de la primera Continuity operativa, commissioning ni efectos protegidos. Tampoco autoriza elegir una tecnología o mecanismo para el entorno restringido. No se ha ejecutado ninguna prueba ni bootstrap real después de estos cambios.

## 2. Cambios ya hechos en la rama

### Runtime
Archivo: `src/nexo/core/continuity-service.mjs`
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/continuity-service.mjs
Blob observado: `86b33409ca7150e45846c7c97a2d4b28780121e7`

Exporta `bootstrapNexoContinuityStore({ root, relativePath, lockDeadline?, lockWaitMs? })`:
- acepta solo las opciones enumeradas; rechaza claves extra, incluida `legacyMemory`;
- exige raíz absoluta; rechaza NUL; exige ruta relativa normalizada sin escape del root;
- deriva el destino efectivo desde `root + relativePath`;
- comprueba que la raíz existe y es directorio;
- inspecciona el directorio padre antes de invocar el inicializador general;
- si no puede leer el padre, falla con `NEXO_CONTINUITY_BOOTSTRAP_PARENT_STATE_UNKNOWN`;
- si encuentra temporal preexistente del destino (`<base>.tmp` o prefijo `<base>.tmp-`), falla con `NEXO_CONTINUITY_BOOTSTRAP_TEMPORARY_STATE_UNKNOWN` en vez de permitir que el inicializador general limpie/reutilice ese estado;
- inicializa un snapshot vacío v1 mediante `createNexoContinuityStore(...).initialize(emptySnapshot())`;
- devuelve el resultado y el destino derivado congelado `{ root, relativePath, filePath }`;
- no lee legacy memory, no llama a `openNexoContinuityOwner`, no devuelve `owner`, y no se conectó a CLI/launcher.

**Limitación crítica:** el preflight de temporales tiene una carrera TOCTOU entre inspección e inicialización. No prueba exclusión global frente a escritores no cooperativos, no resuelve ataques por enlaces simbólicos/path races, ni acredita autoridad/legitimidad de la raíz. Por ello FB-03/FB-04 siguen abiertos y esta API no está autorizada para bootstrap operativo.

### Re-export de compatibilidad
Archivo: `scripts/nexo-continuity.mjs`
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/scripts/nexo-continuity.mjs
Blob observado: `ecd4bfb999ed67f88229d40e009daaa3d1b61380`
Re-exporta `openNexoContinuityOwner` y `bootstrapNexoContinuityStore`. No conecta una ruta ejecutable ni hace bootstrap por sí solo.

### Pruebas añadidas, sin ejecutar
Archivo: `tests/nexo/continuity-contract.test.mjs`
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/continuity-contract.test.mjs
Blob observado: `6f5e706ccb6c242cc32ebc77a11dab011f217b22`
Bloque “Dedicated M0 bootstrap contract” incluye casos para:
- publicación vacía v1 en raíz temporal de test;
- destino efectivo derivado;
- ausencia de propiedad `owner`;
- snapshot vacío exacto;
- destino existente: conflicto y contenido conservado;
- temporal preexistente: error UNKNOWN y temporal conservado;
- rechazo de `../outside.json`;
- rechazo de opción `legacyMemory`;
- rechazo de root relativo.
Las pruebas existentes de migración legacy se dejaron en el archivo. **La presencia de pruebas no significa que pasaron**: no se ejecutaron.

### Trazabilidad y STATUS
Trazabilidad: `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_TRACEABILITY_2026-10-28.md`
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_TRACEABILITY_2026-10-28.md
Blob observado: `85d12c07128d81b7b8def68e0ec3d63459ab6843`
El delta FB-01 documenta el stop ante temporales preexistentes y advierte que la carrera TOCTOU impide cerrar FB-01/FB-03/FB-04.

STATUS: `NEXO_NCS/STATUS.md`
URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md
Blob observado: `6386b5d0d9046f1dcb9e0570779fbf200120c073`
Longitud observada al releer: 390,806 caracteres. Se añadió un delta al inicio sin sustituir el documento previo; se confirmó que los deltas anteriores y `M0 INCOMPLETO` permanecen.
Último commit de STATUS observado: `496fc3d6adc77e9b369112d477a8ee367faafde4`.
Último commit de trazabilidad observado: `5ccc4b84570bd7132504f657f09fdc2eae24a9fc`.

La comprobación posterior consistió en volver a leer estáticamente los cinco archivos desde GitHub y confirmar blobs/contenido. **No fue prueba de ejecución, test, CI ni seguridad operacional.**

## 3. Hallazgos previos que no se deben redescubrir sin evidencia contraria

### Contrato de Continuity
- Payload: `NEXO_OPERATIONAL_CONTINUITY`, schemaVersion 1, colecciones `missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`.
- Envelope del store separado: `NEXO_CONTINUITY_STORE`, schemaVersion 1, `storeRevision`, `snapshot`.
- `openNexoContinuityOwner` recibe `filePath` directamente; por sí solo no demuestra que venga de un `--root` explícito y validado.
- Si falta el store y `legacyMemory` no es null/undefined, el servicio proyecta legacy con `projectNexoContinuitySnapshot`. Esa rama tiene precedencia sobre `allowEmptyInitialization`.
- Por tanto, `allowEmptyInitialization: false` **no** bloquea toda inicialización: no impide la proyección legacy.
- Sin legacy, solo se crea snapshot vacío si `allowEmptyInitialization === true`; en otro caso se devuelve `NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN`.
- No cambiar la migración legacy existente como parte del bootstrap FB-01.

### Rutas existentes y separación
- Rutas ya identificadas como inadecuadas para bootstrap operativo: `npm run assistants`, `npm run simulate`, `nexo chronicle-append --initialize-continuity`.
- `assistants.mjs` y `simulate.mjs` usan `allowEmptyInitialization: !stateExists`, donde `stateExists` mira `world-state.json`; su ausencia puede habilitar inicialización vacía. La precedencia legacy descrita arriba sigue siendo relevante.
- El workflow `.github/workflows/lumina-simulation.yml` está definido con schedule de cinco minutos, `workflow_dispatch` y push a main. La definición estática no prueba que esté activo en la rama por defecto ni en un dispositivo.
- El usuario ha objetado mezclar Nexo operacional con Lúmina/simulación. Mantener esa separación; no hacer que `assistants.mjs`, `simulate.mjs` ni Lúmina sean el bootstrap de Nexo.

### Persistencia y concurrencia
- Store usa temporal + rename, lock cooperativo y `expectedRevision`; no hay fsync confirmado en el análisis previo.
- Si ocurre error al liberar el lock después del rename, puede aparecer `COMMIT.UNKNOWN`. Decisión aceptada: Option A — detener la ruta afectada, sin reintento automático ni efectos.
- UO-01–UO-10 ya están inventariados.
- La limpieza de temporales del inicializador general puede eliminar temporales preexistentes; el nuevo preflight intenta parar ante temporales observados, pero no cierra la carrera con escritores no cooperativos.
- Un lock cooperativo no equivale a exclusión universal. P01-C/D/E/F permanecen pendientes.

## 4. Estado de gates: conservar literalmente salvo evidencia nueva

- `M0 INCOMPLETO`.
- FB-01 OPEN/UNKNOWN (API añadida, sin ejecución; preflight no elimina la carrera).
- FB-02 OPEN; P01-B = `C — NO SELECCIONAR TODAVÍA`.
- FB-03 OPEN/UNKNOWN.
- FB-04 OPEN/UNKNOWN.
- FB-05/P-05 NO RATIFICADA.
- FB-06 y FB-07 OPEN.
- D0/D1/D2/D3 OPEN.
- D1-IMPLEMENTATION NO AUTORIZADA fuera de la modificación FB-01 expresamente limitada.
- Legitimidad de root = PENDING/UNKNOWN.
- `authorization: NOT_EVALUATED`.
- E2/E3 UNKNOWN; E4 NOT READY.
- Primera creación operativa de Continuity y efectos protegidos = STOP.
- No se ha seleccionado mecanismo concreto de entorno restringido. La decisión del propietario solo permite considerar una publicación futura bajo un entorno restringido con precondiciones explícitas y verificables; el entorno aún no está definido ni probado.
- `M0_BUILD_COMPLETE` es distinto de `PROTECTED_EFFECTS_AUTHORIZED`.

## 5. Criterios de evidencia ya definidos

La matriz P01 RE-01…RE-09 requiere, como mínimo:
- invocación/revisión/boundary trazables;
- vínculo verificable entre root explícito y ruta efectiva;
- escritores incluidos/excluidos identificados;
- evidencia sostenida de ausencia de escrituras;
- triggers/configuración documentados;
- distinguir ausencia real de errores/corrupción/estado desconocido;
- no overwrite ni retry ante conflicto o ambigüedad;
- detener antes de owner operacional, Chronicle, admission, PREPARED, dispatch, reconciliation o mutación;
- frescura y trazabilidad de la evidencia.

Categorías de bloqueo ya conocidas:
- FB-01/P01-A/G: autoridad/root desconocida.
- FB-02/P01-B: opción C, no seleccionar todavía.
- FB-03/P01-C/D/E2/E3: entorno concreto no evaluado con evidencia.
- FB-04/P01-E/F: garantías de publicación/no-overwrite/recuperación no probadas.
- FB-05/P-05/D2: política no ratificada.
- FB-06/07: no pueden cerrarse con UNKNOWN crítico ni con CI histórico/evidencia estática no vinculados al SHA final exacto.

CI histórico conocido (no usar como prueba de este cambio): run `40428998955` en `d566...`, y runs especializados `40443990734` / `40444024215` terminaron success en su contexto histórico. No se ejecutaron runs nuevos.

## 6. Próximo trabajo recomendado — empezar aquí, no volver al principio

Primera tarea recomendada: **lectura estática, acotada, del mapa de llamadas y de la frontera de no-bypass para la nueva API**:
1. Revisar los call sites existentes de `openNexoContinuityOwner`, los puntos de entrada de `assistants.mjs`, `simulate.mjs`, `scripts/nexo-chronicle-session.mjs` y el comando `nexo chronicle-append --initialize-continuity`.
2. Determinar, con rutas/funciones concretas, si hay una ruta que pueda crear/abrir Continuity y seguir a Chronicle/admission/owner operacional sin pasar por una frontera autorizada.
3. No modificar esas rutas todavía. No cambiar migración legacy ni conectar el nuevo bootstrap a CLI/launcher.
4. En paralelo o después, delimitar documentalmente qué evidencia exacta resolvería TOCTOU/escritores no cooperativos para FB-03/FB-04; no elegir ni implementar un primitive de filesystem, lock o launcher sin autoridad/evidencia.
5. Actualizar solo los documentos canónicos existentes con un delta pequeño si aparece un hallazgo real. STATUS: delta al inicio preservando el cuerpo; trazabilidad: delta al inicio/punto apropiado preservando el contenido.
6. Informar el resultado como STATIC/NOT EXECUTED si no se corrió nada.

No repetir el inventario general de Continuity ni reauditar legacy, workflow, envelope o persistencia sin contradicción nueva. No elegir P01-B, no avanzar a STEP 7/M1, no trabajar YubiKey.

## 7. Reglas operativas para el siguiente chat

- Antes de actuar, leer STATUS y trazabilidad actualizados; si el estado coincide con este handoff, continuar directamente con sección 6.
- No ejecutar pruebas, CI/Actions, bootstrap real ni efectos protegidos sin autorización expresa adicional.
- No afirmar que los tests pasan. No presentar evidencia estática como garantía de runtime.
- No inferir autoridad de la existencia de un archivo, root, lock, test o documento.
- No inventar IDs, colas, reintentos, tombstones, wrappers transaccionales ni un objeto monolítico `GenesisRoot`.
- No mezclar Nexo con Lúmina.
- La meta es cerrar M0 con una línea de meta finita y verificable, no perpetuar auditorías ni ampliar alcance.
