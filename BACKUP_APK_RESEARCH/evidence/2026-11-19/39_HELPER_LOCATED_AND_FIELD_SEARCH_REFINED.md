# Evidence 39 — Helper localizado y referencias de campos refinadas

**Fecha:** 2026-11-19  
**Ámbito:** análisis estático de la extracción decodificada de MIUI Backup.apk.  
**Fuente primaria:** salida Termux compartida por el usuario para búsquedas sobre todo `$HOME/backup-static/decoded`.

## 1. Helper localizado

El comando `find "$ROOT" -type f -iname '*ExternalSyntheticApiModelOutline0*'` devolvió, entre otros helpers de bibliotecas, el archivo:

`smali/com/miui/backup/Utils$$ExternalSyntheticApiModelOutline0.smali`

La ruta está dentro del paquete de MIUI Backup y es el candidato prioritario para inspeccionar las operaciones sintéticas usadas por `BRItem.encrypt`. La localización por nombre no demuestra todavía qué métodos contiene ni cuál invoca BRItem.

## 2. Búsqueda apkSize

La búsqueda literal protegida:

`grep -RFn --include='*.smali' -- '->apkSize:' "$ROOT"`

no produjo coincidencias visibles. Esto amplía el resultado negativo al árbol decodificado completo y evita el problema previo de interpretar el patrón que comienza por guion como opción.

**Conclusión acotada:** no se observaron referencias Smali directas `->apkSize:` en el árbol buscado. No demuestra imposibilidad de acceso por reflexión, JNI, código externo al árbol o mecanismos no representados por ese patrón.

## 3. Búsqueda dataSize: falsos positivos por propietario

La búsqueda literal:

`grep -RFn --include='*.smali' -- '->dataSize:' "$ROOT"`

devolvió coincidencias, pero los descriptores propietarios visibles corresponden a:

- `Landroid/content/pm/PackageStats;->dataSize:J` en `PackageSizeUtil.smali`, `Utils.smali`, `BRService$21.smali`, `BRService.smali` y `BackupManagerService$1.smali`.
- `Lnet/lingala/zip4j/model/AESExtraDataRecord;->dataSize:I` en `AESExtraDataRecord.smali`.

Ninguna de las coincidencias mostradas pertenece a `Lcom/miui/backup/service/BRItem;->dataSize:J`. Por tanto, no constituyen evidencia de lectura/escritura del campo `BRItem.dataSize`.

## 4. Estado actualizado

| Objetivo | Estado |
|---|---|
| Localizar helper MIUI | CONFIRMADO por ruta encontrada |
| Cuerpo/métodos del helper | PENDIENTE de extracción |
| Referencias directas `BRItem.apkSize` | Sin coincidencias visibles en árbol completo; alcance limitado al patrón |
| Referencias directas `BRItem.dataSize` | No aparecen en las coincidencias compartidas; falta búsqueda exacta por descriptor |
| Uso indirecto/reflexivo de ambos campos | NO DETERMINADO |
| Semántica del booleano `encrypt` | PENDIENTE de leer helper y callers |

## 5. Siguiente extracción estática

1. Leer íntegro `Utils$$ExternalSyntheticApiModelOutline0.smali` y localizar los métodos invocados desde `BRItem`.
2. Buscar el descriptor exacto `Lcom/miui/backup/service/BRItem;->dataSize:J` en todo el árbol.
3. Inspeccionar el constructor ordinario y métodos de `BRItem` para determinar si los campos no parcelados reciben asignaciones locales, sin inferir efectos funcionales hasta identificar consumidores.

**Límite probatorio:** resultados de comandos compartidos por el usuario; no se ha leído todavía el contenido del helper ni recalculado hashes locales de los Smali.
