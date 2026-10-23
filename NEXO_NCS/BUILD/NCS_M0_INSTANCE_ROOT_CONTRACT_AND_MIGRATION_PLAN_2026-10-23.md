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
- `<root>/.nexo-instance.lock/` — directorio reservado de admisión con `owner.json` (candidato D2, no runtime implementado).
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


## 18. D1 — caller matrix reproducible from the complete Git tree (2026-10-23)

### Evidence boundary

The Git tree endpoint for `ncs-clean-architecture` returned tree SHA `cbf0a28c4c31ee1c0be55ad40f76e361d6152893`, `truncated=false`, 3,019 entries and 188 files with `.mjs/.js/.cjs` extensions. This establishes a complete path listing for that Git tree, not an exhaustive semantic scan of every call edge. Relevant source files were then fetched individually and inspected for factory calls, owner construction, entrypoint exports, path flags and store operations. No runtime/tests/workflows were changed.

### Caller matrix

| Caller / entry | Current behavior and evidence | Classification | Proposed admission boundary / bypass risk |
|---|---|---|---|
| `scripts/nexo.mjs` | Imports narrow application API and dispatches status, mission status, plan, previews and Open Loops; accepts `--continuity` paths. Blob `e471eb478a09aa8a9a8323795583e198cdf0a127`. | CLI entrypoint; read-only queries/previews. | Replace independent path input with explicit instance root and route every operation through instance API. Direct calls into low-level application functions remain a bypass until callers are migrated or explicitly marked test/internal. |
| `scripts/nexo-chronicle-session.mjs` | Parses `--continuity` and `--chronicle`, invokes `runNexoChronicleAppend`. Blob `30a53de2f108aa255a1dfd61ce78c19788de160b`. | Mutating Chronicle CLI. | The process actually running append owns exactly one root admission; do not lock in both parent and child. Independent store paths must be rejected in production after migration. |
| `src/nexo/application/chronicle-append.mjs` | Constructs Chronicle and Continuity stores from separate `chroniclePath` / `continuityPath`, opens owner, can explicitly initialize continuity. Blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`. | Application use case, mutating. | Instance wrapper is the only production entry; validate root and both derived paths before reading, bootstrapping or appending. Preserve existing error/result semantics. |
| `src/nexo/application/continuity-queries.mjs` | Five exported query/preview functions each take a path and construct/load a Continuity store directly. Blob `e1915e94e53e71d37a37952fead37ba62bdae79a`. | Application read-only use cases. | All snapshot-producing reads must pass through root admission. These path-based functions may remain low-level only if production export/architecture tests prevent bypass. |
| `src/nexo/application/mission-request-preview.mjs` | Delegates request preview to `previewNexoMissionDraft(continuityPath,...)`. Blob `4e317b646d0c7b7403acfb63732dec8c3fe7778b`. | Read-only indirect caller. | Must receive the same validated instance/admission context, not independently re-enter or reacquire root lock. |
| `src/nexo/application/index.mjs` | Public export surface for append, continuity queries and mission request preview. Blob `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3`. | Intended public API boundary. | Evolve toward instance-oriented API. Keep low-level factories and path APIs out of the supported production surface, with compatibility tests before removing or changing them. |
| `scripts/assistants.mjs` | Opens `openNexoContinuityOwner({filePath:NEXO_CONTINUITY_PATH, legacyMemory, allowEmptyInitialization})`; records a mission; persists learning memory and environment state; later reads owner again. Blob `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`, especially lines 47–54, 89–106, 109–122. | **Additional direct production caller found in this pass.** Composite workflow touching Continuity, legacy memory, learning memory and environment state. | Must be included in root/bootstrap migration inventory. Admission around Continuity alone does not make the environment and learning-memory writes one transaction; do not claim cross-file atomicity. Need decide in design whether this workflow is a distinct instance-level use case or remains explicitly outside the root-governed Nexo persistence boundary. |
| `scripts/nexo-continuity.mjs` | Re-exports `openNexoContinuityOwner` from continuity service. Blob `f08969f2d77a2e90f74d01c96242e29de89e3f22`. | Compatibility facade; can bypass application API if imported by production code. | Trace every importer; either route through instance composition or explicitly limit to tests/internal tools. Do not infer harmlessness from its small file size. |
| `src/nexo/core/continuity-service.mjs` | `openNexoContinuityOwner` constructs store and permits legacy-memory projection or explicit empty initialization. Blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`. | Composition/bootstrap primitive. | Bootstrap must be an explicit instance-level action; root missing/empty must not silently create or import memory. Keep primitive available for tests while blocking unadmitted production paths. |
| `src/nexo/core/continuity-store.mjs` / `chronicle-store.mjs` | Export low-level store factories; each has own file lock and stable temp-file cleanup. Blobs `9ffd28930abdbe29f5b041711cc29b74dc99fbae` / `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`. | Persistence primitives. | Preserve per-store locks; add root lock above composite operations. Factories must not themselves reacquire root admission. Architecture tests must distinguish tests/primitives from production entrypoints. |
| `src/nexo/adapters/chronicle-effect.mjs` | `createNexoChronicleEffectContracts` accepts a store and calls `store.append`; blob `6daf742eb0048724557151a728bf807613a854e9`. | Effect adapter primitive; registration not implied by import. | Caller must pass the admitted context/store from the upper boundary; no root-lock acquisition in adapter. Audit every registration path before calling it production-enabled. |
| `src/nexo/core/owner-backed-runtime.mjs` | Exports `executeNexoStepWithContinuityOwner`; takes owner/adapter contracts and loads owner state; blob `a7a014489209273ce78d0103afa785728d4c467c`. | Runtime primitive / injected dependencies. | A supplied owner is not evidence of root admission or legitimate authority. Keep root orchestration outside, and preserve reconciliation/dispatch invariants. |
| `src/nexo/runtime.js` + `src/nexo/simulation-adapter.js` | Runtime can create a Lumina adapter and execute a step; blobs `9d3d5109753e8ba96fc287c269da275112645523` / `318d97bd4626d6fea9289d505e071ab82ed45cc5`. | Separate simulation/runtime surface; must not be accidentally enabled by a storage refactor. | Trace imports from actual app/CLI callers. Root migration must not expand effect allowlists or equate instance admission with protected authority. |
| `scripts/nexo-repair-session.mjs` → `nexo-repair-entrypoint.mjs` → dispatch/settlement | Repair path reads Continuity and external state file, can persist environment state, and documents lack of cross-store transaction. Blobs: session `1ce95a621ed5bb9f473c9d0f15b5ee3f2f1459a5`; entrypoint `74d0fa92c447034e7454b7b846d584819ac81ffd`; dispatch `ed45438be7604d3b341cecd5fbcfc69adda2447e`; settlement `2f6e91d494b4edb012c2b2db5a077b875c5b0348`. | Dedicated protocol helpers; current product runtime path excluded. | Do not reactivate as part of root migration. If ever reconsidered, design admission over the entire protocol and external state path, with explicit reconciliation; no cross-file atomicity claim. |
| `scripts/nexo-runtime-session.mjs` and caller in `scripts/assistants.mjs` | Runtime gate always returns `blocked / NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; assistant caller is guarded by `--nexo-repair-once`. Blobs `f67b6fbe1b6f0098ebf23b35055cc668f96df991` / `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`. | Explicitly excluded repair dispatch path. | Keep the exact exclusion invariant. Do not replace it with a root-aware wrapper that dispatches repair. |
| `src/nexo/core/protected-transition.mjs` | Exports `executeProtectedTransition`; blob `39a602b80cda8f3939b2ffed7e726d06c21b077f`. | Protected transition primitive. | Root admission must not authorize this transition; separate constitutional authorization/effect-boundary proof remains mandatory. |

### Important design implication from `scripts/assistants.mjs`

The new direct caller means the initial proposal “migrate CLI paths and application exports” is insufficient by itself. The script's continuity path, legacy-memory bootstrap and composite state writes must be explicitly dispositioned before D1 can close. A safe next design is to classify this workflow as a named instance operation with a single admission spanning its Continuity reads/writes and relevant in-process steps, while explicitly documenting that writes to separate files are not transactional. If the product intends to leave learning memory/environment state outside this instance contract, that boundary must be explicit and tests must prove no protected effect is enabled through it.

### Remaining completeness conditions

- The recursive Git tree is complete, but not every one of the 188 JS files or all dynamic import/re-export paths has been semantically analyzed. This matrix is reproducible and materially broader, not a claim of exhaustive call-graph closure.
- Search the complete tree for imports of `scripts/nexo-continuity.mjs`, `openNexoContinuityOwner`, path-based application exports, adapter registration and runtime exports; record every production/test caller or report search limitations explicitly.
- Add an architecture test proving production entrypoints use the instance boundary, with allowlisted test primitives and the `scripts/assistants.mjs` route accounted for.
- D1 remains OPEN. D2 remains OPEN until call graph, public result compatibility, migration protocol and required concurrency/release tests are closed.
- No runtime, tests or workflows changed in this checkpoint.


## 19. D1/D2 — disposition of the assistants integration and search limitations (2026-10-23)

### Confirmed path configuration in `scripts/assistants.mjs`

The file does not use a single Nexo instance root. It independently derives three paths, two of which can be overridden with environment variables:

- `NEXO_STATE_PATH` → `world-state.json` by default.
- `NEXO_LUMINA_MEMORY_PATH` → `.lumina-assistant-memory.json` by default.
- `NEXO_CONTINUITY_PATH` → `.nexo-continuity.json` by default.

Source blob: `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`, lines 19–25 and 47–54. This confirms the risk of accidentally combining independent paths. The environment and Lúmina learning memory are not to be silently moved into the Nexo root: Nexo ≠ Lúmina, and the instance root is a persistence locator, not a constitutional authority.

### Recommended design disposition (not implemented)

1. Treat `scripts/assistants.mjs` as a composite Lúmina + Nexo integration, not as a low-level Nexo store factory.
2. Before any runtime change, define which exact sub-operation is the Nexo instance operation and ensure all of its Continuity snapshots/commits use the one admitted instance context.
3. Keep `world-state.json` and `.lumina-assistant-memory.json` paths independent until a separate explicit integration contract says otherwise. Do not auto-relocate, merge or dual-write them during root migration.
4. Do not claim cross-file transactionality. A root lock can coordinate cooperating Nexo instance operations only; it cannot make environment state, Lúmina memory and Continuity one atomic commit, and cannot coordinate with unmodified processes that ignore it.
5. Replace `NEXO_CONTINUITY_PATH` as an implicit production override with explicit migration-only handling once the new instance API is ready. In normal production mode, reject ambiguous mixtures of `--root` and legacy independent paths. Do not add an environment variable for the new root in the first iteration.
6. The `--nexo-repair-once` path remains blocked by `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; instance migration must not alter this gate.

