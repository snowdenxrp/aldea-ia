# NEXO — AB104.201 DURABLE FRESHNESS ANCHOR ATTACK V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## External evidence studied

### SQLite atomic commit / recovery
SQLite documents that atomic transactions can survive process/OS/power failure through rollback journals or WAL, but durability depends on the storage synchronization semantics. In WAL mode, a commit is represented by a commit record in the WAL; with insufficient synchronization a transaction can be rolled back after power loss. SQLite recovery scans WAL frames, validates checksums, and stops at the first invalid frame; recovery also uses locks to prevent concurrent recovery/writes during reconstruction. SQLite's own crash-test methodology deliberately injects incomplete writes, garbage, reordering and power-loss points, and verifies post-crash consistency. This is strong evidence that Nexo's root/freshness boundary cannot be justified by code inspection alone; the eventual implementation requires adversarial crash testing. Sources: SQLite Atomic Commit, WAL, WAL-format Recovery, PRAGMA synchronous.

### Trust anchors
NIST defines a trust anchor as an authoritative entity for which trust is assumed; validation depends on the authenticity and integrity of the trust anchor. Therefore a freshness anchor cannot be considered self-authenticating merely because it is stored in the same mutable state it protects.

## AB104.201 attack findings

1. Journal/transaction alone provides atomicity only for the state covered by that transaction. It does not automatically provide rollback resistance against restoring an older complete database image.
2. A commit marker is evidence of a completed local transaction only if its durability boundary and recovery rules are defined. Presence of a marker in restored mutable storage is not proof that it is newer than a protected prior anchor.
3. A monotonic counter/epoch is useful only if an attacker cannot roll it back together with the protected state. Therefore ordinary mutable storage cannot, by itself, establish anti-rollback.
4. Backup/restore creates a distinct security case: an internally consistent backup may represent a valid historical state. Recovery must classify it against an external/protected freshness fact instead of treating consistency as currency.
5. Device cloning creates two copies with apparently valid local history. A local counter does not distinguish original from clone if both are cloned together. Device incarnation or an external authority must participate in continuity.
6. Multi-device quorum can provide external continuity, but it introduces a distributed-consensus/availability problem and cannot be assumed solved merely by having several signatures.
7. The evidence that must survive ordinary mutable-state rollback is therefore the strongest candidate for the true freshness anchor.

## Key distinction
ATOMICITY != ANTI-ROLLBACK.

A journal/WAL can make a transition all-or-nothing after a crash while still allowing an attacker or restore operation to revert the entire durable image to an older, internally consistent state.

Likewise:
AUTHENTICITY != FRESHNESS.
A valid signature on an old root does not prove it is the current root.

## Candidate minimum protected anchor
Conceptually, the protected freshness fact should bind:
- Nexo identity/scope;
- accepted root digest;
- authority epoch/version;
- predecessor/transition identity;
- device incarnation where device-local;
- monotonic freshness value;
- protection against ordinary backup rollback.

Exact mechanism remains OPEN. Candidates requiring further study include hardware-backed monotonic counters, secure elements/TEE-backed rollback-resistant storage, independent multi-device quorum, and external signed checkpoints. No mechanism is selected.

## Recovery invariant
If protected freshness says epoch E is already accepted, an ordinary restored image advertising epoch < E must be classified ROLLBACK/STALE and must not become canonical.

If mutable storage says E but protected anchor says E+1, mutable state is stale/incomplete.

If two devices claim the same authority scope with divergent current roots, do not resolve by timestamp or arrival order; preserve the fork and require an explicit authority/arbitration rule.

## Research implication
SQLite gives a concrete model for crash-atomic state transitions and crash testing, but Nexo additionally needs anti-rollback semantics. SQLite itself does not establish Nexo's external trust-anchor problem. This distinction must remain explicit.

## Code/repository study status
Canonical repo remains snowdenxrp/aldea-ia / main. Current search did not establish a verified existing implementation of the AB104.201 protected-anchor invariant. No implementation claim is made. The next architecture stage must trace actual persistence, recovery, authority/fencing and external-effect boundaries before any property is marked implemented.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

## DO-NOT-REPEAT
- Atomic transaction != anti-rollback.
- Commit marker != current authority.
- Valid signature != freshness.
- Backup consistency != currentness.
- Local mutable counter != rollback-resistant anchor.
- Do not select hardware/quorum/external-anchor mechanism yet.
- Do not infer implementation from planned names or documentation.
- No V21.
- No unsupported formal verification, CI, or fault-injection claims.

## EXACT NEXT ACTION — AB104.202
Study concrete rollback-resistant anchor mechanisms and their failure modes:
1. hardware-backed monotonic counters / rollback-resistant storage;
2. TEE/secure-element semantics and what guarantees are actually exposed;
3. Android/Apple-style anti-rollback patterns as comparative evidence;
4. multi-device quorum and equivocation;
5. backup restore and device replacement;
6. key rotation and recovery after anchor compromise;
7. map each mechanism to Nexo's authority/identity model without selecting one prematurely.

Status: research-only.
