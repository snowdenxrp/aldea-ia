> **ERRATA / PRECEDENCIA — 2026-11-26:** Las secciones de este documento que cuentan `assistants`, `simulate` o `lumina-simulation.yml` como writers/callers Nexo quedan **CORREGIDAS Y SUPERSEDIDAS**. El contrato canónico P09 para el snapshot `d8b5ca8720908d926acc18130614cce132a43b5d` clasifica esos entrypoints como Lúmina, sin imports de owner/Continuity Nexo. La decisión P08 del propietario también está ratificada: una root canónica deriva ambos stores; no hay rutas independientes ni fallback ambiental en operación normal. Véase obligatoriamente [NCS_M0_P08_P09_RECONCILIATION_ERRATA_2026-11-26.md](NCS_M0_P08_P09_RECONCILIATION_ERRATA_2026-11-26.md). El análisis H2 de `assistants` queda como evidencia del subsistema Lúmina y posible alias configurable no demostrado contra el objeto protegido. No usar este documento sin aplicar esa errata.

---

# NCS M0 — P09 writer/caller census y reconciliación O5/O7
**Fecha:** 2026-11-26  
**Base documental:** `ncs-p05-p07-ai-evidence-consolidation-2026-11-26`  
**Snapshot de código evaluado:** `d8b5ca8720908d926acc18130614cce132a43b5d`  
**Clasificación:** `DOCUMENTARY STATIC RECONCILIATION / PARTIAL`  
**No equivale a:** TESTED, CI-VERIFIED, cobertura universal, cierre P09, P05 o P07-C.

## 0. Propósito y límites

Esta unidad continúa el delta H2 sin repetir una auditoría completa. Hace tres cosas acotadas:

1. incorpora al censo P09 los entrypoints y el workflow que H2 identifica;
2. recupera las definiciones normativas O5/O7 desde el contrato P05/P07, separándolas de las afirmaciones de Claude;
3. clasifica las discrepancias de configuración y automatización por el nivel de evidencia realmente disponible.

Se usó lectura de archivos GitHub en el SHA fijado. No se ejecutaron comandos, tests, workflows, CI ni runtime. No se inspeccionó Termux/POCO ni se accedió a stores productivos. No se modificó código ni workflows.

El censo cubre únicamente las superficies declaradas y localizadas en este snapshot. No demuestra ausencia de loaders dinámicos, consumers externos, launchers no declarados ni otros escritores.

## 1. Definiciones canónicas recuperadas: O5 y O7

La fuente normativa recuperada es:

`NEXO_NCS/BUILD/NCS_M0_D2_P05_P07_CRASH_PERSISTENCE_AND_ADMISSION_PROOF_OBLIGATIONS_2026-11-07.md`

Blob SHA: `7af04a84748bb1174ca5c361d8d0ed24b8d97a43`.

La matriz §4 define:

- **O5 — NO READMISSION:** no existe readmisión por pérdida, sustitución, ilegibilidad o desaparición del estado. Su oráculo requiere matriz de errores/ausencia/tipo inesperado y competidor en proceso separado. Estado en esa matriz: `UNKNOWN/STOP`.
- **O7 — CALLER COVERAGE:** todo caller/writer cubierto respeta la frontera. Su oráculo requiere P09 cerrado para el universo acotado y fixtures de bypass. Estado en esa matriz: `UNKNOWN/STOP`.

La misma fuente define O1–O9 y advierte que O1–O5 conectan P05 con P07, O7 conecta ambos con P09 y O8 conecta la garantía con E2/E3. Ningún PASS aislado sustituye el conjunto.

**Corrección documental:** O5 y O7 no carecen de definición normativa. Lo que permanecía sin resolver era la aplicación de esas definiciones a los claims concretos y la evidencia de cumplimiento. La afirmación H2 de que O5/O7 no se encontraron en el snapshot de código no invalida este contrato NCS, que es un documento de la rama documental y no parte del árbol de código auditado.

## 2. P09 — censo parcial de writers/callers del snapshot

### 2.1 Entry points declarados en package.json

Blob `package.json`: `a42af401a51fde4d38488d136420506b3ed80b38`.

Scripts declarados:

- `simulate` → `node scripts/simulate.mjs`.
- `assistants` → `node scripts/assistants.mjs`.
- `nexo:continuity:bootstrap` → `node scripts/nexo-continuity-bootstrap.mjs`.
- `test` → cadena de tests; no es por sí misma un entrypoint de escritura productiva.

