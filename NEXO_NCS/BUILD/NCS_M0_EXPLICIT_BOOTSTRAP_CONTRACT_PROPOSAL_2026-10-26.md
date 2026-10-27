# NCS M0 — Contrato propuesto para inicialización explícita del estado

**Fecha:** 2026-10-26  
**Estado:** Propuesta técnica derivada de la decisión del propietario de adoptar la opción B. No implementada ni ratificada como contrato final.  
**Base inspeccionada:** `scripts/simulate.mjs` blob `1b5e39b681486f583c1779770c52dd913227dfa1`; `src/nexo/adapters/conditional-commit-persist-state.mjs` blob `d6dc517f9c7841a957749804d612fbfe6e66c9a6`.

## Hallazgo que motiva el contrato

La primitiva `persistState` acepta `loadCurrentState` y, por defecto, utiliza `loadState`. El loader tolerante `loadState` devuelve un estado inicial con revisión 0 cuando falla la lectura/parsing o no acepta el estado cargado. El adaptador de commit condicional no pasa `loadCurrentState`, por lo que usa ese default. En consecuencia, no debe darse por probado que un commit condicional real distinga hoy entre archivo ausente y archivo existente corrupto.

Existe `loadStateStrict`, que distingue archivo ausente, fallo de lectura, JSON inválido, esquema inválido y revisión desconocida; pero su existencia no demuestra que el adaptador la use.

## Propuesta de separación

Mantener dos operaciones conceptualmente distintas:

- **Commit condicional normal:** solo modifica un estado persistido válido que ya existe y cuya revisión coincide con `expectedRevision`. No crea el primer estado ni convierte errores de lectura en revisión 0.
- **Inicialización explícita:** crea el estado inicial válido solo cuando se cumplen precondiciones propias y se demuestra que el destino sigue ausente en el punto de creación.

No se recomienda añadir una rama de auto-inicialización silenciosa dentro del commit normal.

## Precondiciones mínimas propuestas para inicialización

1. **Solicitud explícita:** la operación de bootstrap debe invocarse por separado y tener un resultado distinguible de un commit normal.
2. **Autoridad:** el llamador debe presentar la autorización definida por el contrato canónico. Mientras ese mecanismo no esté definido y verificado, la operación debe detenerse; esta propuesta no inventa un mecanismo de autoridad.
3. **Destino realmente ausente:** comprobar ausencia sin tratar errores de permisos, I/O u otros fallos como si fueran ausencia.
4. **Creación sin sobrescritura:** la publicación inicial debe usar una operación atómica de creación exclusiva o un mecanismo equivalente que falle si otro escritor ya creó el destino. Un lock cooperativo por sí solo no basta si hay escritores que no respetan el mismo lock.
5. **Esquema inicial validado:** el estado debe cumplir un esquema/versionado y revisión inicial definidos antes de publicarse.
6. **Resultado verificable:** distinguir creación confirmada, conflicto por destino ya existente y resultado indeterminado. No afirmar que no hubo persistencia sin evidencia.
7. **Preservación:** si el destino ya existe, no modificarlo, incluso si está corrupto. La recuperación de un archivo corrupto debe ser un flujo separado y explícitamente autorizado, no parte del bootstrap.
8. **Sin reintento automático:** cualquier resultado indeterminado permanece UNKNOWN hasta una reconciliación autorizada.

## Semántica de resultados propuesta

| Resultado | Significado |
|---|---|
| `INITIALIZED` (nombre provisional) | La operación explícita creó el estado inicial y hay evidencia suficiente de la creación definida por el contrato |
| `ALREADY_EXISTS` (nombre provisional) | El destino existía o otro escritor ganó la carrera; no sobrescribir |
| `INVALID_INITIAL_STATE` (nombre provisional) | El candidato inicial no cumple el esquema |
| `AUTHORITY_NOT_ESTABLISHED` (nombre provisional) | La autoridad requerida no se pudo verificar; no crear |
| `UNKNOWN` | No se puede establecer con certeza el resultado; bloquear continuación y no reintentar automáticamente |

Los nombres son ilustrativos, no contratos existentes ni constantes ya implementadas. No se debe equiparar `INITIALIZED` con durabilidad ante pérdida de energía; el alcance de durabilidad debe definirse por separado.

## Casos de prueba que deben demostrar el contrato

- Destino ausente + commit condicional normal: no se inicializa automáticamente.
- Destino ausente + bootstrap sin autoridad demostrada: no se crea.
- Destino ausente + bootstrap autorizado + estado inicial válido: se crea una sola vez.
- Destino existente válido: bootstrap no sobrescribe.
- Destino existente corrupto: se preservan exactamente los bytes originales.
- Dos bootstraps concurrentes: como máximo uno crea; el otro observa conflicto/ALREADY_EXISTS y no sobrescribe.
- Error antes de la creación: clasificar con evidencia.
- Error posterior a una creación visible: no afirmar que no hubo mutación; resultado UNKNOWN si la operación no puede establecer el desenlace.
- Errores de permisos/I/O al inspeccionar destino: no reinterpretarlos como archivo ausente.

