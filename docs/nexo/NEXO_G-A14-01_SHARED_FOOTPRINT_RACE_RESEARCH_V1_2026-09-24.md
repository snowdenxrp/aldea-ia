# G-A14-01 — Shared Footprint Race Research V1 — 2026-09-24

## Question
Can two effects be admitted independently when they touch a shared safety invariant or protected capacity?

## Research
Raft obtains a single ordered command stream for a replicated state machine; this provides one authoritative order for commands within that state machine. citeturn1search15turn1search19
etcd transactions atomically evaluate multiple comparisons and apply multiple writes, and revisions provide a logical ordering for concurrent updates. citeturn1search0turn1search1

## Adversarial race
Assume capacity = 10. Two effects each reserve 7 units. Each actor independently reads free capacity = 10 and each local view says its own target is admissible. If they commit through independent coordination domains, both can succeed and the global invariant capacity >= 0 is violated.

Therefore effect_key alone is not a sufficient serialization unit. The coordination unit must cover the shared protected invariant/capacity domain, or there must be a proven cross-domain atomic protocol that preserves the invariant.

## Important distinction
LOCAL LINEARIZABILITY does not imply GLOBAL INVARIANT PRESERVATION.

Two disjoint keys may be independently linearizable while a shared invariant spanning them is violated. A conflict footprint therefore needs to represent the protected dependencies relevant to the invariant, not merely the database key or effect identifier.

## Candidate protected relation
For each admission, retain or validate a context-bound protected footprint relation containing at least the relevant conflict-domain identity/epoch. The full dependency graph need not enter the minimum state if a protected validator produces a bounded, context-bound result and invalidates it when its dependencies change.

Unknown footprint or unknown shared dependency must not be treated as disjoint. Conservative behavior is to join a super-domain, require cross-domain coordination, or HOLD/QUARANTINE.

## Negative result
This does NOT prove that a literal ConflictDomain field must be stored in the core. It proves that the minimum protected semantics need an authoritative way to determine whether two admissions may safely linearize independently.

## Status
Research complete for this delta.
Formal model: not executed.
SANY/TLC: not run in current environment.
Implementation gate: closed.
Next: construct a finite two-effect model and test whether conflict-domain identity can be replaced by a protected footprint epoch/result without weakening the invariant.