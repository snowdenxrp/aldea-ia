# Evidencia 34 — restoreFiles, getBRItems y semántica de referencias

**Fecha:** 2026-11-19  
**Procedencia:** fragmentos Smali pegados directamente por el usuario desde Termux mediante sed -n.  
**Clasificación:** CONFIRMADO EN CHAT — fragmentos originales compartidos; no relectura independiente de archivos ni hashes locales en esta sesión.  
**Base:** evidencia 33 y expediente maestro v0.17.

## 1. Corrección crítica: la asignación en restoreFiles

Firma recibida:

~~~smali
.method private restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V
.locals 4
~~~

El cuerpo compartido muestra:

~~~smali
iput p3, p0, Lcom/miui/backup/service/BRService;->mBakFilesType:I
...
new-instance p3, Ljava/util/ArrayList;
invoke-static {p1}, Ljava/util/Arrays;->asList([Ljava/lang/Object;)Ljava/util/List;
move-result-object p1
invoke-direct {p3, p1}, Ljava/util/ArrayList;-><init>(Ljava/util/Collection;)V
iput-object p3, p0, Lcom/miui/backup/service/BRService;->mBRItems:Ljava/util/ArrayList;
~~~

**Resolución:** la interpretación anterior de que la línea 12733 era iput-object p3 hacia mBRItems era incorrecta. En esta firma de instancia, p0 es el receptor, p1 el array BRItem[], p2 el BackupDescriptor y p3 el entero tipo de backup/restauración. Primero se guarda ese entero en mBakFilesType:I. Después el registro p3 se reutiliza como destino de new-instance ArrayList; se construye una nueva lista a partir de Arrays.asList(p1) y esa lista se asigna a mBRItems.

Por tanto:
- el campo mBRItems no recibe directamente el entero p3;
- se crea un contenedor ArrayList nuevo;
- la construcción desde Arrays.asList(array) conserva las referencias de los elementos BRItem del array, no clona por sí misma cada BRItem;
- el método omite la asignación de mBRItems cuando mBakFilesType == 3 o cuando p1 == null, debido a la condición if-eq p3, 0x3 / if-eqz p1 hacia :cond_1. Aun así guarda el descriptor, limpia mIsAborted, muestra notificación y llama startRestore().

Esto resuelve la anomalía de tipo sin requerir una conversión oculta.

## 2. Callers de restoreFiles

El primer caller compartido muestra:

~~~smali
invoke-virtual {v4}, Ljava/util/ArrayList;->size()I
move-result v0
new-array v0, v0, [Lcom/miui/backup/service/BRItem;
invoke-virtual {v4, v0}, Ljava/util/ArrayList;->toArray([Ljava/lang/Object;)[Ljava/lang/Object;
move-result-object v0
check-cast v0, [Lcom/miui/backup/service/BRItem;
invoke-direct {v14, v0, v6, v3}, Lcom/miui/backup/service/BRService;->restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V
~~~

Esto demuestra que el caller crea un array de salida y lo llena mediante ArrayList.toArray; el array es un contenedor nuevo, pero los elementos que copia son las referencias existentes de la lista (no hay constructor/copia de BRItem en este bloque).

El segundo camino compartido llama:

~~~smali
invoke-direct {v14, v5, v6, v3}, Lcom/miui/backup/service/BRService;->restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V
~~~

El fragmento no incluye la definición ni procedencia de v5; no atribuirle contenido todavía.

## 3. Getter getBRItems: array nuevo, referencias en general compartidas y excepción files_for_backup

El cuerpo compartido de getBRItems()[BRItem]:

1. Lee mBRItems:ArrayList.
2. Reserva un array BRItem[] de igual tamaño.
3. Itera por la lista y recupera cada BRItem.
4. Si packageName != "files_for_backup", inserta directamente la referencia existente con aput-object v2, v0, v1.
5. Si packageName == "files_for_backup", construye un BRItem nuevo usando el constructor BRItem(type) y copia explícitamente:
   - feature
   - packageName
   - totalSize
   - completedSize
   - transingCompletedSize
   - transingTotalSize
   - state
   - error
   - progType
   - referencia localFileList (no copia profunda de la lista)
6. Inserta ese objeto nuevo en el array.

**Conclusión precisa:** getBRItems() devuelve un array nuevo, pero no es una copia profunda de todos los BRItem. Para elementos distintos de files_for_backup, el array contiene la misma referencia de BRItem que la lista interna. Para files_for_backup, crea un BRItem distinto y copia una selección de campos; localFileList se comparte como referencia. El cuerpo mostrado copia state y error en ese elemento especial.

Esto significa que los cambios posteriores a campos de los BRItem compartidos pueden ser visibles desde el consumidor in-process, mientras que los cambios posteriores en el BRItem original files_for_backup no se reflejan automáticamente en el clon ya creado; la lista localFileList sí puede seguir compartida. La observación es sobre semántica de referencias Java del método, no sobre un consumidor Binder remoto después de parcelación.

## 4. Consecuencia para ProgressItemAdapter y Binder

- La ruta restoreFiles(array) → Arrays.asList → new ArrayList(Collection) conserva referencias a los elementos del array.
- La ruta getter local getBRItems() conserva referencias para elementos ordinarios y clona selectivamente files_for_backup.
- El adapter initData ya fue documentado en evidencia 28 como almacenamiento directo de la referencia BRItem recibida en ProgressItem.brItem.
- No se ha demostrado todavía si el caller del adapter consume el getter en el mismo proceso o por proxy Binder.
- La ruta Binder puede parcelar/reconstruir objetos; no trasladar automáticamente las conclusiones de identidad in-process a MiAsistService.

## 5. Límites / siguientes pasos

1. Leer BRItem.smali: constructor Parcel, CREATOR, writeToParcel, describeContents.
2. Leer MiAsistService.smali:1585–1630 y el contexto de proceso/conexión para confirmar el trayecto IPC.
3. Leer el caller del segundo restoreFiles(v5,...) para conocer origen de v5.
4. Leer los callers concretos de initData solo para decidir cuáles son locales y cuáles usan Binder.
5. Leer updateSingleItemUI completo para cerrar el efecto visual de BRItem.error.

No ejecutar Backup/Restore, servicios ni pruebas dinámicas. No modificar ni subir el APK propietario.
