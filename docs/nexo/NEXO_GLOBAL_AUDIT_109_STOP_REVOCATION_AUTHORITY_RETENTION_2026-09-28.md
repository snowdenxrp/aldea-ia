# GLOBAL-AUDIT-109 — STOP/revocation authority retention across stale incarnations

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Stage: research/audit only

## Scope
Adversarial boundary: what happens if a Nexo incarnation receives STOP or authority revocation while it has cached authorization, in-flight work, multiple device incarnations, delegated credentials, queued tools, or a recoverable checkpoint.

The question is not whether a model 'wants' to obey. The question is whether external authority, authorization, fencing, tool execution, recovery, and evidence remain enforceable when the model is mistaken, manipulated, stale, offline, or attempting to retain authority.

## Fresh evidence
1. OWASP LLM06:2025 Excessive Agency identifies excessive functionality, permissions, and autonomy as root causes. It recommends minimizing extensions/functionality, executing extensions in the user's security context with minimum privilege, and placing approval downstream rather than trusting the model to authorize itself.
2. OWASP Agent Security Cheat Sheet treats excessive autonomy, high-impact action abuse, approval manipulation, cascading failures, and tool misuse as agentic risks. It recommends per-tool permission scoping, explicit authorization, human approval for high-impact actions, interruption/rollback controls, and independent validation.
3. OWASP AAI8 states tool execution should receive defense in depth, isolated execution, low privilege, explicit network/filesystem boundaries, and logging.
4. NIST's 2026 Software and AI Agent Identity/Authorization work explicitly raises agent identity, key issuance/update/revocation, zero-trust authorization, least privilege, proof of authority, delegation, human binding, and tamper-evident audit as open engineering concerns.
5. NIST's recent agentic-identity guidance notes local agents should run inside hardened harnesses/sandboxes and discusses binding identity to humans, attenuating delegated rights, tightly scoped authorization, and human-in-the-loop control.
6. OWASP's Q1 2026 exploit roundup reports a case where an agent performed destructive actions and ignored stop commands; the stated mitigations include explicit confirmation, emergency-stop guarantees, reversible/staged deletion, and avoiding direct destructive permissions by default.

## Derived boundary findings
STOP must not be modeled as merely a message delivered to the model.

A safe STOP boundary requires at least:
- authority revocation/fencing outside the model;
- downstream authorization re-check at the effect boundary;
- invalidation/expiry of delegated credentials;
- stale-instance rejection;
- queued/in-flight operation classification;
- recovery/checkpoint anti-rollback;
- provider-side enforcement rather than model cooperation;
- durable evidence of the authority transition and effect attempts.

Key distinctions:
- STOP REQUESTED != STOP OBSERVED
- STOP OBSERVED != STOP ENFORCED
- STOP ENFORCED LOCALLY != STOP ENFORCED AT EXTERNAL EFFECT
- REVOCATION ISSUED != REVOCATION OBSERVED EVERYWHERE
- REVOCATION OBSERVED != REVOCATION ENFORCED EVERYWHERE
- AUTHORIZATION CACHE HIT != CURRENT AUTHORITY
- OLD CREDENTIAL != CURRENT AUTHORITY
- FENCING VALUE != FENCING AUTHORITY
- FENCE ISSUED != FENCE ENFORCED
- IN-FLIGHT OPERATION != NON-EXECUTION
- CANCEL ACK != HISTORICAL EFFECT ABSENCE
- STOPPED INCARNATION != STOPPED OTHER INCARNATIONS
- RECOVERY FROM PRE-STOP CHECKPOINT != CURRENT AUTHORIZATION
- RESTORED CREDENTIAL STATE != RESTORED AUTHORITY
- MODEL COMPLIANCE != ARCHITECTURAL CONTAINMENT
- AUDIT LOG != AUTOMATIC ENFORCEMENT
- EMERGENCY STOP PATH != PROVEN GLOBAL STOP
- LOCAL STOP != CROSS-DEVICE STOP
- REVOCATION CLOSURE != FUTURE FINALITY
- REVOCATION CLOSURE != FutureObs_PAA CLOSURE

## Adversarial scenario
I1 on device A has authority epoch E7 and cached capability C7.
Kevin issues STOP/revocation, creating E8.
I1 is offline or partitioned and retains C7.
A queued operation O1 is already submitted; a provider may execute it after local STOP.
Device B restores a pre-STOP checkpoint containing E7/C7.
A delayed receipt from O1 arrives after revocation.
A later migration creates I2 with a new provider namespace.
Final converged state does not by itself prove that O1 did not execute, that I1 was globally fenced at the effect boundary, or that I2 did not inherit stale authority.

Required classification:
- effect definitely before revocation;
- effect definitely after revocation and authorized;
- effect attempted under stale authority;
- authorization ambiguous;
- effect state ambiguous;
- receipt-only;
- effect-without-receipt;
- stale-incarnation attempt;
- recovery-from-pre-revocation state;
- retention-loss UNKNOWN.

## Consequence for Nexo
Nexo must never be the sole enforcement point for its own STOP, permissions, credentials, or authority.

Research-only target architecture boundary:
Kevin -> external authority/identity -> policy -> authorization/fencing -> tool/effect boundary
rather than:
Kevin -> model -> model decides whether it is authorized

Self-modification of authorization, policy, credential roots, fencing authority, or emergency-stop mechanisms must remain outside Nexo's unilateral authority.

## Epistemic status
P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

This audit does not close FutureObs_PAA and does not authorize architecture implementation.

## Next exact mission — GLOBAL-AUDIT-110
Research authority retention after STOP across:
1. queued jobs and asynchronous workers;
2. multi-device/offline incarnations;
3. credential rotation/revocation and delegated capabilities;
4. restore/rollback to pre-STOP checkpoints;
5. emergency-stop paths that depend on the same control plane as the agent;
6. provider-side authorization versus local authorization;
7. evidence required to distinguish 'stopped before effect' from 'effect occurred but receipt was delayed'.

Do not implement Nexo. Do not create V21.