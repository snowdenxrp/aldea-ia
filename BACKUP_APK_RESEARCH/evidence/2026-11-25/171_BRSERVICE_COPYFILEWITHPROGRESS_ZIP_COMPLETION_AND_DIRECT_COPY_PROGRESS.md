# Evidencia 171 — BRService.copyFileWithProgress: cierre de rama ZIP y progreso de copia directa — 2026-11-25

## Fuente y alcance

Salida compartida por el usuario desde Termux:

```bash
D="$HOME/backup-static/decoded/smali/com/miui/backup/service"
sed -n '4740,4880p' "$D/BRService.smali"
```

Es la continuación inmediata de la ventana 4600–4740 preservada en E170. El fragmento termina dentro de la preparación de una notificación de progreso en la rama de copia directa; no muestra el final del método.

## Observaciones directas

### Continuación de la rama ZIP Flash Drive

- La resta entre el tiempo actual y la marca temporal previa se compara con el umbral almacenado en `v21`. Si se supera, y `mIsLocalBackupTask` es false, llama a `notifyTransFileProgressChange` con etapa/estado 2, ruta absoluta del origen (`p2`), destino null, bytes acumulados (`v18`) y longitud total (`v16`).
- Después actualiza la marca temporal con un nuevo `SystemClock.elapsedRealtime()` y vuelve al bucle.
- En `:cond_6`, al salir del bucle ZIP, obtiene `mZipOutputStream`, llama a `closeEntry(ZipOutputStream)` y cierra silenciosamente el InputStream referenciado por `v12` mediante `IOUtils.closeQuietly(InputStream)`. Después salta a `:goto_7`.
- La ventana no muestra qué hace `:goto_7` ni los handlers de esta rama.

### Rama de copia directa File → File

- En `:cond_7`, crea un `FileInputStream` sobre el objeto File referenciado por `v11` y un `FileOutputStream` sobre el destino `p3`.
- Crea un búfer de `0x1000` (4096 bytes / 4 KiB).
- Lee repetidamente con `FileInputStream.read(byte[])`. Mientras el resultado no sea negativo, escribe mediante `FileOutputStream.write(byte[],0,count)` y suma `count` a `v18`.
- Después de cada escritura consulta `SystemClock.elapsedRealtime()` y compara el tiempo transcurrido con el umbral `v21`.
- Si se supera el umbral y `mIsLocalBackupTask` es false, prepara una notificación de etapa/estado 2. El origen comunicado es la ruta absoluta de `p2`.
- Para el destino comunicado, compara `v10` con `v15`: si son iguales, usa `v20`; si no, obtiene la ruta absoluta de `p3`. La ventana termina mientras prepara y mueve los argumentos de esta notificación; no muestra la invocación completa ni la actualización temporal posterior.

## Dedupe y límites

- E170 conserva la preparación del método y el inicio del bucle ZIP. E171 añade la notificación periódica de esa rama, el cierre de su entrada ZIP y del InputStream, y el inicio de la rama File → File.
- La rama ZIP y la copia directa son rutas distintas. No generalizar el cierre observado en la rama ZIP a la rama File → File.
- La llamada a `closeEntry` demuestra que el método solicita cerrar la entrada ZIP en este punto; no se infiere el comportamiento interno de ese método.
- En la rama File → File todavía no se observa cierre de `FileInputStream` ni de `FileOutputStream`, flush/sync, handlers, retorno ni limpieza de destino parcial.
- El bucle directo usa `if-ltz` para detectar EOF; por tanto, esta ventana no permite afirmar que un resultado de lectura igual a cero termine el bucle.
- No se atribuye semántica a `v10`, `v15` o `v20` más allá de la comparación y selección de destino observadas.
- No se conoce aún el destino de `:goto_7`, ni el cuerpo de `closeEntry`.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente INCOMPLETO.
