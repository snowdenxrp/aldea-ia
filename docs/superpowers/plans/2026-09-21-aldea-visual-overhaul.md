# Aldea Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir Lúmina en una aldea reconocible y coherente tanto de cerca como a media y larga distancia, con terreno, río, puente, arquitectura, materiales, vegetación e iluminación integrados.

**Architecture:** Separar la construcción visual en capas reutilizables: terreno/agua, infraestructura de aldea, arquitectura y detalles/ambientación. Mantener la simulación y los habitantes desacoplados de la presentación para que los cambios visuales no vuelvan a romper el arranque.

**Tech Stack:** JavaScript ES modules, Three.js local, HTML/CSS, GitHub Pages.

**Spec:** Diseño aprobado en conversación del 2026-09-21: la aldea debe verse como una aldea real a cualquier distancia; de cerca debe tener textura, geometría, materiales y detalles; el puente debe cruzar completamente el río y conectar caminos y orillas.

## Global Constraints

- Three.js debe cargarse localmente y no depender de CDN para arrancar.
- No modificar la lógica de decisión, necesidades o autonomía de Alex y Bruno salvo interfaces visuales estrictamente necesarias.
- El escenario debe seguir siendo jugable dentro de los bounds actuales del mundo.
- El puente debe cruzar completamente el cauce y conectar ambas orillas.
- Los elementos visuales deben tener lectura cercana, media y lejana.
- Cada cambio visual debe poder validarse sin depender de una red externa durante el arranque.

## Review Focus

- El puente termina en el río o no conecta ambas orillas: prueba visual/geométrica de extremos y caminos.
- La cámara cercana muestra geometría demasiado simple: prueba de detalle en casas, suelo, vegetación y puente.
- La cámara media pierde la identidad de aldea: prueba de composición de plaza, caminos, edificios y zonas funcionales.
- La cámara lejana reduce todo a árboles aislados: prueba de silueta y distribución de estructuras.
- Un cambio visual rompe el arranque: prueba de importación y ejecución completa de la escena.

---

### Task 1: Baseline y pruebas de geometría del escenario

**Files:**
- Create: `tests/visual/scene-geometry.test.js`
- Modify: `src/world.js`
- Inspect: `src/village.js`, `src/spatial.js`, `src/main-stable.js`

**Interfaces:**
- Consumes: `world.bounds`, `world.resources`, `world.structures`.
- Produces: invariantes de layout reutilizables para río, puente y zonas de aldea.

- [ ] **Step 1: Escribir pruebas de invariantes** para comprobar que el cauce tenga límites definidos, que el puente tenga dos extremos fuera del cauce y que los caminos puedan conectar ambos lados.
- [ ] **Step 2: Ejecutar las pruebas** y confirmar que fallen sobre el layout actual del puente.
- [ ] **Step 3: Añadir constantes de layout** sin tocar la simulación: centro del río, ancho del cauce, ancho del puente, extremos y nodos de camino.
- [ ] **Step 4: Ejecutar de nuevo** y confirmar que las invariantes pasan.
- [ ] **Step 5: Commit** `test: pin visual scene geometry invariants`.

### Task 2: Terreno, río y puente completos

**Files:**
- Modify: `src/village.js`
- Modify: `src/world.js`
- Modify: `tests/visual/scene-geometry.test.js`

**Interfaces:**
- Consumes: layout definido en Task 1.
- Produces: `buildTerrain`, `buildRiver`, `buildBridge`, y conexiones de camino visualmente coherentes.

- [ ] **Step 1: Escribir prueba** que rechace un puente cuyo tablero no cubra la distancia entre orillas.
- [ ] **Step 2: Ejecutar y observar RED**.
- [ ] **Step 3: Rehacer el cauce y puente** con tablero completo, soportes, barandales, rampas y dos zonas de acceso.
- [ ] **Step 4: Añadir orillas trabajadas** con transición agua/tierra/vegetación y pequeñas variaciones de terreno.
- [ ] **Step 5: Ejecutar pruebas y validación de escena**.
- [ ] **Step 6: Commit** `feat: complete river crossing and terrain integration`.

### Task 3: Arquitectura y composición de aldea

**Files:**
- Modify: `src/village.js`
- Create: `src/village-layout.js`
- Modify: `src/main-stable.js`
- Modify: `tests/visual/scene-geometry.test.js`

**Interfaces:**
- `getVillageLayout()` returns deterministic positions for plaza, homes, farms, storage, market, well, workshop and paths.
- `buildVillage(scene, world)` consumes that layout without changing agent behavior.

