# NCS M0 — P07 V2.1: matriz de escenarios y oráculos P07-01…P07-22

Fecha: 2026-11-03  
Rama: `ncs-lumina-decoupling-2026-10-29`  
Relacionado: `NCS_M0_D2_P07_V2_1_NORMATIVE_CORRECTION_2026-11-03.md`  
Estado: **DISEÑO DE PRUEBAS — NO EJECUTADO — NO AUTORIZA PRUEBAS EN POCO NI CAMBIOS DE RUNTIME**

## 1. Reglas comunes del harness

Cada escenario debe registrar:

- SHA del harness y del código bajo prueba;
- fingerprint: dispositivo/ABI, Android build, kernel, Termux, Node, filesystem y mount context disponible;
- precondiciones verificadas;
- fixture temporal privada, aislada y descartable; nunca usar la ruta real de Continuity;
- control positivo que demuestre que el harness sí puede observar el efecto esperado;
- control negativo/centinela que detecte daño al objeto sustituto;
- barreras deterministas (pipes/socketpair/señales u otro mecanismo explícito), no sleeps como sincronización;
- descriptors heredados/duplicados y procesos supervivientes cuando afecten al resultado;
- stdout/stderr, exit status, señal, errno y metadata antes/después;
- veredicto harness y estado del producto en campos separados.

Veredictos harness: `PASS`, `FAIL`, `UNKNOWN`, `BLOCKED`, `INVALID`, `NOT_APPLICABLE`. Un escenario puede ser PASS como caracterización de una limitación sin que la propiedad de seguridad del producto quede ESTABLISHED.

**Regla de integridad:** ningún test debe borrar por nombre un objeto cuyo vínculo con la operación no esté demostrado. El centinela sustituto se inspecciona por descriptor retenido y evidencia de contenido/hash; una lectura posterior por nombre sola no basta para atribuir identidad.

## 2. Escenarios

### P07-01 — Aliases de raíz: symlink, hardlink y bind mount separados

**Objetivo:** comprobar la política de dominio de admisión, no solo igualdad de inode.

**Fixture:** directorio real y symlink al directorio. Hardlink solo para archivos donde aplique. Bind mount es escenario separado y puede ser NOT_APPLICABLE bajo R1 si no es observable/creable.

**Intercalación:** abrir la raíz candidata; conservar fd; inspeccionar identidad; resolver el alias por separado; comparar contexto disponible; repetir tras renombrar el nombre original si el fixture permite.

**PASS del harness:** cada clase se clasifica según la política explícita; no se fusionan dominios solo por `(st_dev,st_ino)`; no se acepta symlink fuera del límite.

**FAIL:** la implementación fusiona o separa dominios sin aplicar política, o acepta escape no permitido.

**UNKNOWN/BLOCKED:** contexto de montaje/alias no observable o permisos insuficientes. Bind mount no observable no puede convertirse en FAIL del producto.

### P07-02 — Symlink final e intermedio, incluida sustitución

**Objetivo:** demostrar alcance real de `O_NOFOLLOW` y, si se evalúa, resolución restringida con dirfd/openat2.

**Fixture:** symlink final y symlink intermedio en árboles independientes. No reutilizar un solo caso para ambos.

**Intercalación:** abrir el componente final con flag; luego probar componente intermedio. En el caso de carrera, proceso B sustituye el componente intermedio mediante barrera justo antes de la resolución de A.

**PASS:** el mecanismo rechaza/contiene los enlaces de acuerdo con su contrato; el test registra explícitamente que `O_NOFOLLOW` solo protege el componente final.

**FAIL:** se afirma protección intermedia usando únicamente `O_NOFOLLOW`, o la resolución escapa del límite.

**INVALID:** esperar ELOOP por symlink intermedio cuando solo se usa `O_NOFOLLOW` en el componente final.

### P07-03 — Tipo de objeto inesperado

**Objetivo:** validar tipos permitidos sin bloquear ni seguir enlaces accidentalmente.

**Fixture:** archivo regular (vacío y no vacío), directorio, symlink, FIFO, socket y dispositivo si disponible. El tamaño cero se evalúa según contrato de contenido, no como tipo.

**Intercalación:** inspección sin bloquear FIFO; apertura con flags apropiados; fstat del descriptor efectivamente abierto; comparar con lstat cuando el objetivo sea el enlace mismo.

**PASS:** tipo inesperado se clasifica y no se realiza cleanup; FIFO no bloquea al harness.

**FAIL:** tipo no permitido se consume como archivo esperado o se sigue un symlink no permitido.

**UNKNOWN/BLOCKED:** fixture no puede crearse o inspeccionarse con precondiciones verificadas.

### P07-04 — Metadata/owner ilegible y errores de acceso

**Objetivo:** distinguir ausencia, contenido ilegible, metadata inaccesible y ownership no verificable.

