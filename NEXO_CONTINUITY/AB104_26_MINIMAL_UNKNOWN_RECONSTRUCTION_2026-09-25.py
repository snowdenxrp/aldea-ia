"""AB104.26 minimal UNKNOWN-preserving replay reconstruction fixture.
Research-only. No protocol law is added.
"""
from dataclasses import dataclass
from enum import Enum
from typing import FrozenSet, Tuple

class Knowledge(Enum):
    KNOWN="KNOWN"
    UNKNOWN="UNKNOWN"

@dataclass(frozen=True)
class ReplayEvidence:
    consumed_attempts: FrozenSet[str]
    completeness: Knowledge

@dataclass(frozen=True)
class StateEvidence:
    attempt: str
    replay: ReplayEvidence

@dataclass(frozen=True)
class Reconstruction:
    successor_relation: Knowledge
    future_admit: Knowledge
    reason: str

def reconstruct_after_consume(state: StateEvidence) -> Reconstruction:
    # AB100 establishes only that LEASE_CONSUME semantics are UNKNOWN.
    # Therefore no post-state is selected and no mutation is synthesized.
    return Reconstruction(
        successor_relation=Knowledge.UNKNOWN,
        future_admit=Knowledge.UNKNOWN,
        reason="LEASE_CONSUME_COMPLETE_LAW_MISSING",
    )

def replay_pair() -> Tuple[StateEvidence, StateEvidence]:
    h1 = StateEvidence("T0", ReplayEvidence(frozenset(), Knowledge.UNKNOWN))
    h2 = StateEvidence("T0", ReplayEvidence(frozenset({"T0"}), Knowledge.UNKNOWN))
    return h1, h2

if __name__ == "__main__":
    h1, h2 = replay_pair()
    print("PAIR_CURRENT_DIFFERENCE", h1 != h2)
    for label, state in (("H1", h1), ("H2", h2)):
        r = reconstruct_after_consume(state)
        print(label, r.successor_relation.value, r.future_admit.value, r.reason)
