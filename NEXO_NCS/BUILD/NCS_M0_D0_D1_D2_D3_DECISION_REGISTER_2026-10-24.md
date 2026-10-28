# NCS M0 — registro de decisiones y puertas de evidencia
Fecha: 2026-10-24
Rama objetivo: `ncs-clean-architecture`
Base observada: `55c82b28aafd6b26a62d49e767e9d991d0dac274`
Estado: **DOCUMENTO DE TRABAJO — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Propósito

Evitar que una decisión de alcance se confunda con una decisión técnica, que una recomendación se trate como aceptación del propietario, o que una fuente/documento se presente como prueba de runtime. Este registro consolida el estado conocido sin reabrir auditorías históricas cerradas.

Estados utilizados:
- **ACEPTADO — DISEÑO BASE:** decisión del propietario registrada; no significa implementada ni verificada.
- **PROPUESTA:** recomendación técnica pendiente de decisión explícita o de resolución de diseño.
- **EVIDENCIA PENDIENTE:** el contrato puede estar definido, pero falta demostrarlo en fuente/test/CI.
- **BLOQUEADO / UNKNOWN:** no se debe inferir éxito ni continuar por esa ruta.
- **EXCLUIDO DEL ALCANCE M0:** no se debe incluir por defecto en esta fase.

## 2. Decisiones aceptadas por el propietario (solo el alcance expresamente aceptado)

| ID | Decisión aceptada | Qué NO significa | Evidencia/artefacto |
|---|---|---|---|
| O-01 | D0-C1: una raíz explícita por operación (`--root <directory>`) como contrato de diseño base; sin override ambiental ni fallback legacy en la primera versión. | No significa que el parser CLI o las APIs ya lo implementen. | [Contrato de raíz](NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md) |
| O-02 | D0-C2: la operación normal requiere raíz existente/válida; bootstrap separado y explícito. | No selecciona aún el protocolo concreto de bootstrap ni demuestra quiescencia. | [Opciones de bootstrap](NCS_M0_D0_C2_BOOTSTRAP_PROTOCOL_OPTIONS_2026-10-23.md) |
| O-03 | D0-C3: canonicalizar la raíz antes de derivar rutas; ambigüedad bloquea; no afirmar defensa universal frente a TOCTOU hostil. | No fija todos los detalles de symlinks, nombres reservados, hard links o mounts. | [Contrato de raíz](NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md) |
| O-04 | D0-C4: no migración automática, dual-write ni merge heurístico; migración/cutover fuera de M0 hasta identificar y verificar el entorno destino. | No prueba que las rutas legacy actuales estén bloqueadas en runtime. | [Línea de meta M0](NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md) |
| O-05 | D1-S0: separar cierre de diseño de cierre de implementación para evitar el ciclo “test necesario para cerrar D1 / no tocar tests antes de cerrar D1”. | No cierra D1-DESIGN ni D1-IMPLEMENTATION por sí mismo. | [Handoff D1](NCS_NEXT_CHAT_HANDOFF_2026-10-24_D1_ENTRYPOINT_MANIFEST.md) |
| O-06 | La línea de meta M0 A–E se acepta como base de cierre; M0_BUILD_COMPLETE y PROTECTED_EFFECTS_AUTHORIZED son estados separados. | No significa que M0 esté completo ni autoriza efectos protegidos. | [Línea de meta M0](NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md) |
| O-07 | La reparación/migración legacy/cutover quedan fuera del alcance operativo M0 inicial, salvo que una revisión explícita cambie el alcance. | No prueba que todos los entrypoints de reparación sean inaccesibles en runtime. | [Manifiesto D1](NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md) |

## 3. Propuestas técnicas que NO deben tratarse como aceptadas

