const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getF1Pilotos () {
  const res = await fetch(`${API_URL}/f1/pilotos`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener pilotos')
  }
  return res.json()
}

export async function getF1Escuderias () {
  const res = await fetch(`${API_URL}/f1/escuderias`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener escuderías')
  }
  return res.json()
}

export async function getF1Carreras () {
  const res = await fetch(`${API_URL}/f1/carreras`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener carreras')
  }
  return res.json()
}

export async function getF1Campeonato () {
  const res = await fetch(`${API_URL}/f1/campeonato`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener campeonato')
  }
  return res.json()
}
