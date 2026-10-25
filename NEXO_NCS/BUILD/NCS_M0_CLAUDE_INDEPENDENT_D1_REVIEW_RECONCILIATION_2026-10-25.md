# NCS M0 — reconciliación de revisión independiente de Claude sobre cierre D1
Fecha: 2026-10-25
Rama documental objetivo: `ncs-clean-architecture`
Estado: DOCUMENTACIÓN DE RECONCILIACIÓN — NO CIERRA D1 — NO AUTORIZA IMPLEMENTACIÓN

## 1. Propósito y límites

Registrar la revisión independiente aportada por Claude y contrastarla con los contratos y artefactos D1 existentes, sin repetir el censo de 188 archivos ni convertir recomendaciones en decisiones del propietario. Esta nota no cambia runtime, tests, workflows ni datos operativos. No se ejecutaron pruebas ni CI como parte de esta reconciliación.

Claude indica que contrastó fuentes en el snapshot identificado como HEAD `1a7f721`, verificó blobs de 13 archivos clave, leyó completos los documentos principales D1 y la línea de meta, pero leyó solo las primeras 120 líneas de `STATUS.md`, consultó D0/D2 parcialmente y no leyó el caller ledger. Por tanto, sus hallazgos de texto son útiles, pero no equivalen a una verificación completa de todo el estado canónico.

## 2. Estado canónico preservado

- M0: `INCOMPLETO`.
- D0 técnico/evidencia: `OPEN`.
- D1-DESIGN: `OPEN`.
- D1-IMPLEMENTATION: `NO AUTORIZADA`.
- D2/D3: `OPEN`.
- `authorization: NOT_EVALUATED`.
- Raíz legítima: `PENDING/UNKNOWN`.
- Efectos protegidos: `STOP`.
- O-01…O-11 conservan únicamente el alcance expresamente ratificado.
- Las propuestas P-01…P-10 no se promueven a decisiones por esta revisión.

## 3. Hallazgos confirmados y clasificación

### C1. Invariante de admisión anterior a la primera lectura persistente — BLOQUEADOR D1

La matriz D1 ya afirma que la admisión debe preceder a la primera lectura persistente y que no existe excepción de solo lectura; O-10 ratifica el principio. Sin embargo, el alcance exacto de la frase “lectura persistente en alcance” y el orden de fases no están congelados de forma única. La matriz distribuye el invariante entre D1 y D2 de manera que puede interpretarse como una contradicción de fase.

Acción documental: definir en D1 el invariante semántico, el comienzo del límite y las categorías de lectura que deben considerarse. Mantener en D2 la selección de sección crítica, vida útil del snapshot, lock de lectura y comportamiento de concurrencia. La secuencia 0–3 sugerida por Claude es una propuesta, no una especificación ratificada.

No debe afirmarse que metadatos de raíz, lock, stdin o archivos de entrada del operador están incluidos o excluidos sin una definición explícita. Distinguir validación pura, resolución/canonicalización de raíz, admisión y primera lectura de los stores canónicos.

### C2. Gramática de raíz única y contrato padre/hijo Chronicle — BLOQUEADOR D1

La evidencia citada por Claude coincide con el manifiesto y el recheck de Chronicle: el CLI principal reenvía argumentos al proceso hijo; el hijo es invocable directamente; las interfaces actuales usan rutas de stores separadas y no implementan el contrato `--root` aceptado como diseño. El padre actualmente no sostiene un lock de instancia, por lo que no hay evidencia de deadlock actual; el requisito es evitarlo en el diseño futuro.

Acción documental: proponer una gramática v0 que enumere opciones aceptadas/rechazadas, combinaciones contradictorias, tratamiento de `--initialize-*`, mapping de la raíz a stores, base de resolución para rutas relativas y responsabilidad de validación del hijo. Marcar como PROPUESTA las decisiones aún no ratificadas. No implementar parser ni cambiar runtime.

### C3. Estado propietario Nexo/Lúmina y excepción de assistants/simulate — BLOQUEADOR D1

La matriz y el manifiesto ya reconocen que `assistants.mjs` y `simulate.mjs` combinan rutas de estado, pero la etiqueta `EXPLICIT_EXCEPTION — DESIGN ONLY` carece de una condición de salida suficientemente operativa. Claude añade referencias concretas a `state.nexoMemory`, la rama `nexo` de la memoria de asistentes y las dependencias de reparación/runtime. Son pistas específicas que deben cotejarse con el ledger, no una autorización para refactorizar.

Acción documental: tabla archivo/estado → dominio propietario → lectores/escritores permitidos → aristas prohibidas → condición de salida de la excepción. Preservar la persistencia legítima de aprendizaje y estado del mundo de Lúmina. La excepción interina frente a contrato permanente requiere decisión explícita del propietario; no inferirla.

### C4. Inventario textual de aristas dinámicas — HALLAZGO PARCIAL, NO PRUEBA DE CIERRE

Claude aporta un resultado de `git grep` sobre archivos JS-family trackeados: un `import(` textual en `src/three-remote.js`, `child_process` en el CLI Nexo y ausencia textual de otras construcciones buscadas. Es un resultado acotado y útil si se registra con el comando, commit/tree SHA y alcance exacto. No es un grafo AST, no cubre Python/Java/Android ni consumidores externos y no prueba ausencia de carga indirecta.

Acción documental: añadir al ledger el comando exacto, snapshot/SHA y resultado; reclasificar solo las aristas efectivamente enumeradas como “enumeradas en búsqueda textual”. Mantener externas, no-JS, generadas y cualquier arista no resuelta como `UNKNOWN/BLOCKED`. No repetir el barrido completo sin cambio de fuente.

