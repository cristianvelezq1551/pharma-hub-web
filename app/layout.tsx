import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/layout/main-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pharma Hub',
  description: 'Tu farmacia de confianza',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className}>
      <body className="min-h-screen bg-gray-50">
        <MainLayout>{children}</MainLayout>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
