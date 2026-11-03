# NCS M0 — P05: análisis de política de release incierto y readmisión
**Fecha:** 2026-11-03  
**Rama documental:** ncs-m0-documentary-reconciliation-2026-11-02  
**HEAD de referencia al iniciar este análisis:** 42d571349f74c83a2b7214fc6d3d7044c3316eb2  
**Estado:** ANÁLISIS TÉCNICO — NO RATIFICADO — NO IMPLEMENTADO  
**Alcance:** solo P05. No modifica D0/D1/D2 ratificados, runtime, tests, workflows ni datos operativos.

## 1. Conclusión ejecutiva

No existe evidencia documental suficiente para seleccionar hoy una primitiva de filesystem que permita declarar seguro el release/readmisión en todos los casos P05. Tampoco basta con declarar “fail closed” si ese bloqueo solo vive en memoria del proceso: una nueva invocación podría observar el path ausente y admitir mientras un actor anterior todavía puede completar una limpieza o escritura.

Por tanto, la recomendación es:

1. Prohibir readmisión automática y retry de negocio después de release incierto.
2. No declarar P05 cerrado todavía.
3. Mantener el resultado UNKNOWN/BLOCKED hasta que exista una de estas dos demostraciones:
   - quiescencia externa verificable que impida al actor anterior reanudar y permita intervenir sin competidores; o
   - un protocolo de lock que mantenga identidad estable y coordinación cross-process sin una retirada insegura por nombre.
4. No añadir marcador persistente, lock hermano, cola, ID, retry ni servicio de recuperación sin demostrar necesidad y obtener decisión separada.
5. Si ninguna vía puede demostrarse dentro del alcance M0, dejar explícitamente la recuperación/readmisión fuera de M0 y aceptar la indisponibilidad de la instancia afectada; no fingir que una nueva ejecución puede readmitirse de forma segura.

Esta es una recomendación técnica para decisión del propietario. No es ratificación ni autorización de implementación.

## 2. Hechos de partida

La especificación P05 vigente distingue correctamente:
- resultado de negocio/persistencia;
- resultado de release;
- permiso de readmisión.

También prohíbe inferir libertad por ausencia de path, edad, PID aparentemente muerto, token textual o variable local. Los casos E1–E9 incluyen persistencia confirmada/UNKNOWN, reemplazo de path, owner ilegible, path ausente con actor posiblemente vivo, competidor y recuperación aprobada.

La matriz D2 añade que:
- LOCK_RELEASE_UNCERTAIN bloquea nuevas operaciones;
- la cuarentena local en memoria no es coordinación cross-process;
- una limpieza por path puede alcanzar un objeto sustituto;
- bootstrap parcial y release incierto requieren recuperación explícita;
- el modelo no promete resistencia a procesos hostiles ni durabilidad frente a pérdida de energía.

Estos hechos no demuestran que exista una carrera ocurrida; identifican obligaciones contractuales aún no resueltas.

## 3. Evaluación de alternativas

### A. Recuperación externa con quiescencia demostrable

**Garantía que podría aportar:** si se demuestra que todos los procesos que pueden escribir, liberar o limpiar están detenidos y no pueden reanudarse durante la intervención, la recuperación ya no compite con un actor anterior activo.

**Condiciones que deben demostrarse:**
- inventario finito de actores relevantes dentro del límite R1 aceptado;
- mecanismo operacional que detenga esos actores y evite su relanzamiento durante la intervención;
- evidencia de que ningún proceso anterior conserva capacidad de reanudar una escritura/limpieza;
- inspección y reparación del objeto exacto bajo una ventana sin competidores;
- registro reproducible de quién intervino, qué observó y qué cambió.

**Límites:** no basta con consultar PID, ejecutar ps una vez, observar ausencia del path ni cerrar una sesión de shell. El inventario E2/E3 actual es PARTIAL; por tanto, no acredita hoy una quiescencia suficiente para readmisión.

**Estado:** candidata; no demostrada.

