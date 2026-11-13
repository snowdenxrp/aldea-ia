# GRAND MISSION 01 — Catálogo de capacidades emergentes (Emergent Capabilities)

- **Naturaleza:** PROPUESTA (Fase IV). Ninguna capacidad de este catálogo está implementada en Nexo a HEAD `c5724aa6…` salvo indicación expresa de precedente parcial. Marco: arquitectura de `GRAND_MISSION_01_AUTONOMOUS_DISCOVERY_ARCHITECTURE.md` (Candidata B recomendada). Principio: descubrir no concede permiso; proponer no es ejecutar.
- **Madurez:** M0 idea · M1 diseño · M2 prototipo · M3 evaluada · M4 admitida. **Prioridad:** P0 (fundacional para el descubrimiento autónomo) · P1 (alto valor, tras P0) · P2 (valioso, posterior) · P3 (exploratorio).
- Los 15 puntos del encargo se tratan como base, **no** como lista cerrada: se añaden 7 capacidades adicionales justificadas (E16–E22).

## Capacidades del encargo (E1–E15)

### E1. Meta-investigación: aprender a investigar mejor — P1, M1
- **Problema:** Nexo investigaría siempre con el mismo método, sin mejorar su selección de fuentes, diseño de experimentos ni cálculo de evidencia suficiente.
- **Funcionamiento:** registro de cada investigación (pregunta, fuentes, método, resultado, coste) en la MCC; análisis periódico que detecta qué métodos rindieron (hipótesis confirmadas/refutadas por unidad de coste) y ajusta las plantillas del Experiment Engine.
- **Entradas/salidas:** entrada = historial de investigaciones; salida = plantillas revisadas + métricas de rendimiento por método.
- **Componentes:** MCC, Experiment Engine, Learning Engine. **Dependencias:** Knowledge System (E-base), MCC.
- **Riesgos:** sobreajuste a métodos que «funcionaron» por azar; declarar mejora sin grupo de control. **Límites:** no puede cambiar sus propios criterios de admisión (eso es Admisión, no meta-investigación).
- **Evidencia necesaria:** corpus de investigaciones cerradas con resultado conocido; comparación antes/después con casos retenidos. **Criterios de éxito:** mejora medible en tasa de hipótesis bien calibradas por coste, sin degradar la tasa de falsación.
- **Por qué no está cubierta:** hoy no hay registro de investigaciones ni de su rendimiento; el Learning Engine propuesto aprende contenidos, no método.

### E2. Detección de preguntas que nadie ha formulado — P0, M1
- **Problema:** Nexo solo investiga lo que una persona le indica; el objetivo estratégico es que detecte huecos por sí mismo.
- **Funcionamiento:** Discovery Intelligence escanea el Knowledge System buscando: claims con dependencias sin resolver, predicciones vencidas, contradicciones sin adjudicar, pares de claims sin relación donde la evidencia sugiere dependencia, y dominios con cobertura anómala (mucho claim, poca evidencia primaria). Cada hallazgo se formula como pregunta con el hueco citado.
- **Entradas/salidas:** entrada = grafo de conocimiento + MCC; salida = cola de preguntas priorizadas (impacto × incertidumbre × coste).
- **Componentes:** Discovery Intelligence, Knowledge System, MCC. **Dependencias:** World Model tipado.
- **Riesgos:** inundación de preguntas triviales o duplicadas; preguntas fuera de alcance que consuman recursos. **Límites:** formula y prioriza; no autoriza su propia investigación (la autorización de recursos es de Admisión/Constitución).
- **Evidencia necesaria:** grafo de conocimiento poblado con claims reales del expediente Nexo; evaluación de precisión de la cola (¿qué % de preguntas generadas resultan valiosas según el propietario?). **Criterios de éxito:** cola con precisión útil (umbral a fijar por el propietario) y coste de revisión humana acotado.
- **Por qué no está cubierta:** `discovery.js` descubre acciones dentro del mundo Lúmina para sus habitantes; no formula preguntas sobre conocimiento.

