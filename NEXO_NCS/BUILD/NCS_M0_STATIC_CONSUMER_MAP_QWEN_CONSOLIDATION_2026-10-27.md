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