## Decisiones aún abiertas

- Fuente y formato exactos de autoridad legítima.
- Forma canónica del estado inicial y su esquema/versionado.
- API/resultado público de bootstrap y su integración con el runtime real.
- Mecanismo de coordinación frente a escritores no cooperativos.
- Garantía de durabilidad que se pretende cubrir (visibilidad, caída del proceso, caída del sistema/energía).
- Protocolo de reconciliación autorizado para UNKNOWN.

## Límites de evidencia y ejecución

Esta es una propuesta documental. No modifica código, pruebas, workflows ni configuración; no ejecuta tests o CI; no demuestra integración de producción; no cierra M0. Los gates canónicos permanecen: M0 INCOMPLETO, autoridad raíz PENDING/UNKNOWN, autorización NOT_EVALUATED, efectos protegidos STOP y reconciliación general no integrada.


## Evidencia arquitectónica y límites de adopción (revisión 2026-10-26)

Este contrato debe respetar la regla activa de integración MASTER + AB + P/P112 y el análisis de contr efectos futuros:

- **MASTER / Core:** la autoridad debe venir de una relación de owner/authority reconocida por una frontera protegida; declarar autoridad en la entrada del llamador no la establece. La cadena protegida distingue política/admisión, coordinación y ejecución. La inicialización del archivo no puede decidir por sí misma autorización para ejecutar ni autoridad raíz.
- **AB/P congelado:** los hallazgos existentes exigen que evidencia protegida ausente siga UNKNOWN, que una afirmación no se convierta en autoridad por circularidad y que la coordinación no amplifique la envolvente de autoridad. Se consultan como restricciones, no se reabre la auditoría histórica.
- **Investigación de bootstrap:** existe un concepto de investigación llamado `BootstrapAuthority`, descrito como autoridad mínima para identidad, inicialización protegida, estado de seguridad y establecimiento de raíz. Es una propuesta de investigación, no un contrato NCS aprobado ni una implementación. No se adopta aquí ni se crea un nuevo objeto/abstracción sin identificar su owner canónico y validar su correspondencia con MASTER/CORE.
- **Regla de UNKNOWN:** si no se puede establecer la autoridad raíz vigente, el alcance, el esquema requerido o una precondición de creación, la inicialización protegida no procede. La ausencia del archivo no puede servir como su propia prueba de autoridad.
- **Contr efecto futuro:** introducir una autoridad especial solo para bootstrap podría convertirse en una segunda raíz, una dependencia circular o una autoridad paralela al owner canónico. Antes de adoptar tal mecanismo hay que demostrar cómo se establece independientemente, qué alcance tiene y cómo se evita que se autoautorice. No se añade ningún ID, cola, retry, tombstone, fence ni wrapper como solución especulativa.

### Resultado de la revisión

La opción B queda aceptada como **separación de operaciones**, pero la fuente concreta de autoridad para el bootstrap permanece **UNKNOWN/PENDING**. No existe evidencia suficiente para escoger o inventar un mecanismo de autoridad. El contrato de inicialización no debe considerarse listo para implementación hasta resolver ese owner canónico. La decisión no cambia los gates de M0.


## Revisión de owner canónico en MASTER/CORE (2026-10-26)

Se localizó un contrato NCS existente que define el owner semántico más próximo para la legitimidad constitucional: [Minimum Core Constitution Authority Context Contract](STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md). Su frontera reconoce el régimen constitucional para una evaluación posterior de Policy, derivado de una base de confianza ya reconocida; no nace de datos del caller y no concede ejecución.

La auditoría de reutilización [Constitution Authority Context Reuse Audit](STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_REUSE_AUDIT_2026-10-08.md) declara cerrado el examen y concluye que no se encontró una ruta implementada actual que establezca ese contexto. El contrato de Trust Function / Root Role Map también afirma que el reconocimiento inicial independiente y la aplicación protegida real siguen sin implementarse o probarse.

### Resolución precisa

- **Owner semántico localizado:** Constitution Authority Context de Core, para reconocer el régimen constitucional.
- **Base de confianza que debe establecerlo:** todavía no demostrada como mecanismo independiente y vigente en la implementación.
- **Resultado para el bootstrap de persistencia:** no se puede usar directamente el contrato de persistencia como autoridad ni dar por resuelto el bootstrap. La opción B sigue siendo solo separación de operaciones; el gate de autoridad continúa bloqueado.
- **No duplicar autoridad:** no crear un `BootstrapAuthority` paralelo. El bootstrap de persistencia debe consumir el resultado de la frontera constitucional reconocida cuando esa frontera exista y su contrato cubra explícitamente esta operación; no debe construir ni inferir ese resultado.
- **Siguiente paso de diseño:** comprobar si el contrato constitucional existente incluye, o debe delimitar explícitamente, la legitimidad de la operación de inicialización local de estado. No ampliar silenciosamente su alcance. Si no la cubre, registrar la dependencia como UNKNOWN/PENDING para una decisión del propietario.

