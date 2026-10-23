# NCS M0 — contrato de raíz de instancia y plan verificable de migración

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **DISEÑO DOCUMENTAL — Opción A aceptada como dirección; runtime SIN CAMBIOS**  
Autoridad de decisión: propietario de Nexo  
Alcance: persistencia local Chronicle/Continuity y admisión concurrente de operaciones internas.

## 0. Estado y límite

El propietario aceptó Opción A como dirección de diseño. Este documento concreta el contrato propuesto y la migración verificable; no es una autorización para editar runtime ni significa que la raíz ya exista o funcione.

No se modifica: autoridad constitucional, root legítimo, commissioning, despacho externo, Lúmina, reparación, semántica de efectos, formatos canónicos existentes ni los límites por documento. Estado constitucional: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## 1. Contrato propuesto de raíz

### 1.1 Identidad de configuración

- La raíz de instancia es un **directorio de configuración/persistencia local**, no una identidad criptográfica, un owner credential, una autoridad ni una prueba de legitimidad.
- Cada operación que participe en el modo de instancia debe recibir una única configuración de instancia validada. La configuración es la única fuente de rutas para Continuity, Chronicle y admisión compartida.
- El punto de entrada no puede mezclar una raíz con `continuityPath` o `chroniclePath` independientes. No se permite fallback silencioso a rutas históricas.
- La configuración de raíz debe ser explícita en la frontera pública. La variable de entorno puede considerarse un transporte de configuración, pero no puede crear una raíz implícita distinta ni prevalecer de forma ambigua sobre un argumento. La decisión exacta de interfaz CLI/env queda como subdecisión de implementación; debe existir una sola precedencia documentada y testeada.
- No se deriva ni se persiste un nuevo `instanceId` solo para nombrar la raíz. La ruta resuelta es el localizador de configuración, no prueba de identidad ni anti-rollback.

### 1.2 Resolución y validación

Antes de abrir cualquier store:
1. Validar la forma del input sin ejecutar accessors; seguir los guardas de opciones existentes.
2. Resolver la raíz a una ruta absoluta normalizada usando primitivas de ruta del sistema, sin construir rutas a partir de IDs proporcionados por misiones.
3. Rechazar raíz vacía, relativa si la interfaz elegida exige absoluta, archivo en lugar de directorio, raíz inexistente cuando la política de inicialización no autoriza crearla, y rutas derivadas que escapen léxicamente de la raíz.
4. Definir explícitamente cómo tratar symlinks, alias de ruta y mounts. La normalización lexical sola **no** demuestra que dos rutas reales sean el mismo directorio. Hasta que el contrato de symlink/canonicalización se pruebe, no afirmar que rutas alias se fusionan.
5. No crear stores, migrar archivos, borrar temporales ni escribir nada durante la validación de configuración.
6. Si el directorio contiene una combinación ambigua de canónicos, temporales o legacy, bloquear con error estructurado; no adivinar cuál es la fuente correcta ni eliminar archivos por heurística.

La raíz y sus rutas son configuración confiable cooperante, no un sandbox contra procesos locales hostiles, symlink races, administradores del sistema ni acceso directo al filesystem.

### 1.3 Layout canónico propuesto

Layout inicial sugerido, pendiente de prueba contra compatibilidad y necesidades de producto:

- `<root>/continuity.json` — almacén canónico Continuity existente.
- `<root>/chronicle.json` — almacén canónico Chronicle existente.
- `<root>/.nexo-instance.lock` — archivo de admisión común, si el protocolo elegido lo necesita.
- Temporales y locks específicos de cada store siguen derivados del nombre canónico existente; no se cambia su protocolo en esta fase.

No introducir subdirectorio de datos, manifiesto de instancia, marcador de bootstrap ni archivo de configuración persistente adicional sin demostrar que el contrato no puede resolverse con los archivos y mecanismos existentes. El nombre del lock es ilustrativo hasta la implementación y no autoriza duplicar un segundo sistema de locks.

### 1.4 Semántica de admisión compartida

