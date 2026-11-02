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
