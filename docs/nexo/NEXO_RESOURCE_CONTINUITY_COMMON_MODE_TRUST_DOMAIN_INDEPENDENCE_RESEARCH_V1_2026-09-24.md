# NEXO - RESOURCE CONTINUITY ROOT / COMMON-MODE FAILURE / TRUST-DOMAIN INDEPENDENCE RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

If Nexo, the resource fence, the continuity anchor, the storage, the hypervisor, the KMS, the clock, firmware, or trust root share a failure domain, can the architecture honestly call the resource boundary independent evidence or independent enforcement?

## External cross-checks

NIST SP 800-193 explicitly describes Roots of Trust for update, detection and recovery and notes that these logical roots may share many components. It also describes systems in which one device provides security functions to another, creating a critical trust relationship. Therefore logical separation does not automatically mean independence. citeturn0search36turn0search2

NIST's Roots of Trust material emphasizes that security mechanisms inherit trust from underlying components; a vulnerability in an underlying component can compromise mechanisms relying on it. citeturn0search3

etcd's recovery documentation shows a related operational boundary: snapshot restore creates a new logical cluster identity and may move revisions backward; revision bumping/compaction is used to prevent restored historical revisions from being mistaken for current continuity. citeturn0search1

TLA+ treats properties as properties of all behaviors of the modeled system; consequently any independence assumption placed outside the model remains an assumption unless represented and justified. citeturn0search5

## Core result

A separate process, service, host, storage volume, key, or verifier is not automatically an independent trust domain.

The architecture must distinguish:

`LOGICAL SEPARATION != FAILURE-DOMAIN INDEPENDENCE`

`PROCESS SEPARATION != TRUST INDEPENDENCE`

`DIFFERENT STORAGE != CONTINUITY INDEPENDENCE`

`DIFFERENT KEY != INDEPENDENT ROOT`

`SECOND OBSERVER != INDEPENDENT EVIDENCE`

`DIFFERENT HOST != INDEPENDENT ENFORCEMENT`

## Adversarial common-mode sequence

Assume:

- Nexo authority store on storage S;
- resource fence state on S;
- continuity anchor on S;
- KMS keys controlled by K;
- hypervisor H hosts both Nexo and resource boundary;
- clock service T supplies both;
- firmware F provides both boot chains.

Attack/failure:

1. S rolls back.
2. Nexo restores old authority context.
3. Resource restores old fence.
4. K provides valid signatures for both.
5. H restores both VMs.
6. T provides plausible current timestamps.
7. Nexo observes apparently coherent state.
8. Resource accepts old capability.
9. Two independent-looking components have actually regressed together.

No local checksum necessarily fails.

The failure is common-mode continuity loss.

## New distinction: assurance independence

Candidate definition:

`INDEPENDENT_FOR_CLAIM(A,B,C)`

only if no allowed common failure/dependency can invalidate both A's and B's required properties for claim C, unless that common dependency is explicitly included in the claim assumptions.

This is claim-specific.

Two components may be independent for one claim and not another.

## Failure-domain graph

Candidate object:

`FailureDomainGraph`

Nodes:

- process;
- host;
- VM;
- container/runtime;
- kernel;
- hypervisor;
- storage;
- filesystem;
- network;
- DNS;
- clock;
- identity provider;
- KMS/HSM;
- firmware;
- boot chain;
- trust root;
- policy source;
- configuration source;
- artifact/update source;
- CI/builder;
- provider;
- resource;
- operator/control plane;
- observability;
- recovery store;
- continuity anchor.

Edges:

- SHARES_STORAGE;
- SHARES_HOST;
- SHARES_HYPERVISOR;
- SHARES_KERNEL;
- SHARES_TRUST_ROOT;
- SHARES_KMS;
- SHARES_CLOCK;
- SHARES_NETWORK;
- SHARES_CONTROL_PLANE;
- SHARES_UPDATE_PATH;
- SHARES_IDENTITY;
- SHARES_POLICY;
- SHARES_RECOVERY;
- SHARES_CONTINUITY;
- COMMON_PHYSICAL_RESOURCE;
- COMMON_OPERATOR;
- COMMON_FAILURE_DOMAIN.

## Independence levels

Candidate I0-I5:

- I0: same component / no separation.
- I1: process/service separation only.
- I2: deployment separation with known shared dependencies.
- I3: distinct failure domains with bounded shared dependencies.
- I4: independent enforcement/evidence roots for the claim with explicitly bounded common-mode assumptions.
- I5: independently rooted and independently validated for the claim, including continuity and recovery assumptions.

These are Nexo design categories, not external standards.

## Critical finding

Independence is not binary.

For a claim C:

`Independence(A,B,C)`

depends on:

- failure domain;
- trust root;
- dependency closure;
- continuity mechanism;
- update path;
- recovery path;
- observation path;
- common operator;
- common policy;
- common clock;
- common credential;
- common physical resource;
- claim semantics.

## Independence versus evidence

Suppose:

Observer A reads resource R through cache C.

Observer B reads the same cache C.

