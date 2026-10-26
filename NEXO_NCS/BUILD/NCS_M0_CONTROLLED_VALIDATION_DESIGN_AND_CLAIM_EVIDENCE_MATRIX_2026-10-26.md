# NCS M0 — diseño de validación controlada y matriz claim/evidencia

Fecha: 2026-10-26  
Rama prevista: `ncs-clean-architecture`  
Estado: **DISEÑO DOCUMENTAL ÚNICAMENTE — NO EJECUTADO — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Propósito y alcance

Este artefacto desarrolla la ratificación del propietario del 2026-10-25 para perfilar documentalmente una validación controlada y separada del POCO/producción, y para vincular cada claim a precondiciones, evidencia y límites.

No presupone que exista una PC disponible, que el CLI M0 esté desplegado en Android, ni que haya un entorno de prueba ya configurado. No selecciona A/B/C/D, no prescribe herramientas concretas y no autoriza ejecutar pruebas, CI, instalación, cambios de runtime, uso de claves reales ni efectos protegidos.

### Clasificación obligatoria

- **Principio ratificado:** requisito de diseño ya decidido por el propietario.
- **Claim a demostrar:** afirmación que solo podrá hacerse después de obtener evidencia suficiente.
- **Diseño propuesto:** criterio de evaluación para una futura autorización separada.
- **UNKNOWN/BLOCKED:** dato, precondición o resultado no demostrado.

## 2. Separación de entornos

| Entorno/concepto | Lo conocido | Lo que no se debe inferir |
|---|---|---|
| POCO X7 Pro / Android M1 | Es el primer objetivo del prototipo Android. | No demuestra que los scripts Node.js M0 se ejecuten, estén instalados o sean invocados allí. |
| CLI Node.js M0 en el repositorio | Existen entrypoints Node que aceptan rutas de stores por separado y un bootstrap parcial por flags separados en el código inspeccionado. | No demuestra despliegue, launcher operativo, raíz canónica, control de todos los escritores ni conformidad con `--root <directory>`. |
| Entorno futuro de validación controlada | Su diseño documental está autorizado, separado de POCO/producción. | No se afirma que esté creado, disponible, aislado ni autorizado para ejecutar nada. |
| Producción / raíz real | No está acreditada una raíz legítima ni un entorno operativo inicial completo. | No usar stores, claves, datos o efectos reales para completar huecos de evidencia. |

**Regla:** el destino de producto (POCO) y el entorno donde se valida el contrato Node M0 son dimensiones distintas. La primera no resuelve la segunda.

## 3. Matriz de claims, precondiciones y evidencia requerida