- La unidad de exclusión es una **operación completa de instancia** que lee o modifica la representación persistida Chronicle/Continuity o crea una proyección/snapshot que forma parte del presupuesto agregado que se pretende limitar.
- La admisión debe ser compartida entre procesos del mismo directorio de instancia; una variable en memoria, mutex de módulo o lock solo de CLI no satisface el contrato.
- Adquisición ocurre antes de cargar snapshots/documentos que deban quedar dentro de la sección serializada. Liberación debe ocurrir en `finally` y cubrir todos los caminos de error.
- Timeout, error de adquisición, propiedad dudosa del lock, o error de liberación con estado incierto producen resultado bloqueado/UNKNOWN estructurado; no se inicia escritura, despacho ni segunda ruta de fallback.
- Todas las operaciones protegidas adquieren la admisión común en el mismo punto lógico y conservan el orden de locks de almacén existente. La migración debe demostrar ausencia de inversión de orden/deadlock; no diseñar una jerarquía de locks distinta por intuición.
- Las funciones puras que no acceden a stores ni materializan snapshots quedan fuera. Los entrypoints que acceden a stores directamente no pueden saltarse la admisión.
- Las factories de store pueden permanecer como primitivas internas de bajo nivel para tests y composición; producción debe consumirlas a través de una frontera que exija contexto de instancia/admisión. Si una API de store sigue exportada públicamente y se usa en producción sin esa frontera, la garantía de instancia no puede declararse completa.

**Garantía buscada:** como máximo una operación de la clase definida dentro de la raíz puede mantener simultáneamente snapshots/documentos protegidos, entre procesos cooperantes.

**No garantiza:** límite exacto de heap V8, cuota total de disco, límite de archivos ajenos, fsync/atomicidad frente a pérdida de energía, protección contra proceso local hostil, ni autoridad constitucional.

## 2. Inventario de entrypoints y dependencias actuales

Inventario construido desde los archivos actuales de la rama `ncs-clean-architecture`; cada grupo requiere verificación de callsites de producción durante la fase estática. Las factories directas son bypasses potenciales mientras sigan accesibles sin contexto de instancia.

