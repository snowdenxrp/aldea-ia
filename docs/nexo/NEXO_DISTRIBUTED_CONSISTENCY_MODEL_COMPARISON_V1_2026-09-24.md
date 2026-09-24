# NEXO DISTRIBUTED CONSISTENCY MODEL COMPARISON V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation and no final topology selected.

## 1. Research basis

NIST SP 800-160 Rev. 1 treats trustworthiness as an emergent property of the system and emphasizes engineering architecture, requirements, verification and validation across the lifecycle. NIST SP 800-160 Vol. 2 Rev. 1 emphasizes resilience, dependency analysis, partitioning, loose coupling, minimized sharing and secure distributed composition. NIST IR 8460 describes state-machine replication and consensus as mechanisms for making distributed services behave like a centralized service despite faults, while noting the fault-tolerance problem itself. citeturn0search0turn0search24turn0search9

These sources do not select Nexo's topology. They provide engineering criteria. The comparison below is therefore an architectural analysis, not an externally prescribed answer.

## 2. Candidates

A — Single authoritative state machine/store.

B — Partitioned authoritative stores with transactional commit.

C — Partitioned stores coordinated by fencing, epochs, idempotency and reconciliation.

D — Hybrid: very small authoritative safety core plus partitioned semantic stores.

No candidate is selected yet.

## 3. Candidate A — Single authoritative state machine/store

### Strengths
- one obvious serialization domain;
- simpler protected-transition reasoning;
- fewer cross-store atomicity problems;
- simpler replay ordering;
- smaller protocol surface;
- easier mapping from state-machine specification to implementation.

### Weaknesses
- concentration of trust and availability;
- larger blast radius if the authoritative store is compromised;
- scalability pressure;
- recovery and backup become highly safety-sensitive;
- external effects still remain outside the transaction.

### Critical limit

Even a perfect single internal state machine cannot atomically commit the external world.

Therefore:

INTERNAL LINEARIZATION != EXTERNAL EFFECT ATOMICITY.

## 4. Candidate B — Partitioned authoritative stores + transaction

### Strengths
- semantic separation;
- independent scaling;
- failure localization can improve;
- ownership boundaries become explicit.

### Weaknesses
- cross-store atomicity;
- distributed transaction/recovery protocol becomes safety-critical;
- more TCB surface;
- more common-mode assumptions;
- more complex crash windows;
- harder formal correspondence.

The transaction coordinator itself becomes part of the protected semantic boundary.

## 5. Candidate C — Partitioned stores + fencing/reconciliation

### Strengths
- explicitly models partial failure;
- naturally supports UNKNOWN;
- stale actors can be rejected through fencing;
- asynchronous propagation can be safe where current protected gates remain authoritative;
- external effects are treated as a separate consistency domain;
- recovery can be explicit rather than pretending global atomicity.

### Weaknesses
- protocol complexity;
- more epochs/fences;
- reconciliation becomes a critical authority;
- evidence invalidation becomes complex;
- harder formal model;
- many more adversarial interleavings.

The system must prove that fencing is actually enforced at every protected path.

## 6. Candidate D — Hybrid small authoritative core

Conceptual structure:

SMALL AUTHORITATIVE CORE
→ authority
→ exact effect identity
→ protected linearization
→ safety/STOP fence
→ recovery fence
→ VersionSet admission

PARTITIONED SEMANTIC SERVICES
→ operations
→ memory/knowledge
→ planner/model
→ telemetry
→ evidence production
→ analytics
→ coordination support
→ reconciliation data
→ noncritical history/indexes.

The core remains the authority boundary; surrounding stores cannot independently create protected outcomes.

### Strengths
- minimizes semantic TCB;
- limits cross-store atomicity to a small number of protected transitions;
- allows partitioned scaling outside the core;
- supports explicit UNKNOWN/external reconciliation;
- aligns with least privilege and minimized sharing;
- potentially makes formal verification tractable by reducing the canonical state space.

### Weaknesses
- core becomes extremely important;
- interfaces must be exceptionally strict;
- cross-boundary protocols become safety-relevant;
- evidence/reconciliation boundaries need careful design;
- implementation correspondence is difficult.

## 7. Comparison matrix

