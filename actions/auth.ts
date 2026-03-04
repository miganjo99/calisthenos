'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Todos los campos son obligatorios' }
  }

  // 1. Comprobar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: 'Este email ya está registrado' }
  }

  // 2. Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Generar un avatar aleatorio basado en el nombre (usamos DiceBear)
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`

  // 4. Guardar en la base de datos (Neon)
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatarUrl,
      }
    })
    return { success: true, user: newUser }
  } catch (error) {
    return { error: 'Error al crear el usuario en la base de datos' }
  }
}