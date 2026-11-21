# Evidencia 72 — Delta histórico del despacho de restauración de aplicaciones en BRService$5

- Fecha de consolidación: 2026-11-21
- Rama: `backup-apk-static-research-2026-11-19`
- Alcance: preservar detalles adicionales recuperados sobre el bloque de despacho de aplicaciones y sus efectos posteriores.
- Procedencia: conversación del usuario del 17-11-2026 y resúmenes de análisis recuperados de esa conversación.
- Clasificación corregida por evidencia 74: el rango 1653–1738 y el invoke en 1683 son referencias de síntesis histórica no recuperadas como bloque literal en la búsqueda dirigida; no elevar a `USER-PASTED-SOURCE`. La referencia 1899 procede de grep/resumen y su sistema de coordenadas no está resuelto. Los efectos post-despacho siguen como `RECOVERED-CHAT / PRIOR-ASSISTANT-SUMMARY`.
- No LOCAL-VERIFIED; no ejecución dinámica.

## 1. Ancla de extracción y coordenada discrepante

La síntesis histórica consultada asocia el rango físico 1653–1738 con una llamada a:

```
restoreStreamSplitApk(BRItem, ZipFile, InputStream)
```

con call site atribuido alrededor de 1683. Sin embargo, la búsqueda dirigida del historial no recuperó el bloque literal 1653–1738 ni el `invoke` correspondiente. Mantener 1683 como referencia histórica no verificada, no como call site confirmado.

Las evidencias 50 y 58 conservan una referencia histórica de grep a `BRService$5.smali:1899`, pero no un `invoke` literal que confirme esa coordenada como línea física. El historial sí conserva otro fragmento literal en líneas físicas 3445–3468 donde `.line 1898` y `.line 1899` acompañan escrituras de estado y `progType`; esas directivas no son una llamada a `restoreStreamSplitApk`. No afirmar dos call sites, dos builds ni una discrepancia resuelta. Véase evidencia 74 para la separación de coordenadas físicas y directivas `.line`.

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


**Erratum de procedencia:** la evidencia 74 corrige la fuerza probatoria de las referencias 1683/1899. No se recuperó el supuesto bloque literal 1653–1738; 1683 permanece como atribución de síntesis histórica y 1899 como referencia grep con coordenada no resuelta.
