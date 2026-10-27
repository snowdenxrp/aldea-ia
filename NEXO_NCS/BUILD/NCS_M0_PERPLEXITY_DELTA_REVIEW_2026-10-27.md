# NCS M0 — Revisión de delta del informe Perplexity (2026-10-27)

**Estado:** nota documental de contraste estático; no es contrato ratificado ni implementación.  
**Rama de referencia:** `ncs-clean-architecture`, commit inspeccionado `e477bdefb4db82456997c106ce7ff65673e15f67`.  
**Gates:** M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; D3/STOP vigente.  
**Cambios ejecutables, tests y CI:** ninguno realizado por esta revisión.

## 1. Resultado ejecutivo

El informe Perplexity aporta una corrección importante al inventario de la rama: `scripts/assistants.mjs` es un tercer caller directo de `openNexoContinuityOwner`, además de Chronicle y simulación. La ruta de `legacyMemory` inicializa continuidad desde `persisted.nexoMemory` cuando el store Nexo no existe, sin depender de `allowEmptyInitialization`. La continuidad alimenta la planificación y puede compartir invocación con persistencia de estado de Lúmina.

También se hizo una comprobación de lectura acotada de los archivos `main` relevantes para distinguir la superficie de automatización del código de la rama auditada. No se consultó historial de Actions ni se verificó si el workflow ha corrido.

## 2. Hallazgos de rama confirmados estáticamente en este contraste

### DLT-01 — Tercer caller directo: `scripts/assistants.mjs`

En el commit de referencia, `scripts/assistants.mjs`:
- carga el estado de mundo mediante `loadStateStrict` si el archivo existe;
- llama a `openNexoContinuityOwner` con `legacyMemory: persisted.nexoMemory ?? null` y `allowEmptyInitialization: !stateExists`;
- pasa `continuity.current.snapshot` a `buildNexoMission`;
- registra la misión con `continuity.owner.recordMission`;
- escribe memoria de asistentes y persiste el estado del mundo en la misma invocación.

**Consecuencia:** el inventario de “dos callers directos” era incompleto. Actualizar el inventario a tres rutas observadas: Chronicle, `simulate.mjs` y `assistants.mjs`. Esto es inspección estática, no ejecución.

Fuente: [scripts/assistants.mjs en el commit de referencia](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/scripts/assistants.mjs).

### DLT-02 — La migración `legacyMemory` inicializa sin `allowEmptyInitialization`

En `continuity-service.mjs`, al no encontrar el store:
- si `legacyMemory` no es null/undefined, proyecta la memoria heredada a un snapshot;
- solo consulta `allowEmptyInitialization === true` cuando no existe memoria heredada;
- inicializa el store con el snapshot resultante.

Por tanto, la ausencia de `allowEmptyInitialization` no impide el camino de migración. El estado de mundo existente puede sembrar el store Nexo separado. Esto amplía la brecha de aislamiento; no demuestra por sí solo autoridad ni un efecto protegido.

Fuentes: [continuity-service.mjs](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/src/nexo/core/continuity-service.mjs) y [continuity-snapshot.mjs](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/src/nexo/core/continuity-snapshot.mjs).

### DLT-03 — Consumidores que afectan planificación

En la ruta de `assistants.mjs`, `continuity.current.snapshot` se usa como memoria al construir la misión. `src/nexo/orchestrator.js` consulta `doNotRepeat` para condicionar pasos. El análisis de consumidores no puede limitarse a `effectJournal`: debe cubrir también `missions`, `attempts`, `executions` y `doNotRepeat`.

Estado: el impacto en planificación está confirmado estáticamente en los archivos citados; el grafo global de consumidores sigue incompleto.

Fuente: [orchestrator.js](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/src/nexo/orchestrator.js).

## 3. Distinción crítica: workflow presente en la rama frente al código ejecutado desde main

El archivo `.github/workflows/lumina-simulation.yml` contiene cron cada cinco minutos, `workflow_dispatch`, permisos `contents: write`, y pasos que ejecutan `npm test`, `npm run assistants` y `npm run simulate`. Sin embargo, antes ejecuta `git fetch origin main` y `git reset --hard origin/main`.

Una lectura puntual de `main` encontró diferencias relevantes respecto del commit de la rama:

- En `main`, `scripts/assistants.mjs` no llama a `openNexoContinuityOwner`; usa `simulation.nexoMemory`, construye la misión y la registra con `recordNexoPlan`.
- En `main`, `scripts/simulate.mjs` no abre el store separado de continuidad y su payload de persistencia no incluye `nexoMemory`.
- El workflow, por tanto, **no puede describirse como ejecución confirmada de los tres callers de la rama auditada**. El propio YAML sincroniza `main` antes de ejecutar.

