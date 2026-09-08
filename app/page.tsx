'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle, ArrowRight, BarChart3, Check, ChevronDown, ChevronRight, CircleHelp,
  ClipboardCheck, Clock3, Crown, FileCheck2, Gauge, LayoutDashboard, ListChecks,
  LockKeyhole, Menu, MonitorCheck, MoreHorizontal, Plus, ScanSearch, ShieldCheck,
  Sparkles, Store, Sun, Moon, Tag, TrendingUp, X, Zap, Monitor,
} from 'lucide-react'

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Device', icon: Monitor },
] as const

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, view: 'overview' },
  { label: 'Listing Audit', icon: ScanSearch, view: 'audit' },
  { label: 'Monitoring', icon: MonitorCheck, view: 'monitoring' },
]

const mockShop = {
  name: 'Northstar Goods',
  published: 10,
  drafts: 3,
  catalogValue: 1284.5,
  flagged: 2,
  listings: [
    { name: 'Personalized Birth Flower Mug', status: 'Secure', price: 28 },
    { name: 'Custom Camp Counselor Tee', status: 'IP warning', price: 34 },
    { name: 'Retro Game Room Sign', status: 'Secure', price: 42 },
    { name: 'Personalized Onesie for Newborn', status: 'IP warning', price: 24 },
  ],
}

const listings = [
  { name: 'Personalized Birth Flower Mug', channel: 'Etsy', scanned: 'Today, 9:42 AM', status: 'Secure' },
  { name: 'Custom Camp Counselor Tee', channel: 'Amazon', scanned: 'Yesterday, 4:18 PM', status: 'Needs review' },
  { name: 'Retro Game Room Sign', channel: 'Etsy', scanned: 'Aug 28, 11:06 AM', status: 'Secure' },
]

