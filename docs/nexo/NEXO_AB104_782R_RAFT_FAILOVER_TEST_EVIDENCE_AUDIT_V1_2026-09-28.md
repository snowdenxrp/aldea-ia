# NEXO AB104.782R — concrete Raft failover and stale-replica test evidence
Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Continuation note
The document contains the full prior audit chain. The following section is appended without deleting or overwriting prior findings.

## AB104.839R — FENCING BOUNDARY + RESOURCE-SIDE IDEMPOTENCY ATTACK

**Status:** RESEARCHED / NO IMPLEMENTATION / NO ARCHITECTURE FREEZE.

### External evidence cross-check

A fencing token only protects against a stale authority when the protected resource itself checks the token and rejects lower generations. Kleppmann's analysis makes the boundary explicit: issuing a token from a lock service is insufficient if the resource does not enforce monotonic fencing. 

Stripe's idempotency contract provides a separate resource-side mechanism: the same key can return the original result, but keys may be pruned after at least 24 hours and reuse after pruning can create a new request; parameter mismatch is rejected.

AWS likewise documents that transactional outbox addresses local dual-write consistency but downstream delivery may duplicate, requiring idempotent consumers.

### Fencing phase attack

The external-effect boundary can be divided into four phases:

1. **PRE-ACCEPTANCE:** resource has not accepted the operation.
2. **ACCEPTED/RESERVED:** resource has durably accepted an operation intent but has not necessarily produced the semantic effect.
3. **COMMITTED EFFECT:** the semantic external effect has occurred.
4. **POST-COMMIT OBSERVATION:** later reads/events expose the committed outcome, correction, or reversal.

The key result is that fencing can prevent a stale actor only at a boundary where the resource evaluates the generation before permitting the protected mutation/reservation. If the resource has already committed the effect, a later fence cannot undo that effect; the outcome becomes a reconciliation/compensation problem.

### Derived cases

**F1 — stale epoch before acceptance:** resource rejects old epoch; no external effect. This is a genuine fencing success.

**F2 — stale epoch races with new epoch before acceptance:** resource's atomic comparison determines the winner; the rejected operation must not be interpreted as a failed semantic effect unless the resource's contract says so.

**F3 — old epoch accepted/reserved, then new epoch arrives:** fencing alone does not establish whether the reservation is cancellable, committed, or still pending. The resource contract must expose state/reconciliation semantics.

**F4 — old epoch commits effect before new epoch is established:** fencing cannot retroactively prevent the already committed effect. The correct result is historical evidence + reconciliation/compensation, not a false claim that fencing prevented execution.

**F5 — old epoch arrives after new epoch has been established:** resource-side monotonic fencing should reject the old mutation if the protected resource participates in the fence.

### Important boundary

**Fencing is a prevention mechanism, not an outcome oracle.**

It can establish `REJECTED_BEFORE_EFFECT` under a suitable resource contract. It cannot, by itself, establish `FAILED` for an operation whose request was accepted but whose downstream execution state is unknown. Likewise, it cannot establish `CONFIRMED` merely because the resource accepted a request unless the resource defines acceptance as the semantic effect.

### I22 reduction

I22 = idempotency expiry → retry → possible second effect.

This is not automatically a new failure class. If provider idempotency retention expires, the same logical operation may cross from an idempotent retry regime into a new-operation regime. Existing retry/external-effect ambiguity classes cover the causal failure, but the retention boundary is a distinct interaction parameter that must be tested.

**Disposition: I22 = parameterized interaction / UNTESTED; no new top-level class.**

### I23 reduction

I23 = same idempotency key + different parameters.

A provider that rejects this combination is enforcing an identity/intent consistency contract. The conflict is not equivalent to ordinary duplicate delivery because the duplicate is semantically different. However, it can be represented by parameter-binding on the existing operation-identity witness.

**Disposition: I23 = COVERABLE by operation-identity parameterization; no new witness.**

### I24 reduction

I24 = provider reports IN-PROGRESS while coordinator considers retry.

This is a specific reconciliation state, not `UNKNOWN` and not `CONFIRMED`. A safe coordinator cannot infer that the effect occurred merely from IN-PROGRESS. Nor can it safely launch a new semantic operation if the provider's contract says the original may still commit.

**Disposition: I24 = independent interaction / UNTESTED.**

### New invariant candidates

**INV-F-01 — Fence enforcement locality:** a fencing token has safety meaning only if the protected resource (or an authoritative intermediary at the effect boundary) validates it before the protected mutation.

**INV-F-02 — Acceptance is not universally effect:** provider acceptance/reservation must not be mapped to CONFIRMED unless provider semantics explicitly define acceptance as the effect.

