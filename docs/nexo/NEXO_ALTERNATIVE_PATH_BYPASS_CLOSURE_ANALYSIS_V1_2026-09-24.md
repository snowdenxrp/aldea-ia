# NEXO ALTERNATIVE-PATH / BYPASS CLOSURE ANALYSIS V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation.

## 1. Objective

A protected outcome is closed only when every materially reachable path to that outcome is classified as ALLOWED, BLOCKED, EXPLICITLY ASSUMED, or UNKNOWN AND THEREFORE NOT ADMISSIBLE.

This follows the non-bypassability, separation, least-privilege and controlled-interface principles identified in NIST systems-security engineering. NIST describes architecture as elements, relationships and design principles, and explicitly identifies non-bypassability, layering, separation and least privilege as security design concepts. citeturn0search0turn0search12

## 2. Bypass taxonomy

BP-01 Direct API bypass
A caller invokes a lower-level capability that skips the intended gate.

BP-02 Alternate service path
Another service can produce the same protected outcome without the canonical path.

BP-03 State injection
A component writes a state normally reachable only through a protected transition.

BP-04 Replay
A previously valid request/context is reused.

BP-05 Identity substitution
A valid identity is attached to a different request/effect.

BP-06 Effect substitution
A valid operation is retained while target or parameters change.

BP-07 Epoch substitution
Old authority/fence is presented as current.

BP-08 Recovery bypass
Restart/checkpoint/recovery reaches a state equivalent to authorization.

BP-09 Update bypass
New artifact/configuration becomes active without safety admission.

BP-10 Evidence bypass
Raw observation, cache or log is treated as verified evidence.

BP-11 Reconciliation bypass
External response is interpreted as truth without exact identity/provenance/freshness.

BP-12 Coordination escalation
Lease ownership is interpreted as authority.

BP-13 Failure-state bypass
Timeout/crash/partition is converted into a favorable definite outcome.

BP-14 Common-mode bypass
Supposedly independent paths share a compromised dependency.

BP-15 Migration bypass
Schema/data conversion creates a state not admissible in the source model.

BP-16 Decommission resurrection
Old worker, credential, lease, checkpoint or update path restores authority.

BP-17 Human-interface bypass
UI/API semantics allow an action beyond authorized scope.

BP-18 Formal/implementation gap
The formal model blocks a path but implementation exposes an equivalent unmodeled path.

## 3. Outcome O-01 — AUTHORIZATION

Canonical path:
Request → Normalize → Fingerprint → Bind Effect → Current Authority → Policy/Invariant → Safety/Recovery/Version checks → Protected Linearization → AUTHORIZED.

Must block:
- direct executor admission;
- planner-issued approved flags;
- cached authorization without current context;
- lease ownership;
- old authorization replay;
- checkpoint-restored authorized state;
- external-provider approval;
- unrestricted UI approval;
- reward/confidence threshold;
- update artifact carrying embedded authorization.

Semantic closure:
If any target, normalized parameter, relevant precondition, authority context, policy/invariant, VersionSet or safety-fence field can change without changing the protected binding, the binding is incomplete.

## 4. Outcome O-02 — EXECUTION

Canonical path:
AUTHORIZED → RESERVED → PREPARED → Final Gate → EXECUTING.

Must block:
- direct executor calls;
- stale lease owner;
- old generation;
- old authority epoch;
- STOP omission;
- RecoveryFence omission;
- VersionSet mismatch;
- alternate connector;
- queued work surviving revocation;
- retry without exact effect identity;
- background worker using cached admission.

Closure requirement:
Every physical actuation path must terminate at an equivalent final execution gate.

Protecting only the main API is insufficient.

## 5. Outcome O-03 — STOP

Canonical path:
STOP_REQUESTED → STOP_ENFORCING → EXECUTION_BLOCKED / ACTUATION_INTERRUPTED → STOP_VERIFIED.

Must block:
- alternate executor;
- direct hardware/API path;
- background job;
- recovery service;
- update activation;
- cached execution token;
- privileged administrator path;
- stale worker.

Closure requirement:
STOP scope must cover every protected execution path for the claim.

External cancellation remains a separate claim.

## 6. Outcome O-04 — RECOVERY RELEASE

Canonical path:
RESTART → QUARANTINE → identity/artifact/config verification → current fence → current authority → recovery owner → reconciliation → RELEASE_ELIGIBLE → explicit release.

Must block:
- checkpoint containing authorized state;
- automatic startup;
- lease reacquisition as release;
- new operation ID;
- recovery service self-release;
- old worker reconnect;
- old update artifact;
- cached authority.

Closure requirement:
No startup/restart path may directly reach EXECUTION_ENABLED.

## 7. Outcome O-05 — VERIFIED CLAIM

Canonical path:
Observation → Evidence validation → Reconciliation → Claim-specific verification → VERIFIED_FOR_CLAIM.

Must block:
- raw telemetry;
- database state treated as world truth;
- executor ACK treated as external proof;
- proof-cache status treated as truth;
- stale evidence;
- same-source corroboration presented as independent;
- old verified result after relevant VersionSet/policy change;
- evidence producer accepting its own claim.

Closure requirement:
Every verification source passes through claim-specific evidence admission.

## 8. Outcome O-06 — VERSION ACTIVATION

Canonical path:
Candidate → identity/hash/provenance → signature/attestation → source/builder policy → dependency closure → semantic compatibility → safety delta → independent admission → stage → fence old → activate → verify → reconcile → commit.

