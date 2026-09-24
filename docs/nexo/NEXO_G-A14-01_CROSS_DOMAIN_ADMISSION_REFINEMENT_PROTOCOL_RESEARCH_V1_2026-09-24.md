# NEXO G-A14-01 — Cross-Domain Refinement of Persistence, Currentness and Fencing
## Research + Code Study Delta V1 — 2026-09-24

Status: RESEARCH / CODE STUDY / ADVERSARIAL
No implementation. No SANY/TLC proof.

## 1. Question

Can one abstract EXECUTION_ADMIT transition refine safely when protected state, anti-rollback/currentness anchor, crash recovery and capability issuance live in physically separate mechanisms?

## 2. Evidence studied

Raft explicitly distinguishes a command becoming committed from the client receiving the response. The Raft paper describes the crash-after-commit-before-response case and uses stable client command serial numbers plus stored results to prevent duplicate state-machine execution on retry. This supports the Nexo rule that response delivery is not commit state and that stable logical identity is required across ambiguous retries.

etcd's transaction API provides atomic conditional evaluation and updates inside its key-value state machine, with one revision for the transaction. Its linearizable API semantics rely on Raft consensus. This demonstrates that atomicity is available inside one authoritative domain, not automatically across an unrelated external mechanism.

PostgreSQL 2PC provides a concrete prepared-state protocol. PREPARE TRANSACTION persists prepared state so a later COMMIT PREPARED or ROLLBACK PREPARED can occur after crash/reconnect. PostgreSQL source also shows prepared transaction recovery data can live in WAL and, for longer-lived prepared state, in pg_twophase. The documentation warns that prepared transactions retain resources and should normally be resolved promptly.

PostgreSQL WAL provides roll-forward recovery from a durable log, while targeted recovery can intentionally stop at an earlier WAL point/timeline. Therefore recoverability and integrity do not themselves establish that a recovered state is the current authority lineage.

## 3. Core result

A single abstract transition CAN refine into multiple concrete operations, but only if the concrete protocol exposes all cross-domain uncertainty explicitly.

It is UNSAFE to model:

PROTECTED_STORE_COMMIT
+
ANCHOR_UPDATE
+
CAPABILITY_ISSUE

as if they were one atomic concrete action when they are physically independent.

The abstract transition must therefore refine into a protocol/state machine that includes intermediate states.

## 4. Required abstract/concrete distinction

Abstract:

EXECUTION_ADMIT(operation, effect, context)

Concrete:

1. Validate current context.
2. Establish a protected operation identity.
3. Establish a cross-domain intent/pending record.
4. Coordinate store/anchor according to selected protocol.
5. Resolve or preserve any ambiguity.
6. Only then issue an execution capability.
7. Capability use must revalidate current fence/context at the effect boundary.

A capability must never be issued merely because one participant reports success while another participant's relationship to that success is UNKNOWN.

## 5. New concrete state required

Candidate cross-domain state:

LOCAL_COMMITTED
ANCHOR_COMMITTED
CROSS_DOMAIN_PENDING
CROSS_DOMAIN_UNCERTAIN
CROSS_DOMAIN_VERIFIED
QUARANTINED

These are not user-facing status labels. They are safety-relevant protocol states.

The key transition is:

CROSS_DOMAIN_UNCERTAIN -> CROSS_DOMAIN_VERIFIED

only through an explicit reconciliation protocol satisfying the currentness/binding contract.

No timeout, retry, restart or new operation_id may perform that transition automatically.

## 6. Candidate protocol: durable intent + monotonic anchor + protected state

A promising technology-independent pattern is:

A. Create stable operation_id/effect_key.
B. Persist a protected pending intent containing:
   - operation_id
   - effect_key
   - expected state lineage
   - expected anchor relation
   - VersionSet
   - authority epoch
   - fence
   - recovery lineage
   - required completion relation.
C. Execute the selected store/anchor protocol.
D. Record observed results for each participant.
E. If relation is proven, advance to VERIFIED.
F. If relation cannot be proven, remain UNCERTAIN/QUARANTINED.
G. Only a current verified state may produce the capability required for the external effect.

