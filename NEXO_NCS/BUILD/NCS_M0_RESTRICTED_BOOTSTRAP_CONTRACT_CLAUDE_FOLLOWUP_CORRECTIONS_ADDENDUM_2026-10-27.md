# NCS M0 — adenda a la propuesta de correcciones mínimas del contrato de bootstrap

**Fecha:** 2026-10-27  
**Estado:** PROPUESTA DOCUMENTAL — NO RATIFICADA — NO APLICADA AL CANDIDATO  
**Base:** candidato revisado, blob SHA `935bfe80f87e33003524afc39e30b7fc98debed6`.  
**Complementa:** `NCS_M0_RESTRICTED_BOOTSTRAP_CONTRACT_MINIMAL_CORRECTIONS_PROPOSAL_2026-10-27.md`, blob SHA `005b7df96de9da61e7976181122a1f733cdae095`.  
**Revisión adicional:** evaluación de Claude recibida el 2026-10-27.  
**Alcance:** añadir únicamente aclaraciones documentales nuevas que no estaban suficientemente resueltas en la propuesta anterior. No modifica el candidato base, no ratifica P-05 ni ninguna decisión pendiente y no autoriza ejecución.

## 1. Regla de continuidad: no repetir investigación

Esta adenda reutiliza las revisiones existentes de Claude, DeepSeek y Qwen, el candidato revisado, P-05 y el Registro D0–D3. No reabre auditorías históricas, STEP 7, inventarios generales ni revisiones de Chronicle/PB-08. Solo se registran las discrepancias concretas que siguen siendo materiales.

## 2. Corrección prioritaria — criterio positivo de persistencia confirmada

**Discrepancia:** el §5 del candidato describe cuándo conservar UNKNOWN y cuándo afirmar un fallo demostrado antes de cualquier escritura, pero no expresa un predicado positivo y verificable para clasificar la persistencia como confirmada. P-05 §2.1 sí contempla la dimensión «confirmado», pero su mención no incorpora por sí sola un criterio de aceptación específico a este contrato de primera publicación.

**Texto propuesto para §5, dentro de “Separación de resultados”:**

> **Persistencia confirmada:** solo podrá clasificarse como confirmada cuando, después de la publicación y antes de dar por terminada la ventana de exclusión, una inspección observable y vinculada al entorno, destino y SHA evaluados permita clasificar el destino como el objeto previsto por el contrato aplicable. La evidencia debe identificar qué se inspeccionó y qué predicado contractual se comprobó. Si la inspección falta, es ambigua, no corresponde al mismo destino/operación o no permite determinar que el objeto previsto quedó publicado, el resultado de persistencia permanece `UNKNOWN`. Esta regla no prescribe una primitiva de filesystem, hash, inode ni mecanismo de verificación concreto.

**Ajuste coordinado:** revisar §3.12 y §4 para que la ventana crítica de vigencia/exclusión incluya esa inspección final y termine solo después de que se haya producido la evidencia correspondiente. No declarar PASS operacional por la mera presencia de un archivo, por el retorno de una llamada no caracterizada o por una comprobación previa de ausencia.

**Límite:** esta cláusula no sustituye la demostración de exclusión durante toda la operación. Una inspección posterior no demuestra por sí sola que ningún escritor no cooperativo pudo interferir. La clase de evidencia que permite demostrar la frontera del entorno sigue pendiente según §4 de esta adenda.

## 3. Corrección — distinguir el fin de la exclusión del release de un lock

**Discrepancia:** el candidato §5 usa “release de la barrera de exclusión”, mientras P-05 §2 define su dimensión de release en términos de confirmación para la misma instancia del lock. El contrato de bootstrap aún no selecciona un mecanismo de exclusión y, por tanto, no debe aparentar que ese mecanismo ya existe o está elegido.

**Texto propuesto para §5:**

> El resultado relativo al fin de la exclusión se registra separadamente del resultado de persistencia. “Fin de la exclusión” designa el evento observable, definido por el contrato final para el entorno seleccionado, mediante el cual termina la ventana en que los escritores relevantes deben permanecer excluidos; no presupone un lock, archivo, token o primitiva específica. Si el mecanismo finalmente seleccionado utiliza un lock, su resultado de release se registra también conforme a la dimensión de release de P-05. No se equiparan automáticamente ambos conceptos.

**Aclaración de readmisión propuesta:**

> Mientras P-05 no esté ratificada y no exista un protocolo aprobado aplicable, la readmisión no se concede por inferencia: permanece `BLOCKED/UNKNOWN`. La incertidumbre de release y la incertidumbre de limpieza deben describirse sin afirmar que son el mismo evento ni asignarles efectos de recuperación no aprobados. No se permite readmisión ni retry automático a partir de la sola ausencia de una ruta o de un lock.

Esta redacción no elige A ni B de P-05, no crea un nuevo estado de runtime y no decide ahora una política de limpieza. La política y los criterios de readmisión permanecen reservados al propietario.

## 4. Corrección — nombrar la evidencia pendiente sobre la frontera del entorno

