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
