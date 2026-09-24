# NEXO - RESOURCE CONTINUITY ROOT / ROLLBACK / SNAPSHOT RESTORE / FAILOVER RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

Can a protected resource restore an older snapshot and thereby resurrect an old accepting fence or capability, making a previously fenced provider continuation valid again? If so, Nexo's continuity state alone is insufficient and a resource-side continuity anchor is required.

## External cross-checks

etcd explicitly documents that snapshot restore can move the visible revision backward, create a new logical cluster identity, and leave consumers with stale caches unless restoration establishes a new revision boundary. It recommends revision bumping and compaction to prevent restored historical revisions from being mistaken for current continuity. citeturn0search1turn0search12

TUF treats signed but obsolete metadata as a security problem: rollback and freeze attacks exploit stale authentic state, while Snapshot/Timestamp metadata provide consistency and freshness mechanisms. citeturn0search6turn0search8

NIST SP 800-193 separates protection, detection and recovery and identifies roots of trust for update, detection and recovery. It also notes that these roots may share components, creating trust relationships that must be considered. citeturn0search0turn0search36

## Core result

A resource can be cryptographically authentic, internally consistent, and correctly restored while still being temporally obsolete.

Therefore:

AUTHENTIC_SNAPSHOT != CURRENT_RESOURCE_CONTEXT
INTEGRITY_VERIFIED != CURRENT_FENCE
RESTORED_STATE != CURRENT_AUTHORITY
RESOURCE_RESTORE != RESOURCE_CONTINUITY

The dangerous failure is:

F_new was enforced before failure → resource restores snapshot containing F_old → resource accepts F_old → stale provider continuation becomes valid again.

This is rollback of a safety-control state, not merely rollback of business data.

## Resource continuity

Candidate ResourceContinuityContext:
- logical_resource_id
- resource_incarnation
- continuity_generation
- fence_generation
- revocation_generation
- authority_generation
- STOP generation
- update/recovery generation
- snapshot lineage
- last accepted continuity anchor
- current boundary generation
- capability generation
- rollback detection state
- failover state
- trusted recovery source
- continuity status
- invalidation conditions

Key distinction:
RESOURCE_ID + INCARNATION + CONTINUITY_GENERATION + SAFETY_STATE must form a coherent current context.

## Why a local counter is insufficient

A restored snapshot may contain fence=90 and locally advance to 91. That does not prove continuity with the previous live state. A different resource can also independently produce a larger number.

NUMERIC_MONOTONICITY != CONTINUITY
HIGHER_FENCE_NUMBER != CURRENT_GLOBAL_FENCE

The generation needs a continuity domain and trusted predecessor relation.

## Resource Continuity Root

Candidate architectural trust function: Resource Continuity Root (RCR).

Responsibilities:
- prevent safety-generation regression;
- establish current resource incarnation;
- authenticate current continuity context;
- reject historical safety state after restore;
- establish a new generation after recovery/failover;
- bind current fence state to current resource incarnation;
- provide continuity evidence to Nexo.

The RCR need not be hardware in every deployment. Hardware-backed protection may strengthen it, but the architecture must not silently assume it. NIST's roots-of-trust guidance supports treating critical trust functions as explicit foundations and warns that shared components create trust relationships. citeturn0search0turn0search11

## Three continuity domains

1. Nexo Continuity
2. Resource Continuity
3. Provider Continuity

They are not interchangeable. Valid Nexo continuity does not prove resource continuity; valid resource continuity does not prove provider continuation stopped.

## Candidate resource bootstrap

RESOURCE_BOOT → IDENTIFY_RESOURCE_INCARNATION → LOAD_HISTORICAL_SNAPSHOT → VERIFY_SNAPSHOT_INTEGRITY → VERIFY_CONTINUITY_ANCHOR → COMPARE_CURRENT_EXTERNAL_GENERATION → INVALIDATE_HISTORICAL_ACCEPTANCE → ESTABLISH_NEW_RESOURCE_CONTEXT → INSTALL_CURRENT_FENCE → VERIFY_STALE_REJECTION → RECONCILE_IN-FLIGHT EFFECTS → PUBLISH_RESOURCE_READY

Critical rule:
RESTORE_COMPLETE != PROTECTED_RESOURCE_READY

## Resource bootstrap fail-closed

If current continuity cannot be established:

RESOURCE_SAFETY_STATE = UNKNOWN

For protected effect classes:

ACCEPT = DENY

until continuity and current fence semantics are established.

## Snapshot integrity versus currentness

A snapshot can have a valid checksum, signature, schema, and artifact version without proving it is the latest safety state.

etcd explicitly documents revision rollback on restore and provides revision bump/compaction mechanisms to prevent consumers from mistaking restored historical revisions for current state. citeturn0search1

Therefore:
INTEGRITY != FRESHNESS
AUTHENTICITY != CURRENTNESS
SCHEMA_VALIDITY != SAFETY_CONTINUITY

## Failover attack

Primary R1 has fence=120. Standby R2 has fence=118. R1 fails.

R2 cannot simply become active at 118 because an actor holding capability 119 could become valid again.

Candidate failover:
R1 ACTIVE@120 → R1 UNAVAILABLE → R2 STANDBY@118 → CURRENT CONTINUITY AUTHORITY REQUIRED → R2 ESTABLISHES NEW CURRENT CONTEXT → R2 FENCE >= safe continuity boundary → VERIFY OLD CAPABILITY REJECTION → R2 ACTIVE

If the continuity source cannot establish a current boundary:
R2 = QUARANTINED

## Split-brain failover

If R1 believes it is active at F=120 while R2 restores an old snapshot at F=118 during partition, both may accept commands unless resource-side continuity protection prevents it.

Possible mechanisms include quorum-backed continuity authority, hardware-backed monotonic state, an independent durable continuity anchor, an external fencing authority, or a physical/resource-level interlock. Technology selection remains open; the architecture requires the continuity property.

## Old capability resurrection

Capability C89 was invalidated when current fence became 90. If restore makes the resource accept fence 89 again, previously invalid authority has been resurrected.

Therefore revoked capability generations must remain revoked across crash/restore.

## Safety-critical resource persistence

Candidate P0-R state:
- current fence;
- revoked capability generations;
- resource incarnation;
- STOP generation;
- authority generation;
- continuity generation;
- update/recovery generation;
- trusted continuity anchor;
- boundary policy;
- accepted effect classes.

If any safety-critical field can regress through restore:
RESOURCE_CONTINUITY = BROKEN

## Snapshot lineage

Candidate SnapshotLineage:
- snapshot_id;
- resource identity;
- incarnation;
- source continuity generation;
- fence generation;
- authority generation;
- creation reference;
- predecessor;
- trust source;
- capture boundary;
- restore generation;
- invalidation state.

A snapshot is historical evidence, not current authority.

## Restore protocol

RESTORE_REQUEST → SNAPSHOT_AUTHENTICITY_CHECK → SNAPSHOT_LINEAGE_CHECK → CONTINUITY_ANCHOR_CHECK → DETECT_GENERATION_REGRESSION → QUARANTINE_IF_REGRESSION → CREATE_NEW_RESOURCE_INCARNATION → ESTABLISH_NEW_CONTINUITY_GENERATION → INVALIDATE_HISTORICAL_FENCE → INSTALL_CURRENT_FENCE → VERIFY_OLD_CAPABILITY_REJECTION → RECONCILE → RELEASE

## Continuity anchor unavailable

Do not infer NO_CHANGE. Use CONTINUITY_UNKNOWN.

For claims depending on current resource fencing:
HOLD / QUARANTINE

A weaker claim may remain possible only if it explicitly excludes the affected resource/effect.

## No independent continuity mechanism

If Nexo's only evidence of resource currentness is the resource's own rollback-vulnerable state, then RESOURCE_CURRENTNESS = UNKNOWN.

A resource cannot prove its continuity solely by citing a snapshot that asserts its own continuity.

## Three-way rollback

Hard case:
Nexo C3 + Provider P7 + Resource R12 all crash.
Restoration yields Nexo C2, Provider P6, Resource R10.

Each component can be internally valid while the combined system is non-current.

Strong recovery therefore requires joint compatibility across:
Nexo Continuity × Provider Continuity × Resource Continuity × Effect Identity × Fence × Mission Claim.

Any required continuity relation that is UNKNOWN blocks strong release.

## Continuity compatibility

Candidate relation: ContinuityCompatible(N_old, P_new, R_new, E, Claim).

