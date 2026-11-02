**R1: ACCEPTED BY OWNER.** El propietario acepta la frontera de amenaza y la garantía operacional delimitada registradas en [NCS_M0_TERMUX_R1_OWNER_ACCEPTANCE_AND_E2_E3_EVIDENCE_2026-11-02.md](NCS_M0_TERMUX_R1_OWNER_ACCEPTANCE_AND_E2_E3_EVIDENCE_2026-11-02.md).

## DELTA VIGENTE — RE-01/RE-02 IMPLEMENTADOS Y EJERCIDOS EN TERMUX (2026-11-02)

- RE-01: **IMPLEMENTED / EXERCISED**. El launcher M0 dedicado `scripts/nexo-continuity-bootstrap.mjs` se ejecutó manualmente en Termux, en foreground y con TTY.
- RE-02: **IMPLEMENTED / EXERCISED IN TEMPORARY SCOPE**. Se usó una raíz temporal explícita; el preflight presentó la raíz canónica y el destino efectivo antes de la confirmación.
- El propietario respondió `CANCELAR`; resultado `NEXO_CONTINUITY_BOOTSTRAP_CONFIRMATION_NOT_MATCHED`, `writeAttempted: false`; la comprobación confirmó que no se creó el archivo.
- Suite focalizada y `npm test` completo ejecutados en HEAD `112c54e34bf7c0b15c3d8565f2bb628cf07498ec`, Node.js v26.4.0. La salida llegó al último test sin error; exit code no capturado independientemente.
- **No equivale a selección/admisión del destino operativo ni a cierre E2/E3.** E2/E3 permanecen PARTIAL / NOT CLOSED; E4 NOT READY. No se ejecutó bootstrap real ni publicación productiva.

Esta delta supersede las líneas históricas inferiores que aún describen RE-01/RE-02 como UNKNOWN por ausencia de launcher. Los límites de E2/E3, E4 y autoridad siguen vigentes.

---

## DELTA — R1 RATIFICADO POR EL PROPIETARIO; CANDIDATURA DEL ENTORNO SIGUE SIN ADMISIÓN (2026-11-02)

**R1: ACCEPTED BY OWNER.** El propietario acepta la frontera de amenaza y la garantía operacional delimitada registradas en [NCS_M0_TERMUX_R1_OWNER_ACCEPTANCE_AND_E2_E3_EVIDENCE_2026-11-02.md](NCS_M0_TERMUX_R1_OWNER_ACCEPTANCE_AND_E2_E3_EVIDENCE_2026-11-02.md).

Esta aceptación reemplaza las frases históricas de este documento que indican que R1 está pendiente de ratificación. No equivale a seleccionar/admitir Termux como entorno para la primera publicación ni a cerrar E2/E3:
- E2 — control operacional de escritura: PARTIAL / NOT CLOSED.
- E3 — control operacional de lanzamiento: PARTIAL / NOT CLOSED.
- E4: NOT READY.
- RE-01/RE-02: UNKNOWN; no existe launcher M0 dedicado ni raíz/destino efectivo ligado a una invocación.
- La evidencia del dispositivo recibida el 2026-11-02 está consolidada en el delta enlazado arriba. No repetir el inventario genérico ya realizado sin cambio o contradicción concreta.

La garantía R1 excluye OS comprometido/root o privilegios equivalentes y procesos maliciosos con el mismo UID/dominio de confianza Termux; exige control de actores legítimos conocidos durante la ventana, STOP ante actor relevante no controlado detectado y declaración de UNKNOWN residuales. No exige demostrar un negativo universal ni inventariar exhaustivamente Android.

No autoriza bootstrap, primera publicación, commissioning ni efectos protegidos. `authorization: NOT_EVALUATED`; raíz PENDING/UNKNOWN; P01-G PENDING/UNKNOWN; M0 INCOMPLETO.

---

## DELTA DE EVIDENCIA OBSERVADA — TERMUX DISPONIBLE (2026-11-01)

Estado actualizado: Termux está instalado y fue usado para ejecutar las pruebas locales de Nexo desde `~/ncs-m0`. Esto corrige la nota previa que lo trataba como no confirmado. No ratifica el entorno ni autoriza bootstrap.

