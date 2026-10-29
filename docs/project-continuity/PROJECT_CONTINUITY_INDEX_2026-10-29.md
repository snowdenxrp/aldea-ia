# Índice de continuidad — Emergency Knowledge Core y Atlas Offline

**Fecha:** 2026-10-29  
**Propósito:** conservar el punto exacto de continuación de los dos proyectos y evitar repetir trabajo.

## Expedientes

1. [Emergency Knowledge Core — estado y continuidad](EMERGENCY_KNOWLEDGE_CORE_STATUS_2026-10-29.md)
   - Último material recibido: informe focalizado de Qwen (2026-10-29), consolidado en el expediente ECK. No se repitió la auditoría general de filtros/SODIS.
   - Estado: `PROPOSAL — NOT IMPLEMENTED`.
   - Clasificación tras el delta: B2 (publicación oficial CENAPRED 2026 del 01 800 111 3168) resuelto como publicación; B1 (operatividad actual de la línea) sigue UNKNOWN; B3 (marco KI/PERE) PARTIAL hasta validar procedimiento en fuente primaria; B4 (guía mexicana de hervido por altitud) UNKNOWN; B5 (evacuación ciudadana por incendio forestal en Colima) PARTIAL; B6 sigue pendiente.
   - No aceptar “publicado” como equivalente a “operativo” ni búsqueda negativa como prueba de inexistencia. Los detalles y URLs están en el expediente ECK.
   - Bloqueos adicionales B1–B6 registrados en su expediente.

2. [Atlas Offline — estado de auditoría y continuidad](ATLAS_OFFLINE_AUDIT_STATUS_2026-10-29.md)
   - Auditoría de Perplexity de los bloques 1–5 preservada en forma consolidada.
   - Estado: `PROPOSAL — NOT IMPLEMENTED`.
   - Hallazgo nuevo: portal municipal de tsunami en Manzanillo con mapas y rutas explícitamente preliminares/en validación comunitaria; no tratarlos como rutas ya validadas. Pendiente principal: recuperar el informe original de Gemini; Claude revisará adversarialmente solo los residuos tras recibir informes de Qwen/Perplexity y original de Gemini.

## Reglas comunes

- Los expedientes son registros documentales, no implementaciones.
- No declarar pruebas ejecutadas salvo evidencia independiente.
- Mantener `UNKNOWN` y `PARTIAL` donde corresponda.
- No convertir recomendaciones de diseño en requisitos de una norma o garantía de plataforma.
- Actualizar los expedientes con fechas, URLs, pasajes y cambios de clasificación.
- No reabrir investigaciones cerradas salvo nueva fuente, contradicción concreta o cambio del requisito.
- Mantener estos proyectos separados de NCS M0.

## Estado de preservación

Estos archivos se crean en una rama documental dedicada para no alterar el estado de NCS M0 ni mezclar los expedientes con código funcional. El commit y la existencia de los archivos deben verificarse después de escribirlos.

**No equivale a:** implementación, validación completa, aprobación operativa o pruebas.

## Coordinación de trabajo

- Tablero focalizado: [Issue #109 — ECK + Atlas Offline](https://github.com/snowdenxrp/aldea-ia/issues/109).
- No se contactó automáticamente a las IA externas; el issue contiene tareas breves para repartir manualmente.
- Rama documental separada; NCS M0 no se modifica.
