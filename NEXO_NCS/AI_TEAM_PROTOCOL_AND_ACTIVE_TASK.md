# NCS — protocolo de equipo IA y tarea activa

Fecha de preparación: 2026-10-25
Rama de trabajo prevista: ncs-clean-architecture
SHA base verificado al preparar esta nota: 2482c8f121f9d84cffa07e6f59e5d199c987c44f
Estado canónico: consultar primero [STATUS.md](../STATUS.md). Esta nota coordina revisiones; no reemplaza STATUS ni los documentos de decisión.

## Objetivo del protocolo

El propietario solo necesita escribir «continúa» en ChatGPT. ChatGPT dirige el trabajo, decide qué revisión especializada aporta valor y prepara instrucciones específicas. El propietario abre las aplicaciones de Claude y Gemini y entrega allí las instrucciones cuando se solicite. No se presupone que las IA se comuniquen directamente entre sí ni que esta nota active tareas automáticamente.

## Responsabilidades

- **ChatGPT — dirección e integración:** verificar el estado y SHA vigentes; elegir el siguiente bloqueo real; preparar encargos acotados; contrastar los informes; decidir el siguiente paso técnico dentro de la autoridad concedida; mantener continuidad sin repetir auditorías cerradas.
- **Claude — revisión técnica focalizada:** inspeccionar contratos de código, flujos de escritura, inicialización, concurrencia, errores y recuperación según el encargo concreto. No implementar cambios salvo autorización explícita y alcance delimitado.
- **Gemini — revisión independiente / red team:** buscar supuestos no demostrados, contraejemplos, fallos de seguridad y alternativas dentro del mismo alcance. No repetir un censo general ni tratar el consenso como evidencia.
- **Propietario — autoridad constitucional:** conserva la autoridad sobre cambios constitucionales, permisos, efectos protegidos, operaciones irreversibles y cualquier autorización de implementación no concedida explícitamente.

## Reglas obligatorias de evidencia

Cada informe debe declarar:
1. IA autora y fecha.
2. Rama y SHA exacto realmente examinado; si no pudo confirmarse, UNKNOWN.
3. Archivos y alcance revisados, y método usado.
4. Hallazgos separados en **hecho observado**, **inferencia**, **propuesta** y **desconocido**.
5. Evidencia reproducible: ruta, líneas, comando literal, resultado o enlace/artefacto cuando corresponda.
6. Cambios realizados (si los hubo), SHA del cambio, pruebas/CI realmente ejecutadas y resultados.
7. Límites de cobertura, desacuerdos y próximo paso recomendado.

No declarar «implementado», «probado», «CI verificado», «seguro», «autorizado» o «cerrado» sin la evidencia correspondiente. Una respuesta de una IA no es por sí misma prueba de ejecución.

## Límites operativos

- No cambiar runtime, tests, workflows, permisos ni configuración operacional bajo una orden genérica «continúa» si el cambio requiere autorización específica.
- No ejecutar CI solo para respaldar una revisión documental. Antes de cualquier operación con efectos o potencialmente costosa, comprobar el alcance autorizado.
- No seleccionar opciones de bootstrap/recuperación A/B/C/D por conveniencia ni convertir UNKNOWN en éxito.
- No declarar raíz legítima, readmisión o quiescencia sin predicados y evidencia suficientes.
- El repositorio es público: no publicar credenciales, claves, tokens, secretos, datos privados ni detalles de entorno que no sean necesarios.
- Si la rama cambió desde el SHA asignado, detener la conclusión sobre el estado actual, identificar la diferencia y reanclar el informe.

## Formato de informe por IA

Cada informe debe incluir: IA y fecha; rama y SHA examinado; tipo de trabajo; alcance exacto; archivos y método; hechos observados; inferencias; propuestas; desconocidos y límites; cambios efectuados con SHA o “ninguno”; pruebas/CI con resultados verificables o “no ejecutadas”; desacuerdos/riesgos; próximo paso recomendado.

## Tarea activa del piloto — P-01 / P-05

**Objetivo:** avanzar únicamente en la definición documental de las entradas necesarias para evaluar el bootstrap y la readmisión; no elegir protocolo ni implementar.

