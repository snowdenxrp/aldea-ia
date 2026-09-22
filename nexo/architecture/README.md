# Nexo Architecture Contract

Dependencies flow inward toward stable contracts. Platform, model and tool implementations must not define Core semantics.

Recommended dependency direction:

Runtime -> Core -> contracts
Models -> Core model contract
Tools -> Core tool contract
Agents -> Orchestrator/Core contracts
Persistence -> Memory/Vault contracts
UI -> Runtime/Core read APIs

No subsystem should silently mutate another subsystem's protected state.
