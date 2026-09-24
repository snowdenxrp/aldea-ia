# NEXO KERNEL INTERFACE CAPABILITY AUTHORITY MATRIX V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation.

## 1. Research basis

NIST SP 800-160 Rev. 1 explicitly applies least privilege to interfaces and internal module structure: interfaces should expose only the capabilities required by the relevant users/components, and access modes should be minimized. It also describes domain separation as controlling how entities influence protected subsystems and requiring arbitration at interfaces. NIST additionally describes separation of privilege and secure distributed composition as ways to prevent one failure or compromise from becoming sufficient for a highly critical operation. citeturn0search12turn0search14

## 2. Interface rule

Every kernel interface must be specified as:

INTERFACE_ID
CALLER_CLASS
TARGET_CAPABILITY
READ_SET
WRITE_SET
AUTHORITY_REQUIRED
SCOPE_REQUIRED
EFFECT_BINDING_REQUIRED
EPOCH/FENCE_REQUIRED
IDEMPOTENCY_REQUIRED
REPLAY_RULE
ATOMICITY_CLASS
DURABILITY_CLASS
ALLOWED_FAILURE_RESULT
EVIDENCE_REQUIRED
INVALIDATION_TRIGGERS
AUDIT/EVIDENCE_OUTPUT
FORBIDDEN_SIDE_EFFECTS

No interface is allowed to acquire implicit authority merely because its caller is “internal.”

## 3. Capability classes

C0 — Observe
May read explicitly permitted state.
Cannot authorize, mutate protected state, clear fences, or create effects.

C1 — Propose
May submit a normalized request/plan.
Cannot authorize or execute.

C2 — Prepare
May create bounded preparation state.
Cannot independently cross the final execution gate.

C3 — Coordinate
May acquire/renew/release coordination ownership within scope.
Cannot grant authority beyond the AuthorityContext.

C4 — Authorize
May admit an exact effect only under current authority, policy, invariants, fences and VersionSet.

C5 — Execute
May perform an already-authorized exact effect.
Cannot alter authorization semantics or clear STOP/recovery.

C6 — Reconcile
May submit/perform observations for an exact effect.
Cannot declare arbitrary observations verified.

C7 — Verify
May evaluate evidence against a claim.
Cannot silently rewrite evidence provenance or safety policy.

C8 — Recover
May perform bounded recovery operations under a RecoveryFence.
Cannot self-authorize release.

C9 — Stop
May request/enforce STOP within its scope.
Cannot be disabled by the executor.

C10 — Change
May stage/update safety-relevant configuration only through the update contract.
Cannot directly rewrite active safety state.

C11 — Decommission
May fence/revoke/close a bounded identity/system lifecycle.
Cannot restart or reactivate decommissioned authority without a distinct authorized lifecycle transition.

## 4. Principal matrix

| Principal | Observe | Propose | Prepare | Coordinate | Authorize | Execute | Reconcile | Verify | Recover | Stop | Change | Decommission |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Planner/model | ✓ | ✓ | limited | no | no | no | no | no | no | no | no | no |
| Human interface | ✓ | ✓ | request | no | scoped request only | no | report | no | emergency request | emergency request | no | request |
| Normal execution plane | scoped | no | ✓ | scoped | no self-grant | ✓ | report | no | no | no self-clear | no | no |
| Coordination service | scoped | no | ✓ | ✓ | no | no | no | no | no | no | no | no |
| Evidence subsystem | scoped | no | no | no | no | no | ✓ | evidence only | no | no | no | no |
| Verification subsystem | scoped | no | no | no | claim decision only | no | request | ✓ | no | no | no | no |
| Recovery authority | scoped | no | bounded | bounded | no self-grant | bounded recovery only | ✓ | no self-certification | ✓ | no | no | no |
| Stop authority | scoped | no | no | no | no | no | no | no | no | ✓ | no | no |
| Update authority | scoped | no | staging | no | no | no | no | no | bounded | no | ✓ | no |
| Decommission authority | scoped | no | no | bounded closure | no | no | ✓ | no | bounded closure | may stop | no | ✓ |
| Authoritative kernel | ✓ | accepts | ✓ | validates | ✓ | gates | admits | validates | releases | enforces | admits | closes |

“✓” means capability only within explicit scope; it does not imply unrestricted authority.

## 5. Critical forbidden edges

The following interfaces must not exist as unrestricted capabilities:

1. Planner → Execute
2. Planner → Authorize
3. Model → TrustRootWrite
4. Model → PolicyWrite
5. Executor → StopClear
6. Executor → RecoveryRelease
7. Recovery → SelfAuthorize
8. EvidenceProducer → ClaimAccept
9. Reconciler → VerifiedTruthWrite without evidence admission
10. LeaseOwner → AuthorityGrant
11. CheckpointRestore → AuthorityRestore
12. UpdateInstaller → ActiveSafetyBypass
13. AuditWriter → ProofStatusOverride
14. UI → DirectProtectedStateWrite
15. NewOperationID → ResolveOldUNKNOWN
16. Decommission → AutomaticRestart
17. ExternalProviderResponse → DirectAuthorization
18. ModelConfidence → SafetyAuthorization
19. RewardMetric → AuthorityGrant
20. TelemetryTimestamp → TrustedTime unless explicitly admitted by the time/trust contract.

## 6. Exact-effect binding

Every interface that can alter a protected operation must carry or resolve:

operation_id
effect_id/effect_key
target fingerprint
normalized parameter fingerprint
authority_context_id/epoch
policy version
invariant version
VersionSet
coordination fence where applicable.

A generic “execute(action)” interface is therefore insufficient for the protected path.

## 7. Read/write separation

A component may read more information than it can mutate.

Example:
planner may read broad world context but cannot write:
- AuthorityContext;
- StopState;
- RecoveryFence;
- PolicyBaseline;
- InvariantBaseline;
- EffectBinding after admission;
- VerifiedWorldState;
- Decommission closure.

This preserves information flow without granting mutation authority.

## 8. Interface atomicity classes

I0 — pure read/derived:
No protected state mutation.

I1 — durable proposal:
Request becomes durable but no authority granted.

I2 — protected local transition:
Requires declared read/write set and serialization.

I3 — authority/safety transition:
Requires current authority, fences and protected linearization.

I4 — external-effect boundary:
Preserves exact effect identity and UNKNOWN semantics.

I5 — recovery/update/decommission release:
Requires explicit multi-condition admission and protected transition.

No interface may silently perform an I3-I5 action through an I0-I2 API.

## 9. Replay and stale message rules

Every safety-relevant message needs:
- unique message/request identity;
- relevant epoch/version;
- exact operation/effect binding;
- expiration/freshness where applicable;
- idempotency semantics;
- rejection behavior for stale context.

Rules:

STALE AUTHORITY → reject/hold
STALE FENCE → reject
STALE STOP RELEASE → reject
STALE RECOVERY RELEASE → reject
STALE UPDATE ACTIVATION → reject
DUPLICATE EFFECT REQUEST → resolve by effect identity/idempotency
UNKNOWN EFFECT → preserve UNKNOWN
NEW OPERATION ID → cannot inherit unresolved old-effect outcome

## 10. Partition behavior

When the kernel cannot establish a required current fact:

- authorization → deny/hold;
- stop state → fail safe for protected execution;
- recovery fence → remain quarantined;
- critical evidence freshness → verification blocked;
- external outcome → UNKNOWN;
- noncritical cognition → may degrade.

Cached authority must never silently become current authority after partition.

## 11. Separation of privilege

Highly critical operations may require distinct authorities rather than one principal performing every step.

Candidate separation:
- normal execution;
- emergency stop;
- recovery release;
- safety-policy change;
- trust-root change;
- decommission closure.

This is not mandatory duplication for every operation. It is a mechanism to prevent one compromised role from becoming sufficient for irreversible/high-impact actions. NIST identifies separation of privilege/predicate permission as a means of requiring multiple authorized entities for highly critical operations. citeturn0search12

## 12. Interface invariants

IFACE-01: no external component can invoke protected authority without exact scope.
IFACE-02: capability does not imply authority.
IFACE-03: coordination ownership does not imply authorization.
IFACE-04: observation does not imply verification.
IFACE-05: verification does not imply unrestricted execution.
IFACE-06: recovery ownership does not imply release authority.
IFACE-07: update authority does not imply runtime execution authority.
IFACE-08: decommission authority does not imply restart authority.
IFACE-09: every protected mutation declares read/write sets.
IFACE-10: safety-relevant messages are bound to current context.
IFACE-11: stale/replayed safety messages cannot grant authority.
IFACE-12: no low-capability interface may invoke a higher-capability semantic transition implicitly.
IFACE-13: protected interfaces fail closed or enter explicitly defined restricted states when required context is unavailable.
IFACE-14: evidence producers cannot unilaterally validate claims when independent validation is required.
IFACE-15: interface expansion is a safety-relevant architecture change.
IFACE-16: removing an interface capability requires proving that no required safety function depended on it.

## 13. Result

The kernel boundary is now expressible as an authority graph:

OBSERVE
→ PROPOSE
→ PREPARE
→ COORDINATE
→ AUTHORIZE
→ EXECUTE

with separate planes:

RECONCILE
VERIFY
STOP
RECOVER
CHANGE
DECOMMISSION

The arrows are not automatic promotions. Each crossing requires a distinct contract.

This gives Nexo a crucial architectural property:

**a compromised planner may propose malicious actions without thereby acquiring the capability to authorize or execute them.**

Likewise:

**a compromised executor may attempt execution, but cannot legitimately rewrite the authority, stop, recovery or policy semantics that gate it.**

## 14. Remaining gate

The next research task is to turn this capability matrix into an **information-flow and authority-flow model**:

DATA
→ TRANSFORMATION
→ TRUST LEVEL
→ AUTHORITY EFFECT
→ PROTECTED STATE
→ EVIDENCE
→ CLAIM.

For each interface we must identify:
- information that may cross;
- information that must never cross;
- transformations allowed;
- trust downgrade/upgrade rules;
- taint propagation;
- provenance preservation;
- authority non-escalation;
- cross-domain dependency;
- formal state mapping.

Only after that can the semantic kernel boundary be considered sufficiently specified for architecture construction.

Architecture remains blocked.