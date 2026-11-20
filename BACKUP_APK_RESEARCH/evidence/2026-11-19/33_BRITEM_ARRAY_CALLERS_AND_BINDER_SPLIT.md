# Evidencia 33 — callers de initData, getter de BRItems y separación de rutas Binder

**Fecha:** 2026-11-19  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Base documental:** expediente maestro v0.16 y evidencias 27, 28 y 32.  
**Procedencia:** DIRECT-CHAT; salidas de grep compartidas por el usuario tras completar la extracción. No se leyeron los archivos Smali locales en esta sesión.  
**Estado:** inventario de referencias confirmado en el material compartido; cuerpos de métodos y semántica de registros pendientes.

## 1. Alcance de la extracción recibida

La búsqueda fue ejecutada contra `$D`, que en el entorno documentado apunta a `$HOME/backup-static/decoded/smali`. Por tanto, los resultados cubren ese árbol, no acreditan por sí solos cobertura de `smali_classes2` ni `smali_classes3`.

## 2. Callers de ProgressItemAdapter.initData

La salida de grep localizó llamadas a:

- `ProgressPageFragmentBase$7$2.smali:101`
- `ProgressPageFragmentBase$7$3.smali:105`
- `ProgressPageFragmentBase$7$4.smali:115`
- `ProgressPageFragmentBase$7$1.smali:154,180`
- `ProgressPageFragmentBase$7$5.smali:105`
- `ProgressPageFragmentBase$7$6.smali:113`
- `ProgressPageFragmentBase$7$7.smali:113`
- `ProgressPageFragmentBase.smali:719`

La misma salida reportó llamadas a `IBRService.getBRItems()` inmediatamente antes de `initData()` en varios de esos callers:

| Archivo | getBRItems | initData |
|---|---:|---:|
| `ProgressPageFragmentBase$7$2.smali` | 97 | 101 |
| `ProgressPageFragmentBase$7$3.smali` | 101 | 105 |
| `ProgressPageFragmentBase$7$4.smali` | 111 | 115 |
| `ProgressPageFragmentBase$7$1.smali` | 176 | 180 |
| `ProgressPageFragmentBase$7$5.smali` | 101 | 105 |
| `ProgressPageFragmentBase$7$6.smali` | 109 | 113 |
| `ProgressPageFragmentBase$7$7.smali` | 109 | 113 |
| `ProgressPageFragmentBase.smali` | 676 | 719 |

Además, en `ProgressPageFragmentBase$7$1.smali` se reportó creación de un array nuevo en la línea 146, cast en 152 e invocación de `initData` en 154. En `ProgressPageFragmentBase.smali` se reportaron arrays nuevos/casts en 597/604 y 658/665, además de `getBRItems` en 676 e `initData` en 719. Estos patrones requieren lectura de contexto: no prueban por sí solos si el array es copia, filtro o contenedor nuevo de referencias existentes.

También se localizaron:

- definición de `initData([BRItem])` en `ProgressPageFragmentBase.smali:2298`;
- llamada a `updateSingleItemUI` en 855 y definición en 869;
- otra llamada a `updateSingleItemUI` en 2267;
- `ListScollThread` con campo `mBrItems:BRItem[]`, asignación en constructor alrededor de 52 y lectura alrededor de 68.

**Conclusión acotada:** el inventario ya identifica los callers concretos para continuar el trazado del array hacia el adapter. Todavía no se ha leído el cuerpo de esos callers, así que no se declara cerrada la procedencia de cada array.

## 3. Getter BRService y colección interna

La salida reportó:

- `BRService.smali:6770`: definición del getter privado `getBRItems()`;
- `BRService.smali:3492`: inicialización de `mBRItems`;
- `BRService.smali:3723`: `getBRItemsFromDescriptor`;
- `BRService.smali:11027`: asignación de un `ArrayList` devuelto por `getBRItemsFromDescriptor`;
- `BRService.smali:12050`: lectura de `mBRItems`;
- `BRService.smali:12733`: instrucción reportada como `iput-object p3,p0,...->mBRItems:ArrayList` dentro de `restoreFiles`;
- `BRService.smali:18983`: llamada a `getBRItems()`.

El campo de `BRService` se había identificado como `ArrayList`. No se ha recibido aún el cuerpo del getter; por ello no se afirma si crea un array nuevo, filtra elementos, conserva referencias de elementos o transforma los objetos.

## 4. Aclaración de registros pendiente en restoreFiles

La declaración reportada es:

```smali
.method ... restoreFiles([Lcom/miui/backup/service/BRItem;Lcom/miui/backup/data/BackupDescriptor;I)V
```

Los callers reportados están en `BRService.smali:19483` y `:19519`. La línea 12733 fue reportada como escritura de `p3` a un campo `ArrayList`.

