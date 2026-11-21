# Evidencia 72 — Delta histórico del despacho de restauración de aplicaciones en BRService$5

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Alcance: preservar detalles adicionales recuperados sobre el bloque de despacho de aplicaciones y sus efectos posteriores.
- Procedencia: conversación del usuario del 17-11-2026 y resúmenes de análisis recuperados de esa conversación.
- Clasificación: `USER-REPORTED-EXTRACTION-ANCHOR` para el rango aproximado 1653–1738 y el call site reportado en 1683; `RECOVERED-CHAT / PRIOR-ASSISTANT-SUMMARY` para los efectos post-despacho cuyo bloque literal no se ha recuperado aquí.
- No LOCAL-VERIFIED; no ejecución dinámica.

## 1. Ancla de extracción y coordenada discrepante

El usuario había compartido salida Smali concreta de `BRService$5.smali` alrededor de las líneas físicas 1653–1738. La recuperación de conversación asocia dentro de ese rango una llamada a:

```
restoreStreamSplitApk(BRItem, ZipFile, InputStream)
```

con call site reportado alrededor de la línea física 1683.

Las evidencias 50 y 58 conservan otra referencia de caller de `restoreStreamSplitApk` en `BRService$5.smali:1899`. No asumir que 1683 y 1899 son la misma instrucción ni que una referencia sustituye a la otra: pueden corresponder a call sites distintos o a coordenadas de extracciones/builds diferentes. La resolución requiere comparar descriptor, contexto del método y hash de archivo de cada extracción. No volver a pedir el bloque completo 1653–1738 si ya está en el historial; recuperar primero ese mensaje exacto.

## 2. Efectos post-despacho recuperados

El resumen histórico de análisis atribuye al flujo posterior a la restauración de aplicaciones:

- Si `getApplicationEnabledSetting(packageName) == 2`, se llama a `setApplicationEnabledSetting(packageName, 0, 0)` para reactivar el paquete.
- Una ruta de `IOException` asigna `BRItem.error = 1`.
- Se realiza limpieza de archivos temporales y sincronización/espera relacionada con transferencias.
- Para WeChat y QQ se usa `unpackBakSdDatas()`.

**Clasificación limitada:** estos puntos se recuperan de un resumen previo del análisis, no de un bloque Smali literal reproducido en esta evidencia. No se afirma que cada efecto se ejecute en todas las ramas ni se infieren condiciones adicionales, manejo de excepciones, integridad de datos o éxito de restauración.

## 3. Reconciliación con evidencia existente — sin duplicación

- Evidencia 50 ya conserva la referencia de `restoreStreamSplitApk` en BRService.smali:13035, el caller reportado en BRService$5.smali:1899, las referencias a `prepareRestoringItems`, `PerformAdbRestoreTask`, `BRManager.restorePackage` y el estado incompleto de sus cuerpos.
- Evidencia 58 conserva el mapa de llamadas en `BRService$5.run()`: `restoreStreamSplitApk` alrededor de 1899, executor 1951/1964, construcción de `PerformAdbRestoreTask` 1996 y `BRManager.restorePackage()` 2079.
- Evidencia 48 conserva el lifecycle general de `BRService$5.run()` y resultados locales de preparación/cierre.
- Esta evidencia no vuelve a documentar esos mapas. Añade solo la referencia histórica a 1683 y los efectos post-despacho recuperados.
- Los cuerpos completos de `restoreStreamSplitApk`, `prepareRestoringItems`, `PerformAdbRestoreTask` y `BRManager.restorePackage` continúan sin estar preservados en el expediente.

## 4. Siguiente delta concreto

1. Recuperar del historial el mensaje exacto que contiene la salida de `BRService$5.smali` 1653–1738, sin volver a extraerlo si sigue disponible.
2. Comparar el contexto y descriptor del invoke en 1683 con el reportado en 1899; comprobar si son dos call sites o dos versiones.
3. Si el cuerpo literal está disponible, registrar solo las instrucciones que prueben reactivación del paquete, asignación de error, limpieza temporal, sincronización y llamada a `unpackBakSdDatas()`.
4. No inferir el contenido de los métodos internos desde el caller: los cuerpos de `restoreStreamSplitApk`, `prepareRestoringItems`, `PerformAdbRestoreTask` y `BRManager.restorePackage` siguen siendo unidades separadas.
5. Mantener la investigación estática y no ejecutar restore, tareas ADB, servicios ni operaciones sobre paquetes destino.

**Resultado:** se preserva un delta histórico de los efectos posteriores al despacho de aplicaciones y una discrepancia de coordenadas 1683/1899 que debe resolverse con procedencia/hash. Los detalles de efectos permanecen como resumen de conversación, no fuente primaria literal.
