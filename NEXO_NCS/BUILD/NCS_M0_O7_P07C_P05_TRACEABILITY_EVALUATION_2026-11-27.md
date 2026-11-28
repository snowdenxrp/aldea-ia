# NCS M0 — Trazabilidad O7 / P07-C / P05 contra contratos de cobertura y enforcement

**Fecha:** 2026-11-27  
**Rama:** `ncs-m0-o7-p07c-traceability-2026-11-27`  
**Base documental:** `ncs-p07c-writer-reader-inventory-d8b5ca8-2026-11-26`  
**Snapshot de producto al que se limita la evidencia estática:** `d8b5ca8720908d926acc18130614cce132a43b5d`  
**Tipo:** evaluación documental de trazabilidad; no es ratificación normativa, selección de mecanismo, implementación, prueba ni cierre de gate.

## 0. Autoridad, alcance y límites

La declaración constitucional V2.1 de autorización de trabajo técnico quedó ratificada por el propietario y preservada en el commit `7d89f37f14f81c9eb25e051515a91d3e931cd13d`. Esa autorización permite continuar el trabajo necesario para M0 dentro de contratos ratificados y sus salvaguardas.

Esta evaluación no interpreta esa autorización como ratificación de P07 V2.3, del contrato propuesto O7/P07-C/P05 del 2026-11-26 ni de una primitiva concreta. P07 V2.3 conserva el estado documental **NO RATIFICADO**. La ratificación V2.1 tampoco cambia `authorization: NOT_EVALUATED`, no cierra M0 y no levanta commissioning/protected-effects STOP.

Se preservan las decisiones previas del propietario:
- R1: Android sandbox + HOME privado de Termux + operación manual en foreground; root/OS comprometido y procesos maliciosos con el mismo UID quedan fuera del modelo declarado.
- P05-C: política ratificada; ante incertidumbre se conserva UNKNOWN/BLOCKED, sin recuperación automática ni cleanup/readmisión no atribuibles.
- P07-C: cualquier desplazamiento temporal del nombre protegido o modificación de `nlink` cuenta como afectación aunque después se restaure.
- C3/G2: decisión resuelta; clasificar el rol del inode antes de interpretar `nlink`.
- P08: mapping root→stores ratificado; implementación pendiente.
- P09: universo declarado ratificado (repositorio/package, entrypoints, procesos hijos, workflows y launchers declarados); loaders dinámicos y consumidores externos no identificados siguen UNKNOWN. No existe claim universal.

## 1. Fuentes y precedencia

| ID | Fuente | Identificador / alcance |
|---|---|---|
| S1 | Frontera de exclusión de escritores tras Termux | blob `864296afb12a10642799a010ef7d7378f0d7c2cd`; snapshot `d8b5ca8` |
| S2 | Contratos documentales O7 y P07-C/P05 | blob `43f83749350705c1e1cfc698032652b27228acf4`; propuesta, no ratificada |
| S3 | Auditoría adversarial Claude O7/P09 | commit `340a61b4abf52f5740c8180f4bb2c58a01a9ada3`; reproducción dinámica atribuida a Claude, no repetida aquí |
| S4 | Reconciliación estática lock/release | blob `e6546c03d84d34dba976442c524c60e1c0f47d19`; snapshot `d8b5ca8` |
| S5 | P07 V2.2 normativa | blob `7ce10f7e02516da4438358c3d637a275001c6019`; propuesta documental |
| S6 | P07 V2.3 delta normativa | blob `0289f4e5f8e6412d593515a61078e27ff8e489bb`; NO RATIFICADA |
| S7 | Ratificación constitucional V2.1 | commit `7d89f37f14f81c9eb25e051515a91d3e931cd13d`; autoriza trabajo M0 delimitado, no ratifica P07 V2.3 |

Las fuentes S1–S6 describen evidencia y propuestas limitadas al snapshot/fecha indicados. Ninguna se transforma en evidencia del HEAD actual ni en prueba de runtime.

## 2. Contrato A — Trazabilidad de cobertura O7/P09

### 2.1 Alcance R1, activos, ventana y exclusiones (A1)

| Dimensión | Evidencia disponible | Estado |
|---|---|---|
| Entorno R1 | R1 aceptado por el propietario: Android sandbox, HOME privado Termux, invocación manual foreground | DECIDED / SCOPE LIMITED |
| Ventana | Transcripciones Termux del 2026-11-26 son capturas puntuales; no demuestran exclusividad sostenida | PARTIAL |
| Activo primario | Store Continuity por path; el target efectivo y su fingerprint reproducible no están ligados a un SHA de ejecución | UNKNOWN |
| Auxiliares | Locks, temporales, Chronicle, world-state y directorio padre aparecen en las rutas de coordinación/escritura; el perímetro constitucional exacto de “objeto protegido” no está resuelto en esta evidencia | UNKNOWN |
| Exclusiones | Root/OS comprometido y actores hostiles del mismo UID fuera de R1; workflow GitHub Actions fuera de R1 | DECIDED para límite R1; impacto indirecto no evaluado |
| Universo | P09 acota el universo declarado, pero deja loaders dinámicos y consumidores externos no identificados como UNKNOWN | OPEN / LIMITED |