Dimensions:
- effect semantics;
- effect identity;
- attempt lineage;
- authority generation;
- fence generation;
- resource incarnation;
- provider execution lineage;
- policy/invariant versions;
- boundary generation;
- dependency closure;
- topology;
- STOP/recovery context;
- mission invariant;
- continuity anchors.

Compatibility is claim-specific.

## Candidate invariants INV-RCR-01..35

01 Authentic snapshot is not current resource context.
02 Snapshot integrity is not safety continuity.
03 Snapshot signature is not current fence.
04 Restore is not reauthorization.
05 Restore is not currentness.
06 Resource logical identity is not incarnation identity.
07 Numeric generation monotonicity alone does not prove continuity.
08 Higher local fence does not prove global currentness.
09 Old fence state cannot regain acceptance after restore.
10 Revoked capability generations remain revoked across restore.
11 Resource safety state is P0-R.
12 Protected resource boot fails closed until current safety context exists.
13 Resource continuity is separate from Nexo continuity.
14 Resource continuity is separate from provider continuity.
15 Current resource context requires a continuity anchor or explicit weaker claim.
16 Continuity anchor unavailability yields UNKNOWN, not NO_CHANGE.
17 Snapshot lineage is evidence, not authority.
18 Restore from older snapshot requires new resource context.
19 Failover to stale standby cannot silently restore old acceptance.
20 Split-brain requires resource-side fencing/continuity protection.
21 Resource replacement creates new incarnation.
22 Old incarnation evidence cannot classify new incarnation.
23 Old provider capability cannot cross new resource boundary without explicit compatibility.
24 Fence rollback is safety-state regression.
25 Safety-state regression requires quarantine or protected re-establishment.
26 Resource continuity verification is claim-specific.
27 Provider continuity cannot be inferred from resource continuity.
28 Nexo continuity cannot be inferred from resource continuity.
29 Cross-domain continuity must be jointly compatible for strong claims.
30 Historical restore cannot restore historical authority.
31 Recovery cannot clear a continuity barrier merely because data integrity passes.
32 Continuity mechanism cannot depend exclusively on rollback-vulnerable state.
33 Common-mode dependencies of continuity roots must be represented.
34 Continuity context changes invalidate dependent assurance.
35 Safe non-convergence is preferred to resurrected authority.

## Candidate theorem

Not formally proven:

If every protected resource maintains a continuity mechanism that cannot regress through ordinary snapshot restore, establishes a fresh resource incarnation after recovery/failover, rejects stale fence/capability generations at the protected boundary, and exposes sufficient continuity evidence to bind external effects, then restoration of historical resource state cannot by itself resurrect a previously fenced protected capability.

The theorem still depends on the continuity mechanism, failure assumptions, bypass coverage, and implementation refinement.

## Architecture consequence

The architecture now needs a dedicated RESOURCE CONTINUITY ROOT between ordinary resource persistence and the protected effect boundary.

The RCR is a trust function: protect continuity of safety-critical resource state against rollback.

This creates three explicit trust domains:
Nexo Continuity Root
Resource Continuity Root
Provider Continuity Root

They may share infrastructure only if the resulting common-mode dependency is explicitly represented and accepted for the claim.

## Open gaps

G-RCR-01 minimal resource continuity root.
G-RCR-02 continuity anchor placement.
G-RCR-03 crash-safe monotonicity.
G-RCR-04 failover quorum/authority.
G-RCR-05 hardware versus software continuity guarantees.
G-RCR-06 snapshot lineage authenticity/currentness.
G-RCR-07 stale capability rejection after restore.
G-RCR-08 provider rollback interaction.
G-RCR-09 three-way continuity compatibility.
G-RCR-10 split-brain resource fencing.
G-RCR-11 continuity-root common-mode analysis.
G-RCR-12 formal model.
G-RCR-13 SANY/TLC/TLAPS.
G-RCR-14 implementation refinement.
G-RCR-15 fault injection / rollback testing.
G-RCR-16 long-duration generation rollover.

## Next attack

RESOURCE CONTINUITY ROOT + MULTIPLE FAILOVER DOMAINS + SHARED TRUST ROOT + COMMON-MODE FAILURE.

Question: if Nexo, the resource fence and the continuity anchor all depend on the same storage, hypervisor, KMS, clock, firmware or trust root, can Nexo legitimately call the resource boundary independent evidence/enforcement? This attacks the remaining assumption behind the Resource Continuity Root.