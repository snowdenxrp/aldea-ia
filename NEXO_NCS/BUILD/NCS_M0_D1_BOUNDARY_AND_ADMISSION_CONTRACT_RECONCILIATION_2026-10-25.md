# NCS M0 — reconciliación de contrato D1: fronteras, entrypoints y admisión
Fecha: 2026-10-25
Rama: `ncs-clean-architecture`
Estado: **PROPUESTA DE DISEÑO RECONCILIADA — D1-DESIGN OPEN — NO AUTORIZA IMPLEMENTACIÓN**

## 1. Propósito

Consolidar el contrato de separación Nexo/Lúmina con la revisión independiente de Gemini, la evaluación de esa revisión y las decisiones ratificadas por el propietario. No repite el censo de 188 blobs ni pretende cerrar el grafo semántico. No modifica runtime, tests, workflows ni datos operativos.

Fuentes base:
- `NCS_M0_NEXO_LUMINA_SEPARATION_CONTRACT_2026-10-24.md`
- `NCS_M0_D1_ENTRYPOINT_MANIFEST_AND_EDGE_CLASSIFICATION_2026-10-24.md`
- `NCS_M0_GEMINI_INDEPENDENT_D1_DESIGN_REVIEW_2026-10-25.md`
- `NCS_M0_D0_D1_D2_D3_DECISION_REGISTER_2026-10-24.md`

## 2. Estado de autoridad de cada afirmación

- **RATIFICADO:** decisión expresa del propietario ya registrada en O-01..O-11.
- **TARGET:** requisito arquitectónico propuesto que aún no se demuestra en runtime.
- **OBSERVED:** hecho respaldado por la revisión de fuente indicada.
- **UNKNOWN/BLOCKED:** arista, garantía o comportamiento no demostrado.
- **NO AUTORIZADO:** cambio de runtime/tests/workflows o migración que no debe realizarse por inferencia.

La recomendación de Gemini de preferir aislamiento lógico/modular es una **candidata**, no una decisión adicional ratificada. O-09 ya fija el método de decisión: definir fronteras y dependencias prohibidas primero; elegir después el refactor mínimo. No se preselecciona aislamiento físico ni se afirma que contratos/guards propuestos ya aíslen los dominios.

## 3. Contrato de dominio Nexo/Lúmina

### 3.1 Nexo — responsabilidades propias (TARGET)

- Identidad/continuidad de Nexo, Chronicle, ciclo de misión, configuración de instancia y stores de Nexo pertenecen a las interfaces y persistencia propias de Nexo.
- La operación normal debe entrar por el contrato de instancia aceptado: una raíz explícita `--root`, raíz existente y validada, canonicalización antes de derivar rutas, sin fallback ambiental/legacy ni bootstrap implícito.
- La lógica central y persistencia de Nexo no deben requerir importar ni invocar Lúmina.
- Fábricas de stores, APIs de owner y APIs de reparación basadas en rutas no se consideran admitidas por el mero hecho de estar exportadas o ser llamadas desde una CLI. Cada caller necesita clasificación y contrato de admisión.

### 3.2 Lúmina — responsabilidades propias (TARGET)

- Los comandos ordinarios `scripts/assistants.mjs` y `scripts/simulate.mjs` conservan su operación legítima de asistentes, memoria de aprendizaje y persistencia canónica del estado del mundo.
- Esos comandos no deben abrir Continuity de Nexo, crear/registrar misiones Nexo ni migrar implícitamente datos Nexo durante una operación ordinaria de Lúmina.
- No desactivar ni borrar `createLearningMemory()`, `learnFromReports()`, `persistState()` ni la persistencia propia de Lúmina como atajo para lograr separación.
- El estado legado `persisted.nexoMemory` no se elimina, importa, fusiona ni dual-escribe automáticamente. Cualquier migración es operación separada, autorizada y fuera del M0 operativo inicial.

### 3.3 Integración futura opcional

La independencia no requiere un adaptador. Si más adelante se autoriza una integración, debe declarar dirección, esquema de datos versionado, dueño de la fuente de verdad, campos permitidos, permisos, fallos, propiedad de persistencia y evidencia. No puede introducir una dependencia inversa de Nexo Core hacia Lúmina ni hacer que el arranque de un sistema dependa del otro.

