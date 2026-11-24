# Evidencia 144 — caller de backupPackages desde onStartCommand y default de extra_bakfiles_type — 2026-11-24

**Procedencia:** salida de `sed -n '18880,19325p' "$D/smali/com/miui/backup/service/BRService.smali"` compartida directamente por el usuario en este chat.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT. Evidencia estática Smali; no cotejada independientemente contra el archivo local ni ejecutada dinámicamente.

## 1. Método contenedor y rama de acción

El fragmento contiene el encabezado:

~~~smali
.method public onStartCommand(Landroid/content/Intent;II)I
    .locals 25
~~~

El método comprueba que el Intent no sea null, obtiene su action y entra en la rama identificada por la comparación con:

~~~smali
const-string v2, "com.miui.backup.service.BRService.CMD_BACKUP"
~~~

Dentro de CMD_BACKUP consulta `extra_is_retransfering`. Si es true, llama a:

~~~smali
invoke-direct {v14, v4}, Lcom/miui/backup/service/BRService;->backupPackagesByRetransfering(Z)V
~~~

y salta a `:goto_0`. Si no es true, continúa por la ruta normal que prepara los argumentos y llama directamente a `backupPackages(...)`. No se infiere aquí el comportamiento interno completo de la ruta de retransmisión.

## 2. Origen y default del argumento entero p4

En la ruta normal, el fragmento muestra:

~~~smali
const/4 v13, 0x1
...
const-string v7, "extra_bakfiles_type"
...
invoke-virtual {v0, v7, v13}, Landroid/content/Intent;->getIntExtra(Ljava/lang/String;I)I
move-result v11
~~~

Por tanto, en el punto de la llamada a `getIntExtra`, el registro `v13` contiene el literal entero `1`. El default efectivo de `extra_bakfiles_type` es **1**.

Después se ve:

~~~smali
move v4, v11
...
move v15, v11
...
invoke-direct/range {v0 .. v13}, Lcom/miui/backup/service/BRService;->backupPackages(Ljava/util/ArrayList;ZZILjava/lang/String;ZIJJLcom/miui/backup/data/TransDeviceInfo;Z)V
~~~

El registro `v4` se carga con el valor obtenido en `v11` y ocupa el cuarto argumento de la llamada `backupPackages`, correspondiente al parámetro entero `p4`. La escritura del campo `mBakFilesType` desde `p4` en el método destino está conservada en evidencia 60. En consecuencia, para esta ruta normal, el entero de `mBakFilesType` procede del extra `extra_bakfiles_type` y, si el extra no está presente, el valor pasado es **1**.

La inicialización inicial `v13=1` no debe confundirse con el último argumento booleano de `backupPackages`: antes de la invocación, `v13` se sobrescribe mediante `move/from16 v13, v22`. El default de `getIntExtra` ya fue consumido al ejecutar esa llamada.

## 3. Otros argumentos visibles y límites

La ruta normal también obtiene:
- `extra_is_from_miasist` como booleano (`v8`);
- `extra_need_encrypt` como booleano (`v3`);
- `extra_is_auto_backup` como booleano (`v9`);
- `extra_base_path` como String (`v7`);
- `extra_recv_version` mediante `getIntExtra(...,-1)`, almacenado en `v16`;
- `extra_britems` mediante `getParcelableArrayListExtra`, almacenado en `v1`;
- `System.currentTimeMillis()` como primer long de tiempo, con el segundo long preparado en cero;
- `TransDeviceInfo` como null y el último booleano como cero en esta llamada.

La llamada aparece bajo la directiva `.line 890`; el `getIntExtra` de `extra_bakfiles_type` aparece bajo `.line 876`. Las directivas `.line` son números de línea fuente y no deben confundirse con coordenadas físicas del archivo. La ventana sed solicitada por el usuario termina mostrando la llamada física 19318, coincidente con la coordenada ya registrada en evidencia 141.

## 4. Reconciliación y corrección del pendiente anterior

- Evidencia 141 registraba el caller #2 desde Intent y dejaba sin resolver el valor concreto de `v13`, usado como default de `getIntExtra`.
- Evidencia 143 conservó el encabezado parcial del caller #1 y dejó abierto ese default.
- Esta evidencia 144 resuelve ese punto: en la ruta CMD_BACKUP normal, `extra_bakfiles_type` tiene default literal **1**, pasado como argumento `p4` de `backupPackages`.
- Esto no demuestra que todos los caminos de backup usen tipo 1: el camino `extra_is_retransfering=true` deriva a `backupPackagesByRetransfering(Z)V` y no ejecuta la llamada directa de esta ruta.
- No se asigna semántica funcional más amplia al tipo 1 por esta observación aislada.
- No hay verificación local independiente ni ejecución dinámica.

**Resultado:** default del caller #2 resuelto para la ruta normal CMD_BACKUP: `extra_bakfiles_type` default = 1. Investigación estática INCOMPLETA.
