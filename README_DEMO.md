# 🎹 Retro Music Generator - Manual Testing Demo

## 🚀 Quick Start

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 3. Abrir en el navegador

```
http://localhost:5173
```

---

## 🎮 ¿Qué puedes hacer?

La interfaz de demostración te permite probar manualmente todas las funcionalidades implementadas:

### 🎵 Pattern Editor
- **Create Pattern**: Crea un patrón de 16 pasos con 4 canales
- **Add Notes**: Agrega notas C4, E4, G4, C5 en diferentes pasos
- **Move Note**: Mueve una nota entre pasos
- **Remove Note**: Borra una nota específica
- **Clear Pattern**: Limpia todo el patrón
- **Test Channel Limit**: Prueba la validación del límite de canales (debe fallar)

### 🎼 Song Composition
- **Create Song**: Crea una canción a 120 BPM
- **Add Patterns**: Agrega patrones intro (x2), verse (x4), chorus (x2)
- **Reorganize**: Reorganiza el orden de patrones
- **Validate Loop**: Valida que la canción tenga fin definido (no bucles infinitos)
- **Change BPM**: Cambia el BPM a 140

### ▶️ Real-time Playback
- **Initialize Audio**: Inicializa AudioContext (necesario primero)
- **▶️ Play**: Reproduce el patrón actual
- **⏸️ Pause**: Pausa la reproducción
- **▶️ Resume**: Reanuda desde donde pausó
- **⏹️ Stop**: Detiene completamente
- **BPM Slider**: Ajusta el tempo (60-200 BPM)

---

## 💻 Modo Avanzado (Consola)

Abre la consola del navegador (`F12` o `Cmd+Option+J`) para acceso completo a las clases:

### Ejemplo 1: Crear y editar un patrón personalizado

```javascript
// Crear patrón
const pattern = new Pattern('my-pattern', 'My Pattern', 16);
const editor = new PatternEditor(pattern, 4);

// Agregar notas personalizadas
editor.addNote(0, 0, new Note('C4', 1, 0));
editor.addNote(2, 0, new Note('D4', 1, 0));
editor.addNote(4, 1, new Note('E4', 1, 1));
editor.addNote(6, 1, new Note('F4', 1, 1));

// Ver resultado
console.log(editor.getPattern());
```

### Ejemplo 2: Componer una canción completa

```javascript
// Crear canción
const song = new Song('my-song', 'Epic Song', 150);
const composer = new SongComposer(song);

// Agregar estructura
composer.addPattern(new PatternEntry('intro', 1));
composer.addPattern(new PatternEntry('verse', 2));
composer.addPattern(new PatternEntry('bridge', 1));
composer.addPattern(new PatternEntry('chorus', 4));
composer.setRepeatCount(2);

// Validar
console.log('Valid:', composer.validateFiniteLoop());
console.log('Song:', composer.getSong());
```

### Ejemplo 3: Control preciso de reproducción

```javascript
// Inicializar
const ctx = new AudioContext();
const engine = new PlaybackEngine(ctx);

// Reproducir con callback al terminar
engine.start(pattern, 120);
engine.onComplete(() => {
  console.log('¡Reproducción terminada!');
});

// Pausar después de 3 segundos
setTimeout(() => engine.pause(), 3000);

// Reanudar después de 5 segundos
setTimeout(() => engine.resume(), 5000);
```

---

## 📊 Verificar Funcionalidades

### ✅ Pattern Editor
- [ ] Puedo crear un patrón vacío
- [ ] Puedo agregar notas en diferentes pasos y canales
- [ ] Puedo mover notas entre pasos
- [ ] Puedo borrar notas específicas
- [ ] El sistema rechaza canales inválidos (>= 4)
- [ ] Puedo limpiar todo el patrón

### ✅ Song Composition
- [ ] Puedo crear una canción con BPM
- [ ] Puedo agregar múltiples patrones en secuencia
- [ ] Puedo reorganizar el orden de patrones
- [ ] La validación detecta bucles infinitos (sin patrones)
- [ ] Puedo cambiar el BPM dinámicamente
- [ ] El repeat count debe ser positivo

### ✅ Playback Engine
- [ ] Puedo inicializar AudioContext
- [ ] La reproducción empieza al BPM configurado
- [ ] Puedo pausar sin perder la posición
- [ ] Puedo reanudar desde donde pausé
- [ ] Puedo detener completamente
- [ ] El contador de pasos avanza correctamente
- [ ] Puedo ajustar el BPM con el slider

---

## 🎯 Escenarios de Prueba Completos

### Escenario 1: Workflow Básico

1. Click en "Create Pattern"
2. Click en "Add Notes"
3. Click en "Initialize Audio"
4. Click en "▶️ Play"
5. Observa el contador de pasos avanzando
6. Click en "⏹️ Stop"

**Resultado esperado:** Audio reproduce las 4 notas (C4, E4, G4, C5) en loop

---

### Escenario 2: Edición Durante Reproducción

1. Sigue el Escenario 1 hasta el paso 4
2. Mientras reproduce, click en "Move Note"
3. Audio continúa sin interrupciones
4. El cambio se aplica en el siguiente loop

**Resultado esperado:** Reproducción sin glitches, cambio efectivo

---

### Escenario 3: Validación de Límites

1. Click en "Create Pattern"
2. Click en "Test Channel Limit"
3. Revisa la consola y el output

**Resultado esperado:** Error claro "Channel 4 exceeds pattern channel limit"

---

### Escenario 4: Composición Completa

1. Click en "Create Song" (Song Composition)
2. Click en "Add Patterns"
3. Click en "Validate Loop"
4. Observa resultado en output

**Resultado esperado:** "Finite loop valid: YES ✅"

---

## 🐛 Troubleshooting

### "AudioContext was not allowed to start"
**Solución:** Haz click en "Initialize Audio" después de interactuar con la página (requisito del navegador)

### No se escucha audio
**Solución:** 
1. Verifica que "Initialize Audio" fue clickeado
2. Revisa el volumen del sistema
3. Abre la consola y verifica que no haya errores

### Los botones no responden
**Solución:**
1. Abre la consola (F12) y verifica errores
2. Recarga la página (Cmd+R o Ctrl+R)
3. Asegúrate de que `npm run dev` está corriendo

---

## 📚 Documentación Adicional

- **`docs/MANUAL_TESTING.md`** - Guía completa con ejemplos de código
- **`docs/TESTING_GUIDE.md`** - Guía de tests automatizados
- **`docs/SPEC_COVERAGE.md`** - Mapeo specs → tests
- **`docs/technical-decisions.md`** - Decisiones técnicas del proyecto

---

## 🎨 Próximos Pasos

Una vez validado el core functionality, el siguiente paso natural sería:

1. **UI Components con Vue + Radix UI**
   - Grid visual para editar patrones
   - Timeline de canción
   - Waveform selector
   - Export buttons

2. **Persistencia**
   - Save/Load songs
   - Export/Import projects

3. **Features Avanzadas**
   - Undo/Redo
   - Copy/Paste patterns
   - Pattern library
   - Real-time collaboration

---

## 💡 Tips

- **Usa la consola:** Toda la API está expuesta globalmente
- **Estado global:** `demo.state` contiene todo el estado actual
- **Logs detallados:** Todos los eventos se registran en consola
- **Hot reload:** Vite recarga automáticamente al editar código

---

¡Disfruta probando el generador de música retro! 🎮🎵
