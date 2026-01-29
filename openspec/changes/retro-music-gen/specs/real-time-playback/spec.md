## ADDED Requirements

### Requirement: Real-time playback at fixed BPM
El sistema MUST reproducir patrones y canciones en tiempo real a un BPM fijo.

#### Scenario: Start playback
- **WHEN** el usuario inicia la reproduccion
- **THEN** el audio sigue el BPM fijo configurado

### Requirement: Glitch-free audio during normal use
La reproduccion MUST ser estable y sin glitches en condiciones normales de uso.

#### Scenario: Edit while playing
- **WHEN** el usuario edita un patron durante la reproduccion
- **THEN** el audio continua sin interrupciones audibles

### Requirement: Stop playback promptly
El sistema MUST detener la reproduccion cuando el usuario lo solicite.

#### Scenario: Stop playback
- **WHEN** el usuario detiene la reproduccion
- **THEN** el audio se detiene en un tiempo acotado y consistente
