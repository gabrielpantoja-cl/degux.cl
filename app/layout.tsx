import React from 'react';
import '@/app/globals.css';
import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import SessionProviderClient from '@/app/dashboard/SessionProviderClient';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard | @referenciales.cl',
    default: 'referenciales.cl',
  },
  description: 'Base de datos colaborativa.',
  metadataBase: new URL('https://next14-postgres.vercel.app/'),
  authors: [{ name: 'referenciales.cl', url: 'https://www.referenciales.cl/' }],
  keywords: ['Next.js 14', 'referenciales.cl', 'Dashboard', 'nextjs.org/learn', 'Server Actions'],
  openGraph: {
    title: 'referenciales.cl Dashboard',
    description: 'Base de datos colaborativa.',
    url: 'https://next14-postgres.vercel.app/',
    type: 'website',
  },
  twitter: {
    site: '@referenciales.cl',
    description: 'Base de datos colaborativa.',
    title: 'referenciales.cl Dashboard',
    creator: '@referenciales.cl',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Custom fonts deberia moverse a document.tsx (no movido) */}
        {/* Aquí puedes agregar otras etiquetas de enlace o meta si es necesario */}
      </head>
      <body className="antialiased">
        <SessionProviderClient>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                duration: 3000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          <Analytics />
          <SpeedInsights />
        </SessionProviderClient>
      </body>
    </html>
  );
}