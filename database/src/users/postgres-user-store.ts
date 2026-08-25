import { and, eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from '../schema/schema.js'

export type StoredUserRole = 'ADMIN' | 'ANALYST' | 'ENTREPRENEUR'

export interface StoredUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role: StoredUserRole
  isActive: boolean
  failedLoginAttempts: number
  lockedAt: Date | null
}

export interface CreateStoredUserInput {
  name: string
  email: string
  passwordHash: string
  role: StoredUserRole
}

export class PostgresUserStore {
  private readonly client
  private readonly database

  constructor(connectionString: string) {
    this.client = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    })
    this.database = drizzle(this.client)
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    const [user] = await this.database
      .select(userSelection)
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    return user ?? null
  }

  async findById(id: string): Promise<StoredUser | null> {
    const [user] = await this.database
      .select(userSelection)
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    return user ?? null
  }

  async create(input: CreateStoredUserInput): Promise<StoredUser | null> {
    const [created] = await this.database
      .insert(users)
      .values(input)
      .onConflictDoNothing({ target: users.email })
      .returning(userSelection)
    return created ?? null
  }

  async provision(input: CreateStoredUserInput): Promise<StoredUser> {
    const [provisioned] = await this.database
      .insert(users)
      .values(input)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: input.name,
          passwordHash: input.passwordHash,
          role: input.role,
          isActive: true,
          failedLoginAttempts: 0,
          lockedAt: null,
          updatedAt: new Date(),
        },
      })
      .returning(userSelection)

    if (!provisioned) throw new Error('No se pudo provisionar el usuario.')
    return provisioned
  }

  async recordFailedLogin(id: string, maximumAttempts: number, occurredAt: Date): Promise<void> {
    await this.database
      .update(users)
      .set({
        failedLoginAttempts: sql`least(${users.failedLoginAttempts} + 1, 32767)`,
        lockedAt: sql`case
          when ${users.failedLoginAttempts} + 1 >= ${maximumAttempts}
          then coalesce(${users.lockedAt}, ${occurredAt})
          else ${users.lockedAt}
        end`,
        updatedAt: occurredAt,
      })
      .where(and(eq(users.id, id), eq(users.isActive, true)))
  }

  async resetFailedLogins(id: string): Promise<void> {
    await this.database
      .update(users)
      .set({ failedLoginAttempts: 0, lockedAt: null, updatedAt: new Date() })
      .where(eq(users.id, id))
  }

  async close(): Promise<void> {
    await this.client.end()
  }
}

const userSelection = {
  id: users.id,
  name: users.name,
  email: users.email,
  passwordHash: users.passwordHash,
  role: users.role,
  isActive: users.isActive,
  failedLoginAttempts: users.failedLoginAttempts,
  lockedAt: users.lockedAt,
}
