# NCS — Censo estático de referencias Nexo en código de aplicación

**Fecha:** 2026-10-23  
**Repositorio:** `snowdenxrp/aldea-ia`  
**Rama:** `ncs-clean-architecture`  
**Commit de snapshot:** `f105a3a6b88c372d22aed49d29ea56d2d17ade78`  
**Árbol completo:** sí (`truncated=false`); 3.019 entradas.  
**Universo censado:** 13 scripts JS/MJS/CJS + 34 módulos de `src/nexo/` + 45 módulos JS/MJS/CJS de `src/` fuera de `src/nexo/` = **92 rutas**. El repositorio tiene 188 archivos JS/MJS/CJS totales; los restantes pertenecen principalmente a tests, tooling y fixtures y no se declaran auditados como grafo completo por este documento.

## Propósito y límite

Este artefacto fija el inventario físico del censo para que la continuidad no dependa del resumen de una conversación. Los SHA de blob y tamaños proceden del árbol Git consultado; permiten distinguir una revisión futura de esta fotografía.

Es un **censo estático de código de aplicación/runtime**, no una prueba de ausencia absoluta de bypass ni una prueba de seguridad. La clasificación resume el papel observado durante la revisión. La extensión posterior de este documento registra la inspección de imports estáticos conocidos en los 188 archivos JS/MJS/CJS; no se ha ejecutado una prueba arquitectónica que cierre el grafo transitivo frente a todos los mecanismos dinámicos. JavaScript permite importar módulos internos, así que la lista tampoco constituye aislamiento contra código local hostil.

## Resultado ejecutivo

- Entry points Nexo conocidos: `scripts/nexo.mjs`, `scripts/nexo-chronicle-session.mjs` (invocable directamente), `scripts/assistants.mjs`, `scripts/simulate.mjs` y el reexport legacy `scripts/nexo-continuity.mjs`.
- API de aplicación path-based: `src/nexo/application/chronicle-append.mjs`, `continuity-queries.mjs`, `mission-request-preview.mjs` y sus reexports.
- Primitivas filesystem: `continuity-service.mjs`, `continuity-store.mjs`, `chronicle-store.mjs`; aceptan rutas y no equivalen a una API de instancia.
- `assistants` y `simulate` pueden abrir Continuity mediante owner y proporcionar `legacyMemory`, lo que puede activar inicialización/migración incidental. El estado del mundo y la memoria Lúmina permanecen fuera de la raíz Nexo.
- `loadCurrent()` de ambos stores lee sin tomar su lock de mutación. La admisión de raíz debe envolver la operación desde antes de la primera lectura persistida.
- La sesión Chronicle hija debe ser segura cuando se invoca directamente; no puede depender del lock del padre.
- El root lock no confiere legitimidad del dueño, autorización constitucional ni permiso para reparar/ejecutar efectos protegidos.
- Estado arquitectónico: **D1 OPEN, D2 OPEN, D3 OPEN**. Sin cambios de runtime/tests/workflows ni ejecución de pruebas en esta auditoría.

## A. Scripts de aplicación y herramientas — 13

