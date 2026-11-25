# Evidencia 173 — BRService.copyFileWithProgress: cleanup excepcional y origen inexistente — 2026-11-25

## Fuente y alcance

Salida compartida por el usuario desde Termux:

```bash
D="$HOME/backup-static/decoded/smali/com/miui/backup/service"
sed -n '4980,5120p' "$D/BRService.smali"
```

La ventana contiene los handlers de excepción posteriores al retorno común de `copyFileWithProgress(int, File, File)Z`, la rama de origen inexistente y el final del método.

## Observaciones directas

### Cleanup excepcional de la copia directa

- `:catchall_1` conserva la referencia del FileOutputStream en `v26`, la del FileInputStream en `v25`, y pasa la excepción capturada a la ruta común `:goto_a`.
- `:catchall_2`, asociado al fallo al crear/preparar el FileOutputStream después de abrir el FileInputStream, conserva la referencia de entrada en `v25` y pasa la excepción a `:goto_a`.
- `:catchall_3`, asociado al fallo al crear el FileInputStream, conserva `v20` en `v25` y pasa la excepción a `:goto_a`.
- En `:goto_a`, si `v20` no es null, intenta cerrar el `FileOutputStream`. Si el cierre lanza `IOException`, la captura y registra mediante `LogUtils.e`.
- Después, si `v25` no es null, intenta cerrar el `FileInputStream`. Si el cierre lanza `IOException`, también lo registra.
- Finalmente ejecuta `throw v1`, relanzando la excepción original que había sido capturada antes del cleanup.
- Este cleanup es condicional a las referencias disponibles; no se intenta cerrar un stream cuya referencia sea null.

### Archivo origen inexistente

- En `:cond_10`, construye y registra el mensaje `src file not exist: ` concatenado con la ruta absoluta de `p2`.
- Crea una `java.io.IOException` con ese mensaje y la lanza.
- Después aparece `.end method`; la definición siguiente es `copyLocalMediaFile(BRItem, boolean)`, un método distinto.

## Dedupe y límites

- E172 conserva la ruta normal EOF, los cierres normales y la finalización común. E173 añade el cleanup de las rutas excepcionales, el relanzamiento de la excepción original y el caso de origen inexistente.
- La ventana muestra intentos de cierre de los streams disponibles en los handlers observados; no prueba que los cierres tengan éxito si generan IOException.
- No se observa borrado del destino parcial, rollback ni sincronización del FileOutputStream en esta rama.
- No se atribuye valor al booleano `v23`; tampoco se infiere el resultado de la copia a partir de la notificación final.
- La ventana no demuestra que todos los posibles errores del método estén cubiertos por los handlers mostrados; solo documenta las rutas visibles.
- No se analiza aquí el método posterior `copyLocalMediaFile`.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash nuevo de Smali y sin ejecución dinámica. Expediente INCOMPLETO.