**Resultado A1:** el límite de entorno está definido, pero el claim de cobertura necesita declarar el activo exacto, sus auxiliares relevantes y una ventana verificable. No hay base para un claim universal.

### 2.2 Inventario de actores y capacidades (A2–A3)

| Actor / ruta | Capacidad observada o reportada | Admisión común demostrada | Clasificación y efecto |
|---|---|---|---|
| APIs/callers Nexo de Continuity | Las cinco queries path-based leen Continuity directamente; Chronicle realiza pre-read de stores antes de abrir owner, según reconciliación estática | NO DEMOSTRADA en esos seams | P09 OPEN; D1–D6 ratificadas no equivalen a enforcement |
| Bootstrap Continuity | Entry point dedicado declarado en package/inventario | Cobertura de invocación y convergencia efectiva no cerrada | UNKNOWN/PARTIAL |
| RAW-1: `scripts/assistants.mjs` | `NEXO_LUMINA_MEMORY_PATH` puede dirigir `fs.writeFile()` al path del store Continuity; Claude reportó reproducción dinámica en scratchpad; la lectura estática confirma la ruta configurable | No; no se observó admisión de Continuity en ese tramo | Escritor condicional estático CONFIRMADO; alias no observado en shell capturado; O7 permanece UNKNOWN y el claim amplio queda CONTRADICTED si incluye esa configuración sin exclusión/enforcement |
| RAW-2: `scripts/simulate.mjs` / `persistState()` | Acepta path suministrado; ruta de estado inválido puede devolver revisión cero y permitir persistencia por ruta | No demostrada | Capacidad estática CONFIRMADA; caller de producción UNKNOWN/PARTIAL; no afirmar actor activo en despliegue |
| Workflow Lúmina CI | Workflow con `contents: write`, cron y escritura de archivos de estado del repositorio | No es actor R1; no se demuestra escritura directa del store Continuity | Actor de escritura del repositorio CONFIRMADO; impacto indirecto en Continuity UNKNOWN |
| Chronicle CLI / sesión | Entry points, locks y temporales propios; alias de path posible; rechazo de esquema al leer el archivo Continuity reportado por Claude | No demostrada en todas las rutas | Entry point/actor confirmado; mutación directa por alias NO DEMOSTRADA; colisión de auxiliares condicionada |
| `loadCurrent()` | Adquiere lock y puede modificar namespace de coordinación durante una lectura | No equivale a lectura sin efectos | Clase “lectura con mutación de coordinación”; incluir en inventario de actores |
| Limpieza de temporales | Barridos por nombre/prefijo `.tmp` / `.tmp-*` en fuentes Continuity/Chronicle/simulate | Atribución de cada temporal no demostrada | Riesgo O4 condicionado a colisión/sustitución; no afirmar explotación sin contraejemplo |
| Launchers locales / jobs / servicios | Capturas Termux no observaron coincidencias para los patrones consultados; búsqueda limitada a nombres concretos | No demostrado | No observados en esa captura; ausencia global UNKNOWN |
| Loaders dinámicos / consumidores externos | P09 los deja expresamente fuera del universo identificado | No demostrado | UNKNOWN; impide claim universal |

No convertir `UNSET` en una captura, ausencia de coincidencias, o ausencia de proceso en una prueba de inexistencia de actor. No confundir P09 (grafo de callers Nexo) con O7 (todos los actores capaces de afectar el activo protegido).

### 2.3 Evaluación de criterios de salida O7 (A4–A5)

| Criterio | Estado | Motivo |
|---|---|---|
| Alcance R1 explícito | PARTIAL-SATISFIED | Modelo R1 aceptado; activo/auxiliares y ventana aún requieren precisión |
| Inventario reproducible del universo declarado | PARTIAL | Hay inventario y capturas; quedan launchers habilitables, loaders y consumidores externos UNKNOWN |
| Paths/aliases controlados | NOT SATISFIED | RAW-1/RAW-2 son capacidades configurables; no existe exclusión efectiva demostrada |
| Todo escritor incluido bajo enforcement común | NOT SATISFIED | Escritores RAW no usan necesariamente admisión Nexo |
| Ningún actor relevante sin clasificación | NOT SATISFIED | Chronicle/auxiliares, dinámicos y consumidores externos tienen UNKNOWN |
| Claim O7 universal dentro de R1 | UNKNOWN / STOP | No se satisface A1–A5; la evidencia actual no permite declarar CLOSED |

