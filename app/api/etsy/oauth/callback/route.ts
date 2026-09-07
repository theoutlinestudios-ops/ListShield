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
  if (providerError) return NextResponse.redirect(new URL(`/etsy/oauth-result?error=${encodeURIComponent(providerError)}`, url.origin))
  if (!code || !returnedState || !expectedState || returnedState !== expectedState || !verifier) return NextResponse.redirect(new URL('/etsy/oauth-result?error=invalid_request', url.origin))

  const apiKey = process.env.ETSY_API_KEY
  const sharedSecret = process.env.ETSY_SHARED_SECRET
  if (!apiKey || !sharedSecret) return NextResponse.redirect(new URL('/etsy/oauth-result?error=missing_server_config', url.origin))
  const tokenResponse = await fetch('https://api.etsy.com/v3/public/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: apiKey, redirect_uri: `${url.origin}/api/etsy/oauth/callback`, code, code_verifier: verifier }).toString(), cache: 'no-store' })
  if (!tokenResponse.ok) return NextResponse.redirect(new URL('/etsy/oauth-result?error=token_exchange_failed', url.origin))
  const token = await tokenResponse.json() as { access_token: string; refresh_token: string; expires_in: number; token_type: string }
  const result = new NextResponse(null, { status: 302, headers: { Location: `/etsy/oauth-result?access_token=${encodeURIComponent(token.access_token)}&refresh_token=${encodeURIComponent(token.refresh_token)}&expires_in=${token.expires_in}&token_type=${encodeURIComponent(token.token_type)}`, 'Cache-Control': 'no-store' } })
  clearCookies(result)
  return result
}
