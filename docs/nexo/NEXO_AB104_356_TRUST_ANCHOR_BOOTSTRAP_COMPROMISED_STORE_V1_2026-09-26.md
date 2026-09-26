# NEXO AB104.356 — Trust-anchor bootstrap under compromised/rolled-back store V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 6024 identifies an unavoidable bootstrap boundary: initial trust-anchor manager authority must be established during initial configuration, potentially through an out-of-band mechanism. It also requires recovery from compromise/loss of a trust-anchor manager without simply reinitializing every store, and requires replay detection because old management transactions can reintroduce compromised anchors. citeturn0search0turn0search1

## Finding
Nexo cannot bootstrap current authority solely from a recovered trust store when that store may itself be rolled back or compromised. The recovery root must come from a separate, pre-established or independently protected authority path.

Candidate bootstrap evidence:
bootstrap_root_id + bootstrap_authority + trust_store_id + prior_authority_frontier + recovery_transition_digest + new_authority_epoch + new_store_incarnation + scope + freshness + recovery_policy

Candidate states:
BOOTSTRAP_AUTHENTIC | FRONTIER_ADVANCED | OLD_STORE_REJECTED | BOOTSTRAP_UNAVAILABLE | BOOTSTRAP_SCOPE_MISMATCH | UNKNOWN | CONFLICT

## Minimum anti-resurrection rule
A recovered store can become executable only if an authority independent of the rolled-back state authenticates a transition to the new frontier.

ROLLED_BACK_STORE != CURRENT_AUTHORITY
OLD_STORE_SIGNATURE != BOOTSTRAP_TRUST
INDEPENDENT_RECOVERY_AUTHORITY + NEW_EPOCH + NEW_STORE_INCARNATION => candidate CURRENT

If no independent/bootstrap path exists, Nexo must remain UNKNOWN/STOP; inventing current authority from the damaged store would circularly trust the evidence being recovered.

## Important distinction
The bootstrap mechanism is itself a trust dependency and therefore must enter the dependency graph. A “root” that is only justified by the compromised store is not an independent root.

## Status
Exact bootstrap mechanisms (offline root, hardware-protected root, quorum/multi-party recovery, delegated recovery authority), compromise thresholds, rotation ceremony and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.357 — compare independent bootstrap models (offline root, hardware root, quorum/multi-party recovery, delegated recovery) and determine which claims each can and cannot establish for Nexo.
