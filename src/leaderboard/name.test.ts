import { describe, expect, it } from 'vitest'
import { checkName, NAME_MAX } from './name'

const ok = (raw: string) => checkName(raw).ok

describe('leaderboard crew names', () => {
  it('accepts normal names in any language, cleaned up', () => {
    expect(checkName('  Apollo   Kids ')).toEqual({ ok: true, name: 'Apollo Kids' })
    for (const n of ['José Gómez', 'Thaís', 'Conor', 'Maricarmen', 'Dickens', 'Team 7', "O'Neil", 'Ñandú_2', 'Ψ crew']) expect(ok(n)).toBe(true)
  })
  it('rejects names that are too short, too long or have odd characters', () => {
    expect(ok('A')).toBe(false)
    expect(ok('x'.repeat(NAME_MAX + 1))).toBe(false)
    expect(ok('<script>')).toBe(false)
    expect(ok('hi\u0000there')).toBe(true) // control characters are dropped, not kept
    expect(checkName('hi\u0000there')).toEqual({ ok: true, name: 'hithere' })
    expect(ok(42 as unknown as string)).toBe(false)
  })
  it('blocks obvious insults even when disguised', () => {
    for (const n of ['fuck', 'F.u-c_k crew', 'fvck', 'sh1t', 'PUTA', 'pendejo99']) expect(ok(n)).toBe(false)
  })
})
