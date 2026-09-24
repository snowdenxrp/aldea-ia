# NEXO INFORMATION FLOW TRUST BOUNDARY AND PROVENANCE MODEL V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation.

## 1. Research basis

NIST SP 800-160 Rev. 1 treats domain separation as controlling how one domain can influence another and emphasizes that interfaces can weaken separation; trust assumptions must therefore be explicit and bounded. NIST SP 800-53 AC-4 defines information-flow enforcement as controlling where information may travel, and specifically calls out security attributes/metadata and their binding to the data payload. These principles directly support making provenance, trust level and allowed transformation explicit at Nexo boundaries. citeturn0search23turn0search26

## 2. Core distinction

Nexo must never collapse these meanings:

DATA INTEGRITY != DATA TRUTH
DATA TRUTH != DATA AUTHORITY
OBSERVATION != VERIFICATION
PROVENANCE != CORRECTNESS
AUTHENTIC SOURCE != CURRENT SOURCE
TRUSTED CHANNEL != TRUSTED CONTENT
METADATA INTEGRITY != PAYLOAD TRUTH

A correctly signed message can still contain an incorrect observation.
A trusted observer can be stale.
A fresh observation can be unauthorized.
A valid authorization can still be based on obsolete evidence.

## 3. Information object contract

Every safety-relevant datum entering or leaving a protected boundary should have, as applicable:

data_id
source_id
producer_id
observer_id
origin
operation_id
effect_id/effect_key
target fingerprint
payload
schema/version
creation time
observation time
valid-from / valid-until
freshness deadline
provenance chain
trust-root version
policy/invariant context
dependency closure
failure-domain context
integrity status
authorization context
transformation history
classification/trust label
invalidation status.

Not every ordinary datum requires the complete envelope. The envelope becomes mandatory when the datum can influence a protected claim or transition.

## 4. Trust levels

Use semantic states rather than one numeric confidence score.

T0 — UNKNOWN
Origin/context insufficient.

T1 — UNTRUSTED INPUT
Data may be processed but cannot directly support protected authority.

T2 — AUTHENTICATED
Origin/identity is established to the required level.

T3 — CONTEXT-BOUND
Data is bound to exact operation/effect/target/context.

T4 — VALIDATED
Required structural, provenance, freshness and dependency checks passed.

T5 — VERIFIED-FOR-CLAIM
The datum/evidence set satisfies the requirements of a specific claim under a specific verification context.

T5 is claim-specific and cannot be treated as universal truth.

A T5 result for one claim does not automatically become T5 for another.

## 5. Trust promotion rules

Promotion must be explicit:

T0 → T1
when accepted as untrusted input.

T1 → T2
only after required source/authentication checks.

T2 → T3
only after exact context binding.

T3 → T4
only after structural/provenance/freshness/dependency validation.

T4 → T5
only through the claim's verification contract.

No component may silently promote:
T1 → T5
T2 → Authority
T4 → unrestricted truth.

## 6. Trust downgrade / invalidation

Any of the following may invalidate or downgrade data/evidence:

- source compromise;
- trust-root change;
- policy/invariant change;
- VersionSet change;
- dependency closure change;
- target/effect mismatch;
- freshness deadline;
- clock trust loss;
- observer revocation;
- schema/semantic change;
- reconciliation generation change;
- authority epoch change where binding is required;
- rollback to older state;
- suspected replay;
- common-mode independence collapse;
- recovery;
- decommission;
- migration.

Result must be explicit:
VALID → STALE
VALID → INVALIDATED
VALID → RESTRICTED
CLAIM ACCEPTED → CLAIM REQUIRES REVALIDATION

No silent continuation.

## 7. Provenance preservation

A transformation must preserve enough provenance to answer:

WHO produced this?
FROM WHAT?
UNDER WHICH CONTEXT?
WHEN?
WITH WHICH VERSION?
THROUGH WHICH TRANSFORMATIONS?
USING WHICH DEPENDENCIES?
FOR WHICH OPERATION/EFFECT?
UNDER WHICH AUTHORITY?

If a transformation destroys required provenance, the resulting datum cannot support claims that require that provenance.

## 8. Taint propagation

For protected reasoning, use conservative taint semantics.

If an output depends materially on an input whose trust state is UNKNOWN/UNTRUSTED, the output cannot silently become trusted.

Conceptually:

trust(output) <= minimum(required trust of critical inputs)

unless a separately verified transformation establishes a stronger claim.

This is not a universal mathematical rule for all data processing; it is the default safety rule for authority-relevant transformations.

## 9. Transformation classes

F0 — Copy
Preserves payload/provenance.

F1 — Normalize
May change representation but must preserve semantic identity and provenance.

F2 — Aggregate
Combines multiple inputs; output provenance must retain relevant source set.

F3 — Infer
Creates derived information; inference cannot inherit authority merely from source authority.

F4 — Summarize
May discard information; therefore cannot claim stronger assurance than the retained evidence permits.

F5 — Verify
Produces a claim-bound verification result with a new verification context.

F6 — Authorize
Transforms validated context into an explicit protected admission. This is kernel-only.

F7 — Execute
Crosses into actuation. Requires exact EffectBinding and current admission.

## 10. Critical anti-escalation examples

### Model output

