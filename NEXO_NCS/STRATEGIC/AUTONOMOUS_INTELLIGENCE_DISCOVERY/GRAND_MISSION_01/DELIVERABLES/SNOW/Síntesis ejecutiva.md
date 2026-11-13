# GRAND MISSION 01 — Síntesis ejecutiva (Executive Synthesis)

- **Misión:** reconstrucción integral, inteligencia de descubrimiento autónomo y arquitectura de evolución controlada. Solo lectura; M0 intocable; nada publicado.
- **Base:** rama `nexo-mission-02-pdf-2026-11-05`, HEAD `c5724aa60914e71c352fd5f793be636c9c6703cb` (2026-11-10), 121 commits desde `1112c26d`. Evidencia completa en los 9 documentos hermanos; fuentes en `GRAND_MISSION_01_SOURCE_REGISTER.md`.
- **Estado del resultado:** **CANDIDATE COMPLETE — PENDING INDEPENDENT REVIEW.**

## Qué es Nexo hoy, según la evidencia

Nexo es hoy **un sistema de identidad, memoria, principios y autoridad en diseño, con un núcleo de código parcial y una ruta de ejecución real acoplada a Lúmina**. No es un modelo, ni un chatbot, ni una aplicación terminada: es la Constitución, la continuidad y los límites que el expediente define, más código que implementa **piezas** de ese diseño. La independencia de modelos y proveedores está **diseñada y parcialmente precedida** (contratos, evaluadores deterministas sin autoridad), **no conseguida**: la persistencia de Nexo depende hoy del workflow de Lúmina cada 5 minutos y de un sobre compartido con el mundo simulado.

## Qué capacidades reales posee (verificado en código, HEAD `c5724aa6`)

- **Contratos tipados e inmutabilidad** (`contracts.mjs`): IMPLEMENTED + TESTED; CI-VERIFIED en SHA histórico `6c06a6fe`. Con un hueco: los arrays del claim no validan la forma de sus elementos (A2).
- **Commit condicional** sobre `persistState` con revisión esperada: IMPLEMENTED + TESTED (con persistencia real en tmp); CI-VERIFIED @ `de859aa0`.
- **Clasificación de outcomes** y **sobres de observación** con equivalencia conservadora: IMPLEMENTED + TESTED; CI UNKNOWN (workflows dispatch-only).
- **Pila que sí ejecuta** (runtime/orchestrator/effect-adapter/simulation-adapter): IMPLEMENTED + TESTED en subconjunto de `npm test`; muta estado real de Lúmina con pre/postcondición, journal PREPARED e idempotencia. **Acoplada a Lúmina**: no es el núcleo de transición protegida.
- **Evaluadores Python deterministas** (cierre de dependencias I0–I5; huecos de correspondencia formal): IMPLEMENTED + tests existentes; ningún workflow los ejecuta (CI UNKNOWN). Declaran en su propio código que no conceden autoridad ni ejecutan efectos.
- **Cognición de habitantes Lúmina** (`discovery.js`, `planning.js`): real y probada **como Lúmina**; no es capacidad de Nexo.

## Qué parece existir en documentos pero no está materializado

