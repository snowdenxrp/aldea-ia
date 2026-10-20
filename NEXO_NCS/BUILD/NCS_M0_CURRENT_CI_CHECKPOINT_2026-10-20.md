# NCS M0 — checkpoint de continuidad y CI vigente
Fecha: 2026-10-20
Rama: `ncs-clean-architecture`

## Evidencia CI confirmada

- HEAD de rama observado: `353ea0541005d83b537431729291df8f8818acdc`.
- [Run 39452751079](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452751079), workflow `Nexo — deterministic persistence tests`, evento `push`, SHA exacto `353ea0541005d83b537431729291df8f8818acdc`; job `tests` = `completed / success`.
- [Run 39449239372](https://github.com/snowdenxrp/aldea-ia/actions/runs/39449239372), workflow STEP 5, SHA exacto `876e1924292bd8c301b7e050531be9ded79ce290`; job `outcome-classification` = `success`. Corrió outcome-classifier, restart-reconstruction y protected-transition tests.
- La comparación de GitHub confirma que `353ea054...` desciende de `876e192...` (`ahead_by: 25`, `behind_by: 0`). La suite determinista en el SHA posterior contiene los cambios de reconstrucción y retención incorporados en esa historia.
- Esto supersede `CI_NOT_VERIFIED` para las regresiones incluidas en la suite determinista en el SHA declarado: `NEXO_OUTCOME_EVIDENCE_CONFLICT`, `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`, aislamiento de journal terminal de misiones podadas y preservación de estados de journal desconocidos durante retención.

## Límites que no cambian

CI exitoso demuestra ejecución de esa suite en ese SHA; no demuestra autenticidad de `evidence.source`, autoridad legítima, Constitución congelada ni autorización de efectos protegidos.

- M0: `INCOMPLETO`
- `authorization`: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`
- Rama observada: no protegida (`protected: false`); no confundir CI exitoso con required checks de merge.

## Continuidad

Leer `NEXO_NCS/STATUS.md` y el handoff `NEXO_NCS/BUILD/NCS_M0_HANDOFF_NEXT_CHAT_2026-10-20_MISSION_CONTINUITY.md`, teniendo en cuenta este checkpoint más reciente para el estado CI. Continuar M0 con revisión estática focal de reconstrucción/retención, sin reabrir auditorías cerradas y sin cambios runtime especulativos. Cada nuevo defecto requiere contraejemplo, regresión mínima y CI asociado al SHA exacto.
