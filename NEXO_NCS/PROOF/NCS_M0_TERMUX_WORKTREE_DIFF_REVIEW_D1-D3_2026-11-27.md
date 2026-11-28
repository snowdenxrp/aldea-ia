# NCS M0 — Revisión documental de diffs locales D1–D3
Fecha: 2026-11-27
Repositorio: `snowdenxrp/aldea-ia`
Rama de preservación: `ncs-m0-termux-worktree-recovery-2026-11-27`
Base verificada antes de esta anotación: `7909b6e39fb2654a5eaee76509d478cc02d440bf`

## 1. Propósito y límites
Preservar la revisión realizada en conversación de tres diffs locales mostrados por el propietario desde Termux. La revisión fue documental y se basó exclusivamente en las salidas pegadas. No se accedió al árbol local directamente. No se modificaron archivos locales, no se ejecutaron pruebas, launcher, CI ni código del simulador. No se añadieron al índice ni se restauraron los cambios locales.

Esta nota no incorpora los diffs al código del repositorio. Registra observaciones e interpretaciones provisionales. Los archivos modificados continúan siendo locales según el inventario previo; esta nota no los respalda byte por byte.

## 2. Contexto del inventario preservado
El inventario previo está en:
`NEXO_NCS/PROOF/NCS_M0_TERMUX_LOCAL_WORKTREE_RECOVERY_INVENTORY_2026-11-27.md`
Ese inventario registró ocho archivos tracked modificados, 297 inserciones y 29 eliminaciones, 17 respaldos `.bak*`, un log y dos nombres anómalos. Incluyó SHA-256 locales capturados en ese momento. No certificó procedencia ni relación con NCS.

## 3. D1 — `src/exploration.js`
Salida recibida:
- En la rama `if (existing)` se añadió la llamada `rememberAreaVisit(simulation, agent, existing)`.
- Antes del retorno del área recién creada se añadió `rememberAreaVisit(simulation, agent, area)`.

Aclaración de integridad: una segunda salida de `git diff ... | sed -n '1,100l'` mostró que la llamada para `existing` aparece en la misma línea física que `if (existing) {`; el ajuste visual de la terminal puede hacer que parezca partida. La llamada para `area` aparece como línea independiente antes del retorno.

Interpretación provisional: el cambio intenta registrar visitas tanto a áreas previamente descubiertas como a áreas recién descubiertas. Clasificación aparente: lógica de exploración del simulador. No hay evidencia aportada que lo vincule con NCS o Lúmina.

Pendiente: inspeccionar la definición de `rememberAreaVisit`, sus efectos, validaciones y consumidores antes de juzgar corrección o comportamiento. No se ejecutará código para ello en esta fase; se podrá inspeccionar el texto fuente de forma read-only si se autoriza dentro del alcance.

## 4. D2 — `src/main-stable.js`
La salida mostró dos cambios en `createMesh(a)`:
- Se crea un mesh adicional `torsoCore` usando `THREE.CylinderGeometry(.42,.34,.72,12)`, material `clothMat`, posición Y 1.18 y escala `.82,1,.72`.
- Se agrega `torsoCore` al grupo mediante `g.add(torsoCore)`.
- También aparece una llamada `g.add(torso,collar,neck,pelvis,shoulderL,shoulderR)` antes de la llamada existente que agrega la colección completa de partes.

Interpretación provisional: cambio de geometría/ensamblaje visual del humanoide 3D del simulador. La doble incorporación aparente de objetos a `g` requiere revisar la semántica concreta de Three.js y el contexto; no se concluye que sea un defecto. No hay evidencia aportada que lo vincule con NCS o Lúmina.

