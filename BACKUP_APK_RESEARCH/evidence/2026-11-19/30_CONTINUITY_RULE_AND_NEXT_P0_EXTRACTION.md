# Evidencia 30 — Regla de continuidad por respuesta y siguiente extracción P0

**Fecha:** 2026-11-19  
**Rama:** backup-apk-static-research-2026-11-19  
**Base:** expediente maestro v0.13; evidencias 27–29.  
**Estado:** PLAN DE CONTINUACIÓN; sin nueva evidencia Smali primaria.

## 1. Regla operativa permanente solicitada por el usuario

A partir de esta instrucción, **cada respuesta que avance la investigación debe dejar un registro persistente en GitHub antes de cerrar la respuesta**. No basta con prometer guardar después.

En cada ciclo:
1. conservar los hallazgos nuevos y su procedencia;
2. actualizar el expediente maestro;
3. crear o actualizar una evidencia numerada cuando haya material técnico nuevo, una decisión metodológica o un handoff que deba sobrevivir al cambio de chat;
4. verificar por lectura posterior el contenido guardado y el commit;
5. informar el SHA/URL y distinguir lo guardado de lo que aún no está verificado.

No crear evidencia artificial cuando una respuesta sea solo una aclaración sin contenido de investigación; en ese caso, registrar la regla una sola vez y aplicar la continuidad al siguiente avance técnico. Esta evidencia 30 deja formalizada la regla.

## 2. Punto exacto de continuación

El último tramo técnico preservado es:
- Evidencia 27: identidad de BRItem dentro de ArchiveHelper.unzipFiles() y call site BRService.smali:12918.
- Evidencia 28: initData([BRItem]) pasa el mismo objeto al constructor ProgressItem; el adapter cuenta state=1/6 como éxito y updateProgress() asigna 100 % sin consultar error; updateSingleItemUI() lee error, pero su efecto no está cerrado.
- Evidencia 29: recuperación parcial del inventario global BRItem.state/error; la salida literal íntegra no está disponible.

No repetir estas inspecciones. El siguiente trabajo debe cerrar la continuidad de objeto y la presentación UI.

## 3. Extracción P0 solicitada (solo lectura)

En Termux, con D apuntando al directorio smali del árbol decodificado:

~~~bash
printf '%s\n' '=== CALLERS initData ==='
grep -R -n -F -- '->initData([Lcom/miui/backup/service/BRItem;)V' "$D" 2>/dev/null

printf '%s\n' '=== DEFINICION / CALLERS updateSingleItemUI ==='
grep -R -n -F -- 'updateSingleItemUI' "$D" 2>/dev/null

printf '%s\n' '=== GETTERS / EXPOSICION BRItem[] ==='
grep -R -n -E -- 'getBRItems|\[Lcom/miui/backup/service/BRItem;|mBRItems' "$D/com/miui/backup" 2>/dev/null
~~~

Enviar la salida completa, incluyendo rutas y números de línea. No ejecutar Backup/Restore, servicios, tests ni acciones de escritura.

**Después de recibir las rutas exactas**, solicitar únicamente los rangos sed necesarios para:
1. método caller de initData: procedencia del array, posible copia/parcelación/reconstrucción;
2. cuerpo íntegro de updateSingleItemUI(), incluidas todas las ramas que leen BRItem.error;
3. getter/exposición de BRItem[] y su origen en mBRItems.

No usar A hasta confirmar que apunta al archivo concreto. Evitar rangos de línea basados en otro archivo.

## 4. Continuación posterior

Una vez cerrados esos tres puntos:
- volver al call site BRService.smali:12918;
- reconstruir la procedencia del registro v5, que es el argumento formal BRItem p3 del helper;
- seguir el listener terminal y las escrituras de state/error entre helper y array entregado al adapter;
- cotejar el inventario global de evidencia 29 contra las salidas literales locales, conservando todos los conflictos históricos sin resolverlos por inferencia.

## 5. Límites

La próxima salida de grep todavía será evidencia compartida por chat, no LOCAL-VERIFIED independiente del asistente. Solo los archivos/hashes locales recalculados y leídos permitirán elevar esa clasificación.

No solicitar Claude todavía: las inspecciones directas pendientes son acotadas y no justifican gastar su contexto. No modificar APK ni ejecutar comportamiento de restauración.
