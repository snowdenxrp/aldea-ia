# NCS M0 — auditoría de entrypoints e aislamiento de Nexo/Lúmina

Fecha: 2026-10-19  
Tipo: revisión estática read-only; no cambia entrypoints, UI ni runtime.

## 1. Artefactos inspeccionados

- `package.json`
- `scripts/nexo.mjs`
- `scripts/nexo-chronicle-session.mjs`
- `src/nexo/application/index.mjs`
- `src/nexo/application/chronicle-append.mjs`
- `src/nexo/runtime.js`
- `src/main-stable.js`
- `index.html`
- `.github/workflows/nexo-deterministic-tests.yml`

## 2. Entry point de Nexo

- `package.json` declara `npm run nexo` como `node scripts/nexo.mjs`; el script `simulate` es independiente.
- `scripts/nexo.mjs` importa únicamente las consultas públicas de continuidad y enruta tres familias: `status`, `mission-status` y `chronicle-append`. El último delega al CLI `scripts/nexo-chronicle-session.mjs`.
- Los comandos desconocidos fallan cerrados. El CLI de Chronicle exige argumentos explícitos y contenido por stdin; la salida no imprime el contenido Chronicle ni rutas/errores crudos.
- `src/nexo/application/index.mjs` expone tres funciones: `runNexoChronicleAppend`, `loadNexoContinuityStatus` y `loadNexoMissionStatus`. No expone un dispatcher genérico.

## 3. Entry point visual actual

- `index.html` tiene título y HUD de Lúmina e importa `src/main-stable.js` junto con módulos de mundo/simulación/renderizado.
- En las importaciones revisadas de `src/main-stable.js` no aparece una conexión a la API pública Nexo ni al runtime owner-backed. No se cambió `index.html` ni se conectó Nexo a la interfaz.
- `src/nexo/runtime.js` sí contiene un runtime legacy que importa `assistants/memory.js` y `simulation-adapter.js`. Este módulo es arquitectónicamente distinto del runtime owner-backed. La inspección de los artefactos anteriores no basta por sí sola para probar que no exista otro import indirecto desde todos los entrypoints; hace falta inventario global de importadores antes de afirmar aislamiento total.

## 4. Límite de la conclusión

Evidencia suficiente para decir que el entrypoint CLI explícito de Nexo es estrecho y que el HTML principal sigue siendo de Lúmina sin una conexión Nexo visible en el módulo principal. No es suficiente para declarar completado el aislamiento total del runtime legacy. El hecho de que el módulo legacy exista y mezcle memoria antigua con adaptadores de simulación no justifica trasladar esa arquitectura a Nexo ni duplicar estado entre sistemas.

## 5. CI

`.github/workflows/nexo-deterministic-tests.yml` ejecuta `npm test` en push a `main` o mediante `workflow_dispatch`; no tiene trigger `pull_request`. Por ello, cambios en una rama NCS no obtienen automáticamente esta suite por PR. El contrato de aplicación conserva las referencias de workflows focales ya exitosos; esta auditoría documental no ejecutó CI nuevo.

No cambiar triggers como parte de esta auditoría: al usar `pull_request`, GitHub toma la definición del workflow de la rama base, por lo que un cambio solo en la rama de trabajo no valida por sí mismo el PR. Si se decide habilitar validación por PR, tratarlo como cambio de infraestructura CI separado, con alcance y revisión explícitos.

## 6. Siguiente paso verificable

Hacer un inventario de referencias/importadores de `src/nexo/runtime.js`, `src/nexo/simulation-adapter.js`, `assistants/memory.js` y los entrypoints de scripts/HTML, usando búsqueda de repositorio o análisis de imports estático reproducible. Clasificar cada ruta como:
- alcanzable desde entrypoint de producción,
- solo llamada por tests,
- CLI/manual,
- importada pero sin evidencia de ejecución.

No concluir "desconectado" solo porque el módulo no aparece en `src/main-stable.js`. No modificar legacy, UI ni runtime hasta que el inventario muestre una conexión concreta que requiera una decisión arquitectónica.

## 7. Estado

Auditoría parcial de entrypoints completada; inventario global aún pendiente. Sin cambios de runtime, UI ni CI. M0 INCOMPLETO; efectos protegidos STOP; Nexo/Lúmina separados.


## 8. Compatibilidad legacy y puente explícito de reparación

La inspección adicional de `scripts/assistants.mjs` y `scripts/nexo-runtime-session.mjs` detectó un puente de compatibilidad explícito: `scripts/assistants.mjs` solo llama `runNexoRuntimeRepairSession()` cuando se proporciona `--nexo-repair-once`. Ese puente selecciona una reparación del snapshot de continuidad Nexo, pero la reparación opera sobre `statePath` (`world-state.json`) mediante `scripts/nexo-repair-session.mjs` y `scripts/nexo-repair-entrypoint.mjs`. Esto es un acoplamiento legacy entre una misión construida a partir de informes de simulación y la mutación del estado de simulación.

