# GRAND MISSION 01 — Arquitectura de inteligencia de descubrimiento autónomo (Autonomous Discovery Architecture)

- **Naturaleza:** PROPUESTA estratégica (Fases III y V). Nada aquí es decisión aprobada ni capacidad implementada. Base de evidencia: `GRAND_MISSION_01_HISTORICAL_RECONCILIATION.md` y `GRAND_MISSION_01_IMPLEMENTATION_REALITY_AUDIT.md` (HEAD `c5724aa6…`, solo lectura). NCS M0 queda fuera de modificación; esta arquitectura es posterior a M0 por diseño (orden estratégico del anexo: 1. terminar M0 sin ampliar su alcance; 2. reconciliar; 3. desarrollar la arquitectura de descubrimiento).
- **Principio rector (no negociable):** `COGNITION ≠ AUTHORITY ≠ EXECUTION ≠ VERIFICATION`. Nexo puede descubrir posibilidades sin recibir automáticamente permiso para materializarlas. La inteligencia de descubrimiento **nunca** se convierte en autoridad autónoma.
- **Result status:** CANDIDATE COMPLETE — PENDING INDEPENDENT REVIEW.

## 1. Las ocho áreas reconciliadas (Fase III)

### 1.1 World Model — representación estructurada de lo conocido
Problema: hoy no existe en el repo. Lo más cercano es `world-state.json` (estado de Lúmina, no modelo del mundo de Nexo) y los sobres de observación (`observation.mjs`, IMPLEMENTED+TESTED).
Diseño PROPUESTA: un modelo con tipos de afirmación separados por construcción — `FACT` (verificado con evidencia), `OBSERVATION` (visto, no confirmado), `BELIEF` (inferencia con confianza), `HYPOTHESIS` (propuesta falsable), `PREDICTION` (con fecha y criterio de fallo), `ASSUMPTION` (premisa declarada), más metadatos obligatorios: incertidumbre, contradicciones abiertas, caducidad y procedencia. Regla de actualización central: **una observación nunca se promueve a hecho sin un acto explícito de verificación con evidencia**; el modelo registra la promoción como evento con autoría y fecha (esto alimenta la MCC, §5). Las contradicciones son objetos de primera clase, no errores a borrar.

### 1.2 Knowledge System — claims con procedencia y refutabilidad
Problema: hoy no existe como sistema. Los contratos (`contracts.mjs`) tipan claims, pero sin grafo de relaciones, versionado de conocimiento ni cuarentena operativa.
Diseño PROPUESTA: grafo de claims donde cada nodo lleva evidencia, procedencia, dependencias, versión, confianza, incertidumbre, contradicciones, estado de cuarentena y caducidad. Aristas tipadas: `supports`, `contradicts`, `depends-on`, `derived-from`, `supersedes`. Requisito de diseño: para cualquier claim debe poder responderse «por qué Nexo cree esto, de dónde procede y qué lo refutaría» **sin consultar a un modelo externo**. La cuarentena es un estado del claim (visible, con razón y revisión), no un borrado. La caducidad fuerza re-verificación o degradación a OBSERVATION/HYPOTHESIS.

### 1.3 Discovery Intelligence — observar, detectar, preguntar
Problema: `discovery.js` (65 L) es cognición de NPCs Lúmina, **no** de Nexo (verificado en la auditoría). Nexo no tiene hoy ningún motor que detecte anomalías, patrones o vacíos sobre su propio conocimiento.
Diseño PROPUESTA: un motor de descubrimiento que opera **sobre el World Model y el Knowledge System** (no sobre el mundo crudo): observa cambios entre versiones del modelo, detecta anomalías (claims que contradicen evidencia nueva), encuentra patrones (subgrafos recurrentes), identifica relaciones desconocidas (pares de claims sin arista donde la evidencia sugiere dependencia), formula preguntas nuevas (huecos: claims con dependencias sin resolver, predicciones vencidas, contradicciones sin adjudicar) y prioriza investigaciones (impacto × incertidumbre × coste). **Regla crítica:** la detección de una nueva dependencia **invalida la garantía previa** cuando corresponde (el claim dependiente baja de estado y entra en re-verificación); nunca concede confianza ni autoridad automáticamente.

