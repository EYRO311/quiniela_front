import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminResultadosDashboard from '@/app/components/organisms/AdminResultadosDashboard'

export default async function AdminResultadosPage () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const username = cookieStore.get('username')?.value

  if (!userId) redirect('/')
  if (username !== 'EYRO') redirect('/user')

  return <AdminResultadosDashboard idUsuario={userId} />
}
