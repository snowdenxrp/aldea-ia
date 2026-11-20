# Evidencia 54 — ProgressItemAdapter: semántica de UI, progreso y referencias

- Fecha: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: extracción y bloques Smali descritos/pegados por el usuario el 19-11-2026; recuperación de conversaciones.
- Clasificación: USER-PASTED-SOURCE / DIRECT-CHAT para semántica de ProgressItem, initData y updateProgress; PRIOR-ASSISTANT-SUMMARY para referencias de callers y efectos visuales no preservados.
- No LOCAL-VERIFIED en esta sesión. No ejecución dinámica.

## 1. Entrada de datos y referencia BRItem

- ProgressItemAdapter.initData(BRItem[]) recorre el arreglo recibido en su orden y agrega cada elemento a mItems.
- Cada ProgressItem conserva brItem=p2, es decir, la misma referencia BRItem recibida; no se reportó copia en el constructor.
- Por ello, el adapter mantiene alias a los BRItem que recibió en el mismo proceso/heap. Esto no prueba que la identidad de esos objetos se preserve a través de Binder; la reconstrucción Parcelable sigue separada y está documentada en evidencia 45.
- mSuccessfulSize se reinicia a 0.

## 2. Clasificación de estados y contadores

Evidencia directa recuperada:
- getSuccessfulCount() cuenta elementos con state==1 o state==6.
- getFailedCount() = getCount() - getSuccessfulCount().
- initData() marca como finalizados state 1, 3 y 6.
- state 1 y state 6 incrementan el éxito; state 3 solo cuenta como finalizado, no exitoso.
- La clasificación anterior no consulta BRItem.error para determinar éxito/fracaso en ese punto.
- mFinishedAndFailedCount incluye estados 1/3/6.
- Al finalizar un item, si el estado previo era 2, se convierte en 1; si error==0, también se fuerza state=1; el estado final 1 incrementa mSuccessfulCount; después mWorkingIndex=-2.

**Interpretación:** state 6 es terminal y exitoso para los contadores/UI, aunque su origen en BRService puede diferir del state 1. No se debe describir como error ni inferirlo del campo error.

## 3. Progreso porcentual

updateProgress() recuperado:
- state 1 o 6 → progreso 100.
- state 2 → completedSize / totalSize * 100, con límite máximo 99.
- otros estados → progreso 0.

La lógica de porcentaje no consulta BRItem.error en la descripción recuperada. Un state=6 cuenta como 100% aunque su representación visual exacta pueda diferir de state=1.

## 4. Cálculo de tamaños

initData():
- actualiza bakFileSize y completedSize según las condiciones del item.
- suma getBRItemSize() a mSuccessfulSize para elementos exitosos.
- Excepción de unidades: para com.android.mms o com.android.contacts cuando type==9, suma getBRItemSize()*1000.
- Para los demás casos suma getBRItemSize() sin ese factor.

No convertir automáticamente los tamaños a bytes/KB/MB sin recuperar el contrato de getBRItemSize() y el contexto de UI.

## 5. Título de ProgressItem

Constructor de ProgressItem recuperado:
- Para categorías que no son apps ni MMS/Contacts, el título se obtiene con Category.getItemString().
- Para apps/MMS/Contacts, usa Utils.getFeatureName(context,packageName,feature).
- Si el resultado está vacío, usa Utils.getFeatureNameFromBakFileName(bakFilePath).

No se recuperó aquí el catálogo completo de categorías ni los recursos de strings asociados.

## 6. Mutaciones y actualización de filas

Hallazgos de callback previamente pegados:
- itemStart(): localiza el elemento, asigna state=2, llama updateSingleItem(), hace scroll y actualiza progreso.
- setItemsAborted(): recorre mItems, asigna state=3/error=9 y llama notifyDataSetChanged().
- workingItemError(): asigna state=3/error=p3 y actualiza el elemento.
- workingItemFinished(): normaliza state 2 a 1; error==0 fuerza state=1; al cerrar ajusta contadores e índice de trabajo.

updateSingleItemUI():
- definición reportada en ProgressItemAdapter.smali:869; callers reportados en 855 y 2267.
- lee BRItem.error alrededor de línea 954.
- El efecto visual completo de esa lectura no se conservó; no inventar label, icono ni mensaje.

Una recuperación anterior resumió visualización de estados 0/1/2/3 y otros, pero no se conserva el cuerpo íntegro ni todos los recursos. Se deja como pendiente, no como hecho cerrado.

## 7. Flujo de datos hasta el adapter

Referencias recuperadas de resúmenes previos:
- BRService.getBRItems() devuelve BRItem[].
- IBRService.getBRItems() expone esa operación.
- MiAsistService mantiene un campo BRItem[] y asigna el resultado de IBRService.getBRItems() alrededor de MiAsistService.smali:1618.
- ProgressPageFragmentBase y clases internas $7$1–$7$7 fueron reportadas como callers de ProgressItemAdapter.initData(BRItem[]).
- BRService.mBRItems, en cambio, es ArrayList<BRItem>; no confundir ese contenedor interno con el array devuelto al caller.

Estas relaciones son referencias históricas de callers, no reconstrucción completa del lifecycle UI.

## 8. Límites y pendientes

1. Recuperar updateSingleItemUI() completo, especialmente el switch por BRItem.error y recursos/strings.
2. Recuperar render/bind de cada estado para diferenciar visualmente state 1 frente a 6.
3. Verificar el contrato de getBRItemSize() y unidades antes de interpretar mSuccessfulSize.
4. Recuperar callers exactos de initData() y el orden de actualizaciones/observadores.
5. Mantener la distinción entre referencia Java local y reconstrucción Parcelable entre procesos.
6. No inferir label/icono de error a partir de resúmenes truncados.
7. Solo lectura estática.

**Conclusión:** el adapter considera state 1/6 exitosos, state 3 terminado no exitoso y state 2 en progreso; state 1/6 muestran 100%, state 2 calcula hasta 99%, otros 0. Conserva la referencia BRItem y calcula tamaños con una excepción ×1000 para MMS/Contacts type 9. La UI exacta de errores permanece incompleta.
