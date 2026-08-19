# 🎓 UniPide — Marketplace de Emprendimientos Uninorte

Plataforma web full-stack llamada **UniPide**, diseñada exclusivamente para conectar a **estudiantes y personal de la Universidad del Norte (Uninorte)** en Barranquilla con los **emprendimientos de estudiantes** dentro del campus.

---

## 🌟 Características Principales

### 1. 🎒 Portal del Cliente (Estudiantes / Personal)
- **Registro & Login Seguro**: Autenticación JWT con soporte de correo institucional `@uninorte.edu.co`.
- **Explorador & Categorías**: Comida Rápida, Postres & Dulces, Bebidas & Café, Accesorios & Merch, Ropa y Servicios.
- **Sección de Ofertas del Día**: Promociones, combos y descuentos especiales en campus.
- **Carrito Persistente**: Carrito inteligente guardado en almacenamiento local con protección ante pedidos de múltiples negocios.
- **Checkout con Cálculo de Entrega en Campus**:
  - Selector de punto de encuentro/bloque en Uninorte (Bloque A, B, F, G, K, Cafetería Central, Biblioteca Parrish, Coliseo, etc.).
  - Algoritmo de **Tiempo Estimado de Entrega** basado en: $\text{Tiempo Base Prep} + \text{Traslado entre Bloques}$.
- **Seguimiento en Vivo de Pedidos**: Estado visual en 4 etapas (*Recibido* → *En preparación* → *En camino* → *Entregado*).
- **Historial y Calificaciones**: Calificación de 1 a 5 estrellas y reseñas para los emprendedores.

### 2. 🍔 Portal del Emprendedor (Dueño del Negocio)
- **Dashboard de Ventas**: KPIs en vivo de pedidos activos, ventas de hoy, ingresos acumulados y calificación promedio.
- **Gestión de Catálogo (CRUD)**: Creación y edición de productos con fotos, precios, stock y switch instantáneo de **"Agotado hoy"**.
- **Módulo de Ofertas**: Configuración de precios con descuento y descripciones promocionales.
- **Gestor de Pedidos en Vivo (Kanban)**: Recepción de pedidos en tiempo real y avance de estados con 1 clic (*Aceptar* → *En preparación* → *En camino* → *Entregado*).
- **Perfil del Emprendimiento**: Configuración de ubicación en campus, tiempo base de preparación y datos de contacto.

### 3. 🛡️ Portal del Administrador
- **Cola de Moderación**: Aprobación o rechazo con 1 clic de nuevos emprendimientos antes de ser públicos.
- **Gestión & Auditoría**: Activar o suspender negocios y supervisar usuarios.
- **Métricas Globales**: Total de pedidos, volumen transaccionado, negocios activos y registros recientes.

### 4. ⚡ Selector de Acceso Rápido Demo (1-Clic)
En la barra de navegación y en la página de inicio de sesión dispones del botón **"Acceso Rápido Demo"** para ingresar al instante sin tener que escribir contraseñas.

---

## 🔑 Cuentas Demo Preconfiguradas

| Rol | Correo | Contraseña | Negocio / Descripción |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@uninorte.edu.co` | `admin123` | Control total, aprobación de solicitudes y métricas |
| **Emprendedor (Comida)** | `burgers@uninorte.edu.co` | `emprendedor123` | *Burger Lab Uninorte* (Aprobado) |
| **Emprendedor (Postres)** | `sweet@uninorte.edu.co` | `emprendedor123` | *Sweet Bites Bakery* (Aprobado) |
| **Emprendedor (Merch)** | `merch@uninorte.edu.co` | `emprendedor123` | *Campus Craft & Stickers* (Aprobado) |
| **Emprendedor (Pendiente)**| `smoothies@uninorte.edu.co` | `emprendedor123` | *Fruity & Fresh* (Para probar flujo de aprobación de Admin) |
| **Cliente (Estudiante)** | `estudiante@uninorte.edu.co` | `estudiante123` | Estudiante comprador con pedidos e historial |

---

## 🛠️ Stack Tecnológico

- **Frontend & Backend**: Next.js 14 (App Router), TypeScript, React 18
- **Estilos**: Tailwind CSS con paleta institucional Uninorte y Lucide Icons
- **Base de Datos & ORM**: Prisma ORM con SQLite (Desarrollo) / PostgreSQL (Producción)
- **Autenticación**: JWT en cookies `HttpOnly`, encriptación de contraseñas con `bcryptjs`
- **Despliegue**: Compatible 100% con Vercel + Neon / Supabase / Railway

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18+ instalado ([Descargar Node.js](https://nodejs.org/))
- Git ([Descargar Git](https://git-scm.com/))

### Pasos

1. **Clonar o abrir el repositorio**:
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd tienda
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Ejecutar migraciones y poblar datos iniciales**:
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

5. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 📦 Cómo Guardar tu Repositorio en GitHub

1. Inicializa el repositorio local (si no está inicializado):
   ```bash
   git init
   git add .
   git commit -m "feat: Marketplace de Emprendimientos Uninorte completo"
   ```

2. Crea un nuevo repositorio en tu cuenta de [GitHub](https://github.com/new) (ej. `marketplace-uninorte`).

3. Conecta el repositorio remoto y sube los cambios:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/marketplace-uninorte.git
   git push -u origin main
   ```

---

## 🌐 Cómo Desplegar en Vercel

### Opción A: Con Base de Datos Gratuita en Neon / Supabase (Recomendado)

1. **Crear una base de datos PostgreSQL gratuita**:
   - Ingresa a [Neon.tech](https://neon.tech) o [Supabase.com](https://supabase.com) y crea un proyecto nuevo en 1 minuto.
   - Copia la URL de conexión (`DATABASE_URL`).

2. **Subir a Vercel**:
   - Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
   - Haz clic en **"Add New..."** → **"Project"** e importa tu repositorio de GitHub.
   - En la sección **Environment Variables**, añade:
     - `DATABASE_URL`: La URL de conexión PostgreSQL de Neon/Supabase.
     - `JWT_SECRET`: Una clave secreta (ej: `uninorte_jwt_secret_super_2026`).
   - Haz clic en **"Deploy"**.

3. **Ejecutar las migraciones en producción**:
   Una vez conectado, ejecuta las migraciones en tu base de datos:
   ```bash
   npx prisma migrate deploy
   ```

---

## 🏛️ Zonas del Campus Uninorte Incluidas en el Cálculo de Entrega

- **Edificios**: Bloque A, Bloque B, Bloque C, Bloque D, Bloque E, Bloque F, Bloque G, Bloque I, Bloque J, Bloque K, Bloque L, Bloque M
- **Espacios Comunes & Servicios**: Bambú 1, Bambú 2, Fuente, Coliseo, Auditorio, Biblioteca, Casa Estudio, Centro Médico, Centro Deportivo, Salón de Proyecciones
