# Evidencia 159 — BRService$5: procedencia de v3 y ruta null-stream hacia :cond_59 — 2026-11-24

**Método:** .method public run()V.
**Procedencia:** salida de Termux compartida por el usuario en este chat; ventanas físicas 1540–1680, 2385–2435, 2975–3020 y 3505–3570, más contexto 2990–3065 y 1650–1730.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash del Smali y sin ejecución dinámica.

## 1. InputStream de ZipFile en la ruta ordinaria (líneas 1621–1661)

El bloque compartido muestra:

- ZipFile.getEntry(zipName) devuelve un ZipEntry en v3.
- Si el resultado es null, la rama registra "zipFile entry is null, files lost", notifica error 7 y fin de tarea.
- En :cond_29, ZipFile.getInputStream(v3) devuelve un InputStream, que reemplaza el contenido de v3 mediante move-result-object v3 (líneas físicas 1659–1661).
- Si getInputStream() lanza IOException, el catch notifica error 7 y fin de tarea.

Este InputStream se comprueba como no nulo antes de las llamadas a restoreLocalMediaFile(BRItem,false,v3) de las rutas de restauración local:
- Línea 2419: rama condicionada por mIsFlashDriveTask y files_for_backup.
- Línea 3006: rama condicionada por mIsLocalBackupTask y files_for_backup.

## 2. Flujo de control que alcanza :cond_59 (líneas 2999–3017 y 3510–3563)

La secuencia literal compartida permite cerrar la procedencia de v3 en esta rama:

1. En línea 2999, if-eqz v3, :cond_4c: si v3 es null, el flujo salta a :cond_4c.
2. En :cond_4c, línea 3011, if-eqz v5, :cond_59: si v5 es null, salta a :cond_59.
3. La reasignación de v3 a BRItem.packageName ocurre después, en línea 3017, en el camino de caída cuando v5 no es null. La rama que salta directamente a :cond_59 omite esa reasignación.
4. Por tanto, en la ruta de entrada mostrada, v3 sigue siendo null al llegar a :cond_59.
5. En línea 3561 se invoca restoreLocalMediaFile(BRItem,false,v3); el cuarto argumento es null en esta ruta.

**Conclusión acotada:** :cond_59 no entrega a restoreLocalMediaFile el InputStream obtenido en línea 1661. La ruta solo alcanza :cond_59 después de la guardia v3 == null, y la asignación posterior de v3 a packageName pertenece al camino alternativo v5 != null.

## 3. File construido en :cond_59

La rama calcula getZipSuffixType(packageName,type), construye mCurrentBackupRootPath/backup_<suffix>.zip y crea un objeto File (líneas 3516–3554). Después carga la referencia BRService, sobrescribe v4 con cero y llama a restoreLocalMediaFile(BRItem,false,v3).

En el fragmento compartido, el objeto File local no se pasa a la llamada ni se observa una apertura directa mediante FileInputStream o ZipFile. Esto no demuestra que el archivo sea irrelevante para el método receptor: restoreLocalMediaFile puede derivar/abrir la ruta por su propia lógica interna, cuestión que debe resolverse en el cuerpo del método. La conclusión segura es que el objeto File creado en este bloque no se entrega como argumento y que el InputStream v3 es null.

## 4. Dedupe, correcciones y límites

- E156 ya conserva las guardias por v5 que seleccionan rutas de restauración.
- E157 conserva el inicio de :cond_59 y deja pendiente el origen de v3; esta evidencia resuelve ese punto concreto.
- E158 conserva las ramas :cond_2c y :cond_3b; no se atribuye el archivo temporal de transferencia a este InputStream.
- Las llamadas de las líneas 2419 y 3006 ya estaban localizadas; aquí se confirma que sus guardias comprueban v3 no nulo antes de llamar.
- No se infiere integridad del ZIP, apertura exitosa, restauración completada ni comportamiento dinámico.
- El cuerpo de restoreLocalMediaFile sigue siendo necesario para determinar cómo trata el argumento null y si abre por su cuenta el ZIP construido a partir de la ruta del backup.

**Estado:** evidencia estática documental; expediente INCOMPLETO.