A and B can disagree internally, but they do not provide independent evidence about R.

Likewise:

Verifier A and verifier B use the same compromised model artifact.

Different verifier processes do not create independent verification.

Therefore:

`N_OBSERVERS != N_INDEPENDENT_EVIDENCE_ROOTS`

## Independence versus enforcement

Suppose Nexo has:

- coordinator C;
- fence service F;
- resource boundary R.

If C and F both depend on storage S and R trusts S-derived authorization, a storage rollback may defeat all three.

Thus:

`THREE_COMPONENTS != THREE_ENFORCEMENT_ROOTS`

A strong enforcement claim requires analysis of the actual boundary that can reject the effect.

## Continuity root dependence

The Resource Continuity Root itself must have a dependency closure.

Candidate:

`RCR_DEPENDENCY_CLOSURE`

includes:

- continuity anchor;
- storage;
- firmware;
- boot chain;
- key material;
- identity;
- time if used;
- recovery mechanism;
- update mechanism;
- hardware monotonic state if used;
- failover coordinator;
- external fencing service;
- operator path.

If the RCR depends on the same rollback-vulnerable store as the resource fence, it cannot independently prove that the fence survived rollback.

## The circularity attack

Suppose:

Resource says:
`FENCE=120`

because its restored database says:
`FENCE=120`.

Continuity Root says:
`current=120`

because it reads the same database.

Nexo says:
`resource current`

because it trusts the Continuity Root.

This is a circular proof:

`RESOURCE -> DATABASE -> RCR -> NEXO -> RESOURCE`

No independent continuity anchor exists.

Result:

`CONTINUITY_CLAIM = UNKNOWN`

unless the claim explicitly tolerates this dependency.

## Common-mode trust closure

Candidate relation:

`CommonModeClosure(C)`

must include every dependency whose failure can simultaneously invalidate:

- authority;
- fence;
- continuity;
- evidence;
- recovery;
- observation.

The closure is claim-specific.

## Independence claim contract

Candidate `IndependenceClaim`:

- claim_id;
- components;
- properties being claimed;
- failure domains;
- shared dependencies;
- trust roots;
- continuity roots;
- update paths;
- recovery paths;
- common operators;
- common physical resources;
- common credentials;
- common clocks;
- dependency closure;
- excluded failure modes;
- assumptions;
- verification evidence;
- current context;
- invalidation triggers;
- status.

Possible statuses:

`INDEPENDENT_FOR_CLAIM`
`BOUNDED_SHARED_DEPENDENCY`
`NOT_INDEPENDENT`
`UNKNOWN`

## Claim-specific independence

Example:

Claim C1:
`RESOURCE_REJECTS_STALE_CAPABILITY`

May require independence between:

- Nexo verifier;
- resource enforcement.

Claim C2:
`WORLD_DID_NOT_CHANGE`

requires much stronger independence because both the resource and observer may share the same failure.

Therefore the same architecture can support C1 while only supporting a weaker claim for C2.

## Independent evidence versus redundant evidence

Redundancy can improve availability without improving epistemic independence.

Examples:

- two replicas from same snapshot;
- two logs written to same storage;
- two observers reading same cache;
- two signatures from keys under same compromised KMS;
- two models sharing same corrupted dependency;
- two hosts under same hypervisor rollback.

These are redundant evidence paths, not necessarily independent evidence roots.

## Common-mode update attack

Nexo and resource boundary are independently deployed but use the same update artifact.

A malicious or corrupted artifact changes:

- fence comparison;
- revocation semantics;
- restore behavior.

Both components remain cryptographically authentic relative to the same compromised provenance chain.

Therefore:

`SIGNED_COMPONENTS != INDEPENDENT_COMPONENTS`

The update/build/provenance path belongs in the common-mode closure.

NIST's root-of-trust guidance reinforces that roots and chains can share components; this sharing is a trust relationship, not automatic independence. citeturn0search36

## Common-mode KMS attack

If both Nexo and resource verify commands with keys issued by the same compromised KMS:

- both can accept stale authority;
- signatures remain cryptographically valid;
- local authentication succeeds.

Therefore:

`AUTHENTIC != CURRENT`

and:

`SHARED_KEY_ROOT != INDEPENDENT_AUTHORITY`

## Common-mode clock attack

If both use the same compromised or rolled-back wall clock:

- lease expiry;
- token validity;
- evidence timestamps;
- freshness;
- timeout decisions

can all fail together.

Therefore wall-clock agreement does not create independent temporal evidence.

`CLOCK_AGREEMENT != CAUSAL_ORDER`

## Common-mode hypervisor/storage attack

If Nexo and resource run under the same rollback-capable hypervisor/storage domain:

- both may restore;
- both may resume old state;
- both may appear internally coherent;
- both may accept stale authority.

Physical separation is not enough if the same recovery mechanism can roll them back together.

## Independence and failure assumptions

A strong claim can legitimately depend on a shared component if the claim explicitly assumes that component trustworthy.

But then the claim is:

`SAFE | ASSUMPTION(A)`

not:

`SAFE | INDEPENDENT_OF(A)`