Model:
world observations → reasoning → plan.

The plan remains proposal-level.

It cannot become:
plan → authorization.

### Human input

Human:
instruction → structured request.

The request does not become authority unless the relevant authority contract explicitly grants it.

### External provider response

Provider:
response → observation.

The response does not become:
observation → verified world truth.

### Telemetry

Telemetry:
measurement → evidence candidate.

It does not become:
measurement → current world truth
unless the evidence contract establishes the necessary source, freshness and independence.

### Reward

Reward:
outcome metric → optimization signal.

It cannot become:
high reward → authorization.

## 11. One-way and restricted interfaces

Where possible, boundaries should constrain information flow direction.

Examples:
- planner can receive kernel state but cannot write kernel authority state;
- evidence producer can submit evidence but cannot accept the claim;
- executor receives an admitted effect but cannot modify the admission;
- stop plane can constrain executor but executor cannot constrain stop;
- recovery can receive checkpoint state but cannot derive authority from it;
- update staging can receive candidate artifacts but cannot bypass active safety admission.

NIST explicitly recognizes one-way flow mechanisms and trusted flow-control mechanisms as ways to constrain cross-domain influence. citeturn0search26turn0search27

## 12. Authority-flow model

The architecture should distinguish:

INFORMATION FLOW
DATA → DOMAIN

CAPABILITY FLOW
CAPABILITY → PRINCIPAL

AUTHORITY FLOW
AUTHORITY CONTEXT → PROTECTED TRANSITION

EFFECT FLOW
AUTHORIZED EFFECT → EXTERNAL WORLD

EVIDENCE FLOW
OBSERVATION → CLAIM

These flows must not be implicitly interchangeable.

In particular:

information flow ≠ authority flow.

A component knowing how to perform an action does not mean it is authorized to perform it.

## 13. Boundary-crossing contract

For every kernel boundary:

INPUT
→ authenticate source
→ validate schema
→ validate context
→ bind operation/effect
→ classify trust
→ check freshness
→ check dependency closure
→ apply permitted transformation
→ preserve provenance
→ enforce output capability
→ record evidence
→ invalidate on relevant context changes.

A failed boundary check must produce an explicit safe result:
REJECT / HOLD / QUARANTINE / UNKNOWN / REVALIDATE.

It must not silently coerce the data into an accepted state.

## 14. Provenance versus common-mode independence

Two observations can have different producer IDs yet share:
- same upstream sensor;
- same database;
- same model provider;
- same administrator;
- same trust root;
- same clock;
- same compromised network.

Therefore provenance must include dependency/failure-domain context when independence matters.

“Two sources agree” is not automatically independent corroboration.

## 15. Claim contamination

If a safety claim depends on evidence E and E becomes invalid:

E INVALIDATED
→ dependent claim identified
→ claim marked stale/invalid
→ release eligibility recomputed
→ affected operation HOLD/RESTRICT/REVALIDATE as required.

This must be a graph operation, not a best-effort notification.

## 16. Interface invariants

FLOW-01: information flow never implies authority flow.
FLOW-02: authenticated origin never implies truthful content.
FLOW-03: provenance never implies correctness.
FLOW-04: trust promotion is explicit and claim-scoped.
FLOW-05: trust downgrade/invalidation is explicit and propagating.
FLOW-06: transformations cannot silently erase required provenance.
FLOW-07: untrusted input cannot directly create protected authority.
FLOW-08: inferred/model-generated content cannot silently acquire authority.
FLOW-09: external observations cannot directly become verified-world truth.
FLOW-10: metadata used for flow decisions must be integrity-bound to its payload.
FLOW-11: independence claims include dependency/failure-domain closure.
FLOW-12: claim invalidation propagates to all dependent release decisions.
FLOW-13: stale/replayed data cannot silently become current.
FLOW-14: trust context changes can invalidate previously valid evidence.
FLOW-15: cross-domain interfaces fail closed or enter explicit restricted states when required trust context is unavailable.
FLOW-16: a component cannot raise the trust classification of its own output solely by self-assertion.
FLOW-17: authorization-producing transformations are restricted to the authoritative kernel.
FLOW-18: changing a trust label, provenance rule or promotion rule is a safety-relevant architecture change.

## 17. Result

The previous capability matrix can now be extended with a second graph:

AUTHORITY GRAPH:
principal → capability → protected transition.

INFORMATION GRAPH:
source → data → transformation → destination → claim.

The key safety property is:

**the information graph may influence the authority graph only through explicitly verified promotion points.**

That gives Nexo a hard boundary against a major class of semantic escalation:

untrusted information
→ inference
→ confidence
→ decision
→ authority

must NOT happen implicitly.

The valid path is:

observation
→ provenance/context binding
→ validation
→ claim-specific verification
→ explicit authorization contract
→ protected transition.

## 18. Next research gate

The next pass should combine this model with the state-transition graph and produce a **canonical threat-driven data/authority flow matrix**.

For every protected transition, we will identify:
- inputs;
- trust levels;
- transformations;
- authority dependencies;
- evidence dependencies;
- forbidden flows;
- downgrade conditions;
- race conditions;
- common-mode dependencies;
- formal variables;
- verification obligations.

Only after that can we judge whether the proposed kernel boundary is semantically complete.

Architecture remains blocked.