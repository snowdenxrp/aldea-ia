# NCS M0 — recheck de argumentos Chronicle y superficies de store
Fecha: 2026-10-25
Rama revisada: `ncs-clean-architecture`

## Alcance
Revisión estática acotada de los contratos actuales de CLI, aplicación y stores. No se ejecutaron pruebas ni CI; no se modificó runtime, tests, workflows ni datos operativos.

## Snapshot de fuentes
- `scripts/nexo.mjs`: blob `e471eb478a09aa8a9a8323795583e198cdf0a127`
- `scripts/nexo-chronicle-session.mjs`: blob `30a53de2f108aa255a1dfd61ce78c19788de160b`
- `src/nexo/application/chronicle-append.mjs`: blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`
- `src/nexo/application/continuity-queries.mjs`: blob `e1915e94e53e71d37a37952fead37ba62bdae79a`
- `src/nexo/core/continuity-service.mjs`: blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`
- `src/nexo/core/continuity-store.mjs`: blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`
- `src/nexo/core/chronicle-store.mjs`: blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`

## Hechos observados

### 1. Padre CLI
`parseNexoEntrypointArguments()` admite `--continuity` en status, mission-status, mission-plan y previews. No exige `--root`. Para `chronicle-append`, devuelve `args: argv.slice(1)` y delega al script hijo mediante `spawnSync(process.execPath, [chronicleEntrypoint, ...parsed.args], ...)`. Por tanto, el padre reenvía los argumentos de Chronicle sin convertirlos a una única raíz canónica.

### 2. Hijo Chronicle
`parseNexoChronicleArguments()` admite `--continuity`, `--chronicle`, `--mission`, `--step`, `--initialize-continuity`, `--initialize-chronicle` y `--content-stdin`. No admite `--root` en el snapshot observado. El hijo puede ejecutarse directamente y llama a `runNexoChronicleAppend({ ...args, content })`. La función de aplicación acepta rutas separadas y flags de inicialización; hace preflight de ambos stores antes de inicializar, pero el preflight sigue siendo acceso persistente antes de cualquier contrato de admisión raíz explícita demostrado en esta ruta.

### 3. Consultas
`loadNexoContinuityStatus()`, `loadNexoMissionStatus()` y `loadNexoMissionPlan()` construyen directamente un store a partir de `continuityPath` y llaman a `loadCurrent()`. En las funciones revisadas no se observa una admisión previa basada en `--root`. El CLI puede ser el caller conocido, pero la exportación de funciones en el módulo de aplicación permite importación desde otros módulos; no se ha demostrado un límite técnico que prohíba esa importación.

### 4. Fábricas y owner
`createNexoContinuityStore()` y `createNexoChronicleStore()` exportan fábricas públicas que devuelven operaciones `loadCurrent` y de mutación. Sus comentarios definen `filePath` como configuración de confianza, no como sandbox. `openNexoContinuityOwner()` exporta la apertura del owner y puede inicializar desde `legacyMemory` o con `allowEmptyInitialization` si el caller suministra esas opciones. No se observa en estos contratos una verificación de raíz canónica/admisión de entrypoint.

### 5. Búsqueda de callers
La búsqueda dirigida del índice de GitHub para los nombres de fábricas/owner/función de aplicación no devolvió resultados utilizables. Esa ausencia no demuestra ausencia de callers. Los usos de prueba y las importaciones indirectas no quedan clasificados exhaustivamente por esta búsqueda. No se declara cerrado el grafo.

## Consecuencias de diseño

1. El contrato padre/hijo debe transportar una única raíz explícita canónica, no pares independientes de rutas store. El hijo debe volver a validar raíz y mapping, incluso en invocación directa.
2. Deben rechazarse antes de cualquier lectura persistente los argumentos faltantes, ambiguos o contradictorios y los flags de inicialización incompatibles con operación normal.
3. La admisión no puede limitarse al dispatcher CLI: las funciones exportadas de aplicación y las fábricas/owner necesitan una clasificación explícita de quién puede llamarlas y bajo qué precondición.
4. No se recomienda todavía añadir un token/contexto como solución suficiente: antes hay que definir su emisor, vínculo con la raíz, ciclo de vida y cómo se impide su omisión por callers directos.
5. La no reentrancia y el deadlock padre/hijo deben resolverse por contrato de propiedad/espera en D1; la primitiva concreta, sección crítica, release incierto y pruebas de concurrencia corresponden a D2.

## Clasificación actual
- CLI padre y CLI hijo: `PUBLIC/PRODUCTION ENTRYPOINT` observado.
- Funciones de consultas exportadas de aplicación: `PUBLIC API; admission boundary not demonstrated`.
- Fábricas de store y apertura del owner: `EXPORTED LOW-LEVEL API; caller reachability incomplete`.
- Consumidores dinámicos, computados, tests completos y consumidores externos: `UNKNOWN/BLOCKED`.

## Bloqueadores D1-DESIGN
- Contrato de `--root` y mapping a rutas de stores aún no implementado ni probado; D1 debe congelar su semántica antes de implementación.
- No hay prueba de que todas las lecturas persistentes de queries/previews/Chronicle entren por admisión.
- No hay clasificación exhaustiva de callers de fábricas/owner ni de importaciones indirectas/dinámicas.
- No está decidido por el propietario A/B/C; la recomendación B de Gemini no es ratificación.
- Debe mantenerse la separación Lúmina/Nexo sin eliminar la persistencia legítima de Lúmina.

## Estado canónico
M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; D2/D3 `OPEN`; Authorization `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

Este informe registra hallazgos documentales, no garantía de enforcement de runtime.
