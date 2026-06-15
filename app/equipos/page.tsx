import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EquiposDashboard from '@/app/components/organisms/EquiposDashboard'

export default async function EquiposPage () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  return <EquiposDashboard />
}
