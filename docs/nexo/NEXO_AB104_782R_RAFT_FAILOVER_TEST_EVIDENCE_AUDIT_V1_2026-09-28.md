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


---
## AB104.847R — FRESHNESS SCOPE MATRIX + CONFLICTING REDUCTION

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### External cross-check

NIST's ordered t-way method supports treating event order as part of the stateful test condition rather than assuming unordered combinations are sufficient. citeturn0search0turn0search3 Microsoft event-sourcing guidance describes each entity as having an ordered event stream, stresses event ordering for current-state correctness, and notes that duplicate delivery requires idempotent handling. citeturn0search5 Adyen explicitly documents duplicate webhook delivery and provides `eventCode`/`pspReference` identity plus event timestamps and, for some webhooks, sequence numbers; it also warns that duplicate events can have differing eventDate/other fields. citeturn0search7turn0search13 Microsoft Fabric likewise documents at-least-once delivery and no guaranteed arrival order, reinforcing that transport order is not semantic order. citeturn0search11

### Finite freshness matrix

The working relation is evaluated only after identity/resource scope is established:

| Evidence relationship | Same identity/resource | Different namespace | Different incarnation | Same semantic event | Disposition |
|---|---|---|---|---|---|
| explicit higher sequence/version | NEWER | INCOMPARABLE | normally INCOMPARABLE/reject by contract | EQUAL if same version+identity | strong only in declared domain |
| explicit lower sequence/version | OLDER | INCOMPARABLE | normally INCOMPARABLE/reject by contract | EQUAL if same event identity | no cross-domain comparison |
| exact event identity | EQUAL/DUPLICATE | not comparable | not comparable | EQUAL/DUPLICATE | identity first |
| causal parent/reference | ordered only where relation is explicit | INCOMPARABLE | INCOMPARABLE unless contract binds incarnations | may establish same transition | partial relation |
| timestamp only | weak evidence; not authoritative by itself | INCOMPARABLE | INCOMPARABLE | not enough by itself | do not manufacture order |
| no ordering evidence | INCOMPARABLE | INCOMPARABLE | INCOMPARABLE | UNKNOWN until identity proves duplicate | reconcile if decision-sensitive |

### `CONFLICTING` attack

Candidate definition:

`CONFLICTING(E,S)` = E and S are both authenticated and scoped to the same semantic resource domain, but the available authoritative contract says they cannot both represent the valid current state, while no ordering relation establishes which one supersedes the other.

Reduction attempts:

**CONFLICTING → INCOMPARABLE:**
Not always sufficient. INCOMPARABLE says ordering is unknown; CONFLICTING adds a stronger fact: the candidate states are mutually incompatible under the resource contract. That can change the protected decision from "wait/reconcile" to "reject/hold/escalate" even though ordering remains unknown.

**CONFLICTING → DUPLICATE:**
Invalid when event payload/state transition differs materially. Same authentication and same resource are not enough to establish duplicate identity.

**CONFLICTING → OLDER/NEWER:**
Invalid when the contract supplies no precedence evidence.

**CONFLICTING → CORRECTION:**
Invalid unless the later event is explicitly defined as a correction/reversal of the earlier event.

**Disposition:** `CONFLICTING` remains a **provisional epistemic/semantic relation**, not a new top-level failure class and not yet a frozen witness.

### Cross-namespace attack

An authenticated event from namespace N1 cannot be compared with an event in N2 merely because both use sequence `42`. Namespace binding is part of the identity/freshness domain. A cross-namespace event should therefore be rejected or reconciled according to the source/namespace contract, rather than classified as OLDER or NEWER.

### Cross-incarnation attack

An event from incarnation I1 can be authentic and correctly signed while still being obsolete for incarnation I2. Therefore authentication does not establish incarnation validity. If the contract binds event identity to an incarnation, I1→I2 crossing is a scope violation; if it does not, the event may become INCOMPARABLE and require reconciliation.

### Duplicate + correction attack

A duplicate is defined by semantic event identity, not by payload equality alone. A later correction may legitimately have the same resource reference but a different event identity and transition. Therefore:

`CONFIRMED(v2) → CORRECTED(v3) → duplicate CONFIRMED(v2)`

must retain `CORRECTED` as current state while preserving the old event in history. Microsoft event-sourcing guidance explicitly treats the event stream as ordered history and recommends idempotent duplicate handling. citeturn0search5

### Concurrent authenticated events

Two authenticated events for the same resource can both be valid observations but represent incompatible transitions. If the provider gives no sequence, causal relation, or authoritative status query that resolves them, the correct classification is not an invented total order. It is **CONFLICTING + reconciliation required**.

This is the first condition found where `CONFLICTING` carries information not fully represented by `INCOMPARABLE`.

### Candidate invariants

**INV-EH-06 — Scope before freshness:** no freshness comparison occurs until identity, namespace, resource and incarnation scope are established.

**INV-EH-07 — Conflict is not duplicate:** authenticated events with incompatible semantic transitions must not be deduplicated merely because they reference the same resource.

**INV-EH-08 — No invented total order:** when authoritative precedence is absent, preserve INCOMPARABLE/CONFLICTING rather than selecting a winner from arrival order.

**INV-EH-09 — Correction preserves history:** a correction/reversal supersedes current interpretation only according to its contract and never requires deletion of the historical event it corrects.

Candidates only; no formal verification.

### Coverage consequence

`CONFLICTING` does **not** yet justify a new witness. It is a semantic relation that may be exercised by existing correction, reconciliation, authentication, and concurrent-event interactions. Before adding a witness, we must show that the protected decision boundary differs from all existing witnesses.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
INCOMPARABLE: epistemic relation / no witness frozen.
CONFLICTING: provisional semantic relation / no witness frozen.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.848R:** attack `CONFLICTING` against I3/I4/I6/I10/I19/I21 and concurrent-operation cases. Define the minimum protected decision difference between `INCOMPARABLE` and `CONFLICTING`; determine whether conflict can be represented as a typed reconciliation outcome without adding a witness; then perform a targeted search for real distributed/payment incidents where two authentic, same-resource events were mutually incompatible and ordering could not be established.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.848R — CONFLICTING REDUCTION + PROTECTED-DECISION TEST

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### External cross-check

Adyen documents that duplicate webhook events can share event identity while other fields differ, and recommends using event identity plus event timing/sequence information to process events correctly. Its webhook model also contains distinct lifecycle events such as CAPTURE, CANCELLATION, EXPIRE and reversal-related events. citeturn0search0turn0search1 Microsoft event-sourcing guidance states that at-least-once delivery requires idempotent consumers and reconciliation when concurrent event-derived state can conflict. citeturn0search12

### Minimum distinction: INCOMPARABLE vs CONFLICTING

The reduction test used the protected decision boundary, not merely different labels.

**INCOMPARABLE:** ordering evidence is insufficient. The candidate events may or may not be compatible; the system cannot establish precedence.

**CONFLICTING:** the resource contract establishes that the two authenticated/scoped observations cannot both represent the valid current state, while precedence remains unresolved.

Therefore CONFLICTING contains one additional predicate: **mutual incompatibility under the authoritative state contract**.

### Attack against existing interactions

**I3 — correction + stale observation + reconciliation:** overlaps strongly, but I3 assumes a correction relationship or known stale relation. CONFLICTING does not require that either event be defined as a correction of the other. KEEP DISTINCT provisionally.

**I4 — transaction abort + external effect + retry:** different causal trigger; no requirement that two authenticated observations be mutually incompatible. KEEP DISTINCT.

**I6 — authentication + obsolete incarnation + authority:** authentication/incarnation validity is orthogonal to same-resource state conflict. KEEP DISTINCT.

**I10 — authentication/source + old incarnation:** same result; source validity does not establish semantic compatibility. KEEP DISTINCT.

**I19 — confirmed + correction/reversal + reconstruction:** I19 contains an explicit correction/reversal transition. CONFLICTING does not. KEEP DISTINCT.

**I21 — correction/reversal + stale duplicate:** I21 requires a stale pre-correction event. CONFLICTING does not. KEEP DISTINCT.

**Concurrent-operation cases:** these can produce CONFLICTING observations, but only become a distinct interaction if the protected decision differs from existing concurrent/race witnesses. This remains unproven.

### Protected decision test

Three outcomes were compared:

1. **INCOMPARABLE + compatible possibility:** preserve evidence, avoid regression, reconcile/hold if necessary.
2. **INCOMPARABLE + incompatible possibility:** same epistemic uncertainty but the resource contract may already prohibit one state combination.
3. **CONFLICTING:** contract proves mutual incompatibility; the protected boundary can therefore reject/hold/escalate without selecting an ordering winner.

This demonstrates that CONFLICTING can carry decision-relevant information beyond pure ordering uncertainty.

However, that does **not** automatically create a new top-level failure class or witness. It can be represented as a typed reconciliation outcome unless a concrete race shows a unique causal trigger and protected decision absent from existing witnesses.

### Real provider witness

Adyen's webhook model provides a concrete source of same-resource, distinct lifecycle observations: a payment can have CAPTURE, CAPTURE_FAILED, CANCELLATION, EXPIRE and later reversal-related events, all tied to the payment through PSP/original references. citeturn0search1turn0search5 This demonstrates that same-resource event incompatibility is realistic, but the provider's event contract normally supplies enough semantic information to classify the transition; it is not evidence that an unresolved CONFLICTING state necessarily occurs in production.

Therefore we do **not** claim a real incident establishing an unresolvable CONFLICTING state from this documentation alone.

### Disposition

**CONFLICTING remains a provisional semantic/reconciliation relation, not a new witness.**

No W19/W20/etc. witness is created by AB104.848R.

### Candidate invariants

**INV-EH-10 — Conflict requires contract-level incompatibility:** do not label two observations CONFLICTING merely because their textual statuses differ.

**INV-EH-11 — Conflict does not select a winner:** CONFLICTING permits rejection/hold/reconciliation but does not authorize choosing one event by arrival order.

**INV-EH-12 — Conflict preserves evidence:** both authenticated observations remain historical evidence even when one cannot become current state.

