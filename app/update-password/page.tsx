'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const inputClass = 'w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

type FlowMode = 'loading' | 'supabase' | 'custom' | 'invalid'

function UpdatePasswordForm () {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mode, setMode] = useState<FlowMode>('loading')
  const [accessToken, setAccessToken] = useState('')
  const [customToken, setCustomToken] = useState('')

  const supabaseRef = useRef<SupabaseClient | null>(null)

  function getSupabase () {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    }
    return supabaseRef.current
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const code = params.get('code')

    if (token) {
      setCustomToken(token)
      setMode('custom')
      return
    }

    const supabase = getSupabase()

    if (code) {
      // Flujo PKCE: intercambiar el código por sesión
      supabase.auth.exchangeCodeForSession(code).then(({ data, error: err }) => {
        if (err || !data.session) {
          setMode('invalid')
          return
        }
        setAccessToken(data.session.access_token)
        setMode('supabase')
        window.history.replaceState({}, '', window.location.pathname)
      })
      return
    }

    // Flujo implícito: tokens en el hash de la URL
    const hash = window.location.hash.slice(1)
    if (hash) {
      const hashParams = new URLSearchParams(hash)
      const at = hashParams.get('access_token')
      const rt = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (at && type === 'recovery') {
        supabase.auth.setSession({ access_token: at, refresh_token: rt ?? '' })
          .then(({ data, error: err }) => {
            if (err || !data.session) {
              setMode('invalid')
              return
            }
            setAccessToken(data.session.access_token)
            setMode('supabase')
            window.history.replaceState({}, '', window.location.pathname)
          })
        return
      }
    }

    setMode('invalid')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) return setError('La contraseña debe tener mínimo 6 caracteres')
    if (password !== confirm) return setError('Las contraseñas no coinciden')

    setLoading(true)
    try {
      if (mode === 'supabase') {
        const supabase = getSupabase()

        // Actualizar contraseña en Supabase Auth
        const { error: updateError } = await supabase.auth.updateUser({ password })
        if (updateError) throw new Error(updateError.message)

        // Sincronizar password_hash en quiniela.usuarios para que el login siga funcionando
        const res = await fetch(`${API_URL}/sync-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al sincronizar contraseña')

        setSuccess('¡Contraseña actualizada! Redirigiendo...')
        setTimeout(() => router.replace('/'), 2000)
      } else if (mode === 'custom') {
        const res = await fetch(`${API_URL}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: customToken, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error inesperado')

        setSuccess('¡Contraseña actualizada! Redirigiendo...')
        setTimeout(() => router.replace('/'), 2000)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = mode === 'loading' || mode === 'invalid'

  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo */}
      <div
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #060E1E 0%, #0D1B2A 45%, #1E3A8A 100%)' }}
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-5" style={{ background: '#D4AF37' }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-5" style={{ background: '#1D4ED8' }} />

        <div className="relative z-10 text-center px-14">
          <div className="text-7xl mb-3 drop-shadow-lg">⚽</div>
          <h1 className="text-5xl font-black text-white mb-1 tracking-tight">Quiniela</h1>
          <p className="text-xs uppercase tracking-[0.3em] mb-10" style={{ color: '#D4AF37' }}>
            FIFA Mundial 2026
          </p>
          <div className="w-12 h-0.5 mx-auto mb-10" style={{ background: '#D4AF37' }} />
          <p className="text-sm leading-relaxed" style={{ color: '#93C5FD' }}>
            Establece una nueva contraseña segura para tu cuenta
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-8 py-12">
        <div className="md:hidden text-center mb-8">
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="text-2xl font-black" style={{ color: '#060E1E' }}>Quiniela</h1>
          <p className="text-xs uppercase tracking-widest" style={{ color: '#D4AF37' }}>FIFA Mundial 2026</p>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Nueva contraseña</h2>
          <p className="text-sm text-gray-400 mb-8">Elige una contraseña segura para tu cuenta</p>

          {mode === 'loading' && (
            <div className="text-gray-500 text-sm text-center py-4">Verificando enlace...</div>
          )}

          {mode === 'invalid' && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              Enlace inválido o expirado.{' '}
              <a href="/" className="underline font-semibold">Solicita uno nuevo</a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Nueva contraseña</label>
              <input
                type="password"
                placeholder="mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                disabled={isDisabled}
              />
            </div>

            <div>
              <label className={labelClass}>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="repite la contraseña"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={6}
                className={inputClass}
                disabled={isDisabled}
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
              disabled={loading || isDisabled}
              className="w-full py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider"
              style={{
                background: loading || isDisabled ? '#d1d5db' : 'linear-gradient(135deg, #1D4ED8, #1E3A8A)',
                cursor: loading || isDisabled ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <a href="/" className="font-semibold hover:underline" style={{ color: '#1D4ED8' }}>
              Volver al inicio de sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function UpdatePasswordPage () {
  return (
    <Suspense>
      <UpdatePasswordForm />
    </Suspense>
  )
}