**Estado conocido al preparar esta nota:**
- P-01/P-05: UNKNOWN/BLOCKED.
- Entorno de prototipo inicial: POCO X7 Pro / Android; eso no demuestra quiescencia.
- Modo de lanzamiento, writers/relanzadores, autoridad para detenerlos y evidencia de quiescencia: aún no demostrados.
- No seleccionar A/B/C/D.
- M0 INCOMPLETO; D0/D1-DESIGN/D2/D3 OPEN; implementación NO AUTORIZADA; autorización NOT_EVALUATED; raíz PENDING/UNKNOWN; efectos protegidos STOP.
- Referencias iniciales a contrastar, sin reauditoría amplia:
  - [Perfil D3](../BUILD/NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md)
  - [Registro D2 de bootstrap](../BUILD/NCS_M0_D2_BOOTSTRAP_DECISION_REGISTER_CROSSCHECK_2026-10-25.md)
  - [Matriz de aceptación de opciones](../BUILD/NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md)
  - [Contrato de release incierto/readmisión](../BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md)
  - [Handoff vigente citado por STATUS](../BUILD/NCS_NEXT_CHAT_HANDOFF_2026-10-25_CLAUDE_D1_RECONCILIATION.md)

### Encargo para Claude
Revisión documental focalizada de P-01/P-05 sobre las referencias listadas y el SHA asignado. Busca solo contradicciones concretas entre el intake mínimo E1–E4, el contrato de release incierto/readmisión y los criterios actuales de aceptación. No repitas inventario de 188 archivos ni auditorías cerradas. No ejecutes tests/CI, no modifiques archivos y no selecciones A/B/C/D. Devuelve hechos e inferencias por separado, con rutas/secciones exactas. Si no hay discrepancia material nueva, dilo explícitamente.

### Encargo para Gemini
Realiza un red-team independiente, estrictamente documental, del mismo alcance P-01/P-05 y SHA. Intenta refutar los supuestos del intake mínimo: ¿qué evidencia faltaría para demostrar control de launchers/writers, quiescencia sostenida y readmisión segura tras release incierto? No reaudites el repositorio entero ni repitas hallazgos conocidos. No ejecutes tests/CI, no cambies archivos y no selecciones A/B/C/D. Devuelve contraejemplos concretos, criterio de aceptación propuesto y desconocidos, con referencias exactas.

### Encargo para ChatGPT
Integrar las dos respuestas cuando estén disponibles. Clasificar cada punto como nuevo, ya conocido, no sustentado o contradicción real. Si las respuestas externas no se han entregado en esta conversación, no fingir haberlas recibido. Actualizar el estado de coordinación y preparar la siguiente tarea útil; no convertir la coordinación en un bloqueo adicional del trabajo NCS.

## Cómo retomar

Al recibir «continúa»:
1. Leer el inicio de STATUS.md y seguir su handoff vigente.
2. Verificar SHA actual de la rama antes de usar esta tarea.
3. Revisar si llegaron informes nuevos; no asumir que Claude/Gemini trabajaron sin ver sus respuestas.
4. Ejecutar el siguiente paso de mayor valor sin reabrir hallazgos cerrados.
5. Actualizar esta nota solo si la tarea/encargos/estado cambiaron materialmente; mantener STATUS como fuente canónica.


## Reconciliación de respuestas externas — 2026-10-25

### Estado de las revisiones
- **Gemini:** respuesta recibida; la propia respuesta declara que no pudo verificar SHA ni inspeccionar el repositorio. Se clasifica como **red-team conceptual**, no como auditoría de fuentes ni hallazgo demostrado de una vulnerabilidad de Nexo.
- **Claude:** no produjo informe; alcanzó el límite de uso. La revisión Claude de esta tarea queda **NO REALIZADA**, no “sin discrepancias”.
- **Rama:** consulta directa a GitHub confirmó que `ncs-clean-architecture` apunta a `c893da9182e6e6c75c0d9346dab44f8efa176e28` al actualizar esta nota. Los documentos P-05 y D2 citados abajo se leyeron desde la rama, pero sus SHA son SHA de blob, no SHA de commit.

