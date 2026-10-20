# NCS M0 — reconstrucción fail-closed de estados desconocidos del effect journal

Fecha: 2026-10-20  
Rama: `ncs-clean-architecture`  
Tipo: contraejemplo de reconstrucción + corrección mínima + regresiones.

## Hallazgo

La política de retención recién verificada conserva los estados desconocidos del `effectJournal` y el plan asociado, porque un estado no reconocido puede representar un efecto cuyo resultado no se entiende. Sin embargo, `reconstructNexoMissionFromSnapshot()` solo trataba `prepared`, `settled_observed` y `reconciled_observed` como estados de journal relevantes para el bloqueo. Un registro con `status: "future_state_v9"` y una identidad válida podía no bloquear una misión cuyo paso seguía `planned`. Eso contradice la intención de preservar la incertidumbre y podía dejar el paso reconstruido como ejecutable.

## Cambio

- Runtime commits: `70e97976636063b06d02c83778d0f2542bd5d9c3`, `7708a44a03cba3d7ccf4bf062c96de1c9338832c`, `24cd4d61f1a1de6cfcc95a21081f59fd332cabf6`.
- La reconstrucción distingue estados terminales reconocidos (`settled_observed`, `reconciled_observed)) de estados potencialmente no resueltos. Un estado desconocido enlazado a la misión bloquea la misión y el paso con `NEXO_EFFECT_JOURNAL_STATUS_UNKNOWN`; un estado no terminal/unknown sin misión propietaria retenida bloquea globalmente la reconstrucción con `NEXO_EFFECT_JOURNAL_IDENTITY_UNKNOWN`.
- Los estados `prepared` siguen el contrato existente de reconciliación y no se convierten en un resultado terminal.
- Regresión: test commit `958a44aa4c49a92452680ccfc8726f528958cd3c`; la prueba incluye un estado desconocido enlazado y otro cuyo plan propietario falta.
- Se preservó el código público existente `NEXO_EFFECT_JOURNAL_STATUS_UNKNOWN` tras una ejecución inicial detectar que una variante nueva `NEXO_EFFECT_JOURNAL_STATE_UNKNOWN` contradecía el test de migración existente. Esa ejecución fallida se registra como red/green, no como PASS.
- Test-code alignment: `a132d878129d5db2916da453bd21531a567f9537`.

## Verificación CI final — 2026-10-20

En SHA exacto `dd30b70e1204750fc09fac683f30b6e7e129bfe6`, tras corregir el código de error y alinear las regresiones con el contrato legacy, los cinco workflows siguientes terminaron `completed / success`:

- Persistencia determinista, job `tests`: [run 39464052770](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052770).
- Admisión acotada y continuidad de reinicio, job `mission-admission-continuity`: [run 39464053282](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053282).
- Aceptación integrada M0, job `Nexo M0 contracts on one SHA`: [run 39464053079](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464053079).
- STEP 4 semantic validation: [run 39464052881](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052881).
- STEP 5 outcome classification: [run 39464052959](https://github.com/snowdenxrp/aldea-ia/actions/runs/39464052959).

Los fallos anteriores se conservan como evidencia red/green y no se presentan como éxitos. La corrección actual queda verificada en el SHA exacto indicado, dentro del alcance de esos cinco workflows.

## Límites

Este cambio no autentica `evidence.source`, no establece autoridad raíz ni habilita efectos protegidos.

- M0: `INCOMPLETO`
- `authorization`: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`
