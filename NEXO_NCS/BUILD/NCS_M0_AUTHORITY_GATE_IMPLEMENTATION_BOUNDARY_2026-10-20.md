# NCS M0 — AuthorityGate: frontera entre contrato y autoridad legítima

Fecha: 2026-10-20  
Rama objetivo: `ncs-clean-architecture`  
Tipo de evidencia: inspección estática de fuente y pruebas; no se ejecutaron tests nuevos en esta revisión.

## Resultado ejecutivo

**La composición protegida está implementada como pipeline contractual; la autoridad legítima no queda demostrada por ese pipeline.** No se debe cerrar M0 ni habilitar efectos protegidos por el hecho de que un puerto devuelva `AUTHORIZED`.

## Evidencia de fuente observada

- `src/nexo/core/contracts.mjs`, blob observado `ec811ffd24d178c294345d9e6f65a9e3bfd82ea1`: `createAuthorityResult()` acepta los estados `AUTHORIZED`, `STOP`, `UNKNOWN` y conserva `reasons/evidence`. El contrato valida la forma del resultado, no acredita por sí mismo la legitimidad de la autoridad.
- `src/nexo/core/ownership.mjs`, blob observado `3b66d07e67df09b058b37716716573f6c17a2099`: `createCorePorts()` recibe `authorityGate.check` como puerto inyectado; si falta, el comportamiento predeterminado lanza `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED`. No hay aquí un verificador de raíz legítima.
- `src/nexo/core/protected-transition.mjs`, blob observado `39a602b80cda8f3939b2ffed7e726d06c21b077f`: el pipeline valida la forma del resultado y detiene el flujo para `STOP` o `UNKNOWN`; si el puerto devuelve `AUTHORIZED`, continúa a aislamiento, candidato, validación semántica y commit condicional. Esa decisión delega la semántica de autorización al puerto; no prueba que el puerto esté conectado a evidencia de raíz legítima.
- `tests/nexo/protected-transition.test.mjs`, blob observado `19e30c957100b41bd65222a46335a7f7b1748824`: varios fixtures crean `createAuthorityResult(AUTHORITY.AUTHORIZED)` directamente para probar la composición. Esto prueba el comportamiento posterior a una autorización simulada, no una ceremonia de provisión, autenticación del propietario, verificación de clave raíz, currentness, revocación ni resistencia a pérdida de dispositivos.
- `NEXO_NCS/BUILD/STEP_3B_PROTECTED_TRANSITION_2026-10-08.md`: documenta la composición y explícitamente separa la composición de los efectos externos, fencing distribuido, reconciliación y seguridad de producción.

## Interpretación acotada

No es correcto clasificar el puerto inyectable como bypass demostrado: es una frontera de composición deliberada. Sí es correcto afirmar que **la implementación concreta y verificable de AuthorityGate con autoridad legítima no queda probada por estos artefactos**. Los fixtures `AUTHORIZED` son pruebas unitarias de composición, no prueba de propietario real.

No se encontró evidencia suficiente en esta inspección para afirmar que exista una ceremonia inicial de provisión implementada, una raíz legítima recuperable tras pérdida de todos los teléfonos, ni una ruta real de arranque de Nexo que conecte dicha prueba con la frontera de efectos protegidos.

## Decisión operativa M0

- M0 permanece `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- Raíz legítima: `PENDING/UNKNOWN`.
- No convertir un `AuthorityResult(AUTHORIZED)` fabricado por fixture o por adaptador arbitrario en evidencia de autoridad constitucional.
- No inventar un nuevo registro de confianza, `GenesisRoot`, quorum, ceremonia física ni mecanismo de recuperación para llenar el hueco.
- No cambiar `protected-transition.mjs` para endurecer la forma de un resultado como sustituto de la raíz ausente; la forma ya se valida. La siguiente tarea debe reutilizar decisiones/contratos existentes y demostrar qué implementación concreta de AuthorityGate, si alguna, existe y cómo se conecta a la frontera real.
- Antes de cualquier habilitación: definir/evidenciar la relación entre prueba de raíz legítima, contexto de autoridad actual (incluyendo epoch/fence/revocación aplicables), claim específico y enforcement inmediatamente anterior al efecto; añadir pruebas negativas de ausencia, UNKNOWN, estado obsoleto, raíz no reconocida y cambio/revocación. No afirmar que esas pruebas existen hasta ejecutarlas.

## Qué se cierra y qué no

Cerrado en esta revisión: inspección estática de los contratos de autoridad, composición protegida, fábrica de puertos y fixtures de prueba citados.

Pendiente: localizar/evidenciar una implementación concreta y legítima de AuthorityGate y su integración de extremo a extremo. Esta nota no es una auditoría completa de todos los archivos del repositorio, no contiene ejecución nueva de CI y no cambia runtime ni autorización.
