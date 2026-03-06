import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('No autorizado', { status: 401 });
  }

  try {
    const today = new Date()
    const nextMonday = new Date(today)
    nextMonday.setDate(today.getDate() + ((7 - today.getDay() + 1) % 7 || 7))
    nextMonday.setHours(0, 0, 0, 0)

    const schedule = [
      { days: [1, 2, 3, 4, 5], hours: [9, 16, 18, 19, 20] }, // Lunes a Viernes
      { days: [6], hours: [10] } // Sábados
    ]

    const clasesACrear = []

    for (let i = 0; i < 6; i++) {
      const currentDay = new Date(nextMonday)
      currentDay.setDate(nextMonday.getDate() + i)
      const dayOfWeek = currentDay.getDay() 

      const daySchedule = schedule.find(s => s.days.includes(dayOfWeek))
      
      if (daySchedule) {
        for (const hour of daySchedule.hours) {
          const classDate = new Date(currentDay)
          classDate.setHours(hour, 0, 0, 0)

          clasesACrear.push({
            date: classDate,
            capacity: 15
          })
        }
      }
    }

    await prisma.class.createMany({
      data: clasesACrear
    })

    return NextResponse.json({ success: true, message: `Se han creado ${clasesACrear.length} tramos horarios para la próxima semana.` })

  } catch (error) {
    return NextResponse.json({ error: "Hubo un error al generar las clases" }, { status: 500 })
  }
}