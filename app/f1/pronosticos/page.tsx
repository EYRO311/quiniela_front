import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import F1PronosticosPage from '@/app/components/organisms/F1PronosticosPage'

export default async function F1PronosticosRoute () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) redirect('/')
  return <F1PronosticosPage idUsuario={userId} />
}
