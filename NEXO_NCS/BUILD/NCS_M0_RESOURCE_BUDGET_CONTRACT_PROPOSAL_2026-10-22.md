# NCS M0 — propuesta de contrato de presupuesto de recursos
Fecha: 2026-10-22
Estado: **PROPUESTA TÉCNICA / NO ACEPTADA POR EL PROPIETARIO / NO IMPLEMENTADA**

## Propósito

Convertir la brecha de capacidad de Chronicle, Continuity y la entrada `--content-stdin` en un contrato verificable de M0, sin inventar cifras ni cambiar runtime antes de resolver las decisiones de capacidad.

Esta propuesta es un subcriterio operativo de Opción A. Resolverla no demuestra raíz legítima, no aprueba la Constitución y no cierra M0-E.

## Decisiones de contrato que faltan

Los máximos numéricos se mantienen como **PENDIENTES de decisión**. No se deben tratar como ilimitados ni rellenar por conveniencia del implementador.

1. **Contenido de entrada:** máximo de bytes crudos leídos desde stdin, comprobado antes de acumular el contenido completo.
2. **Entrada de Chronicle:** máximo de bytes por entrada y máximo de entradas admitidas.
3. **Documento Chronicle:** máximo de bytes serializados del documento completo después de un append.
4. **Continuity:** máximos de cardinalidad para cada colección persistida y máximo de bytes serializados del snapshot completo.
5. **Presupuesto combinado:** confirmar si Chronicle y Continuity tienen presupuestos independientes o un límite agregado para el proceso/dispositivo inicial.
6. **Capacidad y recuperación:** definir si el sistema rechaza nuevas escrituras al alcanzar el límite, permite compactación/rotación bajo un contrato separado o requiere intervención del propietario. No asumir borrado, truncamiento ni rotación automática.

## Semántica de exceso propuesta

- Un contenido que exceda el límite de stdin debe rechazarse mientras se lee, sin seguir acumulando bytes sin límite.
- Una entrada que haría exceder el presupuesto de Chronicle o Continuity debe rechazarse antes de mutar el estado persistido.
- El estado previo debe permanecer íntegro; nunca truncar silenciosamente ni reportar éxito si la escritura se rechazó o su resultado es incierto.
- El exceso debe producir un resultado terminal explícito, distinguible de éxito y de UNKNOWN. Antes de añadir un nuevo identificador de outcome, inspeccionar y reutilizar el contrato existente si ya expresa exactamente este caso; no inventar IDs paralelos.
- Ante capacidad agotada, la política conservadora inicial es **rechazar la nueva admisión/escritura y conservar los datos existentes**. Cualquier rotación, eliminación o compactación requiere una decisión de contrato independiente.
- Los límites deben aplicarse de forma coherente en CLI, caso de uso y store. Un límite únicamente en el caller no es suficiente.

## Pruebas mínimas de aceptación

1. stdin justo por debajo del máximo: se procesa normalmente.
2. stdin exactamente en el máximo: comportamiento documentado y determinista.
3. stdin por encima del máximo: lectura detenida/rechazada antes de acumular el flujo completo; cero admisión de misión y cero escrituras Chronicle/Continuity.
4. Entrada individual por encima del máximo: rechazo sin cambio de archivos ni revisión.
5. Append que supera el máximo de entradas o tamaño total del documento: rechazo sin pérdida de entradas previas.
6. Snapshot Continuity que excede cardinalidad o bytes: rechazo sin persistencia parcial ni reconstrucción falsa de éxito.
7. Estado ya en capacidad máxima: nuevo append rechazado de forma determinista; los datos existentes siguen siendo legibles.
8. Fallo/resultado ambiguo durante persistencia: no reportar éxito inferido; conservar las reglas existentes de conflicto/UNKNOWN y reconciliación.
9. Pruebas de frontera exacta en bytes, usando bytes UTF-8 reales y no solo longitud de caracteres.
10. Assertions explícitas de no escritura/admisión en todos los casos negativos.

## Evidencia exigida

Para cerrar este subcriterio: contrato aceptado, implementación coherente con el contrato, tests de límites positivos/negativos, y CI exitoso atribuible al SHA exacto que contenga código y pruebas. Registrar run/job/SHA; no extrapolar un run anterior.

## No objetivos

- No elegir cifras numéricas en esta propuesta.
- No introducir rotación, borrado, colas, reintentos, tombstones ni nuevos wrappers transaccionales.
- No cambiar runtime ni declarar una vulnerabilidad explotable sin evidencia.
- No confundir presupuesto local de recursos con autorización constitucional.

## Estado conservador

Subcriterio de presupuesto: **PENDING**.
M0: **INCOMPLETO**.
`authorization: NOT_EVALUATED`.
Raíz legítima: `PENDING/UNKNOWN`.
Efectos protegidos: `STOP`.
