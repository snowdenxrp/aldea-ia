# NEXO CONTINUITY — AB104.323

## Canonical state
AB104.323 research persisted. No implementation performed.

## Finding
Epoch transition is a race boundary. Old-epoch evidence may arrive after the new epoch becomes active. RFC 9334 describes explicit epoch handling, transition races, and epoch windows. citeturn0search0turn0search28

## Required boundary
A transition certificate must establish the **new authority frontier**; it must not silently extend old execution authority.

Candidate transition binding: old/new epoch, old/new configuration digests, transition statement digest, predecessor digest, quorum/authority evidence, transition frontier.

Old valid certificate can remain historical evidence while being insufficient for current execution.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.324: study rollback/recovery across authority transition and the monotonic barrier required to prevent resurrection of pre-transition certificates/permissions.

## DO-NOT-REPEAT
Do not treat a higher epoch number or a valid old certificate as sufficient proof of the current authority frontier.
