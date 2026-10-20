# NCS M0 — Inventario relativo al claim: Chronicle append local
Fecha: 2026-10-20
Rama: `ncs-clean-architecture`
Tipo: inspección estática dirigida de fuente; no se ejecutaron pruebas nuevas en esta revisión.

## Decisión
Este inventario delimita el único caso de uso mutador expuesto por la API pública estable: `runNexoChronicleAppend`. La operación es una escritura local de Chronicle coordinada con Continuity; **no constituye por sí misma una operación constitucional protegida ni demuestra autorización del propietario**.

- M0: `INCOMPLETO`.
- `authorization: NOT_EVALUATED`.
- Autoridad raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos no acreditados: `STOP`.
- No se cambia runtime, no se habilita un nuevo efecto y no se convierte el éxito de persistencia en permiso constitucional.

## 1. Claim y operación delimitados
**Claim observado:** registrar de forma idempotente contenido de Chronicle bajo una identidad de operación `missionId:stepId`, preservando la obligación y su asentamiento en Continuity.

**Entrada pública:** `src/nexo/application/index.mjs` exporta `runNexoChronicleAppend` como único caso de uso mutador, junto con dos consultas de solo lectura. La llamada recibe rutas de ambos almacenes, `missionId`, `stepId`, contenido y opciones explícitas de inicialización/espera de lock.

**Ruta estática observada:**
1. Validación de parámetros e identidad; se rechazan separadores `:` en IDs para evitar colisiones de tuplas.
2. Preflight de ambos almacenes antes de inicializar uno; ausencia no aprobada, corrupción o indisponibilidad bloquean.
3. Apertura de Continuity Owner y construcción de contratos de Chronicle.
4. Si la misión no existe, persiste su admisión antes de ejecutar el paso; si la respuesta de persistencia es incierta, devuelve `unknown` y no despacha.
5. Comprueba que una identidad de misión existente no cambie el payload preparado.
6. `executeNexoStepWithContinuityOwner` conduce el paso `chronicle_append` a través del adaptador, observación/reconciliación y registro del resultado terminal.
7. La respuesta pública mantiene `authorization: NOT_EVALUATED` y `redispatchAuthorized: false`.

## 2. Última frontera de enforcement identificada
Para el efecto local de append, la ruta visible pasa por:
- `src/nexo/adapters/chronicle-effect.mjs`: handler acotado que escribe en el store, con verifier y postcondition basados en observación.
- `src/nexo/core/owner-backed-runtime.mjs`: restringe las acciones habilitadas a `chronicle_append`; acciones distintas se bloquean antes del despacho. La recuperación de obligaciones previas se realiza por observación y evita redispatch automático.
- `src/nexo/application/chronicle-append.mjs`: expone el resultado sin elevarlo a autorización.

**Límite importante:** esto es una frontera de ejecución/persistencia local. En los archivos inspeccionados no se observa un `AuthorityGate` conectado a una prueba de raíz constitucional legítima antes de esta escritura. No se concluye que exista un bypass; se concluye que este caso de uso no acredita una decisión de autoridad constitucional.

## 3. Garantías locales existentes y lo que no prueban
La implementación visible incluye preflight, identity/payload checks, locks con deadline compartido, asentamiento del diario, observación/reconciliación, control de resultado terminal e inhibición de redispatch. Estas son garantías de integridad/continuidad de la operación local, sujetas a sus contratos y pruebas existentes.

No prueban:
- que la solicitud proceda del propietario legítimo;
- que el contexto constitucional sea auténtico, vigente y no suministrado arbitrariamente por el caller;
- que una autoridad no esté revocada o sustituida por sucesión;
- que el estado sobreviva a pérdida total de dispositivos con reconocimiento legítimo del propietario;
- que cualquier efecto externo o protegido esté autorizado.

## 4. Regla constitucional, raíz y dependencias aún no demostradas
Para este claim local no se encontró una regla constitucional concreta ligada de extremo a extremo a la escritura, ni una fuente verificable de raíz legítima que produzca contexto protegido para la frontera final. Tampoco se acredita en esta ruta:
- procedencia y autenticidad del material de autoridad;
- epoch/fencing aplicable y comprobación de currentness;
- revocación y propagación de invalidación;
- regla de sucesión y recuperación tras pérdida de dispositivos;
- separación de dominios de fallo entre emisor de claim, almacenamiento de estado y verificador.

Estos puntos se marcan **UNKNOWN/PENDING**, no como vulnerabilidades confirmadas ni como funciones ya implementadas.

