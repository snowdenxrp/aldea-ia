# NCS — handoff de continuidad M0-E (2026-10-22)

**Propósito:** continuar el trabajo de Nexo/M0 en un chat nuevo sin repetir auditorías, sin confundir documentos con implementación y sin cambiar el estado constitucional.

## Instrucción de arranque

En el chat nuevo, escribe exactamente `NCS` y pega o referencia este handoff. Lee primero `NEXO_NCS/STATUS.md`, después este handoff y los dos contratos existentes que se enumeran abajo. Continúa desde la siguiente puerta concreta; no vuelvas a empezar STEP 7, M0-A/B/C/D ni las auditorías AB/P ya cerradas salvo evidencia nueva y específica.

Repositorio: `github.com/snowdenxrp/aldea-ia`  
Rama: `ncs-clean-architecture`  
HEAD verificado en esta sesión: `7875878dd41b06c95fee4f8edea3f7d7c0253488`  
STATUS blob: `7802aeab7e331be4985354f1ebc43b7fa08ff654`

## Estado canónico — no reinterpretar

- M0: **INCOMPLETO**.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: **PENDING/UNKNOWN**.
- Efectos protegidos: **STOP**.
- Constitución: puntos 1–7 aceptados solo como base del borrador; no aprobación completa, congelación, firma ni commissioning.
- Opción A: alcance inicial provisional; permite evaluar capacidades internas no protegidas, no habilita efectos protegidos.
- `chronicle_append` en la CLI auditada es persistencia local, no evidencia de autoridad constitucional.
- Ningún fixture `AUTHORIZED`, firma/hash, snapshot, dato de caller, proveedor o salida de modelo se debe tratar como prueba de raíz legítima.

## Evidencia persistente recién verificada

1. Inventario M0-E: [NCS_M0_E_CLAIM_RELATIVE_AUTHORITY_BOUNDARY_INVENTORY_2026-10-22.md](NEXO_NCS/BUILD/NCS_M0_E_CLAIM_RELATIVE_AUTHORITY_BOUNDARY_INVENTORY_2026-10-22.md)  
   Blob: `8f7f81966663236783f9550c907db1e14fd18392`.  
   Commit documental de inventario: `d6585c6744aa3debd6c6c4dcf9710ba2f72454f7`.

2. STATUS enlaza el inventario y conserva el estado canónico. Commit que actualizó STATUS: `7875878dd41b06c95fee4f8edea3f7d7c0253488`. CI que se había verificado para ese SHA: run `39711860061`, resultado `success`: https://github.com/snowdenxrp/aldea-ia/actions/runs/39711860061. Es éxito de CI para ese commit documental, no prueba de una nueva implementación ni de autoridad real.

3. Contrato de base de confianza inicial:  
   `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`  
   Blob observado: `e65df41ff98f7e53a8574ca5295a947023cb8b30`.  
   Estado: `DESIGN CANDIDATE — ATTACK REQUIRED`. Define reconocimiento independiente, independencia/failure domains, actualidad/revocación/sucesión/recuperación y procedencia protegida; no selecciona proveedor/hardware y prohíbe self-bootstrap.

4. Contrato Constitución→Policy:  
   `NEXO_NCS/BUILD/STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md`  
   Blob observado: `34a4a8ecef267bb1d27cb50e927b613d0ff0f499`.  
   Estado: `DESIGN CANDIDATE — ATTACK REQUIRED`. Exige identidad exacta de Constitución y Policy, dominio, aplicabilidad, validez, dependencias y procedencia de establecimiento protegido. No autoriza una acción concreta.

5. Reutilización y siguiente puerta:  
   `NEXO_NCS/BUILD/NCS_M0_AUTHORITY_GATE_PRIOR_CONTRACT_REUSE_AND_NEXT_GATE_2026-10-20.md`  
   Blob: `f73fefce4ea27bc848def43155976a82890b6c6c`.  
   La siguiente puerta ya indicada fue inventariar clases de claim/efecto y sus límites reales; ese inventario ya está guardado en el punto 1. No crear otro contrato genérico de raíz, trust registry, GenesisRoot, selector de autoridad ni envoltura para disimular la brecha.

## Hallazgos de runtime y tests comprobados

- `src/nexo/core/ownership.mjs` crea el puerto `effectBoundary.prepare`, cuyo fallback es `NOT_IMPLEMENTED`.
- `src/nexo/core/protected-transition.mjs` llama `authorityGate.check(claim)`; si el resultado tiene `AUTHORIZED`, continúa snapshot → candidate → validación semántica → `conditionalCommit.commit(candidate)`. No invoca `effectBoundary.prepare`.
- `conditionalCommit` es un puerto; no se ha demostrado que sea el sink de efectos externos reales. No afirmar un bypass productivo ni alcance universal de callers.
- `tests/nexo/protected-transition.test.mjs` cubre fail-closed para resultados `STOP`, `UNKNOWN`, forma malformada, candidato inválido y snapshots con alias. Los fixtures `AUTHORIZED` prueban el flujo posterior a un gate inyectado; no prueban raíz, vigencia o Constitución/Policy legítimas.
- `src/nexo/core/contracts.mjs` construye `ClaimEnvelope` y proyecta `policyContext` solo a campos de Policy; campos caller-supplied como `rootProof`, `constitutionRef` o `authorization` no se elevan a contexto confiable.
- Los contratos Genesis y Constitución→Policy siguen sin estar conectados a una fuente de raíz/procedencia real dentro del runtime inspeccionado.

