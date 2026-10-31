# NCS M0 — U-B06: workflows CI y cadena de importación legada

**Fecha:** 2026-10-31  
**Base inspeccionada:** `fce8bc9824d7db65f0cf8416463f1aeb0ca146a2`  
**Rama:** `ncs-clean-architecture`  
**Tipo:** reconciliación documental de inspección estática externa aportada por el propietario; no implementación, no ejecución, no ratificación adicional.

## 1. Dictamen ejecutivo

El complemento cierra documentalmente los huecos de U-B06 relativos a (a) workflows que pueden alcanzar scripts que abren/crean Continuity y (b) la cadena completa `legacyMemory → validator → projection → initialize`, dentro del commit y alcance declarados.

Resultados principales:

- Solo `lumina-simulation.yml` ejecuta directamente `npm run assistants` y `npm run simulate`, que pueden alcanzar `openNexoContinuityOwner`. Los demás workflows invocan tests; no se ejecutaron.
- El workflow de Lúmina puede crear Continuity en un runner efímero si el código y `world-state.json` ejecutados corresponden a la rama inspeccionada. El almacén no se añade a Git. El contenido efectivo de `main` no fue inspeccionado y permanece NO DEMOSTRADO.
- La proyección legada copia las cinco colecciones operacionales con `structuredClone`; filtra las claves que no pertenecen a esas colecciones, pero no sanea semánticamente el contenido copiado.
- La validación de forma permite PREPARED legado sin pasar por `recordPrepared`; también deja sin validar el contenido de varias colecciones y entradas de journal con otros estados. Esto es una brecha de validación/procedencia, pero no autoriza a eliminar ni cambiar la semántica histórica de migración.
- Los tests existentes contienen casos explícitos para preservar PREPARED como obligación no resuelta y bloquear lineage/ejecución no sustentados. No se ejecutaron en esta revisión. La persistencia de PREPARED no equivale a permiso de despacho; el alcance residual se describe en §3.2.

**Estados preservados:** M0 INCOMPLETO; FB-04 OPEN/UNKNOWN; `authorization: NOT_EVALUATED`; Root PENDING/UNKNOWN; First publication STOP; Protected effects STOP.

## 2. Workflows: resultados consolidados

### 2.1 Workflow que alcanza Continuity

`lumina-simulation.yml`:
- dispara por cron cada cinco minutos, dispatch y push a `main`;
- ejecuta `npm test`, `npm run assistants` y `npm run simulate`;
- el grupo `lumina-simulation` usa `cancel-in-progress: true`;
- declara `contents: write`, timeout de dos minutos y luego hace commit/push de `world-state.json` y `.lumina-assistant-memory.json`;
- no añade `.nexo-continuity.json` al commit.

El job puede crear y utilizar Continuity dentro del runner durante esa ejecución. La cancelación entre el commit de Continuity de `assistants.mjs` y el guardado de Lúmina puede dejar un estado parcial dentro del runner, pero el almacén de Continuity no se persiste por el paso Git descrito.

### 2.2 Resto de workflows

La inspección de los 28 workflows no identificó invocaciones directas a:
- `scripts/nexo.mjs`;
- `bootstrapNexoContinuityStore`;
- `nexo-repair-*`.

Los workflows NCS restantes ejecutan tests o verificaciones de sintaxis. Los tests relevantes usan directorios temporales según el alcance de grep/inspección descrito; no se verificó individualmente cada test ni se ejecutó ninguno. El workflow Kafka llamado `ab105-g0-bootstrap` es ajeno al bootstrap Continuity.

### 2.3 Límites de CI

- Los permisos efectivos de `GITHUB_TOKEN` para workflows sin bloque `permissions`, la protección de `main` y el contenido efectivo de `main` quedan FUERA DEL REPOSITORIO / NO DEMOSTRADOS.
- El workflow de Lúmina tiene permiso de escritura Git, pero eso no demuestra persistencia de Continuity: los archivos añadidos explícitamente son otros.
- La concurrencia del grupo limita ejecuciones simultáneas de ese workflow; no constituye una transacción conjunta entre Continuity y el estado de Lúmina.
- No inferir del código de `ncs-clean-architecture` qué código o memoria legada ejecuta `main`.

