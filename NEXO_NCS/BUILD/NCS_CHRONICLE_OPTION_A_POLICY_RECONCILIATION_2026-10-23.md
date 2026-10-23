# NCS — Reconciliación de la política de escritura local Chronicle con la opción A aceptada

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Tipo: reconciliación de decisiones ya registradas; no cambia runtime.

## Resultado

La propuesta del 2026-10-23 de imponer un bloqueo general deny-first a `chronicle-append` antes del commissioning **no debe implementarse como política por defecto**: entra en conflicto con la decisión previa y expresa del propietario de aceptar la opción A como alcance operativo inicial provisional.

La decisión autoritativa de alcance está registrada en:

- `NEXO_NCS/DECISIONS/NCS_M0_E_INITIAL_SCOPE_OWNER_DECISION_2026-10-21.md`
- `NEXO_NCS/DECISIONS/NCS_M0_E_SCOPE_A_ACCEPTED_2026-10-22.md)

Ambos documentos permiten persistencia interna acotada de Chronicle/Continuity para continuidad y evidencia, y nombran `chronicle_append` como persistencia interna. El alcance aceptado no equivale a autorización constitucional, commissioning ni permiso para efectos protegidos.

## Qué queda permitido y bajo qué límites

La ruta pública estrecha `chronicle-append` puede seguir realizando persistencia local interna bajo opción A, siempre que se mantengan las restricciones ya aceptadas y verificables:

1. La operación permanece explícita, local y limitada a Chronicle/Continuity; no se convierte en dispatcher genérico.
2. Las rutas de stores son configuración confiable del operador/invocador, no datos seleccionables desde misión, claim o contenido no confiable.
3. La persistencia sirve a continuidad/evidencia; su resultado no prueba identidad del propietario, raíz legítima, autorización ni verdad universal.
4. La salida conserva `authorization: NOT_EVALUATED`; `verified: false` para la escritura Chronicle no se eleva a prueba de autorización.
5. Reparación, ejecución de comandos, mutaciones de simulación/Lúmina, red, efectos externos y cualquier sink protegido permanecen excluidos/STOP.
6. Si la clasificación de un efecto, el control de rutas o el alcance dejan de estar claros, la operación afectada se detiene; no se amplía opción A por inferencia.

La persistencia interna no se considera inofensiva por ser local. Sigue sujeta a integridad de stores, límites de recursos, control de rutas, privacidad, recuperación y pruebas de los contratos existentes.

## Corrección de la propuesta del 2026-10-23

`NCS_CHRONICLE_PRECOMMISSIONING_WRITE_POLICY_DECISION_2026-10-23.md` recomendó como opción por defecto bloquear la mutación Chronicle hasta que hubiera una raíz legítima o una capacidad de bootstrap autenticada. Esa recomendación omitió reconciliar primero la decisión explícita de opción A ya registrada. Se conserva como análisis histórico, pero su recomendación de deny-first general queda **superseded** por esta reconciliación.

En consecuencia, la especificación `NCS_CHRONICLE_PRECOMMISSIONING_GATE_IMPLEMENTATION_SPEC_2026-10-23.md` y los documentos de migración de pruebas describen una ruta condicional que **no debe ejecutarse bajo el alcance actual**. No añadir el gate deny-first, no migrar las pruebas de éxito/replay a un bypass interno y no cambiar el runtime para bloquear la persistencia local aceptada.

Esto no prohíbe controles más específicos que resuelvan un defecto demostrado en rutas, integridad, límites o privacidad. Cualquier endurecimiento debe mantener el comportamiento de opción A y estar ligado a un contraejemplo o requisito concreto; no debe simular una autoridad raíz.

## Trabajo técnico correcto a continuación

1. Mantener las pruebas existentes de CLI Chronicle, persistencia local, replay idempotente, no exposición del contenido y consultas de solo lectura; no duplicarlas sin una regresión nueva.
2. Verificar contra el HEAD actual que los entry points excluidos continúan bloqueados antes de cualquier dispatch y que las consultas de solo lectura no escriben.
3. Seguir la frontera pendiente de opción A: comprobar que rutas y configuración permanecen bajo control del invocador confiable del prototipo local; no afirmar aislamiento contra procesos locales hostiles ni un guardián global no implementado.
4. Retomar M0-E: raíz legítima verificable → Constitución exacta → Policy/contexto → enforcement en sinks protegidos. No inventar una raíz ni crear un contrato paralelo.
5. Ejecutar CI sólo para cambios de código/pruebas reales y asociar los resultados al SHA exacto; esta reconciliación documental no es evidencia de CI ni de runtime.

## Estado que permanece

- M0: `INCOMPLETO`
- Autorización: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`
- Runtime modificado por este documento: **NO**
- Gate deny-first implementado: **NO**
- CI de esta reconciliación documental: **no comprobado**

La regla central no cambia: opción A permite persistencia interna acotada, pero no crea autoridad ni autoriza efectos protegidos.