export default function Page() {
  const [view, setView] = useState('audit')
  const [title, setTitle] = useState('Personalized Onesie for Newborn')
  const [description, setDescription] = useState('A cozy, personalized Disney-inspired onesie for your little one. Made from soft cotton and perfect for baby showers.')
  const [tags, setTags] = useState('newborn, onesie, baby gift, disney, personalized')
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(true)
  const [fixed, setFixed] = useState(false)
  const [open, setOpen] = useState<string | null>('critical')
  const [modal, setModal] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [shopData, setShopData] = useState<typeof mockShop | null>(null)
  const [shopSyncing, setShopSyncing] = useState(false)
  const [shopError, setShopError] = useState('')

  useEffect(() => {
    fetch('/api/etsy/shop', { cache: 'no-store' }).then(async (response) => {
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load Etsy shop.')
      setShopData(payload)
    }).catch((error) => setShopError(error.message))
  }, [])

  const shopConnected = Boolean(shopData)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('view') === 'shop') setView('shop')
    if (params.get('etsy') === 'error') setShopError(params.get('reason') || 'Etsy connection failed.')
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (nextTheme: typeof theme) => {
      const isDark = nextTheme === 'dark' || (nextTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      root.classList.toggle('dark', isDark)
      root.style.colorScheme = isDark ? 'dark' : 'light'
    }
    applyTheme(theme)
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      media.addEventListener('change', handleChange)
      return () => media.removeEventListener('change', handleChange)
    }
  }, [theme])

  function changeTheme(nextTheme: typeof theme) {
    setTheme(nextTheme)
  }

  function connectShop() {
    window.location.href = '/api/etsy/oauth/start'
  }

  function syncShop() {
    setShopSyncing(true)
    setShopError('')
    fetch('/api/etsy/shop', { cache: 'no-store' }).then(async (response) => {
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to sync Etsy shop.')
      setShopData(payload)
    }).catch((error) => setShopError(error.message)).finally(() => setShopSyncing(false))
  }

  function scan() {
    setScanning(true); setScanned(false); setFixed(false)
    window.setTimeout(() => { setScanning(false); setScanned(true) }, 2000)
  }
  function fixListing() {
    setTitle(title.replace(/onesie/gi, 'baby bodysuit'))
    setDescription(description.replace(/Disney-inspired/gi, 'storybook-inspired'))
    setTags(tags.replace(/onesie/gi, 'baby bodysuit').replace(/disney,?\s*/gi, ''))
    setFixed(true)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-[236px] shrink-0 flex-col border-r border-border glass-sidebar lg:flex">
          <div className="flex h-[72px] items-center gap-3 border-b border-border px-5">
            <div className="flex size-8 items-center justify-center rounded-lg premium-button bg-emerald-600 text-primary-foreground"><ShieldCheck className="size-[18px]" /></div>
            <span className="text-[17px] font-semibold tracking-tight">ListShield</span>
          </div>
          <div className="flex flex-1 flex-col px-3 py-5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
            <nav className="space-y-1">
              {navItems.map((item) => { const Icon = item.icon; return <button key={item.view} onClick={() => setView(item.view)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors ${view === item.view ? 'bg-sidebar-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'}`}><Icon className="size-[17px]" />{item.label}{item.view === 'monitoring' && <span className="ml-auto rounded-full premium-button bg-emerald-600/15 px-1.5 py-0.5 text-[10px] text-emerald-400">PRO</span>}</button> })}
            </nav>
            <button onClick={() => setView('shop')} className={`mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors ${view === 'shop' ? 'bg-sidebar-accent font-medium text-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'}`}><Store className="size-[17px]" />{shopData ? shopData.name : 'Connect Etsy Store'}{shopConnected && <span className="ml-auto size-1.5 rounded-full bg-emerald-500" />}</button>
            <div className="mt-8 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Manage</div>
            <nav className="space-y-1">
              <button onClick={() => setModal(true)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"><Crown className="size-[17px] text-emerald-400" />Upgrade plan</button>
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"><CircleHelp className="size-[17px]" />Help center</button>
            </nav>
            <div className="mt-auto rounded-lg border border-border glass-panel p-3">
              <div className="mb-2 flex items-center justify-between"><span className="text-xs font-medium">Free plan</span><span className="text-[10px] text-muted-foreground">3 / 5 scans</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-3/5 rounded-full premium-button bg-emerald-600" /></div>
              <button onClick={() => setModal(true)} className="mt-3 flex items-center gap-1 text-[11px] font-medium text-emerald-400">Unlock unlimited scans <ArrowRight className="size-3" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-5 py-4"><div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">AM</div><div className="min-w-0"><p className="truncate text-xs font-medium">Alex Morgan</p><p className="truncate text-[11px] text-muted-foreground">alex@northstar.co</p></div><MoreHorizontal className="ml-auto size-4 text-muted-foreground" /></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-border px-5 sm:px-8"><div className="flex items-center gap-3"><button className="lg:hidden"><Menu className="size-5" /></button><div><p className="text-xs text-muted-foreground">Northstar Studio / Workspace</p><h1 className="text-sm font-semibold tracking-tight">{view === 'monitoring' ? 'Monitoring' : view === 'overview' ? 'Overview' : view === 'shop' ? (shopData ? shopData.name : 'Connect Etsy Store') : 'Listing audit'}</h1></div></div><div className="flex items-center gap-3"><span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="size-1.5 rounded-full bg-emerald-500" />All systems operational</span><div className="hidden items-center gap-1 rounded-md border border-border glass-panel p-1 sm:flex" aria-label="Theme preference">{themeOptions.map((option) => { const Icon = option.icon; return <button key={option.value} onClick={() => changeTheme(option.value)} aria-label={`${option.label} theme`} aria-pressed={theme === option.value} className={`flex size-7 items-center justify-center rounded transition-colors ${theme === option.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><Icon className="size-3.5" /></button> })}</div><button onClick={() => setModal(true)} className="flex items-center gap-2 rounded-md border border-border glass-panel px-3 py-2 text-xs font-medium hover:bg-muted"><Plus className="size-3.5" /> New scan</button></div></header>
          <div className="mx-auto max-w-[1320px] p-5 sm:p-8">
            {view === 'monitoring' ? <MonitoringView onUpgrade={() => setModal(true)} /> : view === 'overview' ? <OverviewView onAudit={() => setView('audit')} /> : view === 'shop' ? <ShopView connected={shopConnected} shop={shopData} syncing={shopSyncing} error={shopError} onConnect={connectShop} onSync={syncShop} /> : <AuditView {...{title, setTitle, description, setDescription, tags, setTags, scanning, scanned, scan, fixed, fixListing, open, setOpen}} />}
            <footer className="mt-10 border-t border-border pt-4 text-center text-[11px] text-muted-foreground"><a href="#privacy" className="hover:text-foreground">Privacy Policy</a></footer>
          </div>
        </section>
      </div>
      {modal && <UpgradeModal close={() => setModal(false)} />}
    </main>
  )
}

function ShopView({ connected, shop, syncing, error, onConnect, onSync }: any) { const mockShop = shop ?? { name: '', published: 0, drafts: 0, catalogValue: 0, flagged: 0, listings: [] }; const risk = connected ? Math.round((mockShop.flagged / mockShop.published) * 100) : 0; return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-400"><Store className="size-3"/>Connected shop</div><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{connected ? mockShop.name : 'Connect your Etsy store.'}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{connected ? 'Your published and draft listings are ready for ListShield analysis.' : 'Bring your Etsy catalog into ListShield and review every listing in one place.'}</p></div>{connected && <button onClick={onSync} className="flex items-center gap-2 rounded-md border border-border glass-panel px-3.5 py-2.5 text-xs font-medium hover:bg-muted"><Zap className="size-3.5 text-emerald-400"/>Sync listings</button>}</div>{!connected ? <div className="glass-panel max-w-2xl rounded-xl border border-border p-7"><div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><Store className="size-6"/></div><h3 className="mt-5 text-lg font-semibold">Connect Etsy Store</h3><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Connect your store to fetch published and draft listings. ListShield will analyze listing titles, descriptions, and tags for potential intellectual property risks.</p><button onClick={onConnect} disabled={syncing} className="premium-button mt-6 flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold text-primary-foreground"><LockKeyhole className="size-3.5"/>{syncing ? 'Connecting securely...' : 'Connect Etsy Store'}<ArrowRight className="size-3.5"/></button><p className="mt-4 text-[11px] text-muted-foreground">You’ll authorize Etsy in a new secure step. Your credentials stay protected.</p></div> : <><div className="grid gap-4 sm:grid-cols-3"><Stat label="Published listings" value={String(mockShop.published)} change="Analyzed by ListShield" icon={<ListChecks/>}/><Stat label="Catalog value" value={`$${mockShop.catalogValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} change="Published inventory" icon={<TrendingUp/>}/><Stat label="Draft listings" value={String(mockShop.drafts)} change="Ready to review" icon={<FileCheck2/>}/></div><div className="grid gap-6 xl:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]"><div className="glass-panel rounded-xl border border-border p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Shop suspension risk</h3><p className="mt-1 text-[11px] text-muted-foreground">Based on flagged listings</p></div><ShieldCheck className="size-4 text-emerald-400"/></div><div className="mt-7 flex flex-col items-center">{risk === 0 ? <div className="flex size-32 items-center justify-center rounded-full border-8 border-emerald-400/30 bg-emerald-400/10"><Check className="size-12 text-emerald-400"/></div> : <div className={`relative flex size-32 items-center justify-center rounded-full ${risk > 50 ? 'bg-red-500/15' : 'bg-amber-500/15'}`} style={{ background: `conic-gradient(${risk > 50 ? '#ef4444' : '#f59e0b'} ${risk}%, hsl(var(--muted)) ${risk}% 100%)` }}><div className="flex size-24 flex-col items-center justify-center rounded-full bg-card"><span className="text-3xl font-semibold">{risk}%</span><span className="text-[10px] text-muted-foreground">shop risk</span></div></div>}<p className={`mt-4 text-sm font-semibold ${risk === 0 ? 'text-emerald-400' : risk > 50 ? 'text-red-400' : 'text-amber-400'}`}>{risk === 0 ? 'Your store is safe' : risk > 50 ? 'High risk of suspension' : 'Walking on the edge'}</p><p className="mt-1 text-center text-xs text-muted-foreground">{mockShop.flagged} of {mockShop.published} published listings flagged</p></div></div><div className="glass-panel overflow-hidden rounded-xl border border-border"><div className="border-b border-border px-5 py-4"><h3 className="text-sm font-semibold">Listing health</h3><p className="mt-1 text-[11px] text-muted-foreground">Published listings analyzed for IP risk</p></div><div className="divide-y divide-border">{mockShop.listings.map((listing) => <div key={listing.name} className="flex items-center gap-3 px-5 py-4"><div className={`flex size-8 items-center justify-center rounded-md ${listing.status === 'Secure' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}><ShieldCheck className="size-4"/></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{listing.name}</p><p className="mt-1 text-[11px] text-muted-foreground">${listing.price.toFixed(2)} · {listing.status === 'Secure' ? 'No warning detected' : 'Review recommended'}</p></div><span className={`text-[10px] font-medium ${listing.status === 'Secure' ? 'text-emerald-400' : 'text-amber-400'}`}>{listing.status}</span></div>)}</div></div></div></>}</div> }

function AuditView({ title, setTitle, description, setDescription, tags, setTags, scanning, scanned, scan, fixed, fixListing, open, setOpen }: any) {
  return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-400"><Sparkles className="size-3" />AI-powered compliance engine</div><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Audit your next listing.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Catch trademark conflicts and marketplace policy risks before they put your shop at risk.</p></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="size-4" />Last scan 2 minutes ago</div></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.07fr)_minmax(390px,.93fr)]"><div className="rounded-xl border border-border glass-panel shadow-sm"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2"><div className="flex size-7 items-center justify-center rounded-md bg-muted"><ClipboardCheck className="size-4 text-emerald-400" /></div><div><h3 className="text-sm font-semibold">Listing details</h3><p className="text-[11px] text-muted-foreground">Paste your listing copy to begin</p></div></div><span className="text-[11px] text-muted-foreground">All fields required</span></div><div className="space-y-5 p-5"><Field label="Listing title" value={title} onChange={setTitle} /><Field label="Product description" value={description} onChange={setDescription} area /><Field label="Product tags" value={tags} onChange={setTags} /><div className="flex items-center justify-between border-t border-border pt-5"><p className="max-w-[270px] text-[11px] leading-5 text-muted-foreground">Your content is encrypted and never stored or used to train our models.</p><button onClick={scan} disabled={scanning} className="flex items-center gap-2 rounded-md premium-button bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:premium-button bg-emerald-600/90 hover:shadow-[0_0_24px_oklch(0.75_0.18_160_/_22%)] disabled:cursor-wait disabled:opacity-75">{scanning ? <><span className="size-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />Scanning databases...</> : <><ScanSearch className="size-4" />Scan listing for risks</>}</button></div></div></div><Results scanned={scanned} scanning={scanning} fixed={fixed} fixListing={fixListing} open={open} setOpen={setOpen} /></div>
  </div>
}
function Field({ label, value, onChange, area }: any) { return <label className="block"><span className="mb-2 block text-xs font-medium text-foreground">{label}</span>{area ? <textarea value={value} onChange={e => onChange(e.target.value)} className="min-h-[132px] w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" /> : <input value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />}</label> }
function Results({ scanned, scanning, fixed, fixListing, open, setOpen }: any) { return <div className={`scan-surface glass-panel rounded-xl border border-border shadow-sm ${scanning ? 'is-scanning' : ''}`}><div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2"><div className="flex size-7 items-center justify-center rounded-md bg-muted"><Gauge className="size-4 text-emerald-400" /></div><div><h3 className="text-sm font-semibold">Risk assessment</h3><p className="text-[11px] text-muted-foreground">{scanning ? 'Cross-referencing policy databases' : scanned ? 'Report generated just now' : 'Run a scan to see your report'}</p></div></div>{scanned && <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-500"><span className="size-1.5 rounded-full bg-amber-500" />Action needed</span>}</div>{scanning ? <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-6"><div className="relative flex size-20 items-center justify-center rounded-full border border-emerald-500/30"><div className="absolute inset-2 animate-ping rounded-full premium-button bg-emerald-600/10" /><ScanSearch className="relative size-7 animate-pulse text-emerald-400" /></div><div className="text-center"><p className="text-sm font-medium">Analyzing your listing</p><p className="mt-1 text-xs text-muted-foreground">Checking 12,400+ trademark records...</p></div><div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-muted"><div className="h-full w-2/3 animate-pulse rounded-full premium-button bg-emerald-600" /></div></div> : scanned ? <div className="p-5"><div className="mb-5 flex items-center gap-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"><div className="relative flex size-[76px] shrink-0 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#f59e0b 0 68%, hsl(var(--muted)) 68% 100%)' }}><div className="flex size-[62px] items-center justify-center rounded-full glass-panel"><span className="text-xl font-semibold">68</span></div></div><div><p className="text-xs font-medium text-amber-500">Moderate shop risk</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">We found 2 issues that may impact your listing visibility or account standing.</p></div></div><div className="space-y-2"><RiskRow id="critical" open={open} setOpen={setOpen} icon={<AlertTriangle className="size-4 text-red-400" />} title="Critical trademark violations" count="2 issues" tone="red"><p className="mb-3 text-[11px] leading-5 text-muted-foreground">These terms are registered trademarks and may not be used without authorization.</p><div className="space-y-2"><div className="flex items-center justify-between rounded-md border border-red-500/15 bg-red-500/5 px-3 py-2.5"><div><span className="font-mono text-[11px] text-red-400">“onesie”</span><p className="mt-1 text-[10px] text-muted-foreground">Trademarked by Gerber Products Co.</p></div><Tag className="size-3.5 text-red-400" /></div><div className="flex items-center justify-between rounded-md border border-red-500/15 bg-red-500/5 px-3 py-2.5"><div><span className="font-mono text-[11px] text-red-400">“disney”</span><p className="mt-1 text-[10px] text-muted-foreground">Trademarked by The Walt Disney Company</p></div><Tag className="size-3.5 text-red-400" /></div></div><button onClick={fixListing} className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 hover:underline"><Zap className="size-3.5" />{fixed ? 'Issues fixed in listing' : 'Apply one-click fixes'}<ArrowRight className="size-3" /></button></RiskRow><RiskRow id="policy" open={open} setOpen={setOpen} icon={<AlertTriangle className="size-4 text-amber-400" />} title="Marketplace policy risks" count="1 issue" tone="amber"><p className="text-[11px] leading-5 text-muted-foreground">The phrase <span className="font-mono text-amber-400">“mass-produced”</span> may trigger an Etsy handmade policy review. Consider clarifying your production process.</p></RiskRow><RiskRow id="seo" open={open} setOpen={setOpen} icon={<Check className="size-4 text-emerald-400" />} title="SEO & copy optimization" count="3 passed" tone="green"><p className="text-[11px] leading-5 text-muted-foreground">Your title length, tag count, and description readability are all optimized.</p></RiskRow></div></div> : <div className="flex min-h-[420px] flex-col items-center justify-center p-6 text-center"><div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted"><FileCheck2 className="size-5 text-muted-foreground" /></div><p className="text-sm font-medium">Your report will appear here</p><p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">Paste your listing details and run a scan to check for risks.</p></div>}</div> }
function RiskRow({ id, open, setOpen, icon, title, count, tone, children }: any) { const colors: any = { red: 'border-red-500/20', amber: 'border-amber-500/20', green: 'border-emerald-500/20' }; return <div className={`overflow-hidden rounded-lg border ${colors[tone]}`}><button onClick={() => setOpen(open === id ? null : id)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-muted/30"><span>{icon}</span><span className="flex-1 text-xs font-medium">{title}</span><span className="mr-1 text-[10px] text-muted-foreground">{count}</span>{open === id ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}</button>{open === id && <div className="border-t border-inherit px-3.5 py-3">{children}</div>}</div> }
function MonitoringView({ onUpgrade }: any) { return <div className="space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-400"><MonitorCheck className="size-3" />Insurance layer</div><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Stay ahead of risk.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Automated monitoring watches your active listings for policy changes and new trademark claims.</p></div><button onClick={onUpgrade} className="flex items-center gap-2 self-start rounded-md premium-button bg-emerald-600 px-3.5 py-2.5 text-xs font-semibold text-primary-foreground sm:self-auto"><Crown className="size-3.5" />Unlock automated monitoring</button></div><div className="grid gap-4 sm:grid-cols-3"><Stat label="Active listings" value="24" change="Across 2 channels" icon={<ListChecks />} /><Stat label="Secure listings" value="22" change="91.6% of catalog" icon={<ShieldCheck />} /><Stat label="Needs attention" value="2" change="Review recommended" icon={<AlertTriangle />} /></div><div className="overflow-hidden rounded-xl border border-border glass-panel"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h3 className="text-sm font-semibold">Active listings monitored</h3><p className="mt-1 text-[11px] text-muted-foreground">Last updated today at 9:42 AM</p></div><button className="rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted">Export report</button></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead className="border-b border-border bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Product name</th><th className="px-5 py-3 font-medium">Channel</th><th className="px-5 py-3 font-medium">Last scanned</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-border">{listings.map((item) => <tr key={item.name} className="text-xs hover:bg-muted/20"><td className="px-5 py-4 font-medium">{item.name}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-muted-foreground"><Store className="size-3.5" />{item.channel}</span></td><td className="px-5 py-4 text-muted-foreground">{item.scanned}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium ${item.status === 'Secure' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}><span className="size-1.5 rounded-full bg-current" />{item.status}</span></td><td className="px-5 py-4 text-right"><MoreHorizontal className="ml-auto size-4 text-muted-foreground" /></td></tr>)}</tbody></table></div></div></div> }
function Stat({ label, value, change, icon }: any) { return <div className="rounded-xl border border-border glass-panel p-4"><div className="mb-4 flex items-center justify-between"><span className="text-xs text-muted-foreground">{label}</span><span className="text-emerald-400">{icon}</span></div><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{change}</p></div> }
function OverviewView({ onAudit }: any) { return <div className="space-y-7"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-400"><BarChart3 className="size-3" />Workspace overview</div><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Good morning, Alex.</h2><p className="mt-2 text-sm text-muted-foreground">Your catalog is looking healthy. Here is your compliance snapshot.</p></div><div className="grid gap-4 sm:grid-cols-3"><Stat label="Shop risk score" value="12%" change="↓ 8% from last month" icon={<Gauge />} /><Stat label="Listings scanned" value="148" change="12 scans this week" icon={<ScanSearch />} /><Stat label="Issues resolved" value="36" change="100% resolution rate" icon={<Check />} /></div><div className="rounded-xl border border-border glass-panel p-6"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Run a pre-publish audit</h3><p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">Protect your shop before your next product goes live. Scan your listing copy against our compliance database.</p></div><button onClick={onAudit} className="flex items-center gap-2 rounded-md premium-button bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-primary-foreground">Start a scan <ArrowRight className="size-3.5" /></button></div></div></div> }
function UpgradeModal({ close }: any) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"><div className="relative w-full max-w-md rounded-2xl border border-border glass-panel p-6 shadow-2xl"><button onClick={close} className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="size-4" /></button><div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-400"><Crown className="size-5" /></div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">ListShield Pro</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Your shop deserves a safety net.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Automate your compliance checks and get notified before policy changes put your listings at risk.</p><div className="my-6 rounded-xl border border-emerald-500/30 bg-emerald-600/5 p-5"><div className="flex items-end justify-between"><div><p className="text-sm font-semibold">Pro plan</p><p className="mt-1 text-xs text-muted-foreground">For growing shops</p></div><p className="text-2xl font-semibold">$19<span className="text-xs font-normal text-muted-foreground"> / month</span></p></div><ul className="mt-5 space-y-3 text-xs text-muted-foreground"><li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" />Unlimited listing scans</li><li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" />Automated daily monitoring</li><li className="flex items-center gap-2"><Check className="size-3.5 text-emerald-400" />Priority policy alerts</li></ul><button className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-emerald-600/90">Start 14-day free trial <ArrowRight className="size-3.5" /></button></div><p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><LockKeyhole className="size-3" /> No credit card required</p></div></div> }