### E3. Descubrimiento de relaciones causales — P1, M1
- **Problema:** el conocimiento actual registra correlaciones y citas, no cadenas causales con nivel de demostración.
- **Funcionamiento:** la MCC distingue aristas causales `DEMONSTRATED` / `HYPOTHESIZED` / `UNKNOWN`; Discovery propone aristas hipotetizadas desde patrones temporales y estructurales; el Experiment Engine diseña intervenciones que las pongan a prueba; solo la intervención con resultado esperado/no esperado mueve el estado.
- **Entradas/salidas:** entrada = eventos MCC + claims; salida = aristas causales con estado y evidencia.
- **Componentes:** MCC, Discovery, Experiment. **Riesgos:** confundir precedencia temporal con causalidad (el expediente G0 ya documenta esta trampa: orden temporal sin arista JMM). **Límites:** en sistemas sin intervención posible, la arista queda HYPOTHESIZED para siempre — y eso es un resultado válido.
- **Evidencia necesaria:** casos con intervención controlada (sandbox) y casos históricos con resultado conocido. **Criterios de éxito:** aristas DEMONSTRATED solo desde intervención o evidencia documental primaria causal; cero promociones por mera precedencia.
- **Por qué no está cubierta:** la MCC no existe; el journal actual registra efectos, no causalidad con niveles.

### E4. Generación y selección de experimentos — P0, M1
- **Problema:** sin generación sistemática, los experimentos dependen de ocurrencias.
- **Funcionamiento:** dada una hipótesis, el Experiment Engine genera variantes de diseño (qué variar, qué controlar, qué medir) y las ordena por poder discriminatorio esperado por unidad de coste; la selección final pasa por Admisión de recursos.
- **Entradas/salidas:** entrada = hipótesis + presupuesto; salida = diseño seleccionado con justificación y alternativas descartadas.
- **Componentes:** Experiment Engine, Learning Engine (rendimiento histórico de diseños). **Riesgos:** diseños que «confirman» por construcción (sesgo de selección); coste computacional descontrolado. **Límites:** presupuesto duro por experimento y por ciclo; parada obligatoria al agotarlo.
- **Evidencia necesaria:** hipótesis con oráculo conocido para medir si el diseño elegido discrimina mejor que alternativas. **Criterios de éxito:** diseños seleccionados superan a diseños aleatorios/de referencia en poder discriminatorio medido.
- **Por qué no está cubierta:** no existe Experiment Engine; los evaluadores Python actuales son análisis fijos, no generación de experimentos.

### E5. Detección de errores en sus propias conclusiones — P0, M1
- **Problema:** un sistema que consolida sin auditarse consolida también sus errores (el expediente R2 documenta exactamente este fallo: U6/U9 con doble estado sin purgar).
- **Funcionamiento:** auditoría continua del Knowledge System: claims cuya evidencia caducó, claims contradichos por evidencia posterior, predicciones fallidas, y claims que dependen de un claim ya degradado (propagación de degradación por el grafo). Cada hallazgo degrada el claim y abre pregunta de revisión.
- **Entradas/salidas:** entrada = grafo + MCC; salida = lista de claims degradados con causa y ruta de revisión.
- **Componentes:** Knowledge System, Discovery, MCC. **Riesgos:** degradación en cascada por un solo error de detección (mitigación: la degradación es reversible y registrada, nunca borrado). **Límites:** detecta y degrada; la re-promoción exige verificación nueva.
- **Evidencia necesaria:** grafo con dependencias reales (el expediente Nexo sirve: contradicciones documentadas MAYOR-1, menor-1/2/3 son casos de prueba naturales). **Criterios de éxito:** detección de inconsistencias sembradas en pruebas sin falsos positivos inaceptables (umbral del propietario).
- **Por qué no está cubierta:** hoy la detección de contradicciones la hacen personas (misiones 003/004); no hay mecanismo en Nexo.

### E6. Descubrimiento de límites del propio conocimiento — P1, M1
- **Problema:** Nexo no sabe lo que no sabe; sin mapa de ignorancia, investiga a ciegas y afirma de más.
- **Funcionamiento:** mapa de cobertura por dominio (claims FACT/BELIEF/HYPOTHESIS/UNKNOWN, edad de evidencia, dominios sin ninguna fuente primaria); Discovery genera preguntas de frontera («qué evidencia cambiaría esta conclusión») y el sistema declara su ignorancia como salida de primera clase.
- **Entradas/salidas:** entrada = grafo + MCC; salida = mapa de ignorancia por dominio + preguntas de frontera.
- **Componentes:** Knowledge System, Discovery, Learning (calibración). **Riesgos:** falsa precisión del mapa (cobertura ≠ comprensión). **Límites:** el mapa describe evidencia, no comprensión real; se declara como tal.
- **Evidencia necesaria:** dominios con respuesta conocida para calibrar (¿el mapa predice dónde falla Nexo?). **Criterios de éxito:** correlación entre «zona declarada UNKNOWN» y fallo real en pruebas retenidas.
- **Por qué no está cubierta:** no hay grafo de conocimiento ni calibración; los UNKNOWN del expediente son listas documentales, no un mapa vivo.

