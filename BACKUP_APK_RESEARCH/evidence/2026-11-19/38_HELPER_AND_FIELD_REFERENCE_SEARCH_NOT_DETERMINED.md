# Evidencia 38 — Búsqueda inicial de helper boolean y referencias apkSize/dataSize: no determinada

**Fecha:** 2026-11-19  
**Rama:** `backup-apk-static-research-2026-11-19`  
**Procedencia:** salida de comandos locales pegada por el usuario.  
**Clasificación:** RESULTADO NO DETERMINADO; no es evidencia de ausencia.

## 1. Salida observada

Se ejecutó una búsqueda de la declaración del helper dentro de:

`$HOME/backup-static/decoded/smali/com/miui/backup`

con `grep -Rnl 'class Utils.*ExternalSyntheticApiModelOutline0'`, sin resultados visibles.

También se ejecutaron búsquedas para `->apkSize:` y `->dataSize:` con `grep -Rnn`, suprimiendo stderr, sin resultados visibles.

## 2. Por qué el resultado no permite concluir ausencia

- La expresión de helper buscaba el texto `class Utils...`, pero una declaración Smali suele expresarse mediante directivas como `.class` y un descriptor Dalvik; la expresión usada no está validada contra el formato real.
- Los patrones `->apkSize:` y `->dataSize:` comienzan con guion. Sin el separador de opciones `--`, grep puede interpretarlos como opciones. Como stderr se redirigió a `/dev/null`, un error de opción pudo quedar oculto.
- La búsqueda se limitó a un subdirectorio `smali/com/miui/backup`; aún no se ha demostrado que cubra todos los árboles `smali*` del APK decodificado.

## 3. Clasificación

- Helper boolean: **NO DETERMINADO**.
- Referencias a `BRItem.apkSize`: **NO DETERMINADO**.
- Referencias a `BRItem.dataSize`: **NO DETERMINADO**.

No afirmar que el helper no existe ni que los campos carecen de consumidores.

## 4. Siguiente extracción corregida (solo lectura)

Buscar el archivo helper en todo el árbol decodificado con `find`, y buscar referencias exactas en todos los archivos Smali con `grep -F --` (o `grep -F --include='*.smali' --`).

