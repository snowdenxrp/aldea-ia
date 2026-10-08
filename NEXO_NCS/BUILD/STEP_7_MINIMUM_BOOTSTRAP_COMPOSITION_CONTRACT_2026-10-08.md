# STEP 7 — Minimum Bootstrap Composition Contract — 2026-10-08

Status: DESIGN CANDIDATE — ATTACK REQUIRED

## Purpose
Define the smallest semantic contract that can combine permitted bootstrap support classes without pretending that multiple sources are automatically independent.

## Inputs
1. `supportSet`: bounded set of typed bootstrap support claims.
2. `claimScope`: exact trust property being established.
3. `independenceRequirements`: required trust/failure-domain separation for that claim.
4. `compositionRule`: governed relation such as single-root, AND, threshold, or another explicitly defined relation.
5. `dependencyClosure`: dependency-closed support graph for every participating source.
6. `orderingContext`: protected ordering/succession context when multiple candidates conflict.
7. `validityContext`: currentness/revocation/expiry/recovery state required by the claim.

## Output
`ESTABLISHED` only if the composition rule is satisfied for the exact claim scope and all required dependency/independence/currentness conditions are established.
`UNKNOWN` if required independence, dependency closure, ordering, or currentness is unresolved.
`INVALID` if a required condition is disproven.

## Critical separation
Bootstrap composition establishes only the Genesis Trust Foundation claim(s) explicitly covered by the composition rule.
It does not automatically establish Constitution, Policy, Mission Authority, Capability, Execution or external-world truth.

## Independence
Independence is claim-specific. Two support sources sharing the same key root, provider, organization, firmware, recovery operator, policy authority, or other material dependency are not independent merely because they are represented as separate nodes.

## No implicit selector
The composition boundary must not select the 'best' root by timestamp, generation, score, provider order, local preference, availability, or confidence unless the governing composition contract explicitly makes that property authoritative.

## Failure semantics
Insufficient composition remains UNKNOWN/INVALID according to the failed condition. No fallback source silently increases authority scope.

## Future-countereffect constraints
No generic trust registry, universal quorum engine, automatic root rotation, hidden fallback, retry queue, operation identity, or hardware/provider-specific mechanism is introduced.