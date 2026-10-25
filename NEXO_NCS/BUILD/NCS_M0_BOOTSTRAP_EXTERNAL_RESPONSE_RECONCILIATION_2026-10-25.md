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


## 10. Verificación documental del límite M1 frente al bootstrap de la raíz (2026-10-25)

### Fuentes inspeccionadas

- `NEXO_NCS/M1_ANDROID/README.md`, blob `70cf0abc5b8902035da7ed67de823ba39c03937b`.
- `NEXO_NCS/M1_ANDROID/app/build.gradle.kts`, blob `5b9006127bfb890431a0cc8cb3e7abd489ad0fdf`.
- `NEXO_NCS/M1_ANDROID/app/src/main/AndroidManifest.xml`, blob `b4bc8281df05460724d775b8a97da924c6a4ea0d`.
- `NEXO_NCS/M1_ANDROID/app/src/main/kotlin/org/nexo/m1/MainActivity.kt`, blob `ce22225a8661a4afa2e7eb1f6b65dfb1b3db26b0`.
- `.github/workflows/nexo-m1-android-build.yml`, blob `b21eb080d9024c7cf580b7f06729bbe65a89cb59`.

### Hechos estáticos observados

1. El módulo M1 es una aplicación Android separada con `applicationId = org.nexo.m1` y una actividad `MAIN/LAUNCHER`; por tanto, Android puede lanzarla como aplicación normal. La mera existencia de este launcher no prueba que la app sea un escritor de la raíz NCS.
2. El manifiesto inspeccionado no declara `android.permission.INTERNET`; la Activity usa inferencia local y declara en su comentario de diseño que no importa el runtime Nexo. Esto es evidencia estática de alcance de app, no prueba de aislamiento de todo el dispositivo ni de comportamiento del APK instalado.
3. El único archivo persistente descrito/observado en la Activity es el modelo, bajo `filesDir` privado de la app (incluye un temporal `model.gguf.part` y destino `model.gguf`). Las escrituras/deletes observadas en este archivo corresponden al aprovisionamiento local del modelo.
4. La Activity invoca `startActivityForResult` con `ACTION_OPEN_DOCUMENT` para que el usuario elija el archivo del modelo. No se encontró en la Activity una ruta hacia `Continuity`, `Chronicle`, `ROOT_READY`, ni una importación del runtime Nexo.
5. El workflow define un build Android y verificaciones estáticas/artefactos; no se ejecutó en esta revisión y no demuestra cuál APK está instalado en el POCO X7 Pro.

### Inferencia acotada

Con la fuente actual inspeccionada, M1 **no está demostrado como el bootstrapper ni como escritor de la raíz NCS**. Por tanto, el ciclo de vida/relanzamiento de M1 no puede usarse por sí solo como prueba de que la opción A sea inviable o viable. El proceso de bootstrap de la raíz y su ubicación operacional siguen sin identificarse en las fuentes revisadas.

La evidencia tampoco permite afirmar que no exista otro launcher, proceso legacy, actor de release/limpieza o mecanismo externo que escriba la raíz. Esa arista permanece `UNKNOWN`.

### Decisión de continuidad

- Mantener opción A `UNKNOWN/BLOCKED`; no seleccionar B/C/D.
- No exigir control absoluto de todos los procesos Android por defecto; identificar primero el proceso real que escribe o lanza escritores de la raíz.
- Siguiente paso: localizar, mediante lectura estática estrecha, el contrato/entrypoint que pretende crear o modificar la raíz y quién lo invoca. Si ningún entrypoint operativo está definido, registrar la ausencia como hueco de diseño y mantener los gates.
- Sin pruebas/CI, sin instalación, sin cambios de runtime ni de dispositivo.


## 11. Entry point operativo encontrado: CLI Node.js, separado del cliente Android (2026-10-25)

### Fuentes inspeccionadas

- `scripts/nexo.mjs`, blob `e471eb478a09aa8a9a8323795583e198cdf0a127`.
- `scripts/nexo-chronicle-session.mjs`, blob `30a53de2f108aa255a1dfd61ce78c19788de160b`.
- `src/nexo/application/chronicle-append.mjs`, blob `5a20044bcddbaee79d0117934eefaea5f3b2c3bc`.
- `tests/nexo/entrypoint.test.mjs`, blob `ff1bd2e9d292e21e00049b354249aee684837bbc`.
- `tests/nexo/root-bootstrap-protocol.test.mjs`, blob `996c031224ba4544d8982ca4fd1762e9d4f44dc0`.

### Hallazgo estático