## 5. D3 — `src/movement.js`
La salida mostró dos cambios:
1. En `setMovementTarget`, el destino se construye como `nextTarget`, se compara con `agent.movement.target` mediante tolerancia absoluta menor que `0.01` en X y Z, y solo se reasigna cuando no es el mismo objetivo. Después se establece `agent.movement.moving = true`.
2. Se añade `advanceSimulationMovement(agent, deltaHours)`: inicializa `agent.movement` con `createMovementState()` si falta; devuelve `false` si el agente no está vivo o no tiene objetivo; calcula `secondsEquivalent = Math.max(0, Number(deltaHours) || 0) * agent.movement.speed / 1.8`; y retorna `moveAgent(agent, secondsEquivalent)`.

Interpretación provisional: lógica funcional del motor de movimiento del simulador, no un mero ajuste visual. Riesgos/preguntas pendientes:
- No se ha inspeccionado cómo `moveAgent` interpreta su segundo argumento.
- No se ha comprobado dónde se invoca `advanceSimulationMovement`.
- No se ha comprobado si `agent.movement.speed` siempre existe y está validado.
- Debe evaluarse si conservar un objetivo previo dentro de la tolerancia puede dejar un destino ligeramente distinto al solicitado.

No hay evidencia aportada que vincule este diff con NCS o Lúmina.

## 6. Estado de revisión por archivo
- D1 `src/exploration.js`: diff recibido; revisión preliminar y comprobación visual de formato recibidas.
- D2 `src/main-stable.js`: diff recibido; revisión preliminar.
- D3 `src/movement.js`: diff recibido; revisión preliminar.
- D4 `src/simulation.js`: pendiente de recibir; el usuario todavía no ha ejecutado/entregado ese bloque en el punto de esta anotación.
- D5 `tests/settlement-state-audit.test.mjs`: pendiente.
- D6 `tests/village-visual-audit.test.mjs`: pendiente.
- D7 `tests/visual-detail-audit.test.mjs`: pendiente.
- D8 `tests/visual-role-accessories-audit.test.mjs`: pendiente.

## 7. Reglas para continuar
- Continuar un archivo por vez con `git diff --no-ext-diff --no-color -- <ruta>`.
- Esperar y revisar la salida completa antes de solicitar el siguiente archivo.
- Si la salida está incompleta o truncada, pedir solo la parte faltante; no inferir contenido.
- Solo lectura: no ejecutar launcher, pruebas ni código; no modificar, borrar, renombrar, restaurar, stagear ni incorporar los cambios locales.
- No mezclar material de Lúmina con evidencia NCS. No declarar relación con NCS sin evidencia concreta.
- Preservar cada lote de hallazgos en GitHub y verificar commit, rama y contenido remoto antes de afirmar que está guardado.

## 8. Estado NCS M0
Esta revisión documental no cambia el estado global NCS M0. No cierra gates, no constituye PASS, no modifica `authorization: NOT_EVALUATED`, ni altera UNKNOWN/STOP. La misión prioritaria sigue siendo el cierre de M0 con evidencia verificable.


## 9. Transcripción compacta de las líneas de cambio visibles
Esta transcripción conserva las líneas de cambio relevantes mostradas en la conversación. No sustituye una captura raw de los archivos locales ni certifica que sigan idénticos.

### D1 — `src/exploration.js`
```diff
-  if (existing) {
+  if (existing) { rememberAreaVisit(simulation, agent, existing);
+  rememberAreaVisit(simulation, agent, area);
```
La llamada para `existing` aparece en la misma línea física que la condición, según la salida de `sed -n l`.

