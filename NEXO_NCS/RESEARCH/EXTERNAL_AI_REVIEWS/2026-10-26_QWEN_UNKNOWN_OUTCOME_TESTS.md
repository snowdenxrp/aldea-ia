# Auditoría Independiente de Pruebas UO-01 a UO-10 — Contrato de Producto Ratificado

> **Procedencia y estado de verificación:** informe de Qwen proporcionado por el usuario el 2026-10-26. Las afirmaciones de HEAD y CI que aparecen a continuación son las declaradas por Qwen; no se han vuelto a verificar de forma independiente al guardar este documento. Este archivo conserva la auditoría como evidencia externa, no como aceptación técnica de todas sus afirmaciones.

**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `ncs-clean-architecture`  
**HEAD declarado por Qwen:** `ad0fae27ae39cd78ffa42607b9c301d238e59246` (2026-10-26T18:08:39Z)  
**CI declarado por Qwen:** Workflow "Nexo — deterministic persistence tests", run `40375110402`, job `tests`, conclusión `success` sobre el HEAD anterior.  
**Contrato ratificado:** Alternativa A — `COMMIT.UNKNOWN` permanece no resuelto, detiene la ruta afectada, no reintenta automáticamente, no ejecuta efectos protegidos derivados del intento incierto.

---

## Tabla de Auditoría

