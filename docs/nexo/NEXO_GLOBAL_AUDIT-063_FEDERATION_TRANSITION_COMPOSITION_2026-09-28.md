# NEXO GLOBAL AUDIT-063 — FEDERATION TRANSITION COMPOSITION
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Objective
Attack the composition of multiple federation transitions: simultaneous trust-root and mapping-authority rotation; overlapping federation epochs; partial rollout across validators; divergent cached bundles; split-brain federation metadata; concurrent revocation and re-keying; recovery after partial trust-domain migration; multiple federation bridges; shared trust roots/common-mode dependencies; and composition of transition certificates.

## External evidence studied

### TUF
TUF explicitly addresses rollback, freeze, fast-forward and mix-and-match attacks. Root version N+1 must be authenticated through thresholds from both the currently trusted root and the new root, and root version progression is stepwise. TUF also requires clients to persist trusted root state. This is strong evidence that independently valid metadata cannot simply be composed into an arbitrary current state: consistency across metadata versions is itself security-relevant. citeturn0search0

### SPIFFE Federation / Trust Domain and Bundle
SPIFFE requires foreign bundles to remain associated with their trust domain, uses a monotonically increasing sequence number when present to represent update ordering/supersession, expects periodic refresh, and describes federation maintenance and termination/re-establishment as lifecycle operations. It also explicitly prohibits merging bundles from different trust domains because doing so can create unintended validation authority. citeturn0search1turn0search2turn0search3

## Findings

### A — Simultaneous root + mapping-authority rotation
A root transition and a mapping-authority transition are separate semantic state machines. Even if each transition is individually authenticated, their combination does not prove that the resulting pair was jointly authorized.

Potential invalid composition:
Root(E2) + MappingAuthority(E1) may be individually valid but semantically stale.
Root(E1) + MappingAuthority(E2) may likewise be inconsistent.

Therefore transition state must bind the relevant federation epochs and mapping epoch rather than independently selecting the newest artifact.

DISTINCTION:
INDIVIDUALLY VALID TRANSITIONS != JOINTLY VALID FEDERATION STATE

### B — Overlapping federation epochs
During rollout, validators can legitimately observe E1 and E2 simultaneously. "Latest observed" cannot by itself define current authority because observation order is not semantic order.

A claim may be:
- valid under E1 historically;
- valid under E2 currently;
- valid during a declared overlap;
- invalid under one and valid under another;
- or UNKNOWN when the validator cannot establish which epoch governs the claim.

DISTINCTION:
MAX OBSERVED EPOCH != SEMANTICALLY CURRENT EPOCH

### C — Partial rollout across validators
Validator V1 may have received E2 while V2 remains on E1. A successful decision by V1 and a successful decision by V2 are not automatically independent evidence for a single global state. They may represent different federation epochs.

This extends the common-mode and independence findings: validator diversity does not establish semantic independence when all validators consume the same transition lineage.

DISTINCTION:
DIVERGENT VALIDATOR STATE != INDEPENDENT EVIDENCE
MULTIPLE VALIDATORS != SINGLE CURRENT FEDERATION STATE

### D — Divergent cached bundle versions
SPIFFE's sequence number provides an ordering signal for bundle updates, while refresh behavior addresses propagation. But a sequence number alone does not establish that all dependent mappings, revocations, or authority transitions corresponding to that bundle have also reached the same state.

Therefore:
BUNDLE SEQUENCE ORDER != COMPLETE FEDERATION STATE ORDER

### E — Split-brain federation metadata
If two authoritative-looking federation metadata states disagree, deterministic "pick newest" logic can manufacture authority unless semantic precedence, authority epoch, scope, and transition compatibility are established.

If both states are authentic but incomparable under the declared authority relation, affected current authorization remains UNKNOWN.

DISTINCTION:
AUTHENTIC CONFLICT != RESOLVED CONFLICT
NEWER METADATA != JUSTIFIED AUTHORITY

### F — Concurrent revocation and re-keying
A revocation can target a root, issuer key, mapping authority, subject/incarnation, or federation relationship. A re-key can create a successor without necessarily inheriting or clearing the revocation.

Composition therefore requires explicit target identity/incarnation, epoch, scope and effective interval.

DISTINCTION:
REKEY != RESTORATION
NEW KEY != NEW AUTHORITY
REVOCATION OF OLD KEY != AUTOMATIC REVOCATION OF SUCCESSOR

### G — Recovery after partial trust-domain migration
A validator restored from an older snapshot can re-enter an obsolete federation epoch. Restoration must not erase later revocation, root rotation, or mapping changes.

A recoverable snapshot is historical state, not automatically current state.

DISTINCTION:
RECOVERABLE STATE != CURRENTLY ADMISSIBLE STATE