Candidates only; not formally verified.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
INCOMPARABLE: epistemic relation / no witness frozen.
CONFLICTING: provisional semantic/reconciliation relation / no witness frozen.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.849R:** attack the typed-event model against simultaneous same-resource transitions and determine whether CONFLICTING can always be reduced to a reconciliation outcome. Then perform a broader real-incident/code cross-check for event-order conflicts, duplicate/out-of-order webhooks, and stale projections, without treating documentation examples as proof of production incidents.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.849R — SIMULTANEOUS SAME-RESOURCE TRANSITIONS + CONFLICTING REDUCTION

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### External/code cross-check

Microsoft's event-sourcing guidance gives a concrete same-entity race: two handlers can read the same prior state and both attempt a reservation; optimistic concurrency rejects one append when the event stream has changed, after which the losing handler reloads and reevaluates. It also states that eventual-consistency projections can lag the event store and that conflicting changes spanning multiple entities still require reconciliation. citeturn0search0turn0search1 Orleans provides an executable analogue: a conditional event checks that the local version still matches storage and refuses the append when another event has won the race. citeturn0search2 EF Core similarly uses a version predicate so a concurrent update affects zero rows and raises a concurrency exception rather than silently overwriting the newer value. citeturn0search4

### Simultaneous-transition model

Two authenticated events E1 and E2 for the same resource can be:

A. **compatible** — both may legally exist;
B. **ordered** — contract establishes E1 before E2 or E2 before E1;
C. **duplicate** — same semantic transition already incorporated;
D. **incomparable but potentially compatible** — ordering unavailable and compatibility unresolved;
E. **conflicting** — contract establishes that both cannot be current simultaneously, while precedence remains unresolved.

This produces a finite decision relation without inventing a total order.

### Attack: can CONFLICTING always become reconciliation?

Reduction test:

If the resource contract supports an authoritative read/reconciliation operation that can determine the current state, CONFLICTING can terminate as a **reconciliation outcome** without a unique witness.

If no authoritative reconciliation exists, the protected boundary may have to enter a durable HOLD/UNKNOWN state and prevent either event from producing an irreversible semantic effect until external evidence resolves the conflict.

Therefore CONFLICTING is best modeled provisionally as a **typed decision outcome**, not a top-level failure class.

### Important distinction: local optimistic concurrency vs external conflict

A database/event-store version check can prevent two local writes from committing simultaneously. It does **not** prove that an external provider accepted neither, one, or both corresponding effects. The external-effect ambiguity remains a separate evidence problem.

This preserves the previously established boundary:

`local commit/concurrency result ≠ external effect result`.

### Cross-check against I19/I21

**I19** requires confirmed effect → correction/reversal → local reconstruction. A simultaneous conflict does not require correction/reversal or projection loss. KEEP DISTINCT.

**I21** requires a stale pre-correction event after correction/reversal. Simultaneous conflict does not require that history. KEEP DISTINCT.

However, a concrete incident could instantiate both: e.g. two conflicting transitions race, one becomes authoritative, then a stale event arrives after a correction. That is a higher-order composition, not evidence that the base interactions are duplicates.

### Conflict decision matrix

| Condition | Relation | Protected disposition |
|---|---|---|
| Same event identity | EQUAL/DUPLICATE | idempotent no-op / preserve history |
| Proven higher version | NEWER | apply if transition legal |
| Proven lower version | OLDER | preserve history; do not regress |
| No order, compatibility unresolved | INCOMPARABLE | hold/reconcile as contract requires |
| Same scope, contract-proven incompatibility, no order | CONFLICTING | hold/reject/reconcile; do not choose by arrival |
| Different namespace/incarnation | OUT-OF-SCOPE | reject/reconcile; no freshness comparison |

### New candidate interaction

A candidate **I27 — concurrent same-resource incompatible transitions with no authoritative precedence** was considered.

Reduction against existing concurrency classes shows that generic concurrent-operation races do not necessarily include the stronger predicates:
- same resource;
- mutually incompatible transitions;
- both authenticated/scoped;
- no authoritative precedence;
- protected boundary must avoid selecting a winner by arrival order.

Therefore **I27 is admissible and provisionally independent**, but no witness is frozen yet. We require a concrete causal scenario and decision difference before creating W19+.

### Candidate invariants

**INV-EH-13 — Same-resource conflict cannot be resolved by arrival order.**

**INV-EH-14 — Local concurrency success/failure does not prove external-effect success/failure.**

**INV-EH-15 — Conflict resolution must preserve both evidence records even when only one transition becomes current.**

Candidates only; no formal verification.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
I27: admissible / provisionally independent / untested.
INCOMPARABLE: epistemic relation / no witness frozen.
CONFLICTING: provisional semantic/reconciliation relation.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.850R:** attack I27 against the existing concurrency, transaction-isolation, authority, duplicate-delivery, correction and reconciliation witnesses. Search executable/code-level cases where two valid same-resource transitions race without an authoritative total order, and determine the minimum witness needed to distinguish I27 from ordinary optimistic-concurrency rejection.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.850R — I27 ATTACK: CONCURRENT SAME-RESOURCE CONFLICT WITHOUT AUTHORITATIVE PRECEDENCE

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### Code/evidence cross-check

PostgreSQL's current documentation shows that Serializable isolation permits concurrent transactions to commit only when their result is consistent with some serial ordering; otherwise one transaction is aborted with a serialization failure and must retry the whole transaction. citeturn0search0turn0search4 PostgreSQL's SSI implementation explicitly detects dependency cycles that would make concurrent results inconsistent with any serial execution. citeturn0search7 Kafka provides a contrasting concrete fencing mechanism: producer epochs can fence an older producer instance, producing ProducerFencedException/InvalidProducerEpochException when an old epoch attempts to act. citeturn0search6turn0search9

### I27 reduction target

I27 = two authenticated/scoped transitions for the same resource, mutually incompatible under the resource contract, with no authoritative precedence, where the protected boundary must not choose a winner by arrival order.

### Attack 1 — ordinary database serialization conflict

A PostgreSQL SERIALIZABLE conflict is not sufficient to establish I27. The database supplies an authoritative local serialization decision: one transaction commits and the other aborts. The protected decision therefore has a total local outcome, even if the application did not know the winner before commit.

**Result:** I27 is NOT equivalent to ordinary local serialization failure.

### Attack 2 — optimistic version conflict

A version predicate similarly supplies a local precedence boundary: one update wins and the stale update fails. This is a local authority decision, not an unresolved CONFLICTING state.

**Result:** I27 survives this reduction.

### Attack 3 — fencing/epoch conflict

Kafka's producer epoch provides a concrete external-resource analogue where the resource itself rejects an older epoch. This again supplies authoritative precedence. The stale actor may be rejected without requiring the system to invent an ordering from arrival time. citeturn0search6

**Result:** epoch fencing is not I27; it is one mechanism that prevents the unresolved condition.

### Attack 4 — two valid external events, no total-order evidence

The unresolved case remains possible in the abstract/provider-neutral model:

E1 authenticated + scoped
E2 authenticated + scoped
E1 and E2 incompatible
no sequence/version/causal authority
no authoritative status/reconciliation result

At this boundary the system cannot safely select E1 or E2 merely because one arrived first.

**Result:** I27 remains admissible and provisionally independent.

### Minimum witness candidate W19

No W19 is frozen yet. The minimum candidate sequence is:

1. Resource R has state S.
2. Two independently valid operations O1 and O2 target R.
3. Both produce authenticated/scoped events E1 and E2.
4. E1 and E2 imply mutually incompatible transitions under the resource contract.
5. Neither event carries authoritative precedence over the other.
6. No authoritative reconciliation query can resolve the conflict at decision time.
7. Protected boundary must hold/reject/reconcile rather than choose by arrival order.
8. Both events remain durable evidence.

This is intentionally not called a bug until a concrete system contract demonstrates that such a state is reachable and requires this decision.

### Important distinction

**Serializable failure / optimistic conflict / fencing rejection** are *resolution mechanisms*.

**I27** is the unresolved semantic condition where those mechanisms do not provide authoritative precedence.

Therefore the existence of strong concurrency mechanisms does not eliminate the need to model the unresolved external case; it only shows how a particular system may prevent it.

### Higher-order interaction check

I27 composes with I21, I24, I25, I26, and I19. These combinations are higher-order interactions, not evidence that I27 is a duplicate of those classes.

### Candidate invariants

**INV-EH-16 — No arrival-order winner:** when no authoritative precedence exists, arrival order cannot choose current state.

**INV-EH-17 — Local conflict resolution is evidence:** serialization/version/fencing outcomes are authoritative only within their declared domain; they do not prove arbitrary external effects.

**INV-EH-18 — Unresolved conflict preserves evidence:** holding/rejecting/reconciling must preserve both observations and their provenance.

Candidates only; not formally verified.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
I27: **admissible / provisionally independent / untested**.
W19: **candidate only / not frozen**.
INCOMPARABLE: epistemic relation / no witness frozen.
CONFLICTING: provisional semantic/reconciliation relation.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.851R:** attack W19/I27 against the real external-effect boundary: payment capture/refund, webhook ordering, provider idempotency/reconciliation, and resource-side fencing. Determine whether a real provider can expose two authenticated incompatible events without an authoritative precedence query, or whether I27 is only a theoretical residue that should be represented as a reconciliation outcome rather than a witness.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.851R — I27 ATTACK AGAINST REAL EXTERNAL PAYMENT/EFFECT BOUNDARIES

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### Fresh external evidence

Adyen documents that capture and refund processing are asynchronous and that a successful validation/submission is not identical to final settlement: a later CAPTURE_FAILED or REFUND_FAILED event can occur, and a refund can later be reversed. citeturn0search3turn0search4 Adyen also requires webhook verification, supports event timestamps and, for some webhooks, sequence numbers, and explicitly warns that duplicate webhook deliveries can occur. citeturn0search0turn0search2 Stripe exposes event retrieval by event ID and retains events for a bounded period; its idempotency contract also binds repeated requests to the original result while the key remains retained, and reusing a pruned key can create a new request. citeturn0search1turn0search7turn0search8