No interpretar `p3` sin leer la directiva completa del método, su modificador `static`/instancia, `.locals` o `.registers`, y las instrucciones anteriores. Si es un método de instancia, `p0` es el receptor y los parámetros explícitos comienzan en `p1`; con esta firma, el tercer parámetro explícito es el entero `I`. Si el registro aparece como objeto en `iput-object`, hay que determinar si fue sobrescrito/reutilizado antes de la escritura o si la transcripción/línea asociada requiere corrección. La salida grep aislada no resuelve esto.

Los dos callers se reportaron como:

- línea 19483: `invoke-direct {v14, v0, v6, v3}`;
- línea 19519: `invoke-direct {v14, v5, v6, v3}`.

Se requiere el bloque completo de ambos callers para mapear cada argumento y su tipo.

## 5. Separación de MiAsistService y Binder

La salida reportó:

- `MiAsistService.smali:70`: campo `mBRItems:[Lcom/miui/backup/service/BRItem;`;
- `:1606`: llamada a `IBRService.getBRItems()`;
- `:1618`: asignación del resultado al campo `MiAsistService.mBRItems`;
- lecturas del campo en 834, 842, 1033, 1222, 3055, 3071, 3146, 3235, 3286, 3431 y 3482;
- accesos sintéticos desde `MiAsistService$3.smali:369,470`.

La ruta de interfaz reportada:

- `IBRService$Stub$Proxy.smali:166`: proxy `getBRItems()`; cast a `BRItem[]` en 209;
- `IBRService$Stub.smali:31`: `TRANSACTION_getBRItems=0x5`; despacho en 273;
- `IBRService.smali:39`: declaración abstracta;
- `IBRService$Default.smali:62`: implementación default;
- `BRService$1.smali:131`: implementación de `getBRItems`, con llamada al bridge `BRService.-$$Nest$mgetBRItems` en 143.

**Conclusión acotada:** existe un camino de consulta a través de la interfaz Binder y un campo array propio en `MiAsistService`. No debe fusionarse ese campo con `BRService.mBRItems:ArrayList`. Si la llamada cruza realmente una frontera de proceso, la identidad Java de las instancias no se conserva por el mero hecho de transportar el mismo contenido; hay que inspeccionar el parcelado de `BRItem` y el contexto de proceso/conexión.

## 6. Estado probatorio

| Pregunta | Estado |
|---|---|
| ¿Se localizaron callers concretos de `initData`? | DIRECT-CHAT |
| ¿Varios callers llaman `getBRItems` antes de `initData`? | DIRECT-CHAT; cuerpo pendiente |
| ¿Existe getter `BRService.getBRItems()`? | DIRECT-CHAT |
| ¿El getter devuelve el mismo array o referencias a los elementos internos? | PENDIENTE |
| ¿`MiAsistService` mantiene un campo array distinto? | DIRECT-CHAT |
| ¿Se localizó el proxy/stub Binder para `getBRItems`? | DIRECT-CHAT |
| ¿`BRItem` se reconstruye mediante Parcelable? | PENDIENTE |
| ¿`restoreFiles` asigna realmente un objeto válido a `mBRItems:ArrayList` mediante p3? | UNKNOWN; requiere cuerpo y registros |
| ¿La identidad de un BRItem se conserva desde ArchiveHelper hasta el adapter? | NO DEMOSTRADO |

## 7. Próxima extracción mínima (solo lectura)

1. `BRService.smali:12660–12760`: firma, modificadores, registros y cuerpo de `restoreFiles`.
2. `BRService.smali:19455–19535`: contexto de los dos callers.
3. `BRService.smali:6760–6905`: getter `getBRItems()` completo.
4. `BRService$1.smali:125–170`, `IBRService$Stub.smali:250–290`, `IBRService$Stub$Proxy.smali:155–220`: despacho y proxy.
5. `BRItem.smali`: declaración de clase, constructor Parcel, `CREATOR`, `writeToParcel` y `describeContents`.
6. `MiAsistService.smali:1585–1630`: asignación del resultado y proceso/conexión.
7. Solo después, leer callers de `initData` y el cuerpo completo de `updateSingleItemUI`, si la ruta de identidad aún requiere esos detalles.

No repetir las búsquedas grep ya compartidas. Mantener separados los árboles `smali`, `smali_classes2` y `smali_classes3`; no afirmar cobertura global del APK a partir de `$D`.

## 8. Límites

Investigación estática y documental. No ejecutar Backup/Restore, servicios ni pruebas dinámicas; no modificar ni subir el APK propietario. Esta evidencia registra inventario compartido en chat y no constituye verificación LOCAL-VERIFIED.
