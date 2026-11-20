# Evidencia 32 — restoreFiles(BRItem[]) y copia de BRItem[] en MiAsistService

**Fecha:** 2026-11-19  
**Procedencia:** DIRECT-CHAT; salida de grep pegada por el usuario. No LOCAL-VERIFIED.  
**Alcance:** análisis estático de referencias Smali; no se ejecutó Backup/Restore, servicios ni pruebas dinámicas.

## 1. BRService.restoreFiles()

La salida localiza:

- `BRService.smali:12672`: definición `restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V`.
- `BRService.smali:12733`: `iput-object p3, p0, BRService->mBRItems:ArrayList`.
- Callers encontrados:
  - `BRService.smali:19483`: `restoreFiles(v14, v0, v6, v3)` en la forma registrada por grep como `invoke-direct {v14, v0, v6, v3}`.
  - `BRService.smali:19519`: segunda invocación `invoke-direct {v14, v5, v6, v3}`.

**Advertencia de registros:** la línea de escritura usa p3 y el descriptor del campo es ArrayList, mientras que la firma del método mostrada recibe BRItem[]. Esto parece inconsistente en el texto resumido de grep: en Smali los parámetros ocupan registros de entrada y p3 no necesariamente representa el tercer argumento lógico si hay receptor/pares de registros; además la firma de campo declara ArrayList. No concluir conversión, asignación válida ni tipo real sin leer el método completo y su directiva .locals/.registers y la instrucción literal. El dato firme de esta evidencia es únicamente la presencia de esa instrucción y la firma reportada, ambas pendientes de cotejo en contexto.

## 2. MiAsistService mantiene un campo diferente

La salida muestra:

- `MiAsistService.smali:70`: campo `mBRItems:[Lcom/miui/backup/service/BRItem;`.
- `:1606`: llamada a `IBRService.getBRItems()`.
- `:1618`: asignación del resultado a `MiAsistService->mBRItems:[BRItem`.
- Varias lecturas del campo en líneas 834, 842, 1033, 1222, 3055, 3071, 3146, 3235, 3286, 3431 y 3482.
- `MiAsistService$3.smali:369` y `:470` acceden al campo mediante bridge sintético.

**Conclusión acotada:** existe una ruta donde MiAsistService obtiene el array a través de IBRService y conserva la referencia del array en su propio campo. No se puede inferir todavía si los objetos BRItem se copian, se reemplazan o se mutan después; tampoco debe confundirse este campo array con `BRService.mBRItems:ArrayList`.

## 3. Binder y rutas adicionales

La salida localiza:

- `IBRService$Stub$Proxy.smali:166`: definición proxy `getBRItems()`; línea 209 hace cast a BRItem[].
- `IBRService$Stub.smali:31`: constante `TRANSACTION_getBRItems = 0x5`; línea 273 invoca `IBRService$Stub.getBRItems()`.
- `IBRService.smali:39`: declaración abstracta.
- `IBRService$Default.smali:62`: implementación default.

Esto localiza la ruta Binder, pero no establece por sí solo si la transacción cruza procesos en el escenario investigado ni la identidad de objetos Java a través de Parcel. En una frontera Binder real, la identidad de referencia Java no debe asumirse preservada; hay que inspeccionar el Parcelable BRItem y el código de parcelado para saber qué estado se reconstruye.

## 4. Pendientes P0

1. Leer `BRService.smali:12672–12755` y confirmar la directiva de registros, la asignación de p3 y el tipo real del campo `mBRItems`.
2. Leer `BRService.smali:19455–19535` para identificar argumentos exactos de las dos llamadas a `restoreFiles`.
3. Leer `BRService.smali:6770–6905` para entender el getter y si crea un array nuevo con referencias a los mismos elementos.
4. Leer `BRService$1.smali:131–165`, `IBRService$Stub.smali:250–290` y `IBRService$Stub$Proxy.smali:160–220` para cerrar la ruta Binder.
5. Leer `BRItem.smali` parcelable (constructor CREATOR, writeToParcel y constructor Parcel) para distinguir identidad local de equivalencia de datos tras IPC.
6. Leer `MiAsistService.smali:1585–1630` y los consumidores de su campo para determinar el rol de la copia.
7. Mantener separadas las rutas local in-process y Binder/IPC. No afirmar continuidad de identidad entre procesos.

No repetir grep ya enviado. La salida cubre el árbol `smali` de `$D`; no acredita los otros árboles `smali_classes2/3`.
