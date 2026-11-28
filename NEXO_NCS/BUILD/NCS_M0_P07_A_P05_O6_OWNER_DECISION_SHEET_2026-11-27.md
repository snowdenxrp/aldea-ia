# NCS M0 — Hoja de decisiones reservadas P07-A / P05-O6 / cleanup / residuos

**Fecha:** 2026-11-27  
**Estado:** BORRADOR PARA DECISIÓN DEL PROPIETARIO — NO RATIFICADO  
**Base normativa:** P07 V2.2 + V2.3, ambos ratificados por el propietario el 2026-11-27.  
**Evaluación relacionada:** `NCS_M0_O7_P07C_P05_TRACEABILITY_EVALUATION_2026-11-27.md`.

## 0. Propósito y límites

Esta hoja agrupa únicamente decisiones todavía reservadas al propietario que impiden cerrar la especificación de B2/B3. No reabre decisiones ya ratificadas:

- R1: Android sandbox + HOME privado de Termux + invocación manual foreground.
- P05-C: UNKNOWN/BLOCKED sin recuperación automática ni cleanup/readmisión no atribuibles.
- C3/G2: cualquier desplazamiento temporal del nombre protegido o modificación de nlink del inode protegido cuenta como afectación.
- Perímetro O7/P07: Continuity, locks/coordinación, temporales/publicación/reemplazo, root/namespace relevante y Chronicle separado protegido frente a interferencias/colisiones.
- Contrato documental P07 V2.2 + V2.3.

Esta hoja no selecciona una primitiva, no modifica `authorization: NOT_EVALUATED`, no cierra gates y no autoriza implementación, tests, CI, Termux/POCO, bootstrap, publicación, cleanup, readmisión, commissioning ni efectos protegidos.

## 1. P07-A — política de aliases y dominio de admisión

### Pregunta reservada

¿Qué clases de alias de la raíz/namespace protegido pertenecen al mismo dominio de admisión, cuáles se prohíben y cuáles deben permanecer UNKNOWN?

### Alternativas

**A — Política estricta de raíz única (recomendada para M0).**
- Una sola raíz explícita y aprobada constituye el único dominio de admisión.
- Symlink en cualquier componente de la resolución protegida, bind mount/alias de montaje, ruta alternativa que alcance el mismo namespace y cualquier resolución ambigua producen STOP/UNKNOWN, salvo clasificación expresa posterior.
- Hardlinks a archivos se tratan como clase separada; no se equiparan a alias de raíz ni se presume hardlink de directorio.
- No se infiere identidad estable solo de igualdad textual de paths o de una observación aislada de `(st_dev, st_ino)`.

**B — Alias equivalentes bajo identidad observada.**
- Algunas rutas alternativas podrían aceptarse como el mismo dominio si se demuestra equivalencia de resolución/namespace y se conserva el anclaje requerido.
- Cada clase (symlink, bind mount, ruta relativa, hardlink de archivo, montaje) necesitaría una regla y oráculo independiente.
- Mayor complejidad probatoria; ninguna clase queda aprobada por defecto.

**C — Política abierta por clase.**
- No se aprueba ninguna clase adicional ahora.
- Todas las clases no clasificadas quedan BLOCKED/UNKNOWN hasta una decisión individual.
- Evita una generalización, pero deja el contrato menos operativo.

### Recomendación

A para M0. Reduce el dominio permitido a una sola raíz aprobada y falla cerrado ante aliases no clasificados. No determina cuál es la raíz constitucional ni sustituye P01/P02.

**Efecto de la decisión:** permite fijar el oráculo P07-A y delimitar qué rutas debe resolver/rechazar el código. No cierra P07-A/B/C sin implementación y evidencia.

## 2. P05 O6 / G5 — autoridad y procedimiento de reclasificación

### Pregunta reservada

¿Quién puede mover una instancia de UNKNOWN/BLOCKED a un estado admisible, y qué condiciones mínimas deben cumplirse?

### Alternativas

**A — Revisión manual del propietario por incidente (recomendada).**
- Ningún proceso, lock, PID, token, TTL, timestamp ni ausencia de archivo puede reclasificar por sí solo.
- Cada incidente requiere expediente de evidencia: identidad de objetos y namespace, causa del bloqueo, estado de procesos/ventana R1, residuos y atribución APP-OWNER, SHA exacto del producto/harness y límites de lo que no pudo verificarse.
- El propietario decide expresamente si procede una transición y su alcance; sin decisión o ante cualquier UNKNOWN, permanece BLOCKED.
- La decisión queda registrada antes de readmisión/cleanup.

**B — Bloqueo permanente sin readmisión automática ni manual dentro de M0.**
- Ante UNKNOWN/BLOCKED, la instancia no se recupera.
- La única salida es abandonar esa instancia y tratar cualquier futura inicialización como una operación nueva, con su propio proceso de autorización P01.
- Máxima conservaduría; puede impedir continuidad de una instancia que sufrió un fallo recuperable.

**C — Procedimiento técnico delegado.**
- Un procedimiento preaprobado podría reclasificar clases limitadas de incidentes si satisface predicados exactos.
- Requiere definir previamente todas las clases recuperables, evidencias y límites; no hay base actual para aprobarlo de forma general.

### Recomendación

