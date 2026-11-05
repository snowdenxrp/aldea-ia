# MISIÓN 01 — MUSE / AUTONOMÍA FUTURA DE NEXO
## Investigación recibida y auditoría arquitectónica integral
**Fecha:** 2026-11-05  
**Clasificación:** INVESTIGACIÓN DOCUMENTAL + AUDITORÍA DE PROPUESTA  
**Estado:** APROVECHABLE COMO REFERENCIA; NO APROBADA PARA IMPLEMENTACIÓN  
**Propietario:** Kevin  
**Rama documental:** `ncs-strategic-vision-preservation-2026-11-05`

---

## 0. Alcance y autoridad de este expediente

Este expediente conserva la síntesis estructurada de la investigación de Meta Muse presentada por el propietario en el chat, y el dictamen de auditoría emitido al recibir la señal **DOCUMENTO COMPLETO**.

La investigación original declara que no implementó nada, no modificó NCS M0 ni P07 y no ratificó decisiones. Esta auditoría tampoco ejecutó código, pruebas, CI, workflows, comandos Termux/POCO, bootstrap, publicación, commissioning ni efectos protegidos.

**Este documento no es una ratificación de arquitectura ni una autorización de trabajo futuro.** Distinguir siempre:
- EVIDENCIA: comportamiento demostrado por fuente o prueba en su alcance.
- PROPUESTA: diseño recomendado, aún no implementado ni aprobado.
- HIPÓTESIS: posibilidad que necesita validación.
- UNKNOWN/PENDING: no demostrado; no convertirlo en PASS por inferencia.

NCS M0/P07 permanecen fuera del alcance de esta misión. La condición de la investigación es que cualquier implementación futura se considere solo después del cierre formal de M0 y de una autorización separada.

## 1. Dictamen ejecutivo

**MISIÓN 01 es aprovechable como investigación de referencia y base para una futura especificación propia de Nexo. No es un diseño definitivo ni autoriza implementación.**

La dirección arquitectónica es coherente con la visión rectora:
- Nexo no es un chatbot, un modelo ni un proveedor.
- Core preserva identidad, Constitución, autoridad y continuidad.
- Cognition aporta razonamiento, pero no identidad ni autoridad.
- Memoria operativa, experimental y simulada debe permanecer diferenciada.
- Labs debe estar aislado y no poder modificar Core directamente.
- Lúmina permanece separada.
- Los modelos externos/locales son motores sustituibles.
- La autonomía crece por capacidades y puertas de salida verificables.
- La operación offline y la recuperación son objetivos estructurales.

La debilidad central: el documento describe una arquitectura plausible, pero todavía no demuestra que esa arquitectura preserve identidad, autoridad y continuidad frente a fallos, sustituciones, ataques o pérdida de proveedores.

**Conclusión:** conservar la investigación, corregir los puntos críticos y producir una especificación arquitectónica propia de Nexo. No construir Nexo alrededor de LangGraph, Mem0, Muse, Ollama, un modelo local ni un proveedor comercial.

## 2. Contenido de la investigación recibida

### 2.1 Resumen ejecutivo y principios

Muse se estudia como referencia externa del patrón de autoridad separada, no como base técnica para Nexo. El documento describe Muse como producto cerrado, dependiente de la nube de Meta, sin pesos ni código público y con disponibilidad geográfica limitada.

Patrón reutilizable atribuido a Muse:
1. Runtime aislado por usuario.
2. Autoridad de permisos separada del agente que propone.
3. Credenciales invisibles al agente.
4. Aprobación humana para acciones sensibles.
5. Registro de auditoría.
6. Olvido explícito.

La investigación declara límites importantes: arquitectura interna de Muse no publicada, ausencia de pesos/código, afirmaciones de seguridad dependientes del vendor, riesgo residual de prompt injection y falta de prueba independiente sobre Sentinel.

### 2.2 Arquitectura propuesta

Dominios identificados:
- **Core:** identidad, principios, Constitución, autoridad, memoria fundamental y registro de continuidad.
- **Cognition:** razonamiento local/remoto, planificación, routing y harness metacognitivo; no guarda identidad ni concede permisos.
- **Memoria:** episódica, semántica y procedimental; namespaces operativa, experimental y simulada.
- **Autonomía operativa:** tareas autorizadas, herramientas, workflows, verificación, recuperación y escalado.
- **Nexo Labs:** investigación, experimentación, ingeniería y pruebas aisladas.
- **Lúmina:** proceso y almacenamiento separados, sin sincronización de memoria/estado operativo Nexo.