**Resultado A:** O7 permanece **UNKNOWN / OPEN**. P09 permanece **OPEN / UNKNOWN** en cobertura efectiva dentro del universo ratificado. Si el claim se formula incluyendo RAW-1 con el path configurable capaz de alcanzar Continuity y sin exclusión efectiva, existe contradicción positiva para ese claim amplio; la captura Termux solo demuestra que el alias no estaba configurado en ese shell/instante.

## 3. Contrato B — Trazabilidad P07-C/P05

### 3.1 Identidad de coordinación y activo protegido (B1)

- La reconciliación estática identifica locks derivados de paths y validación de owner token; no demuestra que la identidad validada sea la del objeto que finalmente se elimina.
- El snapshot de código usa paths configurables en algunos entrypoints; el contrato de los módulos declara `filePath` como trusted configuration, no como sandbox boundary.
- No hay fingerprint reproducible del target R1 ligado a un SHA de ejecución.
- R-OBJ y R-NAME deben mantenerse separados; dirfd/fd no prueba por sí solo continuidad del nombre aprobado.
- El perímetro exacto entre archivo Continuity, lock, temporales, Chronicle, world-state y directorio padre sigue sin resolución suficiente.

**B1: UNKNOWN / PARTIAL; no PASS.**

### 3.2 Cleanup/release replacement-safe (B2)

- Continuity y Chronicle validan token y luego limpian `rm(lockPath, { recursive: true })` por nombre, según S4.
- La comprobación por nombre/token no vincula atómicamente el objeto validado con el objeto eliminado.
- La limpieza de temporales por prefijo añade superficies de sustitución/atribución que deben evaluarse por objeto y handler exacto.
- La regla del propietario exige conservar el residuo ante atribución incierta; no se permite cleanup por nombre, PID, token o antigüedad aislados.

**B2: CONTRADICTED-CODE / GAP para el seam de cleanup observado; P07-C no cerrado.**

### 3.3 BLOCKED durable (B3)

- `lockReleaseFailures` de Continuity es process-local en el snapshot inspeccionado.
- Los seams descritos incluyen tratamiento de ENOENT/ausencia que puede limpiar el marcador local y permitir nueva adquisición.
- Un lock efímero coordina mientras vive; no demuestra estado BLOCKED observable tras crash por una nueva invocación.
- No existe evidencia de persistencia durable del bloqueo independiente del proceso.

**B3: CONTRADICTED-CODE / GAP en los seams identificados; O1/O5 siguen abiertos/contradichos según el claim.**

### 3.4 Recuperación y reclasificación (B4)

- P05-C prohíbe recuperación automática y readmisión sin atribución/evidencia suficiente.
- No se ha demostrado un procedimiento aprobado y operativo para reclasificar UNKNOWN/BLOCKED.
- La autoridad de reclasificación no puede derivarse de PID, antigüedad, lock, caller o mecanismo.

**B4: GAP / UNKNOWN; O6 no satisfecho.**

### 3.5 Crash consistency (B5)

- O1–O9 definen obligaciones y crash windows, pero el mecanismo candidato no está seleccionado.
- No hay evidencia completa de orden durable entre adquisición, persistencia, publicación, release/cleanup, bloqueo y nueva admisión.
- Las observaciones Termux no son crash tests; CI de software no prueba durabilidad de filesystem ni power-loss.
- No se presume fsync de archivo/directorio, atomicidad ni durabilidad física.

**B5: UNKNOWN / GAP; no se puede afirmar crash consistency.**

### 3.6 Criterio de salida P07-C/P05 (B6)

| Condición | Estado |
|---|---|
| B1 identidad ligada al objeto realmente operado | UNKNOWN/PARTIAL |
| B2 cleanup replacement-safe | CONTRADICTED-CODE/GAP |
| B3 BLOCKED durable e interproceso | CONTRADICTED-CODE/GAP |
| B4 reclasificación aprobada | GAP |
| B5 crash windows demostradas | UNKNOWN/GAP |
| O7 cobertura de writers | UNKNOWN/OPEN |

**Resultado B:** P07-C permanece **UNKNOWN / BLOCKING**; P05 permanece **OPEN** (P05-C RATIFICADA como política). No existe mecanismo seleccionado. No autorizar cleanup real, readmisión ni una implementación basada en una primitiva inferida.

## 4. Reconciliación O1–O9 y C3