| ID | Entrada / archivo | Acceso actual observado | Riesgo / migración |
|---|---|---|---|
| E1 | `scripts/nexo.mjs` | CLI parsea `--continuity`; status, mission-status, mission-plan, draft-preview y request-preview llaman aplicación directamente. `chronicle-append` crea un proceso hijo. | Reemplazar rutas sueltas por raíz/configuración única; propagar la misma raíz al hijo; no permitir argumentos legacy que eludan la raíz. |
| E2 | `scripts/nexo-chronicle-session.mjs` | CLI acepta `--continuity` y `--chronicle`; llama `runNexoChronicleAppend`. | Eliminar el par de rutas independientes del contrato de instancia; heredar/validar raíz en el proceso hijo; error explícito ante discrepancia. |
| E3 | `src/nexo/application/chronicle-append.mjs` | `runNexoChronicleAppend` crea Chronicle y Continuity stores, abre owner de Continuity y coordina la operación. `recordNexoMissionSafely` también forma parte de la superficie de aplicación. | Es la frontera principal para admisión completa de append; todas las rutas de carga y persistencia deben quedar dentro de la sección común. No duplicar locks por cada helper. |
| E4 | `src/nexo/application/continuity-queries.mjs` | `loadNexoContinuityStatus`, `loadNexoMissionStatus`, `loadNexoMissionPlan`, `previewNexoMissionDraft`, `loadNexoOpenLoops` crean stores por `continuityPath`. | Cada consulta/preview debe adquirir admisión antes de `loadCurrent`; previews siguen siendo de solo lectura y no deben inicializar ni escribir. |
| E5 | `src/nexo/application/mission-request-preview.mjs` | `previewNexoMissionRequest` delega en `previewNexoMissionDraft`. | No crear una segunda admisión anidada; propagar contexto o delegar a una frontera única. |
| E6 | `src/nexo/application/index.mjs` | Exporta API de aplicación. | Mantener una API de instancia coherente; revisar exportaciones y no dejar una ruta pública equivalente sin gate. |
| E7 | `src/nexo/core/continuity-service.mjs` | `openNexoContinuityOwner` crea store con `filePath`, carga/initializa continuidad. | Bootstrap/owner debe ejecutarse dentro de admisión; preservar semántica actual de importación legacy y no inicializar mundo vacío por defecto. |
| E8 | `src/nexo/core/continuity-store.mjs` | Factory pública `createNexoContinuityStore({filePath})`; lock por archivo, lectura/escritura/initialize/conditional commit. | Bypass potencial desde cualquier caller. Decidir encapsulación de producción o API que exija un lease/contexto; no borrar protección per-store existente. |
| E9 | `src/nexo/core/chronicle-store.mjs` | Factory `createNexoChronicleStore({filePath})`; lock por archivo, lectura/append. | Mismo bypass; conservar revisión, errores y protocolo `.tmp`; no reemplazar lock local por un global sin conservar invariantes de store. |
| E10 | `scripts/nexo-continuity.mjs` | Reexporta `openNexoContinuityOwner`. | Determinar si es API de producción usada externamente; adaptar a configuración de instancia o marcar explícitamente como low-level interno. |
| E11 | `scripts/nexo-repair-entrypoint.mjs` + `nexo-repair-session.mjs` | `runNexoRepairOnce` coordina preparación, despacho y settlement; sesión llama al entrypoint. | Riesgo alto: no activar/reconectar repair como parte de esta migración. Si toca persistencia de instancia, primero requiere la misma admisión, pero sigue sujeto al gate constitucional M0 y no gana permiso de despacho. |
| E12 | `scripts/nexo-repair-preparation.mjs`, `nexo-repair-dispatch.mjs`, `nexo-repair-settlement.mjs`, `nexo-repair-mission-verification.mjs` | Fases internas de repair; settlement/verification leen observación persistida y validan invariantes; dispatch usa adaptador. | Separar admisión/persistencia de autorización/efectos. La raíz común no puede autorizar dispatch. Mantener repair bloqueado según el gate actual. |
| E13 | `scripts/nexo-runtime-session.mjs` | Sesión de runtime/repair con flujo propio. | Revisar sus dependencias reales en la migración; no asumir que queda cubierto solo porque se llama desde otra sesión. No ampliar el alcance de runtime por esta decisión. |
| E14 | `src/nexo/core/continuity-owner.mjs` y operaciones/owners que consumen el store | Mutaciones de owner apoyadas en el store ya creado. | Deben usar el mismo contexto/lease durante toda operación; evitar adquirir de nuevo el lock de instancia desde un helper anidado. |
| E15 | Tests y workers `tests/nexo/*store*`, `persistence-lock-worker.mjs`, workers inline con `spawn` | Crean stores directamente para comprobar locks por almacén, límites, fallos y procesos separados. | Conservar pruebas de store aislado; añadir pruebas de admisión de instancia. Tests de primitivas no son evidencia de que producción no tenga bypass. |
| E16 | Workflows CI `.github/workflows/nexo-m0-chronicle.yml` y `nexo-mission-admission-continuity.yml` más `npm test` | Ejecutan suites existentes de Chronicle/Continuity/contratos. | Añadir suites de raíz/admisión al workflow adecuado y probar el SHA exacto de código+tests; documentación sola no prueba runtime. |

### Búsquedas obligatorias de completitud antes de implementación

La tabla anterior es inventario inicial de entradas conocidas, no prueba matemática de que no existan otros callers. Antes de cambiar código se deben buscar y clasificar todos los usos de:
- `createNexoChronicleStore`, `createNexoContinuityStore`;
- `openNexoContinuityOwner`, `runNexoChronicleAppend`;
- todos los métodos del store (`loadCurrent`, `initialize`, `commit`, `conditionalCommit`, append y similares);
- `continuityPath`, `chroniclePath`, `--continuity`, `--chronicle`;
- imports dinámicos, reexports, CLI wrappers, procesos hijos, sesiones de repair/runtime y test helpers.

Cada caller debe quedar clasificado como: (a) producción bajo admisión, (b) primitiva interna no alcanzable desde producción, (c) test/harness, o (d) excepción explícita que invalida el claim agregado. Ningún caller puede quedar sin clasificación.

## 3. Riesgos de migración y controles