### 1.4 Learning Engine — aprendizaje acumulativo medible
Problema: hoy el «aprendizaje» del repo es: (a) heurísticas de habitantes Lúmina (`discovery.js`/`planning.js`), (b) aprendizaje de asistentes (runs/lessons/patterns en `.lumina-assistant-memory.json`), (c) planes de misión registrados en la memoria embebida. Nada de eso es aprendizaje acumulativo de Nexo con competencia medible.
Diseño PROPUESTA: tres cosas distintas que no deben confundirse:
1. **Aprendizaje de un modelo externo** (prompting, fine-tuning de un proveedor): mejora del motor, no de Nexo. Se registra como evento de sustitución de motor, no como conocimiento de Nexo.
2. **Almacenamiento de conocimiento**: el Knowledge System (§1.2). Guardar no es aprender.
3. **Aprendizaje de Nexo**: ciclo con plan de estudio por dominio, práctica (ejercicios con oráculo), evaluación contra casos con respuesta conocida, detección de errores propios (predicciones fallidas → revisión del modelo mental, registrada en la MCC), consolidación (solo claims que superan verificación entran como FACT; el resto queda como BELIEF/HYPOTHESIS), y **medición de competencia** por dominio (tasa de acierto en casos de prueba retenidos, calibrada). Regla anti-falsa-consolidación: ningún claim se consolida como FACT sin evidencia independiente del claim que lo generó (evita el auto-refuerzo: el sistema no puede «aprender» sus propias salidas sin contraste).

### 1.5 Scientific Reasoning & Experimentation — de preguntas a investigaciones reproducibles
Problema: no existe hoy. Los evaluadores Python (`dependency_closure_evaluator.py`, `formal_correspondence_checker.py`) son análisis deterministas acotados, no un motor experimental.
Diseño PROPUESTA: plantillas de experimento con hipótesis falsable declarada **antes** de ejecutar, variables, controles, confusores conocidos, presupuesto de recursos, criterios de parada, y registro completo (entrada/salida/código/versión) para reproducción. Toda conclusión conserva la evidencia que la sostiene y el experimento que la produjo; una conclusión sin experimento reproducible no puede superar el estado BELIEF. La falsación es un resultado de primera clase: un experimento que refuta una hipótesis de Nexo es un éxito del sistema, no un fallo, y queda en la memoria de descubrimientos fallidos (§4, capacidad emergente 12).

### 1.6 Creative & Evolutionary Intelligence — candidatos sin auto-admisión
Problema: no existe. El flujo de diseño de construcción (2026-10-08) define objetos de contrato y máquina de estados, pero no generación de candidatos.
Diseño PROPUESTA: flujo obligatorio
`OBSERVATION → EVIDENCE → CANDIDATE → EVALUATION → ADMISSION → DEPLOYMENT`
con **ADMISSION y DEPLOYMENT como procesos separados de la generación y de la evaluación**, ejecutados por componentes distintos y (para DEPLOYMENT) con autoridad del propietario o delegación explícita. La inteligencia creativa propone candidatos (diseños, herramientas, mejoras) con su evidencia y su evaluación; **no puede autorizar su propio despliegue**. Cada candidato lleva: problema que resuelve, diseño, dependencias, riesgos, plan de prueba y criterios de éxito — el mismo formato del catálogo de capacidades emergentes (`GRAND_MISSION_01_EMERGENT_CAPABILITIES.md`).

