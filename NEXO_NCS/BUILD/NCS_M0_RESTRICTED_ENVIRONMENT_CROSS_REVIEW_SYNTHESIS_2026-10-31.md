# NCS M0 — síntesis cruzada del entorno restringido y primera publicación

**Fecha:** 2026-10-31  
**Estado:** RECONCILIACIÓN DOCUMENTAL DE REVISIONES IA — NO RATIFICADA COMO POLÍTICA — NO IMPLEMENTADA — NO EJECUTADA  
**Alcance:** diseño candidato FB-03/E2/E3 y requisitos de publicación FB-04  
**Revisiones:** Gemini, Qwen, Perplexity y DeepSeek (respuestas originales aportadas por el propietario).

## 1. Resultado ejecutivo

Las cuatro revisiones convergen en que el entorno y la publicación son dos problemas distintos: (a) controlar el conjunto de procesos/launchers que pueden acceder al destino durante toda la ventana (FB-03/E2/E3), y (b) hacer que la publicación sea segura frente a estado previo, concurrencia, sustitución de rutas y resultados ambiguos (FB-04).

La aplicación Android dedicada con almacenamiento interno privado continúa como **candidata de diseño**, no como entorno seleccionado ni demostrado. No se ha probado que el POCO ejecute NCS mediante esa aplicación, que el destino efectivo esté definido, que todos los escritores relevantes estén inventariados ni que exista una primitiva de publicación adecuada al filesystem real.

**No hay cierre de FB-03/FB-04 ni autorización de primera publicación.** Se conservan E2/E3 UNKNOWN, FB-03/FB-04 OPEN/UNKNOWN, raíz PENDING/UNKNOWN, `authorization: NOT_EVALUATED`, primera publicación STOP, efectos protegidos STOP y M0 INCOMPLETO.

## 2. Matriz de aportaciones y aplicabilidad

| Revisión | Aporte utilizable | Límite / corrección | Aplicación NCS |
|---|---|---|---|
| Gemini | Aplicación dedicada, almacenamiento privado, control deliberado de permisos/componentes y reducción de TCB | `FileChannel.lock()` es cooperativo; foreground service no garantiza supervivencia; PackageManager y /proc son observaciones parciales y puntuales | Candidatura arquitectónica; no prueba E2/E3 ni exclusividad |
| Qwen | Amenazas de concurrencia, O_EXCL, rename, symlink/TOCTOU, temporales, escrituras parciales y separación de controles | O_EXCL protege la creación del último componente, no las escrituras posteriores ni los padres; rename puede reemplazar; flock es cooperativo; PIPE_BUF no aplica a archivos regulares; checksum no prueba autoridad | Alimenta FB-04 y pruebas negativas; no selecciona primitivas ni autoriza código |
| Perplexity | Fuentes primarias sobre sandbox Android, almacenamiento interno privado, UID por app, límites de FGS y riesgos de Termux/shared storage | El sandbox de una app dedicada no tiene por defecto un UID más fuerte que Termux; no protege frente a root/sistema/kernel ni frente a procesos del mismo UID; el entorno POCO real sigue sin evidencia | Base técnica para comparar candidatos; no selecciona app ni prueba el dispositivo |
| DeepSeek | Crítica estructural a matar procesos, launchers diferidos, reaparición, handles abiertos, TOCTOU y locks voluntarios | Su análisis explícito es de Windows (drivers, WMI, AppContainer, ACL/MIC, minifiltro); no es una evaluación directa de Android ni evidencia del POCO | Se traducen los principios generales a amenazas Android; los mecanismos Windows quedan fuera de alcance |

## 3. Requisitos ambientales FB-03 / E2 / E3

La evidencia debe ser específica de la instalación y destino efectivos, no una inferencia desde el repositorio ni una lista genérica de procesos.

1. Identificar plataforma, identidad/UID, runtime, launcher real, componentes de aplicación, filesystem, raíz y destino efectivos.
2. Identificar procesos, servicios, componentes, tareas y entrypoints que pueden escribir o relanzar escritores durante toda la ventana.
3. Distinguir escritores del mismo UID/app de otras apps ordinarias, servicios del sistema y actores privilegiados; declarar expresamente el límite de amenaza adoptado.
4. Demostrar cómo se impide que procesos fuera del conjunto autorizado accedan al destino o inicien un escritor durante la ventana. Una captura puntual de procesos, cerrar una app, terminar una terminal o un servicio en primer plano no basta.
5. Demostrar que el control se mantiene durante toda la ventana y que su pérdida provoca STOP antes de publicación.
6. Mantener separadas la evidencia E2 (control sostenido de detención/no relanzamiento) y E3 (cadena real launcher → runtime → writers de la instalación).

**Límite de garantía:** no se exige resistencia frente a administrador/root hostil si eso queda fuera del alcance restringido ya aprobado; sí debe declararse. El aislamiento Android ordinario frente a otras apps no prueba control de escritores dentro del mismo UID ni integridad frente a actores privilegiados.

