# GRAND MISSION 01 — Hoja de ruta maestra (Master Roadmap)

- **Naturaleza:** PROPUESTA estratégica (Fases VI y VIII). **No es autorización de implementación** y **no contiene tareas de implementación para M0** (M0 sigue intocable; sus decisiones y gates pertenecen a su propio expediente). Sin fechas ficticias: las fases se ordenan por dependencias y criterios de salida, no por calendario.
- **Orden estratégico inalterable (anexo):** 1. Terminar NCS M0 sin ampliar su alcance. 2. Reconciliar el trabajo histórico (esta misión). 3. Desarrollar y evaluar la arquitectura de descubrimiento sobre fundamentos seguros y decisiones explícitas.
- **Entorno de referencia:** Poco X7 Pro (Android/Termux), **sin ordenador** (declarado por el propietario, 2026-11-06). Nexo se diseña para teléfono y ordenador; la fase móvil es restricción de diseño, no autorización de pruebas. Todo lo que requiera infraestructura que el propietario no tiene se marca como dependencia, no como supuesto.

## 1. Viabilidad por etapas (Fase VI)

| Horizonte | Qué es viable | Condición |
|---|---|---|
| **Viable ahora** (sin infraestructura nueva, tras M0) | Knowledge System + MCC sobre almacén propio (SQLite + registro append-only); Discovery por reglas sobre el grafo; Experiment como scripts acotados; Model Router simple con un motor; correcciones A1/A2/B/C/D de la auditoría de código | M0 cerrado; decisiones de alcance del propietario (ver §3.E) |
| **Viable con infraestructura adicional** | Sandbox fuerte (Candidata B completa); verificación cruzada sistemática E16; ancla externa mínima del registro de auditoría; ensayo de recuperación E20 en entorno limpio | Acceso a ordenador o servicio de sandbox; decisión D-04 (anclaje) |
| **Requiere investigación** | Detección de relaciones causales E3; transferencia cross-dominio E7/E8; calibración E17 con muestra suficiente; verificación de continuidad semántica entre modelos (fallo estructural central) | Corpus de casos con resultado conocido; tiempo de acumulación |
| **Requiere hardware superior** | Inferencia local de modelos medianos; sandbox con aislamiento por hardware | El Poco X7 Pro limita tamaño de modelo y aislamiento; sin ordenador, esta línea queda en espera |
| **Requiere nuevos mecanismos de seguridad** | Verificación criptográfica de política (C); frontera OwnerFence/PreparedIntent durable (hoy RESEARCH ONLY); ancla anti-rollback | Diseño + implementación + pruebas de fault-inyección C0–C8 |
| **No demostrado** | Toda la arquitectura de descubrimiento (Fases III–V de esta misión); MCC como grafo causal; competencia medible | Prototipos evaluados (E11) — es el trabajo de las fases 2–4 de abajo |
| **Desconocido** | W1→R1 y W1→D1 (G0); granularidad mínima P112; legacy post-2035; jurisdicción; continuidad semántica entre modelos | Evidencia primaria nueva; no se resuelve por planificación |

**Evolución evaluada (sin forzar todo al dispositivo actual):** operación local → memoria persistente independiente → funcionamiento degradado sin Internet → motores externos intercambiables → capacidades de programación → investigación técnica → experimentación aislada → desarrollo de herramientas → aprendizaje acumulativo. Lo local: identidad, memoria, MCC, investigación documental/analítica, evaluadores deterministas, experimentos acotados. Lo delegado a infraestructura externa (cuando exista): inferencia amplia, sandbox fuerte, anclaje. **Sin transferir identidad ni autoridad** en ninguna delegación: lo externo recibe tareas y contexto mínimo; devuelve resultados que se verifican antes de consolidarse.

## 2. Fases estratégicas posteriores a M0

### Fase 0 — Cierre de M0 (precondición, fuera de esta misión)
- **Objetivo:** cerrar NCS M0 (P05, P07-C, P09 y gates) sin ampliar su alcance. Esta misión no lo ejecuta ni lo evalúa.
- **Dependencias:** decisiones del propietario del expediente M0 (A-01–A-09 y análogas).
- **Criterios de salida:** los que fije el expediente M0. **Condición de bloqueo para todo lo demás:** ninguna fase de descubrimiento autónomo se implementa sobre un M0 abierto.

### Fase 1 — Correcciones de realidad (sobre el código existente)
- **Objetivo:** cerrar los hallazgos A–E de la auditoría de código para que el código existente sea base confiable.
- **Capacidades:** A1 (prueba a `policyRef` tipado), A2 (validación de forma de elementos), B (reconciliación vinculada), C (verificación criptográfica de política o degradación explícita del claim), D (cableado productivo de la cadena protegida o declaración formal de ruta paralela como única productiva).
- **Dependencias:** Fase 0. **Riesgos:** tocar el núcleo sin M0 cerrado (prohibido: por eso es Fase 1, no ahora).
- **Evidencias de salida:** pruebas actualizadas + CI con ID sobre SHA congelado que las contenga; matriz de realidad re-emitida sin PARTIAL en A–D.
- **Criterios de aceptación:** A1/A2 con prueba que fija el comportamiento; B con pruebas de no-coincidencia; C con verificación real o claim degradado en todos los documentos; D con integración sin stubs en eslabones críticos.
- **Decisiones del propietario:** alcance de C (¿criptografía o degradación?), destino de la cadena protegida vs ruta paralela (D).

