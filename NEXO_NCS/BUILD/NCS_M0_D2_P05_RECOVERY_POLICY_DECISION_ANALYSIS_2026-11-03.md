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
