# NEXO — AB104.199 TRUST-ANCHOR CONTINUITY / ROOT ROTATION / ROLLBACK ATTACK V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Continue AB104.198 by attacking the trust anchor itself.

Questions:
- What makes a root/checkpoint authoritative rather than merely self-consistent?
- How can root/key rotation avoid silently accepting an attacker-controlled replacement?
- What happens after key compromise/revocation?
- Can a valid but superseded root authorize reconstruction?
- How is rollback to an older trusted root detected?
- What happens when two devices hold individually valid but divergent histories?
- What minimum protected anchor prevents a forged/replayed complete history from becoming canonical?

## AB104.198 carryover
CommitRecord != permission to repeat.
A verified durable CommitRecord may drive idempotent reconstruction/materialization; it never authorizes re-execution of the original effect.

AB104.198 established five independent evidence dimensions:
1. CONTENT INTEGRITY
2. PROVENANCE/AUTHENTICITY
3. LINEAGE
4. SEMANTIC COMPATIBILITY
5. CURRENT AUTHORITY

AB104.199 attacks the anchor that makes lineage and current authority meaningful.

## External research

### TUF: root metadata, rollback, freeze and compromise
The Update Framework is a strong reference model because it explicitly separates trust in root metadata from other metadata roles. Root metadata identifies trusted keys and signature thresholds for other roles. Snapshot metadata binds the versions/hashes of metadata into a consistent repository view, while Timestamp metadata points to the current snapshot and expires frequently.

TUF explicitly considers rollback and freeze attacks, key compromise, and the fact that trust should not be granted forever or equally to every role. Its documentation states that compromised keys must be revoked/replaced, and that root compromise is special: if a threshold of root keys is compromised, the root metadata must be re-issued out of band. This is important for Nexo because an anchor cannot necessarily repair itself using only the compromised channel.

TUF therefore suggests a distinction between:
- bootstrap trust anchor;
- current root metadata;
- delegated signing authority;
- freshness/version state;
- explicit key replacement;
- recovery path when the root itself is compromised.

This is a reference pattern, not a Nexo technology decision.

### TUF: rollback is not only a signature problem
A signed old root can remain cryptographically valid while being unacceptable as the current root. TUF's update process checks root version progression and rejects rollback to an older trusted root. This demonstrates that authenticity and freshness/currentness are separate predicates.

A 2022 source-code audit of TUF also documented an ambiguity in the root-update procedure around equal/lower root versions. The lesson for Nexo is not that TUF is unsafe; it is that even a mature security specification needs explicit transition semantics and implementation audits.

### TUF: consistent snapshot as an anti-mixing boundary
TUF's Snapshot metadata is designed to prevent an attacker from combining metadata from different repository states and presenting a mixed view. For Nexo this maps conceptually to a recovery boundary: a valid record from one history must not be combined with dependencies from another history merely because each item verifies individually.

### Certificate Transparency: signed roots plus consistency proofs
RFC 9162 provides another reference pattern: a signed tree head binds a tree root to an authority key, while Merkle consistency proofs establish that a later tree contains an earlier tree. This separates:
- integrity of the committed structure,
- continuity/append-only relationship,
- authenticity of the published root.

The RFC also notes a remaining class of problem: a log can present inconsistent views to different clients, so consistency across observers requires additional auditing/sharing. For Nexo multi-device continuity, this means a signed root alone does not automatically solve equivocation between devices.

### NIST key management
NIST key-management guidance treats trust anchors as authoritative entities whose trust is assumed rather than derived from the chain being verified. It also treats revocation as a mechanism for terminating authorized use before a key's normal end of life, including emergency revocation after suspected compromise.

The implication for Nexo is that trust-root lifecycle must be protected outside the data being authorized. A CommitRecord cannot prove the legitimacy of the root that is being used to validate that same CommitRecord.

## Findings

### 1. The trust anchor is a different security object
A root/checkpoint is not just another CommitRecord.

If:
root R -> CommitRecord C41 -> C42

and the attacker can replace R, then perfect verification of C41/C42 does not recover canonical history. The verifier has proven consistency with the attacker's root.

Therefore the minimum trust model requires an anchor whose authority is established independently of the history it validates.

### 2. Root rotation must itself be authenticated
A new root R2 must not become trusted merely because:
- R2 is signed;
- R2 has a higher sequence;
- R2 is newer by timestamp;
- R2 arrives first.

The transition R1 -> R2 needs an independently verifiable authorization rule.

Candidate evidence dimensions:
- previous-root binding;
- new-root identity/version;
- explicit replacement/revocation set;
- required signature threshold;
- valid transition epoch;
- protected bootstrap/current anchor;
- resource/device scope.

Exact Nexo threshold and storage mechanism remain OPEN.

### 3. Higher sequence does not automatically mean higher authority
A forged root can carry an arbitrarily high sequence number.

Therefore:
sequence monotonicity = anti-rollback evidence,
not
sequence monotonicity = authority.

A candidate root with sequence 900 must still be rejected if its transition from the accepted root cannot be authenticated.

### 4. Key compromise changes the problem class
If a non-root signing key is compromised, a protected root can revoke/replace it while preserving the root lineage.

If the root key itself is compromised, ordinary self-validation becomes insufficient. A compromised root can sign a new root that revokes the legitimate key and installs the attacker's key.

Therefore Nexo needs a separate root-compromise recovery path. Possible reference patterns include:
- threshold root keys;
- offline/independent root authority;
- out-of-band recovery anchor;
- hardware-protected or separately stored recovery root;
- multi-device quorum/authority;
- previously pinned immutable anchor plus explicit rotation proof.

No choice is made yet.

### 5. Valid-but-superseded roots must remain historically verifiable
A root R1 can remain cryptographically valid after R2 becomes current.

That does NOT mean R1 can authorize new current recovery.

Required distinction:
- HISTORICALLY_VALID
- CURRENT_ROOT
- SUPERSEDED_ROOT
- REVOKED/COMPROMISED
- UNVERIFIED_ROOT
- CONFLICTING_ROOT

Historical validation may be required to audit old CommitRecords, while current authority must use the accepted root/epoch.

### 6. Rollback must be detected even when the old root is perfectly valid
Attack:
device has accepted R5;
attacker supplies valid R3 and a complete R3-consistent history.

If the device accepts R3 merely because its signatures verify, the attacker has performed a rollback without forging cryptography.

Therefore the verifier needs persistent evidence of the latest accepted anchor/root epoch, or an equivalent protected freshness mechanism.

Important distinction:
- old root signature valid -> historical authenticity;
- old root below protected current epoch -> stale/rollback;
- old root above current epoch but transition unverified -> untrusted;
- equal epoch with different root identity -> conflict.

### 7. Two individually valid roots can create a fork
Suppose:
Device A: R7a -> C100a
Device B: R7b -> C100b

Both roots can be correctly signed under a previously valid authority, yet disagree.

This is not solved by timestamp, arrival order, or local preference.

Nexo needs explicit fork semantics:
- detect conflicting root identities for the same authority epoch/scope;
- preserve both evidence branches;
- do not silently merge;
- do not silently pick the branch with the larger sequence;
- enter CONFLICT/QUARANTINE unless a protected arbitration rule exists.

### 8. Cross-device divergence is a continuity problem, not only a storage problem
If Nexo is intended to preserve one identity across devices, each device cannot independently become the canonical authority after offline operation.

A device may hold:
- a valid historical root;
- a valid newer root unknown to another device;
- a valid conflicting root;
- an incomplete tail.

These states require explicit merge/reconciliation semantics.

Candidate invariant:
No device may promote a new canonical root solely from local evidence unless the root-transition authority is satisfied.

### 9. The minimum protected anchor
Research now narrows the minimum conceptual requirement to:

A protected anchor A that is:
1. independently trusted at bootstrap;
2. bound to a unique Nexo authority/identity and scope;
3. monotonic/freshness-aware;
4. capable of authenticating root transitions;
5. protected against ordinary history rewrite;
6. retained sufficiently long to reject rollback;
7. able to distinguish superseded/revoked roots;
8. usable during recovery when ordinary history is partially unavailable.

This does NOT yet determine whether A is:
- a hardware-backed key;
- a threshold key set;
- an immutable genesis checkpoint;
- a signed checkpoint stored on multiple independent devices;
- a combination.

That remains an architecture decision after research, not an implementation decision now.

## Candidate root-state machine

UNSEEN_ROOT
 -> STRUCTURALLY_VALID
 -> SIGNATURE_VALID
 -> TRANSITION_AUTHENTICATED
 -> FRESHNESS_VALID
 -> SCOPE_VALID
 -> CURRENT_ROOT

Historical side states:
CURRENT_ROOT -> SUPERSEDED_ROOT
CURRENT_ROOT -> REVOKED_ROOT
CURRENT_ROOT -> COMPROMISED_ROOT
CURRENT_ROOT -> CONFLICTING_ROOT

