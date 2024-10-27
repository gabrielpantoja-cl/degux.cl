/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // Permite imágenes de Google
  },
  // Añade cualquier otra configuración necesaria aquí
  reactStrictMode: true, // Habilita el modo estricto de React
  swcMinify: true, // Habilita la minificación con SWC
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

export default nextConfig;