# NCS M0 — P-09 caller coverage reconciliation

**Fecha:** 2026-11-07  
**Tipo:** análisis estático documental, snapshot ligado a blobs  
**Estado:** P-09 OPEN / UNKNOWN; no es cierre ni autorización de implementación  
**Rama documental:** `ncs-strategic-vision-preservation-2026-11-05`  
**Snapshot de código:** `ncs-lumina-decoupling-2026-10-29`, HEAD `d8b5ca8720908d926acc18130614cce132a43b5d`

## 1. Alcance y regla

P-09 exige resolver consumidores externos, cargas dinámicas y aristas indirectas que puedan eludir la frontera de admisión. La decisión register define que solo se cierran aristas concretas contra un snapshot identificado; lo que no pueda resolverse permanece `UNKNOWN/BLOCKED`. No se afirma que un inventario de archivos equivalga a un universo cerrado de procesos instalados, consumidores externos o dependencias del entorno.

Esta reconciliación reutiliza evidencia estática concreta. No ejecutó imports, tests, CI/Actions, runtime, procesos del POCO ni operaciones sobre Continuity.

## 2. Fuentes exactas

| Fuente | Blob SHA | Qué permite afirmar |
|---|---|---|
| `package.json` | `a42af401a51fde4d38488d136420506b3ed80b38` | Scripts npm declarados en este snapshot; `test` incluye el guard de grafo y entrypoint tests. |
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` | CLI Nexo; importa API de aplicación; delega Chronicle mediante `spawnSync`. |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` | Entry point hijo ejecutable directamente; importa append de aplicación. |
| `scripts/nexo-continuity.mjs` | `7a2003f78a83ce5d65b53f02470156c3dd4cfefd` | Reexporta owner y bootstrap service; no es por sí mismo una frontera de admisión. |
| `scripts/nexo-continuity-bootstrap.mjs` | `d6547b62efcda0665e66dc111972544ea9ebe15e` | Entry point dedicado de bootstrap, separado del uso normal. |
| `scripts/nexo-runtime-session.mjs` y repair wrappers | Clasificación comprobada por el guard de abajo | Wrappers de repair sometidos al gate; no prueba inalcanzabilidad de toda API inferior fuera de las raíces cubiertas. |
| `scripts/assistants.mjs` | `5d773332acf1f762ea9e2eb48dfcf5a5267470d6` | Lúmina; no importa owner/store Nexo en este snapshot. |
| `scripts/simulate.mjs` | `ec322cdff76392d7c99a4f45bf35f76a8b91b667` | Simulación Lúmina; persistencia de world-state propia, sin apertura de Continuity. |
| `src/nexo/application/index.mjs` | `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3` | Reexporta las APIs path-based de query y append. |
| `src/nexo/application/chronicle-append.mjs` | `c1964467d68043d06e035ad59720f8cec2e52e52` | Construye stores por path, hace lecturas `loadCurrent()` y después abre owner. |
| `src/nexo/application/continuity-queries.mjs` | `e1915e94e53e71d37a37952fead37ba62bdae79a` | Cinco operaciones públicas llaman directamente a stores path-based y `loadCurrent()`. |
| `src/nexo/application/mission-request-preview.mjs` | `4e317b646d0c7b7403acfb63732dec8c3fe7778b` | API delegada de preview; no agrega una admisión independiente. |
| `tests/nexo/m0-import-graph-guard.test.mjs` | `9a4e2a3ec42dcce5737555b182ca367649085405` | Clasifica raíces de producto y verifica separación de dominios mediante imports locales literales. |
| `tests/nexo/entrypoint.test.mjs` | `5bd53340301acdf2887371772f22a3730da4cd1f` | Sigue imports/reexports literales desde CLI padre e hijo y ejercita el contrato path-based actual. |
| `tests/nexo/continuity-bootstrap-launcher.test.mjs` | `ad470a44fbd98ee465baedd55ef3ffe4ccf2d590` | Pruebas de contrato del launcher/preflight de bootstrap. |

## 3. Clasificación del grafo en el snapshot

