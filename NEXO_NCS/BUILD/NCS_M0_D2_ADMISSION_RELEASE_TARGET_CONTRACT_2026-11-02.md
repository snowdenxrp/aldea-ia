# NCS M0 — contrato objetivo D2: admisión, release y readmisión

**Fecha:** 2026-11-02  
**Base de código de referencia:** `99dabcb33be1efef5c4f5e368dc95140e45ff672`  
**Rama documental:** `ncs-m0-documentary-reconciliation-2026-11-02`  
**Estado:** PROPUESTA TÉCNICA — NO RATIFICADA COMO IMPLEMENTACIÓN  
**Autorización:** no autoriza cambios de runtime, tests, workflows, CI, bootstrap ni acceso/modificación de la instancia real.

## 1. Propósito y restricciones heredadas

Este documento convierte las restricciones D2 ya ratificadas en un contrato de aceptación y delimita las decisiones P03/P04/P05 que siguen abiertas. No crea una nueva primitiva ni selecciona un mecanismo de recuperación.

Restricciones que no se reabren:
- O-08: una raíz explícita `--root`, sin fallback ambiental/legacy ni inicialización implícita en operación normal.
- O-10: admisión antes de toda lectura persistente del snapshot canónico dentro del alcance; read-only no es excepción.
- O-11: incertidumbre de release implica UNKNOWN/BLOCKED; no reintento de negocio ni readmisión insegura.
- O-07: repair fuera del alcance operativo M0; exclusión no equivale a inaccesibilidad técnica demostrada.
- La admisión de Chronicle pertenece al proceso child que ejecuta la operación. El padre no mantiene lock mientras espera al child.
- No stale deletion automático por edad/PID; no inferir quiescencia por ausencia de path.

## 2. Modelo de propiedad por operación

Cada operación que pueda leer Continuity/Chronicle debe tener un único propietario de admisión de instancia.

| Flujo | Propietario de admisión objetivo | Restricción |
|---|---|---|
| CLI Nexo: query/preview/mission | Proceso que ejecuta la operación admitida | Admisión antes de la primera lectura y durante el uso del snapshot |
| Chronicle append invocado directamente | Proceso Chronicle child | Valida `--root`, adquiere admisión y luego lee/escribe |
| CLI padre que delega a Chronicle | No retiene admisión durante espera del child | No herencia ni transferencia de lock; el child adquiere la suya |
| Helper puro / parser / validación de args | Ninguno | No puede leer stores persistidos |
| API que recibe snapshot ya cargado | Hereda la validez del flujo que produjo el snapshot | No debe reabrir o recargar stores fuera de admisión |
| Lúmina ordinary execution | Ninguno sobre Continuity Nexo | No convertir memoria Lúmina en snapshot operacional Nexo |

No se permite lock de instancia anidado/reentrante en el mismo flujo. Si un helper necesita leer snapshot, debe recibir datos ya cargados o formar parte de la operación que ya posee admisión.

## 3. Orden de locks

Contrato objetivo:

1. Validación pura de argumentos.
2. Resolución/canonicalización de root según O-08.
3. Adquisición de admisión de instancia.
4. Adquisición de lock per-store solo cuando la operación lo requiera.
5. Lectura/escritura del store.
6. Release del lock per-store.
7. Release de admisión de instancia.
8. Solo después de release confirmado, la operación termina en estado que permite readmisión normal.

Reglas:
- Orden único: instance admission → per-store lock.
- Nunca per-store lock → instance admission.
- Nunca adquirir la misma admisión de instancia de forma anidada.
- La sesión hija Chronicle es una nueva operación y adquiere su propia admisión antes de cualquier lectura.
- El lock per-store no sustituye la admisión de instancia.
- La admisión no debe depender de abrir primero Continuity o Chronicle.

La caracterización existente muestra locks per-store; no demuestra que ya exista la admisión única de instancia. No describir el protocolo objetivo como implementado.

## 4. Estados de resultado que deben mantenerse separados

No colapsar estos cuatro ejes:

| Eje | Pregunta |
|---|---|
| Resultado de negocio | ¿La operación produjo un resultado lógico? |
| Persistencia | ¿La escritura quedó confirmada o su resultado es incierto? |
| Propiedad/release | ¿Se demostró que el lock se liberó de forma segura? |
| Readmisión | ¿Está permitido iniciar una nueva operación sobre esa instancia? |

Ejemplos:
- Persistencia confirmada + release confirmado: negocio/persistencia confirmados; operación puede finalizar normalmente.
- Persistencia confirmada + release incierto: conservar el hecho de persistencia; release UNKNOWN; bloquear readmisión; no repetir negocio.
- Persistencia incierta + release confirmado: el resultado de negocio/persistencia sigue incierto; no reintentar automáticamente sin reconciliación explícita.
- Cualquier actor/objeto de lock no clasificable: UNKNOWN/BLOCKED.

El retorno de un método, la ausencia de excepción de negocio o el hecho de que el path del lock no exista no bastan por sí solos para declarar readmisión segura.

## 5. Identidad del objeto y retirada de lock

La implementación revisada contiene riesgos que deben tratarse como gates, no como defectos ya resueltos:
- token check seguido de retirada por path deja una ventana entre verificación y eliminación;
- Continuity mantiene un `lockReleaseFailures` local al proceso, sin cuarentena cross-process;
- la ruta de release intenta una segunda retirada por path sin demostrar que el path sigue designando el mismo objeto;
- Chronicle no muestra una cuarentena equivalente;
- un path ausente aislado no prueba que ningún actor conserve capacidad de escritura;
- PID/edad/timeout no prueban por sí solos quiescencia.

