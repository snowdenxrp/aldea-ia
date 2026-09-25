"""AB61 semantic-repair interpreter.

Research-only. This file repairs the AB57 implementation boundary without
inventing missing protocol law. It makes continuation legality explicitly
TRUE/FALSE/UNKNOWN, separates unknown ordering from independence, captures
UsedAdmissionContext at ADMIT, and exposes incompleteness in the observational
quotient instead of silently treating a scaffold as canonical.
"""
from dataclasses import dataclass, replace
from enum import Enum
from itertools import product, permutations
from typing import FrozenSet, Tuple

class Tri(Enum):
    TRUE = "TRUE"
    FALSE = "FALSE"
    UNKNOWN = "UNKNOWN"

class OrderStatus(Enum):
    FORCED = "FORCED"
    INDEPENDENT = "INDEPENDENT"
    UNKNOWN = "UNKNOWN"

class ContinuationSetStatus(Enum):
    NONEMPTY_KNOWN = "NONEMPTY_KNOWN"
    EMPTY_KNOWN = "EMPTY_KNOWN"
    UNKNOWN = "UNKNOWN"

@dataclass(frozen=True)
class Binding:
    authority: str = "A0"
    subject: str = "S0"
    resource: str = "R0"
    incarnation: str = "I0"
    attempt: str = "T0"
    lease: str = "L0"
    policy: str = "P0"
    delegation: str = "D0"

@dataclass(frozen=True)
class AdmissionContext:
    binding: Binding
    authority: str
    policy: str
    delegation: str
    incarnation: str
    attempt: str
    protocol: str
    boundary: str = "B0"

@dataclass(frozen=True)
class State:
    binding: Binding
    authority_valid: bool = True
    binding_complete: bool = True
    policy_compatible: bool = True
    delegation_valid: bool = True
    incarnation_compatible: bool = True
    protocol_valid: bool = True
    lease_valid: bool = True
    attempt_bound: bool = True
    recheck_valid: bool = True
    protocol: str = "ATOMIC"
    boundary: str = "B0"
    admission_context: AdmissionContext | None = None

@dataclass(frozen=True)
class Event:
    name: str
    reads: FrozenSet[str]
    writes: FrozenSet[str]
    explicit_predecessors: FrozenSet[str] = frozenset()
    semantic_status: str = "EXPLICIT"

EVENTS = {
    "POLICY_CHANGE": Event("POLICY_CHANGE", frozenset({"policy"}),
                           frozenset({"policy_compatible"})),
    "DELEGATION_CHANGE": Event("DELEGATION_CHANGE", frozenset({"delegation"}),
                               frozenset({"delegation_valid"})),
    "RESOURCE_REINCARNATE": Event("RESOURCE_REINCARNATE",
        frozenset({"resource","incarnation"}), frozenset({"incarnation_compatible"})),
    "AUTH_REVOKE": Event("AUTH_REVOKE", frozenset({"authority"}),
                         frozenset({"authority_valid"})),
    "LEASE_EXPIRE": Event("LEASE_EXPIRE", frozenset({"lease"}),
                          frozenset({"lease_valid"})),
    "LEASE_CONSUME": Event("LEASE_CONSUME", frozenset({"lease","attempt"}),
                           frozenset({"lease_valid"})),
    "DECIDE": Event("DECIDE",
        frozenset({"authority","policy","delegation","resource","attempt"}),
        frozenset()),
    "ADMIT": Event("ADMIT",
        frozenset({"authority","binding","policy","delegation","incarnation",
                   "protocol","boundary","bridge","recheck","attempt"}),
        frozenset()),
    "LEASE_RENEW": Event("LEASE_RENEW",
        frozenset({"lease","expiry","authority","policy","delegation",
                   "incarnation","bridge"}), frozenset({"lease_valid"}),
        semantic_status="UNKNOWN"),
    "RETRY": Event("RETRY",
        frozenset({"attempt","policy","protocol","bridge","authority"}),
        frozenset({"attempt_bound"}), semantic_status="UNKNOWN"),
    "MUTATION": Event("MUTATION",
        frozenset({"mutation","attempt","policy","delegation","incarnation"}),
        frozenset({"recheck_valid"}), semantic_status="UNKNOWN"),
    "RECHECK": Event("RECHECK",
        frozenset({"fact_set","mutation","attempt","policy","delegation",
                   "incarnation","boundary"}), frozenset({"recheck_valid"}),
        semantic_status="UNKNOWN"),
}

