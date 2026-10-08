# NCS — Matriz causal de revocación, desconexión y efectos
Fecha: 2026-10-08
Estado: artefacto de trabajo; NO es especificación aprobada, implementación ni auditoría cerrada.
Rama: ncs-clean-architecture

## Propósito y regla de trabajo

Convertir las invariantes ya presentes en los handoffs NCS en una matriz temporal/causal auditable. La recuperación se trata como legitimidad + continuidad + reconciliación bajo incertidumbre, no como mera sustitución de claves.

Principio constitucional: “Nexo no lo queremos lleno de parches.” Si un escenario exige una excepción estructural, detenerse y corregir el diseño raíz antes de continuar.

Este documento es un respaldo de continuidad en GitHub; no demuestra que el archivo correspondiente esté cargado en la biblioteca persistente ChatGPT /NCS.

## Separaciones obligatorias

No colapsar en un único estado:
- autoridad constitucional aplicable al dominio y transición;
- autorización de una operación concreta y su alcance;
- inicio, progreso y terminación de la ejecución;
- commit/ocurrencia del efecto externo o local;
- evidencia observada, autenticada, fresca y suficiente para el propósito;
- estado de reconciliación y transición canónica.

Un efecto confirmado puede haber sido no autorizado. Una operación autorizada puede tener efecto desconocido. Una firma íntegra no prueba por sí sola autorización actual. Revocar no borra un efecto que ya ocurrió.

## Modelo de eventos propuesto

Registrar eventos distintos, vinculados por identificadores y causalidad:
- AUTHORITY_CONTEXT_OBSERVED
- AUTHORIZATION_GRANTED / AUTHORIZATION_DENIED / AUTHORIZATION_UNKNOWN
- REVOCATION_PROPOSED
- REVOCATION_AUTHORIZED
- REVOCATION_RECORDED
- REVOCATION_DISTRIBUTED_OR_OBSERVED (con alcance)
- EXECUTION_STARTED
- EXECUTION_PROGRESS_RECORDED (si el dominio lo permite)
- EFFECT_COMMIT_REPORTED
- EFFECT_CONFIRMED / NO_EFFECT_CONFIRMED / EFFECT_UNKNOWN
- SUCCESSION_PROPOSED / SUCCESSION_VALIDATED / SUCCESSION_REJECTED
- RECONCILIATION_REQUIRED / RECONCILIATION_COMPLETED
- GOVERNED_TRANSITION_COMMITTED

Estos son nombres de trabajo, no un esquema de eventos ya aprobado. Todo evento necesita procedencia, sujeto, alcance, dominio, identificadores, relación causal, evidencia, estado de validación y dependencias conocidas. No asumir que todos los dominios pueden observar todos los eventos.

## Matriz de escenarios

### A. Revocación causalmente anterior al punto de autorización/ejecución
Si la regla constitucional y el Operation Contract exigen autoridad vigente en ese punto, la operación no puede tratarse como autorizada cuando la autoridad necesaria ya no estaba vigente. Bloquear/denegar la transición dependiente. Si el efecto pudo ocurrir pese al bloqueo, reconciliarlo como hecho separado.

### B. Revocación autorizada o efectiva durante una operación en curso
No presumir ni que la operación completa es válida ni que quedó anulada. El contrato del dominio debe definir si existe una frontera de compromiso, si una operación en curso puede terminar bajo autorización previa, qué condiciones de cancelación existen y cómo se observa un efecto parcial. Si no puede determinarse la regla aplicable, UNKNOWN/STOP para nuevas transiciones dependientes y reconciliación del efecto.

### C. Revocación causalmente posterior a un efecto confirmado
Preservar el efecto. Determinar si estaba autorizado cuando se produjo, qué consecuencias persisten y qué acciones posteriores permite la Constitución. No borrar el historial ni inferir que revocación retroactiva existe.

### D. No puede establecerse el orden causal necesario
Las marcas de tiempo por sí solas no resuelven el orden cuando los relojes pueden estar desalineados, manipulados o no tener una fuente de confianza adecuada. Preservar los eventos y sus relaciones conocidas; marcar el orden como UNKNOWN. No escoger una rama por hora de pared, llegada más reciente o número de versión si esas reglas no están constitucionalmente definidas.

