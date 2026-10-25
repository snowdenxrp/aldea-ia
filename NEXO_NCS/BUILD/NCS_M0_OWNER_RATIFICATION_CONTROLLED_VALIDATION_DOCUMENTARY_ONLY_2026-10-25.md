# NCS M0 — ratificación del propietario: diseño documental de validación controlada

Fecha: 2026-10-25  
Rama de trabajo: `ncs-clean-architecture`  
Estado: **RATIFICADO POR EL PROPIETARIO — SOLO DISEÑO DOCUMENTAL**  
Autoridad: directiva explícita del propietario recibida en ChatGPT el 2026-10-25.

## 1. Directiva ratificada

El propietario ratifica el alcance de validación controlada **solo para diseño documental**.

Queda expresamente **NO AUTORIZADO todavía**:
- ejecutar tests, suites de pruebas o CI;
- cambiar runtime, código de producción, tests, workflows o configuración ejecutable;
- instalar APKs, software o herramientas en dispositivos;
- modificar el POCO X7 Pro, Android, sistema operativo, bootloader o cualquier otro dispositivo;
- usar claves raíz reales, stores productivas, datos reales de usuario o efectos protegidos;
- declarar que el entorno controlado demuestra seguridad del POCO o de producción;
- seleccionar las opciones de bootstrap A/B/C/D por inferencia.

La ratificación autoriza únicamente a producir y revisar documentación para describir un posible entorno de validación controlada separado del POCO y de producción, junto con sus claims, límites, condiciones de fallo y evidencia necesaria.

## 2. Trabajo documental permitido

El siguiente trabajo puede continuar sin nueva autorización:
1. Definir un perfil candidato del entorno controlado, sin dar por supuesto sistema operativo, supervisor ni mecanismo de aislamiento.
2. Construir una matriz claim → precondiciones → método de evidencia → resultado esperado → limitaciones → condición UNKNOWN/STOP.
3. Distinguir explícitamente análisis estático, diseño propuesto, prueba ejecutada y evidencia de despliegue real.
4. Delimitar qué preguntas de contrato de raíz/bootstrap podrían evaluarse en ese entorno y qué preguntas requieren evidencia operacional del despliegue real.
5. Documentar fallos parciales, recuperación/readmission, publicación de estado y rutas derivadas como casos de diseño, sin ejecutar esos casos.
6. Preparar un handoff preciso para Gemini y actualizar los documentos de continuidad.

El perfil debe identificar, como mínimo: OS/versión por confirmar, modo de lanzamiento, procesos/writers externos fuera de cobertura, raíz temporal o dedicada, entrypoints y rutas previstas, límites de acceso, claims evaluables/no evaluables, forma futura de capturar artefactos y política de parada. Los valores desconocidos se registran como `UNKNOWN`, no se inventan.

## 3. Límites y criterios de parada

- El contrato de raíz explícita única `--root <directory>`, bootstrap separado y explícito, canonicalización antes de derivar rutas, admisión antes de lecturas persistentes y bloqueo fail-closed permanece vigente como diseño ya ratificado; no reabrirlo.
- La ratificación de este alcance no ratifica ningún mecanismo concreto de bootstrap.
- A = offline bootstrap + external quiescence; B = staging directory + atomic publication; C = persistent initialization marker; D = external coordination outside root. Ninguna opción queda seleccionada por esta directiva.
- Si el perfil no permite demostrar una precondición, el claim afectado queda `UNKNOWN/BLOCKED`; no se sustituye evidencia por inferencia.
- Un resultado futuro en un entorno controlado no prueba por sí solo quiescencia de writers externos, seguridad frente a TOCTOU/symlink, durabilidad ante pérdida de energía, legitimidad de la raíz, integración con Android ni seguridad de producción.
- No se habilita `ROOT_READY`, commissioning ni ningún efecto protegido.

## 4. Gates canónicos sin cambio

- M0: `INCOMPLETO`.
- D0/D1-DESIGN/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Bootstrap A/B/C/D: ninguna seleccionada.
- Tests/CI: no ejecutados bajo esta autorización.
- Runtime, workflows, instalación, dispositivo y bootloader: sin cambios autorizados.

## 5. Instrucciones obligatorias para Gemini

1. Comenzar por `NEXO_NCS/STATUS.md`, luego `NEXO_NCS/AI_TEAM_PROTOCOL_AND_ACTIVE_TASK.md), este documento y los artefactos BUILD referenciados allí.
2. Tratar esta directiva como autorización exclusiva de diseño documental; no ampliar el permiso por interpretación.
3. Elaborar el perfil candidato y la matriz claim/evidencia únicamente en documentos.
4. No ejecutar tests/CI, no editar runtime/tests/workflows, no instalar nada ni modificar dispositivo/bootloader.
5. No seleccionar A/B/C/D ni cambiar gates por inferencia.
6. No repetir auditorías cerradas. Reutilizar la matriz de opciones, el crosscheck, las especificaciones P-03/P-04 y P-05, el inventario de callers y el perfil de despliegue requerido ya existentes.
7. Si se propone después cualquier ejecución, implementación o acción en el dispositivo, describirla como una solicitud separada y esperar autorización explícita específica.
8. Dejar un handoff documental con cambios, evidencia consultada, incógnitas restantes y siguiente paso; no afirmar que se ejecutó nada que no se haya ejecutado.

## 6. Trazabilidad

Esta directiva reemplaza el estado “no ratificada” de la recomendación de ChatGPT en cuanto al alcance documental únicamente. La propuesta original permanece como antecedente y no debe interpretarse como permiso para ejecutar pruebas. La presente directiva no afirma que se hayan realizado pruebas ni modifica el runtime.
