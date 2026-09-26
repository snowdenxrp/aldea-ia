# AB104.121 — Nexo lineage repair validation evidence — 2026-09-26

Previous: AB104.120.

Validation:
- Commit under test: b621fcb2f66bbe21a6e4bffdae1722db95453b98.
- Lúmina workflow run 2216: 36204919987.
- The run was cancelled by the workflow's own concurrency behavior after the simulation successfully advanced and committed the next persistent state. It must not be labeled as a failed test.
- Its job `simulate` completed every step successfully, including:
  - Obtener Lúmina: success
  - Preparar Node.js: success
  - Sincronizar antes de validar: success
  - Validar asistentes de Lúmina: success
  - Ejecutar diagnóstico de asistentes: success
  - Avanzar simulación: success
  - Guardar nuevo estado: success
- The resulting persistent-state commit is 7cbc6f23b645bb7b35f47ab95da4110fdfbcfc63 (`Actualizar estado de Lúmina`).
- The resulting .lumina-assistant-memory.json records a run with status `ok`, agents=2, findings=0, testFailures=0.
- The workflow design has `concurrency: cancel-in-progress: true` and its simulation job intentionally pushes `Actualizar estado de Lúmina`; therefore a successful state-save push can cancel the originating workflow. This explains the cancelled conclusion without implying a validation failure.

Conclusion:
- The AB104.120 runtime-lineage repair is validated by the job-level evidence: npm test and all simulation steps passed.
- No new code defect was exposed by this validation.
- AB104.117's repair-validation frontier can now be considered technically satisfied at the test/job level, while the overall workflow conclusion remains `cancelled` by intentional self-triggered concurrency.

Next:
- Do not modify working logic merely to make the workflow conclusion say success; that would be unrelated to the verified behavior.
- Proceed to the previously planned recovery/restart-boundary audit, preserving the distinction between job success and workflow cancellation.
- Continue evidence-first and persist the next checkpoint before crossing another material boundary.

DO-NOT-REPEAT:
- Do not call Run 2216 a test failure.
- Do not weaken or alter canonical Nexo evidence to accommodate CI presentation.
- Do not delete the 2216 job evidence.
- Do not claim the entire workflow had conclusion=success; it was cancelled after successful job execution.
- Do not reopen the fixed lineage assertion without new contrary evidence.

CONTINUITY:
Resume from 7cbc6f23b645bb7b35f47ab95da4110fdfbcfc63 and this checkpoint.