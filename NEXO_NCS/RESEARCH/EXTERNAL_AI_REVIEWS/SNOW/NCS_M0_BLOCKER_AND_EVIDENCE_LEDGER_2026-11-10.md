# NCS M0 — Registro único de gates, bloqueos y evidencia (ledger)

**Fecha:** 2026-11-10. **Modalidad:** solo lectura; este registro no modifica ningún estado canónico.
**Fuentes de estado:** STATUS canónico (rama `ncs-continuity-handoff-correction-2026-11-07` @ `eee2ae77…`, blob `dfa580cc…`); handoff canónico 2026-11-07; contrato de cierre `NCS_M0_CLOSURE_CRITICAL_PATH_AND_EVIDENCE_CONTRACT_2026-11-10.md` (`40f50d1d…`, publicado en `6283f664…`); auditoría adversarial de este paquete (`NCS_M0_ADVERSARIAL_CLOSURE_AUDIT_2026-11-10.md`).
**Snapshot de código de referencia:** `d8b5ca8720908d926acc18130614cce132a43b5d`.

## 1. Estado de publicación verificado (corrige §2.1 del contrato)

| Ítem | Estado real al 2026-11-10 23:36 CST |
|---|---|
| Rama de investigación HEAD | **`6283f6643cbbf67054e14a4f93006d512edafe75`** (el §2.1 del contrato decía `9c4d9d81…`; supersedido) |
| Contrato de cierre en rama | **Publicado**, byte-idéntico al local (`40f50d1d56f3…`, 79.952 bytes con addendum §15) |
| Delta P09 en rama | **NO publicado** (artefacto local `6e59e0e6…`, 51.219 bytes, listo para subir) |
| Duplicado compatibilidad «(1)» | En rama, mismo blob `c970b186…` que el original; tratar como duplicado |
| Falsación en rama | `534c728c…` (reflow 2 bytes vs local `8f1bb646…`, contenido idéntico) |
| Este paquete (5 entregables) | Local; publicación pendiente por el propietario (GitHub NOT_CONNECTED) |

## 2. Ledger por gate

| Gate | Decisión vigente (fuente) | Implementado (snapshot `d8b5ca87`) | Probado | CI-VERIFIED (SHA exacto, verificado por API 2026-11-10) | Bloqueo | Clasificación actual |
|---|---|---|---|---|---|---|
| G-1 P03/P04 pre-read | D1–D6 + O-08/O-10/O-11 DECIDED (STATUS/handoff/spec 25-10) | **No**: queries path-based (`continuity-queries.mjs` L10/215/272), sin admisión de instancia | No (tests de store ≠ admisión) | No hay runs de admisión sobre `d8b5ca87` | Implementación pre-read + dueño por flujo + resolver P08 | **DECIDED / no IMPLEMENTED** |
| G-2 P05 durable BLOCKED | P05-C política DECIDED + cleanup atribuible (STATUS 07-11) | **No**: token→`rm(path)` no atómico, `lockReleaseFailures` volátil (`continuity-store.mjs` L43–L79) | No | No | Ancla realizada (D-RB-04) + mecanismo durable + E1–E9 ejecutados | **P05 OPEN** |
| G-3 P07-C | V2.3 declarada 8-Nov (trazabilidad incompleta) + afectación reversible + cleanup atribuible DECIDED 07-11 | Ninguno (mecanismo NINGUNO) | No (P07-01…22 diseñados, no ejecutados) | No | P07-A + A-01/A-08 + harness con actor B previo | **UNKNOWN / BLOCKING** |
| G-4 P08 | Decidida 9-Nov (declarada; contenido no referenciado); rama: OPEN/LAYOUT UNSELECTED | **No**: sin resolver común; append inicializa Chronicle (`chronicle-append.mjs` L344–L354) | No | No | B-DOC-1 (referencia) + resolver + separación init/append | **DECIDED-declarada / OPEN en código** |
| G-5 P09 | Universo acotado ratificado 9-Nov (declarado); P09 OPEN/UNKNOWN | Parcial: guard literal OK; APIs path-based importables (7 exports) | Guard sin fixtures negativos; sin PASS ligado a SHA | Solo decoupling sobre `d8b5ca87` (no es evidencia P09 de cobertura) | Universo referenciado + fixtures + conversión APIs + consumidores clasificados | **OPEN/UNKNOWN** (4 RESOLVED / 6 PARTIAL / 1 OUTSIDE en delta) |
| G-6 E2/E3 | R1 + criterio acotado DECIDED 02-11 | n/a (evidencia operacional) | Inspección puntual 02-11 | n/a | Ventana con operación + RE-01/RE-02 | **PARTIAL / NOT CLOSED** |
| G-7 E4 + fingerprint | E4 limitado verificado (publicación restringida, R1 doc) | Probes puntuales (COPYFILE_EXCL OK, hardlink EACCES) | Suite local PASS sobre `5988d9b4` (no CI completo entonces; hoy 3 runs CI parciales, ver ADV-06) | `5988d9b4`: 3 runs (STEP4/5/decoupling); `7a7f3ffa`: 5 runs | Fingerprint S-1–S-4 + A-03 | **E4 NOT READY (cierre) / O8 UNKNOWN** |
| G-8 CI de cierre | Criterios 16/18–20 línea de meta | n/a | n/a | **No existe** SHA de cierre. Histórico: `7a7f3ffa` 5/5 success; `d8b5ca87` 1 run (decoupling); run PR#110 40972888688 = `572fe085…` (no es `d8b5ca87`) | SHA congelado con implementación+tests de cierre | **OPEN** |
| G-9 Acta | Línea de meta aceptada 24-10 (20 criterios) | n/a | n/a | n/a | G-1…G-8 + exclusiones (criterio 17) | **PENDIENTE** |
| Transversales | `authorization: NOT_EVALUATED`; raíz PENDING/UNKNOWN; commissioning STOP | Hardcodeado NOT_EVALUATED en productores leídos; repair STOP-gated | — | — | Gates separados de M0_BUILD_COMPLETE | **STOP / NOT_EVALUATED** (no los cierra M0) |