Evidencia recopilada en sesiones de solo lectura:
- POCO X7 Pro `2412DPC0AG`, Android 16 / HyperOS 3.0.302.0; Verified Boot green y bootloader bloqueado según la información del dispositivo ya observada.
- Termux F-Droid `0.119.0-beta.3`; Node `v26.4.0`, npm `11.19.1`, Git `2.55.0`.
- Termux:API `0.60.0` presente como paquete `com.termux.api`.
- Se ejecutaron en Termux `node tests/nexo/continuity-store.test.mjs` (PASS) y `npm test` completo (PASS) en código SHA `7a7f3ffa56af116a4f7222d22ff7638c9b470f92`.
- `~/.termux/boot` no existía en la inspección; `crontab` no estaba instalado; los perfiles de shell revisados no contenían referencias Nexo/Continuity.
- Una captura de `ps -A` mostró solo shell y `ps`; es una instantánea, no prueba ausencia sostenida.
- `$PREFIX/var/service` contenía directorios `ssh-agent` y `sshd`; su existencia no prueba que estén activos.
- La inspección visual de Ajustes > Aplicaciones no mostró Termux:Boot, Tasker, MacroDroid, Automate ni Shizuku; se observaron Terminal, Termux y Termux:API.
- `pm list packages` no produjo un inventario completo por error de transacción del servicio Android.

### Qué queda UNKNOWN
- E2: no se ha demostrado un control capaz de detener todos los escritores/launchers relevantes e impedir su relanzamiento durante la ventana.
- E3: se conoce Termux/Node y el uso manual de la shell para pruebas, pero no se ha probado el entrypoint de bootstrap M0 ni un inventario exhaustivo de procesos, sesiones, servicios y consumidores con acceso al destino.
- La captura puntual de procesos y la ausencia de algunos launchers visibles no demuestran exclusión sostenida.
- No se ha definido/verificado la ruta real de destino ni sus permisos/aliases. No se creó ningún store real.

### Consecuencia
Termux pasa de `NO CONFIRMADO` a `INSTALADO Y USADO PARA PRUEBAS`; E1 queda observado con mayor precisión. E2/E3 siguen `UNKNOWN`, E4 `NOT READY`. La propuesta continúa como candidata, no ratificada. Primera publicación y efectos protegidos siguen STOP.

---

# NCS M0 — candidato de entorno restringido POCO/Termux

Fecha: 2026-11-01
Estado: RECOMENDACIÓN TÉCNICA; NO CONFIGURADO; NO VERIFICADO; NO AUTORIZA PUBLICACIÓN.

## Propuesta

Evaluar Termux + Node.js con una invocación manual en primer plano como entorno restringido para el POCO X7 Pro. Esta es una recomendación técnica para concretar la decisión previa del propietario de permitir un entorno restringido; no es una selección ratificada ni demuestra E2/E3.

## Límites exigidos

- El destino debe residir en el almacenamiento privado de Termux, nunca en almacenamiento compartido ni en una ruta accesible desde Nexo M1.
- Una sola sesión manual y un único proceso de bootstrap.
- Sin arranque automático, widgets, servicios, jobs, cron, Tasker ni relanzadores.
- Sin otros procesos Termux que puedan escribir en el destino durante la ventana.
- Android Verified Boot debe estar green, bootloader bloqueado y sin root.
- La operación debe usar un entrypoint dedicado y terminar antes de Chronicle, admisión, owner, PREPARED, dispatch o efectos.

## Evidencia requerida

E2 requiere demostrar que se pueden detener todos los escritores relevantes e impedir su relanzamiento durante la ventana. E3 requiere identificar Termux, Node.js, el entrypoint exacto, el SHA del checkout y todos los procesos/servicios con acceso al destino. Una lista de procesos vacía por sí sola no demuestra exclusión.

## Estado

Termux + Node.js: CANDIDATO, no se afirma instalación. E1: POCO X7 Pro/Android identificado. E2/E3: UNKNOWN. E4: NOT READY. Raíz legítima: PENDING/UNKNOWN. authorization: NOT_EVALUATED. Primera publicación y efectos protegidos: STOP. NCS M0: INCOMPLETO.

Este documento no instala software, no ejecuta comandos, no inicializa Continuity y no autoriza commissioning.

---

## DELTA — bootstrap API existe; launcher M0 todavía no existe (2026-11-02)

Inspección estática sobre SHA `5988d9b4c6caa22ec093986a25db80ca842902cc`:

- `src/nexo/core/continuity-service.mjs` exporta `bootstrapNexoContinuityStore(options)`. La API exige `root` absoluto y `relativePath` normalizado, admite solo opciones de lock, deriva `filePath` desde la raíz explícita, rechaza symlinks en la raíz/componentes relativos y devuelve resultado/destino sin crear ni devolver owner operacional.
- `scripts/nexo-continuity.mjs` solo re-exporta `openNexoContinuityOwner` y `bootstrapNexoContinuityStore`; no implementa un comando CLI.
- `scripts/nexo.mjs` no reconoce un subcomando de bootstrap. Su parser expone status, mission status/plan/previews y delegación Chronicle; cualquier comando no soportado se bloquea.
- `package.json` no declara un script de bootstrap M0.
- Por tanto, existe una **API de bootstrap probada con fixtures**, pero no hay una invocación/launcher M0 dedicada que pueda identificarse como operación real del POCO. RE-01 permanece UNKNOWN; RE-02 también permanece UNKNOWN hasta fijar y comprobar raíz/ruta efectivas en una invocación concreta. Esto no se resuelve llamando manualmente a la API desde un script improvisado.