## 4. Requisitos de publicación FB-04

1. **No-replace en el punto de publicación:** un destino preexistente o creado concurrentemente no puede ser reemplazado ni truncado.
2. **Identidad estable:** la validación y mutación deben referirse al mismo objeto efectivo; no basta con validar una ruta y resolverla de nuevo después.
3. **Padres y enlaces:** symlinks, sustitución de directorios/padres y cambios de nombre deben quedar dentro de una garantía demostrable del entorno y de la API elegida.
4. **Handles/descriptores existentes:** determinar si actores fuera del conjunto autorizado podrían conservar acceso de escritura ya abierto.
5. **Temporales:** un temporal preexistente o de propietario/estado desconocido produce STOP; no se limpia automáticamente sin demostrar propiedad y ausencia de escritores activos.
6. **Escrituras completas:** contemplar escrituras parciales, flush/fsync y durabilidad según las garantías reales del filesystem; atomicidad visible, no-replace y durabilidad son propiedades distintas.
7. **Resultado ambiguo:** después de una posible mutación sin confirmación, COMMIT.UNKNOWN/STOP; sin retry automático ni rollback especulativo.
8. **Integridad:** hashes pueden detectar cambios frente a un valor esperado confiable, pero no demuestran legitimidad, autoridad ni ausencia de escrituras concurrentes.

No se selecciona O_EXCL, flock, FileChannel.lock, link, renameat2, openat, O_NOFOLLOW ni otra primitiva. Su disponibilidad y semántica deben comprobarse en el runtime/filesystem real y frente al modelo de amenaza ya delimitado.

## 5. Correcciones técnicas transversales

- Un sandbox limita capacidades de su proceso; no impone por sí mismo exclusividad sobre un directorio compartido frente a otros actores.
- Un lock consultivo/cooperativo coordina participantes que lo respetan; no excluye escritores no cooperativos.
- Un inventario puntual no demuestra que no aparezcan procesos nuevos ni que no existan handles abiertos.
- Atomicidad de rename no equivale a no-replace ni a durabilidad ante pérdida de energía.
- `realpath()`, `lstat()` o validación léxica aisladas no eliminan TOCTOU.
- `write()` puede ser parcial; `PIPE_BUF` es una garantía de pipes/FIFOs, no de archivos regulares.
- Un checksum no demuestra autoridad ni legitimidad del objeto.
- No limpiar temporales desconocidos ni inferir que son obsoletos por antigüedad o nombre.

## 6. Secuencia de trabajo y límites

1. Mantener la aplicación Android dedicada como candidata y comparar sus límites con Termux sin confundir TCB reducido con sandbox más fuerte.
2. Obtener evidencia específica del launcher/runtime y filesystem que realmente se propone usar; no repetir el censo estático ya realizado.
3. Definir el modelo de amenaza y el conjunto autorizado de escritores antes de seleccionar controles.
4. Solo entonces evaluar la API de publicación compatible con el entorno y preparar pruebas negativas específicas para E2/E3/FB-04.
5. Solicitar autorización separada antes de modificar runtime/tests, ejecutar pruebas o CI/Actions.
6. No instalar/configurar software, ejecutar comandos POCO, crear Continuity real ni activar efectos protegidos como parte de esta síntesis.

## 7. Estados preservados

- Aplicación Android dedicada: CANDIDATA; no seleccionada ni instalada.
- Termux + Node.js: candidato previo; no demostrado como launcher real.
- FB-03: OPEN/UNKNOWN; E2/E3: UNKNOWN.
- FB-04: OPEN/UNKNOWN; no-replace/path stability/exclusión de escritores no demostrados.
- FB-05/P-05: NO RATIFICADA.
- Objeto Continuity: U; raíz legítima: PENDING/UNKNOWN.
- `authorization: NOT_EVALUATED`; primera publicación STOP; efectos protegidos STOP.
- **NCS M0 INCOMPLETO.**

**Tipo de cambio:** síntesis documental. No cambia código/runtime, tests, workflows, configuración del dispositivo ni autoridad. No se ejecutaron pruebas, CI/Actions, comandos POCO ni bootstrap real.


## 8. DELTA — SEGUNDA REVISIÓN GEMINI: CONCURRENCIA Y LÍMITES ANDROID (2026-10-31)

**Clasificación:** revisión técnica documental; parcialmente confirmada, con correcciones. No es evidencia del POCO ni autorización de implementación.

### 8.1 Confirmado con límites

