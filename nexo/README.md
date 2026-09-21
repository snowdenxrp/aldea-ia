# Nexo Core

Nexo is the orchestration layer planned for the Lúmina project. The first milestone is a reliable agent loop around existing models and developer tools.

## v0.1

- persistent memory with explicit namespaces
- project and task state
- deterministic task planning
- injected tool adapters
- observation, verification and recovery
- append-only event history
- no secrets in client-side state

Target loop: observe -> plan -> act -> verify -> recover/replan -> record.

The core is provider-agnostic. GitHub, Vercel, model APIs, filesystem access and image analysis are adapters.