La investigación propone que los límites se impongan por permisos reales del sistema operativo/contenedor, no por instrucciones al modelo.

### 2.3 Cognition y workflows

Patrones estudiados:
- ReAct y plan-and-execute.
- Reflexion como mecanismo experimental de auto-corrección.
- Validación externa mediante tests, esquemas, tipos y criterios de éxito.
- LangGraph para estado durable, checkpoints, reanudación e interrupción para aprobación.
- Routing mediante LiteLLM/OpenRouter o equivalente.

La investigación advierte que la metacognición calibrada no es una capacidad estándar y que la autoevaluación verbal no prueba corrección.

### 2.4 Memoria

Tecnologías comparadas:
- **Mem0 OSS:** extracción de hechos con LLM, SQL, vector store y entidades; no incluye Graph Memory en OSS según el informe.
- **Zep/Graphiti:** grafo temporal, episodios, procedencia, invalidación temporal y recuperación híbrida.
- **Letta/MemGPT:** memoria auto-editada y gestión de contexto.
- **LangMem/LangGraph Store:** memoria integrada con el ecosistema LangChain.
- **RAG vectorial genérico:** recuperación semántica sin resolver por sí sola extracción, temporalidad o procedencia.

Modelo propuesto para Nexo:
- Episódica: eventos con timestamp.
- Semántica: hechos con vigencia/TTL.
- Procedimental: skills versionadas con tests.
- Ámbitos operativos, experimentales y simulados separados.
- Promoción controlada y revisión humana para datos de alto impacto.

La investigación reconoce que procedencia, append-only y versionado no equivalen a integridad criptográfica.

### 2.5 Agentes especializados

Roles propuestos:
- Orchestrator: objetivo autorizado y plan; sin herramientas de efectos externos.
- Researcher: fuentes/citas, solo lectura.
- Executor: sandbox y allowlist.
- Validator: validación independiente, contexto separado cuando sea posible.
- Memorist: propone recuerdos con procedencia y alcance de escritura restringido.

La especialización debe ser por permisos, herramientas y contexto, no solo por personalidad. Ningún agente puede concederse permisos ni escribir Core.

Frameworks comparados: LangGraph, CrewAI, AutoGen/Microsoft Agent Framework. La investigación considera el churn de frameworks una razón para mantener política, memoria y permisos fuera de ellos.

### 2.6 Nexo Labs

Propuesta:
- Contenedor/VM por experimento.
- Egress denegado por defecto.
- Credenciales efímeras, nunca claves reales del propietario.
- Sin ruta de escritura al Core ni memoria operativa.
- Artefactos reproducibles con hipótesis, código, datos, resultado, evaluación y decisión de promoción/iteración/descarte.
- Promoción solo tras pruebas, auditoría y autorización del propietario.
- Cybersecurity Lab limitado a entornos propios o expresamente autorizados.

### 2.7 Autonomía y permisos

Se propone Policy Engine determinista y externo al LLM, niveles N0–N3, allow/ask/deny, mínimo privilegio, credenciales efímeras, sandbox del SO, auditoría y aprobación humana.

Riesgos identificados:
- Prompt injection directa e indirecta.
- Sobre-permiso y radio de daño.
- Memoria envenenada.
- Acciones irreversibles.
- Dependencia de proveedor.
- Cambios de framework.
- Licencias de pesos.
- Servidores de inferencia expuestos.
- Confundir propuesta con capacidad.

### 2.8 Independencia y operación offline

La visión presentada distingue reconstrucción de infraestructura digital, informática y física. La reconstrucción física está condicionada por materiales, energía, maquinaria y recursos reales.

Dependencias críticas:
- Distribución de pesos.
- Licencias por checkpoint.
- Proveedores de APIs y conectividad.
- Motores de inferencia, herramientas y dependencias.

Mitigación propuesta: archivar localmente pesos y licencias, mantener abstracción de modelos y probar restauración offline.

### 2.9 Hardware e inferencia

Motores comparados:
- Ollama.
- llama.cpp.
- vLLM.
- SGLang.
- LM Studio / Open WebUI como interfaces, no Core.

Familias de modelos citadas:
- Llama.
- Qwen.
- Mistral.
- DeepSeek.
- Gemma.
- Phi.
- gpt-oss.
- Muse Spark Open/Glimmer (licencia/estado UNKNOWN según el propio informe).

