// app/layout.tsx
import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | GAP Dashboard | @fitogabo',
    default: 'GAP Dashboard by @fitogabo',
  },
  description: 'The official Next.js Course Dashboard, built with App Router.',
  metadataBase: new URL('https://next14-postgres.vercel.app/'),
  authors: [{ name: 'Gabriel Pantoja', url: 'https://www.linkedin.com/in/gapantoj/' }],
  keywords: ['Next.js 14', 'GAP', 'Dashboard', 'nextjs.org/learn', 'Server Actions'],
  openGraph: {
    title: 'GAP Dashboard',
    description: 'The official Next.js Learn Dashboard built with App Router.',
    url: 'https://next14-postgres.vercel.app/',
    type: 'website',
  },
  twitter: {
    site: '@GAP',
    description: 'Base de datos colaborativa.',
    title: 'GAP Dashboard by @fitogabo',
    creator: '@fitogabo',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
