# NCS M0-E — Decisión del propietario sobre el alcance inicial

Fecha: 2026-10-21
Rama: `ncs-clean-architecture`
Decisión: **OPCIÓN A ACEPTADA COMO ALCANCE INICIAL PROVISIONAL**

## Decisión registrada

El propietario elige la opción A: arranque de Nexo sin efectos protegidos. Esta aceptación fija el alcance inicial de trabajo, pero no constituye aprobación constitucional completa, firma, congelación, commissioning, ni autorización de efectos protegidos.

## Permitido dentro del alcance, sujeto a contratos y pruebas

- Lectura de información disponible sin eludir controles de acceso.
- Planificación y diagnóstico sin ejecutar las acciones planificadas.
- Persistencia interna acotada de Chronicle/Continuity para continuidad y evidencia, con sus límites documentados y sin presentarla como prueba de autorización.
- Reporte explícito de estados desconocidos, bloqueos, conflictos y resultados no verificados.

La inclusión de cada operación en este alcance no se presume por su nombre: debe verificarse que no cause una mutación protegida ni un efecto externo indirecto.

## Excluido / bloqueado

- Reparaciones que muten el estado de agentes, necesidades o recursos.
- Efectos de Lúmina/simulación que cambien el mundo o estado canónico.
- Efectos externos, operaciones irreversibles o acciones con consecuencias fuera del almacén interno acotado.
- Cualquier ruta alternativa que alcance un sink protegido sin la frontera de enforcement.
- Cualquier operación cuya clasificación o consecuencia no pueda determinarse.

## Reglas de seguridad

1. `authorization` permanece `NOT_EVALUATED` salvo que una ruta real y probada evalúe autoridad legítima; la opción A no crea autoridad.
2. `UNKNOWN/STOP` ante evidencia ausente, contradictoria, obsoleta o no verificable.
3. No inferir que una operación es segura solo porque sea local o se llame “persistencia”.
4. Los stores locales no se consideran anclas de autoridad por sí mismos ni garantizan rollback protection, durabilidad ante pérdida de energía o resistencia a manipulación de rutas.
5. No ampliar el alcance sin una decisión explícita del propietario y evidencia de enforcement.
6. La decisión no designa mecanismo de raíz, autoridad canónica, sucesor, dual control ni mecanismo de recuperación.

## Trabajo siguiente

- Crear una matriz de operaciones permitidas/excluidas ligada a entry points, efectos y sinks observables.
- Verificar con pruebas que las operaciones excluidas se detienen antes de cualquier mutación protegida.
- Mantener las operaciones de persistencia interna separadas de la autorización y documentar cualquier límite de recuperación/durabilidad.
- Resolver M0-E: procedencia de raíz legítima verificable conectada a la frontera real de ejecución; no usar fixtures `AUTHORIZED` como sustituto.
- Ejecutar CI y registrar run/job para el SHA exacto que contenga los cambios.

## Estado que no cambia por esta decisión

- M0: `INCOMPLETO`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

Esta decisión no autoriza commissioning ni ejecución de efectos protegidos.
