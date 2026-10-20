# NCS M0 — contrato de resultado del commit condicional y cobertura CI

Fecha: 2026-10-20
Rama: `ncs-clean-architecture`
Tipo: regresión focal de contrato; sin cambio de runtime.

## Hallazgo acotado

La suite `tests/nexo/conditional-commit-persist-state.test.mjs` ya probaba persistencia real, conflicto por revisión obsoleta y rechazo de `expectedRevision` fuera del rango seguro. Sin embargo, no estaba incluida en `npm test`, por lo que el pipeline principal no garantizaba ejecutar esta integración del límite `ConditionalCommit → persistState`.

## Cambio

- Test commit `92201f7b353bf1408d88863267316379d6d0b228`: añade regresiones que comprueban:
  1. error de persistencia con código `EIO` → `COMMIT.UNKNOWN`, conservando el código;
  2. error sin código reconocible → `COMMIT.UNKNOWN` y `PERSISTENCE_UNKNOWN`;
  3. candidate sin `state` → rechazo antes de invocar persistencia.
- Package/test integration commit `72cc1b1d55f72d29ee8b9f17b0ada76ac41c6d24`: añade `node tests/nexo/conditional-commit-persist-state.test.mjs` a `npm test`.
- No se modificó el adaptador runtime. Las pruebas fijan el contrato que ya implementa; no demuestran autoridad constitucional ni habilitan efectos protegidos.

## Evidencia CI en el SHA exacto

Head SHA de los runs: `72cc1b1d55f72d29ee8b9f17b0ada76ac41c6d24`.

- [Bounded mission admission / restart continuity — 39443509056](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509056): `completed / success`.
- [Integrated M0 acceptance regression — 39443509170](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509170): `completed / success`.
- [Chronicle native vertical — 39443509438](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509438): `completed / success`.
- [Deterministic persistence tests — 39443509057](https://github.com/snowdenxrp/aldea-ia/actions/runs/39443509057): `completed / success`.

La evidencia demuestra éxito de esos workflows para ese SHA; no debe generalizarse a toda la arquitectura ni a autoridad raíz.

## Estado y siguiente límite

M0 sigue `INCOMPLETO`; `authorization: NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.

Siguiente trabajo: continuar con una brecha M0 verificable y no cerrada, respetando el contrato de revisión explícita del artefacto constitucional. No implementar raíz/bootstrap/Trust Registry por intuición ni repetir auditorías cerradas.
