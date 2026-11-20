# Evidencia 56 — Recuperación parcial de BRService.onStartCommand(CMD_RESTORE)

- Fecha de consolidación: 2026-11-20
- Rama: backup-apk-static-research-2026-11-19
- Procedencia: mensaje histórico del usuario del 16-11-2026, 16:50:47Z, recuperado mediante búsqueda de conversaciones.
- Clasificación: USER-FACT / DIRECT-CHAT para el resumen del bloque que el usuario dijo haber pegado/analizado; no se recuperó en esta búsqueda el texto Smali literal completo.
- No LOCAL-VERIFIED en esta sesión. No ejecución dinámica.
- Integridad: el registro histórico recuperado termina truncado en la frase “retorna 1 en tipo…”. No completar la condición de retorno.

## 1. Rama CMD_RESTORE: datos recuperados

El usuario describió la rama de `BRService.onStartCommand()` asociada a la acción `CMD_RESTORE`. Los elementos explícitamente recuperados son:

- Lee `extra_is_from_miasist`.
- Lee `extra_bakfiles_type`, con default reportado de `1`.
- Lee `extra_britems`.
- Obtiene descriptor desde `BRServiceDataHolder` o desde `extra_descriptor_dir`.
- Lee `extra_zip_file_path`.
- Invoca `restoreFiles()` cuando hay BRItems, o también bajo la condición descrita como `tipo=3/reinicio`.
- Si la lista es null, registra literalmente: `"restoreFiles brItems is null"`.
- En esa rama de lista null, se reportó llamada `setState(mState,0xc,6)`.

El mensaje recuperado no permite determinar:
- si “tipo=3/reinicio” es una conjunción, disyunción o dos ramas separadas;
- el significado exacto de los parámetros `0xc` y `6` sin verificar la firma de setState;
- el orden exacto de lecturas, validaciones y llamadas;
- el resto de ramas y returns;
- si descriptor desde BRServiceDataHolder y extra_descriptor_dir son alternativas excluyentes, fallback o condiciones distintas;
- qué hace exactamente restoreFiles con cada combinación de argumentos.

## 2. Retorno truncado

La recuperación histórica termina con el fragmento: “retorna 1 en tipo…”. La condición que sigue no está disponible.

**Regla:** no reconstruir la condición a partir de patrones Android, del nombre de la acción o de la rama de overload de siete argumentos. El valor 1 y su condición quedan como dato parcial no utilizable para afirmar el comportamiento de retorno global.

## 3. Relación con startRestoreCommand de siete argumentos

La variante de siete argumentos, documentada en evidencia 55, prepara Intent explícito CMD_RESTORE y añade:
- `extra_descriptor`;
- `extra_descriptor_dir`;
- `extra_britems` condicional;
- `extra_zip_file_path`;
- `extra_is_from_miasist`;
- `extra_bakfiles_type`.

La rama CMD_RESTORE de onStartCommand recuperada aquí consume un subconjunto de esos extras y también menciona `BRServiceDataHolder`. No se puede concluir todavía qué extras son obligatorios, cuáles prevalecen cuando hay descriptor en holder y cuáles son solo fallback.

## 4. Corrección de clasificación respecto de evidencia 55

La sección 3 de evidencia 55 había clasificado toda la descripción de la rama CMD_RESTORE como PRIOR-ASSISTANT-OUTPUT / NO REVALIDATED. Esta recuperación demuestra que sí existe un resumen histórico atribuido directamente al usuario del 16-11-2026. Por tanto, la clasificación correcta para los puntos explícitos de la sección 1 es USER-FACT / DIRECT-CHAT, pero no Smali literal reproducido ni LOCAL-VERIFIED.

La advertencia de no tratarlo como cuerpo completo sigue vigente.

## 5. Pendientes

1. Recuperar el bloque literal completo de `BRService.onStartCommand()` en la rama CMD_RESTORE.
2. Fijar condiciones exactas para `restoreFiles()`, incluida la expresión `tipo=3/reinicio`.
3. Resolver precedencia/uso de `BRServiceDataHolder`, `extra_descriptor` y `extra_descriptor_dir`.
4. Verificar firma de `setState` antes de interpretar `(mState,0xc,6)`.
5. Recuperar la continuación de la frase de retorno truncada; hasta entonces no inferirla.
6. Seguir `restoreFiles()` a sus callers y efectos sin ejecutar el servicio.
7. Solo lectura estática.

**Conclusión:** ahora existe evidencia histórica atribuible al usuario sobre la rama CMD_RESTORE, suficiente para identificar extras leídos, una ruta a restoreFiles y una rama de lista nula. La descripción es parcial y no reemplaza el bloque Smali. La condición de retorno permanece desconocida.
