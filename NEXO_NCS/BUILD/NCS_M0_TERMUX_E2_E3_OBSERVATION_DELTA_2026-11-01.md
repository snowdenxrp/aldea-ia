# NCS M0 — evidencia observada Termux y evaluación RE-01…RE-09

Fecha: 2026-11-01
Rama: `ncs-lumina-decoupling-2026-10-29`
Estado: DELTA DOCUMENTAL DE EVIDENCIA; NO ACREDITA ENTORNO ADMISIBLE; NO EJECUTA BOOTSTRAP.

## 1. Alcance de esta actualización

Consolida la inspección manual de Termux comunicada por el propietario después de sincronizar el checkout a `7dda703a`. Reutiliza la definición normativa RE-01…RE-09 de `NCS_M0_P01_BOOTSTRAP_DECISION_MATRIX_2026-10-27.md`; no crea requisitos nuevos ni repite el inventario de callers.

La decisión del propietario del 2026-10-27 permite delimitar la garantía de primera publicación a un entorno operativo restringido con precondiciones explícitas y verificables. La autorización posterior del 2026-11-01 permite el trabajo técnico necesario para terminar M0 (incluidos runtime, pruebas y CI cuando sean necesarios), pero no autoriza la primera publicación real, commissioning, autoridad raíz ni efectos protegidos. Esta delta no usa esa autorización como evidencia de que el entorno ya sea admisible.

## 2. Evidencia recibida del POCO/Termux

Checkout:
- Rama: `ncs-lumina-decoupling-2026-10-29`.
- HEAD local observado: `7dda703a`.
- `git status --short`: vacío antes y después de la inspección.
- El fast-forward desde `49af6c5b` a `7dda703a` incorporó tres archivos documentales, sin conflicto.

Procesos:
- `ps -A` mostró la shell Bash de la sesión y el propio `ps`.
- La consulta anterior `ps -A -o USER,PID,PPID,NAME` falló: el `ps` disponible no admite el especificador `USER`.
- Es una captura puntual y de visibilidad limitada; no es inventario exhaustivo del sistema Android ni control sostenido de la ventana.

Servicios:
- `$PREFIX/var/service` contiene definiciones `ssh-agent` y `sshd`, ambas con archivos `run` y `down`.
- Los scripts `run` invocarían `ssh-agent -D` y `sshd -D -e`, respectivamente, si fueran lanzados por un supervisor.
- `sv`, `runsv` y `runsvdir` no están instalados; la consulta de estado con `sv` no fue posible.
- La presencia de directorios/scripts no prueba que los servicios estén activos. La presencia de archivos `down` es evidencia de configuración, no prueba por sí sola del estado efectivo del supervisor.

Arranque y programación:
- `~/.termux/boot` no existe en la inspección.
- `termux-job-scheduler` está disponible y su ayuda confirma soporte para jobs periódicos y opción `--persisted`.
- `termux-job-scheduler --pending` devolvió `No jobs found` en el momento de la consulta.
- `~/.bashrc`, `~/.profile` y `$PREFIX/etc/bash.bashrc` no contenían coincidencias para SSH Agent, SSHD, Job Scheduler, Nexo o Continuity.
- `crontab`, `cron`, `at`, `sv`, `runsv` y `runsvdir` no se encontraron; `termux-wake-lock` y `pgrep` sí están disponibles.
- La inspección visual previa de Ajustes > Aplicaciones no mostró Termux:Boot, Tasker, MacroDroid, Automate ni Shizuku. `pm list packages` no produjo un inventario completo por error de transacción del servicio Android.

No se inició ni detuvo ningún servicio, no se programó/canceló ningún job, no se instaló software y no se creó un store Continuity.

## 3. Evaluación conservadora de RE-01…RE-09

Los IDs y preguntas son los definidos en la matriz P-01 existente. La clasificación siguiente es preparación/evidencia parcial, no PASS del contrato:

