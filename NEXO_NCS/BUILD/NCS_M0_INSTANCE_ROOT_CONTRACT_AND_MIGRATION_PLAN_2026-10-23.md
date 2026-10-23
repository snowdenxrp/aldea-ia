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

## 8. D0 — subdecisiones propuestas con fundamento técnico (pendientes de cierre)

Estas recomendaciones evitan inventar comportamiento durante la implementación. Son propuestas técnicas, no decisiones atribuidas al propietario.

| Subdecisión | Recomendación propuesta | Motivo / prueba de salida |
|---|---|---|
| Interfaz pública inicial | CLI: exigir --root en todos los comandos de instancia. API: aceptar un objeto de instancia validado, no rutas de stores sueltas. No usar env var en la primera migración. | Una sola fuente explícita; evita precedencia CLI/env y raíces implícitas. La falta de raíz o raíz duplicada debe bloquear antes de abrir stores. |
| Compatibilidad CLI antigua | Sin fallback silencioso. Aceptar la interfaz antigua solo si un adaptador explícito deriva una raíz inequívoca y comprueba que ambas rutas son las canónicas bajo ella; de lo contrario, error estructurado. Si no puede demostrarse equivalencia, retirar el modo antiguo en el mismo corte. | Evita comandos antiguos fuera de la admisión compartida. No mover ni reescribir datos automáticamente. |
| Raíz inexistente | Rechazar por defecto. Creación solo mediante operación de bootstrap separada y explícita; nunca como efecto lateral de status/preview. | Las consultas de solo lectura no deben crear directorios ni mundos nuevos. Test: cero mutaciones ante raíz inexistente. |
| Canonicalización | Requerir directorio existente y resolverlo con realpath antes de derivar rutas. Symlinks que resuelvan al mismo directorio deben converger. Cambios adversarios de symlink entre validación y uso quedan fuera del modelo cooperante. | Normalización lexical no basta. Probar alias/symlinks cooperantes, symlink roto y archivo usado como raíz. Mount aliases no demostrados quedan fuera de garantía. |
| Layout | Derivar nombres canónicos solo de la raíz resuelta. Antes de confirmar continuity.json y chronicle.json, verificar conflictos con instalaciones existentes. No añadir manifiesto ni instance ID salvo necesidad demostrada. | Evita nuevas fuentes de verdad y sistemas de identidad paralelos. |
| Alcance de admisión | Serializar operaciones completas que leen o mutan Continuity/Chronicle y las que materializan snapshots/proyecciones. Excluir funciones puras. Repair/dispatch solo se cubre para consistencia si su gate independiente lo permite; el lock nunca autoriza efectos. | Busca snapshot coherente por instancia, no serializar todo Nexo ni cambiar el gate constitucional. |
| Lecturas concurrentes | En primera versión, incluir consultas y previews que cargan snapshots en la misma admisión exclusiva. Reconsiderar read/write lock solo con evidencia de necesidad. | Más simple de demostrar; coste de latencia explícito. |
| Reentrancia | Lock de instancia no reentrante. La frontera superior lo adquiere una vez y pasa contexto/lease a helpers; ningún helper vuelve a adquirirlo. | Evita deadlock propio y hace visible el límite de sección crítica. |
| Timeout | Usar el contrato monotónico existente en lock-deadline.mjs y documentar presupuesto explícito. El default actual de locks existentes es 2,000 ms. No copiar un deadline absoluto entre procesos: el reloj monotónico es local a cada proceso. | El timeout limita espera cooperante, no interrumpe una syscall que no regresa. |
| Lock cross-process | Especificar una única primitiva reusable de lock para la instancia, sin copiar una tercera implementación. Comparar/extraer primero el protocolo existente y mantener locks per-store como segunda barrera. | Chronicle y Continuity se parecen, pero no son idénticos: Continuity recuerda fallos de liberación en un Set local; Chronicle devuelve fallo sin esa memoria. No son intercambiables sin pruebas. |
| Propiedad stale / release incierto | Fail closed; no borrar automáticamente lock stale ni asumir liberación. Preservar fase, writeStarted y resultado de liberación en los errores. | Evita borrar un lock nuevo o convertir estado desconocido en éxito. Probar proceso muerto, owner record parcial y release fallido. |
| Stores de bajo nivel | Mantener factories para tests/composición; producción debe obtener stores mediante una API de instancia que haga difícil omitir admisión por diseño. No confiar solo en grep de CLI. | Las factories exportadas aceptan paths; cualquier caller productivo directo invalida el claim agregado. |
| Fuente de datos previa | No asumir que archivos existentes están ya bajo una raíz única. Descubrir paths, contenido y revisiones antes de migrar; si están fuera, preparar cutover verificable por instalación. | No copiar ni mover sin verificar. No merge automático, dual-write ni borrar el origen durante el cutover. |
| Variable de entorno | No soportarla inicialmente. Si se añade luego, resolverla en una sola frontera y rechazar discrepancia entre env y argumento. | Evita divergencias entre CLI padre e hijo y raíces heredadas implícitamente. |

