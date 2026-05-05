const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function crearQuiniela (data: {
  nombre: string
  descripcion?: string
  tipo: 'publica' | 'privada'
  idUsuario: string
}) {
  const res = await fetch(`${API_URL}/quinielas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al crear quiniela')
  }
  return res.json()
}

export async function unirseQuiniela (data: {
  codigoAcceso: string
  idUsuario: string
}) {
  const res = await fetch(`${API_URL}/quinielas/unirse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al unirse a la quiniela')
  }
  return res.json()
}

export async function getParticipantes (idQuiniela: string) {
  const res = await fetch(`${API_URL}/quinielas/${idQuiniela}/participantes`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener participantes')
  }
  return res.json()
}

export async function getQuinielaRanking (idQuiniela: string) {
  const res = await fetch(`${API_URL}/quinielas/${idQuiniela}/ranking`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener ranking')
  }
  return res.json()
}
