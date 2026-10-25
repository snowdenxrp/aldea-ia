# NCS M0 — matriz de corte mínimo de responsabilidades y cierre D1
Fecha: 2026-10-25
Rama documental: `ncs-clean-architecture`

## 1. Propósito y límites

Este documento convierte las decisiones ratificadas O-08…O-11 y las pendientes P-02…P-04/P-08/P-09 en una matriz de fronteras y condiciones de cierre. No selecciona la opción A/B/C de Gemini como decisión del propietario y no autoriza cambios de runtime, tests, workflows o datos.

## 2. Contrato de dominio propuesto para completar D1

### Responsabilidades permitidas

**Dominio Lúmina**
- Leer/escribir su memoria de aprendizaje mediante su propio contrato.
- Leer/escribir el estado canónico del mundo de simulación mediante su propio contrato.
- Orquestar asistentes y simulación de Lúmina.
- No abrir Continuity de Nexo ni crear/registrar misiones Nexo durante el flujo ordinario de Lúmina.
- No importar, migrar, combinar, borrar ni hacer dual-write implícito de `state.nexoMemory` u otros datos legacy de Nexo.

**Dominio Nexo**
- Gestionar Continuity, Chronicle y misiones dentro de una instancia explícita de Nexo.
- Admitir cada entrypoint operativo mediante una única raíz explícita `--root`, existente y validada según el contrato D0.
- No depender de memoria de aprendizaje ni de estado del mundo de Lúmina para obtener autoridad o inicializar la instancia.
- No tratar el wrapper bloqueado de una operación como prueba de que las APIs de bajo nivel son inalcanzables.

**Frontera de admisión**
- Precede a la primera lectura persistente del alcance acordado, no solo a escrituras.
- Aplica a consultas, previews y Chronicle dentro del alcance ratificado O-10.
- Rechaza root ausente/ambiguo, rutas legacy contradictorias y banderas de inicialización en operación normal antes de mutar stores.
- El proceso Chronicle directamente invocable no puede confiar en que el caller ya fue admitido.
- El protocolo de lock concreto, la sección crítica exacta y la resolución de release incierto permanecen en D2; el contrato D1 debe evitar el deadlock por propiedad/espera padre-hijo, sin inventar una segunda primitiva.

Estas son condiciones de diseño objetivo, no comportamiento demostrado del runtime actual.

## 3. Matriz de entrypoints y corte mínimo