### Fase 2 — Sustrato propio (Candidata A)
- **Objetivo:** Knowledge System + MCC + almacén propio desacoplado de Lúmina; Discovery por reglas; Experiment acotado; Model Router simple.
- **Capacidades:** E2, E4, E5, E12, E21 (P0 del catálogo) sobre el sustrato.
- **Dependencias:** Fase 1; decisión de almacén canónico (fin de la divergencia de dos almacenes).
- **Riesgos:** construir el sustrato sobre el sobre de Lúmina «mientras tanto» y quedarse ahí (mitigación: el almacén propio es criterio de salida, no aspiración).
- **Evidencias de salida:** grafo poblado con el expediente Nexo real; detección de los casos sembrados (F-E11, A1, A2A) en simulación; MCC con supersesión registrada.
- **Criterios de aceptación:** E2/E5/E12/E21 con tasas medidas sobre casos conocidos; cero auto-citas promovidas a FACT en prueba.
- **Decisiones del propietario:** almacén canónico; definición de «claim crítico» para verificación cruzada; presupuestos de ciclo (E22).

### Fase 3 — Aprendizaje y calibración
- **Objetivo:** Learning Engine con competencia medible; calibración E17; meta-investigación E1; mejores preguntas E15.
- **Dependencias:** Fase 2 (grafo + MCC poblados).
- **Evidencias de salida:** predicciones fechadas puntuadas; curvas de calibración por dominio; plantillas de investigación revisadas con comparación antes/después.
- **Criterios de aceptación:** error de calibración decreciente; mejora de método medida con casos retenidos.
- **Decisiones del propietario:** dominios piloto; umbrales de competencia para «saber» un dominio.

### Fase 4 — Ingeniería y evolución controlada
- **Objetivo:** Creative/Engineering Engine con Admisión separada; síntesis de herramientas E10 en sandbox; evaluación E11; automatización E9; ensayo de recuperación E20.
- **Dependencias:** Fases 2–3; sandbox validado en el dispositivo real (si es el móvil, declarar el límite).
- **Evidencias de salida:** herramienta candidata evaluada (E11) y admitida o rechazada con registro; ensayo de recuperación en copia con pérdidas declaradas.
- **Criterios de aceptación:** cero auto-admisiones; ensayo de recuperación con identidad+Constitución restauradas en entorno limpio.
- **Decisiones del propietario:** qué candidatos pueden proponerse; política de instalación de herramientas sintetizadas.

### Fase 5 — Endurecimiento (Candidata B completa; elementos de C)
- **Objetivo:** doble anillo con sandbox fuerte; verificación cruzada sistemática E16; ancla externa mínima del registro/MCC (si se decide); Preparedness como ensayos de resiliencia.
- **Dependencias:** infraestructura (ordenador o servicio); decisiones D-04/D-10/D-12.
- **Evidencias de salida:** fault-inyección C0–C8 sobre la frontera transaccional; ejercicio de sustitución de proveedor; ancla verificada (si se decide).
- **Criterios de aceptación:** invariantes I-1–I-10 con prueba de violación sembrada cada uno (ver `GRAND_MISSION_01_ADVERSARIAL_REVIEW.md` §2/§5).
- **Decisiones del propietario:** anclaje (D-04), recuperación (D-10), dependencias materiales (D-12), y cualquier paso hacia Candidata C.

## 3. Plan maestro por componente (Fase VIII)

Para cada componente: existe / ubicación / estado real / qué se reutiliza / qué se corrige / qué se desacopla / qué falta diseñar / qué falta implementar / qué debe probarse / qué evidencia demostraría su funcionamiento / qué decisión corresponde al propietario.

### A. Fundamentos existentes (reutilizar)
| Componente | Ubicación | Estado real | Reutilización |
|---|---|---|---|
| Contratos tipados e inmutabilidad | `src/nexo/core/contracts.mjs` | IMPLEMENTED + TESTED; CI @ `6c06a6fe` | Base del Knowledge System (sobres de claim) |
| Commit condicional | `src/nexo/adapters/conditional-commit-persist-state.mjs` + `persistState` | IMPLEMENTED + TESTED; CI @ `de859aa0` | Primitiva de escritura de todos los almacenes propios |
| Clasificador de outcomes | `src/nexo/core/outcome-classifier.mjs` | IMPLEMENTED + TESTED; CI @ `8ac970ed` | Vocabulario terminal del ciclo de descubrimiento |
| Observación + equivalencia | `src/nexo/core/observation*.mjs` | IMPLEMENTED + TESTED; CI UNKNOWN | Captura OBSERVE con procedencia |
| Evaluadores Python | `src/nexo/*.py` | IMPLEMENTED + TESTS EXIST; CI UNKNOWN | Precedente de análisis local sin autoridad; base de E11 para análisis deterministas |
| Pila runtime/orchestrator/effect-adapter | `src/nexo/runtime.js`, `orchestrator.js`, `effect-adapter.js`, `simulation-adapter.js` | IMPLEMENTED + TESTED (acoplada a Lúmina) | Referencia de flujo (PREPARED durable, pre/postcondición); **no** sustrato de Nexo |
| Patrones discovery/planning | `src/discovery.js`, `src/planning.js` | IMPLEMENTED (Lúmina) | Inspiración de diseño (confianza acotada, replanning acotado); **no** código de Nexo |

