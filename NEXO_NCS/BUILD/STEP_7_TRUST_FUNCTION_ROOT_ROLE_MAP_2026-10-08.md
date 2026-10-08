# STEP 7 — Trust Function / Root Role Map — 2026-10-08

Status: CONSOLIDATION DESIGN — NO ROOT IMPLEMENTATION AUTHORIZED

## Purpose and source hierarchy

This document consolidates already completed NCS and historical research into one semantic map. It is not a fresh claim that Nexo currently possesses a protected trust root, and it does not authorize implementation.

Required synthesis:
- MASTER: constitutional limits; cognition, authority, execution and verification are distinct; evidence provenance and dependency closure; fail-safe behavior.
- AB: evidence is claim-specific; metadata/revision/epoch is not authority; a valid record/signature is not proof of current legitimacy; UNKNOWN/STOP must remain explicit.
- P/P112: dependency closure must include authoritative reads, transitive/derived/predicate/range/aggregate dependencies and relevant versions/incarnations; incomplete closure remains UNKNOWN; don't invent global revisions or mechanisms to force closure.
- NCS STEP 7: protected evidence needs a protected establishment boundary; typed carriers and structural validation do not authenticate authority; no implemented Policy authority owner or Constitution Authority Context establishment path has been demonstrated.
- External cross-checks: RFC 9334 RATS and NIST SP 800-193 support role separation and function-specific roots. They are technical references, not Nexo's Constitution.

## Consolidated invariants

1. TRUST ≠ IDENTITY ≠ AUTHORITY ≠ CAPABILITY ≠ POLICY ≠ EXECUTION ≠ EFFECT ≠ VERIFICATION.
2. A root is meaningful only for a named claim, protected property, scope, threat model and dependency closure.
3. ROOT_VALID does not imply ROOT_SUFFICIENT, ROOT_INDEPENDENT, ROOT_CURRENT or AUTHORITY.
4. A signature authenticates a key's statement under a key relation; it does not alone prove the statement true, current, authorized for this scope, or free of compromise.
5. Hash/version/epoch/time/order/replica count/provider confidence are not constitutional authority by themselves.
6. Evidence cannot establish the trust anchor or appraisal policy that is being used to validate that same evidence.
7. Recovery may restore a bounded capability but cannot silently acquire ordinary governance or constitutional authority.
8. Different semantic roles may share physical components only if the claim-specific threat model explicitly accepts the resulting common-mode failure. Separate processes/keys/vendors are not proof of independence.
9. UNKNOWN dependency/currentness/order/authority blocks any transition whose safety depends on it. No permissive fallback.
10. No generic trust registry, universal quorum/independence engine, global GenesisRoot, or new mechanism unless a concrete claim and contract prove it necessary.

## Trust Function / Root Role Map

