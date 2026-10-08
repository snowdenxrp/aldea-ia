# STEP 7 — Minimum Core Constitution Authority Context Contract — 2026-10-08

Status: DESIGN CANDIDATE — ATTACK REQUIRED

## Root boundary
The Constitution Authority Context is the smallest protected semantic context that lets Core recognize which constitutional regime governs a subsequent Policy binding. It is established from an already-recognized trust foundation; it is not constructed from caller claims.

## Minimum semantic content
1. constitutionRef: id, version, hash of the constitutional regime actually established.
2. authorityDomainContext: the constitutional authority domain relevant to the requested Policy binding.
3. governingRulesContext: only the constitutional rules necessary to evaluate that binding.
4. validityContext: current validity/expiry/revocation/recovery conditions required by the Constitution.
5. dependencyContext: required trust-root/authority dependencies needed to establish the regime.
6. establishmentProvenance: protected evidence of how Core established the context.

## Capability meaning
Possession of this context means only: Core has established the constitutional regime/context for subsequent governed evaluation.
It does NOT mean the caller is authorized to execute anything.
It does NOT grant a Policy.
It does NOT grant admission.
It does NOT prove a claim.
It does NOT prove world state.

## Anti-self-attestation
Caller-supplied constitutionRef, authorityDomainContext, validity, dependency or provenance fields are ordinary proposal data until established by the protected boundary. Copying them into a new object cannot elevate them.

## Current authority separation
Current constitutional context is not inferred from version number or epoch ordering. If currentness, trust-root continuity, revocation, recovery status or required dependency cannot be established, result is UNKNOWN/HOLD/REVALIDATE.

## Recovery separation
Recovered state, valid snapshot, new epoch and current authority are distinct. A snapshot cannot resurrect authority. Recovery authority must come from the governed trust foundation.

## Future-countereffect
Keep the context semantic and minimal. Do not encode every low-level trust mechanism, store implementation, cryptographic protocol or recovery workflow into this contract. Those remain behind the protected boundary.

## Non-goals
No provider authority, Policy selector, admission, execution, commit, external effect, queue, retry, tombstone, operation identity or new fencing mechanism.