**INV-F-03 — Post-commit fencing is non-retroactive:** once an external effect is committed, a later epoch cannot honestly claim that fencing prevented the historical effect.

**INV-F-04 — IN-PROGRESS is epistemic:** an in-progress provider state means execution remains unresolved; it must not be silently converted to CONFIRMED or FAILED.

These remain candidate invariants, not formally verified properties.

### Evidence-state refinement

The external boundary now needs to distinguish at least:

`NOT_ACCEPTED`
`ACCEPTED_OR_RESERVED`
`COMMITTED`
`UNKNOWN`
`FAILED`
`CORRECTED`
`REVERSED`

These are not a single universal provider enum. They are semantic categories whose exact mapping depends on the provider contract. In particular, ACCEPTED_OR_RESERVED may transition to COMMITTED, FAILED, EXPIRED/CANCELLED, or remain UNKNOWN depending on the resource.

### Current disposition

I17: absorbed by W17 parameterization.
I18: absorbed by W18 parameterization.
I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I23: absorbed by operation-identity parameterization.
I24: independent / untested.
INV-EH-01: candidate.
INV-EH-02: candidate.
INV-EF-01..04: candidate.
INV-F-01..04: candidate.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.840R:** attack I24 and the ACCEPTED_OR_RESERVED state against retry, fencing, timeout, recovery, correction, and provider reconciliation. Determine whether ACCEPTED_OR_RESERVED needs to remain an explicit semantic state or can safely be represented as UNKNOWN + provider-specific evidence. Then attack F2/F3 race orderings to determine the minimum atomicity required at the resource boundary.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**

---
## AB104.840R — I24 + ACCEPTED/RESERVED + F2/F3 ATOMICITY ATTACK

**Date:** 2026-09-29
**Status:** RESEARCHED / EVIDENCE CROSS-CHECKED / NO IMPLEMENTATION / NO ARCHITECTURE FREEZE.

### Fresh research

A current 2026 study of agent tool side effects tested late commits, redelivery, partial batches, missing read paths, and optional idempotency keys. Its result is directly relevant: when an external action is still in flight or cannot be read back, even strong model instructions do not guarantee exactly-once behavior; the external contract becomes the dominant control surface. The study reports substantially lower duplication when an idempotency key exists, but does not establish universal exactly-once semantics. citeturn0academia11

A separate 2026 study on governed agentic systems describes commit-time authority checks, idempotent reservation/outbox dispatch, and canonical reconciliation, while explicitly limiting its claims about prevention, reversal, journal completeness, and semantic completeness. This is useful corroborating evidence, not proof for Nexo. citeturn0academia9

### I24 attack

I24 = provider state `IN-PROGRESS` + coordinator retry decision.

The reduction was tested against four interpretations:

1. **UNKNOWN alias:** insufficient. `IN-PROGRESS` carries positive provider evidence that an execution is still active or unresolved; erasing that evidence loses information needed to prevent unsafe retry.
2. **CONFIRMED alias:** invalid unless the provider contract explicitly defines `IN-PROGRESS` as the committed effect. Normally it does not.
3. **FAILED alias:** invalid; absence of completion is not authoritative failure.
4. **Explicit provider-state evidence:** sufficient semantic representation, with retry behavior governed by the provider's reconciliation/idempotency contract.

**Result: I24 remains independent / UNTESTED.**

### ACCEPTED_OR_RESERVED attack

`ACCEPTED_OR_RESERVED` cannot safely be collapsed into generic `UNKNOWN` at the semantic boundary when the provider exposes a durable acceptance/reservation fact. The distinction matters because a reservation can constrain whether a retry is legal, whether cancellation is possible, and whether a later commit can occur.

However, it also cannot be promoted to `CONFIRMED` generically. The provider contract must define whether acceptance/reservation itself is the semantic effect or merely a precursor.

Therefore the minimum portable representation is:

**provider-specific state evidence + normalized epistemic interpretation**.

The normalized interpretation may remain unresolved while retaining the provider state verbatim/provenance-bound.

**Result: ACCEPTED_OR_RESERVED should remain a semantic category in the audit model, but it is not a universal provider enum.**

### F2 race attack

**F2:** stale epoch E1 and current epoch E2 race before acceptance.

A safe outcome requires one authoritative atomic admission point capable of comparing the presented generation against the resource's current generation before the protected mutation/reservation. If comparison and mutation are separable, the following unsafe interleaving exists:

`E1 reads current generation → E2 advances generation → E1 mutates resource`.

Therefore a local lock around the coordinator is insufficient when independent actors can reach the resource. The resource or authoritative intermediary must enforce the generation at the effect boundary.

**Result:** F2 requires an atomic admission/compare-and-accept boundary. The exact mechanism is provider-specific.

