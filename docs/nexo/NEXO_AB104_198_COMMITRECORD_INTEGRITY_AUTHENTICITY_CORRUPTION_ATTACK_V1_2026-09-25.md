# NEXO — AB104.198 COMMITRECORD INTEGRITY / AUTHENTICITY / CORRUPTION ATTACK V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Attack the assumption that a durable CommitRecord can be trusted merely because it exists and parses.

Questions:
- How is record integrity detected?
- How is authenticity/authority distinguished from integrity?
- How are sequence/order and predecessor dependencies checked?
- How are truncation and partial writes detected?
- What happens when a record is internally valid but incompatible with surrounding state/history?
- What is the recovery rule when the authoritative record cannot be verified?

## AB104.197 carryover
AB104.197 established:
CommitRecord != permission to repeat.
A valid CommitRecord causes recovery to reconstruct/materialize state; it must not re-execute the original effect.
Candidate recovery:
CommitRecord durable -> verify identity + VersionSet + digest -> reconstruct materialized state -> verify convergence -> mark recovery complete.

This attack does NOT reopen effect replay. It attacks whether the CommitRecord itself is trustworthy enough to drive reconstruction.

## External evidence

### SQLite WAL
SQLite's WAL uses frame checksums and salts. A frame is valid only when its salts match the WAL header and its cumulative checksum verifies over the preceding WAL content. Recovery scans the WAL from beginning to end, stops at end-of-file or the first invalid checksum, and sets mxFrame to the last valid commit frame. This is a concrete example of treating later bytes after an integrity failure as non-authoritative rather than guessing through corruption. SQLite also reconstructs its transient WAL-index from the persistent WAL rather than treating the index as authoritative. [SQLite file format; SQLite WAL format]

SQLite's WAL documentation also illustrates an important distinction: a checksum detects corruption/tampering relative to the checksum chain, but it does not by itself establish that the semantic transaction is authorized for Nexo.

### Append-only transparency logs
RFC 9162 uses Merkle-tree roots and consistency proofs to make append-only history auditable. A consistency proof demonstrates that a newer tree contains the earlier tree as a prefix; inclusion proofs establish that an item belongs to a committed tree. Signed tree heads bind the published root to an authority key. This separates:
1. content integrity,
2. history/append-only consistency,
3. authenticity of the published root.

This is a useful reference model for Nexo history, not a direct requirement to use a Merkle tree.

### Cryptographic hash choice
NIST permits SHA-2 for secure-hash applications and recommends SHA-256 at minimum for interoperability where secure hashing is required. Hashes provide integrity/collision-resistance properties; they do not by themselves prove who authored a record. Authenticity requires an appropriate trust mechanism such as a MAC or digital signature and key-management rules.

## Findings

### 1. Parseable != valid
A CommitRecord must pass structural/schema validation before cryptographic validation, but successful parsing is only the first gate.

A recovery record is admissible only if all required fields are present and canonicalized consistently. Missing optional-vs-required fields, duplicate fields, ambiguous encodings, invalid enum values, impossible lengths, or non-canonical representations must not be silently normalized into a valid historical record.

### 2. Digest integrity != authenticity
A digest can detect accidental corruption or modification only when the verifier already has an independently trusted expected digest/root.

A record containing:
record + digest(record)
does NOT establish who produced the digest if the attacker can replace both.

Therefore Nexo needs a distinction:
- INTEGRITY_VERIFIED: content matches an independently trusted commitment.
- AUTHENTICITY_VERIFIED: commitment/signature/MAC is valid under an authorized trust root/key and accepted epoch.
- AUTHORITY_CURRENT: the signer/key was authorized for this record's scope and generation at the relevant time.

These are separate claims.

### 3. Hash-chain dependency detects history surgery, but is not sufficient alone
A candidate CommitRecord should bind at minimum to:
- record sequence/monotonic index,
- predecessor record identifier/digest,
- CommitRecord schema/version,
- operation_id/effect_identity,
- admission/authority context,
- VersionSet,
- prepared-intent digest,
- resulting-state/materialization digest or equivalent state commitment,
- transaction/commit identifier.

