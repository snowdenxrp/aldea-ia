# NCS M0 — cierre del inventario local y procedimiento R1

Fecha: 2026-11-02
Repositorio: `snowdenxrp/aldea-ia`
Rama: `ncs-lumina-decoupling-2026-10-29`
Alcance: documentación operacional; sin cambios de runtime, tests, CI, configuración del dispositivo ni publicación de Continuity.

## 1. Resultado de la fase de inventario

La revisión puntual de Android/Termux queda **CERRADA como inventario de los actores y mecanismos locales conocidos en esta sesión**. No equivale a demostrar exclusividad global, ausencia sostenida de procesos ni prevención técnica de relanzamiento.

### Evidencia recibida

- `cmd package list packages -U` produjo una lista completa en la captura compartida.
- `com.termux` permanece instalado con UID 10378.
- `com.termux.api` ya no aparece en la lista posterior a la desinstalación de Termux:API. No se infiere que nunca haya estado activo.
- No aparecieron en la lista Tasker (`net.dinglisch.android.taskerm`), MacroDroid (`com.arlosoft.macrodroid`), Automate (`com.llamalab.android.automate`) ni Shizuku (`moe.shizuku.privileged.api`).
- ChatGPT, Claude, Qwen y Perplexity aparecen con UIDs distintos del UID de Termux. No hay evidencia de que interfieran con el HOME privado de Termux; no se propone desinstalarlos.
- Los paquetes `org.nexo.m1.safetest15` a `org.nexo.m1.safetest18` aparecen con UIDs distintos del UID de Termux. No se atribuye interferencia M0 ni se propone actuar sobre ellos sin evidencia de un puente o permiso de acceso concreto.
- `$HOME/.termux/boot`, `$HOME/.termux/tasker` y `$PREFIX/etc/termux/boot` no existen en la captura.
- `termux-job-scheduler --pending` informó `No jobs found`. Esto solo describe los jobs visibles para ese comando; no es un inventario universal de Android JobScheduler.
- `crond`, `crontab` y `at` no están disponibles en PATH.
- `$PREFIX/var/service` contiene definiciones `ssh-agent` y `sshd`, con archivo `down`; la captura no detectó procesos con esos nombres. Sin supervisor/herramienta de consulta no se declara su estado efectivo. No se requiere detenerlos ni eliminar sus definiciones sobre esta evidencia.
- La consulta `ps -A` finalmente compatible mostró únicamente el propio `ps` y la shell Bash interactiva en esa captura. Las variantes anteriores con formato `-o` fallaron por incompatibilidad del comando disponible.
- `jobs -l` no mostró jobs de la shell actual. `who` no está disponible.
- La identidad de Termux observada fue UID/GID 10378, HOME y PREFIX canónicos bajo `/data/data/com.termux/files/`, con permisos 0700.
- No se detectaron procesos Node/Nexo en las capturas compartidas.
- El workflow GitHub de simulación Lúmina corre en runner remoto Ubuntu; no se observó puente o montaje hacia el HOME privado de Termux. Se mantiene clasificado como actor remoto separado, no como writer local demostrado.

### Interpretación

Estos resultados son snapshots del entorno visible para Termux y del inventario de paquetes consultado. No demuestran:
- ausencia de procesos en todo Android o en otros UID;
- ausencia de procesos maliciosos o comprometidos;
- imposibilidad de que un proceso legítimo se inicie más tarde;
- exclusión de todo writer no cooperativo;
- quiescencia sostenida durante una futura ventana de publicación.

No repetir el inventario genérico de paquetes, procesos, perfiles, jobs o servicios salvo cambio del entorno o contradicción concreta. No desinstalar apps IA ni paquetes M1 safetest por mera presencia.

## 2. R1 — regla operacional ratificada

El propietario es el único lanzador autorizado durante la ventana, desde una única sesión interactiva de Termux iniciada manualmente. Ninguna otra sesión o proceso está autorizado a escribir en Continuity durante esa ventana. Un actor relevante no controlado detectado activa STOP.

La ventana empieza con la comprobación previa y termina cuando la operación concluye y el resultado se verifica. Un reinicio, actualización o cambio relevante invalida la evidencia y exige reevaluación.

Límites aceptados por el propietario:
- OS comprometido/root o privilegios equivalentes quedan fuera de la garantía.
- Procesos maliciosos que compartan el UID/dominio de confianza de Termux quedan fuera de la garantía.
- No se exige demostrar inexistencia universal de actores fuera del ámbito observable.
- Los actores legítimos relevantes conocidos sí deben identificarse y controlarse durante la ventana.

## 3. Procedimiento R1 para una futura instancia