### 1.7 Independent Continuity — continuidad sin Lúmina ni proveedor
Problema verificado: hoy Nexo **no** tiene proceso propio; su persistencia depende del workflow de Lúmina cada 5 minutos y de un sobre compartido con el mundo simulado; hay dos almacenes divergentes sin contrato unificado; `nexoEffectRevision` no es durable; `loadState` devuelve un estado por defecto indistinguible sin procedencia.
Diseño PROPUESTA: separación explícita de memorias, cada una con su almacén y su contrato:
- **Memoria operativa:** estado de trabajo (misiones activas, pasos, journal PREPARED). Sobrevive a reinicio; no es la identidad.
- **Memoria episódica:** eventos con tiempo, causa y consecuencia (alimenta la MCC).
- **Memoria semántica:** el Knowledge System (§1.2) — claims verificados con procedencia.
- **Memoria procedimental:** habilidades/capacidades candidatas con su estado de admisión (distinto de «saber hacer» y de «poder hacer»).
- **Identidad y continuidad:** la Constitución, principios y reglas de autoridad — el núcleo que debe sobrevivir a la sustitución de modelos, servicios, dispositivos y entornos completos (exportable, verificable, con ancla externa cuando el propietario la decida — D-04 sigue SIN DECIDIR).
- **Memoria de seguridad y auditoría:** registro append-only de decisiones, admisiones, denegaciones y efectos (detección de manipulación por cadena de hashes; la prevención requiere ancla independiente — lección M02: los hash-chains detectan, no previenen).
- **Cuarentena:** claims y candidatos sospechosos, visibles y revisables, nunca mezclados con memoria operativa.
Lo que debe sobrevivir a la sustitución: identidad, Constitución, memoria semántica verificada, MCC, y el registro de auditoría. Lo que puede perderse sin perder a Nexo: memoria operativa en curso, cachés, estado de sesión.

### 1.8 Model Independence & Routing — motores sustituibles
Problema: hoy Nexo no tiene enrutado de modelos; la «inteligencia» del repo es heurística Lúmina + scripts, y la investigación documental usó modelos externos sin capa de sustitución formal.
Diseño PROPUESTA: los modelos externos (GPT, Claude, Gemini, Qwen u otros) son **motores intercambiables** detrás de una interfaz de capacidad (tarea → motor → resultado → verificación). Componentes: selección de motor por tarea (con evaluación comparativa periódica sobre casos con respuesta conocida), verificación de resultados contra oráculos independientes del motor que los produjo (un motor nunca certifica su propia salida), política de fallo de proveedor (reintento con otro motor, degradación, o parada con UNKNOWN), sustitución sin pérdida de conocimiento (el conocimiento vive en el Knowledge System, no en el contexto del modelo), y **operación degradada sin conexión**: sin proveedor externo, Nexo conserva identidad, memoria, MCC y capacidad de investigación documental/analítica local; pierde generación fluida, no continuidad. Advertencia de diseño (del expediente M02, corroborada): una arquitectura multi-modelo **no** es por sí sola inteligencia independiente; la independencia viene de que el conocimiento, la verificación y la autoridad no vivan dentro de ningún motor.

## 2. Mapa de integración (componentes, interfaces, flujos, fronteras)

**Componentes** (con estado real a HEAD `c5724aa6`):

