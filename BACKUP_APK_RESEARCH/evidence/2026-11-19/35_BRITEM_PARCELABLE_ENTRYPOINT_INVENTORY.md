# Evidencia 35 — BRItem Parcelable: inventario inicial de entrypoints

**Fecha:** 2026-11-19  
**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Archivo inspeccionado:** `$HOME/backup-static/decoded/smali/com/miui/backup/service/BRItem.smali`  
**Clasificación:** LOCAL-OUTPUT-SHARED / CONFIRMADO EN LA SALIDA PEGADA; cuerpos aún no inspeccionados.

## Salida original compartida

Comando de búsqueda:
```bash
find "$ROOT" -type f -name 'BRItem.smali' -print
find "$ROOT" -type f -name 'BRItem.smali' -exec sh -c '
echo "===== $1 ====="
grep -n -E "implements.*Parcelable|CREATOR|<init>\\(Landroid/os/Parcel;|writeToParcel|describeContents|createFromParcel|newArray" "$1"
' _ {} \\;
```

Resultado de ruta:
```
/data/data/com.termux/files/home/backup-static/decoded/smali/com/miui/backup/service/BRItem.smali
```

Coincidencias:
```
6:.implements Landroid/os/Parcelable;
10:.field public static final CREATOR:Landroid/os/Parcelable$Creator;
158:    sput-object v0, Lcom/miui/backup/service/BRItem;->CREATOR:Landroid/os/Parcelable$Creator;
278:.method public constructor <init>(Landroid/os/Parcel;)V
700:.method public describeContents()I
1012:.method public writeToParcel(Landroid/os/Parcel;I)V
```

## Hallazgos

1. La clase declara explícitamente `implements Landroid/os/Parcelable;`.
2. Declara el campo estático `CREATOR` de tipo `Parcelable$Creator` y la salida local muestra una asignación a ese campo en la línea física 158.
3. Existe un constructor que recibe `android.os.Parcel`, en la línea física 278.
4. Existe `describeContents()`, línea física 700.
5. Existe `writeToParcel(Parcel,int)`, línea física 1012.
6. La búsqueda no mostró coincidencias literales para `createFromParcel` o `newArray`; esto no prueba que no existan métodos puente/implementaciones con nombres diferentes ni permite concluir nada sobre el cuerpo del CREATOR.

## Qué demuestra / qué no demuestra

**Demuestra:** el archivo local identificado implementa Parcelable y contiene los entrypoints de lectura y escritura indicados.

**No demuestra todavía:** qué campos se escriben o leen; simetría entre constructor y writer; orden/tipos de campos; tratamiento de `localFileList`; semántica de `state` y `error`; ni que una llamada concreta de `IBRService` haya atravesado un proceso Binder y reconstruido un objeto.

## Siguiente extracción P0

Leer íntegros:
- inicializador estático alrededor de la línea 130–165 (con clase Creator anónima/interna y métodos implementados);
- constructor Parcel desde línea 278 hasta su `.end method`;
- `describeContents()` desde línea 700;
- `writeToParcel()` desde línea 1012 hasta su `.end method`.

Después comparar, campo por campo y en orden, los valores leídos del Parcel frente a los escritos. No ejecutar el APK, servicios ni restauraciones.
