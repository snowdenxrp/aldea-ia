# Nexo Android — Avatar flotante, voz e iniciativa proactiva
Fecha: 2026-10-25
Estado: ESPECIFICACIÓN DE PRODUCTO; NO IMPLEMENTADA NI VALIDADA

## 1. Propósito y alcance

Definir la experiencia inicial de Nexo en el POCO X7 Pro con Android. El avatar puede permanecer visible sobre otras aplicaciones, animarse e interactuar con el usuario. Nexo puede iniciar avisos por causas autorizadas aunque el usuario no haya abierto una conversación. La arquitectura debe permitir un cliente futuro para PC sin acoplar la identidad, memoria ni principios de Nexo a Android.

Este documento expresa intención de diseño. No demuestra viabilidad técnica, permisos concedidos, implementación, pruebas ni disponibilidad continua del sistema operativo.

## 2. Experiencia del avatar

- Avatar pequeño, animado y flotante sobre otras aplicaciones, cuando el usuario conceda el permiso de superposición correspondiente.
- Estados visuales distinguibles: inactivo, escuchando tras activación explícita, procesando, hablando, aviso pendiente, permiso requerido, desconectado y estado desconocido/error.
- Tocar el avatar abre un panel compacto para conversar por voz o texto, revisar el motivo de un aviso, posponerlo, descartarlo o ajustar preferencias.
- El usuario puede mover, minimizar, ocultar temporalmente o cerrar la presencia visual sin borrar la continuidad de Nexo.
- El avatar no debe ocultar controles críticos, capturar entradas de otras aplicaciones ni simular que una acción se ejecutó cuando no existe evidencia.
- Ocultar o cerrar el avatar no equivale a revocar permisos ni a detener necesariamente el servicio; la interfaz debe explicar y exponer esas acciones por separado.

## 3. Separación arquitectónica

Separar como mínimo:
1. Núcleo de Nexo: identidad, principios, continuidad y decisiones autorizadas.
2. Adaptador Android: servicio, ciclo de vida, permisos, notificaciones y APIs del sistema.
3. Presentación: avatar, animaciones y panel de interacción.
4. Fuentes de contexto: tareas, notificaciones, calendario, salud operativa y fuentes adicionales autorizadas.
5. Evaluador de relevancia: decide si corresponde avisar, con explicación y evidencia disponibles.

La presencia del avatar no es la identidad de Nexo. Android no es Nexo. El estado operativo de Nexo no debe mezclarse con el estado de Lúmina. Una futura aplicación de PC debe implementar los mismos contratos de permisos, iniciativa, privacidad y autoridad mediante adaptadores propios de la plataforma.

## 4. Fuentes autorizadas para avisos

- Tareas y recordatorios asignados explícitamente a Nexo.
- Notificaciones del teléfono, solo después de autorización específica del usuario y con acceso mínimo necesario.
- Eventos de calendarios expresamente autorizados.
- Estado operativo y de seguridad de Nexo basado en señales observables.
- Otras fuentes contextuales solo después de conceder permiso explícito por fuente y propósito.

Cada fuente debe definir finalidad, datos accesibles, frecuencia, retención, límites, revocación y comportamiento ante errores. No se presume permiso para ubicación, micrófono, archivos, actividad de aplicaciones o contenido privado por haber habilitado la superposición.

## 5. Política de iniciativa y avisos

Clasificación propuesta:
- P0 — crítico: riesgo inmediato, seguridad o pérdida importante confirmada.
- P1 — importante: requiere atención en un plazo definido.
- P2 — informativo: útil, pero no urgente; preferentemente agrupado.
- P3 — baja relevancia: silencioso, resumido o no notificado.

La clasificación debe estar respaldada por señales y contexto verificables. Si la evidencia es insuficiente, usar UNKNOWN y no presentar una sospecha como hecho confirmado. La frecuencia debe limitarse para evitar spam. Horarios de silencio, canales, excepciones y umbrales deben ser configurables. Ninguna clasificación concede autoridad para actuar en nombre del usuario.

