# STEP 7 — Deployment Claim and Failure-Domain Inventory — 2026-10-09

Status: RESEARCH / INVENTORY ONLY — TARGET NOT SELECTED — COMMISSIONING STOP RETAINED

## Purpose and scope

This inventory advances the existing initial-trust comparison without selecting a deployment, trust family, credential, platform, or root. It combines the existing Trust Function / Root Role Map, Trust Foundation attack, Constitution Authority Context gate, initial-trust-family comparison, and G-A14-01 effect-path research.

It is not a new trust abstraction or implementation contract. It records which failure domains must be examined for a concrete claim and which facts remain unknown. A user goal, repository design, code test, or historical audit does not establish a deployed platform or protected effect boundary.

## Deployment claim classes

| Claim | Required boundary/evidence | Known from current repository | Missing / current disposition |
|---|---|---|---|
| Owner identity and first recognition | A fresh, attributable owner act bound to exact scope/content; a legitimate prior relationship between credential and owner | INE has been researched only as a possible identity-evidence source; no credential material was collected or verified | Credential, ceremony, independent provenance, coercion model, and binding to Nexo authority UNKNOWN |
| Genesis / constitutional legitimacy | A recognition basis that predates and does not self-authenticate the candidate Core; exact Constitution and scope binding | Semantic contracts and adversarial attacks exist | No independently recognized implemented root; STOP |
| Local Core integrity | Claim-scoped integrity of boot/OS/runtime/application/artifact, isolation, storage and update path | Nexo-specific executable code inspected in G-A14-01 was analysis/checking code, not a deployed runtime or protected effect gateway | Target device, boot chain, process boundary, measured components, protected storage and update authority UNKNOWN |
| Constitution-to-Policy authority | Protected, current source and provenance for the governing Constitution/Policy; no caller/provider self-assertion | Binding/context design and STOP gate exist | No implemented protected authority-source owner; STOP |
| Offline authority and revocation | What can be established while disconnected; accepted stale window; last boundary that enforces revocation | Historical evidence distinguishes revocation requested from enforcement | Connectivity assumptions, freshness source, monotonicity, maximum stale window, and enforcement coverage UNKNOWN |
| Cross-device continuity | New-device recognition, transfer scope, independent provenance and revocation of the old device | Portability is a stated goal; continuity principles exist | Device classes, pairing/transfer ceremony, shared backups/keys/operators, and old-device cutoff UNKNOWN |
| External/device effect | Closed source-to-sink and runtime paths; protected last effect boundary; attributable effect/no-effect evidence | G-A14-01 identifies network, process, device, filesystem/control, provider, runtime/plugin and administrative sink classes; no Nexo protected gateway was demonstrated | No target resource, API, actuator, gateway, bypass closure or authoritative effect observer selected; UNKNOWN |
| Recovery / replacement / succession | A previously governed recovery authority and conflict/cutoff semantics independent of the failed root where required | Recovery and succession are recognized as separate trust roles | No enforceable recovery basis, replacement ceremony, successor authority or conflict rule established; UNKNOWN |

## Failure-domain inventory to instantiate for any chosen target

These are dependency classes to investigate, not claims that every class is present or independent:

1. **Human / ceremony:** owner presence, identity evidence, display/audio/input path, coercion/substitution, and the component that presents the exact Constitution and scope.
2. **Platform:** hardware, firmware/boot chain, OS/kernel, device security features, privileged administrators, and vendor/manufacturing/update dependencies.
3. **Core software:** source/build pipeline, executable artifact, runtime, module/plugin loading, configuration, updater, rollback prevention, and process isolation.
4. **Protected state:** key custody, storage, backup/snapshot, restore, monotonic state or trusted time if required, and any operator/service that can replace data.
5. **Communications / provider:** network path, identity service, model/provider, remote APIs, package registries, cloud control plane, and offline behavior.
6. **Policy / governance:** Constitution source, Policy derivation, authorization evaluator, recovery authority, succession rules, and the authority that can change each.
7. **Effect path:** caller, broker/queue, adapter/SDK, OS API, privileged service, device/controller, alternate direct path, emergency/admin path, and effect observation.
8. **Evidence / continuity:** log writer, signing key, clock, replication, export, and the source used to establish currentness. A complete log can still record illegitimate or stale content.

For every instantiated dependency, the future claim must distinguish:
- DECLARED vs OBSERVED vs INFERRED vs UNKNOWN;
- shared component vs independent failure domain, with the evidence for independence;
- compromise capability and blast radius;
- currentness/revocation behavior while online and offline;
- recovery/replacement consequences;
- the last boundary capable of rejecting the effect;
- which evidence is produced by the same component whose claim it supports.

Unknown edges must not be treated as absent. Distinct keys, processes, devices, vendors, or logs do not establish independence by naming alone.

## Effect classes and closure

Reuse G-A14-01's discovery taxonomy rather than inventing a second one: network; process/subprocess; device/hardware; filesystem/control; provider/API; runtime/plugin/dynamic loading; administrative/recovery/maintenance. It is a discovery aid, not a universal complete list.

A local Core claim and a device-control claim are materially different:
- **Local protected-Core claim:** must state which Core operation is protected and what exact local boundary prevents an unrecognized authority source from being accepted. It still cannot bootstrap its own legitimacy by being called Core.
- **Device-control claim:** additionally requires a concrete device/resource, every relevant source-to-sink path, runtime topology, bypass/administrator/emergency paths, and a trustworthy observation of the external effect. A passing Core test does not establish this closure.

No current evidence selects either claim as the first deployment target. The intended eventual ability to control devices is not evidence that a device, interface, or enforcement boundary is currently available.

## Family comparison implications

- An external/provisioned root requires the provisioning actor/path and credential-to-owner relationship to be independently established.
- A predecessor-updated root is a lifecycle mechanism after a legitimate predecessor exists; it cannot solve Genesis.
- A platform root can support only the platform properties actually protected and measured; it does not itself establish owner or constitutional legitimacy.
- Multiple roots help only if the composition rule and claim-relevant independence are governed; quorum/count does not create first legitimacy.
- RATS-style evidence appraisal can help with technical claims, but does not supply the missing owner/constitutional recognition relation.

Therefore no family can be ranked responsibly before the first claim, actual target, threat boundary, and relevant failure-domain closure are named.

## Decision

- Target claim: NOT SELECTED.
- Host/platform and commissioning environment: UNKNOWN.
- Protected resource / final effect boundary: UNKNOWN.
- Failure-domain independence: UNKNOWN where not established.
- Root family / credential / ceremony: NOT SELECTED.
- Path A: NOT ACCEPTED.
- Path B: NOT ESTABLISHED.
- Path C (remain uncommissioned UNKNOWN/STOP): remains valid.
- Implementation, enrollment, root creation/rotation, commissioning, or activation: NOT AUTHORIZED.

## Exact next action

Do not repeat generic trust research and do not create another trust abstraction. The next meaningful decision is to select the first concrete claim and target boundary. Only then instantiate this inventory with actual platform/dependency evidence and evaluate candidate families against that specific claim. Until then preserve STEP 7 STOP/UNKNOWN and do not implement Constitution Authority Context.