| Ruta | Blob SHA | Bytes | Clasificación observada |
|---|---|---:|---|
| `scripts/assistants.mjs` | `d31c6dba86159ee0403f0cc1c236b89863e4d5cb` | 6879 | Comando compuesto; Continuity + world state + memoria Lúmina |
| `scripts/longevity-audit-v2.mjs` | `bf35225456dfc58bb929338e29b157bd1e2423b5` | 8066 | Script de auditoría/herramienta; clasificado por inspección de caller |
| `scripts/nexo-chronicle-session.mjs` | `30a53de2f108aa255a1dfd61ce78c19788de160b` | 3736 | Sesión Chronicle hija; también invocable directamente |
| `scripts/nexo-continuity.mjs` | `f08969f2d77a2e90f74d01c96242e29de89e3f22` | 159 | Reexport legacy de Continuity |
| `scripts/nexo-repair-dispatch.mjs` | `ed45438be7604d3b341cecd5fbcfc69adda2447e` | 5311 | Helper/flujo de repair; gate productivo excluido |
| `scripts/nexo-repair-entrypoint.mjs` | `74d0fa92c447034e7454b7b846d584819ac81ffd` | 10178 | Helper/flujo de repair; gate productivo excluido |
| `scripts/nexo-repair-mission-verification.mjs` | `6f9c58cac203faa65e23c1a076af4746f5c22324` | 7029 | Helper/flujo de repair; gate productivo excluido |
| `scripts/nexo-repair-preparation.mjs` | `3e978dc11c6f4d7f9e5f61c722629be34f6404a0` | 2246 | Helper/flujo de repair; gate productivo excluido |
| `scripts/nexo-repair-session.mjs` | `1ce95a621ed5bb9f473c9d0f15b5ee3f2f1459a5` | 2911 | Helper/flujo de repair; gate productivo excluido |
| `scripts/nexo-repair-settlement.mjs` | `2f6e91d494b4edb012c2b2db5a077b875c5b0348` | 6865 | Helper/flujo de repair; gate productivo excluido |
| `scripts/nexo-runtime-session.mjs` | `f67b6fbe1b6f0098ebf23b35055cc668f96df991` | 534 | Helper/flujo de repair; gate productivo excluido |
| `scripts/nexo.mjs` | `e471eb478a09aa8a9a8323795583e198cdf0a127` | 10634 | CLI principal de Nexo |
| `scripts/simulate.mjs` | `623d316c7a1efd10cc2f06a3080c0d9f06087596` | 11128 | Simulación; abre Continuity y estado del mundo |

## B. Módulos internos de Nexo — 34

