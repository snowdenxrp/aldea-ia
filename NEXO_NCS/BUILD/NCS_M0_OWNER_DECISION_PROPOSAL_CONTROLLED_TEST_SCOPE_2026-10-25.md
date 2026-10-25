# NCS M0 — propuesta no vinculante para decisión del propietario: entorno de pruebas controlado

Fecha: 2026-10-25  
Rama: `ncs-clean-architecture`  
Estado: **PROPUESTA DE CHATGPT — NO ES DIRECTIVA DEL PROPIETARIO — NO RATIFICADA**  
Alcance: decisión de alcance y siguiente fase documental; sin cambios de runtime/tests/CI/dispositivo.

## 1. Recomendación

Recomiendo una variante acotada de la opción 2: **separar la validación de desarrollo de M0 del despliegue inicial en POCO X7 Pro**, usando un entorno de pruebas controlado y explícitamente identificado para investigar el contrato de raíz/bootstrap.

No recomiendo reescribir ni rebajar el contrato de seguridad base de M0. La raíz explícita única (`--root <directory>`), el bootstrap separado y explícito, la canonicalización antes de derivar rutas, la admisión antes de lecturas persistentes y el bloqueo fail-closed siguen siendo requisitos de diseño. El entorno de pruebas limita dónde se intenta demostrar el comportamiento; no convierte una demostración local en prueba de seguridad del POCO ni de producción.

## 2. Por qué esta vía tiene mejor valor de avance

- Permite cerrar primero preguntas reproducibles de contrato, rutas derivadas, fallos parciales, recuperación y publicación de estado sin asumir supervisores o semánticas del VFS Android.
- Evita elegir A/B/C/D por descarte cuando no existe evidencia operacional suficiente.
- Mantiene separados diseño, implementación, evidencia de pruebas y autoridad legítima.
- Evita que una prueba en directorio temporal o en una máquina de desarrollo se interprete como evidencia de quiescencia real, seguridad frente a actores externos, durabilidad ante pérdida de energía o autorización de efectos protegidos.

## 3. Límites estrictos propuestos para el alcance de prueba

Antes de autorizar cualquier implementación o ejecución, la especificación del entorno deberá identificar:
1. Sistema operativo y versión del entorno de prueba.
2. Si el proceso se lanza manualmente o mediante supervisor/CI y qué procesos externos quedan fuera de cobertura.
3. Una raíz temporal o dedicada sin datos reales de usuario ni stores productivas.
4. Los comandos/entrypoints concretos, las rutas derivadas y cómo se evita que el proceso acceda a rutas fuera del área de prueba.
5. Qué garantías se probarán y cuáles quedan explícitamente fuera de alcance.
6. Cómo se capturan los resultados y cómo se distinguen pruebas ejecutadas de análisis estático.

No introducir claves raíz reales, efectos protegidos, migración de datos reales, cambios de bootloader, instalación en el POCO ni despliegue productivo dentro de esta fase.

## 4. Qué no queda resuelto por esta recomendación

- No elige ni certifica A, B, C o D.
- No demuestra la legitimidad de una raíz.
- No establece que el CLI Node esté integrado en M1 Android.
- No demuestra atomicidad conjunta de Continuity y Chronicle, seguridad contra TOCTOU/symlink, quiescencia de writers externos ni durabilidad ante pérdida de energía.
- No autoriza cambios de runtime, tests, CI, instalación o dispositivo.
- No modifica los criterios de aceptación de M0 ni habilita `ROOT_READY`.

## 5. Decisión solicitada al propietario

El propietario puede ratificar o rechazar esta propuesta. Si la ratifica, la siguiente acción sería definir documentalmente un perfil de entorno de prueba y una matriz de claims/evidencia; cualquier ejecución de tests o cambio de runtime requeriría autorización separada y explícita.

Opciones de respuesta:
- **RATIFICAR ALCANCE DE PRUEBA:** se autoriza únicamente el diseño documental de un entorno controlado distinto del POCO; no autoriza aún implementación ni ejecución.
- **MANTENER BLOQUEO:** continuar sin seleccionar entorno ni opción de bootstrap.
- **APORTAR OTRO ENTORNO/DIRECTIVA:** el propietario define el entorno o restricciones verificables.

Hasta recibir ratificación explícita, este documento es solo una recomendación y no se debe registrar como decisión canónica del propietario.

## 6. Gates vigentes

- M0: `INCOMPLETO`.
- Diseño D0/D1-DESIGN/D2/D3: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- Autorización: `NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Opciones A/B/C/D: ninguna seleccionada.
- Tests/CI: no ejecutados por esta propuesta.
- Runtime/dispositivo/bootloader: sin cambios.

## 7. Instrucciones de continuidad para Gemini

1. Leer `NEXO_NCS/STATUS.md`, `NEXO_NCS/AI_TEAM_PROTOCOL_AND_ACTIVE_TASK.md` y este documento.
2. Tratar este archivo como propuesta de ChatGPT, no como decisión del propietario.
3. No modificar el contrato canónico ni cambiar gates sin directiva explícita del propietario.
4. No repetir auditorías cerradas ni elegir A/B/C/D por inferencia.
5. Si el propietario ratifica el alcance de prueba, redactar primero el perfil y los criterios de evidencia; esperar autorización separada antes de tests/CI/runtime/dispositivo.
6. Si no hay ratificación, conservar `UNKNOWN/BLOCKED` y `STOP`.

