'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { Reservation } from "@prisma/client"

export async function reserveClass(classId: string) {
  //  Comprobamos   el usuario
  const session = await auth()
  if (!session?.user?.email) return { error: "No estás autenticado" }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return { error: "Usuario no encontrado" }

  //  Buscamos la clase y sus reservas actuales
  const gymClass = await prisma.class.findUnique({
    where: { id: classId },
    include: { reservations: true } // Traemos las reservas para contarlas
  })

  if (!gymClass) return { error: "La clase no existe" }
  
  // Comprobamos si hay hueco
  if (gymClass.reservations.length >= gymClass.capacity) {
    return { error: "La clase está llena" }
  }

  // Comprobamos si el usuario ya estaba apuntado a esta clase
  const alreadyReserved = gymClass.reservations.some((res: Reservation) => res.userId === user.id)
  if (alreadyReserved) {
    return { error: "Ya tienes una reserva para esta clase" }
  }

  // reserva en Neon
  await prisma.reservation.create({
    data: {
      userId: user.id,
      classId: gymClass.id
    }
  })

  revalidatePath('/clases')
  revalidatePath('/dashboard')
  
  return { success: true }
}