**Fixture:** archivos legibles/no legibles; directorio sin permiso de búsqueda; objeto con ownership distinto solo si la capacidad real de cambiar UID/ownership existe.

**Intercalación:** probar separadamente lectura de contenido, búsqueda de directorio, stat/lstat/fstat y consulta de ownership. Verificar UID efectivo y permisos antes de atribuir errno.

**PASS:** EACCES/EPERM y errores equivalentes se clasifican como acceso denegado/ambiguo, nunca como ENOENT ni autorización de cleanup.

**FAIL:** error de acceso se convierte en ausencia o mismatch que habilita borrado.

**INVALID:** asumir que chmod 000 sobre el archivo necesariamente hace fallar stat.

### P07-05 — Sustitución entre comprobación y cleanup

**Objetivo:** verificar que el cleanup no destruye un sustituto.

**Fixture:** objeto original creado por A y centinela sustituto creado por B; conservar descriptor del original y del centinela.

**Intercalación:** A valida original; B sustituye el nombre mediante rename; barrera libera a A para continuar cleanup.

**PASS:** el mecanismo no elimina ni modifica el centinela y demuestra que cualquier objeto eliminado era atribuible a A. Debe incluir control positivo que limpia un objeto propio cuando no hay sustitución.

**FAIL:** el centinela cambia/desaparece, o la implementación declara seguro el cleanup basándose solo en una comprobación inmediatamente anterior a unlink.

**UNKNOWN:** no se puede atribuir el objeto afectado.

**INVALID:** `stat → unlink`, `fstat(fd) → unlink(path)` o `statat → unlinkat` presentados como compare-and-unlink.

### P07-06 — Fallo durante creación inicial de owner/lock y sustitución

**Objetivo:** asegurar que el manejador de error no borra el objeto ajeno.

**Fixture:** A crea objeto temporal; B conserva un centinela independiente.

**Intercalación:** A falla en puntos instrumentados después de crear/abrir; B sustituye el nombre; A entra en error handler.

**PASS:** centinela intacto; no cleanup destructivo por nombre sin atribución demostrada; control positivo confirma cleanup del objeto propio en el caso sin sustitución.

**FAIL:** manejador elimina o altera el sustituto, o confunde owner ilegible con owner ausente.

**UNKNOWN:** no se puede demostrar qué objeto habría afectado el cleanup.

### P07-07 — Temporal preexistente, ajeno o sustituido

**Objetivo:** impedir adopción o eliminación por nombre de temporales ajenos.

**Fixture:** temporal preexistente; temporal creado por A; sustituto de B; PID/nombre deliberadamente repetible.

**Intercalación:** A intenta crear exclusivamente; B sustituye nombre tras creación; A evalúa adopción/cleanup.

**PASS:** A solo adopta un descriptor/objeto cuya creación y atribución están demostradas; nunca usa PID, timestamp o nombre como prueba única.

**FAIL:** adopta/elimina por nombre un temporal ajeno.

**UNKNOWN:** descriptor/atribución perdidos o metadata no verificable.

### P07-08 — Writer directo que ignora lock advisory

**Objetivo:** caracterizar el límite advisory, no probar enforcement.

**Fixture:** archivo y lock temporal. A adquiere lock cooperativo; B abre archivo y no participa en el protocolo.

**Intercalación:** mantener lock de A mientras B intenta una escritura directa; separar este caso del control cooperativo donde B sí intenta adquirir lock.

**PASS del harness:** demuestra que un writer no cooperativo puede operar si permisos/FS lo permiten; el producto clasifica el lock como advisory y no reclama enforcement.

**FAIL:** documentación o código afirma que flock/fcntl impide writers que ignoran el lock.

**NOT_APPLICABLE/BLOCKED:** el entorno no permite crear dos procesos o el acceso del actor B está denegado por una precondición externa verificada.

### P07-09 — Crash en fases de publicación

**Objetivo:** caracterizar estados después de crash de proceso, sin inferir pérdida de energía.

**Fixture:** temporal y destino publicados en directorio temporal privado; payload con identificador y hash.

**Puntos de corte:** después de write; después de fsync del archivo; antes de rename; después de rename; después de fsync del directorio. Registrar cada fase separadamente.

**PASS:** estado observado corresponde a un estado permitido por el contrato de esa fase; no hay payload parcial aceptado como publicación completa; la recuperación clasifica incertidumbre sin retry de negocio implícito.

**FAIL:** el programa reporta éxito con publicación incompleta/corrupta o realiza cleanup de objeto no atribuido.

**UNKNOWN:** fase exacta no demostrable o crash del harness impide conocer resultado.

**Límite:** process crash no es power-loss test. Ausencia de fsync no obliga a que los datos se pierdan.

### P07-10 — Disponibilidad y clasificación de primitivas