### B. Mecanismo de filesystem ligado a identidad del objeto

**Garantía que podría aportar:** el protocolo opera sobre un objeto de lock estable, y no sobre cualquier objeto que posteriormente aparezca bajo el mismo nombre.

**Condiciones que deben demostrarse:**
- primitiva real disponible en el entorno objetivo;
- identidad estable del objeto a través de adquisición, uso y liberación;
- coordinación entre procesos, no solo estado local;
- comportamiento frente a reemplazo, symlink, permisos, error parcial y crash;
- ausencia de split-brain si el nombre permanece o se recrea;
- pruebas de intercalación y procesos competidores sobre el filesystem objetivo.

**Límites:** read token → compare → rm(path) no demuestra identidad atómica. Un descriptor abierto o un inode observado tampoco hacen que una operación posterior por nombre retire necesariamente ese mismo objeto. No se ha seleccionado ni probado una primitiva concreta.

**Estado:** candidata; no demostrada.

### C. Bloqueo fail-closed sin recuperación automática

**Garantía que sí aporta:** el proceso que detecta incertidumbre no reintenta negocio ni concede otra admisión dentro de su propio contexto.

**Brecha crítica:** una variable local o una bandera en memoria desaparece al terminar el proceso. Si la siguiente invocación solo observa que el path del lock está ausente, no puede deducir que el actor anterior ya no puede reanudar. Por sí sola, esta alternativa no ofrece cuarentena durable cross-process.

Para convertir C en una política implementable haría falta una de estas cosas:
- una señal persistente de cuarentena, que es una nueva mutación de diseño no aprobada; o
- una regla externa de quiescencia/intervención que se ejecute antes de cualquier readmisión; o
- un mecanismo de lock estable que permita determinar que la admisión previa terminó.

**Estado:** principio de seguridad recomendado; insuficiente como protocolo autónomo de readmisión.

## 4. Matriz de decisión

| Criterio | A: quiescencia externa | B: identidad de objeto | C: fail-closed solo |
|---|---|---|---|
| Evita retry de negocio | Sí, si se aplica | Sí, si se aplica | Sí en el proceso que detecta el fallo |
| Evita readmisión por path ausente | Solo con quiescencia demostrada | Solo con protocolo de identidad probado | No por sí sola |
| Coordinación cross-process | Externa/operacional | Debe probarse en la primitiva | No |
| Requiere nueva infraestructura | No necesariamente; sí procedimiento operacional | Probablemente requiere seleccionar/caracterizar primitiva | No para el bloqueo local; sí para hacerlo durable |
| Evidencia actual suficiente | No | No | No para readmisión tras reinicio |
| Recomendación | Mantener como posible vía de recuperación externa | No seleccionar aún | Adoptar como regla inmediata, no como cierre P05 |

## 5. Regla inmediata que sí puede sostenerse

Sin ratificar todavía una política completa de recuperación, el comportamiento seguro común a todas las alternativas es:

1. Release incierto → UNKNOWN/BLOCKED.
2. No repetir automáticamente la operación de negocio.
3. No conceder readmisión en el mismo proceso.
4. No borrar ni sustituir el lock por edad, PID, timeout, token leído o ausencia observada del path.
5. No reportar release confirmado sin evidencia de identidad del objeto.
6. Conservar por separado persistencia, release y readmisión.
7. Antes de una nueva invocación que pretenda readmitir, exigir evidencia externa o de protocolo que cierre la incertidumbre previa. Si no existe, STOP.

**Advertencia:** el punto 7 es una obligación contractual, no una capacidad demostrada por el runtime actual. La implementación debe tener una forma verificable de hacer cumplir el bloqueo entre procesos; no se puede dar por satisfecha mediante una variable local.

## 6. Recomendación de alcance para M0

Recomiendo no incluir recuperación automática de release incierto en M0. La meta M0 debe exigir:
- release normal probado para la misma instancia de lock;
- cualquier release ambiguo produce STOP y no retry;
- ninguna ruta de entrada puede eludir la condición de readmisión;
- la recuperación excepcional se mantiene fuera del camino normal y no se declara disponible hasta que A o B esté demostrada.