| Obligación | Estado heredado | Trazabilidad en esta evaluación | Acción probatoria pendiente |
|---|---|---|---|
| O1 | GAP | B3: no hay BLOCKED durable tras terminar el dueño | Demostrar persistencia y observabilidad por nueva invocación |
| O2 | CONTRADICTED-CODE/GAP | Predicados PID/edad observados en rutas de lock; cobertura completa no demostrada | Evaluar contra contrato ratificado, sin inferir expiración segura |
| O3 | UNKNOWN | B1: target real/fingerprint y aliases no cerrados | Identificar activo/target y contexto R1 reproducible |
| O4 | CONTRADICTED-CODE/GAP | B2: cleanup por nombre después de validación; temporales por prefijo | Demostrar vínculo replacement-safe objeto comprobado→objeto afectado |
| O5 | CONTRADICTED-CODE/GAP | B3: ausencia/ENOENT y reintento/readmisión en seams descritos | Demostrar no-readmisión ante ausencia/sustitución/ilegibilidad/crash |
| O6 | GAP | B4: no hay procedimiento aprobado de reclasificación | Definir procedimiento y autoridad antes de cualquier recuperación |
| O7 | UNKNOWN/OPEN | A2–A5: writers condicionales, launchers y consumidores sin cierre | Delimitar claim R1, inventario reproducible y enforcement/exclusión |
| O8 | UNKNOWN | R1 aceptado, pero target fingerprint/actores/permisos no ligados a ejecución | Evidencia de target y permisos ligada a SHA/entorno |
| O9 | PARTIAL | Separación negocio/release observada en rutas concretas; readmisión no resuelta | Completar trazabilidad de release y readmisión contra P05-C |
| C3/G2 | DECISIÓN RESUELTA | Aplicar clasificación por rol del inode; cualquier delta de nlink del objeto protegido cuenta como afectación | No reabrir decisión; aplicar el oráculo en fixtures futuros |

## 5. Discrepancias y no-repetición

1. El informe Claude S3 conserva una reproducción dinámica en scratchpad atribuida a Claude. Esta evaluación no la repite ni la presenta como ejecución independiente de GPT.
2. La evidencia Termux S1 reduce el claim de alias activo en el shell capturado; no revoca la capacidad estática RAW-1/RAW-2.
3. El actor de workflow CI escribe estado del repositorio, pero no hay evidencia de que escriba directamente el archivo Continuity desplegado.
4. El rechazo de esquema de Chronicle al leer un path de Continuity no prueba por sí solo que Chronicle sobrescriba ese archivo.
5. No repetir: inventario genérico Termux, búsqueda limitada de `assistants.mjs|simulate.mjs`, barrido estático lock/release del mismo snapshot, reconciliaciones P08/P09 ni mapeo P03/P04 ya citados. Reabrir solo ante SHA/ruta/caller/actor nuevo o evidencia que contradiga un hallazgo concreto.

## 6. Decisión técnica de esta evaluación

- No seleccionar `flock`, `F_SETLK`, `F_OFD_SETLK`, dirfd/openat2, marker, lock hermano, tombstone, epoch, daemon ni journal.
- No diseñar un mecanismo para “hacer pasar” O1–O9.
- No convertir detección, STOP o retención en prevención/serialización.
- No implementar P07 V2.3 ni tratarla como normativa ratificada.
- Mantener V2.2 como base de propuesta y V2.3 como delta documental no ratificada; antes de que cualquier delta normativa sea aplicable debe existir ratificación expresa del propietario.
- La siguiente decisión técnica no es escoger una primitiva: es cerrar la definición del activo protegido y del claim O7 dentro del R1 ya aceptado, y resolver las contradicciones positivas de B2/B3 contra el contrato aplicable.

## 7. Estado de salida

- O7: **UNKNOWN / OPEN**; claim amplio que incluye RAW-1 sin exclusión/enforcement: **CONTRADICTED**.
- P09: **OPEN / UNKNOWN** dentro del universo declarado; loaders dinámicos y consumidores externos no identificados permanecen UNKNOWN.
- P07-C: **UNKNOWN / BLOCKING**.
- P05-C: **RATIFICADA**; P05: **OPEN**.
- O1/O4/O5: **GAP / CONTRADICTED-CODE** en seams identificados.
- O6: **GAP**.
- O2: **CONTRADICTED-CODE/GAP**.
- O3/O8: **UNKNOWN**.
- O9: **PARTIAL**.
- C3/G2: **DECISIÓN RESUELTA**.
- E2/E3: **PARTIAL / NOT CLOSED**.
- `authorization: NOT_EVALUATED`.
- Commissioning / protected effects: **STOP**.
- NCS M0: **INCOMPLETO**.

Esta evaluación es documental y no modifica el estado de implementación, no ejecuta pruebas y no declara PASS/CI-VERIFIED.


---

## DELTA — OWNER-RATIFIED PERIMETER RECONCILIATION / RAW WRITER PRECISION (2026-11-27)

