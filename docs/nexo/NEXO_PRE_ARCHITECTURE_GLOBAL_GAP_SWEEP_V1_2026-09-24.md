# NEXO PRE-ARCHITECTURE GLOBAL GAP SWEEP V1 — 2026-09-24

Status: RESEARCH / PRE-CONSTRUCTION GATE
Decision: ARCHITECTURE REMAINS BLOCKED

## 1. Purpose

This is a second-pass review across the accumulated V1–V20 lineage, post-V20 research, canonical distillation, state/ownership work, atomicity, linearization, common-mode analysis, TCB, information flow, refinement and trace observability.

The objective is not to add another local patch. The objective is to ask:

**What assumption, boundary, state, lifecycle, authority, dependency, failure mode, evidence requirement or verification obligation could still be missing before a clean architecture is allowed to exist?**

NIST SP 800-160 Rev. 1 explicitly treats requirements, architecture, implementation, integration, verification, validation, review, risk treatment and lifecycle activities as parts of systems security engineering. It also states that verification provides objective evidence and establishes traceability. citeturn0search0turn0search5

NIST SP 800-53 also separates control families covering audit/accountability, configuration management, contingency planning, identification/authentication, incident response, maintenance, supply chain, system integrity and assessment/monitoring. This supports checking the architecture beyond the narrow execution kernel. citeturn0search1

## 2. Current conclusion

The research base is substantially more complete than the V1–V20 models, but the following gaps must remain OPEN until explicitly resolved.

No gap below is silently promoted to a guarantee.

---

# 3. GAP GROUP A — SYSTEM BOUNDARY

## G-01 System-of-systems boundary

We have defined the Nexo core and many external dependencies, but the final architecture still needs an explicit system boundary diagram showing:

Nexo core
→ supporting services
→ infrastructure
→ external providers
→ external world
→ humans
→ governance
→ recovery/update authorities.

Required decision:
Every component must be classified as:
TRUSTED CORE / CONTROLLED SUPPORT / EXTERNAL DEPENDENCY / UNTRUSTED INPUT / EXTERNAL WORLD.

Why open:
Without this, TCB and refinement boundaries can still move implicitly.

## G-02 Physical/environmental boundary

The current model is predominantly digital.

Still open:
power loss, thermal/resource limits, physical host compromise, hardware degradation, device reset, sensor failure, actuator failure and environmental hazards.

Required:
Define which physical assumptions are in-scope, out-of-scope or represented as explicit external UNKNOWN/failure states.

## G-03 Human operational boundary

Human roles were researched, but architecture still needs explicit contracts for:

operator availability;
operator ambiguity;
emergency intervention;
handoff;
conflicting authorities;
approval expiry;
approval revocation;
automation bias;
unsafe UI interpretation;
operator compromise.

A human action must have exact scope and effect identity before it can influence protected authority.

---

# 4. GAP GROUP B — AUTHORITY / TRUST

## G-04 Authority lifecycle completeness

Current authority work covers issue, expiry, revocation, epochs and fencing.

Still required:
bootstrap authority;
delegation;
renewal;
rotation;
key/trust-root rollover;
emergency authority;
authority migration;
authority recovery;
authority decommissioning.

Open question:
Can every authority context be proven to have exactly one valid origin and an auditable lineage?

## G-05 Trust-root rollover

Trust roots are protected, but root rotation can invalidate:

identity;
signatures;
evidence;
update artifacts;
recovery artifacts;
historical interpretation.

Required:
A trust-root change must trigger dependency impact analysis and explicit evidence invalidation where appropriate.

## G-06 Credential/key lifecycle

Authentication was treated as a dependency, but the clean architecture still needs:
issuance;
rotation;
expiry;
revocation;
compromise;
recovery;
algorithm/key migration;
stale credential behavior.

No stale credential may retain protected capability merely because an old process still holds it.

---

# 5. GAP GROUP C — STATE / ATOMICITY

## G-07 Authoritative-store topology

A/B/C topology analysis remains open.

Before implementation we must decide:
single authoritative state machine;
transactional partition;
protocolized multi-store state;
or an explicitly bounded hybrid.

This is not an implementation detail. It determines the semantics of:
authorization;
STOP;
recovery;
update activation;
decommission;
evidence invalidation.

## G-08 Cross-store atomicity

We have identified atomicity bundles, but not yet selected the actual commit/recovery protocol.

Open:
What happens if:
state commit succeeds and audit fails;
audit commits and state fails;
policy changes between reads;
stop activates during commit;
recovery acquires while execution commits;
decommission closes while recovery is pending?