Esto no autoriza dejar una instancia permanentemente bloqueada sin documentarlo. Si el propietario decide que M0 no necesita recuperación de incidentes, debe aceptarse explícitamente la consecuencia de disponibilidad: una instancia en estado ambiguo puede quedar inutilizable hasta intervención externa. La recuperación externa concreta sigue sin estar probada.

## 7. Gates que permanecen abiertos

| Gate | Estado | Razón |
|---|---|---|
| P05 política de readmisión | OPEN | C por sí sola no es durable; A/B no demostradas |
| P05 identidad de lock/release | OPEN | No hay primitiva seleccionada ni prueba de intercalación |
| P05 recuperación externa | OPEN | E2/E3 PARTIAL; no hay procedimiento de quiescencia demostrado |
| D2 | OPEN | P05 afecta la corrección de admisión/release |
| D1 | OPEN | No cambia |
| D3 | OPEN | No cambia |
| D1/D2 implementation | NO AUTORIZADA | Sin cambio |
| Tests/CI | NO AUTORIZADOS por este documento | Sin ejecución |
| Root legítima | PENDING/UNKNOWN | Sin cambio |
| authorization | NOT_EVALUATED | Sin cambio |
| ROOT_READY | NOT ESTABLISHED | Sin cambio |
| M0_BUILD_COMPLETE | NOT ACHIEVED | Sin cambio |
| Efectos protegidos | STOP | Sin cambio |

## 8. Preguntas de cierre que sí requieren evidencia, no preferencia

Antes de proponer ratificación P05, la siguiente revisión debe responder con evidencia:
1. ¿Qué proceso o supervisor puede mantener vivo el actor de release después de que el CLI padre termine?
2. ¿Qué mecanismo de Termux/Android dentro del límite R1 impide relanzamiento durante recuperación externa?
3. ¿Puede una nueva invocación distinguir release incierto anterior de lock realmente libre sin marcador persistente?
4. ¿Existe una primitiva de filesystem disponible en Node/Termux que vincule de forma demostrable la liberación al objeto adquirido y evite split-brain?
5. ¿Qué comportamiento observable y persistente impide una segunda admisión cuando el path está ausente pero la operación anterior no está demostrablemente quiescente?

No se deben responder por inferencia. Si alguna queda UNKNOWN, readmisión permanece BLOCKED.

## 9. Estado y autorizaciones

Este documento:
- no ratifica P05;
- no selecciona una primitiva de filesystem;
- no autoriza nuevos marcadores ni cambios de runtime;
- no autoriza tests, CI, bootstrap ni recuperación sobre la instancia real;
- no cambia PR #110 ni la rama de producto;
- no convierte E2/E3 PARTIAL en PASS.

**Dictamen:** P05 continúa OPEN. La regla fail-closed es obligatoria, pero no basta por sí sola para readmisión cross-process. La vía de recuperación debe demostrarse antes de cerrar D2.


## 10. Caracterización de fuente fijada al SHA base de producto

Se inspeccionaron los stores en el SHA de producto `99dabcb33be1efef5c4f5e368dc95140e45ff672`. Esta inspección es estática; no se ejecutó código ni se probó una carrera.