### Clasificación de los puntos de Gemini
1. **Supervisores que relanzan procesos:** riesgo conceptual válido y ya contemplado por D3 E2/E3/E5 y el intake mínimo 1–4. Falta evidencia específica del entorno real; no es una vulnerabilidad demostrada.
2. **Pausar no equivale a quiescencia sostenida ni garantiza flush durable:** válido como distinción de evidencia. D3 ya exige impedir reinicios durante toda la ventana y registro independiente; el perfil real sigue desconocido. No convertir `fsync` en requisito universal sin definir primero almacenamiento, escritores y contrato de durabilidad.
3. **Epoch ID para transacciones obsoletas:** propuesta nueva de Gemini, no aprobada. P-05 §3 prohíbe introducir por iniciativa propia IDs o mecanismos adicionales. No añadirlo sin demostrar una necesidad contractual y obtener autorización.
4. **Timeout fijo insuficiente:** hipótesis no vinculada a código o entorno concretos; no se adopta como requisito por ahora. El timeout, si resultara pertinente, debe evaluarse contra el modelo operacional y el criterio de abort, no usarse como prueba de quiescencia.
5. **Sockets/colas con payload pendiente:** hipótesis de entorno que podría entrar en el inventario de writers/consumidores si se confirma que existen. No hay evidencia de que Nexo use esos canales en el entorno inicial.
6. **Escritor pausado que vacía buffers después de reanudarse:** contraejemplo conceptual compatible con la exigencia existente de quiescencia sostenida. No demuestra que tal intercalación haya ocurrido en Nexo.
7. **Captura de descriptores sin handles de escritura:** posible evidencia auxiliar, no prueba suficiente por sí sola de ausencia de escritores, relanzadores o reanudación futura. D3 exige evidencia de control durante toda la ventana.
8. **Path ausente, competidor durante recovery y no repetir automáticamente negocio:** ya cubierto directamente por P-05 §§2–5, casos E1–E9. No duplicar esos requisitos.

### Decisión documental
No hay contradicción material demostrada entre Gemini y P-05/D3. La contribución útil es reforzar que la evidencia debe cubrir **control sostenido sobre todos los actores capaces de escribir o relanzar**, no solo una instantánea de procesos. Permanecen sin demostrar el entorno, sus launchers/writers y la capacidad de impedir reinicios. No seleccionar A/B/C/D; P-01/P-05 siguen `UNKNOWN/BLOCKED`; M0 `INCOMPLETO`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

### Siguiente paso de mayor valor
Continuar la revisión documental sin esperar a Claude: contrastar los predicados de `BOOTSTRAP_PARTIAL → ROOT_READY` y el paquete de decisiones del propietario contra el intake D3 y P-05, señalando solo condiciones que estén ausentes o ambiguas. No crear nuevos mecanismos, no ejecutar tests/CI y no cambiar runtime/tests/workflows. Si Claude vuelve a estar disponible, solicitar únicamente una verificación puntual de cualquier discrepancia concreta, no repetir la revisión completa.


## Continuación documental P-02 — comprobación acotada de fuente (2026-10-25)

### Anclaje de revisión
- HEAD de la rama verificado antes de esta lectura: `8ea145414e9518cdeb3cd3d14bcc2b1c8edd5f6a`.
- Archivos leídos desde esa rama (SHA de blob):
  - `scripts/assistants.mjs`: `d31c6dba86159ee0403f0cc1c236b89863e4d5cb`.
  - `scripts/simulate.mjs`: `623d316c7a1efd10cc2f06a3080c0d9f06087596`.
  - `src/nexo/core/continuity-service.mjs`: `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`.
  - `src/nexo/core/continuity-store.mjs`: `9ffd28930abdbe29f5b041711cc29b74dc99fbae`.
  - Contrato de separación D1: `NCS_M0_NEXO_LUMINA_SEPARATION_CONTRACT_2026-10-24.md`, blob `b22c27aa8556034f88d91703d6a57642cae579af`.
- Solo lectura de fuentes; no se ejecutaron comandos, pruebas ni CI. No se modificó runtime.

