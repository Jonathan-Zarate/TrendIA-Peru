import { describe, expect, it } from 'vitest'
import { ScryptPasswordHasher } from './scrypt-password-hasher.js'

describe('ScryptPasswordHasher', () => {
  const passwords = new ScryptPasswordHasher()

  it('genera hashes con salt y no conserva la contraseña', async () => {
    const firstHash = await passwords.hash('TrendIA#2026')
    const secondHash = await passwords.hash('TrendIA#2026')

    expect(firstHash).not.toContain('TrendIA#2026')
    expect(firstHash).not.toBe(secondHash)
    await expect(passwords.verify('TrendIA#2026', firstHash)).resolves.toBe(true)
  })

  it('rechaza contraseñas incorrectas y formatos desconocidos', async () => {
    const hash = await passwords.hash('TrendIA#2026')

    await expect(passwords.verify('incorrecta', hash)).resolves.toBe(false)
    await expect(passwords.verify('TrendIA#2026', 'texto-no-valido')).resolves.toBe(false)
  })
})