La declaración de scripts identifica entrypoints del package; no demuestra por sí sola quién los invoca en todos los entornos.

### 2.2 `scripts/assistants.mjs`

Blob: `5d773332acf1f762ea9e2eb48dfcf5a5267470d6`.

Hallazgos estáticos directamente visibles:

- `STATE_PATH` acepta `NEXO_STATE_PATH`; si no existe, usa `../world-state.json`.
- `MEMORY_PATH` acepta `NEXO_LUMINA_MEMORY_PATH`; si no existe, usa `../.lumina-assistant-memory.json`.
- Si el state file existe, el script usa `loadStateStrict`; si no existe, usa `loadState`.
- Más adelante llama `persistState(STATE_PATH, ... { expectedRevision, stateRevision })` sin suministrar `loadCurrentState`; por tanto hereda el loader por defecto de `persistState`.
- Escribe la memoria de Lúmina mediante `fs.writeFile(MEMORY_PATH, ...)` sin pasar por el gate de persistencia de estado.
- El archivo no contiene parser de argumentos CLI ni manejo de `--nexo-repair-once`.

Clasificación P09:
- `assistants` es un caller/writer relevante dentro del universo declarado.
- Tiene dos destinos distintos por defecto: `world-state.json` y `.lumina-assistant-memory.json`.
- Ambos destinos admiten override por variables de entorno. No se ha demostrado que esos overrides estén restringidos por el mapping P08 ni por una frontera común de admisión.
- La memoria por defecto de Lúmina permanece separada del store Continuity de Nexo. No afirmar que la escritura por defecto de `.lumina-assistant-memory.json` sea una escritura a Continuity.
- La posibilidad de redirigir el destino mediante entorno es una capacidad estática; la configuración efectiva de R1/CI no se ha inspeccionado.

### 2.3 `scripts/simulate.mjs`

Blob: `ec322cdff76392d7c99a4f45bf35f76a8b91b667`.

Hallazgos estáticos directamente visibles:

- `STATE_PATH` es `../world-state.json`; el script no lee un override ambiental para esa ruta.
- `persistState` acepta una ruta absoluta o file URL y expone opciones `expectedRevision`, `stateRevision` y `loadCurrentState`.
- El loader predeterminado de `persistState` es `loadState`, que fabrica estado de fallback con revisión 0 ante error/JSON/esquema no aceptado.
- `main()` carga el archivo existente mediante `loadStateStrict`, pero `persistState` vuelve a leer usando el loader predeterminado salvo que se le pase otro.
- La función de persistencia borra hermanos con prefijo `<basename>.tmp-` antes de escribir su propio temporal y renombrarlo.
- La ruta de ejecución normal del script usa el world-state del repositorio; la API exportada `persistState` es más general que ese caller normal.

Clasificación P09/H2:
- `simulate` es writer del world-state por su entrypoint normal.
- La capacidad general de `persistState(path, ...)` para apuntar a una ruta absoluta no debe confundirse con prueba de que el caller normal `simulate` apunte a Continuity.
- El posible efecto sobre temporales de Continuity es un riesgo condicionado a que el destino de persistencia sea ese directorio/path; no se afirma que ocurra en la ruta normal `world-state.json`.

### 2.4 `scripts/nexo-continuity-bootstrap.mjs`

Blob: `d6547b62efcda0665e66dc111972544ea9ebe15e`.

Hallazgos estáticos directamente visibles:

- Es un entrypoint distinto del par `assistants/simulate`.
- Requiere `--root` y `--relative-path`; rechaza argumentos fuera de ese contrato.
- Exige stdin/stdout TTY.
- Ejecuta preflight, presenta destino y digest de operación, exige confirmación exacta `PUBLICAR <digest>` dentro de ventana de cinco minutos y luego llama a `bootstrapNexoContinuityStore`.
- Emite `authorization: NOT_EVALUATED` y `continuation: STOPPED` tras la operación.

Clasificación:
- Es un writer potencial/entrypoint de primera publicación de Continuity, sujeto a su propio flujo interactivo.
- No aparece invocado por el workflow `lumina-simulation.yml` recuperado.
- Su existencia no prueba que esté habilitado, ejecutado o autorizado en R1. Tampoco se equipara a los writers de `world-state.json`.

### 2.5 Workflow `.github/workflows/lumina-simulation.yml`

