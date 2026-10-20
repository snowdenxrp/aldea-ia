# NCS — handoff de continuidad M0: reconstrucción de misiones y journal
Fecha: 2026-10-20
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`
HEAD verificado al guardar: `ef5b6524c62343dd56507c907e70c9a0c21b6288`

## Misión y estado invariable

La meta sigue siendo **M0**: construir Nexo con contratos coherentes y evidencia reproducible, sin confundir CI con autoridad legítima.

- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Constitución: borrador no congelado; no commissioned.
- No reiniciar Step 7 ni reabrir auditorías cerradas sin evidencia nueva.

## Estado de rama y CI observado

- HEAD de `ncs-clean-architecture`: `ef5b6524c62343dd56507c907e70c9a0c21b6288`, mensaje `docs(ncs): refresh M0 status with verified unknown effect fix`.
- Workflow determinista `Nexo — deterministic persistence tests`, run [39464330230](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464330230), SUCCESS en el SHA exacto del HEAD anterior.
- Para el cambio de reconstrucción por identidad terminal discordante, SHA `876e1924292bd8c301b7e050531be9ded79ce290): acceptance M0 [39449239320](https://github.com/snowdenxrp/aldea-ia/actions/runs/39449239320), bounded admission/continuity [39449239491](https://github.com/snowdenxrp/aldea-ia/actions/runs/39449239491), STEP 4 [39449239333](https://github.com/snowdenxrp/aldea-ia/actions/runs/39449239333) y STEP 5 [39449239372](https://github.com/snowdenxrp/aldea-ia/actions/runs/39449239372) SUCCESS. El workflow determinista en ese SHA fue CANCELLED (run 39449239410); no presentarlo como suite completa PASS.
- En SHA `dd30b70e1204750fc09fac683f30b6e7e129bfe6`, corrección fail-closed de journal desconocido: determinista [39464052770](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052770), admisión [39464053282](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053282), aceptación integrada [39464053079](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053079), STEP 4 [39464052881](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052881), STEP 5 [39464052959](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052959) SUCCESS.
- CI SUCCESS se atribuye exclusivamente a SHA y workflow enlazados. Ejecuciones fallidas/canceladas anteriores siguen como historial red/green, no se ocultan ni se convierten en PASS.
- La rama se había observado como no protegida y sin required checks; no se modificó configuración administrativa.

## Trabajo reciente: intentos terminales persistidos

Archivos clave:
- Runtime: `src/nexo/core/continuity-operations.mjs`
- Regresiones: `tests/nexo/continuity-contract.test.mjs`
- Contrato/validación de snapshot: `src/nexo/core/continuity-contract.mjs`
- Estado central: `NEXO_NCS/STATUS.md`

1. **Evidencias terminales verificadas contradictorias**
   - Runtime commit `ef26ae0512cbe215704b0034de62973961002072`.
   - Antes, `.find()` elegía el primer intento `completed` con evidencia verificada, dejando el resultado dependiente del orden.
   - Ahora se comparan todos los resultados terminales verificados aplicables; evidencia distinta bloquea con `NEXO_OUTCOME_EVIDENCE_CONFLICT`, paso/misión bloqueados e incertidumbre `outcome_evidence_conflict`; no redispatch.
   - Test commit `724ad3e800b09d01abef6aacaa9ddd8e1017fd3c`.

2. **Identidad de operación terminal discordante**
   - Runtime commit `61520dbdf5c0a0693a500838b7c93b167e9222a8`.
   - Un `completed` con acción/objetivo distintos ya no queda oculto por otra finalización válida. Bloquea con `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`, incertidumbre `outcome_operation_context_mismatch`, sin redispatch.
   - Test commit `876e1924292bd8c301b7e050531be9ded79ce290`.
   - CI focal indicado arriba; determinista completo en ese SHA fue CANCELLED, así que usar los resultados con alcance preciso.

3. **Journal de efectos con estado desconocido**
   - Informe: `NEXO_NCS/BUILD/NCS_M0_UNKNOWN_EFFECT_RECONSTRUCTION_FAIL_CLOSED_2026-10-20.md`.
   - Handoff previo: `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_UNKNOWN_EFFECT_RECONSTRUCTION.md`.
   - Un estado no terminal/desconocido asociado a misión bloquea con `NEXO_EFFECT_JOURNAL_STATUS_UNKNOWN`; estado desconocido sin misión propietaria retenida falla cerrado con `NEXO_EFFECT_JOURNAL_IDENTITY_UNKNOWN`. `prepared` conserva reconciliación obligatoria; solo `settled_observed` y `reconciled_observed` se tratan como terminales reconocidos en esa política.
   - La suite y los cuatro workflows focales/integrados SUCCESS en SHA exacto `dd30b70e1204750fc09fac683f30b6e7e129bfe6`; se listan arriba.

## Otros contratos M0 ya cubiertos; no repetir auditorías

- `ConditionalCommit`: contrato de resultados UNKNOWN integrado a `npm test`; suite y workflows SUCCESS en SHA `72cc1b1d55f72d29ee8b9f17b0ada76ac41c6d24` (runs 39443509056, 39443509170, 39443509438, 39443509057).
- `continuity-store`: adquisición de lock normalizada en fase `lock_acquisition`, `writeStarted:false`; regresiones de stale-lock/EACCES y lock release corregidas hasta `e7f04397658e405acb478f1fe5ac9b49a55b886d`; no inferir CI del HEAD actual desde runs antiguos.
- `PolicyContext`: proyección limitada a `policyRef`, `scope`, `resolved`, `validity`, `resolutionProvenance`; campos caller-supplied como `rootProof`/autoridad no se aceptan como raíz. CI SUCCESS en SHA `29e97fab41261fdd6505f5e02d8ce4791852e981`.
- Snapshot de memoria desacoplado en SHA `04fcc08081f81b3c385d4d8e9217a7744545d164`, run 39441463747 SUCCESS.
- CI no equivale a protección de branch: no required checks configurados/observados en la revisión previa.

## Instrucciones obligatorias para el siguiente chat

1. Abrir primero `NEXO_NCS/STATUS.md`, este handoff y los informes enlazados arriba. Usar la rama `ncs-clean-architecture` y verificar su HEAD antes de cambiar nada.
2. Continuar **M0** desde la reconstrucción/continuidad, no desde Step 7 ni desde M1. No repetir las auditorías cerradas listadas.
3. Hacer revisión estática dirigida a una frontera concreta y buscar contraejemplo reproducible. No introducir cambios de runtime especulativos ni endurecer datos históricos sin contrato.
4. Si aparece un defecto: test adversarial mínimo → fix mínimo → comprobar CI en el SHA exacto → actualizar informe, STATUS y handoff. Revisar run, job, SHA y conclusión, no solo nombre del workflow.
5. El run determinista SUCCESS en HEAD `ef5b6524...` prueba ese workflow en ese SHA; no prueba que workflows no disparados o cambios posteriores estén validados. Confirmar HEAD antes de reutilizar esta afirmación.
6. No llamar PASS a un resultado con workflow CANCELLED, checks vacíos o evidencia incompleta.
7. No permitir redispatch tras resultado incierto; no convertir `UNKNOWN` en éxito; no descartar estados desconocidos de journal.
8. No inferir autoridad legítima de `authorization: "AUTHORIZED"` inyectado, de CI, del teléfono, de evidencia autodeclarada o de `PolicyContext`.
9. No generar digest/firma de Constitución, commissioning transcript ni provisionar llave raíz hasta que el objeto constitucional exacto esté revisado y aprobado por el propietario.
10. No instalar herramientas ni requerir PC sin necesidad concreta.

## Límites y decisiones abiertas

- No hay evidencia de una raíz legítima conectada al camino real Nexo startup → efectos protegidos.
- No se demostró que toda ruta legacy esté deshabilitada; tampoco afirmar que existe bypass sin prueba.
- El límite de CI/branch protection es distinto del contrato runtime.
- No ampliar el alcance de las regresiones terminales más allá de los estados e identidades cubiertos.

## Estado final que debe preservarse

M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`. Continuar con evidencia, no con suposiciones.
