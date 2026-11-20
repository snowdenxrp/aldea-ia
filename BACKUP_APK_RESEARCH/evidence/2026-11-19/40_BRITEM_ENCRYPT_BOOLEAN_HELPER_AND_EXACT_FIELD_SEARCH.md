# Evidence 40 — BRItem.encrypt: helper boolean y búsqueda exacta de campos

**Fecha:** 2026-11-19  
**Fuente primaria:** salida completa compartida por el usuario desde Termux para `Utils$$ExternalSyntheticApiModelOutline0.smali`, referencias desde `BRItem.smali` y búsquedas exactas en todo `$HOME/backup-static/decoded`.

## 1. Helper sintético y llamadas desde BRItem

El helper localizado es:

`smali/com/miui/backup/Utils$$ExternalSyntheticApiModelOutline0.smali`

Contiene varios métodos puente sintéticos para compatibilidad con APIs Android. Entre ellos, los dos relevantes para BRItem son:

```smali
.method public static bridge synthetic m(Landroid/os/Parcel;Z)V
    .locals 0
    invoke-virtual {p0, p1}, Landroid/os/Parcel;->writeBoolean(Z)V
    return-void
.end method
```

y

```smali
.method public static bridge synthetic m(Landroid/os/Parcel;)Z
    .locals 0
    invoke-virtual {p0}, Landroid/os/Parcel;->readBoolean()Z
    move-result p0
    return p0
.end method
```

Las referencias en `BRItem.smali` son:

- Línea física 471: `invoke-static {p1}, ...->m(Landroid/os/Parcel;)Z`
- Línea física 1113: `invoke-static {p1, p2}, ...->m(Landroid/os/Parcel;Z)V`

La correspondencia es directa: el helper de lectura delega a `Parcel.readBoolean()`; el de escritura delega a `Parcel.writeBoolean(Z)`. En el contexto de la comparación Parcelable de evidencia 36, estas llamadas corresponden al campo `BRItem.encrypt`.

## 2. Conclusión sobre encrypt

**CONFIRMADO en el código compartido:** `encrypt` se serializa como booleano mediante `Parcel.writeBoolean` y se reconstruye mediante `Parcel.readBoolean`, con los wrappers sintéticos como capa de delegación. No es una codificación manual como entero en los bloques observados.

Esto cierra la semántica del helper utilizado por BRItem; no demuestra por sí solo que una transacción Binder concreta haya transportado un BRItem en ejecución.

## 3. Búsquedas exactas de campos

El usuario ejecutó en todo el árbol decodificado:

```sh
grep -RFn --include='*.smali' -- \
'Lcom/miui/backup/service/BRItem;->dataSize:J' "$ROOT"

grep -RFn --include='*.smali' -- \
'Lcom/miui/backup/service/BRItem;->apkSize:J' "$ROOT"
```

Ambas búsquedas no produjeron coincidencias visibles.

Esto refina el resultado anterior: las coincidencias genéricas `->dataSize:` observadas en evidencia 39 pertenecían a `PackageStats` y `AESExtraDataRecord`, no a los campos de BRItem.

**Conclusión acotada:** no se observaron referencias directas con los descriptores exactos de `BRItem.apkSize` ni `BRItem.dataSize` en los archivos `.smali` del árbol buscado. No descarta reflexión, JNI, código externo a la extracción ni otros accesos que no usen esos descriptores literales.

## 4. Estado consolidado

| Elemento | Estado |
|---|---|
| Helper de booleano localizado | CONFIRMADO |
| Delegación de lectura | `Parcel.readBoolean()` |
| Delegación de escritura | `Parcel.writeBoolean(Z)` |
| Campo BRItem relacionado | `encrypt` |
| Referencias directas exactas a `BRItem.apkSize` | Sin coincidencias visibles |
| Referencias directas exactas a `BRItem.dataSize` | Sin coincidencias visibles |
| Uso indirecto/reflexivo de los campos | NO DETERMINADO |
| Efecto funcional de los campos no parcelados | NO DETERMINADO |

## 5. Próximo paso estático

El siguiente paso de mayor valor es revisar el constructor ordinario de BRItem y el resto de métodos de la clase para establecer si `apkSize` y `dataSize` solo están declarados o si existe alguna ruta de asignación indirecta/reflexiva. Después, conectar el contrato Parcelable con el Stub/Proxy y un caller concreto de `BRItem[]`, manteniendo separado lo que demuestra el código de lo que solo se infiere sobre transporte Binder.

**Límite probatorio:** salida de Termux compartida por el usuario; todavía no se ha cotejado con hashes locales independientes.
