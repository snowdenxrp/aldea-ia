# Evidencia 169 — BRService.copyFileFromStream: handlers de IOException/catchall y final del método — 2026-11-25

## Fuente y alcance

Salida compartida por el usuario desde Termux:

```bash
sed -n '4480,4600p' "$D/BRService.smali"
```

La salida incluye el tramo final del método privado `copyFileFromStream(int, BRItem, InputStream, String, long)Z`, sus handlers y `.end method`; a continuación comienza otro método, `copyFileWithProgress(ILjava/io/File;Ljava/io/File;)Z`.

## Observaciones directas

- La ruta normal termina cerrando el `FileOutputStream` referenciado por `v16` y retorna el registro `v2`, cuyo valor de éxito (`true`) ya se observa en E168.
- El handler `:catch_0` captura una `IOException` y salta a `:goto_4`. El handler `:catch_1` también captura una excepción y prepara `v16) a partir de `v7` antes de llegar a esa ruta.
- En `:goto_4`, registra el texto `"IOException"` mediante `LogUtils.d`; después cierra el `FileOutputStream` y retorna el registro `v14`. Esta evidencia no atribuye un valor booleano a `v14` sin cotejar su asignación anterior.
- El handler `:catchall_0` captura una excepción, mueve `v7` a `v16` y salta a `:goto_5`.
- En `:goto_5`, cierra el `FileOutputStream` referenciado por `v16` y relanza la excepción capturada.
- Por tanto, el cierre explícito de `FileOutputStream` aparece en la ruta normal, en la ruta de `IOException` y en la ruta catchall que relanza.
- El método termina en `.end method`; el código posterior pertenece a `copyFileWithProgress`, no a `copyFileFromStream`.

## Límites

- En el cuerpo completo recibido hasta aquí no aparece una llamada explícita a `InputStream.close()`. Esto solo permite afirmar que no se observa cierre del InputStream dentro del fragmento/cuerpo revisado; no determina si el caller u otro componente administra ese stream.
- La salida no permite concluir que se elimine un archivo destino parcial en caso de error.
- No se asigna significado booleano a `v14` sin revisar su definición previa.
- El cierre de FileOutputStream está respaldado en las tres rutas de salida visibles; no se extiende esta conclusión a recursos distintos del output.

## Dedupe

E167 conserva preparación, guardias, apertura del output y comienzo del bucle. E168 añade progreso, EOF, flush/sync, contador y cierre normal. E169 añade los handlers completos, el cierre del output en las rutas excepcionales y el final de método. No duplica los hallazgos previos.

**Procedencia:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash nuevo del Smali y sin ejecución dinámica. Expediente INCOMPLETO.
