# NCS — matriz de aceptación M0 (estado comprobado)
Fecha: 2026-10-20
Rama: `ncs-clean-architecture`
HEAD comprobado antes de esta matriz: `2690d89e197ccadd3e280ff7542f790955d6ce42`
CI en ese SHA: workflow `Nexo — deterministic persistence tests`, run [39490757350](https://github.com/snowdenxrp/aldea-ia/actions/runs/39490757350), job `tests` = `completed / success`.

## Evidencia adicional M0-E: el vector bootstrap no es una raíz runtime

Informe focal: [NCS_M0_ROOT_BOOTSTRAP_TEST_SCOPE_AND_RUNTIME_GAP_2026-10-20.md](NCS_M0_ROOT_BOOTSTRAP_TEST_SCOPE_AND_RUNTIME_GAP_2026-10-20.md).

La suite `npm test` sí ejecuta `tests/nexo/root-bootstrap-protocol.test.mjs`, pero esa prueba usa una clave/firma fija declarada expresamente como vector de software, no la raíz de Nexo. El árbol inspeccionado no contiene un módulo de runtime de raíz/bootstrap bajo `src/nexo`; no hay evidencia de pin independiente provisionado ni de integración del verificador con `authorityGate` y el límite de efecto. La prueba criptográfica está cubierta; el reconocimiento real de raíz y la ruta end-to-end siguen **NO DEMOSTRADOS**. Esto precisa el alcance de M0-E, no abre una investigación general de bootstrap ni prueba un bypass de producción.

---

## Cómo leer esta matriz

- **Evidencia observada** describe lo que el test o CI sí demuestra, con alcance limitado.
- **Cierre del criterio** indica si ya puede contarse como aceptación M0.
- El éxito de `npm test` en el SHA citado demuestra la suite configurada en `package.json` en ese SHA. No demuestra raíz legítima ni commissioning.
- Los criterios todavía no están congelados como contrato final; esta matriz es el cruce inicial y evita volver a investigar lo ya cubierto.

## Matriz finita

| ID | Criterio de salida | Artefactos/pruebas existentes | Evidencia observada | Cierre del criterio | Brecha exacta |
|---|---|---|---|---|---|
| M0-A | Aceptación reproducible y trazable | `.github/workflows/nexo-deterministic-tests.yml` ejecuta `npm test`; `package.json` incluye suites Nexo, entre ellas `tests/nexo/continuity-contract.test.mjs`, `tests/nexo/protected-transition.test.mjs`, `tests/nexo/root-bootstrap-protocol.test.mjs`, `tests/nexo/runtime.test.mjs` y `tests/nexo/restart-reconstruction.test.mjs`. | Run [39490757350](https://github.com/snowdenxrp/aldea-ia/actions/runs/39490757350), job `tests`, SUCCESS en SHA exacto `2690d89e197ccadd3e280ff7542f790955d6ce42`. | **PENDING** | Confirmar y congelar la lista mínima de workflows obligatorios para M0. La suite determinista actual sí pasó; no asumir que los demás workflows históricos forman parte de la puerta final si no se acuerda su necesidad. |
| M0-B | Continuidad, admisión y persistencia | `tests/nexo/continuity-contract.test.mjs`; `tests/nexo/conditional-commit-persist-state.test.mjs`; `tests/nexo/restart-reconstruction.test.mjs`; contrato `src/nexo/core/continuity-operations.mjs` y contratos/store asociados. | Estas suites forman parte de `npm test`; la ejecución del SHA actual terminó SUCCESS. Los informes de STATUS registran regresiones de snapshots/misiones persistidas, lock failures y ConditionalCommit. | **PENDING** | Convertir el alcance de los contratos existentes en una lista corta de assertions de aceptación; no repetir auditorías ya cubiertas. No afirmar que cada posible ruta legacy quedó desactivada. |
| M0-C | Reconstrucción de resultados terminales contradictorios o con contexto discordante | `tests/nexo/continuity-contract.test.mjs`; runtime `src/nexo/core/continuity-operations.mjs`; informes de reconstrucción terminal en STATUS/handoffs. | La suite configurada pasó en el SHA actual. Historial de CI por SHA exacto documenta regresiones para `NEXO_OUTCOME_EVIDENCE_CONFLICT` y `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`; no redispatch por inferencia. | **PENDING** | Reutilizar los casos y enlazar los commits/runs específicos en el inventario final. No reabrirlos salvo evidencia nueva de cobertura insuficiente. |
| M0-D | Journal desconocido, identidad y reconciliación de efectos | `tests/nexo/continuity-contract.test.mjs`, `tests/nexo/effect-intent-persistence.test.mjs`, `tests/nexo/repair-settlement-crash-cuts.test.mjs`; informe `NCS_M0_UNKNOWN_EFFECT_RECONSTRUCTION_FAIL_CLOSED_2026-10-20.md`. | La suite configurada pasó en el SHA actual. El historial de STATUS registra SUCCESS de los workflows focales/integrados para el fix fail-closed en SHA `dd30b70e1204750fc09fac683f30b6e7e129bfe6`. | **PENDING** | Enlazar los casos/runs y fijar cuáles son las aserciones mínimas de aceptación. Mantener la distinción entre resultado local persistido y efecto externo realmente observado. |
| M0-E | Autoridad legítima conectada a la ruta real de efectos protegidos | `tests/nexo/protected-transition.test.mjs`; `src/nexo/core/protected-transition.mjs`; `src/nexo/core/ownership.mjs`; inventario `NCS_M0_CLAIM_RELATIVE_AUTHORITY_ENFORCEMENT_INVENTORY_2026-10-20.md`; guía de revisión constitucional del propietario. | El test integrado actual pasa, pero sus fixtures `AUTHORIZED` son inyectados y no demuestran una raíz legítima. La revisión estática confirma que el puerto `authorityGate.check` es inyectable; `effectBoundary.prepare` existe como puerto con fallback NOT_IMPLEMENTED y `executeProtectedTransition` llega a `conditionalCommit.commit(candidate)` sin invocar ese puerto. Esto confirma falta de integración demostrada, no un bypass activo probado. | **PENDING / BLOQUEANTE** | Falta el objeto constitucional exacto revisado/aprobado por el propietario y una fuente de raíz/procedencia verificable conectada al contexto protegido y a la última frontera de efecto. No cambiar runtime para fingir esa procedencia ni inferirla del caller. |

## Lectura de la frontera de autoridad (M0-E)

La prueba `tests/nexo/protected-transition.test.mjs` prueba composición con puertos simulados. En `src/nexo/core/protected-transition.mjs`, `authorityGate.check(claim)` permite avanzar cuando el resultado tiene estado AUTHORIZED; la legitimidad de ese resultado depende del adaptador inyectado. El runtime inspeccionado no establece por sí mismo que dicho adaptador esté conectado a una raíz legítima. Además, aunque `createCorePorts()` expone `effectBoundary.prepare`, la transición examinada no lo llama antes de `conditionalCommit.commit(candidate)`.

**Interpretación exacta:** hay un gap de integración/contrato de frontera que bloquea aceptación de M0-E. Esta inspección no demuestra que exista un exploit de producción ni que toda ruta legacy esté activa. No añadir un chequeo ficticio ni una nueva raíz por código. La dependencia previa es revisión/aprobación del objeto constitucional exacto por el propietario y definición de cómo el Core verifica la procedencia de raíz dentro de ese contrato.

## Orden de trabajo resultante

1. Mantener M0-A como PENDING hasta congelar la lista finita de workflows obligatorios; el workflow determinista actual ya tiene SUCCESS en el SHA de arriba.
2. Convertir la evidencia ya existente de M0-B/C/D en referencias directas dentro del inventario final; no volver a ejecutar investigaciones cerradas solo para repetir explicaciones.
3. Tratar M0-E como el bloqueo sustantivo actual. La siguiente acción no es crear otro mecanismo de raíz: es obtener revisión explícita del borrador constitucional por el propietario y, solo después, derivar el contrato mínimo de reconocimiento/procedencia y conectarlo al límite real.
4. No provisionar la llave raíz, firmar/digeste la Constitución ni iniciar commissioning antes de la aprobación del objeto exacto.
5. Revalidar HEAD y CI al terminar cualquier cambio; un run SUCCESS solo acredita su workflow y SHA exactos.

## Estado

M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. No hay cierre de M0 todavía.


---

## Inventario finito de assertions existentes — continuidad de M0 (2026-10-21)

Esta sección reduce la brecha de definición sin declarar aceptación ni cambiar los estados de la matriz. Las pruebas citadas existen en la rama consultada y `package.json` las incluye en `npm test`; no se afirma que hayan sido ejecutadas en el HEAD documental actual.

### M0-A — puerta de ejecución
- Puerta mínima candidata: workflow `.github/workflows/nexo-deterministic-tests.yml`, job `tests`, ejecutando el script `npm test` definido en `package.json`.
- Evidencia de aceptación requerida: run `completed / success` cuyo SHA sea exactamente el SHA final evaluado; conservar run ID, job y SHA.
- Los workflows focales históricos se conservan como evidencia de diagnóstico, pero no se exige repetirlos todos si el workflow determinista incluye las suites relevantes. Esta propuesta no declara M0-A PASS hasta observar CI en el SHA final.

### M0-B — continuidad, admisión y persistencia
Reutilizar al menos las assertions existentes de:
- `tests/nexo/continuity-contract.test.mjs`: forma persistida inválida, identidad ausente/duplicada, dependencias inválidas y grafo cíclico deben rechazarse antes de reconstrucción.
- `tests/nexo/conditional-commit-persist-state.test.mjs`: revisión obsoleta produce conflicto sin sobrescribir el estado actual; fallo de persistencia o resultado no clasificable permanece `UNKNOWN`; entrada de revisión insegura no debe iniciar persistencia.
- `tests/nexo/restart-reconstruction.test.mjs`: una ejecución aislada sin outcome no se convierte en finalización y un resultado obsoleto no revierte una finalización verificada.
- Estado: **PENDING** hasta fijar la puerta final y obtener CI atribuible al SHA evaluado.

### M0-C — reconstrucción terminal
Reutilizar los casos ya presentes en `tests/nexo/continuity-contract.test.mjs` y `tests/nexo/restart-reconstruction.test.mjs`, además de las regresiones históricas referidas en STATUS:
- conflicto de evidencia o discordancia de contexto no se resuelve por inferencia;
- resultado obsoleto no degrada un resultado terminal verificado;
- registro de ejecución sin outcome persistido no completa el paso ni la misión.
- Estado: **PENDING** hasta enlazar los casos focales exactos con la evidencia CI final. No repetir la auditoría salvo contraejemplo nuevo.

### M0-D — journal, recuperación y reconciliación
Reutilizar las suites ya incluidas en `npm test`:
- `tests/nexo/effect-intent-persistence.test.mjs`: el intent `prepared` debe persistirse antes de invocar el handler; si falla la persistencia, el handler no se ejecuta y la entrada permanece `prepared`.
- `tests/nexo/continuity-contract.test.mjs` y la regresión fail-closed registrada en el handoff: estado desconocido del journal asociado a una misión bloquea; estado desconocido sin propietario resoluble no se ignora; los terminales aceptados conservan su semántica.
- `tests/nexo/repair-settlement-crash-cuts.test.mjs`: no se acepta finalización basada solo en `verified` aportado por el caller ni se cierra sin verificación de objetivo soportada.
- Estado: **PENDING** hasta enlazar casos/runs focales con CI final. No confundir un journal terminal local con prueba de efecto externo observado.

### M0-E — dependencia no sustituible por CI
Permanece **PENDING / BLOQUEANTE**. La prueba `tests/nexo/protected-transition.test.mjs` incluye una regresión contra campos de Constitución/raíz/autoridad aportados por el caller, pero sus fixtures de autoridad siguen siendo simulados. No existe evidencia en esta matriz de procedencia de raíz legítima integrada hasta el sink real. El registro de aceptación de puntos constitucionales 1–6 como base no equivale a aprobación del objeto exacto ni resuelve el punto 7, la fuente de confianza independiente o la integración del límite de efecto.

### Límite de esta actualización
Es un inventario documental de assertions ya existentes, no una nueva suite, no un cambio de runtime y no un PASS. No se ejecutó CI durante esta actualización. Estados conservadores sin cambio: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Actualización de evidencia CI posterior al checkpoint CLI (2026-10-22)

### Evidencia exacta más reciente observada

- Rama `ncs-clean-architecture`, HEAD comprobado antes de esta actualización: `81825ee864f887b1914c3da9065cbd83df910c85`.
- Workflow determinista: [run 39697191705](https://github.com/snowdenxrp/aldea-ia/actions/runs/39697191705), job `tests`, `completed / success`, SHA exacto `81825ee864f887b1914c3da9065cbd83df910c85`.
- Este run acredita que `npm test` pasó en ese SHA. No se extrapola al commit de esta actualización ni a ningún SHA posterior.
- La actualización del inventario de invocación CLI no cambió runtime ni el alcance de efectos. La prueba CI verde no crea raíz, no aprueba el borrador constitucional y no demuestra enforcement de autoridad legítima.

### Lectura de estado, sin reabrir trabajo cerrado

- **M0-A sigue PENDING** hasta congelar explícitamente la puerta finita de aceptación. La evidencia reciente sí confirma el workflow determinista propuesto en el SHA indicado; no resuelve por sí sola la decisión documental de congelar la puerta.
- **M0-B/C/D siguen PENDING en esta matriz** hasta enlazar de forma compacta sus assertions existentes y evidencia histórica por SHA. No repetir las auditorías/pruebas históricas ya registradas sin contraejemplo.
- **M0-E sigue siendo el bloqueo sustantivo**: el inventario existente ya distingue el commit de estado Core, el adapter de efectos y la ruta de simulación excluida por Opción A. No clasificar `conditionalCommit.commit` como sink externo sin prueba de su función, ni inferir que el módulo de simulación sea inalcanzable globalmente.
- La decisión de alcance inicial Opción A y las aceptaciones constitucionales como base siguen siendo límites de trabajo, no aprobación del borrador exacto ni commissioning.

Estado conservador sin cambios: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

## Consolidación de evidencia histórica M0-B/C/D (2026-10-22)

Este bloque reutiliza runs ya registrados en `STATUS.md` y en los informes focales. No reabre las investigaciones ni atribuye CI de un SHA a otro. Son evidencias de regresiones específicas, no aceptación final completa de M0.

### M0-B — continuidad, admisión y persistencia

- Contratos y suites fuente: `tests/nexo/continuity-contract.test.mjs`, `tests/nexo/conditional-commit-persist-state.test.mjs`, `tests/nexo/restart-reconstruction.test.mjs`.
- La suite determinista en el SHA `2690d89e197ccadd3e280ff7542f790955d6ce42` terminó SUCCESS en [run 39490757350](https://github.com/snowdenxrp/aldea-ia/actions/runs/39490757350).
- La suite valida los contratos configurados en ese SHA; no demuestra que todas las rutas legacy estén desactivadas ni que haya una autoridad constitucional runtime.

### M0-C — resultados terminales contradictorios/contexto discordante

- Informe de continuidad: [NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_CONTINUITY_RECONSTRUCTION.md](NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_CONTINUITY_RECONSTRUCTION.md) y las notas de regresión en `STATUS.md`.
- SHA `876e1924292bd8c301b7e050531be9ded79ce290`: workflows focales de aceptación M0, admisión/continuidad acotada, STEP 4 y STEP 5 SUCCESS; el workflow determinista de ese SHA fue CANCELLED, no PASS. No elevar esa ejecución parcial a suite completa.
- Los casos identificados incluyen `NEXO_OUTCOME_EVIDENCE_CONFLICT` y `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`. La aceptación final sigue PENDING hasta congelar las aserciones mínimas y fijar su matriz de workflows obligatorios.

### M0-D — journal UNKNOWN, identidad y reconciliación

- Informe: [NCS_M0_UNKNOWN_EFFECT_RECONSTRUCTION_FAIL_CLOSED_2026-10-20.md](NCS_M0_UNKNOWN_EFFECT_RECONSTRUCTION_FAIL_CLOSED_2026-10-20.md).
- SHA exacto `dd30b70e1204750fc09fac683f30b6e7e129bfe6`: SUCCESS en persistencia determinista [39464052770](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052770), admisión/continuidad [39464053282](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053282), aceptación integrada [39464053079](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053079), STEP 4 [39464052881](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052881) y STEP 5 [39464052959](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052959).
- Estos resultados verifican los workflows enumerados en ese SHA para el cierre fail-closed de la regresión descrita. No demuestran observación de un efecto externo ni autorización constitucional.

### Estado resultante

- Esta consolidación reduce el trabajo de búsqueda repetida; no cambia los estados de aceptación.
- M0-B/C/D siguen **PENDING** hasta cerrar el conjunto finito de assertions/workflows requerido, aunque las regresiones citadas tengan CI focalizado SUCCESS.
- M0-E sigue siendo el bloqueo sustantivo: raíz legítima y procedencia constitucional conectadas al límite real de efecto no demostradas.
- Estado global sin cambio: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

## Ensamblaje canónico M0 — precedencia y puerta finita (2026-10-22)

### Precedencia de decisiones

Las notas históricas se interpretan junto con los registros específicos del propietario:

- `DECISIONS/NCS_M0_E_INITIAL_SCOPE_OWNER_DECISION_2026-10-21.md`: Opción A **aceptada como alcance inicial provisional**. Arranque sin efectos protegidos; lectura, planificación/diagnóstico sin ejecutar y persistencia interna acotada bajo sus límites. Reparaciones, mutaciones Lúmina/simulación, efectos externos/irreversibles y operaciones no clasificables siguen excluidos.
- `DECISIONS/NCS_M0_CONSTITUTION_OWNER_DECISIONS_2026-10-21.md`: puntos 1–7 **aceptados como base del borrador**. El punto 7 no está pendiente de decisión de base; sí siguen pendientes el texto exacto aprobado, la raíz/procedencia, el estado canónico y el enforcement real.
- La Constitución sigue `DRAFT / NOT FROZEN / NOT COMMISSIONED`. Ninguna de estas decisiones autoriza firma, congelación, commissioning ni efectos protegidos.

### Puerta finita candidata de aceptación M0

| Gate | Evidencia reutilizada | PASS exige | Estado |
|---|---|---|---|
| A — reproducibilidad | `.github/workflows/nexo-deterministic-tests.yml`, job `tests`, `npm test` | Workflow completo `completed/success` en el SHA candidato exacto | PENDING para HEAD actual |
| B — continuidad | `continuity-contract.test.mjs`, `conditional-commit-persist-state.test.mjs`, `restart-reconstruction.test.mjs` | Rechazo de entradas inválidas/obsoletas y no convertir incertidumbre en éxito | Evidencia focal existente; falta cierre atribuible al SHA candidato |
| C — terminales | Casos existentes `NEXO_OUTCOME_EVIDENCE_CONFLICT`, `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH` y ausencia de outcome | Conflicto/contexto discordante bloquea; sin finalización ni redispatch inferidos | Evidencia focal existente; falta cierre atribuible al SHA candidato |
| D — journal | `effect-intent-persistence.test.mjs`, `repair-settlement-crash-cuts.test.mjs` y regresión UNKNOWN registrada | Intención antes del handler; UNKNOWN/fallo bloquea; no aceptar verificación autodeclarada | Evidencia focal existente; falta cierre atribuible al SHA candidato |
| E — Opción A y autoridad | Matriz Option A, gate de reparación y plan adversarial E-01…E-10 | Exclusiones bloqueadas antes de dispatch/mutación; autoridad solo si se prueba procedencia en el límite real | BLOQUEANTE: raíz/Constitución/contexto no integrados |

A–D se evalúan con una puerta reproducible común y las assertions existentes; no se repiten las investigaciones cerradas ni se exigen todos los workflows históricos si la puerta común cubre los contratos. Los runs focales históricos son evidencia de regresión, no sustituyen el run final sobre el SHA candidato.

E no pasa con `npm test` por sí solo. Bajo Opción A, no hay que habilitar efectos protegidos para el arranque restringido, pero sí demostrar que las operaciones excluidas no son alcanzables desde las entradas en alcance. Chronicle/Continuity local no equivale a autorización ni a prueba de efecto externo.

### Orden de ejecución

1. Reutilizar esta lista como puerta de trabajo candidata; no declarar congelada la Constitución.
2. Revisar solo huecos de cobertura concretos en las pruebas de exclusión Opción A y las entradas ya inventariadas.
3. Ejecutar la puerta determinista en el SHA candidato y registrar run/job/conclusión/SHA exactos.
4. Mantener M0 incompleto mientras E siga sin evidencia suficiente. No fabricar root verifier, pin o firma de prueba para simular el caso positivo.

Estado: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


---

## Hallazgo de ensamblaje — persistencia interna aún sin presupuesto de recursos (2026-10-22)

La Opción A permite persistencia interna acotada de Chronicle/Continuity, pero el límite operativo cuantitativo de esa persistencia todavía no está definido. La inspección de `src/nexo/application/chronicle-append.mjs`, `src/nexo/adapters/chronicle-effect.mjs` y `src/nexo/core/chronicle-store.mjs` encontró validación de tipo/no vacío e identidad de operación, pero no encontró un límite explícito de bytes por entrada, número total de entradas o tamaño total del documento Chronicle. La inspección de `src/nexo/core/continuity-snapshot.mjs` encontró validación estructural de las colecciones `missions`, `attempts`, `doNotRepeat`, `executions` y `effectJournal`, pero no un máximo cuantitativo de cardinalidad/tamaño en ese contrato.

Esto no prueba un exploit ni invalida los controles de idempotencia, locking o revisión. Sí impide afirmar que la persistencia está completamente acotada frente a consumo acumulativo de recursos, tanto en Chronicle como en las colecciones de Continuity inspeccionadas.

- El entrypoint `chronicle-append` puede crear una misión de una sola etapa y almacenar contenido provisto por el llamador.
- `authorization` se informa deliberadamente como `NOT_EVALUATED`; el append local no debe presentarse como autorización constitucional.
- No se fija un número arbitrario en este hallazgo. Para cerrar el límite, el contrato de alcance debe definir el presupuesto operativo (bytes por entrada, capacidad total/rotación y comportamiento al agotarse) y luego las pruebas deben verificar rechazo antes de escribir, sin pérdida de registros existentes ni éxito inferido.
- Hasta que exista esa definición, clasificar este subcriterio de E como `PENDING`; no modificar el runtime con un límite inventado ni llamar completa a la Opción A.

Estado global sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.
