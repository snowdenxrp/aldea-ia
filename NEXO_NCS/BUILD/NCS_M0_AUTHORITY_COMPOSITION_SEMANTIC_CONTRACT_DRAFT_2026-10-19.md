# Nexo M0 — contrato semántico mínimo de composición de autoridad (borrador)

Fecha: 2026-10-19  
Estado: **BORRADOR DE CONTRATO — NO HABILITA DISPATCH; composición física aún no seleccionada**  
Dependencias reutilizadas: `NCS_M0_AUTHORITY_ADMISSION_GAP_2026-10-19.md`, `STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md`, `STEP_7_BOOTSTRAP_ROOT_CLASSES_FUTURE_COUNTEREFFECTS_ATTACK_2026-10-08.md`, `NEXO_AUTHORITY_FOUNDATION_BOOTSTRAP_NO_ROOT_DISASTER_RECOVERY_RESEARCH_V1_2026-09-24.md`, AB105.077R y AB105.078R.

## 1. Propósito y límite

Este borrador define qué debe demostrar una futura composición de raíz antes de permitir que el runtime evalúe una autorización. No elige hardware, secreto, biometría, teléfono, proveedor, organización, persona, quorum o ceremonia como raíz. No crea una raíz desde datos del caller y no cambia el estado de efectos protegidos.

La brecha actual permanece: el runtime no consulta una raíz ni una decisión de autorización; la API pública Chronicle ahora expone `authorization: "NOT_EVALUATED"` de forma explícita. El settlement local no equivale a permiso.

## 2. Capas que no pueden colapsarse

`ROOT COMPOSITION` → `CURRENT AUTHORITY` → `AUTHORIZATION DECISION` → `PROTECTED EFFECT ADMISSION` → `EFFECT OUTCOME / RECONCILIATION`

Cada capa necesita evidencia propia. Una capa posterior no puede inferir ni fabricar la anterior.

- **Root composition:** determina si las pruebas permitidas establecen una fundación de confianza independiente.
- **Current authority:** determina si la autoridad resultante sigue vigente y no está revocada o cercada.
- **Authorization decision:** evalúa principal, acción, recurso, contexto y alcance concretos.
- **Protected effect admission:** aplica la decisión vigente en el límite real anterior al dispatch.
- **Outcome/reconciliation:** demuestra qué ocurrió con el efecto; no demuestra que se autorizó.

## 3. Resultados: reutilizar vocabularios canónicos; no crear un enum agregado

Este borrador **no introduce un nuevo vocabulario de estados de runtime**. La semántica ya está repartida entre contratos que tienen propietarios distintos:

- **Composición bootstrap:** reutilizar `ESTABLISHED / UNKNOWN / INVALID` del `STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md`, siempre para el claim y alcance exactos. `ESTABLISHED` no equivale a autoridad constitucional ni autoriza una acción.
- **Pérdida de raíz / raíces incompatibles:** conservar las condiciones históricas `AUTHORITY_UNAVAILABLE` y `AUTHORITY_UNRESOLVED` de la investigación de bootstrap/recuperación. No resolver ramas incompatibles por mayoría, antigüedad, timestamp, orden de llegada ni “última credencial” sin una regla constitucional previa y evidenciada.
- **Decisión de autorización:** reutilizar los estados ya definidos por AB105.077R/AB105.078R; en particular, no colapsar `STALE` y `REVOKED`. Una solicitud de revocación no demuestra enforcement.
- **Admisión protegida:** mientras el runtime no demuestre evaluación de autoridad actual en la frontera final, la salida pública sigue siendo `authorization: "NOT_EVALUATED"` y los efectos protegidos permanecen STOP.

La evidencia incompleta sigue siendo `UNKNOWN`; una condición requerida refutada puede ser `INVALID` dentro del contrato que la evalúa. Estas palabras no son credenciales, ni el resultado de una capa puede fabricar el de otra.

## 4. Independencia y anti-recursión

La composición no puede derivar su legitimidad exclusivamente de:
- el store de continuidad de Nexo o un snapshot restaurado;
- el modelo/proveedor de IA;
- el teléfono o sistema operativo en uso;
- un objeto/contexto construido a partir de inputs no autenticados del caller;
- el resultado de la propia operación que intenta autorizar.

