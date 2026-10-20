# NCS M0 — alcance real de la prueba de bootstrap y brecha de runtime
Fecha: 2026-10-20
Rama: `ncs-clean-architecture`
HEAD de inspección: `bb57725f8cd1f0faa9528df82ed76a0fa0b5eba6`

## Pregunta comprobada

¿La prueba `tests/nexo/root-bootstrap-protocol.test.mjs` demuestra que Nexo puede reconocer una llave raíz legítima dentro de su runtime y usar ese reconocimiento para autorizar un efecto protegido?

**Respuesta: no.** Demuestra una propiedad criptográfica limitada de un vector de software. No es un fallo del test; su propio encabezado declara ese alcance.

## Evidencia directa

1. `package.json` incluye `node tests/nexo/root-bootstrap-protocol.test.mjs` en `npm test`.
2. El test usa un vector fijo: curva P-256, clave pública SPKI DER, fingerprint SHA-256, desafío fijo y firma ECDSA/SHA-256 fija. Comprueba el mensaje esperado, la verificación de la firma, un desafío alterado, una firma alterada, otra clave y una firma truncada.
3. El propio comentario del test declara que la clave y la firma son fixtures de prueba, no la raíz de Nexo; no incluye clave privada y deja abiertas la integración de hardware y la provisión independiente del pin.
4. La inspección del árbol Git del HEAD citado encuentra el test, pero no un módulo de runtime bajo `src/nexo` cuyo path implemente `root`, `bootstrap`, `trust` o `authority`. No se encontró un verificador de producción que consuma ese vector, un pin raíz provisionado fuera del estado que valida o un enlace hacia `authorityGate`/la transición protegida.
5. `src/nexo/core/ownership.mjs` expone `authorityGate.check` y `effectBoundary.prepare` como puertos. `src/nexo/core/protected-transition.mjs` llama a `authorityGate.check(claim)` y luego, tras las validaciones semánticas, a `conditionalCommit.commit(candidate)`; no llama a `effectBoundary.prepare`. La legitimidad del resultado `AUTHORIZED` depende del adaptador inyectado, y los tests de transición usan fixtures simulados.
6. El workflow determinista [39491191357](https://github.com/snowdenxrp/aldea-ia/actions/runs/39491191357) terminó SUCCESS en el SHA exacto citado. Eso confirma `npm test`, incluido el vector de software, no una integración de raíz real ni un camino autorizado de efectos protegidos.

## Clasificación exacta

- Vector criptográfico de prueba: **CUBIERTO por test**.
- Verificación de una raíz Nexo provisionada independientemente: **NO IMPLEMENTADA / NO DEMOSTRADA** en el árbol inspeccionado.
- Vínculo de raíz reconocida → Constitución vigente → Policy/contexto autenticado → claim específico → enforcement en el límite real: **NO DEMOSTRADO**.
- Explotación de un bypass de producción: **NO DEMOSTRADA** por esta inspección.
- Estado M0: **INCOMPLETO**; `authorization: NOT_EVALUATED`; raíz `PENDING/UNKNOWN`; efectos protegidos `STOP`.

## Próximo paso mínimo sin inventar arquitectura

No escribir un verificador de producción basado solo en el vector fijo. Primero el propietario debe revisar y aprobar explícitamente el objeto constitucional exacto según `NCS_M0_CONSTITUTION_OWNER_REVIEW_GUIDE_2026-10-20.md`; la guía todavía registra decisiones OPEN y prohíbe inferir aprobación de «continúa».

Después de esa aprobación, definir en un contrato mínimo y revisable:
- cómo se obtiene el pin raíz de una fuente independiente del estado que está validando;
- cómo se prueba que el verificador esperado es el que realmente se ejecuta;
- cómo se enlazan Constitución vigente, Policy, ámbito y claim concreto;
- cómo la decisión se aplica en el último límite de efecto y cómo se demuestra que no existe una ruta de efecto fuera de ese límite;
- qué casos negativos fuerzan STOP/UNKNOWN.

Solo entonces implementar el adaptador mínimo y una prueba integrada adversarial que muestre que un caller con `AUTHORIZED` autodeclarado no puede llegar al efecto sin procedencia raíz verificable. La prueba debe medir el sink real del scope seleccionado, no solo el retorno de una función. No provisionar llave, crear firma/digest constitucional ni iniciar commissioning antes de la revisión/aprobación del objeto exacto.

## Alcance CI

CI SUCCESS del SHA citado valida la suite configurada en ese SHA. No se atribuye automáticamente a commits posteriores. Revalidar el SHA exacto tras cualquier cambio de código o contrato.

