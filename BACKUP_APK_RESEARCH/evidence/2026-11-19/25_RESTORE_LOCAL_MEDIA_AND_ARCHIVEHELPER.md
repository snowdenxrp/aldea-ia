# Evidencia 25 — restoreLocalMediaFile() y ArchiveHelper.unzipFiles()

**Fecha:** 2026-11-19  
**Estado:** PARCIAL / PROVISIONAL — extracción compartida en conversación; cierre del método caller pendiente.  
**Tipo de trabajo:** análisis estático de Smali. No implica ejecución de Backup/Restore, modificación del APK ni pruebas dinámicas.

## 1. Procedencia y nivel probatorio

Este registro separa:
- **BLOQUE COMPARTIDO EN CHAT:** detalles de `restoreLocalMediaFile()` y el hash de `ArchiveHelper.smali` comunicados mediante extracción de Termux en la conversación.
- **CONTEXTO RECUPERADO:** síntesis de la extracción completa de `ArchiveHelper.unzipFiles()` y de sus call sites; conservar como hallazgo recuperado hasta cotejar nuevamente los bloques completos.
- **PENDIENTE:** continuación de `restoreLocalMediaFile()` después de la línea 3163 y cierre del método.

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

**Límite:** la extracción compartida disponible llega hasta el entorno de la línea 3163. La lógica posterior y el cierre completo del método permanecen pendientes. No inferir el tratamiento de excepciones, limpieza, notificaciones adicionales ni retornos posteriores.

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

## 5. Cuestiones abiertas

1. Recibir la continuación desde la línea 3163 hasta el cierre de `restoreLocalMediaFile()`.
2. Cotejar el bloque completo de `ArchiveHelper.unzipFiles()` y sus overloads contra los archivos locales y registrar hashes.
3. Recuperar las firmas exactas y todos los argumentos de cada call site.
4. Determinar cómo el helper comunica el fallo al caller y cómo se propagan los estados/errores, sin colapsar `BRItem.state`, `BRItem.error` y los códigos de listener.
5. No concluir todavía si los estados 8/9/1 cubren todas las salidas del método.

## 6. Siguiente paso autorizado por el estado actual

Esperar la continuación que comparta el usuario. No iniciar nuevas extracciones, no ejecutar servicios ni operaciones de restauración, y no cerrar el análisis hasta recibir y cotejar el resto del método.
