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

## Salvaguardas de evidencia CV-24–CV-26

- **CV-24:** al evaluar publicación por staging, documentar rutas resueltas, contexto de filesystem/volumen, semántica real de la operación, errores/colisiones y garantía de que lectores no consumen staging. No inferir atomicidad ni durabilidad por nombre de API.
- **CV-25:** etiquetar cada resultado con entorno y alcance. No extrapolar resultados de laboratorio al POCO X7 Pro cuando la afirmación dependa de condiciones específicas no demostradas.
- **CV-26:** ningún resultado aislado puede elevar el estado canónico a `ROOT_READY`; comprobar todos los predicados ratificados y conservar `UNKNOWN/BLOCKED` si falta evidencia.
- Estas reglas no autorizan ejecución, tests/CI, cambios de runtime ni selección de bootstrap A/B/C/D. El estado canónico continúa siendo el de `STATUS.md`.

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


### Checkpoint documentado por ChatGPT — caller y rutas de bootstrap (2026-10-25)

Informe nuevo: `NEXO_NCS/BUILD/NCS_M0_CALLER_INVENTORY_AND_ROOT_PATH_GAP_2026-10-25.md`, commit `d76950dec94367a8cfba2120bd396f69061eb25b`.

Hechos estáticos añadidos:
- Call chain de Chronicle: `scripts/nexo.mjs → scripts/nexo-chronicle-session.mjs → runNexoChronicleAppend → stores`.
- El CLI sigue aceptando `--continuity`/ `--chronicle` y flags de inicialización separados; no demuestra la raíz única `--root <directory>` ratificada como diseño.
- La prueba de entrypoint incluye un caso de bootstrap parcial. Los locks de las stores coordinan participantes cooperativos, no demuestran quiescencia frente a escritores externos.
- No se identificó en los entrypoints examinados un caller de provisioning operativo ni evidencia de integración con M1 Android/POCO.

Próximo paso: establecer si existe despliegue/provisioning operativo que conecte la raíz canónica con las stores y un caller autorizado. Si no existe, registrar el hueco y solicitar evidencia mínima (invocador real, raíz física/rutas derivadas y autoridad para detener escritores). No inventar un entrypoint; no implementar wrapper/flags; no ejecutar tests/CI ni cambios de runtime/dispositivo.

Gates intactos: opción A `UNKNOWN/BLOCKED`; B/C/D sin seleccionar; M0 `INCOMPLETO`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.


### Propuesta de ChatGPT para alcance de pruebas M0 — 2026-10-25 (NO RATIFICADA)

Documento: `NEXO_NCS/BUILD/NCS_M0_OWNER_DECISION_PROPOSAL_CONTROLLED_TEST_SCOPE_2026-10-25.md`, commit `278db1e6e7bd789d59c7e5facf8ab82929f73977`.

Instrucción a Gemini: leer la propuesta y tratarla solo como recomendación de ChatGPT. No registrarla como decisión del propietario, no cambiar el contrato canónico ni los gates. La recomendación es separar el diseño de validación de desarrollo en un entorno controlado de cualquier afirmación sobre el POCO/producción; no modifica los criterios de aceptación de M0. Esperar ratificación explícita del propietario antes de perfilar el entorno como directiva activa, y autorización separada antes de ejecutar tests/CI o tocar runtime/dispositivo. No elegir A/B/C/D por inferencia.

Gates: M0 `INCOMPLETO`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Ningún test/CI ejecutado.


### Directiva activa del propietario — solo diseño documental de validación controlada (2026-10-25)

La ratificación explícita del propietario está registrada en `BUILD/NCS_M0_OWNER_RATIFICATION_CONTROLLED_VALIDATION_DOCUMENTARY_ONLY_2026-10-25.md` (commit de creación `880934725edc14dfc15d4e5c84615b2920f7a818`). Esta directiva prevalece sobre la instrucción anterior de esperar ratificación, pero solo en el alcance indicado aquí.

**Permiso activo:** diseñar documentalmente un posible entorno de validación controlada separado del POCO X7 Pro/producción y redactar una matriz claim → precondiciones → método de evidencia → resultado esperado → límites → condición UNKNOWN/STOP.

