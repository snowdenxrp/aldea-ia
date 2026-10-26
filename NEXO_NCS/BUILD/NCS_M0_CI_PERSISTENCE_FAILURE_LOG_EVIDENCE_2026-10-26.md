# NCS M0 — Evidencia recuperada del fallo CI de persistencia (2026-10-26)

## Identificación del run

- Workflow run: `40270739196`
- Job: `tests`, job ID `121402789784`
- Resultado: `failure`
- Node reportado: `v22.23.3`
- Rama/HEAD registrados en el handoff previo: `ncs-clean-architecture`, `325d004c8f89e1ec25d9253bc7918a52d2351349`
- Test que falla: `tests/nexo/conditional-commit-persist-state.test.mjs:88:10`
- Aserción: actual `RECONCILE_REQUIRED`, esperado `SAFE_COMMIT`.

## Secuencia relevante del log

Antes de la aserción fallida, el mismo job imprime PASS/OK para varias pruebas Nexo y Lúmina, entre ellas:
- Chronicle store contract tests;
- root bootstrap protocol vectors (software vector only);
- Chronicle owner-backed runtime tests;
- persistencia/reconstrucción de misiones y estado de simulación;
- probes fail-closed de STEP 7;
- pruebas de separación de Continuity y Lúmina;
- pruebas de commit condicional y conflicto de writer en el store de continuidad.

El primer error fatal visible en el tramo final es la aserción en la línea 88. El log recuperado no muestra una excepción primaria de filesystem antes de esa aserción ni imprime el `errorCode` del resultado `COMMIT.UNKNOWN`.

## Interpretación limitada

1. Queda confirmado el síntoma observable: la transición de integración devolvió `RECONCILE_REQUIRED` donde la prueba esperaba `SAFE_COMMIT`.
2. El log no determina por sí mismo si el commit adapter devolvió `COMMIT.UNKNOWN`, si el puerto lanzó una excepción o si hubo otra forma inválida del resultado; la transición colapsa parte de estos caminos en el mismo outcome.
3. El defecto estático de contrato de ruta documentado por separado (caller principal con URL `file:`, `persistState()` usando `.pathname`, adapter que exige string) es una hipótesis fuerte que merece prueba dirigida, pero este log no demuestra causalidad.
4. No se debe describir el error como un fallo confirmado de `rename()`, `EXDEV` ni como prueba de que el destino quedó parcial o intacto.

## Próxima prueba diagnóstica propuesta (no ejecutada)

En una rama de reparación autorizada, ejecutar primero el test aislado y capturar el resultado tipado que devuelve el adapter sin registrar rutas ni contenido del snapshot. Añadir pruebas pequeñas de `persistState()` para:
- cadena nativa absoluta;
- URL `file:` con caracteres codificados;
- fallo inyectado de escritura y de rename;
- comprobación independiente del destino y revisión tras cada caso.

Antes de modificar código, ratificar el contrato de ruta. No ajustar el test para aceptar `RECONCILE_REQUIRED` como solución: eso ocultaría el fallo de integración en lugar de demostrar persistencia correcta.

## Estado

- Evidencia del run y aserción: recuperada.
- Causa raíz: `UNKNOWN`.
- Reproducción local / test aislado: no ejecutados.
- Runtime, tests y workflows: sin cambios en esta revisión.
- Implementación: no autorizada por este documento.
