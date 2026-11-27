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
