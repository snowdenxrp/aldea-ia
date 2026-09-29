# NEXO AB104.865R — correction/reversal + namespace/domain migration audit

Date: 2026-09-29
Parent: AB104.864R
Mode: research/audit only

## Question
Can an old correction event cross a namespace/tenant/account boundary after migration or reassignment while retaining a local resource identifier, and does I18 already absorb the interaction?

## Fresh evidence

### 1. Concrete cross-namespace security incident: Fission
Fission security advisory GHSA-cvw6-gfvv-953q documents a real cross-namespace confused-deputy flaw. A Function in one namespace could reference an Environment in another namespace because the admission webhook validated some namespace references but omitted EnvironmentRef. The controller then used the victim namespace's Environment. The fix added namespace equality validation at admission and repeated the check in controller paths to cover webhook bypass/stale-object windows.

This is strong concrete evidence that namespace is an authoritative identity boundary and that validating it only at one lifecycle point is insufficient.

It is not a correction/reversal incident and does not prove a Nexo vulnerability.

### 2. Tenant datastore migration
Kamaji's datastore migration documentation puts a tenant control plane into read-only mode during migration to prevent source/destination misalignment. It also documents stale data remaining in the old datastore and schema-name collisions at the target, with explicit cleanup required.

This demonstrates that migration can create a stale-data/collision boundary where namespace/tenant identity and storage location must remain synchronized.

### 3. Executable tenant event-store migration
eventsource-py's live tenant migration uses PENDING -> BULK_COPY -> DUAL_WRITE -> CUTOVER -> COMPLETED, keeps the source authoritative until cutover, verifies consistency, and migrates subscription checkpoints.

This is concrete executable evidence that tenant migration changes routing/storage identity while historical events and subscription positions remain active concerns.

### 4. Multitenant messaging architecture
Microsoft's multitenant guidance treats tenant mapping/sharding as an explicit identity/routing function and recommends tenant-specific identity/permissions. Shared messaging systems require explicit tenant scoping.

This supports treating tenant/domain as part of the protected identity contract rather than metadata that can be inferred from the resource ID.

## Attack matrix

### A. Old correction after tenant reassignment

Timeline:
R1 = (tenant A, id=X)
C1 = correction for R1
R1 reassigned/migrated to tenant B
R2 = (tenant B, id=X)
C1 arrives late
reconciliation processes C1

If the consumer keys only on id=X, C1 may cross the tenant boundary.

Reduction:
I18 namespace/incarnation confusion
+ I19 correction/reversal
+ class 12 reconciliation when reconciliation participates.

No new primitive appears.

### B. Migration during in-flight correction

Timeline:
C1 is generated under A
migration begins
event is copied/queued
cutover occurs
C1 is delivered through the new B route

The safe system needs an explicit migration epoch/cutover boundary or authoritative lineage showing whether C1 belongs before or after the move.

This is still identity/namespace lineage plus stale ordering. It does not require a new top-level interaction class.

### C. Same local resource ID across tenants

If IDs are globally unique across all tenants, the attack is contractually excluded.
If IDs are only tenant-scoped, then tenant/domain MUST participate in identity matching.
If the tenant scope is missing or changed without a lineage record, the event cannot safely be applied.

Again: I18.

### D. Reconciliation races migration

A reconciliation process queries provider state under tenant A while routing has switched to tenant B. A delayed correction then arrives.

The relevant discriminator is the authoritative tenant/domain + resource lineage + migration/cutover state. If those cannot establish ownership, preserve UNKNOWN/QUARANTINED.

This is I18 + I19 + class 12, not a new class.

## Important reduction

The fresh evidence strengthens an important Nexo principle:

A namespace/tenant/account field is not merely routing metadata. Where the domain contract makes it part of resource ownership, it is part of the resource identity/authority boundary.

The minimum conceptual identity tuple for this attack is:

(domain/tenant, resource_type, resource_id, incarnation/lineage, event_or_operation_id, causal/version relation)

Not every system requires all fields. The contract must explicitly state which dimensions are authoritative.

## Why this does NOT create a new interaction class

The attack requires:
1. a correction/reversal event;
2. a changed namespace/ownership boundary;
3. delayed or stale delivery/reconciliation.

The semantic transition remains I19.
The identity failure remains I18.
The stale ordering component, when present, remains I21.
The repair/reconciliation component remains class 12.

No independent protected-boundary primitive survives reduction.

## Epistemic boundary

Concrete evidence found:
- real cross-namespace confused-deputy incident and patch;
- migration systems explicitly fencing writes/cutover or validating consistency;
- executable tenant event-store migration with cutover and checkpoint migration;
- explicit tenant routing/identity guidance.

Not established:
- Nexo implementation vulnerability;
- universal provider behavior;
- universal resource-ID reuse;
- formal completeness of I18/I19/I21.

No Nexo runtime race executed.

## AB104.865R disposition

RESULT: I18 + I19 cover namespace/domain migration and reassignment correction attacks; I21 and reconciliation class 12 apply when stale ordering/reconciliation is involved.

No new top-level interaction class frozen.
No W19/W20 freeze.
No coverage denominator freeze.
No semantic freeze.
No formal verification.
No implementation.

### Candidate invariants

INV-TE-16:
If namespace/tenant/domain is authoritative for resource ownership, a correction must be bound to that domain before mutation.

INV-TE-17:
A migration/cutover must not implicitly transfer historical event authority merely by changing routing.

INV-TE-18:
An event whose domain/ownership lineage cannot be established must not cross a tenant boundary based only on resource_id.

These are candidates only; not formally verified.

## Exact next action: AB104.866R

Attack correction/reversal + migration cutover + duplicate/retry:
- event produced before cutover;
- delivery fails;
- retry occurs after cutover;
- same event reaches old and new routes;
- reconciliation runs concurrently.

Question:
Does the addition of retry/duplicate delivery reveal an independent interaction beyond I18 + I19 + I21 + I22/I23, or does it reduce completely?

Constraints:
NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED
