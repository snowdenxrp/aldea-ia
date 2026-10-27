# NCS M0 — Mapa estático de consumidores y consolidación adversarial Qwen (2026-10-27)

## Estado y límites

- Rama inspeccionada: `ncs-clean-architecture`.
- HEAD observado al iniciar esta revisión: `20cfcb3aac6f24fe7c4c46ccd322ddf82b9ebd4d`.
- Tipo de evidencia: lectura estática dirigida de archivos de la rama. No se ejecutaron código, pruebas, CI ni workflows.
- Este documento no ratifica un contrato ni autoriza implementación.
- Gates conservados: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reparaciones excluidas de M0.
- La revisión de Qwen es adversarial, no una inspección independiente del repositorio. Sus F-1–F-7 son datos proporcionados por el usuario; sus conclusiones son inferencias o hipótesis, no nueva evidencia de código.

## 1. Hallazgo central: Chronicle

Fuente: `src/nexo/application/chronicle-append.mjs`, blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`, función `runNexoChronicleAppend`, aproximadamente líneas 274–401.

La función:
1. valida las opciones y límites de contenido;
2. lee ambos stores y distingue stores ausentes de otros errores;
3. si las opciones explícitas permiten inicializar, abre el owner de continuidad y puede inicializar el store;
4. si falta Chronicle y se permitió inicializar, inicializa Chronicle;
5. admite una misión si no existe;
6. valida la forma y payload de la misión;
7. llama a `executeNexoStepWithContinuityOwner`.

La ruta inspeccionada devuelve resultados públicos con `authorization: NOT_EVALUATED`; esa etiqueta no actúa como compuerta. La inspección estática no encontró en esta función una comprobación de autoridad constitucional que detenga la transición antes de admisión/dispatch. Esto **no demuestra concesión de autoridad constitucional ni ejecución real**. Sí impide declarar probado el aislamiento del bootstrap.

Entrada CLI: `scripts/nexo-chronicle-session.mjs`, blob `30a53de2f108aa255a1dfd61ce78c19788de160b`, acepta `--initialize-continuity` y `--initialize-chronicle`.

## 2. Llamadores directos observados

El mapa de rutas revisadas contiene al menos estos tres llamadores directos de `openNexoContinuityOwner`:

| Llamador | Datos de entrada | Consecuencia en la misma invocación | Estado |
|---|---|---|---|
| `src/nexo/application/chronicle-append.mjs` | Paths y flags de inicialización | Puede inicializar stores, admitir misión y llegar al adapter de Chronicle | Brecha estática de aislamiento; no se ejecutó |
| `scripts/simulate.mjs` | `state.nexoMemory ?? null` como `legacyMemory`; `allowEmptyInitialization: !stateExists` | Abre continuidad, avanza la simulación y persiste estado de mundo; continuidad se almacena en archivo separado | Acoplamiento estático; no prueba contaminación en ejecución real |
| `scripts/assistants.mjs` | `persisted.nexoMemory ?? null`; `allowEmptyInitialization: !stateExists` | Usa el snapshot para construir una misión, la registra en continuidad y persiste estado/learning de Lúmina | Acoplamiento estático y continuidad durable en la ruta revisada |

Fuentes:
- `src/nexo/core/continuity-service.mjs`, blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`, función `openNexoContinuityOwner`, líneas aproximadas 81–122.
- `scripts/simulate.mjs`, blob `1b5e39b681486f583c1779770c52dd913227dfa1`.
- `scripts/assistants.mjs`, blob `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`.

**Corrección documental:** cualquier frase previa que limite el inventario a dos llamadores queda superada por este mapa acotado de tres llamadores. Esto no prueba que sean los únicos callers en todos los branches, procesos externos o dispositivos.

## 3. Migración desde `legacyMemory`

En `openNexoContinuityOwner`, cuando `loadCurrent()` devuelve `NEXO_CONTINUITY_STORE_NOT_FOUND`:
- si `legacyMemory` no es nulo, proyecta `projectNexoContinuitySnapshot(legacyMemory)`;
- solo si no hay memoria heredada, evalúa `allowEmptyInitialization === true`;
- inicializa el store y vuelve a leerlo.

Por tanto, no es correcto decir que toda inicialización dependa de `allowEmptyInitialization`. La ausencia del store más una `legacyMemory` válida puede iniciar la migración. La lectura estática no prueba por sí sola que los datos adquieran autoridad constitucional.