Every case needs a deterministic semantic outcome.

## G-09 Durable ordering / crash recovery

Durability classes P0/P1/P2 exist, but the architecture still needs exact durability guarantees and recovery protocol for each P0 variable.

A statement such as “database is durable” is insufficient.

Need:
write ordering;
fsync/commit semantics;
snapshot semantics;
rollback detection;
journal semantics;
corruption handling;
partial-write handling.

---

# 6. GAP GROUP D — TIME / ORDER

## G-10 Trusted time

We correctly separated EVENT_TIME, OBSERVATION_TIME and AUTHORITATIVE_ORDER.

Still open:
What trusted time source exists for lease expiry, freshness deadlines and evidence validity?

Required:
clock failure;
clock rollback;
clock jump;
clock partition;
source disagreement;
time synchronization loss.

No wall-clock anomaly may create authority or erase UNKNOWN.

## G-11 Monotonicity across restart

We need explicit protection against:
counter rollback;
storage snapshot rollback;
restored old generation;
restored old epoch;
restored old sequence.

Every monotonic safety variable needs rollback detection or a fencing mechanism.

---

# 7. GAP GROUP E — EXTERNAL WORLD

## G-12 External effect reconciliation semantics

We have exact effect identity and UNKNOWN, but reconciliation remains an architectural hard point.

Need concrete semantics for:
idempotent provider;
non-idempotent provider;
partial application;
provider timeout;
provider replay;
provider lies;
provider state unavailable;
provider eventually consistent state;
provider changes schema/meaning.

A provider response is observation, not automatically verified truth.

## G-13 Compensation/reversal

We have reversibility metadata, but no complete canonical semantics for:

REVERSE_REQUESTED
REVERSE_ATTEMPTED
REVERSE_UNKNOWN
REVERSED
REVERSAL_VERIFIED.

Important:
reversal itself is another external effect and must receive a new exact identity and evidence chain.

---

# 8. GAP GROUP F — EVIDENCE / VERIFICATION

## G-14 Evidence graph scalability

We have dependency closure and invalidation semantics.

Still open:
How are millions of dependent claims/evidence records invalidated without stale claims surviving in caches?

Need:
dependency index;
incremental invalidation;
full recomputation fallback;
bounded staleness;
crash recovery;
proof of no stale admission.

## G-15 Negative evidence

Positive evidence has received substantial attention.

Negative assertions remain less formal:

NO_EFFECT
NOT_APPLIED
NO_ACTIVE_WORK
NO_PENDING_DELEGATION
NO_REMAINING_CREDENTIAL
NO_EXTERNAL_EFFECT.

These are often harder to prove than positive observations.

Architecture must explicitly define what evidence can justify each negative claim.

## G-16 Evidence retention and deletion

We researched deletion semantics but have not yet integrated them into the verification lifecycle.

Need distinguish:
retention required;
legal/policy deletion;
cryptographic erasure;
backup copies;
derived indexes;
cached evidence;
proof artifacts.

Deletion must not silently make a still-active safety claim unverifiable.

---

# 9. GAP GROUP G — OBSERVABILITY

## G-17 Observability completeness

Trace contract exists, but we have not yet established that every safety-relevant state variable has an observable transition boundary.

Need matrix:

STATE VARIABLE
→ AUTHORITATIVE OWNER
→ MUTATION TRANSITIONS
→ REQUIRED EVENTS
→ DURABILITY
→ OBSERVER
→ INDEPENDENCE
→ RECONSTRUCTION RULE
→ FAILURE SEMANTICS.

If a safety variable can change without observable evidence, runtime refinement becomes incomplete.

## G-18 Observability circularity

We must prevent:

component A verifies B using evidence generated by B;
verifier V verifies A using evidence generated by A;
audit system verifies itself using its own mutable state.

Required:
claim-specific independence and common-mode analysis.

---

# 10. GAP GROUP H — CHANGE / UPDATE / MIGRATION

## G-19 Configuration authority

We have VersionSet and update admission, but configuration changes need the same rigor as software updates.

Scope includes:
policy;
thresholds;
feature flags;
schemas;
model versions;
prompts/templates where safety-relevant;
dependency endpoints;
trust roots;
clock configuration;
resource limits.

A “configuration-only” change can alter safety semantics.

## G-20 Schema/data migration

This remains explicitly open from the historical PG-009 semantic/data migration gap.

