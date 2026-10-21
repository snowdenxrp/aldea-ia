# NCS M0 — registro de decisiones del propietario sobre el borrador constitucional

Fecha de registro: 2026-10-21
Rama: `ncs-clean-architecture`
Estado del artefacto constitucional: DRAFT / NOT FROZEN / NOT COMMISSIONED

## Alcance de este registro

Este archivo registra únicamente las decisiones expresas del propietario durante la revisión conversacional de los puntos 1–6. Es un registro de decisión sobre la base del borrador, no una firma, aprobación constitucional completa, congelación, commissioning ni autorización de efectos protegidos. No modifica por sí mismo el borrador constitucional fuente.

## Decisiones registradas

Para cada punto 1–6, decisión: **ACEPTAR COMO BASE DEL BORRADOR**. Observaciones adicionales: **ninguna**.

1. **Principios fundamentales.** Aceptados como base. La inteligencia no equivale a autoridad; la autoridad no equivale a ejecución; la evidencia técnica por sí sola no demuestra legitimidad; incertidumbre crítica implica `UNKNOWN/STOP`.
2. **Alcance inicial.** Aceptado como base. El borrador propone reconocimiento de autoridad legítima, Policy/contexto gobernante, claims, transiciones protegidas y cierre seguro ante evidencia ausente, contradictoria, obsoleta o no verificable; mantiene explícitas las exclusiones descritas en la revisión.
3. **Enmiendas constitucionales.** Aceptadas como base. Una propuesta identificable no concede aprobación ni activación; la aprobación debe vincularse al contenido exacto; activación, retiro, conflicto y rollback requieren reglas explícitas. El doble control sigue siendo principio de diseño, pero su mecanismo concreto no queda resuelto por esta aceptación.
4. **Identidad canónica, vigencia y revocación.** Aceptadas como base. Deben distinguirse la aprobación de una revisión y su vigencia actual; recencia o rollback no establecen por sí solos legitimidad; conflicto o estado desconocido implica `UNKNOWN/STOP` para operaciones afectadas. **Sigue pendiente** dónde reside el estado canónico y cómo se establece y verifica su legitimidad de forma independiente.
5. **Autoridad raíz y reconocimiento del propietario.** Aceptados como base. Identidad del dispositivo y autoridad del propietario son distintas; la autoridad debe verificarse y no autoproclamarse; una credencial raíz no concede permisos operativos ilimitados; continuidad entre modelos e instalaciones no equivale a prueba de raíz. **Siguen pendientes** la selección/provisión de la credencial, su procedencia legítima, la verificación criptográfica, el ancla de confianza independiente y cualquier recuperación dentro del alcance permitido.
6. **Delegación.** Aceptada como base. Los límites deben ser explícitos; un delegado no puede ampliar sus propios permisos; la delegación debe poder verificarse y revocarse; cada efecto delegado requiere controles aplicables; sucesión y delegación operativa son distintas. **Siguen pendientes** formatos, mecanismo criptográfico, reglas de delegación encadenada y procedimiento formal de sucesión. La sucesión de la hija no queda activa ni autorizada por este registro.

## Punto no decidido

7. **Policy, contexto y evaluación de operaciones:** permanece **OPEN / NO ACEPTADO**. Se propuso evaluar cada operación contra la Constitución vigente, la Policy aplicable, el contexto y la evidencia; incertidumbre o contradicción conduciría a `UNKNOWN/STOP`. No registrar esta propuesta como decisión del propietario hasta que exista aceptación expresa.

## Límites que permanecen vigentes

- No inferir aprobación constitucional completa, firma, congelación, commissioning ni autorización de efectos protegidos.
- No tratar la aceptación de base como evidencia de que exista un runtime que reconozca la raíz legítima.
- No inferir que un campo `AUTHORIZED`, una fixture de prueba, una firma válida aislada o una clave autoafirmada prueben legitimidad.
- No inventar recuperación si se pierde irrecuperablemente la única credencial raíz.
- No modificar automáticamente el borrador fuente para convertir estos principios en reglas constitucionales definitivas.
- Estado operativo conservador: M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## Siguiente paso

Mantener este registro y la guía de revisión sincronizados. Después continuar con el cierre finito de criterios M0 y la brecha M0-E: procedencia de raíz demostrable y conexión hasta el límite real de efecto protegido. La aceptación documental no sustituye esa evidencia.


---

## Punto 7 — Policy, contexto y evaluación de operaciones (decisión del propietario)

Fecha: 2026-10-21.
Decisión explícita del propietario: **ACEPTAR COMO BASE DEL BORRADOR**.
Observaciones adicionales: no especificadas.

Base aceptada: cada operación debe evaluarse frente a la Constitución vigente, la Policy aplicable, el contexto y la evidencia pertinente. La insuficiencia, contradicción, obsolescencia o imposibilidad de verificar información crítica debe producir `UNKNOWN/STOP`, no autorización por defecto.

Límites: registrar únicamente la aceptación de este punto como base. No inferir aprobación constitucional completa, firma, congelación, commissioning ni autorización de efectos protegidos. Esta decisión no demuestra que el evaluador esté implementado o conectado al límite real de efectos protegidos.
