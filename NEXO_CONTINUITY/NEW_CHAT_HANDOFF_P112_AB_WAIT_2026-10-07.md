# NEXO CONTINUITY — NEW CHAT HANDOFF — 2026-10-07

## PURPOSE
Recover this exact research sequence in a new chat without relying on chat history. This document is additive continuity, not a rewrite of historical AB artifacts.

## OPERATING INSTRUCTIONS
- Workflow: INVESTIGAR → ANALIZAR → CONSTRUIR → GUARDAR.
- Current phase is INVESTIGAR/ANALIZAR only. No implementation unless an exact future step explicitly authorizes it.
- Primary artifacts first. Later retrospective AB documents may be observed as cross-check evidence, but NEVER backfill missing historical primary ABs.
- Never invent verification, execution results, ordering/HB edges, protocol semantics, successors, or closure.
- Preserve 🟢 confirmed / 🔵 open / 🔴 conflict-unproven, plus UNKNOWN/PENDING.
- Do not repeat completed audits. Every continuation must be additive.
- Verify GitHub read-back before claiming continuity was saved.
- User prefers concise responses: “menos texto y más guardar”.
- When user says “Continúa”, continue the exact current bounded block; do not ask what to do.
- User wants all important findings and instructions saved in CONTINUITY + master.
- AB sequence is temporarily ON HOLD while P112 is finished. After P112 genuinely closes, resume AB in blocks of 10 from the real primary frontier.
- Do not lose the AB sequence or restart from guesses.

## PROTECTED ANCHORS
- Protected analytical anchor: AB105.116R.
- AB105.117R is prohibited.
- TLC frozen: run 36781846063, job 110113752493, old commit ec15…; do not rerun.
- Historical primary Nexo frontier: AB104.151.
- AB104.152–.184 are retrospective cross-checks only; do not treat them as recovered primary artifacts.
- Do not create/backfill AB104.185 primary.

## AB STATUS
Blocks already processed:
P103 AB104.51–60
P104 AB104.61–70
P105 AB104.71–80
P106 AB104.81–90
P107 AB104.91–100
P108 AB104.101–110
P109 AB104.111–120
P110 AB104.121–130
P111 AB104.131–140
P112 began AB104.141–150, with primary frontier ultimately confirmed through AB104.151.
AB is waiting, not abandoned. Do not repeat those blocks.

## GLOBAL NEXO LAWS / FIXED FINDINGS
STOP REQUESTED ≠ STOP ENFORCED.
REVOCATION ISSUED ≠ REVOCATION ENFORCED EVERYWHERE.
AUTH CACHE HIT ≠ CURRENT AUTHORITY.
FENCE ISSUED ≠ FENCE ENFORCED.
Crash ≠ execution result.
Authority and target are independent.
UNKNOWN ≠ false.
Immutable history ≠ current authority/external-effect proof.
Fencing is resource-side and not retroactive.
Recovery frontiers can be incomparable.
Compensation after partial external effect is a distinct authorized operation.
Temporal order ≠ JMM happens-before.
Do not add latch/volatile/barrier merely to manufacture HB.

## CURRENT P112 STATUS
P112 formal closure is NOT declared.

Central question evolved from VersionSet granularity into the smallest defensible protected-transition boundary.

Current conclusion:
A fixed object/subsystem version is insufficient. The defensible safety unit is a claim-specific protected transition footprint:
Admission ReadSet + transitive authoritative DependencySet + handler ReadSet + predicate/range/aggregate dependencies + protected WriteSet + relevant version/incarnation/policy/config/random evidence + conditional validation/commit.

Existing canonical persistence primitive:
persistState(expectedRevision) is already a viable generic conditional snapshot-commit primitive for cooperating writers:
isolated applyState() snapshot → lock → canonical stateRevision check → complete snapshot serialization including nexoMemory → temp write → rename → unlock.
Existing tests prove stale expectedRevision rejection, one-winner worker race, write/rename failure preservation, stale-lock recovery, and Nexo memory/PREPARED reconstruction.
Do NOT invent a second generic persistence wrapper.

But this does NOT prove:
- complete dependency coverage;
- final authority/STOP/resource/fence revalidation;
- durable PREPARED integration in production;
- semantic conflict classification/reconciliation;
- power-loss/fsync durability;
- external-effect exactly-once or fencing.

STATE_REVISION_CONFLICT should be interpreted as STALE_COMMIT_CANDIDATE, not generic failure and not proof that an effect was absent.

Current topology:
- runtime/effect adapter: in-memory effect journal/runtime outcome;
- canonical world-state persistence: persistState(expectedRevision);
- no demonstrated production atomic lifecycle joining durable PREPARED → protected execution → terminal journal → final revalidation → canonical commit → reconciliation.

## LATEST P112 AUDIT
Latest saved artifact:
P112_EXISTING_VERSION_TOKENS_BRANCH_CROSSCHECK_V1_2026-10-07.md
Commit: 1be7f0c4fc0dc914afc74b681a433295ee4a7d39
Read-back blob: 31f328b24182657d73c0e858cd6dcab0268fa08d

It found no overlooked branch-local semantic revision/incarnation token for:
resources, inventory, needs, tools, fertile land, structures, trade participants, relationships, economy aggregates, institutions/commons, partner incarnation.
stateRevision remains persistence conflict token.
nexoEffectRevision remains RAM-only.
Spatial version-like fields remain incomplete.
catch_fish has outcome-defining RNG inside mutation with no bound evidence token.
Therefore no existing token safely replaces claim-specific dependency capture/final revalidation.