- **La cadena protegida extremo a extremo** (validación → autoridad → ejecución → commit → reconciliación → frontera de efectos): la orquestación está implementada y testeada **con stubs**; los puertos reales son `NOT_IMPLEMENTED` por defecto; hay **cero cableado productivo** fuera de `core/`/`adapters/`; el validador real ni siquiera es compatible con el puerto tal cual está llamado (falta el contexto); `reconciliation` y `effectBoundary` nunca se invocan. Es el diseño de construcción del 2026-10-08, no una capacidad.
- **La reconciliación semántica:** lo implementado es clasificación del primer ítem autoritativo, sin vínculo a caso/claim/objetivo/efecto/vigencia/procedencia (21 líneas).
- **La confianza de política:** solo estructura y estados **declarados por el llamante**; sin firma, sin recomputación de hash, sin `node:crypto`. Verificación criptográfica: **UNKNOWN/STOP**.
- **La prueba de validación semántica a HEAD:** rota por incompatibilidad estática (`policyVersion` vs `policyRef` tipado, A1) + fail-open demostrado con dependencias string (A2).
- **Evidencia de CI sobre el HEAD actual:** ninguna en el repo. Todo el CI citado es histórico (STEP 3–6 en SHAs anteriores; STEP 7 dispatch-only).
- **Toda la arquitectura de descubrimiento** (World Model, Knowledge System, Discovery, Learning, Experiment, MCC, Model Router): PROPUESTA de esta misión, sin implementar.
- **La memoria unificada de Nexo:** hoy dos almacenes divergentes sin contrato (P111 abierto), uno de ellos con el sub-objeto `nexo` vacío por construcción, y los outcomes del runtime sin llegar al sobre por las rutas de script.

## Descubrimientos más importantes de esta misión

1. **El diff neto del rango histórico es 54 altas / 0 modificaciones / 0 bajas:** toda la capa de noviembre es documental aditiva sobre un corpus de septiembre–octubre ya presente en `1112c26d`. La historia editorial real está en los commits con mensaje del 2026-11-07, no en el diff de árbol.
2. **Los hallazgos A–E del encargo se confirman todos en HEAD**, con evidencia de línea verificada por Snow: A1 (prueba rota), A2 (fail-open string), B (reconciliación = primer ítem), C (política sin criptografía), D (cadena sin cablear, tres huecos concretos), E (CI solo histórico).
3. **Nexo no tiene proceso propio en el repo:** su continuidad de facto es el workflow de Lúmina cada 5 minutos commiteando estado a `main`. La separación Nexo/Lúmina es hoy una aspiración documentada, no una propiedad del sistema.
4. **El precedente más valioso del repo para el descubrimiento no es `discovery.js`** (cognición NPC) sino el patrón de los evaluadores Python y de la equivalencia conservadora: análisis determinista, sin autoridad, con UNKNOWN honesto. Ese patrón es el que la arquitectura propuesta generaliza.
5. **El expediente ya sufrió, en pequeño, los fallos que la arquitectura debe prevenir en grande:** auto-cita contada como corroboración (F-E11), doble estado sin purgar (U6/U9), punteros invalidados por deriva (A2A/C05), prueba invalidada por contrato posterior (A1). La arquitectura propuesta (E5/E18/E21) está diseñada contra esos fallos concretos, no contra amenazas abstractas.

## Qué falta para construir una inteligencia de descubrimiento autónomo

1. **Correcciones de realidad** (Fase 1 del roadmap): cerrar A1/A2/B/C/D y unificar el almacén de memoria. Sin esto, cualquier construcción hereda fallos conocidos.
2. **Un sustrato propio** (Fase 2): Knowledge System + MCC + almacén desacoplado de Lúmina, con Discovery por reglas y Experiment acotado (Candidata A como escalón).
3. **Aprendizaje con competencia medible** (Fase 3): sin E17 (calibración) y E1 (meta-investigación), «aprender» es una palabra sin instrumento.
4. **Evolución controlada** (Fase 4): Engineering + Admisión separada + evaluación E11; sin esto, proponer y desplegar se confunden.
5. **Endurecimiento** (Fase 5): sandbox validado en el dispositivo real, ancla externa si se decide, invariantes con prueba de violación.
6. **Decisiones del propietario** (D-01–D-12, 9 de Misión 01, G-01–G-10 de esta misión): la arquitectura no sustituye ninguna.

## Arquitectura recomendada

