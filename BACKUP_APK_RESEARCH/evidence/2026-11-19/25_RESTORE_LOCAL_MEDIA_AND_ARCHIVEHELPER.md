# Evidencia 25 — restoreLocalMediaFile() y ArchiveHelper.unzipFiles()

**Fecha:** 2026-11-19  
**Estado:** PARCIAL / PROVISIONAL — recepción de la extracción terminada; cierre analítico pendiente.  
**Tipo de trabajo:** análisis estático de Smali. No implica ejecución de Backup/Restore, modificación del APK ni pruebas dinámicas.

## 1. Procedencia y nivel probatorio

Este registro separa:
- **BLOQUE COMPARTIDO EN CHAT:** detalles de `restoreLocalMediaFile()` y el hash de `ArchiveHelper.smali` comunicados mediante extracción de Termux en la conversación.
- **CONTEXTO RECUPERADO:** síntesis de la extracción completa de `ArchiveHelper.unzipFiles()` y de sus call sites; conservar como hallazgo recuperado hasta cotejar nuevamente los bloques completos.
- **PENDIENTE:** cierre analítico y reconciliación del material recibido; el usuario confirmó que el último bloque compartido es el final de su extracción.

No elevar este registro a LOCAL-VERIFIED: esta sesión no tiene acceso directo al filesystem Termux.

## 2. `BRService.restoreLocalMediaFile()` — flujo provisional

Datos comunicados:
1. Construye el nombre `backup_<suffix>.zip`.
2. Obtiene `suffix` mediante `Utils.getZipSuffixType(packageName, type)`.
3. Usa `mCurrentBackupRootPath` como raíz.
4. Si el ZIP no existe y `p3 == null`:
   - `BRItem.state = 3`.
   - `BRItem.error = 7`.
   - notifica error y finalización;
   - retorna.
5. Si existe el archivo o recibe un `InputStream`:
   - establece `BRItem.state = 8`;
   - invoca `ArchiveHelper.unzipFiles()`.
6. Después de la invocación:
   - `state = 9` si `mIsAborted`;
   - `state = 1` en caso contrario.

**Límite:** el usuario confirmó que el bloque compartido es el final de su extracción de este método. El análisis debe limitarse al material efectivamente recibido; no inferir lógica no incluida, tratamiento de excepciones, limpieza, notificaciones adicionales ni retornos posteriores.

## 3. `ArchiveHelper.unzipFiles()` — hallazgos recuperados

**Archivo:** `ArchiveHelper.smali`  
**SHA-256 comunicado:** `fc0e3c930246162176b7eab6415a55629555360688fb8326b28a5bcb2f19285c`

Síntesis de la extracción compartida:
- Usa `p5` como `InputStream` cuando no es null; de lo contrario abre `FileInputStream(p0)`.
- Extrae las entradas ZIP escribiendo primero a un archivo temporal con sufijo `.tmp`.
- Intenta renombrar el temporal al destino.
- Si el rename no prospera, utiliza `Utils.copyFile` como alternativa.
- Si el destino final sigue sin existir, registra el fallo y asigna `BRItem.error = 1`.

