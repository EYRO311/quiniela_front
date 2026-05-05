import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PrediccionesDashboard from '@/app/components/organisms/prediccionesDashboard'

export default async function PrediccionesPage () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  return <PrediccionesDashboard idUsuario={userId} />
}