Esto reduce la pregunta abierta: ya no es «¿qué owner semántico inventamos?», sino «¿cómo se establece independientemente el contexto constitucional existente, y cubre su alcance la inicialización local?». La respuesta de implementación sigue siendo UNKNOWN.


## Delimitación de alcance: ¿cubre este contrato el bootstrap local? (2026-10-26)

Lectura directa del contrato constitucional vigente: su propósito expreso es que Core reconozca el régimen constitucional que gobierna una **vinculación posterior de Policy**. Sus no-objetivos separan Policy, admisión, ejecución, commit y efecto externo. No define por sí mismo una autorización para crear el primer archivo de estado persistente ni una operación de bootstrap local.

Por ello, el contrato constitucional identifica el owner semántico de legitimidad constitucional, pero **no cubre explícitamente el caso de uso de inicialización local**. No se debe inferir esa cobertura por analogía: hacerlo ampliaría su alcance sin decisión contractual.

Resolución:
- Mantener la opción B como separación de operaciones.
- Mantener autoridad para bootstrap local en UNKNOWN/PENDING.
- No crear otro owner/raíz para cerrar la brecha.
- La próxima decisión de diseño debe definir si la inicialización local cae bajo una regla constitucional ya existente y demostrable, o requiere una delimitación explícita aprobada por el propietario. Hasta entonces, no implementación ni tests/CI.


## Revisión independiente de brecha normativa (2026-10-27)

Claude realizó una revisión documental de solo lectura y reportó **BRECHA CONFIRMADA** en el alcance revisado (HEAD que Claude identificó: `058bf0e`; no revisó STATUS completo ni todo BUILD/RESEARCH, y no ejecutó runtime/tests/CI). El hallazgo coincide con la delimitación anterior de este documento: no se encontró una regla canónica que designe explícitamente quién autoriza crear el primer estado persistente local.

### Evidencia reportada por la revisión

- `NCS_M0_ABSENT_STATE_INITIALIZATION_DECISION_2026-10-26.md`: la ausencia del archivo no autoriza inicialización; la autoridad requerida debe definirse antes de implementar.
- `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`: bootstrap explícito/separado; protocolo P-01 sigue UNKNOWN/BLOCKED.
- `NCS_M0_E_INITIAL_SCOPE_OWNER_DECISION_2026-10-21.md`: permite persistencia interna acotada sujeta a contratos y pruebas, pero no crea autoridad; los stores locales no son anclas de autoridad.
- `NCS_M0_AUTHORITY_SOURCE_VS_BOOTSTRAP_RECOGNITION_2026-10-20.md`: el propietario humano es la fuente normativa conceptual; el reconocimiento técnico verificable y el enforcement no están demostrados.
- Constitution Authority Context: cubre el reconocimiento del régimen para una vinculación posterior de Policy, no concede por sí mismo autoridad para inicialización/commit; no se debe ampliar su alcance por analogía.
- `MASTER/README.md` y `CORE/README.md`: según la revisión, no designan una regla de inicialización local.

Esta lista registra el resultado comunicado por Claude; no equivale a una auditoría exhaustiva de todo el repositorio.

### Distinción necesaria

La brecha se refiere a la autorización de la **primera creación local de estado persistente**. No demuestra que toda escritura interna acotada requiera establecer la raíz constitucional, ni demuestra que esta creación pueda autorizarse sin delimitación. Antes de decidir, debe quedar explícito si el estado creado es exclusivamente almacenamiento interno no autoritativo, sin capacidad de establecer confianza, cambiar estado protegido ni habilitar efectos; o si la operación propuesta toca el estado constitucional/genesis, en cuyo caso la raíz y su reconocimiento independiente siguen bloqueados.

### Decisión pendiente del propietario

Delimitar cuál de estos alcances se pretende autorizar, sin confundirlos:

1. **Inicialización local no autoritativa y acotada:** solo si se demuestra que no crea ni modifica raíz, autoridad constitucional, estado protegido o efectos; la autorización de alcance debe quedar explícita y no puede derivarse de la mera ausencia del archivo.
2. **Inicialización de estado que establece o condiciona la confianza/autoridad constitucional:** permanece STOP/UNKNOWN hasta que exista una base de reconocimiento independiente y un contrato aplicable explícito.

No se adopta automáticamente ninguna de las dos rutas. No se amplía Constitution Authority Context, no se crea `BootstrapAuthority` paralelo, y no se implementa nada hasta resolver el alcance y la autoridad requeridos.

### Estado de evidencia

