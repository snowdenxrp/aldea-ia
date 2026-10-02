# NEXO AB105 G0 ordering witness v2 — harness extraction blocker

## New finding

The branch-local v2 workflow is not yet an executable corrected path.

Its Python extraction step uses:

\`\`\`
Path("\${GITHUB_WORKSPACE}/.github/workflows/nexo-ab105-g0-ordering-witness.yml")
\`\`\`

inside a single-quoted shell heredoc:

\`\`\`
<<'PY'
\`\`\`

Therefore the shell does not expand \`GITHUB_WORKSPACE\`; Python receives the literal string \`\${GITHUB_WORKSPACE}/...\`.

The script does not use Python's environment lookup, so this is a real workflow-local path-resolution defect before Kafka compilation/execution.

## Epistemic classification

- v2 workflow: NOT VALIDATED AS EXECUTABLE.
- Real broker ordering witness: NOT EXECUTED.
- \`NEXO_ORDER\` evidence: NONE.
- Kafka ordering conclusion: UNKNOWN.
- AB105.116R: unchanged.
- AB105.117R: not created.
- TLC: not rerun.

## Correct conceptual fix

Use Python's environment, e.g. \`Path(os.environ["GITHUB_WORKSPACE"]) / ".github/workflows/..." \`, or remove the intermediate extraction mechanism and place the corrected harness directly in the executable workflow.

Do not reinterpret any zero-run/lookup result as broker evidence.
