# Evidencia 125 — ProgressItemAdapter: detalle de initData, filtros, getters y mapping visual de errores — 2026-11-22

**Archivo:** `ProgressPageFragmentBase$ProgressItemAdapter.smali`  
**Procedencia:** salidas Smali compartidas directamente por el usuario desde Termux en este chat: ventanas físicas solicitadas mediante `sed -n '1875,2060p'`, `2061,2420p'`, `2421,2600p'` y `869,1207p'`. Clasificación `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`. No es verificación local independiente ni evidencia runtime.

## 1. Dedupe y alcance de esta evidencia

La evidencia 67 ya conservaba un resumen de `initData()`, `getView()`, `updateInfoView()` y la matriz visual de estados. La evidencia 123 ya preservaba los callbacks y parte de la contabilidad de tamaños. Por tanto, esta evidencia **no vuelve a registrar** esos hallazgos generales ni duplica `getView()`.

El delta aquí es el detalle literal adicional de las ramas de `initData()`, los getters/filtros observados, el despacho de `updateSingleItemUI()` y la correspondencia de códigos `BRItem.error` con IDs de recursos.

## 2. initData(BRItem[]) — filtro, contadores y completedSize

En el bloque compartido:

- Si el argumento `p1` es null, el método retorna sin continuar.
- Reinicia `mSuccessfulSize=0` y `mFinishedAndFailedCount=0`; en el cuerpo mostrado **no aparece** reinicio de `mSuccessfulCount`.
- Crea `mItems` si es null; de lo contrario, limpia la lista existente.
- Recorre el arreglo y solo construye/agrega un `ProgressItem` cuando `BRItem.state` es `1`, `3` o `6`.
- Para esos estados incrementa `mFinishedAndFailedCount`.
- Si el estado es `3`, omite el bloque de éxito/tamaño, pero continúa hasta agregar el `ProgressItem`.
- Para estados `1` y `6`, incrementa el campo `mSuccessfulCount`, comprueba si `bakFilePath` existe y, si existe, escribe `File.length()` en `BRItem.bakFileSize`.
- La rama de ajuste de `completedSize` está condicionada por `BRItem.progType == 0) y `isSaveInstance == true`. En ese caso, si `completedSize == 0`:
  - `packageName == "files_for_backup"`: copia `totalSize` a `completedSize`.
  - Otros paquetes: si `bakFileSize > 0`, copia `bakFileSize` a `completedSize`.
- Fuera de esa rama, si `bakFileSize > 0`, también copia `bakFileSize` a `completedSize`.
- Para `com.android.mms` o `com.android.contacts` con `type == 9), acumula `getBRItemSize(BRItem) * 1000` en `mSuccessfulSize`; para los demás elementos exitosos acumula `getBRItemSize(BRItem)` sin ese factor.
- Cada elemento que supera el filtro se envuelve en `ProgressItem` y se agrega a `mItems`. Al terminar llama a `notifyDataSetChanged()`.

**Cautela sobre `mSuccessfulCount`:** este método lo incrementa para estados 1/6 pero no lo reinicia en el cuerpo compartido. Sin embargo, el getter `getSuccessfulCount()` observado abajo recalcula el conteo iterando `mItems`, no devuelve ese campo. No concluir bug ni acumulación observable sin localizar todos los lectores de `mSuccessfulCount`.

## 3. Getters y filtro por estado

- `getSpecificStatePkgs(int)`: crea una lista nueva; si `mItems` existe, recorre sus elementos, compara `BRItem.state` con el argumento mediante igualdad exacta y agrega el `packageName` de cada coincidencia.
- `getSuccessfulCount()`: devuelve cero si `mItems` es null; en otro caso cuenta los elementos cuyo estado es `1` o `6).
- `getFailedCount()`: devuelve `getCount() - getSuccessfulCount()`. Por tanto, es un complemento respecto del total del adaptador y no una cuenta exclusiva de `state==3); puede incluir otros estados que estén presentes en `mItems`.
- `getSuccessfulSize()`: devuelve directamente `mSuccessfulSize`.
- `getItem(int)`: devuelve null si `mItems` es null; en otro caso devuelve el elemento en el índice solicitado.
- `getItemId(int)`: convierte el índice a long y lo devuelve.

## 4. updateSingleItemUI() — despacho visual

El `packed-switch` sobre `BRItem.state` muestra:

| state | Rama visual observada |
|---:|---|
| 0 | Oculta barra e imagen; muestra `SyncCircleView` (carga). |
| 1 | Oculta indicadores de carga/progreso y muestra imagen de éxito. |
| 2 | Muestra `CircleProgressView`, fija `ProgressItem.progress` y actualiza texto informativo. |
| 3 | Oculta carga/progreso y muestra imagen de error con texto determinado por `BRItem.error`. |
| 4 | Barra circular y texto de progreso. |
| 5 | Barra circular y texto de progreso. |
| 6 | Barra circular y texto de progreso en este método. |
| 7 | Barra circular y texto de progreso. |
| 8 | Barra circular y texto de progreso. |

**Importante:** la rama de estado 6 en este método corresponde a la entrada `:pswitch_1` (barra de progreso), aunque `getSuccessfulCount()` lo cuenta como éxito y `initData()` lo trata como estado exitoso para contabilidad. La normalización de estado 6 a 1 en el receptor del resultado está documentada por separado en evidencia 120. No fusionar esas rutas ni inferir una representación universal fuera de este método/contexto.

## 5. Mapping literal BRItem.error → recurso de texto

Dentro de la rama de `state==3`, el `switch` sobre `BRItem.error` asigna:

| BRItem.error | ID de recurso |
|---:|---|
| 2 | `0x7f120142` |
| 5 | `0x7f120150` |
| 6 | `0x7f12014f` |
| 7 | `0x7f120143` |
| 9 | `0x7f1203de` |
| 11 | `0x7f120149` |
| cualquier otro valor | `0x7f12014d` |

Estos son IDs de recurso asignados por el código; esta evidencia no resuelve sus textos localizados. La evidencia 67 ya había listado esos IDs como pendientes de resolución.

## 6. Observaciones y límites

- `getFailedCount()` no equivale a contar únicamente errores de estado 3.
- El `state=6` presenta una diferencia contextual entre contabilidad/getters y la rama visual directa de `updateSingleItemUI()`; el receptor de resultados documentado en evidencia 120 puede normalizarlo a 1 en una ruta concreta.
- La ausencia de reinicio de `mSuccessfulCount` en `initData()` es una observación del fragmento, no prueba de defecto.
- No se infiere el significado textual de los recursos ni unidades físicas de los campos de tamaño.
- No se recibió el archivo completo ni su hash; las coordenadas son las ventanas físicas de `sed` indicadas en procedencia.
- No hubo ejecución dinámica, modificación de APK ni prueba de comportamiento runtime.
