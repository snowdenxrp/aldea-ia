# Evidencia 27 — identidad de BRItem dentro de ArchiveHelper.unzipFiles (overload de 7 argumentos)

**Fecha:** 2026-11-19  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Base inspeccionada en GitHub antes del registro:** `5d2b9862e60fcb8d0c9abf764e89c0e9a6417c03`  
**Procedencia:** DIRECT-CHAT (comandos, salida grep y cuerpo smali pegados por el usuario).  
**Estado de verificación:** no LOCAL-VERIFIED por el asistente; no se leyó el checkout directamente. La salida procede de la extracción local del usuario.

## 1. Objetivo

Seguir la identidad del `BRItem` que recibe el overload de siete argumentos de `ArchiveHelper.unzipFiles()`, comprobar las escrituras a `state/error/progress`, y localizar sus call sites para continuar el seguimiento hasta `mBRItems`, callbacks de finalización y `ProgressItemAdapter`.

## 2. Localización y firma

Archivo localizado por el usuario:

```text
/data/data/com.termux/files/home/backup-static/decoded/smali/com/miui/backup/ArchiveHelper.smali
```

Comando de localización de declaraciones:

```bash
grep -n 'unzipFiles(' "$D/com/miui/backup/ArchiveHelper.smali"
```

Salida literal:

```text
1244:.method public static unzipFiles(Ljava/io/File;Ljava/lang/String;Lcom/miui/backup/IFileZipSizeChangedListener;Lcom/miui/backup/service/BRItem;ZLjava/io/InputStream;Ljava/util/List;)V
1959:.method public static unzipFiles(Ljava/io/File;Ljava/lang/String;Ljava/io/InputStream;Ljava/util/List;)V
1994:    invoke-static/range {v0 .. v6}, Lcom/miui/backup/ArchiveHelper;->unzipFiles(Ljava/io/File;Ljava/lang/String;Lcom/miui/backup/IFileZipSizeChangedListener;Lcom/miui/backup/service/BRItem;ZLjava/io/InputStream;Ljava/util/List;)V
```

El overload objetivo comienza en la línea 1244. Parámetros, por orden:

1. `p0`: `File`
2. `p1`: `String`
3. `p2`: `IFileZipSizeChangedListener`
4. `p3`: `BRItem`
5. `p4`: boolean
6. `p5`: `InputStream`
7. `p6`: `List<String>`

El overload de cuatro argumentos comienza en la línea 1959 y reenvía a este overload mediante la invocación de la línea 1994.

## 3. Identidad del BRItem dentro del método

Al inicio del overload de siete argumentos:

```smali
move-object/from16 v1, p3
move-object/from16 v0, p5
```

Por tanto, `v1` conserva la referencia recibida en el cuarto parámetro, `p3` (`BRItem`). El cuerpo usa esa referencia directamente para leer:

- `BRItem.packageName`
- `BRItem.localFileList`
- `BRItem.totalSize`
- `BRItem.progress`

Y para escribir `BRItem.progress` y `BRItem.error`.

No se observó en el cuerpo compartido una construcción de otro `BRItem`, una copia del objeto ni una parcelación/reconstrucción. Esta afirmación queda limitada al cuerpo de este método; no resuelve transformaciones fuera de él.

## 4. Escritura de error

En la rama `:cond_e`, cuando la comprobación posterior al rename/copia encuentra que el archivo de destino no existe:

```smali
.line 368
...
invoke-virtual {v9}, Ljava/io/File;->exists()Z
move-result v0
if-nez v0, :cond_f
...
const/4 v0, 0x1
.line 369
iput v0, v1, Lcom/miui/backup/service/BRItem;->error:I
move-object/from16 v9, p6
goto/16 :goto_2
```

**Conclusión directa:** el método escribe `error=1` en el mismo objeto referenciado por `v1`, que deriva de `p3`. En este bloque no hay escritura de `BRItem.state`. El flujo salta de nuevo al procesamiento de entradas del ZIP (`:goto_2`), por lo que esta asignación no implica por sí misma retorno inmediato del método.

El método también contiene operaciones de extracción a archivo temporal `.tmp`, rename al destino y fallback con `Utils.copyFile` cuando el rename no deja el destino disponible. El error citado se asigna si, tras esas operaciones, el destino no existe.

## 5. Callback de progreso y continuidad de referencia

En el bucle de lectura, el método actualiza `BRItem.progress` mediante `iput` sobre `v1`. En la rama que notifica progreso/tamaño, invoca:

```smali
move-object/from16 v11, p2
...
invoke-interface {v11, v6, v7, v1, v10}, Lcom/miui/backup/IFileZipSizeChangedListener;->onZipFileSizeChanged(JLcom/miui/backup/service/BRItem;Ljava/lang/String;)V
```

**Conclusión directa:** el tercer argumento del callback es `v1`, la misma referencia que contiene el `BRItem` recibido por `p3`. Esto prueba continuidad de referencia desde el método al callback específico `onZipFileSizeChanged`.

