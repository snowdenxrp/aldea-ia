# NEXO — PG-009 SAFETY-PLANE UPDATE / ROLLBACK / BOOTSTRAP TRUST
Fecha: 2026-09-24

## Status
DESIGNED / RESEARCH-CROSS-CHECKED.
No implementation or formal verification claimed.

## Research question
How can Nexo update or recover the very control plane that enforces Emergency Stop, recovery fencing, authority and admission without allowing the update mechanism itself to silently replace, weaken or bypass those protections?

## External cross-check

NIST SP 800-193 treats platform resiliency as protection against unauthorized changes, detection of corruption, and secure recovery. It specifically requires authenticated update mechanisms for recovery images and recommends protecting recovery mechanisms independently of the running firmware. This is a platform/firmware guideline, not direct proof for an AI agent, but the trust-boundary pattern is relevant.

SLSA 1.2 treats provenance as verifiable information about where/how artifacts were produced and separates provenance from the broader question of whether an artifact is actually acceptable. Higher build levels increase protection against tampering in/after the build.

GitHub artifact attestations similarly provide signed provenance but explicitly warn that an attestation is not a guarantee that an artifact is secure; consumers must define and enforce policy.

Sigstore policy-controller demonstrates a concrete admission pattern: signatures/attestations are verified against configured authorities and policy before an artifact is admitted, and image tags are resolved to digests so the admitted object cannot silently change underneath the policy.

These sources support the architecture pattern; they do not prove Nexo safety.

## Core finding

The safety plane cannot trust the ordinary update path merely because the update is signed.

Therefore:

UPDATE AUTHENTICITY != UPDATE AUTHORIZATION
PROVENANCE != SAFETY
SIGNATURE VALIDITY != SEMANTIC COMPATIBILITY
ROLLBACK IMAGE != SAFE ROLLBACK
RECOVERY IMAGE != AUTOMATICALLY TRUSTED RECOVERY

The update itself must be admitted by a control boundary that is protected from the component being replaced.

## Protected update chain

PROPOSE
→ IDENTIFY
→ HASH/BIND
→ PROVENANCE VERIFY
→ SIGNATURE/ATTESTATION VERIFY
→ SOURCE/BUILDER POLICY VERIFY
→ DEPENDENCY CLOSURE
→ SEMANTIC/POLICY COMPATIBILITY
→ SAFETY-PROPERTY DELTA
→ THREAT/COMMON-MODE REVIEW
→ INDEPENDENT ADMISSION
→ STAGE
→ ATTEST STAGED STATE
→ FENCE OLD
→ ACTIVATE
→ VERIFY CONTROL PLANE
→ WORLD/SAFETY RECONCILIATION
→ COMMIT

A failed or UNKNOWN critical step means BLOCK, HOLD or QUARANTINE.

## Safety-plane separation

The system is divided into at least:

1. Safety root / recovery root
2. Safety admission/verifier
3. Emergency enforcement gate
4. Recovery fence
5. Normal control plane
6. Executor/runtime
7. Model/planner
8. Observation/reconciliation

A normal executor cannot:
- approve its own safety-plane update;
- replace the only verifier;
- replace the only emergency gate;
- modify the trust root it needs to pass admission;
- disable rollback/recovery evidence;
- erase evidence of the previous safety state.

## Root-of-trust rule

The trust anchor used to authorize a safety-plane update must not be mutable by the candidate update under ordinary authority.

For higher-assurance deployments, use independent or threshold-controlled recovery/update authority where the threat model requires it.

Key rotation is a governed transition:
OLD_ROOT → TRANSITION_AUTHORIZATION → NEW_ROOT → VERIFICATION → RETIRE_OLD

Revocation of an old root must not make historical evidence unverifiable unless policy explicitly permits that loss.

## Update contract

Every safety-plane update binds:

- update_id
- artifact digest
- artifact identity/version
- source revision
- builder identity
- provenance/attestation
- dependency closure
- trust-root version
- signer/authority
- policy version
- invariant version
- schema/state-machine compatibility
- gate/recovery compatibility
- rollback/recovery artifact
- common-mode domains
- expected control boundaries
- migration requirements
- authority epoch
- expiry
- approval evidence
- staged verification evidence
- post-activation verification evidence

The admitted artifact is the digest-bound artifact, not a mutable tag.

## Semantic safety

A cryptographically authentic update can still change the meaning of:

- STOP
- ENFORCED
- VERIFIED
- AUTHORIZED
- UNKNOWN
- RELEASE
- capability scopes
- policy rules
- recovery ownership
- effect identity
- audit/evidence states

Therefore every safety-plane update requires semantic compatibility/admission, not just byte/signature verification.

A semantic change to a critical safety property is a governed architecture transition, not a routine patch.

## Mixed-version rule

Old and new safety/control components may coexist only when the combination is explicitly admitted.

Admitted System Version Set includes:

runtime + safety gate + verifier + recovery fence + policy + config + schema + state machine + trust roots + epochs + dependencies.

An individually valid component inside an invalid combination is not ACTIVE for critical effects.

## Staged update

Use:

OLD_ACTIVE
→ PREPARE_NEW
→ VERIFY_NEW
→ STAGED
→ SHADOW/CANARY where safe
→ FENCE_OLD
→ ACTIVATE_NEW
→ INDEPENDENT_VERIFY
→ WORLD_RECONCILE
→ COMMIT

The old component cannot be unfenced merely because activation succeeded locally.

## Rollback is not time travel

Rollback is a new governed transition.

Rollback must answer:
- Is the old artifact still authentic?
- Is its trust root still valid?
- Are current data/schema semantics compatible?
- Are current policies compatible?
- Are current epochs/capabilities compatible?
- Did the new version perform irreversible migrations?
- Does the old version understand current state?
- Does the old version preserve current safety semantics?
- Is there an unresolved external effect created under the newer version?