| ID | Claim que se querría sostener | Precondiciones mínimas | Evidencia de aceptación futura | Límite / estado actual |
|---|---|---|---|---|
| CVM-01 | La operación usa una sola raíz explícita `--root <directory>`. | Gramática CLI ratificada y caller identificado. | Invocación registrada con raíz explícita; evidencia de que rutas internas se derivan de ella y no de flags/variables legacy. | Principio ratificado; conformidad del CLI actual no demostrada. |
| CVM-02 | La raíz se canonicaliza antes de derivar paths. | Política sobre symlinks, aliases, mounts, rutas relativas y errores definida. | Registro de resolución y casos de aceptación/rechazo con rutas controladas. | Detalle de política abierto; no asumir que canonicalizar la raíz confina todos los archivos. |
| CVM-03 | Ninguna store dentro del alcance se lee antes de la admisión. | Límite de instancia y propietario de admisión definidos; callers directos/indirectos clasificados. | Traza verificable de orden de eventos, incluyendo consultas/read-only y entrada directa del hijo. | Cobertura universal no demostrada. |
| CVM-04 | El bootstrap es separado, explícito y no implícito. | Protocolo concreto de bootstrap y predicados de salida aprobados. | Evidencia de entrada explícita, precondiciones, resultado y rechazo de operación normal cuando la raíz no está preparada. | P-01 abierto; A/B/C/D sin seleccionar. |
| CVM-05 | Un corte entre inicializaciones no se presenta como raíz lista. | Estados de bootstrap parcial y autoridad de recuperación definidos. | Interrupciones controladas documentadas, con resultado parcial/UNKNOWN y sin readmisión prematura. | Contrato conjunto `BOOTSTRAP_PARTIAL → ROOT_READY` no demostrado. |
| CVM-06 | Un resultado incierto de release bloquea readmisión. | Identidad del actor previo, propiedad de admisión y recuperación definidas. | Evidencia de que la ausencia de un lock/path o un PID no basta por sí sola; evidencia de release suficiente antes de readmitir. | P-03/P-04/P-05 siguen abiertos; no hay ejecución en esta revisión. |
| CVM-07 | La quiescencia se mantiene durante toda una intervención offline si se evaluara A. | Despliegue real, inventario de writers/launchers y autoridad operacional demostrados. | Registro de detener, impedir reinicio, verificar y mantener la ventana, más integridad de fuente/destino. | A = UNKNOWN/BLOCKED; no seleccionada. |
| CVM-08 | Los límites de persistencia y fallos no producen claims de éxito por inferencia. | Contrato de resultado, errores y evidencia definidos. | Artefactos/logs vinculados a SHA, rutas, entrada, resultado y clasificación de UNKNOWN; sin exponer contenido privado innecesario. | Diseño a completar; ningún resultado de ejecución afirmado. |
| CVM-09 | Nexo M0 permanece independiente de Lúmina y de Android M1 salvo integración explícita. | Frontera de componentes y callers confirmada. | Grafo de dependencias y pruebas futuras de aislamiento, además de evidencia de que Android no invoca el CLI salvo integración aprobada. | No asumir integración M0/M1 por compartir el nombre Nexo. |
| CVM-10 | El expediente permite una conclusión reproducible sin confundir propuesta con hecho. | Identidad de fuente, SHA, método, cobertura y limitaciones documentados. | Cadena `trigger → run → job → head/pin → artifact/log → interpretation` para cada claim ejecutado, o marca explícita `NOT RUN`. | Esta matriz es documental; no constituye evidencia de ejecución. |

## 4. Puerta de admisión para cualquier futura validación

Antes de proponer ejecución, un expediente separado debe contener, como mínimo:

1. Entorno concreto y su propietario operativo; no basta con decir “POCO” si el sujeto de validación es el CLI Node M0.
2. Invocador/caller que se pretende validar, con ruta, versión/SHA y forma de lanzamiento.
3. Alcance de datos completamente sintéticos y descartables; ninguna clave raíz real, store productiva o dato privado.
4. Raíz de prueba explícita, ubicación y reglas de derivación/canonicalización propuestas.
5. Escritores y relanzadores dentro del alcance, y límites conocidos de cobertura.
6. Claims exactos, precondiciones, resultado esperado, abort conditions y evidencia a conservar.
7. Autorización explícita posterior del propietario para la actividad concreta. Este documento por sí solo no la concede.

Si falta cualquier dato que afecte la seguridad o la interpretación, no ejecutar y registrar `UNKNOWN/BLOCKED`.

## 5. Relación con el bloqueo de caller/root

La revisión estática de `scripts/nexo.mjs`, `scripts/nexo-chronicle-session.mjs` y los documentos de conformidad indica que los entrypoints inspeccionados aceptan rutas separadas `--continuity`/`--chronicle`; no se demuestra una integración de esos scripts con la app Android M1 ni un caller operativo de provisioning que implemente el contrato `--root`.

Esto es una observación limitada a las fuentes inspeccionadas. No prueba que una integración externa sea imposible, ni demuestra que exista. Para cerrar el desconocido hace falta evidencia del launcher real si lo hay; de lo contrario debe registrarse que el caller no ha sido seleccionado.

Revisión independiente focalizada solicitada en [issue #107, comentario del 2026-10-26](https://github.com/snowdenxrp/aldea-ia/issues/107#issuecomment-6406540022). No se atribuye a Gemini ningún resultado hasta que se reciba y se contraste su respuesta.

## 6. Gates canónicos

- M0: `INCOMPLETO`.
- D0/D1-DESIGN/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Bootstrap A/B/C/D: ninguna opción seleccionada.

## 7. Límites de este artefacto

Solo diseño documental. No se ejecutaron tests ni CI; no se modificaron runtime, tests, workflows, configuración ejecutable, instalación, claves, stores ni dispositivo. Ningún claim de la matriz está marcado como probado por ejecución. Una futura validación requiere una autorización específica separada.