| Ruta | Blob SHA | Bytes | Categoría observada |
|---|---|---:|---|
| `src/nexo/adapters/chronicle-effect.mjs` | `6daf742eb0048724557151a728bf807613a854e9` | 4886 | Adaptador de observación/commit/efecto; no concede autoridad |
| `src/nexo/adapters/chronicle-observation.mjs` | `82c7531fcb143f38a5f121ffcc5b5ab44a9d419f` | 4721 | Adaptador de observación/commit/efecto; no concede autoridad |
| `src/nexo/adapters/conditional-commit-persist-state.mjs` | `d6dc517f9c7841a957749804d612fbfe6e66c9a6` | 2841 | Adaptador de observación/commit/efecto; no concede autoridad |
| `src/nexo/adapters/persisted-repair-observation.mjs` | `af4c86182896b6d43c8dd8ede4e0d9423bc607c1` | 7832 | Adaptador de observación/commit/efecto; no concede autoridad |
| `src/nexo/application/chronicle-append.mjs` | `5a20044bcddbaee79d0117934eefaea5f3b2c3bc` | 17459 | API/casos de uso; revisar rutas path-based y frontera pública |
| `src/nexo/application/continuity-queries.mjs` | `e1915e94e53e71d37a37952fead37ba62bdae79a` | 15442 | API/casos de uso; revisar rutas path-based y frontera pública |
| `src/nexo/application/index.mjs` | `fd2f219f5f3731cb0badfe0b4ab2f26afdea14c3` | 501 | API/casos de uso; revisar rutas path-based y frontera pública |
| `src/nexo/application/mission-request-preview.mjs` | `4e317b646d0c7b7403acfb63732dec8c3fe7778b` | 1965 | API/casos de uso; revisar rutas path-based y frontera pública |
| `src/nexo/core/chronicle-settlement-contract.mjs` | `4d04930cbf67b5943916cc497dd44b14c87e27bd` | 2451 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/chronicle-store.mjs` | `59d2fdebbcd6ddfb3bbe9524d8da7f52397b4e3a` | 17040 | Store/servicio/límites filesystem; primitivas internas, no frontera de instancia |
| `src/nexo/core/continuity-contract.mjs` | `6ea25fa828ca7ceb9c82984e2a7e768888b2cd8a` | 5841 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/continuity-data-guard.mjs` | `1aaca792c710be1f66021c1384510eb621d09401` | 2276 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/continuity-operations.mjs` | `cc295e3bf9fe1c0c4ae7e0de172d0d22e8d9b3c5` | 27337 | Owner/runtime/operaciones sobre owner o snapshot |
| `src/nexo/core/continuity-owner.mjs` | `6d1fa37745ca57e5ab5093b9cdcabf1ff5495261` | 44690 | Owner/runtime/operaciones sobre owner o snapshot |
| `src/nexo/core/continuity-service.mjs` | `8a6b97fcbdaa90fa51e7c9f7e498bae265aa918c` | 4394 | Store/servicio/límites filesystem; primitivas internas, no frontera de instancia |
| `src/nexo/core/continuity-snapshot.mjs` | `56cbd1753f1fa3fb67c3592e5a5664b58d96c4c3` | 2546 | Owner/runtime/operaciones sobre owner o snapshot |
| `src/nexo/core/continuity-store.mjs` | `9ffd28930abdbe29f5b041711cc29b74dc99fbae` | 19757 | Store/servicio/límites filesystem; primitivas internas, no frontera de instancia |
| `src/nexo/core/contracts.mjs` | `47a60aa0414e0282ade8e39b7544745678dfb135` | 12776 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/final-semantic-validator.mjs` | `37a966a4f8b489b4cde75a367d36269d084346fd` | 8795 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/lock-deadline.mjs` | `60f80eeb5f213fff539f5e4224a387898899d668` | 1240 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/mission-admission-contract.mjs` | `d4ddd88c6c59827e944f8811d00e52cea336f0c1` | 5804 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/observation-equivalence.mjs` | `ad608c08ca50345de58f7a36e8fcb3e63f82e24f` | 4568 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/observation.mjs` | `84757c4c816301ce8ad7a147159abc112a22ffa6` | 3151 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/outcome-classifier.mjs` | `0e0e4b4c13028a41a2fb282208f768152aa80f73` | 608 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/owner-backed-runtime.mjs` | `a7a014489209273ce78d0103afa785728d4c467c` | 25531 | Owner/runtime/operaciones sobre owner o snapshot |
| `src/nexo/core/ownership.mjs` | `3b66d07e67df09b058b37716716573f6c17a2099` | 2751 | Owner/runtime/operaciones sobre owner o snapshot |
| `src/nexo/core/policy-context-resolver.mjs` | `f66ad6c6fff63d294af645a83b9fa822e548a37f` | 3067 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/protected-transition.mjs` | `39a602b80cda8f3939b2ffed7e726d06c21b077f` | 9136 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/reconciliation.mjs` | `71301297ea0c85315feea7d572f50a51cc9f99d2` | 4394 | Contrato, validación, reconciliación o clasificación interna |
| `src/nexo/core/resource-limits.mjs` | `98355d5dc8298695233495d4bab2264b3eeba7b3` | 2912 | Store/servicio/límites filesystem; primitivas internas, no frontera de instancia |
| `src/nexo/effect-adapter.js` | `e91648cab31878c01fa1bd253d7732e9036a2370` | 23837 | Runtime/orquestación/adapter legado; revisar imports, no asumir ruta de store |
| `src/nexo/orchestrator.js` | `de257324cabfaae69219f71e598bb83c1aafc0a1` | 11048 | Runtime/orquestación/adapter legado; revisar imports, no asumir ruta de store |
| `src/nexo/runtime.js` | `9d3d5109753e8ba96fc287c269da275112645523` | 11516 | Runtime/orquestación/adapter legado; revisar imports, no asumir ruta de store |
| `src/nexo/simulation-adapter.js` | `318d97bd4626d6fea9289d505e071ab82ed45cc5` | 10441 | Runtime/orquestación/adapter legado; revisar imports, no asumir ruta de store |

