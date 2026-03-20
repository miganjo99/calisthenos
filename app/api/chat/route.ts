// @ts-nocheck
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log("📨 Messages recibidos:", messages[messages.length - 1].content);
    console.log("🔑 API Key existe:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    const result = streamText({
      model: google('gemini-2.5-flash'),
      maxSteps: 5,
      // Le explicamos a la IA cómo debe usar las herramientas para reservar
      system: 'Eres el asistente virtual de Calisthenos. Ayudas con clases y reservas. Regla importante: Para hacer una reserva, PRIMERO pide el email al usuario, luego usa la herramienta de buscar usuario para obtener su ID, y finalmente crea la reserva con los IDs correspondientes.',
      messages,
      tools: {
        // 1. LISTAR ENTRENAMIENTOS 
        listar_entrenamientos: tool({
          description: 'Lista rutinas de entrenamiento disponibles en el gimnasio',
          parameters: z.object({}),
          execute: async () => {
            console.log("🛠️ Ejecutando tool listar_entrenamientos...");
            try {
              const t = await prisma.training.findMany();
              console.log("✅ Prisma OK, entrenamientos:", t.length);
              return JSON.parse(JSON.stringify(t));
            } catch (prismaError) {
              console.error("❌ Error Prisma (entrenamientos):", prismaError);
              throw prismaError;
            }
          },
        }),

        // 2. LISTAR CLASES
        listar_clases: tool({
          description: 'Devuelve la lista de clases disponibles (horarios, capacidad y sus IDs)',
          parameters: z.object({}),
          execute: async () => {
            console.log("🛠️ Ejecutando tool listar_clases...");
            try {
              const clases = await prisma.class.findMany();
              console.log("✅ Prisma OK, clases encontradas:", clases.length);
              return JSON.parse(JSON.stringify(clases));
            } catch (prismaError) {
              console.error("❌ Error Prisma (clases):", prismaError);
              throw prismaError;
            }
          },
        }),

        // 3. BUSCAR USUARIO POR EMAIL
        buscar_usuario_por_email: tool({
          description: 'Busca a un usuario registrado usando su correo electrónico para obtener su ID (necesario para reservar)',
          parameters: z.object({
            email: z.string().email().describe('El correo electrónico del usuario'),
          }),
          execute: async ({ email }) => {
            console.log(`🛠️ Ejecutando tool buscar_usuario_por_email con: ${email}`);
            try {
              const user = await prisma.user.findUnique({ where: { email } });
              if (user) {
                console.log("✅ Prisma OK, usuario encontrado:", user.name);
                return JSON.parse(JSON.stringify(user));
              } else {
                console.log("⚠️ Usuario no encontrado para el email:", email);
                return { error: 'No se encontró ningún usuario con ese email.' };
              }
            } catch (prismaError) {
              console.error("❌ Error Prisma (buscar usuario):", prismaError);
              throw prismaError;
            }
          },
        }),

        // 4. CREAR RESERVA
        crear_reserva: tool({
          description: 'Crea una nueva reserva en la base de datos asignando un usuario a una clase y entrenamiento',
          parameters: z.object({
            userId: z.string().describe('El ID del usuario (UUID)'),
            classId: z.string().describe('El ID de la clase (UUID)'),
            trainingId: z.string().describe('El ID del entrenamiento (UUID)')
          }),
          execute: async ({ userId, classId, trainingId }) => {
            console.log(`🛠️ Ejecutando tool crear_reserva... User: ${userId}, Class: ${classId}`);
            try {
              const nuevaReserva = await prisma.reservation.create({
                data: { userId, classId, trainingId },
                include: { // Incluimos info extra para que la IA dé una mejor respuesta
                  user: { select: { name: true } },
                  class: { select: { date: true } },
                  training: { select: { name: true } }
                }
              });
              console.log("✅ Prisma OK, ¡Reserva creada con éxito!");
              return JSON.parse(JSON.stringify({ exito: true, reserva: nuevaReserva }));
            } catch (prismaError: any) {
              console.error("❌ Error Prisma (crear reserva):", prismaError);
              return JSON.parse(JSON.stringify({ exito: false, error: prismaError.message }));
            }
          },
        })
      },
      onError: (error) => {
        console.error("❌ Error dentro del stream:", error);
      },
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}