## 4. Colecciones y consumidores conocidos

`src/nexo/core/continuity-snapshot.mjs`, blob observado en lectura directa del branch, declara cinco colecciones: `missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`. `projectNexoContinuitySnapshot` clona las cinco desde `memory.nexo`; la proyección por sí sola no persiste ni concede autoridad.

| Colección | Consumidores/usos estáticos observados | Qué permite afirmar | Qué no permite afirmar |
|---|---|---|---|
| `missions` | `continuity-operations.mjs` registra/valida; owner y runtime leen misiones y pasos; Chronicle busca/admite una misión; `assistants.mjs` registra una misión construida por el orquestador | El contenido puede determinar qué misión/pasos se reconstruyen y ejecutan | No acredita autorización constitucional |
| `attempts` | Operaciones de continuidad reconstruyen historial/resultados de pasos y evitan tratar replays como nuevos resultados | Los registros influyen en reconstrucción y decisión de reintento | No demuestra por sí solo corrección de todos los escenarios de fallo |
| `doNotRepeat` | Operaciones pueden añadir restricciones; `src/nexo/orchestrator.js` consume `memory.nexo.doNotRepeat` para bloquear pasos planificados | Continuidad heredada puede afectar planificación futura | No equivale a permiso o autoridad |
| `executions` | Operaciones registran resultados/linaje con identidad de idempotencia; consumers reconstruyen señales de ejecución | El historial afecta trazabilidad y reconstrucción | No demuestra que todo efecto externo esté registrado |
| `effectJournal` | Owner/runtime y operaciones usan registros PREPARED, settlement y reconciliación; consultas exponen estado operativo | Los datos pueden condicionar dispatch, settlement y recuperación; requiere análisis de consumidores especialmente estricto | La etiqueta de snapshot no autoritativo no basta para demostrar que su uso sea inocuo |

El mapa de consumidores es dirigido y acotado; no se declara exhaustivo. No se debe convertir la lectura de un campo en afirmación de autoridad ni confundir una colección operacional con una raíz de confianza.

## 5. Tests de concurrencia: lectura estática, no ejecución

Fuente: `tests/nexo/chronicle-runtime.test.mjs`, blob `0bf35f0dc1aadb121a8b2145b4963bacd5641c04`, líneas aproximadas 1253–1312.

El código del test incluye:
- dos llamadas concurrentes a una operación ya admitida, aserción de máximo un dispatch, una entrada Chronicle y replay sin redispatch ni cambio de bytes;
- dos llamadas concurrentes de bootstrap inicial con `initializeContinuity: true` y `initializeChronicle: true`, un retry explícito, máximo un dispatch, una entrada final y replay sin cambios de bytes.

Esto documenta cobertura prevista por el test, **no un resultado de ejecución**. No demuestra exclusión frente a escritores que no cooperan con los locks, atomicidad multi-store ni garantías de durabilidad ante pérdida de energía.

## 6. Bloqueo local de reparación vs. exclusión global

`scripts/nexo-runtime-session.mjs`, blob `f67b6fbe1b6f0098ebf23b35055cc668f96df991`, devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `dispatchAttempted: false`, `persisted: false`.

Los módulos `scripts/nexo-repair-entrypoint.mjs`, `scripts/nexo-repair-preparation.mjs` y `scripts/nexo-repair-dispatch.mjs` siguen existiendo. Esto confirma el bloqueo de esa entrada de producto, no la inalcanzabilidad global de toda API de reparación. El alcance global sigue `UNKNOWN`.

## 7. Persistencia y locks: límite de garantía

