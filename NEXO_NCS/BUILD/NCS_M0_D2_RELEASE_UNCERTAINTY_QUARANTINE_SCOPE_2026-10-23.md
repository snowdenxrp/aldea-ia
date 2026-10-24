# NCS M0 — D2: alcance de cuarentena tras release incierto y reintentos de retirada

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **HALLAZGO CONTRACTUAL PROPUESTO — D2 OPEN — SIN IMPLEMENTACIÓN**

## 1. Base revisada

- `NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md`, blob revisado: `bfa38a057033acf880afe331a47bb383e82e9a97`.
- `src/nexo/core/continuity-store.mjs`, blob previamente identificado: `9ffd28930abdbe29f5b041711cc29b74dc99fbae`.
- `src/nexo/core/chronicle-store.mjs`, blob previamente identificado: `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a`.
- Checkpoint contractual vigente: `NCS_M0_D0_D1_D2_D3_CROSS_CONTRACT_CHECKPOINT_2026-10-23.md`, blob `1a0c0167a6473d1a79b674c942bdef1424c346a8`.

Esto es revisión estática de documentos y fuentes identificadas, no ejecución ni prueba de incidente.

## 2. Hueco de contrato

La matriz D2 define `LOCK_RELEASE_UNCERTAIN` como bloqueo de nuevas operaciones mientras persista la incertidumbre y exige no reintentar la operación de negocio. Sin embargo, no termina de definir el **alcance de la cuarentena** ni cómo se coordina con un proceso que aún pueda estar ejecutando limpieza/reintento del lock.

Hay tres resultados distintos que no deben colapsarse:

1. **Resultado de negocio/persistencia:** confirmado, fallido antes de escribir o desconocido tras posible escritura.
2. **Resultado de liberación:** confirmada, fallida o incierta.
3. **Capacidad de nueva admisión:** bloqueada mientras el lock existente/ilegible o una liberación viva pueda afectar al path; solo reconsiderable después de una comprobación segura según el protocolo aprobado.

Una variable local del proceso que intentó liberar no puede, por sí sola, coordinar otros procesos. No obstante, tampoco se debe resolver esta limitación añadiendo automáticamente un marcador persistente, registro global o lock hermano: esas serían decisiones de diseño nuevas, actualmente no aprobadas.

## 3. Riesgo específico a comprobar

La fuente identificada de Continuity intenta la retirada recursiva del lock y puede reintentar una vez después de un error; Chronicle tiene un contrato de release distinto y devuelve fallo tras un intento. El protocolo propuesto de raíz también ha discutido token-check seguido de retirada por ruta.

En cualquier implementación con un segundo intento, debe analizarse la intercalación siguiente: primer intento falla o devuelve un resultado no concluyente; otro actor retira/reemplaza el path; el reintento actúa sobre la ruta reemplazada. La revisión no afirma que esta secuencia haya ocurrido ni que cada error de filesystem permita esa intercalación; señala que el contrato debe impedirla o probarla, en lugar de dar por segura la repetición de `rm(path)`.

El mismo análisis se aplica a la limpieza posterior a un fallo al crear/escribir `owner.json`. La posesión original del path no demuestra posesión de cualquier objeto que más tarde aparezca bajo ese mismo nombre.

## 4. Requisito de cierre propuesto

Antes de cerrar D2, el contrato debe elegir y probar una política para:

- si un proceso puede ejecutar recuperación externa mientras un release o una limpieza de owner sigue vivo;
- qué evidencia permite volver a admitir operaciones tras `release_uncertain`, sin confundir path ausente con liberación segura si aún puede existir un actor vivo;
- si se permiten reintentos de retirada del lock y cómo se garantiza que cada intento sigue dirigido a la misma instancia que se pretendía retirar;
- cómo se mantiene fail-closed ante owner ilegible, path reemplazado, permisos inciertos o limpieza incompleta;
- cómo se conserva el resultado de persistencia separado del resultado de release, sin retry automático del negocio.

Las alternativas a evaluar siguen siendo: recuperación externa exclusivamente offline con quiescencia demostrable, o un mecanismo de filesystem cuya identidad/retirada se pruebe bajo el modelo cooperativo acordado. Ninguna alternativa queda seleccionada aquí. No afirmar resistencia contra procesos locales hostiles.

## 5. Pruebas requeridas si se autoriza implementación

1. Inyección determinista de reemplazo entre la primera retirada fallida y cualquier segundo intento; el lock de reemplazo debe sobrevivir.
2. Inyección de reemplazo durante la limpieza tras fallo de escritura del owner; el reemplazo debe sobrevivir.
3. Persistencia confirmada + release incierto: se conserva el resultado confirmado y se bloquea reejecución de negocio.
4. Persistencia desconocida + release incierto: el resultado sigue UNKNOWN y no se reintenta negocio.
5. Proceso competidor durante release/recovery: no puede entrar mientras la identidad/estado del lock sea ambiguo.
6. Recuperación posterior con path presente, ausente, ilegible y reemplazado; cada resultado debe corresponder al contrato aprobado, sin éxito por inferencia.

Las pruebas anteriores son requisitos propuestos; **no se han escrito ni ejecutado**.

## 6. Estado y continuidad

Este addendum no cambia el contrato normativo, no elige política por el propietario y no autoriza implementación. No modifica runtime, tests ni workflows; no se ejecutaron tests ni CI.

Estado canónico: M0 `INCOMPLETO`; D0/D1/D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

Siguiente paso: contrastar este requisito con la matriz de estados D2 y el contrato de raíz, registrar el enlace en el checkpoint si la creación del addendum se verifica y continuar con revisión documental acotada de recuperación de bootstrap parcial.