### F3 race attack

**F3:** E1 is accepted/reserved; E2 subsequently becomes current.

Fencing alone cannot answer whether E1:

- can still commit;
- can be cancelled;
- is automatically invalidated;
- has already committed;
- remains pending.

Those outcomes require explicit provider semantics. Therefore the resource must expose either an authoritative status/reconciliation operation or a contract that makes the reservation lifecycle deterministic.

**Result:** F3 is a reconciliation/lifecycle problem, not merely a fencing problem.

### Minimum boundary semantics derived

The external effect boundary requires, at minimum:

1. **Admission authority** — who may cause the effect.
2. **Generation/identity check** — whether this operation is current and belongs to the intended semantic operation.
3. **Durable provider state** — whether the resource has accepted/reserved/committed/rejected the operation.
4. **Reconciliation path** — how an unresolved accepted operation is queried or resolved.
5. **Historical evidence** — prior accepted/committed/corrected/reversed events remain distinguishable.

This is a research-derived contract boundary, **not yet a Nexo architecture proposal**.

### New invariant candidates

**INV-F-05 — In-flight state preservation:** provider evidence that an operation remains in progress must not be erased merely to fit a binary local state model.

**INV-F-06 — Atomic admission:** generation validation and the protected admission decision must share one authoritative atomic boundary when stale actors can race.

**INV-F-07 — Reservation ≠ commitment:** accepted/reserved status must not be promoted to committed effect without provider semantics establishing that equivalence.

**INV-F-08 — Post-admission resolution:** once an operation is accepted/reserved, fencing of later actors does not resolve the earlier operation; an authoritative lifecycle/reconciliation mechanism is required.

These are candidate invariants only; no formal verification has been performed.

### Current disposition

- I24: **INDEPENDENT / UNTESTED**.
- ACCEPTED_OR_RESERVED: **RETAINED as semantic audit category**, not universal enum.
- F2: **requires atomic admission/compare-and-accept boundary**.
- F3: **requires explicit lifecycle/reconciliation semantics**.
- I19/I20/I21/I22 remain as previously classified.
- I23 remains absorbed by operation-identity parameterization.
- 20 top-level classes: **UNFROZEN**.
- Coverage denominator: **NOT FROZEN**.
- Formal verification: **NOT PERFORMED**.
- Implementation: **NOT STARTED**.

### Exact next action

**AB104.841R:** reduce I24 against I19/I20/I21 and existing reconciliation witnesses; then attack whether F3 can be decomposed into already-known lifecycle cases or requires a distinct interaction. Next, study concrete provider contracts for reservation/commit/cancel semantics and test the normalized evidence model against them. Do not choose Nexo technologies yet.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.841R — I24/F3 REDUCTION + ACCEPTED_OR_RESERVED SEMANTIC ATTACK

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### Fresh external cross-check

Microsoft's current Idempotent Consumer guidance explicitly distinguishes an in-progress record from a completed effect: an in-progress record can mean an external call partially completed or another consumer is still working, and therefore requires reconciliation rather than being treated as completion. It also requires the deduplication marker and local business effect to share one transaction where they can. citeturn0search0 AWS similarly documents idempotency tokens as a mechanism for safe retries, but the guarantee depends on the service contract and does not make arbitrary external effects exactly-once. citeturn0search1

### I24 reduction

I24 = provider reports IN-PROGRESS while the coordinator is considering retry.

Against I20: I20 starts from UNKNOWN and requires later authoritative CONFIRMED evidence. I24 contains positive provider evidence that an execution remains active/pending; collapsing it into UNKNOWN would lose a meaningful provider fact.

Against I21: I21 is a stale-event regression after correction/reversal. I24 has no required correction or stale historical event.

Against W17: W17 covers acknowledgement uncertainty plus retry, but does not require an authoritative provider state that explicitly says the original execution remains in progress.

Against W13/W14: retention/incarnation and ownership-transfer interactions are orthogonal to provider in-progress semantics.

**Result: I24 remains an independent interaction.**

### ACCEPTED_OR_RESERVED attack

We tested three interpretations:

1. **Alias to UNKNOWN:** unsafe as a universal normalization because it discards positive evidence that the resource accepted/reserved the operation.
2. **Alias to CONFIRMED:** unsafe unless the provider contract defines acceptance/reservation as the semantic effect.
3. **Explicit semantic state:** preserves the provider fact while allowing a separate epistemic interpretation.

**Disposition:** retain ACCEPTED_OR_RESERVED as a semantic category, but do not make it a universal provider enum. Provider contracts must map their concrete states into this category with evidence and transition rules.

### F3 race decomposition