| Superficie | Hecho observado en el snapshot documentado | Frontera objetivo | Evidencia / bloqueo de cierre |
|---|---|---|---|
| `scripts/assistants.mjs` | En el flujo ordinario combina owner/Continuity/misión Nexo con memoria de aprendizaje y persistencia del estado Lúmina. | Retener las responsabilidades de asistente y persistencia propias de Lúmina; retirar de ese flujo ordinario las operaciones Nexo. | D1 bloqueado hasta definir el corte exacto y clasificar callers que dependan del registro implícito de misión. |
| `scripts/simulate.mjs` | Abre Continuity y consume `state.nexoMemory` mientras lee/persiste estado de simulación. | Mantener simulación y persistencia del mundo Lúmina; no leer Nexo legacy ni abrir Continuity en el flujo ordinario. | D1 bloqueado por la arista de estado legacy y la falta de ruta de migración explícita autorizada. |
| `scripts/nexo.mjs` | Usa `--continuity` para consultas/previews y delega Chronicle mediante `spawnSync`; el parser inspeccionado no implementa `--root`. | Validar root explícito y que la admisión preceda a la primera lectura persistente; para Chronicle, enrutar al hijo sin adquirir un lock que el hijo necesite mientras el padre espera. | La fuente contradice el contrato de raíz ya ratificado; faltan gramática CLI exacta, caller coverage, admisión efectiva y prueba de ausencia de deadlock. |
| `scripts/nexo-chronicle-session.mjs` | Es ejecutable directamente; acepta rutas independientes de stores y flags de inicialización. | Exigir y validar `--root` de forma independiente; rechazar contradicciones antes de leer o mutar stores. Operación normal no bootstrap/repara. | La fuente contradice el contrato de raíz ya ratificado; siguen abiertos los flags/compatibilidad exactos, admisión efectiva y prueba de propiedad del lock. |
| APIs de store/owner de bajo nivel | Hay fábricas y APIs invocables desde módulos de aplicación y callers de prueba; la clasificación completa de callers no está cerrada. | Definirlas como primitivas internas/test-only solo si se demuestra que los entrypoints de producción no pueden alcanzarlas sin la frontera. De lo contrario, deben tener contrato de admisión o permanecer bloqueadas para uso externo. | D1 bloqueado por callers externos/dinámicos/indirectos sin resolver. No afirmar “inalcanzable” por presencia de wrapper. |
| APIs de reparación | El wrapper `nexo-runtime-session.mjs` bloquea su ruta concreta, pero existen capas inferiores exportadas/llamables en la superficie fuente. | Reparación fuera del flujo ordinario Lúmina y fuera del alcance operativo M0 Option A; no inferir que todos los exports inferiores están protegidos por el wrapper. | Mantener `UNKNOWN/BLOCKED` donde falte resolución de callers; no atribuir autoridad a la cadena de reparación. |
| Queries/previews/snapshots | El código actual usa APIs path-oriented y carga snapshots. | Todas las lecturas persistentes dentro del alcance O-10 precedidas por admisión; no crear excepción “read-only”. | D1 debe definir la regla semántica; D2 define sección crítica/snapshot y propiedad de lock. |
| Chronicle padre/hijo | Padre usa `spawnSync`; hijo también se ejecuta directamente. | Un contrato de argumentos único; hijo valida root; padre no sostiene lock no reentrante que el hijo requiera. No confiar en contexto heredado como prueba. | La admisión efectiva, canonicalización equivalente y no-deadlock no están demostrados. |

## 4. Comparación de alternativas sin ratificación implícita

### Alternativa A — separar responsabilidades por entrypoint
**Ventaja:** hace explícita la frontera de dominio: los comandos ordinarios de Lúmina no realizan operaciones Nexo; los entrypoints Nexo gestionan sus stores/misiones.
**Riesgo:** los callers que esperaban registro automático de misiones pueden cambiar de comportamiento. Se debe identificar compatibilidad y mantener intacta la persistencia propia de Lúmina.
**Estatus:** candidata de diseño; no seleccionada.

### Alternativa B — interfaces/guards de admisión
**Ventaja:** puede proporcionar una frontera lógica compartida si todos los entrypoints y callers la atraviesan.
**Riesgo:** un guard no protege exports que sigan accesibles por rutas alternativas; una inyección de contexto no demuestra que la admisión ocurrió ni que se usa la raíz correcta.
**Estatus:** recomendación de Gemini; no ratificada. No basta por sí sola sin inventario y pruebas de bypass.

### Alternativa C — aislamiento físico de archivos
**Ventaja:** puede hacer más visible la separación modular.
**Riesgo:** mayor superficie de refactor; no es un requisito ratificado ni una prueba de seguridad por sí misma.
**Estatus:** no seleccionada; tampoco se descarta como posibilidad futura si la evidencia la exige.

### Criterio neutral para elegir
Elegir el menor corte que cumpla simultáneamente:
1. Lúmina conserva aprendizaje y persistencia del estado del mundo.
2. Los flujos ordinarios de Lúmina no abren Continuity, crean/registran misiones ni importan/migran estado Nexo.
3. Todos los entrypoints Nexo operativos tienen una frontera de admisión definida antes de lecturas persistentes.
4. Las APIs de bajo nivel no se declaran inalcanzables sin evidencia de caller reachability.
5. Las incompatibilidades de CLI/API y los consumidores externos no se resuelven mediante fallback silencioso.
6. No se necesita una afirmación global de ausencia de aristas dinámicas si estas no se pueden demostrar; la incertidumbre relevante bloquea el cierre.

