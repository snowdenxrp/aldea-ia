# NCS M0 — contrato compartido de espera acotada de locks (decisión A)
Fecha: 2026-10-20
Estado: **PRESUPUESTO ACEPTADO; IMPLEMENTACIÓN INICIAL Y PRUEBAS EN CI PASS; INTEGRACIÓN/REVISIÓN AÚN ABIERTAS**.
Rama de trabajo: `ncs-clean-architecture`.
Misión: M0.

## 1. Decisión adoptada

Se adopta la opción A: la primera versión interactiva de Nexo requiere espera acotada para adquirir locks de Continuity y Chronicle. No se acepta espera indefinida como comportamiento normal.

Se acepta un presupuesto inicial de **2.000 ms**, configurable desde la frontera de aplicación/runtime. Es un presupuesto de espera cooperativa de adquisición, no una garantía de tiempo de pared. No debe duplicarse como constantes independientes en cada store.

## 2. Alcance exacto del deadline

- Un caller de aplicación/runtime que inicia una operación interactiva establece un único deadline monotónico absoluto.
- Ese mismo deadline se propaga por las mutaciones de Continuity y Chronicle que formen parte de la operación. No se reinicia el presupuesto al entrar a otro store ni en cada iteración de espera.
- El deadline sólo limita la espera para adquirir el lock. No se usa para cancelar una escritura, un rename, la reconciliación de un resultado incierto ni la liberación de un lock ya adquirido.
- Las operaciones del filesystem no se consideran interruptibles. Por tanto, el contrato garantiza que la lógica de espera no seguirá iniciando intentos después de detectar el vencimiento; no garantiza por sí solo un límite de tiempo de pared estricto si una llamada de filesystem queda bloqueada.
- La fuente monotónica, la unidad, la validación del deadline y la forma de pasarlo a stores deben ser únicas y explícitas en el runtime. No usar `Date.now()` como reloj para medir duración; el reloj de pared actual se mantiene únicamente para la comprobación de antigüedad del lock existente.

## 3. Semántica de expiración y resultados

La expiración antes de obtener propiedad del lock devuelve un resultado de dominio inequívoco, distinto de lock stale, estado del lock desconocido, error de filesystem, conflicto de revisión y resultado de persistencia desconocido.

Nombres de códigos propuestos para el contrato (a validar contra convenciones existentes antes de implementar):
- Continuity: `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT`
- Chronicle: `NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT`

Reglas obligatorias:
1. El timeout de adquisición sólo significa que la fase protegida de escritura no empezó en esa llamada. No se representa como `committed`, `conflict`, ni `persistence UNKNOWN`.
2. Si una llamada de `mkdir` termina adquiriendo el lock después de que el deadline haya vencido, no debe entrar a la fase de escritura; debe liberar únicamente el lock que pueda demostrar que posee y devolver timeout. Si la liberación falla, conservar explícitamente ambos hechos (timeout de adquisición y resultado de liberación) sin fingir que el lock quedó liberado.
3. El timeout no puede borrar ni reclamar locks ajenos, convertir stale en timeout si el stale ya se detectó, ni ocultar errores/estado desconocido de la inspección del lock.
4. Los contratos públicos de `initialize`, `commitIfCurrent` y `append` deben documentar cómo exponen timeout. No filtrar una excepción OS sin clasificar desde un camino que el contrato define como resultado estructurado; no normalizar otras superficies por conveniencia sin inventariar sus consumidores.
5. La liberación de lock y el resultado de persistencia continúan siendo hechos independientes. No sobrescribir una recepción de persistencia ya determinada con un estado de timeout posterior.

## 4. Regla de seguridad de callers y efectos

- Si el timeout sucede antes de confirmar PREPARED, no se despacha el efecto.
- Si ya existía PREPARED, o pudo haberse despachado un efecto externo, el timeout no autoriza redispatch ni reintento ciego. Se debe recargar el estado canónico y reconciliar la operación existente.
- Si el timeout ocurre al intentar persistir una liquidación/outcome, el caller mantiene el resultado sin resolver según la evidencia disponible; no lo convierte en fallo definitivo ni en éxito por el solo hecho del timeout.
- Un timeout nunca es autorización. Se mantienen `authorization: NOT_EVALUATED` y efectos protegidos `STOP`.

## 5. Pruebas obligatorias antes de cerrar el cambio