**Objetivo:** distinguir syscall inexistente, syscall denegada, argumento inválido, flag no soportado y señal seccomp.

**Fixture:** operaciones inocuas en directorio temporal. Syscalls potencialmente sujetas a SIGSYS se prueban solo en proceso hijo desechable.

**Operaciones candidatas:** openat/openat2, renameat/renameat2, unlinkat, linkat, flock, F_SETLK, F_OFD_SETLK, fsync de archivo y directorio.

**PASS:** cada resultado se clasifica sin inferencia y cualquier requisito no soportado produce STOP/fail-closed sin fallback de garantía inferior.

**FAIL:** fallback silencioso o clasificación falsa (por ejemplo, EPERM/EACCES = seccomp sin evidencia).

**UNKNOWN:** errno/señal o causa no se puede atribuir.

### P07-11 — Dos procesos abren el mismo nombre a lados opuestos de una sustitución

**Objetivo:** caracterizar referencias fd distintas.

**Fixture:** crear `file.txt` como I1 y un objeto I2 separado.

**Intercalación:** A abre `file.txt` (fd1); B sustituye `file.txt` por I2; B abre el nombre (fd2); ambos hacen fstat.

**PASS:** fd1 identifica I1 y fd2 identifica I2; la implementación reconoce referencias distintas.

**FAIL:** el código asume que ambos descriptores representan el nombre actual.

**UNKNOWN:** fstat o control de intercalación falla.

### P07-12 — Sustitución del path del lock

**Objetivo:** mostrar que un lock sobre inode viejo no protege automáticamente el inode nuevo.

**Fixture:** lock I1 abierto por A; objeto I2 para sustituir el nombre.

**Intercalación:** A abre y bloquea I1; B sustituye nombre; B abre el nuevo nombre y trata de bloquear I2 sin espera.

**PASS del harness:** B puede adquirir un lock independiente sobre I2 cuando la semántica del lock y el FS lo permiten; la implementación detecta que el nombre nuevo no es el objeto bloqueado por A.

**FAIL:** la implementación afirma que el nombre sigue protegido solo porque A mantiene lock sobre I1.

**UNKNOWN:** mecanismo/semántica no disponible.

### P07-13 — SIGKILL y liberación de locks

**Objetivo:** probar liberación condicionada al cierre de todas las referencias relevantes.

**Subcasos obligatorios:** descriptor solo en A; descriptor duplicado; descriptor heredado por hijo; descriptor abierto independientemente por B; transferencia de descriptor si disponible.

**Intercalación:** A mantiene lock; se envía SIGKILL a A; proceso superviviente intenta lockear. Repetir con referencia heredada/duplicada aún viva.

**PASS:** el lock queda disponible solo cuando la semántica concreta indica que se cerraron todas las referencias relevantes.

**FAIL:** el producto asume que SIGKILL por sí solo garantiza liberación aun con referencias supervivientes.

**UNKNOWN:** no se puede observar/cerrar el ciclo de referencias.

### P07-14 — SIGSTOP conserva lock

**Objetivo:** verificar que detener el proceso no equivale a terminarlo.

**Intercalación:** A adquiere lock; B confirma contención; SIGSTOP A; B vuelve a intentar; SIGCONT A.

**PASS:** el lock sigue retenido mientras A conserva descriptor/referencia y continúa después de SIGCONT.

**FAIL:** se interpreta SIGSTOP como release o terminación.

**INVALID:** afirmar que el objeto filesystem se vuelve inaccesible. Solo la admisión cooperativa puede quedar bloqueada.

### P07-15 — fstat(fd) divergente de stat(path)

**Objetivo:** demostrar la diferencia entre objeto abierto y resolución actual del nombre.

**Intercalación:** A abre I1; B sustituye nombre por I2; A hace fstat(fd); A hace stat(path).

**PASS:** fstat sigue describiendo I1 y stat describe I2; la implementación no confunde ambas identidades.

**FAIL:** la lógica trata fstat(fd) como prueba de que path sigue apuntando a I1.

**UNKNOWN:** una operación falla o la sustitución no quedó demostrada.

### P07-16 — Sustitución de raíz después de preflight

**Objetivo:** probar si la operación posterior permanece vinculada a la raíz presentada.

**Fixture:** raíz temporal R1 y ruta alternativa R2, sin tocar raíz/objeto real Nexo.

**Intercalación:** preflight resuelve R1 y conserva evidencia; proceso B cambia el nombre de raíz o sustituye un componente; A intenta abrir destino.

**PASS:** operación se mantiene dentro del objeto raíz aprobado mediante mecanismo demostrado, o falla cerrada sin tocar R2.

**FAIL:** operación se redirige a R2 o continúa usando una resolución distinta sin detectar discrepancia.

**UNKNOWN:** no se puede observar el contexto de montaje/raíz o intercalación.

