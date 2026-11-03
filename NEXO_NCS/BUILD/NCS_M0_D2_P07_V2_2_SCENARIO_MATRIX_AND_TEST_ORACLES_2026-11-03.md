# NCS M0 — P07 V2.2: matriz de escenarios y oráculos P07-01…P07-22

Fecha: 2026-11-03  
Base: commit `d8b5ca8720908d926acc18130614cce132a43b5d`.  
Documento normativo: `NCS_M0_D2_P07_V2_2_NORMATIVE_CORRECTION_2026-11-03.md`.  
Documento de evidencia: `NCS_M0_D2_P07_V2_2_TRACEABILITY_PLATFORM_AND_EVIDENCE_PROTOCOL_2026-11-03.md`.

Estado: **DISEÑO DOCUMENTAL — NO EJECUTADO — NO IMPLEMENTA HARNESS — NO AUTORIZA PRUEBAS EN POCO NI CAMBIOS DE RUNTIME**.

## 1. Contrato común del harness

Cada ejecución deberá registrar:
- SHA del harness y código bajo prueba;
- identificador de escenario, subcaso y fixture;
- fingerprint de plataforma, runtime, filesystem y mount context disponible;
- precondiciones y política de aliases aplicable;
- roles de todos los objetos y baseline de integridad;
- clase de cada actor B: cubierto, crudo, privilegiado o no clasificable;
- barreras/cutpoints y prueba de que fueron alcanzados;
- fd abiertos, duplicados/heredados, PID, estado y causa de terminación;
- syscall/API exacta, flags, errno, señal y orden de operaciones;
- inventario namespace antes/después y hashes/metadata por fd;
- resultado del harness y clase del resultado por separado;
- cleanup del fixture o razón por la que se retuvo.

No usar sleeps como sincronización. Una barrera externa no acredita un seam interno del producto.

### 1.1 Campos de resultado

`harness_verdict`: PASS / FAIL / UNKNOWN / BLOCKED / INVALID / NOT_APPLICABLE.  
`result_class`: PASS_CARAC / PASS_GATE / DETECTION_ONLY / SERIALIZATION / RETENTION_VERIFIED.  
`product_state`: ESTABLISHED / DEGRADED / UNKNOWN / STOP.

### 1.2 Predicado de centinela

Cada escenario define:
- identidad observada del fd retenido;
- hash/contenido por fd cuando corresponda;
- nombre protegido y objeto al que resuelve;
- nlink esperado por rol;
- inventario de nombres relevantes;
- cambios permitidos por la operación;
- observabilidad de desplazamientos transitorios.

Un centinela de destino que debe permanecer intacto falla si su nombre se desplaza aunque el fd mantenga vivo el objeto. No exigir nlink constante para objetos cuyo cleanup propio autorizado cambia nlink.

## 2. Escenarios

### P07-01 — Aliases de raíz

**Objetivo:** clasificar symlink, hardlink, bind mount, ruta relativa y montaje conforme a política aprobada.  
**Fixture:** directorio real, symlink, archivos para hardlink; bind mount separado si observable/creable. Hardlink a directorio no se presupone.  
**Secuencia:** abrir raíz; conservar fd; registrar contexto; resolver alias separado; comparar dominio según política.  
**PASS_CARAC:** cada alias se clasifica correctamente.  
**PASS_GATE:** solo si la política está ratificada y el producto la aplica.  
**BLOCKED/UNKNOWN:** política ausente, contexto no observable o permisos insuficientes.

### P07-02 — Symlink final e intermedio

**Objetivo:** verificar el alcance real de flags y resolución restringida.  
**Fixture:** symlink final e intermedio en árboles separados.  
**Subcasos:** (a) sustitución determinista antes de resolver; (b) sustitución durante resolución con barrera/seam verificable; intentos estadísticos se etiquetan como tales.  
**Oráculo:** O_NOFOLLOW solo protege el componente final de la apertura. Escape del límite = FAIL. Cero interleavings observados = UNKNOWN, no PASS. ELOOP no se presupone para symlink intermedio bajo O_NOFOLLOW solo.

### P07-03 — Tipos de objeto inesperados

