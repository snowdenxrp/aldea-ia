# NCS M0 — paquete de decisión del propietario: D0 y secuencia D1

Fecha: 2026-10-23  
Rama: `ncs-clean-architecture`  
Estado: **PAQUETE PARA DECISIÓN — PROPUESTAS NO ACEPTADAS — SIN AUTORIZACIÓN DE IMPLEMENTACIÓN**

## 1. Propósito

Este paquete reduce los contratos abiertos a decisiones explícitas y sus consecuencias. No sustituye los ledgers existentes, no vuelve a censar todo el repositorio y no toma decisiones en nombre del propietario.

Fuentes de referencia:
- `NCS_M0_D0_INSTANCE_ROOT_DECISION_LEDGER_2026-10-23.md`
- `NCS_M0_D0_D2_D3_DESIGN_DECISION_MATRIX_2026-10-23.md`
- `NCS_M0_D1_S0_SEQUENCE_GATE_ANALYSIS_2026-10-23.md`
- `NCS_M0_D1_CALLER_LEDGER_AND_ARCHITECTURE_TEST_SPEC_2026-10-23.md`
- `NCS_M0_D0_D1_D2_D3_DECISION_BOUNDARY_RECONCILIATION_2026-10-23.md`
- `NCS_M0_AGGREGATE_RESOURCE_BUDGET_GAP_ANALYSIS_2026-10-23.md`

## 2. Hechos que limitan la decisión

1. La raíz de instancia se aceptó como dirección arquitectónica para localizar la persistencia; no es identidad ni autoridad constitucional.
2. CLI principal y proceso hijo Chronicle aceptan hoy rutas legacy. El hijo es ejecutable directo.
3. El wrapper `scripts/nexo-continuity.mjs` tiene dos callers de producción observados en el repositorio: `assistants.mjs` y `simulate.mjs`. La búsqueda interna no demuestra ausencia de consumidores externos.
4. `chronicle-append.mjs` crea factories path-based de ambos stores y abre Continuity; `continuity-queries.mjs` crea directamente la factory path-based para consultas.
5. Las consultas `loadCurrent()` no están cubiertas por los locks de mutación de stores. Si la garantía buscada incluye limitar snapshots vivos concurrentes, también deben quedar dentro de la admisión.
6. Los límites por documento no son una cota de heap ni cuota total de disco.
7. No se ejecutaron pruebas ni CI para esta pasada documental. No se modificó runtime/tests/workflows.

## 3. Decisiones propuestas — D0

Todas las filas son **recomendaciones pendientes**, no valores aceptados.

| ID | Recomendación coherente | Alternativa real | Riesgo si queda ambiguo | Evidencia de cierre |
|---|---|---|---|---|
| D0-C1 — interfaz | Primera versión con un único `--root <directorio>` explícito por operación; sin variable de entorno en la primera versión; sin fallback a rutas sueltas. | Permitir env como transporte, con precedencia fija y propagación al hijo probada. | Configuración distinta entre padre e hijo, o fallback a un store no admitido. | Tabla de argumentos aceptados/rechazados y pruebas antes de cualquier I/O de stores. |
| D0-C2 — existencia/bootstrap | Operación normal requiere raíz existente y directorio; bootstrap es comando/modo separado y explícito. | Crear raíz automáticamente durante una operación normal. No recomendado. | Un typo o ruta equivocada se convierte en una instancia nueva vacía. | Casos de raíz ausente, archivo en lugar de directorio y bootstrap separado; cero mutaciones en operación normal. |
| D0-C3 — alias/symlinks | Resolver/canonicalizar raíz existente antes de derivar paths; especificar symlinks de raíz y nombres reservados; rechazar estados ambiguos. No prometer defensa contra carreras de filesystem hostil. | Aceptar alias sin canonicalización fuerte o prohibir todos los symlinks. | Dos rutas a los mismos datos pueden adquirir locks distintos o apuntar fuera del root esperado. | Matriz de symlink válido/roto, destino externo, store/lock symlink, colisión archivo/directorio, temporales ambiguos. |
| D0-C4 — legacy/migración | Ninguna migración automática al abrir owner, consultar, ejecutar assistants o simulate. Dry-run, inventario, copia/verificación, cutover explícito y rollback. | Adaptador legacy temporal solo si demuestra equivalencia exacta de paths derivados de un único root. | Migración incidental, dual-write, pérdida de procedencia o instancia vacía equivocada. | Manifiesto por instalación, hashes, prueba de interrupción, origen preservado y rollback documentado. |

### Recomendación integrada para D0

