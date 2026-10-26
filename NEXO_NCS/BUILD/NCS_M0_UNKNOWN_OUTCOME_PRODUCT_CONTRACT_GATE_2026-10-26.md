# NCS M0 — Gate del contrato de producto para outcomes UNKNOWN (2026-10-26)

## Estado
- Tipo: recomendación de diseño y gate de decisión; no ratificado.
- Runtime/tests/workflows: sin cambios.
- Tests/CI: no ejecutados.
- No autoriza integración de reconciliación ni efectos protegidos.

## Pregunta que debe resolverse primero
¿Debe NCS M0 resolver automáticamente un resultado de persistencia `COMMIT.UNKNOWN`, o basta con preservar la incertidumbre de forma segura hasta una intervención explícita?

Esta pregunta de producto precede a escoger una técnica de almacenamiento. No debe asumirse que un journal, correlación durable o mayor complejidad de persistencia es obligatorio si el alcance M0 no requiere recuperación automática.

## Contrato mínimo de seguridad recomendado para M0
1. Un resultado `COMMIT.UNKNOWN` permanece `RECONCILE_REQUIRED`; no se convierte en éxito por una lectura, revisión o coincidencia de contenido.
2. No repetir automáticamente la operación ni ejecutar efectos protegidos mientras el resultado previo permanezca incierto.
3. Preservar un resultado explícitamente no resuelto (`UNRESOLVED`) y permitir que la capa de producto lo presente como pendiente de intervención, sin afirmar `COMMITTED` ni `NOT_COMMITTED`.
4. No usar un dato de evidencia aportado por el mismo llamador como autoridad independiente.
5. No introducir nuevos mecanismos de persistencia hasta que una necesidad de producto y un contrato de evidencia justifiquen su coste.

Este contrato es una recomendación, no una modificación del runtime ni una ratificación constitucional.

## Qué significa “intervención explícita”
No implica conceder autoridad para ejecutar o reintentar automáticamente. Significa que el sistema debe detener la ruta afectada y hacer visible que el resultado no pudo determinarse. Cualquier acción posterior requiere una política y autorización explícitas; no se define aquí una acción de reparación concreta.

## Separar modelos de fallo
El contrato de durabilidad no puede cerrarse sin decidir qué fallos debe cubrir:
- **F1 — error de llamada / excepción de proceso:** la llamada falla o el proceso termina, mientras el sistema operativo continúa activo.
- **F2 — caída del sistema operativo:** el estado puede perderse o quedar incompleto durante el apagado/reinicio.
- **F3 — pérdida de energía / fallo de almacenamiento:** se requiere definir qué significa que los datos estén confirmados físicamente y qué barreras de sincronización ofrece la plataforma.

La primitiva actual con bloqueo, archivo temporal y `rename()` no demuestra por sí sola F2/F3. No declarar cubierto un modelo que no se haya probado y especificado.

## Consecuencias de la recomendación
- La reconciliación automática es opcional para M0, salvo que el owner la establezca como requisito de producto.
- `COMMIT.UNKNOWN → RECONCILE_REQUIRED` sigue siendo la clasificación conservadora.
- `createReconciler()` permanece fail-closed; el puerto no se conecta al flujo de transición.
- No se implementan journal, IDs de operación, fencing, retries, colas ni tombstones por inferencia.
- La observabilidad debe preservar el código estable de error de forma segura, pero cambiar el diagnóstico de runtime es trabajo separado y requiere autorización específica.

## Gate de decisión pendiente del owner
A. **M0 acepta UNKNOWN no resuelto hasta intervención explícita.** Se cierra la necesidad de resolución automática para M0; el trabajo se limita a mantener y probar el comportamiento fail-closed ya existente, si se autoriza.
B. **M0 exige resolución automática.** Antes de implementar, definir modelo de fallo F1/F2/F3, fuente de evidencia independiente, contrato causal, comportamiento de recuperación y pruebas de aceptación. No seleccionar automáticamente la opción D ni ninguna técnica concreta.

