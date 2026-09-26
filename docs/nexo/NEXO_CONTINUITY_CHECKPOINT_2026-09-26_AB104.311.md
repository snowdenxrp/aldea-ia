# NEXO CONTINUITY — AB104.311

## Canonical state
AB104.311 research persisted. No implementation performed.

## Finding
When one target controls the operation registry, mutation, and authoritative receipt, the strongest candidate is a single atomic transaction covering claim + mutation + receipt. When those states cross transactional domains, UNKNOWN_EXTERNAL remains possible.

## Required semantics
Distinguish ATOMIC_TARGET_COMMIT, TARGET_RECEIPT, INTERMEDIARY_RECEIPT, OUTBOX_INTENT, and UNKNOWN_EXTERNAL. A cached result is not automatically proof of the actual mutation unless tied to the target commit boundary. citeturn0search0turn0search1

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.312: study crash points around the atomic target boundary and whether recovery can reconstruct the receipt without re-executing the effect.

## DO-NOT-REPEAT
Do not split dedupe-check and effect into independent steps and then assume recovery can prove exactly-once. Do not extend one target's transaction boundary to unrelated external targets.
