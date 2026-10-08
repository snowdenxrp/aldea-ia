# STEP 7 — Bootstrap Legitimacy Gap / Root-Basis Decision — 2026-10-08

Status: ARCHITECTURAL GAP ISOLATED — NO ROOT MECHANISM SELECTED

## Why this record exists

This is a cross-contract synthesis, not a repeat investigation. It consumes the existing Trust Function / Root Role Map and the prior Genesis Trust Foundation, Trust Foundation, Bootstrap Composition, Independence/Failure-Domain, Constitution Authority Context, Policy Evidence Boundary, and future-countereffects records.

## Cross-contract result

The reviewed contracts converge; no contradiction was found in their core invariants:
- A Trust Foundation must precede constitutional recognition, not be created by it.
- Constitution Authority Context may recognize only a constitutional regime already established through a protected trust basis.
- Policy-context/evidence boundaries consume governed context; they cannot manufacture the trust basis that gives that context authority.
- Recovery, identity, integrity/measurement, policy appraisal and governance remain separate semantic responsibilities.
- Hash, signature, version, epoch, local storage, snapshot, caller metadata, provider output or function naming cannot independently establish current constitutional legitimacy.
- If legitimacy/currentness/revocation/dependency closure is unresolved, downstream authority remains UNKNOWN and implementation must not pretend otherwise.

The contracts are design-compatible. The missing premise is not another field or resolver. It is the initial and ongoing legitimacy basis from which Core can recognize the constitutional root without trusting the candidate root to certify itself.

## Precisely stated open question

What pre-established, independently recognized basis authorizes Nexo to recognize the initial constitutional regime and later legitimate successors, and how is that basis preserved or safely unavailable across loss, compromise, migration, disconnection and recovery?

This is narrower than "which cryptographic root should Nexo use?" Cryptographic keys, TPMs, secure storage, signatures and attestation may enforce or evidence a chosen legitimacy rule; they do not choose that rule by themselves.

## Root-basis families to evaluate (not selected)

| Candidate family | What it could contribute | What it cannot prove alone / primary question |
|---|---|---|
| Owner-authorized commissioning ceremony | A human-recognized initial act binding the Constitution to the intended owner/authority | How does Nexo authenticate the ceremony and bind the person/authority to a protected credential without assuming the same untrusted device? What if the owner is unavailable or coerced? |
| Pre-provisioned external genesis authority | An initial signed/provisioned constitutional reference from a separately governed source | Who governs that source, how was its authority established, and what is the migration/compromise path? Avoid vendor lock-in and treating provisioning infrastructure as invisible authority. |
| Hardware/platform root | Bounded integrity, key protection or measurement properties | Does not alone establish the human/constitutional legitimacy rule; identify firmware, manufacturer, update, recovery and common-mode assumptions. |
| Multi-custodian / threshold ceremony | May reduce dependence on one custodian for a defined transition | Threshold count does not prove independence or constitutional legitimacy; define membership, common dependencies, compromise tolerance and conflict behavior. |
| Immutable or previously protected local root | Can preserve a prior recognized basis and resist certain unauthorized changes | Initial legitimacy still must be established; immutability cannot make a fabricated or illegitimate genesis legitimate. |
| Hybrid basis | May combine human legitimacy, external provisioning and platform enforcement | Composition itself needs a governed rule and dependency closure; do not count overlapping supports as independent or let technical evidence silently override constitutional authority. |

These are evaluation families, not recommendations or a list of mechanisms to implement. More than one may be rejected after threat-model review.

## Decision criteria required before choosing

For each candidate, explicitly answer:
1. Legitimacy: who or what recognizes the initial Constitution and why is that recognition legitimate under Nexo's governing principles?
2. Independence: can the candidate root, its own software, its provider, its recovery path or its stored metadata self-certify?
3. Authority scope: what exact claims can it establish, and what authority is explicitly outside that scope?
4. Currentness and succession: how are amendments, revocation, compromised custodians, conflicting successors and stale snapshots handled?
5. Loss/disconnection: what remains safely usable offline, for how long, under what pre-authorized scope, and what becomes UNKNOWN?
6. Recovery: what independent basis remains if the normal root is lost or compromised? If none, what safe non-action state is defined?
7. Failure domains: which dependencies are shared, and which independence claims can actually be supported?
8. Migration: how can a future device/provider/storage/cryptographic mechanism be replaced without silently changing who holds authority?
9. Countereffects: does the choice create a single point of capture, unrecoverable dead-end, hidden vendor authority, or an unrestricted emergency override?
10. Evidence: what raw evidence and verification procedure could establish the relevant properties, and what can never be proven by that evidence alone?

A candidate that cannot answer a required criterion remains UNKNOWN/PENDING; do not compensate by adding metadata, a universal quorum, or a generic trust engine.

## Safe interim semantics

Until a root basis is selected and implemented through an independently recognized protected boundary:
- Constitution Authority Context establishment remains BLOCKED.
- Protected Policy authority/evidence establishment remains BLOCKED where it depends on that missing context.
- Design and adversarial analysis may continue; no implementation may claim the root exists.
- Non-dependent functions may continue only when their authority and safe behavior are independently established by existing Constitution/contracts.
- Unknown legitimacy blocks transitions that depend on it; it does not automatically require shutting down every unrelated safe function.
- Preserve prior state/history and competing succession evidence; do not automatically select a branch, merge, retry, or restore authority.

## Do not reopen / do not add

Do not repeat generic self-signing, hash-as-authority, snapshot resurrection, provider-rooting, recovery self-rooting, version/epoch confusion, and common-mode attacks already recorded unless a concrete new candidate introduces a materially different attack.

Do not add a generic trust registry, universal quorum/independence engine, one-size-fits-all GenesisRoot, arbitrary root selector, trusted=true, recovery override, new epochs/fences/queues/retries, or implementation wrappers to conceal the missing basis.

## Next exact action

Use MASTER's Kevin/Constitution authority principles and the already-reconciled AB/P evidence to make an explicit architectural decision about the legitimacy source and commissioning/succession model, then evaluate only the candidate family/families that actually fit that decision. Do not choose a physical key, TPM, provider, storage or cryptographic protocol before the legitimacy rule is explicit. Attack the chosen semantic root-basis contract, including initial commissioning, compromise, unavailable owner, conflicting succession, offline revocation and device/provider migration. Implementation remains prohibited until the protected basis is independently recognizable and the future-countereffects gate passes.
