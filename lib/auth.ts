import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

const baseURL = process.env.BETTER_AUTH_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL)
const developmentOrigins = ['http://localhost:3000', ...['V0_RUNTIME_URL', 'V0_DEV_APP_URL', 'V0_BUILD_URL', 'V0_SANDBOX_URL'].map((key) => process.env[key]).filter(Boolean) as string[]]
const productionOrigins = ['VERCEL_URL', 'VERCEL_PROJECT_PRODUCTION_URL'].map((key) => process.env[key] ? `https://${process.env[key]}` : '').filter(Boolean)

export const auth = betterAuth({
  database: pool,
  baseURL,
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins: process.env.NODE_ENV === 'development' ? developmentOrigins : productionOrigins,
  ...(process.env.NODE_ENV === 'development' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})
