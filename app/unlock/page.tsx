'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'

export default function UnlockPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const response = await fetch('/api/unlock', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) })
    if (response.ok) window.location.href = '/'
    else { setError('That password is not correct.'); setLoading(false) }
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground"><div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-xl"><div className="mb-8 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-primary-foreground shadow-lg"><ShieldCheck className="size-5" /></div><div><p className="text-lg font-semibold">ListShield</p><p className="text-xs text-muted-foreground">Private testing environment</p></div></div><div className="mb-6"><div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-muted"><LockKeyhole className="size-5 text-emerald-500" /></div><h1 className="text-2xl font-semibold tracking-tight">Enter your password</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">This ListShield workspace is private while we test the Etsy connection.</p></div><form onSubmit={unlock} className="space-y-4"><label className="block text-sm font-medium" htmlFor="password">Password<input id="password" type="password" autoFocus value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring" /></label>{error && <p className="text-sm text-red-500" role="alert">{error}</p>}<button disabled={loading || !password} className="premium-button flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Unlocking...' : 'Unlock ListShield'}{!loading && <ArrowRight className="size-4" />}</button></form></div></main>
}