El informe usa tamaños aproximados de pesos para modelos cuantizados y propone 7–14B como respaldo offline, 30–70B como opción local avanzada.

### 2.10 Capacidades y fases

La tabla de capacidades define criterios verificables por fases:
- **F1:** Core append-only y enmiendas versionadas; workflow con checkpoints/aprobación; Policy Engine N0–N3; memoria episódica/semántica con procedencia.
- **F2:** inferencia local offline 7–14B; router/fallback; verificación externa y recuperación.
- **F3:** agentes especializados; Labs aislado; metacognición calibrada.
- **F4:** modelo local grande si lo justifica el benchmark; integridad verificable de memoria; archivo offline y restauración en máquina limpia.

Criterios importantes incluyen bloqueo de acciones N3 no aprobadas, pruebas anti-inyección, ausencia de conexiones externas offline, recuperación ante fallos y aislamiento efectivo de Labs.

### 2.11 Riesgos, plan, costos y decisiones

Sección 12 registra prompt injection, sobre-permiso, memoria envenenada, dependencia de proveedor, churn de frameworks, irreversibilidad, licencias y exposición de inferencia.

Sección 13 propone F0–F4, sin avanzar por calendario sino por puertas verificables. Ninguna fase empieza antes del cierre de M0.

Sección 14 declara expresamente que los precios no fueron verificados en fuentes primarias y deben cotizarse antes de presupuestar. Incluye costos locales, servidores, APIs, memoria gestionada y routing.

Sección 15 deja abiertas al propietario:
1. Framework de orquestación.
2. Sistema de memoria.
3. Modelo local/licencia/hardware.
4. Proveedores remotos y política de datos.
5. Niveles N0–N3 y acciones N3.
6. Alcance de Labs/Cybersecurity Lab.
7. Integridad criptográfica de memoria y custodia de clave.
8. Frontera operativa con Lúmina.
9. Presupuesto por fase.

### 2.12 Fuentes y límites declarados por la investigación

Fuentes primarias citadas como abiertas directamente en la sesión del informe:
- Meta — Introducing Muse (2026-09-08).
- LangChain — LangGraph Checkpointers.
- Mem0 — How Mem0 Works (actualizado 2026-09-24).
- Anthropic / Claude Code — Configure permissions.
- Yao et al. — ReAct, arXiv:2210.03629.
- Shinn et al. — Reflexion, arXiv:2303.11366.
- Packer et al. — MemGPT, arXiv:2310.08560.
- Rasmussen et al. — Zep, arXiv:2501.13956.

Fuentes oficiales localizadas por índice, no abiertas directamente:
- vLLM Docs.
- Ollama Library.
- Graphiti Docs.
- LangMem.
- MCP Specification.

Secundarias concordantes localizadas por índice:
- Comparativas LangGraph/AutoGen/CrewAI.
- Microsoft Agent Framework.
- Anthropic guidance.
- Hardware LLM local.
- Comparativas vLLM/Ollama/llama.cpp/SGLang.
- LiteLLM/OpenRouter.
- Surfer 2, arXiv:2510.19949.

Preguntas abiertas reconocidas:
- Precios no verificados en primaria.
- Diseño interno de Muse no publicado.
- Separación de ámbitos y verificación criptográfica son propuestas propias.
- Metacognición calibrada sin estándar documentado.
- Reversibilidad general no documentada.
- Benchmarks citados no son mediciones de Nexo.
- Anthropic guidance citado vía secundaria.
- Estado 2026 de Letta/Zep según secundarias.
- Muse Spark Open/Glimmer según secundarias.

## 3. Hallazgos de auditoría

### 3.1 Core: append-only no basta

El almacén append-only/versionado no demuestra por sí solo:
- Quién autorizó una modificación.
- Que no hubo alteración fuera del procedimiento.
- Que no se restauró una versión antigua para ocultar cambios.
- Que la clave de firma no fue comprometida.
- Que una copia restaurada conserva integridad.

Distinguir:
- **Inmutabilidad lógica:** correcciones como nuevas versiones, sin sobrescritura destructiva.
- **Integridad verificable:** criptografía y controles para detectar alteraciones, suplantaciones y determinados ataques de rollback.

**Corrección recomendada:** integridad y autoridad de registros fundamentales del Core desde la primera implementación autorizada. El hash encadenado de grandes almacenes puede ampliarse después; la protección de identidad/Constitución no debe aplazarse a F4.