| ID | Tema | Recomendación de trabajo | Decisión/evidencia que falta | Mientras tanto |
|---|---|---|---|---|
| P-HIST-01 | Bootstrap C2 | Preferir bootstrap offline y controlado por operador (opción A) solo si se puede demostrar quiescencia. Si no, UNKNOWN/BLOCKED; evaluar publicación atómica B únicamente con garantías del filesystem demostradas. | Confirmar el procedimiento operacional y cómo se prueba que ningún proceso/supervisor legacy puede reanudar escrituras. | No bootstrap normal ni autónomo; no inicialización implícita. |
| P-HIST-02 | Alcance de admisión | Incluir en la sección crítica de instancia las lecturas que materializan snapshots y previews, desde antes del primer `loadCurrent()` hasta terminar su uso. | Cerrar D2 con contrato de alcance y consumidores; no atribuir cuota de heap a un lock. | No afirmar snapshot/heap agregado acotado ni consistencia de instancia implementada. |
| P-HIST-03 | Primitiva de lock | Caracterizar los locks de Continuity y Chronicle antes de elegir: A, lock raíz independiente, o B, primitiva compartida con adaptadores de política. Elegir B solo si preserva semántica observable. | Matriz de caracterización y comparación verificable de owner schema, timeout, stale, release retry, cuarentena y códigos. | No unificar ni refactorizar locks a ciegas. |
| P-HIST-04 | Propiedad del lock | El proceso que realiza append debe ser dueño de la admisión; el hijo Chronicle debe validar/adquirir por sí mismo si se ejecuta directamente. No mantener el lock del padre mientras espera al hijo que debe adquirirlo. | Pruebas de proceso hijo, invocación directa, contención y ausencia de deadlock, tras autorización de implementación. | No afirmar que el proceso hijo está protegido por el padre. |
| P-HIST-05 | Release incierto | Separar resultado de negocio/persistencia, resultado de liberación y permiso de readmisión. Nunca reintentar automáticamente la operación de negocio. Nunca retirar un lock reemplazado por otro actor. | Contrato de cuarentena y pruebas de reemplazo de path, release fallido, owner corrupto y actor todavía vivo. | UNKNOWN/BLOCKED; no éxito limpio ni repetición automática. |
| P-HIST-06 | Stale/timeout | 2.000 ms de espera, intervalo de 10 ms y criterio candidato de 60 s + PID muerto son valores de referencia, no decisiones cerradas. | Pruebas y aprobación contractual; edad/PID no bastan para borrar lock. | No auto-borrar lock stale ni presentar valores como política aprobada. |
| P-HIST-07 | Alias y filesystem | `realpath` para resolver alias de symlink bajo el modelo cooperativo; no prometer seguridad frente a proceso hostil, TOCTOU, hard-link/mount alias ni filesystem no compatible. | Política de rutas reservadas y matriz de casos positivos/negativos. | Ambigüedad → UNKNOWN/BLOCKED. |
| P-HIST-08 | `assistants.mjs` / `simulate.mjs` | Mantener la separación de estado Nexo, estado del mundo y memoria Lúmina; no asumir que sus accesos actuales están bloqueados. | Decidir su contrato de integración o exclusión explícita y probarlo. | Excepción de diseño provisional; no declarar barrera de runtime. |
| P-HIST-09 | Compatibilidad legacy | En modo root, rechazar rutas independientes y combinaciones ambiguas; no hacer fallback silencioso. | Revisión de consumidores y envelopes de resultado antes de cambiar API/CLI. | No cambiar el comportamiento por inferencia ni migrar automáticamente. |

## 4. Grupos de evidencia para los criterios de salida M0 (G1–G5; no confundir con A–E de la línea de meta)

