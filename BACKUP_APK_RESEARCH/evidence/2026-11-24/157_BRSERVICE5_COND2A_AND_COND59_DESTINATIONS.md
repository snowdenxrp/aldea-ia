# Evidencia 157 — BRService$5: destinos :cond_2a y :cond_59 — 2026-11-24

**Método:** `.method public run()V`.  
**Procedencia:** salida de Termux compartida por el usuario, ventanas físicas 1678–1745 y 3498–3565.  
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash del Smali y sin ejecución dinámica.

## 1. Destino :cond_2a (línea 1690)

La rama inicia con `const/4 v3, 0x0` y continúa en `:goto_15`. Allí:
- Si `v4` es null, el flujo cae a `:cond_2b`.
- Si `v4` no es null, ejecuta `File.exists()`; si el resultado es false, también cae a `:cond_2b`; si es true, salta a `:cond_2c`.
- En `:cond_2b`, `if-eqz v3, :cond_3b`. Como `:cond_2a` acaba de inicializar v3 a cero y no hay escritura de v3 visible entre esa inicialización y la prueba en el fragmento compartido, el camino de v4 null/no existente toma `:cond_3b`.

La ventana termina en línea 1745, antes de mostrar los cuerpos de `:cond_2c` y `:cond_3b`. No se atribuye todavía una operación concreta a esos destinos.

## 2. Destino :cond_59 (línea 3510)

La rama:
- Copia `packageName` y `type` de BRItem y calcula `getZipSuffixType(packageName,type)`.
- Construye el texto `mCurrentBackupRootPath + "/backup_" + suffix + ".zip"`.
- Crea un objeto `java.io.File` con esa ruta.
- A continuación, sobrescribe el registro local v4 con cero y llama a `restoreLocalMediaFile(BRItem, false, v3)`; después salta a `:goto_38`.

**Límite importante:** en esta ventana no se ve una apertura del File recién construido ni una obtención de InputStream desde él. El argumento de tipo InputStream de la invocación es v3. Por tanto, no se concluye que el ZIP de la ruta construida sea abierto o entregado a `restoreLocalMediaFile`. El origen/valor de v3 en este punto queda pendiente.

## 3. Dedupe, alcance y próximos puntos

Evidencias 148/149 ya describen la ruta alternativa local `:cond_47`; E156 registra las guardias que conducen a `:cond_2a` y `:cond_59`. Esta evidencia añade el comienzo de ambos destinos y evita repetir los cuerpos ya preservados.

Pendiente de inspección estática:
- Cuerpo de `:cond_2c` y `:cond_3b` para cerrar la bifurcación iniciada en `:cond_2a`.
- Procedencia de v3 en la ruta `:cond_59`, y contexto completo de la llamada a `restoreLocalMediaFile`.

No se infiere integridad ZIP, restauración exitosa ni comportamiento dinámico. El expediente sigue INCOMPLETO.