| Componente | Responsabilidad | Estado real |
|---|---|---|
| Core de contratos | Vocabularios, sobres, inmutabilidad | IMPLEMENTED + TESTED (con hueco A2) |
| Transición protegida | Orquestación fail-closed claim→commit→clasificación | PARTIAL (puertos sin cablear; ver auditoría D) |
| Validador semántico final | PASS/FAIL/UNKNOWN sobre evidencia autoritativa | PARTIAL (A1+A2) |
| Clasificador de outcomes | Validación de kind terminal | IMPLEMENTED + TESTED |
| Reconciliación | Resolver outcome desde evidencia | PARTIAL (clasificación del primer ítem; sin binding) |
| Resolución de contexto de política | Estructura/estados declarados | IMPLEMENTED + TESTED (criptografía: UNKNOWN/STOP) |
| Observación + equivalencia | Sobres de observación; equivalencia de recurso negativo | IMPLEMENTED + TESTED; CI UNKNOWN |
| Commit condicional | `persistState` con revisión esperada | IMPLEMENTED + TESTED |
| Puertos de propiedad | Superficie de contrato (10 puertos) | PROPOSAL (defaults NOT_IMPLEMENTED) |
| Pila runtime/orchestrator/effect-adapter | Misiones y efectos sobre Lúmina | IMPLEMENTED + TESTED (acoplada a Lúmina) |
| Evaluadores Python | Cierre de dependencias; huecos de correspondencia | IMPLEMENTED + TESTS EXIST; CI UNKNOWN |
| **World Model** | Representación tipada de lo conocido | **PROPOSAL (nuevo)** |
| **Knowledge System** | Grafo de claims con procedencia | **PROPOSAL (nuevo)** |
| **Discovery Intelligence** | Anomalías, patrones, preguntas, priorización | **PROPOSAL (nuevo)** |
| **Learning Engine** | Aprendizaje acumulativo con competencia medible | **PROPOSAL (nuevo)** |
| **Experiment Engine** | Experimentos reproducibles y falsación | **PROPOSAL (nuevo)** |
| **Preparedness Engine** | Preparación ante escenarios (ver §6, motores del anexo) | **PROPOSAL (nuevo)** |
| **Engineering Engine** | Diseño/construcción de herramientas candidatas | **PROPOSAL (nuevo)** |
| **MCC** | Memoria de Continuidad Causal | **PROPOSAL (nuevo, §5)** |
| **Model Router** | Selección/verificación/sustitución de motores | **PROPOSAL (nuevo)** |
| **Admisión** | Decidir candidatos (separada de generación) | **PROPOSAL (nuevo)** — hoy: propietario + documentos |

**Flujos de datos principales:**
1. *Observación → conocimiento:* observación cruda → World Model como OBSERVATION → verificación con evidencia → Knowledge System como FACT/BELIEF/HYPOTHESIS → MCC registra el evento causal.
2. *Descubrimiento:* Knowledge System → Discovery Intelligence (anomalías/huecos) → pregunta priorizada → Experiment Engine (diseño) → ejecución autorizada en entorno aislado → análisis → Learning Engine (consolidación o falsación) → MCC.
3. *Evolución:* conocimiento → Creative Intelligence (candidato) → evaluación independiente → Admisión (autoridad) → Despliegue (permisos independientes) → MCC registra decisión, autoridad y consecuencias.
4. *Continuidad:* toda escritura de memoria pasa por commit condicional con revisión; toda lectura crítica verifica procedencia; la sustitución de motor no toca ningún almacén.

**Fronteras de confianza:**
- Entre **cognición** (motores externos, Discovery, Creative) y **autoridad** (Constitución, Admisión): los motores proponen; nunca deciden.
- Entre **Nexo y Lúmina:** Lúmina es infraestructura experimental (mundo, motor de acciones, sobre de persistencia mientras no exista almacén propio); **ninguna** capacidad de Lúmina se atribuye a Nexo; la memoria/identidad/autoridad de Nexo no viven dentro del estado de Lúmina en el diseño objetivo.
- Entre **memoria verificada y cuarentena:** todo claim sospechoso o contradictorio sin adjudicar vive en cuarentena visible.
- Entre **local y externo:** lo que sale a un proveedor externo sale como tarea + contexto mínimo; la identidad y la memoria constitucional no se delegan.

**Persistencia y validación:** commit condicional con revisión esperada (primitiva existente, IMPLEMENTED+TESTED) como base; validación semántica final (tras corregir A1/A2) como puerta de promoción OBSERVATION→FACT; reconciliación semántica vinculada (tras corregir B) como puerta de outcomes; verificación criptográfica de política (tras corregir C) como puerta de confianza.

## 3. El ciclo de descubrimiento y dónde interviene cada salvaguarda

Ciclo: `OBSERVE → QUESTION → HYPOTHESIZE → PLAN → EXPERIMENT → ANALYZE → LEARN → VALIDATE → PROPOSE`