This is a recommendation for the next implementation design, not permission to change runtime now. It preserves Lúmina separation and avoids broadening root lock into a false cross-file transaction.

### Search/call-graph evidence limitation

Repository code-search requests for `openNexoContinuityOwner`, `nexo-continuity.mjs`, `runNexoChronicleAppend`, `loadNexoContinuityStatus`, `createNexoChronicleEffectContracts` and `executeNexoStepWithContinuityOwner` returned zero results in the connector. That conflicts with direct source evidence proving several of these symbols exist and are called. Therefore these zero-result responses are a search limitation, **not evidence of zero callers**.

The next caller closure method must use the complete tree and targeted file reads, or a checkout-local text scan if available. No negative call-graph claim is permitted from the current code-search results. Until every production import/entrypoint is accounted for and an architecture test can enforce the boundary, D1 stays OPEN.

### Proposed architecture/no-bypass test contract (design only)

- Enumerate supported production entrypoints and their imports from the explicit allowlist; each must construct/receive a validated instance context.
- Fail if production entrypoints import low-level store factories, `openNexoContinuityOwner`, path-based query APIs or direct adapters, except through the instance composition module.
- Permit low-level store/owner primitives in their own modules and in test files; the allowlist must be narrow and explicit, not broad `src/**` wildcard.
- Assert the public application export surface is instance-oriented and rejects simultaneous root and legacy paths.
- Assert all read/query/preview entrypoints require root admission before reading a persisted snapshot.
- Assert Chronicle append has one root-lock owner process and preserves per-store locks.
- Assert `scripts/assistants.mjs` is either migrated to the explicit integration contract or marked as an explicit legacy/non-instance path that cannot be mistaken for the supported production Nexo API.
- Assert `scripts/nexo-runtime-session.mjs` continues returning `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; no architecture change can enable dispatch.
- Keep concurrency/release-uncertain behavioral tests separate from static no-bypass checks; static import checks do not prove lock correctness.

D1 and D2 remain OPEN. Runtime, tests and workflows remain unchanged.


## 20. Existing architecture guard: verified scope and remaining gap (2026-10-23)

### Direct source evidence

- `tests/nexo/entrypoint.test.mjs` (blob `ff1bd2e9d292e21e00049b354249aee684837bbc`) already walks static local imports and re-exports from exactly two roots: `scripts/nexo.mjs` and `scripts/nexo-chronicle-session.mjs`. It verifies that the narrow application API exports only the expected seven use cases and that these entrypoints do not transitively import the compatibility runtime/Lúmina simulation path.
- The same test currently asserts the old path-oriented API shape: `--continuity` is accepted by query/preview commands and Chronicle append accepts independent `--continuity` and `--chronicle` paths. Therefore this is a useful isolation guard, but **not** a root-admission/no-bypass test.
- `tests/nexo/assistants-runtime-cli.test.mjs` (blob `2c4ffb83e3bb849ac35ec381b268ef4f74a13225`) exercises `scripts/assistants.mjs` with all three independent path environment variables. It verifies the repair runtime remains blocked with `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, with no dispatch, no effect journal obligation and no repeated environment write. This is behavioral evidence for the exclusion gate, not evidence that assistants is under a canonical instance root.
- `scripts/nexo.mjs` invokes the Chronicle session as a child process (`spawnSync`); future root admission must be owned by the child process that actually executes append, not acquired in both parent and child.
- `src/nexo/application/index.mjs` remains a path-oriented public surface that re-exports the query and preview functions. No root-oriented API or admission contract is implemented in the inspected source.

### Corrected test classification

The repository does have a partial static import-graph guard and a separate assistants repair-exclusion test. It would be inaccurate to say that there are no architecture tests at all. The exact gap is narrower and more consequential: no verified test currently enforces canonical root admission for every production entrypoint, blocks direct owner/store/path APIs from bypassing that boundary, or tests root-lock concurrency and release uncertainty.

### Closure criteria before implementation

