# NCS M0 — reconciliación de hallazgos de Perplexity sobre exclusión y estado de decisiones

**Fecha:** 2026-10-27  
**Rama:** `ncs-clean-architecture`  
**Tipo:** reconciliación documental acotada  
**Estado:** DOCUMENTAL — NO RATIFICA CONTRATO — NO IMPLEMENTADO — NO EJECUTADO

## 1. Propósito

Contrastar los hallazgos recibidos de Perplexity con los archivos fuente actuales de la rama. No se ejecutó código, pruebas ni CI. Esta nota no cambia decisiones constitucionales, no autoriza bootstrap ni implementación y no reabre auditorías generales.

## 2. Fuentes verificadas en la rama

- `NEXO_NCS/BUILD/NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md`, blob `3c48fadfaeaa7dfbbee01bd40d619bdbf9da2c83`.
- `NEXO_NCS/BUILD/NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`, blob `7dfd8058bad81c4cb70eb16c2c71e2d0f870d973`.
- `NEXO_NCS/BUILD/NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md`, blob `e37a98ecfe1dcdccfef3cb0c5c98e0f2cb7d1287`.
- `NEXO_NCS/BUILD/NCS_M0_EXPLICIT_BOOTSTRAP_CONTRACT_PROPOSAL_2026-10-26.md`, blob `f6d953c448aa91eee4193317cd060320bcc83d40`.
- `NEXO_NCS/BUILD/NCS_M0_D3_LEGACY_WRITER_QUIESCENCE_EVIDENCE_PROTOCOL_2026-10-23.md`, blob `a1804c3128692abb856f5169be5f8c21729508f3`.
- `NEXO_NCS/BUILD/NCS_M0_P01_SCOPE_VS_INITIALIZATION_DECISION_RECONCILIATION_2026-10-27.md`, blob `a1d7d2df97034d6908be14fbfb684cdb27a22dad`.
- La reconciliación de exclusión existente: `NCS_M0_CONTINUITY_BOOTSTRAP_EXCLUSION_MODEL_RECONCILIATION_2026-10-27.md`, blob consultado `ff5b4b3085dd5c4ec333b9a67452a6028189d325`.

Los SHA anteriores son blobs de los archivos consultados; no deben confundirse con el SHA del HEAD de la rama.

## 3. Hallazgos contrastados

### 3.1 Regla de no sobrescritura omitida de la lista de fuentes

La decisión `NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md` se declara en su encabezado **“Decisión de diseño aceptada por el propietario; pendiente de incorporación/verificación en el estado canónico”**. Su regla 4 indica: “si otro escritor crea o cambia el estado durante la inicialización, detectar el conflicto y no sobrescribir su resultado”. La regla 2 deja por definir y verificar las condiciones de exclusión de escritores concurrentes.

**Conclusión limitada:** es un requisito de comportamiento relevante que faltaba en la lista de evidencia de la reconciliación de exclusión. No delimita qué escritores quedan cubiertos, no prueba implementación y su propio encabezado advierte que su incorporación/verificación canónica sigue pendiente. Se debe citar como decisión de diseño aceptada declarada en ese documento, con esa salvedad; no elevarla silenciosamente a política de exclusión completa.

### 3.2 La pregunta de cobertura sigue abierta

El registro D0–D3, §2 (P-HIST-07) prohíbe prometer defensa universal frente a filesystem hostil/TOCTOU en el modelo de rutas; no determina si escritores locales benignos pero no cooperativos deben estar cubiertos en la primera publicación de Continuity. El mismo registro, §3 (P-HIST-08), dice que no se debe asumir que los accesos actuales de `assistants.mjs` y `simulate.mjs` estén bloqueados y requiere decidir su contrato o exclusión explícita y probarlo.

La línea de meta, §C.9, exige un protocolo aprobado para raíz ausente y creación concurrente, pero no define por sí sola el conjunto de escritores. Por tanto, la pregunta central permanece **UNKNOWN**: la regla de no sobrescritura define el resultado esperado ante conflicto, no el alcance de exclusión ni cómo se demuestra.

### 3.3 D3 no es un protocolo aprobado

