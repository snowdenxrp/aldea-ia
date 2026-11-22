# Evidencia 116 — implementación de clearLocalFiles y navegación al resultado — 2026-11-22

**Archivos/métodos:** `BRService.smali`, `clearLocalFiles(ArrayList<BRItem>)` y `showFinishNotification(IIILjava/util/ArrayList;)V`; referencias de consumo en `ProgressPageFragmentBase.smali`.

**Procedencia:** mensajes del usuario recuperados de conversaciones históricas:
- 2026-11-18T00:02:44Z
- 2026-11-18T00:04:22Z
- 2026-11-18T03:37:41Z
- 2026-11-19T19:30:56Z
- 2026-11-19T19:31:46Z

**Clasificación:** `USER-PASTED-SMALI / RECOVERED-CHAT` para la implementación de `clearLocalFiles` y los detalles de transporte reportados. Las coordenadas se recuperaron de mensajes históricos; no se obtuvo aquí el transcript Smali íntegro ni se cotejó contra la extracción local actual. No `LOCAL-VERIFIED`.

## 1. Implementación recuperada de clearLocalFiles

El usuario informó haber compartido el método literal `clearLocalFiles(ArrayList<BRItem>)` de `BRService.smali`:

- Rango físico más preciso recuperado: líneas 3977–4040.
- Directivas `.line` asociadas: 4975–4977.
- Una referencia histórica anterior delimitaba el bloque de forma más amplia, líneas físicas 3970–4070; se conserva 3977–4040 como el rango específico reportado posteriormente.
- Si el argumento es null, retorna.
- Itera los objetos `BRItem` de la lista.
- Comprueba `packageName.equals("files_for_backup")`.
- Si coincide y `localFileList.size() > 0`, ejecuta `localFileList.clear()`.

**Efecto delimitado:** la operación vacía la lista interna `localFileList` del elemento especial `files_for_backup`. El reporte explícito indica que no modifica `BRItem.state`, `BRItem.error`, `packageName` ni la lista principal de BRItem; tampoco elimina el BRItem de la colección.

Este comportamiento concreta el resumen previo del índice (sección histórica de `clearLocalFiles`), pero no constituye un writer nuevo de `state/error`.

## 2. Relación con showFinishNotification

Mensajes del usuario reportan que `showFinishNotification`:

- En `BRService.smali`, coordenadas físicas 14592–14600; también se reportó la inserción de `extra_last_britems` en 14595–14597.
- Cuando `p4 != null`, llama a `clearLocalFiles(p4)` y después adjunta la misma lista como `extra_last_britems`.
- En directivas `.line`, la llamada a `clearLocalFiles(p4)` está en 4962 y la inserción de `extra_last_britems` en 4963.
- Se reportó además `extra_title=v1`.
- El `PendingIntent` se describió como `PendingIntent.getActivity(..., flags=0xc000000)`; los argumentos completos no se recuperaron.

Las claves `extra_last_task_state`, `extra_last_workingstage`, `extra_last_errcode`, la acción `com.miui.backup.activity.ACTION_VIEW_BRRESULT`, el XOR de `localBackup` y los límites de recuperación ya están en evidencia 115. Esta evidencia añade la implementación detallada de la limpieza, la coordenada más precisa del transporte de la lista, `extra_title=v1` y el flag reportado del PendingIntent.

## 3. Referencias del consumidor de resultados

El usuario reportó estas anclas físicas en `ProgressPageFragmentBase.smali`:

- Línea 541: recuperación/consumo de `extra_last_britems`.
- Línea 2397: referencia a la acción `ACTION_VIEW_BRRESULT`.

Son coordenadas reportadas, no el cuerpo completo del receptor. No inferir desde ellas cómo se renderizan los elementos, cómo se interpretan los estados ni si se procesan todos los extras.

## 4. Reconciliación y límites

- El índice ya mencionaba que `clearLocalFiles()` limpia `localFileList` para `files_for_backup`, pero explícitamente señalaba que no se había recuperado la implementación literal. Esta evidencia cierra esa laguna de recuperación de memoria, sin convertirla en verificación local.
- Evidencias 114–115 ya documentan el transporte general y los nombres literales de los extras. La presente evidencia complementa, no reemplaza, esos documentos.
- No se recuperó el método completo de `showFinishNotification`, el método receptor completo de `ProgressPageFragmentBase`, los argumentos completos del `PendingIntent), ni el flujo de UI posterior.
- No interpretar la limpieza de `localFileList` como limpieza del estado de backup/restauración ni como eliminación del BRItem.

**Estado:** delta de implementación y coordenadas recuperado de mensajes históricos del usuario; verificación local pendiente.