This does not create magic atomicity. It makes ambiguity explicit and recoverable.

## 7. Store-first attack

Sequence:

STORE COMMIT
→ crash
→ ANCHOR UNKNOWN

Safe result:

CROSS_DOMAIN_UNCERTAIN

Unsafe result:

"store committed, therefore current."

Recovery must determine whether the anchor operation occurred, or establish a new protected recovery lineage that cannot reuse the old authority.

## 8. Anchor-first attack

Sequence:

ANCHOR ADVANCES
→ crash
→ STORE UNKNOWN

Safe result:

ANCHOR_COMMITTED / STORE_UNCERTAIN

It is forbidden to manufacture missing state merely because the anchor is ahead.

The anchor may represent a reserved frontier, not a successful semantic commit.

## 9. Error-after-effect attack

Sequence:

anchor increment request
→ device returns error
→ increment may actually have happened

Safe rule:

do not retry as a new logical effect.

The original operation remains unresolved until the anchor's actual state is reconciled.

This is structurally the same class as an external provider returning an ambiguous outcome.

## 10. Capability issuance boundary

Capability issuance should occur AFTER the protected admission protocol establishes the conditions required for current authority.

Candidate:

PROTECTED_ADMISSION_VERIFIED
→ ISSUE_CAPABILITY
→ EXECUTOR
→ EFFECT_BOUNDARY_REVALIDATE

The final effect boundary still rechecks:
- capability identity;
- operation/effect identity;
- authority epoch;
- fence;
- VersionSet;
- STOP;
- target/context binding;
- expiry/nonce;
- currentness where required.

This protects against capability use after revocation or context change.

## 11. Why capability cannot repair cross-domain uncertainty

Counterexample:

STORE = COMMITTED
ANCHOR = UNKNOWN
CAPABILITY = ISSUED

If the capability layer treats store commitment as sufficient, the system can authorize execution while its anti-rollback witness is unresolved.

Therefore:

CAPABILITY_VALID != CURRENTNESS_VALID.

Likewise:

ANCHOR_VALID != STATE_VALID.

And:

STORE_DURABLE != CROSS_DOMAIN_VERIFIED.

## 12. Crash recovery

Recovery procedure candidate:

RESTART
→ QUARANTINE
→ READ PROTECTED PENDING STATE
→ OBSERVE STORE
→ OBSERVE ANCHOR
→ CHECK LINEAGE
→ CHECK FENCE
→ CHECK STOP
→ CHECK VersionSet
→ RECONCILE CROSS-DOMAIN STATE
→ either VERIFIED / QUARANTINED
→ only VERIFIED may proceed to capability issuance.

A recovered capability cache is never treated as authority evidence.

## 13. Persistence and currentness are different properties

A WAL/log can establish durable history.
A monotonic witness can establish non-regression of one value.
Neither alone proves that the currently loaded semantic state is the state represented by the current witness.

Therefore the required chain remains:

DURABILITY
→ LINEAGE
→ ANCHOR BINDING
→ CURRENTNESS
→ AUTHORITY ADMISSION.

Each arrow is a proof obligation.

## 14. Fencing interaction

Suppose:
- operation A holds fence 41;
- store commits;
- anchor is uncertain;
- authority is revoked;
- recovery acquires fence 42.

Recovery must not finish A under fence 41.

The unresolved A record survives, but its old authority/fence is no longer valid.

This preserves both:
- history;
- current authority separation.

## 15. Migration interaction

A pending cross-domain record can migrate only if migration preserves:
- operation/effect identity;
- pending state;
- state lineage;
- anchor lineage;
- recovery lineage;
- VersionSet compatibility;
- fence/cutover ordering;
- unresolved/unknown semantics.

Representation migration alone is insufficient.

## 16. Code-study implications

Raft's stable command identity and stored result support stable logical operation identity across retry.

etcd's atomic transaction shows that a set of state changes can be linearized when they share the same authoritative transaction domain.

PostgreSQL 2PC shows that prepared state can survive session loss and be resolved later, but it also demonstrates the operational cost of unresolved prepared state.

