import { NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.redirect(new URL('/sign-in', request.url))
  const state = randomBytes(24).toString('hex'); const verifier = randomBytes(32).toString('base64url'); const challenge = createHash('sha256').update(verifier).digest('base64url')
  const baseUrl = process.env.BETTER_AUTH_URL || new URL(request.url).origin
  const redirectUri = `${baseUrl}/api/etsy/oauth/callback`
  const response = NextResponse.redirect(`https://www.etsy.com/oauth/connect?response_type=code&client_id=${encodeURIComponent(process.env.ETSY_API_KEY || '')}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('listings_r shops_r')}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`)
  response.cookies.set('etsy_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' }); response.cookies.set('etsy_oauth_verifier', verifier, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' }); return response
}
