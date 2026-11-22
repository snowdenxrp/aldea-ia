# Handoff de continuidad — Investigación estática MIUI Backup.apk — 2026-11-22

**Propósito:** permitir que el siguiente chat continúe sin perder contexto, sin depender de la memoria conversacional y sin repetir trabajo ya realizado.

## Fuente de verdad y repositorio

- Repositorio: `snowdenxrp/aldea-ia`.
- Rama de trabajo: `backup-apk-static-research-2026-11-19`.
- Índice maestro: `BACKUP_APK_RESEARCH/00_MASTER_INDEX.md`.
- Última versión del índice verificada al actualizar este handoff: 1.16.
- Commit del índice v1.11 verificado antes de esta actualización: `9f89d32e4e7239a440ba813d488b97d1b7187d3b`.
- HEAD de rama verificado antes de esta actualización del handoff: `3500f7b5776b867d95787278c69dba1afcb42669`.
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
- Evidencia 114 conserva el resumen del transporte de resultado en `showFinishNotification(IIILjava/util/ArrayList;)V` y la notificación ID `0x7f120037`; su limitación sobre nombres literales fue complementada por evidencia 115.
- Evidencia 115 recupera de mensajes del usuario del 2026-11-19T19:30:56Z y 19:31:46Z los extras literales `extra_last_task_state=p1`, `extra_last_workingstage=p2`, `extra_last_errcode=p3`, acción `com.miui.backup.activity.ACTION_VIEW_BRRESULT`, `localBackup=mIsFlashDriveTask xor v0`, `extra_last_britems=p4` tras `clearLocalFiles`, y el literal `SHOULDN'T RESOLVE!`. Coordenadas reportadas: bloque 14394–14574; continuación workingstage 14577–14580 y errcode 14582–14585. No se recuperó método completo ni definición de `v0`.
- Auditoría adversarial: la memoria confirma que el usuario pegó los fragmentos A–D literales de `startRestoreCommand` el 2026-11-17T03:27:35Z, pero la búsqueda actual no recuperó el payload. Evidencia 94 fue anotada; no reconstruir A–D desde resúmenes. El mensaje de 03:29:25Z contenía una salida parcial de `CMD_RESTORE`, cuya continuación posterior ya está en evidencia 94.
- El stdout completo del barrido global `BRItem.state/error` del 2026-11-19T22:37:46Z no se recuperó; una conversación del 2026-11-20 confirma que ese stdout no estaba en la memoria disponible. No sintetizar coincidencias desde resúmenes parciales.
- El índice maestro fue actualizado a v1.16. Las evidencias 111–115 conservan hashes/tamaños reportados, coordenadas adicionales de `BRService$5`, coordenadas de copia `BRItem` y detalles de transporte/notificación; su cotejo local sigue pendiente.

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

## Auditoría adversarial de memoria persistente — 2026-11-22

Se realizó una búsqueda dirigida de recuerdos y resúmenes históricos posteriores a la consolidación v1.13. El cotejo se hizo contra el índice maestro y las evidencias vigentes; este apartado registra resultados de deduplicación y límites, no crea evidencia técnica nueva.

### Candidatos recuperados y reconciliación

- **Barrido global `BRItem.state/error` (chat 2026-11-19T22:36–22:39Z):** un resumen histórico de salida grep enumeraba `ArchiveHelper.smali:1741`, `CompatibilityActivity$1.smali:144/152`, `ProgressPageFragmentBase.smali:625`, `BRService$6.smali:1557/2101/2128/2495` y `BRService$7.smali:53/58`. Ya están reconciliados en las secciones/evidencias 70, 76 y 77; no duplicar. En particular, `ArchiveHelper:1741` se reconcilió con el writer `error=1` de evidencia 27; `ProgressPageFragmentBase:625` conserva ambigüedad entre coordenada física y directiva `.line`.
- **Propagaciones en `BRService.smali`:** los resúmenes citan `6855–6862` (copia entre objetos), `7004/7009` y `17431–17436` (propagación `PkgInfo.state/error` a `BRItem`). El índice ya conserva `6855–6857` como resumen de menor procedencia y las referencias 7004/7009 y 17431–17436 en la sección 46. No extender el rango 6855–6857 hasta 6862 ni atribuir semántica adicional sin el bloque Smali literal.
- **`BRService$6` lectura en 1877:** un resumen previo la describía como `iget ...->error:I`; el índice ya registra la lectura reportada en 1877 y la lectura de 2518 (sección 83). No es una definición de `v8` ni resuelve el valor escrito en `error` en 2101.
- **Rama de `BRService$6` 2110–2128:** el bloque histórico recuperado indica que `equals()` verdadero conserva `state` y falso asigna 1. Ya está documentado en evidencia 82; no identificar la cadena comparada como `files_for_backup` sin recuperar su definición.
- **`startRestoreCommand` (5 y 7 argumentos):** los resúmenes y las llamadas históricas están recogidos en evidencia 94. Los fragmentos A–D literales no se recuperaron en esta búsqueda; no reconstruirlos.
- **`handleTaskFinish` / `showFinishNotification()`:** `handleTaskFinish(IIILjava/util/ArrayList;)V` ya está documentado. Evidencias 114–115 preservan resumen del flujo y claves literales recuperadas del Intent. El cuerpo Smali completo y la definición de `v0` siguen pendientes.
- **`ArchiveHelper.unzipFiles`:** el resumen recuperado sobre ZIP, temporales y `BRItem.error=1` no se elevó a hallazgo nuevo porque la escritura `error=1` ya está reconciliada con evidencia 27 y el contexto literal adicional no fue recuperado en esta búsqueda.
- **`BRService$5` registros `v10/v14`:** una conversación indica que el barrido para resolver sus inicializaciones no se ejecutó por un error tipográfico en el comando. No existe stdout de ese barrido; no inferir valores ni repetirlo sin necesidad específica.

### Conclusión y siguiente recuperación

La auditoría amplió la recuperación de `showFinishNotification()` con evidencia 115 y actualizó la evidencia 94 para dejar constancia de que los fragmentos A–D literales fueron pegados históricamente pero no pudieron recuperarse en esta búsqueda. El índice queda en v1.16. El stdout completo del barrido global `BRItem.state/error` tampoco está disponible en memoria. Próximo avance: recuperar el mensaje original A–D o el bloque Smali completo de `showFinishNotification()`; no reconstruir lo ausente.

**Procedencia de esta auditoría:** búsqueda de memoria persistente y resúmenes de asistente; cotejo documental contra el índice v1.13 y evidencias 27, 70, 76, 77, 82, 83 y 94. No es evidencia Smali primaria ni verificación local del APK.
