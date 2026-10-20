# NCS M0 — retención de estados de efecto desconocidos

Fecha: 2026-10-20  
Rama: `ncs-clean-architecture`  
Tipo: corrección mínima de retención + regresiones + CI.

## Hallazgo reproducible

`src/assistants/memory.js` descartaba como historial terminal cualquier entrada cuyo `status !== "prepared"`. En cambio, el lector operativo de continuidad reconoce `prepared`, `settled_observed` y `reconciled_observed`; otros estados se tratan como desconocidos porque podrían representar un efecto cuyo resultado no se comprende. La retención podía borrar un estado desconocido al superar el límite de 200 y además perder el plan de misión que permitiría asociar y contener esa incertidumbre.

## Cambio

- Runtime commit `25ac7eab1a221dbceeb1226a9b793ea274b6422e`.
- `RECOGNIZED_TERMINAL_EFFECT_STATUSES` limita la poda a `settled_observed` y `reconciled_observed`.
- Estados `prepared` y desconocidos se conservan incluso por encima del límite suave cuando no hay suficientes registros terminales reconocidos que podar.
- La retención de planes conserva la misión referenciada por cualquier estado no terminal reconocido/desconocido con `missionId` válido, no solo por `prepared`.
- La prueba existente en `tests/nexo/runtime.test.mjs` usaba `status: "completed"` en un registro de journal, pero ese valor no es un estado terminal reconocido por el contrato operativo. CI lo detectó: run fallido [39452369889](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452369889), job `mission-admission-continuity`, assertion `201 !== 200`. Se corrigió el fixture a `settled_observed` en commit `419546c10552ae88fe98e3dbf89d7a865dd48e56`; no se cambió la regla para permitir descartar estados desconocidos.
- Regresión nueva en `tests/nexo/restart-reconstruction.test.mjs`, commit `4044a34cddbc3b78c0da4a9c039a93d63f51f118`: con 200 entradas terminales reconocidas y una desconocida, exige conservar la entrada desconocida y su plan asociado.

## Evidencia CI

En SHA exacto `419546c10552ae88fe98e3dbf89d7a865dd48e56`, SUCCESS:
- Persistencia determinista, job `tests`: [run 39452539513](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452539513).
- Admisión acotada y continuidad de reinicio: [run 39452539695](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452539695).
- Validación semántica: [run 39452539536](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452539536).
- Clasificación de outcomes: [run 39452539530](https://github.com/snowdenxrp/aldea-ia/actions/runs/39452539530).

La primera ejecución de la versión con el cambio de runtime falló por la expectativa antigua del fixture; se conserva como fallo observado y no se etiqueta PASS. La revisión posterior pasó después de alinear el fixture con los estados terminales reconocidos.

## Límites

Esto conserva incertidumbre; no autentica `evidence.source`, no prueba raíz legítima, no autoriza ejecución y no cambia el estado de autoridad. M0 permanece `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.
