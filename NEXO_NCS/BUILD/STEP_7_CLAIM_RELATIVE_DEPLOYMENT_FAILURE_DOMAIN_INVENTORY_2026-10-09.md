# STEP 7 — Claim-Relative Deployment / Failure-Domain Inventory
Date: 2026-10-09
Status: RESEARCH SYNTHESIS — ROOT CHOICE AND IMPLEMENTATION STOP RETAINED

## Purpose
Execute the next action recorded in STATUS and the Trust Function / Root Role Map: identify the protected claims Nexo must eventually support, the trust functions each claim depends on, the relevant failure domains, and the final effect-capable boundary. This is an inventory, not a selection of a physical root, a commissioning ceremony, or an implementation.

## Evidence used and limits
- NEXO MASTER architecture: genesis trust bundle, external/independent initial authority, measured boot only where the threat model requires it, and separate identity/authority/recovery.
- NCS Trust Function / Root Role Map, minimum real bootstrap root basis, bootstrap composition contract, and their adversarial attacks.
- AB104.199: a valid signature, hash, monotonic sequence, or internally consistent history does not independently establish current root authority; root replacement and root-compromise recovery require a previously governed path.
- AB104.451/.452 and AB104.563–565 (as cross-referenced in NCS): when current authority is UNKNOWN, preserve evidence but do not infer authority; new epoch, new trust basis, and current authority are different predicates.
- AB104.571: recovery validation can become stale before activation; dependencies and the recovery fence must still be valid at the final protected transition.
- AB105.000R: aggregate completion is bounded by the actual covered population/properties; a completed check cannot be widened to universal coverage.
- AB105.080R: STOP/revocation, cached authorization, in-flight operation, cancellation, observed effect and authorization provenance remain distinct.
- AB105.116R audit-pass history: reconciliation completion alone was not frozen as sufficient reauthorization evidence; a separate current authority-establishment event may be required, and no semantic choice was authorized there.
- These are historical research/design inputs. They do not prove Nexo has the corresponding production roots or enforcement.

## Claim-relative inventory

| Protected claim / capability | Trust functions that matter | Failure-domain / independence question | Current unknown / stop condition |
|---|---|---|---|
| Establish the first governing Constitution and owner-authority domain | Constitutional governance; bootstrap recognition; policy-source provenance; continuity | What independently recognizes the initial commissioning evidence without depending on the Nexo state being commissioned? Who/what is authorized to assert initial ownership, and under what scope? | No concrete, independently recognized commissioning basis/ceremony is selected or implemented. Do not infer owner authority from a model, app account, local store, signature, password, or genesis bundle alone. |
| Recognize Kevin as the initial human authority under the agreed Constitution | Human identity/credential; constitutional authorization; freshness/revocation; protected Core boundary | Identity proof and authority grant must not validate each other circularly. Which credential(s) are bound to the initial owner, and what happens if they are lost, copied, coerced, or compromised? | The authority principle is known, but the exact ceremony, credential binding and independent recovery basis remain unresolved. Recognition technology is not itself the root. |
| Future succession to a designated successor (including the user's stated daughter succession intent) | Constitutional succession; ordering; identity; recovery; revocation; enforcement | The succession rule must be established before the crisis; successor identity alone cannot enact succession. How are conflicts, premature claims, incapacity, compromise and predecessor cutoff handled? | No succession event is currently authorized by this inventory. A future intent is not a present credential or self-executing authority transfer. |
| Hands-free wake / perception | Sensor/device integrity; identity of the local runtime; privacy policy; evidence provenance | A wake-word match is an observation about an audio signal, not proof of the speaker's constitutional authority. Can sensor input be spoofed or routed through an untrusted provider? | Voice recognition must not become the sole root or bypass later action-specific authorization. |
| Personal memory / continuity across devices | Storage integrity; history provenance; encryption/key protection; current authority; synchronization conflict handling | Do devices/backups share the same account, administrator, provider, recovery operator or update channel? Can a copied/stale snapshot resurrect revoked authority? | A correct hash or replicated copy proves neither canonical history nor current authority. Divergence or unknown currentness must remain explicit. |
| Read or use Vault credentials | Credential/key protection; access authority; device/user identity; policy; revocation/currentness | Is the credential store's recovery/admin path independent of the authority it protects? Does provider support expose bypass paths? | Encryption/storage integrity alone does not authorize a read or use. No Vault mechanism is selected here. |
| Control TV or other external devices | Constitutional authority; per-action policy/capability; device/adapter identity; current state; final resource enforcement; effect observation | What is the last component capable of changing the device? Does it independently enforce current authorization, and are all bypass paths known? Is control possible without installation only through an explicitly supported external interface? | No generic Nexo claim can guarantee control or enforcement across arbitrary TVs/devices. If the last effect boundary is unknown, the specific effect remains UNKNOWN/STOP. |
| Autonomous offline study/programming/teaching | Data/source provenance; execution isolation; resource limits; update integrity; authority to persist/promote knowledge | Which operations are purely local and reversible, and which can alter protected files, credentials, network state or external resources? Are model/provider and update paths independent of policy authority? | Offline availability does not create authority. Knowledge remains EXPERIENCE/EVIDENCE until validated under a governed policy; autonomy does not widen permissions. |
| Software/model/provider update | Update authority; integrity/measurement; version lineage; rollback protection; constitutional compatibility | Can the update signer, provider, deployment pipeline and recovery operator collude or share one failure domain? Is new state validated before old trust is retired? | Provider replacement must not silently replace identity, Constitution or trust root. No update root is selected. |
| Recovery after loss/compromise | Independent recovery authority; dependency closure; final TOCTOU gate; revocation; succession | Does recovery still depend on the compromised root, its key, its backup, its verifier or its operator? Is authority re-established by a separate protected event after reconciliation? | If no independent recovery basis survives, result is TRUST_UNRECOVERABLE / UNKNOWN, not a fabricated successful recovery. |
| STOP/revocation for any protected action | Current authority; policy; epoch/fence; enforcement boundary; operation/effect reconciliation | Is STOP enforced at the final effect-capable boundary or only requested in local state? Can queued/in-flight work still act? What propagation bound is actually supported? | STOP requested, revocation issued, cache invalidated and fence issued are not enforcement proof. Unknown enforcement blocks claims that require it. |

## Fundamental result
The root problem is not simply “choose a trusted device/key.” There are two different unresolved questions that must not be collapsed:

1. **Legitimacy / recognition:** what pre-existing, independently recognized basis makes the initial constitutional/owner-authority establishment legitimate?
2. **Claim-relative sufficiency and enforcement:** for each protected claim, which dependencies and failure domains must be trusted, what currentness/revocation evidence is required, and where is the last boundary capable of enforcing the decision?

A mechanism can be authentic and intact yet insufficient for the claim; it can also be sufficient for platform integrity but not for constitutional legitimacy. AB105.000R adds that even a complete appraisal is only as broad as its declared coverage. AB105.080R adds that a valid authorization decision is not proof of continuing authority or final effect enforcement. AB105.116R preserves an additional open seam: reconciliation cannot silently manufacture reauthorization provenance.

Therefore **there is no defensible universal GenesisRoot choice yet**. Step 7 must first define the minimum recognition basis and its claim scope, plus explicit deployment assumptions and failure domains. If the owner cannot currently supply or independently establish that basis, the correct design result is UNKNOWN/STOP, not to appoint a model, provider, device, password, snapshot, epoch or recovery process as root by default.

## Minimum gate before any implementation
Do not implement until all of the following are explicit and independently reviewable:
1. The commissioning/initial-recognition ceremony and what exactly it authorizes.
2. The credential/identity binding for the initial owner, kept distinct from the authority grant.
3. The claim scope and dependency/failure-domain closure of each root-critical assertion.
4. Currentness, revocation, offline behavior and propagation limits.
5. Root compromise, recovery and succession rules established before the relevant crisis.
6. The target-specific last effect boundary for each external action and evidence of enforcement/bypass closure.
7. A rule for unknown/conflicting support: preserve evidence, block only dependent transitions, never choose by timestamp, version, availability or provider confidence.
8. A testable distinction between AUTHORITY_ESTABLISHED, AUTHORIZED_TO_START, AUTHORITY_AT_EFFECT, EFFECT_OBSERVED and EFFECT_UNKNOWN.

## Not authorized by this inventory
- No physical root, TPM/KMS/vendor, threshold, immutable-provisioning or multi-root design selected.
- No general trust registry, quorum/independence engine, or universal root abstraction.
- No code, runtime claim, policy grant, credential use, device action or succession event.
- No AB105/TLC/Kafka reruns and no AB105.117R.
- STEP 7 implementation STOP remains in force.

## Next research decision
Compare the concrete commissioning/owner-recognition candidate families only after the user/device deployment assumptions and protected action boundaries are stated. The first candidate comparison should be limited to the initial legitimacy question; do not fold identity, measured boot, revocation, recovery and external-effect enforcement into a single opaque “trusted” result.