**Límite:** el callback identificado es de progreso/tamaño. No es evidencia de que sea el callback terminal de restauración ni de que el mismo objeto llegue sin transformaciones al adaptador de progreso.

## 6. Rutas de excepción observadas

El cuerpo contiene manejadores de `ZipException` y `IOException`. En los bloques compartidos no se observó una asignación general automática de `BRItem.error=1` en esos manejadores. La asignación confirmada de `error=1` está en la rama donde el archivo final no existe.

No extrapolar este resultado a otros productores de `BRItem.error` fuera de este método.

## 7. Búsqueda global de invocaciones

Comando ejecutado por el usuario:

```bash
grep -R -n -F 'ArchiveHelper;->unzipFiles(Ljava/io/File;Ljava/lang/String;Lcom/miui/backup/IFileZipSizeChangedListener;Lcom/miui/backup/service/BRItem;ZLjava/io/InputStream;Ljava/util/List;)V' "$D"
```

Salida literal:

```text
/data/data/com.termux/files/home/backup-static/decoded/smali/com/miui/backup/ArchiveHelper.smali:1994:    invoke-static/range {v0 .. v6}, Lcom/miui/backup/ArchiveHelper;->unzipFiles(Ljava/io/File;Ljava/lang/String;Lcom/miui/backup/IFileZipSizeChangedListener;Lcom/miui/backup/service/BRItem;ZLjava/io/InputStream;Ljava/util/List;)V
/data/data/com.termux/files/home/backup-static/decoded/smali/com/miui/backup/service/BRService.smali:12918:    invoke-static/range {v2 .. v8}, Lcom/miui/backup/ArchiveHelper;->unzipFiles(Ljava/io/File;Ljava/lang/String;Lcom/miui/backup/IFileZipSizeChangedListener;Lcom/miui/backup/service/BRItem;ZLjava/io/InputStream;Ljava/util/List;)V
```

Interpretación acotada:

- `ArchiveHelper.smali:1994`: reenvío desde el overload de cuatro argumentos al overload de siete argumentos.
- `BRService.smali:12918`: call site directo relevante desde `BRService`; suministra los siete argumentos mediante registros `v2..v8`.

La búsqueda no encontró otros call sites para esa firma exacta dentro del árbol `$D` consultado.

## 8. Clasificación y estado de la hipótesis

| Pregunta | Estado |
|---|---|
| ¿El cuarto parámetro del overload es BRItem? | CONFIRMADO |
| ¿`v1` conserva la referencia recibida en `p3`? | CONFIRMADO |
| ¿El helper escribe `error=1` en esa referencia? | CONFIRMADO |
| ¿El helper escribe `progress` en esa referencia? | CONFIRMADO |
| ¿El callback `onZipFileSizeChanged` recibe esa misma referencia? | CONFIRMADO |
| ¿El método escribe `state`? | No se observó escritura en el cuerpo compartido |
| ¿El objeto pertenece a `BRService.mBRItems`? | PENDIENTE |
| ¿El objeto llega al callback final de restauración sin copia/reconstrucción? | PENDIENTE |
| ¿El objeto llega a `ProgressItemAdapter` sin transformación? | PENDIENTE |
| ¿Puede llegar `state=1,error=1` al conteo de éxito? | HIPÓTESIS FUERTE / RIESGO DE INCONSISTENCIA; no bug demostrado |

La hipótesis de inconsistencia sigue condicionada a que el `BRItem` entregado por `BRService` sea la misma instancia de `mBRItems` y permanezca así hasta la lógica que consume el estado. El caller puede escribir `state=1` después del helper según la evidencia 25; esta evidencia 27 cierra continuidad de identidad únicamente dentro del helper y hasta el callback de progreso, no el enlace con la colección global.

## 9. Próximo paso P0

Inspeccionar `BRService.smali` alrededor de la línea 12918, incluyendo:

- firma y comienzo del método contenedor;
- instrucciones que asignan los registros `v2..v8`;
- procedencia exacta del argumento que ocupa el cuarto parámetro de `unzipFiles` (registro `v5` en la invocación `{v2 .. v8}`);
- si ese registro procede de un elemento de `mBRItems`, de un parámetro, de un campo o de una copia;
- listener entregado como tercer parámetro y su implementación;
- instrucciones inmediatamente posteriores a la invocación.

Después, seguir el listener terminal y la ruta que consume `mBRItems`/actualiza `ProgressItemAdapter`, buscando cualquier copia, parcelación o reconstrucción.

## 10. Límites de operación

Investigación exclusivamente estática. No ejecutar Backup/Restore, no iniciar servicios, no realizar pruebas dinámicas, no modificar la aplicación ni subir el APK propietario. Esta evidencia conserva el análisis del bloque Smali compartido por el usuario; no constituye verificación local independiente.