## C. Código de `src/` fuera de `src/nexo/` — 45

| Ruta | Blob SHA | Bytes | Clasificación observada |
|---|---|---:|---|
| `src/actions.js` | `93745c691f0fdf6f976211c89a406ec1b11f8810` | 7015 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/agents.js` | `e9c559314d189ff04188662f30565a66f6e38a27` | 3011 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/assistants/analyst.js` | `965f9da24600051b11b27fb722b794f2c72dbbcd` | 3108 | Asistente/soporte de Lúmina |
| `src/assistants/debugger.js` | `28f159b36a8ba6dc9fbece9cc1b8c7a9d1a5f248` | 3894 | Asistente/soporte de Lúmina |
| `src/assistants/index.js` | `afa342403d8b46d19480ee8e7f381435ce695270` | 865 | Asistente/soporte de Lúmina |
| `src/assistants/memory.js` | `fce69ce466e9b033b1c9f654d16beac49a82852c` | 12526 | Memoria legacy en memoria; no abre stores directamente |
| `src/assistants/render.js` | `9b9731f84a96804743a07b1c79ce4901818e7ad9` | 945 | Asistente/soporte de Lúmina |
| `src/assistants/squad.js` | `6d9b9bdfbabf79c8924033c72046f056806d9918` | 5541 | Asistente/soporte de Lúmina |
| `src/assistants/tester.js` | `f991738be75600f18e1835999579e0077d99cf77` | 2106 | Asistente/soporte de Lúmina |
| `src/collective.js` | `261ca9ff76d33ed1a0a0cc15829d838cfaaad168` | 6927 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/decision.js` | `1b6961e27e263318c9a5aea0e099254472e7473b` | 5923 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/development.js` | `0a7f5446e1406957f5fbd4949c10863ede5ae660` | 2163 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/discovery.js` | `db8972b6fdca3dcf8c0463ff45d54f1ec281c8c9` | 1962 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/economy.js` | `c9d3b86e3deaae3c9efacc2dcb3381036ed35e93` | 4904 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/ecosystem.js` | `2cf9804caa0a95118f9fb2f384e8301cafc26577` | 2792 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/exploration.js` | `fdb67f4ce8cb36edf5bf96aa5171e23dd3bb5038` | 2841 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/governance.js` | `4e42e1d241e9fb2ef65ecb48ebfd9b5b7b8c434d` | 3594 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/institutions.js` | `b10ecf33a3945cf2427031dc1354534f203e170f` | 7741 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/main-stable.js` | `4c1c8305eb5be0e37609ac36c1cad76040fac698` | 44972 | Entrada/mundo/simulación visual; sin acceso directo a stores Nexo observado |
| `src/main.js` | `5167171f54730fe34881d9a3674353e0ebe13c76` | 30848 | Entrada/mundo/simulación visual; sin acceso directo a stores Nexo observado |
| `src/memory.js` | `e0b76a7241b7b3dc251257401ed7769c026fa738` | 3466 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/movement.js` | `970e678182949a9bf6b59c7674683ec10e291880` | 3460 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/needs.js` | `ccaaa8ebab6a85a4919446209a6a6f085f0edf60` | 1718 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/perception.js` | `d40d373eec4bf973c3883caf5d4c1f163f4a1332` | 1383 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/planning.js` | `057f5c69b61750f2155dcf441de99f231f30fa6e` | 5354 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/production.js` | `79f059cc013026afe9a5f882e9947fee5fd64712` | 3691 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/random.js` | `7981ae5b759ddc6e837eb1db3804bddabcdbcb55` | 1044 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/relationships.js` | `e20bd2de016e9440305e701083ebc1161cd59683` | 2702 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/research.js` | `b4198ebb7f9e9fdf89a2730066e4b5a6e4a2c6c8` | 7977 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/simulation.js` | `9d83b475ae914f4d376b380983be55ac4d20f57f` | 43639 | Entrada/mundo/simulación visual; sin acceso directo a stores Nexo observado |
| `src/society.js` | `acbaaf02a43ee252c5fcb5ca8cb6975a5d9b16a6` | 12024 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/spatial.js` | `5484f1cfde97d7f3898e72cdfbfa0fb1635206b5` | 5649 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/specialization.js` | `afe648176051a892df9cc218360744f5aea7c285` | 4970 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/technology.js` | `9c35dc6a2ef74535aac149a610ec2a7cd531ae4c` | 2960 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/terrain-material.js` | `96a01dcc8c566d5abc3e40fe7304826f27136c42` | 1576 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/territorial.js` | `aeeb69daf97673a401710f82b500611275e561ea` | 2159 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/three-remote.js` | `ca6ce3ae6fb17765df06007db86a7ed2827b96f3` | 790 | Módulo de pueblo/aldea/mundo/sistemas; sin acceso directo a stores Nexo observado |
| `src/three.core.js` | `7dcd0fbcbc04b8d9a20ecb96c1ce344cb55150d5` | 1403455 | Vendor Three.js; excluir falsos positivos léxicos |
| `src/three.module.js` | `477ca4dafa7af919a2b9818e01b5ae25198d4aa4` | 603113 | Vendor Three.js; excluir falsos positivos léxicos |
| `src/village-ambience.js` | `3c8869f8dd2b5b21ba1fb745630ca8f68589be2e` | 185 | Pueblo/aldea/visual; sin acceso directo a stores Nexo observado |
| `src/village-layout.js` | `e5f5a0fb4a75ee6541aa93aa31a829de32fad5ed` | 2772 | Pueblo/aldea/visual; sin acceso directo a stores Nexo observado |
| `src/village-lod.js` | `ff1732cd4af4f2e468d3a1b415ab1143b00ad102` | 569 | Pueblo/aldea/visual; sin acceso directo a stores Nexo observado |
| `src/village-materials.js` | `b2bca4f359ae60cb60bd98288e339d675f4689d7` | 413 | Pueblo/aldea/visual; sin acceso directo a stores Nexo observado |
| `src/village.js` | `6e2d8e51311a82308404b31a3290a2a7c34cb21c` | 9502 | Pueblo/aldea/visual; sin acceso directo a stores Nexo observado |
| `src/world.js` | `4586d87d7a0b2a87e733f1cfb87eddf7ba1a0383` | 5330 | Entrada/mundo/simulación visual; sin acceso directo a stores Nexo observado |

