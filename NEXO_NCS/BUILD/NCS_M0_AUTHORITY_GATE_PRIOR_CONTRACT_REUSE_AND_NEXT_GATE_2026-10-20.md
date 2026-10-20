# NCS M0 — AuthorityGate: reutilización de contratos previos y siguiente puerta

Fecha: 2026-10-20  
Rama: `ncs-clean-architecture`  
Alcance: reconciliación documental dirigida; no se modifica runtime ni se repite investigación externa.

## Propósito

Evitar crear otro contrato genérico de raíz de confianza o volver a ejecutar ataques ya cerrados. La inspección de `AuthorityGate` del 2026-10-20 debe leerse junto con los contratos previos de STEP 7, que siguen siendo las fuentes arquitectónicas de esta frontera.

## Contratos previos encontrados y reutilizados

1. `BUILD/STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md` — blob observado `34a4a8ecef267bb1d27cb50e927b613d0ff0f499`. Define identidad de Constitución y Policy, dominio de autoridad, aplicabilidad, validez, dependencias y procedencia de establecimiento protegido. Expresamente no autoriza acciones concretas.
2. `BUILD/STEP_7_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_ATTACK_2026-10-08.md` — blob observado `0583066569748c0c563123f1b2711f7c54ba2675`. Ataque cerrado sin contradicción de raíz; deja pendiente establecer cómo Core obtiene el contexto constitucional sin aceptar metadatos de autoridad del caller.
3. `BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md` — blob observado `b93a2fd8e730d54bbe43493db137dc1b4d13d964`. Consolida roles y prohíbe inferir que la raíz o el contexto constitucional estén implementados. Su siguiente acción explícita es un inventario de deployment/failure domains relativo a claims y clases de efectos protegidos.
4. `BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md` — blob observado `d5ebabcb05566593e32f3e1f9bf1047f6b99e0c0`. Mantiene STOP antes de implementar un constructor/contexto que solo vestiría datos del caller como protegidos.
5. `STATUS_HANDOFF_2026-10-08_TRUST_ROOT_RESEARCH.md` — blob observado `9a83f9013f09f370f7f32627f54b5276d5d2e690`. Confirma que no se ha probado una Trust Foundation implementada, ni un dueño de Policy Authority, ni un camino actual de establecimiento de Constitution Authority Context.

No se encontró el path exacto `NEXO_NCS/BUILD/STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md` en la rama consultada; no se presume que exista bajo ese nombre. La búsqueda sí encontró un contrato relacionado en otro path/referencia; deberá usarse el path exacto confirmado antes de citarlo como archivo NCS.

## Síntesis sin contradicción

- El contrato Constitución→Policy y su ataque ya existen; no deben volver a diseñarse desde cero.
- El mapa de roles ya prohíbe convertir firma, hash, epoch, snapshot, provider PASS o etiqueta `trusted/authoritative` en legitimidad actual.
- La implementación Core actual de `AuthorityGate` sigue siendo un puerto inyectado. El test con `AUTHORIZED` prueba el flujo después de la decisión, no el establecimiento de la autoridad.
- El límite faltante no es otra validación de forma del objeto `AuthorityResult`. Es una fuente/procedencia de autoridad protegida, con actualidad, revocación/sucesión, dependencias y fallo-domain adecuados al claim, aplicada antes de efectos protegidos.
- No hay evidencia nueva que autorice implementación de una raíz, un registro, un quorum, un GenesisRoot o un constructor de Constitution Authority Context.

## Próxima puerta exacta — antes de cualquier implementación

Seguir el siguiente paso ya escrito en el Trust Function / Root Role Map: elaborar un inventario pequeño y claim-relative para las capacidades Nexo realmente en alcance y los efectos protegidos que se pretenden permitir. Por cada clase, registrar únicamente:

1. Claim/protected property y alcance exacto.
2. Último límite capaz de causar el efecto y cómo se comprueba su enforcement.
3. Evidencia de identidad de raíz y quién la reconoce, sin autocertificación.
4. Dependencias necesarias para currentness, revocación, sucesión y recuperación.
5. Dominios de fallo comunes; marcar UNKNOWN cuando la independencia no esté probada.
6. Qué evidencia existe en runtime/tests/CI y qué es solo diseño.
7. Resultado si cualquier premisa es desconocida: STOP para el efecto dependiente.

No seleccionar aún un mecanismo físico de raíz ni implementar un trust registry. El inventario debe mostrar si una frontera mínima es viable para una clase de claim concreta; si no, mantener esa clase bloqueada y documentar el requisito faltante.

## Estado

- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Efectos protegidos: `STOP`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Runtime y tests no modificados en esta revisión.
- No se ejecutó CI nuevo.
