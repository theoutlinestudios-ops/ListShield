import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { etsyConnection } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const [connection] = await db.select().from(etsyConnection).where(eq(etsyConnection.userId, session.user.id)).limit(1); if (!connection) return NextResponse.json({ error: 'Connect your Etsy shop first.' }, { status: 404 })
  const apiKey = process.env.ETSY_API_KEY; const sharedSecret = process.env.ETSY_SHARED_SECRET; if (!apiKey || !sharedSecret) return NextResponse.json({ error: 'Etsy application credentials are not configured.' }, { status: 503 })
  const headersForEtsy = { Authorization: `Bearer ${connection.accessToken}`, 'x-api-key': `${apiKey}:${sharedSecret}` }
  const me = await fetch('https://openapi.etsy.com/v3/application/users/me', { headers: headersForEtsy, cache: 'no-store' }); if (!me.ok) return NextResponse.json({ error: `Etsy returned ${me.status}. Reconnect your shop if the authorization expired.` }, { status: 502 })
  const user = await me.json(); const shops = await fetch(`https://openapi.etsy.com/v3/application/users/${user.user_id}/shops`, { headers: headersForEtsy, cache: 'no-store' }); if (!shops.ok) return NextResponse.json({ error: `Etsy returned ${shops.status} while loading the shop.` }, { status: 502 })
  const shop = (await shops.json()).results?.[0]; if (!shop) return NextResponse.json({ error: 'No Etsy shop was found for this account.' }, { status: 404 })
  const listings = await fetch(`https://openapi.etsy.com/v3/application/shops/${shop.shop_id}/listings/active?limit=100`, { headers: headersForEtsy, cache: 'no-store' }); const data = listings.ok ? await listings.json() : { results: [] }; const results = data.results || []
  return NextResponse.json({ name: shop.shop_name, published: results.length, drafts: 0, catalogValue: results.reduce((sum: number, item: { price?: { amount?: number; divisor?: number } }) => sum + ((item.price?.amount || 0) / (item.price?.divisor || 100)), 0), flagged: 0, listings: results.map((item: { title: string; price?: { amount?: number; divisor?: number } }) => ({ name: item.title, status: 'Pending audit', price: (item.price?.amount || 0) / (item.price?.divisor || 100) })) })
}