1. Keep the existing Nexo-vs-Lúmina isolation guard and extend its explicit root list to include every supported production entrypoint, including `scripts/assistants.mjs` once its intended disposition is decided.
2. Add a distinct root-admission architecture assertion: production entrypoints must receive/create a validated instance context; direct path-based application functions, `openNexoContinuityOwner`, low-level store factories and direct adapters are forbidden outside a narrow composition allowlist, tests and migration tooling.
3. Do not simply add `scripts/assistants.mjs` to the existing Nexo-only import walker: it intentionally imports Lúmina/assistant modules. Give it a separate composite-integration contract/test so the Nexo isolation rule does not incorrectly classify Lúmina dependencies as a violation.
4. Preserve existing CLI result shapes until compatibility is deliberately migrated; update tests that currently assert legacy path arguments only as part of the explicitly designed API transition, not by weakening them silently.
5. Keep static graph checks separate from multi-process contention, bounded timeout, release-failure, ownership-loss, corrupt/stale lock, same-root exclusion and different-root independence tests.
6. Preserve the repair exclusion test exactly in meaning: instance admission never authorizes effects, and the repair path remains blocked.

This closes one ambiguity in the earlier notes: a guard exists, but its scope is two CLI import graphs and runtime/Lúmina isolation, not instance-root enforcement. D1/D2 remain OPEN. Runtime, tests and workflows were not changed in this checkpoint.


## 21. D3 — candidate public instance API and explicit assistants disposition (design only, 2026-10-23)

### 21.1 Single instance context: public shape

The public production boundary should accept a single explicit root and construct one validated, immutable-by-contract instance context. Proposed internal shape (illustrative, not yet code/API):