Blob: `e11a11b5101c992396737f3520c427c2c6c4f350`.

Hallazgos estáticos directamente visibles:

- Tiene schedule cada cinco minutos, `workflow_dispatch` y trigger `push` a `main`.
- Tiene permisos `contents: write`.
- Usa concurrency group `lumina-simulation` con `cancel-in-progress: true`.
- Ejecuta `npm test`, luego `npm run assistants`, luego `npm run simulate`.
- Hace stage/commit/push de `world-state.json` y `.lumina-assistant-memory.json`; ante conflicto, reconstruye sobre `origin/main` y vuelve a ejecutar `npm run simulate`.

Clasificación P09:
- Es un escritor automatizado remoto de esos archivos de estado por defecto, mediante los dos entrypoints anteriores.
- **No pertenece a la ventana R1 manual local de Termux.** No debe contarse como evidencia de que el HOME privado de Termux tenga un writer local adicional.
- Sí pertenece al universo declarado P09 de workflows y automatizadores del repositorio.
- Su concurrency group serializa ejecuciones de este workflow entre sí; no prueba exclusividad frente a otros workflows, procesos locales, actores externos ni writers que no compartan el mismo grupo.
- Los triggers schedule/dispatch/push demuestran capacidad de activación configurada en el YAML, no que haya ocurrido una ejecución concreta en la fecha del snapshot.

### 2.6 Workflows de tests

Se recuperaron además:

- `.github/workflows/nexo-deterministic-tests.yml`, blob `3ebd313baecccaa42d89c995dfe8cdbd7f95400a`: instala dependencias y ejecuta tests, sin invocar los entrypoints productivos de bootstrap/assistants/simulate.
- `.github/workflows/nexo-step-3a-isolation.yml`, blob `25c6ef1ec1a09225eefd6d257557b6763ae5c87b`: ejecuta tres archivos de tests; no invoca los entrypoints productivos.

Se clasifican como workflows de verificación, no como writers de estado productivo según los comandos visibles. Esto no prueba que cualquier test aislado carezca de fixtures temporales; solo significa que estos YAML no llaman a los writers productivos citados.

## 3. Mapa P09 resultante

| Actor / entrypoint | Destino visible | Tipo de actor | Estado del censo |
|---|---|---|---|
| `assistants` | `NEXO_STATE_PATH` o `world-state.json` | writer local/CLI | IDENTIFICADO; override no acotado aquí |
| `assistants` | `NEXO_LUMINA_MEMORY_PATH` o `.lumina-assistant-memory.json` | writer de memoria Lúmina | IDENTIFICADO; destino por defecto separado |
| `simulate` | `world-state.json` | writer local/CLI | IDENTIFICADO |
| `persistState` API exportada | ruta absoluta/file URL suministrada por caller | capacidad de API | CAPACIDAD IDENTIFICADA; callers exhaustivos UNKNOWN |
| `nexo:continuity:bootstrap` | root + relative path → Continuity | writer de primera publicación | ENTRYPOINT IDENTIFICADO; ejecución/configuración UNKNOWN |
| `lumina-simulation.yml` | world-state + memoria Lúmina por defecto | automatización GitHub Actions remota | IDENTIFICADO; fuera de R1 local |
| `nexo-deterministic-tests.yml` | tests | workflow de verificación | No writer productivo visible |
| `nexo-step-3a-isolation.yml` | tests | workflow de verificación | No writer productivo visible |

**Resultado:** P09 obtiene un delta útil y concreto, pero sigue **OPEN / UNKNOWN**. El censo no demuestra todos los loaders dinámicos, consumidores externos, invocaciones directas, procesos hijos, launchers ni rutas ambientales efectivas. La decisión P09 del propietario acota el universo declarado; no concede cobertura automática a cada superficie.

## 4. O5 y H2 — relación precisa

H2 reportó tres niveles distintos que deben permanecer separados:

1. **Capacidad general de API:** `persistState` puede aceptar un destino arbitrario y, con loader por defecto fail-open o sin revisión esperada, escribirlo.
2. **Alcanzabilidad por caller:** `assistants` llama a `persistState` con destino derivado de `NEXO_STATE_PATH` y sin `loadCurrentState` explícito.
3. **Exposición efectiva de Continuity:** el informe la clasificó PARTIAL/GAP, porque un envelope Continuity presente sería rechazado por el loader estricto inicial; los escenarios de archivo inicialmente ausente/carrera o configuración de ruta no quedaron demostrados.