Este procedimiento es normativo/documental. **No se ha ejecutado y no autoriza publicación.**

1. **Preparación:** no iniciar otras sesiones Termux ni procesos Nexo; no usar automatizadores ni scripts de arranque para esta operación.
2. **Entrada de ventana:** el propietario abre manualmente una única sesión interactiva foreground de Termux. La ventana comienza antes del preflight.
3. **Preflight read-only:** ejecutar el launcher dedicado contra la raíz/ruta aprobadas. Confirmar ausencia del destino y ausencia de lock, temporales, symlinks o estados ambiguos. Cualquier estado previo o UNKNOWN => STOP.
4. **Presentación:** comprobar visualmente raíz canónica, ruta relativa, destino efectivo, snapshot inicial, SHA-256 y ventana. Todos deben coincidir con la instancia concreta aprobada. No inferir destino desde una prueba temporal.
5. **Control de actores:** mantener la sesión única y no iniciar otras sesiones/procesos escritores. Si aparece un writer/launcher relevante no controlado, o cambia el entorno, STOP.
6. **Autorización específica:** solo si todos los gates previos están satisfechos y existe autorización operacional humana explícita para esa instancia concreta, introducir exactamente `PUBLICAR <SHA-256>` dentro de los cinco minutos. La ratificación de P01-G y del destino candidato no sustituye esta autorización.
7. **Ejecución acotada:** el launcher solo inicializa el store vacío; no acepta memoria heredada, no devuelve owner operacional y no continúa a Chronicle, admisión, PREPARED, dispatch, reconciliación ni runtime.
8. **Verificación y salida:** verificar el resultado mediante el procedimiento soportado; confirmar que el launcher terminó y cerrar la ventana. Resultado ambiguo/UNKNOWN => STOP.
9. **Invalidación:** reinicio, actualización, cambio de permisos/paquetes/servicios, pérdida de sesión, cambio de destino, expiración de ventana o actor no controlado invalidan la evidencia.

No se requiere cerrar apps IA de otros UID ni desinstalar componentes sin una relación de acceso demostrada. No se requiere detener `ssh-agent`/`sshd` con la evidencia actual: no se detectaron procesos y sus definiciones tienen marcador `down`, aunque el estado efectivo del supervisor no está verificado.

## 4. Matriz de estado actual

| Elemento | Estado | Alcance |
|---|---|---|
| Inventario local de actores conocidos | CLOSED (snapshot) | Cierre de la ronda de inventario; no es exclusividad global |
| R1 | ACCEPTED BY OWNER | Regla normativa delimitada |
| RE-01 | IMPLEMENTED / EXERCISED | Launcher dedicado ejecutado en Termux con cancelación |
| RE-02 | IMPLEMENTED / EXERCISED IN TEMPORARY SCOPE | Root temporal → destino efectivo presentado |
| RE-03 | PARTIAL / NOT CLOSED | Roster conocido actualizado; vinculación operacional a la ventana real aún incompleta |
| RE-04 | PARTIAL / NOT CLOSED | Evidencia puntual; no demuestra quiescencia sostenida ni prevención de relanzamiento |
| RE-05 | CLASSIFIED / PARTIAL | Workflow remoto Lúmina separado; cobertura local/add-ons no universal |
| RE-06 | PARTIAL / FAIL-CLOSED | Ambigüedades bloquean; diagnóstico no distingue todos los estados preexistentes |
| RE-07 | SOFTWARE CONTRACT IMPLEMENTED / CI-VERIFIED | Exclusión cooperativa/no-overwrite; no atomicidad/global writer exclusion |
| RE-08 | IMPLEMENTED / CI-VERIFIED | Separación bootstrap/operación |
| RE-09 | PARTIAL / TRACEABLE | Ejercicio temporal y suite local observada; sin publicación productiva |
| E2 | PARTIAL / NOT CLOSED | Control operacional para instancia/ventana productivas pendiente |
| E3 | PARTIAL / NOT CLOSED | Control de mecanismos de lanzamiento en ventana productiva pendiente |
| E4 | NOT READY | Destino ratificado, pero admisibilidad operacional y propiedades aplicables no cerradas |

## 5. Destino y autoridad

- Destino candidato ratificado por el propietario: `$HOME/.nexo-continuity.json`.
- La ruta resuelve conceptualmente dentro del HOME privado de Termux, fuera del repositorio y separada de Lúmina.
- La ratificación fija el destino previsto; **no autoriza crearlo, inicializarlo ni publicarlo**.
- El launcher sí se ejecutó contra el destino real para preflight; se presentó el destino y la operación se canceló antes de intentar escribir (`writeAttempted: false`). No se ha demostrado una inicialización ni se hizo lectura independiente post-ejecución del archivo.
- P01-G = RULE RATIFIED BY OWNER; no es autorización para una instancia concreta.
- `authorization: NOT_EVALUATED`.
- Raíz constitucional legítima: PENDING / UNKNOWN.
- Primera publicación real: STOP.
- Commissioning: STOP.
- Efectos protegidos: STOP.
- NCS M0: INCOMPLETO.
- PR #110: OPEN / DRAFT / NOT MERGED.

