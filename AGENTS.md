# NASA

Repositorio personal y privado de Belle (`belleavm/NASA`), en `C:\Lab\Belle\NASA` (Windows). Solo rama `main`. El propósito y el stack del proyecto todavía no están definidos.

## Al empezar

- Leer `BACKUP.md` para conocer el contexto.
- `git fetch` y revisar si hay commits nuevos de la otra computadora antes de trabajar.

## Verificar

- Aún no hay código ni comandos de verificación. Agregarlos aquí cuando se defina el stack.

## Reglas

- Todo cambio se documenta en `BACKUP.md` en la misma sesión y antes del commit: qué cambió, por qué y qué quedó pendiente. Nunca incluir secretos.
- Los secretos no van en el repo: van en `C:\Users\bvasquez\lab_secrets\nasa\` (en la Mac, `~/lab_secrets/nasa/`).
- Trabajar directo en `main`; no crear otras ramas.

## Harness del workspace

- `.githooks/pre-commit` exige `BACKUP.md` en cada commit y `.githooks/post-commit` hace el push solo. Confirmar con `git status -sb` que no quedó nada adelante de GitHub.
- El hook de cierre de Claude (`.claude/hooks/remind-backup.mjs`, en Node) no deja terminar si hay cambios sin backup o commits sin subir.
- En otra computadora: `git config core.hooksPath .githooks`.