### 3.2 Policy Engine: falta contrato de autorización

El agente no debe poder:
- Modificar reglas.
- Fabricar aprobación.
- Reutilizar aprobación antigua.
- Cambiar parámetros/destino después de aprobación.
- Ejecutar herramienta fuera del alcance concedido.

La aprobación debe vincularse a acción concreta, parámetros, destino, consecuencias, identidad solicitante, versión de política y duración. Cualquier cambio material invalida la aprobación.

### 3.3 Checkpoints no son recuperación de efectos externos

LangGraph puede pausar, persistir y reanudar workflows. Un nodo interrumpido puede volver a ejecutarse al reanudar. Un checkpoint no impide duplicar una transferencia, correo u otro efecto externo si el proceso falla después de la acción y antes de registrar el resultado.

Se requiere separar:
- Estado del workflow.
- Registro de efectos externos.
- Idempotencia cuando el servicio la admita.
- Estado de ejecución.
- Reconciliación después de fallos.

**Continuidad de ejecución ≠ continuidad segura de efectos.**

### 3.4 Memoria candidata ≠ memoria aceptada

La extracción por LLM puede inventar hechos, fusionar entidades o recuperar información obsoleta. Ciclo recomendado:
1. Capturar evento original.
2. Extraer candidatos.
3. Comprobar procedencia/contexto.
4. Resolver contradicciones.
5. Clasificar ámbito.
6. Autorizar según tipo de dato.
7. Registrar aceptación/rechazo/corrección.
8. Recuperar con vigencia y procedencia.

Memoria experimental no se promueve automáticamente a operativa. Memoria simulada nunca adquiere autoridad sobre la realidad. La memoria fundamental de identidad/Constitución/continuidad permanece fuera de sistemas ordinarios de memoria.

### 3.5 Labs: contenedor no equivale automáticamente a frontera suficiente

Para experimentos de alto riesgo, preferir VM desechable, sin credenciales de producción, sin acceso al Core y con egress denegado. Probar rutas montadas, sockets del host, servicios internos, interfaces de red alternativas y escape del sandbox.

### 3.6 Offline: pesos no equivalen a recuperación completa

Archivo reproducible debe incluir:
- Pesos y licencias.
- Runtime/motores de inferencia.
- Tokenizadores/configuraciones.
- Dependencias y paquetes.
- Herramientas de administración.
- Código propio.
- Documentación técnica.
- Esquemas/formatos de memoria.
- Copias cifradas y recuperación.
- Diagnóstico/verificación.

La restauración debe probarse en máquina limpia y sin red.

### 3.7 Hardware

Tamaño del archivo de pesos ≠ memoria total de inferencia. Incluir KV cache, contexto, runtime, concurrencia, offload y memoria del SO. 70B Q4 no debe presupuestarse como carga cómoda en GPU de 24 GB VRAM solo por el tamaño aproximado de pesos. El hardware debe evaluarse con una batería propia y condiciones reproducibles.

### 3.8 Agentes especializados

Cinco agentes no son requisito. Un orquestador pequeño con servicios separados puede ser más verificable. La especialización se justifica solo si mejora resultados medibles y mantiene permisos/contextos distintos. Un validador no es independiente si comparte el mismo contexto, fuentes y sesgos del ejecutor.

### 3.9 Muse

Muse es referencia válida del patrón de autoridad separada. Las afirmaciones de seguridad del producto son claims del fabricante, no auditoría independiente de resistencia. No adoptar producto cerrado como dependencia ni inferir su arquitectura interna no publicada.

### 3.10 Benchmarks y cifras

Resultados ReAct/Reflexion pertenecen a configuraciones experimentales concretas; no son garantías de Nexo. Cifras de papers/vendors no son benchmarks propios. Las puertas de salida deben usar tareas de referencia propias de Nexo, versiones congeladas, criterios previos y resultados reproducibles.

## 4. Evaluación de tecnologías candidatas

