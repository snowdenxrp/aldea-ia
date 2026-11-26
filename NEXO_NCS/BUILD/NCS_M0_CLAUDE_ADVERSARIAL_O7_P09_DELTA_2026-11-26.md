# NCS M0 — Claude: auditoría adversarial O7/P09 y delta de escritores

Fecha: 2026-11-26
Rama documental: `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`
Snapshot estático auditado por Claude: `d8b5ca8720908d926acc18130614cce132a43b5d`
Base documental: `NCS_M0_P05_P07_WRITER_EXCLUSION_FRONTIER_AFTER_TERMUX_2026-11-26.md`
Contrato evaluado: `NCS_M0_O7_P07C_P05_CONTRACTS_COVERAGE_AND_ENFORCEMENT_2026-11-26.md`
Tipo: informe independiente recibido de Claude; delta documental y clasificación provisional. No es implementación, prueba propia de GPT, ratificación del propietario ni autorización.

## 1. Resultado ejecutivo

Claude concluye que O7 no puede cerrarse con el contrato actual. El hallazgo más severo es RAW-1: Claude informa haber reproducido en una copia de scratchpad que `scripts/assistants.mjs`, configurado con `NEXO_LUMINA_MEMORY_PATH` apuntando al archivo de Continuity, lo sobrescribe mediante `fs.writeFile` y termina con código 0.

La lectura independiente de los archivos fuente en esta rama confirma la ruta estática: `MEMORY_PATH` se resuelve desde `process.env.NEXO_LUMINA_MEMORY_PATH` y el script ejecuta `fs.writeFile(MEMORY_PATH, ...)` sin que en ese tramo aparezca admisión de Continuity, lock, rename ni validación de alias. La reproducción dinámica y sus hashes se atribuyen al informe de Claude; no se repitieron aquí.

**Clasificación provisional:** O7 = CONTRADICTED para cualquier claim que incluya esa configuración y ese archivo como objeto protegido, salvo que una decisión explícita y justificada delimite el entorno de configuración como confiable y demuestre una exclusión efectiva. La evidencia Termux UNSET no elimina la capacidad.

## 2. Hallazgos recibidos y clasificación

### H1 — RAW-1: Lúmina puede sobrescribir Continuity por alias de entorno

- Estado de Claude: CONFIRMED, reproducción dinámica en scratchpad.
- Fuente: `scripts/assistants.mjs`, blob `5d773332acf1f762ea9e2eb48dfcf5a5267470d6`.
- Evidencia estática leída en la rama: `NEXO_LUMINA_MEMORY_PATH` determina `MEMORY_PATH`; posteriormente `fs.writeFile(MEMORY_PATH, JSON.stringify(learned, ...))`.
- Consecuencia: actor no-Nexo en P09 puede ser escritor relevante para O7 por alias.
- Clasificación NCS: **CONTRADICTED** si el claim incluye esta capacidad sin enforcement/exclusión demostrada; de otro modo, **UNKNOWN/STOP** hasta ratificar alcance y demostrar exclusión.
- No se considera suficiente que la variable apareciera UNSET en una captura Termux.

### H2 — RAW-2: persistState trata estado no reconocido como revisión cero

- Estado de Claude: CONFIRMED a nivel API y reproducción dinámica en scratchpad; alcance de producción PARTIAL/UNKNOWN.
- Fuente: `scripts/simulate.mjs`, blob `ec322cdff76392d7c99a4f45bf35f76a8b91b667`.
- Evidencia estática leída: `loadState()` captura errores y devuelve world-state predeterminado con `stateRevision: 0`; `persistState()` usa por defecto `loadCurrentState = loadState` y compara la revisión resultante antes de escribir/renombrar el payload.
- Claude informa que `createPersistStateConditionalCommit` invoca esta ruta; no encontró caller de producción en el snapshot.
- Adapter: `src/nexo/adapters/conditional-commit-persist-state.mjs`, blob `d6dc517f9c7841a957749804d612fbfe6e66c9a6`.
- Clasificación NCS: **CONTRADICTED** para la propiedad general “ilegibilidad no autoriza”; **UNKNOWN/PARTIAL** para exposición efectiva desde callers de producción.
- No se eleva a actor activo del despliegue sin probar el caller/grafo.

### H3 — Workflow de Lúmina con permiso de escritura al repositorio

- Estado de Claude: CONFIRMED por código.
- Fuente: `.github/workflows/lumina-simulation.yml`, blob `e11a11b5101c992396737f3520c427c2c6c4f350`.
- Evidencia leída: cron cada cinco minutos, push a main, `permissions: contents: write`, ejecución de `npm run assistants` y `npm run simulate`, y commit/push de `world-state.json` y `.lumina-assistant-memory.json`.
- Límite importante: el workflow es un actor escritor del repositorio/estado Lúmina, pero la lista de archivos añadidos no demuestra que escriba directamente el archivo de Continuity. Además corre en GitHub Actions, fuera del R1 Android/Termux/foreground aceptado.
- Clasificación NCS: **CONFIRMED** como actor externo que escribe estado del repositorio; **OUTSIDE R1 / EXCLUSION NOT DOCUMENTED** respecto al claim R1; **UNKNOWN** en cuanto a impacto indirecto sobre un objeto Continuity desplegado. No clasificarlo como escritor directo de Continuity sin evidencia adicional.