F3 = old epoch accepted/reserved → new epoch becomes authoritative → coordinator must determine whether the old operation may still commit.

Required questions:

- Can the reservation be cancelled by the new authority?
- Does acceptance itself create the protected semantic effect?
- Can the resource reject a later commit from the old epoch?
- Is the operation status query authoritative and linearizable/strong enough for the required decision?
- Can the provider emit a later correction/reversal?

No single generic answer exists. Therefore F3 cannot be safely reduced to fencing alone.

### Minimum boundary properties derived

For a resource-side effect boundary, the following must be independently specified:

1. **Admission predicate:** which authority/generation is allowed to create the operation?
2. **Identity predicate:** which operation identity binds retries to the original semantic operation?
3. **Transition predicate:** which state transitions are legal from ACCEPTED/RESERVED?
4. **Observation predicate:** what evidence establishes each resulting state?
5. **Reconciliation predicate:** what happens when observation is incomplete or delayed?
6. **Correction predicate:** how later corrections/reversals modify current state without erasing history?

These are audit predicates, not an architecture design.

### New interaction candidates

**I25 — ACCEPTED_OR_RESERVED → authority change → delayed commit/retry.**
The resource has accepted the original operation, authority changes, and a retry or delayed completion arrives. This is distinct from I24 because it requires an actual authority transition between acceptance and completion.

**I26 — ACCEPTED_OR_RESERVED → cancellation/expiry → delayed completion.**
A resource reports an accepted/reserved operation that is later cancelled or expires, followed by a delayed completion/result. This attacks whether a late result can resurrect a cancelled state.

Both are **UNTESTED** and not frozen as witnesses.

### Candidate invariants

**INV-F-05 — Accepted-but-not-confirmed is not completion:** acceptance/reservation must not be normalized to CONFIRMED unless the resource contract defines it as the semantic effect.

**INV-F-06 — Authority change does not erase historical acceptance:** a later authority generation cannot retroactively claim that a prior accepted operation never existed.

**INV-F-07 — Cancellation/expiry does not erase evidence:** a later cancellation/expiry may change current state but must preserve the accepted/reserved history.

Candidate only; not formally verified.

### Current disposition

I17: absorbed by W17 parameterization.
I18: absorbed by W18 parameterization.
I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I23: absorbed by operation-identity parameterization.
I24: independent / untested.
I25: candidate / untested.
I26: candidate / untested.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.842R:** attack I25/I26 against I19-I24 and the existing correction, fencing, recovery, retention, and stale-event interactions. Determine whether ACCEPTED_OR_RESERVED + authority change and ACCEPTED_OR_RESERVED + cancellation are genuinely new ordered interactions or parameterizations. Then define the minimum legal transition graph around acceptance/reservation without selecting a concrete provider implementation.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.842R — I25/I26 REDUCTION + MINIMUM ACCEPTED/RESERVED TRANSITION GRAPH

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### External cross-check

Microsoft's current Idempotent Consumer guidance distinguishes an in-progress external operation from completion and states that stale in-progress records require reconciliation before a redelivery is considered safe. AWS likewise documents that idempotency tokens make retries safe only when the receiving service honors the token contract; exact-once behavior across arbitrary external effects is not implied. citeturn0search0turn0search1 Fencing remains resource-side: the protected resource must actively reject stale tokens for the token to provide a safety property. citeturn0search8

### I25 reduction

I25 = ACCEPTED_OR_RESERVED → authority change → delayed commit/retry.

Against I24: I24 requires provider IN-PROGRESS evidence but does not require an authority-generation transition between acceptance and completion.

Against I19: I19 is CONFIRMED → correction/reversal → reconstruction; it does not begin from an accepted-but-not-confirmed state.

Against I20: I20 begins UNKNOWN and later receives authoritative confirmation; I25 begins with positive acceptance/reservation evidence and introduces a stale-authority transition before possible completion.

Against I21: I21 is stale historical evidence after correction/reversal, not a live accepted operation crossing an authority transition.

**Result: I25 remains an independent ordered interaction candidate.** It is not yet a frozen witness.

### I26 reduction

I26 = ACCEPTED_OR_RESERVED → cancellation/expiry → delayed completion/result.

Against I21: I21 requires a later correction/reversal followed by an old historical event; I26 requires cancellation/expiry before a delayed completion/result.

Against I24: I24 has unresolved provider execution but no required cancellation/expiry transition.

Against I25: I25's critical transition is authority change; I26's critical transition is lifecycle cancellation/expiry and can occur without an authority change.

**Result: I26 remains an independent ordered interaction candidate.**

### Minimum legal semantic graph

The smallest provider-neutral graph supported by the evidence is not a universal enum; it is a set of semantic states and guarded transitions:

`NOT_ACCEPTED → ACCEPTED_OR_RESERVED`

`ACCEPTED_OR_RESERVED → COMMITTED`

`ACCEPTED_OR_RESERVED → FAILED`

`ACCEPTED_OR_RESERVED → EXPIRED/CANCELLED`

`ACCEPTED_OR_RESERVED → IN_PROGRESS`

`IN_PROGRESS → COMMITTED`

`IN_PROGRESS → FAILED`

`IN_PROGRESS → EXPIRED/CANCELLED`

`COMMITTED → CORRECTED`

`COMMITTED → REVERSED`

The following transitions are **not universally admissible** and require provider-specific evidence/contracts:

`EXPIRED/CANCELLED → COMMITTED`
`FAILED → COMMITTED`
`REVERSED → COMMITTED`

These are not declared globally impossible; they require an explicit provider contract or a correction model that explains what the later event means.

### Critical semantic distinction

`ACCEPTED_OR_RESERVED` is evidence that the resource accepted/reserved an operation, not proof that the intended business effect has committed.

`IN_PROGRESS` is evidence of unresolved execution, not proof of absence and not proof of completion.

`EXPIRED/CANCELLED` changes the current state but does not erase prior acceptance evidence.

`COMMITTED` can later be corrected/reversed without deleting the original committed history.

### Authority-change attack

Sequence:

`G1 accepts O → G2 becomes current → delayed completion from G1`

The correct decision cannot be derived from G2 alone. It depends on whether the resource checks generation again at the commit boundary and whether G1's reservation remains valid. Therefore authority change and lifecycle transition remain separate predicates.

### Cancellation attack

Sequence:

`O accepted/reserved → cancelled/expired → delayed completion result`

The delayed result must not automatically resurrect COMMITTED. The resource's version/transition contract must establish whether the delayed result is valid, stale, compensating, or evidence of a commit that happened before cancellation became effective.

### New invariant candidates

**INV-F-08 — Acceptance-history preservation:** later authority or lifecycle changes must not erase evidence that an operation was accepted/reserved.

**INV-F-09 — Guarded completion:** a completion transition after authority/lifecycle change must satisfy the resource's current transition/version contract; arrival order alone is insufficient.

**INV-F-10 — No resurrection from delayed result:** a delayed completion cannot resurrect a cancelled/expired/reversed current state without authoritative evidence that the transition is legal.

Candidate only; not formally verified.

### Current disposition

I17: absorbed by W17 parameterization.
I18: absorbed by W18 parameterization.
I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I23: absorbed by operation-identity parameterization.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
INV-EH-01/02: candidate.
INV-EF-01..04: candidate.
INV-F-01..10: candidate.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.843R:** attack I25/I26 with provider-specific lifecycle witnesses and attempt parameter reduction: (1) accepted/reserved + authority change + delayed completion, (2) accepted/reserved + cancellation/expiry + delayed completion, (3) correction/reversal after completion. Determine whether the distinction is fundamentally authority-based versus lifecycle-based, and whether the minimum graph requires an explicit IN_PROGRESS node or can represent it as provider evidence attached to ACCEPTED_OR_RESERVED.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.843R — I25/I26 PROVIDER-LIFECYCLE REDUCTION + IN_PROGRESS NODE ATTACK

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### External evidence cross-check

NIST's ordered-combination work supports treating these as ordered state transitions: faults can depend on the order in which inputs establish state, and sequence coverage is intended for such event-driven systems. citeturn0search0turn0search6 Microsoft documents that an in-progress external operation may be partially completed or still active, and stale in-progress records require reconciliation before redelivery is acknowledged. citeturn0search7turn0search9 AWS documents that retry safety depends on the receiving service's idempotency contract; exact-once is not implied for arbitrary external side effects. citeturn0search10turn0search12

### I25 reduction

I25 = ACCEPTED_OR_RESERVED → authority generation changes → delayed completion/retry.

It cannot be reduced to I24 because IN_PROGRESS alone does not require an authority-generation transition. It cannot be reduced to I20 because I20 begins UNKNOWN and resolves through later authoritative confirmation. It cannot be reduced to I21 because no correction/reversal or stale historical event is required.

**Result: I25 remains an independent ordered interaction candidate.**

Minimum causal sequence:
1. O accepted/reserved under G1;
2. G2 becomes authoritative;
3. G1 completion/retry arrives;
4. resource evaluates G1 against the current lifecycle/version contract;
5. outcome is explicit: reject, complete, reconcile, or UNKNOWN according to provider semantics.

### I26 reduction

I26 = ACCEPTED_OR_RESERVED → cancellation/expiry → delayed completion/result.