### B. Correcciones necesarias (antes de construir encima)
| Componente | Qué se corrige | Qué debe probarse | Evidencia de funcionamiento | Decisión del propietario |
|---|---|---|---|---|
| Validación semántica (A1/A2) | Prueba a `policyRef` tipado; validación de forma de elementos en contratos | Prueba que fije strings rechazados o mapeados; PASS imposible sin comprobar dependencias | CI con ID sobre SHA con prueba actualizada | Ninguna (corrección técnica) |
| Reconciliación (B) | Binding evidencia↔caso/claim/boundary/objetivo/efecto/vigencia/procedencia | Pruebas de no-coincidencia por cada dimensión | Suite de reconciliación semántica en CI | Ninguna |
| Confianza de política (C) | Verificación criptográfica real **o** degradación explícita del claim en todos los documentos | Verificación contra contenido (firma/recomputación) | Prueba con política alterada rechazada | **Alcance de C** (criptografía vs degradación) |
| Cadena protegida (D) | Cableado productivo con puertos reales **o** declaración formal de la ruta paralela | Integración extremo a extremo sin stubs en eslabones críticos | Prueba de integración + CI en SHA | **Destino de la cadena protegida** |
| Almacenes de memoria | Contrato canónico único para memoria Nexo; fin del almacén muerto `nexo` en `.lumina-assistant-memory.json` | Consistencia entre almacén y sobre tras reinicio | Prueba de reconstrucción con un solo almacén autoritativo | **Almacén canónico** |
| Aislamiento de snapshots | Clonado profundo de `nexoMemory`/journal en `applyState` (alias P112) | Prueba de no-alias | Test de mutación sin efecto en snapshot | Ninguna |
| Procedencia de recuperación | `loadState` con marca de fallo (no estado por defecto indistinguible) | Prueba de fallback marcado | Test de recuperación | Ninguna |

### C. Componentes nuevos (diseñados en esta misión, sin implementar)
World Model tipado · Knowledge System con grafo/cuarentena/caducidad · Discovery Intelligence · Learning Engine con competencia medible · Experiment Engine reproducible · Creative/Engineering Engine · MCC · Model Router · Admisión separada · Preparedness como función de Experiment+Continuity · sandbox de experimentación · almacén propio de continuidad. Para cada uno: diseño en `GRAND_MISSION_01_AUTONOMOUS_DISCOVERY_ARCHITECTURE.md` y `GRAND_MISSION_01_EMERGENT_CAPABILITIES.md`; falta: especificación técnica verificable, implementación, pruebas y evaluación E11. **Ninguno se implementa en esta misión.**

### D. Investigación pendiente
Continuidad semántica entre modelos (fallo estructural central); verificación de completitud sobre Merkle (U9 acotado: inclusión/consistencia sí, completitud no); legacy post-2035 (SP 800-131A futuro); jurisdicción del propietario (eIDAS); texto original C01–C16 y cadena P7; A2A §8.4 contra tag v1.0.1 (I-02); controles SP 800-53 verbatim de C09/C10/C12; granularidad mínima P112; W1→R1/W1→D1 (G0); SCITT (RFC 9943) y `did:dht` (lecturas complementarias de la Misión 005, pendientes de encargo); unicidad de la MCC (requiere comparativa rigurosa, no afirmada).

### E. Decisiones reservadas al propietario
Ver `GRAND_MISSION_01_OWNER_DECISIONS.md` (D-01–D-12, 9 de Misión 01, y decisiones nuevas de esta misión). Ninguna se resuelve aquí.

### F. Elementos bloqueados por M0
Toda implementación de la arquitectura de descubrimiento; cualquier cambio en NCS M0/P07/P05/P08/P09; la cadena protegida como capacidad productiva (su cierre pertenece al expediente M0); el anclaje externo como requisito (D-RB-04 A del expediente M0: DECIDED pero no satisfecho — esta misión no lo ejecuta ni lo re-decide); cualquier claim universal bajo R1 (I-1–I-7 del expediente M0: inviable por diseño, no por esta misión).

## 4. Condiciones de bloqueo generales

- M0 abierto → ninguna fase de implementación de descubrimiento.
- Sin decisión de almacén canónico → no construir sustrato sobre el sobre de Lúmina.
- Sin sandbox validado en el dispositivo real → experimentación solo acotada (Candidata A con límites declarados), sin claim de aislamiento fuerte.
- Sin definición de «claim crítico» → verificación cruzada E16 no se activa (no se improvisa el umbral).
- Sin presupuesto autorizado → investigación autónoma solo en modo preparación (E22).
