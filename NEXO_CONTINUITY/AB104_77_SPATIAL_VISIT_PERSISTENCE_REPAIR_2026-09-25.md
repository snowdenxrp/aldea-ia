# AB104.77 — Spatial visit persistence repair

Date: 2026-09-25

## Evidence
Run 2086 executed AB104.76 and still failed the behavioral exploration assertion. The diagnostic showed Bruno had completed an exploration (`area-1`) and both agents moved, but `knownRegions` remained at one entry. This means exploration completion alone was not a reliable territorial-observation boundary in the current tick/test path.

## Repair
Commit 4bcba686da99fa67d0a720937b3517fc354c7fe5 records the agent's actual visited spatial region during every simulation tick using the existing `recordRegionVisit()` primitive, then keeps `knownRegions` synchronized with that observed region. This is additive: it records regions actually occupied by an agent; it does not pre-mark unexplored target regions.

The behavioral assertion was not weakened.

## Verification
Pending GitHub Actions verification for this repair commit.

## Next action
Inspect the resulting Lúmina run. If behavioral exploration passes, continue through the remaining npm test chain and simulation. If it fails, use the concrete state rather than weakening the test.