It is independent of I25 because cancellation/expiry can occur without any authority-generation transition. It is independent of I21 because the delayed result is not merely a stale historical correction event; it is a lifecycle completion crossing a cancellation boundary.

**Result: I26 remains an independent ordered interaction candidate.**

Minimum causal sequence:
1. O accepted/reserved;
2. cancellation/expiry becomes authoritative;
3. delayed completion/result arrives;
4. resource evaluates whether that completion is legal under its transition/version contract;
5. current state must not resurrect merely because the completion arrived later.

### Provider-lifecycle witnesses examined

The audit distinguishes three broad provider patterns:

**Pattern A — reservation is the semantic effect.** In this contract, ACCEPTED_OR_RESERVED may legitimately map to the business effect, but only because the provider explicitly defines it that way. A later completion is observation rather than a new business mutation.

**Pattern B — reservation is preparatory.** ACCEPTED_OR_RESERVED means durable intent/reservation, while COMMITTED is a later semantic transition. Retry and fencing must therefore protect the transition boundary, not just the initial reservation.

**Pattern C — asynchronous processing.** ACCEPTED_OR_RESERVED/IN_PROGRESS means the provider has accepted work whose terminal outcome is not yet known. A later status/event is needed for confirmation, failure, cancellation, or correction.

These patterns are semantically different. A universal normalization must preserve which pattern the provider contract establishes.

### IN_PROGRESS node attack

Question: can IN_PROGRESS safely be represented only as provider evidence attached to ACCEPTED_OR_RESERVED?

**Reduction attempt:** If the provider contract guarantees that IN_PROGRESS never changes the legal retry/cancel/reconciliation decision compared with ACCEPTED_OR_RESERVED, then a separate semantic state is unnecessary for that provider. But if IN_PROGRESS changes what operations are legal — e.g. retry must be suppressed, cancellation has different semantics, or reconciliation has a distinct authoritative query — collapsing it loses a decision-relevant state.

Therefore:

**IN_PROGRESS is not required as a universal top-level state, but it is required as a distinguishable provider-semantic condition whenever it changes legal transitions or evidence interpretation.**

This preserves provider neutrality without erasing decision-relevant semantics.

### Minimum transition graph refinement

Provider-neutral semantic categories:

`NOT_ACCEPTED`
`ACCEPTED_OR_RESERVED`
`IN_PROGRESS*`
`COMMITTED`
`FAILED`
`EXPIRED_OR_CANCELLED`
`CORRECTED`
`REVERSED`
`UNKNOWN`

`*` IN_PROGRESS is conditional: retain it distinctly only when the provider contract gives it transition/evidence significance.

Required guarded transitions include:

`NOT_ACCEPTED → ACCEPTED_OR_RESERVED`
`ACCEPTED_OR_RESERVED → COMMITTED | FAILED | IN_PROGRESS | EXPIRED_OR_CANCELLED`
`IN_PROGRESS → COMMITTED | FAILED | EXPIRED_OR_CANCELLED | UNKNOWN`
`COMMITTED → CORRECTED | REVERSED`

No universal rule permits:

`EXPIRED_OR_CANCELLED → COMMITTED`
`FAILED → COMMITTED`
`REVERSED → COMMITTED`

without provider-specific transition evidence.

### New reduction insight

I25 and I26 share the same **accepted-but-not-final** starting state but differ in the transition that invalidates or changes the pending operation:

- I25: **authority dimension changes**.
- I26: **lifecycle dimension changes**.

They therefore should not be merged merely because both end in a delayed completion race.

### Current disposition

I17: absorbed by W17 parameterization.
I18: absorbed by W18 parameterization.
I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I23: absorbed by operation-identity parameterization.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.844R:** perform a targeted search for concrete provider contracts covering reserve/authorize/capture/cancel/expire and asynchronous completion; then attack whether I25/I26 are actually provider-specific refinements of the same cross-domain atomicity class. Also test whether any legal transition from EXPIRED/CANCELLED or FAILED back to COMMITTED is a correction/reversal case rather than a genuine resurrection.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.845R — TYPED-EVENT REDUCTION + FRESHNESS BOUNDARY

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### Fresh evidence

NIST's ordered-combination work confirms that stateful failure analysis must preserve event ordering and the state established by prior events; this is directly applicable to payment/resource lifecycle races. citeturn0search0turn0search1 Adyen documents that manual capture is asynchronous and produces later CAPTURE/CAPTURE_FAILED outcomes, while cancellation is also asynchronous and its outcome arrives through a CANCELLATION webhook. citeturn0search7 A reversal is likewise resolved asynchronously and has different semantics depending on whether capture already occurred: cancel if uncaptured, refund if captured. citeturn0search10

### Typed-event model

