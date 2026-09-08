import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ETSY_API = 'https://openapi.etsy.com/v3/application'

async function getSessionTokens() {
  const jar = await cookies()
  return {
    access: jar.get('listshield-etsy-access')?.value || process.env.ETSY_ACCESS_TOKEN,
    refresh: jar.get('listshield-etsy-refresh')?.value || process.env.ETSY_REFRESH_TOKEN,
  }
}

type EtsyListing = {
  listing_id: number
  title: string
  price?: { amount: number; divisor: number; currency_code: string }
  state?: string
}

function priceOf(listing: EtsyListing) {
  return listing.price ? listing.price.amount / listing.price.divisor : 0
}

let accessToken = process.env.ETSY_ACCESS_TOKEN

async function refreshAccessToken() {
  const key = process.env.ETSY_API_KEY
  const { refresh: refreshToken } = await getSessionTokens()
  if (!key || !refreshToken) throw new Error('Etsy credentials are not configured.')

  const response = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', client_id: key, refresh_token: refreshToken }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Etsy token refresh returned ${response.status}.`)
  const payload = await response.json() as { access_token?: string }
  if (!payload.access_token) throw new Error('Etsy token refresh returned no access token.')
  accessToken = payload.access_token
  const jar = await cookies()
  jar.set('listshield-etsy-access', accessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
}

async function etsyFetch<T>(path: string, retried = false): Promise<T> {
  const key = process.env.ETSY_API_KEY
  const sessionTokens = await getSessionTokens()
  const token = sessionTokens.access || accessToken
  if (!token || !key) throw new Error('Etsy credentials are not configured.')
  const response = await fetch(`${ETSY_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'x-api-key': key },
    cache: 'no-store',
  })
  if (response.status === 401 && !retried) {
    await refreshAccessToken()
    return etsyFetch<T>(path, true)
  }
  if (!response.ok) throw new Error(`Etsy API returned ${response.status}.`)
  return response.json() as Promise<T>
}

export async function GET() {
  try {
    const user = await etsyFetch<{ user_id: number }>('/users/me')
    const shop = await etsyFetch<{ shop_id: number; shop_name: string }>(`/users/${user.user_id}/shops`)
    const [active, drafts] = await Promise.all([
      etsyFetch<{ results: EtsyListing[] }>(`/shops/${shop.shop_id}/listings/active?limit=100`),
      etsyFetch<{ results: EtsyListing[] }>(`/shops/${shop.shop_id}/listings/drafts?limit=100`),
    ])
    const listings = active.results ?? []
    const flagged = listings.filter((listing) => /disney|nike|pokemon|marvel|harry potter|star wars/i.test(listing.title)).length
    return NextResponse.json({
      name: shop.shop_name,
      published: listings.length,
      drafts: drafts.results?.length ?? 0,
      catalogValue: listings.reduce((total, listing) => total + priceOf(listing), 0),
      flagged,
      listings: listings.slice(0, 12).map((listing) => ({ name: listing.title, status: /disney|nike|pokemon|marvel|harry potter|star wars/i.test(listing.title) ? 'IP warning' : 'Secure', price: priceOf(listing) })),
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load Etsy shop.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } })
  }
}
