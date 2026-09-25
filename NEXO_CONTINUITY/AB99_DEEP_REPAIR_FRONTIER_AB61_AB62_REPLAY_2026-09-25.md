# AB99 — DEEP REPAIR FRONTIER: AB61/AB62 EXECUTION SEMANTICS AND REPLAY SUPPORT — 2026-09-25

Status: RESEARCH / REPAIR CHECKPOINT. Prior artifacts are preserved. No prior artifact is overwritten.

## Mission
Continue the repair from the canonical chain, including source research, code inspection, reproducibility, and CONTINUITY persistence. This checkpoint is intended to be sufficient for a future chat to resume without relying on this chat transcript.

## External methodological cross-check
TLA+ models systems with an initial condition and a next-state relation describing possible successive-state pairs. Actions constrain current/next state pairs; nondeterministic actions may admit multiple successor states. Therefore a repaired transition harness must not treat an incomplete successor generator as complete merely because it returns a value. Lamport also documents that auxiliary/history variables can be necessary to construct refinement mappings when past behavior is not otherwise reconstructible. These are methodological anchors, not proof of Nexo semantics.

## Canonical recovery
AB50 is real and persisted at commit d9d6ae59574e43af7d75891208189864aeb7798c.
AB59 audit commit b5317f178131a56aa454ce5afe63294121f51aee explicitly identified the remaining execution/reproducibility gap.
AB61 contains the semantic-repair interpreter.
AB62 contains a gate runner over that interpreter.
The current research chain must therefore repair the executable boundary rather than restart AB50.

## Code audit findings

### F1 — AB61 intentionally preserves unresolved legality
LEASE_RENEW, RETRY, MUTATION and RECHECK are marked semantic_status=UNKNOWN. continuation_legality therefore returns UNKNOWN for those events. This is conservative and must not be replaced by arbitrary TRUE/FALSE.

### F2 — Replay/consumption is currently conflated with lease validity
AB61 defines LEASE_CONSUME as reading lease+attempt and writing lease_valid, then apply_history_event turns a successful consume into lease_valid=False. This is not sufficient to represent the AB49/AB50 replay separator L4, because consumption/replay is a distinct support dimension from expiry/interval validity. The current boolean can therefore erase the distinction between "expired/invalid lease" and "already consumed for an attempt".
This is a code-model defect, not evidence that the real protocol has a particular consume post-state.

### F3 — lower_obs exposes replay only as lease_valid
AB61 lower_obs sets replay_consumption_facts = state.lease_valid. That representation cannot distinguish at least the abstract pair:
H1: lease valid and not consumed for attempt A
H2: lease valid and consumed for attempt A
without adding a replay/consumption support representation. AB49 explicitly lists L4 replay/consumption as a separator and J4 as Lease-vs-Lease with identical current bridge but different renewal/replay successors.

### F4 — current ADMIT predicate does not consume the replay support dimension
paa() checks authority, binding completeness, policy, delegation, incarnation and protocol validity, but not lease validity or replay/consumption. This may be deliberate because the code is only a bounded scaffold, but it means the current harness cannot establish the full AB50 P_AA replay gate. It must remain UNKNOWN rather than silently upgrading the predicate.

### F5 — future_obs_set is conservative but bounded
For unknown continuation events it returns UNKNOWN rather than inventing successors. This is epistemically correct. However, candidate_events alone is not a complete legal continuation universe. NONEMPTY_KNOWN therefore means only that a known successor is established within the supplied candidate set, not global continuation completeness.

### F6 — order_facts are copied from the tested order
lower_obs receives known_history=order and stores the whole tuple. This is a test projection, not a proved canonical EventDAG quotient. It must not be promoted to semantic sufficiency.

## Repair rule
Do not modify AB61 in place. Preserve it as historical evidence. Build the next repaired layer as a new artifact/code revision that:
1. separates lease validity/expiry from replay/consumption state;
2. represents replay support as UNKNOWN unless a complete legal consume law is recovered;
3. records actual attempt-scoped consumption identity when evidence permits, without inventing protocol postconditions;
4. makes ADMIT explicitly report UNKNOWN when required replay support is unresolved;
5. keeps continuation legality TRUE/FALSE/UNKNOWN;
6. distinguishes candidate continuation coverage from exhaustive continuation coverage;
7. emits provenance for every UNKNOWN;
8. never treats absence of a successor as EMPTY_KNOWN unless completeness is established.

## Current epistemic state
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION=UNKNOWN
REPLAY_SUPPORT=REQUIRED_PROVISIONALLY
REPLAY_HISTORY_REMOVAL=NOT_JUSTIFIED
CONCRETE_LEGAL_REPLAY_SEPARATOR=NOT_ESTABLISHED
REPLAY_RECONSTRUCTION=UNKNOWN
QUOTIENT_CONGRUENCE=UNKNOWN
EVENTDAG_CLOSURE=PARTIAL
RECONSTRUCTION=BOUNDED_ONLY
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION=NOT_PERFORMED
EXECUTION=NOT_VERIFIED
INTEGRATED_NEXO_ASSEMBLY=BLOCKED

## Next exact actions
1. Recover the complete AB61/AB62 source history and any execution outputs.
2. Create a non-destructive repaired replay-aware harness beside AB61/AB62.
3. Execute the smallest H1/H2 replay pair against that harness.
4. Determine whether the pair yields a concrete future P_AA separator or remains UNKNOWN because LEASE_CONSUME semantics are incomplete.
5. Audit LEASE_RENEW separately after replay.
6. Persist the result as the next AB artifact and verify the readback.
7. If this chat ends, resume from this file, AB98, and the newest verified commit; do not repeat AB50-AB98 unless a verification discrepancy is found.

## DO-NOT-REPEAT
- Do not overwrite AB61 or AB62.
- Do not equate replay/consumption with lease expiry.
- Do not invent LEASE_CONSUME post-state semantics.
- Do not claim a legal replay collision from an abstract pair alone.
- Do not declare quotient congruence, semantic freeze, formal verification, or execution verification.
- Do not expand to 286 triples before the complete eight-attack gate.