| Fuente | Blob SHA | Comportamiento relevante observado | Consecuencia P05 |
|---|---|---|---|
| `src/nexo/core/continuity-store.mjs` | `c1eb81bf74d2df576079b3269ac4db22d87fe7b6` | Usa `lockReleaseFailures`, un Set local al proceso. Tras fallar el primer `rm(lockPath)`, vuelve a ejecutar `rm(lockPath)` por el mismo nombre. Si falla el segundo intento, agrega la ruta al Set local. | El Set no coordina procesos. El segundo borrado por path puede alcanzar un objeto sustituto si el nombre fue reemplazado entre intentos. El código actual no demuestra identidad del objeto a través del release. |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` | Comprueba token con lectura de `owner.json` y después ejecuta un único `rm(lockPath)`; ante fallo devuelve `failed`. No tiene cuarentena cross-process ni retry equivalente al de Continuity. | Token-check seguido de retirada por nombre conserva una ventana check/use. Un fallo no deja una señal durable que por sí sola impida una nueva instancia. |
| `src/nexo/core/chronicle-store.mjs` | mismo blob | `loadCurrent()` lee Chronicle directamente sin adquirir el lock per-store. | La admisión externa de instancia debe preceder a esa lectura; el lock per-store actual no la protege. Esto pertenece al cierre D1/D2, no resuelve P05. |

### 10.1 Lo que esta evidencia permite afirmar

- Continuity y Chronicle no tienen la misma semántica de release; no se deben unificar por suposición.
- El control local `lockReleaseFailures` no es una cuarentena cross-process.
- Ni el token de owner ni la ausencia posterior del path prueban que la operación de release ya no puede afectar una nueva instancia.
- El runtime actual no demuestra la condición de identidad de objeto que P05 requiere para readmisión segura.
- No se ha demostrado una intercalación real; la conclusión es que la fuente no cierra contractualmente esa posibilidad.

### 10.2 Consecuencia

La alternativa B no está implementada ni demostrada. La alternativa C, aplicada solo como Set/flag local, tampoco garantiza bloqueo después de terminar el proceso. La alternativa A requiere evidencia operacional que no está contenida en la caracterización de fuente ni en E2/E3 actuales.

Por tanto, la conclusión de §1 permanece: P05 OPEN; no retry de negocio; no readmisión automática; no se afirma que exista recuperación segura disponible.


## 11. Candidato B1 para evaluación — lock advisory persistente con `flock(2)`

Esta sección registra una alternativa concreta para investigación; **no la selecciona ni la ratifica**.

### 11.1 Propiedad técnica relevante

En Linux, `flock(2)` asocia el lock a una open file description. Los descriptores duplicados comparten el lock y este se libera al ejecutar `LOCK_UN` o cuando se cierran todos los descriptores que lo mantienen. El lock se conserva a través de `execve(2)`. La semántica es advisory: un proceso que no coopera puede ignorarla y acceder al archivo igualmente.

Fuentes primarias:
- Linux man-pages, `flock(2)`: https://man7.org/linux/man-pages/man2/flock.2.html
- Linux man-pages, `flock(1)`: https://man7.org/linux/man-pages/man1/flock.1.html

La utilidad `flock(1)` puede envolver la ejecución de un comando; su opción `--no-fork` reemplaza el proceso por el comando y mantiene el lock a través de `execve`. El proyecto Termux mantiene un paquete `util-linux`, declarado como dependencia de `termux-tools`; esto acredita que existe una ruta de empaquetado en Termux, **no** que el binario `flock` esté instalado o disponible en el POCO del propietario:
- Receta Termux `util-linux`: https://github.com/termux/termux-packages/blob/master/packages/util-linux/build.sh
- Dependencias de `termux-tools`: https://github.com/termux/termux-packages/blob/master/packages/termux-tools/build.sh

### 11.2 Forma candidata

- Usar un archivo de admisión persistente y estable por raíz.
- Adquirir un lock exclusivo advisory sobre ese archivo antes de cualquier primera lectura persistente cubierta por O-10.
- No borrar, renombrar ni sustituir nunca el archivo de lock durante el funcionamiento normal. Su existencia no representa un lock ocupado: la ocupación la determina el lock del kernel.
- Mantener abierto el descriptor durante toda la operación protegida y hasta terminar el último uso del snapshot y las escrituras cubiertas.
- Toda entrada directa y delegada debe adquirir el mismo lock de instancia; Chronicle child adquiere el suyo. La delegación pura del padre no conserva el lock mientras espera al child.
- Mantener el orden D2: lock de instancia antes de cualquier lock per-store.
- Un fallo de adquisición produce contención/STOP; no se interpreta mediante PID, edad, token o borrado de path.

En esta forma, una terminación del proceso libera el lock cuando se cierran todos los descriptores que lo mantienen. Un proceso anterior que todavía conserve un descriptor no permite que un competidor cooperante adquiera el mismo lock. El archivo persistente no es un tombstone ni un marcador de cuarentena: es el objeto estable sobre el que el kernel coordina la exclusión.

### 11.3 Condiciones y límites que impiden declararlo solución

1. **Identidad estable:** si alguien elimina o reemplaza el archivo mientras un proceso conserva el lock, otro proceso puede abrir el nuevo objeto y obtener un lock independiente. Por eso la regla de no unlink/rename/replace es esencial; no basta con añadir `flock` al archivo temporal actual.
2. **Cooperación universal dentro del alcance:** al ser advisory, cualquier entrypoint, API o proceso capaz de leer/escribir los stores y que no adquiera el mismo lock puede eludirlo. El mapa D1 y el límite R1 deben cubrir todos los actores relevantes.
3. **Ciclo de vida de descriptores:** debe demostrarse que ningún hijo o proceso secundario puede continuar una escritura cubierta después de cerrar o perder el descriptor. La herencia accidental del descriptor tampoco debe prolongar la admisión más allá de la operación.
4. **Integración Node/CLI:** la opción `flock(1)` podría envolver entrypoints CLI, pero no protege por sí sola consumidores que importen APIs directamente. La solución de integración y la visibilidad del lock para procesos hijos siguen abiertas.
5. **Filesystem real:** las semánticas deben probarse en el filesystem privado Termux del dispositivo objetivo. La documentación Linux no acredita por sí sola el comportamiento del kernel, filesystem y montaje concretos del POCO.
6. **Integridad de negocio:** el lock no convierte las escrituras de Continuity/Chronicle en transacciones ni demuestra recuperación de una escritura parcial después de crash. Persistencia, release y readmisión siguen siendo dimensiones separadas.
7. **Modelo de amenaza:** no impide que un proceso no cooperativo o malicioso bajo el mismo UID ignore el lock o sustituya el archivo. No se debe presentar como frontera de seguridad frente a esos actores.

### 11.4 Evidencia necesaria antes de considerar B1

- Confirmar, sin instalar ni modificar nada por inferencia, si `flock(1)` está disponible en el Termux objetivo y qué implementación/versión es.
- Identificar el filesystem y montaje efectivos del HOME privado Termux mediante evidencia del dispositivo, cuando exista autorización para esa inspección.
- Demostrar contención entre dos procesos independientes sobre el mismo objeto y adquisición tras cierre de todos los descriptores.
- Demostrar comportamiento con terminación abrupta del owner, descriptor duplicado/heredado, child Chronicle, y cierre prematuro del descriptor.
- Demostrar que ninguna ruta normal elimina/reemplaza el archivo persistente y que todos los entrypoints/APIs dentro del alcance pasan por la misma admisión antes de leer stores.
- Ejecutar los casos E1–E9 aplicables con procesos competidores y SHA exacto, solo después de autorización específica de tests.

### 11.5 Dictamen de esta exploración

`flock(2)` es el primer candidato B concreto que merece una evaluación de viabilidad en Termux: su asociación con un descriptor y la liberación al cerrar todos los descriptores podrían eliminar la necesidad de limpiar un lock temporal por nombre y reducir la ambigüedad de release entre procesos cooperantes.

No está demostrado en el POCO, no se ha confirmado el binario instalado, no se ha integrado en Nexo y no se han probado sus condiciones de cooperación, identidad estable ni ciclo de vida de descriptores. Por tanto:

- B1 = **CANDIDATO PARA EVALUACIÓN — NO SELECCIONADO**.
- P05 = **OPEN**.
- D1/D2 = **OPEN**.
- No se modifica runtime, tests, workflows, configuración ni dispositivo.
- No se ejecutan tests, CI, comandos Termux ni pruebas de filesystem.