`src/nexo/core/continuity-store.mjs`, blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`, usa bloqueo cooperativo y publica mediante un temporal determinista `${filePath}.tmp` con `writeFile` + `rename`. En `initialize()`, tras adquirir el lock, el flujo hace `access(filePath)`; si recibe `ENOENT`, construye el envelope y llama a `writeEnvelope`. El check de existencia y el `rename` no son una primitiva indivisible de creación exclusiva.

**Riesgo delimitado:** un escritor que no respete el lock podría crear/cambiar el destino después de `access()` y antes de `rename()`. En plataformas donde `rename` reemplaza un destino existente, eso podría sustituir el archivo concurrente. El temporal fijo también implica que la coordinación de su nombre depende del lock cooperativo. Es una inferencia basada en secuencia estática y semántica de plataforma pendiente de fijar; no es fallo reproducido ni prueba de que un escritor externo exista. El contrato del store declara expresamente que `storeRevision` coordina escritores cooperativos, no es una barrera global.

El código no demuestra una transacción atómica entre Continuity y Chronicle ni durabilidad universal ante fallos de energía/sistema de archivos. No se hicieron pruebas de carrera ni se validaron semánticas en ejecución sobre el dispositivo de destino.

## 8. Consolidación de la revisión adversarial Qwen

Qwen identificó correctamente como propiedades pendientes de aceptación falsable:
- aislamiento del bootstrap;
- autoridad constitucional explícita;
- persistencia permitida/no autoritativa;
- separación Nexo ↔ simulación;
- exclusión global de reparaciones/efectos protegidos;
- aplicación global de `D3/STOP`.

Sus argumentos de refutación son hipótesis útiles, pero Qwen no leyó el repo; no se cuentan como evidencia técnica independiente.

Ajustes al criterio:
1. Persistencia y autoridad son propiedades distintas: un write puede violar una prohibición de persistencia sin demostrar concesión de autoridad.
2. No se debe prohibir toda inicialización por inferencia; el límite depende del contrato M0 ratificado. Deben quedar bloqueadas las transiciones no autorizadas y los efectos prohibidos.
3. Ausencia de evidencia no falsifica por sí sola la propiedad: registrar `UNKNOWN`/no satisfecho hasta evidencia.
4. E3/E4, si se autorizan más adelante, solo prueban la condición concreta cubierta, no una propiedad global sin cobertura adecuada.

## 9. Criterios de aceptación y punto de continuación

| Propiedad | Criterio falsable | Estado actual |
|---|---|---|
| Aislamiento de bootstrap | Sin autorización explícita, la invocación de bootstrap no admite misión, no despacha Chronicle ni produce persistencia prohibida. | No satisfecho hasta evidencia; brecha estática identificada en Chronicle |
| Autoridad constitucional | Ninguna transición a misión/efecto durable depende solo de caller data, PREPARED o NOT_EVALUATED; debe existir validación normativa explícita en el límite correspondiente. | UNKNOWN/PENDING |
| Separación Nexo/simulación | Estado de simulación no inicializa ni modifica continuidad real fuera de un sandbox/namespace explícitamente no autoritativo definido por contrato. | Riesgo estático identificado |
| Reparaciones M0 | Toda entrada alcanzable está bloqueada o es demostrablemente inalcanzable bajo M0. | Exclusión local confirmada estáticamente; global UNKNOWN |
| Concurrencia/publicación | El contrato identifica los escritores del alcance, la exclusión exigida y comportamiento ante ausencia/corrupción/conflicto/UNKNOWN; no se presume garantía universal de rename. | Parcial/UNKNOWN |
| D3/STOP | Ninguna ruta relevante puede cruzar a efecto protegido mientras STOP esté vigente. | Mantener STOP; compuerta global UNKNOWN |

### Próximo paso (sin cambios ejecutables)

1. Reconciliar referencias/contradicciones de documentación con el STATUS canónico.
2. Completar el inventario acotado de consumers y writers, dejando límites de búsqueda explícitos.
3. Separar las propiedades de aislamiento, autoridad, persistencia y concurrencia en la matriz final.
4. Mantener M0 `INCOMPLETO`; no ejecutar tests/CI ni modificar runtime/configuración sin autorización explícita.
5. Gemini no es necesario para esta consolidación documental; se reservará para una pregunta adversarial concreta si queda una discrepancia no resuelta.

**Resultado:** el mapa estático mejora la precisión de la evidencia y el inventario; no cierra las propiedades de seguridad ni cambia ningún gate.


## 10. Delta de consumidores y límites de inicialización (lectura estática adicional, 2026-10-27)

Esta sección continúa el handoff de bootstrap delta. No sustituye las secciones anteriores ni cambia los gates. Fuentes leídas directamente en `ncs-clean-architecture`; no se ejecutaron código, tests ni CI.

### 10.1 Proyección completa y consumidores con influencia operacional

`src/nexo/core/continuity-snapshot.mjs` declara exactamente cinco colecciones en `COLLECTIONS` y `projectNexoContinuitySnapshot(memory)` copia cada una mediante `structuredClone(memory.nexo[key])`:

| Colección | Consumidor/función inspeccionada | Influencia estática observada | Límite |
|---|---|---|---|
| `missions` | `continuity-operations.mjs`: `recordNexoMissionInSnapshot`, `reconstructNexoMissionFromSnapshot`; `continuity-owner.mjs`; `chronicle-append.mjs); `assistants.mjs) | Define identidad, pasos, acciones y targets reconstruidos; Chronicle busca/admite misión y el runtime selecciona su paso | No es validación constitucional ni autorización de efecto |
| `attempts` | `recordNexoOutcomeInSnapshot`, `reconstructNexoMissionFromSnapshot`, owner/runtime | Afecta reconstrucción de resultados; una completion claim sin identidad/evidencia/contrato suficiente bloquea el paso; los replays no deben sobrescribir el primer intento | El campo `evidence.source` es una etiqueta, no autenticación independiente de procedencia |
| `doNotRepeat` | `src/nexo/orchestrator.js`: `repeatBlocked` dentro de `buildNexoMission`; operaciones de continuidad | Puede cambiar la planificación futura y bloquear acciones por action/target | Restricción de planificación, no autoridad ni permiso |
| `executions` | `recordNexoExecutionInSnapshot`; `recordExecutionLineage`/owner; reconstrucción | Conserva identidad idempotente y primer resultado; los conflictos de identidad/resultados pueden bloquear o devolver conflicto; señales de reconstrucción incluyen su cantidad | Linaje no equivale a verdad del efecto externo ni settlement del journal |
| `effectJournal` | `recordPrepared`, settlement/reconciliation en owner; `reconstructNexoMissionFromSnapshot`; runtime | PREPARED sin resolver, estados desconocidos, entradas huérfanas o desajustes de binding bloquean la misión/paso y pueden llevar a reconciliación sin redispatch; un settlement Chronicle válido participa en recuperación terminal | No es raíz de autoridad; que el runtime aplique bloqueos conservadores no demuestra un gate constitucional previo a la admisión/bootstrap |

El archivo `src/nexo/orchestrator.js` consume `memory.nexo.doNotRepeat` explícitamente para filtrar pasos. También devuelve contadores de `attempts`, `doNotRepeat` y `executions` en señales de misión; los contadores por sí solos no son evidencia de autorización. La inspección cubre consumidores relevantes conocidos, no todos los usos posibles en todos los branches/procesos.

### 10.2 Tests leídos, sin ejecución

- `tests/nexo/continuity-migration.test.mjs`: el texto del test cubre proyección de las cinco colecciones desde `legacyMemory`, exclusión de `runs/lessons/patterns`, preferencia por el store canónico existente, rechazo de corrupción sin fallback, estado inicial UNKNOWN por defecto, inicialización vacía opt-in, PREPARED no asentado por linaje, rechazo de revisión ambiental ausente/desajustada y bloqueos de reconstrucción para intentos incoherentes/no verificados. **Esto describe aserciones presentes en el archivo; no afirma que pasen.**
- `tests/nexo/assistants-runtime-cli.test.mjs`: el texto del test prepara rutas temporales aisladas, llama el CLI de asistentes y comprueba el gate de reparación Opción A (`NEXO_M0_OPTION_A_EFFECT_EXCLUDED`), `dispatchAttempted: false`, `persisted: false`, ausencia de journal de efecto y que la planificación de misión puede persistir. **No se ejecutó**; además, el test usa `spawnSync`, así que leerlo estáticamente no es ejecutar la ruta.
- `tests/nexo/chronicle-runtime.test.mjs`, alrededor de 1285–1315: el caso de bootstrap concurrente invoca dos veces `runNexoChronicleAppend`, hace un retry, afirma máximo un dispatch, una entrada Chronicle y replay sin cambios de bytes. **No se ejecutó** y solo cubre el escenario/coordinación que el test construye; no acredita exclusión frente a escritores que ignoren el lock ni autoridad constitucional.

### 10.3 Carrera de inicialización: afirmación ajustada

En `src/nexo/core/continuity-store.mjs`, `initialize(snapshot)`:
1. adquiere el lock mediante `mkdir(lockPath)`; es una coordinación cooperativa por path;
2. ejecuta `access(filePath)`; si existe devuelve `conflict / NEXO_CONTINUITY_STORE_ALREADY_EXISTS`; si el error no es `ENOENT`, devuelve `failed / NEXO_CONTINUITY_STORE_ACCESS_FAILED`;
3. ante `ENOENT`, llama a `writeEnvelope`, que escribe el nombre temporal estable `${filePath}.tmp` y luego ejecuta `rename(tempPath, filePath)`;
4. si la escritura/publicación lanza error, intenta leer el destino: si coincide con el envelope pretendido puede reportar commit recuperado; si no puede determinar el resultado, devuelve UNKNOWN/fallo según la rama;
5. finalmente libera el lock; si la liberación falla, devuelve `failed` aunque exponga el estado de persistencia conocido, y la capa de servicio no entrega un owner utilizable como si la inicialización hubiera sido normal.

**Qué queda más preciso:** dentro de escritores que respetan el mismo lock, el lock serializa la secuencia de inicialización y el segundo inicializador debería observar el archivo ya existente y tomar la rama conflict. Esa es la intención/flujo estático; el test concurrente no se ejecutó.

**Riesgo residual:** el archivo declara expresamente que `storeRevision` coordina escritores cooperativos, no es una barrera global; también declara que `filePath` no es una frontera sandbox y exige impedir que procesos no confiables modifiquen paths/locks. Un escritor que ignore el lock puede competir después de `access` y antes de `rename`. En un sistema de archivos donde `rename` sustituya un destino existente, el writer podría reemplazar el archivo creado/cambiado durante esa ventana. El temporal estable `.tmp` también depende de que los escritores cooperen. El resultado exacto depende de plataforma, permisos, filesystem y timing; no se reprodujo la carrera ni se verificó el comportamiento del dispositivo Android. Estado: **riesgo estático plausible / resultado de ejecución UNKNOWN**, no “vulnerabilidad explotada” ni fallo reproducido.

No se observó una primitiva create-exclusive (p. ej. open con `wx`/`O_EXCL`) que cubra conjuntamente la comprobación y publicación de destino. Esto no implica que deba añadirse una primitiva concreta sin contrato y análisis de compatibilidad; únicamente delimita qué garantía no se puede atribuir al código inspeccionado.

### 10.4 Matriz de propiedades actualizada

| Propiedad | Evidencia disponible | Estado y cierre requerido |
|---|---|---|
| Aislamiento bootstrap Chronicle | Ruta estática puede inicializar, admitir misión y continuar a runtime/append en una invocación | **Brecha estática identificada**; contrato debe separar bootstrap de admisión/dispatch y persistencia de dominio |
| Autoridad constitucional | No se identificó gate constitucional en la ruta de bootstrap revisada; `NOT_EVALUATED` no bloquea | **PENDING/UNKNOWN**; definición normativa + evidencia del gate en el límite correcto |
| Separación Nexo/Lúmina | `legacyMemory` proviene de `state.nexoMemory`/ `persisted.nexoMemory`; continuidad influye en planificación y la ruta assistants persiste estado de Lúmina | **Acoplamiento estático confirmado en rutas revisadas**; contrato/namespace/sandbox y prueba autorizada futura |
| Reparación excluida de M0 | Gate local y aserciones escritas en test de CLI; módulos de reparación siguen presentes | **Bloqueo local confirmado estáticamente; exclusión global UNKNOWN** |
| Concurrencia de inicialización | Lock cooperativo, check `access`, temporal estable y `rename`; test concurrente está escrito pero no ejecutado | **Cooperación local descrita; writer no cooperativo y plataforma UNKNOWN** |
| Persistencia/durabilidad | Rename publica el envelope; no hay garantía de transacción multi-store ni fsync/power-loss en el contrato del archivo | **No afirmar atomicidad multi-store ni durabilidad universal** |
| D3/STOP | Hay bloqueos locales conservadores, pero no se ha demostrado un gate global en todas las rutas | **STOP vigente; gate global UNKNOWN** |

### 10.5 Conclusión de esta delta

El mapa ahora explica mejor cómo las cinco colecciones influyen en reconstrucción, planificación, linaje y recuperación, y distingue la serialización entre writers cooperativos del caso de writers no cooperativos. No se declara el inventario global completo. No se cambia ningún gate, no se ratifica un contrato, no se modifica código/tests/workflows/configuración ejecutable y no se ejecuta nada.