## 9. Lock protocol — diferencia observada que condiciona el diseño

Los stores comparten algunas propiedades, pero sus implementaciones no son idénticas:
- Ambos crean un directorio de lock derivado del store, escriben owner.json con PID/token, esperan con deadline monotónico, detectan locks stale sin recuperarlos automáticamente y fallan cerrados ante owner state desconocido.
- Chronicle no tiene el mismo registro local de fallos de liberación que Continuity; Continuity mantiene un Set local para bloquear reintentos hasta limpieza externa, mientras Chronicle devuelve status failed.
- El default de espera en lock-deadline.mjs es 2,000 ms; ambas implementaciones consultan deadline y usan reintentos breves.
- El lock de instancia debe ser compartido por procesos; no puede basarse en mutex de módulo ni en el Set local. Requiere contrato persistente cross-process de adquisición, propietario y liberación.
- Recomendación: especificar primero un único contrato reusable de file-lock y sus pruebas; decidir solo durante implementación autorizada si se extrae/refactoriza la lógica per-store o si la nueva primitiva es independiente. No cambiar ahora el protocolo de stores ni declarar equivalencia sin tests.

## 10. D1 — criterio de inventario reproducible

La búsqueda de código de GitHub no devolvió resultados utilizables en esta sesión; el inventario actual se obtuvo revisando el árbol recursivo de la rama y abriendo los módulos relevantes. Por eso el sweep no demuestra ausencia exhaustiva de referencias.

Antes de cerrar D1, ejecutar desde el checkout exacto de la rama esta búsqueda:

    rg -n --hidden --glob '!node_modules/**' 'createNexoChronicleStore|createNexoContinuityStore|openNexoContinuityOwner|runNexoChronicleAppend|continuityPath|chroniclePath|--continuity|--chronicle|\.loadCurrent\(|\.initialize\(|\.commitIfCurrent\(|\.append\(' src scripts tests .github package.json

Clasificar cada match en una matriz con archivo, función/caller, tipo de acceso (read/write/bootstrap/preview/effect-adjacent), proceso, admisión requerida, test y evidencia. Revisar también imports dinámicos y reexports. Guardar salida bruta, SHA y resumen en un artefacto documental; añadir un test automatizado de arquitectura durante la implementación.

**Limitación operativa actual:** este comando no se ha ejecutado en un checkout local de la rama en esta sesión. No afirmar que la matriz está cerrada. El repositorio remoto solo recibió cambios documentales.

## 11. Gate explícito antes de runtime

El siguiente cambio permitido sin autorización de implementación es seguir cerrando el contrato y completar la matriz de callers. Todavía no se permite:
- introducir el lock de instancia;
- cambiar firmas públicas de APIs o factories;
- cambiar resolución de rutas de CLI o proceso hijo;
- migrar/copiar archivos de usuario;
- modificar protocolos .tmp, locks per-store o workflows.

Para salir de diseño deben registrarse las decisiones de D0, una matriz de callers completa y el test plan final. La autorización de implementación será un paso separado.


## 12. Recomendación consolidada D0 — revisión 2026-10-23

El propietario indicó que no tiene por qué escoger entre opciones técnicas y pide que se recomiende la combinación conveniente. Esta sección registra la **recomendación del consultor**, no atribuye al propietario una aceptación técnica específica ni autoriza runtime.

| Tema | Recomendación | Por qué |
|---|---|---|
| Configuración | CLI con `--root`; API con objeto de instancia validado; sin variable de entorno en la primera migración. | Una sola fuente explícita, menor ambigüedad entre proceso padre e hijo. |
| Raíz inexistente | Rechazar por defecto; bootstrap explícito separado. | Una consulta/preview no debe crear una instancia ni inventar estado. |
| Admisión | Una primitiva cross-process reusable en la frontera de operación; mantener locks per-store hasta probar compatibilidad. | Cubre procesos y entrypoints distintos sin descartar defensas existentes. |
| Migración | Dry-run primero; copia/backup verificable; corte explícito; no merge, dual-write ni borrado automático del origen. | Evita pérdida o mezcla silenciosa de continuidad. |
| Canonicalización | Exigir raíz existente y usar `realpath`; probar alias/symlink cooperantes. No prometer protección contra TOCTOU hostil ni equivalencia de mount aliases no probada. | La normalización lexical no unifica necesariamente directorios reales. |
| Alcance | Exclusión exclusiva para operaciones que lean/modifiquen los stores o materialicen snapshots; una sola adquisición en la frontera superior y contexto heredado por helpers. | Evita snapshots concurrentes incoherentes y locks anidados. |
| Fallos | Timeout monotónico bounded; ante adquisición, ownership o liberación inciertos, bloquear y reportar estado estructurado/UNKNOWN; no borrar locks stale automáticamente. | No convertir incertidumbre en éxito ni ejecutar una ruta de fallback. |
| Compatibilidad | No aceptar silenciosamente paths independientes junto con `--root`; adaptador legacy solo si demuestra equivalencia canónica, de lo contrario error explícito. | Evita bypasses del gate de instancia. |
| API low-level | Conservar factories para tests/composición, pero exigir API/contexto de instancia en producción; el inventario automatizado debe detectar bypasses. | Un lock en la CLI solamente no es garantía de repositorio. |

