## ADDED Requirements

### Requirement: Simple retro synthesis per channel
El sistema MUST generar sonido retro usando sintesis simple por canal.

#### Scenario: Trigger a note
- **WHEN** se reproduce una nota en un canal
- **THEN** el sintetizador genera el tono retro correspondiente

### Requirement: Limited channel mixing
La mezcla MUST respetar la cantidad de canales disponibles.

#### Scenario: Mix channels
- **WHEN** se reproducen notas simultaneas en canales permitidos
- **THEN** el audio resultante mezcla esos canales sin exceder el limite
