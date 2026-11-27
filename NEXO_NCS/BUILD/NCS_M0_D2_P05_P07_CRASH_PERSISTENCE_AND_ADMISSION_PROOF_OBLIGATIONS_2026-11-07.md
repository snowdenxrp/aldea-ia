# NCS M0 — P-05/P-07: crash persistence and admission proof obligations

Fecha: 2026-11-07  
Rama documental: `ncs-strategic-vision-preservation-2026-11-05`  
Estado: **ANÁLISIS TÉCNICO DOCUMENTAL — NO SELECCIONA MECANISMO — NO IMPLEMENTA — NO AUTORIZA PRUEBAS**  
Dependencias: P-03/P-04 D1–D6 ratificadas; P-05-C ratificada; R1 aceptado; P-07 V2.3 propuesta no ratificada; P-09 OPEN/UNKNOWN.

## 1. Propósito

Precisar la obligación técnica que conecta la política P-05-C con P-07-C. La pregunta no es qué nombre poner a un lock, sino qué evidencia debe existir para que una nueva invocación no confunda la muerte del proceso anterior con una liberación segura.

Este análisis reutiliza los contratos y hallazgos ya registrados. No repite el inventario de callers, no propone otro modelo de actores, no selecciona primitivas y no convierte documentación en PASS.

## 2. Premisas vigentes

1. P-05-C exige UNKNOWN/BLOCKED sin recuperación automática cuando release/cleanup sea incierto.
2. Si el enforcement durable/interproceso de BLOCKED no se demuestra, la instancia permanece STOP y M0 no se declara completo.
3. No se permite recuperación predeterminada borrando o reemplazando manualmente el lock.
4. La readmisión futura exige decisión expresa del propietario y procedimiento concreto demostrado.
5. P-07-C exige que cleanup/release no afecte un objeto sustituto y que la identidad de la instancia afectada quede vinculada a la instancia adquirida.
6. P-09 sigue OPEN/UNKNOWN; no está demostrado que todos los writers/callers relevantes atraviesen la admisión.
7. R1 fue aceptado, pero E2/E3 siguen PARTIAL/NOT CLOSED. La aceptación del límite no prueba control de los actores reales.

## 3. Distinción esencial: exclusión viva frente a cuarentena durable

Son garantías distintas:

- **Exclusión viva:** mientras un proceso conserva un lock de kernel o una admisión exclusiva, otro participante cooperativo no entra.
- **Cuarentena durable:** después de crash, terminación abrupta o pérdida del estado local del dueño, una nueva invocación sigue observando un estado que obliga a bloquear.
- **Identidad de namespace:** la nueva invocación abre/inspecciona el mismo objeto de coordinación, no un objeto sustituto creado bajo el mismo nombre.
- **Cobertura:** todo caller/writer dentro del claim está obligado a pasar por esa frontera.

Un lock puramente asociado a un descriptor/proceso puede proporcionar exclusión viva mientras permanece adquirido. Si el kernel libera ese lock al terminar el proceso, esa liberación no prueba que la operación anterior alcanzó un resultado seguro. Por tanto, un lock efímero por sí solo no demuestra la cuarentena durable que exige P-05-C.

La presencia de un path tampoco basta: no prueba identidad, dueño, integridad ni ausencia de sustitución. Su ausencia tampoco prueba que el actor previo terminó de forma segura. Esta distinción ya está exigida por P-05-C y P-07-C; aquí se formaliza como obligación de aceptación.

## 4. Obligaciones mínimas para cualquier mecanismo futuro

Un mecanismo candidato solo puede evaluarse si responde, con evidencia, a todos estos puntos:

| ID | Obligación | Evidencia necesaria | Si falta |
|---|---|---|---|
| O1 | Estado BLOCKED sobrevive a la terminación del proceso dueño | Prueba de crash/cierre abrupto y nueva invocación independiente | UNKNOWN/STOP |
| O2 | La nueva invocación descubre el estado anterior sin inferirlo por PID/edad/ausencia | Lectura independiente del estado de coordinación y resultado fail-closed | UNKNOWN/STOP |
| O3 | El estado de coordinación tiene identidad estable | Identidad del objeto y namespace antes/después; sustitución adversarial dentro del modelo | UNKNOWN/STOP |
| O4 | Release/cleanup solo afecta el objeto adquirido | Seam real de operación destructiva y oráculo del objeto sustituto | UNKNOWN/STOP |
| O5 | No existe readmisión por pérdida, sustitución, ilegibilidad o desaparición del estado | Matriz de errores/ausencia/tipo inesperado y competidor en proceso separado | UNKNOWN/STOP |
| O6 | El estado solo se reclasifica mediante procedimiento aprobado | Predicados explícitos, autoridad, evidencia y registro verificable | BLOCKED |
| O7 | Todo caller/writer cubierto respeta la frontera | P-09 cerrado para universo acotado; fixtures de bypass | UNKNOWN/STOP |
| O8 | La garantía corresponde al entorno R1 real | Target fingerprint, filesystem, kernel/API, permisos y actores observados | UNKNOWN/STOP |
| O9 | Persistencia de negocio y estado de admisión no se confunden | Oráculos separados para commit, release y readmisión | INVALID |

O1–O5 conectan P-05 con P-07. O7 conecta ambos con P-09. O8 conecta la afirmación con E2/E3. Ningún PASS aislado sustituye el conjunto.

## 5. Por qué los patrones parciales no satisfacen el contrato

| Patrón | Qué puede aportar | Qué no demuestra |
|---|---|---|
| Estado local en memoria | Evitar reentrada dentro del proceso vivo | Persistencia tras crash o coordinación interproceso |
| Lock de descriptor/ kernel efímero | Exclusión mientras el descriptor mantiene el lock | BLOCKED durable después de que el proceso muere |
| Lock file por nombre | Señal persistente y punto de encuentro | Identidad estable; ausencia no prueba quiescencia; limpieza segura |
| PID, timestamp, TTL o edad | Datos diagnósticos | Que el actor anterior terminó o no puede reanudarse |
| Token en contenido + unlink por path | Detectar discrepancia antes de borrar | Que el unlink afecte al mismo inode validado; cierra insuficientemente check/use |
| dirfd/openat2 | Resolver rutas bajo restricciones durante apertura, si está disponible y probado | Operación compare-and-unlink ni cuarentena durable por sí sola |
| flock/OFD lock | Serializar participantes que abren el mismo objeto y respetan el protocolo | Evitar split-brain si el nombre se sustituye; conservar BLOCKED tras crash |
| Temporal + rename | Publicación/visibilidad atómica bajo condiciones aplicables | Fencing contra writer directo ni cleanup replacement-safe |
| Inspección de procesos | Evidencia contextual de procesos observados | Prevenir relanzamientos o cerrar por sí sola la carrera de nueva invocación |

La tabla no descarta que una composición futura pueda satisfacer el contrato. Establece que ninguna fila aislada lo hace y que no se debe presentar un candidato parcial como solución.

## 6. Restricción de diseño vigente

Los documentos P-05-C y P-07 prohíben inventar, sin decisión y autorización aplicables, un marcador persistente, lock hermano, tombstone, epoch, daemon o journal. Este análisis respeta esa restricción.

No se propone reutilizar el lock actual como almacenamiento durable de estado, ni mutar su formato, ni introducir un objeto adicional. Cualquiera de esas opciones sería una decisión de mecanismo que tendría que pasar O1–O9, el contrato P-07 y la autorización correspondiente.

**Resultado actual:** con la evidencia documental disponible no hay mecanismo seleccionado que demuestre simultáneamente cuarentena durable, identidad replacement-safe y cobertura de callers. No se puede cerrar P-05 ni P07-C por inferencia.