| Grupo de evidencia | Estado conservador actual | Evidencia necesaria para cerrar |
|---|---|---|
| G1 — aceptación reproducible | PARCIAL: existe ejecución CI determinista satisfactoria en SHA histórico de la rama; no equivale a cierre global. | Workflow/job/test exactos, SHA de implementación final, resultado SUCCESS y mapa finito de pruebas obligatorias. |
| G2 — continuidad/admisión/persistencia | PENDIENTE para el contrato de raíz/admisión; los tests existentes de stores no demuestran root admission. | Contratos, tests de rechazo/no-write, snapshot admission y regresiones de persistencia ligadas al mismo SHA. |
| G3 — reconstrucción de resultado terminal | Reutilizar evidencia existente; no repetir auditorías sin discrepancia nueva. | Casos conflict/context mismatch/ausencia de outcome enlazados a test y ejecución exactos. |
| G4 — journal/recuperación/UNKNOWN | PENDIENTE para la nueva frontera de instancia y release incierto. | Pruebas de crash cuts, unknown, lock reemplazado, release incierto y no redispatch automático. |
| G5 — raíz legítima/frontera de efectos | BLOQUEANTE: raíz legítima PENDING/UNKNOWN; root lock no es autoridad. | Ruta integrada de procedencia de raíz legítima y frontera real de efectos demostrada. No sustituible por CI, `AUTHORIZED` suministrado por caller o admisión de filesystem. |

## 5. Orden de trabajo sin repetir auditorías

1. D1-DESIGN: usar el manifiesto D1 existente; cerrar solo aristas desconocidas concretas (cargas dinámicas, reexports, consumidores externos y procesos hijos) contra el snapshot identificado. No rehacer el censo histórico completo.
2. D2-DESIGN: cerrar primero el alcance de admisión; luego la matriz de caracterización de locks; después release uncertainty, timeout/stale y compatibilidad de resultados.
3. D3: mantener migración/cutover fuera de M0; no diseñar ni ejecutar un cutover sin entorno destino identificado y quiescencia verificable.
4. Reconciliar M0-A–E con contratos, tests, SHA, workflow/job/run y resultado. Reutilizar evidencias que correspondan exactamente al SHA; no extrapolar evidencias históricas.
5. Solo después de cerrar diseño y obtener autorización explícita separada, implementar cambios de runtime/tests/workflows y ejecutar CI. La autorización de implementación no concede autoridad constitucional ni efectos protegidos.

## 6. Estado canónico al crear este registro

- Rama observada: `ncs-clean-architecture`.
- HEAD observado antes de este documento: `55c82b28aafd6b26a62d49e767e9d991d0dac274`.
- M0: `INCOMPLETO`.
- D1-DESIGN: `OPEN`; D1-IMPLEMENTATION: `NOT_STARTED`.
- D2/D3: `OPEN`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- Este registro: documentación de reconciliación; no modifica runtime/tests/workflows, no afirma que se hayan ejecutado pruebas/CI y no autoriza implementación.

## 7. Fuentes canónicas

- [Handoff D1 2026-10-24](NCS_NEXT_CHAT_HANDOFF_2026-10-24_D1_ENTRYPOINT_MANIFEST.md)
- [Manifiesto de entrypoints D1](NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md)
- [Contrato de raíz y plan de migración](NCS_M0_INSTANCE_ROOT_CONTRACT_AND_MIGRATION_PLAN_2026-10-23.md)
- [Matriz de estados D2](NCS_M0_D2_INSTANCE_ADMISSION_STATE_TRANSITION_MATRIX_2026-10-23.md)
- [Alcance de cuarentena por release incierto](NCS_M0_D2_RELEASE_UNCERTAINTY_QUARANTINE_SCOPE_2026-10-23.md)
- [Línea de meta M0](NCS_M0_FINISH_LINE_AND_ACCEPTANCE_CRITERIA_2026-10-24.md)


## 8. Ratificación del propietario — 2026-10-25

Ratificación explícita recibida después de la versión inicial de este registro. Esta sección actualiza el estado de diseño; **no autoriza implementación**.

### 8.1 Decisiones ratificadas