| Riesgo | Consecuencia | Control/criterio de salida |
|---|---|---|
| Bypass por API o factory directa | La garantía global es falsa aunque CLI esté bloqueada. | Inventario de callsites completo + test/grep de superficies de producción; acceso de producción exige contexto de instancia. |
| Child process pierde raíz o usa otra | Dos procesos creen pertenecer a la misma instancia sin compartir admisión. | Propagar una sola raíz explícita; test CLI→child con misma raíz y test de conflicto de configuración. |
| Legacy CLI/API sigue aceptando rutas separadas | Coexistencia de modo antiguo sin gate. | Error de migración explícito o adaptador transitorio que derive una sola raíz de forma inequívoca; nunca mezclar raíz y rutas independientes. |
| Dos raíces apuntan al mismo directorio por alias/symlink | Locks diferentes y estado compartido aparente. | Contrato de canonicalización real probado o declarar aliases fuera de garantía y rechazar casos ambiguos. |
| Deadlock / inversión de locks | Bloqueo indefinido o timeout frecuente. | Un orden global documentado; no anidar admisión; timeouts bounded; pruebas concurrentes de todos los flujos relevantes. |
| Lock stale / dueño incierto / liberación fallida | Operación puede proceder sin exclusión real. | Reutilizar protocolos existentes solo tras demostrar semántica compatible; ante propiedad incierta, fail closed y cero escritura. |
| Timeout deja escritura parcial o estado incierto | Revisión/archivo divergente. | Capturar hashes/revisiones/bytes antes y después; adquisición fallida implica cero mutación; resultados ambiguos permanecen UNKNOWN. |
| Inicialización legacy/empty | Se puede elegir fuente incorrecta o inventar estado vacío. | Migración en modo dry-run primero; preservar reglas de `allowEmptyInitialization`; no merge/dual-write automático. |
| Cambio de ruta rompe datos existentes | Nexo parece perder continuidad o crea otro mundo. | Resolver fuente canónica sin escritura; snapshot/manifest de migración; copia verificable; preservar bytes/revisión y rollback documental antes del cutover. |
| Serializar lecturas y previews reduce disponibilidad | Más espera y timeouts. | Medir latencia y fijar wait budget explícito; clasificar qué lecturas deben estar bajo admisión; no prometer paralelismo. |
| Error de release en finally | Lock puede seguir activo o la operación reportarse falsamente. | Tests de errores en cada fase; estado incierto se informa como bloqueado/UNKNOWN. |
| Lock común interpretado como autoridad | Efectos protegidos podrían habilitarse indebidamente. | Contrato y tests aseguran `authorization: NOT_EVALUATED`; ninguna conexión a dispatch ni a `effectBoundary.prepare`. |
| Claim de recursos demasiado amplio | Falsa afirmación de heap/disco acotado. | Reportar solo serialización de operaciones cooperantes; dejar heap exacto y disco total OPEN. |
| Cambio accidental de protocolo `.tmp` o store lock | Regresión de persistencia existente. | No tocar store protocol como parte de diseño; regresiones actuales continúan obligatorias. |

## 4. Plan de migración verificable (sin ejecución todavía)

### Fase D0 — contrato congelado
- Revisar este documento contra MASTER/CORE y la decisión de alcance A de Chronicle.
- Cerrar las subdecisiones explícitas: interfaz de configuración (CLI/API/env y precedencia), política de raíz inexistente, symlinks/aliases, alcance exacto de operaciones serializadas, API de store de bajo nivel, error codes y timeout.
- Salida: decisión documental aceptada; no runtime.

### Fase D1 — inventario de callsites
- Ejecutar búsquedas completas y abrir cada caller; construir matriz con ruta, función, lectura/escritura, proceso, si puede materializar snapshot, gate esperado y test existente.
- Confirmar el árbol completo de producción; identificar cualquier import/export que exponga stores directamente.
- Salida: cero callsites sin clasificación; SHA de fuentes y búsquedas guardado en el informe.

### Fase D2 — especificación de protocolo de admisión
- Elegir entre reutilizar un lock cross-process existente o extraer una primitiva común sin duplicar su semántica; comparar ownership, stale-lock, timeout y release-failure.
- Especificar orden de adquisición con locks per-store, sección crítica exacta, reentrancia/no reentrancia, cancelación, errores y cómo el proceso hijo recibe la configuración.
- Salida: pseudocódigo/contrato de estados y matriz de errores; todavía no runtime.

### Fase D3 — diseño de compatibilidad/migración
- Definir transición de `--continuity`/`--chronicle` a raíz única; modo de error para combinaciones mixtas; detección de datos existentes y conflicto de fuente.
- Diseñar migración sin dual-write ni merge automático. Primero dry-run, luego backup/copia verificable, cutover explícito y comprobación posterior. No borrar el origen en la misma operación de cutover.
- Salida: procedimientos reversibles documentados y pruebas previstas.

