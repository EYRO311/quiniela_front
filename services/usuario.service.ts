const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getUsuarioInfo (idUsuario: string) {
  const res = await fetch(`${API_URL}/usuarios/${idUsuario}`)
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(error || 'Error al obtener información del usuario')
  }
  return res.json()
}

export async function updateUsuario (id: string, data: {
  nombre?: string
  correo?: string
  username?: string
}) {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: 'Error del servidor' }))
    throw new Error(json.error || 'Error al actualizar')
  }
  return res.json()
}