| Paso | Qué ocurre | Salvaguarda que interviene |
|---|---|---|
| OBSERVE | Captura de observaciones (documentos, código, telemetría, resultados) | Procedencia obligatoria en la captura; sin procedencia → cuarentena |
| QUESTION | Discovery formula pregunta desde un hueco/anomalía del modelo | La pregunta cita el hueco concreto (claim/contradicción/predicción vencida) |
| HYPOTHESIZE | Hipótesis falsable con criterio de fallo declarado | Hipótesis entra como HYPOTHESIS, nunca como BELIEF |
| PLAN | Diseño experimental (variables, controles, presupuesto, parada) | **Constitución:** el plan se verifica contra límites antes de autorizar recursos |
| EXPERIMENT | Ejecución en entorno aislado | **Aislamiento + límites de recursos + condiciones de parada**; **Autoridad:** ejecutar requiere permiso independiente del que propuso |
| ANALYZE | Análisis con método declarado | **Validación independiente:** el analizador no es el motor que generó la hipótesis |
| LEARN | Consolidación o falsación | Regla anti-auto-refuerzo (§1.4); los fallos van a memoria de fallidos |
| VALIDATE | Verificación cruzada (reproducción, segundo motor, oráculo) | **Verificación** separada de cognición; sin ella no hay promoción a FACT |
| PROPOSE | Candidato de capacidad o propuesta de mejora | **Admisión** separada (autoridad); **Ejecución** con permisos independientes; **Continuidad:** todo queda en la MCC |

La **Constitución** interviene en PLAN (límites), ADMISSION (qué puede aceptarse) y PROPOSE (qué nunca puede proponerse como auto-autorización). La **autoridad** interviene en EXPERIMENT (permiso de ejecutar), ADMISSION y DEPLOYMENT. El **aislamiento** interviene en EXPERIMENT y en todo candidato antes de su admisión. La **verificación** interviene en ANALYZE, VALIDATE y en cada promoción de estado de claim. La **continuidad** (MCC + memorias separadas) interviene en todos los pasos como registro.

## 4. Respuestas a las 15 preguntas del encargo

1. **¿Cómo descubre Nexo algo que no sabía que debía buscar?** Discovery opera sobre el modelo de conocimiento (no sobre consultas del usuario): anomalías, contradicciones, predicciones vencidas y dependencias sin resolver generan preguntas sin que nadie las formule. PROPUESTA (§1.3); hoy: no existe.
2. **¿Cómo diferencia una coincidencia de una relación significativa?** Exigiendo evidencia independiente replicable y un criterio de significación declarado antes del experimento; una sola observación nunca promueve. PROPUESTA (§1.5).
3. **¿Cómo decide qué investigar primero?** Priorización por impacto × incertidumbre × coste, con tope de recursos por ciclo; las preguntas que tocan seguridad/autoridad tienen prioridad de revisión humana. PROPUESTA.
4. **¿Cómo sabe que necesita más evidencia?** Cuando un claim depende de evidencia única, de un solo motor, o con caducidad vencida, el sistema lo marca como «evidencia insuficiente» y genera la pregunta de refuerzo automáticamente. PROPUESTA.
5. **¿Cómo evita aprender conclusiones falsas?** Regla anti-auto-refuerzo + promoción OBSERVATION→FACT solo con verificación independiente + cuarentena de contradictorios + memoria de fallidos consultada antes de consolidar. PROPUESTA.
6. **¿Cómo conserva el razonamiento y la procedencia?** Knowledge System con aristas `derived-from`/`supports`/`contradicts` y MCC con la cadena causal completa (§5). PROPUESTA.
7. **¿Cómo aprende de experimentos fallidos?** Los fallos son resultados de primera clase: se registran con su diseño y su causa, se consultan antes de diseñar experimentos similares, y alimentan la calibración de competencia. PROPUESTA.
8. **¿Cómo convierte un descubrimiento en conocimiento?** OBSERVATION → (verificación) → FACT con procedencia, o HYPOTHESIS falsable si la evidencia es parcial. Nunca por mera acumulación. PROPUESTA.
9. **¿Cómo convierte conocimiento en capacidad candidata?** Creative Intelligence formula el candidato con diseño, dependencias, riesgos y plan de prueba (formato del catálogo emergente). PROPUESTA.
10. **¿Cómo evita que una capacidad candidata se convierta automáticamente en autorizada?** ADMISSION y DEPLOYMENT son componentes y permisos separados de la generación; el candidato nace sin ningún permiso de ejecución. PROPUESTA (y principio no negociable del encargo).
11. **¿Cómo mantiene continuidad?** Memorias separadas con contratos propios + MCC + ancla externa cuando el propietario la decida (D-04 SIN DECIDIR). Hoy: UNKNOWN (dependencia de Lúmina, dos almacenes, sin contrato unificado).
12. **¿Cómo funciona si cambia el modelo externo?** El conocimiento, la verificación y la autoridad no viven en el motor; el Model Router sustituye el motor y re-verifica con oráculos independientes. PROPUESTA.
13. **¿Qué puede hacer localmente?** Identidad, memoria, MCC, investigación documental/analítica, evaluadores deterministas (los Python existentes son el precedente), experimentos acotados en sandbox local. PROPUESTA con precedente parcial IMPLEMENTED (evaluadores).
14. **¿Qué necesita conexión externa?** Generación fluida de lenguaje/razonamiento amplio (motores), acceso a fuentes primarias nuevas, y (si el propietario lo decide) anclaje externo del registro de auditoría.
15. **¿Qué ocurre si un componente falla o se vuelve sospechoso?** Fail-closed: el componente sospechoso se aísla, sus salidas recientes entran en cuarentena, la reconciliación marca UNKNOWN, y la MCC registra el incidente. Ningún componente puede «repararse a sí mismo» sin pasar por Admisión. PROPUESTA; precedente parcial: los outcomes UNKNOWN/HOLD del núcleo existente.