La lectura de `assistants.mjs` y `simulate.mjs` en este snapshot confirma estáticamente las firmas y el flujo descritos, pero no resuelve la configuración real, la carrera ni una escritura efectiva a Continuity.

**Conexión O5:** el fallback de revisión 0 y la capacidad de reintento ante ausencia son señales relevantes para la obligación de no readmisión. No bastan para declarar una violación O5 por sí solas: O5 trata del estado durable de coordinación/admisión P05/P07 y requiere vincular ausencia/sustitución/ilegibilidad con una readmisión concreta del mecanismo protegido. H2 no demuestra esa secuencia en un competidor independiente. Estado O5: **UNKNOWN/STOP**, no PASS ni CONTRADICTED por este informe.

## 5. O7 y RAW-1 — alcance, sin fusionar claims

La definición canónica O7 es: todo caller/writer **cubierto** respeta la frontera. Para evaluarla se necesita fijar el universo P09 y la frontera de admisión aplicable a cada actor.

El expediente Claude anterior reportó:
- O7 = `CONTRADICTED`, condicionado al alcance exacto del claim;
- RAW-1 como reproducción reportada en scratchpad y lectura estática de `NEXO_LUMINA_MEMORY_PATH` → `fs.writeFile`.

Esta reconciliación confirma en `assistants.mjs` que la ruta ambiental de memoria Lúmina termina en `fs.writeFile` directo. También confirma que el mismo entrypoint persiste world-state mediante `persistState`. No se recibió ni repitió el scratchpad RAW-1.

Distinciones necesarias:

- El destino por defecto `.lumina-assistant-memory.json` es una memoria Lúmina separada; no es por sí mismo Continuity ni el objeto protegido de Nexo.
- `NEXO_LUMINA_MEMORY_PATH` permite seleccionar otro destino en el entorno. La posibilidad de apuntar a un destino protegido es una capacidad de configuración; no se ha demostrado que la configuración real R1/CI lo haga.
- `NEXO_STATE_PATH` también permite redirigir el state path de assistants; su alcance y restricciones ambientales no están demostrados aquí.
- El workflow recuperado no define esas variables, por lo que sus invocaciones visibles usan los defaults del script, salvo variables inyectadas externamente no visibles en el YAML.
- La ruta directa de escritura demuestra un bypass de la API `persistState` para la memoria Lúmina, pero no demuestra por sí sola que se haya cruzado la frontera del objeto protegido Nexo.

Por tanto:
- Si el claim O7 incluye **todo writer configurable** del universo P09 y la frontera exige que ninguna variable ambiental pueda redirigir una escritura a un objeto protegido sin admisión, el código expone un contraejemplo estático plausible que debe probarse con destino/fixture y alcance exactos.
- Si el claim se limita a writers que operan efectivamente sobre el objeto protegido, la ruta por defecto de memoria Lúmina no satisface por sí sola ese antecedente; la exposición depende de configuración/alias/target no demostrados.
- RAW-1 permanece **REPORTADO / NO REPRODUCIDO INDEPENDIENTEMENTE**.
- O7 permanece **CONTRADICCIÓN REPORTADA, ALCANCE POR FORMALIZAR**; no se declara universalmente CONTRADICTED ni PASS.

## 6. Discrepancias y claims que quedan acotados

### 6.1 `NEXO_STATE_PATH` frente a `NEXO_CONTINUITY_PATH`

En `assistants.mjs` el nombre leído es `NEXO_STATE_PATH`; no `NEXO_CONTINUITY_PATH`. El bootstrap usa `--root` y `--relative-path`. No se debe presentar `NEXO_CONTINUITY_PATH` como interfaz implementada en estos entrypoints.

El informe H2 declara que `NEXO_CONTINUITY_PATH` no aparece en `src/` ni `scripts/` del snapshot. La lectura de los archivos aquí citados es consistente con la ausencia en los entrypoints examinados, pero no equivale a una búsqueda exhaustiva de todo el árbol.

### 6.2 `--nexo-repair-once`

`assistants.mjs` no contiene parser de argv ni rama que procese esa opción. El script de package tampoco la añade a su comando. Por tanto, el argumento no activa un modo de reparación en este entrypoint según el código leído. No se infiere qué hacen otros entrypoints con nombres similares.

### 6.3 Workflow STEP 3A y ruta del adapter