Revisión documental únicamente. No se modificaron runtime, tests, workflows ni configuración ejecutable; no se ejecutaron pruebas ni CI. Gates intactos: M0 `INCOMPLETO`; autoridad raíz `PENDING/UNKNOWN`; autorización `NOT_EVALUATED`; efectos protegidos `STOP`; reconciliación general no integrada.


## Decisión del propietario sobre el alcance — Opción A (2026-10-27)

El propietario eligió **Opción A de alcance: estudiar y delimitar la inicialización explícita de almacenamiento local M0 exclusivamente no autoritativo y acotado**. Esta elección resuelve qué alcance se quiere perseguir; no afirma que la arquitectura actual ya garantice la separación y no convierte esta propuesta en contrato implementado.

### Límites obligatorios de esta ruta

- La inicialización solo podrá crear almacenamiento interno M0 que no establezca ni modifique la raíz de confianza, la autoridad constitucional ni estado protegido.
- La operación no autentica al propietario, no concede permisos, no habilita ejecución ni efectos protegidos, y no puede ser consumida como prueba de autoridad por otros componentes.
- La ausencia del archivo no es prueba de autorización. La creación inicial debe seguir siendo explícita y distinta del commit condicional normal.
- Un archivo existente, incluso corrupto o inválido, debe preservarse; no se trata como ausente.
- Errores de inspección, creación o persistencia no se reinterpretan como ausencia ni como prueba de que no hubo mutación. UNKNOWN bloquea la continuación y no habilita reintento automático.
- La concurrencia debe resolverse con una garantía efectiva de creación exclusiva frente a los escritores relevantes; un lock cooperativo no basta si existen escritores que no lo respetan.
- Debe demostrarse por inspección del grafo de consumidores que el estado inicial no confiere autoridad ni habilita efectos protegidos. Si esa separación no se puede demostrar, la ruta queda STOP/UNKNOWN.

### Trabajo pendiente antes de cualquier implementación

1. Mapear de forma dirigida los lectores/consumidores del estado inicial y sus efectos, sin repetir auditorías históricas no relacionadas.
2. Identificar evidencia concreta de que ningún consumidor convierte el estado local inicial en raíz, autoridad, permiso o habilitación de efectos.
3. Precisar el esquema inicial y la semántica de resultados usando contratos existentes; no inventar un mecanismo paralelo de autoridad.
4. Mantener pruebas, runtime, workflows y configuración ejecutable sin cambios hasta autorización específica posterior.

**Estado:** elección de alcance hecha por el propietario; separación arquitectónica todavía no demostrada; contrato final no ratificado; implementación no autorizada por esta elección. Gates intactos: M0 INCOMPLETO, autoridad raíz PENDING/UNKNOWN, autorización NOT_EVALUATED, efectos protegidos STOP y reconciliación general no integrada.

## Primer mapa estático dirigido de consumidores — resultado parcial (2026-10-27)

**Alcance:** lectura de archivos concretos de la rama `ncs-clean-architecture`; no se ejecutaron pruebas ni se intentó despachar efectos. El mapa es parcial y no equivale a un análisis exhaustivo de todos los consumidores.

### Evidencia observada

- `src/nexo/core/continuity-snapshot.mjs` declara que el snapshot es operacional y que no representa autoridad. Es evidencia de intención del contrato de datos, no prueba por sí sola de cómo todos los consumidores usan ese estado.
- `src/nexo/core/continuity-service.mjs` expone `openNexoContinuityOwner`. La opción `allowEmptyInitialization` es `false` por defecto; cuando no existe el store, el servicio puede inicializar desde `legacyMemory` o, si el llamador lo permite explícitamente, con un snapshot vacío.
- `scripts/simulate.mjs` comprueba si falta el archivo de mundo, carga estado estricto si existe, y llama a `openNexoContinuityOwner` con `allowEmptyInitialization: !stateExists`. Después persiste el mundo simulado mediante `persistState`. Por tanto, la ausencia de un archivo de mundo actualmente participa en la decisión de permitir la inicialización del store de continuidad en este script; esto debe analizarse como acoplamiento existente, no asumirse como un contrato seguro.
- El snapshot vacío contiene `effectJournal: []`. `src/nexo/core/continuity-owner.mjs` usa el store para operaciones de misión, outcomes, ejecución y observaciones del journal; sus comentarios dicen que registrar un outcome no liquida el journal ni autoriza efectos. `src/nexo/core/owner-backed-runtime.mjs` y `src/nexo/runtime.js` consumen datos del journal para el flujo de ejecución/reconciliación.
- `src/nexo/adapters/conditional-commit-persist-state.mjs` delega a `persistState` para un commit condicional existente y no constituye por sí mismo el contrato de inicialización explícita.

### Evaluación provisional

La intención del snapshot de continuidad es no autoritativa, pero el store incluye un journal operacional conectado al flujo de ejecución/reconciliación. Eso **no demuestra** que inicializar el store conceda autoridad, pero tampoco permite concluir aún que la inicialización sea inocua o esté completamente separada de los efectos protegidos. Además, `scripts/simulate.mjs` liga la ausencia del archivo de mundo con `allowEmptyInitialization`; esa relación debe ser trazada hasta sus consumidores y límites reales.

