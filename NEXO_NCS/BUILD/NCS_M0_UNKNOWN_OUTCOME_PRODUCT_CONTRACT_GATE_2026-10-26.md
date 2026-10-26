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
