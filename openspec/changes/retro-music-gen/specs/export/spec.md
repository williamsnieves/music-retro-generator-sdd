## ADDED Requirements

### Requirement: Export audio file
El sistema MUST permitir exportar la cancion a un archivo de audio reproducible.

#### Scenario: Export audio
- **WHEN** el usuario solicita exportar audio
- **THEN** el sistema genera un archivo de audio con la cancion completa

### Requirement: Export song data
El sistema MUST permitir exportar datos de la cancion con patrones, orden y BPM.

#### Scenario: Export data
- **WHEN** el usuario solicita exportar datos
- **THEN** el sistema genera un archivo con los patrones y la estructura de la cancion

### Requirement: Export handles empty patterns
La exportacion MUST manejar patrones vacios sin fallar.

#### Scenario: Export with empty patterns
- **WHEN** la cancion contiene patrones vacios
- **THEN** la exportacion completa incluye silencios donde corresponda