**D11 — PARCIAL:** la ruta de creación por CI queda demostrada condicionalmente para la rama inspeccionada. Su ejecución efectiva en `main` permanece NO DEMOSTRADA.

## 3. Cadena de importación legada

Flujo estático identificado:

```text
world-state.json
  → loadStateStrict / loadState
  → state.nexoMemory
  → readContinuityServiceOptions
  → openNexoContinuityOwner
  → store.loadCurrent() = NOT_FOUND
  → projectNexoContinuitySnapshot(legacyMemory)
  → assertNexoContinuityMemoryShape
  → structuredClone de cinco colecciones
  → assertNexoContinuitySnapshot
  → store.initialize(snapshot)
  → revisión 0
```

La validación rechaza estructuras malformadas antes de construir/escribir un snapshot parcial. Sin embargo, “estructuralmente válida” no significa “semánticamente confiable” ni “apta para operar”.

### 3.1 Campos y validación

| Entrada | Comportamiento inspeccionado | Límite |
|---|---|---|
| `memory.version` | No se exige ni se propaga; el snapshot asigna su propia versión interna | No acredita compatibilidad del esquema de origen |
| `runs`, `lessons`, `patterns` | Se descartan | No se informa al llamador de la pérdida |
| Claves extra en `memory.nexo` | Se descartan | Puede ocultar datos de otro esquema |
| `missions` | Valida forma mínima, IDs, pasos y dependencias acíclicas; errores de admisión no relacionados con límites se ignoran | Campos operacionales como status/objetivo/target y extras pueden pasar sin validar |
| `attempts`, `doNotRepeat`, `executions` | Solo se valida que sean arrays densos | El contenido no tiene validación semántica en esta ruta |
| `effectJournal` con `prepared` | Exige strings básicos y coincidencia de `action` + `target` con un paso | No exige revisión ambiental, clave de idempotencia coherente, unicidad ni condiciones de ejecución |
| `effectJournal` con otro status | Se acepta sin validar el contenido más allá de la forma de objeto | Estados desconocidos pueden persistirse |
| Recursos / estructuras no JSON | Se aplican límites y guardas de profundidad, ciclos, prototipos, densidad y propiedades | Los máximos específicos de cada colección no fueron transcritos en el complemento |

La proyección copia las cinco colecciones con `structuredClone`. No las normaliza ni convierte su contenido en registros creados por el owner.

### 3.2 PREPARED legado: alcance demostrado

- La vía legada puede insertar PREPARED en la revisión 0 sin invocar `recordPrepared`.
- Para reparación, un PREPARED sin `environmentStateRevision` válida queda bloqueado en las comprobaciones identificadas. Una revisión válida puede satisfacer la condición de obligación previa de `recordExecutionLineage`, si la identidad coincide.
- Para `chronicle_append`, un PREPARED existente puede alcanzar la ruta de observación/reconciliación; no equivale a autorización para redespachar. La ruta necesita un verificador y conserva el resultado no resuelto cuando no puede demostrar la observación.
- Para otras acciones, el runtime canónico inspeccionado bloquea la ejecución.

**Cobertura existente no ejecutada:** `tests/nexo/continuity-migration.test.mjs` contiene casos que preservan PREPARED, exigen `environmentStateRevision` para repair lineage, impiden lineage sin PREPARED, bloquean intentos incompatibles/no verificados y verifican condiciones de reconstrucción de Chronicle. Son evidencia de intención/cobertura escrita, no resultados PASS de esta revisión.

**NO DEMOSTRADO:** comportamiento exhaustivo de cada rama de `reconcilePrepared` frente a toda forma de obligación plantada, historial ausente o consumidor externo/antiguo. No se ejecutaron los tests ni se trazaron todas las rutas fuera del alcance declarado.

