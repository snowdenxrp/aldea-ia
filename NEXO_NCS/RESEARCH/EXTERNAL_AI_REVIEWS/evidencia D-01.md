# MUSE-AUTONOMY-004-F — D-01: Evidencia de fuentes oficiales (A2A, well-known `agent.json` vs `agent-card.json`)

- **Defecto:** D-01 (MISIÓN MUSE-AUTONOMY-004-F, Nexo).
- **Afirmación en revisión:** expediente rectificado R2, §6.1 R7 — la especificación "dev" del protocolo A2A, §5.3, aún indica el well-known `agent.json` para la Agent Card.
- **Fecha de consulta:** 2026-11-08 (páginas rastreadas 2026-11-08 07:06–07:07 UTC; 01:06–01:07 CST).
- **Método:** `browser.search` y `browser.open` exclusivamente (sin navegador en vivo). Recuentos obtenidos con `browser.find` sobre el texto rastreado de cada página (subcadena exacta, sensible a mayúsculas/minúsculas en la forma escrita). `agent-card.json` **no** contiene `agent.json` como subcadena (difiere por el guion), por lo que ambos recuentos son independientes.
- **Alcance:** especificación del protocolo A2A (prosa). No se consultaron la guía separada `topics/agent-discovery.md`, el archivo normativo `specification/a2a.proto`, ni el cambio de AI Catalog de la línea v1.1.0-rc (octubre de 2026); quedan fuera del alcance de esta nota.

## 1. Tabla de versiones consultadas

| # | Versión / canal | URL exacta | Fecha de consulta | Hallazgo (recuentos `agent.json` / `agent-card.json`) |
|---|---|---|---|---|
| 1 | `latest` (renderizada; se autodenomina "Latest Released Version `1.0.0`") | https://a2a-protocol.org/latest/specification/ | 2026-11-08 | **0 / 5**. Descubrimiento en §8.2: `agent-card.json`. §5.3 **no** es descubrimiento. |
| 2 | `dev` (renderizada; contenido idéntico a `latest`: 5.887 líneas, mismas coincidencias en las mismas líneas) | https://a2a-protocol.org/dev/specification/ | 2026-11-08 | **0 / 5**. Idéntica a `latest`. §5.3 = "Method Mapping Reference". |
| 3 | `v1.0.0` (renderizada) | https://a2a-protocol.org/v1.0.0/specification | 2026-11-08 | **0 / 5**. §8.2: `agent-card.json`. (5.771 líneas: difiere de `latest`, que va por delante del tag.) |
| 4 | `main` (fuente Markdown) | https://raw.githubusercontent.com/a2aproject/A2A/main/docs/specification.md | 2026-11-08 | **0 / 5**. Se autodenomina "Latest Released Version `1.0.0`". |
| 5 | Tag `v1.0.1` (fuente Markdown) | https://raw.githubusercontent.com/a2aproject/A2A/v1.0.1/docs/specification.md | 2026-11-08 | **0 / 5**. |
| 6 | Tag `v1.0.0` (fuente Markdown) | https://raw.githubusercontent.com/a2aproject/A2A/v1.0.0/docs/specification.md | 2026-11-08 | **0 / 5**. Cabecera interna anacrónica: "(Release Candidate v1.0)" y "Latest Released Version `0.3.0`". |
| 7 | `v0.3.0` (renderizada) | https://a2a-protocol.org/v0.3.0/specification/ | 2026-11-08 | **0 / 2**. §5.3 ya dice `agent-card.json`. |
| 8 | `v0.2.6` (renderizada; **su propia cabecera dice `Version: dev`**) | https://a2a-protocol.org/v0.2.6/specification | 2026-11-08 | **2 / 0**. §5.3 dice `agent.json`. Única versión consultada con `agent.json`. |
| 9 | Releases de GitHub (a2aproject/A2A) | https://github.com/a2aproject/A2A/releases | 2026-11-08 | 0.3.0 (2025-07-30) registra como cambio incompatible: "Change Well-Known URI for Agent Card hosting from `agent.json` to `agent-card.json` (#841)". 1.0.1 figura con fecha 2026-05-26; 1.0.0 con 2026-03-12. |
| 10 | Commit del renombrado | https://github.com/a2aproject/A2A/commit/0858ddb884dc4671681fd819648dfd697176abb3 | 2026-11-08 | Título: "refactor!: Change Well-Known URI for Agent Card hosting from `agent.j…". El diff cambia la línea de §5.3 de `agent.json` a `agent-card.json`. Fecha del commit **no** visible en el extracto rastreado; solo consta su inclusión en 0.3.0 (2025-07-30). |

Notas sobre la tabla:

- **"dev" y "latest" son hoy el mismo contenido.** Ambas páginas renderizadas tienen 5.887 líneas y las 5 coincidencias de `agent-card.json` aparecen en las mismas líneas (3162, 3385, 5547, 5553, 5575). La página `dev` **no** es una instantánea congelada: es un canal móvil que hoy sirve contenido v1.0.
- **`latest` va por delante del tag v1.0.0.** La página `latest` tiene 5.887 líneas frente a 5.771 de la página renderizada v1.0.0 (p. ej., en §1.3 el diagrama dice "Send Streaming Message" en `latest` y "Stream Message" en v1.0.0). `latest` tampoco es una instantánea congelada.
- **Discrepancia de fecha de 1.0.1, no resuelta:** la página de releases de GitHub fecha 1.0.1 en 2026-05-26; varias fuentes secundarias consultadas en la búsqueda dicen 2026-05-28. Se registra la discrepancia sin resolverla. Además, el sitio web sigue autodenominando 1.0.0 como "Latest Released Version" aunque GitHub lista 1.0.1 como último estable.
- **La URL del tag v1.0.1 / v1.0.0 en crudo** se construyó a partir del patrón `raw.githubusercontent.com/a2aproject/A2A/<tag>/…` atestiguado en resultados de búsqueda (p. ej., `…/A2A/v0.2.0/specification/json/a2a.json`); ambas respondieron correctamente y su contenido es coherente con el tag, por lo que se dan por verificadas como instantáneas del tag.

## 2. Evidencia textual por versión

### 2.1. `latest` y `dev` (hoy, 2026-11-08) — `agent-card.json`, §5.3 no es descubrimiento

- Encabezado (ambas): "**Latest Released Version `1.0.0`**"; versiones previas listadas: `0.3.0`, `0.2.6`, `0.1.0`.
- §5.3 (línea 2098 en `latest`): "**### 5.3. Method Mapping Reference**" (tabla de correspondencia de métodos entre bindings). El §3.1 remite a él: "see Section 5.3 (Method Mapping Reference)".
- Descubrimiento, §8.2 (línea 3385 en `latest` y en `dev`):
  > "- **Well-Known URI:** Accessing `https://{server_domain}/.well-known/agent-card.json` (see Section 8.6 for caching guidance)"
- §8.1: "A2A Servers **MUST** make an Agent Card available."
- Otras ocurrencias de `agent-card.json` en `latest`/`dev`: ejemplo §6.9 ("GET /.well-known/agent-card.json HTTP/1.1", línea 3162); §14, plantilla de registro IANA ("**URI suffix:** agent-card.json", línea 5547; "The `.well-known/agent-card.json` URI provides a standardized location…", línea 5553; ejemplo "https://agent.example.com/.well-known/agent-card.json", línea 5575).
- Ocurrencias de `agent.json`: **0** en ambas.

### 2.2. `v1.0.0` y `v1.0.1` (tags y páginas renderizadas) — `agent-card.json`

- Renderizada v1.0.0, §8.2 (línea 3323): idéntica frase que §2.1 con `https://{server_domain}/.well-known/agent-card.json`. Cinco ocurrencias de `agent-card.json` (líneas 3114, 3323, 5430, 5436, 5458); cero de `agent.json`.
- Crudo v1.0.1, §8.2 (línea 3520): misma frase. Cinco ocurrencias de `agent-card.json` (líneas 3254, 3520, 5862, 5873, 5899); cero de `agent.json`.
- Crudo v1.0.0, §8.2 (línea 3473): misma frase. Cinco ocurrencias de `agent-card.json` (líneas 3207, 3473, 5810, 5821, 5847); cero de `agent.json`.
- `main` (crudo), §8.2 (línea 3540): misma frase. Cinco ocurrencias de `agent-card.json` (líneas 3255, 3540, 5923, 5934, 5960); cero de `agent.json`.

### 2.3. `v0.3.0` — §5.3 ya dice `agent-card.json`

- §5: "## 5. Agent Discovery: The Agent Card"; §5.2 remite a §5.3 ("Well-Known URI: Accessing a predefined path on the agent's domain (see Section 5.3)").
- §5.3 "Recommended Location" (líneas 415–418):
  > "If using the well-known URI strategy, the recommended location for an agent's Agent Card is: `https://{server_domain}/.well-known/agent-card.json` This follows the principles of RFC 8615 for well-known URIs."
- Segunda ocurrencia: ejemplo "GET https://example.com/.well-known/agent-card.json" (línea 3912). Ocurrencias de `agent.json`: **0**.

### 2.4. `v0.2.6` — la instantánea histórica que SÍ dice `agent.json` (y que se autodenomina "dev")