- \`instance.root\`: canonical absolute directory selected by the caller and validated before store access.
- \`instance.paths.continuity\` and \`instance.paths.chronicle\`: paths derived only inside the instance composition module from the root and fixed filenames. They are not caller-overridable in the production instance API.
- \`instance.admission\`: internal capability/context available only after the cross-process root lock has been acquired. It must not be forgeable by passing \`{ admitted: true }\` or a caller-supplied string.
- \`instance.run(operation)\` (or an equivalent private higher-order boundary): validates configuration, acquires admission before any persisted read/snapshot, runs the complete operation, and classifies lock-release certainty before producing the public result.
- Low-level helpers receive the already-admitted context and must not reacquire the root lock. A helper cannot accept independent root and store paths.

The context is a coordination/configuration capability, **not** a credential, owner proof, constitutional decision, or authorization token. Root admission must not change \`authorization: NOT_EVALUATED\`, legitimate root \`PENDING/UNKNOWN\`, or protected effects \`STOP\`.

### 21.2 CLI and API boundary

Recommended first implementation interface:
1. Add explicit \`--root <directory>\` for production instance commands; no \`NEXO_ROOT\` environment override in the first iteration.
2. Require an existing directory for normal operations. Root creation/bootstrap is a separate explicit operation after a separate protocol is designed; no implicit \`mkdir\`, store initialization, migration, or fallback during ordinary reads.
3. Reject duplicate \`--root\`, missing root, a root combined with legacy \`--continuity\` / \`--chronicle\`, and unknown/conflicting arguments before any store is opened.
4. Chronicle CLI passes only \`--root\` to its child. The child validates the root and acquires the root lock itself. The parent must not acquire that same lock.
5. Keep path-oriented functions as low-level/internal compatibility primitives during migration, but make them inaccessible to supported production entrypoints except through the instance composition module. Do not silently reinterpret existing public functions as instance-safe.
6. Preserve business result contracts (\`loaded\`, \`not_found\`, Chronicle's existing result states) separately from admission state. On uncertain lock release, never present clean success and never automatically retry/re-execute the operation.

The public instance API naming and exact result envelope remain to be reviewed against every consumer; the above is a design contract, not an implementation claim.

### 21.3 \`scripts/assistants.mjs\`: explicit disposition

For the first root-admission migration, treat \`scripts/assistants.mjs\` as a **composite integration with a separately scoped Nexo persistence sub-operation**, not as a generic Nexo CLI and not as one atomic transaction.

- \`NEXO_STATE_PATH\` / world-state and \`NEXO_LUMINA_MEMORY_PATH\` remain independently owned by the existing simulation/Lúmina workflow in this phase. They must not be silently moved under the Nexo root.
- The Continuity interaction initiated by this script (open owner, mission record, any Continuity snapshot/commit) must either be invoked as a named operation through the instance API, or be explicitly rejected in root-managed mode until that adapter exists.
- Do not imply that the root lock coordinates or atomically commits world-state, Lúmina learning memory and Continuity. It coordinates only cooperating operations routed through the Nexo instance boundary.
- \`NEXO_CONTINUITY_PATH\` is not a supported override in root-managed production mode. If retained temporarily for existing tests or an explicit legacy mode, the mode must be visibly selected, fail closed on mixed root/path configuration, and must not be described as satisfying the instance-root contract.
- Keep \`--nexo-repair-once\` blocked by \`NEXO_M0_OPTION_A_EFFECT_EXCLUDED\`; this disposition cannot authorize repair or external effects.

This choice preserves the Nexo/Lúmina separation and allows the Continuity sub-operation to migrate without claiming cross-file transactionality. It also means D3 cannot be marked closed until the team decides how production \`assistants.mjs\` obtains/uses the instance context and how its legacy mode is exposed or retired.

### 21.4 Migration protocol gates

1. **Inventory gate:** every supported production entrypoint and each direct owner/store/application path has a source SHA and a defined boundary; dynamic imports/re-exports and composite entrypoints are accounted for.
2. **API gate:** root-only production contract, path derivation, initialization policy, symlink/canonicalization behavior, and public result compatibility are specified.
3. **Lock gate:** lock-file protocol, ownership token, timeout clock, process ownership, uncertain release, and stale/corrupt owner handling have executable tests; no automatic stale lock deletion.
4. **No-bypass gate:** architecture test fails if a production entrypoint imports or calls low-level path-oriented owner/store/query APIs outside the narrow composition allowlist.
5. **Behavior gate:** same-root operations serialize across processes; different roots progress independently; read-only snapshots are admitted; business blocked/conflict/error results remain distinguishable from admission failure.
6. **Migration gate:** legacy data is inventoried read-only; a dry-run plan records source/destination/size/hash/conflicts; backup and verification precede explicit cutover; no automatic merge, dual-write, delete or fallback.
7. **Safety gate:** repair exclusion and authority states remain unchanged; root admission is never treated as owner/Constitution/Policy authorization.
8. **CI gate:** run targeted tests and the required regression suite on the actual implementation commit; documentation-only changes do not count as runtime proof.

### 21.5 Current conclusion

This section advances D3 design, but does not close D1/D2/D3. The API and assistants disposition are now concrete proposals with explicit unresolved compatibility decisions. No runtime, tests, workflows or data stores were changed in this checkpoint.


## 22. D2/D3 source-level lock facts that constrain implementation

Direct source inspection confirms that the current loadCurrent() methods in both stores read and clone persisted state without acquiring their per-store locks. openNexoContinuityOwner() can read Continuity, initialize it when explicitly allowed, and then reread. Therefore root admission must wrap the entire operation from before the first snapshot read; a lock only around append() or commit() would be too late.

Chronicle and Continuity have separate per-store lock implementations with different release-failure handling. The first root layer should preserve those implementations rather than unify them during this migration. createNexoLockDeadline() uses process-local performance.now(); across the Chronicle parent/child boundary, pass a duration and let the child construct its own deadline. Normal instance reads must not silently enable legacy-memory projection or empty initialization. Repair remains blocked by NEXO_M0_OPTION_A_EFFECT_EXCLUDED.

Required tests: admission precedes every loadCurrent(), including read-only queries and owner opening; helpers do not reacquire the root lock; per-store release and root release uncertainty are tested separately; the Chronicle child is the sole root-lock owner; ordinary reads of a missing store do not initialize it; repair exclusion remains invariant. These are source-grounded constraints, not implementation or test results. D1/D2/D3 remain OPEN; runtime, tests and workflows unchanged.


## 23. D1 caller boundary matrix and canonical-root decision (design proposal, 2026-10-23)

### Verified production surfaces

| Surface | Direct source evidence | Current path behavior | Target boundary |
|---|---|---|---|
| Main CLI | scripts/nexo.mjs, SHA e471eb478a09aa8a9a8323795583e198cdf0a127 | Imports the path-oriented application index; delegates Chronicle to a child | Parse one explicit root; queries/previews run inside instance admission; Chronicle child receives root and owns admission |
| Chronicle child | scripts/nexo-chronicle-session.mjs, SHA 30a53de2f108aa255a1dfd61ce78c19788de160b | Calls runNexoChronicleAppend with parsed independent paths | Accept root-only production mode; no parent-held lock |
| Application Chronicle append | src/nexo/application/chronicle-append.mjs, SHA 5a20044bcddbaee79d0117934eefaea5f3b2c3bc | Constructs both stores and opens Continuity owner directly | Become a private operation invoked with admitted instance context; no direct production bypass |
| Application queries | src/nexo/application/continuity-queries.mjs, SHA e1915e94e53e71d37a37952fead37ba62bdae79a | Multiple functions construct Continuity store from continuityPath and load snapshots | Each supported query enters root admission before the first snapshot read |
| Continuity compatibility export | scripts/nexo-continuity.mjs, SHA f08969f2d77a2e90f74d01c96242e29de89e3f22 | Re-exports openNexoContinuityOwner | Mark as internal/legacy or replace with an explicit instance operation; do not leave as a supported production bypass |
| Composite assistants | scripts/assistants.mjs, SHA d31c6dba86159ee0403f0cc1c236b89863e4d5cb | Opens owner through compatibility export; separate world-state and Lúmina-memory paths | Separate composite integration; migrate only its Continuity sub-operation or visibly remain legacy/outside root contract |
| Store factories | continuity-store.mjs SHA 9ffd28930abdbe29f5b041711cc29b74dc99fbae; chronicle-store.mjs SHA 59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a | Caller-supplied file paths; per-store locks only | Retain for private composition/tests; production entrypoints cannot import them directly |

This is a verified list of important direct surfaces, not yet proof of every indirect caller. GitHub code search returns zero results for known existing symbols on this branch, so its negative results are unusable as evidence of absence. Continue using source-tree enumeration and direct import tracing.

### Canonical root semantics — proposed

1. Require the caller-supplied root to be a non-empty path to an already-existing directory.
2. Resolve it to a canonical absolute path using realpath before deriving any store path; reject a regular file or failed resolution before touching stores.
3. Resolve symlink aliases to the same canonical directory. This is path identity, not protection against a hostile process changing symlinks/mounts after validation.
4. Derive fixed internal filenames only after canonicalization. Reject caller-supplied independent store paths in root-managed mode, including any mixture of root and legacy path flags.
5. Place the root admission lock at a fixed reserved path inside the canonical root (exact filename to be finalized with the lock protocol); reject if that reserved path is a non-lock file or an unrecognized/corrupt lock state. Never delete an unknown/stale lock automatically.
6. This does not establish safety for network filesystems, hostile local processes, hard-link aliases, mount aliases, or TOCTOU attacks. Those are explicit limitations, not claims silently solved by realpath.
7. Existing-root validation must not create the root, either store, an empty Continuity snapshot, or a legacy-memory projection. Bootstrap and migration remain explicit operations.

### D1 close criteria

- Trace all direct imports/re-exports of the above production surfaces plus runtime/session/repair entrypoints from the complete tree; preserve the actual source SHA and report any tool limitation.
- Enumerate supported production entrypoints in one narrow allowlist; classify repair scripts as blocked/legacy rather than silently admitted.
- Inspect dynamic imports, package scripts and child-process command construction; the static import graph alone cannot capture process boundaries.
- Verify every public query/preview consumer and its expected result envelope before changing the path API.
- Keep assistants' simulation state, Lúmina learning memory and Nexo Continuity ownership separate.

D1 remains OPEN pending complete caller trace and compatibility review. D2/D3 remain OPEN. No runtime or tests changed.


## 24. Package scripts and repair-session boundary (2026-10-23)

The package manifest (blob SHA e45dc6d215db53ea2758009cd501f565634e3610) exposes `nexo` as `node scripts/nexo.mjs` and `assistants` as `node scripts/assistants.mjs`; the test script runs a large serial suite including root-bootstrap-protocol, Chronicle/store/runtime, entrypoint, continuity, repair crash cuts, and Open Loops tests. These package commands are additional production entrypoint evidence and belong in the explicit supported-entrypoint inventory.

Repair boundary: scripts/nexo-runtime-session.mjs (SHA f67b6fbe1b6f0098ebf23b35055cc668f96df991) currently returns NEXO_M0_OPTION_A_EFFECT_EXCLUDED. Dedicated repair modules (including nexo-repair-entrypoint/session/dispatch and preparation/settlement/verification) still contain persistence and effect-capable paths, including environment state writes. They must be classified as blocked/internal repair tooling, not automatically migrated as normal instance operations. The exclusion gate remains a required regression test. Root admission is not permission to invoke them.

This adds package scripts and repair paths to the inventory. The inventory is more complete but still not declared exhaustive until remaining import/re-export and child-process edges are checked. D1/D2/D3 OPEN; no runtime or tests changed.


## 25. Existing entrypoint guard: compatibility facts and migration risk

Direct inspection of `src/nexo/application/index.mjs` (SHA fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3) confirms its public exports are Chronicle append, Continuity/mission status and plan queries, open-loops query, mission draft preview and mission request preview. This is intentionally narrow, but all persistence-backed queries still take path-based arguments.

`tests/nexo/entrypoint.test.mjs` (SHA ff1bd2e9d292e21e00049b354249aee684837bbc) walks imports and re-exports from the two CLI entrypoints, checks a narrow API export allowlist and excludes legacy runtime/Lúmina simulation imports. It explicitly accepts `--continuity` and `--chronicle` independently, tests the mutating Chronicle append and subsequent replay/status/plan/query behavior. Therefore it is an import-isolation guard and behavioral compatibility suite, not a root-admission or no-bypass proof. Migration must extend it rather than replace its existing output/result and no-write guarantees.

Important compatibility invariants evidenced by the test: append result reports `authorization: NOT_EVALUATED` in mission planning; previews report `persisted: false` and `dispatchAttempted: false`; replay does not redispatch and leaves persisted bytes unchanged; status/plan queries do not change Continuity bytes; the append path can legitimately dispatch the narrowly allowed Chronicle action. These behaviors must be preserved while root admission is added. Do not confuse Chronicle's allowed append dispatch with the excluded repair path.

`tests/nexo/root-bootstrap-protocol.test.mjs` (SHA 996c031224ba4544d8982ca4fd1762e9d4f44dc0) verifies a P-256 signature/protocol vector and altered-message/signature rejection. Despite its filename, it does not test a filesystem instance root or root admission. It cannot count as root-lock evidence.

`parseNexoEntrypointArguments` currently has explicit legacy path options and the Chronicle child accepts `--continuity`, `--chronicle`, `--mission`, `--step`; neither parser has a `--root` path yet. Parent currently passes the parsed args to the child. The migration must define a root-only mode and reject mixed/duplicate options before any store is opened, while keeping any low-level legacy path route clearly internal or temporarily compatibility-gated. No claim that the current tests were executed in this documentation pass.


## 26. CLI process boundary and composite integration (2026-10-23)

Source inspection confirms that `scripts/nexo.mjs` runs query/preview operations in-process but delegates Chronicle append with `spawnSync` to `scripts/nexo-chronicle-session.mjs`, forwarding parsed arguments. The child must be the sole root-lock owner for append; query/preview operations also need admission before persisted reads. The child parser currently accepts independent `--continuity` and `--chronicle` paths and has no `--root` mode.

Existing entrypoint tests exercise status, plan, mission and preview using `--continuity`, and append/replay using separate Continuity and Chronicle paths. Migration tests must cover all command families under root mode, reject mixed/duplicate root and legacy options before store access, and preserve result envelopes and no-mutation guarantees.

The separate package command `assistants` reads `NEXO_STATE_PATH`, `NEXO_LUMINA_MEMORY_PATH`, and `NEXO_CONTINUITY_PATH`; it opens Continuity through `nexo-continuity.mjs` and includes a `--nexo-repair-once` path. Do not classify it as root-managed until its Continuity operation is routed through an explicit instance operation. Simulation state and Lúmina memory remain outside Nexo root. Repair stays excluded by `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`; root admission grants no repair permission.

This is source inspection and documentation only. No tests were executed and no runtime, test, or workflow files were changed.

## 2026-10-23 — Auditoría de compatibilidad de la CLI y contratos de resultado (documentación; sin cambios de runtime)

### Inventario de comandos públicos observado en el código

La fuente auditada es `scripts/nexo.mjs` (blob `e471eb478a09aa8a9a8323795583e198cdf0a127`), junto con `scripts/nexo-chronicle-session.mjs` (blob `30a53de2f108aa255a1dfd61ce78c19788de160b`), el índice de aplicación y `tests/nexo/entrypoint.test.mjs` (blob `ff1bd2e9d292e21e00049b354249aee684837bbc`). Esta sección describe el estado actual observado; no implica que las decisiones de diseño estén cerradas.

| Familia | Entrada actual | Operación/resultado exitoso esperado | Riesgo de admisión que debe resolverse |
|---|---|---|---|
| Estado de Continuity | `status --continuity PATH` | `status: loaded`; proceso 0 | Debe adquirir admisión de instancia antes de la primera lectura persistida |
| Estado de misión | `mission-status --continuity PATH --mission ID` | `status: reconstructed`; proceso 0 | Igual; incluye misión ausente y discrepancias como resultados no exitosos |
| Plan de misión | `mission-plan --continuity PATH --mission ID` | `status: planned`; proceso 0 | Igual; plan no significa autorización |
| Vista previa de borrador | `mission-draft-preview --continuity PATH --draft PATH` | `status: validated`; proceso 0 | Debe validar/admitir raíz antes de leer datos persistidos; la lectura del borrador también tiene límite de bytes |
| Vista previa de solicitud | `mission-request-preview --continuity PATH --request PATH` | `status: validated`; proceso 0 | Igual; interpretación/autoridad no se pueden inferir del resultado validado |
| Añadir a Chronicle | `chronicle-append ...` en padre; sesión hija con `--continuity`, `--chronicle`, `--mission`, `--step`, `--content-stdin` | El hijo serializa el resultado público y usa código de salida 0 solo para `completed` | El hijo debe ser dueño exclusivo de la admisión durante toda la operación; el padre no debe mantener el mismo lock |

La entrada principal rechaza comandos desconocidos y devuelve `NEXO_COMMAND_UNSUPPORTED` con `dispatchAttempted:false`. Los errores de parseo son resultados bloqueados. La sesión Chronicle también rechaza opciones duplicadas/desconocidas y exige entrada por stdin. La lista de opciones actual no contiene `--root`; añadirlo cambia el contrato de CLI y exige una matriz de compatibilidad deliberada, no una inserción incidental.

### Contratos de resultado y compatibilidad que deben preservarse

- Los errores de CLI se emiten como JSON sin volcar rutas, contenido privado ni errores crudos.
- Las consultas pueden devolver resultados semánticos como `not_found` o `blocked`; la admisión de raíz debe ser una capa distinta y no convertir esos resultados en éxito.
- Las vistas previas mantienen `authorization: NOT_EVALUATED`, `dispatchAttempted: false` y `persisted: false`; `validated` significa validación de entrada/contexto, no autorización para ejecutar.
- Chronicle expone un resultado sanitizado con estados públicos acotados, `authorization: NOT_EVALUATED`, `redispatchAuthorized: false` y, cuando corresponde, `phase`, `writeStarted`, `lockRelease` y `lockAcquisitionCode`. La nueva admisión no debe ocultar un resultado de negocio conocido ni transformar incertidumbre de liberación en éxito limpio.
- El proceso padre usa `spawnSync` con `stdio: inherit`; el resultado JSON de Chronicle lo emite el hijo. Si falla el inicio del hijo, el padre devuelve `NEXO_ENTRYPOINT_DISPATCH_FAILED` con `dispatchAttempted:false`. Este indicador describe el despacho de negocio según el contrato actual, no una prueba de que no ocurrió ningún efecto externo en cualquier fallo de proceso.
- `src/nexo/application/index.mjs` exporta siete casos de uso concretos: consultas de estado/plan/open-loops, dos vistas previas y `runNexoChronicleAppend`. No exporta un despachador genérico.

### Pruebas negativas requeridas antes de modificar runtime

Añadir al diseño de pruebas (no implementadas ni ejecutadas por esta revisión):

1. Todas las familias de comando rechazan `--root` ausente, duplicado, vacío o combinado con rutas heredadas; la admisión falla antes de abrir almacenes.
2. Cualquier combinación de `--root` con `--continuity` / `--chronicle` heredados falla antes de la primera lectura o escritura; no hay precedencia silenciosa.
3. Raíz inexistente en operación normal: bloqueada sin crear directorio, almacén, snapshot ni proyección legacy.
4. Lock ocupado: resultado de admisión bloqueado/timeout con contrato público estable; el caso de uso no se ejecuta.
5. Lock corrupto, propietario desconocido, lock obsoleto y liberación incierta: fail-closed; no borrar lock automáticamente ni reejecutar operación.
6. Excepción de consulta, vista previa o escritura después de adquirir el lock: resultado de negocio y resultado de admisión permanecen diferenciados; liberación incierta no permite reportar éxito limpio.
7. Para Chronicle, el proceso padre no toma la admisión que debe tomar el hijo; se verifica que no hay deadlock, doble adquisición ni ejecución de caso de uso antes de admisión.
8. Verificar códigos de salida y JSON en cada familia, incluyendo `not_found`, entrada demasiado grande, bootstrap parcial, replay, y `dispatchAttempted:false` en bloqueos pre-despacho.
9. Alias de ruta mediante symlink resuelven al mismo `realpath`; esto no se debe describir como defensa contra TOCTOU hostil, hardlinks, bind mounts ni semánticas de filesystem de red.
10. Verificar que el resultado de admisión no cambia `authorization: NOT_EVALUATED`, ni habilita reparación/efectos protegidos.

### Límites de la evidencia actual

`tests/nexo/entrypoint.test.mjs` protege la superficie de exportación, el grafo de imports estáticos desde las dos entradas, varios códigos/JSON de salida, la privacidad de contenido y algunas propiedades de persistencia. No contiene todavía pruebas de root admission, lock de raíz, rutas mixtas ni bloqueo de todos los bypasses. `tests/nexo/root-bootstrap-protocol.test.mjs` verifica protocolo criptográfico P-256, no la raíz del filesystem ni sus locks. Los nombres de archivo no sustituyen la inspección de lo que prueban.

**Estado de decisión:** D1, D2 y D3 continúan OPEN. Este inventario mejora la trazabilidad, pero no cierra por sí solo ninguna puerta. No se modificaron runtime, tests ni workflows y no se ejecutaron pruebas en esta revisión.


## 2026-10-23 — Caller inventory extension: composite `assistants` path

Direct inspection of `scripts/assistants.mjs` (blob `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`) confirms a second, materially different execution path. It is not the narrow `nexo` CLI and must not be implicitly declared root-managed.

Observed behavior:
- Resolves Continuity from `NEXO_CONTINUITY_PATH` or `.nexo-continuity.json`; resolves environment state from `NEXO_STATE_PATH` or `world-state.json`; resolves Lúmina learning memory from `NEXO_LUMINA_MEMORY_PATH` or `.lumina-assistant-memory.json`.
- Reads environment state, then calls `openNexoContinuityOwner({ filePath, legacyMemory, allowEmptyInitialization })` directly.
- Records a mission through `continuity.owner.recordMission(...)`, writes Lúmina memory directly, persists environment state, and only then checks optional `--nexo-repair-once`.
- The imported runtime repair gate currently returns `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, but the composite command still has its own state/memory/mission persistence effects.

