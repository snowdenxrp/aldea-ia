"""AB57 executable observational/EventDAG gate (research-only).

Conservative finite harness derived from AB54/AB56. It never invents
unspecified protocol semantics: such paths return UNKNOWN.
"""
from dataclasses import dataclass, replace
from itertools import product, permutations
from typing import FrozenSet, Iterable, Optional, Tuple

UNKNOWN = "UNKNOWN"
TRUE = "TRUE"
FALSE = "FALSE"

FIELDS = (
    "authority_valid", "binding_complete", "policy_compatible",
    "delegation_valid", "incarnation_compatible", "protocol_valid",
    "lease_valid", "attempt_bound", "recheck_valid",
)

@dataclass(frozen=True)
class Binding:
    authority: str
    subject: str
    resource: str
    incarnation: str
    attempt: str
    lease: str
    policy: str
    delegation: str

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

@dataclass(frozen=True)
class Event:
    name: str
    identity: str
    reads: FrozenSet[str]
    writes: FrozenSet[str]
    explicit_predecessors: FrozenSet[str] = frozenset()
    semantic_status: str = "EXPLICIT"

# AB54 facts are named explicitly; this prevents field-name similarity from
# becoming an unstated protocol dependency.
EVENTS = {
    "POLICY_CHANGE": Event("POLICY_CHANGE","policy-change",
        frozenset({"policy"}), frozenset({"policy_compatible"})),
    "DELEGATION_CHANGE": Event("DELEGATION_CHANGE","delegation-change",
        frozenset({"delegation"}), frozenset({"delegation_valid"})),
    "RESOURCE_REINCARNATE": Event("RESOURCE_REINCARNATE","resource-reincarnate",
        frozenset({"resource","incarnation"}), frozenset({"incarnation_compatible"})),
    "AUTH_REVOKE": Event("AUTH_REVOKE","authority-revoke",
        frozenset({"authority"}), frozenset({"authority_valid"})),
    "LEASE_EXPIRE": Event("LEASE_EXPIRE","lease-expire",
        frozenset({"lease"}), frozenset({"lease_valid"})),
    "LEASE_CONSUME": Event("LEASE_CONSUME","lease-consume",
        frozenset({"lease","attempt"}), frozenset({"lease_valid"})),
    "DECIDE": Event("DECIDE","decision",
        frozenset({"authority","policy","delegation","resource","attempt"}),
        frozenset()),
    "ADMIT": Event("ADMIT","admission",
        frozenset({"authority","binding","policy","delegation","incarnation",
                   "protocol","boundary","bridge","recheck","attempt"}),
        frozenset()),
    # These remain deliberately unspecified by AB54.
    "LEASE_RENEW": Event("LEASE_RENEW","lease-renew",
        frozenset({"lease","authority","policy","delegation","incarnation","bridge"}),
        frozenset({"lease_valid"}), semantic_status="UNKNOWN"),
    "RETRY": Event("RETRY","retry",
        frozenset({"attempt","policy","protocol","bridge","authority"}),
        frozenset({"attempt_bound"}), semantic_status="UNKNOWN"),
    "MUTATION": Event("MUTATION","mutation",
        frozenset({"mutation","attempt","policy","delegation","incarnation"}),
        frozenset({"recheck_valid"}), semantic_status="UNKNOWN"),
    "RECHECK": Event("RECHECK","recheck",
        frozenset({"fact_set","mutation","attempt","policy","delegation","incarnation","boundary"}),
        frozenset({"recheck_valid"}), semantic_status="UNKNOWN"),
}

# ADMIT's UsedAdmissionContext is an identity-bearing record, not a validity
# predicate. Equality therefore compares the actual binding tuple + context.
@dataclass(frozen=True)
class UsedAdmissionContext:
    binding: Binding
    authority: str
    policy: str
    delegation: str
    incarnation: str
    attempt: str
    protocol: str

def context(state: State) -> UsedAdmissionContext:
    b=state.binding
    return UsedAdmissionContext(b,b.authority,b.policy,b.delegation,b.incarnation,b.attempt,"P_AA")

def apply(event_name: str, state: State) -> Tuple[State,str]:
    ev=EVENTS[event_name]
    if ev.semantic_status=="UNKNOWN":
        return state, UNKNOWN
    s=state
    if event_name=="POLICY_CHANGE": s=replace(s,policy_compatible=False)
    elif event_name=="DELEGATION_CHANGE": s=replace(s,delegation_valid=False)
    elif event_name=="RESOURCE_REINCARNATE": s=replace(s,incarnation_compatible=False)
    elif event_name=="AUTH_REVOKE": s=replace(s,authority_valid=False)
    elif event_name=="LEASE_EXPIRE": s=replace(s,lease_valid=False)
    elif event_name=="LEASE_CONSUME": s=replace(s,lease_valid=False)
    return s, "KNOWN"

