import path from 'path';
import { fileURLToPath } from 'url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'referenciales.cl',
        port: '',
        pathname: '/**',
      }
    ],
  },
  reactStrictMode: true,
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  webpack: (config) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    config.resolve.alias = {
      ...config.resolve.alias,
      punycode: path.resolve(__dirname, 'node_modules/punycode')
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.googleusercontent.com https://gabriel-pantojas-projects.vercel.app https://*.vercel.app",
              "style-src 'self' 'unsafe-inline' https://accounts.google.com https://gabriel-pantojas-projects.vercel.app https://*.vercel.app",
              "img-src 'self' data: blob: https: https://*.googleusercontent.com https://gabriel-pantojas-projects.vercel.app https://*.vercel.app",
              "frame-src 'self' https://accounts.google.com https://gabriel-pantojas-projects.vercel.app https://*.vercel.app",
              "connect-src 'self' https://accounts.google.com https://*.google.com https://gabriel-pantojas-projects.vercel.app https://*.vercel.app",
              "font-src 'self' data: https://fonts.gstatic.com https://gabriel-pantojas-projects.vercel.app https://*.vercel.app",
              "form-action 'self' https://accounts.google.com",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'"
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self "https://referenciales.cl/dashboard/mapa")'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXTAUTH_URL || '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
          }
        ]
      }
    ];
  }
};

export default nextConfig;