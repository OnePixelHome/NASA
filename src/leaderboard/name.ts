// Crew-name rules for the online leaderboard. Shared by the game (instant feedback) and the server (the real check).
// Pure TS, no React and no network.

export const NAME_MIN = 2
export const NAME_MAX = 24

// Letters in any language, digits, spaces and a few joining marks. Everything else is rejected, not silently dropped.
const ALLOWED = /^[\p{L}\p{N} .'_-]+$/u

// Kept short on purpose: it catches the obvious cases in English and Spanish. Matched on a squashed form of the name
// (lowercase, accents and look-alike digits folded, separators removed) so "F.u-c_k" and "fvck" do not slip through.
const BLOCKED = [
  // Words that hide inside real names (Conor, Maricarmen, Dickens, Hitchcock, Essex) are left out on purpose.
  'fuck', 'fvck', 'shit', 'bitch', 'cunt', 'pussy', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'retard', 'nazi',
  'hitler', 'porn', 'puta', 'puto', 'mierda', 'verga', 'pendejo', 'cabron', 'maricon', 'culero', 'chinga',
  'zorra', 'joder', 'idiota', 'estupido',
]

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' }

function squash(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[0-9@$]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-z]/g, '')
}

/** Trim, collapse inner spaces and drop invisible control characters. */
export function cleanName(raw: string) {
  return raw.replace(/\p{C}/gu, '').replace(/\s+/g, ' ').trim()
}

export type NameCheck = { ok: true; name: string } | { ok: false; error: string }

/** Validate a crew name. The message is shown to the player as is. */
export function checkName(raw: unknown): NameCheck {
  if (typeof raw !== 'string') return { ok: false, error: 'Type a crew name.' }
  const name = cleanName(raw)
  if (name.length < NAME_MIN) return { ok: false, error: `Use at least ${NAME_MIN} characters.` }
  if (name.length > NAME_MAX) return { ok: false, error: `Use at most ${NAME_MAX} characters.` }
  if (!ALLOWED.test(name)) return { ok: false, error: 'Use letters, numbers, spaces and . \' _ - only.' }
  const flat = squash(name)
  if (BLOCKED.some((w) => flat.includes(w))) return { ok: false, error: 'Please choose a different name.' }
  return { ok: true, name }
}
