# NEXO AB105 — Historical Claim Reconciliation — 2026-10-05

## Purpose
Final documentation sweep of earlier AB105 G0/W1→ENQUEUE material against the now-canonical continuity state.

## Findings

### 1. Stale continuity labels
Several October 2–3 checkpoints still say:
- AB105.117R NOT_CREATED
- AB105.116R unchanged as the active anchor

Those statements are historically accurate at their original timestamps, but are stale as current-state claims because AB105.117R was subsequently created and verified. They must not be used to reconstruct the current state.

Canonical correction:
AB105.117R EXISTS and is the verified raw real-broker witness:
37098764557 → 111133973894 → 11265332252.

### 2. Temporal ordering was not promoted to HB
The reviewed W1→ENQUEUE documents consistently distinguish:
W1 < ENQUEUE = temporal observation
from
W1 → ENQUEUE = JMM happens-before.

No overclaim found in the reviewed passages.

This distinction is required by the JMM: happens-before is formed from program order plus synchronizes-with edges and transitive closure; temporal observation alone is insufficient. citeturn0search12turn0search0

### 3. D1 DENIED was not used as stale-read disproof
The reviewed checkpoints classify stale-read manifestation as UNKNOWN and vulnerability as NOT_DECLARED. Therefore the 10/10 DENIED result was not promoted into a proof that stale visibility is impossible.

### 4. D0_RETURN was not treated as W1
The reviewed causal documents explicitly distinguish controller-side D0_RETURN from target-broker MetadataLoader W1, including cycles where W1 occurred after D0_RETURN.

### 5. One historical document contains an obsolete future-experiment proposal
The 2026-10-02 timing reanalysis proposed producer prewarming and reducing D0_RETURN→ENQUEUE latency while avoiding W1-derived synchronization. That proposal was never itself evidence and must not be mistaken for an executed experiment. Later PR96 implementation claims were independently classified as unverified.

## Current epistemic state
HB(W1→D1): UNKNOWN / NOT IDENTIFIED.
W1→ENQUEUE: UNKNOWN / NOT IDENTIFIED.
Stale-read execution: NOT OBSERVED / NOT DISPROVEN.
Security vulnerability: NOT ESTABLISHED.

## DO-NOT-REPEAT
No rerun of PR92, PR93, PR94/G0, TLC, or AB105.117R.
No artificial synchronization.
No counting artifact 11265332252 twice.

## Next frontier
The historical-claim sweep found no scientific overclaim in the reviewed W1→ENQUEUE documents. The remaining task is only to ensure stale current-state labels are not used as present continuity facts.