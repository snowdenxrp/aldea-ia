# NCS M0-E — contrato mínimo de integración: análisis de brecha, no implementación
Fecha: 2026-10-21
Rama de lectura solicitada: `ncs-clean-architecture`
Estado: **DISEÑO / PENDING — no autoriza runtime, firma ni commissioning**

## Propósito y límite

Este documento convierte la inspección focal en una frontera de trabajo concreta. No declara el HEAD de la rama: las herramientas consultadas permiten leer archivos por nombre de rama, pero no exponen una lectura inequívoca del ref SHA actual. Los resultados de CI no se atribuyen al estado actual hasta resolver esa referencia y encontrar un run cuyo SHA coincida exactamente.

Tampoco declara que haya un exploit productivo. El hallazgo probado es de contrato/integración: el Core permite inyectar el resultado de autoridad y no invoca el puerto de frontera de efecto en la ruta examinada.

## Artefactos y observaciones directas

- `src/nexo/core/ownership.mjs`, blob leído `3b66d07e67df09b058b37716716573f6c17a2099`: `createCorePorts()` expone `authorityGate.check`, `conditionalCommit.commit` y `effectBoundary.prepare`. Los puertos faltantes fallan con `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED`; no se encuentra una implementación concreta de raíz aquí.
- `src/nexo/core/protected-transition.mjs`, blob leído `39a602b80cda8f3939b2ffed7e726d06c21b077f`: valida el resultado de `authorityGate.check(claim)`; si su estado es `AUTHORIZED` y la validación semántica pasa, crea el outcome y llama a `conditionalCommit.commit(candidate)`. No llama a `effectBoundary.prepare`.
- `tests/nexo/root-bootstrap-protocol.test.mjs`, blob leído `996c031224ba4544d8982ca4fd1762e9d4f44dc0`: valida un vector fijo P-256/ECDSA, explícitamente de software y no raíz provisionada de Nexo.
- `src/nexo/core/contracts.mjs`, blob leído `ec811ffd24d178c294345d9e6f65a9e3bfd82ea1`: el contrato de `PolicyContext` contiene referencias de policy, scope, resolución, validez y procedencia. La forma del objeto por sí sola no establece quién emitió ni legitimó esos datos.
- `NEXO_NCS/BUILD/NCS_M0_ACCEPTANCE_MATRIX_2026-10-20.md`, blob `f85a8822bcf40424e8b902c1803bf1510bb481cd`: ya clasifica M0-E como `PENDING / BLOQUEANTE`; no es necesario reabrir la auditoría general.
- `NEXO_NCS/BUILD/NCS_M0_CANONICAL_PREPARED_RECEIPT_TRUST_BOUNDARY_AUDIT_2026-10-19.md`, blob `b1c3804c29ee867b35b409e81908b4dfa902555d`: su disposición posterior aclara que el adaptador en el mismo proceso no es sandbox contra código arbitrario del mismo proceso. No reabrir esa API como si una forma de objeto fuese una frontera de seguridad.

## Brecha exacta

No está demostrado un camino integrado de:

**fuente de raíz/procedencia legítima → verificador ejecutado y confiable → Constitución exacta vigente → Policy/contexto gobernante → claim/operación acotada → enforcement en el último límite del efecto.**

La aceptación de los puntos constitucionales 1–7 como base del borrador define principios, pero no resuelve por sí misma el origen del pin raíz, el estado canónico, la identidad del verificador, el sink cubierto ni la procedencia de Genesis. Tampoco demuestra que el verificador esté implementado.

## Contrato mínimo que debe hacerse explícito antes de implementar

1. **Fuente de confianza:** declarar qué dato o mecanismo preexistente permite reconocer la raíz y por qué no se autentica a sí mismo desde el estado que pretende proteger. La selección/provisión de la llave sigue pendiente.
2. **Objeto gobernante exacto:** una Constitución que el propietario haya aprobado expresamente como revisión exacta, con representación/canonicalización definida. Aceptar como base del borrador no basta para activarla.
3. **Currentness:** declarar cómo se obtiene la revisión actualmente vigente, y cómo conflicto, revocación, rollback, desconexión o estado no verificable se convierten en `UNKNOWN/STOP`. No inventar un owner de estado canónico.
4. **Verificador:** identificar el código/configuración que verifica la procedencia y el modo de probar que es el que realmente se ejecuta; la existencia de una función de verificación o un test-vector no es suficiente.
5. **Contexto/Policy:** construir el contexto desde fuentes gobernantes verificadas. No aceptar del caller un campo `AUTHORIZED`, root, Constitución o Policy como prueba de autoridad.
6. **Límite real:** nombrar el sink concreto en scope y enumerar las rutas por las que puede alcanzarse. La transición debe exigir la decisión autorizadora en ese límite; llamar a un puerto no conectado o comprobarlo solo en una función superior no demuestra cierre de rutas alternativas.
7. **Estados negativos:** ausencia, firma inválida, clave equivocada, revisión sustituida/obsoleta, revocación, conflicto, contexto incompleto, verificador no disponible y fallo del sink deben producir STOP/UNKNOWN según el punto de fallo, sin efectos ni redispatch inferido.
8. **Evidencia:** pruebas adversariales miden tanto la decisión como la ausencia de invocación del sink cuando no existe procedencia válida; CI debe identificar run, job y SHA exactos.

Estos puntos son obligaciones de diseño derivadas de M0-E, no decisiones constitucionales nuevas ni una especificación completa de implementación. Antes de escribir runtime, cada uno debe mapearse al contrato existente y al sink del alcance; solo preguntar al propietario cuando una decisión de autoridad que no esté ya registrada sea estrictamente necesaria.

## Criterio de cierre M0-E

M0-E no pasa hasta que:
- el objeto constitucional exacto esté aprobado explícitamente para gobernar el scope inicial;
- exista procedencia raíz verificable e independiente del caller;
- la ruta runtime real aplique Constitución/Policy/contexto al claim concreto;
- la frontera del efecto no pueda evitar el enforcement dentro del scope probado;
- los casos negativos mantengan el sink sin invocación;
- la prueba integrada y CI tengan evidencia reproducible ligada al SHA exacto.

Un test que solo inyecta `AUTHORIZED`, un test vector criptográfico, un commit documental o un workflow verde sin esta integración no satisfacen M0-E.

## Próxima acción

1. Resolver el acceso al SHA exacto de `refs/heads/ncs-clean-architecture`; no inferirlo de commits recientes globales ni de un blob aislado.
2. Obtener CI para el SHA actual o ejecutar el workflow determinista sobre el SHA final que se vaya a aceptar.
3. Inspeccionar solo si el contrato/sink cambió desde los blobs aquí anotados.
4. Si no cambió, continuar con el contrato técnico mínimo y una prueba adversarial focal; no repetir auditorías B/C/D ni implementar una raíz ficticia.

## Estado conservador

M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