| UO | Test localizado | Evidencia exacta | Cobertura real | Brecha | Estado |
|---|---|---|---|---|---|
| **UO-01** | `tests/nexo/conditional-commit-persist-state.test.mjs` | Inyecta `persistState` que lanza `Error` con `code: "EIO"`. Verifica: `failed.status === COMMIT.UNKNOWN` y `failed.errorCode === "EIO"`. | Prueba de integración del **adaptador**. Verifica que el adaptador devuelve `COMMIT.UNKNOWN` y conserva el código estable. | El `errorCode` se **pierde** en `executeProtectedTransition()`: el core devuelve `reasons: ["conditional commit outcome is UNKNOWN"]` sin propagar `EIO` al outcome final. No hay test que verifique la propagación end-to-end. | **CONFIRMADO** (adaptador) / **BRECHA** (core) |
| **UO-02** | `tests/nexo/conditional-commit-persist-state.test.mjs` | Inyecta `persistState` que lanza `{}` (sin código). Verifica: `unclassified.status === COMMIT.UNKNOWN` y `unclassified.errorCode === "PERSISTENCE_UNKNOWN"`. | Prueba de integración del **adaptador**. Verifica fallback seguro ante excepciones sin código. | Misma brecha que UO-01. El `errorCode: "PERSISTENCE_UNKNOWN"` no llega al outcome final. | **CONFIRMADO** (adaptador) / **BRECHA** (core) |
| **UO-03** | No encontrado explícitamente | El código fuente de `src/nexo/core/protected-transition.mjs` (rama `if (commit.status === COMMIT.UNKNOWN)`) maneja el caso devolviendo `OUTCOMES.RECONCILE_REQUIRED`. | **INFERENCIA** estática: el código existe y clasifica correctamente, pero no hay test que inyecte `COMMIT.UNKNOWN` desde el puerto y verifique el comportamiento del core. | Ausencia global de reintentos automáticos **no demostrada**. El `errorCode` del adaptador se pierde en la razón genérica. No hay verificación de que la ruta quede detenida más allá de la clasificación. | **INFERENCIA** (código existe) / **PROPUESTA** (test necesario) |
| **UO-04** | `tests/nexo/protected-transition.test.mjs` | Inyecta `conditionalCommit.commit` que lanza `Error` con `code: "IO_UNCERTAIN"`. Verifica: `outcome.kind === OUTCOMES.RECONCILE_REQUIRED`. | Prueba de integración del **core**. Verifica clasificación fail-closed ante excepción. | No verifica ausencia de efectos protegidos o reintentos fuera del flujo inspeccionado. La razón del outcome captura `error?.code ?? "conditional commit raised an exception"`, pero no hay test que verifique la preservación completa del diagnóstico. | **CONFIRMADO** (clasificación) / **BRECHA** (efectos/reintentos) |
| **UO-05** | `tests/nexo/reconciliation.test.mjs` | Verifica que `r.reconcile()` con evidencia vacía `[]` devuelva `UNRESOLVED`. Verifica que evidencia con `authoritative: true` del caller también devuelva `UNRESOLVED`. | Prueba **unitaria** del reconciliador. Verifica fail-closed ante evidencia no confiable. | El puerto de reconciliación **no está conectado** al flujo de transición. No hay test end-to-end que verifique que un outcome `RECONCILE_REQUIRED` no active reconciliación automática. | **CONFIRMADO** (reconciliador fail-closed) / **BRECHA** (integración) |
| **UO-06** | **No encontrado** | Sin evidencia | **Sin cobertura** | No hay test que verifique cómo el consumidor de producto presenta `RECONCILE_REQUIRED`/`UNRESOLVED` de forma explícita, detiene la ruta afectada y no afirma éxito ni fracaso definitivo. Contrato de producto end-to-end **pendiente**. | **UNKNOWN** |
| **UO-07** | **No encontrado** | Sin evidencia | **Sin cobertura** | No hay test que verifique la **ausencia global** de reintentos automáticos del mismo intento incierto. El inventario de escritores/reintentadores no es exhaustivo. No hay quiescencia verificable. | **UNKNOWN** |
| **UO-08** | **No encontrado** | Sin evidencia | **Sin cobertura** | No hay test de integración que demuestre que **no se preparan ni ejecutan efectos protegidos** a partir del outcome incierto. El boundary de efectos no está integrado en el flujo inspeccionado. | **UNKNOWN** |
| **UO-09** | Parcial en `conditional-commit-persist-state.test.mjs` | El adaptador conserva `errorCode` en `COMMIT.UNKNOWN` (UO-01, UO-02), pero `protected-transition.mjs` línea ~210 lo pierde: `reasons: ["conditional commit outcome is UNKNOWN"]`. | El adaptador conserva el diagnóstico, pero el **core lo pierde** en la razón genérica del outcome final. No hay test que verifique la propagación completa. | Contrato de propagación de diagnóstico **no definido**. El campo `errorCode` no sobrevive la transición al outcome final. | **INFERENCIA** (adaptador conserva) / **BRECHA** (core pierde) |
| **UO-10** | **No encontrado** | Sin evidencia | **Sin cobertura** | No hay test que demuestre durabilidad F2 (caída del SO) o F3 (pérdida de energía). La primitiva actual con `rename()` no demuestra por sí sola garantías F2/F3. | **UNKNOWN** |

---

## Lista Priorizada de Pruebas Faltantes

**Prioridad ALTA — Bloqueantes para aceptar el contrato sin falsos positivos:**

1. **UO-03 / UO-09 — Test de integración del puerto de commit con `COMMIT.UNKNOWN`**
   - **PROPUESTA:** Inyectar un puerto de commit que devuelva `createCommitResult(COMMIT.UNKNOWN, { errorCode: "EIO" })` y verificar que `executeProtectedTransition()` devuelva `OUTCOMES.RECONCILE_REQUIRED` con el `errorCode` preservado en el outcome final (no en la razón genérica).
   - **Archivo:** `tests/nexo/protected-transition.test.mjs`
   - **Verifica:** Clasificación correcta, ausencia de reintentos, y preservación del diagnóstico.

2. **UO-07 — Test de ausencia global de reintentos automáticos**
   - **PROPUESTA:** Ejecutar `executeProtectedTransition()` con un puerto que devuelva `COMMIT.UNKNOWN`, luego verificar mediante contadores que ni el puerto de commit ni efectos protegidos fueron invocados una segunda vez.
   - **Archivo:** Nuevo `tests/nexo/unknown-outcome-no-retry.test.mjs`
   - **Verifica:** Quiescencia global tras outcome incierto.

