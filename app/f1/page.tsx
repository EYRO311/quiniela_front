import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import F1Dashboard from '@/app/components/organisms/f1Dashboard'

export default async function F1Page () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  return <F1Dashboard />
}
