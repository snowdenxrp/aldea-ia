# Evidencia 124 — Writers de BRItem.state en BRService$5, BRService$6 y FakeBackupListenerImp

**Fecha:** 2026-11-22  
**Procedencia:** `USER-PROVIDED / CURRENT-CHAT-TERMUX-SED-OUTPUT`. Fragmentos copiados por el usuario desde la extracción local. No verificados independientemente en este entorno; sin ejecución dinámica.

## Alcance

Se cotejan los fragmentos compartidos para las ventanas físicas:
- `BRService$5.smali`: 2320–2380, 2520–2570, 2680–2725 y 2780–2810.
- `BRService$6.smali`: 2470–2510.
- `BRService$FakeBackupListenerImp.smali`: 1250–1290, 1435–1475 y 1740–1785.

Las coordenadas físicas de las escrituras se relacionan con el inventario grep compartido previamente. Los números de `.line` que aparecen en los fragmentos son metadatos de depuración y no deben confundirse con líneas físicas.

## Hallazgos confirmados en los fragmentos

### 1. `BRService$5.smali`

- **Física 2351; `.line 1735`:** en la rama donde `mIsTransingTask` es verdadero y `packageName == "files_for_backup"`, el método llama primero a `waitingForFilesTransingEnd()`; después, si el estado actual no es 6, escribe `BRItem.state = 6`. El fragmento muestra a continuación la preparación de argumentos que incluyen estado, error y tamaños para una llamada posterior. No se atribuye aquí una semántica global a 6.
- **Física 2547; `.line 1761–1762`:** dentro de un bucle, si `mIsAborted` es verdadero, escribe `state = 3` y `error = 9`, y salta a `:goto_2a`.
- **Física 2707; `.line 1790–1791`:** al cerrar el segmento mostrado, si el estado no es 1, 6 ni 3, escribe `state = 1` y `progType = 0`; después llama a `notifyItemTaskEnd(packageName, feature)`. La condición excluye expresamente los tres estados mencionados; no prueba por sí sola el resultado funcional de todos los caminos del método.
- **Física 2790; `.line 1799–1800`:** en otra rama de aborto, escribe `state = 3` y `error = 9`, y salta a `:goto_2d`.

### 2. `BRService$6.smali`

- **Física 2495; `.line 2657–2658`:** la rama `:cond_42` escribe `state = 3` y registra el texto `"Backup One, result failed"`. El fragmento no muestra en esa rama una escritura de `error`.

### 3. `BRService$FakeBackupListenerImp.smali`

- **Física 1273; `.line 5921`:** en el fragmento de `onBackupEnd(String, I)`, la escritura es `state = v3`; inmediatamente después se escribe `progType = v4` y se llama a `notifyItemTaskEnd(packageName, feature)`. El valor concreto de `v3` no se establece en la ventana recibida y queda **sin resolver**.
- **Física 1455; `.line 5719`:** en `onBackupStart(String, I)`, se carga explícitamente `const/4 v0, 0x2` y se escribe `state = 2`. Después se actualiza `startTime` con `SystemClock.elapsedRealtime()`.
- **Física 1753; `.line 5834`:** en `onError(String, I, I)`, se escribe primero `state = 3`. El fragmento inicia después una selección por el parámetro `p3`, pero la ventana termina antes de mostrar todas las ramas; no se reconstruye aquí el mapping completo de errores.

## Relación con el inventario previo y deduplicación

El inventario grep previo ya contenía estas coordenadas y las siguientes escrituras adicionales:
- `BRService$5.smali`: 1151, 1259, 1283, 1336, 1441, 2351, 2547, 2707, 2790, 3225, 3463, 3691 y 3801.
- `BRService$6.smali`: 1557, 2128 y 2495.
- `BRService$FakeBackupListenerImp.smali`: 1273, 1455 y 1753.

Este documento **no** declara resueltas las escrituras no incluidas en las ventanas actuales (incluidas las asignaciones desde registros `vN` cuyo valor no se trazó). Las coordenadas 2351, 2547, 2707, 2790, 2495, 1273, 1455 y 1753 pasan de inventario a contexto parcial de instrucción por los fragmentos actuales; no son nuevos writers descubiertos hoy.

## Límites y siguientes verificaciones

1. Recuperar métodos completos alrededor de las escrituras restantes, en particular `BRService$5` 1151/1259/1283/1336/1441/3225/3463/3691/3801 y `BRService$6` 1557/2128.
2. Resolver los registros fuente antes de atribuir valores a escrituras `iput vN`.
3. Recuperar el cuerpo completo de `onError` para preservar el mapping de `p3` sin depender de una ventana truncada.
4. Correlacionar los estados 6/7/8 con sus productores y consumidores; no inferir semántica solo por el número o por la representación visual.

No se ejecutó Backup/Restore, no se modificó el APK y no se realizaron pruebas dinámicas.