Implications:
1. `assistants` is a no-bypass caller candidate that must be explicitly inventoried for D1. Root admission cannot be considered universal while this path opens Continuity and persists missions outside the proposed instance API.
2. The state file and Lúmina memory projection remain separate stores; do not silently relocate them under Nexo root or treat them as root-managed data.
3. Do not simply add a lock around the whole script: the script has a multi-store sequence with existing semantics and could hold a lock across Lúmina work or conflicting persistence. First decide whether `assistants` is out of scope, must be blocked for Nexo persistence, or needs a deliberate instance API integration with explicit boundaries.
4. `--nexo-repair-once` is not authority. Keep repair excluded and preserve the existing fail-closed gate; no root-admission result may grant repair permission.
5. The direct call to `openNexoContinuityOwner` is a compatibility re-export through `scripts/nexo-continuity.mjs`, which re-exports `src/nexo/core/continuity-service.mjs`. Replacing only the CLI parser will not establish no-bypass coverage.

**D1 remains OPEN.** This is one concrete caller found, not a complete repository-wide proof that all callers have been enumerated.


## 2026-10-23 — Lecturas sin lock en las consultas públicas: requisito de frontera superior

La inspección directa de `src/nexo/core/continuity-store.mjs` (blob `9ffd28930abdbe29f5b041711cc29b74dc99fbae`) y `src/nexo/core/chronicle-store.mjs` (blob `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`) confirma que ambos métodos `loadCurrent()` leen el documento y devuelven el snapshot sin adquirir su lock de escritura. Esto es consistente con el diseño actual del store; no se debe reinterpretar como aislamiento de lectura.