**Objetivo:** validar tipo sin bloqueo ni seguimiento accidental.  
**Fixture:** regular vacío/no vacío, directorio, symlink, FIFO, socket y dispositivo si disponible.  
**Secuencia:** inspección no bloqueante; abrir con flags apropiados; fstat del objeto abierto.  
**PASS:** tipo permitido conforme al rol; tipo inesperado STOP sin cleanup; FIFO no bloquea.  
**INVALID:** fixture puede bloquear indefinidamente sin watchdog.  
**BLOCKED:** tipo no creable con causa documentada.

### P07-04 — Owner, metadata y acceso

**Objetivo:** distinguir ausencia, ilegibilidad, corrupción y ownership ajeno.  
**Fixture:** owner válido, ausente, parcial/truncado, cero bytes, token/metadata ajena válida, ilegible y corrupta. Incluir permisos de lectura/búsqueda separados.  
**Secuencia:** fallar operaciones en puntos distintos del ciclo de vida y registrar handler con fd, sin fd o con referencia de otro proceso.  
**Oráculo:** EACCES/EPERM no equivalen a ENOENT. Ningún owner ausente/corrupto/ilegible autoriza cleanup.  
**FAIL:** cleanup del objeto no atribuido. **UNKNOWN/BLOCKED:** atribución o precondición no verificable.

### P07-05 — Sustitución entre última verificación y cleanup

**Objetivo:** demostrar P07-C, no solo detectar sustitución.  
**Fixture:** original A, sustituto B con fd retenido, hash y nombre protegido.  
**Actores:** ejecutar subcaso B cubierto y B crudo.  
**Intercalación:** A alcanza seam interno después de última verificación relevante y antes de syscall destructiva; B actúa según su clase. El seam debe preservar el orden real del producto.  
**B cubierto:** el resultado esperado es serialización registrada; no exigir sustitución simultánea si el lock/admisión la impide.  
**B crudo:** solo caracterizar límite R1; no reclamar enforcement.  
**PASS_GATE:** solo con prevención/serialización demostrada y centinela íntegro conforme a su rol.  
**UNKNOWN:** seam inexistente/no observable.  
**INVALID:** barrera externa, stat→unlink o fstat→unlink(path) presentados como prevención.

### P07-06 — Fallo de creación/owner/lock y handler

**Objetivo:** probar que el handler no borra un sustituto.  
**Fixture:** puntos de fallo después de creación exclusiva, apertura, escritura parcial, escritura completa, fsync, error de fsync y close.  
**Matriz:** cada cutpoint × handler con fd original / sin fd / fd de otro proceso.  
**Intercalación:** B sustituye el nombre cuando el caso lo permite; handler de A se ejecuta.  
**Oráculo:** centinela intacto; cleanup propio solo si política lo permite y atribución está demostrada; si política es retener, usar RETENTION_VERIFIED.  
**UNKNOWN:** handler no instrumentable o atribución perdida.

### P07-07 — Temporal preexistente, ajeno o huérfano

**Objetivo:** impedir adopción por nombre o metadata débil.  
**Fixture:** temporal preexistente, temporal propio, sustituto, huérfano de ejecución anterior con marker/token copiado.  
**Definición:** “adopción” significa tratar un objeto preexistente como propio, operar sobre él o eliminarlo como residuo de la ejecución actual.  
**Oráculo:** nombre, PID, timestamp, tamaño, hash o token, solos o combinados, no prueban por sí mismos procedencia.  
**PASS:** procedencia demostrada por mecanismo ratificado; de lo contrario retener.  
**UNKNOWN:** huérfano sin atribución confiable. Decisión de qué evidencia atribuye huérfanos queda al propietario/P05.

### P07-08 — Writer que ignora lock advisory

**Objetivo:** caracterizar límite, no enforcement.  
**Fixture:** A adquiere lock; B abre y escribe directamente sin participar. Control separado con B cooperativo que intenta el mismo lock.  
**PASS_CARAC:** se registra el comportamiento real del FS/permisos; la especificación no afirma que advisory impida a B crudo.  
**BLOCKED:** precondición externa impide actor B.  
**No PASS_GATE** contra actor crudo fuera de R1.

### P07-09 — Crash de proceso y fases de publicación

