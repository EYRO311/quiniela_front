'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getTheme, type Theme } from '@/lib/theme'

/* ── Iconos ── */
const IconHome  = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
const IconBall  = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4.07 11H6.1a14.3 14.3 0 0 1 1.06-4.26A8.01 8.01 0 0 0 4.07 11zm7.93 7.93c-.34-.05-1.54-1.97-2.02-4.93H14c-.48 2.96-1.66 4.88-2 4.93zm-2.13-6.93C9.93 9.67 10.86 8 12 8s2.07 1.67 2.13 4H9.87zm6.97 2a14.3 14.3 0 0 1-1.06 4.26A8.01 8.01 0 0 0 19.93 13h-3.09zm.19-2h-3.04c-.11-1.7-.55-3.2-1.21-4.35A8.03 8.03 0 0 1 17.03 11zm-8.88-4.35C7.49 7.8 7.05 9.3 6.94 11H3.9a8.03 8.03 0 0 1 4.25-4.35z" /></svg>
const IconPred  = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m6 16h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4m-3 0v18m0-18H9m3 0h3M9 21h6" strokeWidth="0"/><path d="M9 3v18M3 9h18M3 15h18" strokeWidth="0"/><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="0" fill="none"/><path d="M11 17l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9z"/></svg>
const IconRank  = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7 20h2V8H7v12zm4 0h2V4h-2v16zm4 0h2v-8h-2v8z" /></svg>
const IconF1    = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 6h10.29l1.08 3.11H5.77L6.85 6zM19 17H5v-6h14v6zm-9.5-1c.83 0 1.5-.67 1.5-1.5S10.33 13 9.5 13 8 13.67 8 14.5 8.67 16 9.5 16zm5 0c.83 0 1.5-.67 1.5-1.5S15.33 13 14.5 13 13 13.67 13 14.5s.67 1.5 1.5 1.5z" /></svg>
const IconProno = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" /></svg>
const IconShield = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" /></svg>
const IconStats  = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" /></svg>
const IconGroup  = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
const IconBracket = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 5h4v4H4zM4 15h4v4H4zM16 9h4v6h-4zM8 7h4M8 17h4M12 7v3a2 2 0 0 0 2 2M12 17v-3a2 2 0 0 1 2-2" /></svg>

/* ── Definición de menús por preferencia ── */
const NAV_FUTBOL = [
  { href: '/user',        label: 'Inicio',       icon: <IconHome />,  badge: null },
  { href: '/partidos',    label: 'Partidos',      icon: <IconBall />,  badge: '⚽' },
  { href: '/llaves',      label: 'Llaves',        icon: <IconBracket />, badge: '⚽' },
  { href: '/predicciones',label: 'Predicciones',  icon: <IconPred />,  badge: '⚽' },
  { href: '/mis-puntos',  label: 'Mis Puntos',    icon: <IconStats />, badge: '⚽' },
  { href: '/comparativa', label: 'Comparativa',   icon: <IconGroup />, badge: '⚽' },
  { href: '/equipos',     label: 'Equipos',       icon: <IconShield />,badge: '⚽' },
  { href: '/rankings',    label: 'Rankings',      icon: <IconRank />,  badge: null }
]

const NAV_F1 = [
  { href: '/user',            label: 'Inicio',        icon: <IconHome />,  badge: null },
  { href: '/f1',              label: 'F1',             icon: <IconF1 />,    badge: '🏎️' },
  { href: '/f1/pronosticos',  label: 'Pronósticos',    icon: <IconProno />, badge: '🏎️' },
  { href: '/rankings',        label: 'Rankings',       icon: <IconRank />,  badge: null }
]

const NAV_AMBOS = [
  { href: '/user',            label: 'Inicio',        icon: <IconHome />,  badge: null },
  { href: '/partidos',        label: 'Partidos',       icon: <IconBall />,  badge: '⚽' },
  { href: '/llaves',          label: 'Llaves',         icon: <IconBracket />, badge: '⚽' },
  { href: '/predicciones',    label: 'Predicciones',   icon: <IconPred />,  badge: '⚽' },
  { href: '/mis-puntos',      label: 'Mis Puntos',     icon: <IconStats />, badge: '⚽' },
  { href: '/comparativa',     label: 'Comparativa',    icon: <IconGroup />, badge: '⚽' },
  { href: '/equipos',         label: 'Equipos',        icon: <IconShield />,badge: '⚽' },
  { href: '/rankings',        label: 'Rankings',       icon: <IconRank />,  badge: null },
  { href: '/f1',              label: 'F1',             icon: <IconF1 />,    badge: '🏎️' },
  { href: '/f1/pronosticos',  label: 'Pronóst. F1',   icon: <IconProno />, badge: '🏎️' }
]

const NAV_SYNC = { href: '/f1/sync', label: 'Sync F1', icon: <IconRank />, badge: '🏎️' }
const NAV_RESULTADOS = { href: '/admin/resultados', label: 'Resultados', icon: <IconRank />, badge: '⚙️' }

function getNav (pref: string) {
  if (pref === 'futbol') return NAV_FUTBOL
  if (pref === 'f1')     return NAV_F1
  return NAV_AMBOS
}

/* ── Separadores visuales ── */
const SECTION_COLOR: Record<string, string> = {
  '⚽': 'rgba(74,222,128,0.15)',
  '🏎️': 'rgba(232,0,45,0.15)'
}

