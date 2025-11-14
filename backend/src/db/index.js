import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import * as schema from './schema.js'

dotenv.config()

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL não configurado. Atualize o arquivo .env.')
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

export const db = drizzle(client, { schema })
export { schema }
