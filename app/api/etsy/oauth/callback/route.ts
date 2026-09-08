import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function clearCookies(response: NextResponse) {
  response.cookies.set('etsy_oauth_state', '', { maxAge: 0, path: '/' })
  response.cookies.set('etsy_oauth_verifier', '', { maxAge: 0, path: '/' })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')
  const providerError = url.searchParams.get('error')
  const jar = await cookies()
  const expectedState = jar.get('etsy_oauth_state')?.value
  const verifier = jar.get('etsy_oauth_verifier')?.value
  if (providerError) return NextResponse.redirect(new URL(`/?etsy=error&reason=${encodeURIComponent(providerError)}`, 'https://v0-list-shield.vercel.app'))
  if (!code || !returnedState || !expectedState || returnedState !== expectedState || !verifier) return NextResponse.redirect(new URL('/?etsy=error&reason=invalid_request', 'https://v0-list-shield.vercel.app'))

  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey || !sharedSecret) return NextResponse.redirect(new URL('/?etsy=error&reason=missing_server_config', 'https://v0-list-shield.vercel.app'))
  const redirectUri = 'https://v0-list-shield.vercel.app/api/etsy/oauth/callback'
  const tokenResponse = await fetch('https://api.etsy.com/v3/public/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: apiKey, redirect_uri: redirectUri, code, code_verifier: verifier }).toString(), cache: 'no-store' })
  if (!tokenResponse.ok) return NextResponse.redirect(new URL('/?etsy=error&reason=token_exchange_failed', 'https://v0-list-shield.vercel.app'))
  const token = await tokenResponse.json() as { access_token?: string; refresh_token?: string }
  if (!token.access_token || !token.refresh_token) return NextResponse.redirect(new URL('/?etsy=error&reason=token_exchange_failed', 'https://v0-list-shield.vercel.app'))
  const result = NextResponse.redirect(new URL('/?etsy=connected&view=shop', 'https://v0-list-shield.vercel.app'))
  result.cookies.set('listshield-etsy-access', token.access_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  result.cookies.set('listshield-etsy-refresh', token.refresh_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90 })
  clearCookies(result)
  return result
}