`src/nexo/application/continuity-queries.mjs` (blob `e1915e94e53e71d37a37952fead37ba62bdae79a`) llama directamente a `createNexoContinuityStore({ filePath }).loadCurrent()` para status, mission status, plan y previews; `loadNexoOpenLoops` también es una consulta pública exportada. En consecuencia, la admisión de instancia debe estar en una frontera superior que cubra el caso de uso completo y ocurra antes de la primera lectura persistida. Añadir el lock solo a las rutas de escritura dejaría consultas y previews fuera de la frontera.

Consecuencias de diseño:
- La API de instancia debe ser el único acceso de producción soportado para operaciones sobre la raíz; las fábricas path-based quedan como primitivas internas/tests y no constituyen una frontera de seguridad por sí mismas.
- No añadir locks recursivos dentro de `loadCurrent()` si el llamador ya posee admisión de raíz. Definir un contexto admitido explícito y pasarlo a helpers evita reentrada y hace visible la precondición.
- La consulta `loadNexoOpenLoops` no tiene comando CLI dedicado en el router observado, pero sí está en el índice de aplicación; incluirla en la matriz de callers internos/API y decidir si es pública para producción o solo para uso interno.
- Las locks de Continuity/Chronicle existentes protegen mutaciones concretas; no garantizan por sí mismas exclusión de una operación de instancia de extremo a extremo.

Esto cierra un hecho del diseño de la frontera, no D2: la semántica del root lock, su API y sus interacciones siguen sin aprobarse. No se hicieron cambios de código ni pruebas.


## 2026-10-23 — Compatibilidad observada de los locks actuales de stores

Inspección de las implementaciones de `acquireLock`, `loadCurrent`, `initialize`, `commitIfCurrent` y append en Continuity/Chronicle:

- Los locks de store son directorios `PATH.lock` con `owner.json` que contiene PID y token. La mutación adquiere el lock, vuelve a leer el documento dentro del lock y verifica revisión/identidad antes de escribir.
- Los dos stores rechazan locks corruptos/desconocidos y locks considerados obsoletos con `*_LOCK_STALE_RECOVERY_REQUIRED`; no intentan borrar automáticamente un lock obsoleto porque el patrón check-then-remove puede eliminar un lock nuevo.
- Continuity mantiene además un conjunto local de rutas con liberación fallida para bloquear nuevas adquisiciones en el mismo proceso hasta que el lock desaparezca externamente. Chronicle expone fallo de liberación, pero no tiene ese mismo registro local.
- `loadCurrent()` sigue siendo una lectura sin lock. En Chronicle append hay preflight de ambos stores antes de abrir el owner de Continuity, y las mutaciones de cada store usan sus propios locks más tarde. Por ello el lock de store no cubre el intervalo completo preflight → admisión de misión → ejecución → reconciliación.

**Restricción para D2:** el root lock no debe sustituir ni fusionarse con los locks de store en esta primera etapa. Debe serializar la operación completa de instancia; los locks existentes continúan protegiendo sus escrituras/revisión. La operación de raíz debe adquirir su lock antes del preflight de Chronicle y mantenerlo hasta la salida de negocio y la liberación final, excepto el handoff explícito al proceso hijo. El hijo Chronicle toma el root lock antes de sus lecturas y no debe heredar un lock ya tomado por el padre.

No hay evidencia en esta revisión de que el root lock esté implementado. D2 sigue OPEN.


## 2026-10-23 — Segundo caller de Continuity: `scripts/simulate.mjs`

La inspección directa de `scripts/simulate.mjs` (blob `623d316c7a1efd10cc2f06a3080c9d9f06087596`) encuentra otro caller productivo además de `assistants.mjs`. El comando `simulate` está declarado en `package.json`, importa `openNexoContinuityOwner`, carga el estado del mundo, abre Continuity en la ruta fija `.nexo-continuity.json` con `legacyMemory` y `allowEmptyInitialization`, persiste el estado del mundo y devuelve la revisión de Continuity en su salida. Aunque no despacha una misión, abrir Continuity puede inicializarla o reconciliar datos legacy; por ello no es un lector inocuo para la frontera de instancia.