### Consecuencia operativa

Recomiendo usar esta combinación como base para cerrar el diseño documental. Antes de implementación aún deben resolverse con evidencia: matriz completa de callers, contrato exacto del lock reusable (incluyendo stale ownership y release failure), códigos de error, compatibilidad de rutas existentes y procedimiento de migración por instalación. La aceptación de esta recomendación por sí sola no cambia el estado canónico ni abre el gate de runtime.

Estado: D0 **recomendación consolidada**, D1 **abierto**, runtime **SIN CAMBIOS**.


## 13. D1 — segunda pasada sobre módulos productivos (2026-10-23)

Se recuperó el árbol Git recursivo de la rama ncs-clean-architecture (tree SHA db9668f117170fc2e5af743a87e6d6973b765115, truncated=false). El árbol contiene 3019 entradas; se identificaron 44 archivos de código en src/nexo/**/*.mjs|js y scripts/nexo*.mjs|js. Se abrieron los 44 archivos y se buscaron referencias de factories, owners, paths de Continuity/Chronicle, argumentos CLI y operaciones loadCurrent/initialize/commitIfCurrent/append.

Hallazgos confirmados:
- scripts/nexo.mjs: status, mission status/plan y previews aceptan --continuity por separado y llaman directamente a funciones de aplicación.
- scripts/nexo-chronicle-session.mjs: acepta --continuity y --chronicle independientes y llama a runNexoChronicleAppend.
- src/nexo/application/chronicle-append.mjs: construye ambos stores con rutas independientes; carga stores, abre owner, inicializa Chronicle y consulta Continuity.
- src/nexo/application/continuity-queries.mjs: status, mission status/plan, draft preview y Open Loops construyen directamente un store por ruta.
- mission-request-preview.mjs delega al preview; continuity-service.mjs construye el store y hace load/initialize/load.
- Consumidores indirectos observados: scripts/nexo-repair-entrypoint.mjs, nexo-repair-session.mjs, nexo-repair-dispatch.mjs, nexo-repair-settlement.mjs, nexo-repair-mission-verification.mjs, src/nexo/adapters/chronicle-effect.mjs y src/nexo/core/owner-backed-runtime.mjs. Deben heredar la sección crítica si su acceso a persistencia se incluye en el contrato; esto no levanta el gate de repair/dispatch.
- En el resto de módulos productivos escaneados no se encontraron coincidencias literales con esos patrones. Esto no excluye acceso indirecto mediante función inyectada, alias, import dinámico o módulos fuera de esos árboles.

Blobs de referencia: scripts/nexo.mjs e471eb478a09aa8a9a8323795583e198cdf0a127; scripts/nexo-chronicle-session.mjs 30a53de2f108aa255a1dfd61ce78c19788de160b; src/nexo/application/chronicle-append.mjs 5a20044bcddbaee79d0117934eefaea5f3b2c3bc; src/nexo/application/continuity-queries.mjs e1915e94e53e71d37a37952fead37ba62bdae79a; src/nexo/core/continuity-service.mjs 8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c; src/nexo/core/continuity-store.mjs 9ffd28930abdbe29f5b041711cc29b74dc99fbae; src/nexo/core/chronicle-store.mjs 59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a.

Pruebas relacionadas revisadas como muestra (10 archivos, no el conjunto completo): chronicle-store.test.mjs, continuity-store.test.mjs, entrypoint.test.mjs, chronicle-runtime.test.mjs, continuity-migration.test.mjs, continuity-service-options-input-guard.test.mjs, chronicle-session-input-guard.test.mjs, persistence-lock-worker.mjs, open-loops-query.test.mjs y chronicle-effect-input-guard.test.mjs. Los tests ejercitan factories directas y locks per-store; una futura API de instancia deberá mantener pruebas de primitivas separadas de las pruebas de no-bypass productivo.

Límite D1: esta pasada remota no equivale a ejecutar rg sobre un checkout local completo. No inspecciona cada archivo fuera de src/nexo/ y scripts/nexo*.mjs, no clasifica todos los imports/reexports/dynamic imports de todo el repo y no crea todavía un test de arquitectura. D1 sigue ABIERTO; no declarar matriz exhaustiva ni garantía no-bypass. No se modificó runtime, tests ni workflows.


## 14. D2 — contrato recomendado para admisión compartida (2026-10-23)

### Hechos que cambian el diseño

