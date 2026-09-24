# PG-009 — Emergency-Stop Observability and Proof of Enforcement
Date: 2026-09-23
Status: OPEN — architecture/design phase; not implementation evidence.

## Research question

After Nexo issues a critical STOP, what evidence is sufficient to distinguish:

- STOP requested;
- STOP delivered;
- STOP accepted;
- STOP enforced at the declared control boundary;
- STOP independently verified;
- external-world effects reconciled?

A software acknowledgement is not sufficient proof of enforcement.

## Research cross-check

NIST AI RMF identifies real-time monitoring, shutdown and human intervention as practical safety approaches and stresses that safety mechanisms must be appropriate to context and severity. NIST's 2026 work on deployed-AI monitoring also notes that post-deployment monitoring is important while methods and terminology remain immature. citeturn0search48turn0search12

NIST SP 800-53 treats monitoring and independent assessment as assurance activities, and its PE-10 emergency-shutoff control separates the emergency shutoff capability from ordinary system operation. These are control/assurance analogies, not proof that Nexo itself satisfies them. citeturn1search48turn2search13

NASA IV&V guidance emphasizes objective, independent evidence and testing under nominal and off-nominal conditions. This supports treating STOP enforcement as an evidence-producing state rather than a log message. citeturn1search1turn1search5

ISO 13850 defines an emergency-stop function for machinery and provides a useful design analogy: an emergency function has a declared safety purpose and boundary. It is not directly applicable to a software agent. citeturn0search0

## Core conclusion

Nexo must not use a single boolean such as `stopped=true`.

The minimum evidence ladder is:

1. STOP_REQUESTED
   - authorized emergency request exists.

2. STOP_DELIVERED
   - the emergency path has evidence that the request reached the enforcement component.

3. STOP_ACCEPTED
   - the enforcement component has durably accepted the request.

4. STOP_ENFORCED
   - the independent gate reports the protected boundary as closed/interdicted.

5. ENFORCEMENT_VERIFIED
   - an admissible observer independently verifies the gate state and its epoch/fence.

6. WORLD_RECONCILIATION
   - separate evidence determines what happened to already-dispatched or externally visible effects.

These states are not interchangeable.

## Proof-of-enforcement contract

Every critical enforcement proof binds:

- stop_id;
- target/effect scope;
- gate_id;
- gate epoch/fence generation;
- enforcement class E2/E3/E4;
- observed gate state;
- observer identity;
- observer dependency/common-mode domain;
- observation time or causal position;
- freshness bound;
- verification method;
- challenge/admission result where applicable;
- evidence integrity/provenance;
- relevant authority/policy/configuration versions;
- declared control boundary;
- unresolved uncertainty.

A proof is valid only for the declared scope and boundary.

## Positive evidence versus absence of activity

The following are insufficient by themselves:

- no new log entries;
- no response from the executor;
- executor process exited;
- network connection closed;
- model stopped generating output;
- heartbeat disappeared;
- timeout expired;
- local queue is empty.

These may be evidence about a component, but they do not by themselves prove that the protected execution boundary is closed.

## Independent observation

For E2+:

- the observer should not be the executor whose behavior is being stopped;
- the observer's critical evidence path should have its own dependency analysis;
- a shared host, kernel, credential, policy service, network, storage, clock or administrative path can create common-mode failure;
- observer independence is therefore an evidence claim, not a process-count claim.

A gate state read from the same compromised control domain is weaker than a state read across an independent fault domain.

## Verification methods

Methods should be selected by control class and risk.

### Method A — authoritative gate-state observation

An independent observer reads a gate state that is authoritative for the protected dispatch boundary.

Evidence is sufficient only if:
- the gate identity matches the target;
- the gate epoch/fence matches the STOP;
- the observation is fresh;
- the observer's dependency assumptions hold.

### Method B — non-effecting admission challenge

Where technically safe, the observer performs a non-effecting admission check that must be rejected while the gate is closed.

This proves the gate's admission semantics, not the absence of external effects already dispatched.

The challenge must not itself create a real-world effect.

### Method C — actuation feedback

For E3/E4 boundaries, use independent feedback from the actual actuation/target layer where available.

Software-process state is not a substitute for physical/external actuation state.

### Method D — world reconciliation

After possible dispatch, query/reconcile the external target using the existing external-effect reconciliation contract.

This is a different proof obligation from gate enforcement.

## Proof freshness

An old proof is not a permanent fact.

Proof becomes invalid when any material boundary changes, including:

- gate epoch changes;
- target identity/scope changes;
- authority epoch changes;
- policy/invariant version changes;
- configuration/artifact change;
- observer dependency changes;
- safety heartbeat expires;
- world/precondition boundary becomes stale;
- the gate reports failure/UNKNOWN.

Freshness is therefore bound to the proof, not inferred from wall-clock time alone.

