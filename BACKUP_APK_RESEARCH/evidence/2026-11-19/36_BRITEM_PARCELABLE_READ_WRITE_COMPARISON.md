# Evidencia 36 — BRItem Parcelable: comparación de lectura y escritura

**Fecha:** 2026-11-19  
**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Archivo inspeccionado:** `$HOME/backup-static/decoded/smali/com/miui/backup/service/BRItem.smali`  
**Procedencia:** salida de extracción local pegada por el usuario en esta conversación.  
**Clasificación:** CONFIRMADO EN SALIDA COMPARTIDA; no LOCAL-VERIFIED por relectura/hash independiente.

## 1. Resultado

Se compartieron los cuerpos completos de:

- `<init>(Landroid/os/Parcel;)V`
- `describeContents()I`
- `writeToParcel(Landroid/os/Parcel;I)V`
- `<clinit>()V`

La comparación secuencial muestra **23 posiciones de datos escritas y 23 lecturas en el mismo orden y con operaciones/tipos correspondientes**.

| # | Campo | Escritura | Lectura | Resultado |
|---:|---|---|---|---|
| 1 | type | writeInt | readInt | Coincide |
| 2 | packageName | writeString | readString | Coincide |
| 3 | feature | writeInt | readInt | Coincide |
| 4 | bakFilePath | writeString | readString | Coincide |
| 5 | totalSize | writeLong | readLong | Coincide |
| 6 | state | writeInt | readInt | Coincide |
| 7 | completedSize | writeLong | readLong | Coincide |
| 8 | error | writeInt | readInt | Coincide |
| 9 | progType | writeInt | readInt | Coincide |
| 10 | bakFileSize | writeLong | readLong | Coincide |
| 11 | localFileList | writeList | readArrayList | Coincide en posición; semántica de elementos pendiente |
| 12 | transingCompletedSize | writeLong | readLong | Coincide |
| 13 | transingTotalSize | writeLong | readLong | Coincide |
| 14 | transingSdCompletedSize | writeLong | readLong | Coincide |
| 15 | transingSdTotalSize | writeLong | readLong | Coincide |
| 16 | sectionSize | writeLong | readLong | Coincide |
| 17 | sendingIndex | writeInt | readInt | Coincide |
| 18 | skipData | writeInt | readInt | Coincide |
| 19 | retryCount | writeInt | readInt | Coincide |
| 20 | encrypt | helper sintético Parcel/boolean | helper sintético Parcel/boolean | Coincide en llamada; helper pendiente |
| 21 | splitApkPath | writeString | readString | Coincide |
| 22 | splitFileSize | writeLong | readLong | Coincide |
| 23 | progress | writeInt | readInt | Coincide |

## 2. Hallazgos directos

1. **`state`**: `writeInt(state)` y posterior `readInt()` asignado a `BRItem.state`.
2. **`error`**: `writeInt(error)` y posterior `readInt()` asignado a `BRItem.error`.
3. **`localFileList`**: `writeList(localFileList)`; reconstrucción mediante `readArrayList(String.class.getClassLoader())`, cuyo resultado se asigna a `BRItem.localFileList`.
4. **`describeContents()`** devuelve constante cero.
5. **`<clinit>()`** instancia `BRItem$1` y asigna la instancia al campo `BRItem.CREATOR`.

## 3. Límites y pendientes

- La simetría de las 23 posiciones está CONFIRMADA en los cuerpos compartidos.
- No se ha inspeccionado aún `BRItem$1.smali`; por tanto, no se ha demostrado el comportamiento interno de `createFromParcel()` ni `newArray()`.
- No se ha inspeccionado la implementación de `Utils$$ExternalSyntheticApiModelOutline0.m(Parcel,boolean)` y su overload lector. La correspondencia de las llamadas es visible, pero el detalle interno del helper queda pendiente.
- No se ha comparado el inventario de 23 campos con **todos** los campos declarados en `BRItem`; por ello, no se afirma todavía que ningún campo quede fuera de Parcelable.
- El uso de `writeList/readArrayList` confirma la ruta de serialización/reconstrucción de la lista, pero no identifica todavía los tipos reales de sus elementos ni su identidad/aliasing tras el tránsito.
- Esta evidencia no demuestra por sí sola que una transacción Binder concreta haya transportado un `BRItem`; se necesita conectar el Parcelable con el método Stub/Proxy y el caller efectivo.

## 4. Conclusión acotada

**CONFIRMADO:** los campos `state`, `error` y `localFileList` están incluidos explícitamente en el contrato de lectura/escritura Parcelable observado. La secuencia compartida presenta 23 posiciones simétricas en orden.

**NO CONCLUIR AÚN:** que se haya demostrado una transacción Binder concreta, que todos los campos declarados estén serializados, o que `localFileList` sea una copia profunda con semántica de identidad ya determinada.

## 5. Siguiente extracción P0

1. Leer completo `BRItem$1.smali`.
2. Inventariar todos los `.field` de `BRItem.smali` y cotejarlos contra los 23 campos anteriores.
3. Resolver los dos helpers sintéticos de boolean Parcel.
4. Seguir la ruta concreta Stub/Proxy que transporta `BRItem[]` y el caller remoto que lo recibe.

Mantener análisis estático y de solo lectura; no ejecutar servicios ni restauraciones.