- `src/nexo/core/chronicle-store.mjs` y `continuity-store.mjs` implementan por separado locks de directorio `<filePath>.lock`, owner token, espera en intervalos de 10 ms, umbral de stale de 60 s y recuperación explícita sin borrado automático.
- Las implementaciones no son equivalentes: Continuity mantiene un `lockReleaseFailures` local por ruta y reintenta una vez el release; Chronicle no tiene esa misma política. Sus errores públicos y metadata de owner también difieren.
- `loadCurrent()` lee el documento sin adquirir el lock del store. Por tanto, un lock compartido en la frontera superior es lo que puede dar coherencia a operaciones compuestas que leen varios almacenes; no debe suponerse que los locks existentes ya protegen consultas o snapshots.
- `lock-deadline.mjs` usa `performance.now()`, con presupuesto predeterminado de 2000 ms. El deadline absoluto pertenece al dominio monotónico del proceso; no debe pasarse entre procesos.
- Ambos stores usan temporal estable `<filePath>.tmp`; los escritores por almacén ya dependen de su lock individual para evitar pisarse.

### Decisión técnica recomendada para el diseño (no runtime)

**Introducir una admisión de operación por raíz canónica como capa adicional y mantener intactos los locks per-store en la primera implementación.** No unificar todavía los dos locks existentes: esa refactorización mezcla el objetivo de coordinación de instancia con cambios de semántica de persistencia y añade riesgo sin ser necesaria para el primer corte.

Contrato propuesto para la capa de instancia:

1. La API de instancia recibe una raíz ya validada/canonicalizada y una operación explícita. Las funciones internas reciben un contexto opaco de admisión; no adquieren recursivamente el lock raíz.
2. La clave del lock raíz se deriva de la ruta real de la raíz (nombre reservado interno documentado, distinto de las rutas de almacén). Debe comprobarse que la raíz exista, sea directorio y sea accesible antes de intentar admisión. No crearla implícitamente.
3. La admisión es exclusiva para todas las operaciones que leen o escriben Continuity/Chronicle o materializan snapshots derivados. Las funciones puras que no tocan persistencia quedan fuera.
4. Orden de locks fijo: **raíz de instancia → lock per-store**. Ningún entrypoint debe adquirir primero un lock per-store y luego intentar la raíz. Los callbacks bajo admisión no pueden reentrar a la API pública de instancia.
5. La admisión tiene presupuesto acotado derivado de un timeout relativo en cada proceso; el proceso hijo inicia su propio deadline local. No transportar el valor absoluto de `performance.now()` por IPC.
6. Owner record validado y token de propiedad obligatorio para liberar. Lock inexistente/owner incompleto durante creación puede reintentarse solo en el caso explícito ENOENT; JSON inválido, permisos, inspección incierta o token diferente se bloquean como UNKNOWN/ownership uncertain.
7. No recuperar locks stale automáticamente. Un lock viejo con PID no vivo produce `NEXO_INSTANCE_LOCK_STALE_RECOVERY_REQUIRED`; el estado de lock/owner desconocido produce `NEXO_INSTANCE_LOCK_STATE_UNKNOWN`; expiración produce `NEXO_INSTANCE_LOCK_ACQUISITION_TIMEOUT`. Fallos de adquisición y liberación se normalizan a códigos estables, preservando phase y si empezó alguna escritura.
8. Si la liberación falla o la propiedad es incierta, el resultado de la operación no se presenta como éxito limpio. Informar por separado el resultado de persistencia ya observado y el estado de liberación; impedir otra operación en el mismo proceso si no puede probarse que el lock anterior se eliminó, o exigir recuperación explícita. El mecanismo exacto de cuarentena local debe quedar testeado antes de runtime.
9. La primitiva no reclama exclusión contra procesos hostiles, seguridad frente a TOCTOU/symlink race, garantías en sistemas de archivos de red, fsync/power-loss durability, ni autoridad constitucional. Es una coordinación entre procesos cooperantes en almacenamiento local confiable.
10. El lock de instancia no se adquiere en la CLI padre para luego ser adquirido de nuevo por el hijo. La operación con persistencia debe adquirirlo en una sola frontera: o el padre delega sin poseerlo y el hijo lo adquiere, o el padre mantiene una API en proceso y el hijo no es usado. La primera migración de Chronicle debe escoger un único dueño y probarlo con concurrencia real.

### Errores y resultado de operación

El wrapper de instancia debe devolver resultados de forma estructurada y no mezclar el estado de negocio con el estado del lock. Contrato mínimo interno recomendado:
- `operation.status`: resultado existente de la operación de negocio, sin reinterpretarlo.
- `admission.status`: `acquired | blocked | release_uncertain`.
- `admission.code`: código estable, presente cuando no se puede afirmar admisión/liberación correcta.
- `admission.phase`: `root_validation | lock_acquisition | operation | lock_release`.
- `admission.writeStarted`: booleano conservador si la operación alcanzó el inicio de una escritura.

Este shape es una propuesta interna de diseño, no un contrato público definitivo; antes de implementarlo se debe comparar con los result objects existentes para no romper consumidores.

