'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const NAV = [
  {
    href: '/user',
    label: 'Inicio',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    )
  },
  {
    href: '/partidos',
    label: 'Partidos',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4.07 11H6.1a14.3 14.3 0 0 1 1.06-4.26A8.01 8.01 0 0 0 4.07 11zm7.93 7.93c-.34-.05-1.54-1.97-2.02-4.93H14c-.48 2.96-1.66 4.88-2 4.93zm-2.13-6.93C9.93 9.67 10.86 8 12 8s2.07 1.67 2.13 4H9.87zm6.97 2a14.3 14.3 0 0 1-1.06 4.26A8.01 8.01 0 0 0 19.93 13h-3.09zm.19-2h-3.04c-.11-1.7-.55-3.2-1.21-4.35A8.03 8.03 0 0 1 17.03 11zm-8.88-4.35C7.49 7.8 7.05 9.3 6.94 11H3.9a8.03 8.03 0 0 1 4.25-4.35z" />
      </svg>
    )
  },
  {
    href: '/predicciones',
    label: 'Predicciones',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    )
  },
  {
    href: '/rankings',
    label: 'Rankings',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M7 20h2V8H7v12zm4 0h2V4h-2v16zm4 0h2v-8h-2v8z" />
      </svg>
    )
  }
]

export default function AppSidebar () {
  const router = useRouter()
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => {
    document.cookie = 'userId=; path=/; max-age=0; SameSite=Lax'
    document.cookie = 'username=; path=/; max-age=0; SameSite=Lax'
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    router.replace('/')
  }

  const navigate = (href: string) => {
    router.push(href)
    setDrawerOpen(false)
  }

  return (
    <>
      {/* ── Mobile: top bar ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
        style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col gap-1.5 p-2 rounded-xl transition-all hover:opacity-80"
          aria-label="Abrir menú"
        >
          <span className="block w-5 h-0.5 rounded-full bg-white" />
          <span className="block w-5 h-0.5 rounded-full bg-white" />
          <span className="block w-3.5 h-0.5 rounded-full bg-white" />
        </button>

        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/user')}>
          <span className="text-xl">⚽</span>
          <div className="leading-none">
            <p className="text-xs font-black text-white tracking-tight">Quiniela</p>
            <p className="text-[9px] font-bold tracking-widest" style={{ color: '#D4AF37' }}>MUNDIAL 2026</p>
          </div>
        </div>

        <div className="w-9" /> {/* spacer */}
      </header>

      {/* ── Mobile: backdrop ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(6,14,30,0.75)' }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile: drawer ── */}
      <div
        className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col"
        style={{
          background: '#0D1B2A',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)'
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚽</span>
            <div>
              <p className="text-sm font-black text-white tracking-tight">Quiniela</p>
              <p className="text-[10px] font-bold tracking-widest" style={{ color: '#D4AF37' }}>MUNDIAL 2026</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all"
                style={{
                  background: active ? 'linear-gradient(135deg, rgba(0,104,71,0.3), rgba(0,40,104,0.3))' : 'transparent',
                  color: active ? 'white' : '#6B7280',
                  border: active ? '1px solid rgba(74,222,128,0.2)' : '1px solid transparent'
                }}
              >
                <span style={{ color: active ? '#4ADE80' : '#4B5563' }}>{item.icon}</span>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80' }} />}
              </button>
            )
          })}
        </nav>

        {/* Drawer footer: logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Desktop: compact sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-20 py-6 items-center justify-between sticky top-0 h-screen shrink-0"
        style={{ background: '#0D1B2A', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex flex-col items-center gap-1 cursor-pointer"
          onClick={() => router.push('/user')}
        >
          <span className="text-3xl">⚽</span>
          <span className="text-[10px] font-bold tracking-widest" style={{ color: '#D4AF37' }}>2026</span>
        </div>

        <nav className="flex flex-col gap-5">
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                title={item.label}
                className="flex flex-col items-center gap-1 transition-all hover:opacity-90"
                style={{ color: active ? '#4ADE80' : '#4B5563' }}
              >
                {item.icon}
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: '#EF4444' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          <span className="text-[9px] font-medium">Salir</span>
        </button>
      </aside>
    </>
  )
}
