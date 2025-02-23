/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'referenciales.cl',
      }
    ],
  },
  reactStrictMode: true,
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // Optimizaciones para SSR
  experimental: {
    // Mejora la consistencia de hidratación
    optimizeCss: true,
    // Previene errores de hidratación
    scrollRestoration: true,
  },
  // Configuración para mejor manejo de SSR
  compiler: {
    // Elimina datos innecesarios en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    const baseDomains = [
      "'self'",
      "https://*.vercel.com",
      "https://*.vercel-scripts.com",
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
      "https://*.openstreetmap.org",
      "https://accounts.google.com"
    ];

    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        ...baseDomains
      ],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': [
        "'self'",
        "data:",
        "blob:",
        "https://*.googleusercontent.com",
        "https://authjs.dev",
        "https://*.openstreetmap.org",
        "https://*.tile.openstreetmap.org",
        ...baseDomains
      ],
      'font-src': ["'self'", "data:"],
      'connect-src': [
        "'self'",
        "https://*.tile.openstreetmap.org",
        "https://*.openstreetmap.org",
        ...baseDomains,
        ...(isDev ? ["*"] : [])
      ],
      'frame-src': ["'self'", "https://accounts.google.com"]
    };

    // Convert directives object to string
    const cspString = Object.entries(cspDirectives)
      .map(([key, values]) => `${key} ${Array.from(new Set(values)).join(' ')}`)
      .join('; ');

    return [{
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: cspString
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        }
      ]
    }];
  }
};

module.exports = nextConfig;