El protocolo `NCS_M0_D3_LEGACY_WRITER_QUIESCENCE_EVIDENCE_PROTOCOL_2026-10-23.md` tiene estado explícito **“PROPUESTA DE DISEÑO — NO APROBADA — NO IMPLEMENTADA — NO EJECUTADA”**. La reconciliación anterior lo denominó “fuente canónica para quiescencia/cutover”, formulación excesiva si se interpreta como aprobación. Su uso correcto es referencia/propuesta existente para una fase de migración/cutover, no procedimiento aprobado ni evidencia de quiescencia. No duplicarlo ni extenderlo por analogía al bootstrap inicial.

### 3.4 Contradicción sobre `assistants.mjs` / `simulate.mjs`: alcance exacto

El registro D0–D3 §3 clasifica P-HIST-08 como no resuelto y advierte no asumir que los accesos estén bloqueados. La propuesta de bootstrap describe callers actuales y riesgos de acoplamiento; no constituye por sí misma decisión aceptada de excluirlos. La afirmación de que ambos “no deben entrar en la ruta ordinaria” no se ratifica aquí como decisión canónica porque el registro consultado la marca como propuesta/no resuelta. Se requiere reconciliar la cita exacta del “paquete aceptado en decisiones vs gates” antes de declarar una contradicción definitiva entre fuentes aceptadas.

### 3.5 “Opción A” es ambiguo

Los documentos usan “Opción A” en contextos diferentes. No trasladar una aceptación de alcance no autoritativo, raíz de instancia, bootstrap o exclusión de efectos a otra dimensión solo porque comparte la etiqueta. En las decisiones futuras, referenciar título/ID completo y no solo “Opción A”.

## 4. Clasificación de evidencia

- **Hecho documental:** existe la regla 4 de no sobrescritura en la decisión de estado ausente y el documento se marca pendiente de incorporación/verificación canónica.
- **Hecho documental:** el protocolo D3 está marcado como propuesta no aprobada/no implementada/no ejecutada.
- **Hecho documental:** P-HIST-08 deja sin resolver el contrato o exclusión de los accesos de `assistants.mjs` y `simulate.mjs`.
- **Inferencia no demostrada:** la secuencia `access(filePath)` → escritura temporal → `rename(tempPath, filePath)` puede dejar una ventana de carrera frente a un escritor que ignore el lock. No se reprodujo; no clasificar como vulnerabilidad confirmada.
- **UNKNOWN:** conjunto de escritores que la primera publicación debe excluir; existencia y cobertura de escritores reales en el entorno objetivo; aplicación de cualquier protocolo de quiescencia a ese entorno.

## 5. Correcciones documentales mínimas

1. En la reconciliación de exclusión, añadir `NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md` como fuente relevante, con su regla 4 y la salvedad de que la incorporación canónica está pendiente.
2. Cambiar la descripción de D3 como “fuente canónica” a “propuesta existente de referencia para quiescencia/cutover, no aprobada”.
3. Mantener P-HIST-08 abierto y no describir `assistants.mjs`/`simulate.mjs` como bloqueados ni excluidos hasta que exista una decisión inequívoca y evidencia correspondiente.
4. Conservar explícitamente la pregunta pendiente: **¿qué clases de escritores debe excluir la primera publicación de Continuity dentro del alcance M0 y qué precondiciones de entorno son obligatorias?**

Esta nota registra esas correcciones como hallazgos; no edita retroactivamente los documentos fuente ni declara la pregunta resuelta.

## 6. Próximo paso

No hace falta otra auditoría amplia. Primero, reconciliar en el registro canónico el estado de la decisión de estado ausente y la cita conflictiva sobre `assistants.mjs`/`simulate.mjs`. Después, obtener una decisión explícita del propietario sobre el alcance de escritores o confirmar que el entorno operativo restringido puede definirse y verificarse. Solo entonces congelar los criterios P01-C/D/E/F. Cualquier prueba o cambio ejecutable necesita autorización separada.

## 7. Estado canónico no modificado

- M0: `INCOMPLETO`.
- P-01: `OPEN / UNKNOWN`.
- D0/D1/D2/D3: `OPEN`; D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Autoridad raíz: `PENDING/UNKNOWN`.
- `authorization: NOT_EVALUATED`.
- Primera creación y efectos protegidos: `STOP`.
- Runtime, tests, workflows, configuración ejecutable y dispositivo: sin cambios.
- Tests/CI/Actions: no ejecutados.
