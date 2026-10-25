# NCS M0 — mapa estático de reconciliación y recuperación tras crash
Fecha: 2026-10-24
Estado: CÓDIGO Y TESTS LEÍDOS; SIN EJECUCIÓN

## Snapshot fijado

- Commit fuente: `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`
- Tree: `1f63ffd83682f490482a09b974f6455605ed0767`

## 1. Corrección de precisión frente a resúmenes anteriores

La reconciliación sí existe como API en `src/nexo/core/continuity-owner.mjs`: `owner.reconcilePrepared()`. La limitación real es más precisa:
- exige contexto de operación canónico y un verifier registrado en la construcción del owner para acciones genéricas;
- rechaza acciones de reparación con `NEXO_REPAIR_SETTLEMENT_CONTRACT_REQUIRED`, porque estas usan un contrato específico separado;
- sin verifier bloquea con `NEXO_EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE`;
- una observación UNKNOWN o evidencia inválida deja PREPARED abierto;
- el replay de una observación ya persistida recupera el registro canónico sin volver a llamar al verifier y sin inferir causalidad.

La documentación/comentario de `createNexoContinuityOwner` en el mismo archivo dice que el owner no liquida directamente un efecto PREPARED mediante un verifier de reparación independiente. Esto no equivale a decir que no exista ninguna reconciliación en el sistema.

## 2. Reparación: PREPARED → dispatch → observación persistida

Archivos del snapshot:
- `src/nexo/core/continuity-owner.mjs`, blob `6d1fa37745ca57e5ab5093b9cdcabf1ff5495261`.
- `scripts/nexo-repair-dispatch.mjs`, blob `ed45438be7604d3b341cecd5fbcfc69adda2447e`.
- `scripts/nexo-repair-settlement.mjs`, blob `2f6e91d494b4edb012c2b2db5a077b875c5b0348`.
- `tests/nexo/repair-owner-lifecycle.test.mjs`, blob `ace822ad75290bebbddd75f9030e55a19616cbfe`.
- `tests/nexo/repair-settlement-crash-cuts.test.mjs`, blob `dc65d462cdbd3a3dc1bf370c60af0b92eb7dbb55`.

### Dispatch

`dispatchPreparedRepair()` exige exactamente una entrada de journal en estado `prepared`, identidad de operación válida y revisión de entorno igual a la revisión guardada. Lee el estado con `loadStateStrict` y persiste mediante `persistState` con revisión esperada. Su comentario y retorno dejan explícito que persistir el entorno no liquida automáticamente PREPARED.

### Settlement específico

`settlePreparedRepairFromPersistedState()`:
- exige una sola entrada PREPARED y una revisión de entorno vinculada;
- solo acepta revisión del entorno igual a la capturada o inmediatamente siguiente;
- observa el invariante de reparación sobre el estado persistido;
- bloquea si el invariante no está probado;
- registra `settled_observed`, con atribución causal `not_claimed`;
- ante replay recupera el settlement canónico validado sin redispatch.

El propio módulo documenta que no ofrece atomicidad entre el archivo de entorno de Lúmina y el archivo de continuidad Nexo. La recuperación resuelve observación/replay; no transforma dos archivos en una transacción atómica.

## 3. Crash cuts caracterizados en pruebas existentes

Las aserciones estáticas de `repair-settlement-crash-cuts.test.mjs` cubren, entre otros:
- ausencia de PREPARED no prueba finalización;
- etiqueta caller-supplied `verified` no permite completar una reparación;
- si el entorno ya se persistió y Nexo conserva PREPARED, el settlement solo registra observación y no causalidad;
- si la respuesta del commit de observación se pierde, el resultado se trata como UNKNOWN y la reapertura recupera la observación ya persistida sin volver a llamar al verifier;
- registro de observación malformado no se acepta como canónico;
- verifier ausente o resultado UNKNOWN conserva la obligación PREPARED;
- replay no redispatch y la identidad distinta entra en conflicto.

`repair-owner-lifecycle.test.mjs` contiene además una secuencia de PREPARED durable → dispatch → settlement observado, comprueba reconstrucción después de reinicio y exige que el replay no vuelva a escribir el entorno.

Estas son pruebas presentes en el árbol fuente; no fueron ejecutadas en esta revisión.

## 4. Límite que permanece

La reconciliación existente es específica y fail-closed, no una prueba de autoridad legítima ni de una ruta de arranque autorizada:
- reparación: contrato de settlement externo y específico, revisión ligada y observación del estado persistido;
- acción genérica: verifier explícito y evidencia validada; sin él, bloqueada;
- UNKNOWN: conserva la obligación abierta;
- observación/settlement no prueba causalidad;
- ninguna de estas propiedades, por sí sola, prueba que el flujo de startup hasta efectos protegidos esté conectado o autorizado.

La incertidumbre principal ya no es “¿existe reconciliación?”; es “¿están conectados los contratos específicos a una frontera de arranque/autoridad legítima que se haya demostrado?”. La respuesta sigue siendo no demostrada.

## 5. Próximo paso

Seguir estáticamente los entrypoints y wrappers para clasificar qué contratos de PREPARED/dispatch/settlement se pueden invocar desde cada ruta, sin ejecutar scripts ni pruebas. Separar claramente:
1. existencia de una API;
2. disponibilidad desde un entrypoint;
3. evidencia de autoridad;
4. ejecución efectiva de un efecto.

## 6. Gates

Inspección estática únicamente. Tests/CI no ejecutados; runtime/tests/workflows/estado Lúmina sin cambios.
M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; implementación D1 no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
