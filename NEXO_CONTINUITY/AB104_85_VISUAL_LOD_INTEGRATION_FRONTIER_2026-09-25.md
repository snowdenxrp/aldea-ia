# AB104.85 — VISUAL LOD INTEGRATION FRONTIER — 2026-09-25

## Verified
- Lúmina persistent workflow run 2107, ID 36197390830, head `0f03daf1219451915bab036ae276a1f6d14e13a5`, SUCCESS.
- Pages dynamic run 1804, ID 36197404563, head `b0d73f4c00e5f2e9cb7a91f41c547966732dd6a8`, SUCCESS.
- `src/main-stable.js` calls `buildVillage(scene)` but does not import or invoke `getVillageDetailLevel` / `applyVillageDetailLevel` from `src/village-lod.js`.
- `tests/village-lod.test.mjs` verifies threshold classification only (8→close, 35→medium, 90→far); it does not prove live renderer integration.
- LOD integration is therefore an open implementation frontier, not a completed feature.

## Safety boundary
- Do not claim LOD is active in the live renderer.
- Do not hide the whole village at medium/far distance.
- Preserve current visual continuity while adding distance-aware optimization.
- Semantic P_AA/AB65 statuses unchanged.

## Next exact action
Implement non-destructive LOD for expensive village detail layers, then add an integration test proving the renderer consumes the policy. Verify through GitHub Actions before promotion.