## 6. Próxima unidad de trabajo

No repetir el inventario ni las pruebas focalizadas ya ejecutadas. El siguiente trabajo es reconciliar únicamente las brechas E2/E3 y E4 con la instancia concreta, sin invocar el launcher contra el destino ratificado. Antes de cualquier publicación deberán existir:
- evidencia suficiente y aplicable de control de actores relevantes durante una ventana definida;
- verificación del destino y sus precondiciones mediante preflight read-only;
- autorización operacional humana explícita para esa instancia exacta, posterior a la presentación del SHA y destino;
- criterios de salida y verificación disponibles.

Hasta entonces: STOP. Este documento no altera runtime, tests, workflows ni configuración del dispositivo.

## 7. Evidencia adicional — preflight del destino ratificado (2026-11-02)

El propietario ejecutó el launcher dedicado desde Termux contra el destino real ratificado, sin autorizar publicación:

- Comando: `node scripts/nexo-continuity-bootstrap.mjs --root "$HOME" --relative-path .nexo-continuity.json`.
- Raíz canónica presentada: `/data/data/com.termux/files/home`.
- Ruta relativa: `.nexo-continuity.json`.
- Destino efectivo presentado: `/data/data/com.termux/files/home/.nexo-continuity.json`.
- Snapshot presentado: NEXO_CONTINUITY v1 vacío.
- Ventana presentada: `2026-11-02T22:59:14.486Z` a `2026-11-02T23:04:14.494Z`.
- SHA-256 presentado: `b8a44d37b957d6e8b91c38df81dcf288dfaf839bbd582e735ff1110452f0d941`.
- Respuesta literal tras introducir `CANCELAR`:
  `{"status":"blocked","code":"NEXO_CONTINUITY_BOOTSTRAP_CONFIRMATION_NOT_MATCHED","writeAttempted":false}`.

### Alcance probatorio

- **RE-02 aumenta a IMPLEMENTED / EXERCISED: REAL-DESTINATION PREFLIGHT; PUBLICATION NOT ATTEMPTED.** El launcher aceptó la ruta real, presentó el destino y el SHA, y la cancelación fue rechazada como confirmación de publicación antes de intentar escribir.
- Esto confirma el comportamiento no publicador del launcher en esta ejecución y la resolución del destino. No es evidencia de inicialización, contenido persistido ni estado post-ejecución verificado por una lectura independiente del archivo.
- No eleva E2/E3 a PASS ni cierra E4: no demuestra quiescencia sostenida, prevención de relanzamiento, control de actores durante una ventana de publicación ni admisibilidad operacional completa.
- No se introdujo `PUBLICAR`; no se solicitó ni concedió autorización específica para esta instancia. `authorization: NOT_EVALUATED`.
- Primera publicación real, commissioning y efectos protegidos permanecen STOP. M0 permanece INCOMPLETO.

La evidencia fue recibida directamente del output de Termux compartido por el propietario. No se repitió el launcher y no se hizo lectura posterior del destino.

## 8. Precedencia documental — evitar reabrir estados históricos

Los documentos de BUILD fechados 2026-11-01/02 que describen Termux como candidato no seleccionado, launcher inexistente, RE-01/RE-02 UNKNOWN o P01-G pendiente conservan su valor como registro histórico de la evidencia disponible entonces; sus estados no son el estado vigente.

Para el estado posterior a la implementación y ejercicio real, usar en este orden:
1. `NEXO_NCS/STATUS.md` — resumen vigente y gates globales.
2. `NEXO_NCS/BUILD/NCS_M0_P01_G_CORE_CONTRACT_RECONCILIATION_RE01_RE02_2026-11-02.md`, secciones 11–12 — implementación RE-01/RE-02, CI y evidencia de Termux contra destino real cancelado; compatibilidad de P01-G con contratos Core.
3. Este handoff, secciones 1–7 — inventario R1, procedimiento y evidencia operacional recibida.

No reabrir la propuesta antigua de launcher: RE-01/RE-02 ya están implementados y ejercitados. No reinterpretar P01-G como autoridad constitucional ni como autorización de instancia. Las notas históricas no se reescriben; cualquier cambio posterior se añade como delta con SHA/evidencia.