A predecessor digest makes insertion/deletion/reordering detectable when the verifier has a trusted earlier anchor. It does not by itself prevent an attacker who can rewrite the entire history and replace the trust anchor.

### 4. Monotonic sequence numbers are necessary but not sufficient
A sequence number can detect local gaps/reordering only relative to a trusted previous sequence.

Examples:
- expected 41, receive 43 -> GAP/INCOMPLETE, not automatically 43-valid.
- receive 40 after trusted 41 -> REPLAY/STALE.
- receive two different records claiming sequence 41 -> CONFLICT.
- receive sequence 41 with correct predecessor but incompatible state digest -> QUARANTINE.
- receive a syntactically valid record with sequence 42 but no verifiable predecessor 41 -> UNVERIFIED_HISTORY.

A timestamp must not substitute for sequence ordering because trusted time semantics remain an open Nexo issue.

### 5. Truncation must be explicit
A record can be truncated in at least three ways:
A. physically incomplete bytes;
B. complete record payload but missing final commit marker/terminator;
C. complete individual record but missing subsequent records needed to establish the claimed state.

The first two should fail record-integrity/record-completeness validation.
The third is not necessarily corruption; it is an incomplete history/snapshot boundary and must be represented as incomplete/unverified rather than fabricated as the latest committed state.

A length field plus checksum/digest can detect partial record writes. A sequence/predecessor dependency detects missing records between otherwise valid records.

### 6. 'Valid record + incompatible state' is not automatically corruption
Suppose a CommitRecord verifies cryptographically but its claimed resulting state does not match the materialized state.

Possible causes include:
- materialized state is stale;
- materialization was interrupted;
- wrong VersionSet/schema interpretation;
- missing dependent records;
- record is authentic but belongs to another state lineage;
- record was authorized under a superseded authority epoch;
- actual storage corruption outside the CommitRecord.

Therefore the correct first classification is INCONSISTENT/QUARANTINE, followed by lineage and dependency checks. Do not overwrite the record to make it fit the current state.

### 7. A cryptographically valid old record is not necessarily currently authoritative
A valid historical signature/digest proves something about the record, not that the record still grants current authority.

Recovery must separately evaluate:
- record authenticity;
- lineage continuity;
- schema compatibility;
- authority epoch/key validity;
- resource incarnation;
- VersionSet compatibility;
- STOP/revocation/fencing state;
- current recovery incarnation.

A historical CommitRecord can therefore be authentic but non-current.

### 8. Unknown trust root => no authoritative reconstruction
If the CommitRecord cannot be verified against the currently trusted root/key/anchor, recovery must not promote it to authoritative committed state.

Classification:
- VERIFIABLE + compatible -> eligible for reconstruction.
- VERIFIABLE + incompatible -> QUARANTINE.
- INTEGRITY FAILED -> QUARANTINE/CORRUPT HISTORY.
- AUTHENTICITY UNKNOWN -> UNVERIFIED/QUARANTINE; no authority promotion.
- PREDECESSOR UNKNOWN -> INCOMPLETE/UNVERIFIED HISTORY.
- TRUNCATED tail with prior verified prefix -> recover only the verified prefix; do not treat the tail as committed.
- CONFLICTING valid lineages -> QUARANTINE and require explicit arbitration/reconciliation.

No case permits executing the original effect merely because verification failed.

## Candidate verification pipeline

1. Locate trusted recovery anchor.
2. Parse with canonical schema.
3. Validate structural completeness and lengths.
4. Verify record digest/MAC/signature as applicable.
5. Verify sequence and predecessor dependency.
6. Verify lineage/root/epoch compatibility.
7. Verify operation_id/effect_identity binding.
8. Verify VersionSet and prepared-intent digest.
9. Verify materialized-state/result digest or reconstructability contract.
10. Verify authority/revocation/STOP/resource-incarnation constraints applicable to recovery.
11. Classify:
   - VERIFIED_COMMITTED
   - VERIFIED_HISTORICAL_NOT_CURRENT
   - INCOMPLETE_HISTORY
   - CORRUPT
   - AUTHENTICITY_UNVERIFIED
   - CONFLICTING_LINEAGE
   - QUARANTINED