### H4 — Chronicle omitido del inventario

- Estado de Claude: omisión CONFIRMED; alias destructivo directo no confirmado.
- Fuentes:
  - `src/nexo/core/chronicle-store.mjs`, blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.
  - `scripts/nexo-chronicle-session.mjs`, blob `30a53de2f108aa255a1dfd61ce78c19788de160b`.
  - `scripts/nexo.mjs`, blob `e471eb478a09aa8a9a8323795583e198cdf0a127`.
- Evidencia estática: Chronicle tiene lock derivado de path, temporales y limpieza por prefijo; su CLI acepta `--continuity` y `--chronicle`. El dispatcher Nexo invoca `nexo-chronicle-session`.
- Reproducción de Claude: al apuntar Chronicle al archivo Continuity, `chronicle.loadCurrent(P)` rechaza el esquema con `NEXO_CHRONICLE_SCHEMA_UNKNOWN`. Esto prueba el rechazo de lectura; no prueba que Chronicle sobrescriba el archivo Continuity.
- Riesgo adicional condicionado: si los paths coinciden, los nombres de lock/temporales pueden colisionar y operaciones de coordinación/limpieza pueden interactuar. Debe analizarse contra el alcance exacto de objeto protegido y las funciones completas de append.
- Clasificación NCS: **CONFIRMED** como actor/entrypoint y omisión del inventario; **PARTIAL/UNKNOWN** para capacidad de mutar el objeto Continuity por alias; **UNKNOWN** para dirección inversa de lectura, no ejecutada.

### H5 — Paths de Continuity suministrados por callers y symlink no reclamado

- Estado de Claude: CONFIRMED por código.
- Fuentes: `continuity-store.mjs` blob `c1eb81bf74d2df576079b3269ac4db22d87fe7b6`; `chronicle-store.mjs` blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.
- Evidencia: ambos módulos declaran que `filePath` es trusted configuration, no sandbox boundary, y que no reclaman resistencia a symlink/path attacks.
- Entry points señalados: `nexo.mjs`, `nexo-chronicle-session.mjs`, `nexo-continuity-bootstrap.mjs`.
- Clasificación NCS: **CONFIRMED** como supuesto explícito del código; el claim de resistencia a symlink/path attack permanece **NOT CLAIMED / UNKNOWN**, no debe inferirse.

### H6 — Lecturas que adquieren y modifican lock

- Estado de Claude: CONFIRMED por lectura estática; no reproducción dinámica.
- Fuente: `continuity-store.mjs`, blob `c1eb81bf74d2df576079b3269ac4db22d87fe7b6`.
- Evidencia: `loadCurrent()` adquiere lock antes de leer; adquisición crea entradas del lock y puede observar/requerir recuperación ante lock stale.
- Consecuencia: “solo lectura” no significa ausencia de mutación en el namespace de coordinación.
- Clasificación NCS: **CONFIRMED** como comportamiento estático; su efecto exacto en O7 depende de si el contrato incluye lock/auxiliares en el objeto protegido.

### H7 — Limpieza de temporales por nombre/prefijo

