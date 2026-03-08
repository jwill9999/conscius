# Agent Architecture Overview

This repository defines a layered architecture for AI-assisted
engineering workflows.

The system separates responsibilities into distinct layers.

------------------------------------------------------------------------

## Architecture Layers

Layer 1 --- Beads execution layer\
Layer 2 --- Mulch experience layer\
Layer 3 --- Skills / instruction knowledge layer\
Layer 4 --- Conversation compression layer\
Layer 5 --- Session continuity (SESSION.md)\
Layer 6 --- Context injection hooks\
Layer 7 --- Guardrails & quality gates

------------------------------------------------------------------------

## Layer Responsibilities

Execution --- Beads\
Experience --- Mulch\
Knowledge --- Skills\
Conversation Context --- Compression\
Session Memory --- SESSION.md\
Orchestration --- Hooks\
Validation --- Guardrails

------------------------------------------------------------------------

## Architectural Flow

Skills / Instructions ↓ Session Continuity (SESSION.md) ↓ Conversation
Compression ↓ Beads Task Context ↓ Implementation ↓ Guardrails & Quality
Gates ↓ Task Completion

------------------------------------------------------------------------

## Design Principles

-   modular layers
-   tool independence
-   plugin architecture
-   minimal repository state
-   extensible automation
