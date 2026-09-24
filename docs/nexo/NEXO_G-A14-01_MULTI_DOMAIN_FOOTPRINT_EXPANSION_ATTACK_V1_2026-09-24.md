# NEXO G-A14-01 — MULTI-DOMAIN FOOTPRINT EXPANSION ATTACK V1 — 2026-09-24

## Research-first cross-check

PostgreSQL's current transaction-isolation documentation states that serializable execution must be equivalent to some serial order and notes that business rules depending on concurrent reads require protection against read/write dependencies. Its predicate-locking discussion is relevant because conflicts can arise from predicates/ranges, not only identical row keys. This supports the distinction between an effect key and the broader protected conflict relation.

## Attack

Protected domains: D1, D2, D3.

Effect A initially has Footprint(A) = {D1}.
Effect B initially has Footprint(B) = {D2}.

Now A expands dynamically before final execution: Footprint(A) = {D1,D3}.
B also expands: Footprint(B) = {D2,D3}.

If the system continues using the old admission relation, it can incorrectly treat A and B as independent even though both now depend on D3.

Therefore a footprint result is an admission precondition with a validity lineage.

## Multi-domain consequence

A single conflict_domain_id is insufficient for effects spanning multiple protected domains. The minimum representation must support a bounded set of protected domains or an equivalent canonical conflict relation.

An effect may safely linearize independently from another only if their protected domains are disjoint under the current invariant/context.

## Dynamic expansion consequence

A footprint epoch must invalidate an admission when any relevant domain changes, including footprint expansion, invariant/policy change, dependency graph version change, domain membership change, migration changing ownership/boundaries, or recovery/lifecycle changes altering protected conflict scope.

A single global epoch would be safe but may unnecessarily serialize the whole system. Per-domain epochs plus an admission-bound set are a candidate for preserving concurrency.

## False-negative attack

If an analyzer incorrectly reports Footprint(A) = {D1} while the real protected footprint is {D1,D3}, no epoch mechanism can repair the semantic error.

Therefore CURRENT(footprint) is necessary but insufficient.

The protected validator needs a soundness contract: ActualProtectedDependencies ⊆ ProtectedFootprint.

If soundness cannot be established, the result must be UNKNOWN/conservative and cannot authorize independent coordination.

## Candidate minimum semantics

For each admission:
- canonical protected-domain set or equivalent conflict relation;
- per-domain currentness/epoch lineage;
- context binding (policy, invariant, VersionSet, dependency-graph version);
- explicit UNKNOWN state;
- validator assurance/soundness status.

The full dependency graph and raw analysis payload remain outside the linearization machine.

## Important distinction

Footprint epoch proves freshness of a footprint result. It does NOT prove that the footprint is complete.

Two obligations exist:
1. SOUNDNESS: the protected footprint over-approximates actual protected dependencies.
2. CURRENTNESS: the accepted footprint remains valid under the current protected context.

Both are required.

## Result

The hypothesis single monotonic epoch + bounded conflict-domain set survives the freshness attack only if soundness is separately guaranteed. A single epoch alone is insufficient.

A literal full graph remains unnecessary for the minimum state.
A literal single conflict-domain identifier is rejected for multi-domain effects.

Strongest current candidate: AdmissionFootprint = bounded protected-domain relation + per-domain/currentness lineage + context + soundness status.

## Status

Research/adversarial result, not formal proof.
SANY/TLC not executed.
Implementation gate remains CLOSED.