### Fase D4 — test plan y gate de implementación
Pruebas obligatorias cuando el runtime sea autorizado:
1. Derivación determinista de rutas desde una raíz; input inválido no crea archivos.
2. Dos procesos independientes, dos entrypoints distintos, misma raíz: el segundo no lee/materializa snapshot hasta admisión.
3. Misma operación con raíces/rutas conflictivas: bloqueo explícito; nunca mezclar instancias.
4. CLI padre → child de append: misma raíz, mismo lock y misma configuración.
5. Consultas status/mission/plan/previews/Open Loops se cubren según el alcance de admisión decidido; no quedan bypasses.
6. Owner bootstrap, inicialización legacy y commit/append usan la misma admisión sin cambiar semántica de inicialización.
7. Timeout de adquisición: cero cambios de bytes, mtime y storeRevision; cero dispatch.
8. Fallo/timeout al liberar o propiedad incierta: estado bloqueado/UNKNOWN; no se inicia otra operación protegida.
9. Excepciones durante lectura, serialización, escritura, rename y validación: liberación segura; no se afirma commit no observado.
10. Tests cross-process conservan los locks per-store actuales y demuestran que el nuevo lock no rompe sus invariantes.
11. Pruebas de regresión para límites de recursos y limpieza de `.tmp`; no se reescribe esa lógica.
12. Tests estáticos/callsite que fallen si un entrypoint de producción accede a store sin el contexto de instancia.
13. Garantizar que no se invoca despacho ni se eleva autorización por adquirir la raíz o el lock.

### Fase D5 — implementación en unidad coherente
Solo después de que D0–D4 estén cerradas documentalmente y el propietario autorice implementar:
- introducir el contrato de instancia en la capa de aplicación/core;
- migrar todas las entradas y procesos hijos en una unidad coherente;
- eliminar o bloquear rutas de producción que acepten paths sueltos;
- mantener el protocolo de archivos y los contratos de autoridad separados;
- añadir pruebas con cada commit de implementación, sin dejar un estado intermedio que se anuncie como garantía completa.

### Fase D6 — CI y aceptación
- Ejecutar `npm test` y workflows de Chronicle/Continuity/STEP relevantes en el SHA exacto de código+pruebas.
- Guardar run IDs, jobs, logs/artefactos, SHA y la interpretación. CI de docs no sustituye CI de runtime.
- Revisar todas las rutas en la matriz y confirmar que no hay bypass.
- Solo entonces declarar la garantía de exclusión cooperante por instancia. Heap exacto y cuota global de disco continúan OPEN salvo pruebas y mecanismos separados.

## 5. Criterios de aceptación del diseño

El diseño documental no está cerrado hasta que cada respuesta tenga decisión explícita:
- [ ] fuente y precedencia de configuración de raíz;
- [ ] raíz inexistente: rechazo o creación autorizada en paso explícito;
- [ ] canonicalización y política de symlink/alias;
- [ ] lista completa de entrypoints/callers y clasificación;
- [ ] alcance exacto de operaciones serializadas y materialización de snapshots;
- [ ] protocolo de lock cross-process y compatibilidad con locks per-store;
- [ ] timeout, stale ownership, release failure y error mapping;
- [ ] compatibilidad de API/CLI y tratamiento de argumentos legacy;
- [ ] migración de datos existentes, conflictos y reversión;
- [ ] test plan con evidencia cross-process y no-bypass;
- [ ] límites no cubiertos declarados;
- [ ] confirmación explícita del propietario para pasar de diseño a implementación.

## 6. Estado canónico y siguiente paso

- Dirección de diseño: Opción A aceptada.
- Contrato: propuesto en este documento, subdecisiones abiertas.
- Runtime: **SIN CAMBIOS**.
- Pruebas/CI de nueva funcionalidad: **NO EJECUTADAS; no hay implementación**.
- M0: `INCOMPLETO`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Siguiente paso: terminar D0/D1 desde el inventario completo de producción y resolver las subdecisiones del contrato. No implementar runtime ni crear un lock aislado antes de cerrar esas decisiones.


## 7. Inventario de implementación ampliado — sweep de módulos actuales

Se hizo una segunda pasada sobre todos los módulos `.mjs/.js` de `src/nexo/` y los scripts `scripts/nexo*.mjs` de la rama actual. No apareció otra construcción directa de las factories Chronicle/Continuity fuera de las rutas indicadas en la matriz; sí aparecen consumidores de objetos `owner/store` que deben quedar dentro del contexto de admisión. Esto mejora el inventario, pero la comprobación final de no-bypass deberá convertirse en una búsqueda/test repetible durante la implementación.

