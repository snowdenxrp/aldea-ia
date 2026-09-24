---- MODULE PG009_CutoverFence ----
EXTENDS Naturals, FiniteSets

CONSTANT Records, Old, New, FencePolicy

ASSUME Records # {} /\ Old # New
ASSUME FencePolicy \in {"BLOCK_WRITES", "INVALIDATE", "CATCH_UP"}

VARIABLES
    phase,
    sourceVersion,
    targetVersion,
    migrated,
    divergence,
    authority,
    epoch,
    journal,
    inflight,
    appliedOps,
    opLedger,
    identityConflicts

vars ==
    <<phase, sourceVersion, targetVersion, migrated, divergence,
      authority, epoch, journal, inflight, appliedOps,
      opLedger, identityConflicts>>

AppliedIds ==
    { op[1] : op \in opLedger }

PayloadFor(id) ==
    { op[2] : op \in opLedger /\ op[1] = id }

Init ==
    /\ phase = "BACKFILLING"
    /\ sourceVersion = [r \in Records |-> 0]
    /\ targetVersion = [r \in Records |-> -1]
    /\ migrated = {}
    /\ divergence = {}
    /\ authority = Old
    /\ epoch = 0
    /\ journal = {}
    /\ inflight = {}
    /\ appliedOps = {}
    /\ opLedger = {}
    /\ identityConflicts = {}

Backfill(r) ==
    /\ r \in Records
    /\ r \notin migrated
    /\ LET id == << "B", r, sourceVersion[r] >>
           payload == sourceVersion[r]
       IN
           /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
           /\ migrated' = migrated \cup {r}
           /\ appliedOps' = appliedOps \cup {id}
           /\ journal' = journal \cup {<<id, payload>>}
           /\ opLedger' = opLedger \cup {<<id, payload>>}
           /\ inflight' = inflight \ {r}
    /\ UNCHANGED <<phase, sourceVersion, divergence, authority, epoch,
                    identityConflicts>>

SourceWrite(r) ==
    /\ r \in Records
    /\ phase \in {"BACKFILLING", "VERIFYING", "CUTOVER_PREPARED"}
    /\ sourceVersion' = [sourceVersion EXCEPT ![r] = @ + 1]
    /\ divergence' = IF r \in migrated
                       THEN divergence \cup {r}
                       ELSE divergence
    /\ UNCHANGED <<phase, targetVersion, migrated, authority, epoch,
                    journal, inflight, appliedOps, opLedger, identityConflicts>>

CatchUp(r) ==
    /\ r \in divergence
    /\ LET id == << "C", r, sourceVersion[r] >>
           payload == sourceVersion[r]
       IN
           /\ IF id \in AppliedIds THEN
                  UNCHANGED <<targetVersion, divergence, appliedOps,
                              journal, opLedger, inflight, identityConflicts>>
              ELSE
                  /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
                  /\ divergence' = divergence \ {r}
                  /\ appliedOps' = appliedOps \cup {id}
                  /\ journal' = journal \cup {<<id, payload>>}
                  /\ opLedger' = opLedger \cup {<<id, payload>>}
                  /\ UNCHANGED <<inflight, identityConflicts>>
    /\ UNCHANGED <<phase, sourceVersion, migrated, authority, epoch>>

ReplaySame(id) ==
    /\ id \in AppliedIds
    /\ \E op \in opLedger : op[1] = id
    /\ UNCHANGED vars

ReplayConflict(id, payload) ==
    /\ id \in AppliedIds
    /\ payload \notin PayloadFor(id)
    /\ identityConflicts' = identityConflicts \cup {id}
    /\ UNCHANGED <<phase, sourceVersion, targetVersion, migrated, divergence,
                    authority, epoch, journal, inflight, appliedOps, opLedger>>

PrepareCutover ==
    /\ phase = "VERIFYING"
    /\ migrated = Records
    /\ divergence = {}
    /\ identityConflicts = {}
    /\ phase' = "CUTOVER_PREPARED"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    authority, epoch, journal, inflight, appliedOps,
                    opLedger, identityConflicts>>

Fence ==
    /\ phase = "CUTOVER_PREPARED"
    /\ phase' = "CUTOVER_FENCED"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    authority, epoch, journal, inflight, appliedOps,
                    opLedger, identityConflicts>>

FenceWriteBlocked(r) ==
    /\ phase = "CUTOVER_FENCED"
    /\ FencePolicy = "BLOCK_WRITES"
    /\ r \in Records
    /\ UNCHANGED vars

FenceWriteInvalidate(r) ==
    /\ phase = "CUTOVER_FENCED"
    /\ FencePolicy = "INVALIDATE"
    /\ r \in Records
    /\ sourceVersion' = [sourceVersion EXCEPT ![r] = @ + 1]
    /\ divergence' = divergence \cup {r}
    /\ phase' = "CUTOVER_PREPARED"
    /\ UNCHANGED <<targetVersion, migrated, authority, epoch,
                    journal, inflight, appliedOps, opLedger,
                    identityConflicts>>

