# Evidencia 168 — BRService.copyFileFromStream: progreso, sync y cierre normal — 2026-11-25

## Fuente y alcance

Salida compartida por el usuario desde Termux:

```bash
D="$HOME/backup-static/decoded/smali/com/miui/backup/service"
sed -n '4340,4500p' "$D/BRService.smali"
```

La ventana continúa el método privado `copyFileFromStream(int, BRItem, InputStream, String, long)Z` desde el interior de su bucle. Termina en la etiqueta `:catch_1`, antes de mostrar el cuerpo completo de los handlers y el final del método.

## Observaciones directas

- El bucle mantiene un acumulado de bytes copiados. Cuando el intervalo desde la última notificación supera 16 ms, consulta `mIsLocalBackupTask`; si es false, llama `notifyTransFileProgressChange` con estado/etapa 2, ruta de destino absoluta, bytes acumulados y el total `p5`. Después actualiza la marca temporal de progreso.
- Cuando la lectura alcanza EOF, notifica la finalización del progreso con estado/etapa 3. Para `p1==3`, la ruta de origen notificada es null; en otro caso usa la ruta absoluta del destino.
- Llama explícitamente `FileOutputStream.flush()` y luego `getFD().sync()`.
- Registra la ruta y el contador de restauración; incrementa el campo `imageTotalCount` en uno.
- En la ruta normal visible, cierra el `FileOutputStream` y retorna `true`.
- Después aparecen los inicios de `:catch_0`, `:catchall_0` y `:catch_1`; la ventana termina inmediatamente tras la etiqueta `:catch_1`, por lo que no se conoce el tratamiento completo de excepciones ni el cierre en esas rutas.

## Límites

Esta ventana no muestra el resto de los handlers ni `.end method`. No determina todavía:
- si el InputStream de entrada se cierra en alguna ruta;
- si FileOutputStream se cierra en todos los caminos excepcionales;
- si el destino parcial se elimina ante error;
- qué excepciones se relanzan o qué valor se devuelve tras ellas.

El cierre explícito del FileOutputStream y el retorno true solo están confirmados para la ruta normal visible. No inferir cierre universal, ausencia de fugas ni éxito semántico de la restauración.

## Dedupe

E167 ya conserva la preparación del destino, guardias, apertura de FileOutputStream y bucle parcial con búfer de 32 KiB. E168 añade el avance del bucle, notificaciones de progreso, flush/sync, incremento de `imageTotalCount` y cierre/retorno normal, además de ubicar los handlers aún incompletos.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash nuevo del Smali y sin ejecución dinámica. Expediente INCOMPLETO.
