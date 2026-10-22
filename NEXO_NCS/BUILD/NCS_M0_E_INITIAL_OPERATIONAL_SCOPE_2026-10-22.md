# NCS — Alcance operativo inicial del presupuesto de recursos
Fecha: 2026-10-22
Rama: `ncs-clean-architecture`
Tipo: decisión técnica provisional documentada; no modifica runtime ni afirma pruebas nuevas.

## Decisión de alcance

La primera frontera soportada se limita a **invocaciones locales explícitas del CLI de Nexo, bajo directorios locales de confianza, con límites por entrada, por documento y por operación**. El prototipo no se declara servicio persistente, multiusuario, worker concurrente ni runtime de capacidad agregada del host.

Esta decisión no significa que el repositorio impida técnicamente que se lancen varios procesos CLI a la vez. No hay evidencia de un guardián global que admita una sola invocación ni un presupuesto compartido entre procesos. Por tanto, la exclusión de concurrencia multi-proceso es una restricción del alcance declarado, no una propiedad de enforcement demostrada.

## Garantías que sí se pueden reclamar

- Una invocación CLI limita el contenido leído de stdin al máximo configurado de 256 KiB antes de concatenarlo y decodificarlo como texto; la optimización actual evita una copia adicional de cada chunk que ya sea Buffer.
- Chronicle y Continuity rechazan documentos y escrituras que superen sus límites por-store, cuando la operación recorre los validadores existentes.
- Los locks existentes coordinan escritores cooperantes para la misma ruta de store.
- El resultado de rechazo por capacidad conocida no debe convertirse en truncamiento ni purga automática.

## Garantías que NO se reclaman

- Exclusión de varios procesos CLI simultáneos.
- Presupuesto agregado de heap de V8, memoria máxima transitoria o memoria del host.
- Presupuesto agregado de disco entre stores, temporales, locks, logs, rutas o procesos.
- Capacidad de servicio concurrente/multiusuario, aislamiento frente a procesos locales no confiables, resistencia a ataques de ruta/symlink, ni durabilidad ante pérdida de energía.
- Que un límite de JSON serializado sea equivalente a un límite de memoria residente.

## Frontera de admisión y siguiente paso

No añadir un contador global, semáforo, cola, wrapper o lock de proceso improvisado: eso sería una nueva arquitectura y podría crear una falsa garantía si no cubre todas las entradas y todos los procesos.

Las dos brechas concretas de Continuity ya tienen pruebas en `tests/nexo/continuity-store.test.mjs`; el refuerzo de la comprobación de bytes canónicos pasó cinco workflows CI en el SHA `20b3e1b51616c93862a2cad2e502c143c35b77ef` (ver STATUS y el handoff vigente). No repetir esa tarea sin una contradicción nueva.

El siguiente paso es una evaluación de suficiencia por capas: (1) inventariar qué rutas de entrada llegan a los stores y si todas pasan por los validadores actuales; (2) confirmar qué archivos y operaciones quedan cubiertos por los topes por-store y qué no; (3) dejar explícito si el perfil local aceptado requiere límites por operación/store o si hay una exigencia adicional de presupuesto total. No declarar que el límite por-store protege el heap o disco agregado. El presupuesto agregado de heap/disco permanece **OPEN** hasta que exista una unidad de admisión verificable y una forma de medir/limitar el recurso real.

## Estado canónico

- M0: `INCOMPLETO`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Esta nota es una acotación de alcance, no prueba de enforcement global, ni autorización constitucional, commissioning o efectos protegidos.