**Candidata B («doble anillo con sandbox»), evolucionando desde A.** Anillo interno (identidad, Constitución, Knowledge System, MCC, Admisión, registro de auditoría) sin red ni ejecución arbitraria; anillo externo (Discovery, Experiment, Creative, Model Router) que propone y experimenta en sandbox; promoción entre anillos solo vía Admisión con evidencia. Ciclo: `OBSERVE → QUESTION → HYPOTHESIZE → PLAN → EXPERIMENT → ANALYZE → LEARN → VALIDATE → PROPOSE`, con Constitución en PLAN/ADMISSION, autoridad en EXPERIMENT/ADMISSION/DEPLOYMENT, aislamiento en EXPERIMENT, verificación en ANALYZE/VALIDATE y continuidad (MCC) en todo. Los siete motores del anexo se coordinan como **3 sustratos + 4 procesos + 2 fronteras**, no como siete sistemas. Se rechaza A como destino (aislamiento débil) y C como punto de partida (depende de decisiones D-04/D-10/D-12 y de infraestructura inexistente hoy; sus elementos valiosos —ancla mínima— entran en B como fase posterior).

## Característica distintiva candidata

**La Memoria de Continuidad Causal (MCC)**: un grafo causal de la vida de Nexo —qué ocurrió, por qué, bajo qué autoridad, con qué evidencia, con qué consecuencias, qué está demostrado/hipotetizado/desconocido, qué contradicciones persisten y qué rutas legítimas permiten modificar una decisión— que **no inventa continuidad donde falta evidencia**. Combinada con E2+E5+E12+E21 (detectar lo que no sabe, recordar sus fallos, no citarse a sí mismo), es lo que convertiría a Nexo en algo distinto de «un asistente con más herramientas»: un sistema con biografía verificable. **No se afirma que sea única en el mundo** sin comparativa rigurosa (queda como investigación).

## Qué es posible, qué es investigación y qué sería especulación

- **Técnicamente posible hoy (tras M0 + Fase 1):** sustrato de conocimiento con procedencia, Discovery por reglas, experimentos acotados, MCC como registro causal, sustitución de motor con re-verificación. Todo con precedente parcial en el repo.
- **Todavía investigación:** causalidad E3, transferencia cross-dominio E7/E8, calibración con muestra suficiente, continuidad semántica entre modelos (fallo estructural central: sin estándar de versionado de Constitución de agente, sin verificación de continuidad semántica, sin revocación/sucesión sin tercero de confianza — la arquitectura lo contiene, no lo resuelve), unicidad de la MCC.
- **Especulación (si se afirmara hoy):** que Nexo «ya» descubre, aprende o evoluciona; que la cadena protegida funciona en producción; que la política tiene confianza criptográfica; que hay CI sobre el HEAD actual; que la memoria de Nexo es independiente de Lúmina. Nada de eso está demostrado.

## El camino más seguro desde el estado actual

1. **Cerrar M0 sin ampliar su alcance** (orden estratégico; fuera de esta misión).
2. **Fase 1 — correcciones A–E** con CI sobre SHA congelado. Coste bajo, elimina fallos conocidos antes de construir encima.
3. **Fase 2 — sustrato propio (Candidata A)** poblado con el expediente Nexo real como corpus de prueba (las contradicciones documentadas son casos de prueba naturales y gratuitos).
4. **Fases 3–4 — aprendizaje, calibración, ingeniería con Admisión**, cada una con criterios de salida medidos, no declarados.
5. **Fase 5 — endurecimiento B** solo con sandbox validado en el dispositivo real y decisiones D-04/D-10/D-12 tomadas.
6. En cada fase: **preparar, no auto-autorizar**; el propietario decide en G-01–G-10 y D-01–D-12; Snow propone, verifica y registra.

**Advertencia final de la misión:** el resultado es CANDIDATE COMPLETE — PENDING INDEPENDENT REVIEW. Snow no aprueba sus propias propuestas. La visión del anexo se preserva íntegra; los obstáculos encontrados (A–E, acoplamiento a Lúmina, fallo estructural central) se reportan como tales, no se sustituyen silenciosamente por una arquitectura de asistente convencional.
