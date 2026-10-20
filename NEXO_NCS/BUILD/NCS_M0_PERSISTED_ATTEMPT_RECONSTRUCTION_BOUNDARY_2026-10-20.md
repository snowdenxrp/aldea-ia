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


## Segunda regresión dirigida — identidad de operación contradictoria (2026-10-20)

La revisión del nuevo bloque de reconstrucción encontró otro caso en el mismo límite: una finalización válida y coincidente podía ocultar otro registro `completed` para el mismo `missionId + stepId` pero con acción/objetivo diferentes, porque el primer `verifiedCompletion` provocaba `continue` antes de inspeccionar ese reclamo discordante.

- Runtime: [`61520dbdf5c0a0693a500838b7c93b167e9222a8`](https://github.com/snowdenxrp/aldea-ia/commit/61520dbdf5c0a0693a500838b7c93b167e9222a8) ahora bloquea ante cualquier intento `completed` del paso que no coincida exactamente con acción/objetivo, con `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`; misión `blocked`, incertidumbre `outcome_operation_context_mismatch`, sin redispatch.
- Regresión: [`876e1924292bd8c301b7e050531be9ded79ce290`](https://github.com/snowdenxrp/aldea-ia/commit/876e1924292bd8c301b7e050531be9ded79ce290) agrega un snapshot adversarial con una finalización válida y otra con acción/objetivo discordantes.
- Estado de validación: la consulta de workflow runs/checks accesible por esta integración no expuso runs/checks de push para los SHA recientes. Por tanto ambos casos están codificados como regresiones pero **CI sigue NO VERIFICADO**. No declarar PASS ni inferir que las pruebas ejecutaron.
- Alcance sigue limitado a reconstrucción de outcomes persistidos; no autentica `evidence.source`, no establece raíz/autoridad y no habilita efectos protegidos.


## Nota de verificabilidad CI (2026-10-20)

El workflow `.github/workflows/nexo-deterministic-tests.yml` sí declara `workflow_dispatch`, pero las acciones GitHub disponibles en esta sesión no incluyen una operación para despachar un workflow. La acción de consulta de runs disponible está documentada como filtrada a ejecuciones asociadas a pull requests; para los SHA de regresión, el endpoint de estados devolvió `statuses: []`. Por tanto, estos resultados **no prueban que no se haya ejecutado ningún workflow**; solo significan que esta sesión no pudo obtener evidencia CI atribuible a los SHA exactos. La validación de las regresiones permanece `CI_NOT_VERIFIED`. Próxima acción de verificación: ejecutar manualmente el workflow determinista desde GitHub Actions con la rama `ncs-clean-architecture` actual y conservar el run ID, el SHA exacto ejecutado y el resultado del job `tests` antes de declarar PASS.


## Verificación CI posterior — persistencia determinista (2026-10-20)

- La consulta directa de GitHub Actions por rama encontró el workflow de push que no aparecía en la consulta de runs filtrada a pull requests.
- Run [39449973775](https://github.com/snowdenxrp/aldea-ia/actions/runs/39449973775), workflow `.github/workflows/nexo-deterministic-tests.yml`, terminó `completed / success` con SHA exacto `709afc161cdfc8a0aef9ab076f6e66b64db49d99`; el job `tests` concluyó `success`.
- El SHA contiene las regresiones de reconstrucción de outcomes persistidos `NEXO_OUTCOME_EVIDENCE_CONFLICT` y `NEXO_OUTCOME_OPERATION_CONTEXT_MISMATCH`, además de la validación fail-closed de forma de misión persistida y sus pruebas.
- Esta evidencia supersede el estado anterior `CI_NOT_VERIFIED` **para la suite determinista y ese SHA exacto**. No acredita otros workflows no incluidos, no demuestra autenticación de `evidence.source`, no establece raíz legítima y no autoriza efectos protegidos.
- M0 sigue `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## M0 — terminal journal histórico no debe bloquear misiones retenidas (2026-10-20)

- Contraejemplo reproducible: la retención de planes limita misiones históricas, mientras que el journal puede conservar registros terminales hasta su propio límite. La reconstrucción global trataba cualquier registro `settled_observed`/`reconciled_observed` cuyo plan ya no existía como `unownedEffectEntry` y bloqueaba incluso una misión retenida no relacionada.
- Runtime commit `5a1bbd77270941d24ce5801408d32cf4d05646a6`: un journal terminal con `missionId` válido pero plan histórico ya podado deja de bloquear misiones no relacionadas. La comprobación global sigue cerrando ante identidad `missionId` ausente/inválida y ante `prepared` sin plan; los registros del journal que sí corresponden a la misión actual siguen sujetos a validación de identidad.
- Regresión commit `4c1555ec56f5c7ec357ec0884eec03807539cb95`, `tests/nexo/continuity-contract.test.mjs`: añade terminal `settled_observed` de misión histórica podada y exige que no bloquee la misión retenida con finalización verificada.
- CI del SHA de regresión todavía pendiente de consultar; no declarar PASS hasta revisar el run/job `tests` en SHA exacto.
- Estado M0 permanece `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Verificación CI confirmada — aislamiento de journal terminal histórico (2026-10-20)

- Runtime fix: `5a1bbd77270941d24ce5801408d32cf4d05646a6`; regresión: `4c1555ec56f5c7ec357ec0884eec03807539cb95`.
- En el SHA exacto de regresión `4c1555ec56f5c7ec357ec0884eec03807539cb95`, terminaron SUCCESS: [persistencia determinista 39451734619](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734619), [aceptación integrada M0 39451734664](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734664), [admisión/continuidad 39451734557](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734557), [validación semántica 39451734719](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734719) y [clasificación de outcomes 39451734698](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451734698).
- Además, el HEAD documental `b429a0f606a2fe62c045eabf4757a490778bcad9` ejecutó [persistencia determinista 39451824503](https://github.com/snowdenxrp/aldea-ia/actions/runs/39451824503), job `tests` SUCCESS. Este SHA contiene runtime + regresión y los documentos de continuidad vigentes.
- Conclusión acotada: la regresión de journal terminal huérfano no bloqueante para una misión retenida pasó en la suite y workflows listados. No se ha validado toda autoridad M0 ni se habilitan efectos protegidos.
- Estado global sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.
