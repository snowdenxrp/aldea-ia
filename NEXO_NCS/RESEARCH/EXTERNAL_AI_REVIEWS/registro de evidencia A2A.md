# MISIÓN MUSE-AUTONOMY-004-G — REGISTRO DE EVIDENCIA A2A

**Misión:** MUSE-AUTONOMY-004-G — remediación adversarial, reconciliación y verificación final de R2.
**Propósito:** registrar, en un solo documento, la evidencia oficial del protocolo A2A que sustenta las correcciones A-02 (referencias a secciones) y D-01 (well-known `agent.json` vs `agent-card.json`), para que un revisor no tenga que repetir las consultas.
**Fecha de consulta:** 2026-11-08 (crawl 07:57 UTC, salvo indicación en contra).
**Método:** `browser.search` / `browser.open` sobre las páginas oficiales de la especificación; recuentos por búsqueda de texto completo sobre el texto rastreado (subcadena exacta, sensible a mayúsculas/minúsculas en la forma escrita). `agent-card.json` no contiene `agent.json` como subcadena (difiere por el guion), por lo que ambos recuentos son independientes.
**Antecedente:** `MUSE_004_F_D01_SOURCE_EVIDENCE.md` (MUSE-AUTONOMY-004-F, 2026-11-08), de donde proceden los recuentos por versión y el anclaje D-01. Este registro consolida esa evidencia con la verificación A-02 de MUSE-004-G (Pasadas 2, 4 y 5).

## 1. Canales consultados

| # | Versión / canal | URL exacta | Fecha | Líneas | Recuentos `agent.json` / `agent-card.json` |
|---|---|---|---|---|---|
| 1 | `latest` (renderizada; se autodenomina «Latest Released Version `1.0.0`») | https://a2a-protocol.org/latest/specification/ | 2026-11-08 | 5.887 | 0 / 5 |
| 2 | `dev` (renderizada) | https://a2a-protocol.org/dev/specification/ | 2026-11-08 | 5.887 | 0 / 5 |
| 3 | `v1.0.1` (crudo) | https://a2a-protocol.org/v1.0.1/specification | 2026-11-08 | — | 0 / 5 |
| 4 | `v1.0.0` (renderizada) | https://a2a-protocol.org/v1.0.0/specification | 2026-11-08 | 5.771 | 0 / 5 |
| 5 | `v0.3.0` (renderizada) | https://a2a-protocol.org/v0.3.0/specification/ | 2026-11-08 | — | 0 / 2 |
| 6 | `v0.2.6` (renderizada; su propia cabecera dice «Version: `dev`») | https://a2a-protocol.org/v0.2.6/specification | 2026-11-08 | 3.564 | 2 / 0 |

**`dev` y `latest` son hoy el mismo contenido.** Ambas páginas renderizadas tienen 5.887 líneas y las 5 coincidencias de `agent-card.json` aparecen en las mismas líneas (3162, 3385, 5547, 5553, 5575). La página `dev` no es una instantánea congelada: es un canal móvil que hoy sirve contenido v1.0.

## 2. Secciones verificadas en `latest` (2026-11-08)

| Sección | Título | Línea | Texto que sustenta |
|---|---|---|---|
| §1 | «Introduction» | L16 | «an open standard designed to facilitate communication and interoperability between independent, potentially opaque AI agent systems» (L18–20) |
| §3.3 | «Operation Semantics» | L811 | — |
| §4.3 | «Push Notification Objects» | L1415 | — |
| §4.5 | «Security Objects» | L1667 | — |
| §4.6 | «Extensions» | L1826 | — |
| §5.1 | «Functional Equivalence Requirements» | L2078 | — |
| §5.3 | «Method Mapping Reference» | L2098 | — |
| §7 | «Authentication and Authorization» | L3234 | — |
| §7.3 | «Client Authentication Process» | L3251 | «2. **Credential Acquisition (Out-of-Band):** The client obtains the necessary credentials through an out-of-band process…» (L3255) |
| §7.5 | «Server Authorization Responsibilities» | L3270 | «Authorization logic is implementation-specific» (L3272) |
| §7.6 | «In-Task Authorization» | L3283 | — |
| §8 | «Agent Discovery: The Agent Card» | L3372 | — |
| §8.1 | «Purpose» | L3374 | — |
| §8.2 | «Discovery Mechanisms» | L3381 | «**Well-Known URI:** Accessing `https://{server_domain}/.well-known/agent-card.json` (see Section 8.6 for caching guidance)» |
| §8.4 | «Agent Card Signing» | L3418 | «Agent Cards **MAY** be digitally signed using JSON Web Signature (JWS)…» (L3420); «Clients **SHOULD** verify at least one signature before trusting an Agent Card» (L3650) |

**Hallazgo A-02-1:** la frase citada de §3.3 («Identity information is not transmitted within A2A JSON-RPC payloads…») tiene **cero ocurrencias** en `latest` (búsqueda de texto completo). En `latest`, §3.3 es «Operation Semantics», no identidad.

## 3. Secciones verificadas en v0.2.6 (2026-11-08)