The previous universal labels were too coarse. Each observed event is now provisionally interpreted across four independent dimensions:

1. **Attempt state** — what happened to this request/attempt.
2. **Resource lifecycle state** — what state the underlying resource/payment is in.
3. **Effect knowledge** — what is established about the intended business effect.
4. **Correction/reversal relation** — whether this event modifies or compensates an earlier effect.

An event must not be allowed to change all four dimensions merely because its textual status looks terminal.

Example: `CAPTURE_FAILED` can describe a failed capture attempt without proving that the underlying authorization/payment is permanently failed. Adyen explicitly documents capture failure as an outcome of the capture request and separately documents subsequent lifecycle handling. citeturn0search7

### I25 typed reduction

Sequence:
`ACCEPTED/RESERVED(G1) → G2 authoritative → delayed completion(G1)`.

Typed interpretation shows two independent predicates:
- authority validity of G1;
- resource transition validity at the completion boundary.

If the resource contract checks generation/version at the protected transition, stale G1 can be rejected without implying that the original acceptance never happened. If it does not, the delayed completion may still be accepted according to the provider's lifecycle contract. Therefore I25 is not reducible to generic duplicate delivery or generic stale evidence.

**Disposition: I25 remains independent / untested.**

### I26 typed reduction

Sequence:
`ACCEPTED/RESERVED → CANCEL/EXPIRE → delayed completion`.

Typed interpretation separates:
- cancellation/expiry as a resource lifecycle transition;
- delayed completion as an attempt/result event;
- effect knowledge as a separate dimension.

A delayed completion after cancellation cannot be classified solely from arrival order. It may represent a valid earlier commit, an invalid late attempt, or a provider-specific transition requiring reconciliation. Adyen's asynchronous cancel/capture model demonstrates why local webhook order is insufficient. citeturn0search7turn0search11

**Disposition: I26 remains independent / untested.**

### Freshness relation

A universal wall-clock timestamp is insufficient as the sole semantic ordering mechanism. The audit therefore defines a provider-neutral relation over an incoming event E relative to current authoritative state S:

- **NEWER** — contract establishes E follows S for the same resource stream.
- **EQUAL/DUPLICATE** — E represents the same semantic transition already incorporated.
- **OLDER** — contract establishes E precedes S.
- **INCOMPARABLE** — available evidence cannot establish ordering.

Potential evidence mechanisms include provider sequence/version, resource revision, stream position, causal reference, or another explicitly documented monotonic relation. These are evidence mechanisms, not universal Nexo implementation choices.

**INCOMPARABLE must not be silently interpreted as OLDER or NEWER.** It requires the provider's reconciliation/transition contract.

### Resurrection reclassification

The prior blanket question `EXPIRED/CANCELLED → COMMITTED?` was too coarse. The correct question is:

`Does a later event represent a legal transition of the same resource, a retry of a failed attempt, a correction/reversal, or an actual resurrection?`

Likewise:

`FAILED → COMMITTED`

must first determine whether FAILED refers to an attempt or the underlying resource lifecycle.

Thus apparent resurrection is not itself a universal interaction class. It becomes a safety violation only when a transition crosses a typed state boundary that the authoritative resource contract forbids.

### Reduction result

I25 and I26 cannot currently be collapsed into one interaction without losing whether the boundary-changing event is **authority** or **resource lifecycle**.

However, both can share a common typed-event analysis substrate:

`identity → typed event → semantic freshness → guarded transition → effect knowledge → reconciliation disposition`.

This is a research abstraction only, **not architecture design**.

### Candidate invariants

**INV-TE-01 — Typed-event non-escalation:** an event may modify only the semantic dimensions for which its contract provides authoritative evidence.

**INV-TE-02 — Incomparable-order safety:** an event with incomparable semantic order must not regress current state solely by arrival.

**INV-TE-03 — Attempt/resource separation:** failure of an operation attempt must not automatically become terminal failure of the underlying resource.

**INV-TE-04 — Resurrection requires authoritative legality:** a transition that appears to resurrect a prior state requires explicit resource-contract evidence; local arrival order is insufficient.

All four are candidates only; none formally verified.

### Current disposition

I17: absorbed by W17 parameterization.
I18: absorbed by W18 parameterization.
I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I23: absorbed by operation-identity parameterization.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.846R:** attack the NEWER/EQUAL/OLDER/INCOMPARABLE relation against concrete provider sequence/version mechanisms, same-resource retries, duplicate webhooks, correction/reversal, recovery/incarnation changes, and namespace changes. Determine the minimum evidence required to establish semantic order and whether `INCOMPARABLE` itself needs a separate interaction witness or is covered by existing UNKNOWN/reconciliation cases.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.846R — FRESHNESS RELATION ATTACK: NEWER/EQUAL/OLDER/INCOMPARABLE

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### Evidence cross-check

