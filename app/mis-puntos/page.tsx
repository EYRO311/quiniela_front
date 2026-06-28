import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MisPuntosDashboard from '@/app/components/organisms/misPuntosDashboard'

export default async function MisPuntosPage () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  return <MisPuntosDashboard idUsuario={userId} />
}
