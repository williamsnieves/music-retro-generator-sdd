# Playback Engine Fixes

## Problema Identificado

Al probar el demo manual en el navegador, se identificaron varios problemas críticos:

### 1. **Congelamiento de la Página**
- **Causa:** El `while` loop en `scheduleNotes()` podía entrar en bucle infinito
- **Síntoma:** La página se congela completamente, no responde a clicks
- **Impacto:** Los botones pause/stop no funcionaban

### 2. **Loop Infinito en Scheduling**
Cuando se reproducía un patrón suelto (no canción), el código tenía este flujo:

```typescript
while (this.getNextNoteTime() < scheduleUntil) {
  // ... reproduce nota ...
  this.currentStep++;
  
  if (this.currentStep >= this.currentPattern.stepCount) {
    this.currentStep = 0;
    this.currentLoop++; // ❌ Pero startTime nunca se actualiza
  }
}
```

**Problema:** `this.startTime` nunca se actualizaba, entonces `getNextNoteTime()` siempre retornaba tiempos pasados/muy cercanos, causando que el `while` nunca terminara.

### 3. **Memory Leaks de Audio Nodes**
- Oscillators se creaban pero no se limpiaban correctamente
- Falta de cleanup en `onended` callback

### 4. **Audio Context Suspended**
- Navegadores modernos suspenden AudioContext por políticas de autoplay
- No había manejo de resumption

---

## Fixes Implementados

### 1. **Límite de Iteraciones en Schedule Loop**

```typescript
// Antes
while (this.getNextNoteTime() < scheduleUntil) {
  // ... código ...
}

// Después
let iterations = 0;
const maxIterations = 100;

while (this.getNextNoteTime() < scheduleUntil && iterations < maxIterations) {
  iterations++;
  // ... código ...
}
```

**Beneficio:** Previene loops infinitos que congelan el navegador.

---

### 2. **Actualización de startTime en Pattern Loops**

```typescript
// Antes
if (this.currentStep >= this.currentPattern.stepCount) {
  this.currentStep = 0;
  if (this.currentSong) {
    this.handleSongAdvance();
  } else {
    this.currentLoop++; // ❌ startTime no cambia
  }
}

// Después
if (this.currentStep >= this.currentPattern.stepCount) {
  this.currentStep = 0;
  if (this.currentSong) {
    this.handleSongAdvance();
    if (this.state !== 'playing') {
      break; // ✅ Sale si la canción terminó
    }
  } else {
    // ✅ Actualiza startTime para el siguiente loop
    this.currentLoop++;
    this.startTime += this.currentPattern.stepCount * stepDuration;
  }
}
```

**Beneficio:** El loop avanza correctamente sin congelar el navegador.

---

### 3. **Cleanup de Audio Nodes**

```typescript
// Antes
oscillator.start(startTime);
oscillator.stop(startTime + duration);
// ❌ Nodes nunca se desconectan

// Después
oscillator.start(startTime);
oscillator.stop(startTime + duration);

oscillator.onended = () => {
  try {
    oscillator.disconnect();
    gainNode.disconnect();
  } catch (e) {
    // Already disconnected
  }
};
```

**Beneficio:** Previene memory leaks y mejora performance.

---

### 4. **Envelope para Audio Más Suave**

```typescript
// Agrega attack/release envelope
const attackTime = 0.01;
const releaseTime = 0.05;

if (startTime >= now && gainNode.gain.linearRampToValueAtTime) {
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.1, startTime + attackTime);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration - releaseTime);
}
```

**Beneficio:** Audio más suave, sin clicks al inicio/fin de notas.

---

### 5. **Mejor Manejo de Start/Stop**

```typescript
// Ahora start() limpia cualquier reproducción previa
start(pattern: Pattern, bpm: number): void {
  if (this.state === 'playing') {
    this.stop(); // ✅ Detiene primero
  }
  
  if (this.scheduleInterval !== null) {
    clearInterval(this.scheduleInterval);
    this.scheduleInterval = null;
  }
  
  // ... resto del código ...
}
```

**Beneficio:** No se acumulan intervals ni estados inconsistentes.

---

### 6. **Manejo de AudioContext Suspended**

```typescript
// En la UI (index.html)
initAudio() {
  state.audioContext = new AudioContext();
  
  // ✅ Resume si está suspendido
  if (state.audioContext.state === 'suspended') {
    state.audioContext.resume();
  }
}

play() {
  // ✅ Resume antes de reproducir
  if (state.audioContext.state === 'suspended') {
    state.audioContext.resume();
  }
  
  state.playbackEngine.start(pattern, bpm);
}
```

**Beneficio:** Funciona correctamente en todos los navegadores.

---

### 7. **UI Más Intuitiva**

**Mejoras:**
- ✅ Instrucciones claras numeradas al inicio
- ✅ Auto-crea patrón demo si no existe
- ✅ Mejor feedback visual de errores
- ✅ Estado de reproducción más claro
- ✅ Logs más descriptivos con emojis
- ✅ Try/catch en operaciones críticas

---

## Resultados

### Antes
- ❌ Página se congela al reproducir
- ❌ No se puede pausar ni detener
- ❌ Audio no se escucha bien
- ❌ UI confusa

### Después
- ✅ Reproducción fluida sin congelamientos
- ✅ Pause/Resume/Stop funcionan correctamente
- ✅ Audio se escucha claro con envelope suave
- ✅ UI intuitiva con instrucciones claras
- ✅ 14/14 tests pasando

---

## Testing

Ejecutar tests:
```bash
npm test -- PlaybackEngine.spec.ts
```

Resultado esperado:
```
✓ src/infrastructure/audio/__tests__/PlaybackEngine.spec.ts (14 tests)

Test Files  1 passed (1)
     Tests  14 passed (14)
```

---

## Próximos Pasos (Opcionales)

### Performance Avanzado
- [ ] Usar Web Workers para scheduling
- [ ] Pool de oscillators reutilizables
- [ ] Batch scheduling más agresivo

### Integración Completa
- [ ] Integrar Synthesizer real en lugar de oscillators simples
- [ ] Usar ChannelMixer para mezcla de canales
- [ ] Waveform selection per channel

### UI Enhancements
- [ ] Visual pattern grid
- [ ] Real-time step indicator
- [ ] Waveform visualizer
- [ ] Volume meters

---

## Notas Técnicas

### Scheduling Strategy

El engine usa una estrategia de "look-ahead scheduling":
- Revisa cada 25ms (`SCHEDULE_INTERVAL`)
- Programa notas 100ms adelante (`SCHEDULE_AHEAD_TIME`)
- Esto permite precisión sin sobrecargar el thread principal

### BPM Calculation

```
Step Duration = (60 / BPM) / 4
```

Por ejemplo, a 120 BPM:
- 60 / 120 = 0.5 segundos por beat
- 0.5 / 4 = 0.125 segundos por step
- 16 steps = 2 segundos (4 beats)

### Límite de Iteraciones

El límite de 100 iteraciones permite:
- 100 steps × 0.125s = 12.5 segundos de scheduling
- Suficiente para el look-ahead window
- Previene loops infinitos efectivamente