### Recomendación técnica — no ratificada

Mantener Termux + Node.js como candidato de entorno restringido: una invocación manual en primer plano, un solo proceso/sesión controlados, destino bajo el almacenamiento privado de Termux y sin ruta compartida con Nexo M1. No declarar el entorno seleccionado ni admisible todavía.

Antes de implementar/exponer un launcher que pueda crear el archivo, deben quedar cerrados el contrato de primera creación/P01-G y la delimitación exacta del entorno aceptado. La autorización técnica para cambios M0 no equivale a autorización de primera publicación. No crear un CLI que pueda interpretarse como autorización implícita.

### Estado

- API bootstrap: IMPLEMENTED; contratos/fixtures y path/temp negative tests incluidos en LOCAL FULL-SUITE PASS en SHA `5988d9b4...`.
- Launcher/CLI dedicado: NOT IMPLEMENTED.
- Entorno Termux: instalado y usado para pruebas; candidato no ratificado.
- RE-01/RE-02: UNKNOWN; E2/E3: UNKNOWN; E4: NOT READY.
- P01-A = L: DECIDED BY OWNER; P01-G: PENDING/UNKNOWN.
- Raíz PENDING/UNKNOWN; `authorization: NOT_EVALUATED`; primera publicación y efectos protegidos STOP; M0 INCOMPLETO.

No se ejecutó bootstrap ni se creó Continuity real.

---

## DELTA — PROPUESTA DE LÍMITE DE AMENAZA R1 PARA TERMUX (2026-11-02)

**Estado: RECOMENDACIÓN TÉCNICA; NO RATIFICADA POR EL PROPIETARIO; NO EVIDENCIADA END-TO-END.**

La decisión del propietario del 2026-10-27 permite formular la garantía para un entorno restringido, sin prometer exclusión universal frente a cualquier proceso local no cooperativo. No define todavía qué actores se excluyen. Se propone someter a decisión el siguiente límite:

### R1 — frontera propuesta

- **Base confiable:** Android 16/HyperOS no rooteado, bootloader bloqueado y Verified Boot green (evidencia de dispositivo ya registrada); aislamiento de aplicaciones Android y almacenamiento privado de Termux.
- **Destino:** exclusivamente bajo el HOME privado de Termux; no almacenamiento compartido, URI compartido ni ruta accesible desde Nexo M1. La ruta concreta aún no está elegida ni verificada.
- **Proceso incluido:** una única invocación manual del futuro launcher M0 en primer plano, dentro de una única sesión Termux.
- **Procesos que deben quedar excluidos y ser comprobablemente ausentes/detenidos:** otras sesiones/procesos Termux, procesos Termux:API con acceso relevante, Termux:Boot, servicios/daemons, jobs/scheduler, cron, automatizadores y cualquier launcher conocido capaz de iniciar un writer durante la ventana.
- **Actores fuera del modelo de garantía:** sistema operativo comprometido, root/privilegios equivalentes y proceso malicioso que comparta el UID/espacio de confianza de Termux. Cualquier proceso adicional conocido con acceso al destino, o cuyo estado no pueda determinarse, mantiene STOP.
- **Procedimiento candidato:** detener mediante Android Settings > Apps > Force stop los paquetes Termux y los add-ons pertinentes antes de iniciar la ventana; verificar jobs/servicios/launchers; abrir Termux manualmente; ejecutar solo la invocación M0 dedicada cuando exista; no abrir otra sesión ni lanzar otros procesos hasta terminar. La vigencia de la condición debe cubrir toda la ventana, no solo una captura inicial.

### Fundamento externo y cautelas

- Android documenta el Application Sandbox basado en UID único por aplicación y aislamiento de datos; esto respalda limitar acceso entre apps, no excluir procesos que comparten UID ni privilegios root: https://source.android.com/docs/security/app-sandbox
- Android 15 mantiene un paquete en estado stopped hasta acción directa/indirecta del usuario y cancela pending intents al forzar detención; el primer lanzamiento posterior puede volver a registrar callbacks: https://developer.android.com/about/versions/15/behavior-changes-all
- El botón Stop del Task Manager para apps con foreground service mata procesos, pero los jobs y alarms programados siguen ejecutándose; no usarlo como sustituto de Force stop: https://developer.android.com/develop/background-work/services/fgs/handle-user-stopping
- Termux:Boot requiere instalar/iniciar el add-on y scripts en `~/.termux/boot/`; la ausencia observada del directorio no demuestra por sí sola ausencia de todo launcher: https://github.com/termux/termux-boot
- Android permite UID compartido bajo condiciones de firma/configuración; no asumir que cada add-on tiene UID independiente sin comprobarlo.

