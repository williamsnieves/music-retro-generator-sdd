## What
Retro music tracker generator focused on patterns, limited channels, and simple synthesis.

## Why
Enable rapid creation of retro-style music compatible with games, using a constrained and predictable workflow.

## How
- Follow OpenSpec artifacts as the source of truth.
- Use Vue 3 + Vite with Radix Vue.
- Implement a hexagonal frontend architecture applying SOLID and POLA.
- Use design patterns only when they add clear value.
- Audio via Web Audio API; export WAV + JSON.
- No backend unless explicitly required; if needed use Express.js.
- Default to TDD with unit tests using AAA and parametrization when applicable.

## Workflow (OpenSpec)
- Validate changes with `openspec validate <change>`.

## Tech stack
- Frontend: Vue 3 + Vite
- UI: Radix Vue
- Audio: Web Audio API
- Export: WAV (audio) + JSON (song data)
- Backend: none for now; if needed later use Express.js

## Architecture
- Hexagonal architecture in frontend
- Apply SOLID and POLA
- Use design patterns only when they add clear value

## Testing
- Default to TDD for components and core logic
- Prefer unit tests
- Use AAA (Arrange, Act, Assert)
- Use parametrized tests when applicable
