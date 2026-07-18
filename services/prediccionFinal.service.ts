const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getPrediccionFinal (idUsuario: string, idQuiniela: string) {
  const params = new URLSearchParams({ idUsuario, idQuiniela })
  const res = await fetch(`${API_URL}/predicciones-finales?${params}`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener la predicción final')
  }
  return res.json()
}

export async function getPrediccionesFinalesQuiniela (idQuiniela: string) {
  const res = await fetch(`${API_URL}/predicciones-finales/quiniela/${idQuiniela}`)
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al obtener las predicciones finales')
  }
  return res.json()
}

export async function savePrediccionFinal (data: {
  idQuiniela: string
  idUsuario: string
  idCampeon: string
  idSubcampeon: string
}) {
  const res = await fetch(`${API_URL}/predicciones-finales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al guardar la predicción final')
  }
  return res.json()
}