## 5. D1 vs. D2: límite de responsabilidades

**Debe quedar en D1**
- Dominios y dependencias permitidas/prohibidas.
- Lista de entrypoints ejecutables, APIs públicas y primitivas internas/test-only.
- Contrato de `--root`, argumentos contradictorios, operación normal frente a bootstrap.
- Regla de admisión previa a lectura persistente para queries/previews/Chronicle.
- Contrato padre/hijo que prohíbe confiar en admisión heredada y evita la espera con lock retenido por el padre.
- Clasificación de callers resueltos y lista exacta de UNKNOWN/BLOCKED que impiden cierre.

**Debe quedar en D2**
- Selección y caracterización de la primitiva de lock.
- Sección crítica exacta y vida útil del snapshot.
- Protocolo de ownership/release, incertidumbre, cuarentena, timeout/stale y evidencia de readmisión.
- Pruebas de concurrencia/adversariales una vez que el diseño esté congelado y exista autorización separada.

## 6. Criterios de cierre documental D1

D1-DESIGN solo puede cerrarse cuando:
- [ ] Cada entrypoint y API relevante tiene dominio, contrato de admisión y clasificación de caller.
- [ ] `assistants.mjs` y `simulate.mjs` tienen un corte de responsabilidades especificado que preserva la persistencia propia de Lúmina y excluye operaciones Nexo ordinarias.
- [ ] El contrato de root/argumentos padre-hijo es coherente y no presupone que la herencia de argumentos equivale a admisión.
- [ ] Queries/previews/snapshots están dentro de una regla de admisión sin excepción de solo lectura.
- [ ] Las APIs de bajo nivel están clasificadas según evidencia, no por inferencia desde wrappers.
- [ ] Las aristas dinámicas, externas y computadas se resuelven contra el snapshot exacto o se mantienen UNKNOWN/BLOCKED con su efecto preciso sobre la afirmación de cierre.
- [ ] Las decisiones pendientes del registro se marcan como ratificadas, abiertas o fuera de alcance; no se promueven propuestas de Gemini automáticamente.
- [ ] La revisión de consistencia usa los criterios normativos A–E de la línea de meta M0 y distingue documento, decisión, implementación y verificación; los grupos de evidencia G1–G5 del registro no son una segunda taxonomía de aceptación.

Este checklist es criterio de diseño; no afirma que ya esté satisfecho. Los tests/CI de implementación son una fase posterior, no se ejecutaron aquí.

## 7. Próxima acción concreta

1. Usar esta matriz para actualizar/reconciliar el manifiesto D1 y el registro de decisiones, sin volver a escanear las 188 fuentes.
2. Resolver mediante evidencia disponible los callers directos de stores/owners y el contrato de argumentos de Chronicle. Si la vía de enumeración no permite cerrar el caller set, registrar exactamente qué afirmación queda bloqueada.
3. Presentar al propietario una decisión acotada sobre el corte mínimo solo después de que las opciones se comparen contra los criterios de la sección 4. No asumir que Opción B queda elegida.
4. Mantener la implementación bloqueada hasta autorización explícita independiente.

## 8. Estado canónico