| Superficie | Clasificación vigente | Hallazgo | Efecto para P-09 / D1 |
|---|---|---|---|
| `scripts/nexo.mjs` | ENTRYPOINT_NEXO | CLI público; importa queries/append. El padre crea proceso hijo para Chronicle. | Caller conocido; admisión pre-read/root no demostrada. |
| `scripts/nexo-chronicle-session.mjs` | ENTRYPOINT_NEXO_DIRECT | Puede ejecutarse directamente y llama append. | Caller distinto del padre; debe admitir por sí mismo antes de cualquier I/O persistente. |
| `scripts/nexo-continuity.mjs` | COMPATIBILITY_EXPORT | Reexporta `openNexoContinuityOwner` y bootstrap. | API invocable por import; no convertir el wrapper en garantía de admisión. |
| `scripts/nexo-continuity-bootstrap.mjs` | ENTRYPOINT_BOOTSTRAP_SEPARATE | Ruta explícita de primera publicación/preflight. | Separación bootstrap/operación existe; no es admisión normal ni autorización de efectos. |
| `scripts/nexo-runtime-session.mjs` y repair wrappers | GATED_REPAIR_SURFACE | El guard clasifica wrappers y exige imports limitados a gate/protocolo; tests de comportamiento separados. | O-07 excluye repair del alcance operativo M0, pero no prueba inalcanzabilidad de exports inferiores o consumidores externos. |
| `scripts/assistants.mjs` | ENTRYPOINT_LUMINA | No importa owner/Continuity Nexo; trabaja con estado Lúmina. | El antiguo caller Nexo del snapshot 2026-10-23 queda superado para este SHA. No reabrir sin nueva arista. |
| `scripts/simulate.mjs` | ENTRYPOINT_LUMINA | No importa owner/Continuity Nexo; conserva persistencia de simulación. | El antiguo caller Nexo del snapshot 2026-10-23 queda superado para este SHA. No reabrir sin nueva arista. |
| `src/nexo/application/index.mjs` | PUBLIC_IMPORTABLE_API | Reexporta queries y Chronicle append. | No es CLI, pero es superficie importable por consumidores dentro o fuera del repo; no existe evidencia de encapsulación de paquete. |
| `continuity-queries.mjs` | PATH_BASED_PUBLIC_API | `status`, `mission status`, `plan`, `draft preview`, `open loops` leen stores por ruta. | No hay admisión de instancia en estas funciones; llamadas directas son un bypass de la frontera si se usan como API normal. |
| `chronicle-append.mjs` | PATH_BASED_MUTATING_API | Crea dos stores por rutas, hace preflight `loadCurrent()` y luego abre owner. | Lectura persistente anterior a la admisión común; brecha concreta P-03/P-04. |
| Factories y owner del core | LOW_LEVEL_IMPORTABLE_PRIMITIVES | Exports de módulos ESM aceptan rutas; no hay barrera de visibilidad del lenguaje que limite imports a callers internos. | Callers externos al grafo de scripts no se pueden descartar desde este snapshot. |

## 4. Qué cubren y qué no cubren los guardas existentes

### Cubierto en el repositorio

El guard `m0-import-graph-guard.test.mjs`:
- exige clasificación explícita de cada `scripts/nexo*.mjs` presente en el directorio;
- clasifica raíces Nexo, Lúmina, wrappers de repair e internos;
- recorre imports/reexports estáticos y `import()` dinámicos **solo cuando el specifier es literal**;
- impide cruces de dominio Nexo/Lúmina en las raíces clasificadas;
- verifica que módulos de repair concretos dependan solo del gate y del protocolo privado.

El test `entrypoint.test.mjs`:
- recorre imports/reexports estáticos literales desde `scripts/nexo.mjs` y `scripts/nexo-chronicle-session.mjs`;
- comprueba la separación de imports Lúmina;
- ejercita CLI, stores y replay con rutas explícitas.

Estas pruebas constituyen cobertura arquitectónica parcial real en el código. **No** equivalen a un gate P-09 completo ni prueban admisión D1.

### Gaps exactos

1. El parser de imports del guard no resuelve `import(expr)`, `require(expr)`, `createRequire`, `eval`/constructores, carga desde manifiestos/registries ni rutas generadas en runtime.
2. El resolver local solo intenta el path literal, `.mjs`, `.js`, `index.mjs` e `index.js`; si no resuelve, devuelve `null` y el caller no falla por arista local irresoluble.
3. La lista de raíces de producto clasifica scripts Nexo y dos raíces Lúmina; no deriva y verifica exhaustivamente todas las órdenes de ejecución de workflows, tareas del sistema, launchers externos o paquetes consumidores.
4. La regla de grafo del guard prohíbe cruces de dominio, no prohíbe que una raíz Nexo alcance una factory/owner path-based. Por tanto, su PASS no demuestra root admission ni pre-read admission.
5. El test de entrypoint sigue dos raíces CLI; no establece que todos los consumidores de los exports de `application/index.mjs`, stores y owner estén dentro de ese grafo.
6. Los exports ESM pueden ser importados por cualquier consumidor que tenga acceso al paquete/árbol. No se inspeccionaron consumidores externos instalados, scripts locales fuera del repositorio ni invocadores del entorno del dispositivo en esta pasada.
7. No se afirma ausencia de procesos persistentes, supervisores o writers externos. E2/E3 conservan sus propios gates y evidencia operacional.

## 5. Reconciliación de documentos históricos

El allowlist de 2026-10-23 y el manifiesto D1 de 2026-10-24 describían `assistants.mjs` y `simulate.mjs` como callers Nexo activos. Esa clasificación corresponde a snapshots anteriores. En el snapshot actual, sus blobs muestran que ambos son raíces Lúmina y el guard prohíbe que alcancen `src/nexo/**` o `scripts/nexo*`.

