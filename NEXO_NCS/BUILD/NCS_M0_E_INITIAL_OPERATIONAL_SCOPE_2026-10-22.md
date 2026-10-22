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

El siguiente paso de implementación sigue siendo cerrar las dos brechas concretas de Continuity indicadas en el handoff:
1. Rechazo de un snapshot estructuralmente válido cuyo documento serializado exceda 16 MiB, con preservación byte por byte del archivo previo y de su revisión.
2. Dos commits concurrentes de Continuity cerca de la frontera de capacidad, comprobando revisión/bytes confirmados y ausencia de sobre-admisión o pérdida/duplicación.

Después de esa evidencia, decidir si los límites por-store bastan para el uso local declarado. El presupuesto agregado de heap/disco permanece **OPEN** hasta que exista un mecanismo global verificable y una forma de medir/limitar el recurso real.

## Estado canónico

- M0: `INCOMPLETO`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Esta nota es una acotación de alcance, no prueba de enforcement global, ni autorización constitucional, commissioning o efectos protegidos.