### D2 — `src/main-stable.js`
```diff
-  const torso=new THREE.Mesh(new THREE.BoxGeometry(.62,.68,.38),clothMat); torso.position.y=1.18;
+  const torso=new THREE.Mesh(new THREE.BoxGeometry(.62,.68,.38),clothMat); torso.position.y=1.18; const torsoCore=new THREE.Mesh(new THREE.CylinderGeometry(.42,.34,.72,12),clothMat); torsoCore.position.y=1.18; torsoCore.scale.set(.82,1,.72);
-  g.add(torso,chest,waist,collar,neck,pelvis,shoulderL,shoulderR,head,earL,earR,hair,nose,eyeWL,eyeWR,eyeL,eyeR,mouth,armL,armR,handL,handR,cuffL,cuffR,legL,legR,kneeL,kneeR,footL,footR,marker); g.userData.parts={armL,armR,legL,legR,head};addVisualDetail(g,a);
+  g.add(torso,collar,neck,pelvis,shoulderL,shoulderR); g.add(torsoCore); g.add(torso,chest,waist,collar,neck,pelvis,shoulderL,shoulderR,head,earL,earR,hair,nose,eyeWL,eyeWR,eyeL,eyeR,mouth,armL,armR,handL,handR,cuffL,cuffR,legL,legR,kneeL,kneeR,footL,footR,marker); g.userData.parts={armL,armR,legL,legR,head};addVisualDetail(g,a);
```

### D3 — `src/movement.js`
```diff
-  agent.movement.target = {
+  const nextTarget = {
+  const currentTarget = agent.movement.target;
+  const sameTarget =
+    currentTarget &&
+    Math.abs(currentTarget.x - nextTarget.x) < 0.01 &&
+    Math.abs(currentTarget.z - nextTarget.z) < 0.01;
+  if (!sameTarget) {
+    agent.movement.target = nextTarget;
+  }
+export function advanceSimulationMovement(agent, deltaHours) {
+  agent.movement ??= createMovementState();
+  if (!agent.alive || !agent.movement.target) return false;
+  // La velocidad de locomoción de la simulación se expresa en unidades por hora.
+  const simulationSpeed = agent.movement.speed;
+  const secondsEquivalent = Math.max(0, Number(deltaHours) || 0) * simulationSpeed / 1.8;
+  return moveAgent(agent, secondsEquivalent);
+}
```
La salida original de D3 también mostró las líneas de contexto que calculan y asignan las coordenadas X/Z de `nextTarget`; este extracto conserva las adiciones principales, no el hunk completo.


## D4 — `src/simulation.js` (salida recibida 2026-11-27)

**Estado:** recibido; revisión preliminar documental. No se ejecutó código ni pruebas.

### Cambios visibles
- Imports: incorpora `setMovementTarget`, `moveAgent`, `advanceSimulationMovement` y `advanceProductionDay`.
- Rutina de exploración: calcula `pendingDiscovery`, pero en el fragmento recibido no se utiliza después; el comentario dice que la exploración no debe bloquearse por descubrimientos pendientes.
- Exploración: invierte el orden de `candidates.sort` de descendente a ascendente.
- Hambre crítica: exporta `buildCriticalHungerIntent`; cambia filtros y decisiones sobre plantas/pesca.
- Decisión: cambia el manejo de movimiento y descanso; añade transferencia de conocimiento espacial entre agentes.
- Ciclo diario: llama `advanceProductionDay`.
- Tick: añade priorización de supervivencia hambre/sed, ratios de riesgo, compromisos de objetivo, descanso y movimiento por simulación.

### Observaciones y riesgos que requieren comprobación
1. En la línea modificada de `performDecision`, la salida pegada contiene el fragmento `Math.max(Number(agent.decisionCooldownHours ?? 0), ), FAILED_DECISION_COOLDOWN_HOURS)`. Tal como está transcrito parece sintácticamente inválido; debe verificarse el contenido local exacto antes de clasificarlo como defecto real.
2. `moveAgent` aparece en el import añadido, pero no se observa uso en el diff recibido; confirmar con búsqueda estática cuando corresponda.
3. `pendingDiscovery` se calcula, pero aparentemente no afecta a ninguna rama; posible variable sin uso o lógica incompleta.
4. `foodAvailable` se calcula usando exclusivamente `simulation.world.resources.wild_plants.amount`, aunque `criticalFood` puede representar pescado u otras rutas; revisar coherencia de recursos.
5. Los nuevos ratios de supervivencia y umbrales de hambre/sed no están validados; no inferir comportamiento correcto sin análisis estático completo.
6. El cambio de orden de candidatos puede invertir la selección hacia el score mínimo en lugar del máximo; confirmar intención.
7. El bloque pegado es extenso y contiene líneas preexistentes de una sola línea; el registro preserva los hallazgos visibles, no certifica que el diff íntegro se haya recuperado byte por byte.