## 7. Dependencias y secuencia mínima de cierre

1. **P-07-A/B/D/E:** fijar identidad/alias, target filesystem y límites de claims con evidencia R1; mantener abierto lo que requiera observación del dispositivo.
2. **P-07-C:** demostrar un seam real de release/cleanup replacement-safe y todos los oráculos aplicables. No basta un mock ni una operación de path de alto nivel.
3. **P-05:** presentar una arquitectura candidata que satisfaga O1–O6 sin recuperación automática implícita; someter cualquier nueva decisión de autoridad al propietario.
4. **P-09:** acotar el universo de despliegue y resolver loaders/callers externos, o conservar explícitamente UNKNOWN y bloquear el claim universal.
5. **P-03/P-04:** implementar la admisión antes del primer I/O persistente en cada API pública, una vez satisfechas las dependencias y exista autorización de código.
6. **E2/E3:** demostrar el procedimiento real de control de launchers/writers y prevención de relanzamiento durante la ventana R1; una inspección estática no basta.
7. **Aceptación:** fixtures negativos, competencia multiproceso, crash/restart, sustitución y oráculos separados, todo ligado a un SHA congelado y autorización específica.

No se debe invertir el orden para implementar primero una primitiva y luego adaptar el contrato a sus limitaciones.

## 8. Criterio de no-regresión documental