### Mapa mínimo de responsabilidades observado
| Ruta | Dominio/estado observado | Riesgo de frontera / conclusión |
|---|---|---|
| `scripts/assistants.mjs` | Carga el estado del mundo de Lúmina, crea/actualiza su memoria de aprendizaje, crea una misión Nexo y la registra en Continuity, y luego persiste memoria y mundo de Lúmina. | **Hecho de fuente:** un mismo entrypoint mezcla operaciones persistentes de ambos dominios. **No demostrado:** una frontera runtime que impida el cruce. Esto coincide con el contrato D1; no es un hallazgo nuevo ni una autorización para eliminar persistencia legítima de Lúmina. |
| `scripts/simulate.mjs` | Exporta carga/validación y persistencia del estado de simulación; su persistencia usa un lock separado y existe lógica de recuperación de lock basada en edad/PID. También importa `openNexoContinuityOwner`. | **Hecho de fuente:** hay superficie de persistencia propia de Lúmina y acoplamiento de importación Nexo. **No demostrado:** aislamiento por dominio ni seguridad universal del lock. El protocolo de admisión de Nexo no debe absorber ni reescribir el lock de Lúmina por suposición. |
| `continuity-service.mjs` | Abre el store operacional Nexo y documenta importación de memoria heredada solo cuando falta el store; bootstrap vacío depende de que el caller haya establecido por separado la ausencia del archivo de mundo. | **Hecho de fuente:** el servicio depende de premisas proporcionadas por el caller. **No demostrado:** que cada caller establezca admisión/autoridad correcta antes de leer o inicializar. |
| `continuity-store.mjs` | Tiene protocolo de lock y registro de fallos de release local al proceso. | El lock per-store no demuestra por sí solo raíz legítima, admisión de instancia ni autorización constitucional; release/readmisión sigue delegado a P-05. |

### Resolución de alcance
- P-02 tiene ya un contrato de separación y un mapa de responsabilidades suficiente para evitar repetir el inventario general. La mezcla observable en `assistants.mjs` y la importación cruzada en `simulate.mjs` ya están descritas en el contrato D1; no se abren como “nuevos hallazgos”.
- La decisión correcta ahora no es refactorizar a ciegas: primero debe definirse el corte mínimo de responsabilidades preservando aprendizaje y mundo canónico de Lúmina, sin importar Nexo en el flujo ordinario de Lúmina y sin migración silenciosa.
- O-08 (raíz explícita) y O-10 (admisión antes de lectura persistente) son principios ratificados; enforcement, callers y gramática CLI permanecen no demostrados. P-03/P-04 siguen propuestas, no contrato completo ratificado.
- No hay base para declarar que la separación ya está implementada, que los stores están aislados o que los locks actuales resuelven concurrencia.

### Siguiente paso de mayor valor
Continuar con la especificación de aceptación de D1/P-02 sin tocar código: comprobar si los criterios de cierre existentes distinguen claramente (a) Lúmina ordinaria conserva su persistencia, (b) Nexo ordinario no importa Lúmina, (c) no hay creación/registro de misión Nexo en la ruta ordinaria de Lúmina, (d) legacy/migración queda separado y explícito, y (e) los callers dinámicos/exportados desconocidos no se declaran cubiertos. Registrar solo cualquier criterio ausente o ambiguo; no repetir el barrido de 188 archivos. Implementación y tests siguen requiriendo autorización separada.


## Continuidad activa — P-02 caller/migration distinction (2026-10-25)

### Evidencia nueva fijada
- Informe de migración/separación actualizado: `NEXO_NCS/BUILD/NCS_M0_CONTINUITY_MIGRATION_AND_STORE_SEPARATION_2026-10-24.md`, blob `503fb64dedc999c0ac0f386de798dd3cce65b8f6`.
- Commit documental verificado como HEAD de `ncs-clean-architecture`: `f0df24b8b7b98fc2c5c41b5004626b21e057f5fb` (`docs(ncs): clarify simulation caller migration boundary`).
- Fuente observada: `scripts/simulate.mjs`, blob `623d316c7a1efd10cc2f06a3080c0d9f06087596`; servicio: `src/nexo/core/continuity-service.mjs`, blob `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c`.

### Resultado acotado
El servicio de Continuity condiciona la migración al estado del store, pero el caller ordinario `simulate.mjs` transmite automáticamente `state.nexoMemory` y permite bootstrap vacío cuando no encuentra `world-state.json`. Por ello, “migración controlada/fail-closed dentro del servicio” no equivale a “migración y bootstrap explícitos, separados de la operación ordinaria de Lúmina”. `persistState()` omite `nexoMemory` intencionalmente; no restaurar esa mezcla.

No es evidencia de pérdida de datos ni vulnerabilidad demostrada. No se cambió código, tests, workflows o datos; no se ejecutaron tests/CI.