| ID | Decisión ratificada | Límite / qué no significa |
|---|---|---|
| O-08 | Reafirmar D0-C1..C4 como contrato de diseño aceptado: raíz única explícita `--root`, operación normal sin inicialización implícita, canonicalización antes de derivar rutas y sin migración automática/fallback legacy en el alcance acordado. | No demuestra enforcement en runtime ni selecciona por sí sola el protocolo de bootstrap. |
| O-09 | Para la separación Nexo/Lúmina, definir primero fronteras, estado y dependencias prohibidas; elegir después el refactor mínimo que haga cumplir el contrato. | No impone aislamiento físico de scripts como solución previa ni demuestra aislamiento actual. |
| O-10 | Ninguna lectura persistente de consultas/previews/Chronicle dentro del alcance de admisión definido puede eludir esa frontera. | El alcance preciso, sección crítica, propiedad del lock y comportamiento padre/hijo deben quedar coherentes en D1/D2; no autoriza cambios. |
| O-11 | Ante liberación incierta de un lock: `UNKNOWN/BLOCKED`; no reintentar automáticamente la operación de negocio ni permitir readmisión hasta resolver la incertidumbre. | No implica congelación permanente ni autoriza recuperación automática; el protocolo seguro de cuarentena y resolución sigue siendo diseño pendiente de D2. |

### 8.2 Solo decisiones pendientes

| ID | Decisión pendiente | Trabajo de diseño necesario | Estado mientras no se resuelva |
|---|---|---|---|
| P-01 | Protocolo concreto de bootstrap de raíz. | Seleccionar procedimiento explícito y demostrar cómo se garantiza quiescencia; publicación atómica solo si existen garantías verificables del filesystem. | No bootstrap implícito; `UNKNOWN/BLOCKED` si no se demuestra seguridad. |
| P-02 | Fronteras exactas Nexo/Lúmina para `assistants.mjs`, `simulate.mjs` y rutas relacionadas. | Enumerar estado y dependencias permitidas/prohibidas, preservar el comportamiento propio de Lúmina y decidir exclusiones explícitas antes de escoger el refactor mínimo. | No declarar aislamiento de runtime demostrado. |
| P-03 | Alcance exacto de admisión para consultas, previews, snapshots y uso de datos persistentes. | Definir comienzo/fin de la sección protegida y resultados ante fallo; mantener coherencia entre API pública, CLI y proceso hijo Chronicle. | Ningún bypass se considera seguro por suposición; bordes no resueltos `UNKNOWN/BLOCKED`. |
| P-04 | Propiedad y composición de locks entre proceso padre, hijo Chronicle y APIs invocadas directamente. | Caracterizar locks actuales y decidir la primitiva solo tras comparar semánticas; demostrar ausencia de deadlock en el contrato. | No unificar ni refactorizar locks a ciegas. |
| P-05 | Cuarentena y criterio verificable para resolver liberación incierta y permitir readmisión. | Definir cómo se demuestra que el actor anterior ya no puede modificar estado protegido y cómo se evita retirar un lock reemplazado. | `UNKNOWN/BLOCKED`; sin reintento de negocio ni readmisión automática. |
| P-06 | Política de timeout/stale y recuperación de locks. | Acordar criterios y evidencias; edad o PID por sí solos no autorizan borrar locks. | Los valores numéricos anteriores siguen siendo candidatos, no decisiones. |
| P-07 | Política de rutas reservadas y casos de filesystem/alias fuera del modelo cooperativo. | Definir casos aceptados/rechazados y límites de las garantías; no afirmar protección universal frente a TOCTOU hostil. | Ambigüedad → `UNKNOWN/BLOCKED`. |
| P-08 | Compatibilidad de APIs/CLI existentes con el contrato de raíz única. | Resolver consumidores de rutas independientes, flags de inicialización y resultados de error antes de cualquier cambio. | Sin fallback silencioso ni cambio de comportamiento por inferencia. |
| P-09 | Resolución de consumidores externos, cargas dinámicas y aristas indirectas que puedan eludir la frontera. | Cerrar solo las aristas concretas pendientes contra el snapshot identificado; registrar las que no puedan resolverse. | `UNKNOWN/BLOCKED`; no declarar inventario exhaustivo si no está demostrado. |
| P-10 | Matriz final de evidencia de D1 y reconciliación con M0 A–E. | Vincular cada criterio aplicable a contrato, prueba, SHA exacto, workflow/job/run y resultado; mantener separadas las etiquetas documentado/decidido/implementado/verificado. | M0 sigue `INCOMPLETO`. |

