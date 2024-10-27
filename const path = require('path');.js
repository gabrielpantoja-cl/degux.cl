const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      punycode: path.resolve(__dirname, 'node_modules/punycode')
    };
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // Permite imágenes de Google
  },
  reactStrictMode: true, // Habilita el modo estricto de React
  swcMinify: true, // Habilita la minificación con SWC
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
};

module.exports = nextConfig;