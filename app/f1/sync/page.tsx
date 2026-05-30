import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import F1SyncPage from '@/app/components/organisms/F1SyncPage'

export default async function F1SyncRoute () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) redirect('/')
  return <F1SyncPage idUsuario={userId} />
}
