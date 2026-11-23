# Evidencia 118 — continuación y cierre de showFinishNotification — 2026-11-23

**Archivo/método:** `BRService.smali`, `showFinishNotification(IIILjava/util/ArrayList;)V`.
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-SED-OUTPUT`. El usuario compartió la salida de `sed -n '14570,14780p' .../BRService.smali`. Se preserva únicamente el tramo que pertenece a `showFinishNotification()`; el texto posterior de `showWorkingNotification()` no se analiza en esta evidencia.
**Clasificación:** fragmento Smali directo compartido por el usuario; no se ejecutó ni cotejó localmente de forma independiente.

## Instrucciones observadas en la continuación

1. Añade al Intent los extras globales:
   - `extra_last_task_state = p1` (línea fuente `.line 4957`).
   - `extra_last_workingstage = p2` (`.line 4958`).
   - `extra_last_errcode = p3` (`.line 4959`).
   - `extra_title = v1` (`.line 4960`).

2. La lista individual se trata condicionalmente:
   - `if-eqz p4, :cond_9`: si `p4 == null`, omite limpieza y extra de lista.
   - Si `p4 != null`, invoca `clearLocalFiles(p4)`.
   - Después agrega la misma lista mediante `putParcelableArrayListExtra("extra_last_britems", p4)`.
   - Luego mueve el Intent a `p4` y continúa hacia `:goto_4`.

3. Construye un `PendingIntent`:
   - `PendingIntent.getActivity(p0, v2, p4, 0x0c000000)`.
   - El registro `p4` pasa a contener el PendingIntent resultante tras `move-result-object p4`.
   - El fragmento no permite inferir más allá de los argumentos visibles qué comportamiento efectivo tendrá ese PendingIntent en runtime.

4. Prepara título y recurso de error para la notificación:
   - Lee `mIsTransingTask).
   - Llama a `getFinishNotificationTitle(mIsTransingTask, p1, p2)`; el resultado reemplaza `p2`.
   - Llama a `getErrStringRes(p1, p3)`; el resultado reemplaza `p1`.

5. Publica la notificación:
   - Obtiene `mNotificationManager`.
   - Usa ID `0x7f120037`.
   - Llama a `NotificationUtils.createNotification(p0, p2, p1, p4, v0)`.
   - Pasa el resultado a `NotificationManager.notify(id, notification)`.
   - Ejecuta `return-void); inmediatamente después comienza `.method private showWorkingNotification()V`, por lo que queda confirmado el final del método analizado.

## Conclusión técnica actualizada

`showFinishNotification()` no comunica exclusivamente el resultado global. El Intent de navegación contiene los tres campos globales (`p1`, `p2`, `p3)) y, cuando `p4 != null`, también transmite la lista `ArrayList<BRItem>` bajo `extra_last_britems`, después de aplicar `clearLocalFiles(p4)`.

Esto confirma el **transporte de la lista** a la pantalla de resultados; no demuestra por sí solo cómo `ProgressPageFragmentBase` interpreta, representa o procesa cada elemento. Tampoco demuestra callbacks `onRestoreEnd()`/`onError()`, notificaciones individuales por aplicación ni el significado semántico del estado 3.

La notificación visible es una sola llamada a `NotificationManager.notify(0x7f120037, ...)` en este método. No extrapolar de ello que no existan otras notificaciones en otros métodos.

## Reconciliación / no duplicación

Los resúmenes históricos de evidencias 114–116 ya mencionaban los nombres de extras, la llamada a `clearLocalFiles), el envío de `extra_last_britems`, el PendingIntent, los métodos de título/error y el ID de notificación. Esta evidencia **no presenta esos elementos como hallazgos conceptuales nuevos**: añade el fragmento Smali directo de la continuación, confirma el orden de instrucciones, la condición `p4 != null`, los argumentos visibles y el cierre efectivo del método.

Evidencia 117 conserva el segmento directo anterior (14394–14574). Evidencia 118 lo complementa; ambas partes juntas cubren el cuerpo compartido de `showFinishNotification()` hasta `.end method`.

## Pendiente real

El siguiente análisis útil ya no es volver a extraer `showFinishNotification()`. Corresponde seguir el consumidor de:
- acción `com.miui.backup.activity.ACTION_VIEW_BRRESULT`;
- extra `extra_last_britems`;
- extras globales `extra_last_task_state`, `extra_last_workingstage`, `extra_last_errcode` y `extra_title`.

En particular, obtener el cuerpo del receptor en `ProgressPageFragmentBase.smali` para determinar qué hace con la lista y si consulta cada `BRItem.state/error`. Las referencias históricas a las líneas físicas 541 y 2397 no sustituyen el cuerpo del receptor.

**Estado:** `showFinishNotification()` completo según los dos fragmentos Smali compartidos en este chat; análisis del consumidor de resultados sigue pendiente. Sin verificación local independiente ni evidencia runtime.