**Objetivo:** caracterizar recuperación tras process crash, sin inferir power loss.  
**Fixture:** payload con hash, temporal y destino en fixture privado.  
**Cutpoints:** `write completado → fsync(file) pendiente`; `fsync(file) completado → rename pendiente`; `rename completado → fsync(dir) pendiente`; `fsync(dir) completado → siguiente paso pendiente`. Cada uno por separado y solo si la secuencia real lo contiene.  
**Protocolo:** proceso anuncia cutpoint, queda bloqueado; harness registra quién envía SIGKILL; espera reaping; inspecciona.  
**Controles:** control positivo de crash en cutpoint; estado parcial sembrado por harness etiquetado distinto.  
**Oráculo:** presencia de datos no demuestra fsync; crash no prueba power loss. Si el cutpoint no fue alcanzado o la señal no fue enviada por harness, INVALID.  
**UNKNOWN:** emisión de fsync no observable al nivel reclamado.

### P07-10 — Disponibilidad de primitivas

**Objetivo:** clasificar disponibilidad/errores sin inferir causa.  
**Fixture:** operaciones inocuas; SIGSYS potencial solo en hijo desechable.  
**Operaciones:** openat/openat2, renameat/renameat2, unlinkat, linkat, flock, F_SETLK, F_OFD_SETLK, fsync file/dir.  
**Oráculo:** separar clasificación de error de suficiencia. Para probar rama “primitiva no disponible ⇒ STOP sin fallback”, inyectar indisponibilidad mediante seam de dependencia controlado o un target que carezca realmente de ella. Si todas existen y no hay inyección, solo puede pasar la clasificación observada; rama no ejercida = UNKNOWN/NOT_TESTED.

### P07-11 — Dos aperturas a lados opuestos de sustitución

**Objetivo:** caracterizar fd1=I1 y fd2=I2.  
**Secuencia:** A abre I1; B sustituye nombre por I2; B abre nombre; ambos fstat.  
**PASS_CARAC:** fd1 permanece I1, fd2 observa I2.  
**Nota:** se conserva; solapa con P07-15 pero el solapamiento no es defecto.

### P07-12 — Sustitución de ruta del lock

**Objetivo:** demostrar que lock de I1 no protege automáticamente nombre que ahora resuelve I2.  
**Fixture:** I1 e I2, nombres e identidades registrados.  
**Caso A:** A abre/bloquea I1 → B sustituye nombre → B abre/bloquea I2.  
**Caso B:** A abre I1 → B sustituye nombre por I2 → A bloquea fd de I1 → B abre/bloquea I2.  
**Oráculo:** registrar dos descripciones/objetos y contención real. Dos locks simultáneos sobre objetos distintos no son una contradicción del kernel, pero invalidan cualquier claim de que el nombre quedó protegido por el lock de I1.  
**UNKNOWN:** semántica del mecanismo/FS no verificada.

### P07-13 — SIGKILL y ciclo de vida de locks

**Objetivo:** evaluar liberación por mecanismo y referencias supervivientes.  
**Tabla obligatoria:** subcaso × `flock` / `F_SETLK` / `F_OFD_SETLK`.  
**Subcasos:** fd único; dup; fd heredado por hijo; fd independiente; proceso padre muerto con hijo vivo; cierre de otro fd del mismo proceso para F_SETLK.  
**Protocolo:** control inicial de contención; enviar señal desde harness; waitpid/pidfd o mecanismo equivalente para confirmar reaping; intentar adquisición.  
**Oráculo:** F_SETLK es process-associated y no se interpreta como flock/OFD; flock/OFD siguen referencias a open file description según semántica probada. Error EBADF para OFD write-lock indica fd no apto, no “primitiva no soportada”.  
**UNKNOWN:** proceso no reaped o referencias no inventariadas.

### P07-14 — SIGSTOP y lock retenido

**Objetivo:** distinguir stop de exit.  
**Fixture:** A adquiere lock; B confirma contención antes de SIGSTOP.  
**Protocolo:** enviar SIGSTOP; confirmar estado detenido T mediante waitpid con WUNTRACED o evidencia equivalente; B reintenta; enviar SIGCONT.  
**PASS_CARAC:** lock permanece mientras referencia siga viva y la semántica lo establezca.  
**INVALID:** no se confirma que A quedó detenido. SIGSTOP no es release.

