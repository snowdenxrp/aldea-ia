# G-A14-01 V4 research checkpoint

1. Local observations may be stale.
2. The final protected transition must validate current protected state.
3. Monotonic epochs/revisions provide a way to reject older context.
4. A historical credential is not sufficient authority after its bound context changes.
5. A validity flag alone is unsafe across invalidation followed by revalidation; a lineage or epoch is required.
6. Formal execution is still pending because SANY and TLC are unavailable in the current environment.

Status: design refined; implementation gate remains closed.