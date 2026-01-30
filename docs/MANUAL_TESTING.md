# Manual Testing Guide - Retro Music Generator

Esta guía te ayudará a probar manualmente el generador de música retro en el navegador.

## 🎮 Opción 1: Demo Interactivo en el Navegador

### Paso 1: Iniciar el servidor de desarrollo

```bash
cd /Users/williansnieves/Documents/practices/spec-driven-projects/music-retro-generator-sdd
npm run dev
```

### Paso 2: Abrir el navegador

```
http://localhost:5173
```

### Paso 3: Abrir la consola del navegador

- **Chrome/Edge**: `Cmd + Option + J` (Mac) o `Ctrl + Shift + J` (Windows/Linux)
- **Firefox**: `Cmd + Option + K` (Mac) o `Ctrl + Shift + K` (Windows/Linux)
- **Safari**: `Cmd + Option + C` (Mac)

---

## 🎹 Probar Pattern Editor (Edición de Patrones)

### Crear un patrón básico

```javascript
// Importar clases (estas estarán disponibles en el demo)
const pattern = new Pattern('intro', 'Intro Pattern', 16);
const editor = new PatternEditor(pattern, 4); // 4 canales máximo

// Agregar notas
editor.addNote(0, 0, new Note('C4', 1, 0));   // Paso 0, Canal 0
editor.addNote(4, 0, new Note('E4', 1, 0));   // Paso 4, Canal 0
editor.addNote(8, 1, new Note('G4', 1, 1));   // Paso 8, Canal 1
editor.addNote(12, 1, new Note('C5', 1, 1));  // Paso 12, Canal 1

// Ver el patrón
console.log('Pattern:', editor.getPattern());
console.log('Is empty:', editor.isEmpty());
console.log('Step count:', editor.getStepCount());
```

### Mover y borrar notas

```javascript
// Mover una nota del paso 0 al paso 2
editor.moveNote(0, 0, 2, 0);

// Borrar una nota
editor.removeNote(4, 0);

// Limpiar todo el patrón
editor.clear();
console.log('After clear, is empty:', editor.isEmpty());
```

### Probar límites de canales

```javascript
// Esto debe funcionar (canal 3 es válido con máximo 4)
editor.addNote(0, 3, new Note('A4', 1, 3));

// Esto debe lanzar error (canal 4 excede el límite)
try {
  editor.addNote(0, 4, new Note('B4', 1, 4));
} catch (e) {
  console.log('Error esperado:', e.message);
}
```

---

## 🎵 Probar Song Composition (Composición de Canciones)

### Crear una canción

```javascript
// Crear patrones
const intro = new Pattern('intro', 'Intro', 16);
const verse = new Pattern('verse', 'Verse', 16);
const chorus = new Pattern('chorus', 'Chorus', 16);

// Agregar notas a los patrones
const editorIntro = new PatternEditor(intro, 4);
editorIntro.addNote(0, 0, new Note('C4', 1, 0));
editorIntro.addNote(4, 0, new Note('E4', 1, 0));

const editorVerse = new PatternEditor(verse, 4);
editorVerse.addNote(0, 1, new Note('G4', 1, 1));
editorVerse.addNote(8, 1, new Note('A4', 1, 1));

// Crear canción
const song = new Song('my-song', 'My First Song', 120); // 120 BPM
const composer = new SongComposer(song);

// Agregar patrones en secuencia
composer.addPattern(new PatternEntry('intro', 2));   // Intro x2
composer.addPattern(new PatternEntry('verse', 4));   // Verse x4
composer.addPattern(new PatternEntry('chorus', 2));  // Chorus x2

// Configurar repeat count
composer.setRepeatCount(1); // La canción completa se repite 1 vez

// Ver la canción
const finalSong = composer.getSong();
console.log('Song:', finalSong);
console.log('Pattern sequence:', finalSong.patternSequence);
console.log('Is finite loop:', composer.validateFiniteLoop());
```

### Reorganizar patrones

```javascript
// Insertar un patrón en posición específica
composer.insertPattern(1, new PatternEntry('verse', 1));

// Mover un patrón
composer.movePattern(0, 2); // Mover intro de posición 0 a 2

// Remover un patrón
composer.removePattern(1);

// Cambiar BPM
composer.setBPM(140);

console.log('Updated song:', composer.getSong());
```

---

## 🔊 Probar Playback Engine (Reproducción)

### Reproducir un patrón

```javascript
// Crear AudioContext
const audioContext = new AudioContext();

// Crear playback engine
const engine = new PlaybackEngine(audioContext);

// Crear un patrón con notas
const pattern = new Pattern('test', 'Test', 16);
const editor = new PatternEditor(pattern, 4);
editor.addNote(0, 0, new Note('C4', 1, 0));
editor.addNote(4, 0, new Note('E4', 1, 0));
editor.addNote(8, 0, new Note('G4', 1, 0));
editor.addNote(12, 0, new Note('C5', 1, 0));

// Iniciar reproducción a 120 BPM
engine.start(editor.getPattern(), 120);

console.log('Playing:', engine.isPlaying());
console.log('Current step:', engine.getCurrentStep());
console.log('Step duration:', engine.getStepDuration());
```

