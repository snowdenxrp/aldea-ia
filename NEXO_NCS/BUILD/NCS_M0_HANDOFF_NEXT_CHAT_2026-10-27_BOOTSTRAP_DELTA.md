# HANDOFF CANÓNICO PARA EL SIGUIENTE CHAT — NCS M0 / BOOTSTRAP NO AUTORITATIVO
Fecha: 2026-10-27
Rama de trabajo conocida: `ncs-clean-architecture`
Repositorio: `snowdenxrp/aldea-ia`

## 0. Instrucción de entrada obligatoria
Al comenzar el siguiente chat, usar la palabra de continuidad exacta `NCS` y seguir este orden:
1. Leer `NEXO_NCS/STATUS.md` (puerta de entrada canónica; revisar su encabezado y actualizaciones recientes).
2. Leer `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-27_BOOTSTRAP_DELTA.md` (este handoff).
3. Leer `NEXO_NCS/BUILD/NCS_M0_PERPLEXITY_DELTA_REVIEW_2026-10-27.md`.
4. Consultar solo las secciones pertinentes de `NEXO_NCS/BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md` y `NEXO_NCS/BUILD/NCS_M0_BOOTSTRAP_NONAUTHORITATIVE_NEGATIVE_PROPERTIES_2026-10-27.md`.
5. Solo después, consultar MASTER/CORE y los contratos de decisión que resulten necesarios. No empezar por RESEARCH ni rehacer auditorías históricas.

Este documento es un checkpoint de continuidad, no una ratificación de diseño ni una prueba de ejecución.