### E7. Aprendizaje acumulativo entre dominios — P2, M1
- **Problema:** el conocimiento por dominio no se transfiere; cada dominio se aprende desde cero.
- **Funcionamiento:** el Knowledge System indexa claims por estructura (método, tipo de evidencia, forma de fallo) además de por tema; Learning busca analogías estructurales entre dominios (p. ej., «commit condicional» en persistencia y en efectos) y propone transferencia como hipótesis a verificar en el dominio destino, nunca como hecho importado.
- **Entradas/salidas:** entrada = claims de ≥2 dominios; salida = hipótesis de transferencia con plan de verificación.
- **Componentes:** Knowledge System, Learning, Experiment. **Riesgos:** analogías superficiales tomadas como transferencias válidas. **Límites:** toda transferencia nace HYPOTHESIZED y exige verificación en destino.
- **Evidencia necesaria:** pares de dominios con transferencia conocida (positiva y negativa) para medir precisión. **Criterios de éxito:** transferencias verificadas > transferencias refutadas, con coste menor que aprender desde cero.
- **Por qué no está cubierta:** no hay grafo cross-dominio ni Learning Engine.

### E8. Transferencia de conocimiento (procedimental) — P2, M1
- **Problema:** una habilidad aprendida en un contexto (p. ej., verificar un commit) no se reutiliza en otro (verificar una admisión) sin re-diseño.
- **Funcionamiento:** las capacidades candidatas se describen por su contrato (entradas, salidas, precondiciones, invariantes) sin referencia al dominio; Engineering propone adaptaciones del contrato a un dominio nuevo como candidato, con evaluación independiente.
- **Entradas/salidas:** entrada = contrato de capacidad + dominio destino; salida = candidato adaptado + plan de prueba.
- **Componentes:** Engineering Engine, Knowledge System, Admisión. **Riesgos:** adaptar el contrato perdiendo los invariantes que lo hacían seguro. **Límites:** la adaptación es un candidato nuevo; la capacidad original no se «extiende» silenciosamente.
- **Evidencia necesaria:** adaptaciones con resultado conocido. **Criterios de éxito:** candidatos adaptados que pasan la misma batería de invariantes que el original.
- **Por qué no está cubierta:** no hay contratos de capacidad ni Engineering Engine; los puertos de `ownership.mjs` son la superficie más cercana (PROPOSAL como capacidad).

### E9. Detección de oportunidades de automatización — P2, M1
- **Problema:** trabajo repetitivo y verificable (p. ej., re-medición de hashes tras cada subida, vigilancia de HEAD) se hace a mano o no se hace.
- **Funcionamiento:** Discovery detecta tareas repetidas en la MCC con oráculo claro (entrada/salida verificables) y propone su automatización como candidato con análisis de riesgo (qué pasa si la automatización falla: fail-closed obligatorio).
- **Entradas/salidas:** entrada = MCC; salida = candidatos de automatización priorizados.
- **Componentes:** Discovery, Engineering, Admisión. **Riesgos:** automatizar lo que no tiene oráculo (falsa automatización); automatización que escale privilegios. **Límites:** solo tareas con verificación independiente posible; la automatización nunca se auto-despliega.
- **Evidencia necesaria:** registro de tareas repetidas con su coste actual. **Criterios de éxito:** tareas automatizadas con tasa de fallo detectado = 100% (ningún fallo silencioso) en simulación.
- **Por qué no está cubierta:** no hay MCC ni Engineering; las automatizaciones actuales (workflow Lúmina cada 5 min) son de Lúmina, no propuestas por Nexo.