### Siguiente paso exacto

Completar un mapa de llamadas de `openNexoContinuityOwner` y del inicializador del store, incluyendo scripts de reparación/entrada y el origen de los argumentos `owner`/store. Para cada ruta, establecer si la inicialización solo permite almacenar continuidad o puede abrir una ruta a planificación, dispatch, reconciliación o efectos. Si esa frontera no se puede demostrar estáticamente con contratos existentes, mantener Opción A como alcance elegido pero **STOP/UNKNOWN para implementación**. No ejecutar tests/CI ni modificar runtime/tests/workflows/configuración sin autorización específica.

## Hallazgo prioritario de consumidores: inicialización y despacho en una misma invocación (2026-10-27)

**Archivo:** `src/nexo/application/chronicle-append.mjs`; entrada CLI en `scripts/nexo-chronicle-session.mjs`.

El CLI expone `--initialize-continuity`. `runNexoChronicleAppend` preflighta ambos almacenes, permite continuar si falta continuidad y `initializeContinuity` es verdadero, llama a `openNexoContinuityOwner` con `allowEmptyInitialization: initializeContinuity` y, después de la inicialización, sigue hacia la admisión de misión y `executeNexoStepWithContinuityOwner`. El resultado público mantiene `authorization: NOT_EVALUATED`, pero ese valor no impide por sí solo la continuación del flujo.

**Conclusión acotada:** se confirma una ruta de código donde la inicialización del almacén de continuidad y el avance hacia una operación de Chronicle con despacho ocurren dentro de la misma invocación. Esto no prueba que se conceda autoridad constitucional; sí significa que la separación operacional exigida por la Opción A no está demostrada y que `--initialize-continuity` no debe considerarse, por sí solo, una operación aislada y no habilitante.

**Bloqueo para implementación:** antes de cambios ejecutables debe resolverse, con contrato existente y alcance explícito, cómo separar el acto de inicialización de cualquier admisión/despacho posterior. No basta con renombrar la bandera ni con confiar en `authorization: NOT_EVALUATED`; no se propone aún una solución de runtime. Mantener M0 INCOMPLETO, autoridad PENDING/UNKNOWN, autorización NOT_EVALUATED y efectos protegidos STOP.

### Aclaración de las dos opciones ya elegidas

La elección de **Opción B** registrada anteriormente se refiere al eje de mecanismo de persistencia: inicialización explícita separada del commit condicional normal. La elección posterior de **Opción A** se refiere al eje de alcance: almacenamiento local M0 estrictamente no autoritativo. Son ejes distintos y compatibles; ninguna elección demuestra que la implementación actual cumpla las condiciones.
### Confirmación del límite de despacho (misma inspección estática)

`src/nexo/adapters/chronicle-effect.mjs` registra el handler `chronicle_append`; el handler llama a `store.append(...)` y devuelve `completed` cuando el store confirma `committed` o `already_present`. `executeNexoStepWithContinuityOwner` comprueba capacidades, persiste `PREPARED` y después invoca `adapter.executePrepared`, que llega al handler. Por tanto, la ruta anterior no es solo una admisión de misión: puede mutar el almacén Chronicle tras el bootstrap de continuidad. El runtime registra `authorization: NOT_EVALUATED` en la respuesta pública, y la revisión no encontró en esta ruta una evaluación de autoridad que detenga ese despacho.

Este es un hallazgo estático de la ruta de Chronicle, no una afirmación de que todos los efectos de Nexo sean alcanzables ni de que el código se haya ejecutado. La prueba de ejecución real y el estado global de CI no se consultaron.
## Matriz de rutas de inicialización y operación — ampliación estática (2026-10-27)

