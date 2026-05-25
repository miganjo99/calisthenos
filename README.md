# Calisthenos 🤸‍♂️💪

**Calisthenos** es una plataforma premium de gestión y reservas en tiempo real diseñada específicamente para centros de calistenia y gimnasios "Open Gym". La aplicación combina un sistema robusto de reservas de plazas limitadas, control de asistencia, pasarela de pago para membresías y seguridad avanzada contra accesos no autorizados.

Toda la interfaz visual está construida bajo una estricta **filosofía de diseño inspirada en Nike** (especificada en [DESIGN.md](file:///c:/Users/Miguel/Desktop/apps/calisthenos/DESIGN.md)), caracterizada por un alto contraste tipográfico, el uso de geometrías puras tipo píldora, total ausencia de elevaciones o sombras artificiales, y una paleta cromática minimalista centrada en el blanco, negro e imágenes fotográficas de gran impacto.

---

## 🚀 Características Principales

### 1. Sistema de Reservas "Open Gym"
* **Aforo Limitado:** Control estricto de capacidad máxima (15 atletas por franja horaria).
* **Elección de Enfoque:** El atleta selecciona qué rutina va a entrenar (`Empuje`, `Tirón`, `Full body`, etc.) al reservar su plaza, fomentando que los compañeros se unan a las mismas sesiones.
* **Prevención de Duplicados:** Restringe reservas múltiples para un mismo tramo horario.

### 2. Autenticación y Seguridad Avanzada (NextAuth v5 + Bloqueo)
* **Políticas de Contraseña:** Mínimo 6 caracteres y al menos una letra mayúscula.
* **Bloqueo por Intentos:** Al acumular **3 intentos fallidos** de contraseña, la cuenta se bloquea automáticamente por seguridad (`failedAttempts` en base de datos).
* **Código de Recuperación:** Ante el bloqueo, el sistema genera un código de 6 dígitos aleatorio, bloquea el login y envía un correo mediante **Resend** al usuario para que restablezca su contraseña en `/login`.

### 3. Notificaciones en Tiempo Real (Pusher)
* Integración con **Pusher** para retransmitir eventos en tiempo real.
* Cuando un atleta reserva plaza, se envía una notificación instantánea que aparece en la interfaz de otros usuarios activos (ej. *“🔥 ¡Miguel acaba de coger plaza para hacer Solo Tirón!”*).

### 4. Pagos y Suscripción Mensual (Stripe)
* Pasarela de pago integrada a través de **Stripe Checkout**.
* Flujo de suscripción recurrente. Al completarse el pago, un **webhook** recibe la confirmación (`checkout.session.completed`) y activa la cuenta del usuario en el sistema (`isActive: true`).

### 5. Generador Automático de Clases (Cron Job)
* Endpoint protegido `/api/cron` para automatizar la creación de horarios de la próxima semana.
* Genera los siguientes bloques de lunes a sábado de forma automatizada:
  * **Lunes a Viernes:** 9:00, 16:00, 18:00, 19:00 y 20:00.
  * **Sábados:** 10:00.

### 6. Muro de la Fama (Leaderboard de Atletas)
* Muestra el ranking de atletas ordenados por cantidad de días entrenados (`daysTrained`).
* Incentiva la constancia en la comunidad mediante gamificación visual.

### 7. Panel de Administración
* Visualización rápida de estadísticas del gimnasio (usuarios registrados, clases programadas).
* **Gestión de Clientes:** Altas y bajas de membresías de forma manual. Dar de baja a un usuario cancela automáticamente todas sus reservas futuras.
* **Gestión de Rutinas y Clases:** Creación, edición y borrado de horarios y enfoques de entrenamiento disponibles.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) con React 19
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) (alojado en Neon)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Autenticación:** [NextAuth.js v5 (Beta)](https://authjs.dev/) + `bcryptjs`
* **Emails:** [Resend](https://resend.dev/)
* **Tiempo Real:** [Pusher Channels](https://pusher.com/)
* **Pasarela de Pagos:** [Stripe](https://stripe.com/)
* **Lenguaje:** TypeScript

---

## 📋 Variables de Entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

```env
# Conexión Base de Datos (Postgres)
DATABASE_URL="postgresql://usuario:contraseña@host/base_de_datos?sslmode=require"

# Autenticación (NextAuth)
AUTH_SECRET="tu_secreto_generado_de_nextauth"

# Seguridad y Cron
CRON_SECRET="clave_secreta_para_ejecutar_cron"

# IA (Gemini - opcional)
GOOGLE_GENERATIVE_AI_API_KEY="tu_api_key_de_gemini"

# Pusher (Tiempo Real)
PUSHER_APP_ID="tu_pusher_app_id"
NEXT_PUBLIC_PUSHER_KEY="tu_pusher_key"
PUSHER_SECRET="tu_pusher_secret"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"

# Resend (Email Service)
RESEND_API_KEY="tu_resend_api_key"

# Stripe (Pasarela de Pagos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID="price_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## ⚙️ Configuración e Instalación Local

Sigue estos pasos para arrancar el proyecto en tu entorno local:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Sincronizar el esquema de Prisma con PostgreSQL:**
   ```bash
   npx prisma db push
   ```

3. **Ejecutar el Seed para rellenar datos iniciales (Rutinas y Clases de prueba):**
   ```bash
   npx prisma db seed
   ```

4. **Arrancar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. El proyecto estará disponible en [https://calisthenos.vercel.app/](calisthenos.vercel.app/).

---

## 📂 Estructura del Proyecto

* **`actions/`**: Server Actions para el manejo de lógica del servidor (reservas, autenticación y Stripe).
* **`app/`**: Páginas principales y rutas API del App Router de Next.js (Dashboard, Login, Registro, Admin, Ranking, etc.).
* **`components/`**: Componentes visuales reutilizables (Navegación, Widgets de Ranking, Notificaciones en vivo).
* **`lib/`**: Inicializadores de clientes de base de datos (`prisma.ts`) y tiempo real (`pusher.ts`).
* **`prisma/`**: Esquema de la base de datos (`schema.prisma`) y script de semilla (`seed.ts`).
* **`public/`**: Recursos estáticos (Logotipos e imágenes).