### Evidencia actual frente a R1

- A favor, parcial: Termux instalado/usado; Node 26.4.0; `~/.termux/boot` no observado; `termux-job-scheduler --pending` informó que no había jobs; `sv/runsv/runsvdir` no instalados; perfiles de shell revisados sin referencias relevantes; captura puntual `ps -A`; Verified Boot green/bootloader bloqueado según registro.
- No satisfecho/UNKNOWN: inventario completo de paquetes/add-ons y UID compartidos; estado efectivo de `ssh-agent`/`sshd` (directorios existen, supervisor no instalado); exclusión de todas las sesiones/procesos con acceso; control de relanzamiento sostenido durante la ventana; ruta privada exacta del destino; launcher M0 inexistente.
- No usar una captura puntual de procesos como prueba suficiente. Si la cobertura del inventario o la capacidad de mantener la ventana es parcial, R1 no pasa.

### Decisión pendiente

El propietario debe aceptar o rechazar explícitamente que la garantía M0 excluya root/OS comprometido y procesos maliciosos con el mismo UID/espacio de confianza de Termux, mientras exige excluir de la ventana todos los demás writers/launchers conocidos y bloquear ante cualquier actor desconocido. Esta aceptación no autoriza bootstrap ni publicación real.

Estado: R1 PROPOSED; environment NOT SELECTED/NOT PROVEN; RE-01/RE-02 UNKNOWN; E2/E3 UNKNOWN; E4 NOT READY; P01-G PENDING/UNKNOWN; STOP; M0 INCOMPLETO.
 
---

## DELTA VIGENTE — PERFIL TERMUX Y DESTINO REAL (2026-11-02)

Esta delta supersede los estados históricos inferiores que dicen que Termux no está instalado, que R1 no fue aceptado, que el launcher no existe o que el destino no está seleccionado.

- R1: ACCEPTED BY OWNER. El alcance excluye OS comprometido/root o privilegios equivalentes y procesos maliciosos dentro del mismo UID/dominio de confianza Termux. Los actores legítimos conocidos deben controlarse durante una ventana definida; actor relevante no controlado detectado => STOP. No se exige un negativo universal fuera del ámbito observable.
- Entorno: POCO X7 Pro / Android 16; Termux + Node.js instalados y usados. HOME privado observado como `/data/data/com.termux/files/home`, permisos de directorio `0700`; UID Termux `10378`.
- Destino ratificado: `$HOME/.nexo-continuity.json`, fuera del repo y almacenamiento compartido.
- RE-01: IMPLEMENTED / CI-VERIFIED / EXERCISED IN TERMUX.
- RE-02: IMPLEMENTED / CI-VERIFIED / REAL-DESTINATION PREFLIGHT EXERCISED. En la ejecución del 2026-11-02 el launcher presentó raíz canónica, destino efectivo, snapshot vacío, ventana y SHA `b8a44d37b957d6e8b91c38df81dcf288dfaf839bbd582e735ff1110452f0d941`. La entrada `CANCELAR` produjo `NEXO_CONTINUITY_BOOTSTRAP_CONFIRMATION_NOT_MATCHED`, `writeAttempted:false`.
- E2: PARTIAL / NOT CLOSED. La evidencia de procesos y actores es puntual; no prueba control sostenido de escritores durante una ventana de publicación.
- E3: PARTIAL / NOT CLOSED. Entry point manual y TTY ejercitados; el control de relanzamiento durante una ventana concreta aún no está demostrado.
- E4: PARTIAL / NOT CLOSED — REAL-DESTINATION PREFLIGHT. La ruta fue resuelta y presentada bajo HOME privado; no hubo creación ni lectura post-publicación.
- No repetir el inventario de procesos, paquetes, perfiles, jobs o callers ya realizado. No repetir el launcher. No desinstalar apps sin evidencia de interferencia.
- La ejecución se canceló antes de intentar escribir. No hay autorización de instancia, `authorization: NOT_EVALUATED`; primera publicación, commissioning y efectos protegidos permanecen STOP; M0 INCOMPLETO.

La aceptación R1 y el preflight del destino no son autorización de publicación ni evidencia de ROOT_READY.