### 8.3 Estado canónico tras la ratificación

- M0: `INCOMPLETO`.
- D0 técnico/evidencia: `OPEN`.
- D1-DESIGN: `OPEN` hasta resolver los puntos aplicables de la tabla 8.2 y documentar las incógnitas restantes.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/D3: `OPEN`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- No se ejecutaron pruebas ni CI como parte de esta ratificación; no se modificaron runtime, tests ni workflows.


## 9. Reconciliación de identificadores y taxonomías — 2026-10-25

Para evitar colisiones dentro de este documento, los identificadores de la tabla histórica de propuestas de §3 se renombran `P-HIST-01`…`P-HIST-09`. Son referencias históricas de la versión inicial, no decisiones pendientes vigentes. La tabla §8.2 conserva `P-01`…`P-10` como identificadores canónicos actuales de decisiones pendientes. Si una nota antigua cita un identificador histórico sin el prefijo, debe interpretarse en el contexto de su sección original y actualizarse al editar esa nota; no se debe inferir equivalencia semántica por número.

La línea de meta M0 define la taxonomía normativa A–E. La tabla de §4 de este registro se denomina ahora grupos de evidencia G1–G5 y no redefine ni sustituye los criterios A–E. Las referencias futuras deben nombrar explícitamente “criterio de aceptación A–E” o “grupo de evidencia G1–G5”.

Este cambio solo corrige trazabilidad documental; no modifica el contenido de decisiones O-01…O-11, no cierra P-01…P-10, no cambia el estado canónico ni autoriza implementación.


## 10. Pregunta de alcance pendiente para B2 — 2026-10-27

Esta sección registra una pregunta de decisión que surgió al reconciliar el contrato candidato de bootstrap con la línea de meta M0. **No constituye ratificación del propietario ni autoriza implementación.** No se renumeran ni se cierran P-01…P-10.

### 10.1 Pregunta exacta

¿Debe exigirse que toda inicialización explícita de estado local no autoritativo permanezca aislada de la admisión de misiones, la preparación de efectos (PREPARED), el dispatch y las mutaciones de Chronicle durante la misma invocación, o se limita esta obligación a los caminos que pueden alcanzar operaciones protegidas?

### 10.2 Alternativas de diseño por decidir

| Alternativa | Alcance propuesto | Ventaja | Coste / riesgo pendiente |
|---|---|---|---|
| A — aislamiento general de bootstrap | Toda ruta de inicialización explícita crea únicamente el estado local permitido y termina sin admitir misión, preparar efectos, despachar ni mutar Chronicle en esa invocación. | Contrato uniforme, fácil de expresar como invariante y de atacar con pruebas. | Puede ampliar el cambio requerido y alterar flujos actuales; debe comprobarse que no contradiga necesidades legítimas del prototipo M0. |
| B — aislamiento según alcance de efecto | La separación estricta se exige a cada ruta que pueda alcanzar operaciones protegidas; otras rutas solo quedan fuera si se delimitan expresamente y no se atribuye a ellas una capacidad protegida. | Permite acotar el contrato a los caminos relevantes para el alcance aprobado. | Exige un grafo de rutas suficiente; cualquier arista no resuelta queda UNKNOWN/BLOCKED, nunca implícitamente exenta. |
| C — no seleccionar todavía | Mantener B2 como propuesta no ratificada y conservar el gate STOP hasta resolver la pregunta con el alcance de M0 y el manifiesto D1. | Evita convertir una inferencia técnica en decisión del propietario. | No permite congelar este fragmento del contrato ni pasar a implementación. |

### 10.3 Recomendación técnica no vinculante

Usar la alternativa C como estado actual; después, decidir entre A y B con el alcance M0 explícito y el manifiesto D1 vigente delante. No deducir una decisión a partir de la implementación actual ni de una prueba verde. Si se elige B, el conjunto de rutas excluidas debe quedar enumerado y aceptado conforme al criterio A.17 de la línea de meta; una ruta desconocida no puede contarse como excluida por silencio.

### 10.4 Evidencia necesaria después de una decisión

- Identificar el alcance exacto de bootstrap y las rutas que podrían continuar hacia admisión, PREPARED, dispatch o Chronicle.
- Vincular la decisión a los criterios de aceptación A.3, A.5–A.8 y C.9–C.13, según aplicabilidad; conservar la separación entre autoridad constitucional y permiso para crear almacenamiento.
- Solo tras contrato congelado y autorización separada: diseñar y ejecutar pruebas adversariales en el SHA exacto. Esta sección no declara que existan ni que se hayan ejecutado.
- Si la pregunta no puede resolverse con evidencia suficiente, conservar UNKNOWN/BLOCKED y no implementar una suposición.

### 10.5 Estado

- B2: PROPUESTA; NO RATIFICADA.
- P-01…P-10: siguen en sus estados previamente registrados; esta sección no los cierra ni los renumera.
- M0: INCOMPLETO.
- D1-DESIGN: OPEN.
- D1-IMPLEMENTATION: NO AUTORIZADA.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: PENDING/UNKNOWN.
- Efectos protegidos: STOP.
- Cambio de esta sección: documentación únicamente; no modifica runtime, tests, workflows ni configuración ejecutable y no afirma ejecución de pruebas o CI.


## 11. Separar autorización de almacenamiento local y autoridad constitucional — 2026-10-27

Esta sección convierte en una pregunta de alcance explícita la brecha descrita en el contrato de bootstrap. No introduce un owner, una raíz, un estado de runtime ni un mecanismo nuevo. No ratifica ninguna alternativa.

### 11.1 Distinción normativa

La existencia de dos preguntas diferentes debe mantenerse visible:

1. **Qué se crea:** almacenamiento local inicial estrictamente no autoritativo, o estado que pueda establecer/modificar confianza, genesis o contexto constitucional.
2. **Qué legitima la operación:** la precondición reconocida para crear ese almacenamiento. La ausencia del archivo, un lock, un estado inicial válido o una bandera del caller no pueden constituir por sí mismos esa legitimidad.

El contrato Constitution Authority Context existente identifica el owner semántico de reconocimiento constitucional, pero la documentación revisada no demuestra que cubra expresamente la autorización para crear el primer archivo local. No ampliar su alcance por analogía ni inventar un owner paralelo.

### 11.2 Alternativas de alcance pendientes

| Alternativa | Alcance | Consecuencia necesaria |
|---|---|---|
| L — almacenamiento interno no autoritativo | M0 puede definir un flujo de creación de almacenamiento local que no establece confianza, no modifica estado constitucional y no habilita efectos. | El propietario debe aceptar explícitamente ese límite; el protocolo de creación, no-sobrescritura, conflicto y UNKNOWN sigue pendiente de diseño/evidencia. No se infiere autoridad de la ausencia. |
| C — estado constitucional/genesis o capacidad de autoridad | La creación toca estado que establece o afecta la raíz, la confianza o el contexto constitucional. | No procede hasta demostrar la base de confianza y la frontera protegida independiente, y definir el alcance contractual aprobado. El estado sigue UNKNOWN/PENDING y STOP. |
| U — alcance no demostrado | No se puede demostrar que el objeto creado es estrictamente no autoritativo ni que queda separado del estado constitucional. | Tratar como UNKNOWN/BLOCKED; no inicializar ni implementar una suposición. |

### 11.3 Recomendación técnica no vinculante

Conservar U como clasificación actual hasta que el propietario confirme el alcance pretendido y el contrato identifique los objetos/archivos concretos cubiertos. No convertir la alternativa L en permiso de ejecución: solo delimita un posible alcance de diseño. La autorización técnica para crear almacenamiento y la autoridad constitucional son conceptos distintos, pero ambos requieren contratos y evidencias apropiados para su propio alcance.

### 11.4 Evidencia que falta para cerrar la pregunta