FenceWriteCatchUp(r) ==
    /\ phase = "CUTOVER_FENCED"
    /\ FencePolicy = "CATCH_UP"
    /\ r \in Records
    /\ LET nextVersion == sourceVersion[r] + 1
           id == << "FC", r, nextVersion >>
           payload == nextVersion
       IN
           /\ sourceVersion' = [sourceVersion EXCEPT ![r] = nextVersion]
           /\ IF id \in AppliedIds THEN
                  /\ targetVersion' = targetVersion
                  /\ UNCHANGED <<appliedOps, journal, opLedger,
                                  identityConflicts>>
              ELSE
                  /\ targetVersion' = [targetVersion EXCEPT ![r] = nextVersion]
                  /\ appliedOps' = appliedOps \cup {id}
                  /\ journal' = journal \cup {<<id, payload>>}
                  /\ opLedger' = opLedger \cup {<<id, payload>>}
                  /\ UNCHANGED identityConflicts
    /\ UNCHANGED <<phase, migrated, divergence, authority, epoch, inflight>>

FenceWrite(r) ==
    \/ FenceWriteBlocked(r)
    \/ FenceWriteInvalidate(r)
    \/ FenceWriteCatchUp(r)

CommitCutover ==
    /\ phase = "CUTOVER_FENCED"
    /\ migrated = Records
    /\ divergence = {}
    /\ identityConflicts = {}
    /\ authority = Old
    /\ authority' = New
    /\ epoch' = epoch + 1
    /\ phase' = "CUTOVER"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    journal, inflight, appliedOps, opLedger,
                    identityConflicts>>

Crash(r) ==
    /\ phase \in {"BACKFILLING", "CUTOVER_PREPARED", "CUTOVER_FENCED"}
    /\ r \in Records
    /\ r \notin inflight
    /\ inflight' = inflight \cup {r}
    /\ UNCHANGED <<phase, sourceVersion, targetVersion, migrated,
                    divergence, authority, epoch, journal, appliedOps,
                    opLedger, identityConflicts>>

Recover(r) ==
    /\ r \in inflight
    /\ LET committed ==
           \E op \in opLedger :
              op[1] \in {<< "B", r, sourceVersion[r] >>,
                          << "C", r, sourceVersion[r] >>,
                          << "FC", r, sourceVersion[r] >>}
       IN
           /\ IF committed THEN
                  /\ inflight' = inflight \ {r}
                  /\ UNCHANGED <<phase, sourceVersion, targetVersion, migrated,
                                  divergence, authority, epoch, journal,
                                  appliedOps, opLedger, identityConflicts>>
              ELSE
                  /\ targetVersion' =
                        [targetVersion EXCEPT ![r] = sourceVersion[r]]
                  /\ migrated' = migrated \cup {r}
                  /\ LET id == << "R", r, sourceVersion[r] >>
                         payload == sourceVersion[r]
                     IN
                         /\ journal' = journal \cup {<<id, payload>>}
                         /\ appliedOps' = appliedOps \cup {id}
                         /\ opLedger' = opLedger \cup {<<id, payload>>}
                  /\ inflight' = inflight \ {r}
                  /\ UNCHANGED <<phase, sourceVersion, divergence,
                                  authority, epoch, identityConflicts>>

ToVerifying ==
    /\ phase = "BACKFILLING"
    /\ migrated = Records
    /\ divergence = {}
    /\ phase' = "VERIFYING"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    authority, epoch, journal, inflight, appliedOps,
                    opLedger, identityConflicts>>

Next ==
    \/ \E r \in Records : Backfill(r)
    \/ \E r \in Records : SourceWrite(r)
    \/ \E r \in Records : CatchUp(r)
    \/ \E id \in AppliedIds : ReplaySame(id)
    \/ \E id \in AppliedIds, payload \in Nat : ReplayConflict(id, payload)
    \/ \E r \in Records : Crash(r)
    \/ \E r \in Records : Recover(r)
    \/ ToVerifying
    \/ PrepareCutover
    \/ Fence
    \/ \E r \in Records : FenceWrite(r)
    \/ CommitCutover

Spec == Init /\ [][Next]_vars

InvAuthoritySafety ==
    authority = New => /\ phase = "CUTOVER"
                         /\ migrated = Records
                         /\ divergence = {}
                         /\ identityConflicts = {}

InvEpoch ==
    epoch = 0 \/ epoch = 1

InvOperationIdStability ==
    \A id \in AppliedIds :
        Cardinality(PayloadFor(id)) = 1

InvIdentityConflictBlocks ==
    authority = New => identityConflicts = {}

InvAppliedOpUniqueEffect ==
    \A id \in AppliedIds :
        Cardinality({ op \in opLedger : op[1] = id }) = 1

THEOREM Spec => []InvAuthoritySafety
THEOREM Spec => []InvEpoch
THEOREM Spec => []InvOperationIdStability
THEOREM Spec => []InvIdentityConflictBlocks
THEOREM Spec => []InvAppliedOpUniqueEffect
====
