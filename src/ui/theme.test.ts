import { describe, expect, it } from 'vitest'
import * as C from '../engine/catalog'
import { ROLE_UI, shipParts } from './theme'

describe('ship drawing follows the design', () => {
  it('an empty design draws four ghost outlines', () => {
    expect(shipParts({ scenarioId: 'ice', orbitId: 'sso' })).toEqual({ payload: null, power: null, antenna: null, launcher: null })
  })
  it('maps a full design to the parts in the implementation guide', () => {
    expect(shipParts({ instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' })).toEqual({ payload: 'radar', power: 'hybrid', antenna: 'small', launcher: 'medium' })
    expect(shipParts({ instrumentId: 'multispectral', powerId: 'standard', downlinkId: 'polar', launchId: 'small' })).toEqual({ payload: 'prism', power: 'small', antenna: 'polar', launcher: 'small' })
    expect(shipParts({ instrumentId: 'hires', powerId: 'extended', downlinkId: 'continuous', launchId: 'heavy' })).toEqual({ payload: 'camera', power: 'big', antenna: 'relay', launcher: 'heavy' })
  })
  it('every catalog option has a drawing, so a new option cannot silently show an empty slot', () => {
    for (const i of C.INSTRUMENTS) expect(shipParts({ instrumentId: i.id }).payload, i.id).not.toBeNull()
    for (const p of C.POWER) expect(shipParts({ powerId: p.id }).power, p.id).not.toBeNull()
    for (const d of C.DOWNLINKS) expect(shipParts({ downlinkId: d.id }).antenna, d.id).not.toBeNull()
    for (const l of C.LAUNCHERS) expect(shipParts({ launchId: l.id }).launcher, l.id).not.toBeNull()
  })
  it('every role has an icon as well as a color', () => {
    for (const role of Object.keys(C.ROLE_LABEL) as C.Role[]) {
      expect(ROLE_UI[role].icon.length).toBeGreaterThan(0)
      expect(ROLE_UI[role].color).toMatch(/^var\(--color-role-/)
    }
  })
})
