# Evidencia 28 — ProgressItemAdapter: identidad de BRItem, conteo y representación visual

**Fecha:** 2026-11-19  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Base documental:** evidencia 27 y expediente maestro v0.11 consultados en GitHub antes de esta actualización.  
**Procedencia:** DIRECT-CHAT; hallazgos comunicados por el usuario a partir de la extracción Smali. No se leyó el checkout de Termux ni los archivos Smali directamente en esta sesión.  
**Estado:** CONFIRMADO EN EL MATERIAL COMPARTIDO; verificación independiente LOCAL-VERIFIED pendiente.

## 1. Objetivo

Continuar el seguimiento de la referencia `BRItem` desde `ArchiveHelper.unzipFiles()` hacia `ProgressItemAdapter`, y separar tres cuestiones que no deben confundirse:

1. clasificación estadística de éxito;
2. porcentaje/progreso asignado al elemento;
3. representación visual de la fila.

## 2. Identidad de objeto dentro de ProgressItemAdapter

Según el bloque compartido:

- `initData([BRItem])` recibe un arreglo de objetos `BRItem` y recorre sus elementos, asignando cada elemento a `v4`.
- `initData()` construye `ProgressItem` pasándole directamente `v4`; en el bloque compartido no se observa reconstrucción del `BRItem`.
- El constructor de `ProgressItem` ejecuta:

```smali
iput-object p2, p0, ...->brItem:Lcom/miui/backup/service/BRItem;
```

Por tanto, `ProgressItem.brItem` conserva la misma referencia recibida en `p2`. Esto cierra la identidad entre el elemento iterado por `initData()` y el campo `ProgressItem.brItem`, dentro de los bloques examinados.

**Límite importante:** todavía no demuestra que el elemento iterado sea la misma instancia que recibió `restoreLocalMediaFile()`/el helper, ni que el arreglo entregado a `initData()` proceda directamente de `BRService.mBRItems`. Falta el caller de `initData()` y la procedencia del arreglo.

## 3. Clasificación inicial y conteo

El usuario informa que `initData()` no consulta `BRItem.error` al clasificar:

- `state=1` o `state=6`: incrementa `mSuccessfulCount`.
- `state=3`: se considera terminado, pero no exitoso.

La evidencia 15 ya conservaba que `getSuccessfulCount` cuenta estados 1 y 6, y que `initData` trata 1, 3 y 6 como terminados. Este nuevo bloque concreta que la clasificación inicial descrita no usa `error`.

## 4. Progreso calculado por ProgressItem.updateProgress()

Según el bloque compartido, `ProgressItem.updateProgress()` asigna 100 % cuando `BRItem.state` es 1 o 6. El método no consulta `BRItem.error`.

Esto confirma que, para esos estados, el cálculo de progreso y el conteo de éxitos se basan en `state`, no en una comprobación del campo `error` dentro de los métodos citados.

## 5. Representación visual: pendiente separado

`updateSingleItemUI()` sí lee `BRItem.error` alrededor de la línea 954, según el material compartido. No se ha recibido todavía el cuerpo completo que permita determinar:

- qué valores de `error` reconoce;
- si cambia icono, texto, color, estado visual o mensaje;
- si el tratamiento de `error!=0` modifica únicamente la fila o también corrige contadores/progreso;
- si la rama visual distingue explícitamente `state=1,error=1`.

Por ello, **no concluir que la fila se presenta como exitosa**. La lectura de `error` puede afectar a la representación visual, pero su efecto exacto permanece UNKNOWN hasta inspeccionar el cuerpo completo.

## 6. Hipótesis reconciliada

La combinación siguiente está respaldada por los bloques compartidos, con el límite de procedencia indicado:

1. El overload de siete argumentos de `ArchiveHelper.unzipFiles()` conserva la referencia `BRItem p3` y puede escribir `error=1` en ella (evidencia 27).
2. El resumen previo de `restoreLocalMediaFile()` indica que el caller asigna después `state=1` cuando no detecta aborto (evidencias 25–26).
3. `initData()` cuenta `state=1` como éxito sin consultar `error`.
4. `ProgressItem.updateProgress()` da 100 % a `state=1` sin consultar `error`.
5. `ProgressItem.brItem` conserva la referencia que recibió el constructor.

Esto hace técnicamente plausible que un objeto con `state=1,error=1` sea contado como éxito y reciba progreso del 100 %, **si** es la misma instancia y no existe una escritura intermedia que cambie alguno de esos campos.

**No está demostrado un bug ni la presentación visual de éxito.** `updateSingleItemUI()` lee `error`; falta su lógica completa. Tampoco se ha cerrado el origen del arreglo recibido por `initData()`.

## 7. Próximas comprobaciones exactas

### A. Caller de initData()

El patrón de grep que comienza por `->initData` debe pasarse con separador de opciones `--`, para que el patrón no sea interpretado como una opción:

```bash
grep -R -n -F -- '->initData([Lcom/miui/backup/service/BRItem;)V' "$D/com/miui/backup" 2>/dev/null
```

Inspeccionar el método caller completo y determinar de dónde procede el arreglo: `mBRItems`, getter, parámetro, copia de lista o reconstrucción.

### B. Lógica visual

```bash
sed -n '869,1100p' "$A"
```

Confirmar primero que `A` apunta al archivo `ProgressItemAdapter.smali` correcto. Examinar el método completo `updateSingleItemUI()`, en especial el uso de `BRItem.error` alrededor de la línea 954 y sus ramas de presentación.

### C. Exposición/origen de BRItems

```bash
sed -n '1790,1855p' "$A"
```

Este rango solo debe usarse si `A` apunta al archivo que contiene el getter/exposición correspondiente; si no, definir una variable distinta para `BRService.smali` y extraer el rango allí. Identificar el método y no asumir que las líneas pertenecen al mismo archivo.

## 8. Estado de cierre

| Pregunta | Estado |
|---|---|
| ¿`initData` itera objetos BRItem? | CONFIRMADO EN MATERIAL COMPARTIDO |
| ¿Pasa el elemento directamente al constructor ProgressItem? | CONFIRMADO EN MATERIAL COMPARTIDO |
| ¿`ProgressItem.brItem` conserva esa referencia? | CONFIRMADO EN MATERIAL COMPARTIDO |
| ¿El conteo inicial consulta `error`? | No, según el bloque compartido |
| ¿`state=1/6` cuenta como éxito? | CONFIRMADO EN MATERIAL COMPARTIDO; consistente con evidencia 15 |
| ¿`state=1/6` produce 100 % en updateProgress? | CONFIRMADO EN MATERIAL COMPARTIDO |
| ¿`updateSingleItemUI` lee `error`? | Sí, lectura reportada alrededor de línea 954 |
| ¿Cómo representa visualmente `error!=0`? | PENDIENTE |
| ¿El arreglo viene de `mBRItems`? | PENDIENTE |
| ¿Es la misma instancia desde restoreLocalMediaFile hasta initData? | PENDIENTE |
| ¿Existe bug demostrado? | NO; hipótesis/riesgo condicionado |

**Siguiente paso:** obtener los tres bloques anteriores y cerrar primero el caller de `initData()` y el cuerpo completo de `updateSingleItemUI()`. No se requiere Claude todavía; no ampliar a otras rutas mientras estas dos comprobaciones puedan resolver la incertidumbre concreta.

## 9. Límites

Investigación estática y documental. No ejecutar Backup/Restore, no iniciar servicios, no realizar pruebas dinámicas, no modificar el APK ni subir el APK propietario. Esta evidencia registra lo compartido por el usuario; no constituye lectura local independiente.