## EXACT CURRENT NEXT ACTION
Trace the first common authoritative mutation boundaries for:
1. resource/day/ecosystem,
2. inventory/needs,
3. relationships,
4. economy aggregates,
5. spatial normalization/range writers.

For each:
- identify every invalidating writer and whether a common authoritative mutation boundary dominates them;
- determine whether an existing version-like field can acquire COMPLETE writer coverage;
- identify bypasses/hidden mutation paths;
- do not introduce a new global revision merely to make the matrix pass;
- if no existing token can cover the domain, define the minimum broader protected footprint/composite dependency requirement.

This is an additive writer-ownership/bypass audit. Do not repeat the existing-version-token audit.

## RELEVANT CODE FACTS
executeAction branches:
rest; drink; eat_plant; catch_fish; eat_fish; gather_wood; gather_stone; build_shelter; craft_tool; farm; harvest; eat_farm_food; institution actions; trade.

Resource handlers mutate both world resources and agent state; catchFish uses getRandom(simulation) inside mutation.
Trade mutates seller/buyer inventory and money, both relationships, economy priceMemory and trade history; partnerId alone is insufficient provenance.
Institution actions depend on membership/commons and mutate inventory, commons and hunger.
Production crosses agent/world/structure.
tick() surrounds decisions with day/world, needs, perception, action, spatial and learning mutations.
advanceWorldDay()/advanceSocietyDay() can invalidate admissions.
normalizeSpatialWorld() can mutate while providing territorial context.
performDecision() has mutation branches outside executeAction (social, knowledge, cooperation, exploration/discovery, memory/events/skills).
No demonstrated canonical singleton bypass was found in inspected explicit simulation/world/agent paths.

## IMPORTANT POSTERIOR CROSS-CHECKS
AB104.152–154: effect ambiguity, compensation distinction, multi-resource/incarnation/fence/control/effect boundary.
AB104.155–160: capability classes, protected transition, bounded local transaction, crash cuts.
AB104.180–184: simulation mutation overlap, stateRevision lifecycle.
AB104.600–602: dependency/provenance completeness; derived/helper/cache/predicate/range/external observation/crash-retry provenance loss.
These are retrospective evidence only and must not be backfilled into missing primary ABs.

## P112 ARTIFACT CHAIN ALREADY DONE
Includes, among others:
VERSIONSET_RESEARCH_CHECKPOINT
PERCEPTION_TERRITORIAL_COLLECTIVE_AUDIT
HELPER_DEPENDENCY_AUDIT
ACTION_CLASS_ENVELOPES
ADMISSION_CHAIN_PROVENANCE_AUDIT
FINAL_GATE_EXECUTION_BOUNDARY_AUDIT
PROTECTED_FOOTPRINT_INTERSECTION_AUDIT
EXISTING_VERSION_TOKEN_AUDIT
RESOURCE_TRADE_COOPERATE_TRACE
ADVERSARIAL_STALE_ADMISSION_WRITE_SKEW
WRITER_TOKEN_COVERAGE_MATRIX
AUTHORITATIVE_MUTATION_BOUNDARY_TRACE
WRITER_DEPENDENCY_GRAPH
SHARED_WRITER_FOOTPRINT_AUDIT
SHARED_WRITER_INTERSECTION_GRAPH
SHARED_WRITER_SUBORDINATE_COVERAGE
NEXO_JOURNAL_SEMANTICS
EFFECT_JOURNAL_LIFECYCLE_CRASH_CUT
PREPARED_CHECKPOINT_OWNER
EXECUTION_OWNER_FEASIBILITY
EXECUTION_OWNER_PROTOCOL_RECONCILIATION
LOCAL_TRANSACTION_SNAPSHOT_COMMIT_FEASIBILITY
SNAPSHOT_ISOLATION_BYPASS
RUNTIME_ADAPTER_SNAPSHOT_CROSSING
PERSISTSTATE_FINAL_COMMIT_FEASIBILITY
PROTECTED_OWNER_AGAINST_EXISTING_PERSISTENCE
FINAL_REVALIDATION_CONDITIONAL_COMMIT_RECONCILIATION
FINAL_REVALIDATION_INPUTS_CONFLICT_SEMANTICS
EXECUTEACTION_FINAL_GATE_BOUNDARY
EXECUTEACTION_BRANCH_READ_WRITE_GRAPH
EXISTING_VERSION_TOKENS_BRANCH_CROSSCHECK

## DO-NOT-REPEAT
No duplicate existing-version-token audit.
No persistence-primitive re-search.
No TLC rerun.
No AB104.185 primary creation/backfill.
No AB105.117R.
No implementation.
No exactly-once, atomicity, power-loss, or JMM-HB claim without direct evidence.
Do not promote later retrospective AB evidence to primary history.
Do not broaden bounded evidence to universal proof.

## AFTER P112
When P112 is genuinely closed:
- save closure artifact;
- update MASTER_P112_CHECKPOINT;
- verify read-back;
- state exact next;
- then resume AB sequence in blocks of 10 from the real primary frontier (AB104.151 boundary), never backfilling missing ABs.


## Latest persistence verification
- Handoff create commit: 2f62fb74e2a4dd345ed0340e0bef3c83eb3871af
- Handoff read-back blob SHA: 508a2ed6b78f08de890bb57a82c716788add7d5f
- MASTER_P112 update commit: 81050b113d55d08b07ef62776371ba6b35e64877
- MASTER_P112 read-back blob SHA: 89f2a9261ce91f858ecab73b4e6d0c879b3bb662
- Both files were independently read back after writing.