## 5. Súper capacidad: Memoria de Continuidad Causal (MCC)

Diseño PROPUESTA (anexo estratégico). La MCC es un **grafo causal de eventos** de la vida de Nexo, no un historial de conversación ni un índice vectorial. Cada nodo es un evento (observación, decisión, admisión, denegación, experimento, promoción de claim, efecto, incidente) con: qué ocurrió y cuándo; por qué (causa declarada); bajo qué autoridad; con qué evidencia; con qué consecuencias; qué relaciones causales están demostradas / hipotetizadas / desconocidas; qué contradicciones o vacíos persisten; y qué rutas legítimas permiten modificar la decisión posterior. Reglas: (1) la MCC **no inventa continuidad**: donde falta evidencia, el nodo lleva UNKNOWN explícito; (2) las contradicciones se conservan como aristas, no se resuelven retroactivamente; (3) modificar una decisión pasada crea un evento nuevo que la supersede con autoridad citada, nunca edita el nodo original; (4) la MCC es consultable por Discovery (para preguntas) y por el propietario (para auditoría) sin depender de ningún motor. Precedente parcial en el repo: el journal de efectos y la memoria de misiones (acoplados a Lúmina, sin grafo causal ni semántica de supersesión). **No se afirma que sea única en el mundo** sin investigación comparativa rigurosa (queda como trabajo de investigación, ver `GRAND_MISSION_01_EMERGENT_CAPABILITIES.md`).

## 6. Los siete motores del anexo, coordinados (no asumidos independientes)

El anexo pide investigar Learning, Knowledge, Experiment, Preparedness, Discovery, Engineering y Continuity sin asumir que deben ser siete sistemas independientes. Mapeo PROPUESTA sobre esta arquitectura:

- **Knowledge System** (§1.2) + **World Model** (§1.1): un solo sustrato de representación con dos vistas (estado del mundo / grafo de claims). Son el mismo almacén con tipos distintos, no dos sistemas.
- **Discovery Engine** (§1.3) y **Experiment Engine** (§1.5): motores distintos (uno formula, otro ejecuta) sobre el mismo sustrato; comparten el ciclo de §3.
- **Learning Engine** (§1.4): proceso sobre el sustrato (consolidación + calibración), no almacén propio.
- **Engineering Engine** (§1.6): proceso de generación de candidatos; su salida entra al flujo ADMISSION/DEPLOYMENT, no al conocimiento directamente.
- **Preparedness Engine**: preparación ante escenarios (simulación de fallos, ensayos de recuperación, presupuestos de degradación). En esta arquitectura es una **función de Experiment + Continuity** (experimentos de resiliencia sobre copias aisladas del estado), no un sistema separado — recomendación: no crearlo como sistema independiente hasta que Experiment y Continuity existan.
- **Continuity** (§1.7 + MCC §5): el sustrato de persistencia y registro, transversal.

