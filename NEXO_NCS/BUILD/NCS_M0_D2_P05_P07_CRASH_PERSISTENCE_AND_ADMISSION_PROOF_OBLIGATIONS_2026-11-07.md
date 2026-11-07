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