### Adquisición
- lock válido retenido por proceso vivo más allá del deadline;
- liberación del lock justo antes y justo después del deadline, sin resultados no deterministas en el contrato;
- deadline ya vencido antes de iniciar adquisición;
- `mkdir` que falla por error de filesystem;
- owner ausente/incompleto, owner corrupto, lock stale y lock state unknown;
- lock adquirido por una llamada que se resuelve después del deadline: no se permite escritura y se comprueba liberación propia;
- fallo al liberar tras vencer el deadline, preservando el estado de liberación.

### Concurrencia y persistencia
- dos escritores con la misma revisión esperada: como máximo uno `committed`; el otro conflicto o timeout según el orden observado;
- conservar resultados de escritura/rename y recibos de liberación ambiguos ya cubiertos;
- no convertir expiración de adquisición en persistencia desconocida cuando ninguna escritura comenzó;
- verificar el comportamiento de Continuity y Chronicle bajo la misma semántica de deadline.

### Integración M0
- timeout al persistir PREPARED impide dispatch;
- timeout durante settlement/outcome no produce segundo dispatch;
- reinicio y reconciliación usan el envelope canónico;
- todos los workflows relevantes corren contra un único SHA exacto que incluya runtime, pruebas y documentos;
- prueba de que el deadline no se reinicia entre mutaciones anidadas.

## 6. Orden de implementación — sin saltos

1. Inventariar firmas públicas, todos los callers y los estados de resultado existentes para Continuity y Chronicle. El inventario de callers del 2026-10-20 es punto de partida, no sustituto de revisar firmas y pruebas actuales.
2. Definir una única abstracción mínima de deadline monotónico compartida; no introducir un framework general de cancelación, timers de watchdog, lease, heartbeat ni reclamación automática.
3. Definir y probar el contrato de expiración de ambos stores, incluidos los resultados cuando se vence antes de lock y cuando la llamada de adquisición devuelve tardíamente.
4. Propagar el mismo deadline desde las fronteras de aplicación/runtime que orquestan operaciones compuestas.
5. Añadir pruebas de integración de PREPARED/settlement/restart que prueben no-dispatch y no-redispatch.
6. Ejecutar la matriz CI M0 pertinente sobre un SHA exacto, revisar resultados y registrar evidencia cruda antes de marcar cualquier estado.
7. Si una fase revela que el contrato existente no puede sostenerse sin rediseño, detenerse y explicar la causa raíz antes de añadir parches.

## 7. Decisiones que permanecen abiertas

- **Presupuesto numérico inicial:** decidido: 2.000 ms configurable. La validación de pruebas puede justificar cambiarlo, pero no cambiarlo silenciosamente ni convertirlo en una constante por store.
- **Comportamiento de API por cada método público:** debe mapearse en la fase 1, respetando las diferencias existentes entre resultados estructurados y excepciones.
- **Respuesta estricta de pared:** no se promete, porque las operaciones del filesystem no están demostradas como interruptibles. El requisito aceptado es acotar la espera cooperativa de adquisición, no cancelar operaciones de filesystem.
- **Política de retry/reconciliación:** no se inventa; permanece subordinada a la evidencia canónica y a las invariantes ya existentes.

## 8. Estado de seguridad y evidencia

La implementación inicial y los tests están en el SHA `cf62bd858232a8c0c71f21ace6469c2a62f48448`; seis workflows M0 relevantes terminaron `success` en ese SHA. Esto no cierra M0 ni prueba autoridad legítima. La revisión de integración/propagación y los escenarios de adquisición tardía siguen abiertos:
- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- Raíz legítima: `PENDING/UNKNOWN`.
- No hay afirmación nueva sobre durabilidad ante pérdida de energía, resistencia a procesos locales hostiles ni autoridad legítima del propietario.

Referencias previas:
- `NEXO_NCS/BUILD/NCS_M0_LOCK_CONTENTION_CONTRACT_DESIGN_REVIEW_2026-10-19.md`
- `NEXO_NCS/BUILD/NCS_M0_LOCK_CONTENTION_PUBLIC_CALLER_AUDIT_2026-10-20.md`
- CI de código/pruebas previo a este diseño (no valida este contrato ni cambios futuros): SHA `b133c8c392739a0912f7b0466650a25962ead267`; runs 39372728077, 39372728055, 39372728046, 39372728141, 39372728127.