**Prohibiciones explícitas actuales:**
- No ejecutar tests, suites, scripts de prueba ni CI.
- No modificar runtime, tests, workflows ni configuración ejecutable.
- No instalar APK/software/herramientas ni modificar el POCO, Android, OS, bootloader u otro dispositivo.
- No usar claves raíz reales, datos/stores productivas ni efectos protegidos.
- No afirmar que análisis estático o un futuro resultado de laboratorio prueba el despliegue real.
- No elegir A/B/C/D por inferencia, ni cambiar gates, ni habilitar `ROOT_READY`.

**Siguiente tarea documental:** reutilizar los artefactos ya existentes (matriz de opciones de bootstrap, crosscheck, P-03/P-04, P-05, caller inventory, perfil de entorno requerido y protocolo de evidencia de quiescencia) para definir el perfil candidato y la matriz de claims/evidencia. No repetir auditorías cerradas. OS, supervisor, aislamiento, writers externos y cualquier dato ausente deben quedar `UNKNOWN` hasta que haya evidencia.

**Gates canónicos sin cambio:** M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; ninguna opción A/B/C/D seleccionada. No se han ejecutado tests/CI ni se han autorizado cambios de runtime/dispositivo.

Cualquier ejecución de tests/CI, implementación, instalación o acción sobre el dispositivo requiere una autorización separada, específica y explícita del propietario. El equipo de IA debe dejar un handoff con documentos consultados, cambios documentales, incógnitas y siguiente paso; no declarar como ejecutada ninguna validación que solo fue diseñada.

## Registro de continuidad — limitación de acceso de Gemini y siguiente encargo (2026-10-25)

### Resultado recibido
Gemini declaró `UNKNOWN` para SHA, lectura de documentos y todos los puntos CV-24/CV-25/CV-26/P-01/P-05 porque no tenía los archivos en su contexto. Confirmó que no editó archivos ni ejecutó código/tests/CI. **Clasificación:** limitación de acceso/contexto, no hallazgo técnico ni contradicción de diseño; no cuenta como auditoría de fuentes.

