import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Empezando a sembrar la base de datos... 🌱')

  // 1. Crear los 5 Tipos de Entrenamiento
  const entrenamientos = [
    { name: 'Empuje + pierna', description: 'Fuerza de empuje (pecho, hombro, tríceps) y tren inferior.' },
    { name: 'Tirón + pierna', description: 'Fuerza de tracción (espalda, bíceps) y tren inferior.' },
    { name: 'Full body', description: 'Entrenamiento global de todo el cuerpo.' },
    { name: 'Solo empuje', description: 'Enfoque exclusivo en torso frontal y empuje.' },
    { name: 'Solo tirón', description: 'Enfoque exclusivo en espalda y bíceps.' },
  ]

  const creados = []
  for (const ent of entrenamientos) {
    const registro = await prisma.training.create({
      data: ent
    })
    creados.push(registro)
  }
  console.log(`✅ ${creados.length} tipos de entrenamiento creados.`)

  // 2. Crear Clases de prueba
  // Calculamos fechas para "mañana" y "pasado mañana"
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  manana.setHours(18, 0, 0, 0) // Mañana a las 18:00

  const pasado = new Date()
  pasado.setDate(pasado.getDate() + 2)
  pasado.setHours(19, 30, 0, 0) // Pasado a las 19:30

  await prisma.class.create({
    data: {
      date: manana,
      capacity: 15,
    }
  })

  await prisma.class.create({
    data: {
      date: pasado,
      capacity: 15,
    }
  })

  console.log('✅ 2 clases de prueba creadas.')
  console.log('¡Siembra completada con éxito! 🌳')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })