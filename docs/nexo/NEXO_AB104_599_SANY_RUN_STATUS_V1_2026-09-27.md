# NEXO AB104.599 — Remote SANY execution observed

Run:
- Workflow: Nexo AB104.598 TLA SANY Gate
- Run ID: 36348601604
- Head SHA: baa1aff6e2fea9184a2bda49430ada59c14d5a01
- Event: pull_request
- Job: sany
- Job ID: 108702709826
- Status observed: QUEUED
- Conclusion: null

This confirms the remote execution route is actually registered by GitHub Actions; it is not merely a hypothetical workflow.

Current evidence:
- SANY has NOT started yet (job remains queued).
- Therefore SANY pass/fail remains UNKNOWN.
- No TLC execution yet.
- No verification claim.

Next:
- Poll the same run/job until the job starts/completes.
- On completion, retrieve job logs and artifact.
- If SANY passes, run TLC using the same pinned tool and exact CFG.
- If SANY fails, preserve the exact diagnostics and correct the model only in a new AB step.