## 4. Contrato de entrypoints y estado

| Superficie | Requisito de diseño | Evidencia/estado |
|---|---|---|
| `scripts/assistants.mjs` | Lúmina-only; preservar memoria y persistencia Lúmina; sin abrir Continuity ni registrar misión Nexo en operación ordinaria. | La revisión de fuente registró el acoplamiento actual; separación runtime no demostrada. OPEN. |
| `scripts/simulate.mjs` | Simulación/world-state de Lúmina; sin acceso operativo directo a Continuity ni migración implícita Nexo. | La revisión de fuente registró la ruta cruzada actual; separación runtime no demostrada. OPEN. |
| `scripts/nexo.mjs` | Parser/enrutador Nexo con raíz única explícita; admisión antes de la primera lectura persistente dentro del alcance definido; sin paths legacy contradictorios. | La fuente revisada aún acepta rutas separadas en ciertos comandos; contrato no implementado. OPEN. |
| `scripts/nexo-chronicle-session.mjs` | Independientemente ejecutable; valida raíz y opciones por sí mismo; no confía en que la invocación desde el padre equivalga a admisión. | La fuente revisada acepta rutas directas y flags de inicialización; contrato no implementado. OPEN. |
| APIs de query/preview | La admisión precede la primera lectura persistente que materializa el snapshot incluido en el alcance. Helpers internos no vuelven a adquirir una admisión no reentrante. | Alcance exacto y ownership deben quedar fijados en el contrato de admisión; OPEN. |
| Fábricas de stores / owners | Primitivas internas/test-only o caller público con contrato de admisión explícito y comprobable; comentario por sí solo no es guard. | La visibilidad/exportación y todos los callers no están semánticamente cerrados; UNKNOWN/BLOCKED donde corresponda. |
| APIs de reparación | Reparación/migración/cutover fuera del alcance operativo M0 según O-07; wrapper bloqueado no prueba que todas las APIs inferiores sean inalcanzables. | Clasificación de callers restantes y exclusión estructural/runtime no demostrada. UNKNOWN/BLOCKED. |
| Consumidores externos/cargas dinámicas | Resolver contra snapshot reproducible o mantener cada arista UNKNOWN/BLOCKED. | El barrido de 188 archivos es un barrido de identificadores nombrados, no un grafo completo. OPEN. |

## 5. Contrato padre/hijo Chronicle

### Requisitos de diseño

1. Una operación normal pasa una sola raíz explícita `--root <directory>`; no mezcla `--root` con rutas de store independientes ni acepta fallback ambiental/legacy.
2. El padre parsea y enruta la operación. La raíz no se convierte en autoridad constitucional por ser un argumento válido.
3. El hijo Chronicle, por ser ejecutable de forma independiente, debe validar el contrato de raíz y configuración por sí mismo antes de abrir stores o leer estado persistente.
4. La raíz debe canonicalizarse y validarse como existente antes de derivar rutas.
5. El padre no mantiene un lock de instancia no reentrante mientras espera a un hijo que necesita adquirir ese mismo lock. La propiedad final de admisión y el mecanismo de lock siguen siendo diseño pendiente de D2; esta regla de no-deadlock no selecciona una primitiva.
6. Parámetros contradictorios, raíz ausente/inválida, estado ambiguo o fallo de admisión deben detenerse antes de inicializar, mutar o producir efectos protegidos.
7. Invocación directa del hijo y llamada mediante padre deben converger en la misma política de admisión, sin confiar ciegamente en contexto heredado.

### Todavía no decidido

- Primitiva de lock raíz y relación con locks existentes de Continuity/Chronicle.
- Sección crítica exacta para append y para lecturas/snapshots de query/preview.
- Protocolo de release incierto, cuarentena y condición de readmisión.
- Timeout/stale y recuperación; valores previamente citados son candidatos, no política aceptada.
- Garantías concretas del filesystem para bootstrap y alias.

Estos puntos no pueden suplirse con una suposición sobre el padre ni con un comentario en el código.

## 6. Alcance de admisión de consultas y previews

O-10 está ratificada: ninguna lectura persistente dentro del alcance de admisión acordado puede eludir la frontera por ser de solo lectura.

