'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { pusherServer } from "@/lib/pusher"
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy')

export async function reserveClass(classId: string, trainingId: string) {
  const session = await auth()
  if (!session?.user?.email) return { error: "No estás autenticado" }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return { error: "Usuario no encontrado" }

  const gymClass = await prisma.class.findUnique({
    where: { id: classId },
    include: { reservations: true }
  })

  if (!gymClass) return { error: "La clase no existe" }
  
  if (gymClass.reservations.length >= gymClass.capacity) {
    return { error: "La clase está llena" }
  }

  const alreadyReserved = gymClass.reservations.some(res => res.userId === user.id)
  if (alreadyReserved) {
    return { error: "Ya tienes una reserva para esta hora" }
  }

  await prisma.reservation.create({
    data: {
      userId: user.id,
      classId: gymClass.id,
      trainingId: trainingId
    }
  })

  const training = await prisma.training.findUnique({ where: { id: trainingId } })
  const firstName = user.name.split(' ')[0] 

  try {
    await pusherServer.trigger('gym-activity', 'new-reservation', {
      message: `🔥 ¡${firstName} acaba de coger plaza para hacer ${training?.name}!`,
    })
  } catch (error) {
    console.error("Error enviando notificación de Pusher:", error)
  }

  try {
    const fechaBonita = gymClass.date.toLocaleDateString('es-ES', { 
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
    })

    await resend.emails.send({
      from: 'Calisthenos <onboarding@resend.dev>', 
      to: user.email, 
      subject: '¡Plaza reservada con éxito! 💪',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #000;">¡Hola, ${firstName}!</h2>
          <p style="color: #555; font-size: 16px;">Tu plaza en Calisthenos ha sido confirmada.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Rutina: <span style="font-weight: normal;">${training?.name}</span></p>
            <p style="margin: 5px 0 0 0; font-weight: bold;">Cuándo: <span style="font-weight: normal;">${fechaBonita}</span></p>
          </div>
          <p style="color: #555; font-size: 16px;">¡Prepara el agua y la toalla, nos vemos entrenando!</p>
        </div>
      `
    })
  } catch (error) {
    console.error("Error enviando el email de confirmación:", error)
  }

  revalidatePath('/clases')
  revalidatePath('/dashboard')
  
  return { success: true }
}

export async function cancelReservation(reservationId: string) {
  const session = await auth()
  if (!session?.user?.email) return { error: "No estás autenticado" }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return { error: "Usuario no encontrado" }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId }
  })

  if (!reservation || reservation.userId !== user.id) {
    return { error: "Reserva no encontrada o no autorizada" }
  }

  await prisma.reservation.delete({
    where: { id: reservationId }
  })

  revalidatePath('/dashboard')
  revalidatePath('/clases')
  
  return { success: true }
}