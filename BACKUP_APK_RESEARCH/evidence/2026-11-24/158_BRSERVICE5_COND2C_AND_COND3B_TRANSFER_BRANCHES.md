# Evidencia 158 — BRService$5: destinos :cond_2c y :cond_3b — 2026-11-24

**Método:** `.method public run()V`.  
**Procedencia:** salida de Termux compartida por el usuario, ventanas físicas 1708–1790 y 2308–2391.  
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash del Smali y sin ejecución dinámica.

## 1. :cond_2c — preparación temporal y bifurcación por transferencia

La ventana compartida muestra que `:cond_2c` registra `Restore One, checked bak` y después evalúa v8:

- Si v8 no es cero, obtiene `Customization.getTransTempBackupRootPath()`, construye un `File` llamado `.tmp_bak_file` dentro de esa ruta y llama `BRService.copyFile(4, v4, tempFile)`.
- Tras esa llamada, asigna `v4 = tempFile` y salta a `:goto_17`.
- Si v8 es cero, entra en `:cond_2d` y comprueba `mIsTransingTask`. Si está activo, conserva v4 en v10 y salta a `:goto_17`; si no, continúa a `:cond_2e`, donde comienza una comprobación de `mIsFlashDriveTask` (el cuerpo posterior no está incluido en esta ventana).

**Conclusión limitada:** queda confirmada una ruta que copia v4 a `.tmp_bak_file` y sustituye la referencia local v4 por el destino temporal. No se afirma que el contenido de v4 sea ZIP válido ni que este archivo sea el origen del InputStream observado después en `:cond_59`. Tampoco se atribuye semántica a los argumentos de `copyFile` más allá de sus tipos y posiciones observadas.

## 2. :cond_3b — sincronización de transferencia de files_for_backup

La ventana compartida muestra:

- Comprueba `mIsTransingTask`.
- Si la transferencia está activa, compara el paquete de BRItem con `files_for_backup`.
- Cuando ambas condiciones se cumplen, llama `waitingForFilesTransingEnd()`.
- Lee `BRItem.state`; si no es 6, escribe 6.
- Lee packageName, feature, state, error y transingTotalSize y los pasa a `notifyTransItemChange(...)`.
- Después salta a `:goto_25`.
- Si no se cumplen las condiciones de transferencia y paquete, continúa por `:cond_3c`, fuera del fragmento mostrado.

**Conclusión limitada:** la ruta observada sincroniza el final de una transferencia de `files_for_backup` y puede establecer/notificar el estado 6. No demuestra por sí sola el resultado final de la restauración ni el contenido de los archivos.

## 3. Dedupe, alcance y pendientes

E157 conserva las guardias y el inicio de ambos destinos. E158 añade los cuerpos parciales ahora compartidos, sin repetir E156/E157.

Sigue pendiente:
- Continuación de `:cond_2d` / `:cond_2e` y convergencia en `:goto_17`, si se necesita caracterizar todas las rutas.
- Continuación de `:cond_3c` y su convergencia.
- Procedencia exacta del registro v3 (InputStream) en la llamada `restoreLocalMediaFile(BRItem,false,v3)` de `:cond_59`.
- Confirmar si el File construido en `:cond_59` participa en otra operación fuera de la ventana; no se presume que alimente v3.

No se infiere apertura de ZIP, integridad, restauración exitosa ni comportamiento dinámico. El expediente sigue INCOMPLETO.
