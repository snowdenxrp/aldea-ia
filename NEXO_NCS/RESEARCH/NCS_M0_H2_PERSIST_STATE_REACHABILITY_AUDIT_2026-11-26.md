# NCS M0 — Auditoría complementaria de alcanzabilidad H2 / persistState
**Fecha de recepción:** 2026-11-26  
**Snapshot auditado:** `d8b5ca8720908d926acc18130614cce132a43b5d`  
**Rama de consolidación:** `ncs-p05-p07-ai-evidence-consolidation-2026-11-26`  
**Clasificación:** `EXTERNAL STATIC-AUDIT REPORT / RECEIVED`  
**Estado:** `REPORT-RECEIVED; NOT INDEPENDENTLY REPRODUCED`

## 0. Procedencia y límites

Este documento registra una auditoría estática recibida del usuario el 2026-11-26. El auditor declara haber trabajado sobre el SHA fijado mediante `git show` y `git grep`, sin checkout, tests, runtime ni modificaciones del repositorio. También declara haber eliminado su copia temporal externa.

La presente incorporación no repite el análisis ni verifica de forma independiente sus comandos, resultados, rangos de línea o conclusiones. Los hallazgos se conservan como **reportados** y ligados al snapshot indicado. El auditor informa que el HEAD de su clon era `49495f81`, distinto del SHA auditado.

No elevar ningún hallazgo a TESTED, CI-VERIFIED o LOCAL-VERIFIED.

## 1. Veredicto reportado

El auditor clasifica H2 como **contraejemplo de API confirmado estáticamente**: `persistState` puede usar un loader fail-open cuando recibe `expectedRevision` pero no recibe `loadCurrentState`; sin opciones, tampoco existe comprobación de revisión.

El auditor distingue ese hecho de la exposición efectiva de Continuity: el caller `assistants` tiene una ruta de producto hacia `persistState`, pero el informe no demuestra una sobrescritura ordinaria del Continuity. La exposición requiere condiciones adicionales de carrera o configuración no demostrada en el snapshot.

El protocolo de reparación no resulta afectado por este H2 según el informe: el protocolo interno pasa explícitamente `loadStateStrict`, mientras que sus wrappers están bloqueados por un gate incondicional antes de tocar el protocolo.

## 2. Núcleo estático reportado

En `scripts/simulate.mjs`:
- `loadStateStrict` (líneas reportadas 103–156): falla cerrado; exige `version >= 3`, `world`, `agents` y revisión entera no negativa.
- `loadState` (158–181): falla abierto; ante lectura fallida o esquema inválido devuelve `stateRevision: 0`.
- `persistState` (215–260): si `expectedRevision !== null`, llama a `loadCurrentState`, cuyo default es `loadState`; sin opciones, `expectedRevision` es `null` y no se realiza comprobación de revisión.

La API acepta una ruta absoluta según `normalizePersistencePath` (rango reportado 18–36). El informe afirma que una llamada directa a `persistState(pathContinuity, ...)` sin opciones, o con `expectedRevision: 0` y loader por defecto, puede sobrescribir una ruta que no contiene world-state. Esto se clasifica como capacidad general de API, no como caller de producto demostrado para el objeto Continuity.

## 3. Entrypoints y alcanzabilidad reportada

- `package.json` declara scripts `simulate`, `assistants` y `nexo:continuity:bootstrap`.
- `npm run simulate` usa la ruta fija `../world-state.json`; el auditor afirma que no admite override por entorno y que no apunta directamente a Continuity.
- `npm run assistants` lee `NEXO_STATE_PATH`. Si el archivo existe, primero usa `loadStateStrict`; después llama a `persistState` con `expectedRevision: persisted.stateRevision ?? 0`, pero sin pasar `loadCurrentState`, por lo que el loader predeterminado es fail-open.
- Los importadores de `simulate.mjs` reportados son `scripts/assistants.mjs`, tests y el script de package. No se encontró importador desde `src/nexo/` ni desde `scripts/nexo*.mjs`.
- `nexo.mjs` solo hace spawn de `nexo-chronicle-session.mjs`; no se encontró una cadena de imports de producto que llegue a `simulate.mjs`.