ATTACKS = (
    ("POLICY_CHANGE","DELEGATION_CHANGE","ADMIT"),
    ("DELEGATION_CHANGE","RESOURCE_REINCARNATE","ADMIT"),
    ("LEASE_RENEW","POLICY_CHANGE","ADMIT"),
    ("LEASE_EXPIRE","RETRY","ADMIT"),
    ("DECIDE","AUTH_REVOKE","ADMIT"),
    ("RECHECK","MUTATION","ADMIT"),
    ("RETRY","LEASE_CONSUME","ADMIT"),
    ("RESOURCE_REINCARNATE","LEASE_RENEW","ADMIT"),
)

# AB50/AB51 canonical projection vocabulary. Fields not represented in this
# bounded state are marked UNKNOWN rather than omitted.
PROJECTION_FIELDS = (
    "claim","boundary","authority","resource","incarnation","policy","delegation",
    "actual_admission_link","admission_binding_class","protocol",
    "order_facts","invalidation_facts","replay_consumption_facts","retained_support",
)

def used_context(state: State) -> AdmissionContext:
    b = state.binding
    return AdmissionContext(b, b.authority, b.policy, b.delegation,
                            b.incarnation, b.attempt, state.protocol, state.boundary)

def paa(state: State) -> Tri:
    if state.admission_context is None:
        return Tri.UNKNOWN
    required = (
        state.authority_valid, state.binding_complete,
        state.policy_compatible, state.delegation_valid,
        state.incarnation_compatible, state.protocol_valid,
    )
    return Tri.TRUE if all(required) else Tri.FALSE

def apply_history_event(event: str, state: State) -> tuple[State, Tri | None]:
    if EVENTS[event].semantic_status == "UNKNOWN":
        return state, Tri.UNKNOWN
    if event == "POLICY_CHANGE":
        return replace(state, policy_compatible=False), None
    if event == "DELEGATION_CHANGE":
        return replace(state, delegation_valid=False), None
    if event == "RESOURCE_REINCARNATE":
        return replace(state, incarnation_compatible=False, lease_valid=False), None
    if event == "AUTH_REVOKE":
        return replace(state, authority_valid=False), None
    if event == "LEASE_EXPIRE":
        if not state.lease_valid:
            return state, Tri.FALSE
        return replace(state, lease_valid=False), None
    if event == "LEASE_CONSUME":
        if not state.lease_valid:
            return state, Tri.FALSE
        return replace(state, lease_valid=False), None
    if event == "DECIDE":
        return state, None
    if event == "ADMIT":
        # ADMIT captures the actual context. It is not recomputed from
        # post-admission validity, and the captured context is immutable.
        ctx = used_context(state)
        return replace(state, admission_context=ctx), paa(replace(state, admission_context=ctx))
    return state, Tri.UNKNOWN

def continuation_legality(event: str, state: State) -> Tri:
    if event == "ADMIT":
        # A future ADMIT is known decidable once its required modeled
        # predicates are present; UNKNOWN is reserved for missing linkage.
        if state.admission_context is not None:
            return Tri.FALSE  # no second admission on the same terminal record
        return Tri.TRUE
    ev = EVENTS[event]
    if ev.semantic_status == "UNKNOWN":
        return Tri.UNKNOWN
    if event in ("LEASE_EXPIRE","LEASE_CONSUME") and not state.lease_valid:
        return Tri.FALSE
    # AB54 says the transition is "permitted" but does not provide a complete
    # permission predicate for these actions. Therefore legality is UNKNOWN,
    # not TRUE, unless a concrete contradiction makes it FALSE.
    return Tri.UNKNOWN

def execute(order: tuple[str,...], initial: State):
    state = initial
    trace = []
    for event in order:
        state, obs = apply_history_event(event, state)
        trace.append((event, "HISTORY_EVENT", None if obs is None else obs.value))
        if obs is not None:
            return state, obs, tuple(trace)
    return state, Tri.UNKNOWN, tuple(trace)

def order_relation(a: str, b: str) -> OrderStatus:
    ea, eb = EVENTS[a], EVENTS[b]
    if b in ea.explicit_predecessors:
        return OrderStatus.FORCED
    if a in eb.explicit_predecessors:
        return OrderStatus.FORCED
    if ea.writes & (eb.reads | eb.writes):
        return OrderStatus.UNKNOWN
    if eb.writes & (ea.reads | ea.writes):
        return OrderStatus.UNKNOWN
    return OrderStatus.INDEPENDENT

def dag_order_status(events: tuple[str,...]):
    pairs = {}
    for i, a in enumerate(events):
        for b in events[i+1:]:
            pairs[(a,b)] = order_relation(a,b).value
    return pairs

def lower_obs(state: State, known_history=()):
    b = state.binding
    # This is the AB50/AB51 projection vocabulary, but completeness is
    # explicit. The bounded state does not encode all support dimensions.
    values = {
        "claim": "P_AA",
        "boundary": state.boundary,
        "authority": b.authority,
        "resource": b.resource,
        "incarnation": b.incarnation,
        "policy": b.policy,
        "delegation": b.delegation,
        "actual_admission_link": (
            state.admission_context is not None,
            state.admission_context,
        ),
        "admission_binding_class": (b.authority,b.subject,b.resource,b.incarnation,
                                    b.attempt,b.policy,b.delegation),
        "protocol": state.protocol,
        "order_facts": tuple(known_history),
        "invalidation_facts": (
            state.authority_valid, state.policy_compatible,
            state.delegation_valid, state.incarnation_compatible,
            state.lease_valid,
        ),
        "replay_consumption_facts": state.lease_valid,
        "retained_support": "UNKNOWN",
    }
    return tuple((k, values[k]) for k in PROJECTION_FIELDS)

def quotient_status() -> Tri:
    # AB51 requires retained support/order/linkage to be complete before a
    # canonical quotient can be claimed. This bounded state lacks that proof.
    return Tri.UNKNOWN

def future_obs_set(state: State, candidate_events=("ADMIT",)):
    known = set()
    unknown_branch = False
    illegal_known = set()
    for event in candidate_events:
        legal = continuation_legality(event, state)
        if legal is Tri.TRUE:
            _, obs, _ = execute((event,), state)
            known.add(obs.value)
        elif legal is Tri.FALSE:
            illegal_known.add(event)
        else:
            unknown_branch = True
    if known:
        status = ContinuationSetStatus.UNKNOWN if unknown_branch else ContinuationSetStatus.NONEMPTY_KNOWN
    elif unknown_branch:
        status = ContinuationSetStatus.UNKNOWN
    else:
        status = ContinuationSetStatus.EMPTY_KNOWN
    return status.value, tuple(sorted(known)), tuple(sorted(illegal_known))

def bounded_states():
    for bits in product((False, True), repeat=6):
        p,d,i,l,a,r = bits
        yield State(
            binding=Binding(),
            policy_compatible=p, delegation_valid=d,
            incarnation_compatible=i, lease_valid=l,
            attempt_bound=a, recheck_valid=r,
        )

def run_attack(attack):
    counts = {x.value: 0 for x in Tri}
    unknown_reasons = {}
    orders = tuple(permutations(attack))
    for state in bounded_states():
        for order in orders:
            _, obs, trace = execute(order, state)
            counts[obs.value] += 1
            if obs is Tri.UNKNOWN:
                reason = trace[-1][2] if trace else "no-result"
                unknown_reasons[reason] = unknown_reasons.get(reason, 0) + 1
    return counts, unknown_reasons, dag_order_status(attack)

if __name__ == "__main__":
    print("AB61 quotient status:", quotient_status().value)
    for attack in ATTACKS:
        counts, reasons, order = run_attack(attack)
        print("ATTACK", "+".join(attack))
        print("COUNTS", counts)
        print("UNKNOWN_REASONS", reasons)
        print("ORDER_STATUS", order)
        s = next(iter(bounded_states()))
        print("FUTURE", future_obs_set(s))
