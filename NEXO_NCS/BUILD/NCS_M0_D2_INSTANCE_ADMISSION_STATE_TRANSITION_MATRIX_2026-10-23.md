# NCS M0 — matriz candidata de estados/transiciones de admisión de instancia

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **DISEÑO PROPUESTO — D2 OPEN — SIN IMPLEMENTACIÓN**  
Base revisada: contrato de raíz blob `bac9493af98c3f86001e323dab153bdee78b5f31`; checkpoint de revisión dirigida commit `5e34fdfd9b8a08b06e5488581e28aefcc3a7b6f6`.

## 0. Propósito y límites

Esta matriz hace explícitos los estados que el protocolo D2 debe distinguir. No elige por el propietario las políticas D0-C1/C2/C3/C4, no declara que exista una raíz legítima y no autoriza runtime. No se deben introducir marcadores persistentes, locks hermanos, IDs, colas, retries de negocio ni mecanismos de recuperación adicionales solo para hacer que una transición parezca resoluble.

Invariantes candidatos:
- Ninguna operación normal crea la raíz, inicializa stores o migra datos.
- Ningún caller lee/materializa snapshots protegidos antes de adquirir admisión.
- Solo el proceso que demuestra propiedad de la instancia de lock puede operar y liberar.
- Estado dudoso → `UNKNOWN/BLOCKED`; nunca éxito por inferencia.
- Adquirir un lock no concede autoridad constitucional ni permite repair/dispatch/efectos protegidos.
- Si el estado de persistencia ya cambió o es ambiguo, no repetir la operación de negocio automáticamente.

## 1. Estados conceptuales

| Estado | Significado verificable | Operación permitida |
|---|---|---|
| `ROOT_ABSENT` | La ruta configurada no existe. | Rechazar operación normal sin mutaciones. Bootstrap solo si D0-C2/D2 define un protocolo explícito y aprobado. |
| `ROOT_INVALID` | Ruta relativa/no permitida, tipo incorrecto, canonicalización fallida o política de alias/symlink no resuelta. | Bloquear antes de abrir stores. No crear, borrar ni corregir automáticamente. |
| `ROOT_READY` | Raíz existente, directorio y validada bajo la política de configuración que se apruebe. | Intentar admisión; todavía no implica que el lock esté libre ni que stores estén válidos. |
| `LOCK_ABSENT` | No existe el directorio de lock reservado dentro de una raíz validada. | Un proceso intenta creación atómica; el éxito de `mkdir` concede solo la candidatura a propietario del directorio, no permiso de operar antes de escribir/verificar owner. |
| `LOCK_OWNER_WRITING` | Un proceso creó el directorio y aún está creando el owner record. | Solo el creador continúa la creación; contendientes que observan `ENOENT` pueden reintentar dentro de un presupuesto acotado candidato. No leer stores ni ejecutar la operación. |
| `LOCK_OWNED` | Owner record válido, límites y tipo aceptables, token de la operación conocido y propiedad aún confirmada. | Ejecutar la sección crítica bajo admisión; adquirir locks per-store en el orden aprobado. |
| `LOCK_BUSY` | Existe lock y owner válido de otro proceso, sin evidencia suficiente para recuperación. | Esperar dentro del presupuesto o devolver timeout; no borrar ni modificar el lock ajeno. |
| `LOCK_STALE_CANDIDATE` | Señales candidatas de lock antiguo, como edad/PID, según política aún no aprobada. | No borrar automáticamente; devolver recuperación explícita requerida. PID/edad no prueban por sí solos que sea seguro borrar. |
| `LOCK_UNKNOWN` | Owner corrupto, ilegible, tipo inesperado, permisos inciertos, token no válido o estado ambiguo. | Bloquear. No tratar como libre ni como stale de forma automática. |
| `OPERATION_IN_PROGRESS` | El propietario de admisión ejecuta la operación completa, incluyendo snapshots dentro del alcance elegido. | Mantener admisión hasta el final de la sección crítica; sin reentrada ni adquisición raíz anidada. |
| `PERSISTENCE_CONFIRMED` | Hay evidencia del resultado persistido según el contrato del store. | Registrar resultado de negocio observado; intentar liberar el lock. |
| `PERSISTENCE_UNKNOWN` | Una excepción/fallo ocurrió tras posible inicio de escritura y no se puede demostrar el estado final. | No reintentar la operación de negocio; informar UNKNOWN y proceder con liberación según el protocolo sin ocultar la ambigüedad. |
| `LOCK_RELEASING` | El proceso verifica el token y realiza la acción de liberación. | La política debe definir cómo evitar que una eliminación por ruta alcance un lock reemplazado. |
| `LOCK_RELEASED` | Se confirmó que la instancia propia del lock ya no existe. | La operación puede devolver el resultado de negocio observado, con release confirmado. |
| `LOCK_RELEASE_UNCERTAIN` | No se pudo confirmar liberación o la propiedad quedó dudosa. | No reportar éxito limpio; cuarentena local de nuevas operaciones mientras persista incertidumbre; recuperación explícita. No retry de negocio. |
| `BOOTSTRAP_PARTIAL` | Raíz creada, owner incompleto, store ausente o inicialización interrumpida. | UNKNOWN/BLOCKED. La recuperación debe ser explícita y separada; no inferir que es una instancia nueva y no reparar automáticamente. |

