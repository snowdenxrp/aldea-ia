# NCS M0-E — plan adversarial de aceptación para la frontera de efectos
Fecha: 2026-10-21
Rama de trabajo: `ncs-clean-architecture`
Estado: **PLAN DE PRUEBAS / NO ES IMPLEMENTACIÓN / NO CI PASS**

## Propósito

Convertir la brecha M0-E en un conjunto pequeño y verificable de pruebas adversariales. Este documento no elige ni provisiona una raíz, no aprueba la Constitución, no define por sí solo el estado canónico y no autoriza efectos protegidos.

## Base observada

- `tests/nexo/protected-transition.test.mjs` (blob consultado `65353fe9e20898fb13f225ee004240b6c54687f1`) contiene múltiples casos fail-closed para resultados malformados, `UNKNOWN`, `STOP` y validación semántica. Su helper `makePorts()` también usa `authorityGate.check` que devuelve `AUTHORIZED` y un `conditionalCommit.commit` que confirma el commit; es un fixture de control de flujo, no una prueba de procedencia legítima.
- `tests/nexo/root-bootstrap-protocol.test.mjs` (blob `996c031224ba4544d8982ca4fd1762e9d4f44dc0`) valida un vector P-256/ECDSA conocido. El archivo declara explícitamente que la clave y la firma no son la raíz de Nexo.
- `src/nexo/core/ownership.mjs` (blob `3b66d07e67df09b058b37716716573f6c17a2099`) expone `effectBoundary.prepare`, pero el fallback es `NOT_IMPLEMENTED`.
- `src/nexo/core/protected-transition.mjs` (blob `39a602b80cda8f3939b2ffed7e726d06c21b077f`) consulta `authorityGate.check` y puede llegar a `conditionalCommit.commit(candidate)` sin invocar `effectBoundary.prepare`.
- `PolicyContext` valida la forma de referencias, scope, resolución, validez y procedencia declarada; la forma por sí sola no demuestra quién emitió los datos ni su legitimidad.

## Principio de prueba

Cada caso debe observar tanto el resultado de la operación como el contador del sink protegido. Un resultado `UNKNOWN` o `STOP` sin comprobar que el sink no fue invocado es evidencia incompleta. Igualmente, una llamada al sink no es aceptable solo porque un fixture haya devuelto `AUTHORIZED`.

El sink se debe nombrar al cerrar el contrato. `conditionalCommit.commit` solo puede tratarse como sink de efectos externos si la implementación y el alcance del sistema demuestran que lo es; si es un commit de estado interno, la aceptación debe seguir hasta el sink real de efectos externos. No asumir esa equivalencia.

## Matriz adversarial mínima

| ID | Escenario | Resultado exigido | Observación del límite |
|---|---|---|---|
| E-01 | Falta la fuente de raíz o su procedencia | `UNKNOWN/STOP`; sink invocado 0 veces | No convertir un estado ausente en raíz predeterminada |
| E-02 | El llamante aporta `AUTHORIZED`, `rootProof`, Constitución o Policy autodeclarados | Rechazo/UNKNOWN; sink invocado 0 veces | Los datos del llamante no pueden autenticar su propia autoridad |
| E-03 | Firma inválida, clave distinta o formato de prueba alterado | `UNKNOWN/STOP`; sink invocado 0 veces | El vector criptográfico existente sigue siendo una prueba de primitiva, no una raíz |
| E-04 | Constitución distinta de la revisión exacta aprobada | `UNKNOWN/STOP`; sink invocado 0 veces | Comparar contenido canónico exacto, no solo nombre o revisión declarada |
| E-05 | Vigencia no verificable, revocación, rollback o conflicto de estado canónico | `UNKNOWN/STOP`; sink invocado 0 veces | La recencia no prueba legitimidad |
| E-06 | Policy/contexto incompleto, contradictorio, obsoleto o sin procedencia verificable | `UNKNOWN/STOP`; sink invocado 0 veces | El objeto de forma válida no equivale a fuente válida |
| E-07 | Verificador no disponible, fallo o configuración distinta de la que se esperaba ejecutar | `UNKNOWN/STOP`; sink invocado 0 veces | Probar el verificador realmente conectado, no solo una función aislada |
| E-08 | Ruta alternativa llega al mismo sink sin pasar por el control | La ruta queda bloqueada; sink invocado 0 veces | Inventariar todos los callers/rutas dentro del alcance acordado |
| E-09 | Sink falla o su resultado es incierto después de registrar intención | Resultado de reconciliación/UNKNOWN según contrato; no redispatch por inferencia | Reutilizar los contratos M0-D existentes; no duplicar su auditoría |
| E-10 | Camino positivo con raíz independiente, Constitución exacta vigente, Policy/contexto verificados y claim dentro del alcance | Solo el efecto permitido por el contrato; evidencia vinculada al claim y revisión gobernante | No se puede marcar PASS hasta definir y provisionar de forma legítima las fuentes requeridas |

## Requisitos para que las pruebas cuenten como aceptación

1. Identificar el objeto constitucional exacto y su representación canónica; aprobación expresa del propietario para ese objeto, no solo aceptación como base del borrador.
2. Definir la fuente independiente de confianza y su procedencia. No crear una clave/pin ficticio ni tratar un vector de test como raíz.
3. Identificar el verificador y demostrar que el flujo de ejecución usa esa implementación/configuración.
4. Nombrar el sink externo protegido y documentar las rutas de acceso incluidas en el alcance.
5. Hacer que los casos negativos comprueben simultáneamente decisión fail-closed y ausencia de invocación del sink.
6. Hacer que el caso positivo use los mismos controles reales de procedencia, vigencia, Policy/contexto y enforcement; no inyectar un resultado final `AUTHORIZED` como sustituto.
7. Integrar los casos en la puerta de aceptación acordada y enlazar run, job y SHA exactos.

## Qué se puede hacer ahora y qué no

**Se puede hacer ahora:** conservar este plan, mapear los casos a los tests existentes, determinar cuál es el sink real y preparar el inventario de rutas de acceso sin cambiar semántica.

**No se debe hacer todavía:** implementar una raíz de prueba como raíz de Nexo, generar digest/firma o commissioning de la Constitución, elegir unilateralmente la fuente canónica, o cambiar runtime para simular que el propietario ya aprobó un objeto constitucional exacto.

## Criterio de salida de M0-E

M0-E solo puede pasar cuando la procedencia legítima y el objeto constitucional exacto gobiernan la operación hasta el sink real; los casos negativos bloquean el sink; las rutas alternativas dentro del alcance están cerradas; y la suite reproducible pasa en el SHA evaluado.

Una suite verde sin esta integración no cierra M0-E.

## Estado conservador

M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
