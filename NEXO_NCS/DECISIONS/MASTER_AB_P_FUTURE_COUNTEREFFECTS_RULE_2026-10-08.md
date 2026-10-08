# NCS — MASTER + AB + P + FUTURE COUNTEREFFECTS RULE

Date: 2026-10-08

## Purpose
Extend the permanent evidence-integration rule so architectural research evaluates both immediate usefulness and future architectural consequences.

## Required reasoning sequence
Before defining, changing, or advancing an architectural boundary:

1. MASTER — what Nexo must preserve.
2. AB — what historical evidence demonstrated and what must not be repeated.
3. P/P112 — research, cross-checks, hypotheses, and unresolved gaps.
4. Future countereffects — identify ways a seemingly useful mechanism could become harmful as Nexo evolves.
5. NCS — translate only sufficiently supported conclusions into the minimum explicit Core contract.

## Future-countereffect review
Every researched mechanism or architectural proposal must be examined for:
- current benefit;
- future coupling or lock-in;
- hidden dependency;
- scalability or state-growth pressure;
- provider/model/device migration constraints;
- recovery, reconciliation, or observability consequences;
- authority/security boundary erosion;
- semantic ambiguity introduced by convenience;
- whether today's shortcut becomes tomorrow's compatibility layer or patch.

## Acceptance rule
A mechanism is not accepted merely because it makes the current test pass.

If it solves today's problem but creates a structural future dependency, the dependency must be made explicit and evaluated before adoption.

If evidence shows a contradiction with MASTER, CORE, frozen AB evidence, or sufficiently strong P evidence:
- STOP;
- preserve UNKNOWN/PENDING where appropriate;
- investigate the contradiction;
- redesign the root contract;
- do not hide it with a patch, assumption, compatibility layer, or silent migration.

## No mechanism invention
Future-risk analysis does NOT authorize speculative machinery. Do not invent IDs, queues, retries, tombstones, transaction wrappers, caches, fencing, effect protocols, or compatibility layers merely because they might be useful later.

## Decision record requirement
For meaningful architectural decisions, record:
- MASTER constraint;
- AB evidence;
- P/P112 research;
- current benefit;
- identified future countereffects;
- resulting NCS contract;
- remaining UNKNOWN/PENDING;
- why the evidence is sufficient;
- what was deliberately rejected and why.

## Scope
This rule applies to research-backed decisions across Core, observation/provenance, admission, authority, validation, commit, reconciliation, memory, missions, tools, providers, evolution, distributed continuity, and future external effects.

It complements and does not replace the existing MASTER + AB + P evidence-integration rule.
