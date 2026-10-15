# STEP 7 — Initial authority bootstrap decision gate — 2026-10-15

Branch: `ncs-clean-architecture`  
Status: ARCHITECTURE DECISION SUPPORT / NO TRUST PATH SELECTED / NO IMPLEMENTATION

## 1. Purpose

Continue from the existing trust-domain independence inventory without repeating Android, key, device, CI, or Scope A contract research. Determine what must be true for Nexo's initial constitutional authority to be legitimate without placing an external authority above the owner.

This document is a synthesis and decision gate, not a ratification, ceremony, or implementation authorization.

## 2. Core result: initial trust cannot be derived from zero

Cryptography can establish that a statement is bound to a key and that later statements chain to a previously trusted key. It cannot, by itself, prove that the first key was legitimately selected by the intended owner, that the owner saw the exact content, or that the first selection was constitutionally legitimate. Those are bootstrap premises that must be explicitly accepted and evidenced; they cannot be manufactured by adding another signature, app, device, verifier, or CI run.

Therefore, “no authority above the owner” is compatible with a technical verifier, but only if their roles stay distinct:

- **Owner:** the normative source of the initial constitutional decision and its scope.
- **Genesis trust basis:** the explicitly stated premise by which that initial decision is accepted as the starting point. It is not an authority that outranks the owner.
- **Verifier:** a technical role that checks specified evidence against an already justified key/policy basis. It does not decide who should be owner or make the Constitution legitimate by itself.
- **Relying/enforcement boundary:** separately checks that a current, properly verified authority context is allowed for a specific protected effect.

If the verifier's identity, policy, or trusted inputs are established only by the same component being checked, the chain is circular. Naming a second app, phone, key, server, or CI job does not break that circle by itself.

## 3. Assurance levels already implied by prior evidence

| Level | Honest claim | Current status | Can it authorize protected effects? |
|---|---|---|---|
| L0 — candidate locator | A repository revision identifies a candidate artifact | Partially available | No |
| L1 — self-reported convenience record | A selected app/runtime records that a review/decision allegedly occurred | Not implemented; would be self-reported unless its boundary is established | No |
| L2 — independent owner-intent evidence | Evidence binds the exact reviewed content and narrow decision to the owner's intent, with justified verifier provenance and freshness, even against the declared malicious-Core/compromised-OS threats | NOT ESTABLISHED | No, not by Scope A alone |
| L3 — constitutional authority/effect admission | A current authority context is legitimately derived from Genesis/Constitution and enforced at every applicable protected sink | NOT ESTABLISHED | Only after separate construction and proof |

The current project goal is not satisfied by L0 or L1. Quietly relabelling L1 as L2 would be a security downgrade, not progress.

## 4. What the accepted POCO premise does and does not buy

The previously accepted premise is narrowly limited to the POCO screen faithfully presenting content during a possible first recognition ceremony. It is not a finding that the Android OS, app/Core, signing request, local storage, verifier, or later runtime is trustworthy.

Even with an honest presentation premise, the ceremony must still bind the exact reviewed artifact and narrow decision to the evidence that is verified. Otherwise, the owner may see one thing while the key signs another. A key protects key custody; it does not automatically establish this visual-to-electronic binding.

No ceremony has occurred, and no owner review or ratification event may be inferred from the prior display of a draft.

## 5. Minimal missing capability

The unresolved capability is not “a stronger device” in the abstract. It is a **non-circular path from the owner's deliberate initial decision to independently checkable evidence**, with all of the following grounded:

1. A canonical, complete Constitution/candidate and explicit scope/version identity.
2. A presentation/approval path whose trust assumptions are stated and adequate for the selected threat model.
3. Binding between what the owner reviewed, the exact bytes or canonical representation endorsed, and the narrow meaning of the endorsement.
4. A verifier identity, implementation/policy provenance, and trusted input basis that do not derive solely from the untrusted producer.
5. Freshness, replay, stale-version, revocation, and recovery rules grounded in an already justified source of truth.
6. A strict separation between candidate review/endorsement and constitutional ratification or permission to execute effects.
7. A separately demonstrated enforcement boundary and bypass analysis for any future protected effect.

Items 1–7 are acceptance obligations, not permission to invent a new registry, generic trust framework, signer, external service, ID scheme, or transaction layer.

## 6. Constrained decision

