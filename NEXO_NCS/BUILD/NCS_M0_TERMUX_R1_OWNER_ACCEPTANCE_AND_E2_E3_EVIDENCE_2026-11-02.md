## DELTA — PUBLICACIÓN RESTRINGIDA REAL Y VERIFICACIÓN POST-ESCRITURA (2026-11-02)

Este delta actualiza el estado de E4 con evidencia del destino real. No eleva E2/E3 ni altera los gates de autoridad.

### Autorización y operación
- El propietario autorizó una única inicialización vacía en `$HOME/.nexo-continuity.json`; la autorización no incluye commissioning, ROOT_READY, autoridad constitucional ni efectos protegidos.
- Sesión Termux reabierta manualmente; checkout local en rama `ncs-lumina-decoupling-2026-10-29`, HEAD observado `d6b657c81fae518fef214c727b9130ca0a40cac8`, árbol limpio antes de ejecutar.
- Launcher ejecutado con raíz explícita `$HOME` y ruta relativa `.nexo-continuity.json`.
- Presentó raíz canónica `/data/data/com.termux/files/home`, destino efectivo `/data/data/com.termux/files/home/.nexo-continuity.json`, snapshot vacío, ventana `2026-11-02T23:25:28.960Z`–`2026-11-02T23:30:28.968Z`, SHA-256 de operación `2a9114a056eaa483d72dc08243c29f7e7d85b8b8fe194a60c77fda8e81a6d7e9`.
- Confirmación exacta del propietario: `PUBLICAR 2a9114a056eaa483d72dc08243c29f7e7d85b8b8fe194a60c77fda8e81a6d7e9`.
- Resultado exacto resumido: `status=committed`, `storeRevision=0`, destino correcto, snapshot operacional v1 vacío, `authorization=NOT_EVALUATED`, `continuation=STOPPED`.

### Verificación independiente post-escritura
- En un proceso Node separado y después de terminar el launcher, `lstat`, `realpath` y `readFile` confirmaron:
  - Ruta y ruta real: `/data/data/com.termux/files/home/.nexo-continuity.json`.
  - Archivo regular: true; symlink: false.
  - UID propietario coincide con UID del proceso Termux.
  - Permisos: `0600`.
  - Tamaño: 283 bytes.
  - SHA-256 del archivo: `3a1d5f25f00c7ba0e030fe8b99dda074b48f9b7950bd80d8a86f46de36236a81`.
- JSON completo observado:
  - Envelope raíz: `schema=NEXO_CONTINUITY_STORE`, `schemaVersion=1`, `storeRevision=0`.
  - `snapshot.schema=NEXO_OPERATIONAL_CONTINUITY`, `snapshot.schemaVersion=1`.
  - `snapshot.missions`, `attempts`, `doNotRepeat`, `executions`, `effectJournal`: todos arrays vacíos.
- La primera comprobación de claves/arrays fue mal aplicada porque esperaba el snapshot en la raíz. La estructura real está anidada bajo `snapshot`; el JSON completo confirma el envelope esperado y reconcilia la salida de commit. No se modificó el archivo durante la inspección.

### Evaluación
| Área | Estado | Alcance |
|---|---|---|
| RE-01 | IMPLEMENTED / CI-VERIFIED / EXERCISED IN TERMUX | Launcher dedicado ejecutado en sesión interactiva foreground |
| RE-02 | IMPLEMENTED / CI-VERIFIED / REAL DESTINATION USED | Raíz canónica y destino efectivo presentados y luego utilizados |
| Primera publicación restringida | COMPLETED | Solo inicialización vacía de una instancia local |
| E4 | REAL-DESTINATION POST-WRITE OBJECT CHECK VERIFIED | Ruta, tipo, UID, modo, tamaño, hash y estructura del objeto real verificados |
| E2 | PARTIAL / NOT CLOSED | No se demuestra exclusión sostenida de escritores fuera de la ventana observada |
| E3 | PARTIAL / NOT CLOSED | No se demuestra prevención universal/sostenida de relanzamiento; se conserva el límite R1 aceptado |

Límites: la lectura posterior demuestra que el objeto puede leerse desde un proceso independiente después del commit. No demuestra durabilidad frente a pérdida abrupta de energía, atomicidad frente a lectores no cooperativos, exclusión de escritores no cooperativos ni seguridad frente a procesos maliciosos con el mismo UID.