- Identificar exactamente qué archivos/objetos crea el bootstrap M0 y qué consumidores pueden leerlos.
- Demostrar que esos objetos no son usados como trust anchor, autoridad, genesis, policy binding ni habilitación de efectos; si no se demuestra, mantener U.
- Determinar si existe una regla canónica ya aprobada que legitime esa creación local; no deducirla del propietario conceptual ni de la presencia de Constitution Authority Context.
- Mantener separados los contratos de creación exclusiva, concurrencia, preservación de estado corrupto, resultado UNKNOWN y durabilidad.
- Solo después de decisión explícita, contrato congelado y autorización separada: preparar pruebas/implementación. Esta sección no afirma ejecución de pruebas o CI.

### 11.5 Estado

- Alcance de bootstrap local: UNKNOWN/PENDING.
- Authority para primera creación local: UNKNOWN/PENDING.
- No se crea `BootstrapAuthority` ni una raíz paralela.
- P-01…P-10 siguen abiertos conforme a sus estados previos; esta sección no los cierra.
- M0: INCOMPLETO; D1-DESIGN: OPEN; D1-IMPLEMENTATION: NO AUTORIZADA.
- `authorization: NOT_EVALUATED`; raíz legítima PENDING/UNKNOWN; efectos protegidos STOP.
- Documentación únicamente; sin runtime, tests, workflows, configuración ejecutable, ejecución de pruebas o CI.


### 10.6 Decisión expresa del propietario — P01-B (2026-10-27)

- **Decisión del propietario:** alternativa **C — no seleccionar todavía**. Confirmación explícita recibida en la conversación del 2026-10-27: «Ok entonces es C».
- **Alcance exacto:** no ratifica A ni B; no congela el alcance de aislamiento; mantiene la pregunta abierta y el gate `STOP` hasta resolverla con el alcance M0 y el manifiesto D1 vigente.
- **Clasificación:** decisión de alcance del propietario registrada documentalmente; no es implementación, evidencia de comportamiento ni autorización para ejecutar bootstrap.
- **Consecuencia:** B2/P01-B permanece sin PASS; P-01 sigue `OPEN / UNKNOWN`; M0 `INCOMPLETO`; D1-IMPLEMENTATION `NO AUTORIZADA`; primera creación `STOP`; `authorization: NOT_EVALUATED`; efectos protegidos `STOP`.
- **No realizado:** no se eligió protocolo, no se modificaron runtime/tests/workflows/configuración ejecutable, no se ejecutaron pruebas, CI ni GitHub Actions.


### 10.7 Decisión expresa del propietario — regla provisional de primera creación (2026-10-28)

- **Aprobación explícita:** «Apruebo la regla provisional de primera creación!».
- **Regla aprobada:** no inferir permiso de escritura por ausencia del archivo, código existente o éxito técnico; antes de permitir la creación deben definirse el propósito/clasificación del objeto exacto, la regla legítima aplicable y precondiciones verificables del entorno restringido. Bootstrap debe mantenerse separado de admisión, PREPARED, dispatch, reconciliación y mutaciones de dominio. Si falta evidencia o hay ambigüedad, STOP / UNKNOWN.
- **Límite:** la aprobación de la regla no autoriza la primera creación real, no crea una autoridad paralela, no declara una raíz legítima, no ratifica P-05 ni autoriza implementación, pruebas, CI/Actions o efectos protegidos.
- **Gates conservados:** alcance U; P01-A OPEN / UNKNOWN; P01-B C — NO SELECCIONAR TODAVÍA; P-05 NO RATIFICADA; D0/D1/D2/D3 OPEN; D1-IMPLEMENTATION NO AUTORIZADA; raíz PENDING / UNKNOWN; authorization: NOT_EVALUATED; primera creación y efectos protegidos STOP; M0 INCOMPLETO.
- **Pendiente verificable:** especificar y demostrar el entorno restringido, los escritores cubiertos/excluidos, las precondiciones observables de exclusión y su enlace al objeto/ruta efectivos y al SHA evaluado.
- **Ejecución:** registro documental solamente. Sin cambios en runtime/tests/workflows/configuración ejecutable; pruebas, CI y Actions no ejecutados para esta decisión.
