"""AB62 runner: executes the repaired AB61 gate and emits a machine-readable summary.

Research-only. No protocol semantics are invented here.
"""
from AB61_SEMANTIC_REPAIR_INTERPRETER_2026-09-25 import (
    ATTACKS, Tri, State, Binding, bounded_states, continuation_legality,
    future_obs_set, lower_obs, dag_order_status, execute
)
from itertools import permutations

def gate(attack):
    rows=[]
    for idx,state in enumerate(bounded_states()):
        for order in permutations(attack):
            end, history_result, trace=execute(order,state)
            # Candidate future continuations are evaluated separately from
            # the candidate history. Include every event in the attack.
            fs=future_obs_set(end, candidate_events=tuple(dict.fromkeys(attack)))
            rows.append({
                "state":idx,
                "order":order,
                "history_result":history_result.value,
                "lower_obs":lower_obs(end, known_history=order),
                "future_set_status":fs[0],
                "future_known":fs[1],
                "future_illegal":fs[2],
                "dag_order_status":dag_order_status(attack),
            })
    return rows

if __name__=="__main__":
    for attack in ATTACKS:
        rows=gate(attack)
        print("ATTACK","+".join(attack),"ROWS",len(rows))
        for k in ("NONEMPTY_KNOWN","EMPTY_KNOWN","UNKNOWN"):
            print("FUTURE_STATUS",k,sum(r["future_set_status"]==k for r in rows))
        print("HISTORY_RESULT", {k:sum(r["history_result"]==k for r in rows) for k in ("TRUE","FALSE","UNKNOWN")})