## Fronteras de acceso que quedan por resolver

1. **CLI principal:** introducir contrato explícito de instancia/raíz; derivar rutas internamente y adquirir admisión antes de consultas/lecturas.
2. **Hijo Chronicle:** rechazar rutas legacy en la interfaz de producción, exigir raíz y tomar lock antes de preflight/lecturas; prueba de invocación directa.
3. **`assistants`:** no abrir Continuity ni registrar misiones por acceso path-based directo; definir lectura admitida, trabajo externo sin lock y escritura condicional por revisión. No mover Lúmina/world state a la raíz.
4. **`simulate`:** recomendación pendiente de aprobar: desacoplar de Continuity; bootstrap/migración solo mediante operación Nexo explícita.
5. **API de aplicación y reexports:** separar API soportada orientada a instancia de primitivas internas path-based; definir allowlist de imports/callers de producción.
6. **Stores:** mantener locks de mutación existentes separados del root admission hasta caracterizar diferencias de timeout, stale/corrupt owner, token mismatch, release retry y cuarentena.
7. **Migración/bootstrap:** no inicializar ni migrar stores por consultas o comandos legacy; dry-run, copia verificada y cutover explícito, sin merge/dual-write automáticos.
8. **Reparación/efectos:** `NEXO_M0_OPTION_A_EFFECT_EXCLUDED` permanece vigente; root admission no altera `authorization: NOT_EVALUATED`.