### E10. Síntesis de nuevas herramientas — P1, M1
- **Problema:** Nexo depende de herramientas fijas; la visión estratégica pide ingeniería de software propia.
- **Funcionamiento:** Engineering diseña herramientas candidatas (especificación, contrato, plan de prueba) a partir de huecos detectados; se construyen **en sandbox**, se evalúan contra su plan de prueba y casos adversariales, y solo entonces se proponen a Admisión.
- **Entradas/salidas:** entrada = hueco de capacidad + restricciones; salida = herramienta candidata con evidencia de evaluación.
- **Componentes:** Engineering, Experiment (sandbox), Admisión. **Riesgos:** herramienta que funciona en sandbox y no en producción; código generado sin revisión. **Límites:** sandbox sin red ni privilegios por defecto; ninguna herramienta sintetizada se instala sin Admisión.
- **Evidencia necesaria:** batería de pruebas por herramienta + revisión de código independiente (segundo motor u oráculo). **Criterios de éxito:** herramienta candidata que supera su plan de prueba y la revisión sin hallazgos críticos.
- **Por qué no está cubierta:** no hay Engineering Engine ni sandbox; el precedente más cercano son los evaluadores Python (herramientas fijas, no sintetizadas).

### E11. Evaluación de capacidades candidatas — P0, M1
- **Problema:** sin evaluación independiente, un candidato bueno en su diseño puede ser malo en la práctica, y nadie lo sabría antes de desplegarlo.
- **Funcionamiento:** batería de evaluación por candidato: casos normales, casos límite, casos adversariales (de `GRAND_MISSION_01_ADVERSARIAL_REVIEW.md`), medición de recursos, y comparación contra la capacidad incumbente (si la hay). El evaluador es distinto del generador (componente y, para claims críticos, motor distinto).
- **Entradas/salidas:** entrada = candidato + plan de prueba; salida = informe de evaluación con veredicto (apta/no apta/UNKNOWN) y evidencia.
- **Componentes:** Experiment, Admisión (consume el informe; no lo produce). **Riesgos:** evaluador y generador comparten sesgo (mitigación: evaluador independiente + casos retenidos). **Límites:** la evaluación no admite; solo informa a Admisión.
- **Evidencia necesaria:** candidatos con resultado conocido para calibrar la batería. **Criterios de éxito:** la batería rechaza candidatos defectuosos sembrados y acepta los correctos con tasas a fijar por el propietario.
- **Por qué no está cubierta:** hoy la evaluación la hacen personas en misiones (003, 004, auditorías); no hay batería de capacidades candidatas.

### E12. Memoria de descubrimientos fallidos — P0, M1
- **Problema:** sin memoria de fallos, Nexo repetirá investigaciones ya refutadas (el expediente documenta DO-NOT-REPEAT como disciplina humana; Nexo necesita la suya propia).
- **Funcionamiento:** todo experimento o hipótesis refutada se registra con diseño, resultado y causa de fallo; Discovery y Experiment consultan esta memoria **antes** de proponer trabajo nuevo y deben justificar por qué el nuevo intento no es el fallido (o declarar que lo es y por qué el contexto cambió).
- **Entradas/salidas:** entrada = resultados negativos; salida = hits de «esto ya se intentó» con su refutación.
- **Componentes:** MCC/memoria episódica, Knowledge System, Discovery. **Riesgos:** memoria de fallos mal indexada que bloquee trabajo válido (mitigación: el hit es consultivo, no bloqueante; la justificación queda registrada). **Límites:** un fallo pasado no refuta para siempre (el contexto puede cambiar: versiones, fuentes, hardware).
- **Evidencia necesaria:** corpus de intentos fallidos reales (el expediente Nexo: AB105.117R prohibido, TLC congelado, U2/U3/U5 sin resolver, A1/A2, etc., son casos de prueba naturales). **Criterios de éxito:** cero repeticiones no justificadas de intentos refutados en simulación.
- **Por qué no está cubierta:** los DO-NOT-REPEAT viven en documentos y en la memoria de Snow, no en un mecanismo de Nexo.

### E13. Identificación de sesgos en fuentes y métodos — P1, M1
- **Problema:** Nexo heredaría los sesgos de sus fuentes (el expediente ya sufrió uno: definición EVIDENCE «≥2 resúmenes» que inflaba corroboración — F-E11).
- **Funcionamiento:** cada fuente del Knowledge System lleva metadatos de procedencia (tipo: primaria/secundaria/vendor/comunidad; independencia declarada); Learning detecta concentraciones (muchas «fuentes» que son reescrituras de una) y sesgos de método (p. ej., solo evidencia favorable buscada); los claims afectados bajan de confianza o entran en revisión.
- **Entradas/salidas:** entrada = grafo con procedencia; salida = alertas de sesgo con claims afectados.
- **Componentes:** Knowledge System, Learning, Discovery. **Riesgos:** detector de sesgo sesgado; falsa alarma que degrade conocimiento válido. **Límites:** el detector propone revisión; no degrada sin la regla de E5.
- **Evidencia necesaria:** casos con sesgo conocido sembrado y casos limpios. **Criterios de éxito:** detección del caso F-E11 (4 reescrituras del mismo comunicado contadas como una fuente) en prueba.
- **Por qué no está cubierta:** la procedencia actual es documental (manifiestos), no un mecanismo de Nexo.

