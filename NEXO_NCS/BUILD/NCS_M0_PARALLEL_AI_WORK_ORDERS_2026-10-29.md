# NCS M0 — encargos paralelos de revisión externa (2026-10-29)

**Estado:** SOLICITUDES DE ANÁLISIS — PENDIENTES DE ENVIAR/RESPONDER — NO SON EVIDENCIA DE CIERRE NI AUTORIZACIÓN DE CAMBIOS.

## Objetivo

Usar Qwen, Perplexity, Gemini y Claude en trabajos independientes que reduzcan incertidumbre de M0. No repetir auditorías ya documentadas ni solicitar una evaluación general de Nexo.

## Baseline común obligatorio

Antes de responder, cada IA debe usar estos artefactos como fuente de verdad:

- [STATUS.md](../STATUS.md)
- [Contrato de aceptación de entorno restringido](NCS_M0_RESTRICTED_BOOTSTRAP_ENVIRONMENT_ACCEPTANCE_CONTRACT_2026-10-29.md)
- [Evaluación de mecanismos FB-04](NCS_M0_FB04_PUBLICATION_MECHANISM_ASSESSMENT_2026-10-29.md)
- [Matriz negativa FB-04](NCS_M0_FB04_NEGATIVE_ACCEPTANCE_TEST_MATRIX_2026-10-29.md)
- [Matriz de trazabilidad A-01…A-09](NCS_M0_ACCEPTANCE_CRITERIA_TRACEABILITY_2026-10-28.md)
- [Inventario estático de launcher/entrypoints](NCS_M0_FB03_REPOSITORY_LAUNCHER_INVENTORY_2026-10-29.md)

Estado de partida: FB-02 PASS/CERRADO solo en alcance validado; FB-01/03/04 OPEN/UNKNOWN; FB-05/P-05 no ratificada; FB-06/07 OPEN; E2/E3 UNKNOWN; E4 NOT READY; raíz PENDING/UNKNOWN; authorization NOT_EVALUATED; primera publicación Continuity y efectos protegidos STOP; M0 INCOMPLETO.

## Reglas para las cuatro revisiones

1. No volver a ejecutar una auditoría general del repositorio ni rehacer hallazgos ya registrados.
2. No asumir que la app Android M1 ejecuta Node.js, Termux o el entrypoint `scripts/nexo.mjs`.
3. No asumir filesystem, primitivas, permisos, launcher o procesos instalados en el POCO.
4. No marcar PASS/CLOSED por documentación, razonamiento o CI que no demuestre la propiedad concreta.
5. Distinguir evidencia primaria, inferencia, propuesta y UNKNOWN.
6. No editar código, abrir PR, ejecutar workflow, publicar Continuity ni sugerir que se haga sin autorización específica.
7. Informar solo contradicciones concretas, vacíos críticos o evidencia nueva que cambie una decisión.
8. Toda recomendación debe incluir precondiciones, limitaciones y qué prueba la falsaría.

---

## Encargo Qwen — revisión adversarial de FB-04

**Pregunta:** ¿La matriz negativa FB-04 cubre las condiciones necesarias para demostrar create-if-absent/no-replace de primera publicación y separa correctamente esa operación de commits posteriores?

**Trabajo exacto:**
- Revisar N01–N13 y C01–C05.
- Detectar únicamente escenarios críticos ausentes, criterios no falsables, expectativas técnicamente incorrectas o casos redundantes.
- Examinar especialmente publicación concurrente, no-cooperating writer, sustitución de path/symlink, temporales ajenos, interrupción alrededor del punto de publicación y resultado ambiguo.
- No proponer una primitiva concreta sin conocer el filesystem real.
- Devolver una tabla: ID propuesto, amenaza, precondición, inyección determinista, resultado exigido, evidencia observable, razón por la que no está cubierta ya.
- Si no hay brechas críticas, decirlo explícitamente. No inventar brechas para producir trabajo.

**Entrega:** revisión adversarial breve, con máximo 10 hallazgos priorizados.

---

## Encargo Perplexity — fuentes primarias sobre primitivas no-replace

**Pregunta:** ¿Qué primitivas y garantías documentadas ofrecen Node.js y los sistemas Linux/Android para publicar un archivo completo sin reemplazar un destino existente, y qué limitaciones impiden seleccionar una opción antes de conocer el entorno real?