Elegir una sola frontera de configuración, sin fallback; separar operación normal de bootstrap/migración; validar configuración sin abrir stores ni mutar filesystem; tratar alias/estado ambiguo como bloqueo; no mover ni fusionar datos automáticamente. Estas reglas forman un contrato único y no deben implementarse por partes incompatibles.

## 4. Decisiones propuestas — D1

### D1-S0 — separar diseño de implementación

**Recomendación:** separar formalmente:
- `D1-DESIGN`: manifiesto reproducible, grafo de callers, allowlist, resolución de módulos, fixtures y reglas `UNKNOWN/BLOCKED`.
- `D1-IMPLEMENTATION`: test ejecutable y cambios de runtime después del cierre del diseño y de autorización separada.

Esto resuelve el ciclo lógico “D1 exige test ejecutado” frente a “no modificar tests antes del cierre del diseño”. Aceptar esta separación no autoriza escribir el test ni modificar runtime. La opción alternativa es mantener un único D1 y aprobar expresamente una excepción limitada para escribir primero un test-only; no se debe asumir esa excepción.

### Disposición de callers propuesta

| Superficie | Propuesta | Condición |
|---|---|---|
| CLI principal y API de aplicación | Entrada de instancia admitida; no rutas path-based directas en modo instancia. | Configuración D0 y admisión D2 congeladas. |
| Proceso hijo Chronicle | Validar root explícito y adquirir admisión propia si sigue siendo directamente ejecutable; el padre no conserva el mismo lock durante `spawnSync`. | Pruebas de hijo directo, conflicto y ausencia de deadlock. |
| Queries/previews/Open Loops | Admitir antes de cargar snapshot si se mantiene la garantía de un snapshot protegido por instancia. | D2 debe adoptar explícitamente el alcance de lectura. |
| Factories y owner path-based | Primitivas internas/TEST_ONLY, o API que requiera contexto de admisión. | Grafo estático transitivo y fixtures negativos. |
| `assistants` | Fuera de la ruta ordinaria hasta definir consistencia multi-store; no afirmar atomicidad con Lúmina/world state. | Contrato propio de conflicto/revisión o exclusión comprobada. |
| `simulate` | Fuera de la ruta ordinaria; no abrir ni inicializar Continuity incidentalmente. | Integración explícita futura o bloqueo probado. |
| Repair/dispatch/settlement | Continúan fuera del permiso de efectos. | La admisión de raíz no cambia el gate constitucional. |

## 5. Dependencias que siguen abiertas después de D0/D1

- **D2:** alcance exacto de admisión, orden root→store, no reentrada, ownership del lock entre procesos, timeout, release incierto y recuperación explícita. Los protocolos de locks actuales deben conservarse hasta caracterizarlos; no unificarlos por similitud superficial.
- **D3:** inventario de fuentes legacy, dry-run, copia/verificación, cutover y rollback sin merge heurístico ni dual-write.
- **Recursos:** heap agregado y cuota total de disco son contratos separados; el lock no los proporciona.
- **Prueba:** el futuro test de grafo debe usar AST o análisis equivalente, resolver imports/reexports/edges de procesos y fallar ante módulos no resueltos, cargas calculadas y callers no clasificados. No es una prueba formal de seguridad ni de autoridad.

## 6. Orden recomendado, sujeto a decisión

1. Registrar si se acepta la separación D1-DESIGN/D1-IMPLEMENTATION.
2. Congelar D0-C1…C4 como un solo contrato coherente.
3. Congelar alcance y ownership de admisión D2, tras caracterizar locks actuales.
4. Congelar migración/cutover/rollback D3.
5. Hacer revisión de consistencia cruzada sobre el snapshot exacto.
6. Solicitar autorización de implementación separada y delimitada.
7. Implementar y probar; ligar logs, jobs y resultados al SHA exacto de código + tests.

No se debe inferir aceptación de ninguna fila por la instrucción general de continuar.

## 7. Estado canónico

- M0: `INCOMPLETO`
- D0/D1/D2/D3: `OPEN`
- D1-S0: recomendación de separación, **no aceptada aún**
- Autorización de implementación: `NOT_EVALUATED`
- Raíz legítima: `PENDING/UNKNOWN`
- Efectos protegidos: `STOP`
- Runtime/tests/workflows: sin cambios
- Tests/CI: no ejecutados en esta pasada

## 8. Instrucción de continuidad

Continuar desde este paquete, los ledgers existentes y el snapshot de rama citado. No repetir el censo ya documentado salvo cambio de fuente. No convertir recomendaciones en decisiones del propietario. Siguiente trabajo técnico sin decisión del propietario: reconciliar contratos D2/D3 con las propuestas de D0 y enumerar contradicciones/condiciones de cierre, sin implementar.