### E14. Investigación de problemas abiertos — P1, M1
- **Problema:** los problemas abiertos (U2/U3/U5, fallo estructural central, P112 OPEN) no tienen dueño de investigación continua; solo se retoman por encargo.
- **Funcionamiento:** registro de problemas abiertos con estado, evidencia disponible y qué la cambiaría; Discovery los re-evalúa cuando llega evidencia nueva (una fuente primaria nueva, un estándar publicado) y propone reabrir la investigación con el delta exacto.
- **Entradas/salidas:** entrada = registro de abiertos + evidencia entrante; salida = propuestas de reapertura justificadas o confirmación de permanencia UNKNOWN.
- **Componentes:** Knowledge System, Discovery, MCC. **Riesgos:** reaperturas sin delta real (ruido); cierre prematuro por presión de «resolver». **Límites:** reabrir una investigación no eleva ningún UNKNOWN; el cierre sigue exigiendo evidencia primaria.
- **Evidencia necesaria:** registro con criterios de reapertura por problema. **Criterios de éxito:** reaperturas solo con delta de evidencia documentado; cero cierres sin primario.
- **Por qué no está cubierta:** los UNKNOWN viven en documentos; no hay re-evaluación automática ante evidencia nueva.

### E15. Capacidad de formular mejores preguntas a medida que aprende — P1, M1
- **Problema:** la calidad de las preguntas determina la calidad de la investigación; hoy depende enteramente del humano.
- **Funcionamiento:** Learning conserva pares (pregunta → valor de su respuesta) y ajusta la generación de preguntas: especificidad, falsabilidad, coste esperado, y novedad respecto a lo ya preguntado. Las preguntas se evalúan como se evalúan los experimentos.
- **Entradas/salidas:** entrada = historial pregunta/respuesta; salida = generación de preguntas calibrada por dominio.
- **Componentes:** Discovery, Learning, MCC. **Riesgos:** optimizar preguntas «fáciles de responder» en vez de valiosas (mitigación: valor = cambio en el grafo, no facilidad). **Límites:** la calibración no puede reducir la ambición de las preguntas sin registro (E1 lo audita).
- **Evidencia necesaria:** historial con valor de respuesta medido (cambio de claims/estados). **Criterios de éxito:** preguntas generadas con mayor cambio de grafo por unidad de coste que la línea base (preguntas humanas del expediente como referencia).
- **Por qué no está cubierta:** no hay historial pregunta/respuesta ni Learning Engine.

## Capacidades adicionales identificadas (E16–E22)

### E16. Verificación cruzada entre motores con desacuerdo registrado — P0, M1
- **Justificación:** el expediente muestra que un solo motor (o una sola lectura) produce errores materiales (H-03: cita que no existe en la página citada; F-E01: AAL3 por software). La verificación cruzada sistemática es la defensa más barata contra el error de motor único.
- **Funcionamiento:** para claims críticos, dos motores (o motor + oráculo determinista) responden la misma tarea de forma independiente; el desacuerdo se registra como arista de contradicción y bloquea la promoción a FACT hasta adjudicación. El desacuerdo es información, no ruido.
- **Componentes:** Model Router, Knowledge System, MCC. **Riesgos:** coste doble; falsos desacuerdos por formulación. **Límites:** solo para claims críticos (coste); el desacuerdo no se resuelve por mayoría simple.
- **Evidencia necesaria:** tareas con respuesta conocida para medir tasa de desacuerdo útil. **Criterios de éxito:** los errores de motor único detectados por desacuerdo superan a los falsos bloqueos.
- **Por qué no está cubierta:** el Model Router no existe; las revisiones cruzadas actuales son misiones humanas.