The assumption must be:

- explicit;
- current;
- version/context bound;
- included in dependency closure;
- invalidated when its trust status changes.

## No independence by naming

The following names do not establish independence:

- SafetyService;
- IndependentVerifier;
- SecureStore;
- ContinuityRoot;
- RecoveryRoot;
- FenceService;
- TrustedClock.

Their actual dependency graphs determine independence.

## Boundary claim hierarchy

Candidate:

`LOCAL_BOUNDARY_SAFE`
→ `RESOURCE_BOUNDARY_SAFE`
→ `FAILURE_DOMAIN_BOUNDARY_SAFE`
→ `INDEPENDENT_BOUNDARY_SAFE`
→ `MISSION_BOUNDARY_SAFE`

Promotion requires explicit evidence and dependency closure.

## Common-mode failure does not always invalidate all claims

Important asymmetry:

If a shared dependency fails but cannot affect a particular claim's closure, that claim may remain current.

Therefore:

`COMMON_MODE_FAILURE != GLOBAL_INVALIDATION`

But proving disjointness itself is a closure obligation.

If impact is UNKNOWN:

`CLAIM = UNKNOWN/HOLD`

## Candidate theorem

Not formally proven:

For claim C requiring two components A and B to provide independent assurance, independence is admissible only if their claim-relevant failure/dependency closures contain no unmodeled common dependency capable of simultaneously invalidating the required properties, or every such common dependency is explicitly included as an assumption whose currentness is verified.

If the closure is incomplete:

`INDEPENDENCE_CLAIM = UNKNOWN`

not TRUE.

## Candidate invariants INV-CMI-01..38

01 Logical separation is not failure-domain independence.
02 Process separation is not trust independence.
03 Different hosts do not imply independent enforcement.
04 Different storage does not imply continuity independence.
05 Different keys do not imply independent roots.
06 Multiple observers do not imply independent evidence.
07 Multiple verifiers do not imply independent verification.
08 Shared update paths create common-mode dependency.
09 Shared KMS creates common-mode dependency.
10 Shared clock creates common-mode dependency.
11 Shared hypervisor creates common-mode dependency.
12 Shared recovery path creates common-mode dependency.
13 Shared operator can be common-mode for governance claims.
14 Shared policy source can invalidate multiple assurance paths.
15 Shared artifact source can invalidate multiple enforcement paths.
16 RCR requires its own dependency closure.
17 RCR cannot prove continuity solely from rollback-vulnerable state it protects.
18 Circular continuity proofs are UNKNOWN absent an independent foundation.
19 Signed state can be stale.
20 Authenticated state can be stale.
21 Independent availability is not independent evidence.
22 Redundant evidence is not necessarily independent evidence.
23 Independence is claim-specific.
24 Independence levels are not authority levels.
25 Common-mode failure does not imply every claim fails.
26 Common-mode impact UNKNOWN blocks strong dependent claims.
27 Assumptions must be explicit and current.
28 Assumption validity is not authority.
29 Trust-root compromise invalidates dependent assurance.
30 Recovery-root compromise can invalidate restored continuity.
31 Update-root compromise can create correlated semantic drift.
32 Independence must include recovery and update paths.
33 Resource boundary independence must include continuity dependencies.
34 Different failure domains with shared trust root remain partially correlated.
35 Independent verifier and independent enforcer are different properties.
36 Independence claims expire/invalidate on dependency changes.
37 No independence claim beyond closure completeness.
38 Safe non-convergence is preferred to false independence.

## Architecture consequence

The architecture now needs a dedicated **Common-Mode / Trust-Domain Analysis Plane**.

Its job is not to execute effects.

Its job is to answer:

- what can fail together?
- what can roll back together?
- what shares a trust root?
- what shares an update path?
- what shares recovery?
- what shares continuity?
- what evidence is actually independent for the claim?
- what assumptions remain common?

This plane feeds the Assurance Plane and Admission Core.

## Updated trust architecture

Candidate high-level structure:

Z0 TRUST / CONTINUITY FOUNDATIONS
  - Nexo Continuity Root
  - Resource Continuity Root
  - Provider Continuity Root
  - update/detection/recovery roots

Z1 AUTHORITATIVE SAFETY CORE
  - authority
  - STOP
  - fencing
  - recovery

Z2 ASSURANCE / COMMON-MODE PLANE
  - proof context
  - dependency closure
  - failure-domain graph
  - independence claims
  - assumption closure
  - invalidation

Z3 EFFECT / RESOURCE BOUNDARIES
  - provider boundary
  - resource enforcement
  - queue/child boundaries
  - capability enforcement

Z4 EXTERNAL WORLD

## Next attack

**COMMON-MODE TRUST ROOT + PARTITION + STALE CONTINUITY + TWO VALID FENCES**

Question: if two failover domains each possess a cryptographically valid but mutually inconsistent continuity state, can Nexo safely choose one without introducing a new authority decision that itself depends on the disputed trust root?

This attacks split-brain continuity, conflict resolution, and the possibility of two simultaneously valid safety histories.