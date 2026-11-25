# Evidencia 156 — BRService$5: comprobaciones de v5 y selección de rutas de restauración — 2026-11-24

**Método:** `.method public run()V`.  
**Procedencia:** ventanas físicas 1485–1535, 2410–2465 y 2980–3040 compartidas por el usuario desde Termux en el chat actual.  
**Clasificación:** USER-PROVIDED / CURRENT-CHAT-TERMUX-OUTPUT. Sin cotejo local independiente, sin hash del Smali y sin ejecución dinámica.

## 1. Comprobación en línea 1509

La instrucción `if-eqz v5, :cond_2a` desvía cuando v5 es null. Si v5 no es null, el flujo consulta `File.exists()` sobre el objeto `v4`; si el archivo no existe, también salta a `:cond_2a`. Por tanto, esta ruta exige dos condiciones observables: referencia v5 no nula y existencia del archivo representado por v4. El fragmento compartido no basta para caracterizar el resto de la rama ni para afirmar validación/integridad del ZIP.

## 2. Comprobación en línea 2437

En `:cond_3d`, `if-eqz v5, :cond_47` desvía al bloque `:cond_47` cuando v5 es null. Si v5 no es null, continúa por la rama que obtiene `BRItem.localFileList` y calcula el sufijo con `getZipSuffixType(packageName, type)`; cuando la lista es null, consulta `BRServiceDataHolder.getTypeBRServiceFileList(suffix)`.

La ruta `:cond_47` es la ruta alternativa local documentada en evidencias 148/149. Esta bifurcación confirma que la presencia de v5 selecciona la ruta ZIP/lista asociada, mientras que su ausencia conduce a la ruta alternativa; no demuestra por sí sola que la extracción termine con éxito.

## 3. Comprobación en línea 3011

En `:cond_4c`, `if-eqz v5, :cond_59` vuelve a desviar cuando v5 es null. Si no es null, el flujo obtiene `BRItem.localFileList`, calcula `getZipSuffixType(packageName, type)` y, si la lista es null, consulta `BRServiceDataHolder.getTypeBRServiceFileList(suffix)`.

La ventana termina en la continuación de esta rama. No se atribuye a `:cond_59` una semántica adicional no visible en el fragmento.

## 4. Lectura conjunta y límites

- Las lecturas de v5 en 1509, 2437 y 3011 son guardias de flujo que separan rutas según la presencia de la referencia ZipFile establecida en la inicialización documentada en evidencia 153.
- En 1509, la presencia de v5 no basta: también se comprueba `File.exists()` sobre v4.
- En 2437 y 3011, v5 no nulo permite continuar por ramas que obtienen la lista local directa o la lista alternativa de `BRServiceDataHolder`; v5 null toma destinos alternativos.
- Esto precisa el alcance de v5: no es solo un dato usado al asignar `BRItem.error`; también participa en la selección de rutas dentro de `run()`.
- `File.exists()` no demuestra que el archivo sea un ZIP íntegro, legible o restaurable. No se infiere éxito dinámico, contenido válido ni finalización de la restauración.
- La ausencia de reasignaciones intermedias de v5 entre su inicialización y estas guardias se apoya en el inventario de operandos de evidencia 154 y su clasificación parcial en evidencia 155; no equivale a una auditoría de todos los usos del método.

**Dedupe:** las operaciones de obtención/recorrido de listas y la ruta alternativa local ya están descritas en evidencias 148/149. Esta evidencia conserva el delta específico de las tres guardias y su relación con la presencia de v5; no vuelve a documentar los cuerpos ya preservados.

**Estado:** análisis estático documental; investigación INCOMPLETA.