### E17. Calibración de confianza (saber cuánto sabe) — P0, M1
- **Justificación:** sin calibración, «confianza 0.8» no significa nada; `discovery.js` ya usa confianza acotada para NPCs, pero Nexo necesita la suya sobre claims reales.
- **Funcionamiento:** cada BELIEF/predicción lleva confianza numérica; Learning la calibra contra resultados (curvas de calibración por dominio); las predicciones con fecha se puntúan al vencer. La confianza mal calibrada se corrige y el historial de calibración es auditable.
- **Componentes:** Learning, Knowledge System, MCC. **Riesgos:** calibración sobre muestra pequeña (declarar n siempre). **Límites:** la confianza calibrada no es probabilidad de verdad; es frecuencia histórica declarada.
- **Evidencia necesaria:** predicciones con resultado (el sistema debe empezar a emitirlas con fecha y criterio). **Criterios de éxito:** error de calibración decreciente por dominio tras N predicciones resueltas.
- **Por qué no está cubierta:** no hay predicciones fechadas ni Learning; la confianza actual (NPCs) no es de Nexo.

### E18. Detección de deriva del propio entorno (cambios que invalidan conocimiento) — P1, M1
- **Justificación:** el expediente sufrió deriva real (A2A 0.2.x→1.0.1 invalidó punteros C05; el contrato tipado invalidó la prueba A1). Nexo necesita detectar cuando el mundo cambió bajo su conocimiento.
- **Funcionamiento:** claims FACT llevan dependencias de entorno (versión de estándar, SHA de código, fecha de fuente); Discovery vigila cambios en esas dependencias y degrada los claims afectados a re-verificación (no los borra).
- **Componentes:** Knowledge System, Discovery, MCC. **Riesgos:** degradación masiva por un cambio menor (mitigación: degradar a «re-verificar», no a «falso»). **Límites:** solo dependencias declaradas; las no declaradas son el riesgo residual (E2 las busca).
- **Evidencia necesaria:** casos de deriva conocidos (A2A, A1) como pruebas. **Criterios de éxito:** detección de los casos A2A/A1 en simulación sin degradación masiva espuria.
- **Por qué no está cubierta:** no hay dependencias de entorno tipadas en claims; la deriva se detectó por misiones humanas.

### E19. Negociación de alcance con el propietario (preguntar bien, no preguntar mucho) — P1, M1
- **Justificación:** la iniciativa intelectual sin autonomía de autoridad exige saber **cuándo** escalar al propietario: ni cada duda (inutiliza la autonomía) ni nunca (riesgo).
- **Funcionamiento:** reglas de escalado por tipo de decisión (admisión, despliegue, cambio de alcance, gasto, irreversible) con propuesta preparada (opciones, consecuencias, recomendación técnica separada de la decisión); el sistema registra qué escaló, qué no, y aprende del propietario qué escalados eran innecesarios o tardíos.
- **Componentes:** Admisión, MCC, Learning. **Riesgos:** escalado insuficiente por «aprender» que el propietario aprueba rápido (mitigación: las reglas de escalado las fija el propietario, no el sistema). **Límites:** el sistema nunca amplía su propio umbral de escalado.
- **Evidencia necesaria:** historial de decisiones del propietario (las D-01–D-12 y ratificaciones son el corpus inicial). **Criterios de éxito:** propuestas de escalado que el propietario acepta como bien preparadas; cero decisiones de autoridad tomadas sin escalar.
- **Por qué no está cubierta:** hoy el escalado es la disciplina de Snow en misiones, no un mecanismo de Nexo.

### E20. Ensayo de recuperación (¿sigue siendo Nexo tras perderlo todo?) — P1, M1
- **Justificación:** la continuidad declarada sin ensayo es HIPÓTESIS. El expediente M02 exige procedimientos de restauración verificables; nadie los ha ensayado sobre Nexo (no hay Nexo que restaurar aún, pero el diseño debe prever el ensayo).
- **Funcionamiento:** ejercicios periódicos sobre **copias** del estado: perder un almacén, sustituir el motor, restaurar desde la MCC + memoria semántica en un entorno limpio, y verificar identidad/Constitución/conocimiento con oráculos. El resultado (qué se pierde, qué se recupera, cuánto cuesta) es un claim con evidencia, no una afirmación.
- **Componentes:** Continuity, MCC, Experiment (sandbox). **Riesgos:** ensayar sobre el estado real (prohibido: solo copias); falsa sensación de recuperación (mitigación: criterios de éxito declarados antes del ensayo). **Límites:** el ensayo prueba el procedimiento, no garantiza el desastre real.
- **Evidencia necesaria:** primeros ensayos con resultado documentado (qué se perdió en cada simulación). **Criterios de éxito:** restauración completa de identidad+Constitución+conocimiento verificado en entorno limpio, con pérdidas declaradas.
- **Por qué no está cubierta:** no hay almacén propio que ensayar; la persistencia actual depende de Lúmina/CI.

