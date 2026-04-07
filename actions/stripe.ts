'use server'

import Stripe from 'stripe'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', 
})

export async function createCheckoutSession() {
  const session = await auth()
  if (!session?.user?.email) return { error: "No estás autenticado" }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return { error: "Usuario no encontrado" }

  let checkoutUrl = "" 

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      customer_email: user.email,
      client_reference_id: user.id, 
    })

    if (checkoutSession.url) {
      checkoutUrl = checkoutSession.url 
    }
  } catch (error) {
    console.error("Error creando sesión de Stripe:", error)
    return { error: "No se pudo iniciar la pasarela de pago" }
  }

  if (checkoutUrl) {
    redirect(checkoutUrl)
  }
}