**PATH MISMATCH CONFIRMADO ESTÁTICAMENTE en el snapshot `d8b5ca8720908d926acc18130614cce132a43b5d`:**

- El YAML `nexo-step-3a-isolation.yml` declara como path trigger `src/nexo/core/conditional-commit-persist-state.mjs`.
- Ese path devuelve NOT_FOUND en el snapshot.
- El adapter existe en `src/nexo/adapters/conditional-commit-persist-state.mjs`, blob `d6dc517f9c7841a957749804d612fbfe6e66c9a6`.
- El test `tests/nexo/conditional-commit-persist-state.test.mjs`, blob `6170e52f6f04e74126b49afad2ccf39b187b45c9`, importa explícitamente el adapter desde `../../src/nexo/adapters/conditional-commit-persist-state.mjs`.
- El workflow ejecuta ese test, pero el path filter del adapter apunta a una ruta inexistente; por tanto un cambio exclusivo del adapter real no coincide con el path trigger declarado.

Clasificación: discrepancia de path filter **CONFIRMED-STATIC**. No se ha ejecutado ni modificado el workflow. Esto no prueba que el workflow haya fallado históricamente ni que no se dispare por otros paths del mismo commit.

### 6.4 Workflow de simulación

El YAML muestra un writer remoto real configurado para los archivos por defecto, pero no demuestra acceso al HOME privado de Termux. La concurrency group limita solapamientos de ese workflow consigo mismo; no es una prueba de lock interproceso universal ni de control de todos los escritores P09.

## 7. Matriz de estado tras esta unidad

| Elemento | Estado documental resultante |
|---|---|
| Definición O5 | RECUPERADA; no-readmission |
| Definición O7 | RECUPERADA; cobertura de callers/writers del universo cubierto |
| P09 writer census | AMPLIADO / PARCIAL; OPEN / UNKNOWN |
| H2 API capability | CONFIRMED-STATIC según auditoría recibida y lectura de fuentes del snapshot |
| H2 caller reachability desde assistants | CONFIRMADA ESTÁTICAMENTE en el snapshot |
| H2 exposición efectiva de Continuity | PARTIAL / GAP; no demostrada |
| O5 cumplimiento/violación | UNKNOWN / STOP |
| O7 | CONTRADICCIÓN REPORTADA; alcance por formalizar |
| RAW-1 | REPORTADO; no reproducido independientemente |
| B3 | Sin cambio; no afectado por H2 según el informe recibido; definición/estado se conservan en su fuente propia |
| P05-C | RATIFICADA como política; P05 OPEN |
| P07-C | UNKNOWN / BLOCKING |
| P09 | OPEN / UNKNOWN |
| E2/E3 | PARTIAL / NOT CLOSED |
| M0 | INCOMPLETO |
| `authorization` | `NOT_EVALUATED` |
| Commissioning / efectos protegidos | STOP |

## 8. Siguiente delta permitido

No repetir inventario completo ni reauditar locks. Los únicos cierres documentales pendientes de esta línea son:

1. fijar el texto literal del claim O7 que Claude marcó contradicho y su universo P09;
2. obtener el fragmento RAW-1 original (incluidos target, env, caller, resultado y fixture) si se pretende atribuirlo al objeto protegido;
3. el path mismatch del adapter quedó confirmado estáticamente; verificar únicamente cualquier workflow/launcher adicional que afecte el censo;
4. contrastar el mapping P08 root→stores con los overrides `NEXO_STATE_PATH` y `NEXO_LUMINA_MEMORY_PATH`, sin asumir que esos overrides están habilitados en R1;
5. mantener O5 en UNKNOWN hasta que exista evidencia específica de readmisión/no-readmisión bajo pérdida/sustitución/ilegibilidad del estado.

No seleccionar mecanismo filesystem, no proponer implementación como decisión, no ejecutar pruebas ni activar CI. P05/P07 solo podrán avanzar con evidencia admisible y autorización específica.

## 9. Registro de no-cambios

- Runtime/código: SIN CAMBIOS.
- Tests: NO EJECUTADOS.
- Workflows/Actions: SIN CAMBIOS; NO EJECUTADOS.
- Termux/POCO: SIN ACCESO.
- Continuity/Chronicle productivas: SIN ACCESO NI CAMBIOS.
- PR #110 y ramas de producto: SIN CAMBIOS.
- Stores y efectos protegidos: SIN ACCESO; STOP.
- Estados/gates: SIN CAMBIOS.