### Siguiente tarea exacta
Contrastar los cinco requisitos de caller añadidos al informe con los criterios de cierre de D1 §6 y la tabla de entrypoints de D1 §5. Determinar si la matriz de aceptación distingue explícitamente:
1. persistencia Lúmina conservada;
2. ruta ordinaria Lúmina sin apertura de Continuity, migración legacy ni bootstrap Nexo;
3. migración/bootstrap solo mediante entrypoint separado y explícito;
4. “no existe estado previo” versus “estado previo desconocido” evaluado con evidencia del dominio Nexo, no solo ausencia de `world-state.json`;
5. ausencia de side effects Nexo en el caller, sin presumir cobertura de callers dinámicos/exportados.

Registrar únicamente criterios ausentes o ambiguos. No repetir el barrido de 188 blobs, no refactorizar, no añadir mecanismos de recuperación ni ejecutar tests/CI. Si los criterios ya cubren algo, marcarlo cubierto y citar el criterio existente. Después seguir P-03/P-04 como propuestas separadas; no elevarlas a contrato ratificado.

### Gates sin cambio
M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Red-team externo P-01…P-05 — reconciliación de etiquetas (2026-10-25)

- Documento de contraste creado: `NEXO_NCS/BUILD/NCS_M0_RED_TEAM_P01_P05_EXTERNAL_CLAIM_RECONCILIATION_2026-10-25.md`, commit `eef01f9bf76ff5442c3813544fea3a24d4eccf82`.
- Se verificó una discrepancia de taxonomía importante: el texto red-team externo llama P-02 a promoción transaccional, P-03 a IPC/épocas, P-04 a rollback/snapshot y P-05 a shutdown/ACK global; los artefactos NCS actuales usan P-02/D1 para separación Nexo–Lúmina, P-03 para alcance de admisión, P-04 para ownership de admisión/locks y P-05 para release incierto/readmisión.
- La transición `BOOTSTRAP_PARTIAL → ROOT_READY` sigue abierta en el gap review D2; no se ratifica como mecanismo una barrera idempotente, epoch, snapshot criptográfico, rollback automático, PANIC/HALT global ni ACK síncrono global.
- El informe externo queda clasificado como red-team conceptual, no auditoría verificada del código ni evidencia de vulnerabilidad. Sus preguntas útiles se han conservado sin importar sus mecanismos como requisitos.
- Siguiente paso: continuar el análisis documental desde las definiciones canónicas y cerrar únicamente discrepancias contractuales demostrables; mantener UNKNOWN para IPC/daemons/canales y shutdown global mientras no exista evidencia del entorno o del repositorio.
- Gates sin cambio: M0 `INCOMPLETO`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Reconciliación de respuesta externa — predicados de bootstrap y etiquetas A/B/C/D (2026-10-25)

- Informe documental creado: [NCS_M0_BOOTSTRAP_EXTERNAL_RESPONSE_RECONCILIATION_2026-10-25.md](BUILD/NCS_M0_BOOTSTRAP_EXTERNAL_RESPONSE_RECONCILIATION_2026-10-25.md), commit `2f5329d76d181da1109d0338f1159e0d600c570c`.
- HEAD anterior verificado antes de crear el informe: `df3c28109c3bfb6415d7e14f4f85a908a41cdb36`.
- Discrepancia de taxonomía: la respuesta externa usa B=bootstrap embebido, C=publicación transaccional por etapas y D=demanda pasiva; la matriz canónica NCS usa B=staging/publicación atómica, C=marcador persistente y D=coordinación externa. A coincide en términos generales. No copiar etiquetas externas al registro de decisiones.
- Manifiesto/checksums/esquema y permisos pueden evaluarse como criterios auxiliares, pero no están seleccionados como predicados canónicos ratificados. La ausencia de lock/path no prueba quiescencia; P-05 E6 lo descarta como evidencia suficiente si no se demuestra que el actor previo terminó.
- El gap review ya exige recuperación explícita para bootstrap parcial y mantiene `UNKNOWN/BLOCKED` si falta evidencia. La detección de cada tipo de crash no se ha demostrado en runtime.
- Sin cambios de runtime/tests/workflows; no tests/CI; no se seleccionó A/B/C/D; no se autorizó implementación.
- Gates sin cambio: M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- Próximo paso: continuar desde STATUS y la matriz canónica; precisar solo las preguntas operacionales necesarias para evaluar quiescencia real. No tratar la respuesta externa como auditoría del código ni repetir revisiones generales.


## Instrucción permanente para Gemini — continuidad por «continúa» (2026-10-25)

