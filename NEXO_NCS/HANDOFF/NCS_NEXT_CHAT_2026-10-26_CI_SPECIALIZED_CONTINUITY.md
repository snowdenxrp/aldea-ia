# NCS — HANDOFF DE CONTINUIDAD — CI ESPECIALIZADO Y LÍNEA DE META M0
Fecha de preparación: 2026-10-26 (la API de Actions muestra el run más reciente en 2026-10-27 UTC).

## 0. Instrucción de entrada para el siguiente chat

La palabra de reinicio del proyecto es exactamente **NCS**. Empezar por:
1. `NEXO_NCS/STATUS.md`
2. `MASTER/CORE` (principios y estado canónico)
3. `BUILD` (criterios, matrices y evidencia relevante)
4. Este handoff y el trabajo pendiente descrito en §3.

No iniciar una auditoría histórica general. No repetir comprobaciones ya cerradas salvo que aparezca evidencia nueva, haya cambiado el HEAD o exista una contradicción verificable. No tratar documentos de propuesta como decisiones ratificadas ni como pruebas de ejecución.

**Objetivo inmediato:** descubrir si los dos workflows especializados M0 ya se ejecutaron sobre el HEAD actual; si no, preparar instrucciones concretas para que el owner los despache desde la interfaz de GitHub. Después, revisar sus runs por workflow → run → job → SHA exacto → pasos/logs. No declarar M0 completo solo porque pasen esos workflows.

## 1. Repositorio y HEAD verificado

- Repo: `snowdenxrp/aldea-ia`
- Rama de trabajo: `ncs-clean-architecture`
- Rama predeterminada: `main`
- HEAD consultado directamente en GitHub al preparar este handoff: `d566feeaa41537c4432be0694fcce632dca97e54`
- Mensaje de HEAD: `docs(ncs): fix baseline tree SHA in CI checkpoint`
- Árbol de HEAD: `42f664cd12369fed8e02307cea8639605edfefe4`
- Ref consultado: https://github.com/snowdenxrp/aldea-ia/tree/ncs-clean-architecture
- El HEAD puede avanzar después de este documento. Antes de cualquier conclusión nueva, volver a consultar la ref y registrar el SHA exacto.

## 2. Evidencia CI confirmada

### 2.1 CI general sobre HEAD