**Trabajo exacto:**
- Investigar documentación primaria vigente: Node.js API docs, Linux man-pages/kernel docs y Android/AOSP cuando corresponda.
- Comparar semántica de `rename`, `open(O_CREAT|O_EXCL)`, hard-link/`linkat`, y cualquier API no-replace relevante (p. ej. `renameat2(RENAME_NOREPLACE)`) sin asumir que está expuesta por Node.js o disponible en Android.
- Para cada mecanismo: atomicidad, no-replace, exposición de archivo parcial, mismo filesystem, symlinks/path resolution, soporte de API/runtime, permisos y límites.
- Separar garantías POSIX/Linux, API Node estándar, extensiones nativas y filesystem Android concreto.
- No recomendar implementar todavía; indicar qué dato del dispositivo/runtime sería necesario para decidir.
- Incluir enlaces directos y citas a fuentes primarias; marcar cualquier afirmación no verificada.

**Entrega:** tabla comparativa + conclusión condicional, sin tutorial de instalación ni comandos para el propietario.

---

## Encargo Gemini — coherencia constitucional y trazabilidad de cierre

**Pregunta:** ¿Hay contradicciones, criterios incompletos o decisiones de autoridad implícitas entre STATUS, el contrato de entorno restringido y la matriz A-01…A-09 que puedan impedir una aceptación M0 inequívoca?

**Trabajo exacto:**
- Revisar solo los documentos enumerados en el baseline.
- Comprobar que cada criterio A-01…A-09 tiene evidencia exigida, responsable/autoridad cuando corresponda, y condición explícita PASS/FAIL/UNKNOWN.
- Buscar especialmente conflictos entre: decisión del propietario de permitir entorno restringido; autoridad/legitimidad de raíz; P-05 recuperación/readmisión; alcance de FB-01 vs FB-03/04; FB-06 suficiencia de evidencia vs FB-07 ejecución reproducible.
- Identificar decisiones que realmente requieren al propietario, sin inventar decisiones nuevas ni convertir propuestas en ratificaciones.
- No reabrir FB-02 ni rehacer análisis de código.

**Entrega:** máximo 8 contradicciones/gaps con documento/sección, impacto sobre M0, corrección documental mínima y si requiere decisión del propietario (sí/no).

---

## Encargo Claude — revisión acotada de FB-03 / E2-E3

**Pregunta:** ¿El contrato de entorno restringido define evidencia suficiente y no circular para demostrar exclusión sostenida de writers y control de relanzamiento durante la primera publicación?

**Límite:** leer únicamente el contrato de entorno restringido y STATUS. No investigar todo el repo ni volver a inventariar launchers.

**Trabajo exacto:**
- Evaluar los requisitos 1–7 del apartado 3 y la distinción E2/E3.
- Señalar solo requisitos ambiguos, imposibles de observar, circulares o insuficientes.
- Proponer la evidencia mínima observable que demostraría cada condición sin asumir Termux/Node ni acceso root.
- Indicar qué condiciones no pueden demostrarse con el contexto actual.
- No diseñar un nuevo sistema de aislamiento ni proponer pasos de instalación.

**Entrega:** máximo 5 observaciones, muy concisas; clasificar cada una CRÍTICA / MEJORA / SIN BRECHA.

---

## Cómo integrar las respuestas

1. Conservar cada respuesta original, con nombre de IA y fecha, sin editar sus afirmaciones.
2. Contrastar cada hallazgo con el baseline y clasificarlo: CONFIRMADO / NUEVO Y RELEVANTE / YA CUBIERTO / INCORRECTO / UNKNOWN.
3. Solo incorporar cambios documentales cuando haya evidencia o una mejora de criterio verificable.
4. Ninguna respuesta de IA cierra un gate por sí sola. El estado solo cambia con evidencia trazable al código, entorno, autoridad y/o ejecución que exige el criterio.
5. Si las respuestas discrepan, no promediar opiniones: registrar la contradicción y resolverla por evidencia primaria o mantener UNKNOWN.

## Mensaje de coordinación para el propietario

Enviar a cada IA únicamente su sección de encargo más el baseline común. No es necesario enviar las cuatro tareas a una misma IA. Al recibir las respuestas, pegarlas aquí para reconciliación y actualización de STATUS.