const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getPartidos () {
  const res = await fetch(`${API_URL}/partidos`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener partidos')
  }
  return res.json()
}

export async function getProximoPartido () {
  const res = await fetch(`${API_URL}/partidos/proximo`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener el próximo partido')
  }
  return res.json()
}

export async function syncResultados (idUsuario: string) {
  const res = await fetch(`${API_URL}/partidos/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUsuario })
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al sincronizar resultados')
  }
  return res.json()
}

export async function setResultadoPartido (idPartido: string, data: {
  golesA: number
  golesB: number
  idUsuario: string
  penalA?: number | null
  penalB?: number | null
}) {
  const res = await fetch(`${API_URL}/partidos/${idPartido}/resultado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al guardar el resultado')
  }
  return res.json()
}