### Clasificación provisional
Cambios del simulador/proyecto Lúmina, no evidencia directa de NCS M0. Mantenerlos aislados; no aplicar, restaurar, descartar, ejecutar ni mezclar con NCS. D4 recibido; D5–D8 siguen pendientes.

## D4 — segunda revisión estática y estado del worktree (salida Termux recibida 2026-11-27)

**Alcance:** lectura de src/simulation.js líneas 215–240 y 280–355, búsqueda de referencias a startDecisionCooldown, git status --short, rama y HEAD. No se ejecutaron pruebas, launcher ni simulador. No se modificó el worktree local.

### Corrección de la observación de transcripción
La expresión local reportada en la línea 235 es:

```js
Math.max(Number(agent.decisionCooldownHours ?? 0), FAILED_DECISION_COOLDOWN_HOURS)
```

La coma vacía de la transcripción previa no existe en la salida local. Se descarta el posible defecto sintáctico sugerido por aquella transcripción.

### Hallazgo lógico confirmado en la estructura mostrada
En performDecision, después de executeAction, la rama de éxito (if (result.success)) realiza mejoras de habilidad, registros y aprendizaje, pero no invoca startDecisionCooldown(agent). La rama else procesa el fallo y, dentro de ella, aparece if (result.success) startDecisionCooldown(agent); dado que esa rama se alcanza cuando result.success es falso, la condición es inalcanzable. En consecuencia, el cooldown normal de DECISION_COOLDOWN_HOURS = 0.25 no se establece en la ruta genérica de éxito mostrada. La rama de fallo sí asigna FAILED_DECISION_COOLDOWN_HOURS = 0.05.

**Clasificación:** defecto lógico confirmado en el fragmento local mostrado; impacto probable: las acciones genéricas exitosas no reinician el cooldown normal previsto. No se afirma todavía el impacto global del simulador porque falta revisar el ciclo llamador y otros mecanismos que pudieran compensarlo. No se ha probado en ejecución.

### Contexto de supervivencia recibido
La salida de líneas 299–344 calcula disponibilidad de alimento usando foodTarget y simulation.world.resources.wild_plants.amount > 0, disponibilidad de agua desde waterTarget, umbrales de hambre/sed, compromisos actuales, tiempos estimados hasta cero y ratios de riesgo. Las funciones locales foodCriticalSafe y thirstCriticalSafe devuelven Infinity si el tiempo de viaje no es finito y, en otro caso, dividen el tiempo de viaje entre el tiempo restante protegido por un mínimo de 0.25. La salida termina antes de mostrar todas las ramas posteriores de selección de survivalIntent; la revisión de supervivencia queda incompleta y no se declara correcta.

### Estado local del repositorio reportado
- Rama: main.
- HEAD: 1834182a2eaf4b1bfe59f9802ce3e49fc89b2ca7.
- Ocho archivos tracked modificados: src/exploration.js, src/main-stable.js, src/movement.js, src/simulation.js y cuatro archivos tests/*audit.test.mjs.
- Archivos untracked reportados: múltiples respaldos .bak*, lumina-test.log y dos nombres anómalos que contienen texto de comandos.
- No se limpiaron, restauraron, descartaron, stagearon ni sobrescribieron esos elementos.

### Próxima comprobación read-only
Solicitar el resto del bloque de selección de supervivencia y el contexto del ciclo llamador/selección de decisiones, sin ejecutar pruebas ni simulador. Mantener D5–D8 detenidos hasta cerrar la revisión del archivo D4.

### Límite NCS
Este hallazgo corresponde a src/simulation.js del worktree local del simulador; no constituye evidencia de cierre ni cambio de estado de NCS M0. No altera gates, autorización, UNKNOWN/STOP ni el alcance ratificado.