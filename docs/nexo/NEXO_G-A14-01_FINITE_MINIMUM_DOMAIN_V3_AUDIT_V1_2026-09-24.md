# NEXO G-A14-01 — Finite Minimum-Domain Model V3 and Audit — 2026-09-24

## Research basis

TLA+ defines invariants as properties that hold in every reachable state, and TLC is an explicit-state model checker for finite instances. SANY is the syntax/semantic analyzer and can catch errors such as invalid priming of already-primed expressions. citeturn0search0turn0search1

Lamport's model-checking material emphasizes that TLC is useful for finding errors in both designs and specifications by searching for counterexamples to invariance properties. citeturn0search30turn0search31

## V2 audit result

The V2 draft was not treated as verified. Static inspection found two model-construction defects before execution:

1. LoseCurrentness assigned currentnessEpoch' and also listed currentnessEpoch in UNCHANGED, making the transition inconsistent.
2. The V2 compaction transition did not represent a meaningful monotonic compaction frontier.

These defects reinforce the rule: no TLC result is meaningful until SANY-level syntax/semantic validation succeeds.

## V3 semantic corrections

V3 separates:
- admission history (COMMITTED);
- current execution eligibility (derived);
- execution/in-flight effect state;
- UNKNOWN effect state.

Fence, authority epoch, STOP, currentness and safety context are revalidated at the execution boundary.

UNKNOWN retains the original operation/effect identity. Retry does not allocate a new identity.

The model also makes compaction deliberately conservative: the current V3 Compact action is a no-op placeholder, because introducing a false compaction rule would weaken the test rather than improve it.

## Adversarial scenarios represented

- STOP after admission;
- revocation after admission;
- fence takeover after admission;
- currentness loss after admission;
- context activation after admission;
- decommission after admission;
- recovery quarantine/release;
- execution becoming IN_FLIGHT;
- UNKNOWN after in-flight execution;
- UNKNOWN retry preserving identity.

## Important limitation

The current model still does not represent actor-local stale snapshots explicitly. It relies on protected state being consulted at ExecutionEligible. V4 must add stale local views and a capability/effect-boundary action so the model can demonstrate that stale local knowledge cannot bypass protected current-state validation.

The model also does not yet model external provider outcome, anchor continuity, evidence invalidation, or multi-effect conflict domains.

## Status

V3 model: DRAFTED AND STATIC-AUDITED.
SANY: NOT RUN — tool not present in the current execution environment.
TLC: NOT RUN — tool not present in the current execution environment.
Counterexample evidence: NONE CLAIMED.
Semantic minimum: DESIGN REFINED.
Formal verification: NOT PROVEN.
Implementation: NOT STARTED.
Architecture-build gate: CLOSED.

Next: V4 stale-view + capability/effect-boundary adversarial model, followed by an actual SANY/TLC execution when the toolchain is available.
