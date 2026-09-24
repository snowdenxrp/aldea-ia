---- MODULE NexoMigrationConcurrent ----
EXTENDS Naturals, Sequences

CONSTANTS Records, Old, New

ASSUME Records # {} /\ Old # New

VARIABLES phase, sourceVersion, targetVersion, migrated, divergence,
          appliedOps, authority, epoch, journal, inflight

vars == <<phase, sourceVersion, targetVersion, migrated, divergence,
          appliedOps, authority, epoch, journal, inflight>>

Init ==
    /\ phase = "BACKFILLING"
    /\ sourceVersion = [r \in Records |-> 0]
    /\ targetVersion = [r \in Records |-> -1]
    /\ migrated = {}
    /\ divergence = {}
    /\ appliedOps = {}
    /\ authority = Old
    /\ epoch = 0
    /\ journal = [b \in Records |-> FALSE]
    /\ inflight = {}

Backfill(r) ==
    /\ r \in Records
    /\ r \notin migrated
    /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
    /\ migrated' = migrated \cup {r}
    /\ appliedOps' = appliedOps \cup {<<"B", r, sourceVersion[r]>>}
    /\ journal' = [journal EXCEPT ![r] = TRUE]
    /\ inflight' = inflight \ {r}
    /\ UNCHANGED <<phase, sourceVersion, divergence, authority, epoch>>

SourceWrite(r) ==
    /\ r \in Records
    /\ sourceVersion' = [sourceVersion EXCEPT ![r] = @ + 1]
    /\ IF r \in migrated THEN divergence' = divergence \cup {r}
       ELSE UNCHANGED divergence
    /\ UNCHANGED <<phase, targetVersion, migrated, appliedOps, authority, epoch, journal, inflight>>

CatchUp(r) ==
    /\ r \in divergence
    /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
    /\ divergence' = divergence \ {r}
    /\ appliedOps' = appliedOps \cup {<<"C", r, sourceVersion[r]>>}
    /\ journal' = [journal EXCEPT ![r] = TRUE]
    /\ inflight' = inflight \ {r}
    /\ UNCHANGED <<phase, sourceVersion, migrated, authority, epoch>>

PrepareCutover ==
    /\ phase = "VERIFYING"
    /\ migrated = Records
    /\ divergence = {}
    /\ phase' = "CUTOVER_PREPARED"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence,
                    appliedOps, authority, epoch, journal, inflight>>

CommitCutover ==
    /\ phase = "CUTOVER_PREPARED"
    /\ authority' = New
    /\ epoch' = epoch + 1
    /\ phase' = "CUTOVER"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence, appliedOps, journal, inflight>>

Next ==
    \/ \E r \in Records : Backfill(r)
    \/ \E r \in Records : SourceWrite(r)
    \/ \E r \in divergence : CatchUp(r)
    \/ \E r \in Records : CrashAfterStart(r)
    \/ \E r \in Records : Recover(r)
    \/ PrepareCutover
    \/ CommitCutover

CrashAfterStart(r) ==
    /\ r \in Records
    /\ r \notin migrated
    /\ r \notin inflight
    /\ inflight' = inflight \cup {r}
    /\ phase' = "BACKFILLING"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence, appliedOps, authority, epoch, journal>>

Recover(r) ==
    /\ r \in inflight
    /\ r \in Records
    /\ IF journal[r] THEN
          /\ inflight' = inflight \ {r}
          /\ UNCHANGED <<phase, sourceVersion, targetVersion, migrated, divergence, appliedOps, authority, epoch, journal>>
       ELSE
          /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
          /\ migrated' = migrated \cup {r}
          /\ appliedOps' = appliedOps \cup {<<"RECOVER", r, sourceVersion[r]>>}
          /\ journal' = [journal EXCEPT ![r] = TRUE]
          /\ inflight' = inflight \ {r}
          /\ UNCHANGED <<phase, sourceVersion, divergence, authority, epoch>>

Spec == Init /\ [][Next]_vars

NoUnsafeCutover ==
    authority = New => migrated = Records /\ divergence = {}

THEOREM Spec => []NoUnsafeCutover
====


\* Research finding: after PrepareCutover, SourceWrite remains enabled.
\* Therefore CommitCutover can currently observe stale preconditions.

CutoverFence(r) ==
    /\ phase = "CUTOVER_PREPARED"
    /\ r \in Records
    /\ divergence = {}
    /\ sourceVersion' = sourceVersion
    /\ phase' = "CUTOVER_FENCED"
    /\ UNCHANGED <<targetVersion, migrated, divergence, appliedOps, authority, epoch, journal, inflight>>

SafeCommitAfterFence ==
    /\ phase = "CUTOVER_FENCED"
    /\ migrated = Records
    /\ divergence = {}
    /\ authority' = New
    /\ epoch' = epoch + 1
    /\ phase' = "CUTOVER"
    /\ UNCHANGED <<sourceVersion, targetVersion, migrated, divergence, appliedOps, journal, inflight>>

SafeCutoverInvariant ==
    authority = New => migrated = Records /\ divergence = {}


\* Fence semantics: a late source write must not bypass the consistency boundary.
FenceWriteBlocked(r) ==
    /\ phase = "CUTOVER_FENCED"
    /\ r \in Records
    /\ UNCHANGED vars

FenceWriteInvalidates(r) ==
    /\ phase = "CUTOVER_FENCED"
    /\ r \in Records
    /\ sourceVersion' = [sourceVersion EXCEPT ![r] = @ + 1]
    /\ phase' = "CUTOVER_PREPARED"
    /\ divergence' = divergence \cup {r}
    /\ UNCHANGED <<targetVersion, migrated, appliedOps, authority, epoch, journal, inflight>>

FenceCatchUp(r) ==
    /\ phase = "CUTOVER_FENCED"
    /\ r \in divergence
    /\ targetVersion' = [targetVersion EXCEPT ![r] = sourceVersion[r]]
    /\ divergence' = divergence \ {r}
    /\ appliedOps' = appliedOps \cup {<<"FENCE_CATCHUP", r, sourceVersion[r]>>}
    /\ journal' = [journal EXCEPT ![r] = TRUE]
    /\ UNCHANGED <<sourceVersion, migrated, authority, epoch, phase, inflight>>

NextFence ==
    \/ Next
    \/ \E r \in Records : FenceWriteBlocked(r)
    \/ \E r \in Records : FenceWriteInvalidates(r)
    \/ \E r \in Records : FenceCatchUp(r)
    \/ SafeCommitAfterFence

CutoverSafety ==
    authority = New => phase = "CUTOVER" /\ divergence = {} /\ migrated = Records

THEOREM Spec => []CutoverSafety

\* Design rule: implementations must choose one explicit fence policy;
\* "late write ignored" is forbidden for authoritative source state.
