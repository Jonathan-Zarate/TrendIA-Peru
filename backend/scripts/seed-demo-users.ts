import { PostgresUserStore, type StoredUserRole } from '@trendia/database'
import { ScryptPasswordHasher } from '../src/auth/adapters/scrypt-password-hasher.js'

interface DemoUserDefinition {
  name: string
  emailVariable: string
  passwordVariable: string
  role: StoredUserRole
}

const definitions: DemoUserDefinition[] = [
  {
    name: 'ADMIN',
    emailVariable: 'DEMO_ADMIN_EMAIL',
    passwordVariable: 'DEMO_ADMIN_PASSWORD',
    role: 'ADMIN',
  },
  {
    name: 'ANALYST',
    emailVariable: 'DEMO_ANALYST_EMAIL',
    passwordVariable: 'DEMO_ANALYST_PASSWORD',
    role: 'ANALYST',
  },
  {
    name: 'ENTREPRENEUR',
    emailVariable: 'DEMO_ENTREPRENEUR_EMAIL',
    passwordVariable: 'DEMO_ENTREPRENEUR_PASSWORD',
    role: 'ENTREPRENEUR',
  },
]

const users = new PostgresUserStore(required('DATABASE_URL'))
const passwords = new ScryptPasswordHasher()

try {
  for (const definition of definitions) {
    const email = required(definition.emailVariable).trim().toLowerCase()
    const password = required(definition.passwordVariable)
    if (password.length < 12) {
      throw new Error(`${definition.passwordVariable} debe tener al menos 12 caracteres.`)
    }

    const user = await users.provision({
      name: definition.name,
      email,
      passwordHash: await passwords.hash(password),
      role: definition.role,
    })

    console.log(`Usuario ${user.role} provisionado: ${user.email}`)
  }
}
finally {
  await users.close()
}

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Falta la variable de entorno ${name}.`)
  return value
}
