import dotenv from 'dotenv'
dotenv.config()

export default {
  schema: './src/db/schema.js',
  out: './drizzle',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
}