### H — Multiple federation bridges
If A→B and B→C bridges are each locally valid, composition A→C is not automatically valid. Each bridge may attenuate, transform, or reinterpret identity, audience, scope, capability, and revocation.

The composed mapping needs explicit semantic preservation for every claim-relevant distinction.

DISTINCTION:
VALID A→B + VALID B→C != PROVEN VALID A→C

### I — Shared roots across federation layers
If several bridges depend on one foreign root, endpoint, mapping registry, or federation directory, apparent bridge diversity may still share a common-mode dependency.

Therefore evidence independence must be evaluated over the dependency graph, not by counting validators/bridges.

DISTINCTION:
MULTIPLE BRIDGES != MULTIPLE INDEPENDENT ROOTS

### J — Transition certificates
A certificate saying "E1 transitioned to E2" proves only what its semantics and authority contract cover. It does not automatically prove:
- every dependent mapping transitioned;
- every validator installed E2;
- every old revocation was propagated;
- no conflicting E2 metadata exists;
- E2 is current for the specific claim;
- or that E2 composes safely with another simultaneous transition.

Therefore transition certificates must remain claim-scoped evidence and cannot bootstrap broader current authority through self-reference.

DISTINCTION:
TRANSITION CERTIFICATE != GLOBAL CURRENT-STATE PROOF

### K — Mix-and-match composition
The combined state
Root(E2) + Bundle(E2) + Mapping(E3) + Revocation(E1)
may contain individually authentic components while never having existed as one authoritative federation state.

TUF's explicit mix-and-match defense is directly relevant as an external analogue: metadata consistency is part of the security property, not merely a serialization concern. citeturn0search0

DISTINCTION:
AUTHENTIC COMPONENTS != AUTHENTIC COMPOSITE STATE

### L — Transition closure requires cross-component compatibility
A candidate deterministic current-state projection requires at least:
TrustDomain/Incarnation
+ FederationRelationship/Epoch
+ Root/Bundle Epoch
+ MappingAuthority/Incarnation/Epoch
+ Bundle Sequence/Freshness
+ Validator State/Observation Point
+ Audience
+ Scope/Capability Translation
+ Revocation/Re-key State
+ Anti-Rollback State
+ Bridge Composition
+ Provenance/CommonMode Closure.

This is an audit boundary only. It is not frozen Nexo protocol and does not prove completeness or minimality.

## Attack matrix

| Attack | Boundary attacked | Result |
|---|---|---|
| Root E2 + mapping E1 | joint transition semantics | UNKNOWN unless compatibility proven |
| Root E1 + mapping E2 | joint transition semantics | UNKNOWN unless compatibility proven |
| Validators split E1/E2 | current-state semantics | cannot infer one global state |
| Divergent bundle caches | freshness + dependent-state closure | UNKNOWN if claim-relevant dependencies diverge |
| Split-brain metadata | precedence/authority | UNKNOWN without admissible precedence |
| Revocation + re-key concurrency | target/incarnation/epoch semantics | UNKNOWN if propagation unresolved |
| Recovery from old snapshot | anti-rollback/revocation | must not silently restore old authority |
| A→B→C bridge | semantic composition | UNKNOWN without composition proof |
| Shared foreign root | independence | independence remains UNKNOWN |
| Transition certificate composition | certificate scope/completeness | cannot manufacture current authority |
| Mixed authentic components | historical co-existence | composite state may never have existed |

## Result
FOUND:
- individually valid federation transitions do not automatically compose;
- federation epochs must be treated as semantic state, not merely version labels;
- partial rollout creates divergent current-state observations;
- bundle sequence/freshness does not alone prove complete federation-state convergence;
- authentic split-brain metadata can remain unresolved;
- revocation and re-keying require explicit target/incarnation semantics;
- recovery must preserve later anti-rollback and revocation state;
- multi-bridge validity does not automatically compose;
- common roots defeat naive evidence-independence counting;
- transition certificates are claim-scoped and cannot bootstrap broader authority;
- authentic components can form a composite state that never existed authoritatively.

NOT CLOSED:
FutureObs_PAA; P_AA quotient congruence; complete federation transition-composition algebra; R1-R5 completeness/minimality; dependency/TCB/evidence reducer completeness; independence/quorum completeness; retention/reconstruction soundness.

NOT PERFORMED:
implementation; formal verification; runtime/fault injection; V21; semantic freeze.

## Global epistemic state — preserve exactly
P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission — GLOBAL-AUDIT-064
Attack federation convergence and observation semantics:
- define and attack convergence vs semantic finality;
- asynchronous validator observations;
- out-of-order bundle propagation;
- duplicate/replayed transition messages;
- missing update intervals;
- partition and healing;
- clock skew versus sequence/epoch semantics;
- eventual consistency claims;
- stale-but-valid metadata during recovery;
- whether convergence certificates can establish claim-relative closure without assuming global synchrony.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.
