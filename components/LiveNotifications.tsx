'use client'

import { useEffect, useState } from 'react'
import PusherClient from 'pusher-js'

export default function LiveNotifications() {
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe('gym-activity')

    channel.bind('new-reservation', (data: { message: string }) => {
      setNotification(data.message) 

      setTimeout(() => {
        setNotification(null)
      }, 5000)
    })

    return () => {
      pusher.unsubscribe('gym-activity')
    }
  }, [])

  if (!notification) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-black text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-800 transform transition-all hover:scale-105 cursor-default">
        <span className="text-2xl animate-bounce">⚡</span>
        <p className="font-bold text-sm sm:text-base">{notification}</p>
      </div>
    </div>
  )
}