def paa(state: State) -> str:
    required=("authority_valid","binding_complete","policy_compatible",
              "delegation_valid","incarnation_compatible","protocol_valid")
    return TRUE if all(getattr(state,k) for k in required) else FALSE

def lower_obs(state: State) -> Tuple:
    b=state.binding
    unary=(b.authority,b.subject,b.resource,b.incarnation,b.attempt,b.lease,b.policy,b.delegation)
    ordered_pairs=tuple((x,y) for x,y in (
        ("authority","subject"),("authority","resource"),("subject","resource"),
        ("subject","attempt"),("resource","incarnation"),("attempt","lease"),
        ("policy","subject"),("delegation","subject")))
    vals=dict(zip(("authority","subject","resource","incarnation","attempt","lease","policy","delegation"),unary))
    return unary, tuple((x,vals[x],y,vals[y]) for x,y in ordered_pairs)

def dag_edges(names: Tuple[str,...]) -> FrozenSet[Tuple[str,str]]:
    # Only protocol-declared predecessor edges are authoritative.
    # Read/write overlap alone does not create a fixed order.
    edges=set()
    for name in names:
        for pred in EVENTS[name].explicit_predecessors:
            if pred in names:
                edges.add((pred,name))
    return frozenset(edges)

def topological_orders(names: Tuple[str,...], edges: FrozenSet[Tuple[str,str]]) -> Tuple[Tuple[str,...],...]:
    out=[]
    for p in permutations(names):
        pos={x:i for i,x in enumerate(p)}
        if all(pos[a] < pos[b] for a,b in edges):
            out.append(p)
    return tuple(out)

def execute_order(order: Tuple[str,...], initial: State):
    state=initial
    trace=[]
    for e in order:
        if e=="ADMIT":
            # CurrentObs is sampled at the ADMIT linearization point.
            obs=paa(state)
            return state, obs, tuple(trace + [(e, obs)])
        state,status=apply(e,state)
        trace.append((e,status))
        if status==UNKNOWN:
            return state, UNKNOWN, tuple(trace)
    return state, UNKNOWN, tuple(trace)

def legal_continuation_orders(state: State) -> Tuple[Tuple[str,...], ...]:
    # Only fully specified continuations are emitted; unspecified protocol
    # successors are represented by UNKNOWN rather than fabricated.
    return (("ADMIT",),)

def future_obs_set(state: State) -> Tuple[str,...]:
    observations=set()
    for cont in legal_continuation_orders(state):
        _, obs, _ = execute_order(cont, state)
        observations.add(obs)
    return tuple(sorted(observations))

def run_attack(events: Tuple[str,str,str], states: Iterable[State]):
    results={"TRUE":0,"FALSE":0,"UNKNOWN":0}
    order_count=0
    context_identity_checks=0
    for st in states:
        edges=dag_edges(events)
        for order in topological_orders(events,edges):
            order_count += 1
            final_state,obs,_=execute_order(order,st)
            results[obs]+=1
            if context(final_state)==context(st):
                context_identity_checks += 1
    return results,order_count,context_identity_checks

def bounded_states() -> Tuple[State,...]:
    # Preserve AB55's 2^6 bounded predicate domain while adding identity-bearing
    # binding tuples. Identity values are deliberately symbolic, not protocol
    # assumptions.
    out=[]
    keys=("policy_compatible","delegation_valid","incarnation_compatible",
          "lease_valid","attempt_bound","recheck_valid")
    for bits in product((False,True), repeat=6):
        kw=dict(zip(keys,bits))
        b=Binding("A0","S0","R0","I0","T0","L0","P0","D0")
        out.append(State(binding=b,**kw))
    return tuple(out)

ATTACKS=(
 ("POLICY_CHANGE","DELEGATION_CHANGE","ADMIT"),
 ("DELEGATION_CHANGE","RESOURCE_REINCARNATE","ADMIT"),
 ("LEASE_RENEW","POLICY_CHANGE","ADMIT"),
 ("LEASE_EXPIRE","RETRY","ADMIT"),
 ("DECIDE","AUTH_REVOKE","ADMIT"),
 ("RECHECK","MUTATION","ADMIT"),
 ("RETRY","LEASE_CONSUME","ADMIT"),
 ("RESOURCE_REINCARNATE","LEASE_RENEW","ADMIT"),
)

if __name__ == "__main__":
    states=bounded_states()
    for attack in ATTACKS:
        result,n,ctx=run_attack(attack,states)
        print("+".join(attack), n, result, "context_identity_checks=",ctx)