| Ruta | Inicialización / entrada | Qué puede seguir después | Lectura para Opción A |
|---|---|---|---|
| Chronicle append | `scripts/nexo-chronicle-session.mjs` expone `--initialize-continuity` y `--initialize-chronicle`; `src/nexo/application/chronicle-append.mjs` preflighta almacenes y puede abrir continuidad con `allowEmptyInitialization` | Admisión de misión, `PREPARED` en continuidad, `executeNexoStepWithContinuityOwner` y handler `chronicle_append` que llama `store.append(...)` | Ruta estática confirmada de inicialización y mutación Chronicle dentro de la misma invocación. Separación no demostrada; autorización pública queda `NOT_EVALUATED`. |
| Simulación | `scripts/simulate.mjs` detecta ausencia del estado de mundo y pasa `allowEmptyInitialization: !stateExists` a `openNexoContinuityOwner` | Avanza la simulación y persiste el estado de mundo mediante `persistState` | La inicialización de continuidad está acoplada a la ausencia del archivo de mundo; no se encontró despacho de Chronicle en ese `main`, pero sí una mutación persistente del estado de simulación. No equiparar esa mutación con autoridad constitucional. |
| Reparación | `scripts/nexo-repair-session.mjs` / `scripts/nexo-repair-entrypoint.mjs` / `scripts/nexo-repair-dispatch.mjs` operan con un owner que se les entrega; requieren una obligación `PREPARED` y revisión estricta del estado persistido | El dispatcher puede ejecutar acciones de reparación de Lúmina y persistir el estado de mundo; el protocolo deja la obligación para reconciliación separada | `scripts/nexo-runtime-session.mjs` bloquea la integración de reparación del runtime del producto con `NEXO_M0_OPTION_A_EFFECT_EXCLUDED`. Eso no elimina las funciones de protocolo separadas: su invocabilidad directa/otros callers debe mantenerse fuera del alcance M0 o verificarse por separado. No se afirma que el runtime del producto las despache. |
| Consultas de continuidad | `src/nexo/application/continuity-queries.mjs` usa `loadCurrent()` sin inicializar | Solo lee y reconstruye estados/planes; los comentarios explícitamente dicen que el plan no autoriza despacho | Ruta de lectura, no es por sí sola un bootstrap. Archivo ausente devuelve bloqueo. |

### Interpretación y límites

Este mapa cubre las rutas inspeccionadas, no demuestra exhaustividad global de todos los callers ni carga dinámica. `src/nexo/application/index.mjs` expone Chronicle append como su único caso de uso mutante; `src/nexo/runtime.js` también exporta `executeNexoStepWithContinuityOwner`, pero no se halló en esta inspección una conexión de `openNexoContinuityOwner` desde el API de aplicación a una autoridad constitucional verificada.

**Decisión operativa pendiente:** separar de forma verificable el comando de bootstrap de la invocación Chronicle que admite y despacha; definir cómo la ausencia del estado de mundo puede iniciar continuidad sin convertir ese hecho en autorización ni disparar un camino de operación protegido; conservar el bloqueo de reparación en el runtime de producto mientras Option A excluya reparaciones. No se recomienda todavía un parche de código porque el contrato canónico de autoridad para inicialización y la frontera exacta de invocación aún no están resueltos.

**Restricciones de evidencia:** revisión estática solamente; no se ejecutaron tests ni CI, no se verificó comportamiento runtime y no se modificó código ejecutable.

## Segundo pase estático — inventario de llamadores directos y frontera no resuelta (2026-10-27)

**Método:** se volvieron a leer los directorios `src/nexo/core`, `src/nexo/application`, `src/nexo/adapters` y los scripts de entrada relevantes en la rama `ncs-clean-architecture`. El índice de búsqueda de código de GitHub no devolvió resultados útiles para varios símbolos que sí existen en los archivos; por eso, sus resultados vacíos no se usan como evidencia negativa. Este pase es dirigido, no un escaneo exhaustivo de todo el repositorio.

| Origen | Llamada/entrada observada | Qué establece la evidencia | Límite |
|---|---|---|---|
| `src/nexo/application/chronicle-append.mjs` | Importa y llama `openNexoContinuityOwner`; si el store falta y `initializeContinuity` es verdadero, pasa `allowEmptyInitialization: initializeContinuity`. Luego continúa con admisión y `executeNexoStepWithContinuityOwner`. | Es un consumidor directo del inicializador y conecta el bootstrap con una ruta de operación en la misma invocación. | `authorization: NOT_EVALUATED` no es un freno de ejecución. No se identificó en esa ruta un gate de autoridad que detenga el despacho. |
| `scripts/simulate.mjs` | Importa `openNexoContinuityOwner`; pasa `allowEmptyInitialization: !stateExists`. Después avanza la simulación y llama `persistState`. | La ausencia del archivo de mundo controla la opción de inicialización de continuidad; el flujo persiste estado de simulación. | No se observó despacho Chronicle en el `main` revisado. No se generaliza a otros entrypoints ni se llama autoridad a la persistencia de simulación. |
| `scripts/nexo-continuity.mjs` | Reexporta `openNexoContinuityOwner`. | Es un punto de acceso al servicio; el llamador de producto observado es `scripts/simulate.mjs`. | No prueba que no existan consumidores indirectos o imports dinámicos en el resto del repositorio. |
| `src/nexo/core/continuity-service.mjs` | El servicio carga estado actual; solo al recibir el error de store-not-found considera `legacyMemory` o un snapshot vacío cuando `allowEmptyInitialization === true`, y luego llama a `store.initialize(snapshot)`. | La inicialización vacía no es el default del servicio. | La condición local no garantiza por sí misma separación del resto de la invocación ni exclusión de escritores no cooperativos. |
| `src/nexo/core/continuity-store.mjs` | Expone `initialize` y `commitIfCurrent`; el bloqueo documentado coordina escritores cooperativos. | Inicializar y hacer commit condicional son operaciones distintas a nivel de API. | No demuestra por sí solo una frontera de invocación separada, autoridad, ni exclusión global. |
| `scripts/nexo-repair-session.mjs` / `scripts/nexo-repair-entrypoint.mjs` / `scripts/nexo-repair-dispatch.mjs` | La sesión recibe un `owner` y `store` suministrados; el entrypoint requiere una obligación `PREPARED` y delega en el dispatcher. | Existe un protocolo separado capaz de despachar reparaciones cuando se invoca con sus precondiciones. | No se encontró aquí una llamada directa al inicializador de continuidad; no se afirma que estos scripts creen el owner ni que el runtime de producto los invoque. La integración de reparación sigue excluida del alcance M0. |
| `src/nexo/application/continuity-queries.mjs` | Crea un store y usa `loadCurrent()`; no llama al servicio de inicialización en el flujo inspeccionado. | Las consultas revisadas son de lectura y bloquean si falta continuidad. | No prueba que todas las interfaces de consulta del repositorio tengan el mismo comportamiento. |

