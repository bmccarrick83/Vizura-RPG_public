'use client';

import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { RoleProvider } from '@/hooks/use-roles';
import { Inter, MedievalSharp, EB_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontSerif = MedievalSharp({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: '400',
});

const fontGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  weight: ['400', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable, fontSerif.variable, fontGaramond.variable)}>
          <FirebaseClientProvider>
            <RoleProvider>
              {children}
              <Toaster />
            </RoleProvider>
          </FirebaseClientProvider>
      </body>
    </html>
  );
}
