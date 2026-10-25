# NCS M0 — Reconciliación de respuesta externa sobre BOOTSTRAP_PARTIAL → ROOT_READY

Fecha: 2026-10-25  
Rama revisada: `ncs-clean-architecture`  
HEAD verificado antes de esta lectura: `df3c28109c3bfb6415d7e14f4f85a908a41cdb36`  
Estado: **RECONCILIACIÓN DOCUMENTAL — SIN RATIFICACIÓN — SIN IMPLEMENTACIÓN**

## 1. Propósito

Contrastar la respuesta externa que propone predicados para `BOOTSTRAP_PARTIAL → ROOT_READY` contra los artefactos canónicos de bootstrap y P-05. La respuesta se trata como material conceptual: no como auditoría de fuente ni como decisión del propietario.

## 2. Artefactos canónicos contrastados

- `NEXO_NCS/BUILD/NCS_M0_D2_BOOTSTRAP_DECISION_REGISTER_CROSSCHECK_2026-10-25.md`, blob `aa9daecccad1aeed39651b19d1a07d1dc051631c`.
- `NEXO_NCS/BUILD/NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md`, blob `cc7fd62a3228de5808ae339801982a0e614de6b4`.
- `NEXO_NCS/BUILD/NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md`, blob `c80b10def7b1151f6f328088e23d9c67742d00c9`.
- `NEXO_NCS/BUILD/NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md`, blob `e184a52033e265021ee66d6b020fecab6024ed2a`.
- `NEXO_NCS/BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md`, blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c`.

## 3. Discrepancia demostrada: etiquetas A/B/C/D

La respuesta externa asigna:
- A: manual/offline con quiescencia externa.
- B: bootstrap embebido autogestionado.
- C: bootstrap transaccional por etapas.
- D: inicialización pasiva por demanda.

La matriz canónica NCS define:
- A: bootstrap offline con quiescencia externa.
- B: preparación en staging y publicación atómica.
- C: marcador persistente de estado de inicialización.
- D: coordinación externa a la raíz.

A coincide en términos generales. B, C y D **no son equivalentes**. No se deben copiar las etiquetas de la respuesta externa al registro NCS ni usar sus descripciones como si fueran las alternativas canónicas. La matriz canónica no contempla “bootstrap embebido autogestionado” ni “inicialización pasiva por demanda” como las opciones B/D que enumera esa respuesta.

## 4. Clasificación de los predicados propuestos externamente

### 4.1 Integridad de manifiesto / esquema

Es una posible familia de criterios, no un predicado ya ratificado con formato o inventario definido. La matriz y el gap review sí exigen que el protocolo aprobado defina los archivos/layout esperados, la validación de stores y el tratamiento de estados parciales o ambiguos sin sobrescritura ni fusión heurística. No se ha seleccionado manifiesto, checksum ni esquema concreto.

### 4.2 Ausencia de archivos de lock o temporales

La ausencia de una ruta de lock o de temporales no demuestra por sí sola quiescencia, terminación del actor previo, integridad ni autorización de readmisión. La matriz canónica prohíbe declarar `ROOT_READY` solo porque no aparezca la ruta de lock. P-05 §4/E6 también establece que la ausencia del path no basta si no se ha demostrado que el actor previo terminó.

### 4.3 Permisos e “inmutabilidad”

Los permisos pueden ser evidencia auxiliar dentro de un modelo de sistema operativo definido, pero no prueban por sí solos la identidad constitucional, la ausencia de escritores activos ni que launchers/supervisores no puedan reanudarlos. El modelo operacional y la evidencia de control sostenido siguen desconocidos.

### 4.4 STOP antes de ROOT_READY

Es coherente con los gates actuales no admitir operaciones protegidas mientras la raíz legítima siga `PENDING/UNKNOWN` y los efectos protegidos `STOP`. No se demuestra que todos los entrypoints/canales existentes ya impongan esta condición; el documento no debe presentar enforcement runtime como hecho.

### 4.5 Interrupción y recuperación

El contrato de bootstrap ya clasifica el fallo parcial como `BLOCKED/UNKNOWN` y exige recuperación explícita, no reparación heurística. No se ha demostrado que el runtime detecte todos los cortes, SIGKILL o combinaciones parciales. No se debe afirmar detección implementada ni inventar marcadores, snapshots, épocas, transacciones o protocolos nuevos.

## 5. Obligaciones contractuales que siguen abiertas

La transición no tiene todavía predicados completos ratificados. El protocolo elegido debe resolver, con nombres y evidencia concretos:
1. identidad/estado de la raíz y su relación con la autoridad legítima;
2. quiescencia sostenida: actores que pueden escribir o relanzar, cómo se impide su reanudación durante toda la intervención y qué evidencia lo demuestra;
3. integridad: layout/artefactos esperados, validación de stores y clasificación de combinaciones parciales/ambiguas;
4. exclusión y competencia durante bootstrap;
5. interacción con actores anteriores de release/limpieza y P-05;
6. resultados diferenciados: `ROOT_READY`, rechazo de la operación actual o `UNKNOWN/BLOCKED`, sin confundir persistencia, release y readmisión;
7. pruebas reproducibles vinculadas al SHA de implementación, solo después de autorización independiente.

La lista anterior consolida requisitos documentales ya presentes; no aprueba un mecanismo ni crea un protocolo nuevo.

## 6. Estado de decisión y gates

- O-08: ratifica raíz explícita única `--root`, sin bootstrap implícito; no selecciona el protocolo de bootstrap.
- P-01: pendiente; no existe selección documentada de A/B/C/D.
- P-05: pendiente; sus requisitos de evidencia no seleccionan una política de recuperación/readmisión.
- M0: `INCOMPLETO`.
- D0/D1-DESIGN/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

## 7. Acciones realizadas y límites

Solo se realizó lectura documental y reconciliación. No se modificaron runtime, tests, workflows ni datos operativos. No se ejecutaron tests ni CI. No se seleccionó una alternativa ni se autorizó implementación.

## 8. Siguiente paso

Seguir desde `NEXO_NCS/STATUS.md` y la matriz canónica. Antes de pedir una decisión al propietario, formular únicamente las preguntas operacionales que distinguen las alternativas canónicas: si la primera instalación puede exigir operación offline con quiescencia demostrable, y qué evidencia real puede producir el entorno para demostrar control sostenido de writers/launchers. No presentar la selección como urgente si el entorno todavía es desconocido; conservar `UNKNOWN/BLOCKED`.
