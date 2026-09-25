"""AB55 finite research interpreter for the AB54 P_AA transition matrix.

Research tooling only. It deliberately preserves UNKNOWN whenever AB54 leaves
protocol semantics unspecified. It does not implement Nexo runtime behavior.
"""
from itertools import permutations, product

UNKNOWN = "UNKNOWN"
ATTACKS = [
    ("POLICY_CHANGE", "DELEGATION_CHANGE", "ADMIT"),
    ("DELEGATION_CHANGE", "RESOURCE_REINCARNATE", "ADMIT"),
    ("LEASE_RENEW", "POLICY_CHANGE", "ADMIT"),
    ("LEASE_EXPIRE", "RETRY", "ADMIT"),
    ("DECIDE", "AUTH_REVOKE", "ADMIT"),
    ("RECHECK", "MUTATION", "ADMIT"),
    ("RETRY", "LEASE_CONSUME", "ADMIT"),
    ("RESOURCE_REINCARNATE", "LEASE_RENEW", "ADMIT"),
]

def initial_states():
    # Minimal finite binding domain; this is intentionally bounded.
    for policy, delegation, incarnation_ok, lease_valid, attempt_bound, recheck_valid in product(
        [True, False], repeat=6
    ):
        yield {
            "authority_valid": True,
            "binding_complete": True,
            "policy_compatible": policy,
            "delegation_valid": delegation,
            "incarnation_compatible": incarnation_ok,
            "lease_valid": lease_valid,
            "lease_generation": 0,
            "attempt_bound": attempt_bound,
            "recheck_valid": recheck_valid,
            "admission_protocol_valid": True,
            "unknown": False,
        }

def apply_event(state, event):
    s = dict(state)

    if event == "POLICY_CHANGE":
        s["policy_compatible"] = False
    elif event == "DELEGATION_CHANGE":
        s["delegation_valid"] = False
    elif event == "RESOURCE_REINCARNATE":
        s["incarnation_compatible"] = False
        s["lease_valid"] = False
    elif event == "LEASE_RENEW":
        # AB54 does not define the exact successor validity semantics.
        s["unknown"] = True
    elif event == "LEASE_EXPIRE":
        s["lease_valid"] = False
    elif event == "RETRY":
        # AB54 leaves new-attempt vs same-attempt inheritance protocol-dependent.
        s["unknown"] = True
    elif event == "DECIDE":
        pass
    elif event == "AUTH_REVOKE":
        s["authority_valid"] = False
    elif event == "RECHECK":
        if not s["recheck_valid"]:
            s["unknown"] = True
    elif event == "MUTATION":
        # MUTATION is referenced by AB54 but has no independent action semantics.
        s["unknown"] = True
    elif event == "LEASE_CONSUME":
        s["lease_valid"] = False
    elif event == "ADMIT":
        if s["unknown"]:
            return s, UNKNOWN
        ok = all((
            s["authority_valid"],
            s["binding_complete"],
            s["policy_compatible"],
            s["delegation_valid"],
            s["incarnation_compatible"],
            s["admission_protocol_valid"],
            s["attempt_bound"],
        ))
        return s, True if ok else False
    else:
        s["unknown"] = True

    return s, None

def run_attack(attack):
    counts = {}
    total = 0
    for state in initial_states():
        for order in permutations(attack):
            total += 1
            current = state
            terminal = None
            for event in order:
                current, result = apply_event(current, event)
                if result is not None:
                    terminal = result
            counts[terminal] = counts.get(terminal, 0) + 1
    return total, counts

if __name__ == "__main__":
    for attack in ATTACKS:
        total, counts = run_attack(attack)
        print("ATTACK:", " + ".join(attack))
        print("TOTAL:", total)
        print("RESULTS:", counts)
