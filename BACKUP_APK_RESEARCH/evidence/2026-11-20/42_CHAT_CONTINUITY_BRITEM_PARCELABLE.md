# Evidencia 42 — Recuperación de continuidad del análisis Parcelable de BRItem

**Fecha:** 2026-11-20  
**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Base GitHub verificada antes de este registro:** `cf802ea24ca98dd30ffb6a1282e4a9f4827224c1`  
**Índice maestro recuperado:** `BACKUP_APK_RESEARCH/00_MASTER_INDEX.md`, versión 0.25  
**Archivo local referido:** `$HOME/backup-static/decoded/smali/com/miui/backup/service/BRItem.smali`  
**Clasificación:** RECUPERACIÓN DOCUMENTAL; distingue resultados previamente registrados de la extracción parcial visible en el chat actual.

## 1. Objetivo y regla de continuidad

Se recuperó el estado del expediente y de la rama GitHub antes de continuar el análisis. La investigación sigue siendo estática y de solo lectura. No se modifica el APK, no se ejecutan servicios ni restauraciones, y no se realizan pruebas dinámicas.

Este documento no reemplaza las evidencias 35–41. Las conserva como fuentes específicas y agrega el estado de recuperación del chat del 20-11-2026 para evitar que una conversación nueva pierda la secuencia y el punto exacto de continuación.

## 2. Estado documental recuperado

El índice maestro v0.25 ya contiene las siguientes etapas:

- **Evidencia 35:** inventario de entrypoints Parcelable de `BRItem`: `CREATOR`, constructor `BRItem(Parcel)`, `describeContents()` y `writeToParcel()`.
- **Evidencia 36:** comparación de 23 posiciones de lectura/escritura en el mismo orden. Incluye `state`, `error`, `localFileList`, y `encrypt`; límites sobre identidad de elementos y tránsito Binder.
- **Evidencia 37:** `BRItem$1` y campos declarados no serializados. Se documentan 25 campos de instancia, 23 incluidos en Parcelable y `apkSize`/`dataSize` omitidos.
- **Evidencia 38:** búsquedas iniciales defectuosas; resultados clasificados como NO DETERMINADOS, no como ausencia.
- **Evidencia 39:** localización del helper sintético y refinamiento de búsquedas de referencias.
- **Evidencia 40:** wrappers sintéticos delegan en `Parcel.readBoolean()`/`writeBoolean(Z)`; se relacionan con `encrypt`. Búsquedas de descriptores exactos para `BRItem.apkSize` y `BRItem.dataSize` sin coincidencias visibles en el árbol examinado.
- **Evidencia 41:** constructores ordinarios y copia. El constructor vacío y el constructor por tipo establecen defaults; el constructor de copia omite `apkSize`/`dataSize` y crea un contenedor nuevo de `localFileList` con `addAll` (copia superficial de referencias).

Los resultados anteriores se clasifican como CONFIRMADO EN CHAT / DIRECT-CHAT, no como LOCAL-VERIFIED por relectura y hash independiente, según las advertencias ya presentes en el expediente.

## 3. Recuperación exacta del chat inmediatamente anterior

En el contexto recuperable del chat titulado **«Extraer métodos Parcelable»** aparece el inicio de esta extracción:

```sh
B="$HOME/backup-static/decoded/smali/com/miui/backup/service/BRItem.smali"

echo "===== CONSTRUCTOR VACIO ====="
sed -n '163,218p' "$B"
```

El texto recuperado muestra el encabezado `===== CONSTRUCTOR VACIO =====` y el inicio del cuerpo Smali:

```smali
.method public constructor <init>()V
    .locals 4

    .line 78
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    const-string
```

**Límite de recuperación:** el contexto disponible termina inmediatamente después de `const-string`. No se dispone aquí del resto de la salida de esa extracción ni de los mensajes posteriores completos. Por integridad, no se reconstruyen literales, registros, asignaciones ni conclusiones que no estén visibles. La descripción completa del constructor vacío ya conservada en la evidencia 41 se mantiene como hallazgo anterior del expediente, no se presenta como si el fragmento truncado actual la hubiera vuelto a demostrar.

## 4. Hechos consolidados sobre BRItem

### 4.1 Contrato Parcelable

La comparación registrada identifica 23 posiciones simétricas. Entre ellas:

- `state`: entero escrito y leído.
- `error`: entero escrito y leído.
- `localFileList`: `writeList` / `readArrayList`, con ClassLoader de `String`.
- `encrypt`: wrapper sintético que delega en las APIs booleanas de Parcel.
- `describeContents()`: devuelve 0.
- `<clinit>()`: instancia `BRItem$1` y la asigna a `CREATOR`.

### 4.2 Campos no incluidos en el contrato observado

El inventario recuperado identifica 25 campos de instancia; 23 están en la secuencia Parcelable. `apkSize` y `dataSize` no aparecen en la secuencia de lectura/escritura. El constructor de copia tampoco los copia. Esto no demuestra que nunca puedan ser asignados o consumidos por clases externas, reflexión o JNI.

### 4.3 Semántica de copia

El constructor `BRItem(BRItem)` crea una nueva lista `localFileList` y añade los elementos de la lista fuente mediante `addAll`. El contenedor es nuevo; las referencias de los elementos se conservan. No es una clonación profunda de los elementos.

### 4.4 Límite Binder

La simetría Parcelable no demuestra por sí sola que una transacción Binder concreta transporte un `BRItem` o un `BRItem[]`. Se debe enlazar la clase con el Stub/Proxy, la transacción, la serialización del array y el caller/callee efectivos antes de afirmar transporte real.

## 5. Pendientes vigentes, sin duplicar trabajo ya cerrado

1. Completar y conservar la extracción del constructor vacío del chat anterior si se recupera el texto íntegro; comparar con evidencia 41 sin duplicar conclusiones.
2. Inspeccionar los métodos restantes de `BRItem`: `addItem(String)`, `isInternalFeature()`, `isMedia()` y `toString()`.
3. Seguir la ruta concreta Stub/Proxy y la transacción que transporta `BRItem[]`.
4. Identificar el caller remoto y el punto receptor; determinar si se usa Parcel en esa ruta concreta.
5. Mantener separados los hechos de salida local compartida de los verificados mediante relectura/hash local.

## 6. Próximo punto de continuación

Retomar desde `BRItem.smali`, después de preservar la salida íntegra del constructor vacío si el usuario vuelve a compartirla. No repetir la comparación Parcelable de 23 posiciones ni la auditoría del constructor de copia ya registrada en evidencias 36 y 41. El siguiente objetivo de mayor valor es conectar el contrato Parcelable con una transacción Binder efectiva.

**Restricción operativa:** análisis estático, solo lectura; no ejecutar servicios, no iniciar backup/restore, no modificar APK ni alterar datos del dispositivo.
