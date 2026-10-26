# Protocolo operativo de colaboración entre IAs — Nexo/NCS (2026-10-26)

## Estado

- Tipo: pauta operativa documental.
- Alcance: coordinación de revisiones externas, conservación de evidencia y control de consumo.
- No es una decisión constitucional ni una autorización de implementación.
- No modifica runtime, tests, workflows, CI, APK ni dispositivo.
- Las recomendaciones de cualquier IA siguen siendo propuestas hasta que el propietario las acepte explícitamente.

## Objetivo

Aprovechar ChatGPT, Claude, Perplexity, Gemini y Qwen sin repetir investigaciones cerradas, desperdiciar contexto/recursos ni convertir opiniones en hechos verificados.

## Distribución de funciones

- **ChatGPT — coordinación principal:** mantener el hilo de trabajo, consultar primero el estado canónico de NCS, delimitar tareas, comparar resultados, mantener la distinción entre evidencia y propuesta y verificar los archivos que se registren en GitHub.
- **Claude — recurso de uso moderado:** reservarlo para preguntas de alto valor, revisión independiente de un punto concreto, contradicciones entre informes o análisis acotados que no estén ya resueltos. Evitar encargos abiertos, lectura repetida del repositorio completo y solicitudes que dupliquen trabajo disponible. Preparar antes el contexto mínimo necesario y pedir un resultado definido.
- **Perplexity — investigación con fuentes:** usarlo cuando hagan falta fuentes primarias actuales, trazabilidad de afirmaciones o una revisión documental sustentada en referencias.
- **Gemini — contraste complementario:** utilizarlo para una revisión delimitada o una segunda perspectiva cuando exista una pregunta pendiente concreta.
- **Qwen — contraste técnico complementario:** utilizarlo para tareas acotadas de análisis o contraste cuando aporte una perspectiva adicional.

Esta distribución es pragmática, no una afirmación de que una IA sea siempre superior en una categoría. Las funciones pueden cambiar si la evidencia o las capacidades disponibles cambian.

## Formato recomendado para cada encargo externo

Cada solicitud debe incluir, cuando corresponda:

1. **Pregunta única y concreta.**
2. **Contexto mínimo suficiente:** enlaces, commit/branch y documentos existentes relevantes.
3. **Alcance y exclusiones:** qué revisar y qué no revisar; no volver a abrir auditorías cerradas sin un defecto nuevo.
4. **Resultado esperado:** conclusiones, evidencia exacta, incertidumbres y limitaciones.
5. **Restricciones de ejecución:** no modificar archivos, no ejecutar pruebas/CI ni implementar cambios salvo autorización explícita independiente.
6. **Criterio de cierre:** la tarea termina cuando responde la pregunta o declara con precisión qué evidencia falta.

Para Claude, preferir una tarea breve con un límite claro de archivos/tema y reutilizar los resultados existentes. No solicitar un barrido total por defecto.

## Flujo de evidencia

1. Leer `NEXO_NCS/STATUS.md` como puerta de entrada; seguir `MASTER/CORE → BUILD → trabajo actual` según las instrucciones canónicas vigentes.
2. Identificar qué evidencia ya existe antes de asignar una nueva revisión.
3. Formular solo la pregunta abierta que pueda cambiar una decisión o cerrar una incertidumbre relevante.
4. Recibir el informe y separar: hechos observados, inferencias, propuestas, incógnitas y limitaciones.
5. Archivar el informe sin atribuirle aprobación del propietario.
6. Volver a leer el archivo remoto de GitHub y comprobar contenido, ruta, rama, commit/blob y secciones esperadas.
7. Registrar cualquier limitación de integridad: si se reconstruyó desde mensajes, no afirmar que es idéntico byte por byte al original sin comparar el original.
8. Consolidar hallazgos entre informes solo después de verificar qué documentos existen realmente.

## Reglas de decisión y seguridad

- Una afirmación externa no es prueba de runtime ni de CI.
- No marcar como implementado o verificado por CI algo que solo sea una propuesta documental.
- `UNKNOWN` es un resultado válido; no rellenar vacíos por inferencia.
- No seleccionar opciones arquitectónicas ni ratificar decisiones constitucionales en nombre del propietario.
- No autorizar efectos protegidos sin evidencia independiente de autoridad legítima y de la frontera real de ejecución.
- No cambiar código, runtime, tests, workflows, ramas principales, APK o dispositivo como consecuencia implícita de un informe.
- No repetir una auditoría cerrada salvo evidencia nueva, contradicción concreta o cambio verificable de código/estado.

## Estado conocido al registrar esta pauta

- El informe de Perplexity sobre persistencia y durabilidad está archivado en `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/2026-10-26_PERPLEXITY_PERSISTENCE_DURABILITY.md` en la rama `ncs-clean-architecture`; el archivo remoto fue recuperado y comprobado en esta sesión.
- La revisión técnica es documental; no ejecutó tests, CI ni scripts.
- La copia archivada fue reconstruida desde bloques de conversación. No se ha demostrado identidad byte por byte con el original ni se ha validado el SHA-256 original.
- Este documento registra una pauta de trabajo; no certifica que los conectores o permisos de cada IA estén configurados ni que todas las revisiones externas estén archivadas.
- El estado de aceptación de M0 y cualquier autorización de ejecución se rigen por el estado canónico de NCS, no por esta pauta.
