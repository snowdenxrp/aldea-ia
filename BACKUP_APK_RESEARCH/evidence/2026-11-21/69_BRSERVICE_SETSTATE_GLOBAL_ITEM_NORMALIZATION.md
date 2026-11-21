# Evidencia 69 — Reconciliación de BRService.setState(IIII) con evidencia previa

- Fecha de corrección: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Estado: **CORRECCIÓN DE DUPLICACIÓN / NO ES HALLAZGO NUEVO**
- Procedencia: recuperación de memoria y cotejo del expediente GitHub.
- No LOCAL-VERIFIED; no ejecución dinámica.

## 1. Corrección de la incorporación anterior

La versión inicial de esta evidencia presentó `BRService.setState(IIII)V` como una ruta global que no figuraba previamente en el expediente. Esa afirmación era incorrecta.

El método y su comportamiento ya estaban documentados antes de crear esta evidencia:

- **Evidencia 47, §3.1:** conserva el mapeo de parámetros `p1→mState`, `p2→mWorkingStage`, `p3→mUserInterruptAction`, `p4→mLastError` si el valor previo es cero; las condiciones `mWorkingStage==7`, `mWorkingStage==10/12` o `mUserInterruptAction==2`; la liberación de WakeLock en etapa 7; y la normalización de elementos a `BRItem.state=3,error=9`.
- **Evidencia 26, §§1 y 3:** conserva la condición OR de normalización masiva, el cierre ordinario en stage 11 y la distinción entre estado global y campos de BRItem.
- **Evidencia 47, §3:** conserva la llamada final `setState(4,12,0,v14)` y la corrección de orden de argumentos, no la transcripción errónea histórica.

Por tanto, el contenido de la versión inicial de evidencia 69 no constituye un nuevo descubrimiento. Se conserva este archivo como erratum explícito para evitar que futuros chats traten la repetición como delta.

## 2. Qué permanece como pendiente real

La documentación previa ya contiene el resumen semántico. Lo que no está cerrado es la recuperación/cotejo del cuerpo Smali literal íntegro de `setState(IIII)`, el wrapper `setState(III)`, sus callers y el orden exacto de instrucciones/ramas, si esos datos fueran necesarios para una pregunta causal concreta.

No volver a pedir o registrar el mismo resumen como evidencia nueva. No repetir una extracción de método completa solo para reproducir la descripción ya preservada.

## 3. Procedencia y límites

La recuperación contextual de 2026-11-21 confirma los mismos datos ya asentados en evidencias 26 y 47. El texto inicial de evidencia 69 no incluía fuente Smali literal adicional. No se elevan sus afirmaciones a `USER-PASTED-SOURCE` ni `LOCAL-VERIFIED`.

**Conclusión corregida:** `setState(IIII)` ya estaba documentado. Evidencia 69 es una corrección de índice/procedencia, no un nuevo hallazgo técnico.
