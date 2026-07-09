import type { Metadata } from 'next';

import './globals.css'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppToaster from '@/components/AppToaster';
import { assetPath } from '@/lib/basePath';
import { TEXT_PREFERENCES_BOOT_SCRIPT } from '@/lib/accessibility/textPreferences';

export const metadata: Metadata = {
  title: 'Glucolog',
  description: 'App Web para diabéticos',
  icons: {
    icon: assetPath('/favicon.ico'),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const heroBg = assetPath('/images/backgrounds/HeroBG.png');
  const servicesBg = assetPath('/images/backgrounds/OurBG.png');

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: TEXT_PREFERENCES_BOOT_SCRIPT }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `.hero-photo{background-image:url('${heroBg}')}.services-photo{background-image:url('${servicesBg}')}`,
          }}
        />
      </head>
      <body
        className="flex min-h-screen flex-col bg-white text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100"
        suppressHydrationWarning
      >
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