- Android asigna normalmente UID por aplicación y aplica sandbox a nivel de kernel; almacenamiento interno es privado por defecto frente a otras aplicaciones ordinarias. Fuentes: [AOSP Application Sandbox](https://source.android.com/docs/security/app-sandbox), [Android security tips — internal storage](https://developer.android.com/privacy-and-security/security-tips).
- Los servicios en primer plano son más difíciles de terminar que procesos en segundo plano, pero no garantizan continuidad absoluta. El diseño debe tolerar muerte y reinicio del proceso. Fuente: [Android process lifecycle](https://developer.android.com/guide/components/activities/process-lifecycle).
- PackageManager aporta datos de paquetes/componentes/firma/UID, pero no es inventario de actividad dinámica ni de descriptores abiertos.
- Una inspección de /proc es puntual y puede estar limitada por permisos/SELinux; no se asumirá que la app ordinaria puede inspeccionar descriptores de otros procesos. La disponibilidad exacta debe verificarse en el dispositivo y dominio SELinux concretos; no se eleva la afirmación de Gemini a una imposibilidad universal sin esa evidencia.
- Procesos/componentes con el mismo UID comparten el límite de acceso al almacenamiento privado. Una Activity y un Service no crean por sí solos una frontera de almacenamiento distinta.

### 8.2 Corrección importante: FileChannel.lock()

La propuesta Gemini dice que FileChannel.lock() coordina hilos de la misma JVM y procesos externos. Debe corregirse:

- La documentación Android especifica que los file locks se mantienen en nombre de toda la JVM y que no son adecuados para controlar acceso entre varios hilos de la misma JVM.
- OverlappingFileLockException es una salvaguarda de la API/JVM para solapamientos locales, no un mecanismo de exclusión global de todos los escritores.
- La semántica nativa depende de la plataforma; la documentación FileLock recomienda tratar los locks como advisory para portabilidad.
- Por tanto, FileChannel.lock() no será considerado control E2 suficiente, ni sustituye un mutex/serializador interno para hilos, ni excluye escritores no cooperativos.

Fuentes: [Android FileChannel](https://developer.android.com/reference/java/nio/channels/FileChannel), [Android FileLock platform dependencies](https://developer.android.com/reference/java/nio/channels/FileLock).

### 8.3 Corrección de la propuesta E2/E3

- **E2:** un registro de unicidad de PID o trazas de serialización de la propia aplicación no demuestra exclusión ambiental. Debe acreditarse el control sobre todos los escritores autorizados durante la ventana, la detección de pérdida del control y el comportamiento STOP. Un mutex de aplicación solo coordina los participantes que pasan por él; un control de versión solo es seguro frente a carreras si la comparación y publicación constituyen una operación atómica real.
- **E3:** firma del paquete, manifiesto, hashes y SBOM/inventario de dependencias pueden acreditar identidad e integridad esperada del artefacto dentro de su alcance. No demuestran por sí solos la totalidad de procesos, entrypoints, código dinámico, dependencias efectivamente cargadas ni escritores reales. El inventario debe vincularse a la instalación, launcher, UID y destino observados.
- Los hashes verificados por el propio proceso no son evidencia independiente frente a compromiso de código dentro del mismo UID. No se presume que el proceso de arranque tenga una raíz de confianza independiente.
- La restricción de /proc obliga a no basar E3 en inspección live de /proc/[pid]/fd; tampoco autoriza sustituir esa evidencia por una afirmación de inventario exhaustivo basada solo en PackageManager.

### 8.4 Corrección de la arquitectura mínima propuesta

La Activity principal + Service acoplado al almacenamiento privado puede ser una forma de empaquetar la aplicación, pero no constituye por sí misma exclusividad: ambos comparten UID y almacenamiento. Deben minimizarse componentes exportados, procesos adicionales, permisos, dependencias y canales IPC; la política exacta queda pendiente de diseño.

El esquema `state.json + journal temporal` no se acepta todavía como reemplazo de FileLock ni como commit atómico. Antes necesita especificar y demostrar:
1. serialización real de todos los escritores autorizados, incluidos hilos/procesos propios;
2. operación atómica de compare-and-publish o single-writer impuesto, no solo lectura de revision seguida de escritura;
3. protocolo WAL completo para orden de escritura, flush/fsync, cortes en cada frontera y recuperación;
4. manejo de temporales desconocidos, escritores que reaparecen y COMMIT.UNKNOWN sin retry automático;
5. pruebas negativas en el filesystem/runtime objetivo.

No se adopta WAL, JSON de estado, journal, hash-on-start ni transacciones idempotentes como solución ya suficiente. Son propuestas que requieren contrato y pruebas.

### 8.5 Efecto sobre gates

- La candidatura Android dedicada queda técnicamente mejor delimitada, pero no seleccionada.
- E2 no pasa: la serialización propuesta no está implementada ni probada.
- E3 permanece UNKNOWN: faltan instalación, launcher, UID, artefacto y escritores reales observados.
- FB-03/FB-04 permanecen OPEN/UNKNOWN; E2/E3 UNKNOWN; E4 NOT READY.
- Raíz PENDING/UNKNOWN; `authorization: NOT_EVALUATED`; primera publicación y efectos protegidos STOP; **M0 INCOMPLETO**.

**Límites:** no cambios de runtime/tests/workflows, no ejecución de pruebas/CI/Actions, no instalación ni comandos POCO, no bootstrap ni efectos protegidos.
