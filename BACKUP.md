# BACKUP - NASA

## 2026-11-14 (Windows) — Creación y estructura harness

- Carpeta local `C:\Lab\Belle\NASA` y repositorio privado `belleavm/NASA`, solo rama `main`. Antes se verificó que no existía ninguna carpeta `nasa` en `C:\Lab` ni un repo NASA en `belleavm`.
- Harness copiado de las plantillas `C:\Lab\scripts\harness\`: `AGENTS.md`, `CLAUDE.md`, `.gitattributes`, `.githooks/pre-commit` y `post-commit`, y el hook Stop `.claude/hooks/remind-backup.mjs`.
- Hooks activados en esta Windows con `git config core.hooksPath .githooks`. En la Mac hay que activarlos al clonar.
- Es un repo anidado dentro de `Belle/` (`belleavm/cosas-mias`), que lo ignora en su `.gitignore`.
- Pendiente: definir el propósito y el stack del proyecto, y completar "Verificar" en `AGENTS.md`.
