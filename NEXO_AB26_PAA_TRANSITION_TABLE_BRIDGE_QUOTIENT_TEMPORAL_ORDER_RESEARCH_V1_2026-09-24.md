# NEXO AB26 — P_AA COMPLETE TRANSITION TABLE, BRIDGE QUOTIENT ATTACK, TEMPORAL GRANULARITY, AND BEHAVIORAL EQUIVALENCE RESEARCH V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. External methodology cross-check

Lamport's official material states that history variables record past behavior and can be needed to construct a refinement mapping; implementation/refinement is expressed as implication under a mapping. His material also distinguishes stuttering variables and shows that refinement is behavioral rather than simple field equality. These points directly constrain the P_AA quotient and history minimization. See the official Auxiliary Variables in TLA+ material. 

## 2. Complete abstract transition contract

Every action is represented as:

A = <Pre, Post, Frame, Invalidation, HistorySupport, AdmissionLink>

A transition is admissible only when all six dimensions are satisfied.

AuthorityIssue:
Pre: permitted issuer and valid issuance conditions.
Post: new authority issuance exists.
Frame: unrelated authority contexts unchanged.
Invalidation: none automatically.
HistorySupport: issuance position retained.
AdmissionLink: none.

AuthorityRevoke:
Pre: target authority exists.
Post: target no longer current-valid.
Frame: issuance history retained.
Invalidation: dependent authority/bridge validity changes.
HistorySupport: revocation event retained.
AdmissionLink: existing admission records unchanged.

EpochAdvance:
Pre: epoch transition permitted.
Post: current epoch advances.
Frame: unrelated contexts unchanged.
Invalidation: old epoch-bound contexts may become stale.
HistorySupport: epoch transition retained.
AdmissionLink: historical admission links unchanged.

DelegationChange:
Pre: delegation state transition permitted.
Post: delegation relation changes.
Frame: unrelated delegations unchanged.
Invalidation: dependent authority/bridge validity recomputed.
HistorySupport: delegation transition retained when needed.
AdmissionLink: prior admission links unchanged.

PolicyChange:
Pre: policy transition permitted.
Post: current policy context changes.
Frame: unrelated policy contexts unchanged.
Invalidation: affected compatibility relations recomputed.
HistorySupport: compatibility-relevant transition retained.
AdmissionLink: prior links unchanged.

ResourceReincarnate:
Pre: reincarnation permitted.
Post: resource incarnation changes.
Frame: unrelated resources unchanged.
Invalidation: all old-incarnation bindings/leases become incompatible.
HistorySupport: incarnation boundary retained.
AdmissionLink: historical admissions remain historically linked.

LeaseIssue:
Pre: valid authority; complete binding; LEASE protocol; issuance permitted.
Post: bound lease exists.
Frame: unrelated leases unchanged.
Invalidation: none to authority.
HistorySupport: issuance and validity interval retained.
AdmissionLink: future admission may reference this lease.

LeaseExpire:
Pre: lease exists.
Post: lease no longer valid.
Frame: authority unchanged.
Invalidation: lease-based admission validity changes.
HistorySupport: expiry position retained.
AdmissionLink: existing admissions unchanged.

CreateAttempt:
Pre: operation permits attempt creation.
Post: fresh attempt identity exists.
Frame: prior attempts unchanged.
Invalidation: none to authority.
HistorySupport: attempt creation retained.
AdmissionLink: future admission must bind to this attempt.

RetryAttempt:
Pre: retry permitted.
Post: new attempt OR explicitly same attempt according to protocol.
Frame: prior attempt identity retained.
Invalidation: prior bridge cannot transfer implicitly.
HistorySupport: retry relation retained.
AdmissionLink: new admission must explicitly bind.

Decide:
Pre: decision inputs available.
Post: decision record exists.
Frame: authority remains independent.
Invalidation: none automatically.
HistorySupport: decision reference retained.
AdmissionLink: decision does not itself establish admission linkage.

Admit:
Pre: actual admission linkage exists; selected protocol valid; all P_AA predicates hold for the linked context.
Post: admission record exists.
Frame: unrelated state unchanged.
Invalidation: none to historical validity.
HistorySupport: admission linkage and position retained.
AdmissionLink: creates the authoritative admission linkage used by P_AA.

Abort:
Pre: abort permitted.
Post: internal admission state aborted.
Frame: external-world semantics unchanged.
Invalidation: internal pending state may close.
HistorySupport: abort retained where relevant.
AdmissionLink: does not erase prior admission linkage.

Stutter:
Pre: no P_AA-relevant change.
Post: AA_Norm and required support unchanged.
Frame: all P_AA-relevant semantics unchanged.
Invalidation: none.
HistorySupport: no relevant distinction lost.
AdmissionLink: unchanged.

## 3. Historical admission links are immutable facts

A later revocation does not rewrite an earlier UsedAdmissionContext.

Thus:

historical linkage != current validity.

This preserves:
WasAuthorized/WasBound at admission
versus
CurrentlyAuthorized/CurrentlyBound now.

## 4. LeaseBridge versus AdmissionBindingClass

They cannot be merged merely because both contain similar fields.

AdmissionBindingClass answers:
Which relational admission tuple is this?

LeaseBridge answers:
Which protocol mechanism carries the authorization facts safely from issuance/decision to admission?