Una firma, hash, estado de arranque medido, archivo válido o test PASS puede respaldar una afirmación limitada; ninguno establece por sí solo la legitimidad constitucional. Si todas las fuentes disponibles comparten el mismo estado perdido o comprometido, la composición no es independiente.

## 5. Recuperación y revocación

La futura composición debe demostrar que el propietario legítimo puede ser reconocido después de perder todos los teléfonos y reinstalar Nexo, sin tratar una copia restaurada como raíz. La recuperación debe tener una base previamente establecida e independiente del estado recuperado, producir evidencia auditable y cercar autoridad obsoleta. Si esa base no existe o no puede verificarse, el resultado correcto es `UNAVAILABLE/UNKNOWN/STOP`, no una recuperación privilegiada automática.

La revocación solicitada no equivale a revocación aplicada. La decisión de autorización debe seguir vigente en el límite de admisión del efecto; si no puede demostrarse frescura/enforcement o existe una carrera de revocación, se bloquea. No basta validar al inicio y reutilizar una autorización indefinidamente.

## 6. Alcance y no-amplificación

La composición debe declarar qué afirmación respalda y su alcance. No puede ampliar permisos al combinar pruebas; una recuperación no puede convertirse en super-root. El modelo de sucesión es independiente, no se activa en este contrato y no deriva de la capacidad técnica de cambiar de dispositivo o implementación.

Las operaciones locales de Chronicle pueden validar persistencia/replay como prototipo, pero su éxito no es evidencia de autorización constitucional. Acciones externas, financieras, irreversibles, reparación de estado externo y cambios constitucionales permanecen fuera de la capacidad autorizada actual.

## 7. Puerta de implementación

No se implementa un verificador de raíz ni se conecta al dispatch hasta que una decisión revisable y evidencia independiente respondan:

1. qué clases de evidencia pueden participar y qué afirmación respalda cada una;
2. qué dependencia común invalida su independencia;
3. cómo se compone el resultado y se resuelven conflictos sin heurísticas improvisadas;
4. quién establece/provisiona la composición inicial y cómo se prueba que no se autentica a sí misma;
5. cómo se demuestra vigencia, revocación y fencing en el límite de ejecución;
6. cómo se recupera el propietario tras pérdida total de dispositivos;
7. qué pruebas adversariales demuestran root unavailable, evidencia falsa, conflicto, rollback, revocación concurrente y reinicio;
8. qué operaciones quedan explícitamente no protegidas y cuáles no se pueden ejecutar.

Si cualquier punto queda sin evidencia, la implementación sigue bloqueada. No se agregan IDs, epochs, tokens, colas, quorums o campos por conveniencia; sólo se reutilizan los contratos existentes cuando correspondan.

## 8. Decisión actual

- Contrato semántico propuesto: disponible para revisión arquitectónica.
- Alcance de bootstrap/root: **UNA LLAVE CRIPTOGRÁFICA RAÍZ Y UN DISPOSITIVO INICIAL, DECISIÓN ACEPTADA**. Modelo físico, protocolo, provisión y verificador concreto siguen pendientes; no existe prueba de raíz implementada.
- Evaluación de autoridad en runtime: **NO IMPLEMENTADA**.
- API pública Chronicle: **`authorization: "NOT_EVALUATED"` explícito**.
- Efectos protegidos: **STOP**.
- M0 global: **INCOMPLETO**.

El contraste con los contratos canónicos quedó registrado en `NCS_M0_DEPLOYMENT_CLAIM_FAILURE_DOMAIN_INVENTORY_2026-10-19.md`. La actividad posterior acotada es especificar provisión inicial independiente y verificación para la llave raíz única decidida, con los límites del gate actualizado. No volver a comparar familias de reconocimiento como investigación general, no repetir auditorías históricas ni implementar un pseudo-root.


## Addendum de continuidad — decisión de alcance posterior (2026-10-19)

La decisión aceptada NCS_DECISION_SINGLE_ROOT_KEY_SINGLE_DEVICE_INITIAL_SCOPE_2026-10-19.md cierra la pregunta de alcance sobre cantidad de raíces para la primera fase: una llave raíz y un dispositivo inicial. No cierra las preguntas de implementación ni aporta evidencia de autoridad legítima. La frase anterior mecanismo concreto NO SELECCIONA se interpreta ahora como mecanismo/protocolo físico de provisión y verificación aún no seleccionado, no como que el alcance de cantidad de raíces siga abierto.
