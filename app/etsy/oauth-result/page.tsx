'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function OAuthResultContent() {
  const params = useSearchParams()
  const error = params.get('error')
  const [copied, setCopied] = useState('')
  const values = [['ETSY_ACCESS_TOKEN', params.get('access_token') ?? ''], ['ETSY_REFRESH_TOKEN', params.get('refresh_token') ?? '']]
  async function copy(name: string, value: string) { await navigator.clipboard.writeText(value); setCopied(name); window.setTimeout(() => setCopied(''), 1600) }
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 text-foreground"><section className="glass-panel w-full max-w-2xl rounded-2xl border border-border p-7 sm:p-9"><div className="mb-6 flex size-11 items-center justify-center rounded-xl bg-emerald-500 text-primary-foreground">E</div><h1 className="text-2xl font-semibold tracking-tight">Etsy OAuth setup</h1>{error ? <><p className="mt-3 text-sm text-red-400">The Etsy authorization could not be completed.</p><p className="mt-2 text-xs text-muted-foreground">Error: {error}</p></> : <><p className="mt-3 text-sm leading-6 text-muted-foreground">Save these values in Vercel project Vars. They are displayed once and are not stored by ListShield.</p><div className="mt-7 space-y-4">{values.map(([name, value]) => <div key={name}><label className="mb-2 block text-xs font-medium">{name}</label><div className="flex gap-2"><input readOnly value={value} className="min-w-0 flex-1 rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs"/><button onClick={() => copy(name, value)} className="rounded-md border border-border px-3 text-xs hover:bg-muted">{copied === name ? 'Copied' : 'Copy'}</button></div></div>)}</div><p className="mt-6 text-xs text-muted-foreground">Access token expires in {params.get('expires_in') ?? 'unknown'} seconds. Keep both values private.</p></>}</section></main>
}

export default function EtsyOAuthResult() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading Etsy OAuth setup...</main>}><OAuthResultContent /></Suspense>
}