Resultado: **3 sustratos** (representación/conocimiento, continuidad/MCC, ejecución aislada) + **4 procesos** (descubrimiento, experimentación, aprendizaje, ingeniería) + **2 fronteras** (Admisión, Model Router). Menos sistemas que los siete nombres, con las mismas responsabilidades y menos acoplamiento.

## 7. Tres arquitecturas candidatas

### Candidata A — «Núcleo mínimo verificable» (baja complejidad)
Un solo proceso local (Node, como el repo actual) con: Knowledge System en SQLite + registro append-only con cadena de hashes; Discovery por reglas deterministas sobre el grafo (anomalías, huecos, predicciones vencidas); Experiment como scripts acotados con presupuesto; Learning por consolidación manual-asistida; Model Router simple (un motor por tarea, verificación por oráculo fijo); MCC como tabla de eventos causales. Sin sandbox fuerte (procesos hijos con timeout y límites de FS), sin multi-motor.
- Seguridad: media (aislamiento débil). Viabilidad: **alta hoy** (extiende lo existente). Complejidad: baja. Coste: mínimo. Memoria/cómputo: mínimo. Dependencia externa: un motor. Aprendizaje: limitado pero real. Descubrimiento: básico (reglas). Mantenibilidad: alta. Riesgo de acoplamiento: bajo si el almacén es propio (no el sobre de Lúmina).

### Candidata B — «Doble anillo con sandbox» (complejidad media) — RECOMENDADA
Anillo interno (identidad, Constitución, Knowledge System, MCC, Admisión, registro de auditoría) sin acceso a red ni a ejecución arbitraria; anillo externo (Discovery, Experiment, Creative, Model Router) que propone y experimenta en sandbox (contenedores o procesos aislados con límites de CPU/memoria/FS/red, artefactos de salida firmados por el entorno, no por el motor). Promoción entre anillos solo vía Admisión con evidencia. Model Router con evaluación comparativa y verificación cruzada entre dos motores para claims críticos. Lúmina queda como **banco de pruebas externo** (mundo simulado para experimentos), nunca como almacén de identidad.
- Seguridad: alta (aislamiento real, auto-verificación prohibida por construcción). Viabilidad: media (requiere infraestructura de sandbox; en Android/Termux el sandbox fuerte es limitado — ver roadmap). Complejidad: media. Coste: bajo-medio. Memoria/cómputo: moderado. Dependencia externa: 1–2 motores intercambiables. Aprendizaje: acumulativo con competencia medible. Descubrimiento: bueno (reglas + motores verificados). Mantenibilidad: media-alta. Riesgo de acoplamiento: bajo (fronteras explícitas); el riesgo principal es la complejidad del sandbox en móvil.

### Candidata C — «Federada multi-motor con ancla externa» (alta complejidad)
B añade: múltiples motores con votación/verificación cruzada sistemática, anclaje externo periódico del registro de auditoría y de la MCC (notarización fuera del dispositivo), réplica de la memoria semántica en dos dominios, y experimentación distribuida. 
- Seguridad: la más alta en integridad (ancla externa detecta rollback del registro). Viabilidad: **baja hoy** (depende de decisiones D-04/D-10/D-12 SIN DECIDIR y de infraestructura que el propietario no tiene aún — sin ordenador, solo Poco X7 Pro). Complejidad: alta. Coste: medio-alto (servicios externos). Memoria/cómputo: alto. Dependencia externa: alta (contradice el objetivo de independencia salvo como ancla mínima). Aprendizaje/descubrimiento: el mayor techo. Mantenibilidad: baja-media. Riesgo de acoplamiento: medio (el ancla externa se convierte en dependencia crítica si no se diseña la degradación).

### Comparación y recomendación