## 5. Pruebas negativas necesarias antes de cualquier claim de autorización
No se afirma que las siguientes pruebas estén implementadas o ejecutadas. Son criterios pendientes si se pretende que una operación quede condicionada a autoridad constitucional:
1. contexto de autoridad ausente → `STOP/UNKNOWN`, sin efecto;
2. respuesta `AUTHORIZED` construida por caller/fixture sin evidencia vinculada → no aceptada como raíz;
3. evidencia con procedencia no reconocida o claim/scope distinto → sin efecto;
4. contexto obsoleto/epoch anterior → sin efecto;
5. revocación o sucesión concurrente con la operación → no confirmar autorización obsoleta;
6. error, contradicción o fuente inaccesible → `UNKNOWN/STOP`, sin promoción a autorizado;
7. prueba de que ningún camino alterno ejecuta el efecto cuando la autoridad no puede evaluarse.

Las pruebas de composición que inyectan `AUTHORIZED` solo prueban la conducta del pipeline posterior a esa respuesta; no sustituyen estos criterios.

## 6. Decisión para M0 y siguiente paso
No añadir otro contrato genérico de confianza ni modificar el runtime en esta etapa. El caso Chronicle sirve para separar con precisión:
- **integridad del registro local**: ya hay una ruta explícita con contratos de asentamiento;
- **autoridad constitucional para permitir un efecto**: sigue sin demostrarse.

Siguiente paso acotado: verificar, reutilizando los contratos existentes de STEP 7, si hay una fuente constitucional existente y verificable que pueda vincularse a un claim y a su enforcement final sin aceptar metadatos de autoridad del caller. Si no existe, documentar el bloqueo concreto y mantener `STOP`; no diseñar ni implementar una raíz sustitutiva por intuición.

## Fuentes revisadas
- `src/nexo/application/index.mjs`, blob `7871645de355bc37ae074f4372ea960b887145be`.
- `src/nexo/application/chronicle-append.mjs`, blob `ccb09c6874b9173963811073150c87b75f53bf2f`.
- `src/nexo/adapters/chronicle-effect.mjs`, blob `63ab7698372ad2b6be5c713beb0d774ad7c5d44f`.
- `src/nexo/core/owner-backed-runtime.mjs`, blob `8c697ea2944e19cce90bf7833f4ba392fee83818`.
- `src/nexo/application/continuity-queries.mjs`, blob `557b97e5338258dfe3b7755f9a22221e4b114994`.

Inspección estática dirigida; no es una auditoría completa del repositorio ni evidencia de ejecución nueva de CI.


## Continuidad de la búsqueda de fuente constitucional — resultado reutilizado (2026-10-20)

Se comprobó si el hueco podía cerrarse reutilizando contratos existentes, sin abrir una nueva auditoría general:

- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_REUSE_AUDIT_2026-10-08.md`, blob observado en esta rama `e81abbfb35048dcb2cf29f8827db7e67d239adf9`, ya está marcado **CLOSED — NO IMPLEMENTED CURRENT CONSTITUTION-AUTHORITY PATH FOUND**. Concluye que `createAuthorityResult()` es un constructor de forma y `ClaimEnvelope.policyContext` un portador de datos; ninguno establece autoridad constitucional.
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md`, blob `d5ebabcb05566593e32f3e1f9bf1047f6b99e0c0`, mantiene explícitamente **STOP BEFORE CODE** hasta que exista una Trust Foundation reconocida; advierte contra raíz ficticia, autorrecursión de confianza, resurrección desde snapshot, confusión de epoch, captura por proveedor, TOCTOU y common-mode failure.
- La búsqueda del índice de GitHub mostró un resultado llamado `STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md`, pero la lectura directa en la rama objetivo devolvió 404. Por tanto, no se considera presente ni evidencia de esta rama sin un fetch verificable. El resultado de búsqueda del índice por sí solo no basta para afirmar integración.

### Resultado de la puerta

No se encontró una fuente constitucional implementada que cierre el claim. Esta conclusión ya estaba registrada en una auditoría cerrada; no debe repetirse como investigación nueva en próximos chats. El bloqueo real ya no es “falta escribir otro contrato”: es que la raíz inicial y su reconocimiento independiente continúan sin resolución/implementación demostrable.

No crear ahora `createConstitutionAuthorityContext`, un Trust Foundation runtime, ni una raíz genérica. Mantener M0 `INCOMPLETO`, autorización `NOT_EVALUATED`, autoridad raíz `PENDING/UNKNOWN` y efectos protegidos `STOP`. El siguiente avance válido requiere resolver con la arquitectura existente cómo se reconoce la raíz inicial y qué evidencia de provisión/currentness/revocación la hace verificable; hasta entonces, documentar el bloqueo es más correcto que simular cierre.
