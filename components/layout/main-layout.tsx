'use client';

/**
 * MainLayout — envuelve todas las páginas públicas y privadas.
 * Incluye la Navbar y el CartDrawer.
 *
 * Se usa como wrapper en app/layout.tsx porque necesita
 * acceder a los stores de Zustand (que son client-side).
 */
import { Navbar } from './navbar';
import { CartDrawer } from './cart-drawer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </>
  );
}