### E. Dispositivo offline con estado local aparentemente válido
La copia local y la autorización en caché son evidencia de estado anterior, no prueba de autoridad actual. Las operaciones offline solo pueden ejecutarse dentro de los límites predefinidos por Constitución y Operation Contract. No fijar un TTL universal. A la reconexión, reconciliar con evidencia actual y conservar los efectos reales.

### F. Dos sucesiones incompatibles
Preservar ambas propuestas, firmas, procedencia, dependencias y efectos conocidos. Evaluar cada propuesta contra reglas constitucionales preexistentes y el modelo de amenaza. No elegir por mayoría, antigüedad, número de réplicas, convergencia, integridad técnica o superioridad de hardware. Si ninguna sucesión puede demostrarse legítima, UNKNOWN/STOP para transiciones que dependan de ella; conservar las ramas sin canonizar ninguna.

### G. Clave de custodia comprometida y dependencia común posible
No asumir independencia porque existan múltiples firmas/custodios/verificadores. Mapear dependencias de software, administración, proveedor, hardware, recuperación de cuentas, distribución, reloj, almacenamiento, build y canal de evidencia. Si no queda una vía predefinida de legitimidad con assurance suficiente, no crear una raíz soberana de emergencia.

## Estados separados (candidatos, no aprobados)

### Autorización
- AUTHORIZED_AT_EXECUTION: evidencia suficiente para demostrar que se cumplieron las condiciones de autorización pertinentes.
- UNAUTHORIZED_CONFIRMED: evidencia suficiente de que faltaba una condición necesaria.
- AUTHORIZATION_UNKNOWN: evidencia insuficiente, conflicto o dependencia comprometida no resuelta.

### Efecto
- EFFECT_CONFIRMED: efecto demostrado para el alcance y garantía requeridos.
- NO_EFFECT_CONFIRMED: evidencia suficiente de que no ocurrió dentro del alcance examinado.
- STILL_UNKNOWN: no se puede demostrar si ocurrió, su alcance o su estado final.

### Reconciliación/transición
- RECONCILIATION_REQUIRED: existen hechos, autoridad o efectos que requieren resolución.
- TRANSITION_BLOCKED: una precondición constitucional/contractual necesaria no está demostrada.
- GOVERNED_TRANSITION_CONFIRMED: transición autorizada y resultado verificado conforme al contrato aplicable.

No inferir un estado a partir de otro. En particular, NO_EFFECT_CONFIRMED no significa autorización válida; EFFECT_CONFIRMED no significa éxito legítimo; UNKNOWN no significa fallo ni permiso para reintentar.

## Evidencia mínima que debe evaluarse

No definir una lista universal de campos como garantía suficiente. La evaluación depende del dominio y el riesgo, pero debe considerar:
- procedencia y autenticidad del emisor;
- integridad del registro y del enlace con el sujeto/dispositivo/operación;
- alcance exacto de la afirmación;
- frescura y política aplicable a la evidencia;
- causalidad demostrable y lagunas de observación;
- operation_id, intento y punto de compromiso cuando aplique;
- independencia y dependencias comunes del productor, verificador y autorizador;
- semántica del sistema externo que produjo el efecto;
- contradicciones, evidencia faltante y límites de assurance.

La evidencia debe ser VERIFIED_FOR_PURPOSE, no una afirmación de verdad absoluta. Un log íntegro demuestra lo que registra según su garantía; no prueba automáticamente legitimidad constitucional ni ausencia de eventos no observados.

## Reintentos, compensaciones y efectos

- UNKNOWN EFFECT → RECONCILIATION_REQUIRED; nunca reintentar por defecto.
- Considerar otro intento solo después de NO_EFFECT_CONFIRMED y si el Operation Contract lo permite.
- operation_id e idempotencia no demuestran autorización ni garantizan atomicidad externa.
- Una compensación es otra operación, requiere autorización propia y puede no revertir el efecto original.
- Conservar “ocurrió”, “fue autorizado” y “consecuencia actual” como afirmaciones distintas.
- Para operaciones irreversibles, exigir precondiciones/evidencia acordes al riesgo antes de ejecutar; si no es posible, el contrato debe limitar o prohibir la operación offline.

## Fronteras que siguen abiertas; no decidir por supuesto