| Semantic role | What it may establish | What it must NOT establish by itself | Required protection / evidence questions |
|---|---|---|---|
| Constitutional / Governance Root | Which Constitution and succession/amendment rules govern; which authority domains and limits exist | Platform integrity, identity authenticity, operation execution, external-world truth | How was the governing constitutional basis established independently of the candidate it authorizes? Which amendment/succession path is valid? What happens if authority is conflicting or UNKNOWN? |
| Policy Authority / Policy Source | The governed policy reference, semantics, applicability scope, and protected provenance used to evaluate a claim | It must not grant itself authority from a caller-supplied PASS, label, hash, or evidence bundle; must not execute or commit | What protected Core-owned boundary establishes policy meaning/provenance? How are policy identity, scope, dependency closure, currentness and revocation bound? |
| Identity / Credential Root | Relationship between an entity/incarnation and credential/key material within a defined scope | Constitutional legitimacy, honest behavior, current authorization, or a successful effect | What root binds identity to key and scope? How are compromise, replacement, revocation and incarnation changes handled? |
| Integrity / Measurement Root | A bounded platform/software/configuration integrity or measurement claim | Full system trust, governance legitimacy, policy authority, or correctness beyond measured properties | Which components are covered, which are omitted, what reference values and freshness are trusted, and what is the measurement chain's own dependency closure? |
| Evidence / Attestation / Appraisal role | Evidence about a target and a claim-specific appraisal result under a governed policy | Authority simply because an appraisal passed; truth outside the appraisal's scope; self-authentication of trust anchors | Who established the appraisal policy and trust-anchor configuration? What are provenance, freshness, dependencies, scope, limitations and invalidation conditions? |
| Update Root / Update Authority | Authorization and integrity of a defined software/configuration/root update | Constitutional succession or broader authority than its explicit update scope | Can the currently protected boundary validate the new state before retiring the old one? Is there a safe failure path if activation fails? What rollback/replay conditions apply? |
| Recovery Root / Recovery Authority | A bounded restoration/containment procedure under pre-established recovery rules | Automatic constitutional succession, unrestricted new normal authority, or self-certified legitimacy | Who authorized the recovery rules before the crisis? Does recovery depend on the compromised component? What is the result when no legitimate recovery path can be proven? |
| Succession / Ordering role | Governed precedence between incompatible authority transitions, if the Constitution defines such precedence | Legitimacy from timestamp, epoch, chain length, majority, availability, replica count, or technical superiority alone | What prior rule resolves competing branches? What evidence binds events to that rule? If order/legitimacy cannot be established, preserve branches and STOP the transition. |
| Enforcement / Resource Boundary | A claim that the final effect-capable boundary enforces a specified precondition or fence | Proof that authority was legitimate, or that an external effect succeeded unless the resource boundary supplies that evidence | What is the last component capable of causing the protected effect? Is enforcement independent of the caller and all bypass paths? What can be proven about effect/no-effect? |
| Continuity / History / Checkpoint | Durable lineage, recorded events, branch preservation and reconstructable state tied to a history position | Truth, legitimacy, authority or canonicality merely because a record is durable or a snapshot is newer | Are provenance, causal relations, branch conflicts and invalidation preserved? Can history be reconstructed without erasing conflicting evidence? |
| Emergency containment role | A pre-authorized bounded stop/isolation action to reduce harm | Unrestricted governance, permanent succession, policy rewriting or authority expansion | What exact scope, triggers, duration and exit conditions are constitutional? How is the emergency action audited and prevented from becoming a universal override? |

These are semantic responsibilities, not a requirement to create one component per row. Some rows may be implemented by one protected mechanism; some may need separate mechanisms. That choice is not made here.

## Separation and composition rules

### Mandatory semantic separation
- Governance legitimacy vs identity authentication.
- Policy authority vs evidence appraisal.
- Recovery authority vs normal/constitutional authority.
- Integrity/measurement claims vs governance claims.
- Assurance result vs authorization decision.
- Authorization vs execution and external effect.
- Continuity/history integrity vs truth or legitimacy of the recorded content.

### Physical sharing is conditional, not categorically forbidden
Two roles may share a physical component only after evaluating whether its compromise/failure could invalidate both roles for the relevant claim. If yes, that shared dependency is a common-mode dependency and cannot be counted as independent support. If the dependency closure is incomplete, independence is UNKNOWN.

No blanket claim that all roots must be physically separate is justified. Equally, no claim that distinct keys/processes/providers are independent is justified without failure-domain analysis.

### Composition
For claim C, composition must specify:
- exact property, scope and threat model;
- participating supports and their roles;
- governing composition rule;
- claim-relevant dependency and failure-domain closure;
- currentness, revocation and succession context;
- conflict/ordering semantics;
- invalidation propagation;
- what the output establishes and what it explicitly does not establish.

Output semantics:
- ESTABLISHED only for the exact claim and scope when all required conditions are supported.
- INVALID when a required condition is disproven.
- UNKNOWN when required evidence, closure, currentness, authority or ordering is unresolved.

A valid result for one role cannot be promoted into a stronger role without a separate explicit composition contract.

## Bootstrap and recovery consequence

