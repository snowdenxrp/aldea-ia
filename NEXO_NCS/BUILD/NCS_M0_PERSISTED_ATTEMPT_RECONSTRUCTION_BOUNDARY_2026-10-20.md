# NCS M0 — frontera de intentos persistidos y reconstrucción terminal

Fecha: 2026-10-20  
Rama: `ncs-clean-architecture`  
Tipo: revisión estática dirigida; sin cambio de runtime ni pruebas nuevas en este documento.

## Pregunta

¿La validación estructural del snapshot limita los registros persistidos de `attempts` con el mismo rigor que aplica a misiones y obligaciones PREPARED, antes de que reconstrucción use esos intentos para determinar el estado de un paso?

## Evidencia observada

- `src/nexo/core/continuity-contract.mjs` exige que `attempts` sea un array denso, pero no valida la forma ni la identidad de cada elemento. Sí valida las identidades de misión/paso y el enlace de los elementos `prepared` de `effectJournal`.
- `src/nexo/core/continuity-operations.mjs`, `recordNexoOutcomeInSnapshot()`, no añade un segundo intento para el mismo par `missionId + stepId`; si ya existe uno, retorna el snapshot sin añadir otro.
- La misma implementación de `reconstructNexoMissionFromSnapshot()` filtra `source.attempts` por `missionId`, y busca un intento `completed` que coincida con acción/objetivo y contrato de evidencia. Para `local_analysis`, el contrato local de finalización admite evidencia con `verified === true`, `kind` y `source` no vacíos; el propio código advierte que una etiqueta de fuente no autentica la procedencia.
- Por tanto, la ruta de escritura normal evita duplicar un resultado por misión/paso, pero la frontera del validador de datos persistidos no expresa el mismo invariante. Un snapshot importado/corrupto con intentos duplicados o contradictorios podría ser interpretado por orden de array. Esto es un **riesgo de ambigüedad de reconstrucción a verificar**, no un bypass de autoridad demostrado.

## Alcance y límites

- No se ha demostrado que exista un snapshot real corrupto con intentos contradictorios.
- No se declara que la evidencia `verified` autentique un resultado externo.
- No se cambia runtime: primero debe fijarse mediante regresión el contrato esperado para intentos legacy, referencias huérfanas, identidad acción/objetivo y duplicados. Un endurecimiento indiscriminado podría romper datos históricos sin contrato de migración.
- Este análisis no reabre AuthorityGate, raíz bootstrap, locks, Chronicle settlement ni la auditoría de consumidores de `mission-status`.

## Siguiente paso técnico concreto

Añadir pruebas adversariales de reconstrucción sobre snapshots sintéticos con (1) dos intentos para la misma misión/paso y resultados terminales contradictorios; (2) intento que refiere a una misión/paso inexistente; (3) intento cuya acción/objetivo no coincide con el paso persistido. Determinar primero si el contrato debe rechazar la snapshot con `NEXO_MEMORY_SCHEMA_UNKNOWN` o bloquear la misión en estado UNKNOWN/STOP. No elegir silenciosamente el primer resultado ni convertir la presencia de campos en prueba autenticada.

## Estado M0

M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. No se ejecutaron pruebas ni se declara CI nuevo por este informe.


## Seguimiento con regresión dirigida — 2026-10-20

La revisión estática anterior se afinó con un caso concreto: dos registros `completed` para la misma misión/paso, ambos con identidad coincidente y `evidence.verified === true`, pero con evidencia distinta. Antes, la reconstrucción usaba `find()` y elegía el primero, dependiendo del orden persistido.

- Runtime: commit [ef26ae0512cbe215704b0034de62973961002072](https://github.com/snowdenxrp/aldea-ia/commit/ef26ae0512cbe215704b0034de62973961002072). La reconstrucción ahora detecta evidencia terminal verificada contradictoria y bloquea la misión con `NEXO_OUTCOME_EVIDENCE_CONFLICT`, sin redispatch; no trata la etiqueta de evidencia como autenticación.
- Regresión: commit [724ad3e800b09d01abef6aacaa9ddd8e1017fd3c](https://github.com/snowdenxrp/aldea-ia/commit/724ad3e800b09d01abef6aacaa9ddd8e1017fd3c), en `tests/nexo/continuity-contract.test.mjs`. Asegura que el caso contradictorio queda bloqueado y no se resuelve por orden del array.
- Verificación: consulta de checks para el SHA de test devolvió cero estados. Por ahora la regresión está **añadida pero CI NO VERIFICADO**; no declarar PASS hasta obtener run/checks del SHA que contiene runtime y test.
- El comportamiento de intentos `failed` tardíos después de una finalización verificada sigue cubierto por el contrato existente y no debe bloquearse por sí solo. El nuevo bloqueo es solo para múltiples evidencias terminales verificadas que discrepan.
