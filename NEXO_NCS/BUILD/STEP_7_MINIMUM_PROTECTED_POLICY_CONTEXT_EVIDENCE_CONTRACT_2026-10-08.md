# STEP 7 — Minimum Protected PolicyContext Evidence Contract — 2026-10-08

Status: DESIGN CANDIDATE — NOT IMPLEMENTED

## Purpose
Represent evidence established by the protected Core boundary without turning the representation itself into an authority token.

## Minimum semantic shape

ProtectedPolicyEvidence:
- policyRef: id, semanticVersion, hash;
- evaluationContext: detached claim/mission context required by governed policy;
- policyContent: governed semantic content or authoritative content reference established by the protected boundary;
- checks: applicability, dependencies, temporal;
- provenance: evidence describing how the protected boundary established the evidence;
- materiality: facts needed to know whether re-evaluation is required after a material change.

Each check carries evidence/facts, not a caller-declared final resolver status.

## Critical distinction
The representation does NOT contain authority, authorization, admission, SAFE_COMMIT, execution, commit, or external-effect outcome.

Fields named authoritative, trusted, or verified cannot create authority.

## Binding requirements
The protected boundary must establish that policyRef, evaluationContext, policyContent and claim-critical evidence belong to the same resolution context. The representation must be immutable and detached once established.

## UNKNOWN
Missing or unresolved claim-critical evidence remains UNKNOWN at evaluation. The evidence container must preserve absence rather than replacing it with a default.

## Dependency semantics
The representation records resolved dependency evidence relevant to governed roots. It does not declare arbitrary dependency-array completeness.

## Temporal semantics
The representation carries governed temporal facts when required. It does not interpret missing expiry as infinite validity.

## Provenance
Provenance records the protected establishment path/evidence. It is evidence for the evaluator, not a self-authenticating authority field.

## Future-countereffect
The shape is semantic rather than tied to one policy store, provider, ID service, queue, retry system, or transaction mechanism.

## Decision
This is the smallest candidate representation. Before implementation, attack whether policyContent/reference, evaluationContext, checks, provenance, or materiality introduce hidden authority, circular trust, identity coupling, or universal dependency semantics.