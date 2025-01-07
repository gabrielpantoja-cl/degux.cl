# Base de Datos de Referenciales para Tasación
Proyecto desarrollado con Next.js 14 App Router

## Estado del Proyecto
🚧 **En desarrollo activo** 🚧

### Actualmente Trabajando en:
- Robustecimiento del sistema de autenticación con Google
- Optimización del formulario de ingreso de referenciales

## Descripción
Sistema de gestión de referenciales para tasación inmobiliaria con:
- Autenticación mediante Google OAuth 2.0
- Panel de administración protegido
- Gestión de referenciales (crear/editar)
- Base de datos PostgreSQL con Prisma ORM

## Estructura Actual del Proyecto

/ ├── app/ │ ├── (auth)/ │ │ ├── login/ │ │ └── register/ │ ├── dashboard/ │ │ ├── referenciales/ │ │ └── profile/ │ ├── api/ │ ├── lib/ │ └── ui/ ├── prisma/ ├── public/ └── components/

## Instalación y Configuración

1. Clonar el repositorio:
    ```bash
    git clone [url-repositorio]
    ```

2. Instalar dependencias:
    ```bash
    npm install
    ```

3. Configurar variables de entorno:
    ```
    POSTGRES_PRISMA_URL=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=
    ```

4. Inicializar la base de datos:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

## Problemas Conocidos
- En vista mobil next image no optimiza adecuada la imagen del inicio
- Al crea nuevo referencial, sale mensaje exitoso duplicadp
- La redirección post-login requiere optimización.
- El formulario de creación necesita validación mejorada.

## En Desarrollo
- Implementación de manejo de errores robusto.
- Mejora del sistema de validación de formularios.
- Optimización del flujo de autenticación.
- Sistema de caché para mejorar el rendimiento.

## Base de Datos
Utilizamos PostgreSQL + Prisma ORM. El esquema actual incluye:
- **users**: Información de usuarios autenticados.
- **referenciales**: Datos de referenciales inmobiliarios.
- **accounts**: Gestión de cuentas OAuth.

## Contribuciones
Proyecto inspirado en varios repositorios de código abierto. Contribuciones son bienvenidas mediante pull requests.

## Licencia Este proyecto está licenciado bajo la [Licencia MIT](https://opensource.org/licenses/MIT).

## Diagrama del Sistema
![Diagrama del Sistema](public/diagrama_sistema.png)
