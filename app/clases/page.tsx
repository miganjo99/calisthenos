import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClasesUI from "./ClasesUI"

export default async function ClasesPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect("/login")

  // 1. Traemos las clases futuras, pero SOLO incluimos las reservas (el training ya no cuelga de aquí)
  const clases = await prisma.class.findMany({
    where: { date: { gte: new Date() } },
    include: { 
      reservations: true 
    },
    orderBy: { date: 'asc' } 
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ClasesUI clases={clases} userId={user.id} />
    </div>
  )
}