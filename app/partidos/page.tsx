import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PartidosDashboard from '@/app/components/organisms/partidosDashboard'

export default async function PartidosPage () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  return <PartidosDashboard />
}
