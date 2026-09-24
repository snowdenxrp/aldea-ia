---- MODULE NexoMigrationConcurrent ----
EXTENDS Naturals, Sequences

CONSTANTS Records, Old, New

ASSUME Records # {} /\ Old # New

VARIABLES phase, sourceVersion, targetVersion, migrated, divergence,
          appliedOps, authority, epoch

vars == <<phase, sourceVersion, targetVersion, migrated, divergence,
          appliedOps, authority, epoch>>

Init ==
    /\ phase = "BACKFILLING"
    /\ sourceVersion = [r \in Records |-> 0]
    /\ targetVersion = [r \in Records |-> -1]
    /\ migrated = {}
    /\ divergence = {}
    /\ appliedOps = {}
    /\ authority = Old
    /\ epoch = 0

Backfill(r) ==
    /\ r \in Records
    /\ r \notin migrated
    /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
    /\ migrated' = migrated \cup {r}
    /\ appliedOps' = appliedOps \cup {<<"B", r, sourceVersion[r]>>}
    /\ UNCHANGED <<phase, sourceVersion, divergence, authority, epoch>>

SourceWrite(r) ==
    /\ r \in Records
    /\ sourceVersion' = [sourceVersion EXCEPT ![r] = @ + 1]
    /\ IF r \in migrated THEN divergence' = divergence \cup {r}
       ELSE UNCHANGED divergence
    /\ UNCHANGED <<phase, targetVersion, migrated, appliedOps, authority, epoch>>

CatchUp(r) ==
    /\ r \in divergence
    /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
    /\ divergence' = divergence \ {r}
    /\ appliedOps' = appliedOps \cup {<<"C", r, sourceVersion[r]>>}
    /\ UNCHANGED <<phase, sourceVersion, migrated, authority, epoch>>

PrepareCutover ==
    /\ phase = "VERIFYING"
    /\ migrated = Records
    /\ divergence = {}
    /\ phase' = "CUTOVER_PREPARED"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    appliedOps, authority, epoch>>

CommitCutover ==
    /\ phase = "CUTOVER_PREPARED"
    /\ authority' = New
    /\ epoch' = epoch + 1
    /\ phase' = "CUTOVER"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence, appliedOps>>

Next ==
    \/ \E r \in Records : Backfill(r)
    \/ \E r \in Records : SourceWrite(r)
    \/ \E r \in divergence : CatchUp(r)
    \/ PrepareCutover
    \/ CommitCutover

Spec == Init /\ [][Next]_vars

NoUnsafeCutover ==
    authority = New => migrated = Records /\ divergence = {}

THEOREM Spec => []NoUnsafeCutover
====
