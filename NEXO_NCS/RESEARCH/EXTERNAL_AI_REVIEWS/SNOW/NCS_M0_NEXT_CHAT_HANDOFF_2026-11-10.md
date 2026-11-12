# NCS M0 — Handoff para el próximo chat (2026-11-10)

**Para:** quien continúe NCS M0 sin repetir investigaciones. **Modalidad:** solo lectura hasta autorización expresa.

## 1. Punto de entrada (en este orden)

1. `NEXO_NCS/STATUS.md` canónico — rama `ncs-continuity-handoff-correction-2026-11-07` @ `eee2ae772e5569ffbc90d6334f47c6633f4961fb`, blob `dfa580cc77ffafe37d26997220cbc12357328fa2`. **No** usar el STATUS de la rama de investigación (es STEP 7 histórico).
2. `NEXO_NCS/MASTER/README.md` + directiva estratégica; `NEXO_NCS/CORE/README.md`.
3. Handoff canónico `NEXO_NCS/HANDOFF/NCS_NEXT_CHAT_2026-11-07_M0_CONTINUITY_CORRECTED.md` (§5 gates literales, §6 orden).
4. Contrato de cierre (rama de investigación @ `6283f664…`, `40f50d1d…`) + addendum §15.
5. Este paquete adversarial (carpeta SNOW, local hasta que el propietario lo suba): auditoría, ledger, plan, decisiones, este handoff.

## 2. Estado verificado (2026-11-10 23:36 CST)

- Repo `snowdenxrp/aldea-ia`; investigación @ `6283f6643cbbf67054e14a4f93006d512edafe75`; canónicos @ `eee2ae77…`; código auditado `d8b5ca8720908d926acc18130614cce132a43b5d` (rama `ncs-lumina-decoupling-2026-10-29`).
- Gates: P05 OPEN; P07-C UNKNOWN/BLOCKING; P08 OPEN/LAYOUT UNSELECTED (decidida 9-Nov sin referenciar); P09 OPEN/UNKNOWN (universo 9-Nov sin referenciar); E2/E3 PARTIAL/NOT CLOSED; E4 NOT READY para cierre; `authorization: NOT_EVALUATED`; raíz PENDING/UNKNOWN; commissioning/efectos STOP; **M0 INCOMPLETO**. Veredicto de ruta: `M0 CLOSURE PATH PARTIAL`.
- CI verificado por API pública en esta auditoría: `7a7f3ffa…` 5 runs success; `d8b5ca87…` 1 run (decoupling/focused-regression); `5988d9b4…` 3 runs (corrige handoff 01-11); run PR#110 40972888688 = `572fe085…` (no es el snapshot).
- No repetir: falsación CE, especificación de rollback, reconciliación D-RB, ACA-1, compatibilidad, delta P09 (63 módulos), censo 188, guard Lúmina, P08/P09 07-11, seams P03/P04, lectura estática de locks del snapshot `d8b5ca87`, Qwen/Gemini. Reabrir solo con SHA/seam nuevo o contradicción concreta.

## 3. Tareas pendientes (orden del plan T-01…T-12)

Primera acción recomendada: **T-01** — referenciar el contenido exacto de P08/P09/P01-B=C (y constancia DISC-08A/B) en un registro localizable, sin pedir re-ratificación. En paralelo: T-02 (corrigendum ACA-1 + especificaciones P07-A/REC + propuesta de ancla) y T-12 (subir delta P09 `6e59e0e6…` + este paquete; Snow verifica hashes tras la subida). Después: T-03 decisiones → T-04 fingerprint/A-03 (autorizada) → T-05/T-06/T-07 implementación → T-08 harness → T-09 CI SHA congelado → T-10 ventana E2/E3 → T-11 acta.

## 4. Archivos de este paquete (locales, pendientes de subida)

`~/workspace/research_notes/nexo-m0-adversarial-audit-2026-11-10/SNOW/`:
- `NCS_M0_ADVERSARIAL_CLOSURE_AUDIT_2026-11-10.md` (ADV-01…ADV-12; ADV-11 = CLOSED superficies)
- `NCS_M0_BLOCKER_AND_EVIDENCE_LEDGER_2026-11-10.md`
- `NCS_M0_MINIMUM_SAFE_CLOSURE_PLAN_2026-11-10.md` (T-01…T-12)
- `NCS_M0_OWNER_DECISIONS_AND_AUTHORIZATION_REQUIRED_2026-11-10.md`
- `NCS_M0_NEXT_CHAT_HANDOFF_2026-11-10.md` (este archivo)

Destino en rama: `NEXO_NCS/RESEARCH/EXTERNAL_AI_REVIEWS/SNOW/`. GitHub NOT_CONNECTED: sube el propietario; Snow verifica y reporta el HEAD resultante. No reenviar archivos ya entregados (regla de Kevin): el contrato de cierre ya está en rama (`40f50d1d…`); el delta P09 (`6e59e0e6…`) sigue sin subir.

## 5. Límites vigentes

Solo lectura; sin implementación, tests, CI, dispositivo, bootstrap ni efectos sin autorización expresa separada; sin tocar decisiones ratificadas ni PR; sin declarar PASS sin evidencia del SHA exacto; sin M1/STEP 7/YubiKey; moratorio D-RB-01 (RB-1–RB-4) intacto; P01-B=C (no seleccionar launcher por inferencia).
