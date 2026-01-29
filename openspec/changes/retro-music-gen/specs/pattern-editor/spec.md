## ADDED Requirements

### Requirement: Create and edit patterns
El sistema MUST permitir crear y editar patrones en una cuadricula de pasos por canal, incluyendo agregar, mover y borrar notas.

#### Scenario: Add a note in a pattern
- **WHEN** el usuario agrega una nota en un paso y canal especificos
- **THEN** la nota queda guardada y visible en el patron

### Requirement: Enforce channel limits in patterns
El editor MUST respetar el limite de canales definido por la aplicacion para cada patron.

#### Scenario: Attempt to exceed channel limit
- **WHEN** el usuario intenta agregar notas en un canal fuera del limite
- **THEN** el editor bloquea la accion o deshabilita ese canal

### Requirement: Allow empty patterns
El sistema MUST permitir patrones vacios sin notas.

#### Scenario: Save an empty pattern
- **WHEN** el usuario guarda un patron sin notas
- **THEN** el patron se guarda correctamente y se considera valido