A. Es coherente con P05-C y permite resolver O6/G5 sin conceder autoridad autónoma al mecanismo. Cualquier incidente que no satisfaga todos los predicados permanece BLOCKED. No se propone recuperación por PID/edad ni limpieza automática.

**Efecto de la decisión:** resuelve quién decide y el estándar documental mínimo. No demuestra que el mecanismo pueda cumplirlo ni autoriza readmisión real.

## 3. P07-B/C — evidencia APP-OWNER para cleanup de temporales propios

### Pregunta reservada

¿Qué estándar de atribución de aplicación debe cumplirse además de FS-OWNER antes de que el producto pueda limpiar un temporal que afirma haber creado?

### Alternativas

**A — Atribución estricta por operación (recomendada).**
- Debe existir evidencia verificable que vincule el objeto exacto con una operación admitida concreta y con el rol del objeto.
- La evidencia debe distinguir APP-OWNER de UID/GID/mode/ACL (FS-OWNER), y vincular identidad del objeto, nombre/namespace y lifecycle de la operación.
- Token, nombre, PID, antigüedad, hash o propiedad filesystem aislados no bastan.
- Si no puede probarse la atribución o identidad del objeto realmente afectado, se conserva el residuo y el estado queda UNKNOWN/BLOCKED.

**B — Ningún cleanup tras fallo/crash.**
- Cleanup automático limitado a temporales cuya atribución y descriptor permanecen dentro de la misma operación viva y sin interrupción.
- Tras error ambiguo, terminación o crash, todo residuo se conserva para revisión manual.

**C — Solo FS-OWNER y path privado.**
- No recomendada: UID/GID/mode/ACL y ubicación privada no demuestran por sí solos quién creó el objeto ni que el nombre siga apuntando a él.
- No satisface el contrato vigente si se usa como autoridad única.

### Recomendación

A como criterio normativo, combinado con B como fallback ante cualquier incertidumbre. La implementación deberá demostrar el vínculo en el seam real; si no puede, no limpia.

**Efecto de la decisión:** fija el estándar de atribución, no el mecanismo que lo implementa ni el PASS de P07-C.

## 4. Política de residuos y acumulación

### Pregunta reservada

¿Qué se hace cuando un residuo no puede atribuirse de forma suficiente o cuando la retención empieza a consumir recursos?

### Alternativas

**A — Retención indefinida de residuos ambiguos (recomendada para M0).**
- Sin TTL, borrado por antigüedad, cuota ni purga automática.
- Si la acumulación amenaza el espacio disponible, se detiene la operación y se solicita revisión del propietario; la presión de almacenamiento no crea autoridad de cleanup.
- La readmisión permanece bloqueada mientras el residuo afecte la identidad/namespace protegido.

**B — Límite cuantitativo con intervención del propietario.**
- Se define un umbral de cantidad/tamaño solo para disparar STOP y revisión; nunca para borrar.
- Requiere elegir el umbral y el alcance de la observación.

**C — Limpieza automática al superar un umbral.**
- No recomendada y no compatible con P05-C sin un estándar de atribución y procedimiento aprobado que actualmente no existe.

### Recomendación

A para M0; si el propietario prefiere un umbral de alerta, B puede añadirse sin autorizar borrado. No usar antigüedad como criterio de atribución.

## 5. Pregunta técnica separada — RAW-1

RAW-1 (`scripts/assistants.mjs` + `NEXO_LUMINA_MEMORY_PATH`) es una capacidad estática condicional de escritura directa. Su uso runtime no fue observado en la captura disponible; enforcement/exclusión no está demostrado.

No se requiere una nueva decisión de identidad Nexo/Lúmina: los stores permanecen separados y la capacidad que pueda afectar Continuity pertenece al análisis O7. El trabajo técnico deberá, sobre un baseline limpio y SHA explícito, determinar cómo eliminar o impedir el alias a la ruta protegida sin inferir que una variable UNSET en una captura es ausencia sostenida. No ejecutar una nueva observación Termux ni modificar código con el checkout sucio.

## 6. Condiciones que permanecen fuera de esta hoja

- No elige flock, fcntl/OFD, dirfd/openat2, SQLite, marker, tombstone, epoch, journal, daemon, hardlink ni otra primitiva.
- No resuelve la contradicción B2 del cleanup path-based ni el GAP B3 del estado process-local.
- No demuestra O7/P09/O8 ni cierra E2/E3.
- No selecciona la raíz constitucional P01/P02.
- No autoriza ninguna operación sobre Continuity/Chronicle real.

## 7. Recomendación consolidada para decisión

La recomendación técnica es **A / A / A+B / A** en las secciones 1–4:
1. raíz única y aliases no clasificados en STOP;
2. reclasificación manual del propietario por incidente;
3. APP-OWNER estricto, con retención si la atribución no puede probarse;
4. retención indefinida de residuos ambiguos durante M0, con STOP ante presión de almacenamiento.

La combinación es conservadora y coherente con las decisiones ya ratificadas. Sigue siendo una recomendación, no una decisión del propietario.

**Estado:** PENDIENTE DE REVISIÓN Y RATIFICACIÓN EXPRESA DEL PROPIETARIO.  
**Gates:** P07-A OPEN; P07-C UNKNOWN/BLOCKING; P05 OPEN; O7 UNKNOWN/OPEN; P09 OPEN/UNKNOWN; `authorization: NOT_EVALUATED`; commissioning/efectos protegidos STOP; NCS M0 INCOMPLETO.
