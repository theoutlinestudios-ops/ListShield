import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''
  const expected = process.env.LISTSHIELD_PASSWORD ?? 'spain114'
  const providedHash = createHash('sha256').update(password).digest()
  const expectedHash = createHash('sha256').update(expected).digest()

  if (!timingSafeEqual(providedHash, expectedHash)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('listshield_access', 'unlocked', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('listshield_access')
  return response
}