Por tanto:
- conservar la descripción histórica como evidencia de lo que ocurría entonces;
- no usarla como clasificación vigente del SHA `d8b5ca8`;
- no repetir su auditoría salvo que cambien los blobs o aparezca una arista concreta nueva.

El cambio no elimina la brecha de API pública path-based ni resuelve consumidores externos/dinámicos.

## 6. Matriz de cierre P-09

| Claim | Estado | Evidencia necesaria para reclasificar |
|---|---|---|
| Scripts Nexo presentes en el directorio están clasificados | PARTIAL / STATIC_GUARD_EXISTS | PASS del test en SHA candidato y evidencia de que el set de raíces cubre comandos/launchers reales del producto. |
| Imports/reexports locales literales desde raíces clasificadas están recorridos | PARTIAL / STATIC_GUARD_EXISTS | PASS ligado al SHA candidato; resolver imports no literales/no resolubles o mantenerlos explícitamente UNKNOWN. |
| Todos los loaders dinámicos/computados relevantes están cerrados | UNKNOWN | Resolver mecanismos no literales y módulos generados; fixture negativo por cada clase soportada. |
| Todos los procesos hijos y dispatch indirectos están clasificados | PARTIAL | Grafo padre→hijo, argumentos, invocación directa y todo spawn/exec del alcance; fixtures de bypass. |
| No hay consumidores externos de APIs path-based | UNKNOWN | Definir el universo de despliegue/paquete y evidencia del entorno; si no puede acotarse, mantener la limitación explícita y bloquear el claim universal. |
| Toda lectura/escritura Nexo ocurre tras admisión | FAIL / NOT IMPLEMENTED IN CITED ROUTES | Cambiar fronteras públicas según D1–D6 ratificadas y demostrar pre-read admission; las rutas actuales no lo cumplen. |
| Nexo/Lúmina están separados en las raíces revisadas | IMPLEMENTED IN SOURCE; TEST EVIDENCE EXISTS | Mantener test de guard y evidencia PASS ligada al SHA candidato; no proyectar un PASS histórico. |
| Repair no ejecuta efectos por la ruta wrapper identificada | GATED / SCOPE LIMITED | Test del gate ligado al SHA; no inferir inalcanzabilidad universal de APIs inferiores. |

## 7. Secuencia mínima para cerrar P-09 y alcanzar M0

1. **Fijar el universo de producción** desde el snapshot candidato: package scripts, entrypoints directos, workflows que invocan runtime y cualquier supervisor/launcher del despliegue declarado. No repetir el censo completo de 188 archivos.
2. **Convertir las APIs path-based en superficie interna** o hacer que cada export público requiera un contexto de instancia admitida. No basta con cambiar el CLI si las APIs siguen importables sin contrato.
3. **Resolver la brecha pre-read**: Chronicle no debe ejecutar `loadCurrent()` antes de admisión; las cinco queries deben recibir/obtener contexto admitido antes de tocar el store. Los helpers anidados no deben readquirir el mismo lock.
4. **Definir el análisis estático/AST del grafo**: imports, reexports, imports dinámicos, `require`/createRequire, procesos hijos, ejecución directa, imports no resolubles y fuentes generadas. No declarar cerrado lo que el resolver no pueda interpretar.
5. **Conservar Lúmina fuera del grafo Nexo**: los blobs actuales ya muestran esa separación; no reintroducir owners ni Continuity en `assistants` o `simulate`.
6. **Clasificar consumidores externos** contra un universo de despliegue real. Si no hay inventario verificable, el claim universal permanece UNKNOWN y no se obtiene PASS de P-09.
7. Solo después de P-07-C/P-05 y de la autorización específica correspondiente: implementar el mínimo, añadir fixtures negativos y pruebas de integración; validar en SHA congelado. No ejecutar esas acciones bajo esta reconciliación.

## 8. Estado final de esta unidad

- P-09: **OPEN / UNKNOWN**. La cobertura estática interna mejoró, pero no cierra loaders no literales, consumidores externos ni la frontera de admisión.
- P-03/P-04: **D1–D6 RATIFICADAS; ENFORCEMENT PENDIENTE**. El pre-read path-based observado es una brecha concreta.
- P-05-C: **POLÍTICA RATIFICADA; P-05 OPEN** hasta mecanismo/enforcement/resolución/evidencia.
- P-07-C: **UNKNOWN / BLOQUEANTE**.
- E2/E3: **PARTIAL / NOT CLOSED**.
- `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; commissioning y efectos protegidos STOP.
- NCS M0: **INCOMPLETO**.

Esta unidad es análisis documental de fuentes estáticas. No cambia runtime, tests, workflows, CI, configuración, dispositivo, bootstrap, publicación ni efectos protegidos. No se ejecutaron pruebas ni Actions.
