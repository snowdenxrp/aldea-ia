# Workflow de preservación — MIUI Backup.apk

**Fuente principal:** este directorio en GitHub, rama backup-apk-static-research-2026-11-19.  
**Rama base:** main (sin modificaciones).  
**Principio:** append-only; evidencia original nunca se sobrescribe.

## Estructura

- 00_MASTER_INDEX.md: estado actual, conclusiones y enlaces a evidencia.
- 01_RECOVERY_AUDIT_2026-11-19.md: auditoría histórica y de repositorios.
- WORKFLOW.md: este protocolo.
- evidence/YYYY-MM-DD/: registros por sesión, con comandos, salidas y fragmentos Smali exactos.
- sources/: fuentes externas públicas y metadatos de procedencia; no almacenar APKs propietarios ni credenciales.

## Registro de cada sesión

1. Crear un nuevo archivo fechado; no reemplazar evidencia de días anteriores.
2. Preservar literalmente el comando, stdout/stderr, fragmento Smali y líneas de origen cuando estén disponibles.
3. Anotar archivo, método, línea, variables/registros, contexto, clasificación y qué NO demuestra.
4. Separar evidencia directa, resumen recuperado, inferencia, hipótesis y UNKNOWN.
5. Actualizar el índice con enlaces al nuevo archivo; nunca eliminar la historia previa.
6. Hacer un commit pequeño por sesión o lote lógico, con mensaje descriptivo y SHA registrado.
7. Mantener la rama separada de main y de todas las ramas NCS. No hacer merge sin decisión explícita del propietario.

## Etiquetas probatorias

- DIRECT-CHAT: fragmento o salida exacta pegada por el usuario.
- LOCAL-VERIFIED: reconsultado en el checkout local, con ruta/sha del archivo.
- GITHUB-SOURCE: contenido o commit remoto directamente inspeccionado.
- RECOVERED-SUMMARY: dato recuperado solo de resumen de chat.
- INFERENCE / HYPOTHESIS: interpretación no cerrada.
- UNKNOWN / STOP: falta evidencia o la acción está fuera de autorización.

## Integridad y seguridad

- No modificar el APK ni realizar operaciones de backup/restore, servicios, tests dinámicos o acciones de dispositivo.
- No subir el APK propietario ni datos sensibles.
- Conservar SHA-256 del APK y hashes de archivos fuente cuando se puedan calcular con autorización y desde los bytes correctos.
- Los hashes identifican bytes; no prueban por sí solos origen, autorización ni veracidad.
- Mantener separadas las capas BRItem.state, BRItem.error, códigos del listener, estado/etapa/error global de BRService, mLastError y recursos de notificación.
- Registrar explícitamente las contradicciones; no resolverlas por intuición.

## Estado inicial

Esta rama se crea para restaurar continuidad documental. El primer commit incorpora la versión 0.2 del índice, la auditoría de recuperación y este workflow. No contiene el APK ni reemplaza la extracción local. La recuperación de transcripciones y bloques Smali completos continúa abierta.
