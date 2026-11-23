# Evidencia 117 — segmento Smali directo de showFinishNotification — 2026-11-23

**Archivo/método:** `BRService.smali`, `showFinishNotification(IIILjava/util/ArrayList;)V`.
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-GREP-OUTPUT`. El usuario compartió en esta conversación la salida de:
```sh
grep -n -A180 -B10 'showFinishNotification' "$HOME/backup-static/decoded/smali/com/miui/backup/service/BRService.smali"
```
La salida contiene el encabezado del método y su segmento físico 14394–14574. Se trata de una salida de grep aportada por el usuario; no se ejecutó el comando de forma independiente en este entorno. Clasificación: **fragmento Smali directo compartido por el usuario; no verificación local independiente**.

## Segmento confirmado por la salida compartida

- Física 14394: encabezado `.method private showFinishNotification(IIILjava/util/ArrayList;)V`.
- La anotación de firma declara tres enteros y una `ArrayList<BRItem>`.
- Física 14408: llama `stopForeground(true)`.
- Lee `mIsTransingTask`.
- Si `mIsTransingTask == true`, crea un `Intent` sin acción funcional identificada en el fragmento, crea un `ComponentName` cuyos dos nombres son literalmente `SHOULDN'T RESOLVE!`, lo asigna como componente, asigna el mismo literal como acción y categoría, y salta a `:goto_4`. No atribuir propósito adicional a ese Intent.
- Si no está en transferencia, comprueba `mIsFlashDriveTask`.
  - Para tarea flash-drive, compara `p1) con 3 y selecciona el recurso `0x7f1202d6` si coincide o `0x7f1202d7` si no.
  - En la ruta no flash-drive, comprueba `miui.os.Build.IS_TABLET`; tanto la rama tablet como la no-tablet comparan `p1) con 3 y seleccionan respectivamente `0x7f1202b2` / `0x7f1202b4` (tablet) o `0x7f1202b1` / `0x7f1202b3` (no-tablet).
- Obtiene el contexto de aplicación y calcula `DensityUtil.getSwDp(context)`; compara el resultado con `0x258` (600).
  - Para ancho inferior a 600, si no es tablet, establece el booleano de selección en falso.
  - En la ruta restante, lo establece en verdadero.
- En la rama verdadera construye un Intent con acción `miui.intent.backup.PROGRESS_PAGE_ACTIVITY`, lo envuelve en otro Intent con acción `android.settings.SETTINGS_EMBED_DEEP_LINK_ACTIVITY`, usa `replaceExtras`, serializa el Intent interno mediante `toUri(1)` y lo añade bajo `android.provider.extra.SETTINGS_EMBEDDED_DEEP_LINK_INTENT_URI`.
- En la rama falsa crea un Intent explícito hacia `ProgressPageActivity`.
- A continuación (hasta física 14574) añade `action=com.miui.backup.activity.ACTION_VIEW_BRRESULT` y calcula el extra `localBackup` como `mIsFlashDriveTask xor v4`, donde `v4) es el resultado de invertir el booleano inicializado desde 1. No simplificar esta expresión fuera del contexto de la ruta.
- La salida se corta en física 14574 inmediatamente después de cargar la clave literal `extra_last_task_state`; no muestra todavía su `putExtra` ni el resto del método.

## Reconciliación con evidencias 114–116

- Evidencia 114 ya conservaba el transporte general a la pantalla de resultados y la notificación, pero como resumen histórico.
- Evidencia 115 ya conservaba la acción `ACTION_VIEW_BRRESULT`, el nombre de `localBackup`, los extras globales y el literal `SHOULDN'T RESOLVE!`, también recuperados históricamente.
- Evidencia 116 ya conservaba la limpieza de `p4), el envío de `extra_last_britems` y referencias del consumidor.
- **Delta de esta evidencia:** no vuelve a contar esos elementos como hallazgos nuevos. Añade el segmento Smali directo visible en esta conversación y precisa el control de flujo de la construcción del Intent, selección de recursos por tipo/estado, bifurcación tablet/ancho y creación del deep link; además permite cotejar directamente la parte inicial del método contra los resúmenes previos.

## Límites

- No se recibió el método completo: el bloque termina en 14574.
- No están visibles en este fragmento las instrucciones posteriores de los extras globales, el transporte de `p4), `clearLocalFiles), `PendingIntent), creación/publicación de notificación ni el destino `:goto_4`.
- No se observa aquí ninguna llamada a `onRestoreEnd()`, `onError()` u otro callback. Esto **no demuestra que el método completo carezca de callbacks**.
- El argumento `v4) del XOR es un registro cuyo valor se deriva de la bifurcación de interfaz descrita; no equipararlo con una variable de dominio ni interpretar `localBackup) sin conservar la ruta exacta.
- La salida no demuestra ejecución dinámica, éxito de restauración ni resultado individual por elemento.

**Estado:** segmento inicial de `showFinishNotification()` recibido directamente en el chat; el análisis de la continuación del método y de los callbacks del consumidor sigue pendiente.
