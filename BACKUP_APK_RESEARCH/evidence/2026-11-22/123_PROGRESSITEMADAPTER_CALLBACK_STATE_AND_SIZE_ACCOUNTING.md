# Evidencia 123 — callbacks de ProgressItemAdapter: estado activo, finalización y contabilidad de tamaños — 2026-11-22

**Archivo:** `ProgressPageFragmentBase$ProgressItemAdapter.smali`  
**Procedencia:** bloques pegados directamente por el usuario desde Termux en el chat actual; rangos solicitados: 446–599 y 1208–1792. Clasificación `USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT`. No es verificación local independiente ni evidencia runtime.

## 1. `itemStart(String,int)`

- Llama a `findProgressItemIndex(packageName,feature)` y asigna el resultado a `mWorkingIndex`.
- Solo continúa si el índice es no negativo y menor que `getCount()`.
- Obtiene el `ProgressItem` correspondiente y escribe `BRItem.state=2).
- Llama a `updateSingleItem()`, desplaza el `ListView` mediante `smoothScrollToPositionFromTop(index,0)`, llama a `ProgressItem.updateProgress()` y recalcula el progreso total mediante `computeTotalProgress()` / `updateTotalProgress()`.
- Si el índice no es válido, registra índice, lista, paquete y feature.

## 2. `setItemsAborted()`

- Si `mItems` no es null, recorre todos sus `ProgressItem`.
- Para cada elemento escribe incondicionalmente `BRItem.state=3` y `BRItem.error=9`; no hay filtro por estado previo en el bucle mostrado.
- Al terminar llama a `notifyDataSetChanged()`.
- El fragmento no muestra aquí una actualización individual ni un recálculo explícito de progreso total.

## 3. `updateWorkingItemProgress(String,int,int,long,long)`

- Solo busca el elemento por paquete/feature cuando `mWorkingIndex == -1`; si ya tiene otro valor, reutiliza ese índice.
- Comprueba que el índice esté dentro de `[0,getCount())`.
- Escribe `progType` y `completedSize` en el `BRItem`.
- Lee `totalSize`; solo si el valor existente es cero y el argumento de tamaño total (`p6`) no es `-1`, escribe `totalSize=p6`.
- Llama a `ProgressItem.updateProgress()`, `updateSingleItem()` y recalcula el progreso total.
- Si el índice no es válido, registra índice, lista, paquete y feature.

## 4. `workingItemError(String,int,int)`

- Si `mWorkingIndex == -1`, localiza el elemento por paquete/feature y almacena el índice.
- Con índice válido, escribe `BRItem.state=3` y `BRItem.error=p3`, y llama a `updateSingleItem()`.
- En el cuerpo compartido no se observa reinicio de `mWorkingIndex`, ni llamada a `computeTotalProgress()` / `updateTotalProgress()`.
- El caso de índice inválido genera un log con índice, lista, paquete y feature.

## 5. `workingItemFinished(String,int)`

### Selección y transición de estado

1. Si `mWorkingIndex == -1`, busca el elemento por paquete/feature y almacena el índice. Si el índice queda fuera de rango, registra el error y retorna.
2. Obtiene el `ProgressItem`. Si el `BRItem.state` leído es `2`, escribe `state=1`.
3. Después de esa primera normalización, si el estado es `1`, `3` o `6`, compara `mFinishedAndFailedCount` con `mWorkingIndex + 1`; solo si el contador es menor, lo incrementa en uno.
4. Si `BRItem.error == 0`, escribe `state=1`. Esta comprobación ocurre después del bloque que incrementa `mFinishedAndFailedCount`.
5. Llama a `ProgressItem.updateProgress()` y reinicia `mWorkingIndex=-1`.
6. Si el estado resultante es `1`, incrementa `mSuccessfulCount` y continúa con el cálculo de tamaños descrito abajo.

**Precisión/corrección frente a evidencia 54:** el fragmento actual muestra explícitamente `const/4 v2, -0x1` seguido de `iput v2, ...->mWorkingIndex:I`; por tanto, este método deja `mWorkingIndex=-1`, no `-2`. La afirmación `mWorkingIndex=-2` del resumen previo de evidencia 54 queda corregida por este fragmento directo. Además, el incremento de `mFinishedAndFailedCount` ocurre antes de la condición `error==0), no después.

### Ajuste de tamaños al terminar con estado 1

- Obtiene `bakFileSize` mediante `new File(BRItem.bakFilePath).length()` y lo escribe en el `BRItem`.
- Si `progType == 0` y `completedSize == 0`:
  - para `packageName == "files_for_backup"`, `Customization.WECHAT_PKG_NAME` o `Customization.QQ_PKG_NAME`, copia `totalSize` a `completedSize`;
  - para los demás paquetes, copia `bakFileSize` a `completedSize`.
- En ambas ramas, suma después `splitFileSize` a `completedSize`.
- Para `packageName == "com.android.mms"` o `"com.android.contacts"` y `type == 9`, suma `getBRItemSize(BRItem) * 1000` a `mSuccessfulSize`; en los demás casos suma `getBRItemSize(BRItem)`.
- Finalmente llama a `updateSingleItem()` y recalcula el progreso total.

**Límite de interpretación:** se registran las operaciones y condiciones literales; no se atribuyen unidades físicas a `totalSize`, `completedSize`, `bakFileSize`, `splitFileSize` ni al resultado de `getBRItemSize()`.

## 6. Dedupe frente al expediente

- Evidencia 54 ya resumía que `itemStart` escribe estado 2, el aborto escribe estado 3/error 9, `workingItemError` escribe estado 3/error recibido y `workingItemFinished` puede asignar estado 1; también recogía contadores y el factor ×1000 para MMS/Contacts tipo 9.
- Evidencia 67 ya resumía `initData()`, `getView()`, `updateInfoView()` y la matriz de estados; esos métodos no se vuelven a declarar nuevos aquí.
- El delta de esta evidencia es el detalle directo de los callbacks compartidos: condición de reutilización/búsqueda de `mWorkingIndex`, escrituras de progreso y tamaño, orden exacto de las condiciones en `workingItemFinished()`, normalización explícita `mWorkingIndex=-1), cálculo de `bakFileSize/completedSize/splitFileSize` y ausencia visible de reinicio/actualización total en `workingItemError()`.
- La evidencia 54 se corrige en su afirmación concreta de `mWorkingIndex=-2`; se conserva el resto de su alcance sin elevar sus resúmenes a transcripción Smali literal.

## 7. Límites

- El usuario compartió ventanas de métodos, no el archivo completo ni su hash.
- La salida contiene saltos/alineación irregulares en el texto pegado; el análisis se limita a las instrucciones legibles.
- No se recibió en este bloque el cuerpo de `findProgressItemIndex()`, `getBRItemSize()`, `computeTotalProgress()`, `updateSingleItem()` ni `ProgressItem.updateProgress()`; no completar sus contratos desde los callsites.
- No se infiere el significado semántico general de los valores numéricos de `state`/ `error`, ni comportamiento runtime.
