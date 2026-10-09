# STEP 7 — LCORE-1 Blocking Premises Resolution Map — 2026-10-09

Status: RESEARCH / DECISION-READINESS MAP ONLY — NO NEW TRUST CONTRACT, NO IMPLEMENTATION; UNKNOWN/STOP RETAINED.

## Purpose

Convert the six already-recorded LCORE-1 blocking premises into the smallest useful next-step map: which parts can be researched from public/device facts, which require a legitimate governance decision, and which cannot be settled before a concrete protected deployment boundary exists.

This is a delta classification, not a seventh premise, trust abstraction, new root model, or replacement for the canonical contracts. It reuses the Trust Function / Root Role Map, Genesis Trust Foundation, Bootstrap Composition, Core Constitution Authority Context and its implementation gate, deployment failure-domain inventory, concrete deployment options, exact-phone assessment, and LCORE-1 cross-attack.

## Evidence integration

- MASTER / trust-role invariants: TRUST, IDENTITY, AUTHORITY, CAPABILITY, POLICY, EXECUTION, EFFECT and VERIFICATION are not interchangeable. A signature, hash, version, epoch, durable record, biometric unlock or provider assertion cannot create constitutional legitimacy by itself.
- AB: AB104.368 keeps authority (A) and target state (T) independent; if either is UNKNOWN, the dependent transition is UNKNOWN/STOP. GLOBAL-AUDIT-109 distinguishes STOP requested from enforced, revocation issued from enforced, and a cached authorization from current authority. These are constraints, not proof that the new Core has runtime enforcement.
- P/P112: dependency/failure-domain closure is claim-specific; missing authoritative dependencies remain UNKNOWN. RATS/NIST role separation informs the analysis but does not supply Nexo's constitutional authority.
- NCS: the Genesis and Constitution Authority Context contracts already express the semantic separations. The implementation gate expressly blocks constructing the context from caller data before a recognized trust foundation exists.
- Exact device evidence: user-reported POCO X7 Pro-family match is strong, but current bootloader state, verified-boot state, hardware-backed attestation and protected enforcement have not been observed or independently validated. The phone remains a development/research host; no Genesis-root role is selected.

## Premise-by-premise resolution map

### P1 — Independent recognition of the first Genesis basis
**Class:** governance/provisioning choice + independently verifiable external evidence; not resolvable from phone specifications.

Required to progress:
- Identify the pre-existing relationship or provisioning authority that can legitimately recognize the initial Genesis basis before Nexo/Core treats it as governing.
- Define why that recognition source is legitimate and how its own relevant dependencies are recognized without circular self-authentication.
- State what happens if that source is unavailable, disputed, compromised or revoked.

Not sufficient alone: this phone, a local file, a new key generated on it, a signature, hash, timestamp, INE identity evidence, model/provider output, or a hardware attestation. These may contribute bounded evidence only if a future governed claim explicitly permits it.

**Current result:** UNKNOWN / blocking. No recognition source or root family selected.

### P2 — Owner-to-exact-ceremony/content/scope binding
**Class:** owner/governance procedure + later interaction design; cannot be solved by identifying a biometric sensor.

Required to progress:
- A fresh, attributable owner act bound to the exact Constitution version/content, requested scope, and commissioning context.
- An unambiguous presentation/confirmation path and a way to detect content substitution, replay, stale review or approval of a different scope.
- Explicit separation of identity evidence, authentication, constitutional approval and execution permission.

The manufacturer's POCO X7 Pro FAQ warns that AI face unlock is less secure than PIN/password/pattern and may be fooled by a photo or similar appearance. OS biometric acceptance therefore cannot, by itself, prove that the owner approved exact constitutional content. No biometric data was collected or tested.

**Current result:** UNKNOWN / blocking. No ceremony or credential enrollment authorized.

### P3 — Actual platform and dependency/failure-domain closure
**Class:** deployment-specific evidence; public documentation can narrow possibilities but not prove the live handset state.

Required to progress:
- Name the actual runtime/storage/boot/update paths in scope.
- Establish which dependencies can fail or be compromised together, including privileged OS, recovery, updater, vendor services, owner physical control and relevant remote services.
- Separate published capability, device-observed state, independently verified evidence and the exact claim each supports.

