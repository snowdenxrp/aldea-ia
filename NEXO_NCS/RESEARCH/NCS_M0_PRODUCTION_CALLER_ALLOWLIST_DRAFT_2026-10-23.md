# NCS M0 — Allowlist arquitectónico de callers Nexo (borrador D1)

**Fecha:** 2026-10-23  
**Estado:** BORRADOR DE AUDITORÍA — no aprobado, no implementado, D1 OPEN.  
**Snapshot fuente:** commit `f105a3a6b88c372d22aed49d29ea56d2d17ade78`; árbol completo de 3.019 entradas.  
**Censo asociado:** [NCS_M0_NEXO_SOURCE_REFERENCE_CENSUS_2026-10-23.md](NCS_M0_NEXO_SOURCE_REFERENCE_CENSUS_2026-10-23.md)

## 1. Propósito

Transformar el censo de rutas en una clasificación verificable de quién puede alcanzar Continuity/Chronicle y bajo qué condiciones. Este documento no concede acceso ni cierra D1. Es una propuesta de allowlist para revisión y para diseñar un test arquitectónico que falle ante un caller de producción no autorizado.

## 2. Entrypoints soportados observados en `package.json`

| Entry point | Definición actual | Clasificación propuesta | Acción requerida |
|---|---|---|---|
| `nexo` | `node scripts/nexo.mjs` | Producción — CLI principal | Migrar a `--root`; admitir operación antes de lecturas; derivar rutas internas |
| `assistants` | `node scripts/assistants.mjs` | Producción compuesta, transición pendiente | Retirar apertura/registro path-based; leer/escribir Continuity vía API de instancia |
| `simulate` | `node scripts/simulate.mjs` | Simulación legacy con efecto lateral Nexo | Recomendación: quitar su dependencia de Continuity; bootstrap/migración explícitos |
| `node scripts/nexo-chronicle-session.mjs` | No es script npm, pero el archivo puede ejecutarse directamente | CLI hija productiva/interna expuesta | Exigir raíz y lock propio; no depender del padre |
| `scripts/nexo-continuity.mjs` | Reexport de `openNexoContinuityOwner` | Adaptador legacy, no entrypoint de usuario | Retirar de callers productivos tras migración; mantener para tests solo si necesario |
| `scripts/nexo-repair-*.mjs`, `nexo-runtime-session.mjs` | Helpers importables; no son scripts npm separados | Internos / reparación excluida | No darles permiso por admisión de raíz; conservar `NEXO_M0_OPTION_A_EFFECT_EXCLUDED` |

El script `test` de package ejecuta pruebas seriales de simulación, asistentes y Nexo; no es un entrypoint de producción. `functions/api/capture.js` responde 410 y no importa módulos Nexo.

## 3. Allowlist propuesto por frontera

### A. Producción: acceso permitido solo después de migración a instancia

1. `scripts/nexo.mjs` — router de comandos. Solo debe llamar a la API de instancia admitida.
2. `scripts/nexo-chronicle-session.mjs` — append Chronicle. Debe ser autosuficiente en su admisión cuando se invoca directamente.
3. `scripts/assistants.mjs` — puede producir misión candidata desde análisis externo; no debe abrir el store ni llamar directamente a `continuity.owner.recordMission`. Lectura y escritura admitidas deben ser operaciones separadas, con escritura condicional por revisión.
4. `scripts/simulate.mjs` — candidato a quedar fuera de persistencia Nexo; world state y simulación no deben abrir/inicializar Continuity incidentalmente.

### B. API de instancia que debe convertirse en la única superficie pública soportada

La API futura debe exponer operaciones concretas orientadas a instancia, no fábricas que acepten rutas de store:
- consulta de status / mission status / plan / previews / open loops;
- append Chronicle;
- lectura de snapshot/revisión para construir una misión candidata;
- escritura condicional de misión contra revisión observada;
- bootstrap/migración explícitos separados de operaciones normales.

La API debe devolver contratos de resultado tipados y sanitizados. Admisión, resultado de negocio y autorización son tres dimensiones separadas. Debe mantener `authorization: NOT_EVALUATED` donde hoy no se ha evaluado autoridad; no traducir `validated` o lock adquirido en permiso de efectos.

### C. Primitivas internas: no permitidas como imports directos desde entrypoints productivos

- `src/nexo/core/continuity-service.mjs` — `openNexoContinuityOwner({ filePath, ... })`.
- `src/nexo/core/continuity-store.mjs` — `createNexoContinuityStore({ filePath })`.
- `src/nexo/core/chronicle-store.mjs` — `createNexoChronicleStore({ filePath })`.
- `src/nexo/application/chronicle-append.mjs` — hoy acepta rutas de stores y construye stores.
- `src/nexo/application/continuity-queries.mjs` — hoy acepta `continuityPath` y abre store.
- `src/nexo/application/mission-request-preview.mjs` — hoy delega en consulta path-based.
- `src/nexo/application/index.mjs` — reexporta la API anterior; debe cambiar a una superficie de instancia en la migración.

Estas rutas pueden seguir importándose por tests unitarios, fixtures y helpers internos permitidos, pero eso no las convierte en una API de producción. El test arquitectónico debe analizar imports transitivos desde entrypoints, no solo la lista de imports inmediatos.

### D. Tests/fixtures: acceso a primitivas permitido solo dentro del perímetro de pruebas

Se inspeccionaron 45 archivos `tests/nexo/**`. Estos tests importan directamente stores, owners, servicios, adaptadores, APIs path-based y scripts legacy para caracterizar el comportamiento actual. Ese acceso es intencional en pruebas, pero debe quedar segregado del grafo de producción. El inventario de esos 45 archivos y sus blob SHA está en el censo completo asociado.

Los otros 50 archivos `tests/**` fuera de `tests/nexo/**` importan módulos de pueblo/mundo/asistentes, no stores ni API de apertura de Continuity/Chronicle. `src/assistants/memory.js` contiene una estructura legacy en memoria y no abre stores.

## 4. Grafo de imports/callers ya observado

- `scripts/nexo.mjs` → `src/nexo/application/index.mjs` + `resource-limits.mjs`.
- `scripts/nexo-chronicle-session.mjs` → `application/index.mjs` + `resource-limits.mjs`; ejecutable directamente.
- `application/index.mjs` → `chronicle-append.mjs`, `continuity-queries.mjs`, `mission-request-preview.mjs`.
- `chronicle-append.mjs` → `continuity-service.mjs`, Continuity/Chronicle stores, adapter Chronicle, owner-backed runtime, límites/deadline y effect adapter.
- `continuity-queries.mjs` → Continuity store, operaciones y contrato de admisión de misión.
- `scripts/nexo-continuity.mjs` → reexport de `continuity-service.mjs`.
- `scripts/assistants.mjs` → `nexo-continuity.mjs`, `nexo-runtime-session.mjs`, `src/nexo/orchestrator.js`, módulos de simulación/asistentes; además persiste world state y memoria Lúmina.
- `scripts/simulate.mjs` → `nexo-continuity.mjs` y módulos de mundo/simulación; además persiste world state.
- Los helpers de repair se alcanzan desde tests y rutas internas; no están declarados como scripts npm y el gate productivo de efectos permanece excluido.
- `src/nexo/runtime.js` importa `orchestrator.js`, `assistants/memory.js`, `simulation-adapter.js` y contratos/runtime en memoria; no se identificó ahí apertura directa de store por ruta.

## 5. Reglas que debe imponer el test arquitectónico

1. Definir explícitamente la lista de entrypoints de producción; el test falla si aparece un nuevo script/command en `package.json` sin clasificación.
2. Resolver imports relativos estáticos y reexports transitivos desde cada entrypoint.
3. Fallar si un entrypoint de producción importa directa o transitivamente fábricas path-based o `openNexoContinuityOwner`, excepto por una excepción temporal explícita con fecha/criterio de eliminación.
4. Probar la invocación directa de `nexo-chronicle-session.mjs` con rutas legacy: debe rechazar antes de leer, crear o escribir.
5. Probar que `assistants` no abre/migra Continuity antes de admisión y que la escritura condicional falla ante revisión base cambiada.
6. Probar que `simulate` no abre ni migra Continuity, si se aprueba su exclusión propuesta.
7. Permitir imports de primitivas dentro de `tests/**`, pero no aceptar que un archivo de test sea importado por un entrypoint productivo.
8. Escanear imports dinámicos, `require`, `spawn`/`spawnSync`, `execFile`, y guards de ejecución directa; no considerar una búsqueda textual vacía prueba de ausencia.
9. La prueba debe clasificar el acceso y su frontera, no solo buscar nombres de funciones: un wrapper puede abrir stores internamente.
10. No cerrar D1 hasta que la prueba exista, falle con fixtures de bypass y pase con el grafo permitido.

## 6. Lo que esta revisión sí y no demuestra

**Sí:** se inspeccionó el árbol completo no truncado y se clasificaron las 188 rutas JS/MJS/CJS por ubicación; los entrypoints y los callers directos conocidos están registrados. Los tests Nexo se distinguen del código productivo y los tests no Nexo no mostraron imports directos a stores/API Nexo.

**No:** no se ejecutó CI ni prueba arquitectónica; no se ha probado todavía el cierre transitivo de imports dinámicos/computados ni la ausencia de todos los bypasses por ejecución indirecta. Este documento es una base de allowlist para revisión, no una afirmación de seguridad ya lograda.

## 7. Estado y continuidad

- D1 = OPEN: el allowlist es borrador hasta revisión y prueba arquitectónica.
- D2 = OPEN: lock de raíz y locks de stores aún requieren decisión/characterization.
- D3 = OPEN: contrato `--root`, symlinks, bootstrap y migración siguen pendientes.
- Autorización = `NOT_EVALUATED`; legitimidad de raíz/dueño = `PENDING/UNKNOWN`; efectos protegidos = `STOP`.
- No modificar runtime/tests/workflows antes de cerrar D1/D2/D3.