La ruta de estado del mundo tiene un lock separado implementado localmente en `simulate.mjs`. Ese lock pertenece al archivo de mundo, no a la raíz de Nexo; su política de recuperación de locks obsoletos incluye borrado automático. **No reutilizar esa política como contrato del root lock**, cuya recuperación debe ser explícita y fail-closed.

Implicación: D1 debe clasificar `simulate` igual de explícitamente que `assistants`: (a) excluirlo formalmente de operaciones Nexo y evitar que abra/inicialice Continuity, o (b) integrarlo mediante API de instancia con límites claros entre world state y Nexo. No asumir que el nombre de comando o su ausencia de dispatch lo deja fuera de la superficie de persistencia.

D1 permanece OPEN; este es otro caller confirmado, no un inventario completo.


## Candidato de diseño para D1 — separar los flujos legacy sin ampliar el lock a todo Lúmina

Esto es una recomendación de diseño pendiente de cerrar, no una decisión ya implementada:

- **`simulate`:** candidato a quedar fuera de las operaciones Nexo. No debería inicializar ni abrir Continuity como efecto lateral de simular el mundo. El bootstrap/migración de Continuity debe ser una operación Nexo explícita; el estado del mundo permanece separado.
- **`assistants`:** puede seguir produciendo una misión candidata desde informes de Lúmina, pero no debe abrir el store ni invocar `continuity.owner.recordMission` directamente. La integración Nexo debe usar la API de instancia para una lectura admitida y una escritura admitida/condicional por revisión. El trabajo de Lúmina puede ocurrir entre ambas operaciones sin retener el root lock; la escritura debe fallar en conflicto si la revisión base cambió, sin reintentar silenciosamente ni asumir autorización.
- No mantener root lock durante todo el pipeline de análisis Lúmina ni durante persistencia de world state/memory. La frontera de instancia cubre la operación Nexo concreta, no todas las escrituras de otros subsistemas.
- La API de instancia debe distinguir: lectura admitida, resultado de construcción externa, escritura condicional admitida y resultado de negocio. La admisión no es autorización y el éxito de registro de una misión no ejecuta sus efectos.

Ventaja: evita que Lúmina y world state se conviertan accidentalmente en parte de la raíz Nexo y evita un lock de larga duración. Coste: las rutas legacy que hoy inicializan Continuity de forma implícita requieren una migración/bootstrap explícito antes de seguir usándose con Nexo.

No cerrar D1 hasta verificar todos los callers y decidir el tratamiento de los comandos legacy; no realizar todavía esos cambios.


## 2026-10-23 — Compatibilidad de migración y clasificación de reparación

`tests/nexo/continuity-migration.test.mjs` (blob `0bef1b93c6268042f14830c97e084d0a543e05f4`) confirma que `openNexoContinuityOwner({ filePath, legacyMemory })` puede convertir memoria Nexo legacy a la store canónica y que, al reabrir, el store canónico tiene precedencia sin mezclar datos legacy obsoletos. Por tanto, las llamadas de `simulate` y `assistants` que pasan `legacyMemory` no son solo observación: pueden realizar bootstrap/migración implícita. La migración debe quedar detrás de una operación explícita y admitida; no se debe preservar una migración lateral accidental como compatibilidad automática.

