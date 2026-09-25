"""AB100 replay-aware conservative repair harness.
Research-only. Preserves AB61 semantics; does not invent LEASE_CONSUME law.
"""
from dataclasses import dataclass, replace
from enum import Enum
from typing import FrozenSet

class Tri(Enum):
    TRUE="TRUE"; FALSE="FALSE"; UNKNOWN="UNKNOWN"

class Coverage(Enum):
    CANDIDATE_ONLY="CANDIDATE_ONLY"
    COMPLETE="COMPLETE"
    UNKNOWN="UNKNOWN"

@dataclass(frozen=True)
class ReplayState:
    consumed_attempts: FrozenSet[str] = frozenset()
    completeness: Coverage = Coverage.UNKNOWN

@dataclass(frozen=True)
class Binding:
    authority:str="A0"; subject:str="S0"; resource:str="R0"; incarnation:str="I0"
    attempt:str="T0"; lease:str="L0"; policy:str="P0"; delegation:str="D0"

@dataclass(frozen=True)
class State:
    binding:Binding=Binding()
    authority_valid:bool=True
    binding_complete:bool=True
    policy_compatible:bool=True
    delegation_valid:bool=True
    incarnation_compatible:bool=True
    protocol_valid:bool=True
    lease_valid:bool=True
    protocol:str="LEASE"
    boundary:str="B0"
    replay:ReplayState=ReplayState()

@dataclass(frozen=True)
class Event:
    name:str
    reads:FrozenSet[str]
    writes:FrozenSet[str]
    semantic_status:Tri

EVENTS={
 "LEASE_CONSUME":Event("LEASE_CONSUME",frozenset({"lease","attempt","replay"}),
                       frozenset({"replay"}),Tri.UNKNOWN),
 "LEASE_EXPIRE":Event("LEASE_EXPIRE",frozenset({"lease","expiry"}),
                      frozenset({"lease_valid"}),Tri.UNKNOWN),
 "LEASE_RENEW":Event("LEASE_RENEW",frozenset({"lease","expiry","authority","policy","delegation","incarnation","bridge"}),
                     frozenset({"lease_valid"}),Tri.UNKNOWN),
 "ADMIT":Event("ADMIT",frozenset({"authority","binding","policy","delegation","incarnation","protocol","boundary","bridge","recheck","attempt","replay"}),
               frozenset(),Tri.UNKNOWN),
}

def admit(state:State)->Tri:
    # Replay is claim-relevant but its legal interpretation is unresolved.
    if state.replay.completeness is not Coverage.COMPLETE:
        return Tri.UNKNOWN
    if state.binding.attempt in state.replay.consumed_attempts:
        return Tri.FALSE
    ok=(state.authority_valid and state.binding_complete and
        state.policy_compatible and state.delegation_valid and
        state.incarnation_compatible and state.protocol_valid and state.lease_valid)
    return Tri.TRUE if ok else Tri.FALSE

def apply(event:str,state:State):
    ev=EVENTS[event]
    if ev.semantic_status is Tri.UNKNOWN:
        return state,Tri.UNKNOWN,{"event":event,"reason":"MISSING_COMPLETE_SEMANTICS"}
    return state,Tri.UNKNOWN,{"event":event,"reason":"UNIMPLEMENTED"}

def future_obs(state:State,events):
    known=[]; unknown=False; illegal=[]
    for e in events:
        if e=="ADMIT":
            o=admit(state)
            if o is Tri.UNKNOWN: unknown=True
            elif o is Tri.TRUE: known.append(o.value)
            else: illegal.append(e)
        else:
            legal=EVENTS[e].semantic_status
            if legal is Tri.UNKNOWN: unknown=True
    if unknown: status=Coverage.UNKNOWN
    elif known: status=Coverage.CANDIDATE_ONLY
    else: status=Coverage.UNKNOWN
    return status,tuple(sorted(set(known))),tuple(illegal)

def replay_pair():
    base=State()
    h1=base
    h2=replace(base,replay=ReplayState(frozenset({"T0"}),Coverage.CANDIDATE_ONLY))
    return h1,h2

if __name__=="__main__":
    h1,h2=replay_pair()
    print("H1_ADMIT",admit(h1).value)
    print("H2_ADMIT",admit(h2).value)
    print("H1_FUTURE",future_obs(h1,("LEASE_CONSUME","ADMIT")))
    print("H2_FUTURE",future_obs(h2,("LEASE_CONSUME","ADMIT")))