### Riesgos bloqueantes para cerrar D2

- **Release y resultado ambiguo:** Chronicle y Continuity ya manejan de modo distinto fallos de liberación; la capa raíz no puede borrar esa diferencia ni ocultar persistencia ambigua.
- **Operaciones compuestas y reentrada:** append abre stores, lee, inicializa y consulta owner; los entrypoints de reparación hacen múltiples lecturas. Debe definirse el límite superior exacto y evitar locks anidados.
- **Proceso padre/hijo:** adquirir en ambos produciría timeout/deadlock; adquirir solo en padre pero saltar el gate en otros entrypoints dejaría bypass.
- **Bootstrap/migración:** la inicialización de continuidad hoy existe en `openNexoContinuityOwner` y requiere una condición explícita. La API de raíz no debe inferir que un store ausente significa instancia nueva.
- **Tests low-level:** las pruebas de store deben continuar ejercitando los locks per-store; una suite de API de instancia debe verificar la exclusión compuesta y que cada entrypoint de producción no pueda acceder directamente sin contexto.

**Recomendación de cierre:** aceptar el diseño de capa de admisión adicional, pero mantener D2 abierto hasta que se documente el grafo de llamadas de los entrypoints críticos (especialmente repair/runtime), se decida el dueño del lock para el proceso Chronicle padre/hijo y se redacte la matriz de pruebas de release incierto y no-bypass. No cambiar runtime, tests ni workflows antes de ese cierre.


## 15. D2 — mapa de llamadas y propiedad de admisión por entrypoint (2026-10-23)

### Call graph confirmado en el código actual

| Entry point / helper | Acceso observado | Frontera recomendada para admisión | Alcance actual |
|---|---|---|---|
| `scripts/nexo.mjs` → `continuity-queries.mjs` | Queries status, mission status/plan, draft preview y Open Loops leen Continuity y materializan snapshots. | Envolver cada comando en API de instancia antes de llamar a la query; query recibe contexto/store ya admitido o se vuelve helper interno. | Lectura/preview; no despacho. |
| `scripts/nexo-chronicle-session.mjs` → `runNexoChronicleAppend` | CLI hijo acepta paths de Continuity y Chronicle separados; application append construye stores, lee ambos, abre owner, inicializa Chronicle y consulta Continuity. | El proceso que ejecuta el append adquiere exactamente una vez la admisión raíz; no asumir que un caller externo ya la tiene. En el CLI actual, el hijo es dueño. | Escritura de Chronicle y acceso compuesto. |
| `continuity-service.mjs` → `openNexoContinuityOwner` | Lee Continuity; si no existe puede inicializar desde legacy memory o bootstrap explícito. | API de instancia controla bootstrap y llama al servicio interno dentro de una admisión única. No convertir missing store en creación automática. | Lectura y potencial inicialización. |
| `nexo-repair-entrypoint.mjs` → preparation/dispatch/settlement | El protocolo encadena varias lecturas de owner, prepara un journal, puede despachar una reparación al archivo de entorno, registra lineage y liquida por CAS. | Si vuelve a estar habilitado en producción, debe tener una única admisión de operación de extremo a extremo, pero la operación sobre archivo de entorno no es atómica con Continuity; no prometer transacción cross-store. | El wrapper `nexo-runtime-session.mjs` bloquea hoy esta integración con `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`. Mantener el bloqueo. |
| `nexo-repair-settlement.mjs` / `nexo-repair-mission-verification.mjs` | Helpers exportados leen stores directamente; settlement hace CAS; verification revalida la revisión después de observar estado externo. | Si se admiten en una API productiva futura, wrapper en la frontera superior; no agregar lock raíz dentro de estos helpers si ya reciben contexto. | Helpers/protocolo; no son por sí mismos prueba de ruta runtime habilitada. |
| `chronicle-effect.mjs` y `owner-backed-runtime.mjs` | Consumidores indirectos de store/owner observados. | Auditar callers concretos y propagar contexto; no inferir admisión por el mero hecho de recibir un owner. | Requiere clasificación de uso completa. |

### Propiedad del lock para Chronicle CLI

Recomendación: **el proceso que ejecuta `runNexoChronicleAppend` es el único propietario de la admisión raíz**. No colocar un lock raíz en el CLI padre si este delega a un hijo; no pasar un deadline absoluto entre procesos. La CLI hija valida la raíz y adquiere su propia admisión con un presupuesto relativo local. Si en el futuro el padre adquiere admisión y realiza la operación sin hijo, será otro diseño y deberá cambiarse de manera explícita con pruebas, no combinar ambos modelos.

La API pública en proceso debe seguir la misma regla: wrapper de instancia como única frontera, helpers internos que reciben contexto ya admitido. No se deben exponer funciones de aplicación que acepten rutas arbitrarias y accedan a los stores como una segunda API productiva paralela. Las factories low-level se conservan para tests de primitivas y composición interna.