## 2. Transiciones y guardas mínimas

| Desde → hacia | Condición de transición | Fallo seguro requerido | Evidencia de prueba necesaria |
|---|---|---|---|
| `ROOT_ABSENT → bootstrap` | Solo operación bootstrap explícita y protocolo D0-C2/D2 aprobado. | Si no hay coordinación demostrada, no crear nada; BLOCKED/UNKNOWN. | Dos procesos concurrentes, crash/fallo en cada punto de creación, cero inicialización doble. |
| `ROOT_READY → LOCK_ABSENT` | Inspección de lock en raíz validada. | Errores de filesystem/inspección no equivalen a ausencia. | ENOENT vs permisos/tipo incorrecto/symlink, sin mutación fuera de raíz. |
| `LOCK_ABSENT → LOCK_OWNER_WRITING` | `mkdir` atómico exitoso. | El creador aún no ejecuta operación; solo completa owner y valida su propio estado. | Competencia real entre procesos; un único creador. |
| `LOCK_OWNER_WRITING → LOCK_OWNED` | Owner escrito y vuelto a leer/validado conforme al contrato aprobado. | Fallo parcial: no operar; limpieza no debe borrar un lock reemplazado. | Fallos antes/durante/después de escribir owner, owner truncado, sustitución inyectada. |
| `LOCK_OWNER_WRITING → LOCK_BUSY/UNKNOWN` | Otro proceso observa owner ausente durante la ventana de creación o persiste ausente. | Solo `ENOENT` transitorio puede reintentarse; pasado el presupuesto, UNKNOWN. | Owner ausente transitorio/persistente y prueba de timeout. |
| `LOCK_BUSY → LOCK_OWNED` | Solo tras desaparición confirmada del lock y nueva adquisición atómica propia. | Nunca “robar” lock por PID/edad. | Carrera de salida de dueño y dos contendientes; solo un ganador. |
| `LOCK_BUSY → LOCK_STALE_CANDIDATE` | Criterios candidatos de stale satisfechos. | No borrar automáticamente; exigir recuperación explícita. | PID vivo/muerto, owner corrupto y reloj/edad límite. |
| `LOCK_OWNED → OPERATION_IN_PROGRESS` | Propiedad confirmada y contexto de admisión pasado a helpers. | Si falla la verificación, no abrir stores. | No-bypass estático y tests cross-process de entrypoints. |
| `OPERATION_IN_PROGRESS → PERSISTENCE_CONFIRMED` | Store informa resultado observable confirmado. | Preservar la semántica existente del resultado de negocio. | Commit/append normal y lectura posterior independiente. |
| `OPERATION_IN_PROGRESS → PERSISTENCE_UNKNOWN` | Fallo tras posible comienzo de escritura o resultado no concluyente. | No afirmar rollback ni éxito; no reintentar negocio. | Inyección en write/rename/revisión y captura de bytes/hash/revisión. |
| `PERSISTENCE_* → LOCK_RELEASING` | Operación termina o lanza excepción. | Liberar en finally sin sobrescribir la información de persistencia. | Excepciones en cada fase, incluidas las previas a write. |
| `LOCK_RELEASING → LOCK_RELEASED` | Se confirma liberación de la misma instancia de lock que se poseía. | Si identidad del objeto a borrar no se puede garantizar bajo el modelo escogido, no reclamar release confirmado. | Reemplazo inyectado entre validación y retirada. |
| `LOCK_RELEASING → LOCK_RELEASE_UNCERTAIN` | Fallo de rm, token diferente o inspección ambigua. | No borrar reemplazo, no retry de negocio, bloquear admisión local hasta recuperación explícita. | Fallo de rm, owner sustituido, lock persistente y reintento posterior bloqueado. |
| `BOOTSTRAP_PARTIAL → ROOT_READY` | Solo recuperación explícita, con protocolo aprobado y evidencia de integridad. | Sin protocolo, permanecer BLOCKED/UNKNOWN. | Interrupción en cada paso y recuperación reproducible sin sobreescritura de datos existentes. |

