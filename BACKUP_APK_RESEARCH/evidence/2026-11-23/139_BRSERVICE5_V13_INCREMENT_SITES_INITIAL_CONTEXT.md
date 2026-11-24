# Evidencia 139 — BRService$5: coordenadas iniciales de incrementos de v13 — 2026-11-23

**Archivo:** `smali/com/miui/backup/service/BRService$5.smali`  
**Método:** `.method public run()V` (coordenadas físicas).  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`; el usuario confirmó `F` apuntando a `BRService$5.smali` y compartió grep de ocurrencias y ventanas `sed` alrededor de tres incrementos. No se cotejó independientemente contra el archivo local, no se calculó hash nuevo y no hubo ejecución dinámica.

## 1. Confirmación del archivo y ámbito

El valor de `F` mostrado fue:

```text
/data/data/com.termux/files/home/backup-static/decoded/smali/com/miui/backup/service/BRService$5.smali
```

El rastreo de cabecera de método para las tres coordenadas devolvió `39:.method public run()V`. Por tanto, los incrementos físicos 2227, 2422 y 3503 están dentro de `BRService$5.run()V`.

## 2. Incrementos observados

### Física 2227

```smali
:cond_37
    ... unpackBakSdDatas(this, v4, v3) ...
:cond_38
    add-int/lit8 v13, v13, 0x1
```

La ventana muestra que el bloque anterior puede llamar a `unpackBakSdDatas()` para el BRItem cuyo `packageName` coincide con WeChat o QQ. La instrucción de incremento está después de `:cond_38`, por lo que también es alcanzable desde la ruta que no entra en `:cond_37`. No atribuir el incremento exclusivamente a WeChat/QQ.

### Física 2422

La ventana muestra una rama con estas guardias:

- `mIsFlashDriveTask == true`.
- `BRItem.packageName == "files_for_backup"`.
- `v3 != null` para entrar en la ruta que ejecuta la llamada visible.

En esa ruta:

```smali
invoke-static {v0, v6, v4, v3}, ...->restoreLocalMediaFile(...)
:goto_24
add-int/lit8 v13, v13, 0x1
```

La ruta `v3 == null` salta a `:cond_3d` y no pasa por el incremento mostrado en `:goto_24`. La ventana no basta para establecer el significado del valor incrementado.

### Física 3503

La instrucción aparece inmediatamente después de:

```smali
invoke-static {v0, v3, v4, v4}, Landroid/media/MediaScannerConnection;->scanFile(...)
add-int/lit8 v13, v13, 0x1
```

El fragmento recibido no contiene las guardias de entrada completas de esta rama. No concluir que el incremento representa por sí mismo un escaneo exitoso ni una restauración exitosa.

## 3. Relación con el uso final documentado

La evidencia 138 ya registra que, en la métrica local de finalización, `v13` se pasa como valor de `backup_local_restore_success_num` y aparece en el log `total susses count`. La evidencia 132 conserva una inicialización `v13=0` en `:goto_e` antes del bucle principal de items.

Los nuevos fragmentos agregan tres coordenadas de incremento y su contexto inmediato. **No resuelven aún** si todos los incrementos alimentan el mismo valor final en todas las rutas, ni si hay reinicializaciones o reutilización de registro entre fases. El grep inicial también mostró otras asignaciones/usos de `v13` (incluyendo inicializaciones y usos como objeto); se requiere reconstruir el flujo completo y las rutas de control antes de dar una semántica consolidada.

## 4. Dedupe y límites

- Evidencia 132 ya conserva `v13=0` en `:goto_e`; no se duplica esa inicialización como hallazgo nuevo.
- Evidencia 138 ya conserva el uso final de `v13` en la métrica y el log; no se duplica ese uso.
- Esta evidencia conserva solo el nuevo delta: pertenencia de los tres incrementos a `run()V` y sus contextos inmediatos.
- No se afirma que `v13` sea un contador universal de items exitosos; esa hipótesis requiere completar asignaciones, usos, guardias y convergencias.
- Los números `.line` no sustituyen las coordenadas físicas del archivo.
- No se demuestra ejecución dinámica ni éxito real de restauración.
