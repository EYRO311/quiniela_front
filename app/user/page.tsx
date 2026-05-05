import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UserInfoDashboard from '@/app/components/organisms/userInfoDashboard'

export default async function UsuarioPage () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  return <UserInfoDashboard idUsuario={userId} />
}
