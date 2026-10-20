# NCS M0 — continuidad de regresiones del store (2026-10-19)

Estado: revisión estática. No se modificó runtime/tests ni se ejecutó CI en este checkpoint. M0 permanece INCOMPLETO; autorización NOT_EVALUATED; efectos protegidos STOP; raíz PENDING/UNKNOWN.

## Evidencia revisada
- `src/nexo/core/continuity-store.mjs` blob `c5d8151a97a9d97315671d109f0e6e73a7e0d38e`
- `tests/nexo/continuity-store.test.mjs` blob `b61df0f7490e7d70ab821300febd680d0e7ed806`
- `tests/nexo/chronicle-runtime.test.mjs` blob `873d38bf7fd19b8c90ec5e48c9fbfec87ffe0777`
- `tests/nexo/continuity-contract.test.mjs` blob `5b8f7e9a5fe7084a850fb0bb0d26263e573ca33b`

## Cobertura ya localizada
El test del store cubre estado ausente, padre no disponible, conflicto concurrente, respuesta perdida de initialize, fallo confirmado de initialize, revisión agotada, lock stale, contención cross-process, fallo transitorio/persistente de liberación, JSON corrupto y rechazo de campos desconocidos.

Los tests de runtime cubren PREPARED UNKNOWN sin invocar adapter y bloquean redispatch en varias rutas post-dispatch. Además, `repair-settlement-crash-cuts.test.mjs` blob `60e2486698cee7a029902aa9ee09df90707fe0eb` cubre respuesta perdida a nivel caller: el commit real se completa, el wrapper devuelve UNKNOWN/lanza y el replay recupera el registro sin volver a invocar el verifier. Eso no equivale a inyectar una excepción en el rename interno de `writeEnvelope()`; no duplicar las pruebas de caller.

## Gaps a localizar en la suite completa
| Caso | Expectativa | Estado |
|---|---|---|
| commit condicional falla antes del reemplazo y lectura confirma revisión anterior | failed confirmado; estado anterior intacto | No localizado en test de store |
| rename de commit condicional aplica candidato y después lanza dentro de `writeEnvelope()` | Store devuelve committed solo si lectura canónica exacta confirma revisión y snapshot | No localizado en test de store; el caso interno de rename sigue pendiente |
| commit falla y no se puede leer el estado canónico | UNKNOWN; no asumir rollback ni commit | No localizado en test de store |
| error no normalizado al adquirir lock | fijar y probar diferencia entre initialize y commitIfCurrent | Diferencia estática observada |
| lectura del envelope falla dentro de commit | no sobrescribir; conservar incertidumbre | Parcialmente cubierto fuera de commit |
| liberación devuelve not_owned | fallo exterior, preservando estado de persistencia | Caso específico no localizado |

“No localizado” se refiere al archivo de test del store; no implica ausencia en todos los tests.

## Decisión
No normalizar todavía la API mixta. Primero localizar estos escenarios en runtime/contract/migration tests; añadir solo los realmente ausentes. No tocar runtime hasta que las expectativas estén cerradas.

## Invariantes
- Un commit recuperado tras error exige lectura canónica válida que coincida exactamente con revisión y snapshot candidatos.
- Si no puede conocerse el estado canónico, resultado UNKNOWN.
- Un fallo de liberación no borra la persistencia confirmada ni autoriza handoff exitoso.
- Ningún resultado del store demuestra autoridad constitucional.
- PREPARED incierto bloquea dispatch; incertidumbre post-dispatch bloquea redispatch.
- No añadir BUSY, timeout, cancelación, lease, heartbeat ni recuperación automática por conveniencia.

## Próxima acción
Cruzar los gaps con todos los tests relevantes y workflows; ejecutar solo después de identificar la cobertura faltante y registrar SHA, run/job y logs. Este documento es una revisión, no evidencia de ejecución.
