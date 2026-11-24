# Evidencia 141 — callers de mBakFilesType y consumo de v16 en BRService$5.goto_3f — 2026-11-24

**Procedencia:** extractos Smali compartidos directamente por el usuario en el chat; no ejecutados ni cotejados independientemente contra el archivo local durante esta sesión.
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Evidencia estática de flujo de argumentos y control; no ejecución dinámica.

## 1. Caller de backupPackages desde descriptor de transferencia

El primer bloque compartido termina en una invocación:

~~~smali
invoke-direct/range {v0 .. v13}, Lcom/miui/backup/service/BRService;->backupPackages(Ljava/util/ArrayList;ZZILjava/lang/String;ZIJJLcom/miui/backup/data/TransDeviceInfo;Z)V
~~~

En el contexto visible, el caller construye TransDeviceInfo desde BackupDescriptor, obtiene los BRItems con getBRItemsFromDescriptor(...), calcula si encryptedPwd no está vacío y obtiene getBackupRootPath(...). Antes de la invocación fija v4=3 y mueve ese valor al argumento entero cuarto de backupPackages (parámetro p4). También pasa recvVersion, date, transRealCompletedSize, el TransDeviceInfo y p1.

**Conclusión acotada:** este caller suministra el valor literal 3 como mBakFilesType/argumento p4 de backupPackages, según la firma y la posición del argumento. No inferir por este bloque el significado funcional completo del tipo.

**Procedencia física:** el usuario rotuló este fragmento como CALLER backupPackages #1 y mostró el final de la ventana sed -n '3650,3780p' "$B"; la transcripción inicial del comando aparece parcialmente truncada/mezclada. La invocación y el contexto Smali sí son visibles, pero no se conserva aquí el encabezado completo del método caller.

## 2. Caller de backupPackages desde Intent

El segundo caller lee varios extras de un Intent. En particular:

~~~smali
invoke-virtual {v0, v7, v13}, Landroid/content/Intent;->getIntExtra(Ljava/lang/String;I)I
move-result v11
...
move v4, v11
...
invoke-direct/range {v0 .. v13}, Lcom/miui/backup/service/BRService;->backupPackages(Ljava/util/ArrayList;ZZILjava/lang/String;ZIJJLcom/miui/backup/data/TransDeviceInfo;Z)V
~~~

El valor leído con getIntExtra(...) se mueve a v4 y llega al argumento entero cuarto de backupPackages (p4). El bloque también lee extra_need_encrypt, extra_is_auto_backup, extra_base_path y una lista parcelable.

**Conclusión acotada:** en este caller, mBakFilesType/argumento p4 de backupPackages procede de un entero recibido por Intent; el valor por defecto es v13, cuyo valor concreto no queda establecido en el fragmento compartido.

## 3. Caller de restoreFiles desde Intent y ruta alternativa

El caller de restauración ejecuta:

~~~smali
invoke-virtual {v0, v7, v1}, Landroid/content/Intent;->getIntExtra(Ljava/lang/String;I)I
move-result v3
...
invoke-direct {v14, v0, v6, v3}, Lcom/miui/backup/service/BRService;->restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V
~~~

Antes de esa llamada, v1=1; por tanto, el entero de tipo recibido desde Intent usa 1 como valor por defecto. Si la lista de BRItems está vacía o es null, hay una ruta alternativa condicionada por v3==3 o mIsReStartCommand; esa ruta también llama a restoreFiles(...,v3).

**Conclusión acotada:** el tercer argumento de restoreFiles (p3) procede del entero extra del Intent, con default 1, y se conserva en la llamada alternativa. Esto identifica el origen del argumento, no el significado de todos sus valores.

## 4. Consumo de v16 en BRService$5 :goto_3f

El bloque compartido muestra que :goto_3f:

1. Obtiene mRunningItemIndexLock, entra al monitor y escribe -1 en mRunningItemIndex.
2. Sale del monitor y registra "startRestore, restored".
3. Consulta mIsTransingTask.
4. Solo si mIsTransingTask == true, consulta mIsAborted.
5. Si además mIsAborted == false y v16 == 0, ejecuta:

~~~smali
invoke-static {v0, v5, v2, v6}, Lcom/miui/backup/service/BRService;->-$$Nest$msetState(Lcom/miui/backup/service/BRService;III)V
const-wide/16 v5, 0x1f4
invoke-static {v5, v6}, Ljava/lang/Thread;->sleep(J)V
~~~

En esa rama los registros se preparan como v5=4, v2=8, v6=0: la llamada equivale a setState(4,8,0); la espera es de 500 ms. Si la tarea no es de transferencia, está abortada o v16!=0, no se ejecuta este bloque de estado 8/espera.

El fragmento anterior de la misma investigación (evidencia 133) documenta que las ramas Theme/USB pueden llegar a :goto_3f con v4=10 y v16=8 o v16=9, respectivamente. El nuevo bloque muestra que esos valores no satisfacen la condición v16==0 y, por tanto, omiten setState(4,8,0) y el sleep de 500 ms.

**Importante:** en el fragmento de consumo compartido, v4 no se lee. Por ello no se afirma que v4=10 cause por sí mismo la omisión; la condición observada para esta rama es v16==0, junto con las dos banderas de tarea/aborto.

## 5. Cleanup posterior

Después de la rama condicional, el bloque muestra mReconnector.quit(), obtiene mTransFileService y comienza la continuación de stopAll(0). El extracto recibido termina antes de mostrar todo ese bloque. La evidencia 136 ya conserva el contexto posterior de stopAll(0) y unbindTransFileService(); este registro no duplica esos detalles como hallazgo nuevo.

## 6. Dedupe, relación con evidencias previas y límites

- Evidencias 133, 135 y 136 ya conservan las ramas que asignan v4=10, v16=8/9, la convergencia en :goto_3f, el reset de mRunningItemIndex y el cleanup posterior. La evidencia 141 añade el origen de los argumentos en los callers y el consumidor condicional explícito de v16.
- No se crean nuevos writers de BRItem.state/error.
- setState(4,8,0) es una llamada de estado global del servicio; no demuestra una escritura directa BRItem.state=8.
- El significado funcional completo de los tipos 1/3 y del default v13 no se amplía aquí.
- El caller #1 se conserva con la limitación de transcripción señalada; no se inventa su encabezado ni su método contenedor.
- No hay verificación local independiente, ejecución dinámica ni afirmación de comportamiento observado en dispositivo.

**Conclusión:** evidencia nueva de procedencia de argumentos y control de flujo. Investigación estática INCOMPLETA.
