# Índice de continuidad — Emergency Knowledge Core y Atlas Offline

**Fecha:** 2026-10-29  
**Propósito:** conservar el punto exacto de continuación de los dos proyectos y evitar repetir trabajo.

## Expedientes

1. [Emergency Knowledge Core — estado y continuidad](EMERGENCY_KNOWLEDGE_CORE_STATUS_2026-10-29.md)
   - Último material recibido: informes focalizados de Qwen y verificación independiente de Perplexity (2026-10-29), consolidados en el expediente ECK. No se repitió la auditoría general de filtros/SODIS.
   - Estado: `PROPOSAL — NOT IMPLEMENTED`.
   - Clasificación consolidada: B2 (publicación oficial CENAPRED 2026 del 01 800 111 3168) resuelto como publicación; B1 (operatividad actual de la línea) UNKNOWN; B3 (protocolo ciudadano específico de KI/PERE) UNKNOWN por evidencia insuficiente y discrepancia entre informes; B4 (guía mexicana de hervido por altitud) PARTIAL: existe guía federal de 5 minutos desde el primer hervor, sin ajuste de altitud demostrado; B5 (evacuación ciudadana por incendio forestal en Colima) PARTIAL con programa estatal 2026, pero sin protocolo público específico de Manzanillo verificado; B6 sigue pendiente.
   - No aceptar “publicado” como equivalente a “operativo”, un plan general como protocolo ciudadano completo ni búsqueda negativa como prueba de inexistencia. Los detalles y URLs están en el expediente ECK.
   - Bloqueos adicionales B1–B6 registrados en su expediente.
   - Revisión adversarial provisional de Claude añadida a ECK: posible inconsistencia en umbrales de KI aún no confirmada; procedencia del teléfono CNSNS inconsistente; SODIS y criterio de evacuación por sismo requieren cotejo con fuente primaria. Sin prueba de operación actual del teléfono.
   - Revisión adversarial provisional de Claude añadida a Atlas: política fail-closed ante revocación expirada sigue abierta; ISO 22320 y NIST SP 800-57 quedan UNKNOWN para afirmaciones normativas específicas hasta comprobar texto completo; KeyMint del dispositivo objetivo y recuperación multiarchivo sin cierre.

2. [Atlas Offline — estado de auditoría y continuidad](ATLAS_OFFLINE_AUDIT_STATUS_2026-10-29.md)
   - Informe original de arquitectura de Gemini (bloques 1–5) recibido directamente del usuario y consolidado en la sección 13 del expediente Atlas; queda disponible para contraste literal con Claude.
   - Estado: `PROPOSAL — NOT IMPLEMENTED`.
   - La revisión adversarial final de Claude está registrada en el expediente. Persisten decisiones abiertas sobre anti-rollback de datos, estado tras reinicio y revocación, conflictos de rutas, commit/recuperación multiarchivo y ciclo de vida de K_backup. Afirmaciones normativas de ISO/NIST y detalles de Android que no se verificaron directamente permanecen UNKNOWN/PARTIAL.
   - Pendientes técnicos: evidencia de atestación del dispositivo objetivo; política durable de caducidad/revocación tras reinicios; reglas de autoridad y resolución de avisos; protocolo probado de publicación/recuperación multiarchivo; modelo de amenaza y gobernanza de quórum.
   - Matriz de decisiones y criterios de aceptación A1–A7 añadida en la sección 14 del expediente Atlas. Incluye KeyMint/atestación, anti-rollback de datos, revocación tras reinicio, conflictos de rutas, bundle multiarchivo, K_backup y atribuciones normativas.
   - No hay implementación ni pruebas acreditadas; no se ha declarado cierre de arquitectura. Próximo paso: revisar/aprobar la matriz y nombrar la autoridad responsable de las decisiones de diseño.
   - Hallazgo local de tsunami permanece: portal municipal presenta rutas/puntos en versión preliminar y en validación comunitaria; no tratarlos como rutas validadas. Próximo paso: revisión adversarial de Claude, ya con enlaces directos y ambos informes registrados.

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


### Delta Atlas — primera pasada de límites de confianza (2026-10-29)
- Se añadió la sección 15 al expediente Atlas: distinción entre autenticidad/integridad, frescura anti-rollback y disponibilidad/recuperabilidad.
- A1: atestación KeyMint se trata por capacidad/operación; no se afirma compatibilidad sin evidencia del dispositivo objetivo. La decisión de requisito de despliegue queda abierta.
- A2: anti-rollback fuerte necesita un ancla de frescura que no pueda restaurarse junto con los datos; si no existe, declarar la limitación en vez de llamar seguro a un contador local restaurable.
- A6: existencia y propósito de K_backup siguen UNKNOWN; custodios, quórum, autoridad de recuperación y reglas de rotación/revocación quedan reservados al propietario/autoridad responsable.
- Estado: propuesta documental; no hay código ni pruebas. Próximo paso: decisiones de autoridad que deben resolverse para A1/A2/A6; después A3/A4. NCS M0 permanece intacto.


### Delta Atlas — A3/A4 propuestos (2026-10-29)
- Se añadió la sección 16 al expediente Atlas con estados offline explícitos: TRUST_CURRENT, TRUST_STALE, REVOCATION_STATUS_UNKNOWN, TRUST_REVOKED, BUNDLE_INVALID y NO_VERIFIABLE_BUNDLE.
- La propuesta distingue incertidumbre por caducidad/ausencia de revocación de una revocación autenticada. No se fija plazo de caducidad; el reloj monotónico no se trata como durable entre reinicios.
- Para avisos/rutas, se propone no presentar como segura una ruta que depende de un tramo con conflicto material sin resolver; mostrar procedencia y no inventar una alternativa. La jerarquía de fuentes queda pendiente de validación local.
- Estado: PROPOSAL — NOT IMPLEMENTED; no hay código ni pruebas. Siguiente orden: protocolo de publicación/recuperación de bundle (A5), después verificación normativa (A7). NCS M0 sigue separado.


### Delta Atlas — A5, publicación/recuperación de bundle (2026-10-29)
- Se añadió la sección 17 al expediente Atlas con un protocolo candidato de staging, verificación de manifiesto/componentes, commit y recuperación.
- Bloqueo central: coordinación del puntero de bundle activo con el ancla anti-rollback; dos escrituras independientes no constituyen una transacción atómica.
- Se registró una matriz de fallos propuesta, incluyendo interrupciones durante staging, commit, actualización del ancla, WAL/checkpoint, falta de espacio y errores de E/S.
- No se implementó ni probó el protocolo; sigue PROPOSAL — NOT IMPLEMENTED. Siguiente: revisar atribuciones normativas A7 y registrar exactamente qué se verificó. NCS M0 permanece separado.


### Delta Atlas — A7, fuentes normativas (2026-10-29)
- Se añadió la sección 18 con comprobación directa del texto oficial de NIST SP 800-57 Part 1 Rev. 5 §8.2.2.2: la recuperación de claves se evalúa caso por caso y no se prescribe allí un quórum offline específico.
- La ficha oficial de ISO 22320:2018 confirma el alcance general de gestión de incidentes y su vigencia; el texto íntegro no se revisó, por lo que cláusulas concretas y un supuesto mandato de bloqueo de rutas siguen UNKNOWN/no atribuibles.
- La referencia oficial de Android confirma que elapsedRealtime() cuenta desde el arranque e incluye deep sleep; no resuelve continuidad temporal entre reinicios.
- A7 queda parcialmente documentado, no es certificación ni evaluación de conformidad. Estado global PROPOSAL — NOT IMPLEMENTED; no hay código ni pruebas; NCS M0 sigue separado.