| Tecnología | Evaluación |
|---|---|
| LangGraph | Candidato fuerte para workflows durables; nunca autoridad ni dueño de continuidad Nexo. |
| ReAct | Patrón útil de razonamiento/actuación; no seguridad. |
| Reflexion | Mecanismo experimental; no verificador independiente. |
| Mem0 OSS | Candidato de extracción/recuperación; no memoria fundamental del Core. |
| Graphiti | Candidato temporal/procedencia; evaluar complejidad y almacenamiento. |
| Letta | Mantener experimental; no comprometer memoria fundamental. |
| Ollama | Inferencia local sencilla. |
| llama.cpp | Control de inferencia y portabilidad local. |
| vLLM/SGLang | Reservar para GPU y servicio multiusuario real. |
| LiteLLM | Routing candidato; controlar datos y presupuesto por fuera. |
| CrewAI | Prototipado; no centro arquitectónico. |
| Microsoft Agent Framework | Alternativa a evaluar según ecosistema. |
| Muse | Referencia, no dependencia. |

Regla de diseño: interfaces propias de Nexo para workflows, memoria, modelos y herramientas; ningún framework se convierte en dependencia estructural.

## 5. Plan de fases corregido recomendado

No es aprobación de implementación; es refinamiento documental de la propuesta:

- **F0 — Fundamento:** cerrar M0; Constitución, identidad, autoridad y continuidad con criterios verificables.
- **F1 — Autoridad y operación mínima:** Core protegido, Policy Engine, auditoría, permisos explícitos y un workflow de referencia; empezar con lectura y efectos controlados.
- **F2 — Continuidad e independencia:** recuperación tras fallos, registro de efectos externos, modelo local de respaldo, routing y batería offline.
- **F3 — Expansión controlada:** Labs aislado, agentes solo si aportan mejora medible, memoria avanzada y evaluación de calibración.
- **F4 — Resiliencia ampliada:** archivo reproducible, restauración en máquina limpia, integridad criptográfica ampliada y evaluación de autonomía adicional.

La integridad criptográfica del Core es requisito fundamental inicial; F4 puede ampliar el mecanismo a todos los almacenes. No es obligatorio incorporar cinco agentes.

## 6. Decisiones que NO quedan tomadas

No seleccionar aún:
- LangGraph/CrewAI/framework propio.
- Mem0/Graphiti/Letta.
- Modelo local ni licencia.
- Proveedor remoto ni datos autorizados a salir.
- Niveles N0–N3 ni lista de acciones N3.
- Red/entornos exactos de Labs.
- Custodia de claves de firma.
- Presupuesto de fases.

La investigación y esta auditoría no ratifican ninguna de estas decisiones.

## 7. Clasificación final

**Aprobado como referencia documental:**
- Separación Core/Cognition/Memoria/Labs/Lúmina.
- Autoridad independiente del agente.
- Modelos sustituibles.
- Memoria con procedencia y ámbitos.
- Autonomía gradual y verificable.
- Resiliencia/offline.
- Muse como referencia, no dependencia.

**Pendiente antes de especificación técnica:**
- Contrato del Core.
- Taxonomía N0–N3.
- Contrato de Policy Engine y aprobaciones vinculadas a acción.
- Efectos externos, idempotencia y reconciliación.
- Memoria candidata/aceptada.
- Amenazas y aislamiento de Labs.
- Archivo offline reproducible.
- Hardware/benchmarks.
- Licencias por checkpoint y presupuesto.

**No autorizado:**
- Implementación.
- Cambios en NCS M0/P07.
- Selección definitiva de frameworks.
- Ampliación de autonomía.
- Integración de Muse o Lúmina en Core.

## 8. Próxima unidad de trabajo documental

Producir una **especificación arquitectónica propia de Nexo**, derivada de la visión rectora y de esta auditoría, no una copia del stack de Muse.

Orden recomendado:
1. Definir invariantes y fronteras Core/Cognition/Memory/Policy/Labs/Lúmina.
2. Definir contrato de autoridad y permisos, sin elegir aún framework.
3. Definir contrato de memoria y promoción de candidatos.
4. Definir workflow y recuperación de efectos externos.
5. Definir modelo de amenazas y límites de Labs.
6. Definir niveles de independencia y pruebas offline.
7. Solo entonces comparar tecnologías concretas con requisitos y evidencia.

No iniciar implementación hasta cierre M0 y autorización expresa posterior.

## 9. Declaración de preservación

Este expediente es una síntesis auditada del documento Muse presentado por el propietario en la conversación. No debe describirse como transcripción literal del informe completo de Muse. El texto original sigue siendo el material fuente del chat. Si se necesita preservar literalmente el informe fuente, debe incorporarse desde el archivo/exportación original del propietario, sin reconstruir citas faltantes de memoria.

---