### Fuentes disponibles para revisión focalizada
Las siguientes fuentes se leyeron directamente desde la rama solicitada mediante el acceso al repositorio. Los valores siguientes son SHA de blob de archivo, no SHA de commit ni garantía de HEAD:
- Matriz bootstrap/CV-24: blob `25bcb5f6b8e7ed106c245fa21c54a4e335a989c4`; CV-24 líneas 46–59, criterios comparativos 23–32, descarte 74–79. URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md
- Perfil D3/CV-25: blob `7a790ee242d3c32e7bad50f7dfd52ba49f03e989`; E1–E6 líneas 15–60, CV-25 líneas 62–68, intake mínimo líneas 92–102, bloqueo actual líneas 126–127. URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md
- Inventario de callers: blob `e79f8672c5c8b858fffe2015cc18544007449756`; flujo y gap líneas 20–48, evidencia mínima líneas 52–60. URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_CALLER_INVENTORY_AND_ROOT_PATH_GAP_2026-10-25.md
- P-05 release incierto/readmisión: blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c`; dimensiones separadas §§2–3, casos E1–E9 §5, gate §7. URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md
- P-03/P-04 admisión/ownership: blob `baa28e3b868aa0262b9aa9edd837d06938aacd4d`; O-08/O-10/O-11 §2 y alcance/ownership §§3–4. URL: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md

### Instrucción actualizada para Gemini
1. Intenta abrir las cinco URL anteriores directamente. Lee también STATUS y el protocolo del equipo por sus enlaces en la rama.
2. Si las URL no son accesibles desde tu entorno, no repitas una respuesta general de `UNKNOWN`: solicita que se te proporcione solo el extracto exacto necesario de las secciones citadas o analiza los extractos que el propietario te entregue. No afirmes haber leído el repositorio.
3. Limita el trabajo a discrepancias materiales no cubiertas: (a) si CV-24 distingue de forma suficiente atomicidad, durabilidad, integridad y lectores que consumen staging; (b) si CV-25 restringe claims al entorno y a condiciones relevantes; (c) si P-01 exige control sostenido sobre todos los writers/launchers; (d) si P-05 separa persistencia, release y readmisión sin introducir mecanismos no aprobados.
4. Clasifica cada punto `YA CUBIERTO`, `NUEVO`, `CONTRADICCIÓN`, `NO SUSTENTADO` o `UNKNOWN`, con sección/línea y razón. Si no hay hallazgo material nuevo, dilo.
5. No edites archivos, no crees commits, no ejecutes tests/CI/código y no elijas A/B/C/D. No propongas IDs, epochs, tombstones, colas, retries ni coordinadores sin demostrar una necesidad contractual.
6. No repitas inventarios generales ni auditores previos. La respuesta anterior queda registrada como limitación de contexto, no como evidencia técnica.

### Lectura estática preliminar de ChatGPT (no ratificación)
Los documentos ya dicen explícitamente: ausencia de lock/PID aparentemente muerto/marcador `ready` no basta para `ROOT_READY`; la opción B exige contexto real de filesystem, rutas staging/destino, competencia y aislamiento de lectores; la evidencia de laboratorio no se extrapola al POCO si las condiciones relevantes no están demostradas; P-01 pide caller, raíz, writers/relanzadores y capacidad de impedir relanzamiento; P-05 separa resultado de persistencia, release y readmisión y prohíbe readmisión/retry automáticos ante incertidumbre. Gemini debe buscar una omisión concreta, no repetir estos puntos como descubrimientos nuevos.

### Gates sin cambio
M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; A/B/C/D sin seleccionar. No tests/CI ni cambios de runtime/dispositivo.

## Paquete de extractos para Gemini — CV-24/CV-25/P-01/P-05/P-03-P-04 (2026-10-25)

**Propósito:** evitar que la auditoría quede bloqueada por la falta de acceso directo de Gemini al repositorio. Los extractos siguientes se recuperaron desde la rama `ncs-clean-architecture` mediante acceso al repositorio. Los números son líneas del blob citado; los SHA son blob SHA, no SHA de commit ni prueba del HEAD.

### CV-24 — matriz de aceptación, líneas 46–59
Fuente: [matriz bootstrap](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D2_BOOTSTRAP_OPTIONS_ACCEPTANCE_MATRIX_2026-10-25.md), blob `25bcb5f6b8e7ed106c245fa21c54a4e335a989c4`.

> La opción B no se acepta por la mera presencia de `rename`, por una prueba de laboratorio ni por asumir que dos rutas comparten un filesystem. La evaluación documental debe exigir evidencia específica del entorno para:
> 1. Las rutas efectivas de staging y destino, incluida su resolución.
> 2. El filesystem, volumen o montaje relevante y la semántica de publicación aplicable.
> 3. El cumplimiento de los requisitos de la operación elegida (incluido mismo filesystem cuando sea requisito).
> 4. El tratamiento de errores, interrupciones y colisiones, sin inferir durabilidad a partir de atomicidad.
> 5. La garantía de que los lectores autorizados consumen la ruta publicada y no staging.
> 6. La versión, configuración y alcance exacto de la evidencia.
>
> FBE, FUSE, montajes separados y capas de abstracción se evalúan cuando sean pertinentes; su presencia por sí sola no prueba fallo, y su ausencia no prueba seguridad. Si faltan evidencias necesarias, la opción B queda `UNKNOWN/BLOCKED` para ese entorno. No se declara `ROOT_READY`.

Contexto adicional, líneas 23–32: la opción B exige que todos los lectores usen la ruta final y nunca staging; la competencia debe dejar un único publicador ganador sin sobrescritura ni mezcla; se requieren evidencias del filesystem/volumen y competencia, pruebas de crash/colisión tras autorización, y no se promete atomicidad universal.

CV-26, líneas 67–69: ninguna prueba aislada, script, marcador persistente, ausencia momentánea de procesos o resultado de CI produce por sí solo `ROOT_READY`. Se requieren todos los predicados ratificados, incluida autoridad legítima, control de admisión, integridad y garantías pertinentes de concurrencia/recuperación. Si falta una condición, `UNKNOWN/BLOCKED`.

### CV-25 — perfil de despliegue, líneas 62–68
Fuente: [perfil D3](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md), blob `7a790ee242d3c32e7bad50f7dfd52ba49f03e989`.

> Cada evidencia debe identificar el entorno, versión, configuración y alcance que realmente cubre. Un resultado favorable en análisis estático, simulación, laboratorio o en otro dispositivo no demuestra automáticamente las propiedades del POCO X7 Pro. Cuando una afirmación dependa de su filesystem, cifrado, supervisores, políticas de terminación, relanzadores o configuración efectiva, se requiere evidencia operacional pertinente del dispositivo objetivo para sostener esa afirmación.
>
> La equivalencia entre entornos solo puede invocarse si se identifican y justifican las condiciones relevantes para la propiedad evaluada. No se exige ejecutar todas las pruebas en el dispositivo; se prohíbe extrapolar una conclusión que dependa de condiciones no demostradas. Si la equivalencia o la evidencia necesaria falta, el resultado para el entorno objetivo es `UNKNOWN/BLOCKED`.

Contexto E2/E3/E5, líneas 22–52: identificar quién puede detener todos los escritores y launchers y cómo impedir su reinicio; una terminal cerrada no prueba ausencia de servicios/sesiones/relanzadores; launcher desconocido implica `UNKNOWN/BLOCKED`; la ventana debe mantenerse durante toda la copia y validación.

### P-01 — inventario de callers, líneas 44–60
Fuente: [inventario de callers](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_CALLER_INVENTORY_AND_ROOT_PATH_GAP_2026-10-25.md), blob `e79f8672c5c8b858fffe2015cc18544007449756`.

> Los locks de stores solo coordinan participantes que respetan esos locks. No demuestran quiescencia externa universal.
>
> La prueba de entrypoint documenta un escenario de inicialización parcial y un reintento; no prueba el comportamiento en el POCO X7 Pro ni una transacción atómica entre stores.
>
> Sin el caller operativo, la ubicación de la raíz y el propietario autorizado de esas rutas, no es posible definir un predicado empírico completo de quiescencia.
>
> Opción A permanece `UNKNOWN/BLOCKED`; B/C/D no se seleccionan.
>
> Evidencia mínima que falta:
> 1. Identidad del invocador real del bootstrap en el entorno inicial.
> 2. Raíz física prevista y regla para derivar las rutas de Continuity/Chronicle desde ella.
> 3. Lista de actores que pueden escribir o lanzar escritores sobre esa raíz y autoridad para detenerlos.
> 4. Condición observable que mantiene cerrada la admisión durante bootstrap y antes de la readmisión.
> 5. Política ante corte entre inicializaciones, cierre de proceso, lock irresuelto y resultado de persistencia desconocido.
>
> Si el despliegue aún no está definido, registrar explícitamente que no existe caller operativo seleccionado; no inventar uno ni resolverlo añadiendo flags/wrappers por inferencia.

### P-05 — especificación de release incierto/readmisión, líneas 20–39 y 69–88
Fuente: [especificación P-05](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D2_P05_RELEASE_UNCERTAINTY_AND_READMISSION_EVIDENCE_SPEC_2026-10-25.md), blob `5c4b74ecb3924682e5cf3c93275ea40d64be4f8c`.

> Todo resultado posterior a una operación debe conservar separadas estas dimensiones:
> 1. Resultado de negocio/persistencia: confirmado, fallo demostrado antes de cualquier escritura, o `UNKNOWN` si pudo haber escritura y no puede demostrarse el estado final.
> 2. Resultado de release: confirmado para la misma instancia del lock, fallo observado, o incierto.
> 3. Readmisión: permitida solo si el criterio de seguridad elegido y aprobado aporta evidencia suficiente; de otro modo `BLOCKED/UNKNOWN`.
>
> No se permite inferir que un fallo de release significa que la operación de negocio falló. Tampoco que un path de lock ausente, por sí solo, prueba que ningún proceso anterior sigue ejecutando una liberación/limpieza. No se reejecuta automáticamente la operación de negocio para “arreglar” la incertidumbre del lock.
>
> Después de `LOCK_RELEASE_UNCERTAIN` o de una limpieza de bootstrap/owner igualmente ambigua: no iniciar otra operación de negocio mientras la admisión sea incierta; no borrar/modificar un lock por edad, PID aparentemente muerto, owner ilegible o path ausente/reaparecido; no usar una variable local como coordinación interproceso; no introducir por iniciativa propia marcador persistente, lock hermano, tombstone, cola, ID, retry, transacción o servicio de recuperación; preservar el resultado de persistencia observado y exponer release incierto por separado; sin evidencia suficiente, permanecer `UNKNOWN/BLOCKED`.
>
> El resultado debe distinguir persistencia observada, release observado, concesión o no de readmisión y motivo/evidencia faltante. P-05 permanece abierto hasta que se ratifique la política, se escriban los límites del modelo, se resuelva la identidad/propiedad del lock y, tras autorización independiente, se acepten los casos aplicables vinculados al SHA exacto. No se infiere autoridad constitucional a partir de lock, raíz o éxito de filesystem.

### P-03/P-04 — admisión y ownership, líneas 14–21, 27–37, 94–102
Fuente: [especificación P-03/P-04](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/NCS_M0_D2_P03_P04_ADMISSION_SCOPE_AND_LOCK_OWNERSHIP_SPEC_2026-10-25.md), blob `baa28e3b868aa0262b9aa9edd837d06938aacd4d`.

> Decisiones de diseño ratificadas que restringen el diseño: raíz explícita única `--root`, sin override ambiental/fallback legacy; operación normal sin bootstrap implícito; canonicalizar antes de derivar rutas; consultas/previews/Chronicle dentro del alcance pasan por admisión antes de leer datos persistentes; release incierto implica `UNKNOWN/BLOCKED`, sin retry automático ni readmisión hasta resolver la incertidumbre. La raíz o el lock no son autoridad constitucional.
>
> La secuencia propuesta valida argumentos sin abrir stores, resuelve/canonicaliza la raíz, adquiere admisión, y solo después abre/lee stores; conserva admisión mientras se usa el snapshot; captura por separado resultado de negocio/persistencia y release. Si release es incierto, no repite la operación y bloquea readmisión.
>
> Los locks per-store solo coordinan participantes que los respetan; el contexto de CLI no demuestra cobertura de consumidores directos. El contrato de esta especificación está propuesto y no ratificado como contrato completo ni autoriza implementación.

### Encargo para Gemini
Con estos extractos ya no es necesario acceso directo al repositorio para la primera pasada. Clasifica cada punto como `YA CUBIERTO`, `NUEVO`, `CONTRADICCIÓN`, `NO SUSTENTADO` o `UNKNOWN`. Para cada `NUEVO`/contradicción, cita el texto exacto que origina la observación y explica por qué los criterios actuales no lo cubren. Si no hay hallazgos materiales nuevos, indícalo. No reescribas los contratos, no añadas mecanismos por inercia, no edites el repositorio, no ejecutes código/tests/CI y no selecciones A/B/C/D. La falta de acceso previa queda superada para esta revisión por los extractos, pero no equivale a verificación independiente del SHA/HEAD del repositorio.

### Gates inalterados
M0 `INCOMPLETO`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; A/B/C/D sin seleccionar. No tests/CI ni cambios de runtime/dispositivo.


## Revisión documental Claude — informe recibido 2026-10-25

**Estado de la revisión:** informe de solo lectura recibido del propietario. Claude declara haber verificado rama y SHA al inicio y al final: `ncs-clean-architecture @ e30f09b4fdea23fe47798918e8bbbbdea8c70721`; sin modificaciones locales, tests, CI ni ejecución de código. ChatGPT confirmó que ese commit era idéntico al HEAD de la rama antes de esta actualización documental. Los hallazgos que se basan en archivos o líneas no recuperados independientemente por ChatGPT se registran como informes de Claude pendientes de verificación puntual, no como prueba autónoma de código.

### Hallazgos de Claude y tratamiento

- **H1 — semántica ROOT_READY:** discrepancia material entre el estado local/acotado descrito por la reconciliación semántica y CV-26, que agrupaba autoridad legítima, admisión e integridad dentro de la transición. ChatGPT aplica una aclaración documental conservadora en la matriz de aceptación: `ROOT_READY` es preparación local, no legitimidad constitucional; autoridad y efectos protegidos son gates separados. La secuencia completa de admisión sigue abierta; no hay cambio de runtime ni cierre de gate.
- **H2 — colisión de etiquetas:** se propone desambiguar sistemáticamente las familias de etiquetas: `D3-E1…E6`, `P05-E1…E9`, `P01-A…D`, `P05-A/B`, `D2R-A/B/C`. Pendiente de normalización documental coordinada; no reinterpretar decisiones previas por una letra/número sin prefijo.
- **H3 — perfil de entorno E1:** el dispositivo/prototipo descrito no demuestra por sí solo versión/build observada ni qué runtime escribirá Continuity/Chronicle en el POCO. Tratar el intake E1 como parcial hasta aclarar despliegue y caller reales; no extrapolar el CLI Node al teléfono.
- **H4 — intake mínimo D3:** Claude identifica posible inconsistencia entre ítems 1–4 y el mapeo a bloques E; verificar el texto fuente antes de editar. No declarar intake completo por la frase “mínimo 1–4” sin tabla inequívoca ítem→bloque.
- **H5 — actores de release/limpieza y reanudación:** la cobertura de escritores/launchers debe incluir actores que puedan continuar o reanudar release/limpieza, no solo procesos observados en una instantánea. La omisión textual reportada requiere reconciliación; el comportamiento real de ciclo de vida Android continúa `UNKNOWN`.
- **H6 — P-05 E6/E7:** la ausencia de un path no demuestra que el actor previo haya terminado. La verificabilidad de los casos E6/E7 depende de la política de release/readmisión y del modelo de procesos/filesystem, todavía no ratificados. No inventar mecanismo ni declarar estos casos superados.
- **H7 — “descartar A” frente a `UNKNOWN/BLOCKED`:** distinguir falta de demostración (bloqueo) de imposibilidad demostrada (descarte). La ausencia de evidencia no selecciona B/C/D.
- **H8 — pines blob obsoletos:** actualizar o marcar como históricos los SHA documentales que ya no coincidan con la rama; cada pin debe indicar si es blob actual, histórico o SHA de commit. Pendiente de cotejo antes de editar.
- **H9 — callers assistants/simulate:** Claude reporta que `scripts/assistants.mjs` y `scripts/simulate.mjs` pueden inicializar Continuity y no aparecen en el inventario acotado de callers. Verificar los blobs actuales y añadirlos como callers de código, si se confirma, dejando explícito que el workflow de simulación en GitHub no demuestra despliegue en el POCO.

### Orden de trabajo documental

1. La aclaración H1 ya se incorporó en la matriz de aceptación (ver commit registrado en la conversación; confirmar el SHA actual de rama antes de la siguiente edición).
2. Siguiente: verificación puntual de H2/H4/H8 contra los documentos actuales y corrección editorial mínima; cotejar H3/H5 con el perfil D3 y el protocolo de quiescencia; verificar H9 contra los blobs actuales.
3. Después, aclarar E6/E7 de P-05 sin elegir política de recuperación/readmisión. Mantener cualquier mecanismo no ratificado fuera del diseño.
4. Actualizar STATUS/handoff solo después de confirmar las rutas/SHAs y sin reescribir el estado canónico extenso de forma parcial.

### Gates y autorización

Trabajo documental solamente, conforme a la ratificación del propietario del 2026-10-25. No ejecutar tests/CI/código; no modificar runtime/tests/workflows/configuración ejecutable; no instalar ni modificar dispositivo/OS/bootloader; no seleccionar bootstrap o recuperación A/B/C/D. M0 `INCOMPLETO`; D0/D1-DESIGN/D2/D3 `OPEN`; implementación `NO AUTORIZADA`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`. Los hallazgos de Claude no prueban una vulnerabilidad de runtime ni cierran P-01/P-05.


