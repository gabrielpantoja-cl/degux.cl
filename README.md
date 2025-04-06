# Base de Datos de Referenciales para Tasación 📊

[![Project Status: Active Development](https://img.shields.io/badge/status-active%20development-brightgreen)](https://github.com/TheCuriousSloth/referenciales.cl) 
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Sistema de gestión para referenciales de tasación inmobiliaria construido con Next.js 15 (App Router), PostgreSQL + PostGIS y autenticación Google OAuth.

## Tabla de Contenidos
- [Descripción](#descripción)
- [Estado del Proyecto](#estado-del-proyecto)
- [Características Clave](#características-clave)
- [Tech Stack](#tech-stack)
- [Prerrequisitos](#prerrequisitos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Uso](#uso)
- [Base de Datos](#base-de-datos)
- [Problemas Conocidos](#problemas-conocidos)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Descripción
Este proyecto busca crear una base de datos colaborativa 🤝 de referenciales inmobiliarios para facilitar el trabajo de tasación en Chile. Permite a usuarios autenticados gestionar información relevante, incluyendo datos espaciales.

## Estado del Proyecto
🚧 **En desarrollo activo** 🚧

### Foco Actual:
- Reforzar el sistema de autenticación con Google 🔒
- Optimizar el formulario de ingreso de referenciales 📝
- Corregir errores conocidos (ver [Problemas Conocidos](#problemas-conocidos))

## Características Clave
-   **Autenticación Segura:** Inicio de sesión exclusivo con Google OAuth 2.0 🔐.
-   **Panel de Administración:** Interfaz protegida para usuarios autenticados 🛡️.
-   **Gestión CRUD:** Crear, leer, actualizar y eliminar referenciales inmobiliarios 📋.
-   **Datos Espaciales:** Uso de PostGIS para almacenar y gestionar coordenadas geográficas 🗺️.
-   **Interfaz Moderna:** Construida con Next.js App Router y Tailwind CSS.

## Tech Stack
-   **Framework:** Next.js 15.2.0 (App Router)
-   **Lenguaje:** TypeScript
-   **Estilos:** Tailwind CSS
-   **Base de Datos:** PostgreSQL con extensión PostGIS
-   **ORM:** Prisma
-   **Autenticación:** NextAuth.js (Google Provider)
-   **UI:** React

## Prerrequisitos
-   Node.js (v18 o superior recomendado)
-   npm o yarn
-   Git
-   Una instancia de PostgreSQL con la extensión PostGIS habilitada.

## Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/TheCuriousSloth/referenciales.cl.git
    cd referenciales.cl
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    # yarn install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y copia el contenido de `.env.example` (si existe) o añade las variables necesarias (ver [Variables de Entorno](#variables-de-entorno)).

4.  **Sincronizar Esquema de Base de Datos:**
    Este comando aplica el esquema de Prisma a tu base de datos. ¡Úsalo con cuidado en producción! (Considera usar `prisma migrate dev` para desarrollo con migraciones).
    ```bash
    npx prisma db push
    ```

5.  **Generar Cliente Prisma:**
    Este comando genera el cliente Prisma basado en tu esquema.
    ```bash
    npx prisma generate
    ```

## Variables de Entorno
Asegúrate de definir las siguientes variables en tu archivo `.env`:

-   `POSTGRES_PRISMA_URL`: Cadena de conexión a tu base de datos PostgreSQL (incluyendo usuario, contraseña, host, puerto, nombre de base de datos y `schema=public`). Ejemplo: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
-   `GOOGLE_CLIENT_ID`: Tu Client ID de Google Cloud Console para OAuth.
-   `GOOGLE_CLIENT_SECRET`: Tu Client Secret de Google Cloud Console para OAuth.
-   `NEXTAUTH_URL`: La URL base de tu aplicación (ej. `http://localhost:3000` para desarrollo).
-   `NEXTAUTH_SECRET`: Una cadena secreta aleatoria para firmar los tokens de sesión (puedes generar una con `openssl rand -base64 32`).

## Uso

-   **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    # o
    # yarn dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

-   **Crear build de producción:**
    ```bash
    npm run build
    # o
    # yarn build
    ```

-   **Ejecutar en modo producción:**
    ```bash
    npm run start
    # o
    # yarn start
    ```

## Base de Datos 🗄️
Usamos PostgreSQL + Prisma ORM con la extensión PostGIS. El esquema actual (`prisma/schema.prisma`) incluye:
-   **User**: Información de usuarios autenticados 👤
-   **Referencial**: Datos de referenciales inmobiliarios, con campos `lat` y `lng` para datos espaciales 🗺️.
-   **Account**: Gestión de cuentas OAuth 🔐 (manejado por NextAuth).
-   **Session**: Gestión de sesiones de usuario (manejado por NextAuth).
-   **VerificationToken**: Tokens para verificación (ej. email, manejado por NextAuth).
-   **Conservador**: Información sobre Conservadores de Bienes Raíces.

## Problemas Conocidos 🐛
-   En vista móvil, `next/image` no optimiza correctamente la imagen de la página de inicio 📱.
-   Al crear un nuevo referencial, aparece un mensaje duplicado de éxito 📨.
-   **Paginación Rota en Producción:** La tabla de Referenciales no se actualiza correctamente al navegar entre páginas en el entorno de producción. Investigando activamente. 🚧

*(Se recomienda usar el issue tracker de GitHub para gestionar estos problemas)*

## Contribuciones 🤝
¡Las contribuciones son bienvenidas! Si encuentras un error o tienes una sugerencia, por favor abre un issue. Si quieres contribuir con código, siéntete libre de hacer un Pull Request.

## Licencia 📄
Este proyecto está licenciado bajo la [Licencia MIT](https://opensource.org/licenses/MIT).
