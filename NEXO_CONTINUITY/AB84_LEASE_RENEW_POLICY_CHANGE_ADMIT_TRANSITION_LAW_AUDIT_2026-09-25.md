# AB84 — LEASE_RENEW + POLICY_CHANGE + ADMIT transition-law audit — 2026-09-25

Status: RESEARCH ONLY. No implementation change, semantic freeze, TLC/TLAPS execution, or formal verification.

## Objective

Continue AB83 by auditing the second smallest high-value ternary attack selected by AB82:

LEASE_RENEW + POLICY_CHANGE + ADMIT.

The question is whether recovered evidence supplies a complete transition law sufficient to classify legal successors or a P_AA observation difference.

## External formal-semantics anchor

A state-machine specification needs a next-state relation describing the possible successive-state pairs. An action is a relation over the pre-state and post-state, not merely a list of fields that an operation reads or writes. This is directly stated in the TLA+ literature. Therefore, a named renewal mutation field cannot by itself establish a complete renewal transition relation. citeturn0search12turn0search0

## Recovered canonical evidence

AB80's LEASE schema states:

- IssueLease requires a valid authority basis.
- A complete bridge must bind the relevant authority/admission context.
- Admit requires current compatible authority plus a valid complete bridge.
- The semantic read-set includes authority, lease/freshness, policy, delegation, resource incarnation, boundary, binding relation, actual admission context, and renewal/replay/consumption/history support where relevant.
- Exact renewal/replacement mutation law is unresolved.
- The bridge must be linked to the actual admission context.
- Authority revoke, epoch advance, policy change, delegation change, reincarnation and lease expiry may invalidate the bridge.
- Complete protocol-specific invalidation semantics are not closed.
- Renewal legality, renewal post-state, bridge replacement/retention law, replay semantics, and exhaustive renewal outcomes remain UNKNOWN.

AB82 independently tested LEASE_RENEW + POLICY_CHANGE + ADMIT and found no explicit arbitrary irreducible ternary predicate in the recovered read-set vocabulary, while C2/C3/C6 remained incomplete.

## Focused gate

### C1 — Source context
PARTIAL/KNOWN.

The relevant source concepts are identified: lease/freshness, authority, policy, delegation, incarnation, bridge, admission context and boundary.

### C2 — Complete renewal legality
UNKNOWN.

The recovered evidence says renewal is semantically relevant and names renewal authority/history inputs, but it does not provide a complete predicate determining every legal renewal situation.

In particular, the evidence does not close:
- whether an expired lease can ever be renewed;
- whether renewal replaces or extends the existing lease;
- what authority state must hold at the exact renewal point;
- how a concurrent or intervening policy change affects renewal eligibility;
- whether renewal can preserve an existing bridge or must create a new one;
- exhaustive legality domain.

### C3 — Complete post-state
UNKNOWN.

The evidence explicitly leaves the renewal/replacement mutation law unresolved. Therefore we cannot derive a complete mapping:

source state + LEASE_RENEW -> post-state.

At minimum the unresolved post-state dimensions include:
- lease interval/freshness;
- lease identity versus replacement identity;
- bridge identity and contents;
- policy/delegation/incarnation binding;
- replay/consumption state;
- historical linkage;
- any invalidation produced by the renewal.

### C4 — Frame/invalidation
UNKNOWN.

Policy change is explicitly capable of affecting compatibility, and lease renewal is explicitly capable of affecting bridge validity, but the complete ordering and invalidation closure is not recovered.

We cannot assume either:
1. policy change always invalidates the old bridge before renewal;
2. renewal automatically repairs policy compatibility;
3. renewal preserves the old bridge;
4. renewal creates a new bridge.

Each would be an invented protocol rule unless supported by additional evidence.

### C5 — Observation/context mapping
PARTIAL/UNKNOWN.

AB25/AB54/AB80 establish that actual admission must be linked to the context actually used. However, the recovered renewal semantics do not establish how a renewed lease/bridge maps to the later UsedAdmissionContext in every legal continuation.

Thus an apparent equality of current fields cannot establish observational equivalence.

### C6 — Complete successor domain
UNKNOWN.

No recovered source enumerates all legal renewal outcomes. Therefore the bounded interpreter cannot legitimately classify the successor relation as KNOWN_EMPTY or KNOWN_NONEMPTY merely from candidate renewal states.

## Minimal adversarial completion analysis

Consider a source state S with:

- valid authority A;
- lease L;
- policy P0;
- complete bridge B0;
- admission context tied to L/B0;
- an intervening POLICY_CHANGE to P1.

Two abstract completions remain possible under the currently incomplete evidence:

M1:
- LEASE_RENEW is legal only if the current policy is compatible;
- renewal creates/rebinds bridge B1 to P1;
- ADMIT can use B1.

M2:
- LEASE_RENEW preserves or replaces the lease but does not repair the policy incompatibility;
- the old bridge remains invalid for P1;
- ADMIT cannot use the renewed context.

These are not asserted as actual Nexo protocol laws. They are evidence-compatible completion patterns used only to show why the missing renewal law matters.

If M1 and M2 produce different future P_AA observations and neither is excluded by recovered evidence, the observational quotient cannot safely collapse them.

If later evidence proves only one completion legal, the classification must be recomputed from that evidence.

If later evidence explicitly permits both, the successor relation may contain genuine protocol nondeterminism, but completeness would still have to be established before assigning KNOWN_NONEMPTY.

## Ternary collision gate

No concrete ternary P_AA collision is established.

No theorem of ternary sufficiency is established.

No proof of absence of ternary collision is established.

The strongest current statement remains:

TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS

TERNARY_PAA_COLLISION=UNKNOWN

## Current global state after AB84

QUOTIENT_CONGRUENCE=UNKNOWN

EVENTDAG_CLOSURE=PARTIAL

RECONSTRUCTION=BOUNDED_ONLY

SEMANTIC_FREEZE=NOT_DECLARED

FORMAL_VERIFICATION=NOT_PERFORMED

EXECUTION=NOT_VERIFIED

NO_INTEGRATED_NEXO_ASSEMBLY_BEFORE_RESEARCH_ARCHITECTURE_GATE=TRUE

Eight-attack closure: BLOCKED.

286-triple expansion: BLOCKED.

## Negative result

AB84 demonstrates a semantic boundary, not a protocol impossibility result.

The missing information is specifically the complete renewal transition relation and its bridge/admission linkage. The presence of named renewal read-set fields is insufficient to close that relation.

## Exact next action

Do not expand to 286 triples yet.

Next perform targeted evidence recovery for the renewal law itself, prioritizing historical artifacts around AB20/AB24 and any later artifacts that mention:
- renewal legality;
- lease replacement versus extension;
- LeaseBridge replacement/retention;
- renewal authority;
- expiry/renewal ordering;
- policy-change interaction;
- actual admission linkage.

If no stronger evidence is recoverable, record the protocol-semantic boundary and preserve UNKNOWN rather than inventing a renewal law.
