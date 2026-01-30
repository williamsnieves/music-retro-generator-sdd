# Project rules for Claude agents

## What
Retro music tracker generator focused on patterns, limited channels, and simple synthesis.

## Why
Provide a constrained, predictable way to create retro music for games with reliable playback and export.

## How
- Use Vue 3 + Vite with Radix Vue.
- Implement hexagonal architecture in the frontend.
- Apply SOLID and POLA; avoid cleverness.
- Use design patterns only when they add clear value.
- Audio via Web Audio API; export WAV + JSON.
- No backend unless explicitly required; if needed use Express.js.
- Prefer TDD for components and core logic.
- Unit tests first; follow AAA and parametrized tests when applicable.
- Follow OpenSpec artifacts for requirements and tasks.
- Run `openspec validate <change>` after updating artifacts.
