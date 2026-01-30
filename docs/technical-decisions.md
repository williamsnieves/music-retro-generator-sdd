## Technical Decisions

This document captures the agreed technical choices derived from the specs.

### Frontend stack
- Framework: Vue 3 + Vite
- UI library: Radix Vue
- Architecture: Hexagonal architecture in the frontend
- Design principles: SOLID and POLA (Principle of Least Astonishment)
- Patterns: use design patterns only when they add clear value

### Audio and export
- Audio engine: Web Audio API (client-side)
- Export formats: WAV for audio and JSON for song data

### Backend
- No backend for now
- If needed later: Express.js

### Testing
- TDD for component development
- Unit tests are the primary focus
- Use AAA pattern (Arrange, Act, Assert)
- Use parametrized tests when applicable