Current phone facts and official documentation do not establish the live bootloader state, trusted root key, verifiedBootState, attestation chain, TEE/StrongBox or rollback-resistance state. No settings change or diagnostic test is authorized merely to fill this gap.

**Current result:** PARTIALLY INVENTORIED; critical claims UNKNOWN. The phone is available for development/research, not selected as a Genesis trust root.

### P4 — Currentness/revocation under offline conditions
**Class:** governance policy decision + deployment enforcement evidence.

Required to progress:
- Define what must remain current, which authority can revoke/replace it, what freshness evidence is needed, and the maximum acceptable stale interval for each claim.
- Define what functions may continue offline and which transitions must HOLD/STOP when currentness cannot be established.
- Show how revocation becomes enforced at the relevant boundary; issuing a revocation or having a network cache is not enforcement.

Do not invent a universal TTL or allow indefinite offline authority to make the system convenient. The correct bound depends on claim, harm, reversibility, availability and the actual enforcement path.

**Current result:** UNKNOWN / blocking. No stale window or offline authority policy selected.

### P5 — Deployed protected establishment/bypass boundary
**Class:** concrete architecture + implementation/runtime evidence, dependent on P1–P4.

Required to progress:
- Identify the component that prevents caller/provider-supplied data from becoming recognized constitutional authority.
- Identify the last protected state boundary and all bypass paths within the threat model.
- Test the exact implementation and record commit, workflow/run, job, raw evidence and tested scope. Hosted tests cannot prove an untested physical handset or a universal production boundary.

A constructor, private field, frozen object, signed JSON, resolver PASS, local database, CI result or UI prompt is not by itself a protected trust boundary.

**Current result:** NOT ESTABLISHED / blocking. Do not implement Constitution Authority Context by copying caller fields into a protected-looking object.

### P6 — Independently governed recovery/replacement
**Class:** governance/succession choice + deployment-specific enforcement evidence.

Required to progress:
- Establish who may recover, replace or revoke the Genesis basis and by what prior rule.
- Ensure the recovery path does not rely solely on the compromised/lost root to authorize its own replacement.
- Define conflicting recovery/succession claims, evidence loss and unavailable authority outcomes.
- Keep recovery's bounded restoration/containment capability distinct from ordinary constitutional authority.

The user's previously stated preference that his daughter may be successor in the future is not an enacted succession procedure and does not establish authority for a minor or resolve the recovery path.

**Current result:** UNKNOWN / blocking. No recovery root, succession rule, or replacement ceremony selected.

## Minimal dependency order (not a new mechanism)

1. Governance/provisioning recognition basis (P1) must be identified before a constitutional context can be established.
2. Exact owner ceremony/content/scope binding (P2) must be defined before any commissioning act.
3. A concrete target and threat model are needed to close platform/dependency questions (P3) and define offline currentness/revocation policy (P4).
4. Only then can a real protected establishment/bypass boundary be specified and tested (P5).
5. Recovery/replacement (P6) must be governed before any claim of resilient long-term authority; it cannot be patched in after deployment.

This ordering expresses prerequisite relationships, not a guarantee that each step can be completed. A failed or unavailable prerequisite keeps the dependent transition UNKNOWN/STOP.

## Decision

- No contradiction discovered that warrants changing the existing semantic contracts.
- The phone assessment narrows the available development environment but does not resolve P1, P2, P4, P5 or P6 and does not independently settle P3.
- No new trust abstraction, root family, physical anchor, ceremony, credential, stale window, recovery path or implementation is justified by the current evidence.
- Path A remains NOT ACCEPTED; Path B NOT ESTABLISHED; Path C (uncommissioned UNKNOWN/STOP) remains valid.
- LCORE-1 remains a valid design scope, not an established real-world property.
- No credential enrollment, key generation, commissioning, activation, protected-Core deployment, or external effect authorized.

## Next exact action

Do not continue generic phone-capability research unless a concrete claim depends on it. The next non-speculative task is a governance-readiness review of P1 and P2: enumerate legitimate possible classes of pre-existing recognition/provisioning and exact owner-to-content/scope binding, assess circular dependencies and countereffects, and record which facts require an explicit owner decision. Do not choose a class, credential or ceremony on the user's behalf, and do not turn the review into an implementation.