## Failure semantics

If the observer cannot establish enforcement:

ENFORCEMENT_UNKNOWN

not:

ENFORCED.

If the gate reports failure:

GATE_FAILED

not:

STOP_VERIFIED.

If the world effect is unknown:

WORLD_EFFECT_UNKNOWN

not:

NO_EFFECT.

Unknown evidence must not increase execution authority.

## Release rule

A critical stop may be released only when all required conditions hold:

- current release authority;
- current stop/gate epoch;
- valid enforcement evidence;
- no unresolved critical world effect requiring quarantine/reconciliation;
- current policy/invariant applicability;
- current dependency/common-mode assessment;
- current recovery owner/fence;
- explicit release event.

Reboot, process restart, timeout, lease expiry, network restoration or disappearance of the STOP signal cannot satisfy these conditions implicitly.

## Anti-confusion matrix

| Evidence | Proves | Does not prove |
|---|---|---|
| STOP accepted | safety component received request | gate is enforced |
| Executor ACK | executor claims it stopped | independent enforcement |
| Gate CLOSED | gate reports closed | external effect absence |
| Independent gate observation | protected gate state at observed epoch | world state |
| Rejected non-effecting admission | gate blocks new dispatch | already-dispatched effect absence |
| External cancellation confirmation | target accepted cancellation | final world state unless target semantics establish it |
| World observation | observed target state | future absence of change |
| Local process exit | local process stopped | remote/external effect absence |

## Evidence state machine

`NONE → REQUESTED → DELIVERED → ACCEPTED → ENFORCED → ENFORCEMENT_VERIFIED`

Failure/uncertainty branches:

- `REQUESTED → STOP_TIMEOUT`
- `ENFORCED → ENFORCEMENT_UNKNOWN`
- `ENFORCEMENT_VERIFIED → WORLD_EFFECT_UNKNOWN`

World reconciliation is separate:

`WORLD_EFFECT_UNKNOWN → RECONCILIATION_REQUIRED → RECONCILED / QUARANTINED`

## Verification obligations

Required adversarial tests include:

1. forged executor ACK;
2. stale gate observation;
3. observer compromised;
4. observer/evaluator sharing a common host;
5. gate state changed after observation;
6. STOP arriving during dispatch;
7. STOP immediately before dispatch;
8. STOP immediately after dispatch;
9. gate failure after enforcement;
10. network partition between executor and observer;
11. network partition between observer and gate;
12. stale observer recovery;
13. replayed old enforcement proof;
14. mismatched stop_id/effect scope;
15. mismatched gate epoch;
16. policy/configuration change after proof;
17. observer clock failure;
18. loss of monitoring data;
19. non-effecting challenge accidentally routed to a real sink;
20. restart while a verified stop is active.

## New invariants

INV-611 — STOP_ACCEPTED does not imply STOP_ENFORCED.
INV-612 — executor acknowledgement does not constitute independent enforcement proof.
INV-613 — STOP_ENFORCED requires evidence at the declared enforcement boundary.
INV-614 — ENFORCEMENT_VERIFIED requires a current, scope-matching gate observation.
INV-615 — enforcement proof is bound to gate epoch/fence generation.
INV-616 — proof freshness is invalidated by material boundary changes.
INV-617 — observer independence requires dependency/common-mode analysis.
INV-618 — separate processes do not establish independent observation by themselves.
INV-619 — absence of logs, heartbeats or executor activity is not proof of enforcement.
INV-620 — gate failure or observation uncertainty cannot be represented as verified enforcement.
INV-621 — enforcement verification does not prove absence of prior external effects.
INV-622 — a non-effecting admission challenge must be proven non-effecting before it is used as safety evidence.
INV-623 — world reconciliation is a separate evidence obligation from gate enforcement.
INV-624 — stale or replayed enforcement proofs cannot authorize release.
INV-625 — proof scope must match the protected effect/target boundary.
INV-626 — policy/configuration/authority changes can invalidate prior enforcement evidence.
INV-627 — loss of monitoring evidence cannot silently increase execution authority.
INV-628 — release requires current enforcement evidence plus current recovery/world conditions.

## Architectural result

Nexo now treats emergency-stop assurance as a chain of evidence:

`REQUEST → DELIVERY → ACCEPTANCE → ENFORCEMENT → INDEPENDENT VERIFICATION → WORLD RECONCILIATION`

No earlier state may impersonate a later state.

The critical new distinction is:

**“The executor says it stopped” is not the same claim as “the safety boundary is independently verified as closed.”**

## Status

Architecture/design only. No implementation, fault-injection, or TLC verification is claimed.

## Next research

1. recovery/restart fencing after emergency stop;
2. safety-plane update/rollback and bootstrap trust;
3. common-mode/correlated-failure analysis;
4. complete TLA+ model and actual TLC execution.