### Conclusión del segundo pase

La evidencia confirma dos llamadores directos de `openNexoContinuityOwner` en las rutas de producto revisadas: Chronicle y simulación. Ambos permiten que la inicialización vaya seguida de trabajo adicional en la misma invocación; Chronicle puede llegar a una escritura persistente de Chronicle, mientras simulación persiste estado del mundo. La API de servicio y el store separan funciones, pero esa separación interna **no equivale** a aislamiento operacional del bootstrap.

No se encontró evidencia suficiente para certificar exhaustividad global de consumidores, descartar imports dinámicos, ni demostrar que todo estado creado inicialmente queda fuera de cualquier decisión de dispatch/reconciliación. La ausencia de resultados en la búsqueda indexada de GitHub no cubre esas brechas.

**Siguiente paso verificable:** antes de tocar runtime, convertir esta frontera en un contrato de aceptación para el bootstrap de Opción A: una invocación de bootstrap no debe seguir hacia admisión, dispatch, reconciliación ni mutaciones de dominio; una llamada normal con estado ausente debe detenerse; y la inicialización debe poder distinguirse de un commit condicional normal. Esto sigue siendo un criterio propuesto, no una implementación ni una decisión adicional de autoridad. La fuente de autoridad para crear el primer estado continúa UNKNOWN/PENDING; por tanto, este criterio no habilita todavía el bootstrap.

## Criterios verificables de aislamiento para Opción A — propuesta (2026-10-27)

Estos criterios delimitan el comportamiento que tendría que demostrarse antes de aceptar una implementación. No seleccionan una fuente de autoridad, no ratifican un API y no autorizan cambios ejecutables.

| ID | Escenario | Criterio de aceptación propuesto | Fallo que mantiene STOP |
|---|---|---|---|
| BA-01 | Invocación normal; estado de continuidad ausente | Bloquear antes de admisión, creación de PREPARED, dispatch, reconciliación o mutación de dominio. | La ausencia provoca inicialización implícita o se continúa la operación. |
| BA-02 | Invocación explícita de bootstrap aislado | La invocación solo intenta inicializar el almacenamiento operacional M0 acotado y termina sin admitir misión ni llamar adaptadores de efecto. | Bootstrap y operación de dominio se ejecutan en una misma invocación. |
| BA-03 | Bootstrap y payload de misión/acción en la misma solicitud | Rechazar la combinación antes de persistencia o dispatch; no reinterpretarla como bootstrap aislado. | El payload permite continuar hacia Chronicle, reparación u otro efecto. |
| BA-04 | Archivo de continuidad existente y válido | No sobrescribir ni reinicializarlo como parte de bootstrap. | El bootstrap reemplaza o reinicia estado existente. |
| BA-05 | Archivo existente corrupto, esquema inválido o lectura fallida | Preservar los bytes existentes y devolver un estado distinguible de “ausente”; no convertir error de I/O en revisión cero. | Reparación/overwrite implícito o afirmación no probada de que nada se persistió. |
| BA-06 | Dos inicializadores concurrentes | Como máximo uno crea el estado inicial; el otro detecta conflicto/existencia sin sobrescribir. La garantía debe cubrir a todos los escritores relevantes, no solo a los cooperativos. | Se depende únicamente de un lock cooperativo sin demostrar cobertura global. |
| BA-07 | Resultado ambiguo tras intentar crear | Devolver UNKNOWN, inspeccionar/conciliar solo mediante una ruta autorizada y no reintentar automáticamente. | UNKNOWN se traduce en “no persistido” o dispara un segundo intento. |
| BA-08 | Simulación con archivo de mundo ausente | La ausencia del archivo de mundo no debe ser por sí misma el criterio de autoridad ni habilitar continuidad más mutación; bootstrap y persistencia de simulación requieren fronteras distinguibles. | La condición `!stateExists` abre automáticamente una operación más amplia. |
| BA-09 | Reparación | Mantener reparación fuera del alcance M0 mientras Opción A la excluya; el bootstrap no debe crear/inyectar un owner o PREPARED que habilite reparación. | La inicialización se convierte indirectamente en precondición suficiente para despacho de reparación. |
| BA-10 | Evidencia pública de autorización | `authorization: NOT_EVALUATED` se conserva como desconocido y nunca se trata como aprobación ni como un gate efectivo. | Etiqueta de estado se confunde con enforcement. |