## Condiciones de cierre

### D1 — inventario y no-bypass
El inventario debe transformarse en allowlist arquitectónico que distinga entrypoints de producción, tests, fixtures y helpers internos. Una prueba debe fallar ante un import/caller productivo nuevo que llegue a stores path-based sin instancia admitida. Debe cubrir la ejecución directa del hijo Chronicle, `assistants`, `simulate` y reexports. No aceptar búsquedas de código vacías como evidencia de ausencia.

### D2 — admisión/locks
Definir propietario del lock por operación, deadline relativo por proceso, lock ocupado/corrupto/stale, timeout, release incierto, cuarentena local y relación con locks de store. Comparar primero los contratos actuales; no introducir una tercera implementación duplicada ni unificar los locks sin caracterización.

### D3 — API/CLI/migración
Definir `--root`, canonicalización, symlinks en raíz/stores/lock, rechazo de rutas mezcladas, bootstrap explícito y migración/cutover. La raíz existente no debe crearse ni mutarse al validar una consulta normal. No afirmar protección frente a TOCTOU hostil, hardlinks, montajes o filesystem de red sin una garantía y prueba específicas.

## Continuidad operativa obligatoria

- Leer primero `NEXO_NCS/STATUS.md`, este censo y `NEXO_NCS/BUILD/NCS_MASTER_HANDOFF_NEXT_CHAT_2026-10-23_OPEN_LOOPS.md`.
- No repetir el censo ya realizado salvo cambio de commit o evidencia de que quedó incompleto.
- Próximo paso: completar el grafo de imports/callers de producción y convertirlo en allowlist verificable; luego cerrar D1, D2 y D3 en ese orden lógico antes de tocar runtime/tests.
- Mantener: autorización `NOT_EVALUATED`; raíz/legitimidad de dueño `PENDING/UNKNOWN`; efectos protegidos `STOP`.


## Extensión del censo: imports de tests y superficie npm — 2026-10-23

Después de fijar el inventario de 92 archivos de aplicación, se inspeccionaron también las declaraciones de import/export de los **45 archivos `tests/nexo/**`**, los **50 archivos `tests/**` fuera de ese directorio y `functions/api/capture.js`. Esto completa una pasada de importaciones estáticas sobre los 188 archivos JS/MJS/CJS que aparecen en el snapshot, sin convertirla en una prueba de grafo de seguridad completo.

Resultados observados:
- Los 45 tests Nexo importan intencionalmente primitivas internas, stores, owners, APIs path-based y entrypoints legacy para probar contratos existentes. Deben clasificarse como TEST_ONLY en el allowlist; sus imports no autorizan los mismos edges desde producción.
- Los 50 tests fuera de `tests/nexo/` no mostraron imports directos de stores Nexo, `openNexoContinuityOwner` ni la API de aplicación path-based. Incluyen pruebas de `src/assistants/memory.js`, que es memoria legacy en memoria, no persistencia directa de Continuity/Chronicle.
- `functions/api/capture.js` no importa módulos Nexo y responde HTTP 410 explícitamente.
- `package.json` define `nexo`, `assistants`, `simulate` y `test`. Los tres primeros son comandos de producción actuales; repair helpers no son scripts npm separados. La sesión hija Chronicle sigue expuesta por ejecución directa de Node, aunque no tenga alias npm.
- Los imports relativos estáticos/reexports fueron revisados para identificar rutas conocidas; los imports dinámicos/computados, llamadas de procesos construidas indirectamente y la ausencia absoluta de bypass requieren una prueba arquitectónica explícita. Este censo por sí solo no cierra D1.

Por precisión, la afirmación correcta es: **se revisó el conjunto de 188 archivos JS/MJS/CJS a nivel de inventario e imports estáticos conocidos; no se ejecutó un test arquitectónico ni se probó cierre transitivo contra todos los mecanismos dinámicos.**