## 3. Evidencia disponible vs ausente (resumen)

**Disponible y verificada:** STATUS/handoff canónicos; línea de meta aceptada; spec P03/P04 con casos §7; obligaciones O1–O9 + matriz E1–E9; norma P07 V2.3 + oráculos; reconciliaciones P08/P09/delta P09 (local); R1/E2/E3/E4 limitado; CI histórico por SHA (tabla §2); falsación/especificación de rollback/reconciliación/ACA-1/compatibilidad/Qwen/Gemini en rama; contrato de cierre publicado.

**Ausente (con porqué importa):** contenido exacto P08/P09 9-Nov (sin él G-4/G-5 no son verificables); DISC-08A/B (desconocido si algún gate depende de ellos); forma del ancla; P07-A; predicados REC/cuarentena; fingerprint S-1–S-4; A-03; harness P07; tests de admisión/no-bypass; CI sobre SHA de cierre; ventana E2/E3 con operación; delta P09 en rama (solo publicación).

## 4. Hallazgos que alimentan este ledger

ADV-01…ADV-12 de la auditoría adversarial. Bloqueantes de cierre: ADV-01, 02, 03, 05 (G-8), 07, 08, 10 (vía A-01/A-08). No bloqueantes por sí solos: ADV-04, 06, 09, 12. Cerradas: ADV-11 (Nexo/Lúmina, dispatch, repair, autoridad en archivos leídos).

## 5. Correcciones de evidencia aplicadas en este paquete

1. §2.1 del contrato supersedido (HEAD `6283f664…`; contrato publicado; delta P09 pendiente) — corrección aquí, sin reescribir el artefacto publicado.
2. Handoff 01-11 «sin CI para `5988d9b4`» → corregido: 3 runs success (ADV-06).
3. Run PR #110 40972888688 → `head_sha` conocido: `572fe085…` ≠ snapshot auditado (ADV-05).
4. §15.4 del contrato: reformulación propuesta en ADV-09.
5. Duplicado «(1)»: clasificado como duplicado (mismo blob), no como ACA-1 ni como fuente independiente.