1. ¿Cuál es el punto de compromiso semántico por dominio y cómo se demuestra?
2. ¿Qué operaciones en curso pueden terminar bajo autorización previa tras una revocación, y cuáles deben detenerse?
3. ¿Qué reglas determinan el instante/alcance de efectividad de una revocación? No inferir retroactividad ni descartarla sin decisión constitucional explícita.
4. ¿Cómo demostrar causalidad cuando hay eventos externos no observables o relojes no fiables?
5. ¿Qué funciones seguras pueden seguir durante UNKNOWN/STOP sin depender de la autoridad dudosa?
6. ¿Qué procedimiento constitucional predefinido aplica cuando los custodios no responden, discrepan o están comprometidos?
7. ¿Qué nivel de evidencia permite EFFECT_CONFIRMED y NO_EFFECT_CONFIRMED para cada tipo de operación?
8. ¿Qué sucede si un efecto externo real no puede reconciliarse automáticamente y no hay reversión segura?
9. ¿Cómo impedir que el updater/runtime/canal de distribución compartan una dependencia que invalide la assurance?
10. ¿Cómo se expresa y audita la relación entre eventos causales y autoridad constitucional sin convertir epoch, secuencia o hash en autoridad?

## Integración arquitectónica propuesta

- GOVERNANCE: define legitimidad, sucesión, revocación, alcance y reglas para operaciones en curso.
- DECISION & ACTION: mantiene Operation Contract, autorización, ejecución, intentos, efectos y reconciliación.
- ASSURANCE: evalúa procedencia, integridad, frescura, causalidad, independencia y garantía de la evidencia.
- CONTINUITY/CSTC: conserva ramas, linaje, eventos, efectos y transiciones; no concede autoridad por canonicalizar.
- NEXO KERNEL: consume estado semántico y conocimiento validado; no se convierte en autoridad paralela.
- FABRIC: provee runtimes/dispositivos/red/almacenamiento; no define identidad ni autoridad.

No crear Recovery Core, Bootstrap Core, Constitution Protector, motor global de conflictos ni locks/fences/barriers universales. Las reglas específicas deben estar en Constitución y contratos semánticos de cada dominio.

## Criterios de salida antes de implementar

El bloque no está cerrado hasta que:
1. cada escenario de la matriz tiene resultado válido o STOP explícito;
2. ninguna transición usa una autoridad que no se pueda demostrar aplicable;
3. efecto y autorización se mantienen separados;
4. se definen precondiciones de operación offline, revocación e in-flight;
5. las sucesiones en conflicto no se resuelven por heurísticas técnicas;
6. UNKNOWN no conduce a reintento automático ni a fusión canónica;
7. las dependencias comunes y los límites de assurance están identificados;
8. se ejecuta una matriz de pruebas adversariales y se revisan las contradicciones entre Governance, Assurance, Decision & Action, Continuity y CSTC;
9. se corrigen los defectos en la raíz antes de implementar.

## Referencias técnicas consultadas

- RFC 9334, Remote ATtestation procedureS (RATS) Architecture: https://www.rfc-editor.org/rfc/rfc9334.html
- NIST SP 800-57 Part 1 Rev. 5, Recommendation for Key Management: https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final
- NIST SP 800-184, Guide for Cybersecurity Event Recovery: https://csrc.nist.gov/pubs/sp/800/184/final
- The Update Framework Specification: https://theupdateframework.github.io/specification/v1.0.36/

Estas fuentes informan mecanismos y prácticas técnicas; no definen la Constitución de Nexo.

## Próximo paso exacto

Auditar primero las fronteras de compromiso y operaciones en curso durante la revocación; después causalidad/frescura y evidencia de efectos; luego desconexión/sucesión paralela; por último formalizar los criterios de salida y la matriz adversarial completa. No implementar todavía. No afirmar que este documento está guardado en la biblioteca ChatGPT /NCS; solo se ha creado este respaldo GitHub.


## Auditoría incremental: operaciones en curso y frontera de compromiso

Estado: análisis provisional; las opciones siguientes requieren validación constitucional por dominio.

### Tres semánticas contractuales candidatas