A quotient may merge them only if, under every allowed future continuation, replacing both with one representation preserves:
- admission linkage;
- authority binding;
- freshness;
- replay state;
- invalidation behavior;
- protocol semantics;
- temporal behavior.

Without that result, keep them semantically distinct even if structurally packed.

## 5. New bridge-quotient countermodels

CM-AA137 — class equality, lease difference: same AdmissionBindingClass but one lease expired.

CM-AA138 — lease equality, class difference: same lease fields but different admitted attempt.

CM-AA139 — replay difference: same current lease/class fields, different prior consumption history.

CM-AA140 — authority substitution: same class tuple but lease points to different authority context.

CM-AA141 — incarnation substitution: same class and fresh lease syntax, different resource generation.

CM-AA142 — policy invalidation: same class and lease syntax, current policy differs.

CM-AA143 — delegation invalidation: same class and lease syntax, delegation chain differs.

CM-AA144 — temporal bridge split: same current fields, different issuance/admission order.

CM-AA145 — protocol-class alias: same structural fields but ATOMIC versus LEASE semantics differ.

CM-AA146 — boundary alias: same fields except boundary semantics differ.

Conclusion: no safe merger is established.

## 6. Temporal granularity attack

Three positions are insufficient as a general theorem.

Example:
t1 = lease issued
t2 = policy changes
t3 = delegation changes
t4 = resource reincarnates
t5 = admission

Different permutations of t2/t3/t4 can produce different validity results even if the final state is identical.

Therefore a finite temporal-position model must either:
A. encode every P_AA-relevant ordering explicitly;
B. use an ordered event/history structure;
C. prove that omitted order cannot affect P_AA.

The current three-position proposal remains a bounded test hypothesis only.

## 7. Ordering as a semantic dimension

Candidate event identity contains operation, attempt, event type, sequence/order information, resource incarnation, authority epoch, and protocol context.

The semantic requirement is preservation of every order relation whose reversal can change P_AA.

Therefore:
ORDER_RELEVANT_TO_PAA != INTEGER_TIMESTAMP_REQUIRED.

A logical partial order may be sufficient if total timestamps are unnecessary.

## 8. Behavioral equivalence

Candidate exact quotient:

h1 ≈_PAA h2 iff:
1. both satisfy the same model/threat/boundary assumptions;
2. their current abstract semantic contexts are equivalent;
3. their actual admission linkage is equivalent for all existing admissions;
4. their retained history supports the same P_AA-relevant distinctions;
5. for every allowed future environment trace C, the resulting sequence of P_AA admission assessments is equivalent;
6. if correspondence cannot be established, equivalence is not asserted.

This is stronger than same current state, same field tuple, same event count, or same lease ID.

## 9. Trace equivalence versus claim equivalence

We do not necessarily need identical future traces.

The target is claim-relative equivalence:
Different internal histories may be equivalent if all future P_AA-relevant observations/decisions are identical.

TRACE_EQUALITY is stronger than required.
PAA_BEHAVIORAL_EQUIVALENCE is the target.

## 10. Hidden-history quotient attacks

CM-AA147 — hidden replay history.
CM-AA148 — hidden revocation history.
CM-AA149 — hidden policy compatibility transition.
CM-AA150 — hidden delegation transition.
CM-AA151 — hidden incarnation boundary.
CM-AA152 — hidden retry relation.
CM-AA153 — hidden admission linkage.
CM-AA154 — hidden event ordering.

Each asks whether two histories collapse to the same candidate quotient but later produce different P_AA.

Any positive split blocks that quotient.

## 11. Concrete-to-abstract transition coverage

For every concrete transition:
- if P_AA consequences change, map to non-stuttering abstract behavior;
- if only irrelevant implementation detail changes, stuttering is permitted;
- if mapping cannot determine relevance, return UNKNOWN/PENDING rather than silently stutter;
- no concrete transition may create abstract authority not present concretely.

This is the current transition refinement contract.

## 12. Finite model implication

The candidate two-valued identity domains remain useful for exposing substitution attacks.

However, temporal cardinality should not yet be frozen at 3.

A stronger finite test can use bounded event sequences over:
AuthorityRevoke
PolicyChange
DelegationChange
ResourceReincarnate
LeaseExpire
Admit

and enumerate relevant permutations.

This remains bounded semantic exploration, not a completeness proof.

## 13. AB26 result

Completed:
- full abstract action contract;
- cross-component invalidation rules;
- immutable historical admission linkage;
- direct attack on LeaseBridge/AdmissionBindingClass merger;
- temporal granularity attack;
- claim-relative behavioral quotient.

New conclusion:
AdmissionBindingClass and LeaseBridge must remain semantically distinct until a future-behavioral quotient proves they can be merged.

New conclusion:
Three temporal positions cannot be treated as generally sufficient.

The next formal target is therefore an event-order representation rather than prematurely fixing three temporal states.

## 14. AB27 frontier

1. Build the minimal P_AA-relevant event-order structure.
2. Derive order-equivalence classes rather than raw timestamps.
3. Attack event-order compression.
4. Re-test AA_Norm with LeaseBridge and AdmissionBindingClass explicitly separated.
5. Derive a claim-relative bisimulation/refinement obligation.
6. Only after those survive, draft the first TLA+ specification.