## Encargo Gemini activo — verificación H2/H4/H8 (2026-10-25)

- Issue con instrucciones completas: [#107 — NCS documental: verificación independiente acotada H2/H4/H8](https://github.com/snowdenxrp/aldea-ia/issues/107).
- Alcance: ambigüedad de etiquetas E1–E6 vs. E1–E9 y familias A/B/C/D (H2); mapeo del intake mínimo D3 a bloques E (H4); distinguir pins históricos de referencias activas obsoletas en STATUS (H8).
- Gemini debe confirmar el HEAD real al empezar; el encargo inicial apuntaba a `17440bb18f62e872f05b58fb18fa97b6a964e11e`. STATUS se actualizó después con un cambio exclusivamente documental, por lo que se espera que Gemini ancle su informe al HEAD actual que verifique, no al SHA antiguo.
- No se debe pedir a Gemini una auditoría general ni afirmar que ya respondió. El encargo no modifica el estado canónico ni autoriza tests/CI, runtime, dispositivo o selección de opciones.
- ChatGPT ya verificó los tres artefactos vigentes por lectura de GitHub y corrigió los pins activos de STATUS. Gemini debe servir como refutación independiente y detectar cualquier error restante, no como sustituto de esa verificación.


## Revisión documental de Claude — completitud del inventario de relanzadores (2026-10-26)

**Anclaje remoto comprobado por ChatGPT antes de esta edición:** rama `ncs-clean-architecture`, HEAD `5209aea3cbe1cd07413984dab7057a9515a591fa`; este archivo tenía blob `d7db844310afbc6235492bcba022d0e288fb3cae`. El commit local `ceaebb1` y el parche `ncs-p01-relaunchers-doc.patch` mencionados por Claude no están integrados en la rama remota verificada.

### Evaluación del hallazgo

- La evidencia documental ya limita la afirmación al caller principal y a los actores enumerados: los locks solo coordinan a participantes que los respetan; la admisión de un CLI no demuestra cobertura de consumidores externos.
- La brecha adicional es **la integridad del inventario**: enumerar los actores conocidos no demuestra que la lista esté completa. Gatear el caller principal no prueba control sobre escritores, launchers, actores de release/limpieza ni mecanismos de reanudación omitidos.
- El perfil D3, el inventario de callers, P-05 y CVM-03/CVM-06/CVM-07 proporcionan criterios relacionados, pero las fuentes inspeccionadas no aportan todavía evidencia empírica de exhaustividad para el entorno real.
- Criterio pendiente para cualquier cierre: identificar el alcance del inventario, las fuentes usadas para descubrir actores, los límites/omisiones conocidos y la evidencia reproducible de que todos los actores capaces de escribir o relanzar escritores dentro de ese alcance están enumerados. Una lista de procesos observada en una sola instantánea no basta por sí sola.
- Si no puede demostrarse la exhaustividad dentro del alcance declarado, registrar `UNKNOWN/BLOCKED`; no afirmar quiescencia global ni descartar una opción por falta de evidencia. Esto no exige demostrar control de procesos que no puedan escribir, lanzar escritores ni afectar la admisión de la raíz canónica; esa frontera debe justificarse explícitamente.
- La mención de `CV-01` en el informe de Claude no corresponde a un ID de la matriz actual consultada, que utiliza `CVM-01…CVM-10`. No reinterpretar ni renumerar criterios por inferencia.

### Estado y límites

Esta adición registra un criterio de evidencia pendiente; no certifica completitud del inventario, no cierra P-01/P-05 ni cambia la selección de bootstrap. M0 sigue `INCOMPLETO`; D0/D1-DESIGN/D2/D3 siguen `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`; A/B/C/D sin seleccionar. No se ejecutaron tests/CI ni código, y no se modificaron runtime, workflows ni dispositivo.


## Nueva tarea activa — revisión independiente del contrato restringido (2026-10-27)

**Encargo vigente:** revisar el borrador `NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_DRAFT_2026-10-27.md` sin repetir el censo de repositorio ni reabrir auditorías cerradas.

**Paquete listo para entregar a Claude y Gemini:** [NCS_M0_RESTRICTED_BOOTSTRAP_CONTRACT_INDEPENDENT_REVIEW_2026-10-27.md](BUILD/NCS_M0_RESTRICTED_BOOTSTRAP_CONTRACT_INDEPENDENT_REVIEW_2026-10-27.md), commit `a027be9b1a9eb20cc350c8414ae34ff7433ab990`.

- **Claude:** consistencia contractual, predicados de exclusión, estado previo y resultado indeterminado; contradicciones textuales y correcciones mínimas.
- **Gemini:** red-team documental de contraejemplos para escritores, relanzamientos, sustitución del destino y resultados inciertos.
- Ambos encargos son de solo lectura. Sin cambios de archivos, comandos, tests, CI, Actions, selección A/B/C/D ni autorización de implementación.
- **Estado de envío:** preparado, todavía no enviado. Este protocolo no puede activar ni afirmar que las aplicaciones externas trabajaron; el propietario debe pegar el encargo en cada aplicación y devolver aquí las respuestas.
- Al recibirlas, ChatGPT integra los resultados y clasifica cada punto como nuevo, ya cubierto, inferencia, contradicción real o UNKNOWN. Si no aparece discrepancia material, se registra y se continúa; no se inventa otra tarea.

El dato de plataforma ya conocido (POCO X7 Pro/Android como primer prototipo) no debe preguntarse otra vez como si fuera desconocido. La ubicación exacta de la operación de bootstrap y los controles reales de writers/launchers siguen sin demostrarse.


---

## Cambio de tarea activa — consolidación y cierre M0, sin otra ronda de revisiones (2026-10-27)

Esta sección supersede cualquier encargo anterior que siga presentando la revisión general Claude/Gemini del contrato restringido como tarea activa. No borra el historial de revisiones.

### Trabajo consolidado
- Se recibieron y compararon los hallazgos de Claude, DeepSeek y Qwen sobre el candidato revisado. Perplexity aportó antes fuentes técnicas de referencia; su análisis no fue una revisión del candidato completo.
- Se creó el candidato consolidado [NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_CONSOLIDATED_CANDIDATE_2026-10-27.md](BUILD/NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_CONTRACT_CONSOLIDATED_CANDIDATE_2026-10-27.md), blob `3af18f1df75c687771aa7ceef3fe0d9b232ca45f`.
- Se actualizó la matriz P-01 para enlazarlo y desambiguar la “Opción A” de alcance del objeto (P01-A) de la alternativa A de aislamiento B2/P01-B. P01-B sigue C — no seleccionar todavía.
- STATUS.md contiene los commits y estados verificables.

### Tarea activa
Avanzar hacia la línea de meta M0 usando la matriz P-01 y los artefactos canónicos existentes. No solicitar otra revisión general de Claude/Gemini/DeepSeek/Qwen ni rehacer el análisis de los hallazgos ya clasificados. Solo pedir una comprobación externa si aparece una contradicción material nueva y concreta que no pueda resolverse con los documentos existentes.

### Próximas acciones permitidas
1. Reconciliar las secciones afectadas del candidato consolidado con la matriz P-01, P-05 y la línea de meta M0; revisar solo contradicciones puntuales.
2. Mantener un listado finito de bloqueos reales: decisiones/contratos pendientes, evidencia operacional ausente y pruebas autorizadas no ejecutadas.
3. No declarar el contrato ratificado, no cerrar P-01/P-05 y no afirmar M0 completo mientras falten sus criterios obligatorios.
4. No modificar runtime/tests/workflows/configuración ejecutable/dispositivo ni ejecutar tests/CI/Actions sin autorización explícita separada.

### Estado canónico
M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; P01-B `C — NO SELECCIONAR TODAVÍA`; P-05 `NO RATIFICADA`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; raíz legítima `PENDING/UNKNOWN`; `authorization: NOT_EVALUATED`; primera creación de Continuity y efectos protegidos `STOP`.


## Próximo entregable obligatorio — aplicar matriz finita de cierre M0 (2026-10-27)

La tarea activa se concreta en [NCS_M0_CLOSEOUT_GATE_MATRIX_2026-10-27.md](BUILD/NCS_M0_CLOSEOUT_GATE_MATRIX_2026-10-27.md), blob `92d20cf280bf22354416c49c54bbdaaf9940952e`.

- La matriz reduce la línea de meta A–E a cinco bloqueos operativos/documentales finitos (B1–B5), cita fuentes existentes y fija una secuencia sin reauditoría general.
- Próximo paso: reconciliar solo los bloqueos B1–B3 con el registro de decisiones y la brecha de autoridad ya existentes. No crear otra matriz general ni solicitar más revisiones externas.
- B4–B5 dependen de contratos congelados y autorización separada para implementar/ejecutar pruebas; no simular su cierre documental.
- Estado canónico sin cambio: M0 `INCOMPLETO`; P-01 `OPEN / UNKNOWN`; P01-B `C — NO SELECCIONAR TODAVÍA`; P-05 `NO RATIFICADA`; D0/D1/D2/D3 `OPEN`; D1-IMPLEMENTATION `NO AUTORIZADA`; raíz/autoridad inicial `PENDING / UNKNOWN`; `authorization: NOT_EVALUATED`; primera creación y efectos protegidos `STOP`.
