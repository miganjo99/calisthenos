# Documentación Técnica del Proyecto - Calisthenos 🤸‍♂️💪

Esta documentación detalla la arquitectura, el diseño de la base de datos, los flujos clave del negocio, la configuración y el sistema de diseño de la aplicación **Calisthenos**, una plataforma premium de gestión y reservas en tiempo real para centros de calistenia.

---

## 📂 1. Estructura y Arquitectura del Proyecto

Calisthenos está construido sobre el framework **Next.js 16 (App Router)** utilizando **React 19** y **TypeScript**. La arquitectura separa la interfaz de usuario, las APIs de integración y la lógica de negocio mediante Server Actions.

```
calisthenos/
├── actions/             # Lógica del servidor mediante Server Actions (reservas, auth, Stripe)
├── app/                 # Rutas de Next.js (App Router), subcarpetas para cada vista
│   ├── admin/           # Panel de control de administración (clases, rutinas, usuarios)
│   ├── api/             # Endpoints HTTP (Webhooks de Stripe y Cron Jobs de generación)
│   ├── clases/          # Buscador y listado de horarios de clases
│   ├── dashboard/       # Área privada del atleta y estadísticas
│   ├── login/           # Pantalla de inicio de sesión con seguridad de bloqueo
│   └── register/        # Formulario de registro de atletas
├── components/          # Componentes compartidos de React (Navbar, Notificaciones, Widgets)
├── lib/                 # Clientes y configuraciones de base de datos (Prisma) y Pusher
├── prisma/              # Esquema de base de datos y script de semilla (Seed)
├── package.json         # Dependencias y scripts de ejecución
└── DESIGN.md            # Especificación formal del sistema de diseño (Nike Inspired)
```

---

## 🗄️ 2. Modelo y Esquema de Base de Datos (Prisma)

El motor de base de datos es **PostgreSQL**, gestionado mediante el ORM **Prisma**. El esquema se divide en cuatro entidades principales:

```mermaid
erDiagram
    USER ||--o{ RESERVATION : "realiza"
    CLASS ||--o{ RESERVATION : "contiene"
    TRAINING ||--o{ RESERVATION : "se entrena en"
    
    USER {
        string id PK
        string email UK
        string password
        string name
        string avatarUrl
        int daysTrained
        string role
        boolean isActive
        int failedAttempts
        string recoveryCode
        datetime createdAt
    }
    CLASS {
        string id PK
        datetime date
        int capacity
    }
    RESERVATION {
        string id PK
        string userId FK
        string classId FK
        string trainingId FK
        datetime createdAt
    }
    TRAINING {
        string id PK
        string name
        string description
        string[] exercises
    }
```

### Detalle de las Entidades

1. **User (Usuario/Atleta):**
   * `id`: Identificador único (UUID).
   * `email`: Correo electrónico único.
   * `password`: Hash encriptado de la contraseña (`bcryptjs`).
   * `avatarUrl`: Imagen de perfil aleatoria autogenerada con Dicebear.
   * `daysTrained`: Contador incremental de entrenamientos completados con éxito (usado para el Ranking).
   * `role`: Define el rol (`"user"` por defecto, o `"admin"`).
   * `isActive`: Bandera que habilita o deshabilita la capacidad del usuario para reservar clases. Se activa automáticamente al pagar en Stripe.
   * `failedAttempts`: Contador de intentos fallidos de inicio de sesión.
   * `recoveryCode`: Código temporal de 6 dígitos enviado por email para recuperar la contraseña tras bloqueo.

2. **Class (Clase/Tramo Horario):**
   * Representa una hora de entrenamiento específica (ej. *Lunes 18:00*).
   * `capacity`: Capacidad máxima de la sala para esa hora (normalmente 15 plazas).

3. **Reservation (Reserva):**
   * Tabla intermedia que conecta a un **Usuario**, una **Clase** y un **Entrenamiento (Rutina)**.
   * Garantiza la trazabilidad: qué atleta entrena a qué hora y con qué rutina.

4. **Training (Entrenamiento/Rutina):**
   * Catálogo de rutinas disponibles (ej. *Empuje + Pierna*, *Full Body*, *Tirón*).
   * `exercises`: Lista de cadenas de texto (`String[]`) con los ejercicios específicos de la rutina.

---

## 🔄 3. Flujos de Trabajo e Implementación de Negocio