Criterio de aceptación:
- La retirada no puede alcanzar un lock reemplazado por otro actor.
- Una incertidumbre de identidad no puede resolverse borrando por path.
- No puede declararse FREE/ADMITTED para una operación nueva mientras el objeto anterior o el actor anterior puedan seguir activos.
- La evidencia debe cubrir proceso local y concurrencia entre procesos cooperativos, con límites explícitos para writers no cooperativos y procesos hostiles bajo el mismo UID.
- Si no se puede demostrar identidad/retirada segura, el estado permanece UNKNOWN/BLOCKED.

No se prescribe aquí `open/unlink`, inode pinning, hardlink, marcador persistente, token nuevo ni lock adicional. Cada mecanismo requiere análisis contra las primitivas reales y sus límites del filesystem antes de ser propuesto.

## 6. Readmisión y recuperación

P05 sigue OPEN. Para cualquier política futura, deben demostrarse todas estas condiciones:
1. El release anterior terminó o se resolvió de manera verificable.
2. El actor previo ya no puede reanudar una escritura sobre el estado protegido.
3. La identidad del objeto de lock que se va a retirar está verificada.
4. No existe un actor concurrente no clasificado con capacidad de escritura dentro del alcance acordado.
5. El resultado de negocio/persistencia previo está reconciliado sin repetirlo por defecto.
6. La nueva admisión se adquiere atómicamente y no por inferencia de ausencia.
7. La incertidumbre no se limpia mediante timeout, PID muerto, antigüedad o retry de negocio.

Si cualquiera de estas pruebas falta: UNKNOWN/BLOCKED. No hay readmisión automática, stale cleanup ni retry de negocio.

La quiescencia ambiental aceptada por R1 para la ventana de primera publicación no es automáticamente una política de recuperación D2. E2/E3 son criterios independientes de cierre M0 por decisión A; no convierten un snapshot puntual en prueba de quiescencia para recovery.

## 7. Casos de aceptación que D2 debe cubrir después de autorización

No son tests ejecutados ni autorizados en este documento. Son criterios para un futuro plan de pruebas:

| Caso | Resultado exigido |
|---|---|
| Dos procesos intentan admitir la misma instancia | Solo uno obtiene admisión; el otro no lee snapshot |
| Query read-only sin admisión | Rechazo antes de abrir/leer store |
| Chronicle child directo sin `--root` válido | Rechazo antes de cualquier lectura persistente |
| Padre delega a child | Padre no retiene lock; child adquiere su admisión |
| Intento de reentrada | Rechazo/STOP sin deadlock ni lectura adicional |
| Release normal | Identidad/release confirmados según protocolo |
| Release lanza error después de posible unlink | UNKNOWN/BLOCKED; no asumir que el lock sigue o no sigue |
| Path sustituido entre check y unlink | Nunca retirar objeto sustituto |
| Writer no cooperativo | Dentro de límites explícitos; no prometer exclusión que el protocolo no ofrece |
| Crash/interrupción durante operación | Resultado negocio/persistencia separado de release; sin retry automático |
| Proceso anterior puede reanudar | Readmisión bloqueada |
| Stale lock por edad/PID | No borrar automáticamente |
| Lock path ausente | No inferir FREE sin protocolo de adquisición/identidad |
| Chronicle release incierto | Mismo resultado conservador que Continuity |
| Quarantine local presente en un proceso y ausente en otro | No usar variable local como prueba global |

Cada test futuro debe ligarse a implementación y SHA exactos, y distinguir el test que demuestra la propiedad del test que solo demuestra un error esperado.

## 8. Decisiones todavía abiertas

| Gate | Qué falta | Estado |
|---|---|---|
| P03 alcance/duración | Definir el intervalo exacto de snapshot-use y fronteras de lectura | OPEN |
| P04 propietario/composición | Ratificar contrato completo de ownership por flujo y composición | OPEN |
| P05 release/readmisión | Seleccionar política segura de release incierto y recovery con límites demostrables | OPEN |
| P06 timeout/stale | Política de timeout y recuperación explícita; no asumir valores candidatos | OPEN |
| P07 filesystem/alias | Casos admitidos, symlinks, mounts, TOCTOU y límites | OPEN |
| P08 CLI/root | Gramática exacta y store mapping compatible con O-08 | OPEN |
| P09 callers | Aristas dinámicas/externas no resueltas y evidencia por SHA | OPEN |

El diseño no puede declarar D2 cerrado mientras P03/P04/P05 afecten la corrección de admisión/release. No seleccionar recovery A/B ni un diseño de lock por recomendación automática.

## 9. Límites de cierre M0

- D1: OPEN.
- D2: OPEN.
- D3: OPEN.
- E2/E3: PARTIAL, criterios independientes de cierre.
- Root legítima: PENDING/UNKNOWN.
- `authorization: NOT_EVALUATED`.
- `ROOT_READY`: NOT ESTABLISHED.
- `M0_BUILD_COMPLETE`: NOT ACHIEVED.
- Efectos protegidos: STOP.

La implementación, pruebas y CI requieren autorizaciones separadas. Este documento no las concede.

## 10. Estado de este artefacto

Documento de propuesta técnica en rama documental independiente. No modifica runtime, tests, workflows, package scripts, configuración Android/Termux ni el archivo real de Continuity. No ejecuta pruebas/CI, no modifica PR #110 y no selecciona una política de recovery. Su propósito es convertir las restricciones D2 ya conocidas en condiciones verificables y evitar que se inventen mecanismos durante una futura implementación.