### Corrección importante del alcance

Los módulos de reparación siguen existiendo y tienen funciones exportadas con acceso directo a stores; sin embargo, el runtime session actual devuelve bloqueado antes de despachar por decisión M0 Option A. Esto significa que la integración runtime de reparación permanece excluida, no que los módulos de reparación hayan desaparecido ni que sus pruebas sean innecesarias. La primera migración de raíz no debe reactivar ni ensanchar esta ruta. Debe decidirse por separado si los helpers excluidos requieren una envoltura de instancia ahora o solo cuando su integración vuelva a ser autorizada.

### Pruebas requeridas antes de D2 cerrado

1. Un solo lock raíz cubre toda la operación compuesta y se libera tras éxito, error, excepción y retorno bloqueado.
2. Segundo proceso sobre la misma raíz recibe timeout/blocked y no observa estado intermedio; proceso en otra raíz puede progresar independientemente.
3. El lock raíz no se adquiere dos veces dentro del mismo flujo; test explícito detecta reentrada y orden raíz→store.
4. Chronicle child es el único dueño del lock en el CLI actual; test de integración impide que padre e hijo intenten adquirir el mismo lock.
5. Lock owner corrupto, PID desconocido, stale lock, pérdida de ownership y release failure dan UNKNOWN/blocked y nunca éxito limpio ni limpieza automática.
6. Las queries/previews toman admisión aunque sean read-only porque leen estado mutable; no llaman a dispatch ni escriben stores.
7. API productiva no acepta `--continuity`/`--chronicle` independientes junto con root; legacy paths son rechazados salvo migración explícita con equivalencia probada.
8. Tests low-level de stores continúan cubriendo locks por almacén; suite de arquitectura revisa entrypoints y detecta factories/paths usados fuera de los límites permitidos.
9. M0 runtime repair sigue devolviendo `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; añadir la raíz nunca puede cambiar esa decisión de alcance.

D2 sigue abierto hasta convertir estos requisitos en una matriz completa de entrypoints y revisar los callers indirectos de adapters/runtime. No hay autorización de implementación en esta sección.


## 16. D2 — contrato de resultados de admisión y liberación incierta (2026-10-23)

### Propósito y regla de precedencia

La admisión por raíz es un resultado de coordinación, separado del resultado de negocio. El wrapper no debe reemplazar ni reinterpretar silenciosamente los códigos de las operaciones existentes. Para evitar un falso éxito, la decisión externa combina ambos resultados siguiendo esta precedencia:

1. Si la raíz no se puede validar o el lock no se adquiere, la operación de negocio no comienza. Resultado externo: `blocked`; `admission.status = blocked`; `writeStarted = false`.
2. Si la operación termina y la liberación del lock queda confirmada, el resultado de negocio original se conserva dentro de `operation`, con `admission.status = acquired` como evidencia de que la admisión fue adquirida y luego cerrada correctamente. El nombre `acquired` describe el estado de admisión obtenido; no implica que el lock siga retenido después de retornar.
3. Si la operación falla pero la liberación queda confirmada, se conserva el resultado de fallo original de la operación. No se transforma un fallo de negocio en fallo de lock.
4. Si la liberación del lock no puede confirmarse, el resultado externo es `unknown` o `blocked` según el contrato público que se consolide; nunca un éxito limpio. Se preservan el resultado observado de la operación y la fase `lock_release` como datos diagnósticos internos. No se reintenta automáticamente la operación.
5. Si se pierde la propiedad del lock mientras la operación está en curso, no se asume exclusión válida para el resto de la operación. Se bloquea la continuación cuando sea posible, se registra la incertidumbre y no se afirma atomicidad retroactiva.

### Forma interna recomendada

La forma siguiente es una propuesta de diseño interno y no debe publicarse como API hasta cotejar todos los consumidores:

- `operation`: resultado original de negocio, si la operación llegó a ejecutarse; ausente si no empezó.
- `admission.status`: `acquired | blocked | release_uncertain`.
- `admission.code`: código estable para un bloqueo o una incertidumbre; nulo cuando no hay error de admisión.
- `admission.phase`: `root_validation | lock_acquisition | operation | lock_release`.
- `admission.writeStarted`: indicador conservador de que se alcanzó el inicio de una escritura administrada por la operación; no afirma que el efecto externo se completara ni que no ocurrieran efectos parciales.
- `admission.rootIdentity`: no incluir ruta sensible completa en salida pública ni presentar el nombre/ruta de la raíz como identidad constitucional. Si hace falta correlación diagnóstica, diseñarla por separado y con minimización de datos.

No introducir un segundo `status` de negocio ambiguo en el mismo nivel. El wrapper de instancia es dueño del resultado de admisión; la función de negocio conserva su propio resultado. Los consumidores deben distinguirlos explícitamente.

### Clasificación provisional de errores

Los códigos son candidatos internos y necesitan compararse con las convenciones ya existentes antes de fijar la superficie pública:

| Fase | Condición | Resultado exigido |
|---|---|---|
| `root_validation` | Raíz ausente, inexistente, no canónica o inaccesible | Bloqueado; la operación no comienza |
| `lock_acquisition` | Presupuesto agotado | Bloqueado; no ejecutar la operación |
| `lock_acquisition` | Owner ilegible, corrupto o con identidad/PID desconocidos | Estado desconocido; no borrar el lock |
| `lock_acquisition` | Lock stale o posible pérdida de propiedad | Requiere recuperación explícita; no reclamar el lock automáticamente |
| `operation` | La operación devuelve `blocked`, `conflict`, `unknown` u otro estado existente | Conservar exactamente la semántica de negocio |
| `lock_release` | El token/owner no coincide, el directorio no se puede retirar o el resultado de liberación es incierto | No devolver éxito limpio; no repetir automáticamente la operación |

Códigos internos propuestos a evaluar: `NEXO_INSTANCE_ROOT_INVALID`, `NEXO_INSTANCE_LOCK_ACQUISITION_TIMEOUT`, `NEXO_INSTANCE_LOCK_STATE_UNKNOWN`, `NEXO_INSTANCE_LOCK_STALE_RECOVERY_REQUIRED` y `NEXO_INSTANCE_LOCK_RELEASE_UNCERTAIN`. No sustituir por ellos los errores específicos de los stores ni fijarlos como API pública antes de revisar los contratos existentes.

### Reglas de liberación y repetición

- La adquisición solo se considera válida tras crear el lock y verificar que el registro de propietario corresponde al proceso/token que lo creó.
- La liberación debe verificar la propiedad antes de retirar el lock; jamás eliminar un lock cuyo propietario actual no coincida con el token local.
- Si la operación ya pudo escribir, una liberación incierta no prueba que la escritura falló. El llamador no debe volver a ejecutar append/repair como “reintento seguro” sin una reconciliación específica de esa operación.
- La capa raíz no puede borrar las diferencias actuales de liberación de Chronicle y Continuity. Se conservan los locks per-store y su semántica hasta que las pruebas demuestren compatibilidad.
- El timeout acota la espera cooperativa por adquirir el lock; no promete interrumpir operaciones de filesystem bloqueadas.
- El lock solo coordina procesos cooperantes sobre almacenamiento local compatible. No acredita autoridad, no protege frente a procesos hostiles y no prueba durabilidad ante pérdida de energía.

### Matriz de verificación necesaria para cerrar D2

| Caso | Resultado observable requerido | Efecto prohibido |
|---|---|---|
| Raíz inválida/ausente | Bloqueado antes de llamar a negocio | Bootstrap implícito |
| Contención y timeout | Bloqueado; ningún acceso al snapshot de la operación | Seguir sin lock |
| Owner corrupto/desconocido/stale | UNKNOWN o bloqueado, evidencia preservada | Limpieza automática |
| Operación de lectura correcta | Resultado original + liberación confirmada | Snapshot compuesto fuera de admisión |
| Operación devuelve bloqueo/conflicto | Estado original + liberación confirmada | Reetiquetar como éxito |
| Excepción de negocio | Excepción normalizada según el contrato existente + intento de liberar | Omitir liberación |
| Fallo de liberación tras operación correcta | UNKNOWN/bloqueado; fase `lock_release` | Éxito limpio o reejecución automática |
| Pérdida de ownership | UNKNOWN/bloqueado | Continuar afirmando exclusión |
| Dos procesos, misma raíz | Exclusión; segundo espera o bloquea por timeout | Lectura de estado intermedio |
| Dos procesos, raíces distintas | Progreso independiente | Lock global accidental |
| Chronicle CLI actual | El proceso que ejecuta `runNexoChronicleAppend` posee el único lock raíz | Lock raíz duplicado padre/hijo |
| Repair/runtime | Se mantiene `NEXO_M0_OPTION_A_EFFECT_EXCLUDED` | Reactivación indirecta por el wrapper |

### Estado de cierre

Esta sección mejora la precisión del contrato, pero **no cierra D2 ni D1**. Falta cotejar los consumidores que esperan formas concretas de resultado, completar la matriz de callers indirectos con evidencia reproducible y definir pruebas automatizadas de no-bypass. Sin una checkout completa no se declarará un barrido equivalente a `rg` de todo el repositorio. No se cambiaron runtime, tests ni workflows en este checkpoint.


## 17. D2 — compatibilidad con resultados existentes y callers indirectos (2026-10-23)

### Resultados existentes observados

Lectura de fuentes de la rama actual; los SHAs exactos se registran abajo. No se ejecutaron tests ni se cambió runtime.

| Superficie | Resultados/contrato observado | Implicación para wrapper de instancia |
|---|---|---|
| `continuity-queries.mjs` | Queries devuelven formas de negocio como `loaded`, `not_found` y `blocked`; incluyen `code`, `storeRevision` cuando corresponde y proyecciones acotadas. | No reemplazar `loaded/not_found` por un estado genérico de admisión. Encapsular el resultado de negocio en la capa interna y proyectar la salida pública solo tras liberar el lock con éxito. |
| `chronicle-append.mjs` | Su `blocked()` incluye `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, `redispatchAuthorized: false`, y puede incluir `phase`, `writeStarted`, `lockRelease`. La superficie pública de Chronicle reconoce `completed`, `blocked`, `conflict`, `unknown`, `observed`, `invalid`. | El wrapper no debe eliminar las marcas de incertidumbre ni colapsar `conflict/unknown` en `blocked` sin preservar el código y los detalles. No debe confundir `admission` con `authorization`. |
| `continuity-service.mjs` | Servicio puede abrir owner, leer y, bajo flags explícitos/condiciones, inicializar continuidad desde memoria legacy o vacío. | La API de instancia debe gobernar bootstrap; una ausencia de archivo no equivale a una instancia nueva. No mover ni duplicar la política de bootstrap sin pruebas. |
| `application/index.mjs` | API de aplicación estrecha: append Chronicle mutante y consultas/previews read-only. | La instancia validada debe convertirse en la frontera de composición productiva; factories de store siguen siendo primitivas internas/tests, no una segunda API productiva por rutas arbitrarias. |
| `chronicle-effect.mjs` | Contrato de adaptador recibe un store explícito y llama a `append/loadCurrent`; la importación por sí sola no activa runtime. | Auditar cada registro/caller de ese adaptador. Pasar contexto de admisión desde la frontera superior; no adquirir lock raíz dentro del adaptador. |
| `owner-backed-runtime.mjs` | Runtime genérico recibe owner/adapter explícitos y produce estados `blocked/conflict/unknown` con banderas de dispatch, journal y reconciliación. | No interpretar un owner inyectado como admisión raíz o prueba de autoridad. La capa raíz no habilita el runtime ni modifica la semántica de reconciliación. |
| Repair entrypoint/session/dispatch/settlement/verification | Los helpers leen y/o escriben Continuity directamente y el dispatch accede a un archivo de estado externo. El protocolo documenta que no es transacción cross-store. | Si se integran en producción en el futuro, admisión debe abarcar la operación de extremo a extremo; no prometer atomicidad entre stores/entorno. La integración actual sigue bloqueada. |
| `nexo-runtime-session.mjs` | Devuelve siempre `blocked / NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `persisted:false`, `dispatchAttempted:false`. | Este gate es invariante de alcance para esta migración. No se debe envolver ni reemplazar por una ruta que llegue al dispatch. |

### Fuentes revisadas en esta pasada

- `src/nexo/application/continuity-queries.mjs` — blob `e1915e94e53e71d37a37952fead37ba62bdae79a`.
- `src/nexo/application/chronicle-append.mjs` — blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`.
- `src/nexo/core/continuity-service.mjs` — blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`.
- `src/nexo/application/index.mjs` — blob `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3`.
- `src/nexo/adapters/chronicle-effect.mjs` — blob `6daf742eb0048724557151a728bf807613a854e9`.
- `src/nexo/core/owner-backed-runtime.mjs` — blob `a7a014489209273ce78d0103afa785728d4c467c`.
- `scripts/nexo-repair-entrypoint.mjs` — blob `74d0fa92c447034e7454b7b846d584819ac81ffd`.
- `scripts/nexo-repair-session.mjs` — blob `1ce95a621ed5bb9f473c9d0f15b5ee3f2f1459a5`.
- `scripts/nexo-repair-dispatch.mjs` — blob `ed45438be7604d3b341cecd5fbcfc69adda2447e`.
- `scripts/nexo-repair-settlement.mjs` — blob `2f6e91d494b4edb012c2b2db5a077b875c5b0348`.
- `scripts/nexo-repair-mission-verification.mjs` — blob `6f9c58cac203faa65e23c1a076af4746f5c22324`.
- `scripts/nexo-runtime-session.mjs` — blob `f67b6fbe1b6f0098ebf23b35055cc668f96df991`.

### Resultado y siguiente frontera

Esta pasada reduce el riesgo de diseñar un wrapper que rompa los estados de negocio existentes, pero no completa la matriz de callers. Todavía falta rastrear todos los call sites de factories, owner y adapters en el árbol completo, incluidos reexports/imports indirectos, y crear una comprobación automatizada de arquitectura/no-bypass. Las búsquedas de código de GitHub en esta sesión no devolvieron coincidencias utilizables; no se interpretan como ausencia de referencias. D1 y D2 siguen ABIERTOS.

Antes de cualquier implementación, la siguiente entrega documental debe ser una matriz reproducible con caller → ruta de entrada → store/owner/adaptador → frontera de admisión propuesta → estado actual (producción, test/primitiva, excluido) → evidencia SHA → riesgo de bypass. No inferir que un helper exportado está habilitado solo por existir. Runtime, tests y workflows siguen sin cambios.
