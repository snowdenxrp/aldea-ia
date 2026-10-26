# NCS M0 — Matriz de aceptación para outcomes UNKNOWN

Fecha: 2026-10-26  
Rama objetivo: `ncs-clean-architecture`  
Clase de cambio: documentación de diseño; no autoriza cambios de runtime.

## Propósito

Convertir el gate del contrato de producto para `UNKNOWN` en escenarios verificables y separar la cobertura existente de las pruebas aún necesarias. La matriz asume la alternativa A como recomendación de diseño, **no como decisión ratificada por el owner**.

Documento relacionado: [Gate del contrato de producto para outcomes UNKNOWN](NCS_M0_UNKNOWN_OUTCOME_PRODUCT_CONTRACT_GATE_2026-10-26.md).

## Invariantes de seguridad

1. `COMMIT.UNKNOWN` nunca se promociona a `SAFE_COMMIT` sin evidencia independiente suficiente.
2. Un outcome incierto no autoriza a repetir automáticamente la transición, el commit ni efectos protegidos.
3. `UNRESOLVED` es un estado terminal de seguridad para el intento actual, no una afirmación de que el cambio ocurrió o no ocurrió.
4. Datos del llamador, incluyendo `authoritative: true`, no son prueba de autoridad independiente.
5. No se conecta el puerto de reconciliación ni se introduce un verificador ficticio para hacer pasar los tests.
6. La observabilidad puede preservar un código estable de error, pero no debe convertirlo en una conclusión sobre el estado durable.

## Matriz de escenarios

| ID | Escenario | Cobertura identificada | Aceptación requerida | Estado |
|---|---|---|---|---|
| UO-01 | Persistencia rechaza con código estable, p. ej. `EIO` | El test del adaptador espera `COMMIT.UNKNOWN` y conserva `EIO`. | El intento no se declara committed; el diagnóstico puede conservar el código sin afirmar el resultado durable. | Parcial: cobertura de adaptador identificada; ejecución actual no comprobada. |
| UO-02 | Persistencia lanza un valor sin código | El test del adaptador espera `PERSISTENCE_UNKNOWN`. | Mantener `COMMIT.UNKNOWN`; no inferir éxito. | Parcial: cobertura identificada; ejecución actual no comprobada. |
| UO-03 | El puerto de commit devuelve `COMMIT.UNKNOWN` | El test de transición espera `RECONCILE_REQUIRED`. | Nunca devolver `SAFE_COMMIT`; no iniciar una segunda tentativa automáticamente. | Parcial: clasificación cubierta; ausencia global de reintentos no demostrada. |
| UO-04 | El puerto de commit lanza una excepción | El test de transición espera `RECONCILE_REQUIRED`. | Fallar cerrado y no ejecutar una segunda transición como recuperación implícita. | Parcial: clasificación cubierta; efectos fuera de este flujo no auditados. |
| UO-05 | Reconciliación recibe evidencia vacía o controlada por el caller | El test del reconciliador espera `UNRESOLVED`. | No aceptar afirmaciones de autoridad del llamador ni resolver outcome. | Parcial: contrato unitario identificado; ejecución actual no comprobada. |
| UO-06 | Consumidor de producto recibe `RECONCILE_REQUIRED`/`UNRESOLVED` | No hay evidencia suficiente identificada de contrato de producto end-to-end. | Presentar estado incierto explícitamente, detener el camino afectado y no afirmar éxito ni fracaso definitivo. | Pendiente. |
| UO-07 | Se intenta reintentar el mismo intento incierto | No hay cobertura global identificada. | No repetir automáticamente commit, ejecución o efectos protegidos; requerir intervención explícita conforme al contrato ratificado. | Pendiente. |
| UO-08 | Se comprueba que no hay efectos protegidos tras UNKNOWN | La transición clasifica el UNKNOWN, pero el boundary de efectos no está integrado en el flujo inspeccionado. | Un test de integración debe demostrar que no se preparan ni ejecutan efectos protegidos a partir del outcome incierto. | Pendiente; no asumir que existe el guard. |
| UO-09 | Se conserva correlación entre intento, error y outcome final | El adaptador tiene `errorCode`, pero la transición usa una razón genérica. | Definir campos de diagnóstico permitidos y probar su propagación sin afirmar causalidad durable. | Pendiente de contrato. |
| UO-10 | Caída de proceso / SO / pérdida de energía | No está demostrado con la cobertura identificada. | Declarar de forma explícita el nivel de durabilidad que M0 promete; no extrapolar pruebas de proceso a F2/F3. | Pendiente de decisión de producto y diseño. |

## Orden recomendado

1. Ratificar explícitamente el contrato de producto (alternativa A o B); esta matriz no lo ratifica.
2. Definir el comportamiento del consumidor de producto para `RECONCILE_REQUIRED` y `UNRESOLVED`.
3. Definir si el outcome final preserva un código de error estable y bajo qué esquema, sin afirmar resultado durable.
4. Autorizar por separado cualquier cambio runtime.
5. Implementar únicamente los cambios autorizados y agregar pruebas UO pendientes.
6. Ejecutar las suites pertinentes y registrar run ID, HEAD exacto, nombres de jobs y resultado. No inferir que una suite se ejecutó por el hecho de que existan tests.
7. Mantener la causa primaria del run histórico `40270739196` como `UNKNOWN` hasta obtener evidencia directa.

## Fuera de alcance

- Integrar el puerto de reconciliación.
- Añadir autoridad, recibos, journaling, reintentos, nuevas colas o wrappers transaccionales.
- Cambiar la semántica runtime de `COMMIT.UNKNOWN`, `RECONCILE_REQUIRED` o `UNRESOLVED`.
- Declarar M0 completo o autorizar efectos protegidos.
- Afirmar durabilidad ante caída del SO o pérdida de energía sin contrato y pruebas específicos.

## Estado de esta matriz

**Docs-only.** Se creó como mapa de aceptación; no se ejecutaron tests ni CI en este avance. No cambia la decisión del owner ni los gates canónicos: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`; reconciliación no integrada.
