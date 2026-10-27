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
