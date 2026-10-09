# STEP 7 — Bootstrap Composition Contract Attack: Current Phone Candidate
Date: 2026-10-08
Status: FOCUSED CONTRACT ATTACK COMPLETE — SEMANTIC COMPOSITION CONTRACT SURVIVES; REAL SUPPORT PROVENANCE STILL UNKNOWN; IMPLEMENTATION BLOCKED

## Scope guard
This attacks the existing `STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md` using the current phone only as a candidate support source. It is not a general mobile-device audit and does not select a root mechanism.

The phone threat-model branch is closed. Only its architectural implication is used here: choosing a candidate channel does not prove that channel's enrollment legitimacy or evidence provenance.

## Existing contract under attack
The composition contract requires a bounded supportSet, exact claimScope, independence requirements, governed compositionRule, dependencyClosure, orderingContext and validityContext. It returns ESTABLISHED only if all required conditions are established, UNKNOWN for unresolved dependencies/independence/ordering/currentness, and INVALID when a required condition is disproven.

## Attacks
1. **Candidate self-enrollment.** Phone creates or stores a key and then presents that key as proof the phone was previously recognized. Result: circular; support provenance is not established. Composition must return UNKNOWN, not ESTABLISHED.
2. **Phone/app self-assertion.** App/session/Termux emits `approved`, `verified`, `current` or a typed support claim. Result: labels and types are caller data; no root authority is established. UNKNOWN.
3. **Self-signed genesis bundle.** Bundle signature verifies under a key authorized only by the same bundle. Result: circular authority; INVALID for the attempted self-root relation, with no genesis establishment.
4. **Hash-only support.** Constitution hash matches a presented bundle, but no independently grounded authority says who approved it or whether it is current. Result: content identity may be compared, authority/currentness remains UNKNOWN.
5. **Historical approval replay.** Previously valid phone approval is presented after amendment, revocation, recovery or context change. Result: signature/record history alone cannot establish currentness; UNKNOWN/HOLD until governed currentness is available.
6. **Fake independence.** A purported second support channel is the same phone's Termux, another app, or another key with shared account/recovery/provider/policy dependencies. Result: no independence credit absent dependency closure; UNKNOWN.
7. **Protected capability circularity.** Core-owned policy-evidence or Constitution Authority Context capability is implemented, but its only trust input is an ungrounded phone claim. Result: protected API shape does not repair the missing root; do not implement as if trust were established.
8. **Composition-rule overreach.** Multiple ungrounded supports are combined with AND, threshold, majority, or a policy-selected winner. Result: composition cannot manufacture authority from unsupported inputs; UNKNOWN/INVALID according to whether the rule itself is contradicted.
9. **Availability fallback.** Root/currentness is unavailable, so the system accepts cached phone state or last-known approval. Result: violates currentness contract; UNKNOWN/HOLD.
10. **Scope amplification.** A phone approval for initial commissioning is reused as approval for later policy, execution, recovery, amendment or succession. Result: scope mismatch; reject that promotion.

## What survives
The existing composition contract is semantically appropriate: it requires claim scope, governed composition, dependency closure, currentness and explicit UNKNOWN/INVALID outcomes. No new generic composition engine or trust registry is justified by these attacks.

## What remains missing
The contract cannot create the authenticity of its own inputs. A supportSet must be grounded in a pre-existing legitimacy basis and protected provenance before composition can establish anything. The current phone selection does not provide that basis. Nor do existing policy-evidence and Constitution Authority Context contracts: both are downstream protected boundaries whose authoritative inputs must already be recognized.

Therefore the unresolved item is not “how to combine phone keys” or “which device setting to inspect.” It is the precise source and protected establishment of the first legitimate authority statement, including its scope and currentness.

## Gate result
- Bootstrap composition contract: DESIGN SEMANTICS SURVIVE this focused attack.
- Current phone as genesis root/support by itself: NOT ESTABLISHED.
- Real genesis support provenance: UNKNOWN / PENDING.
- Genesis Trust implementation and Constitution Authority Context implementation: BLOCKED.
- No implementation, protected activation, production effects, or root mechanism selected.
- No Lúmina changes and no frozen AB/TLC/Kafka reruns.

## Next exact action
Reconcile this result with the existing trust-role map and protected authority-source boundary. Do not repeat generic self-signing/common-mode attacks. Determine whether the next design artifact should clarify an already-existing contract's input precondition or whether the repo already contains that precise premise. If it already exists, cite it and stop; do not duplicate it. If absent, write only the missing precondition, then attack that narrow claim before any implementation.