Required:
old/new schema semantics;
dual-read/write if needed;
migration fencing;
concurrent-write handling;
rollback restrictions;
evidence compatibility;
UNKNOWN effects;
migration provenance;
post-migration verification.

Migration must not be treated as ordinary deployment.

## G-21 Formal-model evolution

Changing a state variable, invariant, transition or semantic definition can invalidate:
formal proofs;
refinement mappings;
fixtures;
tests;
evidence interpretation;
historical claims.

Required:
formal-model versioning and impact analysis.

---

# 11. GAP GROUP I — RESOURCE / AVAILABILITY

## G-22 Resource exhaustion

This was identified in requirements research but is not yet a canonical protected transition family.

Need explicit treatment of:
CPU;
memory;
storage;
bandwidth;
queue capacity;
concurrency;
API quotas;
model tokens/cost;
energy;
log capacity;
human attention.

Critical rule:
Safety, STOP, recovery and verification resources cannot be starved by ordinary workload.

## G-23 Denial-of-service / starvation

Safety states must not depend on an unlimited ability to allocate resources.

Need:
admission under resource pressure;
priority;
backpressure;
bounded queues;
emergency resource reservation;
starvation detection;
recovery under partial resource availability.

---

# 12. GAP GROUP J — MULTI-AGENT / DELEGATION

## G-24 Delegation lifecycle

We have scope containment, but full lifecycle remains to be integrated:

DELEGATE
→ ACCEPT
→ ACTIVE
→ RENEW
→ REVOKE
→ EXPIRE
→ DRAIN
→ CLOSED.

Need races against:
STOP;
decommission;
authority revocation;
recovery;
migration;
external UNKNOWN.

## G-25 Multi-agent shared-world semantics

Two agents can independently hold valid local authority while producing conflicting effects.

Need exact semantics for:
conflict;
serialization;
shared target;
shared resource;
cross-agent stop;
global mission constraint;
delegated authority;
common-mode infrastructure.

Local validity must not be mistaken for global safety.

---

# 13. GAP GROUP K — SECURITY / ADVERSARIAL

## G-26 Compromised privileged component

We have compromised executor/observer/provider scenarios, but the clean architecture still needs a formal statement of what happens if each candidate TCB component is compromised.

For each TCB element:
WHAT BREAKS?
WHAT REMAINS PROTECTED?
WHAT DETECTS IT?
WHAT FENCES IT?
WHAT RECOVERS IT?
WHAT CLAIMS BECOME INVALID?

## G-27 Unknown/novel failure containment

We have UNKNOWN semantics, but architecture needs a general rule for failures that do not match a known category.

Unknown failure must remain unknown and enter the conservative control path rather than being coerced into a known-success state.

---

# 14. GAP GROUP L — DECOMMISSIONING

## G-28 Full decommission proof

Decommission closure has been designed but not yet fully tested.

Need proof/evidence for:
identity revoked;
delegations closed;
workers terminated;
leases closed;
pending effects reconciled;
secrets handled;
recovery disabled;
update disabled;
credentials revoked;
backups/data handled;
external integrations fenced;
no stale snapshot can resurrect authority.

Decommission must be terminal with respect to protected authority unless an explicitly separate re-provisioning process creates a new identity/context.

---

# 15. GAP GROUP M — TEST / FORMAL TOOLCHAIN

## G-29 Actual formal tool execution

Still OPEN:
SANY;
TLC;
configuration validity;
state-space bounds;
symmetry assumptions;
counterexample reproduction.

No historical “designed” result may be promoted to formally checked without actual current execution.

## G-30 Runtime correspondence testing

Need automated tests that compare:

expected abstract transition
vs
actual implementation trace.

This is different from ordinary unit/integration testing.

## G-31 Fault injection

Required before architecture maturity:
crash;
partition;
stale actor;
storage rollback;
clock failure;
trust-root compromise;
dependency compromise;
observer compromise;
update crash;
migration interruption;
external UNKNOWN;
duplicate/replay;
resource exhaustion.

## G-32 Long-duration / rollover tests

Still open:
epoch rollover;
generation rollover;
sequence rollover;
log rotation;
key rotation;
certificate rotation;
version retention;
large evidence graphs;
long-running UNKNOWN effects;
recovery after months of accumulated history.

---

# 16. GAP GROUP N — REQUIREMENTS / TRACEABILITY

## G-33 Complete bidirectional traceability

Need final chain:

Stakeholder need
→ requirement
→ invariant/constraint
→ architectural boundary
→ state variable
→ transition
→ implementation element
→ test/formal check
→ evidence
→ operational claim.