### P07-15 — fstat(fd) frente a stat(path)

**Objetivo:** observar divergencia entre objeto abierto y nombre actual.  
**Secuencia:** A abre I1; B sustituye nombre por I2; A ejecuta fstat(fd) y stat(path).  
**PASS_CARAC:** fd describe I1; path describe I2.  
**Nota:** conservar; redundancia parcial con P07-11 aceptable.

### P07-16 — Sustitución de raíz/ancestro

**Objetivo:** asegurar que la operación no se redirige silenciosamente a una raíz homónima.  
**Fixture:** RT-A y RT-B, con centinela homónimo en RT-B; inventario base de ambas.  
**Subcasos:** renombrar raíz; sustituir ancestro intermedio; introducir symlink intermedio.  
**Secuencia:** preflight y fd/dirfd de RT-A; B cambia namespace; A intenta abrir destino; se ejecuta la ruta de cleanup de fixture si el contrato la contempla.  
**Oráculo:** dirfd se considera anclaje de resolución, no prueba suficiente de permanencia del nombre raíz. Verificar RT-B, centinela, inventario y ausencia de cleanup sobre objeto no atribuido.  
**PASS_GATE:** operación queda vinculada a raíz aprobada o falla cerrada sin afectar RT-B. Detección sola = DETECTION_ONLY.

### P07-17 — Semánticas de locks

**Objetivo:** evitar equivalencia falsa entre mecanismos.  
**Subcasos:** flock vs fcntl; F_SETLK proceso; F_OFD_SETLK open file description; dup/inherit/open independiente; mismo filesystem local.  
**Oráculo:** registrar por separado; flock no se presume interoperable con fcntl/OFD en filesystem local; alcance fuera de filesystem local requiere evidencia específica. OFD write-lock exige fd de escritura; EBADF no significa syscall ausente.  
**BLOCKED:** binding/syscall no disponible con causa registrada.

### P07-18 — Rename: caracterización y gate separados

**P07-18a — Caracterización de visibilidad.**  
**Fixture:** source/destination; lector concurrente; destino ausente y preexistente en subcasos.  
**Oráculo:** observar old/new/ENOENT solo conforme al contrato y punto de observación. Exigir al menos una observación solapada/control positivo; cero solapamiento = UNKNOWN. PASS_CARAC solo describe visibilidad.

**P07-18b — Gate P07-C del destino.**  
**Fixture:** centinela B en destino con fd retenido, hash y baseline de nombre/nlink; fuente A atribuida separadamente.  
**Operación:** probar rename normal sobre destino preexistente y, separadamente, RENAME_NOREPLACE si el target lo soporta.  
**Oráculo:** rename normal reemplaza el nombre destino bajo semántica usual; por tanto, desplazar centinela no puede aprobar P07-C aunque el fd mantenga vivo el objeto. RENAME_NOREPLACE con destino existente debe preservar destino y producir el resultado de no-reemplazo esperado si la primitiva/FS lo soportan.  
**PASS_CARAC:** resultado de rename correctamente caracterizado.  
**PASS_GATE:** solo si contrato del producto evita afectar centinela o demuestra reemplazo/serialización autorizada. La fuente publicada debe atribuirse por separado: objeto publicado ≠ objeto creado no es automáticamente seguro.

### P07-19 — copyFile/copia parcial y cleanup

**Objetivo:** impedir que handler de error elimine sustituto del temporal/destino.  
**Fixture:** A crea temporal; B conserva centinela independiente; fuente y payload con hash.  
**Intercalación:** inyectar fallo en punto real; después del fallo y antes de cleanup, B sustituye el nombre temporal por centinela; A ejecuta handler.  
**Oráculo:** el centinela conserva descriptor, contenido, identidad y nombre protegido; cleanup solo afecta objeto atribuible a A. Sin seam/fallo reproducible, UNKNOWN/INVALID, no PASS.  
**Evidencia adicional:** revisión de fuente de la versión exacta de Node/libuv utilizada y de la implementación realmente cargada; registrar `process.versions.uv`, build y hash cuando sea posible. La documentación de Node sobre intento de cleanup y falta de atomicidad no prueba por sí sola si el unlink interno es path-based.  
**No afirmar** comportamiento interno de libuv sin inspección de la versión exacta.

