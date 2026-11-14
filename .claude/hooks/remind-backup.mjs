// Hook Stop: no deja cerrar el turno si hay cambios sin reflejar en BACKUP.md
// o commits que no llegaron a GitHub. Plantilla: Crescendo Labs/scripts/harness.
//
// Esta en Node y no en Python porque `python3` no existe en la Windows: la
// version en Python fallaba ahi en silencio (salida 0, sin aviso).

import { execFileSync } from "node:child_process";

let raw = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) raw += chunk;

let data = {};
try {
  data = raw ? JSON.parse(raw) : {};
} catch {
  process.exit(0);
}

// Sin esto el bloqueo se repetiria en bucle.
if (data.stop_hook_active) process.exit(0);

const cwd = data.cwd || process.cwd();
const git = args =>
  execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    timeout: 5000,
    stdio: ["ignore", "pipe", "ignore"],
  });

let out = "";
try {
  out = git(["status", "--porcelain"]);
} catch {
  // Fuera de un repo, o git no disponible: no hay nada que recordar.
  process.exit(0);
}

const isBackup = f => /(^|\/)backup\.md$/i.test(f);
const changed = out
  .split("\n")
  .filter(line => line.trim())
  .map(line => line.slice(3))
  .map(file => (file.includes(" -> ") ? file.split(" -> ").pop() : file));
const otherChanges = changed.filter(f => !isBackup(f));

let reason = "";
if (otherChanges.length > 0 && !changed.some(isBackup)) {
  reason =
    `Hay cambios sin reflejar en BACKUP.md (${otherChanges.slice(0, 5).join(", ")}` +
    `${otherChanges.length > 5 ? `, y ${otherChanges.length - 5} mas` : ""}). ` +
    "Agrega una entrada a BACKUP.md con lo relevante de esta sesion antes de terminar.";
} else if (changed.length === 0) {
  // Arbol limpio: revisar que lo commiteado haya llegado a GitHub.
  let ahead = 0;
  try {
    ahead = Number(git(["rev-list", "--count", "@{u}..HEAD"]).trim()) || 0;
  } catch {
    // Rama sin upstream: el hook post-commit la publica en el proximo commit.
  }
  if (ahead > 0) {
    reason =
      `Hay ${ahead} commit(s) sin subir a GitHub. Haz push (o explica por que fallo) ` +
      "antes de terminar: un commit local no llega a la otra computadora.";
  }
}

if (reason) process.stdout.write(JSON.stringify({ decision: "block", reason }));
