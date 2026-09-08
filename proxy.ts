import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const publicPath = request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up') || request.nextUrl.pathname.startsWith('/api/auth') || request.nextUrl.pathname.startsWith('/_next')
  if (publicPath) return NextResponse.next()
  const hasSession = request.cookies.has('better-auth.session_token') || request.cookies.has('__Secure-better-auth.session_token')
  if (!hasSession) return NextResponse.redirect(new URL('/sign-in', request.url))
  return NextResponse.next()
}

export const config = { matcher: ['/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'] }