### P07-20 — fsync de archivo y directorio

**Objetivo:** separar operación solicitada y nivel de evidencia.  
**Fixture:** archivo y directorio privados.  
**Subcasos:** fsync(file), fsync(dir) tras create/rename, error de cada uno, process crash en puntos separados.  
**Evidencia:** spy/API demuestra invocación a nivel API; syscall trace demuestra syscall si está disponible; estado final por sí solo no demuestra invocación.  
**Oráculo:** no inferir fsync(dir) desde fsync(file), ni durabilidad física desde ambos. Sección Fixture y cutpoints obligatorios.

### P07-21 — Hardlinks, n1/n2 y cleanup

**Objetivo:** probar nombres múltiples para el mismo inode y evitar borrar nombre ajeno.  
**Fixture:** n1 y n2 hardlink al mismo objeto, si filesystem/permisos lo permiten; fd retenido; baseline de dev/ino/nlink/hash.  
**Caso A:** cleanup autorizado elimina n1 propio; comprobar n2 sigue apuntando al objeto y nlink cambia según semántica esperada.  
**Caso B:** B crea/sustituye n1 con hardlink a objeto ajeno n2; A entra en cleanup; comprobar que no elimina n1 ajeno ni altera n2.  
**Oráculo:** identidad del objeto y autoridad sobre cada nombre se evalúan por separado. Igualdad de inode/nlink no autoriza cleanup.  
**BLOCKED:** EACCES u operación no soportada con causa sin atribuir; no generalizar.  
**FAIL:** nombre ajeno eliminado/alterado o n2 deja de cumplir su baseline sin autorización.

### P07-22 — Permisos y actores bajo R1

**Objetivo:** caracterizar límite de permisos y modelo de actores.  
**Fixture:** proceso A cooperativo y B crudo/no cooperativo en procesos separados; UIDs distintos solo si se pueden establecer y verificar.  
**Oráculo:** advisory no impide escritura directa si permisos la permiten. R1 debe definir qué actores están fuera del claim. Actores no clasificables => UNKNOWN-STOP.  
**Conservar** sin cambio estructural de V2.1; añadir campo clase(B) común.

## 3. Controles y reglas de invalidación

1. Un control positivo del harness demuestra que el harness puede observar el evento; no demuestra que el producto lo ejecute correctamente.
2. Un control positivo del producto solo existe si el contrato permite la operación y la atribución está demostrada.
3. Un centinela negativo debe ser independiente y conservar descriptor.
4. Sin intercalación real, no hay PASS de carrera.
5. Sin seam interno para la ventana crítica, no hay PASS_GATE de prevención.
6. Detección seguida de STOP se registra DETECTION_ONLY.
7. Serialización de actores cubiertos se registra SERIALIZATION.
8. Retención de residuo por política se registra RETENTION_VERIFIED.
9. Ningún cleanup del harness puede destruir evidencia necesaria para clasificar el escenario.
10. El escenario no ejecutado nunca es PASS.

## 4. Cobertura y cierre

P07-01…22 deben clasificarse como aplicables, NOT_APPLICABLE o BLOCKED con razón. No es requisito ejecutar todos indiscriminadamente.

P07-C permanece bloqueado si P07-05/06/07/16/18b/19/21 no tienen mecanismo y evidencia suficientes, o si P09/P05 mantienen dependencias críticas abiertas.

P07-A permanece abierto sin política de aliases ratificada.

P07-D permanece limitado a claims observados; process crash no prueba power-loss.

P07-E depende de R1 ratificado y P09.

## 5. Estado

- Escenarios definidos: P07-01…22.
- Pruebas ejecutadas por esta propuesta: NINGUNA.
- Harness implementado: NO.
- Mecanismo seleccionado: NINGUNO.
- P07: OPEN.
- P07-C: UNKNOWN/BLOCKING.
- P05-C: OPEN/NOT RATIFIED.
- P09: OPEN/UNKNOWN.
- NCS M0: INCOMPLETO.
