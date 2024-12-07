# Proyecto personal de base de datos de referenciales para la tasación
Usando Next.js App Router

Este proyecto fue inspirado en codigo abierto, varios repositorios y desarrolladores a los cuales agradezco como:

-   https://github.com/bluuweb/example-next-auth-v5
-   https://github.com/vercel/nextjs-postgres-auth-starter
-   https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template

Crearemos una versión simplificada de un panel de transacciones de suelo que tiene:

- Una página de inicio pública.
- Una página de inicio de sesión.   
- Páginas del panel que están protegidas mediante autenticación con google.
- La capacidad de los usuarios para agregar y editar referenciales. La operacipon de eliminar no la he usado ya que uno de los objetivos del proyecto es nutrir la base de datos. 

- [**Autenticación:**](#agregar-autenticación) cómo agregar autenticación a su aplicación usando NextAuth.js y Middleware.

## Inicio del Proyecto

Para iniciar nuestro proyecto, abriremos una terminal en la carpeta donde queremos guardarlo y a continuación usaremos el siguiente comando:

```bash
npx create-next-app@latest nombre-del-proyecto --use-npm --example "https://github.com/vercel/next-learn/tree/main/dashboard/starter-example"
```
Este comando utiliza create-next-app, una herramienta de interfaz de línea de comandos (CLI) que configura una aplicación Next.js. Note que puede nombrar el proyecto como prefiera en `nombre-del-proyecto` que está a modo de ejemplo y además estamos usando los siguientes indicadores:

- `--use-npm` para indicar el administrador de paquetes queremos utilizar. 
- `--example` para indicar una plantilla con la cual iniciar, necesaria para seguir este curso.

## Estructura de carpetas

Después de la instalación, abra el proyecto en su editor de código.
Notarás que el proyecto tiene la siguiente estructura de carpetas:

![Estructura de carpetas del proyecto](https://nextjs.org/_next/image?url=%2Flearn%2Fdark%2Flearn-folder-structure.png&w=1920&q=75&dpl=dpl_Ejtt9BCyCFNeRJdBoVsM9Es9x8xe)

- **/app:** contiene todas las rutas, componentes y lógica de su aplicación; aquí es desde donde trabajará principalmente.
- **/app/lib:** contiene funciones utilizadas en su aplicación, como funciones de utilidad reutilizables y funciones de recuperación de datos.
- **/app/ui:** contiene todos los componentes de la interfaz de usuario de su aplicación, como tarjetas, tablas y formularios.
- **/public:** contiene todos los activos estáticos de su aplicación, como imágenes.
- **/script/:** contiene un script de inicialización que utilizaremos para completar la base de datos en un capítulo posterior.
- **Archivos de configuración:** también notará archivos de configuración como **next.config.js** en la raíz de su aplicación. La mayoría de estos archivos se crean y preconfiguran cuando inicias un nuevo proyecto usando create-next-app.
- **app/lib/placeholder-data.js:** Para este proyecto, proporcionamos algunos datos de marcador de posición en cada objeto JavaScript en el archivo representa una tabla en su base de datos.
- **/app/lib/definitions.ts**. Aquí, definimos manualmente los tipos que se devolverán desde la base de datos.
> Estamos declarando manualmente los tipos de datos, pero para una mayor seguridad de tipos, recomendamos Prisma, que genera automáticamente tipos basados en el esquema de su base de datos.

## Ejecutando el servidor de desarrollo

Ejecute npm i para instalar los paquetes del proyecto.
Seguido de npm run dev para iniciar el servidor de desarrollo.

```bash
npm i

npm run dev
```

npm run dev inicia su servidor de desarrollo Next.js en el puerto 3000. Comprobemos si está funcionando. Abra http://localhost:3000 en su navegador. Su página de inicio debería verse así:


## Base de datos

Este proyecto utiliza PostgreSQL como su base de datos. La configuración de la base de datos se encuentra en el archivo `prisma/schema.prisma`.

Para configurar la conexión a la base de datos, debes establecer la variable de entorno `POSTGRES_PRISMA_URL` en tu archivo `.env`. Esta variable debe contener la cadena de conexión a tu base de datos PostgreSQL.

## Por ejemplo:

```env
POSTGRES_PRISMA_URL="postgresql://usuario:contraseña@localhost:5432/miBaseDeDatos"

Asegúrate de reemplazar usuario, contraseña y miBaseDeDatos con tus propios valores.

## Estructura de la base de datos:
La base de datos está compuesta por varias tablas que almacenan la información necesaria para la aplicación. Las principales tablas son:

colausuarios: Usuarios autenticados con google, todos los usuarios pueden colaborar.
referenciales: Esta tabla almacena la información de los referenciales.

ORM Prisma
Para interactuar con la base de datos, este proyecto utiliza Prisma como su ORM (Object-Relational Mapping). Prisma facilita la interacción con la base de datos al permitirnos trabajar con objetos y eventos en lugar de tablas y SQL. La configuración de Prisma se encuentra en el archivo prisma/schema.prisma.

Generación del cliente Prisma
Después de definir o actualizar tu esquema en prisma/schema.prisma, debes generar el cliente Prisma para aplicar los cambios. Esto se hace ejecutando el siguiente comando en tu terminal:

```bash
npx prisma generate
```
Este comando genera o actualiza el cliente Prisma basado en tu esquema actual, permitiéndote interactuar con tu base de datos mediante Prisma.

Inicialización de la base de datos
Para inicializar la base de datos, te recomendamos buscar scripts de inicialización específicos en GitHub que se ajusten a tus necesidades. Estos scripts pueden ayudarte a configurar y llenar tu base de datos con datos de prueba o estructuras iniciales.

Para la administración de la base de datos, puedes utilizar herramientas como pgAdmin si estás en Windows, o DBeaver si estás utilizando Linux. Ambas herramientas ofrecen interfaces gráficas intuitivas para la gestión de bases de datos PostgreSQL, facilitando la visualización, edición y gestión de tus datos.   


## Próximos pasos

Autenticación con Google Auth 2.0