PostgreSQL WAL/recovery shows that a system can recover to a deliberately selected historical point. Consequently, recovery target selection must never be confused with current authority.

These concrete systems reinforce, rather than replace, Nexo's technology-independent contracts.

## 17. New contracts

PSC-134 — Cross-Domain Protocol Refinement:
A single abstract protected transition may refine into multiple concrete operations only when intermediate uncertainty states are represented and mapped.

PSC-135 — Cross-Domain Pending Identity:
Cross-domain pending state retains stable operation/effect identity until resolved.

PSC-136 — Capability Issuance After Verified Admission:
A capability enabling a safety-relevant effect may be issued only after the required protected admission relation is verified.

PSC-137 — Cross-Domain Uncertainty Preservation:
Uncertainty between protected state and currentness anchor cannot be converted into success by timeout, retry, restart or response interpretation.

PSC-138 — Cross-Domain Recovery:
Recovery must reconcile all required participant states before restoring normal authority.

PSC-139 — Historical Recovery Non-Authority:
A valid recovered historical state does not by itself establish current authority.

PSC-140 — Fenced Cross-Domain Recovery:
Recovery cannot complete a pending operation under an obsolete fence or authority epoch.

## 18. New invariants

INV-GA14-01-134:
Concrete operations refining one protected abstract transition must preserve the abstract transition's safety preconditions across all intermediate states.

INV-GA14-01-135:
CROSS_DOMAIN_UNCERTAIN cannot satisfy current protected admission.

INV-GA14-01-136:
Capability issuance cannot precede the required verified cross-domain admission.

INV-GA14-01-137:
Anchor advancement without corresponding protected state does not authorize creation of the missing state.

INV-GA14-01-138:
Protected state without required currentness-anchor relation cannot satisfy currentness.

INV-GA14-01-139:
A recovered historical state cannot restore previous authority or fence.

INV-GA14-01-140:
A pending operation retains its logical identity across crash, recovery and reconciliation.

INV-GA14-01-141:
A stale fence cannot complete a cross-domain pending transition.

## 19. Adversarial mini-audit

### Attack A
Store succeeds; anchor response lost.

Result: UNCERTAIN, not success.

### Attack B
Anchor succeeds; store response lost.

Result: UNCERTAIN, not missing-state synthesis.

### Attack C
Both independently recover but from different histories.

Result: binding failure; quarantine.

### Attack D
Recovery creates new operation_id.

Result: forbidden substitution; old unresolved identity remains.

### Attack E
Capability cache contains apparently valid old capability.

Result: revalidation against current fence/context required.

### Attack F
Migration copies pending record but loses anchor lineage.

Result: currentness UNKNOWN; no release.

### Attack G
Authority revoked while cross-domain operation pending.

Result: old fence cannot complete it; reconciliation preserves history.

No contradiction found with A01-A14 or previous G-A14-01 deltas.

## 20. Conclusion

The protected admission machine remains viable as an abstract semantic anchor.

But the concrete refinement cannot pretend that physically separate persistence/currentness/capability domains are atomic.

The correct architecture is:

ONE ABSTRACT ADMISSION
→ EXPLICIT CROSS-DOMAIN PROTOCOL
→ UNCERTAINTY-PRESERVING RECOVERY
→ CURRENTNESS VERIFIED
→ CAPABILITY ISSUED
→ EFFECT-BOUNDARY REVALIDATION.

This is stronger than choosing a database or TPM first because it specifies what the mechanism must prove before technology selection.

## 21. Status

Abstract admission machine: DESIGN REFINED.
Cross-domain protocol semantics: DESIGN REFINED.
Cross-domain atomicity: OPEN.
Currentness/anchor mechanism: OPEN.
Capability issuance ordering: DESIGN REFINED.
Crash recovery: DESIGN REFINED.
Migration interaction: DESIGN REFINED.
Concrete technology selection: BLOCKED.
Formal verification: NOT PROVEN.
Implementation: NOT STARTED.

Next research target:
Investigate whether the cross-domain protocol can be reduced to a small finite protocol with mechanically checkable safety invariants, including all store-first/anchor-first crash points, retry ambiguity, recovery ownership, STOP, revocation and capability issuance.
