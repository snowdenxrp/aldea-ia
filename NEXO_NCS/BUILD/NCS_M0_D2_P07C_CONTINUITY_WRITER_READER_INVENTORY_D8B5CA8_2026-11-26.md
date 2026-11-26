# NCS M0 — Inventario estático de lectores/escritores Continuity y admisión

Fecha: 2026-11-26  
Repositorio: `snowdenxrp/aldea-ia`  
Snapshot exacto: `d8b5ca8720908d926acc18130614cce132a43b5d`  
Rama de código identificada: `ncs-lumina-decoupling-2026-10-29`  
Rama documental de este informe: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`  
Estado: **INVENTARIO ESTÁTICO REMOTO — SOLO LECTURA DEL CÓDIGO — NO IMPLEMENTA — NO EJECUTA — NO PRUEBA EL TARGET**

## 1. Resultado ejecutivo

**La premisa de que todos los escritores relevantes están COVERED no se sostiene con este snapshot.**

Se identifican rutas internas que usan el helper de Continuity, pero también existen escritores genéricos de archivos con rutas configurables que pueden apuntar al mismo destino canónico sin usar el protocolo de Continuity. Uno de ellos escribe directamente sin lock; otro usa un lock independiente que puede retirar locks stale por nombre.

Clasificación global: **UNKNOWN-STOP para la premisa COVERED de A**.

Hallazgos decisivos:

1. El snapshot no contiene implementación de un ancla durable separada. El objeto de admisión presente es un directorio efímero `<continuityPath>.lock`, creado y eliminado por nombre.
2. Las operaciones del helper de Continuity toman ese lock cooperativo; esto solo cubre las rutas que realmente usan el helper.
3. `scripts/assistants.mjs` acepta `NEXO_LUMINA_MEMORY_PATH` y escribe ese destino con `fs.writeFile`, sin lock. No existe una exclusión que impida que la variable apunte al archivo de Continuity.
4. `scripts/assistants.mjs` acepta `NEXO_STATE_PATH` y pasa el destino a `persistState()`. Ese escritor usa su propia implementación de lock y publica con `rename()`; su política de recuperación stale no equivale a la del helper Continuity.
5. Los módulos de reparación reciben `owner` y `store` inyectados. El inventario no encuentra en el código de producción inspeccionado un caller que permita demostrar qué implementación concreta suministra esos objetos en todos los entornos.
6. `P09` y los consumidores externos al repositorio siguen sin poder cerrarse mediante este inventario.

No se ha probado que una variable de entorno esté configurada actualmente para aliasar el store. Lo demostrado es que el código permite esa configuración y no la rechaza. Por tanto, no se puede clasificar esa ruta como COVERED.

## 2. Método y límites

Se recuperó el árbol Git recursivo del SHA exacto: 3.230 entradas, sin truncamiento. Se inspeccionaron los 47 módulos de `src/nexo/` y `scripts/nexo*`, los entrypoints y los módulos de aplicación no Nexo relevantes para persistencia, incluidos `scripts/simulate.mjs` y `scripts/assistants.mjs`.

Se revisaron imports, reexports, rutas de archivo configurables, loaders/imports computados, lecturas, escrituras, renames, unlink/rm y las interfaces de store/owner inyectadas.

**Límite:** un árbol de repositorio no revela procesos, launchers, addons, scripts privados ni consumidores instalados fuera del repositorio. Tampoco permite afirmar que el entorno POCO/Termux esté ejecutando exactamente este snapshot. Esos elementos permanecen UNCLASSIFIABLE/UNKNOWN, no COVERED.

## 3. Inventario por ruta

### 3.1 Helper canónico de Continuity

| Ruta / función | Evidencia | Clasificación |
|---|---|---|
| `src/nexo/core/continuity-store.mjs` — adquisición | `lockPathFor()` usa `filePath + ".lock"`; `acquireLock()` crea el directorio y owner record; líneas 21–22, 41–60 | COVERED dentro del helper |
| Mismo módulo — release | token leído y luego `rm(lockPath, recursive)`; líneas 68–89 | COVERED como participante, pero identidad/release replacement-safe NOT SATISFIED |
| Mismo módulo — lectura | `loadCurrent()` adquiere lock antes de leer y libera después; líneas 357–391 | COVERED dentro del helper |
| Mismo módulo — inicialización | `initializeWithMode()` adquiere lock; líneas 395–480 | COVERED dentro del helper |
| Mismo módulo — commit | `commitIfCurrent()` adquiere lock antes de leer/revisar/escribir; líneas 490–574 | COVERED dentro del helper |
| Mismo módulo — publicación ordinaria | temporal estable, `writeFile`, `rename(tempPath,filePath)`; líneas 173–216 | COVERED en exclusión cooperativa; seam de reemplazo del store permanece abierto |
| Mismo módulo — primera publicación | temporal único, `open("wx")`, `copyFile(COPYFILE_EXCL)`; líneas 249–311 | COVERED en exclusión cooperativa; no demuestra atomicidad de visibilidad ni durabilidad ante power loss |

El propio módulo declara que el lock coordina solo escritores locales cooperativos, no es una cerca global ni protección contra rollback; tampoco reclama fsync/power-loss durability ni resistencia a mutación de paths por procesos no confiables (comentario de contrato, líneas 317–327).

### 3.2 Servicio y bootstrap

| Ruta / función | Evidencia | Clasificación |
|---|---|---|
| `src/nexo/core/continuity-service.mjs:preflightNexoContinuityBootstrap` | comprueba ausencia del destino, del `.lock` y residuos temporales; líneas 152–168; la resolución de inputs también busca `.tmp`/ `.tmp-*`, líneas 92–146 | COVERED como preflight de nombres conocidos; no prueba historial de existencia |
| `bootstrapNexoContinuityStore` | construye el helper y llama `initializeExclusive`; líneas 170–183 | COVERED para la operación invocada |
| `openNexoContinuityOwner` | carga con helper; ante NOT_FOUND permite inicializar si `allowEmptyInitialization === true`; líneas 185–221 | COVERED en lock, pero **readmisión por ausencia posible si un caller autoriza ese flag** |
| `scripts/nexo-continuity-bootstrap.mjs` | entrypoint interactivo de bootstrap; llama preflight y luego bootstrap; líneas 40–91 | COVERED en la operación; no demuestra que nunca existió un store anterior |

La regla del servicio dice que la inicialización vacía solo debe permitirse cuando el caller haya establecido independientemente que no existe un world-state previo. El código no aporta por sí mismo una prueba durable de ese historial. El preflight observa ausencia actual, no ausencia histórica.

### 3.3 Aplicación y CLI: lectores/escritores internos

| Ruta / función | Evidencia | Clasificación |
|---|---|---|
| `src/nexo/application/continuity-queries.mjs` — status, mission status/plan, draft preview, open loops | construye `createNexoContinuityStore` y usa `loadCurrent()`; líneas 5–10, 33–42, 99–108, 197–216, 263–272 | COVERED para lectura |
| `src/nexo/application/chronicle-append.mjs` | construye Continuity store y ejecuta `loadCurrent()`; abre owner; líneas 312–337; el flag de inicialización Continuity se rechaza antes de I/O, líneas 293–298 | COVERED para las llamadas que usan estos objetos |
| `src/nexo/core/continuity-owner.mjs` | opera sobre métodos del store inyectado; no realiza I/O de archivo directo | UNCLASSIFIABLE si el owner se construye externamente con un store arbitrario; COVERED cuando procede de `openNexoContinuityOwner` |
| `scripts/nexo.mjs` | importa la superficie de aplicación y expone status/mission-status/plan/preview; líneas 5, 133–177 | COVERED para sus lecturas |
| `scripts/nexo-chronicle-session.mjs` | CLI pasa paths a `runNexoChronicleAppend`; opciones y flags en líneas 11–38, llamada en línea 71 | COVERED para el flujo de aplicación; el path sigue siendo caller-supplied |
| `scripts/nexo-continuity.mjs` | reexporta servicio de Continuity; líneas 1–2 | UNCLASSIFIABLE para consumidores externos que importen esta API sin inventario de sus callers |

### 3.4 Reparación: dependencias inyectadas

| Ruta / función | Evidencia | Clasificación |
|---|---|---|
| `scripts/nexo-repair-protocol.mjs` | recibe `owner`, `store`, `loadStateStrict` y `persistState`; usa `owner.loadCurrent()` y `store.loadCurrent()` | UNCLASSIFIABLE: el objeto concreto y su origen no se fijan en esta función |
| `scripts/nexo-repair-mission-verification.mjs` | recibe `store` y llama `store.loadCurrent()`; líneas 17–33 y 141–162 | UNCLASSIFIABLE por inyección |
| `scripts/nexo-repair-settlement.mjs` | recibe `store`; llama `loadCurrent()` y `commitIfCurrent()`; líneas 18–36 y 85–150 | UNCLASSIFIABLE por inyección |
| `scripts/nexo-repair-preparation.mjs` | recibe `owner`; no construye el store | UNCLASSIFIABLE por inyección |
| `scripts/nexo-repair-entrypoint.mjs`, `nexo-repair-dispatch.mjs`, `nexo-repair-session.mjs` | pasan argumentos al protocolo tras gate M0 | No prueban por sí mismos la identidad del store; además los efectos Option A están excluidos por el gate M0 |

No se ha promovido esta familia a COVERED global. La implementación real puede ser segura si los callers suministran el owner/store canónico, pero esa procedencia no queda demostrada por los módulos inyectables.

### 3.5 Escritores alternativos con paths configurables

**RAW-1 — Lúmina memory writer**

- Archivo: `scripts/assistants.mjs`.
- Destino: `NEXO_LUMINA_MEMORY_PATH` si está definido; de lo contrario `.lumina-assistant-memory.json` (líneas 14–19).
- Escritura: `fs.writeFile(MEMORY_PATH,...)` (línea 106).
- No adquiere el lock de Continuity ni usa `createNexoContinuityStore`.
- No hay denylist ni validación que impida que `NEXO_LUMINA_MEMORY_PATH` apunte al path del store.

Clasificación: **RAW condicional**. La configuración no prueba que el alias esté activo; sí prueba que el código puede escribir directamente sobre el destino del store si se configura así. Es un contraejemplo suficiente para no declarar COVERED sin cerrar la configuración y los launchers.

**RAW-2 — Lúmina world-state writer**

- Archivo: `scripts/assistants.mjs` toma `NEXO_STATE_PATH` como destino (líneas 14–16), lee ese estado y luego llama `persistState(STATE_PATH,...)` (línea 108).
- Archivo: `scripts/simulate.mjs`, `persistState(statePath,...)` acepta un path absoluto o file URL; líneas 18–37 y 218 en adelante.
- Publicación: escribe un temporal y hace `rename(tempPath, normalizedStatePath)`; limpieza de temporales por prefijo; líneas 246–253.
- Lock: `acquireStateLock()` crea el mismo sufijo nominal `.lock`, pero implementa política independiente; líneas 40–85. Si considera stale un lock, lo elimina recursivamente por nombre y continúa (líneas 69–75), en vez de conservarlo para recuperación explícita como exige el contrato de Continuity.
- El destino predeterminado de Lúmina es `world-state.json`, distinto del store canónico. Pero `NEXO_STATE_PATH` permite cambiarlo sin impedir un alias al archivo de Continuity.

Clasificación: **RAW condicional / no equivalente al helper canónico**. El hecho de que use un directorio con el mismo sufijo no lo convierte en participante conforme: su reaper puede retirar locks stale por nombre y su escritor publica con rename directo.

**Separación importante:** el world-state predeterminado y el archivo de aprendizaje predeterminado son stores distintos. No se afirma que sus valores por defecto sobrescriban Continuity. El defecto es que las rutas configurables no impiden aliasarlas al store.

### 3.6 Chronicle separado

`src/nexo/core/chronicle-store.mjs` implementa otro store, con su propio `.lock`, `loadCurrent`, `initialize`, `append`, temporales y `rename(temp,filePath)` (líneas 40–78, 140–195, 208–391).

No es el archivo canónico de Continuity si los paths se configuran correctamente. Sí es otro destino persistente con un seam de reemplazo por nombre. Su inventario no debe confundirse con el de Continuity ni usarse para afirmar que el ancla propuesta ya lo protege.

## 4. Loaders computados y consumidores externos

- En los módulos de producción Nexo inspeccionados, las rutas principales llegan por argumentos `continuityPath`/`chroniclePath` y los imports Nexo observados son estáticos.
- No se encontró un `import()` computado que cargue módulos Nexo en el código de producción inspeccionado. El import remoto computado de `src/three-remote.js` corresponde a Three.js, no a Nexo.
- `scripts/assistants.mjs` carga fuentes mediante `new URL("../" + path, import.meta.url)`, pero el arreglo de paths es literal y se usa para leer código para análisis; no es un loader de Continuity.
- `package.json` no declara una superficie `exports`; sí expone comandos de assistants, simulate y bootstrap. El CLI Nexo es invocable directamente por ruta de script.
- No es posible enumerar desde el árbol Git consumidores fuera del repositorio, procesos instalados, aliases de entorno en el POCO, wrappers locales, tareas programadas o addons. Esos actores siguen **UNCLASSIFIABLE**.

## 5. Resultado por invariantes / contraejemplos

| Elemento | Resultado del inventario |
|---|---|
| I7 — ninguna ruta del producto reemplaza/borra el ancla | **NO EVALUABLE / NOT SATISFIED**: no existe implementación del ancla en este snapshot. El store sí se reemplaza mediante rename; el lock efímero se elimina por nombre. |
| I8 — init solo si ancla, store y residuos están ausentes | **NOT SATISFIED como garantía histórica**: preflight observa ausencia actual y residuos conocidos; no demuestra que el store nunca existió. `openNexoContinuityOwner` puede inicializar tras NOT_FOUND con `allowEmptyInitialization:true`. |
| CE-A — escritor no cooperativo COVERED | **CONFIRMADO COMO POSIBILIDAD**: RAW-1 puede escribir sin lock al path configurado; RAW-2 puede publicar con un lock independiente y política stale distinta. |
| CE-B — power loss | Fuera del claim del módulo; el comentario de Continuity niega fsync/power-loss durability. No se ejecutaron pruebas. |
| CE-C — init tras ausencia con store histórico | **No refutado**: la comprobación es de ausencia actual, no de historial durable. |
| CE-D — ABA por restauración/inodo reutilizado | **No evaluado en target**: no existe evidencia del filesystem real en este inventario. |
| CE-E — rollback RAW por restauración de backup | Sigue siendo posible bajo el modelo R1; ningún writer inventory lo excluye. |

## 6. Clasificación final de cobertura

- **COVERED:** operaciones internas de lectura/escritura que entran por los métodos de `createNexoContinuityStore` y por el servicio/CLI canónico, condicionado a que todos los callers usen esas rutas.
- **RAW:** `NEXO_LUMINA_MEMORY_PATH` → `fs.writeFile`; `NEXO_STATE_PATH`/ `persistState` → lock independiente + `rename`.
- **UNCLASSIFIABLE:** stores/owners inyectados en reparación; consumidores externos; launchers y procesos fuera del árbol; cualquier alias real de configuración no inventariado en el target.

La existencia de rutas RAW configurables impide afirmar que todos los escritores relevantes están COVERED. P09 permanece OPEN/UNKNOWN.

## 7. Decisión

1. Arquitectura A: **UNKNOWN-STOP**. No ratificar ni implementar.
2. P05: **OPEN**; la cobertura de escritores y el enforcement no están demostrados.
3. P07-C: **UNKNOWN/BLOCKING**; el rename del store y la limpieza por nombre permanecen abiertos.
4. O7: **UNKNOWN**; hay rutas RAW condicionales y consumidores externos no enumerados.
5. O8: **UNKNOWN**; este inventario no prueba el entorno real R1.
6. No se propone corregir el código en esta unidad. El siguiente trabajo debe ser un inventario de configuración/launchers/consumidores del target y una definición ratificada de exclusión de paths, sin tratar una lista estática del repo como prueba de exclusividad.

## 8. Procedencia y acciones

Evidencia leída desde GitHub en el SHA exacto indicado. Se inspeccionaron los módulos de producción del árbol, no se ejecutó el repositorio, no se ejecutaron tests ni CI, no se invocó el dispositivo y no se escribieron datos de Continuity/Chronicle.

Esta rama añade únicamente este informe documental. No modifica la rama de código `ncs-lumina-decoupling-2026-10-29`, G2, C3 ni PR #110.