**Recommended default: preserve the L2 threat objective and keep STOP rather than silently accepting L1.** This follows the stated project goal of a verifiable constitutional authority and the current inventory finding that no existing domain satisfies the complete chain under the declared threat model.

A weaker L1 record may be useful for ordinary operations someday, but it would not solve the initial-authority problem and must not be allowed to flow into Scope B/C. It is not a substitute for L2.

This recommendation does not claim L2 is impossible in principle. It says that no currently selected or evidenced path in the present setup demonstrates it. A future path must identify how its verifier and presentation basis are first trusted without granting that verifier constitutional authority over the owner.

## 7. Next work — narrow, no implementation

Do not repeat broad product/device research. The next useful analysis is to formalize the **Genesis premise itself** as an explicit trust assumption and test it against the existing Genesis Trust Foundation, owner-approval, succession/recovery, and effect-boundary contracts:

- Which initial facts are accepted by direct owner decision, rather than purportedly “proved” by cryptography?
- What exact evidence can record that decision without claiming more than the ceremony actually establishes?
- Which verifier/policy is trusted before it verifies the first evidence, and what is the provenance of that trust?
- What happens if that verifier or its policy is later lost, replaced, revoked, or disputed?
- How is the initial record prevented from authorizing effects until Scope B/C independently passes?

If these questions expose a circular trust dependency, record the missing premise and retain STOP. Do not create keys, signatures, hashes, a ceremony, an APK, a host, or code to simulate progress.

## 8. Status

- STEP 7: **OPEN / STOP / UNKNOWN**.
- Initial owner-intent evidence path: **NOT ESTABLISHED**.
- Verifier provenance/currentness: **NOT ESTABLISHED**.
- Constitutional ratification: **NOT RECORDED**.
- Protected-effect sink/bypass closure: **NOT ESTABLISHED**.
- No implementation, source/test/workflow change, key, signature, artifact freeze, device operation, or commissioning was performed or authorized by this analysis.

## Related evidence

- [Existing trust-domain independence inventory](STEP_7_EXISTING_TRUST_DOMAIN_INDEPENDENCE_INVENTORY_2026-10-15.md)
- [Owner approval trust-path comparison](STEP_7_OWNER_APPROVAL_TRUST_PATH_COMPARISON_2026-10-15.md)
- [Claim-relative failure-domain and effect-class inventory](STEP_7_CLAIM_RELATIVE_FAILURE_DOMAIN_AND_EFFECT_CLASS_INVENTORY_2026-10-15.md)
- [Scope A review-evidence minimum acceptance contract](STEP_7_SCOPE_A_REVIEW_EVIDENCE_MINIMUM_ACCEPTANCE_CONTRACT_2026-10-15.md)


## 9. Reconciliation with the existing Genesis contracts

The pre-existing contracts already say that the Genesis basis must be independent of the Nexo state it establishes, and that the Constitution Authority Context must come from an already recognized foundation. They do **not** require that a third party outrank the owner constitutionally.

The terms “external” and “independent” must be read relative to the **claim and failure domain**, not as automatic delegation of constitutional sovereignty:

- An independent verifier may check whether evidence satisfies a policy the owner has deliberately designated. It is a technical witness/relying component, not the source of the Constitution's legitimacy.
- The owner remains the normative source of the initial constitutional decision and may define the verifier's permitted scope. But that owner decision alone does not magically prove which bytes were displayed, which bytes were signed, or that the evidence channel was uncompromised.
- The verifier's own software, policy, key material and provenance must have a stated prior basis. If only the verifier itself claims that basis is trustworthy, the bootstrap remains circular.
- Therefore, “no authority above the owner” does not remove the need for an independently grounded evidence channel. It prevents that channel from silently becoming a superior constitutional authority.

This reconciliation leaves one irreducible distinction:

**Normative genesis:** the owner is the origin of the decision.  
**Technical evidence of genesis:** the system must justify the ceremony assumptions and show what the evidence actually binds.  
**Later authority/enforcement:** must derive from the recognized Genesis/Constitution context and be enforced separately at the protected sink.

The existing contracts provide the semantic shape for these separations; they do not currently supply a real ceremony, verifier provenance, or runtime boundary. No contract conflict justifies adding a new generic root or allowing Nexo to self-authorize.