Conclusión: la importación puede preservar una obligación operativa cuya procedencia histórica no queda autenticada por la proyección. El owner la trata como obligación no resuelta; los tests existentes incluyen bloqueos que evitan convertirla en lineage/ejecución sin condiciones. Esto no autentica su origen ni demuestra despacho protegido. No se debe borrar ni reinterpretar PREPARED como un estado terminal.

## 4. Registro de hallazgos D10–D14

| ID | Hallazgo | Estado documental | Clasificación / tratamiento |
|---|---|---|---|
| D10 | La vía legada preserva PREPARED y otras colecciones sin aplicar la validación de escritura nueva de `recordPrepared`; algunas colecciones/journal quedan insuficientemente validadas | RESUELTO como hecho de código; alcance normativo pendiente | Brecha de validación/procedencia; preservar obligaciones históricas y evitar convertirlas en permiso o lineage no demostrado |
| D11 | CI puede crear Continuity desde checkout limpio con memoria legada presente | PARCIAL | Condicionado a que `main` contenga el código y datos inspeccionados; el almacén no se persiste en el commit descrito |
| D12 | `persistState` no serializa `nexoMemory` | RESUELTO para el código inspeccionado | La causa histórica del `world-state.json` versionado queda NO DEMOSTRADA |
| D13 | No se valida `memory.version`; claves desconocidas se descartan | RESUELTO | Riesgo de reinterpretación silenciosa de esquemas incompatibles |
| D14 | Errores de admisión no relacionados con límites se ignoran para misiones legadas | PARCIAL | En JSON no pueden aparecer NaN/Infinity; la salvedad aplica a objetos pasados directamente en memoria |

D10–D14 describen la ruta legada. No son una autorización para implementar una migración ni para ampliar el alcance M0.

## 5. Delimitación normativa: bootstrap M0 frente a migración legacy

La migración legacy no debe convertirse en requisito de primera creación M0 ni incorporarse silenciosamente a ella.

Contrato objetivo de separación (propuesta documental, no implementada):

1. El bootstrap M0 crea únicamente el snapshot vacío definido por el contrato M0, desde raíz/destino explícitos y bajo sus gates.
2. La operación de bootstrap no acepta `legacyMemory`, no proyecta memoria histórica, no devuelve owner operacional y termina antes de admisión, PREPARED, dispatch, reconciliación o mutaciones de dominio.
3. La apertura ordinaria debe distinguir “abrir existente” de “crear”. Una API de apertura no debe inicializar por ausencia.
4. La migración legacy existente no se borra ni se reinterpreta como bootstrap. Debe quedar como operación separada, explícita y fuera del camino M0 hasta que tenga contrato y autorización propios.
5. PREPARED legado no debe eliminarse, reinterpretarse como terminal ni convertirse en un PREPARED nuevo. Si una migración futura conserva esa obligación histórica, debe preservarla explícitamente como no resuelta y validar su identidad/esquema. Si no puede validar su significado, la migración se detiene sin alterar la fuente. Su existencia nunca constituye permiso para redespachar.
6. La ruta de CI de Lúmina no debe confundirse con el bootstrap M0 ni tomarse como evidencia de entorno restringido o primera publicación legítima.
7. La persistencia de `world-state.json` y la de Continuity son dominios separados. No prometer atomicidad conjunta ni asumir que la memoria legada estará disponible en ejecuciones futuras.

### 5.1 Contrato futuro de migración — no incluido en M0

Si en el futuro se autoriza una migración, deberá especificar como mínimo:
- versión de origen obligatoria y explícita;
- esquema validado de cada colección operacional;
- política para PREPARED y todos los estados de journal: preservar las obligaciones históricas reconocidas como no resueltas, validar su esquema/identidad y bloquear toda conversión en permiso de ejecución; no descartar estados desconocidos;
- validación completa de misión/admisión y campos que consumen reconstrucción/runtime;
- tratamiento explícito de claves desconocidas;
- preservación de la fuente hasta confirmar la importación;
- no-replace del destino y repetición segura;
- STOP ante cualquier ambigüedad.

