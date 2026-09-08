import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { etsyConnection } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() }); const url = new URL(request.url); const jar = await import('next/headers').then((m) => m.cookies()); const state = jar.get('etsy_oauth_state')?.value; const verifier = jar.get('etsy_oauth_verifier')?.value
  if (!session?.user || !state || state !== url.searchParams.get('state') || !verifier) return NextResponse.redirect(new URL('/?etsy=error&reason=invalid_oauth', url.origin))
  const redirectUri = `${process.env.BETTER_AUTH_URL || url.origin}/api/etsy/oauth/callback`
  const result = await fetch('https://api.etsy.com/v3/public/oauth/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: process.env.ETSY_API_KEY || '', redirect_uri: redirectUri, code: url.searchParams.get('code') || '', code_verifier: verifier }) })
  if (!result.ok) return NextResponse.redirect(new URL('/?etsy=error&reason=token_exchange_failed', url.origin))
  const token = await result.json(); await db.insert(etsyConnection).values({ id: randomUUID(), userId: session.user.id, accessToken: token.access_token, refreshToken: token.refresh_token, expiresAt: new Date(Date.now() + token.expires_in * 1000) }).onConflictDoUpdate({ target: etsyConnection.userId, set: { accessToken: token.access_token, refreshToken: token.refresh_token, expiresAt: new Date(Date.now() + token.expires_in * 1000), updatedAt: new Date() } })
  const response = NextResponse.redirect(new URL('/?view=shop&etsy=connected', url.origin)); response.cookies.delete('etsy_oauth_state'); response.cookies.delete('etsy_oauth_verifier'); return response
}