### E21. Detección de auto-referencia y auto-refuerzo — P0, M1
- **Justificación:** el riesgo más insidioso de un sistema que aprende de sus salidas: citarse a sí mismo como evidencia (el expediente lo sufrió en pequeño: «≥2 resúmenes» del mismo documento contados como independientes — F-E11).
- **Funcionamiento:** el Knowledge System marca la procedencia última de cada claim; si la cadena de evidencia termina en una salida del propio sistema sin contraste externo, el claim no puede superar BELIEF y Discovery abre pregunta de contraste. Incluye detección de ciclos de citación.
- **Componentes:** Knowledge System, Discovery. **Riesgos:** bloquear conocimiento legítimo derivado (mitigación: la marca es visible y la revisión puede promover con contraste nuevo). **Límites:** detecta auto-referencia declarada; la auto-referencia oculta (vía fuente secundaria que cita a Nexo) es UNKNOWN residual.
- **Evidencia necesaria:** casos de auto-cita sembrados (F-E11 como prueba natural). **Criterios de éxito:** detección del caso F-E11 y de ciclos sintéticos sin bloquear derivaciones legítimas.
- **Por qué no está cubierta:** no hay grafo de procedencia en Nexo; la detección actual es humana (misión 003).

### E22. Presupuesto y economía de la investigación — P2, M1
- **Justificación:** investigación autónoma sin presupuesto es investigación interminable (escenario adversarial explícito del encargo). El propietario es sensible al coste (documentado: sin suscripción, rotación de herramientas gratuitas).
- **Funcionamiento:** cada pregunta/experimento lleva presupuesto (tiempo, cómputo, tokens de motor, atención humana) declarado antes de autorizar; Discovery prioriza por valor/coste; el sistema reporta gasto real vs previsto en la MCC y se detiene al agotar el presupuesto del ciclo.
- **Componentes:** Discovery, Experiment, Admisión (autoriza presupuestos). **Riesgos:** presupuesto que estrangula la investigación valiosa (mitigación: el propietario fija techos; el sistema propone, no decide). **Límites:** sin presupuesto autorizado no hay investigación autónoma, solo preparación.
- **Evidencia necesaria:** costes reales de investigaciones piloto. **Criterios de éxito:** gasto real dentro del previsto (± margen declarado) en pilotos; cero investigaciones sin presupuesto.
- **Por qué no está cubierta:** no hay contabilidad de investigación en Nexo; el coste actual lo gestiona el humano entre proveedores.

## Priorización consolidada

| Prioridad | Capacidades | Razón |
|---|---|---|
| **P0** (fundacional) | E2 (preguntas no formuladas), E4 (generación/selección de experimentos), E5 (errores propios), E11 (evaluación de candidatos), E12 (memoria de fallidos), E16 (verificación cruzada), E17 (calibración), E21 (auto-referencia) | Sin estas, el «descubrimiento autónomo» es generación sin control: el sistema produciría sin detectar, sin verificar y sin recordar sus fallos. |
| **P1** | E1 (meta-investigación), E3 (causalidad), E6 (límites del conocimiento), E9 (automatización), E10 (síntesis de herramientas), E13 (sesgos), E14 (problemas abiertos), E15 (mejores preguntas), E18 (deriva del entorno), E19 (escalado), E20 (ensayo de recuperación) | Multiplican el valor de P0 o protegen frentes (entorno, recuperación, relación con el propietario) que P0 no cubre. |
| **P2** | E7 (transferencia cross-dominio), E8 (transferencia procedimental), E22 (economía) | Valiosas pero presuponen P0/P1 estables; E22 puede adelantarse si el coste se vuelve el cuello de botella. |

**Nota de madurez:** todo el catálogo nace en M1 (diseño). Ninguna capacidad se promueve a M2+ sin prototipo evaluado (E11) y sin Admisión. La característica distintiva candidata (ver síntesis) se construye sobre E2+E5+E12+E21: un sistema que detecta lo que no sabe, recuerda sus fallos y no se cita a sí mismo.