- Run: [40428998955](https://github.com/snowdenxrp/aldea-ia/actions/runs/40428998955)
- Workflow: `Nexo — deterministic persistence tests`
- Archivo: `.github/workflows/nexo-deterministic-tests.yml`
- Evento: `workflow_dispatch`
- SHA probado: `d566feeaa41537c4432be0694fcce632dca97e54` (coincide con el HEAD consultado)
- Job: `tests`, job ID `121941814825`
- Conclusión: `success`
- Log revisado: ejecutó `npm test` y el paso separado `node tests/nexo/temporary-cleanup-bounds.test.mjs`.
- En `npm test` se incluyen, entre otras, `chronicle-store.test.mjs`, `restart-reconstruction.test.mjs`, `protected-transition.test.mjs`, `repair-settlement-crash-cuts.test.mjs`, `entrypoint.test.mjs` y `continuity-contract.test.mjs`.

**Límite:** éxito del workflow general no significa que todos los tests especializados estén cubiertos. No se debe inferir que `repair-session`, `continuity-store`, `continuity-migration`, `repair-owner-lifecycle`, `repair-mission-verification`, `final-semantic-validator`, `outcome-classifier` y `assistants-runtime-cli` hayan sido todos ejecutados sobre este HEAD por el solo hecho de que `npm test` pase.

### 2.2 Ejecución especializada histórica: aceptación integrada

- Run: [39979489327](https://github.com/snowdenxrp/aldea-ia/actions/runs/39979489327)
- SHA probado: `527fc04293d311e70fa6091c404c574562d56a58`
- Resultado: `success`
- Logs revisados confirman tests de `continuity-store`, `continuity-migration`, `repair-owner-lifecycle`, `repair-session`, `repair-mission-verification`, `final-semantic-validator` y `outcome-classifier`, además de los pasos propios del workflow.

Es evidencia válida para ese SHA, **no** para el HEAD actual. La comparación del HEAD actual con `527fc...` mostró 564 commits de diferencia, incluyendo cambios en código/pruebas; no es válido extrapolar el resultado histórico.

### 2.3 Ejecución especializada histórica: crash-cuts de reparación

- Run: [39882048272](https://github.com/snowdenxrp/aldea-ia/actions/runs/39882048272)
- SHA probado: `0d0675783763d573c4c24583ddd7b1ca68396342`
- Resultado: `success`
- Logs revisados confirman crash-cuts, migración, ciclo de vida de reparación, sesión, regresión `assistants-runtime-cli` y verificación de objetivos.

Es evidencia histórica para el SHA listado. No prueba el estado de HEAD actual.

### 2.4 Estado de ejecución especializada en HEAD actual

En la revisión actual **no se ha confirmado** una ejecución de cada workflow especializado en SHA `d566fee...`. Esto es `PENDING/UNKNOWN`, no una afirmación de que no existan ejecuciones. Buscar primero en Actions antes de pedir al owner que vuelva a ejecutarlos.

## 3. Siguiente acción exacta — no repetir trabajo

### Paso 1: comprobar si ya hay runs nuevos

Consultar Actions del repo y filtrar por los dos workflows. Para cada run encontrado registrar:
- nombre y archivo del workflow;
- ID y URL del run;
- evento (idealmente `workflow_dispatch` o trigger aplicable);
- `head_sha`;
- estado/conclusión del run y de cada job;
- pasos/logs relevantes;
- si el SHA es exactamente el HEAD actual o una revisión anterior.

No considerar el nombre del run o el resultado general como suficiente; la asociación al SHA exacto es obligatoria.

### Paso 2: si no hay runs sobre HEAD actual, solicitar ejecución manual al owner

Los dos workflows están en la rama de trabajo y aceptan `workflow_dispatch`. El conector disponible no expone una acción de despacho manual de workflow, así que no simularlo con commits artificiales ni cambiar los triggers.

- Aceptación integrada: https://github.com/snowdenxrp/aldea-ia/actions/workflows/nexo-m0-acceptance.yml
- Crash-cuts de reparación: https://github.com/snowdenxrp/aldea-ia/actions/workflows/nexo-m0-repair-crash-cuts.yml

En cada página: **Run workflow** → elegir rama `ncs-clean-architecture` → ejecutar. Después verificar el run y los logs según el protocolo de §3.1. Si el owner aún no puede hacerlo, mantener ambas verificaciones como `PENDING` y avanzar con análisis documental/estático de aceptación sin afirmar CI especializada actual.

### 3.1 Qué ejecuta cada workflow

**`nexo-m0-acceptance.yml`**:
- contrato y store de Continuity;
- reconstrucción de reinicio y transición protegida;
- Chronicle store/runtime y entrypoints públicos;
- crash cuts, migración, ciclo de vida del owner y repair session;
- verificación de misión y clasificación de outcomes.

URL fuente: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-acceptance.yml

**`nexo-m0-repair-crash-cuts.yml`**:
- `repair-settlement-crash-cuts.test.mjs`;
- `continuity-migration.test.mjs`;
- `repair-owner-lifecycle.test.mjs`;
- `repair-session.test.mjs`;
- chequeos de sintaxis de `scripts/nexo-runtime-session.mjs` y `scripts/assistants.mjs`;
- `assistants-runtime-cli.test.mjs`;
- `repair-mission-verification.test.mjs`.

URL fuente: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/.github/workflows/nexo-m0-repair-crash-cuts.yml

## 4. Brechas de aceptación que siguen abiertas

Estas son brechas conocidas; no repetir investigación desde cero. Consultar los documentos indicados y actualizar solo si hay evidencia nueva.

- **UO-06 — contrato de producto:** debe presentar claramente `RECONCILE_REQUIRED` / `UNRESOLVED` y detener la ruta afectada. Aceptación end-to-end aún no demostrada.
- **UO-07 — reintentos:** la ausencia global de reintentos automáticos no está demostrada.
- **UO-08 — efectos protegidos:** falta prueba integrada de que ningún efecto se prepare/ejecute después de `UNKNOWN`; en la transición inspeccionada no se invoca la frontera `effectBoundary`.
- **UO-09 — diagnóstico:** el adaptador conserva `errorCode` en `COMMIT.UNKNOWN`, pero `protected-transition.mjs` convierte el outcome en `RECONCILE_REQUIRED` con una razón genérica y no propaga el código estable. Es una brecha diagnóstica, no evidencia de estado durable.
- **UO-10 — durabilidad:** el modelo de durabilidad no está definido para separar fallo de proceso, caída del SO y pérdida de energía/storage. No afirmar F2/F3 sin contrato y pruebas adecuados.
- **Causalidad/reconciliación:** coincidencia de snapshot/revisión no demuestra por sí sola que el estado observado pertenezca a la transición candidata. Falta evidencia causal durable independiente y verificador independiente conectado.
- **Causa primaria del run histórico `40270739196`:** sigue `UNKNOWN`; no repetir arqueología salvo que aparezca evidencia primaria nueva.
- **Línea de meta M0:** existe propuesta documental, pero no está ratificada. Los dos workflows son parte de la evidencia, no la definición completa ni suficiente de cierre.

## 5. Interpretación técnica que no debe perderse

- `runNexoRuntimeRepairSession()` se observó devolviendo `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`, `dispatchAttempted:false`, `persisted:false`.
- Existe una ruta inferior `dispatchPreparedRepair()` y una llamada de simulación `persistState()`. Esto prueba capacidad de persistencia en ese camino de código, pero no demuestra por sí solo que sea globalmente alcanzable ni que constituya un efecto protegido real de Nexo.
- `scripts/assistants.mjs` puede persistir estado normal de simulación antes del gate opcional de reparación. Por tanto `persisted:false` en el resultado de repair **no** significa que todo el proceso no haya escrito nada.
- `src/nexo/core/reconciliation.mjs` permanece fail-closed. `authoritative: true` aportado por el caller no resuelve el caso ni concede capacidad de commit, execute o authorize.
- No hay evidencia de una ruta probada de startup → autoridad legítima → frontera de ejecución → efecto protegido. No permitir commissioning ni efectos protegidos sin autoridad legítima y frontera de ejecución demostradas.

## 6. Estado canónico y decisiones del owner

Mantener exactamente estas barreras hasta que evidencia/decisión válida las cambie:
- M0: **`INCOMPLETO`**
- Autoridad raíz: **`PENDING/UNKNOWN`**
- Autorización: **`NOT_EVALUATED`**, salvo evidencia real en contrario
- Efectos protegidos: **`STOP`**
- Reconciliación: no integrada; fail-closed
- Opción A para `COMMIT.UNKNOWN`: ratificada por el owner. Conservar UNKNOWN sin resolver hasta intervención explícita; no retry automático; nunca promover UNKNOWN a success.
- Propuesta de criterios de salida M0: no ratificada; no es evidencia de aceptación.

## 7. Documentos fuente prioritarios

- Estado canónico/entrada: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/STATUS.md
- Checkpoint anterior de CI (consultarlo como antecedente, no como HEAD actual): https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-10-26_CI_EVIDENCE_CHECKPOINT.md
- Propuesta de criterios de salida: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_EXIT_CRITERIA_PROPOSAL_2026-10-26.md
- Matriz de aceptación UNKNOWN: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_UNKNOWN_OUTCOME_ACCEPTANCE_TEST_MATRIX_2026-10-26.md
- Gate de contrato de producto UNKNOWN: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_UNKNOWN_OUTCOME_PRODUCT_CONTRACT_GATE_2026-10-26.md
- Diseño de frontera de reconciliación: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_RECONCILIATION_BOUNDARY_NEXT_DESIGN_2026-10-26.md
- Factibilidad opción C/escritores/durabilidad: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_OPTION_C_WRITER_EXCLUSION_FEASIBILITY_2026-10-26.md
- Contrato de persistencia y fallo CI histórico: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_PERSISTENCE_PATH_CONTRACT_AND_CI_FAILURE_2026-10-26.md
- Matriz global de aceptación/evidencia: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_CRITERIA_EVIDENCE_STATUS_2026-10-25.md

## 8. Reglas operativas para el siguiente chat

1. Evidencia siempre como: trigger → run → job → SHA/HEAD → pasos/logs → interpretación.
2. Falta de evidencia = `PENDING/UNKNOWN`; nunca inferir ausencia o éxito.
3. No repetir auditorías cerradas sin evidencia nueva.
4. No modificar runtime/tests/workflows ni cambiar semántica de autoridad/reconciliación sin autorización específica y acotada.
5. No añadir como atajo journals, retries, queues, tombstones, wrappers transaccionales ni nuevos puertos de autoridad/reconciliación no aprobados.
6. No fusionar a `main` ni fabricar commits para activar workflows.
7. Diferenciar siempre `implementado`, `verificado por CI en SHA exacto`, `propuesta documental` y `pendiente/UNKNOWN`.
8. No enviar automáticamente órdenes a Claude, Qwen o Perplexity. Se prepararon órdenes de revisión independientes, pero no hay evidencia de que hayan sido enviadas o respondidas.
9. La tarea no es seguir ampliando indefinidamente la investigación del STEP 7: avanzar hacia una línea de meta M0 finita, explícita y ratificada, manteniendo todos los gates de seguridad.

## 9. Registro de cambios de este handoff

Este documento es un checkpoint de continuidad documental. No cambia código, tests, workflows, dispositivo ni gates canónicos. La creación del handoff no constituye evidencia de CI ni aceptación de M0.
