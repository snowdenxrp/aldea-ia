# NCS M0 — separar entornos de desarrollo, CI, runtime y migración

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **ACLARACIÓN DOCUMENTAL — NO SELECCIONA DESPLIEGUE — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Problema que evita esta distinción

“¿Dónde se desarrolla Nexo?” no equivale a “¿dónde corre la primera instancia que usa Continuity/Chronicle?” ni a “¿desde dónde se ejecutaría una migración?”. Confundir estos entornos podría producir un procedimiento D3 que controla la máquina equivocada y no detiene a los escritores reales.

Este documento delimita cuatro ámbitos independientes. No presupone que todos existan ni que compartan sistema operativo, almacenamiento o autoridad operacional.

## 2. Matriz de ámbitos

| Ámbito | Propósito | Evidencia suficiente para identificarlo | Lo que NO demuestra |
|---|---|---|---|
| A. Desarrollo | Editar código, revisar diffs y preparar commits | Herramienta/entorno usado para editar y acceso al repositorio | Que la instancia de runtime exista o que sus writers estén detenidos |
| B. CI | Ejecutar pruebas automatizadas sobre un SHA | Workflow, run ID, job, SHA exacto, artefactos/logs y conclusión | Estado de una instalación local, root legítimo, quiescencia real o permiso de efectos |
| C. Primera instancia runtime | Ejecutar Nexo y materializar/leer/escribir Continuity o Chronicle | Entorno real o declarado de despliegue, punto de entrada, configuración no secreta, ubicación de datos y todos los lanzadores conocidos | Que exista control de migración, que los escritores legacy estén detenidos o que la autoridad constitucional esté establecida |
| D. Host/operador de migración | Coordinar inventario, quiescencia, copia, verificación y cutover | Quién/qué puede detener todos los writers, impedir relanzamientos, inspeccionar procesos/rutas y registrar evidencia | Que el control sea efectivo por el solo hecho de describirlo; se requiere prueba observable en la ventana real |

## 3. Reglas de decisión

1. El ámbito C es la referencia primaria para concretar D3: hay que localizar los datos y enumerar quién puede escribirlos, incluidos procesos directos y relanzadores.
2. El ámbito D puede coincidir físicamente con C, pero esa coincidencia debe declararse y verificarse; no se infiere.
3. A o B no sustituyen a C/D. Ejecutar CI verde no demuestra quiescencia operacional ni autoriza una migración.
4. Si C aún no existe, D3 permanece como requisito de diseño pendiente. No hace falta inventar una instalación ni escoger Android, Linux, contenedor o supervisor por conveniencia.
5. Si C existe pero no se puede identificar/controlar a todos los writers o impedir nuevos lanzamientos durante la ventana, el resultado es `UNKNOWN/BLOCKED`; no se inicia cutover.
6. El teléfono POCO X7 Pro usado para el prototipo local M1 no queda designado automáticamente como C. Esa relación requiere una decisión explícita y evidencia de que allí se ejecutará la primera instancia que use Continuity/Chronicle.
7. El control operacional de D3 es distinto de la legitimidad de la raíz, la admisión D2, los límites de recursos y la autorización constitucional. No reemplaza ninguno.

## 4. Entrada mínima para resolver el ámbito C

No solicitar arquitectura completa ni repetir el censo. Basta establecer primero una de estas dos situaciones:

- **C existe:** indicar dónde se ejecutará la primera instancia que usará Continuity/Chronicle y cómo se inicia (manual, app, servicio, tarea, supervisor u otro). No incluir rutas privadas, tokens ni datos de usuario.
- **C todavía no existe:** registrar explícitamente que no hay despliegue runtime objetivo seleccionado; continuar diseño documental y mantener D3 OPEN.

Solo después de resolver esto se pide el detalle de control de relanzamientos y rutas necesario para D3.

## 5. Estado

- Entorno de desarrollo: no equivale al runtime.
- CI: evidencia limitada a cada SHA/run concreto.
- Primera instancia runtime C: **NO DETERMINADA EN ESTA REVISIÓN**.
- Host/operador de migración D: **NO DETERMINADO EN ESTA REVISIÓN**.
- D0/D1/D2/D3: **OPEN**.
- M0: `INCOMPLETO`.
- Autorización de implementación: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Runtime/tests/workflows: sin cambios; tests/CI no ejecutados.

## 6. Continuidad

Usar este documento junto con `NCS_M0_D3_DEPLOYMENT_ENVIRONMENT_PROFILE_REQUIRED_2026-10-23.md`. La siguiente decisión factual es si el ámbito C ya existe. No convertir el teléfono de prototipo, la máquina de edición o CI en runtime por inferencia. No repetir el censo previo ni implementar con los gates abiertos.