| Requisito | Evidencia actual | Evaluación |
|---|---|---|
| RE-01 — identidad de invocación | Checkout/HEAD identificados; no se ejecutó una invocación de bootstrap M0 ni se estableció su inicio/fin. | NO SATISFECHO para una operación concreta |
| RE-02 — raíz y destino efectivos | No se eligió ni verificó una raíz/destino real; no se enlazó root explícito con `filePath` efectivo. | UNKNOWN |
| RE-03 — actores dentro del alcance | Se observaron dos definiciones runit, una captura de procesos y algunos launchers locales; el inventario Android/Termux no es exhaustivo y el destino aún no está identificado. | PARCIAL; clases relevantes siguen UNKNOWN |
| RE-04 — no intervención de actores excluidos | No existe mecanismo demostrado que impida acceso, nuevos lanzamientos o relanzamiento durante toda la ventana. | UNKNOWN / STOP |
| RE-05 — disparadores externos | Sin scripts Termux:Boot observados, sin jobs pendientes en esa consulta y sin referencias en tres perfiles de shell; scheduler disponible y otros disparadores/configuraciones no están exhaustivamente clasificados. | PARCIAL; cobertura UNKNOWN |
| RE-06 — estado previo | No se inspeccionó un destino real; no hay clasificación operacional de ausente/válido/corrupto/inaccesible. | NO VERIFICADO |
| RE-07 — publicación única y resultado | El código/CI del SHA `7a7f3ffa56af116a4f7222d22ff7638c9b470f92` acredita el comportamiento probado del store cooperativo y `COPYFILE_EXCL`; no acredita exclusión ambiental ni cobertura de escritores no cooperativos. | PARCIAL; no PASS ambiental |
| RE-08 — frontera de no continuación | `bootstrapNexoContinuityStore()` está implementada como operación separada que no acepta legacy memory, no carga estado legacy y devuelve resultado sin construir/devolver owner. No se ha demostrado una invocación pública/operacional end-to-end ni su relación con todos los launchers. | PARCIAL a nivel de función; end-to-end UNKNOWN |
| RE-09 — vigencia y trazabilidad | La evidencia de inspección está asociada al checkout `7dda703a`; las pruebas/CI del store se asocian al SHA de código `7a7f3ffa56af116a4f7222d22ff7638c9b470f92`. No hay destino ni ventana de bootstrap real a los que vincular una evidencia operacional. | PARCIAL documental; NO VALIDADO para publicación |

## 4. Qué sí cambia y qué no

Cambia:
- Termux pasa de candidato no confirmado a **instalado y usado para pruebas**.
- Se conoce que el comando Job Scheduler existe y que no había jobs pendientes en la consulta realizada.
- Se conocen las definiciones locales `ssh-agent` y `sshd`, sin evidencia de que estén supervisadas/activas.
- Se reduce la incertidumbre sobre algunos launchers locales; no se elimina la incertidumbre de cobertura.

No cambia:
- E2 sigue `UNKNOWN`: no se demostró capacidad para detener todos los writers/launchers relevantes ni impedir relanzamientos durante toda la ventana.
- E3 sigue `UNKNOWN`: no se demostró el entrypoint real de bootstrap ni un inventario completo de procesos, sesiones, servicios y consumidores con acceso al destino.
- E4 sigue `NOT READY`: no se ha seleccionado/verificado ruta y propiedades de almacenamiento.
- P01-C/P01-D siguen `OPEN / UNKNOWN`; P01-B sigue sin PASS end-to-end; P01-A/P01-G siguen `PENDING / UNKNOWN`; P01-E/P01-F/P01-H conservan sus estados previos.
- Primera publicación de Continuity, commissioning y efectos protegidos siguen `STOP`; `authorization: NOT_EVALUATED`; M0 `INCOMPLETO`.

## 5. Consecuencia para el plan de cierre

No se solicitan más comandos de inventario genérico en Termux. Repetir `ps`, buscar otra vez los mismos perfiles o reinstalar runit no convertiría la evidencia puntual en una barrera de exclusión.

La siguiente unidad de trabajo debe concentrarse en los contratos P-01 ya existentes:
1. P01-A/P01-G: delimitar el objeto y la base canónica de legitimidad de primera creación; no inferir autoridad del path, ausencia, lock o caller.
2. P01-B: verificar la frontera completa de la operación dedicada ya implementada, distinguiendo la propiedad local de la función de una invocación pública end-to-end.
3. P01-C/P01-D: definir qué actores quedan dentro del entorno restringido y qué precondición concreta impide a actores excluidos acceder al destino durante toda la ventana. Si no existe una barrera verificable en POCO/Termux, mantener STOP/UNKNOWN y evaluar una arquitectura de aislamiento distinta; no rebajar la garantía por conveniencia.
4. P01-E/P01-F: preservar cualquier objeto existente o ambiguo y mantener UNKNOWN sin reintento automático.
5. P01-H: ligar pruebas/CI a SHA exacto después de congelar el contrato aplicable.

No repetir el censo de callers, la revisión del lock ni el inventario Termux ya documentados. No ejecutar bootstrap ni crear Continuity real.

## 6. Evidencia y límites del código del store

El delta `NCS_M0_CONTINUITY_STORE_WRITER_AND_PATH_BOUNDARY_DELTA_2026-11-01.md` sigue siendo la descripción de referencia del lock y path boundary:
- el lock coordina solo participantes cooperativos;
- `COPYFILE_EXCL` evita sustituir un destino ya existente en la publicación inicial, pero no es publicación de visibilidad atómica para lectores no cooperativos;
- `commitIfCurrent()` usa temporal + `rename()` bajo lock cooperativo;
- no se afirma fsync/durabilidad ante pérdida de energía;
- no se afirma defensa universal frente a symlink/path TOCTOU.

La evidencia Termux no amplía esas garantías.

## 7. Estado de ejecución

Esta actualización es documental. No cambia runtime, tests, workflows ni configuración ejecutable; no ejecuta pruebas/CI/Actions; no inicia/detiene servicios; no programa/cancela jobs; no crea ni publica Continuity.