## 6. Voz y frase de activación

- La frase objetivo es “Nexo”.
- La detección local de la frase es la opción preferida si la viabilidad, precisión, consumo energético y privacidad se verifican en el dispositivo.
- La activación por voz y la escucha continua son capacidades distintas. No se presupone grabación continua, almacenamiento de audio ni transmisión remota.
- El indicador visual debe comunicar cuándo el micrófono está activo y qué procesamiento está ocurriendo.
- Deben documentarse alternativas cuando Android, el fabricante o las restricciones de batería impidan una operación fiable con pantalla apagada o en segundo plano.

## 7. Límites de privacidad y autoridad

- Mínimo privilegio, transparencia, revocación y retención limitada.
- No leer indiscriminadamente notificaciones ni exponer mensajes privados o códigos de autenticación en el avatar.
- No abrir enlaces, responder mensajes, compartir datos, comprar, borrar archivos, cambiar permisos ni ejecutar efectos protegidos a partir de un aviso sin autorización apropiada.
- Detectar, recomendar, notificar y ejecutar son fases distintas. La notificación nunca equivale a autorización.
- No realizar reparaciones automáticas, migraciones ni cambios de seguridad porque el estado sea desconocido.
- Ante falta de evidencia, permiso o autoridad: detener la acción y mostrar el estado desconocido o bloqueado.
- Las fuentes contextuales adicionales deben habilitarse de manera individual y poder revocarse sin consecuencias ocultas.

## 8. Restricciones de Android que deben verificarse

Antes de prometer persistencia, evaluar en el POCO real: servicio en primer plano y su notificación persistente cuando corresponda; restricciones de inicio y ejecución en segundo plano; permiso de superposición; permiso de micrófono; comportamiento con pantalla apagada; límites del fabricante; consumo de batería y memoria; reinicio del proceso; revocación de permisos; accesibilidad y conflictos visuales del avatar.

No prometer funcionamiento indefinido ni que Android nunca detendrá el proceso. Registrar resultados de pruebas por versión del sistema y configuración del dispositivo. Ningún resultado se considera verificado sin evidencia concreta.

## 9. Secuencia recomendada

1. Definir preferencias de privacidad, permisos por fuente, horarios de silencio, retención y niveles de aviso.
2. Implementar y validar recordatorios deterministas locales.
3. Evaluar integración autorizada de calendario y notificaciones.
4. Prototipar avatar flotante y panel interactivo.
5. Evaluar frase de activación local, consumo y límites reales del dispositivo.
6. Añadir otras fuentes contextuales individualmente, con contratos de privacidad propios.
7. Definir un adaptador de PC cuando el equipo y sistema operativo estén disponibles; no inventar sus capacidades por adelantado.

## 10. Criterios de aceptación del diseño

- El usuario puede ocultar el avatar sin perder la continuidad de Nexo.
- Cada fuente activa muestra su propósito y permite revocar el acceso.
- Un aviso puede explicar qué señal lo originó y su nivel de confianza.
- La incertidumbre no se convierte en afirmación ni acción automática.
- Ningún aviso por sí solo autoriza efectos externos o protegidos.
- La experiencia distingue claramente avatar visible, servicio activo, micrófono activo y permisos concedidos.
- Las restricciones del sistema operativo se comunican honestamente y se prueban en el dispositivo objetivo.
- Los datos de Nexo y Lúmina permanecen separados.
- La compatibilidad futura con PC se trata como objetivo de diseño, no como implementación ya demostrada.

## 11. Estado actual

Solo se ha definido la especificación documental. No hay evidencia en este documento de que el avatar, servicio persistente, escucha por frase de activación, integraciones o avisos proactivos estén implementados, probados o habilitados. No se han autorizado cambios de runtime, pruebas ni CI.
