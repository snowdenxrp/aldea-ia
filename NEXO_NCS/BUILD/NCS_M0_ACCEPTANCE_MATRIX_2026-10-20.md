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