### Evidencia mínima requerida antes de aceptar

1. Un grafo de llamadas con entrypoints concretos que cubra los consumidores de bootstrap y sus rutas hasta cualquier escritura/dispatch; los imports dinámicos y consumidores no inventariados deben quedar identificados o la cobertura declararse incompleta.
2. Contrato de entrada/salida de bootstrap que distinga ausencia, existencia, estado inválido, conflicto y UNKNOWN sin asumir constantes ya implementadas.
3. Pruebas de integración con almacenamiento real para BA-01–BA-09 y verificación de que ningún adaptador de efecto se invoca; pruebas estáticas o stubs aislados no bastan para afirmar la propiedad end-to-end.
4. Evidencia separada de exclusión de escritores y nivel de durabilidad prometido. Atomicidad visible no debe presentarse como durabilidad ante caída del sistema/pérdida de energía sin prueba específica.
5. Un contrato canónico que resuelva si y bajo qué base legítima se permite crear el primer estado. Los criterios de aislamiento no resuelven por sí mismos la autoridad UNKNOWN/PENDING.

**Estado de estos criterios:** propuesta documental, no ratificada como contrato de implementación; BA-01–BA-10 no se han ejecutado ni verificado. No se modificaron runtime, tests, workflows ni configuración, y no se ejecutó CI.

## Decisión de diseño pendiente: bootstrap de datos no autoritativos frente a bootstrap protegido (2026-10-27)

La Opción A limita el objetivo a almacenamiento local M0 **no autoritativo y acotado**. El contrato vigente de Constitution Authority Context, sin embargo, reconoce el régimen constitucional para una vinculación posterior de Policy; no define la legitimidad de crear un archivo local inicial. No se debe resolver esa diferencia usando por analogía el contrato constitucional ni inventando una autoridad paralela.

### Alternativas que requieren una decisión explícita

| Alternativa | Qué significaría | Condición para avanzar | Riesgo / estado |
|---|---|---|---|
| D1 — Bootstrap estrictamente de datos no autoritativos | Permitir una operación local de creación solo si un contrato demuestra que el dato creado no establece raíz, identidad, permiso, confianza ni habilita operación/efecto alguno. | Delimitar normativamente que esta operación no es bootstrap protegido; demostrar aislamiento end-to-end y que todos los consumidores tratan el estado como no autoritativo. | No está demostrado que el estado de continuidad actual cumpla esa separación; Chronicle y simulación siguen rutas posteriores. PENDING. |
| D2 — Bootstrap sujeto a autoridad constitucional | Considerar la creación inicial como operación gobernada por una regla constitucional y exigir un resultado de autoridad establecido desde una base de confianza independiente. | El owner canónico debe definir explícitamente el alcance de esta operación y existir una ruta técnica verificable que lo aplique. | La ruta actual de Constitution Authority Context no se encontró implementada en la auditoría documental; no puede consumirse todavía. PENDING. |
| D3 — Mantener STOP | No implementar bootstrap ni cambiar runtime hasta resolver D1 o D2 con el propietario. | Ninguna nueva condición: es el estado seguro mientras D1/D2 sigan abiertas. | Impide avanzar a implementación del bootstrap, pero evita convertir una decisión de alcance en una afirmación de autoridad. Estado actual. |

### Recomendación de ingeniería (no decisión del propietario)

Mantener **D3 — STOP** como estado operativo y estudiar D1 como hipótesis de diseño, porque coincide con el alcance elegido de Opción A; no dar D1 por aceptada. El siguiente artefacto de diseño debería precisar las propiedades negativas que hacen que el archivo sea no autoritativo (qué decisiones no puede influir, qué interfaces no puede habilitar y qué consumidores deben bloquear ante ausencia/UNKNOWN). Después se revisaría la matriz de consumidores contra esas propiedades. Si no se puede demostrar que la inicialización no abre una ruta de operación, D1 no satisface Opción A y deberá permanecer bloqueada; no se debe degradar silenciosamente a D2 ni crear un owner alternativo.

Esta recomendación no cambia decisiones canónicas, no concede permiso para modificar runtime y no autoriza la creación de estado. D1/D2 requieren una decisión contractual explícita antes de implementar. Los gates siguen M0 INCOMPLETO, autoridad raíz PENDING/UNKNOWN, autorización NOT_EVALUATED y efectos protegidos STOP.

