# NCS M0-E — reconciliación de admisión estructural de previews — 2026-10-23

Rama: `ncs-clean-architecture`  
Tipo: verificación de fuente y pruebas existentes; este documento no modifica runtime ni añade tests.

## Hallazgo actualizado

Los documentos de 2026-10-22 `NCS_M0_E_MISSION_PREVIEW_INPUT_BOUNDARY_FINDING_2026-10-22.md` y `NCS_M0_E_MISSION_PREVIEW_RESOURCE_LIMIT_CONTRACT_GAP_2026-10-22.md` describían una brecha histórica que ya no coincide completamente con el código actual. No repetir ese trabajo ni seguir afirmando que faltan todos los límites estructurales.

En el HEAD inspeccionado están implementados:

- `scripts/nexo.mjs`: ambos comandos `mission-draft-preview` y `mission-request-preview` usan `readUtf8FileBounded` antes de `JSON.parse`, con un máximo de 4 MiB y código de error específico.
- `src/nexo/core/mission-admission-contract.mjs`: guarda iterativa compartida antes de validación/clonado recursivos, con límites para pasos, dependencias por paso, nodos, profundidad, bytes UTF-8 por cadena, bytes agregados de cadenas y longitud independiente de `intent`.
- `src/nexo/application/mission-request-preview.mjs`: aplica admisión al envelope completo y mantiene `requestInterpretation: NOT_PERFORMED`, `intentDraftAlignment: NOT_EVALUATED`, `authorization: NOT_EVALUATED`, `dispatchAttempted: false` y `persisted: false`.

## Pruebas y CI exactos

- Fuente de límites: `src/nexo/core/mission-admission-contract.mjs`, blob observado `d4ddd88c6c59827e944f8811d00e52cea336f0c1`.
- Pruebas: `tests/nexo/mission-request-preview.test.mjs`, blob observado `74475371c4b50291535822b55212f1c5989afdbf`.
- La suite contiene fronteras exacto/máximo+1 para 4 MiB en ambos comandos y casos de límite estructural para pasos, dependencias, profundidad, nodos y bytes de cadenas. Las pruebas de CLI comprueban que la entrada excesiva se rechaza sin imprimir su contenido ni mutar Continuity.
- CI determinista: [run 39898264772](https://github.com/snowdenxrp/aldea-ia/actions/runs/39898264772), SHA exacto `cdbdef0d8046a95567851eeebb2e41e054112c79`, job `tests` / `120233625839`, `completed / success`; paso `Run tests` también `completed / success`.

## Qué cierra y qué no

**Cerrado para la superficie CLI de preview revisada:** lectura previa acotada por bytes y guard estructural antes de la validación/clonado; casos de frontera presentes y suite verde en el SHA indicado.

**No demostrado ni cerrado:**

1. Los límites de admisión no son un presupuesto agregado de heap de V8 ni de memoria residente.
2. No existe por esta prueba un presupuesto agregado de disco ni exclusión verificable de procesos CLI simultáneos.
3. El límite de 4 MiB es una frontera operativa configurada y probada, no prueba matemática de que todas las misiones funcionalmente válidas que Nexo podría necesitar quepan en ese tamaño.
4. Estos previews siguen siendo validación/planificación: no interpretan la intención como instrucción, no alinean intención y borrador, no persisten, no despachan y no autorizan efectos.
5. Esto no establece raíz legítima, vigencia constitucional, Policy gobernante ni enforcement en un sink protegido.

Por lo tanto, los documentos históricos de brecha se conservan como evidencia de lo que se encontró entonces, pero este documento es la reconciliación vigente para el estado de la implementación.

## Siguiente paso

No volver a trabajar en el límite de 4 MiB ni reconstruir el guard estructural salvo que aparezca una regresión o contraejemplo nuevo. Retomar el trabajo no resuelto de M0-E usando el inventario existente de autoridad relativa a cada claim y el mapa de rutas/sinks, sin rehacer esas auditorías.

Estado constitucional sin cambio: M0 `INCOMPLETO`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
