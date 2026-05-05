'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const inputClass = 'w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

export default function AuthPage () {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  const switchMode = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'))
    setError('')
    setSuccess('')
  }

  const handleAction = async (formData: FormData) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const identifier = formData.get('identifier') as string
        const password = formData.get('password') as string

        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error inesperado')

        if (data.user?.id_random) {
          const maxAge = 7 * 24 * 60 * 60
          document.cookie = `userId=${data.user.id_random}; path=/; max-age=${maxAge}; SameSite=Lax`
          document.cookie = `username=${encodeURIComponent(data.user.username ?? '')}; path=/; max-age=${maxAge}; SameSite=Lax`
          localStorage.setItem('userId', data.user.id_random)
          localStorage.setItem('username', data.user.username)
        }
        router.push('/user')
      } else {
        const username = formData.get('username') as string
        const nombre = formData.get('nombre') as string
        const password = formData.get('password') as string

        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, nombre, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error inesperado')

        setSuccess('¡Cuenta creada! Ahora puedes iniciar sesión.')
        setMode('login')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo */}
      <div
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #060E1E 0%, #0D1B2A 45%, #1E3A8A 100%)' }}
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-5" style={{ background: '#D4AF37' }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-5" style={{ background: '#1D4ED8' }} />
        <div className="absolute top-10 right-10 w-20 h-20 rounded-full border opacity-20" style={{ borderColor: '#D4AF37' }} />
        <div className="absolute bottom-16 left-16 w-12 h-12 rounded-full border opacity-15" style={{ borderColor: '#D4AF37' }} />

        <div className="absolute inset-0 opacity-5">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-white" />
        </div>

        <div className="relative z-10 text-center px-14">
          <div className="text-7xl mb-3 drop-shadow-lg">⚽</div>
          <h1 className="text-5xl font-black text-white mb-1 tracking-tight">Quiniela</h1>
          <p className="text-xs uppercase tracking-[0.3em] mb-10" style={{ color: '#D4AF37' }}>
            FIFA Mundial 2026
          </p>

          <div className="w-12 h-0.5 mx-auto mb-10" style={{ background: '#D4AF37' }} />

          <h2 className="text-xl font-semibold text-white mb-3">
            {isLogin ? '¿Nuevo por aquí?' : '¿Ya tienes cuenta?'}
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#93C5FD' }}>
            {isLogin
              ? 'Regístrate y compite con tus amigos en la quiniela del Mundial'
              : 'Inicia sesión y sigue el rastro de tus predicciones'}
          </p>

          <button
            onClick={switchMode}
            className="border text-white px-8 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-200"
            style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#D4AF37'; (e.currentTarget as HTMLButtonElement).style.color = '#060E1E' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#D4AF37' }}
          >
            {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-8 py-12">

        <div className="md:hidden text-center mb-8">
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="text-2xl font-black" style={{ color: '#060E1E' }}>Quiniela</h1>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#D4AF37' }}>FIFA Mundial 2026</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            {isLogin ? 'Ingresa tus credenciales para continuar' : 'Completa los datos para unirte'}
          </p>

          <form action={handleAction} className="space-y-4">

            {isLogin ? (
              /* ── LOGIN ── */
              <div>
                <label className={labelClass}>Usuario o correo</label>
                <input
                  type="text"
                  name="identifier"
                  placeholder="usuario o email@ejemplo.com"
                  required
                  minLength={3}
                  className={inputClass}
                />
              </div>
            ) : (
              /* ── REGISTER ── */
              <>
                <div>
                  <label className={labelClass}>Usuario</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="mínimo 3 caracteres"
                    required
                    minLength={3}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Nombre completo <span className="text-gray-300 normal-case">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="¿Cómo te llamas?"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="mínimo 6 caracteres"
                required
                minLength={6}
                className={inputClass}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-700 text-sm bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider"
              style={{
                background: loading ? '#d1d5db' : 'linear-gradient(135deg, #1D4ED8, #1E3A8A)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          </form>

          <p className="md:hidden text-center text-sm text-gray-500 mt-6">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button onClick={switchMode} className="font-semibold hover:underline" style={{ color: '#1D4ED8' }}>
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>

    </div>
  )
}
