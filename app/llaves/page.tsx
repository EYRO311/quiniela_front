import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LlavesDashboard from '@/app/components/organisms/llavesDashboard'

export default async function LlavesPage () {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/')

  return <LlavesDashboard />
}