**Decision authority:** the owner ratified the protected-asset perimeter for O7/P07 on 2026-11-27. The decision is preserved in `NEXO_NCS/DECISIONS/NCS_M0_O7_P07_PROTECTED_ASSET_PERIMETER_OWNER_RATIFICATION_2026-11-27.md`, commit `9e2d04f645f386853221228e5038f885ee27d13c`. This delta applies that perimeter to the already identified source evidence; it does not broaden the R1 environment or assert runtime use.

### 1. Exact source re-check

All source observations below are tied to product snapshot `d8b5ca8720908d926acc18130614cce132a43b5d` and these exact blobs:

| File | Blob |
|---|---|
| `scripts/assistants.mjs` | `5d773332acf1f762ea9e2eb48dfcf5a5267470d6` |
| `scripts/simulate.mjs` | `ec322cdff76392d7c99a4f45bf35f76a8b91b667` |
| `src/nexo/core/continuity-store.mjs` | `c1eb81bf74d2df576079b3269ac4db22d87fe7b6` |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` |
| `.github/workflows/lumina-simulation.yml` | `e11a11b5101c992396737f3520c427c2c6c4f350` |

No source was changed and no code, tests, workflow, CI, runtime, Termux or device operation was performed.

### 2. RAW-1 — Lúmina memory path is a direct conditional writer

In `scripts/assistants.mjs`:

- `NEXO_LUMINA_MEMORY_PATH` is resolved into `MEMORY_PATH` (lines 17–19).
- `readJson(MEMORY_PATH, null)` reads and parses the selected path (line 78).
- The code derives `learned` from the parsed object's `runs`, `lessons`, and `patterns` (lines 79–83), preserves only the legacy `nexo` property when present (lines 98–104), and then calls `fs.writeFile(MEMORY_PATH, JSON.stringify(learned, null, 2) + "\\n", "utf8")` (line 106).

Therefore, if the environment variable resolves to the protected Continuity file and that file contains parseable JSON, the static control flow reaches a direct overwrite of that path; no Continuity admission is visible in this route. The Continuity store's own reader confirms that its persisted envelope is JSON-parsed (`continuity-store.mjs`, lines 161–170), so the parseability precondition is compatible with the file format. This is a **static conditional write capability**, not proof that the environment variable was set or that this write occurred in R1.

**Classification:** RAW-1 is a confirmed static conditional writer/affector of the ratified protected asset perimeter. A claim that Lúmina is excluded from O7 solely because its import graph does not reach Nexo modules is invalid. Effective exclusion or admission enforcement has not been demonstrated.

### 3. RAW-2 — configurable simulation state path requires a narrower claim

The same `assistants.mjs` resolves `NEXO_STATE_PATH` (lines 14–16), reads the selected path using `loadStateStrict` when it exists (lines 53–54), and passes it to `persistState` (line 108). `persistState` accepts an absolute path and performs temp-file publication by rename (`simulate.mjs`, lines 215–251).

However, an existing Continuity envelope is not shown to satisfy the simulation schema required by `loadStateStrict` (version >= 3, `world` object, `agents` array, and safe integer `stateRevision`; `simulate.mjs`, lines 103–153). If that validation fails, control exits before `persistState`. Thus this route is a configurable arbitrary-path persistence capability, but this inspection does **not** establish that it can overwrite the existing primary Continuity envelope through the `assistants.mjs` caller. Do not repeat the earlier broader implication as a confirmed direct write to an existing Continuity file without a schema-compatible counterexample or another caller.

**Classification:** RAW-2 remains a relevant path-capability and caller-surface question for O7/P09, but its effective write to the existing protected Continuity file is **NOT DEMONSTRATED** in this snapshot. `simulate.mjs` as a direct CLI uses its own fixed `world-state.json` path; the configurable route described above is supplied by `assistants.mjs`.

### 4. Consequences of the ratified perimeter

- The ratified perimeter explicitly includes Continuity temporaries, publication files, lock/coordination objects, and the relevant namespace. The existing cleanup/release findings therefore remain in scope; they are not merely ancillary implementation details.
- Chronicle remains a separate store. Its source documents `filePath` as trusted configuration, not a sandbox boundary (`chronicle-store.mjs`, lines 200–206); its lock and temp naming are derived from that path. This is relevant to alias/collision analysis, but does not prove that Chronicle was configured to target Continuity or that it overwrote the primary file.
- The Lúmina simulation workflow has a five-minute cron and `contents: write` permission (workflow blob above). That proves a repository-writing workflow actor, not a writer to the deployed R1 Continuity file. Keep it outside R1 unless a concrete bridge is evidenced.
- P09 remains the caller/entrypoint universe. O7 remains the actor/capability universe for every writer or affector of the ratified protected perimeter. The fact that `assistants.mjs` is classified as `ENTRYPOINT_LUMINA` under P09 does not exclude its direct filesystem capability from O7.

### 5. Updated disposition

- O7: **UNKNOWN / OPEN**. A broad exclusion claim that treats the Lúmina import-graph separation as proof that no Lúmina route can affect Continuity is **CONTRADICTED** by RAW-1. The observed shell's lack of the alias remains only a point-in-time observation, not proof of global exclusion.
- RAW-1: **STATIC CONDITIONAL WRITER CONFIRMED**; runtime activation/use **NOT OBSERVED / UNKNOWN**; enforcement/exclusion **NOT DEMONSTRATED**.
- RAW-2: arbitrary-path persistence API confirmed; overwrite of an existing Continuity envelope through the inspected caller **NOT DEMONSTRATED** because strict schema validation precedes persistence.
- P09: **OPEN / UNKNOWN**; its declared universe and unresolved dynamic/external consumers remain unchanged.
- P07-C: **UNKNOWN / BLOCKING**; B2 replacement-safe cleanup and B3 durable BLOCKED gaps remain.
- P05-C: **RATIFIED**; P05 **OPEN**.
- E2/E3: **PARTIAL / NOT CLOSED**.
- `authorization: NOT_EVALUATED`; commissioning and protected effects **STOP**; NCS M0 **INCOMPLETE**.

**Next bounded unit:** classify the exact RAW-1 configuration control and every documented path by which its environment can be set in the declared R1 universe; distinguish a static capability from an actually configured actor. Do not repeat the P09 import-graph census, the Termux shell capture, or the lock/release sweep. Do not select a filesystem primitive or implement a mitigation from this delta.


## DELTA — RAW-1 CONFIGURATION SURFACE AND LAUNCHER TRACE (2026-11-27)

### Repository-controlled configuration paths inspected at the pinned snapshot

Exact evidence:

- `package.json`, blob `a42af401a51fde4d38488d136420506b3ed80b38`, declares `"assistants": "node scripts/assistants.mjs"` (line 7). This is the repository's named package-script entry for RAW-1.
- `scripts/assistants.mjs`, blob `5d773332acf1f762ea9e2eb48dfcf5a5267470d6`, reads `NEXO_LUMINA_MEMORY_PATH` only through `process.env` (lines 17–19); when unset, it uses the repository-local `.lumina-assistant-memory.json` default. No command-line argument or repository config file is read for this variable in the inspected entrypoint.
- `.github/workflows/lumina-simulation.yml`, blob `e11a11b5101c992396737f3520c427c2c6c4f350`, invokes `npm run assistants` (line 40) and later commits only `world-state.json` and `.lumina-assistant-memory.json`. The inspected workflow does not set `NEXO_LUMINA_MEMORY_PATH`; its job runs on `ubuntu-latest`, so it is outside R1. It proves a remote workflow invocation of the default Lúmina assistant, not a route into the deployed R1 Continuity file.
- `scripts/nexo*.mjs` entrypoints and the inspected Nexo workflows do not reference this variable in the paths checked for this reconciliation. This is a bounded source observation, not a claim about every external launcher or the user's entire Termux HOME.
- The prior Termux shell capture recorded in S1 did not show the alias configured at that observation. That remains point-in-time evidence only.

### Classification

1. **Repository launch surface:** CONFIRMED — `npm run assistants` invokes the Lúmina assistant entrypoint.
2. **Default destination:** CONFIRMED — repository-local `.lumina-assistant-memory.json` when the variable is unset.
3. **Environment override:** CONFIRMED — arbitrary resolved path can be supplied through the process environment.
4. **Repository workflow override:** NOT FOUND in the inspected Lúmina workflow; workflow uses default path and is outside R1.
5. **R1 shell override:** NOT OBSERVED in the prior captured shell; not proven impossible or continuously absent.
6. **Runtime write to protected Continuity:** NOT OBSERVED. Static conditional writer capability remains confirmed; enforcement preventing an alias to the protected path remains NOT DEMONSTRATED.

### O7 disposition and next proof requirement

O7 remains **UNKNOWN / OPEN**. The source evidence proves the capability edge and the package launch surface, but does not prove that the owner configured that edge in R1. Conversely, one shell capture with no alias cannot prove that every future invocation is sanitized. The narrow remaining question is whether the authorized R1 launch procedure fixes/validates the effective environment for the entire invocation window, or whether an alternate launch path remains admissible. Do not repeat the P09 graph census or the old shell capture; use a new, invocation-bound artifact only if a specifically authorized R1 observation is later conducted. No such observation is authorized by this documentary delta.


## DELTA — EXISTING TEST ORACLE COVERAGE FOR B2/B3 (STATIC INSPECTION ONLY, 2026-11-27)

This is a source-level inventory of existing test cases, not a test execution. Product snapshot remains `d8b5ca8720908d926acc18130614cce132a43b5d`.

Test sources:

- `tests/nexo/continuity-store.test.mjs`, blob `1219b88a78d4c2994e004566905a778ad3b67183`.
- `tests/nexo/chronicle-store.test.mjs`, blob `8e182932ae98ad40c3655f6be3bf5e0585bfac26`.

### What the existing tests do cover

- Continuity: malformed/oversized owner records remain UNKNOWN and the lock is preserved; stale locks fail closed rather than being reclaimed; a cross-process contender waits while a lock exists and resumes after the test explicitly removes it; transient release cleanup is retried; persistent release failure reports persistence separately from failed handoff and blocks a subsequent acquisition in the **same process**.
- Chronicle: malformed/oversized owner records and uninspectable lock state fail closed; a changed owner token observed at release prevents deletion; persistent cleanup failure reports committed persistence but blocks handoff and preserves the lock.

### What those tests do not demonstrate

1. **B2 atomic replacement safety:** the Chronicle `notOwnedRelease` test supplies a different owner record at the time of the ownership read. It does not replace the lock directory in the interval after the token check and before `rm(lockPath)`. The production code still performs a path-based recursive removal after a separate read. No test in the inspected ranges binds the checked directory identity to the object removed under an adversarial replacement race.
2. **B3 durable/interprocess BLOCKED:** the Continuity persistent-release test verifies a process-local failure marker by retrying in the same process. It then manually removes the lock. The cross-process test proves waiting while a lock exists and resumption after explicit removal; it does not restart the failed owner and verify that a fresh process remains durably blocked under P05-C. Chronicle's persistent-release test likewise leaves a lock for explicit recovery but does not establish a durable recovery classification across process restart.
3. **Crash/power-loss semantics:** these injected filesystem errors and process coordination tests do not establish power-loss durability, fsync ordering, or atomic persistence of a BLOCKED state.

### Updated interpretation

The test suite contains meaningful partial fail-closed coverage; it must not be described as having no lock/release tests. However, that coverage does not satisfy the specific B2 replacement-safe identity obligation or B3 durable/interprocess BLOCKED obligation. Existing test presence is not a PASS for those obligations, and no tests were run during this inspection.

Disposition unchanged: B2 **CONTRADICTED-CODE / GAP**; B3 **CONTRADICTED-CODE / GAP**; P07-C **UNKNOWN / BLOCKING**; P05-C **RATIFIED** and P05 **OPEN**. No mechanism selected, no implementation authorized by this delta, no runtime/test/CI/Termux/device operation.


---

## DELTA — P07 V2.2 + V2.3 OWNER RATIFICATION AND CANDIDATE FEASIBILITY RECONCILIATION (2026-11-27)

### 1. Normative status correction

The owner expressly ratified the three P07 V2.2 documents as the documentary base and the three P07 V2.3 documents as the normative, scenario/oracle and traceability delta, prevailing only where V2.3 corrects V2.2.

Decision record:
- `NEXO_NCS/DECISIONS/NCS_M0_P07_V22_V23_OWNER_RATIFICATION_2026-11-27.md`
- Commit: `228df5e100fa969b99e6acdfc746cb690307427c`
- Blob: `3bcdcc4e547ea4e59deb8a794e8eb48e158e1e94`

This supersedes historical statements in this evaluation and its cited V2.3 documents that V2.3 was not ratified. Those statements remain valid as dated snapshots, not as the current decision state.

The separate protected-asset perimeter ratification remains in force (decision blob `ddb026275b64027f9fc95aab3861ed0614143c34`). It fixes the O7/P07 evaluation perimeter but does not prove coverage or enforcement.

### 2. Current contract boundary

V2.3 is now normative within the ratified scope. In particular:
- detection/STOP and retention are not prevention and cannot alone satisfy P07-C;
- actor B must be classified before a scenario as COVERED, RAW, PRIVILEGED, UNCLASSIFIABLE, or NOT_PRESENT as applicable;
- R-OBJ and R-NAME remain distinct;
- `harness_verdict`, `result_class`, and `product_state` remain separate; `PASS_GATE` requires `gate_basis` and all dependencies;
- P07-18a visibility/atomicity and P07-18b destination protection remain separate;
- P07-19 requires the exact failure → substitution → cleanup seam and cleanup owner;
- P07-21 applies the owner-ratified C3 rule by inode role; do not reopen C3/G2.

### 3. Candidate feasibility against the ratified B1–B5 / O1–O9 obligations

The existing Android/Termux mechanism comparison (blob `1feb5510454ee486c1d632d24d0dbdf620c56f01`) was re-evaluated against the now-ratified P07 V2.2+V2.3 contract and the protected perimeter. This is a documentary feasibility assessment, not mechanism selection or implementation.

| Candidate family | What it can contribute | Why it cannot independently close P07-C/P05 |
|---|---|---|
| Existing Node path APIs | Cooperative baseline, exclusive create, final-component flags, rename visibility | Path-based cleanup remains vulnerable to replacement between validation and destructive operation; does not fence RAW writers |
| dirfd / openat / openat2 | Constrain path resolution and anchor operations to an opened directory; potentially address parts of R-NAME/alias handling | Availability and binding are unverified on the exact target; does not itself provide compare-and-unlink or durable BLOCKED; an actor able to mutate the namespace still needs enforcement |
| flock / fcntl / OFD lock | Kernel-mediated advisory serialization among participants that acquire the same lock object | Does not authenticate the protected path, prevent lock-object substitution, cover RAW-1, or leave durable BLOCKED after owner process termination |
| lock file / directory | Observable coordination object and exclusive creation by name | Name-based cleanup can affect a substitute; stale/absent state is ambiguous; PID/age/token do not authorize recovery or prove quiescence |
| SQLite | Transactional data/journal behavior within participants using the database | Does not constrain root/aliases or writers bypassing the database; sidecar/locking behavior remains target-dependent; adds format/migration scope |
| daemon/service | Could centralize admission and durable state | Adds lifecycle, boot, relaunch, availability and authority surfaces outside the current M0 boundary |
| hardlink token | May correlate names to one inode on supporting filesystems | Termux probe previously returned EACCES; no support assumption and no compare-and-unlink guarantee |

**Feasibility conclusion:** no single family in the existing comparison independently satisfies B1–B5 and O7. The previously noted dirfd + kernel-lock combination remains only a possible investigation composition for path anchoring and cooperative admission; it does not solve replacement-safe cleanup, durable BLOCKED, approved reclas­sification, or RAW actor coverage. It is not selected.

A candidate architecture cannot be accepted until it independently accounts for:
1. protected-object and coordination-object identity across acquire/use/release/recovery (B1);
2. replacement-safe destructive operation at the actual product seam (B2/O4);
3. BLOCKED state observable by a fresh process after owner crash, without PID/age/absence inference (B3/O1/O2/O5);
4. owner-approved reclas­sification procedure (B4/O6/G5);
5. explicit crash ordering and evidence level for each persistence claim (B5/O9);
6. O7 actor coverage, including the confirmed static conditional RAW-1 path and the exact R1 invocation boundary.

### 4. Evidence and code-snapshot boundary

The source/test findings in this evaluation remain pinned to product snapshot `d8b5ca8720908d926acc18130614cce132a43b5d`. The remote comparison from that SHA to traceability branch head `602afee4e0b8d995b7eafd98add338831dc100b2` reports 92 commits ahead consisting of documentary changes; the comparison result lists no product source or test file changes. This does not establish that a different local worktree is clean or equivalent. The user's Termux worktree remains a separate dirty-worktree recovery concern and must not be used as an implicit source baseline.

The existing B2/B3 test-coverage inventory remains static inspection only. No test, CI, runtime, Termux/POCO, bootstrap, publication, cleanup, readmission, or protected effect was executed by this delta.

### 5. Updated disposition and next bounded action

- P07 V2.2 + V2.3: **OWNER-RATIFIED DOCUMENTARY CONTRACT**.
- Protected O7/P07 asset perimeter: **OWNER-RATIFIED**.
- O7: **UNKNOWN / OPEN**; RAW-1 static conditional writer remains confirmed; runtime use not observed; enforcement/exclusion not demonstrated.
- P09: **OPEN / UNKNOWN** within its ratified declared universe.
- P07-C: **UNKNOWN / BLOCKING**; B2 replacement-safe cleanup and B3 durable BLOCKED remain unresolved.
- P05-C: **RATIFIED POLICY**; P05 **OPEN**; O1/O2/O5/O6/G4/G5 remain gaps or contradicted as previously mapped.
- O8: **UNKNOWN**; target fingerprint is not bound to a new authorized execution.
- E2/E3: **PARTIAL / NOT CLOSED**.
- Mechanism selected: **NONE**.
- Harness: **NOT IMPLEMENTED**; tests: **NOT EXECUTED** in this evaluation.
- `authorization: NOT_EVALUATED`; commissioning and protected effects: **STOP**; NCS M0: **INCOMPLETE**.

**Next bounded task:** prepare a mechanism-neutral B2/B3 design decomposition that identifies the exact product seam, durable-state requirements, and owner-reserved recovery decisions. Do not select a primitive, introduce a marker/tombstone/epoch/daemon/journal, or execute a device observation by inference. Any new code/test work must stay within the separately ratified M0 authorization and use an explicitly pinned, clean source baseline; the dirty Termux worktree is not such a baseline.
