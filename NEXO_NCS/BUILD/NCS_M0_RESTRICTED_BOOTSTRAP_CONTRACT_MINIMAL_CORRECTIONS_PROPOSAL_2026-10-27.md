# NCS M0 — propuesta mínima de correcciones al contrato de bootstrap

**Fecha:** 2026-10-27  
**Estado:** PROPUESTA DOCUMENTAL — NO RATIFICADA — NO APLICADA AL CONTRATO BASE  
**Base revisada:** `NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_DRAFT_2026-10-27.md`, blob SHA `60f0713123a410c09ebed311cec95d239571d5d6`.  
**Revisión independiente:** hallazgos comunicados por Claude el 2026-10-27.  
**Alcance:** correcciones de claridad normativa. No modifica runtime, tests, workflows, configuración ejecutable, decisiones del propietario ni estados operacionales.

## 1. Decisión de edición

No sustituir el borrador original todavía. Mantenerlo como versión base y usar este documento como parche propuesto para revisión. No congelar ni declarar PASS el contrato hasta resolver las decisiones expresamente pendientes.

## 2. Corrección propuesta para §1 — enumeración de P01

Donde §1 enumera los criterios de la matriz como «P01-A/C/D/E/F/G/H», sustituir por:

> La matriz cubre P01-A, P01-B, P01-C, P01-D, P01-E, P01-F, P01-G y P01-H. La inclusión de un criterio identifica su relación con el contrato; no implica que esté decidido, ratificado, satisfecho o autorizado.

**Motivo:** la omisión de P01-B es inconsistente con su tratamiento posterior en el propio contrato.

## 3. Corrección propuesta para §2 y §3.8 — aislamiento pendiente

En la fila «Invocación de bootstrap» de §2 y en la precondición 8 de §3, añadir una nota normativa equivalente a:

> **B2 / P01-B — PROPUESTA NO RATIFICADA.** El aislamiento descrito es el criterio propuesto, no una decisión de alcance aprobada. El propietario eligió C — no seleccionar todavía — en el Registro D0–D3, §10.6. No se seleccionan A ni B. Esta cláusula no congela el alcance de aislamiento ni autoriza implementación. Mientras P01-B siga abierto, el contrato no puede declararse congelado y la primera creación permanece STOP.

La cláusula no elimina la preocupación de seguridad ni declara aceptable continuar hacia admisión, PREPARED, dispatch o mutaciones. Únicamente conserva explícito que el alcance aún no está seleccionado.

## 4. Corrección propuesta para §5 — separar calidad documental de decisiones cerradas

Reemplazar el primer punto de §5 por:

> **Revisión documental:** solo puede declararse PASS documental de forma limitada cuando el texto define el objeto y el alcance que sí están establecidos, identifica las precondiciones y la evidencia requerida, y no contiene contradicciones documentales materiales sin resolver. El PASS documental no significa que el entorno real esté identificado, que una precondición se haya satisfecho, ni que P01-A, P01-B o P01-G estén cerrados. No puede declararse el contrato congelado mientras esas decisiones continúen pendientes o no ratificadas. Un punto que dependa de una decisión abierta debe etiquetarse como pendiente, no presentarse como satisfecho ni utilizarse para habilitar ejecución.

Mantener separado el criterio de PASS operacional futuro; no rebajar ni sustituir sus requisitos.

## 5. Corrección propuesta para §2, §3 y §4 — modelo de amenaza y escritores relevantes

Añadir al paquete de evidencia de §4 los siguientes campos obligatorios:

- **Modelo de amenaza aplicable:** identificador/revisión del modelo aprobado, o `UNKNOWN / NO RATIFICADO` si no existe un modelo aceptado aplicable.
- **Clases de escritores:** enumeración explícita de las clases incluidas, cómo se identificaron y qué evidencia cubre cada una.
- **Exclusiones:** cada clase excluida, justificación de por qué queda fuera del alcance aprobado y decisión que autoriza esa exclusión. La ausencia en un inventario no demuestra que la clase no exista.
- **Ventana relevante:** evento de inicio y evento de fin observables para los que debe mantenerse la exclusión, más la evidencia de que las condiciones críticas siguen vigentes durante todo el intervalo.
- **Límites no demostrados:** rutas, actores, aliases, procesos o capacidades no resueltos; si podrían escribir el objeto y no se puede resolver su relevancia, el resultado es `UNKNOWN / STOP`.

En §2, la expresión «si están dentro del modelo de amenaza» no puede operar como una exención implícita. Si el modelo no está identificado y aprobado, no se puede declarar PASS sobre la base de esa frase.

## 6. Corrección propuesta para §3.11–§3.12, §4 y §5 — persistencia frente a release/limpieza

Añadir una regla explícita de resultados:

> **Resultado de persistencia y resultado de release son dimensiones separadas.** Para persistencia, solo se registrará «fallo demostrado antes de cualquier escritura» cuando la evidencia demuestre que ninguna escritura ocurrió. Si la publicación pudo haber comenzado y no se puede demostrar si persistió, si una condición pierde vigencia durante la publicación o si el resultado no puede determinarse, registrar `UNKNOWN`; no inferir ausencia de mutación ni permitir retry automático. El resultado de liberación/limpieza de la barrera de exclusión se registra por separado y no altera retrospectivamente el resultado de persistencia. Una liberación o limpieza incierta debe conservar su propia incertidumbre y bloquear la readmisión según el protocolo aplicable, sin inferir que la publicación no ocurrió.

Antes de ratificar esta redacción, cotejar la terminología exacta contra la especificación canónica P-05: conservar sus estados y distinciones; no crear un vocabulario alternativo ni un mecanismo de recuperación nuevo. La búsqueda realizada en esta pasada no localizó la especificación P-05 por su nombre supuesto, así que la referencia exacta queda pendiente de localizar y contrastar.

## 7. Observación secundaria: objeto existente válido

Claude observó que el contrato prohíbe reemplazar objetos existentes pero no declara explícitamente qué hacer con un objeto existente válido. Propuesta de aclaración en §5:

> Si el objeto ya existe y puede clasificarse como válido, el bootstrap de primera creación no lo reemplaza ni lo reescribe; devuelve un resultado no-creación definido por el contrato ratificado, o `UNKNOWN / STOP` si no puede determinarse de forma segura el resultado permitido. Esta cláusula no autoriza reparación, migración, reconciliación ni mutación del objeto existente.

La etiqueta de resultado concreto debe cotejarse con el contrato/API canónica antes de congelar el texto; no inventar un nuevo estado de runtime.

## 8. Estado que debe permanecer sin cambios

- M0: `INCOMPLETO`.
- P01-A…P01-H: no se cierran por esta propuesta.
- P01-B: C — no seleccionar todavía; B2 no ratificada.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Raíz legítima: `PENDING / UNKNOWN`.
- `authorization: NOT_EVALUATED`.
- Primera creación de Continuity y efectos protegidos: `STOP`.
- Sin cambios de runtime/tests/workflows/configuración ejecutable; sin ejecución de tests, CI o GitHub Actions.

## 9. Secuencia recomendada

1. Localizar y cotejar la especificación canónica P-05 y la línea de meta M0 contra la cláusula de resultados.
2. Revisar este parche exclusivamente por consistencia documental; no repetir auditorías generales.
3. Si no quedan contradicciones materiales, aplicar las correcciones al borrador en un commit documental identificado, preservando el historial.
4. Solicitar revisión adversarial de Gemini sobre el contrato corregido y el parche exacto; si no puede leerlos, detenerse y pegar el texto necesario.
5. Mantener el contrato no ratificado y la ejecución en STOP hasta decisión del propietario y autorización separada.

**Este documento es una propuesta de edición; no es evidencia operacional, no congela el contrato y no autoriza la primera creación.**
