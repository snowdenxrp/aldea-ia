# NCS — siguiente chat: M0 con línea de meta finita
Fecha: 2026-10-20
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-clean-architecture`
HEAD observado al preparar este handoff: `b3d39bfd1803429594e1defc69d3acb961ce5cb9` (commit de STATUS que registra los criterios finitos; volver a verificar HEAD al comenzar).

## Actualización verificada: matriz inicial de aceptación (2026-10-20)

- Matriz nueva: [NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md](NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md) en el directorio `BUILD`.
- STATUS actualizado: [NEXO_NCS/STATUS.md](../STATUS.md).
- El HEAD observado durante el cruce fue `2690d89e197ccadd3e280ff7542f790955d6ce42`; run determinista [39490757350](https://github.com/snowdenxrp/aldea-ia/actions/runs/39490757350), job `tests` SUCCESS en ese SHA. Nuevos commits documentales posteriores deben verificarse por separado.
- La matriz deja los criterios finales en PENDING hasta congelar la lista mínima y sus assertions, pero demuestra que suites Nexo de continuidad, protected transition, root bootstrap y reconstrucción están en `npm test`.
- Bloqueo sustantivo identificado en M0-E: `protected-transition.mjs` consume el resultado del puerto inyectado `authorityGate.check` y llama `conditionalCommit.commit(candidate)` sin llamar `effectBoundary.prepare`; los fixtures AUTHORIZED no acreditan raíz. Esto es brecha de integración estática, no prueba de bypass de producción.
- Dependencia de decisión: [guía de revisión constitucional del propietario](NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md). La guía declara que “continúa” no es aprobación y enumera decisiones OPEN. No asumirlas ni inventar un bootstrap.
- Próximo paso: confirmar HEAD y CI actuales; luego continuar desde la brecha M0-E y la revisión explícita del objeto constitucional exacto. No repetir B/C/D sin evidencia nueva; no provisionar llave ni hacer commissioning.

---

## Misión invariable

La misión es **M0**. No reiniciar Step 7, no volver a M1 y no repetir auditorías cerradas sin evidencia nueva.

Estado registrado: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## Cambio de dirección obligatorio: M0 debe poder cerrarse

La regla «no declarar resuelto lo no demostrado» es una regla de honestidad de evidencia, no una línea de meta. M0 necesita un conjunto finito de pruebas de aceptación, mapeadas a contratos existentes, con criterio de PASS/FAIL/PENDING/UNKNOWN. No mantener M0 abierto indefinidamente por investigación general.

Documento normativo de trabajo: `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_EXIT_CRITERIA_2026-10-20.md`.

Los cinco criterios propuestos aún deben mapearse y congelarse; no declarar que ya están aprobados ni superados:
A. Suite de aceptación reproducible con SHA/run/job y conclusiones exactos.
B. Continuidad, admisión y persistencia.
C. Reconstrucción de resultados terminales contradictorios o con identidad/contexto discordantes.
D. Diario de efectos, UNKNOWN y recuperación/reconciliación.
E. Autoridad legítima conectada a la ruta integrada real de efectos protegidos.

Cerrar M0 no significa que Nexo entero esté terminado.

## Secuencia inicial obligatoria

1. Leer primero `NEXO_NCS/STATUS.md`, este handoff y `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_EXIT_CRITERIA_2026-10-20.md`.
2. Verificar HEAD real de `ncs-clean-architecture`; el SHA aquí es solo el observado al guardar el handoff.
3. Leer la sección más nueva de STATUS antes de notas históricas. La entrada superior puede superseder notas inferiores únicamente para el tema y alcance que menciona.
4. Crear una matriz finita: criterio → contrato existente → tests existentes → CI (run/job/SHA/conclusión) → estado → brecha exacta.
5. Reutilizar pruebas/evidencia válidas. No repetir auditorías cerradas, no inferir CI entre SHA y no llamar PASS a CANCELLED, checks vacíos, workflows ausentes o evidencia de otro SHA.
6. Continuar solo por la brecha bloqueante de mayor prioridad. Si se necesita un cambio: contraejemplo mínimo reproducible → test adversarial → fix mínimo justificado → CI en el SHA exacto → actualizar informe/STATUS/handoff.
7. Hallazgos que no impidan criterios de salida se documentan para una etapa posterior; no amplían automáticamente M0.
8. Declarar M0 cerrado solo cuando todos los criterios finales congelados pasen con evidencia trazable en el estado de rama evaluado. Si no, identificar únicamente los criterios pendientes/fallidos y el próximo paso concreto.

## Límites constitucionales

No inferir raíz legítima desde CI, `authorization: "AUTHORIZED"` suministrado por caller, teléfono, evidencia autodeclarada o `PolicyContext`. No generar digest/firma de Constitución, commissioning ni provisionar raíz hasta que el objeto constitucional exacto haya sido revisado y aprobado explícitamente por el propietario. No habilitar efectos protegidos antes de demostrar la autoridad y su conexión a la ruta real.

## CI conocido heredado; no extrapolar

STATUS y los informes enlazados contienen resultados con alcance limitado por SHA/workflow. Consultar evidencia directamente antes de reutilizarla. El determinista SUCCESS en `ef5b6524c62343dd56507c907e70c9a0c21b6288` no valida commits documentales posteriores; el determinista CANCELLED en `876e1924292bd8c301b7e050531be9ded79ce290` no es PASS de suite completa; las regresiones de journal desconocido tuvieron workflows focales SUCCESS en `dd30b70e1204750fc09fac683f30b6e7e129bfe6`. Revisar STATUS vigente para el inventario completo.

## Regla de continuidad en una línea

`STATUS.md → criterio de salida → handoff vigente → HEAD actual → CI del SHA → matriz de aceptación → brecha bloqueante`.

Objetivo: cerrar M0 con evidencia finita y verificable, no investigar para siempre.
