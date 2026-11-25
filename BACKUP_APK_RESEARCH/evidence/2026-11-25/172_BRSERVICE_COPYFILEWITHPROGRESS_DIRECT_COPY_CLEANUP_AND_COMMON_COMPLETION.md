# Evidencia 172 — BRService.copyFileWithProgress: cierre de copia directa y finalización común — 2026-11-25

## Fuente y alcance

Salida compartida por el usuario desde Termux:

```bash
D="$HOME/backup-static/decoded/smali/com/miui/backup/service"
sed -n '4860,5000p' "$D/BRService.smali"
```

Es la continuación de E171. La ventana alcanza el retorno del método `copyFileWithProgress(int, File, File)Z`.

## Observaciones directas

### Rama de copia directa File → File

- Tras alcanzar EOF (`:cond_b`), intenta cerrar primero el `FileOutputStream`.
- Si ese cierre produce `IOException`, la captura en `:catch_0`, registra el error mediante `LogUtils.e` y continúa hacia el cierre del InputStream.
- Después intenta cerrar el `FileInputStream`. Si produce `IOException`, la captura en `:catch_1` y registra el error mediante `LogUtils.e`.
- Tras ambos intentos de cierre, continúa por `:goto_7`. Por tanto, el cierre de ambos streams está observado en la ruta normal de EOF; los errores de cierre se registran y no impiden continuar por esta ruta.
- Esta ventana no muestra un handler catchall para las excepciones ocurridas durante la lectura/escritura. E171 ya identifica el handler `:catchall_0` que cubre parte del bucle, pero su destino y cleanup deben leerse en la continuación posterior.

### Finalización común después de las ramas ZIP y directa

- `:goto_7` es un punto de convergencia: la rama ZIP descrita en E171 y la rama de copia directa llegan a esta lógica común.
- Si `mIsLocalBackupTask` es false, emite una notificación final mediante `notifyTransFileProgressChange` con etapa/estado 3.
- La ruta de origen comunicada es la ruta absoluta de `p2`.
- La ruta destino se selecciona con la misma comparación `v10 == v15`: si coincide, usa `v20`; si no, usa la ruta absoluta de `p3`.
- Los dos argumentos long de progreso/total de esa notificación reciben `v16` (longitud del archivo). La llamada no usa `v18` en esos dos argumentos.
- Si la tarea es local, omite esta notificación final.
- El método retorna `v23`. La ventana no contiene la asignación que permita determinar el valor booleano de `v23`.

## Dedupe y límites

- E170 conserva el inicio y el bucle ZIP; E171 conserva el cierre de la entrada ZIP, el cierre silencioso del InputStream ZIP y el inicio de la copia directa. E172 añade los cierres explícitos de los streams de la copia directa en EOF, el destino común de `:goto_7`, la notificación final y el retorno.
- El cierre del OutputStream y del InputStream de la copia directa se observa en la ruta que alcanza EOF. No extender esa conclusión a salidas excepcionales del bucle.
- La notificación final pasa la longitud del archivo como ambos valores long; no afirmar que el contador real de bytes escritos (`v18`) sea igual a esa longitud ni que la copia sea íntegra.
- No se atribuye valor a `v23`, ni semántica adicional a `v10`, `v15` o `v20`.
- La ventana no muestra el cuerpo de `:catchall_0` ni demuestra qué recursos se cierran si la lectura/escritura lanza una excepción.
- No se demuestra borrado de destino parcial, flush/sync en esta rama ni comportamiento interno de los métodos auxiliares.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente INCOMPLETO.