`scripts/nexo-repair-entrypoint.mjs` exporta una función de reparación, no es un CLI de package ni contiene un dispatcher de `process.argv`. El flujo productivo de `assistants` llama `scripts/nexo-runtime-session.mjs`, cuyo gate devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED` sin persistir ni despachar. Los helpers de reparación permanecen fuera de la superficie productiva soportada por el momento; no deben conectarse a la API de instancia ni tratarse como autorizados por el root lock. Mantenerlos fuera de D1 de callers productivos, pero conservar pruebas específicas de sus protocolos como código interno.

Esta distinción evita dos errores opuestos: llamar a los helpers de reparación un CLI activo cuando no lo es, o ignorar que los entrypoints `simulate`/`assistants` sí abren y pueden inicializar Continuity.


## Matriz precisa de errores de parseo observados (base de compatibilidad)

La futura admisión de instancia debe agregar su resultado sin borrar los códigos de parseo existentes cuando la forma del comando siga siendo inequívoca. Si se cambia el contrato de opciones a `--root`, documentar el nuevo código de error y cubrir la transición explícitamente.

| Comando | Error de argumentos | Error de opción obligatoria ausente |
|---|---|---|
| Entrada principal | `NEXO_COMMAND_ARGUMENTS_INVALID`; comando vacío: `NEXO_COMMAND_REQUIRED`; desconocido: `NEXO_COMMAND_UNSUPPORTED` | — |
| `status` | `NEXO_STATUS_ARGUMENTS_INVALID` | `NEXO_STATUS_CONTINUITY_PATH_REQUIRED` |
| `mission-status` | `NEXO_MISSION_STATUS_ARGUMENTS_INVALID` | Continuity: `NEXO_STATUS_CONTINUITY_PATH_REQUIRED`; misión: `NEXO_MISSION_ID_REQUIRED` |
| `mission-plan` | `NEXO_MISSION_PLAN_ARGUMENTS_INVALID` | Continuity: `NEXO_STATUS_CONTINUITY_PATH_REQUIRED`; misión: `NEXO_MISSION_ID_REQUIRED` |
| `mission-draft-preview` | `NEXO_MISSION_DRAFT_ARGUMENTS_INVALID` | Continuity: `NEXO_STATUS_CONTINUITY_PATH_REQUIRED`; borrador: `NEXO_MISSION_DRAFT_PATH_REQUIRED` |
| `mission-request-preview` | `NEXO_MISSION_REQUEST_ARGUMENTS_INVALID` | Continuity: `NEXO_STATUS_CONTINUITY_PATH_REQUIRED`; solicitud: `NEXO_MISSION_REQUEST_PATH_REQUIRED` |
| Sesión hija Chronicle | `NEXO_CHRONICLE_CLI_ARGUMENTS_INVALID` | Fuente: `NEXO_CHRONICLE_CLI_CONTENT_SOURCE_REQUIRED`; stdin debe ser pipe: `NEXO_CHRONICLE_CLI_STDIN_PIPE_REQUIRED`; exceso de stdin: `NEXO_CHRONICLE_STDIN_RESOURCE_LIMIT_EXCEEDED` |

La entrada principal de Chronicle no valida las opciones hijas antes de invocar `spawnSync`; por eso el error de argumentos Chronicle es emitido por el hijo en el JSON de resultado. El padre solo emite `NEXO_ENTRYPOINT_DISPATCH_FAILED` cuando no se pudo iniciar el hijo. No cambiar este límite sin actualizar las pruebas de salida, códigos de proceso y privacidad.

El router asigna códigos de salida según resultado: `loaded`, `reconstructed`, `planned`, `validated` o `completed` son los estados de éxito por familia; cualquier otro estado produce código de salida 1. El child Chronicle también sale con 1 si el estado no es `completed`. Un resultado semántico `not_found` no es error de parseo y no debe confundirse con fallo de admisión.


## Hallazgo D1 — la sesión hija Chronicle también es ejecutable directamente

`scripts/nexo-chronicle-session.mjs` no solo es una implementación hija: contiene una guarda de ejecución directa basada en `process.argv[1]` y `import.meta.url`, así que se puede invocar con `node scripts/nexo-chronicle-session.mjs ...` sin pasar por `scripts/nexo.mjs`. Su parser acepta rutas independientes `--continuity` y `--chronicle`, además de flags de inicialización. Por ello, el parent router no es una frontera suficiente: hoy hay una vía directa que puede acceder/initializar stores sin una raíz de instancia.

Requisito no-bypass para D1/D3:
- La sesión hija debe exigir `--root` y derivar internamente rutas canónicas; no aceptar rutas independientes de store en el contrato de producción.
- El proceso hijo adquiere el root lock antes de preflight/lecturas; el padre no adquiere el mismo lock.
- Si la intención fuera hacer que la sesión sea solo un módulo interno, eliminar la vía CLI directa no basta como única garantía en JavaScript; también debe haber guardas de arquitectura/tests que impidan callers de producción fuera de la API de instancia.
- La prueba negativa debe invocar el script hijo directamente con rutas legacy y verificar bloqueo sin lectura, creación ni escritura.

Este hallazgo amplía la lista de entrypoints. D1/D3 permanecen OPEN.


## Matriz de fronteras de producción y tratamiento propuesto

| Superficie observada | Acceso actual | Tratamiento requerido para no-bypass |
|---|---|---|
| `npm run nexo` → `scripts/nexo.mjs` | CLI principal con rutas legacy; consultas en proceso padre | Convertir a CLI de instancia: raíz explícita, resolución interna y admisión antes de lecturas |
| `scripts/nexo-chronicle-session.mjs` | Puede ejecutarse directamente y aceptar rutas legacy | Exigir raíz y adquirir lock en el hijo; nunca depender del padre como frontera |
| `npm run assistants` → `scripts/assistants.mjs` | Abre Continuity directamente y registra misión | Reemplazar acceso directo por API de instancia; escritura condicional por revisión; memoria/world state fuera de raíz |
| `npm run simulate` → `scripts/simulate.mjs` | Abre Continuity con `legacyMemory` y puede inicializar/migrar | Recomendación: desacoplar Continuity de la simulación; bootstrap/migración solo por operación Nexo explícita |
| `src/nexo/application/index.mjs` | Exporta funciones path-based, incluido append | Cambiar a superficie orientada a instancia; evitar que consumidores públicos entreguen paths de stores |
| `scripts/nexo-continuity.mjs` | Reexport de `openNexoContinuityOwner` | Eliminar de callers productivos tras migración; conservar solo si se define explícitamente como adaptador interno/tests |
| Fábricas `createNexoContinuityStore` / `createNexoChronicleStore` | Módulos internos importables que aceptan rutas | No son frontera de seguridad. Mantener como primitivas internas/tests y añadir prueba arquitectónica de imports/callers productivos |
| Helpers de repair | Funciones importables; no CLI actual; gate productivo devuelve `NEXO_M0_OPTION_A_EFFECT_EXCLUDED` | Fuera de la API de instancia productiva; no inferir autorización desde root lock |

**Límite de amenaza:** este diseño define no-bypass dentro de las superficies de producción soportadas y del código del repositorio. No convierte módulos JavaScript importables ni permisos del sistema de archivos en una frontera contra código local hostil que pueda editar/ejecutar el proyecto. Si ese threat model se vuelve requisito, necesitará aislamiento del proceso/permisos además de guardas de arquitectura.

### Condición verificable de cierre D1

D1 no se cierra solo porque exista una lista. Requiere: (a) cada superficie tiene un tratamiento aprobado; (b) el grafo de callers de producción queda enumerado; (c) las rutas path-based quedan fuera de la API de producción; (d) pruebas de arquitectura verifican que ningún entrypoint productivo alcanza stores sin instancia admitida; (e) las pruebas incluyen invocación directa del hijo Chronicle y los flujos legacy `simulate`/`assistants`. Hasta entonces D1 = OPEN.


## Hueco de diseño adicional — symlinks en los archivos internos derivados

La política actual ya propone canonicalizar la raíz con `realpath`, pero eso no impide que `<root>/continuity.json` o `<root>/chronicle.json` sean symlinks a archivos fuera de la raíz. Los stores actuales abren esas rutas normales y siguen el symlink al leer/escribir. Por tanto, “rutas derivadas de root” no basta para demostrar que los bytes persistidos están físicamente dentro del directorio de instancia.

Antes de cerrar D3, decidir y probar la política para los destinos internos existentes:
- Rechazar symlinks en los nombres reservados de store y exigir archivos regulares cuando existan; tratar el archivo ausente como ausencia normal sin crearlo durante validación.
- Rechazar también un lock de raíz preexistente que sea symlink o tenga forma inesperada; lock corrupto/ambiguo significa fail-closed.
- Mantener explícito que esto no resuelve TOCTOU contra un proceso local hostil que pueda cambiar el árbol entre comprobación y uso. La garantía es de configuración cooperante, no sandbox.
- Incluir pruebas de symlink de store apuntando fuera, symlink roto, archivo/directory conflictivo en nombre reservado y raíz aliasada por symlink. Ninguna prueba debe dejar escrituras externas ni mutar la raíz al fallar.

Este hueco es de contención de rutas/configuración, no una nueva capa de autoridad. D3 continúa OPEN hasta fijar el comportamiento.


## Candidato concreto para D2 — lock de raíz como directorio reservado

Para eliminar la ambigüedad entre “archivo de lock” y “directorio de lock”, la recomendación de diseño es usar `<root>/.nexo-instance.lock/` como directorio reservado creado atómicamente con `mkdir`, con `owner.json` dentro. Es coherente con la primitiva ya usada por los stores, pero constituye una capa de instancia separada y no comparte sus rutas ni estado local.

Owner record mínimo candidato: `pid`, token aleatorio de propiedad y `createdAt`. No agregar `instanceId`, cola, lease renovable ni otro identificador sin una necesidad demostrada. La ruta del directorio identifica el recurso de coordinación; no es identidad de autoridad.

Protocolo candidato:
1. Validar raíz existente y canonicalizarla antes de derivar el lock.
2. Intentar `mkdir(<root>/.nexo-instance.lock)`; solo quien lo crea puede escribir owner y ejecutar la operación.
3. Al encontrar el lock, leer owner con límite de bytes. Si el owner aún no existe y la lectura devuelve `ENOENT`, reintentar solo durante la ventana de creación; JSON inválido, permiso denegado, owner incompleto persistente o token/PID malformado producen `NEXO_INSTANCE_LOCK_STATE_UNKNOWN`.
4. Si el lock parece obsoleto, no borrarlo: devolver `NEXO_INSTANCE_LOCK_STALE_RECOVERY_REQUIRED`. Si no se puede obtener dentro del presupuesto, `NEXO_INSTANCE_LOCK_ACQUISITION_TIMEOUT`.
5. Liberar solo después de releer y verificar el token de propiedad. Si el token no coincide o no se puede confirmar la eliminación, devolver liberación incierta y bloquear reuso local hasta recuperación explícita.
6. Nunca mantener este lock mientras el padre espera a un hijo que también debe adquirirlo. El hijo Chronicle crea su propio deadline monotónico desde un presupuesto relativo.

No está aprobado como protocolo final. D2 sigue OPEN hasta fijar códigos públicos, timeout/stale policy, release retry/quarantine y pruebas concurrentes/negative.