No se recomienda implementar ahora una migración “segura” completa: primero debe mantenerse la separación M0 vacío / migración futura y evitar que la ruta legada se active accidentalmente desde entrypoints ordinarios.

## 6. Relación con los gates existentes

- **U-B06:** huecos documentales de workflows y cadena de migración cubiertos para el commit/alcance inspeccionados; no implica control del dominio de escritores real fuera del repositorio.
- **D1:** confirmado: `openNexoContinuityOwner` puede crear al faltar el store mediante legacy o empty-init.
- **D4:** confirmado por la exposición del store y el writer de settlement identificado en el informe anterior.
- **D5:** confirmado: divergencia de resolución de ruta entre `assistants` y `simulate`.
- **D10–D14:** contrato legacy; D10 es brecha de validación/procedencia que debe reconciliarse con los tests de preservación ya existentes; no abrir FB-04 por estos puntos ni duplicar defectos de publicación.
- **FB-03/E2/E3:** permanecen OPEN/UNKNOWN. La lectura de workflows no demuestra el entorno operativo POCO ni el conjunto completo de escritores.
- **FB-04:** permanece OPEN/UNKNOWN. La cadena legacy no resuelve no-replace, estabilidad de ruta, exclusión ambiental ni durabilidad.
- **FB-05/P-05:** NO RATIFICADA.
- **FB-06/FB-07:** OPEN; no se ejecutaron pruebas ni CI en esta revisión.

## 7. Evidencia y límites

Fuentes de código y líneas reportadas por la inspección:
- `.github/workflows/lumina-simulation.yml`: comandos de assistants/simulate, concurrencia y archivos añadidos a Git.
- `src/nexo/core/continuity-service.mjs`: recepción de legacyMemory, rama de proyección e inicialización.
- `src/nexo/core/continuity-contract.mjs`: validación de forma de memoria y journal.
- `src/nexo/core/continuity-snapshot.mjs`: copia de cinco colecciones.
- `src/nexo/core/continuity-owner.mjs`: validaciones de PREPARED, lineage y reconciliación.
- `src/nexo/core/owner-backed-runtime.mjs`: ruta canónica de runtime.
- `scripts/assistants.mjs`, `scripts/simulate.mjs`: callers de apertura del owner y persistencia de Lúmina.

La inspección de workflows fue dirigida en dos archivos grandes de Kafka y no leyó línea por línea el código Java embebido. El análisis de tests fue de existencia/uso de temporales por grep y lectura dirigida, no ejecución ni revisión exhaustiva de cada test. El contenido real de `main`, los permisos efectivos de GitHub y la protección de ramas quedan fuera del alcance.

## 8. Estado final conservado

- U-B06: complemento documental recibido; alcance del repositorio inspeccionado cubierto con límites.
- M0: INCOMPLETO.
- FB-01: OPEN/UNKNOWN en aplicabilidad de raíz/destino y ruta efectiva.
- FB-02: PASS/CERRADO solo para separación bootstrap/Chronicle en el SHA previamente validado; no ampliado por este informe.
- FB-03: OPEN/UNKNOWN; E2/E3 UNKNOWN.
- FB-04: OPEN/UNKNOWN.
- FB-05/P-05: NO RATIFICADA.
- FB-06/FB-07: OPEN.
- Root: PENDING/UNKNOWN.
- `authorization: NOT_EVALUATED`.
- First publication: STOP.
- Protected effects: STOP.

**Tipo de trabajo:** documentación/reconciliación. No se modificaron runtime, tests, workflows ni configuración. No se ejecutaron tests, CI/Actions, scripts del proyecto, comandos POCO, bootstrap ni efectos protegidos.