## 10. Feasibility boundary after cross-checking existing recovery/succession evidence

The existing AB104.452/AB104.453 research already covers pre-established recovery roots, recovery governance, custody/loss/compromise, succession, revocation, replay, and the risk of a hidden permanent super-root. It is reused here; it is not being rerun. Its governing conclusion is that recovery authority must be pre-established, bounded, independently grounded, and unable to appoint itself or turn into normal operational authority.

The remaining blocker for the *initial owner-intent claim* is earlier than root rotation or recovery:

- The current accepted POCO premise covers only faithful presentation of the screen during a possible ceremony.
- It does not establish that the software requesting approval binds the presented content to the exact bytes being endorsed, that the OS/input path cannot substitute the decision, or that the verifier/policy is independently grounded.
- A signature/hash can preserve a binding after those inputs are established; neither can supply the missing premise.
- An independent verifier can check evidence under a policy, but cannot bootstrap its own policy/provenance merely by declaring them trusted.
- A future recovery rule can preserve or replace an already justified root; it cannot retroactively manufacture legitimacy for the first one.

Accordingly, the current deployment has no demonstrated path satisfying L2 against malicious Core/app **and** compromised OS. This is a bounded finding about the evidence and capabilities currently selected, not a proof that all possible systems are incapable of satisfying L2.

### Only two honest future directions are currently visible

**Direction A — explicitly narrow the ceremony threat model.** Accept a clearly written environmental assumption for the initial ceremony that covers the presentation, input/approval path, and binding of the exact canonical artifact to the owner's decision. Record that the resulting evidence does not resist compromise of the components included in that assumption. This is not yet authorized or proven; the previously accepted screen-only assumption is insufficient as written.

**Direction B — retain the full L2 threat objective.** Introduce no mechanism by assumption: first identify a concrete independent presentation/approval and verifier-provenance path, plus its initial recognition basis and failure/recovery model. No such path is presently selected or evidenced. It may require resources or capabilities not currently available on the user's phones.

These are not choices about who has constitutional sovereignty. In either direction, the owner remains the normative source of the initial decision. They are choices about which technical/environmental assumptions the system can honestly claim to withstand.

### Decision

Do not silently downgrade L2 to a self-reported record. Do not treat the accepted POCO screen premise as broader OS or application trust. Do not proceed to root creation, key enrollment, approval ceremony, or implementation while this gap remains.

Status remains **OPEN / STOP / UNKNOWN**. The next useful work is to turn the threat-model boundary into an explicit claim-to-assumption table for Direction A versus Direction B, using the already completed research; no additional broad device/root search is warranted at this stage.



## 11. Claim-to-assumption comparison — no direction selected

| Claim / property | Direction A: bounded ceremony assumption | Direction B: preserve L2 |
|---|---|---|
| Owner is the normative source of the decision | Constitutional premise; must be explicitly recorded, not inferred from device possession | Same |
| Exact artifact reviewed equals artifact endorsed | Must be an explicit assumption or independently checked binding for the ceremony; screen-only premise does not cover it | Must be demonstrated by a trusted presentation/approval path and evidence verifier |
| Resistance to malicious Nexo Core/app | Not claimed if Core/app participates in the assumed trusted ceremony path; any excluded component must be named | Required by the declared threat objective |
| Resistance to compromised Android OS | Not claimed if the OS/input/approval path is included in the environmental assumption | Required by the declared threat objective |
| Verifier/policy provenance | Still needs a justified, bounded basis; an assumption cannot be disguised as verification | Must have a separately grounded provenance/recognition path |
| Freshness/replay/revocation | Still required for any later claim of currentness; ceremony evidence alone is not timeless authority | Still required, with verifier and enforcement basis included |
| Recovery/succession | Existing AB104.452/453 constraints apply; recovery cannot self-appoint or become unrestricted authority | Same, plus recovery must preserve the L2 trust objective |
| Protected effects | Not authorized by Scope A; separate Scope B/C and final-sink proof remain mandatory | Same |
| Current evidence status | **NOT ESTABLISHED** | **NOT ESTABLISHED** |
| What would make the direction honest | Explicitly state and accept the narrower failure model before the ceremony; do not advertise resistance to excluded compromises | Identify and prove the concrete independent channel and its initial recognition basis before implementation |

### Interpretation

