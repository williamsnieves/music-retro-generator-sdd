# Testing Guide - Retro Music Generator

Esta guía te ayudará a probar toda la implementación del generador de música retro.

## 🚀 Quick Start

### 1. Instalar dependencias (si no lo has hecho)

```bash
npm install
```

### 2. Ejecutar todos los tests

```bash
npm test
```

Deberías ver **211 tests pasando** en 13 archivos.

---

## 📋 Tests por Módulo

### Domain Layer (Entidades inmutables)

```bash
# Probar entidad Note
npm test -- Note.spec.ts

# Probar entidad Step
npm test -- Step.spec.ts

# Probar entidad Pattern
npm test -- Pattern.spec.ts

# Probar entidad Song
npm test -- Song.spec.ts

# Probar entidad Channel
npm test -- Channel.spec.ts
```

**Total Domain:** 80 tests

### Use Cases Layer

```bash
# Probar PatternEditor (crear/editar patrones)
npm test -- PatternEditor.spec.ts

# Probar SongComposer (componer canciones)
npm test -- SongComposer.spec.ts
```

**Total Use Cases:** 33 tests

### Infrastructure Layer

```bash
# Probar PlaybackEngine (reproducción en tiempo real)
npm test -- PlaybackEngine.spec.ts

# Probar Synthesizer (síntesis de audio retro)
npm test -- Synthesizer.spec.ts

# Probar ChannelMixer (mezcla de canales)
npm test -- ChannelMixer.spec.ts

# Probar AudioExporter (exportar audio WAV)
npm test -- AudioExporter.test.ts

# Probar SongDataExporter (exportar datos JSON)
npm test -- SongDataExporter.test.ts
```

**Total Infrastructure:** 78 tests

### Spec Verification (Cobertura OpenSpec)

```bash
# Probar cobertura de specs completa
npm test -- spec-verification.spec.ts
```

**Total Verification:** 20 tests

---

## 🎯 Probar Funcionalidades Específicas

### Pattern Editor

```bash
npm test -- PatternEditor.spec.ts
```

**Qué prueba:**
- ✅ Agregar notas a patrones
- ✅ Mover notas entre pasos
- ✅ Borrar notas
- ✅ Validar límite de canales (4 canales)
- ✅ Patrones vacíos son válidos

### Song Composition

```bash
npm test -- SongComposer.spec.ts
```

**Qué prueba:**
- ✅ Componer canciones desde patrones
- ✅ Ordenar patrones en secuencia
- ✅ Configurar repeat count finito
- ✅ Prevenir bucles infinitos
- ✅ Validar fin definido

### Real-time Playback

```bash
npm test -- PlaybackEngine.spec.ts
```

**Qué prueba:**
- ✅ Reproducción a BPM fijo
- ✅ Cálculo preciso de timing (Web Audio API)
- ✅ Start/Stop/Pause/Resume
- ✅ Edición sin glitches durante reproducción
- ✅ Bucles finitos en canciones

### Audio Synthesis

```bash
npm test -- Synthesizer.spec.ts
npm test -- ChannelMixer.spec.ts
```

**Qué prueba:**
- ✅ Síntesis retro simple (square, sawtooth, triangle)
- ✅ Envelope (attack/release)
- ✅ Mezcla de hasta 4 canales
- ✅ Control de volumen por canal

### Export

```bash
npm test -- AudioExporter.test.ts
npm test -- SongDataExporter.test.ts
```

**Qué prueba:**
- ✅ Exportar audio WAV
- ✅ Exportar datos JSON
- ✅ Manejar patrones vacíos

---

## 🔍 Verificar Cobertura OpenSpec

```bash
npm test -- spec-verification.spec.ts
```

Este test verifica que **TODOS** los scenarios de OpenSpec estén cubiertos:

### Pattern Editor (5 scenarios)
- Add note, move note, delete note
- Enforce channel limit
- Allow empty patterns

### Song Composition (4 scenarios)
- Arrange patterns
- Set finite repeat count
- Validate/reject infinite loops

### Real-time Playback (3 scenarios)
- Start playback at fixed BPM
- Edit while playing (glitch-free)
- Stop promptly