### Controlar la reproducción

```javascript
// Pausar
engine.pause();
console.log('Paused:', engine.isPaused());

// Reanudar
engine.resume();
console.log('Playing:', engine.isPlaying());

// Detener
engine.stop();
console.log('Stopped, is playing:', engine.isPlaying());
```

### Reproducir una canción completa

```javascript
// Preparar patrones
const patterns = [intro, verse, chorus].map(p => {
  const editor = new PatternEditor(p, 4);
  editor.addNote(0, 0, new Note('C4', 1, 0));
  return editor.getPattern();
});

// Crear canción
const song = new Song('full-song', 'Full Song', 140);
const composer = new SongComposer(song);
composer.addPattern(new PatternEntry('intro', 1));
composer.addPattern(new PatternEntry('verse', 2));
composer.addPattern(new PatternEntry('chorus', 1));
composer.setRepeatCount(2);

// Reproducir
engine.startSong(composer.getSong(), patterns);

// Callback cuando termine
engine.onComplete(() => {
  console.log('Song finished!');
});
```

### Editar sin glitches durante reproducción

```javascript
// Iniciar reproducción
engine.start(pattern, 120);

// Modificar el patrón mientras suena
const newPattern = editor.getPattern();
const updatedEditor = new PatternEditor(newPattern, 4);
updatedEditor.addNote(6, 1, new Note('D4', 1, 1));

// Actualizar sin detener
engine.updatePattern(updatedEditor.getPattern());

console.log('Still playing:', engine.isPlaying());
```

---

## 🎛️ Probar Synthesizer (Síntesis de Audio)

### Configurar waveforms por canal

```javascript
const audioContext = new AudioContext();
const channelMixer = new ChannelMixer(audioContext, 4);
const synthesizer = new Synthesizer(
  audioContext,
  (channel, node) => channelMixer.connectChannel(channel, node),
  { attackTime: 0.01, releaseTime: 0.1 }
);

// Configurar waveforms diferentes por canal
synthesizer.setChannelWaveform(0, 'square');    // Canal 0: onda cuadrada
synthesizer.setChannelWaveform(1, 'sawtooth');  // Canal 1: diente de sierra
synthesizer.setChannelWaveform(2, 'triangle');  // Canal 2: triangular

// Tocar notas
const startTime = audioContext.currentTime;
synthesizer.playNote(0, { pitch: 60, duration: 1, channel: 0 }, startTime);
synthesizer.playNote(1, { pitch: 64, duration: 1, channel: 1 }, startTime + 0.5);
synthesizer.playNote(2, { pitch: 67, duration: 1, channel: 2 }, startTime + 1.0);
```

### Controlar volumen por canal

```javascript
// Ajustar volumen de canales individuales
channelMixer.setChannelGain(0, 0.8);  // Canal 0: 80%
channelMixer.setChannelGain(1, 0.6);  // Canal 1: 60%
channelMixer.setChannelGain(2, 1.0);  // Canal 2: 100%

// Volumen master
channelMixer.setMasterGain(0.7); // 70% global

console.log('Channel 0 gain:', channelMixer.getChannelGain(0));
console.log('Master gain:', channelMixer.getMasterGain());
```

---

## 💾 Probar Export (Exportación)

### Exportar datos de canción (JSON)

```javascript
const exporter = new SongDataExporter();

// Exportar la canción a JSON
const songData = exporter.export(
  composer.getSong(),
  [pattern1, pattern2] // Lista de patrones usados
);

console.log('Song data:', songData);
console.log('JSON:', JSON.stringify(songData, null, 2));

// Descargar como archivo (en navegador)
const blob = new Blob([JSON.stringify(songData, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'my-song.json';
a.click();
```

### Exportar audio (WAV)

```javascript
const audioExporter = new AudioExporter(audioContext);

// Renderizar la canción a WAV
const wavBlob = await audioExporter.exportSong(
  composer.getSong(),
  [pattern1, pattern2],
  synthesizer,
  channelMixer
);

console.log('WAV size:', wavBlob.size, 'bytes');

// Descargar WAV
const url = URL.createObjectURL(wavBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'my-song.wav';
a.click();
```

---

## 🎨 Ejemplo Completo: Workflow End-to-End

```javascript
// 1. Crear AudioContext
const audioContext = new AudioContext();

// 2. Crear infraestructura de audio
const channelMixer = new ChannelMixer(audioContext, 4);
const synthesizer = new Synthesizer(
  audioContext,
  (channel, node) => channelMixer.connectChannel(channel, node),
  { attackTime: 0.01, releaseTime: 0.1 }
);
const playbackEngine = new PlaybackEngine(audioContext);

// 3. Configurar waveforms
synthesizer.setChannelWaveform(0, 'square');
synthesizer.setChannelWaveform(1, 'sawtooth');

// 4. Crear patrones
const intro = new Pattern('intro', 'Intro', 16);
const editorIntro = new PatternEditor(intro, 4);
editorIntro.addNote(0, 0, new Note('C4', 1, 0));
editorIntro.addNote(4, 0, new Note('E4', 1, 0));
editorIntro.addNote(8, 0, new Note('G4', 1, 0));

const verse = new Pattern('verse', 'Verse', 16);
const editorVerse = new PatternEditor(verse, 4);
editorVerse.addNote(0, 1, new Note('A4', 1, 1));
editorVerse.addNote(8, 1, new Note('G4', 1, 1));

// 5. Componer canción
const song = new Song('my-song', 'My Song', 140);
const composer = new SongComposer(song);
composer.addPattern(new PatternEntry('intro', 2));
composer.addPattern(new PatternEntry('verse', 4));
composer.setRepeatCount(1);

// 6. Reproducir
const patterns = [editorIntro.getPattern(), editorVerse.getPattern()];
playbackEngine.startSong(composer.getSong(), patterns);

console.log('▶️ Reproduciendo...');
console.log('BPM:', composer.getSong().bpm);
console.log('Patterns:', composer.getSong().patternSequence.length);

// 7. Controles
setTimeout(() => playbackEngine.pause(), 5000);   // Pausar a los 5 seg
setTimeout(() => playbackEngine.resume(), 7000);  // Reanudar a los 7 seg
setTimeout(() => playbackEngine.stop(), 12000);   // Detener a los 12 seg

// 8. Exportar cuando termine
playbackEngine.onComplete(async () => {
  console.log('✅ Reproducción completa');
  
  // Exportar JSON
  const dataExporter = new SongDataExporter();
  const data = dataExporter.export(composer.getSong(), patterns);
  console.log('📄 Datos exportados:', data);
  
  // Exportar WAV
  const audioExporter = new AudioExporter(audioContext);
  const wav = await audioExporter.exportSong(
    composer.getSong(),
    patterns,
    synthesizer,
    channelMixer
  );
  console.log('🎵 WAV exportado:', wav.size, 'bytes');
});
```

---

## 🛠️ Tips para Testing Manual

### Ver el estado en tiempo real

```javascript
// Durante la reproducción, ejecutar esto cada segundo
setInterval(() => {
  if (playbackEngine.isPlaying()) {
    console.log('Step:', playbackEngine.getCurrentStep());
  }
}, 1000);
```

### Validar restricciones

```javascript
// Patrones vacíos son válidos
const emptyPattern = new Pattern('empty', 'Empty', 16);
console.log('Empty valid:', new PatternEditor(emptyPattern, 4).isEmpty());

// Bucles infinitos son prevenidos
const badSong = new Song('bad', 'Bad Song', 120);
const badComposer = new SongComposer(badSong);
// Sin patrones = no puede reproducirse indefinidamente
console.log('Valid loop:', badComposer.validateFiniteLoop()); // false
```

### Probar edge cases

```javascript
// Máximo de canales
const editor = new PatternEditor(pattern, 4);
try {
  editor.addNote(0, 4, new Note('C4', 1, 4)); // Error: canal 4 inválido
} catch (e) {
  console.log('✅ Channel limit enforced:', e.message);
}

// Repeat count debe ser positivo
try {
  composer.setRepeatCount(0); // Error: debe ser > 0
} catch (e) {
  console.log('✅ Repeat validation:', e.message);
}

// BPM debe ser positivo
try {
  composer.setBPM(-10); // Error: debe ser > 0
} catch (e) {
  console.log('✅ BPM validation:', e.message);
}
```

---

## ⚡ Quick Commands

```javascript
// Setup rápido
const ctx = new AudioContext();
const mixer = new ChannelMixer(ctx, 4);
const synth = new Synthesizer(ctx, (ch, node) => mixer.connectChannel(ch, node), {});
const engine = new PlaybackEngine(ctx);

// Patrón rápido
const p = new Pattern('test', 'Test', 16);
const e = new PatternEditor(p, 4);
e.addNote(0, 0, new Note('C4', 1, 0));
e.addNote(4, 0, new Note('E4', 1, 0));

// Reproducir
engine.start(e.getPattern(), 120);

// Detener
engine.stop();
```

---

## 🎯 Siguiente Paso: UI

Para una experiencia visual, el siguiente paso sería crear componentes Vue con:
- Grid de pasos para editar patrones visualmente
- Controles de reproducción (play/pause/stop)
- Selector de waveforms
- Timeline de canción
- Exportar botones

¿Quieres que cree una UI básica con Vue + Radix UI?