### Attack against payment lifecycle

A payment provider therefore supplies more than raw arrival order: event identity, resource references, typed lifecycle events, and in some cases ordering metadata or authoritative status. This makes many apparent conflicts reducible to a provider-specific transition/reconciliation contract.

Example: Adyen distinguishes CAPTURE, CAPTURE_FAILED, REFUND, REFUND_FAILED, and REFUNDED_REVERSED. A later failure/reversal is not treated as proof that the earlier request never existed; it is a later lifecycle/correction event. citeturn0search3turn0search4

**Result:** ordinary payment webhook conflict does not establish I27 by itself.

### Attack against duplicate/out-of-order delivery

Adyen explicitly documents duplicate webhook deliveries and provides timestamp/sequence information for ordering where available. citeturn0search0 Therefore:

`duplicate + delayed + out-of-order` ≠ automatically `CONFLICTING`.

It can be classified as EQUAL/DUPLICATE, OLDER, NEWER, or INCOMPARABLE depending on the provider's evidence contract.

**Result:** no new I27 witness.

### Attack against idempotency

Stripe's idempotency layer demonstrates a stronger resource-side mechanism: the same retained key maps to the original result, while parameter mismatch is rejected; after key pruning, reuse can become a new request. citeturn0search8 This gives authoritative behavior inside the provider's idempotency scope.

**Result:** retained-key duplicate does not establish I27. Retention expiry creates a different interaction already represented by I22.

### Critical finding

The research did **not** find a documented production case proving the exact I27 condition:

`two authenticated same-resource incompatible events`
`+ no authoritative precedence`
`+ no authoritative reconciliation/status`
`+ protected boundary must decide.

The provider documentation instead repeatedly exposes mechanisms that reduce the ambiguity: event identity, timestamps/sequence numbers, typed lifecycle semantics, resource lookup, idempotency, and reconciliation/reporting.

Therefore **I27 is not yet promoted to a frozen witness**.

### Theoretical residue versus implementation witness

I27 remains useful as a **model-level residual condition** because a provider-neutral system cannot assume that every external resource supplies a total order or authoritative status API.

But it should not inflate the empirical witness set without evidence that a concrete resource contract actually permits the condition to become reachable.

Provisional disposition:

**I27 = MODEL-LEVEL RESIDUAL / EMPIRICAL WITNESS NOT ESTABLISHED.**

This is a stronger and more conservative status than calling it a new failure class.

### Effect-boundary conclusion

The real external boundary is now better expressed as:

`authenticate → scope/identity → semantic freshness → provider/resource transition legality → effect knowledge → reconciliation`

A webhook's arrival order is never itself sufficient authority.

### Candidate invariant refinement

Previous INV-EH-16 is narrowed to:

**INV-EH-16 — No arrival-order winner without contract authority.**

If the resource/provider contract supplies authoritative precedence, the system may use that contract. If it does not, arrival order cannot manufacture precedence.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
I27: **model-level residual / empirical witness NOT established**.
W19: **not frozen**.
INCOMPARABLE: epistemic relation / no witness frozen.
CONFLICTING: provisional semantic relation / reconciliation outcome unless a contract proves otherwise.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.852R:** perform the same I27 reduction against executable open-source payment/webhook handlers and distributed workflow implementations, not only provider documentation. Look for code paths where two valid same-resource transitions can reach the protected boundary without version/epoch/status authority. If the code always supplies a local or provider-side winner, record the reduction. If a real reachable unresolved state exists, freeze the smallest witness with exact causal steps.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.852R — EXECUTABLE OPEN-SOURCE CROSS-CHECK OF I27

**Status:** RESEARCHED / CODE-LEVEL CROSS-CHECK / NO IMPLEMENTATION.

### Evidence reviewed

Temporal's current Activity documentation states that Activities may execute multiple times under retries, including after a worker crashes after the external operation succeeds but before completion is recorded; it recommends stable idempotency keys enforced by the downstream service. citeturn0search0 Temporal's own retry documentation likewise distinguishes workflow-observed completion from the possibility of multiple underlying Activity executions. citeturn0search5

Open-source webhook implementations examined show the same pattern at code level. A Stripe-style FastAPI example persists webhook event IDs and rejects/replays duplicates; its transaction boundary and unique event identity prevent duplicate business processing. citeturn0search4 Another open-source payment gateway example uses an event table, row locking, order locking, and a unique ledger reference; concurrent deliveries of the same event are serialized and different events for an already-paid order are guarded by state checks. citeturn0search7 A Resonate example uses the webhook event ID as a durable promise identity so repeated deliveries resolve to the existing workflow rather than execute the payment path again. citeturn0search1turn0search2

### I27 code-level reduction

These implementations provide an important negative result: when the application reaches the protected local boundary, it normally has at least one of the following authorities:

- unique event identity / deduplication;
- row/version locking;
- explicit resource state machine;
- unique ledger constraint;
- durable workflow identity;
- downstream idempotency key.

Therefore the ordinary duplicate/concurrent webhook paths do **not** establish I27. They are covered by existing identity, concurrency, state-transition, or idempotency classes.

### External non-idempotent boundary remains different

Temporal explicitly documents the unresolved case for an external API that is not idempotent and cannot expose authoritative result lookup: exactly-once invocation cannot be guaranteed in the presence of timeouts. citeturn0search10 This is not I27 because the ambiguity is about whether an external effect occurred, not two authenticated incompatible same-resource transitions with unresolved precedence.

This reinforces the existing separation:

`CONFLICTING transition relation != UNKNOWN external-effect knowledge`.

### Attack result

No executable implementation reviewed produced a concrete reachable I27 witness where all of these hold simultaneously:

1. same resource;
2. two authenticated/scoped incompatible transitions;
3. no authoritative sequence/version/epoch or local serialization winner;
4. no authoritative reconciliation/status;
5. protected boundary nevertheless must choose a current state.

Instead, implementations either resolve locally, delegate authority to the resource/provider, or leave the unresolved condition as an error/unknown/reconciliation path.

**Disposition:** I27 remains **MODEL-LEVEL RESIDUAL / EMPIRICAL WITNESS NOT ESTABLISHED**. W19 remains unfrozen.

### Important methodological consequence

We should not manufacture a witness merely because a system can experience ambiguity. A witness requires a reachable causal path plus a distinct protected decision. The current code evidence supports keeping I27 as a guard condition in the model, but not adding it to the empirical witness denominator.

### New reduction rule

For future interaction candidates:

**Candidate → Witness only if:**

`reachable causal sequence`
`AND distinct semantic/protected decision`
`AND not reducible to an existing identity/authority/lifecycle/effect-knowledge witness`
`AND concrete evidence or executable reproduction exists.`

A purely provider-neutral logical possibility remains a **model residual**, not an empirical witness.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: independent candidate / untested.
I26: independent candidate / untested.
I27: **model-level residual / empirical witness NOT established**.
W19: **not frozen**.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.853R:** use executable evidence to attack the remaining acceptance/lifecycle candidates I24–I26 together: provider `IN_PROGRESS` + authority change + cancellation/expiry + delayed completion. Search code/state machines for whether these can collapse into the existing effect-knowledge/recovery/fencing interactions or require a genuinely new ordered witness. Do not add witnesses unless the reduction fails.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.853R — I24/I25/I26 JOINT REDUCTION: IN_PROGRESS × AUTHORITY CHANGE × CANCELLATION/EXPIRY × DELAYED COMPLETION

**Status:** RESEARCHED / JOINT REDUCTION PERFORMED / NO IMPLEMENTATION.

### Fresh evidence

Temporal documents that Activity cancellation is delivered asynchronously through heartbeats and that an Activity may accept or ignore cancellation. It also supports external systems whose final result arrives later through asynchronous completion, Signals, or polling. A retry can therefore coexist with an external process whose final state is not yet known. citeturn0search2turn0search5 Temporal also explicitly warns that non-idempotent Activities can produce duplicate external side effects when a retry occurs after a timeout or worker failure. citeturn0search3turn0search7

Adyen provides a concrete payment analogue: capture is asynchronous; cancellation is asynchronous; a cancel request can return "received" before the later CANCELLATION webhook establishes success/failure; and if capture status is uncertain, Adyen directs the integration toward a reversal/status-aware flow rather than assuming a local result. citeturn0search0turn0search4 Stripe similarly exposes explicit cancelability states and rejects cancellation once the PaymentIntent is no longer in a cancelable state; processing can be cancelable only in rare cases. citeturn0search1turn0search8

### Joint state machine under attack

The combined candidate sequence is:

ACCEPTED_OR_RESERVED / IN_PROGRESS
→ authority changes or cancellation/expiry occurs
→ old operation remains capable of producing a delayed completion
→ retry/reconciliation begins
→ boundary must distinguish stale completion from authoritative current state.

The reduction must keep two dimensions separate:

1. **Authority validity** — is the actor/generation still permitted?
2. **Lifecycle validity** — is the resource still legally completable/capturable?

They can change independently.

### I24 reduction — IN_PROGRESS × retry

I24 remains distinct from I20 because I24 starts with positive provider evidence that processing remains active/pending; I20 starts from epistemic UNKNOWN and waits for later authoritative confirmation.

**Result: KEEP I24.**

### I25 reduction — accepted/reserved × authority change × delayed completion

Compare with I24: I24 has no required authority-generation transition. Compare with I19/I21: neither requires an accepted-but-not-final state followed by an authority transition. Compare with I22: retention expiry is not authority change.

A concrete authority-generation transition can invalidate an old actor while the resource itself still holds an accepted/reserved operation. That creates a protected decision distinct from generic IN_PROGRESS.

**Result: I25 remains an independent ordered interaction candidate.**

### I26 reduction — accepted/reserved × cancellation/expiry × delayed completion

This is not equivalent to I25 because cancellation/expiry can occur without any authority-generation change. The resource lifecycle itself changes the legality of later completion.

Adyen's asynchronous cancellation and Stripe's explicit cancelability state machine show that a request's local acceptance does not itself establish that a later completion remains legal. citeturn0search0turn0search1

**Result: I26 remains an independent ordered interaction candidate.**

### Key reduction result

The three candidates do not collapse into one Boolean IN_PROGRESS state.

They differ by the event that changes the protected decision:

- **I24:** provider says operation is still in progress.
- **I25:** authority validity changes.
- **I26:** resource lifecycle validity changes.

Therefore a single generic UNKNOWN state would lose decision-relevant semantics.

### Minimum legal transition graph — provisional

NOT_ACCEPTED
→ ACCEPTED_OR_RESERVED
→ IN_PROGRESS
→ COMMITTED

From ACCEPTED_OR_RESERVED or IN_PROGRESS, provider-specific transitions may include:

FAILED
EXPIRED/CANCELLED

From COMMITTED:

CORRECTED
REVERSED

A delayed completion after EXPIRED/CANCELLED or after an authority transition must not automatically resurrect COMMITTED; legality depends on the resource/provider contract and freshness evidence.

### Important epistemic rule

A cancellation request being accepted is not the same thing as cancellation having completed. Likewise, an IN_PROGRESS provider status is not equivalent to either CONFIRMED or FAILED.

This preserves:

request outcome ≠ resource lifecycle ≠ effect knowledge ≠ correction state.

### Candidate invariant refinement

**INV-F-08 — Accepted/in-progress evidence must survive later uncertainty.**

**INV-F-09 — Completion after authority/lifecycle transition requires a fresh legality decision.**

**INV-F-10 — Delayed completion cannot resurrect a terminal state without authoritative transition evidence.**

These remain candidates only.

### Witness decision

No new W19/W20/W21 is frozen here. I24–I26 remain interaction candidates requiring concrete causal witnesses or executable reproductions.

This is deliberate: the joint reduction established semantic independence, but **independence alone is not sufficient to inflate the empirical witness denominator**.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: **independent / untested**.
I25: **independent candidate / untested**.
I26: **independent candidate / untested**.
I27: model-level residual / empirical witness NOT established.
W19: not frozen.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.854R:** attack I25/I26 against concrete provider state machines and executable handlers, focusing on the decisive distinction between **authority invalidation** and **resource lifecycle invalidation**. Determine whether either candidate reduces to existing fencing/lifecycle/reconciliation witnesses once exact state predicates are bound, and freeze a witness only if the protected decision remains genuinely new.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.854R — I25/I26 CONCRETE STATE-MACHINE REDUCTION

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### Fresh evidence

Adyen's current capture documentation makes the acceptance/effect distinction explicit: a manual capture request returns status "received", is processed asynchronously, and the final outcome is delivered by CAPTURE/CAPTURE_FAILED webhook. Its cancellation flow likewise returns "received" and later reports the result through CANCELLATION; if capture status is uncertain, Adyen directs the integration toward a reversal/status-aware path. citeturn0search1turn0search3 Adyen also documents EXPIRE as a distinct terminal payment event, and expired authorizations cannot be recaptured. citeturn0search5turn0search9 Stripe's PaymentIntent API similarly makes cancelability a resource-state predicate: cancellation is rejected once the resource is no longer in a cancelable state. citeturn0search0turn0search4

### I25 — authority invalidation

I25 requires:
1. operation accepted/reserved under generation G1;
2. authority changes to G2;
3. delayed G1 completion arrives;
4. the protected boundary must evaluate whether G1 may still commit.

Reduction:
- This is not ordinary IN_PROGRESS: the decisive predicate is authority generation.
- It is not I22: no retention expiry is required.
- It is not ordinary fencing failure: in I25 the old operation may already have been accepted/reserved, so pre-admission fencing alone cannot answer whether the accepted operation may later commit.
- It is not I26: resource lifecycle need not have changed.

**Result: I25 remains semantically independent.**

However, concrete systems frequently turn the situation into a resource-side fencing decision. If the external resource checks G1/G2 atomically at the completion boundary, the stale completion is simply rejected. That means the interaction is real, but a witness is only needed if the accepted/reserved phase leaves a distinct uncertainty that fencing cannot resolve.

**I25 disposition: ADMISSIBLE / INDEPENDENT / UNTESTED.**

### I26 — lifecycle invalidation

I26 requires:
1. operation accepted/reserved;
2. resource enters EXPIRED/CANCELLED;
3. delayed completion arrives;
4. protected boundary evaluates whether completion remains legal.

Adyen provides a concrete lifecycle predicate: after capture, cancellation is unavailable; expired authorization is final and cannot be recaptured. citeturn0search3turn0search9 Stripe similarly rejects cancellation outside the allowed resource states. citeturn0search0

This means lifecycle invalidation can be evaluated directly from authoritative resource state. It is therefore not automatically a new failure witness; it can be a normal guarded state transition.

**I26 disposition: ADMISSIBLE / INDEPENDENT SEMANTIC INTERACTION / EMPIRICAL WITNESS NOT YET ESTABLISHED.**

### Key distinction

G1 invalid = authority predicate

RESOURCE expired/cancelled = lifecycle predicate

external effect unknown = epistemic predicate.

They can coincide, but none implies the others.

### Witness threshold refinement

I25/I26 should become empirical witnesses only if a concrete system demonstrates a reachable window where:
- the old operation has crossed acceptance/reservation;
- the later authority/lifecycle transition does not itself resolve legality;
- a delayed completion remains possible;
- and the system needs a distinct protected decision beyond existing fencing/lifecycle/reconciliation.

If the resource itself atomically rejects the stale completion, record the case as **parameterized coverage**, not a new witness.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: **admissible / independent / untested**.
I26: **admissible / independent semantic interaction / empirical witness NOT established**.
I27: model-level residual / empirical witness NOT established.
W19: not frozen.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.855R:** attack the remaining distinction inside I25: accepted/reserved-before-fencing versus completion-time fencing. Search concrete implementations for a resource that accepts/reserves an operation under G1, changes authority to G2, and then receives delayed G1 completion. Determine whether completion is atomically fenced, reconciled, or left epistemically ambiguous. Do not freeze a witness if the provider contract already resolves the boundary.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.


---
## AB104.855R — I25 ATTACK: ACCEPTED/RESERVED BEFORE FENCING VS COMPLETION-TIME FENCING

**Status:** RESEARCHED / CODE-LEVEL REDUCTION / NO IMPLEMENTATION.

### Fresh evidence

Kafka's current EOS design explicitly fences zombie producers by producer epoch and states that an old producer attempting to make progress is rejected. KIP-447 also describes pending transactions during producer restart/reassignment and uses fencing plus transaction completion/abort rules to prevent stale transactional progress. citeturn0search0 The Kafka protocol exposes INVALID_PRODUCER_EPOCH when a producer attempts an operation with an old epoch, and the producer API documents that an old epoch can be rejected by the partition leader. citeturn0search2turn0search9

EtcFS provides a second executable example: its generation guard is included in the same etcd transaction as the metadata mutation, and the current implementation verifies on real AWS chaos testing that a write after a generation bump is rejected. The generation is intentionally cached from process start so a stale process cannot reread the newly bumped generation and bless itself. citeturn0search1

### I25 attack result

The decisive question was whether a resource can have:
accepted/reserved under G1
→ G2 becomes authoritative
→ delayed G1 completion
while leaving completion legality unresolved.

The concrete systems examined instead place the generation/epoch check at the protected mutation boundary:

stale G1 completion
→ generation/epoch comparison
→ REJECT

That is a direct resolution of the stale-completion decision.

### Important residual

This does **not** prove that every external resource behaves this way. It proves that when a resource participates in generation fencing at its mutation boundary, I25 reduces to an existing fencing mechanism rather than requiring a new witness.

Therefore:

**I25 = PARAMETERIZED COVERAGE under resource-side fencing; empirical witness NOT established.**

### Why acceptance/reservation still matters

Kafka's pending-transaction behavior demonstrates that an accepted/pending state can persist across failure/restart, but the protocol gives the coordinator explicit rules for abort/completion before the next generation proceeds. citeturn0search0 Thus the existence of an accepted/pending state alone does not create I25.

The witness would require a resource contract where acceptance/reservation creates a semantic commitment but completion-time authority is not checked or cannot be reconciled authoritatively.

No such executable case was established in this round.

### Reduction against prior interactions

- I24: pending/in-progress evidence without authority transition. I25 adds authority invalidation; however resource-side fencing absorbs that difference when enforced at the effect boundary.
- I22: retention expiry is different; no retention transition required.
- I26: lifecycle invalidation is different; no cancellation/expiry required.
- I19/I21: correction/reversal and stale historical event are absent.
- W1: generic stale authority retry is broader; I25's accepted/reserved-before-completion phase is an additional temporal condition, but becomes parameterized when the resource's completion boundary enforces fencing.

### Refined disposition

**I25: PARAMETERIZED / NOT A FROZEN EMPIRICAL WITNESS.**

This is a meaningful reduction and should prevent the audit from counting a normal fenced stale-completion path twice.

### Candidate invariant refinement

**INV-F-09 — Authority validity must be evaluated at the protected mutation/effect boundary, not only at admission.**

This remains a candidate until formally verified across the intended resource classes.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: **parameterized coverage / empirical witness NOT established**.
I26: admissible / independent semantic interaction / empirical witness NOT established.
I27: model-level residual / empirical witness NOT established.
W19: not frozen.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.856R:** perform the equivalent reduction for I26: accepted/reserved → lifecycle cancellation/expiry → delayed completion. Search executable provider/resource implementations for whether lifecycle validity is checked atomically at completion, whether cancellation/expiry can race with completion, and whether any remaining ambiguity is genuinely distinct from existing lifecycle/reconciliation witnesses.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.

## AB104.856R — I26 ATTACK: LIFECYCLE INVALIDATION VS DELAYED COMPLETION

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### Fresh evidence

Adyen documents a concrete delayed-capture lifecycle: authorization can remain uncaptured for a configured delay, during which cancellation is possible; manual capture is asynchronous and its final result arrives via CAPTURE/CAPTURE_FAILED webhook. citeturn0search0turn0search2 Adyen's cancellation flow is likewise asynchronous: the cancel request returns a received status and the definitive outcome arrives later through CANCELLATION. If capture status is uncertain, Adyen directs the integration to use reversal/status-aware handling rather than assuming cancellation. citeturn0search3turn0search4 The lifecycle documentation also treats EXPIRE and CANCELLED as distinct resource states. citeturn0search5turn0search12

### Concrete race shape

A real lifecycle window exists: AUTHORIZED/UNCAPTURED -> capture or cancel request -> asynchronous processing -> competing lifecycle transition -> delayed webhook/result.

This proves lifecycle races are reachable, but does not by itself prove a missing protected boundary. The provider exposes typed outcomes and resource references that allow the integration to distinguish capture, capture failure, cancellation, and expiration. citeturn0search2turn0search5

### Reduction

If the resource atomically checks lifecycle before committing capture, EXPIRED/CANCELLED plus delayed capture becomes a lifecycle-predicate rejection. That is parameterized coverage, not a new witness.

Cancellation is also not immediately equivalent to CANCELLED: Adyen returns received and waits for the CANCELLATION webhook. citeturn0search3 Therefore cancel-request accepted is distinct from cancellation completed, but that uncertainty is already represented by effect-knowledge/reconciliation interactions.

Adyen distinguishes CAPTURE_FAILED, CANCELLATION, and EXPIRE; a delayed event can therefore be interpreted against resource lifecycle rather than arrival order. citeturn0search5 No executable provider case was established where all of the following coexist: accepted/reserved state; lifecycle invalidation; delayed completion reaching the effect boundary; no atomic lifecycle check; and no authoritative status/reconciliation.

### Disposition

**I26 = PARAMETERIZED LIFECYCLE COVERAGE / EMPIRICAL WITNESS NOT ESTABLISHED.**

The semantic distinction remains important: I25 changes authority validity, while I26 changes resource lifecycle validity. But neither currently warrants a separate empirical witness.

### Refined invariant

**INV-F-10 — Delayed completion cannot resurrect a terminal lifecycle state without authoritative transition evidence.**

Candidate only; formal verification not performed.

### Combined reduction

I25 and I26 now reduce to the same higher-level protected requirement:

accepted/pending -> boundary-changing predicate -> delayed completion -> completion must re-evaluate authoritative legality.

The predicate differs: I25 = authority generation; I26 = resource lifecycle.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: parameterized coverage / empirical witness NOT established.
I26: parameterized lifecycle coverage / empirical witness NOT established.
I27: model-level residual / empirical witness NOT established.
W19: not frozen.
20 top-level classes: UNFROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.

### Exact next action

**AB104.857R:** attack the remaining independent I24 against provider IN_PROGRESS semantics. Determine whether positive in-progress evidence creates a distinct protected decision beyond UNKNOWN + reconciliation, or whether it too reduces to typed effect-knowledge state plus existing retry/reconciliation witnesses. Search concrete executable/provider semantics; do not add a witness without a distinct protected decision.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**



---
## AB104.856R — I26 REDUCTION: LIFECYCLE INVALIDATION VS DELAYED COMPLETION

**Status:** RESEARCHED / CODE + PROVIDER CROSS-CHECK / NO IMPLEMENTATION.

### Fresh evidence

Adyen documents that cancellation applies only before capture; once captured, cancellation is no longer permitted. It also exposes separate CANCELLATION, CAPTURE, CAPTURE_FAILED and EXPIRE webhook events, so lifecycle transitions are represented explicitly rather than inferred from delivery order. citeturn0search0turn0search1turn0search2 Stripe likewise makes cancellation dependent on the authoritative PaymentIntent state and states that after cancellation additional charges fail; a cancellation request fails if the resource is already non-cancelable. citeturn0search5

Open-source payment implementations show the same local pattern. PayFlow enforces an explicit payment state machine and transactional outbox, while its webhook path uses HMAC validation and inbox deduplication. citeturn0search7 The idempotent-payment-engine uses a unique webhook identity and row locking so concurrent webhook processing cannot independently mutate the same payment state. citeturn0search8 A separate chargeback implementation explicitly records authenticated but illegal state transitions and leaves the current state unchanged rather than allowing an event to force an invalid transition. citeturn0search9

### I26 reduction

I26 sequence:

accepted/reserved
→ lifecycle becomes CANCELLED/EXPIRED
→ delayed completion arrives
→ boundary evaluates whether completion remains legal.

The examined provider/resource contracts generally make lifecycle validity an authoritative state predicate at the mutation boundary.

Therefore, when completion checks the current resource state:

EXPIRED/CANCELLED
→ delayed completion
→ INVALID_TRANSITION / REJECT

I26 is absorbed by ordinary guarded lifecycle transition handling.

### Important residual

I26 is **not universally eliminated**. A provider could expose an asynchronous reservation whose cancellation/expiry is not atomically coupled to completion and whose status cannot be reconciled authoritatively. That would create a distinct effect-knowledge/reconciliation interaction.

However, no concrete executable implementation reviewed in this round established that exact residual.

Thus:

**I26 = PARAMETERIZED COVERAGE / EMPIRICAL WITNESS NOT ESTABLISHED.**

### Reduction against I24/I25

- I24 = positive IN_PROGRESS evidence; no required lifecycle invalidation.
- I25 = authority generation change; no required lifecycle change.
- I26 = resource lifecycle invalidation.
- When the resource's own state machine is authoritative, I26 becomes a normal invalid-transition branch rather than a new failure witness.

### Important semantic distinction retained

Even though I26 reduces operationally in many systems, the model must not collapse:

CANCEL REQUEST ACCEPTED
≠ CANCELLATION COMPLETED

and

EXPIRED
≠ EXTERNAL EFFECT NEVER OCCURRED

The provider's event/evidence contract determines the interpretation.

### Candidate invariant refinement

**INV-F-10 — Delayed completion cannot resurrect a terminal lifecycle state without authoritative legal-transition evidence.**

This is now supported as a cross-provider design invariant candidate, but remains unverified formally.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction / untested.
I24: independent / untested.
I25: **parameterized coverage / empirical witness NOT established**.
I26: **parameterized coverage / empirical witness NOT established**.
I27: model-level residual / empirical witness NOT established.
W19: not frozen.
20 top-level classes: **UNFROZEN**.
Coverage denominator: **NOT FROZEN**.
Formal verification: **NOT PERFORMED**.
Implementation: **NOT STARTED**.

### Exact next action

**AB104.857R:** attack I24 itself. Search executable workflow/provider implementations where the provider explicitly reports IN_PROGRESS while a coordinator retries, cancels, times out, or reconciles. Determine whether positive IN_PROGRESS evidence is genuinely decision-distinct from UNKNOWN/effect ambiguity or whether it can be represented as a typed provider observation under existing reconciliation witnesses. Freeze no new witness unless a distinct protected decision survives reduction.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.


---
## AB104.856R — I26 LIFECYCLE INVALIDATION REDUCTION

Status: RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

Adyen documents delayed/manual capture as asynchronous and cancellation as asynchronous. A cancel request can be acknowledged before the later CANCELLATION webhook; capture can receive CAPTURE and later CAPTURE_FAILED, including cases where the request was already submitted onward. EXPIRE is a distinct final lifecycle state and an expired payment cannot be captured. citeturn0search0turn0search2turn0search6turn0search11

I26 sequence: authorization remains capturable -> delayed/manual capture -> cancellation or expiry -> delayed capture-related evidence -> boundary evaluates the later evidence against authoritative lifecycle state.

Reduction: I26 is distinct from I25 because no authority-generation transition is required; distinct from I24 because IN_PROGRESS alone does not encode a lifecycle transition; distinct from I19/I21 because no correction/reversal or stale pre-correction event is required; distinct from I22 because no idempotency-retention expiry is required.

Critical result: authoritative EXPIRED can resolve later capture legality, so this is parameterized lifecycle fencing rather than automatically a new witness. However, Adyen's CAPTURE success=true is not universally terminal: CAPTURE_FAILED can arrive later. Therefore acceptance/submission evidence must remain distinct from terminal COMMITTED/effect knowledge. citeturn0search0

Disposition: I26 = EMPIRICALLY SUPPORTED SEMANTIC INTERACTION / WITNESS NOT FROZEN. No W19/W20 created. Keep lifecycle validity separate from authority validity and effect knowledge.

Candidate invariants: INV-F-11 terminal lifecycle constrains later completion independently of actor authority; INV-F-12 prior acceptance/submission evidence is not erased when lifecycle becomes terminal. Not formally verified.

Current: I19 independent/untested; I20 independent/untested; I21 distinct ordered/untested; I22 parameterized; I24 independent/untested; I25 parameterized; I26 empirically supported semantic interaction/witness not frozen; I27 model-level residual/witness not established; 20 classes UNFROZEN; denominator NOT FROZEN; formal verification NOT PERFORMED; implementation NOT STARTED.

Exact next action: AB104.857R — attack CAPTURE success=true -> later CAPTURE_FAILED against I19/I20/I24 and the existing external-effect ambiguity class; determine whether the typed effect-state graph fully covers this later correction or a distinct interaction remains.

No deletion/overwrite. No silent witness mutation. No architecture implementation.


---
## AB104.857R — ASYNCHRONOUS CAPTURE SUCCESS → LATER CAPTURE_FAILED REDUCTION

**Status:** RESEARCHED / PROVIDER-CONTRACT CROSS-CHECK / NO IMPLEMENTATION.

Adyen's current capture contract is unusually useful as a semantic witness. A CAPTURE webhook with success=true means the capture request was valid and submitted to the bank/third-party processor; Adyen explicitly states that the scheme can still reject it later, producing CAPTURE_FAILED, potentially days later. citeturn0search0turn0search2

### Reduction

Sequence: CAPTURE(success=true) → external processor still has authority over final capture → later CAPTURE_FAILED → durable local state must interpret the later terminal evidence without erasing the earlier submission evidence.

Against I19: there is a later state change, but this is not merely a local correction/reversal of a previously confirmed effect. The first event explicitly means submitted, not terminal settlement/capture. Therefore treating it as CONFIRMED → CORRECTED would overstate the first evidence.

Against I20: this does not begin at UNKNOWN. The provider gives positive evidence that the request was valid and submitted, followed by a later failure. Therefore UNKNOWN → CONFIRMED does not model it correctly.

Against I24: IN_PROGRESS is insufficient because the later CAPTURE_FAILED is a typed terminal outcome from the provider. I24 is a pending-state interaction, while this sequence contains an explicit terminal transition.

Against the existing external-effect ambiguity class: the ambiguity is narrower. The provider supplies a typed intermediate state (submitted) and later terminal evidence. The key requirement is to preserve the epistemic meaning of the intermediate state rather than promote it to terminal success.

### Result

No new top-level class is justified.

The existing effect-state graph needs a refinement:

ACCEPTED_OR_RESERVED → SUBMITTED_TO_EXTERNAL_PROCESSOR → CONFIRMED / FAILED / CORRECTED / REVERSED

with provider-specific legality.

SUBMITTED_TO_EXTERNAL_PROCESSOR must not be aliased to CONFIRMED, COMMITTED, or UNKNOWN.

The Adyen contract also demonstrates that FAILED can be a later authoritative transition after a positive submission event; therefore our prior generic prohibition on CONFIRMED → FAILED must be read carefully: it applies to a genuinely terminal CONFIRMED state, not to a nonterminal submitted/accepted state.

### New candidate invariant

INV-EF-05 — Intermediate external-submission evidence must not be promoted to terminal effect knowledge.

This is a refinement of the existing epistemic-state model, not yet a verified invariant.

### Witness decision

No W19/W20/W21 is frozen.

This round provides strong provider evidence for a required typed transition, but the causal failure is already representable by the existing external-effect ambiguity/reconciliation family once the intermediate state is modeled correctly.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized.
I24: independent / untested.
I25: parameterized coverage.
I26: empirically supported semantic interaction / witness not frozen.
I27: model-level residual / empirical witness not established.
W19: not frozen.
20 top-level classes: UNFROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.

### Exact next action

AB104.858R: attack the newly exposed intermediate-state distinction against the existing typed effect-state graph and search additional provider/workflow contracts for states equivalent to SUBMITTED_TO_EXTERNAL_PROCESSOR, ACCEPTED, RESERVED, or IN_PROGRESS. Determine whether one universal semantic category is justified or whether these states must remain provider-scoped evidence categories.

No deletion/overwrite. No silent witness mutation. No architecture implementation.


---
## AB104.857R — CAPTURE ACCEPTED/SUBMITTED -> LATER CAPTURE_FAILED: TYPED EFFECT-STATE REDUCTION

Status: RESEARCHED / PROVIDER-CONCRETE / NO IMPLEMENTATION.

Adyen states that manual capture is asynchronous. A CAPTURE webhook with success=true means the request was valid and submitted to the bank/card scheme; it does not mean downstream acceptance is irrevocably complete. CAPTURE_FAILED can arrive later, even days later, if the scheme rejects the capture. citeturn0search0turn0search1 The capture and later failure are tied to the authorization/capture references and the failure is represented in webhook/accounting evidence. citeturn0search0turn0search5

Exact semantic sequence:
REQUESTED -> ACCEPTED_OR_RESERVED/SUBMITTED -> DOWNSTREAM_OUTCOME_PENDING -> FAILED.
The success path may instead continue toward settlement/transfer. ACCEPTED_OR_RESERVED/SUBMITTED is therefore not COMMITTED.

Reduction against I24: I24 captures positive pending evidence, but this sequence additionally has an authoritative typed failure after prior acceptance/submission. I24 alone is insufficient for the complete transition.

Reduction against I20: I20 begins UNKNOWN and later reaches authoritative CONFIRMED. This provider sequence begins with positive acceptance/submission evidence and later reaches FAILED, so the epistemic starting state differs.

Reduction against I19: I19 is CONFIRMED -> CORRECTED/REVERSED -> reconstruction. CAPTURE success=true is not provider-defined as terminal external confirmation, so modeling it as CONFIRMED -> FAILED would be a semantic escalation and is incorrect. citeturn0search0turn0search1

Reduction against the existing external-effect ambiguity class: the broader rule already states that local acceptance/submission is not proof of a terminal external effect. The typed effect-state graph can represent ACCEPTED_OR_RESERVED/IN_PROGRESS -> FAILED without inventing CONFIRMED in the middle.

Important correction: the earlier shorthand CAPTURE success=true -> CAPTURE_FAILED must NOT be modeled as CONFIRMED -> FAILED. The correct interpretation is ACCEPTED_OR_RESERVED/SUBMITTED -> DOWNSTREAM_PENDING -> FAILED.

Candidate invariant INV-TE-05: admission/submission success cannot be promoted to external terminal-effect confirmation unless the provider contract explicitly equates them. Not formally verified.

Witness decision: NO NEW WITNESS. The provider evidence validates the typed-state model and the separation of acceptance, lifecycle, effect knowledge, and reconciliation, but does not establish a distinct top-level failure witness.

Current: I19 independent/untested; I20 independent/untested; I21 distinct ordered/untested; I22 parameterized; I24 independent/untested; I25 parameterized; I26 empirically supported semantic interaction/witness not frozen; I27 model-level residual/witness not established; W19 NOT FROZEN; 20 classes UNFROZEN; denominator NOT FROZEN; formal verification NOT PERFORMED; implementation NOT STARTED.

Exact next action: AB104.858R — attack the corrected transition model against reversal/correction paths and stale webhook delivery: ACCEPTED/SUBMITTED -> FAILED, ACCEPTED/SUBMITTED -> COMMITTED, later CORRECTED/REVERSED, and duplicate/out-of-order delivery. Determine whether one typed state-transition relation plus freshness is sufficient, or whether a new interaction remains when a terminal-looking local projection is contradicted by later provider evidence.

No deletion/overwrite. No silent witness mutation. No architecture implementation.


---
## AB104.858R — TYPED TRANSITIONS + FRESHNESS AGAINST LATE/OUT-OF-ORDER PROVIDER EVIDENCE

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### Evidence
Adyen documents CAPTURE and CAPTURE_FAILED as distinct webhook events. A CAPTURE success=true means submission to the downstream scheme, while CAPTURE_FAILED may arrive later if the scheme rejects it. Adyen also identifies each request with a PSP reference and exposes event dates and failure reasons. citeturn0search1turn0search9 Microsoft event-sourcing guidance treats the event stream as ordered history, recommends immutable append-only history, sequence identifiers, idempotent consumers, and reconciliation when events affecting the same entity interact. Microsoft Fabric likewise states that at-least-once delivery can duplicate events and does not guarantee arrival order. citeturn0search0turn0search2

### Transition attack
The relevant legal transitions remain:

ACCEPTED/SUBMITTED -> FAILED
ACCEPTED/SUBMITTED -> COMMITTED
COMMITTED -> CORRECTED/REVERSED

The incoming event must additionally be classified by semantic freshness:
NEWER / EQUAL-DUPLICATE / OLDER / INCOMPARABLE.

A late CAPTURE_FAILED after an older ACCEPTED/SUBMITTED projection must not be treated as a generic duplicate. Conversely, a late older CAPTURE/SUBMITTED event must not resurrect a later terminal state. The event history remains immutable; the current projection follows the contract's semantic ordering/freshness relation. citeturn0search0

### Reduction results

**ACCEPTED/SUBMITTED -> FAILED:** already representable in the typed state graph. No new witness.

**ACCEPTED/SUBMITTED -> COMMITTED:** also representable as a provider-specific legal transition; no new witness.

**COMMITTED -> CORRECTED/REVERSED:** already represented by I19's correction/reversal family, subject to provider-specific evidence.

**Late duplicate/out-of-order delivery:** covered by freshness + idempotent-consumer semantics when the provider/resource supplies enough ordering or identity evidence. Microsoft explicitly recommends sequence tracking/idempotency because delivery order is not guaranteed. citeturn0search0turn0search2

### Important boundary
Freshness alone is not enough when the provider gives no authoritative ordering relation. If two authenticated events are INCOMPARABLE, the system must not invent a total order. It preserves evidence and enters the existing reconciliation/UNKNOWN path unless the provider contract supplies a stronger state predicate.

### New attack: terminal-looking local projection
Consider:
local projection = COMMITTED
then a later authoritative provider event says FAILED or REVERSED.

The correct question is not whether local state may simply be overwritten. The event history must preserve the earlier observation, and the provider contract determines whether the later event is a correction/reversal, a distinct lifecycle transition, or evidence that the earlier local projection was overconfident. Microsoft event sourcing explicitly warns that rewriting historical events breaks the audit trail. citeturn0search0

### Decision
No new witness is frozen. The combined mechanism needed is:
1. typed transition legality;
2. semantic freshness relation scoped to resource/namespace/incarnation;
3. immutable evidence history;
4. idempotent duplicate handling;
5. reconciliation when ordering/effect knowledge is insufficient.

This is a **model sufficiency result**, not a formal proof. It also does not prove that every provider exposes sufficient freshness evidence.

### Current disposition
I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction.
I24: independent / untested.
I25: parameterized coverage.
I26: empirically supported semantic interaction / witness not frozen.
I27: model-level residual / empirical witness NOT established.
W19: NOT FROZEN.
20 top-level classes: UNFROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.

### Exact next action
**AB104.859R:** attack the unresolved case: two authenticated same-resource terminal events that are both semantically valid but lack a provider ordering relation. Determine whether this is genuinely a new CONFLICTING interaction or reducible to INCOMPARABLE + reconciliation, using concrete event schemas/implementations rather than hypothetical Boolean combinations.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.859R — CONFLICTING VS INCOMPARABLE: CONCRETE EVENT-ORDER ATTACK

**Status:** RESEARCHED / REDUCTION PERFORMED / NO IMPLEMENTATION.

### Fresh evidence

Adyen's webhook guidance says events can arrive as duplicates and recommends chronological processing using event timestamps; some webhook families additionally expose sequenceNumber. For transfer webhooks, sequenceNumber increases per transfer and is specifically intended to restore order when events arrive out of order. citeturn0search0turn0search1 Microsoft event-sourcing guidance similarly treats the event stream as the source of truth, uses optimistic concurrency to reject conflicting appends, and says conflicts spanning multiple entities require reconciliation. citeturn0search2 Microsoft Fabric explicitly states at-least-once delivery and no guaranteed arrival order. citeturn0search3

### Attack target

Candidate relation:
CONFLICTING = two authenticated, correctly scoped observations for the same resource that the domain contract says cannot both be the current state, while no precedence relation is available.

The question is whether this is more than:
INCOMPARABLE + reconciliation.

### Concrete reduction

1. **Same event identity / duplicate:** not CONFLICTING. Adyen duplicates can share eventCode + pspReference; they are one semantic event delivered more than once. citeturn0search0
2. **Different events with provider sequence:** not unresolved CONFLICTING. SequenceNumber provides an ordering relation within the declared transfer domain. citeturn0search1
3. **Concurrent writes in an event store:** optimistic concurrency can reject one append and force reload/retry. This is a concrete conflict, but the store has an authority mechanism that resolves it before an unresolved current-state decision. citeturn0search2
4. **Cross-entity conflict:** Microsoft explicitly identifies cases where event streams for different entities interact and require reconciliation. This is a real conflict family, but it is not necessarily same-resource CONFLICTING because there may be no single resource state whose events are mutually exclusive. citeturn0search2
5. **Two authenticated same-resource terminal events with no ordering:** the reviewed concrete provider/event-store evidence did not establish such an unresolved production witness. Where ordering exists, it resolves the conflict; where concurrency exists, the store commonly rejects/serializes the competing append.

### Decision

The relation **CONFLICTING remains a valid model-level predicate**, but the empirical attack did not establish a distinct witness requiring a new top-level failure class.

For the current bounded audit, treat:
`CONFLICTING + no precedence`
→ `INCOMPARABLE + reconciliation`
unless a provider/resource contract explicitly defines an incompatibility that changes the protected decision independently of reconciliation.

This is a conservative reduction: it avoids inventing a new witness from a logically possible but empirically unestablished state.

### Important distinction preserved

CONFLICTING is not deleted from the model vocabulary. It is retained as a **derived semantic predicate** that can annotate an INCOMPARABLE situation when the domain contract proves mutual incompatibility. It does not currently justify a new witness or top-level class.

### Invariant candidate

**INV-EH-10R — An unresolved conflict without authoritative precedence must not be converted into an invented total order; preserve both observations and route through reconciliation/hold semantics.**

Candidate only; no formal verification.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct ordered interaction / untested.
I22: parameterized interaction.
I24: independent / untested.
I25: parameterized coverage.
I26: empirically supported semantic interaction / witness not frozen.
I27: model-level residual / empirical witness NOT established.
CONFLICTING: **derived semantic predicate; no independent witness**.
W19: NOT FROZEN.
20 top-level classes: UNFROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.

### Exact next action

**AB104.860R:** perform a closure audit of the entire typed effect-state graph and freshness relation. Enumerate every currently admitted transition and every forbidden generic transition, then cross-check each against I19-I27 and the 20-class taxonomy. The goal is to detect any missing legal transition or unsafe implicit transition before adding further interaction candidates.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.859R — CONFLICTING VS INCOMPARABLE: CONCRETE SAME-RESOURCE EVENTS

Status: RESEARCHED / MODEL REDUCTION / NO IMPLEMENTATION.

Fresh evidence: Adyen webhook events are scoped to payment references and event types; CAPTURE, CAPTURE_FAILED, CANCELLATION, EXPIRE, REFUND and reversal-related events are distinct semantic transitions. Adyen also documents duplicate delivery, timestamps, and sequenceNumber where available; duplicate events can share eventCode+pspReference. citeturn0search0turn0search4 Microsoft event sourcing defines an entity event stream as an ordered history and uses optimistic concurrency to reject conflicting appends; it also states that conflicts spanning entities require explicit reconciliation. citeturn0search2 Lamport's ordering result is the fundamental constraint: distributed events have a causal partial order, not an invariant total order. citeturn0search1

### Attack

Candidate case:
A and B are both authenticated and scoped to the same resource. Both are individually legal event types, but the provider gives no sequence/causal relation between them and the resulting states cannot both be current under the resource contract.

Reduction test:
- If no incompatibility is established, the state is simply INCOMPARABLE: preserve both evidence items and reconcile/hold.
- If the contract establishes mutual incompatibility but gives no precedence, the relation is genuinely CONFLICTING: the system knows that both cannot represent the current state, but it must not invent which one happened last.
- If a provider sequence, causal reference, or authoritative resource read establishes precedence, the relation reduces to NEWER/OLDER and is no longer CONFLICTING.
- If the two events have identical semantic identity, they reduce to EQUAL/DUPLICATE.

### Concrete provider check

Adyen's webhook model provides enough event typing to make incompatibility realistic, but its current documentation also supplies timestamps/sequence information for ordering where available. The documentation therefore demonstrates the existence of distinct same-resource transitions, but does NOT establish a production incident where two authenticated incompatible terminal events remained permanently unordered. We must not promote that documentation example into an empirical failure witness. citeturn0search0turn0search4

### Decision

CONFLICTING remains a **valid semantic relation**, but its empirical witness remains unestablished. It cannot be collapsed universally into INCOMPARABLE because conflict adds the independent predicate “cannot both be current.” It also cannot be promoted to a witness merely because such a state is logically possible.

Therefore:
- CONFLICTING = model relation / untested.
- I27 = model-level residual / empirical witness not established.
- W19 = not frozen.

### Important refinement

The protected decision does not have to be “choose A or B.” A safe system may preserve both events and enter reconciliation/hold. Thus CONFLICTING is only a distinct interaction when the system's contract must make a decision that differs from ordinary INCOMPARABLE handling—e.g., reject one transition, halt projection, or require authoritative external resolution because mutual incompatibility is known.

This prevents another class of overcounting: a semantic relation is not automatically a failure witness.

### Candidate invariants

INV-EH-10 — conflict requires contract-level incompatibility.
INV-EH-11 — conflict does not justify invented precedence.
INV-EH-12 — conflict preserves all authenticated evidence.

Not formally verified.

### Current disposition

I19 independent/untested; I20 independent/untested; I21 distinct ordered/untested; I22 parameterized; I24 independent/untested; I25 parameterized; I26 empirically supported semantic interaction/witness not frozen; I27 model-level residual/witness not established; W19 NOT FROZEN; 20 classes UNFROZEN; denominator NOT FROZEN; formal verification NOT PERFORMED; implementation NOT STARTED.

### Exact next action

AB104.860R: search concrete executable systems/tests for an actual same-resource CONFLICTING condition with authenticated inputs and absent/insufficient ordering, then attack the minimum decision difference between CONFLICTING and ordinary INCOMPARABLE+reconciliation. Do not freeze a witness from documentation alone.

No deletion/overwrite. No silent witness mutation. No architecture implementation.

---
## AB104.860R — CIERRE DEL TYPED EFFECT-STATE GRAPH Y FRESHNESS

**Status:** RESEARCHED / GRAPH CLOSURE AUDIT / NO IMPLEMENTATION / NO FORMAL VERIFICATION.

### Fresh evidence cross-check

Microsoft's current Event Sourcing guidance treats each entity's event stream as an ordered history, keeps events immutable, uses compensating events for correction, and states that optimistic concurrency can reject conflicting appends. It also warns that consumer delivery is typically at-least-once, requiring idempotent handlers, and that eventual consistency/reconciliation remains necessary. citeturn0search0 Adyen's current webhook guidance distinguishes duplicate delivery from chronological processing and documents sequenceNumber for webhook families where ordering can be reconstructed. citeturn0search3turn0search4

### 1. Current typed effect-state graph

The audit normalizes the effect/attempt lifecycle into these semantic states:

- NOT_ACCEPTED
- ACCEPTED_OR_RESERVED
- SUBMITTED
- IN_PROGRESS
- COMMITTED
- FAILED
- EXPIRED
- CANCELLED
- CORRECTED
- REVERSED
- UNKNOWN

These are **not asserted to be a universal provider enum**. They are audit vocabulary used to separate admission, downstream processing, terminal knowledge, lifecycle invalidation, and correction.

### 2. Admitted transitions

The following transitions are currently admitted when the relevant resource/provider contract permits them:

NOT_ACCEPTED → ACCEPTED_OR_RESERVED

ACCEPTED_OR_RESERVED → SUBMITTED

ACCEPTED_OR_RESERVED → IN_PROGRESS

ACCEPTED_OR_RESERVED → FAILED

ACCEPTED_OR_RESERVED → EXPIRED

ACCEPTED_OR_RESERVED → CANCELLED

SUBMITTED → IN_PROGRESS

SUBMITTED → COMMITTED

SUBMITTED → FAILED

SUBMITTED → EXPIRED/CANCELLED when the provider/resource contract permits that lifecycle.

IN_PROGRESS → COMMITTED

IN_PROGRESS → FAILED

IN_PROGRESS → EXPIRED/CANCELLED when contractually permitted.

COMMITTED → CORRECTED

COMMITTED → REVERSED

UNKNOWN → CONFIRMED is represented by resolving the epistemic uncertainty to an authoritative effect state; in the normalized graph this means UNKNOWN → COMMITTED only when the external contract establishes committed effect.

UNKNOWN → FAILED is likewise allowed only when authoritative evidence establishes failure.

The graph therefore does **not** treat UNKNOWN as an ordinary business lifecycle state. It represents missing/ambiguous knowledge.

### 3. Generic transitions that remain forbidden

The following are not admitted generically:

- FAILED → COMMITTED
- EXPIRED → COMMITTED
- CANCELLED → COMMITTED
- REVERSED → COMMITTED
- CORRECTED → COMMITTED without a new typed transition establishing a later effect
- UNKNOWN → retry as an automatic inference that the previous attempt had no effect
- ACCEPTED_OR_RESERVED → COMMITTED as proof that an external terminal effect already occurred
- SUBMITTED → COMMITTED when the provider only defines submission acceptance and later terminal confirmation
- an OLDER event overwriting a newer authoritative state
- INCOMPARABLE observations being arbitrarily converted into a total order
- a duplicate event being interpreted as a second business effect merely because it was delivered twice.

These prohibitions are semantic guards, not implementation claims.

### 4. Freshness relation closure

The current freshness domain is:

NEWER
EQUAL/DUPLICATE
OLDER
INCOMPARABLE

with CONFLICTING retained as a derived predicate when a contract proves that two observations are mutually incompatible but supplies no precedence.

Reduction rules:

- same semantic identity → EQUAL/DUPLICATE
- scoped sequence/version establishes precedence → NEWER/OLDER
- no valid ordering relation → INCOMPARABLE
- INCOMPARABLE + proven mutual incompatibility → annotate CONFLICTING
- CONFLICTING does not authorize an invented winner.

Adyen's transfer webhook sequenceNumber is explicitly scoped to a specific transfer and can restore event order; this confirms that freshness metadata is domain-scoped rather than a universal ordering oracle. citeturn0search4

### 5. Cross-check against I19–I27

**I19 — confirmed effect + correction/reversal + reconstruction:** still independent candidate. It is not reproduced by ordinary COMMITTED → CORRECTED/REVERSED alone; the interaction requires the reconstruction/evidence dimension.

**I20 — UNKNOWN + later authoritative confirmation + retry:** still independent candidate. The essential distinction is epistemic uncertainty followed by authoritative resolution; it cannot be replaced with an ordinary lifecycle transition.

**I21 — correction/reversal + stale duplicate pre-correction evidence + reconciliation:** remains distinct because freshness and correction interact. No witness frozen.

**I22 — idempotency expiry + retry + possible second effect:** parameterized coverage, not a new universal state transition.

**I23 — same key + different parameters:** remains absorbed by identity/payload binding; no separate witness frozen.

**I24 — provider IN_PROGRESS + coordinator retry:** independent from UNKNOWN; positive pending knowledge is not epistemic absence of knowledge.

**I25 — accepted/reserved + authority generation change + delayed completion:** parameterized by resource-side fencing. Kafka producer epochs and EtcFS generation guards are evidence that resource-side fencing can reject stale generations at protected mutation boundaries; this does not constitute a universal external-effect proof.

**I26 — accepted/reserved + lifecycle cancellation/expiry + delayed completion:** empirically supported semantic interaction, but still no new witness frozen. Provider lifecycle rules can independently constrain later completion.

**I27 — same-resource authenticated incompatible observations without authoritative order:** remains model-level residual. The closure audit finds no missing transition that forces I27 to become a distinct witness; ordinary safe handling can remain preservation + reconciliation/hold.

### 6. 20-class taxonomy cross-check

The closure audit does **not** justify adding a new top-level class.

The existing 20 working classes still cover the semantic dimensions encountered here:

1. operation identity collision
2. payload-binding conflict
3. duplicate delivery/retry
4. acknowledgement ambiguity
5. transaction isolation anomaly
6. commit/apply separation
7. stale observation/order
8. state-machine transition race
9. authority-generation/fencing race
10. worker ownership/rebalance race
11. external-effect ambiguity
12. reconciliation consistency/retention
13. ledger conservation/multi-account invariant
14. correction/reversal
15. idempotency retention/reuse
16. broker/workflow liveness and poison-message behavior
17. recovery/restart continuity
18. namespace/incarnation confusion
19. authentication/source-validity failure
20. cross-domain atomicity boundary

**Important:** this is a semantic coverage statement, not a proof of completeness. Pairwise/higher-order completeness and denominator remain unfrozen.

### 7. Closure findings

No missing **generic legal transition** was identified that requires a new state family.

The more important result is negative:

UNKNOWN must remain epistemic.

INCOMPARABLE must remain non-ordering.

CONFLICTING must not become an implicit winner-selection mechanism.

ACCEPTED/SUBMITTED must not silently become COMMITTED.

CORRECTED/REVERSED must remain explicit historical transitions rather than mutation of the original evidence. Microsoft's event-sourcing guidance independently supports immutable event history plus compensating events for corrections. citeturn0search0

### Current disposition

- I19: independent / untested
- I20: independent / untested
- I21: distinct / untested
- I22: parameterized
- I23: absorbed / no independent witness
- I24: independent / untested
- I25: parameterized coverage
- I26: empirically supported semantic interaction / witness not frozen
- I27: model-level residual / empirical witness not established
- CONFLICTING: derived predicate / no independent witness
- 20 top-level classes: **UNFROZEN**
- Coverage denominator: **NOT FROZEN**
- Formal verification: **NOT PERFORMED**
- Implementation: **NOT STARTED**
- Architecture freeze: **NOT DECLARED**

### Exact next action

**AB104.861R:** attack the boundary between SUBMITTED/IN_PROGRESS and COMMITTED/FAILED, specifically whether any provider or executable implementation can produce a legally reachable transition where local admission/submission succeeds, downstream terminal outcome is later corrected/reversed, and a stale terminal observation races reconciliation. The objective is to determine whether this is already fully represented by I19/I20/I24/I26 or exposes a genuinely missing interaction.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**


---
## AB104.861R — SUBMITTED/IN_PROGRESS → TERMINAL → CORRECTION/RECONCILIATION

**Status:** RESEARCHED / CONCRETE PROVIDER WITNESS FOUND / NO IMPLEMENTATION / NO FORMAL VERIFICATION.

### Fresh evidence

Adyen's current capture documentation gives a concrete asynchronous lifecycle: a valid CAPTURE webhook with success=true means the capture request was valid and submitted to the bank/card scheme, but the scheme can still reject it later and emit CAPTURE_FAILED, even days after submission. Adyen also exposes separate CANCELLATION and EXPIRE lifecycle vocabulary. citeturn0search0turn0search2

Stripe's PaymentIntent model independently documents a multi-status payment lifecycle and one successful charge per PaymentIntent, reinforcing that an attempt/status is not equivalent to an arbitrary local terminal projection. citeturn0search8

### Concrete reachable sequence

The Adyen evidence establishes:

capture request → CAPTURE success=true → request submitted downstream → later CAPTURE_FAILED

The critical point is that the first positive event is not terminal external confirmation. Adyen explicitly states that a capture can fail after the successful CAPTURE webhook and that the failure can occur days later. citeturn0search0

Therefore the audit graph must preserve:

SUBMITTED / downstream pending → FAILED

without treating this as an illegal COMMITTED → FAILED transition.

### Attack against I19/I20/I24/I26

**I24 (IN_PROGRESS + retry):** insufficient. The Adyen sequence contains positive submission knowledge, not merely provider-reported pending status.

**I26 (lifecycle cancellation/expiry + delayed completion):** insufficient. This witness is not primarily cancellation/expiry; the decisive transition is downstream rejection after accepted submission.

**I20 (UNKNOWN + later authoritative confirmation):** insufficient. The initial state is not UNKNOWN; the system has authoritative evidence that the request was accepted/submitted.

**I19 (confirmed effect + correction/reversal):** insufficient for the exact first transition. Adyen's CAPTURE success=true does not establish committed external effect, so the later CAPTURE_FAILED is not a correction of a confirmed effect. It is a downstream terminal outcome following accepted/submitted work.

### Resulting refinement

The previously broad category SUBMITTED → FAILED is now empirically anchored.

But the deeper interaction is:

ACCEPTED/SUBMITTED + positive admission/submission evidence + later downstream terminal rejection + possible local stale projection/reconciliation race

This is a distinct semantic interaction candidate, but it does not yet justify a new top-level failure class because the existing classes already cover commit/apply separation, external-effect ambiguity, stale observation/order, reconciliation consistency, and correction/reversal when correction actually occurs.

### Important correction to earlier shorthand

Do not model COMMITTED → FAILED for this Adyen case.

The accurate provider path is:

ACCEPTED/SUBMITTED → downstream pending → FAILED

Adyen explicitly distinguishes the successful submission from later scheme rejection. citeturn0search0

### Reconciliation race

A local coordinator could receive the positive CAPTURE event, project a business state, then receive CAPTURE_FAILED later. The provider evidence proves the temporal possibility, but it does not by itself prove a particular buggy implementation that incorrectly retains the earlier state.

Therefore:
- semantic witness: YES
- concrete provider evidence: YES
- concrete vulnerable implementation: NOT ESTABLISHED
- new top-level class: NO
- new frozen witness W20: NO

### New invariant candidates

**INV-TE-06:** Positive admission/submission evidence must not be promoted to terminal external-effect confirmation unless the provider contract explicitly equates the two.

**INV-TE-07:** A later authoritative downstream rejection must be representable as a terminal transition from the accepted/submitted/pending lifecycle without rewriting the original admission evidence.

Candidates only; no formal verification.

### Current disposition

I19: independent / untested.
I20: independent / untested.
I21: distinct / untested.
I22: parameterized.
I23: absorbed.
I24: independent / untested.
I25: parameterized coverage.
I26: empirically supported semantic interaction / witness not frozen.
I27: model-level residual / empirical witness not established.
SUBMITTED→FAILED: empirically supported legal transition.
W20: NOT FROZEN.
20 top-level classes: UNFROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture freeze: NOT DECLARED.

### Exact next action

**AB104.862R:** attack the complementary path SUBMITTED/IN_PROGRESS → COMMITTED → later correction/reversal, using concrete provider lifecycle evidence. Determine whether the positive terminal state plus later correction is fully captured by I19, or whether asynchronous submission, terminal confirmation, correction, and stale pre-correction evidence create a distinct interaction.

**No deletion/overwrite. No silent witness mutation. No architecture implementation.**