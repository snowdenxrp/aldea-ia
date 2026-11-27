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
