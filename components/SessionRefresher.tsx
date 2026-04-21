'use client'

import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SessionRefresher() {
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