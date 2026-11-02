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