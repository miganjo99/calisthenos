'use client'

import { useSession, SessionProvider } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"

function RefresherLogic() {
  const { update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      update({ isActive: true })
      router.replace('/dashboard')
    }
  }, [searchParams, update, router])

  return null 
}

export default function SessionRefresher() {
  return (
    <SessionProvider>
      <RefresherLogic />
    </SessionProvider>
  )
}