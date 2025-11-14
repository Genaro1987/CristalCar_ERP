import { createClient } from '@libsql/client'

// Singleton para conexão com Turso
let tursoClient: any = null

export function getTursoClient() {
  if (!tursoClient) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error('TURSO_DATABASE_URL não configurado')
    }

    tursoClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    })
  }

  return tursoClient
}

// Helper para executar queries
export async function executeQuery(sql: string, args: any[] = []) {
  const client = getTursoClient()
  return await client.execute({ sql, args })
}

export async function executeSimpleQuery(sql: string) {
  const client = getTursoClient()
  return await client.execute(sql)
}
