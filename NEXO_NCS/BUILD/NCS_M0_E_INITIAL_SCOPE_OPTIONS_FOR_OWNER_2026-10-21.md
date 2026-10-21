# NCS M0-E — opciones de alcance inicial para decisión del propietario
Fecha: 2026-10-21
Estado: **PROPUESTA NO ACEPTADA; NO AUTORIZA EFECTOS**
Rama: `ncs-clean-architecture`

## Por qué se necesita esta decisión

El propietario aceptó los puntos 1–7 como base del borrador constitucional. Eso no selecciona los efectos concretos que quedan dentro del primer scope, no aprueba el artefacto constitucional exacto y no autoriza ejecución protegida.

El código actual tiene una ruta owner-backed que solo permite `chronicle_append` y mantiene `authorization: NOT_EVALUATED`. Las acciones de reparación y otras acciones se rechazan en esa ruta. La ruta legacy/simulation tiene handlers capaces de mutar el estado de simulación, pero los informes históricos AB104.150 y P112 ya documentan que no se encontró un caller de producción que invoque `executeLuminaNexoStep()` y suministre el callback de persistencia canónica. Este hallazgo histórico se reutiliza; no se repite la auditoría. La ausencia de caller hallado no prueba que toda ruta alternativa sea inalcanzable.

## Opciones para el primer scope

### Opción A — arranque sin efectos protegidos (recomendada como postura provisional)

- Incluye: planificación, lectura, diagnóstico y persistencia interna de Chronicle que no se presente como autorización.
- Excluye y mantiene bloqueados: reparación de agentes/recursos, ejecución de acciones Lúmina y cualquier efecto externo o irreversible.
- Condición: todas las entradas ejecutables deben rechazar esas acciones antes de mutación; las rutas legacy no deben activarse como capacidad operativa inicial.
- Ventaja: permite construir y verificar Nexo sin fingir que la raíz ya es legítima ni abrir efectos mientras se completa el contrato constitucional.
- Límite: no cierra por sí sola M0-E ni declara el sistema autorizado; deja la autoridad como `NOT_EVALUATED` y los efectos protegidos en `STOP`.

### Opción B — habilitar un único efecto local acotado

- Incluye solo una clase de efecto local claramente definida, con target y mutación final identificables.
- Requiere que el propietario elija el efecto exacto, el target, el scope y sus exclusiones, y que el camino de autoridad llegue al último punto de mutación.
- No es aceptable llamarlo “local e inocuo” sin demostrar persistencia, reversibilidad, límites de daño y todas las rutas de entrada.
- No se recomienda antes de establecer raíz/procedencia y enforcement verificable.

### Opción C — incluir desde el inicio efectos de simulación Lúmina

- Incluye explícitamente las mutaciones que ejecutan los handlers de simulación, por ejemplo acciones de agente y reparaciones.
- Requiere inventario exhaustivo de entry points/callers, enforcement final compartido, prueba de que los caminos no gobernados no pueden ejecutarse en el contexto protegido, y pruebas adversariales de dispatch cero.
- Es el alcance más amplio y no debe asumirse solo porque existen handlers en el repositorio.

## Recomendación técnica

Adoptar **Opción A como configuración técnica provisional de fail-closed**, sin registrarla como decisión constitucional ni aprobación del propietario. No crear nuevos efectos; mantener los existentes restringidos. La decisión constitucional del scope sigue OPEN hasta que el propietario seleccione explícitamente una opción o una variante.

Esta recomendación no cambia el estado de la Constitución ni reemplaza los criterios M0-A…M0-E.

## Criterios mínimos para convertir la opción seleccionada en implementación

1. Registrar el scope exacto y exclusiones explícitas como decisión del propietario.
2. Identificar cada entry point soportado y demostrar cuáles quedan alcanzables.
3. Identificar la última frontera de mutación por cada efecto incluido.
4. Exigir autoridad derivada de raíz/procedencia independiente y Constitución exacta vigente; no aceptar `AUTHORIZED` caller-supplied.
5. Para cada estado negativo, afirmar resultado `UNKNOWN/STOP` y cero invocaciones del sink.
6. Ejecutar CI para el SHA exacto y enlazar run/job/log.
7. Mantener todos los efectos protegidos en `STOP` hasta que se satisfagan esos criterios.

## Estado

Esta propuesta no registra una decisión del propietario. Los puntos 1–7 permanecen aceptados únicamente como base del borrador. Constitución: DRAFT / NOT FROZEN / NOT COMMISSIONED. M0: `INCOMPLETO`; autorización: `NOT_EVALUATED`; raíz: `PENDING/UNKNOWN`; efectos protegidos: `STOP`.