La definición debe identificar, como mínimo:
- la primera operación de lectura persistente que materializa estado canónico;
- qué queries, status, mission plan, Open Loops y previews participan;
- hasta qué punto el snapshot permanece bajo la garantía de consistencia elegida;
- qué helpers internos consumen el snapshot y cuáles no deben reentrar en la admisión;
- resultados fail-closed ante raíz inválida, store ambiguo, fallo de adquisición o liberación incierta;
- si el proceso hijo realiza lectura/mutación dentro de la misma operación y quién posee la admisión.

La decisión de si un snapshot debe estar protegido durante toda su vida en memoria, el diseño de sección crítica y la propiedad del lock se concretan en el contrato de admisión D2. No se atribuye a un lock una garantía de cuota de heap ni se declara esa garantía implementada.

## 7. Matriz mínima de fallos

| Condición | Resultado de diseño | Lo que no debe inferirse |
|---|---|---|
| `--root` ausente, inválido o ambiguo | STOP antes de lectura persistente, inicialización o mutación | No fallback a variable de entorno ni a ruta legacy |
| `--root` junto con rutas separadas contradictorias | Rechazar configuración | No elegir una ruta silenciosamente |
| Root inexistente durante operación normal | STOP; bootstrap separado | No crear root/store implícitamente |
| Lectura de query/preview antes de admisión | Bypass no permitido; bloquear | No excepción automática por ser read-only |
| Hijo Chronicle invocado directamente | Validar el mismo contrato de raíz/admisión | No confiar en el padre/contexto heredado |
| Doble adquisición potencial padre/hijo | Ownership debe evitar deadlock | No mantener lock no reentrante del padre esperando al hijo |
| Adquisición o liberación incierta | `UNKNOWN/BLOCKED` | Sin retry de negocio ni readmisión hasta resolver incertidumbre |
| Caller dinámico/externo no clasificado | `UNKNOWN/BLOCKED` para la conclusión que dependa de él | No afirmar ausencia ni cobertura completa |
| Datos legacy Nexo en estado Lúmina | Preservar; no importar/fusionar automáticamente | No borrar, dual-write ni migrar como efecto lateral |
| API de reparación inferior alcanzable no resuelta | Fuera de operación normal M0 y UNKNOWN/BLOCKED hasta clasificar | Wrapper bloqueado no prueba inaccesibilidad total |

## 8. Condiciones para cierre de D1-DESIGN

D1-DESIGN solo puede proponerse para cierre cuando se cumpla documentalmente lo siguiente:

1. El contrato Nexo/Lúmina está consolidado con responsabilidades, dependencias prohibidas y persistencia legítima que se debe preservar.
2. Las superficies ejecutables y APIs conocidas están clasificadas, incluidos callers de stores/owners/reparación, query/preview y padre/hijo.
3. El contrato de raíz única y comportamiento ante opciones contradictorias es coherente en CLI padre, hijo y APIs de operación normal.
4. El alcance de lecturas sujetas a admisión y los límites del diseño de ownership están explícitos; lo que depende de D2 está enumerado y no se presenta como resuelto.
5. Las aristas dinámicas/externas sin resolver están registradas por separado, con su impacto sobre criterios de aceptación; no se declaran inexistentes.
6. La matriz de fallos mantiene `UNKNOWN/BLOCKED` cuando no hay evidencia y prohíbe retry/readmisión implícitos tras release incierto.
7. La reconciliación con M0 A–E distingue contrato documentado, decisión ratificada, implementación, prueba y CI ligados a SHA.
8. No se depende de la falsa premisa de que un guard propuesto ya funciona, de que un wrapper hace inalcanzables APIs inferiores o de que un inventario de identificadores equivale a un grafo completo.

Esta lista no afirma que los requisitos ya estén satisfechos. El estado D1 sigue OPEN mientras la evidencia/caller-resolution pendiente impida el cierre.

## 9. Estado canónico

- M0: `INCOMPLETO`.
- D0 técnico/evidencia: `OPEN`.
- D1-DESIGN: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/D3: `OPEN`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.

No se modificaron runtime, tests, workflows ni datos operativos. No se ejecutaron pruebas ni CI. Este documento consolida diseño; no cierra la fase ni autoriza implementación.