And reverse:

Failure
→ evidence
→ affected claim
→ invariant/requirement
→ architecture
→ corrective change
→ re-verification.

NIST explicitly identifies traceability as evidence supporting assurance/trustworthiness claims. citeturn0search5

## G-34 Requirement conflict resolution

We have precedence concepts but need a canonical mechanism for conflicting requirements.

Example:
availability vs safety;
operator request vs safety invariant;
mission objective vs external constraint;
performance vs evidence retention.

No implementation component should resolve these conflicts ad hoc.

---

# 17. GAP GROUP O — PRIVACY / DATA SEMANTICS

## G-35 Data truth vs data authorization vs data integrity

The distinction exists conceptually but needs complete lifecycle integration.

Every safety-relevant datum must answer:
is it authentic?
is it structurally valid?
is it authorized for this use?
is it semantically current?
is it actually true?
is it fresh?
can it be used for this claim?

## G-36 Privacy-induced evidence loss

Redaction, deletion, minimization and retention policies can conflict with forensic/verification needs.

Need an explicit policy for when privacy transformations preserve, weaken or invalidate evidence.

---

# 18. GAP GROUP P — SAFETY-CLAIM SEMANTICS

## G-37 Claim expiry

Claims can become stale due to:
time;
policy;
VersionSet;
dependency;
trust-root;
authority;
observer;
common-mode;
world-state;
schema;
migration.

Need explicit claim TTL/expiry/revalidation semantics.

## G-38 Assurance degradation recovery

We have:

NORMAL
→ ASSURANCE_DEGRADED
→ RESTRICT/HOLD/QUARANTINE
→ REVALIDATE
→ RESTORE.

Still open:
What evidence is sufficient to move upward?

Recovery from degraded assurance must not be easier than entering degraded assurance.

---

# 19. GAP GROUP Q — GOVERNANCE / SEPARATION OF DUTIES

## G-39 Safety-change governance

Changing:
trust root;
safety invariant;
authority model;
formal semantics;
evidence semantics;
recovery semantics

must not be equivalent to changing a normal configuration value.

Need explicit change classes and approval/verification paths.

## G-40 Separation-of-duties enforcement

Candidate separation exists for:
execution;
STOP;
recovery;
policy change;
trust-root change;
decommission.

Still open:
How is SoD enforced structurally rather than represented as a boolean or organizational convention?

---

# 20. GAP GROUP R — SUPPLY CHAIN / DEPENDENCY

## G-41 Builder/CI compromise

Dependency closure includes builders and artifact sources, but the architecture needs explicit handling when the builder itself is compromised.

Required:
provenance;
attestation;
independent verification;
reproducibility where possible;
trust-root separation;
emergency quarantine.

## G-42 Dependency semantic drift

A dependency may remain authentic and available while changing behavior or semantics.

Therefore:
AUTHENTIC + AVAILABLE != SEMANTICALLY_COMPATIBLE.

Dependency changes must trigger compatibility and claim-impact analysis.

---

# 21. GAP GROUP S — RECOVERY COMPLETENESS

## G-43 Recovery of recovery

What happens if the recovery authority itself crashes or becomes unavailable while holding a RecoveryFence?

Need:
recovery-owner fencing;
handoff;
stale recovery owner rejection;
persistent recovery intent;
recovery-of-recovery semantics.

## G-44 Recovery under corrupted durable state

If the authoritative store is partially corrupted, checkpoint restore may itself be unsafe.

Need:
integrity verification;
version compatibility;
rollback detection;
independent recovery evidence;
quarantine when state integrity cannot be established.

---

# 22. GAP GROUP T — ARCHITECTURAL COMPLEXITY

## G-45 Safety mechanism explosion

The research has accumulated many epochs, generations, fences, fingerprints, claims, evidence records, versions and lifecycle states.

This creates a new risk:

**the architecture becomes internally correct in pieces but impossible to reason about as a whole.**

Before construction we need:
- minimum state set;
- minimum TCB;
- minimum number of authorities;
- canonical vocabulary;
- derived-state reduction;
- proof decomposition;
- invariant ownership;
- state-machine compositionality.

Adding a mechanism must remove or justify an equivalent older mechanism.

## G-46 Semantic duplication

Potential duplicate concepts still require one final normalization pass:

authority epoch vs lifecycle epoch;
gate epoch vs safety epoch;
recovery epoch vs recovery generation;
lease generation vs coordination epoch;
claim validity vs assurance state;
evidence validity vs evidence trust level.