NIST explicitly treats ordered event sequences as necessary for state-based systems because the same inputs can produce different outcomes depending on prior state and event order. citeturn0search0turn0search5 Adyen payment webhooks expose event type, success, eventDate, and references to the original payment, while capture/cancellation/reversal outcomes are represented as distinct events. citeturn0search9turn0search11 Adyen's reversal API also demonstrates why an event can require resource-state interpretation rather than simple timestamp ordering: the same reversal request can cancel an uncaptured payment or refund a captured one. citeturn0search8

### Freshness mechanisms attacked

**1. Provider sequence/version**

If the provider guarantees a monotonic sequence/version for one resource stream, it can establish NEWER/EQUAL/OLDER for that stream. It does not automatically establish ordering across different resources, merchants, namespaces, or provider systems.

**2. Resource revision**

A revision tied to the resource can establish that one state supersedes another if the provider contract defines revision semantics. A locally generated revision cannot prove external ordering.

**3. Stream/event position**

A position is strong within its stream. It becomes INCOMPARABLE when events originate from different streams or the contract does not define cross-stream ordering.

**4. Causal reference**

An explicit `originalReference`/parent/event-cause relation can establish semantic linkage. It does not necessarily provide a total order among sibling events.

**5. Timestamp/eventDate**

A timestamp can be useful evidence, but it is not sufficient by itself to establish semantic precedence. Adyen exposes `eventDate`, but the contract still identifies events by type/reference and the lifecycle semantics determine their meaning. citeturn0search11

### Resulting relation

For an incoming event E against current authoritative state S:

`NEWER` = contract establishes E semantically follows S.

`EQUAL/DUPLICATE` = E is the same semantic transition already incorporated.

`OLDER` = contract establishes E semantically precedes S.

`INCOMPARABLE` = available evidence cannot establish either ordering.

The relation is **partial**, not necessarily total.

### INCOMPARABLE attack

Candidate reduction to existing UNKNOWN/reconciliation cases was attempted.

Result: **INCOMPARABLE is not automatically a new interaction witness.** It is primarily an epistemic relation produced when freshness evidence is insufficient.

It becomes a distinct interaction only when the inability to order events changes the protected decision compared with an existing UNKNOWN/reconciliation scenario — for example, when one possible ordering permits a commit while another forbids it and no authoritative reconciliation can distinguish them.

Therefore no new witness is frozen in AB104.846R.

### Identity/namespace/incarnation attack

A freshness relation must be scoped to an identity domain. The same sequence number cannot be assumed comparable across:

- different operation identities;
- different resource identities;
- different namespaces/tenants;
- different provider accounts;
- different resource incarnations.

An authenticated event from an old incarnation can still be authentic yet obsolete for the current incarnation. This preserves the previously established distinction:

**authentication validity ≠ incarnation validity ≠ authority validity ≠ semantic freshness.**

### Recovery attack

After recovery, a locally reconstructed state may have a higher local observation version without possessing newer external evidence. Therefore local observation version must not be treated as provider semantic freshness.

Recovery can establish a new local incarnation/epoch, but it does not retroactively order external events.

### Candidate invariant refinement

**INV-EH-03 — Freshness is scoped:** a freshness relation is valid only within the identity/resource/version domain whose contract defines it.

**INV-EH-04 — Partial-order preservation:** absence of a defined ordering relation must remain INCOMPARABLE; the system must not manufacture a total order merely to simplify processing.

**INV-EH-05 — Local observation ≠ external freshness:** a newer local observation/recovery version does not prove that the underlying external event is newer.

Candidates only; not formally verified.

### Coverage consequence

No new top-level class and no mandatory witness was added solely because INCOMPARABLE exists. Existing UNKNOWN/reconciliation witnesses remain candidates for representing its effect when the decision boundary is the same.

However, a future coverage matrix must distinguish:

`known older` vs `unknown ordering`.

They are not semantically equivalent even if both ultimately lead to reconciliation.

### Current disposition

I17: absorbed by W17 parameterization.
I18: absorbed by W18 parameterization.
I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I23: absorbed by operation-identity parameterization.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
INCOMPARABLE: epistemic relation / no new witness frozen.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.847R:** attack freshness scoping against cross-namespace, cross-incarnation, duplicate, correction/reversal, and concurrent-operation cases. Build a finite freshness relation matrix and determine whether `EQUAL/DUPLICATE`, `OLDER`, and `INCOMPARABLE` are sufficient, or whether a separate `CONFLICTING` relation is needed when two authenticated events cannot both be true under the same resource contract.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**
