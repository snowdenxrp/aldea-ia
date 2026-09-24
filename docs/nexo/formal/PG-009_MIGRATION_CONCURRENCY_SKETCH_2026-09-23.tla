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
    appliedOps

vars ==
    <<phase, sourceVersion, targetVersion, migrated, divergence,
      authority, epoch, journal, inflight, appliedOps>>

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

Backfill(r) ==
    /\ r \in Records
    /\ r \notin migrated
    /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
    /\ migrated' = migrated \cup {r}
    /\ appliedOps' = appliedOps \cup {<<"B", r, sourceVersion[r]>>}
    /\ journal' = journal \cup {<<"B", r, sourceVersion[r]>>}
    /\ inflight' = inflight \ {r}
    /\ UNCHANGED <<phase, sourceVersion, divergence, authority, epoch>>

SourceWrite(r) ==
    /\ r \in Records
    /\ phase \in {"BACKFILLING", "VERIFYING", "CUTOVER_PREPARED"}
    /\ sourceVersion' = [sourceVersion EXCEPT ![r] = @ + 1]
    /\ divergence' = IF r \in migrated
                       THEN divergence \cup {r}
                       ELSE divergence
    /\ UNCHANGED <<phase, targetVersion, migrated, authority, epoch,
                    journal, inflight, appliedOps>>

CatchUp(r) ==
    /\ r \in divergence
    /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
    /\ divergence' = divergence \ {r}
    /\ appliedOps' = appliedOps \cup {<<"C", r, sourceVersion[r]>>}
    /\ journal' = journal \cup {<<"C", r, sourceVersion[r]>>
    }
    /\ UNCHANGED <<phase, sourceVersion, migrated, authority, epoch, inflight>>

PrepareCutover ==
    /\ phase = "VERIFYING"
    /\ migrated = Records
    /\ divergence = {}
    /\ phase' = "CUTOVER_PREPARED"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    authority, epoch, journal, inflight, appliedOps>>

Fence ==
    /\ phase = "CUTOVER_PREPARED"
    /\ phase' = "CUTOVER_FENCED"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    authority, epoch, journal, inflight, appliedOps>>

FenceWrite(r) ==
    /\ phase = "CUTOVER_FENCED"
    /\ r \in Records
    /\ IF FencePolicy = "BLOCK_WRITES" THEN
          UNCHANGED vars
       ELSE IF FencePolicy = "INVALIDATE" THEN
          /\ sourceVersion' = [sourceVersion EXCEPT ![r] = @ + 1]
          /\ divergence' = divergence \cup {r}
          /\ phase' = "CUTOVER_PREPARED"
          /\ UNCHANGED <<targetVersion, migrated, authority, epoch,
                          journal, inflight, appliedOps>>
       ELSE
          /\ sourceVersion' = [sourceVersion EXCEPT ![r] = @ + 1]
          /\ targetVersion' = [targetVersion EXCEPT ![r] = @ + 1]
          /\ appliedOps' = appliedOps \cup
                {<<"FC", r, sourceVersion[r] + 1>>}
          /\ journal' = journal \cup
                {<<"FC", r, sourceVersion[r] + 1>>}
          /\ UNCHANGED <<phase, migrated, divergence, authority, epoch,
                          inflight>>

CommitCutover ==
    /\ phase = "CUTOVER_FENCED"
    /\ migrated = Records
    /\ divergence = {}
    /\ authority' = New
    /\ epoch' = epoch + 1
    /\ phase' = "CUTOVER"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    journal, inflight, appliedOps>>

Crash(r) ==
    /\ phase \in {"BACKFILLING", "CUTOVER_PREPARED", "CUTOVER_FENCED"}
    /\ r \in Records
    /\ r \notin inflight
    /\ inflight' = inflight \cup {r}
    /\ UNCHANGED <<phase, sourceVersion, targetVersion, migrated,
                    divergence, authority, epoch, journal, appliedOps>>

Recover(r) ==
    /\ r \in inflight
    /\ IF <<r, sourceVersion[r]>> \in
           {op[1..2] : op \in journal} THEN
          /\ inflight' = inflight \ {r}
          /\ UNCHANGED <<phase, sourceVersion, targetVersion, migrated,
                          divergence, authority, epoch, journal, appliedOps>>
       ELSE
          /\ targetVersion' =
                [targetVersion EXCEPT ![r] = sourceVersion[r]]
          /\ migrated' = migrated \cup {r}
          /\ journal' = journal \cup
                {<<"R", r, sourceVersion[r]>>}
          /\ appliedOps' = appliedOps \cup
                {<<"R", r, sourceVersion[r]>>}
          /\ inflight' = inflight \ {r}
          /\ UNCHANGED <<phase, sourceVersion, divergence, authority,
                          epoch>>

ToVerifying ==
    /\ phase = "BACKFILLING"
    /\ migrated = Records
    /\ divergence = {}
    /\ phase' = "VERIFYING"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    authority, epoch, journal, inflight, appliedOps>>

Next ==
    \/ \E r \in Records : Backfill(r)
    \/ \E r \in Records : SourceWrite(r)
    \/ \E r \in Records : CatchUp(r)
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

InvEpoch ==
    epoch = 0 \/ epoch = 1

THEOREM Spec => []InvAuthoritySafety
THEOREM Spec => []InvEpoch
====
