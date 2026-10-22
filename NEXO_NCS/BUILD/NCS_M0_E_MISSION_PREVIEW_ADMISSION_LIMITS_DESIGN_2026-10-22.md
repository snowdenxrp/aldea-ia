# NCS M0-E — contrato de admisión y límites para vistas previas de misión

Fecha: 2026-10-22  
Estado: **IMPLEMENTADO EN CORE Y PROBADO POR CI EN EL SHA INDICADO; VALIDACIÓN DE CAPACIDAD AGREGADA DEL PROCESO SIGUE ABIERTA**

## Decisión y límites v1

El límite de archivo del CLI se mantiene en 4 MiB (4,194,304 bytes), inclusivo; la lectura limitada rechaza al detectar el byte 4,194,305. Además, Core aplica una admisión estructural iterativa antes de la validación recursiva o de los clones.

Contrato v1 explícito en `src/nexo/core/mission-admission-contract.mjs`:

| Dimensión | Límite | Motivo y alcance |
|---|---:|---|
| Archivo CLI | 4 MiB | Frontera raw-byte ya existente y probada para los dos comandos |
| Pasos por misión | 256 | Presupuesto estructural v1 para el grafo de preview; no deriva del límite histórico de ocho pasos |
| Dependencias por paso | 64 | Limita el tamaño local del grafo de dependencias |
| Nodos JSON visitados | 20,000 | Cota de trabajo de la validación iterativa |
| Profundidad JSON | 32 | Evita que la validación/clonación recursiva reciba grafos profundamente anidados |
| Cadena/clave individual UTF-8 | 256 KiB | Alinea el máximo individual con el presupuesto de entrada existente de Chronicle; no significa que cada campo deba usar ese tamaño |
| Suma UTF-8 de cadenas y claves | 4 MiB | Cota estructural adicional para llamadas directas al contrato que no pasan por el límite de archivo |
| `intent` de petición | 16 KiB | Reserva un máximo separado para la intención no interpretada dentro del envelope total |

Los máximos estructurales son **presupuestos de admisión v1 explícitos**, no mediciones de heap ni límites derivados de un perfil de producción. Deben revisarse con fixtures representativos antes de declararlos capacidades de producto. Se prefieren rechazo explícito y grafo íntegro a truncamiento silencioso.

## Enforcement

- `mission-draft-preview` y `mission-request-preview` siguen leyendo como máximo 4 MiB + 1 byte antes de decodificar/parsear.
- `assertNexoMissionAdmission` usa recorrido iterativo, detecta ciclos, restringe prototipos/propiedades no ordinarias, cuenta nodos/profundidad, limita pasos/dependencias y aplica presupuestos de cadenas.
- `missionRecord` aplica el contrato antes de `assertContractInput` y de la reconstrucción/clonación, protegiendo el límite canónico compartido de registro de misión.
- El envelope de petición conserva un límite propio de `intent`. Una intención inválida/blanca sigue clasificándose como entrada inválida; una intención demasiado grande se rechaza como límite de recursos.
- Las respuestas de preview mantienen `authorization: NOT_EVALUATED`, `dispatchAttempted: false`, `persisted: false`. No se interpreta intención ni se autorizan efectos.
- La validación conserva los códigos de límite específicos en la respuesta, en vez de degradarlos a error genérico.

## Pruebas y CI

Código y pruebas de admisión, incluidos máximos exactos y máximo+1 para pasos, dependencias, profundidad, nodos, cadena individual y volumen agregado, en SHA exacto:

`9f97f61a5517f0b591a677f91607a9ef05696c9e`

- [Nexo — deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39828236600) — SUCCESS.
- [Nexo — STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827909056) — SUCCESS.
- [Nexo — STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827909080) — SUCCESS.

Las pruebas agregadas cubren los dos entrypoints CLI en 4 MiB y 4 MiB + 1 byte; máximo exacto y máximo+1 para pasos, dependencias, profundidad, nodos JSON, cadena individual y suma agregada de cadenas/claves; exceso de intent; y preservación de Continuity, ausencia de dispatch/persistencia y salida sanitizada.

## Límite importante de la evidencia

Los límites de admission control reducen la complejidad aceptada, pero no prueban una cota exacta de heap: buffers, objetos parseados, clones y snapshots pueden coexistir. Tampoco resuelven presupuesto agregado de procesos, concurrencia multiproceso ni disco agregado. Esos temas siguen OPEN.

## Límite histórico de ocho pasos

P112 confirma que el límite histórico de ocho pasos pertenecía al diseño acotado heredado, pero no define completamente la disposición de reclamaciones omitidas ni resuelve todas las semánticas del grafo previo/posterior al corte. No se traslada ese límite a Core preview ni se truncan misiones.

## Hallazgo de CI separado — no ocultar

El workflow [Nexo M0 — repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39827598938) terminó FAILURE en SHA `5485f7d9180918b5dc110dc4d9ed8ffc87569789`. El job falla en `tests/nexo/assistants-runtime-cli.test.mjs`: la prueba espera un `effectJournal[0]` después de la opción repair, mientras `scripts/nexo-runtime-session.mjs` devuelve explícitamente `NEXO_M0_OPTION_A_EFFECT_EXCLUDED` y no despacha ni persiste. No se cambia el runtime para hacer pasar la prueba; se requiere reconciliar la prueba/workflow con la decisión de alcance Option A. Ese workflow no está contado como SUCCESS del SHA de admisión.

## Estado canónico

M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