12. Only VERIFIED_COMMITTED may drive authoritative reconstruction.
13. Reconstruction is idempotent materialization, never original-effect execution.
14. After materialization, verify convergence against the CommitRecord commitment.
15. Persist recovery completion as a new recovery fact/record, without rewriting the historical CommitRecord.

## Important attack: compromised storage + compromised materialized state
If an attacker changes both CommitRecord and materialized state but cannot forge the trusted root/signature, verification should fail before reconstruction becomes authoritative.

If an attacker can replace the trusted root/key itself, the problem moves to trust-root continuity. Therefore the trust root/anchor must itself have protected lifecycle semantics. This is not solved by hashing the CommitRecord.

## Important attack: valid alternate history
An attacker may construct a completely self-consistent alternate chain:
C40' -> C41' -> C42'
with internally correct hashes.

If the verifier trusts only the chain's internal hashes, the alternate chain can appear valid.

Therefore Nexo needs an external/independent anchor for the accepted lineage, such as a protected root, signed checkpoint, trusted snapshot anchor, or equivalent authority mechanism. Internal chaining alone is insufficient.

## Important attack: forked recovery histories
Two recoverers may observe:
root R -> C41a
root R -> C41b

Both may be individually validly signed.

This is a conflict, not a choice to make by timestamp or arrival order. Recovery needs a deterministic fork policy and protected authority/claim mechanism. Until the fork is resolved, neither branch should silently become canonical.

## CommitRecord state model

UNSEEN
 -> PARSED
 -> INTEGRITY_VERIFIED
 -> AUTHENTICITY_VERIFIED
 -> LINEAGE_VERIFIED
 -> SEMANTICALLY_COMPATIBLE
 -> RECONSTRUCTION_ELIGIBLE
 -> MATERIALIZED
 -> CONVERGENCE_VERIFIED
 -> RECOVERY_COMPLETE

Failure/ambiguity at any stage must not jump directly to COMMITTED authority.

## New architectural distinction

The research now requires at least four independent evidence dimensions:

1. CONTENT INTEGRITY — bytes/digest are internally consistent with a trusted commitment.
2. PROVENANCE/AUTHENTICITY — record originated from an accepted authority.
3. LINEAGE — record belongs to the accepted commit history and predecessor chain.
4. SEMANTIC COMPATIBILITY — record applies to the current schema/version/state/resource context.

A fifth dimension remains important:
5. CURRENT AUTHORITY — historical validity has not been superseded/revoked/fenced.

This reinforces the existing Nexo rule that provenance, confidence, risk and authority must not be collapsed into one boolean.

## Open questions carried forward
- Exact trust-root lifecycle and rotation/fencing contract.
- Whether Nexo needs hash-chain, Merkle-root, signed checkpoint, or a combination.
- Key compromise/revocation and historical verification semantics.
- Exact canonical serialization for CommitRecord.
- Crash semantics for writing the record plus its final integrity commitment.
- Multi-device/distributed continuity and conflicting valid roots.
- How long historical verification anchors must remain available.
- Formal proof that reconstruction cannot cross from VERIFIED_COMMITTED into effect re-execution.
- Fault-injection verification.

## DO-NOT-REPEAT
- Do not equate a parseable CommitRecord with a trusted CommitRecord.
- Do not equate a digest with authenticity.
- Do not equate an authentic historical record with current authority.
- Do not use timestamps as the sole ordering authority.
- Do not skip missing/truncated predecessors.
- Do not silently select between two valid conflicting histories.
- Do not repair a contradictory materialized state by rewriting historical evidence.
- Do not execute an effect because CommitRecord verification failed.
- Do not treat SQLite's WAL checksums as a complete Nexo security proof.
- Do not implement V21.
- Do not claim formal verification, fault-injection success, or CI PASS without fresh evidence.

## EXACT NEXT ACTION — AB104.199
Attack the trust-anchor problem:
1. root/checkpoint authenticity and rotation;
2. key compromise/revocation;
3. valid-but-superseded roots;
4. two valid conflicting roots;
5. rollback to an older trusted root;
6. cross-device divergent histories;
7. minimum protected anchor needed so a forged/replayed complete history cannot become canonical.

Status remains research-only.
