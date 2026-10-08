# STEP 7 — Trust Foundation Prerequisite — Minimum Contract Candidate — 2026-10-08

Status: DESIGN CANDIDATE — ATTACK REQUIRED

## Purpose
Define only the root prerequisite that lets Core establish constitutional authority. It must not itself become a general authorization engine.

## Minimum semantic responsibility
The Trust Foundation establishes the recognized root from which Constitution authority may be evaluated. It must provide, through a protected boundary:
1. root identity/reference actually recognized by Nexo;
2. trust basis/provenance explaining why that root is recognized;
3. currentness status under the governing trust rules;
4. revocation/recovery status when those rules require it;
5. required root dependencies and their status;
6. an explicit result of ESTABLISHED | UNKNOWN | INVALID, without turning UNKNOWN into permissive authority.

## Critical distinction
Trust foundation ≠ Constitution.
Trust foundation ≠ Policy.
Trust foundation ≠ current action authorization.
Trust foundation ≠ execution.
Trust foundation establishes only the basis from which the Constitution can be recognized.

## Recovery rule
A recovered snapshot may be evidence about the root, but cannot by itself become the current trust basis unless the governing recovery rules explicitly establish that authority.

## Future-countereffect constraints
- No generic trust registry.
- No provider-selected root.
- No global `trusted=true` flag.
- No version/epoch ordering as trust proof.
- No self-authenticating provenance field.
- No universal cryptographic abstraction invented before a concrete contract requires it.
- No queue/retry/ID/fence added to compensate for missing trust.
- No legacy metadata promotion.

## UNKNOWN
If the trust basis, currentness, revocation/recovery status, or required root dependency is unavailable or contradictory, Trust Foundation result remains UNKNOWN/INVALID according to governed semantics; downstream Constitution/Policy boundaries must not manufacture authority.