1. **Autorización al admitir (ADMISSION_AUTHORIZATION):** la operación queda admitida cuando se satisfacen las precondiciones de autorización. El contrato define explícitamente si una revocación posterior cancela pasos pendientes o permite terminar una operación acotada. No autoriza operaciones nuevas ni amplía el alcance original.
2. **Autorización en el compromiso (COMMIT_AUTHORIZATION):** antes de la frontera que hace efectivo el cambio, debe demostrarse la autorización exigida por el contrato. Si no se puede comprobar una precondición necesaria, no presumir que el commit está autorizado. La frontera es semántica del dominio; no equivale universalmente a enviar una solicitud, recibir un ACK o escribir un registro local.
3. **Autorización continua (CONTINUOUS_AUTHORIZATION):** para operaciones prolongadas, el contrato identifica los puntos de control donde debe seguir cumpliéndose la autorización. La revocación puede bloquear etapas futuras; no implica que los efectos anteriores desaparezcan ni que un sistema externo obedezca una cancelación.

No son modos globales de Nexo ni deben asignarse solo por comodidad de implementación. Governance define los límites admisibles; el Operation Contract selecciona una semántica concreta según el efecto/riesgo; Assurance evalúa la evidencia disponible.

### Preguntas obligatorias por operación

- ¿Cuál es el efecto protegido y quién lo confirma?
- ¿Dónde está la frontera semántica de compromiso?
- ¿La autorización debe ser válida al admitir, al comprometer o en puntos de control explícitos?
- ¿Qué sucede si se revoca antes, durante o después de esa frontera?
- ¿La cancelación es posible, y qué prueba demuestra que fue efectiva?
- ¿Puede haber efecto parcial o externo sin confirmación local?
- ¿Qué permite el contrato cuando el dispositivo está offline y no puede consultar autoridad actual?
- ¿Qué acción segura está permitida si la ejecución está en curso y la autoridad pasa a UNKNOWN?
- ¿Cómo se demuestra NO_EFFECT_CONFIRMED sin confundir ausencia de observación con ausencia de efecto?
- ¿La compensación es posible, está autorizada por separado y qué consecuencias no puede revertir?

### Tabla de decisión provisional

| Situación probada | Respuesta exigida |
|---|---|
| Revocación efectiva según las reglas aplicables antes del punto de autorización requerido | Denegar/bloquear la operación dependiente; si pudo producirse un efecto, reconciliarlo aparte |
| Revocación durante ejecución, pero antes del commit protegido | Aplicar la semántica previamente definida por el contrato; no improvisar ni asumir cancelación efectiva |
| Revocación después de un efecto confirmado | Conservar el efecto; evaluar autorización y consecuencias por separado |
| Solicitud enviada a un sistema externo, resultado sin confirmar | EFFECT_UNKNOWN; reconciliar con el sistema/dominio; no reintentar automáticamente |
| ACK recibido pero garantía semántica insuficiente para probar el efecto | No elevar a EFFECT_CONFIRMED hasta satisfacer la garantía definida para ese propósito |
| No puede determinarse si la revocación precedió al punto relevante | AUTHORIZATION_UNKNOWN; bloquear nuevas transiciones dependientes y reconciliar |
| La operación estaba offline y el contrato no autorizaba ese riesgo/alcance | No validar retroactivamente por el mero hecho de que la operación ocurrió |
| Operación offline cubierta por una delegación/preautorización explícita y limitada | Evaluar cumplimiento del alcance, límites y condiciones; el permiso en caché por sí solo no basta |

### Hueco estructural que no debe taparse

Una revocación no puede garantizar que todos los sistemas externos detengan instantáneamente operaciones ya aceptadas. El protocolo debe distinguir entre: (a) la decisión constitucional de revocar, (b) el alcance/instante efectivo definido por la Constitución, (c) la propagación y observación de la revocación, y (d) los efectos reales que todavía pueden ocurrir. Si la arquitectura exige una garantía de detención que el dominio externo no puede proporcionar, eso es un conflicto de contrato/capacidad que debe resolverse antes de permitir esa operación, no un motivo para añadir un lock global.

### Criterio provisional de avance

No cerrar este análisis hasta que una matriz por clase de operación (reversible, irreversible, compensable; local o externa; online u offline; breve o prolongada) defina punto de compromiso, autorización exigida, semántica de revocación, evidencia del efecto, cancelación y reconciliación. Esta matriz debe ser específica por dominio y compatible con Governance, Decision & Action, Assurance y CSTC. No implementar todavía.
