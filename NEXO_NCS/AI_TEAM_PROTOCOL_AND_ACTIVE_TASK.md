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