## 4. Exposición efectiva de Continuity — condiciones reportadas

El envelope de Continuity en `continuity-store.mjs` (líneas reportadas 436–441) es `{schema, schemaVersion, storeRevision, snapshot}`, sin `version`, `world` ni `agents` en el nivel superior.

El auditor describe estas rutas:
1. **Archivo presente en assistants:** `loadStateStrict` rechaza el envelope Continuity antes de llegar a `persistState`; por esta ruta no habría sobrescritura directa.
2. **Archivo ausente inicialmente:** assistants carga fail-open con revisión 0. Si un Continuity aparece en el path antes de la lectura de `persistState`, la comprobación fail-open puede aceptar revisión 0 y escribir. Requiere carrera con escritor externo.
3. **World-state presente:** el caso requeriría revisión estricta 0 y que el archivo se convirtiera en Continuity antes de la persistencia. El `world-state.json` trackeado reporta `stateRevision: 2329`, por lo que ese archivo no representa el caso de revisión 0. El estado real del despliegue R1 no fue inspeccionado.
4. **API directa:** capacidad general de sobrescritura confirmada estáticamente según el auditor, pero sin caller de producto demostrado que la invoque sobre Continuity.

El auditor también reporta que `simulate` y Continuity usan el mismo protocolo de lock `${path}.lock` como directorio con `owner.json`, por lo que se excluyen mutuamente bajo lock. Sin embargo, la lectura previa de assistants ocurre fuera del lock.

Efecto lateral reportado: `simulate.mjs` elimina hermanos `<basename>.tmp-*` del mismo directorio (líneas 243–247); el publicador de Continuity usa nombres temporales `…tmp-` en el flujo de publicación exclusiva. El auditor considera que una escritura fail-open sobre ese path podría eliminar temporales de Continuity. Este efecto se conserva como hallazgo estático reportado, no como reproducción de daño.

## 5. Gate y protocolo de reparación

El auditor reporta:
- `scripts/nexo-m0-gate.mjs` lanza incondicionalmente `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`.
- `nexo-repair-entrypoint.mjs`, `nexo-repair-dispatch.mjs` y `nexo-repair-session.mjs` llaman al gate antes del protocolo y devuelven estado `blocked`, `persisted:false`, `dispatchAttempted:false`.
- `nexo-runtime-session.mjs` devuelve `blocked` incondicionalmente.
- `scripts/nexo-repair-protocol.mjs` pasa `loadCurrentState: loadStateStrict` a `persistState`.
- El adapter `conditional-commit-persist-state.mjs` no pasa ese loader y, según el auditor, solo lo importa su test.
- El puerto de ownership queda `NOT_IMPLEMENTED` por defecto; ningún runtime inyecta el adapter en el protocolo fuera de tests.

Conclusión limitada: H2 no demuestra una ruta de ejecución del protocolo de reparación ni una violación de su loader estricto. No confundir el adapter aislado, el protocolo interno y un entrypoint de producto.

## 6. Impacto por dimensión

| Dimensión | Resultado reportado | Límite |
|---|---|---|
| Capacidad general de API | CONFIRMED-STATIC | No prueba que un caller real use Continuity como destino |
| Alcanzabilidad desde R1 | PARTIAL / GAP | `assistants` alcanza persistencia con `NEXO_STATE_PATH`; exposición efectiva del Continuity condicionada |
| Caller de producto | Sí para `assistants` y `simulate` | No para adapter conditional-commit |
| Exposición efectiva de Continuity | PARTIAL / GAP | Requiere carrera/configuración no demostrada |
| P09 | Sigue OPEN | El censo debe incorporar `assistants`, `simulate` y cron CI como escritores relevantes |
| B3 | No afectado por H2, según el informe | No resuelve el estado general P05/P07 |
| O5 / O7 | UNKNOWN | El auditor no encontró definiciones canónicas en `NEXO_NCS/` de este SHA |

