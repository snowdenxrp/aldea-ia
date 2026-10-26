# NCS M0 — Matriz de factibilidad de escenarios de reconciliación (2026-10-26)

## Estado y límites

Diseño estático basado en `src/nexo/core/reconciliation.mjs`, `src/nexo/core/protected-transition.mjs`, `src/nexo/core/ownership.mjs`, `src/nexo/core/contracts.mjs` y `tests/nexo/reconciliation.test.mjs`.

- No cambia runtime, tests ni workflows.
- No ejecuta tests ni CI.
- No habilita la reconciliación ni efectos protegidos.
- La causa primaria del run CI histórico `40270739196` permanece `UNKNOWN`.
- No añade identificadores, journals, colas, retries, tombstones ni fencing.

## Hechos de implementación confirmados por lectura

1. El adaptador de commit tipa el resultado incierto como `COMMIT.UNKNOWN` y puede incluir `errorCode`.
2. La transición convierte ese resultado en `RECONCILE_REQUIRED`, pero su razón genérica no conserva actualmente ese `errorCode`.
3. El puerto `reconciliation.reconcile()` está definido en los core ports, pero la transición no lo invoca en el camino inspeccionado.
4. `createReconciler()` valida formas y rechaza evidencia controlada por el llamador como autoridad; los casos válidos terminan `UNRESOLVED`.
5. No se observa un verificador independiente ni una fuente durable autenticada conectada al reconciliador.
6. El outcome `SAFE_COMMIT` de la transición se prepara antes del commit y se devuelve si el puerto informa `COMMITTED`. Eso no demuestra por sí solo que un resultado `UNKNOWN` pueda resolverse después.
7. La matriz distingue hechos de implementación de propuestas: nada de lo siguiente es un cambio runtime ni una ratificación de contrato.

## Matriz de escenarios

| Escenario | Hecho que se puede observar | Qué no demuestra | Clasificación conservadora |
|---|---|---|---|
| Snapshot legible con revisión esperada y contenido candidato | El archivo puede leerse; estructura y revisión pueden validarse | Que esta transición, y no otro writer, produjo el snapshot | `UNRESOLVED` hasta probar causalidad |
| Snapshot con revisión anterior a la esperada | La transición candidata no aparece reflejada en esa revisión observada | Que no haya ocurrido una mutación aún no visible, salvo garantías de lectura/durabilidad del contrato | `UNRESOLVED` si no existe garantía contractual suficiente; no reintentar |
| Snapshot con revisión inesperadamente superior | Existe estado posterior o divergente | Qué writer lo produjo ni si la candidata se incorporó | `UNRESOLVED`; investigar conflicto mediante evidencia independiente |
| Lectura posterior falla | No se obtuvo snapshot verificable | Estado durable final | `UNRESOLVED`; nunca inferir éxito |
| Snapshot corrupto o de forma inválida | La observación no satisface el contrato de integridad | Commit o no-commit | `UNRESOLVED` y conservar STOP |
| Revisión coincide pero hubo o pudo haber dos writers | Coincidencia numérica | Correspondencia causal con la candidata | `UNRESOLVED`; la revisión sola no basta |
| El puerto informa conflicto condicional conocido | El adaptador clasifica el conflicto según su contrato | Que el candidato se haya comprometido | Mantener la clasificación contractual de conflicto; no reconciliar como éxito |
| Error conocido antes de cualquier mutación | Puede ser demostrable solo si la frontera garantiza que el fallo ocurrió antes de escribir | Que la operación no mutó, si el error no está vinculado a una garantía pre-mutación | No declarar no-commit sin evidencia contractual |
| Error después de reemplazo/escritura, antes de confirmación | La llamada terminó con error o resultado incierto | Si el nuevo estado es durable y atribuible a la candidata | `RECONCILE_REQUIRED` / `UNRESOLVED` |
| Cleanup o liberación de lock falla después del reemplazo | Hubo fallo secundario posterior | Que el reemplazo no ocurrió ni que el commit sea seguro | Clasificar según el punto exacto de fallo; no colapsar el error secundario con el outcome durable |

## Separación obligatoria de cuatro hechos

1. **Resultado de llamada:** retorno, excepción y código estable del adaptador.
2. **Estado durable observado:** snapshot obtenido por una lectura posterior independiente, con estructura e integridad validadas.
3. **Correspondencia causal:** evidencia de que el snapshot observado corresponde a la transición candidata concreta.
4. **Outcome terminal:** clasificación permitida por el contrato a partir de los tres hechos anteriores.

No sustituir un hecho por otro. Lectura exitosa no es causalidad; revisión esperada no es autenticación; error no demuestra rollback; limpieza completada no demuestra commit.

## Requisitos mínimos para considerar una resolución

- La lectura posterior debe estar separada del resultado en memoria de la llamada de escritura.
- La fuente debe ofrecer garantías de integridad y durabilidad explícitas.
- La evidencia de correspondencia causal debe ser verificable independientemente del llamador.
- La forma de evidencia debe pasar las mismas restricciones de datos simples, sin getters ni propiedades ocultas.
- El reconciliador debe carecer de capacidad de commit, autorización, ejecución de efectos, retry y mutación de estado canónico.
- Si el contrato actual no puede demostrar causalidad, detener el diseño y registrar la decisión arquitectónica pendiente; no inventar un mecanismo de correlación para cerrar el hueco silenciosamente.

## Pruebas de aceptación para una futura implementación autorizada

1. Un `COMMIT.UNKNOWN` nunca se convierte directamente en `SAFE_COMMIT`.
2. El código de error estable se conserva en diagnóstico tipado sin exponer mensajes arbitrarios ni rutas/datos sensibles.
3. Lectura fallida, corrupción y revisión incompatible permanecen no resueltas.
4. Un snapshot coincidente sin evidencia causal independiente permanece no resuelto, incluido el caso de dos writers.
5. Los conflictos condicionales conocidos no se reinterpretan como éxito.
6. Evidencia del llamador con `authoritative: true` no puede resolver por sí sola.
7. El reconciliador no llama commit, efectos externos ni reintentos.
8. Las pruebas diferencian máquina de estados, adaptador filesystem y lectura/reconciliación posterior.
9. CI registra workflow, run, job, HEAD y resultado exacto; no se infiere que toda la CI esté verde a partir de una suite.

## Decisiones pendientes

- ¿Qué fuente y garantía de lectura durable puede usar el reconciliador sin confiar en el llamador?
- ¿Qué prueba existente en el contrato vincula un snapshot con una transición concreta?
- Si no existe tal prueba, ¿es posible ampliar el contrato de forma mínima y explícita sin añadir mecanismo de correlación nuevo?
- ¿Cuál será la forma pública y segura del diagnóstico estructurado?
- ¿Qué evidencia exacta permitiría clasificar cada caso como resuelto? Hasta ratificarla, el resultado sigue `UNRESOLVED`.

## Estado canónico

- M0: `INCOMPLETO`.
- D0 / D1-DESIGN / D2 / D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA` para esta integración.
- Autoridad raíz: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Reconciliación de commit incierto: `DISEÑO PENDIENTE`; no integrada.
- No se ejecutaron tests ni CI en esta actividad documental.
