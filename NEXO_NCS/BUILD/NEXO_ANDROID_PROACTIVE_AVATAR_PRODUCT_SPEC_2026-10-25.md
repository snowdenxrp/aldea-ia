# Nexo — especificación de producto: avatar Android proactivo
Fecha: 2026-10-25
Estado: DISEÑO PROPUESTO POR EL PROPIETARIO; no implementado ni probado.
Destino inicial: POCO X7 Pro / Android 16. PC futura: objetivo de portabilidad; entorno aún desconocido.

## 1. Objetivo
Nexo debe sentirse como un asistente personal persistente, accesible por voz y visualmente presente mientras el propietario utiliza otras aplicaciones. El avatar no es la identidad ni la memoria de Nexo: es una interfaz que puede aparecer, ocultarse o fallar sin interrumpir la continuidad del núcleo.

## 2. Experiencia visual e interacción
- Avatar pequeño, animado y flotante sobre otras aplicaciones, sujeto a los permisos y límites reales de Android.
- El usuario puede moverlo, tocarlo, minimizarlo y abrir un panel compacto de interacción.
- El panel permite conversar por voz o texto, revisar avisos, ver por qué Nexo llamó la atención y controlar permisos/preferencias.
- La presencia del avatar no implica permiso para leer el contenido de otras apps ni para ejecutar acciones en ellas.
- La interfaz debe mostrar estados reales: escuchando para activación local, procesando, avisos pendientes, desconectado/bloqueado o permiso requerido. No representar capacidades activas si no hay evidencia de que lo estén.
- El avatar es prescindible: cerrar/ocultar la interfaz no debe borrar identidad, memoria ni estado del núcleo.

## 3. Voz y frase de activación
- Frase deseada: “Nexo”.
- Evaluar detección local de palabra de activación, si la precisión, batería, latencia y compatibilidad lo permiten.
- No asumir escucha continua, grabación permanente ni transmisión de audio a servidores. La ruta real de audio debe documentarse y ser visible para el propietario.
- El uso del micrófono, escucha con pantalla apagada y ejecución en segundo plano deben probarse en el dispositivo real.
- La detección de la palabra de activación abre la interacción; no autoriza por sí sola acciones externas, compras, envío de mensajes ni efectos protegidos.
- Si la detección local fiable no es viable en el entorno real, informar la limitación y presentar alternativas explícitas en vez de simular que funciona.

## 4. Iniciativa proactiva y fuentes autorizadas
El propietario autorizó diseñar estas cinco clases de fuentes; cada integración todavía requiere contrato técnico y permisos apropiados:

1. Tareas y recordatorios asignados directamente a Nexo: vencimientos, conflictos y seguimiento.
2. Notificaciones del teléfono: acceso explícito, selección/minimización de campos y tratamiento cuidadoso de mensajes privados, códigos de autenticación y contenido sensible.
3. Calendarios y eventos autorizados: recordatorios y conflictos dentro del alcance concedido.
4. Estado operativo y de seguridad de Nexo: solo señales observables; separar anomalía confirmada, sospecha y UNKNOWN.
5. Contexto adicional: solo tras autorización explícita y específica por fuente, propósito, datos usados, retención y revocación. Ubicación, actividad de apps, archivos y otros datos no son permisos predeterminados.

La autorización de diseñar estas fuentes no equivale a conceder permisos del sistema ni a demostrar que las integraciones existen.

## 5. Prioridad de avisos (propuesta)
- P0 — Crítico: requiere atención inmediata por evidencia sólida de riesgo importante.
- P1 — Importante: requiere atención próxima, con razón verificable.
- P2 — Informativo: útil, pero no urgente; puede agruparse.
- P3 — Silencioso/baja relevancia: no interrumpir; dejar disponible en el panel.

Los umbrales exactos, excepciones y límites de frecuencia quedan por definir. No clasificar incertidumbre como hecho. Respetar horarios de silencio, límites de interrupción y preferencias explícitas. No elevar prioridad para generar interacción artificial.