### P07-17 — Semánticas de locks: flock, F_SETLK y OFD

**Objetivo:** evitar tratar mecanismos diferentes como equivalentes.

**Subcasos:** dos open file descriptions independientes sobre mismo inode; dup/inherited fd de una misma descripción; F_SETLK con cierre de otro fd del mismo proceso; F_OFD_SETLK si runtime/kernel lo permiten.

**PASS:** resultados coinciden con semántica del mecanismo probado y se registran separadamente.

**FAIL:** implementación presupone que todos los locks tienen el mismo ciclo de vida.

**UNKNOWN/BLOCKED:** constante, syscall o binding no disponible.

### P07-18 — Rename: sustitución de source/destination y visibilidad

**Objetivo:** caracterizar atomicidad de nombre, no identidad condicional.

**Fixture:** source/destination con centinelas; lectores concurrentes; destino preexistente y ausente en subcasos.

**Intercalación:** sustituir source antes de rename; sustituir destination antes de rename; lectores observan el nombre durante la operación.

**PASS:** visibilidad cumple el contrato del FS y no se afirma que rename verifique el inode source validado antes.

**FAIL:** el producto reclama compare-and-rename por solo usar rename/renameat.

**UNKNOWN:** semántica/FS no verificable.

### P07-19 — copyFile/copia parcial y cleanup

**Objetivo:** caracterizar temporales parciales y errores de copia.

**Fixture:** fuente/destino temporal, payload con hash, fallo inyectado en fases donde el harness lo pueda controlar.

**PASS:** objeto parcial nunca se presenta como publicado; cleanup solo elimina objeto temporal atribuido; si la atribución falla, queda residuo y STOP/UNKNOWN.

**FAIL:** destino parcial se reporta como completo o cleanup borra sustituto.

**UNKNOWN:** no se puede inyectar/observar el punto de fallo.

### P07-20 — fsync archivo/directorio y niveles de persistencia

**Objetivo:** separar flush de contenido y persistencia de entrada de directorio.

**Subcasos:** fsync de archivo; fsync del directorio tras creación/rename; error de cada operación; process crash en puntos controlados.

**PASS:** el producto describe exactamente qué sync se completó y no infiere power-loss durability.

**FAIL:** fsync de archivo se presenta como persistencia de rename/entrada de directorio o como garantía física universal.

**UNKNOWN:** FS/operación no admite prueba suficiente.

### P07-21 — Hardlinks y alias de objeto

**Objetivo:** comprobar nlink y alias sin fusionar dominios de autoridad automáticamente.

**Fixture:** dos nombres hardlink al mismo objeto si el FS/permiso lo permite; intento separado de link/linkat en fixture.

**PASS:** identidad de objeto y política de dominio se registran por separado; cleanup de un nombre no se describe como destrucción del objeto mientras existan otros links.

**FAIL:** se infiere dominio de autoridad solo por nlink o se elimina un nombre ajeno.

**BLOCKED/NOT_APPLICABLE:** EACCES u operación no soportada, con causa sin atribuir; no generalizar a todos los hardlinks/FS.

### P07-22 — Permisos y actores bajo R1

**Objetivo:** verificar precondiciones de acceso y declarar límites de actor.

**Fixture:** actores cooperativos y no cooperativos en procesos separados del mismo UID; dos UIDs solo si el entorno permite verificarlos realmente.

**Intercalación:** proceso cooperativo intenta lock; actor no cooperativo intenta operación directa; registrar permisos y resultado.

**PASS del harness:** demuestra el límite real: advisory no impide al actor que ignora protocolo si los permisos permiten la operación. La especificación mantiene ese actor fuera del claim de enforcement R1.

**FAIL:** claim de aislamiento universal o mandatory lock sin evidencia.

**UNKNOWN/BLOCKED:** no se puede crear actor/UID o verificar precondiciones.

## 3. Cobertura y cierre

P07-01…22 no son una orden de ejecutar todos los escenarios. Cada escenario debe clasificarse como aplicable, no aplicable o bloqueado con razón y evidencia. No se permite convertir un escenario no ejecutado en PASS.

P07-C no se cierra si P07-05/06/07/16/18/19 carecen de un mecanismo demostrado y control negativo con centinela intacto.

P07-A no se cierra si alias/contexto de montaje se infiere o se fusiona sin política.

P07-D no se cierra con solo pruebas de process crash si el claim incluye pérdida de energía.

P07-E no se cierra si el modelo de actores no coincide con R1/P09.

## 4. Estado

- Escenarios diseñados: P07-01…22.
- Pruebas ejecutadas: **NINGUNA**.
- Harness implementado: **NO**.
- Mecanismo seleccionado: **NINGUNO**.
- P07: **OPEN**.
- Documento: diseño de pruebas, no autorización para ejecutar.
