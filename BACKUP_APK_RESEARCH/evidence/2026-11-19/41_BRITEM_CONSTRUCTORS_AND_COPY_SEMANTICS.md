# Evidencia 41 — BRItem: constructores ordinarios y constructor de copia

**Fecha:** 2026-11-19  
**Fuente:** salidas compartidas por el usuario desde Termux, archivo `$HOME/backup-static/decoded/smali/com/miui/backup/service/BRItem.smali`.  
**Estado:** CONFIRMADO EN CHAT; no LOCAL-VERIFIED por hash/relectura independiente del archivo local.

## 1. Inventario de métodos

La salida de `grep -n '^.method'` identifica estos métodos:

- `<clinit>()V` — línea física 150.
- `<init>()V` — línea 163.
- `<init>(I)V` — línea 219.
- `<init>(Parcel)V` — línea 278.
- `<init>(BRItem)V` — línea 501.
- `addItem(String)V` — línea 674.
- `describeContents()I` — línea 700.
- `isInternalFeature()Z` — línea 708.
- `isMedia()Z` — línea 741.
- `toString()String` — línea 778.
- `writeToParcel(Parcel,int)V` — línea 1012.

La búsqueda interna `grep -nE 'apkSize|dataSize'` devuelve solo las declaraciones de campo en las líneas 90 y 98; no hay referencias a esos nombres dentro de los métodos de esta clase.

## 2. Constructor vacío

El constructor `BRItem()` llama a `Object.<init>()` y asigna explícitamente:

- `packageName = ""`
- `feature = -1`
- `bakFilePath = ""`
- `localFileList = new ArrayList()`
- `progType = 1`
- `skipData = 0`
- `retryCount = 0`
- `encrypt = false`
- `splitApkPath = ""`
- `splitFileSize = 0L`
- `progress = 0`

Los campos de instancia no asignados explícitamente en este constructor conservan su valor inicial de Java: cero/false/null según el tipo. Esto incluye `apkSize` y `dataSize` como long, ambos inicialmente cero.

## 3. Constructor por tipo

`BRItem(int)` repite las mismas asignaciones predeterminadas del constructor vacío y además asigna el argumento a `type`. No muestra inicialización adicional de `apkSize` ni `dataSize`.

## 4. Constructor de copia

`BRItem(BRItem)` primero establece los mismos valores predeterminados que los constructores anteriores y después copia explícitamente estos campos desde el objeto fuente:

- `type`, `packageName`, `feature`, `bakFilePath`
- `totalSize`, `state`, `completedSize`, `error`, `progType`, `bakFileSize`
- elementos de `localFileList`
- `transingCompletedSize`, `transingTotalSize`
- `transingSdCompletedSize`, `transingSdTotalSize`
- `sectionSize`, `sendingIndex`, `skipData`, `retryCount`
- `encrypt`, `splitApkPath`, `splitFileSize`, `progress`

No copia `apkSize` ni `dataSize`. Tampoco aparecen en las referencias internas de la clase.

### Semántica de localFileList

El constructor crea primero una lista nueva y luego ejecuta `addAll(source.localFileList)`. Por tanto, crea un contenedor `ArrayList` distinto, pero copia las referencias de sus elementos; es una copia superficial de la lista, no una clonación profunda de los elementos. La salida no demuestra si los elementos son mutables ni si se modifican después.

## 5. Comparación acotada con Parcelable

El constructor de copia no equivale al contrato Parcelable:

- Ambos transportan/copían los campos listados en sus respectivas implementaciones.
- El constructor de copia omite `apkSize` y `dataSize`.
- La reconstrucción Parcelable también omite esos dos campos, según la comparación previa de lectura/escritura y el inventario de campos.
- Para `localFileList`, el constructor de copia crea una lista nueva y copia sus referencias; Parcelable usa `writeList/readArrayList`. No inferir equivalencia de identidad ni profundidad entre ambas rutas.

## 6. Conclusiones y límites

**CONFIRMADO EN CHAT:**
1. Los constructores vacío y por tipo inicializan los campos indicados y dejan los demás en valores por defecto.
2. El constructor de copia copia una selección amplia de campos, pero no `apkSize` ni `dataSize`.
3. El constructor de copia crea un contenedor nuevo para `localFileList` y ejecuta `addAll`, lo que constituye una copia superficial del contenedor.
4. En el archivo `BRItem.smali`, las referencias a `apkSize` y `dataSize` aparecen únicamente como declaraciones.

**NO DETERMINADO:**
- Si clases externas, reflexión, JNI o código no incluido en este árbol asignan/consumen esos campos.
- Si los elementos de `localFileList` tienen comportamiento mutable relevante.
- Si los constructores o la copia se usan en una ruta concreta de restauración o Binder.

**Siguiente paso:** inspeccionar `addItem`, `isInternalFeature`, `isMedia` y `toString`; después enlazar el contrato Parcelable con el método exacto de Stub/Proxy y un caller de `BRItem[]`. No ejecutar servicios ni restauraciones.