/* ── Componente ── */
export default function AppSidebar () {
  const router   = useRouter()
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pref, setPref] = useState('ambos')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEyro, setIsEyro] = useState(false)
  const [theme, setTheme] = useState<Theme>(getTheme('ambos'))

  useEffect(() => {
    const p = localStorage.getItem('futbol_f1') ?? 'ambos'
    setPref(p)
    setTheme(getTheme(p))
    setIsAdmin(localStorage.getItem('tipo_user') === 'admin')
    setIsEyro(localStorage.getItem('username') === 'EYRO')
    const handler = () => {
      const np = localStorage.getItem('futbol_f1') ?? 'ambos'
      setPref(np)
      setTheme(getTheme(np))
      setIsAdmin(localStorage.getItem('tipo_user') === 'admin')
      setIsEyro(localStorage.getItem('username') === 'EYRO')
    }
    window.addEventListener('futbol_f1_changed', handler)
    return () => window.removeEventListener('futbol_f1_changed', handler)
  }, [])

  const baseNav = getNav(pref)
  const navConSync = isAdmin && pref !== 'futbol' ? [...baseNav, NAV_SYNC] : baseNav
  const nav = isEyro ? [...navConSync, NAV_RESULTADOS] : navConSync

  const handleLogout = () => {
    document.cookie = 'userId=; path=/; max-age=0; SameSite=Lax'
    document.cookie = 'username=; path=/; max-age=0; SameSite=Lax'
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('futbol_f1')
    router.replace('/')
  }

  const navigate = (href: string) => { router.push(href); setDrawerOpen(false) }

  const NavItem = ({ item, compact }: { item: typeof nav[0]; compact: boolean }) => {
    const active = pathname === item.href || (item.href !== '/user' && pathname.startsWith(item.href))

    if (compact) {
      return (
        <button
          onClick={() => router.push(item.href)}
          title={item.label}
          className="relative flex flex-col items-center gap-1 transition-all hover:opacity-90"
          style={{ color: active ? theme.activeIconColor : '#4B5563' }}
        >
          {item.badge && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: theme.activeIconColor }} />
          )}
          {item.icon}
          <span className="text-[9px] font-medium">{item.label}</span>
        </button>
      )
    }

    return (
      <button
        onClick={() => navigate(item.href)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all"
        style={{
          background: active ? theme.activeGradient : 'transparent',
          color: active ? 'white' : '#6B7280',
          border: active ? `1px solid ${theme.activeBorder}` : '1px solid transparent'
        }}
      >
        <span style={{ color: active ? theme.activeIconColor : '#4B5563' }}>
          {item.icon}
        </span>
        {item.label}
        {item.badge && !active && (
          <span className="ml-auto text-xs">{item.badge}</span>
        )}
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: theme.activeIconColor }} />}
      </button>
    )
  }

  const LogoutBtn = ({ compact }: { compact: boolean }) => compact ? (
    <button onClick={handleLogout} title="Cerrar sesión"
      className="flex flex-col items-center gap-1 transition-opacity hover:opacity-70" style={{ color: '#EF4444' }}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
      </svg>
      <span className="text-[9px] font-medium">Salir</span>
    </button>
  ) : (
    <button onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
      style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)' }}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
      </svg>
      Cerrar sesión
    </button>
  )

  return (
    <>
      {/* ── Mobile: top bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
        style={{ background: theme.sidebarBg, borderBottom: `1px solid ${theme.sidebarBorder}` }}>
        <button onClick={() => setDrawerOpen(true)} className="flex flex-col gap-1.5 p-2 rounded-xl" aria-label="Abrir menú">
          <span className="block w-5 h-0.5 rounded-full bg-white" />
          <span className="block w-5 h-0.5 rounded-full bg-white" />
          <span className="block w-3.5 h-0.5 rounded-full bg-white" />
        </button>
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/user')}>
          <span className="text-xl">{pref === 'f1' ? '🏎️' : '⚽'}</span>
          <div className="leading-none">
            <p className="text-xs font-black text-white tracking-tight">Quiniela</p>
            <p className="text-[9px] font-bold tracking-widest" style={{ color: '#D4AF37' }}>
              {pref === 'f1' ? 'F1 2026' : pref === 'futbol' ? 'MUNDIAL 2026' : 'MUNDIAL · F1 2026'}
            </p>
          </div>
        </div>
        <div className="w-9" />
      </header>

      {/* ── Mobile: backdrop ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ background: 'rgba(6,14,30,0.75)' }} onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── Mobile: drawer ── */}
      <div
        className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col"
        style={{
          background: theme.sidebarBg,
          borderRight: `1px solid ${theme.sidebarBorder}`,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)'
        }}
      >
        <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{pref === 'f1' ? '🏎️' : '⚽'}</span>
            <div>
              <p className="text-sm font-black text-white tracking-tight">Quiniela</p>
              <p className="text-[10px] font-bold tracking-widest" style={{ color: '#D4AF37' }}>
                {pref === 'f1' ? 'F1 2026' : pref === 'futbol' ? 'MUNDIAL 2026' : 'MUNDIAL · F1'}
              </p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(item => <NavItem key={item.href} item={item} compact={false} />)}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <LogoutBtn compact={false} />
        </div>
      </div>

      {/* ── Desktop: compact sidebar ── */}
      <aside className="hidden md:flex flex-col w-20 py-6 items-center justify-between sticky top-0 h-screen shrink-0"
        style={{ background: theme.sidebarBg, borderRight: `1px solid ${theme.sidebarBorder}` }}>
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => router.push('/user')}>
          <span className="text-3xl">{pref === 'f1' ? '🏎️' : '⚽'}</span>
          <span className="text-[10px] font-bold tracking-widest" style={{ color: '#D4AF37' }}>2026</span>
        </div>

        <nav className="flex flex-col gap-5">
          {nav.map(item => <NavItem key={item.href} item={item} compact />)}
        </nav>

        <LogoutBtn compact />
      </aside>
    </>
  )
}