- Cabecera (línea 4): "**Version:** `dev`". Es decir, la línea 0.2.x en desarrollo se publicaba bajo la etiqueta `dev`.
- §5.3 "Recommended Location" (líneas 196–199):
  > "If using the well-known URI strategy, the recommended location for an agent's Agent Card is: `https://{server_domain}/.well-known/agent.json` This follows the principles of RFC 8615 for well-known URIs."
- Segunda ocurrencia: ejemplo "GET https://example.com/.well-known/agent.json" (línea 2277). Ocurrencias de `agent-card.json`: **0**.

### 2.5. El renombrado: releases 0.3.0 y commit 0858ddb

- Releases, 0.3.0 (2025-07-30), "⚠ BREAKING CHANGES":
  > "Change Well-Known URI for Agent Card hosting from `agent.json` to `agent-card.json` (#841)"
  y en "Code Refactoring": la misma línea con el commit `(0858ddb)`.
- Commit 0858ddb884dc4671681fd819648dfd697176abb3, título "refactor!: Change Well-Known URI for Agent Card hosting from `agent.json`…". El diff muestra, en `docs/specification.md`, el cambio exacto de la línea de §5.3:
  > `- `https://{server_domain}/.well-known/agent.json` `
  > `+ `https://{server_domain}/.well-known/agent-card.json` `
  (además de los mismos cambios en `topics/agent-discovery.md`, `topics/key-concepts.md` y tutoriales). La fecha del commit no aparece en el extracto rastreado; su inclusión en la release 0.3.0 (2025-07-30) es el único acotamiento temporal verificado aquí.

## 3. Veredicto: ¿es reproducible la afirmación histórica con una instantánea identificable?

**Veredicto: SÍ para el estado histórico, con re-anclaje obligatorio; NO tal como está redactada en R2 §6.1 R7.**

Desglose:

1. **La afirmación tal como está redactada ("la spec 'dev' §5.3 aún indica `agent.json`") NO es reproducible hoy.** El canal vivo `dev` (https://a2a-protocol.org/dev/specification/) sirve hoy contenido v1.0, con **cero** ocurrencias de `agent.json`, y su §5.3 es "Method Mapping Reference", no la ubicación recomendada de la Agent Card. Una revisión posterior que reportó cero ocurrencias de `agent.json` en "latest" queda **confirmada** por esta investigación (también cero en `latest`, `dev`, `v1.0.0`, `v1.0.1` y `main`).
2. **El estado histórico SÍ es reproducible con instantáneas identificables, pero bajo la etiqueta de versión `v0.2.6`, no bajo el canal vivo `dev`:**
   - Instantánea congelada: https://a2a-protocol.org/v0.2.6/specification — su propia cabecera dice `Version: dev` y su §5.3 dice `agent.json` (2 ocurrencias; 0 de `agent-card.json`).
   - Commit identificable del cambio: 0858ddb884dc4671681fd819648dfd697176abb3 (PR #841), cuyo diff cambia la línea de §5.3 de `agent.json` a `agent-card.json`; publicado como cambio incompatible en la release 0.3.0 (2025-07-30).
   - Por tanto, la afirmación histórica es verdadera **si se refiere a la `dev` de la era 0.2.x (congelada hoy como v0.2.6)** y falsa si se refiere al canal `dev` actual.
3. **Causa raíz del defecto:** "dev" es un canal móvil, no una versión. La etiqueta `dev` que en la era 0.2.x designaba el borrador vigente fue reutilizada después para el contenido v1.0, y la numeración de secciones cambió en v1.0 (descubrimiento pasó de §5 a §8; §5.3 pasó a ser "Method Mapping Reference"). Citar "dev §5.3" sin fecha ni commit es, por tanto, inherentemente no reproducible a largo plazo.

## 4. Recomendación de clasificación epistemológica y redacción sustitutoria

### 4.1. Clasificación

- **La frase como está redactada no puede conservar la etiqueta EVIDENCE.** Como afirmación en presente sobre el canal `dev`, está **refutada** por la comprobación en vivo de 2026-11-08 (cero ocurrencias de `agent.json`; §5.3 con otro contenido). Mantenerla como EVIDENCE afirmaría como vigente algo que la verificación contradice.
- **Recomendación principal: corregir la redacción (ver §4.2) y conservar EVIDENCE, pero solo para la versión re-anclada.** La afirmación histórica re-anclada a v0.2.6 + commit 0858ddb sí está verificada contra fuentes primarias oficiales (página congelada de la especificación y commit del repositorio), con referencias exactas citadas en §2.4–§2.5.
- **Si no se autoriza la corrección de la redacción:** la frase sin anclar debe degradarse como mínimo a **HYPOTHESIS** (reconstrucción no anclada de un estado anterior, sin instantánea citada que la reproduzca) — y, en rigor, dado que la comprobación en vivo la contradice como afirmación vigente, lo honesto es señalarla como **refutada en su forma actual** y no dejarla como afirmación sin calificar. La etiqueta **UNKNOWN** sería insuficiente por sí sola, porque no recoge que la comprobación actual es negativa; **CORROBORATED** no procede (no hay dos fuentes independientes que sostengan la frase tal como está redactada: la única fuente que la sostiene es la instantánea v0.2.6, que corresponde a otra etiqueta de versión que la citada). **INFERENCE** tampoco procede: no es una inferencia a partir de evidencia, sino una cita de versión mal anclada.

### 4.2. Redacción sustitutoria propuesta

> "En la instantánea v0.2.6 de la especificación —cuya cabecera se autodenominaba `Version: dev`—, §5.3 ('Recommended Location') indicaba `https://{server_domain}/.well-known/agent.json`. El renombrado a `agent-card.json` se hizo en el commit 0858ddb (PR #841) y se publicó como cambio incompatible en la versión 0.3.0 (2025-07-30). El canal vivo `dev` actual (consultado 2026-11-08) ya no dice `agent.json`: sirve contenido v1.0, su §5.3 es 'Method Mapping Reference' y el descubrimiento está en §8.2, con `agent-card.json`; lo mismo vale para `latest`, v1.0.0 y v1.0.1 (cero ocurrencias de `agent.json` en todas ellas)."

Esta redacción conserva la limitación (el hallazgo histórico no es el estado vigente) sin afirmar como vigente lo que no se puede verificar, y cita la instantánea exacta que lo reproduce.

## 5. Limitaciones y discrepancias registradas (no resueltas)

- Los recuentos son los devueltos por `browser.find` sobre el texto rastreado por el crawler el 2026-11-08; no se descargaron los bytes crudos ni se calcularon hashes de los archivos. Un recuento "0" significa "cero coincidencias en el texto rastreado".
- Fecha del commit 0858ddb no verificada (no visible en el extracto rastreado); solo su inclusión en 0.3.0 (2025-07-30).
- Fecha de 1.0.1: GitHub Releases dice 2026-05-26; fuentes secundarias dicen 2026-05-28. No resuelto.
- El sitio web sigue autodenominando 1.0.0 como "Latest Released Version" aunque GitHub lista 1.0.1. No resuelto; no afecta al hallazgo principal.
- La cabecera interna del tag v1.0.0 "(Release Candidate v1.0)" / "Latest Released Version `0.3.0`" es anacrónica dentro del propio archivo tagueado; se registra sin interpretar.
- No se verificaron `topics/agent-discovery.md`, `specification/a2a.proto`, ni la línea v1.1.0-rc (cambio a AI Catalog, octubre de 2026, según fuentes secundarias). El veredicto se limita a la especificación (`specification.md`) y a las versiones listadas en §1.
- No se pudo establecer con las fuentes consultadas **cuándo exactamente** el canal `dev` dejó de servir el contenido 0.2.x y pasó a servir v1.0 (no hay fecha de transición verificada); solo se constata el estado actual (2026-11-08) y los dos extremos (v0.2.6 con `agent.json`; v0.3.0 en adelante con `agent-card.json`).

## 6. Fuentes

1. https://a2a-protocol.org/latest/specification/ — A2A Protocol Specification, "Latest Released Version 1.0.0".
2. https://a2a-protocol.org/dev/specification/ — ídem, canal dev.
3. https://a2a-protocol.org/v1.0.0/specification — especificación v1.0.0 renderizada.
4. https://a2a-protocol.org/v0.3.0/specification/ — especificación v0.3.0.
5. https://a2a-protocol.org/v0.2.6/specification — especificación v0.2.6 (cabecera "Version: dev").
6. https://raw.githubusercontent.com/a2aproject/A2A/main/docs/specification.md — `docs/specification.md` en `main`.
7. https://raw.githubusercontent.com/a2aproject/A2A/v1.0.1/docs/specification.md — `docs/specification.md` en el tag v1.0.1.
8. https://raw.githubusercontent.com/a2aproject/A2A/v1.0.0/docs/specification.md — `docs/specification.md` en el tag v1.0.0.
9. https://github.com/a2aproject/A2A/releases — releases (0.3.0, 1.0.0, 1.0.1).
10. https://github.com/a2aproject/A2A/commit/0858ddb884dc4671681fd819648dfd697176abb3 — commit del renombrado `agent.json` → `agent-card.json` (PR #841).