## Siguiente trabajo exacto

### 1. Preparar la puerta de pruebas M0-E, no simular que está cerrada

Antes de escribir pruebas nuevas, revisar el cuerpo completo de:
- `tests/nexo/protected-transition.test.mjs`
- `tests/nexo/root-bootstrap-protocol.test.mjs`
- tests de owner-backed runtime que cubren la exclusión de acciones fuera de `chronicle_append`
- `src/nexo/core/protected-transition.mjs`, `ownership.mjs` y `contracts.mjs`.

Reusar los casos existentes. No añadir otro test que solo repita que el fixture `UNKNOWN` no llega a commit. Tampoco agregar un test cuyo resultado sea tautológicamente el mismo que el código que se acaba de escribir.

### 2. Resolver primero la dependencia arquitectónica real

La brecha pendiente no es de forma de `AuthorityResult`; es que falta una base inicial independiente y un contexto constitucional vigente, vinculado a la Policy, cuya procedencia no provenga del caller. Si los contratos y artefactos existentes no especifican cómo establecer esa base para el entorno real del usuario, **no implementar una raíz ficticia**. Registrar el requisito exacto y conservar STOP para esa clase de efecto.

No tomar como decisión ya aceptada un mecanismo de hardware, dispositivo, operador, proveedor, clave o recovery. No pedir al usuario que apruebe mecánicamente opciones nuevas; avanzar con análisis y evidencias hasta que una decisión del propietario sea genuinamente necesaria.

### 3. Criterios mínimos de la futura prueba integrada

Para la misma operación y claim, la prueba final deberá demostrar:
1. Procedencia de raíz establecida por una base independiente del store/artefacto que pretende autorizar.
2. Identidad exacta de Constitución que gobierna esa operación y su estado de aprobación vigente.
3. Binding Constitución→Policy exacto (hash/version/dominio/aplicabilidad/dependencias/validez), sin metadatos confiados desde el caller.
4. Evaluación de autoridad actual, revocación y conflictos según los contratos existentes.
5. Decisión específica para acción, recurso, target/incarnation y contexto.
6. Enforcement en la última frontera capaz de mutar, no solo en un caller previo; ante STOP/UNKNOWN no se llama al sink y no hay mutación.
7. Evidencia de resultado/reconciliación, sin convertir commit local en prueba de efecto externo.
8. Pruebas adversariales para raíz ausente, root/Policy falsificados por caller, hash/revisión discordantes, dependencia desconocida, revocación/conflicto y cambio de estado entre autorización y efecto; el test debe observar cero llamadas al sink en todos los casos que deben bloquearse.
9. CI reproducible ligado al SHA exacto del candidato.

No crear nuevas IDs/colas/retries/tombstones/epochs/fences/transaction wrappers salvo que un contrato existente y evidencia concreta demuestren que son necesarios; antes, identificar la raíz del problema.

### 4. No mezclar el trabajo de presupuesto de recursos

Los valores de Chronicle/Continuity propuestos el 2026-10-22 (stdin/content 256 KiB; Chronicle document 32 MiB/10,000 entries; snapshot 16 MiB; cardinalidades propuestas) siguen **CANDIDATE / NOT ACCEPTED / NOT IMPLEMENTED**. No codificarlos hasta aceptación explícita. La lectura acotada de archivos existentes antes de decode/parse también está pendiente; medir un Buffer después de leerlo entero no es un límite de memoria. Mantener este trabajo separado de M0-E.

## Restricciones de continuidad del propietario

- Meta actual: **crear Nexo; M0 es el objetivo técnico**, no volver a M1 ni convertir M0 en un chatbot.
- Arquitectura limpia y coherente; si se descubre que la estructura está mal, detenerse y resolver raíz, no acumular parches ocultos.
- El usuario delega la investigación y espera avance autónomo: no preguntar por cada microdecisión. Pero “continúa sin límites” **no** aprueba números, Constitución completa, root provisioning, commissioning ni efectos protegidos.
- No afirmar que código, tests, CI o archivos se modificaron salvo evidencia exacta.
- Guardar resultados en el repositorio y actualizar `NEXO_NCS/STATUS.md`; evitar un nuevo resumen redundante cuando una implementación/prueba real sea el siguiente avance.
- No reiniciar auditorías históricas cerradas AB104.759R, AB104.999R→AB105.000R, AB104.151, P112, AB105.116R, TLC, P34/P35 salvo evidencia nueva y específica.

## Estado al cerrar este handoff

Esta entrega es **documentación de continuidad**. No contiene cambios de runtime ni afirma que se haya añadido o ejecutado una prueba nueva. El próximo chat debe continuar desde M0-E con el estado canónico conservador arriba indicado, comprobar el HEAD actual antes de escribir y avanzar solo donde exista un enforcement real demostrable.