- M0: `INCOMPLETO`
- D0 técnico/evidencia: `OPEN`
- D1-DESIGN: `OPEN`
- D1-IMPLEMENTATION: `NO AUTORIZADA`
- D2/D3: `OPEN`
- Authorization: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`

No se modificaron runtime, tests, workflows ni datos operativos. No se ejecutaron tests/CI. Este documento no cierra D1 ni autoriza implementación.


## Addendum — recheck de argumentos Chronicle y APIs de store (2026-10-25)

Informe fuente asociado: `NCS_M0_D1_CHRONICLE_ARGUMENT_AND_STORE_SURFACE_RECHECK_2026-10-25.md`, commit `8611bfa3bea458f5f6ea6e14688535abeed2b8c6`.

Hallazgos añadidos: el padre `scripts/nexo.mjs` reenvía los argumentos de `chronicle-append`; el hijo `scripts/nexo-chronicle-session.mjs` acepta `--continuity` y `--chronicle` por separado y no exige `--root`; la aplicación de Chronicle hace preflight de stores a través de rutas independientes; las funciones de consulta y las fábricas/owner son exports y no se ha demostrado una frontera de admisión universal. La búsqueda de callers no permite cerrar el grafo: dinámicos, computados, tests y consumidores externos siguen `UNKNOWN/BLOCKED`.

Consecuencia: el contrato D1 debe definir un único `--root`, mapping determinista a stores, validación independiente del hijo y rechazo de argumentos contradictorios antes de cualquier lectura persistente. No se afirma que esto esté implementado. No se eligió A/B/C ni se autorizó implementación.


## Addendum — cierre D1 por afirmación y evidencia (2026-10-25)

**Distinción de alcance:** O-07 excluye repair del M0 operativo. Esto no ratifica la Alternativa A de arquitectura propuesta por Gemini (separación por entrypoint); A/B/C siguen sin selección del propietario.

| Afirmación | Evidencia actual | Condición pendiente | Estado si falta |
|---|---|---|---|
| CLI principal aplica root/admisión antes de I/O | Parser actual es path-oriented; no exige `--root` | Congelar contrato y, tras autorización, test que pruebe rechazo antes de lectura | No afirmar root admission en runtime |
| Chronicle hijo no elude admisión | Hijo invocable directamente, recibe rutas de Continuity/Chronicle por separado | Contrato de raíz única, mapping determinista, validación independiente y pruebas de argumentos contradictorios | No-bypass no demostrado |
| Queries/previews cumplen O-10 | Consultas abren store path-oriented y llaman `loadCurrent()` | Definir punto de admisión D1 y snapshot/lock D2; test sin lectura al fallar admisión | No declarar queries admitidas |
| Stores/owner son inalcanzables externamente | Exports y callers de prueba conocidos; censo parcial | Manifiesto reproducible de callers, loaders y procesos hijos; clasificar aristas no resueltas | UNKNOWN/BLOCKED |
| Repair queda fuera de M0 | O-07 y cadena inferior de dispatch identificada | Enumerar entrypoints conocidos y regla de no exposición/dispatch; probar solo con autorización | Exclusión de alcance sí; inalcanzabilidad técnica no demostrada |
| Separación Nexo/Lúmina completa | `assistants.mjs` y `simulate.mjs` presentan acoplamientos observados | Definir estado propietario y corte mínimo; conservar persistencia legítima de Lúmina | No declarar separación completa |
| Grafo de callers cerrado | Test existente recorre imports/reexports literales de dos CLIs | Resolver imports dinámicos/computados, `require`, procesos hijos y consumers externos; prueba de arquitectura tras autorización | Aristas potencialmente relevantes UNKNOWN/BLOCKED |
| M0 llegó a la línea de meta | Criterios de aceptación existen; CI histórico en otros SHA | Contratos, implementación autorizada, tests y CI del SHA exacto; sin UNKNOWN/BLOCKED dentro del alcance | M0 INCOMPLETO |

### Puertas documentales de D1
1. Especificar una única raíz y mapping a stores, separando operación normal y bootstrap.
2. Clasificar cada entrypoint y API exportada relevante con dominio, precondición de admisión, caller y política de invocación directa.
3. Definir contrato padre/hijo Chronicle: argumentos válidos, rechazo antes de I/O, validación independiente y sin lock no reentrante retenido por el padre mientras espera al hijo.
4. Definir admisión previa a la primera lectura persistente de queries/previews incluidas en O-10.
5. Especificar estado propietario, dependencias prohibidas y corte mínimo Nexo/Lúmina sin desactivar persistencia legítima de Lúmina.
6. Enumerar cada edge no resuelto y la afirmación que bloquea; no tratar búsquedas sin resultados como evidencia negativa.
7. Separar decisiones de alcance ratificadas de alternativas de refactor no seleccionadas.
8. Marcar enforcement pendiente como no autorizado/no implementado/no verificado, sin confundir cierre documental con la línea de meta de M0.

No repetir el barrido de 188 fuentes ni pedir otra revisión general a Gemini. Siguiente acción: reconciliar esta matriz con el manifiesto de entrypoints y el registro de decisiones; investigar solo edges específicos que sigan sin evidencia.

Estado: D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; M0 `INCOMPLETO`; root `PENDING/UNKNOWN`; efectos protegidos `STOP`. Sin cambios de runtime/tests/workflows y sin tests/CI ejecutados.


## Addendum — reconciliación de IDs, taxonomía y admisión previa a lectura (2026-10-25)

### Identificadores y línea de meta
El registro de decisiones ahora califica las propuestas históricas de §3 como `P-HIST-01`…`P-HIST-09`; la tabla vigente de decisiones pendientes §8.2 mantiene `P-01`…`P-10`. Las referencias en esta matriz a P-xx se refieren a la tabla vigente §8.2, salvo indicación histórica explícita. Los criterios normativos de aceptación M0 son A–E en la línea de meta. Los grupos G1–G5 del registro solo agrupan evidencia y no reemplazan esos criterios.

### Invariante D1 de admisión previa a la primera lectura persistente — propuesta de precisión normativa
1. **Validación pura de argumentos:** analizar sintaxis y detectar opciones ausentes, duplicadas o contradictorias sin abrir archivos ni consultar stores.
2. **Resolución de raíz:** resolver y canonicalizar la raíz existente según D0, y rechazar ambigüedad antes de derivar las rutas canónicas de stores. La operación normal no crea ni repara una raíz ausente.
3. **Admisión:** establecer que la operación se ejecuta bajo el contrato de instancia correspondiente antes de leer contenido persistente de los stores de Nexo.
4. **Primera lectura de stores:** solo después de superar la admisión se permite cargar `continuity.json` o `chronicle.json` y consumir el snapshot correspondiente.

Esta secuencia expresa el orden lógico que debe cumplir el contrato; no decide todavía qué mecanismo de lock protege cada fase. D2 conserva la sección crítica exacta, ownership, duración del snapshot, concurrencia y release incierto. Antes de ratificar esta redacción se debe definir explícitamente el tratamiento de metadatos de raíz (`realpath/stat`), archivos de lock, stdin y archivos de entrada del operador (`--draft`/`--request`): no se los clasifica automáticamente como lectura de store canónico ni se los exime por silencio. La admisión no puede depender de leer previamente un snapshot de Continuity/Chronicle. El principio aplica a queries, previews y Chronicle cubiertos por O-10; no existe excepción general por ser “read-only”.

### Matriz de estado propietario y excepción Lúmina
| Artefacto/estado | Dominio propietario provisional | Lectura/escritura permitida en el contrato objetivo | Arista observada / bloqueo |
|---|---|---|---|
| `continuity.json` y estado de misión Nexo | Nexo | Solo entrypoints Nexo admitidos bajo raíz explícita; sin importación de Lúmina como autoridad o bootstrap | La ruta actual es path-oriented; enforcement no demostrado |
| `chronicle.json` | Nexo | Chronicle bajo la misma raíz de instancia y contrato de admisión | Hijo directo y rutas separadas aún no cumplen el contrato objetivo |
| Estado del mundo de simulación | Lúmina | Lectura/escritura por sus flujos propios de simulación | `simulate.mjs` también lee `state.nexoMemory` y abre Continuity; arista legacy pendiente de resolver |
| Memoria de aprendizaje Lúmina | Lúmina | Lectura/escritura mediante su propio contrato | `assistants.mjs` orquesta memoria y Continuity en un mismo flujo; corte pendiente |
| `state.nexoMemory` / rama `nexo` en memoria de asistentes | Dominio legacy por determinar; no es fuente de autoridad canónica | No importar, combinar, migrar ni dual-write implícitamente en el flujo ordinario; conservar datos hasta una decisión/migración autorizada | Propiedad y condición de salida pendientes; no borrar ni desactivar persistencia legítima de Lúmina |

**Condición de salida de EXPLICIT_EXCEPTION:** la etiqueta aplicada a `assistants.mjs`/`simulate.mjs` significa solo “fuera del flujo ordinario de instancia Nexo mientras el diseño está abierto”. No es una garantía de aislamiento runtime. La excepción solo puede retirarse cuando (a) la propiedad de cada estado legacy esté decidida, (b) los lectores/escritores permitidos y prohibidos estén enumerados, (c) el corte de responsabilidades sea explícito, (d) se preserve la persistencia propia de Lúmina, y (e) la implementación/test/CI correspondiente haya sido autorizada y verificada sobre el SHA exacto. No se elige aquí una alternativa A/B/C.

### Contrato padre/hijo Chronicle v0 — principios ratificados y detalles abiertos
- **Ratificado por O-08:** operación normal con un solo `--root <directory>`, sin inicialización implícita, sin fallback ambiental/legacy y canonicalización antes de derivar rutas. El enforcement no está implementado ni verificado.
- **Detalle abierto:** destino/layout canónico exacto de stores; no asumir que `<root>/continuity.json` y `<root>/chronicle.json` ya fueron ratificados.
- El padre valida la sintaxis superficial y reenvía el contrato de argumentos, pero no transmite una “admisión heredada” como sustituto de la validación del hijo.
- El hijo valida por sí mismo root, opciones duplicadas/contradictorias y prohibición de flags de inicialización en operación normal, antes de leer stores.
- No se fija todavía si se admiten raíces relativas; si se permiten, debe congelarse una base única de resolución. Hasta decidirlo, una raíz relativa no tiene semántica normativa cerrada.
- `--continuity`/`--chronicle` no deben coexistir con `--root` en modo raíz si permiten destinos contradictorios; los flags `--initialize-*` pertenecen a un flujo de bootstrap separado y no a operación normal. Los nombres/compatibilidad exactos deben cotejarse con el parser completo antes de ratificación.
- El padre no retendrá un lock no reentrante mientras espera a un hijo que necesita la misma admisión. El contrato de ownership de admisión del proceso que ejecuta el append se debe reconciliar con la ejecución directa del hijo antes de congelar D1.

Este bloque mezcla principios ratificados con detalles aún abiertos: no decide raíz absoluta/relativa, destino definitivo de `--initialize-*`, compatibilidad exacta de rutas heredadas ni P-04. No autoriza parser/runtime/tests.

### Alcance de la evidencia textual de aristas
Claude informa una búsqueda textual `git grep` sobre 188 archivos JS-family trackeados, con un `import(` encontrado en `src/three-remote.js:18`, `child_process` en el CLI Nexo y sin coincidencias para otros patrones enumerados. El informe aportado no incluye el comando literal completo ni el SHA completo del árbol de búsqueda. Por tanto, se registra como resultado comunicado, no como evidencia reproducible completa. Antes de usarlo para reclasificar edges debe añadirse el comando exacto y el SHA/tree exacto; no repetir el barrido salvo que falte esa evidencia reproducible o cambie la fuente. Incluso con esos datos, el resultado es búsqueda textual, no cierre AST ni prueba de ausencia de consumidores externos/no-JS.