**Discrepancia:** el candidato §4 exige modelo de amenaza y clases de escritores, pero no identifica con suficiente claridad como brecha de aceptación el tipo de evidencia que permitiría concluir que la frontera del entorno cubre las clases relevantes. La ausencia de una clase en un inventario no demuestra su inexistencia.

**Añadir a la lista de brechas abiertas de §6:**

> Modelo de amenaza aplicable y partición aceptada de clases de escritores incluidas/excluidas, junto con el tipo de evidencia observable que permitiría demostrar la frontera de control del entorno y la exclusión/no reanudación de cada clase relevante. Si el modelo no está identificado/aceptado o una clase capaz de escribir no puede clasificarse, el resultado sigue `UNKNOWN / STOP`.

**No implica:** que solo una afirmación de un operador sea suficiente, que exista un controlador concreto, ni que se seleccione un mecanismo de aislamiento. El contrato final deberá evaluar la evidencia según el entorno real y el modelo de amenaza que se acepte; hasta entonces no se declara satisfecho el requisito.

## 5. Corrección — impedir que PASS o persistencia confieran autoridad

**Discrepancia:** la fila “Autoridad” de §2 enumera señales que no constituyen autoridad, pero la lista no excluye expresamente PASS documental/operacional, evidencia de exclusión, persistencia confirmada ni permiso técnico de ejecución como sustitutos de autoridad legítima.

**Añadir a la lista negativa de §2:**

> Ningún PASS documental u operacional, prueba satisfactoria, evidencia de exclusión, confirmación de persistencia, éxito de filesystem ni permiso técnico para intentar una operación constituye por sí mismo autoridad legítima para crear Continuity o ejecutar efectos protegidos. La autoridad debe proceder de la frontera canónica aplicable, si su contrato cubre expresamente la operación y ese reconocimiento independiente está demostrado. Si no se demuestra, se conserva P01-G `PENDING/UNKNOWN` y la operación permanece `STOP`.

**Terminología propuesta para §5:** renombrar “PASS documental limitado” a “Revisión documental limitada” o declarar expresamente que esa etiqueta es una evaluación de calidad del texto, no un PASS de P01 ni un resultado operacional. No cambiar nombres de estados del runtime ni inventar estados nuevos.

## 6. Puntos anteriores: resolución consolidada

- **Objeto existente válido (DeepSeek):** el candidato §5 ya prohíbe reemplazarlo o reescribirlo y mantiene `UNKNOWN / STOP` si el resultado permitido por el contrato/API canónica no puede determinarse. No se propone un estado nuevo; localizar la fuente canónica solo si se necesita cerrar ese caso antes de congelar el contrato.
- **Release y limpieza (DeepSeek):** el candidato separa persistencia, release y readmisión, pero la frase “release/limpieza incierto” puede ocultar eventos diferentes. La aclaración de §3 exige registrar la incertidumbre sin decidir ahora una política distinta ni inventar estados.
- **Integridad post-publicación (DeepSeek/Claude):** se aborda mediante el predicado positivo de §2. No se impone hash/inode universal, ni se trata una comprobación final como sustituto de exclusión.
- **P01-B y P-05 (Qwen):** constan en el cuerpo del candidato. Se recomienda repetir `P01-B = C — no seleccionar todavía` y `P-05 = NO RATIFICADA` en §7 solo como mejora de legibilidad, no como defecto material.
- **PASS documental / operativo:** mantener su separación; ninguno cierra P01-A/B/G ni autoriza creación o efectos protegidos.

## 7. Estado canónico que no debe cambiar

- M0: `INCOMPLETO`.
- P-01: `OPEN / UNKNOWN`; P01-A…P01-H no se cierran por esta adenda.
- P01-B: `C — NO SELECCIONAR TODAVÍA`.
- P-05: `NO RATIFICADA`.
- D0/D1/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Raíz legítima: `PENDING / UNKNOWN`.
- `authorization: NOT_EVALUATED`.
- Primera creación de Continuity y efectos protegidos: `STOP`.
- Entorno real de bootstrap: no identificado/demostrado.
- No se modifican runtime, tests, workflows, configuración ejecutable ni dispositivo.
- No se ejecutan tests, CI ni GitHub Actions.

## 8. Secuencia recomendada sin repetir trabajo

1. Revisar esta adenda junto con la propuesta mínima anterior como un único paquete documental.
2. Aplicar, si se acepta, las aclaraciones al candidato en una revisión documental identificada; preservar el blob base y el historial.
3. Releer únicamente las secciones tocadas del candidato, P-05 §2–§4 y Registro §10.6 para verificar coherencia. No repetir las investigaciones ya cerradas.
4. Mantener el contrato no ratificado, P-01 abierto y la primera creación en STOP. Cualquier ratificación, implementación o prueba dinámica requiere autorización explícita separada.

**Esta adenda no aplica cambios al candidato, no ratifica decisiones, no constituye evidencia operacional y no autoriza la primera creación de Continuity.**