| Dimension | A Single | B Transactional | C Fenced | D Hybrid |
|---|---|---|---|---|
| Internal serialization | Simple | Complex | Complex | Small/simple core |
| Cross-store atomicity | Low | High | High but protocolized | Limited to core boundary |
| TCB concentration | High | High/medium | Distributed protocol TCB | Small semantic core |
| External-world atomicity | Impossible | Impossible | Explicit UNKNOWN/reconcile | Explicit UNKNOWN/reconcile |
| Stale actor handling | State check | Transaction protocol | Fencing/epochs | Core fencing |
| Partition handling | Restrictive | Complex | Explicit | Core restrictive + outer degraded |
| Recovery complexity | Medium | High | High | Medium/high |
| Evidence invalidation | Medium | High | High | Core admission + distributed propagation |
| Formal burden | Lower | High | High | Potentially bounded |
| Scaling semantic services | Limited | Better | Better | Strong |
| Common-mode exposure | Centralized | Multi-store | Protocol dependencies | Concentrated core + analyzed edges |
| Update/decommission | Centralized | Distributed | Protocolized | Core-controlled |
| External reconciliation | Required | Required | First-class | First-class |
| Failure semantics | Easier | Harder | Explicit | Explicit at boundary |

This is a design comparison, not a score or winner selection.

## 8. What the comparison actually reveals

The critical distinction is not “centralized vs distributed.”

It is:

WHERE MUST SERIALIZABILITY EXIST?

The research so far indicates that not every Nexo operation needs global linearizability.

The minimum likely requirement is:

L3 protected authority/safety transitions
+
L4 exact external-effect boundary
+
eventual/asynchronous semantics elsewhere where stale state cannot grant authority or erase uncertainty.

Therefore the architectural question becomes:

WHAT IS THE MINIMUM SET OF STATE AND TRANSITIONS THAT MUST SHARE A PROTECTED LINEARIZATION DOMAIN?

## 9. Candidate minimum linearization domain

Research candidate, not final architecture:

- current AuthorityContext;
- EffectBinding identity;
- applicable Policy/Invariant baseline;
- active StopState/fence;
- RecoveryFence/release state;
- active VersionSet admission;
- protected transition state;
- coordination fence required for that transition.

Potentially outside the same domain:
- natural-language requests;
- planner/model state;
- ordinary memory;
- telemetry;
- analytics;
- evidence production;
- noncritical indexes;
- optimization metrics.

Evidence validity is borderline:
- evidence production can remain outside;
- evidence acceptance into a safety claim may require protected admission.

External reconciliation is similarly split:
- observation/data collection outside;
- acceptance of a world-truth claim inside the protected boundary.

## 10. Critical protocol boundary

The protected core should answer only questions such as:

1. Is this exact effect identity known?
2. Does current authority permit this exact effect?
3. Is the current safety/configuration context admissible?
4. Is there an active STOP/recovery fence?
5. Is this transition current with respect to its coordination fence?
6. Has the external outcome been sufficiently reconciled for the specific claim?

It should not answer:
- what plan is clever;
- what text means;
- what reward is high;
- what memory is interesting;
- what model prediction is likely.

Those belong outside the authoritative safety boundary.

## 11. Cross-store atomicity classification

Not every cross-store update needs a distributed transaction.

### SAME_LINEARIZATION
Required when inconsistent intermediate state could grant protected authority or clear a safety fence.

Examples:
- authorization admission;
- final execution gate;
- STOP enforcement;
- recovery release;
- safety-relevant VersionSet activation.

### DURABLE_BEFORE
Required when an intent/state must survive crash before an external or irreversible step.

Example:
external effect intent.

### ORDERED_DURABLE
Required when outcome/order must survive restart but cannot be externally atomic.

Examples:
external outcome;
reconciliation record;
decommission closure.

### ASYNC_RECONCILABLE
Allowed when stale state cannot grant authority or establish verified truth.

Examples:
analytics;
UI cache;
noncritical indexes;
telemetry replicas.

## 12. Common-mode consequence

A distributed topology does not automatically create independence.

A, B, C or D can still share:
- trust root;
- identity provider;
- KMS;
- policy source;
- storage;
- network;
- admin plane;
- builder/update path;
- model provider;
- schema/state-machine semantics.