## 6. Privacidad y límites de autoridad
- Mínimo privilegio y mínima recopilación: pedir únicamente el acceso necesario para una función concreta.
- Transparencia: explicar qué fuente originó un aviso, qué datos se utilizaron y por qué se recomienda actuar.
- Revocación: permitir desactivar fuentes y funciones sin castigo ni degradación oculta de otras capacidades.
- Retención limitada: definir antes de implementar qué se guarda, durante cuánto tiempo y cómo se elimina.
- No recopilar indiscriminadamente notificaciones, contenido privado, códigos de autenticación o actividad de otras aplicaciones.
- Separación estricta entre Nexo y Lúmina; el estado operativo de Nexo no debe mezclarse con estado de simulación/aprendizaje de Lúmina.
- Detectar, resumir, recomendar o notificar no equivale a autorizar. No enviar mensajes, comprar, borrar archivos, cambiar ajustes protegidos, conceder permisos ni realizar efectos protegidos sin autorización legítima y frontera de ejecución verificada.
- Ante falta de datos, permisos o evidencia: declarar UNKNOWN/BLOCKED; no fingir éxito ni reparar automáticamente.

## 7. Arquitectura de producto propuesta
Mantener contratos separados para:
1. Núcleo Nexo: identidad, continuidad, preferencias y políticas.
2. Adaptador Android: ciclo de vida, servicios, permisos, notificaciones y calendario.
3. Presentación: avatar flotante, animación y panel.
4. Entrada de voz: captura y detección de activación con límites visibles.
5. Motor de avisos: relevancia, prioridad, deduplicación/agrupación solo si se diseña explícitamente, preferencias y quiet hours.
6. Adaptadores de fuentes: cada uno con permiso, propósito, datos mínimos, retención y revocación.

Esta lista es una separación conceptual, no autorización para crear colas, IDs, mecanismos de reintento, servicios o subsistemas no especificados.

## 8. Restricciones Android que deben verificarse en el POCO
No prometer operación indefinida. Verificar en el sistema real:
- Permiso de superposición y límites de su uso.
- Requisitos vigentes de foreground service y notificación persistente.
- Restricciones de ejecución en segundo plano, reinicio del proceso y optimización de batería.
- Permisos de micrófono y comportamiento con pantalla apagada.
- Acceso de notificaciones y calendario, incluyendo revocación.
- Accesibilidad, seguridad, rendimiento, consumo de batería, latencia y estabilidad.
- Comportamiento tras reinicio, cierre forzado, revocación de permisos y actualización del sistema.
Cualquier requisito de sistema o privilegio especial debe justificarse y evaluarse por separado; no asumir que root o bootloader desbloqueado son necesarios.

## 9. Posible modificación del dispositivo / sistema / bootloader
El propietario recordó que anteriormente autorizó considerar, si fuera necesario, modificar el teléfono o el sistema e incluso desbloquear el bootloader. Registrar como margen de exploración, no como decisión de hacerlo ni autorización para borrar datos o cambiar el dispositivo ahora.
Antes de cualquier intervención futura: demostrar necesidad frente a alternativas sin modificar el sistema; identificar modelo/variante, firmware, estado de bloqueo y consecuencias; investigar pérdida de datos, seguridad, garantía, actualizaciones, posibilidad de bloqueo irreversible y ruta de recuperación; respaldar los datos; explicar el plan y obtener confirmación específica justo antes de la acción irreversible. No ejecutar desbloqueo, root, flasheo ni cambios de firmware por inferencia. Preferir APIs y permisos oficiales si cumplen el objetivo.

## 10. Secuencia sugerida
1. Definir preferencias de iniciativa, horarios de silencio, privacidad y retención.
2. Prototipar tareas/recordatorios deterministas sin acciones externas.
3. Evaluar integración de calendario y notificaciones con permisos explícitos.
4. Implementar y evaluar avatar flotante/panel.
5. Investigar detección local de “Nexo” y medir consumo/fiabilidad en el POCO.
6. Añadir fuentes contextuales individualmente, solo con contrato y permiso específicos.
7. Al disponer de una PC concreta, validar los mismos contratos de producto mediante adaptadores de plataforma; no declarar compatibilidad antes de probarla.

## 11. Estado y continuidad
- Este documento registra el diseño acordado en conversación; por sí solo no implementa ni prueba ninguna capacidad.
- No se ejecutaron tests/CI ni se modificaron runtime, tests o workflows como parte de esta especificación.
- Mantener separado este trabajo de producto del cierre de NCS M0, las decisiones de autoridad inicial y los contratos de efectos protegidos.
- En un chat nuevo, leer primero STATUS → MASTER → CORE → handoff más reciente; después leer este documento para continuar el diseño de producto sin rehacerlo.
