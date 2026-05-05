const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getPronosticos (idUsuario: string, idQuiniela: string) {
  const params = new URLSearchParams({ idUsuario, idQuiniela })
  const res = await fetch(`${API_URL}/pronosticos?${params}`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener pronósticos')
  }
  return res.json()
}

export async function savePronostico (data: {
  idQuiniela: string
  idUsuario: string
  idPartido: string
  golesAPred: number
  golesBPred: number
}) {
  const res = await fetch(`${API_URL}/pronosticos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al guardar pronóstico')
  }
  return res.json()
}
