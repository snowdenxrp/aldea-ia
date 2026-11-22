# Evidencia 115 — claves literales y extras de showFinishNotification — 2026-11-22

**Archivo/método:** `BRService.smali`, `showFinishNotification(IIILjava/util/ArrayList;)V`.
**Procedencia:** `USER-PASTED-SMALI / RECOVERED-CHAT`, mensajes del usuario del 2026-11-19T19:30:56Z y 2026-11-19T19:31:46Z.
**Clasificación:** fragmento histórico compartido por el usuario, recuperado mediante memoria de conversaciones. No se dispone en esta sesión del mensaje íntegro ni del stdout original para cotejarlo localmente. No `LOCAL-VERIFIED`.

## Datos literales recuperados

- Acción del Intent: `com.miui.backup.activity.ACTION_VIEW_BRRESULT`, asignada mediante `putExtra("action", "com.miui.backup.activity.ACTION_VIEW_BRRESULT")`.
- Extra booleano: `localBackup`; su valor se describió como `mIsFlashDriveTask xor v0`. No se recuperó la definición ni el valor de `v0`; por tanto, no simplificar ni interpretar el XOR.
- Extras globales y argumentos:
  - `extra_last_task_state` recibe `p1`.
  - `extra_last_workingstage` recibe `p2`.
  - `extra_last_errcode` recibe `p3`.
- Extra de lista: `extra_last_britems` recibe `p4) mediante `putParcelableArrayListExtra`, después de la llamada a `clearLocalFiles(p4)` en la ruta descrita.
- Literal presente en el bloque: `SHOULDN'T RESOLVE!` (preservado tal cual; no asignarle significado funcional sin contexto adicional).
- La firma recuperada es `showFinishNotification(IIILjava/util/ArrayList;)V`.

## Coordenadas reportadas y continuidad

- El bloque principal fue compartido como líneas físicas 14394–14574.
- El usuario informó una continuación posterior: `extra_last_workingstage` en líneas físicas 14577–14580 y `extra_last_errcode` en 14582–14585.
- La continuación recuperada también menciona `extra_title`, `clearLocalFiles`, `extra_last_britems`, `PendingIntent` y `getFinishNotificationTitle`, pero no conserva el Smali literal completo ni las coordenadas exactas de esos elementos.
- El resumen histórico del asistente también menciona `stopForeground(true)`, selección de recursos para `p1==3` y variantes tablet/ `getSwDp()`; al no haberse recuperado aquí el bloque literal que sustenta esos detalles, se mantienen como resumen secundario, no como hallazgo primario de esta evidencia.

## Reconciliación con evidencia 114 y límites

Evidencia 114 ya documentaba el flujo general: transporte de resultado, condición `p4 != null`, `clearLocalFiles`, cálculo de título/error y notificación ID `0x7f120037`. Esta evidencia 115 añade los nombres literales recuperados de los extras de estado/etapa/error, la acción del Intent, el extra `localBackup` y el XOR reportado. La afirmación de evidencia 114 de que no se habían recuperado los nombres literales de los tres primeros extras queda superada por esta recuperación posterior.

No se recuperaron aquí:
- El método Smali completo y sus instrucciones contiguas.
- La definición de `v0` usada en `mIsFlashDriveTask xor v0`.
- Los argumentos completos de `PendingIntent`, `createNotification` o la llamada final a `notify`.
- Los callbacks o el procesamiento posterior en la pantalla `ACTION_VIEW_BRRESULT`.

No inferir que el Intent se ejecuta en todas las ramas ni que la notificación acredita éxito de Backup/Restore. No extrapolar las coordenadas de la continuación más allá de las dos parejas expresamente recuperadas.

**Estado:** delta documental de nombres literales y transporte de extras, recuperado de mensajes históricos del usuario; bloque original completo y cotejo local pendientes.