## 3. Huecos que la tabla no resuelve automáticamente

### 3.1 Primer bootstrap

El lock dentro de la raíz no puede coordinar la creación de la propia raíz antes de que exista. Tampoco demuestra que una raíz existente pero parcialmente inicializada esté lista. D0-C2/D2 deben decidir y probar cómo se serializa el primer bootstrap, qué mutaciones son permitidas antes de admisión, cómo se reconoce la inicialización parcial y cómo se recupera sin adivinar. No introducir un lock hermano o marcador persistente sin decisión explícita y necesidad demostrada.

### 3.2 Retirada del lock

El patrón “leer token → comparar → borrar recursivamente la ruta” contiene una ventana check/use si una entidad puede retirar/reemplazar el directorio entre operaciones. El contrato debe elegir: (a) recuperación externa solo con todos los escritores detenidos y ausencia de liberaciones vivas, demostrada operacionalmente; o (b) mecanismo de retirada que vincule la operación al objeto de lock verificado. No afirmar que releer el token por sí solo cierra la ventana.

### 3.3 Owner record y limpieza de creación fallida

El creador puede fallar tras crear el directorio o al escribir owner. Toda limpieza debe evitar eliminar un directorio que ya no sea el que creó el proceso. Si no puede demostrarse, conservar estado y devolver UNKNOWN/BLOCKED para recuperación explícita.

### 3.4 Persistencia vs admisión

El estado de negocio/persistencia y el estado del lock son dimensiones separadas. Una operación persistida y un release incierto no equivalen a “falló la operación” y no autorizan retry. Una escritura ambigua no equivale a rollback y tampoco autoriza retry. Los consumidores deben poder ver ambos resultados sin confundirlos.

### 3.5 Límite del modelo

Este protocolo candidato coordina procesos cooperantes en un filesystem bajo el modelo acordado. No es sandbox, no resuelve ataques de proceso local hostil, TOCTOU general, bind mounts, alias de filesystem no caracterizados, fsync/durabilidad frente a pérdida de energía, autoridad constitucional ni límite exacto de heap/disco.

## 4. Gates de salida D2

D2 no puede cerrarse hasta que:
- D0-C1/C2/C3/C4 aplicables estén resueltos por el propietario o explícitamente acotados;
- el estado de bootstrap y recuperación parcial tenga un protocolo completo;
- la política de recuperación externa durante release esté decidida;
- se caractericen las diferencias de locks per-store sin borrar sus semánticas;
- existan pruebas deterministas de carreras y pruebas cross-process de primer uso;
- el contrato diferencie resultado de persistencia, resultado de negocio y resultado de liberación;
- la implementación sea autorizada por separado y las pruebas/CI se ejecuten contra el SHA exacto.

Estado canónico: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
