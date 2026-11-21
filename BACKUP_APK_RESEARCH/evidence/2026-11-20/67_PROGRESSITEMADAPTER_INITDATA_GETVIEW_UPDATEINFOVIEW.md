# Evidencia 67 — ProgressItemAdapter: initData(), getView() y updateInfoView()

**Fecha:** 2026-11-20  
**Área:** presentación y contabilidad de progreso de BRItem  
**Clasificación:** USER-REPORTED-EXTRACTION-SUMMARY / DIRECT-CHAT  
**Estado:** CONSERVADO; pendiente de cotejo del bloque Smali literal y de los recursos.

## Procedencia y límite

El usuario trasladó a este chat el resumen de los resultados obtenidos mediante extracción directa de `ProgressItemAdapter`. En este mensaje no se incluyó el bloque Smali literal ni los números de línea de cada método. Por tanto, esta evidencia preserva fielmente el contenido reportado, pero no convierte el resumen en una transcripción primaria ni acredita verificación independiente del archivo local. No inferir líneas, instrucciones ni overloads no suministrados.

## 1. initData() — inicialización y contabilidad

Según el resultado de extracción reportado:

- Limpia `mItems` y reinicia `mSuccessfulSize` y `mFinishedAndFailedCount`.
- Recorre el arreglo original y crea un `ProgressItem` por cada `BRItem`, conservando la referencia al objeto original.
- Los estados `1`, `3` y `6` incrementan `mFinishedAndFailedCount`.
- Solo los estados `1` y `6` incrementan `mSuccessfulCount`.
- Para estados `1` y `6`, puede recalcular `bakFileSize` a partir del archivo existente y ajustar `completedSize`.
- Para `com.android.mms` y `com.android.contacts` cuando `type == 9`, el tamaño aportado a `mSuccessfulSize` se multiplica por 1000.
- Finalmente llama a `notifyDataSetChanged()`.

**Distinción conservada:** `state=3` cuenta como finalizado para `mFinishedAndFailedCount`, pero no como éxito. El resumen lo relaciona con el cálculo de fallidos como complemento del total; la fórmula exacta y el conjunto completo de estados deben cotejarse en el método literal antes de elevar esa interpretación.

## 2. getView() — enlace visual

Según el resultado de extracción reportado:

- Infla el layout `0x7f0d00df`.
- Asocia título, información, indicador de carga, barra circular e imagen de estado.
- Guarda el `ViewHolder` en el tag para reutilización.
- Actualiza `pkg` y `feature` desde el `BRItem`.
- Usa `ProgressItem.title` para el título.
- Llama a `updateSingleItemUI()` para representar estado y error.
- Instala un `AccessibilityDelegate`.

No se atribuyen IDs de vistas ni recursos adicionales que no estén incluidos en el resumen del usuario.

## 3. updateInfoView() — texto informativo

Según el resultado de extracción reportado:

### SMS y contactos

La rama especial se aplica cuando:

- `packageName == "com.android.mms"` y `feature == 1` o `2`; o
- `packageName == "com.android.contacts"` y `feature == 1` o `2`.

La vista obtiene el plural desde el recurso `0x7f10000c), usando `completedSize` como cantidad para seleccionar la forma plural y también como argumento de formato. La representación reportada es una cantidad localizada, no porcentaje ni tamaño de archivo convencional.

### Regla general

Para los demás elementos:

- Construye el porcentaje a partir de `ProgressItem.progress`.
- En RTL coloca `%` antes del número; en LTR, después.
- En Android API 26 o superior agrega el tamaño de `BRItem.completedSize`, formateado mediante `ExtraTextUtils.formatFileSize()`.
- Separa tamaño y porcentaje con un espacio.
- Usa `BidiFormatter` y dirección LTR para insertar correctamente el porcentaje en texto bidireccional.
- En API inferior a 26 no agrega ese tamaño; conserva el porcentaje.

### Condición de ejecución

La actualización del `TextView` está condicionada a `ProgressPageFragmentBase.isAdded()`. Si el fragmento no está agregado, no actualiza el texto.

## 4. Matriz de representación de estados

Matriz reportada al relacionar los métodos; debe conservarse como resumen de presentación, no como sustituto del cuerpo de `updateSingleItemUI()`:

| BRItem.state | Representación |
|---|---|
| 0 | Indicador de carga |
| 1 y 6 | Icono de éxito |
| 2, 4, 5, 7 y 8 | Barra circular y texto de progreso |
| 3 | Icono de error y texto seleccionado por `BRItem.error` |

En los estados que muestran progreso, `updateInfoView()` determina el texto complementario. Para SMS/contactos con las condiciones anteriores, sustituye el formato general por una cantidad localizada.

## 5. Recursos pendientes

Resolver desde los recursos decodificados:

- Plural `0x7f10000c` en `res/values/plurals.xml` o el archivo de recursos correspondiente.
- Strings `0x7f120142`, `0x7f12014d`, `0x7f120149`, `0x7f120150`, `0x7f12014f`, `0x7f120143` y `0x7f1203de` en `strings.xml` o sus variantes localizadas.

No asignar textos semánticos a esos IDs hasta cotejar `public.xml` y los recursos efectivos. Debe comprobarse también si los plurales/string tienen variantes por locale.

## 6. Próximo paso delimitado

Continuar con la resolución estática de los ocho IDs de recursos indicados. No volver a extraer `getView()`, `initData()` ni `updateSingleItemUI()`; tampoco repetir `updateInfoView()` salvo que el cotejo de recursos revele una ambigüedad concreta. La salida literal de los métodos y sus coordenadas físicas pueden añadirse después si se recuperan, sin borrar esta clasificación de procedencia.

## 7. Conclusiones que no se autorizan

- No inferir que el valor de `mSuccessfulSize` equivale siempre al tamaño real transferido/restaurado.
- No inferir que `completedSize` es siempre un contador de elementos: su unidad depende de la rama SMS/contactos frente a la regla general.
- No inferir textos finales, pluralización exacta ni traducciones a partir de los IDs numéricos.
- No presentar esta evidencia como verificación runtime, ni como cotejo independiente del checkout local.