3. **UO-08 — Test de bloqueo de efectos protegidos tras UNKNOWN**
   - **PROPUESTA:** Mockear un puerto de efectos protegidos que registre llamadas, ejecutar `executeProtectedTransition()` con `COMMIT.UNKNOWN`, y verificar que el puerto de efectos **no fue invocado**.
   - **Archivo:** Nuevo `tests/nexo/unknown-outcome-protected-effects-blocked.test.mjs`
   - **Verifica:** Frontera real de ejecución y ausencia de efectos derivados del intento incierto.

**Prioridad MEDIA — Requeridas para contrato end-to-end:**

4. **UO-06 — Test de contrato de producto end-to-end**
   - **PROPUESTA:** Simular una llamada completa desde el consumidor de producto, inyectar `COMMIT.UNKNOWN`, y verificar que la salida al consumidor presente explícitamente el estado incierto sin afirmar éxito ni fracaso definitivo.
   - **Archivo:** Nuevo `tests/nexo/product-contract-unknown-outcome.test.mjs`
   - **Verifica:** Presentación correcta del estado incierto y detención de la ruta afectada.

5. **UO-09 — Definición y test de propagación de diagnóstico**
   - **PROPUESTA:** Modificar `executeProtectedTransition()` para propagar `commit.errorCode` al outcome final (no solo a la razón), y agregar test que verifique la preservación.
   - **Archivo:** `src/nexo/core/protected-transition.mjs` + `tests/nexo/protected-transition.test.mjs`
   - **Verifica:** Contrato de propagación de diagnóstico sin afirmar causalidad durable.

**Prioridad BAJA — Pendientes de decisión de producto:**

6. **UO-10 — Test de durabilidad F2/F3**
   - **PROPUESTA:** Solo después de ratificar el contrato de durabilidad (F1/F2/F3), diseñar pruebas de inyección de fallos de sistema operativo y pérdida de energía.
   - **Archivo:** Nuevo `tests/nexo/durability-f2-f3.test.mjs`
   - **Verifica:** Garantías de durabilidad ante caída del SO o pérdida de energía.

---

## Afirmaciones No Respaldadas por Pruebas

1. **"La ruta afectada queda realmente detenida"**: Solo hay evidencia de clasificación (`RECONCILE_REQUIRED`), no de detención verificable de la ruta más allá del retorno inmediato.
2. **"No se ejecutan efectos protegidos derivados del intento incierto"**: No hay test que verifique el boundary de efectos tras `COMMIT.UNKNOWN`.
3. **"El `errorCode` se conserva en el outcome final"**: El código fuente muestra que se **pierde** en la razón genérica del core.
4. **"La reconciliación automática futura sigue pendiente"**: El puerto existe pero no está conectado; no hay test que verifique que no se active automáticamente.

---

## Conclusión

**Cobertura actual:** Los tests existentes cubren correctamente los casos UO-01, UO-02, UO-04 y UO-05 a nivel de adaptador y core aislado, pero **no demuestran el comportamiento end-to-end** requerido por el contrato ratificado (Alternativa A).

**Brechas críticas:**
- El `errorCode` se pierde en la transición del core (UO-01, UO-02, UO-09).
- No hay tests que verifiquen la ausencia de reintentos automáticos (UO-07).
- No hay tests que verifiquen el bloqueo de efectos protegidos (UO-08).
- No hay contrato de producto end-to-end verificado (UO-06).
- No hay evidencia de durabilidad F2/F3 (UO-10).

**Acción requerida:** Implementar las pruebas prioritarias 1-3 antes de declarar la Alternativa A satisfecha. Las pruebas 4-6 requieren decisiones de producto explícitas antes de su implementación.
