import React from 'react';
import '@/app/globals.css';
import { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import SessionProviderClient from '@/app/dashboard/SessionProviderClient';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};


export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard | @referenciales.cl',
    default: 'referenciales.cl', 
  },
  description: 'Base de datos colaborativa.',
  metadataBase: new URL('https://next14-postgres.vercel.app/'),
  applicationName: 'referenciales.cl', 
  appleWebApp: {
    capable: true, 
    statusBarStyle: 'default', // Or 'black', 'black-translucent'
    title: 'referenciales.cl', // Title when added to home screen
    // startupImage: [...] // Optional: Add splash screens for different devices
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Author/Creator/Publisher info
  authors: [{ name: 'referenciales.cl', url: 'https://www.referenciales.cl/' }],
  creator: 'referenciales.cl',
  publisher: 'referenciales.cl',
  // SEO Keywords
  keywords: ['Next.js 15', 'referenciales.cl', 'Dashboard', 'nextjs.org/learn', 'Server Actions'], // Updated to Next.js 15 as in V2
  // Icons for different platforms and purposes
  icons: {
    icon: [ // Standard favicons
      // Provide different sizes, starting from largest is often good practice
      { url: '/images/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/images/android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/android/android-launchericon-144-144.png', sizes: '144x144', type: 'image/png' },
      { url: '/images/android/android-launchericon-96-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/images/android/android-launchericon-72-72.png', sizes: '72x72', type: 'image/png' },
      { url: '/images/android/android-launchericon-48-48.png', sizes: '48x48', type: 'image/png' },
      // You might also want a simple /favicon.ico in /public for fallback
    ],
    apple: [ // Apple touch icons (for home screen)
      { url: '/images/ios/180.png', sizes: '180x180', type: 'image/png' },
      // Include other relevant sizes as needed based on target devices
      // { url: '/images/ios/167.png', sizes: '167x167', type: 'image/png' },
      // { url: '/images/ios/152.png', sizes: '152x152', type: 'image/png' },
      // ... other sizes from V2 ...
    ],
    shortcut: '/favicon.ico', // Optional: Link to standard favicon.ico
    other: [ // Other specific icons like Safari pinned tab
      {
        rel: 'mask-icon',
        url: '/images/safari-pinned-tab.svg', // Ensure this SVG exists
        color: '#000000', // Color for the pinned tab
      },
    ],
  },
  // Link to the Web App Manifest
  manifest: '/manifest.json', // Ensure public/manifest.json exists and is configured
  // Open Graph metadata (for social sharing on platforms like Facebook, LinkedIn)
  openGraph: {
    title: 'referenciales.cl Dashboard',
    description: 'Base de datos colaborativa.',
    url: 'https://next14-postgres.vercel.app/', // Canonical URL
    siteName: 'referenciales.cl',
    locale: 'es_CL', // Specify language/region
    type: 'website',
    images: [ // Recommended OG image size: 1200x630
      {
        url: '/images/og-image.png', // Ensure public/images/og-image.png exists
        width: 1200,
        height: 630,
        alt: 'referenciales.cl Dashboard',
      },
    ],
  },
  // Twitter card metadata (for sharing on Twitter)
  twitter: {
    card: 'summary_large_image', // Use 'summary_large_image' if you have a compelling image
    site: '@referenciales.cl', // Your site's Twitter handle
    description: 'Base de datos colaborativa.',
    title: 'referenciales.cl Dashboard',
    creator: '@referenciales.cl', // Your personal/creator Twitter handle
    images: ['/images/twitter-image.png'], // Ensure public/images/twitter-image.png exists (Recommended size varies, e.g., 1200x675 or 1:1 ratio)
  },
  // Robots directives for web crawlers
  robots: {
    index: true, // Allow indexing
    follow: true, // Allow following links
    googleBot: { // Specific directives for Google
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Site verification tokens
  verification: {
    google: 'your-google-site-verification', // Replace with your actual Google verification code
    // Add other verification codes if needed (e.g., Yandex, Bing)
    // yandex: '...',
  },
  // Canonical URL and alternates
  alternates: {
    canonical: 'https://next14-postgres.vercel.app/', // The preferred URL for this page
    // Add hreflang alternates if you have multiple language versions
    // languages: {
    //   'en-US': 'https://next14-postgres.vercel.app/en-US',
    // },
  },
};

// The RootLayout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Set language, apply font class if using next/font
    <html lang="es" /* className={inter.className} */ >
      {/* NO MANUAL <head> TAG NEEDED HERE! 
        Next.js automatically generates the <head> based on the exported 
        `metadata` and `viewport` objects above. 
        Manual tags here can cause conflicts or duplication.
        Preconnect/DNS-prefetch links can sometimes go here if necessary, 
        but font links should be handled via next/font.
      */}
      <body className="antialiased"> {/* Apply base styling */}
        <SessionProviderClient> {/* Session provider */}
          {children} {/* Page content */}
          <Toaster /* Toast notifications configuration */
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
          <Analytics /> {/* Vercel Analytics */}
          <SpeedInsights /> {/* Vercel Speed Insights */}
        </SessionProviderClient>
      </body>
    </html>
  );
}