## 7. CI y discrepancias documentales

El informe indica que `.github/workflows/lumina-simulation.yml` corre por cron cada cinco minutos y ejecuta `npm run assistants` y `npm run simulate` con rutas por defecto. El auditor lo clasifica fuera del R1 manual, pero como escritor real de los mismos archivos de estado por defecto.

También reporta:
- `--nexo-repair-once` no es parseado por `assistants.mjs` en el SHA auditado; el test lo pasa como argumento, pero el script lo ignora.
- `NEXO_CONTINUITY_PATH` no aparece en código de `src/` ni `scripts/` de ese SHA, pese a descripciones documentales previas.
- La referencia del workflow `nexo-step-3a-isolation.yml` apunta a una ruta `src/nexo/core/…` que el auditor dice que no existe en ese árbol; el archivo real estaría bajo `adapters/`.
- El guard de importaciones M0 es estático y verifica grafos, no ejecución del gate.

Estas son discrepancias de snapshot reportadas. No extrapolar automáticamente a HEAD posterior ni al estado actual del despliegue.

## 8. Relación con el expediente Claude/Qwen previo

Esta auditoría se añade como delta independiente y **no reemplaza** el informe Claude H1–H9 ni la consolidación previa:
- El informe Claude previo reportó RAW-1 y una clasificación provisional de O7 condicionada al alcance del claim.
- Esta auditoría H2 declara que O5/O7 no pueden resolverse desde el snapshot porque sus definiciones NCS no están presentes en el árbol examinado.
- No hay contradicción lógica necesaria: son claims y rutas diferentes, y esta auditoría limita explícitamente su atribución de O7. Mantener O7 como **claim pendiente de formalización/cotejo canónico**, con el reporte RAW-1 preservado por separado; no borrar ni promover ninguno de los dos.
- P09 permanece OPEN/UNKNOWN. La aportación nueva es una ampliación reportada del universo de writers/callers, no un censo cerrado.
- B3 no se considera resuelto ni reabierto por este H2. La conclusión “B3 no afectado por H2” no modifica el estado heredado P05 OPEN / P07-C UNKNOWN/BLOCKING.

## 9. Próximo paso documental recomendado

Antes de cualquier implementación:
1. Recuperar las definiciones canónicas exactas de O5 y O7 y la matriz O1–O9 aplicable al snapshot.
2. Formalizar H2 separando: API capability, caller reachability, target-path exposure y destructive side-effect.
3. Añadir `assistants`, `simulate` y el cron CI al writer census P09, distinguiendo R1 manual de automatización CI.
4. Resolver documentalmente la discrepancia entre `NEXO_STATE_PATH`, `NEXO_CONTINUITY_PATH` y las afirmaciones históricas sobre `--nexo-repair-once`.
5. Mantener fuera del claim cualquier carrera/configuración hipotética hasta contar con evidencia específica.
6. No repetir auditorías completas; solicitar solo la evidencia puntual que cierre una de estas brechas.

## 10. Estado y restricciones

- Snapshot: `d8b5ca8720908d926acc18130614cce132a43b5d`.
- Auditoría: estática reportada; sin tests ni runtime.
- H2: contraejemplo de API CONFIRMED-STATIC según el auditor; exposición efectiva de Continuity PARTIAL/GAP.
- P09: OPEN/UNKNOWN.
- O5/O7: UNKNOWN en el alcance de esta auditoría; definiciones canónicas no localizadas en el snapshot.
- B3: no afectado por H2 según el informe; no implica cierre de P05/P07.
- P05-C: RATIFICADA como política; P05 OPEN.
- P07-C: UNKNOWN/BLOCKING.
- M0: INCOMPLETO.
- `authorization: NOT_EVALUATED`.
- Commissioning y efectos protegidos: STOP.

No se ejecutaron ni autorizaron tests, CI, runtime, workflows, Termux/POCO, bootstrap, mutaciones de Continuity/Chronicle, cambios de producto, PR #110 ni efectos protegidos.
