# Lesson 002 — Isolate project boundaries

## General lesson
Independent systems should not share runtime state or implementation details merely because they live in the same repository.

## Nexo application
Nexo and Lúmina are separate systems. Shared knowledge must be distilled into explicit, reviewed engineering lessons rather than direct imports or shared mutable state.

## Provenance
Engineering lesson distilled from the Lúmina development experience. This file intentionally contains no Lúmina runtime code or state.