### 🔑 A. Registro y Autenticación de Usuarios
* **Autenticación:** Utiliza **NextAuth.js v5** con la estrategia `CredentialsProvider` y almacenamiento de sesión basado en **JWT** (duración de 7 días).
* **Validación de contraseña:** Al registrarse (`actions/auth.ts -> registerUser`), la contraseña debe cumplir con una expresión regular: tener al menos 6 caracteres y al menos una letra mayúscula.
* **Estado inicial:** Al registrarse, el usuario tiene `isActive: false` (inactivo), limitando sus reservas hasta que adquiera su membresía en Stripe.

### 🛡️ B. Seguridad: Control de Intentos Fallidos y Bloqueo
Para prevenir ataques de fuerza bruta en el inicio de sesión, se implementa una lógica de bloqueo progresivo en `actions/auth.ts -> preCheckLogin`:
1. Cada intento erróneo incrementa `failedAttempts` en `1`.
2. Al llegar a **3 intentos fallidos**, la cuenta se bloquea:
   * Se genera un código numérico aleatorio de 6 dígitos y se guarda en `recoveryCode`.
   * Se envía un correo electrónico al usuario a través de **Resend** alertando sobre los intentos y proporcionando el código de recuperación.
   * Los siguientes intentos de login mostrarán un error indicando que la cuenta está bloqueada.
3. El usuario puede desbloquear la cuenta y resetear su contraseña en el formulario de login ingresando su email, el código de verificación y una nueva contraseña (que también debe cumplir los criterios de seguridad). Una vez restablecido, `failedAttempts` vuelve a `0` y `recoveryCode` pasa a ser `null`.

### 💳 C. Membresías y Suscripción (Stripe)
* **Creación de Checkout:** El usuario pincha en "Comprar membresía", lo que ejecuta `actions/stripe.ts -> createCheckoutSession`. Se crea una sesión de pago en Stripe en modo `subscription` utilizando el ID de precio (`STRIPE_PRICE_ID`) y asociando el `client_reference_id` al ID del usuario en base de datos.
* **Activación por Webhook:** Stripe envía una petición `POST` al endpoint `app/api/webhook/stripe/route.ts` al confirmarse el pago (`checkout.session.completed`). El servidor valida la firma del webhook con `STRIPE_WEBHOOK_SECRET` y actualiza la bandera `isActive: true` del atleta en la base de datos, otorgándole acceso a las reservas de clases.

### 📝 D. Gestión de Reservas y Tiempo Real
* **Reserva de Plaza:** Realizada mediante `actions/reserve.ts -> reserveClass`. El servidor valida que el usuario esté autenticado, que la clase exista y tenga plazas disponibles (`reservations.length < capacity`), y que el atleta no tenga ya una reserva activa para esa misma clase.
* **Notificaciones Push:** Tras confirmar la reserva en base de datos, el servidor envía un evento a **Pusher** en el canal `gym-activity` con el evento `new-reservation`.
* **Notificación en Frontend:** El componente `LiveNotifications.tsx` escucha el canal de Pusher a nivel global y muestra una alerta emergente flotante en el margen inferior derecho de cualquier usuario conectado durante 5 segundos.
* **Email de Confirmación:** Se envía automáticamente un correo formal con los detalles de la hora y la rutina seleccionada usando **Resend**.

### ⏰ E. Generador de Clases Semanales (Cron Job)
* **Acceso Protegido:** El endpoint `app/api/cron/route.ts` genera la programación de la semana entrante. Requiere una cabecera HTTP `Authorization: Bearer <CRON_SECRET>` para evitar ejecuciones externas.
* **Algoritmo de Generación:**
  * Busca el lunes de la próxima semana a las 00:00 h.
  * Para cada día de la semana (Lunes a Sábado), añade las clases vacías a la base de datos con capacidad de 15 personas:
    * **Lunes a Viernes:** 09:00, 16:00, 18:00, 19:00 y 20:00.
    * **Sábados:** 10:00.

### 👥 F. Panel de Administración (`/app/admin`)
* **Restricción de Rol:** Comprueba que la sesión pertenezca a un usuario con `role === "admin"`. De lo contrario, redirige al `/dashboard`.
* **Roster de Usuarios (`/admin/usuarios`):** Lista todos los atletas. Permite darlos de alta o baja manual. Si se da de baja a un atleta (`isActive: false`), el sistema elimina de inmediato todas sus reservas futuras en cascada.
* **Aforos (`/admin/clases`):** Permite actualizar la capacidad individual de cualquier clase futura o eliminar el tramo horario completo.
* **Rutinas (`/admin/entrenamientos`):** Permite añadir nuevos planes de entrenamiento de hasta 10 ejercicios que estarán disponibles inmediatamente en el selector al reservar.

---

## 🎨 4. Sistema de Diseño (Nike Inspired)