## 1. Estado operativo y gates — NO ALTERAR POR INFERENCIA
- M0: `INCOMPLETO`.
- Autoridad/raíz constitucional legítima: `PENDING/UNKNOWN`.
- Autorización del camino inspeccionado: `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- Reconciliación general: no integrada.
- Opción A elegida por el propietario: estudiar/delimitar inicialización de almacenamiento local M0 estrictamente no autoritativo y acotado. Esto NO prueba que la implementación actual esté aislada ni acepta un contrato de implementación.
- Opción B de conversaciones previas se refiere a un eje distinto: separar el bootstrap explícito del commit condicional ordinario. No confundir Opción A de alcance con Opción B de persistencia.
- D3/STOP permanece vigente. Reparaciones excluidas de M0.
- No ejecutar código, tests, CI ni Actions; no cambiar runtime/tests/workflows/configuración ejecutable; no modificar dispositivo/Android/bootloader; no usar claves reales ni stores productivos sin autorización nueva, específica y explícita.
- Los documentos pueden cambiarse solo como trabajo documental dentro del alcance autorizado. Distinguir siempre “inspección estática” de “ejecución” y “propuesta” de “contrato aceptado”.

## 2. Qué se hizo en la sesión anterior
1. Se recibió y analizó un informe de Perplexity de 2026-10-27 que declara inspección estática de la rama en HEAD `e477bdefb4db82456997c106ce7ff65673e15f67`, sin ejecutar código, tests o CI.
2. Se contrastaron de forma puntual en GitHub los archivos de la rama relacionados con `scripts/assistants.mjs`, `src/nexo/core/continuity-service.mjs`, `.github/workflows/lumina-simulation.yml` y las rutas Chronicle/simulación.
3. Se hizo una lectura estática acotada de los archivos equivalentes en `main` para evaluar la afirmación del workflow. No se consultó el historial/logs de GitHub Actions.
4. Se creó el addendum documental `NEXO_NCS/BUILD/NCS_M0_PERPLEXITY_DELTA_REVIEW_2026-10-27.md`, commit conocido `c361694c28c7f108c054e09dad963eba5fc6e235`, blob `9a1fdb8b2f1fd2714c03be8ef35d5ac5447d531f`.
5. No se ejecutaron tests ni CI y no se modificó runtime, tests, workflow o configuración ejecutable.

## 3. Hallazgos estáticos importantes

### 3.1 Tercer llamador directo de continuidad
Perplexity identificó un tercer llamador directo, `scripts/assistants.mjs`, además de las rutas Chronicle y simulación ya conocidas:
- Llama a `openNexoContinuityOwner`.
- Pasa `legacyMemory: persisted.nexoMemory ?? null` y `allowEmptyInitialization: !stateExists`.
- En la misma invocación, el flujo continúa usando continuidad para `buildNexoMission`, registra una misión y persiste estado de Lúmina.
- El camino `--nexo-repair-once` alcanza la sesión de runtime que devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; eso es evidencia de bloqueo de esa ruta de producto, no de que todos los entrypoints de reparación estén inaccesibles.

Este hallazgo amplía el inventario anterior de dos llamadores. No demuestra que el inventario total esté completo.

### 3.2 La inicialización por legacyMemory no depende del flag de inicialización vacía
En `src/nexo/core/continuity-service.mjs`, si el store de continuidad no existe y `legacyMemory` es no nulo, el servicio proyecta esa memoria a un snapshot e intenta inicializarlo. La rama `allowEmptyInitialization` aplica cuando no hay `legacyMemory`. Por tanto, no es correcto describir toda inicialización como condicionada exclusivamente por `allowEmptyInitialization: true`.

La proyección copia cinco colecciones/áreas operativas, incluidas `effectJournal` y `doNotRepeat`. El archivo `world-state.json` versionado contiene `nexoMemory.nexo` con 50 misiones según la lectura de Perplexity. Esto es observación de archivos/datos versionados; no es prueba de ejecución de una inicialización limpia.

### 3.3 Los datos de continuidad tienen consumidores aguas abajo
Perplexity trazó el snapshot hacia `buildNexoMission` y `orchestrator.js`, donde `doNotRepeat` afecta la selección/bloqueo de pasos. Deben mapearse consumidores de todas las colecciones relevantes, no solo `effectJournal`: al menos `attempts`, `executions`, `doNotRepeat` y las otras colecciones copiadas.

### 3.4 Chronicle: bootstrap y mutación pueden ocurrir en la misma invocación
Ruta previamente inspeccionada:
- `scripts/nexo-chronicle-session.mjs` admite `--initialize-continuity`.
- `src/nexo/application/chronicle-append.mjs` puede inicializar continuidad y continuar con admisión de misión y `executeNexoStepWithContinuityOwner`.
- `src/nexo/core/owner-backed-runtime.mjs` persiste PREPARED y después llama a `adapter.executePrepared`.
- `src/nexo/adapters/chronicle-effect.mjs` usa `store.append(...)`, una mutación persistente de Chronicle.
- La respuesta puede seguir declarando `authorization: NOT_EVALUATED`; esa etiqueta no detiene por sí misma la ruta.

Esto confirma estáticamente que no debe tratarse `--initialize-continuity` como inicialización aislada/inocua. No es evidencia de una ejecución real ni demuestra todos los posibles efectos.

### 3.5 Simulación y continuidad Nexo/Lúmina
En la rama examinada, `scripts/simulate.mjs` lee estado de mundo y pasa `state.nexoMemory ?? null` como `legacyMemory` al abrir el owner de continuidad; después avanza simulación y persiste estado. Eso es acoplamiento estático en esa ruta y contradice la independencia arquitectónica buscada. No generalizarlo a todos los componentes ni afirmar que el runtime lo ejecutó en esta sesión.

### 3.6 Workflow de cinco minutos y diferencia con main
`.github/workflows/lumina-simulation.yml` declara cron `*/5`, `contents: write`, y ejecuta `npm test`, `npm run assistants` y `npm run simulate`; antes hace fetch/reset a `origin/main`.
En la lectura estática acotada de `main`:
- `scripts/assistants.mjs` no llama a `openNexoContinuityOwner`; usa `simulation.nexoMemory`, construye misión y registra vía `recordNexoPlan`.
- `scripts/simulate.mjs` no abre el store separado de continuidad y su payload de persistencia no incluye `nexoMemory`.
Conclusión limitada: la mera existencia del workflow NO prueba que ejecute los tres llamadores de continuidad de `ncs-clean-architecture`. Sí es una superficie de automatización relevante para Lúmina. El commit ejecutado en un run concreto, el estado real de runs, sus logs y sus efectos son `UNKNOWN`: no se consultó Actions history/logs.

### 3.7 Módulos de reparación
Los módulos dedicados de reparación siguen existiendo. Perplexity no encontró caller de producción para algunos de ellos dentro de la búsqueda limitada a `src/`, `scripts/`, `tests/`, `.github/`, pero no inspeccionó todos los branches, callers externos, Android/M1 ni toda la historia. No declarar “no hay callers” globalmente. M0 excluye reparaciones; mantener esa frontera.

### 3.8 NBP-07: concurrencia de escritores no cooperativos
Perplexity señaló que `continuity-store.mjs` usa lock cooperativo, luego `access` y publicación mediante temporal+rename, sin `wx`/`O_EXCL` en el punto de creación. Propuso como inferencia una posible carrera con escritor no cooperativo. Es un riesgo plausible, NO un fallo reproducido ni una propiedad refutada con prueba de ejecución. El test de carrera citado no fue ejecutado. Estado: parcial/UNKNOWN hasta inspección estática más precisa y evidencia apropiada autorizada.

## 4. Límites de lo que está confirmado
- Todo lo anterior es evidencia de lectura estática dirigida. No se ejecutó el repositorio, tests, CI ni workflow.
- No se consultó historial ni logs de Actions.
- No se hizo búsqueda exhaustiva de todos los branches, callers externos, dispositivos, apps o procesos no cooperativos.
- El índice de búsqueda de código de GitHub ha dado falsos negativos en búsquedas previas; ausencia en resultados de búsqueda no prueba ausencia de caller.
- No concluir que el bootstrap concede autoridad constitucional. Tampoco concluir que sea seguro/no autoritativo solo por el nombre, comentario o tipo de datos.
- Un test existente no demuestra que se haya ejecutado; un workflow definido no demuestra un run; un run verde no demuestra autoridad constitucional.
- Las etiquetas `COMMITTED`, `NOT_EVALUATED`, `UNKNOWN` tienen alcance concreto; no convertir una en otra por inferencia.

## 5. Referencias de repositorio y estado conocido
- Puerta canónica: [`NEXO_NCS/STATUS.md`](../STATUS.md) — blob leído `774764aa1a2f8e8d6c823c4d41dd7e6030753599` antes de registrar este handoff.
- Propuesta: [`NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md`](NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md), commit previamente citado `9855fb3db396251d093e537100f9c33ecc55acae` (pueden existir actualizaciones posteriores; volver a leer STATUS/HEAD antes de usar SHA histórico).
- Propiedades negativas: [`NCS_M0_BOOTSTRAP_NONAUTHORITATIVE_NEGATIVE_PROPERTIES_2026-10-27.md`](NCS_M0_BOOTSTRAP_NONAUTHORITATIVE_NEGATIVE_PROPERTIES_2026-10-27.md), HEAD de referencia anterior `e477bdefb4db82456997c106ce7ff65673e15f67`.
- Revisión de delta Perplexity: [`NCS_M0_PERPLEXITY_DELTA_REVIEW_2026-10-27.md`](NCS_M0_PERPLEXITY_DELTA_REVIEW_2026-10-27.md), commit `c361694c28c7f108c054e09dad963eba5fc6e235`, blob `9a1fdb8b2f1fd2714c03be8ef35d5ac5447d531f`.
- Branch conocido: `ncs-clean-architecture`. Verificar HEAD actual al inicio; no asumir que siga en el SHA histórico anterior.

## 6. Punto exacto para continuar — no repetir lo ya hecho
Continuar con un **inventario estático acotado de consumidores de continuidad**, centrado en los huecos reales del mapa:

1. Releer `STATUS.md` y los dos documentos BUILD anteriores para establecer si hubo cambios desde los SHAs aquí anotados.
2. Identificar con búsquedas de repositorio y lectura directa todos los campos/colecciones de snapshot proyectados por `projectNexoContinuitySnapshot` y rastrear sus consumidores: `attempts`, `executions`, `effectJournal`, `doNotRepeat` y el resto de colecciones que el código copie.
3. Para cada consumidor, registrar: archivo/función, campo leído, efecto observable, si puede influir en admisión/planificación/PREPARED/dispatch/reconciliación/persistencia, evidencia estática exacta y límites. No confundir “lee el dato” con “otorga autoridad”.
4. Leer estáticamente (sin ejecutar) los tests referidos por Perplexity: el caso de carrera en `tests/nexo/chronicle-runtime.test.mjs` líneas aproximadas 1294–1308 y las pruebas pertinentes de `scripts/assistants.mjs`/continuidad. Registrar qué cubren y qué no; no afirmar que pasaron.
5. Delimitar la carrera de `initialize`: localizar secuencia exacta, semántica de `rename` en la plataforma asumida, manejo de `conflict` y condiciones bajo las cuales un escritor no cooperativo puede crear/sustituir el archivo. Mantener “riesgo inferido/UNKNOWN” si el código no basta; no ejecutar pruebas de carrera.
6. Actualizar una única vez el mapa documental y luego el STATUS canónico, con rutas/refs precisos y la matriz de propiedades. No reabrir auditorías históricas salvo que aparezca una contradicción concreta.
7. No iniciar todavía implementación ni pruebas. Antes de cualquier cambio ejecutable, el contrato debe especificar aislamiento de bootstrap, exclusión de admisión/dispatch/mutación de dominio en la misma invocación, fallos/UNKNOWN y la garantía de concurrencia requerida.

### Matriz mínima para el siguiente resultado
- Hecho observado estáticamente.
- Fuente exacta (ruta, función y líneas/commit cuando disponibles).
- Qué permite afirmar.
- Qué NO permite afirmar.
- Estado: confirmado estáticamente / inferido / refutado en alcance delimitado / UNKNOWN / no revisado.
- Próximo cierre concreto y evidencia necesaria.

## 7. Protocolo de continuidad y comunicación
- No volver a auditar de cero Chronicle ni reescribir el informe de Perplexity: reutilizar sus hallazgos y validar solo los huecos definidos arriba.
- No afirmar que otras IAs, Codex Tasks o workflows se han contactado/ejecutado. El usuario puede aportar sus informes; cualquier envío a una tarea/agente externo necesita autorización explícita.
- Si se solicita apoyo a Claude/Qwen/Perplexity/DeepSeek, preparar primero una instrucción con el scope exacto, solo lectura, archivos a inspeccionar, exclusiones y formato de evidencia; no enviar sin permiso explícito.
- Si no se puede leer repo/branch o hay un force-update, declarar bloqueo y pedir recuperar el acceso/HEAD. No sustituirlo por recuerdos ni suponer que un SHA histórico sigue siendo HEAD.
- No convertir “continúa sin límites” en permiso para ejecutar tests/CI o modificar runtime.
- Mantener lenguaje español directo. Diferenciar implementación, propuesta, evidencia estática, ejecución y verificación CI.

## 8. Criterio de cierre de esta fase documental
La fase no se cierra por completar una lista ni por falta de hallazgos. Solo puede marcarse “inventario acotado completado” si cada colección copiada tiene consumidores relevantes trazados dentro del scope declarado, se anotan los límites de búsqueda, se resuelven las contradicciones y cada propiedad queda clasificada con evidencia. Si un caller o efecto relevante no puede descartarse, queda `UNKNOWN` y el gate correspondiente sigue `STOP`.

**No cambiar los gates al finalizar el handoff.**
