## ADDED Requirements

### Requirement: Compose songs from patterns
El sistema MUST permitir organizar patrones en una secuencia para formar una cancion.

#### Scenario: Arrange patterns in order
- **WHEN** el usuario agrega patrones a la secuencia de la cancion
- **THEN** los patrones quedan ordenados y listos para reproduccion y exportacion

### Requirement: Defined song end to prevent infinite loops
La cancion MUST tener un final definido y evitar bucles infinitos durante reproduccion o exportacion.

#### Scenario: Looping requires a finite repeat count
- **WHEN** el usuario activa la repeticion de la cancion
- **THEN** el sistema requiere un numero finito de repeticiones antes de permitir reproducir o exportar
