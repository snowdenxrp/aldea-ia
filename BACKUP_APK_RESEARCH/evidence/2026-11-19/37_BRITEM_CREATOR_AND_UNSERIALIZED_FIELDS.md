# Evidencia 37 — BRItem Creator y campos de instancia no serializados

**Fecha:** 2026-11-19  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Fuente:** salidas de extracción smali pegadas por el usuario.  
**Clasificación:** CONFIRMADO EN SALIDA COMPARTIDA; no LOCAL-VERIFIED por relectura/hash independiente.

## 1. Parcelable.Creator

Archivo: `smali/com/miui/backup/service/BRItem$1.smali`.

- La clase implementa `android.os.Parcelable$Creator`.
- `createFromParcel(Parcel)` instancia un `BRItem` nuevo y llama directamente a `BRItem.<init>(Parcel)`.
- El bridge sintético `createFromParcel(Parcel):Object` delega en la variante tipada.
- `newArray(int)` ejecuta `new-array` de `BRItem[]`.
- El bridge sintético `newArray(int):Object[]` delega en la variante tipada.

**Conclusión:** la ruta Creator inspeccionada reconstruye un objeto nuevo a través del constructor Parcelable ya cotejado. No devuelve la instancia Java original del emisor.

## 2. Campos declarados frente a campos serializados

La salida de `grep '^\.field '` mostró 25 campos de instancia y, además, constantes estáticas y `CREATOR`.

Los 23 campos de instancia serializados en `writeToParcel()` y reconstruidos en `<init>(Parcel)` son:

`type`, `packageName`, `feature`, `bakFilePath`, `totalSize`, `state`, `completedSize`, `error`, `progType`, `bakFileSize`, `localFileList`, `transingCompletedSize`, `transingTotalSize`, `transingSdCompletedSize`, `transingSdTotalSize`, `sectionSize`, `sendingIndex`, `skipData`, `retryCount`, `encrypt`, `splitApkPath`, `splitFileSize`, `progress`.

Dos campos de instancia declarados no aparecen en la secuencia de escritura ni en la lectura:

| Campo | Declaración | Serialización observada |
|---|---|---|
| `apkSize` | `public apkSize:J` | No aparece |
| `dataSize` | `public dataSize:J` | No aparece |

**Conclusión acotada:** `apkSize` y `dataSize` no forman parte del payload Parcelable observado. Al reconstruirse un objeto nuevo, no reciben valores desde ese Parcel. La salida del constructor muestra que no se les asigna explícitamente; por inicialización JVM de campos `long`, comienzan en cero, salvo que algún otro código los asigne después.

## 3. Semántica de campos omitidos

El constructor Parcel inicializa explícitamente varios campos antes de leer el Parcel: `packageName`, `feature`, `bakFilePath`, `localFileList`, `progType`, `skipData`, `retryCount`, `encrypt`, `splitApkPath`, `splitFileSize` y `progress`. Después, las lecturas del Parcel sobrescriben los campos que sí forman parte del contrato.

Para `apkSize` y `dataSize`, la extracción compartida no muestra asignación explícita en ese constructor. Su valor inicial en el objeto recién creado es, por tanto, cero por las reglas de inicialización de campos primitivos Java, hasta cualquier asignación posterior.

## 4. Límites pendientes

- La comparación cubre los campos de instancia visibles en el inventario compartido; no debe confundirse con una afirmación sobre campos heredados.
- No se han inspeccionado aún los métodos helper de `Utils$$ExternalSyntheticApiModelOutline0` que codifican/decodifican `encrypt`. La llamada simétrica está confirmada; la implementación concreta del helper no.
- No se ha demostrado aún qué código asigna o consume `apkSize` y `dataSize`, ni si su omisión afecta a una operación concreta.
- La existencia de Parcelable no demuestra por sí sola qué transacción Binder concreta transporta esta clase.

## 5. Siguiente extracción P0

1. Extraer de `Utils$$ExternalSyntheticApiModelOutline0.smali` ambos overloads `m(Parcel):boolean` y `m(Parcel,boolean):void`.
2. Buscar asignaciones y lecturas de `BRItem.apkSize` y `BRItem.dataSize` en el árbol smali.
3. Conectar `BRItem[]` con la ruta Stub/Proxy y caller remoto.

Mantener investigación estática de solo lectura.