These may be distinct, but each must have exactly one semantic definition.

---

# 23. NEW META-GAP — ARCHITECTURE SELF-VERIFICATION

## G-47 Architecture must verify its own boundaries without self-authorizing

We have studied verification of operations, evidence and implementation.

We still need a meta-level contract for architectural change:

Who determines that the architecture itself has satisfied its gates?

The verifier must not be able to silently modify the rules that define what counts as verification.

Therefore:
ARCHITECTURE BASELINE
→ CHANGE CLASSIFICATION
→ IMPACT ANALYSIS
→ INDEPENDENT REVIEW/VERIFICATION
→ NEW BASELINE.

Changing the verification criteria itself must be a governed safety-relevant change.

---

# 24. NEW META-GAP — CLAIM COMPOSITION

## G-48 Individually valid claims may compose unsafely

Example:

Claim A: authority valid.
Claim B: evidence valid.
Claim C: dependency closure valid.
Claim D: stop not active.

It does not automatically follow that:

A ∧ B ∧ C ∧ D = safe release

unless their contexts, versions, failure domains and linearization points are compatible.

Need explicit claim-composition rules.

This is a major remaining architecture gate.

---

# 25. NEW META-GAP — ASSUMPTION BUDGET

## G-49 Assumptions need an explicit budget

The architecture now has many assumptions:
clock;
storage;
identity;
crypto;
scheduler;
external provider;
observer;
operator;
dependency;
common-mode independence;
hardware;
network;
resource availability.

Need classify assumptions:

A0 guaranteed by TCB
A1 enforced by architecture
A2 monitored and fail-closed
A3 externally assumed
A4 unknown/unverified.

A safety claim must not silently depend on A3/A4 as though they were A0/A1.

---

# 26. NEW META-GAP — FAILURE COMPOSITION

## G-50 Multiple individually handled failures

Most failure analysis is currently pairwise.

We still need bounded composition for combinations such as:

STOP + partition + stale actor
UPDATE + crash + storage rollback
RECOVERY + UNKNOWN + observer loss
DECOMMISSION + delayed message + snapshot restore
TRUST-ROOT rollover + evidence invalidation + recovery.

The clean architecture needs a rule for which combinations must be model-checked and which are handled compositionally.

---

# 27. PRE-CONSTRUCTION GATE

Architecture construction remains blocked until these categories are classified:

1. System boundary
2. Authority lifecycle
3. State/atomicity
4. Time/order
5. External effects
6. Evidence
7. Observability
8. Update/migration
9. Resources/availability
10. Multi-agent/delegation
11. Adversarial compromise
12. Decommission
13. Formal/toolchain
14. Requirements/traceability
15. Privacy/data semantics
16. Claim semantics
17. Governance/SoD
18. Supply chain
19. Recovery completeness
20. Complexity/semantic duplication
21. Architecture self-verification
22. Claim composition
23. Assumption budget
24. Failure composition

## 28. Gate rule

A category does not need to be completely solved before architecture starts.

But every category must be classified as exactly one of:

CLOSED — semantics and verification boundary sufficiently defined;
DESIGNATED — intentionally external assumption with explicit boundary;
REWORK — existing mechanism must be redesigned before use;
OPEN — unresolved and therefore cannot support a guarantee;
REJECTED — mechanism must not enter the clean architecture.

No category may remain “implicitly handled.”

## 29. Current gate result

Architecture: BLOCKED.

Formal model: BLOCKED pending unification/tool execution.

Implementation: BLOCKED for clean architecture.

Runtime enforcement: OPEN.

Fault injection: OPEN.

Migration: OPEN.

Claim composition: OPEN.

Assumption budget: OPEN.

Failure composition: OPEN.

Architecture self-verification: OPEN.

## 30. Mandatory next sequence

1. Build the final gap classification matrix.
2. Resolve semantic duplicates.
3. Define canonical vocabulary.
4. Define assumption classes.
5. Define claim-composition semantics.
6. Define failure-composition strategy.
7. Define architecture self-verification/change governance.
8. Re-audit all V1–V20 dispositions against the resulting canonical vocabulary.
9. Only then freeze the architecture requirements.
10. Only after that design the clean architecture.
11. Then formalize.
12. Then implement.
13. Then test.
14. Then fault-inject.
15. Then establish implementation correspondence.
16. Then runtime verify.

## 31. Final status

This document intentionally prevents premature construction.

The research sequence is preserved.

The future clean architecture must be a derivation of the reconciled research, not a new collection of patches.

No V21 implementation is authorized by this document.