| Sección | Título | Línea | Texto que sustenta |
|---|---|---|---|
| §3.3 | «Streaming Transport (Server-Sent Events)» | L99 | «Identity information is **not** transmitted within A2A JSON-RPC payloads; it is handled at the HTTP transport layer.» (L109–110) |
| §4.3 | «Client/User Identity & Authentication Process» | L124 | «2. **Credential Acquisition (Out-of-Band):** … through an **out-of-band process** … outside the scope of the A2A protocol itself.» (L129–130) |
| §4.5 | «In-Task Authentication (Secondary Credentials)» | L147 | — |
| §4.6 | «Authorization» | L161 | «Authorization logic is implementation-specific» (L164) |
| §5.1 | «Purpose» | L178 | «The Agent Card is a JSON document that describes the server's identity, capabilities, skills, service endpoint URL…» (L180) |
| §5.3 | «Recommended Location» | L196 | «`https://{server_domain}/.well-known/agent.json`» (L198–199) |

**Hallazgo A-02-2:** las atribuciones históricas de C05 son literales en v0.2.6 (§3.3 identidad en capa HTTP; §4.3 credenciales fuera de banda; §4.5 autenticación secundaria en tarea; §4.6 autorización «implementation-specific»; §5.1 Agent Card; §5.3 `agent.json`). En `latest` (2026-11-08) ninguno de esos números resuelve al mismo contenido: los contenidos están hoy en §7.3 (credenciales fuera de banda), §7.5 (autorización), §7.6 (autorización en tarea) y §8.1–§8.2 (Agent Card). §1 sigue siendo «Introduction» y §8.4 sigue siendo «Agent Card Signing» con MAY (firma JWS opcional) y SHOULD (verificación por el cliente): la confirmación F-E15 se re-verifica vigente hoy.

## 4. Anclaje D-01: el renombrado `agent.json` → `agent-card.json`

- **Releases de GitHub (a2aproject/A2A):** https://github.com/a2aproject/A2A/releases — 0.3.0 (2025-07-30) registra como cambio incompatible: «Change Well-Known URI for Agent Card hosting from `agent.json` to `agent-card.json` (#841)». 1.0.1 figura con fecha 2026-05-26; 1.0.0 con 2026-03-12.
- **Commit del renombrado:** https://github.com/a2aproject/A2A/commit/0858ddb884dc4671681fd819648dfd697176abb3 — título: «refactor!: Change Well-Known URI for Agent Card hosting from `agent.j…». El diff cambia la línea de §5.3 de `agent.json` a `agent-card.json`. **Fecha del commit no visible** en el extracto rastreado; solo consta su inclusión en 0.3.0 (2025-07-30).
- **Conclusión D-01:** R7 (§6.1) queda re-anclado a v0.2.6 + commit `0858ddb`; la afirmación de que la página `dev` «aún indica `agent.json`» es histórica (era cierta para la `dev` leída en 2026-11-05) y ya no se cumple hoy: `dev` y `latest` sirven hoy contenido v1.0 con `agent-card.json`.

## 5. Lo que este registro NO contiene (pendiente)

- **I-02 (abierta):** la sustancia de C05 (A2A como proyecto abierto, Agent Card, autenticación declarada pero fuera del protocolo, autorización específica de la implementación) **no se re-verificó contra el tag v1.0.1**. Las referencias se verificaron en `latest` y en v0.2.6; la correspondencia con el tag v1.0.1 queda pendiente de verificación.
- **Discrepancia de fecha de v1.0.1:** GitHub registra 2026-05-26; fuentes secundarias citan 2026-05-28. Sin resolver.
- **Fecha del commit `0858ddb`:** no visible en el extracto rastreado; solo su inclusión en 0.3.0 (2025-07-30).
- **Líneas de las ocurrencias de `agent-card.json` en `latest`/`dev`:** ejemplo §6.9 («GET /.well-known/agent-card.json HTTP/1.1», línea 3162); §14, plantilla de registro IANA («**URI suffix:** agent-card.json», línea 5547; «The `.well-known/agent-card.json` URI provides a standardized location…», línea 5553; ejemplo «https://agent.example.com/.well-known/agent-card.json», línea 5575). Ocurrencias de `agent.json`: 0 en ambas.
- **Líneas en v1.0.0/v1.0.1:** renderizada v1.0.0, §8.2 (línea 3323): misma frase que §2.1, con `https://{server_domain}/.well-known/agent-card.json`; cinco ocurrencias de `agent-card.json` (líneas 3114, 3323, 5430, 5436, 5458); cero de `agent.json`. Crudo v1.0.1, §8.2 (línea 3520): misma frase; cinco ocurrencias de `agent-card.json` (líneas 3254, 3520, 5862, 5873, 5899); cero de `agent.json`. Crudo v1.0.0, §8.2 (línea 3473): misma frase; cinco ocurrencias (líneas 3207, 3473, 5810, 5821, 5847); cero de `agent.json`. `main` (crudo), §8.2 (línea 3540): misma frase; cinco ocurrencias (líneas 3255, 3540, 5923, 5934, 5960); cero de `agent.json`.

## 6. Relación con el dossier

- Las correcciones A-02 del informe G (§3 C05, §3 C01, §6.1 R4, §12 fila A2A) se sustentan en las secciones 2 y 3 de este registro.
- R7 (§6.1) se sustenta en la sección 4 de este registro.
- La confirmación F-E15 (§8.4, firma JWS MAY / verificación SHOULD) se sustenta en la sección 2 de este registro (§8.4, L3418/L3420/L3650).
- Este registro no modifica estados: U2, U3, U5 UNKNOWN; U1, U4, U6, U7, U8, U9 RESUELTOS; C14 PARCIALMENTE CONFIRMADA; D-01 a D-12 SIN DECIDIR.