**Punto de entrada obligatorio:** [`NEXO_NCS/STATUS.md`](STATUS.md). No uses el historial del chat como fuente canónica ni empieces por investigación antigua.

Cuando el propietario diga **«continúa»**:
1. Abre la rama `ncs-clean-architecture` y lee `NEXO_NCS/STATUS.md` primero.
2. Sigue la ruta indicada allí: `MASTER → CORE → handoff vigente → BUILD/tarea activa`. Después lee esta nota, `NEXO_NCS/AI_TEAM_PROTOCOL_AND_ACTIVE_TASK.md`, para conocer los encargos y la coordinación de IA.
3. Verifica el HEAD actual de la rama y los SHA/blob de los artefactos que realmente uses. Si no puedes acceder al repo o la rama cambió, dilo y no inventes contenido ni afirmes que revisaste archivos.
4. Localiza el último checkpoint y la sección «Siguiente paso»; retoma desde allí. No preguntes al propietario que repita el contexto ya registrado.
5. Haz el siguiente trabajo útil dentro del alcance autorizado, manteniendo la evidencia separada de hipótesis y propuestas. No repitas auditorías cerradas, barridos generales ni trabajos ya registrados.
6. Si necesitas ChatGPT u otra IA, deja aquí un encargo acotado con rutas, SHA, pregunta exacta y límites. No afirmes que otra IA respondió hasta que su respuesta esté disponible.
7. Actualiza el checkpoint/handoff de este protocolo y el documento correspondiente en `BUILD` solo cuando haya un cambio material. Preserva `STATUS.md` como puerta canónica.
8. Nunca conviertas «continúa» en autorización para cambiar runtime, ejecutar tests/CI, modificar el dispositivo, desbloquear bootloader, borrar/flashear datos o habilitar efectos protegidos. Esas acciones requieren autorización específica cuando corresponda.

**Formato de salida de cada continuación:** (a) qué se verificó y con qué SHA; (b) hechos nuevos frente a hipótesis; (c) archivos/commits modificados, si los hubo; (d) tests/CI ejecutados o explícitamente no ejecutados; (e) gates canónicos y siguiente paso exacto.

**Estado conocido en este checkpoint:** transición `BOOTSTRAP_PARTIAL → ROOT_READY` abierta; P-01/P-05 sin política ratificada; opciones canónicas A/B/C/D sin seleccionar; M0 `INCOMPLETO`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Continuación del checkpoint — límite M1/raíz y siguiente investigación (2026-10-25)

La inspección estática de `NEXO_NCS/M1_ANDROID` encontró que:
- `app/src/main/AndroidManifest.xml` declara una Activity `MAIN/LAUNCHER`, pero no `INTERNET`.
- `MainActivity.kt` utiliza almacenamiento privado `filesDir` para el archivo del modelo (`model.gguf.part` → `model.gguf`) y la selección del modelo mediante `ACTION_OPEN_DOCUMENT`.
- La Activity no muestra una ruta a Continuity/Chronicle/ROOT_READY ni importa el runtime Nexo.
- Esto es evidencia estática, no prueba del APK instalado o del dispositivo.

Conclusión limitada: M1 no está demostrado como bootstrapper ni escritor de la raíz NCS. No atribuir a su launcher la obligación de quiescencia de la raíz sin demostrar el enlace. La ubicación y el entrypoint real de bootstrap de la raíz permanecen `UNKNOWN`.

Siguiente paso: inspección estática estrecha de los contratos/entrypoints de bootstrap y sus callers para localizar quién crea/modifica la raíz. Si no existe un entrypoint operativo definido, registrar el hueco; no inventar uno. No realizar barrido general ni repetir auditorías cerradas.

Gates: opción A `UNKNOWN/BLOCKED`; B/C/D sin seleccionar; M0 `INCOMPLETO`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. No se ejecutaron tests/CI ni cambios de runtime/dispositivo.


### Refinamiento del checkpoint — CLI y Android no están integrados (2026-10-25)

