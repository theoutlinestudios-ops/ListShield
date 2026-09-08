import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { randomBytes, createHash } from 'node:crypto'

const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax' as const, maxAge: 600, path: '/' }

export async function GET(request: Request) {
  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey || !sharedSecret) return NextResponse.json({ error: 'ETSY_API_KEY and ETSY_SHARED_SECRET are required.' }, { status: 500 })

  const state = randomBytes(24).toString('base64url')
  const verifier = randomBytes(48).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  const redirectUri = 'https://v0-list-shield.vercel.app/api/etsy/oauth/callback'
  const authorizationUrl = new URL('https://www.etsy.com/oauth/connect')
  authorizationUrl.search = new URLSearchParams({ response_type: 'code', client_id: apiKey, redirect_uri: redirectUri, scope: 'listings_r shops_r', state, code_challenge: challenge, code_challenge_method: 'S256' }).toString()

  const jar = await cookies()
  jar.set('etsy_oauth_state', state, cookieOptions)
  jar.set('etsy_oauth_verifier', verifier, cookieOptions)
  return NextResponse.redirect(authorizationUrl)
}
