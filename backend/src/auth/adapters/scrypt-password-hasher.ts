import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import type { PasswordHasher } from '../ports.js'

const KEY_LENGTH = 64
const COST = 16_384
const BLOCK_SIZE = 8
const PARALLELIZATION = 1

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16)
    const derivedKey = await deriveKey(password, salt)

    return [
      'scrypt',
      COST,
      BLOCK_SIZE,
      PARALLELIZATION,
      salt.toString('base64url'),
      derivedKey.toString('base64url'),
    ].join('$')
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, cost, blockSize, parallelization, encodedSalt, encodedKey] = storedHash.split('$')

    if (
      algorithm !== 'scrypt'
      || Number(cost) !== COST
      || Number(blockSize) !== BLOCK_SIZE
      || Number(parallelization) !== PARALLELIZATION
      || !encodedSalt
      || !encodedKey
    ) {
      return false
    }

    const expectedKey = Buffer.from(encodedKey, 'base64url')
    if (expectedKey.length !== KEY_LENGTH) return false

    const actualKey = await deriveKey(password, Buffer.from(encodedSalt, 'base64url'))
    return timingSafeEqual(actualKey, expectedKey)
  }
}

async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, {
      N: COST,
      r: BLOCK_SIZE,
      p: PARALLELIZATION,
      maxmem: 64 * 1024 * 1024,
    }, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }
      resolve(derivedKey)
    })
  })
}
