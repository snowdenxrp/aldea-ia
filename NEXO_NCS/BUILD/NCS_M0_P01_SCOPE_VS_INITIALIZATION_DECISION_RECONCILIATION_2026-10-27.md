# NCS M0 — reconciliación de decisiones: alcance vs. inicialización (2026-10-27)

## Propósito

Aclarar dos decisiones documentadas con letras iguales en contextos distintos. Esta nota es documental; no ratifica contratos, no autoriza implementación ni cambia gates canónicos.

## Decisiones existentes

1. **Opción A de alcance (2026-10-27):** el propietario eligió estudiar/delimitar únicamente almacenamiento local M0 estrictamente no autoritativo y acotado. Fuente: `NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md`, §149–170.
2. **Opción B de inicialización explícita (2026-10-26):** el commit condicional normal no inicializa un archivo ausente; solo una operación explícita puede intentar crear el estado inicial, tras evaluar precondiciones aún pendientes. Fuente: `NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md`, §7–20.

## Reconciliación

No son alternativas mutuamente excluyentes; responden preguntas distintas:

| Eje | Decisión | Lo que no demuestra |
|---|---|---|
| Alcance/capacidad | Opción A: almacenamiento M0 no autoritativo y acotado | No demuestra que el objeto actual sea no autoritativo ni que sus consumidores estén aislados. |
| Procedimiento | Opción B: inicialización explícita, separada del commit condicional | No define por sí sola autoridad legítima, exclusión efectiva, quiescencia, esquema válido, durabilidad ni reconciliación de UNKNOWN. |
| Estado operativo | D3/STOP mientras falten contrato y evidencia | No autoriza crear almacenamiento ahora. |

La lectura conjunta coherente es: **el alcance deseado es A y, si en el futuro se autoriza un protocolo, la inicialización no debe ser implícita en el commit normal**. Esto no ratifica un contrato final, no demuestra que exista un bootstrap aislado en runtime y no legitima la primera creación.

## Dependencias que siguen abiertas

- Identificar el objeto exacto y demostrar sus propiedades no autoritativas.
- Definir la base canónica que legitima la primera creación; no inferirla de ausencia, lock, snapshot o caller.
- Demostrar aislamiento operacional respecto de admisión, PREPARED, dispatch, reconciliación y mutaciones de dominio.
- Resolver exclusión frente a todos los escritores relevantes y quiescencia cuando aplique.
- Preservar archivos existentes inválidos; tratar errores/resultados ambiguos como UNKNOWN/STOP, sin reintento automático.
- Vincular futuras pruebas al SHA exacto solo tras contrato congelado y autorización separada.

## Estado canónico

P-01 `OPEN / UNKNOWN`; M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autoridad raíz `PENDING/UNKNOWN`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`.

No se modificaron runtime, tests, workflows ni configuración. No se ejecutaron pruebas, CI o Actions.