## Evidencia que sigue sin cambiar
- La opción C no está demostrada como exclusión de writers de extremo a extremo ni como contrato completo de durabilidad.
- La igualdad de snapshot/revisión no prueba causalidad por sí sola.
- El código inspeccionado clasifica `COMMIT.UNKNOWN` como `RECONCILE_REQUIRED`; el puerto de reconciliación no está integrado y el reconciliador permanece `UNRESOLVED`.
- La causa primaria exacta del fallo histórico CI `40270739196` sigue `UNKNOWN`.

## Gates canónicos
- M0: `INCOMPLETO`.
- Autoridad raíz: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Reconciliación: `DISEÑO PENDIENTE`, no integrada.


## Cobertura existente y brechas verificadas (lectura estática)

Los archivos siguientes se leyeron en la rama indicada; esto es un mapeo estático, no una afirmación de que se hayan ejecutado ahora:

- `tests/nexo/conditional-commit-persist-state.test.mjs`: contiene una prueba en la que un fallo de persistencia con código `EIO` debe devolver `COMMIT.UNKNOWN` y conservar `errorCode: "EIO"`; también cubre el fallback `PERSISTENCE_UNKNOWN`. El test de integración normal confirma la ruta de commit conocido. No prueba recuperación automática tras un fallo ambiguo de escritura real.
- `tests/nexo/protected-transition.test.mjs`: contiene casos donde una excepción del puerto de commit y un resultado `COMMIT.UNKNOWN` producen `OUTCOMES.RECONCILE_REQUIRED`; también rechaza formas malformadas. No se encontró en los casos revisados una afirmación de que el core invoque reconciliación, y el código actual no lo hace.
- `tests/nexo/reconciliation.test.mjs`: comprueba que evidencia vacía, malformada o controlada por el llamador —incluido `authoritative: true`— permanece `UNRESOLVED`; comprueba que el reconciliador no expone `commit`, `execute` ni `authorize`.
- `src/nexo/core/protected-transition.mjs`: para el resultado `COMMIT.UNKNOWN`, devuelve `RECONCILE_REQUIRED` con la razón genérica `conditional commit outcome is UNKNOWN`; el `errorCode` estable que conserva el adaptador no se propaga por esa rama.
- `src/nexo/core/reconciliation.mjs`: permanece fail-closed y no tiene un verificador de confianza conectado.

### Qué sí está respaldado
1. El adaptador no convierte por sí mismo una excepción de persistencia en `COMMITTED`.
2. La transición no convierte `COMMIT.UNKNOWN` en `SAFE_COMMIT`.
3. La evidencia de reconciliación controlada por el llamador no resuelve el caso.
4. El reconciliador carece de capacidades de commit/autorización/execution.

### Qué no está demostrado todavía
1. Que los tests citados se hayan ejecutado en este avance; no se ejecutaron tests ni CI durante esta actualización documental.
2. Que una capa de producto presente `UNRESOLVED` de forma explícita y detenga la ruta afectada; eso es contrato recomendado, no funcionalidad verificada aquí.
3. Que toda la aplicación evite reintentos o efectos laterales fuera del flujo inspeccionado.
4. Que la durabilidad cubra caída del sistema operativo o pérdida de energía.
5. Que el código de error de `COMMIT.UNKNOWN` se preserve en el outcome final; hoy se pierde en la razón genérica del core.

### Criterio mínimo antes de declarar la alternativa A satisfecha
La alternativa A solo puede declararse implementada cuando el contrato de producto esté ratificado y exista evidencia específica de que: (a) `COMMIT.UNKNOWN` termina como no resuelto; (b) no hay reintento automático del intento incierto; (c) no se ejecutan efectos protegidos como consecuencia de ese resultado; (d) la salida al usuario/sistema consumidor no afirma éxito ni fracaso definitivo; y (e) los tests correspondientes pasan en un run identificado por HEAD y suite. Esta lista no autoriza a implementar esos cambios.