**Límite:** esto solo confirma el contenido estático leído en los archivos de `main) durante esta comprobación. No confirma que el workflow haya corrido, qué commit exacto ejecutó en una ejecución concreta, ni su resultado. No se consultó historial de Actions ni logs. La presencia del workflow es una superficie automatizada relevante, pero su alcance runtime real permanece parcialmente UNKNOWN.

Fuentes:
- [Workflow de simulación](https://github.com/snowdenxrp/aldea-ia/blob/e477bdefb4db82456997c106ce7ff65673e15f67/.github/workflows/lumina-simulation.yml)
- [assistants.mjs en main](https://github.com/snowdenxrp/aldea-ia/blob/main/scripts/assistants.mjs)
- [simulate.mjs en main](https://github.com/snowdenxrp/aldea-ia/blob/main/scripts/simulate.mjs)
- [package.json en main](https://github.com/snowdenxrp/aldea-ia/blob/main/package.json)

## 4. Carrera de inicialización y tests existentes

Perplexity informa de un test de carrera de bootstrap en `tests/nexo/chronicle-runtime.test.mjs`. En este contraste no se ejecutó ni se leyó el cuerpo de ese test; su mera existencia no demuestra que cubra escritores no cooperativos, cortes de proceso, fallos ambiguos o todos los caminos de inicialización.

La preocupación sobre un escritor no cooperativo entre la comprobación de existencia y el `rename` se mantiene como hipótesis estática que requiere una prueba/contrato de exclusión apropiado; no debe etiquetarse como una carrera reproducida.

## 5. Estado revisado de propiedades negativas

| Propiedad | Estado después del contraste |
|---|---|
| NBP-01 — ausencia de autoridad derivada de estado local | UNKNOWN global; consumidores no exhaustivos |
| NBP-02 — bootstrap no continúa hacia admisión/efectos | Refutada estáticamente en Chronicle; también hay admisión de misión en `assistants.mjs` |
| NBP-03 — rechazo de payload mixto | No demostrado; sin cambio |
| NBP-04 — ausencia no habilita creación/operación normal | No satisfecha en rutas de la rama inspeccionadas; la migración `legacyMemory` amplía el caso |
| NBP-05 — errores y corrupción no tratados como ausencia | Parcial por ruta; UNKNOWN global |
| NBP-06 — estado inicial no decide reintento/reconciliación por sí solo | UNKNOWN global; consumidores de varias colecciones aún incompletos |
| NBP-07 — exclusión frente a todos los escritores | UNKNOWN; el informe identifica lock cooperativo, pero no se ejecutaron pruebas ni se verificó exclusión global |
| NBP-08 — bootstrap no habilita reparación indirecta | La sesión M0 de producto está bloqueada; alcanzabilidad global de módulos dedicados UNKNOWN |
| NBP-09 — NOT_EVALUATED no equivale a aprobación | Sigue siendo una etiqueta que no prueba enforcement |
| NBP-10 — bootstrap no se mezcla con persistencia operativa | No demostrado; `assistants.mjs` registra misión y persiste mundo en una invocación |

## 6. Próximo trabajo documental, ordenado

1. Corregir el mapa de callers de dos a tres para la rama `ncs-clean-architecture`.
2. Añadir `legacyMemory` como camino de inicialización independiente de la bandera de bootstrap vacío.
3. Extender el inventario de consumidores a las cinco colecciones de continuidad y a los puntos de planificación, dispatch y reconciliación.
4. Mantener separadas tres preguntas: contenido de la rama NCS, contenido de `main), y evidencia de ejecuciones reales de Actions.
5. Si se autoriza en una etapa posterior, leer estáticamente los tests de carrera y de CLI citados, sin ejecutarlos, y registrar exactamente qué propiedades cubren.
6. No consultar ni inferir el historial de Actions como si ya estuviera comprobado. El estado de ejecuciones permanece UNKNOWN.

## 7. Límites y decisión

- Inspección estática de archivos de la rama de referencia y lectura puntual de archivos en `main`; no se ejecutó código del repositorio.
- No se ejecutaron tests ni CI; no se consultaron logs ni historial de Actions.
- No se modificaron archivos de runtime, tests, workflows ni configuración ejecutable.
- No se habilitaron reparaciones ni efectos.
- D3/STOP sigue vigente. Opción A sigue siendo investigación de almacenamiento local estrictamente no autoritativo, no un contrato aceptado.
- M0 permanece `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN); autorización `NOT_EVALUATED); efectos protegidos `STOP`.

Una propiedad no se considera demostrada por el nombre de una bandera, por un comentario, por la presencia de un test, ni por la existencia de un workflow. Se requiere evidencia que cubra la ruta y el fallo concreto que la propiedad pretende excluir.
