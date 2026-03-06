'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// 1. FUNCIÓN PARA RESERVAR (Ahora recibe la clase y el entrenamiento elegido)
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

  // Comprobamos si el usuario ya tiene reserva a esta hora
  const alreadyReserved = gymClass.reservations.some(res => res.userId === user.id)
  if (alreadyReserved) {
    return { error: "Ya tienes una reserva para esta hora" }
  }

  // Guardamos la reserva vinculando el usuario, la hora y la rutina elegida
  await prisma.reservation.create({
    data: {
      userId: user.id,
      classId: gymClass.id,
      trainingId: trainingId
    }
  })

  revalidatePath('/clases')
  revalidatePath('/dashboard')
  
  return { success: true }
}

// 2. FUNCIÓN PARA CANCELAR RESERVA
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