'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy')

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) return { error: 'Todos los campos son obligatorios' }

  const passwordRegex = /^(?=.*[A-Z]).{6,}$/
  if (!passwordRegex.test(password)) {
    return { error: 'La contraseña debe tener al menos 6 caracteres y una letra mayúscula.' }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) return { error: 'Este email ya está registrado' }

  const hashedPassword = await bcrypt.hash(password, 10)
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatarUrl,
        isActive: false,
      }
    })
    return { success: true, user: newUser }
  } catch (error) {
    return { error: 'Error al crear el usuario en la base de datos' }
  }
}

export async function preCheckLogin(email: string, pass: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: 'Credenciales inválidas' }

  if (user.failedAttempts >= 3) {
    let code = user.recoveryCode
    if (!code) {
      code = Math.floor(100000 + Math.random() * 900000).toString()
      await prisma.user.update({ where: { email }, data: { recoveryCode: code } })
    }
    console.log(`🔑 [RECUPERACIÓN] La cuenta ${email} ya está bloqueada. Código actual: ${code}`);
    return { locked: true, error: 'Tu cuenta está bloqueada. Revisa tu correo para recuperarla.' }
  }

  const match = await bcrypt.compare(pass, user.password)
  if (!match) {
    const updated = await prisma.user.update({
      where: { email },
      data: { failedAttempts: { increment: 1 } }
    })

    if (updated.failedAttempts >= 3) {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      await prisma.user.update({ where: { email }, data: { recoveryCode: code } })

      console.log(`🔑 [RECUPERACIÓN] Código generado para ${email}: ${code}`);

      try {
        await resend.emails.send({
          from: 'Calisthenos <onboarding@resend.dev>',
          to: email,
          subject: '⚠️ Alerta de Seguridad y Recuperación de Contraseña',
          html: `
            <h3>Alerta de Seguridad</h3>
            <p>Hemos detectado 3 intentos fallidos de inicio de sesión en tu cuenta.</p>
            <p>Para recuperar tu acceso, usa este código de seguridad: <strong style="font-size:24px;">${code}</strong></p>
          `
        })
      } catch (emailError) {
        console.error("⚠️ Error enviando el correo de recuperación con Resend:", emailError)
      }

      return { locked: true, error: 'Has fallado 3 veces. Te hemos enviado un código al correo para recuperar tu cuenta.' }
    }

    return { error: `Contraseña incorrecta. Te quedan ${3 - updated.failedAttempts} intentos.` }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  const code = formData.get('code') as string
  const newPassword = formData.get('newPassword') as string

  const passwordRegex = /^(?=.*[A-Z]).{6,}$/
  if (!passwordRegex.test(newPassword)) {
    return { error: 'La nueva contraseña debe tener al menos 6 caracteres y una letra mayúscula.' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.recoveryCode !== code) {
    return { error: 'El código de recuperación es incorrecto.' }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // Guardamos la nueva contraseña y reseteamos contadores
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      failedAttempts: 0,
      recoveryCode: null
    }
  })

  return { success: true }
}