Hasta que se demuestre lo anterior:
- P-05-C: RATIFICADA COMO POLÍTICA.
- P-05: OPEN.
- P-07-C: UNKNOWN / BLOCKING.
- P-09: OPEN / UNKNOWN.
- E2/E3: PARTIAL / NOT CLOSED.
- M0: INCOMPLETO.
- `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; commissioning y efectos protegidos STOP.

Esta unidad no ratifica P07 V2.3, no selecciona mecanismo, no modifica código/tests/workflows/configuración/dispositivo y no ejecuta pruebas/CI/Actions/Termux/POCO.


---

## DELTA — CHECKPOINT DE CONTINUIDAD Y CIERRE SIN REPETICIÓN (2026-11-26)

**Base documental de este checkpoint:** rama `ncs-p09-o5-o7-writer-census-2026-11-26`, HEAD `5417f1dd3efe5ca4bb88fdce5e82fb4945871a51`.  
**Naturaleza:** consolidación documental de continuidad. No cambia contratos, decisiones ratificadas, gates ni autorizaciones.

### A. Estado que debe heredarse sin reinterpretación

- **P05-C:** RATIFICADA como política por el propietario; **P05 sigue OPEN** porque no existe enforcement durable/interproceso y procedimiento de resolución/readmisión demostrado.
- **P07-C:** UNKNOWN / BLOCKING. No hay mecanismo seleccionado.
- **O4:** NOT SATISFIED en el snapshot estático evaluado: el token se comprueba y luego el cleanup ejecuta `rm(lockPath)` por nombre, sin vincular atómicamente el objeto comprobado con el eliminado.
- **O5:** NOT SATISFIED en ese snapshot: la marca `lockReleaseFailures` es process-local y la desaparición del path permite reintento; no se demuestra no-readmission durable frente a pérdida/sustitución/ilegibilidad.
- **O1/O2/O3/O6/O7/O8:** UNKNOWN en la reconciliación estática; **O9: PARTIAL**. No promover estos estados sin evidencia nueva ligada al SHA y al claim.
- **P09:** OPEN / UNKNOWN dentro del universo declarado ratificado. No reclamar cobertura universal. RAW-1 continúa REPORTADO / NO REPRODUCIDO INDEPENDIENTEMENTE.
- **E2/E3:** PARTIAL / NOT CLOSED. R1 está ACCEPTED BY OWNER; aceptación del límite no prueba control sostenido de los actores reales.
- **M0:** INCOMPLETO; `authorization: NOT_EVALUATED`; commissioning y efectos protegidos STOP.

### B. Corrección de continuidad sobre P01-G y bootstrap

P01-G **no está pendiente de una nueva decisión normativa del propietario**: la regla de autorización operacional humana explícita, única y acotada para la primera creación de Continuity L fue RATIFICADA el 2026-11-02. La reconciliación con Core ya está documentada en `NCS_M0_P01_G_CORE_CONTRACT_RECONCILIATION_RE01_RE02_2026-11-02.md`.

No reabrir P01-G ni volver a solicitar esa ratificación. Los estados de RE-01/RE-02 y de la publicación real deben tomarse de las deltas posteriores de `NEXO_NCS/STATUS.md`, no de las filas históricas del documento P01-G del 2026-11-02: STATUS registra RE-01/RE-02 ejercitados, la publicación restringida real y E4 verificado; E2/E3 siguen PARTIAL. Esto no autoriza repetir bootstrap ni tocar el store real.

### C. Precedencia P07 que debe conservarse

- P07 V2.2 es la base documental; V2.3 se aplica como delta sobre V2.2, sin sustituir sus documentos.
- V2.3 permanece **NO RATIFICADA** y no selecciona mecanismo ni autoriza pruebas.
- Detección/STOP (`DETECTION_ONLY`) y retención (`RETENTION_VERIFIED`) no son prevención ni `PASS_GATE`.
- En P07-16, R-OBJ y R-NAME son claims separados; conservar un dirfd no demuestra continuidad del nombre aprobado.
- Actor B debe clasificarse antes de cada escenario: COVERED, RAW, PRIVILEGED o UNCLASSIFIABLE. Este último implica UNKNOWN-STOP.
- P07-18b/19/21 requieren sus oráculos específicos de centinela, atribución, seam y nlink; no se sustituyen por una prueba genérica de rename/unlink.
- La decisión del propietario sobre afectación reversible y C3/nlink ya está resuelta; no solicitar otra ratificación ni reabrir C3.

### D. Trabajo ya completado — NO REPETIR

1. Reconciliación estática lock/release de Continuity y Chronicle para el snapshot `d8b5ca8720908d926acc18130614cce132a43b5d`, incluida la matriz O1–O9: `NCS_M0_D2_CURRENT_SOURCE_LOCK_RELEASE_AND_P05C_RECONCILIATION_2026-11-07.md`.
2. Definiciones canónicas O1–O9 y criterios de evidencia: este documento, §4.
3. Contratos P07 V2.2 y deltas V2.3, incluidos los oráculos P07-05/06/07/16/18b/19/21 y trazabilidad.
4. Reconciliación P09 y errata P08/P09 del 2026-11-26. No reauditar Lúmina, no volver a inferir que su writer por defecto es un writer Nexo, y no repetir el censo ya documentado.
5. Recuperación de O5/O7, límites de RAW-1 y discrepancia de path filter STEP 3A. No volver a buscar las mismas fuentes sin cambio verificable de SHA o evidencia nueva.

### E. Siguiente acción documental única

Construir una **prueba de admisibilidad neutral a mecanismos** para cualquier futura arquitectura candidata: una tabla que exija, para cada O1–O9 y cada oráculo bloqueante V2.2+V2.3, (i) claim exacto, (ii) actor/clase, (iii) objeto y nombre afectados, (iv) seam y evento observable, (v) evidencia mínima y nivel, (vi) dependencia/gate, y (vii) condición UNKNOWN/STOP. La tabla no debe proponer ni seleccionar primitivas, ni crear obligaciones nuevas, ni reinterpretar O1–O9. Si no hay candidato o evidencia para una fila, registrar `NO CANDIDATE / UNKNOWN`; no rellenar con mecanismos hipotéticos.

### F. Límites

Solo documentación. Sin código, tests, harness, CI/Actions, workflows ejecutados, Termux/POCO, bootstrap, stores, cleanup, readmisión, PR #110, ramas de producto, commissioning ni efectos protegidos. No declarar PASS, TESTED o CI-VERIFIED por este checkpoint.


## G. Matriz de admisibilidad neutral a mecanismos — O1–O9 × oráculos P07 (2026-11-26)

**Propósito:** traducir las obligaciones existentes a evidencia exigible sin elegir arquitectura, añadir obligaciones ni alterar V2.2/V2.3. Las correspondencias de escenarios indican contribución probatoria; no implican equivalencia uno-a-uno ni PASS.

| Obligación | Claim que debe probarse | Oráculos P07 relacionados | Evidencia mínima admisible | Dependencia / regla UNKNOWN-STOP |
|---|---|---|---|---|
| O1 | BLOCKED sobrevive a la terminación del proceso dueño y obliga a la siguiente invocación | P07-09; P07-13/14 como caracterización del ciclo de vida de locks/procesos | Cutpoint real del producto; crash de proceso distinguido de fixture sembrado; proceso independiente posterior que observa BLOCKED; evidencia de que el estado no dependía solo de memoria/descriptor del dueño | P05 durable + R1 + mecanismo implementado. Sin estado post-crash observado por proceso nuevo: UNKNOWN/STOP |
| O2 | Una invocación nueva descubre el estado previo sin inferirlo por PID, edad o ausencia | P07-09/12/14 como caracterización de crash, sustitución y lifecycle | Nueva invocación independiente; identidad/estado leído; resultado para presente, ausente, sustituido, ilegible y tipo inesperado; no usar PID/TTL como autorización | O1/O3/O5. Si la nueva invocación solo mira el nombre actual o presupone quiescencia: UNKNOWN/STOP |
| O3 | La coordinación conserva identidad verificable del objeto y del namespace relevante | P07-01/11/12/15/16/21 | Baselines y post de fd, identidad contextual, nombre, namespace, aliases y nlink por rol; R-OBJ y R-NAME separados donde aplique | P07-A y R1. Hash o inode aislado, o dirfd sin continuidad del nombre, no basta: UNKNOWN/STOP |
| O4 | Cleanup/release afecta exclusivamente el objeto atribuido y adquirido | P07-05/06/07/18b/19/21 | Seam dentro del producto entre última verificación y syscall destructiva; actor B clasificado antes; centinela independiente; syscall/objeto exactos; nombre, identidad y nlink pre/post | P07-C, P05-C, P09 y modelo R1. Sin seam interno o atribución demostrada: no cleanup destructivo; UNKNOWN/BLOCKED |
| O5 | Pérdida, sustitución, ilegibilidad o desaparición no habilitan readmisión | P07-07/09/12/13/14/19 como subcasos de residuo, crash, sustitución y cleanup | Matriz de estados/error; intento de readmisión desde proceso nuevo; BLOCKED conservado en cada condición; sin retry implícito ni borrado por nombre | P05 durable + O1/O2/O3/O4/O6. Cualquier caso no probado: UNKNOWN/STOP; ausencia no es prueba de liberación |
| O6 | Solo un procedimiento aprobado puede reclasificar BLOCKED y permitir readmisión | No existe un escenario P07 único que sustituya este requisito de autoridad/procedimiento | Procedimiento normativo explícito; autoridad competente; predicados de elegibilidad; evidencia revisada; registro auditable; demostración de que el caller no puede autocertificar la reclasificación | Decisión del propietario y P05. Sin procedimiento aprobado: BLOCKED; no diseñar recuperación implícita |
| O7 | Cada caller/writer dentro del universo declarado atraviesa la frontera aplicable | P07-05/06/08/16/18b/19/21 + censo P09 | Grafo de callers/exports/wrappers/entrypoints/workflows; aristas a cada I/O; fixtures de bypass; clase COVERED/RAW/PRIVILEGED/UNCLASSIFIABLE fijada antes del caso | P09. Loaders dinámicos y consumidores externos no identificados permanecen UNKNOWN; no claim universal |
| O8 | Las garantías se sostienen en el entorno R1 declarado y observado | P07-04/22 como evidencia de ownership/permisos y límites de actor; E2/E3 como gate operacional | Fingerprint de target (filesystem, kernel/API, UID/GID, permisos); actores/launchers relevantes; evidencia de control dentro de una ventana R1; cambios del entorno registrados | R1 aceptado + E2/E3. Snapshot aislado o fingerprint sin control sostenido no cierra: PARTIAL/UNKNOWN |
| O9 | Commit de negocio, release de admisión y readmisión son resultados independientes | P07-09/20 como evidencia auxiliar de crash y fsync; no hay sustituto P07 único | Oráculos separados para commit/persistencia, release, estado BLOCKED y readmisión; resultados y errores independientes; fsync de archivo/directorio solo si el claim lo exige | P05 + P03/P04. Un campo combinado o un commit exitoso no prueba release; mezcla de resultados: INVALID/UNKNOWN |

### G.1 Núcleo bloqueante P07-C — no sustituible por resultados parciales

Los escenarios P07-05/06/07/16/18b/19/21 forman el conjunto de oráculos de especial relevancia para atribución, sustitución, nombre protegido y cleanup. La lectura admisible debe conservar estas diferencias:

- **P07-05/06:** el seam debe estar dentro del producto; SERIALIZATION para COVERED puede ser resultado intermedio. RAW no demuestra enforcement.
- **P07-07:** token, nombre, PID o hash no atribuyen por sí solos un residuo; huérfano UNKNOWN se conserva.
- **P07-16:** R-OBJ y R-NAME son independientes. Detección + STOP es DETECTION_ONLY, no PASS_GATE.
- **P07-18b:** rename normal puede desplazar el nombre del centinela; RENAME_NOREPLACE caracteriza una primitiva, no cierra por sí solo el gate.
- **P07-19:** demostrar en la secuencia real fallo → sustitución → cleanup; separar temporal de producto, temporal interno de librería, centinela B y cleanup owner.
- **P07-21:** observar n1, n2, fd y nlink por separado; disminuir nlink al eliminar un nombre no autorizado es afectación aunque el inode sobreviva.

Para todos los escenarios, `harness_verdict`, `result_class` y `product_state` permanecen campos independientes. `PASS_GATE` requiere `gate_basis`, dependencias cerradas, actor clasificado antes de ejecutar, controles válidos y evidencia del producto en el SHA evaluado. `DETECTION_ONLY`, `RETENTION_VERIFIED`, `PASS_CARAC` y `SERIALIZATION` intermedia no se renombran como `PASS_GATE`.

### G.2 Resultado de la evaluación actual

- La propuesta P05 técnica del 2026-11-03 ya registra las políticas A/B/C; C fue ratificada después como política fail-closed. Esto no selecciona una arquitectura ni un mecanismo técnico. **Ningún candidato completo está demostrado admisible frente a O1–O9**.
- Mecanismo seleccionado: **NINGUNO**.
- Harness: **NO IMPLEMENTADO**.
- Escenarios P07-01…22: **NO EJECUTADOS** en esta línea de evidencia.
- O4/O5: **NOT SATISFIED** por los seams del snapshot estático `d8b5ca8720908d926acc18130614cce132a43b5d`.
- O1/O2/O3/O6/O7/O8: **UNKNOWN**; O9: **PARTIAL**, conforme a la reconciliación estática citada en §D.1.
- P05-C RATIFICADA / P05 OPEN; P07-C UNKNOWN/BLOCKING; P09 OPEN/UNKNOWN; E2/E3 PARTIAL/NOT CLOSED; M0 INCOMPLETO.
- Esta matriz no autoriza selección, implementación, harness, tests, CI, Termux/POCO, bootstrap, cleanup, readmisión ni efectos protegidos.