- [ ] **Step 1: Escribir pruebas** para cantidad mínima de edificios, plaza central y conexiones de caminos.
- [ ] **Step 2: Ejecutar RED**.
- [ ] **Step 3: Implementar `village-layout.js`** con posiciones deterministas y separación suficiente entre edificios.
- [ ] **Step 4: Construir plaza, viviendas, granero, mercado, pozo y talleres** usando el layout.
- [ ] **Step 5: Conectar caminos con plaza, puente, viviendas y zonas de trabajo**.
- [ ] **Step 6: Ejecutar pruebas y validar que Alex/Bruno sigan siendo creados por su flujo existente**.
- [ ] **Step 7: Commit** `feat: establish recognizable village layout`.

### Task 4: Materiales y detalle cercano

**Files:**
- Create: `src/village-materials.js`
- Modify: `src/village.js`
- Create: `tests/visual/materials.test.js`

**Interfaces:**
- `createVillageMaterials()` returns reusable Three.js materials for terrain, soil, wood, stone, roof, water and vegetation.
- `applyBuildingDetail(mesh, spec)` adds deterministic architectural detail.

- [ ] **Step 1: Escribir pruebas** para comprobar que cada familia de material existe y que los edificios no dependan de un único material plano.
- [ ] **Step 2: Ejecutar RED**.
- [ ] **Step 3: Implementar materiales locales reutilizables**.
- [ ] **Step 4: Añadir puertas, ventanas, vigas, tejados, cercas, cajas, postes y detalles de cultivo**.
- [ ] **Step 5: Ejecutar pruebas y revisar cámara cercana**.
- [ ] **Step 6: Commit** `feat: add close-range village materials and detail`.

### Task 5: Vegetación, iluminación y ambientación

**Files:**
- Create: `src/village-ambience.js`
- Modify: `src/village.js`
- Modify: `src/main-stable.js`
- Create: `tests/visual/ambience.test.js`

**Interfaces:**
- `buildVegetation(scene, layout, seed)` creates deterministic multi-scale vegetation.
- `configureVillageLighting(scene, worldTime)` controls ambient, sun and local lights.

- [ ] **Step 1: Escribir pruebas** para distribución de vegetación y existencia de iluminación ambiental/local.
- [ ] **Step 2: Ejecutar RED**.
- [ ] **Step 3: Implementar vegetación en varios tamaños** con agrupaciones naturales, cultivos y árboles de referencia.
- [ ] **Step 4: Implementar iluminación ambiental, luz solar y luces de aldea** sin modificar el reloj de simulación.
- [ ] **Step 5: Ejecutar pruebas y revisar cámara cercana/media/lejana**.
- [ ] **Step 6: Commit** `feat: add village ambience and lighting`.

### Task 6: Lectura multiescala y rendimiento

**Files:**
- Modify: `src/village.js`
- Create: `src/village-lod.js`
- Create: `tests/visual/lod.test.js`

**Interfaces:**
- `getVillageDetailLevel(cameraDistance)` returns `close`, `medium`, or `far`.
- `applyVillageDetailLevel(root, level)` toggles only presentation details; simulation entities remain active.

- [ ] **Step 1: Escribir pruebas** para los tres niveles y para la persistencia de los habitantes.
- [ ] **Step 2: Ejecutar RED**.
- [ ] **Step 3: Implementar LOD visual determinista**.
- [ ] **Step 4: Mantener edificios principales visibles en los tres niveles y reservar detalles pequeños para cerca/media distancia**.
- [ ] **Step 5: Ejecutar pruebas**.
- [ ] **Step 6: Commit** `feat: add multiscale village presentation`.

### Task 7: Integración, arranque y prueba final

**Files:**
- Modify: `index.html`
- Modify: `src/main-stable.js`
- Modify: `style.css`
- Modify: relevant test files

- [ ] **Step 1: Añadir prueba de integración** que importe las dependencias locales y construya la escena sin CDN.
- [ ] **Step 2: Ejecutar RED** si la integración aún no cubre el nuevo layout.
- [ ] **Step 3: Integrar todas las capas visuales** sin eliminar el diagnóstico de arranque hasta verificar estabilidad.
- [ ] **Step 4: Ejecutar toda la suite** y corregir cualquier regresión.
- [ ] **Step 5: Validar manualmente**: cámara cercana, media y lejana; puente completo; Alex y Bruno; reloj/día; movimiento; panel de habitantes.
- [ ] **Step 6: Actualizar versión de caché** solo después de que la integración esté estable.
- [ ] **Step 7: Commit** `feat: complete Lumina village visual overhaul`.

## Execution Method

Native execution in the current session: implement each task sequentially, verify after each task, and do not advance past a failed validation. Keep the startup diagnosis until final integration is green.