Failure/ambiguity:
UNVERIFIED_ROOT / ROLLBACK / CONFLICT / QUARANTINED

No state transition may silently elevate an unverified or stale root to current authority.

## Code/repository study

The canonical repository is snowdenxrp/aldea-ia, main. The latest verified persistence chain remains:
AB104.198 research commit 4d5e79d100942421275785315e95e9d47ab98046
AB104.198 continuity checkpoint 5c99462efc812afc7e835bb8f638f4968bdd4d51

The repository inspection confirms that the current AB104.198 material persisted in main is research/checkpoint documentation, not a claimed implementation of the trust-anchor model. The inspected continuity record explicitly keeps implementation/formal verification/fault-injection as not performed. No code change is being made in this step.

Important code-audit rule carried forward:
Do not infer a security property from the existence of a type, field, helper, or documentation name. The property must be traced through the actual read/write/verification boundary and, later, exercised by evidence. This is especially important for any future root, epoch, key, checkpoint, or recovery implementation.

Current code-study status for AB104.199:
- repository identity and latest persistence verified;
- prior AB104.198 research file read from canonical main;
- no trust-anchor implementation is being asserted;
- exact implementation mapping remains PENDING until the clean architecture stage.

## Attack matrix

A. Attacker replaces CommitRecord only
Expected: integrity/authenticity/lineage checks fail.

B. Attacker replaces CommitRecord and digest
Expected: independent anchor/signature check prevents authority promotion.

C. Attacker replaces complete history and root together
Expected: only independent protected anchor continuity can detect this.

D. Attacker replays old valid root
Expected: protected freshness/epoch state classifies ROLLBACK/STALE.

E. Attacker presents valid new root without valid transition
Expected: UNVERIFIED_ROOT; no canonical promotion.

F. Root key compromised
Expected: ordinary root-signed replacement is insufficient; separate recovery authority is required.

G. Two valid roots for same epoch/scope
Expected: CONFLICT/QUARANTINE; no timestamp/arrival tie-break.

H. Device A and B have divergent valid roots
Expected: preserve evidence and require explicit continuity/arbitration semantics.

I. Device loses its newest anchor but retains old valid root
Expected: old root remains HISTORICALLY_VALID but cannot silently become CURRENT_ROOT if protected freshness says a newer root was accepted.

## Open questions carried forward

- Exact bootstrap trust-anchor storage and protection.
- Root rotation threshold and transition grammar.
- Emergency root compromise recovery.
- Whether authority epochs are global, per-device, per-resource, or layered.
- How a new device receives the current root without allowing rollback.
- How multiple devices prove they share one canonical identity.
- How to distinguish legitimate offline branches from equivocation.
- How long superseded anchors must be retained.
- Whether a signed checkpoint, Merkle root, hash chain, or combination is required.
- Crash consistency between root acceptance and durable freshness state.
- Formal proof that recovery cannot promote a stale root into effect authority.
- Fault-injection scenarios for root rollback, torn writes, key compromise, and split-brain.

## Historical residuals MUST remain visible

AB50 -> AB58:
- TERNARY_MATH_GAP = FOUND
- TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
- TERNARY_PAA_COLLISION = UNKNOWN
- EVENTDAG_CLOSURE = PARTIAL
- RECONSTRUCTION = BOUNDED_ONLY
- SEMANTIC_FREEZE = NOT_DECLARED
- FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

These are not closed by AB104.199.

## DO-NOT-REPEAT

- Do not treat a signed root as automatically current.
- Do not treat a higher sequence as automatically authoritative.
- Do not use timestamps as sole freshness/ordering authority.
- Do not allow a root to authenticate its own replacement without an independently defined transition rule.
- Do not accept an older valid root over a protected newer root.
- Do not silently choose between two valid roots.
- Do not merge divergent device histories without explicit evidence.
- Do not rewrite history to resolve a root conflict.
- Do not execute an external effect during root uncertainty.
- Do not claim the minimum anchor is already implemented.
- Do not implement V21.
- Do not claim formal verification, fault-injection success, or CI PASS without fresh evidence.

## EXACT NEXT ACTION — AB104.200

Attack the root-transition crash boundary and freshness persistence:
1. crash between accepting R(n+1) and persisting the new freshness anchor;
2. crash after persisting freshness but before persisting root metadata;
3. torn/partial root writes;
4. replay after power loss;
5. two recoverers racing to install a new root;
6. device restore from an older backup;
7. cloning one device state to another;
8. determine the minimum atomic durable tuple required to prevent rollback or split-brain after crash.

Status remains research-only.