- Estado de Claude: CONFIRMED por código; impacto condicionado a colisión de nombres.
- Fuentes: `continuity-store.mjs` blob `c1eb81bf74d2df576079b3269ac4db22d87fe7b6`; `chronicle-store.mjs` blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`; `simulate.mjs` blob `ec322cdff76392d7c99a4f45bf35f76a8b91b667`.
- Evidencia: barridos de directorio que seleccionan nombres `.tmp` / `.tmp-*` y luego ejecutan `rm`.
- Consecuencia: incluirlo en análisis B2/O4 solo cuando se demuestre que el namespace compartido permite afectar un temporal ajeno o sustituto. No afirmar explotación efectiva sin contraejemplo.

### H8 — Corrección del inventario de variables de entorno

- Estado de Claude: CONFIRMED según barrido del snapshot.
- `NEXO_STATE_PATH` y `NEXO_LUMINA_MEMORY_PATH` aparecen en `assistants.mjs`; `NEXO_CONTINUITY_PATH` solo aparece en tests según el barrido de Claude.
- `simulate.mjs` no lee directamente `NEXO_STATE_PATH`; el CLI normal usa su ruta predeterminada.
- Pendiente de corroboración exhaustiva independiente: búsqueda global de referencias en el snapshot completo. No convertir el resultado del barrido de Claude en afirmación universal sin reproducir método/rango.

### H9 — Exclusiones positivas limitadas

- Estado de Claude: hallazgo de alcance bajo.
- La inspección de `MainActivity.kt` indicaría escritura a `model.gguf` en `filesDir`, sin referencia a Continuity/Chronicle. Esto puede excluir ese actor/archivo concreto si se confirma el alcance.
- Una búsqueda sin primitivas en `functions/api/capture.js` es UNKNOWN, no exclusión positiva.

## 3. Efecto sobre obligaciones

| Obligación | Estado heredado | Efecto del informe Claude |
|---|---|---|
| O1 | GAP | Sin cambio; exige análisis de BLOCKED durable. |
| O2 | CONTRADICTED-CODE/GAP | Sin cambio; los nuevos hallazgos no resuelven el lifecycle del lock. |
| O3 | UNKNOWN | Añadir alias/path y objetos Chronicle a escenarios de identidad; target real sigue UNKNOWN. |
| O4 | CONTRADICTED-CODE/GAP | H7 añade rutas de limpieza por prefijo que requieren análisis de sustitutos. |
| O5 | CONTRADICTED-CODE/GAP | H1/H2 refuerzan que ausencia/ilegibilidad no deben tratarse como autorización. |
| O6 | GAP | Sin cambio; procedimiento de reclasificación sigue sin aprobarse. |
| O7 | UNKNOWN heredado | **CONTRADICTED para el claim amplio que incluye RAW-1 sin enforcement/exclusión**; de otro modo UNKNOWN/STOP hasta delimitar el alcance. |
| O8 | UNKNOWN | Sin cambio; fingerprint/actores/permisos no quedan cerrados. |
| O9 | PARTIAL | Sin cambio; no resuelve readmisión. |
| P09 | UNKNOWN/OPEN | No se cierra; H1 es no-Nexo y muestra por qué P09 no sustituye O7. |
| P07-C/P05 | UNKNOWN/BLOCKING; P05-C política ratificada, P05 OPEN | Sin cambio de cierre; H2/H5/H6/H7 añaden requisitos de evaluación B1–B5. |
| C3/G2 | DECISIÓN DEL PROPIETARIO RESUELTA | No reabrir. Aplicar el oráculo ya ratificado por rol del inode. |

## 4. Correcciones documentales que se desprenden

1. Corregir la clasificación de RAW-1: capacidad no solo estática; Claude informa reproducción dinámica y el código fuente confirma la escritura por path configurable.
2. Mantener separado “alias no observado en shell capturado” de “capacidad inexistente”.
3. Incorporar Chronicle y sus entrypoints al inventario O7/P09 sin afirmar todavía que el alias Chronicle sobrescribe Continuity.
4. Añadir workflow CI como actor externo de escritura del repositorio, fuera de R1; documentar explícitamente la exclusión de ese entorno y no atribuirle escritura directa de Continuity sin evidencia.
5. Añadir a B1/B2 la confianza declarada en `filePath`, los límites de symlink/path attacks, namespace de locks y temporales, y la limpieza por prefijo.
6. Añadir a B3 la ruta `persistState`/revisión cero como contraejemplo de API, con estado de caller de producción aún UNKNOWN.
7. Añadir una clase “lectura con mutación de coordinación” para que loadCurrent no se clasifique como actor sin efectos.
8. No ratificar O10 todavía. La propuesta de Claude para O10 (fail-open de persistState) queda como candidato de obligación adicional, pendiente de reconciliar con O1–O9 y el modelo de alcance.

## 5. Trabajo documental pendiente antes de una nueva clasificación

- Definir con autoridad qué integra el “objeto protegido”: solo archivo Continuity, o también lock, temporales, Chronicle, world-state, directorio padre y metadatos relevantes.
- Resolver si la configuración por entorno/argv forma parte del perímetro confiable R1 o si debe tratarse como input no confiable. No asumir ninguna respuesta.
- Determinar si Chronicle está incluido como activo protegido o solo como actor/namespace auxiliar.
- Completar el grafo de callers de `persistState`, incluyendo el adapter conditional-commit, sin inferir caller de producción.
- Verificar si el workflow CI puede influir indirectamente en el objeto protegido del despliegue R1; por ahora solo se demuestra escritura del repositorio.
- Evaluar la dirección inversa de alias Chronicle/Continuity y los efectos de colisión lock/temp solo si aportan evidencia nueva y acotada.
- Incorporar evidencia positiva para exclusiones de actores individuales; búsquedas vacías permanecen UNKNOWN.

## 6. Límites y estado

- Este informe preserva lo reportado por Claude y la lectura estática de los archivos fuente citados.
- No se repitieron las reproducciones dinámicas de Claude.
- No hubo cambios de código, configuración, dispositivo, tests, CI, workflows ni bootstrap.
- No se eligió ninguna primitiva.
- No se modificó PR #110 ni ramas de producto.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos y commissioning: **STOP**.
- M0: **INCOMPLETO**.