El proyecto adopta las directrices estéticas de Nike, aplicando un enfoque fotográfico de gran contraste en el que la interfaz es minimalista y neutra para ceder el protagonismo a los atletas y al movimiento.

### Variables del Sistema de Diseño (en `DESIGN.md`)

* **Colores:**
  * `canvas` / `on-primary`: `#ffffff` (Blanco puro para fondos y textos en elementos oscuros).
  * `ink` / `primary`: `#111111` (Negro profundo para textos de títulos, CTAs principales y selectores activos).
  * `soft-cloud`: `#f5f5f5` (Gris claro para stage de fotografías de perfil, tarjetas secundarias y fondo de inputs).
  * `hairline`: `#cacacb` y `hairline-soft`: `#e5e5e5` (Para bordes finos de 1px e inset lines sticky).
  * `sale`: `#d30005` (Rojo deportivo utilizado para cancelaciones, precios con descuento y alertas críticas).
  * `success`: `#007d48` (Verde deportivo para indicar confirmación de reserva o alta de cliente).
* **Tipografía:**
  * **Display Campaign (96px, line-height 0.9, uppercase):** Letras gigantes integradas en imágenes de héroe, simuladas mediante fuentes pesadas como *Bebas Neue* o *Anton*.
  * **Helvetica Now Display/Text:** Traducido a la fuente del sistema **Inter** o tipografías sans-serif limpias de alto contraste.
* **Geometría y Radios:**
  * Contenedores generales y fotos de producto: `rounded: 0px` (Esquinas completamente rectas).
  * CTAs y botones principales: `rounded-full` (Forma de píldora limpia).
  * Buscadores y campos de texto: `rounded-md` (Bordes ligeramente suavizados).
* **Ausencia de Sombras:** La elevación es plana. No se utilizan sombras difusas para dar profundidad; la estructura y delimitación visual recaen exclusivamente en el contraste de colores o líneas finas de 1px (`border-hairline`).

---

## 🔑 5. Variables de Entorno Requeridas

Asegúrate de que las siguientes variables estén declaradas en tu proveedor de hosting (ej. Vercel) y en tu entorno local `.env`:

| Variable | Descripción | Ejemplo de Valor |
|---|---|---|
| `DATABASE_URL` | URI de conexión a la base de datos PostgreSQL | `postgresql://...` |
| `AUTH_SECRET` | Llave secreta para encriptación de NextAuth JWT | Generable con `openssl rand -base64 32` |
| `CRON_SECRET` | Token de seguridad Bearer para el Cron Job | `mi_secreto_123` |
| `RESEND_API_KEY` | Llave API de la plataforma de emails Resend | `re_...` |
| `PUSHER_APP_ID` | Identificador de aplicación de Pusher | `2131285` |
| `NEXT_PUBLIC_PUSHER_KEY` | Clave pública de Pusher para el cliente | `d826f0d30...` |
| `PUSHER_SECRET` | Clave privada de Pusher para el servidor | `1840093fa...` |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Nodo regional de Pusher | `eu` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de test/producción de Stripe | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Clave secreta del SDK de Stripe | `sk_test_...` |
| `STRIPE_PRICE_ID` | ID del plan de suscripción recurrente de Stripe | `price_...` |
| `NEXT_PUBLIC_APP_URL` | Dominio raíz del sitio (sin barra final) | `http://localhost:3000` o `https://calisthenos.vercel.app` |
| `STRIPE_WEBHOOK_SECRET` | Llave para verificar firmas de eventos de Stripe | `whsec_...` |

---

## 📈 6. Despliegue y Puesta en Producción

### Base de Datos
1. Ejecuta las migraciones en tu base de datos de producción:
   ```bash
   npx prisma db push
   ```
2. Rellena la base de datos de producción con los datos semilla iniciales (enfoques de rutinas y primeras clases):
   ```bash
   npx prisma db seed
   ```

### Webhooks de Stripe
1. Ve al Dashboard de Stripe -> Developers -> Webhooks.
2. Añade un nuevo endpoint apuntando a `https://tu-dominio.com/api/webhook/stripe`.
3. Selecciona el evento `checkout.session.completed`.
4. Copia el secreto de firma generado (`whsec_...`) y colócalo en la variable `STRIPE_WEBHOOK_SECRET` de tu servidor de producción.

### Tarea Automatizada (Cron)
Para generar clases semanalmente de forma automática, configura un servicio de llamadas programadas (como Vercel Cron Jobs o GitHub Actions) que realice una petición HTTP `GET` todos los domingos por la noche a:
```http
GET https://tu-dominio.com/api/cron
Authorization: Bearer <CRON_SECRET>
```