### Synthesis (2 scenarios)
- Simple retro synthesis
- Limited channel mixing

### Export (3 scenarios)
- Export audio file
- Export song data
- Handle empty patterns

---

## 📊 Ver Reporte Completo

### Ejecutar todos los tests con salida detallada

```bash
npm test -- --reporter=verbose
```

### Ver cobertura de código

```bash
npm test -- --coverage
```

---

## 🧪 Probar Manualmente (Node REPL)

Puedes probar las clases manualmente en Node:

```bash
node --input-type=module
```

```javascript
import { Pattern, Note, Step, Song, PatternEntry } from './src/domain/index.js';
import { PatternEditor } from './src/usecases/PatternEditor.js';
import { SongComposer } from './src/usecases/SongComposer.js';

// Crear un patrón
const pattern = new Pattern('intro', 'Intro', 16);
const editor = new PatternEditor(pattern, 4);

// Agregar notas
editor.addNote(0, 0, new Note('C4', 1, 0));
editor.addNote(4, 1, new Note('E4', 1, 1));
editor.addNote(8, 2, new Note('G4', 1, 2));

console.log('Pattern:', editor.getPattern());
console.log('Is empty:', editor.isEmpty());

// Componer canción
const song = new Song('song-1', 'My Song', 120);
const composer = new SongComposer(song);
composer.addPattern(new PatternEntry('intro', 4));
composer.setRepeatCount(2);

console.log('Song:', composer.getSong());
console.log('Valid loop:', composer.validateFiniteLoop());
```

---

## ✅ Checklist de Verificación

- [ ] `npm install` completado sin errores
- [ ] `npm test` ejecuta sin errores
- [ ] 211 tests pasando
- [ ] 13 archivos de test ejecutados
- [ ] spec-verification.spec.ts pasa (20/20 tests)
- [ ] Ningún warning o error en consola

---

## 🐛 Troubleshooting

### Error: "vitest: command not found"
```bash
npm install
```

### Tests fallan con errores de importación
```bash
# Verificar que tsconfig.json existe
cat tsconfig.json

# Verificar que vitest.config.ts existe
cat vitest.config.ts
```

### Error: AudioContext no definido
- Es normal en tests - usamos mocks para AudioContext
- Los tests de audio infrastructure usan `vi.fn()` para mockear

---

## 📁 Estructura de Tests

```
src/
├── domain/
│   └── __tests__/          # Tests de entidades (80 tests)
├── usecases/
│   └── __tests__/          # Tests de casos de uso (33 tests)
├── infrastructure/
│   ├── audio/__tests__/    # Tests de audio (83 tests)
│   └── export/__tests__/   # Tests de export (25 tests)
└── __tests__/
    └── spec-verification.spec.ts  # Verificación OpenSpec (20 tests)
```

---

## 🎉 Resultado Esperado

Al ejecutar `npm test` deberías ver:

```
✓ src/domain/__tests__/Channel.spec.ts (14 tests)
✓ src/domain/__tests__/Note.spec.ts (11 tests)
✓ src/domain/__tests__/Step.spec.ts (11 tests)
✓ src/domain/__tests__/Pattern.spec.ts (15 tests)
✓ src/domain/__tests__/Song.spec.ts (29 tests)
✓ src/usecases/__tests__/PatternEditor.spec.ts (15 tests)
✓ src/usecases/__tests__/SongComposer.spec.ts (18 tests)
✓ src/infrastructure/audio/__tests__/PlaybackEngine.spec.ts (14 tests)
✓ src/infrastructure/audio/__tests__/Synthesizer.spec.ts (18 tests)
✓ src/infrastructure/audio/__tests__/ChannelMixer.spec.ts (21 tests)
✓ src/infrastructure/export/__tests__/AudioExporter.test.ts (10 tests)
✓ src/infrastructure/export/__tests__/SongDataExporter.test.ts (15 tests)
✓ src/__tests__/spec-verification.spec.ts (20 tests)

Test Files  13 passed (13)
     Tests  211 passed (211)
```

**¡Todo verde! ✅**