## 9. Implementación inicial registrada (2026-10-20)

- Nuevo helper `src/nexo/core/lock-deadline.mjs`: reloj monotónico `performance.now()`, presupuesto inicial `NEXO_DEFAULT_LOCK_WAIT_MS = 2_000`, creación/resolución de deadline y consulta de tiempo restante.
- Ambos stores comprueban el deadline antes de iniciar otra adquisición y limitan el sueño de reintento al tiempo restante.
- Si `mkdir` obtiene el lock después de expirar el deadline, no empieza lectura/escritura protegida; intenta liberar el lock usando el token de propiedad de la llamada y adjunta el resultado de liberación al timeout.
- Resultados públicos iniciales:
  - Continuity: `status:"failed"`, código `NEXO_CONTINUITY_STORE_LOCK_ACQUISITION_TIMEOUT`, `phase:"lock_acquisition"`, `writeStarted:false`.
  - Chronicle: `status:"blocked"`, código `NEXO_CHRONICLE_LOCK_ACQUISITION_TIMEOUT`, `phase:"lock_acquisition"`, `writeStarted:false`.
  - Si la adquisición tardía no puede liberar el lock, el resultado conserva `lockRelease`; no se afirma liberación exitosa.
- `runNexoChronicleAppend` crea un único deadline monotónico y lo comparte entre los stores Continuity/Chronicle y el owner; el parámetro configurable `lockWaitMs` tiene default 2.000 ms. Stores utilizados por separado obtienen un presupuesto por mutación si no reciben deadline compartido.
- Añadidas pruebas de lock vivo retenido: timeout de Continuity initialize/commit y Chronicle initialize/append, comprobando que no se escribe y que la revisión/archivo canónico no cambia.
- CI observado en SHA exacto `cf62bd858232a8c0c71f21ace6469c2a62f48448`:
  - [M0 integrated acceptance](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455204) — success
  - [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455208) — success
  - [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455212) — success
  - [Mission admission/restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455161) — success
  - [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455195) — success
  - [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375455201) — success
- Limitación no resuelta: las llamadas filesystem pueden exceder el presupuesto si ellas mismas no retornan; no se afirma límite estricto de pared. Faltan pruebas específicas de adquisición que retorna tarde y falla de liberación en ese caso, además de revisión de propagación por otras fronteras de aplicación.


### Follow-up verification — late acquisition (2026-10-20)

- Added deterministic injected-filesystem tests where `mkdir` returns only after the deadline for both stores.
- Both stores verify that the late-acquired lock is released and no canonical file is initialized.
- Added release-failure tests for late-acquired locks in both stores. Continuity preserves `status:"failed", code:...TIMEOUT` plus `lockRelease:{status:"failed", code:"EACCES", initialCode:"EACCES"}`; Chronicle preserves timeout plus `lockRelease:{status:"failed", code:"EACCES"}`. Neither reports a successful release.
- All six relevant workflows passed against code/test SHA `15415580788c4e823f03371b566e29106268b67d`:
  - [M0 integrated acceptance](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730407)
  - [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730358)
  - [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730428)
  - [Mission admission/restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730355)
  - [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730370)
  - [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39375730363)
- Raw logs inspected for jobs `118473315380`, `118473315369`, and `118473336472`; no failures reported.


### Follow-up verification — public propagation and PREPARED gate

- Timeout metadata is preserved through the Chronicle application boundary, Chronicle effect handler, public result projection, and CLI JSON output.
- Added tests prove a PREPARED lock-acquisition timeout remains blocked with `dispatchAttempted:false`; no adapter dispatch occurs.
- Added app integration tests for Chronicle initialization timeout and Continuity bootstrap timeout; both retain the distinct timeout code, phase, and no-write evidence.
- Code/tests SHA `12efac26d0948b91c59706612edec7df9e78c4f5`; all six relevant workflows succeeded:
  - [M0 integrated acceptance](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376332936)
  - [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376332981)
  - [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376333167)
  - [Mission admission/restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376332955)
  - [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376332991)
  - [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376333035)
  - [Repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39376333016)
- Note: the mission admission/restart run ID above must be the exact workflow run associated with this SHA; if it cannot be confirmed, treat it as pending and verify from the run API before using as evidence.
