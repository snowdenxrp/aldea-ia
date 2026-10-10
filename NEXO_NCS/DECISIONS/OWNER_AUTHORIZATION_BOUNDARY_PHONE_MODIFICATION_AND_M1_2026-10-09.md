# NCS — Owner Authorization Boundary: Phone Modification and M1 Implementation — 2026-10-09

Status: OWNER PERMITS NECESSARY PHONE MODIFICATIONS IN PRINCIPLE; SPECIFIC ACTIONS STILL REQUIRE A GROUNDED PLAN AND RISK/REVERSIBILITY DISCLOSURE. M1 CODE IMPLEMENTATION NOT YET AUTHORIZED BY THIS RECORD.

## Owner's clarification

Kevin explicitly stated that if the technical recommendation is to modify his phone for security or Nexo, he has no objection and is willing to proceed. Do not keep the project artificially constrained to avoiding device changes.

## How this authorization must be interpreted

- It authorizes technical investigation and recommendation of justified device modifications.
- It is not blanket consent for any arbitrary change, data wipe, bootloader unlock, root/jailbreak, firmware flash, security downgrade, credential generation, model download, app installation, or irreversible action.
- Before each material intervention, state its purpose, exact change, prerequisites, likely side effects/data-loss risk, reversibility/rollback, and what it proves versus does not prove. Obtain the appropriate explicit confirmation for high-impact/irreversible steps.
- Prefer read-only inspection and reversible, least-privilege changes first. Never ask for passwords, recovery codes, or private credentials in chat.
- Do not confuse modifying the phone with independently establishing a trustworthy Genesis root. A rooted/unlocked or modified device can increase capabilities while weakening security guarantees; evaluate trade-offs rather than assume “more access = more secure.”
- Owner-only constitutional authority remains the governance preference. Technical systems, vendors, witnesses, model providers, and the assistant do not acquire that authority through device setup.

## M1 work authorization status

The owner's willingness to modify the phone removes “avoid all device changes” as a design constraint. It does not by itself authorize repository code changes or model/runtime installation. M1 remains a bounded candidate: read-only text interaction, local inference, no tools/effects, no durable conversation, no remote fallback, and no Genesis/authority path.

## Next action

Continue by preparing a concrete, staged implementation plan:
1. non-invasive inventory of device compatibility and required build prerequisites;
2. smallest buildable Android client boundary and isolated local-inference adapter;
3. explicit network/no-fallback and no-persistence assurance plan;
4. exact dependencies, licenses, model provisioning needs, expected storage/RAM/thermal limits and test criteria;
5. clear separation of reversible preparation from risky/irreversible device changes.

Before touching the device or changing code, verify the actual supported tooling and resource needs. If the environment cannot inspect/build/install Android artifacts directly, say so and give Kevin exact, safe steps rather than implying the action was performed.

No device change, code change, model install, credential, root, commissioning, or protected action is authorized or claimed by this record.