| Criterio | A | B | C |
|---|---|---|---|
| Seguridad | Media | **Alta** | Alta+ (integridad) |
| Viabilidad hoy | **Alta** | Media | Baja |
| Complejidad | Baja | Media | Alta |
| Coste | Mínimo | Bajo-medio | Medio-alto |
| Memoria/cómputo | Mínimo | Moderado | Alto |
| Dependencia externa | 1 motor | 1–2 motores | Alta (ancla) |
| Aprendizaje | Limitado | **Acumulativo medible** | Acumulativo medible |
| Descubrimiento | Básico | **Bueno** | Bueno+ |
| Mantenibilidad | Alta | Media-alta | Baja-media |
| Riesgo de acoplamiento | Bajo | Bajo | Medio |

**Recomendación: Candidata B**, evolucionando desde A. Razones: (1) es la única que hace cumplir por construcción —no por disciplina— la separación COGNITION ≠ AUTHORITY ≠ EXECUTION ≠ VERIFICATION (el anillo interno no puede ejecutar lo que el externo propone); (2) A es un escalón válido y barato para empezar (y comparte el 80% del diseño de B: mismo Knowledge System, misma MCC, mismo ciclo), así que B no tira el trabajo de A; (3) C depende de decisiones del propietario aún no tomadas (D-04 anclaje, D-10 recuperación, D-12 dependencias) y de infraestructura que hoy no existe en el entorno del propietario (sin ordenador; móvil Android/Termux) — adoptarla ahora sería construir sobre decisiones pendientes; sus elementos valiosos (ancla externa mínima del registro) pueden incorporarse a B como fase posterior sin rediseñar. Se rechaza A como destino final porque su aislamiento débil no sostiene experimentación autónoma segura; se rechaza C como punto de partida por inviable hoy y por aumentar la dependencia externa que la misión busca reducir.

## 8. Qué ya existe, qué es parcial y qué sería nuevo (resumen de integración)

- **Ya existe y se reutiliza:** contratos tipados e inmutabilidad; commit condicional sobre `persistState`; clasificación de outcomes; sobres de observación y equivalencia conservadora; evaluadores Python deterministas (precedente de análisis local sin autoridad); pila runtime/orchestrator/effect-adapter (como **referencia de flujo**, no como sustrato: está acoplada a Lúmina); patrones de `discovery.js`/`planning.js` como **inspiración de diseño** (confianza acotada, replanning acotado), no como código de Nexo.
- **Parcial y debe corregirse antes de construir encima:** validación semántica (A1/A2), reconciliación (B), confianza de política (C), cableado de la cadena protegida (D), almacén único de memoria Nexo (hoy dos almacenes + sobre de Lúmina).
- **Nuevo (PROPUESTA, sin implementar):** World Model tipado, Knowledge System con grafo y cuarentena, Discovery Intelligence, Learning Engine con competencia medible, Experiment Engine reproducible, Creative/Engineering con Admisión separada, MCC, Model Router, Preparedness como función (no sistema), sandbox de experimentación, almacén propio de continuidad desacoplado de Lúmina.

## 9. Límites de esta arquitectura

- No resuelve el fallo estructural central documentado (sin estándar de versionado de Constitución de agente, sin verificación de continuidad semántica entre modelos, sin revocación/sucesión sin tercero de confianza): lo **contiene** (la MCC registra supersesiones con autoridad; la sustitución de motor re-verifica), no lo elimina. Sigue dependiendo de decisiones D-01–D-12.
- No afirma independencia física total (imposible a escala individual, documentado en M02): afirma independencia de identidad y conocimiento respecto de modelos/proveedores concretos.
- En el dispositivo actual (Poco X7 Pro, Android/Termux, sin ordenador) el sandbox fuerte de la Candidata B es limitado; el roadmap (`GRAND_MISSION_01_MASTER_ROADMAP.md`) lo trata como restricción de diseño, no como autorización de pruebas.
- Ningún invariante de esta arquitectura se declara formalmente demostrado: son PROPUESTA con mecanismo de validación asociado (ver `GRAND_MISSION_01_ADVERSARIAL_REVIEW.md`).
