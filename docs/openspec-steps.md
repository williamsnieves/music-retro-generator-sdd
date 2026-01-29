## OpenSpec - pasos ejecutados y flujo recomendado

Este documento resume los pasos realizados con OpenSpec y el flujo recomendado para crear specs y avanzar el proceso usando el framework, sin acciones manuales fuera del mismo.

### 1) Inicializacion de OpenSpec (CLI)

Comando usado:

```
openspec init --tools cursor --force
```

Resultado:
- Se creo la estructura `openspec/`
- Se genero `openspec/config.yaml`
- Se instalaron los slash commands en `.cursor/commands`
- Se instalaron skills en `.cursor/skills`

Nota: si el comando falla por permisos en `.cursor/`, reintentar fuera de sandbox o con permisos completos.

### 2) Verificacion de templates (CLI)

Comando usado:

```
openspec templates --json
```

Esto confirma las rutas de los templates del schema `spec-driven` (proposal/specs/design/tasks).

### 3) Creacion del cambio (framework)

Se creo el change `retro-music-gen` y su propuesta:
- `openspec/changes/retro-music-gen/proposal.md`

Luego se generaron specs por capability en:
- `openspec/changes/retro-music-gen/specs/<capability>/spec.md`

### 4) Reglas de redaccion para specs

Las requirements deben incluir el keyword `MUST` o `SHALL` para pasar la validacion de OpenSpec.

### 5) Validacion del cambio (CLI)

Comando usado:

```
openspec validate retro-music-gen
```

Resultado esperado:
- Validacion exitosa sin errores.

---

## Como usar slash commands vs CLI

### Slash commands (Cursor)

Los slash commands (`/opsx:*`) son comandos del asistente, no de la terminal.
Para habilitarlos:
1. Ejecuta `openspec init --tools cursor --force` (o `openspec update`)
2. Reinicia el IDE para que Cursor cargue los comandos
3. Usa los comandos en el chat del agente:
   - `/opsx:new` para crear un change
   - `/opsx:continue` para crear el siguiente artefacto
   - `/opsx:ff` para generar proposal/specs/design/tasks de una sola vez
   - `/opsx:apply` para implementar tareas

### CLI (terminal)

El CLI permite todo el flujo sin depender del chat del asistente:

```
openspec init --tools cursor --force
openspec list --json
openspec status --change <change> --json
openspec templates --json
openspec show <change> --json
openspec validate <change>
openspec archive <change>
```

---

## Flujo recomendado (todo con framework)

1. **Inicializar** el proyecto:
   - `openspec init --tools cursor --force`
2. **Crear change** (CLI o slash):
   - CLI: crear carpeta `openspec/changes/<id>/` y usar templates
   - Slash: `/opsx:new <nombre>`
3. **Crear specs**:
   - CLI: completar `specs/<capability>/spec.md` con requirements/scenarios
   - Slash: `/opsx:continue` o `/opsx:ff`
4. **Validar**:
   - `openspec validate <change>`
5. **Diseño y tareas**:
   - CLI: completar `design.md` y `tasks.md`
   - Slash: `/opsx:continue` o `/opsx:ff`
6. **Implementar**:
   - Slash: `/opsx:apply`
7. **Archivar**:
   - `openspec archive <change>`

---

## Notas importantes

- Los slash commands solo funcionan despues de reiniciar el IDE.
- El CLI es la via mas estable si no se usan comandos en el chat.
- Toda creacion de artefactos debe seguir los templates y validaciones del framework.
