# Handoff de continuidad — Investigación estática MIUI Backup.apk — 2026-11-22

**Propósito:** permitir que el siguiente chat continúe sin perder contexto, sin depender de la memoria conversacional y sin repetir trabajo ya realizado.

## Fuente de verdad y repositorio

- Repositorio: `snowdenxrp/aldea-ia`.
- Rama de trabajo: `backup-apk-static-research-2026-11-19`.
- Índice maestro: `BACKUP_APK_RESEARCH/00_MASTER_INDEX.md`.
- Última versión del índice verificada al actualizar este handoff: 1.13.
- Commit del índice v1.11 verificado antes de esta actualización: `9f89d32e4e7239a440ba813d488b97d1b7187d3b`.
- HEAD anterior a esta actualización del handoff: `925c2ae918c785479ce9a108d7d4930e2fa6546d`.
- Árbol local de trabajo referido por el usuario: `$HOME/backup-static/decoded`.
- APK investigado: MIUI `Backup.apk`; SHA-256 histórico registrado en el expediente: `36a5fc5f8e06881959004e4981bb905b656626211e8ab0472be2a30b8a6825ae`. No recalcular salvo necesidad.

**Regla absoluta:** GitHub y los archivos del expediente son la fuente de verdad. La memoria del asistente y los resúmenes de chat solo ayudan a localizar información; nunca sustituyen la verificación documental.

## Protocolo obligatorio antes de continuar

1. Recuperar el estado real de GitHub: rama, HEAD, índice maestro y evidencias relacionadas.
2. Consultar el índice maestro y las evidencias antes de pedir al usuario que repita algo o antes de ejecutar un comando.
3. Usar el índice histórico de títulos de chats (evidencias 95 y 109) para identificar conversaciones anteriores pertinentes. Si el contenido del chat no está disponible, decirlo claramente; no inventar lo que contenía.
4. Comparar cada posible hallazgo con el expediente para detectar duplicados.
5. No volver a ejecutar comandos, extracciones Smali, búsquedas grep ni análisis ya completados, salvo que exista una discrepancia concreta, falte evidencia primaria necesaria o la pregunta nueva requiera un dato no preservado.
6. Clasificar la procedencia con precisión: `LOCAL-VERIFIED`, `RECOVERED-CHAT`, `USER-PROVIDED`, `PROPOSAL`, `UNKNOWN`, etc. Un resumen de chat no se eleva a evidencia local verificada.
7. Todo delta nuevo y verificable se guarda en GitHub: archivo de evidencia, actualización del índice maestro y commit. Después volver a leer los archivos y verificar SHA/contenido/commit antes de afirmar que quedó guardado.
8. No depender de memoria persistente ni dejar continuidad importante únicamente en el chat. Actualizar este handoff o crear uno nuevo cuando cambie materialmente el estado.

## Estado documental al 2026-11-22

- Evidencias 106 y 107 están en el expediente:
  - 106: cierre de `CMD_RESTORE` en `BRService.onStartCommand`, incluida la rama vacía que llama `setState(mState, 0xC, 0x6)`.
  - 107: receptor `setState(III)V` / `setState(IIII)V`, mapeo de parámetros, escritura condicional de `mLastError` y propagación a `BRItem`.
- Evidencia 108 conserva el resumen histórico de `abortBackupAndRestore(I)V`: constructor `mLastError=0`; el método conserva `p1` solo si el campo sigue en cero; la sobrecarga sin argumentos llama con 3; las rutas directas resumidas aportan 7 en transferencia/espera de conexión. Está clasificada `RECOVERED-CHAT / USER-PASTED-SUMMARY`, no `LOCAL-VERIFIED`.
- Evidencia 109 conserva la lista consolidada de 40 títulos de chats transcritos de tres capturas, como índice de navegación, no como evidencia técnica.
- Evidencia 111 conserva cuatro SHA-256 y tamaños reportados para `BRService$5.smali`, `BRService.smali`, `BRService$FakeBackupListenerImp.smali` y `MiAsistService.smali`. Procedencia `USER-FACT / RECOVERED-CHAT` del 2026-11-19; no se recuperó stdout íntegro ni se recalcularon en esta sesión. Consultar la evidencia para los valores completos; no etiquetarlos como verificación local actual.
- Evidencia 112 conserva seis coordenadas físicas adicionales reportadas para `BRService$5.smali`: 2547, 2707, 3225, 3463, 3691 y 3801. Solo son anclas `RECOVERED-CHAT`; no asignar método, campo, valor ni condición. La lista completa y los duplicados excluidos están en la evidencia.
- Evidencia 113 conserva las coordenadas físicas 121 (`state`) y 123 (`error`) de `BRItem(BRItem)`, recuperadas de chat del 2026-11-20T04:41:25Z. La semántica de copia ya constaba en evidencia 41; 113 añade únicamente las coordenadas, no writers funcionales nuevos.
- El índice maestro fue actualizado a v1.13. Los hashes Smali están recuperados documentalmente en evidencia 111, las coordenadas adicionales de `BRService$5` en evidencia 112 y las coordenadas de copia `BRItem` en evidencia 113; su cotejo local sigue pendiente.

## Interpretación técnica conservadora de mLastError

- `setState(mState, 0xC, 0x6)`: por evidencia 107, `0xC` llega como `p2` y se asigna a `mWorkingStage`; `0x6` llega como `p4` y solo inicializa `mLastError` si su valor previo es cero.
- `abortBackupAndRestore(I)V`: según resumen recuperado en evidencia 108, también puede establecer `mLastError` si todavía vale cero.
- Las llamadas resumidas conocidas a `abortBackupAndRestore(I)V` aportan 3 y 7, no 6.
- Por tanto, no afirmar que el 6 termina almacenado: depende del valor previo de `mLastError` y del orden de las rutas.
- Mantener separados `mLastError`, `mWorkingStage`, `BRItem.state` y `BRItem.error`. No asignar significado semántico a 6/9 sin evidencia.
- No repetir las extracciones de las ventanas físicas 1590–1630, 8035–8080 y 13730–13775 solo para reconstruir lo ya resumido. Buscar primero si existe stdout literal en los chats/expediente.

## Índice de chats proporcionado por el usuario

Lista consolidada de títulos (40 entradas), útil para localizar trabajo previo. Los títulos truncados se mantienen literalmente; no inventar terminaciones:

1. Continuar investigación estática
2. Continuidad del análisis APK
3. Continuar investigación pendie...
4. Revisar referencias v8
5. Reconciliar Binder y procesos
6. Analizar implementación Binder
7. Consolidar investigación GitHub
8. Extraer métodos Parcelable
9. Verificar y guardar investigación
10. Reconstruir flujo BRService
11. Analizar unzipFiles
12. Verifica y guarda en Github
13. Inventario global smali
14. Extracción método smali
15. Inventario de estados smali
16. Inventario global de escrituras
17. Reconstruir Backupapk Histórica
18. Traducción de códigos
19. Análisis de estados BRItem
20. Inspeccionar Flujo Smali
21. Repetir comando grep
22. Resolver estado v3
23. Rastrear estados 6 7 8
24. New chat
25. Analizar ProgressItemAdapter
26. Opinión sobre FreeLLMAPI
27. Identificar procesador laptop
28. Análisis de finalización de tare...
29. Análisis de copia local
30. Analizar preparación restauraci...
31. Revisar flujo de restauración
32. Analizar finalización restauraci...
33. Restaurar variable F
34. Análisis de restauración
35. Extracción estática de activaci...
36. Análisis de restauración Android
37. Análisis estático Binder
38. Continuar análisis estático
39. Analizar Backup.apk
40. Continuar investigación G08

La evidencia 95 conserva una lista anterior y la 109 la amplía. Antes de volver a pedir al usuario datos ya compartidos, consultar ambas y el índice maestro.

## Próximo punto de continuación

Antes de extraer nada, comprobar si el usuario necesita cotejar los cuatro hashes/tamaños de evidencia 111 o inspeccionar las seis coordenadas nuevas de evidencia 112 o cotejar las coordenadas 121/123 de evidencia 113; no recalcular ni extraer por rutina. Continuar el análisis causal de `mLastError` solo después de buscar en las conversaciones anteriores y en GitHub si ya está preservada la salida Smali literal de constructor, `abortBackupAndRestore(I)V` y sus sitios de llamada. No ejecutar de nuevo las extracciones si el material ya existe. Si la salida literal no puede recuperarse, conservar la limitación como `RECOVERED-CHAT` y preguntar al usuario únicamente si una cuestión nueva exige ese cotejo.

## Restricciones de trabajo

- Investigación estática; no ejecutar restauraciones, pruebas runtime ni modificar el APK.
- No cambiar de rama ni hacer cambios ajenos al alcance sin autorización.
- No declarar un hallazgo guardado sin commit y verificación posterior.
- Evitar duplicar evidencias; preservar solo deltas nuevos.
