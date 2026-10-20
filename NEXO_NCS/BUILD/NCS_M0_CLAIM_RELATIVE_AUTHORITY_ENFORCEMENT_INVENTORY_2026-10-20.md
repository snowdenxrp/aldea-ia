# NCS M0 — inventario mínimo de claims y enforcement de autoridad

Fecha: 2026-10-20  
Rama: `ncs-clean-architecture`  
Tipo: consolidación claim-relative de evidencia existente; no se modifica runtime ni se repite investigación externa.

## Decisión de alcance

No se crea una raíz nueva ni se escoge un mecanismo físico. La primera frontera que necesita autoridad verificable es **el permiso actual del propietario para una transición protegida concreta**. La escritura local, una identidad de misión, una firma/hash/epoch o un resultado de fixture no sustituyen ese permiso.

Este inventario reutiliza el contrato Constitución→Policy, el mapa Trust Function/Root Role y los informes M0 de AuthorityGate/Chronicle. No reabre esos contratos.

## Matriz mínima

| Claim/capacidad existente | Último límite que puede permitir el efecto | Fuente de autoridad y actualidad | Dependencias / dominios de fallo | Evidencia observada | Resultado M0 |
|---|---|---|---|---|---|
| **Autorizar una transición protegida de Core** | `src/nexo/core/protected-transition.mjs`: tras `authorityGate.check(claim)`, un resultado `AUTHORIZED` permite continuar hacia validación y commit condicional. | `src/nexo/core/ownership.mjs` expone `authorityGate.check` como puerto inyectado. No se ha demostrado un adaptador conectado a una raíz legítima reconocida por Core. | Identidad de raíz, procedencia de establecimiento, ámbito del claim, Constitución/Policy aplicables, actualidad, revocación, sucesión/recuperación y dependencias: UNKNOWN. Independencia de los dominios de fallo: UNKNOWN. | `createAuthorityResult()` valida forma, no legitimidad. Los fixtures `AUTHORIZED` de `tests/nexo/protected-transition.test.mjs` prueban composición, no reconocimiento del propietario. | **STOP**. No hay prueba end-to-end que permita habilitar la transición. |
| **Append local de Chronicle con continuidad** | `src/nexo/adapters/chronicle-effect.mjs` + `src/nexo/core/owner-backed-runtime.mjs`; la API pública es `runNexoChronicleAppend()`. | La ruta registra `authorization: NOT_EVALUATED`; no conecta un AuthorityGate/root proof a la escritura local. | Integridad/idempotencia/continuidad local tiene contratos propios. No se acredita raíz constitucional, revocación/sucesión ni autorización del propietario para la escritura. | Inventario ya existente `NCS_M0_CLAIM_RELATIVE_CHRONICLE_APPEND_INVENTORY_2026-10-20.md`; los locks, journal y reconciliación prueban hechos locales limitados. | No elevar la persistencia local a autoridad. La autorización sigue **NOT_EVALUATED**; no usar este caso como prueba de raíz. |
| **Dispatch de reparación / efectos de reparación** | La ruta legacy visible incluye `scripts/nexo-repair-entrypoint.mjs`; la ruta owner-backed bloquea acciones de reparación antes de PREPARED mientras falte el contrato de settlement. | No se ha demostrado una autoridad legítima end-to-end aplicada en el último límite de dispatch. | Verificación de estado externo, identidad del objetivo, actualidad, reconciliación/settlement y autoridad siguen separados; dominios de fallo y raíz actual: UNKNOWN. | `NCS_M0_LEGACY_EFFECT_PATH_VS_OWNER_BACKED_2026-10-19.md` no encontró caller de producción actual para APIs legacy inspeccionadas, pero eso no prueba desactivación global ni autoriza su uso. `owner-backed-runtime.mjs` bloquea reparación en la ruta examinada. | **STOP** para tratarlo como capacidad autorizada. No afirmar que toda ruta legacy esté globalmente deshabilitada. |

## Fuente normativa y reconocimiento técnico

