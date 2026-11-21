# Evidencia 104 — ProgressPageFragmentBase$6: lecturas Bundle antes de startRestoreCommand — 2026-11-21

**Clasificación:** `USER-FACT / RECOVERED-CHAT`; no `LOCAL-VERIFIED`.
**Fuente histórica:** mensaje del usuario del 2026-11-17T03:27:35Z.
**Alcance:** delta frente a evidencia 94; no se recuperó aquí el bloque Smali íntegro.

## Anclas y contenido recuperado

Para `ProgressPageFragmentBase$6.smali` se conserva el siguiente detalle del bloque histórico compartido:

- Ventana física reportada: líneas **245–290**.
- Directiva Smali reportada dentro del bloque: `.line 1187` (no confundir con línea física).
- Lecturas de Bundle para las claves `extra_descriptor`, `extra_descriptor_dir` y `extra_zip_path`.
- Métodos de lectura reportados: `getParcelable`, `getString` (con valor por defecto en el registro `v1`) y `getInt` (con uso del registro `v6`).
- Registros mencionados en el fragmento: `v4`–`v10`.
- La llamada a la sobrecarga de siete argumentos de `BRService.startRestoreCommand(...)` se ubica en la línea física **275**.

## Delta frente a evidencia 94

La evidencia 94 ya conservaba que `ProgressPageFragmentBase$6.smali:275` invoca directamente la sobrecarga de siete argumentos y que obtiene datos de un Bundle, incluyendo `extra_descriptor_dir` y `extra_zip_path`. Este registro añade las tres claves explícitas, los métodos de lectura reportados, el rango físico 245–290, la directiva `.line 1187` y el rango de registros `v4`–`v10`.

## Límites

- La recuperación disponible no contiene el texto Smali consecutivo completo ni el encabezado `.method`.
- No se conservan los valores exactos de todos los registros, el descriptor completo de la invocación, el orden íntegro de las instrucciones ni las condiciones circundantes.
- No reconstruir la llamada ni inferir el significado de cada registro a partir de este inventario.
- La línea física 275 y la directiva `.line 1187` son coordenadas distintas.
- Este delta no demuestra que el Intent llegue a ejecutarse, que los extras sean válidos ni que la restauración concluya.

**Estado:** amplía la descripción documental de la ruta de siete argumentos; no cierra la ejecución efectiva ni cambia el estado INCOMPLETO del expediente.
