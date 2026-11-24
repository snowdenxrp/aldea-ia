# Evidencia 145 — cuerpo del caller #1 backupPackagesByRetransfering — 2026-11-24

**Procedencia:** salida de sed -n '3555,3795p' "$D/smali/com/miui/backup/service/BRService.smali" compartida directamente por el usuario en este chat.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT. Evidencia estática Smali; no cotejada independientemente contra el archivo local ni ejecutada dinámicamente.

## 1. Identificación y guardias previas

El extracto contiene el método:

~~~smali
.method private backupPackagesByRetransfering(Z)V
    .locals 17
~~~

La secuencia visible es:

1. Registra el inicio mediante "backupPackagesByRetransfering start.".
2. Llama a RetransferUtils.getProgress(context) y recibe un BackupDescriptor.
3. Si el descriptor es null, registra "nothing to retransfer!" y salta al retorno.
4. Comprueba BackupDescriptor.brState; solo sigue cuando es igual a **3**. Si no, registra "skip because of brState=" junto con el valor y retorna.
5. Si p1=true (retransferencia automática), compara autoRetransferCnt con 3. Cuando el contador es mayor o igual a 3, registra "auto retransfer too many times!" y retorna.
6. Si p1=true y no se alcanzó el límite, calcula autoRetransferCnt + 1 y lo guarda en el campo del servicio mAutoRetransferCnt; lo registra como número de intento.
7. Si p1=false, pone mAutoRetransferCnt=0.

**Límite:** el fragmento demuestra la lectura del contador del descriptor y el incremento del campo mAutoRetransferCnt del servicio. No muestra aquí una escritura del contador incrementado de vuelta al descriptor.

## 2. Restauración de estado de transferencia desde el descriptor

Después de las guardias:

- Lee currentSendedSdFile y asigna el mismo String a mLastSendedSdFile y mCurrentSendedSdFile.
- Si pendingFiles no es null, añade todos sus elementos a mTmpPendingSendingFiles mediante List.addAll. El fragmento no muestra una limpieza previa de esa lista en este método.

## 3. Reconstrucción de TransDeviceInfo y argumentos

Crea un objeto TransDeviceInfo y copia desde el descriptor:

| Campo de destino | Campo de origen |
|---|---|
| TransDeviceInfo.id | BackupDescriptor.serverDeviceId |
| TransDeviceInfo.serverPort | BackupDescriptor.serverPort |
| TransDeviceInfo.canRetransfer | BackupDescriptor.canRetransfer |
| TransDeviceInfo.connectionKey | BackupDescriptor.connectionKey |

Después:
- Obtiene la lista mediante getBRItemsFromDescriptor(descriptor, 3).
- Calcula el booleano de cifrado como la negación de TextUtils.isEmpty(descriptor.encryptedPwd); por tanto es true cuando encryptedPwd no está vacío.
- Obtiene la ruta con Utils.getBackupRootPath(context, 3).
- Lee recvVersion, date y transRealCompletedSize del descriptor.

La llamada final a backupPackages(ArrayList, ZZILjava/lang/String;ZIJJ, TransDeviceInfo, Z) queda preparada con estos valores:

| Parámetro destino | Valor/origen visible |
|---|---|
| lista (p1) | resultado de getBRItemsFromDescriptor(descriptor, 3) |
| primer booleano (p2) | !TextUtils.isEmpty(encryptedPwd) |
| segundo booleano (p3) | false |
| entero (p4) | **3** |
| String (p5) | getBackupRootPath(context, 3) |
| booleano siguiente (p6) | false |
| entero siguiente (p7) | descriptor.recvVersion |
| primer long (p8) | descriptor.date |
| segundo long (p10) | descriptor.transRealCompletedSize |
| objeto (p12) | TransDeviceInfo reconstruido |
| booleano final (p13) | p1 del método caller |

El mapeo se desprende de los movimientos de registros inmediatamente anteriores a invoke-direct/range {v0 .. v13}; la presentación recibida tiene espacios/tabulaciones desalineados en esa zona, por lo que las asociaciones se conservan con esa cautela y sin afirmar cotejo independiente.

## 4. Relación con evidencia previa

- Evidencia 141 ya había registrado que este caller pasa p4=3 y había descrito el contexto de preparación de descriptor, lista, contraseña y ruta de backup. Esta evidencia 145 amplía el cuerpo recuperado con las guardias de brState, el límite de retransmisiones automáticas, el contador del servicio, la restauración de archivos pendientes, la reconstrucción explícita de TransDeviceInfo y los valores de la llamada.
- Evidencia 143 había recuperado el encabezado del método y ubicado la llamada en la línea física 3774; este bloque aporta el cuerpo que faltaba.
- Evidencia 144 resolvió el default extra_bakfiles_type=1 para la ruta normal de onStartCommand/CMD_BACKUP. No contradice el tipo 3 aquí: son caminos distintos. La ruta normal usa el extra del Intent; el caller de retransmisión recupera el descriptor y fija el entero en 3.
- No se vuelve a presentar p4=3 como hallazgo nuevo aislado; se registra como parte de la reconstrucción completa del caller.

## 5. Límites y pendientes

- La salida pegada presenta una región final con columnas y espacios anómalos. Se conserva la lectura de los movimientos de registros, pero cualquier duda de alineación debe resolverse con extracción limpia del rango antes de elevar detalles ambiguos.
- El bloque termina mostrando el siguiente método bindTransFileServiceLocked() debido a la ventana solicitada; no forma parte del caller #1.
- Este método confirma la condición local brState==3 para seguir con esta retransmisión, pero no define por sí solo el significado global de ese estado.
- No demuestra que el contador se persista en el descriptor ni cómo se reinicia fuera de este método.
- No resuelve el literal v8 ni la cadena causal del tipo 2.
- Investigación INCOMPLETA y estática; no ejecución dinámica ni verificación local independiente.