1. Sí existe un entrypoint operativo de prototipo en `scripts/nexo.mjs`, que delega `chronicle-append` a `scripts/nexo-chronicle-session.mjs` mediante un proceso hijo Node.js.
2. Ese comando acepta rutas explícitas `--continuity` y `--chronicle`, además de `--initialize-continuity` y `--initialize-chronicle`. Las stores tienen inicializadores independientes y el test de entrypoint documenta un caso de bootstrap parcial si Continuity se inicializa pero el destino de Chronicle falla. Esto no constituye un contrato de publicación atómica de una raíz única.
3. El vector `tests/nexo/root-bootstrap-protocol.test.mjs` es prueba software de protocolo con fixtures; su propio comentario indica que no representa la raíz real de Nexo.
4. No se ha identificado en estas fuentes una integración entre la app Android `org.nexo.m1` y este CLI Node.js, ni un servicio/supervisor de despliegue de ese CLI en el POCO. Tampoco se ha demostrado un comando de bootstrap de raíz canónica que controle ambas stores como una única raíz y produzca por sí mismo `ROOT_READY`.

### Consecuencia para la opción A

La pregunta anterior “¿la raíz se ejecutará en el POCO o el POCO será solo cliente?” queda refinada por la evidencia de código: **el cliente Android M1 y el CLI Node.js de stores son componentes separados en el repo; su integración en el POCO no está demostrada**. Por ello no debemos modelar la Activity Android como launcher del bootstrap de stores.

- Para el CLI, la invocación explícita de un proceso Node es un candidato a operación manual, pero el modo de despliegue real, la ubicación de los archivos, los escritores/launchers adicionales y el control sostenido no están acreditados. No certificar A.
- Para Android M1, la fuente actual no crea ni escribe la raíz NCS; su ciclo de vida no es la evidencia de quiescencia que exige A.
- El bootstrap parcial de dos stores y el contrato de raíz/ROOT_READY siguen siendo un hueco de diseño distinto del control de launchers.

### Siguiente paso acotado

No continuar con inventario genérico de todos los daemons Android. El siguiente paso documental es comparar el contrato de raíz/ROOT_READY con el CLI existente y registrar exactamente qué frontera falta: una raíz canónica explícita, la relación entre las dos rutas de store, y el actor autorizado que invoca el bootstrap. No proponer wrapper ni código nuevo sin autorización de implementación. La opción A permanece `UNKNOWN/BLOCKED`; B/C/D no seleccionadas. Sin tests/CI ni cambios de runtime/dispositivo.


## 12. Contraste explícito del contrato `ROOT_READY` con el CLI existente

Fuentes de contrato contrastadas:
- `NCS_M0_D2_BOOTSTRAP_PARTIAL_AND_RECOVERY_CONTRACT_GAP_REVIEW_2026-10-25.md`, blob `e184a52033e265021ee66d6b020fecab6024ed2a`.
- `NCS_M0_D2_BOOTSTRAP_DECISION_REGISTER_CROSSCHECK_2026-10-25.md`, blob `aa9daecccad1aeed39651b19d1a07d1dc051631c`.
- Entry point y stores identificados en §11 de este informe.

### Diferencias observables

| Requisito del contrato | CLI/fuente existente | Evaluación |
|---|---|---|
| Una raíz canónica y transición explícita a `ROOT_READY` | El CLI recibe rutas separadas `--continuity` y `--chronicle`; no se encontró una salida/estado de raíz única `ROOT_READY` en los entrypoints inspeccionados. | No demostrado |
| Inicialización coherente de todas las stores | Flags independientes `--initialize-continuity` y `--initialize-chronicle`; el test documenta que la primera puede persistir y la segunda fallar. | Bootstrap parcial posible; no hay contrato atómico conjunto demostrado |
| Autoridad del invocador y entorno de lanzamiento | El CLI puede invocarse como proceso Node; no hay evidencia de un launcher/supervisor real para el POCO ni de un invocador de bootstrap autorizado. | `UNKNOWN` |
| Quiescencia sostenida durante bootstrap | No forma parte de la evidencia estática de la Activity M1 ni queda probada por la invocación del CLI. | `UNKNOWN/BLOCKED` |
| Identidad/alcance de paths | Los stores declaran que `filePath` es configuración de confianza, no frontera de sandbox, y no reclaman resistencia a symlink/path attacks. | Requiere un contrato de rutas/entorno; no asumir aislamiento por path |

### Conclusión técnica

El bloqueo inmediato no es “Android tiene demasiados daemons” en abstracto. La brecha más temprana es que el repo no demuestra que el bootstrap de stores del CLI sea el bootstrap de una raíz canónica que el sistema operativo del POCO vaya a ejecutar. Antes de medir quiescencia para A, el diseño debe definir esa relación y el actor de invocación.

No crear un wrapper para ocultar esta brecha ni introducir flags/markers nuevos por inferencia. P-01/P-05 siguen pendientes; opción A `UNKNOWN/BLOCKED`; B/C/D sin seleccionar. La tabla es comparación documental, no prueba de ejecución.
