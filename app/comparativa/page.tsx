import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ComparativaDashboard from '@/app/components/organisms/comparativaDashboard'

export default async function ComparativaPage () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  return <ComparativaDashboard idUsuario={userId} />
}
