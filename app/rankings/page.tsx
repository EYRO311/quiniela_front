import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RankingsDashboard from '@/app/components/organisms/rankingsDashboard'

export default async function RankingsPage () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  return <RankingsDashboard idUsuario={userId} />
}