A candidate genesis bundle cannot authenticate its own authority. A protected store can preserve bytes but cannot alone establish current constitutional legitimacy. A provider/model can propose candidate material but cannot become the trust root. A recovery key cannot make itself an independent recovery authority. A historically valid snapshot cannot become current solely because no newer snapshot is available.

Therefore the bootstrap problem remains a real architectural boundary: identify the pre-established source of legitimacy or explicitly accept a limited safe non-action state. Do not hide the gap with metadata or a synthetic API.

## Connection to existing NCS STEP 7

Already closed/verified boundaries remain closed:
- STEP 3A isolation, STEP 3B protected-transition composition, STEP 3C conditional persistState integration.
- STEP 4 final semantic validation, STEP 5 outcome classification, STEP 6 reconciliation boundary, subject to their documented limits.
- ObservationEnvelope/MissionCandidate separation and claim-specific equivalence semantics; missing causal dimensions remain UNKNOWN.
- The bounded 8-step admission semantics remain closed.

Do not infer from those closures that a Genesis Trust Foundation, protected Policy Authority owner, or Constitution Authority Context implementation exists.

Current hard stop:
- No implemented protected Policy authority owner was found.
- ClaimEnvelope.policyContext is a carrier, not an authority source.
- Structural validation, final validation, conditional persistence, a resolver output, or caller-supplied provenance cannot be repurposed as the protected establishment boundary.
- No current protected establishment path for Constitution Authority Context has been demonstrated.

The next design question is specifically: what is the smallest Core-owned authority boundary that can establish the governed Constitution/Policy source and its provenance from a legitimacy basis not self-created by that same boundary? This question must be answered before implementation, not patched around.

## Adversarial checks required before design closure

1. Candidate signs its own genesis and declares itself current.
2. Old valid root/snapshot is replayed after a newer succession or revocation.
3. Identity key is valid but the custodian/authority is compromised.
4. Recovery path shares the compromised root and falsely claims independence.
5. Two different verifiers share the same policy source, update pipeline or recovery operator.
6. Measurement evidence is valid but only covers a subset of the property claimed.
7. Multiple supports pass individually but share a material failure domain.
8. A provider supplies a PASS plus authoritative-looking provenance fields.
9. Policy reference matches but scope, dependency closure or freshness differs.
10. A recovery action attempts to widen its own scope into ordinary authority.
11. Two succession branches conflict and wall-clock time/epoch/replica count suggests a winner without constitutional precedence.
12. Storage is intact but the stored authority is revoked or no longer current.
13. Root update retires the old root before the new root is independently verified.
14. Unknown dependencies are silently treated as absent or independent.
15. A continuity checkpoint is mistaken for proof that the external effect occurred or was legitimate.

Expected outcome for unresolved legitimacy/currentness/dependency/order: preserve evidence and branches, mark UNKNOWN, block only transitions that depend on the unresolved claim, and retain only safe functions expressly allowed by the governing Constitution. No automatic merge, retry, succession, or authority promotion.

## Decision

This map consolidates prior findings; it does not claim that a physical or implemented trust root exists.

- Trust roles and their non-interchangeability: DESIGN CONSOLIDATED.
- Which roles must be independent: claim/threat-model dependent; unresolved until concrete claims and dependency closure are specified.
- Which roles may share a physical mechanism: conditional; no universal answer.
- Protected constitutional/policy source owner in current repository: NOT FOUND.
- Genesis trust implementation: PENDING a legitimate protected root basis.
- Constitution Authority Context implementation: BLOCKED.
- Implementation of a generic trust registry/engine: NOT AUTHORIZED.

## Next exact action

Cross-check this role map against the existing Constitution-to-Policy binding, bootstrap composition, genesis trust, independence/failure-domain and protected-evidence attack documents. Record only actual contradictions or missing premises. If no contradiction remains, define the smallest Core-owned protected authority-source contract and attack it before implementation. Do not reopen completed investigations or create another general trust abstraction.
