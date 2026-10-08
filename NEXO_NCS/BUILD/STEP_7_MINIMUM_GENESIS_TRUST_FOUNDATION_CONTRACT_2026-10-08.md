# STEP 7 — Minimum Genesis Trust Foundation Contract — 2026-10-08

Status: DESIGN CANDIDATE — ATTACK REQUIRED

## Research synthesis
MASTER/research establishes that Nexo cannot self-declare its first trust. The historical bootstrap direction is a Genesis Trust Bundle plus an authority outside cognition, with measured/boot integrity where the threat model requires it. AB/PG evidence adds the stricter rule: a root cannot prove its own currentness from artifacts whose security meaning depends on that same root; recovery cannot become an independent root by validating its own recovery chain.

## Root decision
The next architectural boundary is not a generic Trust Registry. It is a **Genesis Trust Foundation**: the bounded, explicit source of initial trust from which Nexo may establish the constitutional regime.

## Minimum semantic contract
1. `genesisTrustReference`: identity of the governed bootstrap trust basis.
2. `rootAuthorityBasis`: the independently recognized basis that makes the genesis reference trusted under Nexo's threat model.
3. `constitutionBinding`: the constitutional regime permitted to be established from that basis.
4. `integrityContext`: only integrity/boot/artifact facts required by the root contract.
5. `independenceContext`: dependencies/failure-domain information required to show the root is not merely downstream of the candidate authority being established.
6. `validityContext`: currentness, revocation, succession/recovery conditions required by the root contract.
7. `establishmentProvenance`: protected evidence produced by the bootstrap boundary, not caller-declared provenance.
8. explicit result: `ESTABLISHED | UNKNOWN | INVALID`.

## Critical semantics
`Genesis Trust Foundation != Constitution`.
`Genesis Trust Foundation != Identity`.
`Genesis Trust Foundation != Policy`.
`Genesis Trust Foundation != Mission Authority`.
`Genesis Trust Foundation != Recovery Authority`.
`Genesis Trust Foundation != Execution Authority`.

Possessing the genesis foundation establishes only the basis from which constitutional trust may be recognized.

## No self-bootstrap
Provider/model output, local memory, current state, a recovered snapshot, an epoch number, a hash, a signature, or a provenance record cannot independently create the first trust unless the root contract explicitly defines an independent basis for that artifact.

## Recovery
Recovery can consume the genesis basis to re-establish constitutional state, but cannot replace it with a recovery artifact that authenticates itself. If the original basis is unavailable and no separately governed succession/recovery root exists, remain UNKNOWN/quarantined/bounded-safety-only.

## Future-countereffect constraints
- Do not hard-code one hardware vendor, TPM, cloud KMS, blockchain, human operator, or provider into the semantic Core contract.
- Do not turn `genesisTrustReference` into a universal identity or policy ID.
- Do not equate cryptographic authenticity with semantic correctness/current authority.
- Do not make one mutable local file the root merely because it is protected by the same system it authorizes.
- Do not make recovery a hidden second root.
- Do not require a monolithic bootstrap object containing every future security mechanism.
- Do not introduce a generic trust registry, queue, retry, operation ID, fence, or compatibility layer to compensate for missing root semantics.

## Gate
Before implementation, attack whether this boundary can be independently established under the intended threat model and whether the proposed root basis remains replaceable as hardware/platform/provider architecture evolves.