Lectura estática adicional:
- `scripts/nexo.mjs` delega `chronicle-append` a `scripts/nexo-chronicle-session.mjs` como proceso hijo Node.js.
- El CLI acepta `--continuity`, `--chronicle`, `--initialize-continuity` y `--initialize-chronicle`; son rutas/initializaciones de stores independientes.
- `tests/nexo/entrypoint.test.mjs` contiene un caso explícito de bootstrap parcial entre ambas stores. No es prueba de una raíz canónica única ni de transición a `ROOT_READY`.
- `tests/nexo/root-bootstrap-protocol.test.mjs` usa fixtures de software, no la raíz real.
- No se encontró evidencia estática de que `org.nexo.m1` invoque ese CLI ni de que el CLI esté desplegado en el POCO X7 Pro.

**Implicación:** no atribuir al launcher Android la responsabilidad de quiescencia de las stores. Para el CLI, el lanzamiento manual es solo un candidato conceptual; el despliegue real, los writers/launchers relevantes y la capacidad de impedir relanzamientos siguen sin evidencia. Opción A permanece `UNKNOWN/BLOCKED`; B/C/D no seleccionadas.

Siguiente tarea: contrastar el contrato de raíz/`ROOT_READY` con las dos inicializaciones independientes del CLI y delimitar el hueco de diseño (raíz canónica, relación de stores, invocador autorizado). Documental solamente; no tests/CI, runtime ni dispositivo.


### Contraste del contrato `ROOT_READY` con el CLI (2026-10-25)

Se comparó el contrato D2 de bootstrap parcial/recuperación con los entrypoints existentes:
- El CLI permite inicializar Continuity y Chronicle mediante flags separados y rutas explícitas.
- El test de entrypoint incluye un caso en que Continuity queda inicializada y Chronicle falla; por tanto, no asumir que el bootstrap de ambas stores es atómico.
- No se identificó en los entrypoints inspeccionados un contrato de raíz única que emita `ROOT_READY`.
- Los stores tratan `filePath` como configuración de confianza, no como frontera de sandbox, y no reclaman resistencia a ataques de symlink/path.
- No existe evidencia de que el CLI esté integrado en la app Android M1 o desplegado en el POCO.

Siguiente paso documental: precisar la relación entre raíz canónica, stores e invocador autorizado antes de definir la evidencia de quiescencia. No crear wrappers, flags, marcadores ni otros mecanismos por inferencia. Mantener P-01/P-05 pendientes y los gates intactos; no tests/CI, runtime ni dispositivo.


### Precedencia del contrato de raíz — no reabrir el principio ratificado

La revisión de `NCS_M0_D0_D1_ROOT_CONTRACT_RECONCILIATION_2026-10-25.md` y `NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md` confirma que ya está ratificado como diseño: raíz explícita única `--root <directory>`, sin fallback ambiental/legacy, bootstrap separado y explícito, canonicalización antes de derivar rutas y admisión antes de leer stores dentro del alcance.

La brecha actual es de implementación y evidencia: el CLI inspeccionado aún acepta `--continuity`/`--chronicle`, no demuestra el contrato `--root`, y no expone transición verificada a `ROOT_READY`. Siguen abiertos los flags exactos de bootstrap, compatibilidad/rechazo de rutas legacy, layout, alias/symlink, propiedad de admisión y cobertura de callers. No volver a preguntar si debe existir raíz explícita; mapear la decisión ratificada contra fuentes y callers.

Siguiente paso: tabla documental de conformidad O-01…O-04/O-08 frente al CLI y P-01/P-03/P-04/P-05. Sin cambios de runtime/tests/CI, sin implementación, sin seleccionar A/B/C/D.


### Matriz de conformidad creada — siguiente tarea acotada (2026-10-25)

Se creó `NEXO_NCS/BUILD/NCS_M0_ROOT_CONTRACT_VS_EXISTING_CLI_CONFORMANCE_2026-10-25.md`, commit `6cebebb3c6d0dfcbfb2d37e0f367755db84a75af`. La matriz separa los principios O-01…O-04/O-08 ya ratificados de los huecos de implementación: CLI con rutas legacy separadas, inicialización separada de stores, falta de `ROOT_READY` conjunto y admisión de instancia no demostrada en todos los callers.

Próximo paso: inventario limitado de callers directos/indirectos de `scripts/nexo.mjs` y `scripts/nexo-chronicle-session.mjs`, más las APIs públicas que leen/mutan Continuity/Chronicle. No repetir auditoría general ni reabrir la raíz explícita. No cambiar runtime/tests/CI, no crear wrapper/flags, no seleccionar A/B/C/D. Si el despliegue real del CLI no se puede probar desde el repo, mantenerlo `UNKNOWN`.