Direction A is not a weaker cryptographic algorithm or a convenience setting. It changes the claim being made about the adversary. It may be operationally simpler, but any component trusted during the ceremony becomes part of the explicit trusted computing/environmental base for that claim. It must not be presented as L2.

Direction B retains the stronger objective but cannot proceed merely by declaring that a separate verifier exists. The verifier's trust anchor, policy, evidence channel, freshness, revocation and recovery must themselves have justified provenance. RFC 9334's Attester/Verifier/Relying Party separation supports this role separation, but does not select or bootstrap Nexo's first verifier.

**No automatic recommendation to choose A:** the project has not accepted this broader environmental assumption. **No false promise for B:** no concrete path currently demonstrates it. Therefore the safe project action is to preserve both as unresolved design boundaries and keep STOP until the required assumption or capability is explicitly selected and supported.



## 12. Existing-contract inspection — exact binding primitive

Reviewed the existing Scope A review-evidence contract, Owner Approval Trust Path Comparison, and Constitution Authority Context contract. This was a bounded contract check, not a repeat of platform/device research.

**What already exists:** the semantic requirements are explicit: identify the full candidate and scope; preserve recoverable content evidence; distinguish review from ratification; bind the human-visible presentation to the electronic object under a stated threat model; require verifier provenance/freshness; and establish Constitution Authority Context only from an already recognized trust foundation.

**What does not exist as established evidence:** no selected concrete mechanism currently demonstrates that the exact human-reviewed content and narrow decision are bound to the bytes received by an approval/signing path under the declared threat model. No trusted presentation/input component, independent verifier policy provenance, or production ceremony has been selected or demonstrated. The contracts specify the obligation; they do not implement or satisfy it.

The constitution reference/version/hash fields in the Authority Context contract are downstream semantic context, not a bootstrap mechanism. A content digest can identify bytes once canonicalization is defined, but cannot prove those bytes were what the owner saw. A signature can authenticate a statement relative to a key, but cannot establish the first key's legitimacy or current authority. These distinctions are already aligned with the Owner Approval Trust Path Comparison and NIST's electronic-versus-visual context distinction.

### Result

- Exact content/decision binding: **REQUIREMENT SPECIFIED; MECHANISM NOT ESTABLISHED**.
- First verifier/policy provenance: **NOT ESTABLISHED**.
- Initial owner-intent evidence under L2: **NOT ESTABLISHED**.
- Any protected-effect authorization derived from Scope A: **PROHIBITED / NOT AUTHORIZED**.

No additional abstraction or code field is warranted. The gap is a missing trust path/assumption, not a missing schema label. Preserve STOP until Direction A's narrower assumption is explicitly accepted or Direction B's concrete independent path is evidenced.

## 13. Owner decision — preserve L2 and STOP (2026-10-15)

The owner explicitly accepted the recommendation to retain Direction B: preserve the L2 threat objective and keep STEP 7 at STOP until a concrete independent owner-intent/presentation and verifier-provenance path is grounded. This is a project-governance decision recorded from the owner's direct response in the NCS conversation; this Markdown entry is not itself cryptographic proof of that decision and does not satisfy L2.

Consequences:

- Do not downgrade the target to an L1 self-reported convenience record or relabel it as L2.
- Do not reinterpret the previously accepted POCO screen-only premise as trust in Android, the app/Core, the input path, or exact content-to-approval binding.
- Do not create/enroll a key, initiate a ceremony, freeze/hash/sign the Constitution, select a verifier/host, install an APK, or implement a trust path merely to show activity.
- Keep existing Scope A acceptance design-only and non-authoritative; it does not ratify the Constitution, establish currentness, create Constitution Authority Context, or authorize any protected effect.
- Continue only with evidence-led analysis that can identify a concrete, non-circular L2 path or precisely demonstrate which required capability is missing. Reuse existing contracts and evidence; no duplicate abstraction or broad device research.
- Before any future implementation, require explicit evidence for exact reviewed-content/decision binding, verifier/policy provenance, freshness/revocation/recovery, and a separately proven protected-effect boundary and bypass closure.

Decision status: **Direction B selected as the security objective; implementation path NOT ESTABLISHED; STEP 7 OPEN / STOP / UNKNOWN.** No Constitution ratification, commissioning, key operation, ceremony, source/test/workflow change, or protected effect is authorized by this decision.
