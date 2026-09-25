# AB104.3 — Two-completion epistemic test for LEASE_RENEW — 2026-09-25

Status: RESEARCH ONLY. The completions below are countermodels of missing semantics, not claims about Nexo behavior.

## Evidence boundary
Targeted repository code/file searches for renewal extension/replacement, renewal authority/expiry, bridge retention/rebinding, and consume/replay/retry returned no additional matching files. Historical AB79 explicitly records that AB36/AB38 were not recovered through the available commit-search route and that this does not prove nonexistence. Therefore the semantic gap remains open.

## Shared pre-state S
- authority A is currently valid;
- lease L exists with expiry information;
- policy P0 is current;
- delegation D0 and incarnation I0 are compatible;
- bridge B0 is complete and linked to the actual admission context;
- an intervening POLICY_CHANGE produces P1.

## Completion M1 — extension/rebinding pattern
This hypothetical completion makes LEASE_RENEW legal under P1 when renewal authority is valid, extends/replaces the lease interval, and produces a bridge B1 explicitly bound to P1. A subsequent ADMIT may therefore be TRUE if all other bindings remain valid.

## Completion M2 — non-repair pattern
This hypothetical completion does not make policy incompatibility disappear merely by renewing. The old bridge remains invalid for P1, and renewal does not establish a compatible admission bridge. A subsequent ADMIT is therefore not TRUE under that completion.

## Why this matters
Recovered evidence does not select M1 or M2. They differ in post-state, bridge identity/linkage and future admission observation while remaining compatible with the currently documented omission. Therefore the current model cannot collapse LEASE_RENEW to a unique successor relation or KNOWN_EMPTY/KNOWN_NONEMPTY status.

This is an epistemic counterexample: it demonstrates insufficiency of the recovered specification, not protocol nondeterminism. Genuine nondeterminism would require evidence that both completions are explicitly legal under a complete transition relation.

## Consumption analogue
AB100 similarly models replay state conservatively but marks LEASE_CONSUME UNKNOWN. A candidate consumed-attempt state cannot by itself establish the legal consume transition, retry inheritance, or admission effect. Therefore no concrete replay collision is established.

## Closure consequence
C2 legality = UNKNOWN; C3 post-state = UNKNOWN; C4 invalidation/frame = UNKNOWN; C5 observation linkage = UNKNOWN/PARTIAL; C6 enumeration = UNKNOWN.

No semantic freeze. No 286 expansion. No formal verification claim. AB65 execution remains NOT_VERIFIED.