If any critical answer is UNKNOWN, automatic rollback is prohibited or restricted.

## Recovery image protection

The recovery path must not depend exclusively on the component it is intended to recover.

If the active control plane is compromised, the recovery mechanism must retain an independently protected route to an authenticated, policy-admitted recovery artifact.

Recovery artifacts require the same or stronger provenance/authenticity checks as normal updates, plus compatibility with the current recovery boundary.

## Anti-downgrade

Version numbers alone are insufficient.

Every admitted update records a monotonic security epoch / minimum allowed version where applicable.

A downgrade is permitted only through an explicit governed recovery transition.

A malicious or stale artifact cannot present itself as a normal rollback by using an older version identifier.

## Bootstrap after update/recovery

Boot sequence:

PLATFORM/ROOT
→ BOOT INTEGRITY
→ RECOVERY/SAFETY VERIFIER
→ TRUST ROOT LOAD
→ ARTIFACT/CONFIG ATTESTATION
→ POLICY/INVARIANT LOAD
→ SAFETY GATE
→ RECOVERY FENCE
→ CURRENT EPOCHS
→ NORMAL CONTROL PLANE
→ MODEL/PLANNER
→ CAPABILITY ADMISSION

Failure in safety verifier, root validation, gate, recovery fence or critical policy loading means NO_ACTIVATION / RECOVERY / QUARANTINE.

The model must never be the first component deciding that the control plane is trustworthy.

## Emergency-stop interaction

If an update is in progress while STOP is active:

- update cannot clear STOP;
- staged artifacts cannot gain execution authority;
- restart remains quarantined;
- old and new control-plane states must both remain subject to the active recovery fence;
- release requires current enforcement proof and explicit recovery/release authority;
- an update failure cannot convert STOP into UNKNOWN release.

## Update journal

The update journal is durable and records:

proposal → admission → staging → activation → verification → reconciliation → commit/abort.

Crash recovery resumes from the journal but does not blindly resume authority.

A checkpoint/journal restores transition history, not current permission.

## Common-mode analysis

Independence claims must cover:

- hardware/host
- hypervisor/kernel
- storage
- network
- identity provider
- signing keys/KMS
- trust-root distribution
- update repository
- builder/CI
- policy service
- clock/time
- administrator/control plane
- verifier
- emergency gate
- recovery mechanism

If update, verifier and recovery share the same compromised dependency, the architecture must downgrade assurance.

## Adversarial tests required

1. signed malicious artifact;
2. valid artifact with unacceptable provenance;
3. valid artifact from unauthorized builder;
4. valid signature under obsolete root;
5. trust-root replacement by candidate update;
6. verifier replacement by candidate update;
7. emergency gate replacement attempt;
8. rollback to incompatible schema;
9. rollback after irreversible migration;
10. downgrade below minimum security epoch;
11. mixed old/new components with incompatible semantics;
12. crash after fence-old/before activation;
13. crash after activation/before verification;
14. verifier unavailable during activation;
15. stale update journal after restart;
16. stale recovery token during update;
17. STOP asserted during staging;
18. STOP asserted during activation;
19. STOP signal lost during reboot;
20. common-mode compromise of builder and verifier;
21. compromised dependency accepted through transitive closure;
22. mutable tag changes after admission;
23. attestation valid but policy predicate fails;
24. policy/invariant change during staged update;
25. old artifact has valid provenance but unsafe current semantics.

## New invariants

INV-649 — update authenticity does not imply update authorization.
INV-650 — provenance does not imply semantic safety.
INV-651 — candidate safety-plane update cannot replace its own trust root and self-authorize.
INV-652 — safety-plane admission is independent of ordinary executor authority.
INV-653 — admitted artifacts are digest-bound, not mutable-tag-bound.
INV-654 — mixed-version combinations require explicit admission.
INV-655 — rollback is a new governed transition, never implicit time reversal.
INV-656 — rollback cannot bypass current policy/invariant/world compatibility.
INV-657 — recovery artifacts require authenticated and policy-admitted provenance.
INV-658 — recovery must retain an independently protected route when the active plane is compromised.
INV-659 — security downgrade requires explicit governed transition.
INV-660 — restart after update remains fenced until current admission succeeds.
INV-661 — update journal restoration cannot restore obsolete authority.
INV-662 — STOP cannot be cleared by update, rollback or reboot.
INV-663 — safety semantics require semantic compatibility, not only cryptographic integrity.
INV-664 — common-mode dependencies constrain independence claims.
INV-665 — critical update uncertainty causes BLOCK/HOLD/QUARANTINE rather than silent continuation.
INV-666 — trust-root rotation requires governed transition and historical verification policy.
INV-667 — verifier/gate replacement requires independent admission.
INV-668 — activation is not success until control-plane verification and required reconciliation complete.

## Assurance boundary

The strongest claim currently justified is:

A properly designed update path can prevent a candidate safety-plane artifact from becoming authoritative solely because it is signed, newer, or locally executable.

It does NOT yet prove:
- implementation correctness;
- cryptographic key security;
- semantic equivalence;
- absence of supply-chain compromise;
- physical safety;
- complete common-mode independence;
- TLC verification;
- real fault-injection resilience.

## Next research

1. common-mode/correlated-failure analysis across all safety/recovery/update planes;
2. correct and expand the TLA+ recovery model;
3. model update/rollback state transitions;
4. implement fault-injection scenarios;
5. run actual TLC when tooling is available;
6. synchronize the master architecture snapshot with the accumulated PG-009 delta without erasing history.