**Distinción importante:** el `error=1` atribuido al helper no debe confundirse con el `error=7` del caller cuando falta el ZIP y `p3 == null). Son condiciones y niveles distintos del flujo.

## 4. Call sites identificados hasta ahora

| Archivo / ubicación | Forma identificada | Estado |
|---|---|---|
| `ArchiveHelper.smali:1994` | overload de 4 argumentos que delega al overload de 7 argumentos | Recuperado de conversación |
| `BRService.smali:12918` | llamada al overload completo desde la ruta de `restoreLocalMediaFile()`; intervienen `PREF_BASE_PATH`, listener, `BRItem`, boolean, `InputStream` y `restoredImageVideoFile` | Recuperado de conversación |
| `BRService$UnpackThread.smali:81` | caller separado del overload de 4 argumentos | Recuperado de conversación |

Este inventario contiene los call sites identificados en el material recuperado; no certifica exhaustividad global.

## 5. Reconciliación analítica del caller, helper y UI

Esta sección deriva consecuencias limitadas de los hallazgos conservados en §§2–4 y de la evidencia 15. No convierte resúmenes históricos en lectura local actual.

### 5.1 `state` final no equivale a éxito de extracción

- El caller registra `state=8` antes de invocar el helper.
- El helper puede registrar `BRItem.error=1` cuando el archivo de destino final no aparece después de la ruta temporal, `rename` y fallback de copia.
- Al volver de la invocación, el caller registra `state=9` si `mIsAborted`; de lo contrario, `state=1`.
- En el resumen del caller no aparece una condición que compruebe `BRItem.error==0` antes de asignar `state=1`.

**Consecuencia condicional:** si el helper asignó `error=1` al mismo `BRItem` y no hubo otra escritura que lo limpiara, el caller puede dejar el par `state=1,error=1`. La extracción disponible no demuestra una limpieza intermedia del error.

### 5.2 Posible divergencia entre resultado interno y conteo de UI

La evidencia 15 conserva que `ProgressItemAdapter.getSuccessfulCount()` cuenta `state=1` y `state=6`, mientras que `getFailedCount()` deriva el total menos los exitosos. Por ello, **si el `BRItem` de esta ruta llega a ese adapter sin normalización adicional**, un elemento con `state=1,error=1` podría entrar en el conteo de éxito aunque el helper haya registrado un fallo de destino.

Esto es una consecuencia del cruce entre dos resúmenes de conversación, no una observación local actual del recorrido completo desde `restoreLocalMediaFile()` hasta el adapter. Se clasifica como **RIESGO DE INCONSISTENCIA / REQUIERE COTEJO**, no como bug demostrado.

### 5.3 Reconciliación con la finalización global: state 9 puede ser transitorio

La evidencia 12 conserva que `setState(IIII)` escribe `BRItem.state=3` y `BRItem.error=9` sobre los elementos de `mBRItems` cuando `mWorkingStage` (`p2`) es 10 o 12, o cuando la acción de interrupción (`p3`) es 2. La evidencia 07 sitúa la llamada de finalización del hilo de restauración antes de `handleTaskFinish`: la ruta abortada usa stage 10; la ruta normal usa stage 11; las rutas de error final usan stage 12.

**Consecuencia:** si el `BRItem` modificado por `restoreLocalMediaFile()` pertenece a `mBRItems` y alcanza esa llamada final, la asignación local `state=9` de la ruta abortada puede ser reemplazada por `state=3,error=9` en stage 10. Por eso, el supuesto desajuste directo `state=9` frente a `ProgressItemAdapter.initData()` no debe presentarse como bug probable sin seguir el orden y la identidad del objeto. Se rebaja a **ESTADO INTERMEDIO POSIBLE; NORMALIZACIÓN GLOBAL RECUPERADA; ALCANCE POR COTEJAR**.

En stage 12 ocurre la misma normalización global de los elementos. En la ruta normal stage 11, la condición descrita no activa esa escritura masiva por stage; por tanto, no se puede asumir que el posible par `state=1,error=1` sea corregido por `setState` en el camino normal.

No confundir `BRItem.state=9` con `BRItem.error=9`: son campos distintos. La normalización de stage 10/12 escribe explícitamente `state=3,error=9`.

### 5.4 El criterio de existencia no acredita integridad

La condición recuperada del helper asigna `error=1` si el destino final no existe. El material disponible no demuestra que la ruta de éxito verifique además tamaño esperado, número de entradas, CRC, lectura completa o integridad semántica de los archivos extraídos. Por tanto:
- ausencia del destino final es un fallo detectado;
- presencia del destino final no debe elevarse automáticamente a integridad verificada;
- no afirmar que el helper carece de validaciones adicionales hasta cotejar el método completo.

### 5.5 Separación de códigos

- `error=7`: asignación directa del caller en la rama sin ZIP y sin `InputStream`.
- `error=1`: fallo de destino atribuido al helper.
- Los códigos de entrada `p3` del listener y sus traducciones a `BRItem.error` son otro nivel; no inferir equivalencias por compartir números.

### 5.6 Límites que permanecen abiertos

1. Confirmar en el bloque Smali completo que el caller no limpia `BRItem.error` ni consulta el resultado del helper después del invoke.
2. Confirmar que helper y caller operan sobre la misma instancia de `BRItem` en todos los caminos.
3. Cotejar el recorrido de ese elemento hasta `ProgressItemAdapter` y comprobar si algún paso intermedio normaliza estado/error.
4. Leer el helper completo para establecer qué valida además de la existencia del destino.
5. Confirmar que el `BRItem` de la ruta local está contenido en `mBRItems` y observar el orden exacto de la llamada final `setState` respecto de las actualizaciones de UI.
6. Mantener como UNKNOWN las excepciones, salidas y limpieza no contenidas en el bloque final compartido.
## 6. Cuestiones abiertas

1. Precisar la cobertura exacta del bloque final ya recibido; no esperar una continuación adicional.
2. Cotejar el bloque completo de `ArchiveHelper.unzipFiles()` y sus overloads contra los archivos locales y registrar hashes.
3. Recuperar las firmas exactas y todos los argumentos de cada call site.
4. Confirmar la posible coexistencia `state=1,error=1`, la identidad del `BRItem` y la propagación hacia el adapter, sin colapsar `BRItem.state`, `BRItem.error` y los códigos de listener.
5. No concluir todavía si los estados 8/9/1 cubren todas las salidas del método.

## 7. Estado de recepción y siguiente paso

- **Recepción de la extracción:** TERMINADA en el último bloque compartido por el usuario.
- **Continuación adicional:** NO ESPERADA para este método en el material de esta fase; el usuario confirmó que ahí termina su extracción.
- **Cierre analítico:** PENDIENTE; reconciliar los bloques recibidos y separar con precisión el final de la extracción de los límites del material disponible.
- No iniciar nuevas extracciones ni operaciones de restauración sin solicitud expresa.