Therefore topology comparison must be overlaid with the existing common-mode graph.

NIST SP 800-160 Vol. 2 explicitly emphasizes partitioning resources, loose coupling and understanding dependencies; these support treating dependency/failure-domain analysis as part of the architecture rather than as deployment detail. citeturn0search24

## 13. TCB consequence

The previous TCB analysis suggests that the smallest useful TCB is semantic, not process-count based.

The likely irreducible semantic chain is:

TRUST/IDENTITY
→ AUTHORITY
→ EFFECT IDENTITY
→ PROTECTED LINEARIZATION
→ SAFETY/STOP
→ RECOVERY
→ VERSION/INVARIANT ADMISSION.

The architecture should avoid adding planner/model/memory/telemetry semantics to this chain unless a claim actually requires them.

## 14. External world remains a separate consistency system

No internal topology solves:

REQUEST SENT
→ NO RESPONSE
→ UNKNOWN.

The architecture must preserve:
UNKNOWN
until an appropriate reconciliation process establishes a claim.

Therefore every topology must contain an explicit boundary:

CONTROL PLANE
|| exact effect identity ||
EXTERNAL WORLD
|| observation/provenance ||
RECONCILIATION
|| claim-specific verification ||
CONTROL DECISION.

## 15. Failure-mode comparison

### Crash
A is easiest internally.
B needs transaction recovery.
C needs replay/fencing.
D needs core recovery plus edge reconciliation.

### Partition
A can deny protected operations.
B can create distributed transaction ambiguity.
C can preserve safety through fencing but sacrifice availability.
D can keep noncritical services degraded while the core remains conservative.

### Stale worker
A: current-state check.
B: transaction/version check.
C: epoch/fence.
D: core gate/fence.

### Storage rollback
All candidates require rollback detection or external monotonic fencing.

### External timeout
All candidates must preserve UNKNOWN.

### Recovery
All candidates need explicit recovery authority; none can infer authority merely from restored state.

## 16. Architectural implication

The research does NOT justify “everything in one database.”

It also does NOT justify “fully distributed.”

It points toward a narrower principle:

MINIMIZE THE AUTHORITATIVE SEMANTIC SURFACE.

Then make every boundary explicit:

- authority boundary;
- state ownership boundary;
- linearization boundary;
- external-effect boundary;
- evidence boundary;
- recovery boundary;
- update boundary;
- decommission boundary.

## 17. New invariants

TOPO-01: topology selection cannot rely on process count alone.
TOPO-02: every protected transition has an explicit serialization/linearization domain.
TOPO-03: external effects are not assumed atomically coupled to internal state.
TOPO-04: stale distributed state cannot grant protected authority.
TOPO-05: partition handling for critical authority is conservative.
TOPO-06: UNKNOWN survives topology boundaries.
TOPO-07: asynchronous propagation is allowed only when stale state cannot create a protected outcome.
TOPO-08: every cross-store protected transition has explicit crash semantics.
TOPO-09: common-mode dependencies are included in topology assurance.
TOPO-10: TCB is minimized by semantic authority, not by number of services.
TOPO-11: recovery authority is not inherited from restored state.
TOPO-12: evidence acceptance may be protected even when evidence production is distributed.
TOPO-13: external reconciliation remains a separate consistency domain.
TOPO-14: topology does not itself constitute independence.
TOPO-15: any topology decision requires formal and runtime verification obligations.

## 18. Current research conclusion

A final topology cannot yet be selected because three questions remain open:

1. EXACT MINIMUM LINEARIZATION DOMAIN
2. EXACT AUTHORITATIVE STATE-STORE TOPOLOGY
3. EXACT IMPLEMENTABLE FENCING/ATOMICITY MECHANISM

Those must be derived from the protected transition contracts and read/write sets, not chosen first.

## 19. Next gate

The next research pass will therefore derive:

PROTECTED TRANSITIONS
→ READ SETS
→ WRITE SETS
→ CONFLICT GRAPH
→ MINIMUM ATOMICITY
→ MINIMUM LINEARIZATION DOMAIN
→ STORE OWNERSHIP
→ FENCING PROTOCOL.

Only after this derivation can A/B/C/D be narrowed without architectural guesswork.

Architecture remains blocked.