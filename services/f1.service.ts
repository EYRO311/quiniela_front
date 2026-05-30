const API_URL = process.env.NEXT_PUBLIC_API_URL

async function get (path: string) {
  const res = await fetch(`${API_URL}/f1/${path}`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || `Error al obtener ${path}`)
  }
  return res.json()
}

// ── Datos desde DB ──────────────────────────────────
export const getF1Pilotos         = () => get('pilotos')
export const getF1Escuderias      = () => get('escuderias')
export const getF1Carreras        = () => get('carreras')
export const getF1Campeonato      = () => get('campeonato')

// ── Datos en tiempo real desde Jolpica API ──────────
export const getF1StandingsPilotos      = () => get('standings/pilotos')
export const getF1StandingsConstructores = () => get('standings/constructores')
export const getF1CalendarioAPI         = () => get('calendario')
export const getF1UltimoResultado       = () => get('ultimo-resultado')
