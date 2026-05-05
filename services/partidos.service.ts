const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getPartidos () {
  const res = await fetch(`${API_URL}/partidos`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener partidos')
  }
  return res.json()
}
