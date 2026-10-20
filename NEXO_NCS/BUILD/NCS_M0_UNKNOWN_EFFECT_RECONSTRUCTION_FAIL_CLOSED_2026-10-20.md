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

## Verificación

- CI del SHA `7708a44a03cba3d7ccf4bf062c96de1c9338832c`:
  - Persistencia determinista [run 39463648068](https://github.com/snowdenxrp/aldea-ia/actions/runs/39463648068) SUCCESS.
  - La admisión/continuidad [run 39463648167](https://github.com/snowdenxrp/aldea-ia/actions/runs/39463648167), crash cuts [run 39463648078](https://github.com/snowdenxrp/aldea-ia/actions/runs/39463648078) y aceptación integrada [run 39463648222](https://github.com/snowdenxrp/aldea-ia/actions/runs/39463648222) fallaron por el desacuerdo del código de error, no por una aserción de la nueva semántica de bloqueo.
- El SHA `a132d878129d5db2916da453bd21531a567f9537` tiene nuevos workflows en cola/en ejecución al redactar este documento. **No declarar la corrección validada hasta revisar jobs finales SUCCESS en el SHA exacto**, incluyendo el job `tests` de persistencia determinista y las suites focales relevantes.

## Límites

Este cambio no autentica `evidence.source`, no establece autoridad raíz ni habilita efectos protegidos.

- M0: `INCOMPLETO`
- `authorization`: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`