Gates: `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; `ROOT_READY` no establecido; commissioning STOP; efectos protegidos STOP; continuidad runtime STOPPED. NCS M0 INCOMPLETO. No repetir bootstrap ni inventario genérico sin cambio o contradicción concreta.

---

## DELTA — RE-01/RE-02 Y EJERCICIO DEL LAUNCHER EN TERMUX (2026-11-02)

Este delta actualiza la evaluación de la sección 3 y la continuación de la sección 5. La evidencia R1/E2/E3 anterior se conserva; no se reinterpreta como cierre operacional.

- RE-01: **IMPLEMENTED / EXERCISED**. El launcher dedicado `scripts/nexo-continuity-bootstrap.mjs` se ejecutó manualmente desde Termux en una sesión interactiva foreground con TTY.
- RE-02: **IMPLEMENTED / EXERCISED IN TEMPORARY SCOPE**. La ejecución recibió raíz temporal explícita, canonicalizó la raíz y presentó el destino efectivo derivado de `continuity.json` antes de solicitar confirmación.
- El propietario respondió `CANCELAR`; el launcher devolvió `NEXO_CONTINUITY_BOOTSTRAP_CONFIRMATION_NOT_MATCHED`, `writeAttempted: false`; la comprobación posterior confirmó que el archivo no existía.
- La suite focalizada pasó y `npm test` recorrió la cadena completa en HEAD `112c54e34bf7c0b15c3d8565f2bb628cf07498ec`, Termux / Node.js v26.4.0. La salida llegó al último test sin error; el exit code no se capturó independientemente.
- Esta evidencia confirma la disponibilidad y el uso del entrypoint en Termux y la vinculación de una raíz temporal con su destino. No fija el destino productivo, no demuestra exclusión sostenida de actores ni cierra la ventana R1.

| Área | Estado actualizado | Límite |
|---|---|---|
| R1 / criterio de aceptación E2-E3 | ACCEPTED BY OWNER | La aceptación normativa no prueba la operación concreta |
| RE-01 | IMPLEMENTED / EXERCISED | Launcher manual/TTY probado con cancelación |
| RE-02 | IMPLEMENTED / EXERCISED IN TEMPORARY SCOPE | Destino temporal presentado; destino productivo pendiente |
| E2 | PARTIAL / NOT CLOSED | No hay evidencia de control sostenido de actores para la ventana/destino productivos |
| E3 | PARTIAL / NOT CLOSED | Se probó el launcher; no se ha demostrado exclusión/control sostenido de otros disparadores relevantes |
| E4 | NOT READY | Destino productivo no seleccionado/verificado |

Gates sin cambio: raíz legítima PENDING/UNKNOWN; `authorization: NOT_EVALUATED`; primera publicación real STOP; commissioning STOP; efectos protegidos STOP; NCS M0 INCOMPLETO. No repetir inventarios genéricos ni pruebas ya ejecutadas sin cambio o contradicción concreta.

---

# NCS M0 — ratificación R1 y evidencia operacional delimitada E2/E3

Fecha: 2026-11-02
Rama: `ncs-lumina-decoupling-2026-10-29`
Base documental observada: `40276ca24e5f6d0749d582ae79cd8693253f3a38`
PR #110: OPEN / DRAFT / NOT MERGED

## 1. Decisión del propietario — R1 ACCEPTED

El propietario confirmó expresamente:

- Único lanzador autorizado durante la ventana: el propietario, desde una sesión interactiva de Termux iniciada manualmente.
- Ninguna otra sesión ni proceso está autorizado para escribir en Continuity durante esa ventana.
- La detección de un escritor o lanzador relevante no controlado activa STOP.
- La ventana comienza con la comprobación previa y termina cuando la operación concluye y su resultado ha sido verificado.
- Un reinicio, actualización o cambio relevante del entorno invalida la evidencia y obliga a reevaluarla.

Límite R1 ratificado:
- Fuera de la garantía quedan OS comprometido/root o privilegios equivalentes, y procesos maliciosos que compartan el UID/dominio de confianza de Termux.
- Los actores legítimos relevantes conocidos deben identificarse y controlarse durante la ventana.
- Un actor legítimo conocido no controlado, o un actor relevante desconocido que sea detectado, activa STOP.
- No se exige demostrar la inexistencia universal de actores fuera del ámbito observable. La imposibilidad de probar ese negativo universal no constituye por sí sola STOP; sí lo constituye detectar un actor relevante no controlado.

Criterio normativo E2/E3 aceptado:
> NCS M0 acepta una garantía operacional delimitada bajo R1: control de actores legítimos conocidos durante una ventana definida, cobertura de mecanismos relevantes del entorno de ejecución y declaración explícita de riesgos residuales UNKNOWN. No exige exclusión universal de escritores ni inventario exhaustivo de mecanismos Android. La detección de un actor relevante no controlado activa STOP. Esta garantía no autoriza efectos protegidos irreversibles ni sustituye las condiciones de autoridad y bootstrap.

La aceptación ratifica el límite de amenaza y el criterio de evaluación. No declara que el entorno actual haya pasado E2/E3, no selecciona la ruta efectiva ni crea un launcher M0, y no autoriza bootstrap, primera publicación, commissioning o efectos protegidos.

## 2. Evidencia POCO/Termux recibida el 2026-11-02

### Identidad y almacenamiento privado
- `id`: UID/GID `10378` (`u0_a378`); contexto SELinux observado `u:r:untrusted_app_27:s0:c122,c257,c512,c768`.
- `HOME=/data/data/com.termux/files/home`; `PREFIX=/data/data/com.termux/files/usr`.
- `readlink -f` devolvió las mismas rutas para HOME y PREFIX.
- HOME y PREFIX observados con permisos `0700`.
- Modelo reportado por `getprop`: `2412DPC0AG`, Android 16, API 36.
- Esto aporta evidencia de almacenamiento privado Termux; no identifica ni verifica la ruta real de Continuity.

### Procesos y sesiones
- La consulta filtrada por `node|nexo|termux` no mostró coincidencias; la alternativa visible mostró la shell Bash actual (PID 18954).
- `jobs -l` no mostró trabajos del shell actual.
- No se observó proceso `node` o `nexo` en esa captura.
- Es una instantánea con visibilidad limitada, no inventario global Android ni prueba de ausencia sostenida o prevención de relanzamiento.

### Launchers, planificador y servicios
- Los perfiles revisados (`~/.bashrc`, `~/.bash_profile`, `~/.profile`, `~/.zshrc`, `$PREFIX/etc/profile`) no mostraron referencias a Nexo, Continuity, `--root`, `--continuity`, `--chronicle` o `npm run`; solo existía el perfil global indicado.
- `~/.termux/boot` no existe. `~/.termux` contiene únicamente `termux.properties`.
- `termux-job-scheduler` y `termux-wake-lock` están disponibles en PATH. `termux-job-scheduler --pending` devolvió `No jobs found`.
- `termux-services` y `sv` no están disponibles en PATH.
- `$PREFIX/var/service` contiene definiciones `ssh-agent` y `sshd`, cada una con `run`, `log` y archivo `down`. Sin supervisor/herramienta de consulta disponible no se afirma su estado efectivo; la presencia de esos directorios no demuestra que estén activos.
- `type -a nexo` no devolvió ejecutable `nexo` en PATH. `package.json` no define script `nexo`; esto no excluye invocaciones directas mediante Node.
- `pm list packages | grep -Ei 'termux|tasker'` no devolvió coincidencias. Como los errores de `pm` se redirigieron y la consulta no garantiza visibilidad completa, la clasificación es “sin coincidencias detectadas”, no “complementos ausentes”.

No se instaló, activó, desactivó ni configuró ningún componente. No se detuvo ningún proceso/servicio ni se programó/canceló ningún job.

## 3. Evaluación

| Área | Estado | Fundamento |
|---|---|---|
| R1 / criterio de aceptación E2-E3 | ACCEPTED BY OWNER | Declaración expresa del propietario |
| E2 — control operacional de escritura | PARTIAL / NOT CLOSED | Roster declarado y captura puntual sin Node/Nexo; falta vincular ruta efectiva y control aplicable a una ventana real |
| E3 — control operacional de lanzamiento | PARTIAL / NOT CLOSED | Sin boot directory, sin jobs pendientes, perfiles revisados sin referencias y sin launcher Nexo en PATH; scheduler disponible y cobertura Android/add-ons limitada |
| E4 | NOT READY | Ruta y propiedades del destino efectivo no seleccionadas/verificadas |
| RE-01 | UNKNOWN | No existe launcher/entrypoint dedicado de bootstrap M0 identificado |
| RE-02 | UNKNOWN | No existe raíz/ruta efectiva vinculada a una invocación concreta |
| P01-G | PENDING / UNKNOWN | Objeto, destino efectivo, estado previo y condiciones de primera escritura siguen sin cerrarse |

La aprobación normativa no transforma evidencia parcial en PASS. No declarar E2/E3 cerrados ni entorno admisible.

## 4. Estado global y prohibiciones

- NCS M0: INCOMPLETO.
- Raíz legítima: PENDING / UNKNOWN.
- `authorization: NOT_EVALUATED`; `ROOT_READY` no habilitado.
- Primera creación/publicación de Continuity: STOP.
- Commissioning: STOP.
- Efectos protegidos: STOP.
- No se ejecutó bootstrap, no se creó/publicó Continuity real y no se ejecutaron efectos protegidos.
- No hubo cambios de runtime, tests, workflows, CI ni configuración del dispositivo. Esta actualización es documental.

## 5. Continuación sin repetir auditorías

1. Reutilizar esta evidencia; no repetir el censo genérico de procesos, perfiles, jobs o callers salvo cambio del entorno o contradicción concreta.
2. Mantener E2/E3 como PARTIAL hasta vincular actores, ruta e invocación reales a una ventana delimitada y evaluar cobertura de mecanismos relevantes.
3. Continuar con P01-G y RE-01/RE-02 sobre contratos y artefactos existentes: definir qué invocación dedicada M0 podría identificarse y cómo se vincularía a raíz/destino efectivo. No improvisar ni ejecutar un launcher.
4. Mantener E4 NOT READY y todos los gates de autoridad/publicación/efectos en STOP mientras sus precondiciones sigan pendientes.
5. Cualquier cambio del entorno, reinicio o actualización invalida esta evidencia operacional y requiere reevaluación focalizada.
 
---

## DELTA — DESTINO RATIFICADO Y PREFLIGHT REAL CANCELADO (2026-11-02)

Esta delta supersede las filas históricas que indicaban destino productivo no seleccionado, RE-01/RE-02 UNKNOWN o ausencia de ejercicio del launcher. No convierte la sesión cancelada en ventana de publicación.

### Evidencia nueva vinculada a la instancia
- Destino ratificado por el propietario: `$HOME/.nexo-continuity.json`.
- El propietario ejecutó el launcher dedicado en Termux con raíz explícita `$HOME` y ruta relativa `.nexo-continuity.json`.
- El launcher presentó raíz canónica `/data/data/com.termux/files/home` y destino efectivo `/data/data/com.termux/files/home/.nexo-continuity.json`.
- Snapshot presentado: NEXO_CONTINUITY v1 vacío.
- Ventana presentada: `2026-11-02T22:59:14.486Z`–`2026-11-02T23:04:14.494Z`.
- SHA-256 de operación: `b8a44d37b957d6e8b91c38df81dcf288dfaf839bbd582e735ff1110452f0d941`.
- Entrada del propietario: `CANCELAR`.
- Respuesta: `{"status":"blocked","code":"NEXO_CONTINUITY_BOOTSTRAP_CONFIRMATION_NOT_MATCHED","writeAttempted":false}`.

### Evaluación reconciliada
| Área | Estado vigente | Alcance |
|---|---|---|
| R1 | ACCEPTED BY OWNER | Límite de amenaza y criterio normativo aceptados; no equivale a evidencia de ventana |
| RE-01 | IMPLEMENTED / CI-VERIFIED / EXERCISED IN TERMUX | Launcher dedicado ejecutado manualmente en foreground/TTY y cancelado |
| RE-02 | IMPLEMENTED / CI-VERIFIED / REAL-DESTINATION PREFLIGHT EXERCISED | Raíz y destino efectivos del candidato productivo presentados; no se intentó escribir |
| E2 | PARTIAL / NOT CLOSED | La captura puntual y la cancelación no prueban control de escritores durante una ventana de publicación |
| E3 | PARTIAL / NOT CLOSED | Entry point manual ejercitado; inventario y control de relanzamiento solo acreditados en snapshots delimitados |
| E4 | PARTIAL / NOT CLOSED — DESTINATION PREFLIGHT | HOME privado y destino canónico observados; faltan propiedades post-inicialización y verificación independiente del objeto persistido |

### Límites probatorios
- La respuesta `writeAttempted:false` confirma que esta ejecución fue bloqueada antes de intentar escribir.
- No hubo publicación, no se creó ni se leyó el archivo productivo y no se obtuvo evidencia de estado post-publicación.
- La ejecución cancelada no inicia una ventana R1 de publicación ni demuestra que actores conocidos permanecerían controlados durante ella.
- E2/E3 no se pueden elevar a PASS a partir de una fotografía de procesos o de la mera disponibilidad del launcher.
- E4 queda como preflight del destino real, no como validación de durabilidad, permisos del archivo creado ni recuperación.
- No repetir el inventario genérico ni el launcher. Cualquier nueva evidencia debe responder a un gap concreto o formar parte de una futura operación autorizada.

Gates: `authorization: NOT_EVALUATED`; raíz constitucional PENDING/UNKNOWN; primera publicación, commissioning y efectos protegidos STOP; NCS M0 INCOMPLETO; PR #110 OPEN / DRAFT / NOT MERGED.
