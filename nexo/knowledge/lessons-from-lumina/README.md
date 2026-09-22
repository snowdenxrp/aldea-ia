# Lessons from Lúmina

This directory contains **architecture lessons only** that were learned while developing Lúmina.

## Isolation rule

Nexo does not import Lúmina runtime code, simulation state, UI, models, assets, memories, or project data.

Lúmina remains an independent project. These notes are treated as static engineering knowledge and do not create a runtime dependency.

## What may be recorded here

- testing and regression lessons;
- debugging methodology;
- reliability patterns;
- autonomy/orchestration lessons;
- recovery patterns;
- architecture mistakes worth avoiding;
- observations about long-running simulations.

## What must not be copied here

- Lúmina source modules;
- Lúmina runtime state;
- inhabitant data;
- personal/user data;
- simulation saves;
- visual assets;
- credentials or secrets;
- hidden implementation details that create coupling.

Every lesson should explain the general engineering principle, not reproduce Lúmina code.