### C5. Colisión de identificadores P-xx — DEFECTO DOCUMENTAL CONFIRMADO

El registro de decisiones utiliza P-01…P-09 en §3 y vuelve a usar P-01…P-10 en §8.2 con significados diferentes. Por ejemplo, P-02 significa alcance de admisión en §3 y fronteras Nexo/Lúmina en §8.2; P-03 significa primitiva de lock en §3 y alcance de admisión en §8.2. La matriz referencia P-02…P-04/P-08/P-09 sin desambiguación suficiente.

Acción documental: conservar trazabilidad histórica, pero renombrar de forma inequívoca los identificadores de la sección histórica o calificarlos por sección (por ejemplo, `P-HIST-02` y `P-02` canónico), y actualizar referencias cruzadas. No cambiar el contenido de decisiones ratificadas.

### C6. Taxonomía A–E duplicada — DEFECTO DOCUMENTAL CONFIRMADO

El registro de decisiones §4 y la línea de meta §3 usan las mismas letras para contenidos diferentes. En el registro, A–E corresponden a aceptación reproducible, continuidad/admisión/persistencia, reconstrucción terminal, journal/recuperación/UNKNOWN y raíz legítima/frontera de efectos. En la línea de meta, A–E corresponden a alcance/contratos, no-bypass/autoridad, bootstrap/recuperación, recursos/integridad/regresión y evidencia/reproducibilidad. La referencia de la matriz a “consistencia con M0 A–E” es ambigua si no nombra el esquema.

Acción documental: declarar la línea de meta como taxonomía normativa A–E para aceptación M0 y renombrar las categorías del registro como grupos de evidencia (G1–G5 u otra nomenclatura no colisionante), preservando su contenido y referencias. No alterar los criterios aceptados sin decisión explícita del propietario.

### C7. Manifiesto y commits base — HIGIENE DOCUMENTAL

El manifiesto contiene una base documental y hashes de snapshots anteriores; su texto incluye “Next step” que puede ser obsoleto después de los documentos posteriores. Los hashes no son automáticamente contradictorios si cada uno identifica su propio artefacto/snapshot, pero deben etiquetarse por función y fecha para que no parezcan múltiples bases canónicas.

Acción documental: actualizar “Next step” y separar claramente source snapshot, baseline documental y último commit del artefacto. No sustituir hashes históricos válidos; añadir una nota de alcance cuando un hash solo sea antecedente.

## 4. Lista de UNKNOWN/BLOCKED que permanece

- Consumidores externos/downstream y código no-JS.
- Alcanzabilidad externa de APIs inferiores de reparación; wrapper bloqueado no prueba inalcanzabilidad.
- Alias, filesystem y TOCTOU fuera del modelo cooperativo (P-07).
- Bootstrap concreto y quiescencia (P-01).
- Sección crítica, primitiva de lock, release incierto, cuarentena, stale y readmisión (D2).
- Contrato final de argumentos/raíz relativa y destino de `--initialize-*` (requiere resolución explícita de propuestas relacionadas).
- Raíz legítima, autoridad constitucional y permiso de efectos.
- Toda arista de producción no enumerada o no resoluble en el snapshot exacto.

Cada UNKNOWN/BLOCKED debe señalar qué afirmación de cierre bloquea; no debe transformarse en PASS por ausencia de coincidencias en grep.

## 5. Orden de trabajo recomendado

1. Resolver primero los defectos documentales C5–C7 sin cambiar contratos de runtime.
2. Añadir la definición normativa del invariante de admisión y separar D1 semántico de D2 mecánico.
3. Añadir una gramática de raíz única v0, explícitamente PROPUESTA, con las decisiones del propietario aún abiertas.
4. Añadir la tabla de estado propietario y condición de salida de la excepción Lúmina.
5. Registrar el grep de aristas como evidencia textual limitada, no como auditoría semántica.
6. Actualizar la lista de UNKNOWN/BLOCKED por afirmación de cierre.
7. Revalidar el orden canónico `STATUS.md → MASTER/CORE → BUILD → trabajo actual` antes de declarar D1 cerrado.

No repetir el censo de 188 archivos, no pedir otra revisión general a Gemini, no escoger A/B/C por recomendación, no escribir tests, no modificar `--root` ni tocar runtime/workflows sin autorización separada explícita. La documentación puede especificar propuestas, pero no ratificarlas por el propietario.

## 6. Criterios de aceptación M0 y evidencia

La línea de meta aceptada exige evidencia reproducible enlazada al SHA exacto; incluye prueba arquitectónica/no-bypass autorizada, rechazos sin lectura previa, rutas query/preview, hijo directo y vía padre, concurrencia padre/hijo, CI del SHA exacto y la ruta de raíz legítima a la frontera de efectos. La revisión de Claude no ejecutó tests ni CI, y no puede satisfacer esos criterios. D1-DESIGN puede cerrarse documentalmente solo cuando los contratos y las incógnitas pertinentes queden explícitos; M0 no se declara completo por ese cierre.

## 7. Resultado

Claude no aporta contradicción de fondo con O-01…O-11. Añade precisión útil y confirma tres bloqueos de higiene/consistencia documental que deben resolverse antes de pedir cierre D1. Los hallazgos sobre aristas dinámicas son parciales y no justifican declarar el grafo completo.

Estado final de esta nota: documentación de reconciliación únicamente; D1-DESIGN sigue OPEN, M0 INCOMPLETO, implementación NO AUTORIZADA, raíz legítima PENDING/UNKNOWN y efectos protegidos STOP.
