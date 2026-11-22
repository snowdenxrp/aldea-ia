# Evidencia 114 — transporte de resultado en showFinishNotification — 2026-11-22

**Archivo/método:** `BRService.smali`, `showFinishNotification(IIILjava/util/ArrayList;)V`.
**Procedencia:** `PRIOR_ASSISTANT_SUMMARY / RECOVERED-CHAT`, derivado de material Smali que el usuario compartió en el chat del 2026-11-17/18. El historial recuperado sitúa el bloque inicial alrededor de la línea física 14394 y señala que una extracción `grep -A180` quedó truncada en 14574; el usuario aportó después una continuación desde aproximadamente 14570. En esta recuperación no se volvió a obtener el texto literal completo.
**Clasificación:** detalle de flujo recuperado de resumen de asistente basado en fuente compartida; no `LOCAL-VERIFIED` en esta sesión. No elevar el resumen a transcripción Smali primaria.

## Delta recuperado

El resumen histórico describe que el método:

1. Transporta los parámetros globales `p1`, `p2` y `p3` a extras de la pantalla de resultados, correspondientes a estado global, etapa de trabajo y código de error. Los nombres literales completos de las tres claves no se conservaron en el resumen recuperado; no reconstruirlos.
2. Si `p4 != null`, llama a `clearLocalFiles(p4)` y agrega la lista mediante `putParcelableArrayListExtra` bajo la clave `extra_last_britems`.
3. Calcula por separado título y recurso de error:
   - `getFinishNotificationTitle(mIsTransingTask, p1, p2)`.
   - `getErrStringRes(p1, p3)`.
4. Pasa el resultado a `NotificationUtils.createNotification(...)` y publica la notificación mediante `NotificationManager.notify(0x7f120037, ...)`.

La recuperación independiente del 2026-11-19 también resumía las llamadas a `getFinishNotificationTitle(ZII)` y `getErrStringRes(II)`; el índice maestro ya conserva la lógica y los mapeos de recursos de esos métodos. El delta de esta evidencia es el detalle de transporte a la pantalla de resultados, la condición de `p4`, la clave `extra_last_britems` y el identificador de notificación.

## Reconciliación y límites

- `clearLocalFiles()` ya está documentado como limpieza de `localFileList` para `BRItem.packageName == "files_for_backup"`; no se vuelve a registrar como comportamiento nuevo ni se afirma que modifique `state/error`.
- `handleTaskFinish(IIILjava/util/ArrayList;)V` y su llamada a `showFinishNotification(p1,p2,p3,p4)` ya están descritos en el expediente.
- No se recuperaron el bloque Smali literal completo, las claves literales de los tres primeros extras, el Intent completo, los argumentos completos de `createNotification` ni los callbacks posteriores de la pantalla de resultados.
- No inferir que la notificación pruebe que una restauración concluyó correctamente; el método comunica el resultado recibido.
- No afirmar que `p4` siempre sea no nulo ni que la limpieza se ejecute en todas las rutas.

**Estado:** delta de flujo de notificación y transporte de resultado recuperado de conversación; fuente literal completa y cotejo local pendientes.


## Nota de actualización documental — evidencia 115

Una recuperación posterior de mensajes del usuario del 2026-11-19T19:30:56Z y 19:31:46Z permitió recuperar los nombres literales `extra_last_task_state`, `extra_last_workingstage` y `extra_last_errcode`, además de la acción Intent `com.miui.backup.activity.ACTION_VIEW_BRRESULT` y el extra `localBackup`. Véase [evidencia 115](115_SHOW_FINISH_NOTIFICATION_LITERAL_EXTRAS_RECOVERED.md). Por tanto, la limitación anterior sobre nombres no recuperados queda superada. La recuperación no aporta el método completo ni verificación local.
