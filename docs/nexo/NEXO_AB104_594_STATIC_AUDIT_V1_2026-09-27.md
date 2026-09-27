# NEXO AB104.594 — START vs CURRENT audit

TLA source: 339ee2bf8d25e22a3f511bbfa0efc3fc8b58ceda
CFG: c71ca26ff9b7226ba358a4fc7326f1eb48dc1393

Static correction:
- Execute requires authority/fence/incarnation validity at START.
- After EXECUTING, current authority/fence may change without rewriting the historical outcome.
- Outcome retains the bound incarnation.
- New compensation still requires current authority.
- Historical AB104.589/593 artifacts remain untouched.

Research alignment:
TLA+ SANY is the parser/semantic analyzer and TLC is the explicit-state model checker. Official tooling requires Java 11+ and packages both in tla2tools.jar. citeturn0search0turn0search3

Static audit result:
The previous retroactive authority/fence overconstraint is removed.
No TLC/SANY execution has been performed in this environment.

Important remaining semantic boundary:
The current model still has a deliberately bounded single-effect abstraction and does not yet model provider identity, EffectID, dependency graph, multi-provider participants, or cross-domain fencing. Therefore even a future TLC pass would verify only this bounded model, not the complete Nexo external-effect architecture.

Next exact step:
AB104.595 — perform a pre-SANY operator/transition audit of the AB104.594 artifact, then pin the tool artifact and run SANY if the execution environment permits.