| Grupo | Callers/consumidores encontrados | Clasificación de migración |
|---|---|---|
| Factory de Continuity | `src/nexo/application/continuity-queries.mjs`, `src/nexo/application/chronicle-append.mjs`, `src/nexo/core/continuity-service.mjs` | Entradas productivas primarias; reciben path directamente hoy. Migrar a instancia/admisión. |
| Factory de Chronicle | `src/nexo/application/chronicle-append.mjs` | Entrada productiva primaria; recibe path directamente hoy. Migrar a instancia/admisión. |
| Store primitive consumers | `src/nexo/adapters/chronicle-effect.mjs` llama `store.append`; `src/nexo/core/continuity-owner.mjs` expone `loadCurrent`; `src/nexo/core/owner-backed-runtime.mjs` llama `owner.loadCurrent`; `src/nexo/core/protected-transition.mjs` usa puerto `conditionalCommit` | No crean raíz por sí mismos. La admisión debe adquirirse en el dueño de operación antes de cargar el store y mantenerse hasta finalizar el ciclo; no introducir locks anidados en helpers. |
| Repair entrypoint / session | `scripts/nexo-repair-entrypoint.mjs`, `scripts/nexo-repair-session.mjs` leen `owner.loadCurrent()` y coordinan fases | Consumidores indirectos de persistencia. La admisión común solo puede abarcar su acceso a datos si/ cuando el flujo sea permitido; este documento no levanta el gate constitucional de repair. |
| Repair preparation/dispatch/settlement/verification | `scripts/nexo-repair-preparation.mjs`, `nexo-repair-dispatch.mjs`, `nexo-repair-settlement.mjs`, `nexo-repair-mission-verification.mjs`; aparecen lecturas `owner.loadCurrent()` o `store.loadCurrent()` en dispatch/entrypoint/settlement/verification | Son fases con fronteras distintas, y dispatch es un posible efecto. No unir dispatch a la raíz ni tratar lock como permiso. Primero mapear cómo reciben owner/store y confirmar el gate actual. |
| CLI de Continuity | `scripts/nexo-continuity.mjs` reexporta `openNexoContinuityOwner` | Superficie de reexport; determinar consumidores externos. Debe exigir instancia o quedar declarada como primitive low-level no apta para el claim agregado. |
| Runtime session | `scripts/nexo-runtime-session.mjs` coordina una sesión; no construye directamente los dos stores en el módulo revisado | Mantener dentro del inventario por dependencia transitiva; no asumir cobertura por nombre ni reabrir/activar efectos. |
| Adaptadores y validadores | `chronicle-observation.mjs`, `persisted-repair-observation.mjs`, `conditional-commit-persist-state.mjs`, contratos, snapshot/data guards y validadores | No crean stores directamente en el sweep; pueden recibir funciones/objetos conectados a persistencia. Confirmar el caller de cada adapter al revisar el grafo completo. |
| Tests/workers | `tests/nexo/chronicle-store.test.mjs`, `continuity-store.test.mjs`, `persistence-lock-worker.mjs` y procesos inline | Pruebas de primitive/per-store; conservarlas. No cuentan como entrypoints de producción, pero sirven de base para cross-process tests nuevos. |
| Orquestación genérica | `src/nexo/orchestrator.js`, `runtime.js`, `effect-adapter.js`, `simulation-adapter.js` | No crean directamente stores en el sweep. Mantener separadas las operaciones de runtime/efectos; no afirmar cubiertas por raíz salvo que la cadena de llamadas se pruebe. |

### Resultado del sweep

- **Entradas productivas que aceptan rutas independientes:** CLI de status/mission/preview, CLI Chronicle child y API de aplicación/store/owner identificadas arriba.
- **Consumidores indirectos que requieren sección crítica heredada:** owner, owner-backed runtime, adapters, repair y settlement/verification.
- **Superficies que deben seguir bloqueadas o fuera de garantía:** repair/dispatch y ejecución protegida; no heredan autorización por usar raíz.
- **No-bypass aún no demostrado:** el sweep estático identifica rutas conocidas, pero no reemplaza una matriz exhaustiva de callsites, reexports, importaciones dinámicas y consumidores fuera del repo. La fase D1 solo se cierra al guardar las búsquedas/callsite matrix completa y al añadir una regresión automatizada.
