import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server" 
import Stripe from "stripe"
import prisma from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET! 
    )
  } catch (error: any) {
    console.error("❌ Error verificando el webhook:", error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    const userId = session.client_reference_id

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      })
      console.log(`✅ ¡Pago recibido! Usuario ${userId} activado en el gimnasio.`)
    }
  }

  return new NextResponse("Todo OK", { status: 200 })
}