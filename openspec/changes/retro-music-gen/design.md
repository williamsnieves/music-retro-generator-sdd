## Context

El proyecto parte del PRD de generador de musica retro tipo tracker. El alcance incluye editor por patrones, canales limitados, sintesis simple, reproduccion en tiempo real y exportacion de audio y datos. Restricciones clave: BPM fijo, audio sin glitches y manejo de patrones vacios y bucles infinitos.

## Goals / Non-Goals

**Goals:**
- Definir un modelo de datos para patrones, canales y canciones.
- Establecer un motor de reproduccion con BPM fijo y sin glitches.
- Definir una ruta clara para sintesis simple y exportacion de audio/datos.

**Non-Goals:**
- Audio de alta fidelidad.
- Mezcla avanzada o efectos complejos.
- Soporte de BPM variable o automatizaciones.

## Decisions

- **Modelo de patrones basado en pasos:** cada patron se representa como una grilla de pasos por canal con notas discretas. Razon: facilita edicion tipo tracker y exportacion consistente.
- **Separar modelo de musica y motor de audio:** capas independientes para datos (patrones/canciones) y ejecucion (sintesis/reproduccion). Razon: permite exportacion offline y reproduccion en tiempo real con el mismo modelo.
- **Planificacion anticipada de audio:** el motor de reproduccion agenda eventos con buffer (lookahead). Razon: reducir glitches durante edicion y playback.
- **Sintesis simple por canal:** ondas basicas por canal con mezcla limitada. Razon: alineado con el objetivo retro y limitaciones del PRD.
- **Exportacion offline:** la exportacion de audio usa el mismo scheduler pero en modo no interactivo. Razon: reproducibilidad y evita fallas de tiempo real.

## Risks / Trade-offs

- **Glitches en tiempo real** -> Mitigacion: buffer de planificacion, evitar operaciones pesadas en el hilo de audio.
- **Desincronizacion entre playback y export** -> Mitigacion: una unica fuente de verdad para el scheduler y el modelo.
- **Bucles infinitos** -> Mitigacion: requerir conteo finito de repeticiones antes de reproducir o exportar.

## Migration Plan

No aplica en esta fase (proyecto nuevo).

## Open Questions

- Eleccion de tecnologia concreta para audio (por ejemplo Web Audio vs. libreria nativa).
- Formato exacto del archivo de datos de cancion (JSON u otro).