- Fuente normativa conceptual: el propietario humano y los límites de la Constitución.
- Decisión de alcance aceptada: una llave raíz y un dispositivo inicial; tipo de llave, provisión física y verificación concreta siguen pendientes. El dispositivo es canal/entorno, no autoridad por sí solo.
- Reconocimiento técnico requerido: Core debe comprobar una prueba de raíz cuya procedencia no dependa del caller, vinculada al claim y a su ámbito, y evaluar actualidad/revocación/sucesión/dependencias antes del límite final.
- El contexto Constitución→Policy ya tiene contrato de diseño. No debe reconstruirse ni sustituirse por un constructor que sólo envuelva metadatos del caller.
- No se ha demostrado un bypass activo por estos artefactos; se ha demostrado una brecha de evidencia: no hay una ruta concreta, actual y verificable de raíz legítima a decisión de autoridad aplicada al efecto.

## Puerta siguiente

La matriz no autoriza implementación de una raíz, trust registry, quorum ni `GenesisRoot`. Tampoco permite cerrar M0. El siguiente paso debe limitarse a fijar el **contrato de reconocimiento de la única llave raíz dentro del alcance inicial ya aceptado**: qué evidencia de provisión/reconocimiento puede verificar Core, cómo se liga al claim y a su ámbito, cómo se expresa currentness/revocación/sucesión y qué falla en STOP/UNKNOWN. La selección física/provisión permanece pendiente; no inventar una ceremonia ni codificar un bootstrap sin esa evidencia.

Si no puede describirse una fuente de raíz verificable sin autocertificación, registrar la dependencia exacta como `PENDING/UNKNOWN` y mantener los efectos protegidos en STOP. No reabrir la investigación general de familias de raíces.

## Estado

M0 `INCOMPLETO`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`; raíz legítima en runtime `PENDING/UNKNOWN`. No se modificó runtime, no se ejecutaron pruebas y no se declara CI nuevo para este inventario.


## Precisión adicional — forma de PolicyContext frente al contrato Constitución→Policy (2026-10-20)

Revisión estática acotada de los contratos existentes en la rama:

- `src/nexo/core/contracts.mjs`, blob `ec811ffd24d178c294345d9e6f65a9e3bfd82ea1`: `createPolicyContext()` valida y reconstruye únicamente `policyRef`, `scope`, `resolved`, `validity` y `resolutionProvenance`. No acepta ni conserva un `constitutionRef`, autoridad constitucional vigente o procedencia protegida del contexto constitucional.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md`, blob `34a4a8ecef267bb1d27cb50e927b613d0ff0f499`, exige que el vínculo establezca identidad de Constitución, identidad de Policy, dominio de autoridad, aplicabilidad, vigencia, dependencias y procedencia de establecimiento por el camino protegido.
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_REUSE_AUDIT_2026-10-08.md`, blob `e81abbfb35048dcb2cf29f8827db7e67d239adf9`, ya declara cerrado el resultado de búsqueda: no se encontró un camino Core implementado que establezca el contexto constitucional actual. Esta precisión confirma ese límite; no abre una nueva investigación ni contradice el contrato semántico.
- `tests/nexo/protected-transition.test.mjs` usa fixtures que devuelven `AUTHORIZED`; esas pruebas ejercitan la composición de la transición y no demuestran vínculo Constitución→Policy ni reconocimiento de raíz.

**Conclusión acotada:** el objeto `policyContext` actual es un portador de datos de Policy, no un contexto constitucional autenticado. No se debe “arreglar” agregando campos de Constitución al input del caller: eso trasladaría metadatos no autenticados, no resolvería la procedencia y violaría el contrato anti-self-attestation. No se encontró evidencia que justifique un cambio de runtime en esta revisión.

**Siguiente dependencia real:** primero debe estabilizarse y recibir revisión explícita el artefacto constitucional, según la guía del propietario; después puede definirse cómo el límite protegido obtiene un contexto constitucional desde una base raíz reconocida. Hasta entonces: raíz `PENDING/UNKNOWN`, `authorization: NOT_EVALUATED`, efectos protegidos `STOP`, M0 `INCOMPLETO`. No se declara CI nuevo por este análisis documental.