La ruta está detrás de una bandera opt-in y no es el camino de la API pública Nexo ni del runtime owner-backed, que bloquea reparaciones antes del dispatch. Aun así, su existencia significa que no debe afirmarse que todo el repositorio está completamente libre de puente Nexo/Lúmina. Mantener esta ruta fuera del uso normal; no usarla para avanzar el nuevo Nexo independiente. Antes de retirarla o rediseñarla, revisar sus tests/contrato y obtener CI real. No borrar ni migrar automáticamente datos legacy como parte de esta auditoría.


## 9. Cobertura de integración ya existente — corrección de auditoría

La afirmación previa de que faltaba toda prueba de integración normal-vs-opt-in era incompleta y se corrige aquí. `tests/nexo/assistants-runtime-cli.test.mjs` ya ejecuta `scripts/assistants.mjs` como proceso hijo en directorios temporales aislados, tanto sin bandera como con `--nexo-repair-once`. Verifica que el modo normal no emite `nexoRuntimeSession` y deja `effectJournal` vacío; el modo opt-in crea y liquida una única obligación de reparación; y, tras reabrir el owner, un replay no vuelve a escribir el estado ni crea otra obligación. El workflow `.github/workflows/nexo-m0-repair-crash-cuts.yml` incluye este test como paso `Run isolated assistants runtime CLI regression`.

Por tanto, la cobertura básica normal-vs-opt-in, aislamiento con estado temporal y replay después de reinicio sí existe en el repositorio. `tests/nexo/entrypoint.test.mjs` por sí solo no la contiene, pero no es el único test relevante. CI histórico exacto verificado: [run 39144863235](https://github.com/snowdenxrp/aldea-ia/actions/runs/39144863235), SUCCESS sobre código/test SHA `1cd8dfd914fad7848df51eca0f4e0f75cff22264`; consulté el job y el paso `Run isolated assistants runtime CLI regression` concluyó SUCCESS. El commit `1cd8dfd...` cambió las aserciones de replay para aceptar el bloqueo conservador, no el dispatch inicial. Esto no demuestra aislamiento total de todos los módulos del repositorio, autoridad constitucional, atomicidad entre archivos ni validez general de la ruta legacy fuera del fixture cubierto. No se ejecutó CI nuevo durante esta corrección documental; este PASS es histórico y aplica al SHA indicado.


## 10. Migración inicial desde `persisted.nexoMemory`: frontera exacta

La revisión de `src/nexo/core/continuity-service.mjs` y `src/nexo/core/continuity-snapshot.mjs` precisa el comportamiento: `openNexoContinuityOwner()` consulta primero el archivo separado de continuidad. Solo si ese archivo devuelve `NEXO_CONTINUITY_STORE_NOT_FOUND` puede proyectar `legacyMemory` en el snapshot independiente e inicializar la tienda. Si el archivo existe, esa copia legacy no se mezcla ni se vuelve a escribir. Si no hay tienda ni `legacyMemory` y el caller no aporta `allowEmptyInitialization: true`, se bloquea con `NEXO_CONTINUITY_INITIAL_STATE_UNKNOWN`.

En `scripts/assistants.mjs`, `legacyMemory` procede de `persisted.nexoMemory`, cargado del estado de simulación, y se pasa a `openNexoContinuityOwner()`. Es, por tanto, un puente de migración inicial explícito en el entrypoint legacy, no una dependencia de la API pública Nexo ni una doble escritura después de inicializar. Esto reduce el alcance del acoplamiento, pero no lo elimina de la ruta de arranque legacy.

No cambiar ahora la semántica de migración: retirar el fallback sin una política de recuperación podría hacer que instalaciones antiguas pierdan acceso a su continuidad al faltar el archivo nuevo. La decisión futura debe separar tres casos: migración explícita de datos legacy, bootstrap realmente vacío demostrado por el caller, y tienda ausente con historia previa desconocida (STOP/UNKNOWN, nunca regeneración silenciosa). La cobertura de migración, precedencia de la tienda canónica, rechazo de tienda corrupta, ausencia de estado previo y bootstrap vacío explícito ya aparece en `tests/nexo/continuity-migration.test.mjs` (líneas 38–87 en el blob revisado) y `tests/nexo/continuity-contract.test.mjs` (líneas 675–700). No se justifica añadir pruebas duplicadas sin una brecha nueva demostrada.
