const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getEquipos () {
  const res = await fetch(`${API_URL}/equipos`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener equipos')
  }
  return res.json()
}

export async function getJugadoresEquipo (idEquipo: string) {
  const res = await fetch(`${API_URL}/equipos/${idEquipo}/jugadores`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener jugadores')
  }
  return res.json()
}
