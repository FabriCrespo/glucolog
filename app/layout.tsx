import type { Metadata } from 'next';

import './globals.css'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppToaster from '@/components/AppToaster';

export const metadata: Metadata = {
  title: 'Glucolog',
  description: 'App Web para diabéticos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-white antialiased">
        <Navbar />
        <main className="relative flex-1 overflow-hidden">
          {children}
        </main>
        <Footer />
        <AppToaster />
      </body>
    </html>
  )
}

