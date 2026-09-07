import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/unlock' || pathname.startsWith('/api/unlock') || pathname.startsWith('/_next') || pathname === '/favicon.ico') return NextResponse.next()
  if (request.cookies.get('listshield_access')?.value !== 'unlocked') {
    const url = request.nextUrl.clone()
    url.pathname = '/unlock'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'] }