Must block:
- direct config replacement;
- environment-variable override;
- startup flag;
- plugin/module hot-load;
- recovery image bypass;
- rollback image bypass;
- mutable dependency substitution;
- trust-root replacement through ordinary update.

Closure requirement:
All safety-relevant executable/configuration semantics resolve to one admitted VersionSet.

## 9. Outcome O-07 — DECOMMISSION CLOSURE

Canonical path:
Decommission → revoke authority → revoke delegation → terminate workers → close leases → reconcile effects → close recovery/update paths → secrets/data closure → durable final closure.

Must block:
- stale process;
- old token;
- checkpoint restore;
- lease reacquisition;
- recovery service;
- update service;
- stale replica;
- cached credentials.

Closure requirement:
Decommission is a fencing event across every authority-restoring path.

## 10. Semantic bypass matrix

| Substitution | Required result |
|---|---|
| operation_id → different effect | REJECT |
| effect_id → different target | REJECT |
| target → different parameters | REJECT |
| old epoch → current epoch | REJECT |
| expired authority → current authority | REJECT |
| old VersionSet → current VersionSet | REJECT |
| checkpoint state → authority | REJECT |
| lease generation → authorization | REJECT |
| observation → verification | REJECT |
| timeout → NOT_APPLIED | REJECT |
| restart → authorization | REJECT |
| new operation → old UNKNOWN resolution | REJECT |
| signature → safety admission | INSUFFICIENT |
| model confidence → authority | REJECT |
| reward → authority | REJECT |
| UI approval → unrestricted capability | REJECT |

## 11. Alternate-path discovery rule

For every protected outcome, enumerate paths by mechanism rather than service name:

1. synchronous API;
2. asynchronous queue;
3. scheduled worker;
4. retry worker;
5. recovery worker;
6. migration process;
7. update process;
8. administrative tool;
9. startup/bootstrap;
10. direct connector;
11. cached state;
12. replicated state;
13. restored snapshot;
14. emergency path;
15. decommission path;
16. test/debug interface;
17. plugin/extension path;
18. model/tool invocation.

A path is not closed merely because it is internal.

## 12. Queue and asynchronous bypass

An authorized action placed into a queue can survive later revocation unless the queue item is bound to:
- exact EffectBinding;
- authority epoch;
- stop/recovery fence;
- VersionSet;
- expiry;
- execution-time revalidation.

Therefore:

QUEUED ≠ AUTHORIZED FOREVER.

Delayed execution must revalidate the conditions required by its protected claim.

## 13. Cache bypass

Caches are non-authoritative unless explicitly proven otherwise.

A cache may contain old authority, evidence, VersionSet, lease or reconciliation.

Cache reads therefore require:
- freshness semantics;
- version binding;
- invalidation;
- authority limitations.

A cache cannot upgrade itself into an authoritative source.

## 14. Debug/admin bypass

Debug and administrative interfaces are part of the attack surface.

“Only operators can call it” is not a sufficient safety argument.

Every privileged administrative path requires:
- explicit capability;
- scope;
- audit;
- current authority;
- separation of privilege where required;
- effect binding where relevant;
- revocation;
- lifecycle constraints.

A debug endpoint capable of changing protected state is a production safety interface.

## 15. Formal/implementation bypass

The formal model must eventually cover the semantic equivalence class of protected paths.

It is insufficient to prove that formal API A is safe if implementation exposes API B that can produce the same protected state/effect.

Future correspondence must include:
- externally reachable interfaces;
- state mutation paths;
- background workers;
- recovery paths;
- update paths;
- administrative paths;
- direct connector paths;
- queues/caches;
- migration tools.

## 16. New invariants

BYPASS-01: every protected outcome has a complete alternative-path inventory.
BYPASS-02: every physical actuation path reaches an equivalent protected execution gate.
BYPASS-03: no asynchronous queue item bypasses execution-time conditions required by its claim.
BYPASS-04: cached state cannot grant authority beyond its explicit validity contract.
BYPASS-05: checkpoint restoration cannot grant authority.
BYPASS-06: recovery cannot bypass normal safety gates.
BYPASS-07: update and rollback cannot bypass safety-context admission.
BYPASS-08: decommission fences all authority-restoring paths.
BYPASS-09: semantic substitution of identity, target, parameters, epoch or VersionSet is rejected.
BYPASS-10: timeout/crash/partition cannot be converted into favorable certainty without evidence.
BYPASS-11: evidence-producing paths cannot bypass claim verification.
BYPASS-12: administrative/debug interfaces are subject to the same protected semantics.
BYPASS-13: implementation correspondence must include alternate execution paths.
BYPASS-14: a new interface is unsafe by default until its authority-flow impact is classified.
BYPASS-15: every bypass closure has explicit evidence or an explicit environmental assumption.
BYPASS-16: hidden equivalent paths invalidate closure claims.

## 17. Result

The architecture research now has a stronger closure criterion:

A security boundary is not closed because its intended interface is protected.

It is closed only when all semantically equivalent routes to the protected outcome are controlled.

This turns bypass analysis into a formal architectural obligation:

ARCHITECTURE → all reachable paths → semantic equivalence classes → protected outcomes → gates → forbidden paths → implementation correspondence.

## 18. Next research gate

The next pass will study authority revocation and invalidation propagation as a graph problem:

CHANGE
→ affected state
→ affected queued/cached/replicated work
→ affected evidence
→ affected claims
→ affected external effects
→ required fencing/revalidation.

Events to model:
- authority revocation;
- policy change;
- VersionSet change;
- STOP activation;
- recovery start;
- evidence staleness;
- dependency compromise;
- identity decommission.

Architecture remains blocked.